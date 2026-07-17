using System.ComponentModel.DataAnnotations;

namespace TaskManagement.API.DTOs.User
{
    public class UpdateUserDto
    {
        [StringLength(50)]
        public string? FirstName { get; set; }

        [StringLength(50)]
        public string? LastName { get; set; }

        [EmailAddress]
        public string? Email { get; set; }
    }
}