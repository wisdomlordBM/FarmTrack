using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace FarmTrack.Core.Entities
{
    public class Flock : BaseEntity
    {
        public string BatchName { get; set; } = string.Empty;
        public string BirdType { get; set; } = "Layer";
        public int TotalBirds { get; set; }
        public int AliveBirds { get; set; }
        public DateTime DateAcquired { get; set; }
        public string Status { get; set; } = "Active";
        public string UserId { get; set; } = string.Empty;

        public ICollection<EggRecord> EggRecords { get; set; } = new List<EggRecord>();
        public ICollection<MortalityRecord> MortalityRecords { get; set; } = new List<MortalityRecord>();
        public ICollection<FeedRecord> FeedRecords { get; set; } = new List<FeedRecord>();
    }
}