/**
 * Glitch Bistro - Menu Management Script
 * Handles catalog CRUD, card/table view toggles, image previews, and availability status.
 */

let activeMenuViewMode = 'card'; // 'card' or 'table'
let activeMenuFilters = {
    search: '',
    category: 'all',
    availability: 'all',
    sort: 'name'
};

let currentEditingMenuId = null;

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('menu.html')) {
        renderMenuPage();
        initMenuFormPreview();
    }
});

function renderMenuPage() {
    renderMenuGridOrTable();
}

function setMenuViewMode(mode) {
    activeMenuViewMode = mode;
    document.getElementById('btn-view-card')?.classList.toggle('btn-glitch', mode === 'card');
    document.getElementById('btn-view-card')?.classList.toggle('btn-glass', mode !== 'card');
    document.getElementById('btn-view-table')?.classList.toggle('btn-glitch', mode === 'table');
    document.getElementById('btn-view-table')?.classList.toggle('btn-glass', mode !== 'table');

    renderMenuGridOrTable();
}

function applyMenuFilters() {
    activeMenuFilters.search = document.getElementById('menu-search-input')?.value || '';
    activeMenuFilters.category = document.getElementById('menu-category-filter')?.value || 'all';
    activeMenuFilters.availability = document.getElementById('menu-availability-filter')?.value || 'all';
    activeMenuFilters.sort = document.getElementById('menu-sort-filter')?.value || 'name';

    renderMenuGridOrTable();
}

function clearMenuFilters() {
    activeMenuFilters = { search: '', category: 'all', availability: 'all', sort: 'name' };
    if (document.getElementById('menu-search-input')) document.getElementById('menu-search-input').value = '';
    if (document.getElementById('menu-category-filter')) document.getElementById('menu-category-filter').value = 'all';
    if (document.getElementById('menu-availability-filter')) document.getElementById('menu-availability-filter').value = 'all';
    if (document.getElementById('menu-sort-filter')) document.getElementById('menu-sort-filter').value = 'name';

    renderMenuGridOrTable();
}

function getFilteredMenuItems() {
    let items = getMenu();
    const f = activeMenuFilters;

    if (f.search) {
        const q = f.search.toLowerCase();
        items = items.filter(m => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q) || m.id.toLowerCase().includes(q));
    }

    if (f.category !== 'all') {
        items = items.filter(m => m.category === f.category);
    }

    if (f.availability !== 'all') {
        const isAvail = f.availability === 'available';
        items = items.filter(m => m.available === isAvail);
    }

    if (f.sort === 'name') {
        items.sort((a, b) => a.name.localeCompare(b.name));
    } else if (f.sort === 'price-low') {
        items.sort((a, b) => a.price - b.price);
    } else if (f.sort === 'price-high') {
        items.sort((a, b) => b.price - a.price);
    } else if (f.sort === 'sales') {
        items.sort((a, b) => b.salesCount - a.salesCount);
    }

    return items;
}

