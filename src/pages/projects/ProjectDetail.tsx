// src/pages/projects/ProjectDetail.tsx
import React, {useEffect, useState} from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import {deleteProject, getProject} from '../../services/projectService';
import {getTasksByProject} from '../../services/taskService';
import {Project, Task} from '../../types/api';

const ProjectDetail: React.FC = () => {
    const {id} = useParams<{ id: string }>();
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
                    <p>Loading project data...</p>
                </div>
            </MainLayout>
        );
    }

    if (!project) {
        return (
            <MainLayout title="Project Not Found">
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900">Project not found</h2>
                    <p className="mt-2 text-gray-600">The project you're looking for doesn't exist or has been
                        removed.</p>
                    <Link to="/projects" className="mt-4 inline-block">
                        <Button variant="primary">Back to Projects</Button>
                    </Link>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout title={project.name}>
            <div className="mb-6 flex justify-between items-center">
                <div>
          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
              project.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  project.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
          }`}>
            {project.status}
          </span>
                </div>
                <div className="space-x-3">
                    <Link to={`/projects/${id}/edit`}>
                        <Button variant="secondary">
                            Edit Project
                        </Button>
                    </Link>
                    <Button
                        variant="danger"
                        onClick={() => setDeleteModalOpen(true)}
                    >
                        Delete Project
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card title="Project Details">
                        <div className="prose max-w-none">
                            <p>{project.description || 'No description provided.'}</p>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Timeline</h3>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                                    <div className="text-sm text-gray-500">Start Date</div>
                                    <div className="text-lg font-medium">
                                        {new Date(project.start_date).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                                    <div className="text-sm text-gray-500">End Date</div>
                                    <div className="text-lg font-medium">
                                        {new Date(project.end_date).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Progress</h3>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-blue-600 h-2.5 rounded-full"
                                    style={{width: `${project.progress_percentage}%`}}
                                ></div>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                                {project.completed_tasks} of {project.total_tasks} tasks completed
                                ({project.progress_percentage.toFixed(0)}%)
                            </div>
                        </div>
                    </Card>

                    <Card title="Tasks" className="mt-6">
                        <div className="mb-4">
                            <Link to={{pathname: '/tasks/new', search: `?project=${id}`}}>
                                <Button size="sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20"
                                         fill="currentColor">
                                        <path fillRule="evenodd"
                                              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                              clipRule="evenodd"/>
                                    </svg>
                                    Add Task
                                </Button>
                            </Link>
                        </div>

                        {tasks.length === 0 ? (
                            // src/pages/projects/ProjectDetail.tsx (continued)
                            <div className="text-center py-6">
                                <p className="text-gray-500">No tasks added to this project yet.</p>
                                <Link to={{pathname: '/tasks/new', search: `?project=${id}`}}
                                      className="mt-2 inline-block">
                                    <Button size="sm">Add First Task</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {tasks.map((task) => (
                                    <div key={task.uuid}
                                         className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                        <Link to={`/tasks/${task.uuid}`}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description || 'No description'}</p>
                                                </div>
                                                <div className="flex flex-col items-end">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                  task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-800'
                          }`}>
                            {task.status}
                          </span>
                                                    <span className={`mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                                                        task.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                                                            task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-green-100 text-green-800'
                                                    }`}>
                            {task.priority}
                          </span>
                                                </div>
                                            </div>
                                            <div
                                                className="flex justify-between items-center mt-2 text-sm text-gray-500">
                                                <div>Due: {new Date(task.end_date).toLocaleDateString()}</div>
                                            </div>
                                        </Link>
                                    </div>
                                ))}

                                <div className="text-center mt-4">
                                    <Link to={`/projects/${id}/tasks`}>
                                        <Button variant="secondary" size="sm">View All Tasks</Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    <Card title="Project Information">
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Created</h4>
                                <p className="mt-1">{new Date(project.created_at).toLocaleString()}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Last Updated</h4>
                                <p className="mt-1">{new Date(project.updated_at).toLocaleString()}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Tasks</h4>
                                <p className="mt-1">{project.total_tasks} total task(s)</p>
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
                    <div
                        className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <div
                            className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div
                                        className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg"
                                             fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                        </svg>
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Project</h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Are you sure you want to delete this project? All tasks associated with
                                                this project will also be deleted. This action cannot be undone.
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

export default ProjectDetail;