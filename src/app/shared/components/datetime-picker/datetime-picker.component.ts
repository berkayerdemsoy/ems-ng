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

// ─────────────────────────────────────────────────────────────────────────────
// Types & constants
// ─────────────────────────────────────────────────────────────────────────────
interface CalDay { date: Date; inMonth: boolean; }

const M_TR = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
const M_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const D_TR = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];
const D_EN = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

let _uid = 0;

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-datetime-picker',
  standalone: true,
  imports: [],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DatetimePickerComponent),
    multi: true,
  }],
  template: `
<div class="relative">

  <!-- ── Trigger ─────────────────────────────────────────────────────── -->
  <div class="relative" (click)="toggle()">
    <input
      type="text"
      [id]="inputId"
      readonly
      [value]="displayVal()"
      placeholder=" "
      class="fl-input border cursor-pointer caret-transparent select-none pr-10 w-full"
      [class.border-error]="invalid()"
      [class.border-outline-variant]="!invalid() && !isOpen()"
      [class.border-secondary-container]="isOpen()"
      (focus)="onFocus()" (blur)="onBlur()"
    />
    <!-- Float label -->
    <label
      [for]="inputId"
      class="fl-label pointer-events-none"
      [class.fl-label-up]="isFloating()"
      [class.fl-label-down]="!isFloating()"
    >{{ label() }}</label>
    <!-- Calendar icon -->
    <span
      class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200"
      style="font-size:20px"
      [class.text-secondary]="isOpen()"
      [class.text-on-surface-variant]="!isOpen()"
    >calendar_month</span>
  </div>

  <!-- ── Panel ────────────────────────────────────────────────────────── -->
  @if (isOpen()) {
    <div
      class="absolute z-[200] mt-2 left-0 w-[21rem] bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-[0_24px_60px_rgba(28,28,23,0.12)] overflow-hidden"
    >

      <!-- Month navigation header -->
      <div class="flex items-center justify-between px-4 pt-4 pb-2">
        <button
          type="button" (click)="prevMonth()"
          class="w-9 h-9 rounded-full hover:bg-surface-container flex items-center justify-center transition-colors text-on-surface-variant"
          aria-label="Previous month">
          <span class="material-symbols-outlined" style="font-size:20px">chevron_left</span>
        </button>

        <!-- Month / Year — click year to fast-select (bonus: year input) -->
        <div class="flex items-center gap-2">
          <span class="text-sm font-semibold tracking-wide text-on-surface">{{ monthLabel() }}</span>
        </div>

        <button
          type="button" (click)="nextMonth()"
          class="w-9 h-9 rounded-full hover:bg-surface-container flex items-center justify-center transition-colors text-on-surface-variant"
          aria-label="Next month">
          <span class="material-symbols-outlined" style="font-size:20px">chevron_right</span>
        </button>
      </div>

      <!-- Day-of-week headers -->
      <div class="grid grid-cols-7 px-3 mb-0.5">
        @for (h of dayHeaders(); track h) {
          <div class="h-7 flex items-center justify-center text-[10px] font-semibold tracking-widest uppercase text-on-surface-variant/45">
            {{ h }}
          </div>
        }
      </div>

      <!-- Calendar grid -->
      <div class="px-3 pb-3">
        @for (row of calRows(); track $index) {
          <div class="grid grid-cols-7">
            @for (day of row; track day.date.getTime()) {
              <button
                type="button"
                (click)="selectDay(day)"
                class="h-9 w-full flex items-center justify-center text-sm rounded-full focus:outline-none transition-all duration-100"
                [class]="dayClass(day)"
              >{{ day.date.getDate() }}</button>
            }
          </div>
        }
      </div>

      <!-- Divider -->
      <div class="mx-4 h-px bg-outline-variant/20"></div>

      <!-- ── Time spinner (hidden when showTime=false) ──────────────────── -->
      @if (showTime()) {
        <div class="flex items-center justify-center gap-3 py-3.5">

          <!-- Label -->
          <span class="text-[10px] font-semibold tracking-widest uppercase text-on-surface-variant/50 mr-1 select-none">
            {{ isTr() ? 'Saat' : 'Time' }}
          </span>

          <!-- Hour spinner -->
          <div class="flex flex-col items-center gap-0.5">
            <button type="button" (click)="incH()"
              class="w-8 h-6 flex items-center justify-center rounded-md hover:bg-surface-container transition-colors text-on-surface-variant">
              <span class="material-symbols-outlined" style="font-size:16px">expand_less</span>
            </button>
            <div class="w-11 h-10 rounded-lg bg-surface-container flex items-center justify-center text-lg font-light text-on-surface tabular-nums select-none">
              {{ hourPad() }}
            </div>
            <button type="button" (click)="decH()"
              class="w-8 h-6 flex items-center justify-center rounded-md hover:bg-surface-container transition-colors text-on-surface-variant">
              <span class="material-symbols-outlined" style="font-size:16px">expand_more</span>
            </button>
          </div>

          <span class="text-xl font-light text-on-surface-variant/50 select-none mb-0.5">:</span>

          <!-- Minute spinner -->
          <div class="flex flex-col items-center gap-0.5">
            <button type="button" (click)="incM()"
              class="w-8 h-6 flex items-center justify-center rounded-md hover:bg-surface-container transition-colors text-on-surface-variant">
              <span class="material-symbols-outlined" style="font-size:16px">expand_less</span>
            </button>
            <div class="w-11 h-10 rounded-lg bg-surface-container flex items-center justify-center text-lg font-light text-on-surface tabular-nums select-none">
              {{ minPad() }}
            </div>
            <button type="button" (click)="decM()"
              class="w-8 h-6 flex items-center justify-center rounded-md hover:bg-surface-container transition-colors text-on-surface-variant">
              <span class="material-symbols-outlined" style="font-size:16px">expand_more</span>
            </button>
          </div>

          <!-- Quick presets -->
          <div class="flex flex-col gap-1 ml-2">
            @for (preset of timePresets; track preset) {
              <button type="button" (click)="applyPreset(preset)"
                class="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide text-on-surface-variant hover:bg-surface-container transition-colors tabular-nums"
                [class.bg-surface-container]="pendingHour() === preset.h && pendingMin() === preset.m">
                {{ preset.label }}
              </button>
            }
          </div>
        </div>

        <!-- Divider before footer -->
        <div class="mx-4 h-px bg-outline-variant/20"></div>
      }

      <!-- ── Footer ─────────────────────────────────────────────────── -->
      <div class="flex gap-2 px-4 py-3">
        <button
          type="button" (click)="clear()"
          class="w-1/3 py-2.5 rounded-lg border border-outline-variant/40 text-xs font-semibold tracking-widest uppercase text-on-surface-variant hover:bg-surface-container transition-colors">
          {{ isTr() ? 'Temizle' : 'Clear' }}
        </button>
        <button
          type="button" (click)="apply()"
          [disabled]="!pendingDate()"
          class="w-2/3 py-2.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-semibold tracking-widest uppercase transition-all shadow-[0_4px_14px_rgba(245,158,11,0.22)] hover:shadow-[0_6px_22px_rgba(245,158,11,0.38)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5">
          <span class="material-symbols-outlined" style="font-size:14px">check</span>
          {{ isTr() ? 'Uygula' : 'Apply' }}
        </button>
      </div>

    </div>
  }

</div>
  `,
})
export class DatetimePickerComponent implements ControlValueAccessor {

