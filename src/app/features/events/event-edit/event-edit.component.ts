import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { CategoryService } from '../../../core/services/category.service';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorToastService } from '../../../shared/components/error-toast/error-toast.service';
import { I18nService } from '../../../core/services/i18n.service';
import { CategoryDto, ErrorResponseDto } from '../../../core/models';
import { toBackendDateTime, toHtmlDatetimeLocal } from '../../../core/utils/date.utils';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { CitySelectComponent } from '../../../shared/components/city-select/city-select.component';
import { DatetimePickerComponent } from '../../../shared/components/datetime-picker/datetime-picker.component';
import { CategorySelectComponent } from '../../../shared/components/category-select/category-select.component';

/** endDate > startDate kontrolü */
function editDateRangeValidator(group: AbstractControl): ValidationErrors | null {
  const start = group.get('startDate')?.value;
  const end   = group.get('endDate')?.value;
  if (start && end && new Date(end) <= new Date(start)) return { endBeforeStart: true };
  return null;
}

@Component({
  selector: 'app-event-edit',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, CitySelectComponent, DatetimePickerComponent, CategorySelectComponent],
  template: `
    <div class="min-h-screen pt-28 pb-24 px-[max(24px,5vw)] relative">
      <div class="absolute top-32 left-1/4 w-80 h-80 bg-secondary-container/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      <div class="max-w-2xl mx-auto">
        <div class="mb-10">
          <span class="text-[11px] font-semibold tracking-[0.15em] uppercase text-on-surface-variant px-4 py-1 rounded-full glass-panel inline-block mb-4">{{ 'eventEdit.badge' | t }}</span>
          <h1 class="text-[48px] leading-[1.2] tracking-[-0.02em] font-light text-on-surface">{{ 'eventEdit.title' | t }}</h1>
          <p class="text-base text-on-surface-variant mt-2">{{ 'eventEdit.subtitle' | t }}</p>
        </div>

        @if (isLoading()) {
          <div class="space-y-4">
            @for (i of [1,2,3,4]; track i) {
              <div class="animate-pulse bg-surface-container/50 rounded-xl h-14"></div>
            }
          </div>
        } @else {
          <div class="bg-surface-container-lowest/80 backdrop-blur-xl rounded-xl p-8 border border-outline-variant/30 shadow-[0_30px_60px_rgba(28,28,23,0.05)]">
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">

              <!-- Title -->
              <div class="relative">
                <input formControlName="title" type="text" id="ee_title"
                  class="fl-input border border-outline-variant"
                  placeholder=" "
                  (focus)="focusedField.set('title')" (blur)="focusedField.set(null)" />
                <label for="ee_title" class="fl-label"
                  [class.fl-label-up]="isFloating('title')"
                  [class.fl-label-down]="!isFloating('title')">{{ 'eventEdit.titleLabel' | t }}</label>
              </div>

              <!-- Description -->
              <div class="relative">
                <textarea formControlName="description" rows="4" id="ee_desc"
                  class="fl-input border border-outline-variant resize-none"
                  placeholder=" "
                  (focus)="focusedField.set('description')" (blur)="focusedField.set(null)"></textarea>
                <label for="ee_desc" class="fl-label"
                  [class.fl-label-up]="isFloating('description')"
                  [class.fl-label-down]="!isFloating('description')">{{ 'eventEdit.descLabel' | t }}</label>
              </div>

              <!-- City + Address -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <app-city-select
                    formControlName="city"
                    [label]="'eventEdit.cityLabel' | t"
                    [noResultsText]="'Şehir bulunamadı'" />
                </div>
                <div class="relative">
                  <input formControlName="address" type="text" id="ee_addr"
                    class="fl-input border border-outline-variant"
                    placeholder=" "
                    (focus)="focusedField.set('address')" (blur)="focusedField.set(null)" />
                  <label for="ee_addr" class="fl-label"
                    [class.fl-label-up]="isFloating('address')"
                    [class.fl-label-down]="!isFloating('address')">{{ 'eventEdit.addressLabel' | t }}</label>
                </div>
              </div>

              <!-- Category -->
              <div>
                <app-category-select
                  formControlName="categoryId"
                  [categories]="categories()"
                  [label]="'eventEdit.categoryLabel' | t"
                  [showAll]="false" />
              </div>

              <!-- Capacity + Price -->
              <div class="grid grid-cols-2 gap-4">
                <div class="relative">
                  <input formControlName="capacity" type="number" min="1" id="ee_cap"
                    class="fl-input border border-outline-variant"
                    placeholder=" "
                    (focus)="focusedField.set('capacity')" (blur)="focusedField.set(null)" />
                  <label for="ee_cap" class="fl-label"
                    [class.fl-label-up]="isFloating('capacity')"
                    [class.fl-label-down]="!isFloating('capacity')">{{ 'eventEdit.capacityLabel' | t }}</label>
                </div>
                <div class="relative">
                  <input formControlName="price" type="number" min="0" step="0.01" id="ee_price"
                    class="fl-input border border-outline-variant"
                    placeholder=" "
                    (focus)="focusedField.set('price')" (blur)="focusedField.set(null)" />
                  <label for="ee_price" class="fl-label"
                    [class.fl-label-up]="isFloating('price')"
                    [class.fl-label-down]="!isFloating('price')">{{ 'eventEdit.priceLabel' | t }}</label>
                </div>
              </div>

              <!-- Start + End Date -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <app-datetime-picker
                    formControlName="startDate"
                    [label]="'eventEdit.startsLabel' | t" />
                </div>
                <div>
                  <app-datetime-picker
                    formControlName="endDate"
                    [label]="'eventEdit.endsLabel' | t"
                    [invalid]="!!(form.errors?.['endBeforeStart'] && form.get('endDate')?.touched)" />
                  @if (form.errors?.['endBeforeStart'] && form.get('endDate')?.touched) {
                    <p class="mt-1 text-xs text-error">{{ 'eventEdit.endBeforeStart' | t }}</p>
                  }
                </div>
              </div>

              @if (formError()) {
                <div class="p-3 rounded-lg bg-error-container border border-error/20 text-sm text-on-error-container">{{ formError() }}</div>
              }

              <div class="flex gap-3 pt-2">
                <button type="button" (click)="router.navigate(['/events', eventId])"
                  class="px-6 py-3 text-xs font-semibold tracking-widest uppercase text-on-surface-variant border border-outline-variant hover:bg-surface-container rounded-lg transition-colors">
                  {{ 'eventEdit.cancel' | t }}
                </button>
                <button type="submit" [disabled]="isSaving()"
                  class="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white py-3 rounded-lg text-xs font-semibold tracking-widest uppercase transition-all shadow-[0_4px_20px_rgba(245,158,11,0.2)] hover:shadow-[0_8px_25px_rgba(245,158,11,0.4)] disabled:opacity-60 flex justify-center items-center gap-2">
                  @if (isSaving()) {
                    <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  } @else {
                    {{ 'eventEdit.save' | t }}
                    <span class="material-symbols-outlined" style="font-size:18px">check</span>
                  }
                </button>
              </div>
            </form>
          </div>
        }
      </div>
    </div>
  `
})
export class EventEditComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);
  private readonly categoryService = inject(CategoryService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ErrorToastService);
  private readonly i18n = inject(I18nService);
  readonly router = inject(Router);

  readonly categories = signal<CategoryDto[]>([]);
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly formError = signal<string | null>(null);
  readonly focusedField = signal<string | null>(null);
  eventId = 0;

  readonly form = this.fb.group({
    title: [''], description: [''], city: [''], address: [''],
    categoryId: [null as number | null], capacity: [null as number | null],
    price: [null as number | null], startDate: [''], endDate: ['']
  }, { validators: editDateRangeValidator });

  ngOnInit(): void {
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));
    this.categoryService.getAll().subscribe(cats => this.categories.set(cats));
    this.eventService.getById(this.eventId).subscribe({
      next: event => {
        const user = this.authService.currentUser();
        if (!user || (event.ownerId !== user.id && user.role !== 'ADMIN')) {
          this.router.navigate(['/events', this.eventId]); return;
        }
        this.form.patchValue({
          title: event.title, description: event.description,
          city: event.city, address: event.address,
          categoryId: event.category.id ?? null, capacity: event.capacity,
          price: event.price,
          startDate: toHtmlDatetimeLocal(event.startDate),
          endDate: toHtmlDatetimeLocal(event.endDate),
        });
        this.isLoading.set(false);
      },
      error: () => this.router.navigate(['/events'])
    });
  }

  /** Returns true when label should float to the top */
  isFloating(field: string): boolean {
    const val = this.form.get(field)?.value;
    const hasVal = val !== null && val !== undefined && val !== '';
    return hasVal || this.focusedField() === field;
  }

  onSubmit(): void {
    this.formError.set(null);
    this.isSaving.set(true);
    const val = this.form.getRawValue();
    const dto: any = {};
    if (val.title)       dto.title = val.title;
    if (val.description) dto.description = val.description;
    if (val.city)        dto.city = val.city;
    if (val.address)     dto.address = val.address;
    if (val.categoryId)  dto.categoryId = Number(val.categoryId);
    if (val.capacity)    dto.capacity = val.capacity;
    if (val.price != null) dto.price = val.price;
    if (val.startDate)   dto.startDate = toBackendDateTime(val.startDate);
    if (val.endDate)     dto.endDate = toBackendDateTime(val.endDate);

    this.eventService.update(this.eventId, dto).subscribe({
      next: event => {
        this.toast.show(this.i18n.t('eventEdit.success'), 'success');
        this.router.navigate(['/events', event.id]);
      },
      error: (err: ErrorResponseDto) => {
        this.isSaving.set(false);
        this.formError.set(err?.message ?? this.i18n.t('eventEdit.failed'));
      }
    });
  }
}
