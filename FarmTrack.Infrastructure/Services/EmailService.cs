using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;

namespace FarmTrack.Infrastructure.Services
{
    public class EmailService
    {
        private readonly IConfiguration _config;
        public EmailService(IConfiguration config) => _config = config;

        public async Task SendPasswordResetEmailAsync(string toEmail, string resetLink)
        {
            var settings = _config.GetSection("EmailSettings");
            var from = settings["FromEmail"]!;
            var fromName = settings["FromName"]!;
            var host = settings["SmtpHost"]!;
            var port = int.Parse(settings["SmtpPort"]!);
            var user = settings["SmtpUser"]!;
            var pass = settings["SmtpPassword"]!;

            var message = new MailMessage
            {
                From = new MailAddress(from, fromName),
                Subject = "Reset Your FarmTrack Password",
                IsBodyHtml = true,
                Body = $@"
                <div style='font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;'>
                    <h2 style='color:#16a34a;'>🐔 FarmTrack</h2>
                    <h3>Reset Your Password</h3>
                    <p>You requested a password reset. Click the button below:</p>
                    <a href='{resetLink}' style='display:inline-block;background:#16a34a;color:white;
                        padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:bold;margin:16px 0;'>
                        Reset Password
                    </a>
                    <p style='color:#888;font-size:12px;'>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
                </div>"
            };
            message.To.Add(toEmail);

            using var client = new SmtpClient(host, port)
            {
                Credentials = new NetworkCredential(user, pass),
                EnableSsl = true
            };
            await client.SendMailAsync(message);
        }
    }
}
