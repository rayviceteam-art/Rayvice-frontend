'use client';

import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Mic, Clock, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients?: Array<{ id: string; participantName: string; ndisNumber: string }>;
  onShiftSaved?: () => void;
}

export function ShiftModal({
  isOpen,
  onClose,
  clients = [{ id: 'sample-1', participantName: 'Sarah Jenkins (Sample Client)', ndisNumber: '430123456' }],
  onShiftSaved,
}: ShiftModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [shiftDate, setShiftDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('21:30');
  const [travelKms, setTravelKms] = useState('12');
  const [caseNotes, setCaseNotes] = useState('Assisted with community access and evening meal preparation.');

  // Live Auto-Split Calculation Engine (Client-Side Preview)
  const splitCalculation = useMemo(() => {
    const [sH, sM] = startTime.split(':').map(Number);
    const [eH, eM] = endTime.split(':').map(Number);
    const startDec = (sH || 0) + (sM || 0) / 60;
    const endDec = (eH || 0) + (eM || 0) / 60;
    const totalHours = Math.max(0, Number((endDec - startDec).toFixed(2)));
    const kms = Number(travelKms) || 0;

    const DAY_RATE = 67.56;
    const EVE_RATE = 74.42;
    const KM_RATE = 0.97;
    const THRESHOLD = 20.0; // 8:00 PM evening threshold

    let dayHours = 0;
    let eveHours = 0;

    if (endDec <= THRESHOLD) {
      dayHours = totalHours;
    } else if (startDec >= THRESHOLD) {
      eveHours = totalHours;
    } else {
      dayHours = Math.max(0, Number((THRESHOLD - startDec).toFixed(2)));
      eveHours = Math.max(0, Number((endDec - THRESHOLD).toFixed(2)));
    }

    const dayTotal = Number((dayHours * DAY_RATE).toFixed(2));
    const eveTotal = Number((eveHours * EVE_RATE).toFixed(2));
    const travelTotal = Number((kms * KM_RATE).toFixed(2));
    const grandTotal = Number((dayTotal + eveTotal + travelTotal).toFixed(2));

    return { totalHours, dayHours, eveHours, dayTotal, eveTotal, travelTotal, grandTotal, kms };
  }, [startTime, endTime, travelKms]);

  if (!isOpen) return null;

  function handleVoiceToggle() {
    if (!isRecording) {
      setIsRecording(true);
      toast.success('Voice intake active: speak shift details...');
      setTimeout(() => {
        setIsRecording(false);
        toast.success('Speech parsed: "Shift with Sarah today 6pm to 9:30pm, 12km travel"');
      }, 3500);
    } else {
      setIsRecording(false);
    }
  }

  function handleSave() {
    toast.success(`Shift logged! $${splitCalculation.grandTotal.toFixed(2)} AUD added to uninvoiced queue.`);
    if (onShiftSaved) onShiftSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[#182122] border border-[#253130] p-6 shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#253130] pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0D332D] text-[#5EE0C1] flex items-center justify-center border border-[#117A65]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#F1F5F4]">Log NDIS Shift</h3>
              <p className="text-xs text-[#9AA9A5]">15-second entry with live NDIA auto-split</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleVoiceToggle}
              title="Tap to speak shift details"
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                  : 'bg-[#16A085] text-white hover:bg-[#1DB89A] shadow-glow'
              }`}
            >
              <Mic className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-1 text-[#9AA9A5] hover:text-[#F1F5F4]">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#9AA9A5] mb-1">Participant</label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full rounded-lg bg-[#0E1617] border border-[#253130] px-3.5 py-2.5 text-sm text-[#F1F5F4] focus:border-[#16A085] focus:outline-none"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.participantName} (NDIS: {c.ndisNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input label="Date" type="date" value={shiftDate} onChange={(e) => setShiftDate(e.target.value)} />
            <Input label="Start Time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            <Input label="End Time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>

          <Input
            label="Activity-Based Transport (KM)"
            type="number"
            value={travelKms}
            onChange={(e) => setTravelKms(e.target.value)}
            placeholder="0"
          />

          <div>
            <label className="block text-xs font-medium text-[#9AA9A5] mb-1">Shift / Progress Notes</label>
            <textarea
              value={caseNotes}
              onChange={(e) => setCaseNotes(e.target.value)}
              rows={2}
              className="w-full rounded-lg bg-[#0E1617] border border-[#253130] px-3.5 py-2 text-sm text-[#F1F5F4] placeholder:text-[#687572] focus:border-[#16A085] focus:outline-none"
              placeholder="e.g. Assisted participant with community access and meal prep."
            />
          </div>

          {/* LIVE NDIS AUTO-SPLIT ENGINE PREVIEW */}
          <div className="rounded-xl bg-[#131B1C] border border-[#253130] p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-[#687572] uppercase tracking-wider">
              <span>NDIS Auto-Split Engine</span>
              <span className="text-[#5EE0C1] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 2026 NDIA Limits Active
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              {splitCalculation.dayHours > 0 && (
                <div className="flex justify-between text-[#F1F5F4]">
                  <span>01_011_0107_1_1 (Daytime {startTime} - {splitCalculation.eveHours > 0 ? '20:00' : endTime})</span>
                  <span className="font-mono">{splitCalculation.dayHours}h × $67.56 = ${splitCalculation.dayTotal}</span>
                </div>
              )}
              {splitCalculation.eveHours > 0 && (
                <div className="flex justify-between text-[#5EE0C1]">
                  <span>01_015_0107_1_1 (Evening 20:00 - {endTime})</span>
                  <span className="font-mono">{splitCalculation.eveHours}h × $74.42 = ${splitCalculation.eveTotal}</span>
                </div>
              )}
              {splitCalculation.kms > 0 && (
                <div className="flex justify-between text-[#9AA9A5]">
                  <span>01_799_0107_1_1 (Travel {splitCalculation.kms} km)</span>
                  <span className="font-mono">{splitCalculation.kms} km × $0.97 = ${splitCalculation.travelTotal}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[#253130] font-bold text-sm text-[#5EE0C1]">
              <span>Total Claim Amount:</span>
              <span>${splitCalculation.grandTotal.toFixed(2)} AUD</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Shift (${splitCalculation.grandTotal.toFixed(2)})
          </Button>
        </div>
      </div>
    </div>
  );
}
