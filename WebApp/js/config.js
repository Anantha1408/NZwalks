// API Configuration
const CONFIG = {
    API_BASE_URL: 'http://localhost:5268/api',
    
    // Endpoints
    ENDPOINTS: {
        LOGIN: '/Auth/Login',
        REGISTER: '/Auth/Register',
        REGIONS: '/Regions',
        WALKS: '/Walks',
        IMAGES: '/Images/upload'
    },
    
    // Storage Keys
    STORAGE_KEYS: {
        TOKEN: 'nzwalks_token',
        USER_ROLES: 'nzwalks_roles'
    },
    
    // Pagination Defaults
    DEFAULT_PAGE_SIZE: 10,
    DEFAULT_PAGE_NUMBER: 1
};

// Make CONFIG globally accessible
window.CONFIG = CONFIG;
