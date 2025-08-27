// Content Script for HireBot Extension
class HireBotAutofill {
  constructor() {
    this.isEnabled = true;
    this.profiles = [];
    this.activeProfile = null;
    this.settings = {};
    this.templates = [];
    this.floatingButton = null;
    
    this.init();
  }

  async init() {
    try {
      await this.loadData();
      if (this.settings.showFloatingButton) {
        this.createFloatingButton();
      }
      this.setupMessageListener();
      console.log('HireBot: Content script initialized');
    } catch (error) {
      console.error('HireBot: Error initializing content script:', error);
    }
  }

  async loadData() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { action: 'getStoredData' },
        (response) => {
          if (response.success) {
            this.profiles = response.data.profiles || [];
            this.activeProfile = this.profiles.find(p => p.id === response.data.activeProfile);
            this.settings = response.data.settings || {};
            this.templates = response.data.templates || [];
          }
          resolve();
        }
      );
    });
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'fillForm') {
        this.fillForm();
        sendResponse({ success: true });
      } else if (message.action === 'fillTemplate') {
        this.fillTemplate(message.template);
        sendResponse({ success: true });
      }
      return true;
    });
  }

  createFloatingButton() {
    // Remove existing button if any
    if (this.floatingButton) {
      this.floatingButton.remove();
    }

    this.floatingButton = document.createElement('div');
    this.floatingButton.id = 'hirebot-floating-button';
    this.floatingButton.innerHTML = `
      <div class="hirebot-button-content">
        ⚡ Autofill
      </div>
    `;

    // Position based on settings
    const position = this.settings.buttonPosition || 'bottom-right';
    this.floatingButton.className = `hirebot-floating-button hirebot-${position}`;

    this.floatingButton.addEventListener('click', () => {
      this.fillForm();
    });

    document.body.appendChild(this.floatingButton);
  }

  async fillForm() {
    if (!this.activeProfile) {
      console.warn('HireBot: No active profile found');
      return;
    }

    const fields = this.detectFormFields();
    const personalInfo = this.activeProfile.personalInfo;
    let filledCount = 0;

    // Fill profile fields
    for (const field of fields) {
      const value = this.getValueForField(field, personalInfo);
      if (value && this.fillField(field.element, value)) {
        filledCount++;
        await this.delay(this.settings.fillDelay || 100);
      }
    }

    // Fill template questions
    const templateFields = this.detectTemplateFields();
    for (const templateField of templateFields) {
      if (this.fillField(templateField.element, templateField.answer)) {
        filledCount++;
        await this.delay(this.settings.fillDelay || 100);
      }
    }

    this.showNotification(`Filled ${filledCount} fields`);
  }

  detectFormFields() {
    const fields = [];
    const selectors = [
      'input[type="text"]',
      'input[type="email"]',
      'input[type="tel"]',
      'input[type="url"]',
      'textarea',
      'input:not([type])'
    ];

    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        if (this.isVisibleField(element)) {
          const fieldInfo = this.analyzeField(element);
          if (fieldInfo.type !== 'unknown') {
            fields.push({
              element,
              type: fieldInfo.type,
              confidence: fieldInfo.confidence
            });
          }
        }
      });
    });

    return fields.sort((a, b) => b.confidence - a.confidence);
  }

  detectTemplateFields() {
    if (!this.templates || this.templates.length === 0) {
      return [];
    }

    const templateFields = [];
    const textareas = document.querySelectorAll('textarea, input[type="text"]');
    
    textareas.forEach(element => {
      if (!this.isVisibleField(element)) return;
      if (element.value && element.value.trim().length > 0) return; // Only fill empty fields
      // Get surrounding text to match against template questions
      const surroundingText = this.getFieldContext(element);
      // Try to match with template questions
      for (const template of this.templates) {
        if (this.matchesTemplate(surroundingText, template.question)) {
          console.log('[HireBot] Matched template:', template.question, 'for context:', surroundingText);
          templateFields.push({
            element,
            template: template.question,
            answer: template.answers[0] // Use first answer
          });
          break; // Only match one template per field
        }
      }
    });

    return templateFields;
  }

  matchesTemplate(fieldContext, templateQuestion) {
    const templateLower = templateQuestion.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const fieldLower = fieldContext.toLowerCase().replace(/[^\w\s]/g, '').trim();
    // Require exact substring match (ignoring punctuation)
    return fieldLower.includes(templateLower);
  }

  getFieldContext(element) {
    let context = '';
    
    // Get label text
    const label = this.findLabel(element);
    if (label) {
      context += label.textContent || '';
    }
    
    // Get placeholder
    const placeholder = element.getAttribute('placeholder') || '';
    context += ' ' + placeholder;
    
    // Get nearby text (previous siblings, parent text)
    let parent = element.parentElement;
    while (parent && parent !== document.body) {
      const parentText = parent.textContent || '';
      if (parentText.length > 0 && parentText.length < 200) {
        context += ' ' + parentText;
        break;
      }
      parent = parent.parentElement;
    }
    
    return context.toLowerCase().trim();
  }

  extractKeywords(text) {
    // Remove common words and extract meaningful keywords
    const commonWords = ['what', 'how', 'why', 'when', 'where', 'the', 'a', 'an', 'and', 'or', 'but', 'for', 'you', 'your', 'this', 'that', 'is', 'are', 'do', 'does', 'did'];
    
    return text
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.includes(word))
      .map(word => word.replace(/[^\w]/g, ''));
  }

  isVisibleField(element) {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           element.offsetWidth > 0 && 
           element.offsetHeight > 0 &&
           !element.disabled &&
           !element.readOnly;
  }

  analyzeField(element) {
    const patterns = {
      firstName: {
        patterns: [
          /first.?name/i, /fname/i, /given.?name/i, /forename/i, /applicant.?first/i, /applicant.?given/i, /prénom/i, /vorname/i, /nombre/i, /名/i, /имя/i, /nome/i, /your.?first.?name/i
        ],
        attributes: ['name', 'id', 'placeholder', 'aria-label', 'label'],
        confidence: 0.9
      },
      fullName: {
        patterns: [
          /full.?name/i, /your.?name/i, /contact.?name/i, /name$/i, /name_field/i, /nombre.?completo/i, /nome.?completo/i, /полное.?имя/i
        ],
        attributes: ['name', 'id', 'placeholder', 'aria-label', 'label'],
        confidence: 0.9
      },
      lastName: {
        patterns: [
          /last.?name/i, /lname/i, /surname/i, /family.?name/i, /applicant.?last/i, /applicant.?family/i, /nachname/i, /apellido/i, /姓/i, /фамилия/i, /sobrenome/i, /cognome/i
        ],
        attributes: ['name', 'id', 'placeholder', 'aria-label', 'label'],
        confidence: 0.9
      },
      email: {
        patterns: [
          /email/i, /e.?mail/i, /mail/i, /contact.?email/i, /correo/i, /courriel/i, /e.?post/i, /电子邮件/i, /почта/i, /メール/i
        ],
        attributes: ['name', 'id', 'placeholder', 'aria-label', 'type', 'label'],
        confidence: 0.95
      },
      phone: {
        patterns: [
          /phone/i, /tel/i, /mobile/i, /contact.?phone/i, /cell/i, /cellular/i, /telefono/i, /telefon/i, /电话/i, /телефон/i, /telefone/i, /nummer/i, /номер/i, /mob/i, /handy/i
        ],
        attributes: ['name', 'id', 'placeholder', 'aria-label', 'type', 'label'],
        confidence: 0.9
      },
      linkedin: {
        patterns: [
          /linkedin/i, /linked.?in/i, /lnkd/i, /profile.?link/i, /professional.?network/i
        ],
        attributes: ['name', 'id', 'placeholder', 'aria-label', 'label'],
        confidence: 0.95
      },
      github: {
        patterns: [
          /github/i, /git.?hub/i, /gh/i, /repo.?link/i, /source.?code/i
        ],
        attributes: ['name', 'id', 'placeholder', 'aria-label', 'label'],
        confidence: 0.95
      },
      website: {
        patterns: [
          /website/i, /portfolio/i, /url/i, /site/i, /web.?page/i, /personal.?site/i, /homepage/i, /site.?web/i, /webseite/i, /web.?address/i
        ],
        attributes: ['name', 'id', 'placeholder', 'aria-label', 'label'],
        confidence: 0.8
      },
      address: {
        patterns: [
          /address/i, /location/i, /city/i, /state/i, /zip/i, /postal/i, /postcode/i, /street/i, /country/i, /direccion/i, /adresse/i, /adresse/i, /plz/i, /indirizzo/i, /адрес/i, /地址/i
        ],
        attributes: ['name', 'id', 'placeholder', 'aria-label', 'label'],
        confidence: 0.8
      },
      education: {
        patterns: [
          /education/i, /degree/i, /university/i, /college/i, /school/i, /studies/i, /major/i, /field.?of.?study/i, /course/i, /diploma/i, /formation/i, /ausbildung/i, /学位/i, /образование/i
        ],
        attributes: ['name', 'id', 'placeholder', 'aria-label', 'label'],
        confidence: 0.8
      },
      experience: {
        patterns: [
          /experience/i, /years/i, /work/i, /employment/i, /expérience/i, /berufserfahrung/i, /experiencia/i, /опыт/i, /exp/i, /background/i, /职务/i
        ],
        attributes: ['name', 'id', 'placeholder', 'aria-label', 'label'],
        confidence: 0.7
      }
    };

    // Also check labels
    const label = this.findLabel(element);
    
    for (const [fieldType, config] of Object.entries(patterns)) {
      for (const attr of config.attributes) {
        const value = element.getAttribute(attr) || '';
        const labelText = label ? label.textContent : '';
        const combinedText = `${value} ${labelText}`.toLowerCase();
        
        for (const pattern of config.patterns) {
          if (pattern.test(combinedText)) {
            console.log('[HireBot] Detected field:', fieldType, 'for', combinedText);
            return { type: fieldType, confidence: config.confidence };
          }
        }
      }
    }

    return { type: 'unknown', confidence: 0 };
  }

  findLabel(element) {
    // Try to find associated label
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) return label;
    }

    // Look for parent label
    let parent = element.parentElement;
    while (parent && parent !== document.body) {
      if (parent.tagName === 'LABEL') {
        return parent;
      }
      parent = parent.parentElement;
    }

    // Look for nearby text
    const prevSibling = element.previousElementSibling;
    if (prevSibling && (prevSibling.tagName === 'LABEL' || prevSibling.tagName === 'SPAN')) {
      return prevSibling;
    }

    return null;
  }

  getValueForField(field, personalInfo) {
    const mapping = {
      firstName: personalInfo.firstName,
      lastName: personalInfo.lastName,
      fullName: (personalInfo.fullName || (personalInfo.firstName && personalInfo.lastName ? personalInfo.firstName + ' ' + personalInfo.lastName : '')),
      email: personalInfo.email,
      phone: personalInfo.phone,
      linkedin: personalInfo.linkedin,
      github: personalInfo.github,
      website: personalInfo.website,
      address: personalInfo.address,
      education: personalInfo.education,
      experience: personalInfo.experience
    };
    const val = mapping[field.type] || '';
    console.log('[HireBot] Filling', field.type, 'with', val);
    return val;
  }

  fillField(element, value) {
    try {
      // Focus the element first
      element.focus();

      // Clear existing value
      element.value = '';

      // Set new value
      element.value = value;

      // Trigger events to ensure the form recognizes the change
      const events = ['input', 'change', 'blur'];
      events.forEach(eventType => {
        const event = new Event(eventType, { bubbles: true });
        element.dispatchEvent(event);
      });

      // Add visual feedback
      element.style.borderColor = '#10b981';
      element.style.borderWidth = '2px';
      setTimeout(() => {
        element.style.borderColor = '';
        element.style.borderWidth = '';
      }, 1000);

      return true;
    } catch (error) {
      console.error('HireBot: Error filling field:', error);
      return false;
    }
  }

  fillTemplate(template) {
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT')) {
      this.fillField(activeElement, template);
    } else {
      this.showNotification('Please click on a text field first');
    }
  }

  showNotification(message) {
    // Remove existing notification
    const existing = document.getElementById('hirebot-notification');
    if (existing) {
      existing.remove();
    }

    const notification = document.createElement('div');
    notification.id = 'hirebot-notification';
    notification.className = 'hirebot-notification';
    notification.textContent = message;

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 3000);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.hireBotAutofill = new HireBotAutofill();
  });
} else {
  window.hireBotAutofill = new HireBotAutofill();
}
