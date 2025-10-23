using CivicPlusApi.Models;
using CivicPlusApi.Services.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using System.Collections.Concurrent;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace CivicPlusApi.Services
{
    /// <summary>
    /// Handles calendar event operations with the CivicPlus API
    /// </summary>
    public class CalendarService : ICalendarService
    {
        private readonly HttpClient _httpClient;
        private readonly IAuthService _authService;
        private readonly IMemoryCache _cache;
        private readonly ILogger<CalendarService> _logger;

        // Track all cache keys for invalidation
        private static readonly ConcurrentDictionary<string, byte> _cacheKeys = new();
        private const string CacheKeyPrefix = "Events_";
        private static readonly TimeSpan CacheDuration = TimeSpan.FromSeconds(30);

        public CalendarService(
            HttpClient httpClient,
            IAuthService authService,
            IMemoryCache cache,
            ILogger<CalendarService> logger)
        {
            _httpClient = httpClient;
            _authService = authService;
            _cache = cache;
            _logger = logger;
        }

        /// <summary>
        /// Retrieves all events with caching support
        /// </summary>
        public async Task<EventListResponse> GetAllEventsAsync(int top = 20, int skip = 0)
        {
            var cacheKey = $"{CacheKeyPrefix}{top}_{skip}";

            // Try cache first
            if (_cache.TryGetValue(cacheKey, out EventListResponse? cachedResponse)
                && cachedResponse != null)
            {
                _logger.LogInformation("Returning cached events for top={Top}, skip={Skip}", top, skip);
                return cachedResponse;
            }

            try
            {
                // Russ - Get bearer token
                var token = await _authService.GetTokenAsync();

                // Russ - Set authorization header
                _httpClient.DefaultRequestHeaders.Authorization =
                    new AuthenticationHeaderValue("Bearer", token.Trim());

                var queryParams = $"?$top={top}&$skip={skip}";
                var response = await _httpClient.GetAsync($"api/Events{queryParams}");

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError(
                        "Failed to fetch events. Status: {StatusCode}, Error: {Error}",
                        response.StatusCode,
                        errorContent);
                    throw new HttpRequestException(
                        $"Failed to fetch events: {response.StatusCode}");
                }

                var content = await response.Content.ReadAsStringAsync();
                var eventList = JsonSerializer.Deserialize<EventListResponse>(
                    content,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (eventList == null)
                {
                    throw new InvalidOperationException("Failed to deserialize event list");
                }

                // Cache the response and track the key
                _cache.Set(cacheKey, eventList, CacheDuration);
                _cacheKeys.TryAdd(cacheKey, 0);

                _logger.LogInformation(
                    "Successfully fetched {Count} events (total: {Total})",
                    eventList.Items.Count,
                    eventList.Total);

                return eventList;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching events");
                throw;
            }
        }

        /// <summary>
        /// Creates a new calendar event
        /// </summary>
        public async Task<CalendarEvent> CreateEventAsync(CreateEventRequest request)
        {
            try
            {
                // Validate dates
                if (request.EndDate <= request.StartDate)
                {
                    throw new ArgumentException(
                        "End date must be after start date");
                }

                // Get bearer token
                var token = await _authService.GetTokenAsync();

                // Set authorization header
                _httpClient.DefaultRequestHeaders.Authorization =
                    new AuthenticationHeaderValue("Bearer", token.Trim());

                // Create event object
                var newEvent = new CalendarEvent
                {
                    Title = request.Title,
                    Description = request.Description,
                    StartDate = request.StartDate,
                    EndDate = request.EndDate
                };

                var jsonContent = JsonSerializer.Serialize(newEvent);
                var httpContent = new StringContent(
                    jsonContent,
                    Encoding.UTF8,
                    "application/json");

                // FIXED: Remove leading slash
                var response = await _httpClient.PostAsync("api/Events", httpContent);

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError(
                        "Failed to create event. Status: {StatusCode}, Error: {Error}",
                        response.StatusCode,
                        errorContent);
                    throw new HttpRequestException(
                        $"Failed to create event: {response.StatusCode}");
                }

                var content = await response.Content.ReadAsStringAsync();
                var createdEvent = JsonSerializer.Deserialize<CalendarEvent>(
                    content,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (createdEvent == null)
                {
                    throw new InvalidOperationException("Failed to deserialize created event");
                }

                _logger.LogInformation(
                    "Successfully created event with ID: {EventId}",
                    createdEvent.Id);

                // Invalidate all event caches since a new event was added
                InvalidateEventCache();

                return createdEvent;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating event");
                throw;
            }
        }

        /// <summary>
        /// Invalidates all cached event lists
        /// </summary>
        public void InvalidateEventCache()
        {
            foreach (var key in _cacheKeys.Keys)
            {
                _cache.Remove(key);
                _logger.LogInformation("Removed cache key: {CacheKey}", key);
            }
            _cacheKeys.Clear();
            _logger.LogInformation("Invalidated all event caches");
        }
    }
}