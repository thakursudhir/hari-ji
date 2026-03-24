# 🌿 हरी जी की दुकान — Deployment Guide

## 📁 Files
- `index.html` — Main page
- `style.css` — Styling
- `script.js` — All logic

---

## 🌐 Website पर Host करें (Free!)

### Option 1: GitHub Pages (सबसे आसान - FREE)
1. GitHub.com पर account बनाएं
2. New Repository बनाएं: `hari-ji`
3. तीनों files upload करें
4. Settings → Pages → Branch: main → Save
5. आपकी website: `https://yourusername.github.io/hari-ji`

### Option 2: Netlify (Drag & Drop - FREE)
1. netlify.com पर जाएं
2. "Deploy without account" पर click करें
3. अपना folder drag & drop करें
4. तुरंत live link मिलेगा!

### Option 3: Custom Domain (₹500/year)
- GoDaddy या Namecheap से domain लें (जैसे: harijikidukan.in)
- Netlify पर host करें + domain connect करें

---

## 📱 Play Store पर App बनाएं

### Method 1: PWABuilder (FREE - सबसे आसान)
1. Website को पहले host करें
2. pwabuilder.com पर जाएं
3. अपनी website का URL डालें
4. "Android" package download करें
5. Play Console (play.google.com/console) पर $25 एक बार fee देकर publish करें

### Method 2: WebViewGold (₹3,000 एक बार)
- webviewgold.com से template खरीदें
- अपनी website URL डालें
- APK build होगी → Play Store पर upload करें

### Method 3: Capacitor (Free, Technical)
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init
npx cap add android
npx cap sync
npx cap open android
```

---

## 💳 Payment Integration (Future)

### Razorpay (सबसे अच्छा for India)
- razorpay.com पर account बनाएं
- UPI, Cards, NetBanking सब support
- 2% transaction fee
- Hindi checkout support

### PhonePe for Business
- business.phonepe.com
- QR Code based payments
- Free setup

---

## 📞 Support
WhatsApp: +91 95254 99540
