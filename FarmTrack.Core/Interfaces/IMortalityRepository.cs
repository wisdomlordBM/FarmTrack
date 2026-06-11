using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FarmTrack.Core.Entities;

namespace FarmTrack.Core.Interfaces
{
    public interface IMortalityRepository : IGenericRepository<MortalityRecord>
    {
        Task<IEnumerable<MortalityRecord>> GetAllWithFlockAsync();
        Task<int> GetTotalDeathsThisMonthAsync();
        Task<IEnumerable<MortalityRecord>> GetByFlockAsync(int flockId);
    }
}
