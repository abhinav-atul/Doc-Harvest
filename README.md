# DocHarvest

DocHarvest is a Manifest V3 browser extension for Google Classroom that helps you collect document links from the current page, review them in a popup, and download selected files in bulk.

The extension is fully client-side. It injects a script into the active tab, scrolls the page to surface file links, extracts Google Drive document URLs, and lets the user download selected items from the popup UI.

## What It Does

- Scans the currently open Google Classroom page for Google Drive file links
- Auto-scrolls the page for up to 25 seconds to surface more attachments
- Deduplicates file links before listing them
- Shows detected files in a popup with per-file type icons (PDF, Word, Excel, PowerPoint)
- Supports multi-select and select-all actions
- Downloads selected files directly via the Chrome Downloads API
- Exports Google Docs (without a standard extension) as PDF automatically
- Lets you click a listed file to scroll back to that item on the page

## How It Works

1. Open a Google Classroom page in a Chromium-based browser.
2. Launch the DocHarvest extension popup.
3. Click **Extract Links**.
4. The extension injects `background.js` into the active tab.
5. The injected script scrolls the page, collects Google Drive file URLs, and sends them back to the popup.
6. The popup renders the file list and allows selection.
7. Clicking **Download** triggers `chrome.downloads.download()` for each selected file.

## Project Structure

```text
DocHarvest/
├── manifest.json          # Chrome extension manifest (MV3)
├── pop.html               # Popup UI markup
├── styles.css             # Popup styling
├── content.js             # Popup logic and Chrome extension interactions
├── background.js          # Injected page scraper / auto-scroll logic
├── assets/                # Extension icon and file-type images
│   ├── logo.png           # Extension icon
│   ├── excelFile.png
│   ├── wordFile.png
│   ├── pdfFile.png
│   ├── powerpointFile.png
│   └── file.png           # Generic file icon
├── fonts/                 # Local fonts used by the popup UI
│   ├── orbitronFont/
│   └── poppinsFont/
├── LICENSE
├── README.md
└── .gitignore
```

## Main Files

### `manifest.json`

Defines the extension popup, icons, and required permissions:

- `activeTab` — access the currently active tab to inject the scraper
- `scripting` — inject `background.js` into the page
- `downloads` — download files via `chrome.downloads.download()`

### `pop.html`

Contains the popup UI for three states:

- **Hero** — initial landing screen with the Extract Links button
- **Loading** — spinner shown while the page is being scrolled and scanned
- **Results** — file list with checkboxes, select-all, and download/cancel actions

### `content.js`

Controls popup behavior:

- Starts extraction by injecting `background.js` into the active tab
- Receives extracted titles and links via `chrome.runtime.onMessage`
- Builds the file list UI with type-specific icons
- Manages selection counters and select-all checkbox sync
- Downloads selected files using `chrome.downloads.download()`
- Handles cancel by reloading the tab and popup

### `background.js`

Runs inside the active page after injection:

- Scrolls the page automatically for up to 25 seconds
- Scans anchor tags for Google Drive document links
- Ignores Google Drive folder links
- Cleans up filenames (removes duplicate extensions and trailing labels)
- Deduplicates URLs
- Sends extracted titles and links back to the extension via `chrome.runtime.sendMessage`
- Scrolls a source element into view when a popup item is clicked

## Installation

### Load the extension from source

1. Clone or download this repository.
2. Open `chrome://extensions/` in Chrome or the extensions page in another Chromium-based browser.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the repository root `DocHarvest/` directory.

## Usage

1. Open a Google Classroom page that contains attachment links.
2. Click the DocHarvest extension icon.
3. Click **Extract Links**.
4. Wait while the page scrolls and links are collected.
5. Select the files you want (or use **Select All**).
6. Click **Download**.

## Notes and Limitations

- The extension is designed around Google Drive links present on the currently open Classroom page.
- Folder links are intentionally excluded.
- Link extraction depends on what is visible or loaded while the page is auto-scrolling.
- Files without a standard extension (Google Docs, Sheets, Slides) are exported as PDF.
- The current codebase targets Chromium extension APIs (Chrome, Edge, Brave, etc.).

## Local Development

No build step is required. Update the source files, then reload the unpacked extension in the browser to test changes.

## License

This project is distributed under the terms of the [GNU General Public License v3.0 (GPL-3.0)](./LICENSE).
