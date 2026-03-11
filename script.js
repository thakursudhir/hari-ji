// Products Data - Hindi
const products = [
    { id: 1, name: "लिट्ठी चोखा (2pcs)", price: 40, img: "🍛", category: "नाश्ता" },
    { id: 2, name: "समोसा (2pcs)", price: 20, img: "🥟", category: "नाश्ता" },
    { id: 3, name: "पकौड़ी (Plate)", price: 30, img: "🍘", category: "नाश्ता" },
    { id: 4, name: "छाछ (1L)", price: 20, img: "🥛", category: "नाश्ता" },
    { id: 5, name: "चावल (1kg)", price: 60, img: "🍚", category: "किराना सामान" },
    { id: 6, name: "आटा (1kg)", price: 35, img: "🌾", category: "किराना सामान" },
    { id: 7, name: "तेल (1L)", price: 140, img: "🛢️", category: "तेल, मसाला" },
    { id: 8, name: "दाल (1kg)", price: 80, img: "🫘", category: "किराना सामान" },
    { id: 9, name: "मसाला (100g)", price: 10, img: "🧂", category: "तेल, मसाला" },
    { id: 10, name: "सोयाबीन (1kg)", price: 90, img: "🫘", category: "किराना सामान" },
    { id: 11, name: "चाय (1kg)", price: 120, img: "🍵", category: "किराना सामान" },
    { id: 12, name: "बिस्कुट पैकेट", price: 10, img: "🍪", category: "स्नैक्स" },
    { id: 13, name: "नमकीन (250g)", price: 25, img: "🥨", category: "स्नैक्स" }
];

// Current order state
let currentProduct = null;
let currentQuantity = 1;
let currentLocation = "";
let currentPaymentMethod = "COD";

// DOM Elements
const productList = document.getElementById("product-list");
const categoryPills = document.querySelectorAll(".cat-pill");
const locationStatus = document.getElementById("location-status");
const locationModal = document.getElementById("location-modal");
const locationText = document.getElementById("location-text");
const quantityModal = document.getElementById("quantity-modal");
const qtyDisplay = document.getElementById("qty-display");
const totalDisplay = document.getElementById("total-display");

// Render Products
function renderProducts(filter = "All") {
    productList.innerHTML = "";

    const filteredProducts = filter === "All"
        ? products
        : products.filter(p => p.category === filter);

    if (filteredProducts.length === 0) {
        productList.innerHTML = "<p>कोई प्रोडक्ट नहीं मिला।</p>";
        return;
    }

    filteredProducts.forEach((product, index) => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.style.animationDelay = (index * 0.1) + "s";
        card.innerHTML = `
            <div class="product-img">${product.img}</div>
            <div class="product-name">${product.name}</div>
            <div class="product-price">₹${product.price}</div>
            <button class="order-btn" onclick="openQuantityModal(${product.id})">
                🛒 ऑर्डर करें
            </button>
        `;
        productList.appendChild(card);
    });
}

// Open Quantity Modal
function openQuantityModal(productId) {
    currentProduct = products.find(p => p.id === productId);
    currentQuantity = 1;
    currentPaymentMethod = "COD";
    
    document.getElementById("product-name-display").textContent = currentProduct.name;
    document.getElementById("product-price-display").textContent = "कीमत: ₹" + currentProduct.price + " प्रति नग";
    
    // Reset payment selection - both blank initially
    document.getElementById("upi-btn").classList.remove("selected");
    document.getElementById("cod-btn").classList.remove("selected");
    
    updateQuantityDisplay();
    quantityModal.style.display = "flex";
}

// Update Quantity Display
function updateQuantityDisplay() {
    if (!currentProduct) return;
    
    qtyDisplay.textContent = currentQuantity;
    const total = currentProduct.price * currentQuantity;
    totalDisplay.textContent = "कुल: ₹" + total;
}

// Increase Quantity
function increaseQty() {
    currentQuantity++;
    updateQuantityDisplay();
}

