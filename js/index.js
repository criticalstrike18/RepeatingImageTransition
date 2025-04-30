import gsap from 'gsap';
import { preloadImages } from './utils.js';

// Configuration object for animation settings
const config = {
  clipPathDirection: 'top-bottom', // Direction of clip-path animation ('top-bottom', 'bottom-top', 'left-right', 'right-left')
  autoAdjustHorizontalClipPath: true, // Automatically flip horizontal clip-path direction based on panel side
  steps: 6, // Number of mover elements generated between grid item and panel
  stepDuration: 0.35, // Duration (in seconds) for each animation step
  stepInterval: 0.05, // Delay between each mover's animation start
  moverPauseBeforeExit: 0.14, // Pause before mover elements exit after entering
  rotationRange: 0, // Maximum random rotation applied to each mover's Z-axis (tilt left/right)
  wobbleStrength: 0, // Maximum random positional wobble (in pixels) applied horizontally/vertically to each mover path
  panelRevealEase: 'sine.inOut', // Easing function for panel reveal animation
  gridItemEase: 'sine', // Easing function for grid item exit animation
  moverEnterEase: 'sine.in', // Easing function for mover entering animation
  moverExitEase: 'sine', // Easing function for mover exit animation
  panelRevealDurationFactor: 2, // Multiplier to adjust panel reveal animation duration
  clickedItemDurationFactor: 2, // Multiplier to adjust clicked grid item animation duration
  gridItemStaggerFactor: 0.3, // Max delay factor when staggering grid item animations
  moverBlendMode: false, // Optional CSS blend mode for mover elements (false = no blend mode)
  pathMotion: 'linear', // Type of path movement ('linear' or 'sine')
  sineAmplitude: 50, // Amplitude of sine wave for pathMotion 'sine'
  sineFrequency: Math.PI, // Frequency of sine wave for pathMotion 'sine'
};

// Create a deep copy of the initial global config
const originalConfig = { ...config };

// Linear interpolation helper
const lerp = (a, b, t) => a + (b - a) * t;

// Cached DOM elements
const grid = document.querySelector('.grid'); // Main grid container
const frame = document.querySelectorAll(['.frame', '.heading']); // Frame overlays
const panel = document.querySelector('.panel'); // Panel container
const panelContent = panel?.querySelector('.panel__content'); // Panel content

let isAnimating = false; // Prevents overlapping animations
let isPanelOpen = false; // Tracks if the panel is currently open
let currentItem = null; // Reference to the clicked item

// Initialize event listeners
const init = () => {
  // If no panel or grid, don't initialize
  if (!panel || !grid) return;

  // Attach click handlers to all grid items
  document.querySelectorAll('.grid__item').forEach((item) => {
    item.addEventListener('click', () => onGridItemClick(item));
  });

  // Attach click handler to the panel close link
  panelContent
    ?.querySelector('.panel__close')
    ?.addEventListener('click', (e) => {
      e.preventDefault();
      resetView();
    });

  // Handle Escape key to close the panel
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isPanelOpen && !isAnimating) {
      resetView();
    }
  });
};

// Extracts per-item configuration overrides from HTML data attributes
const extractItemConfigOverrides = (item) => {
  const overrides = {};

  if (item.dataset.clipPathDirection)
    overrides.clipPathDirection = item.dataset.clipPathDirection;
  if (item.dataset.steps) overrides.steps = parseInt(item.dataset.steps);
  if (item.dataset.stepDuration)
    overrides.stepDuration = parseFloat(item.dataset.stepDuration);
  if (item.dataset.stepInterval)
    overrides.stepInterval = parseFloat(item.dataset.stepInterval);
  if (item.dataset.rotationRange)
    overrides.rotationRange = parseFloat(item.dataset.rotationRange);
  if (item.dataset.wobbleStrength)
    overrides.wobbleStrength = parseFloat(item.dataset.wobbleStrength);
  if (item.dataset.moverPauseBeforeExit)
    overrides.moverPauseBeforeExit = parseFloat(
      item.dataset.moverPauseBeforeExit
    );
  if (item.dataset.panelRevealEase)
    overrides.panelRevealEase = item.dataset.panelRevealEase;
  if (item.dataset.gridItemEase)
    overrides.gridItemEase = item.dataset.gridItemEase;
  if (item.dataset.moverEnterEase)
    overrides.moverEnterEase = item.dataset.moverEnterEase;
  if (item.dataset.moverExitEase)
    overrides.moverExitEase = item.dataset.moverExitEase;
  if (item.dataset.panelRevealDurationFactor)
    overrides.panelRevealDurationFactor = parseFloat(
      item.dataset.panelRevealDurationFactor
    );
  if (item.dataset.clickedItemDurationFactor)
    overrides.clickedItemDurationFactor = parseFloat(
      item.dataset.clickedItemDurationFactor
    );
  if (item.dataset.gridItemStaggerFactor)
    overrides.gridItemStaggerFactor = parseFloat(
      item.dataset.gridItemStaggerFactor
    );
  if (item.dataset.moverBlendMode)
    overrides.moverBlendMode = item.dataset.moverBlendMode;
  if (item.dataset.pathMotion) overrides.pathMotion = item.dataset.pathMotion;
  if (item.dataset.sineAmplitude)
    overrides.sineAmplitude = parseFloat(item.dataset.sineAmplitude);
  if (item.dataset.sineFrequency)
    overrides.sineFrequency = parseFloat(item.dataset.sineFrequency);

  return overrides;
};

