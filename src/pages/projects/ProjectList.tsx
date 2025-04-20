// src/pages/projects/ProjectList.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getProjects } from '../../services/projectService';
import { Project, PageResponse } from '../../types/api';

const ProjectList: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [pagination, setPagination] = useState<Omit<PageResponse<Project>, 'items'>>({
        page_number: 0,
        page_size: 10,
        total_elements: 0,
        total_pages: 0,
        has_next: false,
        has_previous: false,
    });

    // For now, we'll hardcode a user ID
    const userUuid = '123e4567-e89b-12d3-a456-426614174000';
    const [status, setStatus] = useState<string | undefined>(undefined);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);
                const response = await getProjects(
                    userUuid,
                    status,
                    pagination.page_number,
                    pagination.page_size
                );

                const { items, ...paginationData } = response.data.data;
                setProjects(items);
                setPagination(paginationData);
            } catch (error) {
                console.error('Error fetching projects:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [userUuid, status, pagination.page_number, pagination.page_size]);

    const handlePageChange = (newPage: number) => {
        setPagination((prev) => ({ ...prev, page_number: newPage }));
    };

    const handleStatusFilter = (newStatus?: string) => {
        setStatus(newStatus);
        setPagination((prev) => ({ ...prev, page_number: 0 }));
    };

    return (
        <MainLayout title="Projects">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex space-x-2">
                    <Button
                        variant={status === undefined ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => handleStatusFilter(undefined)}
                    >
                        All
                    </Button>
                    <Button
                        variant={status === 'IN_PROGRESS' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => handleStatusFilter('IN_PROGRESS')}
                    >
                        In Progress
                    </Button>
                    <Button
                        variant={status === 'COMPLETED' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => handleStatusFilter('COMPLETED')}
                    >
                        Completed
                    </Button>
                    <Button
                        variant={status === 'PLANNED' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => handleStatusFilter('PLANNED')}
                    >
                        Planned
                    </Button>
                </div>
                <Link to="/projects/new">
                    <Button>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        New Project
                    </Button>
                </Link>
            </div>

            <Card>
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <p>Loading projects...</p>
                    </div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-12">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Get started by creating a new project.
                        </p>
                        <div className="mt-6">
                            <Link to="/projects/new">
                                <Button>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    New Project
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Progress
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Timeline
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tasks
                                    </th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {projects.map((project) => (
                                    <tr key={project.uuid} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        <Link to={`/projects/${project.uuid}`} className="hover:text-blue-600">
                                                            {project.name}
                                                        </Link>
                                                    </div>
                                                    <div className="text-sm text-gray-500 truncate max-w-xs">
                                                        {project.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            project.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                project.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status}
                        </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="w-full bg-gray-200 rounded-full h-2.5 w-24">
                                                <div
                                                    className="bg-blue-600 h-2.5 rounded-full"
                                                    style={{ width: `${project.progress_percentage}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {project.progress_percentage.toFixed(0)}%
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div>Start: {new Date(project.start_date).toLocaleDateString()}</div>
                                            <div>End: {new Date(project.end_date).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {project.completed_tasks} / {project.total_tasks}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link
                                                to={`/projects/${project.uuid}`}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                View
                                            </Link>
                                            <Link
                                                to={`/projects/${project.uuid}/edit`}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                Edit
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.total_pages > 1 && (
                            <div className="p-4 flex items-center justify-between border-t border-gray-200">
                                <div className="flex-1 flex justify-between items-center">
                                    <Button
                                        onClick={() => handlePageChange(pagination.page_number - 1)}
                                        disabled={!pagination.has_previous}
                                        variant="secondary"
                                        size="sm"
                                    >
                                        Previous
                                    </Button>
                                    <div className="text-sm text-gray-700">
                                        Page {pagination.page_number + 1} of {pagination.total_pages}
                                    </div>
                                    <Button
                                        onClick={() => handlePageChange(pagination.page_number + 1)}
                                        disabled={!pagination.has_next}
                                        variant="secondary"
                                        size="sm"
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </Card>
        </MainLayout>
    );
};

export default ProjectList;