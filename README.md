# HireBot - Chrome Extension for Job Application Autofill

A powerful Chrome Extension (Manifest V3) that helps you automatically fill job application forms with your personal details and template answers.

## 🚀 Features

### ✅ Auto-fill Personal Information
- Automatically detects and fills common form fields (name, email, phone, etc.)
- Smart field detection using name, id, placeholder, and label analysis
- Floating "⚡ Autofill" button for manual triggering

### ✅ Template Management
- Store multiple template answers for common questions
- Quick copy-to-clipboard and auto-fill functionality
- Expandable answers for different scenarios

### ✅ Data Management
- Secure local storage using Chrome's storage API
- Export/Import functionality for data backup
- Clean, intuitive popup interface with TailwindCSS styling

### ✅ Customizable Settings
- Toggle floating button visibility
- Configurable button position
- Adjustable fill delay for better UX

## 📁 Project Structure

```
chrome-extension/
├── manifest.json          # Extension manifest (V3)
├── background.js          # Service worker for background tasks
├── content.js            # Content script for page interaction
├── content.css           # Styles for content script elements
├── popup.html            # Extension popup interface
├── popup.js              # Popup logic and UI handling
├── popup.css             # Popup styling
├── icons/                # Extension icons
│   └── icon.svg          # SVG icon source
└── README.md             # This file
```

## 🛠️ Installation

### Developer Mode Installation

1. **Enable Developer Mode**
   - Open Chrome and go to `chrome://extensions/`
   - Toggle "Developer mode" in the top right corner

2. **Load the Extension**
   - Click "Load unpacked"
   - Select the `chrome-extension` folder
   - The extension will appear in your extensions list

3. **Pin the Extension**
   - Click the puzzle piece icon in Chrome toolbar
   - Find "HireBot" and click the pin icon

### Production Installation (Future)
- Will be available on Chrome Web Store once published

## 📖 Usage Guide

### Setting Up Your Profile

1. **Click the HireBot extension icon** in your toolbar
2. **Go to the "Profile" tab** (default)
3. **Fill in your personal information:**
   - Name, email, phone number
   - LinkedIn, GitHub, website URLs
   - Address, education details
   - Experience level and current role
4. **Click "Save Profile"**

### Managing Templates

1. **Switch to the "Templates" tab**
2. **Add new templates:**
   - Enter a question/topic (e.g., "Why should we hire you?")
   - Add your template answer
   - Click "Add Template"
3. **Use existing templates:**
   - Click on any answer to copy it and fill the focused field
   - Add multiple answers to the same question for variety

### Auto-filling Forms

#### Method 1: Floating Button
- Navigate to any job application page
- Look for the floating "⚡ Autofill" button
- Click it to automatically fill detected fields

#### Method 2: Extension Popup
- Click the HireBot extension icon
- Click the "⚡ Autofill" button in the popup

#### Method 3: Template Usage
- Click on any text field in a form
- Open HireBot popup → Templates tab
- Click on a template answer to fill the field

### Customizing Settings

1. **Go to the "Settings" tab**
2. **Configure options:**
   - Toggle floating button on/off
   - Change button position (4 corner options)
   - Adjust fill delay (0-1000ms)
3. **Save settings** (page will reload to apply changes)

## 🔧 Technical Features

### Manifest V3 Compliance
- Uses service worker instead of background pages
- Implements proper permissions and host permissions
- Modern Chrome extension architecture

### Smart Field Detection
The extension uses multiple strategies to identify form fields:

```javascript
// Field detection patterns
firstName: /first.?name/i, /fname/i, /given.?name/i
lastName: /last.?name/i, /lname/i, /surname/i
email: /email/i, /e.?mail/i
phone: /phone/i, /tel/i, /mobile/i
// ... and more
```

### Data Storage
- Uses `chrome.storage.local` for secure data persistence
- Structured data format for easy export/import
- No external servers - everything stays local

### Content Script Integration
- Non-intrusive floating button
- Smooth animations and visual feedback
- Respects page styling and layout

## 🎨 UI/UX Features

### Modern Design
- TailwindCSS-inspired styling
- Gradient backgrounds and smooth transitions
- Responsive 350px width popup
- Clean, mobile-friendly interface

### Visual Feedback
- Success/error notifications
- Field highlighting during autofill
- Smooth animations for better UX
- Clear visual indicators for actions

## 🔒 Privacy & Security

- **No data transmission** - everything stays on your device
- **No tracking** - we don't collect any usage data
- **Local storage only** - uses Chrome's secure storage API
- **Open source** - you can inspect all the code

## 🚀 Future Enhancements

### Planned Features
- [ ] Multiple profile support (Internship, Full-time, etc.)
- [ ] AI integration for generating role-specific answers
- [ ] Form field learning and improvement
- [ ] Custom field mapping
- [ ] Team/organization sharing features

### AI Integration Placeholder
The codebase includes placeholder functions for future AI integration:

```javascript
// Future AI integration point
async generateRoleSpecificAnswer(question, jobDescription) {
  // TODO: Integrate with OpenAI or similar API
  // to generate contextual answers
}
```

## 📝 Example Data Format

### Profile Data
```json
{
  "profiles": [{
    "id": "default",
    "name": "Default Profile", 
    "personalInfo": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@email.com",
      // ... more fields
    }
  }]
}
```

### Template Data
```json
{
  "templates": [{
    "id": "best-project",
    "question": "Describe your best project",
    "answers": [
      "Built a full-stack investment platform...",
      "Developed a SaaS analytics dashboard..."
    ]
  }]
}
```

## 🐛 Troubleshooting

### Extension Not Working
1. Check if developer mode is enabled
2. Reload the extension from `chrome://extensions/`
3. Refresh the webpage you're trying to autofill

### Fields Not Being Detected
1. The page might use unusual field naming
2. Try the manual floating button approach
3. Check browser console for any errors

### Data Not Saving
1. Ensure you have storage permissions
2. Check if popup closes too quickly
3. Look for error notifications in the popup

## 🤝 Contributing

This extension is built with modularity in mind. Key areas for contribution:

1. **Field Detection**: Add more patterns in `content.js`
2. **UI Improvements**: Enhance styling in `popup.css`
3. **New Features**: Add functionality to existing modules
4. **Bug Fixes**: Help identify and resolve issues

## 📄 License

This project is open source. Feel free to modify and distribute according to your needs.

## 🆘 Support

For issues, questions, or feature requests:
1. Check the troubleshooting section above
2. Review the browser console for errors
3. Create detailed bug reports with steps to reproduce

---

**Happy Job Hunting! 🎯**

*HireBot - Making job applications faster and easier.*
