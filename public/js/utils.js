// --- Utility Functions ---

import { dom } from "./domCache.js"; // Assuming dom is exported from domCache.js
import { state } from "./state.js"; // Assuming state is exported from state.js
import { config } from "./config.js"; // Assuming config is exported from config.js
// Note: getTranslation is used by showError, so import it
import { getTranslation } from "./translation.js"; // Assuming getTranslation is exported from translation.js

/**
 * Debounces a function call, delaying execution until after a specified period has passed without any more calls.
 * @param {Function} func The function to debounce.
 * @param {number} delay The number of milliseconds to delay.
 * @returns {Function} The debounced function.
 */
export function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

/**
 * Displays an error message in the UI.
 * @param {string} messageKey The translation key for the message.
 * @param {string} [details=""] Optional additional details or error message.
 * @param {boolean} [isFatal=false] If true, the error message will not auto-hide.
 */
export function showError(messageKey, details = "", isFatal = false) {
    // Ensure dom elements are available before trying to access its properties
    if (!dom || !dom.errorMessage || !dom.errorMessageText) {
        console.error("DOM elements for error message not available.", {messageKey, details, isFatal});
        // Fallback: log to console if UI elements are missing
        console.error(`Error: ${messageKey} - ${details || 'No details'}`);
        return;
    }

    let message = getTranslation(messageKey, messageKey) || 'An error occurred.'; // Use getTranslation

    if (details) {
        // Replace {maxSize} placeholder only if details are provided and message contains it
        if (message.includes('{maxSize}')) {
             message = message.replace('{maxSize}', config.maxFileSizeMB);
        }
        // Append details if they are not already part of the translated message or key
         if (!message.includes(details)) {
             message += ` (${details})`;
         }
        console.error(`Error: ${messageKey}, Details: ${details}`);
    } else {
        console.error(`Error: ${messageKey}`);
    }

    dom.errorMessageText.textContent = message;
    dom.errorMessage.classList.add('visible');

    // Specific handling for chat initialization error: disable input
    if (messageKey === 'errorChatInit' && dom.chatInput && dom.sendBtn) {
        dom.chatInput.disabled = true;
        dom.chatInput.placeholder = getTranslation('chatDisabled', "Chat unavailable"); // Use getTranslation
        dom.sendBtn.disabled = true;
    }

    // Auto-hide non-fatal errors
    if (!isFatal) {
        // Clear previous timeout if it exists
        if (dom.errorMessage.timeoutId) {
            clearTimeout(dom.errorMessage.timeoutId);
        }
        // Set a new timeout to hide the error message
        dom.errorMessage.timeoutId = setTimeout(hideError, 6000); // Auto-hide after 6 seconds
    }
}

/**
 * Hides the error message in the UI.
 */
export function hideError() {
    // Ensure dom elements are available
    if (!dom || !dom.errorMessage) return;

    // Clear the timeout if hideError is called manually before timeout fires
    if (dom.errorMessage.timeoutId) {
        clearTimeout(dom.errorMessage.timeoutId);
        dom.errorMessage.timeoutId = null;
    }
    dom.errorMessage.classList.remove('visible');
}

/**
 * Parses a simplified version of Markdown text into HTML.
 * Supports: bold (**text__ or __text__), inline code (`code`), block code (```lang\ncode\n``` or ```\ncode\n```), lists (* item, - item, 1. item), and paragraphs (double newline).
 * Uses a line-by-line approach for robustness.
 * @param {string} text The Markdown text to parse.
 * @returns {string} The parsed HTML string.
 */
