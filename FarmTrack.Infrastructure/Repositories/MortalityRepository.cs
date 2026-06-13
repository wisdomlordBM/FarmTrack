using FarmTrack.Core.Entities;
using FarmTrack.Core.Interfaces;
using FarmTrack.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FarmTrack.Infrastructure.Repositories
{
    public class MortalityRepository : GenericRepository<MortalityRecord>, IMortalityRepository
    {
        public MortalityRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<MortalityRecord>> GetAllWithFlockAsync(string userId)
            => await _context.MortalityRecords
                .Include(m => m.Flock)
                .Where(m => m.UserId == userId)
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();

        public async Task<int> GetTotalDeathsThisMonthAsync(string userId)
        {
            var now = DateTime.UtcNow;
            return await _context.MortalityRecords
                .Where(m => m.Date.Month == now.Month
                         && m.Date.Year == now.Year
                         && m.UserId == userId)
                .SumAsync(m => m.NumberDied);
        }

        public async Task<IEnumerable<MortalityRecord>> GetByFlockAsync(
            int flockId, string userId)
            => await _context.MortalityRecords
                .Include(m => m.Flock)
                .Where(m => m.FlockId == flockId && m.UserId == userId)
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();
    }
}