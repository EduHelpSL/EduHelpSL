// --- Scroll Logic (Scroll-to-Top and Section Animations) ---

import { dom } from "./domCache.js";
import { state } from "./state.js"; // Needed to check if on home page

// --- Scroll-to-Top Logic ---
function handleScrollToTopButtonVisibility() {
    if (!dom || !dom.scrollTopBtn) return;
    if (window.scrollY > 300) {
        dom.scrollTopBtn.classList.add('visible');
    } else {
        dom.scrollTopBtn.classList.remove('visible');
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- Section Fade-in Animation on Scroll (Intersection Observer) ---
function initScrollAnimations() {
    // Only run this if on the home page, as animations are defined for #home section
    if (state.currentPage !== 'home' || !dom.homePage) {
        // console.log("Not on home page or homePage DOM element not found, skipping scroll animations init.");
        return;
    }

    const sectionsToAnimate = dom.homePage.querySelectorAll('#home > section');
    // console.log(`Found ${sectionsToAnimate.length} sections to animate on home page.`);

    if (sectionsToAnimate.length === 0) return;

    const observerOptions = {
        root: null, // observes intersections relative to the viewport
        rootMargin: '0px',
        threshold: 0.01 // Trigger when 1% of the element is visible (changed from 0.1)
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // console.log("Section intersecting:", entry.target.className);
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target); // Optional: stop observing after it's visible for performance
            }
        });
    }, observerOptions);

    sectionsToAnimate.forEach(section => {
        sectionObserver.observe(section);
    });
    // console.log("Intersection observer set up for home page sections.");
}

export function setupScrollEventListeners() {
    // Setup for Scroll-to-Top Button
    if (dom.scrollTopBtn) {
        window.addEventListener('scroll', handleScrollToTopButtonVisibility);
        dom.scrollTopBtn.addEventListener('click', scrollToTop);
        console.log("Scroll-to-top event listeners set up.");
    } else {
        console.warn("Scroll-to-Top button not found for event listener setup.");
    }

    // Initialize scroll-triggered animations for sections
    initScrollAnimations(); 
}

export function reInitScrollAnimationsOnPageLoad() {
    if (state.currentPage === 'home') {
        initScrollAnimations();
    }
}
