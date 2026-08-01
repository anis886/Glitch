/**
 * Glitch Bistro - Orders Management Script
 * Handles table filtering, status updates, order creation modal, receipt printing, duplication, and deletion.
 */

let activeOrderFilters = {
    search: '',
    status: 'all',
    type: 'all',
    payment: 'all',
    date: 'all',
    sort: 'newest'
};

let currentOrderInModal = null;

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('orders.html')) {
        // Parse URL query search if navigated from search or dashboard
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('search')) {
            activeOrderFilters.search = urlParams.get('search');
            const searchInput = document.getElementById('order-search-input');
            if (searchInput) searchInput.value = activeOrderFilters.search;
        }

        renderOrdersPage();
    }
});

function renderOrdersPage() {
    renderOrderStats();
    renderOrdersTable();
}

function renderOrderStats() {
    const container = document.getElementById('orders-stats-bar');
    if (!container) return;

    const orders = getOrders();
    const newCount = orders.filter(o => o.status === 'new').length;
    const preparingCount = orders.filter(o => o.status === 'preparing').length;
    const readyCount = orders.filter(o => o.status === 'ready').length;
    const completedCount = orders.filter(o => o.status === 'completed').length;
    const cancelledCount = orders.filter(o => o.status === 'cancelled').length;

    container.innerHTML = `
        <div class="d-flex flex-wrap gap-3">
            <div class="glass-card py-2 px-3 flex-grow-1 d-flex align-items-center justify-content-between">
                <span class="small text-muted fw-semibold">New Orders</span>
                <span class="badge bg-info text-dark font-heading fs-6">${newCount}</span>
            </div>
            <div class="glass-card py-2 px-3 flex-grow-1 d-flex align-items-center justify-content-between">
                <span class="small text-muted fw-semibold">Preparing</span>
                <span class="badge bg-warning text-dark font-heading fs-6">${preparingCount}</span>
            </div>
            <div class="glass-card py-2 px-3 flex-grow-1 d-flex align-items-center justify-content-between">
                <span class="small text-muted fw-semibold">Ready for Pickup/Delivery</span>
                <span class="badge bg-purple text-white font-heading fs-6">${readyCount}</span>
            </div>
            <div class="glass-card py-2 px-3 flex-grow-1 d-flex align-items-center justify-content-between">
                <span class="small text-muted fw-semibold">Completed</span>
                <span class="badge bg-success text-white font-heading fs-6">${completedCount}</span>
            </div>
            <div class="glass-card py-2 px-3 flex-grow-1 d-flex align-items-center justify-content-between">
                <span class="small text-muted fw-semibold">Cancelled</span>
                <span class="badge bg-danger text-white font-heading fs-6">${cancelledCount}</span>
            </div>
        </div>
    `;
}

