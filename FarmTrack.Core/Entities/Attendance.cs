using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FarmTrack.Core.Entities
{
    public class Attendance : BaseEntity
    {
        public string UserId { get; set; } = string.Empty;
        public int WorkerId { get; set; }
        public Worker Worker { get; set; } = null!;
        public DateTime Date { get; set; }
        public bool Present { get; set; }
        public string? Notes { get; set; }
    }
}
