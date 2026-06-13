using FarmTrack.Core.Entities;

namespace FarmTrack.Core.Interfaces
{
    public interface IWorkerRepository : IGenericRepository<Worker>
    {
        Task<IEnumerable<Worker>> GetActiveWorkersAsync(string userId);
    }
}