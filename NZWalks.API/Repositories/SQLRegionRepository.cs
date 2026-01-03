using Microsoft.EntityFrameworkCore;
using NZWalks.API.Data;
using NZWalks.API.Models.Domain;

namespace NZWalks.API.Repositories
{
    public class SQLRegionRepository : IRegionRepository
    {
        private readonly NZWalksDbContext dbContext;

        public SQLRegionRepository(NZWalksDbContext dbContext)
        {
            this.dbContext = dbContext;
        }
        public async Task<(List<Region> regions, int totalCount)> GetAllAsync(string? sortBy = null, bool isAscending = true, int pageNumber = 1, int pageSize = 10)
        {
            var regions = dbContext.Regions.AsQueryable();

            // Sorting
            if (!string.IsNullOrWhiteSpace(sortBy))
            {
                if (sortBy.Equals("Name", StringComparison.OrdinalIgnoreCase))
                {
                    regions = isAscending ? regions.OrderBy(x => x.Name) : regions.OrderByDescending(x => x.Name);
                }
                else if (sortBy.Equals("Code", StringComparison.OrdinalIgnoreCase))
                {
                    regions = isAscending ? regions.OrderBy(x => x.Code) : regions.OrderByDescending(x => x.Code);
                }
            }

            // Get total count before pagination
            var totalCount = await regions.CountAsync();

            // Pagination
            var skipResults = (pageNumber - 1) * pageSize;
            var paginatedRegions = await regions.Skip(skipResults).Take(pageSize).ToListAsync();

            return (paginatedRegions, totalCount);

        }

        public async Task<Region> Create(Region region)
        {
            await dbContext.Regions.AddAsync(region);
            await dbContext.SaveChangesAsync();
            return region;
        }

        public async Task<Region> GetByIdAsync(Guid id)
        {
            return await dbContext.Regions.FirstOrDefaultAsync(x => x.Id == id);
        }





        public async Task<Region?> Update(Guid id, Region region)
        {
            var existingRegion = await dbContext.Regions.FirstOrDefaultAsync(x => x.Id == id);
            if (existingRegion == null)
            {
                return null; // Region not found
            }
            // Update the properties of the existing region
            existingRegion.Code = region.Code;
            existingRegion.Name = region.Name;
            existingRegion.RegionImageUrl = region.RegionImageUrl;
            // Save changes to the database
            await dbContext.SaveChangesAsync();
            return existingRegion;
        }

        public async Task<Region?> DeleteAsync(Guid id)
        {
            var region = await dbContext.Regions.FirstOrDefaultAsync(x => x.Id == id);
            if (region == null)
            {
                return null; // Region not found
            }
            dbContext.Regions.Remove(region);
            await dbContext.SaveChangesAsync();
            return region; // Return the deleted region

        }
    }
}
