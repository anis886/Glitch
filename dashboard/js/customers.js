/**
 * Glitch Bistro - Customers Management Script
 * Handles customer records search, sorting, details modal with order history timeline, notes editor, and deletion.
 */

let activeCustomerSearch = '';
let activeCustomerSort = 'spent';

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('customers.html')) {
        renderCustomersPage();
    }
});

function renderCustomersPage() {
    renderCustomersTable();
}

function applyCustomerFilters() {
    activeCustomerSearch = document.getElementById('customer-search-input')?.value || '';
    activeCustomerSort = document.getElementById('customer-sort-filter')?.value || 'spent';
    renderCustomersTable();
}

function getFilteredCustomers() {
    let customers = getCustomers();

    if (activeCustomerSearch) {
        const q = activeCustomerSearch.toLowerCase();
        customers = customers.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.email && c.email.toLowerCase().includes(q)));
    }

    if (activeCustomerSort === 'spent') {
        customers.sort((a, b) => b.totalSpent - a.totalSpent);
    } else if (activeCustomerSort === 'orders') {
        customers.sort((a, b) => b.totalOrders - a.totalOrders);
    } else if (activeCustomerSort === 'name') {
        customers.sort((a, b) => a.name.localeCompare(b.name));
    } else if (activeCustomerSort === 'date') {
        customers.sort((a, b) => new Date(b.lastOrderDate) - new Date(a.lastOrderDate));
    }

    return customers;
}

