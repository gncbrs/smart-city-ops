using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartCityOps.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddOperationalTaskActiveAssignmentUniqueIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_OperationalTasks_FieldUnitId",
                table: "OperationalTasks");

            migrationBuilder.CreateIndex(
                name: "IX_OperationalTasks_FieldUnitId_ActiveAssignment",
                table: "OperationalTasks",
                column: "FieldUnitId",
                unique: true,
                filter: "\"Status\" = 'Assigned'");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_OperationalTasks_FieldUnitId_ActiveAssignment",
                table: "OperationalTasks");

            migrationBuilder.CreateIndex(
                name: "IX_OperationalTasks_FieldUnitId",
                table: "OperationalTasks",
                column: "FieldUnitId");
        }
    }
}
