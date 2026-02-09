using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NZWalks.API.CustomActionFilters;
using NZWalks.API.Data;
using NZWalks.API.Models.Domain;
using NZWalks.API.Models.DTO;
using NZWalks.API.Repositories;

namespace NZWalks.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RegionsController : ControllerBase
    {
        private readonly NZWalksDbContext dbContext;
        private readonly IRegionRepository regionRepository;
        private readonly IMapper mapper;
        private readonly ILogger<RegionsController> logger;

        public RegionsController(NZWalksDbContext dbContext, IRegionRepository regionRepository, IMapper mapper, ILogger<RegionsController> logger)
        {
            this.dbContext = dbContext;
            this.regionRepository = regionRepository;
            this.mapper = mapper;
            this.logger = logger;
        }

        [HttpGet]
        [Authorize(Roles="Reader")]
        public async Task<IActionResult> GetAllAsync([FromQuery] string? sortBy, [FromQuery] bool isAscending = true,
           [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            logger.LogInformation("GetAllAsync called with sortBy={SortBy}, isAscending={IsAscending}, pageNumber={PageNumber}, pageSize={PageSize}", 
                sortBy ?? "null", isAscending, pageNumber, pageSize);

            // Validate pagination parameters
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 100) pageSize = 100; // Max page size limit

            // Call repository to get all regions with pagination
            var (regions, totalCount) = await regionRepository.GetAllAsync(sortBy, isAscending, pageNumber, pageSize);

            logger.LogInformation("Retrieved {Count} regions out of {TotalCount} total", regions.Count, totalCount);

            // Calculate total pages
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            // Add pagination metadata to response headers
            Response.Headers["X-Total-Count"] = totalCount.ToString();
            Response.Headers["X-Page-Number"] = pageNumber.ToString();
            Response.Headers["X-Page-Size"] = pageSize.ToString();
            Response.Headers["X-Total-Pages"] = totalPages.ToString();

            // Using AutoMapper to map the list of regions to a list of RegionDto
            return Ok(mapper.Map<List<RegionDto>>(regions));
        }

        [HttpGet("{id:guid}")]
        [ActionName("GetByIdAsync")]
        [Authorize(Roles = "Reader,Writer")]
        public async Task<IActionResult> GetByIdAsync([FromRoute] Guid id)
        {
            logger.LogInformation("GetByIdAsync called with id={Id}", id);

            var region = await dbContext.Regions.FirstOrDefaultAsync(x => x.Id == id);

            if (region == null)
            {
                logger.LogWarning("Region with id={Id} not found", id);
                return NotFound();
            }

            logger.LogInformation("Region with id={Id} retrieved successfully", id);


            return Ok(mapper.Map<RegionDto>(region));


        }

        [HttpPost]
        [ValidateModel]
        [Authorize(Roles = "Writer")]
        public async Task<IActionResult> Create([FromBody] AddRegionRequestDto addRegionRequestDto)
        {
            logger.LogInformation("Create called with region name={Name}", addRegionRequestDto.Name);

            // Validate the incoming request

            var regionDomainModel = mapper.Map<Region>(addRegionRequestDto);
            regionDomainModel = await regionRepository.Create(regionDomainModel);

            logger.LogInformation("Region created successfully with id={Id}", regionDomainModel.Id);


            var regionDto = mapper.Map<RegionDto>(regionDomainModel);
            return CreatedAtAction(nameof(GetByIdAsync), new { id = regionDto.Id }, regionDto);

        }

        [HttpPut]
        [Route("{id:guid}")]
        [ValidateModel]
        [Authorize(Roles = "Writer")]
        public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateRegionRequestDto updateRegionRequestDto)
        {
            logger.LogInformation("Update called with id={Id}", id);

            var regionDomainModel = mapper.Map<Region>(updateRegionRequestDto);
            var region = await regionRepository.Update(id, regionDomainModel);
            if (region == null)
            {
                logger.LogWarning("Region with id={Id} not found for update", id);
                return NotFound();
            }

            logger.LogInformation("Region with id={Id} updated successfully", id);

            var regionDto = mapper.Map<RegionDto>(region);
            return Ok(regionDto);

        }

        [HttpDelete]
        [Route("{id:guid}")]
        [Authorize(Roles = "Writer")]
        public async Task<IActionResult> Delete([FromRoute] Guid id)
        {
            logger.LogInformation("Delete called with id={Id}", id);

            var region = await regionRepository.DeleteAsync(id);

            if (region == null)
            {
                logger.LogWarning("Region with id={Id} not found for deletion", id);
                return NotFound();
            }

            logger.LogInformation("Region with id={Id} deleted successfully", id);
            var regionDto = mapper.Map<RegionDto>(region);

            return NoContent();
        }

    }
}
