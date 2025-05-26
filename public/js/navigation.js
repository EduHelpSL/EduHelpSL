// --- Page Navigation & View Switching ---

import { dom } from "./domCache.js";
import { state } from "./state.js";
import { applyTranslations, getTranslation } from "./translation.js";
import { resetSectionView } from "./commonRendering.js"; // Assuming resetSectionView is here or imported
import { config } from "./config.js"; // Import config
import { addChatWelcomeMessage } from "./chat.js"; // Import addChatWelcomeMessage
import { populateGradeGrid } from "./commonRendering.js"; // Import populateGradeGrid
import { showLoginPopup } from "./main.js"; // Import showLoginPopup

// Note: updateDynamicTitles needs functions from library.js and videos.js
// These will be passed in during initialization or accessed via imports.

export function updateDynamicTitles() {
  // Ensure translations are loaded
  const t = state.translations;
  if (!t || Object.keys(t).length === 0) {
    console.warn("Translations not loaded, skipping dynamic title update.");
    return;
  }

  const libState = state.libraryState;
  const vidState = state.videoState;

  // Helper functions for getting translated grade, subject, resource type, unit names
  const gradeText = (g) => (g ? t[`grade${g}`] || `Grade ${g}` : "");
  const subjText = (s) => {
    if (!s) return "";
    const langKey = `subject${s.charAt(0).toUpperCase() + s.slice(1)}`;
    // Fallback text: split camelCase and capitalize first letter
    const fallbackText = s
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
    return t[langKey] || fallbackText;
  };
  const resTypeText = (rt) => {
    if (!rt) return "";
    const langKey = `resource${rt.charAt(0).toUpperCase() + rt.slice(1)}`;
    return t[langKey] || rt;
  };
  const unitText = (uk) => {
    if (!uk) return "";
    // Assuming fakeVideoData and config are accessible or imported
    // Import config if needed: import { config } from "./config.js";
    const unitData =
      config.fakeVideoData?.[vidState.selectedGrade]?.[ // Use imported config
        vidState.selectedSubject
      ]?.[uk]; // Access via window for now, improve later
    const displayKey = unitData?.titleKey || uk;
    const fallbackText = `Unit ${uk.replace("unit", "")}`;
    return t[displayKey] || fallbackText;
  };

  // Update Library Titles
  if (dom.libraryResourceTypeTitle) {
    dom.libraryResourceTypeTitle.textContent = `${
      t["selectResourceType"] || "Select Type for"
    } ${gradeText(libState.selectedGrade)}`;
  }
  if (dom.librarySubjectSelectionTitle) {
    dom.librarySubjectSelectionTitle.textContent = `${gradeText(
      libState.selectedGrade
    )} - ${resTypeText(libState.selectedResourceType)} - ${
      t["selectSubject"] || "Select Subject"
    }`;
  }
  if (dom.libraryListTitle) {
    let parts = [gradeText(libState.selectedGrade)];
    if (libState.selectedResourceType)
      parts.push(resTypeText(libState.selectedResourceType));
    // Only add subject to title if it's not 'other' resource type
    if (libState.selectedSubject && libState.selectedResourceType !== "other") {
      parts.push(subjText(libState.selectedSubject));
    }
    dom.libraryListTitle.textContent = parts.join(" - ");
  }

  // Update Videos Titles
  if (dom.videoSubjectSelectionTitle) {
    dom.videoSubjectSelectionTitle.textContent = `${gradeText(
      vidState.selectedGrade
    )} - ${t["selectSubject"] || "Select Subject"}`;
  }
  if (dom.videoUnitSelectionTitle) {
    dom.videoUnitSelectionTitle.textContent = `${gradeText(
      vidState.selectedGrade
    )} - ${subjText(vidState.selectedSubject)} - ${
      t["selectUnit"] || "Select Unit"
    }`;
  }
  if (dom.videoListTitle) {
    dom.videoListTitle.textContent = `${gradeText(
      vidState.selectedGrade
    )} - ${subjText(vidState.selectedSubject)} - ${unitText(
      vidState.selectedVideoUnit
    )}`;
  }

  // Update general view titles that have data-lang-key
  document
    .querySelectorAll(".view > .view-title[data-lang-key]")
    .forEach((el) => {
      // Avoid overwriting dynamically set titles in Library/Videos
      // Also exclude the main home title which is static in HTML
      if (
        !el.closest("#library") &&
        !el.closest("#videos") &&
        !el.closest("#home")
      ) {
        const key = el.dataset.langKey;
        el.textContent = t[key] || key;
      }
    });
  console.log("Dynamic titles updated.");
}

