import { showAuthMessage } from "./auth.js";
let dom = {}; // DOM Cache

// Function to display errors (you might have this elsewhere)
function showError(key, fallback, isCritical = false) {
  console.error(`Error: ${key} - ${fallback}`);
  // Add logic here to display the error in the UI if needed
  // For critical errors, maybe disable parts of the app
  if (dom.errorMessage && dom.errorMessageText) {
    // Check if translations are available, otherwise use fallback
    const message =
      window.state?.translations && window.state.translations[key]
        ? window.state.translations[key]
        : fallback;
    dom.errorMessageText.textContent = message;
    dom.errorMessage.style.display = "block";
  } else {
    showAuthMessage(`Critical Error: ${fallback}`, "error"); // Use in-app error message
  }
}

export function cacheDomElements() {
  console.log("Caching DOM elements...");
  dom = {
    html: document.documentElement,
    body: document.body,
    header: document.querySelector(".header"),
    pages: document.querySelectorAll(".page"),
    globalLoader: document.getElementById('global-loader'), // Added global loader
    // Updated to select all elements intended for page navigation via data-page attribute
    navButtons: document.querySelectorAll("[data-page]"),
    langButtons: document.querySelectorAll(".lang-btn"),
    errorMessage: document.getElementById("errorMessage"),
    errorMessageText: document.getElementById("errorMessageText"),
    closeErrorBtn: document.getElementById("closeErrorBtn"),
    copyright: document.querySelector(".copyright"),
    footerLinks: document.querySelectorAll(
      ".footer-section a[data-footer-link]"
    ),
    brandLogo: document.getElementById("brandLogo"),

    // Home Page
    homePage: document.getElementById("home"),
    dashboardGrid: document.querySelector("#home .features-grid"),
    // Explicitly caching landing page CTA buttons for clarity, though [data-page] will also get them
    heroNavLinks: document.querySelectorAll(".hero-cta-buttons .nav-link"),
    getStartedNavLinks: document.querySelectorAll(
      ".get-started-section .nav-link"
    ),

    // Library Page - General
    libraryPage: document.getElementById("library"),
    libraryGradeSelectionView: document.getElementById(
      "libraryGradeSelectionView"
    ),
    libraryResourceTypeView: document.getElementById("libraryResourceTypeView"),
    librarySubjectSelectionView: document.getElementById(
      "librarySubjectSelectionView"
    ),
    libraryListView: document.getElementById("libraryListView"),

    // Library Page - Main Search/Filters (Grade Selection View)
    libraryMainControls: document.querySelector(
      "#libraryGradeSelectionView .library-main-controls"
    ),
    mainLibrarySearchInput: document.getElementById("mainLibrarySearchInput"),
    mainLibraryGradeFilter: document.getElementById("mainLibraryGradeFilter"),
    mainLibraryYearFilter: document.getElementById("mainLibraryYearFilter"),
    mainLibraryTermFilter: document.getElementById("mainLibraryTermFilter"),
    mainLibraryTypeFilter: document.getElementById("mainLibraryTypeFilter"),
    mainLibrarySearchBtn: document.getElementById("mainLibrarySearchBtn"),
    mainLibrarySearchStatus: document.getElementById("mainLibrarySearchStatus"),

    // Library Page - Navigation/Content within specific views
    libraryGradeGrid: document.getElementById("library-grade-grid"),
    libraryResourceTypeGrid: document.getElementById(
      "library-resource-type-grid"
    ),
    libraryResourceTypeTitle: document.getElementById(
      "libraryResourceTypeTitle"
    ),
    librarySubjectGrid: document.getElementById("library-subject-grid"),
    librarySubjectSelectionTitle: document.getElementById(
      "librarySubjectSelectionTitle"
    ),
    libraryListBackButton: document.getElementById("library-list-back-btn"),
    libraryListTitle: document.getElementById("libraryListTitle"),
    libraryListSearchContainer: document.getElementById(
      "library-list-search-container"
    ), // Container in list view
    librarySearchInput: document.getElementById("librarySearchInput"), // Search input *in* list view
    libraryYearFilter: document.getElementById("libraryYearFilter"), // Year filter *in* list view
    librarySearchStatus: document.getElementById("librarySearchStatus"), // Status *in* list view
    libraryResourceItems: document.getElementById("library-resource-items"), // Results container

    // Videos Page
    videosPage: document.getElementById("videos"),
    videoGradeGrid: document.getElementById("video-grade-grid"),
    videoSubjectGrid: document.getElementById("video-subject-grid"),
    videoUnitGrid: document.getElementById("video-unit-grid"),
    videoListItems: document.getElementById("video-list-items"),
    videoSubjectSelectionTitle: document.getElementById(
      "videoSubjectSelectionTitle"
    ),
    videoUnitSelectionTitle: document.getElementById("videoUnitSelectionTitle"),
    videoListTitle: document.getElementById("videoListTitle"),

    // Chat Page
    chatPage: document.getElementById("chat"),
    chatContainer: document.querySelector("#chat .chat-container"),
    chatMessages: document.querySelector("#chat .chat-messages"),
    chatInput: document.querySelector("#chat .chat-input"),
    sendBtn: document.querySelector("#chat .send-btn"),
    typingIndicator: document.querySelector("#chat .typing-indicator"),
    clearChatBtn: document.getElementById("clearChatBtn"),
    attachFileBtn: document.getElementById("attachFileBtn"),
    chatFileInput: document.getElementById("chatFileInput"),
    attachmentPreview: document.getElementById("attachmentPreview"),
    attachmentFilename: document.getElementById("attachmentFilename"),
    removeAttachmentBtn: document.getElementById("removeAttachmentBtn"),

    // General UI
    scrollTopBtn: document.getElementById("scrollTopBtn"),

    // Login Popup Modal
    loginPopupModal: document.getElementById("login-popup"),
    loginPopupCloseButton: document.getElementById("login-popup-close"),
    loginButton: document.getElementById("loginBtn"), // Already in index.html, good to cache
    googleSignInButton: document.getElementById("google-signin-btn"),
    displayNameInput: document.getElementById("displayName"),
    gradeSelect: document.getElementById("grade-select"),
  };

  // Define critical elements that MUST exist
  const criticalElements = [
    { name: "pages", el: dom.pages },
    { name: "navButtons", el: dom.navButtons }, // This now uses [data-page]
    { name: "langButtons", el: dom.langButtons },
    { name: "brandLogo", el: dom.brandLogo },
    { name: "homePage", el: dom.homePage },
    { name: "libraryPage", el: dom.libraryPage },
    { name: "videosPage", el: dom.videosPage },
    { name: "scrollTopBtn", el: dom.scrollTopBtn },
    { name: "mainLibrarySearchInput", el: dom.mainLibrarySearchInput },
    { name: "mainLibraryGradeFilter", el: dom.mainLibraryGradeFilter },
    { name: "mainLibraryYearFilter", el: dom.mainLibraryYearFilter },
    { name: "mainLibraryTermFilter", el: dom.mainLibraryTermFilter },
    { name: "mainLibraryTypeFilter", el: dom.mainLibraryTypeFilter },
    { name: "mainLibrarySearchBtn", el: dom.mainLibrarySearchBtn }, // Corrected to select by ID
    { name: "loginPopupModal", el: dom.loginPopupModal },
    { name: "loginPopupCloseButton", el: dom.loginPopupCloseButton },
    { name: "loginButton", el: dom.loginButton },
  ];

  let missing = false;
  criticalElements.forEach((item) => {
    if (!item.el || (item.el instanceof NodeList && item.el.length === 0)) {
      const identifier =
        item.el?.id || item.el?.className?.split(" ")[0] || item.name;
      console.error(
        `Critical DOM element missing or empty: ${item.name} (Identifier: ${identifier})`
      );
      missing = true;
    }
  });

  if (missing) {
    showError(
      "errorDOMInit",
      "Critical UI elements missing. Please check the console for details.",
      true
    );
  } else {
    console.log("DOM elements cached successfully.");
  }
  return !missing;
}

// Expose dom object for other modules to use
export { dom };
