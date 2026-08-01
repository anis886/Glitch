/**
 * Glitch Bistro - Dashboard Overview Page Logic
 * Renders dynamic KPIs, Chart.js visualizations, Recent Orders table, and Top 5 Best Sellers.
 */

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('login.html')) return;

    renderDashboardKPIs();
    initDashboardCharts();
    renderRecentOrders();
    renderBestSellers();
});

function renderDashboardKPIs() {
    const stats = getDashboardStats();

    const container = document.getElementById('kpi-cards-container');
    if (!container) return;

    const cards = [
        {
            title: "Today's Revenue",
            value: `${stats.currency}${stats.todayRevenue.toFixed(2)}`,
            change: stats.revenueChange,
            icon: 'bi-currency-dollar',
            color: 'cyan'
        },
        {
            title: "Today's Orders",
            value: stats.todayOrdersCount,
            change: stats.ordersChange,
            icon: 'bi-bag-check-fill',
            color: 'purple'
        },
        {
            title: "Pending Orders",
            value: stats.pendingOrdersCount,
            subtitle: 'Requires action',
            icon: 'bi-hourglass-split',
            color: 'amber'
        },
        {
            title: "Completed Orders",
            value: stats.completedOrdersCount,
            subtitle: 'All time',
            icon: 'bi-check2-circle',
            color: 'emerald'
        },
        {
            title: "Average Order Value",
            value: `${stats.currency}${stats.avgOrderValue.toFixed(2)}`,
            subtitle: 'Per completed order',
            icon: 'bi-calculator-fill',
            color: 'blue'
        },
        {
            title: "Total Menu Items",
            value: stats.totalMenuItems,
            subtitle: 'Active catalog',
            icon: 'bi-menu-app-fill',
            color: 'rose'
        }
    ];

    container.innerHTML = cards.map(c => `
        <div class="col-md-6 col-lg-4 col-xl-2">
            <div class="glass-card glass-card-interactive kpi-card h-100">
                <div>
                    <span class="text-muted small fw-semibold d-block">${c.title}</span>
                    <div class="kpi-value">${c.value}</div>
                    ${c.change !== undefined ? `
                        <div class="kpi-change ${c.change >= 0 ? 'up' : 'down'}">
                            <i class="bi ${c.change >= 0 ? 'bi-arrow-up-right' : 'bi-arrow-down-right'}"></i>
                            ${Math.abs(c.change)}% vs yesterday
                        </div>
                    ` : `
                        <small class="text-muted" style="font-size: 0.75rem;">${c.subtitle}</small>
                    `}
                </div>
                <div class="kpi-icon ${c.color}">
                    <i class="bi ${c.icon}"></i>
                </div>
            </div>
        </div>
    `).join('');
}

let charts = {};

