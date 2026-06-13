
using FarmTrack.API.Helpers;
using FarmTrack.Core.Entities;
using FarmTrack.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FarmTrack.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FlockController : ControllerBase
    {
        private readonly IFlockRepository _flockRepo;
        public FlockController(IFlockRepository flockRepo) => _flockRepo = flockRepo;

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var userId = UserHelper.GetUserId(User);
            var flocks = await _flockRepo.GetActiveFlocks(userId);
            return Ok(flocks.Select(f => new {
                id = f.Id,
                batchName = f.BatchName,
                birdType = f.BirdType,
                totalBirds = f.TotalBirds,
                aliveBirds = f.AliveBirds,
                status = f.Status,
                dateAcquired = f.DateAcquired,
                createdAt = f.CreatedAt
            }));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var userId = UserHelper.GetUserId(User);
            var flock = await _flockRepo.GetFlockWithRecordsAsync(id, userId);
            if (flock == null) return NotFound(new { message = "Flock not found" });
            return Ok(new
            {
                id = flock.Id,
                batchName = flock.BatchName,
                birdType = flock.BirdType,
                totalBirds = flock.TotalBirds,
                aliveBirds = flock.AliveBirds,
                status = flock.Status,
                dateAcquired = flock.DateAcquired
            });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateFlockRequest dto)
        {
            var userId = UserHelper.GetUserId(User);
            var flock = new Flock
            {
                BatchName = dto.BatchName,
                BirdType = dto.BirdType,
                TotalBirds = dto.TotalBirds,
                AliveBirds = dto.TotalBirds,
                DateAcquired = dto.DateAcquired,
                Status = "Active",
                UserId = userId
            };
            await _flockRepo.AddAsync(flock);
            await _flockRepo.SaveChangesAsync();
            return Ok(new { message = "Flock added", flock.Id });
        }

        [HttpPut("{id}/deactivate")]
        public async Task<IActionResult> Deactivate(int id)
        {
            var userId = UserHelper.GetUserId(User);
            var flock = await _flockRepo.GetByIdAsync(id);
            if (flock == null || flock.UserId != userId)
                return NotFound(new { message = "Flock not found" });
            flock.Status = "Inactive";
            flock.UpdatedAt = DateTime.UtcNow;
            _flockRepo.Update(flock);
            await _flockRepo.SaveChangesAsync();
            return Ok(new { message = "Flock deactivated" });
        }
    }

    public class CreateFlockRequest
    {
        public string BatchName { get; set; } = string.Empty;
        public string BirdType { get; set; } = "Layer";
        public int TotalBirds { get; set; }
        public DateTime DateAcquired { get; set; }
    }
}