// Animate hiding the frame overlay
const hideFrame = () => {
  if (!frame || !frame.length) return;
  
  gsap.to(frame, {
    opacity: 0,
    duration: 0.5,
    ease: 'sine.inOut',
    pointerEvents: 'none',
  });
};

// Animate showing the frame overlay
const showFrame = () => {
  if (!frame || !frame.length) return;
  
  gsap.to(frame, {
    opacity: 1,
    duration: 0.5,
    ease: 'sine.inOut',
    pointerEvents: 'auto',
  });
};

// Position the panel based on which side the item was clicked
const positionPanelBasedOnClick = (clickedItem) => {
  const centerX = getElementCenter(clickedItem).x;
  const windowHalf = window.innerWidth / 2;

  const isLeftSide = centerX < windowHalf;

  if (isLeftSide) {
    panel.classList.add('panel--right');
  } else {
    panel.classList.remove('panel--right');
  }

  // Adjust clip path direction if enabled
  if (config.autoAdjustHorizontalClipPath) {
    if (
      config.clipPathDirection === 'left-right' ||
      config.clipPathDirection === 'right-left'
    ) {
      config.clipPathDirection = isLeftSide ? 'left-right' : 'right-left';
    }
  }
};

// Get appropriate clip-paths depending on animation direction
const getClipPathsForDirection = (direction) => {
  switch (direction) {
    case 'bottom-top':
      return {
        from: 'inset(0% 0% 100% 0%)',
        reveal: 'inset(0% 0% 0% 0%)',
        hide: 'inset(100% 0% 0% 0%)',
      };
    case 'left-right':
      return {
        from: 'inset(0% 100% 0% 0%)',
        reveal: 'inset(0% 0% 0% 0%)',
        hide: 'inset(0% 0% 0% 100%)',
      };
    case 'right-left':
      return {
        from: 'inset(0% 0% 0% 100%)',
        reveal: 'inset(0% 0% 0% 0%)',
        hide: 'inset(0% 100% 0% 0%)',
      };
    case 'top-bottom':
    default:
      return {
        from: 'inset(100% 0% 0% 0%)',
        reveal: 'inset(0% 0% 0% 0%)',
        hide: 'inset(0% 0% 100% 0%)',
      };
  }
};

// Handle click on a grid item and trigger the full transition
const onGridItemClick = (item) => {
  if (isAnimating || !panel) return;
  isAnimating = true;
  currentItem = item;

  // Merge overrides into global config temporarily
  const overrides = extractItemConfigOverrides(item);
  Object.assign(config, overrides);

  // Position the panel, with updated config
  positionPanelBasedOnClick(item);

  const { imgURL, title, desc } = extractItemData(item);
  setPanelContent({ imgURL, title, desc });

  const allItems = document.querySelectorAll('.grid__item');
  const delays = computeStaggerDelays(item, allItems);
  animateGridItems(allItems, item, delays);
  animateTransition(
    item.querySelector('.grid__item-image'),
    panel.querySelector('.panel__img'),
    imgURL
  );
};

