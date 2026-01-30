/**
 * Fleets Enhanced - Popup Script
 * Shows statistics from storage
 */

const FLEETS_URL = 'https://fleets.eu';
const FLEETS_MATCH_PATTERN = '*://*.fleets.eu/*';

/**
 * Initialize popup
 */
async function init() {
  await loadStats();
  setupEventListeners();
  checkConnection();
}

/**
 * Load statistics from storage
 * Tries via Background Script first, then direct storage access
 */
async function loadStats() {
  try {
    // Method 1: Via Background Script Message
    const response = await browser.runtime.sendMessage({ action: 'GET_STATS' });
    
    if (response && response.success) {
      displayStats(response.stats);
      return;
    }
  } catch (error) {
    console.log('[Popup] Background message failed, trying direct storage access:', error);
  }
  
  // Method 2: Direct storage read (Fallback)
  try {
    const stored = await browser.storage.local.get(['vehicles', 'lastScan', 'newCount']);
    const vehicles = stored.vehicles || [];
    
    displayStats({
      totalVehicles: vehicles.length,
      lastScan: stored.lastScan || null,
      newVehiclesCount: stored.newCount || 0
    });
  } catch (error) {
    console.error('[Popup] Error loading stats:', error);
    displayStats({ totalVehicles: 0, lastScan: null, newVehiclesCount: 0 });
  }
}

/**
 * Display statistics in the UI
 */
function displayStats(stats) {
  const { totalVehicles, lastScan, newVehiclesCount } = stats;
  
  document.getElementById('total-count').textContent = totalVehicles || '0';
  document.getElementById('new-count').textContent = newVehiclesCount || '0';
  
  if (lastScan) {
    const date = new Date(lastScan);
    document.getElementById('last-scan').textContent = date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } else {
    document.getElementById('last-scan').textContent = 'No scan yet';
  }
}

/**
 * Check connection status and update UI dot
 */
async function checkConnection() {
  const statusContainer = document.getElementById('status-container');
  const statusText = document.getElementById('status');
  
  // Reset classes first
  statusContainer.classList.remove('connected', 'disconnected');
  
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    
    // Check if we're on the right URL
    if (currentTab?.url?.includes('fleets.eu')) {
      statusText.textContent = 'Connected to Portal';
      statusContainer.classList.add('connected');
    } else {
      statusText.textContent = 'Not on Fleets Portal';
      statusContainer.classList.add('disconnected');
    }
  } catch (error) {
    statusText.textContent = 'Status unknown';
    // Default gray stays
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Open Fleets page (Smart Switch)
  document.getElementById('open-page').addEventListener('click', async () => {
    try {
      // 1. Search for existing tabs
      const existingTabs = await browser.tabs.query({ url: FLEETS_MATCH_PATTERN });
      
      if (existingTabs && existingTabs.length > 0) {
        // 2. If found: Switch to first match
        const tab = existingTabs[0];
        
        // Activate tab
        await browser.tabs.update(tab.id, { active: true });
        
        // Focus window (if tab is in another window)
        await browser.windows.update(tab.windowId, { focused: true });
        
      } else {
        // 3. If not found: Open new tab
        await browser.tabs.create({ url: FLEETS_URL });
      }
      
      // Close popup
      window.close();
    } catch (err) {
      // Fallback if permissions are missing
      console.error('[Popup] Tab switch failed, opening new one', err);
      await browser.tabs.create({ url: FLEETS_URL });
      window.close();
    }
  });
  
  // Clear data
  document.getElementById('clear-data').addEventListener('click', async () => {
    if (confirm('Really delete all stored vehicle data?')) {
      await browser.storage.local.clear();
      document.getElementById('total-count').textContent = '0';
      document.getElementById('new-count').textContent = '0';
      document.getElementById('last-scan').textContent = 'No scan yet';
    }
  });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
