// --- Library Functions ---

import { dom } from "./domCache.js";
import { state } from "./state.js";
import { config } from "./config.js";
import { getTranslation } from "./translation.js";
import { switchActiveView } from "./navigation.js";
import { debounce } from "./utils.js";
import { populateGradeGrid, renderSubjectGrid, resetSectionView as commonResetSectionView } from "./commonRendering.js";

/**
 * Populates the main grade filter dropdown (1-13).
 */
export function populateMainGradeFilter() {
    if (!dom.mainLibraryGradeFilter) return;
    const select = dom.mainLibraryGradeFilter;
    select.innerHTML = ''; // Clear existing

    // Add 'All Grades' option
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.dataset.langKey = 'filterGradeAll';
    allOption.textContent = getTranslation('filterGradeAll') || 'All Grades';
    select.appendChild(allOption);

    // Add grades 1-13
    for (let i = 1; i <= 13; i++) {
        const option = document.createElement('option');
        option.value = `grade${i}`;
        // Use a generic key or pattern if specific translations aren't needed per grade number in the filter
        option.textContent = `${getTranslation('gradePrefix') || 'Grade'} ${i}`;
        select.appendChild(option);
    }
    select.value = state.libraryState.mainSelectedGradeFilter || 'all'; // Restore state or default
    console.log("Main grade filter populated.");
}

/**
 * Populates the main year filter dropdown (2016-2025).
 */
export function populateMainYearFilter() {
    if (!dom.mainLibraryYearFilter) return;
    const select = dom.mainLibraryYearFilter;
    select.innerHTML = ''; // Clear existing
    const currentYear = new Date().getFullYear();
    const startYear = 2016;
    const endYear = Math.max(currentYear, 2025); // Go up to at least 2025 or current year

    // Add 'All Years' option
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.dataset.langKey = 'filterYearAll';
    allOption.textContent = getTranslation('filterYearAll') || 'All Years';
    select.appendChild(allOption);

    // Add years descending
    for (let year = endYear; year >= startYear; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        select.appendChild(option);
    }
    select.value = state.libraryState.mainSelectedYearFilter || 'all'; // Restore state or default
    console.log("Main year filter populated.");
}

/**
 * Populates the resource type grid in the Library section (standard navigation).
 */
