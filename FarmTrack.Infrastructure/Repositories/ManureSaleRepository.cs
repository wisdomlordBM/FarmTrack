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
    public class ManureSaleRepository : GenericRepository<ManureSale>, IManureSaleRepository
    {
        public ManureSaleRepository(AppDbContext context) : base(context) { }

        public async Task<decimal> GetTotalRevenueThisMonthAsync()
        {
            var now = DateTime.UtcNow;
            var sales = await _context.ManureSales
                .Where(m => m.SaleDate.Month == now.Month
                         && m.SaleDate.Year == now.Year)
                .ToListAsync();
            return sales.Sum(m => m.AmountPaid);
        }

        public async Task<IEnumerable<ManureSale>> GetUnpaidAsync()
            => await _context.ManureSales
                .Where(m => m.PaymentStatus != "Paid")
                .OrderByDescending(m => m.SaleDate)
                .ToListAsync();
    }
}