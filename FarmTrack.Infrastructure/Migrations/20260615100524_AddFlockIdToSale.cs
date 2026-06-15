using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FarmTrack.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddFlockIdToSale : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FlockId",
                table: "Sales",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Sales_FlockId",
                table: "Sales",
                column: "FlockId");

            migrationBuilder.AddForeignKey(
                name: "FK_Sales_Flocks_FlockId",
                table: "Sales",
                column: "FlockId",
                principalTable: "Flocks",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Sales_Flocks_FlockId",
                table: "Sales");

            migrationBuilder.DropIndex(
                name: "IX_Sales_FlockId",
                table: "Sales");

            migrationBuilder.DropColumn(
                name: "FlockId",
                table: "Sales");
        }
    }
}
