/**
 * Preloads images specified by the CSS selector.
 * @function
 * @param {string} [selector='img'] - CSS selector for target images.
 * @returns {Promise} - Resolves when all specified images are loaded.
 */
const preloadImages = (selector = 'img') => {
  return new Promise((resolve) => {
    // Check if imagesLoaded is available
    if (typeof imagesLoaded === 'undefined') {
      console.warn('imagesLoaded library not found, skipping preload');
      resolve();
      return;
    }
    
    // The imagesLoaded library is used to ensure all images (including backgrounds) are fully loaded
    imagesLoaded(document.querySelectorAll(selector), {background: true}, resolve);
  });
};

// Exporting utility functions for use in other modules
export {
  preloadImages
};