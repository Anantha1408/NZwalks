# NZWalks Web Application

A modern, visually stunning web application to manage New Zealand walking trails.

## Features

- 🔐 **Authentication**: JWT-based login and registration with role-based access control (Reader/Writer)
- 🗺️ **Regions Management**: Browse, create, edit, and delete regions with pagination and sorting
- 🥾 **Walks Management**: Full CRUD operations for walks with filtering, sorting, and pagination
- 📸 **Image Upload**: Drag-and-drop image upload with preview (Writer role only)
- 🎨 **Premium UI**: Dark theme with glassmorphism effects, smooth animations, and responsive design

## Quick Start

### Prerequisites

- Your NZWalks API must be running on `http://localhost:5268`
- Modern web browser (Chrome, Edge, or Firefox recommended)

### Running the Application

1. Ensure the API is running:
   ```powershell
   cd c:\Users\91944\source\repos\NZwalks
   dotnet run --project NZWalks.API\NZWalks.API.csproj
   ```

2. Open the web application:
   - Navigate to `c:\Users\91944\source\repos\NZwalks\WebApp`
   - Double-click `index.html` to open in your default browser
   - Or right-click → Open with → Choose your browser

### First Time Setup

1. **Create a test user**:
   - Click "Create Account"
   - Enter a username and password
   - Check "Register as Writer" if you want to create/edit content
   - Click "Create Account"

2. **Login**:
   - Enter your credentials
   - Click "Sign In"

3. **Explore**:
   - Browse **Regions** and **Walks**
   - If you're a Writer, you can create/edit/delete content
   - Upload images from the Upload Image page

## API Endpoints Used

- `POST /api/Auth/Login` - User authentication
- `POST /api/Auth/Register` - User registration
- `GET /api/Regions` - Get all regions (with pagination, sorting)
- `GET /api/Regions/{id}` - Get single region
- `POST /api/Regions` - Create region (Writer only)
- `PUT /api/Regions/{id}` - Update region (Writer only)
- `DELETE /api/Regions/{id}` - Delete region (Writer only)
- `GET /api/Walks` - Get all walks (with filtering, pagination, sorting)
- `GET /api/Walks/{id}` - Get single walk
- `POST /api/Walks` - Create walk (Writer only)
- `PUT /api/Walks/{id}` - Update walk (Writer only)
- `DELETE /api/Walks/{id}` - Delete walk (Writer only)
- `POST /api/Images/upload` - Upload image (Writer only)

## Technology Stack

- **HTML5**: Semantic structure with SEO best practices
- **CSS3**: Modern design with CSS custom properties, glassmorphism, animations
- **Vanilla JavaScript**: No frameworks - pure, performant code
- **Google Fonts**: Inter font family for premium typography

## File Structure

```
WebApp/
├── index.html          # Main HTML file
├── styles.css          # Complete CSS design system
├── README.md           # This file
└── js/
    ├── config.js       # API configuration
    ├── auth.js         # Authentication module
    ├── api.js          # API client
    ├── ui.js           # UI utilities
    ├── regions.js      # Regions management
    ├── walks.js        # Walks management
    ├── images.js       # Image upload
    └── app.js          # Main application controller
```

## Role-Based Access Control

- **Reader Role**:
  - View all regions and walks
  - Browse with pagination, filtering, sorting
  
- **Writer Role**:
  - All Reader permissions
  - Create, edit, and delete regions
  - Create, edit, and delete walks
  - Upload images

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)

## Troubleshooting

### "Failed to fetch" errors
- Make sure the API is running on `http://localhost:5268`
- Check browser console for CORS errors

### Authentication issues
- Clear browser localStorage: F12 → Application → Local Storage → Clear
- Make sure JWT token hasn't expired (default 1 hour)

### Images not uploading
- Check file size (max 10MB)
- Ensure file type is JPG, JPEG, or PNG
- Verify you have Writer role

## Notes

- The application uses localStorage to store JWT tokens
- All API calls include the JWT token in the Authorization header
- Tokens are automatically validated and expired tokens trigger logout
- The UI automatically adapts based on user role (Writer vs Reader)

---

Built with ❤️ for NZWalks
