namespace FarmTrack.API.DTOs.Eggs
{
    public class EggRecordResponseDto
    {
        public int Id { get; set; }
        public int FlockId { get; set; }
        public string FlockName { get; set; } = string.Empty;
        public DateTime CollectionDate { get; set; }
        public int TotalCollected { get; set; }
        public int CrackedEggs { get; set; }
        public int GoodEggs { get; set; }
        public string? Notes { get; set; }
        public string RecordedBy { get; set; } = string.Empty;
    }
}
