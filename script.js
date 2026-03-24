// ============================================================
//  हरी जी की दुकान — script.js
// ============================================================

// ===== PRODUCT DATA =====
const products = [
    // नाश्ता
    { id: 1,  name: "लिट्ठी चोखा",     price: 40,  img: "🍛", category: "नाश्ता",       unit: "2pcs",  badge: "बेस्ट" },
    { id: 2,  name: "समोसा",            price: 20,  img: "🥟", category: "नाश्ता",       unit: "2pcs"  },
    { id: 3,  name: "पकौड़ी",           price: 30,  img: "🍘", category: "नाश्ता",       unit: "Plate" },
    { id: 4,  name: "छाछ",              price: 20,  img: "🥛", category: "नाश्ता",       unit: "1L"    },
    { id: 15, name: "जलेबी",            price: 30,  img: "🍩", category: "नाश्ता",       unit: "250g"  },
    // किराना
    { id: 5,  name: "चावल",             price: 60,  img: "🍚", category: "किराना सामान", unit: "1kg"   },
    { id: 6,  name: "आटा",              price: 35,  img: "🌾", category: "किराना सामान", unit: "1kg"   },
    { id: 8,  name: "दाल (अरहर)",       price: 80,  img: "🫘", category: "किराना सामान", unit: "1kg"   },
    { id: 10, name: "सोयाबीन",          price: 90,  img: "🫘", category: "किराना सामान", unit: "1kg"   },
    { id: 11, name: "चाय पत्ती",        price: 120, img: "🍵", category: "किराना सामान", unit: "500g"  },
    { id: 16, name: "चीनी",             price: 45,  img: "🍬", category: "किराना सामान", unit: "1kg"   },
    { id: 17, name: "नमक",              price: 20,  img: "🧂", category: "किराना सामान", unit: "1kg"   },
    // स्नैक्स
    { id: 12, name: "बिस्कुट पैकेट",   price: 10,  img: "🍪", category: "स्नैक्स",      unit: "Pack"  },
    { id: 13, name: "नमकीन",            price: 25,  img: "🥨", category: "स्नैक्स",      unit: "250g"  },
    { id: 18, name: "चिप्स",            price: 20,  img: "🍟", category: "स्नैक्स",      unit: "Pack"  },
    // तेल, मसाला
    { id: 7,  name: "सरसों तेल",        price: 140, img: "🛢️", category: "तेल, मसाला",  unit: "1L"    },
    { id: 9,  name: "हल्दी पाउडर",      price: 30,  img: "🟡", category: "तेल, मसाला",  unit: "100g"  },
    { id: 19, name: "लाल मिर्च पाउडर", price: 30,  img: "🌶️", category: "तेल, मसाला",  unit: "100g"  },
    // साबुन, देखभाल
    { id: 20, name: "नहाने का साबुन",   price: 25,  img: "🧼", category: "साबुन, देखभाल", unit: "1pc"  },
    { id: 21, name: "कपड़े धोने का पाउडर", price: 60, img: "🫧", category: "साबुन, देखभाल", unit: "500g" },
    { id: 22, name: "शैंपू",            price: 80,  img: "🧴", category: "साबुन, देखभाल", unit: "200ml" },
    // दवाई
    { id: 23, name: "पैरासिटामोल",      price: 15,  img: "💊", category: "दवाई",         unit: "10 tabs" },
    { id: 24, name: "ORS घोल",          price: 10,  img: "🧃", category: "दवाई",         unit: "Pack"  },
    { id: 25, name: "बैंडेज",           price: 20,  img: "🩹", category: "दवाई",         unit: "1 roll" },
];

// ===== CART STATE =====
let cart = JSON.parse(localStorage.getItem('hari_cart') || '[]');
let currentProduct = null;
let currentQuantity = 1;
let currentLocation = "";
let currentFilter = "All";

// ===== DOM REFS =====
const productList   = document.getElementById("product-list");
const cartCount     = document.getElementById("cart-count");
const cartBar       = document.getElementById("cart-bar");
const cartBarCount  = document.getElementById("cart-bar-count");
const cartBarTotal  = document.getElementById("cart-bar-total");
const emptyState    = document.getElementById("empty-state");
const searchInput   = document.getElementById("search-input");

