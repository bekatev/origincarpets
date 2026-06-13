import { Suspense } from 'react';
import { ResetPasswordContent } from './reset-password-content';

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="oc-section">
          <div className="oc-container max-w-md text-sm text-[var(--oc-muted)]">Loading...</div>
        </main>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
