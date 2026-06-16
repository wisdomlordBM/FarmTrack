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
        public async Task<IActionResult> GetSummary()
        {
            var userId = UserHelper.GetUserId(User);

            var activeFlocks = await _flockRepo.GetActiveFlocks(userId);
            var flockList = activeFlocks.ToList();
            var totalEggsToday = await _eggRepo.GetTotalEggsForTodayAsync(userId);
            var eggRevenue = await _saleRepo.GetTotalRevenueThisMonthAsync(userId);
            var unpaidSales = await _saleRepo.GetUnpaidSalesAsync(userId);
            var activeWorkers = await _workerRepo.GetActiveWorkersAsync(userId);
            var totalExpenses = await _expenseRepo.GetTotalExpensesThisMonthAsync(userId);
            var birdSaleRevenue = await _birdSaleRepo.GetTotalRevenueThisMonthAsync(userId);
            var manureRevenue = await _manureRepo.GetTotalRevenueThisMonthAsync(userId);

            var operatingProfit = eggRevenue - totalExpenses;
            var totalCash = eggRevenue + birdSaleRevenue + manureRevenue - totalExpenses;

            var trend = new List<EggTrendDto>();
            for (int i = 6; i >= 0; i--)
            {
                var date = DateTime.UtcNow.AddDays(-i).Date;
                var records = await _eggRepo.GetByDateRangeAsync(date, date.AddDays(1), userId);
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
                birdSaleRevenueThisMonth = birdSaleRevenue,
                manureSaleRevenueThisMonth = manureRevenue,
                totalExpensesThisMonth = totalExpenses,
                operatingProfitThisMonth = operatingProfit,
                totalCashThisMonth = totalCash,
                unpaidSalesCount = unpaidSales.Count(),
                totalWorkers = activeWorkers.Count(),
                eggTrend = trend
            });
        }
        [HttpHead("public-stats")]
        [AllowAnonymous]
        public IActionResult HeadPublicStats()
        {
            return Ok();
        }

        [HttpGet("public-stats")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublicStats()
        {
            try
            {
                var today = DateTime.UtcNow.Date;
                var totalEggsToday = await _eggRepo
                    .FindAsync(e => e.CollectionDate.Date == today);
                var allFlocks = await _flockRepo
                    .FindAsync(f => f.Status == "Active");
                var allWorkers = await _workerRepo.GetAllAsync();
                var now = DateTime.UtcNow;
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