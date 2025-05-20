// IMPORTANT: Ensure type="module" is on your script tag in index.html
// <script src="assets/js/main.js" type="module"></script>

// --- Import Core Modules ---
import { config } from "./config.js";
import { state } from "./state.js";
import { dom, cacheDomElements } from "./domCache.js";
import { initializeGemini } from "./gemini.js";
import { setupAllEventListeners } from "./eventListeners.js";
import { switchLanguage } from "./translation.js";
import { navigateToPage, updateCopyrightYear } from "./navigation.js";
import { addChatWelcomeMessage, setGeminiInstances as setChatGeminiInstances } from "./chat.js";
import { autoGrowTextarea, showError } from "./utils.js";
// Import specific library functions needed for initialization and setup
import {
    populateMainGradeFilter,
    populateMainYearFilter,
    setupLibraryEventListeners,
    populateListViewYearFilter, // Corrected import name
    renderResourceList,
    resetLibrarySection // Needed if reset is triggered elsewhere
} from "./library.js";
import { renderUnitGrid, renderVideoList, setupVideosEventListeners } from "./videos.js";
import { setupScrollEventListeners } from "./scroll.js";
import { populateGradeGrid, setRenderingFunctions, reRenderDynamicContent } from "./commonRendering.js";

// Import Google AI SDK
import {
    HarmCategory,
    HarmBlockThreshold,
} from "@google/generative-ai";

// --- Initialization ---
async function initializeApp() {
    console.log("Initializing EduHelp App...");

    // 1. Cache DOM elements FIRST
    if (!cacheDomElements()) {
        console.error("Failed to cache critical DOM elements. Aborting initialization.");
        alert("Fatal Error: Failed to load UI elements. Please refresh the page.");
        return;
    }
    console.log("DOM elements cached.");

    // 2. Determine initial language
    let initialLang = config.defaultLang;
    try {
        const savedLang = localStorage.getItem(config.localStorageLangKey);
        if (savedLang && (savedLang === 'en' || savedLang === 'ta')) {
            initialLang = savedLang;
        }
    } catch (e) {
        console.warn("LocalStorage error reading language preference:", e);
    }
    state.currentLang = initialLang;

    // 3. Load initial translations (await this!)
    try {
        await switchLanguage(initialLang);
        console.log(`Initial language loaded: ${initialLang}`);
        // Once translations are loaded, make the content visible
        document.body.classList.remove('content-loading');
        document.body.classList.add('content-ready');
        console.log("Content revealed after language load.");
    } catch (error) {
        console.error("Failed initial language load:", error);
        showError('errorLangSwitch', 'Failed to load language.', true);
        // Do not remove content-loading or add content-ready if language load fails.
        // This will keep the loading state active, indicating an issue.
        return; // Abort if initial language fails
    }

    // 4. Initialize Gemini
    const geminiInstances = initializeGemini(config, HarmCategory, HarmBlockThreshold);
    if (geminiInstances) {
         setChatGeminiInstances(geminiInstances.genAI, geminiInstances.modelInstance, geminiInstances.isGeminiActive);
         console.log("Gemini instances set in chat module.");
    } else {
         console.warn("Gemini initialization failed or skipped.");
         setChatGeminiInstances(null, null, false);
    }

    // 5. Set dynamic rendering functions in commonRendering module
    setRenderingFunctions(
        { populateYearFilter: populateListViewYearFilter, renderResourceList }, // Library functions
        { renderUnitGrid, renderVideoList }       // Videos functions
    );
    console.log("Dynamic rendering functions linked.");

    // 6. Setup all event listeners
    setupAllEventListeners(); // This should internally call setupLibraryEventListeners, setupVideosEventListeners, etc.
    console.log("Event listeners set up.");

    // 7. Set initial page/view state correctly
    dom.pages.forEach(page => page.classList.toggle('active', page.id === state.currentPage));
    // Ensure correct view is active within library/videos if navigating directly (though usually starts at home)
     if (state.currentPage === 'library') {
         resetLibrarySection(); // Reset to initial state on load if starting here
     }
     // Add similar reset logic for videos if needed
    // Set initial home view active if starting on home
     if (dom.homePage && state.currentPage === 'home') {
         const homeView = dom.homePage.querySelector('.view') || dom.homePage; // Adjust if home doesn't use sub-views
         homeView.classList.add('active');
     }

    // 8. Populate initial UI content
    if (dom.libraryGradeGrid) populateGradeGrid(dom.libraryGradeGrid);
    if (dom.videoGradeGrid) populateGradeGrid(dom.videoGradeGrid);

    // Populate the NEW main library filters
    populateMainGradeFilter();
    populateMainYearFilter();

    // Initialize chat state and UI
    if (dom.chatInput) autoGrowTextarea(dom.chatInput);
    if (dom.chatMessages && dom.chatMessages.children.length === 0) {
        addChatWelcomeMessage();
    }

    // Update copyright year
    updateCopyrightYear();

    console.log("EduHelp App Initialized successfully.");

    // 9. Register Service Worker for caching
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);

                // Check for updates on registration
                registration.addEventListener('updatefound', () => {
                    console.log('New service worker update found.');
                });
            })
            .catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
    }
}

// --- Start the application after the DOM is fully loaded ---
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});
