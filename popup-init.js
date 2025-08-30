// DOM initialization and app startup
import { FillMatePopup } from './fillmate-popup.js';
import { PopupEventHandlers } from './popup-events.js';
import { KeyboardManager, ThemeManager } from './popup-keyboard.js';

export class PopupInitializer {
  constructor() {
    this.popup = null;
    this.eventHandlers = null;
    this.keyboardManager = null;
  }

  async init() {
    this.setupDOM();
    this.popup = new FillMatePopup();
    this.eventHandlers = new PopupEventHandlers(this.popup);
    this.keyboardManager = new KeyboardManager(this.popup);
    
    await this.popup.init();
    this.eventHandlers.setupMainEventListeners();
    this.keyboardManager.setupKeyboardShortcuts();
    this.keyboardManager.setupAccessibility();
    
    // Apply theme
    const theme = this.popup.settings.theme || ThemeManager.getSystemTheme();
    ThemeManager.applyTheme(theme);
  }

  setupDOM() {
    const container = document.createElement('div');
    container.className = 'popup-container';
    container.innerHTML = this.getInitialHTML();
    document.body.appendChild(container);
  }

  getInitialHTML() {
    return `
      <div class="header">
        <div class="logo">
          <span class="logo-icon">🤖</span>
          <span class="logo-text">FillMate</span>
        </div>
      </div>
      
      <div class="nav-tabs">
        <button class="tab-btn active" data-tab="profile">Profile</button>
        <button class="tab-btn" data-tab="templates">Templates</button>
        <button class="tab-btn" data-tab="settings">Settings</button>
      </div>
      
      <div class="main-content">
        <!-- Content will be dynamically loaded here -->
      </div>
      
      <div id="notification" class="notification hidden">
        <span id="notification-message"></span>
      </div>
    `;
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const initializer = new PopupInitializer();
  await initializer.init();
});
