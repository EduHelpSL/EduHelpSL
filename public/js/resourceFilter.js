// resourceFilter.js

import { debounce } from "./utils.js";
import { getTranslation } from "./translation.js";
import { resourcesData as allResources } from "./resourcesData.js"; // Import the new centralized resource data

// currentFilters will store the active filter values
let currentFilters = {
  searchQuery: "",
  grade: "all",
  subject: "all",
  type: "all",
  year: "all",
  term: "all",
};

let resourceContainerElement = null;
let filterElements = {}; // To store references to DOM filter elements

/**
 * Initializes the resource filtering system.
 * @param {HTMLElement} container - The HTML element to render resources into.
 * @param {Object} filters - An object containing references to filter input DOM elements.
 *                         Example: { search: el, grade: el, subject: el, type: el, year: el, term: el }
 */
export function initializeResourceFilter(container, filters) {
  if (!(container instanceof HTMLElement)) {
    console.error(
      "InitializeResourceFilter: container must be a valid HTMLElement."
    );
    return;
  }
  resourceContainerElement = container;
  filterElements = filters;

  // Attach event listeners to filter inputs
  if (filterElements.search) {
    filterElements.search.addEventListener(
      "input",
      debounce((e) => {
        currentFilters.searchQuery = e.target.value.toLowerCase();
        // filterAndRenderResources(); // Removed: Will be triggered by search button
      }, 300)
    );
  }

  ["grade", "subject", "type", "year", "term"].forEach((filterKey) => {
    if (filterElements[filterKey]) {
      filterElements[filterKey].addEventListener("change", (e) => {
        currentFilters[filterKey] = e.target.value;
        // filterAndRenderResources(); // Removed: Will be triggered by search button
      });
    }
  });

  // Populate filters with data from allResources (now resourcesData)
  populateFilters(allResources, filterElements);

  // Initial render
  filterAndRenderResources();
  console.log(
    "Resource filter initialized with",
    allResources.length,
    "resources."
  );
}

/**
 * Filters resources based on current filter criteria and re-renders the list.
 */
export function filterAndRenderResources() {
  if (!resourceContainerElement) {
    console.warn("filterAndRenderResources: resourceContainerElement not set.");
    return;
  }

  let filtered = allResources.filter((resource) => {
    const searchMatch = currentFilters.searchQuery
      ? resource.title.toLowerCase().includes(currentFilters.searchQuery) ||
        (resource.tags &&
          resource.tags.some((tag) =>
            tag.toLowerCase().includes(currentFilters.searchQuery)
          ))
      : true;
    const gradeMatch =
      currentFilters.grade === "all" || resource.grade === currentFilters.grade;
    const subjectMatch =
      currentFilters.subject === "all" ||
      resource.subject.toLowerCase() === currentFilters.subject.toLowerCase(); // Case-insensitive subject match
    const typeMatch =
      currentFilters.type === "all" ||
      resource.type.toLowerCase() === currentFilters.type.toLowerCase(); // Case-insensitive type match
    const yearMatch =
      currentFilters.year === "all" ||
      String(resource.year) === currentFilters.year;
    // Term match: 'all' matches anything; specific term matches resource.term; or if filter is 'all' and resource term is 'N/A'
    const termMatch =
      currentFilters.term === "all" ||
      resource.term === currentFilters.term ||
      (currentFilters.term === "all" && resource.term === "N/A") || // Ensure 'All Terms' includes items with 'N/A'
      (resource.term === "N/A" && currentFilters.term !== "all" ? false : true); // If resource term is N/A, it should only match 'All Terms'

    return (
      searchMatch &&
      gradeMatch &&
      subjectMatch &&
      typeMatch &&
      yearMatch &&
      termMatch
    );
  });
  renderResources(filtered, resourceContainerElement, getTranslation);
}

/**
 * Renders the filtered list of resources to the specified container.
 * @param {Array<Object>} filteredResources - The resources to render.
 * @param {HTMLElement} container - The HTML element to render into.
 * @param {Function} getLangString - Function to get translated strings.
 */
