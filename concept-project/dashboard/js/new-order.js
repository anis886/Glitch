/**
 * Glitch Bistro - POS Create New Order Script
 * Manages POS menu selection, cart calculation, validation rules, and order placement.
 */

let posCart = [];
let activePosCategory = 'All';

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('new-order.html')) {
        renderPosCategories();
        renderPosMenuGrid();
        renderPosCart();
        initOrderTypeToggles();
    }
});

function initOrderTypeToggles() {
    const typeSelect = document.getElementById('pos-order-type');
    if (!typeSelect) return;

    typeSelect.addEventListener('change', () => {
        const val = typeSelect.value;
        const tableGroup = document.getElementById('group-table-number');
        const addressGroup = document.getElementById('group-delivery-address');

        if (tableGroup) tableGroup.classList.toggle('d-none', val !== 'dine-in');
        if (addressGroup) addressGroup.classList.toggle('d-none', val !== 'delivery');

        calculatePosTotals();
    });
}

function renderPosCategories() {
    const container = document.getElementById('pos-category-pills');
    if (!container) return;

    const categories = ['All', 'Burgers', 'Pizza', 'Main Meals', 'Appetizers', 'Drinks', 'Desserts'];

    container.innerHTML = categories.map(cat => `
        <button class="btn btn-sm ${cat === activePosCategory ? 'btn-glitch' : 'btn-glass'} text-nowrap me-2 mb-2" onclick="setPosCategory('${cat}')">
            ${cat}
        </button>
    `).join('');
}

function setPosCategory(cat) {
    activePosCategory = cat;
    renderPosCategories();
    renderPosMenuGrid();
}

