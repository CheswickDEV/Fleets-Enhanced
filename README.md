# 🚗 Fleets Enhanced

<p align="center">
  <img src="icons/icon-128.png" alt="Fleets Enhanced Logo" width="128" height="128">
</p>

### A Firefox extension that supercharges the Fleets.eu fleet management portal with vehicle overviews, availability heatmaps, and automatic tax benefit calculations.

[![GitHub Stars](https://img.shields.io/github/stars/CheswickDEV/Fleets-Enhanced?color=00d4ff&labelColor=16161f)](https://github.com/CheswickDEV/Fleets-Enhanced)
[![Last Commit](https://img.shields.io/github/last-commit/CheswickDEV/Fleets-Enhanced?color=a855f7&labelColor=16161f)](https://github.com/CheswickDEV/Fleets-Enhanced/commits/main)
![Version](https://img.shields.io/badge/version-2.0.0-00d4ff?labelColor=16161f)
![Status](https://img.shields.io/badge/status-Active-00d4ff?labelColor=16161f)
![License](https://img.shields.io/badge/license-MIT-a855f7?labelColor=16161f)
![Firefox](https://img.shields.io/badge/Firefox-Manifest_v3-a855f7?logo=firefox&logoColor=white&labelColor=16161f)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-00d4ff?logo=javascript&logoColor=white&labelColor=16161f)

---

## 📋 Table of Contents

- [What It Does](#-what-it-does)
- [Screenshots](#-screenshots)
- [Features](#-features)
- [Usage](#-usage)
- [Quick Start](#-quick-start)
- [Design](#-design)
- [Security](#-security)
- [Tech Stack](#️-tech-stack)
- [Changelog](#-changelog)
- [Contributing](#-contributing)
- [License](#-license)

---

## 💡 What It Does

The Fleets.eu PoolCar management portal is functional but basic. This extension overlays a rich, interactive dashboard that gives you everything at a glance — without clicking through individual vehicle pages:

- See all vehicles in a sortable table with real-time availability status
- Check 12-month availability heatmaps per vehicle with one click
- Get automatic **tax benefit calculations** (German 1% rule) based on list price and powertrain type
- Spot newly added vehicles instantly through automatic diffing against your last known fleet state

---

## 📸 Screenshots

| Main Overview | Availability Heatmap | Tax Benefit Calculator |
|:-------------:|:-------------------:|:----------------------:|
| <img src="https://addons.mozilla.org/user-media/previews/full/350/350521.png?modified=1770127130" width="280"> | <img src="https://addons.mozilla.org/user-media/previews/full/350/350519.png?modified=1770127129" width="280"> | <img src="https://addons.mozilla.org/user-media/previews/full/350/350518.png?modified=1770127129" width="280"> |

---

## ⚡ Features

- **📋 Vehicle Overview** — A sortable, filterable table of all fleet vehicles with license plate, model, availability, and lease rate at a glance.

- **📅 Availability Heatmap** — Click any vehicle's availability badge to see a 12-month calendar heatmap showing booked vs. free days. Plan ahead without guessing.

- **💰 Tax Benefit Calculator** — Click the lease rate to see the gross list price and automatic calculation of the monthly taxable benefit (German "geldwerter Vorteil") using the 1% rule. Correctly handles reduced rates for EVs and plug-in hybrids.

- **🆕 New Vehicle Detection** — The extension stores your fleet state locally and highlights vehicles that weren't there last time you checked. Never miss a new addition to the pool.

- **🔄 Sortable Columns** — Click any column header to sort. Works on all fields including availability status.

- **🔗 Direct Access** — Click any license plate to jump directly to that vehicle's detail page.

---

## 📖 Usage

### Interactive Elements

| Element | Action | Description |
|:--------|:------:|:------------|
| **License Plate** | Click | Opens the vehicle detail modal |
| **Availability Badge** | Click | Shows 12-month availability heatmap |
| **Lease Rate** | Click | Shows gross list price and tax benefit |
| **Column Headers** | Click | Sorts the table by that column |
| **Scan Button** | Click | Refreshes the vehicle list |

### Availability Status

| Badge | Meaning |
|:------|:--------|
| 🟢 **Free** | Vehicle is available immediately |
| 🟢 **Free (XM)** | Vehicle is free for X consecutive months |
| 🟡 **From DD.MM** | Vehicle becomes available on this date |
| 🔴 **Blocked** | Vehicle is booked until contract end |

### Tax Benefit Calculation (German 1% Rule)

| Powertrain | List Price | Monthly Rate |
|:-----------|:----------:|:------------:|
| Electric | ≤ €70,000 | **0.25%** |
| Electric | > €70,000 | **0.50%** |
| Plug-in Hybrid | any | **0.50%** |
| Combustion | any | **1.00%** |

---

## 🚀 Quick Start

### Prerequisites

- Firefox 142+

###  Installation

1. Open [Link](https://addons.mozilla.org/de/firefox/addon/fleets-enhanced/) in Firefox
2. Click "Install"

### Permanent Installation

1. Rename the `.zip` file to `.xpi`
2. In Firefox → Menu → Add-ons and Themes
3. Gear icon → "Install Add-on From File..."
4. Select the `.xpi` file

The overlay appears automatically when you visit any Fleets.eu portal page.

---

## 🎨 Design

The interface follows a clean, modern design language:

- **Glassmorphism** — Subtle transparency and blur effects
- **System Font Stack** — Native typography for each platform
- **8-Point Grid** — Consistent spacing throughout
- **Gradient Badges** — Blue-to-teal gradient for license plates
- **Smooth Animations** — Transitions and hover effects for interactive elements

```css
--primary:    #007AFF  /* Blue */
--success:    #34C759  /* Green — Free */
--warning:    #FF9500  /* Orange — Partial */
--danger:     #FF3B30  /* Red — Blocked */
--gradient:   linear-gradient(135deg, #3478f6 0%, #00c7be 100%)
```

---

## 🔒 Security

- ✅ No `innerHTML` — All DOM manipulation uses safe methods
- ✅ Input sanitization for all user-facing data
- ✅ CSP-compliant

---

## 🛠️ Tech Stack

![JavaScript](https://img.shields.io/badge/JavaScript-16161f?style=flat-square&logo=javascript&logoColor=00d4ff)
![CSS](https://img.shields.io/badge/CSS3-16161f?style=flat-square&logo=css3&logoColor=00d4ff)
![Firefox](https://img.shields.io/badge/WebExtensions_API-16161f?style=flat-square&logo=firefox&logoColor=a855f7)

```
fleets-enhanced/
├── manifest.json              # Extension manifest (v3)
├── scripts/
│   ├── content_script.js      # Main logic (DOM, API, UI)
│   └── background.js          # Service worker
├── styles/
│   └── overlay.css            # All styles
├── icons/
│   ├── icon-48.png
│   ├── icon-96.png
│   ├── icon-128.png
│   └── logo.png
├── popup.html                 # Browser action popup
└── popup.js                   # Popup logic
```

### API Endpoints Used

| Endpoint | Method | Description |
|:---------|:------:|:------------|
| `/api/pool/booked-days` | POST | Vehicle availability data |
| `/api/pool/car-details` | POST | Vehicle details (list price, powertrain) |

### Data Storage

- `browser.storage.local` for persistent vehicle data
- Diffing algorithm compares current fleet against stored state to detect new vehicles

---

## 📝 Changelog

### v2.0.0 (current)
- ✨ Clickable license plates → vehicle detail modal
- ✨ License plate formatting (e.g. DCG5128E → D-CG-5128E)
- ✨ Tax benefit popup on lease rate click
- ✨ German powertrain type translations
- ✨ Real-time availability column with status badges
- ✨ 12-month availability heatmap on badge click

<details>
<summary>Older versions</summary>

### v1.0.0
- 🚀 Initial release
- ✨ Base scraping and overlay

</details>

---

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a PR.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

[MIT](LICENSE) — do what you want, just give credit.

---

<p align="center">
  <a href="https://cheswick.dev">
    <img src="https://img.shields.io/badge/CHESWICK.DEV-00d4ff?style=for-the-badge&logo=firefox&logoColor=0a0a0f&labelColor=a855f7" alt="cheswick.dev" />
  </a>
</p>

<p align="center">
  Made with 🖤 by <a href="https://cheswick.dev">cheswick.dev</a>
</p>
