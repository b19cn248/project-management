// src/pages/projects/ProjectForm.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Loading, Error } from '../../components/common/LoadingError';
import { createProject, getProject, updateProject } from '../../services/projectService';
import { ProjectCreateRequest, ProjectUpdateRequest } from '../../types/api';

// Validation schema
const ProjectSchema = Yup.object().shape({
    name: Yup.string()
        .min(3, 'Project name must be at least 3 characters')
        .max(100, 'Project name must be at most 100 characters')
        .required('Project name is required'),
    description: Yup.string()
        .max(1000, 'Description must be at most 1000 characters'),
    start_date: Yup.date()
        .required('Start date is required'),
    end_date: Yup.date()
        .required('End date is required')
        .min(
            Yup.ref('start_date'),
            'End date must be after start date'
        ),
    status: Yup.string()
        .oneOf(['PLANNED', 'IN_PROGRESS', 'COMPLETED'], 'Invalid status')
        .required('Status is required'),
});

const ProjectForm: React.FC = () => {
    const params = useParams<{ id?: string }>();
    const id = params.id || '';
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [project, setProject] = useState<ProjectCreateRequest | ProjectUpdateRequest>({
        name: '',
        description: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'PLANNED'
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // For now, we'll hardcode a user ID
    const userUuid = '550e8400-e29b-41d4-a716-446655440000';

    useEffect(() => {
        const fetchProject = async () => {
            if (isEditMode && id) {
                try {
                    setLoading(true);
                    setError(null);

                    const response = await getProject(id);
                    const projectData = response.data.data;

                    setProject({
                        name: projectData.name || '',
                        description: projectData.description || '',
                        start_date: projectData.start_date || new Date().toISOString().split('T')[0],
                        end_date: projectData.end_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        status: projectData.status || 'PLANNED'
                    });
                } catch (error) {
                    console.error('Error fetching project:', error);
                    setError('Failed to load project data. Please try again.');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchProject();
    }, [id, isEditMode]);

    const handleSubmit = async (values: ProjectCreateRequest | ProjectUpdateRequest) => {
        try {
            setIsSubmitting(true);
            setError(null);

            if (isEditMode && id) {
                await updateProject(id, values as ProjectUpdateRequest);
            } else {
                await createProject(userUuid, values as ProjectCreateRequest);
            }

            navigate('/projects');
        } catch (error) {
            console.error('Error saving project:', error);
            setError('Failed to save project. Please check your connection and try again.');
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <MainLayout title={isEditMode ? 'Edit Project' : 'Create New Project'}>
                <Card>
                    <Loading message="Loading project data..." />
                </Card>
            </MainLayout>
        );
    }

    if (error && isEditMode) {
        return (
            <MainLayout title="Error">
                <Card>
                    <Error
                        title="Error Loading Project"
                        message={error}
                        showRetry={true}
                        onRetry={() => window.location.reload()}
                    />
                </Card>
            </MainLayout>
        );
    }

    return (
        <MainLayout title={isEditMode ? 'Edit Project' : 'Create New Project'}>
            <div className="max-w-3xl mx-auto">
                <Card>
                    <Formik
                        initialValues={project}
                        validationSchema={ProjectSchema}
                        onSubmit={handleSubmit}
                        enableReinitialize
                    >
                        {({ isValid, dirty, touched, values, setFieldValue }) => (
                            <Form className="space-y-6">
                                {error && (
                                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm text-red-700">{error}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Project Name <span className="text-red-500">*</span>
                                    </label>
                                    <Field
                                        type="text"
                                        id="name"
                                        name="name"
                                        placeholder="Enter project name"
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                    <ErrorMessage name="name" component="p" className="mt-1 text-sm text-red-600" />
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <Field
                                        as="textarea"
                                        id="description"
                                        name="description"
                                        rows={4}
                                        placeholder="Enter project description"
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                    <ErrorMessage name="description" component="p" className="mt-1 text-sm text-red-600" />
                                    <p className="mt-1 text-xs text-gray-500">
                                        {values.description?.length || 0}/1000 characters
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                                            Start Date <span className="text-red-500">*</span>
                                        </label>
                                        <Field
                                            type="date"
                                            id="start_date"
                                            name="start_date"
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                        <ErrorMessage name="start_date" component="p" className="mt-1 text-sm text-red-600" />
                                    </div>

                                    <div>
                                        <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                                            End Date <span className="text-red-500">*</span>
                                        </label>
                                        <Field
                                            type="date"
                                            id="end_date"
                                            name="end_date"
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                        <ErrorMessage name="end_date" component="p" className="mt-1 text-sm text-red-600" />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                        Status <span className="text-red-500">*</span>
                                    </label>
                                    <Field
                                        as="select"
                                        id="status"
                                        name="status"
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="PLANNED">Planned</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="COMPLETED">Completed</option>
                                    </Field>
                                    <ErrorMessage name="status" component="p" className="mt-1 text-sm text-red-600" />
                                </div>

                                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => navigate('/projects')}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting || !(isValid && (dirty || isEditMode))}
                                        loading={isSubmitting}
                                    >
                                        {isEditMode ? 'Update Project' : 'Create Project'}
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </Card>
            </div>
        </MainLayout>
    );
};

export default ProjectForm;