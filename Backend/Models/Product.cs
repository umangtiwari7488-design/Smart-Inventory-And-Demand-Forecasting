using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Product
    {
        public int Id { get; set; }
        
        [Required]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        public string SKU { get; set; } = string.Empty;
        
        public string Category { get; set; } = "Uncategorized"; // NEW METADATA
        
        public decimal Price { get; set; }
        
        public int CurrentStock { get; set; }
        
        public int ReorderLevel { get; set; }
    }
}
