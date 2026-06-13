using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FarmTrack.Core.Entities
{
    public class ManureSale : BaseEntity
    {
        public DateTime SaleDate { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string? CustomerPhone { get; set; }
        public int NumberOfBags { get; set; }
        public decimal PricePerBag { get; set; }
        public decimal TotalAmount => NumberOfBags * PricePerBag;
        public decimal AmountPaid { get; set; }
        public decimal Balance => TotalAmount - AmountPaid;
        public string PaymentStatus { get; set; } = "Pending";
        public string? Notes { get; set; }
        public string RecordedBy { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
    }
}
