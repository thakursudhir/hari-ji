// ============================================================
//  script.js — Customer Site Logic
// ============================================================

let allProducts  = [];
let cart         = JSON.parse(localStorage.getItem('hari_cart') || '[]');
let currentProduct = null;
let currentQty   = 1;
let currentFilter = "All";
let currentLocation = "";
let selectedRating = 5;

// ===== INIT =====
window.onload = async () => {
    setOfferStrip();
    await loadProducts();
    buildCategoryBar();
    renderProducts("All");
    updateCartUI();
    loadReviews();
    getLocation();
};

// ===== OFFER STRIP =====
function setOfferStrip() {
    const el = document.getElementById("offer-strip");
    if (el) el.textContent = SHOP_CONFIG.offerText;
}

// ===== LOAD PRODUCTS =====
async function loadProducts() {
    const sheetId = SHOP_CONFIG.sheetId || localStorage.getItem('hari_sheet_id');

    if (sheetId) {
        try {
            // Fetch from Google Sheets published as CSV
            const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=Sheet1`;
            const res  = await fetch(url);
            const csv  = await res.text();
            allProducts = parseSheetCSV(csv);
            if (allProducts.length === 0) throw new Error("empty");
            return;
        } catch(e) {
            console.warn("Sheet load failed, using defaults:", e);
        }
    }

    // Merge defaults with local admin edits
    const localEdits = JSON.parse(localStorage.getItem('hari_products') || '[]');
    allProducts = localEdits.length > 0 ? localEdits : [...DEFAULT_PRODUCTS];
}

function parseSheetCSV(csv) {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return [];
    // Skip header row
    return lines.slice(1).map((line, idx) => {
        const cols = line.split(',').map(c => c.replace(/^"|"$/g, '').trim());
        return {
            id:        idx + 1,
            name:      cols[1] || "",
            price:     parseFloat(cols[2]) || 0,
            category:  cols[3] || "किराना सामान",
            unit:      cols[4] || "",
            emoji:     cols[5] || "🛍️",
            badge:     cols[6] || "",
            available: (cols[7] || "true").toLowerCase() !== "false",
            img:       cols[8] || ""
        };
    }).filter(p => p.name && p.price > 0);
}

// ===== CATEGORY BAR =====
function buildCategoryBar() {
    const bar = document.getElementById("cat-bar");
    bar.innerHTML = `<div class="cat-pill active" onclick="filterCat(this,'All')">🛍️ सभी</div>`;

    const cats = [...new Set(allProducts.map(p => p.category))];
    const icons = {
        "नाश्ता": "🍛", "किराना सामान": "🌾", "स्नैक्स": "🍪",
        "तेल, मसाला": "🫙", "साबुन, देखभाल": "🧼", "दवाई": "💊"
    };
    cats.forEach(cat => {
        const pill = document.createElement("div");
        pill.className = "cat-pill";
        pill.textContent = (icons[cat] || "🏷️") + " " + cat;
        pill.onclick = () => filterCat(pill, cat);
        bar.appendChild(pill);
    });
}

// ===== RENDER PRODUCTS =====
function renderProducts(filter = "All", q = "") {
    const grid = document.getElementById("product-list");
    const emptyEl = document.getElementById("empty-state");
    const badge = document.getElementById("product-count-badge");
    grid.innerHTML = "";

    let list = filter === "All" ? allProducts : allProducts.filter(p => p.category === filter);
    if (q.trim()) {
        const lq = q.toLowerCase();
        list = list.filter(p => p.name.toLowerCase().includes(lq) || p.category.toLowerCase().includes(lq));
    }
    list = list.filter(p => p.available !== false);

    badge.textContent = list.length + " आइटम";

    if (list.length === 0) { emptyEl.style.display = "block"; return; }
    emptyEl.style.display = "none";

    list.forEach((product, i) => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.style.animationDelay = (i * 0.05) + "s";

        const badge2 = product.badge ? `<div class="product-badge">${product.badge}</div>` : "";

        // Image: prefer real image, fallback to emoji
        const imgContent = product.img
            ? `<img src="${product.img}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;border-radius:10px">`
            : `<span style="font-size:44px">${product.emoji || "🛍️"}</span>`;

        card.innerHTML = `
            ${badge2}
            <div class="product-img">${imgContent}</div>
            <div class="product-name">${product.name}</div>
            <div class="product-price-row">
                <span class="product-price">₹${product.price}</span>
                <span class="product-unit">${product.unit}</span>
            </div>
            <button class="order-btn" onclick="openQuantityModal(${product.id})">🛒 जोड़ें</button>
        `;
        grid.appendChild(card);
    });
}

function filterCat(el, cat) {
    document.querySelectorAll(".cat-pill").forEach(p => p.classList.remove("active"));
    el.classList.add("active");
    currentFilter = cat;
    document.getElementById("search-input").value = "";
    renderProducts(cat);
}

function searchProducts() {
    renderProducts(currentFilter, document.getElementById("search-input").value);
}

// ===== QUANTITY MODAL =====
function openQuantityModal(productId) {
    currentProduct = allProducts.find(p => p.id === productId);
    currentQty = 1;
    const imgContent = currentProduct.img
        ? `<img src="${currentProduct.img}" style="width:60px;height:60px;object-fit:cover;border-radius:8px">`
        : currentProduct.emoji || "🛍️";

    document.getElementById("modal-img").innerHTML = imgContent;
    document.getElementById("product-name-display").textContent = currentProduct.name;
    document.getElementById("product-price-display").textContent = `₹${currentProduct.price} / ${currentProduct.unit}`;
    updateQtyDisplay();
    openModal("quantity-modal");
}

function updateQtyDisplay() {
    document.getElementById("qty-display").textContent = currentQty;
    document.getElementById("total-display").textContent = `₹${currentProduct.price * currentQty}`;
}

function increaseQty() { currentQty++; updateQtyDisplay(); }
function decreaseQty() { if (currentQty > 1) { currentQty--; updateQtyDisplay(); } }

// ===== CART =====
function addToCart() {
    if (!currentProduct) return;
    const existing = cart.find(i => i.id === currentProduct.id);
    if (existing) existing.qty += currentQty;
    else cart.push({ ...currentProduct, qty: currentQty });
    saveCart();
    updateCartUI();
    closeModal("quantity-modal");
    showToast(`✅ ${currentProduct.name} कार्ट में जोड़ा!`);
    currentProduct = null; currentQty = 1;
}

function saveCart() { localStorage.setItem('hari_cart', JSON.stringify(cart)); }

function updateCartUI() {
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const items = cart.reduce((s, i) => s + i.qty, 0);
    document.getElementById("cart-count").textContent = items;
    document.getElementById("cart-bar-count").textContent = items;
    document.getElementById("cart-bar-total").textContent = total;
    document.getElementById("cart-bar").style.display = items > 0 ? "flex" : "none";
}

function openCart() { renderCartModal(); openModal("cart-modal"); }

function renderCartModal() {
    const list = document.getElementById("cart-items-list");
    const empty = document.getElementById("cart-empty-msg");
    const summary = document.getElementById("cart-summary");
    list.innerHTML = "";

    if (cart.length === 0) {
        empty.style.display = "block"; summary.style.display = "none"; return;
    }
    empty.style.display = "none"; summary.style.display = "block";

    cart.forEach(item => {
        const d = document.createElement("div");
        d.className = "cart-item";
        const imgContent = item.img
            ? `<img src="${item.img}" style="width:44px;height:44px;object-fit:cover;border-radius:6px">`
            : `<span style="font-size:28px">${item.emoji || "🛍️"}</span>`;
        d.innerHTML = `
            <div class="cart-item-img">${imgContent}</div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">₹${item.price} × ${item.qty}</div>
            </div>
            <div class="cart-item-controls">
                <button onclick="changeCartQty(${item.id},-1)">−</button>
                <span class="cart-item-qty">${item.qty}</span>
                <button onclick="changeCartQty(${item.id},+1)">+</button>
            </div>
            <div class="cart-item-total">₹${item.price * item.qty}</div>
        `;
        list.appendChild(d);
    });
    document.getElementById("cart-total").textContent = cart.reduce((s, i) => s + i.price * i.qty, 0);
}

function changeCartQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
    saveCart(); updateCartUI(); renderCartModal();
}

// ===== CHECKOUT =====
function proceedToCheckout() {
    closeModal("cart-modal");
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    let html = cart.map(i => `
        <div class="checkout-item">
            <span>${i.emoji || "•"} ${i.name} ×${i.qty}</span>
            <span>₹${i.price * i.qty}</span>
        </div>`).join("");
    html += `<div class="checkout-total"><span>कुल:</span><span>₹${total}</span></div>`;
    document.getElementById("checkout-summary").innerHTML = html;
    openModal("payment-modal");
}

function confirmOrder() {
    const address = document.getElementById("delivery-address").value.trim();
    if (!address) { showToast("⚠️ पता लिखना जरूरी है!"); return; }

    const method = document.querySelector('input[name="payment"]:checked').value;
    const total  = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const items  = cart.map(i => `• ${i.name} ×${i.qty} = ₹${i.price * i.qty}`).join("\n");
    const payMap = {
        "COD":   "💵 Cash on Delivery — डिलीवरी पर नकद",
        "UPI":   "📱 UPI (Google Pay / PhonePe)",
        "Paytm": "🅿️ Paytm Wallet"
    };
    const locPart = currentLocation
        ? `\n📍 लोकेशन: https://maps.google.com/?q=${currentLocation}`
        : "\n📍 लोकेशन: उपलब्ध नहीं";

    const msg = `नमस्ते हरी जी! 🙏 नया ऑर्डर आया है:

📦 सामान:
${items}

💰 कुल: ₹${total}
💳 भुगतान: ${payMap[method]}
🏠 पता: ${address}${locPart}

कृपया confirm करें! धन्यवाद 🙏`;

    window.open(`https://wa.me/${SHOP_CONFIG.phone}?text=${encodeURIComponent(msg)}`, "_blank");
    cart = []; saveCart(); updateCartUI();
    closeModal("payment-modal");
    openModal("success-modal");
}

// ===== LOCATION =====
function getLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
        const lat = pos.coords.latitude.toFixed(4);
        const lon = pos.coords.longitude.toFixed(4);
        currentLocation = `${lat},${lon}`;
        document.getElementById("loc-text").textContent = `${lat}, ${lon}`;
        document.getElementById("location-text").textContent = `✅ लोकेशन मिल गई!\nLat: ${lat}, Lon: ${lon}`;
        openModal("location-modal");
    }, () => {
        document.getElementById("loc-text").textContent = "अनुमति नहीं";
    });
}

