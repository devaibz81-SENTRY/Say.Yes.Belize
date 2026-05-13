/**
 * EDITABLE FIELDS SYSTEM
 * Allows inline editing of text fields with:
 * - Click to edit activation
 * - LocalStorage persistence
 * - Inline editing UI
 * - Multiple field types (text, textarea, date)
 */

class EditableFields {
  constructor(options = {}) {
    this.storageKey = options.storageKey || 'wedding_fields';
    this.fields = this.loadFields();
    this.createEditableStyles();
  }

  createEditableStyles() {
    if (!document.getElementById('editable-fields-styles')) {
      const style = document.createElement('style');
      style.id = 'editable-fields-styles';
      style.textContent = `
        .editable-field {
          position: relative;
          transition: all 0.2s ease;
        }

        .editable-field.can-edit {
          cursor: text;
        }

        .editable-field.can-edit:hover {
          background: rgba(212, 175, 55, 0.08);
          padding: 4px 8px;
          border-radius: 4px;
          margin: -4px -8px;
        }

        .editable-indicator {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 6px;
          height: 6px;
          background: #D4AF37;
          border-radius: 50%;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .editable-field.can-edit:hover .editable-indicator {
          opacity: 0.6;
        }

        .editable-mode-active {
          outline: 2px solid #D4AF37;
          outline-offset: 2px;
          border-radius: 4px;
        }

        .editable-input-wrapper {
          position: relative;
          display: inline-block;
          width: auto;
          min-width: 100%;
        }

        .editable-input {
          width: 100%;
          padding: 8px 12px;
          background: rgba(55, 21, 19, 0.8);
          border: 1px solid #D4AF37;
          border-radius: 4px;
          color: #ffdad7;
          font-family: inherit;
          font-size: inherit;
          font-weight: inherit;
          line-height: inherit;
          outline: none;
          transition: all 0.2s;
        }

        .editable-input:focus {
          box-shadow: 0 0 12px rgba(212, 175, 55, 0.3);
          border-color: #F9E79F;
        }

        .editable-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .editable-controls {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }

        .editable-btn {
          padding: 6px 12px;
          border: 1px solid rgba(212, 175, 55, 0.3);
          background: rgba(74, 0, 26, 0.4);
          color: #D4AF37;
          border-radius: 4px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
        }

        .editable-btn:hover {
          background: rgba(212, 175, 55, 0.15);
          border-color: #D4AF37;
        }

        .editable-btn-save {
          background: linear-gradient(135deg, #D4AF37, #F9E79F);
          color: #280908;
          font-weight: 700;
        }

        .editable-btn-save:hover {
          filter: brightness(1.1);
        }

        .editable-btn-cancel {
          background: transparent;
        }

        .edit-mode-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          pointer-events: none;
        }

        .editable-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: #2d1b1a;
          border: 1px solid #D4AF37;
          color: #D4AF37;
          padding: 4px 8px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          white-space: nowrap;
          margin-bottom: 8px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s;
          z-index: 10001;
        }

        .editable-field.can-edit:hover .editable-tooltip {
          opacity: 1;
        }

        @media (max-width: 640px) {
          .editable-input {
            font-size: 16px; /* Prevent zoom on iOS */
          }

          .editable-controls {
            flex-direction: column-reverse;
          }

          .editable-btn {
            width: 100%;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  makeEditable(element, fieldId, options = {}) {
    const fieldType = options.type || 'text'; // 'text', 'textarea', 'date'
    const label = options.label || fieldId;
    const placeholder = options.placeholder || '';

    if (!element) {
      console.warn(`EditableFields: Element not found for field: ${fieldId}`);
      return;
    }

    // Store original content
    const originalContent = element.innerHTML;

    // Add classes
    element.classList.add('editable-field', 'can-edit');
    element.setAttribute('data-field-id', fieldId);
    element.setAttribute('data-field-type', fieldType);

    // Load saved value if exists
    if (this.fields[fieldId]) {
      element.textContent = this.fields[fieldId].value;
    }

    // Add indicator
    const indicator = document.createElement('span');
    indicator.className = 'editable-indicator';
    element.appendChild(indicator);

    // Add tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'editable-tooltip';
    tooltip.textContent = `Click to edit ${label}`;
    element.appendChild(tooltip);

    // Click handler
    element.addEventListener('click', (e) => {
      if (e.target === indicator || e.target === tooltip) return;
      this.enterEditMode(element, fieldId, fieldType, placeholder);
    });
  }

  enterEditMode(element, fieldId, fieldType, placeholder) {
    const currentValue = element.textContent;
    
    // Clear element
    element.innerHTML = '';

    // Create input
    let input;
    if (fieldType === 'textarea') {
      input = document.createElement('textarea');
      input.className = 'editable-input editable-textarea';
    } else if (fieldType === 'date') {
      input = document.createElement('input');
      input.type = 'date';
      input.className = 'editable-input';
    } else {
      input = document.createElement('input');
      input.type = 'text';
      input.className = 'editable-input';
    }

    input.value = currentValue;
    input.placeholder = placeholder;

    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'editable-input-wrapper';
    wrapper.appendChild(input);

    // Create controls
    const controls = document.createElement('div');
    controls.className = 'editable-controls';

    const saveBtn = document.createElement('button');
    saveBtn.className = 'editable-btn editable-btn-save';
    saveBtn.textContent = 'Save';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'editable-btn editable-btn-cancel';
    cancelBtn.textContent = 'Cancel';

    controls.appendChild(cancelBtn);
    controls.appendChild(saveBtn);

    // Append to element
    element.appendChild(wrapper);
    element.appendChild(controls);
    element.classList.add('editable-mode-active');

    // Focus input
    input.focus();
    if (fieldType !== 'date') {
      input.select();
    }

    // Save handler
    const save = () => {
      const newValue = input.value.trim();
      element.classList.remove('editable-mode-active');
      element.innerHTML = '';

      if (newValue) {
        element.textContent = newValue;
        this.fields[fieldId] = {
          value: newValue,
          timestamp: new Date().toISOString()
        };
        this.saveFields();

        if (this.onFieldChange) {
          this.onFieldChange(fieldId, newValue);
        }
      } else {
        element.textContent = currentValue;
      }

      // Re-add indicator and tooltip
      const indicator = document.createElement('span');
      indicator.className = 'editable-indicator';
      element.appendChild(indicator);

      const tooltip = document.createElement('div');
      tooltip.className = 'editable-tooltip';
      tooltip.textContent = `Click to edit`;
      element.appendChild(tooltip);

      element.classList.add('editable-field', 'can-edit');
    };

    const cancel = () => {
      element.classList.remove('editable-mode-active');
      element.textContent = currentValue;
      element.classList.add('editable-field', 'can-edit');

      // Re-add indicator and tooltip
      const indicator = document.createElement('span');
      indicator.className = 'editable-indicator';
      element.appendChild(indicator);

      const tooltip = document.createElement('div');
      tooltip.className = 'editable-tooltip';
      tooltip.textContent = `Click to edit`;
      element.appendChild(tooltip);
    };

    // Event listeners
    saveBtn.addEventListener('click', save);
    cancelBtn.addEventListener('click', cancel);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && fieldType !== 'textarea') save();
      if (e.key === 'Escape') cancel();
    });

    // Close on outside click
    const handleOutsideClick = (e) => {
      if (!element.contains(e.target)) {
        save();
        document.removeEventListener('click', handleOutsideClick);
      }
    };
    setTimeout(() => {
      document.addEventListener('click', handleOutsideClick);
    }, 100);
  }

  getField(fieldId) {
    return this.fields[fieldId] || null;
  }

  setField(fieldId, value) {
    this.fields[fieldId] = {
      value: value,
      timestamp: new Date().toISOString()
    };
    this.saveFields();
  }

  getAllFields() {
    return { ...this.fields };
  }

  saveFields() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.fields));
    } catch (e) {
      console.error('EditableFields: Failed to save fields to LocalStorage', e);
    }
  }

  loadFields() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error('EditableFields: Failed to load fields from LocalStorage', e);
      return {};
    }
  }

  clearAllFields() {
    this.fields = {};
    this.saveFields();
  }
}

window.EditableFields = EditableFields;
