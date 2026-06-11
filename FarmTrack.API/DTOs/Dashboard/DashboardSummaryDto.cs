namespace FarmTrack.API.DTOs.Dashboard
{
    public class DashboardSummaryDto
    {
        public int TotalEggsToday { get; set; }
        public int TotalActiveBirds { get; set; }
        public int TotalActiveFlocks { get; set; }
        public decimal RevenueThisMonth { get; set; }
        public int UnpaidSalesCount { get; set; }
        public int TotalWorkers { get; set; }
        public List<EggTrendDto> EggTrend { get; set; } = new();
    }

    public class EggTrendDto
    {
        public string Date { get; set; } = string.Empty;
        public int TotalEggs { get; set; }
    }
}
