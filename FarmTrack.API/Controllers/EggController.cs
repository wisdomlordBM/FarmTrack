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
    public class EggController : ControllerBase
    {
        private readonly IEggRecordRepository _eggRepo;
        private readonly IFlockRepository _flockRepo;
        private readonly ISaleRepository _saleRepo;   // ADD THIS

        public EggController(
            IEggRecordRepository eggRepo,
            IFlockRepository flockRepo,
            ISaleRepository saleRepo)                 // ADD THIS
        {
            _eggRepo = eggRepo;
            _flockRepo = flockRepo;
            _saleRepo = saleRepo;                     // ADD THIS
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var userId = UserHelper.GetUserId(User);
            var records = await _eggRepo.FindAsync(e => e.UserId == userId);
            return Ok(records.OrderByDescending(e => e.CreatedAt));
        }

        [HttpGet("today")]
        public async Task<IActionResult> GetTodayTotal()
        {
            var userId = UserHelper.GetUserId(User);
            var total = await _eggRepo.GetTotalEggsForTodayAsync(userId);
            return Ok(new { totalEggsToday = total });
        }

        [HttpGet("range")]
        public async Task<IActionResult> GetByRange([FromQuery] DateTime from, [FromQuery] DateTime to)
        {
            var userId = UserHelper.GetUserId(User);
            var records = await _eggRepo.GetByDateRangeAsync(from, to, userId);
            return Ok(records.Select(e => new {
                id = e.Id,
                flockId = e.FlockId,
                flockName = e.Flock?.BatchName ?? "",
                collectionDate = e.CollectionDate,
                totalCollected = e.TotalCollected,
                crackedEggs = e.CrackedEggs,
                goodEggs = e.TotalCollected - e.CrackedEggs,
                notes = e.Notes,
                recordedBy = e.RecordedBy
            }));
        }

        [HttpGet("stock")]
        public async Task<IActionResult> GetStock()
        {
            var userId = UserHelper.GetUserId(User);
            var eggRecords = await _eggRepo.GetAllAsync(userId);
            var sales = await _saleRepo.GetAllAsync(userId);
            var flocks = await _flockRepo.GetActiveFlocks(userId);

            int EggsSold(int crates, int eggsPerCrate) => crates * (eggsPerCrate > 0 ? eggsPerCrate : 30);

            var totalCollected = eggRecords.Sum(e => e.GoodEggs);
            var totalSold = sales.Sum(s => EggsSold(s.CratesSold, s.EggsPerCrate));
            var inStock = totalCollected - totalSold;

            var flockBreakdown = flocks.Select(f =>
            {
                var collected = eggRecords.Where(e => e.FlockId == f.Id).Sum(e => e.GoodEggs);
                var sold = sales.Where(s => s.FlockId == f.Id).Sum(s => EggsSold(s.CratesSold, s.EggsPerCrate));
                return new
                {
                    flockId = f.Id,
                    flockName = f.BatchName,
                    collected,
                    sold,
                    inStock = collected - sold
                };
            });

            return Ok(new
            {
                totalEggsCollected = totalCollected,
                totalEggsSold = totalSold,
                eggsInStock = inStock,
                cratesInStock = inStock / 30,
                remainderEggs = inStock % 30,
                flocks = flockBreakdown
            });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateEggRecordRequest dto)
        {
            var userId = UserHelper.GetUserId(User);
            var flock = await _flockRepo.GetByIdAsync(dto.FlockId);
            if (flock == null || flock.UserId != userId)
                return NotFound(new { message = "Flock not found" });

            var userName = User.FindFirstValue(ClaimTypes.Name) ?? "Unknown";
            var record = new EggRecord
            {
                FlockId = dto.FlockId,
                CollectionDate = dto.CollectionDate,
                TotalCollected = dto.TotalCollected,
                CrackedEggs = dto.CrackedEggs,
                Notes = dto.Notes,
                RecordedBy = userName,
                UserId = userId
            };
            await _eggRepo.AddAsync(record);
            await _eggRepo.SaveChangesAsync();
            return Ok(new { message = "Egg record saved", record.Id });
        }
    }

    public class CreateEggRecordRequest
    {
        public int FlockId { get; set; }
        public DateTime CollectionDate { get; set; }
        public int TotalCollected { get; set; }
        public int CrackedEggs { get; set; }
        public string? Notes { get; set; }
    }
}