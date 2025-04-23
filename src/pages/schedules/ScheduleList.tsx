// src/pages/schedules/ScheduleList.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getAllSchedulesByUserAndDateBetween } from '../../services/scheduleService';
import { Schedule } from '../../types/api';

const ScheduleList: React.FC = () => {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // For now, we'll hardcode a user ID
    const userUuid = '550e8400-e29b-41d4-a716-446655440000';

    // Default date range is the current week
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(today);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const [startDate, setStartDate] = useState<string>(startOfWeek.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState<string>(endOfWeek.toISOString().split('T')[0]);

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                setLoading(true);
                const response = await getAllSchedulesByUserAndDateBetween(userUuid, startDate, endDate);
                setSchedules(response.data.data);
            } catch (error) {
                console.error('Error fetching schedules:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedules();
    }, [userUuid, startDate, endDate]);

    // Group schedules by date
    const groupedSchedules: { [date: string]: Schedule[] } = {};
    schedules.forEach(schedule => {
        if (!groupedSchedules[schedule.schedule_date]) {
            groupedSchedules[schedule.schedule_date] = [];
        }
        groupedSchedules[schedule.schedule_date].push(schedule);
    });

    // Helper function to format time
    const formatTime = (time: { hour: number; minute: number }) => {
        return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
    };

    return (
        <MainLayout title="Schedule">
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div>
                        <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                        </label>
                        <input
                            type="date"
                            id="start-date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                            End Date
                        </label>
                        <input
                            type="date"
                            id="end-date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <Link to="/schedules/new">
                    <Button>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        New Schedule
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <p>Loading schedules...</p>
                </div>
            ) : Object.keys(groupedSchedules).length === 0 ? (
                <Card>
                    <div className="text-center py-12">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No schedules</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            No schedules found for the selected date range.
                        </p>
                        <div className="mt-6">
                            <Link to="/schedules/new">
                                <Button>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    Create Schedule
                                </Button>
                            </Link>
                        </div>
                    </div>
                </Card>
            ) : (
                <div className="space-y-6">
                    {Object.keys(groupedSchedules).sort().map(date => (
                        <Card key={date} title={new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}>
                            <div className="space-y-4">
                                {groupedSchedules[date].map(schedule => (
                                    <div
                                        key={schedule.uuid}
                                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <Link to={`/schedules/${schedule.uuid}`}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">
                                                        {schedule.task_title || schedule.meeting_title || 'Untitled'}
                                                    </h4>
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                                                    </div>
                                                </div>
                                                <div>
                                                    {schedule.task_uuid ? (
                                                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                              Task
                            </span>
                                                    ) : schedule.meeting_uuid ? (
                                                        <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                              Meeting
                            </span>
                                                    ) : (
                                                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                              Free Time
                            </span>
                                                    )}
                                                </div>
                                            </div>
                                            {schedule.task_uuid && (
                                                <div className="mt-2">
                                                    <Link
                                                        to={`/tasks/${schedule.task_uuid}`}
                                                        className="text-sm text-blue-600 hover:text-blue-800"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        View Task
                                                    </Link>
                                                </div>
                                            )}
                                            {schedule.meeting_uuid && (
                                                <div className="mt-2">
                                                    <Link
                                                        to={`/meetings/${schedule.meeting_uuid}`}
                                                        className="text-sm text-blue-600 hover:text-blue-800"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        View Meeting
                                                    </Link>
                                                </div>
                                            )}
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </MainLayout>
    );
};

export default ScheduleList;