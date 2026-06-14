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
    public class FarmProfileRepository : GenericRepository<FarmProfile>, IFarmProfileRepository
    {
        public FarmProfileRepository(AppDbContext context) : base(context) { }

        public async Task<FarmProfile?> GetByUserIdAsync(string userId)
            => await _context.FarmProfiles.FirstOrDefaultAsync(f => f.UserId == userId);
    }
}