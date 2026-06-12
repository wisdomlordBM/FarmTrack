using FarmTrack.Core.Entities;
using FarmTrack.Core.Interfaces;
using FarmTrack.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FarmTrack.Infrastructure.Repositories
{
    public class ExpenseRepository : GenericRepository<Expense>, IExpenseRepository
    {
        public ExpenseRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<Expense>> GetByMonthAsync(int month, int year)
            => await _context.Expenses
                .Where(e => e.Date.Month == month && e.Date.Year == year)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();

        public async Task<decimal> GetTotalExpensesThisMonthAsync()
        {
            var now = DateTime.UtcNow;
            return await _context.Expenses
                .Where(e => e.Date.Month == now.Month && e.Date.Year == now.Year)
                .SumAsync(e => e.Amount);
        }

        public async Task<IEnumerable<Expense>> GetByDateRangeAsync(DateTime from, DateTime to)
            => await _context.Expenses
                .Where(e => e.Date >= from && e.Date <= to)
                .OrderByDescending(e => e.Date)
                .ToListAsync();
    }
}
