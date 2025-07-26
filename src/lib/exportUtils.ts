import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { TransactionReportData, InventoryReportData, CustomerReportData } from '@/types/reports';
import { formatCurrency, formatDate } from './utils';

export type ExportData = (TransactionReportData | InventoryReportData | CustomerReportData)[];
export type ExportType = 'transactions' | 'inventory' | 'customers';

interface ExportOptions {
  filename?: string;
  title?: string;
  subtitle?: string;
}


export const exportToPDF = async (
  data: ExportData,
  type: ExportType,
  options: ExportOptions = {}
) => {
  try {
    console.log('Starting PDF export...', { type, dataLength: data.length });

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    
    const title = options.title || getDefaultTitle(type);
    const subtitle = options.subtitle || `Diekspor pada ${formatDate(new Date())}`;

    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, 20, { align: 'center' });

    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, pageWidth / 2, 30, { align: 'center' });

    
    const { headers, rows } = prepareTableData(data, type);
    console.log('PDF table data prepared:', { headers, rowCount: rows.length });

    
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 40,
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [59, 130, 246], 
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { top: 40, right: 14, bottom: 20, left: 14 },
    });

    
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Halaman ${i} dari ${pageCount}`,
        pageWidth - 14,
        doc.internal.pageSize.height - 10,
        { align: 'right' }
      );
    }

    
    const filename = options.filename || `laporan-${type}-${Date.now()}.pdf`;
    console.log('Saving PDF:', filename);

    try {
      doc.save(filename);
      console.log('PDF export completed successfully');
    } catch (saveError) {
      console.warn('Direct PDF save failed, trying alternative method:', saveError);
      
      const pdfBlob = doc.output('blob');
      saveAs(pdfBlob, filename);
      console.log('PDF export completed using alternative method');
    }
  } catch (error) {
    console.error('PDF export failed:', error);
    throw new Error(`PDF export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};


