# 🏔️ NZWalks - New Zealand Walking Trails API & Web Application

A comprehensive ASP.NET Core Web API with a modern JavaScript web frontend for managing and exploring walking trails across New Zealand's beautiful regions.

![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)
![ASP.NET Core](https://img.shields.io/badge/ASP.NET%20Core-8.0-512BD4)
![Entity Framework](https://img.shields.io/badge/Entity%20Framework-Core%208.0-512BD4)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Authentication & Authorization](#-authentication--authorization)
- [Getting Started](#-getting-started)
- [Web Application](#-web-application)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)

---

## 🌟 Overview

NZWalks is a full-stack application that provides:
- **RESTful API** for managing regions, walks, difficulties, and images
- **JWT-based authentication** with role-based access control
- **Modern web UI** for intuitive interaction with the API
- **Image upload** capabilities for trail photos
- **Comprehensive filtering, sorting, and pagination**

---

## 🏗️ Architecture

### System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        WebUI[Web Application<br/>HTML/CSS/JavaScript]
    end
    
    subgraph "API Layer"
        API[ASP.NET Core Web API<br/>Controllers + Middleware]
        Auth[JWT Authentication<br/>& Authorization]
        Validation[Model Validation<br/>Custom Filters]
    end
    
    subgraph "Business Layer"
        Repos[Repository Pattern<br/>Data Access]
        Mapper[AutoMapper<br/>DTO Mapping]
    end
    
    subgraph "Data Layer"
        EF[Entity Framework Core<br/>ORM]
        DB[(SQL Server<br/>Database)]
        AuthDB[(Auth Database<br/>Identity)]
    end
    
    WebUI -->|HTTP/HTTPS| API
    API --> Auth
    API --> Validation
    API --> Repos
    Repos --> Mapper
    Repos --> EF
    EF --> DB
    Auth --> AuthDB
    
    style WebUI fill:#4A90E2
    style API fill:#50C878
    style DB fill:#FF6B6B
    style AuthDB fill:#FF6B6B
```

### Request Flow

```mermaid
sequenceDiagram
    participant Client
    participant Middleware
    participant Controller
    participant Validation
    participant Repository
    participant Database
    
    Client->>Middleware: HTTP Request
    Middleware->>Middleware: JWT Validation
    Middleware->>Middleware: CORS Check
    Middleware->>Controller: Authorized Request
    Controller->>Validation: Validate Model
    alt Invalid Model
        Validation-->>Client: 400 Bad Request
    else Valid Model
        Validation->>Repository: Business Logic
        Repository->>Database: Query/Command
        Database-->>Repository: Data
        Repository-->>Controller: Domain Model
        Controller->>Controller: Map to DTO
        Controller-->>Client: 200 OK + Data
    end
```

---

## ✨ Features

### Core Features

| Feature | Description | Status |
|---------|-------------|--------|
| 🗺️ **Regions Management** | CRUD operations for NZ regions | ✅ Complete |
| 🥾 **Walks Management** | CRUD operations for walking trails | ✅ Complete |
| 📊 **Difficulty Levels** | Predefined difficulty ratings | ✅ Complete |
| 🖼️ **Image Upload** | Upload and manage trail images | ✅ Complete |
| 🔐 **JWT Authentication** | Secure token-based auth | ✅ Complete |
| 👥 **Role-Based Access** | Reader/Writer permissions | ✅ Complete |
| 🔍 **Filtering & Sorting** | Advanced query capabilities | ✅ Complete |
| 📄 **Pagination** | Efficient data retrieval | ✅ Complete |
| 🌐 **CORS Support** | Cross-origin requests enabled | ✅ Complete |
| 🎨 **Modern Web UI** | Responsive dark-themed interface | ✅ Complete |

### Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant AuthAPI
    participant Database
    
    User->>UI: Enter Credentials
    UI->>AuthAPI: POST /api/Auth/Login
    AuthAPI->>Database: Validate User
    Database-->>AuthAPI: User + Roles
    AuthAPI->>AuthAPI: Generate JWT Token
    AuthAPI-->>UI: JWT Token
    UI->>UI: Store Token
    
    Note over UI,AuthAPI: Subsequent Requests
    
    UI->>AuthAPI: Request + Bearer Token
    AuthAPI->>AuthAPI: Validate JWT
    AuthAPI->>AuthAPI: Check Roles
    AuthAPI-->>UI: Protected Resource
```

---

## 🛠️ Technology Stack

### Backend

| Technology | Purpose | Version |
|------------|---------|---------|
| **ASP.NET Core** | Web API Framework | 8.0 |
| **Entity Framework Core** | ORM | 8.0 |
| **SQL Server** | Database | 2022+ |
| **AutoMapper** | Object Mapping | Latest |
| **JWT Bearer** | Authentication | Latest |
| **ASP.NET Identity** | User Management | 8.0 |

### Frontend

| Technology | Purpose |
|------------|---------|
| **HTML5** | Markup |
| **CSS3** | Styling (Glassmorphism) |
| **Vanilla JavaScript** | Interactivity |
| **Fetch API** | HTTP Requests |

### Development Tools

- **Visual Studio 2022** / **VS Code**
- **SQL Server Management Studio**
- **Postman** / **Swagger**
- **Git** for version control

---

## 💾 Database Schema

### Entity Relationship Diagram

```mermaid
erDiagram
    REGION ||--o{ WALK : "has many"
    DIFFICULTY ||--o{ WALK : "has many"
    
    REGION {
        Guid Id PK
        string Code UK
        string Name
        string RegionImageUrl
    }
    
    WALK {
        Guid Id PK
        string Name
        string Description
        decimal LengthInKm
        string WalkImageUrl
        Guid DifficultyId FK
        Guid RegionId FK
    }
    
    DIFFICULTY {
        Guid Id PK
        string Name UK
    }
    
    IMAGE {
        Guid Id PK
        string FileName UK
        string FileExtension
        long FileSizeInBytes
        string FilePath
        string FileDescription
    }
    
    ASPNETUSERS {
        string Id PK
        string UserName
        string Email
        string PasswordHash
    }
    
    ASPNETROLES {
        string Id PK
        string Name
    }
    
    ASPNETUSERROLES {
        string UserId FK
        string RoleId FK
    }
    
    ASPNETUSERS ||--o{ ASPNETUSERROLES : "has"
    ASPNETROLES ||--o{ ASPNETUSERROLES : "assigned to"
```

### Database Tables

<details>
<summary><strong>📊 Click to expand table details</strong></summary>

#### Regions Table
```sql
CREATE TABLE Regions (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Code NVARCHAR(3) NOT NULL UNIQUE,
    Name NVARCHAR(100) NOT NULL,
    RegionImageUrl NVARCHAR(MAX) NULL
);
```

#### Walks Table
```sql
CREATE TABLE Walks (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(1000) NOT NULL,
    LengthInKm DECIMAL(18,2) NOT NULL,
    WalkImageUrl NVARCHAR(MAX) NULL,
    DifficultyId UNIQUEIDENTIFIER NOT NULL,
    RegionId UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (DifficultyId) REFERENCES Difficulties(Id),
    FOREIGN KEY (RegionId) REFERENCES Regions(Id)
);
```

#### Difficulties Table
```sql
CREATE TABLE Difficulties (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(100) NOT NULL UNIQUE
);
```

</details>

---

## 🚀 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/Auth/Register` | Register new user | ❌ No |
| `POST` | `/api/Auth/Login` | Login and get JWT token | ❌ No |

### Regions Endpoints

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `GET` | `/api/Regions` | Get all regions (paginated) | ✅ Yes | Reader, Writer |
| `GET` | `/api/Regions/{id}` | Get region by ID | ✅ Yes | Reader, Writer |
| `POST` | `/api/Regions` | Create new region | ✅ Yes | Writer |
| `PUT` | `/api/Regions/{id}` | Update region | ✅ Yes | Writer |
| `DELETE` | `/api/Regions/{id}` | Delete region | ✅ Yes | Writer |

### Walks Endpoints

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `GET` | `/api/Walks` | Get all walks (filtered, sorted, paginated) | ✅ Yes | Reader, Writer |
| `GET` | `/api/Walks/{id}` | Get walk by ID | ✅ Yes | Reader, Writer |
| `POST` | `/api/Walks` | Create new walk | ✅ Yes | Writer |
| `PUT` | `/api/Walks/{id}` | Update walk | ✅ Yes | Writer |
| `DELETE` | `/api/Walks/{id}` | Delete walk | ✅ Yes | Writer |

### Images Endpoints

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| `POST` | `/api/Images/Upload` | Upload image | ✅ Yes | Writer |

### Query Parameters

#### Regions
- `sortBy` - Sort field (Name, Code)
- `isAscending` - Sort direction (true/false)
- `pageNumber` - Page number (default: 1)
- `pageSize` - Items per page (default: 10, max: 100)

#### Walks
- `filterOn` - Filter field (Name, LengthInKm)
- `filterQuery` - Filter value
- `sortBy` - Sort field (Name, LengthInKm)
- `isAscending` - Sort direction (true/false)
- `pageNumber` - Page number (default: 1)
- `pageSize` - Items per page (default: 10, max: 100)

---

## 🔐 Authentication & Authorization

### JWT Token Structure

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user@example.com",
    "jti": "unique-token-id",
    "email": "user@example.com",
    "roles": ["Reader", "Writer"],
    "exp": 1234567890,
    "iss": "https://localhost:7054",
    "aud": "https://localhost:7054"
  }
}
```

### User Roles

```mermaid
graph LR
    User[User] --> Reader[Reader Role]
    User --> Writer[Writer Role]
    
    Reader --> ReadOps[Read Operations]
    Writer --> ReadOps
    Writer --> WriteOps[Create/Update/Delete]
    
    ReadOps --> GetRegions[GET Regions]
    ReadOps --> GetWalks[GET Walks]
    
    WriteOps --> PostRegions[POST Regions]
    WriteOps --> PutRegions[PUT Regions]
    WriteOps --> DeleteRegions[DELETE Regions]
    WriteOps --> PostWalks[POST Walks]
    WriteOps --> PutWalks[PUT Walks]
    WriteOps --> DeleteWalks[DELETE Walks]
    WriteOps --> UploadImages[POST Images]
    
    style Reader fill:#4A90E2
    style Writer fill:#50C878
    style WriteOps fill:#FF6B6B
```

### Authorization Example

```csharp
[Authorize(Roles = "Writer")]
[HttpPost]
public async Task<IActionResult> Create([FromBody] AddRegionRequestDto request)
{
    // Only users with Writer role can access this endpoint
}
```

---

## 🏁 Getting Started

### Prerequisites

- **.NET 8.0 SDK** or later
- **SQL Server 2022** or later (SQL Express works fine)
- **Visual Studio 2022** or **VS Code** with C# extension

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/NZwalks.git
cd NZwalks
```

2. **Update connection strings**

Edit `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "NZWalksConnectionString": "Server=localhost;Database=NZWalksDb;Trusted_Connection=true;TrustServerCertificate=true",
    "NZWalksAuthConnectionString": "Server=localhost;Database=NZWalksAuthDb;Trusted_Connection=true;TrustServerCertificate=true"
  }
}
```

3. **Run migrations**
```bash
cd NZWalks.API
dotnet ef database update --context NZWalksDbContext
dotnet ef database update --context NZWalksAuthDbContext
```

4. **Run the API**
```bash
dotnet run
```

The API will be available at `https://localhost:7054` and `http://localhost:5268`

5. **Open the Web Application**
```bash
# Simply open in browser
WebApp/index.html
```

Or serve it with a local server:
```bash
# Using Python
cd WebApp
python -m http.server 8000

# Using Node.js
npx http-server WebApp -p 8000
```

### First-Time Setup

1. **Register a user** (via API or Web UI)
```json
POST /api/Auth/Register
{
  "username": "admin@nzwalks.com",
  "password": "Admin@123",
  "roles": ["Reader", "Writer"]
}
```

2. **Login to get JWT token**
```json
POST /api/Auth/Login
{
  "username": "admin@nzwalks.com",
  "password": "Admin@123"
}
```

3. **Use the token** in subsequent requests
```
Authorization: Bearer <your-jwt-token>
```

---

## 🎨 Web Application

### Features

- ✅ **Dark-themed modern UI** with glassmorphism effects
- ✅ **Responsive design** for all screen sizes
- ✅ **JWT authentication** with role-based UI elements
- ✅ **CRUD operations** for regions and walks
- ✅ **Image upload** with drag-and-drop
- ✅ **Real-time filtering and sorting**
- ✅ **Pagination** with page size controls
- ✅ **Toast notifications** for user feedback
- ✅ **Modal forms** for create/edit operations

### UI Components

```mermaid
graph TB
    subgraph "Web Application"
        Login[Login/Register View]
        Nav[Navigation Bar]
        
        subgraph "Main Views"
            Regions[Regions View]
            Walks[Walks View]
            Upload[Image Upload View]
        end
        
        subgraph "Components"
            Modal[Modal Forms]
            Toast[Toast Notifications]
            Loading[Loading Overlay]
            Pagination[Pagination Controls]
        end
    end
    
    Login -->|Authenticated| Nav
    Nav --> Regions
    Nav --> Walks
    Nav --> Upload
    
    Regions --> Modal
    Walks --> Modal
    Upload --> Modal
    
    Modal --> Toast
    Modal --> Loading
    Regions --> Pagination
    Walks --> Pagination
    
    style Login fill:#4A90E2
    style Nav fill:#50C878
    style Modal fill:#FF6B6B
```

### Screenshots

The web application features:
- **Navigation**: Seamless tab-based navigation between Regions, Walks, and Upload views
- **Region Cards**: Beautiful cards displaying region information with images
- **Walk Cards**: Detailed walk information with length, difficulty, and region tags
- **Filters**: Real-time filtering and sorting with multiple criteria
- **Forms**: Clean, accessible forms with floating labels and validation

---

## 📚 API Documentation

### Sample Requests & Responses

#### Register User

**Request:**
```http
POST /api/Auth/Register HTTP/1.1
Content-Type: application/json

{
  "username": "john@example.com",
  "password": "Password@123",
  "roles": ["Reader", "Writer"]
}
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "message": "User registered successfully"
}
```

#### Login

**Request:**
```http
POST /api/Auth/Login HTTP/1.1
Content-Type: application/json

{
  "username": "john@example.com",
  "password": "Password@123"
}
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "jwtToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get All Regions

**Request:**
```http
GET /api/Regions?sortBy=Name&isAscending=true&pageNumber=1&pageSize=10 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json

[
  {
    "id": "14ceba71-4b51-4777-9b17-46602cf66153",
    "code": "AKL",
    "name": "Auckland",
    "regionImageUrl": "https://example.com/auckland.jpg"
  },
  {
    "id": "6884f7d7-ad1f-4101-8df3-7a6fa7387d81",
    "code": "NTL",
    "name": "Northland",
    "regionImageUrl": "https://example.com/northland.jpg"
  }
]
```

#### Create Walk

**Request:**
```http
POST /api/Walks HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Tongariro Alpine Crossing",
  "description": "New Zealand's most popular day hike",
  "lengthInKm": 19.4,
  "walkImageUrl": "https://example.com/tongariro.jpg",
  "difficultyId": "f7248fc3-2585-4efb-8d1d-1c555f4087f6",
  "regionId": "14ceba71-4b51-4777-9b17-46602cf66153"
}
```

**Response:**
```http
HTTP/1.1 201 Created
Content-Type: application/json
Location: /api/Walks/a8b9c0d1-e2f3-4a5b-6c7d-8e9f0a1b2c3d

{
  "id": "a8b9c0d1-e2f3-4a5b-6c7d-8e9f0a1b2c3d",
  "name": "Tongariro Alpine Crossing",
  "description": "New Zealand's most popular day hike",
  "lengthInKm": 19.4,
  "walkImageUrl": "https://example.com/tongariro.jpg",
  "difficulty": {
    "id": "f7248fc3-2585-4efb-8d1d-1c555f4087f6",
    "name": "Hard"
  },
  "region": {
    "id": "14ceba71-4b51-4777-9b17-46602cf66153",
    "code": "AKL",
    "name": "Auckland",
    "regionImageUrl": null
  }
}
```

---

## 📁 Project Structure

```
NZwalks/
├── NZWalks.API/                    # ASP.NET Core Web API
│   ├── Controllers/                # API Controllers
│   │   ├── AuthController.cs       # Authentication endpoints
│   │   ├── RegionsController.cs    # Regions CRUD
│   │   ├── WalksController.cs      # Walks CRUD
│   │   └── ImagesController.cs     # Image upload
│   ├── CustomActionFilters/        # Custom filters
│   │   └── ValidateModelAttribute.cs
│   ├── Data/                       # Database contexts
│   │   ├── NZWalksDbContext.cs
│   │   └── NZWalksAuthDbContext.cs
│   ├── Mappings/                   # AutoMapper profiles
│   │   └── AutoMapperProfiles.cs
│   ├── Middlewares/                # Custom middleware
│   │   └── ExceptionHandlerMiddleware.cs
│   ├── Migrations/                 # EF Core migrations
│   ├── Models/                     # Data models
│   │   ├── Domain/                 # Domain entities
│   │   │   ├── Region.cs
│   │   │   ├── Walk.cs
│   │   │   ├── Difficulty.cs
│   │   │   └── Image.cs
│   │   └── DTO/                    # Data transfer objects
│   │       ├── AddRegionRequestDto.cs
│   │       ├── RegionDto.cs
│   │       ├── AddWalkRequestDto.cs
│   │       └── WalkDto.cs
│   ├── Repositories/               # Repository pattern
│   │   ├── IRegionRepository.cs
│   │   ├── SQLRegionRepository.cs
│   │   ├── IWalkRepository.cs
│   │   └── SQLWalkRepository.cs
│   ├── Images/                     # Uploaded images storage
│   ├── Program.cs                  # Application entry point
│   └── appsettings.json            # Configuration
│
└── WebApp/                         # Frontend web application
    ├── js/                         # JavaScript modules
    │   ├── config.js               # API configuration
    │   ├── auth.js                 # Authentication logic
    │   ├── api.js                  # API client
    │   ├── ui.js                   # UI components
    │   ├── regions.js              # Regions management
    │   ├── walks.js                # Walks management
    │   ├── images.js               # Image upload
    │   └── app.js                  # Main application
    ├── index.html                  # Main HTML file
    └── styles.css                  # Stylesheets
```

---

## 🔧 Configuration

### API Configuration

**appsettings.json**
```json
{
  "ConnectionStrings": {
    "NZWalksConnectionString": "Server=localhost;Database=NZWalksDb;Trusted_Connection=true;",
    "NZWalksAuthConnectionString": "Server=localhost;Database=NZWalksAuthDb;Trusted_Connection=true;"
  },
  "Jwt": {
    "Key": "YourSuperSecretKeyHereMustBeAtLeast256Bits",
    "Issuer": "https://localhost:7054",
    "Audience": "https://localhost:7054"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

### Web App Configuration

**js/config.js**
```javascript
const CONFIG = {
    API_BASE_URL: 'http://localhost:5268/api',
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/Auth/Login',
            REGISTER: '/Auth/Register'
        },
        REGIONS: '/Regions',
        WALKS: '/Walks',
        IMAGES: '/Images/Upload'
    }
};
```

---

## 🧪 Testing

### Manual Testing with Swagger

The API includes Swagger documentation available at:
- `https://localhost:7054/swagger`
- `http://localhost:5268/swagger`

### Testing Checklist

- [x] User registration with different roles
- [x] JWT token generation and validation
- [x] CRUD operations for Regions
- [x] CRUD operations for Walks
- [x] Filtering and sorting
- [x] Pagination
- [x] Role-based authorization
- [x] Image upload
- [x] CORS functionality
- [x] Error handling and validation

---

## 🚀 Deployment

### Azure Deployment

1. **Publish the API**
```bash
dotnet publish -c Release
```

2. **Create Azure Resources**
- Azure App Service
- Azure SQL Database
- Azure Storage (for images)

3. **Update Connection Strings** in Azure Portal

### Docker Deployment

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["NZWalks.API/NZWalks.API.csproj", "NZWalks.API/"]
RUN dotnet restore "NZWalks.API/NZWalks.API.csproj"
COPY . .
WORKDIR "/src/NZWalks.API"
RUN dotnet build "NZWalks.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "NZWalks.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "NZWalks.API.dll"]
```

---

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **Connection refused** | Ensure SQL Server is running |
| **401 Unauthorized** | Check JWT token is valid and not expired |
| **403 Forbidden** | User doesn't have required role (Writer) |
| **CORS error** | Verify CORS is configured in Program.cs |
| **Migration failed** | Check connection string and SQL Server access |

### Debug Mode

Enable detailed logging in `appsettings.Development.json`:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.AspNetCore": "Debug"
    }
  }
}
```

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👏 Acknowledgments

- ASP.NET Core team for the excellent framework
- Entity Framework Core for powerful ORM
- AutoMapper for simplified object mapping
- The open-source community

---

## 📞 Contact

For questions or support, please open an issue in the GitHub repository.

---

**Made with ❤️ for New Zealand walking enthusiasts**
