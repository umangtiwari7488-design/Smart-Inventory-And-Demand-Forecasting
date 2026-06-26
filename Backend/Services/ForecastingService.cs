using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Backend.Data;

namespace Backend.Services
{
    public class ForecastingService
    {
        private readonly ApplicationDbContext _context;

        public ForecastingService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<double> CalculateNextMonthDemandAsync(int productId, double alpha = 0.3)
        {
            var sales = await _context.Sales
                .Where(s => s.ProductId == productId)
                .OrderBy(s => s.SaleDate)
                .ToListAsync();

            if (sales.Count == 0) return 0;

            var monthlySales = sales.GroupBy(s => new { s.SaleDate.Year, s.SaleDate.Month })
                                    .Select(g => new { g.Key.Year, g.Key.Month, Total = g.Sum(s => s.QuantitySold) })
                                    .OrderBy(g => g.Year).ThenBy(g => g.Month)
                                    .ToList();

            if (monthlySales.Count == 0) return 0;
            if (monthlySales.Count == 1) return monthlySales.First().Total;

            double previousForecast = monthlySales.First().Total; 

            foreach (var actual in monthlySales.Skip(1))
            {
                previousForecast = alpha * actual.Total + (1 - alpha) * previousForecast;
            }

            double nextForecast = alpha * monthlySales.Last().Total + (1 - alpha) * previousForecast;
            return Math.Round(nextForecast, 2);
        }
    }
}
