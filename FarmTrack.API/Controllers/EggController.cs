using FarmTrack.API.DTOs.Eggs;
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
    public class EggController : ControllerBase
    {
        private readonly IEggRecordRepository _eggRepo;
        private readonly IFlockRepository _flockRepo;

        public EggController(IEggRecordRepository eggRepo, IFlockRepository flockRepo)
        {
            _eggRepo = eggRepo;
            _flockRepo = flockRepo;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var records = await _eggRepo.GetAllAsync();
            return Ok(records);
        }

        [HttpGet("today")]
        public async Task<IActionResult> GetTodayTotal()
        {
            var total = await _eggRepo.GetTotalEggsForTodayAsync();
            return Ok(new { totalEggsToday = total });
        }

        [HttpGet("range")]
        public async Task<IActionResult> GetByRange([FromQuery] DateTime from, [FromQuery] DateTime to)
        {
            var records = await _eggRepo.GetByDateRangeAsync(from, to);
            var result = records.Select(e => new EggRecordResponseDto
            {
                Id = e.Id,
                FlockId = e.FlockId,
                FlockName = e.Flock?.BatchName ?? "",
                CollectionDate = e.CollectionDate,
                TotalCollected = e.TotalCollected,
                CrackedEggs = e.CrackedEggs,
                GoodEggs = e.TotalCollected - e.CrackedEggs,
                Notes = e.Notes,
                RecordedBy = e.RecordedBy
            });
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateEggRecordDto dto)
        {
            var flock = await _flockRepo.GetByIdAsync(dto.FlockId);
            if (flock == null) return NotFound(new { message = "Flock not found" });

            var userName = User.FindFirstValue(ClaimTypes.Name) ?? "Unknown";

            var record = new EggRecord
            {
                FlockId = dto.FlockId,
                CollectionDate = dto.CollectionDate,
                TotalCollected = dto.TotalCollected,
                CrackedEggs = dto.CrackedEggs,
                Notes = dto.Notes,
                RecordedBy = userName
            };

            await _eggRepo.AddAsync(record);
            await _eggRepo.SaveChangesAsync();

            return Ok(new { message = "Egg record saved", record.Id });
        }
    }
}