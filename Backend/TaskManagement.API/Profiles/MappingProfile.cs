using AutoMapper;
using TaskManagement.API.DTOs.Category;
using TaskManagement.API.DTOs.Task;
using TaskManagement.API.DTOs.User;
using TaskManagement.API.Models;

namespace TaskManagement.API.Profiles
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // User mappings
            CreateMap<User, UserDto>();
            CreateMap<CreateUserDto, User>()
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore()); // Password should be hashed manually

            // Category mappings
            CreateMap<Category, CategoryDto>();
            CreateMap<CreateCategoryDto, Category>();

            // Task mappings
            CreateMap<TaskItem, TaskItemDto>();
            CreateMap<CreateTaskDto, TaskItem>();
            CreateMap<UpdateTaskDto, TaskItem>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}
