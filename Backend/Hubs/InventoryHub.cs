using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace Backend.Hubs
{
    public class InventoryHub : Hub
    {
        // This acts as a broadcast tower.
        // We will push updates to connected clients from the controllers.
    }
}
