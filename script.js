// ============================================================
//  script.js — Customer Site (JSONBin Powered)
// ============================================================

let allProducts   = [];
let cart          = JSON.parse(localStorage.getItem('hari_cart') || '[]');
let currentProduct = null;
let currentQty    = 1;
let currentFilter = 'All';
let currentLocation = '';
let selectedRatingVal = 5;

// ── INIT ──
window.onload = async () => {
    setOfferStrip();
    await loadProducts();
    buildCategoryBar();
    renderProducts('All');
    updateCartUI();
    loadReviews();
    getLocation();
};

function setOfferStrip() {
    const el = document.getElementById('offer-strip');
    if (el) el.textContent = SHOP_CONFIG.offerText;
}

// ── LOAD PRODUCTS FROM JSONBIN ──
async function loadProducts() {
    const cloud = await loadCloudData();

    if (cloud && cloud.products && cloud.products.length > 0) {
        allProducts = cloud.products;
    } else {
        allProducts = [...DEFAULT_PRODUCTS];
    }
}

// ── CATEGORY BAR ──
function buildCategoryBar() {
    const bar = document.getElementById('cat-bar');
    if (!bar) return;
    bar.innerHTML = `<div class="cat-pill active" onclick="filterCat(this,'All')">🛍️ सभी</div>`;
    const cats = [...new Set(allProducts.map(p => p.category))];
    const icons = { 'नाश्ता':'🍛','किराना सामान':'🌾','स्नैक्स':'🍪','तेल, मसाला':'🫙','साबुन, देखभाल':'🧼','दवाई':'💊' };
    cats.forEach(cat => {
        const pill = document.createElement('div');
        pill.className = 'cat-pill';
        pill.textContent = (icons[cat] || '🏷️') + ' ' + cat;
        pill.onclick = () => filterCat(pill, cat);
        bar.appendChild(pill);
    });
}

