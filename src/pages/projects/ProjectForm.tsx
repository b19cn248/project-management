// src/pages/projects/ProjectForm.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { createProject, getProject, updateProject } from '../../services/projectService';
import { ProjectCreateRequest, ProjectUpdateRequest } from '../../types/api';

const ProjectForm: React.FC = () => {
    // Chỉ định rõ kiểu dữ liệu params có thể bao gồm undefined
    const params = useParams<{ id?: string }>();
    const id = params.id || ''; // Biến đổi thành chuỗi rỗng nếu undefined
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState<ProjectCreateRequest | ProjectUpdateRequest>({
        name: '',
        description: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'PLANNED'
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [submitLoading, setSubmitLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // For now, we'll hardcode a user ID
    const userUuid = '550e8400-e29b-41d4-a716-446655440000';

    useEffect(() => {
        const fetchProject = async () => {
            if (isEditMode && id) {
                try {
                    setLoading(true);
                    const response = await getProject(id);
                    const project = response.data.data;

                    // Đảm bảo tất cả các trường không phải undefined
                    setFormData({
                        name: project.name || '',
                        description: project.description || '',
                        start_date: project.start_date || new Date().toISOString().split('T')[0],
                        end_date: project.end_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        status: project.status || 'PLANNED'
                    });
                } catch (error) {
                    console.error('Error fetching project:', error);
                    setError('Failed to load project data.');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchProject();
    }, [id, isEditMode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
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
                await updateProject(id, formData as ProjectUpdateRequest);
            } else {
                await createProject(userUuid, formData as ProjectCreateRequest);
            }

            navigate('/projects');
        } catch (error) {
            console.error('Error saving project:', error);
            setError('Failed to save project. Please try again.');
        } finally {
            setSubmitLoading(false);
        }
    };

    // Đảm bảo tất cả trường trong formData có giá trị mặc định khi trống
    const safeFormData = {
        name: formData.name || '',
        description: formData.description || '',
        start_date: formData.start_date || '',
        end_date: formData.end_date || '',
        status: formData.status || 'PLANNED'
    };

    return (
        <MainLayout title={isEditMode ? 'Edit Project' : 'Create New Project'}>
            <Card>
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <p>Loading project data...</p>
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
                                id="name"
                                name="name"
                                label="Project Name"
                                value={safeFormData.name}
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
                                    label="End Date"
                                    value={safeFormData.end_date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
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
                                <option value="PLANNED">Planned</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => navigate('/projects')}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitLoading}
                            >
                                {submitLoading ? 'Saving...' : isEditMode ? 'Update Project' : 'Create Project'}
                            </Button>
                        </div>
                    </form>
                )}
            </Card>
        </MainLayout>
    );
};

export default ProjectForm;