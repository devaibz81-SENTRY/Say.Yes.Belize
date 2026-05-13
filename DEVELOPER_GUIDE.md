# 🛠️ Developer Guide - Interactive Wedding Template System

## Architecture Overview

```
┌─────────────────────────────────────────┐
│       HTML Template Pages               │
│  (Sensual.html, our-story.html, etc)   │
└─────────────┬───────────────────────────┘
              │
              ├─ Script References ─────┐
              │                         │
    ┌─────────▼──────┐      ┌──────────▼──────┐
    │  guided-tour   │      │  sensual-init   │
    │      .js       │      │       .js       │
    └────────────────┘      └──────┬───────┬──┘
                                   │       │
                    ┌──────────────┘       │
                    │                     │
         ┌──────────▼────────────┐  ┌────▼──────────────┐
         │  photo-uploader.js    │  │ editable-fields   │
         │  + guided-tour.js     │  │      .js          │
         └───────────────────────┘  └───────────────────┘
```

---

## Class Reference

### `GuidedTour`

**Constructor Options:**
```javascript
const tour = new GuidedTour({
  steps: [],  // Optional initial steps
});
```

**Methods:**

| Method | Description |
|--------|-------------|
| `addStep(config)` | Add a tour step. Returns `this` for chaining |
| `start()` | Begin the guided tour |
| `showStep(index)` | Jump to specific step index |
| `nextStep()` | Proceed to next step |
| `endTour()` | Close tour and mark as seen |
| `reset()` | Clear "tour seen" flag to allow restart |
| `shouldShow()` | Returns true if tour hasn't been seen |

**Step Configuration:**
```javascript
tour.addStep({
  target: 'selector',           // CSS selector for element to highlight
  title: 'Step Title',           // Heading in bubble
  text: 'Step description',      // Body text in bubble
  padding: 12,                   // Space around spotlight (default: 12)
  borderRadius: 12               // Corner radius (default: 12)
});
```

**Events:**
```javascript
tour.onComplete = () => {
  console.log('Tour finished!');
};
```

**Styling:**
- Colors: Uses CSS variables from the template
- Overlay opacity: Hardcoded at 0.7
- Spotlight effect: Uses `box-shadow` with 9999px radius

---

### `PhotoUploader`

**Constructor Options:**
```javascript
const uploader = new PhotoUploader({
  storageKey: 'my_photos',                    // LocalStorage key
  maxFileSize: 5 * 1024 * 1024,               // 5MB default
  acceptedTypes: ['image/jpeg', 'image/png'] // MIME types
});
```

**Methods:**

| Method | Description |
|--------|-------------|
| `createPhotoZone(containerId, photoId)` | Render photo zone in container |
| `handleFileSelect(file, photoId, zone)` | Process single file upload |
| `removePhoto(photoId, zone)` | Delete photo by ID |
| `getPhoto(photoId)` | Get photo object (with Base64 data) |
| `getAllPhotos()` | Get all photos as object |
| `savePhotos()` | Manually save to LocalStorage |
| `loadPhotos()` | Manually load from LocalStorage |
| `clearAllPhotos()` | Delete all photos |

**Photo Object Structure:**
```javascript
{
  data: "data:image/jpeg;base64,...",  // Base64 encoded image
  timestamp: "2026-05-10T14:30:00Z",   // ISO timestamp
  fileName: "couple.jpg"               // Original filename
}
```

**Events:**
```javascript
uploader.onPhotoChange = (photoId, photoData) => {
  console.log(`Photo ${photoId} changed`);
  // photoData is null if removed, object if added/updated
};
```

**Error Handling:**
- Invalid file type → Shown as error message in DOM
- File too large → Error message with size limit
- LocalStorage quota → Console warning, but UI still works

---

### `EditableFields`

**Constructor Options:**
```javascript
const editor = new EditableFields({
  storageKey: 'my_fields'  // LocalStorage key
});
```

**Methods:**

| Method | Description |
|--------|-------------|
| `makeEditable(element, fieldId, options)` | Activate click-to-edit |
| `enterEditMode(element, fieldId, type, placeholder)` | Manually open edit UI |
| `getField(fieldId)` | Get field value |
| `setField(fieldId, value)` | Set field value |
| `getAllFields()` | Get all fields as object |
| `saveFields()` | Manually save to LocalStorage |
| `loadFields()` | Manually load from LocalStorage |
| `clearAllFields()` | Delete all fields |

