using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManagement.API.DTOs.Comment;
using TaskManagement.API.Services;

namespace TaskManagement.API.Controllers
{
    [ApiController]
    [Route("api/task/{taskId}/comments")]
    [Authorize]
    public class TaskCommentController : ControllerBase
    {
        private readonly ITaskCommentService _commentService;

        public TaskCommentController(ITaskCommentService commentService)
        {
            _commentService = commentService;
        }

        private Guid GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("sub")?.Value;

            return Guid.Parse(userIdClaim!);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(Guid taskId)
        {
            var comments = await _commentService.GetAllForTaskAsync(taskId, GetUserId());
            if (comments == null)
                return NotFound(new { message = "Görev bulunamadı." });

            return Ok(comments);
        }

        [HttpPost]
        public async Task<IActionResult> Add(Guid taskId, [FromBody] CreateCommentDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var comment = await _commentService.AddCommentAsync(taskId, dto, GetUserId());
            if (comment == null)
                return NotFound(new { message = "Görev bulunamadı." });

            return CreatedAtAction(nameof(GetAll), new { taskId }, comment);
        }

        [HttpDelete("{commentId}")]
        public async Task<IActionResult> Delete(Guid taskId, Guid commentId)
        {
            var deleted = await _commentService.DeleteCommentAsync(commentId, GetUserId());
            if (!deleted)
                return NotFound(new { message = "Yorum bulunamadı." });

            return NoContent();
        }
    }
}