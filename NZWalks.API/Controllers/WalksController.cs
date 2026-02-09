using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NZWalks.API.CustomActionFilters;
using NZWalks.API.Models.Domain;
using NZWalks.API.Models.DTO;
using NZWalks.API.Repositories;

namespace NZWalks.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WalksController : ControllerBase
    {
        private readonly IMapper mapper;
        private readonly IWalkRepository walkRepository;
        private readonly ILogger<WalksController> logger;

        public WalksController(IMapper mapper, IWalkRepository walkRepository, ILogger<WalksController> logger)
        {
            this.mapper = mapper;
            this.walkRepository = walkRepository;
            this.logger = logger;
        }
        //create walk
        [HttpPost]
        [ValidateModel]
        [Authorize(Roles = "Writer")]
        public async Task<IActionResult> Create([FromBody] AddWalkRequestDto addWalkRequestDto)
        {
            logger.LogInformation("Create walk called with name={Name}, length={Length}", 
                addWalkRequestDto.Name, addWalkRequestDto.LengthInKm);

            // Map DTO to Domain Model
            var walkDomainModel = mapper.Map<Walk>(addWalkRequestDto);
            // Call repository to save the walk
            await walkRepository.CreateAsync(walkDomainModel);

            logger.LogInformation("Walk created successfully with id={Id}", walkDomainModel.Id);


            return Ok(mapper.Map<WalkDto>(walkDomainModel));
        }



        // Get all walks
        [HttpGet]
        [Authorize(Roles = "Reader,Writer")]
        public async Task<IActionResult> GetAll([FromQuery] string? filterOn, [FromQuery] string? filterQuery,
            [FromQuery] string? sortBy, [FromQuery] bool isAscending = true,
            [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            logger.LogInformation("GetAll walks called with filterOn={FilterOn}, filterQuery={FilterQuery}, sortBy={SortBy}, pageNumber={PageNumber}",
                filterOn ?? "null", filterQuery ?? "null", sortBy ?? "null", pageNumber);

            // Validate pagination parameters
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 100) pageSize = 100; // Max page size limit

            // Call repository to get all walks with pagination
            var (walks, totalCount) = await walkRepository.GetAllAsync(filterOn, filterQuery, sortBy, isAscending, pageNumber, pageSize);

            logger.LogInformation("Retrieved {Count} walks out of {TotalCount} total", walks.Count, totalCount);

            // Calculate total pages
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            // Add pagination metadata to response headers
            Response.Headers["X-Total-Count"] = totalCount.ToString();
            Response.Headers["X-Page-Number"] = pageNumber.ToString();
            Response.Headers["X-Page-Size"] = pageSize.ToString();
            Response.Headers["X-Total-Pages"] = totalPages.ToString();

            // Map Domain Model to DTO
            var walksDto = mapper.Map<List<WalkDto>>(walks);
            return Ok(walksDto);
        }

        // Get walk by ID
        [HttpGet]
        [Route("{id:guid}")]
        [Authorize(Roles = "Reader,Writer")]
        public async Task<IActionResult> GetById([FromRoute] Guid id)
        {
            logger.LogInformation("GetById walk called with id={Id}", id);

            // Call repository to get walk by ID
            var walkDomainModel = await walkRepository.GetByIdAsync(id);
            if (walkDomainModel == null)
            {
                logger.LogWarning("Walk with id={Id} not found", id);
                return NotFound();
            }

            logger.LogInformation("Walk with id={Id} retrieved successfully", id);
            // Map Domain Model to DTO
            var walkDto = mapper.Map<WalkDto>(walkDomainModel);
            return Ok(walkDto);
        }


        // Update walk
        [HttpPut]
        [Route("{id:guid}")]
        [ValidateModel]
        [Authorize(Roles = "Writer")]
        public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateWalkRequestDto updateWalkRequestDto)
        {
            logger.LogInformation("Update walk called with id={Id}", id);

            // Map DTO to Domain Model
            var walkDomainModel = mapper.Map<Walk>(updateWalkRequestDto);
            // Call repository to update the walk
            var updatedWalk = await walkRepository.UpdateAsync(id, walkDomainModel);
            if (updatedWalk == null)
            {
                logger.LogWarning("Walk with id={Id} not found for update", id);
                return NotFound();
            }

            logger.LogInformation("Walk with id={Id} updated successfully", id);
            // Map Domain Model to DTO
            var walkDto = mapper.Map<WalkDto>(updatedWalk);
            return Ok(walkDto);

        }

        // Delete walk
        [HttpDelete]
        [Route("{id:guid}")]
        [Authorize(Roles = "Writer")]
        public async Task<IActionResult> Delete([FromRoute] Guid id)
        {
            logger.LogInformation("Delete walk called with id={Id}", id);

            // Call repository to delete the walk
            var deletedWalk = await walkRepository.DeleteAsync(id);
            if (deletedWalk == null)
            {
                logger.LogWarning("Walk with id={Id} not found for deletion", id);
                return NotFound();
            }

            logger.LogInformation("Walk with id={Id} deleted successfully", id);
            mapper.Map<WalkDto>(deletedWalk);
            return NoContent();
        }

    }
}
