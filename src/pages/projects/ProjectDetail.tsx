// src/pages/projects/ProjectDetail.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { deleteProject, getProject } from '../../services/projectService';
import { getTasksByProject } from '../../services/taskService';
import { Project, Task } from '../../types/api';

const ProjectDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
    const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchProjectData = async () => {
            if (!id) return;

            try {
                setLoading(true);
                const [projectResponse, tasksResponse] = await Promise.all([
                    getProject(id),
                    getTasksByProject(id)
                ]);

                setProject(projectResponse.data.data);
                setTasks(tasksResponse.data.data.items);
            } catch (error) {
                console.error('Error fetching project data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjectData();
    }, [id]);

    const handleDelete = async () => {
        if (!id) return;

        try {
            setDeleteLoading(true);
            await deleteProject(id);
            navigate('/projects');
        } catch (error) {
            console.error('Error deleting project:', error);
            setDeleteLoading(false);
            setDeleteModalOpen(false);
        }
    };

    if (loading) {
        return (
            <MainLayout title="Project Detail">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-gray-600">Loading project data...</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (!project) {
        return (
            <MainLayout title="Project Not Found">
                <div className="text-center py-12 max-w-lg mx-auto">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h2 className="text-2xl font-bold text-gray-900">Project not found</h2>
                    <p className="mt-2 text-gray-600">The project you're looking for doesn't exist or has been removed.</p>
                    <Link to="/projects" className="mt-6 inline-block">
                        <Button variant="primary">Back to Projects</Button>
                    </Link>
                </div>
            </MainLayout>
        );
    }

    // Function to render status badge
    const renderStatusBadge = (status: string) => {
        const statusConfig = {
            'COMPLETED': { bg: 'bg-green-100', text: 'text-green-800', icon: '✓' },
            'IN_PROGRESS': { bg: 'bg-blue-100', text: 'text-blue-800', icon: '►' },
            'NOT_STARTED': { bg: 'bg-gray-100', text: 'text-gray-800', icon: '○' }
        };

        // Default to NOT_STARTED if status is not recognized
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['NOT_STARTED'];

        return (
            <span className={`px-3 py-1 inline-flex items-center text-sm leading-5 font-medium rounded-full ${config.bg} ${config.text}`}>
                <span className="mr-1">{config.icon}</span> {status.replace('_', ' ')}
            </span>
        );
    };

    // Function to render priority badge
    const renderPriorityBadge = (priority: string) => {
        const priorityConfig = {
            'HIGH': { bg: 'bg-red-100', text: 'text-red-800', icon: '⚠️' },
            'MEDIUM': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '!' },
            'LOW': { bg: 'bg-green-100', text: 'text-green-800', icon: '·' }
        };

        // Default to MEDIUM if priority is not recognized
        const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig['MEDIUM'];

        return (
            <span className={`px-3 py-1 inline-flex items-center text-sm leading-5 font-medium rounded-full ${config.bg} ${config.text}`}>
                <span className="mr-1">{config.icon}</span> {priority}
            </span>
        );
    };

    // Calculate days remaining
    const calculateDaysRemaining = () => {
        const endDate = new Date(project.end_date);
        const today = new Date();
        const differenceInTime = endDate.getTime() - today.getTime();
        const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));

        return differenceInDays;
    };

    // Format date with better readability
    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Calculate due status
    const getTaskDueStatus = (endDate: string) => {
        const dueDate = new Date(endDate);
        const today = new Date();
        const differenceInTime = dueDate.getTime() - today.getTime();
        const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));

        if (differenceInDays < 0) return { text: 'Overdue', class: 'text-red-600 font-medium' };
        if (differenceInDays === 0) return { text: 'Due today', class: 'text-orange-600 font-medium' };
        if (differenceInDays <= 2) return { text: `Due in ${differenceInDays} day${differenceInDays > 1 ? 's' : ''}`, class: 'text-yellow-600' };
        return { text: `Due in ${differenceInDays} days`, class: 'text-gray-600' };
    };

    const daysRemaining = calculateDaysRemaining();
    const daysRemainingClass =
        daysRemaining < 0 ? 'text-red-600 font-bold' :
            daysRemaining === 0 ? 'text-orange-600 font-bold' :
                daysRemaining <= 2 ? 'text-yellow-600 font-semibold' :
                    'text-green-600';

    return (
        <MainLayout title={project.name}>
            {/* Project Header */}
            <div className="mb-6 bg-white rounded-lg shadow-sm p-5">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div className="mb-4 sm:mb-0">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                            <div className="ml-3">
                                {renderStatusBadge(project.status)}
                            </div>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                            Created on {formatDate(project.created_at)}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link to={`/projects/${id}/edit`}>
                            <Button variant="secondary">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                                Edit Project
                            </Button>
                        </Link>
                        <Button
                            variant="danger"
                            onClick={() => setDeleteModalOpen(true)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Delete Project
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Project Details */}
                    <Card title="Project Details">
                        <div className="prose max-w-none">
                            <p className="text-gray-700 leading-relaxed">
                                {project.description || 'No description provided.'}
                            </p>
                        </div>

                        {/* Timeline Section */}
                        <div className="mt-8">
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Timeline</h3>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <div className="text-sm text-gray-500">Start Date</div>
                                    <div className="text-lg font-medium">
                                        {formatDate(project.start_date)}
                                    </div>
                                </div>
                                <div className="flex-1 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <div className="text-sm text-gray-500">End Date</div>
                                    <div className="text-lg font-medium">
                                        {formatDate(project.end_date)}
                                    </div>
                                </div>
                                <div className="flex-1 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <div className="text-sm text-gray-500">Days Remaining</div>
                                    <div className={`text-lg font-medium ${daysRemainingClass}`}>
                                        {daysRemaining < 0 ? 'Overdue' : daysRemaining === 0 ? 'Due today' : `${daysRemaining} days`}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Progress Section */}
                        <div className="mt-8">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-medium text-gray-900">Progress</h3>
                                <span className="text-sm font-medium text-gray-700">
                                    {project.progress_percentage.toFixed(0)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <div
                                    className={`h-3 rounded-full ${
                                        project.progress_percentage >= 100 ? 'bg-green-600' :
                                            project.progress_percentage >= 70 ? 'bg-blue-600' :
                                                project.progress_percentage >= 30 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{width: `${project.progress_percentage}%`}}
                                ></div>
                            </div>
                            <div className="mt-2 text-sm text-gray-600 flex justify-between">
                                <span>{project.completed_tasks} of {project.total_tasks} tasks completed</span>
                                <span className="font-medium">
                                    {project.progress_percentage >= 100 ? 'Complete!' :
                                        project.progress_percentage >= 70 ? 'Good progress' :
                                            project.progress_percentage >= 30 ? 'In progress' : 'Just started'}
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Tasks Section */}
                    <Card title="Tasks">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-medium text-gray-900">Project Tasks</h3>
                            <Link to={{pathname: '/tasks/new', search: `?project=${id}`}}>
                                <Button size="sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                                    </svg>
                                    Add Task
                                </Button>
                            </Link>
                        </div>

                        {tasks.length === 0 ? (
                            <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                                </svg>
                                <p className="text-gray-500 mb-3">No tasks added to this project yet.</p>
                                <Link to={{pathname: '/tasks/new', search: `?project=${id}`}} className="inline-block">
                                    <Button size="sm" variant="primary">Create First Task</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {tasks.map((task) => {
                                    const dueStatus = getTaskDueStatus(task.end_date);
                                    return (
                                        <div key={task.uuid} className="border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors overflow-hidden">
                                            <Link to={`/tasks/${task.uuid}`} className="block">
                                                <div className="p-4">
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div className="flex-grow">
                                                            <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
                                                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                                                {task.description || 'No description'}
                                                            </p>
                                                            <div className={`text-xs ${dueStatus.class}`}>
                                                                {dueStatus.text} • {formatDate(task.end_date)}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2">
                                                            {renderStatusBadge(task.status)}
                                                            {renderPriorityBadge(task.priority)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`h-1 w-full ${
                                                    task.status === 'COMPLETED' ? 'bg-green-500' :
                                                        task.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-gray-300'
                                                }`}></div>
                                            </Link>
                                        </div>
                                    );
                                })}

                                {project.total_tasks > tasks.length && (
                                    <div className="text-center mt-6">
                                        <Link to={`/projects/${id}/tasks`}>
                                            <Button variant="secondary" size="sm">
                                                View All {project.total_tasks} Tasks
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Project Information */}
                    <Card title="Project Information">
                        <div className="space-y-4 divide-y divide-gray-100">
                            <div className="pt-2">
                                <h4 className="text-sm font-medium text-gray-500">Created</h4>
                                <p className="mt-1 text-gray-800">{new Date(project.created_at).toLocaleString()}</p>
                            </div>
                            <div className="pt-4">
                                <h4 className="text-sm font-medium text-gray-500">Last Updated</h4>
                                <p className="mt-1 text-gray-800">{new Date(project.updated_at).toLocaleString()}</p>
                            </div>
                            <div className="pt-4">
                                <h4 className="text-sm font-medium text-gray-500">Tasks</h4>
                                <p className="mt-1 text-gray-800">
                                    <span className="font-medium">{project.total_tasks}</span> total task(s)
                                    {project.completed_tasks > 0 && (
                                        <span className="ml-2 text-green-600">
                                            (<span className="font-medium">{project.completed_tasks}</span> completed)
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div className="pt-4">
                                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                                <div className="mt-1">
                                    {renderStatusBadge(project.status)}
                                </div>
                            </div>
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

                    {/* Project Timeline Compact View */}
                    <Card title="Project Timeline">
                        <div className="relative pb-8">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-full w-1 bg-gray-200 absolute left-1/2 transform -translate-x-1/2"></div>
                            </div>
                            <div className="relative flex flex-col items-center space-y-8 z-10">
                                <div className="flex items-center w-full">
                                    <div className="flex w-5/12 justify-end pr-4">
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-gray-900">Project Start</div>
                                            <div className="text-sm text-gray-500">{formatDate(project.start_date)}</div>
                                        </div>
                                    </div>
                                    <div className="w-2/12 flex justify-center">
                                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5.5a.75.75 0 001.5 0V5z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="w-5/12 pl-4"></div>
                                </div>
                                <div className="flex items-center w-full">
                                    <div className="w-5/12 justify-end pr-4">
                                    </div>
                                    <div className="w-2/12 flex justify-center">
                                        <div className={`w-8 h-8 rounded-full ${project.status === 'COMPLETED' ? 'bg-green-500' : 'bg-yellow-500'} flex items-center justify-center`}>
                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="w-5/12 pl-4">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">Current Status</div>
                                            <div className="text-sm text-gray-500">{project.status.replace('_', ' ')}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center w-full">
                                    <div className="flex w-5/12 justify-end pr-4">
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-gray-900">Project Deadline</div>
                                            <div className="text-sm text-gray-500">{formatDate(project.end_date)}</div>
                                        </div>
                                    </div>
                                    <div className="w-2/12 flex justify-center">
                                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5.5a.75.75 0 001.5 0V5z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="w-5/12 pl-4"></div>
                                </div>
                            </div>
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
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                        </svg>
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Project</h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Are you sure you want to delete this project? All tasks associated with this project will also be deleted. This action cannot be undone.
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

export default ProjectDetail;