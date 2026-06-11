using FarmTrack.API.DTOs.Sales;
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

        public SaleController(ISaleRepository saleRepo)
        {
            _saleRepo = saleRepo;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var sales = await _saleRepo.GetAllAsync();
            var result = sales.Select(s => new SaleResponseDto
            {
                Id = s.Id,
                CustomerName = s.CustomerName,
                CustomerPhone = s.CustomerPhone,
                CratesSold = s.CratesSold,
                PricePerCrate = s.PricePerCrate,
                TotalAmount = s.CratesSold * s.PricePerCrate,
                AmountPaid = s.AmountPaid,
                Balance = (s.CratesSold * s.PricePerCrate) - s.AmountPaid,
                PaymentStatus = s.PaymentStatus,
                SaleDate = s.SaleDate,
                RecordedBy = s.RecordedBy
            });
            return Ok(result);
        }

        [HttpGet("unpaid")]
        public async Task<IActionResult> GetUnpaid()
        {
            var sales = await _saleRepo.GetUnpaidSalesAsync();
            return Ok(sales);
        }

        [HttpGet("revenue/month")]
        public async Task<IActionResult> GetMonthlyRevenue()
        {
            var revenue = await _saleRepo.GetTotalRevenueThisMonthAsync();
            return Ok(new { revenueThisMonth = revenue });
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateSaleDto dto)
        {
            var userName = User.FindFirstValue(ClaimTypes.Name) ?? "Unknown";

            var sale = new Sale
            {
                CustomerName = dto.CustomerName,
                CustomerPhone = dto.CustomerPhone,
                CratesSold = dto.CratesSold,
                PricePerCrate = dto.PricePerCrate,
                AmountPaid = dto.AmountPaid,
                SaleDate = dto.SaleDate,
                PaymentStatus = dto.AmountPaid >= dto.CratesSold * dto.PricePerCrate ? "Paid" : "Pending",
                RecordedBy = userName
            };

            await _saleRepo.AddAsync(sale);
            await _saleRepo.SaveChangesAsync();

            return Ok(new { message = "Sale recorded", sale.Id });
        }

        [HttpPut("{id}/pay")]
        public async Task<IActionResult> MarkAsPaid(int id, [FromBody] decimal amount)
        {
            var sale = await _saleRepo.GetByIdAsync(id);
            if (sale == null) return NotFound(new { message = "Sale not found" });

            sale.AmountPaid += amount;
            sale.PaymentStatus = sale.AmountPaid >= sale.CratesSold * sale.PricePerCrate
                ? "Paid" : "Partial";
            sale.UpdatedAt = DateTime.UtcNow;

            _saleRepo.Update(sale);
            await _saleRepo.SaveChangesAsync();

            return Ok(new { message = "Payment updated", balance = (sale.CratesSold * sale.PricePerCrate) - sale.AmountPaid });
        }
    }
}