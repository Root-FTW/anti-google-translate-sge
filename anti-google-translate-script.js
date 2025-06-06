/**
 * Anti Google Translate Proxy Script - GTM Version
 * Optimized for Google Tag Manager deployment
 * Handles multiple Google translate patterns with GTM integration
 */

// Prevent multiple executions
if (window.antiGoogleTranslateLoaded) {
    return;
}
window.antiGoogleTranslateLoaded = true;

(function() {
    'use strict';
    
    // Configuration - Easily adjustable from GTM
    const CONFIG = {
        debug: {{Debug Mode}}, // GTM Variable (default: false)
        redirectDelay: {{Redirect Delay}}, // GTM Variable (default: 0)
        maxRetries: {{Max Retries}}, // GTM Variable (default: 3)
        trackingEnabled: {{Enable Tracking}}, // GTM Variable (default: true)
        excludedPaths: {{Excluded Paths}}, // GTM Variable (default: [])
        allowedDomains: {{Allowed Domains}} // GTM Variable (default: [])
    };

    // Fallback values if GTM variables are not defined
    const DEFAULTS = {
        debug: false,
        redirectDelay: 0,
        maxRetries: 3,
        trackingEnabled: true,
        excludedPaths: [],
        allowedDomains: []
    };

    // Apply defaults for undefined GTM variables
    Object.keys(DEFAULTS).forEach(key => {
        if (CONFIG[key] === undefined || CONFIG[key] === '{{' + key.replace(/([A-Z])/g, ' $1').trim() + '}}') {
            CONFIG[key] = DEFAULTS[key];
        }
    });

    // Logger utility
    const logger = {
        log: function(...args) {
            if (CONFIG.debug) {
                console.log('%c[AntiGoogleTranslate]', 'color: #4CAF50; font-weight: bold', ...args);
            }
        },
        warn: function(...args) {
            if (CONFIG.debug) {
                console.warn('%c[AntiGoogleTranslate]', 'color: #FF9800; font-weight: bold', ...args);
            }
        },
        error: function(...args) {
            console.error('%c[AntiGoogleTranslate]', 'color: #F44336; font-weight: bold', ...args);
        }
    };

    // GTM DataLayer integration
    const gtmTracker = {
        push: function(eventData) {
            if (!CONFIG.trackingEnabled) return;
            
            try {
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    event: 'antiGoogleTranslate',
                    eventCategory: 'Anti Google Translate',
                    eventAction: eventData.action,
                    eventLabel: eventData.label || '',
                    eventValue: eventData.value || undefined,
                    customData: eventData.customData || {},
                    timestamp: new Date().toISOString()
                });
                
                logger.log('GTM Event pushed:', eventData);
            } catch (error) {
                logger.error('GTM tracking failed:', error);
            }
        }
    };

    // URL utilities
    const urlUtils = {
        isGoogleTranslateProxy: function() {
            const hostname = window.location.hostname.toLowerCase();
            const patterns = [
                /\.translate\.goog$/,
                /translate\.googleusercontent\.com$/,
                /translate\.google\.(com|co\.|org|net|es|mx|com\.br|com\.ar|com\.co|com\.pe)/
            ];
            
            return patterns.some(pattern => pattern.test(hostname));
        },

        extractOriginalDomain: function(proxyHostname) {
            try {
                if (proxyHostname.includes('translate.goog')) {
                    return proxyHostname
                        .replace('.translate.goog', '')
                        .replace(/-/g, '.');
                }
                
                // Handle other Google Translate patterns
                const urlParams = new URLSearchParams(window.location.search);
                const originalUrl = urlParams.get('u');
                if (originalUrl) {
                    return new URL(decodeURIComponent(originalUrl)).hostname;
                }
            } catch (error) {
                logger.error('Failed to extract original domain:', error);
            }
            
            return null;
        },

        buildOriginalUrl: function(originalDomain) {
            if (!originalDomain) return null;
            
            const protocol = window.location.protocol;
            const pathname = window.location.pathname;
            const search = this.cleanSearchParams();
            const hash = window.location.hash;
            
            return protocol + '//' + originalDomain + pathname + search + hash;
        },

        cleanSearchParams: function() {
            const urlParams = new URLSearchParams(window.location.search);
            const googleParams = [
                '_x_tr_pto', '_x_tr_sl', '_x_tr_tl', '_x_tr_hl',
                'hl', 'sl', 'tl', 'u', 'prev', '_x_tr_hist'
            ];
            
            googleParams.forEach(param => urlParams.delete(param));
            
            const cleanParams = urlParams.toString();
            return cleanParams ? '?' + cleanParams : '';
        },

        isExcludedPath: function() {
            if (!Array.isArray(CONFIG.excludedPaths) || CONFIG.excludedPaths.length === 0) {
                return false;
            }
            
            const currentPath = window.location.pathname.toLowerCase();
            return CONFIG.excludedPaths.some(path => 
                currentPath.includes(path.toLowerCase())
            );
        },

        isAllowedDomain: function(domain) {
            if (!Array.isArray(CONFIG.allowedDomains) || CONFIG.allowedDomains.length === 0) {
                return true; // Allow all if no restrictions
            }
            
            return CONFIG.allowedDomains.some(allowedDomain => 
                domain.toLowerCase().includes(allowedDomain.toLowerCase())
            );
        }
    };

    // Detection engine
    const detector = {
        detectScenarios: function() {
            const urlParams = new URLSearchParams(window.location.search);
            const hostname = window.location.hostname.toLowerCase();
            const referrer = document.referrer.toLowerCase();
            
            const scenarios = [];
            
            // SGE/AI Overview detection
            if (urlParams.has('_x_tr_pto') && urlParams.get('_x_tr_pto') === 'sge') {
                scenarios.push('sge');
            }
            
            // Direct proxy detection
            if (urlUtils.isGoogleTranslateProxy()) {
                scenarios.push('proxy');
            }
            
            // Referrer detection
            if (referrer.includes('translate.google')) {
                scenarios.push('referrer');
            }
            
            // Translation parameters
            if (urlParams.has('_x_tr_sl') || urlParams.has('_x_tr_tl') || urlParams.has('_x_tr_hl')) {
                scenarios.push('translation_params');
            }
            
            // Iframe context
            if (window !== window.top) {
                try {
                    if (window.top.location.hostname.includes('translate.google')) {
                        scenarios.push('iframe');
                    }
                } catch (e) {
                    scenarios.push('iframe_cross_origin');
                }
            }
            
            return scenarios;
        },

        shouldRedirect: function(scenarios) {
            // Don't redirect if not on Google Translate proxy
            if (!urlUtils.isGoogleTranslateProxy()) {
                return false;
            }
            
            // Don't redirect if path is excluded
            if (urlUtils.isExcludedPath()) {
                logger.log('Path excluded from redirect');
                return false;
            }
            
            // Don't redirect if page is not visible (prefetch, etc.)
            if (document.visibilityState === 'prerender' || document.visibilityState === 'hidden') {
                return false;
            }
            
            return scenarios.length > 0;
        }
    };

    // Redirect handler with retry logic
    const redirectHandler = {
        attempts: 0,
        
        redirect: function(scenarios) {
            if (this.attempts >= CONFIG.maxRetries) {
                logger.error('Max redirect attempts reached');
                gtmTracker.push({
                    action: 'redirect_failed',
                    label: 'max_attempts_reached',
                    customData: { scenarios: scenarios, attempts: this.attempts }
                });
                return;
            }
            
            this.attempts++;
            
            try {
                const originalDomain = urlUtils.extractOriginalDomain(window.location.hostname);
                
                if (!originalDomain) {
                    throw new Error('Could not extract original domain');
                }
                
                if (!urlUtils.isAllowedDomain(originalDomain)) {
                    logger.warn('Domain not in allowed list:', originalDomain);
                    gtmTracker.push({
                        action: 'redirect_blocked',
                        label: 'domain_not_allowed',
                        customData: { domain: originalDomain }
                    });
                    return;
                }
                
                const originalUrl = urlUtils.buildOriginalUrl(originalDomain);
                
                if (!originalUrl) {
                    throw new Error('Could not build original URL');
                }
                
                logger.log('Redirecting to:', originalUrl);
                
                // Track redirect attempt
                gtmTracker.push({
                    action: 'redirect_initiated',
                    label: 'attempt_' + this.attempts,
                    customData: {
                        from: window.location.href,
                        to: originalUrl,
                        scenarios: scenarios,
                        originalDomain: originalDomain
                    }
                });
                
                // Perform redirect
                const executeRedirect = function() {
                    window.location.replace(originalUrl);
                };
                
                if (CONFIG.redirectDelay > 0) {
                    setTimeout(executeRedirect, CONFIG.redirectDelay);
                } else {
                    executeRedirect();
                }
                
            } catch (error) {
                logger.error('Redirect attempt failed:', error);
                
                if (this.attempts < CONFIG.maxRetries) {
                    const retryDelay = 100 * Math.pow(2, this.attempts - 1); // True exponential backoff
                    logger.log('Retrying in', retryDelay, 'ms');
                    setTimeout(() => this.redirect(scenarios), retryDelay);
                } else {
                    gtmTracker.push({
                        action: 'redirect_failed',
                        label: 'error',
                        customData: { 
                            error: error.message, 
                            scenarios: scenarios,
                            attempts: this.attempts
                        }
                    });
                }
            }
        }
    };

    // Main execution function
    function execute() {
        logger.log('Anti Google Translate script initialized');
        logger.log('Config:', CONFIG);
        
        try {
            const scenarios = detector.detectScenarios();
            
            logger.log('Detected scenarios:', scenarios);
            
            // Track detection
            gtmTracker.push({
                action: 'detection_completed',
                label: scenarios.length > 0 ? 'scenarios_found' : 'no_scenarios',
                customData: { 
                    scenarios: scenarios,
                    url: window.location.href,
                    isProxy: urlUtils.isGoogleTranslateProxy()
                }
            });
            
            if (scenarios.length === 0) {
                logger.log('No Google Translate scenarios detected');
                return;
            }
            
            if (detector.shouldRedirect(scenarios)) {
                logger.log('Initiating redirect...');
                redirectHandler.redirect(scenarios);
            } else {
                logger.log('Redirect conditions not met');
                gtmTracker.push({
                    action: 'redirect_skipped',
                    label: 'conditions_not_met',
                    customData: { scenarios: scenarios }
                });
            }
            
        } catch (error) {
            logger.error('Execution error:', error);
            gtmTracker.push({
                action: 'execution_error',
                label: 'script_error',
                customData: { error: error.message }
            });
        }
    }

    // Execute immediately since GTM handles timing
    execute();

    // Expose utilities for GTM debugging
    if (CONFIG.debug) {
        window.antiGoogleTranslateDebug = {
            config: CONFIG,
            utils: urlUtils,
            detector: detector,
            execute: execute
        };
    }

})();