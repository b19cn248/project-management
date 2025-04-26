// src/pages/dashboard/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getActiveProjects } from '../../services/projectService';
import { getHighPriorityTasks } from '../../services/taskService';
import { getTasksDueBetweenDates } from '../../services/taskService';
import { Project, Task } from '../../types/api';
import { Doughnut, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [projectStats, setProjectStats] = useState({
        completed: 0,
        inProgress: 0,
        planned: 0,
    });
    const [taskStats, setTaskStats] = useState({
        completed: 0,
        inProgress: 0,
        pending: 0,
    });

    // For now, we'll hardcode a user ID
    const userUuid = '550e8400-e29b-41d4-a716-446655440000';

    // Get date range for upcoming tasks (next 7 days)
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [projectsResponse, tasksResponse, upcomingTasksResponse] = await Promise.all([
                    getActiveProjects(userUuid),
                    getHighPriorityTasks(userUuid),
                    getTasksDueBetweenDates(userUuid, formatDate(today), formatDate(nextWeek))
                ]);

                // Set data
                const projectsData = projectsResponse.data.data;
                setProjects(projectsData);
                setTasks(tasksResponse.data.data);
                setUpcomingTasks(upcomingTasksResponse.data.data);

                // Calculate stats for projects
                const projectStatusCounts = {
                    completed: projectsData.filter((p: Project) => p.status === 'COMPLETED').length,
                    inProgress: projectsData.filter((p: Project) => p.status === 'IN_PROGRESS').length,
                    planned: projectsData.filter((p: Project) => p.status === 'PLANNED').length,
                };
                setProjectStats(projectStatusCounts);

                // Calculate stats for tasks
                const allTasks = [...tasksResponse.data.data, ...upcomingTasksResponse.data.data];
                const uniqueTasks = Array.from(new Set(allTasks.map(task => task.uuid)))
                    .map(uuid => allTasks.find(task => task.uuid === uuid));

                const taskStatusCounts = {
                    completed: uniqueTasks.filter((t: any) => t.status === 'COMPLETED').length,
                    inProgress: uniqueTasks.filter((t: any) => t.status === 'IN_PROGRESS').length,
                    pending: uniqueTasks.filter((t: any) => t.status === 'PENDING').length,
                };
                setTaskStats(taskStatusCounts);

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [userUuid]);

    // Chart data for projects status
    const projectChartData = {
        labels: ['Completed', 'In Progress', 'Planned'],
        datasets: [
            {
                data: [projectStats.completed, projectStats.inProgress, projectStats.planned],
                backgroundColor: ['#10B981', '#3B82F6', '#9CA3AF'],
                borderColor: ['#FFFFFF', '#FFFFFF', '#FFFFFF'],
                borderWidth: 2,
            },
        ],
    };

    // Chart data for tasks status
    const taskChartData = {
        labels: ['Completed', 'In Progress', 'Pending'],
        datasets: [
            {
                data: [taskStats.completed, taskStats.inProgress, taskStats.pending],
                backgroundColor: ['#10B981', '#3B82F6', '#F59E0B'],
                borderColor: ['#FFFFFF', '#FFFFFF', '#FFFFFF'],
                borderWidth: 2,
            },
        ],
    };

    // Chart options
    const chartOptions = {
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    boxWidth: 15,
                    padding: 15,
                },
            },
        },
        maintainAspectRatio: false,
        cutout: '70%',
    };

    // Format date for UI
    const formatDateForDisplay = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Get status badge class
    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-100 text-green-800';
            case 'IN_PROGRESS':
                return 'bg-blue-100 text-blue-800';
            case 'PLANNED':
            case 'PENDING':
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Get priority badge class
    const getPriorityBadgeClass = (priority: string) => {
        switch (priority) {
            case 'HIGH':
                return 'bg-red-100 text-red-800';
            case 'MEDIUM':
                return 'bg-yellow-100 text-yellow-800';
            case 'LOW':
            default:
                return 'bg-green-100 text-green-800';
        }
    };

    return (
        <MainLayout title="Dashboard">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-500">Total Projects</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {projects.length}
                        </span>
                    </div>
                    <div className="text-2xl font-bold">{projects.length}</div>
                    <div className="mt-1 text-sm text-gray-500">
                        {projectStats.inProgress} active
                    </div>
                </Card>

                <Card className="flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-500">High Priority Tasks</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {tasks.length}
                        </span>
                    </div>
                    <div className="text-2xl font-bold">{tasks.length}</div>
                    <div className="mt-1 text-sm text-gray-500">
                        {tasks.filter(t => t.status !== 'COMPLETED').length} pending
                    </div>
                </Card>

                <Card className="flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-500">Project Completion</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {projectStats.completed}
                        </span>
                    </div>
                    <div className="text-2xl font-bold">
                        {projects.length > 0
                            ? `${Math.round((projectStats.completed / projects.length) * 100)}%`
                            : '0%'
                        }
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                        {projectStats.completed} of {projects.length} completed
                    </div>
                </Card>

                <Card className="flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-500">Upcoming Tasks</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {upcomingTasks.length}
                        </span>
                    </div>
                    <div className="text-2xl font-bold">{upcomingTasks.length}</div>
                    <div className="mt-1 text-sm text-gray-500">
                        Due in the next 7 days
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Projects & Tasks */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Active Projects Card */}
                    <Card
                        title="Active Projects"
                        headerAction={
                            <Link to="/projects">
                                <Button variant="outline" size="sm">View All</Button>
                            </Link>
                        }
                        loading={loading}
                    >
                        {projects.length === 0 ? (
                            <div className="text-center py-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-gray-500 mb-3">No active projects</p>
                                <Link to="/projects/new">
                                    <Button size="sm">Create New Project</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {projects.slice(0, 5).map((project) => (
                                    <div
                                        key={project.uuid}
                                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <Link to={`/projects/${project.uuid}`} className="block">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-medium text-gray-900 mb-1">{project.name}</h3>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(project.status)}`}>
                                                    {project.status.replace('_', ' ')}
                                                </span>
                                            </div>

                                            <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                                                {project.description || 'No description'}
                                            </p>

                                            <div className="flex justify-between items-center mb-2 text-sm">
                                                <span className="text-gray-500">
                                                    {project.completed_tasks} of {project.total_tasks} tasks
                                                </span>
                                                <span className="text-gray-500">
                                                    {formatDateForDisplay(project.end_date)}
                                                </span>
                                            </div>

                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${
                                                        project.progress_percentage >= 100 ? 'bg-green-500' :
                                                            project.progress_percentage >= 66 ? 'bg-blue-500' :
                                                                project.progress_percentage >= 33 ? 'bg-yellow-500' :
                                                                    'bg-red-500'
                                                    }`}
                                                    style={{ width: `${project.progress_percentage}%` }}
                                                ></div>
                                            </div>
                                        </Link>
                                    </div>
                                ))}

                                {projects.length > 5 && (
                                    <div className="text-center mt-4">
                                        <Link to="/projects">
                                            <Button variant="outline" size="sm">View All Projects ({projects.length})</Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>

                    {/* High Priority Tasks Card */}
                    <Card
                        title="High Priority Tasks"
                        headerAction={
                            <Link to="/tasks">
                                <Button variant="outline" size="sm">View All</Button>
                            </Link>
                        }
                        loading={loading}
                    >
                        {tasks.length === 0 ? (
                            <div className="text-center py-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                                <p className="text-gray-500 mb-3">No high priority tasks</p>
                                <Link to="/tasks/new">
                                    <Button size="sm">Create New Task</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {tasks.slice(0, 5).map((task) => (
                                    <div
                                        key={task.uuid}
                                        className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                                    >
                                        <Link to={`/tasks/${task.uuid}`} className="block">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
                                                <div className="flex flex-col gap-1 items-end">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeClass(task.priority)}`}>
                                                        {task.priority}
                                                    </span>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(task.status)}`}>
                                                        {task.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center mt-2 text-sm">
                                                <span className="flex items-center text-gray-500">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    Due: {formatDateForDisplay(task.end_date)}
                                                </span>
                                                <span className="text-xs text-blue-600 hover:text-blue-800">
                                                    {task.project_name}
                                                </span>
                                            </div>
                                        </Link>
                                    </div>
                                ))}

                                {tasks.length > 5 && (
                                    <div className="text-center mt-2">
                                        <Link to="/tasks">
                                            <Button variant="outline" size="sm">View All Tasks ({tasks.length})</Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right Column - Analytics & Summary */}
                <div className="space-y-6">
                    {/* Project Status Chart Card */}
                    <Card title="Project Status" loading={loading}>
                        <div className="h-64">
                            {projects.length === 0 ? (
                                <div className="h-full flex items-center justify-center">
                                    <p className="text-gray-500">No project data available</p>
                                </div>
                            ) : (
                                <Doughnut data={projectChartData} options={chartOptions} />
                            )}
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                            <div className="bg-gray-50 p-2 rounded">
                                <div className="text-xs font-medium text-gray-500">Planned</div>
                                <div className="text-lg font-semibold text-gray-700">{projectStats.planned}</div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                                <div className="text-xs font-medium text-gray-500">In Progress</div>
                                <div className="text-lg font-semibold text-blue-700">{projectStats.inProgress}</div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                                <div className="text-xs font-medium text-gray-500">Completed</div>
                                <div className="text-lg font-semibold text-green-700">{projectStats.completed}</div>
                            </div>
                        </div>
                    </Card>

                    {/* Upcoming Tasks Card */}
                    <Card title="Upcoming Due Dates" loading={loading}>
                        {upcomingTasks.length === 0 ? (
                            <div className="text-center py-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-gray-500">No upcoming tasks</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {upcomingTasks.slice(0, 5).map((task) => {
                                    // Calculate days until due
                                    const dueDate = new Date(task.end_date);
                                    const currentDate = new Date();
                                    const diffTime = dueDate.getTime() - currentDate.getTime();
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                                    let dueBadge = '';
                                    if (diffDays < 0) {
                                        dueBadge = 'bg-red-100 text-red-800';
                                    } else if (diffDays === 0) {
                                        dueBadge = 'bg-orange-100 text-orange-800';
                                    } else if (diffDays <= 2) {
                                        dueBadge = 'bg-yellow-100 text-yellow-800';
                                    } else {
                                        dueBadge = 'bg-blue-100 text-blue-800';
                                    }

                                    const dueText = diffDays < 0
                                        ? 'Overdue'
                                        : diffDays === 0
                                            ? 'Today'
                                            : diffDays === 1
                                                ? 'Tomorrow'
                                                : `${diffDays} days`;

                                    return (
                                        <div key={task.uuid} className="flex items-center p-3 border border-gray-200 rounded-lg">
                                            <div className="mr-4 flex-shrink-0">
                                                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-800">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <Link to={`/tasks/${task.uuid}`} className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate">
                                                    {task.title}
                                                </Link>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {formatDateForDisplay(task.end_date)}
                                                </p>
                                            </div>
                                            <div>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${dueBadge}`}>
                                                    {dueText}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}

                                {upcomingTasks.length > 5 && (
                                    <div className="text-center mt-2">
                                        <Link to="/tasks">
                                            <Button variant="outline" size="sm">View All Tasks</Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>

                    {/* Quick Actions Card */}
                    <Card title="Quick Actions">
                        <div className="grid grid-cols-2 gap-3">
                            <Link to="/projects/new">
                                <Button variant="primary" fullWidth className="flex justify-center items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    New Project
                                </Button>
                            </Link>
                            <Link to="/tasks/new">
                                <Button variant="primary" fullWidth className="flex justify-center items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    New Task
                                </Button>
                            </Link>
                            <Link to="/meetings/new">
                                <Button variant="secondary" fullWidth className="flex justify-center items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                    </svg>
                                    New Meeting
                                </Button>
                            </Link>
                            <Link to="/schedules/new">
                                <Button variant="secondary" fullWidth className="flex justify-center items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                    New Schedule
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
};

export default Dashboard;