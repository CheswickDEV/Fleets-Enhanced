/**
 * Fleets Enhanced - Background Script
 * Handles persistent storage operations and messaging between popup and content script
 * 
 * IMPORTANT: Storage Keys must be in sync with content_script.js!
 * Content Script uses: 'vehicles', 'lastScan', 'newCount'
 */

// Storage keys - synchronized with content_script.js
const STORAGE_KEYS = {
  VEHICLES: 'vehicles',
  LAST_SCAN: 'lastScan',
  NEW_COUNT: 'newCount'
};

/**
 * Initialize storage on first install
 */
browser.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    console.log('[Fleets Enhanced] Add-on installed, initializing storage...');
    await browser.storage.local.set({
      [STORAGE_KEYS.VEHICLES]: [],
      [STORAGE_KEYS.LAST_SCAN]: null,
      [STORAGE_KEYS.NEW_COUNT]: 0
    });
  }
});

/**
 * Handle messages from content script and popup
 */
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Fleets Enhanced] Message received:', message.action);
  
  switch (message.action) {
    case 'SAVE_VEHICLES':
      return handleSaveVehicles(message.data);
    
    case 'GET_VEHICLES':
      return handleGetVehicles();
    
    case 'GET_STATS':
      return handleGetStats();
    
    case 'CLEAR_NEW_MARKERS':
      return handleClearNewMarkers();
    
    default:
      console.warn('[Fleets Enhanced] Unknown action:', message.action);
      return Promise.resolve({ success: false, error: 'Unknown action' });
  }
});

/**
 * Save vehicles and perform diff to find new ones
 * Called by Content Script when it communicates via Message
 */
async function handleSaveVehicles(scannedVehicles) {
  try {
    const stored = await browser.storage.local.get(STORAGE_KEYS.VEHICLES);
    const existingVehicles = stored[STORAGE_KEYS.VEHICLES] || [];
    
    // Find new vehicles (by license plate / id)
    const existingIds = new Set(existingVehicles.map(v => v.id || v.kennzeichen));
    const newVehicles = scannedVehicles.filter(v => {
      const id = v.id || v.kennzeichen;
      return !existingIds.has(id);
    });
    
    // Mark new vehicles
    scannedVehicles.forEach(v => {
      const id = v.id || v.kennzeichen;
      v.isNew = !existingIds.has(id);
    });
    
    // Update storage
    await browser.storage.local.set({
      [STORAGE_KEYS.VEHICLES]: scannedVehicles,
      [STORAGE_KEYS.LAST_SCAN]: new Date().toISOString(),
      [STORAGE_KEYS.NEW_COUNT]: newVehicles.length
    });
    
    console.log(`[Fleets Enhanced] Saved ${scannedVehicles.length} vehicles, ${newVehicles.length} new`);
    
    return { 
      success: true, 
      totalCount: scannedVehicles.length,
      newCount: newVehicles.length,
      newVehicles: newVehicles
    };
  } catch (error) {
    console.error('[Fleets Enhanced] Error saving vehicles:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all stored vehicles
 */
async function handleGetVehicles() {
  try {
    const stored = await browser.storage.local.get([
      STORAGE_KEYS.VEHICLES, 
      STORAGE_KEYS.NEW_COUNT
    ]);
    
    const vehicles = stored[STORAGE_KEYS.VEHICLES] || [];
    const newVehiclePlates = vehicles
      .filter(v => v.isNew)
      .map(v => v.kennzeichen);
    
    return {
      success: true,
      vehicles: vehicles,
      newVehiclePlates: newVehiclePlates
    };
  } catch (error) {
    console.error('[Fleets Enhanced] Error getting vehicles:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get statistics for popup display
 */
async function handleGetStats() {
  try {
    const stored = await browser.storage.local.get([
      STORAGE_KEYS.VEHICLES,
      STORAGE_KEYS.LAST_SCAN,
      STORAGE_KEYS.NEW_COUNT
    ]);
    
    const vehicles = stored[STORAGE_KEYS.VEHICLES] || [];
    const newCount = stored[STORAGE_KEYS.NEW_COUNT] || 0;
    
    return {
      success: true,
      stats: {
        totalVehicles: vehicles.length,
        lastScan: stored[STORAGE_KEYS.LAST_SCAN] || null,
        newVehiclesCount: newCount
      }
    };
  } catch (error) {
    console.error('[Fleets Enhanced] Error getting stats:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Clear new vehicle markers (reset isNew flags)
 */
async function handleClearNewMarkers() {
  try {
    const stored = await browser.storage.local.get(STORAGE_KEYS.VEHICLES);
    const vehicles = stored[STORAGE_KEYS.VEHICLES] || [];
    
    // Reset all isNew flags
    vehicles.forEach(v => v.isNew = false);
    
    await browser.storage.local.set({
      [STORAGE_KEYS.VEHICLES]: vehicles,
      [STORAGE_KEYS.NEW_COUNT]: 0
    });
    
    return { success: true };
  } catch (error) {
    console.error('[Fleets Enhanced] Error clearing markers:', error);
    return { success: false, error: error.message };
  }
}

console.log('[Fleets Enhanced] Background script loaded');
