// API Client Module
const API = {
    // Generic API request with JWT token injection
    async request(endpoint, options = {}) {
        const token = Auth.getToken();
        
        const defaultHeaders = {
            'Content-Type': 'application/json'
        };

        // Add authorization header if token exists
        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        };

        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, config);
            
            // Handle 401 Unauthorized - redirect to login
            if (response.status === 401) {
                Auth.logout();
                throw new Error('Unauthorized. Please login again.');
            }

            // Extract pagination headers if they exist
            const paginationHeaders = {
                totalCount: response.headers.get('X-Total-Count'),
                pageNumber: response.headers.get('X-Page-Number'),
                pageSize: response.headers.get('X-Page-Size'),
                totalPages: response.headers.get('X-Total-Pages')
            };

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || `HTTP Error ${response.status}`);
            }

            // Handle 204 No Content
            if (response.status === 204) {
                return { success: true, pagination: paginationHeaders };
            }

            const data = await response.json();
            
            // Return data with pagination info if available
            return {
                data,
                pagination: paginationHeaders
            };
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    },

    // GET request
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    },

    // POST request
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    // PUT request
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    },

    // Upload file (multipart/form-data)
    async uploadFile(endpoint, formData) {
        const token = Auth.getToken();
        
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers,
                body: formData
            });

            if (response.status === 401) {
                Auth.logout();
                throw new Error('Unauthorized. Please login again.');
            }

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || `HTTP Error ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('File upload error:', error);
            throw error;
        }
    }
};

// Make API globally accessible
window.API = API;