**Make Editable Options:**
```javascript
editor.makeEditable(element, 'field_id', {
  type: 'text',                    // 'text', 'textarea', 'date'
  label: 'Descriptive Label',      // Used in tooltip
  placeholder: 'Enter value...'    // Input placeholder
});
```

**Field Object Structure:**
```javascript
{
  value: "Sample text",
  timestamp: "2026-05-10T14:30:00Z"  // When last edited
}
```

**Events:**
```javascript
editor.onFieldChange = (fieldId, value) => {
  console.log(`Field ${fieldId} = ${value}`);
  // Auto-save to backend here if needed
};
```

**Keyboard Shortcuts (when editing):**
- **Enter** (text only) → Save and close
- **Escape** → Cancel edit
- **Outside click** → Auto-save

---

## Integration Examples

### Example 1: Add Tour to New Template

```javascript
const tour = new GuidedTour();

tour.addStep({
  target: 'h1',
  title: 'Welcome!',
  text: 'This is your title'
})
.addStep({
  target: '.gallery',
  title: 'Photo Gallery',
  text: 'Add your photos here'
})
.addStep({
  target: 'form',
  title: 'Contact Form',
  text: 'Fill this out'
});

if (tour.shouldShow()) {
  tour.start();
}
```

### Example 2: Photo Upload with Validation

```javascript
const uploader = new PhotoUploader({
  maxFileSize: 10 * 1024 * 1024  // 10MB
});

uploader.onPhotoChange = (photoId, data) => {
  if (data) {
    // Photo added/updated
    fetch('/api/photos', {
      method: 'POST',
      body: JSON.stringify({
        id: photoId,
        data: data.data,
        fileName: data.fileName
      })
    });
  }
};

uploader.createPhotoZone('hero-container', 'hero');
```

### Example 3: Form Fields

```javascript
const editor = new EditableFields();

const nameField = document.querySelector('h2.name');
editor.makeEditable(nameField, 'groom_name', {
  type: 'text',
  label: 'groom name',
  placeholder: 'Enter groom name'
});

const bioField = document.querySelector('p.bio');
editor.makeEditable(bioField, 'groom_bio', {
  type: 'textarea',
  label: 'bio',
  placeholder: 'Tell your story...'
});

editor.onFieldChange = (id, value) => {
  console.log(`${id}: ${value}`);
};
```

---

## CSS Customization

### Override Tour Colors

```css
:root {
  --tour-overlay-bg: rgba(0, 0, 0, 0.8);      /* Darker overlay */
  --tour-bubble-bg: #1a1a1a;                  /* Custom bubble bg */
  --tour-bubble-text: #fff;                   /* Custom text */
  --tour-highlight: #ffd700;                  /* Highlight color */
}

.tour-bubble {
  /* Override any bubble styles */
  border-radius: 16px;
}

.tour-btn-next {
  /* Override button styles */
  font-size: 14px;
}
```

### Override Photo Zone Styles

```css
.photo-zone {
  /* Custom zone appearance */
  background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
  min-height: 250px;
}

.photo-zone.dragover {
  /* When hovering with file */
  background: linear-gradient(45deg, #ffeb3b, #fdd835);
  box-shadow: 0 0 20px rgba(255, 235, 59, 0.5);
}
```

### Override Edit Field Styles

```css
.editable-input {
  /* Custom input appearance */
  background: #f5f5f5;
  border-bottom: 2px solid #009688;
}

.editable-input:focus {
  /* Custom focus state */
  box-shadow: 0 2px 8px rgba(0, 150, 136, 0.3);
}
```

---

## LocalStorage Management

### Storage Limits

| Browser | Total Limit | Per Domain |
|---------|------------|-----------|
| Chrome | 10MB | 10MB |
| Firefox | 10MB | 10MB |
| Safari | 5MB | 5MB |
| Edge | 10MB | 10MB |
| IE | 10MB | 10MB |

### Storage Schema

```javascript
// wedding_fields
{
  "couple_names": {
    "value": "Evelyn & Julian",
    "timestamp": "2026-05-10T14:30:00Z"
  },
  "story_0": {
    "value": "It began with...",
    "timestamp": "2026-05-10T14:35:00Z"
  }
}

// wedding_photos
{
  "hero_image": {
    "data": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "timestamp": "2026-05-10T14:40:00Z",
    "fileName": "couple.jpg"
  }
}

// guidedTour_seen
"true"
```

---

## Advanced Patterns

### Auto-Save to Backend

