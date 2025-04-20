// src/services/fileService.ts
import apiClient from './api';
import {
    ApiResponse,
    File,
    FileUploadRequest,
    PageResponse
} from '../types/api';

const BASE_PATH = '/api/v1/files';

export const getFile = async (uuid: string) => {
    return apiClient.get<ApiResponse<File>>(`${BASE_PATH}/${uuid}`);
};

export const uploadFile = async (file: FormData) => {
    return apiClient.post<ApiResponse<File>>(`${BASE_PATH}/upload`, file, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const associateFile = async (uuid: string, data: FileUploadRequest) => {
    return apiClient.post<ApiResponse<File>>(`${BASE_PATH}/${uuid}/associate`, data);
};

export const deleteFile = async (uuid: string) => {
    return apiClient.delete<ApiResponse<void>>(`${BASE_PATH}/${uuid}`);
};

export const downloadFile = async (uuid: string) => {
    return apiClient.get<Blob>(`${BASE_PATH}/${uuid}/download`, {
        responseType: 'blob'
    });
};

export const getAllFilesByUser = async (userUuid: string, page = 0, size = 10, sort = 'id,desc') => {
    return apiClient.get<ApiResponse<PageResponse<File>>>(`${BASE_PATH}/user/${userUuid}`, {
        params: { page, size, sort }
    });
};

export const getAllFilesByTask = async (taskUuid: string, page = 0, size = 10, sort = 'id,desc') => {
    return apiClient.get<ApiResponse<PageResponse<File>>>(`${BASE_PATH}/task/${taskUuid}`, {
        params: { page, size, sort }
    });
};

export const getAllFilesByProject = async (projectUuid: string, page = 0, size = 10, sort = 'id,desc') => {
    return apiClient.get<ApiResponse<PageResponse<File>>>(`${BASE_PATH}/project/${projectUuid}`, {
        params: { page, size, sort }
    });
};