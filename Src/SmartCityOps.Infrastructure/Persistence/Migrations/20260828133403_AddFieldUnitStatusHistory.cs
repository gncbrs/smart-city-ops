using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartCityOps.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddFieldUnitStatusHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FieldUnitStatusHistories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FieldUnitId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ChangedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Reason = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FieldUnitStatusHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FieldUnitStatusHistories_FieldUnits_FieldUnitId",
                        column: x => x.FieldUnitId,
                        principalTable: "FieldUnits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FieldUnitStatusHistories_FieldUnitId_ChangedAt",
                table: "FieldUnitStatusHistories",
                columns: new[] { "FieldUnitId", "ChangedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FieldUnitStatusHistories");
        }
    }
}
