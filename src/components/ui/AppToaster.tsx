'use client';

import { ToastBar, Toaster, toast } from 'react-hot-toast';

export default function AppToaster() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
        },
      }}>
      {(t) => (
        <div
          role="button"
          tabIndex={0}
          onClick={() => toast.dismiss(t.id)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              toast.dismiss(t.id);
            }
          }}
          style={{ cursor: 'pointer' }}>
          <ToastBar toast={t} />
        </div>
      )}
    </Toaster>
  );
}
