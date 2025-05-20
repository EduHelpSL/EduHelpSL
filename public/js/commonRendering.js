// --- Common Rendering Functions (used by Library and Videos) ---

import { dom } from "./domCache.js";
import { state } from "./state.js";
import { config, getSubjectDataForGrade } from "./config.js";
import { getTranslation } from "./translation.js";
import { switchActiveView } from "./navigation.js"; // Assuming switchActiveView is here or imported

// Placeholder functions that will be set during initialization via setRenderingFunctions.
// These are declared with `let` so their references can be updated.
let populateYearFilter = () => console.warn("populateYearFilter function not yet set.");
let renderResourceList = () => console.warn("renderResourceList function not yet set.");
let renderUnitGrid = () => console.warn("renderUnitGrid function not yet set.");
let renderVideoList = () => console.warn("renderVideoList function not yet set.");

/**
 * Sets the references to the rendering functions from other modules (library.js, videos.js).
 * This is used to resolve circular dependencies where rendering functions in commonRendering
 * call functions defined in section-specific files (like library.js or videos.js).
 * This function is called during the main application initialization.
 * @param {object} libFuncs Object containing library rendering functions (populateYearFilter, renderResourceList).
 * @param {object} videoFuncs Object containing video rendering functions (renderUnitGrid, renderVideoList).
 */
export function setRenderingFunctions(libFuncs, videoFuncs) {
    // Assign the imported functions to the local `let` variables
    populateYearFilter = libFuncs.populateYearFilter;
    renderResourceList = libFuncs.renderResourceList;
    renderUnitGrid = videoFuncs.renderUnitGrid;
    renderVideoList = videoFuncs.renderVideoList;
    console.log("Dynamic rendering functions set in commonRendering.");
}

/**
 * Populates a grade grid element with buttons for each grade (1-13).
 * @param {HTMLElement} gridElement The DOM element to populate.
 */
export function populateGradeGrid(gridElement) {
    if (!gridElement) return;
    gridElement.innerHTML = ''; // Clear existing content
    const t = state.translations; // Get current translations
    const frag = document.createDocumentFragment(); // Use fragment for performance

    for (let i = 1; i <= 13; i++) {
        const btn = document.createElement('button');
        btn.className = 'grade-btn';
        btn.dataset.grade = i; // Store grade in data attribute
        const gk = `grade${i}`;
        btn.dataset.langKey = gk; // Add lang key for translation
        btn.textContent = t[gk] || `Grade ${i}`; // Use translation or fallback
        frag.appendChild(btn);
    }

    gridElement.appendChild(frag);
    console.log("Grade grid populated.");
}

/**
 * Renders a subject grid based on the selected grade.
 * @param {HTMLElement} gridElement The DOM element to render the subjects into.
 * @param {string|number} grade The selected grade (e.g., 'grade1').
 * @param {string} [resourceType] The selected resource type ('books', 'papers', etc.) - optional, for Library.
 */
export function renderSubjectGrid(gridElement, grade, resourceType) {
    if (!gridElement || !grade) return;
    gridElement.innerHTML = ''; // Clear existing content
    const gradeData = getSubjectDataForGrade(grade); // Get subject data from config
    const t = state.translations; // Get current translations

    // Reset class and add layout class if needed based on grade data
    gridElement.className = 'subject-grid';
    if (gradeData.layout === 'vertical') {
        gridElement.classList.add('subject-grid-vertical');
    }

    const frag = document.createDocumentFragment();
    let hasSubjects = false;
    let subjectsToRender = new Set(); // Use a Set to automatically handle uniqueness
    let layout = gradeData.layout; // Default layout from getSubjectDataForGrade

    // Determine which subjects to render based on whether a resource type is provided
    if (resourceType) {
        // Library section: Filter subjects based on grade AND resource type
        const resourcesOfType = config.fakeLibraryData[grade]?.[resourceType] || []; // Use optional chaining
        // Extract unique subjects from the resources of the selected type
 resourcesOfType.forEach(item => {
 if (item.subject) subjectsToRender.add(item.subject);
 });
    } else {
        // Videos section or old logic: Render all subjects for the grade from getSubjectDataForGrade
        // This part relies on the structure of getSubjectDataForGrade which might include categories.
         console.log(`Rendering all subjects for Grade ${grade} (no resource type filter).`);
    }
    // Helper function to create and append a subject button
    const renderBtn = (sk) => {
        hasSubjects = true;
        const btn = document.createElement('button');
        btn.className = 'subject-btn';
        btn.dataset.subject = sk; // Store subject key
        const lk = `subject${sk.charAt(0).toUpperCase() + sk.slice(1)}`; // Construct translation key
        btn.dataset.langKey = lk; // Add lang key
        // Fallback text: split camelCase and capitalize first letter
        const fallbackText = sk.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
        btn.textContent = t[lk] || fallbackText; // Use translation or fallback
        frag.appendChild(btn);
    };

    // Render the determined list of subjects
 if (subjectsToRender.size > 0) {
 // Sort and render the unique subjects
 Array.from(subjectsToRender).sort().forEach(renderBtn);
 hasSubjects = true;
    } else if (!resourceType) {
         // If no resourceType is provided (likely Videos section), use the old rendering logic
 subjectsToRender = new Set(); // Clear set if falling back
         // based on getSubjectDataForGrade which might have categories.
         console.log("Using getSubjectDataForGrade structure for rendering subjects.");
        if (gradeData.categories) {
            Object.values(gradeData.categories).forEach(cat => {
                if (cat.subjects && cat.subjects.length > 0) {
                    // Add category header
                    const hdr = document.createElement('div');
                    hdr.className = 'subject-category-header';
                    hdr.dataset.langKey = cat.titleKey; // Add lang key for category title
                    hdr.textContent = t[cat.titleKey] || cat.titleKey; // Use translation or key
                    frag.appendChild(hdr);
                    // Add buttons for subjects in this category
                    cat.subjects.forEach(renderBtn);
                }
            });
             hasSubjects = frag.children.length > 0; // Check if any subjects were added via categories
        } else if (gradeData.subjects && gradeData.subjects.length > 0) {
            // Add buttons for subjects in a simple list structure
            gradeData.subjects.forEach(renderBtn);
            hasSubjects = true; // Subjects were added
        }
    }

     // Re-check hasSubjects if rendering from subjectsToRender array
     if (resourceType && subjectsToRender.length > 0) hasSubjects = true;
    // Display a message if no subjects are found for the grade
    if (!hasSubjects) {
        const noRes = document.createElement('p');
        noRes.className = 'no-results';
        noRes.textContent = t['noSubjectsFound'] || 'No subjects found for this grade.';
        frag.appendChild(noRes);
    }

    gridElement.appendChild(frag);
    console.log(`Subject grid rendered for Grade ${grade}.`);
}

