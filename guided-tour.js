/**
 * GUIDED TOUR SYSTEM
 * Creates an interactive first-time user experience with:
 * - Spotlight overlay that darkens everything except target element
 * - Instruction bubbles with smart positioning
 * - Step-by-step progression through template
 * - LocalStorage persistence
 */

class GuidedTour {
  constructor(options = {}) {
    this.steps = options.steps || [];
    this.currentStep = 0;
    this.isActive = false;
    this.hasSeenTour = localStorage.getItem('guidedTour_seen') === 'true';
    
    // Create tour UI container
    this.createTourUI();
  }

  createTourUI() {
    // Overlay container
    const overlay = document.createElement('div');
    overlay.id = 'tour-overlay';
    overlay.className = 'tour-overlay';
    this.overlay = overlay;

    // Spotlight (the "hole" in the overlay)
    const spotlight = document.createElement('div');
    spotlight.id = 'tour-spotlight';
    spotlight.className = 'tour-spotlight';
    this.spotlight = spotlight;

    // Instruction bubble
    const bubble = document.createElement('div');
    bubble.id = 'tour-bubble';
    bubble.className = 'tour-bubble';
    bubble.innerHTML = `
      <div class="tour-bubble-content">
        <h3 class="tour-bubble-title">Welcome!</h3>
        <p class="tour-bubble-text">A quick setup guide will help you edit this template while you move through it.</p>
        <div class="tour-bubble-actions">
          <button class="tour-btn tour-btn-skip-all">Skip all</button>
          <button class="tour-btn tour-btn-next">Start setup</button>
        </div>
      </div>
    `;
    this.bubble = bubble;

    // Add to DOM
    document.body.appendChild(overlay);
    document.body.appendChild(spotlight);
    document.body.appendChild(bubble);

    // Add styles
    if (!document.getElementById('tour-styles')) {
      this.injectStyles();
    }

    // Bind events
    this.bubble.querySelector('.tour-btn-skip-all').addEventListener('click', () => this.endTour());
    this.bubble.querySelector('.tour-btn-next').addEventListener('click', () => this.nextStep());
  }

