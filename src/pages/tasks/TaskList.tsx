// src/pages/tasks/TaskList.tsx
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getTasksByProject } from '../../services/taskService';
import { getProjects } from '../../services/projectService';
import { Task, Project, PageResponse } from '../../types/api';

const TaskList: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [pagination, setPagination] = useState<Omit<PageResponse<Task>, 'items'>>({
        page_number: 0,
        page_size: 10,
        total_elements: 0,
        total_pages: 0,
        has_next: false,
        has_previous: false,
    });

    // For now, we'll hardcode a user ID
    const userUuid = '550e8400-e29b-41d4-a716-446655440000';

    const projectUuid = searchParams.get('project') || '';
    const status = searchParams.get('status') || undefined;

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
        const fetchTasks = async () => {
            try {
                setLoading(true);

                if (projectUuid) {
                    const response = await getTasksByProject(
                        projectUuid,
                        status,
                        pagination.page_number,
                        pagination.page_size
                    );

                    const { items, ...paginationData } = response.data.data;
                    setTasks(items);
                    setPagination(paginationData);
                } else {
                    // If no project is selected, we could fetch all tasks for the user
                    // but the API doesn't seem to have that endpoint
                    setTasks([]);
                }
            } catch (error) {
                console.error('Error fetching tasks:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [projectUuid, status, pagination.page_number, pagination.page_size]);

    const handlePageChange = (newPage: number) => {
        setPagination((prev) => ({ ...prev, page_number: newPage }));
    };

    const handleProjectChange = (projectId: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (projectId) {
            newParams.set('project', projectId);
        } else {
            newParams.delete('project');
        }
        setSearchParams(newParams);
    };

    const handleStatusFilter = (newStatus?: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (newStatus) {
            newParams.set('status', newStatus);
        } else {
            newParams.delete('status');
        }
        setSearchParams(newParams);
    };

    const getProjectName = (projectId: string) => {
        const project = projects.find(p => p.uuid === projectId);
        return project ? project.name : 'Unknown Project';
    };

    return (
        <MainLayout title="Tasks">
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div>
                        <label htmlFor="project-filter" className="block text-sm font-medium text-gray-700 mb-1">
                            Filter by Project
                        </label>
                        <select
                            id="project-filter"
                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={projectUuid}
                            onChange={(e) => handleProjectChange(e.target.value)}
                        >
                            <option value="">All Projects</option>
                            {projects.map((project) => (
                                <option key={project.uuid} value={project.uuid}>
                                    {project.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Filter by Status
                        </label>
                        <div className="flex space-x-2">
                            <Button
                                variant={status === undefined ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => handleStatusFilter(undefined)}
                            >
                                All
                            </Button>
                            <Button
                                variant={status === 'PENDING' ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => handleStatusFilter('PENDING')}
                            >
                                Pending
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
                        </div>
                    </div>
                </div>

                <Link to={{ pathname: '/tasks/new', search: projectUuid ? `?project=${projectUuid}` : '' }}>
                    <Button>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        New Task
                    </Button>
                </Link>
            </div>

            <Card>
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <p>Loading tasks...</p>
                    </div>
                ) : !projectUuid ? (
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
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Select a project</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Please select a project to view its tasks
                        </p>
                    </div>
                ) : tasks.length === 0 ? (
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
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {status ? `No ${status.toLowerCase()} tasks found` : 'Get started by creating a new task'}
                        </p>
                        <div className="mt-6">
                            <Link to={{ pathname: '/tasks/new', search: `?project=${projectUuid}` }}>
                                <Button>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    New Task
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
                                        Title
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Project
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Priority
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Due Date
                                    </th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {tasks.map((task) => (
                                    <tr key={task.uuid} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                <Link to={`/tasks/${task.uuid}`} className="hover:text-blue-600">
                                                    {task.title}
                                                </Link>
                                            </div>
                                            <div className="text-sm text-gray-500 truncate max-w-xs">
                                                {task.description}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {task.project_name || getProjectName(task.project_uuid)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status}
                        </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            task.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                                task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(task.end_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link
                                                to={`/tasks/${task.uuid}`}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                View
                                            </Link>
                                            <Link
                                                to={`/tasks/${task.uuid}/edit`}
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

export default TaskList;