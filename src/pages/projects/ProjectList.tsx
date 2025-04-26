// src/pages/projects/ProjectList.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Loading, Error, EmptyState } from '../../components/common/LoadingError';
import { getProjects } from '../../services/projectService';
import { Project, PageResponse } from '../../types/api';

const ProjectList: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [pagination, setPagination] = useState<Omit<PageResponse<Project>, 'items'>>({
        page_number: 0,
        page_size: 10,
        total_elements: 0,
        total_pages: 0,
        has_next: false,
        has_previous: false,
    });

    // For now, we'll hardcode a user ID
    const userUuid = '550e8400-e29b-41d4-a716-446655440000';
    const [status, setStatus] = useState<string | undefined>(undefined);
    const [sortBy, setSortBy] = useState<string>('updated_at,desc');

    useEffect(() => {
        fetchProjects();
    }, [status, pagination.page_number, pagination.page_size, sortBy]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await getProjects(
                userUuid,
                status,
                pagination.page_number,
                pagination.page_size,
                sortBy
            );

            const { items, ...paginationData } = response.data.data;
            setProjects(items);
            setPagination(paginationData);
        } catch (error) {
            console.error('Error fetching projects:', error);
            setError('Failed to load projects. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        setPagination((prev) => ({ ...prev, page_number: newPage }));
    };

    const handleStatusFilter = (newStatus?: string) => {
        setStatus(newStatus);
        setPagination((prev) => ({ ...prev, page_number: 0 }));
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortBy(e.target.value);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    // Filter projects by search term
    const filteredProjects = searchTerm.trim()
        ? projects.filter(project =>
            project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        : projects;

    // Get status badge class
    const getStatusBadgeClass = (status: string) => {
        switch(status) {
            case 'COMPLETED':
                return 'bg-green-100 text-green-800';
            case 'IN_PROGRESS':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Format date for better readability
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Get progress color based on percentage
    const getProgressColor = (percentage: number) => {
        if (percentage >= 100) return 'bg-green-500';
        if (percentage >= 66) return 'bg-blue-500';
        if (percentage >= 33) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <MainLayout title="Projects">
            <div className="mb-6">
                {/* Search & Actions Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="relative rounded-md max-w-md w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border-gray-300 rounded-md"
                            placeholder="Search projects..."
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div>
                            <select
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                value={sortBy}
                                onChange={handleSortChange}
                            >
                                <option value="updated_at,desc">Recently Updated</option>
                                <option value="created_at,desc">Recently Created</option>
                                <option value="name,asc">Name (A-Z)</option>
                                <option value="name,desc">Name (Z-A)</option>
                                <option value="end_date,asc">Due Date (Earliest)</option>
                                <option value="end_date,desc">Due Date (Latest)</option>
                            </select>
                        </div>

                        <Link to="/projects/new">
                            <Button className="w-full sm:w-auto">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                                New Project
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Status Filter Pills */}
                <div className="flex flex-wrap gap-2 mb-6">
                    <Button
                        variant={status === undefined ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handleStatusFilter(undefined)}
                    >
                        All
                    </Button>
                    <Button
                        variant={status === 'IN_PROGRESS' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handleStatusFilter('IN_PROGRESS')}
                    >
                        In Progress
                    </Button>
                    <Button
                        variant={status === 'COMPLETED' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handleStatusFilter('COMPLETED')}
                    >
                        Completed
                    </Button>
                    <Button
                        variant={status === 'PLANNED' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handleStatusFilter('PLANNED')}
                    >
                        Planned
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <Card>
                {loading ? (
                    <Loading message="Loading projects..." />
                ) : error ? (
                    <Error
                        title="Error loading projects"
                        message={error}
                        showRetry={true}
                        onRetry={fetchProjects}
                    />
                ) : filteredProjects.length === 0 ? (
                    // Empty state
                    <EmptyState
                        title={searchTerm ? "No matching projects found" : "No projects yet"}
                        description={searchTerm
                            ? "Try adjusting your search or filters to find what you're looking for."
                            : "Get started by creating your first project."}
                        icon={
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        }
                        action={
                            <Link to="/projects/new">
                                <Button>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    New Project
                                </Button>
                            </Link>
                        }
                    />
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
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
                                {filteredProjects.map((project) => (
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
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(project.status)}`}>
                                                    {project.status.replace('_', ' ')}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="w-full bg-gray-200 rounded-full h-2.5 w-24">
                                                <div
                                                    className={`${getProgressColor(project.progress_percentage)} h-2.5 rounded-full`}
                                                    style={{ width: `${project.progress_percentage}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {project.progress_percentage.toFixed(0)}%
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div>Start: {formatDate(project.start_date)}</div>
                                            <div>Due: {formatDate(project.end_date)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <span className="font-medium text-gray-900">{project.completed_tasks}</span>
                                                <span className="mx-1">/</span>
                                                <span>{project.total_tasks}</span>
                                            </div>
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

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-4">
                            {filteredProjects.map((project) => (
                                <div key={project.uuid} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                                    <Link to={`/projects/${project.uuid}`} className="block">
                                        <div className="p-4">
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(project.status)}`}>
                                                    {project.status.replace('_', ' ')}
                                                </span>
                                            </div>

                                            {project.description && (
                                                <p className="mt-1 text-sm text-gray-600 line-clamp-2">{project.description}</p>
                                            )}

                                            <div className="mt-3 text-sm text-gray-500 flex justify-between">
                                                <span>Due: {formatDate(project.end_date)}</span>
                                                <span>
                                                    Tasks: {project.completed_tasks}/{project.total_tasks}
                                                </span>
                                            </div>

                                            <div className="mt-3">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs font-medium text-gray-500">Progress</span>
                                                    <span className="text-xs font-medium text-gray-700">{project.progress_percentage.toFixed(0)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`${getProgressColor(project.progress_percentage)} h-2 rounded-full`}
                                                        style={{ width: `${project.progress_percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 flex justify-end space-x-3">
                                            <Link
                                                to={`/projects/${project.uuid}`}
                                                className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                                            >
                                                View
                                            </Link>
                                            <Link
                                                to={`/projects/${project.uuid}/edit`}
                                                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                            >
                                                Edit
                                            </Link>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.total_pages > 1 && (
                            <div className="mt-6 flex items-center justify-between">
                                <div className="flex-1 flex justify-between items-center">
                                    <Button
                                        onClick={() => handlePageChange(pagination.page_number - 1)}
                                        disabled={!pagination.has_previous}
                                        variant="outline"
                                        size="sm"
                                    >
                                        Previous
                                    </Button>
                                    <div className="hidden sm:flex">
                                        {Array.from({ length: pagination.total_pages }, (_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handlePageChange(i)}
                                                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                                                    pagination.page_number === i
                                                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                } border`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="sm:hidden text-sm text-gray-700">
                                        Page {pagination.page_number + 1} of {pagination.total_pages}
                                    </div>
                                    <Button
                                        onClick={() => handlePageChange(pagination.page_number + 1)}
                                        disabled={!pagination.has_next}
                                        variant="outline"
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