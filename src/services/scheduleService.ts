// src/services/scheduleService.ts
import apiClient from './api';
import {
    ApiResponse,
    Schedule,
    ScheduleCreateRequest,
    ScheduleUpdateRequest,
    PageResponse
} from '../types/api';

const BASE_PATH = '/api/v1/schedules';

export const getAllSchedulesByUser = async (userUuid: string, page = 0, size = 10, sort = 'id,desc') => {
    return apiClient.get<ApiResponse<PageResponse<Schedule>>>(BASE_PATH, {
        params: { userUuid, page, size, sort }
    });
};

export const getSchedule = async (uuid: string) => {
    return apiClient.get<ApiResponse<Schedule>>(`${BASE_PATH}/${uuid}`);
};

export const createSchedule = async (userUuid: string, scheduleData: ScheduleCreateRequest) => {
    return apiClient.post<ApiResponse<Schedule>>(BASE_PATH, scheduleData, {
        params: { userUuid }
    });
};

export const updateSchedule = async (uuid: string, scheduleData: ScheduleUpdateRequest) => {
    return apiClient.put<ApiResponse<Schedule>>(`${BASE_PATH}/${uuid}`, scheduleData);
};

export const deleteSchedule = async (uuid: string) => {
    return apiClient.delete<ApiResponse<void>>(`${BASE_PATH}/${uuid}`);
};

export const getAllSchedulesByUserAndDate = async (userUuid: string, date: string) => {
    return apiClient.get<ApiResponse<Schedule[]>>(`${BASE_PATH}/date`, {
        params: { userUuid, date }
    });
};

export const getAllSchedulesByUserAndDateBetween = async (userUuid: string, startDate: string, endDate: string) => {
    return apiClient.get<ApiResponse<Schedule[]>>(`${BASE_PATH}/between`, {
        params: { userUuid, startDate, endDate }
    });
};

export const findFreeTimeSlots = async (userUuid: string, date: string, duration: number) => {
    return apiClient.get<ApiResponse<{ [key: string]: string }[]>>(`${BASE_PATH}/free-slots`, {
        params: { userUuid, date, duration }
    });
};