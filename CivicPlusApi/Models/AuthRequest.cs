namespace CivicPlusApi.Models
{
    /// <summary>
    /// Request model for API authentication
    /// </summary>
    public class AuthRequest
    {
        public string ClientId { get; set; } = string.Empty;
        public string ClientSecret { get; set; } = string.Empty;
    }
}
