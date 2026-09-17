'use client';

import React, { useEffect, useState } from 'react';
import { Download, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { invoicesService } from '@/lib/invoices-service';
import { getApiErrorMessage } from '@/lib/api-client';

interface InvoicePDFViewerProps {
  invoiceId: string;
  invoiceNumber: string;
  className?: string;
}

export const InvoicePDFViewer: React.FC<InvoicePDFViewerProps> = ({
  invoiceId,
  invoiceNumber,
  className = '',
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadPdf = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const blob = await invoicesService.fetchPdfBlob(invoiceId);
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to load the PDF.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPdf();

    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId]);

  const handleDownload = () => {
    if (!blobUrl) return;
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `Invoice-${invoiceNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className={`rounded-card border border-border bg-surface overflow-hidden flex flex-col ${className}`}
      aria-live="polite"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border bg-elevated px-4 py-3">
        <span className="font-mono text-xs text-text-secondary">
          Tax Invoice: <strong className="text-text-primary">{invoiceNumber}</strong>
        </span>
        {blobUrl && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownload}
            className="flex items-center gap-1.5 text-xs h-8"
          >
            <Download size={14} />
            Download PDF
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="relative min-h-[500px] h-[70vh] w-full flex items-center justify-center bg-[#080B0D]">
        {isLoading && (
          <div className="flex flex-col items-center gap-3 p-8 text-center text-text-secondary">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
            <p className="text-body2">Generating PDF preview…</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="flex flex-col items-center gap-3 p-8 text-center max-w-sm">
            <AlertCircle className="h-10 w-10 text-[#EF4444]" />
            <h4 className="text-body1 font-semibold text-text-primary">Unable to load the PDF</h4>
            <p className="text-caption text-text-secondary">{error}</p>
            <Button variant="secondary" size="sm" onClick={loadPdf} className="mt-2">
              <RefreshCw size={14} />
              Retry
            </Button>
          </div>
        )}

        {blobUrl && !isLoading && !error && (
          <object
            data={blobUrl}
            type="application/pdf"
            className="w-full h-full"
            aria-label={`PDF preview for invoice ${invoiceNumber}`}
          >
            <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
              <p className="text-body2 text-text-secondary max-w-md">
                Your browser or mobile device does not support inline PDF viewing. You can download the file to view it.
              </p>
              <Button variant="primary" onClick={handleDownload} className="flex items-center gap-2">
                <Download size={16} />
                Download PDF
              </Button>
            </div>
          </object>
        )}
      </div>
    </div>
  );
};
