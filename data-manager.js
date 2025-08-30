// Data management and storage utilities
export class DataManager {
  static async saveData(data) {
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

  static async loadData() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { action: 'getStoredData' },
        (response) => {
          if (response.success) {
            resolve(response.data);
          } else {
            resolve({});
          }
        }
      );
    });
  }

  static async performSearch(query) {
    try {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { action: 'search', query },
          (response) => {
            resolve(response);
          }
        );
      });
    } catch (error) {
      console.error('Search error:', error);
      return { success: false, error: error.message };
    }
  }

  static async generateAIResponse(prompt, context) {
    try {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { action: 'generateAI', prompt, context },
          (response) => {
            resolve(response);
          }
        );
      });
    } catch (error) {
      console.error('AI generation error:', error);
      return { success: false, error: error.message };
    }
  }

  static exportData(profiles, templates, settings) {
    return {
      profiles,
      templates,
      settings,
      exportDate: new Date().toISOString()
    };
  }

  static validateProfile(profile) {
    const errors = [];
    
    if (!profile.personalInfo?.firstName?.trim()) {
      errors.push('First name is required');
    }
    if (!profile.personalInfo?.lastName?.trim()) {
      errors.push('Last name is required');
    }
    if (!profile.personalInfo?.email?.trim()) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.personalInfo.email)) {
      errors.push('Invalid email format');
    }
    
    return errors;
  }

  static validateTemplate(template) {
    const errors = [];
    
    if (!template.name?.trim()) {
      errors.push('Template name is required');
    }
    if (!template.questions || template.questions.length === 0) {
      errors.push('At least one question is required');
    }
    
    return errors;
  }

  static trackTemplateUsage(template) {
    template.usageCount = (template.usageCount || 0) + 1;
    template.lastUsed = new Date().toISOString();
    return template;
  }
}
