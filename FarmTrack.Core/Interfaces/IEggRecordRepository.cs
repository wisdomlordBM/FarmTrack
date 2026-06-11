using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using FarmTrack.Core.Entities;

namespace FarmTrack.Core.Interfaces
{
    public interface IEggRecordRepository : IGenericRepository<EggRecord>
    {
        Task<IEnumerable<EggRecord>> GetByDateRangeAsync(DateTime from, DateTime to);
        Task<int> GetTotalEggsForTodayAsync();
    }
}
