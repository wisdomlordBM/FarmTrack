using FarmTrack.Core.Entities;
using FarmTrack.Core.Interfaces;
using FarmTrack.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FarmTrack.Infrastructure.Repositories
{
    public class ManureSaleRepository : GenericRepository<ManureSale>, IManureSaleRepository
    {
        public ManureSaleRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<ManureSale>> GetAllAsync(string userId)
            => await _context.ManureSales
                .Where(m => m.UserId == userId)
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();

        public async Task<IEnumerable<ManureSale>> GetByDateRangeAsync(
            DateTime from, DateTime to, string userId)
            => await _context.ManureSales
                .Where(m => m.SaleDate >= from && m.SaleDate < to && m.UserId == userId)
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();

        public async Task<decimal> GetTotalRevenueThisMonthAsync(string userId)
        {
            var now = DateTime.UtcNow;
            var sales = await _context.ManureSales
                .Where(m => m.SaleDate.Month == now.Month
                         && m.SaleDate.Year == now.Year
                         && m.UserId == userId)
                .ToListAsync();
            return sales.Sum(m => m.AmountPaid);
        }

        public async Task<IEnumerable<ManureSale>> GetUnpaidAsync(string userId)
            => await _context.ManureSales
                .Where(m => m.PaymentStatus != "Paid" && m.UserId == userId)
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();
    }
}