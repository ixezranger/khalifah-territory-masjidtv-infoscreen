# 🕌 MasjidTV InfoScreen

> Sistem InfoTV Islamik untuk Masjid, Surau & Rumah  
> Built with ❤️ by **[Khalifah Territory](https://github.com/ixezranger)**

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)
![GSAP](https://img.shields.io/badge/GSAP-3-88CE02?logo=greensock)

## ✨ Features
- 🕌 Waktu Solat Malaysia — data dari e-solat.gov.my (semua zon)
- 🖼️ GSAP LayerSlider — imej, video & YouTube embed
- 🎵 Pustaka Audio — Zikir, Tilawah Quran, Nasheed dengan Howler.js
- 📁 Import Google Drive — import media terus ke CDN
- ⚙️ Admin CMS Panel — pengurusan konten penuh
- 📱 Pratonton TV / Tablet / Mudah Alih
- 🌙 Reka bentuk Ottoman-Turkish Glassmorphism
- ⚡ CDN global Cloudflare R2 untuk media
- 🔴 Realtime via Supabase (ticker, notifikasi)

## 🚀 Setup

### 1. Clone & Install
```bash
git clone https://github.com/ixezranger/khalifah-territory-masjidtv-infoscreen.git
cd khalifah-territory-masjidtv-infoscreen
npm install
cp .env.example .env
```

### 2. Supabase Setup
1. Buat projek baru di [supabase.com](https://supabase.com)
2. Jalankan `supabase/schema.sql` dalam SQL Editor
3. Aktifkan Realtime untuk jadual: `ticker_messages`, `blast_notifications`, `slider_items`
4. Salin URL & anon key ke `.env`

### 3. Cloudflare R2 Setup
1. Buat bucket baru di [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Aktifkan public access + custom domain
3. Buat R2 API token (Object Read & Write)
4. Isi R2 credentials dalam `.env`

### 4. Google Drive OAuth
1. Buka [Google Cloud Console](https://console.cloud.google.com)
2. Buat projek → aktifkan Google Drive API
3. Buat OAuth 2.0 credentials (Web application)
4. Tambah authorized origin: `http://localhost:5173`
5. Salin Client ID & API Key ke `.env`

### 5. Run
```bash
npm run dev
# InfoTV: http://localhost:5173
# Admin:  http://localhost:5173/admin
# Login:  http://localhost:5173/login
```

## 🗺️ Zon Waktu Solat Malaysia
| Kod | Kawasan |
|-----|---------|
| WLY01 | Kuala Lumpur & Putrajaya |
| WLY02 | Labuan |
| SGR01 | Gombak, Petaling, Sepang, Hulu Langat |
| SGR02 | Kuala Selangor, Sabak Bernam |
| SGR03 | Klang, Kuala Langat |
| ... | (rujuk ZONES dalam useWaktuSolat.js) |

## 📁 Struktur Projek
```
src/
  components/InfoTV/     # Komponen paparan InfoTV
  components/Admin/      # Panel CMS admin
  components/shared/     # Komponen dikongsi
  hooks/                 # Custom React hooks
  lib/                   # Supabase, R2, Google Drive
  store/                 # Zustand state management
  pages/                 # Halaman utama
supabase/
  schema.sql             # Skema pangkalan data lengkap
```

## 🛣️ Roadmap
- [ ] Supabase Edge Function untuk R2 presigned URLs
- [ ] Split admin vs user dashboard
- [ ] Push notifications
- [ ] Mod kiosk (tanpa nav bar)
- [ ] Tema tambahan

## 📄 License
MIT © 2025 [Khalifah Territory](https://github.com/ixezranger)
