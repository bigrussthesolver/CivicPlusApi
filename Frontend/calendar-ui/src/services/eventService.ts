import axios, { AxiosInstance } from 'axios';
import { CalendarEvent, CreateEventRequest, EventListResponse } from '../types/models';

/**
 * API service for calendar event operations
 */
class EventService {
    private api: AxiosInstance;

    constructor() {
        // Get API base URL from environment variable
        const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000';

        this.api = axios.create({
            baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 30000, // 30 seconds
        });

        // Response interceptor for error handling
        this.api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response) {
                    // Server responded with error status
                    console.error('API Error:', error.response.status, error.response.data);
                    throw new Error(
                        error.response.data?.message ||
                        error.response.data ||
                        `Server error: ${error.response.status}`
                    );
                } else if (error.request) {
                    // Request made but no response
                    console.error('Network Error:', error.message);
                    throw new Error('Network error: Unable to reach the server');
                } else {
                    // Something else happened
                    console.error('Error:', error.message);
                    throw new Error(error.message);
                }
            }
        );
    }

    /**
     * Retrieves all calendar events with pagination
     * @param top Number of events to retrieve (default: 20)
     * @param skip Number of events to skip (default: 0)
     * @returns Promise with event list response
     */
    async getAllEvents(top: number = 20, skip: number = 0): Promise<EventListResponse> {
        try {
            const response = await this.api.get<EventListResponse>(
                `/api/Events?$top=${top}&$skip=${skip}`
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching events:', error);
            throw error;
        }
    }

    /**
     * Creates a new calendar event
     * @param eventData Event details to create
     * @returns Promise with the created event
     */
    async createEvent(eventData: CreateEventRequest): Promise<CalendarEvent> {
        try {
            // Validate dates before sending
            const startDate = new Date(eventData.startDate);
            const endDate = new Date(eventData.endDate);

            if (endDate <= startDate) {
                throw new Error('End date must be after start date');
            }

            const response = await this.api.post<CalendarEvent>('/api/Events', eventData);
            return response.data;
        } catch (error) {
            console.error('Error creating event:', error);
            throw error;
        }
    }

    /**
     * Gets a single event by ID
     * @param id Event ID
     * @returns Promise with the event
     */
    async getEventById(id: string): Promise<CalendarEvent> {
        try {
            const response = await this.api.get<CalendarEvent>(`/api/Events/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching event by ID:', error);
            throw error;
        }
    }
}

// Export singleton instance
export const eventService = new EventService();