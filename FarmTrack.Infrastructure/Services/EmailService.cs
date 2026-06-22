using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;

namespace FarmTrack.Infrastructure.Services
{
    public class EmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendPasswordResetEmailAsync(string toEmail, string resetLink)
        {
            var apiKey = _config["Resend:ApiKey"]!;

            using var http = new HttpClient();
            http.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", apiKey);

            var payload = new
            {
                from = "FarmTrack <onboarding@resend.dev>",
                to = new[] { toEmail },
                subject = "Reset Your FarmTrack Password",
                html = $@"<div style='font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;'>
                    <h2 style='color:#16a34a;'>FarmTrack</h2>
                    <h3>Reset Your Password</h3>
                    <p>Click the button below to reset your password:</p>
                    <a href='{resetLink}' style='display:inline-block;background:#16a34a;color:white;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:bold;margin:16px 0;'>
                        Reset Password
                    </a>
                    <p style='color:#888;font-size:12px;'>This link expires in 1 hour. If you did not request this, ignore this email.</p>
                </div>"
            };

            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await http.PostAsync("https://api.resend.com/emails", content);
            var body = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
                throw new Exception($"Resend error: {body}");
        }
    }
}