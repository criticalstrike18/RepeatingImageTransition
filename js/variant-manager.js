// js/variant-manager.js
export default class VariantManager {
  constructor() {
    this.variants = {};
    this.activeVariant = null;
    this.defaultVariant = {
      name: 'Default',
      fonts: {
        primary: "'halyard-display', sans-serif",
        secondary: "'owners-xnarrow', sans-serif",
        monospace: "'Noto Sans Mono', monospace"
      },
      colors: {
        text: '#151515',
        background: '#fff',
        link: '#151515',
        linkHover: '#000000',
        close: '#a22d1d',
        accent: '#ff0000'
      },
      fontSizes: {
        base: '14px',
        l: '18px',
        xl: 'clamp(2rem, 10vw, 6rem)'
      },
      spacing: {
        pagePadding: '1.5rem',
        columnGap: '0.5rem',
        panelGap: '1rem'
      },
      typography: {
        lineHeight: 1.2,
        letterSpacing: 'normal',
        textTransform: 'lowercase'
      },
      // New product card specific styles
      productCard: {
        fonts: {
          title: "'Noto Sans Mono', monospace",
          text: "'Noto Sans Mono', monospace"
        },
        colors: {
          title: '#151515',
          text: '#333333',
          price: '#151515',
          dashLine: '#999999',
          accent: '#ff0000',
          buttonText: '#ff0000',
          buttonHover: 'rgba(255, 0, 0, 0.1)'
        },
        typography: {
          titleSize: '1rem',
          textSize: '0.9rem',
          lineHeight: 1.4,
          textTransform: 'none',
          fontWeight: '500'
        },
        spacing: {
          padding: '0.5rem 0.75rem',
          marginBottom: '0.35rem'
        }
      }
    };
    
    this.initUI();
    this.loadVariants();
    this.applyActiveVariant();
    
    // Load Google Fonts
    this.googleFonts = [
      'Roboto',
      'Open Sans',
      'Montserrat',
      'Lato',
      'Poppins',
      'Oswald',
      'Raleway',
      'Merriweather',
      'Ubuntu',
      'Playfair Display'
    ];
    
    this.loadGoogleFonts(this.googleFonts).then(() => {
      this.populateFontOptions();
    });
  }

  initUI() {
    // Create variant manager panel
    this.createVariantPanel();
    // Attach event listeners
    this.attachEvents();
  }

