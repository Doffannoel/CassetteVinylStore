// 'use client';

// import { useEffect, useState } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import Link from 'next/link';
// import {
//   CheckCircle,
//   Clock,
//   XCircle,
//   Package,
//   Copy,
//   Loader2,
//   MessageCircle,
//   Store,
//   AlertCircle
// } from 'lucide-react';
// import { IOrder } from '@/models/Order';
// import toast from 'react-hot-toast';
// import {
//   generateWhatsAppMessage,
//   generateWhatsAppUrl,
//   generateStoreWhatsAppMessage,
// } from '@/utils/whatsapp';

// type OrderData = IOrder & {
//   items: {
//     product: {
//       _id: string;
//       name: string;
//       artist: string;
//       images: string[];
//       category?: string;
//     };
//     quantity: number;
//     price: number;
//   }[];
// };

// export default function OrderDetailsPage() {
//   const params = useParams();
//   const router = useRouter();
//   const id = params.id as string;

//   const [order, setOrder] = useState<OrderData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isPaying, setIsPaying] = useState(false);

//   useEffect(() => {
//     const midtransScriptUrl = 'https://app.sandbox.midtrans.com/snap/snap.js';

//     let script: HTMLScriptElement | null = document.querySelector(
//       `script[src="${midtransScriptUrl}"]`
//     );

//     if (!script) {
//       script = document.createElement('script');
//       script.src = midtransScriptUrl;
//       script.setAttribute(
//         'data-client-key',
//         process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!
//       );
//       script.async = true;
//       document.head.appendChild(script);
//     }

//     return () => {
//       if (script && script.parentNode) {
//         // Clean up script when component unmounts
//         // script.parentNode.removeChild(script);
//       }
//     };
//   }, []);

//   const handleRetryPayment = async () => {
//     if (!order) return;

//     setIsPaying(true);
//     try {
//       const res = await fetch(`/api/orders/${id}/retry-payment`, {
//         method: 'POST',
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || 'Gagal mencoba ulang pembayaran.');
//       }

//       const { token } = data;

//       (window as any).snap.pay(token, {
//         onSuccess: function (result: any) {
//           toast.success('Pembayaran berhasil!');
//           router.push(`/payment/success?order_id=${order.orderId}`);
//         },
//         onPending: function (result: any) {
//           toast('Menunggu pembayaran Anda.');
//           router.refresh();
//         },
//         onError: function (result: any) {
//           toast.error('Pembayaran gagal.');
//         },
//         onClose: function () {
//           toast('Anda menutup popup tanpa menyelesaikan pembayaran.');
//         },
//       });
//     } catch (err: any) {
//       toast.error(err.message);
//     } finally {
//       setIsPaying(false);
//     }
//   };

//   useEffect(() => {
//     if (id) {
//       const fetchOrder = async () => {
//         try {
//           setLoading(true);
//           const res = await fetch(`/api/orders/${id}`);
//           const data = await res.json();

//           if (!res.ok) {
//             throw new Error(data.error || 'Gagal memuat pesanan');
//           }

//           setOrder(data.data);
//         } catch (err: any) {
//           setError(err.message);
//           toast.error(err.message);
//         } finally {
//           setLoading(false);
//         }
//       };

