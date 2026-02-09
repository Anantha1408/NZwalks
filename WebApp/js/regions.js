// Regions Management Module
const Regions = {
    currentPage: 1,
    sortBy: 'Name',
    isAscending: true,

    // Load all regions
    async loadRegions(page = this.currentPage) {
        try {
            UI.showLoading();
            this.currentPage = page;

            const params = {
                pageNumber: page,
                pageSize: CONFIG.DEFAULT_PAGE_SIZE,
                sortBy: this.sortBy,
                isAscending: this.isAscending
            };

            const response = await API.get(CONFIG.ENDPOINTS.REGIONS, params);
            
            this.renderRegionsList(response.data, response.pagination);
            UI.hideLoading();
        } catch (error) {
            UI.hideLoading();
            UI.showNotification(error.message, 'error');
        }
    },

    // Load single region by ID
    async loadRegionDetail(id) {
        try {
            UI.showLoading();
            const response = await API.get(`${CONFIG.ENDPOINTS.REGIONS}/${id}`);
            UI.hideLoading();
            return response.data;
        } catch (error) {
            UI.hideLoading();
            UI.showNotification(error.message, 'error');
        }
    },

    // Create new region
    async createRegion(data) {
        try {
            UI.showLoading();
            await API.post(CONFIG.ENDPOINTS.REGIONS, data);
            UI.hideLoading();
            UI.showNotification('Region created successfully!', 'success');
            UI.hideModal();
            this.loadRegions();
        } catch (error) {
            UI.hideLoading();
            UI.showNotification(error.message, 'error');
        }
    },

    // Update existing region
    async updateRegion(id, data) {
        try {
            UI.showLoading();
            await API.put(`${CONFIG.ENDPOINTS.REGIONS}/${id}`, data);
            UI.hideLoading();
            UI.showNotification('Region updated successfully!', 'success');
            UI.hideModal();
            this.loadRegions();
        } catch (error) {
            UI.hideLoading();
            UI.showNotification(error.message, 'error');
        }
    },

    // Delete region
    async deleteRegion(id) {
        UI.confirm('Are you sure you want to delete this region?', async () => {
            try {
                UI.showLoading();
                await API.delete(`${CONFIG.ENDPOINTS.REGIONS}/${id}`);
                UI.hideLoading();
                UI.showNotification('Region deleted successfully!', 'success');
                this.loadRegions();
            } catch (error) {
                UI.hideLoading();
                UI.showNotification(error.message, 'error');
            }
        });
    },

    // Render regions list
    renderRegionsList(regions, pagination) {
        const container = document.getElementById('regionsGrid');
        
        if (!regions || regions.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">No regions found.</p>';
            return;
        }

        const html = regions.map(region => `
            <div class="card">
                ${region.regionImageUrl ? `
                    <img src="${UI.escapeHtml(region.regionImageUrl)}" 
                         alt="${UI.escapeHtml(region.name)}" 
                         style="width: 100%; height: 200px; object-fit: cover; border-radius: var(--radius-md); margin-bottom: var(--spacing-md);">
                ` : ''}
                <h3 class="card-title">${UI.escapeHtml(region.name)}</h3>
                <p class="card-text">
                    <span class="card-badge">Code: ${UI.escapeHtml(region.code)}</span>
                </p>
                <div class="card-actions writer-only">
                    <button class="btn btn-sm btn-secondary" onclick="Regions.showEditForm('${region.id}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="Regions.deleteRegion('${region.id}')">Delete</button>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;

        // Render pagination
        if (pagination.totalPages) {
            UI.renderPagination(
                'regionsPagination',
                parseInt(pagination.pageNumber),
                parseInt(pagination.totalPages),
                'Regions.loadRegions'
            );
        }
    },

    // Show create form
    showCreateForm() {
        const formHtml = `
            <h3>Add New Region</h3>
            <form id="regionForm" class="mt-1">
                <div class="form-group">
                    <input type="text" id="regionCode" class="form-input" placeholder=" " required maxlength="3" minlength="3">
                    <label for="regionCode" class="form-label">Region Code (3 chars)</label>
                </div>
                <div class="form-group">
                    <input type="text" id="regionName" class="form-input" placeholder=" " required maxlength="100">
                    <label for="regionName" class="form-label">Region Name</label>
                </div>
                <div class="form-group">
                    <input type="url" id="regionImageUrl" class="form-input" placeholder=" ">
                    <label for="regionImageUrl" class="form-label">Image URL (optional)</label>
                </div>
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="UI.hideModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Create Region</button>
                </div>
            </form>
        `;

        UI.showModal(formHtml);

        document.getElementById('regionForm').onsubmit = (e) => {
            e.preventDefault();
            const data = {
                Code: document.getElementById('regionCode').value,
                Name: document.getElementById('regionName').value,
                RegionImageUrl: document.getElementById('regionImageUrl').value || null
            };
            this.createRegion(data);
        };
    },

    // Show edit form
    async showEditForm(id) {
        const region = await this.loadRegionDetail(id);
        
        if (!region) return;

        const formHtml = `
            <h3>Edit Region</h3>
            <form id="regionForm" class="mt-1">
                <div class="form-group">
                    <input type="text" id="regionCode" class="form-input" placeholder=" " required maxlength="3" minlength="3" value="${UI.escapeHtml(region.code)}">
                    <label for="regionCode" class="form-label">Region Code (3 chars)</label>
                </div>
                <div class="form-group">
                    <input type="text" id="regionName" class="form-input" placeholder=" " required maxlength="100" value="${UI.escapeHtml(region.name)}">
                    <label for="regionName" class="form-label">Region Name</label>
                </div>
                <div class="form-group">
                    <input type="url" id="regionImageUrl" class="form-input" placeholder=" " value="${region.regionImageUrl || ''}">
                    <label for="regionImageUrl" class="form-label">Image URL (optional)</label>
                </div>
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="UI.hideModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update Region</button>
                </div>
            </form>
        `;

        UI.showModal(formHtml);

        document.getElementById('regionForm').onsubmit = (e) => {
            e.preventDefault();
            const data = {
                Code: document.getElementById('regionCode').value,
                Name: document.getElementById('regionName').value,
                RegionImageUrl: document.getElementById('regionImageUrl').value || null
            };
            this.updateRegion(id, data);
        };
    },

    // Toggle sort order
    toggleSortOrder() {
        this.isAscending = !this.isAscending;
        const btn = document.getElementById('regionSortOrder');
        btn.textContent = this.isAscending ? '↑' : '↓';
        btn.title = this.isAscending ? 'Ascending' : 'Descending';
        this.loadRegions();
    }
};

// Make Regions globally accessible
window.Regions = Regions;