/**
 * Resets a specific section (Library or Videos) back to its initial state (Grade Selection View).
 * Called when navigating to the section or using a back button that leads to the root view.
 * @param {string} pageId The ID of the page/section ('library' or 'videos').
 */
export function resetSectionView(pageId) {
    let sectionState, sectionElement, gradeViewId, gradeGrid;

    // Determine which section is being reset and get relevant DOM elements and state slice
    if (pageId === 'library') {
        sectionState = state.libraryState;
        sectionElement = dom.libraryPage;
        gradeViewId = 'libraryGradeSelectionView';
        gradeGrid = dom.libraryGradeGrid;
    } else if (pageId === 'videos') {
        sectionState = state.videoState;
        sectionElement = dom.videosPage;
        gradeViewId = 'videoGradeSelectionView';
        gradeGrid = dom.videoGradeGrid;
    } else {
        console.warn(`Attempted to reset unknown section: ${pageId}`);
        return; // Exit if the pageId is not recognized
    }

    console.log(`Resetting section view: ${pageId}`);

    // Reset the state for the specific section to its initial values
    sectionState.selectedGrade = null;
    sectionState.selectedResourceType = null; // Library specific
    sectionState.selectedSubject = null;
    sectionState.selectedVideoUnit = null; // Videos specific
    sectionState.currentSearch = ''; // Library specific
    sectionState.selectedYearFilter = 'all'; // Library specific

    // Reset UI elements within the section (clear grids, inputs, etc.)
    if (sectionElement) {
        const rtg = sectionElement.querySelector('.resource-type-grid'); // Library
        const sg = sectionElement.querySelector('.subject-grid');
        const ug = sectionElement.querySelector('.unit-grid'); // Videos
        const ri = sectionElement.querySelector('.resource-items'); // Library List
        const vl = sectionElement.querySelector('.video-grid'); // Videos List

        // Clear the inner HTML of the grids and lists
        if (rtg) rtg.innerHTML = '';
        if (sg) sg.innerHTML = '';
        if (ug) ug.innerHTML = '';
        if (ri) ri.innerHTML = '';
        if (vl) vl.innerHTML = '';

        // Reset search input, status, and year filter for the Library section
        if (pageId === 'library') {
            if (dom.librarySearchInput) dom.librarySearchInput.value = '';
            if (dom.librarySearchStatus) dom.librarySearchStatus.textContent = '';
            if (dom.libraryYearFilter) dom.libraryYearFilter.value = 'all';
             // Hide search and filter containers initially when resetting to grade view
             if (dom.librarySearchContainer) dom.librarySearchContainer.style.display = 'none';
             if (dom.libraryYearFilter && dom.libraryYearFilter.closest('.filter-container')) {
                dom.libraryYearFilter.closest('.filter-container').style.display = 'none';
             }
        }
    }

    // Switch the active view within the section back to the initial grade selection view
    if (sectionElement && gradeViewId) {
        // Use `switchActiveView` to handle the view change and scrolling
        switchActiveView(sectionElement, gradeViewId, true); // The third argument `true` indicates back navigation
    }

    // Repopulate the grade grid if it's somehow empty after reset (should be populated on init)
    // This is a safeguard and might not be strictly necessary depending on init logic.
    if (gradeGrid && gradeGrid.children.length === 0) {
        populateGradeGrid(gradeGrid);
    }

    // Update titles after state and view reset
    // Note: updateDynamicTitles is called automatically by switchActiveView
    // updateDynamicTitles();
}

