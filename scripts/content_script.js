/**
 * Fleets.eu Fleets Enhanced - Content Script
 * Apple-inspired design with enhanced security
 * @version 2.5.5 - Clickable license plate opens vehicle modal
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

  /**
   * Formatiert ein deutsches Kennzeichen mit Bindestrichen
   * DCG3093 -> D-CG 3093, ESNT898E -> ES-NT 898E, MCG3087 -> M-CG 3087
   */
  function formatLicensePlate(plate) {
    if (!plate || typeof plate !== 'string') return plate;
    
    // Deutsche Städtekürzel (1-3 Buchstaben)
    const cityPrefixes = [
      // 1 Buchstabe
      'B', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'V', 'W', 'Z',
      // 2 Buchstaben (häufige)
      'AA', 'AB', 'AC', 'AE', 'AH', 'AK', 'AM', 'AN', 'AO', 'AP', 'AS', 'AW', 'AZ',
      'BA', 'BB', 'BC', 'BE', 'BF', 'BH', 'BI', 'BK', 'BL', 'BM', 'BN', 'BO', 'BS', 'BT', 'BZ',
      'CB', 'CE', 'CO', 'CW', 'DA', 'DB', 'DD', 'DE', 'DH', 'DL', 'DM', 'DN', 'DO', 'DU', 'DW', 'DZ',
      'EA', 'EB', 'ED', 'EE', 'EF', 'EI', 'EL', 'EM', 'EN', 'ER', 'ES', 'EU', 'EW',
      'FB', 'FD', 'FF', 'FG', 'FL', 'FN', 'FO', 'FR', 'FS', 'FT', 'FU', 'FW',
      'GA', 'GC', 'GD', 'GE', 'GF', 'GG', 'GI', 'GK', 'GL', 'GM', 'GN', 'GP', 'GR', 'GS', 'GT', 'GU', 'GV', 'GW', 'GZ',
      'HA', 'HB', 'HC', 'HD', 'HE', 'HF', 'HG', 'HH', 'HI', 'HK', 'HL', 'HM', 'HN', 'HO', 'HP', 'HR', 'HS', 'HU', 'HV', 'HX', 'HY', 'HZ',
      'IK', 'IL', 'IN', 'IZ',
      'JE', 'JL',
      'KA', 'KB', 'KC', 'KE', 'KF', 'KG', 'KH', 'KI', 'KK', 'KL', 'KM', 'KN', 'KO', 'KR', 'KS', 'KT', 'KU', 'KW', 'KY',
      'LA', 'LB', 'LC', 'LD', 'LE', 'LF', 'LG', 'LH', 'LI', 'LL', 'LM', 'LN', 'LO', 'LP', 'LR', 'LU',
      'MA', 'MB', 'MC', 'MD', 'ME', 'MG', 'MH', 'MI', 'MK', 'ML', 'MM', 'MN', 'MO', 'MQ', 'MR', 'MS', 'MU', 'MW', 'MY', 'MZ',
      'NB', 'ND', 'NE', 'NF', 'NH', 'NI', 'NK', 'NM', 'NO', 'NP', 'NR', 'NU', 'NW', 'NY', 'NZ',
      'OA', 'OB', 'OC', 'OD', 'OE', 'OF', 'OG', 'OH', 'OK', 'OL', 'OP', 'OR', 'OS', 'OZ',
      'PA', 'PB', 'PE', 'PF', 'PI', 'PL', 'PM', 'PN', 'PR', 'PS',
      'RA', 'RD', 'RE', 'RG', 'RH', 'RI', 'RL', 'RM', 'RN', 'RO', 'RP', 'RS', 'RT', 'RU', 'RV', 'RW', 'RZ',
      'SB', 'SC', 'SE', 'SG', 'SH', 'SI', 'SK', 'SL', 'SM', 'SN', 'SO', 'SP', 'SR', 'ST', 'SU', 'SW', 'SY', 'SZ',
      'TE', 'TF', 'TG', 'TO', 'TP', 'TR', 'TS', 'TU', 'TZ',
      'UE', 'UH', 'UL', 'UM', 'UN',
      'VB', 'VE', 'VG', 'VK', 'VR', 'VS',
      'WA', 'WB', 'WE', 'WF', 'WI', 'WK', 'WL', 'WM', 'WN', 'WO', 'WR', 'WS', 'WT', 'WU', 'WW', 'WZ',
      'ZE', 'ZI', 'ZP', 'ZR', 'ZW', 'ZZ',
      // 3 Buchstaben (häufige)
      'ABI', 'AIB', 'AIC', 'ALF', 'ALZ', 'ANA', 'ANG', 'ANK', 'APD', 'ARN', 'ART', 'ASL', 'ASZ', 'AUR', 'AZE',
      'BAD', 'BAR', 'BBG', 'BCH', 'BED', 'BER', 'BGD', 'BGL', 'BID', 'BIN', 'BIR', 'BIT', 'BIW', 'BKS', 'BLB', 'BLK', 'BNA', 'BOG', 'BOH', 'BOR', 'BOT', 'BRA', 'BRB', 'BRG', 'BRK', 'BRL', 'BRV', 'BSB', 'BSK', 'BTF', 'BUL', 'BUR', 'BUS', 'BUT', 'BUZ',
      'CAS', 'CHA', 'CLP', 'CLZ', 'COC', 'COE', 'CUX',
      'DAH', 'DAN', 'DAU', 'DBR', 'DEG', 'DEL', 'DGF', 'DIL', 'DIN', 'DIZ', 'DKB', 'DLG', 'DON', 'DUD', 'DUR',
      'EBE', 'EBN', 'EBS', 'ECK', 'EIC', 'EIL', 'EIN', 'EIS', 'EMD', 'EMS', 'ERB', 'ERH', 'ERK', 'ERZ', 'ESB', 'ESW', 'EUT',
      'FDB', 'FDS', 'FEU', 'FFB', 'FKB', 'FLO', 'FOR', 'FRE', 'FRG', 'FRI', 'FRW', 'FTL', 'FUE',
      'GAN', 'GAP', 'GDB', 'GEL', 'GEO', 'GER', 'GHA', 'GHC', 'GLA', 'GMN', 'GNT', 'GOA', 'GOH', 'GRA', 'GRH', 'GRI', 'GRM', 'GRZ', 'GTH', 'GUB', 'GUE', 'GUN', 'GVM',
      'HAB', 'HAL', 'HAM', 'HAS', 'HBN', 'HBS', 'HCH', 'HDH', 'HDL', 'HEB', 'HEF', 'HEI', 'HER', 'HET', 'HGN', 'HGW', 'HIL', 'HIP', 'HMU', 'HOG', 'HOH', 'HOL', 'HOM', 'HOR', 'HOT', 'HRO', 'HSK', 'HST', 'HVL', 'HWI',
      'IGB', 'ILL',
      'JUL',
      'KAR', 'KEH', 'KEL', 'KEM', 'KIB', 'KLE', 'KLZ', 'KOE', 'KON', 'KOT', 'KRU', 'KUS', 'KYF',
      'LAN', 'LAU', 'LBS', 'LBZ', 'LDK', 'LDS', 'LEO', 'LER', 'LEV', 'LIF', 'LIP', 'LOS', 'LRO', 'LSA', 'LSN', 'LSZ', 'LUP', 'LWL',
      'MAB', 'MAI', 'MAK', 'MAL', 'MED', 'MEG', 'MEI', 'MEK', 'MEL', 'MER', 'MET', 'MGH', 'MGN', 'MHL', 'MIL', 'MKK', 'MOD', 'MOL', 'MON', 'MOS', 'MSE', 'MSH', 'MSP', 'MST', 'MTK', 'MTL', 'MUE', 'MUR', 'MYK', 'MZG',
      'NAB', 'NAI', 'NAU', 'NDH', 'NEA', 'NEB', 'NEC', 'NEN', 'NES', 'NEW', 'NMS', 'NOH', 'NOL', 'NOM', 'NOR', 'NVP',
      'OAL', 'OBB', 'OBG', 'OCH', 'OHA', 'OHV', 'OHZ', 'OPR', 'OSL', 'OVI', 'OVP',
      'PAF', 'PAN', 'PAR', 'PCH', 'PEG', 'PIR', 'PLO', 'PLR', 'POL', 'PRU', 'PST',
      'QFT',
      'RDG', 'REG', 'REH', 'REI', 'RID', 'RIE', 'ROD', 'ROF', 'ROK', 'ROL', 'ROS', 'ROT', 'ROW', 'RSL', 'RUD', 'RUE',
      'SAB', 'SAD', 'SAN', 'SAW', 'SBG', 'SBK', 'SCZ', 'SDH', 'SDL', 'SDT', 'SEB', 'SEE', 'SEF', 'SEL', 'SFB', 'SFT', 'SGH', 'SHA', 'SHG', 'SHK', 'SHL', 'SIG', 'SIM', 'SLF', 'SLK', 'SLN', 'SLS', 'SLZ', 'SMU', 'SOB', 'SOG', 'SOK', 'SOM', 'SON', 'SPB', 'SPN', 'SRB', 'SRO', 'STA', 'STB', 'STD', 'STE', 'STH', 'STL', 'SUL', 'SUW', 'SWA', 'SZB',
      'TBB', 'TDO', 'TET', 'THL', 'THW', 'TIR', 'TOL', 'TUT',
      'UEM', 'UER', 'UFF',
      'VAI', 'VEC', 'VER', 'VIB', 'VIE', 'VIT', 'VOH',
      'WAF', 'WAK', 'WAN', 'WAR', 'WAT', 'WBS', 'WDA', 'WEL', 'WEN', 'WER', 'WES', 'WHV', 'WIG', 'WIL', 'WIS', 'WIT', 'WIZ', 'WLG', 'WMS', 'WND', 'WOB', 'WOH', 'WOL', 'WOR', 'WOS', 'WRN', 'WSF', 'WST', 'WSW', 'WTL', 'WTM', 'WUG', 'WUN', 'WUR', 'WZL',
      'ZEL', 'ZIG'
    ];
    
    const upperPlate = plate.toUpperCase().trim();
    
    // Versuche verschiedene Präfixlängen (3, 2, 1 Buchstaben)
    for (const prefixLen of [3, 2, 1]) {
      const prefix = upperPlate.substring(0, prefixLen);
      if (cityPrefixes.includes(prefix)) {
        const rest = upperPlate.substring(prefixLen);
        
        // Rest aufteilen: Buchstaben (1-2) + Zahlen (1-4) + optional E/H
        const match = rest.match(/^([A-Z]{1,2})(\d{1,4})([EH])?$/i);
        if (match) {
          const letters = match[1];
          const numbers = match[2];
          const suffix = match[3] || '';
          
          // Format: XX-YY-1234 oder XX-YY-1234E (E direkt an Zahl)
          return `${prefix}-${letters}-${numbers}${suffix}`;
        }
      }
    }
    
    // Fallback: Original zurückgeben
    return plate;
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

  function extractCarId(rowElement) {
    try {
      // Suche nach dem Link mit data-details Attribut
      const detailLink = rowElement.querySelector('a[data-details]');
      if (detailLink) {
        const carId = detailLink.getAttribute('data-details');
        if (carId && /^\d+$/.test(carId)) {
          return carId;
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
      carId: extractCarId(rowElement),
      kennzeichen: extractKennzeichen(rowElement),
      marke: extractBrand(rowElement),
      modell: extractModell(rowElement),
      vertragsende: extractVertragsende(rowElement),
      leasingrate: extractLeasingrate(rowElement),
      standort: extractStandort(rowElement),
      vertragsProzent: extractVertragsProzent(rowElement),
      availability: null,
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
  // AVAILABILITY API
  // ============================================

  /**
   * Holt die gebuchten Tage für ein Fahrzeug von der API
   * @param {string} carId - Die Fahrzeug-ID (z.B. "3850")
   * @param {string} fromDate - Startdatum YYYY-MM-DD
   * @param {string} toDate - Enddatum YYYY-MM-DD
   * @returns {Promise<Object|null>} - { "2026-02-10": { ratio: 1.0 }, ... } oder null bei Fehler
   */
  async function fetchBookedDays(carId, fromDate, toDate) {
    try {
      const response = await fetch('https://cgi.fleets.eu/api/pool/booked-days', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          ids: carId,
          f: fromDate,
          t: toDate
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        console.warn(`[Fleets] API error for car ${carId}: ${response.status}`);
        return null;
      }

      const data = await response.json();
      
      // API Response kann verschiedene Formate haben:
      // 1. { "3850": { "2026-02-10": { ratio: 1.0 }, ... } } - carId als Key
      // 2. { "2026-02-10": { ratio: 1.0 }, ... } - direkt die Daten
      // 3. { } - Leeres Objekt = keine blockierten Tage = komplett frei
      
      // Prüfe ob carId als Key existiert
      if (data[carId] && typeof data[carId] === 'object') {
        return data[carId];
      }
      
      const keys = Object.keys(data);
      
      // Leeres Objekt = keine blockierten Tage = komplett frei
      if (keys.length === 0) {
        console.log(`[Fleets] Car ${carId}: No blocked days (empty response = fully available)`);
        return {};  // Leeres Objekt zurückgeben, parseAvailability behandelt das als "frei"
      }
      
      // Prüfe ob die Response direkt Datums-Keys enthält
      if (keys.length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(keys[0])) {
        return data;
      }
      
      // Fallback: Erste verschachtelte Ebene prüfen
      const firstKey = keys[0];
      if (firstKey && typeof data[firstKey] === 'object') {
        // Könnte sein: { "2558": {} } - carId mit leerem Objekt
        const nested = data[firstKey];
        if (Object.keys(nested).length === 0) {
          console.log(`[Fleets] Car ${carId}: No blocked days (nested empty = fully available)`);
          return {};
        }
        return nested;
      }

      console.warn(`[Fleets] Unexpected API response format for car ${carId}:`, data);
      return null;
    } catch (error) {
      console.warn(`[Fleets] Failed to fetch booked days for ${carId}:`, error);
      return null;
    }
  }

  /**
   * Analysiert die Verfügbarkeitsdaten und erstellt einen Status
   * @param {Object} bookedDays - API Response { "YYYY-MM-DD": { ratio: number }, ... }
   * @param {string} contractEndDate - Vertragsende als "DD.MM.YYYY"
   * @returns {Object} - { status, label, nextFreeDate, freeMonths, monthlyData }
   */
  function parseAvailability(bookedDays, contractEndDate) {
    const result = {
      status: 'unknown',      // 'free', 'blocked', 'soon', 'unknown'
      label: '—',             // Anzeige-Text
      nextFreeDate: null,     // Nächster freier Tag (Date)
      freeMonths: 0,          // Anzahl freier Monate ab heute
      monthlyData: []         // Array für Heatmap: [{ month: 'Jan', year: 2026, status: 'free'|'partial'|'blocked' }]
    };

    if (!bookedDays || typeof bookedDays !== 'object') {
      result.status = 'unknown';
      result.label = '—';
      return result;
    }

    // Wenn keine blockierten Tage, ist alles frei
    if (Object.keys(bookedDays).length === 0) {
      result.status = 'free';
      result.label = 'Frei';
      // Alle 12 Monate als frei markieren für Heatmap
      const monthNames = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
      const today = new Date();
      for (let i = 0; i < 12; i++) {
        const monthStart = new Date(today.getFullYear(), today.getMonth() + i, 1);
        result.monthlyData.push({
          month: monthNames[monthStart.getMonth()],
          year: monthStart.getFullYear(),
          status: 'free',
          freeDays: 30,
          totalDays: 30
        });
      }
      result.freeMonths = 12;
      return result;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Vertragsende parsen (DD.MM.YYYY -> Date)
    let contractEnd = null;
    if (contractEndDate) {
      const parts = contractEndDate.split('.');
      if (parts.length === 3) {
        contractEnd = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
    }
    
    // Fallback: Vertragsende = heute + 2 Jahre
    if (!contractEnd) {
      contractEnd = new Date(today);
      contractEnd.setFullYear(contractEnd.getFullYear() + 2);
    }

    // Set für schnellen Lookup der blockierten Tage
    const blockedDaysSet = new Set();
    for (const [dateStr, data] of Object.entries(bookedDays)) {
      // Tag ist blockiert wenn ratio >= 1.0
      if (data && data.ratio >= 1.0) {
        blockedDaysSet.add(dateStr);
      }
    }

    /**
     * Hilfsfunktion: Formatiert Date zu YYYY-MM-DD (lokale Zeit, keine UTC!)
     */
    function formatDateLocal(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    /**
     * Hilfsfunktion: Prüft ob ein Datum blockiert ist
     */
    function isDayBlocked(date) {
      const dateStr = formatDateLocal(date);
      return blockedDaysSet.has(dateStr);
    }

    // Prüfen ob heute frei ist
    const isTodayFree = !isDayBlocked(today);

    // Nächsten freien Tag finden (falls heute blockiert)
    let nextFree = null;
    if (!isTodayFree) {
      // Iteriere durch jeden Tag ab heute bis Vertragsende
      const searchDate = new Date(today);
      while (searchDate <= contractEnd) {
        if (!isDayBlocked(searchDate)) {
          nextFree = new Date(searchDate);
          break;
        }
        searchDate.setDate(searchDate.getDate() + 1);
      }
    }

    // Monatliche Auswertung für Heatmap (nächste 12 Monate)
    const monthNames = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
    let consecutiveFreeMonths = 0;
    let countingFree = isTodayFree;

    // Debug: Zeige blockierte Tage
    console.log(`[Fleets] Blocked days count: ${blockedDaysSet.size}`);

    for (let i = 0; i < 12; i++) {
      const monthStart = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + i + 1, 0);
      
      // Prüfen ob Monat nach Vertragsende liegt
      if (contractEnd && monthStart > contractEnd) {
        result.monthlyData.push({
          month: monthNames[monthStart.getMonth()],
          year: monthStart.getFullYear(),
          status: 'past',
          freeDays: 0,
          totalDays: 0
        });
        continue;
      }

      // Tage im Monat zählen
      let freeDays = 0;
      let blockedDays = 0;
      let totalDays = 0;

      const currentDay = new Date(monthStart);
      while (currentDay <= monthEnd) {
        // Vergangene Tage und Tage nach Vertragsende ignorieren
        if (currentDay >= today && currentDay <= contractEnd) {
          totalDays++;
          if (isDayBlocked(currentDay)) {
            blockedDays++;
          } else {
            freeDays++;
          }
        }
        currentDay.setDate(currentDay.getDate() + 1);
      }

      let monthStatus = 'free';
      if (totalDays === 0) {
        monthStatus = 'past';
      } else if (blockedDays === totalDays) {
        monthStatus = 'blocked';
      } else if (freeDays === totalDays) {
        monthStatus = 'free';
      } else {
        monthStatus = 'partial';
      }

      // Debug: Zeige Monatsauswertung
      console.log(`[Fleets] ${monthNames[monthStart.getMonth()]} ${monthStart.getFullYear()}: ${freeDays}/${totalDays} frei → ${monthStatus}`);

      result.monthlyData.push({
        month: monthNames[monthStart.getMonth()],
        year: monthStart.getFullYear(),
        status: monthStatus,
        freeDays,
        totalDays
      });

      // Zusammenhängende freie Monate zählen (ab heute)
      if (countingFree && monthStatus === 'free') {
        consecutiveFreeMonths++;
      } else if (countingFree && monthStatus === 'partial') {
        // Partial zählt als "teilweise frei", weiter zählen
        consecutiveFreeMonths++;
      } else if (monthStatus === 'blocked') {
        countingFree = false;
      }
    }

    // Status und Label bestimmen
    if (isTodayFree) {
      result.status = 'free';
      result.freeMonths = consecutiveFreeMonths;
      if (consecutiveFreeMonths >= 12) {
        result.label = 'Frei';
      } else if (consecutiveFreeMonths > 0) {
        result.label = `Frei (${consecutiveFreeMonths}M)`;
      } else {
        result.label = 'Frei';
      }
    } else if (nextFree) {
      result.status = 'soon';
      result.nextFreeDate = nextFree;
      const day = nextFree.getDate().toString().padStart(2, '0');
      const month = (nextFree.getMonth() + 1).toString().padStart(2, '0');
      result.label = `Ab ${day}.${month}`;
    } else {
      result.status = 'blocked';
      result.label = 'Blockiert';
    }

    return result;
  }

  /**
   * Lädt Verfügbarkeit für ein Fahrzeug und aktualisiert die UI
   */
  async function loadVehicleAvailability(vehicle) {
    // Hilfsfunktion: Formatiert Date zu YYYY-MM-DD (lokale Zeit)
    function formatDateLocal(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    // Startdatum: heute
    const today = new Date();
    const fromDate = formatDateLocal(today);
    
    // Enddatum: Vertragsende oder +12 Monate
    let toDate;
    if (vehicle.vertragsende) {
      const parts = vehicle.vertragsende.split('.');
      if (parts.length === 3) {
        toDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    if (!toDate) {
      const futureDate = new Date(today);
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      toDate = formatDateLocal(futureDate);
    }

    // Car ID aus Kennzeichen extrahieren (wir brauchen die numerische ID)
    // Problem: Wir haben nur das Kennzeichen, nicht die ID
    // Lösung: Wir müssen die ID aus dem DOM extrahieren beim Scrapen
    if (!vehicle.carId) {
      return null;
    }

    const bookedDays = await fetchBookedDays(vehicle.carId, fromDate, toDate);
    if (!bookedDays) {
      return null;
    }

    return parseAvailability(bookedDays, vehicle.vertragsende);
  }

  /**
   * Lädt Verfügbarkeit für alle Fahrzeuge im Hintergrund
   */
  async function loadAllAvailability(vehicles) {
    console.log(`[Fleets] Loading availability for ${vehicles.length} vehicles...`);
    
    // Rate limiting: Max 3 parallele Requests
    const BATCH_SIZE = 3;
    const DELAY_BETWEEN_BATCHES = 500;

    for (let i = 0; i < vehicles.length; i += BATCH_SIZE) {
      const batch = vehicles.slice(i, i + BATCH_SIZE);
      
      await Promise.all(batch.map(async (vehicle) => {
        if (!vehicle.carId) return;
        
        const availability = await loadVehicleAvailability(vehicle);
        if (availability) {
          vehicle.availability = availability;
          updateAvailabilityCell(vehicle.id, availability);
        }
      }));

      // Kurze Pause zwischen Batches
      if (i + BATCH_SIZE < vehicles.length) {
        await new Promise(r => setTimeout(r, DELAY_BETWEEN_BATCHES));
      }
    }

    console.log('[Fleets] Availability loading complete');
  }

  /**
   * Aktualisiert die Verfügbarkeits-Zelle in der Tabelle
   */
  function updateAvailabilityCell(vehicleId, availability) {
    const cell = document.querySelector(`[data-vehicle-id="${vehicleId}"] .fleets-availability`);
    if (!cell) return;

    cell.className = `fleets-availability fleets-availability-${availability.status}`;
    
    // Clear and rebuild
    while (cell.firstChild) cell.removeChild(cell.firstChild);
    
    const dot = createElement('span', { className: 'fleets-availability-dot' });
    const text = createElement('span', { textContent: availability.label });
    
    cell.appendChild(dot);
    cell.appendChild(text);
  }

  // ============================================
  // HEATMAP POPUP
  // ============================================

  let activeHeatmapPopup = null;

  /**
   * Zeigt das Heatmap-Popup für ein Fahrzeug
   */
  function showHeatmapPopup(vehicle, targetElement) {
    // Schließe vorheriges Popup
    closeHeatmapPopup();

    const availability = vehicle.availability;
    if (!availability || !availability.monthlyData || availability.monthlyData.length === 0) {
      // Lade Daten falls nicht vorhanden
      loadVehicleAvailability(vehicle).then(avail => {
        if (avail) {
          vehicle.availability = avail;
          updateAvailabilityCell(vehicle.id, avail);
          showHeatmapPopup(vehicle, targetElement);
        }
      });
      return;
    }

    // Popup erstellen
    const popup = createElement('div', { className: 'fleets-heatmap-popup' });

    // Header
    const header = createElement('div', { className: 'fleets-heatmap-header' });
    
    const titleContainer = createElement('div', { className: 'fleets-heatmap-title' });
    const plateBadge = createElement('span', {
      className: 'fleets-heatmap-plate',
      textContent: formatLicensePlate(vehicle.kennzeichen) || '—'
    });
    const subtitle = createElement('span', {
      className: 'fleets-heatmap-subtitle',
      textContent: 'Verfügbarkeit'
    });
    titleContainer.appendChild(plateBadge);
    titleContainer.appendChild(subtitle);
    
    const closeBtn = createElement('button', {
      className: 'fleets-heatmap-close',
      textContent: '×'
    });
    closeBtn.addEventListener('click', closeHeatmapPopup);
    header.appendChild(titleContainer);
    header.appendChild(closeBtn);

    // Heatmap Grid (2 Reihen à 6 Monate)
    const grid = createElement('div', { className: 'fleets-heatmap-grid' });

    availability.monthlyData.forEach((month, idx) => {
      const monthEl = createElement('div', { className: 'fleets-heatmap-month' });
      
      const label = createElement('span', {
        className: 'fleets-heatmap-label',
        textContent: month.month
      });

      const cell = createElement('div', {
        className: `fleets-heatmap-cell ${month.status}`,
        title: getMonthTooltip(month)
      });

      // Icon oder Prozent anzeigen
      if (month.status === 'free') {
        cell.textContent = '●';
        cell.style.fontSize = '14px';
      } else if (month.status === 'blocked') {
        cell.textContent = '●';
        cell.style.fontSize = '14px';
      } else if (month.status === 'partial' && month.totalDays > 0) {
        const pct = Math.round((month.freeDays / month.totalDays) * 100);
        cell.textContent = `${pct}%`;
      } else if (month.status === 'past') {
        cell.textContent = '—';
      }

      monthEl.appendChild(label);
      monthEl.appendChild(cell);
      grid.appendChild(monthEl);
    });

    // Legende
    const legend = createElement('div', { className: 'fleets-heatmap-legend' });
    
    const legendItems = [
      { status: 'free', label: 'Frei' },
      { status: 'partial', label: 'Teilweise' },
      { status: 'blocked', label: 'Blockiert' }
    ];

    legendItems.forEach(item => {
      const legendItem = createElement('div', { className: 'fleets-heatmap-legend-item' });
      const dot = createElement('span', { className: `fleets-heatmap-legend-dot ${item.status}` });
      const text = createElement('span', { textContent: item.label });
      legendItem.appendChild(dot);
      legendItem.appendChild(text);
      legend.appendChild(legendItem);
    });

    // Zusammenbauen
    popup.appendChild(header);
    popup.appendChild(grid);
    popup.appendChild(legend);

    document.body.appendChild(popup);

    // Position berechnen
    const rect = targetElement.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();

    let left = rect.left - popupRect.width - 10;
    let top = rect.top + (rect.height / 2) - (popupRect.height / 2);

    // Sicherstellen, dass Popup im Viewport bleibt
    if (left < 10) {
      left = rect.right + 10;
    }
    if (top < 10) {
      top = 10;
    }
    if (top + popupRect.height > window.innerHeight - 10) {
      top = window.innerHeight - popupRect.height - 10;
    }

    popup.style.left = `${left}px`;
    popup.style.top = `${top}px`;

    // Animation
    requestAnimationFrame(() => {
      popup.classList.add('show');
    });

    activeHeatmapPopup = popup;

    // Schließen bei Klick außerhalb
    setTimeout(() => {
      document.addEventListener('click', handleOutsideClick);
    }, 100);
  }

  function getMonthTooltip(month) {
    if (month.status === 'past') {
      return 'Nach Vertragsende';
    }
    if (month.totalDays === 0) {
      return month.month;
    }
    return `${month.month}: ${month.freeDays}/${month.totalDays} Tage frei`;
  }

  function handleOutsideClick(e) {
    if (activeHeatmapPopup && !activeHeatmapPopup.contains(e.target)) {
      closeHeatmapPopup();
    }
  }

  function closeHeatmapPopup() {
    if (activeHeatmapPopup) {
      activeHeatmapPopup.classList.remove('show');
      setTimeout(() => {
        if (activeHeatmapPopup) {
          activeHeatmapPopup.remove();
          activeHeatmapPopup = null;
        }
      }, 200);
    }
    document.removeEventListener('click', handleOutsideClick);
  }

  // ============================================
  // RATE POPUP (Geldwerter Vorteil)
  // ============================================

  let activeRatePopup = null;

  /**
   * Holt Fahrzeugdetails von der API
   */
  async function fetchCarDetails(carId) {
    try {
      const response = await fetch('https://cgi.fleets.eu/api/pool/car-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ id: carId }),
        credentials: 'include'
      });

      if (!response.ok) {
        console.warn(`[Fleets] Car details API error for ${carId}: ${response.status}`);
        return null;
      }

      const data = await response.json();
      console.log(`[Fleets] API Response for car ${carId}:`, data);
      return data;
    } catch (error) {
      console.warn(`[Fleets] Failed to fetch car details for ${carId}:`, error);
      return null;
    }
  }

  /**
   * Berechnet den geldwerten Vorteil (1%-Regel)
   * @param {number} blp - Bruttolistenpreis
   * @param {string} fuelType - ELECTRIC, DIESEL, PETROL, HYBRID, etc.
   * @returns {Object} - { rate, percent, label }
   */
  function calculateGeldwerterVorteil(blp, fuelType) {
    if (!blp || blp <= 0) {
      return { rate: null, percent: null, label: 'Unbekannt' };
    }

    const fuelUpper = (fuelType || '').toUpperCase();
    let percent;
    let label;

    if (fuelUpper === 'ELECTRIC' || fuelUpper === 'ELEKTRO' || fuelUpper === 'BEV') {
      if (blp <= 70000) {
        percent = 0.25;
        label = 'E-Auto (≤70k)';
      } else {
        percent = 0.5;
        label = 'E-Auto (>70k)';
      }
    } else if (fuelUpper.includes('HYBRID') || fuelUpper.includes('PLUG') || fuelUpper === 'PHEV') {
      percent = 0.5;
      label = 'Plug-in-Hybrid';
    } else {
      // Verbrenner (DIESEL, PETROL, BENZIN, etc.)
      percent = 1.0;
      label = 'Verbrenner';
    }

    const rate = blp * (percent / 100);

    return {
      rate: Math.round(rate * 100) / 100,
      percent,
      label
    };
  }

  /**
   * Übersetzt Antriebsart ins Deutsche
   */
  function translateFuelType(fuelType) {
    if (!fuelType) return 'Unbekannt';
    
    const upper = fuelType.toUpperCase();
    
    // Exakte Matches zuerst
    const translations = {
      'ELECTRIC': 'Elektro',
      'ELEKTRO': 'Elektro',
      'BEV': 'Elektro',
      'DIESEL': 'Diesel',
      'PETROL': 'Benzin',
      'BENZIN': 'Benzin',
      'HYBRID': 'Hybrid',
      'PHEV': 'Plug-in-Hybrid',
      'PLUG-IN HYBRID': 'Plug-in-Hybrid',
      'PLUG-IN-HYBRID': 'Plug-in-Hybrid',
      'HYBRID_PETROL': 'Hybrid (Benzin)',
      'HYBRID_DIESEL': 'Hybrid (Diesel)',
      'PETROL_HYBRID': 'Hybrid (Benzin)',
      'DIESEL_HYBRID': 'Hybrid (Diesel)',
      'MILD_HYBRID': 'Mild-Hybrid',
      'MILD-HYBRID': 'Mild-Hybrid',
      'LPG': 'Autogas (LPG)',
      'CNG': 'Erdgas (CNG)',
      'HYDROGEN': 'Wasserstoff'
    };
    
    if (translations[upper]) {
      return translations[upper];
    }
    
    // Partial Matches für Kombinationen
    if (upper.includes('HYBRID') && upper.includes('PETROL')) {
      return 'Hybrid (Benzin)';
    }
    if (upper.includes('HYBRID') && upper.includes('DIESEL')) {
      return 'Hybrid (Diesel)';
    }
    if (upper.includes('PLUG') && upper.includes('HYBRID')) {
      return 'Plug-in-Hybrid';
    }
    if (upper.includes('HYBRID')) {
      return 'Hybrid';
    }
    if (upper.includes('ELECTRIC')) {
      return 'Elektro';
    }
    
    return fuelType;
  }

  /**
   * Zeigt das Rate-Popup mit geldwertem Vorteil
   */
  async function showRatePopup(vehicle, targetElement) {
    // Schließe vorherige Popups
    closeRatePopup();
    closeHeatmapPopup();

    if (!vehicle.carId) {
      return;
    }

    // Popup erstellen (Loading-State)
    const popup = createElement('div', { className: 'fleets-rate-popup loading' });
    const loadingText = createElement('span', {
      className: 'fleets-rate-loading',
      textContent: 'Lade Daten...'
    });
    popup.appendChild(loadingText);

    document.body.appendChild(popup);

    // Position berechnen
    const rect = targetElement.getBoundingClientRect();
    let left = rect.left - 250;
    let top = rect.top + (rect.height / 2) - 60;

    if (left < 10) left = rect.right + 10;
    if (top < 10) top = 10;
    if (top + 150 > window.innerHeight) top = window.innerHeight - 160;

    popup.style.left = `${left}px`;
    popup.style.top = `${top}px`;

    requestAnimationFrame(() => popup.classList.add('show'));
    activeRatePopup = popup;

    // API-Call für Details
    const details = await fetchCarDetails(vehicle.carId);

    // Popup neu aufbauen mit Daten
    while (popup.firstChild) popup.removeChild(popup.firstChild);
    popup.classList.remove('loading');

    // Header
    const header = createElement('div', { className: 'fleets-rate-header' });
    const titleContainer = createElement('div', { className: 'fleets-rate-title' });
    const plateBadge = createElement('span', {
      className: 'fleets-rate-plate',
      textContent: formatLicensePlate(vehicle.kennzeichen) || '—'
    });
    titleContainer.appendChild(plateBadge);
    
    const closeBtn = createElement('button', {
      className: 'fleets-rate-close',
      textContent: '×'
    });
    closeBtn.addEventListener('click', closeRatePopup);
    header.appendChild(titleContainer);
    header.appendChild(closeBtn);

    // Content
    const content = createElement('div', { className: 'fleets-rate-content' });

    if (details) {
      // Bruttolistenpreis extrahieren (verschiedene Formate möglich)
      let blp = null;
      const grossPrice = details.Gross_List_Price;
      
      if (grossPrice) {
        if (typeof grossPrice === 'number') {
          blp = grossPrice;
        } else if (typeof grossPrice === 'string') {
          blp = parseFloat(grossPrice.replace(',', '.'));
        } else if (typeof grossPrice === 'object') {
          blp = grossPrice.parsedValue || parseFloat(grossPrice.source);
        }
      }
      
      // Fallback: CC_Price_From_Order verwenden
      if (!blp && details.CC_Price_From_Order) {
        // CC_Price ist monatlich, BLP schätzen (x36 Monate als grobe Näherung)
        // Aber besser als nichts anzeigen
      }
      
      console.log(`[Fleets] Car details for ${vehicle.carId}:`, {
        Gross_List_Price: details.Gross_List_Price,
        Fuel_Type: details.Fuel_Type,
        parsedBLP: blp
      });

      const fuelType = details.Fuel_Type || 'Unbekannt';
      const fuelTypeGerman = translateFuelType(fuelType);
      const gvv = calculateGeldwerterVorteil(blp, fuelType);

      // Bruttolistenpreis
      const blpRow = createElement('div', { className: 'fleets-rate-row' });
      blpRow.appendChild(createElement('span', { className: 'fleets-rate-label', textContent: 'Bruttolistenpreis' }));
      blpRow.appendChild(createElement('span', { 
        className: 'fleets-rate-value', 
        textContent: blp ? `${Number(blp).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €` : '—'
      }));
      content.appendChild(blpRow);

      // Antriebsart
      const fuelRow = createElement('div', { className: 'fleets-rate-row' });
      fuelRow.appendChild(createElement('span', { className: 'fleets-rate-label', textContent: 'Antrieb' }));
      fuelRow.appendChild(createElement('span', { className: 'fleets-rate-value', textContent: fuelTypeGerman }));
      content.appendChild(fuelRow);

      // Leasingrate
      const rateRow = createElement('div', { className: 'fleets-rate-row' });
      rateRow.appendChild(createElement('span', { className: 'fleets-rate-label', textContent: 'Leasingrate' }));
      rateRow.appendChild(createElement('span', { 
        className: 'fleets-rate-value', 
        textContent: vehicle.leasingrate ? `${vehicle.leasingrate.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €` : '—'
      }));
      content.appendChild(rateRow);

      // Divider
      content.appendChild(createElement('div', { className: 'fleets-rate-divider' }));

      // Geldwerter Vorteil (Highlight)
      if (gvv.rate) {
        const gvvBox = createElement('div', { className: 'fleets-rate-highlight' });
        
        // Hauptzeile: Titel + Betrag
        const mainRow = createElement('div', { className: 'fleets-rate-highlight-header' });
        mainRow.appendChild(createElement('span', { 
          className: 'fleets-rate-highlight-label', 
          textContent: 'Geldwerter Vorteil'
        }));
        mainRow.appendChild(createElement('span', { 
          className: 'fleets-rate-highlight-value', 
          textContent: `${gvv.rate.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €`
        }));
        gvvBox.appendChild(mainRow);

        // Info-Zeile: Antriebstyp + Prozentsatz
        const infoRow = createElement('div', { className: 'fleets-rate-highlight-info' });
        infoRow.appendChild(createElement('span', { 
          className: 'fleets-rate-highlight-type', 
          textContent: gvv.label
        }));
        infoRow.appendChild(createElement('span', { 
          className: 'fleets-rate-highlight-percent', 
          textContent: `${gvv.percent}%`
        }));
        gvvBox.appendChild(infoRow);

        content.appendChild(gvvBox);
      }
    } else {
      content.appendChild(createElement('span', { 
        className: 'fleets-rate-loading', 
        textContent: 'Daten konnten nicht geladen werden'
      }));
    }

    popup.appendChild(header);
    popup.appendChild(content);

    // Schließen bei Klick außerhalb
    setTimeout(() => {
      document.addEventListener('click', handleRateOutsideClick);
    }, 100);
  }

  function handleRateOutsideClick(e) {
    if (activeRatePopup && !activeRatePopup.contains(e.target)) {
      closeRatePopup();
    }
  }

  function closeRatePopup() {
    if (activeRatePopup) {
      activeRatePopup.classList.remove('show');
      setTimeout(() => {
        if (activeRatePopup) {
          activeRatePopup.remove();
          activeRatePopup = null;
        }
      }, 200);
    }
    document.removeEventListener('click', handleRateOutsideClick);
  }

  /**
   * Öffnet das Fahrzeug-Detail-Modal durch Klick auf den Original-Link
   */
  function openVehicleModal(carId) {
    // Finde den Original-Link mit data-details Attribut
    const detailsLink = document.querySelector(`a[data-details="${carId}"]`);
    
    if (detailsLink) {
      // Simuliere Klick auf den Original-Link
      detailsLink.click();
    } else {
      console.warn(`[Fleets] Could not find details link for car ${carId}`);
      showToast('Fahrzeug-Details konnten nicht geöffnet werden', 'error');
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
      { value: 'availability', text: 'Verfügbarkeit' },
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
    ['Kennzeichen', 'Fahrzeug', 'Vertrag', 'Verfügbar', 'Rate', 'Standort'].forEach(text => {
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
      attributes: { colspan: '6' }
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

      // Verfügbarkeit im Hintergrund laden
      const vehiclesWithCarId = vehicles.filter(v => v.carId);
      if (vehiclesWithCarId.length > 0) {
        console.log(`[Fleets] Starting background availability load for ${vehiclesWithCarId.length} vehicles...`);
        loadAllAvailability(vehiclesWithCarId);
      }
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
        attributes: { colspan: '6' }
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

    // Cell 1: Kennzeichen (klickbar -> öffnet Modal)
    const cell1 = createElement('td');
    const cellPlate = createElement('div', { className: 'fleets-cell-plate' });
    const plateSpan = createElement('span', {
      className: v.carId ? 'fleets-plate fleets-plate-clickable' : 'fleets-plate',
      textContent: formatLicensePlate(sanitizeText(v.kennzeichen)) || '—'
    });
    
    // Klick-Handler für Modal
    if (v.carId) {
      plateSpan.addEventListener('click', (e) => {
        e.stopPropagation();
        openVehicleModal(v.carId);
      });
    }
    
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

    // Cell 4: Verfügbarkeit
    const cell4 = createElement('td');
    const availStatus = v.availability?.status || 'loading';
    const availLabel = v.availability?.label || 'Laden...';
    
    const availBadge = createElement('div', {
      className: `fleets-availability fleets-availability-${availStatus}`,
      attributes: { 'data-car-id': v.carId || '' }
    });
    
    const availDot = createElement('span', { className: 'fleets-availability-dot' });
    const availText = createElement('span', { textContent: availLabel });
    
    availBadge.appendChild(availDot);
    availBadge.appendChild(availText);
    
    // Klick-Handler für Heatmap-Popup
    if (v.carId) {
      availBadge.addEventListener('click', (e) => {
        e.stopPropagation();
        showHeatmapPopup(v, e.target);
      });
    }
    
    cell4.appendChild(availBadge);

    // Cell 5: Rate (klickbar für Geldwerten Vorteil)
    const cell5 = createElement('td');
    const rateText = v.leasingrate 
      ? v.leasingrate.toLocaleString('de-DE', {
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2
        }) + ' €' 
      : '—';
    const rateSpan = createElement('span', {
      className: v.carId ? 'fleets-rate fleets-rate-clickable' : 'fleets-rate',
      textContent: rateText
    });
    
    // Klick-Handler für Rate-Popup
    if (v.carId) {
      rateSpan.addEventListener('click', (e) => {
        e.stopPropagation();
        showRatePopup(v, e.target);
      });
    }
    
    cell5.appendChild(rateSpan);

    // Cell 6: Standort
    const cell6 = createElement('td');
    const locationText = sanitizeText(v.standort) || '—';
    const locationSpan = createElement('span', {
      className: 'fleets-location',
      textContent: locationText
    });
    if (locationText.length > 20) {
      locationSpan.title = locationText;
    }
    cell6.appendChild(locationSpan);

    row.appendChild(cell1);
    row.appendChild(cell2);
    row.appendChild(cell3);
    row.appendChild(cell4);
    row.appendChild(cell5);
    row.appendChild(cell6);

    // Data-Attribut für spätere Updates
    row.setAttribute('data-vehicle-id', v.id);

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
      } else if (field === 'availability') {
        // Sortierung: free > soon > blocked > unknown
        const order = { free: 0, soon: 1, blocked: 2, unknown: 3, loading: 3 };
        valA = order[a.availability?.status] ?? 3;
        valB = order[b.availability?.status] ?? 3;
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
