# Lab IUH - Static Website

Static website được build với Vite + Vanilla JS + TailwindCSS

## 📁 Cấu trúc dự án

```
src/
├─ pages/            # Các HTML pages
│  ├─ index.html
│  └─ about.html
├─ components/       # Components (HTML + JS + CSS)
│  ├─ header/
│  │  ├─ header.html
│  │  ├─ header.js
│  │  └─ header.css
│  └─ footer/
│     ├─ footer.html
│     └─ footer.css
├─ js/
│  ├─ main.js           # Entry point
│  ├─ componentLoader.js # Component loader
│  ├─ home.js           # Home page JS
│  └─ about.js          # About page JS
├─ styles/
│  └─ main.css          # Tailwind entry
└─ assets/
   └─ images/
```

## 🚀 Cách sử dụng

### 1. Cài đặt dependencies

```bash
npm install
# hoặc
yarn install
```

### 2. Development

```bash
npm run dev
# hoặc
yarn dev
```

Mở http://localhost:5173

### 3. Build production

```bash
npm run build
# hoặc
yarn build
```

Output: `dist/` folder

### 4. Preview production build

```bash
npm run preview
# hoặc
yarn preview
```

## 🎯 Cách hoạt động

### Component System

Components được load tự động qua attribute `data-include`:

```html
<div data-include="../../components/header/header.html"></div>
```

Component có thể có JS riêng (export `init` function):

```javascript
// header.js
export function init() {
  // Component logic
}
```

### Page-specific JS

Mỗi page có thể có JS riêng, chỉ chạy trên page đó:

```html
<!-- index.html -->
<script type="module" src="../js/home.js"></script>
```

JS lắng nghe event `components-loaded` để đảm bảo components đã load xong:

```javascript
document.addEventListener('components-loaded', () => {
  // Your page logic
})
```

## 📦 Tech Stack

- **Vite** - Build tool & dev server
- **Vanilla JavaScript** - No frameworks
- **TailwindCSS** - Utility-first CSS
- **PostCSS** - CSS processing

## 🎨 Thêm page mới

1. Tạo file HTML trong `src/pages/`:
```html
<!-- src/pages/contact.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Contact</title>
  <script type="module" src="../js/main.js"></script>
</head>
<body>
  <div data-include="../../components/header/header.html"></div>
  <!-- Your content -->
  <div data-include="../../components/footer/footer.html"></div>
  <script type="module" src="../js/contact.js"></script>
</body>
</html>
```

2. Tạo JS cho page (optional):
```javascript
// src/js/contact.js
document.addEventListener('components-loaded', () => {
  // Page logic
})
```

Vite sẽ tự động build file mới!

## 🔧 Thêm component mới

1. Tạo folder trong `src/components/`:
```
src/components/card/
├─ card.html
├─ card.js (optional)
└─ card.css (optional)
```

2. Sử dụng trong page:
```html
<div data-include="../../components/card/card.html"></div>
```

## ✨ Features

✅ HTML-first architecture  
✅ Component-based structure  
✅ Dynamic component loading  
✅ Page-specific JavaScript  
✅ TailwindCSS styling  
✅ Fast HMR with Vite  
✅ Production-ready static output  
✅ No complex frameworks  

## 📝 License

MIT