export function populateResourceTypeGrid() {
    if (!dom.libraryResourceTypeGrid) return;
    dom.libraryResourceTypeGrid.innerHTML = '';
    const t = state.translations;
    const types = [
        { key: 'books', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H6V4h2v8l2.5-1.5L13 12V4h5v16z"/></svg>', langKey: 'resourceBooks' },
        { key: 'papers', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-2 16h-2v-2h2v2zm0-4h-2V9h2v5z"/></svg>', langKey: 'resourcePapers' },
        { key: 'other', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>', langKey: 'resourceOther' }
    ];

    const frag = document.createDocumentFragment();
    types.forEach(type => {
        const btn = document.createElement('button');
        btn.className = 'resource-type-btn';
        btn.dataset.resourceType = type.key;
        btn.innerHTML = `
            <div class="resource-icon">${type.icon}</div>
            <h3 data-lang-key="${type.langKey}">${t[type.langKey] || type.key}</h3>
        `;
        frag.appendChild(btn);
    });
    dom.libraryResourceTypeGrid.appendChild(frag);
}

/**
 * Populates the list view year filter based on available resources for the selected grade/type/subject.
 */
export function populateListViewYearFilter() {
    if (!dom.libraryYearFilter) return;
    const select = dom.libraryYearFilter;
    select.innerHTML = ''; // Clear
    const ls = state.libraryState;
    const t = state.translations;

    // Add 'All Years' option first
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.dataset.langKey = 'filterYearAll';
    allOption.textContent = t['filterYearAll'] || 'All Years';
    select.appendChild(allOption);

    // Only populate specific years if grade/type/subject are selected (standard navigation)
    if (ls.selectedGrade && ls.selectedResourceType && ls.selectedResourceType !== 'other' && ls.selectedSubject) {
        const gradeData = config.fakeLibraryData[ls.selectedGrade] || {};
        const resourcesOfType = gradeData[ls.selectedResourceType] || [];
        const resourcesForSubject = resourcesOfType.filter(item => item.subject === ls.selectedSubject);
        const years = [...new Set(resourcesForSubject.map(item => item.year).filter(year => year))].sort((a, b) => b - a);

        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            select.appendChild(option);
        });
    }
    // Set the value based on state, default to 'all'
    select.value = ls.selectedYearFilter || 'all';
    console.log("List view year filter populated/reset.");
}

/**
 * Renders the list of resources based EITHER on standard navigation OR main search criteria.
 */
export function renderResourceList() {
    const container = dom.libraryResourceItems;
    const ls = state.libraryState;
    const t = state.translations;

    if (!container) {
        console.error("Resource list container not found.");
        return;
    }
    container.innerHTML = ''; // Clear previous results
    if (dom.librarySearchStatus) dom.librarySearchStatus.textContent = ''; // Clear status
    if (dom.mainLibrarySearchStatus) dom.mainLibrarySearchStatus.textContent = ''; // Clear main status

    let filtered = [];
    let titleKey = 'libraryListTitleDefault'; // Default title key
    let searchTerm = '';
    let searchStatusEl = dom.librarySearchStatus; // Default status element
    let statusPrefix = 'searchStatus'; // Prefix for translation keys

    // --- Determine Filter Criteria and Source Data --- //
    if (ls.isMainSearchActive) {
        // MAIN SEARCH MODE
        console.log("Rendering resource list in MAIN SEARCH mode.");
        titleKey = 'searchResultsTitle'; // Title for search results
        searchTerm = ls.mainSearchTerm.trim().toLowerCase();
        searchStatusEl = dom.mainLibrarySearchStatus; // Use main status element
        statusPrefix = 'searchStatusMain'; // Use main search translation keys

        const gradeFilter = ls.mainSelectedGradeFilter;
        const yearFilter = ls.mainSelectedYearFilter;
        const termFilter = ls.mainSelectedTermFilter;
        const typeFilter = ls.mainSelectedTypeFilter;

        // Iterate through ALL data
        Object.keys(config.fakeLibraryData).forEach(gradeKey => {
            // Filter by Grade?
            if (gradeFilter !== 'all' && gradeKey !== gradeFilter) return;

            const gradeData = config.fakeLibraryData[gradeKey] || {};
            Object.keys(gradeData).forEach(typeKey => {
                // Filter by Type?
                if (typeFilter !== 'all' && typeKey !== typeFilter) return;

                const resourcesOfType = gradeData[typeKey] || [];
                resourcesOfType.forEach(item => {
                    // Filter by Year?
                    if (yearFilter !== 'all' && (!item.year || item.year != yearFilter)) return;
                    // Filter by Term?
                    if (termFilter !== 'all' && (!item.term || item.term != termFilter)) return;
                    // Filter by Search Term?
                    if (searchTerm && !item.title.toLowerCase().includes(searchTerm)) return;

                    // If all filters pass, add the item (add grade/type info for context)
                    filtered.push({ ...item, sourceGrade: gradeKey, sourceType: typeKey });
                });
            });
        });

        // Hide list-view specific controls when main search is active
        if (dom.libraryListSearchContainer) dom.libraryListSearchContainer.style.display = 'none';

    } else {
        // STANDARD NAVIGATION MODE
        console.log("Rendering resource list in STANDARD NAVIGATION mode.");
        searchTerm = ls.currentSearch.trim().toLowerCase();
        searchStatusEl = dom.librarySearchStatus;
        statusPrefix = 'searchStatus';

        // Basic validation for standard navigation
        if (!ls.selectedGrade || !ls.selectedResourceType || (ls.selectedResourceType !== 'other' && !ls.selectedSubject)) {
             container.innerHTML = `<p class="no-results">${t['errorGeneric'] || 'Selection incomplete.'}</p>`;
             console.warn("Standard navigation selection incomplete for rendering list.");
              // Show list-view controls if they exist
            if (dom.libraryListSearchContainer) dom.libraryListSearchContainer.style.display = (ls.selectedResourceType === 'other') ? 'none' : 'flex';
             return;
        }

        const gradeData = config.fakeLibraryData[ls.selectedGrade] || {};
        const resourcesOfType = gradeData[ls.selectedResourceType] || [];
        const selectedYear = ls.selectedYearFilter;

        filtered = resourcesOfType.filter(item =>
            (ls.selectedResourceType === 'other' || item.subject === ls.selectedSubject) &&
            (!searchTerm || item.title.toLowerCase().includes(searchTerm)) &&
            (selectedYear === 'all' || (item.year && item.year == selectedYear))
        );

        // Set title based on standard navigation
        const gradeName = ls.selectedGrade ? `${t['gradePrefix'] || 'Grade'} ${ls.selectedGrade.replace('grade', '')}` : '';
        const typeName = ls.selectedResourceType ? t[`resource${ls.selectedResourceType.charAt(0).toUpperCase() + ls.selectedResourceType.slice(1)}`] || ls.selectedResourceType : '';
        const subjectName = ls.selectedSubject && ls.selectedResourceType !== 'other' ? ls.selectedSubject : ''; // Subject name might need translation lookup if not simple strings
        titleKey = `${gradeName} ${typeName}${subjectName ? ' - ' + subjectName : ''}`; // Construct title string

        // Show/hide list-view specific controls
        if (dom.libraryListSearchContainer) {
            dom.libraryListSearchContainer.style.display = (ls.selectedResourceType === 'other') ? 'none' : 'flex';
        }
    }

    // --- Update Title --- //
    if (dom.libraryListTitle) {
        dom.libraryListTitle.textContent = t[titleKey] || titleKey; // Use translation or the generated/default string
        // Add data-lang-key ONLY if it's a direct translation key
        if (t[titleKey]) {
            dom.libraryListTitle.dataset.langKey = titleKey;
        } else {
            delete dom.libraryListTitle.dataset.langKey;
        }
    }

    // --- Render Items --- //
    const fragment = document.createDocumentFragment();
    if (filtered.length === 0) {
        const noRes = document.createElement('p');
        noRes.className = 'no-results';
        noRes.textContent = t['noResultsFound'] || 'No items found.';
        fragment.appendChild(noRes);
        if (searchStatusEl && searchTerm) {
             const statusTextKey = `${statusPrefix}None`;
             const statusText = t[statusTextKey] || '0 results found for "{term}".';
             searchStatusEl.textContent = statusText.replace('{term}', searchTerm);
        }
    } else {
        filtered.forEach(item => {
            const div = document.createElement('div');
            div.className = 'resource-item';
            div.dataset.id = item.id;
            if (item.year) div.dataset.year = item.year;
            if (item.term) div.dataset.term = item.term;

            const title = document.createElement('h4');
            let titleHTML = item.title;
            // Add grade/type context if it was a main search
            if (ls.isMainSearchActive && item.sourceGrade && item.sourceType) {
                 const gradeText = `${t['gradePrefixShort'] || 'Gr.'} ${item.sourceGrade.replace('grade', '')}`;
                 const typeText = t[`resource${item.sourceType.charAt(0).toUpperCase() + item.sourceType.slice(1)}Short`] || item.sourceType;
                 titleHTML += ` <span class="context-chip">${gradeText} / ${typeText}</span>`;
            }

            // Highlight search term
            if (searchTerm) {
                const escapedSearchTerm = searchTerm.replace(/[-\/\^$*+?.()|[\]{}]/g, '\$&');
                const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
                // Apply highlight only to the original title part, not the context chip
                const originalTitle = item.title.replace(regex, '<span class="highlight">$1</span>');
                 titleHTML = originalTitle + (titleHTML.includes('context-chip') ? titleHTML.substring(titleHTML.indexOf('<span class="context-chip">')) : '');
            }
            title.innerHTML = titleHTML;

            const link = document.createElement('a');
            const isValidUrl = item.url && item.url !== '#';
            link.href = item.url || '#';
            if (!isValidUrl) {
                 link.style.opacity = '0.5';
                 link.style.cursor = 'not-allowed';
                 link.addEventListener('click', (e) => e.preventDefault());
            } else {
                 link.setAttribute('target', '_blank');
                 link.setAttribute('rel', 'noopener noreferrer');
                 if (item.url.toLowerCase().endsWith('.pdf')) {
                     link.setAttribute('download', item.name || '');
                 }
            }
            link.dataset.langKey = 'downloadAction';
            link.textContent = t['downloadAction'] || 'Download';

            div.appendChild(title);
            div.appendChild(link);
            fragment.appendChild(div);
        });

        if (searchStatusEl && (searchTerm || ls.selectedYearFilter !== 'all' || ls.isMainSearchActive)) {
            const count = filtered.length;
            const statusTextKey = count === 1 ? `${statusPrefix}One` : `${statusPrefix}Many`;
            const statusText = t[statusTextKey] || `${count} results found.`;
            searchStatusEl.textContent = statusText.replace('{count}', count).replace('{term}', searchTerm);
        }
    }
    container.appendChild(fragment);
    console.log(`Resource list rendered: ${filtered.length} items.`);
}

/**
 * Resets the library section to the initial grade selection view.
 */
export function resetLibrarySection() {
    console.log("Resetting Library Section...");
    const ls = state.libraryState;
    // Reset standard navigation state
    ls.selectedGrade = null;
    ls.selectedResourceType = null;
    ls.selectedSubject = null;
    ls.selectedYearFilter = 'all';
    ls.currentSearch = '';
    // Reset main search state
    ls.mainSearchTerm = '';
    ls.mainSelectedGradeFilter = 'all';
    ls.mainSelectedYearFilter = 'all';
    ls.mainSelectedTermFilter = 'all';
    ls.mainSelectedTypeFilter = 'all';
    ls.isMainSearchActive = false;

    // Reset UI elements
    if (dom.librarySearchInput) dom.librarySearchInput.value = '';
    if (dom.librarySearchStatus) dom.librarySearchStatus.textContent = '';
    if (dom.libraryYearFilter) dom.libraryYearFilter.value = 'all';
    if (dom.mainLibrarySearchInput) dom.mainLibrarySearchInput.value = '';
    if (dom.mainLibraryGradeFilter) dom.mainLibraryGradeFilter.value = 'all';
    if (dom.mainLibraryYearFilter) dom.mainLibraryYearFilter.value = 'all';
    if (dom.mainLibraryTermFilter) dom.mainLibraryTermFilter.value = 'all';
    if (dom.mainLibraryTypeFilter) dom.mainLibraryTypeFilter.value = 'all';
    if (dom.mainLibrarySearchStatus) dom.mainLibrarySearchStatus.textContent = '';

    // Use common reset logic for views and populate initial grid
    commonResetSectionView('library', dom.libraryPage, 'libraryGradeSelectionView', () => {
        populateGradeGrid(dom.libraryGradeGrid);
        // Ensure main filters are populated if they were cleared
        populateMainGradeFilter();
        populateMainYearFilter();
    });
}

// Add event listeners specific to the Library section
export function setupLibraryEventListeners() {
    // --- Event Delegation on Library Page --- //
    if (dom.libraryPage) {
        dom.libraryPage.addEventListener('click', (event) => {
            const target = event.target;
            const ls = state.libraryState;
            const gradeBtn = target.closest('.grade-btn');
            const typeBtn = target.closest('.resource-type-btn');
            const subjectBtn = target.closest('.subject-btn');
            const backBtn = target.closest('.back-btn');

            // --- Handle Main Search Button Click --- //
            if (target === dom.mainLibrarySearchBtn) {
                console.log("Main Library Search Button clicked");
                ls.mainSearchTerm = dom.mainLibrarySearchInput?.value || '';
                ls.mainSelectedGradeFilter = dom.mainLibraryGradeFilter?.value || 'all';
                ls.mainSelectedYearFilter = dom.mainLibraryYearFilter?.value || 'all';
                ls.mainSelectedTermFilter = dom.mainLibraryTermFilter?.value || 'all';
                ls.mainSelectedTypeFilter = dom.mainLibraryTypeFilter?.value || 'all';
                ls.isMainSearchActive = true;

                // Clear standard nav state as main search overrides it
                ls.selectedGrade = null;
                ls.selectedResourceType = null;
                ls.selectedSubject = null;
                ls.currentSearch = '';
                ls.selectedYearFilter = 'all';

                // Render results and switch view
                renderResourceList();
                switchActiveView(dom.libraryPage, 'libraryListView');
                // Set back button target for main search results
                if (dom.libraryListBackButton) dom.libraryListBackButton.dataset.targetView = 'libraryGradeSelectionView';
                return; // Prevent other handlers from firing
            }

            // --- Standard Navigation Handlers --- //

            // Handle Grade Selection
            if (gradeBtn && ls.activeViewId === 'libraryGradeSelectionView') {
                ls.isMainSearchActive = false; // Ensure main search is off
                ls.selectedGrade = gradeBtn.dataset.grade;
                ls.selectedResourceType = null; // Reset downstream state
                ls.selectedSubject = null;
                ls.selectedYearFilter = 'all';
                populateResourceTypeGrid();
                switchActiveView(dom.libraryPage, 'libraryResourceTypeView');
            }
            // Handle Resource Type Selection
            else if (typeBtn && ls.activeViewId === 'libraryResourceTypeView') {
                ls.isMainSearchActive = false;
                ls.selectedResourceType = typeBtn.dataset.resourceType;
                ls.selectedSubject = null;
                ls.selectedYearFilter = 'all';
                ls.currentSearch = '';
                if(dom.librarySearchInput) dom.librarySearchInput.value = '';
                if(dom.librarySearchStatus) dom.librarySearchStatus.textContent = '';

                if (ls.selectedResourceType === 'other') {
                    ls.selectedSubject = 'all'; // Use a placeholder
                    populateListViewYearFilter(); // Reset/clear list view filter
                    renderResourceList();
                    switchActiveView(dom.libraryPage, 'libraryListView');
                    if (dom.libraryListBackButton) dom.libraryListBackButton.dataset.targetView = 'libraryResourceTypeView';
                } else {
                    renderSubjectGrid(dom.librarySubjectGrid, ls.selectedGrade);
                    switchActiveView(dom.libraryPage, 'librarySubjectSelectionView');
                    // Back button target will be set when entering list view from subject view
                }
            }
            // Handle Subject Selection
            else if (subjectBtn && ls.activeViewId === 'librarySubjectSelectionView') {
                ls.isMainSearchActive = false;
                ls.selectedSubject = subjectBtn.dataset.subject;
                ls.currentSearch = '';
                ls.selectedYearFilter = 'all';
                if(dom.librarySearchInput) dom.librarySearchInput.value = '';
                if(dom.librarySearchStatus) dom.librarySearchStatus.textContent = '';

                populateListViewYearFilter(); // Populate list view filter based on selection
                renderResourceList();
                switchActiveView(dom.libraryPage, 'libraryListView');
                if (dom.libraryListBackButton) dom.libraryListBackButton.dataset.targetView = 'librarySubjectSelectionView';
            }
            // Handle Back Button within the library section
            else if (backBtn) {
                const targetViewId = backBtn.dataset.targetView;
                if (targetViewId) {
                    // Special handling when going back from list view IF main search was active
                    if (ls.activeViewId === 'libraryListView' && ls.isMainSearchActive) {
                        console.log("Back button pressed from Main Search Results");
                        ls.isMainSearchActive = false; // Turn off main search mode
                        // Optionally clear main search state & UI ? Or leave it populated?
                        // Let's clear the state for consistency
                        ls.mainSearchTerm = ''; if(dom.mainLibrarySearchInput) dom.mainLibrarySearchInput.value = '';
                        ls.mainSelectedGradeFilter = 'all'; if(dom.mainLibraryGradeFilter) dom.mainLibraryGradeFilter.value = 'all';
                        ls.mainSelectedYearFilter = 'all'; if(dom.mainLibraryYearFilter) dom.mainLibraryYearFilter.value = 'all';
                        ls.mainSelectedTermFilter = 'all'; if(dom.mainLibraryTermFilter) dom.mainLibraryTermFilter.value = 'all';
                        ls.mainSelectedTypeFilter = 'all'; if(dom.mainLibraryTypeFilter) dom.mainLibraryTypeFilter.value = 'all';
                        if(dom.mainLibrarySearchStatus) dom.mainLibrarySearchStatus.textContent = '';

                        // Ensure target is grade selection view
                        switchActiveView(dom.libraryPage, 'libraryGradeSelectionView', true);
                        return; // Exit early
                    }

                    // Standard back button logic (resetting state for the view being left)
                    if (ls.activeViewId === 'libraryListView') {
                         ls.currentSearch = ''; if(dom.librarySearchInput) dom.librarySearchInput.value = '';
                         ls.selectedYearFilter = 'all'; if(dom.libraryYearFilter) dom.libraryYearFilter.value = 'all';
                         if(dom.librarySearchStatus) dom.librarySearchStatus.textContent = '';
                     }
                     if (ls.activeViewId === 'librarySubjectSelectionView') {
                         ls.selectedSubject = null;
                     }
                      if (ls.activeViewId === 'libraryResourceTypeView') {
                         ls.selectedResourceType = null;
                     }
                    if (targetViewId === 'libraryGradeSelectionView') {
                        ls.selectedGrade = null; // Reset grade only when going back to grade selection
                    }

                    // Switch view
                    switchActiveView(dom.libraryPage, targetViewId, true);

                } else {
                    resetLibrarySection(); // Reset if back button has no target
                }
            }
        });
    } else { console.warn("Library page element not found for event listener setup."); }

    // --- Listeners for List View Controls (Search/Filter) --- //
    if (dom.librarySearchInput) {
        dom.librarySearchInput.addEventListener('input', debounce(() => {
            if (state.libraryState.activeViewId === 'libraryListView' && !state.libraryState.isMainSearchActive) {
                state.libraryState.currentSearch = dom.librarySearchInput.value;
                renderResourceList();
            }
        }, config.debounceDelay));
    } else { console.warn("Library list search input not found."); }

    if (dom.libraryYearFilter) {
        dom.libraryYearFilter.addEventListener('change', () => {
            if (state.libraryState.activeViewId === 'libraryListView' && !state.libraryState.isMainSearchActive) {
                state.libraryState.selectedYearFilter = dom.libraryYearFilter.value;
                renderResourceList();
            }
        });
    } else { console.warn("Library list year filter not found."); }

    // No listeners needed for main filters/search input here, they are read on button click.
}

// Make sure the reset function is exported if needed elsewhere, or keep it internal
