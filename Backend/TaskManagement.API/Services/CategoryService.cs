using Microsoft.EntityFrameworkCore;
using TaskManagement.API.Data;
using TaskManagement.API.DTOs.Category;
using TaskManagement.API.Models;

namespace TaskManagement.API.Services
{
    public interface ICategoryService
    {
        Task<List<CategoryDto>> GetAllForUserAsync(Guid userId);
        Task<CategoryDto?> GetByIdAsync(Guid id, Guid userId);
        Task<CategoryDto> CreateAsync(CreateCategoryDto dto, Guid userId);
        Task<CategoryDto?> UpdateAsync(Guid id, CreateCategoryDto dto, Guid userId);
        Task<bool> DeleteAsync(Guid id, Guid userId);
    }

    public class CategoryService : ICategoryService
    {
        private readonly ApplicationDbContext _context;
        private readonly AutoMapper.IMapper _mapper;

        public CategoryService(ApplicationDbContext context, AutoMapper.IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<CategoryDto>> GetAllForUserAsync(Guid userId)
        {
            var categories = await _context.Categories
                .Where(c => c.UserId == userId)
                .OrderBy(c => c.Name)
                .ToListAsync();

            return _mapper.Map<List<CategoryDto>>(categories);
        }

        public async Task<CategoryDto?> GetByIdAsync(Guid id, Guid userId)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

            return category == null ? null : _mapper.Map<CategoryDto>(category);
        }

        public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto, Guid userId)
        {
            var category = new Category
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Description = dto.Description,
                Color = dto.Color,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return _mapper.Map<CategoryDto>(category);
        }

        public async Task<CategoryDto?> UpdateAsync(Guid id, CreateCategoryDto dto, Guid userId)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

            if (category == null)
                return null;

            category.Name = dto.Name;
            category.Description = dto.Description;
            category.Color = dto.Color;

            await _context.SaveChangesAsync();

            return _mapper.Map<CategoryDto>(category);
        }

        public async Task<bool> DeleteAsync(Guid id, Guid userId)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

            if (category == null)
                return false;

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
