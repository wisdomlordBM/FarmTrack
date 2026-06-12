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
    public class ManureSaleController : ControllerBase
    {
        private readonly IManureSaleRepository _manureRepo;

        public ManureSaleController(IManureSaleRepository manureRepo)
        {
            _manureRepo = manureRepo;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var sales = await _manureRepo.GetAllAsync();
            var result = sales
                .OrderByDescending(s => s.CreatedAt)
                .Select(s => new
                {
                    id = s.Id,
                    saleDate = s.SaleDate,
                    customerName = s.CustomerName,
                    customerPhone = s.CustomerPhone,
                    numberOfBags = s.NumberOfBags,
                    pricePerBag = s.PricePerBag,
                    totalAmount = s.NumberOfBags * s.PricePerBag,
                    amountPaid = s.AmountPaid,
                    balance = (s.NumberOfBags * s.PricePerBag) - s.AmountPaid,
                    paymentStatus = s.PaymentStatus,
                    notes = s.Notes,
                    recordedBy = s.RecordedBy,
                    createdAt = s.CreatedAt
                });
            return Ok(result);
        }

        [HttpGet("revenue/month")]
        public async Task<IActionResult> GetMonthlyRevenue()
        {
            var revenue = await _manureRepo.GetTotalRevenueThisMonthAsync();
            return Ok(new { revenueThisMonth = revenue });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateManureSaleRequest dto)
        {
            var userName = User.FindFirstValue(ClaimTypes.Name) ?? "Admin";
            var total = dto.NumberOfBags * dto.PricePerBag;

            var sale = new ManureSale
            {
                SaleDate = dto.SaleDate,
                CustomerName = dto.CustomerName,
                CustomerPhone = dto.CustomerPhone,
                NumberOfBags = dto.NumberOfBags,
                PricePerBag = dto.PricePerBag,
                AmountPaid = dto.AmountPaid,
                Notes = dto.Notes,
                PaymentStatus = dto.AmountPaid >= total ? "Paid"
                    : dto.AmountPaid > 0 ? "Partial" : "Pending",
                RecordedBy = userName
            };

            await _manureRepo.AddAsync(sale);
            await _manureRepo.SaveChangesAsync();

            return Ok(new { message = "Manure sale recorded", sale.Id });
        }

        [HttpPut("{id}/pay")]
        public async Task<IActionResult> MarkPaid(int id, [FromBody] decimal amount)
        {
            var sale = await _manureRepo.GetByIdAsync(id);
            if (sale == null)
                return NotFound(new { message = "Sale not found" });

            sale.AmountPaid += amount;
            var total = sale.NumberOfBags * sale.PricePerBag;
            sale.PaymentStatus = sale.AmountPaid >= total ? "Paid"
                : sale.AmountPaid > 0 ? "Partial" : "Pending";
            sale.UpdatedAt = DateTime.UtcNow;

            _manureRepo.Update(sale);
            await _manureRepo.SaveChangesAsync();

            return Ok(new
            {
                message = "Payment updated",
                balance = total - sale.AmountPaid
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var sale = await _manureRepo.GetByIdAsync(id);
            if (sale == null)
                return NotFound(new { message = "Sale not found" });

            _manureRepo.Delete(sale);
            await _manureRepo.SaveChangesAsync();

            return Ok(new { message = "Deleted" });
        }
    }

    public class CreateManureSaleRequest
    {
        public DateTime SaleDate { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string? CustomerPhone { get; set; }
        public int NumberOfBags { get; set; }
        public decimal PricePerBag { get; set; }
        public decimal AmountPaid { get; set; }
        public string? Notes { get; set; }
    }
}