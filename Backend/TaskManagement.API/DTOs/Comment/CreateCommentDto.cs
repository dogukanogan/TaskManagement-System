using System.ComponentModel.DataAnnotations;

namespace TaskManagement.API.DTOs.Comment
{
    public class CreateCommentDto
    {
        [Required, StringLength(1000, MinimumLength = 1)]
        public string Comment { get; set; } = string.Empty;
    }
}