function getFilteredOrders() {
    let orders = getOrders();
    const f = activeOrderFilters;

    if (f.search) {
        const q = f.search.toLowerCase();
        orders = orders.filter(o => o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.customerPhone.includes(q));
    }

    if (f.status !== 'all') {
        orders = orders.filter(o => o.status === f.status);
    }

    if (f.type !== 'all') {
        orders = orders.filter(o => o.type === f.type);
    }

    if (f.payment !== 'all') {
        orders = orders.filter(o => o.paymentMethod === f.payment);
    }

    if (f.date !== 'all') {
        const now = Date.now();
        const todayStart = new Date().setHours(0, 0, 0, 0);
        if (f.date === 'today') {
            orders = orders.filter(o => new Date(o.createdAt).getTime() >= todayStart);
        } else if (f.date === 'yesterday') {
            const yesterdayStart = todayStart - (24 * 60 * 60 * 1000);
            orders = orders.filter(o => {
                const t = new Date(o.createdAt).getTime();
                return t >= yesterdayStart && t < todayStart;
            });
        } else if (f.date === '7days') {
            const weekStart = todayStart - (6 * 24 * 60 * 60 * 1000);
            orders = orders.filter(o => new Date(o.createdAt).getTime() >= weekStart);
        }
    }

    // Sort
    if (f.sort === 'newest') {
        orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (f.sort === 'oldest') {
        orders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (f.sort === 'highest') {
        orders.sort((a, b) => b.total - a.total);
    } else if (f.sort === 'lowest') {
        orders.sort((a, b) => a.total - b.total);
    }

    return orders;
}

function renderOrdersTable() {
    const tableBody = document.getElementById('orders-table-tbody');
    if (!tableBody) return;

    const filtered = getFilteredOrders();
    const settings = getSettings();

    if (filtered.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center text-muted py-5">
                    <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                    No orders match your filter criteria.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = filtered.map(o => `
        <tr>
            <td class="fw-bold text-info">${o.id}</td>
            <td>
                <div class="fw-bold text-white">${escapeHtml(o.customerName)}</div>
                <small class="text-muted" style="font-size: 0.75rem;">${escapeHtml(o.customerPhone || 'N/A')}</small>
            </td>
            <td>
                <span class="text-capitalize text-muted small">
                    <i class="bi ${o.type === 'delivery' ? 'bi-truck text-info' : o.type === 'dine-in' ? 'bi-shop text-purple' : 'bi-bag text-warning'} me-1"></i>
                    ${o.type} ${o.tableNumber ? `(${o.tableNumber})` : ''}
                </span>
            </td>
            <td class="fw-bold text-white">${settings.currency}${o.total.toFixed(2)}</td>
            <td class="text-uppercase small text-muted">${o.paymentMethod}</td>
            <td>
                <select class="form-select form-select-sm form-select-glitch status-select-dropdown" style="width: 130px;" onchange="updateOrderStatus('${o.id}', this.value)">
                    <option value="new" ${o.status === 'new' ? 'selected' : ''}>New</option>
                    <option value="confirmed" ${o.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option value="preparing" ${o.status === 'preparing' ? 'selected' : ''}>Preparing</option>
                    <option value="ready" ${o.status === 'ready' ? 'selected' : ''}>Ready</option>
                    <option value="completed" ${o.status === 'completed' ? 'selected' : ''}>Completed</option>
                    <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
            <td class="text-muted small">${new Date(o.createdAt).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}</td>
            <td>
                <div class="dropdown">
                    <button class="btn btn-sm btn-glass px-2" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end glass-modal">
                        <li><a class="dropdown-item text-white" href="#" onclick="viewOrderModal('${o.id}')"><i class="bi bi-eye text-info me-2"></i> View Details</a></li>
                        <li><a class="dropdown-item text-white" href="#" onclick="duplicateOrder('${o.id}')"><i class="bi bi-files text-purple me-2"></i> Duplicate Order</a></li>
                        <li><a class="dropdown-item text-white" href="#" onclick="printReceiptModal('${o.id}')"><i class="bi bi-printer text-success me-2"></i> Print Receipt</a></li>
                        <li><hr class="dropdown-divider border-secondary"></li>
                        <li><a class="dropdown-item text-danger" href="#" onclick="confirmDeleteOrder('${o.id}')"><i class="bi bi-trash me-2"></i> Delete Order</a></li>
                    </ul>
                </div>
            </td>
        </tr>
    `).join('');
}

function updateOrderStatus(orderId, newStatus) {
    const orders = getOrders();
    const order = orders.find(o => o.id === orderId);

    if (order) {
        order.status = newStatus;
        setStorage(STORAGE_KEYS.ORDERS, orders);
        showToast(`Order #${orderId} status updated to '${newStatus.toUpperCase()}'`, 'success');
        
        // Refresh customer history
        updateCustomerFromOrder(order);

        renderOrdersPage();
    }
}

function applyOrderFilters() {
    activeOrderFilters.search = document.getElementById('order-search-input')?.value || '';
    activeOrderFilters.status = document.getElementById('order-status-filter')?.value || 'all';
    activeOrderFilters.type = document.getElementById('order-type-filter')?.value || 'all';
    activeOrderFilters.payment = document.getElementById('order-payment-filter')?.value || 'all';
    activeOrderFilters.date = document.getElementById('order-date-filter')?.value || 'all';
    activeOrderFilters.sort = document.getElementById('order-sort-filter')?.value || 'newest';

    renderOrdersTable();
}

function clearOrderFilters() {
    activeOrderFilters = { search: '', status: 'all', type: 'all', payment: 'all', date: 'all', sort: 'newest' };
    if (document.getElementById('order-search-input')) document.getElementById('order-search-input').value = '';
    if (document.getElementById('order-status-filter')) document.getElementById('order-status-filter').value = 'all';
    if (document.getElementById('order-type-filter')) document.getElementById('order-type-filter').value = 'all';
    if (document.getElementById('order-payment-filter')) document.getElementById('order-payment-filter').value = 'all';
    if (document.getElementById('order-date-filter')) document.getElementById('order-date-filter').value = 'all';
    if (document.getElementById('order-sort-filter')) document.getElementById('order-sort-filter').value = 'newest';

    renderOrdersTable();
}

function viewOrderModal(orderId) {
    const orders = getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    currentOrderInModal = order;
    const settings = getSettings();

    document.getElementById('modal-order-id').textContent = `Order Details #${order.id}`;

    const itemsHtml = order.items.map(item => `
        <div class="d-flex align-items-center justify-content-between py-2 border-bottom border-secondary">
            <div>
                <strong class="text-white">${escapeHtml(item.name)}</strong>
                <small class="text-muted d-block">${settings.currency}${item.price.toFixed(2)} x ${item.quantity}</small>
            </div>
            <div class="fw-bold text-info">${settings.currency}${(item.price * item.quantity).toFixed(2)}</div>
        </div>
    `).join('');

    document.getElementById('modal-order-content').innerHTML = `
        <div class="row g-3 mb-4">
            <div class="col-md-6">
                <div class="glass-card p-3">
                    <small class="text-muted text-uppercase fw-bold d-block mb-1">Customer Info</small>
                    <h6 class="text-white fw-bold m-0">${escapeHtml(order.customerName)}</h6>
                    <small class="text-muted d-block">${escapeHtml(order.customerPhone || 'No phone provided')}</small>
                    ${order.deliveryAddress ? `<small class="text-info d-block mt-1"><i class="bi bi-geo-alt me-1"></i>${escapeHtml(order.deliveryAddress)}</small>` : ''}
                    ${order.tableNumber ? `<small class="text-purple d-block mt-1"><i class="bi bi-shop me-1"></i>${escapeHtml(order.tableNumber)}</small>` : ''}
                </div>
            </div>
            <div class="col-md-6">
                <div class="glass-card p-3">
                    <small class="text-muted text-uppercase fw-bold d-block mb-1">Order Metadata</small>
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="small text-muted">Status:</span>
                        <span class="status-badge status-${order.status}">${order.status}</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <span class="small text-muted">Type:</span>
                        <span class="text-capitalize text-white small">${order.type}</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="small text-muted">Payment:</span>
                        <span class="text-uppercase text-white small">${order.paymentMethod} (${order.paymentStatus})</span>
                    </div>
                </div>
            </div>
        </div>

        <h6 class="font-heading text-white fw-bold mb-2">Order Items</h6>
        <div class="mb-4">
            ${itemsHtml}
        </div>

        ${order.notes ? `
            <div class="p-3 mb-4 rounded-3 bg-dark border border-secondary">
                <small class="text-muted fw-bold d-block">Customer Notes:</small>
                <span class="small text-white">${escapeHtml(order.notes)}</span>
            </div>
        ` : ''}

        <!-- Financial Summary -->
        <div class="glass-card p-3">
            <div class="d-flex justify-content-between text-muted small mb-1">
                <span>Subtotal:</span>
                <span>${settings.currency}${order.subtotal.toFixed(2)}</span>
            </div>
            <div class="d-flex justify-content-between text-muted small mb-1">
                <span>Tax (${settings.taxRate}%):</span>
                <span>${settings.currency}${order.tax.toFixed(2)}</span>
            </div>
            ${order.deliveryFee > 0 ? `
                <div class="d-flex justify-content-between text-muted small mb-1">
                    <span>Delivery Fee:</span>
                    <span>${settings.currency}${order.deliveryFee.toFixed(2)}</span>
                </div>
            ` : ''}
            ${order.discount > 0 ? `
                <div class="d-flex justify-content-between text-danger small mb-1">
                    <span>Discount:</span>
                    <span>-${settings.currency}${order.discount.toFixed(2)}</span>
                </div>
            ` : ''}
            <hr class="my-2 border-secondary">
            <div class="d-flex justify-content-between text-white fw-bold fs-5 font-heading">
                <span>Total Amount:</span>
                <span class="text-info">${settings.currency}${order.total.toFixed(2)}</span>
            </div>
        </div>
    `;

    const bsModal = new bootstrap.Modal(document.getElementById('order-details-modal'));
    bsModal.show();
}

function duplicateOrder(orderId) {
    const orders = getOrders();
    const source = orders.find(o => o.id === orderId);
    if (!source) return;

    const newId = `ORD-${Math.floor(5000 + Math.random() * 4000)}`;
    const newOrder = {
        ...JSON.parse(JSON.stringify(source)),
        id: newId,
        status: 'new',
        createdAt: new Date().toISOString()
    };

    orders.unshift(newOrder);
    setStorage(STORAGE_KEYS.ORDERS, orders);
    showToast(`Duplicated Order #${orderId} as #${newId}!`, 'success');

    renderOrdersPage();
}

function confirmDeleteOrder(orderId) {
    if (confirm(`Are you sure you want to delete Order #${orderId}? This action cannot be undone.`)) {
        let orders = getOrders();
        orders = orders.filter(o => o.id !== orderId);
        setStorage(STORAGE_KEYS.ORDERS, orders);
        showToast(`Order #${orderId} deleted successfully.`, 'danger');
        renderOrdersPage();
    }
}

function printReceiptModal(orderId) {
    viewOrderModal(orderId);
    setTimeout(() => {
        printReceiptFromModal();
    }, 400);
}

function printReceiptFromModal() {
    if (!currentOrderInModal) return;
    const order = currentOrderInModal;
    const settings = getSettings();

    const receiptWindow = window.open('', '_blank', 'width=450,height=600');
    receiptWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Receipt - #${order.id}</title>
            <style>
                body { font-family: monospace; padding: 20px; color: #000; width: 320px; margin: 0 auto; }
                .text-center { text-align: center; }
                .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
                .flex { display: flex; justify-content: space-between; }
                .fw-bold { font-weight: bold; }
                .mb-1 { margin-bottom: 5px; }
            </style>
        </head>
        <body>
            <div class="text-center fw-bold" style="font-size: 16px;">${settings.restaurantName}</div>
            <div class="text-center" style="font-size: 12px;">${settings.address}</div>
            <div class="text-center" style="font-size: 12px;">Tel: ${settings.phone}</div>
            <div class="divider"></div>
            <div class="flex"><span>Order ID:</span> <span>#${order.id}</span></div>
            <div class="flex"><span>Date:</span> <span>${new Date(order.createdAt).toLocaleString()}</span></div>
            <div class="flex"><span>Customer:</span> <span>${order.customerName}</span></div>
            <div class="flex"><span>Type:</span> <span style="text-transform: uppercase;">${order.type}</span></div>
            <div class="divider"></div>
            <div class="fw-bold mb-1">ITEMS</div>
            ${order.items.map(item => `
                <div class="flex">
                    <span>${item.quantity}x ${item.name}</span>
                    <span>${settings.currency}${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `).join('')}
            <div class="divider"></div>
            <div class="flex"><span>Subtotal:</span> <span>${settings.currency}${order.subtotal.toFixed(2)}</span></div>
            <div class="flex"><span>Tax (${settings.taxRate}%):</span> <span>${settings.currency}${order.tax.toFixed(2)}</span></div>
            ${order.deliveryFee > 0 ? `<div class="flex"><span>Delivery Fee:</span> <span>${settings.currency}${order.deliveryFee.toFixed(2)}</span></div>` : ''}
            ${order.discount > 0 ? `<div class="flex"><span>Discount:</span> <span>-${settings.currency}${order.discount.toFixed(2)}</span></div>` : ''}
            <div class="divider"></div>
            <div class="flex fw-bold" style="font-size: 14px;"><span>TOTAL:</span> <span>${settings.currency}${order.total.toFixed(2)}</span></div>
            <div class="divider"></div>
            <div class="text-center" style="font-size: 11px; margin-top: 15px;">${settings.receiptHeader}</div>
            <div class="text-center" style="font-size: 11px;">${settings.receiptFooter}</div>
            <script>
                window.onload = function() { window.print(); window.close(); }
            </script>
        </body>
        </html>
    `);
    receiptWindow.document.close();
}
