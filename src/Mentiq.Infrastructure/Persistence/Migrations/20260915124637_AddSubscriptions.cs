using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Mentiq.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSubscriptions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "Users",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "Student");

            migrationBuilder.AddColumn<DateTime>(
                name: "TrialEndUtc",
                table: "Users",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "TrialStartUtc",
                table: "Users",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateTable(
                name: "SubscriptionHistory",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Plan = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Provider = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    ActivatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(1024)", maxLength: 1024, nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubscriptionHistory", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Subscriptions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Plan = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Provider = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    ProviderCustomerId = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ProviderSubscriptionId = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ActivatedByAdminId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(1024)", maxLength: 1024, nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Subscriptions", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SubscriptionHistory_UserId",
                table: "SubscriptionHistory",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Subscriptions_UserId",
                table: "Subscriptions",
                column: "UserId",
                unique: true);

            // -----------------------------------------------------------------
            // Data backfill (safe, non-destructive):
            //  1. Existing users were added with the default 0001-01-01 trial
            //     dates. Grant them a fresh 7-day trial from the moment this
            //     migration runs so no current user is suddenly locked out.
            //  2. Promote the known owner account to Administrator so manual
            //     subscription management is usable immediately after deploy.
            // All dates are UTC (SYSUTCDATETIME).
            // -----------------------------------------------------------------
            migrationBuilder.Sql(
                "UPDATE [Users] SET [TrialStartUtc] = SYSUTCDATETIME(), " +
                "[TrialEndUtc] = DATEADD(day, 7, SYSUTCDATETIME()) " +
                "WHERE [TrialStartUtc] < '2020-01-01';");

            migrationBuilder.Sql(
                "UPDATE [Users] SET [Role] = 'Administrator' " +
                "WHERE LOWER([Email]) = 'ninngiorgadze@gmail.com';");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SubscriptionHistory");

            migrationBuilder.DropTable(
                name: "Subscriptions");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "TrialEndUtc",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "TrialStartUtc",
                table: "Users");
        }
    }
}
