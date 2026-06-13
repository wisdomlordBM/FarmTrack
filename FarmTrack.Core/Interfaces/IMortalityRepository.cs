using FarmTrack.Core.Entities;

namespace FarmTrack.Core.Interfaces
{
    public interface IMortalityRepository : IGenericRepository<MortalityRecord>
    {
        Task<IEnumerable<MortalityRecord>> GetAllWithFlockAsync(string userId);
        Task<int> GetTotalDeathsThisMonthAsync(string userId);
        Task<IEnumerable<MortalityRecord>> GetByFlockAsync(int flockId, string userId);
    }
}