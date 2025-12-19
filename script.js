// DOM Elements
const navbar = document.getElementById('navbar');
const navMenu = document.getElementById('nav-menu');
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelectorAll('.nav-link');
const volunteerForm = document.getElementById('volunteerForm');
const contactForm = document.getElementById('contactForm');

// Mobile Navigation Toggle
hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 70; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Form validation
function validateVoterId(voterId) {
    // Nigerian Voter ID format validation (typically 11 digits)
    const voterIdPattern = /^\d{11}$/;
    return voterIdPattern.test(voterId);
}

// Form handling
function handleFormSubmit(form, formType) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Validate voter ID if it's the volunteer form
        if (formType === 'volunteer' && data.voterId) {
            if (!validateVoterId(data.voterId)) {
                showNotification('Please enter a valid 11-digit Voter ID number', 'error');
                return;
            }
        }
        
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;
        
        try {
            // Send form data to WhatsApp
            sendToWhatsApp(data, formType);
            
            // Show success message
            showNotification('Thank you! WhatsApp has been opened with your message.', 'success');
            form.reset();
            
        } catch (error) {
            // Show error message
            showNotification('Sorry, there was an error sending your message. Please try again.', 'error');
            console.error('Form submission error:', error);
        } finally {
            // Reset button state
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    });
}

// Send form data to WhatsApp
function sendToWhatsApp(data, formType) {
    // Phone number in international format (Nigeria)
    const phoneNumber = '+2348061783434'; // Using the first phone number from contact info
    
    // Construct message based on form type
    let message = '';
    if (formType === 'volunteer') {
        message = `*New Volunteer Signup*\n\n` +
                  `*Name:* ${data.name}\n` +
                  `*Email:* ${data.email}\n` +
                  `*Phone:* ${data.phone}\n` +
                  `*Interest:* ${data.interest}\n` +
                  `*Message:* ${data.message || 'N/A'}`;
    } else if (formType === 'contact') {
        message = `*New Contact Message*\n\n` +
                  `*Name:* ${data.name}\n` +
                  `*Email:* ${data.email}\n` +
                  `*Subject:* ${data.subject}\n` +
                  `*Message:* ${data.message}`;
    }
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Construct WhatsApp URL
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Open WhatsApp in a new window/tab
    window.open(whatsappUrl, '_blank');
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        .notification-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
        }
        .notification-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            line-height: 1;
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Initialize form handlers
if (volunteerForm) {
    handleFormSubmit(volunteerForm, 'volunteer');
    
    // Add real-time validation for voter ID
    const voterIdInput = volunteerForm.querySelector('#voterId');
    if (voterIdInput) {
        voterIdInput.addEventListener('input', (e) => {
            const value = e.target.value;
            // Remove existing validation classes
            e.target.classList.remove('valid', 'invalid');
            
            if (value.length > 0 && value.length !== 11) {
                e.target.classList.add('invalid');
            } else if (value.length === 11 && validateVoterId(value)) {
                e.target.classList.add('valid');
            }
        });
        
        // Only allow numeric input
        voterIdInput.addEventListener('keypress', (e) => {
            if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }
        });
    }
}

if (contactForm) {
    handleFormSubmit(contactForm, 'contact');
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.issue-card, .event-card, .media-card, .testimonial-card');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Counter animation for stats
function animateCounters() {
    const counters = document.querySelectorAll('.stat h4');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent);
        const increment = target / 100;
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.ceil(current) + '+';
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target + '+';
            }
        };
        
        updateCounter();
    });
}

// Trigger counter animation when about section is visible
const aboutSection = document.querySelector('.about');
if (aboutSection) {
    const aboutObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                aboutObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    aboutObserver.observe(aboutSection);
}

// Lazy loading for images
function lazyLoadImages() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.src || img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        imageObserver.observe(img);
    });
}

// Initialize lazy loading
document.addEventListener('DOMContentLoaded', lazyLoadImages);

// Social media share functionality
function shareOnSocial(platform, url, text) {
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text);
    
    let shareUrl = '';
    
    switch (platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
            break;
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
            break;
    }
    
    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
}

// Add share buttons to social media section
document.addEventListener('DOMContentLoaded', () => {
    const socialSection = document.querySelector('.social-media .social-links');
    if (socialSection) {
        const shareButtons = document.createElement('div');
        shareButtons.className = 'share-buttons';
        shareButtons.innerHTML = `
            <h4 style="text-align: center; margin-bottom: 1rem; color: #4a5568;">Share This Campaign</h4>
            <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
                <button onclick="shareOnSocial('facebook', window.location.href, 'Check out this political campaign!')" 
                        style="padding: 0.5rem 1rem; background: #1877f2; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    <i class="fab fa-facebook-f"></i> Facebook
                </button>
                <button onclick="shareOnSocial('twitter', window.location.href, 'Check out this political campaign!')" 
                        style="padding: 0.5rem 1rem; background: #1da1f2; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    <i class="fab fa-twitter"></i> Twitter
                </button>
                <button onclick="shareOnSocial('whatsapp', window.location.href, 'Check out this political campaign!')" 
                        style="padding: 0.5rem 1rem; background: #25d366; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    <i class="fab fa-whatsapp"></i> WhatsApp
                </button>
            </div>
        `;
        socialSection.appendChild(shareButtons);
    }
});

// Search functionality (if needed)
function initializeSearch() {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search...';
    searchInput.className = 'search-input';
    searchInput.style.cssText = `
        padding: 0.5rem 1rem;
        border: 2px solid #e2e8f0;
        border-radius: 6px;
        margin: 1rem 0;
        width: 100%;
        max-width: 400px;
    `;
    
    // Add search to navigation if needed
    // navMenu.appendChild(searchInput);
}

// Keyboard navigation support
document.addEventListener('keydown', (e) => {
    // Close mobile menu with Escape key
    if (e.key === 'Escape') {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    }
});

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
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

// Apply debouncing to scroll events
const debouncedScrollHandler = debounce(() => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}, 10);

window.addEventListener('scroll', debouncedScrollHandler);

// Analytics tracking (placeholder for Google Analytics)
function trackEvent(category, action, label) {
    // Replace with actual analytics implementation
    console.log('Analytics Event:', { category, action, label });
    
    // Example Google Analytics 4 implementation:
    // gtag('event', action, {
    //     event_category: category,
    //     event_label: label
    // });
}

// Track form submissions
document.addEventListener('submit', (e) => {
    const formType = e.target.id === 'volunteerForm' ? 'volunteer' : 'contact';
    trackEvent('Form', 'Submit', formType);
});

// Track button clicks
document.addEventListener('click', (e) => {
    if (e.target.matches('.btn')) {
        const buttonText = e.target.textContent.trim();
        trackEvent('Button', 'Click', buttonText);
    }
});

// Track social media clicks
document.addEventListener('click', (e) => {
    if (e.target.closest('.social-link')) {
        const platform = e.target.closest('.social-link').getAttribute('aria-label');
        trackEvent('Social', 'Click', platform);
    }
});

// Service Worker registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Political Campaign Website Loaded Successfully');
    
    // Track page view
    trackEvent('Page', 'View', 'Homepage');
    
    // Initialize any additional features
    initializeSearch();
});
