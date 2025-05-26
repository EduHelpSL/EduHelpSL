// public/js/resourcesData.js

/**
 * @typedef {Object} Resource
 * @property {string} id - Unique identifier (e.g., "math-grade-10-algebra-worksheet-001")
 * @property {string} title - Display name (e.g., "Algebra Basics Worksheet")
 * @property {string} downloadUrl - Direct Google Drive download link or YouTube link for videos.
 * @property {string} grade - Educational grade level (e.g., "Grade 1" to "Grade 13")
 * @property {string} year - Academic year (e.g., "2025", "N/A" for videos if not applicable)
 * @property {string} term - Academic term (e.g., "Term 1", "Term 2", "Term 3", "N/A")
 * @property {string} type - Resource category (e.g., "textbook", "past papers", "others", "video")
 * @property {string} subject - Academic subject (e.g., "tamil", "maths", "science")
 * @property {string[]} tags - Keywords for filtering and searching (e.g., ["algebra", "equations"])
 * @property {string} [thumbnail] - Optional URL for a resource thumbnail image.
 */

/** @type {Resource[]} */
export const resourcesData = [
  // --- Grade 1 Resources ---
  {
    id: "1-tb-math-ta",
    title: "Grade 1 Maths Textbook (Tamil Medium)",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=FILE_ID_1_tb_math_ta",
    grade: "Grade 1",
    year: "2023",
    term: "N/A",
    type: "textbook",
    subject: "mathematics",
    tags: ["grade 1", "maths", "textbook", "tamil medium", "2023"],
    thumbnail: "assets/media/placeholder_textbook.png",
  },
  {
    id: "1-tb-env-en",
    title: "Grade 1 Environment Textbook (English Medium)",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=FILE_ID_1_tb_env_en",
    grade: "Grade 1",
    year: "2023",
    term: "N/A",
    type: "textbook",
    subject: "environmental studies",
    tags: ["grade 1", "environment", "textbook", "english medium", "2023"],
    thumbnail: "assets/media/placeholder_textbook.png",
  },
  {
    id: "1-tb-tamil-ta",
    title: "Grade 1 Tamil Textbook (Tamil Medium)",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=FILE_ID_1_tb_tamil_ta",
    grade: "Grade 1",
    year: "2023",
    term: "N/A",
    type: "textbook",
    subject: "tamil",
    tags: ["grade 1", "tamil", "textbook", "tamil medium", "2023"],
    thumbnail: "assets/media/placeholder_textbook.png",
  },
  {
    id: "1-pp-tamil-t1-23",
    title: "Grade 1 Tamil Term 1 Model Paper (2023)",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=FILE_ID_1_pp_tamil_t1_23", // Original had example_paper_1.pdf
    grade: "Grade 1",
    year: "2023",
    term: "Term 1",
    type: "past papers",
    subject: "tamil",
    tags: ["grade 1", "tamil", "past paper", "term 1", "2023"],
    thumbnail: "assets/media/placeholder_paper.png",
  },
  {
    id: "1-ot-activity-sheet",
    title: "Grade 1 General Activity Sheet",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=FILE_ID_1_ot_activity_sheet",
    grade: "Grade 1",
    year: "2022",
    term: "N/A",
    type: "others",
    subject: "general", // Mapped from 'all'
    tags: ["grade 1", "activity sheet", "general", "2022"],
    thumbnail: "assets/media/placeholder_notes.png",
  },

  // --- Grade 5 Resources ---
  {
    id: "5-tb-eng",
    title: "Grade 5 English Textbook",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=FILE_ID_5_tb_eng",
    grade: "Grade 5",
    year: "2023",
    term: "N/A",
    type: "textbook",
    subject: "english",
    tags: ["grade 5", "english", "textbook", "2023"],
    thumbnail: "assets/media/placeholder_textbook.png",
  },
  {
    id: "5-tb-env-ta",
    title: "Grade 5 Environment Textbook (Tamil Medium)",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=FILE_ID_5_tb_env_ta",
    grade: "Grade 5",
    year: "2023",
    term: "N/A",
    type: "textbook",
    subject: "environmental studies",
    tags: ["grade 5", "environment", "textbook", "tamil medium", "2023"],
    thumbnail: "assets/media/placeholder_textbook.png",
  },
  {
    id: "5-pp-scholarship-22-ta",
    title: "Grade 5 Scholarship Exam Paper (2022 - TA)",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=FILE_ID_5_pp_scholarship_22_ta", // Original had example_paper_5.pdf
    grade: "Grade 5",
    year: "2022",
    term: "N/A",
    type: "past papers",
    subject: "mathematics", // As per original data
    tags: [
      "grade 5",
      "scholarship",
      "past paper",
      "tamil medium",
      "2022",
      "mathematics",
    ],
    thumbnail: "assets/media/placeholder_paper.png",
  },
  {
    id: "5-pp-scholarship-22-en",
    title: "Grade 5 Scholarship Exam Paper (2022 - EN)",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=FILE_ID_5_pp_scholarship_22_en",
    grade: "Grade 5",
    year: "2022",
    term: "N/A",
    type: "past papers",
    subject: "environmental studies",
    tags: [
      "grade 5",
      "scholarship",
      "past paper",
      "english medium",
      "2022",
      "environmental studies",
    ],
    thumbnail: "assets/media/placeholder_paper.png",
  },
  {
    id: "5-pp-env-t2-22-en",
    title: "Grade 5 Environment Term 2 Paper (2022 - EN)",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=FILE_ID_5_pp_env_t2_22_en",
    grade: "Grade 5",
    year: "2022",
    term: "Term 2",
    type: "past papers",
    subject: "environmental studies",
    tags: [
      "grade 5",
      "environment",
      "past paper",
      "term 2",
      "english medium",
      "2022",
    ],
    thumbnail: "assets/media/placeholder_paper.png",
  },
  {
    id: "5-pp-math-t1-23-ta",
    title: "Grade 5 Maths Term 1 Paper (2023 - TA)",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=FILE_ID_5_pp_math_t1_23_ta",
    grade: "Grade 5",
    year: "2023",
    term: "Term 1",
    type: "past papers",
    subject: "mathematics",
    tags: ["grade 5", "maths", "past paper", "term 1", "tamil medium", "2023"],
    thumbnail: "assets/media/placeholder_paper.png",
  },
  {
    id: "5-ot-env-act",
    title: "Grade 5 Environmental Activity Sheet (EN/TA)",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=FILE_ID_5_ot_env_act",
    grade: "Grade 5",
    year: "2021",
    term: "N/A",
    type: "others",
    subject: "general", // Mapped from 'all'
    tags: [
      "grade 5",
      "activity sheet",
      "environment",
      "english medium",
      "tamil medium",
      "2021",
    ],
    thumbnail: "assets/media/placeholder_notes.png",
  },

  // --- Grade 7 Resources ---
  {
    id: "7-tb-science-en",
    title: "Grade 7 Science Textbook (English Medium)",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=FILE_ID_7_tb_science_en",
    grade: "Grade 7",
    year: "2023",
    term: "N/A",
    type: "textbook",
    subject: "science",
    tags: ["grade 7", "science", "textbook", "english medium", "2023"],
    thumbnail: "assets/media/placeholder_textbook.png",
  },
  {
    id: "7-tb-art-en",
    title: "Grade 7 Art Textbook (English Medium)",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=FILE_ID_7_tb_art_en",
    grade: "Grade 7",
    year: "2023",
    term: "N/A",
    type: "textbook",
    subject: "art",
    tags: ["grade 7", "art", "textbook", "english medium", "2023"],
    thumbnail: "assets/media/placeholder_textbook.png",
  },
  {
    id: "7-pp-math-t1-23-ta",
    title: "Grade 7 Maths Term 1 Paper (2023 - TA)",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=FILE_ID_7_pp_math_t1_23_ta",
    grade: "Grade 7",
    year: "2023",
    term: "Term 1",
    type: "past papers",
    subject: "mathematics",
    tags: ["grade 7", "maths", "past paper", "term 1", "tamil medium", "2023"],
    thumbnail: "assets/media/placeholder_paper.png",
  },
  {
    id: "7-pp-science-t2-22-en",
    title: "Grade 7 Science Term 2 Paper (2022 - EN)",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=FILE_ID_7_pp_science_t2_22_en",
    grade: "Grade 7",
    year: "2022",
    term: "Term 2",
    type: "past papers",
    subject: "science",
    tags: [
      "grade 7",
      "science",
      "past paper",
      "term 2",
      "english medium",
      "2022",
    ],
    thumbnail: "assets/media/placeholder_paper.png",
  },
  {
    id: "7-pp-history-t1-23-ta",
    title: "Grade 7 History Term 1 Paper (2023 - TA)",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=FILE_ID_7_pp_history_t1_23_ta",
    grade: "Grade 7",
    year: "2023",
    term: "Term 1",
    type: "past papers",
    subject: "history",
    tags: [
      "grade 7",
      "history",
      "past paper",
      "term 1",
      "tamil medium",
      "2023",
    ],
    thumbnail: "assets/media/placeholder_paper.png",
  },
  {
    id: "7-ot-geo-map",
    title: "Grade 7 Geography Map Pack",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=FILE_ID_7_ot_geo_map",
    grade: "Grade 7",
    year: "2023",
    term: "N/A",
    type: "others",
    subject: "geography", // Mapped from 'all' but title suggests geography
    tags: ["grade 7", "geography", "map pack", "2023"],
    thumbnail: "assets/media/placeholder_notes.png",
  },
  {
    id: "v7s1-cells-intro",
    title: "Introduction to Cells (English) - Video",
    downloadUrl: "https://www.youtube.com/watch?v=8IlzKri08kk",
    grade: "Grade 7",
    year: "N/A",
    term: "N/A",
    type: "video",
    subject: "science",
    tags: ["grade 7", "science", "cells", "biology", "video", "english"],
    thumbnail: "assets/media/placeholder_video.png",
  },
  {
    id: "v7s2-cell-parts-tamil",
    title: "Parts of a Cell (Tamil) - Video",
    downloadUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    grade: "Grade 7",
    year: "N/A",
    term: "N/A",
    type: "video",
    subject: "science",
    tags: ["grade 7", "science", "cells", "biology", "video", "tamil"],
    thumbnail: "assets/media/placeholder_video.png",
  },
  {
    id: "v7s3-states-of-matter",
    title: "States of Matter (English) - Video",
    downloadUrl: "https://www.youtube.com/watch?v=g2Z91JEH1Y",
    grade: "Grade 7",
    year: "N/A",
    term: "N/A",
    type: "video",
    subject: "science",
    tags: [
      "grade 7",
      "science",
      "matter",
      "physics",
      "chemistry",
      "video",
      "english",
    ],
    thumbnail: "assets/media/placeholder_video.png",
  },
  {
    id: "v7m1-basic-algebra-tamil",
    title: "Basic Algebra (Tamil) - Video",
    downloadUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    grade: "Grade 7",
    year: "N/A",
    term: "N/A",
    type: "video",
    subject: "mathematics",
    tags: ["grade 7", "maths", "algebra", "video", "tamil"],
    thumbnail: "assets/media/placeholder_video.png",
  },

  // --- Grade 10 Resources ---
  {
    id: "10-tb-hist-en",
    title: "Grade 10 History Textbook (English Medium)",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=FILE_ID_10_tb_hist_en",
    grade: "Grade 10",
    year: "2024",
    term: "N/A",
    type: "textbook",
    subject: "history",
    tags: ["grade 10", "history", "textbook", "english medium", "2024"],
    thumbnail: "assets/media/placeholder_textbook.png",
  },
  {
    id: "10-tb-sci-ta",
    title: "Grade 10 Science Textbook (Tamil Medium)",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=FILE_ID_10_tb_sci_ta",
    grade: "Grade 10",
    year: "2024",
    term: "N/A",
    type: "textbook",
    subject: "science",
    tags: ["grade 10", "science", "textbook", "tamil medium", "2024"],
    thumbnail: "assets/media/placeholder_textbook.png",
  },
  {
    id: "10-pp-sci-ol-21-en",
    title: "Grade 10 Science O/L Model Paper (2021 - EN)",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=FILE_ID_10_pp_sci_ol_21_en",
    grade: "Grade 10",
    year: "2021",
    term: "N/A",
    type: "past papers",
    subject: "science",
    tags: [
      "grade 10",
      "science",
      "o/l",
      "past paper",
      "english medium",
      "2021",
    ],
    thumbnail: "assets/media/placeholder_paper.png",
  },
  {
    id: "10-pp-math-ol-22-ta",
    title: "Grade 10 Maths O/L Model Paper (2022 - TA)",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=FILE_ID_10_pp_math_ol_22_ta",
    grade: "Grade 10",
    year: "2022",
    term: "N/A",
    type: "past papers",
    subject: "mathematics",
    tags: ["grade 10", "maths", "o/l", "past paper", "tamil medium", "2022"],
    thumbnail: "assets/media/placeholder_paper.png",
  },
  {
    id: "10-pp-eng-ol-22-en",
    title: "Grade 10 English O/L Model Paper (2022 - EN)",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=FILE_ID_10_pp_eng_ol_22_en",
    grade: "Grade 10",
    year: "2022",
    term: "N/A",
    type: "past papers",
    subject: "english",
    tags: [
      "grade 10",
      "english",
      "o/l",
      "past paper",
      "english medium",
      "2022",
    ],
    thumbnail: "assets/media/placeholder_paper.png",
  },
  {
    id: "10-pp-hist-ol-21-ta",
    title: "Grade 10 History O/L Model Paper (2021 - TA)",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=FILE_ID_10_pp_hist_ol_21_ta",
    grade: "Grade 10",
    year: "2021",
    term: "N/A",
    type: "past papers",
    subject: "history",
    tags: ["grade 10", "history", "o/l", "past paper", "tamil medium", "2021"],
    thumbnail: "assets/media/placeholder_paper.png",
  },
  {
    id: "10-pp-busacc-ol-23-en",
    title: "Grade 10 Business & Acc O/L Paper (2023 - EN)",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=FILE_ID_10_pp_busacc_ol_23_en",
    grade: "Grade 10",
    year: "2023",
    term: "N/A",
    type: "past papers",
    subject: "commerce", // Mapped from businessAccountingStudies
    tags: [
      "grade 10",
      "business",
      "accounting",
      "commerce",
      "o/l",
      "past paper",
      "english medium",
      "2023",
    ],
    thumbnail: "assets/media/placeholder_paper.png",
  },
  {
    id: "10-ot-ict-notes",
    title: "Grade 10 ICT Short Notes (English)",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=FILE_ID_10_ot_ict_notes",
    grade: "Grade 10",
    year: "2023",
    term: "N/A",
    type: "others",
    subject: "ict", // Mapped from 'all' but title suggests ICT
    tags: ["grade 10", "ict", "notes", "english medium", "2023"],
    thumbnail: "assets/media/placeholder_notes.png",
  },
  {
    id: "v10s1-chem-equations",
    title: "Chemical Equations (English) - Video",
    downloadUrl: "https://www.youtube.com/watch?v=2zPw4yqsmUg",
    grade: "Grade 10",
    year: "N/A",
    term: "N/A",
    type: "video",
    subject: "science",
    tags: [
      "grade 10",
      "science",
      "chemistry",
      "chemical equations",
      "video",
      "english",
    ],
    thumbnail: "assets/media/placeholder_video.png",
  },
  {
    id: "v10s2-light-reflection-refraction",
    title: "Reflection & Refraction (Tamil) - Video",
    downloadUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    grade: "Grade 10",
    year: "N/A",
    term: "N/A",
    type: "video",
    subject: "science",
    tags: [
      "grade 10",
      "science",
      "physics",
      "light",
      "optics",
      "video",
      "tamil",
    ],
    thumbnail: "assets/media/placeholder_video.png",
  },
  {
    id: "v10a1-basic-sketching",
    title: "Basic Sketching Techniques (English) - Video",
    downloadUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    grade: "Grade 10",
    year: "N/A",
    term: "N/A",
    type: "video",
    subject: "art",
    tags: ["grade 10", "art", "drawing", "sketching", "video", "english"],
    thumbnail: "assets/media/placeholder_video.png",
  },

  // --- Grade 11 Resources ---
  {
    id: "11-pp-math-ol-23-ta",
    title: "Grade 11 Maths O/L Model Paper (2023 - TA)",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=FILE_ID_11_pp_math_ol_23_ta",
    grade: "Grade 11",
    year: "2023",
    term: "N/A",
    type: "past papers",
    subject: "mathematics",
    tags: ["grade 11", "maths", "o/l", "past paper", "tamil medium", "2023"],
    thumbnail: "assets/media/placeholder_paper.png",
  },
  {
    id: "11-pp-sci-ol-23-en",
    title: "Grade 11 Science O/L Model Paper (2023 - EN)",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=FILE_ID_11_pp_sci_ol_23_en",
    grade: "Grade 11",
    year: "2023",
    term: "N/A",
    type: "past papers",
    subject: "science",
    tags: [
      "grade 11",
      "science",
      "o/l",
      "past paper",
      "english medium",
      "2023",
    ],
    thumbnail: "assets/media/placeholder_paper.png",
  },
  {
    id: "11-pp-ict-ol-22-en",
    title: "Grade 11 ICT O/L Paper (2022 - EN)",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=FILE_ID_11_pp_ict_ol_22_en",
    grade: "Grade 11",
    year: "2022",
    term: "N/A",
    type: "past papers",
    subject: "ict",
    tags: ["grade 11", "ict", "o/l", "past paper", "english medium", "2022"],
    thumbnail: "assets/media/placeholder_paper.png",
  },

  // --- Grade 12 Resources ---
  {
    id: "12-tb-phy-en",
    title: "Grade 12 Physics Unit 1 (English Medium)",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=FILE_ID_12_tb_phy_en",
    grade: "Grade 12",
    year: "2023",
    term: "N/A",
    type: "textbook",
    subject: "physics",
    tags: ["grade 12", "physics", "textbook", "english medium", "2023"],
    thumbnail: "assets/media/placeholder_textbook.png",
  },
  {
    id: "12-pp-combmath-al-22-ta",
    title: "Grade 12 Combined Maths A/L Model Paper (2022 - TA)",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=FILE_ID_12_pp_combmath_al_22_ta",
    grade: "Grade 12",
    year: "2022",
    term: "N/A",
    type: "past papers",
    subject: "combined mathematics",
    tags: [
      "grade 12",
      "combined maths",
      "a/l",
      "past paper",
      "tamil medium",
      "2022",
    ],
    thumbnail: "assets/media/placeholder_paper.png",
  },
  {
    id: "12-pp-chem-al-22-en",
    title: "Grade 12 Chemistry A/L Model Paper (2022 - EN)",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=FILE_ID_12_pp_chem_al_22_en",
    grade: "Grade 12",
    year: "2022",
    term: "N/A",
    type: "past papers",
    subject: "chemistry",
    tags: [
      "grade 12",
      "chemistry",
      "a/l",
      "past paper",
      "english medium",
      "2022",
    ],
    thumbnail: "assets/media/placeholder_paper.png",
  },
  {
    id: "12-pp-acc-al-21-ta",
    title: "Grade 12 Accounting A/L Paper (2021 - TA)",
    downloadUrl:
      "https://drive.google.com/uc?export=download&id=FILE_ID_12_pp_acc_al_21_ta",
    grade: "Grade 12",
    year: "2021",
    term: "N/A",
    type: "past papers",
    subject: "accounting",
    tags: [
      "grade 12",
      "accounting",
      "a/l",
      "past paper",
      "tamil medium",
      "2021",
    ],
    thumbnail: "assets/media/placeholder_paper.png",
  },
];

// Optional utility function (can be removed if not used elsewhere)
export function getResourceById(id) {
  return resourcesData.find((resource) => resource.id === id);
}
