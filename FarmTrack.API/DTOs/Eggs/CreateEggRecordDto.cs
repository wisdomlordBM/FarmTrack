namespace FarmTrack.API.DTOs.Eggs
{
    public class CreateEggRecordDto
    {
        public int FlockId { get; set; }
        public DateTime CollectionDate { get; set; }
        public int TotalCollected { get; set; }
        public int CrackedEggs { get; set; }
        public string? Notes { get; set; }
    }
}
