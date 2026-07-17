using Microsoft.EntityFrameworkCore;
using TaskManagement.API.Data;
using TaskManagement.API.DTOs.Comment;
using TaskManagement.API.Models;

namespace TaskManagement.API.Services
{
    public interface ITaskCommentService
    {
        Task<List<TaskCommentDto>?> GetAllForTaskAsync(Guid taskId, Guid userId);
        Task<TaskCommentDto?> AddCommentAsync(Guid taskId, CreateCommentDto dto, Guid userId);
        Task<bool> DeleteCommentAsync(Guid commentId, Guid userId);
    }

    public class TaskCommentService : ITaskCommentService
    {
        private readonly ApplicationDbContext _context;
        private readonly AutoMapper.IMapper _mapper;

        public TaskCommentService(ApplicationDbContext context, AutoMapper.IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // Kullanıcı, sadece kendi task'ının yorumlarını görebilir/ekleyebilir
        private async Task<bool> TaskBelongsToUserAsync(Guid taskId, Guid userId)
        {
            return await _context.Tasks.AnyAsync(t => t.Id == taskId && t.UserId == userId);
        }

        public async Task<List<TaskCommentDto>?> GetAllForTaskAsync(Guid taskId, Guid userId)
        {
            if (!await TaskBelongsToUserAsync(taskId, userId))
                return null;

            var comments = await _context.TaskComments
                .Include(c => c.User)
                .Where(c => c.TaskId == taskId)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();

            return _mapper.Map<List<TaskCommentDto>>(comments);
        }

        public async Task<TaskCommentDto?> AddCommentAsync(Guid taskId, CreateCommentDto dto, Guid userId)
        {
            if (!await TaskBelongsToUserAsync(taskId, userId))
                return null;

            var comment = new TaskComment
            {
                Id = Guid.NewGuid(),
                TaskId = taskId,
                UserId = userId,
                Comment = dto.Comment,
                CreatedAt = DateTime.UtcNow
            };

            _context.TaskComments.Add(comment);
            await _context.SaveChangesAsync();

            var created = await _context.TaskComments
                .Include(c => c.User)
                .FirstAsync(c => c.Id == comment.Id);

            return _mapper.Map<TaskCommentDto>(created);
        }

        public async Task<bool> DeleteCommentAsync(Guid commentId, Guid userId)
        {
            var comment = await _context.TaskComments
                .FirstOrDefaultAsync(c => c.Id == commentId && c.UserId == userId);

            if (comment == null)
                return false;

            _context.TaskComments.Remove(comment);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
