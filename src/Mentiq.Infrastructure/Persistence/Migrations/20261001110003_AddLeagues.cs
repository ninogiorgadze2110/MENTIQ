using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mentiq.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddLeagues : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Leagues",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Grade = table.Column<int>(type: "int", nullable: false),
                    Tier = table.Column<int>(type: "int", nullable: false),
                    WeekStartUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    WeekEndUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Closed = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Leagues", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserLeagueStandings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Tier = table.Column<int>(type: "int", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserLeagueStandings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LeagueEntries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LeagueId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DisplayName = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    Points = table.Column<int>(type: "int", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeagueEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeagueEntries_Leagues_LeagueId",
                        column: x => x.LeagueId,
                        principalTable: "Leagues",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LeagueEntries_LeagueId_UserId",
                table: "LeagueEntries",
                columns: new[] { "LeagueId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Leagues_Closed_WeekEndUtc",
                table: "Leagues",
                columns: new[] { "Closed", "WeekEndUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_Leagues_Grade_Tier_WeekStartUtc",
                table: "Leagues",
                columns: new[] { "Grade", "Tier", "WeekStartUtc" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserLeagueStandings_UserId",
                table: "UserLeagueStandings",
                column: "UserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LeagueEntries");

            migrationBuilder.DropTable(
                name: "UserLeagueStandings");

            migrationBuilder.DropTable(
                name: "Leagues");
        }
    }
}
