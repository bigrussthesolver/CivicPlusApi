import { format } from "date-fns";
import { CalendarEvent } from "../types/models";

interface EventCardProps {
  event: CalendarEvent;
}

/**
 * Component to display a single calendar event card
 */
export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  /**
   * Formats a date string to a readable format
   */
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return format(date, "PPpp"); // e.g., "Apr 29, 2023, 9:00 AM"
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  /**
   * Calculates duration between start and end dates
   */
  const getDuration = (): string => {
    try {
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      const durationMs = end.getTime() - start.getTime();

      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0 && minutes > 0) {
        return `${hours}h ${minutes}m`;
      } else if (hours > 0) {
        return `${hours}h`;
      } else {
        return `${minutes}m`;
      }
    } catch (error) {
      return "";
    }
  };

  const duration = getDuration();

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200">
      {/* Event Title */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
        {event.title}
      </h3>

      {/* Event Description */}
      <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>

      {/* Event Dates */}
      <div className="space-y-2 text-sm">
        <div className="flex items-start">
          <span className="font-medium text-gray-700 w-16 flex-shrink-0">
            Start:
          </span>
          <span className="text-gray-600">{formatDate(event.startDate)}</span>
        </div>

        <div className="flex items-start">
          <span className="font-medium text-gray-700 w-16 flex-shrink-0">
            End:
          </span>
          <span className="text-gray-600">{formatDate(event.endDate)}</span>
        </div>

        {duration && (
          <div className="flex items-start">
            <span className="font-medium text-gray-700 w-16 flex-shrink-0">
              Duration:
            </span>
            <span className="text-gray-600">{duration}</span>
          </div>
        )}
      </div>

      {/* Event ID (for debugging/reference) */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <span className="text-xs text-gray-400">ID: {event.id}</span>
      </div>
    </div>
  );
};
