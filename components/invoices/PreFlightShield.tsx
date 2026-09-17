'use client';

import React from 'react';
import { ShieldCheck, AlertOctagon, AlertTriangle, Loader2 } from 'lucide-react';
import { formatAud } from '@/lib/format';

export interface PreFlightShieldProps {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  totalAmount: number;
  recipientEmail: string | null;
  agencyName: string | null;
  isChecking?: boolean;
}

export const PreFlightShield: React.FC<PreFlightShieldProps> = ({
  isValid,
  errors = [],
  warnings = [],
  totalAmount,
  recipientEmail,
  agencyName,
  isChecking = false,
}) => {
  if (isChecking) {
    return (
      <div
        className="rounded-card border border-[#117A65] bg-[#0D332D] p-4 mb-6 flex items-center gap-3 text-[#5EE0C1]"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="h-5 w-5 animate-spin shrink-0 text-[#5EE0C1]" />
        <span className="text-sm font-medium">Checking NDIS compliance…</span>
      </div>
    );
  }

  return (
    <div className="space-y-3 mb-6">
      {isValid && errors.length === 0 ? (
        <div
          className="rounded-card border border-[#166534] bg-[#0B2B1B] p-4"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-6 w-6 text-[#22C55E] shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1">
              <h4 className="text-sm font-semibold text-[#22C55E]">
                Auto-Rejection Shield: 100% NDIS Compliant
              </h4>
              <p className="text-xs text-[#9AA9A5]">
                All line items conform to official 2026 NDIA price caps. ABN, BSB, and 9-digit NDIS IDs
                verified. Ready for instant 48-hour payment.
              </p>
              {(agencyName || recipientEmail) && (
                <div className="font-mono text-xs text-[#22C55E]/90 pt-1">
                  Routing directly to: {agencyName || 'Participant Nominee'}{' '}
                  {recipientEmail ? `(${recipientEmail})` : ''} | Total: {formatAud(totalAmount)} AUD
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          className="rounded-card border border-[#991B1B] bg-[#2B1010] p-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-start gap-3">
            <AlertOctagon className="h-6 w-6 text-[#EF4444] shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <h4 className="text-sm font-semibold text-[#EF4444]">
                Invoice Dispatch Blocked (Rejection Prevention Active)
              </h4>
              {errors.length > 0 ? (
                <ul className="list-disc list-inside font-mono text-xs text-[#EF4444] space-y-1">
                  {errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              ) : (
                <p className="font-mono text-xs text-[#EF4444]">
                  Compliance verification failed. Please review participant, banking, and shift items.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {warnings && warnings.length > 0 && (
        <div className="rounded-card border border-[#92400E] bg-[#2A210B] p-3 text-[#F59E0B] flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-[#F59E0B]" />
          <div className="space-y-1 text-xs">
            <span className="font-semibold">Compliance Warnings:</span>
            <ul className="list-disc list-inside space-y-0.5">
              {warnings.map((warn, i) => (
                <li key={i}>{warn}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
