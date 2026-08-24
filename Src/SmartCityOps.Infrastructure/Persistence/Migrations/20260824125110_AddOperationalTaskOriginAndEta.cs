using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartCityOps.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddOperationalTaskOriginAndEta : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "EstimatedEtaSeconds",
                table: "OperationalTasks",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "OriginLatitude",
                table: "OperationalTasks",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "OriginLongitude",
                table: "OperationalTasks",
                type: "double precision",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EstimatedEtaSeconds",
                table: "OperationalTasks");

            migrationBuilder.DropColumn(
                name: "OriginLatitude",
                table: "OperationalTasks");

            migrationBuilder.DropColumn(
                name: "OriginLongitude",
                table: "OperationalTasks");
        }
    }
}
