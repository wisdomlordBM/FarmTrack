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
    public class SaleController : ControllerBase
    {
        private readonly ISaleRepository _saleRepo;
        public SaleController(ISaleRepository saleRepo) => _saleRepo = saleRepo;

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var userId = UserHelper.GetUserId(User);
            var sales = await _saleRepo.GetAllAsync(userId); // switched to GetAllAsync so Flock is included
            return Ok(sales.OrderByDescending(s => s.CreatedAt).Select(s => new {
                id = s.Id,
                customerName = s.CustomerName,
                customerPhone = s.CustomerPhone,
                cratesSold = s.CratesSold,
                pricePerCrate = s.PricePerCrate,
                totalAmount = s.CratesSold * s.PricePerCrate,
                amountPaid = s.AmountPaid,
                balance = (s.CratesSold * s.PricePerCrate) - s.AmountPaid,
                paymentStatus = s.PaymentStatus,
                saleDate = s.SaleDate,
                recordedBy = s.RecordedBy,
                createdAt = s.CreatedAt,
                flockName = s.Flock?.BatchName   // ADD THIS
            }));
        }

        [HttpGet("unpaid")]
        public async Task<IActionResult> GetUnpaid()
        {
            var userId = UserHelper.GetUserId(User);
            var sales = await _saleRepo.GetUnpaidSalesAsync(userId);
            return Ok(sales);
        }

        [HttpGet("revenue/month")]
        public async Task<IActionResult> GetMonthlyRevenue()
        {
            var userId = UserHelper.GetUserId(User);
            var revenue = await _saleRepo.GetTotalRevenueThisMonthAsync(userId);
            return Ok(new { revenueThisMonth = revenue });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateSaleRequest dto)
        {
            var userId = UserHelper.GetUserId(User);
            var userName = User.FindFirstValue(ClaimTypes.Name) ?? "Unknown";
            var sale = new Sale
            {
                CustomerName = dto.CustomerName,
                CustomerPhone = dto.CustomerPhone,
                CratesSold = dto.CratesSold,
                PricePerCrate = dto.PricePerCrate,
                AmountPaid = dto.AmountPaid,
                SaleDate = dto.SaleDate,
                FlockId = dto.FlockId,           // ADD THIS
                PaymentStatus = dto.AmountPaid >= dto.CratesSold * dto.PricePerCrate
                    ? "Paid" : dto.AmountPaid > 0 ? "Partial" : "Pending",
                RecordedBy = userName,
                UserId = userId
            };
            await _saleRepo.AddAsync(sale);
            await _saleRepo.SaveChangesAsync();
            return Ok(new { message = "Sale recorded", sale.Id });
        }

        [HttpPut("{id}/pay")]
        public async Task<IActionResult> MarkAsPaid(int id, [FromBody] decimal amount)
        {
            var userId = UserHelper.GetUserId(User);
            var sale = await _saleRepo.GetByIdAsync(id);
            if (sale == null || sale.UserId != userId)
                return NotFound(new { message = "Sale not found" });
            sale.AmountPaid += amount;
            sale.PaymentStatus = sale.AmountPaid >= sale.CratesSold * sale.PricePerCrate
                ? "Paid" : "Partial";
            sale.UpdatedAt = DateTime.UtcNow;
            _saleRepo.Update(sale);
            await _saleRepo.SaveChangesAsync();
            return Ok(new { message = "Payment updated" });
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = UserHelper.GetUserId(User);
            var sale = await _saleRepo.GetByIdAsync(id);
            if (sale == null || sale.UserId != userId)
                return NotFound(new { message = "Sale not found" });
            _saleRepo.Delete(sale);
            await _saleRepo.SaveChangesAsync();
            return Ok(new { message = "Sale deleted" });
        }
    }

    public class CreateSaleRequest
    {
        public string CustomerName { get; set; } = string.Empty;
        public string? CustomerPhone { get; set; }
        public int CratesSold { get; set; }
        public decimal PricePerCrate { get; set; }
        public decimal AmountPaid { get; set; }
        public DateTime SaleDate { get; set; }
        public int? FlockId { get; set; }        // ADD THIS
    }
}