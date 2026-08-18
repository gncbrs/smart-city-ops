using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SmartCityOps.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ExpandFieldUnitSeedData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("145eeb0d-ef83-41bd-994b-083e5a6c92d1"),
                column: "Status",
                value: "Available");

            migrationBuilder.InsertData(
                table: "FieldUnits",
                columns: new[] { "Id", "Latitude", "Longitude", "Status", "Type", "UnitCode" },
                values: new object[,]
                {
                    { new Guid("115b0f76-4adf-4c9e-9d43-432b18143449"), 39.890000000000001, 32.869999999999997, "OutOfService", "TrafficControl", "TRF-03" },
                    { new Guid("12ad0bf6-b819-40e7-95d8-093ff4b9ac19"), 39.909999999999997, 32.789999999999999, "Available", "UtilityCrew", "UTL-03" },
                    { new Guid("40adac57-adbc-42fb-b833-2ff44c976106"), 39.93, 32.789999999999999, "Available", "TrafficControl", "TRF-02" },
                    { new Guid("4e2e9af5-cf12-4270-bfc3-f641cf3d815f"), 39.880000000000003, 32.789999999999999, "Available", "Medical", "MED-03" },
                    { new Guid("5a6fcd12-2798-432c-81a6-416c00d5c30f"), 39.869999999999997, 32.829999999999998, "OutOfService", "Fire", "FIR-03" },
                    { new Guid("6b68f2df-e043-48e2-a800-6f26bf4ed843"), 39.960000000000001, 32.829999999999998, "Available", "Medical", "MED-02" },
                    { new Guid("833f2afc-9565-497d-8bb2-75403aab7127"), 39.920000000000002, 32.880000000000003, "Available", "Fire", "FIR-02" },
                    { new Guid("96f71bc3-185a-4148-b6e5-2a67daca36f5"), 39.950000000000003, 32.799999999999997, "Available", "Police", "POL-02" },
                    { new Guid("c05d230d-78b1-41ed-be18-c7936616b0ae"), 39.969999999999999, 32.869999999999997, "Available", "UtilityCrew", "UTL-02" },
                    { new Guid("fbeba342-a43c-40ed-9465-f50a4177ccf7"), 39.899999999999999, 32.899999999999999, "Available", "Police", "POL-03" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("115b0f76-4adf-4c9e-9d43-432b18143449"));

            migrationBuilder.DeleteData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("12ad0bf6-b819-40e7-95d8-093ff4b9ac19"));

            migrationBuilder.DeleteData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("40adac57-adbc-42fb-b833-2ff44c976106"));

            migrationBuilder.DeleteData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("4e2e9af5-cf12-4270-bfc3-f641cf3d815f"));

            migrationBuilder.DeleteData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("5a6fcd12-2798-432c-81a6-416c00d5c30f"));

            migrationBuilder.DeleteData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("6b68f2df-e043-48e2-a800-6f26bf4ed843"));

            migrationBuilder.DeleteData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("833f2afc-9565-497d-8bb2-75403aab7127"));

            migrationBuilder.DeleteData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("96f71bc3-185a-4148-b6e5-2a67daca36f5"));

            migrationBuilder.DeleteData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("c05d230d-78b1-41ed-be18-c7936616b0ae"));

            migrationBuilder.DeleteData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("fbeba342-a43c-40ed-9465-f50a4177ccf7"));

            migrationBuilder.UpdateData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("145eeb0d-ef83-41bd-994b-083e5a6c92d1"),
                column: "Status",
                value: "Dispatched");
        }
    }
}
