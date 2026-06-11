using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using FarmTrack.Core.Entities;
using FarmTrack.Core.Interfaces;
using FarmTrack.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FarmTrack.Infrastructure.Repositories
{
    public class BirdSaleRepository : GenericRepository<BirdSale>, IBirdSaleRepository
    {
        public BirdSaleRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<BirdSale>> GetAllWithFlockAsync()
            => await _context.BirdSales
                .Include(b => b.Flock)
                .OrderByDescending(b => b.SaleDate)
                .ToListAsync();

        public async Task<decimal> GetTotalRevenueThisMonthAsync()
        {
            var now = DateTime.UtcNow;
            var sales = await _context.BirdSales
                .Where(b => b.SaleDate.Month == now.Month && b.SaleDate.Year == now.Year)
                .ToListAsync();
            return sales.Sum(b => b.AmountPaid);
        }

        public async Task<IEnumerable<BirdSale>> GetUnpaidAsync()
            => await _context.BirdSales
                .Include(b => b.Flock)
                .Where(b => b.PaymentStatus != "Paid")
                .OrderByDescending(b => b.SaleDate)
                .ToListAsync();
    }
}
