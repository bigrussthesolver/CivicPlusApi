using System.Text.Json.Serialization;

namespace CivicPlusApi.Models
{
    /// <summary>
    /// Response model for calendar event lists
    /// </summary>
    public class EventListResponse
    {
        [JsonPropertyName("total")]
        public long Total { get; set; }

        [JsonPropertyName("items")]
        public List<CalendarEvent> Items { get; set; } = new();
    }
}