export const exportToExcel = async (
  data: ExportData,
  type: ExportType,
  options: ExportOptions = {}
) => {
  try {
    console.log('Starting Excel export...', { type, dataLength: data.length });

    const { headers, rows } = prepareTableData(data, type);
    console.log('Excel table data prepared:', { headers, rowCount: rows.length });

    
    const wb = XLSX.utils.book_new();
    const wsData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    
    const colWidths = getColumnWidths(type);
    ws['!cols'] = colWidths;

    
    const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!ws[cellAddress]) continue;

      
      ws[cellAddress].s = {
        font: { bold: true },
        alignment: { horizontal: 'center' },
      };
    }

    
    const sheetName = getSheetName(type);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    
    console.log('Generating Excel buffer...');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    
    const filename = options.filename || `laporan-${type}-${Date.now()}.xlsx`;
    console.log('Saving Excel file:', filename);

    try {
      saveAs(blob, filename);
      console.log('Excel export completed successfully');
    } catch (saveError) {
      console.error('Excel file save failed:', saveError);
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      console.log('Excel export completed using fallback method');
    }
  } catch (error) {
    console.error('Excel export failed:', error);
    throw new Error(`Excel export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};


export const exportToCSV = async (
  data: ExportData,
  type: ExportType,
  options: ExportOptions = {}
) => {
  try {
    console.log('Starting CSV export...', { type, dataLength: data.length });

    const { headers, rows } = prepareTableData(data, type);
    console.log('CSV table data prepared:', { headers, rowCount: rows.length });

    
    const csvContent = [
      headers.map(header => `"${String(header).replace(/"/g, '""')}"`).join(','),
      ...rows.map(row =>
        row.map(cell => {
          const cellValue = cell === null || cell === undefined ? '' : String(cell);
          return `"${cellValue.replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    console.log('CSV content generated, length:', csvContent.length);

    
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;

    
    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
    const filename = options.filename || `laporan-${type}-${Date.now()}.csv`;
    console.log('Saving CSV file:', filename);

    try {
      saveAs(blob, filename);
      console.log('CSV export completed successfully');
    } catch (saveError) {
      console.error('CSV file save failed:', saveError);
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      console.log('CSV export completed using fallback method');
    }
  } catch (error) {
    console.error('CSV export failed:', error);
    throw new Error(`CSV export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};


const getDefaultTitle = (type: ExportType): string => {
  switch (type) {
    case 'transactions':
      return 'Laporan Transaksi';
    case 'inventory':
      return 'Laporan Inventori';
    case 'customers':
      return 'Laporan Pelanggan';
    default:
      return 'Laporan Data';
  }
};

const prepareTableData = (data: ExportData, type: ExportType) => {
  switch (type) {
    case 'transactions':
      return prepareTransactionData(data as TransactionReportData[]);
    case 'inventory':
      return prepareInventoryData(data as InventoryReportData[]);
    case 'customers':
      return prepareCustomerData(data as CustomerReportData[]);
    default:
      return { headers: [], rows: [] };
  }
};

const prepareTransactionData = (data: TransactionReportData[]) => {
  const headers = [
    'No. Transaksi',
    'Tanggal',
    'Pelanggan',
    'Total',
    'Metode Pembayaran',
    'Status'
  ];

  const rows = data.map(transaction => {
    try {
      return [
        transaction.transactionNumber || '-',
        formatDate(transaction.date),
        transaction.customerName || 'Guest',
        formatCurrency(transaction.total || 0),
        transaction.paymentMethod || '-',
        transaction.status || '-'
      ];
    } catch (error) {
      console.warn('Error processing transaction data:', transaction, error);
      return [
        transaction.transactionNumber || '-',
        '-',
        transaction.customerName || 'Guest',
        'Rp 0',
        transaction.paymentMethod || '-',
        transaction.status || '-'
      ];
    }
  });

  return { headers, rows };
};

const prepareInventoryData = (data: InventoryReportData[]) => {
  const headers = [
    'Nama Produk',
    'SKU',
    'Kategori',
    'Stok Saat Ini',
    'Nilai',
    'Status'
  ];

  const rows = data.map(item => {
    try {
      return [
        item.name || '-',
        item.sku || '-',
        item.category || '-',
        (item.currentStock ?? 0).toString(),
        formatCurrency(item.value || 0),
        item.status || '-'
      ];
    } catch (error) {
      console.warn('Error processing inventory data:', item, error);
      return [
        item.name || '-',
        item.sku || '-',
        item.category || '-',
        '0',
        'Rp 0',
        item.status || '-'
      ];
    }
  });

  return { headers, rows };
};

const prepareCustomerData = (data: CustomerReportData[]) => {
  const headers = [
    'Nama',
    'Email',
    'Telepon',
    'Total Order',
    'Total Belanja',
    'Status'
  ];

  const rows = data.map(customer => {
    try {
      return [
        customer.name || '-',
        customer.email || '-',
        customer.phone || '-',
        (customer.totalOrders ?? 0).toString(),
        formatCurrency(customer.totalSpent || 0),
        customer.status || '-'
      ];
    } catch (error) {
      console.warn('Error processing customer data:', customer, error);
      return [
        customer.name || '-',
        '-',
        '-',
        '0',
        'Rp 0',
        customer.status || '-'
      ];
    }
  });

  return { headers, rows };
};

const getColumnWidths = (type: ExportType) => {
  switch (type) {
    case 'transactions':
      return [
        { wch: 20 }, 
        { wch: 15 }, 
        { wch: 20 }, 
        { wch: 15 }, 
        { wch: 18 }, 
        { wch: 12 }, 
      ];
    case 'inventory':
      return [
        { wch: 25 }, 
        { wch: 15 }, 
        { wch: 15 }, 
        { wch: 12 }, 
        { wch: 15 }, 
        { wch: 12 }, 
      ];
    case 'customers':
      return [
        { wch: 20 }, 
        { wch: 25 }, 
        { wch: 15 }, 
        { wch: 12 }, 
        { wch: 15 }, 
        { wch: 12 }, 
      ];
    default:
      return [];
  }
};

const getSheetName = (type: ExportType): string => {
  switch (type) {
    case 'transactions':
      return 'Transaksi';
    case 'inventory':
      return 'Inventori';
    case 'customers':
      return 'Pelanggan';
    default:
      return 'Data';
  }
};
