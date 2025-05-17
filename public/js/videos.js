// --- Videos Functions ---

import { dom } from "./domCache.js";
import { state } from "./state.js";
import { config, getSubjectDataForGrade } from "./config.js"; // Assuming config and getSubjectDataForGrade are needed
import { getTranslation } from "./translation.js";
import { switchActiveView } from "./navigation.js"; // Assuming switchActiveView is in navigation.js
import { populateGradeGrid, renderSubjectGrid } from "./commonRendering.js"; // Import from commonRendering

export function renderUnitGrid() {
    const vs = state.videoState;
    if (!dom.videoUnitGrid || !vs.selectedGrade || !vs.selectedSubject) return;

    dom.videoUnitGrid.innerHTML = ''; // Clear previous units
    const t = state.translations;

    // Access video data using config (assuming config is imported or available)
    const units = config.fakeVideoData[vs.selectedGrade]?.[vs.selectedSubject] || {};

    const frag = document.createDocumentFragment();
    let hasUnits = false;

    Object.keys(units).forEach(uk => {
        hasUnits = true;
        const unitData = units[uk];
        const btn = document.createElement('button');
        btn.className = 'unit-btn';
        btn.dataset.unit = uk;

        const dk = unitData.titleKey || uk;
        btn.dataset.langKey = dk; // Add lang key for translation

        // Use translated title if available, otherwise create a fallback
        const fallbackText = `Unit ${uk.replace('unit', '').replace(/([A-Z])/g, ' $1').trim()}`;
        btn.textContent = t[dk] || fallbackText;

        frag.appendChild(btn);
    });

    if (!hasUnits) {
        const noRes = document.createElement('p');
        noRes.className = 'no-results';
        noRes.textContent = t['noUnitsFound'] || 'No units.';
        frag.appendChild(noRes);
    }

    dom.videoUnitGrid.appendChild(frag);
    console.log("Video unit grid rendered.");
}

export function renderVideoList() {
    const container = dom.videoListItems;
    const vs = state.videoState;
    const t = state.translations;

    // Basic validation
    if (!container || !vs.selectedGrade || !vs.selectedSubject || !vs.selectedVideoUnit) {
        if(container) container.innerHTML = `<p class="no-results">${t['errorGeneric'] || 'Error.'}</p>`;
        return;
    }

    container.innerHTML = ''; // Clear previous videos

    const grade = vs.selectedGrade;
    const subject = vs.selectedSubject;
    const unitKey = vs.selectedVideoUnit;

    // Access video data using config (assuming config is imported or available)
    const unitData = config.fakeVideoData[grade]?.[subject]?.[unitKey];
    const videos = unitData?.videos || [];

    const frag = document.createDocumentFragment();

    if (videos.length === 0) {
        const noRes = document.createElement('p');
        noRes.className = 'no-results';
        noRes.textContent = t['noVideosFound'] || 'No videos.';
        frag.appendChild(noRes);
    } else {
        videos.forEach(video => {
            const card = document.createElement('div');
            card.className = 'video-card';
            card.dataset.videoId = video.id;

            const thumb = document.createElement('div');
            thumb.className = 'video-thumbnail';
            // Construct YouTube thumbnail URL
            thumb.style.backgroundImage = `url('https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg')`;
            thumb.dataset.youtubeId = video.youtubeId;
            // Add event listener for playing video on thumbnail click
            thumb.addEventListener('click', handleThumbnailClick);
            thumb.setAttribute('role', 'button'); // Make thumbnail focusable/clickable
            const vt = video.title || 'Video'; // Use video title for aria-label
            thumb.setAttribute('aria-label', `${t['playVideoAction'] || 'Play'}: ${vt}`); // Add accessibility label
            thumb.setAttribute('tabindex', '0'); // Make thumbnail keyboard focusable


            const info = document.createElement('div');
            info.className = 'video-info';

            const title = document.createElement('h3');
            title.textContent = video.title; // Video titles are not currently in translations, use directly

            const desc = document.createElement('p');
            desc.textContent = video.description; // Video descriptions are not currently in translations, use directly

            info.appendChild(title);
            info.appendChild(desc);
            card.appendChild(thumb);
            card.appendChild(info);
            frag.appendChild(card);
        });
    }

    container.appendChild(frag);
    console.log("Video list rendered.");
}

// --- Video Playback ---
export function handleThumbnailClick(event) {
    const thumbnailElement = event.currentTarget;
    const youtubeId = thumbnailElement.dataset.youtubeId;

    // Prevent playing if already playing or no youtubeId
    if (!youtubeId || thumbnailElement.classList.contains('playing')) return;

    playVideo(thumbnailElement, youtubeId);
}

