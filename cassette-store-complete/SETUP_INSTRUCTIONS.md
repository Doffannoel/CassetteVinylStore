# 📦 Hysteria Music - Setup Instructions

## 🎯 Project Overview

E-commerce untuk toko cassette, CD, dan vinyl dengan tampilan mirip Swee Lee.

## 📋 Setup MongoDB Atlas

### Step 1: Buat Account MongoDB Atlas

1. Buka https://www.mongodb.com/cloud/atlas
2. Sign up / Sign in
3. Pilih "Build a Database"
4. Pilih "M0 FREE" (gratis)
5. Pilih AWS, region Singapore (ap-southeast-1)
6. Cluster Name: cassette-cluster

### Step 2: Setup Database Access

1. Di sidebar kiri, klik "Database Access"
2. Klik "Add New Database User"
3. Username: cassette-admin
4. Password: (generate secure password, simpan baik-baik)
5. Role: "Atlas Admin"
6. Klik "Add User"

### Step 3: Setup Network Access

1. Di sidebar kiri, klik "Network Access"
2. Klik "Add IP Address"
3. Klik "Allow Access from Anywhere" (untuk development)
   - Untuk production, gunakan IP Vercel
4. Klik "Confirm"

### Step 4: Get Connection String

1. Kembali ke "Database" menu
2. Klik "Connect" pada cluster Anda
3. Pilih "Connect your application"
4. Copy connection string
5. Replace <password> dengan password user Anda
6. Tambahkan nama database: `/cassette-store?retryWrites=true&w=majority`

Connection string final:

```
mongodb+srv://cassette-admin:<password>@cassette-cluster.xxxxx.mongodb.net/cassette-store?retryWrites=true&w=majority
```

## ☁️ Setup Cloudinary

### Step 1: Buat Account Cloudinary

1. Buka https://cloudinary.com
2. Sign up (gratis)
3. Verify email

### Step 2: Get API Credentials

1. Dashboard → Account Details
2. Copy:
   - Cloud name
   - API Key
   - API Secret

### Step 3: Setup Upload Preset

1. Settings → Upload
2. Klik "Add upload preset"
3. Preset name: cassette-store
4. Signing Mode: Unsigned
5. Folder: cassette-store
6. Save

## 💳 Setup Midtrans

### Step 1: Buat Account Midtrans

1. Buka https://dashboard.sandbox.midtrans.com/register
2. Sign up (untuk testing/sandbox dulu)
3. Verify email

### Step 2: Get API Keys

1. Login ke dashboard
2. Settings → Access Keys
3. Copy:
   - Client Key (untuk frontend)
   - Server Key (untuk backend)

### Step 3: Setup Snap Preferences

1. Settings → Snap Preferences
2. System Settings:
   - Payment Success Redirect URL: https://your-domain.vercel.app/payment/success
   - Payment Failure Redirect URL: https://your-domain.vercel.app/payment/failed
   - Payment Pending Redirect URL: https://your-domain.vercel.app/payment/pending
3. Save

### Step 4: Enable Payment Methods

1. Settings → Payment Methods
2. Enable:
   - Credit/Debit Card
   - Bank Transfer (BCA, BNI, BRI, Mandiri)
   - E-Wallet (GoPay, ShopeePay, DANA, OVO)
   - Virtual Account

## 🚀 Setup Vercel Deployment

### Step 1: Push ke GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/cassette-store.git
git push -u origin main
```

### Step 2: Deploy ke Vercel

1. Buka https://vercel.com
2. Sign in dengan GitHub
3. Klik "New Project"
4. Import repository cassette-store
5. Configure Environment Variables (copy dari .env.local)
6. Deploy

### Step 3: Setup Domain (Optional)

1. Settings → Domains
2. Add domain Anda
3. Configure DNS sesuai instruksi

### Step 4: Setup Webhook untuk Midtrans

1. Di Midtrans Dashboard:
   - Settings → Configuration
   - Notification URL: https://your-domain.vercel.app/api/midtrans/notification
   - Save

## 📝 Environment Variables untuk Vercel

Tambahkan di Vercel Dashboard → Settings → Environment Variables:

```
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your_client_key
MIDTRANS_SERVER_KEY=your_server_key
NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=false
ADMIN_PASSWORD=secure_admin_password
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```

## ✅ Testing Checklist

- [ ] MongoDB connection working
- [ ] Cloudinary image upload working
- [ ] Midtrans payment sandbox working
- [ ] Admin login working
- [ ] Product CRUD working
- [ ] Cart functionality working
- [ ] Checkout process working
- [ ] Order management working

## 🔐 Security Notes

1. Ganti ADMIN_PASSWORD dengan password yang kuat
2. Untuk production, ubah NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=true
3. Batasi MongoDB Network Access ke IP Vercel saja
4. Setup rate limiting untuk API routes
5. Implement CSRF protection untuk admin routes
