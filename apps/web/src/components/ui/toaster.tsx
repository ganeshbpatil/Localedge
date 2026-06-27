'use client';

// Minimal toaster component - in production use shadcn/ui Toaster
export function Toaster() {
  return <div id="toast-portal" className="fixed bottom-4 right-4 z-50 space-y-2" />;
}

export function toast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  const portal = document.getElementById('toast-portal');
  if (!portal) return;

  const el = document.createElement('div');
  const colors = {
    success: 'bg-green-500',
    error: 'bg-destructive',
    info: 'bg-primary',
  };

  el.className = `${colors[type]} text-white px-4 py-3 rounded-lg text-sm shadow-lg max-w-sm`;
  el.textContent = message;
  portal.appendChild(el);

  setTimeout(() => {
    el.remove();
  }, 4000);
}
