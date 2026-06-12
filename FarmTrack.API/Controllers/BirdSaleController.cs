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
    public class BirdSaleController : ControllerBase
    {
        private readonly IBirdSaleRepository _birdSaleRepo;
        private readonly IFlockRepository _flockRepo;

        public BirdSaleController(
            IBirdSaleRepository birdSaleRepo,
            IFlockRepository flockRepo)
        {
            _birdSaleRepo = birdSaleRepo;
            _flockRepo = flockRepo;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var sales = await _birdSaleRepo.GetAllWithFlockAsync();
            var result = sales.Select(b => new
            {
                id = b.Id,
                flockId = b.FlockId,
                flockName = b.Flock?.BatchName ?? "",
                saleDate = b.SaleDate,
                customerName = b.CustomerName,
                customerPhone = b.CustomerPhone,
                numberOfBirds = b.NumberOfBirds,
                pricePerBird = b.PricePerBird,
                totalAmount = b.NumberOfBirds * b.PricePerBird,
                amountPaid = b.AmountPaid,
                balance = (b.NumberOfBirds * b.PricePerBird) - b.AmountPaid,
                paymentStatus = b.PaymentStatus,
                reason = b.Reason,
                notes = b.Notes,
                recordedBy = b.RecordedBy,
                createdAt = b.CreatedAt
            });
            return Ok(result);
        }

        [HttpGet("unpaid")]
        public async Task<IActionResult> GetUnpaid()
        {
            var sales = await _birdSaleRepo.GetUnpaidAsync();
            return Ok(sales);
        }

        [HttpGet("revenue/month")]
        public async Task<IActionResult> GetMonthlyRevenue()
        {
            var revenue = await _birdSaleRepo.GetTotalRevenueThisMonthAsync();
            return Ok(new { revenueThisMonth = revenue });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateBirdSaleRequest dto)
        {
            var flock = await _flockRepo.GetByIdAsync(dto.FlockId);
            if (flock == null)
                return NotFound(new { message = "Flock not found" });

            if (dto.NumberOfBirds > flock.AliveBirds)
                return BadRequest(new { message = $"Only {flock.AliveBirds} birds available in this flock" });

            var userName = User.FindFirstValue(ClaimTypes.Name) ?? "Admin";

            var sale = new BirdSale
            {
                FlockId = dto.FlockId,
                SaleDate = dto.SaleDate,
                CustomerName = dto.CustomerName,
                CustomerPhone = dto.CustomerPhone,
                NumberOfBirds = dto.NumberOfBirds,
                PricePerBird = dto.PricePerBird,
                AmountPaid = dto.AmountPaid,
                Reason = dto.Reason,
                Notes = dto.Notes,
                PaymentStatus = dto.AmountPaid >= dto.NumberOfBirds * dto.PricePerBird
                    ? "Paid" : dto.AmountPaid > 0 ? "Partial" : "Pending",
                RecordedBy = userName
            };

            flock.AliveBirds -= dto.NumberOfBirds;
            flock.UpdatedAt = DateTime.UtcNow;
            _flockRepo.Update(flock);

            await _birdSaleRepo.AddAsync(sale);
            await _birdSaleRepo.SaveChangesAsync();

            return Ok(new { message = "Bird sale recorded", sale.Id });
        }

        [HttpPut("{id}/pay")]
        public async Task<IActionResult> MarkPaid(int id, [FromBody] decimal amount)
        {
            var sale = await _birdSaleRepo.GetByIdAsync(id);
            if (sale == null)
                return NotFound(new { message = "Sale not found" });

            sale.AmountPaid += amount;
            var total = sale.NumberOfBirds * sale.PricePerBird;
            sale.PaymentStatus = sale.AmountPaid >= total ? "Paid"
                : sale.AmountPaid > 0 ? "Partial" : "Pending";
            sale.UpdatedAt = DateTime.UtcNow;

            _birdSaleRepo.Update(sale);
            await _birdSaleRepo.SaveChangesAsync();

            return Ok(new
            {
                message = "Payment updated",
                balance = total - sale.AmountPaid
            });
        }
    }

    public class CreateBirdSaleRequest
    {
        public int FlockId { get; set; }
        public DateTime SaleDate { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string? CustomerPhone { get; set; }
        public int NumberOfBirds { get; set; }
        public decimal PricePerBird { get; set; }
        public decimal AmountPaid { get; set; }
        public string Reason { get; set; } = "Old Layers";
        public string? Notes { get; set; }
    }
}
