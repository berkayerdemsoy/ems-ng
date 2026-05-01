import { Component, inject } from '@angular/core';
import { ErrorToastService, Toast } from './error-toast.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-error-toast',
  standalone: true,
  imports: [TranslatePipe],
  styles: [`
    @keyframes slideIn {
      from { transform: translateX(110%); opacity: 0; }
      to   { transform: translateX(0);   opacity: 1; }
    }
    @keyframes fadeScaleIn {
      from { opacity: 0; transform: scale(0.92) translateY(12px); }
      to   { opacity: 1; transform: scale(1)    translateY(0); }
    }
    .toast-item   { animation: slideIn     0.28s cubic-bezier(0.34,1.56,0.64,1) both; }
    .confirm-card { animation: fadeScaleIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both; }
  `],
  template: `
    <!-- ── Toast bildirimleri ── -->
    <div class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 w-[340px] pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="toast-item pointer-events-auto flex items-start gap-3 pl-4 pr-3 py-3.5 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border text-sm font-medium backdrop-blur-sm"
          [class]="toastClasses(toast)"
        >
          <span class="material-symbols-outlined mt-0.5 shrink-0" style="font-size:20px">{{ toastIcon(toast.type) }}</span>
          <span class="flex-1 leading-snug pt-0.5">{{ toast.message }}</span>
          <button (click)="toastService.dismiss(toast.id)"
            class="opacity-50 hover:opacity-100 transition-opacity text-current shrink-0 mt-0.5 leading-none"
            aria-label="Kapat">
            <span class="material-symbols-outlined" style="font-size:18px">close</span>
          </button>
        </div>
      }
    </div>

    <!-- ── Onay Dialogu ── -->
    @if (toastService.confirmDialog(); as dialog) {
      <div class="fixed inset-0 z-[10000] bg-black/40 backdrop-blur-[2px] flex items-center justify-center px-4"
           (click)="toastService.resolveConfirm(false)">
        <div class="confirm-card bg-surface rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.18)] border border-outline-variant/30 w-full max-w-sm p-7"
             (click)="$event.stopPropagation()">
          <div class="w-12 h-12 rounded-full bg-error-container/60 flex items-center justify-center mb-5">
            <span class="material-symbols-outlined text-error" style="font-size:26px">delete_forever</span>
          </div>
          <h3 class="text-lg font-semibold text-on-surface mb-1 leading-snug select-none">{{ 'confirm.title' | t }}</h3>
          <p class="text-sm text-on-surface-variant leading-relaxed mb-6 select-none">{{ dialog.message }}</p>
          <div class="flex gap-3">
            <button (click)="toastService.resolveConfirm(false)"
              class="flex-1 py-2.5 px-4 rounded-xl border border-outline-variant text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors select-none">
              {{ 'confirm.cancel' | t }}
            </button>
            <button (click)="toastService.resolveConfirm(true)"
              class="flex-1 py-2.5 px-4 rounded-xl bg-error text-on-error text-sm font-semibold hover:opacity-90 active:scale-95 transition-all select-none shadow-[0_4px_14px_rgba(186,26,26,0.3)]">
              {{ dialog.confirmLabel ?? ('confirm.delete' | t) }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ErrorToastComponent {
  readonly toastService = inject(ErrorToastService);

  toastClasses(toast: Toast): string {
    const map: Record<Toast['type'], string> = {
      success: 'bg-white text-green-800 border-green-200 border-l-4 border-l-green-500',
      error:   'bg-white text-red-800   border-red-200   border-l-4 border-l-red-500',
      info:    'bg-white text-blue-800  border-blue-200  border-l-4 border-l-blue-500',
    };
    return map[toast.type];
  }

  toastIcon(type: Toast['type']): string {
    const map: Record<Toast['type'], string> = {
      success: 'check_circle',
      error:   'error',
      info:    'info',
    };
    return map[type];
  }
}
