// --- Event Listener Setup ---

import { dom } from "./domCache.js"; // Assuming dom is exported from domCache.js
import { navigateToPage } from "./navigation.js"; // Assuming navigateToPage is exported
import { showLoginPopup } from "./main.js"; // Import showLoginPopup
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
    dom.navButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const rawTargetPage = btn.dataset.page;
        if (rawTargetPage) {
          const normalizedTargetPage = rawTargetPage.toLowerCase().trim();
          console.log(
            `Nav button clicked. Original: "${rawTargetPage}", Processed: "${normalizedTargetPage}"`
          );
          console.log(
            `Type of Processed: ${typeof normalizedTargetPage}, Length: ${
              normalizedTargetPage.length
            }`
          );
          const isLogin = normalizedTargetPage === "login";
          console.log(`Is Processed === "login"? ${isLogin}`);

          if (isLogin) {
            console.log(
              "Condition TRUE (nav button). Calling showLoginPopup()."
            );
            showLoginPopup();
          } else {
            console.log(
              `Condition FALSE (nav button). Calling navigateToPage("${normalizedTargetPage}").`
            );
            navigateToPage(normalizedTargetPage);
          }
        } else {
          console.warn(
            "Nav button data-page is missing or empty for element:",
            btn
          );
        }
      });
    });
  } else {
    console.warn("Nav buttons not found for event listener setup.");
  }

  // Footer Links (assuming these also navigate pages)
  if (dom.footerLinks) {
    dom.footerLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault(); // Prevent default link behavior
        const rawTargetPage = link.dataset.footerLink;
        if (rawTargetPage) {
          const normalizedTargetPage = rawTargetPage.toLowerCase().trim();
          console.log(
            `Footer link clicked. Original: "${rawTargetPage}", Processed: "${normalizedTargetPage}"`
          );
          console.log(
            `Type of Processed: ${typeof normalizedTargetPage}, Length: ${
              normalizedTargetPage.length
            }`
          );
          const isLogin = normalizedTargetPage === "login";
          console.log(`Is Processed === "login"? ${isLogin}`);

          if (isLogin) {
            console.log(
              "Condition TRUE (footer link). Calling showLoginPopup()."
            );
            showLoginPopup();
          } else {
            console.log(
              `Condition FALSE (footer link). Calling navigateToPage("${normalizedTargetPage}").`
            );
            navigateToPage(normalizedTargetPage);
          }
        } else {
          console.warn(
            "Footer link data-footer-link is missing or empty for element:",
            link
          );
        }
      });
    });
  }

  // Language Switcher Buttons
  if (dom.langButtons) {
    dom.langButtons.forEach((btn) => {
      btn.addEventListener("click", () => switchLanguage(btn.dataset.lang));
    });
  } else {
    console.warn("Language buttons not found for event listener setup.");
  }

  // Brand Logo Click (Navigate to Home)
  if (dom.brandLogo) {
    dom.brandLogo.addEventListener("click", () => navigateToPage("home"));
    // Add keyboard accessibility for the logo
    dom.brandLogo.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        // Listen for Enter or Space key
        e.preventDefault(); // Prevent default scroll behavior for space
        navigateToPage("home");
      }
    });
  } else {
    console.warn("Brand logo element not found for event listener setup.");
  }

  // Error Message Close Button
  if (dom.closeErrorBtn) {
    dom.closeErrorBtn.addEventListener("click", hideError);
  } else {
    console.warn("Close error button not found for event listener setup.");
  }

  // Setup section-specific event listeners
  setupLibraryEventListeners();
  setupVideosEventListeners();
  setupChatEventListeners();
  setupScrollEventListeners();

  console.log("Event listeners setup complete.");
}
