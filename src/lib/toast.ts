// Toast Notification Service
export interface Toast {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'favorite' | 'remove' | 'copied';
  duration?: number;
}

type ToastListener = (toasts: Toast[]) => void;

let toasts: Toast[] = [];
let listeners: ToastListener[] = [];

function notify() {
  listeners.forEach((listener) => listener([...toasts]));
}

export function showToast(toast: Omit<Toast, 'id'>): string {
  const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const newToast: Toast = {
    ...toast,
    id,
    duration: toast.duration ?? 3000,
  };

  // Keep max 4 toasts
  toasts = [newToast, ...toasts].slice(0, 4);
  notify();

  if (newToast.duration && newToast.duration > 0) {
    setTimeout(() => {
      dismissToast(id);
    }, newToast.duration);
  }

  return id;
}

export function dismissToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  notify();
}

export function subscribeToasts(listener: ToastListener): () => void {
  listeners.push(listener);
  listener([...toasts]);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}
