using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class Sale
    {
        public int Id { get; set; }
        
        public int ProductId { get; set; }
        
        [ForeignKey("ProductId")]
        public Product? Product { get; set; }
        
        public int QuantitySold { get; set; }
        
        public DateTime SaleDate { get; set; }
    }
}
