
export function getSettingsTabHTML() {
  return `
    <div class="space-y-4">
      <div class="settings-card">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-medium text-gray-700">Show Floating Button</h3>
            <p class="text-xs text-gray-500 mt-1">Display the ⚡ Autofill button on web pages</p>
          </div>
          <input type="checkbox" id="showFloatingButton" class="toggle">
        </div>
      </div>
      <div class="settings-card">
        <label class="text-sm font-medium text-gray-700 mb-3" style="display: block;">Button Position</label>
        <select id="buttonPosition" class="input-field">
          <option value="bottom-right">Bottom Right</option>
          <option value="bottom-left">Bottom Left</option>
          <option value="top-right">Top Right</option>
          <option value="top-left">Top Left</option>
        </select>
      </div>
      <div class="settings-card">
        <label class="text-sm font-medium text-gray-700 mb-3" style="display: block;">Fill Delay (ms)</label>
        <input type="number" id="fillDelay" min="0" max="1000" step="50" class="input-field" placeholder="100">
        <p class="text-xs text-gray-500 mt-2">Delay between filling each field for better UX</p>
      </div>
      <button id="saveSettingsBtn" class="btn-primary w-full flex items-center justify-center gap-2">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7.707 10.293a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L9 11.586l-1.293-1.293z"/>
        </svg>
        Save Settings
      </button>
    </div>
  `;
}

export function populateSettings(settings) {
  document.getElementById('showFloatingButton').checked = settings.showFloatingButton !== false;
  document.getElementById('buttonPosition').value = settings.buttonPosition || 'bottom-right';
  document.getElementById('fillDelay').value = settings.fillDelay || 100;
}

export async function saveSettings(settings, showNotification, saveData) {
  try {
    settings = {
      showFloatingButton: document.getElementById('showFloatingButton').checked,
      buttonPosition: document.getElementById('buttonPosition').value,
      fillDelay: parseInt(document.getElementById('fillDelay').value) || 100
    };
    await saveData({ settings });
    showNotification('Settings saved successfully!');
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.reload(tab.id);
  } catch (error) {
    showNotification('Error saving settings', 'error');
    console.error('Error saving settings:', error);
  }
}
