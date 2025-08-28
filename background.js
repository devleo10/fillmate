// Background Service Worker for FillMate Extension
class BackgroundService {
  constructor() {
    this.initializeExtension();
  }

  initializeExtension() {
    // Set up default data on installation
    chrome.runtime.onInstalled.addListener(() => {
      this.setDefaultData();
    });

    // Listen for messages from content script and popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep the message channel open for async responses
    });
  }

  async setDefaultData() {
    try {
      const existingData = await chrome.storage.local.get(['profiles', 'templates', 'settings', 'onboardingCompleted']);
      
      // Only set default profile if no profiles exist
      if (!existingData.profiles || existingData.profiles.length === 0) {
        const defaultProfile = {
          id: 'default',
          name: 'Default Profile',
          personalInfo: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@email.com',
            phone: '+1-555-0123',
            address: '123 Main Street, San Francisco, CA 94102',
            linkedin: 'https://linkedin.com/in/johndoe',
            github: 'https://github.com/johndoe',
            website: 'https://johndoe.dev',
            education: 'Bachelor of Science in Computer Science',
            university: 'University of California, Berkeley',
            graduationYear: '2023',
            experience: '2+ years',
            currentRole: 'Software Engineer'
          }
        };

        await chrome.storage.local.set({
          profiles: [defaultProfile],
          activeProfile: 'default'
        });
      }

      if (!existingData.templates) {
        const defaultTemplates = [
          {
            id: 'tell-about-yourself',
            question: 'Tell me about yourself',
            answers: [
              'I am a motivated professional with strong analytical and problem-solving skills. I thrive in collaborative environments and am passionate about continuous learning and growth.',
              'As a dedicated team player with excellent communication skills, I bring a unique combination of technical expertise and creative thinking to every project I work on.',
              'I am a results-driven professional who enjoys tackling complex challenges and delivering high-quality solutions that exceed expectations.'
            ]
          },
          {
            id: 'why-company',
            question: 'Why do you want to work here?',
            answers: [
              'I am impressed by your company\'s commitment to innovation and excellence. The opportunity to contribute to meaningful projects while growing professionally is exactly what I\'m looking for.',
              'Your company\'s reputation for fostering a collaborative culture and supporting employee development aligns perfectly with my career goals and values.',
              'The opportunity to work with a talented team on impactful projects while contributing to the company\'s continued success is incredibly appealing to me.'
            ]
          },
          {
            id: 'greatest-strength',
            question: 'What is your greatest strength?',
            answers: [
              'My greatest strength is my ability to adapt quickly to new situations and learn from challenges. I approach problems with a positive attitude and find creative solutions.',
              'I excel at building strong relationships and collaborating effectively with diverse teams to achieve common goals and deliver exceptional results.',
              'My attention to detail and commitment to quality ensures that I consistently deliver high-standard work while meeting deadlines and exceeding expectations.'
            ]
          },
          {
            id: 'career-goals',
            question: 'Where do you see yourself in 5 years?',
            answers: [
              'In five years, I see myself having grown both professionally and personally, taking on greater responsibilities while continuing to contribute meaningfully to my organization\'s success.',
              'I envision myself in a leadership role where I can mentor others while continuing to develop my skills and make a significant impact in my field.',
              'I aim to be recognized as a subject matter expert in my area, contributing to strategic initiatives while maintaining a strong focus on professional development and innovation.'
            ]
          }
        ];

        await chrome.storage.local.set({ templates: defaultTemplates });
      }

      if (!existingData.settings) {
        await chrome.storage.local.set({
          settings: {
            autoFillEnabled: true,
            showFloatingButton: true,
            buttonPosition: 'bottom-right',
            fillDelay: 100
          }
        });
      }

      console.log('FillMate: Default data initialized');
    } catch (error) {
      console.error('FillMate: Error setting default data:', error);
    }
  }

  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.action) {
        case 'getStoredData':
          const data = await chrome.storage.local.get(null);
          sendResponse({ success: true, data });
          break;

        case 'saveData':
          await chrome.storage.local.set(message.data);
          sendResponse({ success: true });
          break;

        case 'exportData':
          const exportData = await chrome.storage.local.get(null);
          sendResponse({ success: true, data: exportData });
          break;

        case 'importData':
          await chrome.storage.local.clear();
          await chrome.storage.local.set(message.data);
          sendResponse({ success: true });
          break;

        case 'autofillPage':
          this.triggerAutofill(sender.tab.id);
          sendResponse({ success: true });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('FillMate: Error handling message:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async triggerAutofill(tabId) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
          if (window.FillMateAutofill) {
            window.FillMateAutofill.fillForm();
          }
        }
      });
    } catch (error) {
      console.error('FillMate: Error triggering autofill:', error);
    }
  }
}

// Initialize the background service
new BackgroundService();