// ── RENDER PRODUCTS ──
function renderProducts(filter = 'All', q = '') {
    const grid    = document.getElementById('product-list');
    const emptyEl = document.getElementById('empty-state');
    const badge   = document.getElementById('product-count-badge');
    if (!grid) return;
    grid.innerHTML = '';

    let list = filter === 'All' ? allProducts : allProducts.filter(p => p.category === filter);
    if (q.trim()) {
        const lq = q.toLowerCase();
        list = list.filter(p => p.name.toLowerCase().includes(lq) || p.category.toLowerCase().includes(lq));
    }
    list = list.filter(p => p.available !== false);

    if (badge) badge.textContent = list.length + ' आइटम';

    if (list.length === 0) { if (emptyEl) emptyEl.style.display = 'block'; return; }
    if (emptyEl) emptyEl.style.display = 'none';

    list.forEach((product, i) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.animationDelay = (i * 0.05) + 's';

        const badgeHtml = product.badge ? `<div class="product-badge">${product.badge}</div>` : '';
        const imgContent = product.img
            ? `<img src="${product.img}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;border-radius:10px">`
            : `<span style="font-size:44px">${product.emoji || '🛍️'}</span>`;

        card.innerHTML = `
            ${badgeHtml}
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
    document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
    currentFilter = cat;
    const search = document.getElementById('search-input');
    if (search) search.value = '';
    renderProducts(cat);
}

function searchProducts() {
    const q = document.getElementById('search-input');
    renderProducts(currentFilter, q ? q.value : '');
}

// ── QUANTITY MODAL ──
function openQuantityModal(productId) {
    currentProduct = allProducts.find(p => p.id === productId);
    currentQty = 1;

    const imgEl = document.getElementById('modal-img');
    if (imgEl) imgEl.innerHTML = currentProduct.img
        ? `<img src="${currentProduct.img}" style="width:60px;height:60px;object-fit:cover;border-radius:8px">`
        : currentProduct.emoji || '🛍️';

    const nameEl  = document.getElementById('product-name-display');
    const priceEl = document.getElementById('product-price-display');
    if (nameEl)  nameEl.textContent  = currentProduct.name;
    if (priceEl) priceEl.textContent = `₹${currentProduct.price} / ${currentProduct.unit}`;

    updateQtyDisplay();
    openModal('quantity-modal');
}

function updateQtyDisplay() {
    const qd = document.getElementById('qty-display');
    const td = document.getElementById('total-display');
    if (qd) qd.textContent = currentQty;
    if (td) td.textContent = `₹${currentProduct.price * currentQty}`;
}

function increaseQty() { currentQty++; updateQtyDisplay(); }
function decreaseQty() { if (currentQty > 1) { currentQty--; updateQtyDisplay(); } }

// ── CART ──
function addToCart() {
    if (!currentProduct) return;
    const existing = cart.find(i => i.id === currentProduct.id);
    if (existing) existing.qty += currentQty;
    else cart.push({ ...currentProduct, qty: currentQty });
    saveCart(); updateCartUI();
    closeModal('quantity-modal');
    showToast(`✅ ${currentProduct.name} कार्ट में जोड़ा!`);
    currentProduct = null; currentQty = 1;
}

function saveCart() { localStorage.setItem('hari_cart', JSON.stringify(cart)); }

function updateCartUI() {
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const items = cart.reduce((s, i) => s + i.qty, 0);
    const cc = document.getElementById('cart-count');
    const bc = document.getElementById('cart-bar-count');
    const bt = document.getElementById('cart-bar-total');
    const bar = document.getElementById('cart-bar');
    if (cc)  cc.textContent  = items;
    if (bc)  bc.textContent  = items;
    if (bt)  bt.textContent  = total;
    if (bar) bar.style.display = items > 0 ? 'flex' : 'none';
}

function openCart() { renderCartModal(); openModal('cart-modal'); }

function renderCartModal() {
    const list    = document.getElementById('cart-items-list');
    const empty   = document.getElementById('cart-empty-msg');
    const summary = document.getElementById('cart-summary');
    const total   = document.getElementById('cart-total');
    if (!list) return;
    list.innerHTML = '';

    if (cart.length === 0) {
        if (empty)   empty.style.display   = 'block';
        if (summary) summary.style.display = 'none';
        return;
    }
    if (empty)   empty.style.display   = 'none';
    if (summary) summary.style.display = 'block';

    cart.forEach(item => {
        const d = document.createElement('div');
        d.className = 'cart-item';
        const imgContent = item.img
            ? `<img src="${item.img}" style="width:44px;height:44px;object-fit:cover;border-radius:6px">`
            : `<span style="font-size:28px">${item.emoji || '🛍️'}</span>`;
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
    if (total) total.textContent = cart.reduce((s, i) => s + i.price * i.qty, 0);
}

function changeCartQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
    saveCart(); updateCartUI(); renderCartModal();
}

// ── CHECKOUT ──
function proceedToCheckout() {
    closeModal('cart-modal');
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const summary = document.getElementById('checkout-summary');
    if (!summary) return;
    let html = cart.map(i => `
        <div class="checkout-item">
            <span>${i.emoji || '•'} ${i.name} ×${i.qty}</span>
            <span>₹${i.price * i.qty}</span>
        </div>`).join('');
    html += `<div class="checkout-total"><span>कुल:</span><span>₹${total}</span></div>`;
    summary.innerHTML = html;
    openModal('payment-modal');
}

function confirmOrder() {
    const address = document.getElementById('delivery-address');
    if (!address || !address.value.trim()) { showToast('⚠️ पता लिखना ज़रूरी है!'); return; }
    const method = document.querySelector('input[name="payment"]:checked');
    const total  = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const items  = cart.map(i => `• ${i.name} ×${i.qty} = ₹${i.price * i.qty}`).join('\n');
    const payMap = { 'COD':'💵 Cash on Delivery', 'UPI':'📱 UPI (Google Pay / PhonePe)', 'Paytm':'🅿️ Paytm Wallet' };
    const locPart = currentLocation ? `\n📍 लोकेशन: https://maps.google.com/?q=${currentLocation}` : '';

    const msg = `नमस्ते हरी जी! 🙏 नया ऑर्डर:\n\n📦 सामान:\n${items}\n\n💰 कुल: ₹${total}\n💳 ${payMap[method?.value] || 'COD'}\n🏠 पता: ${address.value}${locPart}\n\nधन्यवाद! 🙏`;

    window.open(`https://wa.me/${SHOP_CONFIG.phone}?text=${encodeURIComponent(msg)}`, '_blank');
    cart = []; saveCart(); updateCartUI();
    closeModal('payment-modal');
    openModal('success-modal');
}

// ── LOCATION ──
function getLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
        const lat = pos.coords.latitude.toFixed(4);
        const lon = pos.coords.longitude.toFixed(4);
        currentLocation = `${lat},${lon}`;
        const locText = document.getElementById('loc-text');
        const locTextModal = document.getElementById('location-text');
        if (locText) locText.textContent = `${lat}, ${lon}`;
        if (locTextModal) locTextModal.textContent = `✅ लोकेशन मिल गई!\nLat: ${lat}, Lon: ${lon}`;
        openModal('location-modal');
    }, () => {
        const locText = document.getElementById('loc-text');
        if (locText) locText.textContent = 'अनुमति नहीं';
    });
}

