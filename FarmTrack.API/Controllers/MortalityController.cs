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
    public class MortalityController : ControllerBase
    {
        private readonly IMortalityRepository _mortalityRepo;
        private readonly IFlockRepository _flockRepo;
        public MortalityController(IMortalityRepository mortalityRepo, IFlockRepository flockRepo)
        { _mortalityRepo = mortalityRepo; _flockRepo = flockRepo; }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var userId = UserHelper.GetUserId(User);
            var records = await _mortalityRepo.GetAllWithFlockAsync(userId);
            return Ok(records.Select(m => new {
                id = m.Id,
                flockId = m.FlockId,
                flockName = m.Flock?.BatchName ?? "",
                date = m.Date,
                numberDied = m.NumberDied,
                cause = m.Cause,
                recordedBy = m.RecordedBy,
                createdAt = m.CreatedAt
            }));
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var userId = UserHelper.GetUserId(User);
            var totalThisMonth = await _mortalityRepo.GetTotalDeathsThisMonthAsync(userId);
            var all = await _mortalityRepo.GetAllWithFlockAsync(userId);
            var list = all.ToList();
            return Ok(new
            {
                totalDeathsThisMonth = totalThisMonth,
                totalDeathsAllTime = list.Sum(m => m.NumberDied),
                byCause = list.GroupBy(m => m.Cause)
                    .Select(g => new { cause = g.Key, total = g.Sum(m => m.NumberDied), count = g.Count() })
                    .OrderByDescending(x => x.total),
                recentRecords = list.Take(10)
            });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateMortalityRequest dto)
        {
            var userId = UserHelper.GetUserId(User);
            var flock = await _flockRepo.GetByIdAsync(dto.FlockId);
            if (flock == null || flock.UserId != userId)
                return NotFound(new { message = "Flock not found" });
            if (dto.NumberDied > flock.AliveBirds)
                return BadRequest(new { message = $"Only {flock.AliveBirds} birds alive" });

            var userName = User.FindFirstValue(ClaimTypes.Name) ?? "Admin";
            var record = new MortalityRecord
            {
                FlockId = dto.FlockId,
                Date = dto.Date,
                NumberDied = dto.NumberDied,
                Cause = dto.Cause,
                RecordedBy = userName,
                UserId = userId
            };
            flock.AliveBirds -= dto.NumberDied;
            flock.UpdatedAt = DateTime.UtcNow;
            _flockRepo.Update(flock);
            await _mortalityRepo.AddAsync(record);
            await _mortalityRepo.SaveChangesAsync();
            return Ok(new { message = "Mortality recorded", record.Id, newAliveBirds = flock.AliveBirds });
        }
    }

    public class CreateMortalityRequest
    {
        public int FlockId { get; set; }
        public DateTime Date { get; set; }
        public int NumberDied { get; set; }
        public string Cause { get; set; } = string.Empty;
    }
}