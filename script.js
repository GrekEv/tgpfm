// Smooth scrolling for navigation links
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Navbar scroll effect
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// Mobile menu toggle
const burger = document.getElementById('burger');
const navMenu = document.getElementById('navMenu');

burger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    
    // Animate burger
    const spans = burger.querySelectorAll('span');
    if (navMenu.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translateY(8px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translateY(-8px)';
    } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const spans = burger.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    });
});

// Simple AOS (Animate On Scroll) implementation
function initAOS() {
    const elements = document.querySelectorAll('[data-aos]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.getAttribute('data-aos-delay') || 0;
                setTimeout(() => {
                    entry.target.classList.add('aos-animate');
                }, delay);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });
    
    elements.forEach(element => {
        observer.observe(element);
    });
}

// Initialize AOS when DOM is loaded
document.addEventListener('DOMContentLoaded', initAOS);

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroVideo = document.querySelector('.hero-video');
    if (heroVideo) {
        heroVideo.style.transform = `translate(-50%, -50%) scale(${1 + scrolled * 0.0003})`;
    }
});

// Form submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Show success message
        alert('Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.');
        
        // Reset form
        contactForm.reset();
    });
}

// Add hover effect to service cards
const serviceCards = document.querySelectorAll('.service-card');
serviceCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Animated counter for advantages
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start);
        }
    }, 16);
}

// Observe advantage cards for counter animation
const advantageCards = document.querySelectorAll('.advantage-card');
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const number = entry.target.querySelector('.advantage-number');
            if (number && !number.classList.contains('animated')) {
                number.classList.add('animated');
                const targetNumber = parseInt(number.textContent);
                if (!isNaN(targetNumber)) {
                    animateCounter(number, targetNumber, 1500);
                }
            }
        }
    });
}, { threshold: 0.5 });

advantageCards.forEach(card => counterObserver.observe(card));

// Add cursor trail effect (optional fancy feature)
let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Smooth cursor animation
function animateCursor() {
    const speed = 0.2;
    
    cursorX += (mouseX - cursorX) * speed;
    cursorY += (mouseY - cursorY) * speed;
    
    requestAnimationFrame(animateCursor);
}

animateCursor();

// Add active state to navigation based on scroll position
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLink?.classList.add('active');
        } else {
            navLink?.classList.remove('active');
        }
    });
});

// Add stagger animation to service cards on load
window.addEventListener('load', () => {
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
});

// Preload setup for service cards
document.querySelectorAll('.service-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
});

// CTA Banner show/hide on scroll
let ctaBannerVisible = false;
const ctaBanner = document.querySelector('.cta-banner');

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroHeight = document.querySelector('.hero')?.offsetHeight || 800;
    
    // Show CTA banner after scrolling past hero
    if (scrolled > heroHeight && !ctaBannerVisible) {
        ctaBanner?.classList.add('show');
        ctaBannerVisible = true;
    } else if (scrolled <= heroHeight && ctaBannerVisible) {
        ctaBanner?.classList.remove('show');
        ctaBannerVisible = false;
    }
});

// CTA Banner swipe to dismiss
if (ctaBanner) {
    let touchStartY = 0;
    let touchEndY = 0;
    let isDragging = false;
    let currentY = 0;
    
    ctaBanner.addEventListener('touchstart', (e) => {
        touchStartY = e.changedTouches[0].screenY;
        isDragging = true;
        ctaBanner.style.transition = 'none';
    }, { passive: true });
    
    ctaBanner.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentY = e.changedTouches[0].screenY;
        const diff = currentY - touchStartY;
        
        // Разрешаем только свайп вверх
        if (diff < 0) {
            ctaBanner.style.transform = `translateY(${diff}px)`;
        }
    }, { passive: true });
    
    ctaBanner.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        touchEndY = e.changedTouches[0].screenY;
        isDragging = false;
        ctaBanner.style.transition = 'transform 0.3s ease';
        
        const swipeDistance = touchStartY - touchEndY;
        // Если свайп вверх больше 30px, закрываем баннер
        if (swipeDistance > 30) {
            ctaBanner.classList.remove('show');
            ctaBannerVisible = false;
        } else {
            // Возвращаем на место
            ctaBanner.style.transform = '';
        }
    }, { passive: true });
}

// FAB pulse animation
const fab = document.getElementById('fab');
if (fab) {
    setInterval(() => {
        fab.style.animation = 'pulse 0.6s ease';
        setTimeout(() => {
            fab.style.animation = '';
        }, 600);
    }, 5000);
}