function renderPosMenuGrid() {
    const grid = document.getElementById('pos-menu-grid');
    if (!grid) return;

    const searchQ = document.getElementById('pos-search-menu')?.value.toLowerCase() || '';
    let menu = getMenu().filter(m => m.available); // Only available items

    if (activePosCategory !== 'All') {
        menu = menu.filter(m => m.category === activePosCategory);
    }

    if (searchQ) {
        menu = menu.filter(m => m.name.toLowerCase().includes(searchQ) || m.description.toLowerCase().includes(searchQ));
    }

    const settings = getSettings();

    if (menu.length === 0) {
        grid.innerHTML = `<div class="col-12 text-center text-muted py-5"><i class="bi bi-search fs-1 d-block mb-2"></i>No menu items found.</div>`;
        return;
    }

    grid.innerHTML = menu.map(item => `
        <div class="col-md-6 col-lg-4">
            <div class="glass-card glass-card-interactive product-card p-0">
                <div class="product-img-wrapper">
                    <img src="${item.image}" alt="${item.name}">
                    ${item.featured ? `<span class="product-badge-featured"><i class="bi bi-star-fill me-1"></i>Featured</span>` : ''}
                </div>
                <div class="p-3 d-flex flex-column flex-grow-1">
                    <div class="d-flex justify-content-between align-items-start mb-1">
                        <strong class="text-white font-heading">${escapeHtml(item.name)}</strong>
                        <span class="fw-bold text-info fs-5 font-heading">${settings.currency}${item.price.toFixed(2)}</span>
                    </div>
                    <p class="small text-muted mb-3 flex-grow-1" style="font-size: 0.8rem; line-height: 1.3;">${escapeHtml(item.description)}</p>
                    <div class="d-flex align-items-center justify-content-between mt-auto">
                        <small class="text-muted" style="font-size: 0.75rem;"><i class="bi bi-clock me-1"></i>${item.prepTime} mins</small>
                        <button onclick="addToPosCart('${item.id}')" class="btn btn-sm btn-glitch py-1 px-3">
                            <i class="bi bi-plus-lg me-1"></i> Add
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function addToPosCart(itemId) {
    const menu = getMenu();
    const item = menu.find(m => m.id === itemId);
    if (!item) return;

    const existing = posCart.find(c => c.id === itemId);
    if (existing) {
        existing.quantity += 1;
    } else {
        posCart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1
        });
    }

    showToast(`Added '${item.name}' to cart`, 'info');
    renderPosCart();
}

function updateCartQty(itemId, delta) {
    const item = posCart.find(c => c.id === itemId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        posCart = posCart.filter(c => c.id !== itemId);
    }
    renderPosCart();
}

function removeFromCart(itemId) {
    posCart = posCart.filter(c => c.id !== itemId);
    renderPosCart();
}

function renderPosCart() {
    const cartContainer = document.getElementById('pos-cart-items-container');
    if (!cartContainer) return;

    const settings = getSettings();

    if (posCart.length === 0) {
        cartContainer.innerHTML = `
            <div class="text-center text-muted py-5">
                <i class="bi bi-cart-x fs-1 d-block mb-2 text-dim"></i>
                Cart is empty.<br><small style="font-size: 0.8rem;">Click '+ Add' on menu items to begin.</small>
            </div>
        `;
        calculatePosTotals();
        return;
    }

    cartContainer.innerHTML = posCart.map(item => `
        <div class="d-flex align-items-center justify-content-between p-2 mb-2 rounded-3 bg-dark border border-secondary">
            <div style="flex: 1; min-width: 0;" class="me-2">
                <strong class="text-white small d-block text-truncate">${escapeHtml(item.name)}</strong>
                <small class="text-muted" style="font-size: 0.75rem;">${settings.currency}${item.price.toFixed(2)} each</small>
            </div>
            <div class="d-flex align-items-center gap-2">
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-glass px-2 py-0" onclick="updateCartQty('${item.id}', -1)">-</button>
                    <span class="btn btn-dark disabled text-white px-2 py-0 fw-bold" style="min-width: 28px;">${item.quantity}</span>
                    <button class="btn btn-glass px-2 py-0" onclick="updateCartQty('${item.id}', 1)">+</button>
                </div>
                <span class="fw-bold text-info small" style="min-width: 55px; text-align: right;">${settings.currency}${(item.price * item.quantity).toFixed(2)}</span>
                <button class="btn btn-link text-danger p-0 ms-1" onclick="removeFromCart('${item.id}')"><i class="bi bi-trash"></i></button>
            </div>
        </div>
    `).join('');

    calculatePosTotals();
}

function calculatePosTotals() {
    const orderType = document.getElementById('pos-order-type')?.value || 'dine-in';
    const discountVal = parseFloat(document.getElementById('pos-discount-input')?.value) || 0;

    const totals = calculateOrderTotals(posCart, orderType, discountVal);
    const settings = getSettings();

    if (document.getElementById('pos-subtotal-text')) document.getElementById('pos-subtotal-text').textContent = `${settings.currency}${totals.subtotal.toFixed(2)}`;
    if (document.getElementById('pos-tax-text')) document.getElementById('pos-tax-text').textContent = `${settings.currency}${totals.tax.toFixed(2)}`;
    if (document.getElementById('pos-delivery-text')) document.getElementById('pos-delivery-text').textContent = `${settings.currency}${totals.deliveryFee.toFixed(2)}`;
    if (document.getElementById('pos-discount-text')) document.getElementById('pos-discount-text').textContent = `-${settings.currency}${totals.discount.toFixed(2)}`;
    if (document.getElementById('pos-final-total-text')) document.getElementById('pos-final-total-text').textContent = `${settings.currency}${totals.total.toFixed(2)}`;
}

async function handlePlaceOrderSubmit(e) {
    e.preventDefault();

    if (posCart.length === 0) {
        showToast('Cannot place order with an empty cart!', 'danger');
        return;
    }

    const submitBtn = document.getElementById('btn-place-order') || e.target.querySelector('button[type="submit"]');

    const customerName = document.getElementById('pos-customer-name').value.trim();
    const customerPhone = document.getElementById('pos-customer-phone').value.trim();
    const orderType = document.getElementById('pos-order-type').value;
    const tableNumber = document.getElementById('pos-table-number')?.value.trim();
    const deliveryAddress = document.getElementById('pos-delivery-address')?.value.trim();
    const paymentMethod = document.getElementById('pos-payment-method').value;
    const notes = document.getElementById('pos-notes').value.trim();
    const discountVal = parseFloat(document.getElementById('pos-discount-input')?.value) || 0;

    // Field Validation
    if (orderType === 'dine-in' && !tableNumber) {
        showToast('Table number is required for Dine-in orders!', 'warning');
        return;
    }
    if (orderType === 'delivery' && !deliveryAddress) {
        showToast('Delivery address is required for Delivery orders!', 'warning');
        return;
    }

    // Disable button immediately to prevent repeated payment clicks
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Processing Order...';
    }

    const isOnlinePayment = paymentMethod === 'ONLINE_CARD' || paymentMethod === 'MOBILE_WALLET';
    const totals = calculateOrderTotals(posCart, orderType, discountVal);

    try {
        const API_BASE = 'http://localhost:5000/api';
        const token = localStorage.getItem('gb_api_token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const orderPayload = {
            customerName,
            customerPhone,
            orderType: orderType === 'dine-in' ? 'DINE_IN' : (orderType === 'delivery' ? 'DELIVERY' : 'TAKEAWAY'),
            tableNumber: orderType === 'dine-in' ? tableNumber : null,
            deliveryAddress: orderType === 'delivery' ? deliveryAddress : null,
            paymentMethod: isOnlinePayment ? paymentMethod : (paymentMethod === 'CARD_TERMINAL' ? 'CARD_TERMINAL' : 'CASH'),
            items: posCart.map(item => ({
                menuItemId: item.id,
                quantity: item.quantity,
                unitPrice: item.price,
                itemNameSnapshot: item.name,
                lineTotal: item.price * item.quantity
            })),
            notes,
            discount: totals.discount
        };

        let backendOrder = null;
        try {
            const apiRes = await fetch(`${API_BASE}/orders`, {
                method: 'POST',
                headers,
                body: JSON.stringify(orderPayload)
            });
            if (apiRes.ok) {
                const apiData = await apiRes.json();
                backendOrder = apiData.data || apiData;
            }
        } catch (e) {
            console.warn('Backend order creation offline fallback:', e);
        }

        const newOrderId = backendOrder ? backendOrder.id : `ORD-${Math.floor(5000 + Math.random() * 4000)}`;

        const newOrder = {
            id: newOrderId,
            orderNumber: backendOrder ? backendOrder.orderNumber : newOrderId.replace('ORD-', ''),
            customerName,
            customerPhone,
            type: orderType,
            tableNumber: orderType === 'dine-in' ? tableNumber : '',
            deliveryAddress: orderType === 'delivery' ? deliveryAddress : '',
            status: 'NEW',
            paymentMethod,
            paymentStatus: 'PENDING',
            items: [...posCart],
            notes,
            createdAt: new Date().toISOString(),
            ...totals
        };

        // Save to LocalStorage
        const orders = getOrders();
        orders.unshift(newOrder);
        setStorage(STORAGE_KEYS.ORDERS, orders);

        // Update customer records & menu counts
        updateCustomerFromOrder(newOrder);
        const menu = getMenu();
        posCart.forEach(cartItem => {
            const menuItem = menu.find(m => m.id === cartItem.id);
            if (menuItem) menuItem.salesCount += cartItem.quantity;
        });
        setStorage(STORAGE_KEYS.MENU, menu);

        // If Paymob Online Card or Mobile Wallet payment is selected
        if (isOnlinePayment) {
            if (submitBtn) {
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Redirecting to Paymob Checkout...';
            }

            try {
                // Flow requirement: Send ONLY orderId and paymentMethod to POST /api/payments/paymob/create
                const paymobRes = await fetch(`${API_BASE}/payments/paymob/create`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        orderId: newOrder.id,
                        paymentMethod: paymentMethod // ONLINE_CARD or MOBILE_WALLET
                    })
                });

                const paymobData = await paymobRes.json();

                if (paymobRes.ok && paymobData.success && paymobData.data?.checkoutUrl) {
                    showToast('Redirecting to Paymob Hosted Checkout...', 'info');
                    
                    // Reset Form before redirecting
                    posCart = [];
                    document.getElementById('pos-order-form').reset();
                    renderPosCart();

                    // Redirect to Paymob Hosted Checkout URL
                    window.location.href = paymobData.data.checkoutUrl;
                    return;
                } else {
                    throw new Error(paymobData.message || 'Failed to initialize Paymob payment intention');
                }

            } catch (paymobErr) {
                console.error('Paymob Checkout Initiation Failed:', paymobErr);
                showToast(`Paymob payment error: ${paymobErr.message}. Redirecting to pending view.`, 'warning');
                setTimeout(() => {
                    window.location.href = `payment-pending.html?orderId=${newOrder.id}`;
                }, 1200);
                return;
            }
        }

        // Handle Cash / Terminal payments
        showToast(`Order #${newOrder.id} placed successfully!`, 'success');

        // Reset Form
        posCart = [];
        document.getElementById('pos-order-form').reset();
        renderPosCart();

        setTimeout(() => {
            if (confirm(`Order #${newOrder.id} created! Would you like to print receipt now?`)) {
                currentOrderInModal = newOrder;
                printReceiptFromModal();
            } else {
                window.location.href = 'orders.html';
            }
        }, 400);

    } catch (err) {
        showToast(`Error placing order: ${err.message}`, 'danger');
    } finally {
        if (submitBtn && !isOnlinePayment) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bi bi-check-circle-fill fs-5 me-1"></i> Place Order & Pay';
        }
    }
}
