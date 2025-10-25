import { useEffect, useRef } from "react";
import { CalendarEvent } from "../types/models";
import { EventCard } from "./EventCard";

interface EventListProps {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
}

/**
 * Component to display a list of calendar events with infinite scroll
 */
export const EventList: React.FC<EventListProps> = ({
  events,
  loading,
  error,
  total,
  hasMore,
  onRefresh,
  onLoadMore,
}) => {
  const observerTarget = useRef<HTMLDivElement>(null);

  //  for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // when visible and we have more to load
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 } // set to10% visible
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, onLoadMore]);

  /**
   * Renders loading state
   */
  if (loading && events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading events...</p>
      </div>
    );
  }

  /**
   * Renders error state
   */
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <svg
          className="mx-auto h-12 w-12 text-red-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          Error Loading Events
        </h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={onRefresh}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  /**
   * Renders empty state
   */
  if (events.length === 0) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <svg
          className="mx-auto h-16 w-16 text-gray-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Events Found
        </h3>
        <p className="text-gray-600 mb-4">
          Get started by creating your first calendar event!
        </p>
      </div>
    );
  }

  /**
   * Renders event list
   */
  return (
    <div>
      {/* Event count and refresh button */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold">{events.length}</span> of{" "}
          <span className="font-semibold">{total}</span> events
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors duration-200"
          title="Refresh events"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span className="text-sm font-medium">Refresh</span>
        </button>
      </div>

      {/* Event grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {/* Loading indicator for infinite scroll */}
      {loading && events.length > 0 && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-3 text-gray-600">Loading more events...</p>
        </div>
      )}

      {/*  invisible  element target*/}
      <div ref={observerTarget} className="h-4" />

      {/* End of list message */}
      {!hasMore && events.length > 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          <svg
            className="mx-auto h-8 w-8 text-gray-400 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          You've reached the end! All {total} events loaded.
        </div>
      )}
    </div>
  );
};