// --- Update Copyright Year (tied to translation/init) ---
export function updateCopyrightYear() {
  if (dom.copyright) {
    const cy = new Date().getFullYear();
    // Always set the text to include the current year
    dom.copyright.textContent = `© ${cy} EduHelp Sri Lanka. All Rights Reserved.`;
  }
}

// --- View Switching Logic ---
export function switchActiveView(
  sectionElement,
  targetViewId,
  isBackNavigation = false
) {
  if (!sectionElement) return;
  const views = sectionElement.querySelectorAll(".view");
  let foundView = false;
  let targetViewElement = null;

  // console.log(`Switching view in #${sectionElement.id} to #${targetViewId}`);

  views.forEach((view) => {
    if (view.id === targetViewId) {
      view.classList.add("active");
      foundView = true;
      targetViewElement = view;

      // Update state based on which section's view is changing
      if (sectionElement.id === "library")
        state.libraryState.activeViewId = targetViewId;
      else if (sectionElement.id === "videos")
        state.videoState.activeViewId = targetViewId;
    } else {
      view.classList.remove("active");
    }
  });

  if (!foundView) {
    console.error(
      `Target view "${targetViewId}" not found in section #${sectionElement.id}.`
    );
    return;
  }

  // Scroll to the top of the section when switching views,
  // unless it's a back navigation to the grade view.
  const isGradeView = targetViewId.toLowerCase().includes("gradeselectionview");
  if (isBackNavigation && isGradeView && targetViewElement) {
    // For back navigation to grade view, scroll to the top of the section element itself
    // (or just below the header), rather than the very top of the view element,
    // which might be off-screen if the section starts lower.
    const headerHeight = dom.header ? dom.header.offsetHeight : 65; // Fallback height
    const offsetPosition = sectionElement.offsetTop - headerHeight - 20; // A little extra padding
    window.scrollTo({ top: Math.max(0, offsetPosition), behavior: "smooth" });
  } else if (targetViewElement && !isBackNavigation && !isGradeView) {
    // For forward navigation (or back not to grade view), scroll to the top of the target view element
    // Give a slight delay to allow DOM rendering
    setTimeout(() => {
      // Double check the view is still active before scrolling
      if (targetViewElement.classList.contains("active")) {
        const headerHeight = dom.header ? dom.header.offsetHeight : 65;
        const offsetPosition = targetViewElement.offsetTop - headerHeight - 20;
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: "smooth",
        });
      }
    }, 50); // Short delay
  }

  // Update any titles that depend on the current view/state
  updateDynamicTitles();
}

