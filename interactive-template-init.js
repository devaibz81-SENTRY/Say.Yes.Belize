/**
 * Generic wedding template interactivity.
 * Adds editable copy, photo upload zones, guided tour steps, per-template storage,
 * and a small manual tour button for exported static templates.
 */
(function () {
  function slugify(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/&amp;/g, 'and')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 48) || 'field';
  }

  function closestInteractive(element) {
    return element.closest('button,a,input,select,textarea,label,script,style,svg');
  }

  function visibleText(element) {
    return (element.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function injectTheme(config) {
    var accent = config.accent || '#D4AF37';
    var surface = config.surface || '#2d1b1a';
    var text = config.text || '#f8efe8';
    var soft = config.softAccent || accent;
    var style = document.createElement('style');
    style.id = 'template-interactive-theme';
    style.textContent = [
      '.photo-zone{width:100%;height:100%;min-height:inherit;border-color:' + accent + '66;background:linear-gradient(135deg,' + accent + '18,' + soft + '0d)}',
      '.photo-zone:hover,.photo-zone.dragover{border-color:' + accent + ';background:' + accent + '1f}',
      '.photo-zone-placeholder{color:' + text + '}',
      '.photo-zone-text strong,.tour-bubble-title,.tour-btn,.editable-tooltip{color:' + accent + '}',
      '.photo-zone-kicker{color:' + accent + 'cc}',
      '.tour-bubble{background:rgba(17,14,11,.92)!important;border-color:rgba(248,239,228,.14)!important;color:#f8efe4!important}',
      '.tour-bubble-text{color:rgba(248,239,228,.7)!important}',
      '.tour-bubble-step{color:' + accent + '!important}',
      '.tour-btn,.editable-btn{border-color:' + accent + '66;color:' + accent + '}',
      '.tour-btn-next,.editable-btn-save{background:linear-gradient(135deg,' + accent + ',' + soft + ');color:' + (config.buttonText || '#1f1712') + '}',
      '.editable-field.can-edit:hover{background:' + accent + '14}',
      '.editable-mode-active{outline-color:' + accent + '}',
      '.interactive-tour-button{position:fixed;right:20px;bottom:120px;z-index:8001;min-width:70px;height:44px;padding:0 16px;border-radius:999px;border:1px solid ' + accent + '80;background:' + accent + '24;color:' + accent + ';font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;backdrop-filter:blur(14px);box-shadow:0 8px 28px rgba(0,0,0,.22);transition:transform .2s,background .2s}',
      '.interactive-tour-button:hover{transform:scale(1.08);background:' + accent + '3d}',
      '.photo-experience-section{margin:72px auto;max-width:1180px;padding:0 24px;color:' + text + '}',
      '.photo-experience-header{display:flex;align-items:end;justify-content:space-between;gap:24px;margin-bottom:24px}',
      '.photo-experience-kicker{font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:' + accent + '}',
      '.photo-experience-title{margin:6px 0 0;font-family:Georgia,serif;font-size:clamp(2rem,5vw,4rem);font-style:italic;line-height:1.05;color:inherit}',
      '.photo-experience-note{max-width:310px;font-size:14px;line-height:1.55;opacity:.72;margin:0}',
      '.story-photo-scroll{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(240px,34%);gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;padding:4px 0 18px;margin-bottom:24px}',
      '.story-photo-card{scroll-snap-align:start;min-height:360px;border-radius:18px;overflow:hidden;position:relative}',
      '.story-photo-card:nth-child(2){min-height:430px}',
      '.gallery-photo-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));grid-auto-rows:168px;gap:14px}',
      '.gallery-photo-card{border-radius:16px;overflow:hidden;min-height:168px}',
      '.gallery-photo-card:nth-child(1),.gallery-photo-card:nth-child(6){grid-column:span 2;grid-row:span 2}',
      '.gallery-photo-card:nth-child(4){grid-row:span 2}',
      '@media(max-width:760px){.photo-experience-header{display:block}.photo-experience-note{margin-top:12px}.story-photo-scroll{grid-auto-columns:82%;}.gallery-photo-grid{grid-template-columns:repeat(2,minmax(0,1fr));grid-auto-rows:150px}.gallery-photo-card:nth-child(n){grid-column:auto;grid-row:auto}.gallery-photo-card:nth-child(1){grid-column:span 2;grid-row:span 2}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function clearTemplateStorage(config) {
    var storageKey = config.storageKey || config.slug || 'template';
    [
      storageKey + '_fields',
      storageKey + '_photos',
      storageKey + '_guided_tour_seen',
      'wedding_fields',
      'wedding_photos',
      'guidedTour_seen'
    ].forEach(function (key) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn('Could not clear saved template data:', key, error);
      }
    });
  }

  function applyEditMode(config) {
    var params = new URLSearchParams(window.location.search);
    var editMode = params.has('edit') || params.has('setup') || params.has('guided');
    var freshMode = params.has('fresh') || params.has('reset') || params.get('edit') === 'fresh';

    if (freshMode) {
      clearTemplateStorage(config);
    }

    config.forceGuidedEdit = config.forceGuidedEdit || editMode || freshMode;
  }

  function makeTextEditable(editable, config) {
    var used = new Set();
    var titleCandidates = Array.from(document.querySelectorAll('h1,h2,[class*="hero"],[class*="display"],[class*="headline"]'))
      .filter(function (el) {
        var text = visibleText(el);
        return text.length >= 3 && text.length <= 80 && !closestInteractive(el);
      });

    titleCandidates.slice(0, 3).forEach(function (el, index) {
      var text = visibleText(el);
      var label = /&| and /.test(text) ? 'couple names' : 'headline';
      var id = 'headline_' + index + '_' + slugify(text);
      
      // Only allow editing if it's likely a name or date
      if (text.length < 50 && !used.has(id)) {
        used.add(id);
        editable.makeEditable(el, id, { label: label, placeholder: text || 'Enter names' });
      }
    });

    // Handle Dates specifically
    Array.from(document.querySelectorAll('p,span,h3'))
      .filter(function(el) {
        var text = visibleText(el);
        return /october|june|saturday|2024|2025|september|wedding date/i.test(text);
      })
      .forEach(function(el, index) {
        var text = visibleText(el);
        editable.makeEditable(el, 'wedding_date_' + index, { label: 'wedding date', placeholder: text });
      });
  }

  function makePhotoZones(photoUploader, config) {
    var images = Array.from(document.querySelectorAll('img'))
      .filter(function (img) {
        if (img.closest('.photo-zone,.photo-container,button,a,svg')) return false;
        var rect = img.getBoundingClientRect();
        var className = img.className || '';
        return rect.width >= 70 || rect.height >= 70 || /object-cover|object-contain|absolute|inset-0|w-full|h-full/.test(className);
      })
      .slice(0, config.maxPhotoZones || 18);

    var premiumPhotos = [
      '../images/newlywed-caucasian-young-couple-with-face-to-face-2026-01-09-09-27-56-utc.jpg',
      '../images/young-loving-happy-couple-on-tropical-island-with-2026-01-07-06-31-39-utc.jpg',
      '../images/groom-hugs-bride-in-a-veil-fluttering-in-the-wind-2026-03-17-00-03-13-utc.jpg'
    ];

    images.forEach(function (img, index) {
      var wrapper = document.createElement('div');
      wrapper.id = (config.slug || 'template') + '_photo_container_' + index;
      wrapper.className = img.className || '';
      
      // Preserve layout
      var style = getComputedStyle(img);
      wrapper.style.cssText = img.getAttribute('style') || '';
      wrapper.style.width = '100%';
      wrapper.style.height = '100%';
      wrapper.style.position = style.position === 'static' ? 'relative' : style.position;
      wrapper.style.minHeight = wrapper.style.minHeight || (index === 0 ? '400px' : '180px');
      
      wrapper.setAttribute('data-photo-zone-wrapper', 'true');
      wrapper.dataset.photoKicker = index === 0 ? '✨ Hero Moment' : 'Template Photo';
      wrapper.dataset.photoLabel = index === 0 ? 'Upload your main invitation photo' : 'Replace this image';
      wrapper.dataset.photoHint = index === 0 ? 'Click here to personalize your hero image' : 'Click to browse or drag a photo';
      
      img.replaceWith(wrapper);

      // Pre-populate with premium default if no saved photo exists
      var photoId = (index === 0 ? 'hero_image' : 'gallery_' + index);
      if (!photoUploader.getPhoto(photoId) && index < premiumPhotos.length) {
         photoUploader.photos[photoId] = {
           data: premiumPhotos[index],
           timestamp: new Date().toISOString(),
           isDefault: true
         };
      }
      
      photoUploader.createPhotoZone(wrapper.id, photoId);
    });
  }

  function createPhotoExperience(photoUploader, editable, config) {
    if (document.querySelector('[data-photo-experience="' + config.slug + '"]')) return;

    var main = document.querySelector('main') || document.body;
    var section = document.createElement('section');
    section.className = 'photo-experience-section';
    section.setAttribute('data-photo-experience', config.slug);
    section.innerHTML = [
      '<div class="photo-experience-header">',
      '  <div>',
      '    <div class="photo-experience-kicker">10 photo moments recommended</div>',
      '    <h2 class="photo-experience-title">Build the photo story</h2>',
      '  </div>',
      '  <p class="photo-experience-note">Start with 3 story photos, then add 7 gallery moments so guests can scroll through the weekend like a little wedding album.</p>',
      '</div>',
      '<div class="story-photo-scroll" data-story-photo-scroll></div>',
      '<div class="gallery-photo-grid" data-gallery-photo-grid></div>'
    ].join('');

    main.appendChild(section);

    var storyScroll = section.querySelector('[data-story-photo-scroll]');
    var storyLabels = [
      'Story photo 1: how it began',
      'Story photo 2: the proposal',
      'Story photo 3: the place you love'
    ];
    storyLabels.forEach(function (label, index) {
      var card = document.createElement('div');
      card.className = 'story-photo-card';
      card.id = config.slug + '_story_photo_' + (index + 1);
      card.dataset.photoKicker = 'Story ' + (index + 1) + ' of 3';
      card.dataset.photoLabel = label;
      card.dataset.photoHint = 'Portrait, candid, or meaningful place';
      storyScroll.appendChild(card);
      photoUploader.createPhotoZone(card.id, 'story_experience_' + (index + 1));
    });

    var galleryGrid = section.querySelector('[data-gallery-photo-grid]');
    for (var i = 1; i <= 7; i += 1) {
      var tile = document.createElement('div');
      tile.className = 'gallery-photo-card';
      tile.id = config.slug + '_gallery_photo_' + i;
      tile.dataset.photoKicker = 'Gallery ' + i + ' of 7';
      tile.dataset.photoLabel = 'Gallery moment ' + i;
      tile.dataset.photoHint = i <= 2 ? 'Use a strong horizontal image' : 'Details, guests, venue, food, dance floor';
      galleryGrid.appendChild(tile);
      photoUploader.createPhotoZone(tile.id, 'gallery_experience_' + i);
    }

    editable.makeEditable(section.querySelector('.photo-experience-title'), 'photo_experience_title', {
      label: 'photo section title',
      placeholder: 'Build the photo story'
    });
    editable.makeEditable(section.querySelector('.photo-experience-note'), 'photo_experience_note', {
      label: 'photo section instructions',
      type: 'textarea',
      placeholder: 'Describe the photos guests should see here.'
    });
  }

  function setupTour(tour, config) {
    var seenKey = (config.storageKey || config.slug || 'template') + '_guided_tour_seen';
    tour.hasSeenTour = localStorage.getItem(seenKey) === 'true';
    var originalEnd = tour.endTour.bind(tour);
    tour.endTour = function () {
      originalEnd();
      localStorage.setItem(seenKey, 'true');
    };
    var originalReset = tour.reset.bind(tour);
    tour.reset = function () {
      originalReset();
      localStorage.removeItem(seenKey);
      tour.hasSeenTour = false;
    };

    tour
      .addStep({
        target: 'h1,h2',
        title: 'Start with the essentials',
        text: 'Edit the couple names or main headline now. Save it, then continue to the next setup step.',
        actionLabel: 'Edit names',
        padding: 16,
        borderRadius: 8
      })
      .addStep({
        target: '[data-photo-zone-wrapper],.photo-zone,img',
        title: 'Drop in the first photo',
        text: 'Upload the first image guests will see. A wide couple portrait or venue photo works best.',
        actionLabel: 'Upload photo',
        padding: 18,
        borderRadius: 12
      })
      .addStep({
        target: '[data-photo-experience],.photo-experience-section',
        title: 'Create the scrollable album',
        text: 'Add 3 story photos and 7 gallery photos. You can upload the first album slot now, then keep filling the rest.',
        actionLabel: 'Upload album photo',
        padding: 18,
        borderRadius: 12
      })
      .addStep({
        target: 'p,.editable-field',
        title: 'Make the words yours',
        text: 'Update the story, venue notes, dress code, and RSVP language. Save the text before moving on.',
        actionLabel: 'Edit text',
        padding: 14,
        borderRadius: 8
      })
      .addStep({
        target: 'nav,header,form,main',
        title: 'Finish each page',
        text: 'Move through the template navigation and repeat the same simple flow: text, photos, RSVP details.',
        padding: 14,
        borderRadius: 8
      });

    var restart = document.createElement('button');
    restart.type = 'button';
    restart.className = 'interactive-tour-button';
    restart.setAttribute('aria-label', 'Start guided edit');
    restart.title = 'Start guided edit';
    restart.textContent = 'Edit';
    restart.addEventListener('click', function () {
      if (confirm('Start a fresh guided edit? This clears saved text and uploaded photos in this browser.')) {
        clearTemplateStorage(config);
        var url = new URL(window.location.href);
        url.searchParams.set('edit', '1');
        url.searchParams.set('fresh', '1');
        window.location.href = url.toString();
        return;
      }
      tour.reset();
      tour.start();
    });
    document.body.appendChild(restart);

    if (config.forceGuidedEdit) {
      tour.reset();
      setTimeout(function () { tour.start(); }, config.tourDelay || 700);
    } else if (tour.shouldShow()) {
      setTimeout(function () { tour.start(); }, config.tourDelay || 900);
    }
  }

  window.initializeWeddingTemplate = function initializeWeddingTemplate(config) {
    config = config || {};
    config.slug = config.slug || slugify(config.templateName || document.title || 'template');
    config.storageKey = config.storageKey || config.slug;
    applyEditMode(config);

    if (!window.EditableFields || !window.PhotoUploader || !window.GuidedTour) {
      console.warn('Interactive systems are not loaded for', config.templateName || config.slug);
      return;
    }

    injectTheme(config);
    var editable = new EditableFields({ storageKey: config.storageKey + '_fields' });
    window.editableFields = editable;
    
    var photoUploader = new PhotoUploader({ storageKey: config.storageKey + '_photos' });
    window.photoUploader = photoUploader;
    
    var tour = new GuidedTour();
    window.guidedTour = tour;

    makeTextEditable(editable, config);
    makePhotoZones(photoUploader, config);
    createPhotoExperience(photoUploader, editable, config);
    setupTour(tour, config);

    window.exportWeddingData = function () {
      return {
        template: config.templateName || config.slug,
        fields: editable.getAllFields(),
        photos: Object.keys(photoUploader.getAllPhotos()).map(function (key) {
          var photo = photoUploader.photos[key];
          return { id: key, fileName: photo && photo.fileName, timestamp: photo && photo.timestamp };
        }),
        exportDate: new Date().toISOString()
      };
    };

    console.log((config.templateName || config.slug) + ' initialized with guided tour, editable fields, and photo uploads.');
  };
})();
