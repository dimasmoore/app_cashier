# 🏪 Sistem POS Kasir Modern

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.4.4-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.23.9-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6.12.0-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![NextAuth](https://img.shields.io/badge/NextAuth-4.24.11-purple?style=for-the-badge&logo=auth0&logoColor=white)

**Aplikasi Point of Sale (POS) modern dengan desain responsif dan antarmuka yang intuitif**

[Demo](#) • [Dokumentasi](#) • [Laporan Bug](https://github.com/dimasmoore/app_cashier/issues) • [Request Fitur](https://github.com/dimasmoore/app_cashier/issues)

</div>

---

## 📋 Daftar Isi

- [🎯 Gambaran Proyek](#-gambaran-proyek)
- [✨ Fitur Utama](#-fitur-utama)
- [🛠️ Teknologi yang Digunakan](#️-teknologi-yang-digunakan)
- [🚀 Panduan Instalasi](#-panduan-instalasi)
- [💻 Petunjuk Penggunaan](#-petunjuk-penggunaan)
- [📁 Struktur Proyek](#-struktur-proyek)
- [🤝 Panduan Kontribusi](#-panduan-kontribusi)
- [📄 Lisensi](#-lisensi)

---

## 🎯 Gambaran Proyek

**Sistem POS Kasir Modern** adalah aplikasi Point of Sale berbasis web yang komprehensif, dirancang khusus untuk bisnis retail, restoran, dan penyedia layanan. Aplikasi ini menggabungkan teknologi web terdepan dengan desain yang elegan dan fungsionalitas yang lengkap untuk memberikan pengalaman kasir yang seamless.

### 🌟 Keunggulan Utama

- **🎨 Desain Modern**: Interface yang bersih dan profesional dengan tema gradien biru/indigo
- **📱 Mobile-First**: Responsif sempurna di semua perangkat dan ukuran layar
- **⚡ Performa Tinggi**: Dibangun dengan Next.js 15, React 19, dan dioptimalkan untuk kecepatan
- **🎭 Animasi Halus**: Transisi yang fluid menggunakan Framer Motion
- **🔐 Autentikasi Aman**: Integrasi NextAuth.js dengan login berbasis kredensial
- **🗄️ Integrasi Database**: Prisma ORM dengan dukungan PostgreSQL/MySQL
- **♿ Aksesibilitas**: Mengikuti standar WCAG 2.1 AA untuk desain inklusif

## ✨ Fitur Utama

### 🏠 Dashboard & Analitik
- **📊 Metrik Real-time**: Penjualan harian, total transaksi, pelanggan aktif, dan status inventori
- **📅 Tanggal & Waktu Live**: Tampilan real-time dengan format lokal Indonesia
- **📈 Grafik Performa**: Visualisasi tren penjualan dengan indikator naik/turun menggunakan Recharts
- **⚡ Aksi Cepat**: Shortcut untuk fitur yang sering digunakan

### 🛒 Manajemen Penjualan
- **💰 Proses Transaksi**: Alur penjualan lengkap dengan pemilihan item dan pembayaran
- **🧾 Generasi Struk**: Pencetakan struk profesional dan salinan digital
- **💳 Metode Pembayaran Beragam**: Dukungan pembayaran tunai, kartu, dan digital
- **📋 Manajemen Pesanan**: Lacak dan kelola pesanan pelanggan dengan efisien

### 📦 Kontrol Inventori
- **📊 Pelacakan Stok**: Level inventori real-time dan peringatan stok rendah
- **🔍 Pencarian Produk**: Kemampuan pencarian dan filter yang canggih
- **📝 Manajemen Produk**: Tambah, edit, dan kategorikan produk
- **📈 Laporan Inventori**: Analitik dan pelaporan yang detail

### 👥 Manajemen Pelanggan
- **👤 Profil Pelanggan**: Kelola informasi pelanggan dan riwayat pembelian
- **🎯 Program Loyalitas**: Reward pelanggan dan pelacakan poin loyalitas
- **📊 Analitik Pelanggan**: Pola pembelian dan wawasan perilaku

### 📱 Pengalaman Mobile
- **🍔 Tombol Menu Mengambang**: Menu hamburger yang selalu terlihat untuk navigasi mudah
- **👆 Touch-Friendly**: Target sentuh 44px+ untuk interaksi mobile yang optimal
- **🎭 Dukungan Gesture**: Gesture swipe dan tap yang intuitif
- **📜 Scroll-Following**: Tombol menu tetap terlihat saat scrolling

### 🔐 Autentikasi & Keamanan
- **🔑 Integrasi NextAuth**: Autentikasi berbasis kredensial yang aman
- **🛡️ Hashing Password**: bcryptjs untuk penyimpanan password yang aman
- **🔒 Route Terproteksi**: Proteksi route berbasis middleware
- **👤 Manajemen User**: Kontrol akses berbasis peran

---

## 🛠️ Teknologi yang Digunakan

### Frontend Framework
- **[Next.js 15.4.4](https://nextjs.org/)** - React framework dengan App Router
- **[React 19.1.0](https://reactjs.org/)** - Library UI modern dengan fitur terbaru
- **[TypeScript 5.0](https://www.typescriptlang.org/)** - Type safety dan enhanced developer experience

### Database & Backend
- **[Prisma 6.12.0](https://www.prisma.io/)** - ORM generasi berikutnya untuk manajemen database
- **[NextAuth.js 4.24.11](https://next-auth.js.org/)** - Solusi autentikasi lengkap
- **[bcryptjs 3.0.2](https://github.com/dcodeIO/bcrypt.js)** - Library hashing password
- **[Zod 4.0.10](https://zod.dev/)** - Validasi schema TypeScript-first

### Styling & UI Components
- **[Tailwind CSS 4.0](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - UI primitives yang accessible
- **[Class Variance Authority](https://cva.style/)** - Manajemen variant komponen
- **[Tailwind Merge](https://github.com/dcastil/tailwind-merge)** - Utility untuk merge Tailwind classes

### Animasi & Interaksi
- **[Framer Motion 12.23.9](https://www.framer.com/motion/)** - Library motion production-ready
- **[React Icons 5.5.0](https://react-icons.github.io/react-icons/)** - Library ikon yang komprehensif
- **[Lucide React 0.525.0](https://lucide.dev/)** - Ikon yang indah & konsisten

### Visualisasi Data
- **[Recharts 3.1.0](https://recharts.org/)** - Library charting composable untuk React

### Development Tools
- **[ESLint 9](https://eslint.org/)** - Code linting dan quality assurance
- **[PostCSS](https://postcss.org/)** - CSS processing dan optimisasi
- **[tsx 4.20.3](https://github.com/esbuild-kit/tsx)** - TypeScript execution environment

## 🚀 Panduan Instalasi

### 📋 Prerequisites

Pastikan sistem Anda memiliki:

- **Node.js** ≥ 18.0.0 ([Download](https://nodejs.org/))
- **npm** ≥ 9.0.0 atau **yarn** ≥ 1.22.0 atau **pnpm** ≥ 8.0.0
- **Git** ([Download](https://git-scm.com/))
- **Database** (PostgreSQL, MySQL, atau SQLite untuk development)

### 🔧 Langkah Instalasi

1. **Clone Repository**
   ```bash
   git clone https://github.com/dimasmoore/app_cashier.git
   cd app_cashier
   ```

2. **Install Dependencies**
   ```bash
   # Menggunakan npm
   npm install

   # Menggunakan yarn
   yarn install

   # Menggunakan pnpm
   pnpm install
   ```

3. **Setup Environment**
   ```bash
   # Copy environment template
   cp .env.example .env.local

   # Edit environment variables
   nano .env.local
   ```

   **Environment Variables yang Diperlukan:**
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/cashier_db"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   
   # Optional: External APIs
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_PUBLISHABLE_KEY="pk_test_..."
   ```

4. **Setup Database**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run database migrations
   npx prisma db push

   # Seed database dengan sample data
   npm run db:seed
   ```

5. **Start Development Server**
   ```bash
   # Menggunakan npm
   npm run dev

   # Menggunakan yarn
   yarn dev

   # Menggunakan pnpm
   pnpm dev
   ```

6. **Buka Aplikasi**
   
   Navigasi ke [http://localhost:3000](http://localhost:3000) di browser Anda

### 🏗️ Production Build

```bash
# Build aplikasi
npm run build

# Start production server
npm run start

# Atau build dan start dengan PM2
pm2 start npm --name "cashier-pos" -- start
```

### 🐳 Docker Setup (Opsional)

```bash
# Build Docker image
docker build -t cashier-pos .

# Run dengan Docker Compose
docker-compose up -d
```

---

## 💻 Petunjuk Penggunaan

### 🏠 Navigasi Dashboard

1. **Akses Dashboard**
   - Buka aplikasi di browser Anda
   - Dashboard utama menampilkan ringkasan aktivitas hari ini dan metrik kunci

2. **Menggunakan Sidebar Navigation**
   - **Desktop**: Klik ikon hamburger untuk toggle sidebar
   - **Mobile**: Tap tombol floating di pojok kanan atas
   - Pilih item menu yang diinginkan dari daftar navigasi

3. **Melihat Metrik Real-time**
   - Penjualan hari ini dengan indikator persentase perubahan
   - Total transaksi dan status trend
   - Jumlah pelanggan aktif
   - Level stok produk saat ini

### 🛒 Operasi Penjualan

1. **Memproses Transaksi**
   - Navigasi ke Penjualan → Transaksi Baru
   - Cari dan tambahkan produk ke keranjang
   - Terapkan diskon atau promosi jika berlaku
   - Pilih metode pembayaran dan proses pembayaran
   - Generate struk untuk pelanggan

2. **Mengelola Pesanan**
   - Lihat pesanan pending di bagian Pesanan
   - Update status pesanan (pending, processing, completed)
   - Lacak fulfillment dan pengiriman pesanan

### 📦 Manajemen Inventori

1. **Monitoring Stok**
   - Akses Inventori → Overview Stok
   - Lihat level stok saat ini dan peringatan stok rendah
   - Filter produk berdasarkan kategori, status, atau level stok

2. **Manajemen Produk**
   - Tambah produk baru dengan detail dan harga
   - Edit informasi produk yang ada
   - Setup kategori dan varian produk
   - Kelola informasi supplier

### 📊 Laporan & Analitik

1. **Laporan Penjualan**
   - Generate laporan penjualan harian, mingguan, atau bulanan
   - Lihat tren penjualan dan metrik performa
   - Export laporan dalam format PDF atau CSV

2. **Laporan Inventori**
   - Lacak turnover inventori dan pergerakan stok
   - Identifikasi produk best-selling dan slow-moving
   - Monitor valuasi dan biaya stok

### 📱 Penggunaan Mobile

1. **Membuka Menu**
   - Tap tombol hamburger floating (🍔) di pojok kanan atas
   - Sidebar akan slide masuk dari kiri dengan animasi halus

2. **Navigasi**
   - Tap item menu untuk navigasi antar halaman
   - Sidebar otomatis tertutup setelah pemilihan menu
   - Gunakan gesture swipe untuk navigasi intuitif

3. **Menutup Menu**
   - Tap area backdrop gelap di belakang sidebar
   - Atau tap tombol X di dalam sidebar
   - Tekan tombol Esc pada perangkat dengan keyboard

### ⌨️ Keyboard Shortcuts

| Shortcut | Aksi |
|----------|------|
| `Ctrl + B` | Toggle sidebar |
| `Esc` | Tutup sidebar/modal |
| `Tab` | Navigasi antar elemen |
| `Enter` | Aktivasi tombol/link |
| `Ctrl + S` | Simpan form saat ini |
| `Ctrl + N` | Transaksi baru |

---

## 📁 Struktur Proyek

```
app_cashier/
├── 📁 public/                 # Static assets
│   ├── 🖼️ *.svg              # Ikon dan gambar
│   └── 📄 favicon.ico         # Favicon aplikasi
├── 📁 src/                    # Source code utama
│   ├── 📁 app/                # App Router (Next.js 15+)
│   │   ├── 📁 Dashboard/      # Halaman dashboard
│   │   │   └── 📄 page.tsx    # Komponen dashboard utama
│   │   ├── 📁 Inventory/      # Halaman manajemen inventori
│   │   ├── 📁 sales/          # Halaman manajemen penjualan
│   │   ├── 📁 reports/        # Halaman laporan dan analitik
│   │   ├── 📁 api/            # API routes
│   │   │   ├── 📁 auth/       # Endpoint autentikasi
│   │   │   ├── 📁 inventory/  # Endpoint API inventori
│   │   │   └── 📁 sales/      # Endpoint API penjualan
│   │   ├── 📄 globals.css     # Global styles
│   │   ├── 📄 layout.tsx      # Root layout dengan providers
│   │   └── 📄 page.tsx        # Homepage/landing page
│   ├── 📁 components/         # Komponen reusable
│   │   ├── 📁 ui/             # UI primitives (berbasis Radix)
│   │   │   ├── 📄 button.tsx  # Komponen button
│   │   │   ├── 📄 card.tsx    # Komponen card
│   │   │   ├── 📄 input.tsx   # Komponen input
│   │   │   └── 📄 ...         # Komponen UI lainnya
│   │   ├── 📁 layout/         # Komponen layout
│   │   │   └── 📄 Sidebar.tsx # Sidebar navigasi
│   │   ├── 📁 inventory/      # Komponen khusus inventori
│   │   ├── 📁 reports/        # Komponen laporan
│   │   ├── 📁 providers/      # Context providers
│   │   ├── 📄 ErrorBoundary.tsx # Error handling
│   │   └── 📄 LoadingSkeleton.tsx # Loading states
│   ├── 📁 lib/                # Utilities dan konfigurasi
│   │   ├── 📄 auth.ts         # Konfigurasi NextAuth
│   │   ├── 📄 prisma.ts       # Setup Prisma client
│   │   ├── 📄 utils.ts        # Utility functions
│   │   ├── 📄 validation.ts   # Zod schemas
│   │   └── 📄 cache.ts        # Caching utilities
│   ├── 📁 types/              # Definisi TypeScript types
│   │   ├── 📄 next-auth.d.ts  # NextAuth type extensions
│   │   └── 📄 reports.ts      # Definisi type laporan
│   └── 📄 middleware.ts       # Next.js middleware
├── 📁 prisma/                 # Schema database dan migrations
│   ├── 📄 schema.prisma       # Prisma schema
│   ├── 📄 seed.ts             # Script seeding database
│   └── 📁 migrations/         # Database migrations
├── 📄 package.json            # Dependencies dan scripts
├── 📄 tailwind.config.js      # Konfigurasi Tailwind CSS
├── 📄 tsconfig.json           # Konfigurasi TypeScript
├── 📄 next.config.ts          # Konfigurasi Next.js
├── 📄 components.json         # Konfigurasi Shadcn/ui
└── 📄 README.md               # Dokumentasi proyek
```

### 🧩 Komponen Kunci

#### `src/app/Dashboard/page.tsx`
- **Tujuan**: Dashboard utama dengan metrik dan navigasi
- **Fitur**: Real-time data, responsive layout, mobile menu
- **Dependencies**: Framer Motion, React Icons, UI components

#### `src/components/layout/Sidebar.tsx`
- **Tujuan**: Komponen sidebar navigasi yang reusable
- **Fitur**: Mobile overlay, desktop push, smooth animations
- **Props**: `isOpen`, `onToggle`, `navigationItems`, `activeItem`

#### `src/components/ui/`
- **Tujuan**: Koleksi komponen UI primitif
- **Fitur**: Consistent styling, accessibility, TypeScript support
- **Base**: Radix UI dengan custom Tailwind styling

#### `src/lib/auth.ts`
- **Tujuan**: Konfigurasi dan setup NextAuth.js
- **Fitur**: Credential provider, session management, JWT handling

#### `src/lib/prisma.ts`
- **Tujuan**: Konfigurasi dan koneksi Prisma client
- **Fitur**: Database connection pooling, error handling

---

## 🤝 Panduan Kontribusi

Kami sangat menghargai kontribusi dari komunitas! Berikut cara Anda dapat berkontribusi:

### 🐛 Melaporkan Bug

1. Cek [Issues](https://github.com/dimasmoore/app_cashier/issues) yang sudah ada terlebih dahulu
2. Buat issue baru menggunakan template bug report
3. Sertakan informasi berikut:
   - Langkah untuk mereproduksi bug
   - Perilaku yang diharapkan vs aktual
   - Screenshot/video jika memungkinkan
   - Detail environment (OS, browser, versi)

### 💡 Request Fitur

1. Buat issue dengan label `enhancement`
2. Jelaskan fitur yang diinginkan dengan jelas
3. Berikan konteks dan use case
4. Diskusikan pendekatan implementasi dengan maintainer

### 🔧 Development Workflow

1. **Fork Repository**
   ```bash
   git clone https://github.com/your-username/app_cashier.git
   cd app_cashier
   ```

2. **Buat Feature Branch**
   ```bash
   git checkout -b feature/nama-fitur
   ```

3. **Buat Perubahan**
   - Ikuti style dan konvensi kode yang ada
   - Tambahkan test untuk fungsionalitas baru
   - Update dokumentasi sesuai kebutuhan

4. **Commit Perubahan**
   ```bash
   git commit -m "feat: tambah fitur baru"
   ```

5. **Push dan Buat PR**
   ```bash
   git push origin feature/nama-fitur
   ```

6. **Submit Pull Request**
   - Gunakan template PR
   - Link issue terkait
   - Berikan deskripsi perubahan yang jelas

### 📝 Konvensi Commit

Kami menggunakan spesifikasi [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: tambah fitur baru
fix: perbaiki bug atau issue
docs: update dokumentasi
style: perubahan formatting
refactor: refactoring kode
test: tambah atau update test
chore: maintenance tasks
perf: perbaikan performa
ci: perubahan CI/CD
```

### 🧪 Testing & Quality

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npx tsc --noEmit

# Build test
npm run build

# Operasi database
npm run db:reset  # Reset dan seed database
npm run db:seed   # Seed database saja
```

### 📋 Panduan Style Kode

- **TypeScript**: Gunakan strict type checking
- **Komponen**: Gunakan functional components dengan hooks
- **Styling**: Gunakan utility classes Tailwind CSS
- **Penamaan File**: Gunakan PascalCase untuk komponen, camelCase untuk utilities
- **Imports**: Kelompokkan dan urutkan imports (external → internal → relative)

### 🔍 Checklist Pull Request

- [ ] Kode mengikuti konvensi proyek
- [ ] Test berjalan dan coverage terjaga
- [ ] Dokumentasi telah diupdate
- [ ] Tidak ada console errors atau warnings
- [ ] Responsive design bekerja di mobile/desktop
- [ ] Standar aksesibilitas terpenuhi

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah **MIT License** - lihat file [LICENSE](LICENSE) untuk detail lengkap.

```
MIT License

Copyright (c) 2024 Sistem POS Kasir Modern

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- **[Next.js Team](https://nextjs.org/)** - React framework yang luar biasa
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Framer Motion](https://www.framer.com/motion/)** - Library animasi yang powerful
- **[Radix UI](https://www.radix-ui.com/)** - Komponen primitif yang accessible
- **[Prisma](https://www.prisma.io/)** - ORM generasi berikutnya
- **[NextAuth.js](https://next-auth.js.org/)** - Solusi autentikasi lengkap
- **[React Icons](https://react-icons.github.io/)** - Library ikon yang komprehensif
- **[Recharts](https://recharts.org/)** - Library charting composable

---

## 🚀 Deployment

### Vercel (Direkomendasikan)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/dimasmoore/app_cashier)

### Platform Lainnya

- **Netlify**: Hubungkan repository GitHub Anda
- **Railway**: One-click deployment dengan database
- **Heroku**: Gunakan `Procfile` yang disertakan
- **DigitalOcean App Platform**: Deploy dari GitHub

---

<div align="center">

**⭐ Jika proyek ini membantu Anda, berikan star di GitHub! ⭐**

Dibuat dengan ❤️ oleh [dimasmoore](https://github.com/dimasmoore)

</div>
