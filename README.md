# 🚗 Fleets Enhanced

A Firefox extension that enhances the user experience for Fleets.eu fleet management portals.

![Firefox](https://img.shields.io/badge/Firefox-140%2B-orange?logo=firefox)
![License](https://img.shields.io/badge/License-MIT-blue)
![Manifest](https://img.shields.io/badge/Manifest-V3-green)

## Features

- **Apple-inspired Design** – Modern, clean UI with glassmorphism effects
- **Automatic Vehicle Detection** – Scrapes all vehicle data automatically
- **New Vehicle Highlighting** – New entries are marked with a green badge
- **Search & Filter** – Quickly find vehicles by license plate, brand, model, or location
- **Sorting** – Sort by license plate, brand, contract end date, leasing rate, or location
- **Persistent Storage** – Data persists across browser sessions
- **Privacy-focused** – All data stays local, no external transmission

## Screenshots

*Coming soon*

## Installation

### Firefox Add-ons (Recommended)
*Coming soon - pending Mozilla review*

### Manual Installation

1. Download the latest release from [Releases](../../releases)
2. Open Firefox and go to `about:debugging`
3. Click "This Firefox" → "Load Temporary Add-on..."
4. Select the `manifest.json` file from the extracted folder
5. Navigate to any `*.fleets.eu` portal

### From Source

```bash
git clone https://github.com/YOUR_USERNAME/fleets-enhanced.git
cd fleets-enhanced
# Load via about:debugging as described above
```

## Requirements

- Firefox 140 or later
- Access to a Fleets.eu fleet management portal

## Privacy & Security

This extension implements several security measures:

- **XSS Protection**: All user data is sanitized before display
- **Input Validation**: Numeric values are validated
- **No External Resources**: All assets are bundled locally
- **Minimal Permissions**: Only `storage`, `activeTab`, and `tabs` required
- **No Data Collection**: Extension does not collect or transmit any personal data
- **Local Storage Only**: All vehicle data stays in your browser

## File Structure

```
fleets-enhanced/
├── manifest.json          # Extension configuration
├── popup.html             # Popup UI
├── popup.js               # Popup logic
├── scripts/
│   ├── background.js      # Service Worker
│   └── content_script.js  # DOM Scraper & Overlay
├── styles/
│   └── overlay.css        # Apple-inspired styling
└── icons/
    ├── icon-48.png
    ├── icon-96.png
    ├── icon-128.png
    └── logo.png
```

## How It Works

1. The content script scans the fleet portal page for vehicle data
2. Data is extracted using DOM queries (license plates, brands, models, contract dates, etc.)
3. Vehicle data is stored locally using `browser.storage.local`
4. New vehicles are identified by comparing against previously stored data
5. An overlay displays all vehicles in a sortable, searchable table

## Development

### Prerequisites

- Firefox 140+
- Basic knowledge of WebExtensions API

### Testing

1. Make changes to the source files
2. Go to `about:debugging` in Firefox
3. Click "Reload" on the extension
4. Refresh the Fleets.eu page

### Building

No build step required – the extension runs directly from source.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- Design inspired by Apple's Human Interface Guidelines
- Built with the WebExtensions API

---

**Note**: This extension is not affiliated with or endorsed by Fleets.eu or any fleet management provider. It is an independent tool to enhance the user experience.
