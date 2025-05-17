// --- Event Listener Setup ---

import { dom } from "./domCache.js"; // Assuming dom is exported from domCache.js
import { navigateToPage } from "./navigation.js"; // Assuming navigateToPage is exported
import { switchLanguage } from "./translation.js"; // Assuming switchLanguage is exported
import { setupLibraryEventListeners } from "./library.js"; // Assuming setupLibraryEventListeners is exported
import { setupVideosEventListeners } from "./videos.js"; // Assuming setupVideosEventListeners is exported
import { setupChatEventListeners } from "./chat.js"; // Assuming setupChatEventListeners is exported
import { setupScrollEventListeners } from "./scroll.js"; // Assuming setupScrollEventListeners is exported
import { hideError } from "./utils.js"; // Assuming hideError is exported from utils.js

export function setupAllEventListeners() {
    console.log("Setting up event listeners...");

    // Navigation Buttons
    if (dom.navButtons) {
        dom.navButtons.forEach(btn => {
            btn.addEventListener('click', () => navigateToPage(btn.dataset.page));
        });
    } else { console.warn("Nav buttons not found for event listener setup."); }

    // Footer Links (assuming these also navigate pages)
    if (dom.footerLinks) {
        dom.footerLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent default link behavior
                navigateToPage(link.dataset.footerLink);
            });
        });
    }

    // Language Switcher Buttons
    if (dom.langButtons) {
        dom.langButtons.forEach(btn => {
            btn.addEventListener('click', () => switchLanguage(btn.dataset.lang));
        });
    } else { console.warn("Language buttons not found for event listener setup."); }

    // Brand Logo Click (Navigate to Home)
    if (dom.brandLogo) {
        dom.brandLogo.addEventListener('click', () => navigateToPage('home'));
        // Add keyboard accessibility for the logo
        dom.brandLogo.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { // Listen for Enter or Space key
                e.preventDefault(); // Prevent default scroll behavior for space
                navigateToPage('home');
            }
        });
    } else { console.warn("Brand logo element not found for event listener setup."); }

    // Error Message Close Button
    if (dom.closeErrorBtn) {
        dom.closeErrorBtn.addEventListener('click', hideError);
    } else { console.warn("Close error button not found for event listener setup."); }

    // Setup section-specific event listeners
    setupLibraryEventListeners();
    setupVideosEventListeners();
    setupChatEventListeners();
    setupScrollEventListeners();

    console.log("Event listeners setup complete.");
}
