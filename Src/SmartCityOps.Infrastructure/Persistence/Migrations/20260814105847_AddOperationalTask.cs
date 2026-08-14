using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartCityOps.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddOperationalTask : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OperationalTasks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    IncidentId = table.Column<Guid>(type: "uuid", nullable: false),
                    FieldUnitId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    AssignedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CompletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OperationalTasks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OperationalTasks_FieldUnits_FieldUnitId",
                        column: x => x.FieldUnitId,
                        principalTable: "FieldUnits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OperationalTasks_Incidents_IncidentId",
                        column: x => x.IncidentId,
                        principalTable: "Incidents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OperationalTasks_FieldUnitId",
                table: "OperationalTasks",
                column: "FieldUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_OperationalTasks_IncidentId",
                table: "OperationalTasks",
                column: "IncidentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OperationalTasks");
        }
    }
}
