using CivicPlusApi.Models;
using CivicPlusApi.Services.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using System.Text;
using System.Text.Json;

namespace CivicPlusApi.Services
{
    /// <summary>
    /// Handles authentication with the CivicPlus API
    /// </summary>
    public class AuthService : IAuthService
    {
        private readonly HttpClient _httpClient;
        private readonly IMemoryCache _cache;
        private readonly ILogger<AuthService> _logger;
        private readonly IConfiguration _configuration;
        private const string TokenCacheKey = "CivicPlus_BearerToken";

        public AuthService(
            HttpClient httpClient,
            IMemoryCache cache,
            ILogger<AuthService> logger,
            IConfiguration configuration)
        {
            _httpClient = httpClient;
            _cache = cache;
            _logger = logger;
            _configuration = configuration;
        }

        /// <summary>
        /// Gets a valid bearer token, using cached token if available
        /// </summary>
        public async Task<string> GetTokenAsync()
        {
            // Try to get cached token
            if (_cache.TryGetValue(TokenCacheKey, out string? cachedToken)
                && !string.IsNullOrEmpty(cachedToken))
            {
                _logger.LogInformation("Using cached bearer token");
                return cachedToken;
            }

            _logger.LogInformation("Cached token not found or expired, requesting new token");
            return await FetchNewTokenAsync();
        }

        /// <summary>
        /// Fetches a new token from the API and caches it
        /// </summary>
        private async Task<string> FetchNewTokenAsync()
        {
            try
            {
                var clientId = _configuration["CivicPlusTutorialApi:ClientId"];
                var clientSecret = _configuration["CivicPlusTutorialApi:ClientSecret"];

                if (string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(clientSecret))
                {
                    throw new InvalidOperationException(
                        "API credentials not configured. Check appsettings.json");
                }

                var authRequest = new AuthRequest
                {
                    ClientId = clientId,
                    ClientSecret = clientSecret
                };

                var jsonContent = JsonSerializer.Serialize(authRequest);
                var httpContent = new StringContent(
                    jsonContent,
                    Encoding.UTF8,
                    "application/json");

                // FIXED: Remove leading slash so it appends to base URL correctly
                var response = await _httpClient.PostAsync("api/Auth", httpContent);

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError(
                        "Authentication failed with status {StatusCode}: {Error}",
                        response.StatusCode,
                        errorContent);
                    throw new HttpRequestException(
                        $"Authentication failed: {response.StatusCode}");
                }

                var responseContent = await response.Content.ReadAsStringAsync();

                if (string.IsNullOrWhiteSpace(responseContent))
                {
                    _logger.LogError("Auth response body is empty");
                    throw new InvalidOperationException("Authentication response body is empty");
                }

                var authResponse = JsonSerializer.Deserialize<AuthResponse>(
                    responseContent,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (authResponse == null || string.IsNullOrEmpty(authResponse.AccessToken))
                {
                    _logger.LogError("Failed to deserialize auth response or token is empty");
                    throw new InvalidOperationException("Invalid authentication response");
                }

                // Cache token with 5-minute buffer before expiration
                var expiresIn = authResponse.ExpiresIn > 0 ? authResponse.ExpiresIn : 3600;
                var cacheExpiration = TimeSpan.FromSeconds(Math.Max(expiresIn - 300, 60));
                _cache.Set(TokenCacheKey, authResponse.AccessToken, cacheExpiration);

                _logger.LogInformation(
                    "Successfully obtained new bearer token, expires in {Seconds} seconds",
                    expiresIn);

                return authResponse.AccessToken;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching authentication token");
                throw;
            }
        }
    }
}