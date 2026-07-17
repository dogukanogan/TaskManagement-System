using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManagement.API.Services;

namespace TaskManagement.API.Controllers
{
    [ApiController]
    [Route("api/task/{taskId}/attachments")]
    [Authorize]
    public class TaskAttachmentController : ControllerBase
    {
        private readonly ITaskAttachmentService _attachmentService;

        public TaskAttachmentController(ITaskAttachmentService attachmentService)
        {
            _attachmentService = attachmentService;
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
            var attachments = await _attachmentService.GetAllForTaskAsync(taskId, GetUserId());
            if (attachments == null)
                return NotFound(new { message = "Görev bulunamadı." });

            return Ok(attachments);
        }

        [HttpPost]
        public async Task<IActionResult> Upload(Guid taskId, IFormFile file)
        {
            if (file == null)
                return BadRequest(new { message = "Dosya seçilmedi." });

            var result = await _attachmentService.UploadAsync(taskId, file, GetUserId());
            if (result == null)
                return NotFound(new { message = "Görev bulunamadı." });

            return CreatedAtAction(nameof(GetAll), new { taskId }, result);
        }

        [HttpGet("{attachmentId}/download")]
        public async Task<IActionResult> Download(Guid taskId, Guid attachmentId)
        {
            var result = await _attachmentService.DownloadAsync(attachmentId, GetUserId());
            if (result == null)
                return NotFound(new { message = "Dosya bulunamadı." });

            return File(result.Value.Content, result.Value.ContentType, result.Value.FileName);
        }

        [HttpDelete("{attachmentId}")]
        public async Task<IActionResult> Delete(Guid taskId, Guid attachmentId)
        {
            var deleted = await _attachmentService.DeleteAsync(attachmentId, GetUserId());
            if (!deleted)
                return NotFound(new { message = "Dosya bulunamadı." });

            return NoContent();
        }
    }
}