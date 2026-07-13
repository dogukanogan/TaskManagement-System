using System;
using System.ComponentModel.DataAnnotations;

namespace TaskManagement.API.DTOs.Category
{
    public class CategoryDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Color { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class CreateCategoryDto
    {
        [Required(ErrorMessage = "Category name is required")]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        [MaxLength(7)]
        public string Color { get; set; } = "#007bff";
    }
}
