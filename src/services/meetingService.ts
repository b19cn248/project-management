// src/services/meetingService.ts
import apiClient from './api';
import {
    ApiResponse,
    Meeting,
    MeetingCreateRequest,
    MeetingUpdateRequest,
    PageResponse
} from '../types/api';

const BASE_PATH = '/api/v1/meetings';

export const getAllMeetingsByUser = async (userUuid: string, page = 0, size = 10, sort = 'id,desc') => {
    return apiClient.get<ApiResponse<PageResponse<Meeting>>>(BASE_PATH, {
        params: { userUuid, page, size, sort }
    });
};

export const getMeeting = async (uuid: string) => {
    return apiClient.get<ApiResponse<Meeting>>(`${BASE_PATH}/${uuid}`);
};

export const createMeeting = async (userUuid: string, meetingData: MeetingCreateRequest) => {
    return apiClient.post<ApiResponse<Meeting>>(BASE_PATH, meetingData, {
        params: { userUuid }
    });
};

export const updateMeeting = async (uuid: string, meetingData: MeetingUpdateRequest) => {
    return apiClient.put<ApiResponse<Meeting>>(`${BASE_PATH}/${uuid}`, meetingData);
};

export const deleteMeeting = async (uuid: string) => {
    return apiClient.delete<ApiResponse<void>>(`${BASE_PATH}/${uuid}`);
};

export const getAllMeetingsByUserAndDate = async (userUuid: string, date: string) => {
    return apiClient.get<ApiResponse<Meeting[]>>(`${BASE_PATH}/date`, {
        params: { userUuid, date }
    });
};

export const getAllMeetingsByUserAndDateBetween = async (userUuid: string, startDate: string, endDate: string) => {
    return apiClient.get<ApiResponse<Meeting[]>>(`${BASE_PATH}/between`, {
        params: { userUuid, startDate, endDate }
    });
};