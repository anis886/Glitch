/**
 * Glitch Bistro - Layout Engine
 * Generates dynamic Navbar, Sidebar, Notification system, Toasts, and Global Search.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Determine active page
    const currentPath = window.location.pathname;
    const pageName = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';

    if (pageName !== 'login.html') {
        // Enforce auth check
        checkAuth(false);

        // Inject App Shell UI elements
        renderSidebar(pageName);
        renderNavbar(pageName);
        renderGlobalSearchModal();
        renderToastContainer();
        initLiveClock();
        initSidebarState();
    } else {
        checkAuth(true);
    }
});

// Sidebar Generator
function renderSidebar(activePage) {
    const sidebarContainer = document.getElementById('app-sidebar-container');
    if (!sidebarContainer) return;

    const navItems = [
        { label: 'Dashboard', icon: 'bi-grid-1x2-fill', href: 'index.html' },
        { label: 'Orders', icon: 'bi-receipt-cutoff', href: 'orders.html' },
        { label: 'New Order', icon: 'bi-plus-circle-fill', href: 'new-order.html' },
        { label: 'Menu', icon: 'bi-menu-button-wide-fill', href: 'menu.html' },
        { label: 'Sales Reports', icon: 'bi-bar-chart-line-fill', href: 'reports.html' },
        { label: 'Customers', icon: 'bi-people-fill', href: 'customers.html' },
        { label: 'Settings', icon: 'bi-gear-fill', href: 'settings.html' },
        { label: 'Glitch Hub', icon: 'bi-house-door-fill', href: '../index.html' },
        { label: 'Concept Showcase', icon: 'bi-globe', href: '../concept-project/index.html' }
    ];

    const menuHtml = navItems.map(item => {
        const isActive = activePage === item.href || (activePage === '' && item.href === 'index.html');
        return `
            <a href="${item.href}" class="nav-item-link ${isActive ? 'active' : ''}">
                <i class="bi ${item.icon}"></i>
                <span>${item.label}</span>
            </a>
        `;
    }).join('');

    const settings = getSettings();

    sidebarContainer.innerHTML = `
        <aside class="app-sidebar">
            <div class="sidebar-header">
                <a href="index.html" class="brand-logo">
                    <img src="../assets/glitchlogo (2).png" alt="GLITCH" class="brand-logo-img">
                    <div class="brand-text">
                        <span>GLITCH</span> BISTRO
                    </div>
                </a>
            </div>
            <div class="sidebar-menu">
                <div class="menu-category">Main Menu</div>
                ${menuHtml}
            </div>
            <div class="sidebar-footer">
                <button onclick="logoutUser()" class="btn btn-glass w-100 btn-glass-danger justify-content-center">
                    <i class="bi bi-box-arrow-right"></i>
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    `;
}

// Top Navbar Generator
function renderNavbar(activePage) {
    const navbarContainer = document.getElementById('app-navbar-container');
    if (!navbarContainer) return;

    const titles = {
        'index.html': 'Dashboard Overview',
        'orders.html': 'Order Management',
        'new-order.html': 'POS - Create New Order',
        'menu.html': 'Menu Management',
        'reports.html': 'Sales & Analytics Reports',
        'customers.html': 'Customer Records',
        'settings.html': 'Restaurant Settings'
    };

    const titleText = titles[activePage] || 'Dashboard';
    const notifications = getNotifications();
    const unreadCount = notifications.filter(n => !n.read).length;
    const session = getAuthSession();
    const userName = session && session.user ? session.user.name : 'Restaurant Admin';
    const userRole = session && session.user ? session.user.role : 'Manager';
    const userAvatar = session && session.user ? session.user.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

    navbarContainer.innerHTML = `
        <header class="app-navbar">
            <div class="navbar-left">
                <button class="sidebar-toggle-btn" onclick="toggleSidebar()" title="Toggle Sidebar">
                    <i class="bi bi-layout-sidebar-inset"></i>
                </button>
                <h1 class="page-title">${titleText}</h1>
                <a href="../index.html" class="btn btn-sm btn-outline-info ms-3 d-none d-md-inline-flex align-items-center gap-1 font-monospace" style="font-size:0.75rem; text-decoration:none;">
                    <i class="bi bi-arrow-left"></i> Glitch Hub
                </a>
            </div>
            <div class="navbar-right">
                <button class="search-trigger-btn" onclick="openGlobalSearch()">
                    <i class="bi bi-search"></i>
                    <span class="d-none d-md-inline">Quick Search...</span>
                    <span class="badge bg-dark border text-muted d-none d-md-inline ms-2">Ctrl+K</span>
                </button>

                <div class="live-clock-badge d-none d-lg-flex">
                    <i class="bi bi-clock text-info"></i>
                    <span id="live-clock-text">--:--:--</span>
                </div>

                <!-- Notifications Dropdown -->
                <div class="dropdown">
                    <button class="btn btn-glass position-relative px-2 py-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="bi bi-bell-fill fs-5"></i>
                        ${unreadCount > 0 ? `<span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">${unreadCount}</span>` : ''}
                    </button>
                    <div class="dropdown-menu dropdown-menu-end glass-modal p-0" style="width: 340px; max-height: 420px; overflow-y: auto;">
                        <div class="p-3 border-bottom d-flex align-items-center justify-content-between">
                            <h6 class="m-0 font-heading fw-bold">Notifications (${notifications.length})</h6>
                            <div class="btn-group btn-group-sm">
                                <button onclick="markAllNotificationsRead()" class="btn btn-sm btn-link text-info p-0 text-decoration-none me-2">Mark all read</button>
                                <button onclick="clearNotifications()" class="btn btn-sm btn-link text-muted p-0 text-decoration-none">Clear</button>
                            </div>
                        </div>
                        <div id="notifications-list" class="list-group list-group-flush bg-transparent">
                            ${renderNotificationsList(notifications)}
                        </div>
                    </div>
                </div>

                <!-- User Profile Dropdown -->
                <div class="dropdown">
                    <button class="btn btn-glass d-flex align-items-center gap-2 p-1 pe-3" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <img src="${userAvatar}" alt="Admin Avatar" class="rounded-circle" style="width: 32px; height: 32px; object-fit: cover;">
                        <div class="text-start d-none d-md-block" style="line-height: 1.1;">
                            <div class="fw-bold text-white small">${escapeHtml(userName)}</div>
                            <small class="text-muted" style="font-size: 0.7rem;">${escapeHtml(userRole)}</small>
                        </div>
                        <i class="bi bi-chevron-down ms-1 text-muted small"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end glass-modal">
                        <li><a class="dropdown-item text-white" href="settings.html"><i class="bi bi-gear me-2 text-info"></i> Settings</a></li>
                        <li><hr class="dropdown-divider border-secondary"></li>
                        <li><a class="dropdown-item text-danger" href="#" onclick="logoutUser()"><i class="bi bi-box-arrow-right me-2"></i> Logout</a></li>
                    </ul>
                </div>
            </div>
        </header>
    `;
}

function renderNotificationsList(notifications) {
    if (!notifications || notifications.length === 0) {
        return `<div class="p-4 text-center text-muted"><i class="bi bi-bell-slash fs-3 d-block mb-2"></i>No notifications yet</div>`;
    }

    return notifications.map(n => `
        <div class="list-group-item bg-transparent text-white border-bottom border-secondary d-flex align-items-start gap-2 p-3 ${n.read ? 'opacity-75' : ''}">
            <i class="bi ${n.type === 'order' ? 'bi-cart-check-fill text-info' : n.type === 'warning' ? 'bi-exclamation-triangle-fill text-warning' : 'bi-info-circle-fill text-purple'} fs-5"></i>
            <div class="flex-grow-1">
                <div class="d-flex justify-content-between align-items-center">
                    <strong class="small">${escapeHtml(n.title)}</strong>
                    <small class="text-muted" style="font-size: 0.65rem;">${new Date(n.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                </div>
                <p class="small text-muted mb-0" style="font-size: 0.8rem;">${escapeHtml(n.message)}</p>
            </div>
            ${!n.read ? `<button onclick="markNotificationRead('${n.id}')" class="btn btn-sm text-info p-0" title="Mark read"><i class="bi bi-check-circle"></i></button>` : ''}
        </div>
    `).join('');
}

function markNotificationRead(id) {
    const notifications = getNotifications();
    const item = notifications.find(n => n.id === id);
    if (item) {
        item.read = true;
        setStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
        renderNavbar(window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1) || 'index.html');
    }
}

function markAllNotificationsRead() {
    const notifications = getNotifications();
    notifications.forEach(n => n.read = true);
    setStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
    renderNavbar(window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1) || 'index.html');
}

function clearNotifications() {
    setStorage(STORAGE_KEYS.NOTIFICATIONS, []);
    renderNavbar(window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1) || 'index.html');
}

// Live Clock
function initLiveClock() {
    const clockEl = document.getElementById('live-clock-text');
    if (!clockEl) return;

    function update() {
        const d = new Date();
        clockEl.textContent = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' • ' + d.toLocaleTimeString();
    }
    update();
    setInterval(update, 1000);
}

// Sidebar Toggle Logic
function toggleSidebar() {
    if (window.innerWidth < 992) {
        document.body.classList.toggle('sidebar-open');
    } else {
        document.body.classList.toggle('sidebar-collapsed');
        localStorage.setItem('gb_sidebar_collapsed', document.body.classList.contains('sidebar-collapsed'));
    }
}

function initSidebarState() {
    if (window.innerWidth >= 992) {
        const isCollapsed = localStorage.getItem('gb_sidebar_collapsed') === 'true';
        if (isCollapsed) {
            document.body.classList.add('sidebar-collapsed');
        }
    }
}

// Global Search Modal Generator
function renderGlobalSearchModal() {
    if (document.getElementById('global-search-modal')) return;

    const modalDiv = document.createElement('div');
    modalDiv.className = 'modal fade';
    modalDiv.id = 'global-search-modal';
    modalDiv.tabIndex = -1;
    modalDiv.innerHTML = `
        <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content glass-modal">
                <div class="modal-header border-0 pb-0">
                    <div class="input-group input-group-lg">
                        <span class="input-group-text bg-transparent border-0 text-info"><i class="bi bi-search fs-4"></i></span>
                        <input type="text" id="global-search-input" class="form-control bg-transparent border-0 text-white shadow-none" placeholder="Search orders, menu items, or customers..." oninput="handleGlobalSearch(this.value)">
                    </div>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4">
                    <div id="global-search-results" class="row g-3">
                        <div class="text-center text-muted py-4">Start typing to search across the entire dashboard...</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modalDiv);

    // Keyboard shortcut Ctrl+K
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openGlobalSearch();
        }
    });
}

function openGlobalSearch() {
    const modalEl = document.getElementById('global-search-modal');
    if (modalEl) {
        const bsModal = new bootstrap.Modal(modalEl);
        bsModal.show();
        setTimeout(() => {
            const input = document.getElementById('global-search-input');
            if (input) input.focus();
        }, 300);
    }
}

function handleGlobalSearch(query) {
    const resultsContainer = document.getElementById('global-search-results');
    if (!resultsContainer) return;

    if (!query.trim()) {
        resultsContainer.innerHTML = `<div class="text-center text-muted py-4">Start typing to search across orders, menu items, or customers...</div>`;
        return;
    }

    const q = query.toLowerCase();
    const orders = getOrders().filter(o => o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q));
    const menu = getMenu().filter(m => m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q));
    const customers = getCustomers().filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q));

    let html = '';

    if (orders.length > 0) {
        html += `<div class="col-12"><h6 class="text-info font-heading mb-2">Orders (${orders.length})</h6></div>`;
        orders.slice(0, 4).forEach(o => {
            html += `
                <div class="col-md-6">
                    <div class="glass-card p-3 rounded-3 hover-effect">
                        <div class="d-flex justify-content-between align-items-center">
                            <strong class="text-white">${o.id} - ${escapeHtml(o.customerName)}</strong>
                            <span class="status-badge status-${o.status}">${o.status}</span>
                        </div>
                        <div class="small text-muted mt-1">$${o.total.toFixed(2)} • ${o.type} • ${new Date(o.createdAt).toLocaleDateString()}</div>
                        <a href="orders.html?search=${o.id}" class="btn btn-sm btn-link text-cyan p-0 mt-2 text-decoration-none">View in Orders &rarr;</a>
                    </div>
                </div>
            `;
        });
    }

    if (menu.length > 0) {
        html += `<div class="col-12 mt-3"><h6 class="text-purple font-heading mb-2">Menu Items (${menu.length})</h6></div>`;
        menu.slice(0, 4).forEach(m => {
            html += `
                <div class="col-md-6">
                    <div class="glass-card p-3 rounded-3 d-flex align-items-center gap-3">
                        <img src="${m.image}" alt="${m.name}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 8px;">
                        <div>
                            <strong class="text-white d-block">${escapeHtml(m.name)}</strong>
                            <small class="text-muted">$${m.price.toFixed(2)} • ${m.category}</small>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    if (customers.length > 0) {
        html += `<div class="col-12 mt-3"><h6 class="text-warning font-heading mb-2">Customers (${customers.length})</h6></div>`;
        customers.slice(0, 4).forEach(c => {
            html += `
                <div class="col-md-6">
                    <div class="glass-card p-3 rounded-3">
                        <strong class="text-white d-block">${escapeHtml(c.name)} (${c.type})</strong>
                        <small class="text-muted">${escapeHtml(c.phone)} • Spent $${c.totalSpent.toFixed(2)}</small>
                    </div>
                </div>
            `;
        });
    }

    if (orders.length === 0 && menu.length === 0 && customers.length === 0) {
        html = `<div class="text-center text-muted py-4"><i class="bi bi-emoji-frown fs-3 d-block mb-2"></i>No matching records found for "${escapeHtml(query)}"</div>`;
    }

    resultsContainer.innerHTML = html;
}

// Toast Notification System
function renderToastContainer() {
    if (document.getElementById('toast-container')) return;
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container-custom';
    document.body.appendChild(toastContainer);
}

function showToast(message, type = 'info') {
    renderToastContainer();
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;

    const iconMap = {
        success: 'bi-check-circle-fill text-success',
        danger: 'bi-x-circle-fill text-danger',
        warning: 'bi-exclamation-triangle-fill text-warning',
        info: 'bi-info-circle-fill text-info'
    };

    toast.innerHTML = `
        <i class="bi ${iconMap[type] || iconMap.info} fs-4"></i>
        <div class="flex-grow-1 small">${escapeHtml(message)}</div>
        <button type="button" class="btn-close btn-close-white ms-2" onclick="this.parentElement.remove()"></button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentElement) toast.remove();
    }, 4000);
}