  injectStyles() {
    const style = document.createElement('style');
    style.id = 'tour-styles';
    style.textContent = `
      /* Tour Overlay */
      .tour-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.48);
        z-index: 9998;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.4s ease;
      }

      .tour-overlay.active {
        opacity: 1;
        pointer-events: none;
      }

      /* Spotlight */
      .tour-spotlight {
        position: fixed;
        top: 0;
        left: 0;
        width: 100px;
        height: 100px;
        border-radius: 18px;
        border: 1px solid rgba(246, 234, 219, 0.36);
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.48), 0 18px 60px rgba(0, 0, 0, 0.34);
        z-index: 9999;
        pointer-events: none;
        opacity: 0;
        transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
      }

      .tour-spotlight.active {
        opacity: 1;
      }

      /* Tour Bubble */
      .tour-bubble {
        position: fixed;
        right: 24px;
        bottom: 24px;
        width: min(420px, calc(100vw - 32px));
        background: rgba(17, 14, 11, 0.9);
        border: 1px solid rgba(246, 234, 219, 0.12);
        border-radius: 22px;
        padding: 22px;
        max-width: 420px;
        z-index: 10000;
        opacity: 0;
        pointer-events: none;
        transition: all 0.4s ease;
        box-shadow: 0 28px 90px rgba(0, 0, 0, 0.48), 0 1px 0 rgba(255, 255, 255, 0.08) inset;
        backdrop-filter: blur(28px) saturate(150%);
      }

      .tour-bubble.active {
        opacity: 1;
        pointer-events: auto;
      }

      .tour-bubble-content {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .tour-bubble-title {
        font-family: 'Noto Serif', serif;
        font-size: 22px;
        font-weight: 500;
        color: #f8efe4;
        margin: 0;
        line-height: 1.25;
      }

      .tour-bubble-text {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 14px;
        color: rgba(248, 239, 228, 0.7);
        margin: 0;
        line-height: 1.55;
      }

      .tour-bubble-progress {
        display: flex;
        gap: 4px;
        justify-content: center;
      }

      .tour-bubble-step {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: rgba(198, 161, 93, 0.92);
      }

      .tour-bubble-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: rgba(248, 239, 228, 0.2);
        transition: all 0.2s;
      }

      .tour-bubble-dot.active {
        background: #c6a15d;
        width: 18px;
        border-radius: 3px;
      }

      .tour-bubble-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 12px;
      }

      .tour-btn {
        flex: 1;
        min-height: 44px;
        padding: 11px 16px;
        border: 1px solid rgba(248, 239, 228, 0.14);
        background: rgba(255, 255, 255, 0.055);
        color: rgba(248, 239, 228, 0.82);
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.08em;
        border-radius: 999px;
        cursor: pointer;
        transition: all 0.3s;
        text-transform: uppercase;
      }

      .tour-btn:hover {
        background: rgba(248, 239, 228, 0.1);
        border-color: rgba(248, 239, 228, 0.28);
      }

      .tour-btn-next {
        background: #f8efe4;
        border-color: #f8efe4;
        color: #14100c;
      }

      .tour-btn-next:hover {
        filter: brightness(1.1);
      }

      .tour-btn-skip {
        background: transparent;
      }

      .tour-btn-skip-all,
      .tour-btn-skip-step {
        background: transparent;
      }

      .tour-btn-action {
        flex-basis: 100%;
        background: rgba(198, 161, 93, 0.16);
        border-color: rgba(198, 161, 93, 0.46);
        color: #f4d8a2;
      }

      /* Highlight arrow pointing to element */
      .tour-pointer {
        position: absolute;
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 8px 8px 0 8px;
        border-color: #D4AF37 transparent transparent transparent;
        opacity: 0;
        animation: tourPointerBlink 1.5s ease-in-out infinite;
      }

      @keyframes tourPointerBlink {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }

      /* Mobile responsive */
      @media (max-width: 640px) {
        .tour-bubble {
          max-width: 85vw;
          padding: 20px 24px;
          right: 12px;
          bottom: 12px;
        }

        .tour-bubble-title {
          font-size: 18px;
        }

        .tour-bubble-text {
          font-size: 13px;
        }

        .tour-bubble-actions {
          gap: 8px;
        }

        .tour-btn {
          flex-basis: calc(50% - 4px);
          padding-left: 10px;
          padding-right: 10px;
        }

        .tour-btn-action {
          flex-basis: 100%;
        }
      }
    `;
    document.head.appendChild(style);
  }

  addStep(stepConfig) {
    this.steps.push(stepConfig);
    return this;
  }

  start() {
    if (this.steps.length === 0) {
      console.warn('GuidedTour: No steps defined');
      return;
    }

    this.isActive = true;
    this.currentStep = 0;
    this.overlay.classList.add('active');
    this.showStep(0);
  }

  showStep(index) {
    if (index < 0 || index >= this.steps.length) {
      this.endTour();
      return;
    }

    this.currentStep = index;
    const step = this.steps[index];

    // Get target element
    const targetElement = document.querySelector(step.target);
    if (!targetElement) {
      console.warn(`GuidedTour: Target element not found: ${step.target}`);
      this.nextStep();
      return;
    }

    // Scroll into view
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Update spotlight
    setTimeout(() => {
      const rect = targetElement.getBoundingClientRect();
      const padding = step.padding || 12;
      const borderRadius = step.borderRadius || 12;

      this.spotlight.style.top = (rect.top - padding) + 'px';
      this.spotlight.style.left = (rect.left - padding) + 'px';
      this.spotlight.style.width = (rect.width + padding * 2) + 'px';
      this.spotlight.style.height = (rect.height + padding * 2) + 'px';
      this.spotlight.style.borderRadius = borderRadius + 'px';
      this.spotlight.classList.add('active');

      // Update bubble
      this.updateBubble(step, rect, targetElement);
    }, 300);
  }

  getTargetElement(step) {
    return document.querySelector(step.target);
  }

