using Microsoft.EntityFrameworkCore;
using SmartCityOps.Application.FieldUnitLocationHistories;
using SmartCityOps.Infrastructure.Persistence;

namespace SmartCityOps.Infrastructure.FieldUnitLocationHistories;

public class FieldUnitLocationHistoryService : IFieldUnitLocationHistoryService
{
    private readonly ApplicationDbContext dbContext;

    public FieldUnitLocationHistoryService(ApplicationDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public async Task<IReadOnlyList<FieldUnitLocationHistoryDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await dbContext.FieldUnitLocationHistories
            .AsNoTracking()
            .OrderBy(h => h.RecordedAt)
            .Select(h => new FieldUnitLocationHistoryDto(
                h.Id,
                h.FieldUnitId,
                h.IncidentId,
                h.Latitude,
                h.Longitude,
                h.RecordedAt))
            .ToListAsync(cancellationToken);
    }
}