// Decrease Quantity
function decreaseQty() {
    if (currentQuantity > 1) {
        currentQuantity--;
        updateQuantityDisplay();
    }
}

// Select Payment Method
function selectPayment(method) {
    currentPaymentMethod = method;
    
    // Update visual selection - use lowercase to match HTML IDs
    const methodLower = method.toLowerCase();
    document.getElementById("upi-btn").classList.remove("selected");
    document.getElementById("cod-btn").classList.remove("selected");
    document.getElementById(methodLower + "-btn").classList.add("selected");
}

// Close Quantity Modal
function closeQuantityModal() {
    quantityModal.style.display = "none";
    currentProduct = null;
    currentQuantity = 1;
}

// Send Order to WhatsApp
function sendOrder() {
    if (!currentProduct) return;
    
    const phoneNumber = "919525499540";
    const total = currentProduct.price * currentQuantity;
    const unitText = currentQuantity === 1 ? "" : ` x${currentQuantity}`;
    
    let orderType = currentPaymentMethod === "UPI" ? "📱 UPI Payment" : "💵 Cash on Delivery (COD)";
    
    let locationUrl = "";
    if (currentLocation) {
        const [lat, lon] = currentLocation.split(",");
        locationUrl = `https://maps.google.com/?q=${lat},${lon}`;
    }
    
    const message = `नमस्ते हरी जी! 🙏

मैं आपके दुकान से ऑर्डर करना चाहता/चाहती हूँ:

📦 आइटम: ${currentProduct.name}${unitText}
💰 कुल राशि: ₹${total}
💳 भुगतान: ${orderType}

📍 डिलीवरी पता: ${locationUrl}

कृपया ${currentProduct.name} का ORDER confirm करें! 🙏`;
    
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(url, "_blank");
    
    closeQuantityModal();
}

// Category Filter
categoryPills.forEach(pill => {
    pill.addEventListener("click", () => {
        document.querySelector(".cat-pill.active").classList.remove("active");
        pill.classList.add("active");

        let categoryText = pill.textContent;
        if (categoryText.includes("सभी")) renderProducts("All");
        else if (categoryText.includes("नाश्ता")) renderProducts("नाश्ता");
        else if (categoryText.includes("किराना")) renderProducts("किराना सामान");
        else if (categoryText.includes("स्नैक्स") || categoryText.includes("Snacks")) renderProducts("स्नैक्स");
        else if (categoryText.includes("तेल")) renderProducts("तेल, मसाला");
    });
});

// Location Functions
function closeModal() {
    locationModal.style.display = "none";
}

function getLocation() {
    if (navigator.geolocation) {
        locationStatus.textContent = "📍 लोकेशन मिल रही है...";
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude.toFixed(4);
            const lon = position.coords.longitude.toFixed(4);
            
            currentLocation = `${lat},${lon}`;
            
            const locationString = `Lat: ${lat}, Lon: ${lon}`;
            locationStatus.textContent = "📍 " + locationString;
            locationText.textContent = "आपकी लोकेशन: " + locationString;
            locationModal.style.display = "flex";
        }, () => {
            locationStatus.textContent = "📍 लोकेशन अनुमति नहीं दी गई";
            currentLocation = "";
        });
    } else {
        locationStatus.textContent = "Geolocation supported नहीं है";
        currentLocation = "";
    }
}

// Add event listeners after page loads
document.addEventListener("DOMContentLoaded", function() {
    
    // Send order button - use click only (not touchstart to avoid double firing)
    document.getElementById("send-order-btn").addEventListener("click", function(e) {
        e.preventDefault();
        sendOrder();
    });
    
});

// Initial Load
window.onload = function() {
    renderProducts();
    
    // Show welcome popup for 4 seconds
    const welcomePopup = document.getElementById("welcome-popup");
    if (welcomePopup) {
        setTimeout(() => {
            welcomePopup.style.display = "none";
        }, 4000);
    }
    
    // Note: Location is no longer automatically requested on page load
    // Users can still use location feature if needed by calling getLocation() manually
};