// --- Page Navigation ---
export function navigateToPage(pageId) {
  if (!pageId) return;

  const normalizedPageId =
    typeof pageId === "string" ? pageId.toLowerCase().trim() : pageId;

  if (normalizedPageId === "login") {
    console.log(
      "navigateToPage called with 'login'. Redirecting to showLoginPopup()."
    );
    showLoginPopup();
    return;
  }

  // Prevent navigation if already on the target page (unless it's home, then scroll to top)
  // Use normalizedPageId for comparison here as well, though state.currentPage should ideally be normalized too.
  if (normalizedPageId === state.currentPage) {
    if (normalizedPageId === "home") {
      // Use normalizedPageId for consistency
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      console.log(`Already on page: ${normalizedPageId}`); // Use normalizedPageId
    }
    return;
  }

  const targetPage = document.getElementById(normalizedPageId); // Use normalizedPageId
  if (!targetPage) {
    console.error(`Target page #${normalizedPageId} not found.`);
    return;
  }

  console.log(`Navigating to page: ${normalizedPageId}`);

  // Update state first
  state.currentPage = normalizedPageId; // Store normalized pageId in state

  // Hide all pages and show the target page
  dom.pages.forEach((page) =>
    page.classList.toggle("active", page.id === normalizedPageId)
  ); // Use normalizedPageId

  // Update nav button active state
  // Note: Home page navigation often doesn't have an explicit nav button that stays 'active'.
  // Adjust this logic if the home button should also be active.
  // Ensure comparison with btn.dataset.page is also normalized if necessary, or that data-page attributes are consistently lowercase.
  dom.navButtons.forEach((btn) => {
    const btnPage = btn.dataset.page
      ? btn.dataset.page.toLowerCase().trim()
      : null;
    btn.classList.toggle("active", btnPage === normalizedPageId);
  });

  // Scroll to top when navigating to a new page
  window.scrollTo({ top: 0, behavior: "auto" }); // Use auto for immediate scroll on page change

  // Reset section view ONLY if navigating TO Library or Videos
  if (normalizedPageId === "library" || normalizedPageId === "videos") {
    resetSectionView(normalizedPageId); // Use normalizedPageId
  }

  // Ensure welcome message in chat if navigating TO chat and it's empty
  // This import creates a dependency on chat.js
  if (
    normalizedPageId === "chat" &&
    dom.chatMessages &&
    dom.chatMessages.children.length === 0
  ) {
    // Use normalizedPageId
    addChatWelcomeMessage();
  }

  // Apply translations to elements on the newly activated page if necessary
  // (Although applyTranslations is called on lang switch and init, this can catch elements
  // that might have been added or changed display state during navigation).
  applyTranslations();
}
// --- Reset Section View to Initial State ---
// This function needs to be in commonRendering or passed in
// Moving it to commonRendering.js to avoid circular dependency if Navigation calls it.

// Function to reset a specific section (Library or Videos) back to its grade selection view.
// This function needs to be exported from commonRendering.js
/*
export function resetSectionView(pageId) {
    let sectionState, sectionElement, gradeViewId, gradeGrid;

    if (pageId === 'library') {
        sectionState = state.libraryState;
        sectionElement = dom.libraryPage;
        gradeViewId = 'libraryGradeSelectionView';
        gradeGrid = dom.libraryGradeGrid; // Assuming libraryGradeGrid is in domCache
    } else if (pageId === 'videos') {
        sectionState = state.videoState;
        sectionElement = dom.videosPage;
        gradeViewId = 'videoGradeSelectionView';
        gradeGrid = dom.videoGradeGrid; // Assuming videoGradeGrid is in domCache
    } else {
        return; // Only 'library' and 'videos' sections can be reset this way
    }

    console.log(`Resetting section view: ${pageId}`);

    // Reset the state for the specific section
    sectionState.selectedGrade = null;
    sectionState.selectedResourceType = null;
    sectionState.selectedSubject = null;
    sectionState.selectedVideoUnit = null; // For videos
    sectionState.currentSearch = ''; // For library search
    sectionState.selectedYearFilter = 'all'; // For library filter

    // Reset DOM elements for the section (clear grids, inputs, etc.)
    if (sectionElement) {
        const rtg = sectionElement.querySelector('.resource-type-grid');
        const sg = sectionElement.querySelector('.subject-grid');
        const ug = sectionElement.querySelector('.unit-grid'); // For videos
        const ri = sectionElement.querySelector('.resource-items'); // For library list
        const vl = sectionElement.querySelector('.video-grid'); // For videos list

        if (rtg) rtg.innerHTML = '';
        if (sg) sg.innerHTML = '';
        if (ug) ug.innerHTML = '';
        if (ri) ri.innerHTML = '';
        if (vl) vl.innerHTML = '';

        // Reset search input and status
        if (pageId === 'library') {
            if (dom.librarySearchInput) dom.librarySearchInput.value = '';
            if (dom.librarySearchStatus) dom.librarySearchStatus.textContent = '';
            // Reset year filter dropdown
            if (dom.libraryYearFilter) dom.libraryYearFilter.value = 'all';
        }
    }

    // Switch back to the initial grade selection view
    if (sectionElement && gradeViewId) {
        switchActiveView(sectionElement, gradeViewId, true); // Use true for back navigation scroll behavior
    }

    // Repopulate the grade grid if it was cleared (or ensure it is populated)
    if (gradeGrid && gradeGrid.children.length === 0) {
        populateGradeGrid(gradeGrid); // Needs populateGradeGrid from commonRendering
    }

    // Update titles after state and view reset
    updateDynamicTitles();
}
*/
// The resetSectionView function is moved to commonRendering.js
