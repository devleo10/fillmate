// Event handlers for the popup UI
import { showEditProfile, hideEditProfile, populateProfileUI, saveProfile } from './profile.js';
import { addTemplate, deleteTemplate, addAnswerToTemplate, useTemplate } from './templates.js';
import { saveSettings } from './settings.js';
import { completeOnboarding } from './onboarding.js';
import { showNotification, saveData } from './popup-utils.js';
import { DataManager } from './data-manager.js';

export class PopupEventHandlers {
  constructor(popup) {
    this.popup = popup;
  }

  setupMainEventListeners() {
    this.setupTabNavigation();
    this.setupProfileEventListeners();
    this.setupTemplateEventListeners();
    this.setupSettingsEventListeners();
  }

  setupTabNavigation() {
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('tab-btn')) {
        const tabName = e.target.getAttribute('data-tab');
        this.popup.showTab(tabName);
      }
    });
  }

  setupProfileEventListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.id === 'edit-profile-btn') {
        showEditProfile();
      } else if (e.target.id === 'cancel-edit-btn') {
        hideEditProfile();
        populateProfileUI(this.popup.activeProfile);
      } else if (e.target.id === 'save-profile-btn') {
        this.handleSaveProfile();
      }
    });
  }

  setupTemplateEventListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.id === 'add-template-btn') {
        addTemplate(this.popup.templates, showNotification, saveData);
      } else if (e.target.classList.contains('delete-template-btn')) {
        const templateId = e.target.getAttribute('data-template-id');
        deleteTemplate(templateId, this.popup.templates, showNotification, saveData);
      } else if (e.target.classList.contains('use-template-btn')) {
        const templateId = e.target.getAttribute('data-template-id');
        const template = this.popup.templates.find(t => t.id === templateId);
        if (template) {
          useTemplate(template, this.popup.activeProfile, showNotification);
        }
      } else if (e.target.classList.contains('add-answer-btn')) {
        const templateId = e.target.getAttribute('data-template-id');
        addAnswerToTemplate(templateId, this.popup.templates, showNotification, saveData);
      }
    });
  }

  setupSettingsEventListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.id === 'save-settings-btn') {
        this.handleSaveSettings();
      }
    });
  }

  setupOnboardingEventListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.id === 'complete-onboarding-btn') {
        completeOnboarding(() => {
          this.popup.isFirstTime = false;
          this.popup.showTab('profile');
        });
      }
    });
  }

  async handleSaveProfile() {
    try {
      const updatedProfile = await saveProfile();
      if (updatedProfile) {
        const profileIndex = this.popup.profiles.findIndex(p => p.id === updatedProfile.id);
        if (profileIndex !== -1) {
          this.popup.profiles[profileIndex] = updatedProfile;
        } else {
          this.popup.profiles.push(updatedProfile);
        }
        this.popup.activeProfile = updatedProfile;
        await this.popup.saveData({
          profiles: this.popup.profiles,
          activeProfile: updatedProfile.id,
          templates: this.popup.templates,
          settings: this.popup.settings
        });
        hideEditProfile();
        populateProfileUI(this.popup.activeProfile);
        showNotification('Profile saved successfully!');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      showNotification('Error saving profile. Please try again.', 'error');
    }
  }

  async handleSaveSettings() {
    try {
      const updatedSettings = await saveSettings();
      this.popup.settings = updatedSettings;
      await this.popup.saveData({
        profiles: this.popup.profiles,
        activeProfile: this.popup.activeProfile?.id,
        templates: this.popup.templates,
        settings: this.popup.settings
      });
      showNotification('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      showNotification('Error saving settings. Please try again.', 'error');
    }
  }
}
