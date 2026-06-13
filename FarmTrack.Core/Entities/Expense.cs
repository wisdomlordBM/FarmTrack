namespace FarmTrack.Core.Entities
{
    public class Expense : BaseEntity
    {
        public string Title { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public string? Description { get; set; }
        public string RecordedBy { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
    }
}