// Extract image URL and caption text from a grid item
const extractItemData = (item) => {
  const imgDiv = item.querySelector('.grid__item-image');
  const caption = item.querySelector('figcaption');
  
  const h3 = caption?.querySelector('h3');
  const p = caption?.querySelector('p');
  
  return {
    imgURL: imgDiv?.style.backgroundImage || '',
    title: h3?.textContent || '',
    desc: p?.textContent || '',
  };
};

// Set the panel's background and text based on clicked item
const setPanelContent = ({ imgURL, title, desc }) => {
  if (!panel) return;
  
  const panelImg = panel.querySelector('.panel__img');
  const panelTitle = panel.querySelector('h3');
  const panelDesc = panel.querySelector('p');
  
  if (panelImg) panelImg.style.backgroundImage = imgURL;
  if (panelTitle) panelTitle.textContent = title;
  if (panelDesc) panelDesc.textContent = desc;
};

// Calculate the center position of an element
const getElementCenter = (el) => {
  const rect = el.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
};

// Compute stagger delays for grid item exit animations
const computeStaggerDelays = (clickedItem, items) => {
  const baseCenter = getElementCenter(clickedItem);
  const distances = Array.from(items).map((el) => {
    const center = getElementCenter(el);
    return Math.hypot(center.x - baseCenter.x, center.y - baseCenter.y);
  });
  const max = Math.max(...distances);
  return distances.map((d) => (d / max) * config.gridItemStaggerFactor);
};

// Animate all grid items fading/scaling out, except clicked one
const animateGridItems = (items, clickedItem, delays) => {
  const clipPaths = getClipPathsForDirection(config.clipPathDirection);

  gsap.to(items, {
    opacity: 0,
    scale: (i, el) => (el === clickedItem ? 1 : 0.8),
    duration: (i, el) =>
      el === clickedItem
        ? config.stepDuration * config.clickedItemDurationFactor
        : 0.3,
    ease: config.gridItemEase,
    clipPath: (i, el) => (el === clickedItem ? clipPaths.from : 'none'),
    delay: (i) => delays[i],
  });
};

// Animate the full transition (movers + panel reveal)
const animateTransition = (startEl, endEl, imgURL) => {
  if (!startEl || !endEl) return;
  
  hideFrame();

  // Generate path between start and end
  const path = generateMotionPath(
    startEl.getBoundingClientRect(),
    endEl.getBoundingClientRect(),
    config.steps
  );
  const fragment = document.createDocumentFragment();
  const clipPaths = getClipPathsForDirection(config.clipPathDirection);

  // Create and animate movers
  path.forEach((step, index) => {
    const mover = document.createElement('div');
    mover.className = 'mover';
    gsap.set(mover, createMoverStyle(step, index, imgURL));
    fragment.appendChild(mover);

    const delay = index * config.stepInterval;
    gsap
      .timeline({ delay })
      .fromTo(
        mover,
        { opacity: 0.4, clipPath: clipPaths.hide },
        {
          opacity: 1,
          clipPath: clipPaths.reveal,
          duration: config.stepDuration,
          ease: config.moverEnterEase,
        }
      )
      .to(
        mover,
        {
          clipPath: clipPaths.from,
          duration: config.stepDuration,
          ease: config.moverExitEase,
        },
        `+=${config.moverPauseBeforeExit}`
      );
  });

  // Insert all movers at once
  grid.parentNode.insertBefore(fragment, grid.nextSibling);

  // Schedule mover cleanup and panel reveal
  scheduleCleanup(document.querySelectorAll('.mover'));
  revealPanel(endEl);
};

// Create style for each mover element
const createMoverStyle = (step, index, imgURL) => {
  const style = {
    backgroundImage: imgURL,
    position: 'fixed',
    left: step.left + 'px',
    top: step.top + 'px',
    width: step.width + 'px',
    height: step.height + 'px',
    clipPath: getClipPathsForDirection(config.clipPathDirection).from,
    zIndex: 1000 + index,
    backgroundPosition: '50% 50%',
    rotationZ: gsap.utils.random(-config.rotationRange, config.rotationRange),
  };
  if (config.moverBlendMode) style.mixBlendMode = config.moverBlendMode;
  return style;
};

// Remove movers after their animation ends
const scheduleCleanup = (movers) => {
  const cleanupDelay =
    config.steps * config.stepInterval +
    config.stepDuration * 2 +
    config.moverPauseBeforeExit;
  gsap.delayedCall(cleanupDelay, () => movers.forEach((m) => m.remove()));
};