//       fetchOrder();
//     }
//   }, [id]);

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat('id-ID', {
//       style: 'currency',
//       currency: 'IDR',
//       minimumFractionDigits: 0,
//     }).format(amount);
//   };

//   const formatOrderDate = (date: string | Date) => {
//     return new Date(date).toLocaleDateString('id-ID', {
//       day: 'numeric',
//       month: 'long',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//     });
//   };

//   const copyPickupCode = () => {
//     if (order?.pickupCode) {
//       navigator.clipboard.writeText(order.pickupCode);
//       toast.success('Kode pickup berhasil disalin!');
//     }
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'paid':
//       case 'ready_for_pickup':
//       case 'completed':
//         return <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />;
//       case 'pending':
//         return <Clock className="w-20 h-20 text-yellow-500 mx-auto mb-4" />;
//       case 'cancelled':
//       case 'failed':
//         return <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />;
//       default:
//         return <Package className="w-20 h-20 text-gray-500 mx-auto mb-4" />;
//     }
//   };

//   const getStatusBadgeColor = (status: string) => {
//     switch (status) {
//       case 'paid':
//       case 'ready_for_pickup':
//         return 'bg-green-100 text-green-800';
//       case 'pending':
//         return 'bg-yellow-100 text-yellow-800';
//       case 'cancelled':
//       case 'failed':
//         return 'bg-red-100 text-red-800';
//       case 'completed':
//         return 'bg-blue-100 text-blue-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const getStatusText = (status: string) => {
//     switch (status) {
//       case 'paid':
//         return 'Pembayaran Diterima';
//       case 'pending':
//         return 'Menunggu Pembayaran';
//       case 'ready_for_pickup':
//         return 'Siap Diambil';
//       case 'completed':
//         return 'Selesai';
//       case 'cancelled':
//         return 'Dibatalkan';
//       case 'failed':
//         return 'Gagal';
//       default:
//         return status;
//     }
//   };

//   if (loading) {
//     return (
//       <div className="container py-20 flex justify-center">
//         <Loader2 className="animate-spin" size={32} />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="container py-12 max-w-3xl text-center">
//         <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
//         <h1 className="text-2xl font-heading mb-4">Terjadi Kesalahan</h1>
//         <p className="text-text-body mb-6">{error}</p>
//         <Link href="/products" className="btn-primary px-6 py-3 rounded-md">
//           Kembali ke Produk
//         </Link>
//       </div>
//     );
//   }

//   if (!order) {
//     return (
//       <div className="container py-12 max-w-3xl text-center">
//         <Package className="w-20 h-20 text-gray-400 mx-auto mb-4" />
//         <h1 className="text-2xl font-heading mb-4">Pesanan Tidak Ditemukan</h1>
//         <p className="text-text-body mb-6">
//           Pesanan yang Anda cari tidak ada atau telah dihapus.
//         </p>
//         <Link href="/products" className="btn-primary px-6 py-3 rounded-md">
//           Kembali ke Produk
//         </Link>
//       </div>
//     );
//   }

//   const isPendingPayment = (order.paymentStatus === 'pending' || order.status === 'pending') && order.paymentMethod !== 'pay_at_store';

//   return (
//     <div className="container py-12 max-w-3xl">
//       <div className="bg-white rounded-lg shadow-lg p-8">
//         {/* Header with Icon */}
//         <div className="text-center mb-8">
//           {getStatusIcon(order.status)}
//           <h1 className="text-3xl font-heading mb-2">
//             {isPendingPayment ? 'Menunggu Pembayaran' : 'Detail Pesanan'}
//           </h1>
//           <p className="text-text-body">
//             {isPendingPayment
//               ? 'Selesaikan pembayaran Anda untuk memproses pesanan'
//               : 'Terima kasih telah berbelanja di Hysteria Music'
//             }
//           </p>
//         </div>

//         {/* Pending Payment Alert */}
//         {isPendingPayment && (
//           <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
//             <div className="flex items-start gap-4">
//               <AlertCircle className="text-yellow-600 flex-shrink-0" size={24} />
//               <div className="flex-1">
//                 <h3 className="font-semibold mb-2 text-yellow-800">Pembayaran Belum Selesai</h3>
//                 <p className="text-sm text-yellow-700 mb-4">
//                   Silakan selesaikan pembayaran Anda. Jika Anda sudah membayar, mohon tunggu beberapa saat
//                   hingga status diperbarui.
//                 </p>
//                 <button
//                   onClick={handleRetryPayment}
//                   disabled={isPaying}
//                   className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
//                 >
//                   {isPaying ? (
//                     <>
//                       <Loader2 className="animate-spin" size={20} />
//                       Memproses...
//                     </>
//                   ) : (
//                     'Lanjutkan Pembayaran'
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Pay at Store Info */}
//         {order.paymentMethod === 'pay_at_store' && order.status === 'pending' && (
//           <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
//             <div className="flex items-start gap-4">
//               <Store className="text-blue-600 flex-shrink-0" size={24} />
//               <div className="flex-1">
//                 <h3 className="font-semibold mb-2 text-blue-800">Pembayaran di Toko</h3>
//                 <p className="text-sm text-blue-700">
//                   Anda memilih untuk membayar di toko. Silakan datang ke toko kami dengan membawa kode pickup
//                   dan lakukan pembayaran di kasir.
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Order Information Card */}
//         <div className="bg-neutral-card rounded-lg p-6 mb-6">
//           <div className="grid md:grid-cols-2 gap-4 mb-4">
//             <div>
//               <p className="text-sm text-text-body">Order ID</p>
//               <p className="font-semibold font-mono">{order.orderId}</p>
//             </div>
//             <div>
//               <p className="text-sm text-text-body">Tanggal Pesanan</p>
//               <p className="font-semibold">{formatOrderDate(order.createdAt)}</p>
//             </div>
//             <div>
//               <p className="text-sm text-text-body">Total Pembayaran</p>
//               <p className="font-semibold text-accent-gold text-lg">
//                 {formatCurrency(order.totalAmount)}
//               </p>
//             </div>
//             <div>
//               <p className="text-sm text-text-body">Status</p>
//               <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
//                 {getStatusText(order.status)}
//               </span>
//             </div>
//           </div>

