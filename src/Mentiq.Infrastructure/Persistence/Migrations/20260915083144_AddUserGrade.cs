using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mentiq.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddUserGrade : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Grade",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Grade",
                table: "Users");
        }
    }
}
