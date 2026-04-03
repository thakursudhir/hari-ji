// ============================================================
//  config.js — Shared config for हरी जी की दुकान
//  Edit this file to customise your shop
// ============================================================

const SHOP_CONFIG = {
    name:        "हरी जी की दुकान",
    phone:       "919525499540",      // WhatsApp number (with country code, no +)
    address:     "मुख्य बाज़ार, बिहार",
    openTime:    "07:00",
    closeTime:   "21:00",

    // Google Sheets ID (from spreadsheet URL)
    // URL example: https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
    sheetId:     localStorage.getItem('hari_sheet_id') || "",

    // Admin password (change via Settings tab in admin panel)
    adminPass:   localStorage.getItem('hari_admin_pass') || "hari123",

    // Offer strip text
    offerText:   localStorage.getItem('hari_offer_text') || "🎉 पहले ऑर्डर पर 10% छूट! कोड: HARI10  |  🚚 ₹199 से ऊपर Free Delivery!",
};

// Default products (used when Google Sheet is not connected)
const DEFAULT_PRODUCTS = [
    { id: 1,  name: "लिट्ठी चोखा",         price: 40,  emoji: "🍛", category: "नाश्ता",        unit: "2pcs",  badge: "बेस्ट", available: true },
    { id: 2,  name: "समोसा",               price: 20,  emoji: "🥟", category: "नाश्ता",        unit: "2pcs",  available: true },
    { id: 3,  name: "पकौड़ी",              price: 30,  emoji: "🍘", category: "नाश्ता",        unit: "Plate", available: true },
    { id: 4,  name: "छाछ",                 price: 20,  emoji: "🥛", category: "नाश्ता",        unit: "1L",    available: true },
    { id: 5,  name: "जलेबी",               price: 30,  emoji: "🍩", category: "नाश्ता",        unit: "250g",  available: true },
    { id: 6,  name: "चावल",                price: 60,  emoji: "🍚", category: "किराना सामान",  unit: "1kg",   available: true },
    { id: 7,  name: "आटा",                 price: 35,  emoji: "🌾", category: "किराना सामान",  unit: "1kg",   available: true },
    { id: 8,  name: "अरहर दाल",            price: 80,  emoji: "🫘", category: "किराना सामान",  unit: "1kg",   available: true },
    { id: 9,  name: "चाय पत्ती",           price: 120, emoji: "🍵", category: "किराना सामान",  unit: "500g",  available: true },
    { id: 10, name: "चीनी",                price: 45,  emoji: "🍬", category: "किराना सामान",  unit: "1kg",   available: true },
    { id: 11, name: "नमक",                 price: 20,  emoji: "🧂", category: "किराना सामान",  unit: "1kg",   available: true },
    { id: 12, name: "सोयाबीन",             price: 90,  emoji: "🫘", category: "किराना सामान",  unit: "1kg",   available: true },
    { id: 13, name: "बिस्कुट पैकेट",      price: 10,  emoji: "🍪", category: "स्नैक्स",       unit: "Pack",  available: true },
    { id: 14, name: "नमकीन",              price: 25,  emoji: "🥨", category: "स्नैक्स",       unit: "250g",  available: true },
    { id: 15, name: "चिप्स",              price: 20,  emoji: "🍟", category: "स्नैक्स",       unit: "Pack",  available: true },
    { id: 16, name: "सरसों तेल",          price: 140, emoji: "🛢️", category: "तेल, मसाला",   unit: "1L",    available: true },
    { id: 17, name: "हल्दी पाउडर",        price: 30,  emoji: "🟡", category: "तेल, मसाला",   unit: "100g",  available: true },
    { id: 18, name: "लाल मिर्च पाउडर",   price: 30,  emoji: "🌶️", category: "तेल, मसाला",   unit: "100g",  available: true },
    { id: 19, name: "नहाने का साबुन",    price: 25,  emoji: "🧼", category: "साबुन, देखभाल", unit: "1pc",   available: true },
    { id: 20, name: "कपड़े धोने का पाउडर",price: 60, emoji: "🫧", category: "साबुन, देखभाल", unit: "500g",  available: true },
    { id: 21, name: "शैंपू",             price: 80,  emoji: "🧴", category: "साबुन, देखभाल", unit: "200ml", available: true },
    { id: 22, name: "पैरासिटामोल",       price: 15,  emoji: "💊", category: "दवाई",          unit: "10 tabs",available: true },
    { id: 23, name: "ORS घोल",           price: 10,  emoji: "🧃", category: "दवाई",          unit: "Pack",  available: true },
    { id: 24, name: "बैंडेज",            price: 20,  emoji: "🩹", category: "दवाई",          unit: "1 roll",available: true },
];
