// src/services/projectService.ts
import apiClient from './api';
import {
    ApiResponse,
    Project,
    ProjectCreateRequest,
    ProjectUpdateRequest,
    PageResponse
} from '../types/api';

const BASE_PATH = '/api/v1/projects';

export const getProjects = async (userUuid: string, status?: string, page = 0, size = 10, sort = 'id,desc') => {
    return apiClient.get<ApiResponse<PageResponse<Project>>>(BASE_PATH, {
        params: { userUuid, status, page, size, sort }
    });
};

export const getProject = async (uuid: string) => {
    return apiClient.get<ApiResponse<Project>>(`${BASE_PATH}/${uuid}`);
};

export const createProject = async (userUuid: string, projectData: ProjectCreateRequest) => {
    return apiClient.post<ApiResponse<Project>>(BASE_PATH, projectData, {
        params: { userUuid }
    });
};

export const updateProject = async (uuid: string, projectData: ProjectUpdateRequest) => {
    return apiClient.put<ApiResponse<Project>>(`${BASE_PATH}/${uuid}`, projectData);
};

export const deleteProject = async (uuid: string) => {
    return apiClient.delete<ApiResponse<void>>(`${BASE_PATH}/${uuid}`);
};

export const getActiveProjects = async (userUuid: string) => {
    return apiClient.get<ApiResponse<Project[]>>(`${BASE_PATH}/active`, {
        params: { userUuid }
    });
};