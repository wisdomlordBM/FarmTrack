using System;
using FarmTrack.Core.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FarmTrack.Infrastructure.Data
{
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Flock> Flocks { get; set; }
        public DbSet<EggRecord> EggRecords { get; set; }
        public DbSet<MortalityRecord> MortalityRecords { get; set; }
        public DbSet<FeedRecord> FeedRecords { get; set; }
        public DbSet<Sale> Sales { get; set; }
        public DbSet<Worker> Workers { get; set; }
        public DbSet<Attendance> Attendances { get; set; }
        public DbSet<Expense> Expenses { get; set; }
        public DbSet<BirdSale> BirdSales { get; set; }
        public DbSet<ManureSale> ManureSales { get; set; }
        public DbSet<FarmProfile> FarmProfiles { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Flock>(entity =>
            {
                entity.Property(e => e.BatchName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.BirdType).HasMaxLength(50);
                entity.Property(e => e.Status).HasMaxLength(20);
            });

            builder.Entity<EggRecord>(entity =>
            {
                entity.Ignore(e => e.GoodEggs);
                entity.Property(e => e.RecordedBy).HasMaxLength(100);
            });

            builder.Entity<Sale>(entity =>
            {
                entity.Ignore(e => e.TotalAmount);
                entity.Ignore(e => e.Balance);
                entity.Property(e => e.CustomerName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.PricePerCrate).HasColumnType("decimal(18,2)");
                entity.Property(e => e.AmountPaid).HasColumnType("decimal(18,2)");
            });

            builder.Entity<FeedRecord>(entity =>
            {
                entity.Ignore(e => e.TotalCost);
                entity.Property(e => e.CostPerKg).HasColumnType("decimal(18,2)");
                entity.Property(e => e.QuantityKg).HasColumnType("decimal(18,2)");
            });

            builder.Entity<Worker>(entity =>
            {
                entity.Property(e => e.FullName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.MonthlySalary).HasColumnType("decimal(18,2)");
                entity.Ignore(e => e.DailyRate);
            });
            builder.Entity<Expense>(entity =>
            {
                entity.Property(e => e.Title).IsRequired().HasMaxLength(150);
                entity.Property(e => e.Category).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
            });
            builder.Entity<BirdSale>(entity =>
            {
                entity.Ignore(e => e.TotalAmount);
                entity.Ignore(e => e.Balance);
                entity.Property(e => e.CustomerName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.PricePerBird).HasColumnType("decimal(18,2)");
                entity.Property(e => e.AmountPaid).HasColumnType("decimal(18,2)");
            });
            builder.Entity<ManureSale>(entity =>
            {
                entity.Ignore(e => e.TotalAmount);
                entity.Ignore(e => e.Balance);
                entity.Property(e => e.CustomerName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.PricePerBag).HasColumnType("decimal(18,2)");
                entity.Property(e => e.AmountPaid).HasColumnType("decimal(18,2)");
            });
            builder.Entity<FarmProfile>(entity =>
            {
                entity.Property(e => e.FarmName)
                    .IsRequired()
                    .HasMaxLength(150);

                entity.Property(e => e.Phone)
                    .HasMaxLength(20);

                entity.Property(e => e.Email)
                    .HasMaxLength(100);

                entity.Property(e => e.Address)
                    .HasMaxLength(250);

               
            });
        }
    }
}
