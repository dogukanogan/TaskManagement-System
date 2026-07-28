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
        public List<DashboardTaskDto> UpcomingTasks { get; set; } = new();
        public List<DashboardTaskDto> OverdueTasks { get; set; } = new();
        public List<DashboardTaskDto> RecentTasks { get; set; } = new();
        public List<TaskTrendPointDto> Trend { get; set; } = new();
        public string Period { get; set; } = "all";
    }

    public class DashboardTaskDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime? DueDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public int Priority { get; set; }
        public int Status { get; set; }
        public string? CategoryName { get; set; }
    }

    public class TaskTrendPointDto
    {
        public string Label { get; set; } = string.Empty;
        public int Created { get; set; }
        public int Completed { get; set; }
    }
}
