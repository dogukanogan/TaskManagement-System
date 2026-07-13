using System;
using System.ComponentModel.DataAnnotations;

namespace TaskManagement.API.Models
{
    public class TaskComment
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid TaskId { get; set; }
        public Guid UserId { get; set; }

        [Required]
        public string Comment { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public TaskItem Task { get; set; } = null!;
        public User User { get; set; } = null!;
    }
}