// ===== RENDER PRODUCTS =====
function renderProducts(filter = "All", searchQuery = "") {
    currentFilter = filter;
    productList.innerHTML = "";

    let list = filter === "All" ? products : products.filter(p => p.category === filter);

    if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        list = list.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }

    if (list.length === 0) {
        emptyState.style.display = "block";
        return;
    }
    emptyState.style.display = "none";

    list.forEach((product, index) => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.style.animationDelay = (index * 0.06) + "s";

        const badge = product.badge ? `<div class="product-badge">${product.badge}</div>` : "";

        card.innerHTML = `
            ${badge}
            <div class="product-img">${product.img}</div>
            <div class="product-name">${product.name}</div>
            <div class="product-price-row">
                <span class="product-price">₹${product.price}</span>
                <span class="product-unit">${product.unit}</span>
            </div>
            <button class="order-btn" onclick="openQuantityModal(${product.id})">
                🛒 जोड़ें
            </button>
        `;
        productList.appendChild(card);
    });
}

// ===== SEARCH =====
function searchProducts() {
    renderProducts(currentFilter, searchInput.value);
}

// ===== CATEGORY FILTER =====
function filterCat(el, cat) {
    document.querySelectorAll(".cat-pill").forEach(p => p.classList.remove("active"));
    el.classList.add("active");
    searchInput.value = "";
    renderProducts(cat);
}

// ===== QUANTITY MODAL =====
function openQuantityModal(productId) {
    currentProduct = products.find(p => p.id === productId);
    currentQuantity = 1;

    document.getElementById("modal-img").textContent            = currentProduct.img;
    document.getElementById("product-name-display").textContent = currentProduct.name;
    document.getElementById("product-price-display").textContent = `₹${currentProduct.price} / ${currentProduct.unit}`;

    updateQtyDisplay();
    openModal("quantity-modal");
}

function updateQtyDisplay() {
    document.getElementById("qty-display").textContent = currentQuantity;
    document.getElementById("total-display").textContent = `₹${currentProduct.price * currentQuantity}`;
}

function increaseQty() { currentQuantity++; updateQtyDisplay(); }
function decreaseQty() { if (currentQuantity > 1) { currentQuantity--; updateQtyDisplay(); } }

// ===== ADD TO CART =====
function addToCart() {
    if (!currentProduct) return;

    const existing = cart.find(i => i.id === currentProduct.id);
    if (existing) {
        existing.qty += currentQuantity;
    } else {
        cart.push({
            id:    currentProduct.id,
            name:  currentProduct.name,
            img:   currentProduct.img,
            price: currentProduct.price,
            unit:  currentProduct.unit,
            qty:   currentQuantity
        });
    }

    saveCart();
    updateCartUI();
    closeModal("quantity-modal");

    // Small feedback
    showToast(`✅ ${currentProduct.name} कार्ट में जोड़ा!`);
    currentProduct = null;
    currentQuantity = 1;
}

// ===== CART UI =====
function updateCartUI() {
    const totalItems = cart.reduce((s, i) => s + i.qty, 0);
    const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

    cartCount.textContent    = totalItems;
    cartBarCount.textContent = totalItems;
    cartBarTotal.textContent = totalPrice;

    cartBar.style.display = totalItems > 0 ? "flex" : "none";
}

function saveCart() {
    localStorage.setItem('hari_cart', JSON.stringify(cart));
}

// ===== OPEN CART MODAL =====
function openCart() {
    renderCartItems();
    openModal("cart-modal");
}

