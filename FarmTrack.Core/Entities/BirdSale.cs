using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FarmTrack.Core.Entities
{
    public class BirdSale : BaseEntity
    {
        public int FlockId { get; set; }
        public Flock Flock { get; set; } = null!;
        public DateTime SaleDate { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string? CustomerPhone { get; set; }
        public int NumberOfBirds { get; set; }
        public decimal PricePerBird { get; set; }
        public decimal TotalAmount => NumberOfBirds * PricePerBird;
        public decimal AmountPaid { get; set; }
        public decimal Balance => TotalAmount - AmountPaid;
        public string PaymentStatus { get; set; } = "Pending";
        public string Reason { get; set; } = "Old Layers";
        public string? Notes { get; set; }
        public string RecordedBy { get; set; } = string.Empty;
    }
}