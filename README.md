# 🎵 Hysteria Music — E-Commerce Cassette & Vinyl Store

Aplikasi E-Commerce untuk toko fisik **Hysteria Music**, Blok M Square — dirancang khusus untuk penjualan produk musik fisik seperti **kaset, vinyl, dan CD**, dengan model bisnis **in-store pickup (pesan online, ambil di toko)**.

---

## 🚀 Key Features
- Katalog produk lengkap (vinyl, CD, cassette) + filtering & searching
- Keranjang belanja dengan update kuantitas real time
- Checkout dengan 2 metode pembayaran:
  - 💳 **Bayar Sekarang (Midtrans Payment Gateway)**
  - 🏪 **Bayar di Toko (Pickup & Pay Later)**
- Notifikasi WhatsApp + Kode Pickup Unik
- Dashboard Admin:
  - Manajemen pesanan
  - Verifikasi pengambilan via Kode Pickup
  - Statistik & Grafik Analitik Penjualan
- Akurasi stok otomatis

---

## 🛒 Cara Kerja Sistem

### 🔹 1. Alur Pengguna (Customer Flow)
#### a. Jelajah & Keranjang Belanja
Pengguna menjelajahi produk berdasarkan kategori / pencarian, lalu memasukkan barang ke keranjang dan mengatur kuantitas.

#### b. Proses Checkout
Terdapat 2 pilihan:

##### ✅ **Opsi 1 — Bayar Sekarang (Online via Midtrans)**
1. Sistem membuat pesanan dengan status `pending`.
2. Pengguna dialihkan ke halaman pembayaran Midtrans.
3. Jika pembayaran sukses → Midtrans mengirim notifikasi ke server.
4. Status pesanan otomatis berubah menjadi `paid`.
5. Pelanggan menerima **notifikasi WhatsApp + Kode Pickup unik**.

##### 🔄 **Opsi 2 — Bayar di Toko (Pesan & Ambil)**
1. Sistem membuat pesanan dengan status `ready_pickup` tanpa pembayaran online.
2. Stok otomatis dikurangi untuk mengamankan barang.
3. Kode Pickup dibuat dan dikirimkan ke pelanggan.

---

### 🔹 2. Alur Admin (Admin Flow)

| Status | Keterangan |
|--------|------------|
| pending | Menunggu pembayaran online |
| paid | Pembayaran online sukses |
| ready_pickup | Pembayaran di toko, barang siap diambil |
| completed | Barang sudah diambil |
| cancelled | Pesanan dibatalkan |

#### 🔐 Verifikasi Pengambilan
1. Pelanggan datang membawa **Kode Pickup**.
2. Admin memasukkan kode ke sistem → detail pesanan muncul.
3. Admin menekan **Konfirmasi Pickup** → status berubah menjadi `completed`.

#### 📦 Manajemen Produk
Admin dapat menambah, mengedit, menghapus produk, termasuk pengaturan harga, stok & gambar.

---

## 🧠 Integrasi Sistem
Aplikasi menghubungkan pembelian online dengan operasional toko fisik secara efisien melalui:
- Pembaruan stok otomatis
- Validasi pickup berbasis kode
- Monitoring pendapatan & jumlah pesanan secara real time

⏱️ Hasilnya: transaksi cepat, aman, dan stok selalu akurat.

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|--------|-----------|
| Frontend | Next.js, React.js, Tailwind CSS |
| Backend | Next.js API Routes, Node.js |
| Database | MongoDB Atlas |
| Payment | Midtrans (Production Ready) |
| Storage | Cloudinary |
| Auth | JSON Web Token (JWT) |
| Notification | WhatsApp Gateway |
| Deployment | Vercel / Hostinger |


## 💻 Cara Menjalankan Project
```bash
npm install
npm run dev
```
Lalu buka di browser:
```
http://localhost:3000
```

---

## 👨‍💻 Developer
Developed by **Doffanoel Claudio Sihotang,  Iqbal Zahid Abdullah Haris,  Nirwasita Padmarini Putri Rustadi**  
📍 Universitas Prasetiya Mulya — S1 Digital Business Technology

---
