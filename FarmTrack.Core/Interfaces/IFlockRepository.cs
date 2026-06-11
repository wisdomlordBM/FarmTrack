using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using FarmTrack.Core.Entities;

namespace FarmTrack.Core.Interfaces
{
    public interface IFlockRepository : IGenericRepository<Flock>
    {
        Task<IEnumerable<Flock>> GetActiveFlocks();
        Task<Flock?> GetFlockWithRecordsAsync(int flockId);
    }
}
