import { Suspense } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Skeleton } from '@/components/ui';
import NewShiftContent from './NewShiftContent';

// Server wrapper: useSearchParams() inside NewShiftContent needs a Suspense
// boundary, otherwise `next build` fails prerendering /shifts/new.
export default function NewShiftPage() {
  return (
    <Suspense
      fallback={
        <AppLayout title="Log a shift" subtitle="15-second entry with live NDIA auto-split">
          <Skeleton className="h-64 w-full" />
        </AppLayout>
      }
    >
      <NewShiftContent />
    </Suspense>
  );
}
