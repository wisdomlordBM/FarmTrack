using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FarmTrack.Core.Entities;

namespace FarmTrack.Core.Interfaces
{
    public interface ISaleRepository : IGenericRepository<Sale>
    {
        Task<IEnumerable<Sale>> GetUnpaidSalesAsync();
        Task<decimal> GetTotalRevenueThisMonthAsync();
    }
}
