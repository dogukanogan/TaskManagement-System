using Microsoft.EntityFrameworkCore;
using TaskManagement.API.Data;
using TaskManagement.API.DTOs;
using TaskManagement.API.DTOs.Task;
using TaskManagement.API.Models;
using TaskManagement.API.Models.Enums;

namespace TaskManagement.API.Services
{
    public interface ITaskService
    {
        Task<PagedResult<TaskItemDto>> GetAllForUserAsync(Guid userId, TaskFilterDto filter);
        Task<PagedResult<TaskItemDto>> GetOverdueTasksAsync(Guid userId, int page = 1, int pageSize = 10);
        Task<TaskItemDto?> GetByIdAsync(Guid id, Guid userId);
        Task<TaskItemDto> CreateAsync(CreateTaskDto dto, Guid userId);
        Task<TaskItemDto?> UpdateAsync(Guid id, UpdateTaskDto dto, Guid userId);
        Task<bool> DeleteAsync(Guid id, Guid userId);
    }

    public class TaskService : ITaskService
    {
        private readonly ApplicationDbContext _context;
        private readonly AutoMapper.IMapper _mapper;
        private readonly ILogger<TaskService> _logger;

        public TaskService(ApplicationDbContext context, AutoMapper.IMapper mapper, ILogger<TaskService> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<PagedResult<TaskItemDto>> GetAllForUserAsync(Guid userId, TaskFilterDto filter)
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

            var totalCount = await query.CountAsync();

            var tasks = await query
                .OrderByDescending(t => t.CreatedAt)
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            var dtos = _mapper.Map<List<TaskItemDto>>(tasks);
            return new PagedResult<TaskItemDto>(dtos, totalCount, filter.Page, filter.PageSize);
        }

        public async Task<PagedResult<TaskItemDto>> GetOverdueTasksAsync(Guid userId, int page = 1, int pageSize = 10)
        {
            var query = _context.Tasks
                .Include(t => t.Category)
                .Where(t => t.UserId == userId && t.Status == TaskItemStatus.Pending && t.DueDate.HasValue && t.DueDate < DateTime.UtcNow)
                .AsQueryable();

            var totalCount = await query.CountAsync();

            var tasks = await query
                .OrderBy(t => t.DueDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var dtos = _mapper.Map<List<TaskItemDto>>(tasks);
            return new PagedResult<TaskItemDto>(dtos, totalCount, page, pageSize);
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

            _logger.LogInformation("Yeni görev oluşturuldu: {TaskId} (Kullanıcı: {UserId})", task.Id, userId);

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
            {
                _logger.LogWarning("Güncellenmek istenen görev bulunamadı. Görev: {TaskId}, Kullanıcı: {UserId}", id, userId);
                return null;
            }

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
            
            _logger.LogInformation("Görev güncellendi: {TaskId} (Kullanıcı: {UserId})", id, userId);

            return _mapper.Map<TaskItemDto>(task);
        }

        public async Task<bool> DeleteAsync(Guid id, Guid userId)
        {
            var task = await _context.Tasks
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (task == null)
            {
                _logger.LogWarning("Silinmek istenen görev bulunamadı. Görev: {TaskId}, Kullanıcı: {UserId}", id, userId);
                return false;
            }

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("Görev silindi: {TaskId} (Kullanıcı: {UserId})", id, userId);

            return true;
        }
    }
}