/*
Copyright amir javanmir
Released on: May 6, 2025
*/
class AttachmentDownloader {
    constructor(options = {}) {
        this.loadJSZipPromise = this._loadJSZip();
        this.tableSelector = options.tableSelector;
        this.nationalCodeSelector = options.nationalCodeSelector || null;
        this.buttonText = options.buttonText || "Download Attachments";
        this.buttonPositionSelector = options.buttonPositionSelector;
    }

    async _loadJSZip() {
        if (window.JSZip) return Promise.resolve();
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "./js/jszip.min.js";
            script.onload = resolve;
            document.body.appendChild(script);
        })
    }

    async initializeDownloadButtons() {
        await this.loadJSZipPromise;

        if (!this.tableSelector) {
            console.error("Error: Table selector (tableSelector) not specified.");
            return;
        }

        const tables = document.querySelectorAll(this.tableSelector);

        if (tables.length == 0) {
            console.error("Error: No table with the specified selector was found.");
            return;
        }

        tables.forEach((table, index) => {
            const parent = table;

            if (!this.buttonPositionSelector) {
                console.error("Error: Button Position Selector not set!");
                return;
            }

            const buttonPosition = parent.querySelector(this.buttonPositionSelector);
            if (!buttonPosition) {
                console.error(`Error: Button display location for table number ${index} not found.`);
                return;
            }

            const downloadBtn = document.createElement("a");
            downloadBtn.id = `download-${index}`;
            downloadBtn.className = "download-btn";
            downloadBtn.textContent = this.buttonText;
            buttonPosition.insertBefore(downloadBtn, buttonPosition.firstChild);

            downloadBtn.addEventListener("click", async () => {
                await this._handleDownloadButtonClick(parent, downloadBtn, index);
            })
        })
    }

    async _handleDownloadButtonClick(parent, downloadBtn, index) {
        downloadBtn.disabled = true;
        downloadBtn.textContent = "Waiting...";
        try {
            const fileLinks = this._extractFileLinks(parent);
            if (fileLinks.length === 0) {
                console.error("No attachment found for download.");
                return;
            }

            if (fileLinks.length === 1) {
                await this._downloadSingleFile(fileLinks[0]);
                return;
            }

            await this._downloadAsZip(fileLinks, downloadBtn, index);
        } catch (error) {
            console.error("Error in the download process:", error);
        } finally {
            downloadBtn.disabled = false;
            downloadBtn.textContent = this.buttonText;
        }
    }

    _extractFileLinks(parent) {
        const fileLinks = [];
        const anchors = parent.querySelectorAll("a[href*='/portal/file/']");
        anchors.forEach((anchor) => {
            const url = anchor.getAttribute("href");
            const filename = `file-${fileLinks.length + 1}.${this.getFileExtension(url)}`;
            fileLinks.push({ url, filename });
        })
        return fileLinks;
    }

    getFileExtension(url) {
        const match = url.match(/\.([a-z]+)(?:[0-9]*)(?:[?#]|$)/i);
        return match ? match[1] : "bin";
    }

    _downloadSingleFile(file) {
        return new Promise((resolve) => {
            const link = document.createElement("a");
            link.href = file.url;
            link.download = file.filename;
            link.style.display = "none";
            document.body.appendChild(link);
            link.click();
            setTimeout(function () {
                document.body.removeChild(link);
                resolve();
            }, 100)
        })
    }

    async _downloadAsZip(fileLinks, downloadBtn, index) {
        const zip = new JSZip();
        const MAX_CONCURRENT_DOWNLOADS = 3;
        let downloadedCount = 0;
        for (let i = 0; i < fileLinks.length; i += MAX_CONCURRENT_DOWNLOADS) {
            const batch = fileLinks.slice(i, i + MAX_CONCURRENT_DOWNLOADS);
            await Promise.all(
                batch.map(async (file) => {
                    try {
                        const response = await fetch(file.url);
                        if (!response.ok) throw new Error(`Failed to fetch ${file.url}`);
                        const blob = await response.blob();
                        zip.file(file.filename, blob);
                        downloadedCount++;
                        downloadBtn.textContent = `Downloading (${downloadedCount}/${fileLinks.length})`;
                    } catch (error) {
                        console.error(`Error downloading ${file.filename}:`, error);
                    }
                })
            )
        }
        downloadBtn.textContent = "Compressing...";
        const content = await zip.generateAsync({ type: "blob" }, (metadata) => {
            downloadBtn.textContent = `Compressing (${Math.round(metadata.percent)})%`
        })
        const nationalCode = this._getNationalCode(index);
        const zipFilename = nationalCode ? `${nationalCode}.zip` : `files-${new Date().toISOString().slice(0, 10)}-${index}.zip`;

        const zipUrl = URL.createObjectURL(content);
        const link = document.createElement("a");
        link.href = zipUrl;
        link.download = zipFilename;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();

        setTimeout(function () {
            document.body.removeChild(link);
            URL.revokeObjectURL(zipUrl);
        }, 100);
    }
    
    _getNationalCode(index) {
        if (!this.nationalCodeSelector) return null;
        const nationalCodeElements = document.querySelectorAll(this.nationalCodeSelector);
        const nationalCodeElement = nationalCodeElements[index];
        return nationalCodeElement ? nationalCodeElement.textContent.trim() : null;
    }
}