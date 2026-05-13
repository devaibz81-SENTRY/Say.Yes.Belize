/**
 * PHOTO UPLOADER SYSTEM
 * Handles:
 * - Drag & drop image uploads (desktop)
 * - Click to upload (mobile)
 * - LocalStorage persistence
 * - Image preview and management
 */

class PhotoUploader {
  constructor(options = {}) {
    this.storageKey = options.storageKey || 'wedding_photos';
    this.maxFileSize = options.maxFileSize || 5 * 1024 * 1024; // 5MB
    this.acceptedTypes = options.acceptedTypes || ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    this.photos = this.loadPhotos();
    this.isLocked = options.isLocked !== undefined ? options.isLocked : true;
    this.createPhotoZoneStyles();
  }

  createPhotoZoneStyles() {
    if (!document.getElementById('photo-uploader-styles')) {
      const style = document.createElement('style');
      style.id = 'photo-uploader-styles';
      style.textContent = `
        .photo-zone {
          position: relative;
          overflow: hidden;
          background:
            linear-gradient(135deg, rgba(212, 175, 55, 0.08), rgba(255, 255, 255, 0.03)),
            repeating-linear-gradient(45deg, rgba(212, 175, 55, 0.08) 0 1px, transparent 1px 14px);
          border: 1.5px dashed rgba(212, 175, 55, 0.42);
          border-radius: 8px;
          transition: all 0.3s ease;
          cursor: pointer;
          min-height: 180px;
        }

        .photo-zone:hover {
          border-color: rgba(212, 175, 55, 0.6);
          background:
            linear-gradient(135deg, rgba(212, 175, 55, 0.14), rgba(255, 255, 255, 0.05)),
            repeating-linear-gradient(45deg, rgba(212, 175, 55, 0.1) 0 1px, transparent 1px 14px);
        }

        .photo-zone.dragover {
          border-color: #D4AF37;
          background: rgba(212, 175, 55, 0.15);
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.2);
        }

        .photo-zone-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding: 34px 20px;
          text-align: center;
          min-height: 200px;
          color: #dcc0bd;
          height: 100%;
        }

        .photo-zone-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(212, 175, 55, 0.38);
          background: rgba(255, 255, 255, 0.08);
          font-size: 26px;
          opacity: 0.9;
        }

        .photo-zone-text {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px;
          line-height: 1.5;
          max-width: 220px;
        }

        .photo-zone-text strong {
          color: #D4AF37;
          display: block;
          font-weight: 600;
          margin-bottom: 4px;
          letter-spacing: 0.02em;
        }

        .photo-zone-text small {
          display: block;
          font-size: 12px;
          color: rgba(220, 192, 189, 0.6);
        }

        .photo-zone-kicker {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(212, 175, 55, 0.75);
        }

        .photo-container {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          border-radius: 6px;
        }

        .photo-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .photo-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.3);
          opacity: 0;
          transition: opacity 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .photo-zone:hover .photo-overlay {
          opacity: 1;
        }

        .photo-btn {
          background: rgba(212, 175, 55, 0.2);
          border: 1px solid rgba(212, 175, 55, 0.5);
          color: #D4AF37;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.3s;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .photo-btn:hover {
          background: rgba(212, 175, 55, 0.4);
          border-color: #D4AF37;
        }

        .photo-btn-remove {
          background: rgba(255, 107, 107, 0.2);
          border-color: rgba(255, 107, 107, 0.5);
          color: #ff6b6b;
        }

        .photo-btn-remove:hover {
          background: rgba(255, 107, 107, 0.4);
          border-color: #ff6b6b;
        }

        .upload-input {
          display: none;
        }

        .photo-upload-error {
          background: rgba(255, 107, 107, 0.1);
          border: 1px solid rgba(255, 107, 107, 0.3);
          color: #ff6b6b;
          padding: 12px 16px;
          border-radius: 4px;
          font-size: 13px;
          margin-bottom: 12px;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .photo-upload-success {
          background: rgba(76, 175, 80, 0.1);
          border: 1px solid rgba(76, 175, 80, 0.3);
          color: #4caf50;
          padding: 12px 16px;
          border-radius: 4px;
          font-size: 13px;
          margin-bottom: 12px;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        @media (max-width: 640px) {
          .photo-zone-placeholder {
            min-height: 150px;
            padding: 30px 16px;
          }

          .photo-zone-icon {
            font-size: 36px;
          }

          .photo-zone-text {
            font-size: 13px;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  createPhotoZone(containerId, photoId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`PhotoUploader: Container not found: ${containerId}`);
      return;
    }

    container.innerHTML = '';
    const photoZone = document.createElement('div');
    photoZone.className = 'photo-zone';
    photoZone.id = `photo-zone-${photoId}`;
    const label = container.dataset.photoLabel || 'Add a photo here';
    const hint = container.dataset.photoHint || 'Click to upload or drag an image';
    const kicker = container.dataset.photoKicker || 'Photo placeholder';

    const photo = this.photos[photoId];

    if (photo) {
      // Show existing image
      photoZone.innerHTML = `
        <div class="photo-container">
          <img src="${photo.data}" alt="Uploaded photo" class="photo-image">
          <div class="photo-overlay">
            <button class="photo-btn" data-action="change">Change</button>
            <button class="photo-btn photo-btn-remove" data-action="remove">Remove</button>
          </div>
        </div>
      `;
    } else {
      // Show upload placeholder
      photoZone.innerHTML = `
        <div class="photo-zone-placeholder">
          <div class="photo-zone-kicker">${kicker}</div>
          <div class="photo-zone-icon">+</div>
          <div class="photo-zone-text">
            <strong>${label}</strong>
            <small>${hint}</small>
          </div>
        </div>
      `;
    }

    // Create hidden input
    const input = document.createElement('input');
    input.type = 'file';
    input.className = 'upload-input';
    input.accept = this.acceptedTypes.join(',');
    input.id = `upload-input-${photoId}`;

    photoZone.appendChild(input);
    container.appendChild(photoZone);

    // Bind events
    this.bindPhotoZoneEvents(photoZone, photoId, input);
  }

  bindPhotoZoneEvents(zone, photoId, input) {
    // Drag events
    zone.addEventListener('dragover', (e) => {
      if (this.isLocked) return;
      e.preventDefault();
      zone.classList.add('dragover');
    });

    zone.addEventListener('dragleave', () => {
      if (this.isLocked) return;
      zone.classList.remove('dragover');
    });

    zone.addEventListener('drop', (e) => {
      if (this.isLocked) return;
      e.preventDefault();
      zone.classList.remove('dragover');
      const files = e.dataTransfer.files;
      if (files.length) this.handleFileSelect(files[0], photoId, zone);
    });

    // Click event
    zone.addEventListener('click', (e) => {
      if (this.isLocked) return;
      if (e.target.dataset.action === 'change') {
        input.click();
      } else if (e.target.dataset.action === 'remove') {
        this.removePhoto(photoId, zone);
      } else if (!zone.querySelector('img')) {
        input.click();
      }
    });

    // Input change
    input.addEventListener('change', (e) => {
      if (this.isLocked) return;
      if (e.target.files.length) {
        this.handleFileSelect(e.target.files[0], photoId, zone);
      }
    });
  }

  setLock(isLocked) {
    this.isLocked = isLocked;
    const zones = document.querySelectorAll('.photo-zone');
    zones.forEach(z => {
      if (isLocked) {
        z.style.cursor = 'default';
        const overlay = z.querySelector('.photo-overlay');
        if (overlay) overlay.style.display = 'none';
      } else {
        z.style.cursor = 'pointer';
        const overlay = z.querySelector('.photo-overlay');
        if (overlay) overlay.style.display = 'flex';
      }
    });
  }

  handleFileSelect(file, photoId, zone) {
    // Validate
    if (!this.acceptedTypes.includes(file.type)) {
      this.showError(zone, 'Please upload a JPEG, PNG, WebP, or GIF image');
      return;
    }

    if (file.size > this.maxFileSize) {
      const maxMB = (this.maxFileSize / (1024 * 1024)).toFixed(1);
      this.showError(zone, `File size must be under ${maxMB}MB`);
      return;
    }

    // Read and store
    const reader = new FileReader();
    reader.onload = (e) => {
      this.photos[photoId] = {
        data: e.target.result,
        timestamp: new Date().toISOString(),
        fileName: file.name
      };
      this.savePhotos();
      this.createPhotoZone(zone.parentElement.id, photoId);
      this.showSuccess(zone.parentElement, 'Photo uploaded successfully!');
      
      if (this.onPhotoChange) {
        this.onPhotoChange(photoId, this.photos[photoId]);
      }
    };

    reader.readAsDataURL(file);
  }

  removePhoto(photoId, zone) {
    if (confirm('Remove this photo?')) {
      delete this.photos[photoId];
      this.savePhotos();
      this.createPhotoZone(zone.parentElement.id, photoId);
      
      if (this.onPhotoChange) {
        this.onPhotoChange(photoId, null);
      }
    }
  }

  showError(zone, message) {
    const container = zone.parentElement;
    const existing = container.querySelector('.photo-upload-error');
    if (existing) existing.remove();

    const error = document.createElement('div');
    error.className = 'photo-upload-error';
    error.textContent = message;
    container.insertBefore(error, container.firstChild);

    setTimeout(() => error.remove(), 4000);
  }

  showSuccess(container, message) {
    const existing = container.querySelector('.photo-upload-success');
    if (existing) existing.remove();

    const success = document.createElement('div');
    success.className = 'photo-upload-success';
    success.textContent = message;
    container.insertBefore(success, container.firstChild);

    setTimeout(() => success.remove(), 3000);
  }

  getPhoto(photoId) {
    return this.photos[photoId] || null;
  }

  getAllPhotos() {
    return { ...this.photos };
  }

  savePhotos() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.photos));
    } catch (e) {
      console.error('PhotoUploader: Failed to save photos to LocalStorage', e);
    }
  }

  loadPhotos() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error('PhotoUploader: Failed to load photos from LocalStorage', e);
      return {};
    }
  }

  clearAllPhotos() {
    this.photos = {};
    this.savePhotos();
  }
}

window.PhotoUploader = PhotoUploader;
