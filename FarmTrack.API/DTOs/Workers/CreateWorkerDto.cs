namespace FarmTrack.API.DTOs.Workers
{
    public class CreateWorkerDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public decimal DailyRate { get; set; }
        public DateTime DateJoined { get; set; }
    }
}
