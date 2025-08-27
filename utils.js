// Development Utilities for HireBot Extension
// This file contains helper functions and future enhancement placeholders

class HireBotUtils {
  /**
   * AI Integration Placeholder
   * Future function to generate role-specific answers using AI
   */
  static async generateRoleSpecificAnswer(question, jobDescription, profile) {
    // TODO: Integrate with OpenAI or similar API
    // This is a placeholder for future AI functionality
    
    console.log('AI Integration Placeholder:', {
      question,
      jobDescription,
      profile
    });
    
    // For now, return a generic response
    return `AI-generated response for: ${question}`;
  }

  /**
   * Advanced Field Detection
   * Analyzes form context for better field matching
   */
  static analyzeFormContext(form) {
    const context = {
      formTitle: '',
      companyName: '',
      jobTitle: '',
      formType: 'unknown'
    };

    // Try to extract context from page
    const title = document.title;
    const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.textContent);
    
    // Look for job-related keywords
    const jobKeywords = ['application', 'career', 'job', 'position', 'hiring', 'apply'];
    const isJobForm = jobKeywords.some(keyword => 
      title.toLowerCase().includes(keyword) || 
      headings.some(h => h.toLowerCase().includes(keyword))
    );
    
    if (isJobForm) {
      context.formType = 'job_application';
    }

    return context;
  }

  /**
   * Form Field Learning System
   * Learns from user corrections to improve future detection
   */
  static async learnFromUserCorrection(fieldElement, correctFieldType, userValue) {
    // TODO: Implement machine learning for field detection improvement
    
    const fieldSignature = {
      tag: fieldElement.tagName,
      type: fieldElement.type,
      name: fieldElement.name,
      id: fieldElement.id,
      placeholder: fieldElement.placeholder,
      label: this.getFieldLabel(fieldElement)
    };

    // Store learning data for future improvement
    const learningData = {
      signature: fieldSignature,
      correctType: correctFieldType,
      userValue,
      timestamp: Date.now(),
      url: window.location.hostname
    };

    // TODO: Store in indexed learning database
    console.log('Learning data collected:', learningData);
  }

  /**
   * Custom Field Mapping
   * Allows users to create custom mappings for specific sites
   */
  static async saveCustomMapping(domain, fieldSelector, profileField) {
    const mappings = await this.getCustomMappings();
    
    if (!mappings[domain]) {
      mappings[domain] = {};
    }
    
    mappings[domain][fieldSelector] = profileField;
    
    await chrome.storage.local.set({ customMappings: mappings });
  }

  static async getCustomMappings() {
    const result = await chrome.storage.local.get(['customMappings']);
    return result.customMappings || {};
  }

  /**
   * Form Analytics
   * Tracks success rates and identifies problematic forms
   */
  static async trackFormFillSuccess(domain, fieldsAttempted, fieldsSucceeded) {
    const analytics = await this.getAnalytics();
    
    if (!analytics[domain]) {
      analytics[domain] = {
        attempts: 0,
        totalFields: 0,
        successfulFields: 0,
        successRate: 0
      };
    }

    const domainData = analytics[domain];
    domainData.attempts++;
    domainData.totalFields += fieldsAttempted;
    domainData.successfulFields += fieldsSucceeded;
    domainData.successRate = (domainData.successfulFields / domainData.totalFields) * 100;

    analytics[domain] = domainData;
    
    await chrome.storage.local.set({ analytics });
  }

  static async getAnalytics() {
    const result = await chrome.storage.local.get(['analytics']);
    return result.analytics || {};
  }

  /**
   * Profile Management Utilities
   */
  static validateProfile(profile) {
    const required = ['firstName', 'lastName', 'email'];
    const missing = required.filter(field => !profile.personalInfo[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profile.personalInfo.email)) {
      throw new Error('Invalid email format');
    }
    
    return true;
  }

  static sanitizeProfileData(profile) {
    // Remove any potentially harmful content
    const sanitized = JSON.parse(JSON.stringify(profile));
    
    // Basic XSS protection
    const stripHtml = (str) => str.replace(/<[^>]*>/g, '');
    
    Object.keys(sanitized.personalInfo).forEach(key => {
      if (typeof sanitized.personalInfo[key] === 'string') {
        sanitized.personalInfo[key] = stripHtml(sanitized.personalInfo[key]).trim();
      }
    });
    
    return sanitized;
  }

  /**
   * Template Management Utilities
   */
  static categorizeTemplates(templates) {
    const categories = {
      personal: [],
      technical: [],
      behavioral: [],
      company: [],
      other: []
    };

    const categoryKeywords = {
      personal: ['yourself', 'background', 'experience', 'goals', 'strengths', 'weakness'],
      technical: ['skills', 'technical', 'project', 'programming', 'technology', 'development'],
      behavioral: ['situation', 'challenge', 'team', 'leadership', 'conflict', 'time'],
      company: ['company', 'why', 'interest', 'culture', 'mission', 'values']
    };

    templates.forEach(template => {
      let categorized = false;
      
      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(keyword => 
          template.question.toLowerCase().includes(keyword))) {
          categories[category].push(template);
          categorized = true;
          break;
        }
      }
      
      if (!categorized) {
        categories.other.push(template);
      }
    });

    return categories;
  }

  /**
   * Export/Import Utilities
   */
  static validateImportData(data) {
    const requiredKeys = ['profiles', 'templates', 'settings'];
    const hasAllKeys = requiredKeys.every(key => key in data);
    
    if (!hasAllKeys) {
      throw new Error(`Import data must contain: ${requiredKeys.join(', ')}`);
    }
    
    // Validate profiles structure
    if (!Array.isArray(data.profiles)) {
      throw new Error('Profiles must be an array');
    }
    
    data.profiles.forEach((profile, index) => {
      if (!profile.id || !profile.personalInfo) {
        throw new Error(`Profile ${index} is missing required fields`);
      }
    });
    
    return true;
  }

  static createBackup() {
    return chrome.storage.local.get(null).then(data => {
      return {
        ...data,
        backupDate: new Date().toISOString(),
        version: chrome.runtime.getManifest().version
      };
    });
  }

  /**
   * Security Utilities
   */
  static hashSensitiveData(data) {
    // For future security enhancements
    // Could be used to hash email addresses or other PII
    return data; // Placeholder implementation
  }

  static encryptData(data, key) {
    // Future encryption implementation for sensitive data
    return data; // Placeholder implementation
  }

  /**
   * Performance Utilities
   */
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

  /**
   * Helper Functions
   */
  static getFieldLabel(element) {
    // Try to find associated label
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) return label.textContent.trim();
    }

    // Look for parent label
    let parent = element.parentElement;
    while (parent && parent !== document.body) {
      if (parent.tagName === 'LABEL') {
        return parent.textContent.trim();
      }
      parent = parent.parentElement;
    }

    return '';
  }

  static async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// Make utilities available globally
if (typeof window !== 'undefined') {
  window.HireBotUtils = HireBotUtils;
}

// Export for Node.js environments (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HireBotUtils;
}
