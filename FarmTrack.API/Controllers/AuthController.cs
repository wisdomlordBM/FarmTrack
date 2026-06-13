using FarmTrack.API.DTOs.Auth;
using FarmTrack.API.Helpers;
using FarmTrack.Core.Entities;
using FarmTrack.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;

namespace FarmTrack.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly JwtHelper _jwtHelper;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            JwtHelper jwtHelper)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _jwtHelper = jwtHelper;
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            var existingUser = await _userManager.FindByEmailAsync(dto.Email);
            if (existingUser != null)
                return BadRequest(new { message = "Email already registered" });

            var user = new ApplicationUser
            {
                FullName = dto.FullName,
                Email = dto.Email,
                UserName = dto.Email,
                Role = "Admin"
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                return BadRequest(new { message = result.Errors.First().Description });

            return Ok(new { message = "Account created successfully" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
                return Unauthorized(new { message = "Invalid email or password" });

            var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, false);
            if (!result.Succeeded)
                return Unauthorized(new { message = "Invalid email or password" });

            var token = _jwtHelper.GenerateToken(user);

            return Ok(new AuthResponseDto
            {
                Token = token,
                FullName = user.FullName,
                Email = user.Email!,
                Role = user.Role,
                Expiry = DateTime.UtcNow.AddDays(7)
            });
        }

        [HttpPost("forgot-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ForgotPassword(
            [FromBody] ForgotPasswordRequest dto,
            [FromServices] EmailService emailService)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
                return BadRequest(new { message = "Email not found" });

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = Uri.EscapeDataString(token);
            var resetLink = $"http://localhost:3000/reset-password?token={encodedToken}&email={dto.Email}";

            await emailService.SendPasswordResetEmailAsync(dto.Email, resetLink);

            return Ok(new { message = "Reset link sent to your email" });
        }

        [HttpPost("reset-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
                return BadRequest(new { message = "User not found" });

            var decodedToken = Uri.UnescapeDataString(dto.Token);
            var result = await _userManager.ResetPasswordAsync(user, decodedToken, dto.NewPassword);

            if (!result.Succeeded)
                return BadRequest(new { message = "Reset failed", errors = result.Errors });

            return Ok(new { message = "Password reset successful" });
        }
        public class ForgotPasswordRequest
        {
            public string Email { get; set; } = string.Empty;
        }

        public class ResetPasswordRequest
        {
            public string Email { get; set; } = string.Empty;
            public string Token { get; set; } = string.Empty;
            public string NewPassword { get; set; } = string.Empty;
        }
    }
}