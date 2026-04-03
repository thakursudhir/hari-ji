# 🌿 हरी जी की दुकान v2 — Complete Setup Guide

## 📁 Files
| File | काम |
|------|-----|
| `index.html` | Customer website |
| `style.css` | Website का design |
| `script.js` | Website का logic |
| `admin.html` | Admin panel (दुकानदार के लिए) |
| `admin.css` | Admin panel design |
| `admin.js` | Admin panel logic |
| `config.js` | सब shared settings |

---

## 🔐 Admin Panel कैसे खोलें
- URL: `yourwebsite.com/admin.html`
- Default Password: **hari123**
- Settings tab से password बदलें!

---

## 📊 Google Sheets Setup (Products manage करने के लिए)

### Step 1: Google Sheet बनाएं
1. [sheets.google.com](https://sheets.google.com) खोलें
2. नई sheet बनाएं
3. पहली row में ये headers डालें (exactly इसी order में):

```
id | name | price | category | unit | emoji | badge | available | img
```

### Step 2: Products डालें
Example:
```
1 | चावल | 60 | किराना सामान | 1kg | 🍚 | | TRUE |
2 | दाल | 80 | किराना सामान | 1kg | 🫘 | बेस्ट | TRUE |
3 | तेल | 140 | तेल, मसाला | 1L | 🛢️ | | FALSE |
```

### Step 3: Share करें
File → Share → Anyone with link → Viewer → Done

### Step 4: Sheet ID copy करें
URL से: `docs.google.com/spreadsheets/d/**SHEET_ID**/edit`

### Step 5: Admin Panel में paste करें
Admin → Dashboard → Step 3 → Sheet ID paste करें → Save

---

## 🌐 Website Host करें (FREE)

### Netlify (सबसे आसान):
1. [netlify.com](https://netlify.com) खोलें
2. "Deploy without account" → folder drag & drop
3. तुरंत live!

### GitHub Pages:
1. GitHub पर repository बनाएं
2. सभी files upload करें
3. Settings → Pages → main branch → Save
4. URL: `username.github.io/repo-name`

---

## 📱 Play Store App

### PWABuilder (Free):
1. Website host करें
2. [pwabuilder.com](https://pwabuilder.com) → URL डालें
3. Android package download करें
4. [play.google.com/console](https://play.google.com/console) → $25 fee → Publish

---

## 💳 Real Payment Integration (Future)

### Razorpay:
- [razorpay.com](https://razorpay.com) पर account बनाएं
- UPI, Cards, NetBanking — सब support
- 2% per transaction

---

## 📞 Support
WhatsApp: +91 95254 99540