function renderCustomersTable() {
    const tbody = document.getElementById('customers-table-tbody');
    if (!tbody) return;

    const customers = getFilteredCustomers();
    const settings = getSettings();

    if (customers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-5"><i class="bi bi-people fs-1 d-block mb-2"></i>No customer records found.</td></tr>`;
        return;
    }

    tbody.innerHTML = customers.map(c => `
        <tr>
            <td class="fw-bold text-info small">${c.id}</td>
            <td>
                <strong class="text-white d-block">${escapeHtml(c.name)}</strong>
                <small class="text-muted" style="font-size: 0.75rem;">${escapeHtml(c.email || '')}</small>
            </td>
            <td class="text-muted small">${escapeHtml(c.phone)}</td>
            <td>
                <span class="badge ${c.type === 'VIP' ? 'bg-warning text-dark' : c.type === 'Regular' ? 'bg-purple text-white' : 'bg-info text-dark'} font-heading">
                    ${c.type}
                </span>
            </td>
            <td class="fw-bold text-white text-center">${c.totalOrders}</td>
            <td class="fw-bold text-emerald">${settings.currency}${c.totalSpent.toFixed(2)}</td>
            <td class="text-muted small">${new Date(c.lastOrderDate).toLocaleDateString()}</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button onclick="viewCustomerDetailsModal('${c.id}')" class="btn btn-glass" title="View History"><i class="bi bi-eye"></i></button>
                    <button onclick="openEditCustomerNotesModal('${c.id}')" class="btn btn-glass" title="Edit Notes"><i class="bi bi-pencil-square"></i></button>
                    <button onclick="confirmDeleteCustomer('${c.id}')" class="btn btn-glass btn-glass-danger" title="Delete"><i class="bi bi-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

function viewCustomerDetailsModal(id) {
    const customers = getCustomers();
    const customer = customers.find(c => c.id === id);
    if (!customer) return;

    const orders = getOrders().filter(o => o.customerName.toLowerCase() === customer.name.toLowerCase() || o.customerPhone === customer.phone);
    const settings = getSettings();

    document.getElementById('customer-modal-title').textContent = `Customer Profile: ${customer.name}`;

    const ordersHistoryHtml = orders.length === 0 ? `<p class="text-muted small">No order history available.</p>` : orders.map(o => `
        <div class="d-flex align-items-center justify-content-between p-2 mb-2 rounded-3 bg-dark border border-secondary">
            <div>
                <strong class="text-info small">${o.id}</strong> • <span class="text-capitalize text-white small">${o.type}</span>
                <small class="text-muted d-block" style="font-size: 0.75rem;">${new Date(o.createdAt).toLocaleString()}</small>
            </div>
            <div class="text-end">
                <span class="fw-bold text-white small d-block">${settings.currency}${o.total.toFixed(2)}</span>
                <span class="status-badge status-${o.status}" style="font-size: 0.65rem;">${o.status}</span>
            </div>
        </div>
    `).join('');

    document.getElementById('customer-modal-body').innerHTML = `
        <div class="row g-3 mb-4">
            <div class="col-md-6">
                <div class="glass-card p-3">
                    <small class="text-muted text-uppercase fw-bold d-block mb-1">General Info</small>
                    <h5 class="text-white fw-bold m-0">${escapeHtml(customer.name)}</h5>
                    <div class="small text-muted mb-2">${escapeHtml(customer.email)}</div>
                    <span class="badge ${customer.type === 'VIP' ? 'bg-warning text-dark' : 'bg-info text-dark'} mb-2">${customer.type} Customer</span>
                    <div class="small text-muted"><i class="bi bi-telephone me-1"></i>${escapeHtml(customer.phone)}</div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="glass-card p-3">
                    <small class="text-muted text-uppercase fw-bold d-block mb-1">Lifetime Value</small>
                    <div class="h3 font-heading text-emerald fw-bold mb-1">${settings.currency}${customer.totalSpent.toFixed(2)}</div>
                    <div class="small text-muted">Total Orders Placed: <strong class="text-white">${customer.totalOrders}</strong></div>
                    <div class="small text-muted">Last Order: <strong class="text-white">${new Date(customer.lastOrderDate).toLocaleDateString()}</strong></div>
                </div>
            </div>
        </div>

        <div class="mb-4">
            <h6 class="font-heading text-white fw-bold mb-2">Staff Notes</h6>
            <div class="p-3 rounded-3 bg-dark border border-secondary text-white small">
                ${customer.notes ? escapeHtml(customer.notes) : '<em class="text-muted">No notes recorded yet.</em>'}
            </div>
        </div>

        <div>
            <h6 class="font-heading text-white fw-bold mb-2">Order History (${orders.length})</h6>
            <div style="max-height: 250px; overflow-y: auto;">
                ${ordersHistoryHtml}
            </div>
        </div>
    `;

    const bsModal = new bootstrap.Modal(document.getElementById('customer-details-modal'));
    bsModal.show();
}

let activeCustomerNotesId = null;

function openEditCustomerNotesModal(id) {
    const customers = getCustomers();
    const customer = customers.find(c => c.id === id);
    if (!customer) return;

    activeCustomerNotesId = id;
    document.getElementById('edit-customer-name-title').textContent = customer.name;
    document.getElementById('customer-notes-textarea').value = customer.notes || '';

    const bsModal = new bootstrap.Modal(document.getElementById('customer-notes-modal'));
    bsModal.show();
}

function handleSaveCustomerNotes(e) {
    e.preventDefault();
    if (!activeCustomerNotesId) return;

    const customers = getCustomers();
    const customer = customers.find(c => c.id === activeCustomerNotesId);
    if (customer) {
        customer.notes = document.getElementById('customer-notes-textarea').value.trim();
        setStorage(STORAGE_KEYS.CUSTOMERS, customers);
        showToast(`Notes updated for ${customer.name}`, 'success');
        renderCustomersPage();
    }

    const modalEl = document.getElementById('customer-notes-modal');
    const bsModal = bootstrap.Modal.getInstance(modalEl);
    if (bsModal) bsModal.hide();
}

function confirmDeleteCustomer(id) {
    const customers = getCustomers();
    const customer = customers.find(c => c.id === id);
    if (!customer) return;

    if (confirm(`Are you sure you want to delete customer record for '${customer.name}'?`)) {
        const updated = customers.filter(c => c.id !== id);
        setStorage(STORAGE_KEYS.CUSTOMERS, updated);
        showToast(`Customer record for ${customer.name} deleted.`, 'danger');
        renderCustomersPage();
    }
}
