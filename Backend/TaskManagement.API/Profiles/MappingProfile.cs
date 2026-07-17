using AutoMapper;
using TaskManagement.API.Models;
using TaskManagement.API.DTOs.User;
using TaskManagement.API.DTOs.Category;
using TaskManagement.API.DTOs.Task;
using TaskManagement.API.DTOs.Comment;
using TaskManagement.API.DTOs.Attachment;

namespace TaskManagement.API.Profiles
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // User
            CreateMap<User, UserDto>();
            CreateMap<CreateUserDto, User>();
            CreateMap<UpdateUserDto, User>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // Category
            CreateMap<Category, CategoryDto>();
            CreateMap<CreateCategoryDto, Category>();

            // TaskItem
            CreateMap<TaskItem, TaskItemDto>()
                .ForMember(dest => dest.CategoryName,
                    opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : null));
            CreateMap<CreateTaskDto, TaskItem>();
            CreateMap<TaskComment, TaskCommentDto>()
                .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.User.Username));
            CreateMap<TaskAttachment, TaskAttachmentDto>();
            CreateMap<UpdateTaskDto, TaskItem>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}