/* ==========================================
   GLITCH SOFTWARE HOUSE - MAIN INTERACTION JS
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Components
  initNavbar();
  renderProjects('all');
  initProjectFilters();
  renderTechStack('all');
  initTechFilters();
  initContactForm();
  initCounters();
  initTerminalTyping();
});

/* Navbar Scroll Behavior & Active Links */
function initNavbar() {
  const navbar = document.querySelector('.navbar-glitch');
  const navLinks = document.querySelectorAll('.nav-link-glitch');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // ScrollSpy active link update
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // Mobile menu close on click
  const navbarToggler = document.querySelector('.navbar-toggler');
  const navbarCollapse = document.querySelector('.navbar-collapse');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navbarCollapse.classList.contains('show')) {
        navbarToggler.click();
      }
    });
  });
}

/* Render Project Cards */
function renderProjects(filter = 'all') {
  const container = document.getElementById('projects-container');
  if (!container) return;

  const filteredProjects = filter === 'all' 
    ? PROJECTS_DATA 
    : PROJECTS_DATA.filter(p => p.category === filter);

  container.innerHTML = '';

  filteredProjects.forEach(project => {
    const col = document.createElement('div');
    col.className = 'col-lg-6 mb-4';

    let graphicContentHTML = getGraphicMarkup(project.mockupType);

    col.innerHTML = `
      <div class="glass-card project-card">
        <div class="project-preview ${project.mockupType}-graphic">
          <div class="graphic-content">
            ${graphicContentHTML}
          </div>
          <div class="project-overlay">
            <button class="btn btn-cyber-primary btn-sm" onclick="openProjectModal('${project.id}')">
              <i class="fa-solid fa-expand me-2"></i>Inspect Architecture
            </button>
          </div>
        </div>
        <div class="project-body">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="badge-concept"><i class="fa-solid fa-star me-1"></i>FEATURED PROJECT</span>
            <span class="badge-cyber" style="font-size:0.7rem;">${project.categoryLabel}</span>
          </div>
          <h3 class="h4 mt-2 mb-1" style="font-family: var(--font-heading);">${project.title}</h3>
          <p class="text-muted small mb-3">${project.subtitle}</p>
          <p class="small text-secondary mb-3">${project.summary}</p>
          
          <div class="project-tags mt-auto">
            ${project.tags.map(t => `<span class="tag-item">${t}</span>`).join('')}
          </div>

          <div class="mt-3 pt-3 border-top border-secondary border-opacity-10 d-flex justify-content-between align-items-center">
            <span class="small text-muted font-monospace"><i class="fa-solid fa-code-branch me-1 text-cyan"></i>v2.4-production</span>
            <div class="d-flex gap-2 align-items-center">
              ${project.liveUrl ? `<a href="${project.liveUrl}" class="btn btn-cyber-primary btn-sm font-monospace text-decoration-none"><i class="fa-solid fa-rocket me-1"></i>Launch Live</a>` : ''}
              <button class="btn btn-link text-cyan p-0 text-decoration-none small font-monospace" onclick="openProjectModal('${project.id}')">
                Inspect <i class="fa-solid fa-arrow-right ms-1"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    container.appendChild(col);
  });
}

/* Custom Wireframe UI Graphics Generator */
function getGraphicMarkup(type) {
  switch (type) {
    case 'revgate':
      return `
        <div class="w-100 p-3 rounded" style="background: rgba(0,0,0,0.6); border: 1px solid rgba(0,240,255,0.3);">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="small font-monospace text-cyan"><i class="fa-solid fa-car me-1"></i>REVGATE // CAN-BUS HUD</span>
            <span class="badge bg-danger p-1" style="font-size:0.65rem;">LIVE STREAM</span>
          </div>
          <div class="row g-2 text-center font-monospace">
            <div class="col-4">
              <div class="p-2 rounded bg-dark border border-secondary border-opacity-25">
                <div class="text-muted" style="font-size:0.65rem;">SPEED</div>
                <div class="text-cyan fw-bold">284 KM/H</div>
              </div>
            </div>
            <div class="col-4">
              <div class="p-2 rounded bg-dark border border-secondary border-opacity-25">
                <div class="text-muted" style="font-size:0.65rem;">BATTERY TEMP</div>
                <div class="text-warning fw-bold">42.8 °C</div>
              </div>
            </div>
            <div class="col-4">
              <div class="p-2 rounded bg-dark border border-secondary border-opacity-25">
                <div class="text-muted" style="font-size:0.65rem;">TORQUE</div>
                <div class="text-purple fw-bold">940 Nm</div>
              </div>
            </div>
          </div>
        </div>
      `;
    case 'biteflow':
      return `
        <div class="w-100 p-3 rounded" style="background: rgba(0,0,0,0.6); border: 1px solid rgba(157,78,221,0.3);">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="small font-monospace text-purple"><i class="fa-solid fa-qrcode me-1"></i>BITEFLOW // TABLE #14</span>
            <span class="badge bg-success p-1" style="font-size:0.65rem;">ACTIVE SESSION</span>
          </div>
          <div class="p-2 rounded bg-dark border border-secondary border-opacity-25 mb-2 d-flex justify-content-between align-items-center">
            <span class="small font-monospace text-light">2x Cyber Ramen Bowls</span>
            <span class="small text-cyan font-monospace">$38.00</span>
          </div>
          <div class="progress" style="height: 6px; background: #1a1a24;">
            <div class="progress-bar bg-info progress-bar-striped progress-bar-animated" role="progressbar" style="width: 75%"></div>
          </div>
        </div>
      `;
    case 'flowdesk':
      return `
        <div class="w-100 p-3 rounded" style="background: rgba(0,0,0,0.6); border: 1px solid rgba(0,240,255,0.3);">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="small font-monospace text-cyan"><i class="fa-solid fa-chart-line me-1"></i>FLOWDESK // SAAS METRICS</span>
            <span class="small text-muted font-monospace">+18.4% MRR</span>
          </div>
          <div class="d-flex align-items-end justify-content-between gap-1" style="height: 50px;">
            <div class="bg-secondary opacity-50 w-100 rounded-top" style="height: 40%"></div>
            <div class="bg-secondary opacity-75 w-100 rounded-top" style="height: 60%"></div>
            <div class="bg-cyan w-100 rounded-top" style="height: 85%; box-shadow: 0 0 10px #00f0ff;"></div>
            <div class="bg-purple w-100 rounded-top" style="height: 100%; box-shadow: 0 0 10px #9d4edd;"></div>
          </div>
        </div>
      `;
    case 'blackcart':
      return `
        <div class="w-100 p-3 rounded" style="background: rgba(0,0,0,0.6); border: 1px solid rgba(199,125,255,0.3);">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="small font-monospace text-purple"><i class="fa-solid fa-bag-shopping me-1"></i>BLACKCART // DROP #09</span>
            <span class="badge bg-warning text-dark p-1" style="font-size:0.65rem;">LIMITED 500 PCS</span>
          </div>
          <div class="d-flex align-items-center gap-3">
            <div class="p-2 rounded bg-dark border border-secondary border-opacity-25 text-center text-purple" style="width: 50px; height: 40px; display:flex; align-items:center; justify-content:center;">
              <i class="fa-solid fa-shirt"></i>
            </div>
            <div>
              <div class="small fw-bold text-light font-monospace">GLITCH // CYBER HOODIE V1</div>
              <div class="small text-muted font-monospace">0.08 ETH / $180 USD</div>
            </div>
          </div>
        </div>
      `;
    case 'pearldental':
      return `
        <div class="w-100 p-3 rounded" style="background: rgba(0,0,0,0.6); border: 1px solid rgba(0,210,255,0.3);">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="small font-monospace text-cyan"><i class="fa-solid fa-tooth me-1"></i>PEARL DENTAL // MEDICAL PORTAL</span>
            <span class="badge bg-primary p-1" style="font-size:0.65rem;">ONLINE BOOKING</span>
          </div>
          <div class="p-2 rounded bg-dark border border-secondary border-opacity-25 mb-2 d-flex justify-content-between align-items-center">
            <span class="small font-monospace text-light"><i class="fa-solid fa-calendar-check text-cyan me-1"></i> Dr. Sarah Al-Mansoor</span>
            <span class="badge bg-success font-monospace" style="font-size:0.65rem;">CONFIRMED</span>
          </div>
          <div class="d-flex justify-content-between align-items-center font-monospace" style="font-size:0.75rem;">
            <span class="text-muted">Supabase RLS Active</span>
            <span class="text-cyan">Kuwait City, KW</span>
          </div>
        </div>
      `;
    default:
      return '';
  }
}

/* Project Category Filter */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.btn-filter:not(.btn-tech-filter)');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const category = e.target.getAttribute('data-filter');
      renderProjects(category);
    });
  });
}

/* Render Tech Stack */
function renderTechStack(filter = 'all') {
  const container = document.getElementById('tech-container');
  if (!container) return;

  const filteredTech = filter === 'all'
    ? TECH_STACK_DATA
    : TECH_STACK_DATA.filter(t => t.category === filter);

  container.innerHTML = '';

  filteredTech.forEach(tech => {
    const col = document.createElement('div');
    col.className = 'col-6 col-md-4 col-lg-3 mb-3';
    col.innerHTML = `
      <div class="tech-card">
        <i class="${tech.icon} tech-icon"></i>
        <div class="tech-name">${tech.name}</div>
      </div>
    `;
    container.appendChild(col);
  });
}

function initTechFilters() {
  const techBtns = document.querySelectorAll('.btn-tech-filter');
  techBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      techBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const filter = e.target.getAttribute('data-tech-filter');
      renderTechStack(filter);
    });
  });
}

/* Open Project Case Study Modal */
window.openProjectModal = function(projectId) {
  const project = PROJECTS_DATA.find(p => p.id === projectId);
  if (!project) return;

  const modalTitle = document.getElementById('projectModalTitle');
  const modalBody = document.getElementById('projectModalBody');

  modalTitle.innerHTML = `
    <div class="d-flex align-items-center gap-2">
      <span class="badge-concept"><i class="fa-solid fa-star me-1"></i>FEATURED PROJECT</span>
      <span class="text-cyan font-monospace">${project.title}</span>
    </div>
  `;

  modalBody.innerHTML = `
    <div class="row g-4">
      <div class="col-lg-6">
        <div class="p-3 rounded mb-3" style="background: #090a0f; border: 1px solid var(--border-dark);">
          ${getGraphicMarkup(project.mockupType)}
        </div>
        <div class="p-3 rounded bg-dark border border-secondary border-opacity-10 mb-3">
          <h6 class="text-purple font-monospace mb-2"><i class="fa-solid fa-chart-pie me-2"></i>Performance Benchmarks</h6>
          <div class="row text-center font-monospace">
            ${project.stats.map(s => `
              <div class="col-4">
                <div class="small text-muted">${s.label}</div>
                <div class="fw-bold text-cyan">${s.value}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="col-lg-6">
        <h4 class="h5 text-light mb-2">${project.subtitle}</h4>
        <p class="text-secondary small mb-3">${project.details}</p>

        <h6 class="text-cyan font-monospace mb-2"><i class="fa-solid fa-list-check me-2"></i>Architectural Highlights</h6>
        <ul class="list-unstyled small text-muted mb-4">
          ${project.features.map(f => `<li class="mb-2"><i class="fa-solid fa-check text-cyan me-2"></i>${f}</li>`).join('')}
        </ul>

        <h6 class="text-purple font-monospace mb-2"><i class="fa-solid fa-layer-group me-2"></i>Tech Stack Specification</h6>
        <div class="d-flex flex-wrap gap-2 mb-4">
          ${project.tags.map(t => `<span class="badge-cyber">${t}</span>`).join('')}
        </div>

        <div class="alert alert-dark border border-cyan border-opacity-25 rounded p-3 mb-3" style="background: rgba(0, 240, 255, 0.05);">
          <div class="d-flex gap-2 align-items-center mb-2">
            <i class="fa-solid fa-shield-halved text-cyan"></i>
            <span class="small text-cyan font-monospace">GLITCH ARCHITECTURE: Production-ready software solution engineered by Glitch Software House.</span>
          </div>
          ${project.liveUrl ? `<a href="${project.liveUrl}" class="btn btn-cyber-primary w-100 font-monospace text-center mt-2"><i class="fa-solid fa-arrow-up-right-from-square me-2"></i>Launch Live Application</a>` : ''}
        </div>
      </div>
    </div>
  `;

  const bsModal = new bootstrap.Modal(document.getElementById('projectModal'));
  bsModal.show();
};

/* Real Formspree Email Sending Contact Form Handler */
function initContactForm() {
  const form = document.getElementById('glitch-contact-form');
  if (!form) return;

  let isSubmitting = false;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!form.checkValidity()) {
      e.stopPropagation();
      form.classList.add('was-validated');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    isSubmitting = true;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Sending...`;

    try {
      const formAction = form.action && form.action.includes('formspree.io')
        ? form.action
        : 'https://formspree.io/f/mlgqzawq';

      const response = await fetch(formAction, {
        method: 'POST',
        body: new FormData(form),
        headers: {
          Accept: 'application/json'
        }
      });

      const modalTitle = document.getElementById('projectModalTitle');
      const modalBody = document.getElementById('projectModalBody');

      if (response.ok) {
        form.reset();
        form.classList.remove('was-validated');

        modalTitle.innerHTML = `<span class="text-success font-monospace"><i class="fa-solid fa-circle-check me-2"></i>FORMSPREE TRANSMISSION SENT</span>`;
        modalBody.innerHTML = `
          <div class="text-center py-4 font-monospace">
            <div class="display-3 text-cyan mb-3"><i class="fa-solid fa-paper-plane"></i></div>
            <h4 class="h5 text-light mb-2">Message Delivered via Formspree</h4>
            <p class="text-muted small max-w-500 mx-auto">
              Your inquiry has been successfully transmitted via Formspree (<strong class="text-cyan">https://formspree.io/f/mlgqzawq</strong>). Our team will review your specifications and respond shortly.
            </p>
            <div class="badge-cyber mt-3">STATUS // 200 OK</div>
          </div>
        `;
      } else {
        const errorData = await response.json();
        modalTitle.innerHTML = `<span class="text-danger font-monospace"><i class="fa-solid fa-triangle-exclamation me-2"></i>TRANSMISSION ERROR</span>`;
        modalBody.innerHTML = `
          <div class="text-center py-4 font-monospace">
            <div class="display-3 text-danger mb-3"><i class="fa-solid fa-circle-xmark"></i></div>
            <h4 class="h5 text-light mb-2">Formspree Submission Error</h4>
            <p class="text-muted small max-w-500 mx-auto">
              ${errorData && errorData.errors ? errorData.errors.map(err => err.message).join(', ') : 'Unable to process submission. Please try again.'}
            </p>
          </div>
        `;
      }

      const bsModal = new bootstrap.Modal(document.getElementById('projectModal'));
      bsModal.show();
    } catch (err) {
      console.error('Formspree dispatch error:', err);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      isSubmitting = false;
    }
  });
}

/* Stat Counter Animation */
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  let animated = false;

  const animate = () => {
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      const count = +counter.innerText.replace(/[^0-9.]/g, '');
      const speed = 200;
      const inc = target / speed;

      if (count < target) {
        counter.innerText = Math.ceil(count + inc) + (counter.getAttribute('data-unit') || '');
        setTimeout(animate, 15);
      } else {
        counter.innerText = target + (counter.getAttribute('data-unit') || '');
      }
    });
  };

  window.addEventListener('scroll', () => {
    const statsSection = document.querySelector('.hero-stats');
    if (statsSection && !animated) {
      const pos = statsSection.getBoundingClientRect().top;
      if (pos < window.innerHeight) {
        animated = true;
        animate();
      }
    }
  });
}

/* Terminal Typing Effect */
function initTerminalTyping() {
  const terminalElement = document.getElementById('terminal-typewriter');
  if (!terminalElement) return;

  const lines = [
    'const glitch = new SoftwareHouse({',
    '  websites: "Custom & Responsive",',
    '  qrMenus: "Instant Contactless PWA",',
    '  dashboards: "Real-Time Telemetry & SaaS",',
    '  status: "READY_TO_BUILD"',
    '});',
    'glitch.buildNextParadigm();'
  ];

  let lineIdx = 0;
  let charIdx = 0;
  let currentOutput = '';

  function type() {
    if (lineIdx < lines.length) {
      const currentLine = lines[lineIdx];
      if (charIdx < currentLine.length) {
        currentOutput += currentLine.charAt(charIdx);
        terminalElement.innerText = currentOutput;
        charIdx++;
        setTimeout(type, 35);
      } else {
        currentOutput += '\n';
        lineIdx++;
        charIdx = 0;
        setTimeout(type, 200);
      }
    }
  }

  type();
}
