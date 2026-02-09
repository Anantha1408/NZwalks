// UI Utilities Module
const UI = {
    // Show notification toast
    showNotification(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            toast.style.animation = 'slideInRight 0.3s ease-in-out reverse';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    },

    // Show loading overlay
    showLoading() {
        document.getElementById('loadingOverlay').classList.remove('hidden');
    },

    // Hide loading overlay
    hideLoading() {
        document.getElementById('loadingOverlay').classList.add('hidden');
    },

    // Show modal
    showModal(content) {
        const overlay = document.getElementById('modalOverlay');
        const modalContent = document.getElementById('modalContent');
        
        modalContent.innerHTML = content;
        overlay.classList.remove('hidden');
    },

    // Hide modal
    hideModal() {
        document.getElementById('modalOverlay').classList.add('hidden');
    },

    // Render pagination controls
    renderPagination(containerId, currentPage, totalPages, onPageChange) {
        const container = document.getElementById(containerId);
        
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = '';
        
        // Previous button
        html += `<button class="btn btn-sm btn-secondary" ${currentPage === 1 ? 'disabled' : ''} 
                    onclick="${onPageChange}(${currentPage - 1})">← Previous</button>`;
        
        // Page info
        html += `<span class="pagination-info">Page ${currentPage} of ${totalPages}</span>`;
        
        // Next button
        html += `<button class="btn btn-sm btn-secondary" ${currentPage === totalPages ? 'disabled' : ''} 
                    onclick="${onPageChange}(${currentPage + 1})">Next →</button>`;
        
        container.innerHTML = html;
    },

    // Update navigation based on auth status
    updateNavigation() {
        const navAuth = document.getElementById('navAuth');
        const navLinks = document.getElementById('navLinks');
        
        if (Auth.isAuthenticated()) {
            const roles = Auth.getUserRoles();
            const roleText = roles.includes('Writer') ? 'Writer' : 'Reader';
            
            navAuth.innerHTML = `
                <span class="text-muted">Role: <strong>${roleText}</strong></span>
                <button class="btn btn-sm btn-secondary" onclick="Auth.logout()">Logout</button>
            `;
            
            // Show/hide writer-only elements
            if (roles.includes('Writer')) {
                document.body.classList.add('role-writer');
            } else {
                document.body.classList.remove('role-writer');
            }
            
            // Show nav links
            navLinks.classList.remove('hidden');
        } else {
            navAuth.innerHTML = '';
            navLinks.classList.add('hidden');
            document.body.classList.remove('role-writer');
        }
    },

    // Show confirmation dialog
    async confirm(message, onConfirm) {
        const content = `
            <h3>Confirm Action</h3>
            <p class="mt-1 mb-1">${message}</p>
            <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                <button class="btn btn-secondary" onclick="UI.hideModal()">Cancel</button>
                <button class="btn btn-danger" id="confirmBtn">Confirm</button>
            </div>
        `;
        
        this.showModal(content);
        
        // Wait for user action
        document.getElementById('confirmBtn').onclick = () => {
            this.hideModal();
            onConfirm();
        };
    },

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Make UI globally accessible
window.UI = UI;

// Close modal when clicking overlay
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('modalOverlay');
    const modal = overlay.querySelector('.modal');
    const closeBtn = document.getElementById('modalClose');
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            UI.hideModal();
        }
    });
    
    closeBtn.addEventListener('click', () => UI.hideModal());
});
