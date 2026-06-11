using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FarmTrack.Core.Entities;
using FarmTrack.Core.Interfaces;
using FarmTrack.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FarmTrack.Infrastructure.Repositories
{
    public class EggRecordRepository : GenericRepository<EggRecord>, IEggRecordRepository
    {
        public EggRecordRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<EggRecord>> GetByDateRangeAsync(DateTime from, DateTime to)
            => await _context.EggRecords
                .Include(e => e.Flock)
                .Where(e => e.CollectionDate >= from && e.CollectionDate <= to)
                .OrderByDescending(e => e.CollectionDate)
                .ToListAsync();

        public async Task<int> GetTotalEggsForTodayAsync()
        {
            var today = DateTime.UtcNow.Date;
            return await _context.EggRecords
                .Where(e => e.CollectionDate.Date == today)
                .SumAsync(e => e.TotalCollected);
        }
    }
}
