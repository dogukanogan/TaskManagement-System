namespace TaskManagement.API.DTOs.Statistics
{
    public class TaskStatisticsDto
    {
        public int TotalTasks { get; set; }
        public int PendingCount { get; set; }
        public int InProgressCount { get; set; }
        public int CompletedCount { get; set; }
        public int CancelledCount { get; set; }
        public int OverdueCount { get; set; }
        public double CompletionRate { get; set; }

        public Dictionary<string, int> TasksByPriority { get; set; } = new();
        public Dictionary<string, int> TasksByCategory { get; set; } = new();
    }
}