function renderResources(filteredResources, container, getLangString) {
  container.innerHTML = ""; // Clear previous results

  if (filteredResources.length === 0) {
    container.innerHTML = `<p class="no-results">${
      getLangString
        ? getLangString("noResultsFound")
        : "No resources found matching your criteria."
    }</p>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  filteredResources.forEach((resource) => {
    const resourceItem = document.createElement("div");
    resourceItem.classList.add("resource-item");
    resourceItem.dataset.id = resource.id;

    const thumbnail = document.createElement("img");
    thumbnail.src =
      resource.thumbnail || "assets/media/placeholder_default.png";
    thumbnail.alt = resource.title;
    thumbnail.classList.add("resource-thumbnail");
    thumbnail.loading = "lazy";

    const infoDiv = document.createElement("div");
    infoDiv.classList.add("resource-info");

    const titleH4 = document.createElement("h4");
    titleH4.classList.add("resource-title");
    titleH4.textContent = resource.title;

    const createMetaP = (labelKey, value) => {
      const p = document.createElement("p");
      p.classList.add("resource-meta");
      const label = getLangString
        ? getLangString(labelKey)
        : labelKey.replace("filter", "").replace("Label", "");
      // For subject, type, term, try to get specific translation if available
      let displayValue = value;
      if (value && value !== "N/A") {
        // Standardize keys for translation lookup (e.g., subjectMaths, resourceTextbook, termTerm1)
        let translationLookupKey = "";
        if (labelKey === "filterSubjectLabel") {
          translationLookupKey = `subject${
            value.charAt(0).toUpperCase() + value.slice(1).replace(/\s+/g, "")
          }`;
        } else if (labelKey === "filterTypeLabel") {
          translationLookupKey = `resource${
            value.charAt(0).toUpperCase() + value.slice(1).replace(/\s+/g, "")
          }`;
        } else if (labelKey === "filterTermLabel") {
          translationLookupKey = value.replace(/\s+/g, "").toLowerCase(); // e.g. term1
        }
        if (translationLookupKey) {
          displayValue = getLangString(translationLookupKey, value); // Fallback to original value
        }
      }
      p.textContent = `${label}: ${displayValue}`;
      return p;
    };

    infoDiv.appendChild(titleH4);
    if (resource.type)
      infoDiv.appendChild(createMetaP("filterTypeLabel", resource.type));
    if (resource.grade)
      infoDiv.appendChild(createMetaP("filterGradeLabel", resource.grade));
    if (resource.subject)
      infoDiv.appendChild(createMetaP("filterSubjectLabel", resource.subject));
    if (resource.year)
      infoDiv.appendChild(
        createMetaP("filterYearLabel", String(resource.year))
      );
    if (resource.term && resource.term !== "N/A")
      infoDiv.appendChild(createMetaP("filterTermLabel", resource.term));

    const downloadLink = document.createElement("a");
    downloadLink.href = resource.downloadUrl || "#";
    downloadLink.classList.add("resource-link", "btn", "btn-primary"); // Added btn classes for styling
    downloadLink.textContent = getLangString
      ? getLangString("downloadAction")
      : "Download";
    downloadLink.target = "_blank"; // Open in new tab
    downloadLink.rel = "noopener noreferrer";

    // Configure download link behavior based on resource type and URL
    if (
      resource.downloadUrl &&
      resource.downloadUrl !== "#" &&
      resource.downloadUrl !== "undefined"
    ) {
      downloadLink.href = resource.downloadUrl;
      // For non-video types (like textbooks, papers) from Google Drive, set the download attribute
      if (
        resource.type !== "video" &&
        resource.downloadUrl.includes("drive.google.com/uc?export=download")
      ) {
        let filename = resource.title
          .replace(/[^a-z0-9_\-\s\(\)\.]/gi, "_")
          .replace(/\s+/g, "_");
        // Setting a sanitized title as the download filename is a good practice.
        // Google Drive's export=download link will often provide the correct Content-Disposition header,
        // but this attribute provides a fallback or user-friendly name.
        // Add a common extension if it helps, but Drive usually handles it.
        if (
          filename &&
          !filename.match(/\.(pdf|docx?|pptx?|xlsx?|zip|txt)$/i)
        ) {
          // if no obvious extension
          if (resource.type === "past papers" || resource.type === "textbook") {
            // filename += ".pdf"; // Example, but often not needed for Drive export links
          }
        }
        downloadLink.setAttribute("download", filename || "download");
      }
      // For video links (e.g., YouTube), or other non-direct-downloadable links,
      // target="_blank" (already set) is sufficient to open in a new tab.
      // No 'download' attribute should be set for these.
    } else {
      downloadLink.href = "#"; // Fallback for invalid/missing URL
      downloadLink.setAttribute("aria-disabled", "true");
      downloadLink.classList.add("disabled"); // Add a class for styling disabled links
      downloadLink.style.pointerEvents = "none";
      downloadLink.style.opacity = "0.5";
      downloadLink.textContent = getLangString
        ? getLangString("unavailableAction", "Unavailable")
        : "Unavailable";
    }

    infoDiv.appendChild(downloadLink);

    resourceItem.appendChild(thumbnail);
    resourceItem.appendChild(infoDiv);
    fragment.appendChild(resourceItem);
  });
  container.appendChild(fragment);
}

/**
 * Populates filter dropdowns with unique values from the resources.
 * @param {Array<Object>} resources - The array of all resource items.
 * @param {Object} filterElements - An object containing references to filter input DOM elements.
 */
export function populateFilters(resources, filters) {
  if (!Array.isArray(resources) || !filters) {
    console.warn("populateFilters: Invalid arguments.");
    return;
  }

  const getLang = (key, fallback) => getTranslation(key) || fallback;

  // Initialize sets for dynamic filters (subjects, types, terms)
  const uniqueValues = {
    subjects: new Set(),
    types: new Set(),
    terms: new Set(),
  };

  // Populate dynamic filters from resource data
  resources.forEach((resource) => {
    if (resource.subject) uniqueValues.subjects.add(resource.subject);
    if (resource.type) uniqueValues.types.add(resource.type);
    if (resource.term && resource.term !== "N/A")
      uniqueValues.terms.add(resource.term);
  });

  // Hardcode grade options 1-13
  const gradesSet = new Set();
  for (let i = 1; i <= 13; i++) {
    gradesSet.add(String(i));
  }

  // Hardcode year options 2016-2025
  const yearsSet = new Set();
  for (let i = 2016; i <= 2025; i++) {
    yearsSet.add(String(i));
  }

  const populateSelect = (
    selectElement,
    valuesSet,
    defaultOptionKey,
    labelPrefixKey
  ) => {
    if (!selectElement) return;
    const currentValue = selectElement.value; // Preserve current selection
    selectElement.innerHTML = ""; // Clear existing options

    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = getLang(defaultOptionKey, "All"); // e.g., "All Grades"
    selectElement.appendChild(allOption);

    let sortedValues = Array.from(valuesSet);
    // Sort years descending, grades numerically ascending, others alphabetically.
    if (selectElement === filters.year) {
      sortedValues.sort((a, b) => String(b).localeCompare(String(a)));
    } else if (selectElement === filters.grade) {
      sortedValues.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    } else {
      sortedValues.sort((a, b) => a.localeCompare(b));
    }

    sortedValues.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      let displayValue = value;
      // Attempt to translate specific subject/type/term values
      if (labelPrefixKey) {
        const translationKey = `${labelPrefixKey}${
          value.charAt(0).toUpperCase() + value.slice(1).replace(/\s+/g, "")
        }`;
        displayValue = getLang(translationKey, value);
      } else if (selectElement === filters.term && value !== "N/A") {
        displayValue = getLang(value.replace(/\s+/g, "").toLowerCase(), value);
      }
      // Grades and Years are displayed as their direct values (e.g., "1", "2024")

      option.textContent = displayValue;
      selectElement.appendChild(option);
    });

    // Restore previous selection if it's still valid
    if (
      Array.from(selectElement.options).some(
        (opt) => opt.value === currentValue
      )
    ) {
      selectElement.value = currentValue;
    }
  };

  // populateSelect(filters.grade, gradesSet, "filterGradeAll"); // Now hardcoded in HTML
  populateSelect(
    filters.subject,
    uniqueValues.subjects,
    "filterSubjectAll",
    "subject"
  );
  populateSelect(filters.type, uniqueValues.types, "filterTypeAll", "resource");
  // populateSelect(filters.year, yearsSet, "filterYearAll"); // Now hardcoded in HTML
  populateSelect(filters.term, uniqueValues.terms, "filterTermAll");

  console.log("Dynamic filters (Subject, Type, Term) populated. Grade/Year are hardcoded in HTML.");
}

// No longer exporting via window.EduHelp; using ES module exports at the top of functions.
