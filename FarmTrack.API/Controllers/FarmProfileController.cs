using FarmTrack.API.Helpers;
using FarmTrack.Core.Entities;
using FarmTrack.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FarmTrack.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FarmProfileController : ControllerBase
    {
        private readonly IFarmProfileRepository _profileRepo;
        public FarmProfileController(IFarmProfileRepository profileRepo) => _profileRepo = profileRepo;

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var userId = UserHelper.GetUserId(User);
            var profile = await _profileRepo.GetByUserIdAsync(userId);

            if (profile == null)
            {
                var fullName = User.FindFirstValue(ClaimTypes.Name) ?? "My";
                return Ok(new
                {
                    farmName = $"{fullName}'s Poultry Farm",
                    phone = "",
                    email = "",
                    address = "",
                    logoUrl = "",
                    isSetup = false
                });
            }

            return Ok(new
            {
                farmName = profile.FarmName,
                phone = profile.Phone,
                email = profile.Email,
                address = profile.Address,
                logoUrl = profile.LogoUrl,
                isSetup = true
            });
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] FarmProfileRequest dto)
        {
            var userId = UserHelper.GetUserId(User);
            var profile = await _profileRepo.GetByUserIdAsync(userId);

            if (profile == null)
            {
                profile = new FarmProfile
                {
                    UserId = userId,
                    FarmName = dto.FarmName,
                    Phone = dto.Phone,
                    Email = dto.Email,
                    Address = dto.Address,
                    LogoUrl = dto.LogoUrl
                };
                await _profileRepo.AddAsync(profile);
            }
            else
            {
                profile.FarmName = dto.FarmName;
                profile.Phone = dto.Phone;
                profile.Email = dto.Email;
                profile.Address = dto.Address;
                profile.LogoUrl = dto.LogoUrl;
                profile.UpdatedAt = DateTime.UtcNow;
                _profileRepo.Update(profile);
            }

            await _profileRepo.SaveChangesAsync();
            return Ok(new { message = "Farm profile saved" });
        }
    }

    public class FarmProfileRequest
    {
        public string FarmName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public string? LogoUrl { get; set; }
    }
}