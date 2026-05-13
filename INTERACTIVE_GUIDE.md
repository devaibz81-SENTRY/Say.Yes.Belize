# 🎉 Wedding Template Interactive Guide

## Overview

Your Sensual wedding template now includes a **complete guided experience** for first-time users. When visitors arrive for the first time, they'll see an interactive walkthrough with:

- ✨ **Spotlight overlays** that highlight each element and dim the rest of the page
- 💬 **Instruction bubbles** with clear guidance on what to do
- 📸 **Photo upload zones** with drag-and-drop support
- ✏️ **Click-to-edit text** for names, dates, and story content
- 💾 **Automatic LocalStorage saving** so changes persist

---

## 🚀 Quick Start

### For First-Time Visitors
1. Open any Sensual template page (Sensual.html, our-story.html, etc.)
2. The guided tour will **automatically start** after ~800ms
3. Follow the on-screen instructions
4. Click "Next" to proceed through steps, or "Skip" to close

### To Restart the Tour
- Click the **❓ Tour** button (bottom-right of screen)
- Or open browser console and run: `tour.start()`

---

## ✏️ How to Edit Content

### **Click-to-Edit Fields**
Any text with a small gold dot indicator is editable:

1. **Hover** over the text (it will highlight)
2. **Click** to enter edit mode
3. **Type** your new content
4. **Save** or press Enter (for single-line text)
5. Changes are **automatically saved** to LocalStorage

#### Editable Elements:
- 👰 **Couple Names** - Header section
- 📅 **Date & Location** - Below the title
- 💌 **Story Paragraphs** - Both story sections
- 🎯 Any other content marked with edit indicator

---

## 📸 How to Upload Photos

### **Desktop (Drag & Drop)**
1. Find any photo placeholder (they have a dashed border)
2. **Drag your image from your computer** into the zone
3. **Drop** to upload
4. The image appears immediately and is saved

### **Mobile (Tap to Upload)**
1. Tap the photo zone
2. Choose image from your device gallery
3. Image is uploaded and saved

### **Photo Zones in Sensual Template**
- 🖼️ **Hero Image** - Large background image at top
- 🎨 **Gallery Images** - 4-6 photos in the story section
- Additional zones in gallery.html

---

## 💾 Data Storage

### LocalStorage
- **Editable text fields** → `wedding_fields` 
- **Uploaded photos** → `wedding_photos` (as Base64)
- **Tour progress** → `guidedTour_seen`

### Browser Support
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Storage limit: ~5MB per domain
- Data persists across sessions unless browser cache is cleared

---

## 📊 Exporting Your Data

Open the browser console (F12) and run:

```javascript
exportWeddingData()
```

This will log a JSON object with:
- All text field values
- Photo metadata (timestamp, filename)
- Export date

**Note:** Photo data URLs are excluded from export to keep file size small.

---

## 🎨 Customization Options

### Change Tour Text
Edit `sensual-init.js` - each `.addStep()` call controls:
- `title` - Step heading
- `text` - Step description
- `target` - Which element to highlight

### Adjust Photo Upload Limits
Edit `sensual-init.js` initialization:
```javascript
const photoUploader = new PhotoUploader({
  storageKey: 'sensual_photos',
  maxFileSize: 5 * 1024 * 1024, // Change to 10MB, 20MB, etc.
  acceptedTypes: ['image/jpeg', 'image/png', 'image/webp']
});
```

### Make More Fields Editable
In `sensual-init.js`, add:
```javascript
const myElement = document.querySelector('.selector');
editable.makeEditable(myElement, 'field_id', {
  label: 'descriptive label',
  type: 'text', // or 'textarea' or 'date'
  placeholder: 'Type here...'
});
```

---

## 🔧 Troubleshooting

### Tour doesn't start automatically
- Check if `tour.hasSeenTour` is true (tour was already seen)
- Click the "❓ Tour" button to restart
- Or run `tour.reset()` then `tour.start()` in console

### Photos not saving
- Check browser localStorage limit (may be full)
- Try clearing some cached data
- Ensure images are under 5MB

### Edit mode not activating
- Make sure element is properly marked with `editable.makeEditable()`
- Check browser console for errors

### Lost previous edits
- LocalStorage was cleared or browsing in private/incognito mode
- Try exporting data before clearing browser cache

---

## 📱 Mobile Responsiveness

The system is fully responsive:
- **Desktop:** Spotlight is smooth and precise
- **Tablet:** Touch-friendly photo zones with tap-to-upload
- **Mobile:** Simplified tour with larger touch targets
- **iOS Safe Area:** Respects notches and home indicator

---

## 🔗 File Structure

```
Templates/
├── guided-tour.js              # Spotlight + instruction system
├── photo-uploader.js           # Drag-drop + mobile upload
├── editable-fields.js          # Click-to-edit functionality
│
└── Sensual/
    ├── Sensual.html            # Invitation page (hero + story)
    ├── our-story.html          # Extended story page
    ├── gallery.html            # Photo gallery
    ├── rsvp.html               # RSVP form
    └── sensual-init.js         # Initialization & tour setup
```

---

## 🎯 Next Steps

### For Other Templates
To add this system to other templates:

1. Copy these files to the template folder:
   - `guided-tour.js`
   - `photo-uploader.js`
   - `editable-fields.js`

2. Create `[template-name]-init.js` based on `sensual-init.js`

3. Add script references to all HTML pages:
   ```html
   <script src="../guided-tour.js"></script>
   <script src="../photo-uploader.js"></script>
   <script src="../editable-fields.js"></script>
   <script src="[template-name]-init.js"></script>
   ```

4. Customize the tour steps and editable elements

---

## 💡 Pro Tips

1. **Test on Mobile:** Use Chrome DevTools (F12 → Toggle device toolbar)
2. **Check Console:** F12 → Console tab for helpful messages
3. **Clear Data:** Run `editable.clearAllFields()` and `photoUploader.clearAllPhotos()` to reset
4. **Export First:** Before clearing, export your data to keep a backup
5. **Custom Styling:** All components use CSS variables for easy theming

---

## 🆘 Need Help?

- **Tour won't start?** → Click the ❓ button
- **Photos not uploading?** → Check file size and format
- **Edits not saving?** → Clear browser cache carefully
- **Want to customize?** → Edit `sensual-init.js` with your changes

---

**Enjoy your personalized wedding experience! ✨💍**
