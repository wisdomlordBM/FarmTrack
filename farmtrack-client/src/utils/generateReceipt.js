import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';

const formatCurrency = (amount) =>
  `NGN ${parseFloat(amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });

const formatReceiptNo = (prefix, id) => `${prefix}${String(id).padStart(6, '0')}`;

const slugify = (text) =>
  (text || 'farm')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/g, '') || 'farm';

const loadImageAsBase64 = async (url) => {
  if (!url) return null;
  if (url.startsWith('data:')) return url;
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

const addHeader = (doc, title, farmProfile, logoBase64) => {
  doc.setFillColor(22, 163, 74);
  doc.rect(0, 0, 210, 45, 'F');

  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', 12, 8, 22, 22);
    } catch {
      doc.setFontSize(28);
      doc.setTextColor(255, 255, 255);
      doc.text('🐔', 15, 24);
    }
  } else {
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.text('🐔', 15, 24);
  }

  const farmName = farmProfile.farmName || 'Poultry Farm';
  const maxNameWidth = 100; // keeps the farm name from colliding with the title on the right

  // Auto-shrink long farm names so they wrap cleanly instead of overlapping the title
  let nameFontSize = 17;
  if (farmName.length > 24) nameFontSize = 14;
  if (farmName.length > 36) nameFontSize = 11;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(nameFontSize);
  const nameLines = doc.splitTextToSize(farmName, maxNameWidth).slice(0, 2);
  const lineHeight = nameFontSize * 0.42;
  nameLines.forEach((line, idx) => doc.text(line, 40, 15 + idx * lineHeight));

  const infoY = 15 + nameLines.length * lineHeight + 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const contactLine = [farmProfile.phone, farmProfile.email].filter(Boolean).join('   |   ');
  if (contactLine) doc.text(contactLine, 40, infoY);
  if (farmProfile.address) doc.text(farmProfile.address, 40, infoY + 6);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 195, 14, { align: 'right' });

  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.line(15, 43, 195, 43);
};

const addFooter = async (doc, verifyUrl) => {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  doc.setFillColor(248, 250, 252);
  doc.rect(0, pageHeight - 34, pageWidth, 34, 'F');

  try {
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 200, margin: 1 });
    doc.addImage(qrDataUrl, 'PNG', pageWidth - 38, pageHeight - 32, 24, 24);
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text('Scan to verify', pageWidth - 26, pageHeight - 5, { align: 'center' });
  } catch {
    // QR generation failed — receipt still works without it
  }

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for your business!', 15, pageHeight - 20);
  doc.text(`Generated: ${new Date().toLocaleString('en-NG')}`, 15, pageHeight - 13);
  doc.text('Powered by FarmTrack', 15, pageHeight - 6);
};

const addReceiptInfo = (doc, receiptNo, date, customerName, customerPhone) => {
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);

  doc.setFillColor(240, 253, 244);
  doc.roundedRect(15, 52, 85, 28, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 163, 74);
  doc.text('RECEIPT DETAILS', 20, 60);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(`Receipt No: ${receiptNo}`, 20, 67);
  doc.text(`Date: ${formatDate(date)}`, 20, 73);

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(110, 52, 85, 28, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('CUSTOMER', 115, 60);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(customerName, 115, 67);
  if (customerPhone) doc.text(`Tel: ${customerPhone}`, 115, 73);
};

const addStatusBadge = (doc, status, y) => {
  doc.setFillColor(
    status === 'Paid' ? 22 : status === 'Partial' ? 245 : 239,
    status === 'Paid' ? 163 : status === 'Partial' ? 158 : 68,
    status === 'Paid' ? 74 : status === 'Partial' ? 11 : 68
  );
  doc.roundedRect(15, y, 55, 12, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(`Payment: ${status}`, 42, y + 8, { align: 'center' });
};

// ── EGG SALE RECEIPT ──
export const generateEggSaleReceipt = async (sale, farmProfile = {}) => {
  const doc = new jsPDF();
  const logoBase64 = await loadImageAsBase64(farmProfile.logoUrl);
  const receiptNo = formatReceiptNo('EG', sale.id);

  addHeader(doc, 'EGG SALE RECEIPT', farmProfile, logoBase64);
  addReceiptInfo(doc, receiptNo, sale.saleDate, sale.customerName, sale.customerPhone);

  autoTable(doc, {
    startY: 88,
    head: [['Description', 'Qty (Crates)', 'Price/Crate', 'Amount']],
    body: [[
      'Fresh Eggs',
      sale.cratesSold,
      formatCurrency(sale.pricePerCrate),
      formatCurrency(sale.cratesSold * sale.pricePerCrate)
    ]],
    foot: [
      ['', '', 'Total', formatCurrency(sale.cratesSold * sale.pricePerCrate)],
      ['', '', 'Amount Paid', formatCurrency(sale.amountPaid)],
      ['', '', 'Balance Due', formatCurrency((sale.cratesSold * sale.pricePerCrate) - sale.amountPaid)],
    ],
    headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold', fontSize: 10 },
    footStyles: { fillColor: [240, 253, 244], textColor: [30, 41, 59], fontStyle: 'bold' },
    bodyStyles: { fontSize: 10 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 15, right: 15 },
  });

  const finalY = doc.lastAutoTable.finalY + 10;
  addStatusBadge(doc, sale.paymentStatus, finalY);

  if (farmProfile.notes) {
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'italic');
    doc.text(`Note: ${farmProfile.notes}`, 15, finalY + 25);
  }

  const farmSlug = slugify(farmProfile.farmName);
  const verifyUrl = `${window.location.origin}/verify/${farmSlug}/sale/${sale.id}`;
  await addFooter(doc, verifyUrl);

  return doc;
};

// ── BIRD SALE RECEIPT ──
export const generateBirdSaleReceipt = async (sale, farmProfile = {}) => {
  const doc = new jsPDF();
  const logoBase64 = await loadImageAsBase64(farmProfile.logoUrl);
  const receiptNo = formatReceiptNo('BS', sale.id);

  addHeader(doc, 'BIRD SALE RECEIPT', farmProfile, logoBase64);
  addReceiptInfo(doc, receiptNo, sale.saleDate, sale.customerName, sale.customerPhone);

  autoTable(doc, {
    startY: 88,
    head: [['Description', 'Qty (Birds)', 'Price/Bird', 'Amount']],
    body: [[
      `${sale.reason} — ${sale.flockName}`,
      sale.numberOfBirds,
      formatCurrency(sale.pricePerBird),
      formatCurrency(sale.totalAmount)
    ]],
    foot: [
      ['', '', 'Total', formatCurrency(sale.totalAmount)],
      ['', '', 'Amount Paid', formatCurrency(sale.amountPaid)],
      ['', '', 'Balance Due', formatCurrency(sale.balance)],
    ],
    headStyles: { fillColor: [234, 88, 12], textColor: 255, fontStyle: 'bold', fontSize: 10 },
    footStyles: { fillColor: [255, 247, 237], textColor: [30, 41, 59], fontStyle: 'bold' },
    bodyStyles: { fontSize: 10 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 15, right: 15 },
  });

  const finalY = doc.lastAutoTable.finalY + 10;
  addStatusBadge(doc, sale.paymentStatus, finalY);

  if (farmProfile.notes) {
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'italic');
    doc.text(`Note: ${farmProfile.notes}`, 15, finalY + 25);
  }

  const farmSlug = slugify(farmProfile.farmName);
  const verifyUrl = `${window.location.origin}/verify/${farmSlug}/birdsale/${sale.id}`;
  await addFooter(doc, verifyUrl);

  return doc;
};

// ── MANURE SALE RECEIPT ──
export const generateManureSaleReceipt = async (sale, farmProfile = {}) => {
  const doc = new jsPDF();
  const logoBase64 = await loadImageAsBase64(farmProfile.logoUrl);
  const receiptNo = formatReceiptNo('MN', sale.id);

  addHeader(doc, 'MANURE SALE RECEIPT', farmProfile, logoBase64);
  addReceiptInfo(doc, receiptNo, sale.saleDate, sale.customerName, sale.customerPhone);

  autoTable(doc, {
    startY: 88,
    head: [['Description', 'Qty (Bags)', 'Price/Bag', 'Amount']],
    body: [[
      'Poultry Manure',
      sale.numberOfBags,
      formatCurrency(sale.pricePerBag),
      formatCurrency(sale.totalAmount)
    ]],
    foot: [
      ['', '', 'Total', formatCurrency(sale.totalAmount)],
      ['', '', 'Amount Paid', formatCurrency(sale.amountPaid)],
      ['', '', 'Balance Due', formatCurrency(sale.balance)],
    ],
    headStyles: { fillColor: [101, 163, 13], textColor: 255, fontStyle: 'bold', fontSize: 10 },
    footStyles: { fillColor: [247, 254, 231], textColor: [30, 41, 59], fontStyle: 'bold' },
    bodyStyles: { fontSize: 10 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 15, right: 15 },
  });

  const finalY = doc.lastAutoTable.finalY + 10;
  addStatusBadge(doc, sale.paymentStatus, finalY);

  if (farmProfile.notes) {
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'italic');
    doc.text(`Note: ${farmProfile.notes}`, 15, finalY + 25);
  }

  const farmSlug = slugify(farmProfile.farmName);
  const verifyUrl = `${window.location.origin}/verify/${farmSlug}/manuresale/${sale.id}`;
  await addFooter(doc, verifyUrl);

  return doc;
};