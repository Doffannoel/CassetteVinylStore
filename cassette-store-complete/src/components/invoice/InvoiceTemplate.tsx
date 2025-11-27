import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.5,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    alignItems: 'flex-start',
    borderBottomWidth: 2,
    borderBottomColor: '#eeeeee',
    paddingBottom: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  companyInfo: {
    textAlign: 'right',
    fontSize: 10,
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#555',
  },
  subheading: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  text: {
    fontSize: 10,
    marginBottom: 2,
  },
  address: {
    fontSize: 10,
    marginBottom: 2,
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f2f2f2',
    padding: 8,
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 8,
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  tableCell: {
    fontSize: 9,
  },
  totalSection: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#bfbfbf',
    paddingTop: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '30%',
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#555',
  },
  totalValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
  },
  grandTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    borderTopWidth: 1,
    borderTopColor: '#bfbfbf',
    paddingTop: 5,
    marginTop: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 9,
    color: 'grey',
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
    paddingTop: 10,
  },
});

const InvoiceTemplate = ({ order }: { order: any }) => {
  if (!order) {
    console.error('InvoiceTemplate received null or undefined order prop.');
    return null;
  }

  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            {/* Placeholder for Hysteria Music Logo */}
            {/* If you have a logo image, replace the Text with <Image src="path/to/logo.png" style={styles.logo} /> */}
            <Text style={styles.companyName}>Hysteria Music</Text>
          </View>
          <View style={styles.companyInfo}>
            <Text>Hysteria Music Store</Text>
            <Text>
              Blok M Square, Jalan Melawai 5, RT.3/RW.1, Kuningan, Melawai, Kec. Kby. Baru
            </Text>
            <Text>Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12150</Text>
            <Text>Email: musichisteria@gmail.com</Text>
            <Text>Phone: +62818908186</Text>
          </View>
        </View>

        <Text style={styles.invoiceTitle}>INVOICE</Text>

        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={styles.subheading}>BILL TO:</Text>
              <Text style={styles.text}>{order.customerName}</Text>
              <Text style={styles.text}>{order.customerEmail}</Text>
              {order.shippingAddress && (
                <>
                  <Text style={styles.address}>{order.shippingAddress.street}</Text>
                  <Text style={styles.address}>
                    {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                  </Text>
                  <Text style={styles.address}>{order.shippingAddress.country}</Text>
                </>
              )}
            </View>
            <View style={{ textAlign: 'right' }}>
              <Text style={styles.subheading}>INVOICE #:</Text>
              <Text style={styles.text}>{order.orderId}</Text>
              <Text style={styles.subheading}>INVOICE DATE:</Text>
              <Text style={styles.text}>{invoiceDate}</Text>
              {order.pickupCode && (
                <>
                  <Text style={styles.subheading}>PICKUP CODE:</Text>
                  <Text style={styles.text}>{order.pickupCode}</Text>
                </>
              )}
              {/* <Text style={styles.subheading}>DUE DATE:</Text>
              <Text style={styles.text}>[Due Date]</Text> */}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Order Details</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Product</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Quantity</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Price</Text>
              </View>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Total</Text>
              </View>
            </View>
            {order.products.map((product: any) => (
              <View style={styles.tableRow} key={product.productId}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{product.name}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{product.quantity}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>Rp {product.price.toLocaleString()}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>
                    Rp {(product.quantity * product.price).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>Rp {order.totalAmount.toLocaleString()}</Text>
          </View>
          {/* Add tax, shipping, etc. if applicable */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Grand Total:</Text>
            <Text style={styles.grandTotal}>Rp {order.totalAmount.toLocaleString()}</Text>
          </View>
        </View>
        <Text style={styles.footer}>
          Thank you for your purchase from Hysteria Music!
          <Text> Visit us at www.hysteriamusic.com</Text>
        </Text>
      </Page>
    </Document>
  );
};

export default InvoiceTemplate;
