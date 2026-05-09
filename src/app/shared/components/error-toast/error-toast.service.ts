import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface ConfirmDialog {
  message: string;
  detail?: string;
  confirmLabel?: string;
  resolve: (val: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ErrorToastService {
  private idCounter = 0;
  readonly toasts = signal<Toast[]>([]);
  readonly confirmDialog = signal<ConfirmDialog | null>(null);

  show(message: string, type: Toast['type'] = 'info'): void {
    const id = ++this.idCounter;
    this.toasts.update(list => [...list, { id, message, type }]);
    setTimeout(() => this.dismiss(id), 4000);
  }

  dismiss(id: number): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  /** Kullanıcıdan onaya ihtiyaç duyulduğunda çağırılır. Promise<boolean> döner. */
  confirm(message: string, detail?: string, confirmLabel?: string): Promise<boolean> {
    return new Promise(resolve => {
      this.confirmDialog.set({ message, detail, confirmLabel, resolve });
    });
  }

  resolveConfirm(val: boolean): void {
    const dialog = this.confirmDialog();
    if (dialog) {
      dialog.resolve(val);
      this.confirmDialog.set(null);
    }
  }
}
