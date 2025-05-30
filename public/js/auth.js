/**
 * Authentication UI and Logic Module
 * Handles login/logout UI, error display, and user experience
 */

import { state } from "./state.js";
import { dom } from "./domCache.js";
import { getTranslation } from "./translation.js";
import { reRenderDynamicContent } from "./commonRendering.js";
import {
  initializeFirebase,
  signInWithGoogle,
  signOut,
  setupAuthStateObserver,
  isUserAuthenticated,
  getAuthErrorMessage,
} from "./firebase.js";
import { navigateToPage } from "./navigation.js"; // Import navigateToPage

// Authentication state
let authInitialized = false;
let authStateUnsubscribe = null;

/**
 * Initialize authentication system
 */
export async function initializeAuth() {
  try {
    if (authInitialized) return;

    console.log("Initializing authentication...");

    // Initialize Firebase
    await initializeFirebase();

    // Setup authentication state observer
    authStateUnsubscribe = setupAuthStateObserver(handleAuthStateChange);

    // Setup UI event listeners
    setupAuthEventListeners();

    authInitialized = true;
    console.log("Authentication initialized successfully");
  } catch (error) {
    console.error("Authentication initialization failed:", error);
    showAuthError(
      getTranslation(
        "authInitError",
        "Failed to initialize authentication system."
      )
    );
  }
}

/**
 * Handle authentication state changes
 */
function handleAuthStateChange(user) {
  const justLoggedIn = sessionStorage.getItem("justLoggedIn");
  const justLoggedOut = sessionStorage.getItem("justLoggedOut");

  if (user) {
    // User signed in
    updateUIForSignedInUser(user);
    hideLoginPopup();
    if (justLoggedIn) {
      showAuthSuccess(
        getTranslation(
          "signInSuccess",
          "You are now signed in, {name}!"
        ).replace("{name}", user.displayName || user.email)
      );
      sessionStorage.removeItem("justLoggedIn"); // Clear the flag
      // Redirect to resources page after successful sign-in
      navigateToPage("library"); // Assuming 'library' is the ID for the resources page
    }
  } else {
    // User signed out
    updateUIForSignedOutUser();
    if (justLoggedOut) {
      showAuthSuccess(
        getTranslation("signOutSuccess", "You have been signed out.")
      );
      sessionStorage.removeItem("justLoggedOut"); // Clear the flag
    }
  }

  // Re-render dynamic content that depends on auth state
  reRenderDynamicContent();
}

/**
 * Update UI for signed-in user
 */
function updateUIForSignedInUser(user) {
  // Hide login button
  if (dom.loginButton) {
    dom.loginButton.style.display = "none";
  }

  // Show user profile
  createOrUpdateUserProfile(user);

  // Update any auth-dependent UI elements
  updateAuthDependentElements(true);
}

/**
 * Update UI for signed-out user
 */
function updateUIForSignedOutUser() {
  // Show login button
  if (dom.loginButton) {
    dom.loginButton.style.display = "block";
  }

  // Hide user profile
  removeUserProfile();

  // Update any auth-dependent UI elements
  updateAuthDependentElements(false);
}

/**
 * Create or update user profile display
 */
function createOrUpdateUserProfile(user) {
  let profileContainer = document.getElementById("userProfileContainer");

  if (!profileContainer) {
    profileContainer = document.createElement("div");
    profileContainer.id = "userProfileContainer";
    profileContainer.className = "user-profile-container";

    // Insert after login button
    if (dom.loginButton && dom.loginButton.parentNode) {
      dom.loginButton.parentNode.insertBefore(
        profileContainer,
        dom.loginButton.nextSibling
      );
    } else {
      // Fallback: append to header
      const header = document.querySelector(".header-container");
      if (header) header.appendChild(profileContainer);
    }
  }

  profileContainer.innerHTML = `
    <div class="user-profile-dropdown">
      <button class="user-profile-btn" id="userProfileBtn">
        ${
          user.photoURL
            ? `<img src="${user.photoURL}" alt="Profile" class="profile-pic profile-picture">`
            : `<div class="profile-picture-fallback">${(
                user.displayName || user.email
              )
                .charAt(0)
                .toUpperCase()}</div>`
        }
        <span class="user-name">${user.displayName || user.email}</span>
        <i class="fas fa-chevron-down"></i>
      </button>
      <div class="profile-dropdown-menu" id="profileDropdownMenu">
        <div class="profile-info">
          <strong>${user.displayName || "User"}</strong>
          <small>${user.email}</small>
        </div>
        <button class="profile-dropdown-item" id="logoutBtn">
          <i class="fas fa-sign-out-alt"></i>
          <span data-lang-key="authLogout">Logout</span>
        </button>
      </div>
    </div>
  `;

  profileContainer.style.display = "block";

  // Setup dropdown functionality
  setupProfileDropdown();
}

