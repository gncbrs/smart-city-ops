using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartCityOps.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FixFieldUnitOutOfServiceStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("115b0f76-4adf-4c9e-9d43-432b18143449"),
                column: "Status",
                value: "Available");

            migrationBuilder.UpdateData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("c05d230d-78b1-41ed-be18-c7936616b0ae"),
                column: "Status",
                value: "OutOfService");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("115b0f76-4adf-4c9e-9d43-432b18143449"),
                column: "Status",
                value: "OutOfService");

            migrationBuilder.UpdateData(
                table: "FieldUnits",
                keyColumn: "Id",
                keyValue: new Guid("c05d230d-78b1-41ed-be18-c7936616b0ae"),
                column: "Status",
                value: "Available");
        }
    }
}
