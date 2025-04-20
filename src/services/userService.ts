// src/services/userService.ts
import apiClient from './api';
import { ApiResponse, User, UserCreateRequest, UserUpdateRequest, PageResponse } from '../types/api';

const BASE_PATH = '/api/v1/users';

export const getUsers = async (page = 0, size = 10, sort = 'id,desc') => {
    return apiClient.get<ApiResponse<PageResponse<User>>>(BASE_PATH, {
        params: { page, size, sort }
    });
};

export const getUser = async (uuid: string) => {
    return apiClient.get<ApiResponse<User>>(`${BASE_PATH}/${uuid}`);
};

export const createUser = async (userData: UserCreateRequest) => {
    return apiClient.post<ApiResponse<User>>(BASE_PATH, userData);
};

export const updateUser = async (uuid: string, userData: UserUpdateRequest) => {
    return apiClient.put<ApiResponse<User>>(`${BASE_PATH}/${uuid}`, userData);
};

export const deleteUser = async (uuid: string) => {
    return apiClient.delete<ApiResponse<void>>(`${BASE_PATH}/${uuid}`);
};