using Microsoft.EntityFrameworkCore;
using TaskManagement.API.Data;
using TaskManagement.API.DTOs.Statistics;
using TaskManagement.API.Models.Enums;

namespace TaskManagement.API.Services
{
    public interface IStatisticsService
    {
        Task<TaskStatisticsDto> GetStatisticsAsync(Guid userId);
    }

    public class StatisticsService : IStatisticsService
    {
        private readonly ApplicationDbContext _context;

        public StatisticsService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<TaskStatisticsDto> GetStatisticsAsync(Guid userId)
        {
            var tasks = await _context.Tasks
                .Include(t => t.Category)
                .Where(t => t.UserId == userId)
                .ToListAsync();

            var total = tasks.Count;
            var completed = tasks.Count(t => t.Status == TaskItemStatus.Completed);

            var stats = new TaskStatisticsDto
            {
                TotalTasks = total,
                PendingCount = tasks.Count(t => t.Status == TaskItemStatus.Pending),
                InProgressCount = tasks.Count(t => t.Status == TaskItemStatus.InProgress),
                CompletedCount = completed,
                CancelledCount = tasks.Count(t => t.Status == TaskItemStatus.Cancelled),
                OverdueCount = tasks.Count(t =>
                    t.DueDate.HasValue &&
                    t.DueDate.Value < DateTime.UtcNow &&
                    t.Status != TaskItemStatus.Completed &&
                    t.Status != TaskItemStatus.Cancelled),
                CompletionRate = total == 0 ? 0 : Math.Round((double)completed / total * 100, 2)
            };

            stats.TasksByPriority = tasks
                .GroupBy(t => t.Priority.ToString())
                .ToDictionary(g => g.Key, g => g.Count());

            stats.TasksByCategory = tasks
                .GroupBy(t => t.Category != null ? t.Category.Name : "Kategorisiz")
                .ToDictionary(g => g.Key, g => g.Count());

            return stats;
        }
    }
}
