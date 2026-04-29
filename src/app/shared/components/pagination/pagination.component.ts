import { Component, input, output } from '@angular/core';
import { Page } from '../../../core/models';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    <div class="flex items-center justify-between mt-6">
      <p class="text-sm text-on-surface-variant">
        Page {{ pageData().number + 1 }} of {{ pageData().totalPages }}
      </p>
      <div class="flex items-center gap-2">
        <button
          (click)="pageChange.emit(pageData().number - 1)"
          [disabled]="pageData().first"
          class="px-4 py-2 text-xs font-semibold tracking-widest uppercase rounded-lg border border-outline-variant text-on-surface-variant disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-container transition-colors flex items-center gap-1"
        >
          <span class="material-symbols-outlined" style="font-size:16px">chevron_left</span>
          Prev
        </button>

        @for (p of getPages(); track p) {
          <button
            (click)="pageChange.emit(p)"
            [class]="p === pageData().number
              ? 'w-9 h-9 text-xs font-semibold rounded-lg bg-secondary-container text-on-secondary-container'
              : 'w-9 h-9 text-xs font-semibold rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors'"
          >
            {{ p + 1 }}
          </button>
        }

        <button
          (click)="pageChange.emit(pageData().number + 1)"
          [disabled]="pageData().last"
          class="px-4 py-2 text-xs font-semibold tracking-widest uppercase rounded-lg border border-outline-variant text-on-surface-variant disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-container transition-colors flex items-center gap-1"
        >
          Next
          <span class="material-symbols-outlined" style="font-size:16px">chevron_right</span>
        </button>
      </div>
    </div>
  `
})
export class PaginationComponent {
  readonly pageData = input.required<Pick<Page<unknown>, 'number' | 'totalPages' | 'first' | 'last'>>();
  readonly pageChange = output<number>();

  getPages(): number[] {
    const total = this.pageData().totalPages;
    const current = this.pageData().number;
    const range = 2;
    const start = Math.max(0, current - range);
    const end = Math.min(total - 1, current + range);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
}

