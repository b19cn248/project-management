// src/pages/tasks/TaskDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import {getTask, deleteTask, updateTask} from '../../services/taskService';
import { Task } from '../../types/api';

const TaskDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
    const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

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
            setLoading(true);
            await updateTask(id, { status: newStatus });

            // Refresh the task data
            const response = await getTask(id);
            setTask(response.data.data);
        } catch (error) {
            console.error('Error updating task status:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <MainLayout title="Task Detail">
                <div className="flex justify-center items-center h-64">
                    <p>Loading task data...</p>
                </div>
            </MainLayout>
        );
    }

    if (!task) {
        return (
            <MainLayout title="Task Not Found">
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900">Task not found</h2>
                    <p className="mt-2 text-gray-600">The task you're looking for doesn't exist or has been removed.</p>
                    <Link to="/tasks" className="mt-4 inline-block">
                        <Button variant="primary">Back to Tasks</Button>
                    </Link>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout title={task.title}>
            <div className="mb-6 flex justify-between items-center">
                <div className="flex space-x-2">
          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
              task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
          }`}>
            {task.status}
          </span>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        task.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                            task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                    }`}>
            {task.priority}
          </span>
                </div>
                <div className="space-x-3">
                    <Link to={`/tasks/${id}/edit`}>
                        <Button variant="secondary">
                            Edit Task
                        </Button>
                    </Link>
                    <Button
                        variant="danger"
                        onClick={() => setDeleteModalOpen(true)}
                    >
                        Delete Task
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card title="Task Details">
                        <div className="prose max-w-none">
                            <p>{task.description || 'No description provided.'}</p>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Timeline</h3>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                                    <div className="text-sm text-gray-500">Start Date</div>
                                    <div className="text-lg font-medium">
                                        {new Date(task.start_date).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                                    <div className="text-sm text-gray-500">Due Date</div>
                                    <div className="text-lg font-medium">
                                        {new Date(task.end_date).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Project</h3>
                            <Link to={`/projects/${task.project_uuid}`} className="text-blue-600 hover:underline">
                                {task.project_name}
                            </Link>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Update Status</h3>
                            <div className="flex flex-wrap gap-3 mt-2">
                                <Button
                                    size="sm"
                                    variant={task.status === 'PENDING' ? 'primary' : 'secondary'}
                                    onClick={() => handleStatusChange('PENDING')}
                                    disabled={task.status === 'PENDING'}
                                >
                                    Mark as Pending
                                </Button>
                                <Button
                                    size="sm"
                                    variant={task.status === 'IN_PROGRESS' ? 'primary' : 'secondary'}
                                    onClick={() => handleStatusChange('IN_PROGRESS')}
                                    disabled={task.status === 'IN_PROGRESS'}
                                >
                                    Mark as In Progress
                                </Button>
                                <Button
                                    size="sm"
                                    variant={task.status === 'COMPLETED' ? 'success' : 'secondary'}
                                    onClick={() => handleStatusChange('COMPLETED')}
                                    disabled={task.status === 'COMPLETED'}
                                >
                                    Mark as Completed
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    <Card title="Task Information">
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Created</h4>
                                <p className="mt-1">{new Date(task.created_at).toLocaleString()}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Last Updated</h4>
                                <p className="mt-1">{new Date(task.updated_at).toLocaleString()}</p>
                            </div>
                        </div>
                    </Card>

                    <Card title="Files" className="mt-6">
                        <div className="text-center py-6">
                            <p className="text-gray-500">No files attached</p>
                            <Button size="sm" className="mt-2">Upload File</Button>
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
                                    {deleteLoading ? 'Deleting...' : 'Delete'}
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