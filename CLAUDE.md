# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A browser extension (Chrome + Firefox, Manifest V3) called "Save YouTube Transcript as a formated text".
It injects UI into YouTube's watch page to load/export the transcript and adds a few playback-speed conveniences.
Published on the Chrome Web Store and addons.mozilla.org.

All extension source lives in [youtube-transcript-to-text-extension/](youtube-transcript-to-text-extension/):
- [manifest.json](youtube-transcript-to-text-extension/manifest.json) — MV3 manifest; single content script (`main.js`) matched against `*://*.youtube.com/*`, plus an options page.
- [main.js](youtube-transcript-to-text-extension/main.js) — the entire content script (single IIFE `runYoutubeTranscriptToTextExtension`, no modules/bundler).
- [options.html](youtube-transcript-to-text-extension/options.html) / [options.js](youtube-transcript-to-text-extension/options.js) — settings page (currently just transcript font size), persisted via `chrome.storage.local`.
- [changelog.txt](youtube-transcript-to-text-extension/changelog.txt) — dated, hand-written changelog; update this when shipping a version bump.

There is no build system, package manager, bundler, linter, or test suite — plain JS/HTML/CSS loaded directly by the browser.
There is nothing to install, build, or run via CLI.

## Development workflow

Load unpacked and reload manually in the browser — there's no CLI build/test loop:

1. Chrome: `chrome://extensions` → enable Developer mode → "Load unpacked" → select `youtube-transcript-to-text-extension/`.
2. Firefox: `about:debugging#/runtime/this-firefox` → "Load Temporary Add-on" → select `youtube-transcript-to-text-extension/manifest.json`.
3. After editing `main.js`/`options.js`, click the reload icon for the extension in the browser's extensions page, then reload the YouTube tab to re-inject the content script.
4. Verify manually on a real `youtube.com/watch?v=...` page — there is no automated test coverage.

When bumping the version, update `version` in [manifest.json](youtube-transcript-to-text-extension/manifest.json) and add a dated entry 
to [changelog.txt](youtube-transcript-to-text-extension/changelog.txt) (format: `YYYY-MM-DD vX.Y.Z` followed by indented bullet lines).

## Architecture notes (main.js)

Everything runs inside one closure injected at `document_end`. Key pieces, since the control flow isn't obvious from any single function:

- **Button injection is polling-based, not event-driven.** `setInterval(addButtons, 1000)` re-checks every second for `ytd-watch-metadata #title` and inserts the button row before it if not already present — needed because YouTube is a SPA and swaps DOM content without full page loads.
- **Two transcript parsers exist for two different YouTube DOM variants**: `transcriptParser()` handles the older `ytd-transcript-segment-renderer` structure; if that yields nothing it falls back to `modernTranscriptParser()` (`transcript-segment-view-model`). Both must be kept in sync when YouTube changes its transcript panel markup.
- **Transcript pipeline**: `getTranscript()` → parse raw segments → `zipTranscript()` merges consecutive segments into ~15s chunks → `chaptersParser()` reads chapter markers separately → `joinData()` interleaves chapters and transcript chunks by timestamp into one ordered array (`{isChapter, time, timeSecond, text, link}`), which both `makeFormatedText()` (Markdown export) and `makeHtml()` (new-tab view, via `openHtmlWithBlob`) consume.
- **Speed control persists per-video in `localStorage`** (key `youtube-transcript-to-text-extension-video-speed-data`, capped at 50 entries), separate from the font-size setting which lives in `chrome.storage.local` and is settable via the options page. `autoResetSpeed()` runs on a 200ms self-rescheduling loop to fight YouTube resetting `video.playbackRate` on navigation/ad events; it only affects the first `<video>` element on the page (documented limitation for picture-in-picture).
- **All DOM queries are YouTube-selector-dependent** (`ytd-*` custom elements, YouTube's internal class/attribute names). Any breakage after a YouTube frontend change should be diagnosed by re-inspecting the live DOM for the relevant selector, not by assuming the extension's logic is wrong.
- `escapeHtml()` is used when building the new-tab HTML view (`makeHtml`) since it injects transcript/title text into `innerHTML`-equivalent string concatenation — preserve this when touching that path to avoid XSS via video titles/transcript text.
