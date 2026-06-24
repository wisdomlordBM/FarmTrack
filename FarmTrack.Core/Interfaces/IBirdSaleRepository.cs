using FarmTrack.Core.Entities;

namespace FarmTrack.Core.Interfaces
{
    public interface IBirdSaleRepository : IGenericRepository<BirdSale>
    {
        Task<IEnumerable<BirdSale>> GetAllWithFlockAsync(string userId);
        Task<decimal> GetTotalRevenueThisMonthAsync(string userId);
        Task<IEnumerable<BirdSale>> GetUnpaidAsync(string userId);
        Task<IEnumerable<BirdSale>> GetByDateRangeAsync(DateTime from, DateTime to, string userId);
        Task<IEnumerable<BirdSale>> GetAllAsync(string userId);
    }
}