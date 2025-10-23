using CivicPlusApi.Models;

namespace CivicPlusApi.Services.Interfaces
{
    /// <summary>
    /// Service interface for calendar event operations
    /// </summary>
    public interface ICalendarService
    {
        /// <summary>
        /// Retrieves all events with optional pagination
        /// </summary>
        Task<EventListResponse> GetAllEventsAsync(int top = 20, int skip = 0);

        /// <summary>
        /// Creates a new calendar event
        /// </summary>
        Task<CalendarEvent> CreateEventAsync(CreateEventRequest request);

        /// <summary>
        /// Invalidates all cached event lists
        /// </summary>
        void InvalidateEventCache();
    }
}
