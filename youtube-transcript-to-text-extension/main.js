runYoutubeTranscriptToTextExtension()

function runYoutubeTranscriptToTextExtension() {
    const idPrefix = 'youtube-transcript-to-text-extension-';

    const downloadHtmlElementId = idPrefix + 'download';
    const newTabHtmlElementId = idPrefix + 'new-tab';
    const reloadButtonId = idPrefix + 'reload';
    const doubleSpeedButtonId = idPrefix + 'double-speed';
    const singleSpeedButtonId = idPrefix + 'single-speed';
    const speed15ButtonId = idPrefix + '1-5-speed';


    const buttonsElementId = 'youtube-transcript-to-text-chrome-extension-buttons';

    const buttonsHtml = `
          <div style="display: flex; align-items: center; gap: 8px; margin: 4px;">
          	<div id="${reloadButtonId}" 
			style="cursor: pointer; width: 24px; height: 24px; display: block; fill: currentcolor;">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z"/></svg>
			</div>
			
			<div id="${newTabHtmlElementId}" 
			style="cursor: pointer; width: 24px; height: 24px; display: block; fill: currentcolor;">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h240v80H200v560h560v-240h80v240q0 33-23.5 56.5T760-120H200Zm440-400v-120H520v-80h120v-120h80v120h120v80H720v120h-80Z"/></svg>
			</div>
    
    		<div id="${downloadHtmlElementId}" 
    		style="cursor: pointer; width: 24px; height: 24px; display: block; fill: currentcolor;">
               <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/></svg>
			</div>
			
			<div id="${singleSpeedButtonId}" 
    		style="cursor: pointer; width: 24px; height: 24px; display: block; fill: currentcolor;">
               <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M240-280v-320h-80v-80h160v400h-80Zm174 0 126-212-114-188h94l66 110 68-110h92L634-492l126 212h-94l-80-134-80 134h-92Z"/></svg>
			</div>
			
            <div id="${speed15ButtonId}" 
    		style="cursor: pointer; width: 24px; height: 24px; display: block; fill: currentcolor;">
               <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M240-280v-80h80v80h-80Zm-120 0v-320H40v-80h160v400h-80Zm500 0 120-200-120-200h80l80 133 80-133h80L820-480l120 200h-80l-80-133-80 133h-80Zm-260 0v-80h140v-80H360v-240h220v80H440v80h60q33 0 56.5 23.5T580-440v80q0 33-23.5 56.5T500-280H360Z"/></svg>
			</div>
			
			<div id="${doubleSpeedButtonId}" 
    		style="cursor: pointer; width: 24px; height: 24px; display: block; fill: currentcolor;">
               <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M200-280v-160q0-33 23.5-56.5T280-520h80v-80H200v-80h160q33 0 56.5 23.5T440-600v80q0 33-23.5 56.5T360-440h-80v80h160v80H200Zm280 0 120-200-120-200h80l80 133 80-133h80L680-480l120 200h-80l-80-133-80 133h-80Z"/></svg>
			</div>
          </div>
`;

    new MutationObserver(function (mutationsList, observer) {
        for (const mutation of mutationsList) {
            if (mutation.target.getAttribute("target-id") !== "engagement-panel-searchable-transcript") {
                continue;
            }

            addButtons();

            observer.disconnect();
        }
    }).observe(document.body, {childList: true, subtree: true});

    function addButtons() {
        const oldButtonsElement = document.getElementById(buttonsElementId);
        if (oldButtonsElement) {
            oldButtonsElement.remove();
        }

        const buttonsElement = document.createElement("div");
        buttonsElement.id = buttonsElementId;

        const buttonsContainer = document.getElementById('panels');

        buttonsContainer.prepend(buttonsElement);
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


        document.getElementById(singleSpeedButtonId).addEventListener("click", () => {
            setSpeed(1)
        });

        document.getElementById(speed15ButtonId).addEventListener("click", () => {
            setSpeed(1.5)
        });

        document.getElementById(doubleSpeedButtonId).addEventListener("click", () => {
            setSpeed(2)
        });
    }

    function setSpeed(value) {
        const video = document.querySelector('video');

        if (video) {
            video.playbackRate = value;
            console.log('set video speed: ', value);
        } else {
            console.error('doubleSpeed: video element does not exist');
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
    }

// @returns {{isChapter: boolean, chapterId?: number, time: string, timeSecond: number, text: string, link: string}[]}
    function getTranscript() {
        const transcriptObjects = transcriptParser();

        const chaptersObjs = chaptersParser();

        return joinData(zipTranscript(transcriptObjects), chaptersObjs);
    }

    /**
     * @returns {{time: string, text: string}[]} An array of transcript segments with their timestamp label and text.
     */
    function transcriptParser() {
        const result = [];

        const transcriptContainer = document.querySelector('ytd-engagement-panel-section-list-renderer[target-id=engagement-panel-searchable-transcript]');

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
            const text = chapter.querySelector("div#details h4")?.innerText.trim();
            const time = chapter.querySelector("div#details div#time")?.innerText.trim();

            result.push({link, text, time});
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
     * @param {{isChapter: boolean, chapterId?: number, time: string, timeSecond: number, text: string, link: string}[]} data
     * @returns {string}
     */
    function makeHtml(data) {
        const baseUrl = getBaseUrl();

        let html = `<!doctype html>
        <html><head> <meta charset="UTF-8">
        
        <meta name="viewport" content="width=device-width">
          
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

        </head><body class="youtube-transcript-to-text-extension">`;

        html += `<h1> <a href="${baseUrl}" target="_blank"> ${document.title} </a> </h1>`;

        const hostname = window.location.hostname;

        // page navigation

        const chapters = data.filter(item => item.isChapter);

        const chapterIdPrefix = 'chapter-';

        if (chapters.length > 0) {
            html += `<ol class="page-navigation">`;
            chapters.forEach((chapter) => {
                html += `<li> <a href="#${chapterIdPrefix + chapter.chapterId}"> ${chapter.time + ': ' + chapter.text}</a> </li>`
            })

            html += `</ol>`;
        }

        // main part
        data.forEach((item, index) => {
            if (item.isChapter) {
                html += `<h2 id="${chapterIdPrefix + item.chapterId}"> <a href="https://${hostname + item.link}" target="_blank"> ${item.text} </a></h2>`;
            } else {
                html += `<p class="time"> <a href="${baseUrl + '&t=' + item.timeSecond}s" target="_blank"> [${item.time || 0}] </a></p>`;
                html += `<p class="text">${item.text}</p>`;
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
}

