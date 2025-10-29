const transcriptHtmlElementSelector = 'ytd-engagement-panel-section-list-renderer[target-id=engagement-panel-searchable-transcript]';
const downloadHtmlElementId = 'youtube-transcript-to-text-chrome-extension-download';
const newTabHtmlElementId = 'youtube-transcript-to-text-chrome-extension-new-tab';
const timestampIntervalSec = 15;

const downloadSvg = `
			<div style="width: 100%; height: 100%; display: block; fill: currentcolor;">
<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/></svg>
			</div>
`;

const newPageSvg = `
			<div style="width: 100%; height: 100%; display: block; fill: currentcolor;">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h240v80H200v560h560v-240h80v240q0 33-23.5 56.5T760-120H200Zm440-400v-120H520v-80h120v-120h80v120h120v80H720v120h-80Z"/></svg>
			</div>
`;

new MutationObserver(function(mutationsList, observer) {
    for (const mutation of mutationsList) {
        if (mutation.target.getAttribute("target-id") !== "engagement-panel-searchable-transcript") {
			continue;
        }

		const transcriptHtmlElement = document.querySelector(transcriptHtmlElementSelector);
		const transcriptHeaderHtmlElement = transcriptHtmlElement.querySelector("div#header").querySelector("div#header");
		const menuIconHtmlElement = transcriptHeaderHtmlElement.querySelector("div#menu");

        // download button

        const oldDownloadHtmlElement = document.getElementById(downloadHtmlElementId);

        if (oldDownloadHtmlElement) {
            oldDownloadHtmlElement.remove();
        }

        const downloadHtmlElement = document.createElement("div");
		downloadHtmlElement.id = downloadHtmlElementId;
        downloadHtmlElement.style.cursor = "pointer";
        downloadHtmlElement.style.width = "24px";
        downloadHtmlElement.style.height = "24px";
        downloadHtmlElement.style.margin = "0 8px";


        transcriptHeaderHtmlElement.insertBefore(downloadHtmlElement, menuIconHtmlElement);

        downloadHtmlElement.insertAdjacentHTML( "beforeend", downloadSvg);

        downloadHtmlElement.addEventListener("click", ()=> {
            clickToDownload(transcriptHtmlElement);
        });

        // newTab button

        const oldNewTabHtmlElement = document.getElementById(newTabHtmlElementId);

        if (oldNewTabHtmlElement) {
            oldNewTabHtmlElement.remove();
        }

        const newTabHtmlElement = document.createElement("div");
        newTabHtmlElement.id = newTabHtmlElementId;
        newTabHtmlElement.style.cursor = "pointer";
        newTabHtmlElement.style.width = "24px";
        newTabHtmlElement.style.height = "24px";
        downloadHtmlElement.style.margin = "0 8px";

        transcriptHeaderHtmlElement.insertBefore(newTabHtmlElement, menuIconHtmlElement);

        newTabHtmlElement.insertAdjacentHTML("beforeend", newPageSvg);

        newTabHtmlElement.addEventListener("click", ()=> {
            clickToNewTab(transcriptHtmlElement);
        });

		observer.disconnect();
	}
}).observe(document.body, {childList: true, subtree: true });

function clickToNewTab(transcriptHtmlElement) {
    const textObjects = parser(transcriptHtmlElement);
    const text = makeHtml(textObjects);

    const newWindow = window.open('', '_blank');

    if (newWindow) { // Check if the window was successfully opened
        newWindow.document.write(text);
        newWindow.document.close(); // Close the document to ensure content is rendered
    } else {
        alert('Could not open new tab. Please allow pop-ups for this site.');
    }
}

function clickToDownload(transcriptHtmlElement) {
    const textObjects = parser(transcriptHtmlElement);
    const text = makeFormatedText(textObjects);
    const fileName = document.title + '.txt';
    saveTxtToFile(text, fileName);
}

/**
 * Parses the YouTube transcript panel DOM and returns an array of transcript entries.
 *
 * @param {HTMLElement} transcriptHtmlElement - The root element of the transcript panel to parse.
 * @returns {{time: string, text: string}[]} An array of transcript segments with their timestamp label and text.
 */
function parser(transcriptHtmlElement) {
    const result = [];

    const transcriptSegments = transcriptHtmlElement.querySelectorAll("div#segments-container ytd-transcript-segment-renderer");

    transcriptSegments.forEach(segment => {
        const time = segment.querySelector(".segment-timestamp").innerText.trim();
        const text = segment.querySelector("yt-formatted-string").innerText.trim();

        result.push({ time, text });
    });

    return result;
}

/**
 * @param {{time: string, text: string}[]} textObjects
 * @returns {string}
 */
function makeFormatedText(textObjects) {
    const title = document.title.replace(' - YouTube', '');
    const url = window.location.href;

    let result = title + "\n" + url + "\n\n";

    let lastTimestamp = 0;

    textObjects.forEach(item => {
        const times = item.time.split(':').map(x => +x);
        const timestamp = (times.at(-3) || 0) * 60 * 60 + (times.at(-2) || 0)  * 60 + times.at(-1); // hours / minutes / seconds

        if (timestamp > lastTimestamp + timestampIntervalSec) {
            lastTimestamp = timestamp;
            result += '\n\n' + '[' + item.time + '] ' + '\n';
        }

        result += item.text + ' ';
    })

    return result;
}

function saveTxtToFile(content, fileName) {
    const contentType = 'text/plain';
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    a.remove();
}

/**
 * @param {{time: string, text: string}[]} textObjects
 * @returns {string}
 */
function makeHtml(textObjects) {

    let html = `<!doctype html>
        <html><head>
        <title> ${document.title} </title>
        <style>
        
        body {
            margin: auto;
            max-width: 600px;
            font-family: "Segoe UI", roboto, verdana, sans-serif;
            background-color: hsl(0 0% 90%);
        }
        
        p {
            margin: 8px 0;
        }
        
        .time {
            color: #888;
            font-size: small;
        }
        
        .text {
            font-size: large;
        }
        
        </style>

        </head><body>`;

    html += `<h1> <a href="${window.location.href}" target="_blank"> ${document.title} </a> </h1>`;

    let lastTimestamp = 0;

    html += '<p class="text">';

    textObjects.forEach(item => {
        const times = item.time.split(':').map(x => +x);
        const timestamp = (times.at(-3) || 0) * 60 * 60 + (times.at(-2) || 0)  * 60 + times.at(-1); // hours / minutes / seconds

        if (timestamp > lastTimestamp + timestampIntervalSec) {
            lastTimestamp = timestamp;
            html += '</p><p class="time">[' + item.time + ']</p><p class="text">';
        }

        html += item.text + ' ';
    })

    html += `</p></body></html>`;

    return html;
}