  // ── Signal Inputs (Angular 17+ API) ────────────────────────────────────────
  readonly label    = input<string>('Date & Time');
  readonly invalid  = input<boolean>(false);
  /** Set false to hide the time spinner (date-only picker) */
  readonly showTime = input<boolean>(true);

  // ── Output (Angular 17+ API) ────────────────────────────────────────────────
  readonly changed = output<Date | null>();

  // ── Injected services ──────────────────────────────────────────────────────
  readonly i18n = inject(I18nService);
  private  readonly el = inject(ElementRef);

  // ── Unique ID ────────────────────────────────────────────────────────────
  readonly inputId = `dtp_${++_uid}`;

  // ── Internal writable signals ─────────────────────────────────────────────
  readonly isOpen      = signal(false);
  readonly viewYear    = signal(new Date().getFullYear());
  readonly viewMonth   = signal(new Date().getMonth());  // 0-indexed
  readonly pendingDate = signal<Date | null>(null);
  readonly pendingHour = signal(0);
  readonly pendingMin  = signal(0);
  readonly committed   = signal<Date | null>(null);
  private  readonly isFocused = signal(false);

  // ── Computed ───────────────────────────────────────────────────────────────
  readonly isTr = computed(() => this.i18n.locale() === 'tr');

  readonly monthLabel = computed(() => {
    const months = this.isTr() ? M_TR : M_EN;
    return `${months[this.viewMonth()]}  ${this.viewYear()}`;
  });

