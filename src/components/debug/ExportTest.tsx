"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { exportToPDF, exportToExcel, exportToCSV } from "@/lib/exportUtils";


const testData = [
  {
    id: "1",
    transactionNumber: "TRX001",
    date: "2024-01-15T10:30:00Z",
    customerName: "John Doe",
    items: 3,
    subtotal: 150000,
    tax: 15000,
    discount: 5000,
    total: 160000,
    paymentMethod: "Tunai",
    status: "COMPLETED",
  },
  {
    id: "2",
    transactionNumber: "TRX002",
    date: "2024-01-16T14:45:00Z",
    customerName: "Jane Smith",
    items: 2,
    subtotal: 200000,
    tax: 20000,
    discount: 0,
    total: 220000,
    paymentMethod: "Kartu Kredit",
    status: "COMPLETED",
  },
];

export default function ExportTest() {
  const [isExporting, setIsExporting] = useState(false);
  const [lastExport, setLastExport] = useState<string | null>(null);

  const testExport = async (format: 'pdf' | 'excel' | 'csv') => {
    setIsExporting(true);
    setLastExport(null);

    try {
      console.log(`Testing ${format} export...`);
      
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `test-export-${format}-${timestamp}`;

      switch (format) {
        case 'pdf':
          await exportToPDF(testData, 'transactions', {
            filename: `${filename}.pdf`,
            title: 'Test PDF Export',
            subtitle: 'Testing PDF export functionality',
          });
          break;
        case 'excel':
          await exportToExcel(testData, 'transactions', {
            filename: `${filename}.xlsx`,
          });
          break;
        case 'csv':
          await exportToCSV(testData, 'transactions', {
            filename: `${filename}.csv`,
          });
          break;
      }

      setLastExport(`${format.toUpperCase()} export successful!`);
      console.log(`${format} export completed successfully`);
    } catch (error) {
      console.error(`${format} export failed:`, error);
      setLastExport(`${format.toUpperCase()} export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Export Functionality Test</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <Button
            onClick={() => testExport('pdf')}
            disabled={isExporting}
            variant="outline"
            className="w-full"
          >
            {isExporting ? 'Exporting...' : 'Test PDF'}
          </Button>
          
          <Button
            onClick={() => testExport('excel')}
            disabled={isExporting}
            variant="outline"
            className="w-full"
          >
            {isExporting ? 'Exporting...' : 'Test Excel'}
          </Button>
          
          <Button
            onClick={() => testExport('csv')}
            disabled={isExporting}
            variant="outline"
            className="w-full"
          >
            {isExporting ? 'Exporting...' : 'Test CSV'}
          </Button>
        </div>

        {lastExport && (
          <div className={`p-3 rounded-md ${
            lastExport.includes('failed') 
              ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
          }`}>
            {lastExport}
          </div>
        )}

        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p><strong>Test Data:</strong> {testData.length} transactions</p>
          <p><strong>Instructions:</strong> Click buttons to test export functionality. Check browser downloads and console for results.</p>
        </div>
      </div>
    </div>
  );
}
