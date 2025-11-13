// Utility functions for WhatsApp integration

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatOrderDate = (date: Date): string => {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(date));
};

export const generatePickupCode = (orderId: string): string => {
  // Generate a simple 6-digit pickup code from order ID
  const hash = orderId.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  return String(hash).slice(-6).padStart(6, '0');
};

export interface WhatsAppOrderData {
  orderId: string;
  pickupCode: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    category: string;
  }>;
  totalAmount: number;
  paymentMethod: string;
  orderDate: Date;
  storeAddress?: string;
  storePhone?: string;
}

export const generateWhatsAppMessage = (orderData: WhatsAppOrderData): string => {
  const {
    orderId,
    pickupCode,
    customerName,
    items,
    totalAmount,
    paymentMethod,
    orderDate,
    storeAddress,
    storePhone,
  } = orderData;

  let message = `🎵 *HYSTERIA MUSIC - BUKTI PEMBAYARAN* 🎵\n\n`;
  message += `✅ *PEMBAYARAN BERHASIL!*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  message += `📋 *DETAIL ORDER*\n`;
  message += `• Order ID: ${orderId}\n`;
  message += `• Kode Pickup: *${pickupCode}*\n`;
  message += `• Nama: ${customerName}\n`;
  message += `• Tanggal: ${formatOrderDate(orderDate)}\n`;
  message += `• Metode Bayar: ${paymentMethod || 'Midtrans'}\n\n`;

  message += `🛍️ *ITEM YANG DIBELI*\n`;
  items.forEach((item, index) => {
    message += `${index + 1}. ${item.name}\n`;
    message += `   ${item.category} • Qty: ${item.quantity} • ${formatCurrency(item.price)}\n`;
    message += `   Subtotal: ${formatCurrency(item.price * item.quantity)}\n\n`;
  });

  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `💰 *TOTAL: ${formatCurrency(totalAmount)}*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  message += `📍 *AMBIL BARANG DI TOKO*\n`;
  message += storeAddress || `Hysteria Music\nJl. Musik No. 123\nJakarta Selatan\n`;
  message += `\n📞 Hubungi: ${storePhone || '021-12345678'}\n\n`;

  message += `⚠️ *PENTING:*\n`;
  message += `• Tunjukkan pesan ini di toko\n`;
  message += `• Kode Pickup: *${pickupCode}*\n`;
  message += `• Barang dapat diambil dalam 1x24 jam\n`;
  message += `• Bawa KTP/identitas saat pengambilan\n\n`;

  message += `Terima kasih telah berbelanja! 🎸\n`;
  message += `_Pesan ini dikirim otomatis_`;

  return message;
};

export const generateWhatsAppUrl = (phoneNumber: string, message: string): string => {
  // Remove any non-numeric characters from phone number
  const cleanPhone = phoneNumber.replace(/\D/g, '');

  // Ensure phone number starts with country code (62 for Indonesia)
  const formattedPhone = cleanPhone.startsWith('62')
    ? cleanPhone
    : `62${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}`;

  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);

  // Return WhatsApp Web URL
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
};

export const generateStoreWhatsAppMessage = (orderData: WhatsAppOrderData): string => {
  const { orderId, pickupCode, customerName, items, totalAmount, orderDate } = orderData;

  let message = `🔔 *NOTIFIKASI ORDER BARU* 🔔\n\n`;
  message += `📋 Order ID: ${orderId}\n`;
  message += `🔑 Kode Pickup: *${pickupCode}*\n`;
  message += `👤 Customer: ${customerName}\n`;
  message += `📅 ${formatOrderDate(orderDate)}\n\n`;

  message += `📦 *Items:*\n`;
  items.forEach((item) => {
    message += `• ${item.name} (${item.category}) x${item.quantity}\n`;
  });

  message += `\n💰 Total: *${formatCurrency(totalAmount)}*\n`;
  message += `\n✅ *Pembayaran sudah diterima*\n`;
  message += `Customer akan datang ke toko untuk pickup.`;

  return message;
};

export const validatePhoneNumber = (phone: string): boolean => {
  // Indonesian phone number validation
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};