  readonly dayHeaders = computed(() => this.isTr() ? D_TR : D_EN);

  readonly calRows = computed((): CalDay[][] =>
    this.buildCalendar(this.viewYear(), this.viewMonth())
  );

  readonly hourPad = computed(() => String(this.pendingHour()).padStart(2, '0'));
  readonly minPad  = computed(() => String(this.pendingMin()).padStart(2, '0'));

  readonly displayVal = computed(() => {
    const v = this.committed();
    return v ? this.fmtDisplay(v) : '';
  });

  readonly isFloating = computed(() =>
    !!this.displayVal() || this.isOpen() || this.isFocused()
  );

  // Quick-pick presets shown next to the time spinners
  readonly timePresets = [
    { label: '09:00', h: 9,  m: 0  },
    { label: '12:00', h: 12, m: 0  },
    { label: '18:00', h: 18, m: 0  },
    { label: '20:00', h: 20, m: 0  },
  ];

  // ── ControlValueAccessor ───────────────────────────────────────────────────
  private _onChange  = (_: string | null) => {};
  private _onTouched = () => {};

  writeValue(v: string | Date | null): void {
    if (!v) { this.committed.set(null); return; }
    const d = v instanceof Date ? v : new Date(v as string);
    if (isNaN(d.getTime())) return;
    this.committed.set(d);
    this.syncPending(d);
    this.viewYear.set(d.getFullYear());
    this.viewMonth.set(d.getMonth());
  }

  registerOnChange(fn: (_: string | null) => void) { this._onChange  = fn; }
  registerOnTouched(fn: () => void)                { this._onTouched = fn; }
  setDisabledState(_: boolean)                     {}

  // ── Panel actions ──────────────────────────────────────────────────────────
  toggle(): void { this.isOpen() ? this.closePanel() : this.openPanel(); }

  openPanel(): void {
    const c = this.committed();
    if (c) {
      this.syncPending(c);
      this.viewYear.set(c.getFullYear());
      this.viewMonth.set(c.getMonth());
    } else {
      const now = new Date();
      this.pendingDate.set(null);
      this.pendingHour.set(now.getHours());
      this.pendingMin.set(Math.round(now.getMinutes() / 5) * 5 % 60);
      this.viewYear.set(now.getFullYear());
      this.viewMonth.set(now.getMonth());
    }
    this.isOpen.set(true);
  }

  closePanel(): void { this.isOpen.set(false); this._onTouched(); }

  prevMonth(): void {
    if (this.viewMonth() === 0) { this.viewYear.update(y => y - 1); this.viewMonth.set(11); }
    else this.viewMonth.update(m => m - 1);
  }

  nextMonth(): void {
    if (this.viewMonth() === 11) { this.viewYear.update(y => y + 1); this.viewMonth.set(0); }
    else this.viewMonth.update(m => m + 1);
  }

  selectDay(day: CalDay): void {
    if (!day.inMonth) {
      this.viewYear.set(day.date.getFullYear());
      this.viewMonth.set(day.date.getMonth());
    }
    this.pendingDate.set(new Date(day.date));
  }

