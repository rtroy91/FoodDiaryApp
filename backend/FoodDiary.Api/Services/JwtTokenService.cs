using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FoodDiary.Api.Interfaces;
using FoodDiary.Api.Models;
using Microsoft.IdentityModel.Tokens;

namespace FoodDiary.Api.Services;

public sealed class JwtTokenService(IConfiguration config) : IJwtTokenService
{
    public string Generate(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"],
            audience: config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(30),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
