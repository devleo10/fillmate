
// Profile Tab HTML
export function getProfileTabHTML() {
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
        ${getFullProfileFormHTML()}
      </div>
    </div>
  `;
}

// Full Profile Form HTML
export function getFullProfileFormHTML() {
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

// Populate profile summary
export function populateProfileSummary(activeProfile, templates) {
  const summaryContainer = document.getElementById('profileSummary');
  if (!summaryContainer || !activeProfile || !activeProfile.personalInfo) return;
  const info = activeProfile.personalInfo;
  summaryContainer.innerHTML = `
    <div class="profile-details-card">
      <div class="profile-row" style="margin-bottom: 8px; align-items: flex-end;">
        <span class="profile-label">${info.location || 'CA'}</span>
        <span class="profile-name">${info.firstName || 'User'} ${info.lastName || ''}</span>
      </div>
      <div class="profile-row">
        <span class="profile-label">${info.experience || '1+ years'}</span>
      </div>
      <div class="profile-row">
        <span class="profile-icon">✉️</span>
        <span>${info.email || 'No email set'}</span>
      </div>
      ${info.phone ? `
      <div class="profile-row">
        <span class="profile-icon">📞</span>
        <span>${info.phone}</span>
      </div>
      ` : ''}
      ${info.linkedin ? `
      <div class="profile-row">
        <span class="profile-icon">🔗</span>
        <a href="${info.linkedin}" class="profile-link" target="_blank">LinkedIn Profile</a>
      </div>
      ` : ''}
      <div class="profile-row">
        <span>${templates?.length || 0} Templates</span>
      <div class="profile-row">
        <span>Ready Status</span>
      </div>
    </div>
  `;
}

// Show edit profile form
export function showEditProfile() {
  const profileSummary = document.getElementById('profileSummary');
  const editProfileForm = document.getElementById('editProfileForm');
  if (profileSummary && editProfileForm) {
    profileSummary.classList.add('hidden');
    editProfileForm.classList.remove('hidden');
  }
}

// Hide edit profile form
export function hideEditProfile() {
  const profileSummary = document.getElementById('profileSummary');
  const editProfileForm = document.getElementById('editProfileForm');
  if (profileSummary && editProfileForm) {
    editProfileForm.classList.add('hidden');
    profileSummary.classList.remove('hidden');
  }
}

// Populate UI fields for profile
export function populateProfileUI(activeProfile) {
  const profileSummary = document.getElementById('profileSummary');
  const editProfileForm = document.getElementById('editProfileForm');
  if (profileSummary) {
    // Show profile summary for normal view
    // (populateProfileSummary should be called separately)
  }
  if (activeProfile && activeProfile.personalInfo) {
    const personalInfo = activeProfile.personalInfo;
    const setFieldValue = (id, value, defaultValue = '') => {
      const field = document.getElementById(id);
      if (field) {
        field.value = value || defaultValue;
      }
    };
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
    setFieldValue('onboard-firstName', personalInfo.firstName);
    setFieldValue('onboard-lastName', personalInfo.lastName);
    setFieldValue('onboard-email', personalInfo.email);
    setFieldValue('onboard-phone', personalInfo.phone);
    setFieldValue('onboard-linkedin', personalInfo.linkedin);
    setFieldValue('onboard-experience', personalInfo.experience);
  }
}

// Save profile data
export async function saveProfile(activeProfile, profiles, showNotification, saveData, hideEditProfile, populateProfileSummary) {
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
      activeProfile: activeProfile.id
    });
    showNotification('Profile saved successfully!');
    const editProfileForm = document.getElementById('editProfileForm');
    if (editProfileForm && !editProfileForm.classList.contains('hidden')) {
      hideEditProfile();
      populateProfileSummary(activeProfile);
    }
  } catch (error) {
    showNotification('Error saving profile', 'error');
    console.error('Error saving profile:', error);
  }
}
