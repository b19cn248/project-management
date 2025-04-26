// src/components/common/KanbanBoard/KanbanBoard.tsx
import React, { useState, useEffect } from 'react';
import Button from '../Button';

// Types
export interface KanbanTask {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    dueDate?: string;
    assignee?: {
        id: string;
        name: string;
        avatar?: string;
    };
    tags?: string[];
}

export interface KanbanColumn {
    id: string;
    title: string;
    tasks: KanbanTask[];
    color?: string;
}

interface KanbanProps {
    columns: KanbanColumn[];
    onTaskMove?: (taskId: string, sourceColumnId: string, targetColumnId: string) => void;
    onTaskClick?: (task: KanbanTask) => void;
    onAddTask?: (columnId: string) => void;
    className?: string;
    loading?: boolean;
}

const KanbanBoard: React.FC<KanbanProps> = ({
                                                columns,
                                                onTaskMove,
                                                onTaskClick,
                                                onAddTask,
                                                className = '',
                                                loading = false
                                            }) => {
    const [draggedTask, setDraggedTask] = useState<KanbanTask | null>(null);
    const [sourceColumnId, setSourceColumnId] = useState<string | null>(null);
    const [boardColumns, setBoardColumns] = useState<KanbanColumn[]>(columns);

    // Update board columns when props change
    useEffect(() => {
        setBoardColumns(columns);
    }, [columns]);

    // Handle drag start
    const handleDragStart = (task: KanbanTask, columnId: string) => {
        setDraggedTask(task);
        setSourceColumnId(columnId);
    };

    // Handle drag over
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    // Handle drop
    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetColumnId: string) => {
        e.preventDefault();

        if (draggedTask && sourceColumnId && targetColumnId !== sourceColumnId) {
            // Call the onTaskMove callback if provided
            if (onTaskMove) {
                onTaskMove(draggedTask.id, sourceColumnId, targetColumnId);
            }

            // Update local state
            const updatedColumns = boardColumns.map(column => {
                // Remove task from source column
                if (column.id === sourceColumnId) {
                    return {
                        ...column,
                        tasks: column.tasks.filter(task => task.id !== draggedTask.id)
                    };
                }

                // Add task to target column
                if (column.id === targetColumnId) {
                    return {
                        ...column,
                        tasks: [...column.tasks, { ...draggedTask, status: column.id }]
                    };
                }

                return column;
            });

            setBoardColumns(updatedColumns);
        }

        // Reset drag state
        setDraggedTask(null);
        setSourceColumnId(null);
    };

    // Format date for display
    const formatDate = (dateString?: string) => {
        if (!dateString) return '';

        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
    };

    // Get priority badge style
    const getPriorityBadge = (priority?: 'LOW' | 'MEDIUM' | 'HIGH') => {
        switch (priority) {
            case 'HIGH':
                return 'bg-red-100 text-red-800';
            case 'MEDIUM':
                return 'bg-yellow-100 text-yellow-800';
            case 'LOW':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Get column header style
    const getColumnHeaderStyle = (color?: string) => {
        switch (color) {
            case 'blue':
                return 'bg-blue-100 border-blue-300';
            case 'green':
                return 'bg-green-100 border-green-300';
            case 'red':
                return 'bg-red-100 border-red-300';
            case 'yellow':
                return 'bg-yellow-100 border-yellow-300';
            case 'purple':
                return 'bg-purple-100 border-purple-300';
            case 'indigo':
                return 'bg-indigo-100 border-indigo-300';
            default:
                return 'bg-gray-100 border-gray-300';
        }
    };

    return (
        <div className={`flex flex-col ${className}`}>
            {loading ? (
                <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-500">Loading board...</span>
                </div>
            ) : (
                <div className="flex overflow-x-auto pb-4 space-x-4">
                    {boardColumns.map((column) => (
                        <div
                            key={column.id}
                            className="flex-shrink-0 w-72 bg-gray-50 rounded-md shadow"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, column.id)}
                        >
                            {/* Column Header */}
                            <div className={`p-3 border-b ${getColumnHeaderStyle(column.color)}`}>
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium text-gray-900">{column.title}</h3>
                                    <span className="text-sm text-gray-500">{column.tasks.length}</span>
                                </div>
                            </div>

                            {/* Task List */}
                            <div className="p-2 h-full max-h-[calc(100vh-12rem)] overflow-y-auto">
                                {column.tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="mb-2 p-3 bg-white rounded-md shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                                        onClick={() => onTaskClick && onTaskClick(task)}
                                        draggable
                                        onDragStart={() => handleDragStart(task, column.id)}
                                    >
                                        <div className="mb-2">
                                            <h4 className="font-medium text-gray-900">{task.title}</h4>
                                            {task.description && (
                                                <p className="mt-1 text-sm text-gray-600 line-clamp-2">{task.description}</p>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                            {task.priority && (
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityBadge(task.priority)}`}>
                                                    {task.priority}
                                                </span>
                                            )}

                                            {task.dueDate && (
                                                <span className="inline-flex items-center text-xs text-gray-500">
                                                    <svg className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    {formatDate(task.dueDate)}
                                                </span>
                                            )}
                                        </div>

                                        {/* Task Footer */}
                                        <div className="flex items-center justify-between mt-3">
                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-1">
                                                {task.tags && task.tags.slice(0, 2).map((tag, index) => (
                                                    <span key={index} className="inline-block px-2 py-0.5 bg-gray-100 text-xs text-gray-600 rounded">
                                                        {tag}
                                                    </span>
                                                ))}
                                                {task.tags && task.tags.length > 2 && (
                                                    <span className="inline-block px-2 py-0.5 bg-gray-100 text-xs text-gray-600 rounded">
                                                        +{task.tags.length - 2}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Assignee */}
                                            {task.assignee && (
                                                <div className="flex-shrink-0">
                                                    {task.assignee.avatar ? (
                                                        <img
                                                            className="h-6 w-6 rounded-full"
                                                            src={task.assignee.avatar}
                                                            alt={task.assignee.name}
                                                            title={task.assignee.name}
                                                        />
                                                    ) : (
                                                        <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-700" title={task.assignee.name}>
                                                            {task.assignee.name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* Add Task Button */}
                                <button
                                    className="w-full p-2 border border-dashed border-gray-300 rounded-md text-sm text-gray-500 hover:text-gray-700 hover:border-gray-400 flex items-center justify-center"
                                    onClick={() => onAddTask && onAddTask(column.id)}
                                >
                                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Add Task
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Add Column Button - would be implemented in a real scenario */}
                    <div className="flex-shrink-0 w-72 bg-gray-50 rounded-md shadow border border-dashed border-gray-300 flex items-center justify-center">
                        <Button variant="outline" size="sm">
                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Column
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KanbanBoard;