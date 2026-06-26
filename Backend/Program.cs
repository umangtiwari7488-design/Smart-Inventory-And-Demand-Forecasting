using Backend.Data;
using Backend.Services;
using Backend.Hubs;
using Microsoft.EntityFrameworkCore;
using System;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Database Context
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite("Data Source=inventory.db"));

// Register internal services
builder.Services.AddScoped<ForecastingService>();
builder.Services.AddSignalR(); // Add SignalR Support

// Add CORS to allow requests from React App during local development
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        b => b.SetIsOriginAllowed(origin => origin.StartsWith("http://localhost:"))
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials()); // Credentials required for SignalR Websockets
});

var app = builder.Build();

// DB Init
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    context.Database.EnsureCreated();
    
    // Seed basic data if empty
    if (!context.Products.Any())
    {
        var product1 = new Backend.Models.Product { Name = "Premium Wireless Earbuds", SKU = "PWE-001", Category = "Electronics", Price = 129.99m, CurrentStock = 15, ReorderLevel = 20 };
        var product2 = new Backend.Models.Product { Name = "Ergonomic Office Chair", SKU = "EOC-002", Category = "Furniture", Price = 250.00m, CurrentStock = 5, ReorderLevel = 10 };
        var product3 = new Backend.Models.Product { Name = "4K Ultra HD Monitor", SKU = "MON-003", Category = "Electronics", Price = 349.50m, CurrentStock = 45, ReorderLevel = 15 };
        
        context.Products.AddRange(product1, product2, product3);
        context.SaveChanges();

        // Seed some fake sales for the last 6 months
        var random = new Random();
        for (int i = 0; i < 30; i++)
        {
            context.Sales.Add(new Backend.Models.Sale { ProductId = product1.Id, QuantitySold = random.Next(1, 10), SaleDate = DateTime.UtcNow.AddDays(-random.Next(1, 180)) });
        }
        for (int i = 0; i < 20; i++)
        {
            context.Sales.Add(new Backend.Models.Sale { ProductId = product2.Id, QuantitySold = random.Next(1, 5), SaleDate = DateTime.UtcNow.AddDays(-random.Next(1, 180)) });
        }
        context.SaveChanges();
    }
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();
app.MapHub<InventoryHub>("/inventoryHub"); // Map the WebSocket Hub

app.Run();
