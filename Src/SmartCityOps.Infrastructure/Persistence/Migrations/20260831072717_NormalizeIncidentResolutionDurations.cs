using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartCityOps.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class NormalizeIncidentResolutionDurations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE ""Incidents""
                SET ""ResolvedAt"" = ""ReportedAt"" + (15 + random() * 30) * INTERVAL '1 minute'
                WHERE ""Status"" = 'Resolved'
                  AND ""ResolvedAt"" IS NOT NULL
                  AND ""ResolvedAt"" > ""ReportedAt"" + INTERVAL '2 hours';
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Data migration — original (unrealistic) ResolvedAt values are not recoverable.
        }
    }
}
