// Image Upload Module
const Images = {
    selectedFile: null,

    // Initialize upload functionality
    init() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('imageFile');
        const form = document.getElementById('uploadForm');

        // Click to select file
        uploadArea.addEventListener('click', () => fileInput.click());

        // File selection
        fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--color-primary)';
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = 'var(--color-border)';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--color-border)';
            this.handleFileSelect(e.dataTransfer.files[0]);
        });

        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.uploadImage();
        });
    },

    // Handle file selection
    handleFileSelect(file) {
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            UI.showNotification('Only JPG, JPEG, and PNG files are allowed.', 'error');
            return;
        }

        // Validate file size (10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            UI.showNotification('File size must not exceed 10MB.', 'error');
            return;
        }

        this.selectedFile = file;
        this.previewImage(file);

        // Auto-fill filename
        const fileNameInput = document.getElementById('imageFileName');
        if (!fileNameInput.value) {
            fileNameInput.value = file.name.split('.')[0];
        }
    },

    // Preview selected image
    previewImage(file) {
        const preview = document.getElementById('imagePreview');
        const placeholder = document.querySelector('.upload-placeholder');
        
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.innerHTML = `
                <img src="${e.target.result}" alt="Preview" style="max-width: 100%; border-radius: var(--radius-md);">
                <p class="mt-1 text-muted">${file.name} (${(file.size / 1024).toFixed(2)} KB)</p>
            `;
            preview.classList.remove('hidden');
            placeholder.classList.add('hidden');
        };
        reader.readAsDataURL(file);
    },

    // Upload image
    async uploadImage() {
        if (!this.selectedFile) {
            UI.showNotification('Please select an image file.', 'error');
            return;
        }

        const fileName = document.getElementById('imageFileName').value.trim();
        const description = document.getElementById('imageDescription').value.trim();

        if (!fileName) {
            UI.showNotification('Please provide a file name.', 'error');
            return;
        }

        try {
            UI.showLoading();

            const formData = new FormData();
            formData.append('File', this.selectedFile);
            formData.append('FileName', fileName);
            formData.append('FileDescription', description || '');

            const response = await API.uploadFile(CONFIG.ENDPOINTS.IMAGES, formData);
            
            UI.hideLoading();
            UI.showNotification('Image uploaded successfully!', 'success');

            // Show uploaded image details
            const resultHtml = `
                <h3>Upload Successful!</h3>
                <div class="mt-1">
                    <img src="${response.filePath}" alt="${UI.escapeHtml(response.fileName)}" 
                         style="max-width: 100%; border-radius: var(--radius-md); margin-bottom: 1rem;">
                    <p><strong>File Name:</strong> ${UI.escapeHtml(response.fileName)}</p>
                    <p><strong>File Path:</strong> <code>${UI.escapeHtml(response.filePath)}</code></p>
                    ${response.fileDescription ? `<p><strong>Description:</strong> ${UI.escapeHtml(response.fileDescription)}</p>` : ''}
                    <p><strong>Size:</strong> ${(response.fileSizeInBytes / 1024).toFixed(2)} KB</p>
                    <button class="btn btn-primary btn-block mt-1" onclick="UI.hideModal()">Close</button>
                </div>
            `;
            UI.showModal(resultHtml);

            // Reset form
            this.resetForm();
        } catch (error) {
            UI.hideLoading();
            UI.showNotification(error.message, 'error');
        }
    },

    // Reset upload form
    resetForm() {
        document.getElementById('uploadForm').reset();
        document.getElementById('imagePreview').classList.add('hidden');
        document.querySelector('.upload-placeholder').classList.remove('hidden');
        this.selectedFile = null;
    }
};

// Make Images globally accessible
window.Images = Images;
