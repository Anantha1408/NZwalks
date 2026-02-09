using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using NZWalks.API.Models.DTO;
using NZWalks.API.Repositories;
using System.Linq;

namespace NZWalks.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<IdentityUser> userManager;
        private readonly ITokenRepository tokenRepository;
        private readonly ILogger<AuthController> logger;

        public AuthController(UserManager<IdentityUser> userManager, ITokenRepository tokenRepository, ILogger<AuthController> logger)
        {
            this.userManager = userManager;
            this.tokenRepository = tokenRepository;
            this.logger = logger;
        }

        // POST: /api/Auth/Register
        [HttpPost]
        [Route("Register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto registerRequestDto)
        {
            logger.LogInformation("Registration attempt for username={Username}", registerRequestDto.Username);

            var identityUser = new IdentityUser
            {
                UserName = registerRequestDto.Username,
                Email = registerRequestDto.Username
            };

            var identityResult = await userManager.CreateAsync(identityUser, registerRequestDto.Password);

            if (identityResult.Succeeded)
            {
                // Add roles to this User
                if (registerRequestDto.Roles != null && registerRequestDto.Roles.Any())
                {
                    identityResult = await userManager.AddToRolesAsync(identityUser, registerRequestDto.Roles);

                    if (identityResult.Succeeded)
                    {
                        logger.LogInformation("User registered successfully: username={Username}, roles={Roles}", 
                            registerRequestDto.Username, string.Join(",", registerRequestDto.Roles));
                        return Ok("User was registered! Please login.");
                    }
                    else
                    {
                        // Return specific role assignment errors
                        var errors = string.Join(", ", identityResult.Errors.Select(e => e.Description));
                        logger.LogWarning("Role assignment failed for username={Username}: {Errors}", 
                            registerRequestDto.Username, errors);
                        return BadRequest(errors);
                    }
                }
                else
                {
                    // User registered successfully without roles
                    logger.LogInformation("User registered successfully without roles: username={Username}", 
                        registerRequestDto.Username);
                    return Ok("User was registered! Please login.");
                }
            }

            // Return specific registration errors (password requirements, duplicate user, etc.)
            var registrationErrors = string.Join(", ", identityResult.Errors.Select(e => e.Description));
            logger.LogWarning("Registration failed for username={Username}: {Errors}", 
                registerRequestDto.Username, registrationErrors);
            return BadRequest(registrationErrors);
        }

        // POST: /api/Auth/Login
        [HttpPost]
        [Route("Login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto loginRequestDto)
        {
            logger.LogInformation("Login attempt for username={Username}", loginRequestDto.Username);

            var user = await userManager.FindByEmailAsync(loginRequestDto.Username);

            if (user != null)
            {
                var checkPasswordResult = await userManager.CheckPasswordAsync(user, loginRequestDto.Password);

                if (checkPasswordResult)
                {
                    // Get Roles for this user
                    var roles = await userManager.GetRolesAsync(user);

                    if (roles != null)
                    {
                        // Create Token
                        var jwtToken = tokenRepository.CreateJWTToken(user, roles.ToList());

                        var response = new LoginResponseDto
                        {
                            JwtToken = jwtToken
                        };

                        logger.LogInformation("Login successful for username={Username}, roles={Roles}", 
                            loginRequestDto.Username, string.Join(",", roles));

                        return Ok(response);
                    }
                }
            }

            logger.LogWarning("Login failed for username={Username}", loginRequestDto.Username);
            return BadRequest("Username or password incorrect");
        }
    }
}
