'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Download, Lock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { invoicesService } from '@/lib/invoices-service';
import { getApiErrorMessage } from '@/lib/api-client';
import { UpgradeModal } from '@/components/clients/UpgradeModal';

interface ProdaExportButtonProps {
  planTier: 'TRIAL' | 'STARTER' | 'PRO';
  className?: string;
}

export const ProdaExportButton: React.FC<ProdaExportButtonProps> = ({
  planTier,
  className = '',
}) => {
  const isPro = planTier === 'PRO';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split('T')[0];

  const [from, setFrom] = useState(firstOfMonth);
  const [to, setTo] = useState(today);
  const [isExporting, setIsExporting] = useState(false);

  const handleClick = () => {
    if (!isPro) {
      setIsUpgradeModalOpen(true);
      return;
    }
    setIsModalOpen(true);
  };

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to) {
      toast.error('Select both From and To dates.');
      return;
    }
    setIsExporting(true);
    try {
      const blob = await invoicesService.prodaExport({ from, to });
      const filename = `proda-claims-${from}-${to}.csv`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('PRODA export downloaded.');
      setIsModalOpen(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to generate PRODA CSV export.'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Button
        variant="secondary"
        onClick={handleClick}
        title={!isPro ? 'PRODA CSV export is a Pro feature' : 'Export PRODA compatible CSV'}
        className={`flex items-center gap-2 ${className}`}
      >
        {isPro ? <Download size={15} /> : <Lock size={15} className="text-[#F59E0B]" />}
        <span>PRODA CSV Export</span>
        {!isPro && (
          <span className="ml-1 rounded bg-[#0D332D] px-1.5 py-0.5 text-[10px] font-bold text-[#5EE0C1]">
            PRO
          </span>
        )}
      </Button>

      {/* Date Range Modal */}
      {isPro && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="PRODA Direct Claims Export"
          description="Export an Australian Government PRODA-compliant CSV for bulk payment processing."
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
                disabled={isExporting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleExport}
                disabled={isExporting}
                className="bg-[#16A085] hover:bg-[#1DB89A] text-white flex items-center gap-1.5"
              >
                <Download size={14} />
                {isExporting ? 'Exporting…' : 'Download CSV'}
              </Button>
            </>
          }
        >
          <form onSubmit={handleExport} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="proda-from-date" className="text-caption text-text-secondary">
                  From Date
                </label>
                <input
                  id="proda-from-date"
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  required
                  className="w-full h-10 rounded-input border border-border bg-input px-3 text-body2 text-text-primary focus:border-brand focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="proda-to-date" className="text-caption text-text-secondary">
                  To Date
                </label>
                <input
                  id="proda-to-date"
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  required
                  className="w-full h-10 rounded-input border border-border bg-input px-3 text-body2 text-text-primary focus:border-brand focus:outline-none"
                />
              </div>
            </div>

            <p className="text-caption text-text-muted">
              The generated CSV includes participant NDIS numbers, support item codes, quantities, and claimed amounts formatted for Myplace portal upload.
            </p>
          </form>
        </Modal>
      )}

      {/* Upgrade Prompt Modal */}
      {!isPro && (
        <UpgradeModal
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
          title="PRODA Export is a Pro feature"
          description="Upgrade to the Pro plan ($44 AUD/mo) to unlock bulk PRODA CSV claims exports and unlimited participants."
        />
      )}
    </>
  );
};
