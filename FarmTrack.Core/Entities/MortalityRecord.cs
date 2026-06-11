using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace FarmTrack.Core.Entities
{
    public class MortalityRecord : BaseEntity
    {
        public int FlockId { get; set; }
        public Flock Flock { get; set; } = null!;
        public DateTime Date { get; set; }
        public int NumberDied { get; set; }
        public string Cause { get; set; } = string.Empty;
        public string RecordedBy { get; set; } = string.Empty;
    }
}