  getEditableTarget(targetElement) {
    if (!targetElement) return null;
    if (targetElement.classList && targetElement.classList.contains('editable-field')) {
      return targetElement;
    }
    return targetElement.querySelector ? targetElement.querySelector('.editable-field') : null;
  }

  getPhotoTarget(targetElement) {
    if (!targetElement) return null;
    if (targetElement.classList && targetElement.classList.contains('photo-zone')) {
      return targetElement;
    }
    return targetElement.querySelector ? targetElement.querySelector('.photo-zone') : null;
  }

  getActionLabel(step, targetElement) {
    if (step.actionLabel) return step.actionLabel;
    if (this.getPhotoTarget(targetElement)) return 'Upload photo';
    if (this.getEditableTarget(targetElement)) return 'Edit this';
    return '';
  }

  activateCurrentTarget() {
    const step = this.steps[this.currentStep];
    if (!step) return;

    const targetElement = this.getTargetElement(step);
    const photoZone = this.getPhotoTarget(targetElement);
    if (photoZone) {
      const input = photoZone.querySelector('.upload-input');
      if (input) {
        input.click();
        return;
      }
      photoZone.click();
      return;
    }

    const editableField = this.getEditableTarget(targetElement);
    if (editableField) {
      editableField.click();
      return;
    }

    if (targetElement && typeof targetElement.click === 'function') {
      targetElement.click();
    }
  }

  skipStep() {
    this.nextStep();
  }

  updateBubble(step, targetRect, targetElement) {
    const bubble = this.bubble.querySelector('.tour-bubble-content');
    const actionLabel = this.getActionLabel(step, targetElement);
    const actionButton = actionLabel
      ? `<button class="tour-btn tour-btn-action">${actionLabel}</button>`
      : '';
    
    let buttonsHTML = `
      ${actionButton}
      <button class="tour-btn tour-btn-skip-step">Skip step</button>
      <button class="tour-btn tour-btn-skip-all">Skip all</button>
    `;

    if (this.currentStep < this.steps.length - 1) {
      buttonsHTML += `<button class="tour-btn tour-btn-next">Next</button>`;
    } else {
      buttonsHTML += `<button class="tour-btn tour-btn-next">Done!</button>`;
    }

    const progressDots = this.steps
      .map((_, i) => `<div class="tour-bubble-dot ${i === this.currentStep ? 'active' : ''}"></div>`)
      .join('');

    bubble.innerHTML = `
      <div class="tour-bubble-step">Step ${this.currentStep + 1} of ${this.steps.length}</div>
      <h3 class="tour-bubble-title">${step.title}</h3>
      <p class="tour-bubble-text">${step.text}</p>
      <div class="tour-bubble-progress">${progressDots}</div>
      <div class="tour-bubble-actions">
        ${buttonsHTML}
      </div>
    `;

    // Re-bind button events
    const skipAllBtn = this.bubble.querySelector('.tour-btn-skip-all');
    const skipStepBtn = this.bubble.querySelector('.tour-btn-skip-step');
    const actionBtn = this.bubble.querySelector('.tour-btn-action');
    const nextBtn = this.bubble.querySelector('.tour-btn-next');

    skipAllBtn.addEventListener('click', () => this.endTour());
    skipStepBtn.addEventListener('click', () => this.skipStep());
    if (actionBtn) {
      actionBtn.addEventListener('click', () => this.activateCurrentTarget());
    }
    nextBtn.addEventListener('click', () => this.nextStep());

    // Position bubble
    this.bubble.classList.add('active');
  }

  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.showStep(this.currentStep + 1);
    } else {
      this.endTour();
    }
  }

  endTour() {
    this.isActive = false;
    this.overlay.classList.remove('active');
    this.spotlight.classList.remove('active');
    this.bubble.classList.remove('active');
    localStorage.setItem('guidedTour_seen', 'true');
    
    if (this.onComplete) {
      this.onComplete();
    }
  }

  reset() {
    localStorage.removeItem('guidedTour_seen');
    this.hasSeenTour = false;
  }

  shouldShow() {
    return !this.hasSeenTour;
  }
}

// Initialize and export
window.GuidedTour = GuidedTour;
