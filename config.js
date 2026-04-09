// ============================================================
//  config.js — हरी जी की दुकान
// ============================================================

const JSONBIN_ID  = '69d7039eaaba882197db1979';
const JSONBIN_KEY = '$2a$10$dNUnbhbhjfVxENgQnYPW5uJ/dMkThREY66LEpBDjts4AVyMLrmCnS';
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_ID}`;

const SHOP_CONFIG = {
    name:      "हरी जी की दुकान",
    phone:     "919525499540",
    adminPass: localStorage.getItem('hari_admin_pass') || "hari123",
    offerText: localStorage.getItem('hari_offer_text') || "🎉 पहले ऑर्डर पर 10% छूट! | 🚚 ₹199 से ऊपर Free Delivery!",
};

// Cloud से load करें
async function loadCloudData() {
    try {
        const res = await fetch(`${JSONBIN_URL}/latest`, {
            headers: { 'X-Master-Key': JSONBIN_KEY }
        });
        if (!res.ok) throw new Error('load failed');
        const json = await res.json();
        return json.record || {};
    } catch(e) {
        console.warn('Cloud load failed:', e);
        return null;
    }
}

// Cloud में save करें
async function saveCloudData(data) {
    try {
        const res = await fetch(JSONBIN_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_KEY
            },
            body: JSON.stringify(data)
        });
        return res.ok;
    } catch(e) {
        console.warn('Cloud save failed:', e);
        return false;
    }
}

const DEFAULT_PRODUCTS = [
    {id:1,  name:'लिट्ठी चोखा',     price:40,  unit:'2pcs',   category:'नाश्ता',        emoji:'🍛', badge:'बेस्ट', available:true, img:''},
    {id:2,  name:'समोसा',            price:20,  unit:'2pcs',   category:'नाश्ता',        emoji:'🥟', badge:'',      available:true, img:''},
    {id:3,  name:'पकौड़ी',           price:30,  unit:'Plate',  category:'नाश्ता',        emoji:'🍘', badge:'',      available:true, img:''},
    {id:4,  name:'छाछ',              price:20,  unit:'1L',     category:'नाश्ता',        emoji:'🥛', badge:'',      available:true, img:''},
    {id:5,  name:'चावल',             price:60,  unit:'1kg',    category:'किराना सामान',  emoji:'🍚', badge:'',      available:true, img:''},
    {id:6,  name:'आटा',              price:35,  unit:'1kg',    category:'किराना सामान',  emoji:'🌾', badge:'',      available:true, img:''},
    {id:7,  name:'अरहर दाल',         price:80,  unit:'1kg',    category:'किराना सामान',  emoji:'🫘', badge:'',      available:true, img:''},
    {id:8,  name:'चाय पत्ती',        price:120, unit:'500g',   category:'किराना सामान',  emoji:'🍵', badge:'',      available:true, img:''},
    {id:9,  name:'चीनी',             price:45,  unit:'1kg',    category:'किराना सामान',  emoji:'🍬', badge:'',      available:true, img:''},
    {id:10, name:'सरसों तेल',        price:140, unit:'1L',     category:'तेल, मसाला',   emoji:'🛢️', badge:'',      available:true, img:''},
    {id:11, name:'हल्दी पाउडर',      price:30,  unit:'100g',   category:'तेल, मसाला',   emoji:'🟡', badge:'',      available:true, img:''},
    {id:12, name:'बिस्कुट',          price:10,  unit:'Pack',   category:'स्नैक्स',       emoji:'🍪', badge:'',      available:true, img:''},
    {id:13, name:'नमकीन',           price:25,  unit:'250g',   category:'स्नैक्स',       emoji:'🥨', badge:'',      available:true, img:''},
    {id:14, name:'नहाने का साबुन',  price:25,  unit:'1pc',    category:'साबुन, देखभाल', emoji:'🧼', badge:'',      available:true, img:''},
    {id:15, name:'पैरासिटामोल',     price:15,  unit:'10tabs', category:'दवाई',          emoji:'💊', badge:'',      available:true, img:''},
];
