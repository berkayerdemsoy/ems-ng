import {
  Component,
  ElementRef,
  HostListener,
  forwardRef,
  inject,
  signal,
  computed,
  input,
  output,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { I18nService } from '../../../core/services/i18n.service';
import { CategoryDto } from '../../../core/models';

let _uid = 0;

@Component({
  selector: 'app-category-select',
  standalone: true,
  imports: [],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CategorySelectComponent),
    multi: true,
  }],
  template: `
<div class="relative">

  <!-- ── Trigger ──────────────────────────────────────────────────────── -->
  <div class="relative cursor-pointer select-none" (click)="toggle()">
    <div
      class="fl-input border cursor-pointer pr-10 select-none"
      [class.border-error]="invalid()"
      [class.border-outline-variant]="!invalid() && !isOpen()"
      [class.border-secondary-container]="isOpen()"
    >
      <!-- invisible char keeps height when empty -->
      <span class="block truncate" [class.text-transparent]="!selectedLabel()">
        {{ selectedLabel() || '\u00A0' }}
      </span>
    </div>

    <!-- Float label -->
    <label class="fl-label pointer-events-none"
           [class.fl-label-up]="isFloating()"
           [class.fl-label-down]="!isFloating()">{{ label() }}</label>

    <!-- Chevron -->
    <span
      class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-200"
      style="font-size:20px"
      [class.text-secondary]="isOpen()"
      [class.text-on-surface-variant]="!isOpen()"
      [class.rotate-180]="isOpen()"
    >expand_more</span>
  </div>

  <!-- ── Dropdown panel ────────────────────────────────────────────────── -->
  @if (isOpen()) {
    <div
      class="absolute z-[200] mt-2 left-0 min-w-full w-max bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-[0_20px_60px_rgba(28,28,23,0.12)] overflow-hidden max-h-72 overflow-y-auto"
    >

      <!-- "All" option -->
      @if (showAll()) {
        <button
          type="button"
          (click)="pick(null)"
          class="w-full text-left px-5 py-3 flex items-center gap-3 transition-colors border-b border-outline-variant/10"
          [class.bg-surface-container]="selected() === null"
          [class.hover:bg-surface-container]="selected() !== null"
          [class.hover:bg-surface-container-high]="selected() === null"
        >
          <span class="w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all"
                [class.border-secondary-container]="selected() === null"
                [class.bg-secondary-container]="selected() === null"
                [class.border-outline-variant]="selected() !== null">
            @if (selected() === null) {
              <span class="material-symbols-outlined text-on-secondary-container" style="font-size:10px">check</span>
            }
          </span>
          <span class="text-sm font-medium text-on-surface">
            {{ isTr() ? 'Tüm Kategoriler' : 'All Categories' }}
          </span>
        </button>
      }

      <!-- Category items -->
      @for (cat of categories(); track cat.id) {
        <button
          type="button"
          (click)="pick(cat.id!)"
          class="w-full text-left px-5 py-3 flex items-center gap-3 transition-colors border-b border-outline-variant/10 last:border-0 hover:bg-surface-container"
          [class.bg-surface-container]="selected() === cat.id"
        >
          <span class="w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all"
                [class.border-secondary-container]="selected() === cat.id"
                [class.bg-secondary-container]="selected() === cat.id"
                [class.border-outline-variant]="selected() !== cat.id">
            @if (selected() === cat.id) {
              <span class="material-symbols-outlined text-on-secondary-container" style="font-size:10px">check</span>
            }
          </span>
          <span class="text-sm text-on-surface">{{ cat.name }}</span>
        </button>
      }

      @if (categories().length === 0) {
        <div class="px-5 py-4 text-sm text-on-surface-variant/60 text-center">
          {{ isTr() ? 'Kategori yok' : 'No categories' }}
        </div>
      }
    </div>
  }

</div>
  `,
})
export class CategorySelectComponent implements ControlValueAccessor {

  // ── Signal inputs ─────────────────────────────────────────────────────────
  readonly label      = input<string>('Category');
  readonly categories = input<CategoryDto[]>([]);
  readonly invalid    = input<boolean>(false);
  /** Show an "All Categories" option that emits null */
  readonly showAll    = input<boolean>(true);

  // ── Output ────────────────────────────────────────────────────────────────
  readonly changed = output<number | null>();

  // ── Injected ─────────────────────────────────────────────────────────────
  readonly i18n = inject(I18nService);
  private  readonly el = inject(ElementRef);

  readonly inputId = `cat_${++_uid}`;

  // ── State ─────────────────────────────────────────────────────────────────
  readonly isOpen   = signal(false);
  readonly selected = signal<number | null>(null);  // null = all

  // ── Computed ──────────────────────────────────────────────────────────────
  readonly isTr = computed(() => this.i18n.locale() === 'tr');

  readonly selectedLabel = computed(() => {
    const v = this.selected();
    if (v === null) return '';
    return this.categories().find(c => c.id === v)?.name ?? '';
  });

  readonly isFloating = computed(() =>
    this.selected() !== null || this.isOpen()
  );

  // ── CVA ───────────────────────────────────────────────────────────────────
  private _onChange  = (_: number | null) => {};
  private _onTouched = () => {};

  /** Handles number, string-number (from reactive forms), null, undefined, '' */
  writeValue(v: number | null | string | undefined): void {
    this.selected.set(v != null && v !== '' ? Number(v) : null);
  }
  registerOnChange(fn: (_: number | null) => void) { this._onChange  = fn; }
  registerOnTouched(fn: () => void)                { this._onTouched = fn; }
  setDisabledState(_: boolean)                     {}

  // ── Actions ───────────────────────────────────────────────────────────────
  toggle(): void { this.isOpen() ? this.close() : this.open(); }
  open():   void { this.isOpen.set(true); }
  close():  void { this.isOpen.set(false); this._onTouched(); }

  pick(id: number | null): void {
    this.selected.set(id);
    this._onChange(id);
    this.changed.emit(id);
    this.close();
  }

  // ── Close on outside click ────────────────────────────────────────────────
  @HostListener('document:mousedown', ['$event'])
  onDocMousedown(e: MouseEvent): void {
    if (this.isOpen() && !this.el.nativeElement.contains(e.target as Node))
      this.close();
  }
}



