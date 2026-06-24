using FarmTrack.Core.Entities;

namespace FarmTrack.Core.Interfaces
{
    public interface IManureSaleRepository : IGenericRepository<ManureSale>
    {
        Task<decimal> GetTotalRevenueThisMonthAsync(string userId);
        Task<IEnumerable<ManureSale>> GetUnpaidAsync(string userId);
        Task<IEnumerable<ManureSale>> GetByDateRangeAsync(DateTime from, DateTime to, string userId);
        Task<IEnumerable<ManureSale>> GetAllAsync(string userId);
    }
}