// --- Google Drive API Service ---

/**
 * Service for interacting with Google Drive API to fetch educational resources.
 * This service handles authentication, fetching files, and parsing metadata.
 */

import { getGDriveConfig } from "./apiService.js"; // Import secure API service

// Constants for API configuration
const DRIVE_API_ENDPOINT = "https://www.googleapis.com/drive/v3";

// API configuration will be fetched securely from backend
let API_KEY = null;
let FOLDER_ID = null;

/**
 * Initialize Google Drive configuration by fetching from secure backend
 */
async function initializeDriveConfig() {
  if (!API_KEY || !FOLDER_ID) {
    try {
      const config = await getGDriveConfig();
      API_KEY = config.apiKey;
      FOLDER_ID = config.folderId;
      console.log("Google Drive configuration loaded securely");
    } catch (error) {
      console.error("Failed to load Google Drive configuration:", error);
      throw new Error("Google Drive service unavailable");
    }
  }
}
/**
 * Helper function to list contents of a Google Drive folder.
 * @param {string} folderId - The ID of the folder to list.
 * @param {string|null} mimeTypeFilter - Optional. MimeType to filter by (e.g., 'application/vnd.google-apps.folder' or 'application/pdf').
 * @returns {Promise<Array>} Array of file/folder objects.
 */
async function listFolderContents(folderId, mimeTypeFilter = null) {
  // Ensure Drive configuration is initialized
  await initializeDriveConfig();

  const url = new URL(`${DRIVE_API_ENDPOINT}/files`);
  let query = `'${folderId}' in parents and trashed = false`;
  if (mimeTypeFilter) {
    query += ` and mimeType = '${mimeTypeFilter}'`;
  }

  const params = {
    q: query,
    fields: "files(id,name,mimeType,webContentLink,properties,parents)", // Added 'parents' for hierarchy info
    key: API_KEY,
  };

  Object.keys(params).forEach((key) =>
    url.searchParams.append(key, params[key])
  );

  const response = await fetch(url);
  if (!response.ok) {
    console.error(
      `Failed to list folder contents for ${folderId}. Status: ${response.status}, Query: ${query}`
    );
    throw new Error(
      `Failed to list folder contents for ${folderId}: ${response.statusText}`
    );
  }
  const data = await response.json();
  return data.files || [];
}

/**
 * Fetches all educational resources from the specified Google Drive folder,
 * navigating a structure: grade -> subject -> term -> type -> PDFs.
 * @returns {Promise<Array>} Array of file objects with metadata
 */
export async function fetchDriveResources() {
  try {
    // Initialize Drive configuration before fetching
    await initializeDriveConfig();

    const allPdfFiles = [];
    // Fetch top-level folders (expected to be grade folders like "grade1", "grade2", etc.)
    const gradeFolders = await listFolderContents(
      FOLDER_ID,
      "application/vnd.google-apps.folder"
    );

    for (const gradeFolder of gradeFolders) {
      const gradeName = gradeFolder.name;
      // Extract grade number, e.g., "grade1" -> "1", "Grade 13" -> "13"
      const gradeMatch = gradeName.match(/^(?:grade\s*)?(\d+)$/i);
      if (!gradeMatch || !gradeMatch[1]) {
        console.warn(
          `Skipping folder: ${gradeName} as it does not match expected grade format (e.g., 'gradeX' or 'X').`
        );
        continue;
      }
      const gradeNumber = gradeMatch[1];

      // Fetch subject folders within the grade folder
      const subjectFolders = await listFolderContents(
        gradeFolder.id,
        "application/vnd.google-apps.folder"
      );
      for (const subjectFolder of subjectFolders) {
        const subjectName = subjectFolder.name
          .toLowerCase()
          .replace(/\s+/g, "-"); // Normalize subject name

        // Fetch term folders within the subject folder
        const termFolders = await listFolderContents(
          subjectFolder.id,
          "application/vnd.google-apps.folder"
        );
        for (const termFolder of termFolders) {
          // Normalize term name: extract number from "Term X" or "X", otherwise normalize full name
          const termMatch = termFolder.name.match(/^(?:term\s*)?(\d+)$/i);
          const termValue = termMatch
            ? termMatch[1]
            : termFolder.name.toLowerCase().replace(/\s+/g, "-");

          // Fetch type folders (e.g., "textbooks", "past-papers") within the term folder
          const typeFolders = await listFolderContents(
            termFolder.id,
            "application/vnd.google-apps.folder"
          );
          for (const typeFolder of typeFolders) {
            const typeName = typeFolder.name.toLowerCase().replace(/\s+/g, "-"); // Normalize type name

            const validTypes = ["textbooks", "past-papers", "others"];
            if (!validTypes.includes(typeName)) {
              console.warn(
                `Skipping type folder: '${
                  typeFolder.name
                }' in Grade ${gradeNumber}/${subjectName}/${termValue} as it's not one of [${validTypes.join(
                  ", "
                )}].`
              );
              continue;
            }

            // Fetch PDF files from the type folder
            const pdfFiles = await listFolderContents(
              typeFolder.id,
              "application/pdf"
            );

            pdfFiles.forEach((file) => {
              // Attach derived grade, subject, term, and type information
              file.derivedGrade = gradeNumber;
              file.derivedSubject = subjectName;
              file.derivedTerm = termValue;
              file.derivedType = typeName;
            });
            allPdfFiles.push(...pdfFiles);
          }
        }
      }
    }
    return processFileData(allPdfFiles);
  } catch (error) {
    console.error("Error fetching Drive resources:", error);
    return []; // Return empty array on error
  }
}

