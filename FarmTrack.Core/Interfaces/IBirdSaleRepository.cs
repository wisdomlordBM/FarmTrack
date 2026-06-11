using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FarmTrack.Core.Entities;

namespace FarmTrack.Core.Interfaces
{
    public interface IBirdSaleRepository : IGenericRepository<BirdSale>
    {
        Task<IEnumerable<BirdSale>> GetAllWithFlockAsync();
        Task<decimal> GetTotalRevenueThisMonthAsync();
        Task<IEnumerable<BirdSale>> GetUnpaidAsync();
    }
}
