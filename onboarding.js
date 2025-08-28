
export function getOnboardingHTML() {
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

export function showOnboarding(setupOnboardingEventListeners, getOnboardingHTML) {
  const tabNav = document.querySelector('.tab-navigation');
  if (tabNav) tabNav.style.display = 'none';
  const mainContent = document.querySelector('.main-content');
  if (mainContent) mainContent.innerHTML = getOnboardingHTML();
  setupOnboardingEventListeners();
}

export function setupOnboardingEventListeners(completeOnboarding) {
  document.getElementById('completeSetupBtn').addEventListener('click', () => {
    completeOnboarding();
  });
}

export async function completeOnboarding(activeProfile, profiles, showNotification, saveData, setIsFirstTime, showTab, populateProfileUI) {
  try {
    const personalInfo = {
      firstName: document.getElementById('onboard-firstName').value,
      lastName: document.getElementById('onboard-lastName').value,
      email: document.getElementById('onboard-email').value,
      phone: document.getElementById('onboard-phone').value,
      linkedin: document.getElementById('onboard-linkedin').value,
      experience: document.getElementById('onboard-experience').value,
      github: '',
      website: '',
      address: '',
      education: '',
      university: '',
      graduationYear: '',
    };
    if (!personalInfo.firstName || !personalInfo.lastName || !personalInfo.email) {
      showNotification('Please fill in all required fields (marked with *)', 'error');
      return;
    }
    if (activeProfile) {
      activeProfile.personalInfo = personalInfo;
    } else {
      activeProfile = {
        id: 'default',
        name: 'Default Profile',
        personalInfo
      };
      profiles = [activeProfile];
    }
    await saveData({
      profiles: profiles,
      activeProfile: activeProfile.id,
      onboardingCompleted: true
    });
    showNotification('Setup completed successfully! 🎉');
    setIsFirstTime(false);
    const tabNav = document.querySelector('.tab-navigation');
    if (tabNav) tabNav.style.display = '';
    const mainContent = document.querySelector('.main-content');
    if (mainContent) mainContent.innerHTML = '';
    showTab('profile');
    populateProfileUI(activeProfile);
  } catch (error) {
    showNotification('Error completing setup', 'error');
    console.error('Error completing onboarding:', error);
  }
}
