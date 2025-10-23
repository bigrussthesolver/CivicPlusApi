using System.Text.Json.Serialization;

namespace CivicPlusApi.Models
{
    /// <summary>
    /// Response model containing the bearer token from authentication
    /// </summary>
    public class AuthResponse
    {
        [JsonPropertyName("access_token")]
        public string AccessToken { get; set; } = string.Empty;

        [JsonPropertyName("token_type")]
        public string TokenType { get; set; } = string.Empty;

        [JsonPropertyName("expires_in")]
        public int ExpiresIn { get; set; }
    }
}
