using FarmTrack.API.Helpers;
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
        public ExpenseController(IExpenseRepository expenseRepo) => _expenseRepo = expenseRepo;

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var userId = UserHelper.GetUserId(User);
            var expenses = await _expenseRepo.FindAsync(e => e.UserId == userId);
            return Ok(expenses.OrderByDescending(e => e.CreatedAt));
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetMonthlySummary(
            [FromQuery] int? month, [FromQuery] int? year)
        {
            var userId = UserHelper.GetUserId(User);
            var m = month ?? DateTime.UtcNow.Month;
            var y = year ?? DateTime.UtcNow.Year;
            var expenses = await _expenseRepo.GetByMonthAsync(m, y, userId);
            var list = expenses.ToList();
            return Ok(new
            {
                month = m,
                year = y,
                totalExpenses = list.Sum(e => e.Amount),
                byCategory = list.GroupBy(e => e.Category)
                    .Select(g => new { category = g.Key, total = g.Sum(e => e.Amount), count = g.Count() })
                    .OrderByDescending(x => x.total),
                expenses = list
            });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateExpenseRequest dto)
        {
            var userId = UserHelper.GetUserId(User);
            var userName = User.FindFirstValue(ClaimTypes.Name) ?? "Admin";
            var expense = new Expense
            {
                Title = dto.Title,
                Category = dto.Category,
                Amount = dto.Amount,
                Date = dto.Date,
                Description = dto.Description,
                RecordedBy = userName,
                UserId = userId
            };
            await _expenseRepo.AddAsync(expense);
            await _expenseRepo.SaveChangesAsync();
            return Ok(new { message = "Expense recorded", expense.Id });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = UserHelper.GetUserId(User);
            var expense = await _expenseRepo.GetByIdAsync(id);
            if (expense == null || expense.UserId != userId)
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