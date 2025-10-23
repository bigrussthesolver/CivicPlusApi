import { useState, useEffect, useCallback } from 'react';
import { CalendarEvent, CreateEventRequest, EventListResponse } from '../types/models';
import { eventService } from '../services/eventService';

/**
 * the return type
 */
interface UseEventsReturn {
    events: CalendarEvent[];
    total: number;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    createEvent: (eventData: CreateEventRequest) => Promise<CalendarEvent>;
    clearError: () => void;
}

/**
 * Custom hook for managing calendar events
 */
export const useEvents = (top: number = 20, skip: number = 0): UseEventsReturn => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * read events from my API
     */
    const fetchEvents = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response: EventListResponse = await eventService.getAllEvents(top, skip);

            setEvents(response.items);
            setTotal(response.total);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch events';
            setError(errorMessage);
            console.error('Error in useEvents:', err);
        } finally {
            setLoading(false);
        }
    }, [top, skip]);

    /**
     * make a new event
     */
    const createEvent = async (eventData: CreateEventRequest): Promise<CalendarEvent> => {
        try {
            setError(null);

            const createdEvent = await eventService.createEvent(eventData);

            // Refresh events
            await fetchEvents();

            return createdEvent;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create event';
            setError(errorMessage);
            throw err;
        }
    };

    /**
     * get rid of state
     */
    const clearError = () => {
        setError(null);
    };

    // if  pagination params change
    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    return {
        events,
        total,
        loading,
        error,
        refetch: fetchEvents,
        createEvent,
        clearError,
    };
};