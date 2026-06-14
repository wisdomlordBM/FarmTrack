using FarmTrack.Core.Entities;
using FarmTrack.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace FarmTrack.API.Controllers
{
    [ApiController]
    [Route("api/verify")]
    [AllowAnonymous]
    public class VerifyController : ControllerBase
    {
        private readonly ISaleRepository _saleRepo;
        private readonly IBirdSaleRepository _birdSaleRepo;
        private readonly IManureSaleRepository _manureRepo;
        private readonly IFarmProfileRepository _profileRepo;
        private readonly UserManager<ApplicationUser> _userManager;

        public VerifyController(
            ISaleRepository saleRepo, IBirdSaleRepository birdSaleRepo,
            IManureSaleRepository manureRepo, IFarmProfileRepository profileRepo,
            UserManager<ApplicationUser> userManager)
        {
            _saleRepo = saleRepo; _birdSaleRepo = birdSaleRepo;
            _manureRepo = manureRepo; _profileRepo = profileRepo;
            _userManager = userManager;
        }

        private async Task<object> GetFarmInfoAsync(string userId)
        {
            var profile = await _profileRepo.GetByUserIdAsync(userId);
            if (profile != null)
                return new { farmName = profile.FarmName, phone = profile.Phone, address = profile.Address };

            var user = await _userManager.FindByIdAsync(userId);
            return new { farmName = $"{user?.FullName}'s Poultry Farm", phone = "", address = "" };
        }

        [HttpGet("sale/{id}")]
        public async Task<IActionResult> VerifySale(int id)
        {
            var sale = await _saleRepo.GetByIdAsync(id);
            if (sale == null) return Ok(new { valid = false, message = "Receipt not found" });

            var farm = await GetFarmInfoAsync(sale.UserId);
            return Ok(new
            {
                valid = true,
                type = "Egg Sale",
                farm,
                receiptNo = sale.Id,
                customerName = sale.CustomerName,
                date = sale.SaleDate,
                cratesSold = sale.CratesSold,
                pricePerCrate = sale.PricePerCrate,
                totalAmount = sale.CratesSold * sale.PricePerCrate,
                amountPaid = sale.AmountPaid,
                paymentStatus = sale.PaymentStatus
            });
        }

        [HttpGet("birdsale/{id}")]
        public async Task<IActionResult> VerifyBirdSale(int id)
        {
            var sale = await _birdSaleRepo.GetByIdAsync(id);
            if (sale == null) return Ok(new { valid = false, message = "Receipt not found" });

            var farm = await GetFarmInfoAsync(sale.UserId);
            return Ok(new
            {
                valid = true,
                type = "Bird Sale",
                farm,
                receiptNo = sale.Id,
                customerName = sale.CustomerName,
                date = sale.SaleDate,
                numberOfBirds = sale.NumberOfBirds,
                pricePerBird = sale.PricePerBird,
                totalAmount = sale.NumberOfBirds * sale.PricePerBird,
                amountPaid = sale.AmountPaid,
                paymentStatus = sale.PaymentStatus
            });
        }

        [HttpGet("manuresale/{id}")]
        public async Task<IActionResult> VerifyManureSale(int id)
        {
            var sale = await _manureRepo.GetByIdAsync(id);
            if (sale == null) return Ok(new { valid = false, message = "Receipt not found" });

            var farm = await GetFarmInfoAsync(sale.UserId);
            return Ok(new
            {
                valid = true,
                type = "Manure Sale",
                farm,
                receiptNo = sale.Id,
                customerName = sale.CustomerName,
                date = sale.SaleDate,
                numberOfBags = sale.NumberOfBags,
                pricePerBag = sale.PricePerBag,
                totalAmount = sale.NumberOfBags * sale.PricePerBag,
                amountPaid = sale.AmountPaid,
                paymentStatus = sale.PaymentStatus
            });
        }
    }
}
