// Keyboard shortcuts and accessibility utilities
export class KeyboardManager {
  constructor(popup) {
    this.popup = popup;
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            this.popup.showTab('profile');
            break;
          case '2':
            e.preventDefault();
            this.popup.showTab('templates');
            break;
          case '3':
            e.preventDefault();
            this.popup.showTab('settings');
            break;
          case 's':
            e.preventDefault();
            this.handleSaveShortcut();
            break;
        }
      }
    });
  }

  handleSaveShortcut() {
    if (this.popup.currentTab === 'profile') {
      document.getElementById('save-profile-btn')?.click();
    } else if (this.popup.currentTab === 'settings') {
      document.getElementById('save-settings-btn')?.click();
    }
  }

  setupAccessibility() {
    // Add ARIA labels and roles
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach((tab, index) => {
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', tab.classList.contains('active'));
      tab.setAttribute('tabindex', tab.classList.contains('active') ? '0' : '-1');
    });

    // Add keyboard navigation for tabs
    document.addEventListener('keydown', (e) => {
      if (e.target.classList.contains('tab-btn')) {
        this.handleTabNavigation(e, tabs);
      }
    });
  }

  handleTabNavigation(e, tabs) {
    let currentIndex = Array.from(tabs).indexOf(e.target);
    let newIndex = currentIndex;

    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.target.click();
      return;
    }

    if (newIndex !== currentIndex) {
      e.preventDefault();
      tabs[newIndex].focus();
    }
  }
}

export class ThemeManager {
  static applyTheme(theme = 'dark') {
    document.body.className = `theme-${theme}`;
    return theme;
  }

  static getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  static watchSystemTheme(callback) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      callback(e.matches ? 'dark' : 'light');
    });
  }
}

export class PerformanceUtils {
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  static throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}