// ===== REVIEWS =====
function loadReviews() {
    const reviews = JSON.parse(localStorage.getItem('hari_reviews') || '[]');
    const list = document.getElementById("reviews-list");
    if (reviews.length === 0) {
        list.innerHTML = `<div class="no-reviews">अभी तक कोई राय नहीं। पहले आप दें! 🙏</div>`;
        return;
    }
    list.innerHTML = reviews.slice().reverse().slice(0, 10).map(r => `
        <div class="review-card">
            <div class="review-header">
                <span class="review-name">${r.name}</span>
                <span class="review-stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</span>
            </div>
            <p class="review-text">${r.text}</p>
            <div class="review-date">${r.date}</div>
        </div>
    `).join("");
}

let selectedRatingVal = 5;

function setRating(val) {
    selectedRatingVal = val;
    document.querySelectorAll(".star").forEach((s, i) => {
        s.classList.toggle("active", i < val);
    });
}

function submitReview() {
    const name = document.getElementById("review-name").value.trim();
    const text = document.getElementById("review-text").value.trim();
    if (!name || !text) { showToast("⚠️ नाम और राय लिखना जरूरी है!"); return; }

    const reviews = JSON.parse(localStorage.getItem('hari_reviews') || '[]');
    reviews.push({
        name,
        rating: selectedRatingVal,
        text,
        date: new Date().toLocaleDateString('hi-IN')
    });
    localStorage.setItem('hari_reviews', JSON.stringify(reviews));

    document.getElementById("review-name").value = "";
    document.getElementById("review-text").value = "";
    selectedRatingVal = 5;
    setRating(5);

    closeModal("review-modal");
    loadReviews();
    showToast("🙏 आपकी राय के लिए शुक्रिया!");
}