//           {/* Pickup Code - Show if paid OR pay_at_store */}
//           {(!isPendingPayment || order.paymentMethod === 'pay_at_store') && order.pickupCode && (
//             <div className="bg-accent-gold text-white rounded-lg p-6 text-center">
//               <p className="text-sm mb-2">KODE PENGAMBILAN</p>
//               <div className="flex items-center justify-center gap-3">
//                 <span className="text-4xl font-bold font-mono tracking-wider">
//                   {order.pickupCode}
//                 </span>
//                 <button
//                   onClick={copyPickupCode}
//                   className="p-2 bg-white/20 rounded hover:bg-white/30 transition-colors"
//                   title="Salin kode"
//                 >
//                   <Copy size={20} />
//                 </button>
//               </div>
//               <p className="text-sm mt-2 opacity-90">
//                 {order.paymentMethod === 'pay_at_store'
//                   ? 'Tunjukkan kode ini saat pembayaran dan pengambilan barang'
//                   : 'Tunjukkan kode ini saat pengambilan barang'
//                 }
//               </p>
//             </div>
//           )}
//         </div>

//         {/* Customer Information */}
//         <div className="border border-neutral-divider rounded-lg p-6 mb-6">
//           <h3 className="font-semibold mb-4">Informasi Pelanggan</h3>
//           <div className="space-y-3">
//             <div className="flex justify-between">
//               <span className="text-text-body">Nama:</span>
//               <span className="font-medium">{order.customerInfo.name}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-text-body">Email:</span>
//               <span className="font-medium">{order.customerInfo.email}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-text-body">Telepon:</span>
//               <span className="font-medium">{order.customerInfo.phone}</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-text-body">Metode Pembayaran:</span>
//               <span className="font-medium">{order.paymentMethod || 'Belum Dipilih'}</span>
//             </div>
//           </div>
//         </div>

//         {/* Items List */}
//         <div className="border border-neutral-divider rounded-lg p-6 mb-6">
//           <h3 className="font-semibold mb-4">Item yang Dibeli</h3>
//           <div className="space-y-4">
//             {order.items.map((item, index) => (
//               <div key={index} className="flex items-center gap-4 pb-4 border-b border-neutral-divider last:border-b-0">
//                 <img
//                   src={item.product.images?.[0] || '/images/placeholder.png'}
//                   alt={item.product.name}
//                   className="w-20 h-20 object-cover rounded-md"
//                 />
//                 <div className="flex-1">
//                   <p className="font-semibold">{item.product.name}</p>
//                   <p className="text-sm text-text-body">{item.product.artist}</p>
//                   <p className="text-sm text-text-body mt-1">
//                     {item.product.category} × {item.quantity}
//                   </p>
//                 </div>
//                 <div className="text-right">
//                   <p className="font-semibold text-accent-gold">
//                     {formatCurrency(item.price * item.quantity)}
//                   </p>
//                   <p className="text-sm text-text-body">
//                     {formatCurrency(item.price)} × {item.quantity}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//           <div className="flex justify-between mt-6 pt-4 border-t-2 border-neutral-divider">
//             <p className="font-bold text-lg">Total</p>
//             <p className="font-bold text-accent-gold text-xl">
//               {formatCurrency(order.totalAmount)}
//             </p>
//           </div>
//         </div>

