using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using FarmTrack.Core.Entities;

namespace FarmTrack.Core.Interfaces
{
    public interface IManureSaleRepository : IGenericRepository<ManureSale>
    {
        Task<decimal> GetTotalRevenueThisMonthAsync();
        Task<IEnumerable<ManureSale>> GetUnpaidAsync();
    }
}
