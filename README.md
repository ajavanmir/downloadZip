Here's a professional README.md for your GitHub repository:

```markdown
# FileToZip Project

A JavaScript utility that converts file attachments in HTML tables to downloadable ZIP archives with progress tracking.

## Features

- 📦 Converts multiple file attachments into a single ZIP download
- ⏳ Real-time progress tracking during download and compression
- 🎨 Customizable download button text and position
- 📝 Supports national code-based file naming (optional)
- ⚡ Optimized with concurrent downloads (3 files at once)
- 📱 Responsive design compatible

## Installation

1. Include the required files in your project:
   ```html
   <script src="./js/jszip.min.js"></script>
   <script src="./js/app.js"></script>
   <link rel="stylesheet" href="./css/style.css">
   ```

2. Add the initialization script to your HTML:
   ```javascript
   document.addEventListener("DOMContentLoaded", function(){
       const downloader = new AttachmentDownloader({
           tableSelector: "table",
           nationalCodeSelector: ".nationalcode", // optional
           buttonText: "Download",
           buttonPositionSelector: "tbody > tr > td"
       });
       downloader.initializeDownloadButtons();
   })
   ```

## Configuration Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `tableSelector` | string | Yes | CSS selector for tables containing file links |
| `nationalCodeSelector` | string | No | CSS selector for national code elements (used for ZIP naming) |
| `buttonText` | string | No | Text for download button (default: "Download Attachments") |
| `buttonPositionSelector` | string | Yes | Where to insert download buttons |

## File Structure

```
fileToZip/
├── index.html         # Example implementation
├── js/
│   ├── app.js         # Main application logic
│   └── jszip.min.js   # JSZip library
└── css/
    └── style.css      # Optional styling
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Edge (latest)
- Safari 12+

## License

Copyright © 2025 Amir Javanmir.

## Contributing

Contributions are welcome! Please open an issue or pull request for any improvements.

---

**Note**: This project requires the [JSZip library](https://stuk.github.io/jszip/) to function properly.