// Reveal the final panel with animated clip-path
const revealPanel = (endImg) => {
  if (!panel || !panelContent || !endImg) return;
  
  const clipPaths = getClipPathsForDirection(config.clipPathDirection);

  gsap.set(panelContent, { opacity: 0 });
  gsap.set(panel, { opacity: 1, pointerEvents: 'auto' });

  gsap
    .timeline({
      defaults: {
        duration: config.stepDuration * config.panelRevealDurationFactor,
        ease: config.panelRevealEase,
      },
    })
    .fromTo(
      endImg,
      { clipPath: clipPaths.hide },
      {
        clipPath: clipPaths.reveal,
        pointerEvents: 'auto',
        delay: config.steps * config.stepInterval,
      }
    )
    .fromTo(
      panelContent,
      { y: 25 },
      {
        duration: 1,
        ease: 'expo',
        opacity: 1,
        y: 0,
        delay: config.steps * config.stepInterval,
        onComplete: () => {
          isAnimating = false;
          isPanelOpen = true;
        },
      },
      '<-=.2'
    );
};

// Generate motion path between start and end elements
const generateMotionPath = (startRect, endRect, steps) => {
  const path = [];
  const fullSteps = steps + 2;
  const startCenter = {
    x: startRect.left + startRect.width / 2,
    y: startRect.top + startRect.height / 2,
  };
  const endCenter = {
    x: endRect.left + endRect.width / 2,
    y: endRect.top + endRect.height / 2,
  };

  for (let i = 0; i < fullSteps; i++) {
    const t = i / (fullSteps - 1);
    const width = lerp(startRect.width, endRect.width, t);
    const height = lerp(startRect.height, endRect.height, t);
    const centerX = lerp(startCenter.x, endCenter.x, t);
    const centerY = lerp(startCenter.y, endCenter.y, t);

    // Apply top offset (for sine motion)
    const sineOffset =
      config.pathMotion === 'sine'
        ? Math.sin(t * config.sineFrequency) * config.sineAmplitude
        : 0;

    // Add random wobble
    const wobbleX = (Math.random() - 0.5) * config.wobbleStrength;
    const wobbleY = (Math.random() - 0.5) * config.wobbleStrength;

    path.push({
      left: centerX - width / 2 + wobbleX,
      top: centerY - height / 2 + sineOffset + wobbleY,
      width,
      height,
    });
  }

  return path.slice(1, -1);
};

// Reset everything and return to the initial grid view
const resetView = () => {
  if (isAnimating || !panel) return;
  isAnimating = true;

  const allItems = document.querySelectorAll('.grid__item');
  const delays = computeStaggerDelays(currentItem, allItems);

  gsap
    .timeline({
      defaults: { duration: config.stepDuration, ease: 'expo' },
      onComplete: () => {
        panel.classList.remove('panel--right');
        isAnimating = false;
        isPanelOpen = false;
      },
    })
    .to(panel, { opacity: 0 })
    .add(showFrame, 0)
    .set(panel, { opacity: 0, pointerEvents: 'none' })
    .set(panel.querySelector('.panel__img'), {
      clipPath: 'inset(0% 0% 100% 0%)',
    })
    .set(allItems, { clipPath: 'none', opacity: 0, scale: 0.8 }, 0)
    .to(
      allItems,
      {
        opacity: 1,
        scale: 1,
        delay: (i) => delays[i],
      },
      '>'
    );

  Object.assign(config, originalConfig);
};

// Page event handler for Astro view transitions
const handlePageEvent = (type) => {
  if (type === 'load') {
    // Preload images then initialize
    preloadImages('.grid__item-image, .panel__img').then(() => {
      document.body.classList.remove('loading');
      init();
    });
  }
};

// Check if we're in an Astro environment
if (typeof document !== 'undefined') {
  // Listen for Astro's lifecycle events if available
  if (document.addEventListener) {
    document.addEventListener('astro:page-load', () => handlePageEvent('load'));
  } else {
    // Regular DOM load for non-Astro environments
    window.addEventListener('DOMContentLoaded', () => handlePageEvent('load'));
  }
}

export { init, getClipPathsForDirection, generateMotionPath };