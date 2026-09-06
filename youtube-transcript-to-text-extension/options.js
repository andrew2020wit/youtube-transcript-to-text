const fontSizeInput = document.getElementById('transcript-font-size');
const saveButton = document.getElementById('save-button');
const statusElement = document.getElementById('status');

const transcriptFontSizeLSKey = 'transcriptFontSizeYtExt';

function restoreOptions() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get([transcriptFontSizeLSKey], (result) => {
            if (result && result[transcriptFontSizeLSKey]) {
                fontSizeInput.value = result[transcriptFontSizeLSKey];
            }
        });
    }
}

function saveOptions() {
    const value = fontSizeInput.value.trim();

    if (!value) {
        return;
    }

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ [transcriptFontSizeLSKey]: value }, () => {
            if (statusElement) {
                statusElement.textContent = 'Options saved.';
                setTimeout(() => {
                    statusElement.textContent = '';
                }, 1500);
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', restoreOptions);
saveButton.addEventListener('click', saveOptions);
