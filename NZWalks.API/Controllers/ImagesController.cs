using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NZWalks.API.Models.Domain;
using NZWalks.API.Models.DTO;
using NZWalks.API.Repositories;

namespace NZWalks.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImagesController : ControllerBase
    {
        private readonly IImageRepository imageRepository;
        private readonly IMapper mapper;
        private readonly ILogger<ImagesController> logger;

        public ImagesController(IImageRepository imageRepository, IMapper mapper, ILogger<ImagesController> logger)
        {
            this.imageRepository = imageRepository;
            this.mapper = mapper;
            this.logger = logger;
        }

        // POST: /api/images/upload
        [HttpPost]
        [Route("upload")]
        [Authorize(Roles = "Writer")]
        public async Task<IActionResult> Upload([FromForm] ImageUploadRequestDto request)
        {
            logger.LogInformation("Image upload called with fileName={FileName}, fileSize={FileSize}", 
                request.FileName, request.File.Length);

            ValidateFileUpload(request);

            if (!ModelState.IsValid)
            {
                logger.LogWarning("Image upload validation failed for fileName={FileName}", request.FileName);
                return BadRequest(ModelState);
            }

            // Convert DTO to Domain model
            var imageDomainModel = new Image
            {
                File = request.File,
                FileExtension = Path.GetExtension(request.File.FileName),
                FileSizeInBytes = request.File.Length,
                FileName = request.FileName,
                FileDescription = request.FileDescription
            };

            // Upload image using repository
            await imageRepository.Upload(imageDomainModel);

            logger.LogInformation("Image uploaded successfully with id={Id}, fileName={FileName}", 
                imageDomainModel.Id, imageDomainModel.FileName);

            // Convert Domain model to DTO
            var imageDto = mapper.Map<ImageDto>(imageDomainModel);

            return CreatedAtAction(nameof(Upload), imageDto);
        }

        private void ValidateFileUpload(ImageUploadRequestDto request)
        {
            var allowedExtensions = new string[] { ".jpg", ".jpeg", ".png" };

            if (!allowedExtensions.Contains(Path.GetExtension(request.File.FileName).ToLower()))
            {
                ModelState.AddModelError("file", "Unsupported file extension. Only .jpg, .jpeg, and .png are allowed.");
            }

            if (request.File.Length > 10485760) // 10MB limit
            {
                ModelState.AddModelError("file", "File size cannot exceed 10MB.");
            }
        }
    }
}