export function parseSimpleMarkdown(text) {
    if (!text) return '';

    // 1. Escape HTML characters first
    let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const lines = html.split('\n');
    let processedLines = [];
    let inCodeBlock = false;
    let inList = false;
    let listType = ''; // 'ul' or 'ol'
    let paragraphBuffer = [];

    function processParagraphBuffer() {
        if (paragraphBuffer.length > 0) {
            const paragraphContent = paragraphBuffer.join('\n');
            // Process inline markdown within paragraph content before adding <p>
            let processedParagraph = paragraphContent.replace(/`([^`]+)`/g, '<code>$1</code>');
            processedParagraph = processedParagraph.replace(/\*\*(.*?)\*\*|__(.*?)__/g, '<strong>$1$2</strong>');
            processedLines.push(`<p>${processedParagraph}</p>`);
            paragraphBuffer = []; // Clear the buffer
        }
    }

    lines.forEach(line => {
        const trimmedLine = line.trim();

        // Check for code block markers (```)
        if (trimmedLine.startsWith('```')) {
            processParagraphBuffer(); // Process any buffered paragraph lines

            if (inList) { // Close list if entering code block
                processedLines.push(`</${listType}>`);
                inList = false;
                listType = '';
            }

            if (inCodeBlock) {
                // End of code block
                processedLines.push('</code></pre>');
                inCodeBlock = false;
            } else {
                // Start of code block. Extract language if present (not strictly needed for this parser, but good practice)
                const langMatch = trimmedLine.match(/^```(\w*)/);
                // const lang = langMatch ? langMatch[1] : ''; // Language could be used for highlighting CSS class
                processedLines.push('<pre><code>');
                inCodeBlock = true;
            }
            return; // Line containing only ``` is consumed
        }

        if (inCodeBlock) {
            // Inside a code block, just add the line content as is (with original spacing)
            processedLines.push(line);
            return; // Skip further processing for lines within code blocks
        }

        // Check for list items (*, -, or digit.)
        const listItemMatch = line.match(/^(\s*)([\*\-]|(?:\d+\.))\s+(.*)/); // Capture leading whitespace

        if (listItemMatch) {
            processParagraphBuffer(); // Process any buffered paragraph lines

            const leadingWhitespace = listItemMatch[1];
            const marker = listItemMatch[2];
            const itemContent = listItemMatch[3];
            const currentListType = marker.match(/^\d+\./) ? 'ol' : 'ul';

            if (!inList) {
                // Start of a new list
                listType = currentListType;
                processedLines.push(`<${listType}>`);
                inList = true;
            } else if (listType !== currentListType) {
                // Switched list type, close previous list and start a new one
                processedLines.push(`</${listType}>`);
                listType = currentListType;
                processedLines.push(`<${listType}>`);
            }

            // Process inline markdown within list item content
            let processedItemContent = itemContent.replace(/`([^`]+)`/g, '<code>$1</code>');
            processedItemContent = processedItemContent.replace(/\*\*(.*?)\*\*|__(.*?)__/g, '<strong>$1$2</strong>');

            // Add the list item content. Preserve original leading whitespace for nesting visual structure if needed.
            processedLines.push(`${leadingWhitespace}  <li>${processedItemContent}</li>`); // Add 2 spaces for typical list indent
        } else {
            // Not a list item, not in a code block
            if (inList) {
                // End of a list (current line is not a list item)
                processedLines.push(`</${listType}>`);
                inList = false;
                listType = '';
            }

            // Handle Paragraphs and newlines
            if (trimmedLine) {
                // If the line is not empty, add it to the paragraph buffer
                paragraphBuffer.push(line);
            } else {
                // If the line is empty, it signifies a paragraph break
                processParagraphBuffer(); // Process accumulated lines as a paragraph
                 // Also add an empty paragraph to preserve explicit blank lines for spacing
                processedLines.push('<p></p>');
            }
        }
    });

    // Process any remaining lines in the paragraph buffer at the end of the text
    processParagraphBuffer();

    // Close any open list at the very end of the text processing
    if (inList) {
        processedLines.push(`</${listType}>`);
    }


    // Join the processed lines back into a single HTML string
    // Filter out empty strings that might result from processing
    let finalHTML = processedLines.filter(line => line !== '').join('\n');

     // Clean up potential empty paragraphs created by joining or blank lines
     finalHTML = finalHTML.replace(/<p>\s*<\/p>/g, '');


    return finalHTML.trim();
}


/**
 * Resets the value of a file input element.
 * @param {HTMLInputElement} inputElement The file input element.\n
 */
export function resetFileInput(inputElement) {
    if (inputElement) {
        inputElement.value = '';
    }
}

/**
 * Automatically adjusts the height of a textarea to fit its content.
 * @param {HTMLTextAreaElement} textareaElement The textarea element.\n
 */
export function autoGrowTextarea(textareaElement) {
    if (!textareaElement) return;
    textareaElement.style.height = 'auto';
    textareaElement.style.height = textareaElement.scrollHeight + 'px';
}
