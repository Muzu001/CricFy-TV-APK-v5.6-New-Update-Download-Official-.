// Main JavaScript for CricFy TV website
(function() {
    'use strict';

    // Theme Management
    class ThemeManager {
        constructor() {
            this.themeToggle = document.getElementById('themeToggle');
            this.themeIcon = document.getElementById('themeIcon');
            this.currentTheme = localStorage.getItem('theme') || 'light';
            
            this.init();
        }

        init() {
            this.applyTheme(this.currentTheme);
            this.bindEvents();
        }

        bindEvents() {
            if (this.themeToggle) {
                this.themeToggle.addEventListener('click', () => {
                    this.toggleTheme();
                });
            }
        }

        toggleTheme() {
            this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
            this.applyTheme(this.currentTheme);
            localStorage.setItem('theme', this.currentTheme);
        }

        applyTheme(theme) {
            if (theme === 'dark') {
                document.body.classList.add('dark');
                if (this.themeIcon) {
                    this.themeIcon.textContent = '☀️';
                }
            } else {
                document.body.classList.remove('dark');
                if (this.themeIcon) {
                    this.themeIcon.textContent = '🌙';
                }
            }
        }
    }

    // Smooth Scrolling for Anchor Links
    class SmoothScroll {
        constructor() {
            this.init();
        }

        init() {
            document.addEventListener('click', (e) => {
                if (e.target.matches('a[href^="#"]')) {
                    e.preventDefault();
                    const targetId = e.target.getAttribute('href').substring(1);
                    const targetElement = document.getElementById(targetId);
                    
                    if (targetElement) {
                        const headerHeight = document.querySelector('.header').offsetHeight;
                        const targetPosition = targetElement.offsetTop - headerHeight - 20;
                        
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        }
    }

    // Header Scroll Effect
    class HeaderScroll {
        constructor() {
            this.header = document.querySelector('.header');
            this.lastScrollY = window.scrollY;
            this.init();
        }

        init() {
            window.addEventListener('scroll', () => {
                this.handleScroll();
            });
        }

        handleScroll() {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > 100) {
                this.header.style.background = 'rgba(255, 255, 255, 0.98)';
                this.header.style.backdropFilter = 'blur(20px)';
                this.header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            } else {
                this.header.style.background = 'rgba(255, 255, 255, 0.95)';
                this.header.style.backdropFilter = 'blur(10px)';
                this.header.style.boxShadow = 'none';
            }

            this.lastScrollY = currentScrollY;
        }
    }

    // Intersection Observer for Animations
    class AnimationObserver {
        constructor() {
            this.observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };
            this.init();
        }

        init() {
            if ('IntersectionObserver' in window) {
                this.observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('animate-in');
                        }
                    });
                }, this.observerOptions);

                // Observe elements that should animate in
                const animateElements = document.querySelectorAll('.featured-snippet, .quick-facts, .seo-checklist, .sources, .file-details, .security-notice, .quick-guide');
                animateElements.forEach(el => {
                    el.classList.add('animate-on-scroll');
                    this.observer.observe(el);
                });
            }
        }
    }

    // SEO Checklist Animation
    class SEOChecklist {
        constructor() {
            this.checklistItems = document.querySelectorAll('.checklist-item');
            this.init();
        }

        init() {
            if (this.checklistItems.length > 0) {
                this.animateChecklist();
            }
        }

        animateChecklist() {
            this.checklistItems.forEach((item, index) => {
                setTimeout(() => {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        item.style.transition = 'all 0.5s ease';
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, 100);
                }, index * 200);
            });
        }
    }

    // Mobile Menu (if needed in future)
    class MobileMenu {
        constructor() {
            this.menuToggle = document.querySelector('.menu-toggle');
            this.navLinks = document.querySelector('.nav-links');
            this.init();
        }

        init() {
            if (this.menuToggle && this.navLinks) {
                this.bindEvents();
            }
        }

        bindEvents() {
            this.menuToggle.addEventListener('click', () => {
                this.toggleMenu();
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!this.menuToggle.contains(e.target) && !this.navLinks.contains(e.target)) {
                    this.closeMenu();
                }
            });
        }

        toggleMenu() {
            this.navLinks.classList.toggle('active');
            this.menuToggle.classList.toggle('active');
        }

        closeMenu() {
            this.navLinks.classList.remove('active');
            this.menuToggle.classList.remove('active');
        }
    }

    // Performance Monitoring
    class PerformanceMonitor {
        constructor() {
            this.init();
        }

        init() {
            // Monitor Core Web Vitals
            if ('web-vital' in window) {
                this.monitorWebVitals();
            }

            // Monitor page load performance
            window.addEventListener('load', () => {
                this.logPerformanceMetrics();
            });
        }

        monitorWebVitals() {
            // This would integrate with web-vitals library if available
            // For now, we'll use basic performance API
            if ('PerformanceObserver' in window) {
                // Monitor LCP
                new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    console.log('LCP:', lastEntry.startTime);
                }).observe({ entryTypes: ['largest-contentful-paint'] });

                // Monitor FID
                new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    entries.forEach(entry => {
                        console.log('FID:', entry.processingStart - entry.startTime);
                    });
                }).observe({ entryTypes: ['first-input'] });
            }
        }

        logPerformanceMetrics() {
            if ('performance' in window) {
                const navigation = performance.getEntriesByType('navigation')[0];
                console.log('Page Load Time:', navigation.loadEventEnd - navigation.fetchStart);
                console.log('DOM Content Loaded:', navigation.domContentLoadedEventEnd - navigation.fetchStart);
            }
        }
    }

    // Accessibility Enhancements
    class AccessibilityEnhancer {
        constructor() {
            this.init();
        }

        init() {
            this.enhanceKeyboardNavigation();
            this.addSkipLinks();
            this.improveScreenReaderExperience();
        }

        enhanceKeyboardNavigation() {
            // Add visible focus indicators
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    document.body.classList.add('keyboard-navigation');
                }
            });

            document.addEventListener('mousedown', () => {
                document.body.classList.remove('keyboard-navigation');
            });
        }

        addSkipLinks() {
            // Add skip to main content link
            const skipLink = document.createElement('a');
            skipLink.href = '#main-content';
            skipLink.textContent = 'Skip to main content';
            skipLink.className = 'skip-link';
            skipLink.style.cssText = `
                position: absolute;
                top: -40px;
                left: 6px;
                background: #3b82f6;
                color: white;
                padding: 8px;
                text-decoration: none;
                border-radius: 4px;
                z-index: 10000;
                transition: top 0.3s;
            `;

            skipLink.addEventListener('focus', () => {
                skipLink.style.top = '6px';
            });

            skipLink.addEventListener('blur', () => {
                skipLink.style.top = '-40px';
            });

            document.body.insertBefore(skipLink, document.body.firstChild);
        }

        improveScreenReaderExperience() {
            // Add aria-live region for dynamic content updates
            const liveRegion = document.createElement('div');
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'sr-only';
            liveRegion.style.cssText = `
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            `;
            document.body.appendChild(liveRegion);

            // Store reference for other scripts to use
            window.announceToScreenReader = (message) => {
                liveRegion.textContent = message;
                setTimeout(() => {
                    liveRegion.textContent = '';
                }, 1000);
            };
        }
    }

    // Error Handling
    class ErrorHandler {
        constructor() {
            this.init();
        }

        init() {
            window.addEventListener('error', (e) => {
                console.error('JavaScript Error:', e.error);
                // In production, you might want to send this to an error tracking service
            });

            window.addEventListener('unhandledrejection', (e) => {
                console.error('Unhandled Promise Rejection:', e.reason);
                // In production, you might want to send this to an error tracking service
            });
        }
    }

    // Initialize all components when DOM is ready
    function initializeApp() {
        new ThemeManager();
        new SmoothScroll();
        new HeaderScroll();
        new AnimationObserver();
        new SEOChecklist();
        new MobileMenu();
        new PerformanceMonitor();
        new AccessibilityEnhancer();
        new ErrorHandler();

        // Add CSS for animations
        const style = document.createElement('style');
        style.textContent = `
            .animate-on-scroll {
                opacity: 0;
                transform: translateY(30px);
                transition: all 0.6s ease;
            }
            
            .animate-on-scroll.animate-in {
                opacity: 1;
                transform: translateY(0);
            }
            
            .keyboard-navigation *:focus {
                outline: 2px solid #3b82f6 !important;
                outline-offset: 2px !important;
            }
        `;
        document.head.appendChild(style);

        console.log('CricFy TV website initialized successfully');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }

})();