// ── REVIEWS ──
function loadReviews() {
    const reviews = JSON.parse(localStorage.getItem('hari_reviews') || '[]');
    const list = document.getElementById('reviews-list');
    if (!list) return;
    if (reviews.length === 0) {
        list.innerHTML = `<div class="no-reviews">अभी तक कोई राय नहीं। पहले आप दें! 🙏</div>`;
        return;
    }
    list.innerHTML = reviews.slice().reverse().slice(0, 10).map(r => `
        <div class="review-card">
            <div class="review-header">
                <span class="review-name">${r.name}</span>
                <span class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
            </div>
            <p class="review-text">${r.text}</p>
            <div class="review-date">${r.date}</div>
        </div>`).join('');
}

function setRating(val) {
    selectedRatingVal = val;
    document.querySelectorAll('.star').forEach((s, i) => s.classList.toggle('active', i < val));
}

function submitReview() {
    const name = document.getElementById('review-name');
    const text = document.getElementById('review-text');
    if (!name || !text || !name.value.trim() || !text.value.trim()) {
        showToast('⚠️ नाम और राय लिखना ज़रूरी है!'); return;
    }
    const reviews = JSON.parse(localStorage.getItem('hari_reviews') || '[]');
    reviews.push({ name: name.value.trim(), rating: selectedRatingVal, text: text.value.trim(), date: new Date().toLocaleDateString('hi-IN') });
    localStorage.setItem('hari_reviews', JSON.stringify(reviews));
    name.value = ''; text.value = '';
    setRating(5);
    closeModal('review-modal');
    loadReviews();
    showToast('🙏 आपकी राय के लिए शुक्रिया!');
}

// ── MODALS ──
function openModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = 'flex';
    requestAnimationFrame(() => el.classList.add('active'));
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('active');
    setTimeout(() => { el.style.display = 'none'; }, 280);
}

document.querySelectorAll('.modal-overlay').forEach(o => {
    o.addEventListener('click', e => { if (e.target === o) closeModal(o.id); });
});

// ── TOAST ──
function showToast(msg) {
    let t = document.getElementById('toast');
    if (!t) {
        t = document.createElement('div'); t.id = 'toast';
        t.style.cssText = `position:fixed;bottom:110px;left:50%;transform:translateX(-50%);background:#1B8A3C;color:white;padding:11px 22px;border-radius:25px;font-size:14px;font-weight:700;z-index:9999;white-space:nowrap;font-family:'Baloo 2',sans-serif;box-shadow:0 4px 15px rgba(0,0,0,.25);transition:opacity .3s;`;
        document.body.appendChild(t);
    }
    t.textContent = msg; t.style.opacity = '1';
    clearTimeout(t._t);
    t._t = setTimeout(() => { t.style.opacity = '0'; }, 2500);
}
