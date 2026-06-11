namespace FarmTrack.API.DTOs.Flock
{
    public class CreateFlockDto
    {
        public string BatchName { get; set; } = string.Empty;
        public string BirdType { get; set; } = "Layer";
        public int TotalBirds { get; set; }
        public DateTime DateAcquired { get; set; }
    }
}
