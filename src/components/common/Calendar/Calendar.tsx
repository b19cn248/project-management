// src/components/common/Calendar/Calendar.tsx
import React, { useState, useEffect } from 'react';
import {
    format,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    addDays,
    subDays,
    isToday,
    parseISO,
    addWeeks,
    subWeeks
} from 'date-fns';
import Button from '../Button';

// Event type for the calendar
export interface CalendarEvent {
    id: string;
    title: string;
    start: string | Date; // ISO string or Date object
    end?: string | Date;
    color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'indigo' | 'gray';
    type?: string;
    description?: string;
}

interface CalendarProps {
    events: CalendarEvent[];
    view?: 'month' | 'week' | 'day';
    onEventClick?: (event: CalendarEvent) => void;
    onDateClick?: (date: Date) => void;
    onViewChange?: (view: 'month' | 'week' | 'day') => void;
    className?: string;
    loading?: boolean;
}

const Calendar: React.FC<CalendarProps> = ({
                                               events = [],
                                               view: initialView = 'month',
                                               onEventClick,
                                               onDateClick,
                                               onViewChange,
                                               className = '',
                                               loading = false
                                           }) => {
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [view, setView] = useState<'month' | 'week' | 'day'>(initialView);

    // Normalize the events by converting string dates to Date objects
    const normalizedEvents: CalendarEvent[] = events.map(event => ({
        ...event,
        start: typeof event.start === 'string' ? parseISO(event.start) : event.start,
        end: event.end ? (typeof event.end === 'string' ? parseISO(event.end) : event.end) : undefined
    }));

    useEffect(() => {
        // Update view if props change
        setView(initialView);
    }, [initialView]);

    // Handler for changing the view
    const handleViewChange = (newView: 'month' | 'week' | 'day') => {
        setView(newView);
        if (onViewChange) {
            onViewChange(newView);
        }
    };

    // Navigation handlers
    const handlePrevious = () => {
        switch (view) {
            case 'month':
                setCurrentDate(subMonths(currentDate, 1));
                break;
            case 'week':
                setCurrentDate(subWeeks(currentDate, 1));
                break;
            case 'day':
                setCurrentDate(subDays(currentDate, 1));
                break;
        }
    };

    const handleNext = () => {
        switch (view) {
            case 'month':
                setCurrentDate(addMonths(currentDate, 1));
                break;
            case 'week':
                setCurrentDate(addWeeks(currentDate, 1));
                break;
            case 'day':
                setCurrentDate(addDays(currentDate, 1));
                break;
        }
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    // Helper to get event color class
    const getEventColorClass = (color: string = 'blue') => {
        const colorClasses: Record<string, string> = {
            blue: 'bg-blue-100 text-blue-800 border-blue-200',
            green: 'bg-green-100 text-green-800 border-green-200',
            red: 'bg-red-100 text-red-800 border-red-200',
            yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            purple: 'bg-purple-100 text-purple-800 border-purple-200',
            indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
            gray: 'bg-gray-100 text-gray-800 border-gray-200'
        };

        return colorClasses[color] || colorClasses.blue;
    };

    // Filter events for a specific date
    const getEventsForDate = (date: Date): CalendarEvent[] => {
        return normalizedEvents.filter(event => {
            const eventStart = new Date(event.start);
            const eventEnd = event.end ? new Date(event.end) : eventStart;

            // Check if the date falls within the event's date range
            return (
                isSameDay(date, eventStart) ||
                isSameDay(date, eventEnd) ||
                (date > eventStart && date < eventEnd)
            );
        });
    };

    // Get hours for day view
    const hours = Array.from({ length: 24 }, (_, i) => i);

    // Render the appropriate calendar view
    const renderCalendarView = () => {
        switch (view) {
            case 'month':
                return renderMonthView();
            case 'week':
                return renderWeekView();
            case 'day':
                return renderDayView();
            default:
                return renderMonthView();
        }
    };

    // Render month view
    const renderMonthView = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const days = eachDayOfInterval({ start: startDate, end: endDate });

        return (
            <div className="bg-white rounded-lg overflow-hidden">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-px border-b border-gray-200">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                        <div key={day} className="py-2 text-center text-sm font-medium text-gray-500">
                            <span className="lg:hidden">{day.charAt(0)}</span>
                            <span className="hidden lg:inline">{day}</span>
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 grid-rows-6 gap-px h-full">
                    {days.map((day, i) => {
                        const dayEvents = getEventsForDate(day);
                        const isCurrentMonth = isSameMonth(day, currentDate);

                        return (
                            <div
                                key={i}
                                className={`min-h-24 p-1 overflow-y-auto ${
                                    isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                                } ${
                                    isToday(day) ? 'bg-blue-50' : ''
                                }`}
                                onClick={() => onDateClick && onDateClick(day)}
                            >
                                <div className={`text-xs font-medium p-1 ${
                                    isToday(day)
                                        ? 'text-white bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center'
                                        : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                                }`}>
                                    {format(day, 'd')}
                                </div>

                                <div className="mt-1 space-y-1 max-h-24 overflow-y-auto">
                                    {dayEvents.slice(0, 3).map((event, eventIndex) => (
                                        <div
                                            key={`${event.id}-${eventIndex}`}
                                            className={`text-xs px-2 py-1 rounded truncate border ${getEventColorClass(event.color)} cursor-pointer`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEventClick && onEventClick(event);
                                            }}
                                        >
                                            {event.title}
                                        </div>
                                    ))}

                                    {dayEvents.length > 3 && (
                                        <div className="text-xs text-gray-500 px-2">
                                            + {dayEvents.length - 3} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Render week view
    const renderWeekView = () => {
        const weekStart = startOfWeek(currentDate);
        const weekEnd = endOfWeek(currentDate);
        const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

        return (
            <div className="bg-white rounded-lg overflow-hidden">
                {/* Time column headers */}
                <div className="grid grid-cols-8 border-b border-gray-200">
                    <div className="py-2 text-center text-sm font-medium text-gray-500">
                        Time
                    </div>
                    {days.map((day, i) => (
                        <div
                            key={i}
                            className={`py-2 text-center text-sm font-medium ${
                                isToday(day) ? 'bg-blue-50 text-blue-700' : 'text-gray-500'
                            }`}
                        >
                            <div>{format(day, 'EEE')}</div>
                            <div className={`text-xs font-medium mt-1 ${
                                isToday(day)
                                    ? 'text-white bg-blue-500 rounded-full w-6 h-6 mx-auto flex items-center justify-center'
                                    : ''
                            }`}>
                                {format(day, 'd')}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Time slots */}
                <div className="flex flex-col divide-y divide-gray-100">
                    {hours.map((hour) => (
                        <div key={hour} className="grid grid-cols-8 min-h-12">
                            {/* Time label */}
                            <div className="text-xs text-gray-500 text-right pr-2 py-1 pt-1">
                                {format(new Date().setHours(hour, 0, 0, 0), 'h a')}
                            </div>

                            {/* Day columns */}
                            {days.map((day, dayIndex) => {
                                const currentHourDate = new Date(day);
                                currentHourDate.setHours(hour, 0, 0, 0);

                                const nextHourDate = new Date(day);
                                nextHourDate.setHours(hour + 1, 0, 0, 0);

                                // Find events occurring during this hour
                                const hourEvents = normalizedEvents.filter(event => {
                                    const eventStart = new Date(event.start);
                                    const eventEnd = event.end ? new Date(event.end) : new Date(eventStart);
                                    eventEnd.setHours(eventEnd.getHours() + 1); // Add 1 hour buffer if no end time

                                    // Check if this hour block overlaps with the event
                                    return (
                                        (eventStart < nextHourDate && eventEnd > currentHourDate) &&
                                        isSameDay(day, eventStart)
                                    );
                                });

                                return (
                                    <div
                                        key={dayIndex}
                                        className={`border-l relative ${
                                            isToday(day) ? 'bg-blue-50' : ''
                                        }`}
                                        onClick={() => {
                                            const clickedDate = new Date(day);
                                            clickedDate.setHours(hour);
                                            onDateClick && onDateClick(clickedDate);
                                        }}
                                    >
                                        <div className="p-1 space-y-1">
                                            {hourEvents.map((event, eventIndex) => (
                                                <div
                                                    key={`${event.id}-${eventIndex}`}
                                                    className={`text-xs px-2 py-1 rounded truncate border ${getEventColorClass(event.color)} cursor-pointer`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEventClick && onEventClick(event);
                                                    }}
                                                >
                                                    {event.title}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Render day view
    const renderDayView = () => {
        return (
            <div className="bg-white rounded-lg overflow-hidden">
                {/* Day header */}
                <div className="border-b border-gray-200 py-4 text-center">
                    <h3 className={`text-lg font-medium ${isToday(currentDate) ? 'text-blue-700' : 'text-gray-900'}`}>
                        {format(currentDate, 'EEEE, MMMM d, yyyy')}
                    </h3>
                </div>

                {/* Time slots */}
                <div className="flex flex-col divide-y divide-gray-100">
                    {hours.map((hour) => {
                        const currentHourDate = new Date(currentDate);
                        currentHourDate.setHours(hour, 0, 0, 0);

                        const nextHourDate = new Date(currentDate);
                        nextHourDate.setHours(hour + 1, 0, 0, 0);

                        // Find events occurring during this hour
                        const hourEvents = normalizedEvents.filter(event => {
                            const eventStart = new Date(event.start);
                            const eventEnd = event.end ? new Date(event.end) : new Date(eventStart);
                            eventEnd.setHours(eventEnd.getHours() + 1); // Add 1 hour buffer if no end time

                            // Check if this hour block overlaps with the event
                            return (
                                (eventStart < nextHourDate && eventEnd > currentHourDate) &&
                                isSameDay(currentDate, eventStart)
                            );
                        });

                        const isCurrentHour = new Date().getHours() === hour && isToday(currentDate);

                        return (
                            <div
                                key={hour}
                                className={`grid grid-cols-12 min-h-20 ${isCurrentHour ? 'bg-blue-50' : ''}`}
                                onClick={() => {
                                    const clickedDate = new Date(currentDate);
                                    clickedDate.setHours(hour);
                                    onDateClick && onDateClick(clickedDate);
                                }}
                            >
                                {/* Time label */}
                                <div className="col-span-2 lg:col-span-1 text-sm text-gray-500 text-right pr-4 py-2 pt-3">
                                    {format(new Date().setHours(hour, 0, 0, 0), 'h a')}
                                </div>

                                {/* Events */}
                                <div className="col-span-10 lg:col-span-11 p-2 relative">
                                    {isCurrentHour && (
                                        <div className="absolute left-0 right-0 border-t-2 border-red-500 z-10" />
                                    )}

                                    <div className="space-y-2">
                                        {hourEvents.map((event, eventIndex) => (
                                            <div
                                                key={`${event.id}-${eventIndex}`}
                                                className={`p-2 rounded border ${getEventColorClass(event.color)} cursor-pointer`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEventClick && onEventClick(event);
                                                }}
                                            >
                                                <div className="font-medium">{event.title}</div>
                                                <div className="text-xs mt-1">
                                                    {format(new Date(event.start), 'h:mm a')}
                                                    {event.end && ` - ${format(new Date(event.end), 'h:mm a')}`}
                                                </div>
                                                {event.description && (
                                                    <div className="text-xs mt-1 text-gray-600">{event.description}</div>
                                                )}
                                            </div>
                                        ))}

                                        {hourEvents.length === 0 && (
                                            <div className="h-12 flex items-center justify-center border border-dashed border-gray-200 rounded">
                                                <span className="text-xs text-gray-400">No events</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className={`flex flex-col ${className}`}>
            {/* Calendar Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-semibold">
                        {view === 'month' && format(currentDate, 'MMMM yyyy')}
                        {view === 'week' && `Week of ${format(startOfWeek(currentDate), 'MMM d')} - ${format(endOfWeek(currentDate), 'MMM d, yyyy')}`}
                        {view === 'day' && format(currentDate, 'MMMM d, yyyy')}
                    </h2>
                </div>

                <div className="flex items-center space-x-1 sm:space-x-2">
                    <Button
                        onClick={handleToday}
                        variant="outline"
                        size="sm"
                    >
                        Today
                    </Button>

                    <div className="flex items-center">
                        <Button
                            onClick={handlePrevious}
                            variant="outline"
                            size="sm"
                            className="rounded-r-none"
                            aria-label="Previous"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </Button>
                        <Button
                            onClick={handleNext}
                            variant="outline"
                            size="sm"
                            className="rounded-l-none"
                            aria-label="Next"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </Button>
                    </div>

                    <div className="hidden sm:flex border border-gray-300 rounded-md overflow-hidden">
                        <button
                            className={`px-3 py-1 text-sm ${view === 'month' ? 'bg-blue-100 text-blue-800' : 'bg-white text-gray-700'}`}
                            onClick={() => handleViewChange('month')}
                        >
                            Month
                        </button>
                        <button
                            className={`px-3 py-1 text-sm border-l border-r border-gray-300 ${view === 'week' ? 'bg-blue-100 text-blue-800' : 'bg-white text-gray-700'}`}
                            onClick={() => handleViewChange('week')}
                        >
                            Week
                        </button>
                        <button
                            className={`px-3 py-1 text-sm ${view === 'day' ? 'bg-blue-100 text-blue-800' : 'bg-white text-gray-700'}`}
                            onClick={() => handleViewChange('day')}
                        >
                            Day
                        </button>
                    </div>

                    {/* Mobile view selector */}
                    <div className="sm:hidden">
                        <select
                            className="form-select rounded-md border-gray-300 text-sm"
                            value={view}
                            onChange={(e) => handleViewChange(e.target.value as 'month' | 'week' | 'day')}
                        >
                            <option value="month">Month</option>
                            <option value="week">Week</option>
                            <option value="day">Day</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="bg-white rounded-lg p-8 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-500">Loading calendar...</span>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {renderCalendarView()}
                </div>
            )}
        </div>
    );
};

export default Calendar;