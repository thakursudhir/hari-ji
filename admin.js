// ============================================================
//  admin.js — हरी जी Admin Panel (JSONBin Powered)
// ============================================================

let adminProducts = [];
let editingId     = null;
let imgData       = null;
let shopOpen      = true;

// ── LOGIN ──
function doLogin() {
    const pass = document.getElementById('admin-pass').value;
    if (pass === SHOP_CONFIG.adminPass) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('admin-panel').style.display  = 'flex';
        initAdmin();
    } else {
        showAdminToast('❌ गलत पासवर्ड!', 'error');
        document.getElementById('admin-pass').value = '';
    }
}

function logout() {
    document.getElementById('admin-panel').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('admin-pass').value = '';
}

// ── INIT ──
async function initAdmin() {
    setSyncStatus('loading');
    showAdminToast('☁️ Cloud से data load हो रहा है...');

    const cloud = await loadCloudData();

    if (cloud && cloud.products && cloud.products.length > 0) {
        adminProducts = cloud.products;
    } else {
        // First time: save defaults to cloud
        adminProducts = [...DEFAULT_PRODUCTS];
        await pushToCloud();
    }

    setSyncStatus('ok');
    updateStats();
    renderAdminProducts();
    renderAdminReviews();
    loadSettings();
    showAdminToast('✅ Data load हो गया!');
}

// ── SYNC STATUS ──
function setSyncStatus(status) {
    const el = document.getElementById('sync-badge');
    if (!el) return;
    if (status === 'ok')      { el.textContent = '🟢 Synced';    el.style.background = 'rgba(39,174,96,.2)';  el.style.color = '#27AE60'; }
    if (status === 'error')   { el.textContent = '🔴 Error';     el.style.background = 'rgba(229,57,53,.2)';  el.style.color = '#e53935'; }
    if (status === 'loading') { el.textContent = '🔄 Syncing...';el.style.background = 'rgba(255,214,0,.1)';  el.style.color = '#FFD600'; }
}

// ── PUSH TO CLOUD ──
async function pushToCloud() {
    setSyncStatus('loading');
    const reviews = JSON.parse(localStorage.getItem('hari_reviews') || '[]');
    const ok = await saveCloudData({ products: adminProducts, reviews });
    if (ok) {
        setSyncStatus('ok');
        showAdminToast('✅ Cloud पर save हो गया — सबको दिखेगा!');
    } else {
        setSyncStatus('error');
        showAdminToast('❌ Save नहीं हुआ — Internet check करें', 'error');
    }
    return ok;
}

// ── TABS ──
function showTab(name) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('tab-' + name).classList.add('active');
    const titles = { dashboard:'📊 Dashboard', products:'📦 Products', orders:'🛒 Orders', reviews:'⭐ Reviews', settings:'⚙️ Settings' };
    document.getElementById('topbar-title').textContent = titles[name] || name;
    document.querySelectorAll('.nav-item').forEach(n => {
        if (n.getAttribute('onclick') && n.getAttribute('onclick').includes(name)) n.classList.add('active');
    });
}

// ── SHOP STATUS ──
function toggleShopStatus() {
    shopOpen = !shopOpen;
    const badge = document.getElementById('shop-status-badge');
    badge.textContent = shopOpen ? '🟢 दुकान खुली है' : '🔴 दुकान बंद है';
    badge.style.background = shopOpen ? '#E8F5E9' : '#FFEBEE';
    badge.style.color      = shopOpen ? '#1B8A3C' : '#c62828';
    showAdminToast(shopOpen ? '🟢 दुकान खुल गई!' : '🔴 दुकान बंद हो गई!');
}

// ── STATS ──
function updateStats() {
    document.getElementById('stat-products').textContent = adminProducts.length;
    document.getElementById('stat-reviews').textContent  = JSON.parse(localStorage.getItem('hari_reviews') || '[]').length;
}

