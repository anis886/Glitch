/**
 * Glitch Bistro - Sales and Reports Page Script
 * Manages sales analytics, 7 Chart.js visualizations, date range filtering, print reports, and JavaScript CSV exports.
 */

let activeReportDateFilter = '7days';
let reportCustomStartDate = null;
let reportCustomEndDate = null;
let reportCharts = {};

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('reports.html')) {
        renderSalesReportPage();
    }
});

function setReportDateFilter(filterType) {
    activeReportDateFilter = filterType;

    const customRow = document.getElementById('custom-date-picker-row');
    if (customRow) {
        customRow.classList.toggle('d-none', filterType !== 'custom');
    }

    if (filterType !== 'custom') {
        renderSalesReportPage();
    }
}

function applyCustomDateFilter() {
    reportCustomStartDate = document.getElementById('report-start-date')?.value;
    reportCustomEndDate = document.getElementById('report-end-date')?.value;

    if (!reportCustomStartDate || !reportCustomEndDate) {
        showToast('Please select both start and end dates!', 'warning');
        return;
    }

    renderSalesReportPage();
}

function renderSalesReportPage() {
    const reportData = getSalesReportData(activeReportDateFilter, reportCustomStartDate, reportCustomEndDate);
    renderReportKPIs(reportData);
    renderReportCharts(reportData);
    renderReportTable(reportData);
}

function renderReportKPIs(data) {
    const container = document.getElementById('reports-kpi-container');
    if (!container) return;

    const currency = data.currency;

    container.innerHTML = `
        <div class="col-md-6 col-lg-3">
            <div class="glass-card kpi-card">
                <div>
                    <span class="text-muted small fw-semibold">Total Revenue</span>
                    <div class="kpi-value text-cyan">${currency}${data.totalRevenue.toFixed(2)}</div>
                    <small class="text-muted">${data.validOrders.length} valid orders</small>
                </div>
                <div class="kpi-icon cyan"><i class="bi bi-graph-up-arrow"></i></div>
            </div>
        </div>
        <div class="col-md-6 col-lg-3">
            <div class="glass-card kpi-card">
                <div>
                    <span class="text-muted small fw-semibold">Total Orders</span>
                    <div class="kpi-value text-purple">${data.totalOrdersCount}</div>
                    <small class="text-success">${data.completedOrdersCount} completed</small> • <small class="text-danger">${data.cancelledOrdersCount} cancelled</small>
                </div>
                <div class="kpi-icon purple"><i class="bi bi-bag-check-fill"></i></div>
            </div>
        </div>
        <div class="col-md-6 col-lg-3">
            <div class="glass-card kpi-card">
                <div>
                    <span class="text-muted small fw-semibold">Average Order Value</span>
                    <div class="kpi-value text-emerald">${currency}${data.avgOrderValue.toFixed(2)}</div>
                    <small class="text-muted">Per completed order</small>
                </div>
                <div class="kpi-icon emerald"><i class="bi bi-calculator"></i></div>
            </div>
        </div>
        <div class="col-md-6 col-lg-3">
            <div class="glass-card kpi-card">
                <div>
                    <span class="text-muted small fw-semibold">Discounts & Fees</span>
                    <div class="kpi-value text-amber">${currency}${data.totalDiscounts.toFixed(2)}</div>
                    <small class="text-muted">Tax: ${currency}${data.totalTax.toFixed(2)} | Deliv: ${currency}${data.totalDeliveryFees.toFixed(2)}</small>
                </div>
                <div class="kpi-icon amber"><i class="bi bi-percent"></i></div>
            </div>
        </div>
    `;
}

