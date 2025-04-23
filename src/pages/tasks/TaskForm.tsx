// src/pages/tasks/TaskForm.tsx
import React, {useEffect, useState} from 'react';
import {useNavigate, useParams, useSearchParams} from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import {createTask, getTask, updateTask} from '../../services/taskService';
import {getProjects} from '../../services/projectService';
import {Project, TaskCreateRequest, TaskUpdateRequest} from '../../types/api';

// Tạo type tạm thời bao gồm cả project_uuid cho cả form data
type TaskFormData = {
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    priority: string;
    status: string;
    project_uuid: string;
};

const TaskForm: React.FC = () => {
    // Sửa kiểu dữ liệu params và xử lý id có thể là undefined
    const params = useParams<{ id?: string }>();
    const id = params.id || '';
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    // Extract project ID from URL query parameters
    const projectUuidFromQuery = searchParams.get('project') || '';

    // Sử dụng type TaskFormData để tránh lỗi về project_uuid
    const [formData, setFormData] = useState<TaskFormData>({
        title: '',
        description: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'MEDIUM',
        status: 'PENDING',
        project_uuid: projectUuidFromQuery
    });

    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [submitLoading, setSubmitLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // For now, we'll hardcode a user ID
    const userUuid = '550e8400-e29b-41d4-a716-446655440000';

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await getProjects(userUuid);
                setProjects(response.data.data.items);
            } catch (error) {
                console.error('Error fetching projects:', error);
            }
        };

        fetchProjects();
    }, [userUuid]);

    useEffect(() => {
        const fetchTask = async () => {
            if (isEditMode && id) {
                try {
                    setLoading(true);
                    const response = await getTask(id);
                    const task = response.data.data;

                    // Đảm bảo tất cả trường có giá trị mặc định nếu undefined
                    setFormData({
                        title: task.title || '',
                        description: task.description || '',
                        start_date: task.start_date || new Date().toISOString().split('T')[0],
                        end_date: task.end_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        priority: task.priority || 'MEDIUM',
                        status: task.status || 'PENDING',
                        project_uuid: task.project_uuid || ''
                    });
                } catch (error) {
                    console.error('Error fetching task:', error);
                    setError('Failed to load task data.');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchTask();
    }, [id, isEditMode]);

    // Set project UUID from query parameters when in create mode
    useEffect(() => {
        if (!isEditMode && projectUuidFromQuery) {
            setFormData(prev => ({
                ...prev,
                project_uuid: projectUuidFromQuery
            }));
        }
    }, [projectUuidFromQuery, isEditMode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            setSubmitLoading(true);

            if (isEditMode && id) {
                // Loại bỏ project_uuid vì TaskUpdateRequest không có trường này
                const {project_uuid, ...updateData} = formData;
                await updateTask(id, updateData as TaskUpdateRequest);
            } else {
                // Sử dụng toàn bộ formData cho TaskCreateRequest
                await createTask(formData as TaskCreateRequest);
            }

            // Navigate back based on where we came from
            if (formData.project_uuid) {
                navigate(`/projects/${formData.project_uuid}`);
            } else {
                navigate('/tasks');
            }
        } catch (error) {
            console.error('Error saving task:', error);
            setError('Failed to save task. Please try again.');
        } finally {
            setSubmitLoading(false);
        }
    };

    // Đảm bảo tất cả trường trong formData có giá trị mặc định khi trống
    const safeFormData = {
        title: formData.title || '',
        description: formData.description || '',
        start_date: formData.start_date || '',
        end_date: formData.end_date || '',
        priority: formData.priority || 'MEDIUM',
        status: formData.status || 'PENDING',
        project_uuid: formData.project_uuid || ''
    };

    return (
        <MainLayout title={isEditMode ? 'Edit Task' : 'Create New Task'}>
            <Card>
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <p>Loading task data...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                                <div className="flex">
                                    <div>
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <Input
                                id="title"
                                name="title"
                                label="Task Title"
                                value={safeFormData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={4}
                                value={safeFormData.description}
                                onChange={handleChange}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Input
                                    type="date"
                                    id="start_date"
                                    name="start_date"
                                    label="Start Date"
                                    value={safeFormData.start_date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div>
                                <Input
                                    type="date"
                                    id="end_date"
                                    name="end_date"
                                    label="Due Date"
                                    value={safeFormData.end_date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label htmlFor="project_uuid" className="block text-sm font-medium text-gray-700 mb-1">
                                    Project
                                </label>
                                <select
                                    id="project_uuid"
                                    name="project_uuid"
                                    value={safeFormData.project_uuid}
                                    onChange={handleChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                    disabled={isEditMode} // Can't change project in edit mode
                                >
                                    <option value="">Select a project</option>
                                    {projects.map((project) => (
                                        <option key={project.uuid} value={project.uuid}>
                                            {project.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                                    Priority
                                </label>
                                <select
                                    id="priority"
                                    name="priority"
                                    value={safeFormData.priority}
                                    onChange={handleChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    value={safeFormData.status}
                                    onChange={handleChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                >
                                    <option value="PENDING">Pending</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="COMPLETED">Completed</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => navigate(-1)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitLoading}
                            >
                                {submitLoading ? 'Saving...' : isEditMode ? 'Update Task' : 'Create Task'}
                            </Button>
                        </div>
                    </form>
                )}
            </Card>
        </MainLayout>
    );
};

export default TaskForm;