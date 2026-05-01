import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { CategoryService } from '../../../core/services/category.service';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorToastService } from '../../../shared/components/error-toast/error-toast.service';
import { I18nService } from '../../../core/services/i18n.service';
import { CategoryDto, ErrorResponseDto } from '../../../core/models';
import { toBackendDateTime } from '../../../core/utils/date.utils';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

/** Grup-level validator: startDate geçmişte olamaz, endDate > startDate */
function eventDateValidator(group: AbstractControl): ValidationErrors | null {
  const start = group.get('startDate')?.value;
  const end   = group.get('endDate')?.value;
  if (!start) return null;
  const startDt = new Date(start);
  const now     = new Date();
  if (startDt < now) return { pastStartDate: true };
  if (end && new Date(end) <= startDt) return { endBeforeStart: true };
  return null;
}

@Component({
  selector: 'app-event-create',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="min-h-screen pt-28 pb-24 px-[max(24px,5vw)] relative">
      <div class="absolute top-32 right-1/4 w-80 h-80 bg-secondary-container/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <div class="max-w-2xl mx-auto">
        <div class="mb-10">
          <span class="text-[11px] font-semibold tracking-[0.15em] uppercase text-on-surface-variant px-4 py-1 rounded-full glass-panel inline-block mb-4">{{ 'eventCreate.badge' | t }}</span>
          <h1 class="text-[48px] leading-[1.2] tracking-[-0.02em] font-light text-on-surface">{{ 'eventCreate.title' | t }}</h1>
          <p class="text-base text-on-surface-variant mt-2">{{ 'eventCreate.subtitle' | t }}</p>
        </div>

        <div class="bg-surface-container-lowest/80 backdrop-blur-xl rounded-xl p-8 border border-outline-variant/30 shadow-[0_30px_60px_rgba(28,28,23,0.05)]">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">

            <div>
              <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">{{ 'eventCreate.titleLabel' | t }}</label>
              <input formControlName="title" type="text"
                class="w-full px-4 py-3 bg-surface border rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all"
                [class.border-error]="isInvalid('title')" [class.border-outline-variant]="!isInvalid('title')"
                [placeholder]="'eventCreate.titlePlaceholder' | t" />
              @if (isInvalid('title')) { <p class="mt-1 text-xs text-error">{{ 'eventCreate.titleRequired' | t }}</p> }
            </div>

            <div>
              <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">{{ 'eventCreate.descLabel' | t }}</label>
              <textarea formControlName="description" rows="4"
                class="w-full px-4 py-3 bg-surface border rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all resize-none"
                [class.border-error]="isInvalid('description')" [class.border-outline-variant]="!isInvalid('description')"
                [placeholder]="'eventCreate.descPlaceholder' | t"></textarea>
              @if (isInvalid('description')) { <p class="mt-1 text-xs text-error">{{ 'eventCreate.descRequired' | t }}</p> }
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">{{ 'eventCreate.cityLabel' | t }}</label>
                <input formControlName="city" type="text"
                  class="w-full px-4 py-3 bg-surface border rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all"
                  [class.border-error]="isInvalid('city')" [class.border-outline-variant]="!isInvalid('city')"
                  [placeholder]="'eventCreate.cityPlaceholder' | t" />
                @if (isInvalid('city')) { <p class="mt-1 text-xs text-error">{{ 'eventCreate.cityRequired' | t }}</p> }
              </div>
              <div>
                <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">{{ 'eventCreate.addressLabel' | t }}</label>
                <input formControlName="address" type="text"
                  class="w-full px-4 py-3 bg-surface border rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all"
                  [class.border-error]="isInvalid('address')" [class.border-outline-variant]="!isInvalid('address')"
                  [placeholder]="'eventCreate.addressPlaceholder' | t" />
                @if (isInvalid('address')) { <p class="mt-1 text-xs text-error">{{ 'eventCreate.addressRequired' | t }}</p> }
              </div>
            </div>

            <div>
              <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">{{ 'eventCreate.categoryLabel' | t }}</label>
              <select formControlName="categoryId"
                class="w-full px-4 py-3 bg-surface border rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all appearance-none"
                [class.border-error]="isInvalid('categoryId')" [class.border-outline-variant]="!isInvalid('categoryId')">
                <option value="">{{ 'eventCreate.selectCategory' | t }}</option>
                @for (cat of categories(); track cat.id) {
                  <option [value]="cat.id">{{ cat.name }}</option>
                }
              </select>
              @if (isInvalid('categoryId')) { <p class="mt-1 text-xs text-error">{{ 'eventCreate.categoryRequired' | t }}</p> }
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">{{ 'eventCreate.capacityLabel' | t }}</label>
                <input formControlName="capacity" type="number" min="1"
                  class="w-full px-4 py-3 bg-surface border rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all"
                  [class.border-error]="isInvalid('capacity')" [class.border-outline-variant]="!isInvalid('capacity')"
                  placeholder="100" />
                @if (isInvalid('capacity')) { <p class="mt-1 text-xs text-error">{{ 'eventCreate.capacityMin' | t }}</p> }
              </div>
              <div>
                <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">{{ 'eventCreate.priceLabel' | t }}</label>
                <input formControlName="price" type="number" min="0" step="0.01"
                  class="w-full px-4 py-3 bg-surface border rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all"
                  [class.border-error]="isInvalid('price')" [class.border-outline-variant]="!isInvalid('price')"
                  [placeholder]="'eventCreate.pricePlaceholder' | t" />
                @if (isInvalid('price')) { <p class="mt-1 text-xs text-error">{{ 'eventCreate.priceRequired' | t }}</p> }
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">{{ 'eventCreate.startsLabel' | t }}</label>
                <input formControlName="startDate" type="datetime-local"
                  class="w-full px-4 py-3 bg-surface border rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all"
                  [class.border-error]="isInvalid('startDate') || (form.errors?.['pastStartDate'] && form.get('startDate')?.touched)"
                  [class.border-outline-variant]="!(isInvalid('startDate') || (form.errors?.['pastStartDate'] && form.get('startDate')?.touched))" />
                @if (isInvalid('startDate')) { <p class="mt-1 text-xs text-error">{{ 'eventCreate.startRequired' | t }}</p> }
                @else if (form.errors?.['pastStartDate'] && form.get('startDate')?.touched) {
                  <p class="mt-1 text-xs text-error">{{ 'eventCreate.pastStartDate' | t }}</p>
                }
              </div>
              <div>
                <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">{{ 'eventCreate.endsLabel' | t }}</label>
                <input formControlName="endDate" type="datetime-local"
                  class="w-full px-4 py-3 bg-surface border rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all"
                  [class.border-error]="isInvalid('endDate') || (form.errors?.['endBeforeStart'] && form.get('endDate')?.touched)"
                  [class.border-outline-variant]="!(isInvalid('endDate') || (form.errors?.['endBeforeStart'] && form.get('endDate')?.touched))" />
                @if (isInvalid('endDate')) { <p class="mt-1 text-xs text-error">{{ 'eventCreate.endRequired' | t }}</p> }
                @else if (form.errors?.['endBeforeStart'] && form.get('endDate')?.touched) {
                  <p class="mt-1 text-xs text-error">{{ 'eventCreate.endBeforeStart' | t }}</p>
                }
              </div>
            </div>

            @if (formError()) {
              <div class="p-3 rounded-lg bg-error-container border border-error/20 text-sm text-on-error-container">{{ formError() }}</div>
            }

            <div class="flex gap-3 pt-2">
              <button type="button" (click)="router.navigate(['/events'])"
                class="px-6 py-3 text-xs font-semibold tracking-widest uppercase text-on-surface-variant border border-outline-variant hover:bg-surface-container rounded-lg transition-colors">
                {{ 'eventCreate.cancel' | t }}
              </button>
              <button type="submit" [disabled]="isLoading()"
                class="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white py-3 rounded-lg text-xs font-semibold tracking-widest uppercase transition-all shadow-[0_4px_20px_rgba(245,158,11,0.2)] hover:shadow-[0_8px_25px_rgba(245,158,11,0.4)] disabled:opacity-60 flex justify-center items-center gap-2">
                @if (isLoading()) {
                  <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                } @else {
                  {{ 'eventCreate.publish' | t }}
                  <span class="material-symbols-outlined" style="font-size:18px">arrow_forward</span>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class EventCreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly eventService = inject(EventService);
  private readonly categoryService = inject(CategoryService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ErrorToastService);
  private readonly i18n = inject(I18nService);
  readonly router = inject(Router);

  readonly categories = signal<CategoryDto[]>([]);
  readonly isLoading = signal(false);
  readonly formError = signal<string | null>(null);

  readonly form = this.fb.group({
    title:       ['', Validators.required],
    description: ['', Validators.required],
    city:        ['', Validators.required],
    address:     ['', Validators.required],
    categoryId:  ['', Validators.required],
    capacity:    [null as number | null, [Validators.required, Validators.min(1)]],
    price:       [0, [Validators.required, Validators.min(0)]],
    startDate:   ['', Validators.required],
    endDate:     ['', Validators.required],
  }, { validators: eventDateValidator });

  ngOnInit(): void {
    this.categoryService.getAll().subscribe(cats => this.categories.set(cats));
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.formError.set(null);
    this.isLoading.set(true);
    const val = this.form.getRawValue();
    const dto = {
      ...val,
      categoryId: Number(val.categoryId),
      startDate: toBackendDateTime(val.startDate!),
      endDate: toBackendDateTime(val.endDate!),
    };
    this.eventService.create(dto as any).subscribe({
      next: event => {
        const userId = this.authService.currentUser()?.id;
        if (userId) this.authService.refreshUser(userId);
        this.toast.show(this.i18n.t('eventCreate.success'), 'success');
        this.router.navigate(['/events', event.id]);
      },
      error: (err: ErrorResponseDto) => {
        this.isLoading.set(false);
        this.formError.set(err?.message ?? this.i18n.t('eventCreate.failed'));
      }
    });
  }
}