/**
 * Setup profile dropdown functionality
 */
function setupProfileDropdown() {
  const profileBtn = document.getElementById("userProfileBtn");
  const dropdownMenu = document.getElementById("profileDropdownMenu");
  const logoutBtn = document.getElementById("logoutBtn");

  if (profileBtn && dropdownMenu) {
    // Toggle dropdown on profile button click
    profileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle("show");
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!profileBtn.contains(e.target)) {
        dropdownMenu.classList.remove("show");
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleSignOut);
  }
}

/**
 * Remove user profile display
 */
function removeUserProfile() {
  const profileContainer = document.getElementById("userProfileContainer");
  if (profileContainer) {
    profileContainer.style.display = "none";
  }
}

/**
 * Update elements that depend on authentication state
 */
function updateAuthDependentElements(isSignedIn) {
  // Update chat access based on auth state
  updateChatAccess(isSignedIn);

  // Update any other auth-dependent UI elements here
}

/**
 * Update chat access based on authentication state
 */
function updateChatAccess(isSignedIn) {
  const chatInput = document.getElementById("chatInput");
  const sendBtn = document.getElementById("sendBtn");
  const chatPage = document.getElementById("chat");

  if (chatInput && sendBtn) {
    if (isSignedIn) {
      chatInput.disabled = false;
      sendBtn.disabled = false;
      chatInput.placeholder = getTranslation(
        "chatPlaceholder",
        "Ask a question..."
      );
    } else {
      chatInput.disabled = true;
      sendBtn.disabled = true;
      chatInput.placeholder = getTranslation(
        "chatSignInRequired",
        "Please sign in to use the AI Assistant"
      );
      // Add event listener to prompt login when disabled chat input is clicked
      if (chatInput) {
        // Remove previous listener to avoid duplicates if this function is called multiple times
        const newChatInput = chatInput.cloneNode(true);
        chatInput.parentNode.replaceChild(newChatInput, chatInput);
        newChatInput.addEventListener("click", () => {
          if (!isUserAuthenticated()) {
            // Check if user is still not authenticated
            showChatAccessDenied(); // Changed from showLoginPopup()
          }
        });
        // Re-assign to the new node for any subsequent logic if needed, though not strictly necessary here
        // chatInput = newChatInput;
      }
    }
  }
}

/**
 * Setup authentication event listeners
 */
function setupAuthEventListeners() {
  // Login button click
  if (dom.loginButton) {
    dom.loginButton.addEventListener("click", showLoginPopup);
  }

  // Login popup close button
  if (dom.loginPopupCloseButton) {
    dom.loginPopupCloseButton.addEventListener("click", hideLoginPopup);
    dom.loginPopupCloseButton.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        hideLoginPopup();
      }
    });
  }

  // Google sign-in button
  if (dom.googleSignInButton) {
    dom.googleSignInButton.addEventListener("click", handleGoogleSignIn);
  }

  // Close popup on outside click
  if (dom.loginPopupModal) {
    dom.loginPopupModal.addEventListener("click", (e) => {
      if (e.target === dom.loginPopupModal) {
        hideLoginPopup();
      }
    });
  }

  // Handle Enter key in name input
  if (dom.displayNameInput) {
    dom.displayNameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleGoogleSignIn();
      }
    });
  }

  // Handle Enter key in grade select
  if (dom.gradeSelect) {
    dom.gradeSelect.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleGoogleSignIn();
      }
    });
  }
}

/**
 * Show login popup
 */
export function showLoginPopup() {
  if (dom.loginPopupModal) {
    dom.loginPopupModal.style.display = "flex";

    // Focus on name input
    if (dom.displayNameInput) {
      setTimeout(() => dom.displayNameInput.focus(), 100);
    }
  }
}

/**
 * Hide login popup
 */
function hideLoginPopup() {
  if (dom.loginPopupModal) {
    dom.loginPopupModal.style.display = "none";
  }

  // Clear any error messages
  clearAuthMessages();
}

/**
 * Handle Google sign-in
 */
