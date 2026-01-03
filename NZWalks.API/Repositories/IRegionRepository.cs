using Microsoft.EntityFrameworkCore.Update.Internal;
using NZWalks.API.Models.Domain;

namespace NZWalks.API.Repositories
{
    public interface IRegionRepository
    {
        Task<List<Region>> GetAllAsync(string? sortBy = null, bool isAscending = true);
        Task<Region> GetByIdAsync(Guid id);
        Task<Region> Create(Region region);

        Task<Region?> Update(Guid id, Region region);
        Task<Region?> DeleteAsync(Guid id);
    }
}
