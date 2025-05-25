# 🔲 Enhanced Unround Everything Everywhere

[![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)](https://github.com/user/enhanced-unround-everything)
[![License](https://img.shields.io/badge/license-CC0--1.0-green.svg)](https://creativecommons.org/publicdomain/zero/1.0/)
[![Compatibility](https://img.shields.io/badge/userscript-Tampermonkey%20%7C%20Greasemonkey-orange.svg)](https://www.tampermonkey.net/)
[![Sites](https://img.shields.io/badge/sites-50%2B-brightgreen.svg)](#supported-sites)

A powerful userscript that forces zero border-radius and removes clipping/masking across the web for clean, square corners. Perfect for users who prefer geometric precision over rounded design trends.

## ✨ Features

### 🚀 **Performance Optimized**
- **Selective targeting** instead of universal selectors for better performance
- **Debounced mutation observer** prevents excessive DOM queries
- **CSS layers** for optimal cascade management
- **Efficient memory usage** with smart cleanup

### 🎯 **Smart Targeting**
- **50+ popular sites** with custom optimizations
- **Dynamic content support** for SPAs and AJAX-loaded content
- **Iframe compatibility** for embedded content
- **Preserve mechanism** for elements that should stay rounded

### ⚙️ **Highly Configurable**
- **Persistent user preferences** via userscript storage
- **Debug mode** for troubleshooting
- **Site-specific toggles** for granular control
- **Runtime configuration** via browser console

### 🛡️ **Non-Destructive**
- **Preserves functionality** of interactive elements
- **Smart element detection** prevents breaking UI components
- **Graceful fallbacks** if userscript APIs are unavailable
- **Comprehensive error handling**

## 📦 Installation

### Prerequisites
- A userscript manager like [Tampermonkey](https://www.tampermonkey.net/) or [Greasemonkey](https://www.greasespot.net/)

### Install Steps

1. **Install a userscript manager** (if you haven't already)
2. **Click to install**: [Enhanced Unround Everything.user.js](https://github.com/ODRise/URE/raw/refs/heads/main/enhanced-unround-everything.user.js)
3. **Confirm installation** in your userscript manager
4. **Refresh any open tabs** to apply changes

### Manual Installation

```bash
# Download the script
curl -o enhanced-unround-everything.user.js https://raw.githubusercontent.com/user/repo/main/enhanced-unround-everything.user.js

# Or clone the repository
git clone https://github.com/user/enhanced-unround-everything.git
```

## 🎛️ Configuration

### Runtime Configuration

Access the configuration API via browser console:

```javascript
// Toggle debug mode
unsafeWindow.unroundConfig.toggle('debugMode');

// View current configuration
unsafeWindow.unroundConfig.getConfig();

// Disable global rules (for testing specific sites)
unsafeWindow.unroundConfig.toggle('enableGlobalRules');

// Toggle site-specific optimizations
unsafeWindow.unroundConfig.toggle('enableSiteSpecific');

// Disable SVG modifications
unsafeWindow.unroundConfig.toggle('enableSVGFixes');

// Turn off dynamic content observer
unsafeWindow.unroundConfig.toggle('enableDynamicObserver');

// Reload page with new settings
unsafeWindow.unroundConfig.reload();
```

### Available Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `enableGlobalRules` | `true` | Apply universal unrounding rules |
| `enableSiteSpecific` | `true` | Use site-specific optimizations |
| `enableSVGFixes` | `true` | Modify SVG elements (avatars, icons) |
| `enableDynamicObserver` | `true` | Watch for dynamically loaded content |
| `redditCompatibilityMode` | `true` | Enhanced Reddit UI preservation |
| `debugMode` | `false` | Enable console logging for troubleshooting |

## 🌐 Supported Sites

### Social Media
- **Facebook** / **Meta Workplace** - Profile pictures, stories, logos
- **Twitter** / **X** - Avatars, profile images, embedded media
- **Instagram** - Profile photos, story rings, post images
- **LinkedIn** - Professional headshots, company logos
- **Reddit** - User avatars, post thumbnails (with UI preservation)
- **Discord** - User avatars, server icons, emoji
- **TikTok** - Profile pictures, video thumbnails

### Messaging & Communication
- **WhatsApp Web** - Profile photos, status images, group icons
- **Slack** - User avatars, workspace icons, file previews
- **Microsoft Teams** - Profile pictures, meeting avatars
- **Zoom** - Participant avatars, profile images

### Productivity & Development
- **Google Services** (Gmail, Drive, Photos, YouTube) - Account avatars, thumbnails
- **Microsoft 365** (Outlook, OneDrive, Office) - Profile pictures, document previews
- **GitHub** - User avatars, organization logos, repository images
- **GitLab** - Profile photos, project avatars
- **Stack Overflow** - User gravatar images, badges
- **Notion** - Profile pictures, page icons
- **Trello** - User avatars, board covers
- **Figma** - Profile photos, team avatars

### Entertainment & Media
- **Spotify** - User avatars, playlist covers, artist images
- **Netflix** - Profile avatars, show thumbnails
- **YouTube** - Channel avatars, video thumbnails, comments
- **Twitch** - Streamer avatars, chat emotes
- **Apple Music** - Profile pictures, album artwork

### Enterprise & Business
- **Salesforce** - User profiles, contact photos
- **Microsoft Copilot** - AI assistant avatars, user profiles
- **Zoom** - Meeting participants, profile images
- **Seznam Zprávy** - Article thumbnails, author photos

### Global Coverage
- **Universal selectors** for any site with common avatar/profile patterns
- **Dynamic detection** for new sites and updated designs
- **Fallback rules** for unlisted domains

## 🔧 Technical Details

### Architecture

```
Enhanced Unround Everything
├── Global CSS Rules
│   ├── Universal unrounding selectors
│   ├── Modern CSS properties (logical properties, masks)
│   └── Form compatibility layer
├── Site-Specific Modules
│   ├── Domain detection
│   ├── Custom CSS injection
│   └── Element preservation
├── Dynamic Content Handler
│   ├── Mutation observer
│   ├── Debounced updates
│   └── Performance optimization
└── Configuration System
    ├── Persistent storage
    ├── Runtime API
    └── Debug utilities
```

### CSS Strategy

1. **Layered Approach**: Uses CSS `@layer` for proper cascade management
2. **Selective Targeting**: Focuses on likely avatar/media elements
3. **Preservation System**: Marks important UI elements to avoid modification
4. **Modern Properties**: Leverages latest CSS features for better coverage

### Performance Considerations

- **Debounced observers** (250ms delay) prevent excessive DOM queries
- **Efficient selectors** target specific element types rather than universal `*`
- **Smart caching** reduces repeated calculations
- **Memory cleanup** prevents observer leaks

## 🐛 Troubleshooting

### Common Issues

**Site functionality broken after installation**
```javascript
// Disable global rules temporarily
unsafeWindow.unroundConfig.toggle('enableGlobalRules');
```

**Some elements still rounded**
```javascript
// Enable debug mode to see what's happening
unsafeWindow.unroundConfig.toggle('debugMode');
// Check console for element detection logs
```

**Reddit UI not working properly**
```javascript
// Ensure Reddit compatibility mode is enabled
unsafeWindow.unroundConfig.getConfig().redditCompatibilityMode; // should be true
```

**Performance issues on heavy sites**
```javascript
// Disable dynamic observer if needed
unsafeWindow.unroundConfig.toggle('enableDynamicObserver');
```

### Debug Information

When debug mode is enabled, the script logs:
- Applied site-specific rules
- Dynamic content detection
- Element preservation
- Configuration changes
- Performance metrics

## 🤝 Contributing

### Adding New Sites

1. **Identify target elements** using browser dev tools
2. **Create site configuration** in the `siteConfigs` object:

```javascript
newSite: {
    domains: ['example.com', 'subdomain.example.com'],
    css: `
        /* Site-specific CSS rules */
        .avatar img {
            border-radius: 0 !important;
            clip-path: none !important;
        }
    `
}
```

3. **Test thoroughly** to ensure UI functionality is preserved
4. **Submit a pull request** with your changes

### Reporting Issues

When reporting bugs, please include:
- Browser and userscript manager versions
- Specific site URL where issue occurs
- Console logs with debug mode enabled
- Expected vs actual behavior

### Development Setup

```bash
# Clone the repository
git clone https://github.com/user/enhanced-unround-everything.git
cd enhanced-unround-everything

# Install development dependencies (optional)
npm install

# Run tests (if available)
npm test
```

## 📋 Changelog

### v3.0.0 (Current)
- ✨ **50+ site configurations** with custom optimizations
- 🚀 **Performance improvements** with selective targeting
- 🛡️ **Enhanced preservation system** for UI elements
- ⚙️ **Runtime configuration API** for easy customization
- 🔧 **Reddit compatibility mode** with smart UI preservation
- 📱 **Dynamic content support** for modern SPAs
- 🎯 **Better error handling** and graceful fallbacks

### v2.0.0 (Original)
- Basic global unrounding rules
- Limited site-specific fixes
- Simple CSS injection

## 📜 License

This project is released into the **public domain** under the [CC0 1.0 Universal License](https://creativecommons.org/publicdomain/zero/1.0/).

You can copy, modify, and distribute this work, even for commercial purposes, without asking permission.

## 🙏 Acknowledgments

- Original concept inspired by the need for geometric consistency in web design
- Thanks to the userscript community for testing and feedback
- Built with modern web standards and best practices

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/user/enhanced-unround-everything/issues)
- **Discussions**: [GitHub Discussions](https://github.com/user/enhanced-unround-everything/discussions)
- **Updates**: [Releases](https://github.com/user/enhanced-unround-everything/releases)

---

**Made with ⬜ by developers who prefer square corners**
