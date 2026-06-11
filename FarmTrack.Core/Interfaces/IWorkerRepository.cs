using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using FarmTrack.Core.Entities;

namespace FarmTrack.Core.Interfaces
{
    public interface IWorkerRepository : IGenericRepository<Worker>
    {
        Task<IEnumerable<Worker>> GetActiveWorkersAsync();
    }
}
