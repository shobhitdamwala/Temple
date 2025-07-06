// DOM Elements
const loader = document.getElementById('loader');
const damruSound = document.getElementById('damruSound');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navbar = document.getElementById('navbar');

// Loading Animation
window.addEventListener('load', () => {
    // Play damru sound
    damruSound.play().catch(() => {
        console.log('Audio autoplay prevented by browser');
    });
    
    // Hide loader after 3 seconds
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 1000);
    }, 3000);
});

// Mobile Navigation Toggle
navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    
    // Animate hamburger menu
    const spans = navToggle.querySelectorAll('span');
    spans.forEach((span, index) => {
        span.style.transform = navMenu.classList.contains('active') 
            ? (index === 0 ? 'rotate(45deg) translate(5px, 5px)' : 
               index === 1 ? 'opacity(0)' : 
               'rotate(-45deg) translate(7px, -6px)')
            : '';
    });
});

// Smooth Scrolling
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Navigation Links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        if (link.getAttribute('href').startsWith('#')) {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            scrollToSection(targetId);
            
            // Close mobile menu
            navMenu.classList.remove('active');
            
            // Reset hamburger menu
            const spans = navToggle.querySelectorAll('span');
            spans.forEach(span => {
                span.style.transform = '';
            });
        }
    });
});

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
});

// Intersection Observer for Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe fade-in elements
document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

// Mantra Player
function playMantra() {
    const mantraAudio = new Audio();
    mantraAudio.src = 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3';
    mantraAudio.loop = true;
    
    mantraAudio.play().then(() => {
        showNotification('🕉️ Om Namah Shivaya mantra is now playing');
        
        // Create stop button
        const stopButton = document.createElement('button');
        stopButton.textContent = 'Stop Mantra';
        stopButton.className = 'cta-button primary';
        stopButton.style.position = 'fixed';
        stopButton.style.bottom = '20px';
        stopButton.style.right = '20px';
        stopButton.style.zIndex = '1000';
        
        stopButton.addEventListener('click', () => {
            mantraAudio.pause();
            mantraAudio.currentTime = 0;
            stopButton.remove();
            showNotification('Mantra stopped');
        });
        
        document.body.appendChild(stopButton);
    }).catch(() => {
        showNotification('Unable to play mantra. Please enable audio.');
    });
}

// Navigation Helper
function navigateTo(page) {
    window.location.href = page;
}

// Notification System
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--primary-color)' : '#e74c3c'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: var(--shadow);
        z-index: 10000;
        animation: slideInRight 0.5s ease;
        font-weight: 600;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.5s ease reverse';
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}

// Floating Particles Animation
function createFloatingParticles() {
    const particles = document.querySelector('.floating-particles');
    if (!particles) return;
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        particle.innerHTML = Math.random() > 0.5 ? '🕉️' : '🔱';
        particle.style.cssText = `
            position: absolute;
            font-size: ${Math.random() * 20 + 10}px;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            opacity: ${Math.random() * 0.3 + 0.1};
            animation: float ${Math.random() * 10 + 10}s ease-in-out infinite;
            animation-delay: ${Math.random() * 5}s;
            pointer-events: none;
        `;
        particles.appendChild(particle);
    }
}

// Initialize floating particles
createFloatingParticles();

// Parallax Effect
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.parallax');
    
    parallaxElements.forEach(element => {
        const speed = element.dataset.speed || 0.5;
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Dynamic Greeting
function setDynamicGreeting() {
    const hour = new Date().getHours();
    let greeting;
    
    if (hour < 12) {
        greeting = '🌅 Good Morning! Start your day with divine blessings';
    } else if (hour < 17) {
        greeting = '☀️ Good Afternoon! May Lord Shiva guide your path';
    } else {
        greeting = '🌙 Good Evening! Time for evening prayers';
    }
    
    const greetingElement = document.querySelector('.dynamic-greeting');
    if (greetingElement) {
        greetingElement.textContent = greeting;
    }
}

// Set greeting on load
setDynamicGreeting();

// Add dynamic effects to service cards
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px) scale(1.02)';
        card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
        card.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
    });
});

// Gallery lightbox effect
document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
        const img = item.querySelector('img');
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <img src="${img.src}" alt="${img.alt}">
                <span class="lightbox-close">&times;</span>
            </div>
        `;
        lightbox.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;
        
        const content = lightbox.querySelector('.lightbox-content');
        content.style.cssText = `
            position: relative;
            max-width: 90%;
            max-height: 90%;
        `;
        
        const lightboxImg = lightbox.querySelector('img');
        lightboxImg.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: contain;
            border-radius: 10px;
        `;
        
        const closeBtn = lightbox.querySelector('.lightbox-close');
        closeBtn.style.cssText = `
            position: absolute;
            top: -40px;
            right: -40px;
            color: white;
            font-size: 2rem;
            cursor: pointer;
            background: var(--primary-color);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        closeBtn.addEventListener('click', () => {
            lightbox.remove();
        });
        
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.remove();
            }
        });
        
        document.body.appendChild(lightbox);
    });
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .notification {
        animation: slideInRight 0.5s ease;
    }
`;
document.head.appendChild(style);

// Add loading animation for page transitions
function showPageLoader() {
    const pageLoader = document.createElement('div');
    pageLoader.className = 'page-loader';
    pageLoader.innerHTML = `
        <div class="page-loader-content">
            <div class="om-symbol">🕉️</div>
            <p>Loading...</p>
        </div>
    `;
    pageLoader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--gradient-bg);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;
    
    const content = pageLoader.querySelector('.page-loader-content');
    content.style.cssText = `
        text-align: center;
        color: white;
        font-family: 'Cinzel', serif;
    `;
    
    const om = pageLoader.querySelector('.om-symbol');
    om.style.cssText = `
        font-size: 4rem;
        animation: glow 1s ease-in-out infinite alternate;
        margin-bottom: 1rem;
    `;
    
    document.body.appendChild(pageLoader);
    
    setTimeout(() => {
        pageLoader.remove();
    }, 1000);
}

// Add to all navigation links
document.querySelectorAll('a[href$=".html"]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        showPageLoader();
        setTimeout(() => {
            window.location.href = link.href;
        }, 500);
    });
});

console.log('🕉️ Shiva Temple Website Loaded Successfully! Om Namah Shivaya 🔱');