using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartCityOps.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdateFieldUnitSeedLocations : Migration
    {
        // UnitCode has a unique index, and this migration permutes UnitCode values across rows
        // (e.g. FIR-03 -> TRF-02's slot). Applying the final UPDATEs directly can collide with
        // another row's not-yet-updated UnitCode, so each direction first clears every affected
        // row to a guaranteed-unique placeholder before writing final values.

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                "UPDATE \"FieldUnits\" SET \"UnitCode\" = 'TMP-' || \"Id\" WHERE \"UnitCode\" IN " +
                "('POL-01','POL-02','POL-03','MED-01','MED-02','MED-03','FIR-01','FIR-02','FIR-03'," +
                "'UTL-01','UTL-02','UTL-03','TRF-01','TRF-02','TRF-03');");

            migrationBuilder.UpdateData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("b9599661-cb85-422a-ae1e-3596a0be4976"),
                columns: new[] { "Latitude", "Longitude", "Status", "Type", "UnitCode" },
                values: new object[] { 39.9208, 32.8541, "Available", "Police", "POL-01" });

            migrationBuilder.UpdateData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("96f71bc3-185a-4148-b6e5-2a67daca36f5"),
                columns: new[] { "Latitude", "Longitude", "Status", "Type", "UnitCode" },
                values: new object[] { 39.9042, 32.8615, "Available", "Police", "POL-02" });

            migrationBuilder.UpdateData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("fbeba342-a43c-40ed-9465-f50a4177ccf7"),
                columns: new[] { "Latitude", "Longitude", "Status", "Type", "UnitCode" },
                values: new object[] { 39.9685, 32.7485, "Available", "Police", "POL-03" });

            migrationBuilder.UpdateData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("2ac082fc-7044-4b45-8404-f018d6209477"),
                columns: new[] { "Latitude", "Longitude", "Status", "Type", "UnitCode" },
                values: new object[] { 39.9750, 32.8650, "Available", "Police", "POL-04" });

            migrationBuilder.UpdateData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("6b68f2df-e043-48e2-a800-6f26bf4ed843"),
                columns: new[] { "Latitude", "Longitude", "Status", "Type", "UnitCode" },
                values: new object[] { 39.9315, 32.8610, "Available", "Medical", "MED-01" });

            migrationBuilder.UpdateData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("4e2e9af5-cf12-4270-bfc3-f641cf3d815f"),
                columns: new[] { "Latitude", "Longitude", "Status", "Type", "UnitCode" },
                values: new object[] { 39.8970, 32.7635, "Available", "Medical", "MED-02" });

            migrationBuilder.UpdateData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("145eeb0d-ef83-41bd-994b-083e5a6c92d1"),
                columns: new[] { "Latitude", "Longitude", "Status", "Type", "UnitCode" },
                values: new object[] { 39.9640, 32.8250, "Available", "Medical", "MED-03" });

            migrationBuilder.UpdateData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("833f2afc-9565-497d-8bb2-75403aab7127"),
                columns: new[] { "Latitude", "Longitude", "Status", "Type", "UnitCode" },
                values: new object[] { 39.9430, 32.8540, "Available", "Fire", "FIR-01" });

            migrationBuilder.UpdateData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("5a6fcd12-2798-432c-81a6-416c00d5c30f"),
                columns: new[] { "Latitude", "Longitude", "Status", "Type", "UnitCode" },
                values: new object[] { 39.9720, 32.7650, "Available", "Fire", "FIR-02" });

            migrationBuilder.UpdateData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("d5dd3221-bd61-417c-9350-8bd21b732f9b"),
                columns: new[] { "Latitude", "Longitude", "Status", "Type", "UnitCode" },
                values: new object[] { 39.9280, 32.9150, "OutOfService", "Fire", "FIR-03" });

            migrationBuilder.UpdateData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("c05d230d-78b1-41ed-be18-c7936616b0ae"),
                columns: new[] { "Latitude", "Longitude", "Status", "Type", "UnitCode" },
                values: new object[] { 39.9110, 32.8120, "OutOfService", "TrafficControl", "TRF-01" });

            migrationBuilder.UpdateData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("12ad0bf6-b819-40e7-95d8-093ff4b9ac19"),
                columns: new[] { "Latitude", "Longitude", "Status", "Type", "UnitCode" },
                values: new object[] { 39.9530, 32.7950, "Available", "TrafficControl", "TRF-02" });

            migrationBuilder.UpdateData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("cc32593c-0ab6-4c24-aaea-f6bb9ab2de95"),
                columns: new[] { "Latitude", "Longitude", "Status", "Type", "UnitCode" },
                values: new object[] { 39.9380, 32.8950, "Available", "TrafficControl", "TRF-03" });

            migrationBuilder.UpdateData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("40adac57-adbc-42fb-b833-2ff44c976106"),
                columns: new[] { "Latitude", "Longitude", "Status", "Type", "UnitCode" },
                values: new object[] { 39.9250, 32.8020, "Available", "UtilityCrew", "TEC-01" });

            migrationBuilder.UpdateData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("115b0f76-4adf-4c9e-9d43-432b18143449"),
                columns: new[] { "Latitude", "Longitude", "Status", "Type", "UnitCode" },
                values: new object[] { 39.9195, 32.8530, "Available", "UtilityCrew", "TEC-02" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                "UPDATE \"FieldUnits\" SET \"UnitCode\" = 'TMP-' || \"Id\" WHERE \"UnitCode\" IN " +
                "('POL-01','POL-02','POL-03','POL-04','MED-01','MED-02','MED-03','FIR-01','FIR-02','FIR-03'," +
                "'TRF-01','TRF-02','TRF-03','TEC-01','TEC-02');");

            migrationBuilder.UpdateData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("115b0f76-4adf-4c9e-9d43-432b18143449"),
                columns: new[] { "Latitude", "Longitude", "Status", "Type", "UnitCode" },
                values: new object[] { 39.89, 32.87, "Available", "TrafficControl", "TRF-03" });

            migrationBuilder.UpdateData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("12ad0bf6-b819-40e7-95d8-093ff4b9ac19"),
                columns: new[] { "Latitude", "Longitude", "Status", "Type", "UnitCode" },
                values: new object[] { 39.91, 32.79, "Available", "UtilityCrew", "UTL-03" });

            migrationBuilder.UpdateData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("145eeb0d-ef83-41bd-994b-083e5a6c92d1"),
                columns: new[] { "Latitude", "Longitude", "Status", "Type", "UnitCode" },
                values: new object[] { 39.915, 32.82, "Available", "Fire", "FIR-01" });

            migrationBuilder.UpdateData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("2ac082fc-7044-4b45-8404-f018d6209477"),
                columns: new[] { "Latitude", "Longitude", "Status", "Type", "UnitCode" },
                values: new object[] { 39.93, 32.85, "Available", "Medical", "MED-01" });

            migrationBuilder.UpdateData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("40adac57-adbc-42fb-b833-2ff44c976106"),
                columns: new[] { "Latitude", "Longitude", "Status", "Type", "UnitCode" },
                values: new object[] { 39.93, 32.79, "Available", "TrafficControl", "TRF-02" });

            migrationBuilder.UpdateData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("4e2e9af5-cf12-4270-bfc3-f641cf3d815f"),
                columns: new[] { "Latitude", "Longitude", "Status", "Type", "UnitCode" },
                values: new object[] { 39.88, 32.79, "Available", "Medical", "MED-03" });

            migrationBuilder.UpdateData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("5a6fcd12-2798-432c-81a6-416c00d5c30f"),
                columns: new[] { "Latitude", "Longitude", "Status", "Type", "UnitCode" },
                values: new object[] { 39.87, 32.83, "OutOfService", "Fire", "FIR-03" });

            migrationBuilder.UpdateData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("6b68f2df-e043-48e2-a800-6f26bf4ed843"),
                columns: new[] { "Latitude", "Longitude", "Status", "Type", "UnitCode" },
                values: new object[] { 39.96, 32.83, "Available", "Medical", "MED-02" });

            migrationBuilder.UpdateData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("833f2afc-9565-497d-8bb2-75403aab7127"),
                columns: new[] { "Latitude", "Longitude", "Status", "Type", "UnitCode" },
                values: new object[] { 39.92, 32.88, "Available", "Fire", "FIR-02" });

            migrationBuilder.UpdateData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("96f71bc3-185a-4148-b6e5-2a67daca36f5"),
                columns: new[] { "Latitude", "Longitude", "Status", "Type", "UnitCode" },
                values: new object[] { 39.95, 32.80, "Available", "Police", "POL-02" });

            migrationBuilder.UpdateData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("b9599661-cb85-422a-ae1e-3596a0be4976"),
                columns: new[] { "Latitude", "Longitude", "Status", "Type", "UnitCode" },
                values: new object[] { 39.925, 32.836, "Available", "Police", "POL-01" });

            migrationBuilder.UpdateData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("c05d230d-78b1-41ed-be18-c7936616b0ae"),
                columns: new[] { "Latitude", "Longitude", "Status", "Type", "UnitCode" },
                values: new object[] { 39.97, 32.87, "OutOfService", "UtilityCrew", "UTL-02" });

            migrationBuilder.UpdateData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("cc32593c-0ab6-4c24-aaea-f6bb9ab2de95"),
                columns: new[] { "Latitude", "Longitude", "Status", "Type", "UnitCode" },
                values: new object[] { 39.905, 32.81, "OutOfService", "TrafficControl", "TRF-01" });

            migrationBuilder.UpdateData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("d5dd3221-bd61-417c-9350-8bd21b732f9b"),
                columns: new[] { "Latitude", "Longitude", "Status", "Type", "UnitCode" },
                values: new object[] { 39.94, 32.86, "Available", "UtilityCrew", "UTL-01" });

            migrationBuilder.UpdateData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("fbeba342-a43c-40ed-9465-f50a4177ccf7"),
                columns: new[] { "Latitude", "Longitude", "Status", "Type", "UnitCode" },
                values: new object[] { 39.90, 32.90, "Available", "Police", "POL-03" });
        }
    }
}