// ===== MODAL HELPERS =====
function openModal(id) {
    const el = document.getElementById(id);
    el.style.display = "flex";
    requestAnimationFrame(() => el.classList.add("active"));
}

function closeModal(id) {
    const el = document.getElementById(id);
    el.classList.remove("active");
    setTimeout(() => { el.style.display = "none"; }, 280);
}

document.querySelectorAll(".modal-overlay").forEach(o => {
    o.addEventListener("click", e => { if (e.target === o) closeModal(o.id); });
});

// ===== TOAST =====
function showToast(msg) {
    let t = document.getElementById("toast");
    if (!t) {
        t = document.createElement("div"); t.id = "toast";
        t.style.cssText = `position:fixed;bottom:110px;left:50%;transform:translateX(-50%);
        background:#1B8A3C;color:white;padding:11px 22px;border-radius:25px;
        font-size:14px;font-weight:700;z-index:9999;white-space:nowrap;
        font-family:'Baloo 2',sans-serif;box-shadow:0 4px 15px rgba(0,0,0,0.25);
        transition:opacity 0.3s;`;
        document.body.appendChild(t);
    }
    t.textContent = msg; t.style.opacity = "1";
    clearTimeout(t._t);
    t._t = setTimeout(() => { t.style.opacity = "0"; }, 2500);
}
