using FarmTrack.API.DTOs.Dashboard;
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

        public DashboardController(
            IFlockRepository flockRepo,
            IEggRecordRepository eggRepo,
            ISaleRepository saleRepo,
            IWorkerRepository workerRepo,
            IExpenseRepository expenseRepo,
            IBirdSaleRepository birdSaleRepo)
        {
            _flockRepo = flockRepo;
            _eggRepo = eggRepo;
            _saleRepo = saleRepo;
            _workerRepo = workerRepo;
            _expenseRepo = expenseRepo;
            _birdSaleRepo = birdSaleRepo;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var activeFlocks = await _flockRepo.GetActiveFlocks();
            var flockList = activeFlocks.ToList();

            var totalEggsToday = await _eggRepo.GetTotalEggsForTodayAsync();
            var eggRevenue = await _saleRepo.GetTotalRevenueThisMonthAsync();
            var unpaidSales = await _saleRepo.GetUnpaidSalesAsync();
            var activeWorkers = await _workerRepo.GetActiveWorkersAsync();
            var totalExpenses = await _expenseRepo.GetTotalExpensesThisMonthAsync();
            var birdSaleRevenue = await _birdSaleRepo.GetTotalRevenueThisMonthAsync();

            var operatingProfit = eggRevenue - totalExpenses;

            var totalCash = eggRevenue + birdSaleRevenue - totalExpenses;

            var trend = new List<EggTrendDto>();
            for (int i = 6; i >= 0; i--)
            {
                var date = DateTime.UtcNow.AddDays(-i).Date;
                var records = await _eggRepo.GetByDateRangeAsync(
                    date, date.AddDays(1));
                trend.Add(new EggTrendDto
                {
                    Date = date.ToString("MMM dd"),
                    TotalEggs = records.Sum(r => r.TotalCollected)
                });
            }

            return Ok(new
            {
                totalEggsToday,
                totalActiveBirds = flockList.Sum(f => f.AliveBirds),
                totalActiveFlocks = flockList.Count,
                eggRevenueThisMonth = eggRevenue,
                totalExpensesThisMonth = totalExpenses,
                operatingProfitThisMonth = operatingProfit,
                birdSaleRevenueThisMonth = birdSaleRevenue,
                totalCashThisMonth = totalCash,
                unpaidSalesCount = unpaidSales.Count(),
                totalWorkers = activeWorkers.Count(),
                eggTrend = trend
            });
        }
        [HttpGet("public-stats")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublicStats()
        {
            try
            {
                var activeFlocks = await _flockRepo.GetActiveFlocks();
                var flockList = activeFlocks.ToList();
                var totalEggsToday = await _eggRepo.GetTotalEggsForTodayAsync();
                var revenueThisMonth = await _saleRepo.GetTotalRevenueThisMonthAsync();
                var activeWorkers = await _workerRepo.GetActiveWorkersAsync();

                return Ok(new
                {
                    totalEggsToday,
                    totalActiveBirds = flockList.Sum(f => f.AliveBirds),
                    revenueThisMonth,
                    totalWorkers = activeWorkers.Count()
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