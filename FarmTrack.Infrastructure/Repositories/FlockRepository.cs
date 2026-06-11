using System;
using FarmTrack.Core.Entities;
using FarmTrack.Core.Interfaces;
using FarmTrack.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FarmTrack.Infrastructure.Repositories
{
    public class FlockRepository : GenericRepository<Flock>, IFlockRepository
    {
        public FlockRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<Flock>> GetActiveFlocks()
            => await _context.Flocks
                .Where(f => f.Status == "Active")
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();

        public async Task<Flock?> GetFlockWithRecordsAsync(int flockId)
            => await _context.Flocks
                .Include(f => f.EggRecords)
                .Include(f => f.MortalityRecords)
                .Include(f => f.FeedRecords)
                .FirstOrDefaultAsync(f => f.Id == flockId);
    }
}
