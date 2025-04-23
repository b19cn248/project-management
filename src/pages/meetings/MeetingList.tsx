// src/pages/meetings/MeetingList.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getAllMeetingsByUserAndDateBetween } from '../../services/meetingService';
import { Meeting } from '../../types/api';

const MeetingList: React.FC = () => {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
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
        const fetchMeetings = async () => {
            try {
                setLoading(true);
                const response = await getAllMeetingsByUserAndDateBetween(userUuid, startDate, endDate);
                setMeetings(response.data.data);
            } catch (error) {
                console.error('Error fetching meetings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMeetings();
    }, [userUuid, startDate, endDate]);

    // Group meetings by date
    const groupedMeetings: { [date: string]: Meeting[] } = {};
    meetings.forEach(meeting => {
        if (!groupedMeetings[meeting.meeting_date]) {
            groupedMeetings[meeting.meeting_date] = [];
        }
        groupedMeetings[meeting.meeting_date].push(meeting);
    });

    // Helper function to format time
    const formatTime = (time: { hour: number; minute: number }) => {
        return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
    };

    return (
        <MainLayout title="Meetings">
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

                <Link to="/meetings/new">
                    <Button>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        New Meeting
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <p>Loading meetings...</p>
                </div>
            ) : Object.keys(groupedMeetings).length === 0 ? (
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
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No meetings</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            No meetings found for the selected date range.
                        </p>
                        <div className="mt-6">
                            <Link to="/meetings/new">
                                <Button>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    Create Meeting
                                </Button>
                            </Link>
                        </div>
                    </div>
                </Card>
            ) : (
                <div className="space-y-6">
                    {Object.keys(groupedMeetings).sort().map(date => (
                        <Card key={date} title={new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}>
                            <div className="space-y-4">
                                {groupedMeetings[date].map(meeting => (
                                    <div
                                        key={meeting.uuid}
                                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <Link to={`/meetings/${meeting.uuid}`}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{meeting.title}</h4>
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        {formatTime(meeting.start_time)} - {formatTime(meeting.end_time)}
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                                {meeting.description || 'No description'}
                                            </p>
                                            {meeting.participants && (
                                                <div className="mt-3 text-sm text-gray-500">
                                                    <span className="font-medium">Participants:</span> {meeting.participants}
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

export default MeetingList;