// --- Configuration ---
import { resourcesData } from "./resourcesData.js";

// Function to get unique subjects for a given grade range and type (e.g., 'textbook', 'video')
function getSubjectsForGradeRange(startGrade, endGrade, resourceType) {
  const subjects = new Set();
  resourcesData
    .filter((resource) => {
      const gradeNum = parseInt(resource.grade.replace("Grade ", ""), 10);
      return (
        gradeNum >= startGrade &&
        gradeNum <= endGrade &&
        resource.type === resourceType
      );
    })
    .forEach((resource) => subjects.add(resource.subject));
  // Convert Set to array of objects expected by rendering functions
  return Array.from(subjects).map((subject) => ({
    name: subject,
    id: subject.toLowerCase().replace(/\s+/g, "-"),
  }));
}

// Function to get unique subjects for a given grade range (all resource types)
function getAllSubjectsForGradeRange(startGrade, endGrade) {
  const subjects = new Set();
  resourcesData
    .filter((resource) => {
      const gradeNum = parseInt(resource.grade.replace("Grade ", ""), 10);
      return gradeNum >= startGrade && gradeNum <= endGrade;
    })
    .forEach((resource) => subjects.add(resource.subject));
  return Array.from(subjects).map((subject) => ({
    name: subject,
    id: subject.toLowerCase().replace(/\s+/g, "-"),
  }));
}

export const config = {
  geminiApiKey: null, // Will be fetched securely from backend
  geminiModel: "gemini-2.5-flash-preview-05-20",
  defaultLang: "en",
  cacheTranslations: true,
  maxChatHistory: 16,
  debounceDelay: 300,
  localStorageLangKey: "eduhelp_lang",
  maxFileSizeMB: 10,
  subjectsData: {
    primary: { layout: "grid", subjects: getAllSubjectsForGradeRange(1, 5) }, // Grades 1-5
    juniorSecondary: {
      layout: "grid",
      subjects: getAllSubjectsForGradeRange(6, 9),
    }, // Grades 6-9
    seniorSecondary: {
      layout: "grid",
      subjects: getAllSubjectsForGradeRange(10, 11),
    }, // Grades 10-11 (O/L)
    collegiate: {
      layout: "grid",
      subjects: getAllSubjectsForGradeRange(12, 13),
    }, // Grades 12-13 (A/L)
  },
  // It seems the video tab might need its own subject categorization or use the same one.
  // For now, let's assume it uses the same subject groupings as resources.
  // If video subjects are different, this will need adjustment.
  videoSubjectsData: {
    primary: {
      layout: "grid",
      subjects: getSubjectsForGradeRange(1, 5, "video"),
    },
    juniorSecondary: {
      layout: "grid",
      subjects: getSubjectsForGradeRange(6, 9, "video"),
    },
    seniorSecondary: {
      layout: "grid",
      subjects: getSubjectsForGradeRange(10, 11, "video"),
    },
    collegiate: {
      layout: "grid",
      subjects: getSubjectsForGradeRange(12, 13, "video"),
    },
  },
};

export function getSubjectDataForGrade(grade) {
  const g = parseInt(grade, 10);
  if (g >= 1 && g <= 5) return config.subjectsData.primary;
  if (g >= 6 && g <= 9) return config.subjectsData.juniorSecondary;
  if (g >= 10 && g <= 11) return config.subjectsData.seniorSecondary;
  if (g >= 12 && g <= 13) return config.subjectsData.collegiate;
  return { layout: "grid", subjects: [] };
}
