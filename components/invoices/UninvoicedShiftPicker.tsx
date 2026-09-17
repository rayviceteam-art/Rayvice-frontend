'use client';

import React from 'react';
import { Clock, Calendar, Car } from 'lucide-react';
import { UninvoicedShift } from '@/lib/types';
import { formatAud, formatCalendarDate } from '@/lib/format';

interface UninvoicedShiftPickerProps {
  shifts: UninvoicedShift[];
  selectedShiftIds: string[];
  onToggleShift: (shiftId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  isLoading?: boolean;
}

export const UninvoicedShiftPicker: React.FC<UninvoicedShiftPickerProps> = ({
  shifts = [],
  selectedShiftIds = [],
  onToggleShift,
  onSelectAll,
  onDeselectAll,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="rounded-card border border-border bg-surface p-6 space-y-3">
        <div className="h-5 bg-elevated rounded w-48 animate-pulse" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-elevated/60 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (shifts.length === 0) {
    return (
      <div className="rounded-card border border-border bg-surface p-8 text-center space-y-2">
        <Clock className="h-8 w-8 text-text-muted mx-auto" />
        <p className="text-body2 text-text-secondary font-medium">
          No uninvoiced shifts for this participant.
        </p>
        <p className="text-caption text-text-muted">
          Log shifts for this participant first to generate an invoice.
        </p>
      </div>
    );
  }

  const allSelected = shifts.length > 0 && selectedShiftIds.length === shifts.length;

  return (
    <div className="rounded-card border border-border bg-surface overflow-hidden">
      {/* Header with Select All */}
      <div className="flex items-center justify-between border-b border-border bg-elevated px-4 py-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="select-all-shifts"
            checked={allSelected}
            onChange={(e) => {
              if (e.target.checked) {
                onSelectAll();
              } else {
                onDeselectAll();
              }
            }}
            className="h-4 w-4 rounded border-border bg-input text-brand focus:ring-brand focus:ring-offset-0 cursor-pointer"
          />
          <label htmlFor="select-all-shifts" className="text-caption font-medium text-text-primary cursor-pointer select-none">
            {allSelected ? 'Deselect All Shifts' : 'Select All Shifts'} ({selectedShiftIds.length} of {shifts.length} selected)
          </label>
        </div>
      </div>

      {/* Shifts List */}
      <div className="divide-y divide-border">
        {shifts.map((shift) => {
          const isChecked = selectedShiftIds.includes(shift.id);
          return (
            <label
              key={shift.id}
              htmlFor={`shift-checkbox-${shift.id}`}
              className={`flex items-center justify-between p-4 cursor-pointer transition-colors select-none ${
                isChecked ? 'bg-[#0D332D]/30 hover:bg-[#0D332D]/40' : 'hover:bg-elevated/50'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <input
                  type="checkbox"
                  id={`shift-checkbox-${shift.id}`}
                  checked={isChecked}
                  onChange={() => onToggleShift(shift.id)}
                  className="h-4 w-4 rounded border-border bg-input text-brand focus:ring-brand focus:ring-offset-0 cursor-pointer"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-text-secondary" />
                    <span className="text-body2 font-medium text-text-primary">
                      {formatCalendarDate(shift.shiftDate)}
                    </span>
                    <span className="text-caption text-text-muted">
                      ({shift.startTime} – {shift.endTime})
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-caption text-text-secondary">
                    <span>{shift.totalHours} hrs</span>
                    {shift.travelKms > 0 && (
                      <span className="flex items-center gap-1">
                        <Car className="h-3 w-3" /> {shift.travelKms} km
                      </span>
                    )}
                    {shift.supportItemCode && (
                      <span className="font-mono text-text-muted">
                        Item: {shift.supportItemCode}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono text-sm font-bold text-text-primary">
                  {formatAud(shift.grandTotal)}
                </span>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};
