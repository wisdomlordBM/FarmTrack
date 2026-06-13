using FarmTrack.Core.Entities;

namespace FarmTrack.Core.Interfaces
{
    public interface IExpenseRepository : IGenericRepository<Expense>
    {
        Task<IEnumerable<Expense>> GetByMonthAsync(int month, int year, string userId);
        Task<decimal> GetTotalExpensesThisMonthAsync(string userId);
        Task<IEnumerable<Expense>> GetByDateRangeAsync(DateTime from, DateTime to, string userId);
    }
}