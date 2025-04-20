// src/pages/dashboard/Dashboard.tsx
import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import {getActiveProjects} from '../../services/projectService';
import {getHighPriorityTasks} from '../../services/taskService';
import {Project, Task} from '../../types/api';

const Dashboard: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // For now, we'll hardcode a user ID
    const userUuid = '123e4567-e89b-12d3-a456-426614174000';

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [projectsResponse, tasksResponse] = await Promise.all([
                    getActiveProjects(userUuid),
                    getHighPriorityTasks(userUuid)
                ]);

                // src/pages/dashboard/Dashboard.tsx (continued)
                setProjects(projectsResponse.data.data);
                setTasks(tasksResponse.data.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [userUuid]);

    return (
        <MainLayout title="Dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Active Projects Card */}
                <Card
                    title="Active Projects"
                    className="col-span-1 md:col-span-2 lg:col-span-2"
                    footer={
                        <Link to="/projects">
                            <Button variant="secondary" size="sm">View All Projects</Button>
                        </Link>
                    }
                >
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <p>Loading projects...</p>
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="text-center py-6">
                            <p className="text-gray-500">No active projects</p>
                            <Link to="/projects/new" className="mt-2 inline-block">
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
                                    <Link to={`/projects/${project.uuid}`}>
                                        <h3 className="font-medium text-lg text-gray-900">{project.name}</h3>
                                        <div className="mt-2 flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {project.completed_tasks} of {project.total_tasks} tasks completed
                      </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                project.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                    project.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                            }`}>
                        {project.status}
                      </span>
                                        </div>
                                        <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className="bg-blue-600 h-2.5 rounded-full"
                                                style={{width: `${project.progress_percentage}%`}}
                                            ></div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                            {projects.length > 5 && (
                                <div className="text-center mt-4">
                                    <Link to="/projects">
                                        <Button variant="secondary" size="sm">View All ({projects.length})</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </Card>

                {/* High Priority Tasks Card */}
                <Card
                    title="High Priority Tasks"
                    className="col-span-1"
                    footer={
                        <Link to="/tasks">
                            <Button variant="secondary" size="sm">View All Tasks</Button>
                        </Link>
                    }
                >
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <p>Loading tasks...</p>
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="text-center py-6">
                            <p className="text-gray-500">No high priority tasks</p>
                            <Link to="/tasks/new" className="mt-2 inline-block">
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
                                    <Link to={`/tasks/${task.uuid}`}>
                                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                                        <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-500">
                        Due: {new Date(task.end_date).toLocaleDateString()}
                      </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                task.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                                                    task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-green-100 text-green-800'
                                            }`}>
                        {task.priority}
                      </span>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                            {tasks.length > 5 && (
                                <div className="text-center mt-2">
                                    <Link to="/tasks">
                                        <Button variant="secondary" size="sm">View All ({tasks.length})</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </Card>
            </div>
        </MainLayout>
    );
};

export default Dashboard;