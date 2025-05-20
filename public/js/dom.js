// --- DOM Caching ---
export let dom = {};

export function cacheDomElements() {
    console.log("Caching DOM elements...");
    dom = {
        html: document.documentElement, body: document.body, header: document.querySelector('.header'),
        pages: document.querySelectorAll('.page'), navButtons: document.querySelectorAll('.nav-btn'), langButtons: document.querySelectorAll('.lang-btn'),
        errorMessage: document.getElementById('errorMessage'), errorMessageText: document.getElementById('errorMessageText'), closeErrorBtn: document.getElementById('closeErrorBtn'),
        copyright: document.querySelector('.copyright'), footerLinks: document.querySelectorAll('.footer-section a[data-footer-link]'),
        brandLogo: document.getElementById('brandLogo'),
        homePage: document.getElementById('home'),
        dashboardGrid: document.querySelector('#home .features-grid'), // Use features-grid selector

        libraryPage: document.getElementById('library'), libraryGradeGrid: document.getElementById('library-grade-grid'), libraryResourceTypeGrid: document.getElementById('library-resource-type-grid'), librarySubjectGrid: document.getElementById('library-subject-grid'), libraryResourceItems: document.getElementById('library-resource-items'), librarySearchInput: document.getElementById('librarySearchInput'), librarySearchStatus: document.getElementById('librarySearchStatus'), libraryResourceTypeTitle: document.getElementById('libraryResourceTypeTitle'), librarySubjectSelectionTitle: document.getElementById('librarySubjectSelectionTitle'), libraryListTitle: document.getElementById('libraryListTitle'), libraryListBackButton: document.getElementById('library-list-back-btn'), librarySearchContainer: document.getElementById('library-search-container'),
        libraryYearFilter: document.getElementById('libraryYearFilter'),
        libraryGradeFilter: document.getElementById('libraryGradeFilter'), // Added grade filter
        libraryTermFilter: document.getElementById('libraryTermFilter'), // Added term filter
        libraryTypeFilter: document.getElementById('libraryTypeFilter'), // Added type filter

        videosPage: document.getElementById('videos'), videoGradeGrid: document.getElementById('video-grade-grid'), videoSubjectGrid: document.getElementById('video-subject-grid'), videoUnitGrid: document.getElementById('video-unit-grid'), videoListItems: document.getElementById('video-list-items'), videoSubjectSelectionTitle: document.getElementById('videoSubjectSelectionTitle'), videoUnitSelectionTitle: document.getElementById('videoUnitSelectionTitle'), videoListTitle: document.getElementById('videoListTitle'),

        chatPage: document.getElementById('chat'), chatContainer: document.querySelector('#chat .chat-container'), chatMessages: document.querySelector('#chat .chat-messages'), chatInput: document.querySelector('#chat .chat-input'), sendBtn: document.querySelector('#chat .send-btn'), typingIndicator: document.querySelector('#chat .typing-indicator'), clearChatBtn: document.getElementById('clearChatBtn'),
        attachFileBtn: document.getElementById('attachFileBtn'), chatFileInput: document.getElementById('chatFileInput'), attachmentPreview: document.getElementById('attachmentPreview'), attachmentFilename: document.getElementById('attachmentFilename'), removeAttachmentBtn: document.getElementById('removeAttachmentBtn'),
        scrollTopBtn: document.getElementById('scrollTopBtn'), // Cache scroll button
    };
    // Added detailed logging for missing elements
    const criticalElements = [
        { name: 'pages', el: dom.pages }, { name: 'navButtons', el: dom.navButtons }, { name: 'langButtons', el: dom.langButtons },
        { name: 'brandLogo', el: dom.brandLogo }, { name: 'homePage', el: dom.homePage }, { name: 'libraryPage', el: dom.libraryPage },
        { name: 'videosPage', el: dom.videosPage }, { name: 'chatPage', el: dom.chatPage }, { name: 'chatMessages', el: dom.chatMessages },
        { name: 'chatInput', el: dom.chatInput }, { name: 'sendBtn', el: dom.sendBtn }, { name: 'attachFileBtn', el: dom.attachFileBtn },
        { name: 'chatFileInput', el: dom.chatFileInput },
        { name: 'libraryYearFilter', el: dom.libraryYearFilter }, // Existing filter
        { name: 'libraryGradeFilter', el: dom.libraryGradeFilter }, // Added filter
        { name: 'libraryTermFilter', el: dom.libraryTermFilter },   // Added filter
        { name: 'libraryTypeFilter', el: dom.libraryTypeFilter },   // Added filter
        { name: 'dashboardGrid', el: dom.dashboardGrid }, { name: 'scrollTopBtn', el: dom.scrollTopBtn } // Check scroll button
    ];
    let missing = false;
    criticalElements.forEach(item => {
        // Check if element exists and, if it's a NodeList, that it's not empty
        if (!item.el || (item.el instanceof NodeList && item.el.length === 0)) {
            // Try to provide more context if possible (e.g., selector used if available)
            const identifier = item.el?.id ? `#${item.el.id}` : (item.el?.className ? `.${item.el.className.split(' ')[0]}` : item.name);
            console.error(`Critical DOM element missing or empty: ${item.name} (Identifier: ${identifier})`);
            missing = true;
        }
    });
    if (missing) {
        // showError('errorDOMInit', 'Critical UI elements missing. Check console for details.', true);
         console.error('Critical UI elements missing. Check console for details.'); // Use direct console error before showError is guaranteed
    } else {
        console.log("DOM elements cached successfully.");
    }
    return !missing;
 }