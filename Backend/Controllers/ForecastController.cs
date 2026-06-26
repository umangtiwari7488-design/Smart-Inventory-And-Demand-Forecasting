using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Backend.Services;
using Backend.Data;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Collections.Generic;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ForecastController : ControllerBase
    {
        private readonly ForecastingService _forecastingService;
        private readonly ApplicationDbContext _context;

        public ForecastController(ForecastingService forecastingService, ApplicationDbContext context)
        {
            _forecastingService = forecastingService;
            _context = context;
        }

        [HttpGet("{productId}")]
        public async Task<IActionResult> GetForecast(int productId)
        {
            double nextMonthDemand = await _forecastingService.CalculateNextMonthDemandAsync(productId);
            var product = await _context.Products.FindAsync(productId);

            if (product == null) return NotFound("Product not found");

            bool alert = nextMonthDemand > product.CurrentStock;

            return Ok(new 
            {
                ProductId = productId,
                ProductName = product.Name,
                CurrentStock = product.CurrentStock,
                ProjectedDemand = nextMonthDemand,
                IsRestockNeeded = alert || product.CurrentStock <= product.ReorderLevel
            });
        }
        
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardForecasts()
        {
            var products = await _context.Products.ToListAsync();
            var results = new List<object>();
            
            foreach (var p in products)
            {
                double demand = await _forecastingService.CalculateNextMonthDemandAsync(p.Id);
                results.Add(new {
                    ProductId = p.Id,
                    ProductName = p.Name,
                    CurrentStock = p.CurrentStock,
                    ReorderLevel = p.ReorderLevel,
                    ProjectedDemand = demand,
                    IsRestockNeeded = demand > p.CurrentStock || p.CurrentStock <= p.ReorderLevel
                });
            }
            
            return Ok(results);
        }
    }
}
