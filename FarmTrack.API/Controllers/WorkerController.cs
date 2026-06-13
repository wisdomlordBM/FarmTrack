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
    public class WorkerController : ControllerBase
    {
        private readonly IWorkerRepository _workerRepo;
        public WorkerController(IWorkerRepository workerRepo) => _workerRepo = workerRepo;

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var userId = UserHelper.GetUserId(User);
            var workers = await _workerRepo.GetActiveWorkersAsync(userId);
            return Ok(workers.Select(w => new {
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
            }));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateWorkerRequest dto)
        {
            var userId = UserHelper.GetUserId(User);
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
                IsActive = true,
                UserId = userId
            };
            await _workerRepo.AddAsync(worker);
            await _workerRepo.SaveChangesAsync();
            return Ok(new { message = "Worker added", worker.Id, dailyRate = worker.DailyRate });
        }

        [HttpGet("attendance")]
        public async Task<IActionResult> GetAttendance([FromQuery] DateTime? date)
        {
            var userId = UserHelper.GetUserId(User);
            var targetDate = date?.Date ?? DateTime.UtcNow.Date;
            var workers = await _workerRepo.GetActiveWorkersAsync(userId);
            var result = workers.Select(w => new {
                workerId = w.Id,
                workerName = w.FullName,
                role = w.Role,
                dailyRate = w.DailyRate,
                monthlySalary = w.MonthlySalary,
                attendance = w.Attendances
                    .Where(a => a.Date.Date == targetDate)
                    .Select(a => new { present = a.Present, notes = a.Notes, date = a.Date })
                    .FirstOrDefault()
            });
            return Ok(new { date = targetDate, records = result });
        }

        [HttpPost("attendance")]
        public async Task<IActionResult> MarkAttendance([FromBody] MarkAttendanceRequest dto)
        {
            var userId = UserHelper.GetUserId(User);
            var worker = await _workerRepo.GetByIdAsync(dto.WorkerId);
            if (worker == null || worker.UserId != userId)
                return NotFound(new { message = "Worker not found" });
            worker.Attendances.Add(new Attendance
            {
                WorkerId = dto.WorkerId,
                Date = dto.Date,
                Present = dto.Present,
                Notes = dto.Notes
            });
            _workerRepo.Update(worker);
            await _workerRepo.SaveChangesAsync();
            return Ok(new { message = "Attendance marked" });
        }

        [HttpGet("salary/month")]
        public async Task<IActionResult> GetMonthlySalarySummary()
        {
            var userId = UserHelper.GetUserId(User);
            var workers = await _workerRepo.GetActiveWorkersAsync(userId);
            var list = workers.ToList();
            return Ok(new
            {
                totalWorkers = list.Count,
                totalMonthlySalary = list.Sum(w => w.MonthlySalary),
                totalDailyRate = list.Sum(w => w.DailyRate),
                byRole = list.GroupBy(w => w.Role)
                    .Select(g => new { role = g.Key, count = g.Count(), totalSalary = g.Sum(w => w.MonthlySalary) })
                    .OrderByDescending(x => x.totalSalary),
                workers = list.Select(w => new {
                    id = w.Id,
                    fullName = w.FullName,
                    role = w.Role,
                    monthlySalary = w.MonthlySalary,
                    dailyRate = w.DailyRate
                })
            });
        }

        [HttpPut("{id}/deactivate")]
        public async Task<IActionResult> Deactivate(int id)
        {
            var userId = UserHelper.GetUserId(User);
            var worker = await _workerRepo.GetByIdAsync(id);
            if (worker == null || worker.UserId != userId)
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