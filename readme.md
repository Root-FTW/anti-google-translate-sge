# Anti Google Translate Proxy Script

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub issues](https://img.shields.io/github/issues/Root-FTW/anti-google-translate-sge)](https://github.com/Root-FTW/anti-google-translate-sge/issues)
[![GitHub stars](https://img.shields.io/github/stars/Root-FTW/anti-google-translate-sge)](https://github.com/Root-FTW/anti-google-translate-sge/stargazers)

> **Reclaim your international traffic from Google's automatic translation proxies**

A robust JavaScript solution that detects when users are accessing your website through Google's translation proxies and automatically redirects them to your original domain, ensuring proper traffic attribution and user experience.

## 🚨 The Problem

Since Google's March 2025 core update, Google has dramatically increased its use of automatic translation for English content into other languages. **The critical issue**: these translations are hosted on Google's subdomains (`translate.goog`, `translate.googleusercontent.com`), meaning:

- ❌ **You lose direct traffic** - Users never visit your actual domain
- ❌ **Analytics attribution breaks** - Traffic shows as `translate.google.com / referral` instead of `google / organic`
- ❌ **Revenue impact** - Conversions and sales are misattributed
- ❌ **Brand dilution** - Users see your content on Google's domain
- ❌ **SEO impact** - Your original pages get less direct engagement signals

### Real Impact Data

According to Ahrefs research, Google's translate proxy (`translate.google.com`) generates approximately:
- **377 million monthly organic visits**
- **6.2 million AI Overview appearances**
- **50.9 million pages indexed**

Top affected countries include India (136M visits), Indonesia (39M), Brazil (36.9M), Turkey (33.3M), and Mexico (28.3M).

## 🎯 The Solution

This script automatically detects various Google Translate proxy scenarios and seamlessly redirects users to your original website, ensuring:

- ✅ **Proper traffic attribution** in Google Analytics
- ✅ **Improved user experience** on your actual domain
- ✅ **Accurate conversion tracking**
- ✅ **Brand consistency**
- ✅ **Better engagement metrics**

## 🏗️ Architecture & Features

### Multi-Scenario Detection
- **SGE/AI Overviews** (`_x_tr_pto=sge` parameter)
- **Direct Google Translate proxies** (`.translate.goog` domains)
- **Google Translate referrals**
- **Translation URL parameters** (`_x_tr_sl`, `_x_tr_tl`, etc.)
- **Iframe contexts** (embedded translate widgets)
- **Cross-origin iframe restrictions**

### Robust Error Handling
- **Retry mechanism** with exponential backoff
- **URL validation** before redirect
- **Domain whitelist/blacklist** support
- **Path exclusion** capabilities
- **Fallback error recovery**

### Analytics Integration
- **Google Tag Manager** native integration
- **GA4 & Universal Analytics** support
- **Custom dataLayer events**
- **Detailed event tracking** (detection, redirects, failures)

### Performance Optimized
- **Lightweight** (~8KB minified)
- **Non-blocking execution**
- **Duplicate prevention**
- **Configurable delays**
- **Memory efficient**

## 🚀 Quick Start

### Option 1: Google Tag Manager (Recommended)

1. **Create GTM Variables** (Optional but recommended):
   ```
   Variable Name: Debug Mode | Type: Constant | Value: false
   Variable Name: Redirect Delay | Type: Constant | Value: 0  
   Variable Name: Max Retries | Type: Constant | Value: 3
   Variable Name: Enable Tracking | Type: Constant | Value: true
   ```

2. **Create Custom HTML Tag**:
   - Go to Tags → New → Custom HTML
   - Name: "Anti Google Translate Redirect"
   - Paste the script code
   - Trigger: All Pages (or Page View)
   - Priority: 100 (high priority)

3. **Publish** your GTM container

### Option 2: Direct Implementation

Add to your website's `<head>` section:

```html
<script>
// Paste the anti-google-translate script here
</script>
```

### Option 3: WordPress

Add to your theme's `functions.php`:

```php
function add_anti_google_translate_script() {
    ?>
    <script>
    // Paste the anti-google-translate script here
    </script>
    <?php
}
add_action('wp_head', 'add_anti_google_translate_script');
```

## ⚙️ Configuration

### Basic Configuration

The script uses sensible defaults but can be customized via GTM variables or direct code modification:

```javascript
const CONFIG = {
    debug: false,              // Enable detailed logging
    redirectDelay: 0,          // Delay before redirect (ms)
    maxRetries: 3,             // Maximum redirect attempts
    trackingEnabled: true,     // Enable analytics tracking
    excludedPaths: [],         // Paths to exclude from redirects
    allowedDomains: []         // Allowed target domains (empty = all)
};
```

### Advanced Configuration Examples

**Exclude admin areas:**
```javascript
excludedPaths: ["/admin", "/wp-admin", "/dashboard"]
```

**Restrict to specific domains:**
```javascript
allowedDomains: ["yourdomain.com", "www.yourdomain.com", "subdomain.yourdomain.com"]
```

**Add redirect delay for debugging:**
```javascript
redirectDelay: 2000  // 2 second delay
```

## 📊 Analytics & Tracking

### Google Tag Manager Events

The script automatically pushes comprehensive events to the dataLayer with detailed tracking information:

```javascript
// Complete event structure
{
  event: 'antiGoogleTranslate',
  eventCategory: 'Anti Google Translate',
  eventAction: 'redirect_initiated', // See Event Types below
  eventLabel: 'attempt_1', // attempt_1, attempt_2, attempt_3
  customData: {
    from: 'https://www-yoursite-com.translate.goog/page?_x_tr_pto=sge',
    to: 'https://www.yoursite.com/page',
    scenarios: ['sge', 'proxy'], // Array of detected scenarios
    originalDomain: 'www.yoursite.com',
    detectionMethod: 'url_analysis', // url_analysis, referrer, parameters
    userAgent: 'Mozilla/5.0...', // Browser information
    timestamp: '2024-01-15T10:30:00.000Z',
    sessionId: 'sess_abc123', // Unique session identifier
    retryCount: 1, // Current retry attempt
    redirectDelay: 100, // Delay in milliseconds
    excludedPaths: [], // Any excluded paths detected
    securityValidation: {
      domainWhitelisted: true,
      pathAllowed: true,
      originVerified: true
    }
  }
}
```

### Event Types

| Event Action | Description |
|--------------|-------------|
| `detection_completed` | Script detected Google Translate scenarios |
| `redirect_initiated` | Redirect process started |
| `redirect_failed` | Redirect failed after max retries |
| `redirect_skipped` | Conditions not met for redirect |
| `redirect_blocked` | Domain not in allowlist |
| `execution_error` | Script execution error |

### Google Analytics 4 Setup

Create a GA4 tag in GTM:
- **Event Name**: `anti_google_translate`
- **Trigger**: Custom Event `antiGoogleTranslate`
- **Parameters**:
  - `action`: `{{DLV - eventAction}}`
  - `from_url`: `{{DLV - customData.from}}`
  - `to_url`: `{{DLV - customData.to}}`
  - `scenarios`: `{{DLV - customData.scenarios}}`

## 🔍 How It Works: Advanced Detection Engine

### Multi-Layer Detection Process

The script employs a sophisticated 6-scenario detection system:

1. **SGE/AI Overview Detection**: Identifies `_x_tr_pto=sge` parameter indicating Search Generative Experience
2. **Direct Proxy Detection**: Matches `.translate.goog`, `translate.googleusercontent.com` domains
3. **Referrer Analysis**: Examines `document.referrer` for Google Translate origins
4. **Translation Parameters**: Detects `_x_tr_sl`, `_x_tr_tl`, `_x_tr_hl` parameters
5. **Iframe Context**: Identifies embedded translate widgets
6. **Cross-Origin Iframe**: Safely handles iframe restrictions with try-catch

### Advanced Detection Patterns

```javascript
// Domain patterns covered
const patterns = [
    /\.translate\.goog$/,
    /translate\.googleusercontent\.com$/,
    /translate\.google\.(com|co\.|org|net|es|mx|com\.br|com\.ar|com\.co|com\.pe)/
];

// Parameter detection
const googleParams = [
    '_x_tr_pto', '_x_tr_sl', '_x_tr_tl', '_x_tr_hl',
    'hl', 'sl', 'tl', 'u', 'prev', '_x_tr_hist'
];
```

### Smart URL Reconstruction

**Domain Transformation Logic:**
- `www-example-com.translate.goog` → `www.example.com`
- `subdomain-site-com.translate.goog` → `subdomain.site.com`
- Preserves original path, clean parameters, and hash fragments

### Intelligent Redirect Process

1. **Domain Extraction**: Advanced parsing with regex patterns for complex subdomains
2. **URL Reconstruction**: Rebuilds clean original URL preserving all legitimate parameters
3. **Security Validation**: Checks against domain whitelist and path exclusions
4. **Parameter Cleaning**: Removes all Google Translate artifacts while preserving original query strings
5. **Exponential Backoff Execution**: Smart retry system with increasing delays (100ms, 200ms, 400ms)

### Retry Logic with Exponential Backoff

```javascript
// Retry configuration
const retryConfig = {
    maxRetries: 3,
    baseDelay: 100, // milliseconds
    backoffMultiplier: 2
};

// Delay calculation: baseDelay * (backoffMultiplier ^ attempt)
// Attempt 1: 100ms
// Attempt 2: 200ms  
// Attempt 3: 400ms
```

This prevents overwhelming the target server while ensuring reliable redirects even under network stress.

### Comprehensive URL Transformation Examples

| Scenario | Google Translate Proxy | Original URL | Notes |
|----------|------------------------|--------------|-------|
| **SGE Detection** | `www-example-com.translate.goog/page?_x_tr_pto=sge&param=value` | `https://www.example.com/page?param=value` | Preserves original parameters |
| **Complex Subdomain** | `api-v2-staging-example-com.translate.goog/endpoint` | `https://api-v2-staging.example.com/endpoint` | Handles multiple hyphens |
| **GoogleUserContent** | `translate.googleusercontent.com/translate?u=https%3A//shop.example.com%2Fcart` | `https://shop.example.com/cart` | URL decoding |
| **With Hash Fragment** | `blog-example-com.translate.goog/post#section?_x_tr_sl=en` | `https://blog.example.com/post#section` | Preserves hash |
| **Query Parameters** | `www-example-com.translate.goog/search?q=test&_x_tr_tl=es&sort=date` | `https://www.example.com/search?q=test&sort=date` | Filters translate params |
| **International Domain** | `tienda-ejemplo-es.translate.goog/productos?_x_tr_hl=en` | `https://tienda.ejemplo.es/productos` | Non-English domains |

### Parameter Cleaning Logic

```javascript
// Parameters removed during transformation
const translateParams = [
    '_x_tr_pto', '_x_tr_sl', '_x_tr_tl', '_x_tr_hl',
    '_x_tr_hist', 'hl', 'sl', 'tl', 'u', 'prev'
];

// Original parameters preserved
const preservedParams = ['utm_source', 'utm_medium', 'ref', 'id', 'page', 'search'];
```

## 🛡️ Security & Performance Features

### Enterprise-Grade Security

- **Domain Whitelist Protection**: Configurable allowlist prevents redirects to unauthorized domains
- **Path Exclusion System**: Protects sensitive areas with regex patterns (`/admin/`, `/checkout/`, `/api/`, `/login/`)
- **Cross-Origin Safety**: Graceful iframe handling with try-catch for `document.referrer` access
- **URL Validation**: Multi-layer validation including protocol, domain format, and malicious pattern detection
- **Rate Limiting**: Built-in retry limits (max 3 attempts) prevent infinite loops and server overload
- **XSS Prevention**: Sanitizes all URL parameters before processing
- **CSRF Protection**: Validates referrer origins to prevent cross-site request forgery

### Integrated Security Validations

```javascript
// Security validation pipeline
const securityChecks = {
    validateDomain: (domain) => {
        // Check against whitelist
        // Validate domain format
        // Prevent localhost/internal IPs
    },
    validatePath: (path) => {
        // Check excluded paths
        // Prevent directory traversal
        // Validate URL encoding
    },
    validateOrigin: (referrer) => {
        // Verify Google Translate origin
        // Prevent spoofed referrers
    }
};
```

### Performance Optimization

- **Lightweight Footprint**: ~8KB minified, minimal impact on page load
- **Non-Blocking Execution**: Doesn't interfere with page rendering
- **Efficient Detection**: Optimized pattern matching for fast execution
- **Memory Management**: Prevents memory leaks with proper cleanup
- **Duplicate Prevention**: Ensures script runs only once per page

### Reliability Features

- **Exponential Backoff**: Smart retry mechanism for failed redirects
- **Error Recovery**: Graceful handling of network issues
- **Fallback Mechanisms**: Multiple detection methods ensure coverage
- **Browser Compatibility**: Works across all modern browsers
- **Mobile Optimization**: Fully functional on mobile devices

### Advanced Debug Mode Features

When debug mode is enabled (`debugMode: true` in GTM), the script exposes comprehensive debugging utilities:

```javascript
// Access debug utilities in browser console
window.antiGoogleTranslateDebug = {
    config: {
        debugMode: true,
        redirectDelay: 100,
        maxRetries: 3,
        enableTracking: true,
        excludedPaths: ['/admin/', '/checkout/'],
        allowedDomains: ['yoursite.com']
    },
    utils: {
        isGoogleTranslateProxy: (url) => boolean,
        extractOriginalDomain: (proxyUrl) => string,
        buildOriginalUrl: (proxyUrl) => string,
        cleanSearchParams: (url) => string
    },
    detector: {
        scenarios: {
            sge: () => boolean,
            proxy: () => boolean,
            referrer: () => boolean,
            parameters: () => boolean,
            iframe: () => boolean,
            crossOriginIframe: () => boolean
        },
        shouldRedirect: () => boolean
    },
    execute: () => void, // Manual execution
    logs: [] // Debug log history
};

// Example debug usage
console.log('Current detection:', window.antiGoogleTranslateDebug.detector.scenarios);
console.log('Should redirect:', window.antiGoogleTranslateDebug.detector.shouldRedirect());
```

### Debug Console Output

```javascript
// Detailed logging in debug mode
[Anti-Google-Translate] Detection started
[Anti-Google-Translate] SGE scenario: true (_x_tr_pto=sge detected)
[Anti-Google-Translate] Proxy scenario: true (translate.goog domain)
[Anti-Google-Translate] Original domain extracted: www.example.com
[Anti-Google-Translate] Security validation passed
[Anti-Google-Translate] Redirect initiated (attempt 1/3)
[Anti-Google-Translate] GTM event pushed: redirect_initiated
```

## 📈 Business Impact & ROI

### Immediate Financial Benefits

**Traffic Recovery:**
- Reclaim millions of lost international visits
- Convert misattributed referral traffic back to organic
- Restore proper conversion attribution

**Revenue Impact:**
- **E-commerce**: Properly attribute international sales
- **Lead Generation**: Capture leads on your domain, not Google's
- **Advertising**: Improve attribution for international ad campaigns
- **Subscriptions**: Ensure international users convert on your platform

### Long-term Strategic Advantages

**SEO Benefits:**
- Improved engagement metrics on your actual domain
- Better user behavior signals for search rankings
- Enhanced brand authority and domain strength

**Competitive Edge:**
- Reclaim traffic competitors might be losing to Google
- Better international market penetration
- Improved analytics data for business decisions

### Case Study Projections

Based on Ahrefs data, if your site receives even 0.1% of the 377M monthly translate.google.com visits:
- **Potential recovered traffic**: 377,000 monthly visits
- **Improved attribution**: 100% of recovered traffic properly attributed
- **Revenue impact**: Varies by conversion rate and average order value

## 🔬 Technical Excellence

### Code Quality Standards

**Architecture:**
- ✅ Modular, maintainable codebase
- ✅ Separation of concerns (detection, tracking, redirection)
- ✅ Comprehensive error handling
- ✅ Extensive logging and debugging capabilities

**Performance:**
- ✅ Optimized for minimal performance impact
- ✅ Efficient pattern matching algorithms
- ✅ Memory-conscious implementation
- ✅ Non-blocking execution model

**Reliability:**
- ✅ Robust retry mechanisms
- ✅ Graceful degradation
- ✅ Cross-browser compatibility
- ✅ Mobile-first design

**Security:**
- ✅ Input validation and sanitization
- ✅ Domain whitelist protection
- ✅ Safe URL construction
- ✅ XSS prevention measures

## 🔒 Security Considerations

### Domain Validation

The script includes several security measures:

```javascript
// Domain whitelist prevents malicious redirects
allowedDomains: ["trusted-domain.com"]

// Path exclusion protects sensitive areas  
excludedPaths: ["/admin", "/api", "/auth"]

// URL validation prevents injection attacks
validateOriginalUrl(url) // Built-in validation
```

### Privacy Compliance

- ✅ **GDPR Compliant**: No personal data collection
- ✅ **No cookies**: Uses only session data
- ✅ **Local processing**: All logic runs client-side
- ✅ **Transparent**: Open source and auditable

## 🌍 Research Foundation & Inspiration

This project is built on extensive research and analysis of the Google Translate proxy problem:

### Primary Research Sources

1. **Ahrefs Analysis**: ["Google Is Stealing Your International Search Traffic With Automated Translations"](https://ahrefs.com/blog/google-is-stealing-your-international-search-traffic-with-automated-translations/)
   - Documented the 377M monthly visits to translate.google.com
   - Identified the March 2025 core update impact
   - Provided country-by-country traffic analysis

2. **SEO Expert Insights**: Patrick Stox's analysis of Google's hreflang hypocrisy
   - Highlighted Google's contradictory approach to translation
   - Documented the shift from helping creators to capturing traffic

3. **GSQI Case Study**: ["Auto-translating Content & Google's Scaled Content Abuse"](https://www.gsqi.com/marketing-blog/auto-translating-content-google-scaled-content-abuse/)
   - Reddit's massive AI translation implementation (2.3M+ URLs per country)
   - Google's inconsistent policy enforcement
   - Evidence of Google's "sanctioned" approach to AI translations

### Why This Solution is Necessary

Traditional solutions suggested by SEO experts require:
- **Months of content creation**
- **Significant translation budgets**
- **Ongoing maintenance overhead**
- **Technical SEO expertise**

This script provides:
- **Immediate implementation** (minutes, not months)
- **Zero content requirements**
- **Automatic operation**
- **Universal compatibility**

## 🎯 Conclusion: Your Traffic Recovery Solution

As Google continues to expand its automatic translation program to capture international traffic, website owners need immediate solutions to protect their business interests. This script represents a practical, technical response to a documented problem affecting millions of websites worldwide.

**The choice is clear:**
- ❌ **Do nothing**: Continue losing international traffic to Google's proxies
- ❌ **Traditional approach**: Spend months creating native content
- ✅ **This solution**: Implement immediately and start recovering traffic today

### Implementation Priority

Given the scale of the problem (377M monthly visits to Google's proxies), implementing this solution should be considered **high priority** for any website with international traffic potential.

**Start recovering your traffic today.**

## 🚨 Edge Cases & Limitations

### Known Limitations

1. **Client-side only**: Cannot prevent Google from creating proxies
2. **User agent dependent**: Some bots may not trigger redirects
3. **Network dependent**: Requires JavaScript enabled
4. **Timing sensitive**: Race conditions with page load

### Handled Edge Cases

- ✅ **Multiple domain formats** (`www-site-com` vs `site-com`)
- ✅ **Complex URL structures** (subdomains, paths, parameters)
- ✅ **Iframe contexts** (embedded translate widgets)
- ✅ **Mobile browsers** (responsive design)
- ✅ **Slow connections** (retry mechanism)

## 📋 Migration Guide

### From Manual Redirects

If you currently have manual redirect code:

1. **Remove existing** redirect scripts
2. **Implement this solution** via GTM or direct
3. **Test thoroughly** with debug mode enabled
4. **Monitor analytics** for improved attribution

### From Server-side Solutions

Server-side redirects won't work for Google's proxies since they serve the content directly. This client-side approach is specifically designed for this scenario.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md).

### Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Root-FTW/anti-google-translate-sge.git
   cd anti-google-translate-sge
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run tests**:
   ```bash
   npm test
   ```

4. **Build minified version**:
   ```bash
   npm run build
   ```

### Reporting Issues

Please use our [GitHub Issues](https://github.com/Root-FTW/anti-google-translate-sge/issues) to report:

- 🐛 **Bugs**: Unexpected behavior or errors
- 💡 **Feature requests**: New functionality ideas  
- 📚 **Documentation**: Improvements or corrections
- ❓ **Questions**: Implementation help

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.



---

**⭐ If this project helped you reclaim your international traffic, please consider giving it a star!**

## 📚 Implementation Guide & Best Practices

### Pre-Implementation Checklist

**Assessment Phase:**
- [ ] Check Search Console for "Translated Pages" data
- [ ] Analyze referral traffic from translate.google.com
- [ ] Identify affected countries/languages
- [ ] Estimate potential traffic recovery

**Technical Preparation:**
- [ ] Backup current analytics configuration
- [ ] Identify paths to exclude (admin, checkout, etc.)
- [ ] Prepare domain whitelist if needed
- [ ] Set up testing environment

### Testing & Validation

**Pre-Launch Testing:**
1. **GTM Preview Mode**: Test all scenarios in preview
2. **Manual Testing**: Use translate.google.com to access your site
3. **Analytics Verification**: Confirm events fire correctly
4. **Mobile Testing**: Verify mobile compatibility
5. **Performance Check**: Monitor page load impact

**Post-Launch Monitoring:**
- Monitor redirect success rates
- Track recovered traffic volume
- Verify attribution improvements
- Check for any technical issues

### Troubleshooting Guide

**Script Not Executing:**
```javascript
// Enable debug mode to see console logs
CONFIG.debug = true;
```
- Check browser console for errors
- Verify GTM container is published
- Ensure script loads on all pages
- Confirm no JavaScript conflicts

**Redirects Not Working:**
- Enable debug mode for detailed logging
- Check if current path is excluded
- Verify domain is in whitelist (if configured)
- Test with different Google Translate URLs

**Analytics Issues:**
- Confirm dataLayer exists before script execution
- Check GTM preview mode for event firing
- Verify GA4 tag configuration
- Test with GTM debug extension

### Performance Optimization

**High-Traffic Sites:**
```javascript
// Add small delay to prevent server overload
redirectDelay: 100
```

**Resource-Constrained Environments:**
```javascript
// Disable tracking to reduce overhead
trackingEnabled: false
```

### Security Considerations

**Domain Security:**
```javascript
// Always use domain whitelist for production
allowedDomains: ["yourdomain.com", "www.yourdomain.com"]
```

**Path Protection:**
```javascript
// Protect sensitive areas
excludedPaths: ["/admin", "/api", "/checkout", "/login"]
```

### Monitoring & Maintenance

**Key Metrics to Track:**
- Redirect success rate
- Recovered traffic volume
- Attribution improvement
- Geographic distribution
- Technical error rate

**Regular Maintenance:**
- Monitor Google Translate pattern changes
- Update excluded paths as needed
- Review domain whitelist
- Analyze performance impact

### Advanced Use Cases

**Multi-Brand Organizations:**
- Deploy separate configurations per brand
- Use brand-specific domain whitelists
- Implement brand-specific tracking

**International Franchises:**
- Configure country-specific exclusions
- Implement region-based tracking
- Monitor franchise-level impact

**Enterprise Deployments:**
- Use GTM workspaces for testing
- Implement approval workflows
- Set up automated monitoring
- Create custom dashboards

## 🆘 Support & Community

### Getting Help

**Technical Issues:**
1. Enable debug mode and check console logs
2. Review this documentation thoroughly
3. Test in GTM preview mode
4. Check for JavaScript conflicts

**Business Questions:**
- Review the impact data and case studies
- Analyze your specific traffic patterns
- Consider your international market strategy

### Contributing

This project addresses a critical issue affecting millions of websites. Contributions, improvements, and real-world case studies are welcome.

**Areas for Contribution:**
- Additional Google Translate pattern detection
- Performance optimizations
- Integration with other analytics platforms
- Industry-specific configurations
- Case studies and impact data

---

**Remember**: Every day you delay implementation is another day of lost international traffic. The 377 million monthly visits to Google's translation proxies represent massive opportunity for traffic recovery.

**Start today. Reclaim your traffic tomorrow.**

---

*Last updated: June 2025*