function renderMenuGridOrTable() {
    const container = document.getElementById('menu-content-container');
    if (!container) return;

    const items = getFilteredMenuItems();
    const settings = getSettings();

    if (items.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center text-muted py-5">
                <i class="bi bi-search fs-1 d-block mb-2"></i>
                No menu items match your filter parameters.
            </div>
        `;
        return;
    }

    if (activeMenuViewMode === 'card') {
        container.className = 'row g-4';
        container.innerHTML = items.map(item => `
            <div class="col-md-6 col-lg-4 col-xl-3">
                <div class="glass-card glass-card-interactive product-card p-0 ${!item.available ? 'opacity-75' : ''}">
                    <div class="product-img-wrapper">
                        <img src="${item.image}" alt="${item.name}">
                        ${item.featured ? `<span class="product-badge-featured"><i class="bi bi-star-fill me-1"></i>Featured</span>` : ''}
                        <button onclick="toggleItemFeatured('${item.id}')" class="btn btn-sm ${item.featured ? 'btn-warning' : 'btn-dark'} position-absolute top-0 start-0 m-2 px-2 py-1 border-0" title="Toggle Featured">
                            <i class="bi bi-star${item.featured ? '-fill' : ''}"></i>
                        </button>
                    </div>
                    <div class="p-3 d-flex flex-column flex-grow-1">
                        <div class="d-flex justify-content-between align-items-start mb-1">
                            <div>
                                <small class="text-purple fw-bold d-block" style="font-size: 0.75rem;">${item.category}</small>
                                <strong class="text-white font-heading fs-6">${escapeHtml(item.name)}</strong>
                            </div>
                            <span class="fw-bold text-info font-heading fs-5">${settings.currency}${item.price.toFixed(2)}</span>
                        </div>
                        <p class="small text-muted mb-3 flex-grow-1" style="font-size: 0.8rem; line-height: 1.3;">${escapeHtml(item.description)}</p>
                        
                        <div class="d-flex align-items-center justify-content-between pt-2 border-top border-secondary mt-auto">
                            <div class="form-check form-switch m-0">
                                <input class="form-check-input bg-dark border-secondary" type="checkbox" role="switch" id="avail-switch-${item.id}" ${item.available ? 'checked' : ''} onchange="toggleItemAvailability('${item.id}', this.checked)">
                                <label class="form-check-label small ${item.available ? 'text-success' : 'text-danger'}" for="avail-switch-${item.id}">${item.available ? 'In Stock' : 'Out of Stock'}</label>
                            </div>
                            <div class="btn-group btn-group-sm">
                                <button onclick="openEditMenuModal('${item.id}')" class="btn btn-glass px-2"><i class="bi bi-pencil"></i></button>
                                <button onclick="confirmDeleteMenuItem('${item.id}')" class="btn btn-glass btn-glass-danger px-2"><i class="bi bi-trash"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    } else {
        container.className = 'col-12';
        container.innerHTML = `
            <div class="glass-card">
                <div class="custom-table-container">
                    <table class="table-custom">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>ID</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Prep Time</th>
                                <th>Sales Count</th>
                                <th>Availability</th>
                                <th>Featured</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map(item => `
                                <tr>
                                    <td>
                                        <div class="d-flex align-items-center gap-3">
                                            <img src="${item.image}" alt="${item.name}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 8px;">
                                            <div>
                                                <strong class="text-white d-block">${escapeHtml(item.name)}</strong>
                                                <small class="text-muted" style="font-size: 0.75rem;">${escapeHtml(item.description.substring(0, 45))}...</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="text-info fw-bold small">${item.id}</td>
                                    <td><span class="badge bg-dark border text-purple">${item.category}</span></td>
                                    <td class="fw-bold text-white">${settings.currency}${item.price.toFixed(2)}</td>
                                    <td class="text-muted small">${item.prepTime} mins</td>
                                    <td class="fw-bold text-info">${item.salesCount}</td>
                                    <td>
                                        <div class="form-check form-switch m-0">
                                            <input class="form-check-input bg-dark border-secondary" type="checkbox" role="switch" ${item.available ? 'checked' : ''} onchange="toggleItemAvailability('${item.id}', this.checked)">
                                            <span class="small ${item.available ? 'text-success' : 'text-danger'}">${item.available ? 'Available' : 'Unavailable'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <button onclick="toggleItemFeatured('${item.id}')" class="btn btn-sm ${item.featured ? 'text-warning' : 'text-muted'} p-0">
                                            <i class="bi bi-star${item.featured ? '-fill' : ''} fs-5"></i>
                                        </button>
                                    </td>
                                    <td>
                                        <div class="btn-group btn-group-sm">
                                            <button onclick="openEditMenuModal('${item.id}')" class="btn btn-glass px-2"><i class="bi bi-pencil"></i></button>
                                            <button onclick="confirmDeleteMenuItem('${item.id}')" class="btn btn-glass btn-glass-danger px-2"><i class="bi bi-trash"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
}

function toggleItemAvailability(id, status) {
    const menu = getMenu();
    const item = menu.find(m => m.id === id);
    if (item) {
        item.available = status;
        setStorage(STORAGE_KEYS.MENU, menu);
        showToast(`'${item.name}' status set to ${status ? 'In Stock' : 'Out of Stock'}`, status ? 'success' : 'warning');
        renderMenuPage();
    }
}

function toggleItemFeatured(id) {
    const menu = getMenu();
    const item = menu.find(m => m.id === id);
    if (item) {
        item.featured = !item.featured;
        setStorage(STORAGE_KEYS.MENU, menu);
        showToast(`'${item.name}' ${item.featured ? 'marked as featured' : 'removed from featured'}`, 'info');
        renderMenuPage();
    }
}

function initMenuFormPreview() {
    const imgUrlInput = document.getElementById('menu-form-image');
    const previewImg = document.getElementById('menu-form-image-preview');

    if (imgUrlInput && previewImg) {
        imgUrlInput.addEventListener('input', () => {
            previewImg.src = imgUrlInput.value || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80';
        });
    }
}

function openAddMenuModal() {
    currentEditingMenuId = null;
    document.getElementById('menu-modal-title').textContent = 'Add New Menu Item';
    document.getElementById('menu-item-form').reset();
    document.getElementById('menu-form-image-preview').src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80';

    const modal = new bootstrap.Modal(document.getElementById('menu-item-modal'));
    modal.show();
}

function openEditMenuModal(id) {
    const menu = getMenu();
    const item = menu.find(m => m.id === id);
    if (!item) return;

    currentEditingMenuId = id;
    document.getElementById('menu-modal-title').textContent = `Edit Menu Item (${item.id})`;
    document.getElementById('menu-form-name').value = item.name;
    document.getElementById('menu-form-category').value = item.category;
    document.getElementById('menu-form-price').value = item.price;
    document.getElementById('menu-form-preptime').value = item.prepTime;
    document.getElementById('menu-form-image').value = item.image;
    document.getElementById('menu-form-image-preview').src = item.image;
    document.getElementById('menu-form-description').value = item.description;
    document.getElementById('menu-form-available').checked = item.available;
    document.getElementById('menu-form-featured').checked = item.featured;

    const modal = new bootstrap.Modal(document.getElementById('menu-item-modal'));
    modal.show();
}

function handleSaveMenuItem(e) {
    e.preventDefault();

    const menu = getMenu();

    const name = document.getElementById('menu-form-name').value.trim();
    const category = document.getElementById('menu-form-category').value;
    const price = parseFloat(document.getElementById('menu-form-price').value);
    const prepTime = parseInt(document.getElementById('menu-form-preptime').value);
    const image = document.getElementById('menu-form-image').value.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80';
    const description = document.getElementById('menu-form-description').value.trim();
    const available = document.getElementById('menu-form-available').checked;
    const featured = document.getElementById('menu-form-featured').checked;

    if (currentEditingMenuId) {
        // Edit existing
        const item = menu.find(m => m.id === currentEditingMenuId);
        if (item) {
            item.name = name;
            item.category = category;
            item.price = price;
            item.prepTime = prepTime;
            item.image = image;
            item.description = description;
            item.available = available;
            item.featured = featured;
        }
        showToast(`Menu item '${name}' updated!`, 'success');
    } else {
        // Add new
        const newId = `MNU-${Math.floor(700 + Math.random() * 200)}`;
        const newItem = {
            id: newId,
            name,
            category,
            price,
            prepTime,
            image,
            description,
            available,
            featured,
            salesCount: 0
        };
        menu.push(newItem);
        showToast(`New menu item '${name}' added!`, 'success');
    }

    setStorage(STORAGE_KEYS.MENU, menu);

    const modalEl = document.getElementById('menu-item-modal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    renderMenuPage();
}

function confirmDeleteMenuItem(id) {
    const menu = getMenu();
    const item = menu.find(m => m.id === id);
    if (!item) return;

    if (confirm(`Are you sure you want to delete '${item.name}' from the menu?`)) {
        const updated = menu.filter(m => m.id !== id);
        setStorage(STORAGE_KEYS.MENU, updated);
        showToast(`Item '${item.name}' deleted from menu.`, 'danger');
        renderMenuPage();
    }
}
