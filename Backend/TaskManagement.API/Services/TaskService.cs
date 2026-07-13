using Microsoft.EntityFrameworkCore;
using TaskManagement.API.Data;
using TaskManagement.API.DTOs.Task;
using TaskManagement.API.Models;
using TaskManagement.API.Models.Enums;

namespace TaskManagement.API.Services
{
    public interface ITaskService
    {
        Task<List<TaskItemDto>> GetAllForUserAsync(Guid userId, TaskFilterDto filter);
        Task<TaskItemDto?> GetByIdAsync(Guid id, Guid userId);
        Task<TaskItemDto> CreateAsync(CreateTaskDto dto, Guid userId);
        Task<TaskItemDto?> UpdateAsync(Guid id, UpdateTaskDto dto, Guid userId);
        Task<bool> DeleteAsync(Guid id, Guid userId);
    }

    public class TaskService : ITaskService
    {
        private readonly ApplicationDbContext _context;
        private readonly AutoMapper.IMapper _mapper;

        public TaskService(ApplicationDbContext context, AutoMapper.IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<TaskItemDto>> GetAllForUserAsync(Guid userId, TaskFilterDto filter)
        {
            var query = _context.Tasks
                .Include(t => t.Category)
                .Where(t => t.UserId == userId)
                .AsQueryable();

            if (filter.Status.HasValue)
                query = query.Where(t => t.Status == filter.Status.Value);

            if (filter.Priority.HasValue)
                query = query.Where(t => t.Priority == filter.Priority.Value);

            if (filter.CategoryId.HasValue)
                query = query.Where(t => t.CategoryId == filter.CategoryId.Value);

            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
                query = query.Where(t =>
                    t.Title.Contains(filter.SearchTerm) ||
                    (t.Description != null && t.Description.Contains(filter.SearchTerm)));

            if (filter.DueDateFrom.HasValue)
                query = query.Where(t => t.DueDate >= filter.DueDateFrom.Value);

            if (filter.DueDateTo.HasValue)
                query = query.Where(t => t.DueDate <= filter.DueDateTo.Value);

            var tasks = await query
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            return _mapper.Map<List<TaskItemDto>>(tasks);
        }

        public async Task<TaskItemDto?> GetByIdAsync(Guid id, Guid userId)
        {
            var task = await _context.Tasks
                .Include(t => t.Category)
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            return task == null ? null : _mapper.Map<TaskItemDto>(task);
        }

        public async Task<TaskItemDto> CreateAsync(CreateTaskDto dto, Guid userId)
        {
            var task = new TaskItem
            {
                Id = Guid.NewGuid(),
                Title = dto.Title,
                Description = dto.Description,
                Priority = dto.Priority,
                Status = TaskItemStatus.Pending,
                DueDate = dto.DueDate,
                UserId = userId,
                CategoryId = dto.CategoryId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            // Category bilgisini de dahil ederek geri dön
            var created = await _context.Tasks
                .Include(t => t.Category)
                .FirstAsync(t => t.Id == task.Id);

            return _mapper.Map<TaskItemDto>(created);
        }

        public async Task<TaskItemDto?> UpdateAsync(Guid id, UpdateTaskDto dto, Guid userId)
        {
            var task = await _context.Tasks
                .Include(t => t.Category)
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (task == null)
                return null;

            if (dto.Title != null)
                task.Title = dto.Title;

            if (dto.Description != null)
                task.Description = dto.Description;

            if (dto.Priority.HasValue)
                task.Priority = dto.Priority.Value;

            if (dto.Status.HasValue)
            {
                task.Status = dto.Status.Value;
                if (dto.Status.Value == TaskItemStatus.Completed && task.CompletedAt == null)
                    task.CompletedAt = DateTime.UtcNow;
            }

            if (dto.DueDate.HasValue)
                task.DueDate = dto.DueDate;

            if (dto.CategoryId.HasValue)
                task.CategoryId = dto.CategoryId;

            task.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return _mapper.Map<TaskItemDto>(task);
        }

        public async Task<bool> DeleteAsync(Guid id, Guid userId)
        {
            var task = await _context.Tasks
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (task == null)
                return false;

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
