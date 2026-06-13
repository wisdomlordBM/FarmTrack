using FarmTrack.Core.Entities;
using FarmTrack.Core.Interfaces;
using FarmTrack.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FarmTrack.Infrastructure.Repositories
{
    public class EggRecordRepository : GenericRepository<EggRecord>, IEggRecordRepository
    {
        public EggRecordRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<EggRecord>> GetByDateRangeAsync(
            DateTime from, DateTime to, string userId)
            => await _context.EggRecords
                .Include(e => e.Flock)
                .Where(e => e.CollectionDate >= from
                         && e.CollectionDate <= to
                         && e.UserId == userId)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();

        public async Task<int> GetTotalEggsForTodayAsync(string userId)
        {
            var today = DateTime.UtcNow.Date;
            return await _context.EggRecords
                .Where(e => e.CollectionDate.Date == today && e.UserId == userId)
                .SumAsync(e => e.TotalCollected);
        }
    }
}