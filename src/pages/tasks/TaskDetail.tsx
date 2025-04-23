// src/pages/tasks/TaskDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getTask, deleteTask, updateTask } from '../../services/taskService';
import { Task } from '../../types/api';

const TaskDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
    const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
    const [statusUpdateLoading, setStatusUpdateLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchTask = async () => {
            if (!id) return;

            try {
                setLoading(true);
                const response = await getTask(id);
                setTask(response.data.data);
            } catch (error) {
                console.error('Error fetching task:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTask();
    }, [id]);

    const handleDelete = async () => {
        if (!id) return;

        try {
            setDeleteLoading(true);
            await deleteTask(id);

            // Navigate to project or tasks page
            if (task?.project_uuid) {
                navigate(`/projects/${task.project_uuid}`);
            } else {
                navigate('/tasks');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            setDeleteLoading(false);
            setDeleteModalOpen(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!id || !task) return;

        try {
            setStatusUpdateLoading(true);
            await updateTask(id, {
                status: newStatus,
                project_uuid: task.project_uuid
            });

            // Refresh the task data
            const response = await getTask(id);
            setTask(response.data.data);
        } catch (error) {
            console.error('Error updating task status:', error);
        } finally {
            setStatusUpdateLoading(false);
        }
    };

    // Format date for better readability
    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Calculate days remaining until due date
    const calculateDaysRemaining = (endDate: string) => {
        const due = new Date(endDate);
        const today = new Date();
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Get due status with appropriate styling
    const getDueStatus = (endDate: string) => {
        const days = calculateDaysRemaining(endDate);

        if (days < 0) return { text: `Overdue by ${Math.abs(days)} days`, class: 'text-red-600 font-medium' };
        if (days === 0) return { text: 'Due today', class: 'text-orange-600 font-medium' };
        if (days === 1) return { text: 'Due tomorrow', class: 'text-yellow-600' };
        if (days <= 3) return { text: `Due in ${days} days`, class: 'text-yellow-600' };
        return { text: `Due in ${days} days`, class: 'text-green-600' };
    };

    // Render status badge with icon
    const renderStatusBadge = (status: string) => {
        const statusConfig = {
            'COMPLETED': { bg: 'bg-green-100', text: 'text-green-800', icon: '✓' },
            'IN_PROGRESS': { bg: 'bg-blue-100', text: 'text-blue-800', icon: '►' },
            'PENDING': { bg: 'bg-gray-100', text: 'text-gray-800', icon: '○' }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['PENDING'];

        return (
            <div className={`px-3 py-2 inline-flex items-center text-sm leading-5 font-medium rounded-lg ${config.bg} ${config.text}`}>
                <span className="mr-1.5">{config.icon}</span>
                {status.replace('_', ' ')}
            </div>
        );
    };

    // Render priority badge with icon
    const renderPriorityBadge = (priority: string) => {
        const priorityConfig = {
            'HIGH': { bg: 'bg-red-100', text: 'text-red-800', icon: '⚠️' },
            'MEDIUM': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '!' },
            'LOW': { bg: 'bg-green-100', text: 'text-green-800', icon: '·' }
        };

        const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig['MEDIUM'];

        return (
            <div className={`px-3 py-2 inline-flex items-center text-sm leading-5 font-medium rounded-lg ${config.bg} ${config.text}`}>
                <span className="mr-1.5">{config.icon}</span>
                {priority}
            </div>
        );
    };

    if (loading) {
        return (
            <MainLayout title="Task Detail">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-gray-600">Loading task data...</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (!task) {
        return (
            <MainLayout title="Task Not Found">
                <div className="text-center py-12 max-w-lg mx-auto">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h2 className="text-2xl font-bold text-gray-900">Task not found</h2>
                    <p className="mt-2 text-gray-600">The task you're looking for doesn't exist or has been removed.</p>
                    <Link to="/tasks" className="mt-6 inline-block">
                        <Button variant="primary">Back to Tasks</Button>
                    </Link>
                </div>
            </MainLayout>
        );
    }

    const dueStatus = getDueStatus(task.end_date);

    return (
        <MainLayout title={task.title}>
            {/* Task Header */}
            <div className="mb-6 bg-white rounded-lg shadow-sm p-5">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div className="mb-4 sm:mb-0">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                            Created on {formatDate(task.created_at)}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link to={`/tasks/${id}/edit`}>
                            <Button variant="secondary">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                                Edit Task
                            </Button>
                        </Link>
                        <Button
                            variant="danger"
                            onClick={() => setDeleteModalOpen(true)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Delete Task
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2">
                    <Card title="Task Details">
                        {/* Status and Priority Badges */}
                        <div className="flex flex-wrap gap-3 mb-5">
                            {renderStatusBadge(task.status)}
                            {renderPriorityBadge(task.priority)}
                        </div>

                        {/* Task Description */}
                        <div className="prose max-w-none border-b border-gray-200 pb-5">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                            <p className="text-gray-700 leading-relaxed">
                                {task.description || 'No description provided.'}
                            </p>
                        </div>

                        {/* Project Link */}
                        <div className="mt-5 pb-5 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Project</h3>
                            <Link
                                to={`/projects/${task.project_uuid}`}
                                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                            >
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                </svg>
                                {task.project_name}
                            </Link>
                        </div>

                        {/* Timeline */}
                        <div className="mt-5 pb-5 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Timeline</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <div className="text-sm text-gray-500">Start Date</div>
                                    <div className="text-lg font-medium">{formatDate(task.start_date)}</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <div className="text-sm text-gray-500">Due Date</div>
                                    <div className="text-lg font-medium">{formatDate(task.end_date)}</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <div className="text-sm text-gray-500">Status</div>
                                    <div className={`text-lg font-medium ${dueStatus.class}`}>{dueStatus.text}</div>
                                </div>
                            </div>
                        </div>

                        {/* Update Status */}
                        <div className="mt-5">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Update Status</h3>
                            {statusUpdateLoading ? (
                                <div className="flex items-center text-blue-600">
                                    <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Updating status...
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <Button
                                        size="sm"
                                        variant={task.status === 'PENDING' ? 'primary' : 'secondary'}
                                        onClick={() => handleStatusChange('PENDING')}
                                        disabled={task.status === 'PENDING'}
                                        className="flex items-center"
                                    >
                                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                        Mark as Pending
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={task.status === 'IN_PROGRESS' ? 'primary' : 'secondary'}
                                        onClick={() => handleStatusChange('IN_PROGRESS')}
                                        disabled={task.status === 'IN_PROGRESS'}
                                        className="flex items-center"
                                    >
                                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                        </svg>
                                        Mark as In Progress
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={task.status === 'COMPLETED' ? 'success' : 'secondary'}
                                        onClick={() => handleStatusChange('COMPLETED')}
                                        disabled={task.status === 'COMPLETED'}
                                        className="flex items-center"
                                    >
                                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        Mark as Completed
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Task Information */}
                    <Card title="Task Information">
                        <div className="space-y-4 divide-y divide-gray-100">
                            <div className="pt-2">
                                <h4 className="text-sm font-medium text-gray-500">Created</h4>
                                <p className="mt-1 text-gray-800">{new Date(task.created_at).toLocaleString()}</p>
                            </div>
                            <div className="pt-4">
                                <h4 className="text-sm font-medium text-gray-500">Last Updated</h4>
                                <p className="mt-1 text-gray-800">{new Date(task.updated_at).toLocaleString()}</p>
                            </div>
                            {task.priority && (
                                <div className="pt-4">
                                    <h4 className="text-sm font-medium text-gray-500">Priority</h4>
                                    <div className="mt-1">
                                        {renderPriorityBadge(task.priority)}
                                    </div>
                                </div>
                            )}
                            <div className="pt-4">
                                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                                <div className="mt-1">
                                    {renderStatusBadge(task.status)}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Status Timeline */}
                    <Card title="Task Timeline">
                        <div className="relative py-6">
                            <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-gray-200"></div>
                            <ul className="space-y-6 relative">
                                <li className="flex gap-4">
                                    <div className="flex-none w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center z-10">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-base font-medium">Task Created</h4>
                                        <p className="text-sm text-gray-500">{new Date(task.created_at).toLocaleString()}</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="flex-none w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center z-10">
                                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-base font-medium">Start Date</h4>
                                        <p className="text-sm text-gray-500">{formatDate(task.start_date)}</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className={`flex-none w-12 h-12 rounded-full ${calculateDaysRemaining(task.end_date) < 0 ? 'bg-red-100' : 'bg-orange-100'} flex items-center justify-center z-10`}>
                                        <svg className={`w-6 h-6 ${calculateDaysRemaining(task.end_date) < 0 ? 'text-red-600' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-base font-medium">Due Date</h4>
                                        <p className={`text-sm ${dueStatus.class}`}>
                                            {formatDate(task.end_date)} ({dueStatus.text})
                                        </p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </Card>

                    {/* Files Section */}
                    <Card title="Files">
                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <p className="text-gray-500 mb-3">No files attached</p>
                            <Button size="sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                                Upload File
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Task</h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Are you sure you want to delete this task? This action cannot be undone.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <Button
                                    variant="danger"
                                    onClick={handleDelete}
                                    disabled={deleteLoading}
                                    className="sm:ml-3"
                                >
                                    {deleteLoading ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Deleting...
                                        </span>
                                    ) : (
                                        <span className="flex items-center">
                                            <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            Delete
                                        </span>
                                    )}
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => setDeleteModalOpen(false)}
                                    disabled={deleteLoading}
                                    className="mt-3 sm:mt-0"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

export default TaskDetail;