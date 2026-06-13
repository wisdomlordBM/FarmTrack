using FarmTrack.Core.Entities;

namespace FarmTrack.Core.Interfaces
{
    public interface IEggRecordRepository : IGenericRepository<EggRecord>
    {
        Task<IEnumerable<EggRecord>> GetByDateRangeAsync(DateTime from, DateTime to, string userId);
        Task<int> GetTotalEggsForTodayAsync(string userId);
    }
}