// ── PRODUCTS ──
function openAddProduct() {
    editingId = null; imgData = null;
    document.getElementById('form-title').textContent = '➕ नया Product जोड़ें';
    ['f-name','f-price','f-unit','f-emoji','f-badge'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('f-category').value = '';
    document.getElementById('f-available').checked = true;
    document.getElementById('image-preview').style.display = 'none';
    document.getElementById('upload-placeholder').style.display = 'block';
    document.getElementById('f-image').value = '';
    document.getElementById('product-form').style.display = 'block';
    document.getElementById('product-form').scrollIntoView({ behavior: 'smooth' });
}

function closeProductForm() {
    document.getElementById('product-form').style.display = 'none';
    editingId = null; imgData = null;
}

function previewImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) {
        showAdminToast('⚠️ Photo 1.5MB से छोटी होनी चाहिए!', 'error'); return;
    }
    const reader = new FileReader();
    reader.onload = e => {
        imgData = e.target.result;
        document.getElementById('image-preview').src = e.target.result;
        document.getElementById('image-preview').style.display = 'block';
        document.getElementById('upload-placeholder').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

async function saveProduct() {
    const name     = document.getElementById('f-name').value.trim();
    const price    = parseFloat(document.getElementById('f-price').value);
    const category = document.getElementById('f-category').value;
    const unit     = document.getElementById('f-unit').value.trim();
    const emoji    = document.getElementById('f-emoji').value.trim() || '🛍️';
    const badge    = document.getElementById('f-badge').value.trim();
    const avail    = document.getElementById('f-available').checked;

    if (!name || !price || !category) {
        showAdminToast('⚠️ नाम, कीमत और Category ज़रूरी है!', 'error'); return;
    }

    if (editingId !== null) {
        const idx = adminProducts.findIndex(p => p.id === editingId);
        if (idx > -1) {
            adminProducts[idx] = {
                ...adminProducts[idx], name, price, category, unit, emoji, badge, available: avail,
                img: imgData || adminProducts[idx].img || ''
            };
        }
    } else {
        const newId = Math.max(0, ...adminProducts.map(p => p.id)) + 1;
        adminProducts.push({ id: newId, name, price, category, unit, emoji, badge, available: avail, img: imgData || '' });
    }

    closeProductForm();
    const ok = await pushToCloud();
    if (ok) {
        renderAdminProducts();
        updateStats();
    }
}

function editProduct(id) {
    const p = adminProducts.find(p => p.id === id);
    if (!p) return;
    editingId = id; imgData = p.img || null;

    document.getElementById('form-title').textContent = '✏️ Product Edit करें';
    document.getElementById('f-name').value     = p.name;
    document.getElementById('f-price').value    = p.price;
    document.getElementById('f-category').value = p.category;
    document.getElementById('f-unit').value     = p.unit;
    document.getElementById('f-emoji').value    = p.emoji || '';
    document.getElementById('f-badge').value    = p.badge || '';
    document.getElementById('f-available').checked = p.available !== false;

    if (p.img) {
        document.getElementById('image-preview').src = p.img;
        document.getElementById('image-preview').style.display = 'block';
        document.getElementById('upload-placeholder').style.display = 'none';
    } else {
        document.getElementById('image-preview').style.display = 'none';
        document.getElementById('upload-placeholder').style.display = 'block';
    }

    document.getElementById('product-form').style.display = 'block';
    document.getElementById('product-form').scrollIntoView({ behavior: 'smooth' });
}

async function deleteProduct(id) {
    if (!confirm('क्या आप यह product हटाना चाहते हैं?')) return;
    adminProducts = adminProducts.filter(p => p.id !== id);
    const ok = await pushToCloud();
    if (ok) { renderAdminProducts(); updateStats(); }
}

async function toggleProductAvailability(id) {
    const p = adminProducts.find(p => p.id === id);
    if (!p) return;
    p.available = !p.available;
    const ok = await pushToCloud();
    if (ok) renderAdminProducts();
}

function renderAdminProducts() {
    const grid = document.getElementById('products-admin-list');
    if (adminProducts.length === 0) {
        grid.innerHTML = `<div style="text-align:center;padding:40px;color:#888">अभी कोई product नहीं है।<br>ऊपर "नया Product जोड़ें" पर click करें।</div>`;
        return;
    }
    grid.innerHTML = adminProducts.map(p => {
        const imgContent = p.img
            ? `<img src="${p.img}" style="width:52px;height:52px;object-fit:cover;border-radius:8px">`
            : `<span style="font-size:32px">${p.emoji || '🛍️'}</span>`;
        return `
        <div class="admin-product-card ${p.available === false ? 'unavailable-card' : ''}">
            <div class="ap-img">${imgContent}</div>
            <div class="ap-info">
                <div class="ap-name">${p.name}</div>
                <div class="ap-meta">₹${p.price} | ${p.unit} | ${p.category}</div>
                ${p.badge ? `<span class="ap-badge">${p.badge}</span>` : ''}
            </div>
            <div class="ap-actions">
                <button class="ap-avail-btn ${p.available !== false ? 'avail-yes' : 'avail-no'}" onclick="toggleProductAvailability(${p.id})">
                    ${p.available !== false ? '✅ उपलब्ध' : '❌ नहीं'}
                </button>
                <button class="ap-edit-btn" onclick="editProduct(${p.id})">✏️</button>
                <button class="ap-del-btn"  onclick="deleteProduct(${p.id})">🗑️</button>
            </div>
        </div>`;
    }).join('');
}

// ── REVIEWS ──
function renderAdminReviews() {
    const reviews = JSON.parse(localStorage.getItem('hari_reviews') || '[]');
    const el = document.getElementById('admin-reviews-list');
    if (reviews.length === 0) {
        el.innerHTML = `<div style="text-align:center;padding:40px;color:#888">अभी कोई review नहीं है।</div>`;
        return;
    }
    el.innerHTML = reviews.slice().reverse().map((r, i) => `
        <div class="admin-review-card">
            <div style="display:flex;justify-content:space-between;align-items:center">
                <strong>${r.name}</strong>
                <div>
                    <span style="color:#FFD600;font-size:16px">${'★'.repeat(r.rating)}</span>
                    <button class="ap-del-btn" style="margin-left:8px" onclick="deleteReview(${reviews.length - 1 - i})">🗑️</button>
                </div>
            </div>
            <p style="margin:7px 0;color:#555;font-size:14px">${r.text}</p>
            <div style="font-size:11px;color:#aaa">${r.date}</div>
        </div>`).join('');
}

function deleteReview(idx) {
    const reviews = JSON.parse(localStorage.getItem('hari_reviews') || '[]');
    reviews.splice(idx, 1);
    localStorage.setItem('hari_reviews', JSON.stringify(reviews));
    renderAdminReviews(); updateStats();
    showAdminToast('🗑️ Review हटा दिया!');
}

function clearReviews() {
    if (!confirm('सभी reviews हटाना चाहते हैं?')) return;
    localStorage.removeItem('hari_reviews');
    renderAdminReviews(); updateStats();
    showAdminToast('🗑️ सभी reviews हटा दिए!');
}

// ── SETTINGS ──
function loadSettings() {
    const sid = document.getElementById('sheet-id-setting');
    if (sid) sid.value = '';
    const ot = document.getElementById('offer-text');
    if (ot) ot.value = localStorage.getItem('hari_offer_text') || SHOP_CONFIG.offerText;
    const wa = document.getElementById('wa-number');
    if (wa) wa.value = SHOP_CONFIG.phone;
}

function changePassword() {
    const np = document.getElementById('new-pass').value;
    const cp = document.getElementById('confirm-pass').value;
    if (!np || np.length < 4) { showAdminToast('⚠️ कम से कम 4 characters का password!', 'error'); return; }
    if (np !== cp) { showAdminToast('⚠️ Password match नहीं हुआ!', 'error'); return; }
    localStorage.setItem('hari_admin_pass', np);
    SHOP_CONFIG.adminPass = np;
    document.getElementById('new-pass').value = '';
    document.getElementById('confirm-pass').value = '';
    showAdminToast('✅ Password बदल गया!');
}

function saveWaNumber() {
    const num = document.getElementById('wa-number').value.trim();
    if (!num) { showAdminToast('⚠️ Number खाली है!', 'error'); return; }
    localStorage.setItem('hari_wa_number', num);
    showAdminToast('✅ WhatsApp number save!');
}

function saveOfferText() {
    const text = document.getElementById('offer-text').value.trim();
    if (!text) { showAdminToast('⚠️ Message खाली है!', 'error'); return; }
    localStorage.setItem('hari_offer_text', text);
    SHOP_CONFIG.offerText = text;
    showAdminToast('✅ Offer text save हो गया!');
}

// ── TOAST ──
function showAdminToast(msg, type = 'success') {
    const t = document.getElementById('admin-toast');
    if (!t) return;
    t.textContent = msg;
    t.style.background = type === 'error' ? '#c62828' : '#1B8A3C';
    t.style.display = 'block'; t.style.opacity = '1';
    clearTimeout(t._t);
    t._t = setTimeout(() => { t.style.opacity = '0'; setTimeout(() => { t.style.display = 'none'; }, 300); }, 2800);
}

// ── DRAG & DROP IMAGE ──
document.addEventListener('DOMContentLoaded', () => {
    const area = document.getElementById('image-upload-area');
    if (!area) return;
    area.addEventListener('dragover', e => { e.preventDefault(); area.style.borderColor = '#1B8A3C'; });
    area.addEventListener('dragleave', () => { area.style.borderColor = '#ddd'; });
    area.addEventListener('drop', e => {
        e.preventDefault(); area.style.borderColor = '#ddd';
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            if (file.size > 1.5 * 1024 * 1024) { showAdminToast('⚠️ Photo 1.5MB से छोटी होनी चाहिए!', 'error'); return; }
            const reader = new FileReader();
            reader.onload = ev => {
                imgData = ev.target.result;
                document.getElementById('image-preview').src = ev.target.result;
                document.getElementById('image-preview').style.display = 'block';
                document.getElementById('upload-placeholder').style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    });
});
