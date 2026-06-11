namespace FarmTrack.API.DTOs.Workers
{
    public class MarkAttendanceDto
    {
        public int WorkerId { get; set; }
        public DateTime Date { get; set; }
        public bool Present { get; set; }
        public string? Notes { get; set; }
    }
}
