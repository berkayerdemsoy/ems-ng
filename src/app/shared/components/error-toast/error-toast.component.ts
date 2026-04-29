import { Component, inject } from '@angular/core';
import { ErrorToastService, Toast } from './error-toast.service';

@Component({
  selector: 'app-error-toast',
  standalone: true,
  template: `
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="flex items-start gap-3 p-4 rounded-lg shadow-lg text-sm font-medium transition-all"
          [class]="toastClasses(toast)"
        >
          <span class="flex-1">{{ toast.message }}</span>
          <button
            (click)="toastService.dismiss(toast.id)"
            class="text-current opacity-60 hover:opacity-100 text-lg leading-none"
          >×</button>
        </div>
      }
    </div>
  `
})
export class ErrorToastComponent {
  readonly toastService = inject(ErrorToastService);

  toastClasses(toast: Toast): string {
    const map: Record<Toast['type'], string> = {
      error:   'bg-red-600 text-white',
      success: 'bg-green-600 text-white',
      info:    'bg-blue-600 text-white'
    };
    return map[toast.type];
  }
}