```javascript
// Override save method
const originalSave = editable.saveFields.bind(editable);
editable.saveFields = function() {
  originalSave();
  
  // Sync to backend
  fetch('/api/fields', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(this.fields)
  }).catch(e => console.error('Sync failed:', e));
};

editable.onFieldChange = () => {
  editable.saveFields();  // Trigger sync
};
```

### Multi-Template Tour

```javascript
const tourConfig = {
  invitation: [/* steps for invitation page */],
  story: [/* steps for story page */],
  rsvp: [/* steps for rsvp page */]
};

function initTourForPage(page) {
  const tour = new GuidedTour();
  tourConfig[page].forEach(step => tour.addStep(step));
  if (tour.shouldShow()) tour.start();
}

// On page load, detect which page and init
const page = document.body.id || 'invitation';
initTourForPage(page);
```

### Conditional Editable Fields

```javascript
// Only make fields editable for admins
const isAdmin = localStorage.getItem('admin') === 'true';

if (isAdmin) {
  document.querySelectorAll('[data-editable]').forEach(el => {
    editor.makeEditable(el, el.dataset.fieldId);
  });
}
```

---

## Performance Considerations

### Photo Storage
- Base64 encoding increases file size by ~33%
- A 1MB image becomes ~1.33MB in LocalStorage
- Consider compressing images before upload
- For large galleries, use IndexedDB instead

### Tour Animation
- Spotlight calculation happens on every scroll
- High traffic? Consider debouncing scroll handler
- `transition: all 0.5s` can be reduced for faster transitions

### Edit Mode
- Click event listeners on every text element
- For 100+ editable fields, consider event delegation
- Use `data` attributes for identifying fields

---

## Testing

### Browser DevTools Tests

```javascript
// Test tour
tour.start();
tour.nextStep();
tour.endTour();
tour.reset();

// Test photos
photoUploader.createPhotoZone('test-container', 'test-photo');
photoUploader.getPhoto('test-photo');

// Test fields
editable.makeEditable(document.querySelector('p'), 'test-field');
editable.getField('test-field');

// Check storage
console.log(localStorage);
JSON.parse(localStorage.wedding_fields);
```

### Mobile Testing
- Use Chrome DevTools → Device Toolbar (Ctrl+Shift+M)
- Test on actual devices for touch responsiveness
- Check iOS safe areas

---

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| GuidedTour | ✅ | ✅ | ✅ | ✅ |
| PhotoUploader | ✅ | ✅ | ✅ | ✅ |
| EditableFields | ✅ | ✅ | ✅ | ✅ |
| Base64 (photos) | ✅ | ✅ | ✅ | ✅ |
| LocalStorage | ✅ | ✅ | ✅ | ✅ |
| Drag & Drop | ✅ | ✅ | ✅ | ✅ |

**Legacy Support:**
- IE 11: Not supported (no Promise, Proxy)
- IE 10 and earlier: Not supported

---

## Migration Guide

### From Old System to New

```javascript
// OLD WAY
document.querySelector('img').src = userUploadedImage;

// NEW WAY
const uploader = new PhotoUploader();
uploader.createPhotoZone('container', 'photo_id');
```

```javascript
// OLD WAY
element.innerHTML = editedText;

// NEW WAY
const editor = new EditableFields();
editor.makeEditable(element, 'field_id');
```

---

## Troubleshooting

### Console Errors

**"GuidedTour is not defined"**
- Missing `<script src="guided-tour.js"></script>`

**"Target element not found"**
- CSS selector doesn't match any element
- Element not in DOM when tour starts
- Solution: Use more specific selector or delay tour

**"Photos not saving"**
- LocalStorage quota exceeded
- Private/Incognito browsing
- Check `localStorage` is accessible

### Performance Issues

**Slow photo uploads**
- Large file sizes (reduce image dimensions)
- Browser performance on older devices
- Consider compression

**Laggy scrolling during tour**
- High CPU usage
- Reduce animation duration
- Disable other heavy scripts

---

## Future Enhancements

Potential improvements:
- [ ] IndexedDB support for larger storage
- [ ] Backend sync with conflict resolution
- [ ] Collaborative editing with WebSockets
- [ ] Version history for edits
- [ ] Photo cropping/filtering UI
- [ ] Multi-language tour support
- [ ] Analytics tracking (opt-in)
- [ ] Export to PDF

---

**Questions? Check the INTERACTIVE_GUIDE.md for user documentation.**
