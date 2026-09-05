'use client';

import toast from 'react-hot-toast';

export type ToastVariant = 'success' | 'error';

export function useToast() {
  return {
    showToast: (message: string, variant: ToastVariant = 'success') => {
      if (variant === 'error') {
        toast.error(message);
      } else {
        toast.success(message);
      }
    },
  };
}
