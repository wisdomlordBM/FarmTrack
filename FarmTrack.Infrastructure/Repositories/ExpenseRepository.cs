using FarmTrack.Core.Entities;
using FarmTrack.Core.Interfaces;
using FarmTrack.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FarmTrack.Infrastructure.Repositories
{
    public class ExpenseRepository : GenericRepository<Expense>, IExpenseRepository
    {
        public ExpenseRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<Expense>> GetByMonthAsync(int month, int year, string userId)
            => await _context.Expenses
                .Where(e => e.Date.Month == month
                         && e.Date.Year == year
                         && e.UserId == userId)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();

        public async Task<decimal> GetTotalExpensesThisMonthAsync(string userId)
        {
            var now = DateTime.UtcNow;
            return await _context.Expenses
                .Where(e => e.Date.Month == now.Month
                         && e.Date.Year == now.Year
                         && e.UserId == userId)
                .SumAsync(e => e.Amount);
        }

        public async Task<IEnumerable<Expense>> GetByDateRangeAsync(
            DateTime from, DateTime to, string userId)
            => await _context.Expenses
                .Where(e => e.Date >= from && e.Date <= to && e.UserId == userId)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();
    }
}