using FarmTrack.Core.Entities;

namespace FarmTrack.Core.Interfaces
{
    public interface IFlockRepository : IGenericRepository<Flock>
    {
        Task<IEnumerable<Flock>> GetActiveFlocks(string userId);
        Task<Flock?> GetFlockWithRecordsAsync(int flockId, string userId);
    }
}