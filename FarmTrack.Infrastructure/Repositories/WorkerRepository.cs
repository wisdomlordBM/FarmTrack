using System;
using FarmTrack.Core.Entities;
using FarmTrack.Core.Interfaces;
using FarmTrack.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FarmTrack.Infrastructure.Repositories
{
    public class WorkerRepository : GenericRepository<Worker>, IWorkerRepository
    {
        public WorkerRepository(AppDbContext context) : base(context) { }

       public async Task<IEnumerable<Worker>> GetActiveWorkersAsync()
          => await _context.Workers
        .Include(w => w.Attendances)
        .Where(w => w.IsActive)
        .OrderBy(w => w.FullName)
        .ToListAsync();
    }
}
