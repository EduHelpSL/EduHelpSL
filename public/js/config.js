import { resourcesData } from "./resourcesData.js";
import { getTranslation } from "./translation.js";

// Helper function to create subject objects
function createSubject(
  name,
  id = name.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "and")
) {
  return {
    name,
    id,
    langKey: `subject${name.replace(/\s+/g, "").replace(/&/g, "And")}`,
  };
}

export const config = {
  geminiApiKey: null, // Will be fetched securely from backend
  geminiModel: "gemini-2.5-flash-preview-05-20",
  defaultLang: "en",
  cacheTranslations: true,
  maxChatHistory: 16,
  debounceDelay: 100,
  localStorageLangKey: "eduhelp_lang",
  maxFileSizeMB: 10,
  subjectsData: {
    grades1to5: {
      layout: "list", // Full-width buttons
      titleKey: "grades1to5",
      subjects: [
        createSubject("Tamil"),
        createSubject("Religion"),
        createSubject("English"),
        createSubject("Mathematics"),
        createSubject("Environmental Studies"),
      ],
    },
    grades6to9: {
      layout: "grid", // Smaller buttons in a grid
      titleKey: "grades6to9",
      subjects: [
        createSubject("Tamil"),
        createSubject("Religion"),
        createSubject("Sinhala"),
        createSubject("English"),
        createSubject("Mathematics"),
        createSubject("Science"),
        createSubject("History"),
        createSubject("Geography"),
        createSubject("Civic Education"),
        createSubject("Practical & Tech Skills"),
        createSubject("ICT"),
        createSubject("Art"),
        createSubject("Music"),
        createSubject("Dance"),
        createSubject("Drama & Theatre"),
        createSubject("Health & Physical Ed."),
      ],
    },
    grades10to11: {
      layout: "categorized-grid",
      titleKey: "grades10to11",
      categories: [
        {
          titleKey: "compulsorySubjects",
          subjects: [
            createSubject("Tamil"),
            createSubject("Religion"),
            createSubject("English"),
            createSubject("Mathematics"),
            createSubject("Science"),
            createSubject("History"),
          ],
        },
        {
          titleKey: "optionalGroup1",
          subjects: [
            createSubject("Business & Accounting"),
            createSubject("Geography"),
            createSubject("Civic Education"),
            createSubject("Entrepreneurship"),
            createSubject("Sinhala"),
          ],
        },
        {
          titleKey: "optionalGroup2",
          subjects: [
            createSubject("Art"),
            createSubject("Music"),
            createSubject("Dance"),
            createSubject("Drama & Theatre"),
            createSubject("Tamil Literature"),
            createSubject("English Literature"),
          ],
        },
        {
          titleKey: "optionalGroup3",
          subjects: [
            createSubject("ICT"),
            createSubject("Agriculture & Food Tech"),
            createSubject("Home Economics"),
            createSubject("Health & Physical Ed."),
          ],
        },
      ],
    },
    grades12to13: {
      layout: "categorized-grid",
      titleKey: "grades12to13",
      categories: [
        {
          titleKey: "physicalScienceStream",
          subjects: [
            createSubject("Combined Mathematics"),
            createSubject("Physics"),
            createSubject("Chemistry"),
            createSubject("ICT"),
          ],
        },
        {
          titleKey: "biologicalScienceStream",
          subjects: [
            createSubject("Biology"),
            createSubject("Chemistry"),
            createSubject("Physics"),
            createSubject("Agricultural Science"),
          ],
        },
        {
          titleKey: "commerceStream",
          subjects: [
            createSubject("Accounting"),
            createSubject("Business Studies"),
            createSubject("Economics"),
            createSubject("Business Statistics"),
            createSubject("ICT"),
          ],
        },
        {
          titleKey: "artsStream",
          subjects: [
            createSubject("Languages"),
            createSubject("Tamil"),
            createSubject("Sinhala"),
            createSubject("English"),
            createSubject("Political Science"),
            createSubject("History"),
            createSubject("Geography"),
            createSubject("Logic & Scientific Method"),
            createSubject("Communication & Media"),
            createSubject("Art"),
            createSubject("Music"),
            createSubject("Dance"),
            createSubject("Drama & Theatre"),
            createSubject("Home Science"),
            createSubject("ICT"),
            createSubject("Tamil Literature"),
            createSubject("English Literature"),
          ],
        },
        {
          titleKey: "technologyStream",
          subjects: [
            createSubject("Engineering Technology"),
            createSubject("Science for Technology"),
            createSubject("Biosystems Technology"),
            createSubject("ICT"),
          ],
        },
      ],
    },
  },
  // Assuming video subjects follow the same structure for now.
  // videoSubjectsData will be assigned after config is initialized
};

// Assign videoSubjectsData after config is initialized to avoid ReferenceError
// Assuming video subjects follow the same structure for now.
// This can be customized if video content has different subject groupings.
config.videoSubjectsData = {
  grades1to5: { ...config.subjectsData.grades1to5 },
  grades6to9: { ...config.subjectsData.grades6to9 },
  grades10to11: { ...config.subjectsData.grades10to11 },
  grades12to13: { ...config.subjectsData.grades12to13 },
};

export function getSubjectDataForGrade(grade, section = "resources") {
  const g = parseInt(grade, 10);
  const sourceData =
    section === "videos" ? config.videoSubjectsData : config.subjectsData;

  if (g >= 1 && g <= 5) return sourceData.grades1to5;
  if (g >= 6 && g <= 9) return sourceData.grades6to9;
  if (g >= 10 && g <= 11) return sourceData.grades10to11;
  if (g >= 12 && g <= 13) return sourceData.grades12to13;
  return { layout: "grid", subjects: [], categories: [] }; // Return empty structure if no match
}
