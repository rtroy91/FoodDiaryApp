using FoodDiary.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodDiary.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/users")]
public class UsersController(IUserService userService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var users = await userService.GetAllAsync(cancellationToken);
        return Ok(users);
    }
}
