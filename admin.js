// ============================================================
//  admin.js — Admin Panel Logic
// ============================================================

let editingProductId = null;
let adminProducts    = [];
let shopOpen         = true;

// ===== LOGIN =====
function doLogin() {
    const pass = document.getElementById("admin-pass").value;
    if (pass === SHOP_CONFIG.adminPass) {
        document.getElementById("login-screen").style.display = "none";
        document.getElementById("admin-panel").style.display  = "flex";
        initAdmin();
    } else {
        showAdminToast("❌ गलत पासवर्ड!", "error");
        document.getElementById("admin-pass").value = "";
        document.getElementById("admin-pass").focus();
    }
}

function logout() {
    document.getElementById("admin-panel").style.display = "none";
    document.getElementById("login-screen").style.display = "flex";
    document.getElementById("admin-pass").value = "";
}

// ===== INIT ADMIN =====
function initAdmin() {
    adminProducts = JSON.parse(localStorage.getItem('hari_products') || '[]');
    if (adminProducts.length === 0) adminProducts = [...DEFAULT_PRODUCTS];

    updateStats();
    renderAdminProducts();
    renderAdminReviews();
    loadSettings();

    // Pre-fill sheet ID if already saved
    const sid = localStorage.getItem('hari_sheet_id') || "";
    document.getElementById("sheet-id-input").value = sid;
    document.getElementById("sheet-id-setting").value = sid;
    document.getElementById("offer-text").value = localStorage.getItem('hari_offer_text') || SHOP_CONFIG.offerText;
    document.getElementById("wa-number").value = SHOP_CONFIG.phone;
}

function updateStats() {
    document.getElementById("stat-products").textContent = adminProducts.length;
    document.getElementById("stat-reviews").textContent  = JSON.parse(localStorage.getItem('hari_reviews') || '[]').length;
}

// ===== TABS =====
function showTab(name) {
    document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
    document.getElementById("tab-" + name).classList.add("active");
    document.querySelectorAll(".nav-item").forEach(n => {
        if (n.textContent.toLowerCase().includes(name.slice(0,3))) n.classList.add("active");
    });
    const titles = {
        dashboard: "📊 Dashboard",
        products:  "📦 Products",
        orders:    "🛒 Orders",
        reviews:   "⭐ Reviews",
        settings:  "⚙️ Settings"
    };
    document.getElementById("topbar-title").textContent = titles[name] || name;
}

// ===== SHOP STATUS =====
function toggleShopStatus() {
    shopOpen = !shopOpen;
    const badge = document.getElementById("shop-status-badge");
    badge.textContent = shopOpen ? "🟢 दुकान खुली है" : "🔴 दुकान बंद है";
    badge.style.background = shopOpen ? "#E8F5E9" : "#FFEBEE";
    badge.style.color       = shopOpen ? "#1B8A3C" : "#c62828";
    localStorage.setItem('hari_shop_open', shopOpen);
    showAdminToast(shopOpen ? "🟢 दुकान खुल गई!" : "🔴 दुकान बंद हो गई!");
}

// ===== GOOGLE SHEETS =====
function saveSheetId() {
    const id = document.getElementById("sheet-id-input").value.trim();
    if (!id) { showAdminToast("⚠️ Sheet ID खाली है!", "error"); return; }
    localStorage.setItem('hari_sheet_id', id);
    document.getElementById("sheet-id-setting").value = id;
    showAdminToast("✅ Sheet ID save हो गया!");
}

function saveSheetIdFromSettings() {
    const id = document.getElementById("sheet-id-setting").value.trim();
    if (!id) { showAdminToast("⚠️ Sheet ID खाली है!", "error"); return; }
    localStorage.setItem('hari_sheet_id', id);
    document.getElementById("sheet-id-input").value = id;
    showAdminToast("✅ Sheet ID save हो गया! Page reload करें।");
}