export function playVideo(thumbnailElement, youtubeId) {
    // Clear thumbnail content and background
    thumbnailElement.innerHTML = '';
    thumbnailElement.style.backgroundImage = 'none';
    thumbnailElement.classList.add('playing');

    // Remove accessibility attributes for clickable element once it becomes an iframe
    thumbnailElement.removeAttribute('role');
    thumbnailElement.removeAttribute('aria-label');
    thumbnailElement.removeAttribute('tabindex');


    // Create and append the iframe
    const iframe = document.createElement('iframe');
    iframe.setAttribute('src', `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3`);
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
    iframe.setAttribute('allowfullscreen', '');
    // Add a translated title for the iframe for accessibility
    iframe.setAttribute('title', state.translations['youtubePlayerTitle'] || 'YouTube video player');

    thumbnailElement.appendChild(iframe);
    console.log(`Playing video: ${youtubeId}`);
}

// --- Event Listeners specific to Videos section ---
export function setupVideosEventListeners() {
    // Event delegation on the videos page element
    if (dom.videosPage) {
        dom.videosPage.addEventListener('click', (event) => {
            const target = event.target;
            const vs = state.videoState;
            const gradeBtn = target.closest('.grade-btn');
            const subjectBtn = target.closest('.subject-btn');
            const unitBtn = target.closest('.unit-btn');
            const backBtn = target.closest('.back-btn');

            // Handle Grade Selection
            if (gradeBtn && vs.activeViewId === 'videoGradeSelectionView') {
                vs.selectedGrade = gradeBtn.dataset.grade;
                vs.selectedSubject = null; // Reset subject selection
                vs.selectedVideoUnit = null; // Reset unit selection
                // No need to clear/populate grade grid, it stays the same
                renderSubjectGrid(dom.videoSubjectGrid, vs.selectedGrade); // Populate the next grid
                switchActiveView(dom.videosPage, 'videoSubjectSelectionView'); // Switch view
            }
            // Handle Subject Selection
            else if (subjectBtn && vs.activeViewId === 'videoSubjectSelectionView') {
                vs.selectedSubject = subjectBtn.dataset.subject;
                vs.selectedVideoUnit = null; // Reset unit selection
                renderUnitGrid(); // Populate the next grid
                switchActiveView(dom.videosPage, 'videoUnitSelectionView'); // Switch view
            }
            // Handle Unit Selection
            else if (unitBtn && vs.activeViewId === 'videoUnitSelectionView') {
                vs.selectedVideoUnit = unitBtn.dataset.unit;
                renderVideoList(); // Render the video list
                switchActiveView(dom.videosPage, 'videoListView'); // Switch view
            }
            // Handle Back Button
            else if (backBtn) {
                const targetViewId = backBtn.dataset.targetView;
                if (targetViewId) {
                     // Reset state relevant to the view being exited
                     if (vs.activeViewId === 'videoListView') {
                         vs.selectedVideoUnit = null;
                         // No need to clear video list
                     }
                     if (vs.activeViewId === 'videoUnitSelectionView') {
                         vs.selectedVideoUnit = null;
                         // No need to clear unit grid
                     }
                      if (vs.activeViewId === 'videoSubjectSelectionView') {
                         vs.selectedSubject = null;
                         // No need to clear subject grid
                     }
                    // Note: Resetting grade happens when going back to grade selection view from Subject
                    if (targetViewId === 'videoGradeSelectionView') {
                        vs.selectedGrade = null;
                        vs.selectedSubject = null;
                        vs.selectedVideoUnit = null;
                         // Populate grade grid again if needed
                         if (dom.videoGradeGrid && dom.videoGradeGrid.children.length === 0) {
                             populateGradeGrid(dom.videoGradeGrid);
                         }
                    }

                    switchActiveView(dom.videosPage, targetViewId, true); // Use true for back navigation

                    // Update back button target based on the *new* active view
                     // Assuming back button in grade view navigates home or is hidden.
                    // If it navigates home, the page navigation handler takes over.
                } else {
                     // If no target view, reset the whole section
                    resetSectionView('videos'); // Assuming resetSectionView is accessible or imported
                }
            }
        });
    } else { console.warn("Videos page element not found for event listener setup."); }
}

// Import resetSectionView from commonRendering.js
import { resetSectionView } from "./commonRendering.js";
