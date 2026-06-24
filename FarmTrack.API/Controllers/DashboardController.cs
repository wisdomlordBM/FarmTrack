using FarmTrack.API.DTOs.Dashboard;
using FarmTrack.API.Helpers;
using FarmTrack.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FarmTrack.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IFlockRepository _flockRepo;
        private readonly IEggRecordRepository _eggRepo;
        private readonly ISaleRepository _saleRepo;
        private readonly IWorkerRepository _workerRepo;
        private readonly IExpenseRepository _expenseRepo;
        private readonly IBirdSaleRepository _birdSaleRepo;
        private readonly IManureSaleRepository _manureRepo;

        public DashboardController(
            IFlockRepository flockRepo, IEggRecordRepository eggRepo,
            ISaleRepository saleRepo, IWorkerRepository workerRepo,
            IExpenseRepository expenseRepo, IBirdSaleRepository birdSaleRepo,
            IManureSaleRepository manureRepo)
        {
            _flockRepo = flockRepo; _eggRepo = eggRepo; _saleRepo = saleRepo;
            _workerRepo = workerRepo; _expenseRepo = expenseRepo;
            _birdSaleRepo = birdSaleRepo; _manureRepo = manureRepo;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary(
            [FromQuery] int? month, [FromQuery] int? year)
        {
            var userId = UserHelper.GetUserId(User);
            var now = DateTime.UtcNow;
            var selectedMonth = month ?? now.Month;
            var selectedYear = year ?? now.Year;

            var periodStart = new DateTime(selectedYear, selectedMonth, 1,
                0, 0, 0, DateTimeKind.Utc);
            var periodEnd = periodStart.AddMonths(1);
            var isFuture = periodStart > new DateTime(now.Year, now.Month, 1,
                0, 0, 0, DateTimeKind.Utc);

            var activeFlocks = await _flockRepo.GetActiveFlocks(userId);
            var flockList = activeFlocks.ToList();
            var totalEggsToday = await _eggRepo.GetTotalEggsForTodayAsync(userId);
            var activeWorkers = await _workerRepo.GetActiveWorkersAsync(userId);
            var unpaidSales = await _saleRepo.GetUnpaidSalesAsync(userId);

            decimal eggRevenue = 0, totalExpenses = 0,
                    birdSaleRevenue = 0, manureRevenue = 0;

            if (!isFuture)
            {
                var allSalesForPeriod = await _saleRepo.GetAllAsync(userId);
                eggRevenue = allSalesForPeriod
                    .Where(s => s.SaleDate >= periodStart && s.SaleDate < periodEnd)
                    .Sum(s => s.AmountPaid);

                var periodExpenses = await _expenseRepo
                    .GetByMonthAsync(selectedMonth, selectedYear, userId);
                totalExpenses = periodExpenses.Sum(e => e.Amount);

                var periodBirdSales = await _birdSaleRepo
                    .GetByDateRangeAsync(periodStart, periodEnd, userId);
                birdSaleRevenue = periodBirdSales.Sum(b => b.AmountPaid);

                var periodManureSales = await _manureRepo
                    .GetByDateRangeAsync(periodStart, periodEnd, userId);
                manureRevenue = periodManureSales.Sum(m => m.AmountPaid);
            }

            var operatingProfit = eggRevenue - totalExpenses;
            var totalCash = eggRevenue + birdSaleRevenue + manureRevenue - totalExpenses;

            var allSales = await _saleRepo.GetAllAsync(userId);
            var allExpenses = await _expenseRepo.GetAllByUserAsync(userId);
            var allBirdSales = await _birdSaleRepo.GetAllAsync(userId);
            var allManureSales = await _manureRepo.GetAllAsync(userId);

            var totalAllTimeExpenses = allExpenses.Sum(e => e.Amount);
            var totalAllTimeEggRevenue = allSales.Sum(s => s.AmountPaid);
            var totalAllTimeBirdRevenue = allBirdSales.Sum(b => b.AmountPaid);
            var totalAllTimeManureRevenue = allManureSales.Sum(m => m.AmountPaid);
            var totalAllTimeRevenue = totalAllTimeEggRevenue
                + totalAllTimeBirdRevenue + totalAllTimeManureRevenue;
            var totalAllTimeProfit = totalAllTimeRevenue - totalAllTimeExpenses;

            var trend = new List<EggTrendDto>();
            for (int i = 6; i >= 0; i--)
            {
                var date = now.AddDays(-i).Date;
                var records = await _eggRepo.GetByDateRangeAsync(
                    date, date.AddDays(1), userId);
                trend.Add(new EggTrendDto
                {
                    Date = date.ToString("MMM dd"),
                    TotalEggs = records.Sum(r => r.TotalCollected)
                });
            }

            return Ok(new
            {
                selectedMonth,
                selectedYear,
                isFuture,
                periodLabel = new DateTime(selectedYear, selectedMonth, 1)
                    .ToString("MMMM yyyy"),

                eggRevenueThisMonth = eggRevenue,
                birdSaleRevenueThisMonth = birdSaleRevenue,
                manureSaleRevenueThisMonth = manureRevenue,
                totalExpensesThisMonth = totalExpenses,
                operatingProfitThisMonth = operatingProfit,
                totalCashThisMonth = totalCash,

                totalEggsToday,
                totalActiveBirds = flockList.Sum(f => f.AliveBirds),
                totalActiveFlocks = flockList.Count,
                unpaidSalesCount = unpaidSales.Count(),
                totalWorkers = activeWorkers.Count(),

                totalAllTimeExpenses,
                totalAllTimeEggRevenue,
                totalAllTimeBirdRevenue,
                totalAllTimeManureRevenue,
                totalAllTimeRevenue,
                totalAllTimeProfit,

                eggTrend = trend
            });
        }

        [HttpHead("public-stats")]
        [AllowAnonymous]
        public IActionResult HeadPublicStats() => Ok();

        [HttpGet("public-stats")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublicStats()
        {
            try
            {
                var today = DateTime.UtcNow.Date;
                var now = DateTime.UtcNow;

                var totalEggsToday = await _eggRepo
                    .FindAsync(e => e.CollectionDate.Date == today);
                var allFlocks = await _flockRepo
                    .FindAsync(f => f.Status == "Active");
                var allWorkers = await _workerRepo.GetAllAsync();
                var allSales = await _saleRepo
                    .FindAsync(s => s.SaleDate.Month == now.Month
                                 && s.SaleDate.Year == now.Year);

                return Ok(new
                {
                    totalEggsToday = totalEggsToday.Sum(e => e.TotalCollected),
                    totalActiveBirds = allFlocks.Sum(f => f.AliveBirds),
                    revenueThisMonth = allSales.Sum(s => s.AmountPaid),
                    totalWorkers = allWorkers.Count()
                });
            }
            catch
            {
                return Ok(new
                {
                    totalEggsToday = 0,
                    totalActiveBirds = 0,
                    revenueThisMonth = 0,
                    totalWorkers = 0
                });
            }
        }
    }
}