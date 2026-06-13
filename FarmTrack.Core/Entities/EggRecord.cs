using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FarmTrack.Core.Entities
{
    public class EggRecord : BaseEntity
    {
        public int FlockId { get; set; }
        public Flock Flock { get; set; } = null!;
        public DateTime CollectionDate { get; set; }
        public int TotalCollected { get; set; }
        public int CrackedEggs { get; set; }
        public int GoodEggs => TotalCollected - CrackedEggs;
        public string? Notes { get; set; }
        public string RecordedBy { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
    }
}
