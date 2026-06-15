using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace FarmTrack.Core.Entities
{
    public class Sale : BaseEntity
    {
        public DateTime SaleDate { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string? CustomerPhone { get; set; }
        public int CratesSold { get; set; }
        public int EggsPerCrate { get; set; } = 30;
        public decimal PricePerCrate { get; set; }
        public decimal TotalAmount => CratesSold * PricePerCrate;
        public decimal AmountPaid { get; set; }
        public decimal Balance => TotalAmount - AmountPaid;
        public string PaymentStatus { get; set; } = "Pending";
        public string RecordedBy { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public int? FlockId { get; set; }
        public Flock? Flock { get; set; }
    }
}