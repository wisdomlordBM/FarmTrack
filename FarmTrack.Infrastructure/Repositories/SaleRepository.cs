using FarmTrack.Core.Entities;
using FarmTrack.Core.Interfaces;
using FarmTrack.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FarmTrack.Infrastructure.Repositories
{
    public class SaleRepository : GenericRepository<Sale>, ISaleRepository
    {
        public SaleRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<Sale>> GetUnpaidSalesAsync(string userId)
            => await _context.Sales
                .Where(s => s.PaymentStatus != "Paid" && s.UserId == userId)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();

        public async Task<decimal> GetTotalRevenueThisMonthAsync(string userId)
        {
            var now = DateTime.UtcNow;
            var sales = await _context.Sales
                .Where(s => s.SaleDate.Month == now.Month
                         && s.SaleDate.Year == now.Year
                         && s.UserId == userId)
                .ToListAsync();
            return sales.Sum(s => s.AmountPaid);
        }
    }
}