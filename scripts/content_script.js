/**
 * Fleets.eu Fleets Enhanced - Content Script
 * Apple-inspired design with enhanced security
 * @version 2.3.0
 * 
 * SECURITY: Alle DOM-Manipulationen verwenden sichere Methoden (keine innerHTML)
 */

(function() {
  'use strict';

  // ============================================
  // SECURITY: Safe DOM Helpers
  // ============================================
  
  /**
   * Erstellt ein Element mit optionalen Attributen und Klassen
   */
  function createElement(tag, options = {}) {
    const el = document.createElement(tag);
    
    if (options.id) el.id = options.id;
    if (options.className) el.className = options.className;
    if (options.textContent) el.textContent = options.textContent;
    if (options.title) el.title = options.title;
    
    if (options.attributes) {
      for (const [key, value] of Object.entries(options.attributes)) {
        el.setAttribute(key, value);
      }
    }
    
    if (options.style) {
      for (const [key, value] of Object.entries(options.style)) {
        el.style[key] = value;
      }
    }
    
    if (options.children) {
      options.children.forEach(child => {
        if (child) el.appendChild(child);
      });
    }
    
    return el;
  }

  /**
   * Sanitize string for safe text content
   */
  function sanitizeText(str) {
    if (str === null || str === undefined) return '';
    return String(str);
  }

  function safeNumber(value) {
    const num = parseFloat(value);
    if (isNaN(num) || !isFinite(num)) return null;
    return num;
  }

  // ============================================
  // CONFIGURATION
  // ============================================
  const SELECTORS = {
    vehicleContainer: '#pc-cars-content',
    vehicleRow: 'div.content-row',
    columns: {
      logo: 'div.col.s1',
      info: 'div.col.s3',
      details: 'div.col.s4'
    }
  };

  const BRAND_SIGNATURES = {
    'mercedes': 'Mercedes-Benz',
    'benz': 'Mercedes-Benz',
    'volkswagen': 'Volkswagen',
    'vw': 'Volkswagen',
    'skoda': 'Škoda',
    'bmw': 'BMW',
    'audi': 'Audi',
    'ford': 'Ford',
    'seat': 'SEAT',
    'opel': 'Opel',
    'renault': 'Renault',
    'peugeot': 'Peugeot',
    'citroen': 'Citroën',
    'toyota': 'Toyota',
    'hyundai': 'Hyundai',
    'kia': 'Kia',
    'nissan': 'Nissan',
    'mazda': 'Mazda',
    'volvo': 'Volvo',
    'tesla': 'Tesla',
    'porsche': 'Porsche',
    'fiat': 'Fiat',
    'mini': 'MINI',
    'jeep': 'Jeep',
    'cupra': 'Cupra'
  };

  // ============================================
  // EXTRACTION FUNCTIONS
  // ============================================

  function extractBrand(rowElement) {
    try {
      const logoCol = rowElement.querySelector(SELECTORS.columns.logo);
      if (!logoCol) return null;

      const img = logoCol.querySelector('img');
      if (!img) return null;

      const src = img.getAttribute('src') || '';
      
      const base64Match = src.match(/\/download\/([A-Za-z0-9+/=]+)/);
      if (base64Match && base64Match[1]) {
        try {
          const decoded = atob(base64Match[1]);
          const parts = decoded.split('|');
          if (parts.length >= 2 && parts[0] === 'BRANDIMG') {
            return parts[1];
          }
        } catch (e) {}
      }

      const alt = (img.getAttribute('alt') || '').toLowerCase();
      const title = (img.getAttribute('title') || '').toLowerCase();
      
      for (const [key, brand] of Object.entries(BRAND_SIGNATURES)) {
        if (alt.includes(key) || title.includes(key)) return brand;
      }

      return null;
    } catch (error) {
      console.warn('[Fleets] Error extracting brand:', error);
      return null;
    }
  }

  function extractKennzeichen(rowElement) {
    try {
      const infoCol = rowElement.querySelector(SELECTORS.columns.info);
      if (!infoCol) return null;
      const boldEl = infoCol.querySelector('b');
      return boldEl?.textContent?.trim() || null;
    } catch (error) { return null; }
  }

  function extractModell(rowElement) {
    try {
      const infoCol = rowElement.querySelector(SELECTORS.columns.info);
      if (!infoCol) return null;
      const boldEl = infoCol.querySelector('b');
      if (!boldEl) return null;
      let nextNode = boldEl.nextSibling;
      while (nextNode) {
        if (nextNode.nodeType === Node.TEXT_NODE) {
          const text = nextNode.textContent?.trim();
          if (text && text.length > 0) return text;
        }
        nextNode = nextNode.nextSibling;
      }
      return null;
    } catch (error) { return null; }
  }

  function extractVertragsende(rowElement) {
    try {
      const text = rowElement.textContent || '';
      const match = text.match(/Vertragsende:\s*(\d{2}\.\d{2}\.\d{4})/i);
      return match ? match[1] : null;
    } catch (error) { return null; }
  }

  function extractLeasingrate(rowElement) {
    try {
      const text = rowElement.textContent || '';
      const match = text.match(/Leasingrate:\s*([\d.,]+)\s*€/i);
      if (match) {
        const numStr = match[1].replace(/\./g, '').replace(',', '.');
        return safeNumber(numStr);
      }
      return null;
    } catch (error) { return null; }
  }

  function extractStandort(rowElement) {
    try {
      const fontDiv = rowElement.querySelector('div.font-size-12');
      if (fontDiv) {
        const spans = fontDiv.querySelectorAll('span');
        if (spans.length > 0) {
          const text = spans[spans.length - 1].textContent?.trim();
          if (text && text.length > 1 && text.length < 50) return text;
        }
      }
      return null;
    } catch (error) { return null; }
  }

  function extractVertragsProzent(rowElement) {
    try {
      const progressBar = rowElement.querySelector('div[style*="4CAF50"]');
      if (progressBar) {
        const style = progressBar.getAttribute('style') || '';
        const widthMatch = style.match(/width:\s*([\d.]+)%/);
        if (widthMatch) {
          const value = parseFloat(widthMatch[1]);
          if (value >= 0 && value <= 100) return Math.round(value);
        }
      }
      const fontDiv = rowElement.querySelector('div.font-size-12');
      if (fontDiv) {
        const text = fontDiv.textContent || '';
        const match = text.match(/(\d{1,3})%/);
        if (match) {
          const value = parseInt(match[1], 10);
          if (value >= 0 && value <= 100) return value;
        }
      }
      return null;
    } catch (error) { return null; }
  }

  // ============================================
  // PARSING
  // ============================================

  function parseVehicleRow(rowElement, index) {
    return {
      id: extractKennzeichen(rowElement) || `unknown_${index}`,
      kennzeichen: extractKennzeichen(rowElement),
      marke: extractBrand(rowElement),
      modell: extractModell(rowElement),
      vertragsende: extractVertragsende(rowElement),
      leasingrate: extractLeasingrate(rowElement),
      standort: extractStandort(rowElement),
      vertragsProzent: extractVertragsProzent(rowElement),
      scannedAt: new Date().toISOString(),
      isNew: false
    };
  }

  function scrapeVehicles() {
    console.log('[Fleets] Scanning vehicles...');
    const vehicles = [];
    const errors = [];
    try {
      const rows = document.querySelectorAll(SELECTORS.vehicleRow);
      console.log(`[Fleets] Found ${rows.length} rows`);
      if (rows.length === 0) {
        errors.push('No vehicle rows found');
        return { vehicles: [], errors };
      }
      rows.forEach((row, index) => {
        try {
          const vehicle = parseVehicleRow(row, index);
          if (vehicle.kennzeichen) {
            vehicles.push(vehicle);
          }
        } catch (e) {
          errors.push(`Row ${index + 1}: ${e.message}`);
        }
      });
      console.log(`[Fleets] Parsed ${vehicles.length} vehicles`);
    } catch (error) {
      errors.push(`Critical error: ${error.message}`);
    }
    return { vehicles, errors };
  }

  // ============================================
  // STORAGE
  // ============================================

  async function saveAndDiffVehicles(scannedVehicles) {
    try {
      const stored = await browser.storage.local.get(['vehicles']);
      const existing = stored.vehicles || [];
      const existingIds = new Set(existing.map(v => v.id));
      
      let newCount = 0;
      scannedVehicles.forEach(v => {
        if (!existingIds.has(v.id)) {
          v.isNew = true;
          newCount++;
        }
      });
      
      await browser.storage.local.set({
        vehicles: scannedVehicles,
        lastScan: new Date().toISOString(),
        newCount
      });
      
      return { total: scannedVehicles.length, newCount };
    } catch (error) {
      console.error('[Fleets] Storage error:', error);
      return { total: 0, newCount: 0 };
    }
  }

  async function loadSavedVehicles() {
    try {
      const stored = await browser.storage.local.get(['vehicles', 'lastScan', 'newCount']);
      return {
        vehicles: stored.vehicles || [],
        lastScan: stored.lastScan || null,
        newCount: stored.newCount || 0
      };
    } catch (error) {
      return { vehicles: [], lastScan: null, newCount: 0 };
    }
  }

  // ============================================
  // UI COMPONENTS (Safe DOM Methods)
  // ============================================

  function showNotification(message, type = 'info') {
    const existing = document.getElementById('fleets-toast');
    if (existing) existing.remove();

    const toast = createElement('div', {
      id: 'fleets-toast',
      className: `fleets-toast fleets-toast-${type}`,
      textContent: message
    });
    
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  /**
   * Erstellt das Overlay komplett mit DOM-Methoden (keine innerHTML)
   */
  function createOverlay() {
    const existing = document.getElementById('fleets-enhancer-overlay');
    if (existing) existing.remove();

    // Main Overlay Container
    const overlay = createElement('div', { id: 'fleets-enhancer-overlay' });

    // === HEADER ===
    const header = createElement('div', { className: 'fleets-header' });
    
    // Logo
    const titleDiv = createElement('div', { className: 'fleets-title' });
    const logo = createElement('img', {
      className: 'fleets-logo',
      attributes: {
        src: browser.runtime.getURL('icons/logo.png'),
        alt: 'Logo'
      }
    });
    logo.onerror = function() { this.style.display = 'none'; };
    titleDiv.appendChild(logo);
    
    // Header Actions
    const headerActions = createElement('div', { className: 'fleets-header-actions' });
    const scanBtn = createElement('button', {
      id: 'fleets-scan-btn',
      className: 'fleets-btn fleets-btn-primary',
      textContent: 'Scannen'
    });
    const minimizeBtn = createElement('button', {
      id: 'fleets-minimize-btn',
      className: 'fleets-btn fleets-btn-icon',
      textContent: '−'
    });
    headerActions.appendChild(scanBtn);
    headerActions.appendChild(minimizeBtn);
    
    header.appendChild(titleDiv);
    header.appendChild(headerActions);

    // === BODY ===
    const body = createElement('div', { className: 'fleets-body' });

    // Stats
    const stats = createElement('div', { className: 'fleets-stats' });
    
    const statTotal = createStatCard('fleets-total', '0', 'Gesamt');
    const statNew = createStatCard('fleets-new', '0', 'Neu', 'success');
    const statScan = createStatCard('fleets-lastscan', '--:--', 'Scan');
    
    stats.appendChild(statTotal);
    stats.appendChild(statNew);
    stats.appendChild(statScan);

    // Filters
    const filters = createElement('div', { className: 'fleets-filters' });
    
    // Search
    const searchWrapper = createElement('div', { className: 'fleets-search-wrapper' });
    const searchIcon = createElement('span', {
      className: 'fleets-search-icon',
      textContent: '🔍'
    });
    const searchInput = createElement('input', {
      id: 'fleets-search-input',
      attributes: { type: 'text', placeholder: 'Suchen...' }
    });
    searchWrapper.appendChild(searchIcon);
    searchWrapper.appendChild(searchInput);
    
    // Sort Row
    const sortRow = createElement('div', { className: 'fleets-sort-row' });
    const sortLabel = createElement('span', {
      className: 'fleets-sort-label',
      textContent: 'Sortieren:'
    });
    
    const sortSelect = createElement('select', { id: 'fleets-sort-select' });
    const sortOptions = [
      { value: 'kennzeichen', text: 'Kennzeichen' },
      { value: 'marke', text: 'Marke' },
      { value: 'modell', text: 'Modell' },
      { value: 'vertragsende', text: 'Vertragsende' },
      { value: 'leasingrate', text: 'Rate' },
      { value: 'standort', text: 'Standort' },
      { value: 'isNew', text: 'Neue zuerst' }
    ];
    sortOptions.forEach(opt => {
      const option = createElement('option', {
        textContent: opt.text,
        attributes: { value: opt.value }
      });
      sortSelect.appendChild(option);
    });
    
    const sortDirBtn = createElement('button', {
      id: 'fleets-sort-dir',
      className: 'fleets-btn fleets-btn-icon',
      textContent: '↑'
    });
    
    sortRow.appendChild(sortLabel);
    sortRow.appendChild(sortSelect);
    sortRow.appendChild(sortDirBtn);
    
    filters.appendChild(searchWrapper);
    filters.appendChild(sortRow);

    // Table
    const tableContainer = createElement('div', { className: 'fleets-table-container' });
    const table = createElement('table', { className: 'fleets-table' });
    
    // Table Head
    const thead = createElement('thead');
    const headRow = createElement('tr');
    ['Kennzeichen', 'Fahrzeug', 'Vertrag', 'Rate', 'Standort'].forEach(text => {
      const th = createElement('th', { textContent: text });
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    
    // Table Body
    const tbody = createElement('tbody', { id: 'fleets-table-body' });
    const emptyRow = createElement('tr');
    const emptyCell = createElement('td', {
      className: 'fleets-empty',
      textContent: 'Klicke "Scannen" zum Laden',
      attributes: { colspan: '5' }
    });
    emptyRow.appendChild(emptyCell);
    tbody.appendChild(emptyRow);
    
    table.appendChild(thead);
    table.appendChild(tbody);
    tableContainer.appendChild(table);

    // Assemble Body
    body.appendChild(stats);
    body.appendChild(filters);
    body.appendChild(tableContainer);

    // Assemble Overlay
    overlay.appendChild(header);
    overlay.appendChild(body);

    document.body.appendChild(overlay);

    // Event Listeners
    scanBtn.addEventListener('click', performScan);
    minimizeBtn.addEventListener('click', toggleMinimize);
    searchInput.addEventListener('input', debounce(filterVehicles, 200));
    sortSelect.addEventListener('change', sortVehicles);
    sortDirBtn.addEventListener('click', toggleSortDirection);

    loadAndDisplay();
  }

  /**
   * Hilfsfunktion für Stat Cards
   */
  function createStatCard(valueId, initialValue, label, extraClass = '') {
    const card = createElement('div', {
      className: 'fleets-stat-card' + (extraClass ? ' ' + extraClass : '')
    });
    const value = createElement('div', {
      id: valueId,
      className: 'fleets-stat-value',
      textContent: initialValue
    });
    const labelEl = createElement('div', {
      className: 'fleets-stat-label',
      textContent: label
    });
    card.appendChild(value);
    card.appendChild(labelEl);
    return card;
  }

  // ============================================
  // UI STATE & HANDLERS
  // ============================================

  let currentVehicles = [];
  let sortDirection = 'asc';
  let isMinimized = false;

  function debounce(fn, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function toggleMinimize() {
    const overlay = document.getElementById('fleets-enhancer-overlay');
    const btn = document.getElementById('fleets-minimize-btn');
    
    isMinimized = !isMinimized;
    overlay.classList.toggle('minimized', isMinimized);
    btn.textContent = isMinimized ? '+' : '−';
  }

  function toggleSortDirection() {
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    document.getElementById('fleets-sort-dir').textContent = sortDirection === 'asc' ? '↑' : '↓';
    sortVehicles();
  }

  async function performScan() {
    const btn = document.getElementById('fleets-scan-btn');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Scanne...';

    const { vehicles, errors } = scrapeVehicles();
    
    if (vehicles.length > 0) {
      const { total, newCount } = await saveAndDiffVehicles(vehicles);
      currentVehicles = vehicles;
      renderTable(vehicles);
      updateStats(total, newCount);
      
      const msg = newCount > 0 
        ? `${total} Fahrzeuge, ${newCount} neu!` 
        : `${total} Fahrzeuge geladen`;
      showNotification(msg, newCount > 0 ? 'success' : 'info');
    } else {
      showNotification('Keine Fahrzeuge gefunden', 'warning');
    }

    if (errors.length > 0) {
      console.warn('[Fleets] Errors:', errors);
    }

    btn.disabled = false;
    btn.textContent = originalText;
  }

  async function loadAndDisplay() {
    const { vehicles, lastScan, newCount } = await loadSavedVehicles();
    
    if (vehicles.length > 0) {
      currentVehicles = vehicles;
      renderTable(vehicles);
      updateStats(vehicles.length, newCount);
      
      if (lastScan) {
        const date = new Date(lastScan);
        document.getElementById('fleets-lastscan').textContent = 
          date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
      }
    }
  }

  function updateStats(total, newCount) {
    document.getElementById('fleets-total').textContent = total;
    document.getElementById('fleets-new').textContent = newCount;
    document.getElementById('fleets-lastscan').textContent = 
      new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Rendert Tabelle mit sicheren DOM-Methoden (keine innerHTML)
   */
  function renderTable(vehicles) {
    const tbody = document.getElementById('fleets-table-body');
    
    // Clear existing content
    while (tbody.firstChild) {
      tbody.removeChild(tbody.firstChild);
    }
    
    if (vehicles.length === 0) {
      const emptyRow = createElement('tr');
      const emptyCell = createElement('td', {
        className: 'fleets-empty',
        textContent: 'Keine Fahrzeuge gefunden',
        attributes: { colspan: '5' }
      });
      emptyRow.appendChild(emptyCell);
      tbody.appendChild(emptyRow);
      return;
    }
    
    vehicles.forEach(v => {
      const row = createVehicleRow(v);
      tbody.appendChild(row);
    });
  }

  /**
   * Erstellt eine Tabellenzeile für ein Fahrzeug (safe DOM)
   */
  function createVehicleRow(v) {
    let pct = parseInt(v.vertragsProzent, 10);
    if (isNaN(pct) || pct < 0) pct = 0;
    if (pct > 100) pct = 100;
    
    const pctClass = pct > 75 ? 'high' : pct > 40 ? 'mid' : 'low';
    
    const row = createElement('tr', {
      className: v.isNew ? 'fleets-row-new' : ''
    });

    // Cell 1: Kennzeichen
    const cell1 = createElement('td');
    const cellPlate = createElement('div', { className: 'fleets-cell-plate' });
    const plateSpan = createElement('span', {
      className: 'fleets-plate',
      textContent: sanitizeText(v.kennzeichen) || '—'
    });
    cellPlate.appendChild(plateSpan);
    if (v.isNew) {
      const badge = createElement('span', {
        className: 'fleets-badge-new',
        textContent: 'Neu'
      });
      cellPlate.appendChild(badge);
    }
    cell1.appendChild(cellPlate);

    // Cell 2: Fahrzeug (Marke + Modell)
    const cell2 = createElement('td');
    const cellVehicle = createElement('div', { className: 'fleets-cell-vehicle' });
    const brandSpan = createElement('span', {
      className: 'fleets-brand',
      textContent: sanitizeText(v.marke) || '—'
    });
    const modelText = sanitizeText(v.modell) || '—';
    const modelSpan = createElement('span', {
      className: 'fleets-model',
      textContent: modelText
    });
    if (modelText.length > 14) {
      modelSpan.title = modelText;
    }
    cellVehicle.appendChild(brandSpan);
    cellVehicle.appendChild(modelSpan);
    cell2.appendChild(cellVehicle);

    // Cell 3: Vertrag (Datum + Progress)
    const cell3 = createElement('td');
    const cellContract = createElement('div', { className: 'fleets-cell-contract' });
    const dateSpan = createElement('span', {
      className: 'fleets-date',
      textContent: sanitizeText(v.vertragsende) || '—'
    });
    cellContract.appendChild(dateSpan);
    
    if (v.vertragsProzent !== null) {
      const progressWrapper = createElement('div', { className: 'fleets-progress-wrapper' });
      const progress = createElement('div', { className: 'fleets-progress' });
      const progressFill = createElement('div', {
        className: `fleets-progress-fill ${pctClass}`,
        style: { width: `${pct}%` }
      });
      const percentSpan = createElement('span', {
        className: 'fleets-percent',
        textContent: `${pct}%`
      });
      progress.appendChild(progressFill);
      progressWrapper.appendChild(progress);
      progressWrapper.appendChild(percentSpan);
      cellContract.appendChild(progressWrapper);
    }
    cell3.appendChild(cellContract);

    // Cell 4: Rate
    const cell4 = createElement('td');
    const rateText = v.leasingrate 
      ? v.leasingrate.toLocaleString('de-DE', {
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2
        }) + ' €' 
      : '—';
    const rateSpan = createElement('span', {
      className: 'fleets-rate',
      textContent: rateText
    });
    cell4.appendChild(rateSpan);

    // Cell 5: Standort
    const cell5 = createElement('td');
    const locationText = sanitizeText(v.standort) || '—';
    const locationSpan = createElement('span', {
      className: 'fleets-location',
      textContent: locationText
    });
    if (locationText.length > 20) {
      locationSpan.title = locationText;
    }
    cell5.appendChild(locationSpan);

    row.appendChild(cell1);
    row.appendChild(cell2);
    row.appendChild(cell3);
    row.appendChild(cell4);
    row.appendChild(cell5);

    return row;
  }

  function filterVehicles() {
    const query = document.getElementById('fleets-search-input').value.toLowerCase().trim();
    
    if (!query) {
      renderTable(currentVehicles);
      return;
    }
    
    const filtered = currentVehicles.filter(v => {
      return (v.kennzeichen?.toLowerCase().includes(query)) ||
             (v.marke?.toLowerCase().includes(query)) ||
             (v.modell?.toLowerCase().includes(query)) ||
             (v.standort?.toLowerCase().includes(query)) ||
             (v.vertragsende?.includes(query));
    });
    
    renderTable(filtered);
  }

  function sortVehicles() {
    const field = document.getElementById('fleets-sort-select').value;
    
    const sorted = [...currentVehicles].sort((a, b) => {
      let valA = a[field];
      let valB = b[field];
      
      if (field === 'isNew') {
        valA = a.isNew ? 1 : 0;
        valB = b.isNew ? 1 : 0;
      } else if (field === 'leasingrate') {
        valA = valA || 0;
        valB = valB || 0;
      } else if (field === 'vertragsende') {
        valA = valA ? valA.split('.').reverse().join('') : '00000000';
        valB = valB ? valB.split('.').reverse().join('') : '00000000';
      } else {
        valA = (valA || '').toString().toLowerCase();
        valB = (valB || '').toString().toLowerCase();
      }
      
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    renderTable(sorted);
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver((_, obs) => {
        const el = document.querySelector(selector);
        if (el) {
          obs.disconnect();
          resolve(el);
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });

      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);
    });
  }

  function injectStyles() {
    if (document.getElementById('fleets-styles')) return;
    
    const link = document.createElement('link');
    link.id = 'fleets-styles';
    link.rel = 'stylesheet';
    link.href = browser.runtime.getURL('styles/overlay.css');
    document.head.appendChild(link);
  }

  async function init() {
    console.log('[Fleets] Initializing...');
    
    injectStyles();
    
    await new Promise(r => setTimeout(r, 300));
    
    createOverlay();
    console.log('[Fleets] UI created');
    
    const container = await waitForElement(SELECTORS.vehicleContainer, 5000);
    
    if (container) {
      console.log('[Fleets] Auto-scanning...');
      setTimeout(performScan, 800);
    } else {
      showNotification('Klicke "Scannen" zum Laden', 'info');
    }
    
    console.log('[Fleets] Ready ✓');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
