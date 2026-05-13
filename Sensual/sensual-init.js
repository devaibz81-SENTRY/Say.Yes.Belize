/**
 * SENSUAL TEMPLATE INITIALIZATION
 * Integrates:
 * - Guided tour with spotlight effects
 * - Photo upload zones
 * - Editable text fields
 * - LocalStorage persistence
 */

document.addEventListener('DOMContentLoaded', function() {
  const setupParams = new URLSearchParams(window.location.search);
  const forceGuidedEdit = setupParams.has('edit') || setupParams.has('setup') || setupParams.has('guided') || setupParams.has('fresh') || setupParams.has('reset');
  const freshGuidedEdit = setupParams.has('fresh') || setupParams.has('reset') || setupParams.get('edit') === 'fresh';

  function clearSensualStorage() {
    ['sensual_fields', 'sensual_photos', 'sensual_guided_tour_seen', 'wedding_fields', 'wedding_photos', 'guidedTour_seen'].forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn('Could not clear saved Sensual data:', key, error);
      }
    });
  }

  if (freshGuidedEdit) {
    clearSensualStorage();
  }

  // Initialize editable fields system
  const editable = new EditableFields({ storageKey: 'sensual_fields' });
  
  // Initialize photo uploader
  const photoUploader = new PhotoUploader({ storageKey: 'sensual_photos' });
  
  // Initialize guided tour
  const tour = new GuidedTour();

  // ──────────────────────────────────────────────────────────
  // MAKE TITLE EDITABLE
  // ──────────────────────────────────────────────────────────
  const titleElement = document.querySelector('h1.gold-foil-text');
  if (titleElement) {
    editable.makeEditable(titleElement, 'couple_names', {
      label: 'couple names',
      placeholder: 'Enter couple names'
    });
  }

  // ──────────────────────────────────────────────────────────
  // MAKE DATE/LOCATION EDITABLE
  // ──────────────────────────────────────────────────────────
  const dateLocationElement = document.querySelector('.italic.text-primary');
  if (dateLocationElement && dateLocationElement.textContent.includes('October')) {
    editable.makeEditable(dateLocationElement, 'date_location', {
      label: 'date and location',
      placeholder: 'Month Day, Year • Location'
    });
  }

  // ──────────────────────────────────────────────────────────
  // MAKE STORY TEXT EDITABLE
  // ──────────────────────────────────────────────────────────
  const storyParagraphs = document.querySelectorAll('.glass-card.p-10 .space-y-6 p');
  if (storyParagraphs.length > 0) {
    storyParagraphs.forEach((para, index) => {
      editable.makeEditable(para, `story_${index}`, {
        label: `story paragraph ${index + 1}`,
        type: 'textarea',
        placeholder: 'Enter your story...'
      });
    });
  }

  // ──────────────────────────────────────────────────────────
  // REPLACE HERO IMAGE WITH PHOTO ZONE
  // ──────────────────────────────────────────────────────────
  const heroImg = document.querySelector('.absolute.inset-0 img');
  if (heroImg && heroImg.parentElement) {
    const heroContainer = heroImg.parentElement;
    const containerId = 'hero-photo-container';
    heroContainer.id = containerId;
    heroContainer.dataset.photoKicker = 'Hero image';
    heroContainer.dataset.photoLabel = 'Upload the first photo guests will see';
    heroContainer.dataset.photoHint = 'Use a wide couple portrait or venue image';
    heroContainer.innerHTML = '';
    
    // Create a styled photo zone for hero
    const heroPhotoZone = document.createElement('div');
    heroPhotoZone.id = 'hero-photo-zone';
    heroPhotoZone.style.cssText = `
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(212, 175, 55, 0.05), rgba(212, 175, 55, 0.02));
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px dashed rgba(212, 175, 55, 0.2);
      cursor: pointer;
    `;
    heroContainer.appendChild(heroPhotoZone);
    
    // Initialize photo zone
    setTimeout(() => {
      photoUploader.createPhotoZone(containerId, 'hero_image');
    }, 100);
  }

  // ──────────────────────────────────────────────────────────
  // REPLACE GALLERY IMAGES WITH PHOTO ZONES
  // ──────────────────────────────────────────────────────────
  const galleryImages = document.querySelectorAll('.grid-cols-2 img, .h-64 img, .h-48 img');
  galleryImages.forEach((img, index) => {
    if (img.parentElement && img.parentElement.className.includes('rounded')) {
      const container = img.parentElement;
      const containerId = `photo-container-${index}`;
      container.id = containerId;
      container.dataset.photoKicker = `Template photo`;
      container.dataset.photoLabel = `Replace this image`;
      container.dataset.photoHint = `Click to browse or drag a photo here`;
      container.innerHTML = '';
      
      photoUploader.createPhotoZone(containerId, `gallery_${index}`);
    }
  });

  // Add a dedicated 10-photo experience: 3 story moments + 7 gallery moments.
  if (!document.querySelector('[data-photo-experience="sensual"]')) {
    const main = document.querySelector('main') || document.body;
    const photoSection = document.createElement('section');
    photoSection.className = 'py-stack-lg px-margin-safe bg-background relative';
    photoSection.setAttribute('data-photo-experience', 'sensual');
    photoSection.innerHTML = `
      <style>
        [data-photo-experience="sensual"] .photo-experience-inner{max-width:1140px;margin:0 auto;color:#ffdad7}
        [data-photo-experience="sensual"] .photo-experience-header{display:flex;align-items:end;justify-content:space-between;gap:24px;margin-bottom:24px}
        [data-photo-experience="sensual"] .photo-experience-kicker{font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#D4AF37}
        [data-photo-experience="sensual"] .photo-experience-title{margin:6px 0 0;font-family:'Noto Serif',serif;font-size:clamp(2rem,5vw,4rem);font-style:italic;line-height:1.05;color:#D4AF37}
        [data-photo-experience="sensual"] .photo-experience-note{max-width:330px;font-size:14px;line-height:1.55;color:#dcc0bd;margin:0}
        [data-photo-experience="sensual"] .story-photo-scroll{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(240px,34%);gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;padding:4px 0 18px;margin-bottom:24px}
        [data-photo-experience="sensual"] .story-photo-card{scroll-snap-align:start;min-height:360px;border-radius:18px;overflow:hidden;position:relative}
        [data-photo-experience="sensual"] .story-photo-card:nth-child(2){min-height:430px}
        [data-photo-experience="sensual"] .gallery-photo-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));grid-auto-rows:168px;gap:14px}
        [data-photo-experience="sensual"] .gallery-photo-card{border-radius:16px;overflow:hidden;min-height:168px}
        [data-photo-experience="sensual"] .gallery-photo-card:nth-child(1),[data-photo-experience="sensual"] .gallery-photo-card:nth-child(6){grid-column:span 2;grid-row:span 2}
        [data-photo-experience="sensual"] .gallery-photo-card:nth-child(4){grid-row:span 2}
        @media(max-width:760px){
          [data-photo-experience="sensual"] .photo-experience-header{display:block}
          [data-photo-experience="sensual"] .photo-experience-note{margin-top:12px}
          [data-photo-experience="sensual"] .story-photo-scroll{grid-auto-columns:82%}
          [data-photo-experience="sensual"] .gallery-photo-grid{grid-template-columns:repeat(2,minmax(0,1fr));grid-auto-rows:150px}
          [data-photo-experience="sensual"] .gallery-photo-card:nth-child(n){grid-column:auto;grid-row:auto}
          [data-photo-experience="sensual"] .gallery-photo-card:nth-child(1){grid-column:span 2;grid-row:span 2}
        }
      </style>
      <div class="photo-experience-inner">
        <div class="photo-experience-header">
          <div>
            <div class="photo-experience-kicker">10 photo moments recommended</div>
            <h2 class="photo-experience-title">Build the photo story</h2>
          </div>
          <p class="photo-experience-note">Start with 3 story photos, then add 7 gallery moments so guests can scroll through the weekend like a little wedding album.</p>
        </div>
        <div class="story-photo-scroll" data-story-photo-scroll></div>
        <div class="gallery-photo-grid" data-gallery-photo-grid></div>
      </div>
    `;
    main.appendChild(photoSection);

    const storyScroll = photoSection.querySelector('[data-story-photo-scroll]');
    ['how it began', 'the proposal', 'the place you love'].forEach((label, index) => {
      const card = document.createElement('div');
      card.className = 'story-photo-card';
      card.id = `sensual_story_photo_${index + 1}`;
      card.dataset.photoKicker = `Story ${index + 1} of 3`;
      card.dataset.photoLabel = `Story photo ${index + 1}: ${label}`;
      card.dataset.photoHint = 'Portrait, candid, or meaningful place';
      storyScroll.appendChild(card);
      photoUploader.createPhotoZone(card.id, `story_experience_${index + 1}`);
    });

    const galleryGrid = photoSection.querySelector('[data-gallery-photo-grid]');
    for (let i = 1; i <= 7; i += 1) {
      const tile = document.createElement('div');
      tile.className = 'gallery-photo-card';
      tile.id = `sensual_gallery_photo_${i}`;
      tile.dataset.photoKicker = `Gallery ${i} of 7`;
      tile.dataset.photoLabel = `Gallery moment ${i}`;
      tile.dataset.photoHint = i <= 2 ? 'Use a strong horizontal image' : 'Details, guests, venue, food, dance floor';
      galleryGrid.appendChild(tile);
      photoUploader.createPhotoZone(tile.id, `gallery_experience_${i}`);
    }
  }

  // ──────────────────────────────────────────────────────────
  // SETUP GUIDED TOUR STEPS
  // ──────────────────────────────────────────────────────────
  tour.addStep({
    target: 'h1.gold-foil-text',
    title: 'Start with the essentials',
    text: 'Edit the couple names or main headline now. Save it, then continue to the next setup step.',
    actionLabel: 'Edit names',
    padding: 16,
    borderRadius: 8
  })
  .addStep({
    target: '.italic.text-primary',
    title: 'Set the date and place',
    text: 'Update the wedding date, city, and venue details so guests know exactly where to be.',
    actionLabel: 'Edit date',
    padding: 16,
    borderRadius: 8
  })
  .addStep({
    target: '#hero-photo-zone, .absolute.inset-0',
    title: 'Drop in the first photo',
    text: 'Upload the first image guests will see. A wide couple portrait or venue photo works best.',
    actionLabel: 'Upload photo',
    padding: 20,
    borderRadius: 12
  })
  .addStep({
    target: '.space-y-6',
    title: 'Make the words yours',
    text: 'Update the story, venue notes, dress code, and RSVP language. Save the text before moving on.',
    actionLabel: 'Edit text',
    padding: 16,
    borderRadius: 8
  })
  .addStep({
    target: '[data-photo-experience="sensual"]',
    title: 'Create the scrollable album',
    text: 'Add 3 story photos and 7 gallery photos. You can upload the first album slot now, then keep filling the rest.',
    actionLabel: 'Upload album photo',
    padding: 20,
    borderRadius: 12
  })
  .addStep({
    target: '.liquid-gold-btn',
    title: 'Finish each page',
    text: 'Move through the template navigation and repeat the same simple flow: text, photos, RSVP details.',
    padding: 16,
    borderRadius: 8
  });
  // AUTO-START TOUR FOR FIRST-TIME VISITORS
  // ──────────────────────────────────────────────────────────
  if (forceGuidedEdit) {
    tour.reset();
    setTimeout(() => {
      tour.start();
    }, 700);
  } else if (tour.shouldShow()) {
    setTimeout(() => {
      tour.start();
    }, 800);
  }

  // ──────────────────────────────────────────────────────────
  // CALLBACK HANDLERS
  // ──────────────────────────────────────────────────────────
  editable.onFieldChange = (fieldId, value) => {
    console.log(`Field "${fieldId}" updated:`, value);
    // You could trigger autosave to backend here
  };

  photoUploader.onPhotoChange = (photoId, photoData) => {
    console.log(`Photo "${photoId}" updated`, photoData ? 'added' : 'removed');
    // You could trigger autosave to backend here
  };

  // ──────────────────────────────────────────────────────────
  // OPTIONAL: ADD MANUAL TOUR RESTART BUTTON
  // ──────────────────────────────────────────────────────────
  const tourRestartBtn = document.createElement('button');
  tourRestartBtn.innerHTML = '❓ Tour';
  tourRestartBtn.style.cssText = `
    position: fixed;
    bottom: 120px;
    right: 20px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(212, 175, 55, 0.2);
    border: 1px solid rgba(212, 175, 55, 0.4);
    color: #D4AF37;
    font-size: 20px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 8001;
    font-weight: bold;
  `;
  tourRestartBtn.textContent = 'Edit';
  Object.assign(tourRestartBtn.style, {
    width: 'auto',
    minWidth: '70px',
    height: '44px',
    padding: '0 16px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '800',
    letterSpacing: '0.12em',
    textTransform: 'uppercase'
  });
  tourRestartBtn.addEventListener('mouseover', function() {
    this.style.background = 'rgba(212, 175, 55, 0.4)';
    this.style.transform = 'scale(1.1)';
  });
  tourRestartBtn.addEventListener('mouseout', function() {
    this.style.background = 'rgba(212, 175, 55, 0.2)';
    this.style.transform = 'scale(1)';
  });
  tourRestartBtn.addEventListener('click', function() {
    if (confirm('Start a fresh guided edit? This clears saved text and uploaded photos in this browser.')) {
      clearSensualStorage();
      const url = new URL(window.location.href);
      url.searchParams.set('edit', '1');
      url.searchParams.set('fresh', '1');
      window.location.href = url.toString();
      return;
    }
    tour.reset();
    tour.start();
  });
  document.body.appendChild(tourRestartBtn);

  // ──────────────────────────────────────────────────────────
  // DATA EXPORT/BACKUP FUNCTION
  // ──────────────────────────────────────────────────────────
  window.exportWeddingData = function() {
    const data = {
      fields: editable.getAllFields(),
      photos: Object.keys(photoUploader.getAllPhotos()).reduce((acc, key) => {
        acc[key] = {
          timestamp: photoUploader.photos[key].timestamp,
          fileName: photoUploader.photos[key].fileName
          // Don't include the large data URL in export
        };
        return acc;
      }, {}),
      exportDate: new Date().toISOString()
    };
    console.log('Wedding data export:', data);
    return data;
  };

  console.log('✨ Sensual template initialized with guided tour, editable fields, and photo upload!');
  console.log('Use tour.start() to restart the tour, or exportWeddingData() to export your data.');
});