/**
 * Processes the raw file data from Google Drive API into a structured format
 * that matches the application's expected data structure.
 * @param {Array} files - Raw file data from Google Drive API, expected to have derivedGrade, derivedSubject, derivedTerm, derivedType
 * @returns {Array} Processed file data
 */
function processFileData(files) {
  return files.map((file) => {
    const properties = file.properties || {}; // Custom metadata from Drive file properties

    // Prioritize grade, subject, term, and type derived from folder structure.
    // Fallback to file.properties if derived values are not present.
    // Default to "all" or "other" if no information is found.
    const grade = String(file.derivedGrade || properties.grade || "all");
    const subject = String(
      file.derivedSubject || properties.subject || "other"
    ).toLowerCase();
    const term = String(
      file.derivedTerm || properties.term || "other"
    ).toLowerCase();
    const type = String(
      file.derivedType || properties.type || "other"
    ).toLowerCase();

    return {
      id: file.id,
      title: file.name,
      subject: subject,
      grade: grade,
      type: type,
      term: term,
      year: properties.year ? parseInt(properties.year) : null, // Year still relies on custom properties or defaults
      url:
        file.webContentLink ||
        `https://drive.google.com/file/d/${file.id}/view`, // Standard view link
      mimeType: file.mimeType,
      // parents: file.parents // Optionally include for debugging
    };
  });
}

/**
 * Organizes the files by grade and resource type to match the structure
 * expected by the application (similar to the previous fakeLibraryData).
 * @param {Array} files - Processed file data
 * @returns {Object} Files organized by grade and resource type
 */
export function organizeFilesByGradeAndType(files) {
  const organized = {};

  // Initialize grades 1-13 with the new type structure
  // Grade keys will be strings like "1", "2", ..., "13"
  for (let i = 1; i <= 13; i++) {
    organized[String(i)] = {
      textbooks: [],
      "past-papers": [], // Key matches the user's specified "past-papers"
      others: [], // For any other types or uncategorized items
    };
  }

  files.forEach((file) => {
    const gradeKey = file.grade; // Should be a string like "1", "12", etc. from processFileData
    const typeKey = file.type.toLowerCase(); // e.g., "textbooks", "past-papers", "others"

    // Check if the gradeKey exists in our organized structure (1-13)
    if (organized.hasOwnProperty(gradeKey)) {
      // Check if the typeKey is one of the predefined categories for that grade
      if (organized[gradeKey].hasOwnProperty(typeKey)) {
        organized[gradeKey][typeKey].push(file);
      } else {
        // If typeKey is not "textbooks" or "past-papers", but grade is valid,
        // place it in the "others" category for that grade.
        organized[gradeKey].others.push(file);
        // console.warn(`File '${file.title}' with type '${typeKey}' in grade '${gradeKey}' categorized as 'others'.`);
      }
    } else {
      // console.warn(`File '${file.title}' with grade '${gradeKey}' cannot be categorized as grade is not 1-13.`);
      // Files with grade "all" or other non-numeric grades will be skipped unless handled explicitly.
    }
  });

  return organized;
}

/**
 * Filters resources based on search criteria.
 * @param {Array} resources - The resources to filter
 * @param {Object} criteria - The filter criteria
 * @returns {Array} Filtered resources
 */
export function filterResources(resources, criteria) {
  return resources.filter((resource) => {
    // Filter by grade
    if (criteria.grade !== "all" && resource.grade !== criteria.grade) {
      return false;
    }

    // Filter by subject
    if (criteria.subject !== "all" && resource.subject !== criteria.subject) {
      return false;
    }

    // Filter by term
    if (criteria.term !== "all" && resource.term !== criteria.term) {
      return false;
    }

    // Filter by year
    if (criteria.year !== "all" && resource.year !== parseInt(criteria.year)) {
      return false;
    }

    // Filter by type
    if (criteria.type !== "all" && resource.type !== criteria.type) {
      return false;
    }

    // Filter by search term
    if (
      criteria.searchTerm &&
      !resource.title.toLowerCase().includes(criteria.searchTerm.toLowerCase())
    ) {
      return false;
    }

    return true;
  });
}

/**
 * Gets a download URL for a Google Drive file.
 * @param {string} fileId - The ID of the file
 * @returns {string} The download URL
 */
export function getDownloadUrl(fileId) {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}