function renderCartItems() {
    const list     = document.getElementById("cart-items-list");
    const emptyMsg = document.getElementById("cart-empty-msg");
    const summary  = document.getElementById("cart-summary");
    const total    = document.getElementById("cart-total");

    list.innerHTML = "";

    if (cart.length === 0) {
        emptyMsg.style.display = "block";
        summary.style.display  = "none";
        return;
    }

    emptyMsg.style.display = "none";
    summary.style.display  = "block";

    cart.forEach(item => {
        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
            <div class="cart-item-img">${item.img}</div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">₹${item.price} × ${item.qty}</div>
            </div>
            <div class="cart-item-controls">
                <button onclick="changeCartQty(${item.id}, -1)">−</button>
                <span class="cart-item-qty">${item.qty}</span>
                <button onclick="changeCartQty(${item.id}, +1)">+</button>
            </div>
            <div class="cart-item-total">₹${item.price * item.qty}</div>
        `;
        list.appendChild(div);
    });

    total.textContent = cart.reduce((s, i) => s + i.price * i.qty, 0);
}

function changeCartQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
    saveCart();
    updateCartUI();
    renderCartItems();
}

// ===== CHECKOUT =====
function proceedToCheckout() {
    closeModal("cart-modal");

    // Build summary
    const summaryDiv = document.getElementById("checkout-summary");
    const total      = cart.reduce((s, i) => s + i.price * i.qty, 0);

    let html = cart.map(i => `
        <div class="checkout-item">
            <span>${i.img} ${i.name} ×${i.qty}</span>
            <span>₹${i.price * i.qty}</span>
        </div>
    `).join("");

    html += `<div class="checkout-total"><span>कुल राशि:</span><span>₹${total}</span></div>`;
    summaryDiv.innerHTML = html;

    openModal("payment-modal");
}

// ===== CONFIRM ORDER (WhatsApp) =====
function confirmOrder() {
    const address = document.getElementById("delivery-address").value.trim();
    if (!address) {
        alert("⚠️ कृपया डिलीवरी का पता लिखें!");
        return;
    }

    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    const total         = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const phoneNumber   = "919525499540";

    // Order items text
    const itemsText = cart.map(i => `• ${i.name} ×${i.qty} = ₹${i.price * i.qty}`).join("\n");

    // Payment text
    const payText = {
        "COD":   "💵 Cash on Delivery — डिलीवरी पर नकद दूँगा/दूँगी",
        "UPI":   "📱 UPI से भुगतान करूँगा/करूँगी (Google Pay / PhonePe)",
        "Paytm": "🅿️ Paytm से भुगतान करूँगा/करूँगी"
    }[paymentMethod];

    // Location
    let locationPart = "";
    if (currentLocation) {
        const [lat, lon] = currentLocation.split(",");
        locationPart = `\n📍 मेरी लोकेशन: https://maps.google.com/?q=${lat},${lon}`;
    }

    const message =
`नमस्ते हरी जी! 🙏 मुझे ऑर्डर करना है:

📦 ऑर्डर की सूची:
${itemsText}

💰 कुल राशि: ₹${total}
💳 भुगतान: ${payText}
🏠 पता: ${address}${locationPart}

कृपया confirm करें:
1. सामान उपलब्ध है?
2. डिलीवरी कितने समय में होगी?

धन्यवाद! 🙏`;

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");

    // Clear cart after order
    cart = [];
    saveCart();
    updateCartUI();
    closeModal("payment-modal");
    openModal("success-modal");
}

// ===== LOCATION =====
function getLocation() {
    const locText = document.getElementById("loc-text");
    locText.textContent = "लोड हो रहा...";

    if (!navigator.geolocation) {
        locText.textContent = "GPS नहीं है";
        return;
    }

    navigator.geolocation.getCurrentPosition(
        pos => {
            const lat = pos.coords.latitude.toFixed(4);
            const lon = pos.coords.longitude.toFixed(4);
            currentLocation = `${lat},${lon}`;
            locText.textContent = `${lat}, ${lon}`;

            document.getElementById("location-text").textContent = `✅ लोकेशन मिल गई!\nLat: ${lat}, Lon: ${lon}`;
            openModal("location-modal");
        },
        () => {
            locText.textContent = "अनुमति नहीं";
            currentLocation = "";
        }
    );
}

// ===== MODAL HELPERS =====
function openModal(id) {
    const el = document.getElementById(id);
    el.style.display = "flex";
    // small delay to trigger animation
    requestAnimationFrame(() => el.classList.add("active"));
}

function closeModal(id) {
    const el = document.getElementById(id);
    el.classList.remove("active");
    setTimeout(() => { el.style.display = "none"; }, 280);
}

// Close modal on overlay click
document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", e => {
        if (e.target === overlay) closeModal(overlay.id);
    });
});

// ===== TOAST NOTIFICATION =====
function showToast(msg) {
    let toast = document.getElementById("toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        toast.style.cssText = `
            position:fixed; bottom:100px; left:50%; transform:translateX(-50%);
            background:#1B8A3C; color:white; padding:10px 20px; border-radius:25px;
            font-size:14px; font-weight:700; z-index:9999; white-space:nowrap;
            font-family:'Baloo 2',sans-serif; box-shadow:0 4px 15px rgba(0,0,0,0.2);
            transition:opacity 0.3s;
        `;
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = "1";
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toast.style.opacity = "0"; }, 2200);
}

// ===== INIT =====
window.onload = () => {
    renderProducts();
    updateCartUI();
    getLocation();
};