async function handleGoogleSignIn() {
  if (!dom.googleSignInButton) return;

  showLoadingState(dom.googleSignInButton, true);
  clearAuthError(); // Clear previous errors

  const displayNameInput = document.getElementById("displayName");
  const gradeSelect = document.getElementById("gradeSelect");
  if (!displayNameInput || !gradeSelect) {
    console.error("Required form elements not found for sign-in.");
    showAuthError(
      getTranslation(
        "formElementsMissing",
        "Required form elements are missing."
      )
    );
    showLoadingState(dom.googleSignInButton, false);
    return;
  }

  const displayName = displayNameInput.value.trim();
  const grade = gradeSelect.value;

  if (!displayName) {
    showAuthError(
      getTranslation("nameRequiredError", "Please enter your name."),
      "displayName-error"
    );
    showLoadingState(dom.googleSignInButton, false);
    return;
  }

  try {
    await signInWithGoogle(displayName, grade);
    sessionStorage.setItem("justLoggedIn", "true");
    // Auth state change will handle UI updates and success message
  } catch (error) {
    console.error("Google Sign-In process error:", error);
    const errorMessage = getAuthErrorMessage(
      error.code,
      getTranslation("signInFailed", "Sign-in failed. Please try again.")
    );
    showAuthError(errorMessage);
    showLoadingState(dom.googleSignInButton, false);
  }
}

/**
 * Handle sign out
 */
async function handleSignOut() {
  if (!isUserAuthenticated()) return;

  try {
    await signOut();
    sessionStorage.setItem("justLoggedOut", "true");
    // Auth state change will handle UI updates and success message
  } catch (error) {
    console.error("Sign out failed:", error);
    showAuthError(
      getTranslation("signOutError", "Sign out failed. Please try again.")
    );
  }
}

/**
 * Set loading state for sign-in button
 */
function setSignInButtonLoading(isLoading) {
  if (dom.googleSignInButton) {
    dom.googleSignInButton.disabled = isLoading;

    if (isLoading) {
      dom.googleSignInButton.innerHTML = `
        <i class="fas fa-spinner fa-spin"></i>
        ${getTranslation("signingIn", "Signing in...")}
      `;
    } else {
      dom.googleSignInButton.innerHTML = `
        <i class="fab fa-google"></i>
        ${getTranslation("signInWithGoogle", "Sign in with Google")}
      `;
    }
  }
}

/**
 * Set loading state for sign-out button
 */
function setSignOutButtonLoading(isLoading) {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.disabled = isLoading;

    if (isLoading) {
      logoutBtn.innerHTML = `
        <i class="fas fa-spinner fa-spin"></i>
        <span>${getTranslation("signingOut", "Signing out...")}</span>
      `;
    } else {
      logoutBtn.innerHTML = `
        <i class="fas fa-sign-out-alt"></i>
        <span data-lang-key="authLogout">${getTranslation(
          "authLogout",
          "Logout"
        )}</span>
      `;
    }
  }
}

/**
 * Show authentication error message
 */
export function showAuthError(message) {
  showAuthMessage(message, "error");
}

/**
 * Show authentication success message
 */
function showAuthSuccess(message) {
  showAuthMessage(message, "success");
}

/**
 * Show authentication message
 */
export function showAuthMessage(message, type = "info") {
  // Create or get message container
  let messageContainer = document.getElementById("authMessageContainer");

  if (!messageContainer) {
    messageContainer = document.createElement("div");
    messageContainer.id = "authMessageContainer";
    messageContainer.className = "auth-message-container";

    // Insert in login popup if open, otherwise as a global banner
    const loginContent = document.querySelector(".login-popup-content");
    if (loginContent && dom.loginPopupModal?.style.display !== "none") {
      // Message inside login popup
      loginContent.insertBefore(messageContainer, loginContent.firstChild);
      messageContainer.classList.remove("auth-message-banner");
      // Ensure general container styles are appropriate for popup
      messageContainer.style.position = "relative";
      messageContainer.style.zIndex = "auto";
    } else {
      // Global message banner
      let parentElement =
        document.querySelector(".header-container") || document.body;

      // Remove any existing banner first to prevent stacking
      const existingBanner = parentElement.querySelector(
        ".auth-message-banner"
      );
      if (existingBanner) {
        existingBanner.remove();
      }

      parentElement.appendChild(messageContainer);
      messageContainer.classList.add("auth-message-banner");
      // Styles for banner will be handled by CSS, but ensure no inline conflicts
      messageContainer.style.position = ""; // Let CSS handle it
      messageContainer.style.zIndex = ""; // Let CSS handle it
    }
  }

  messageContainer.className = "auth-message-container"; // Type class will be on the message itself

  // Create the individual message element
  const messageDiv = document.createElement("div");
  messageDiv.className = `auth-message auth-message-${type}`; // e.g., auth-message-error

  messageDiv.innerHTML = `
      <i class="auth-message-icon fas ${
        type === "error"
          ? "fa-exclamation-circle"
          : type === "success"
          ? "fa-check-circle"
          : "fa-info-circle"
      }"></i>
      <span class="auth-message-text">${message}</span>
      <button class="auth-message-close-btn" onclick="this.closest('.auth-message').remove()">
        <i class="fas fa-times"></i>
      </button>
  `;

  // Clear previous messages in the container and add the new one
  messageContainer.innerHTML = "";
  messageContainer.appendChild(messageDiv);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (messageContainer.parentNode) {
      messageContainer.remove();
    }
  }, 5000);
}

