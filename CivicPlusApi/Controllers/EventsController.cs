using CivicPlusApi.Models;
using CivicPlusApi.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CivicPlusApi.Controllers
{
    /// <summary>
    /// Controller for managing calendar events
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class EventsController : ControllerBase
    {
        private readonly ICalendarService _calendarService;
        private readonly ILogger<EventsController> _logger;

        public EventsController(
            ICalendarService calendarService,
            ILogger<EventsController> logger)
        {
            _calendarService = calendarService;
            _logger = logger;
        }

        /// <summary>
        /// Retrieves a paginated list of calendar events
        /// </summary>
        /// <param name="top">Number of events to retrieve (default: 20)</param>
        /// <param name="skip">Number of events to skip (default: 0)</param>
        /// <returns>Event list with total count</returns>
        [HttpGet]
        [ProducesResponseType(typeof(EventListResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetEvents(
            //[FromQuery] int top = 20,
            //[FromQuery] int skip = 0)
            [FromQuery(Name = "$top")] int top = 20,
            [FromQuery(Name = "$skip")] int skip = 0)
        {
            try
            {
                _logger.LogInformation(
                    "Fetching events with top={Top}, skip={Skip}",
                    top,
                    skip);

                // Validate pagination parameters
                if (top < 1 || top > 100)
                {
                    return BadRequest("Parameter 'top' must be between 1 and 100");
                }

                if (skip < 0)
                {
                    return BadRequest("Parameter 'skip' must be non-negative");
                }

                var result = await _calendarService.GetAllEventsAsync(top, skip);

                _logger.LogInformation(
                    "Successfully retrieved {Count} events out of {Total} total",
                    result.Items.Count,
                    result.Total);

                return Ok(result);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(
                    ex,
                    "HTTP error occurred while fetching events");
                return StatusCode(
                    StatusCodes.Status502BadGateway,
                    "Failed to communicate with external API");
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Unexpected error occurred while fetching events");
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    "An error occurred while retrieving events");
            }
        }

        /// <summary>
        /// Creates a new calendar event
        /// </summary>
        /// <param name="request">Event details</param>
        /// <returns>The created event</returns>
        [HttpPost]
        [ProducesResponseType(typeof(CalendarEvent), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CreateEvent(
            [FromBody] CreateEventRequest request)
        {
            try
            {
                // Validate model state
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state for event creation");
                    return BadRequest(ModelState);
                }

                // Additional validation: EndDate must be after StartDate
                if (request.EndDate <= request.StartDate)
                {
                    _logger.LogWarning(
                        "Invalid date range: EndDate ({EndDate}) must be after StartDate ({StartDate})",
                        request.EndDate,
                        request.StartDate);
                    return BadRequest(
                        "End date must be after start date");
                }

                _logger.LogInformation(
                    "Creating new event: {Title}",
                    request.Title);

                var createdEvent = await _calendarService.CreateEventAsync(request);

                _logger.LogInformation(
                    "Successfully created event with ID: {EventId}",
                    createdEvent.Id);

                // Return 201 Created with location header
                return CreatedAtAction(
                    nameof(GetEvents),
                    new { id = createdEvent.Id },
                    createdEvent);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Validation error while creating event");
                return BadRequest(ex.Message);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(
                    ex,
                    "HTTP error occurred while creating event");
                return StatusCode(
                    StatusCodes.Status502BadGateway,
                    "Failed to communicate with external API");
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Unexpected error occurred while creating event");
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    "An error occurred while creating the event");
            }
        }
    }
}
