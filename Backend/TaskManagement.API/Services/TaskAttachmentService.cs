using Microsoft.EntityFrameworkCore;
using TaskManagement.API.Data;
using TaskManagement.API.DTOs.Attachment;
using TaskManagement.API.Models;

namespace TaskManagement.API.Services
{
    public interface ITaskAttachmentService
    {
        Task<List<TaskAttachmentDto>?> GetAllForTaskAsync(Guid taskId, Guid userId);
        Task<TaskAttachmentDto?> UploadAsync(Guid taskId, IFormFile file, Guid userId);
        Task<(byte[] Content, string ContentType, string FileName)?> DownloadAsync(Guid attachmentId, Guid userId);
        Task<bool> DeleteAsync(Guid attachmentId, Guid userId);
    }

    public class TaskAttachmentService : ITaskAttachmentService
    {
        private readonly ApplicationDbContext _context;
        private readonly AutoMapper.IMapper _mapper;
        private readonly string _uploadsPath;

        // İzin verilen dosya tipleri ve maksimum boyut (10 MB)
        private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx", ".txt", ".xlsx" };
        private const long MaxFileSizeBytes = 10 * 1024 * 1024;

        public TaskAttachmentService(ApplicationDbContext context, AutoMapper.IMapper mapper, IWebHostEnvironment env)
        {
            _context = context;
            _mapper = mapper;
            _uploadsPath = Path.Combine(env.ContentRootPath, "Uploads");

            if (!Directory.Exists(_uploadsPath))
                Directory.CreateDirectory(_uploadsPath);
        }

        private async Task<bool> TaskBelongsToUserAsync(Guid taskId, Guid userId)
        {
            return await _context.Tasks.AnyAsync(t => t.Id == taskId && t.UserId == userId);
        }

        public async Task<List<TaskAttachmentDto>?> GetAllForTaskAsync(Guid taskId, Guid userId)
        {
            if (!await TaskBelongsToUserAsync(taskId, userId))
                return null;

            var attachments = await _context.TaskAttachments
                .Where(a => a.TaskId == taskId)
                .OrderByDescending(a => a.UploadedAt)
                .ToListAsync();

            return _mapper.Map<List<TaskAttachmentDto>>(attachments);
        }

        public async Task<TaskAttachmentDto?> UploadAsync(Guid taskId, IFormFile file, Guid userId)
        {
            if (!await TaskBelongsToUserAsync(taskId, userId))
                return null;

            if (file.Length == 0)
                throw new ArgumentException("Dosya boş olamaz.");

            if (file.Length > MaxFileSizeBytes)
                throw new ArgumentException("Dosya boyutu 10 MB'ı geçemez.");

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(extension))
                throw new ArgumentException($"Bu dosya türüne izin verilmiyor: {extension}");

            // Aynı isimli dosyalar çakışmasın diye benzersiz bir isimle diske kaydediyoruz
            var storedFileName = $"{Guid.NewGuid()}{extension}";
            var fullPath = Path.Combine(_uploadsPath, storedFileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var attachment = new TaskAttachment
            {
                Id = Guid.NewGuid(),
                TaskId = taskId,
                FileName = file.FileName,
                FilePath = storedFileName,
                FileSize = file.Length,
                ContentType = file.ContentType,
                UploadedAt = DateTime.UtcNow
            };

            _context.TaskAttachments.Add(attachment);
            await _context.SaveChangesAsync();

            return _mapper.Map<TaskAttachmentDto>(attachment);
        }

        public async Task<(byte[] Content, string ContentType, string FileName)?> DownloadAsync(Guid attachmentId, Guid userId)
        {
            var attachment = await _context.TaskAttachments
                .Include(a => a.Task)
                .FirstOrDefaultAsync(a => a.Id == attachmentId && a.Task.UserId == userId);

            if (attachment == null)
                return null;

            var fullPath = Path.Combine(_uploadsPath, attachment.FilePath);
            if (!File.Exists(fullPath))
                return null;

            var content = await File.ReadAllBytesAsync(fullPath);
            return (content, attachment.ContentType, attachment.FileName);
        }

        public async Task<bool> DeleteAsync(Guid attachmentId, Guid userId)
        {
            var attachment = await _context.TaskAttachments
                .Include(a => a.Task)
                .FirstOrDefaultAsync(a => a.Id == attachmentId && a.Task.UserId == userId);

            if (attachment == null)
                return false;

            var fullPath = Path.Combine(_uploadsPath, attachment.FilePath);
            if (File.Exists(fullPath))
                File.Delete(fullPath);

            _context.TaskAttachments.Remove(attachment);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
