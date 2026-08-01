/* ==========================================================================
   GLITCH - Software House Interactive JavaScript Core
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Navbar Scroll Effect & Active Page Link
    initNavbar();

    // 2. Futuristic Hero Canvas Particle System (If Hero Canvas Exists)
    initHeroCanvas();

    // 3. Animated Statistics Counters (Intersection Observer)
    initCounterAnimation();

    // 4. Scroll Reveal Animations (Intersection Observer)
    initScrollReveal();

    // 5. Portfolio Filtering & Modal Popup Dynamic Handler
    initPortfolioSystem();

    // 6. Testimonial Slider / Carousel Logic
    initTestimonials();

    // 7. Contact Form & Newsletter Validation
    initFormValidation();

    // 8. Back to Top Button
    initBackToTop();
});

/* --------------------------------------------------------------------------
   1. Navbar Functionality
   -------------------------------------------------------------------------- */
function initNavbar() {
    const navbar = document.querySelector('.navbar-glitch');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Set Active Link based on pathname
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link-glitch');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/* --------------------------------------------------------------------------
   2. Futuristic Hero Canvas Particle Background
   -------------------------------------------------------------------------- */
function initHeroCanvas() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = canvas.parentElement.offsetWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight);

    window.addEventListener('resize', () => {
        if (!canvas.parentElement) return;
        width = canvas.width = canvas.parentElement.offsetWidth;
        height = canvas.height = canvas.parentElement.offsetHeight;
    });

    const particles = [];
    const particleCount = Math.min(Math.floor(width / 15), 65);

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.radius = Math.random() * 2 + 1;
            this.vx = (Math.random() - 0.5) * 0.8;
            this.vy = (Math.random() - 0.5) * 0.8;
            this.color = Math.random() > 0.5 ? '#00f2fe' : '#8a2be2';
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 130) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(138, 43, 226, ${0.25 - dist / 130})`;
                    ctx.lineWidth = 0.75;
                    ctx.stroke();
                }
            }
        }

        // Update & Draw Particles
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        requestAnimationFrame(animate);
    }

    animate();
}

/* --------------------------------------------------------------------------
   3. Animated Counters System
   -------------------------------------------------------------------------- */
function initCounterAnimation() {
    const counterElements = document.querySelectorAll('.counter-value');
    if (counterElements.length === 0) return;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const endVal = parseInt(target.getAttribute('data-target'), 10);
                const duration = 2000;
                const startTime = performance.now();

                function updateCounter(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    // Ease out quadratic
                    const currentCount = Math.floor(progress * (2 - progress) * endVal);
                    target.textContent = currentCount;

                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    } else {
                        target.textContent = endVal;
                    }
                }

                requestAnimationFrame(updateCounter);
                obs.unobserve(target);
            }
        });
    }, { threshold: 0.5 });

    counterElements.forEach(counter => observer.observe(counter));
}

/* --------------------------------------------------------------------------
   4. Scroll Reveal Observer
   -------------------------------------------------------------------------- */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.15 });

    revealElements.forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   5. Portfolio Filtering & Dynamic Modal Data
   -------------------------------------------------------------------------- */
const projectData = {
    revgate: {
        title: "RevGate — Automotive Tech Platform",
        category: "Websites",
        image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
        overview: "RevGate is an ultra-fast automotive web platform designed for luxury car dealerships and high-performance electric vehicle showcases.",
        challenge: "The client needed real-time vehicle configuration rendering, seamless dynamic inventory search, and responsive 3D model interaction without dropping below 60 FPS performance on mobile devices.",
        solution: "Glitch engineered a sleek, dark-themed platform using optimized WebGL graphics, dynamic JS filtering, and instant API loading states. We achieved a 99/100 Lighthouse performance score.",
        features: ["Interactive 3D Car Visualizer", "Instant Live Search & Filters", "Dealer Portal Integration", "Financing & Lease Calculator"],
        technologies: ["HTML5", "CSS3", "JavaScript ES6", "Bootstrap 5", "Three.js", "REST APIs"],
        duration: "8 Weeks",
        link: "#"
    },
    nova: {
        title: "Nova — High-Fashion E-commerce",
        category: "E-commerce",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
        overview: "Nova is a luxury fashion marketplace engineered for digital fashion houses and modern streetwear brands seeking a high-converting storefront.",
        challenge: "Integrating high-resolution media galleries with frictionless quick-buy micro-interactions while maintaining lightning-fast mobile load times.",
        solution: "We designed glassmorphic product cards, automated image lazy-loading, and built a custom client-side shopping bag modal for instantaneous checkout flows.",
        features: ["Smooth Quick-View Modal", "Interactive Size & Color Swatches", "Currency Converter", "Stripe Payment Gateway Mock"],
        technologies: ["HTML5", "CSS3", "Bootstrap 5", "JavaScript", "Stripe API"],
        duration: "6 Weeks",
        link: "#"
    },
    orbit: {
        title: "Glitch Bistro — Restaurant Management Dashboard",
        category: "Dashboards",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
        overview: "Glitch Bistro is an enterprise-grade restaurant management dashboard built for real-time POS order processing, sales analytics trends, kitchen pipeline management, menu item metrics, and automated receipts.",
        challenge: "Restaurant managers struggle with fragmented POS data, manual order status updates, and lack of real-time multi-channel revenue analytics (dine-in, takeaway, delivery).",
        solution: "Glitch engineered an all-in-one dark glassmorphic dashboard featuring Chart.js visual telemetry, dynamic order pipeline tables, live order management, and customer tracking.",
        features: ["Live Sales & Revenue Trend Charting", "POS Order Pipeline Management", "Interactive Menu & Item Catalogs", "Printable Receipt Modal & Order Tracking"],
        technologies: ["HTML5", "CSS3", "JavaScript ES6", "Bootstrap 5", "Chart.js", "LocalStorage API"],
        duration: "10 Weeks",
        link: "dashboard/index.html"
    },
    glitchbistro: {
        title: "Glitch Bistro — Restaurant Management Dashboard",
        category: "Dashboards",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
        overview: "Glitch Bistro is an enterprise-grade restaurant management dashboard built for real-time POS order processing, sales analytics trends, kitchen pipeline management, menu item metrics, and automated receipts.",
        challenge: "Restaurant managers struggle with fragmented POS data, manual order status updates, and lack of real-time multi-channel revenue analytics (dine-in, takeaway, delivery).",
        solution: "Glitch engineered an all-in-one dark glassmorphic dashboard featuring Chart.js visual telemetry, dynamic order pipeline tables, live order management, and customer tracking.",
        features: ["Live Sales & Revenue Trend Charting", "POS Order Pipeline Management", "Interactive Menu & Item Catalogs", "Printable Receipt Modal & Order Tracking"],
        technologies: ["HTML5", "CSS3", "JavaScript ES6", "Bootstrap 5", "Chart.js", "LocalStorage API"],
        duration: "10 Weeks",
        link: "dashboard/index.html"
    },
    zenith: {
        title: "Zenith — Luxury Real Estate Portal",
        category: "Websites",
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
        overview: "Zenith is an elite real estate platform featuring high-end architectural properties, virtual tours, and interactive location maps.",
        challenge: "High bounce rates on traditional real estate platforms due to slow image rendering and cluttered search UI.",
        solution: "Implemented sleek card designs with interactive map sync, neighborhood walkthrough videos, and direct agent scheduling modal.",
        features: ["Interactive Map Search", "Virtual Property Tours", "Agent Booking System", "Mortgage Estimator"],
        technologies: ["HTML5", "CSS3", "JavaScript", "Bootstrap 5", "Google Maps API"],
        duration: "7 Weeks",
        link: "#"
    },
    bite: {
        title: "Bite Mobile — Restaurant POS & Ordering System",
        category: "Applications",
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
        overview: "Bite Mobile is an interactive restaurant POS and ordering web application that allows staff and customers to process orders, select menu item variations, manage dine-in/takeaway/delivery flows, and generate instant receipts.",
        challenge: "Restaurant staff require a fast, mobile-responsive order entry terminal that syncs item customization and order states instantly.",
        solution: "Glitch engineered a dark glassmorphic POS order entry system with real-time total computation, dine-in table assignment, and automated printable receipts.",
        features: ["Interactive POS Order Builder", "Live Cart & Total Calculation", "Dine-in / Takeaway / Delivery Setup", "Printable Receipt Modal & Order Tracker"],
        technologies: ["HTML5", "CSS3", "JavaScript ES6", "Bootstrap 5", "LocalStorage API"],
        duration: "9 Weeks",
        link: "dashboard/new-order.html"
    },
    pulse: {
        title: "Pulse — AI Fitness & Health App",
        category: "Applications",
        image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
        overview: "Pulse is a next-generation web application providing personalized AI workout routines, bio-metric tracking, and diet planning.",
        challenge: "Presenting complex biometric health analytics in an engaging, visually motivating dashboard for everyday users.",
        solution: "Designed energetic glassmorphic progress cards, animated calorie burn rings, and instant workout customizer steps.",
        features: ["AI Workout Generator", "Calorie & Water Intake Tracker", "Social Community Leaderboard", "Sync with Wearables"],
        technologies: ["HTML5", "CSS3", "JavaScript", "Bootstrap 5", "Chart.js"],
        duration: "8 Weeks",
        link: "#"
    },
    aether: {
        title: "Aether — AI Data Intelligence Suite",
        category: "Dashboards",
        image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
        overview: "Aether provides artificial intelligence Insights, sentiment prediction, and automated data processing for enterprise clients.",
        challenge: "Structuring complex machine learning telemetry into actionable visual cards for enterprise non-technical decision makers.",
        solution: "Built clean metric cards with gradient heatmaps, AI prompt generator playground, and automated PDF export capability.",
        features: ["Predictive Analytics Engine", "Automated PDF Report Builder", "AI Prompt Sandbox", "Role-Based Access Control"],
        technologies: ["HTML5", "CSS3", "JavaScript", "Bootstrap 5", "Python API"],
        duration: "11 Weeks",
        link: "#"
    },
    lumina: {
        title: "Lumina — Smart Home Control App",
        category: "Applications",
        image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80",
        overview: "Lumina is a web application dashboard to manage Internet-of-Things (IoT) connected smart home devices, lighting, and security systems.",
        challenge: "Managing low-latency state changes for hundreds of connected sensors across different household rooms.",
        solution: "Engineered responsive glassmorphism toggle switches, live security camera feeds, and automated energy consumption schedules.",
        features: ["Room-by-Room IoT Controls", "Energy Efficiency Heatmap", "Automated Schedule Triggers", "Security Alert System"],
        technologies: ["HTML5", "CSS3", "JavaScript", "Bootstrap 5", "IoT MQTT API"],
        duration: "7 Weeks",
        link: "#"
    },
    krypton: {
        title: "Krypton — Web3 Crypto Exchange",
        category: "E-commerce",
        image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80",
        overview: "Krypton is a decentralized crypto asset portal featuring live price tickers, wallet integration, and token swapping.",
        challenge: "Delivering real-time cryptocurrency ticker updates while maintaining bank-grade security visual indicators.",
        solution: "Implemented WebSocket live orderbook updates, crypto price chart overlays, and seamless Web3 wallet login simulation.",
        features: ["Live Candlestick Charting", "Instant Web3 Wallet Connect", "Token Swap Calculator", "Staking APY Calculator"],
        technologies: ["HTML5", "CSS3", "JavaScript", "Bootstrap 5", "Ethers.js API"],
        duration: "12 Weeks",
        link: "#"
    }
};

function initPortfolioSystem() {
    // 1. Filter Category Logic
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectItems = document.querySelectorAll('.project-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            projectItems.forEach(item => {
                const category = item.getAttribute('data-category');

                if (filterValue === 'all' || category === filterValue) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.9)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // 2. Dynamic Modal Population
    const projectModal = document.getElementById('projectModal');
    if (!projectModal) return;

    projectModal.addEventListener('show.bs.modal', (event) => {
        const triggerBtn = event.relatedTarget;
        if (!triggerBtn) return;

        const projectId = triggerBtn.getAttribute('data-project-id');
        const data = projectData[projectId];

        if (data) {
            document.getElementById('modalTitle').textContent = data.title;
            document.getElementById('modalImage').src = data.image;
            document.getElementById('modalImage').alt = data.title;
            document.getElementById('modalOverview').textContent = data.overview;
            document.getElementById('modalChallenge').textContent = data.challenge;
            document.getElementById('modalSolution').textContent = data.solution;
            document.getElementById('modalCategory').textContent = data.category;
            document.getElementById('modalDuration').textContent = data.duration;

            // Render features list
            const featuresList = document.getElementById('modalFeatures');
            featuresList.innerHTML = data.features.map(f => `<li><i class="bi bi-check2-circle text-info me-2"></i>${f}</li>`).join('');

            // Render tech badges
            const techContainer = document.getElementById('modalTechBadges');
            techContainer.innerHTML = data.technologies.map(t => `<span class="badge bg-dark border border-secondary text-info px-3 py-2 me-1 mb-1">${t}</span>`).join('');

            // Render Visit Website / Launch App button
            const visitBtn = document.getElementById('modalVisitBtn');
            if (visitBtn) {
                if (data.link && data.link !== '#') {
                    visitBtn.href = data.link;
                    visitBtn.target = "_blank";
                    visitBtn.classList.remove('d-none');
                } else {
                    visitBtn.href = "#";
                    visitBtn.target = "_self";
                }
            }
        }
    });
}

/* --------------------------------------------------------------------------
   6. Testimonials Slider Setup
   -------------------------------------------------------------------------- */
function initTestimonials() {
    // If Bootstrap Carousel is present, auto cycle setup
    const carouselEl = document.querySelector('#testimonialCarousel');
    if (carouselEl && typeof bootstrap !== 'undefined') {
        new bootstrap.Carousel(carouselEl, {
            interval: 5000,
            ride: 'carousel'
        });
    }
}

/* --------------------------------------------------------------------------
   7. Form Validation (Contact Form & Newsletter)
   -------------------------------------------------------------------------- */
function initFormValidation() {
    // Contact Form
    const contactForm = document.getElementById('contactForm');
    const formAlert = document.getElementById('formAlert');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            // Check form validity
            if (!contactForm.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
                contactForm.classList.add('was-validated');
                if (formAlert) {
                    formAlert.className = 'alert alert-danger mt-3 d-block';
                    formAlert.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-2"></i> Please complete all required fields correctly.';
                }
                return;
            }

            // Note: If action contains YOUR_FORM_ID, simulate demo submission if not configured
            const action = contactForm.getAttribute('action');
            if (action.includes('YOUR_FORM_ID')) {
                e.preventDefault();
                contactForm.classList.remove('was-validated');
                contactForm.reset();
                if (formAlert) {
                    formAlert.className = 'alert alert-success mt-3 d-block bg-dark text-info border border-info';
                    formAlert.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i> Thank you! Your message has been received. Our team will contact you within 24 hours.';
                }
            }
        });
    }

    // Newsletter Form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = newsletterForm.querySelector('input[type="email"]');
            if (input && input.value.trim() !== '') {
                alert('Thank you for subscribing to Glitch updates!');
                input.value = '';
            }
        });
    }
}

/* --------------------------------------------------------------------------
   8. Back to Top Button
   -------------------------------------------------------------------------- */
function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    if (!backToTopBtn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}
