namespace CivicPlusApi.Services.Interfaces
{
    /// <summary>
    /// Service interface for handling API authentication
    /// </summary>
    public interface IAuthService
    {

        Task<string> GetTokenAsync();
    }
}
