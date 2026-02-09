# 🎯 NZWalks Project - Interview Questions & Answers

Complete interview preparation guide based on the NZWalks API project implementation.

---

## 📋 Table of Contents

- [ASP.NET Core Web API](#aspnet-core-web-api)
- [Entity Framework Core](#entity-framework-core)
- [Authentication & Authorization](#authentication--authorization)
- [Design Patterns & Architecture](#design-patterns--architecture)
- [RESTful API Design](#restful-api-design)
- [Database & SQL](#database--sql)
- [CORS & Middleware](#cors--middleware)
- [Frontend Integration](#frontend-integration)
- [Deployment & Performance](#deployment--performance)
- [Scenario-Based Questions](#scenario-based-questions)
- [Code Walkthrough Questions](#code-walkthrough-questions)

---

## ASP.NET Core Web API

### Q1: Explain the overall architecture of your NZWalks project.

**Answer:**
The NZWalks project follows a layered architecture with clear separation of concerns:

1. **Presentation Layer (Controllers)**: Handles HTTP requests and responses
   - `RegionsController`, `WalksController`, `AuthController`, `ImagesController`
   - Input validation and DTO mapping

2. **Business Layer (Repositories)**: Contains business logic and data access
   - Repository pattern implementation
   - Interface-based design for testability

3. **Data Layer (DbContext)**: Entity Framework Core for database operations
   - `NZWalksDbContext` for application data
   - `NZWalksAuthDbContext` for authentication

4. **Cross-Cutting Concerns**:
   - Custom middleware for global exception handling
   - Custom action filters for model validation
   - AutoMapper for DTO mapping

**Key Technologies:**
- ASP.NET Core 8.0
- Entity Framework Core 8.0
- JWT Authentication
- SQL Server

---

### Q2: What is the purpose of using DTOs in your project?

**Answer:**
DTOs (Data Transfer Objects) serve several important purposes in the NZWalks project:

**1. Security & Data Hiding:**
```csharp
// Domain Model (Internal)
public class Region 
{
    public Guid Id { get; set; }
    public string Code { get; set; }
    public string Name { get; set; }
    public string? RegionImageUrl { get; set; }
}

// DTO (External)
public class RegionDto 
{
    public Guid Id { get; set; }
    public string Code { get; set; }
    public string Name { get; set; }
    public string? RegionImageUrl { get; set; }
}
```

**Benefits:**
- **Decoupling**: Separates internal domain models from external contracts
- **Security**: Prevents over-posting attacks by controlling what data clients can send
- **Versioning**: Allows API changes without modifying domain models
- **Optimization**: Can combine/flatten data for specific use cases
- **Validation**: Specific validation rules for input/output scenarios

**Example in Project:**
- `AddRegionRequestDto` - For creating regions (no Id)
- `UpdateRegionRequestDto` - For updating regions
- `RegionDto` - For returning region data

---

### Q3: Explain the Dependency Injection (DI) used in your project.

**Answer:**
The project extensively uses ASP.NET Core's built-in DI container configured in `Program.cs`:

```csharp
// Repository Registration
builder.Services.AddScoped<IRegionRepository, SQLRegionRepository>();
builder.Services.AddScoped<IWalkRepository, SQLWalkRepository>();
builder.Services.AddScoped<IImageRepository, LocalImageRepository>();

// DbContext Registration
builder.Services.AddDbContext<NZWalksDbContext>(options =>
    options.UseSqlServer(connectionString));

// AutoMapper Registration
builder.Services.AddAutoMapper(typeof(AutoMapperProfiles));

// Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => { /* JWT config */ });
```

**Lifetime Scopes Used:**

1. **Scoped** (Repositories, DbContext):
   - Created once per HTTP request
   - Disposed at end of request
   - Ideal for request-specific data access

2. **Singleton** (AutoMapper, Logging):
   - Single instance for application lifetime
   - Thread-safe and stateless

3. **Transient** (Not used extensively):
   - New instance every time requested

**Benefits:**
- ✅ Loose coupling
- ✅ Testability (easy to mock dependencies)
- ✅ Maintainability
- ✅ Automatic disposal of resources

---

### Q4: How did you implement model validation in your project?

**Answer:**
The project uses multiple validation approaches:

**1. Data Annotations:**
```csharp
public class AddRegionRequestDto
{
    [Required]
    [MinLength(3, ErrorMessage = "Code must be at least 3 characters")]
    [MaxLength(3, ErrorMessage = "Code must be at most 3 characters")]
    public string Code { get; set; }

    [Required]
    [MaxLength(100, ErrorMessage = "Name must be at most 100 characters")]
    public string Name { get; set; }
}
```

**2. Custom Action Filter:**
```csharp
public class ValidateModelAttribute : ActionFilterAttribute
{
    public override void OnActionExecuting(ActionExecutingContext context)
    {
        if (!context.ModelState.IsValid)
        {
            context.Result = new BadRequestResult();
        }
    }
}
```

**3. Controller Usage:**
```csharp
[HttpPost]
[ValidateModel]
public async Task<IActionResult> Create([FromBody] AddRegionRequestDto request)
{
    // Model is already validated by the filter
}
```

**Benefits:**
- Centralized validation logic
- Automatic 400 Bad Request for invalid data
- Reduced code duplication
- Clear validation rules

---

## Entity Framework Core

### Q5: Explain the Code-First approach used in your project.

**Answer:**
The project uses EF Core's Code-First approach where domain classes define the database schema:

**1. Domain Model Definition:**
```csharp
public class Walk
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public decimal LengthInKm { get; set; }
    public string? WalkImageUrl { get; set; }
    
    // Navigation Properties
    public Guid DifficultyId { get; set; }
    public Difficulty Difficulty { get; set; }
    
    public Guid RegionId { get; set; }
    public Region Region { get; set; }
}
```

**2. DbContext Configuration:**
```csharp
public class NZWalksDbContext : DbContext
{
    public DbSet<Walk> Walks { get; set; }
    public DbSet<Region> Regions { get; set; }
    public DbSet<Difficulty> Difficulties { get; set; }
}
```

**3. Migration Process:**
```bash
# Create migration
dotnet ef migrations add InitialCreate

# Update database
dotnet ef database update
```

**Advantages:**
- ✅ Version control for database schema
- ✅ Automatic schema generation
- ✅ Easy rollback with migrations
- ✅ Type-safe queries with LINQ
- ✅ Automatic relationship mapping

---

### Q6: How do you handle relationships in Entity Framework?

**Answer:**
The project uses navigation properties and foreign keys to define relationships:

**One-to-Many Relationship:**
```csharp
// Region can have many Walks
public class Region
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    
    // Navigation property (not included in API response)
    public ICollection<Walk> Walks { get; set; }
}

// Each Walk belongs to one Region
public class Walk
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    
    // Foreign Key
    public Guid RegionId { get; set; }
    
    // Navigation Property
    public Region Region { get; set; }
}
```

**Eager Loading in Repository:**
```csharp
public async Task<Walk?> GetByIdAsync(Guid id)
{
    return await dbContext.Walks
        .Include(x => x.Region)        // Eager load Region
        .Include(x => x.Difficulty)    // Eager load Difficulty
        .FirstOrDefaultAsync(x => x.Id == id);
}
```

**Benefits:**
- Reduces N+1 query problems
- Single database query for related data
- Automatic JOIN generation

---

### Q7: Explain how you implemented pagination in your project.

**Answer:**
Pagination is implemented in the repository layer using LINQ's `Skip` and `Take`:

**Repository Implementation:**
```csharp
public async Task<List<Region>> GetAllAsync(
    string? sortBy = null, 
    bool isAscending = true,
    int pageNumber = 1, 
    int pageSize = 10)
{
    var regions = dbContext.Regions.AsQueryable();
    
    // Sorting
    if (!string.IsNullOrWhiteSpace(sortBy))
    {
        regions = sortBy.ToLower() == "code" 
            ? (isAscending ? regions.OrderBy(x => x.Code) : regions.OrderByDescending(x => x.Code))
            : (isAscending ? regions.OrderBy(x => x.Name) : regions.OrderByDescending(x => x.Name));
    }
    
    // Pagination
    var skipResults = (pageNumber - 1) * pageSize;
    return await regions.Skip(skipResults).Take(pageSize).ToListAsync();
}
```

**Controller Usage:**
```csharp
[HttpGet]
public async Task<IActionResult> GetAll(
    [FromQuery] string? sortBy,
    [FromQuery] bool? isAscending,
    [FromQuery] int pageNumber = 1,
    [FromQuery] int pageSize = 10)
{
    // Validate page size
    if (pageSize > 100)
        pageSize = 100;
        
    var regions = await regionRepository.GetAllAsync(
        sortBy, 
        isAscending ?? true, 
        pageNumber, 
        pageSize
    );
    
    return Ok(mapper.Map<List<RegionDto>>(regions));
}
```

**Benefits:**
- Reduces data transfer
- Improves performance
- Better user experience
- Scalable for large datasets

---

## Authentication & Authorization

### Q8: Explain how JWT authentication works in your project.

**Answer:**
The project implements JWT-based authentication with the following flow:

**1. Registration:**
```csharp
[HttpPost("Register")]
public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
{
    var identityUser = new IdentityUser
    {
        UserName = request.Username,
        Email = request.Username
    };
    
    var result = await userManager.CreateAsync(identityUser, request.Password);
    
    if (result.Succeeded)
    {
        await userManager.AddToRolesAsync(identityUser, request.Roles);
        return Ok();
    }
    
    return BadRequest();
}
```

**2. Login & Token Generation:**
```csharp
[HttpPost("Login")]
public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
{
    var user = await userManager.FindByEmailAsync(request.Username);
    
    if (user != null)
    {
        var checkPassword = await userManager.CheckPasswordAsync(user, request.Password);
        
        if (checkPassword)
        {
            var roles = await userManager.GetRolesAsync(user);
            
            // Create JWT
            var jwtToken = CreateJWTToken(user, roles.ToList());
            
            return Ok(new LoginResponseDto { JwtToken = jwtToken });
        }
    }
    
    return BadRequest("Invalid credentials");
}
```

**3. JWT Token Creation:**
```csharp
private string CreateJWTToken(IdentityUser user, List<string> roles)
{
    var claims = new List<Claim>
    {
        new Claim(ClaimTypes.Email, user.Email),
        new Claim(JwtRegisteredClaimNames.Sub, user.Email),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
    };
    
    // Add role claims
    foreach (var role in roles)
    {
        claims.Add(new Claim(ClaimTypes.Role, role));
    }
    
    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]));
    var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
    
    var token = new JwtSecurityToken(
        issuer: configuration["Jwt:Issuer"],
        audience: configuration["Jwt:Audience"],
        claims: claims,
        expires: DateTime.Now.AddMinutes(120),
        signingCredentials: credentials
    );
    
    return new JwtSecurityTokenHandler().WriteToken(token);
}
```

**4. Using JWT in Requests:**
```http
GET /api/Regions
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**JWT Structure:**
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "email": "user@example.com",
    "sub": "user@example.com",
    "jti": "unique-id",
    "role": ["Reader", "Writer"],
    "exp": 1234567890
  },
  "signature": "..."
}
```

**Benefits:**
- ✅ Stateless authentication
- ✅ No server-side session storage
- ✅ Scalable for microservices
- ✅ Cross-platform support
- ✅ Secure with HMAC-SHA256

---

### Q9: How does role-based authorization work in your API?

**Answer:**

**Role Definition:**
In the project, two roles are used:
- **Reader**: Can perform GET operations
- **Writer**: Can perform all CRUD operations

**Implementation:**

**1. Role Seeding in DbContext:**
```csharp
protected override void OnModelCreating(ModelBuilder builder)
{
    base.OnModelCreating(builder);
    
    var readerRoleId = "reader-role-id";
    var writerRoleId = "writer-role-id";
    
    var roles = new List<IdentityRole>
    {
        new IdentityRole { Id = readerRoleId, Name = "Reader", NormalizedName = "READER" },
        new IdentityRole { Id = writerRoleId, Name = "Writer", NormalizedName = "WRITER" }
    };
    
    builder.Entity<IdentityRole>().HasData(roles);
}
```

**2. Controller Authorization:**
```csharp
[Route("api/[controller]")]
[ApiController]
[Authorize]  // All endpoints require authentication
public class RegionsController : ControllerBase
{
    // GET endpoints - accessible by Reader and Writer
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        // Any authenticated user can access
    }
    
    // POST/PUT/DELETE - only Writer role
    [HttpPost]
    [Authorize(Roles = "Writer")]
    public async Task<IActionResult> Create([FromBody] AddRegionRequestDto request)
    {
        // Only Writer role can access
    }
    
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Writer")]
    public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateRegionRequestDto request)
    {
        // Only Writer role can access
    }
    
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Writer")]
    public async Task<IActionResult> Delete([FromRoute] Guid id)
    {
        // Only Writer role can access
    }
}
```

**3. Authorization Flow:**
```
Request → JWT Token → Extract Claims → Check Roles → Allow/Deny
```

**Advantages:**
- Fine-grained access control
- Centralized authorization logic
- Easy to extend with more roles
- Automatic 403 Forbidden for unauthorized access

---

## Design Patterns & Architecture

### Q10: Explain the Repository Pattern used in your project.

**Answer:**
The Repository Pattern abstracts data access logic and provides a collection-like interface for domain objects.

**Implementation:**

**1. Interface Definition:**
```csharp
public interface IRegionRepository
{
    Task<List<Region>> GetAllAsync(string? sortBy, bool isAscending, int page, int pageSize);
    Task<Region?> GetByIdAsync(Guid id);
    Task<Region> CreateAsync(Region region);
    Task<Region?> UpdateAsync(Guid id, Region region);
    Task<Region?> DeleteAsync(Guid id);
}
```

**2. Concrete Implementation:**
```csharp
public class SQLRegionRepository : IRegionRepository
{
    private readonly NZWalksDbContext dbContext;
    
    public SQLRegionRepository(NZWalksDbContext dbContext)
    {
        this.dbContext = dbContext;
    }
    
    public async Task<Region> CreateAsync(Region region)
    {
        await dbContext.Regions.AddAsync(region);
        await dbContext.SaveChangesAsync();
        return region;
    }
    
    public async Task<List<Region>> GetAllAsync(
        string? sortBy, 
        bool isAscending, 
        int page, 
        int pageSize)
    {
        var regions = dbContext.Regions.AsQueryable();
        
        // Apply sorting and pagination
        // ...
        
        return await regions.ToListAsync();
    }
    
    // Other methods...
}
```

**3. Dependency Injection:**
```csharp
builder.Services.AddScoped<IRegionRepository, SQLRegionRepository>();
```

**4. Controller Usage:**
```csharp
public class RegionsController : ControllerBase
{
    private readonly IRegionRepository regionRepository;
    
    public RegionsController(IRegionRepository regionRepository)
    {
        this.regionRepository = regionRepository;
    }
    
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var regions = await regionRepository.GetAllAsync(...);
        return Ok(regions);
    }
}
```

**Benefits:**
- ✅ **Separation of Concerns**: Data access separated from business logic
- ✅ **Testability**: Easy to mock for unit testing
- ✅ **Maintainability**: Changes to data access don't affect controllers
- ✅ **Flexibility**: Can switch from SQL to another data source easily
- ✅ **Reusability**: Repository methods can be used across multiple controllers

---

### Q11: How did you implement AutoMapper in your project?

**Answer:**
AutoMapper is used to map between Domain Models and DTOs automatically.

**1. AutoMapper Profile:**
```csharp
public class AutoMapperProfiles : Profile
{
    public AutoMapperProfiles()
    {
        // Region mappings
        CreateMap<Region, RegionDto>().ReverseMap();
        CreateMap<AddRegionRequestDto, Region>().ReverseMap();
        CreateMap<UpdateRegionRequestDto, Region>().ReverseMap();
        
        // Walk mappings
        CreateMap<Walk, WalkDto>().ReverseMap();
        CreateMap<AddWalkRequestDto, Walk>().ReverseMap();
        CreateMap<UpdateWalkRequestDto, Walk>().ReverseMap();
        
        // Difficulty mappings
        CreateMap<Difficulty, DifficultyDto>().ReverseMap();
    }
}
```

**2. Registration in Program.cs:**
```csharp
builder.Services.AddAutoMapper(typeof(AutoMapperProfiles));
```

**3. Usage in Controller:**
```csharp
public class RegionsController : ControllerBase
{
    private readonly IMapper mapper;
    private readonly IRegionRepository repository;
    
    public RegionsController(IMapper mapper, IRegionRepository repository)
    {
        this.mapper = mapper;
        this.repository = repository;
    }
    
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] AddRegionRequestDto request)
    {
        // Map DTO to Domain Model
        var regionDomain = mapper.Map<Region>(request);
        
        // Save to database
        regionDomain = await repository.CreateAsync(regionDomain);
        
        // Map back to DTO
        var regionDto = mapper.Map<RegionDto>(regionDomain);
        
        return CreatedAtAction(nameof(GetById), new { id = regionDto.Id }, regionDto);
    }
}
```

**Benefits:**
- Reduces boilerplate mapping code
- Centralized mapping configuration
- Type-safe transformations
- Easy to maintain and modify

---

## RESTful API Design

### Q12: How does your API follow RESTful principles?

**Answer:**

**1. Resource-Based URLs:**
```
✅ Good (RESTful):
GET    /api/Regions          - Get all regions
GET    /api/Regions/{id}     - Get specific region
POST   /api/Regions          - Create region
PUT    /api/Regions/{id}     - Update region
DELETE /api/Regions/{id}     - Delete region

❌ Bad (Not RESTful):
GET    /api/GetRegions
POST   /api/CreateRegion
POST   /api/UpdateRegion
POST   /api/DeleteRegion
```

**2. HTTP Verbs:**
- `GET` - Retrieve resources (safe, idempotent)
- `POST` - Create new resources
- `PUT` - Update existing resources (idempotent)
- `DELETE` - Remove resources (idempotent)

**3. HTTP Status Codes:**
```csharp
// 200 OK - Successful GET/PUT
return Ok(regionDto);

// 201 Created - Successful POST
return CreatedAtAction(nameof(GetById), new { id }, regionDto);

// 204 No Content - Successful DELETE
return NoContent();

// 400 Bad Request - Validation error
return BadRequest(ModelState);

// 401 Unauthorized - Missing/invalid token
return Unauthorized();

// 403 Forbidden - Insufficient permissions
return Forbid();

// 404 Not Found - Resource doesn't exist
return NotFound();

// 500 Internal Server Error - Server error
return StatusCode(500, "An error occurred");
```

**4. Stateless Communication:**
- Each request contains all necessary information
- JWT token for authentication (no server session)
- No client context stored on server

**5. HATEOAS (Hypermedia):**
```csharp
return CreatedAtAction(
    nameof(GetById),           // Link to get the created resource
    new { id = region.Id },    // Route parameters
    regionDto                  // Response body
);
```

**6. Representation (JSON):**
```json
{
  "id": "14ceba71-4b51-4777-9b17-46602cf66153",
  "code": "AKL",
  "name": "Auckland",
  "regionImageUrl": "https://example.com/auckland.jpg"
}
```

---

### Q13: How do you handle errors in your API?

**Answer:**
The project uses a global exception handling middleware:

**Custom Middleware:**
```csharp
public class ExceptionHandlerMiddleware
{
    private readonly ILogger<ExceptionHandlerMiddleware> logger;
    private readonly RequestDelegate next;

    public ExceptionHandlerMiddleware(
        ILogger<ExceptionHandlerMiddleware> logger,
        RequestDelegate next)
    {
        this.logger = logger;
        this.next = next;
    }

    public async Task InvokeAsync(HttpContext httpContext)
    {
        try
        {
            await next(httpContext);
        }
        catch (Exception ex)
        {
            var errorId = Guid.NewGuid();
            
            // Log the exception
            logger.LogError(ex, $"Error ID: {errorId} - {ex.Message}");
            
            // Return user-friendly error
            httpContext.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            httpContext.Response.ContentType = "application/json";

            var error = new
            {
                Id = errorId,
                ErrorMessage = "An unexpected error occurred. Please try again later.",
                Details = ex.Message  // Remove in production
            };

            await httpContext.Response.WriteAsJsonAsync(error);
        }
    }
}
```

**Registration:**
```csharp
app.UseMiddleware<ExceptionHandlerMiddleware>();
```

**Benefits:**
- Centralized error handling
- Consistent error responses
- Error logging with unique IDs
- Prevents sensitive error details from leaking
- Cleaner controller code

---

## CORS & Middleware

### Q14: Why did you implement CORS, and how?

**Answer:**
CORS (Cross-Origin Resource Sharing) is required because the web application and API run on different origins.

**Problem:**
```
Web App: http://localhost:3000
API:     http://localhost:5268

Browser blocks the request due to Same-Origin Policy
```

**Solution:**
```csharp
// Program.cs

// Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowWebApp", policyBuilder =>
    {
        policyBuilder
            .AllowAnyOrigin()      // Or specify: WithOrigins("http://localhost:3000")
            .AllowAnyMethod()      // GET, POST, PUT, DELETE
            .AllowAnyHeader();     // Authorization, Content-Type, etc.
    });
});

// Apply CORS middleware (must be before Authorization)
app.UseCors("AllowWebApp");
app.UseAuthentication();
app.UseAuthorization();
```

**Production Configuration:**
```csharp
// More restrictive for production
policyBuilder
    .WithOrigins("https://myapp.com", "https://www.myapp.com")
    .WithMethods("GET", "POST", "PUT", "DELETE")
    .WithHeaders("Authorization", "Content-Type")
    .AllowCredentials();  // If using cookies
```

**Benefits:**
- Enables frontend-backend communication
- Security: Controls which origins can access API
- Flexibility: Different policies for different environments

---

## Database & SQL

### Q15: How would you optimize database queries in this project?

**Answer:**

**1. Use Indexes:**
```sql
-- Add index on frequently queried columns
CREATE INDEX IX_Regions_Code ON Regions(Code);
CREATE INDEX IX_Walks_RegionId ON Walks(RegionId);
CREATE INDEX IX_Walks_DifficultyId ON Walks(DifficultyId);
```

**2. Use AsNoTracking for Read-Only Queries:**
```csharp
public async Task<List<Region>> GetAllAsync()
{
    return await dbContext.Regions
        .AsNoTracking()  // Improves performance for read-only queries
        .ToListAsync();
}
```

**3. Eager Loading to Prevent N+1:**
```csharp
// ❌ Bad - N+1 problem
var walks = await dbContext.Walks.ToListAsync();
// Each walk.Region access triggers a separate query

// ✅ Good - Single query with JOIN
var walks = await dbContext.Walks
    .Include(w => w.Region)
    .Include(w => w.Difficulty)
    .ToListAsync();
```

**4. Pagination:**
```csharp
// Limit data transfer
.Skip((pageNumber - 1) * pageSize)
.Take(pageSize)
```

**5. Projection (Select specific columns):**
```csharp
// Instead of loading entire entity
var names = await dbContext.Regions
    .Select(r => new { r.Id, r.Name })
    .ToListAsync();
```

**6. Compiled Queries (for repeated queries):**
```csharp
private static readonly Func<NZWalksDbContext, Guid, Task<Region>> GetRegionById =
    EF.CompileAsyncQuery((NZWalksDbContext db, Guid id) =>
        db.Regions.FirstOrDefault(r => r.Id == id));
```

---

## Scenario-Based Questions

### Q16: A user reports that the API is returning 401 Unauthorized even with a valid token. How would you debug this?

**Answer:**

**Step-by-step debugging:**

1. **Verify Token Format:**
```csharp
// Check Authorization header format
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

2. **Check Token Expiration:**
```csharp
// Decode JWT and check 'exp' claim
var handler = new JwtSecurityTokenHandler();
var token = handler.ReadJwtToken(tokenString);
var exp = token.ValidTo;

if (exp < DateTime.UtcNow)
{
    // Token expired
}
```

3. **Verify JWT Configuration:**
```csharp
// Ensure key, issuer, audience match token
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = configuration["Jwt:Issuer"],
            ValidAudience = configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(configuration["Jwt:Key"]))
        };
    });
```

4. **Check Middleware Order:**
```csharp
// CORRECT order:
app.UseCors("AllowWebApp");
app.UseAuthentication();    // Must come before UseAuthorization
app.UseAuthorization();
app.MapControllers();

// WRONG - Authorization before Authentication won't work
```

5. **Enable Detailed Logging:**
```json
{
  "Logging": {
    "LogLevel": {
      "Microsoft.AspNetCore.Authentication": "Debug"
    }
  }
}
```

---

### Q17: The application is slow when loading walks with 1000+ records. How would you optimize it?

**Answer:**

**Multiple optimization strategies:**

**1. Implement Efficient Pagination:**
```csharp
// Current implementation (good)
public async Task<List<Walk>> GetAllAsync(int page, int pageSize)
{
    return await dbContext.Walks
        .Include(w => w.Region)
        .Include(w => w.Difficulty)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .AsNoTracking()
        .ToListAsync();
}
```

**2. Add Database Indexes:**
```sql
CREATE INDEX IX_Walks_Name ON Walks(Name);
CREATE INDEX IX_Walks_LengthInKm ON Walks(LengthInKm);
```

**3. Use Projection Instead of Full Entities:**
```csharp
// Return only required fields
public async Task<List<WalkSummaryDto>> GetAllAsync()
{
    return await dbContext.Walks
        .Select(w => new WalkSummaryDto
        {
            Id = w.Id,
            Name = w.Name,
            Length = w.LengthInKm,
            RegionName = w.Region.Name,
            DifficultyName = w.Difficulty.Name
        })
        .ToListAsync();
}
```

**4. Implement Caching:**
```csharp
// Add Memory Cache
builder.Services.AddMemoryCache();

// In Controller
private readonly IMemoryCache cache;

public async Task<IActionResult> GetAll()
{
    var cacheKey = $"walks_page_{pageNumber}";
    
    if (!cache.TryGetValue(cacheKey, out List<WalkDto> walks))
    {
        walks = await walkRepository.GetAllAsync();
        
        cache.Set(cacheKey, walks, TimeSpan.FromMinutes(5));
    }
    
    return Ok(walks);
}
```

**5. Use Response Compression:**
```csharp
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
});

app.UseResponseCompression();
```

**6. Async/Await Throughout:**
```csharp
// All database calls use async
await dbContext.Walks.ToListAsync();
```

---

### Q18: How would you implement versioning in this API?

**Answer:**

**URL Versioning (Recommended for REST):**

```csharp
// Install package
// Microsoft.AspNetCore.Mvc.Versioning

// Program.cs
builder.Services.AddApiVersioning(options =>
{
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.ReportApiVersions = true;
});

// Controller v1
[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
[ApiVersion("1.0")]
public class RegionsController : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        // Version 1 implementation
    }
}

// Controller v2
[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
[ApiVersion("2.0")]
public class RegionsV2Controller : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        // Version 2 with new features
    }
}
```

**Usage:**
```http
GET /api/v1/Regions
GET /api/v2/Regions
```

**Header Versioning (Alternative):**
```csharp
options.ApiVersionReader = new HeaderApiVersionReader("X-API-Version");
```

```http
GET /api/Regions
X-API-Version: 2.0
```

---

## Code Walkthrough Questions

### Q19: Walk me through the process of creating a new Walk in your API.

**Answer:**

**Complete Flow:**

**1. Client Request:**
```http
POST /api/Walks HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Tongariro Alpine Crossing",
  "description": "19.4km day hike",
  "lengthInKm": 19.4,
  "walkImageUrl": "https://example.com/tongariro.jpg",
  "difficultyId": "guid-here",
  "regionId": "guid-here"
}
```

**2. Middleware Pipeline:**
```
Request → CORS → Authentication → Authorization → Controller → Validation
```

**3. Controller (WalksController.cs):**
```csharp
[HttpPost]
[ValidateModel]
[Authorize(Roles = "Writer")]
public async Task<IActionResult> Create([FromBody] AddWalkRequestDto addWalkRequestDto)
{
    // 1. Map DTO to Domain Model
    var walkDomainModel = mapper.Map<Walk>(addWalkRequestDto);
    
    // 2. Save to database via repository
    await walkRepository.CreateAsync(walkDomainModel);
    
    // 3. Map back to DTO for response
    var walkDto = mapper.Map<WalkDto>(walkDomainModel);
    
    // 4. Return 201 Created with location header
    return CreatedAtAction(nameof(GetById), new { id = walkDto.Id }, walkDto);
}
```

**4. Repository (SQLWalkRepository.cs):**
```csharp
public async Task<Walk> CreateAsync(Walk walk)
{
    // Add to DbSet
    await dbContext.Walks.AddAsync(walk);
    
    // Save changes to database
    await dbContext.SaveChangesAsync();
    
    return walk;
}
```

**5. Database:**
```sql
-- EF Core generates and executes:
INSERT INTO Walks (Id, Name, Description, LengthInKm, WalkImageUrl, DifficultyId, RegionId)
VALUES (@p0, @p1, @p2, @p3, @p4, @p5, @p6);
```

**6. Response:**
```http
HTTP/1.1 201 Created
Location: /api/Walks/new-guid-here
Content-Type: application/json

{
  "id": "new-guid-here",
  "name": "Tongariro Alpine Crossing",
  "description": "19.4km day hike",
  "lengthInKm": 19.4,
  "walkImageUrl": "https://example.com/tongariro.jpg",
  "difficulty": {
    "id": "guid",
    "name": "Hard"
  },
  "region": {
    "id": "guid",
    "code": "CTR",
    "name": "Central Plateau"
  }
}
```

---

### Q20: Explain how the web application authenticates with the API.

**Answer:**

**Complete Authentication Flow:**

**1. User Login (index.html):**
```javascript
// User enters credentials
const username = "user@example.com";
const password = "Password@123";
```

**2. JavaScript (auth.js):**
```javascript
async login(username, password) {
    const response = await fetch(`${CONFIG.API_BASE_URL}/Auth/Login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });
    
    if (response.ok) {
        const data = await response.json();
        
        // Store JWT token in localStorage
        localStorage.setItem('jwtToken', data.jwtToken);
        
        // Decode and store user info
        const userInfo = this.parseJwt(data.jwtToken);
        localStorage.setItem('userEmail', userInfo.email);
        localStorage.setItem('userRoles', JSON.stringify(userInfo.role));
        
        return data;
    }
    
    throw new Error('Login failed');
}
```

**3. Token Storage:**
```javascript
// localStorage
{
  "jwtToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userEmail": "user@example.com",
  "userRoles": ["Reader", "Writer"]
}
```

**4. Subsequent API Calls (api.js):**
```javascript
async get(endpoint) {
    const token = Auth.getToken();
    
    const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    if (response.status === 401) {
        // Token expired
        Auth.logout();
        window.location.reload();
    }
    
    return response.json();
}
```

**5. API Validation:**
```csharp
// Middleware extracts and validates token
[Authorize]
[HttpGet]
public async Task<IActionResult> GetAll()
{
    // User.Identity.Name contains email
    // User.IsInRole("Writer") checks roles
}
```

**6. UI Role-Based Rendering:**
```javascript
// Show/hide buttons based on role
updateNavigation() {
    const roles = Auth.getRoles();
    const isWriter = roles.includes('Writer');
    
    if (isWriter) {
        document.body.classList.add('role-writer');
    }
    
    // CSS hides elements for non-writers
    // .writer-only { display: none; }
    // body.role-writer .writer-only { display: inline-flex; }
}
```

---

## Behavioral Questions

### Q21: What was the most challenging part of implementing this project?

**Answer:**
"The most challenging part was implementing the JWT authentication system with role-based authorization. Specifically:

**Challenge 1: Understanding JWT Flow**
- Initially struggled with token expiration and refresh mechanisms
- Had to understand the difference between authentication (who you are) and authorization (what you can do)

**Solution:**
- Researched JWT best practices
- Implemented proper token expiration (2 hours)
- Added role claims to the token payload

**Challenge 2: CORS Issues**
- Web application couldn't communicate with API due to CORS policy
- Error: "Access blocked by CORS policy"

**Solution:**
- Configured CORS middleware properly
- Learned the importance of middleware order (CORS before Authentication)
- Implemented appropriate CORS policy for development and production

**Challenge 3: Model Validation Bug**
- Had inverted logic in custom validation filter
- All valid requests were being rejected with 400 Bad Request

**Solution:**
- Debugged by examining the ValidateModelAttribute
- Fixed the condition from `if (ModelState.IsValid)` to `if (!ModelState.IsValid)`
- Added comprehensive testing for CRUD operations

**Learning:**
These challenges taught me the importance of:
- Thorough testing at each layer
- Understanding middleware pipeline order
- Reading documentation carefully
- Debugging systematically"

---

### Q22: How did you ensure code quality and maintainability in this project?

**Answer:**

**1. Design Patterns:**
- Repository Pattern for data access abstraction
- Dependency Injection for loose coupling
- DTO Pattern for API contract stability

**2. SOLID Principles:**
- **Single Responsibility**: Each class has one purpose
- **Open/Closed**: Can extend with new repositories without modifying existing code
- **Liskov Substitution**: Can replace SQLRepository with any IRepository implementation
- **Interface Segregation**: Focused interfaces (IRegionRepository, IWalkRepository)
- **Dependency Inversion**: Depend on abstractions (interfaces), not concretions

**3. Code Organization:**
```
Controllers/      - API endpoints
Repositories/     - Data access
Models/Domain/    - Domain entities
Models/DTO/       - Data transfer objects
Middlewares/      - Custom middleware
Mappings/         - AutoMapper profiles
```

**4. Error Handling:**
- Global exception middleware
- Consistent error responses
- Proper HTTP status codes

**5. Validation:**
- Data annotations for input validation
- Custom action filters
- Model state validation

**6. Documentation:**
- Comprehensive README with diagrams
- Swagger/OpenAPI documentation
- Code comments where necessary

---

## Technical Deep Dive

### Q23: Explain the difference between AddScoped, AddTransient, and AddSingleton in DI.

**Answer:**

| Lifetime | Behavior | Use Case | Example in Project |
|----------|----------|----------|-------------------|
| **Singleton** | Single instance for app lifetime | Stateless services, thread-safe | `AutoMapper`, Logging |
| **Scoped** | One instance per HTTP request | DbContext, request-specific data | `DbContext`, Repositories |
| **Transient** | New instance every time | Lightweight, stateless services | Helper classes |

**Code Examples:**

```csharp
// SINGLETON - One instance forever
builder.Services.AddSingleton<IEmailService, EmailService>();
// req1 → EmailService@1
// req2 → EmailService@1 (same instance)
// req3 → EmailService@1 (same instance)

// SCOPED - One instance per request
builder.Services.AddScoped<IRegionRepository, SQLRegionRepository>();
// req1 → SQLRegionRepository@1
// req2 → SQLRegionRepository@2 (new instance)
// req3 → SQLRegionRepository@3 (new instance)

// TRANSIENT - New instance always
builder.Services.AddTransient<IDateTimeProvider, DateTimeProvider>();
// Even within same request:
// Controller constructor → DateTimeProvider@1
// Repository constructor → DateTimeProvider@2
```

**Why DbContext is Scoped:**
- Database connections are expensive
- Changes should be isolated per request
- Automatic disposal at end of request
- Thread-safety within a request

---

### Q24: How would you deploy this application to production?

**Answer:**

**Azure Deployment Strategy:**

**1. Azure Resources Needed:**
```
- Azure App Service (API hosting)
- Azure SQL Database (data storage)
- Azure Storage Account (image storage)
- Azure Key Vault (secrets management)
- Application Insights (monitoring)
```

**2. Update Connection Strings:**
```csharp
// Use Azure SQL connection string
var connectionString = builder.Configuration.GetConnectionString("AzureSQLConnection");
```

**3. Secure Configuration:**
```csharp
// Store secrets in Azure Key Vault
builder.Configuration.AddAzureKeyVault(
    new Uri($"https://{keyVaultName}.vault.azure.net/"),
    new DefaultAzureCredential());

// Access secrets
var jwtKey = builder.Configuration["JwtKey"];
```

**4. CI/CD Pipeline (GitHub Actions):**
```yaml
name: Deploy to Azure

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup .NET
        uses: actions/setup-dotnet@v1
        with:
          dotnet-version: 8.0.x
      
      - name: Restore dependencies
        run: dotnet restore
      
      - name: Build
        run: dotnet build --configuration Release
      
      - name: Publish
        run: dotnet publish -c Release -o ./publish
      
      - name: Deploy to Azure
        uses: azure/webapps-deploy@v2
        with:
          app-name: nzwalks-api
          publish-profile: ${{ secrets.AZURE_PUBLISH_PROFILE }}
          package: ./publish
```

**5. Production Best Practices:**
- Enable HTTPS only
- Implement rate limiting
- Use production logging (Application Insights)
- Set restrictive CORS policy
- Enable response caching
- Use CDN for static files
- Implement health checks

---

This interview preparation guide covers the key technical aspects of the NZWalks project. Review each section and practice explaining the concepts in your own words!