function renderReportCharts(data) {
    const orders = data.filteredOrders;
    const validOrders = data.validOrders;
    const currency = data.currency;

    // Grouping by Date for Daily Revenue & Orders Per Day
    const dateMap = {};
    validOrders.forEach(o => {
        const dStr = new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!dateMap[dStr]) dateMap[dStr] = { revenue: 0, orders: 0 };
        dateMap[dStr].revenue += o.total;
        dateMap[dStr].orders += 1;
    });

    const dates = Object.keys(dateMap);
    const dailyRevenues = dates.map(d => parseFloat(dateMap[d].revenue.toFixed(2)));
    const dailyOrdersCount = dates.map(d => dateMap[d].orders);

    // 1. Daily Revenue Chart
    const ctxDailyRev = document.getElementById('chart-report-daily-revenue');
    if (ctxDailyRev) {
        if (reportCharts.dailyRev) reportCharts.dailyRev.destroy();
        reportCharts.dailyRev = new Chart(ctxDailyRev, {
            type: 'line',
            data: {
                labels: dates.length ? dates : ['No Data'],
                datasets: [{
                    label: `Revenue (${currency})`,
                    data: dailyRevenues.length ? dailyRevenues : [0],
                    borderColor: '#00f2fe',
                    backgroundColor: 'rgba(0, 242, 254, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3
                }]
            },
            options: getReportChartOptions()
        });
    }

    // 2. Orders Per Day Chart
    const ctxOrdersDay = document.getElementById('chart-report-orders-day');
    if (ctxOrdersDay) {
        if (reportCharts.ordersDay) reportCharts.ordersDay.destroy();
        reportCharts.ordersDay = new Chart(ctxOrdersDay, {
            type: 'bar',
            data: {
                labels: dates.length ? dates : ['No Data'],
                datasets: [{
                    label: 'Orders Count',
                    data: dailyOrdersCount.length ? dailyOrdersCount : [0],
                    backgroundColor: '#a855f7',
                    borderRadius: 8
                }]
            },
            options: getReportChartOptions()
        });
    }

    // 3. Revenue by Payment Method
    const ctxPayment = document.getElementById('chart-report-payment-method');
    if (ctxPayment) {
        const payMap = { cash: 0, visa: 0, wallet: 0, online: 0 };
        validOrders.forEach(o => {
            if (payMap[o.paymentMethod] !== undefined) payMap[o.paymentMethod] += o.total;
        });

        if (reportCharts.payment) reportCharts.payment.destroy();
        reportCharts.payment = new Chart(ctxPayment, {
            type: 'doughnut',
            data: {
                labels: ['Cash', 'Visa', 'Mobile Wallet', 'Online'],
                datasets: [{
                    data: [payMap.cash, payMap.visa, payMap.wallet, payMap.online],
                    backgroundColor: ['#10b981', '#00f2fe', '#a855f7', '#f59e0b'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } }
            }
        });
    }

    // 4. Revenue by Order Type
    const ctxType = document.getElementById('chart-report-order-type');
    if (ctxType) {
        const typeMap = { 'dine-in': 0, 'takeaway': 0, 'delivery': 0 };
        validOrders.forEach(o => {
            if (typeMap[o.type] !== undefined) typeMap[o.type] += o.total;
        });

        if (reportCharts.type) reportCharts.type.destroy();
        reportCharts.type = new Chart(ctxType, {
            type: 'bar',
            data: {
                labels: ['Dine-In', 'Takeaway', 'Delivery'],
                datasets: [{
                    label: `Revenue (${currency})`,
                    data: [typeMap['dine-in'], typeMap['takeaway'], typeMap['delivery']],
                    backgroundColor: ['#00f2fe', '#a855f7', '#10b981'],
                    borderRadius: 8
                }]
            },
            options: getReportChartOptions()
        });
    }

    // 5. Best-Selling Categories
    const ctxCat = document.getElementById('chart-report-categories');
    if (ctxCat) {
        const menu = getMenu();
        const catSalesMap = {};

        validOrders.forEach(o => {
            o.items.forEach(item => {
                const menuItem = menu.find(m => m.id === item.id);
                const category = menuItem ? menuItem.category : 'General';
                catSalesMap[category] = (catSalesMap[category] || 0) + item.quantity;
            });
        });

        const catLabels = Object.keys(catSalesMap);
        const catValues = catLabels.map(c => catSalesMap[c]);

        if (reportCharts.categories) reportCharts.categories.destroy();
        reportCharts.categories = new Chart(ctxCat, {
            type: 'pie',
            data: {
                labels: catLabels.length ? catLabels : ['None'],
                datasets: [{
                    data: catValues.length ? catValues : [0],
                    backgroundColor: ['#00f2fe', '#a855f7', '#10b981', '#f59e0b', '#f43f5e', '#6366f1'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } }
            }
        });
    }

    // 6. Best-Selling Menu Items
    const ctxItems = document.getElementById('chart-report-best-items');
    if (ctxItems) {
        const itemSalesMap = {};
        validOrders.forEach(o => {
            o.items.forEach(item => {
                itemSalesMap[item.name] = (itemSalesMap[item.name] || 0) + item.quantity;
            });
        });

        const sortedItems = Object.keys(itemSalesMap).sort((a, b) => itemSalesMap[b] - itemSalesMap[a]).slice(0, 5);
        const itemCounts = sortedItems.map(i => itemSalesMap[i]);

        if (reportCharts.bestItems) reportCharts.bestItems.destroy();
        reportCharts.bestItems = new Chart(ctxItems, {
            type: 'bar',
            data: {
                labels: sortedItems.length ? sortedItems : ['None'],
                datasets: [{
                    label: 'Units Sold',
                    data: itemCounts.length ? itemCounts : [0],
                    backgroundColor: '#00f2fe',
                    borderRadius: 8
                }]
            },
            options: getReportChartOptions()
        });
    }

    // 7. Peak Ordering Hours
    const ctxHours = document.getElementById('chart-report-peak-hours');
    if (ctxHours) {
        const hourMap = Array(24).fill(0);
        validOrders.forEach(o => {
            const hour = new Date(o.createdAt).getHours();
            hourMap[hour] += 1;
        });

        const hourLabels = Array.from({length: 24}, (_, i) => `${i}:00`);

        if (reportCharts.peakHours) reportCharts.peakHours.destroy();
        reportCharts.peakHours = new Chart(ctxHours, {
            type: 'line',
            data: {
                labels: hourLabels,
                datasets: [{
                    label: 'Orders Count',
                    data: hourMap,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: getReportChartOptions()
        });
    }
}

function getReportChartOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
            y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } }
        }
    };
}

