using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace FarmTrack.Core.Entities
{
    public class FeedRecord : BaseEntity
    {
        public int FlockId { get; set; }
        public Flock Flock { get; set; } = null!;
        public DateTime Date { get; set; }
        public string FeedType { get; set; } = string.Empty;
        public decimal QuantityKg { get; set; }
        public decimal CostPerKg { get; set; }
        public decimal TotalCost => QuantityKg * CostPerKg;
        public string Type { get; set; } = "Consumption";
    }
}
