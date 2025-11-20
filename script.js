// Header Scroll Effect
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Mobile Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');
const navLinks = document.querySelectorAll('.nav-link');

menuToggle.addEventListener('click', () => {
    nav.classList.toggle('active');
    
    // Animate hamburger menu
    const spans = menuToggle.querySelectorAll('span');
    if (nav.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translateY(10px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translateY(-10px)';
    } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
});

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        nav.classList.remove('active');
        const spans = menuToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    });
});

// Active Navigation Link on Scroll
const sections = document.querySelectorAll('section');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 100)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Scroll Animations
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
const animateElements = document.querySelectorAll('.product-card, .service-item, .client-logo, .about-text, .about-image');
animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Form Submission
//const contactForm = document.getElementById('contactForm');

//contactForm.addEventListener('submit', (e) => {
   // e.preventDefault();
    
    // Get form data
 //   const formData = new FormData(contactForm);
    
    // Here you would typically send the data to a server
    // For now, we'll just show a success message
   // alert('¡Gracias por contactarnos! Nos comunicaremos contigo pronto.');
    
    // Reset form
  //7  contactForm.reset();
//});

// Counter Animation for Numbers
const animateCounter = (element, target, duration) => {
    let current = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
};

// Parallax Effect for Hero
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    const scrolled = window.pageYOffset;
    if (hero) {
        hero.style.backgroundPositionY = scrolled * 0.5 + 'px';
    }
});

// Product Cards Hover Effect
const productCards = document.querySelectorAll('.product-card');

productCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.3s ease';
    });
});

// WhatsApp Float Button Animation
const whatsappFloat = document.querySelector('.whatsapp-float');

if (whatsappFloat) {
    setInterval(() => {
        whatsappFloat.style.animation = 'none';
        setTimeout(() => {
            whatsappFloat.style.animation = 'pulse 2s infinite';
        }, 10);
    }, 5000);
}

// Lazy Loading Images
const images = document.querySelectorAll('img');

const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
            
            imageObserver.unobserve(img);
        }
    });
});

images.forEach(img => imageObserver.observe(img));

// Add hover effects to buttons
const buttons = document.querySelectorAll('.btn-submit, .btn-link');

buttons.forEach(button => {
    button.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.3s ease';
    });
});

// Client Logos Animation
const clientLogos = document.querySelectorAll('.client-logo');

clientLogos.forEach((logo, index) => {
    logo.style.animationDelay = `${index * 0.1}s`;
});

// Add typing effect to hero title (optional)
const heroTitle = document.querySelector('.hero-main');
if (heroTitle) {
    const text = heroTitle.textContent;
    heroTitle.textContent = '';
    let i = 0;
    
    const typeWriter = () => {
        if (i < text.length) {
            heroTitle.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 150);
        }
    };
    
    // Uncomment to enable typing effect
    // setTimeout(typeWriter, 500);
}

// Service Items Counter
const serviceItems = document.querySelectorAll('.service-item');

serviceItems.forEach((item, index) => {
    item.style.animationDelay = `${index * 0.2}s`;
});

// Add active state to form inputs
const formInputs = document.querySelectorAll('input, textarea');

formInputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
        if (this.value === '') {
            this.parentElement.classList.remove('focused');
        }
    });
});

