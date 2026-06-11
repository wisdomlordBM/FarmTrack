using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using FarmTrack.Core.Entities;

namespace FarmTrack.Core.Interfaces
{
    public interface IExpenseRepository : IGenericRepository<Expense>
    {
        Task<IEnumerable<Expense>> GetByMonthAsync(int month, int year);
        Task<decimal> GetTotalExpensesThisMonthAsync();
        Task<IEnumerable<Expense>> GetByDateRangeAsync(DateTime from, DateTime to);
    }
}
