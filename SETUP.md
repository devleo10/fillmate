# FillMate Chrome Extension - Quick Setup

## Installation Steps

### 1. Prerequisites
- Google Chrome browser
- Basic knowledge of Chrome extensions

### 2. Quick Installation

1. **Download or Clone**
   ```bash
   # If you have this as a git repository
   git clone <repository-url>
   
   # Or download and extract the ZIP file
   ```

2. **Enable Developer Mode**
   - Open Chrome and navigate to `chrome://extensions/`
   - Toggle "Developer mode" in the top-right corner

3. **Load Extension**
   - Click "Load unpacked" button
   - Navigate to and select the `chrome-extension` folder
   - The extension should now appear in your extensions list

4. **Pin Extension**
   - Click the puzzle piece icon (🧩) in the Chrome toolbar
   - Find "FillMate - Job Application Autofill"
   - Click the pin icon to pin it to your toolbar

### 3. First-Time Setup & Pre-filled Data

**✨ Example Data Included**
The extension comes with realistic example data to help you get started:
- **Profile tab**: Sample personal information (John Smith example)
- **Templates tab**: Professional answers for common interview questions
- **Settings tab**: Optimized default configuration

All example data is fully editable - simply update with your actual information!

1. **Click the FillMate icon** in your toolbar
2. **Review & update** the pre-filled profile information in the Profile tab
3. **Customize template answers** in the Templates tab (or use the examples)
4. **Configure settings** as needed in the Settings tab
5. **Changes are saved automatically**

### 4. Usage

1. **Navigate to any job application page**
2. **Method 1**: Click the floating "⚡ Autofill" button on the page
3. **Method 2**: Click the extension icon and then "⚡ Autofill"
4. **For templates**: Focus a text field and click template answers in the popup

### 5. Troubleshooting

**Extension doesn't appear:**
- Make sure Developer mode is enabled
- Try refreshing the extensions page
- Check if the folder path is correct

**Autofill not working:**
- Refresh the webpage
- Check if the extension has permissions
- Look for error messages in browser console (F12)

**Data not saving:**
- Ensure popup doesn't close too quickly after clicking Save
- Check for error notifications in the popup

### 6. Development Setup (for customization)

If you want to modify the extension:

1. **Make changes** to any of the files
2. **Go to** `chrome://extensions/`
3. **Click the refresh icon** on the FillMate extension card
4. **Test your changes** on any webpage

### 7. Backup Your Data

- Use the Export button (📤) in the popup to backup your data
- Keep the exported JSON file safe
- Use Import button (📥) to restore data if needed

## File Structure Quick Reference

```
chrome-extension/
├── manifest.json     # Extension configuration
├── background.js     # Background service worker
├── content.js        # Injected page script
├── content.css       # Page styling
├── popup.html        # Extension popup UI
├── popup.js          # Popup functionality  
├── popup.css         # Popup styling
├── icons/            # Extension icons
├── example-data.json # Sample data structure
└── README.md         # Full documentation
```

## Quick Customization

**Change button position:**
- Settings tab → Button Position dropdown

**Modify templates:**
- Templates tab → Add/edit/delete answers

**Update personal info:**
- Profile tab → Edit and save

**Export/Import data:**
- Use 📤 and 📥 buttons in popup header

---

**Need help?** Check the full README.md file for detailed documentation.

**Happy job hunting! 🎯**
