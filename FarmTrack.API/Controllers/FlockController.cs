using FarmTrack.API.DTOs.Flock;
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

        public FlockController(IFlockRepository flockRepo)
        {
            _flockRepo = flockRepo;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var flocks = await _flockRepo.GetActiveFlocks();
            var result = flocks.Select(f => new FlockResponseDto
            {
                Id = f.Id,
                BatchName = f.BatchName,
                BirdType = f.BirdType,
                TotalBirds = f.TotalBirds,
                AliveBirds = f.AliveBirds,
                Status = f.Status,
                DateAcquired = f.DateAcquired,
                CreatedAt = f.CreatedAt
            });
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var flock = await _flockRepo.GetFlockWithRecordsAsync(id);
            if (flock == null) return NotFound(new { message = "Flock not found" });

            return Ok(new FlockResponseDto
            {
                Id = flock.Id,
                BatchName = flock.BatchName,
                BirdType = flock.BirdType,
                TotalBirds = flock.TotalBirds,
                AliveBirds = flock.AliveBirds,
                Status = flock.Status,
                DateAcquired = flock.DateAcquired,
                CreatedAt = flock.CreatedAt
            });
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateFlockDto dto)
        {
            var flock = new Flock
            {
                BatchName = dto.BatchName,
                BirdType = dto.BirdType,
                TotalBirds = dto.TotalBirds,
                AliveBirds = dto.TotalBirds,
                DateAcquired = dto.DateAcquired,
                Status = "Active"
            };

            await _flockRepo.AddAsync(flock);
            await _flockRepo.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = flock.Id }, flock);
        }

        [HttpPut("{id}/deactivate")]
        public async Task<IActionResult> Deactivate(int id)
        {
            var flock = await _flockRepo.GetByIdAsync(id);
            if (flock == null) return NotFound(new { message = "Flock not found" });

            flock.Status = "Inactive";
            flock.UpdatedAt = DateTime.UtcNow;
            _flockRepo.Update(flock);
            await _flockRepo.SaveChangesAsync();

            return Ok(new { message = "Flock deactivated" });
        }
    }
}
