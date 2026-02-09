// Authentication Module
const Auth = {
    // Login user
    async login(username, password) {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.LOGIN}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || 'Login failed');
            }

            const data = await response.json();
            
            // Store JWT token
            localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, data.jwtToken);
            
            // Decode and store user roles
            const roles = this.getUserRolesFromToken(data.jwtToken);
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER_ROLES, JSON.stringify(roles));
            
            return { success: true, roles };
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    // Register new user
    async register(username, password, roles = ['Reader']) {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.REGISTER}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password, roles })
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || 'Registration failed');
            }

            return { success: true };
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    // Logout user
    logout() {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_ROLES);
        window.location.reload();
    },

    // Get stored JWT token
    getToken() {
        return localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
    },

    // Get user roles from token
    getUserRolesFromToken(token) {
        try {
            // Decode JWT token (simple base64 decode, don't use in production without validation)
            const payload = token.split('.')[1];
            const decoded = JSON.parse(atob(payload));
            
            // Extract roles from token claims
            const roles = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
            
            // Handle both single role (string) and multiple roles (array)
            return Array.isArray(roles) ? roles : [roles];
        } catch (error) {
            console.error('Error decoding token:', error);
            return [];
        }
    },

    // Get current user roles
    getUserRoles() {
        const storedRoles = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_ROLES);
        return storedRoles ? JSON.parse(storedRoles) : [];
    },

    // Check if user is authenticated
    isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;

        // Check if token is expired
        try {
            const payload = token.split('.')[1];
            const decoded = JSON.parse(atob(payload));
            const exp = decoded.exp * 1000; // Convert to milliseconds
            return Date.now() < exp;
        } catch (error) {
            return false;
        }
    },

    // Check if user has specific role
    hasRole(role) {
        const roles = this.getUserRoles();
        return roles.includes(role);
    }
};

// Make Auth globally accessible
window.Auth = Auth;
