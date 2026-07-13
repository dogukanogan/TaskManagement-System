using Microsoft.EntityFrameworkCore;
using TaskManagement.API.Data;
using TaskManagement.API.DTOs.User;

namespace TaskManagement.API.Services
{
    public interface IUserService
    {
        Task<UserDto?> GetProfileAsync(Guid userId);
        Task<(bool Success, string Message, UserDto? User)> UpdateProfileAsync(Guid userId, UpdateUserDto dto);
        Task<(bool Success, string Message)> ChangePasswordAsync(Guid userId, ChangePasswordDto dto);
    }

    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;
        private readonly AutoMapper.IMapper _mapper;

        public UserService(ApplicationDbContext context, AutoMapper.IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<UserDto?> GetProfileAsync(Guid userId)
        {
            var user = await _context.Users.FindAsync(userId);
            return user == null ? null : _mapper.Map<UserDto>(user);
        }

        public async Task<(bool Success, string Message, UserDto? User)> UpdateProfileAsync(Guid userId, UpdateUserDto dto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return (false, "Kullanıcı bulunamadı.", null);

            if (!string.IsNullOrWhiteSpace(dto.Email) && dto.Email != user.Email)
            {
                var emailExists = await _context.Users.AnyAsync(u => u.Email == dto.Email && u.Id != userId);
                if (emailExists)
                    return (false, "Bu email adresi zaten kullanılıyor.", null);

                user.Email = dto.Email;
            }

            if (!string.IsNullOrWhiteSpace(dto.FirstName))
                user.FirstName = dto.FirstName;

            if (!string.IsNullOrWhiteSpace(dto.LastName))
                user.LastName = dto.LastName;

            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return (true, "Profil güncellendi.", _mapper.Map<UserDto>(user));
        }

        public async Task<(bool Success, string Message)> ChangePasswordAsync(Guid userId, ChangePasswordDto dto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return (false, "Kullanıcı bulunamadı.");

            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
                return (false, "Mevcut şifre hatalı.");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return (true, "Şifre başarıyla değiştirildi.");
        }
    }
}
