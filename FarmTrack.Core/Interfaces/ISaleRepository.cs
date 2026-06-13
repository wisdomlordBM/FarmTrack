using FarmTrack.Core.Entities;

namespace FarmTrack.Core.Interfaces
{
    public interface ISaleRepository : IGenericRepository<Sale>
    {
        Task<IEnumerable<Sale>> GetUnpaidSalesAsync(string userId);
        Task<decimal> GetTotalRevenueThisMonthAsync(string userId);
    }
}