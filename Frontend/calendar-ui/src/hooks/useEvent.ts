import { useState, useEffect, useCallback, useRef } from 'react';
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
    hasMore: boolean;
    loadMore: () => Promise<void>;
    refetch: () => Promise<void>;
    createEvent: (eventData: CreateEventRequest) => Promise<CalendarEvent>;
    clearError: () => void;
}

/**
 * Custom hook for managing calendar events with infinite scroll
 */
export const useEvents = (pageSize: number = 20): UseEventsReturn => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);

    // keep track of whether we're currently loading to prevent duplicate requests
    const isLoadingRef = useRef(false);
    const pageRef = useRef(0);

    /**
     * read events from my API
     */
    const fetchEvents = useCallback(async (pageNum: number, append: boolean = false) => {
        // don't load if we're already loading
        if (isLoadingRef.current) return;

        try {
            isLoadingRef.current = true;
            setLoading(true);
            setError(null);

            const skip = pageNum * pageSize;
            const response: EventListResponse = await eventService.getAllEvents(pageSize, skip);

            if (append) {
                // add new events to my existing ones, filtering out duplicates
                setEvents(prev => {
                    const existingIds = new Set(prev.map(e => e.id));
                    const newEvents = response.items.filter(e => !existingIds.has(e.id));
                    return [...prev, ...newEvents];
                });
            } else {
                // replace all my events (for refresh)
                setEvents(response.items);
            }

            setTotal(response.total);

            // check if there are more events to load based on page calculation
            const totalLoaded = (pageNum + 1) * pageSize;
            const hasMoreEvents = totalLoaded < response.total;
            setHasMore(hasMoreEvents);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch events';
            setError(errorMessage);
            console.error('Error in useEvents:', err);
        } finally {
            setLoading(false);
            isLoadingRef.current = false;
        }
    }, [pageSize]);

    /**
     * load the next page of events
     */
    const loadMore = useCallback(async () => {
        if (!hasMore || isLoadingRef.current) {
            return;
        }

        const nextPage = pageRef.current + 1;
        pageRef.current = nextPage;
        setPage(nextPage);
        await fetchEvents(nextPage, true);
    }, [hasMore, fetchEvents]);

    /**
     * refresh from the beginning
     */
    const refetch = useCallback(async () => {
        pageRef.current = 0;
        setPage(0);
        setHasMore(true);
        await fetchEvents(0, false);
    }, [fetchEvents]);

    /**
     * make a new event
     */
    const createEvent = async (eventData: CreateEventRequest): Promise<CalendarEvent> => {
        try {
            setError(null);

            const createdEvent = await eventService.createEvent(eventData);

            // Refresh events from the beginning
            await refetch();

            return createdEvent;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create event';
            setError(errorMessage);
            throw err;
        }
    };

    /**
     * get rid of error state
     */
    const clearError = () => {
        setError(null);
    };

    // load initial events
    useEffect(() => {
        fetchEvents(0, false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        events,
        total,
        loading,
        error,
        hasMore,
        loadMore,
        refetch,
        createEvent,
        clearError,
    };
};