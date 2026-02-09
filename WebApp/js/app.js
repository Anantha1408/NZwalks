// Main Application Controller
const App = {
    currentView: null,

    // Initialize application
    init() {
        console.log('🏔️ NZWalks App initializing...');

        // Check authentication status
        if (Auth.isAuthenticated()) {
            this.showAuthenticatedApp();
        } else {
            this.showView('loginView');
        }

        // Set up event listeners
        this.setupEventListeners();

        // Initialize image upload
        Images.init();

        console.log('✅ NZWalks App ready!');
    },

    // Set up all event listeners
    setupEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin();
        });

        // Register form
        document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleRegister();
        });

        // Toggle between login and register
        document.getElementById('showRegisterBtn').addEventListener('click', () => {
            this.showView('registerView');
        });

        document.getElementById('showLoginBtn').addEventListener('click', () => {
            this.showView('loginView');
        });

        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = link.dataset.view;
                this.navigateTo(view);
            });
        });

        // Add Region button
        document.getElementById('addRegionBtn').addEventListener('click', () => {
            Regions.showCreateForm();
        });

        // Add Walk button
        document.getElementById('addWalkBtn').addEventListener('click', () => {
            Walks.showCreateForm();
        });

        // Region sorting
        document.getElementById('regionSortBy').addEventListener('change', (e) => {
            Regions.sortBy = e.target.value;
            Regions.loadRegions();
        });

        document.getElementById('regionSortOrder').addEventListener('click', () => {
            Regions.toggleSortOrder();
        });

        // Walk filtering
        document.getElementById('walkFilterOn').addEventListener('change', () => {
            Walks.applyFilters();
        });

        document.getElementById('walkFilterQuery').addEventListener('input', () => {
            // Debounce the filter
            clearTimeout(this.filterTimeout);
            this.filterTimeout = setTimeout(() => {
                Walks.applyFilters();
            }, 500);
        });

        // Walk sorting
        document.getElementById('walkSortBy').addEventListener('change', (e) => {
            Walks.sortBy = e.target.value;
            Walks.loadWalks();
        });

        document.getElementById('walkSortOrder').addEventListener('click', () => {
            Walks.toggleSortOrder();
        });
    },

    // Handle login
    async handleLogin() {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        try {
            UI.showLoading();
            await Auth.login(username, password);
            UI.hideLoading();
            UI.showNotification('Login successful!', 'success');
            this.showAuthenticatedApp();
        } catch (error) {
            UI.hideLoading();
            UI.showNotification(error.message, 'error');
        }
    },

    // Handle registration
    async handleRegister() {
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;
        const isWriter = document.getElementById('registerRoleWriter').checked;

        const roles = isWriter ? ['Reader', 'Writer'] : ['Reader'];

        try {
            UI.showLoading();
            await Auth.register(username, password, roles);
            UI.hideLoading();
            UI.showNotification('Registration successful! Please login.', 'success');
            this.showView('loginView');
        } catch (error) {
            UI.hideLoading();
            UI.showNotification(error.message, 'error');
        }
    },

    // Show authenticated app
    showAuthenticatedApp() {
        // Update navigation
        UI.updateNavigation();

        // Default to regions view
        this.navigateTo('regions');
    },

    // Navigate to a specific view
    navigateTo(viewName) {
        switch (viewName) {
            case 'regions':
                this.showView('regionsView');
                Regions.loadRegions();
                break;
            case 'walks':
                this.showView('walksView');
                Walks.loadWalks();
                break;
            case 'upload':
                if (Auth.hasRole('Writer')) {
                    this.showView('uploadView');
                } else {
                    UI.showNotification('You need Writer role to upload images.', 'warning');
                }
                break;
            default:
                this.showView('regionsView');
        }

        // Update active nav link using CSS class
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.dataset.view === viewName) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    },

    // Show specific view and hide others
    showView(viewId) {
        if (this.currentView === viewId) return;

        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.add('hidden');
        });

        // Show selected view
        const view = document.getElementById(viewId);
        if (view) {
            view.classList.remove('hidden');
            this.currentView = viewId;
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Make App globally accessible
window.App = App;
