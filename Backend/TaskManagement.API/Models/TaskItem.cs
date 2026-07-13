using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using TaskManagement.API.Models.Enums;

namespace TaskManagement.API.Models
{
    public class TaskItem
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        public Priority Priority { get; set; } = Priority.Low;
        public TaskItemStatus Status { get; set; } = TaskItemStatus.Pending;

        public DateTime? DueDate { get; set; }
        public DateTime? CompletedAt { get; set; }

        public Guid UserId { get; set; }
        public Guid? CategoryId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public User User { get; set; } = null!;
        public Category? Category { get; set; }
        
        public ICollection<TaskAttachment> Attachments { get; set; } = new List<TaskAttachment>();
        public ICollection<TaskComment> Comments { get; set; } = new List<TaskComment>();
    }
}
