using FarmTrack.Core.Entities;
using FarmTrack.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FarmTrack.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ExpenseController : ControllerBase
    {
        private readonly IExpenseRepository _expenseRepo;

        public ExpenseController(IExpenseRepository expenseRepo)
        {
            _expenseRepo = expenseRepo;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var expenses = await _expenseRepo.GetAllAsync();
            return Ok(expenses.OrderByDescending(e => e.Date));
        }

        [HttpGet("month")]
        public async Task<IActionResult> GetThisMonth(
            [FromQuery] int? month, [FromQuery] int? year)
        {
            var m = month ?? DateTime.UtcNow.Month;
            var y = year ?? DateTime.UtcNow.Year;
            var expenses = await _expenseRepo.GetByMonthAsync(m, y);
            return Ok(expenses);
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetMonthlySummary(
            [FromQuery] int? month, [FromQuery] int? year)
        {
            var m = month ?? DateTime.UtcNow.Month;
            var y = year ?? DateTime.UtcNow.Year;

            var expenses = await _expenseRepo.GetByMonthAsync(m, y);
            var expenseList = expenses.ToList();

            var byCategory = expenseList
                .GroupBy(e => e.Category)
                .Select(g => new
                {
                    category = g.Key,
                    total = g.Sum(e => e.Amount),
                    count = g.Count()
                })
                .OrderByDescending(x => x.total)
                .ToList();

            return Ok(new
            {
                month = m,
                year = y,
                totalExpenses = expenseList.Sum(e => e.Amount),
                byCategory,
                expenses = expenseList
            });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateExpenseRequest dto)
        {
            var userName = User.FindFirstValue(ClaimTypes.Name) ?? "Admin";

            var expense = new Expense
            {
                Title = dto.Title,
                Category = dto.Category,
                Amount = dto.Amount,
                Date = dto.Date,
                Description = dto.Description,
                RecordedBy = userName
            };

            await _expenseRepo.AddAsync(expense);
            await _expenseRepo.SaveChangesAsync();

            return Ok(new { message = "Expense recorded", expense.Id });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var expense = await _expenseRepo.GetByIdAsync(id);
            if (expense == null)
                return NotFound(new { message = "Expense not found" });

            _expenseRepo.Delete(expense);
            await _expenseRepo.SaveChangesAsync();

            return Ok(new { message = "Expense deleted" });
        }
    }

    public class CreateExpenseRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public string? Description { get; set; }
    }
}