// Back to Top Button (optional - can be added to HTML)
const createBackToTopButton = () => {
    const button = document.createElement('button');
    button.innerHTML = '<i class="fas fa-arrow-up"></i>';
    button.className = 'back-to-top';
    button.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--primary-color);
        color: white;
        border: none;
        cursor: pointer;
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 998;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
    `;
    
    document.body.appendChild(button);
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            button.style.opacity = '1';
            button.style.pointerEvents = 'all';
        } else {
            button.style.opacity = '0';
            button.style.pointerEvents = 'none';
        }
    });
    
    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
};

// Uncomment to enable back to top button
// createBackToTopButton();

// Console Log for Developers
console.log('%c¡Sitio web creado para Publirun!', 'color: #d32f2f; font-size: 20px; font-weight: bold;');
console.log('%cDesarrollado con HTML, CSS y JavaScript', 'color: #1a73e8; font-size: 14px;');

// ================================
// GALLERY FUNCTIONALITY
// ================================

// Gallery Filter
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        filterBtns.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');
        
        const filterValue = btn.getAttribute('data-filter');
        
        galleryItems.forEach(item => {
            if (filterValue === 'all') {
                item.style.display = 'block';
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                }, 10);
            } else {
                if (item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            }
        });
    });
});

// Lightbox Functionality
let currentLightboxIndex = 0;

// ARRAY COMPLETO – 3 IMÁGENES POR CATEGORÍA
const galleryImages = [

    // =======================
    // VALLAS (0–2)
    // =======================
    { 
        src: 'assets/Galeria/Vallas/Valla 1.png', 
        title: 'Valla Publicitaria Premium', 
        description: 'Valla publicitaria instalada con diseño profesional y materiales de alta durabilidad.' 
    },
    { 
        src: 'assets/Galeria/Vallas/Valla 2.png', 
        title: 'Valla Publicitaria Premium', 
        description: 'Valla publicitaria de alto impacto visual, ideal para campañas exteriores.' 
    },
    { 
        src: 'assets/Galeria/FOTO UTILIZADAS EN EL PORTAFOLIO/IMG_7466.jpg', 
        title: 'Valla Publicitaria', 
        description: 'Estructura publicitaria instalada estratégicamente para máxima visibilidad.' 
    },

    // =======================
    // RÓTULOS (3–5)
    // =======================
    { 
        src: 'assets/Galeria/FOTO UTILIZADAS EN EL PORTAFOLIO/IMG_9331.jpg', 
        title: 'Rótulo Comercial Vehicular', 
        description: 'Rótulo aplicado sobre vehículo con acabado profesional y resistencia a la intemperie.' 
    },
    { 
        src: 'assets/Galeria/FOTO UTILIZADAS EN EL PORTAFOLIO/DJI_20250410040719_0038_D.jpg', 
        title: 'Rótulo Comercial', 
        description: 'Instalación de rótulo comercial con iluminación LED y estructura reforzada.' 
    },
    { 
        src: 'assets/Galeria/FOTO UTILIZADAS EN EL PORTAFOLIO/IMPRESION.jpg', 
        title: 'Rótulo Moderno', 
        description: 'Diseño y fabricación de rótulo moderno con acabados limpios y elegantes.' 
    },

    // =======================
    // LETREROS (6–8)
    // =======================
    { 
        src: 'assets/Galeria/FOTO UTILIZADAS EN EL PORTAFOLIO/IMG_4948.jpg', 
        title: 'Letras en Pared', 
        description: 'Instalación de letras corporativas en pared, fabricadas en materiales premium.' 
    },
    { 
        src: 'assets/Galeria/FOTO UTILIZADAS EN EL PORTAFOLIO/IMG_8351 2.jpg', 
        title: 'Letrero Promocional', 
        description: 'Letrero promocional diseñado para captar la atención y reforzar la identidad visual.' 
    },
    { 
        src: 'assets/Galeria/FOTO UTILIZADAS EN EL PORTAFOLIO/Imagen 4-6-25 a las 11.25 p. m.jpg', 
        title: 'Letrero Corporativo en la Pared', 
        description: 'Letrero corporativo instalado en pared, ideal para oficinas o ambientes comerciales.' 
    }
];


// ===============================
// SISTEMA DE LIGHTBOX
// ===============================

let currentIndex = 0;

function openLightbox(index) {
    currentIndex = index;

    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxTitle = document.getElementById("lightbox-title");
    const lightboxDesc = document.getElementById("lightbox-description");

    const item = galleryImages[index];

    lightboxImg.src = item.src;
    lightboxTitle.textContent = item.title;
    lightboxDesc.textContent = item.description;

    lightbox.classList.add("active");
}

function closeLightbox() {
    document.getElementById("lightbox").classList.remove("active");
}

function nextImage() {
    currentIndex = (currentIndex + 1) % galleryImages.length;
    openLightbox(currentIndex);
}

function prevImage() {
    currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    openLightbox(currentIndex);
}


// 🔍 ABRIR LIGHTBOX
function openLightbox(index) {
    const imgData = galleryImages[index];

    document.getElementById('lightbox-img').src = imgData.src;
    document.getElementById('lightbox-title').textContent = imgData.title;
    document.getElementById('lightbox-desc').textContent = imgData.description;

    document.getElementById('lightbox').classList.add('active');
}

// ❌ CERRAR LIGHTBOX
function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
}

function changeLightboxImage(direction) {
    currentLightboxIndex += direction;
    
    if (currentLightboxIndex < 0) {
        currentLightboxIndex = galleryImages.length - 1;
    } else if (currentLightboxIndex >= galleryImages.length) {
        currentLightboxIndex = 0;
    }
    
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDescription = document.getElementById('lightbox-description');
    
    lightboxImg.style.opacity = '0';
    
    setTimeout(() => {
        lightboxImg.src = galleryImages[currentLightboxIndex].src;
        lightboxTitle.textContent = galleryImages[currentLightboxIndex].title;
        lightboxDescription.textContent = galleryImages[currentLightboxIndex].description;
        lightboxImg.style.opacity = '1';
    }, 200);
}

// Close lightbox with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeLightbox();
    } else if (e.key === 'ArrowLeft') {
        changeLightboxImage(-1);
    } else if (e.key === 'ArrowRight') {
        changeLightboxImage(1);
    }
});

// Close lightbox when clicking outside the image
document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target.id === 'lightbox') {
        closeLightbox();
    }
});