/**
 * Re-renders dynamic content sections that depend on translations or state changes.
 * This function is called by `applyTranslations` (on language switch) and `resetSectionView`.
 * It checks the currently active page and view and triggers the specific rendering function for that view.
 */
export function reRenderDynamicContent() {
    console.log("Checking dynamic content re-render...");
    // Ensure dom elements are cached before proceeding
    if (!dom.pages) { console.error("DOM not cached for re-render."); return; }

    // Find the currently active page element
    const activePage = Array.from(dom.pages).find(page => page.classList.contains('active'));
    if (!activePage) {
        console.warn("No active page found for re-render.");
        return;
    }

    // Find the currently active view element within the active page
    // Note: Home page might not have a specific nested .view with an ID, handle this case.
    const activeView = activePage.querySelector('.view.active');

    // Trigger re-rendering based on the ID of the active view
    switch (activeView?.id) { // Use optional chaining in case activeView is null
        case 'libraryGradeSelectionView':
            // Grade grids are populated on initialization and reset, no re-render needed here
            // populateGradeGrid(dom.libraryGradeGrid);
            break;
        case 'libraryResourceTypeView':
            // Resource type grid is populated on navigation, no re-render needed here
            // populateResourceTypeGrid();
            break;
        case 'librarySubjectSelectionView':
            // Subject grid depends on selected grade and current language
            if (dom.librarySubjectGrid && state.libraryState.selectedGrade) {
                renderSubjectGrid(dom.librarySubjectGrid, state.libraryState.selectedGrade, state.libraryState.selectedResourceType);
            }
            break;
        case 'libraryListView':
            // Library list depends on selected grade, type, subject, search, filter, and language.
            // Year filter options also depend on the subject and language.
            if (dom.libraryResourceItems && state.libraryState.selectedGrade && state.libraryState.selectedResourceType && state.libraryState.selectedSubject !== null) {
                 // Re-populate year filter options (as they are translatable)
                 populateYearFilter();
                 // Re-render resource list (for translated text and search highlights)
                 renderResourceList();
            }
            break;
        case 'videoGradeSelectionView':
             // Grade grids are populated on initialization and reset.
            // populateGradeGrid(dom.videoGradeGrid);
            break;
        case 'videoSubjectSelectionView':
            // Subject grid depends on selected grade and language.
            if (dom.videoSubjectGrid && state.videoState.selectedGrade) {
                 renderSubjectGrid(dom.videoSubjectGrid, state.videoState.selectedGrade);
             }
            break;
        case 'videoUnitSelectionView':
            // Unit grid depends on selected grade, subject, and language.
            if (dom.videoUnitGrid && state.videoState.selectedGrade && state.videoState.selectedSubject) {
                 renderUnitGrid();
             }
            break;
        case 'videoListView':
            // Video list depends on selected grade, subject, unit, and language.
            if (dom.videoListItems && state.videoState.selectedGrade && state.videoState.selectedSubject && state.videoState.selectedVideoUnit) {
                 renderVideoList();
             }
            break;
        // Handle cases for pages that might not have nested views (like the home page)
        // Check the activePage ID if activeView is null
        default:
            if (activePage.id === 'home') {
                 // Home page static content is handled by applyTranslations. No specific grid/list re-render here.
                 console.log("Home page active, no dynamic content re-render needed in commonRendering.");
            } else if (activePage.id === 'chat') {
                // Chat page. Messages are dynamic. Update typing indicator translation.
                 if (dom.typingIndicator) {
                      dom.typingIndicator.dataset.defaultText = state.translations['loadingText'] || 'AI is thinking...';
                      // If typing indicator is currently visible, update its text immediately
                      if (state.chatState.isBotTyping) {
                           dom.typingIndicator.textContent = dom.typingIndicator.dataset.defaultText;
                      }
                  }
                 console.log("Chat page active, updated typing indicator text.");
            } else {
                 console.log(`No specific re-render action defined for active view/page: ${activeView?.id || 'N/A'} on ${activePage?.id || 'N/A'}.`);
            }
            break;
    }
     console.log("Dynamic content re-render check complete.");
}

// --- Note on Circular Dependencies and Imports ---
// The functions populateYearFilter, renderResourceList (from library.js)
// and renderUnitGrid, renderVideoList (from videos.js) are called within
// reRenderDynamicContent and potentially resetSectionView.
// Importing them directly at the top would create a circular dependency if
// library.js or videos.js also import from commonRendering.js.
// The approach here is to declare `let` variables and use `setRenderingFunctions`
// to inject the actual function references from the modules that import commonRendering.js
// (which is typically main.js).
// Therefore, we DO NOT import these functions directly at the end of this file.
// The commented-out imports below are for illustrative purposes of what *would* be imported
// if we weren't using the injection pattern.

// import { populateResourceTypeGrid, populateYearFilter, renderResourceList } from './library.js'; // DO NOT UNCOMMENT
// import { renderUnitGrid, renderVideoList } from './videos.js'; // DO NOT UNCOMMENT