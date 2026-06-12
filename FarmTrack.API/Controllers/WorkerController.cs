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
            var result = workers
                .OrderByDescending(w => w.CreatedAt)
                .Select(w => new
                {
                    id = w.Id,
                    fullName = w.FullName,
                    phone = w.Phone,
                    role = w.Role,
                    monthlySalary = w.MonthlySalary,
                    dailyRate = w.DailyRate,
                    isActive = w.IsActive,
                    dateJoined = w.DateJoined,
                    address = w.Address,
                    nextOfKin = w.NextOfKin,
                    nextOfKinPhone = w.NextOfKinPhone,
                    createdAt = w.CreatedAt
                });
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateWorkerRequest dto)
        {
            var worker = new Worker
            {
                FullName = dto.FullName,
                Phone = dto.Phone,
                Role = dto.Role,
                MonthlySalary = dto.MonthlySalary,
                DateJoined = dto.DateJoined,
                Address = dto.Address,
                NextOfKin = dto.NextOfKin,
                NextOfKinPhone = dto.NextOfKinPhone,
                IsActive = true
            };

            await _workerRepo.AddAsync(worker);
            await _workerRepo.SaveChangesAsync();

            return Ok(new
            {
                message = "Worker added",
                worker.Id,
                dailyRate = worker.DailyRate
            });
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
                monthlySalary = w.MonthlySalary,
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

        [HttpPost("attendance")]
        public async Task<IActionResult> MarkAttendance([FromBody] MarkAttendanceRequest dto)
        {
            var worker = await _workerRepo.GetByIdAsync(dto.WorkerId);
            if (worker == null)
                return NotFound(new { message = "Worker not found" });

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

        [HttpGet("salary/month")]
        public async Task<IActionResult> GetMonthlySalarySummary(
            [FromQuery] int? month, [FromQuery] int? year)
        {
            var m = month ?? DateTime.UtcNow.Month;
            var y = year ?? DateTime.UtcNow.Year;

            var workers = await _workerRepo.GetActiveWorkersAsync();
            var workerList = workers.ToList();

            var totalMonthlySalary = workerList.Sum(w => w.MonthlySalary);
            var totalDailyRate = workerList.Sum(w => w.DailyRate);

            var byRole = workerList
                .GroupBy(w => w.Role)
                .Select(g => new
                {
                    role = g.Key,
                    count = g.Count(),
                    totalSalary = g.Sum(w => w.MonthlySalary)
                })
                .OrderByDescending(x => x.totalSalary)
                .ToList();

            return Ok(new
            {
                month = m,
                year = y,
                totalWorkers = workerList.Count,
                totalMonthlySalary,
                totalDailyRate,
                byRole,
                workers = workerList.Select(w => new
                {
                    w.Id,
                    w.FullName,
                    w.Role,
                    w.MonthlySalary,
                    w.DailyRate
                })
            });
        }

        [HttpPut("{id}/deactivate")]
        public async Task<IActionResult> Deactivate(int id)
        {
            var worker = await _workerRepo.GetByIdAsync(id);
            if (worker == null)
                return NotFound(new { message = "Worker not found" });

            worker.IsActive = false;
            worker.UpdatedAt = DateTime.UtcNow;
            _workerRepo.Update(worker);
            await _workerRepo.SaveChangesAsync();

            return Ok(new { message = "Worker removed" });
        }
    }

    public class CreateWorkerRequest
    {
        public string FullName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public decimal MonthlySalary { get; set; }
        public DateTime DateJoined { get; set; }
        public string? Address { get; set; }
        public string? NextOfKin { get; set; }
        public string? NextOfKinPhone { get; set; }
    }

    public class MarkAttendanceRequest
    {
        public int WorkerId { get; set; }
        public DateTime Date { get; set; }
        public bool Present { get; set; }
        public string? Notes { get; set; }
    }
}