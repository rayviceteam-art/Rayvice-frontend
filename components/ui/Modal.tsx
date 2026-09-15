'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  // MODULE 4 (additive): explicit Tailwind width class (e.g. "max-w-sm").
  // When provided it wins over `maxWidth`.
  panelClassName?: string;
  // Full-screen sheet on phones (Log NDIS Shift): the panel fills the whole
  // viewport on mobile and stays a centered dialog on sm+ screens. Defaults
  // to false so every other modal renders exactly as before.
  flushOnMobile?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'lg',
  panelClassName,
  flushOnMobile = false,
}) => {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  const widthClass = panelClassName ?? maxWidthClasses[maxWidth];
  // MODULE 4: title-less modals (custom in-body header) render no chrome
  // header — all existing callers pass `title`, so they are unaffected.
  const showHeader = Boolean(title || description);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${flushOnMobile ? 'p-0 sm:p-4' : 'p-4'}`}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full ${widthClass} ${
          flushOnMobile
            ? // MODULE 4: full-screen sheet on phones. The panel itself must NOT
              // pad — the in-body header (px-4 py-3) and the form (p-4) own their
              // padding, and the form's sticky footer relies on sitting flush
              // against the panel edge. Desktop keeps the original dialog look.
              'h-[100dvh] max-h-none overflow-y-auto rounded-none p-0 sm:h-auto sm:max-h-[calc(100vh-2rem)] sm:rounded-2xl sm:p-6'
            : 'max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl p-6'
        } border border-[#253130] bg-[#182122] shadow-2xl animate-in zoom-in-95 duration-150 text-[#F1F5F4] z-10`}
      >
        {showHeader && (
        <div className="flex items-start justify-between border-b border-[#253130] pb-4 mb-5">
          <div>
            {title && <h3 className="text-lg font-bold tracking-tight text-[#F1F5F4]">{title}</h3>}
            {description && <p className="text-xs text-[#9AA9A5] mt-1">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#9AA9A5] hover:bg-[#131B1C] hover:text-[#F1F5F4] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        )}

        {children}
        {footer && <div className="mt-5 flex items-center justify-end gap-3 border-t border-[#253130] pt-4">{footer}</div>}
      </div>
    </div>
  );
};
