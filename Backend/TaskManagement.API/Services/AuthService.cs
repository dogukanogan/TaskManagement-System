using Microsoft.EntityFrameworkCore;
using TaskManagement.API.Data;
using TaskManagement.API.DTOs.User;
using TaskManagement.API.Models;

namespace TaskManagement.API.Services
{
    public interface IAuthService
    {
        Task<(bool Success, string Message, UserDto? User, string? Token)> RegisterAsync(CreateUserDto dto);
        Task<(bool Success, string Message, UserDto? User, string? Token)> LoginAsync(LoginDto dto);
    }

    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly ITokenService _tokenService;
        private readonly AutoMapper.IMapper _mapper;
        private readonly ILogger<AuthService> _logger;

        public AuthService(ApplicationDbContext context, ITokenService tokenService, AutoMapper.IMapper mapper, ILogger<AuthService> logger)
        {
            _context = context;
            _tokenService = tokenService;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<(bool Success, string Message, UserDto? User, string? Token)> RegisterAsync(CreateUserDto dto)
        {
            var emailExists = await _context.Users.AnyAsync(u => u.Email == dto.Email);
            if (emailExists)
                return (false, "Bu email adresi zaten kayıtlı.", null, null);

            var usernameExists = await _context.Users.AnyAsync(u => u.Username == dto.Username);
            if (usernameExists)
                return (false, "Bu kullanıcı adı zaten alınmış.", null, null);

            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = dto.Username,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var token = _tokenService.GenerateToken(user);
            var userDto = _mapper.Map<UserDto>(user);

            _logger.LogInformation("Yeni kullanıcı kayıt oldu: {Email}", user.Email);

            return (true, "Kayıt başarılı.", userDto, token);
        }

        public async Task<(bool Success, string Message, UserDto? User, string? Token)> LoginAsync(LoginDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            {
                _logger.LogWarning("Başarısız giriş denemesi: {Email}", dto.Email);
                return (false, "Email veya şifre hatalı.", null, null);
            }

            if (!user.IsActive)
                return (false, "Bu hesap devre dışı bırakılmış.", null, null);

            var token = _tokenService.GenerateToken(user);
            var userDto = _mapper.Map<UserDto>(user);
            
            _logger.LogInformation("Kullanıcı başarıyla giriş yaptı: {Email}", user.Email);

            return (true, "Giriş başarılı.", userDto, token);
        }
    }
}