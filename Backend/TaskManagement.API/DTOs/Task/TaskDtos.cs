using System;
using System.ComponentModel.DataAnnotations;
using TaskManagement.API.Models.Enums;

namespace TaskManagement.API.DTOs.Task
{
    public class TaskItemDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public Priority Priority { get; set; }
        public TaskItemStatus Status { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? CompletedAt { get; set; }
        public Guid? CategoryId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateTaskDto
    {
        [Required(ErrorMessage = "Title is required")]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Range(1, 5)]
        public Priority Priority { get; set; } = Priority.Low;

        public DateTime? DueDate { get; set; }
        public Guid? CategoryId { get; set; }
    }

    public class UpdateTaskDto
    {
        [MaxLength(200)]
        public string? Title { get; set; }
        public string? Description { get; set; }
        public Priority? Priority { get; set; }
        public TaskItemStatus? Status { get; set; }
        public DateTime? DueDate { get; set; }
        public Guid? CategoryId { get; set; }
    }

    public class TaskFilterDto
    {
        public TaskItemStatus? Status { get; set; }
        public Priority? Priority { get; set; }
        public Guid? CategoryId { get; set; }
        public string? SearchTerm { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}
