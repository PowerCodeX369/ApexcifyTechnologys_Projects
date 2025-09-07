// ========================================
// GLOBAL VARIABLES & UTILITIES
// ========================================

let isLoaded = false;
let scrollPosition = 0;
let ticking = false;

// Utility functions
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// ========================================
// PRELOADER
// ========================================

function initPreloader() {
    const preloader = $('.preloader');
    if (!preloader) return;

    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('hidden');
            document.body.style.overflow = '';
            isLoaded = true;
        }, 1000);
    });
}

// ========================================
// CUSTOM CURSOR
// ========================================

function initCustomCursor() {
    if (window.innerWidth <= 576) return; // Disable on mobile

    const cursor = $('.cursor');
    const cursorFollower = $('.cursor-follower');
    
    if (!cursor || !cursorFollower) return;

    let mouseX = 0;
    let mouseY = 0;
    let followerX = 0;
    let followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        cursor.style.transform = `translate3d(${mouseX - 10}px, ${mouseY - 10}px, 0)`;
    });

    // Smooth follower animation
    function animateFollower() {
        followerX += (mouseX - followerX) * 0.1;
        followerY += (mouseY - followerY) * 0.1;
        
        cursorFollower.style.transform = `translate3d(${followerX - 20}px, ${followerY - 20}px, 0)`;
        
        requestAnimationFrame(animateFollower);
    }
    animateFollower();

    // Cursor interactions
    const interactiveElements = $$('a, button, input, textarea, select, [role="button"]');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform += ' scale(1.5)';
            cursorFollower.style.transform += ' scale(0.8)';
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = cursor.style.transform.replace(' scale(1.5)', '');
            cursorFollower.style.transform = cursorFollower.style.transform.replace(' scale(0.8)', '');
        });
    });
}

// ========================================
// NAVIGATION
// ========================================

