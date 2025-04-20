// src/pages/schedules/ScheduleForm.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { createSchedule, getSchedule, updateSchedule } from '../../services/scheduleService';
import { getHighPriorityTasks } from '../../services/taskService';
import { ScheduleCreateRequest, ScheduleUpdateRequest, Task } from '../../types/api';

const ScheduleForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState<ScheduleCreateRequest | ScheduleUpdateRequest>({
        schedule_date: new Date().toISOString().split('T')[0],
        start_time: { hour: 9, minute: 0, second: 0, nano: 0 },
        end_time: { hour: 10, minute: 0, second: 0, nano: 0 },
        task_uuid: '',
        meeting_uuid: ''
    });

    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [submitLoading, setSubmitLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [scheduleType, setScheduleType] = useState<'task' | 'meeting' | 'free'>('task');

    // For now, we'll hardcode a user ID
    const userUuid = '123e4567-e89b-12d3-a456-426614174000';

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await getHighPriorityTasks(userUuid);
                setTasks(response.data.data);
            } catch (error) {
                console.error('Error fetching tasks:', error);
            }
        };

        fetchTasks();
    }, [userUuid]);

    useEffect(() => {
        const fetchSchedule = async () => {
            if (isEditMode && id) {
                try {
                    setLoading(true);
                    const response = await getSchedule(id);
                    const schedule = response.data.data;

                    setFormData({
                        schedule_date: schedule.schedule_date,
                        start_time: schedule.start_time,
                        end_time: schedule.end_time,
                        task_uuid: schedule.task_uuid,
                        meeting_uuid: schedule.meeting_uuid
                    });

                    if (schedule.task_uuid) {
                        setScheduleType('task');
                    } else if (schedule.meeting_uuid) {
                        setScheduleType('meeting');
                    } else {
                        setScheduleType('free');
                    }
                } catch (error) {
                    console.error('Error fetching schedule:', error);
                    setError('Failed to load schedule data.');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchSchedule();
    }, [id, isEditMode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const [hours, minutes] = value.split(':').map(Number);

        setFormData((prev) => ({
            ...prev,
            [name]: {
                hour: hours,
                minute: minutes,
                second: 0,
                nano: 0
            }
        }));
    };

    const handleScheduleTypeChange = (type: 'task' | 'meeting' | 'free') => {
        setScheduleType(type);

        // Reset related fields
        setFormData((prev) => ({
            ...prev,
            task_uuid: type === 'task' ? prev.task_uuid : '',
            meeting_uuid: type === 'meeting' ? prev.meeting_uuid : ''
        }));
    };

    const formatTimeForInput = (time: { hour: number; minute: number }) => {
        return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            setSubmitLoading(true);

            if (isEditMode && id) {
                await updateSchedule(id, formData as ScheduleUpdateRequest);
            } else {
                await createSchedule(userUuid, formData as ScheduleCreateRequest);
            }

            navigate('/schedules');
        } catch (error) {
            console.error('Error saving schedule:', error);
            setError('Failed to save schedule. Please try again.');
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <MainLayout title={isEditMode ? 'Edit Schedule' : 'Create New Schedule'}>
            <Card>
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <p>Loading schedule data...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                                <div className="flex">
                                    <div>
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <Input
                                type="date"
                                id="schedule_date"
                                name="schedule_date"
                                label="Date"
                                value={formData.schedule_date}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Time
                                </label>
                                <input
                                    type="time"
                                    id="start_time"
                                    name="start_time"
                                    value={formatTimeForInput(formData.start_time)}
                                    onChange={handleTimeChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">
                                    End Time
                                </label>
                                <input
                                    type="time"
                                    id="end_time"
                                    name="end_time"
                                    value={formatTimeForInput(formData.end_time)}
                                    onChange={handleTimeChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Schedule Type
                            </label>
                            <div className="flex space-x-4">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        className="form-radio text-blue-600"
                                        checked={scheduleType === 'task'}
                                        onChange={() => handleScheduleTypeChange('task')}
                                    />
                                    <span className="ml-2">Task</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        className="form-radio text-blue-600"
                                        checked={scheduleType === 'meeting'}
                                        onChange={() => handleScheduleTypeChange('meeting')}
                                    />
                                    <span className="ml-2">Meeting</span>
                                </label>
                                // src/pages/schedules/ScheduleForm.tsx (continued)
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        className="form-radio text-blue-600"
                                        checked={scheduleType === 'free'}
                                        onChange={() => handleScheduleTypeChange('free')}
                                    />
                                    <span className="ml-2">Free Time</span>
                                </label>
                            </div>
                        </div>

                        {scheduleType === 'task' && (
                            <div>
                                <label htmlFor="task_uuid" className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Task
                                </label>
                                <select
                                    id="task_uuid"
                                    name="task_uuid"
                                    value={formData.task_uuid}
                                    onChange={handleChange}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required={scheduleType === 'task'}
                                >
                                    <option value="">Select a task</option>
                                    {tasks.map((task) => (
                                        <option key={task.uuid} value={task.uuid}>
                                            {task.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {scheduleType === 'meeting' && (
                            <div>
                                <p className="text-sm text-gray-500 italic mb-2">
                                    Note: Meeting creation is not yet implemented. This will be available in a future update.
                                </p>
                                <div className="opacity-50 pointer-events-none">
                                    <label htmlFor="meeting_uuid" className="block text-sm font-medium text-gray-700 mb-1">
                                        Select Meeting
                                    </label>
                                    <select
                                        id="meeting_uuid"
                                        name="meeting_uuid"
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        disabled
                                    >
                                        <option value="">No meetings available</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end space-x-3">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => navigate('/schedules')}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitLoading}
                            >
                                {submitLoading ? 'Saving...' : isEditMode ? 'Update Schedule' : 'Create Schedule'}
                            </Button>
                        </div>
                    </form>
                )}
            </Card>
        </MainLayout>
    );
};

export default ScheduleForm;