//         {/* Pickup Instructions - Show if not pending OR pay_at_store */}
//         {(!isPendingPayment || order.paymentMethod === 'pay_at_store') && (
//           <>
//             <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
//               <div className="flex items-start gap-4">
//                 <Store className="text-amber-600 flex-shrink-0" size={24} />
//                 <div className="flex-1">
//                   <h3 className="font-semibold mb-2">
//                     {order.paymentMethod === 'pay_at_store'
//                       ? 'Cara Pembayaran dan Pengambilan Barang'
//                       : 'Cara Pengambilan Barang'
//                     }
//                   </h3>
//                   <ol className="text-sm text-text-body space-y-2 list-decimal list-inside">
//                     {order.paymentMethod === 'pay_at_store' ? (
//                       <>
//                         <li>Simpan kode pickup Anda</li>
//                         <li>Datang ke toko dalam 1x24 jam</li>
//                         <li>
//                           Tunjukkan kode pengambilan: <strong className="text-accent-gold">{order.pickupCode}</strong>
//                         </li>
//                         <li>Lakukan pembayaran di kasir sejumlah <strong className="text-accent-gold">{formatCurrency(order.totalAmount)}</strong></li>
//                         <li>Bawa KTP/identitas yang sesuai dengan nama pembeli</li>
//                         <li>Ambil barang Anda setelah pembayaran</li>
//                       </>
//                     ) : (
//                       <>
//                         <li>Simpan bukti pembayaran atau kode pickup</li>
//                         <li>Datang ke toko dalam 1x24 jam</li>
//                         <li>
//                           Tunjukkan kode pengambilan: <strong className="text-accent-gold">{order.pickupCode}</strong>
//                         </li>
//                         <li>Bawa KTP/identitas yang sesuai dengan nama pembeli</li>
//                         <li>Ambil barang Anda di counter</li>
//                       </>
//                     )}
//                   </ol>
//                 </div>
//               </div>
//             </div>

//             {/* Store Location */}
//             <div className="border border-neutral-divider rounded-lg p-6 mb-6">
//               <h3 className="font-semibold mb-3 flex items-center gap-2">
//                 <Store size={20} />
//                 Lokasi {order.paymentMethod === 'pay_at_store' ? 'Pembayaran dan ' : ''}Pengambilan
//               </h3>
//               <p className="text-text-body">
//                 <strong>{process.env.NEXT_PUBLIC_STORE_NAME || 'Hysteria Music Jakarta'}</strong>
//                 <br />
//                 {process.env.NEXT_PUBLIC_STORE_ADDRESS || 'Jl. Musik No. 123, Jakarta Selatan'}
//                 <br />
//                 Telp: {process.env.NEXT_PUBLIC_STORE_PHONE || '021-12345678'}
//               </p>
//               <p className="text-sm text-text-body mt-3">
//                 Jam operasional: Senin-Sabtu 11:00-20:00
//               </p>
//             </div>
//           </>
//         )}

//         {/* Action Buttons */}
//         <div className="flex flex-col sm:flex-row gap-3">
//           <Link href="/products" className="btn-secondary flex-1 text-center">
//             Lanjut Belanja
//           </Link>
//           <Link href="/" className="btn-primary flex-1 text-center">
//             Kembali ke Beranda
//           </Link>
//         </div>

//         {/* Important Information */}
//         <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-text-body">
//           <p className="font-semibold mb-2 flex items-center gap-2">
//             <AlertCircle size={16} />
//             Informasi Penting:
//           </p>
//           <ul className="space-y-1 list-disc list-inside">
//             {order.paymentMethod === 'pay_at_store' ? (
//               <>
//                 <li>Lakukan pembayaran dan ambil barang maksimal 1x24 jam setelah pemesanan</li>
//                 <li>Pastikan membawa uang tunai atau kartu untuk pembayaran di toko</li>
//                 <li>Bawa kode pickup dan identitas diri saat ke toko</li>
//                 <li>
//                   Jika ada kendala, hubungi toko di{' '}
//                   <strong>{process.env.NEXT_PUBLIC_STORE_PHONE || '021-12345678'}</strong>
//                 </li>
//                 <li>Pembatalan pesanan hanya dapat dilakukan sebelum pembayaran</li>
//               </>
//             ) : (
//               <>
//                 <li>Barang dapat diambil maksimal 1x24 jam setelah pembayaran</li>
//                 <li>Pastikan membawa identitas diri saat pengambilan</li>
//                 <li>
//                   Jika ada kendala, hubungi toko di{' '}
//                   <strong>{process.env.NEXT_PUBLIC_STORE_PHONE || '021-12345678'}</strong>
//                 </li>
//                 <li>Pembatalan dan refund hanya dapat dilakukan di toko fisik</li>
//               </>
//             )}
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// }


import { redirect } from 'next/navigation';

export default function PaymentSuccessPage() {
  redirect('/404');
}