  incH(): void { this.pendingHour.update(h => (h + 1)  % 24); }
  decH(): void { this.pendingHour.update(h => (h + 23) % 24); }
  incM(): void { this.pendingMin.update(m => (m + 5)  % 60); }
  decM(): void { this.pendingMin.update(m => (m + 55) % 60); }

  applyPreset(p: { h: number; m: number }): void {
    this.pendingHour.set(p.h);
    this.pendingMin.set(p.m);
  }

  apply(): void {
    const d = this.pendingDate(); if (!d) return;
    const out = new Date(d);
    if (this.showTime()) {
      out.setHours(this.pendingHour(), this.pendingMin(), 0, 0);
    } else {
      out.setHours(0, 0, 0, 0);
    }
    const str = this.toDtLocal(out);
    this.committed.set(out);
    this._onChange(str);
    this.changed.emit(out);
    this.closePanel();
  }

  clear(): void {
    this.committed.set(null);
    this.pendingDate.set(null);
    this._onChange(null);
    this.changed.emit(null);
    this.closePanel();
  }

  onFocus(): void { this.isFocused.set(true); }
  onBlur():  void { this.isFocused.set(false); this._onTouched(); }

  // ── Day-cell class helper ──────────────────────────────────────────────────
  dayClass(day: CalDay): string {
    if (this.isSelected(day.date))
      return 'bg-secondary-container text-on-secondary-container font-semibold cursor-default';
    if (this.isToday(day.date) && day.inMonth)
      return 'ring-1 ring-amber-400 text-secondary font-semibold hover:bg-amber-400/10 cursor-pointer';
    if (!day.inMonth)
      return 'text-on-surface-variant/25 cursor-default';
    return 'text-on-surface hover:bg-surface-container cursor-pointer';
  }

  isToday(d: Date):    boolean { return d.toDateString() === new Date().toDateString(); }
  isSelected(d: Date): boolean {
    const p = this.pendingDate();
    return !!p && d.toDateString() === p.toDateString();
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private syncPending(d: Date): void {
    this.pendingDate.set(new Date(d));
    this.pendingHour.set(d.getHours());
    this.pendingMin.set(d.getMinutes());
  }

  /**
   * Build a 6×7 calendar grid (always 42 cells).
   * Week starts on Monday (European/Turkish standard).
   */
  private buildCalendar(y: number, m: number): CalDay[][] {
    const firstDay  = new Date(y, m, 1);
    const totalDays = new Date(y, m + 1, 0).getDate();

    // Mon=0 … Sun=6
    const dow = firstDay.getDay();
    const startOffset = dow === 0 ? 6 : dow - 1;

    const days: CalDay[] = [];

    // Fill from previous month
    for (let i = startOffset; i > 0; i--)
      days.push({ date: new Date(y, m, 1 - i), inMonth: false });

    // Current month
    for (let d = 1; d <= totalDays; d++)
      days.push({ date: new Date(y, m, d), inMonth: true });

    // Fill to 42 cells with next-month days
    let nx = 1;
    while (days.length < 42)
      days.push({ date: new Date(y, m + 1, nx++), inMonth: false });

    // Split into rows of 7
    return Array.from({ length: 6 }, (_, r) => days.slice(r * 7, r * 7 + 7));
  }

  /** Display format: DD.MM.YYYY or DD.MM.YYYY  HH:mm */
  private fmtDisplay(d: Date): string {
    const p = (n: number) => String(n).padStart(2, '0');
    const date = `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
    if (!this.showTime()) return date;
    return `${date}  ${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  /** datetime-local format for reactive forms: YYYY-MM-DDTHH:mm */
  private toDtLocal(d: Date): string {
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  // ── Close on outside click ─────────────────────────────────────────────────
  @HostListener('document:mousedown', ['$event'])
  onDocMousedown(e: MouseEvent): void {
    if (this.isOpen() && !this.el.nativeElement.contains(e.target as Node))
      this.closePanel();
  }
}

