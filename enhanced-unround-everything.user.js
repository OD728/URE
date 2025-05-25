// ==UserScript==
// @name         Enhanced Unround Everything Everywhere
// @namespace    RM
// @version      3.1.0
// @description  Advanced script to force zero border-radius and disable clipping/masking with improved performance and site coverage. Fix for Discord status indicators.
// @license      CC0 - Public Domain
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-start
// @match        *://*/*
// ==/UserScript==

(function() {
    'use strict';

    // Configuration - can be extended with GM_setValue/GM_getValue for user preferences
    const CONFIG = {
        enableGlobalRules: GM_getValue('enableGlobalRules', true),
        enableSiteSpecific: GM_getValue('enableSiteSpecific', true),
        enableSVGFixes: GM_getValue('enableSVGFixes', true),
        enableDynamicObserver: GM_getValue('enableDynamicObserver', true),
        debugMode: GM_getValue('debugMode', false)
    };

    // Utility functions
    const utils = {
        log: (...args) => CONFIG.debugMode && console.log('[Unround]', ...args),

        createCSS: (rules) => rules.filter(Boolean).join('\n'),

        getCurrentDomain: () => {
            const hostname = location.hostname.toLowerCase();
            return hostname.replace(/^www\./, '');
        },

        matchesDomain: (patterns) => {
            const domain = utils.getCurrentDomain();
            return patterns.some(pattern =>
                domain === pattern || domain.endsWith('.' + pattern)
            );
        },

        debounce: (func, wait) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
    };

    // Base CSS rules
    const globalCSS = CONFIG.enableGlobalRules ? `
        /* Enhanced global unrounding with better performance - exclude Reddit UI elements */
        :is(
            div, span, img, video, canvas, section, article, header, footer, nav, main,
            button, input:not([type="radio"]):not([type="checkbox"]), select, textarea,
            figure, figcaption, aside, details, summary, dialog, menu, menuitem,
            [class*="avatar"], [class*="profile"], [class*="picture"], [class*="photo"],
            [data-testid*="avatar"], [data-testid*="profile"], [aria-label*="profile" i]
        ):not([data-unround-preserve]):not([class*="vote"]):not([class*="dropdown"]):not([role="button"][class*="_"]) {
            border-radius: 0 !important;
            clip-path: none !important;
            -webkit-clip-path: none !important;
            /* MOVED MASK RULES HERE */
            mask: none !important;
            -webkit-mask: none !important;
            mask-image: none !important;
            -webkit-mask-image: none !important;
        }

        /* Pseudo-elements */
        :is(
            div, span, img, video, canvas, section, article, header, footer, nav, main,
            button, input:not([type="radio"]):not([type="checkbox"]), select, textarea
        ):not([data-unround-preserve])::before,
        :is(
            div, span, img, video, canvas, section, article, header, footer, nav, main,
            button, input:not([type="radio"]):not([type="checkbox"]), select, textarea
        ):not([data-unround-preserve])::after {
            border-radius: 0 !important;
            clip-path: none !important;
            -webkit-clip-path: none !important;
            /* MOVED MASK RULES HERE (Optional, but good for consistency if pseudo-elements use masks) */
            mask: none !important;
            -webkit-mask: none !important;
            mask-image: none !important;
            -webkit-mask-image: none !important;
        }

        /* Modern CSS features - MASKS REMOVED FROM HERE */
        * {
            border-start-start-radius: 0 !important;
            border-start-end-radius: 0 !important;
            border-end-start-radius: 0 !important;
            border-end-end-radius: 0 !important;
            /* mask: none !important; <-- REMOVED */
            /* -webkit-mask: none !important; <-- REMOVED */
            /* mask-image: none !important; <-- REMOVED */
            /* -webkit-mask-image: none !important; <-- REMOVED */
        }

        /* CSS Grid and Flexbox containers (inline styles override) */
        /* This rule targets elements that have inline styles for border-radius, clip-path, or mask.
           It's important for overriding inline styles set by JavaScript after the page loads. */
        [style*="border-radius"], [style*="clip-path"], [style*="mask"] {
            border-radius: 0 !important;
            clip-path: none !important;
            -webkit-clip-path: none !important;
            mask: none !important; /* This can stay, as it targets elements explicitly using inline mask styles */
            -webkit-mask: none !important;
        }

        /* Form elements compatibility */
        @layer unround-forms {
            :where(input:not([type="radio"]):not([type="checkbox"]), button, select, textarea) {
                border-width: 1px;
                border-style: solid;
                border-color: currentColor; /* Ensures border color matches text color by default */
            }
        }
    ` : '';

    // Enhanced SVG fixes
    const svgCSS = CONFIG.enableSVGFixes ? `
        /* Comprehensive SVG unrounding - preserve Reddit UI functionality */
        /* General SVG unrounding, excluding known UI icons and elements marked for preservation */
        svg:not([data-unround-preserve]):not([class*="icon"]):not([role="img"]) {
            border-radius: 0 !important;
        }

        /* Target rect elements within SVGs likely used for avatars or profile pictures.
           Exclude rects that are part of status indicators (e.g., Discord status dots). */
        svg:not([data-unround-preserve]):is([class*="avatar"], [aria-label*="avatar" i], [data-testid*="avatar"]) rect:not([mask*="status"]):not([class*="status"]):not([class*="dot"]) {
            rx: 0 !important;
            ry: 0 !important;
        }

        /* Remove masks and clip-paths from image elements within avatar SVGs. */
        svg:not([data-unround-preserve]):is([class*="avatar"], [aria-label*="avatar" i], [data-testid*="avatar"]) image {
            mask: none !important;
            clip-path: none !important;
        }

        /* Be very selective with ellipse modifications, typically only for avatars. */
        svg:not([data-unround-preserve]):is([class*="avatar"], [aria-label*="avatar" i], [data-testid*="avatar"]) ellipse {
            rx: 0 !important; /* Effectively turns ellipses into rectangles if both rx and ry are zeroed */
            ry: 0 !important;
        }

        /* Hide circle elements within avatar SVGs, but NOT if they are status indicators.
           The '>' selector targets direct children circles of the avatar SVG.
           This helps prevent hiding decorative circles while preserving status dots. */
        svg:not([data-unround-preserve]):is([class*="avatar"], [aria-label*="avatar" i], [data-testid*="avatar"]) > circle:not([class*="status"]):not([class*="dot"]):not([id*="status"]) {
            display: none !important;
        }
    ` : '';

    // Site-specific configurations
    const siteConfigs = {
        // Social Media
        facebook: {
            domains: ['facebook.com', 'workplace.com', 'fb.com'],
            css: `
                /* Facebook advanced avatar handling */
                /* Targets SVG masks used for profile pictures and removes them */
                svg[role] mask[id] + g[mask] {
                    mask: none !important;
                }

                /* Optionally, make the underlying circle slightly visible if needed for debugging or specific effects */
                svg[role] mask[id] + g[mask] circle {
                    opacity: 0.1 !important; /* Low opacity to not be obtrusive */
                }

                /* Add a subtle outline to images within masked SVGs for better definition */
                svg[role] mask[id] + g[mask] image {
                    outline: 1px solid var(--divider, rgba(0,0,0,0.1)); /* Use a common CSS variable or a fallback */
                    outline-offset: -1px; /* Inset outline */
                }

                /* Facebook logo fixes - replaces complex paths with simple rectangles */
                svg[viewBox="0 0 36 36"] path[d*="C29.094 34.791"],
                svg[viewBox="0 0 36 36"] path[d*="C6.5 34.3"] {
                    d: path("M0 0 H 36 V 36 H 0 Z") !important;
                }

                /* Profile pictures and cover photos */
                img[data-imgperflogname="profileCoverPhoto"],
                img[alt*="profile picture" i],
                div[data-visualcompletion="media-vc-image"] img {
                    border-radius: 0 !important;
                    clip-path: none !important;
                }
            `
        },

        twitter: {
            domains: ['twitter.com', 'x.com'],
            css: `
                /* Twitter/X comprehensive avatar fixes */
                [data-testid*="UserAvatar"] img,
                [data-testid*="Tweet-User-Avatar"] img,
                [aria-label*="profile" i] img,
                div[style*='clip-path: url("#circle'], /* Targets elements clipped by an SVG circle definition */
                div[style*='clip-path: circle'] { /* Targets elements directly clipped with a CSS circle */
                    border-radius: 0 !important;
                    clip-path: none !important;
                    -webkit-clip-path: none !important;
                }

                /* X logo handling - replaces the X logo path with a simple Z-like shape */
                svg[viewBox="0 0 24 24"] path[d*="M18.244"] {
                    d: path("M 2 2 L 10 2 L 15 12 L 22 2 L 22 22 L 14 22 L 9 12 L 2 22 Z") !important;
                }
            `
        },

        instagram: {
            domains: ['instagram.com'],
            css: `
                /* Instagram stories and profile pictures */
                img[alt*="profile picture" i],
                canvas[style*="border-radius"], /* Targets canvases used for stories/highlights */
                div[role="button"] img[draggable="false"], /* Story highlights and profile pics in some contexts */
                ._aadp img, ._6q-tv img { /* Common classes for profile images */
                    border-radius: 0 !important;
                    clip-path: none !important;
                }

                /* Story rings - attempts to make story rings square by zeroing rx/ry on SVG circles */
                svg circle[stroke*="url(#"] { /* Targets circles with gradient strokes (story rings) */
                    rx: 0 !important;
                    ry: 0 !important;
                    stroke-width: 2px !important; /* Standardize stroke width */
                }
            `
        },

        linkedin: {
            domains: ['linkedin.com'],
            css: `
                /* LinkedIn profile photos */
                img[data-delayed-url*="profile"], /* Images loaded lazily */
                .presence-entity__image img, /* Profile images in various components */
                .ivm-view-attr__img--centered img,
                button img[alt*="profile" i] { /* Profile images within buttons */
                    border-radius: 0 !important;
                    clip-path: none !important;
                }
            `
        },

        // Messaging Apps
        whatsapp: {
            domains: ['web.whatsapp.com'],
            css: `
                /* WhatsApp comprehensive fixes for avatars and media */
                img[src*="blob:"], img[src*="data:image"], /* Covers most images including pasted/uploaded */
                div[data-testid*="avatar"] img,
                div[data-testid="chat-list-item-container"] img, /* Avatars in chat list */
                div[data-testid="conversation-header"] img, /* Avatar in conversation header */
                span[data-testid="default-user"] img { /* Default user avatar placeholder */
                    border-radius: 0 !important;
                    clip-path: none !important;
                }

                /* Status and group icons - hide the circular background path in some SVGs */
                svg path.background { /* Specific class for background paths in some icons */
                    display: none !important;
                }

                /* Add a subtle background to SVGs that had their background path removed */
                svg:has(path.background) { /* Targets SVGs that contained the 'path.background' */
                    background-color: rgba(128, 128, 128, 0.1) !important; /* Light grey, semi-transparent */
                }
            `
        },

        discord: {
            domains: ['discord.com', 'discordapp.com'],
            css: `
                /* Discord avatars and servers */
                img[class*="avatar"],
                div[class*="avatar"] img, /* Covers various avatar wrappers */
                img[src*="/avatars/"], /* Direct avatar image links */
                div[data-list-item-id*="guildsnav"] img, /* Server icons in navigation */
                foreignObject[mask*="url(#"] img { /* Images within foreignObject, often masked */
                    border-radius: 0 !important;
                    clip-path: none !important;
                    mask: none !important; /* Specifically remove masks from these images */
                }

                /* Server icons wrapper divs */
                div[class*="wrapper"] > div[style*="border-radius"] {
                    border-radius: 0 !important;
                }

                /* More specific targeting for status indicators to prevent them from becoming long.
                   This attempts to preserve their original size and aspect ratio by avoiding removal of their specific masks.
                   This selector targets the SVG element often used for status indicators. */
                svg[class*="mask"] foreignObject[mask*="status"] {
                    /* Do not apply global mask:none here, allow their specific status mask to work */
                }
                svg[class*="mask"] foreignObject[mask*="status"] rect,
                svg[class*="status"] rect, /* Status rects directly under an SVG with a 'status' class */
                svg[aria-label*="status" i] rect { /* Status rects in SVGs with an aria-label containing 'status' */
                    /* Allow rx and ry to be set by Discord's CSS for these specific status rects */
                }
            `
        },

        slack: {
            domains: ['slack.com'],
            css: `
                /* Slack profile pictures */
                img[data-qa="member_image"],
                img[class*="c-avatar"],
                .c-base_icon img, /* Images within base icon components */
                img[src*="/team_assets/"] { /* Images from team assets (often avatars) */
                    border-radius: 0 !important;
                    clip-path: none !important;
                }
            `
        },

        // Google Services
        google: {
            domains: ['google.com', 'gmail.com', 'youtube.com', 'drive.google.com', 'photos.google.com', 'googleusercontent.com'],
            css: `
                /* Google profile pictures */
                img.gb_Ia, img[aria-label*="Profile picture" i], /* Common Google profile picture selectors */
                img[src*="googleusercontent.com/a/"], /* Common URL pattern for avatars */
                img[jsname], img[data-src*="googleusercontent"], /* Other patterns for Google images */
                .Xb9hP img, .VfPpkd-kBDsod img { /* Specific classes on some Google sites */
                    border-radius: 0 !important;
                    clip-path: none !important;
                }

                /* YouTube thumbnails and avatars */
                yt-img-shadow img, #avatar img, /* Common YouTube image wrappers */
                img[class*="yt-"], .ytp-videowall-still img { /* YouTube specific classes */
                    border-radius: 0 !important;
                }

                /* Google One multicolor outline fix - replaces complex paths with simple rectangles */
                /* These paths form the colored segments of the Google One logo/avatar ring */
                path[fill="#F6AD01"][d*="M4.02,28.27"] { /* Yellow segment */
                    d: path("M 2 2 v 36 l 2 -2 V 4 Z") !important;
                }
                path[fill="#249A41"][d*="M32.15,33.27"] { /* Green segment */
                    d: path("M 2 38 h 36 l -2 -2 H 4 Z") !important;
                }
                path[fill="#3174F1"][d*="M33.49,34.77"] { /* Blue segment */
                    d: path("M 38 2 v 36 l -2 -2 V 4 Z") !important;
                }
                path[fill="#E92D18"][d*="M20,2c4.65"] { /* Red segment */
                    d: path("M 2 2 h 36 l -2 2 H 4 Z") !important;
                }
            `
        },

        // Microsoft Services
        microsoft: {
            domains: ['microsoft.com', 'outlook.com', 'live.com', 'office.com', 'copilot.microsoft.com', 'teams.microsoft.com'],
            css: `
                /* Microsoft avatars and logos */
                img[data-testid*="avatar"],
                img[aria-label*="profile" i],
                .ms-Persona-image img, /* Outlook/Office 365 persona images */
                [class*="squircle"], /* Elements styled as squircles */
                cib-serp-feedback::part(avatar-image), /* Copilot feedback avatar (Shadow DOM part) */
                cib-participant-avatar::part(avatar-image) { /* Copilot participant avatar (Shadow DOM part) */
                    border-radius: 0 !important;
                    clip-path: none !important;
                }
            `
        },

        // Entertainment
        spotify: {
            domains: ['open.spotify.com', 'spotify.com'],
            css: `
                /* Spotify comprehensive fixes for avatars and album art */
                img[data-testid*="avatar"], figure[data-testid*="avatar"] img,
                img[data-testid="user-widget-avatar"],
                div[data-testid="avatar"] img,
                div[data-encore-id="avatar"] img, /* Encore UI system avatars */
                img[class*="_6fa2d5efe1456f4e"], /* Obfuscated class name, may change */
                div[data-testid="playlist-image"] img, /* Playlist images */
                div[data-testid="card-image"] img, /* Card images (albums, artists) */
                img.mMx2LUixlnN_Fu45JpFB /* Another obfuscated class for album art */ {
                    border-radius: 0 !important;
                    clip-path: none !important;
                }

                /* Spotify icon paths - replace circular icon paths with squares */
                path[d*="M1 12C1 5.925"] { /* Common circular icon path */
                    d: path("M 4 4 H 20 V 20 H 4 Z") !important;
                }
                path[d*="M0 8a8 8 0 1 1 16"] { /* Another common circular icon path */
                    d: path("M 2 2 H 14 V 14 H 2 Z") !important;
                }
            `
        },

        netflix: {
            domains: ['netflix.com'],
            css: `
                /* Netflix profile avatars and show/movie posters */
                .choose-profile .profile-icon, /* Profile selection screen icons */
                .account-menu-item img, /* Avatar in account menu */
                img[data-uia*="profile"], /* General profile images */
                .title-card img, /* Movie/show posters */
                .bob-card img /* Billboards/hero images */ {
                    border-radius: 0 !important;
                    clip-path: none !important;
                }
            `
        },

        // Developer Platforms
        github: {
            domains: ['github.com'],
            css: `
                /* GitHub avatars */
                img.avatar, img[alt*="@"], /* Common avatar classes and alt text patterns */
                .avatar img, img[data-hovercard-type="user"],
                img[src*="/avatars/"] { /* Direct avatar image links */
                    border-radius: 0 !important;
                    clip-path: none !important;
                }
            `
        },

        stackoverflow: {
            domains: ['stackoverflow.com', 'stackexchange.com', 'askubuntu.com', 'superuser.com', 'serverfault.com'],
            css: `
                /* Stack Overflow and Stack Exchange network user avatars */
                img.bar-sm, img.s-avatar, /* Common avatar classes */
                .gravatar-wrapper-32 img, /* Gravatar wrappers */
                .user-gravatar32 img {
                    border-radius: 0 !important;
                }
            `
        }
    };

    // CSS injection with better error handling
    function injectCSS(css) {
        if (!css || !css.trim()) return; // Do not inject if CSS is empty or only whitespace

        try {
            if (typeof GM_addStyle !== "undefined") {
                GM_addStyle(css);
                utils.log('CSS injected via GM_addStyle');
            } else {
                injectFallbackCSS(css); // Use fallback if GM_addStyle is not available
            }
        } catch (error) {
            utils.log('Error injecting CSS with GM_addStyle:', error);
            injectFallbackCSS(css); // Attempt fallback on error
        }
    }

    // Fallback CSS injection method if GM_addStyle is not available or fails
    function injectFallbackCSS(css) {
        const styleNode = document.createElement("style");
        styleNode.setAttribute("type", "text/css");
        styleNode.setAttribute("data-unround", "true"); // Mark the style node for identification
        styleNode.appendChild(document.createTextNode(css));

        const injectNode = () => {
            const target = document.head || document.documentElement; // Prefer document.head, fallback to documentElement
            if (target) {
                target.appendChild(styleNode);
                utils.log('CSS injected via fallback method (appendChild to head/documentElement)');
                return true;
            }
            return false;
        };

        // Attempt to inject immediately. If document.head is not ready, use a MutationObserver.
        if (!injectNode()) {
            const observer = new MutationObserver((mutations, obs) => {
                if (document.head || document.documentElement) { // Check again if head/documentElement is available
                    if (injectNode()) {
                        obs.disconnect(); // Stop observing once injected
                    }
                }
            });
            // Observe the documentElement for childList changes (e.g., when <head> is added)
            observer.observe(document.documentElement || document.body || document, {
                childList: true,
                subtree: true // Observe subtree in case head is nested deeper initially
            });
        }
    }

    // Dynamic content observer to reapply styles if necessary
    function setupDynamicObserver() {
        if (!CONFIG.enableDynamicObserver) return;

        const observer = new MutationObserver(utils.debounce((mutations) => {
            let needsReapplication = false; // Flag to check if styles need reapplication

            mutations.forEach(mutation => {
                // Check for added nodes that might need unrounding
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Only element nodes
                            // Check if the node itself or its children might have rounded corners
                            if (node.matches('img, svg, [style*="border-radius"], [class*="avatar"], [class*="profile"]') ||
                                (node.querySelector && node.querySelector('img, svg, [style*="border-radius"], [class*="avatar"], [class*="profile"]'))) {
                                needsReapplication = true;
                            }
                        }
                    });
                }
                // Check for attribute changes (style, class, src) that might introduce rounded corners
                else if (mutation.type === 'attributes' &&
                         ['style', 'class', 'src', 'd', 'mask'].includes(mutation.attributeName)) {
                    // More robust check: see if the target element or its children match unrounding criteria
                    const targetElement = mutation.target;
                    if (targetElement && targetElement.nodeType === 1) {
                         if (targetElement.matches('img, svg, [style*="border-radius"], [class*="avatar"], [class*="profile"]') ||
                            (targetElement.querySelector && targetElement.querySelector('img, svg, [style*="border-radius"], [class*="avatar"], [class*="profile"]'))) {
                            needsReapplication = true;
                        }
                    }
                }
            });

            if (needsReapplication) {
                utils.log('Dynamic content change detected, reapplying styles/fixes.');
                // Re-run specific fixes for dynamically loaded content
                applyDynamicFixes();
                // Potentially re-inject site-specific CSS if it's highly dynamic, though usually the global rules cover this.
                // For extreme cases, one might consider re-injecting the full CSS, but this is often overkill.
            }
        }, 300)); // Debounce to avoid excessive calls on rapid changes

        observer.observe(document.documentElement, {
            childList: true, // Observe direct children additions/removals
            subtree: true,   // Observe all descendants
            attributes: true, // Observe attribute changes
            attributeFilter: ['style', 'class', 'src', 'd', 'mask', 'data-testid', 'aria-label'] // Specific attributes to watch
        });

        utils.log('Dynamic observer initialized');
    }

    // Function to apply fixes to elements that might have been styled by JavaScript after initial load
    function applyDynamicFixes() {
        // Target elements with inline styles that might set border-radius or clip-path
        const elementsWithInlineStyles = document.querySelectorAll('[style*="border-radius"], [style*="clip-path"], [style*="mask"]');
        elementsWithInlineStyles.forEach(el => {
            if (!el.hasAttribute('data-unround-preserve')) { // Respect the preservation attribute
                // Force override inline styles. Important for elements styled by JS.
                el.style.setProperty('border-radius', '0', 'important');
                el.style.setProperty('clip-path', 'none', 'important');
                el.style.setProperty('-webkit-clip-path', 'none', 'important');
                el.style.setProperty('mask', 'none', 'important');
                el.style.setProperty('-webkit-mask', 'none', 'important');
            }
        });

        // Special handling for SVGs that might be dynamically altered
        if (CONFIG.enableSVGFixes) {
            const svgs = document.querySelectorAll('svg:not([data-unround-preserve])');
            svgs.forEach(svg => {
                // Re-apply rx/ry to rects if they are not status indicators
                svg.querySelectorAll('rect:not([mask*="status"]):not([class*="status"]):not([class*="dot"])').forEach(rect => {
                    rect.setAttribute('rx', '0');
                    rect.setAttribute('ry', '0');
                });
                // Re-apply to ellipses
                svg.querySelectorAll('ellipse').forEach(ellipse => {
                    ellipse.setAttribute('rx', '0');
                    ellipse.setAttribute('ry', '0');
                });
                 // Re-hide circles in avatars if not status dots
                if (svg.matches(':is([class*="avatar"], [aria-label*="avatar" i], [data-testid*="avatar"])')) {
                    svg.querySelectorAll(':scope > circle:not([class*="status"]):not([class*="dot"]):not([id*="status"])').forEach(circle => {
                         circle.style.setProperty('display', 'none', 'important');
                    });
                }
            });
        }
        utils.log('Dynamic fixes applied.');
    }

    // Main initialization function
    function init() {
        utils.log(`Initializing Enhanced Unround Everything v${GM_info.script.version}`);

        let allCSS = []; // Array to hold all CSS rules

        if (CONFIG.enableGlobalRules) {
            allCSS.push(globalCSS);
        }
        if (CONFIG.enableSVGFixes) {
            allCSS.push(svgCSS);
        }

        // Add site-specific CSS
        if (CONFIG.enableSiteSpecific) {
            Object.entries(siteConfigs).forEach(([siteName, config]) => {
                if (utils.matchesDomain(config.domains)) {
                    if (config.css && config.css.trim()) {
                        allCSS.push(config.css);
                        utils.log(`Applied ${siteName} specific rules`);
                    }
                }
            });
        }

        // Inject all CSS rules combined
        const finalCSS = utils.createCSS(allCSS);
        injectCSS(finalCSS);

        // Setup dynamic observer after initial CSS injection
        // Ensure DOM is ready for observer setup and initial dynamic fixes
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setupDynamicObserver();
                applyDynamicFixes(); // Apply once after DOM is fully loaded
                setTimeout(handleIframes, 1500); // Handle iframes after a slight delay
            });
        } else { // DOM is already loaded
            setupDynamicObserver();
            applyDynamicFixes(); // Apply immediately
            setTimeout(handleIframes, 1000); // Handle iframes after a slight delay
        }

        utils.log('Initialization sequence complete');
    }

    // Handle iframe content - inject global and SVG CSS into accessible iframes
    function handleIframes() {
        if (!CONFIG.enableGlobalRules && !CONFIG.enableSVGFixes) return; // Skip if no relevant CSS is enabled

        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            try {
                // Check if contentDocument is accessible (same-origin or permissive CORS)
                const iframeDoc = iframe.contentDocument;
                if (iframeDoc) {
                    let iframeCSSParts = [];
                    if (CONFIG.enableGlobalRules) iframeCSSParts.push(globalCSS);
                    if (CONFIG.enableSVGFixes) iframeCSSParts.push(svgCSS);
                    const iframeCSSToInject = utils.createCSS(iframeCSSParts);

                    if (iframeCSSToInject.trim()) {
                        const styleNode = iframeDoc.createElement('style');
                        styleNode.setAttribute('data-unround-iframe', 'true');
                        styleNode.textContent = iframeCSSToInject;
                        (iframeDoc.head || iframeDoc.documentElement)?.appendChild(styleNode);
                        utils.log('CSS injected into accessible iframe:', iframe.src || 'inline iframe');
                    }
                }
            } catch (e) {
                // Cross-origin iframe, cannot access contentDocument
                utils.log('Cannot access iframe content (likely cross-origin):', iframe.src || 'inline iframe', e.message);
            }
        });
    }

    // Start the script
    // The main `init()` call is placed to run as soon as possible,
    // with DOMContentLoaded listeners handling cases where the DOM isn't ready yet.
    init();


    // Expose configuration for advanced users via console (unsafeWindow)
    if (typeof unsafeWindow !== 'undefined') {
        unsafeWindow.unroundConfig = {
            toggle: (settingKey) => {
                if (CONFIG.hasOwnProperty(settingKey)) {
                    CONFIG[settingKey] = !CONFIG[settingKey];
                    GM_setValue(settingKey, CONFIG[settingKey]);
                    utils.log(`Setting '${settingKey}' toggled to ${CONFIG[settingKey]}. Reloading page.`);
                    location.reload();
                } else {
                    console.warn(`[Unround] Invalid setting key: ${settingKey}`);
                }
            },
            getConfig: () => JSON.parse(JSON.stringify(CONFIG)), // Return a copy
            reload: () => location.reload(),
            reapplyStyles: () => {
                utils.log('Manually reapplying dynamic fixes...');
                applyDynamicFixes();
                // Optionally re-inject all CSS if needed for a hard reset
                // const allCSS = [globalCSS, svgCSS]; /* ... gather site-specific too ... */
                // injectCSS(utils.createCSS(allCSS));
                utils.log('Manual reapplication complete.');
            }
        };
        utils.log('Unround config exposed to unsafeWindow.unroundConfig');
    }

})();
