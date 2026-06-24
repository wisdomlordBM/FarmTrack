using FarmTrack.Core.Entities;
using FarmTrack.Core.Interfaces;
using FarmTrack.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FarmTrack.Infrastructure.Repositories
{
    public class BirdSaleRepository : GenericRepository<BirdSale>, IBirdSaleRepository
    {
        public BirdSaleRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<BirdSale>> GetAllWithFlockAsync(string userId)
            => await _context.BirdSales
                .Include(b => b.Flock)
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

        public async Task<IEnumerable<BirdSale>> GetAllAsync(string userId)
            => await _context.BirdSales
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

        public async Task<IEnumerable<BirdSale>> GetByDateRangeAsync(
            DateTime from, DateTime to, string userId)
            => await _context.BirdSales
                .Where(b => b.SaleDate >= from && b.SaleDate < to && b.UserId == userId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

        public async Task<decimal> GetTotalRevenueThisMonthAsync(string userId)
        {
            var now = DateTime.UtcNow;
            var sales = await _context.BirdSales
                .Where(b => b.SaleDate.Month == now.Month
                         && b.SaleDate.Year == now.Year
                         && b.UserId == userId)
                .ToListAsync();
            return sales.Sum(b => b.AmountPaid);
        }

        public async Task<IEnumerable<BirdSale>> GetUnpaidAsync(string userId)
            => await _context.BirdSales
                .Include(b => b.Flock)
                .Where(b => b.PaymentStatus != "Paid" && b.UserId == userId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
    }
}