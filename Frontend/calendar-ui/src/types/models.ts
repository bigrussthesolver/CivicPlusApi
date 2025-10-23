/**
 * Type definitions matching the backend API models
 */

/**
 * Calendar event model
 */
export interface CalendarEvent {
    id: string;
    title: string;
    description: string;
    startDate: string; // ISO 8601 date string
    endDate: string; // ISO 8601 date string
}

/**
 * Response model for event list with pagination info
 */
export interface EventListResponse {
    total: number;
    items: CalendarEvent[];
}

/**
 * Request model for creating a new event
 */
export interface CreateEventRequest {
    title: string;
    description: string;
    startDate: string; // ISO 8601 date string
    endDate: string; // ISO 8601 date string
}

/**
 * Form data for the add event form (before conversion to API format)
 */
export interface EventFormData {
    title: string;
    description: string;
    startDate: string; // datetime-local format
    endDate: string; // datetime-local format
}