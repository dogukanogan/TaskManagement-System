using System;
using System.ComponentModel.DataAnnotations;

namespace TaskManagement.API.Models
{
    public class TaskAttachment
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid TaskId { get; set; }

        [Required]
        [MaxLength(255)]
        public string FileName { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string FilePath { get; set; } = string.Empty;

        public long FileSize { get; set; }

        [Required]
        [MaxLength(100)]
        public string ContentType { get; set; } = string.Empty;

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public TaskItem Task { get; set; } = null!;
    }
}