function initNavigation() {
    const navbar = $('.navbar');
    const hamburger = $('.hamburger');
    const mobileMenu = $('.mobile-menu');
    const mobileLinks = $$('.mobile-link');
    
    if (!navbar) return;

    // Scroll effect
    const handleScroll = throttle(() => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, 10);

    window.addEventListener('scroll', handleScroll);

    // Mobile menu toggle
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Close mobile menu when clicking links
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Close mobile menu when clicking outside
        mobileMenu.addEventListener('click', (e) => {
            if (e.target === mobileMenu) {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Smooth scroll for navigation links
    const navLinks = $$('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = $(link.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ========================================
// SCROLL ANIMATIONS
// ========================================

function initScrollAnimations() {
    const animateElements = $$('.fade-in-up');
    
    if (!animateElements.length) return;

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animateElements.forEach(el => {
        observer.observe(el);
    });
}

// ========================================
// HERO ANIMATIONS
// ========================================

function initHeroAnimations() {
    const heroTitle = $('.hero-title');
    if (!heroTitle) return;

    // Reset animations on page load
    const words = $$('.hero-title .word');
    words.forEach((word, index) => {
        word.style.animationDelay = `${0.6 + (index * 0.2)}s`;
    });
}

// ========================================
// PORTFOLIO FUNCTIONALITY
// ========================================

function initPortfolio() {
    // Portfolio filter
    const filterBtns = $$('.filter-btn');
    const portfolioItems = $$('.portfolio-item');

    if (filterBtns.length) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');
                
                // Update active button
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Filter items
                portfolioItems.forEach(item => {
                    const categories = item.getAttribute('data-category');
                    
                    if (filter === 'all' || !categories) {
                        item.style.display = 'block';
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                        }, 100);
                    } else if (categories.includes(filter)) {
                        item.style.display = 'block';
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                        }, 100);
                    } else {
                        item.style.opacity = '0';
                        item.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            item.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    }

    // Portfolio modal functionality
    initPortfolioModal();
}

// ========================================
// PORTFOLIO MODAL
// ========================================

function initPortfolioModal() {
    const modal = $('#portfolioModal');
    if (!modal) return;

    // Project data
    const projectData = {
        project1: {
            title: "Luxe Fashion Store",
            category: "E-commerce Platform",
            image: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=600",
            description: "A premium e-commerce platform featuring advanced product filtering, personalized recommendations, and a seamless checkout experience. Built with modern technologies to handle high traffic and provide exceptional user experience.",
            features: [
                "Advanced product filtering and search",
                "Personalized product recommendations",
                "Secure payment processing with Stripe",
                "Real-time inventory management",
                "Mobile-responsive design",
                "Admin dashboard with analytics"
            ],
            tech: ["React", "Node.js", "MongoDB", "Stripe API", "Redux", "Express.js"],
            results: [
                { metric: "45%", label: "Increase in Sales" },
                { metric: "60%", label: "Faster Load Times" },
                { metric: "85%", label: "Mobile Conversion" }
            ]
        },
        project2: {
            title: "HealthTracker Pro",
            category: "Mobile Application",
            image: "https://images.pexels.com/photos/38544/imac-apple-mockup-app-38544.jpeg?auto=compress&cs=tinysrgb&w=600",
            description: "A comprehensive health tracking mobile application with intuitive design, data visualization, and personalized health insights powered by machine learning algorithms.",
            features: [
                "Health metrics tracking and visualization",
                "Personalized health insights and recommendations",
                "Integration with wearable devices",
                "Social features for motivation",
                "HIPAA-compliant data security",
                "Offline functionality"
            ],
            tech: ["React Native", "Firebase", "Redux", "Chart.js", "HealthKit", "Google Fit API"],
            results: [
                { metric: "100K+", label: "Active Users" },
                { metric: "4.8★", label: "App Store Rating" },
                { metric: "92%", label: "User Retention" }
            ]
        },
        project3: {
            title: "TechVision Startup",
            category: "Brand Identity",
            image: "https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=600",
            description: "Complete brand identity design for a cutting-edge AI startup, including logo design, brand guidelines, and comprehensive marketing materials that reflect innovation and trust.",
            features: [
                "Logo design and brand mark creation",
                "Comprehensive brand guidelines",
                "Marketing collateral design",
                "Website design and development",
                "Social media template designs",
                "Presentation template systems"
            ],
            tech: ["Adobe Illustrator", "Adobe Photoshop", "Figma", "After Effects", "Sketch"],
            results: [
                { metric: "300%", label: "Brand Recognition" },
                { metric: "150%", label: "Lead Generation" },
                { metric: "95%", label: "Client Satisfaction" }
            ]
        },
        project4: {
            title: "Global Finance Corp",
            category: "Corporate Website",
            image: "https://images.pexels.com/photos/583848/pexels-photo-583848.jpeg?auto=compress&cs=tinysrgb&w=600",
            description: "Professional corporate website featuring advanced animations, interactive elements, and comprehensive content management system for a global financial services company.",
            features: [
                "Custom CMS for content management",
                "Advanced animation and interactions",
                "Multi-language support",
                "Client portal integration",
                "Financial calculator tools",
                "SEO optimization and analytics"
            ],
            tech: ["Vue.js", "WordPress", "GSAP", "PHP", "MySQL", "SCSS"],
            results: [
                { metric: "200%", label: "Page Views" },
                { metric: "50%", label: "Bounce Rate Reduction" },
                { metric: "80%", label: "Lead Quality Improvement" }
            ]
        },
        project5: {
            title: "ConnectHub",
            category: "Social Platform",
            image: "https://images.pexels.com/photos/147413/twitter-facebook-together-exchange-of-information-147413.jpeg?auto=compress&cs=tinysrgb&w=600",
            description: "Next-generation social networking platform with real-time messaging, content sharing, and community features designed for modern digital communication.",
            features: [
                "Real-time messaging and chat",
                "Content sharing with media support",
                "Community groups and forums",
                "Live streaming capabilities",
                "Advanced privacy controls",
                "AI-powered content moderation"
            ],
            tech: ["React", "Socket.io", "PostgreSQL", "Redis", "AWS", "GraphQL"],
            results: [
                { metric: "500K+", label: "Registered Users" },
                { metric: "2M+", label: "Messages per Day" },
                { metric: "75%", label: "Daily Active Users" }
            ]
        },
        project6: {
            title: "Savory Delights",
            category: "Restaurant Website",
            image: "https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=600",
            description: "Beautiful restaurant website featuring online ordering system, reservation management, and stunning visual presentation that captures the dining experience.",
            features: [
                "Online ordering and delivery system",
                "Table reservation management",
                "Menu management system",
                "Customer review integration",
                "Event booking functionality",
                "Multi-location support"
            ],
            tech: ["Next.js", "Strapi", "Stripe", "TypeScript", "Tailwind CSS", "Vercel"],
            results: [
                { metric: "180%", label: "Online Orders" },
                { metric: "65%", label: "Reservation Increase" },
                { metric: "40%", label: "Revenue Growth" }
            ]
        }
    };

    // Modal elements
    const modalTitle = $('#modalTitle');
    const modalCategory = $('#modalCategory');
    const modalImage = $('#modalImage');
    const modalDescription = $('#modalDescription');
    const modalFeatures = $('#modalFeatures');
    const modalTech = $('#modalTech');
    const modalResults = $('#modalResults');

    window.openModal = function(projectId) {
        const project = projectData[projectId];
        if (!project) return;

        // Populate modal content
        modalTitle.textContent = project.title;
        modalCategory.textContent = project.category;
        modalImage.src = project.image;
        modalImage.alt = project.title;
        modalDescription.textContent = project.description;

        // Features
        modalFeatures.innerHTML = project.features
            .map(feature => `<li>${feature}</li>`)
            .join('');

        // Technologies
        modalTech.innerHTML = project.tech
            .map(tech => `<span>${tech}</span>`)
            .join('');

        // Results
        modalResults.innerHTML = project.results
            .map(result => `
                <div class="result-item">
                    <h5>${result.metric}</h5>
                    <p>${result.label}</p>
                </div>
            `).join('');

        // Show modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.closeModal = function() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    // Close modal events
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// ========================================
// CONTACT FORM
// ========================================

function initContactForm() {
    const contactForm = $('#contactForm');
    const successMessage = $('#successMessage');
    
    if (!contactForm) return;

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = contactForm.querySelector('.submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');
        
        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        // Simulate form submission (replace with actual API call)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Hide loading state
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        
        // Show success message
        if (successMessage) {
            successMessage.classList.add('show');
            contactForm.reset();
        }
    });

    // Form field interactions
    const formFields = $$('.form-field input, .form-field textarea, .form-field select');
    formFields.forEach(field => {
        field.addEventListener('focus', () => {
            field.parentElement.classList.add('focused');
        });
        
        field.addEventListener('blur', () => {
            if (!field.value) {
                field.parentElement.classList.remove('focused');
            }
        });
        
        // Check if field has value on load
        if (field.value) {
            field.parentElement.classList.add('focused');
        }
    });

    // Success message close
    window.closeSuccessMessage = function() {
        if (successMessage) {
            successMessage.classList.remove('show');
        }
    };
}

// ========================================
// FAQ FUNCTIONALITY
// ========================================

function initFAQ() {
    const faqItems = $$('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            if (isActive) {
                item.classList.remove('active');
            } else {
                item.classList.add('active');
            }
        });
    });
}

