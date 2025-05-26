// --- Application State ---

// Import config as state relies on config.defaultLang for initialization
import { config } from "./config.js";

export const state = {
  currentLang: config.defaultLang, // Now config is defined
  translations: {},
  translationCache: {},
  currentPage: "home", // Default to home page
  // --- Google Drive Resources --- //
  driveResources: [], // Flat array of all resources from Google Drive
  organizedResources: {}, // Resources organized by grade and type
  libraryState: {
    // --- Standard navigation state --- //
    selectedGrade: null, // Grade selected via grid
    selectedResourceType: null, // Type selected via buttons
    selectedSubject: null, // Subject selected via grid
    selectedYearFilter: "all", // Year filter *within* list view
    currentSearch: "", // Search term *within* list view

    // --- Main search/filter state (from grade selection view) --- //
    mainSearchTerm: "",
    mainSelectedGradeFilter: "all",
    mainSelectedYearFilter: "all",
    mainSelectedTermFilter: "all",
    mainSelectedTypeFilter: "all",
    isMainSearchActive: false, // Flag to indicate if the main search initiated the list view

    // --- Current view tracking --- //
    activeViewId: "libraryGradeSelectionView",
  },
  videoState: {
    selectedGrade: null,
    selectedSubject: null,
    selectedVideoUnit: null,
    activeViewId: "videoGradeSelectionView",
  },
  chatState: {
    isBotTyping: false,
    messageHistory: [],
    attachedFile: null,
  },
  auth: {
    isUserLoggedIn: false,
    userProfile: null, // Will store { displayName, email, photoURL }
  },
};
