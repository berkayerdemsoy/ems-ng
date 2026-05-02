import {
  Component,
  Input,
  OnInit,
  forwardRef,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let uid = 0;

@Component({
  selector: 'app-city-select',
  standalone: true,
  imports: [FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CitySelectComponent),
      multi: true,
    },
  ],
  template: `
    <div class="relative">
      <!-- Input -->
      <div class="relative">
        <input
          type="text"
          [id]="inputId"
          autocomplete="off"
          placeholder=" "
          [(ngModel)]="searchText"
          (click)="onInputClick()"
          (input)="onInput()"
          (blur)="onBlur()"
          class="fl-input border transition-all pr-10"
          [class.border-error]="invalid"
          [class.border-outline-variant]="!invalid"
        />
        <!-- Float Label — based on selectedCity OR isFocused, not searchText -->
        <label
          [for]="inputId"
          class="fl-label"
          [class.fl-label-up]="isLabelFloating"
          [class.fl-label-down]="!isLabelFloating"
        >{{ label }}</label>
        <!-- Arrow icon -->
        <span
          class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 pointer-events-none select-none transition-transform duration-200"
          style="font-size:20px"
          [class.rotate-180]="isOpen"
        >expand_more</span>
      </div>

      <!-- Dropdown -->
      @if (isOpen) {
        <div
          class="city-dropdown absolute z-[200] top-full mt-1 w-full bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-[0_20px_60px_rgba(28,28,23,0.12)] max-h-52 overflow-y-auto"
          (mousedown)="$event.preventDefault()"
        >
          @if (filteredCities.length === 0) {
            <div class="px-4 py-3 text-sm text-on-surface-variant/60 text-center">
              {{ noResultsText }}
            </div>
          }
          @for (city of filteredCities; track city) {
            <button
              type="button"
              class="w-full text-left px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container transition-colors flex items-center justify-between border-b border-outline-variant/10 last:border-0"
              [class.bg-surface-container]="city === selectedCity"
              (click)="selectCity(city)"
            >
              <span>{{ city }}</span>
              @if (city === selectedCity) {
                <span class="material-symbols-outlined text-secondary" style="font-size:16px">check</span>
              }
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class CitySelectComponent implements ControlValueAccessor, OnInit {
  @Input() label = 'City';
  @Input() invalid = false;
  @Input() noResultsText = 'No cities found';

  readonly inputId = `city_sel_${++uid}`;

  private readonly http = inject(HttpClient);

  searchText   = '';
  selectedCity = '';
  isOpen       = false;
  isFocused    = false;
  allCities: string[]      = [];
  filteredCities: string[] = [];

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  /** Float label up when a city is committed OR input is focused */
  get isLabelFloating(): boolean {
    return !!(this.selectedCity || this.isFocused);
  }

  ngOnInit(): void {
    this.http.get<string[]>('/cities.json').subscribe({
      next: cities => {
        this.allCities = cities;
        this.filteredCities = [...cities];
      },
    });
  }

  /** Every click on the input opens the dropdown with a fresh (empty) search */
  onInputClick(): void {
    this.isFocused  = true;
    this.searchText = '';
    this.filteredCities = [...this.allCities];
    this.isOpen = true;
  }

  onBlur(): void {
    this.isFocused = false;
    this.isOpen    = false;
    this.onTouched();
    // Restore the display text to the committed selected city
    this.searchText = this.selectedCity;
  }

  onInput(): void {
    this.filteredCities = this.filter(this.searchText);
    this.isOpen = true;
    // If user wrote and clears the text, reset the value
    if (!this.searchText) {
      this.selectedCity = '';
      this.onChange('');
    }
  }

  selectCity(city: string): void {
    this.selectedCity = city;
    this.searchText   = city;
    this.isOpen       = false;
    this.onChange(city);
    this.onTouched();
  }

  private filter(text: string): string[] {
    if (!text) return [...this.allCities];
    const t = text.toLocaleLowerCase('tr-TR');
    return this.allCities.filter(c => c.toLocaleLowerCase('tr-TR').includes(t));
  }

  // ── ControlValueAccessor ──────────────────────────────────────────────────

  writeValue(v: string): void {
    this.selectedCity = v ?? '';
    this.searchText   = v ?? '';
    if (v) this.filteredCities = this.filter(v);
  }

  registerOnChange(fn: (v: string) => void): void { this.onChange  = fn; }
  registerOnTouched(fn: () => void): void          { this.onTouched = fn; }
  setDisabledState(_disabled: boolean): void       {}
}
