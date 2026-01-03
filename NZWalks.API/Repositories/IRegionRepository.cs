using Microsoft.EntityFrameworkCore.Update.Internal;
using NZWalks.API.Models.Domain;

namespace NZWalks.API.Repositories
{
    public interface IRegionRepository
    {
        Task<(List<Region> regions, int totalCount)> GetAllAsync(string? sortBy = null, bool isAscending = true, int pageNumber = 1, int pageSize = 10);
        Task<Region> GetByIdAsync(Guid id);
        Task<Region> Create(Region region);

        Task<Region?> Update(Guid id, Region region);
        Task<Region?> DeleteAsync(Guid id);
    }
}
