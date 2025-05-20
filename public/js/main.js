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
import {
  addChatWelcomeMessage,
  setGeminiInstances as setChatGeminiInstances,
} from "./chat.js";
import { autoGrowTextarea, showError } from "./utils.js";
// Import specific library functions needed for initialization and setup
import {
  populateMainGradeFilter,
  populateMainYearFilter,
  setupLibraryEventListeners,
  populateListViewYearFilter, // Corrected import name
  renderResourceList,
  resetLibrarySection, // Needed if reset is triggered elsewhere
} from "./library.js";
import {
  renderUnitGrid,
  renderVideoList,
  setupVideosEventListeners,
} from "./videos.js";
import { setupScrollEventListeners } from "./scroll.js";
import {
  populateGradeGrid,
  setRenderingFunctions,
  reRenderDynamicContent,
} from "./commonRendering.js";

// Import Google AI SDK
import { HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
// --- Initialization ---
async function initializeEduHelpApp() {
  console.log("Initializing EduHelp App...");

  // 1. Cache DOM elements FIRST
  if (!cacheDomElements()) {
    console.error(
      "Failed to cache critical DOM elements. Aborting initialization."
    );
    alert("Fatal Error: Failed to load UI elements. Please refresh the page.");
    return;
  }
  console.log("DOM elements cached.");

  // 2. Determine initial language
  let initialLang = config.defaultLang;
  try {
    const savedLang = localStorage.getItem(config.localStorageLangKey);
    if (savedLang && (savedLang === "en" || savedLang === "ta")) {
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
    document.body.classList.remove("content-loading");
    document.body.classList.add("content-ready");
    console.log("Content revealed after language load.");
  } catch (error) {
    console.error("Failed initial language load:", error);
    showError("errorLangSwitch", "Failed to load language.", true);
    // Do not remove content-loading or add content-ready if language load fails.
    // This will keep the loading state active, indicating an issue.
    return; // Abort if initial language fails
  }

  // 4. Initialize Gemini
  const geminiInstances = initializeGemini(
    config,
    HarmCategory,
    HarmBlockThreshold
  );
  if (geminiInstances) {
    setChatGeminiInstances(
      geminiInstances.genAI,
      geminiInstances.modelInstance,
      geminiInstances.isGeminiActive
    );
    console.log("Gemini instances set in chat module.");
  } else {
    console.warn("Gemini initialization failed or skipped.");
    setChatGeminiInstances(null, null, false);
  }

  // 5. Set dynamic rendering functions in commonRendering module
  setRenderingFunctions(
    { populateYearFilter: populateListViewYearFilter, renderResourceList }, // Library functions
    { renderUnitGrid, renderVideoList } // Videos functions
  );
  console.log("Dynamic rendering functions linked.");

  // 6. Setup all event listeners
  setupAllEventListeners(); // This should internally call setupLibraryEventListeners, setupVideosEventListeners, etc.
  console.log("Event listeners set up.");

  // 7. Set initial page/view state correctly
  dom.pages.forEach((page) =>
    page.classList.toggle("active", page.id === state.currentPage)
  );
  // Ensure correct view is active within library/videos if navigating directly (though usually starts at home)
  if (state.currentPage === "library") {
    resetLibrarySection(); // Reset to initial state on load if starting here
  }
  // Add similar reset logic for videos if needed
  // Set initial home view active if starting on home
  if (dom.homePage && state.currentPage === "home") {
    const homeView = dom.homePage.querySelector(".view") || dom.homePage; // Adjust if home doesn't use sub-views
    homeView.classList.add("active");
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
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("service-worker.js")
      .then((registration) => {
        console.log(
          "Service Worker registered with scope:",
          registration.scope
        );

        // Check for updates on registration
        registration.addEventListener("updatefound", () => {
          console.log("New service worker update found.");
        });
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
  }
}

// --- Start the application after the DOM is fully loaded ---
document.addEventListener("DOMContentLoaded", () => {
  initializeEduHelpApp();
});

// --- Login Popup and Firebase Auth Logic ---
// Function-level comments included for clarity

// Firebase config (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyD4FUcysOzLLlKnZjlg6gfR2Wbddag2ei8",
  authDomain: "eduhelp-sl.firebaseapp.com",
  databaseURL:
    "https://eduhelp-sl-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "eduhelp-sl",
  storageBucket: "eduhelp-sl.firebasestorage.app",
  messagingSenderId: "258793073514",
  appId: "1:258793073514:web:310cf2f42767f7d0925313",
  measurementId: "G-E6XTJKR9FW",
};

// Initialize Firebase only if not already initialized
if (typeof window.firebase === "undefined") {
  const script = document.createElement("script");
  script.src =
    "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js";
  script.onload = () => {
    const authScript = document.createElement("script");
    authScript.src =
      "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js";
    authScript.onload = () => {
      window.firebase.initializeApp(firebaseConfig);
      // Analytics and other Firebase services can be initialized here if needed
      setupAuthUI(); // Initialize authentication UI after Firebase loads
    };
    document.head.appendChild(authScript);
  };
  document.head.appendChild(script);
} else {
  setupAuthUI(); // Firebase already loaded
}

/**
 * Sets up authentication UI logic: listens for auth state changes,
 * hides login button and shows user profile image on login.
 */
function setupAuthUI() {
  const auth = window.firebase.auth();
  const loginBtn = document.getElementById("loginBtn");
  const profileContainerId = "profilePicContainer";
  const dropdownId = "profileDropdownMenu";

  // Create a container for the profile image if not present
  let profilePicContainer = document.getElementById(profileContainerId);
  if (!profilePicContainer) {
    profilePicContainer = document.createElement("div");
    profilePicContainer.id = profileContainerId;
    profilePicContainer.style.display = "none";
    profilePicContainer.style.alignItems = "center";
    profilePicContainer.style.justifyContent = "center";
    profilePicContainer.style.position = "relative";
    if (loginBtn && loginBtn.parentNode) {
      loginBtn.parentNode.insertBefore(
        profilePicContainer,
        loginBtn.nextSibling
      );
    } else {
      document.body.appendChild(profilePicContainer);
    }
  }

  // Remove any existing dropdown to avoid duplicates
  let dropdownMenu = document.getElementById(dropdownId);
  if (dropdownMenu) dropdownMenu.remove();

  // Create dropdown menu for logout
  dropdownMenu = document.createElement("div");
  dropdownMenu.id = dropdownId;
  dropdownMenu.className = "profile-dropdown-menu";
  dropdownMenu.style.display = "none";
  dropdownMenu.innerHTML =
    '<button id="logoutBtn" class="profile-dropdown-logout">Logout</button>';
  profilePicContainer.appendChild(dropdownMenu);

  // Listen for authentication state changes
  auth.onAuthStateChanged(function (user) {
    if (user) {
      // User is signed in, hide login button
      if (loginBtn) loginBtn.style.display = "none";
      // Show profile picture
      if (user.photoURL) {
        profilePicContainer.innerHTML = "";
        const img = document.createElement("img");
        img.src = user.photoURL;
        img.alt = "Profile";
        img.style.width = "40px";
        img.style.height = "40px";
        img.style.borderRadius = "50%";
        img.style.objectFit = "cover";
        img.style.boxShadow = "0 0 4px rgba(0,0,0,0.2)";
        img.title = user.displayName || "User";
        img.style.cursor = "pointer";
        profilePicContainer.appendChild(img);
        profilePicContainer.appendChild(dropdownMenu);
        profilePicContainer.style.display = "flex";

        // Toggle dropdown on profile pic click
        img.onclick = function (e) {
          e.stopPropagation();
          dropdownMenu.style.display =
            dropdownMenu.style.display === "block" ? "none" : "block";
        };
        // Hide dropdown when clicking outside
        document.addEventListener("click", function hideDropdown(ev) {
          if (!profilePicContainer.contains(ev.target)) {
            dropdownMenu.style.display = "none";
          }
        });
      }
      // Attach logout handler
      const logoutBtn = dropdownMenu.querySelector("#logoutBtn");
      if (logoutBtn) {
        logoutBtn.onclick = function () {
          auth.signOut().then(function () {
            dropdownMenu.style.display = "none";
            if (loginBtn) loginBtn.style.display = "inline-block";
            profilePicContainer.style.display = "none";
            profilePicContainer.innerHTML = "";
          });
        };
      }
    } else {
      // User is signed out, show login button and hide profile
      if (loginBtn) loginBtn.style.display = "inline-block";
      profilePicContainer.style.display = "none";
      profilePicContainer.innerHTML = "";
    }
  });
}

/**
 * Shows the login popup modal.
 */
function showLoginPopup() {
  const popup = document.getElementById("login-popup");
  if (popup) {
    popup.style.display = "flex";
    popup.style.alignItems = "center"; // Ensure centering property is applied inline
    popup.style.justifyContent = "center"; // Ensure centering property is applied inline
  }
}

/**
 * Hides the login popup modal.
 */
function hideLoginPopup() {
  const popup = document.getElementById("login-popup");
  if (popup) popup.style.display = "none";
}

/**
 * Handles sign-in with Google using Firebase Auth.
 */
function handleGoogleSignIn() {
  if (!window.firebase || !window.firebase.auth) {
    alert("Firebase not loaded. Please try again later.");
    return;
  }
  const provider = new window.firebase.auth.GoogleAuthProvider();
  window.firebase
    .auth()
    .signInWithPopup(provider)
    .then((result) => {
      alert("Signed in as: " + result.user.displayName);
      hideLoginPopup();
    })
    .catch((error) => {
      alert("Google sign-in failed: " + error.message);
    });
}

/**
 * Handles sign-in with Facebook using Firebase Auth.
 */
function handleFacebookSignIn() {
  if (!window.firebase || !window.firebase.auth) {
    alert("Firebase not loaded. Please try again later.");
    return;
  }
  const provider = new window.firebase.auth.FacebookAuthProvider();
  window.firebase
    .auth()
    .signInWithPopup(provider)
    .then((result) => {
      alert("Signed in as: " + result.user.displayName);
      hideLoginPopup();
    })
    .catch((error) => {
      alert("Facebook sign-in failed: " + error.message);
    });
}

// Attach event listeners after DOM is loaded
window.addEventListener("DOMContentLoaded", () => {
  // Login button event
  const loginBtn = document.querySelector(".login-btn");
  if (loginBtn) {
    loginBtn.addEventListener("click", showLoginPopup);
  }
  // Popup close event
  const closeBtn = document.getElementById("login-popup-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", hideLoginPopup);
    closeBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") hideLoginPopup();
    });
  }
  // Google sign-in event
  const googleBtn = document.getElementById("google-signin-btn");
  if (googleBtn) {
    googleBtn.addEventListener("click", handleGoogleSignIn);
  }
  // Facebook sign-in event
  const facebookBtn = document.getElementById("facebook-signin-btn");
  if (facebookBtn) {
    facebookBtn.addEventListener("click", handleFacebookSignIn);
  }
  // Hide popup on outside click
  const popup = document.getElementById("login-popup");
  if (popup) {
    popup.addEventListener("click", (e) => {
      if (e.target === popup) hideLoginPopup();
    });
  }
});
