/**
 * Glitch Bistro - Restaurant Settings Script
 * Manages restaurant profile, order rules, receipt templates, theme/accent preferences, and Demo Data Reset.
 */

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('settings.html')) {
        loadSettingsForm();
    }
});

function loadSettingsForm() {
    const settings = getSettings();

    // Restaurant info
    if (document.getElementById('set-name')) document.getElementById('set-name').value = settings.restaurantName || '';
    if (document.getElementById('set-logo')) document.getElementById('set-logo').value = settings.logoUrl || '';
    if (document.getElementById('set-phone')) document.getElementById('set-phone').value = settings.phone || '';
    if (document.getElementById('set-email')) document.getElementById('set-email').value = settings.email || '';
    if (document.getElementById('set-address')) document.getElementById('set-address').value = settings.address || '';
    if (document.getElementById('set-currency')) document.getElementById('set-currency').value = settings.currency || '$';
    if (document.getElementById('set-tax')) document.getElementById('set-tax').value = settings.taxRate || 14;
    if (document.getElementById('set-deliv-fee')) document.getElementById('set-deliv-fee').value = settings.defaultDeliveryFee || 4.99;

    // Order rules
    if (document.getElementById('set-enable-deliv')) document.getElementById('set-enable-deliv').checked = settings.enableDelivery;
    if (document.getElementById('set-enable-takeaway')) document.getElementById('set-enable-takeaway').checked = settings.enableTakeaway;
    if (document.getElementById('set-enable-dinein')) document.getElementById('set-enable-dinein').checked = settings.enableDineIn;
    if (document.getElementById('set-auto-confirm')) document.getElementById('set-auto-confirm').checked = settings.autoConfirmOrders;
    if (document.getElementById('set-prep-time')) document.getElementById('set-prep-time').value = settings.defaultPrepTime || 25;

    // Receipt settings
    if (document.getElementById('set-receipt-header')) document.getElementById('set-receipt-header').value = settings.receiptHeader || '';
    if (document.getElementById('set-receipt-footer')) document.getElementById('set-receipt-footer').value = settings.receiptFooter || '';
    if (document.getElementById('set-receipt-tax')) document.getElementById('set-receipt-tax').checked = settings.showTaxOnReceipt;
    if (document.getElementById('set-receipt-customer')) document.getElementById('set-receipt-customer').checked = settings.showCustomerOnReceipt;

    // Appearance
    if (document.getElementById('set-theme')) document.getElementById('set-theme').value = settings.theme || 'dark';
    if (document.getElementById('set-accent')) document.getElementById('set-accent').value = settings.accentColor || 'cyan';

    applyAppearanceTheme(settings.theme || 'dark');
}

function handleSaveSettingsSubmit(e) {
    e.preventDefault();

    const newSettings = {
        restaurantName: document.getElementById('set-name').value.trim(),
        logoUrl: document.getElementById('set-logo').value.trim(),
        phone: document.getElementById('set-phone').value.trim(),
        email: document.getElementById('set-email').value.trim(),
        address: document.getElementById('set-address').value.trim(),
        currency: document.getElementById('set-currency').value.trim() || '$',
        taxRate: parseFloat(document.getElementById('set-tax').value) || 0,
        defaultDeliveryFee: parseFloat(document.getElementById('set-deliv-fee').value) || 0,

        enableDelivery: document.getElementById('set-enable-deliv').checked,
        enableTakeaway: document.getElementById('set-enable-takeaway').checked,
        enableDineIn: document.getElementById('set-enable-dinein').checked,
        autoConfirmOrders: document.getElementById('set-auto-confirm').checked,
        defaultPrepTime: parseInt(document.getElementById('set-prep-time').value) || 25,

        receiptHeader: document.getElementById('set-receipt-header').value.trim(),
        receiptFooter: document.getElementById('set-receipt-footer').value.trim(),
        showTaxOnReceipt: document.getElementById('set-receipt-tax').checked,
        showCustomerOnReceipt: document.getElementById('set-receipt-customer').checked,

        theme: document.getElementById('set-theme').value,
        accentColor: document.getElementById('set-accent').value
    };

    setStorage(STORAGE_KEYS.SETTINGS, newSettings);
    applyAppearanceTheme(newSettings.theme);

    showToast('Restaurant settings saved successfully!', 'success');
}

function applyAppearanceTheme(theme) {
    if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
}

function confirmResetDemoData() {
    if (confirm("Reset Demo Data? This will restore all original seed orders, menu items, customers, and default settings.")) {
        resetDemoData();
        showToast('Demo data reset completed!', 'success');
        setTimeout(() => {
            window.location.reload();
        }, 800);
    }
}
