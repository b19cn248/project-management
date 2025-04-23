// src/types/api.ts

// Common Types
export interface ApiResponse<T> {
    success: boolean;
    code: string;
    message: string;
    data: T;
}

export interface PageResponse<T> {
    items: T[];
    page_number: number;
    page_size: number;
    total_elements: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
}

// User Types
export interface User {
    uuid: string;
    name: string;
    email: string;
    reminder_settings: string;
    created_at: string;
    updated_at: string;
}

export interface UserCreateRequest {
    name: string;
    email: string;
    password: string;
    reminder_settings?: string;
}

export interface UserUpdateRequest {
    name?: string;
    email?: string;
    password?: string;
    reminder_settings?: string;
}

// Project Types
export interface Project {
    uuid: string;
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    status: string;
    completed_tasks: number;
    total_tasks: number;
    progress_percentage: number;
    created_at: string;
    updated_at: string;
}

export interface ProjectCreateRequest {
    name: string;
    description?: string;
    start_date: string;
    end_date: string;
    status: string;
}

export interface ProjectUpdateRequest {
    name?: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    status?: string;
}

// Task Types
export interface Task {
    uuid: string;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    priority: string;
    status: string;
    project_uuid: string;
    project_name: string;
    created_at: string;
    updated_at: string;
}

export interface TaskCreateRequest {
    title: string;
    description?: string;
    start_date: string;
    end_date: string;
    priority: string;
    status: string;
    project_uuid: string;
}

export interface TaskUpdateRequest {
    title?: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    priority?: string;
    status?: string;
    project_uuid: string;
}

// Time Type
export interface LocalTime {
    hour: number;
    minute: number;
    second: number;
    nano: number;
}

// Meeting Types
export interface Meeting {
    uuid: string;
    title: string;
    description: string;
    meeting_date: string;
    start_time: LocalTime;
    end_time: LocalTime;
    participants: string;
    created_at: string;
    updated_at: string;
}

export interface MeetingCreateRequest {
    title: string;
    description?: string;
    meeting_date: string;
    start_time: LocalTime;
    end_time: LocalTime;
    participants?: string;
}

export interface MeetingUpdateRequest {
    title?: string;
    description?: string;
    meeting_date?: string;
    start_time?: LocalTime;
    end_time?: LocalTime;
    participants?: string;
}

// Schedule Types
export interface Schedule {
    uuid: string;
    schedule_date: string;
    start_time: LocalTime;
    end_time: LocalTime;
    task_uuid: string;
    meeting_uuid: string;
    task_title: string;
    meeting_title: string;
    created_at: string;
    updated_at: string;
}

export interface ScheduleCreateRequest {
    schedule_date: string;
    start_time: LocalTime;
    end_time: LocalTime;
    task_uuid?: string;
    meeting_uuid?: string;
}

export interface ScheduleUpdateRequest {
    schedule_date?: string;
    start_time?: LocalTime;
    end_time?: LocalTime;
    task_uuid?: string;
    meeting_uuid?: string;
}

// File Types
export interface File {
    uuid: string;
    file_name: string;
    file_path: string;
    file_size: number;
    content_type: string;
    task_uuid: string;
    project_uuid: string;
    created_at: string;
    updated_at: string;
}

export interface FileUploadRequest {
    task_uuid?: string;
    project_uuid?: string;
}