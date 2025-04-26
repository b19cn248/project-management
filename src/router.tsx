// src/router.tsx
import React from 'react';
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';

// Import page components
import Dashboard from './pages/dashboard/Dashboard';
import ProjectList from './pages/projects/ProjectList';
import ProjectDetail from './pages/projects/ProjectDetail';
import ProjectForm from './pages/projects/ProjectForm';
import TaskList from './pages/tasks/TaskList';
import TaskDetail from './pages/tasks/TaskDetail';
import TaskForm from './pages/tasks/TaskForm';
import MeetingList from './pages/meetings/MeetingList';
import MeetingDetail from './pages/meetings/MeetingDetail';
import MeetingForm from './pages/meetings/MeetingForm';
import ScheduleList from './pages/schedules/ScheduleList';
import ScheduleDetail from './pages/schedules/ScheduleDetail';
import ScheduleForm from './pages/schedules/ScheduleForm';
import FileList from './pages/files/FileList';
import FileDetail from './pages/files/FileDetail';

// Import error pages
import NotFound from './pages/errors/NotFound';
import ServerError from './pages/errors/ServerError';

// Import setting pages

const AppRouter: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
                <Route path="/dashboard" element={<Dashboard/>}/>

                {/* Project routes */}
                <Route path="/projects" element={<ProjectList/>}/>
                <Route path="/projects/new" element={<ProjectForm/>}/>
                <Route path="/projects/:id" element={<ProjectDetail/>}/>
                <Route path="/projects/:id/edit" element={<ProjectForm/>}/>
                <Route path="/projects/:id/tasks" element={<TaskList/>}/>

                {/* Task routes */}
                <Route path="/tasks" element={<TaskList/>}/>
                <Route path="/tasks/new" element={<TaskForm/>}/>
                <Route path="/tasks/:id" element={<TaskDetail/>}/>
                <Route path="/tasks/:id/edit" element={<TaskForm/>}/>

                {/* Meeting routes */}
                <Route path="/meetings" element={<MeetingList/>}/>
                <Route path="/meetings/new" element={<MeetingForm/>}/>
                <Route path="/meetings/:id" element={<MeetingDetail/>}/>
                <Route path="/meetings/:id/edit" element={<MeetingForm/>}/>

                {/* Schedule routes */}
                <Route path="/schedules" element={<ScheduleList/>}/>
                <Route path="/schedules/new" element={<ScheduleForm/>}/>
                <Route path="/schedules/:id" element={<ScheduleDetail/>}/>
                <Route path="/schedules/:id/edit" element={<ScheduleForm/>}/>

                {/* File routes */}
                <Route path="/files" element={<FileList/>}/>
                <Route path="/files/:id" element={<FileDetail/>}/>

                {/* Error routes */}
                <Route path="/error/500" element={<ServerError/>}/>
                <Route path="*" element={<NotFound/>}/>
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;