namespace FarmTrack.API.DTOs.Sales
{
    public class CreateSaleDto
    {
        public string CustomerName { get; set; } = string.Empty;
        public string? CustomerPhone { get; set; }
        public int CratesSold { get; set; }
        public decimal PricePerCrate { get; set; }
        public decimal AmountPaid { get; set; }
        public DateTime SaleDate { get; set; }
    }
}
