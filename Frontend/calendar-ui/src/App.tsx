import { useState } from "react";
import { useEvents } from "./hooks/useEvent";
import { EventList } from "./components/EventList";
import { AddEventForm } from "./components/AddEventForm";
import { CreateEventRequest } from "./types/models";

/**
 * Main application component
 */
function App() {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use custom hook for event management
  const { events, total, loading, error, refetch, createEvent, clearError } =
    useEvents(20, 0);

  /**
   * Handles event creation from the form
   */
  const handleCreateEvent = async (eventData: CreateEventRequest) => {
    try {
      setIsSubmitting(true);
      await createEvent(eventData);

      // Optionally close the form after successful creation
      // setShowForm(false);
    } catch (error) {
      // Error is handled by the hook and form
      console.error("Error creating event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Toggles the add event form visibility
   */
  const toggleForm = () => {
    setShowForm(!showForm);
    clearError();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Calendar Event Management
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                View and manage your calendar events
              </p>
            </div>

            {/* Add Event Button */}
            <button
              onClick={toggleForm}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-md transition-colors duration-200 shadow-sm"
            >
              {showForm ? (
                <>
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Close Form
                </>
              ) : (
                <>
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Event
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Add Event Form (conditional) */}
          {showForm && (
            <div className="animate-fadeIn">
              <AddEventForm
                onSubmit={handleCreateEvent}
                isSubmitting={isSubmitting}
              />
            </div>
          )}

          {/* Event List */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {showForm ? "All Events" : "Calendar Events"}
            </h2>
            <EventList
              events={events}
              loading={loading}
              error={error}
              total={total}
              onRefresh={refetch}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            Civic Plus Calendar Event - Russell Bronston &copy;{" "}
            {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
