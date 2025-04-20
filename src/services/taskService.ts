// src/services/taskService.ts
import apiClient from './api';
import {
    ApiResponse,
    Task,
    TaskCreateRequest,
    TaskUpdateRequest,
    PageResponse
} from '../types/api';

const BASE_PATH = '/api/v1/tasks';

export const getTask = async (uuid: string) => {
    return apiClient.get<ApiResponse<Task>>(`${BASE_PATH}/${uuid}`);
};

export const createTask = async (taskData: TaskCreateRequest) => {
    return apiClient.post<ApiResponse<Task>>(BASE_PATH, taskData);
};

export const updateTask = async (uuid: string, taskData: TaskUpdateRequest) => {
    return apiClient.put<ApiResponse<Task>>(`${BASE_PATH}/${uuid}`, taskData);
};

export const deleteTask = async (uuid: string) => {
    return apiClient.delete<ApiResponse<void>>(`${BASE_PATH}/${uuid}`);
};

export const getTasksByProject = async (projectUuid: string, status?: string, page = 0, size = 10, sort = 'id,desc') => {
    return apiClient.get<ApiResponse<PageResponse<Task>>>(`/api/v1/projects/${projectUuid}/tasks`, {
        params: { status, page, size, sort }
    });
};

export const getHighPriorityTasks = async (userUuid: string) => {
    return apiClient.get<ApiResponse<Task[]>>(`${BASE_PATH}/priority`, {
        params: { userUuid }
    });
};

export const getTasksDueBetweenDates = async (userUuid: string, startDate: string, endDate: string) => {
    return apiClient.get<ApiResponse<Task[]>>(`${BASE_PATH}/due`, {
        params: { userUuid, startDate, endDate }
    });
};