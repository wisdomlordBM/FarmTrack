using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace FarmTrack.Core.Entities
{
    public class Worker : BaseEntity
    {
        public string FullName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public decimal DailyRate { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime DateJoined { get; set; }

        public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
    }
}