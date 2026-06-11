namespace FarmTrack.API.DTOs.Flock
{
    public class FlockResponseDto
    {
        public int Id { get; set; }
        public string BatchName { get; set; } = string.Empty;
        public string BirdType { get; set; } = string.Empty;
        public int TotalBirds { get; set; }
        public int AliveBirds { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime DateAcquired { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
