using Microsoft.EntityFrameworkCore;
using SmartCityOps.Application.FieldUnits;
using SmartCityOps.Infrastructure.Persistence;

namespace SmartCityOps.Infrastructure.FieldUnits;

public class FieldUnitService : IFieldUnitService
{
    private readonly ApplicationDbContext dbContext;

    public FieldUnitService(ApplicationDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public async Task<IReadOnlyList<FieldUnitDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await dbContext.FieldUnits
            .AsNoTracking() //sadece okuma için hiçbir şey güncellenmeyecek.
            .Select(f => new FieldUnitDto(
                f.Id,
                f.UnitCode,
                f.Type.ToString(),
                f.Status.ToString(),
                f.Latitude,
                f.Longitude))
            .ToListAsync(cancellationToken);
    }
}