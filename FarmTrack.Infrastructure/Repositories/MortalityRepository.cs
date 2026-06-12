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
    public class MortalityRepository : GenericRepository<MortalityRecord>, IMortalityRepository
    {
        public MortalityRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<MortalityRecord>> GetAllWithFlockAsync()
          => await _context.MortalityRecords
        .Include(m => m.Flock)
        .OrderByDescending(m => m.CreatedAt)
        .ToListAsync();

        public async Task<int> GetTotalDeathsThisMonthAsync()
        {
            var now = DateTime.UtcNow;
            return await _context.MortalityRecords
                .Where(m => m.Date.Month == now.Month
                         && m.Date.Year == now.Year)
                .SumAsync(m => m.NumberDied);
        }

        public async Task<IEnumerable<MortalityRecord>> GetByFlockAsync(int flockId)
            => await _context.MortalityRecords
                .Include(m => m.Flock)
                .Where(m => m.FlockId == flockId)
                .OrderByDescending(m => m.Date)
                .ToListAsync();
    }
}
