// Walks Management Module
const Walks = {
    currentPage: 1,
    filterOn: '',
    filterQuery: '',
    sortBy: 'Name',
    isAscending: true,
    allRegions: [],
    allDifficulties: [],

    // Initialize - load regions and difficulties for dropdowns
    async init() {
        try {
            // Load all regions (for dropdowns)
            const regionsResponse = await API.get(CONFIG.ENDPOINTS.REGIONS, { pageSize: 100 });
            this.allRegions = regionsResponse.data;

            // Note: Assuming difficulties are part of the walk data
            // If there's a separate endpoint, add it here
        } catch (error) {
            console.error('Error initializing walks:', error);
        }
    },

    // Load all walks
    async loadWalks(page = this.currentPage) {
        try {
            UI.showLoading();
            this.currentPage = page;

            const params = {
                pageNumber: page,
                pageSize: CONFIG.DEFAULT_PAGE_SIZE,
                sortBy: this.sortBy,
                isAscending: this.isAscending
            };

            if (this.filterOn && this.filterQuery) {
                params.filterOn = this.filterOn;
                params.filterQuery = this.filterQuery;
            }

            const response = await API.get(CONFIG.ENDPOINTS.WALKS, params);
            
            this.renderWalksList(response.data, response.pagination);
            UI.hideLoading();
        } catch (error) {
            UI.hideLoading();
            UI.showNotification(error.message, 'error');
        }
    },

    // Load single walk by ID
    async loadWalkDetail(id) {
        try {
            UI.showLoading();
            const response = await API.get(`${CONFIG.ENDPOINTS.WALKS}/${id}`);
            UI.hideLoading();
            return response.data;
        } catch (error) {
            UI.hideLoading();
            UI.showNotification(error.message, 'error');
        }
    },

    // Create new walk
    async createWalk(data) {
        try {
            UI.showLoading();
            await API.post(CONFIG.ENDPOINTS.WALKS, data);
            UI.hideLoading();
            UI.showNotification('Walk created successfully!', 'success');
            UI.hideModal();
            this.loadWalks();
        } catch (error) {
            UI.hideLoading();
            UI.showNotification(error.message, 'error');
        }
    },

    // Update existing walk
    async updateWalk(id, data) {
        try {
            UI.showLoading();
            await API.put(`${CONFIG.ENDPOINTS.WALKS}/${id}`, data);
            UI.hideLoading();
            UI.showNotification('Walk updated successfully!', 'success');
            UI.hideModal();
            this.loadWalks();
        } catch (error) {
            UI.hideLoading();
            UI.showNotification(error.message, 'error');
        }
    },

    // Delete walk
    async deleteWalk(id) {
        UI.confirm('Are you sure you want to delete this walk?', async () => {
            try {
                UI.showLoading();
                await API.delete(`${CONFIG.ENDPOINTS.WALKS}/${id}`);
                UI.hideLoading();
                UI.showNotification('Walk deleted successfully!', 'success');
                this.loadWalks();
            } catch (error) {
                UI.hideLoading();
                UI.showNotification(error.message, 'error');
            }
        });
    },

    // Render walks list
    renderWalksList(walks, pagination) {
        const container = document.getElementById('walksGrid');
        
        if (!walks || walks.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">No walks found.</p>';
            return;
        }

        const html = walks.map(walk => `
            <div class="card">
                ${walk.walkImageUrl ? `
                    <img src="${UI.escapeHtml(walk.walkImageUrl)}" 
                         alt="${UI.escapeHtml(walk.name)}" 
                         style="width: 100%; height: 200px; object-fit: cover; border-radius: var(--radius-md); margin-bottom: var(--spacing-md);">
                ` : ''}
                <h3 class="card-title">${UI.escapeHtml(walk.name)}</h3>
                <p class="card-text">${UI.escapeHtml(walk.description)}</p>
                <p class="card-text">
                    <span class="card-badge">📏 ${walk.lengthInKm} km</span>
                    <span class="card-badge">📍 ${UI.escapeHtml(walk.region?.name || 'Unknown')}</span>
                    <span class="card-badge">⚡ ${UI.escapeHtml(walk.difficulty?.name || 'Unknown')}</span>
                </p>
                <div class="card-actions writer-only">
                    <button class="btn btn-sm btn-secondary" onclick="Walks.showEditForm('${walk.id}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="Walks.deleteWalk('${walk.id}')">Delete</button>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;

        // Render pagination
        if (pagination.totalPages) {
            UI.renderPagination(
                'walksPagination',
                parseInt(pagination.pageNumber),
                parseInt(pagination.totalPages),
                'Walks.loadWalks'
            );
        }
    },

    // Show create form
    async showCreateForm() {
        // Make sure regions are loaded
        if (this.allRegions.length === 0) {
            await this.init();
        }

        const regionsOptions = this.allRegions.map(r => 
            `<option value="${r.id}">${UI.escapeHtml(r.name)}</option>`
        ).join('');

        const formHtml = `
            <h3>Add New Walk</h3>
            <form id="walkForm" class="mt-1">
                <div class="form-group">
                    <input type="text" id="walkName" class="form-input" placeholder=" " required maxlength="100">
                    <label for="walkName" class="form-label">Walk Name</label>
                </div>
                <div class="form-group">
                    <textarea id="walkDescription" class="form-input" placeholder=" " required maxlength="1000" rows="3"></textarea>
                    <label for="walkDescription" class="form-label">Description</label>
                </div>
                <div class="form-group">
                    <input type="number" id="walkLength" class="form-input" placeholder=" " required min="0" max="50" step="0.1">
                    <label for="walkLength" class="form-label">Length (km)</label>
                </div>
                <div class="form-group">
                    <input type="url" id="walkImageUrl" class="form-input" placeholder=" ">
                    <label for="walkImageUrl" class="form-label">Image URL (optional)</label>
                </div>
                <div class="form-group">
                    <select id="walkRegionId" class="form-select" required>
                        <option value="">Select Region</option>
                        ${regionsOptions}
                    </select>
                </div>
                <div class="form-group">
                    <input type="text" id="walkDifficultyId" class="form-input" placeholder=" " required>
                    <label for="walkDifficultyId" class="form-label">Difficulty ID (GUID)</label>
                    <small class="text-muted">Note: Get difficulty IDs from existing walks or database</small>
                </div>
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="UI.hideModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Create Walk</button>
                </div>
            </form>
        `;

        UI.showModal(formHtml);

        document.getElementById('walkForm').onsubmit = (e) => {
            e.preventDefault();
            const data = {
                Name: document.getElementById('walkName').value,
                Description: document.getElementById('walkDescription').value,
                LengthInKm: parseFloat(document.getElementById('walkLength').value),
                WalkImageUrl: document.getElementById('walkImageUrl').value || null,
                RegionId: document.getElementById('walkRegionId').value,
                DifficultyId: document.getElementById('walkDifficultyId').value
            };
            this.createWalk(data);
        };
    },

    // Show edit form
    async showEditForm(id) {
        const walk = await this.loadWalkDetail(id);
        
        if (!walk) return;

        // Make sure regions are loaded
        if (this.allRegions.length === 0) {
            await this.init();
        }

        const regionsOptions = this.allRegions.map(r => 
            `<option value="${r.id}" ${r.id === walk.region?.id ? 'selected' : ''}>${UI.escapeHtml(r.name)}</option>`
        ).join('');

        const formHtml = `
            <h3>Edit Walk</h3>
            <form id="walkForm" class="mt-1">
                <div class="form-group">
                    <input type="text" id="walkName" class="form-input" placeholder=" " required maxlength="100" value="${UI.escapeHtml(walk.name)}">
                    <label for="walkName" class="form-label">Walk Name</label>
                </div>
                <div class="form-group">
                    <textarea id="walkDescription" class="form-input" placeholder=" " required maxlength="1000" rows="3">${UI.escapeHtml(walk.description)}</textarea>
                    <label for="walkDescription" class="form-label">Description</label>
                </div>
                <div class="form-group">
                    <input type="number" id="walkLength" class="form-input" placeholder=" " required min="0" max="50" step="0.1" value="${walk.lengthInKm}">
                    <label for="walkLength" class="form-label">Length (km)</label>
                </div>
                <div class="form-group">
                    <input type="url" id="walkImageUrl" class="form-input" placeholder=" " value="${walk.walkImageUrl || ''}">
                    <label for="walkImageUrl" class="form-label">Image URL (optional)</label>
                </div>
                <div class="form-group">
                    <select id="walkRegionId" class="form-select" required>
                        <option value="">Select Region</option>
                        ${regionsOptions}
                    </select>
                </div>
                <div class="form-group">
                    <input type="text" id="walkDifficultyId" class="form-input" placeholder=" " required value="${walk.difficulty?.id || ''}">
                    <label for="walkDifficultyId" class="form-label">Difficulty ID (GUID)</label>
                </div>
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="UI.hideModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update Walk</button>
                </div>
            </form>
        `;

        UI.showModal(formHtml);

        document.getElementById('walkForm').onsubmit = (e) => {
            e.preventDefault();
            const data = {
                Name: document.getElementById('walkName').value,
                Description: document.getElementById('walkDescription').value,
                LengthInKm: parseFloat(document.getElementById('walkLength').value),
                WalkImageUrl: document.getElementById('walkImageUrl').value || null,
                RegionId: document.getElementById('walkRegionId').value,
                DifficultyId: document.getElementById('walkDifficultyId').value
            };
            this.updateWalk(id, data);
        };
    },

    // Apply filters
    applyFilters() {
        this.filterOn = document.getElementById('walkFilterOn').value;
        this.filterQuery = document.getElementById('walkFilterQuery').value;
        this.currentPage = 1;
        this.loadWalks();
    },

    // Toggle sort order
    toggleSortOrder() {
        this.isAscending = !this.isAscending;
        const btn = document.getElementById('walkSortOrder');
        btn.textContent = this.isAscending ? '↑' : '↓';
        btn.title = this.isAscending ? 'Ascending' : 'Descending';
        this.loadWalks();
    }
};

// Make Walks globally accessible
window.Walks = Walks;
