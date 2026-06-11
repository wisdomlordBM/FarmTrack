namespace FarmTrack.API.DTOs.Sales
{
    public class SaleResponseDto
    {
        public int Id { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string? CustomerPhone { get; set; }
        public int CratesSold { get; set; }
        public decimal PricePerCrate { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal AmountPaid { get; set; }
        public decimal Balance { get; set; }
        public string PaymentStatus { get; set; } = string.Empty;
        public DateTime SaleDate { get; set; }
        public string RecordedBy { get; set; } = string.Empty;
    }
}