using Microsoft.EntityFrameworkCore;
using TaskManagement.API.Data;
using TaskManagement.API.DTOs.Statistics;
using TaskManagement.API.Models;
using TaskManagement.API.Models.Enums;

namespace TaskManagement.API.Services
{
    public interface IStatisticsService
    {
        Task<TaskStatisticsDto> GetStatisticsAsync(Guid userId, string period = "all");
    }

    public class StatisticsService : IStatisticsService
    {
        private readonly ApplicationDbContext _context;

        public StatisticsService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<TaskStatisticsDto> GetStatisticsAsync(Guid userId, string period = "all")
        {
            var now = DateTime.UtcNow;
            var normalizedPeriod = NormalizePeriod(period);
            var allTasks = await _context.Tasks
                .AsNoTracking()
                .Include(t => t.Category)
                .Where(t => t.UserId == userId)
                .ToListAsync();

            var periodStart = GetPeriodStart(normalizedPeriod, now);
            var periodTasks = periodStart.HasValue
                ? allTasks.Where(t => t.CreatedAt >= periodStart.Value).ToList()
                : allTasks;

            var total = periodTasks.Count;
            var completed = periodTasks.Count(t => t.Status == TaskItemStatus.Completed);
            var stats = new TaskStatisticsDto
            {
                Period = normalizedPeriod,
                TotalTasks = total,
                PendingCount = periodTasks.Count(t => t.Status == TaskItemStatus.Pending),
                InProgressCount = periodTasks.Count(t => t.Status == TaskItemStatus.InProgress),
                CompletedCount = completed,
                CancelledCount = periodTasks.Count(t => t.Status == TaskItemStatus.Cancelled),
                OverdueCount = periodTasks.Count(t =>
                    t.DueDate.HasValue &&
                    t.DueDate.Value < now &&
                    t.Status != TaskItemStatus.Completed &&
                    t.Status != TaskItemStatus.Cancelled),
                CompletionRate = total == 0 ? 0 : Math.Round((double)completed / total * 100, 2),
                UpcomingTasks = allTasks
                    .Where(t => t.DueDate.HasValue && t.DueDate.Value >= now &&
                        t.Status != TaskItemStatus.Completed && t.Status != TaskItemStatus.Cancelled)
                    .OrderBy(t => t.DueDate)
                    .Take(5)
                    .Select(ToDashboardTask)
                    .ToList(),
                OverdueTasks = allTasks
                    .Where(t => t.DueDate.HasValue && t.DueDate.Value < now &&
                        t.Status != TaskItemStatus.Completed && t.Status != TaskItemStatus.Cancelled)
                    .OrderBy(t => t.DueDate)
                    .Take(5)
                    .Select(ToDashboardTask)
                    .ToList(),
                RecentTasks = allTasks
                    .OrderByDescending(t => t.CreatedAt)
                    .Take(5)
                    .Select(ToDashboardTask)
                    .ToList(),
                Trend = BuildTrend(allTasks, normalizedPeriod, now)
            };

            stats.TasksByPriority = periodTasks
                .GroupBy(t => t.Priority.ToString())
                .ToDictionary(g => g.Key, g => g.Count());

            stats.TasksByCategory = periodTasks
                .GroupBy(t => t.Category != null ? t.Category.Name : "Kategorisiz")
                .ToDictionary(g => g.Key, g => g.Count());

            return stats;
        }

        private static string NormalizePeriod(string period)
        {
            return period.ToLowerInvariant() switch
            {
                "week" => "week",
                "month" => "month",
                _ => "all"
            };
        }

        private static DateTime? GetPeriodStart(string period, DateTime now)
        {
            if (period == "week")
            {
                var daysSinceMonday = ((int)now.DayOfWeek + 6) % 7;
                return now.Date.AddDays(-daysSinceMonday);
            }

            return period == "month"
                ? new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc)
                : null;
        }

        private static DashboardTaskDto ToDashboardTask(TaskItem task)
        {
            return new DashboardTaskDto
            {
                Id = task.Id,
                Title = task.Title,
                DueDate = task.DueDate,
                CreatedAt = task.CreatedAt,
                Priority = (int)task.Priority,
                Status = (int)task.Status,
                CategoryName = task.Category?.Name
            };
        }

        private static List<TaskTrendPointDto> BuildTrend(List<TaskItem> tasks, string period, DateTime now)
        {
            return period switch
            {
                "week" => BuildDailyTrend(tasks, now.Date.AddDays(-(((int)now.DayOfWeek + 6) % 7)), 7),
                "month" => BuildWeeklyTrend(tasks, new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc), now),
                _ => BuildMonthlyTrend(tasks, now)
            };
        }

        private static List<TaskTrendPointDto> BuildDailyTrend(List<TaskItem> tasks, DateTime start, int days)
        {
            return Enumerable.Range(0, days).Select(offset =>
            {
                var day = start.AddDays(offset);
                var nextDay = day.AddDays(1);
                return new TaskTrendPointDto
                {
                    Label = day.ToString("dd MMM"),
                    Created = tasks.Count(t => t.CreatedAt >= day && t.CreatedAt < nextDay),
                    Completed = tasks.Count(t => t.CompletedAt >= day && t.CompletedAt < nextDay)
                };
            }).ToList();
        }

        private static List<TaskTrendPointDto> BuildWeeklyTrend(List<TaskItem> tasks, DateTime monthStart, DateTime now)
        {
            var points = new List<TaskTrendPointDto>();
            var cursor = monthStart;
            var weekNumber = 1;
            while (cursor <= now && cursor.Month == monthStart.Month)
            {
                var end = cursor.AddDays(7);
                points.Add(new TaskTrendPointDto
                {
                    Label = $"{weekNumber}. Hafta",
                    Created = tasks.Count(t => t.CreatedAt >= cursor && t.CreatedAt < end),
                    Completed = tasks.Count(t => t.CompletedAt >= cursor && t.CompletedAt < end)
                });
                cursor = end;
                weekNumber++;
            }
            return points;
        }

        private static List<TaskTrendPointDto> BuildMonthlyTrend(List<TaskItem> tasks, DateTime now)
        {
            return Enumerable.Range(0, 6).Reverse().Select(monthOffset =>
            {
                var month = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-monthOffset);
                var nextMonth = month.AddMonths(1);
                return new TaskTrendPointDto
                {
                    Label = month.ToString("MMM yyyy"),
                    Created = tasks.Count(t => t.CreatedAt >= month && t.CreatedAt < nextMonth),
                    Completed = tasks.Count(t => t.CompletedAt >= month && t.CompletedAt < nextMonth)
                };
            }).ToList();
        }
    }
}
