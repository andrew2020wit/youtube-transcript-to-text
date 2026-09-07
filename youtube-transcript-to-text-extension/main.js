runYoutubeTranscriptToTextExtension()

function runYoutubeTranscriptToTextExtension() {
    let youtubePlayerSpeed = 1;
    let lastChannelName = null;

    const idPrefix = 'youtube-transcript-to-text-extension-';

    const downloadHtmlElementId = idPrefix + 'download';
    const newTabHtmlElementId = idPrefix + 'new-tab';
    const reloadButtonId = idPrefix + 'reload';
    const doubleSpeedButtonId = idPrefix + 'double-speed';
    const singleSpeedButtonId = idPrefix + 'single-speed';
    const speed15ButtonId = idPrefix + '1-5-speed';
    const copyUrlButtonId = idPrefix + 'copy-url';
    const defaultTranscriptFontSize = '16px';

    const buttonsElementId = 'youtube-transcript-to-text-chrome-extension-buttons';
    const channelSpeedLSKey = idPrefix + 'channel-speed-data';
    const activeButtonClass = idPrefix + 'active-button';
    const speeds = [1, 1.5, 2];

    const buttonsHtml = `
          <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin: 4px;">
          	<div id="${reloadButtonId}"  title="load transcript"
			style="cursor: pointer; width: 24px; height: 24px; display: block; fill: currentcolor;">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z"/></svg>
			</div>
			
			<div id="${newTabHtmlElementId}" title="open loaded transcript in new tab"
			style="cursor: pointer; width: 24px; height: 24px; display: block; fill: currentcolor;">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h240v80H200v560h560v-240h80v240q0 33-23.5 56.5T760-120H200Zm440-400v-120H520v-80h120v-120h80v120h120v80H720v120h-80Z"/></svg>
			</div>
    
    		<div id="${downloadHtmlElementId}" title="download loaded transcript"
    		style="cursor: pointer; width: 24px; height: 24px; display: block; fill: currentcolor;">
               <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/></svg>
			</div>
			
            <div id="${copyUrlButtonId}" title="copy to clipboard cleared current video url"
    		style="cursor: pointer; width: 24px; height: 24px; display: block; fill: currentcolor;">
               <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"/></svg>
			</div>
			
			<div id="${singleSpeedButtonId}" title="set playback speed to 1"
    		style="cursor: pointer; width: 24px; height: 24px; display: block; fill: currentcolor;">
               <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M240-280v-320h-80v-80h160v400h-80Zm174 0 126-212-114-188h94l66 110 68-110h92L634-492l126 212h-94l-80-134-80 134h-92Z"/></svg>
			</div>
			
            <div id="${speed15ButtonId}" title="set playback speed to 1.5"
    		style="cursor: pointer; width: 24px; height: 24px; display: block; fill: currentcolor;">
               <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M240-280v-80h80v80h-80Zm-120 0v-320H40v-80h160v400h-80Zm500 0 120-200-120-200h80l80 133 80-133h80L820-480l120 200h-80l-80-133-80 133h-80Zm-260 0v-80h140v-80H360v-240h220v80H440v80h60q33 0 56.5 23.5T580-440v80q0 33-23.5 56.5T500-280H360Z"/></svg>
			</div>
			
			<div id="${doubleSpeedButtonId}" title="set playback speed to 2"
    		style="cursor: pointer; width: 24px; height: 24px; display: block; fill: currentcolor;">
               <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M200-280v-160q0-33 23.5-56.5T280-520h80v-80H200v-80h160q33 0 56.5 23.5T440-600v80q0 33-23.5 56.5T360-440h-80v80h160v80H200Zm280 0 120-200-120-200h80l80 133 80-133h80L680-480l120 200h-80l-80-133-80 133h-80Z"/></svg>
			</div>
          </div>
`;

    setInterval(addButtons, 1000);

    function addButtons() {
        const oldButtonsElement = document.getElementById(buttonsElementId);

        if (oldButtonsElement) {
            return;
        }

        const titleElement = document.querySelector('ytd-watch-metadata #title');

        if (!titleElement) {
            return;
        }

        const buttonsElement = document.createElement("div");
        buttonsElement.id = buttonsElementId;


        titleElement.before(buttonsElement);

        buttonsElement.insertAdjacentHTML("beforeend", buttonsHtml);

        document.getElementById(reloadButtonId).addEventListener("click", () => {
            clickToLoadTranscript();
        });

        document.getElementById(downloadHtmlElementId).addEventListener("click", () => {
            clickToDownload();
        });

        document.getElementById(newTabHtmlElementId).addEventListener("click", () => {
            clickToNewTab();
        });

        document.getElementById(copyUrlButtonId).addEventListener("click", () => {
            copyUrl();
        });

        speeds.forEach(speed => {
            const speedButton = getSpeedButtonElement(speed);

            speedButton.addEventListener("click", () => {
                setSpeed(speed);
            });
        });

        restoreActiveSpeedButtonClass();
    }

    function copyUrl() {
        const url = new URL(window.location.href);

        // keep only the "v" query param
        const videoId = url.searchParams.get('v');

        url.search = '';

        if (videoId) {
            url.searchParams.set('v', videoId);
        }

        const cleanedUrl = url.toString();

        navigator.clipboard.writeText(cleanedUrl);

        console.log(cleanedUrl);
    }

    /**
     * @param {number} value
     */
    function setSpeedForVideoElement(value) {
        const video = document.querySelector('video');

        if (video) {
            video.playbackRate = value;
        } else {
            console.error('setSpeedForVideoElement: video element does not exist');
        }
    }

    function clickToNewTab() {
        const html = makeHtml(getTranscript());

        openHtmlWithBlob(html);
    }

    function clickToDownload() {
        const text = makeFormatedText(getTranscript());

        const fileName = document.title + '.md';

        saveTxtToFile(text, fileName);
    }

    function clickToLoadTranscript() {
        const button = document.querySelector('#button-container.ytd-video-description-transcript-section-renderer button');
        if (!button) {
            console.error('TranscriptToText Extension: clickToLoadTranscript: button not found.');
            return;
        }

        button.click();

        setTimeout(()=> openChapters(), 2000);
    }

// @returns {{isChapter: boolean, chapterId?: number, time: string, timeSecond: number, text: string, link: string}[]}
    function getTranscript() {
        const transcriptObjects = transcriptParser();

        if (!transcriptObjects?.length) {
            alert('Transcript not found. Maybe you should load the transcript first.');
        }

        const chaptersObjs = chaptersParser();

        return joinData(zipTranscript(transcriptObjects), chaptersObjs);
    }

    /**
     * @returns {{time: string, text: string}[]} An array of transcript segments with their timestamp label and text.
     */
    function transcriptParser() {
        const result = [];

        const transcriptContainer = document.querySelector('ytd-engagement-panel-section-list-renderer[target-id=engagement-panel-searchable-transcript]');

        if (!transcriptContainer) {
            return modernTranscriptParser();
        }

        const transcriptSegments = transcriptContainer.querySelectorAll("div#segments-container ytd-transcript-segment-renderer");

        transcriptSegments.forEach(segment => {
            const time = segment.querySelector(".segment-timestamp").innerText.trim();
            const text = segment.querySelector("yt-formatted-string").innerText.trim();

            result.push({time, text});
        });

        if (result.length > 0) {
            return result;
        }

        return modernTranscriptParser();
    }

    /**
     * @returns {{time: string, text: string}[]} An array of transcript segments with their timestamp label and text.
     */
    function modernTranscriptParser() {
        const result = [];

        const transcriptContainer = document.querySelector('ytd-engagement-panel-section-list-renderer[visibility=ENGAGEMENT_PANEL_VISIBILITY_EXPANDED]');

        if (!transcriptContainer) {
            return [];
        }

        const transcriptSegments = transcriptContainer.querySelectorAll("transcript-segment-view-model");

        transcriptSegments.forEach(segment => {
            const time = segment.querySelector(".ytwTranscriptSegmentViewModelTimestamp").innerText.trim();
            const text = segment.querySelector("[role=text]").innerText.trim();

            result.push({time, text});
        });

        return result;
    }


    /**
     * Parses the YouTube transcript panel DOM and returns an array of transcript entries.
     *
     * @param {{time: string, text: string}[]} transcript
     * @param {number} timestampIntervalSec
     * @returns {{time: string, text: string}[]}
     */
    function zipTranscript(transcript, timestampIntervalSec = 15) {
        const result = [];

        let lastTimestamp = 0;
        let lastTime = '';
        let textChunk = ''

        transcript.forEach(item => {
            const timestamp = timeStringToSecondNumber(item.time);
            textChunk += item.text + ' ';

            if (!lastTime) {
                lastTime = item.time;
            }

            if (timestamp > lastTimestamp + timestampIntervalSec) {
                result.push({
                    time: lastTime,
                    text: textChunk
                });

                lastTimestamp = timestamp;
                lastTime = '';
                textChunk = '';
            }
        })

        if (textChunk) {
            result.push({
                time: lastTime,
                text: textChunk
            });
        }

        return result;
    }

    /**
     * @returns {{time: string, text: string, link: string}[]}
     */
    function chaptersParser() {
        const result = [];

        const container = document.querySelector('ytd-macro-markers-list-renderer[panel-target-id=engagement-panel-macro-markers-description-chapters]');

        if (!container) {
            return [];
        }

        const chapters = container.querySelectorAll('ytd-macro-markers-list-item-renderer');

        chapters.forEach(chapter => {
            const link = chapter.querySelector("a#endpoint")?.getAttribute("href")?.trim();
            const text = chapter.querySelector("div#details [title]:not([hidden])")?.innerText.trim();
            const time = chapter.querySelector("div#details div#time")?.innerText.trim();

            result.push({link, text: text || time, time});
        });

        return result;
    }

    /**
     * @param {{isChapter: boolean, chapterId?: number, time: string, timeSecond: number, text: string, link: string}[]} data
     * @returns {string}
     */
    function makeFormatedText(data) {
        const title = document.title.replace(' - YouTube', '');
        const baseUrl = getBaseUrl();

        let result = '# ' + title + '\n\n';

        result += '[' + baseUrl + '](' + baseUrl + ")\n\n";

        data.forEach(item => {
            let text = '';

            if (item.isChapter) {
                text = '## ' + item.text + '\n\n';
            } else {
                text = `[${item.time}](${baseUrl + '&t=' + item.timeSecond}s)` + '\n\n'
                    + item.text + '\n\n';
            }

            result += text;
        })

        return result;
    }

    function saveTxtToFile(content, fileName) {
        const contentType = 'text/plain';
        const a = document.createElement('a');
        const file = new Blob([content], {type: contentType});
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
        a.remove();
    }

    /**
     * @param {string} value
     * @returns {string}
     */
    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, (char) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
        }[char]));
    }

    /**
     * @param {{isChapter: boolean, chapterId?: number, time: string, timeSecond: number, text: string, link: string}[]} data
     * @returns {string}
     */
    function makeHtml(data) {
        const baseUrl = getBaseUrl();
        const title = escapeHtml(document.title);

        let html = `<!doctype html>
        <html><head> <meta charset="UTF-8">

        <meta name="viewport" content="width=device-width">

        <title> ${title} </title>
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

        </head><body class="youtube-transcript-to-text-extension">`;

        html += `<h1> <a href="${baseUrl}" target="_blank"> ${title} </a> </h1>`;

        const hostname = window.location.hostname;

        // page navigation

        const chapters = data.filter(item => item.isChapter);

        const chapterIdPrefix = 'chapter-';

        if (chapters.length > 0) {
            html += `<ol class="page-navigation">`;
            chapters.forEach((chapter) => {
                html += `<li> <a href="#${chapterIdPrefix + chapter.chapterId}"> ${escapeHtml(chapter.time + ': ' + chapter.text)}</a> </li>`
            })

            html += `</ol>`;
        }

        // main part
        data.forEach((item, index) => {
            if (item.isChapter) {
                html += `<h2 id="${chapterIdPrefix + item.chapterId}"> <a href="https://${hostname + escapeHtml(item.link)}" target="_blank"> ${escapeHtml(item.text)} </a></h2>`;
            } else {
                html += `<p class="time"> <a href="${baseUrl + '&t=' + item.timeSecond}s" target="_blank"> [${escapeHtml(item.time || 0)}] </a></p>`;
                html += `<p class="text">${escapeHtml(item.text)}</p>`;
            }
        })

        html += `</body></html>`;

        return html;
    }

    function openHtmlWithBlob(html) {
        const blob = new Blob([html], {type: 'text/html'});
        const url = URL.createObjectURL(blob);
        const win = window.open(url, '_blank');

        if (!win) {
            console.warn('Popup blocked');
            URL.revokeObjectURL(url);
            return;
        }

        win.addEventListener('load', () => {
            URL.revokeObjectURL(url);
        }, {once: true});
    }

    /**
     * @param {{time: string, text: string}[]} transcripts
     * @param {{time: string, text: string, link: string}[]} chapters
     * @returns {{isChapter: boolean, chapterId?: number, time: string, timeSecond: number, text: string, link: string}[]}
     */
    function joinData(transcripts, chapters) {
        const result = [];

        const transcriptsTemp = [...transcripts];
        const chaptersTemp = [...chapters];

        let currentTranscriptTime = 0;
        let currentChapterTime = 0;
        let chapterId = 1;

        while (transcriptsTemp.length) {
            currentTranscriptTime = timeStringToSecondNumber(transcriptsTemp[0].time);
            currentChapterTime = timeStringToSecondNumber(chaptersTemp[0]?.time);

            if (chaptersTemp[0] && currentChapterTime <= currentTranscriptTime) {
                result.push({
                    isChapter: true,
                    chapterId,
                    time: chaptersTemp[0].time,
                    timeSecond: timeStringToSecondNumber(chaptersTemp[0].time),
                    text: chaptersTemp[0].text,
                    link: chaptersTemp[0].link,
                });
                chapterId++;
                chaptersTemp.shift();
            }

            result.push({
                isChapter: false,
                time: transcriptsTemp[0].time,
                timeSecond: timeStringToSecondNumber(transcriptsTemp[0].time),
                text: transcriptsTemp[0].text,
                link: '',
            });

            transcriptsTemp.shift();
        }

        return result;
    }

    /**
     * @param {string} time
     * @returns {number}
     */
    function timeStringToSecondNumber(time) {
        if (!time) {
            return 0;
        }

        const times = time.split(':').map(x => +x);

        return (times.at(-3) || 0) * 60 * 60 + (times.at(-2) || 0) * 60 + times.at(-1); // hours / minutes / seconds
    }

    function addStyles() {
        const transcriptFontSizeLSKey = 'transcriptFontSizeYtExt';
        const style = document.createElement('style');

        const setFontSizeStyle = (fontSize) => {
            const transcriptFontSize = fontSize || defaultTranscriptFontSize;
            style.textContent = `
            ytd-transcript-segment-renderer yt-formatted-string {
                font-size: ${transcriptFontSize} !important;
                line-height: 1.2;
            }
            
            .${activeButtonClass} {
                background-color: hsla(100 16 45 / 0.47);
            }
            `;
        };

        setFontSizeStyle('20px');
        document.head.appendChild(style);

        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.get([transcriptFontSizeLSKey], (result) => {
                if (result && result[transcriptFontSizeLSKey]) {
                    setFontSizeStyle(result[transcriptFontSizeLSKey]);
                }
            });

            if (chrome.storage.onChanged) {
                chrome.storage.onChanged.addListener((changes, areaName) => {
                    if (areaName === 'local' && changes[transcriptFontSizeLSKey]) {
                        setFontSizeStyle(changes[transcriptFontSizeLSKey].newValue);
                    }
                });
            }
        }
    }

    /**
     * @returns {string}
     */
    function getBaseUrl() {
        let baseUrl = document.location.href;

        const indexOfTime = baseUrl.indexOf('&t=');

        if (indexOfTime !== -1) {
            baseUrl = baseUrl.substring(0, indexOfTime);
        }

        return baseUrl;
    }

    function openChapters() {
        const transcriptContainer = document.querySelector('ytd-engagement-panel-section-list-renderer[target-id=engagement-panel-searchable-transcript]');

        if (!transcriptContainer) {
            return;
        }

        const chaptersButton = transcriptContainer.querySelector('#header #subheader button');

        if (!chaptersButton) {
            return;
        }

        chaptersButton.click();
    }

    /**
     * @returns {string|undefined}
     */
    function getCurrentChannelName() {
        const channelNameElement = document.querySelector('ytd-watch-metadata ytd-channel-name a');

        return channelNameElement?.textContent.trim() || undefined;
    }

    /**
     * @returns {{channelName: string, speed: number}[]}
     */
    function getSpeedLSDate() {
        const dataLS = localStorage.getItem(channelSpeedLSKey);

        if (!dataLS) {
            return [];
        }

        let data;

        try {
            data = JSON.parse(dataLS);
        } catch (e) {
            return [];
        }

        if (!Array.isArray(data)) {
            return [];
        }

        return data.filter(item => !!item?.channelName && !!item?.speed)
    }

    /**
     * @param {number} speed
     */
    function saveSpeedForCurrentChannel(speed) {
        const currentChannelName = getCurrentChannelName();

        if (!currentChannelName || !speed) {
            return;
        }

        const currentSpeedData = getSpeedLSDate();

        const maxDataLength = 50;

        const speedData = currentSpeedData.filter(item => item.channelName !== currentChannelName).slice(0, maxDataLength - 1);

        const newSpeedData = [ { channelName: currentChannelName, speed }, ...speedData];

        localStorage.setItem(channelSpeedLSKey, JSON.stringify(newSpeedData));
    }

    /**
     * @returns {void}
     */
    function restoreSpeedForCurrentChannel() {
        const currentChannelName = getCurrentChannelName();

        if (!currentChannelName) {
            return;
        }

        const currentSpeedData = getSpeedLSDate();

        const speedData = currentSpeedData.find(item => item.channelName === currentChannelName);

        youtubePlayerSpeed = speedData?.speed || 1;
        setActiveSpeedButtonClass(youtubePlayerSpeed);
    }

    /**
     * @param {number} value
     */
    function setSpeed(value) {
        youtubePlayerSpeed = value;
        setActiveSpeedButtonClass(value);
        saveSpeedForCurrentChannel(value);
    }

    /**
     * @returns {void}
     */
    function autoResetSpeed() {
        const currentChannelName = getCurrentChannelName();

        if (currentChannelName !== lastChannelName) {
            lastChannelName = currentChannelName;
            restoreSpeedForCurrentChannel();
        }

        setSpeedForVideoElement(youtubePlayerSpeed);

        setTimeout(() => {
            autoResetSpeed();
        }, 200)
    }

    /**
     * @param {number} speed
     * @returns {HTMLElement|null}
     */
    function getSpeedButtonElement(speed) {
        switch (speed) {
            case 1:
                return document.getElementById(singleSpeedButtonId);
            case 1.5:
                return document.getElementById(speed15ButtonId);
            case 2:
                return document.getElementById(doubleSpeedButtonId);
            default:
                console.error("getSpeedButtonElement: Invalid speed value");
                return null;
        }
    }

    /**
     * @returns {(HTMLElement)[]}
     */
    function getAllSpeedButtonElements() {
        return speeds.map(speed => getSpeedButtonElement(speed)).filter(btn => btn);
    }

    /**
     * @param {number} speed
     */
    function setActiveSpeedButtonClass(speed) {
        getAllSpeedButtonElements().forEach(btn => btn?.classList.remove(activeButtonClass));

        getSpeedButtonElement(speed)?.classList.add(activeButtonClass);
    }

    /**
     * @returns {void}
     */
    function restoreActiveSpeedButtonClass() {
        setActiveSpeedButtonClass(youtubePlayerSpeed);
    }

    addStyles();
    lastChannelName = getCurrentChannelName();
    restoreSpeedForCurrentChannel();
    autoResetSpeed();
}

