
using CivicPlusApi.Services;
using CivicPlusApi.Services.Interfaces;

namespace CivicPlusApi
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // Add memory cache
            builder.Services.AddMemoryCache();

            // Configure HttpClient
            var apiBaseUrl = builder.Configuration["CivicPlusTutorialApi:BaseUrl"];
            if (string.IsNullOrEmpty(apiBaseUrl))
            {
                throw new InvalidOperationException("CivicPlusTutorialApi:BaseUrl is not configured");
            }

            // Register AuthService
            builder.Services.AddHttpClient<IAuthService, AuthService>(client =>
            {
                client.BaseAddress = new Uri(apiBaseUrl.TrimEnd('/') + "/");
                client.Timeout = TimeSpan.FromSeconds(30);
            });

            // Register HttpClient
            builder.Services.AddHttpClient<ICalendarService, CalendarService>(client =>
            {
                client.BaseAddress = new Uri(apiBaseUrl.TrimEnd('/') + "/");
                client.Timeout = TimeSpan.FromSeconds(30);
            });

            // Configure CORS for frontend
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    //policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
                    policy.WithOrigins("*")
                         .AllowAnyMethod()
                          .AllowAnyHeader();
                });
            });

            var app = builder.Build();

            // request pipeline
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseCors("AllowFrontend");

            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
