// Core FillMatePopup class
import { getProfileTabHTML, populateProfileSummary, showEditProfile, hideEditProfile, populateProfileUI, saveProfile } from './profile.js';
import { getTemplatesTabHTML, populateTemplates, addTemplate, deleteTemplate, addAnswerToTemplate, useTemplate } from './templates.js';
import { getSettingsTabHTML, populateSettings, saveSettings } from './settings.js';
import { getOnboardingHTML, showOnboarding, setupOnboardingEventListeners, completeOnboarding } from './onboarding.js';
import { showNotification, truncateText, saveData } from './popup-utils.js';
import { DataManager } from './data-manager.js';

export class FillMatePopup {
  constructor() {
    this.currentTab = 'profile';
    this.profiles = [];
    this.activeProfile = null;
    this.templates = [];
    this.settings = {};
    this.isFirstTime = false;
  }

  async init() {
    await this.loadData();
    this.checkFirstTimeUser();
    if (this.isFirstTime) {
      showOnboarding(() => this.setupOnboardingEventListeners(), getOnboardingHTML);
    } else {
      this.showTab('profile');
    }
    populateProfileUI(this.activeProfile);
  }

  async loadData() {
    const data = await DataManager.loadData();
    this.profiles = data.profiles || [];
    this.activeProfile = this.profiles.find(p => p.id === data.activeProfile) || this.profiles[0];
    this.templates = data.templates || [];
    this.settings = data.settings || {};
  }

  checkFirstTimeUser() {
    if (!this.activeProfile || !this.activeProfile.personalInfo) {
      this.isFirstTime = true;
      return;
    }
    const personalInfo = this.activeProfile.personalInfo;
    const hasDefaultData = (
      personalInfo.firstName === 'John' &&
      personalInfo.lastName === 'Doe' &&
      personalInfo.email === 'john.doe@email.com'
    );
    const hasEmptyFields = (
      !personalInfo.firstName?.trim() ||
      !personalInfo.lastName?.trim() ||
      !personalInfo.email?.trim()
    );
    this.isFirstTime = hasDefaultData || hasEmptyFields;
  }

  showTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    this.currentTab = tabName;
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;
    
    if (tabName === 'profile') {
      mainContent.innerHTML = getProfileTabHTML();
      populateProfileUI(this.activeProfile);
      populateProfileSummary(this.activeProfile, this.templates);
    } else if (tabName === 'templates') {
      mainContent.innerHTML = getTemplatesTabHTML();
      populateTemplates(this.templates, showNotification, saveData);
    } else if (tabName === 'settings') {
      mainContent.innerHTML = getSettingsTabHTML();
      populateSettings(this.settings);
    }
  }

  // Data management methods
  async saveData(data) {
    return DataManager.saveData(data);
  }

  showNotification(message, type = 'success') {
    showNotification(message, type);
  }

  truncateText(text, maxLength) {
    return truncateText(text, maxLength);
  }

  // Additional utility methods
  async performSearch(query) {
    return DataManager.performSearch(query);
  }

  async generateAIResponse(prompt, context) {
    return DataManager.generateAIResponse(prompt, context);
  }

  exportData() {
    return DataManager.exportData(this.profiles, this.templates, this.settings);
  }

  validateProfile(profile) {
    return DataManager.validateProfile(profile);
  }

  validateTemplate(template) {
    return DataManager.validateTemplate(template);
  }

  trackTemplateUsage(templateId) {
    const template = this.templates.find(t => t.id === templateId);
    if (template) {
      DataManager.trackTemplateUsage(template);
    }
  }
}