// Add pulse animation to CSS via JavaScript
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.1);
        }
    }
`;
document.head.appendChild(style);

// Download price function
function downloadPrice() {
    alert('Прайс-лист будет отправлен на вашу почту после заполнения формы в разделе "Контакты"');
    scrollToSection('contact');
}

// Show CTA banner on scroll
window.addEventListener('scroll', () => {
    const ctaBanner = document.querySelector('.cta-banner');
    const scrollY = window.pageYOffset;
    
    if (scrollY > 800) {
        ctaBanner?.classList.add('show');
    } else {
        ctaBanner?.classList.remove('show');
    }
});

// FAB is now a phone button, always visible

// Hero video autoplay fix for iOS
document.addEventListener('DOMContentLoaded', () => {
    const heroVideo = document.querySelector('.hero-video');
    if (heroVideo) {
        heroVideo.play().catch(err => {
            console.log('Video autoplay failed:', err);
        });
        
        // Add click to play on iOS
        document.addEventListener('touchstart', function() {
            if (heroVideo.paused) {
                heroVideo.play();
            }
        }, { once: true });
    }
});

console.log('🚀 M-500 Website loaded successfully!');

// Products Carousel for Desktop and Mobile
function initProductsCarousel() {
    const carousel = document.getElementById('productsCarousel');
    const dotsContainer = document.getElementById('carouselDots');
    const prevButton = document.getElementById('carouselPrev');
    const nextButton = document.getElementById('carouselNext');
    
    if (!carousel || !dotsContainer) return;
    
    const items = carousel.querySelectorAll('.carousel-item');
    if (items.length === 0) return;
    
    let currentIndex = 0;
    
    // Create dots
    items.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = 'carousel-dot' + (index === 0 ? ' active' : '');
        dot.addEventListener('click', () => {
            scrollToItem(index);
        });
        dotsContainer.appendChild(dot);
    });
    
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    
    function updateActiveItem(index) {
        currentIndex = index;
        
        items.forEach((item, i) => {
            if (i === index) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        dots.forEach((dot, i) => {
            if (i === index) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
        
        // Update arrow states
        if (prevButton) {
            if (index === 0) {
                prevButton.classList.add('disabled');
            } else {
                prevButton.classList.remove('disabled');
            }
        }
        
        if (nextButton) {
            if (index === items.length - 1) {
                nextButton.classList.add('disabled');
            } else {
                nextButton.classList.remove('disabled');
            }
        }
    }
    
    function scrollToItem(index) {
        if (index < 0 || index >= items.length) return;
        
        const item = items[index];
        if (item) {
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            updateActiveItem(index);
        }
    }
    
    function getCurrentIndex() {
        const carouselRect = carousel.getBoundingClientRect();
        const carouselCenter = carouselRect.left + carouselRect.width / 2;
        
        let closestIndex = 0;
        let closestDistance = Infinity;
        
        items.forEach((item, index) => {
            const itemRect = item.getBoundingClientRect();
            const itemCenter = itemRect.left + itemRect.width / 2;
            const distance = Math.abs(carouselCenter - itemCenter);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = index;
            }
        });
        
        return closestIndex;
    }
    
    // Arrow button handlers
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            const current = getCurrentIndex();
            if (current > 0) {
                scrollToItem(current - 1);
            }
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            const current = getCurrentIndex();
            if (current < items.length - 1) {
                scrollToItem(current + 1);
            }
        });
    }
    
    // Update on scroll
    let scrollTimeout;
    carousel.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const index = getCurrentIndex();
            if (index !== currentIndex) {
                updateActiveItem(index);
            }
        }, 100);
    });
    
    // Initial update
    updateActiveItem(0);
    
    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            const current = getCurrentIndex();
            if (diff > 0 && current < items.length - 1) {
                // Swipe left - next item
                scrollToItem(current + 1);
            } else if (diff < 0 && current > 0) {
                // Swipe right - previous item
                scrollToItem(current - 1);
            }
        }
    }
    
    // Mouse wheel support for desktop
    let wheelTimeout;
    carousel.addEventListener('wheel', (e) => {
        e.preventDefault();
        clearTimeout(wheelTimeout);
        
        wheelTimeout = setTimeout(() => {
            const current = getCurrentIndex();
            if (e.deltaY > 0 && current < items.length - 1) {
                // Scroll down - next item
                scrollToItem(current + 1);
            } else if (e.deltaY < 0 && current > 0) {
                // Scroll up - previous item
                scrollToItem(current - 1);
            }
        }, 50);
    }, { passive: false });
}

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initProductsCarousel();
});