// ========================================
// SCROLL TO TOP
// ========================================

function initScrollToTop() {
    const scrollToTopBtn = $('#scrollToTop');
    if (!scrollToTopBtn) return;

    const handleScroll = throttle(() => {
        if (window.scrollY > 500) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    }, 10);

    window.addEventListener('scroll', handleScroll);

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ========================================
// COUNTER ANIMATION
// ========================================

function initCounterAnimations() {
    const counters = $$('.stat-number[data-target]');
    
    if (!counters.length) return;

    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    counters.forEach(counter => {
        observer.observe(counter);
    });
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const steps = 60;
    const stepValue = target / steps;
    const stepDuration = duration / steps;
    
    let current = 0;
    let step = 0;
    
    const timer = setInterval(() => {
        current += stepValue;
        step++;
        
        if (step >= steps) {
            current = target;
            clearInterval(timer);
        }
        
        element.textContent = Math.floor(current);
    }, stepDuration);
}

// ========================================
// LAZY LOADING
// ========================================

function initLazyLoading() {
    const images = $$('img[loading="lazy"]');
    
    if (!images.length || !('IntersectionObserver' in window)) return;

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.src; // Trigger loading
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => {
        imageObserver.observe(img);
    });
}

// ========================================
// PERFORMANCE MONITORING
// ========================================

function initPerformanceMonitoring() {
    // Monitor page load performance
    window.addEventListener('load', () => {
        if ('performance' in window) {
            const perf = performance.getEntriesByType('navigation')[0];
            console.log(`Page loaded in ${Math.round(perf.loadEventEnd - perf.loadEventStart)}ms`);
        }
    });

    // Monitor scroll performance
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        document.documentElement.classList.add('is-scrolling');
        
        scrollTimeout = setTimeout(() => {
            document.documentElement.classList.remove('is-scrolling');
        }, 100);
    });
}

// ========================================
// ACCESSIBILITY ENHANCEMENTS
// ========================================

function initAccessibility() {
    // Keyboard navigation for custom elements
    const focusableElements = $$('[tabindex], button, a, input, textarea, select');
    
    focusableElements.forEach(element => {
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                if (element.tagName !== 'INPUT' && element.tagName !== 'TEXTAREA') {
                    element.click();
                }
            }
        });
    });

    // Improve focus visibility
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });

    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });

    // Announce page changes for screen readers
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
    document.body.appendChild(announcer);

    // Update announcer when page content changes
    window.announceToScreenReader = function(message) {
        announcer.textContent = message;
        setTimeout(() => {
            announcer.textContent = '';
        }, 1000);
    };
}

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Core functionality
    initPreloader();
    initCustomCursor();
    initNavigation();
    initScrollAnimations();
    initHeroAnimations();
    initScrollToTop();
    initLazyLoading();
    
    // Page-specific functionality
    initPortfolio();
    initContactForm();
    initFAQ();
    initCounterAnimations();
    
    // Enhancements
    initPerformanceMonitoring();
    initAccessibility();
    
    console.log('🚀 Apexify Techonologies website initialized successfully!');
});

// ========================================
// GLOBAL ERROR HANDLING
// ========================================

window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

// ========================================
// EXPORT FOR EXTERNAL USE
// ========================================

window.NexusDigital = {
    openModal: window.openModal,
    closeModal: window.closeModal,
    closeSuccessMessage: window.closeSuccessMessage,
    announceToScreenReader: window.announceToScreenReader
};