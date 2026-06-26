using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using Backend.Data;
using Backend.Models;
using Backend.Hubs;
using System.Collections.Generic;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SalesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<InventoryHub> _hubContext;

        public SalesController(ApplicationDbContext context, IHubContext<InventoryHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        // POST /api/sales to record a dispatch
        [HttpPost]
        public async Task<ActionResult<Sale>> RecordSale(Sale sale)
        {
            var product = await _context.Products.FindAsync(sale.ProductId);
            if (product == null) return BadRequest("Product does not exist.");

            if (product.CurrentStock < sale.QuantitySold)
                return BadRequest("Not enough stock to fulfill this order.");

            product.CurrentStock -= sale.QuantitySold;
            
            if (sale.SaleDate == default)
                sale.SaleDate = DateTime.UtcNow;

            _context.Sales.Add(sale);
            await _context.SaveChangesAsync();
            
            // Broadcast the organic inventory reduction to all dashboards 
            await _hubContext.Clients.All.SendAsync("InventoryUpdated");

            return Ok(sale);
        }

        // GET /api/sales to get a masterlist of all historical dispatches
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetAllSales()
        {
            return await _context.Sales
                .Include(s => s.Product)
                .OrderByDescending(s => s.SaleDate)
                .Select(s => new {
                    s.Id,
                    s.QuantitySold,
                    s.SaleDate,
                    ProductName = s.Product != null ? s.Product.Name : "Unknown"
                })
                .Take(100) // limit for UI sanity
                .ToListAsync();
        }

        // GET /api/sales/{productId} for specific histories
        [HttpGet("{productId}")]
        public async Task<ActionResult<IEnumerable<Sale>>> GetSalesForProduct(int productId)
        {
             return await _context.Sales
                .Where(s => s.ProductId == productId)
                .OrderByDescending(s => s.SaleDate)
                .ToListAsync();
        }
    }
}