  createVariantPanel() {
    const panel = document.createElement('div');
    panel.className = 'variant-manager';
    panel.innerHTML = `
      <div class="variant-manager__header">
        <h2>Variant Manager</h2>
        <button class="variant-manager__close" aria-label="Close variant manager">×</button>
      </div>
      <div class="variant-manager__body">
        <div class="variant-manager__section">
          <h3>Saved Variants</h3>
          <div class="variant-manager__variants"></div>
          <div class="variant-manager__actions">
            <input type="text" class="variant-manager__name-input" placeholder="New variant name">
            <button class="variant-manager__save-btn">Save Current</button>
          </div>
        </div>
        
        <div class="variant-manager__section">
          <h3>Typography</h3>
          <div class="variant-manager__control">
            <label>Primary Font</label>
            <select class="variant-manager__font-primary">
              <option value="'halyard-display', sans-serif">Halyard Display</option>
              <option value="'Arial', sans-serif">Arial</option>
              <option value="'Georgia', serif">Georgia</option>
              <option value="'Helvetica Neue', sans-serif">Helvetica Neue</option>
              <option value="'Times New Roman', serif">Times New Roman</option>
            </select>
          </div>
          
          <div class="variant-manager__control">
            <label>Secondary Font</label>
            <select class="variant-manager__font-secondary">
              <option value="'owners-xnarrow', sans-serif">Owners XNarrow</option>
              <option value="'Arial', sans-serif">Arial</option>
              <option value="'Georgia', serif">Georgia</option>
              <option value="'Helvetica Neue', sans-serif">Helvetica Neue</option>
              <option value="'Times New Roman', serif">Times New Roman</option>
            </select>
          </div>
          
          <div class="variant-manager__control">
            <label>Base Font Size</label>
            <input type="range" min="10" max="20" value="14" class="variant-manager__font-size">
            <span class="variant-manager__font-size-value">14px</span>
          </div>
          
          <div class="variant-manager__control">
            <label>Line Height</label>
            <input type="range" min="10" max="20" value="12" step="0.1" class="variant-manager__line-height">
            <span class="variant-manager__line-height-value">1.2</span>
          </div>
          
          <div class="variant-manager__control">
            <label>Text Transform</label>
            <select class="variant-manager__text-transform">
              <option value="lowercase">lowercase</option>
              <option value="uppercase">UPPERCASE</option>
              <option value="capitalize">Capitalize</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>
        
        <div class="variant-manager__section">
          <h3>Colors</h3>
          <div class="variant-manager__control variant-manager__color-control">
            <label>Text Color</label>
            <div class="variant-manager__color-input-group">
              <input type="color" value="#151515" class="variant-manager__color-text">
              <input type="text" value="#151515" class="variant-manager__color-text-hex">
            </div>
          </div>
          
          <div class="variant-manager__control variant-manager__color-control">
            <label>Background Color</label>
            <div class="variant-manager__color-input-group">
              <input type="color" value="#ffffff" class="variant-manager__color-bg">
              <input type="text" value="#ffffff" class="variant-manager__color-bg-hex">
            </div>
          </div>
          
          <div class="variant-manager__control variant-manager__color-control">
            <label>Link Color</label>
            <div class="variant-manager__color-input-group">
              <input type="color" value="#151515" class="variant-manager__color-link">
              <input type="text" value="#151515" class="variant-manager__color-link-hex">
            </div>
          </div>
          
          <div class="variant-manager__control variant-manager__color-control">
            <label>Link Hover Color</label>
            <div class="variant-manager__color-input-group">
              <input type="color" value="#000000" class="variant-manager__color-link-hover">
              <input type="text" value="#000000" class="variant-manager__color-link-hover-hex">
            </div>
          </div>
          
          <div class="variant-manager__control variant-manager__color-control">
            <label>Close Button Color</label>
            <div class="variant-manager__color-input-group">
              <input type="color" value="#a22d1d" class="variant-manager__color-close">
              <input type="text" value="#a22d1d" class="variant-manager__color-close-hex">
            </div>
          </div>
          
          <div class="variant-manager__control variant-manager__color-control">
            <label>Accent Color</label>
            <div class="variant-manager__color-input-group">
              <input type="color" value="#ff0000" class="variant-manager__color-accent">
              <input type="text" value="#ff0000" class="variant-manager__color-accent-hex">
            </div>
          </div>
        </div>
        
        <div class="variant-manager__section">
          <h3>Spacing</h3>
          <div class="variant-manager__control">
            <label>Page Padding</label>
            <input type="range" min="0.5" max="4" value="1.5" step="0.1" class="variant-manager__page-padding">
            <span class="variant-manager__page-padding-value">1.5rem</span>
          </div>
          
          <div class="variant-manager__control">
            <label>Column Gap</label>
            <input type="range" min="0.1" max="2" value="0.5" step="0.1" class="variant-manager__column-gap">
            <span class="variant-manager__column-gap-value">0.5rem</span>
          </div>
        </div>
        
        <!-- New Product Card Section -->
        <div class="variant-manager__section variant-manager__product-card-section">
          <h3>Product Card Styling</h3>
          
          <div class="variant-manager__subsection">
            <h4>Fonts</h4>
            <div class="variant-manager__control">
              <label>Title Font</label>
              <select class="variant-manager__product-title-font">
                <option value="'Noto Sans Mono', monospace">Noto Sans Mono</option>
                <option value="'halyard-display', sans-serif">Halyard Display</option>
                <option value="'owners-xnarrow', sans-serif">Owners XNarrow</option>
                <option value="'Arial', sans-serif">Arial</option>
                <option value="'Georgia', serif">Georgia</option>
              </select>
            </div>
            
            <div class="variant-manager__control">
              <label>Text Font</label>
              <select class="variant-manager__product-text-font">
                <option value="'Noto Sans Mono', monospace">Noto Sans Mono</option>
                <option value="'halyard-display', sans-serif">Halyard Display</option>
                <option value="'owners-xnarrow', sans-serif">Owners XNarrow</option>
                <option value="'Arial', sans-serif">Arial</option>
                <option value="'Georgia', serif">Georgia</option>
              </select>
            </div>
          </div>
          
          <div class="variant-manager__subsection">
            <h4>Typography</h4>
            <div class="variant-manager__control">
              <label>Title Size</label>
              <input type="range" min="0.7" max="1.5" value="1" step="0.05" class="variant-manager__product-title-size">
              <span class="variant-manager__product-title-size-value">1rem</span>
            </div>
            
            <div class="variant-manager__control">
              <label>Text Size</label>
              <input type="range" min="0.7" max="1.2" value="0.9" step="0.05" class="variant-manager__product-text-size">
              <span class="variant-manager__product-text-size-value">0.9rem</span>
            </div>
            
            <div class="variant-manager__control">
              <label>Line Height</label>
              <input type="range" min="10" max="20" value="14" step="0.1" class="variant-manager__product-line-height">
              <span class="variant-manager__product-line-height-value">1.4</span>
            </div>
            
            <div class="variant-manager__control">
              <label>Text Transform</label>
              <select class="variant-manager__product-text-transform">
                <option value="none">None</option>
                <option value="lowercase">lowercase</option>
                <option value="uppercase">UPPERCASE</option>
                <option value="capitalize">Capitalize</option>
              </select>
            </div>
            
            <div class="variant-manager__control">
              <label>Font Weight</label>
              <select class="variant-manager__product-font-weight">
                <option value="400">Regular (400)</option>
                <option value="500" selected>Medium (500)</option>
                <option value="600">Semi-Bold (600)</option>
                <option value="700">Bold (700)</option>
              </select>
            </div>
          </div>
          
          <div class="variant-manager__subsection">
            <h4>Colors</h4>
            <div class="variant-manager__control variant-manager__color-control">
              <label>Title Color</label>
              <div class="variant-manager__color-input-group">
                <input type="color" value="#151515" class="variant-manager__product-title-color">
                <input type="text" value="#151515" class="variant-manager__product-title-color-hex">
              </div>
            </div>
            
            <div class="variant-manager__control variant-manager__color-control">
              <label>Text Color</label>
              <div class="variant-manager__color-input-group">
                <input type="color" value="#333333" class="variant-manager__product-text-color">
                <input type="text" value="#333333" class="variant-manager__product-text-color-hex">
              </div>
            </div>
            
            <div class="variant-manager__control variant-manager__color-control">
              <label>Price Color</label>
              <div class="variant-manager__color-input-group">
                <input type="color" value="#151515" class="variant-manager__product-price-color">
                <input type="text" value="#151515" class="variant-manager__product-price-color-hex">
              </div>
            </div>
            
            <div class="variant-manager__control variant-manager__color-control">
              <label>Dash Line Color</label>
              <div class="variant-manager__color-input-group">
                <input type="color" value="#999999" class="variant-manager__product-dashline-color">
                <input type="text" value="#999999" class="variant-manager__product-dashline-color-hex">
              </div>
            </div>
            
            <div class="variant-manager__control variant-manager__color-control">
              <label>Accent Color</label>
              <div class="variant-manager__color-input-group">
                <input type="color" value="#ff0000" class="variant-manager__product-accent-color">
                <input type="text" value="#ff0000" class="variant-manager__product-accent-color-hex">
              </div>
            </div>
            
            <div class="variant-manager__control variant-manager__color-control">
              <label>Button Text Color</label>
              <div class="variant-manager__color-input-group">
                <input type="color" value="#ff0000" class="variant-manager__product-button-color">
                <input type="text" value="#ff0000" class="variant-manager__product-button-color-hex">
              </div>
            </div>
          </div>
          
          <div class="variant-manager__subsection">
            <h4>Spacing</h4>
            <div class="variant-manager__control">
              <label>Padding</label>
              <select class="variant-manager__product-padding">
                <option value="0.5rem 0.75rem">Default (0.5rem 0.75rem)</option>
                <option value="0.75rem 1rem">Large (0.75rem 1rem)</option>
                <option value="0.25rem 0.5rem">Small (0.25rem 0.5rem)</option>
                <option value="1rem 1.5rem">Extra Large (1rem 1.5rem)</option>
              </select>
            </div>
            
            <div class="variant-manager__control">
              <label>Spacing Between Elements</label>
              <input type="range" min="0.1" max="1" value="0.35" step="0.05" class="variant-manager__product-spacing">
              <span class="variant-manager__product-spacing-value">0.35rem</span>
            </div>
          </div>
        </div>
        
        <div class="variant-manager__section">
          <div class="variant-manager__button-row">
            <button class="variant-manager__apply-btn">Apply & Save Settings</button>
            <button class="variant-manager__reset-btn">Reset to Default</button>
          </div>
          <div class="variant-manager__button-row variant-manager__export-row">
            <button class="variant-manager__export-btn">Export Current as JSON</button>
            <select class="variant-manager__export-select">
              <option value="">Export a saved variant...</option>
            </select>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(panel);
    this.panel = panel;
    this.variantsContainer = panel.querySelector('.variant-manager__variants');
    this.nameInput = panel.querySelector('.variant-manager__name-input');
    this.saveBtn = panel.querySelector('.variant-manager__save-btn');
    this.applyBtn = panel.querySelector('.variant-manager__apply-btn');
    this.resetBtn = panel.querySelector('.variant-manager__reset-btn');
    this.exportBtn = panel.querySelector('.variant-manager__export-btn');
    this.exportSelect = panel.querySelector('.variant-manager__export-select');
    
    // Hide the panel initially
    this.panel.style.display = 'none';
  }
  
  createIndicator() {
    // Create F10 indicator
    const indicator = document.createElement('div');
    indicator.className = 'variant-manager__indicator';
    indicator.textContent = 'F10';
    indicator.title = 'Press F10 to open Variant Manager';
    document.body.appendChild(indicator);
    this.indicator = indicator;
  }
  
  attachEvents() {
    // F10 key listener
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F10' || e.keyCode === 121) {
        e.preventDefault(); // Prevent default browser behavior for F10
        this.togglePanel();
      }
      
      // Allow Escape key to close the panel
      if (e.key === 'Escape' && this.panel.style.display !== 'none') {
        this.togglePanel(false);
      }
    });
    
    // Allow clicking the indicator
    this.indicator.addEventListener('click', () => this.togglePanel());
    
    // Close button
    this.panel.querySelector('.variant-manager__close').addEventListener('click', () => {
      this.togglePanel(false);
    });
    
    // Save button
    this.saveBtn.addEventListener('click', () => this.saveCurrentVariant());
    
    // Apply button
    this.applyBtn.addEventListener('click', () => this.applyChanges());
    
    // Reset button
    this.resetBtn.addEventListener('click', () => this.resetToDefault());
    
    // Export current variant button
    this.exportBtn.addEventListener('click', () => this.exportVariant());
    
    // Export select for saved variants
    this.exportSelect.addEventListener('change', () => {
      const selectedVariant = this.exportSelect.value;
      if (selectedVariant) {
        this.exportVariant(selectedVariant);
        // Reset select to default
        this.exportSelect.selectedIndex = 0;
      }
    });
    
    // Live updates for all controls
    
    // Font selectors
    this.panel.querySelector('.variant-manager__font-primary').addEventListener('change', () => this.applyLiveChanges());
    this.panel.querySelector('.variant-manager__font-secondary').addEventListener('change', () => this.applyLiveChanges());
    
    // Color inputs and hex text fields
    const colorControls = [
      { picker: '.variant-manager__color-text', hex: '.variant-manager__color-text-hex' },
      { picker: '.variant-manager__color-bg', hex: '.variant-manager__color-bg-hex' },
      { picker: '.variant-manager__color-link', hex: '.variant-manager__color-link-hex' },
      { picker: '.variant-manager__color-link-hover', hex: '.variant-manager__color-link-hover-hex' },
      { picker: '.variant-manager__color-close', hex: '.variant-manager__color-close-hex' },
      { picker: '.variant-manager__color-accent', hex: '.variant-manager__color-accent-hex' }
    ];
    
    colorControls.forEach(control => {
      const colorPicker = this.panel.querySelector(control.picker);
      const hexInput = this.panel.querySelector(control.hex);
      
      // Update hex when color picker changes
      colorPicker.addEventListener('input', () => {
        hexInput.value = colorPicker.value;
        this.applyLiveChanges();
      });
      
      // Update color picker when hex changes
      hexInput.addEventListener('input', () => {
        // Validate hex code format
        if (this.isValidHex(hexInput.value)) {
          colorPicker.value = hexInput.value;
          this.applyLiveChanges();
        }
      });
      
      // Apply on focus out for hex input
      hexInput.addEventListener('blur', () => {
        // If invalid hex, revert to current color picker value
        if (!this.isValidHex(hexInput.value)) {
          hexInput.value = colorPicker.value;
        }
        this.applyLiveChanges();
      });
    });
    
    // Update font size display and apply changes
    const fontSizeSlider = this.panel.querySelector('.variant-manager__font-size');
    const fontSizeValue = this.panel.querySelector('.variant-manager__font-size-value');
    fontSizeSlider.addEventListener('input', () => {
      fontSizeValue.textContent = `${fontSizeSlider.value}px`;
      this.applyLiveChanges();
    });
    
    // Update line height display and apply changes
    const lineHeightSlider = this.panel.querySelector('.variant-manager__line-height');
    const lineHeightValue = this.panel.querySelector('.variant-manager__line-height-value');
    lineHeightSlider.addEventListener('input', () => {
      lineHeightValue.textContent = (lineHeightSlider.value / 10).toFixed(1);
      this.applyLiveChanges();
    });
    
    // Update page padding display and apply changes
    const pagePaddingSlider = this.panel.querySelector('.variant-manager__page-padding');
    const pagePaddingValue = this.panel.querySelector('.variant-manager__page-padding-value');
    pagePaddingSlider.addEventListener('input', () => {
      pagePaddingValue.textContent = `${pagePaddingSlider.value}rem`;
      this.applyLiveChanges();
    });
    
    // Update column gap display and apply changes
    const columnGapSlider = this.panel.querySelector('.variant-manager__column-gap');
    const columnGapValue = this.panel.querySelector('.variant-manager__column-gap-value');
    columnGapSlider.addEventListener('input', () => {
      columnGapValue.textContent = `${columnGapSlider.value}rem`;
      this.applyLiveChanges();
    });
    
    // Text transform selector
    this.panel.querySelector('.variant-manager__text-transform').addEventListener('change', () => this.applyLiveChanges());
    
    // ====== PRODUCT CARD CONTROLS ======
    
    // Font selectors
    this.panel.querySelector('.variant-manager__product-title-font').addEventListener('change', () => this.applyLiveChanges());
    this.panel.querySelector('.variant-manager__product-text-font').addEventListener('change', () => this.applyLiveChanges());
    
    // Typography controls
    const productTitleSizeSlider = this.panel.querySelector('.variant-manager__product-title-size');
    const productTitleSizeValue = this.panel.querySelector('.variant-manager__product-title-size-value');
    productTitleSizeSlider.addEventListener('input', () => {
      productTitleSizeValue.textContent = `${productTitleSizeSlider.value}rem`;
      this.applyLiveChanges();
    });
    
    const productTextSizeSlider = this.panel.querySelector('.variant-manager__product-text-size');
    const productTextSizeValue = this.panel.querySelector('.variant-manager__product-text-size-value');
    productTextSizeSlider.addEventListener('input', () => {
      productTextSizeValue.textContent = `${productTextSizeSlider.value}rem`;
      this.applyLiveChanges();
    });
    
    const productLineHeightSlider = this.panel.querySelector('.variant-manager__product-line-height');
    const productLineHeightValue = this.panel.querySelector('.variant-manager__product-line-height-value');
    productLineHeightSlider.addEventListener('input', () => {
      productLineHeightValue.textContent = (productLineHeightSlider.value / 10).toFixed(1);
      this.applyLiveChanges();
    });
    
    this.panel.querySelector('.variant-manager__product-text-transform').addEventListener('change', () => this.applyLiveChanges());
    this.panel.querySelector('.variant-manager__product-font-weight').addEventListener('change', () => this.applyLiveChanges());
    
    // Product card spacing
    this.panel.querySelector('.variant-manager__product-padding').addEventListener('change', () => this.applyLiveChanges());
    
    const productSpacingSlider = this.panel.querySelector('.variant-manager__product-spacing');
    const productSpacingValue = this.panel.querySelector('.variant-manager__product-spacing-value');
    productSpacingSlider.addEventListener('input', () => {
      productSpacingValue.textContent = `${productSpacingSlider.value}rem`;
      this.applyLiveChanges();
    });
    
    // Product card color controls
    const productColorControls = [
      { picker: '.variant-manager__product-title-color', hex: '.variant-manager__product-title-color-hex' },
      { picker: '.variant-manager__product-text-color', hex: '.variant-manager__product-text-color-hex' },
      { picker: '.variant-manager__product-price-color', hex: '.variant-manager__product-price-color-hex' },
      { picker: '.variant-manager__product-dashline-color', hex: '.variant-manager__product-dashline-color-hex' },
      { picker: '.variant-manager__product-accent-color', hex: '.variant-manager__product-accent-color-hex' },
      { picker: '.variant-manager__product-button-color', hex: '.variant-manager__product-button-color-hex' }
    ];
    
    productColorControls.forEach(control => {
      const colorPicker = this.panel.querySelector(control.picker);
      const hexInput = this.panel.querySelector(control.hex);
      
      // Update hex when color picker changes
      colorPicker.addEventListener('input', () => {
        hexInput.value = colorPicker.value;
        this.applyLiveChanges();
      });
      
      // Update color picker when hex changes
      hexInput.addEventListener('input', () => {
        // Validate hex code format
        if (this.isValidHex(hexInput.value)) {
          colorPicker.value = hexInput.value;
          this.applyLiveChanges();
        }
      });
      
      // Apply on focus out for hex input
      hexInput.addEventListener('blur', () => {
        // If invalid hex, revert to current color picker value
        if (!this.isValidHex(hexInput.value)) {
          hexInput.value = colorPicker.value;
        }
        this.applyLiveChanges();
      });
    });
  }
  
  togglePanel(show) {
    const isVisible = this.panel.style.display !== 'none';
    if (show === undefined) show = !isVisible;
    
    this.panel.style.display = show ? 'block' : 'none';
    
    if (show) {
      this.updateControlsFromActiveVariant();
      this.updateExportSelect();
      this.showNotification('Variant Manager opened');
    }
  }
  
  isValidHex(hex) {
    // Basic hex code validation
    return /^#([A-Fa-f0-9]{3}){1,2}$/.test(hex);
  }
  
  loadVariants() {
    try {
      const savedVariants = localStorage.getItem('gallery-variants');
      if (savedVariants) {
        this.variants = JSON.parse(savedVariants);
      } else {
        // Initialize with default variant
        this.variants = {
          'Default': this.defaultVariant
        };
      }
      
      // Get active variant
      const activeVariantName = localStorage.getItem('gallery-active-variant') || 'Default';
      this.activeVariant = this.variants[activeVariantName] || this.defaultVariant;
      
      this.updateVariantsList();
      this.updateExportSelect();
    } catch (error) {
      console.error('Error loading variants:', error);
      this.variants = { 'Default': this.defaultVariant };
      this.activeVariant = this.defaultVariant;
    }
  }
  
  saveVariants() {
    try {
      localStorage.setItem('gallery-variants', JSON.stringify(this.variants));
      localStorage.setItem('gallery-active-variant', this.activeVariant.name);
    } catch (error) {
      console.error('Error saving variants:', error);
    }
  }
  
  updateVariantsList() {
    this.variantsContainer.innerHTML = '';
    
    Object.values(this.variants).forEach(variant => {
      const variantEl = document.createElement('div');
      variantEl.className = 'variant-manager__variant';
      if (this.activeVariant && variant.name === this.activeVariant.name) {
        variantEl.classList.add('active');
      }
      
      variantEl.innerHTML = `
        <span class="variant-manager__variant-name">${variant.name}</span>
        <div class="variant-manager__variant-actions">
          <button class="variant-manager__variant-apply" aria-label="Apply variant">Apply</button>
          <button class="variant-manager__variant-export" aria-label="Export variant">Export</button>
          ${variant.name !== 'Default' ? '<button class="variant-manager__variant-delete" aria-label="Delete variant">Delete</button>' : ''}
        </div>
      `;
      
      // Apply button
      variantEl.querySelector('.variant-manager__variant-apply').addEventListener('click', () => {
        this.applyVariant(variant);
      });
      
      // Export button
      variantEl.querySelector('.variant-manager__variant-export').addEventListener('click', () => {
        this.exportVariant(variant.name);
      });
      
      // Delete button (if present)
      const deleteBtn = variantEl.querySelector('.variant-manager__variant-delete');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          this.deleteVariant(variant.name);
        });
      }
      
      this.variantsContainer.appendChild(variantEl);
    });
  }
  
  updateExportSelect() {
    // Clear existing options except the first one
    while (this.exportSelect.options.length > 1) {
      this.exportSelect.remove(1);
    }
    
    // Add all variants to the select
    Object.keys(this.variants).forEach(variantName => {
      const option = document.createElement('option');
      option.value = variantName;
      option.textContent = variantName;
      this.exportSelect.appendChild(option);
    });
  }
  
  getCurrentStateFromControls() {
    return {
      name: this.nameInput.value || 'Unnamed Variant',
      fonts: {
        primary: this.panel.querySelector('.variant-manager__font-primary').value,
        secondary: this.panel.querySelector('.variant-manager__font-secondary').value,
        monospace: "'Noto Sans Mono', monospace" // Keep monospace font consistent
      },
      colors: {
        text: this.panel.querySelector('.variant-manager__color-text').value,
        background: this.panel.querySelector('.variant-manager__color-bg').value,
        link: this.panel.querySelector('.variant-manager__color-link').value,
        linkHover: this.panel.querySelector('.variant-manager__color-link-hover').value,
        close: this.panel.querySelector('.variant-manager__color-close').value,
        accent: this.panel.querySelector('.variant-manager__color-accent').value
      },
      fontSizes: {
        base: `${this.panel.querySelector('.variant-manager__font-size').value}px`,
        l: '18px', // Keep consistent for now
        xl: 'clamp(2rem, 10vw, 6rem)' // Keep consistent for now
      },
      spacing: {
        pagePadding: `${this.panel.querySelector('.variant-manager__page-padding').value}rem`,
        columnGap: `${this.panel.querySelector('.variant-manager__column-gap').value}rem`,
        panelGap: '1rem' // Keep consistent for now
      },
      typography: {
        lineHeight: parseFloat(this.panel.querySelector('.variant-manager__line-height').value) / 10,
        letterSpacing: 'normal', // Keep consistent for now
        textTransform: this.panel.querySelector('.variant-manager__text-transform').value
      },
      // Add product card specific styles
      productCard: {
        fonts: {
          title: this.panel.querySelector('.variant-manager__product-title-font').value,
          text: this.panel.querySelector('.variant-manager__product-text-font').value
        },
        colors: {
          title: this.panel.querySelector('.variant-manager__product-title-color').value,
          text: this.panel.querySelector('.variant-manager__product-text-color').value,
          price: this.panel.querySelector('.variant-manager__product-price-color').value,
          dashLine: this.panel.querySelector('.variant-manager__product-dashline-color').value,
          accent: this.panel.querySelector('.variant-manager__product-accent-color').value,
          buttonText: this.panel.querySelector('.variant-manager__product-button-color').value
        },
        typography: {
          titleSize: `${this.panel.querySelector('.variant-manager__product-title-size').value}rem`,
          textSize: `${this.panel.querySelector('.variant-manager__product-text-size').value}rem`,
          lineHeight: parseFloat(this.panel.querySelector('.variant-manager__product-line-height').value) / 10,
          textTransform: this.panel.querySelector('.variant-manager__product-text-transform').value,
          fontWeight: this.panel.querySelector('.variant-manager__product-font-weight').value
        },
        spacing: {
          padding: this.panel.querySelector('.variant-manager__product-padding').value,
          marginBottom: `${this.panel.querySelector('.variant-manager__product-spacing').value}rem`
        }
      }
    };
  }
  
  updateControlsFromActiveVariant() {
    if (!this.activeVariant) return;
    
    // Update font selects
    this.panel.querySelector('.variant-manager__font-primary').value = this.activeVariant.fonts.primary;
    this.panel.querySelector('.variant-manager__font-secondary').value = this.activeVariant.fonts.secondary;
    
    // Update color inputs
    this.panel.querySelector('.variant-manager__color-text').value = this.activeVariant.colors.text;
    this.panel.querySelector('.variant-manager__color-text-hex').value = this.activeVariant.colors.text;
    
    this.panel.querySelector('.variant-manager__color-bg').value = this.activeVariant.colors.background;
    this.panel.querySelector('.variant-manager__color-bg-hex').value = this.activeVariant.colors.background;
    
    this.panel.querySelector('.variant-manager__color-link').value = this.activeVariant.colors.link;
    this.panel.querySelector('.variant-manager__color-link-hex').value = this.activeVariant.colors.link;
    
    this.panel.querySelector('.variant-manager__color-link-hover').value = this.activeVariant.colors.linkHover;
    this.panel.querySelector('.variant-manager__color-link-hover-hex').value = this.activeVariant.colors.linkHover;
    
    this.panel.querySelector('.variant-manager__color-close').value = this.activeVariant.colors.close;
    this.panel.querySelector('.variant-manager__color-close-hex').value = this.activeVariant.colors.close;
    
    this.panel.querySelector('.variant-manager__color-accent').value = this.activeVariant.colors.accent;
    this.panel.querySelector('.variant-manager__color-accent-hex').value = this.activeVariant.colors.accent;
    
    // Update range sliders
    const baseFontSize = parseInt(this.activeVariant.fontSizes.base);
    this.panel.querySelector('.variant-manager__font-size').value = baseFontSize;
    this.panel.querySelector('.variant-manager__font-size-value').textContent = `${baseFontSize}px`;
    
    const lineHeight = this.activeVariant.typography.lineHeight * 10;
    this.panel.querySelector('.variant-manager__line-height').value = lineHeight;
    this.panel.querySelector('.variant-manager__line-height-value').textContent = this.activeVariant.typography.lineHeight.toFixed(1);
    
    const pagePadding = parseFloat(this.activeVariant.spacing.pagePadding);
    this.panel.querySelector('.variant-manager__page-padding').value = pagePadding;
    this.panel.querySelector('.variant-manager__page-padding-value').textContent = `${pagePadding}rem`;
    
    const columnGap = parseFloat(this.activeVariant.spacing.columnGap);
    this.panel.querySelector('.variant-manager__column-gap').value = columnGap;
    this.panel.querySelector('.variant-manager__column-gap-value').textContent = `${columnGap}rem`;
    
    // Update select inputs
    this.panel.querySelector('.variant-manager__text-transform').value = this.activeVariant.typography.textTransform;
    
    // Update product card controls if they exist in the variant
    if (this.activeVariant.productCard) {
      const pc = this.activeVariant.productCard;
      
      // Fonts
      if (pc.fonts) {
        if (pc.fonts.title) this.panel.querySelector('.variant-manager__product-title-font').value = pc.fonts.title;
        if (pc.fonts.text) this.panel.querySelector('.variant-manager__product-text-font').value = pc.fonts.text;
      }
      
      // Typography
      if (pc.typography) {
        if (pc.typography.titleSize) {
          const titleSize = parseFloat(pc.typography.titleSize);
          this.panel.querySelector('.variant-manager__product-title-size').value = titleSize;
          this.panel.querySelector('.variant-manager__product-title-size-value').textContent = `${titleSize}rem`;
        }
        
        if (pc.typography.textSize) {
          const textSize = parseFloat(pc.typography.textSize);
          this.panel.querySelector('.variant-manager__product-text-size').value = textSize;
          this.panel.querySelector('.variant-manager__product-text-size-value').textContent = `${textSize}rem`;
        }
        
        if (pc.typography.lineHeight) {
          const pcLineHeight = pc.typography.lineHeight * 10;
          this.panel.querySelector('.variant-manager__product-line-height').value = pcLineHeight;
          this.panel.querySelector('.variant-manager__product-line-height-value').textContent = pc.typography.lineHeight.toFixed(1);
        }
        
        if (pc.typography.textTransform) {
          this.panel.querySelector('.variant-manager__product-text-transform').value = pc.typography.textTransform;
        }
        
        if (pc.typography.fontWeight) {
          this.panel.querySelector('.variant-manager__product-font-weight').value = pc.typography.fontWeight;
        }
      }
      
      // Colors
      if (pc.colors) {
        if (pc.colors.title) {
          this.panel.querySelector('.variant-manager__product-title-color').value = pc.colors.title;
          this.panel.querySelector('.variant-manager__product-title-color-hex').value = pc.colors.title;
        }
        
        if (pc.colors.text) {
          this.panel.querySelector('.variant-manager__product-text-color').value = pc.colors.text;
          this.panel.querySelector('.variant-manager__product-text-color-hex').value = pc.colors.text;
        }
        
        if (pc.colors.price) {
          this.panel.querySelector('.variant-manager__product-price-color').value = pc.colors.price;
          this.panel.querySelector('.variant-manager__product-price-color-hex').value = pc.colors.price;
        }
        
        if (pc.colors.dashLine) {
          this.panel.querySelector('.variant-manager__product-dashline-color').value = pc.colors.dashLine;
          this.panel.querySelector('.variant-manager__product-dashline-color-hex').value = pc.colors.dashLine;
        }
        
        if (pc.colors.accent) {
          this.panel.querySelector('.variant-manager__product-accent-color').value = pc.colors.accent;
          this.panel.querySelector('.variant-manager__product-accent-color-hex').value = pc.colors.accent;
        }
        
        if (pc.colors.buttonText) {
          this.panel.querySelector('.variant-manager__product-button-color').value = pc.colors.buttonText;
          this.panel.querySelector('.variant-manager__product-button-color-hex').value = pc.colors.buttonText;
        }
      }
      
      // Spacing
      if (pc.spacing) {
        if (pc.spacing.padding) {
          this.panel.querySelector('.variant-manager__product-padding').value = pc.spacing.padding;
        }
        
        if (pc.spacing.marginBottom) {
          const spacing = parseFloat(pc.spacing.marginBottom);
          this.panel.querySelector('.variant-manager__product-spacing').value = spacing;
          this.panel.querySelector('.variant-manager__product-spacing-value').textContent = `${spacing}rem`;
        }
      }
    }
  }
  
  saveCurrentVariant() {
    const variant = this.getCurrentStateFromControls();
    const name = variant.name;
    
    // Check if this is updating an existing variant
    if (this.activeVariant && name === this.activeVariant.name) {
      // Update existing variant
      this.variants[name] = variant;
    } else {
      // Create new variant
      this.variants[name] = variant;
    }
    
    this.saveVariants();
    this.updateVariantsList();
    this.updateExportSelect();
    
    // Save as JSON file
    this.exportVariant(name);
    
    // Clear name input
    this.nameInput.value = '';
    
    // Show confirmation message
    this.showNotification(`Variant "${name}" saved successfully!`);
  }
  
  applyVariant(variant) {
    this.activeVariant = variant;
    this.applyActiveVariant();
    this.saveVariants();
    this.updateVariantsList();
    this.updateControlsFromActiveVariant();
    
    // Show confirmation message
    this.showNotification(`Variant "${variant.name}" applied successfully!`);
  }
  
  deleteVariant(name) {
    if (name === 'Default') return; // Prevent deleting default variant
    
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete variant "${name}"?`)) return;
    
    // Delete variant
    delete this.variants[name];
    
    // If active variant was deleted, switch to default
    if (this.activeVariant && this.activeVariant.name === name) {
      this.activeVariant = this.variants.Default || this.defaultVariant;
      this.applyActiveVariant();
    }
    
    this.saveVariants();
    this.updateVariantsList();
    this.updateExportSelect();
    
    // Show confirmation message
    this.showNotification(`Variant "${name}" deleted successfully!`);
  }
  
  applyChanges() {
    const variant = this.getCurrentStateFromControls();
    this.activeVariant = variant;
    this.applyActiveVariant();
    
    // Show confirmation message
    this.showNotification('Changes applied!');
  }
  
  applyLiveChanges() {
    // Get current settings from controls and apply them immediately
    const currentState = this.getCurrentStateFromControls();
    this.applyVariantStyles(currentState);
  }
  
  resetToDefault() {
    this.activeVariant = this.defaultVariant;
    this.applyActiveVariant();
    this.updateControlsFromActiveVariant();
    
    // Show confirmation message
    this.showNotification('Reset to default styles!');
  }
  
  applyActiveVariant() {
    if (!this.activeVariant) return;
    this.applyVariantStyles(this.activeVariant);
  }
  
  applyVariantStyles(variant) {
    // Apply styles to :root CSS variables
    const style = document.createElement('style');
    
    // Extract product card styles for easier reference
    const pc = variant.productCard || {};
    
    style.textContent = `
      :root {
        /* Font Sizes */
        font-size: ${variant.fontSizes.base};
        --font-size-l: ${variant.fontSizes.l};
        --font-size-xl: ${variant.fontSizes.xl};
        
        /* Colors */
        --color-text: ${variant.colors.text};
        --color-bg: ${variant.colors.background};
        --color-link: ${variant.colors.link};
        --color-link-hover: ${variant.colors.linkHover};
        --color-close: ${variant.colors.close};
        --color-accent: ${variant.colors.accent};
        
        /* Spacing */
        --page-padding: ${variant.spacing.pagePadding};
        --c-gap: ${variant.spacing.columnGap};
        --panel-gap: ${variant.spacing.panelGap};
      }
      
      body {
        font-family: ${variant.fonts.primary};
        line-height: ${variant.typography.lineHeight};
        text-transform: ${variant.typography.textTransform};
      }
      
      .heading__title {
        font-family: ${variant.fonts.secondary};
      }
      
      /* ===== PRODUCT CARD STYLES ===== */
      
      /* Base product card styling */
      .panel__product-card {
        width: 100%;
        max-width: 340px;
        padding: ${pc.spacing?.padding || '0.5rem 0.75rem'};
        font-family: ${pc.fonts?.text || "'Noto Sans Mono', monospace"};
        font-size: ${pc.typography?.textSize || '0.9rem'};
        line-height: ${pc.typography?.lineHeight || 1.4};
        text-transform: ${pc.typography?.textTransform || 'none'};
        font-weight: ${pc.typography?.fontWeight || '500'};
        color: ${pc.colors?.text || variant.colors.text};
      }
      
      /* Product card title/label styling */
      .panel__option-label {
        margin: 0;
        font-size: ${pc.typography?.titleSize || '1rem'};
        font-weight: ${pc.typography?.fontWeight || '500'};
        font-family: ${pc.fonts?.title || "'Noto Sans Mono', monospace"};
        color: ${pc.colors?.title || variant.colors.text};
        margin-bottom: ${pc.spacing?.marginBottom || '0.35rem'};
        text-transform: ${pc.typography?.textTransform || 'capitalize'};
      }
      
      /* Product price */
      .panel__price {
        margin: 0.35rem 0 1.5rem;
        font-size: 0.95rem;
        font-weight: 500;
        color: ${pc.colors?.price || variant.colors.text};
      }
      
      /* Dashed lines */
      .panel__dashed-line {
        margin: 0.75rem 0;
        font-size: 0.85rem;
        color: ${pc.colors?.dashLine || '#999'};
        white-space: nowrap;
        overflow: hidden;
      }
      
      .panel__dash {
        letter-spacing: -1px;
        color: ${pc.colors?.dashLine || '#999'};
      }
      
      .panel__bottom-line {
        margin-bottom: 0;
        color: ${pc.colors?.accent || variant.colors.accent};
      }
      
      /* Button colors */
      .panel__add-to-cart,
      .panel__add-to-cart .panel__bracket {
        color: ${pc.colors?.buttonText || variant.colors.accent};
      }
      
      .panel__add-to-cart:hover {
        background-color: ${pc.colors?.buttonText || variant.colors.accent}15; /* 15% opacity */
      }
      
      /* Button text styling */
      .panel__add-to-cart {
        font-family: ${pc.fonts?.text || "'Noto Sans Mono', monospace"};
        font-size: ${pc.typography?.textSize || '0.9rem'};
        font-weight: ${pc.typography?.fontWeight || '500'};
      }
      
      /* Size buttons */
      .panel__size-btn {
        font-family: ${pc.fonts?.text || "'Noto Sans Mono', monospace"};
      }
      
      .panel__size-text {
        color: ${pc.colors?.text || variant.colors.text};
      }
      
      /* Override specific colors for size buttons */
      .panel__size-btn[data-size] .panel__size-text {
        color: ${pc.colors?.text || variant.colors.text};
      }
      
      /* Close button */
      .panel__close {
        color: ${variant.colors.close};
      }
      
      .panel__close:hover {
        color: ${variant.colors.linkHover};
      }
    `;
    
    // Remove existing variant style if it exists
    const existingStyle = document.getElementById('variant-style');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    style.id = 'variant-style';
    document.head.appendChild(style);
  }
  
  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'variant-manager__notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.classList.add('visible');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
      notification.classList.remove('visible');
      setTimeout(() => {
        notification.remove();
      }, 500);
    }, 3000);
  }
  
  async loadGoogleFonts(fonts) {
    const fontFamilies = fonts.map(font => `family=${font.replace(/\s+/g, '+')}`).join('&');
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${fontFamilies}&display=swap`;
    document.head.appendChild(link);
    
    // We need to wait for the fonts to load
    return new Promise(resolve => {
      link.onload = resolve;
    });
  }
  
  populateFontOptions() {
    const primaryFontSelect = this.panel.querySelector('.variant-manager__font-primary');
    const secondaryFontSelect = this.panel.querySelector('.variant-manager__font-secondary');
    const productTitleFontSelect = this.panel.querySelector('.variant-manager__product-title-font');
    const productTextFontSelect = this.panel.querySelector('.variant-manager__product-text-font');
    
    // Add Google Fonts options to all font selectors
    this.googleFonts.forEach(font => {
      const fontFamily = `'${font}', sans-serif`;
      
      // Add to primary font selector
      const primaryOption = document.createElement('option');
      primaryOption.value = fontFamily;
      primaryOption.textContent = font;
      primaryOption.style.fontFamily = fontFamily;
      primaryFontSelect.appendChild(primaryOption);
      
      // Add to secondary font selector
      const secondaryOption = document.createElement('option');
      secondaryOption.value = fontFamily;
      secondaryOption.textContent = font;
      secondaryOption.style.fontFamily = fontFamily;
      secondaryFontSelect.appendChild(secondaryOption);
      
      // Add to product title font selector
      const productTitleOption = document.createElement('option');
      productTitleOption.value = fontFamily;
      productTitleOption.textContent = font;
      productTitleOption.style.fontFamily = fontFamily;
      productTitleFontSelect.appendChild(productTitleOption);
      
      // Add to product text font selector
      const productTextOption = document.createElement('option');
      productTextOption.value = fontFamily;
      productTextOption.textContent = font;
      productTextOption.style.fontFamily = fontFamily;
      productTextFontSelect.appendChild(productTextOption);
    });
  }
  
  exportVariant(variantName) {
    // If variantName is provided, use that variant, otherwise use current state
    const variant = variantName ? 
      this.variants[variantName] : 
      this.getCurrentStateFromControls();
    
    if (!variant) {
      this.showNotification('Variant not found!');
      return;
    }
    
    // Create a formatted JSON string (pretty-printed)
    const jsonString = JSON.stringify(variant, null, 2);
    
    // Create a blob with the JSON data
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create a temporary URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    link.download = `variant-${variant.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    
    // Append to the body, click and remove
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
    
    this.showNotification(`Exported variant "${variant.name}" as JSON file`);
  }
  
  setupButtonSelections() {
    // Color button selection
    document.querySelectorAll('.panel__color-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault(); // Prevent any default action
        document.querySelectorAll('.panel__color-btn').forEach(b => 
          b.classList.remove('selected'));
        this.classList.add('selected');
      });
    });
  
    // Size button selection
    document.querySelectorAll('.panel__size-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault(); // Prevent any default action
        // Find all size buttons in the same group (color or gender)
        const group = this.closest('.panel__size-options');
        group.querySelectorAll('.panel__size-btn').forEach(b => 
          b.classList.remove('selected'));
        this.classList.add('selected');
      });
    });
  }
}