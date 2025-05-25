// ==UserScript==
// @name         Enhanced Unround Everything Everywhere
// @namespace    RM
// @version      3.0.0
// @description  Advanced script to force zero border-radius and disable clipping/masking with improved performance and site coverage
// @license      CC0 - Public Domain
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-start
// @match        *://*/*
// @updateURL    https://raw.githubusercontent.com/user/repo/main/unround.user.js
// @downloadURL  https://raw.githubusercontent.com/user/repo/main/unround.user.js
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
        }

        /* Modern CSS features */
        * {
            border-start-start-radius: 0 !important;
            border-start-end-radius: 0 !important;
            border-end-start-radius: 0 !important;
            border-end-end-radius: 0 !important;
            mask: none !important;
            -webkit-mask: none !important;
            mask-image: none !important;
            -webkit-mask-image: none !important;
        }

        /* CSS Grid and Flexbox containers */
        [style*="border-radius"], [style*="clip-path"], [style*="mask"] {
            border-radius: 0 !important;
            clip-path: none !important;
            -webkit-clip-path: none !important;
            mask: none !important;
            -webkit-mask: none !important;
        }

        /* Form elements compatibility */
        @layer unround-forms {
            :where(input:not([type="radio"]):not([type="checkbox"]), button, select, textarea) {
                border-width: 1px;
                border-style: solid;
                border-color: currentColor;
            }
        }
    ` : '';

    // Enhanced SVG fixes
    const svgCSS = CONFIG.enableSVGFixes ? `
        /* Comprehensive SVG unrounding - preserve Reddit UI functionality */
        svg:not([data-unround-preserve]):not([class*="icon"]):not([role="img"]) {
            border-radius: 0 !important;
        }

        /* Only target obvious avatar/media SVGs */
        svg:not([data-unround-preserve])[class*="avatar"] rect,
        svg:not([data-unround-preserve])[aria-label*="avatar" i] rect,
        svg:not([data-unround-preserve])[data-testid*="avatar"] rect {
            rx: 0 !important;
            ry: 0 !important;
        }

        svg:not([data-unround-preserve])[class*="avatar"] image,
        svg:not([data-unround-preserve])[aria-label*="avatar" i] image,
        svg:not([data-unround-preserve])[data-testid*="avatar"] image {
            mask: none !important;
            clip-path: none !important;
        }

        /* Be very selective with ellipse modifications */
        svg:not([data-unround-preserve])[class*="avatar"] ellipse {
            rx: 0 !important;
            ry: 0 !important;
        }

        /* Only hide circles in avatar contexts, not UI icons */
        svg:not([data-unround-preserve])[class*="avatar"] circle,
        svg:not([data-unround-preserve])[aria-label*="avatar" i] circle {
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
                svg[role] mask[id] + g[mask] {
                    mask: none !important;
                }

                svg[role] mask[id] + g[mask] circle {
                    opacity: 0.1 !important;
                }

                svg[role] mask[id] + g[mask] image {
                    outline: 2px solid var(--accent, #1877f2);
                    outline-offset: 2px;
                }

                /* Facebook logo fixes */
                svg[viewBox="0 0 36 36"] path[d*="C29.094 34.791"],
                svg[viewBox="0 0 36 36"] path[d*="C6.5 34.3"] {
                    d: path("M0 0 H 36 V 36 H 0 Z") !important;
                }

                /* Profile pictures */
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
                div[style*='clip-path: url("#circle'],
                div[style*='clip-path: circle'] {
                    border-radius: 0 !important;
                    clip-path: none !important;
                    -webkit-clip-path: none !important;
                }

                /* X logo handling */
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
                canvas[style*="border-radius"],
                div[role="button"] img[draggable="false"],
                ._aadp img, ._6q-tv img {
                    border-radius: 0 !important;
                    clip-path: none !important;
                }

                /* Story rings */
                svg circle[stroke*="url(#"] {
                    rx: 0 !important;
                    ry: 0 !important;
                    stroke-width: 2px !important;
                }
            `
        },

        linkedin: {
            domains: ['linkedin.com'],
            css: `
                /* LinkedIn profile photos */
                img[data-delayed-url*="profile"],
                .presence-entity__image img,
                .ivm-view-attr__img--centered img,
                button img[alt*="profile" i] {
                    border-radius: 0 !important;
                    clip-path: none !important;
                }
            `
        },

        // Messaging Apps
        whatsapp: {
            domains: ['web.whatsapp.com'],
            css: `
                /* WhatsApp comprehensive fixes */
                img[src*="blob:"], img[src*="data:image"],
                div[data-testid*="avatar"] img,
                div[data-testid="chat-list-item-container"] img,
                div[data-testid="conversation-header"] img,
                span[data-testid="default-user"] img {
                    border-radius: 0 !important;
                    clip-path: none !important;
                }

                /* Status and group icons */
                svg path.background {
                    display: none !important;
                }

                svg:has(path.background) {
                    background-color: rgba(255, 255, 255, 0.16) !important;
                }
            `
        },

        discord: {
            domains: ['discord.com', 'discordapp.com'],
            css: `
                /* Discord avatars and servers */
                img[class*="avatar"],
                div[class*="avatar"] img,
                img[src*="/avatars/"],
                div[data-list-item-id*="guildsnav"] img,
                foreignObject[mask*="url(#"] img {
                    border-radius: 0 !important;
                    clip-path: none !important;
                }

                /* Server icons */
                div[class*="wrapper"] > div[style*="border-radius"] {
                    border-radius: 0 !important;
                }
            `
        },

        slack: {
            domains: ['slack.com'],
            css: `
                /* Slack profile pictures */
                img[data-qa="member_image"],
                img[class*="c-avatar"],
                .c-base_icon img,
                img[src*="/team_assets/"] {
                    border-radius: 0 !important;
                    clip-path: none !important;
                }
            `
        },

        // Google Services
        google: {
            domains: ['google.com', 'gmail.com', 'youtube.com', 'drive.google.com', 'photos.google.com'],
            css: `
                /* Google profile pictures */
                img.gb_Ia, img[aria-label*="Profile picture" i],
                img[src*="googleusercontent.com/a/"],
                img[jsname], img[data-src*="googleusercontent"],
                .Xb9hP img, .VfPpkd-kBDsod img {
                    border-radius: 0 !important;
                    clip-path: none !important;
                }

                /* YouTube thumbnails and avatars */
                yt-img-shadow img, #avatar img,
                img[class*="yt-"], .ytp-videowall-still img {
                    border-radius: 0 !important;
                }

                /* Google One multicolor outline fix */
                path[fill="#F6AD01"][d*="M4.02,28.27"] {
                    d: path("M 2 2 v 36 l 2 -2 V 4 Z") !important;
                }
                path[fill="#249A41"][d*="M32.15,33.27"] {
                    d: path("M 2 38 h 36 l -2 -2 H 4 Z") !important;
                }
                path[fill="#3174F1"][d*="M33.49,34.77"] {
                    d: path("M 38 2 v 36 l -2 -2 V 4 Z") !important;
                }
                path[fill="#E92D18"][d*="M20,2c4.65"] {
                    d: path("M 2 2 h 36 l -2 2 H 4 Z") !important;
                }
            `
        },

        // Microsoft Services
        microsoft: {
            domains: ['microsoft.com', 'outlook.com', 'live.com', 'office.com', 'copilot.microsoft.com'],
            css: `
                /* Microsoft avatars and logos */
                img[data-testid*="avatar"],
                img[aria-label*="profile" i],
                .ms-Persona-image img,
                [class*="squircle"],
                cib-serp-feedback::part(avatar-image),
                cib-participant-avatar::part(avatar-image) {
                    border-radius: 0 !important;
                    clip-path: none !important;
                }
            `
        },

        // Entertainment
        spotify: {
            domains: ['open.spotify.com', 'accounts.spotify.com'],
            css: `
                /* Spotify comprehensive fixes */
                img[data-testid*="avatar"], figure[data-testid*="avatar"] img,
                img[data-testid="user-widget-avatar"],
                div[data-testid="avatar"] img,
                div[data-encore-id="avatar"] img,
                img[class*="_6fa2d5efe1456f4e"] {
                    border-radius: 0 !important;
                    clip-path: none !important;
                }

                /* Spotify icon paths */
                path[d*="M1 12C1 5.925"] {
                    d: path("M 4 4 H 20 V 20 H 4 Z") !important;
                }
                path[d*="M0 8a8 8 0 1 1 16"] {
                    d: path("M 2 2 H 14 V 14 H 2 Z") !important;
                }
            `
        },

        netflix: {
            domains: ['netflix.com'],
            css: `
                /* Netflix profile avatars */
                .choose-profile .profile-icon,
                .account-menu-item img,
                img[data-uia*="profile"] {
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
                img.avatar, img[alt*="@"],
                .avatar img, img[data-hovercard-type="user"],
                img[src*="/avatars/"] {
                    border-radius: 0 !important;
                    clip-path: none !important;
                }
            `
        },

        stackoverflow: {
            domains: ['stackoverflow.com', 'stackexchange.com'],
            css: `
                /* Stack Overflow user avatars */
                img.bar-sm, img.s-avatar,
                .gravatar-wrapper-32 img,
                .user-gravatar32 img {
                    border-radius: 0 !important;
                }
            `
        }
    };

    // CSS injection with better error handling
    function injectCSS(css) {
        if (!css.trim()) return;

        try {
            if (typeof GM_addStyle !== "undefined") {
                GM_addStyle(css);
                utils.log('CSS injected via GM_addStyle');
            } else {
                injectFallbackCSS(css);
            }
        } catch (error) {
            utils.log('Error injecting CSS:', error);
            injectFallbackCSS(css);
        }
    }

    function injectFallbackCSS(css) {
        const styleNode = document.createElement("style");
        styleNode.setAttribute("type", "text/css");
        styleNode.setAttribute("data-unround", "true");
        styleNode.appendChild(document.createTextNode(css));

        const injectNode = () => {
            const target = document.head || document.documentElement;
            if (target) {
                target.appendChild(styleNode);
                utils.log('CSS injected via fallback method');
                return true;
            }
            return false;
        };

        if (!injectNode()) {
            const observer = new MutationObserver((mutations, obs) => {
                if (injectNode()) {
                    obs.disconnect();
                }
            });
            observer.observe(document.documentElement, {
                childList: true,
                subtree: true
            });
        }
    }

    // Dynamic content observer
    function setupDynamicObserver() {
        if (!CONFIG.enableDynamicObserver) return;

        const observer = new MutationObserver(utils.debounce((mutations) => {
            let needsUpdate = false;

            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1 && (
                            node.tagName === 'IMG' ||
                            node.querySelector && node.querySelector('img, svg, [style*="border-radius"], [class*="avatar"]')
                        )) {
                            needsUpdate = true;
                        }
                    });
                } else if (mutation.type === 'attributes' &&
                          ['style', 'class', 'src'].includes(mutation.attributeName)) {
                    needsUpdate = true;
                }
            });

            if (needsUpdate) {
                utils.log('Dynamic content detected, reapplying styles');
                applyDynamicFixes();
            }
        }, 250));

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class', 'src', 'data-testid', 'aria-label']
        });

        utils.log('Dynamic observer initialized');
    }

    // Apply fixes to dynamically loaded content
    function applyDynamicFixes() {
        // Force re-evaluation of inline styles
        const elementsWithInlineRadius = document.querySelectorAll('[style*="border-radius"], [style*="clip-path"]');
        elementsWithInlineRadius.forEach(el => {
            if (!el.hasAttribute('data-unround-preserve')) {
                el.style.borderRadius = '0';
                el.style.clipPath = 'none';
                el.style.webkitClipPath = 'none';
            }
        });
    }

    // Main initialization
    function init() {
        utils.log('Initializing Enhanced Unround Everything v3.0.0');

        let allCSS = [globalCSS, svgCSS];

        // Add site-specific CSS
        if (CONFIG.enableSiteSpecific) {
            Object.entries(siteConfigs).forEach(([siteName, config]) => {
                if (utils.matchesDomain(config.domains)) {
                    allCSS.push(config.css);
                    utils.log(`Applied ${siteName} specific rules`);
                }
            });
        }

        // Inject all CSS
        const finalCSS = utils.createCSS(allCSS);
        injectCSS(finalCSS);

        // Setup dynamic observer
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupDynamicObserver);
        } else {
            setupDynamicObserver();
        }

        // Apply initial dynamic fixes
        setTimeout(applyDynamicFixes, 1000);

        utils.log('Initialization complete');
    }

    // Handle iframe content
    function handleIframes() {
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            try {
                if (iframe.contentDocument) {
                    const iframeCSS = globalCSS + svgCSS;
                    const styleNode = iframe.contentDocument.createElement('style');
                    styleNode.textContent = iframeCSS;
                    iframe.contentDocument.head?.appendChild(styleNode);
                }
            } catch (e) {
                // Cross-origin iframe, can't access
                utils.log('Cannot access iframe content (cross-origin)');
            }
        });
    }

    // Enhanced initialization with better timing
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            init();
            setTimeout(handleIframes, 2000);
        });
    } else {
        init();
        setTimeout(handleIframes, 1000);
    }

    // Expose configuration for advanced users
    if (typeof unsafeWindow !== 'undefined') {
        unsafeWindow.unroundConfig = {
            toggle: (setting) => {
                CONFIG[setting] = !CONFIG[setting];
                GM_setValue(setting, CONFIG[setting]);
                location.reload();
            },
            getConfig: () => CONFIG,
            reload: () => location.reload()
        };
    }

})();