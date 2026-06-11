using FarmTrack.API.DTOs.Workers;
using FarmTrack.Core.Entities;
using FarmTrack.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FarmTrack.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class WorkerController : ControllerBase
    {
        private readonly IWorkerRepository _workerRepo;

        public WorkerController(IWorkerRepository workerRepo)
        {
            _workerRepo = workerRepo;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var workers = await _workerRepo.GetActiveWorkersAsync();
            var result = workers.Select(w => new
            {
                id = w.Id,
                fullName = w.FullName,
                phone = w.Phone,
                role = w.Role,
                dailyRate = w.DailyRate,
                isActive = w.IsActive,
                dateJoined = w.DateJoined,
                createdAt = w.CreatedAt
            });
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateWorkerDto dto)
        {
            var worker = new Worker
            {
                FullName = dto.FullName,
                Phone = dto.Phone,
                Role = dto.Role,
                DailyRate = dto.DailyRate,
                DateJoined = dto.DateJoined,
                IsActive = true
            };

            await _workerRepo.AddAsync(worker);
            await _workerRepo.SaveChangesAsync();

            return Ok(new { message = "Worker added", worker.Id });
        }

        [HttpPost("attendance")]
        public async Task<IActionResult> MarkAttendance(MarkAttendanceDto dto)
        {
            var worker = await _workerRepo.GetByIdAsync(dto.WorkerId);
            if (worker == null) return NotFound(new { message = "Worker not found" });

            var attendance = new Attendance
            {
                WorkerId = dto.WorkerId,
                Date = dto.Date,
                Present = dto.Present,
                Notes = dto.Notes
            };

            worker.Attendances.Add(attendance);
            _workerRepo.Update(worker);
            await _workerRepo.SaveChangesAsync();

            return Ok(new { message = "Attendance marked" });
        }
        [HttpGet("attendance")]
        public async Task<IActionResult> GetAttendance([FromQuery] DateTime? date)
        {
            var targetDate = date?.Date ?? DateTime.UtcNow.Date;

            var workers = await _workerRepo.GetActiveWorkersAsync();
            var workerList = workers.ToList();

            var result = workerList.Select(w => new
            {
                workerId = w.Id,
                workerName = w.FullName,
                role = w.Role,
                dailyRate = w.DailyRate,
                attendance = w.Attendances
                    .Where(a => a.Date.Date == targetDate)
                    .Select(a => new
                    {
                        present = a.Present,
                        notes = a.Notes,
                        date = a.Date
                    })
                    .FirstOrDefault()
            });

            return Ok(new
            {
                date = targetDate,
                records = result
            });
        }
        [HttpPut("{id}/deactivate")]
        public async Task<IActionResult> Deactivate(int id)
        {
            var worker = await _workerRepo.GetByIdAsync(id);
            if (worker == null) return NotFound(new { message = "Worker not found" });

            worker.IsActive = false;
            worker.UpdatedAt = DateTime.UtcNow;
            _workerRepo.Update(worker);
            await _workerRepo.SaveChangesAsync();

            return Ok(new { message = "Worker deactivated" });
        }
    }
}
