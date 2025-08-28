// Modular imports
import { getProfileTabHTML, getFullProfileFormHTML, populateProfileSummary, showEditProfile, hideEditProfile, populateProfileUI, saveProfile } from './profile.js';
import { getTemplatesTabHTML, populateTemplates, addTemplate, deleteTemplate, addAnswerToTemplate, useTemplate } from './templates.js';
import { getSettingsTabHTML, populateSettings, saveSettings } from './settings.js';
import { getOnboardingHTML, showOnboarding, setupOnboardingEventListeners, completeOnboarding } from './onboarding.js';
import { showNotification, truncateText, saveData } from './popup-utils.js';

// Main FillMatePopup class (refactored to use modules)
class FillMatePopup {
  constructor() {
    this.currentTab = 'profile';
    this.profiles = [];
    this.activeProfile = null;
    this.templates = [];
    this.settings = {};
    this.isFirstTime = false;
    this.init();
  }

  async init() {
    await this.loadData();
    this.checkFirstTimeUser();
    this.setupEventListeners();
    if (this.isFirstTime) {
      showOnboarding(() => this.setupOnboardingEventListeners(), getOnboardingHTML);
    } else {
      this.showTab('profile');
    }
    populateProfileUI(this.activeProfile);
  }

  async loadData() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { action: 'getStoredData' },
        (response) => {
          if (response.success) {
            this.profiles = response.data.profiles || [];
            this.activeProfile = this.profiles.find(p => p.id === response.data.activeProfile) || this.profiles[0];
            this.templates = response.data.templates || [];
            this.settings = response.data.settings || {};
          }
          resolve();
        }
      );
    });
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

  setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.showTab(e.target.dataset.tab);
      });
    });
    // Profile buttons
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    if (saveProfileBtn) {
      saveProfileBtn.addEventListener('click', () => {
        saveProfile(this.activeProfile, this.profiles, showNotification, saveData, hideEditProfile, (ap) => populateProfileSummary(ap, this.templates));
      });
    }
    const autofillBtn = document.getElementById('autofillBtn');
    if (autofillBtn) {
      autofillBtn.addEventListener('click', () => {
        this.triggerAutofill();
      });
    }
    const editProfileBtn = document.getElementById('editProfileBtn');
    if (editProfileBtn) {
      editProfileBtn.addEventListener('click', () => {
        showEditProfile();
        populateProfileUI(this.activeProfile);
      });
    }
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    if (cancelEditBtn) {
      cancelEditBtn.addEventListener('click', () => {
        hideEditProfile();
      });
    }
    // Templates
    const addTemplateBtn = document.getElementById('addTemplateBtn');
    if (addTemplateBtn) {
      addTemplateBtn.addEventListener('click', () => {
        addTemplate(this.templates, showNotification, saveData, (t) => populateTemplates(t, showNotification, saveData));
      });
    }
    // Settings
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener('click', () => {
        saveSettings(this.settings, showNotification, saveData);
      });
    }
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
    this.setupEventListeners();
  }

  getProfileTabHTML() {
    return `
      <div class="space-y-4">
        <div class="action-buttons">
          <button id="autofillBtn" class="btn-primary flex-1 flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"/>
            </svg>
            ⚡ Quick Fill
          </button>
          <button id="editProfileBtn" class="btn-secondary flex items-center gap-2">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
            </svg>
            Edit Profile
          </button>
        </div>
        <div class="profile-summary" id="profileSummary"></div>
        <div id="editProfileForm" class="hidden">
          ${this.getFullProfileFormHTML()}
        </div>
      </div>
    `;
  }

  getTemplatesTabHTML() {
    return `
      <div class="space-y-4">
        <div class="info-banner">
          <div class="flex items-start gap-3">
            <div class="info-icon">💡</div>
            <div>
              <h4 class="info-title">Template Answers</h4>
              <p class="info-text">Click any answer to use it in a focused text field.</p>
            </div>
          </div>
        </div>
        <div id="templatesList" class="templates-container"></div>
        <div class="add-template-section">
          <h3 class="section-title">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
            </svg>
            Add New Template
          </h3>
          <div class="space-y-3">
            <input type="text" id="newTemplateQuestion" placeholder="Question/Topic (e.g., Why should we hire you?)" class="input-field">
            <textarea id="newTemplateAnswer" placeholder="Template answer..." rows="3" class="input-field resize-none"></textarea>
            <button id="addTemplateBtn" class="btn-primary w-full flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
              </svg>
              Add Template
            </button>
          </div>
        </div>
      </div>
    `;
  }

  getSettingsTabHTML() {
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

  showOnboarding() {
  // Hide tab navigation and show onboarding mode
  const tabNav = document.querySelector('.tab-navigation');
  if (tabNav) tabNav.style.display = 'none';
  const mainContent = document.querySelector('.main-content');
  if (mainContent) mainContent.innerHTML = this.getOnboardingHTML();
  this.setupOnboardingEventListeners();
  }

  getOnboardingHTML() {
    return `
      <div class="onboarding-container">
        <div class="welcome-header">
          <div class="welcome-icon">👋</div>
          <h2 class="welcome-title">Welcome to FillMate!</h2>
          <p class="welcome-subtitle">Let's set up your profile to get started with automatic job application filling.</p>
        </div>

        <div class="onboarding-form">
          <div class="form-section">
            <h3 class="section-title">📝 Basic Information</h3>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">First Name *</label>
                <input type="text" id="onboard-firstName" class="input-field" placeholder="Enter your first name">
              </div>
              <div class="form-group">
                <label class="form-label">Last Name *</label>
                <input type="text" id="onboard-lastName" class="input-field" placeholder="Enter your last name">
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">Email Address *</label>
              <input type="email" id="onboard-email" class="input-field" placeholder="your.email@example.com">
            </div>
            
            <div class="form-group">
              <label class="form-label">Phone Number</label>
              <input type="tel" id="onboard-phone" class="input-field" placeholder="+1 (555) 123-4567">
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-title">💼 Professional Details</h3>
            <div class="form-group">
              <label class="form-label">LinkedIn Profile</label>
              <input type="url" id="onboard-linkedin" class="input-field" placeholder="https://linkedin.com/in/yourname">
            </div>
            
            <div class="form-group">
              <label class="form-label">Current Role/Experience</label>
              <input type="text" id="onboard-experience" class="input-field" placeholder="e.g., 3+ years as Software Engineer">
            </div>
          </div>

          <div class="onboarding-actions">
            <button id="completeSetupBtn" class="btn-primary btn-large">
              ✨ Complete Setup & Continue
            </button>
            <p class="onboarding-note">You can always edit this information later in the Profile tab.</p>
          </div>
        </div>
      </div>
    `;
  }

  setupOnboardingEventListeners() {
    document.getElementById('completeSetupBtn').addEventListener('click', () => {
      this.completeOnboarding();
    });
  }

  async completeOnboarding() {
    try {
      // Get form data
      const personalInfo = {
        firstName: document.getElementById('onboard-firstName').value,
        lastName: document.getElementById('onboard-lastName').value,
        email: document.getElementById('onboard-email').value,
        phone: document.getElementById('onboard-phone').value,
        linkedin: document.getElementById('onboard-linkedin').value,
        experience: document.getElementById('onboard-experience').value,
        // Set some default values for other fields
        github: '',
        website: '',
        address: '',
        education: '',
        university: '',
        graduationYear: '',
      };

      // Validate required fields
      if (!personalInfo.firstName || !personalInfo.lastName || !personalInfo.email) {
        this.showNotification('Please fill in all required fields (marked with *)', 'error');
        return;
      }

      // Create/update profile
      if (this.activeProfile) {
        this.activeProfile.personalInfo = personalInfo;
      } else {
        this.activeProfile = {
          id: 'default',
          name: 'Default Profile',
          personalInfo
        };
        this.profiles = [this.activeProfile];
      }

      // Save to storage
      await this.saveData({
        profiles: this.profiles,
        activeProfile: this.activeProfile.id,
        onboardingCompleted: true
      });

      this.showNotification('Setup completed successfully! 🎉');
      

  // Switch to normal view
  this.isFirstTime = false;
  // Restore tab navigation and main content
  const tabNav = document.querySelector('.tab-navigation');
  if (tabNav) tabNav.style.display = '';
  const mainContent = document.querySelector('.main-content');
  if (mainContent) mainContent.innerHTML = '';
  this.showTab('profile');
  this.populateUI();
    } catch (error) {
      this.showNotification('Error completing setup', 'error');
      console.error('Error completing onboarding:', error);
    }
  }

  showNormalView() {
    // Restore normal popup layout
    document.querySelector('.tab-navigation').style.display = 'flex';
    document.querySelector('.content-container').innerHTML = this.getNormalViewHTML();
    this.setupEventListeners();
    this.showTab('profile');
    this.populateUI();
  }

  getNormalViewHTML() {
    return `
      <!-- Profile Tab -->
      <div id="profileTab" class="tab-content">
        <div class="space-y-4">
          <div class="action-buttons">
            <button id="autofillBtn" class="btn-primary flex-1 flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"/>
              </svg>
              ⚡ Quick Fill
            </button>
            <button id="editProfileBtn" class="btn-secondary flex items-center gap-2">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
              </svg>
              Edit Profile
            </button>
          </div>
          
          <div class="profile-summary" id="profileSummary">
            <!-- Profile summary will be populated here -->
          </div>
          
          <div id="editProfileForm" class="hidden">
            ${this.getFullProfileFormHTML()}
          </div>
        </div>
      </div>

      <!-- Templates Tab -->
      <div id="templatesTab" class="tab-content hidden">
        <div class="space-y-4">
          <div class="info-banner">
            <div class="flex items-start gap-3">
              <div class="info-icon">💡</div>
              <div>
                <h4 class="info-title">Template Answers</h4>
                <p class="info-text">Click any answer to use it in a focused text field.</p>
              </div>
            </div>
          </div>
          
          <div id="templatesList" class="templates-container">
            <!-- Templates will be populated here -->
          </div>
          
          <div class="add-template-section">
            <h3 class="section-title">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
              </svg>
              Add New Template
            </h3>
            <div class="space-y-3">
              <input type="text" id="newTemplateQuestion" placeholder="Question/Topic (e.g., Why should we hire you?)" class="input-field">
              <textarea id="newTemplateAnswer" placeholder="Template answer..." rows="3" class="input-field resize-none"></textarea>
              <button id="addTemplateBtn" class="btn-primary w-full flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
                </svg>
                Add Template
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Settings Tab -->
      <div id="settingsTab" class="tab-content hidden">
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
      </div>
    `;
  }

  getFullProfileFormHTML() {
    return `
      <div class="info-banner">
        <div class="flex items-start gap-3">
          <div class="info-icon">ℹ️</div>
          <div>
            <h4 class="info-title">Your Profile Information</h4>
            <p class="info-text">Edit these details to match your information.</p>
          </div>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label class="text-sm font-medium text-gray-700 mb-2" style="display: block;">First Name</label>
          <input type="text" id="firstName" class="input-field">
        </div>
        <div class="form-group">
          <label class="text-sm font-medium text-gray-700 mb-2" style="display: block;">Last Name</label>
          <input type="text" id="lastName" class="input-field">
        </div>
      </div>
      
      <div class="form-group">
        <label class="text-sm font-medium text-gray-700 mb-2" style="display: block;">Email</label>
        <input type="email" id="email" class="input-field">
      </div>
      
      <div class="form-group">
        <label class="text-sm font-medium text-gray-700 mb-2" style="display: block;">Phone</label>
        <input type="tel" id="phone" class="input-field">
      </div>
      
      <div class="form-group">
        <label class="text-sm font-medium text-gray-700 mb-2" style="display: block;">LinkedIn URL</label>
        <input type="url" id="linkedin" class="input-field">
      </div>
      
      <div class="form-group">
        <label class="text-sm font-medium text-gray-700 mb-2" style="display: block;">GitHub URL</label>
        <input type="url" id="github" class="input-field">
      </div>
      
      <div class="form-group">
        <label class="text-sm font-medium text-gray-700 mb-2" style="display: block;">Website/Portfolio</label>
        <input type="url" id="website" class="input-field">
      </div>
      
      <div class="form-group">
        <label class="text-sm font-medium text-gray-700 mb-2" style="display: block;">Address</label>
        <input type="text" id="address" class="input-field">
      </div>
      
      <div class="form-group">
        <label class="text-sm font-medium text-gray-700 mb-2" style="display: block;">Education</label>
        <input type="text" id="education" class="input-field">
      </div>
      
      <div class="form-group">
        <label class="text-sm font-medium text-gray-700 mb-2" style="display: block;">University</label>
        <input type="text" id="university" class="input-field">
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label class="text-sm font-medium text-gray-700 mb-2" style="display: block;">Graduation Year</label>
          <input type="text" id="graduationYear" class="input-field">
        </div>
        <div class="form-group">
          <label class="text-sm font-medium text-gray-700 mb-2" style="display: block;">Experience</label>
          <input type="text" id="experience" class="input-field">
        </div>
      </div>
      
      <div class="action-buttons">
        <button id="saveProfileBtn" class="btn-primary flex-1 flex items-center justify-center gap-2">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7.707 10.293a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L9 11.586l-1.293-1.293z"/>
          </svg>
          Save Profile
        </button>
        <button id="cancelEditBtn" class="btn-secondary flex items-center gap-2">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
          Cancel
        </button>
      </div>
    `;
  }

  populateUI() {
    // Check if we're in normal view or still in form editing mode
    const profileSummary = document.getElementById('profileSummary');
    const editProfileForm = document.getElementById('editProfileForm');
    
    if (profileSummary && !this.isFirstTime) {
      // Show profile summary for normal view
      this.populateProfileSummary();
    }
    
    // Populate form fields if they exist (either in onboarding or edit mode)
    if (this.activeProfile && this.activeProfile.personalInfo) {
      const personalInfo = this.activeProfile.personalInfo;
      
      // Helper function to safely set field values
      const setFieldValue = (id, value, defaultValue = '') => {
        const field = document.getElementById(id);
        if (field) {
          field.value = value || defaultValue;
        }
      };
      
      // Populate all possible fields (onboarding, edit form, etc.)
      setFieldValue('firstName', personalInfo.firstName);
      setFieldValue('lastName', personalInfo.lastName);
      setFieldValue('email', personalInfo.email);
      setFieldValue('phone', personalInfo.phone);
      setFieldValue('linkedin', personalInfo.linkedin);
      setFieldValue('github', personalInfo.github);
      setFieldValue('website', personalInfo.website);
      setFieldValue('address', personalInfo.address);
      setFieldValue('education', personalInfo.education);
      setFieldValue('university', personalInfo.university);
      setFieldValue('graduationYear', personalInfo.graduationYear);
      setFieldValue('experience', personalInfo.experience);
      
      // Also populate onboarding fields if they exist
      setFieldValue('onboard-firstName', personalInfo.firstName);
      setFieldValue('onboard-lastName', personalInfo.lastName);
      setFieldValue('onboard-email', personalInfo.email);
      setFieldValue('onboard-phone', personalInfo.phone);
      setFieldValue('onboard-linkedin', personalInfo.linkedin);
      setFieldValue('onboard-experience', personalInfo.experience);
    }
  }

  populateProfileSummary() {
    const summaryContainer = document.getElementById('profileSummary');
    if (!summaryContainer || !this.activeProfile || !this.activeProfile.personalInfo) return;
    
    const info = this.activeProfile.personalInfo;
    
    summaryContainer.innerHTML = `
      <div class="profile-card">
        <div class="profile-header">
          <div class="profile-avatar">
            ${(info.firstName?.[0] || 'U').toUpperCase()}${(info.lastName?.[0] || '').toUpperCase()}
          </div>
          <div class="profile-details">
            <h3 class="profile-name">${info.firstName || 'User'} ${info.lastName || ''}</h3>
            <p class="profile-role">${info.experience || 'Professional'}</p>
          </div>
        </div>
        
        <div class="profile-info">
          <div class="info-item">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
            </svg>
            <span>${info.email || 'No email set'}</span>
          </div>
          
          ${info.phone ? `
          <div class="info-item">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
            </svg>
            <span>${info.phone}</span>
          </div>
          ` : ''}
          
          ${info.linkedin ? `
          <div class="info-item">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clip-rule="evenodd"/>
            </svg>
            <span>LinkedIn Profile</span>
          </div>
          ` : ''}
        </div>
        
        <div class="profile-stats">
          <div class="stat">
            <span class="stat-number">${this.templates.length}</span>
            <span class="stat-label">Templates</span>
          </div>
          <div class="stat">
            <span class="stat-number">Ready</span>
            <span class="stat-label">Status</span>
          </div>
        </div>
      </div>
    `;
  }

  showEditProfile() {
    const profileSummary = document.getElementById('profileSummary');
    const editProfileForm = document.getElementById('editProfileForm');
    
    if (profileSummary && editProfileForm) {
      profileSummary.classList.add('hidden');
      editProfileForm.classList.remove('hidden');
      
      // Populate the edit form
      this.populateUI();
    }
  }

  hideEditProfile() {
    const profileSummary = document.getElementById('profileSummary');
    const editProfileForm = document.getElementById('editProfileForm');
    
    if (profileSummary && editProfileForm) {
      editProfileForm.classList.add('hidden');
      profileSummary.classList.remove('hidden');
    }
  }

  populateTemplates() {
    const container = document.getElementById('templatesList');
    container.innerHTML = '';

    if (this.templates.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <svg class="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <p class="text-sm">No templates yet</p>
          <p class="text-xs mt-1">Add your first template below</p>
        </div>
      `;
      return;
    }

    this.templates.forEach(template => {
      const templateEl = document.createElement('div');
      templateEl.className = 'template-item';
      
      templateEl.innerHTML = `
        <div class="flex justify-between items-start mb-3">
          <div class="template-question">${template.question}</div>
          <button class="btn-danger opacity-70 hover:opacity-100" onclick="FillMatePopup.deleteTemplate('${template.id}')" title="Delete template">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
        <div class="space-y-2">
          ${template.answers.map((answer, index) => `
            <div class="template-answer" onclick="FillMatePopup.useTemplate('${template.id}', ${index})" title="Click to use this template">
              ${this.truncateText(answer, 120)}
            </div>
          `).join('')}
        </div>
        <button class="btn-secondary text-xs mt-3 px-3 py-1.5 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300" onclick="FillMatePopup.addAnswerToTemplate('${template.id}')">
          <svg class="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
          </svg>
          Add Answer
        </button>
      `;
      
      container.appendChild(templateEl);
    });
  }

  populateSettings() {
    document.getElementById('showFloatingButton').checked = this.settings.showFloatingButton !== false;
    document.getElementById('buttonPosition').value = this.settings.buttonPosition || 'bottom-right';
    document.getElementById('fillDelay').value = this.settings.fillDelay || 100;
  }

  async saveProfile() {
    try {
      const personalInfo = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        linkedin: document.getElementById('linkedin').value,
        github: document.getElementById('github').value,
        website: document.getElementById('website').value,
        address: document.getElementById('address').value,
        education: document.getElementById('education').value,
        university: document.getElementById('university').value,
        graduationYear: document.getElementById('graduationYear').value,
        experience: document.getElementById('experience').value
      };

      if (this.activeProfile) {
        this.activeProfile.personalInfo = personalInfo;
      } else {
        this.activeProfile = {
          id: 'default',
          name: 'Default Profile',
          personalInfo
        };
        this.profiles = [this.activeProfile];
      }

      await this.saveData({
        profiles: this.profiles,
        activeProfile: this.activeProfile.id
      });

      this.showNotification('Profile saved successfully!');
      
      // If we're in edit mode, return to summary view
      const editProfileForm = document.getElementById('editProfileForm');
      if (editProfileForm && !editProfileForm.classList.contains('hidden')) {
        this.hideEditProfile();
        this.populateProfileSummary(); // Refresh the summary
      }
    } catch (error) {
      this.showNotification('Error saving profile', 'error');
      console.error('Error saving profile:', error);
    }
  }

  async triggerAutofill() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        this.showNotification('No active tab found', 'error');
        return;
      }
      chrome.tabs.sendMessage(tab.id, { action: 'fillForm' }, async (response) => {
        if (chrome.runtime.lastError) {
          // Try to inject the content script, then retry
          try {
            await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ['content.js']
            });
            // Retry sending the message
            chrome.tabs.sendMessage(tab.id, { action: 'fillForm' }, (retryResponse) => {
              if (chrome.runtime.lastError) {
                this.showNotification('Autofill failed: Please reload the page and try again. (Content script not found)', 'error');
                console.error('Error triggering autofill:', chrome.runtime.lastError.message);
              } else {
                this.showNotification('Autofill triggered!');
                window.close();
              }
            });
          } catch (injectErr) {
            this.showNotification('Autofill failed: Unable to inject content script. Try reloading the page.', 'error');
            console.error('Error injecting content script:', injectErr);
          }
        } else {
          this.showNotification('Autofill triggered!');
          window.close();
        }
      });
    } catch (error) {
      this.showNotification('Error triggering autofill', 'error');
      console.error('Error triggering autofill:', error);
    }
  }

  async addTemplate() {
    const question = document.getElementById('newTemplateQuestion').value.trim();
    const answer = document.getElementById('newTemplateAnswer').value.trim();

    if (!question || !answer) {
      this.showNotification('Please fill in both question and answer', 'error');
      return;
    }

    const newTemplate = {
      id: Date.now().toString(),
      question,
      answers: [answer]
    };

    this.templates.push(newTemplate);
    await this.saveData({ templates: this.templates });

    document.getElementById('newTemplateQuestion').value = '';
    document.getElementById('newTemplateAnswer').value = '';

    this.populateTemplates();
    this.showNotification('Template added successfully!');
  }

  async deleteTemplate(templateId) {
    this.templates = this.templates.filter(t => t.id !== templateId);
    await this.saveData({ templates: this.templates });
    this.populateTemplates();
    this.showNotification('Template deleted');
  }

  async addAnswerToTemplate(templateId) {
    const answer = prompt('Enter new answer:');
    if (answer && answer.trim()) {
      const template = this.templates.find(t => t.id === templateId);
      if (template) {
        template.answers.push(answer.trim());
        await this.saveData({ templates: this.templates });
        this.populateTemplates();
        this.showNotification('Answer added to template!');
      }
    }
  }

  async useTemplate(templateId, answerIndex) {
    try {
      const template = this.templates.find(t => t.id === templateId);
      if (template && template.answers[answerIndex]) {
        const answer = template.answers[answerIndex];
        
        // Copy to clipboard
        await navigator.clipboard.writeText(answer);
        
        // Also try to fill in active field
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        await chrome.tabs.sendMessage(tab.id, { 
          action: 'fillTemplate', 
          template: answer 
        });
        
        this.showNotification('Template copied and filled!');
        window.close();
      }
    } catch (error) {
      this.showNotification('Error using template', 'error');
      console.error('Error using template:', error);
    }
  }

  async saveSettings() {
    try {
      this.settings = {
        showFloatingButton: document.getElementById('showFloatingButton').checked,
        buttonPosition: document.getElementById('buttonPosition').value,
        fillDelay: parseInt(document.getElementById('fillDelay').value) || 100
      };

      await this.saveData({ settings: this.settings });
      this.showNotification('Settings saved successfully!');
      
      // Reload the content script to apply new settings
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      chrome.tabs.reload(tab.id);
    } catch (error) {
      this.showNotification('Error saving settings', 'error');
      console.error('Error saving settings:', error);
    }
  }

  async saveData(data) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: 'saveData', data },
        (response) => {
          if (response.success) {
            resolve();
          } else {
            reject(new Error(response.error || 'Unknown error'));
          }
        }
      );
    });
  }

  showNotification(message, type = 'success') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) {
      existing.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 3000);
  }

  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.FillMatePopup = new FillMatePopup();
});
