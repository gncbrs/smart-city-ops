using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SmartCityOps.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SeedRestrictedZones : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "RestrictedZones",
                columns: new[] { "Id", "CreatedAt", "Description", "IsActive", "Latitude", "Longitude", "Name", "RadiusMeters", "ZoneType" },
                values: new object[,]
                {
                    { new Guid("d1111111-1111-1111-1111-111111111111"), new DateTimeOffset(new DateTime(2026, 8, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "Government district security perimeter - police access only", true, 39.9208, 32.854100000000003, "Kızılay Security Zone", 600.0, "SecurityLockdown" },
                    { new Guid("d2222222-2222-2222-2222-222222222222"), new DateTimeOffset(new DateTime(2026, 8, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), "Main arterial infrastructure & road maintenance", true, 39.908000000000001, 32.765000000000001, "Eskişehir Road Construction", 800.0, "RoadConstruction" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "RestrictedZones",
                keyColumn: "Id",
                keyValue: new Guid("d1111111-1111-1111-1111-111111111111"));

            migrationBuilder.DeleteData(
                table: "RestrictedZones",
                keyColumn: "Id",
                keyValue: new Guid("d2222222-2222-2222-2222-222222222222"));
        }
    }
}
