// --- Translation Functions ---

import { state } from "./state.js";
import { dom } from "./domCache.js";
import { config } from "./config.js";
import { showError } from "./utils.js";
import { updateDynamicTitles } from "./navigation.js";
import { reRenderDynamicContent } from "./commonRendering.js";
import { updateCopyrightYear } from "./navigation.js";
import { addChatWelcomeMessage } from "./chat.js";
import { reInitScrollAnimationsOnPageLoad } from "./scroll.js"; // Import the new function

export async function loadTranslations(lang) {
  if (!lang || typeof lang !== "string" || lang.length > 5) return {};
  if (config.cacheTranslations && state.translationCache[lang]) {
    console.log(`Loading translations for ${lang} from cache.`);
    return state.translationCache[lang];
  }
  console.log(`Attempting to load translations for ${lang} from file.`);
  try {
    const response = await fetch(`languages/${lang}.json`);
    if (!response.ok) {
      const errorText = await response.text(); // Attempt to get more error details
      console.error(
        `HTTP error ${response.status} (${response.statusText}) for ${lang}.json. Server response: ${errorText}`
      );
      throw new Error(
        `HTTP error ${response.status} while fetching ${lang}.json`
      );
    }
    try {
      const data = await response.json();
      if (typeof data !== "object" || data === null) {
        console.error(
          `Invalid JSON structure received for ${lang}.json. Data:`,
          data
        );
        throw new Error(`Invalid JSON structure in ${lang}.json`);
      }
      if (config.cacheTranslations) state.translationCache[lang] = data;
      console.log(`Translations loaded successfully for ${lang}.`);
      return data;
    } catch (jsonError) {
      console.error(`Failed to parse JSON for ${lang}.json:`, jsonError);
      // Attempt to get the raw text if JSON parsing fails, to see if it's malformed or too large
      try {
        const rawText = await response.text(); // This might fail if response already read
        console.error(
          `Raw content of ${lang}.json (if available after parse error):`,
          rawText.substring(0, 500) + "..."
        );
      } catch (textError) {
        console.error(
          `Could not get raw text of ${lang}.json after JSON parse error:`,
          textError
        );
      }
      throw new Error(
        `JSON parsing error in ${lang}.json: ${jsonError.message}`
      );
    }
  } catch (error) {
    console.error(
      `Load/Parse fail for ${lang}.json:`,
      error.message,
      error.stack
    );
    showError(
      "errorLoadTranslations",
      `Failed to load ${lang}: ${error.message}`
    );
    return {};
  }
}

export function applyTranslations() {
  const t = state.translations;
  if (!t || Object.keys(t).length === 0) return;
  console.log("Applying translations...");
  document.querySelectorAll("[data-lang-key]").forEach((el) => {
    const k = el.dataset.langKey;
    const tr = t[k];
    if (tr === undefined) return; // Skip if translation not found

    if (el.placeholder !== undefined) el.placeholder = tr;
    else if (el.tagName === "INPUT" && el.type === "submit") el.value = tr;
    else if (el.tagName === "IMG" && el.hasAttribute("alt")) el.alt = tr;
    else if (el.tagName === "TITLE") document.title = tr;
    else if (el.tagName === "META" && el.name === "description")
      el.content = tr;
    else if (
      el.hasAttribute("aria-label") &&
      !el.classList.contains("lang-btn")
    )
      el.setAttribute("aria-label", tr);
    else el.textContent = tr;
  });

  // Update dynamic content/titles that depend on translations
  updateDynamicTitles();
  updateCopyrightYear();
  reRenderDynamicContent(); // Re-render content like grids and lists
  reInitScrollAnimationsOnPageLoad(); // Re-initialize scroll animations for home page sections

  // Ensure chat welcome message is in the current language if chat is empty
  if (
    state.currentPage === "chat" &&
    dom.chatMessages &&
    dom.chatMessages.children.length === 0
  ) {
    addChatWelcomeMessage();
  }

  // Update typing indicator text if chat is active
  if (dom.typingIndicator) {
    dom.typingIndicator.dataset.defaultText =
      t["loadingText"] || "AI is thinking...";
    if (state.chatState.isBotTyping) {
      dom.typingIndicator.textContent = dom.typingIndicator.dataset.defaultText;
    }
  }
  console.log("Translations applied.");
}

export async function switchLanguage(lang) {
  console.log(`Attempting switch to: ${lang}`);
  // Prevent switching if already active language and translations are loaded
  if (
    lang === state.currentLang &&
    Object.keys(state.translations).length > 0
  ) {
    console.log(
      `Language already ${lang} and translations loaded. Aborting switch.`
    );
    return;
  }

  if (!lang || (lang !== "en" && lang !== "ta")) {
    console.warn(`Invalid language code attempted: ${lang}`);
    return; // Only 'en' and 'ta' are supported
  }

  try {
    const newTrans = await loadTranslations(lang);
    if (Object.keys(newTrans).length === 0) {
      showError("errorLangSwitch", `Could not load ${lang} data.`);
      return;
    }

    state.translations = newTrans;
    state.currentLang = lang;

    // Update html lang attribute
    if (dom.html) {
      dom.html.lang = lang;
    }

    // Update active state on language buttons
    if (dom.langButtons) {
      dom.langButtons.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.lang === lang);
      });
    }

    // Save selected language to localStorage
    try {
      localStorage.setItem(config.localStorageLangKey, lang);
      console.log(`Saved language preference: ${lang}`);
    } catch (e) {
      console.warn("LocalStorage error saving language:", e);
    }

    // Apply the new translations to the DOM
    applyTranslations();

    console.log(`Language switched to: ${lang}`);
  } catch (error) {
    console.error(`Error switching lang to '${lang}':`, error);
    showError("errorLangSwitch", error.message);
  }
}

// Function to get a translated string by key
export function getTranslation(key, fallback = key) {
  return state.translations[key] || fallback;
}
