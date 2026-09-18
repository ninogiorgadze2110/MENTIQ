using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mentiq.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddKidsExercises : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ExerciseAttempts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Skill = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    ExerciseType = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    World = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: true),
                    Difficulty = table.Column<int>(type: "int", nullable: false),
                    CorrectAnswer = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    GivenAnswer = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    IsCorrect = table.Column<bool>(type: "bit", nullable: false),
                    ResponseTimeMs = table.Column<int>(type: "int", nullable: false),
                    AttemptNumber = table.Column<int>(type: "int", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExerciseAttempts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SkillProgress",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Skill = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Level = table.Column<int>(type: "int", nullable: false),
                    Score = table.Column<int>(type: "int", nullable: false),
                    TotalAttempts = table.Column<int>(type: "int", nullable: false),
                    CorrectAttempts = table.Column<int>(type: "int", nullable: false),
                    AverageResponseTimeMs = table.Column<double>(type: "float", nullable: false),
                    CorrectStreak = table.Column<int>(type: "int", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SkillProgress", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ExerciseAttempts_UserId_CreatedAtUtc",
                table: "ExerciseAttempts",
                columns: new[] { "UserId", "CreatedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_ExerciseAttempts_UserId_Skill",
                table: "ExerciseAttempts",
                columns: new[] { "UserId", "Skill" });

            migrationBuilder.CreateIndex(
                name: "IX_SkillProgress_UserId_Skill",
                table: "SkillProgress",
                columns: new[] { "UserId", "Skill" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExerciseAttempts");

            migrationBuilder.DropTable(
                name: "SkillProgress");
        }
    }
}
