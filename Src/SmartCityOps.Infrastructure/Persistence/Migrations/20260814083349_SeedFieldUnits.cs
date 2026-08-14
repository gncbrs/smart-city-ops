using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SmartCityOps.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SeedFieldUnits : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "FieldUnits",
                columns: new[] { "Id", "Latitude", "Longitude", "Status", "Type", "UnitCode" },
                values: new object[,]
                {
                    { new Guid("145eeb0d-ef83-41bd-994b-083e5a6c92d1"), 39.914999999999999, 32.82, "Dispatched", "Fire", "FIR-01" },
                    { new Guid("2ac082fc-7044-4b45-8404-f018d6209477"), 39.93, 32.850000000000001, "Available", "Medical", "MED-01" },
                    { new Guid("b9599661-cb85-422a-ae1e-3596a0be4976"), 39.924999999999997, 32.835999999999999, "Available", "Police", "POL-01" },
                    { new Guid("cc32593c-0ab6-4c24-aaea-f6bb9ab2de95"), 39.905000000000001, 32.810000000000002, "OutOfService", "TrafficControl", "TRF-01" },
                    { new Guid("d5dd3221-bd61-417c-9350-8bd21b732f9b"), 39.939999999999998, 32.859999999999999, "Available", "UtilityCrew", "UTL-01" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("145eeb0d-ef83-41bd-994b-083e5a6c92d1"));

            migrationBuilder.DeleteData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("2ac082fc-7044-4b45-8404-f018d6209477"));

            migrationBuilder.DeleteData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("b9599661-cb85-422a-ae1e-3596a0be4976"));

            migrationBuilder.DeleteData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("cc32593c-0ab6-4c24-aaea-f6bb9ab2de95"));

            migrationBuilder.DeleteData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("d5dd3221-bd61-417c-9350-8bd21b732f9b"));
        }
    }
}