function renderReportTable(data) {
    const tbody = document.getElementById('report-sales-table-tbody');
    if (!tbody) return;

    const validOrders = data.validOrders;
    const settings = getSettings();

    // Grouping table rows by Date
    const grouped = {};
    validOrders.forEach(o => {
        const dStr = new Date(o.createdAt).toISOString().split('T')[0];
        if (!grouped[dStr]) {
            grouped[dStr] = { count: 0, revenue: 0, discounts: 0, tax: 0, completedCount: 0 };
        }
        grouped[dStr].count += 1;
        grouped[dStr].revenue += o.total;
        grouped[dStr].discounts += (o.discount || 0);
        grouped[dStr].tax += (o.tax || 0);
        if (o.status === 'completed') grouped[dStr].completedCount += 1;
    });

    const dates = Object.keys(grouped).sort().reverse();

    if (dates.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No sales records in selected date range.</td></tr>`;
        return;
    }

    tbody.innerHTML = dates.map(dStr => {
        const row = grouped[dStr];
        const avgVal = row.count > 0 ? (row.revenue / row.count) : 0;
        return `
            <tr>
                <td class="fw-bold text-white">${new Date(dStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</td>
                <td class="text-info fw-bold">${row.count}</td>
                <td class="fw-bold text-white">${settings.currency}${row.revenue.toFixed(2)}</td>
                <td class="text-danger">-${settings.currency}${row.discounts.toFixed(2)}</td>
                <td class="text-muted">${settings.currency}${row.tax.toFixed(2)}</td>
                <td class="text-emerald fw-bold">${settings.currency}${avgVal.toFixed(2)}</td>
            </tr>
        `;
    }).join('');
}

// Functional JavaScript CSV Export
function exportSalesReportCSV() {
    const reportData = getSalesReportData(activeReportDateFilter, reportCustomStartDate, reportCustomEndDate);
    const validOrders = reportData.validOrders;

    if (validOrders.length === 0) {
        showToast('No sales data available to export.', 'warning');
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Order ID,Customer Name,Customer Phone,Order Type,Payment Method,Status,Subtotal,Tax,Delivery Fee,Discount,Total Amount,Created At\n";

    validOrders.forEach(o => {
        const row = [
            `"${o.id}"`,
            `"${o.customerName.replace(/"/g, '""')}"`,
            `"${(o.customerPhone || '').replace(/"/g, '""')}"`,
            `"${o.type}"`,
            `"${o.paymentMethod}"`,
            `"${o.status}"`,
            o.subtotal.toFixed(2),
            o.tax.toFixed(2),
            o.deliveryFee.toFixed(2),
            o.discount.toFixed(2),
            o.total.toFixed(2),
            `"${new Date(o.createdAt).toLocaleString()}"`
        ].join(",");
        csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Glitch_Bistro_Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Sales Report CSV generated and downloaded successfully!', 'success');
}

// Print Analytical Report
function printSalesReport() {
    window.print();
}