/**
 * Clear authentication messages
 */
function clearAuthMessages() {
  const messageContainer = document.getElementById("authMessageContainer");
  if (messageContainer) {
    messageContainer.remove();
  }
}

/**
 * Check if user can access chat
 */
export function canAccessChat() {
  return isUserAuthenticated();
}

/**
 * Show chat access denied modal
 */
export function showChatAccessDenied() {
  // Create modal if it doesn't exist
  let modal = document.getElementById("chatAccessDeniedModal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "chatAccessDeniedModal";
    modal.className = "auth-modal";
    modal.innerHTML = `
      <div class="auth-modal-content">
        <div class="auth-modal-header">
          <h3>${getTranslation(
            "chatAccessDeniedTitle",
            "Sign In Required"
          )}</h3>
          <button class="auth-modal-close" id="chatAccessDeniedClose">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="auth-modal-body">
          <p>${getTranslation(
            "chatAccessDeniedMessage",
            "Please sign in to use the EduHelpSL AI Assistant."
          )}</p>
        </div>
        <div class="auth-modal-footer">
          <button class="btn btn-primary" id="chatAccessSignInBtn">
            ${getTranslation("signInNow", "Sign In Now")}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Setup event listeners
    const closeBtn = modal.querySelector("#chatAccessDeniedClose");
    const signInBtn = modal.querySelector("#chatAccessSignInBtn");

    closeBtn?.addEventListener("click", () => {
      modal.style.display = "none";
    });

    signInBtn?.addEventListener("click", () => {
      modal.style.display = "none";
      showLoginPopup();
    });

    // Close on outside click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });
  }

  modal.style.display = "flex";
}

/**
 * Cleanup authentication
 */
export function cleanupAuth() {
  if (authStateUnsubscribe) {
    authStateUnsubscribe();
    authStateUnsubscribe = null;
  }
  authInitialized = false;
}

/**
 * Setup login button
 */
function setupLoginButton() {
  const loginBtn = document.getElementById("loginBtn");
  const loginPopup = document.getElementById("login-popup");
  const closeBtn = document.getElementById("login-popup-close");
  const googleSignInButton = document.getElementById("google-signin-btn");

  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      if (loginPopup) loginPopup.style.display = "block";
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeLoginPopup);
    closeBtn.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        closeLoginPopup();
      }
    });
  }

  if (googleSignInButton) {
    googleSignInButton.addEventListener("click", handleSignIn);
  }

  // Close popup when clicking outside of it
  window.addEventListener("click", (event) => {
    if (event.target === loginPopup) {
      closeLoginPopup();
    }
  });
}

async function handleSignIn(event) {
  event.preventDefault(); // Prevent default form submission if any
  const displayNameInput = document.getElementById("displayName");
  const displayName = displayNameInput.value.trim();
  const grade = document.getElementById("gradeSelect").value;
  const displayNameError = document.getElementById("displayName-error");

  if (!displayName) {
    displayNameError.textContent = translate("displayNameRequired");
    displayNameInput.focus();
    return;
  }
  displayNameError.textContent = ""; // Clear any previous error

  // Show loading state on the button
  const googleSignInButton = document.getElementById("google-signin-btn");
  const btnText = googleSignInButton.querySelector(".btn-text");
  const btnLoading = googleSignInButton.querySelector(".btn-loading");

  btnText.style.display = "none";
  btnLoading.style.display = "inline-block";
  googleSignInButton.disabled = true;

  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await firebase.auth().signInWithPopup(provider);
    const user = result.user;

    if (user) {
      // Store display name and grade in Firestore or Realtime Database
      // For simplicity, we'll store it in localStorage for now, but a backend solution is better.
      localStorage.setItem("displayName", displayName);
      localStorage.setItem("grade", grade);
      updateLoginUI(user, displayName, grade);
      closeLoginPopup();
      sessionStorage.setItem("justLoggedIn", "true"); // Set flag for specific welcome message and redirect
    }
  } catch (error) {
    console.error("Error during sign-in popup:", error);
    let errorMessage = translate("loginError");
    if (error.code === "auth/popup-closed-by-user") {
      errorMessage = translate("loginCancelled");
    }
    showToast(errorMessage, "error");
  } finally {
    // Hide loading state
    btnText.style.display = "inline-block";
    btnLoading.style.display = "none";
    googleSignInButton.disabled = false;
  }
}