async function testSheetConnection() {
    const id = localStorage.getItem('hari_sheet_id');
    const result = document.getElementById("test-result");
    if (!id) { result.textContent = "❌ Sheet ID नहीं है"; result.style.color = "red"; return; }

    result.textContent = "⏳ जांच हो रही है..."; result.style.color = "#888";
    try {
        const url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=Sheet1`;
        const res  = await fetch(url);
        if (res.ok) {
            result.textContent = "✅ Connection सफल!"; result.style.color = "green";
        } else throw new Error();
    } catch {
        result.textContent = "❌ Connection failed — Sheet ID या Permission चेक करें";
        result.style.color = "red";
    }
}

// ===== PRODUCTS ADMIN =====
function openAddProduct() {
    editingProductId = null;
    document.getElementById("form-title").textContent = "➕ नया Product जोड़ें";
    clearProductForm();
    document.getElementById("product-form").style.display = "block";
    document.getElementById("product-form").scrollIntoView({ behavior: "smooth" });
}

function clearProductForm() {
    ["f-name","f-price","f-unit","f-emoji","f-badge"].forEach(id => document.getElementById(id).value = "");
    document.getElementById("f-category").value = "";
    document.getElementById("f-available").checked = true;
    document.getElementById("image-preview").style.display = "none";
    document.getElementById("upload-placeholder").style.display = "block";
    document.getElementById("f-image").value = "";
    // Reset stored image
    window._currentImageData = null;
}

function closeProductForm() {
    document.getElementById("product-form").style.display = "none";
    editingProductId = null;
    clearProductForm();
}

function previewImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
        showAdminToast("⚠️ फोटो 2MB से छोटी होनी चाहिए!", "error"); return;
    }
    const reader = new FileReader();
    reader.onload = e => {
        window._currentImageData = e.target.result;
        document.getElementById("image-preview").src = e.target.result;
        document.getElementById("image-preview").style.display = "block";
        document.getElementById("upload-placeholder").style.display = "none";
    };
    reader.readAsDataURL(file);
}

function saveProduct() {
    const name     = document.getElementById("f-name").value.trim();
    const price    = parseFloat(document.getElementById("f-price").value);
    const category = document.getElementById("f-category").value;
    const unit     = document.getElementById("f-unit").value.trim();
    const emoji    = document.getElementById("f-emoji").value.trim() || "🛍️";
    const badge    = document.getElementById("f-badge").value.trim();
    const avail    = document.getElementById("f-available").checked;

    if (!name || !price || !category) {
        showAdminToast("⚠️ नाम, कीमत और Category जरूरी है!", "error"); return;
    }

    if (editingProductId !== null) {
        // Edit existing
        const idx = adminProducts.findIndex(p => p.id === editingProductId);
        if (idx > -1) {
            adminProducts[idx] = {
                ...adminProducts[idx], name, price, category, unit, emoji, badge,
                available: avail,
                img: window._currentImageData || adminProducts[idx].img || ""
            };
        }
        showAdminToast("✅ Product update हो गया!");
    } else {
        // New product
        const newId = Math.max(0, ...adminProducts.map(p => p.id)) + 1;
        adminProducts.push({
            id: newId, name, price, category, unit, emoji, badge,
            available: avail,
            img: window._currentImageData || ""
        });
        showAdminToast("✅ नया Product जोड़ा गया!");
    }

    localStorage.setItem('hari_products', JSON.stringify(adminProducts));
    closeProductForm();
    renderAdminProducts();
    updateStats();
}

function editProduct(id) {
    const p = adminProducts.find(p => p.id === id);
    if (!p) return;
    editingProductId = id;

    document.getElementById("form-title").textContent = "✏️ Product Edit करें";
    document.getElementById("f-name").value     = p.name;
    document.getElementById("f-price").value    = p.price;
    document.getElementById("f-category").value = p.category;
    document.getElementById("f-unit").value     = p.unit;
    document.getElementById("f-emoji").value    = p.emoji;
    document.getElementById("f-badge").value    = p.badge || "";
    document.getElementById("f-available").checked = p.available !== false;

    if (p.img) {
        document.getElementById("image-preview").src = p.img;
        document.getElementById("image-preview").style.display = "block";
        document.getElementById("upload-placeholder").style.display = "none";
        window._currentImageData = p.img;
    } else {
        document.getElementById("image-preview").style.display = "none";
        document.getElementById("upload-placeholder").style.display = "block";
        window._currentImageData = null;
    }

    document.getElementById("product-form").style.display = "block";
    document.getElementById("product-form").scrollIntoView({ behavior: "smooth" });
}

function deleteProduct(id) {
    if (!confirm("क्या आप यह product हटाना चाहते हैं?")) return;
    adminProducts = adminProducts.filter(p => p.id !== id);
    localStorage.setItem('hari_products', JSON.stringify(adminProducts));
    renderAdminProducts();
    updateStats();
    showAdminToast("🗑️ Product हटा दिया गया!");
}

function toggleProductAvailability(id) {
    const p = adminProducts.find(p => p.id === id);
    if (!p) return;
    p.available = !p.available;
    localStorage.setItem('hari_products', JSON.stringify(adminProducts));
    renderAdminProducts();
    showAdminToast(p.available ? "✅ Product available हुआ!" : "❌ Product unavailable हुआ!");
}

function renderAdminProducts() {
    const grid = document.getElementById("products-admin-list");
    if (adminProducts.length === 0) {
        grid.innerHTML = `<div style="text-align:center;padding:40px;color:#888">अभी कोई product नहीं है। ऊपर "नया Product जोड़ें" पर click करें।</div>`;
        return;
    }

    grid.innerHTML = adminProducts.map(p => {
        const imgContent = p.img
            ? `<img src="${p.img}" style="width:52px;height:52px;object-fit:cover;border-radius:8px">`
            : `<span style="font-size:36px">${p.emoji || "🛍️"}</span>`;
        const availClass = p.available !== false ? "avail-yes" : "avail-no";
        const availText  = p.available !== false ? "✅ उपलब्ध" : "❌ नहीं";

        return `
        <div class="admin-product-card ${p.available === false ? 'unavailable-card' : ''}">
            <div class="ap-img">${imgContent}</div>
            <div class="ap-info">
                <div class="ap-name">${p.name}</div>
                <div class="ap-meta">₹${p.price} | ${p.unit} | ${p.category}</div>
                ${p.badge ? `<span class="ap-badge">${p.badge}</span>` : ""}
            </div>
            <div class="ap-actions">
                <button class="ap-avail-btn ${availClass}" onclick="toggleProductAvailability(${p.id})">${availText}</button>
                <button class="ap-edit-btn" onclick="editProduct(${p.id})">✏️</button>
                <button class="ap-del-btn" onclick="deleteProduct(${p.id})">🗑️</button>
            </div>
        </div>`;
    }).join("");
}

// ===== REVIEWS ADMIN =====
function renderAdminReviews() {
    const reviews = JSON.parse(localStorage.getItem('hari_reviews') || '[]');
    const el = document.getElementById("admin-reviews-list");
    if (reviews.length === 0) {
        el.innerHTML = `<div style="text-align:center;padding:40px;color:#888">अभी कोई review नहीं है।</div>`;
        return;
    }
    el.innerHTML = reviews.slice().reverse().map((r, i) => `
        <div class="admin-review-card">
            <div style="display:flex;justify-content:space-between;align-items:center">
                <strong>${r.name}</strong>
                <div>
                    <span style="color:#FFD600;font-size:16px">${"★".repeat(r.rating)}</span>
                    <button class="ap-del-btn" style="margin-left:10px" onclick="deleteReview(${reviews.length - 1 - i})">🗑️</button>
                </div>
            </div>
            <p style="margin:8px 0;color:#555;font-size:14px">${r.text}</p>
            <div style="font-size:11px;color:#aaa">${r.date}</div>
        </div>
    `).join("");
}

function deleteReview(idx) {
    const reviews = JSON.parse(localStorage.getItem('hari_reviews') || '[]');
    reviews.splice(idx, 1);
    localStorage.setItem('hari_reviews', JSON.stringify(reviews));
    renderAdminReviews();
    updateStats();
    showAdminToast("🗑️ Review हटा दिया!");
}

// ===== SETTINGS =====
function loadSettings() {
    document.getElementById("wa-number").value   = SHOP_CONFIG.phone;
    document.getElementById("offer-text").value  = localStorage.getItem('hari_offer_text') || SHOP_CONFIG.offerText;
    document.getElementById("open-time").value   = localStorage.getItem('hari_open_time')  || "07:00";
    document.getElementById("close-time").value  = localStorage.getItem('hari_close_time') || "21:00";
}

function changePassword() {
    const np = document.getElementById("new-pass").value;
    const cp = document.getElementById("confirm-pass").value;
    if (!np || np.length < 4) { showAdminToast("⚠️ Password कम से कम 4 characters का हो!", "error"); return; }
    if (np !== cp) { showAdminToast("⚠️ Password match नहीं हुआ!", "error"); return; }
    localStorage.setItem('hari_admin_pass', np);
    SHOP_CONFIG.adminPass = np;
    document.getElementById("new-pass").value = "";
    document.getElementById("confirm-pass").value = "";
    showAdminToast("✅ Password बदल गया!");
}

function saveWaNumber() {
    const num = document.getElementById("wa-number").value.trim();
    if (!num) { showAdminToast("⚠️ Number खाली है!", "error"); return; }
    localStorage.setItem('hari_wa_number', num);
    SHOP_CONFIG.phone = num;
    showAdminToast("✅ WhatsApp number save हो गया!");
}

function saveTiming() {
    const open  = document.getElementById("open-time").value;
    const close = document.getElementById("close-time").value;
    localStorage.setItem('hari_open_time',  open);
    localStorage.setItem('hari_close_time', close);
    showAdminToast("✅ Timing save हो गई!");
}

function saveOfferText() {
    const text = document.getElementById("offer-text").value.trim();
    if (!text) { showAdminToast("⚠️ Message खाली है!", "error"); return; }
    localStorage.setItem('hari_offer_text', text);
    SHOP_CONFIG.offerText = text;
    showAdminToast("✅ Offer text save हो गया!");
}

function clearReviews() {
    if (!confirm("सभी reviews हटाना चाहते हैं?")) return;
    localStorage.removeItem('hari_reviews');
    renderAdminReviews();
    updateStats();
    showAdminToast("🗑️ सभी reviews हटा दिए गए!");
}

// ===== TOAST =====
function showAdminToast(msg, type = "success") {
    const t = document.getElementById("admin-toast");
    t.textContent = msg;
    t.style.background = type === "error" ? "#c62828" : "#1B8A3C";
    t.style.display = "block";
    t.style.opacity = "1";
    clearTimeout(t._t);
    t._t = setTimeout(() => { t.style.opacity = "0"; setTimeout(() => { t.style.display = "none"; }, 300); }, 2500);
}

// ===== DRAG & DROP IMAGE =====
const uploadArea = document.getElementById("image-upload-area");
if (uploadArea) {
    uploadArea.addEventListener("dragover", e => { e.preventDefault(); uploadArea.style.borderColor = "#1B8A3C"; });
    uploadArea.addEventListener("dragleave", () => { uploadArea.style.borderColor = "#ddd"; });
    uploadArea.addEventListener("drop", e => {
        e.preventDefault();
        uploadArea.style.borderColor = "#ddd";
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = ev => {
                window._currentImageData = ev.target.result;
                document.getElementById("image-preview").src = ev.target.result;
                document.getElementById("image-preview").style.display = "block";
                document.getElementById("upload-placeholder").style.display = "none";
            };
            reader.readAsDataURL(file);
        }
    });
}