function initDashboardCharts() {
    const orders = getOrders();
    const menu = getMenu();
    const settings = getSettings();
    const currency = settings.currency || '$';

    // Chart 1: Sales last 7 days
    const ctxSales = document.getElementById('chart-sales-7days');
    if (ctxSales) {
        const days = [];
        const salesData = [];
        const now = new Date();

        for (let i = 6; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
            const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
            days.push(dateStr);

            const dayStart = d.getTime();
            const dayEnd = dayStart + (24 * 60 * 60 * 1000);

            const dayRevenue = orders
                .filter(o => o.status !== 'cancelled')
                .filter(o => {
                    const t = new Date(o.createdAt).getTime();
                    return t >= dayStart && t < dayEnd;
                })
                .reduce((sum, o) => sum + o.total, 0);

            salesData.push(parseFloat(dayRevenue.toFixed(2)));
        }

        if (charts.sales) charts.sales.destroy();
        charts.sales = new Chart(ctxSales, {
            type: 'line',
            data: {
                labels: days,
                datasets: [{
                    label: `Revenue (${currency})`,
                    data: salesData,
                    borderColor: '#00f2fe',
                    backgroundColor: 'rgba(0, 242, 254, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointBackgroundColor: '#00f2fe',
                    pointRadius: 4
                }]
            },
            options: getChartOptions('Sales Trend ($)')
        });
    }

    // Chart 2: Orders by Status
    const ctxStatus = document.getElementById('chart-orders-status');
    if (ctxStatus) {
        const statusCounts = { new: 0, confirmed: 0, preparing: 0, ready: 0, completed: 0, cancelled: 0 };
        orders.forEach(o => {
            if (statusCounts[o.status] !== undefined) statusCounts[o.status]++;
        });

        if (charts.status) charts.status.destroy();
        charts.status = new Chart(ctxStatus, {
            type: 'doughnut',
            data: {
                labels: ['New', 'Confirmed', 'Preparing', 'Ready', 'Completed', 'Cancelled'],
                datasets: [{
                    data: Object.values(statusCounts),
                    backgroundColor: ['#00f2fe', '#818cf8', '#f59e0b', '#a855f7', '#10b981', '#f43f5e'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans' } } }
                }
            }
        });
    }

    // Chart 3: Revenue by Order Type
    const ctxType = document.getElementById('chart-revenue-type');
    if (ctxType) {
        const typeRevenue = { 'dine-in': 0, 'takeaway': 0, 'delivery': 0 };
        orders.filter(o => o.status !== 'cancelled').forEach(o => {
            if (typeRevenue[o.type] !== undefined) typeRevenue[o.type] += o.total;
        });

        if (charts.type) charts.type.destroy();
        charts.type = new Chart(ctxType, {
            type: 'bar',
            data: {
                labels: ['Dine-In', 'Takeaway', 'Delivery'],
                datasets: [{
                    label: `Revenue (${currency})`,
                    data: [
                        parseFloat(typeRevenue['dine-in'].toFixed(2)),
                        parseFloat(typeRevenue['takeaway'].toFixed(2)),
                        parseFloat(typeRevenue['delivery'].toFixed(2))
                    ],
                    backgroundColor: ['#00f2fe', '#a855f7', '#10b981'],
                    borderRadius: 8
                }]
            },
            options: getChartOptions('Revenue by Type')
        });
    }

    // Chart 4: Best-Selling Menu Items
    const ctxBest = document.getElementById('chart-bestsellers');
    if (ctxBest) {
        const sortedMenu = [...menu].sort((a, b) => b.salesCount - a.salesCount).slice(0, 5);

        if (charts.best) charts.best.destroy();
        charts.best = new Chart(ctxBest, {
            type: 'bar',
            data: {
                labels: sortedMenu.map(m => m.name),
                datasets: [{
                    label: 'Units Sold',
                    data: sortedMenu.map(m => m.salesCount),
                    backgroundColor: '#a855f7',
                    borderRadius: 8
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                    y: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                }
            }
        });
    }
}

function getChartOptions(titleText) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
            y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } }
        }
    };
}

function renderRecentOrders() {
    const tableBody = document.getElementById('recent-orders-tbody');
    if (!tableBody) return;

    const orders = getOrders().slice(0, 7); // Latest 7 orders

    if (orders.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">No recent orders.</td></tr>`;
        return;
    }

    const settings = getSettings();

    tableBody.innerHTML = orders.map(o => `
        <tr>
            <td class="fw-bold text-info">${o.id}</td>
            <td class="text-white">${escapeHtml(o.customerName)}</td>
            <td class="text-capitalize text-muted"><i class="bi ${o.type === 'delivery' ? 'bi-truck' : o.type === 'dine-in' ? 'bi-shop' : 'bi-bag'} me-1"></i>${o.type}</td>
            <td class="fw-bold text-white">${settings.currency}${o.total.toFixed(2)}</td>
            <td class="text-uppercase small text-muted">${o.paymentMethod}</td>
            <td><span class="status-badge status-${o.status}">${o.status}</span></td>
            <td class="text-muted small">${new Date(o.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
            <td>
                <button onclick="viewOrderModal('${o.id}')" class="btn btn-sm btn-glass">
                    <i class="bi bi-eye"></i> Details
                </button>
            </td>
        </tr>
    `).join('');
}

function renderBestSellers() {
    const container = document.getElementById('bestsellers-list-container');
    if (!container) return;

    const menu = getMenu();
    const sorted = [...menu].sort((a, b) => b.salesCount - a.salesCount).slice(0, 5);

    container.innerHTML = sorted.map((item, idx) => `
        <div class="d-flex align-items-center justify-content-between p-3 rounded-3 mb-2 bg-dark border border-secondary">
            <div class="d-flex align-items-center gap-3">
                <span class="badge bg-purple rounded-circle text-white" style="width:28px; height:28px; line-height:20px;">#${idx + 1}</span>
                <img src="${item.image}" alt="${item.name}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 10px;">
                <div>
                    <strong class="text-white d-block">${escapeHtml(item.name)}</strong>
                    <small class="text-muted">${item.category} • $${item.price.toFixed(2)}</small>
                </div>
            </div>
            <div class="text-end">
                <span class="fw-bold text-info font-heading fs-5">${item.salesCount}</span>
                <small class="text-muted d-block" style="font-size: 0.7rem;">Orders</small>
            </div>
        </div>
    `).join('');
}
