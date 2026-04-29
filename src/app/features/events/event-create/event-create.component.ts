import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { CategoryService } from '../../../core/services/category.service';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorToastService } from '../../../shared/components/error-toast/error-toast.service';
import { CategoryDto, ErrorResponseDto } from '../../../core/models';
import { toBackendDateTime } from '../../../core/utils/date.utils';

@Component({
  selector: 'app-event-create',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="min-h-screen pt-28 pb-24 px-[max(24px,5vw)] relative">
      <div class="absolute top-32 right-1/4 w-80 h-80 bg-secondary-container/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <div class="max-w-2xl mx-auto">
        <div class="mb-10">
          <span class="text-[11px] font-semibold tracking-[0.15em] uppercase text-on-surface-variant px-4 py-1 rounded-full glass-panel inline-block mb-4">New Experience</span>
          <h1 class="text-[48px] leading-[1.2] tracking-[-0.02em] font-light text-on-surface">Create Event</h1>
          <p class="text-base text-on-surface-variant mt-2">Share your curated experience with the world.</p>
        </div>

        <div class="bg-surface-container-lowest/80 backdrop-blur-xl rounded-xl p-8 border border-outline-variant/30 shadow-[0_30px_60px_rgba(28,28,23,0.05)]">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">

            <div>
              <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">Title *</label>
              <input formControlName="title" type="text"
                class="w-full px-4 py-3 bg-surface border rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all"
                [class.border-error]="isInvalid('title')" [class.border-outline-variant]="!isInvalid('title')"
                placeholder="Event title" />
              @if (isInvalid('title')) { <p class="mt-1 text-xs text-error">Title is required.</p> }
            </div>

            <div>
              <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">Description *</label>
              <textarea formControlName="description" rows="4"
                class="w-full px-4 py-3 bg-surface border rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all resize-none"
                [class.border-error]="isInvalid('description')" [class.border-outline-variant]="!isInvalid('description')"
                placeholder="Describe the experience..."></textarea>
              @if (isInvalid('description')) { <p class="mt-1 text-xs text-error">Description is required.</p> }
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">City *</label>
                <input formControlName="city" type="text"
                  class="w-full px-4 py-3 bg-surface border rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all"
                  [class.border-error]="isInvalid('city')" [class.border-outline-variant]="!isInvalid('city')"
                  placeholder="Istanbul" />
                @if (isInvalid('city')) { <p class="mt-1 text-xs text-error">City is required.</p> }
              </div>
              <div>
                <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">Address *</label>
                <input formControlName="address" type="text"
                  class="w-full px-4 py-3 bg-surface border rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all"
                  [class.border-error]="isInvalid('address')" [class.border-outline-variant]="!isInvalid('address')"
                  placeholder="Venue name & street" />
                @if (isInvalid('address')) { <p class="mt-1 text-xs text-error">Address is required.</p> }
              </div>
            </div>

            <div>
              <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">Category *</label>
              <select formControlName="categoryId"
                class="w-full px-4 py-3 bg-surface border rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all appearance-none"
                [class.border-error]="isInvalid('categoryId')" [class.border-outline-variant]="!isInvalid('categoryId')">
                <option value="">Select a category</option>
                @for (cat of categories(); track cat.id) {
                  <option [value]="cat.id">{{ cat.name }}</option>
                }
              </select>
              @if (isInvalid('categoryId')) { <p class="mt-1 text-xs text-error">Category is required.</p> }
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">Capacity *</label>
                <input formControlName="capacity" type="number" min="1"
                  class="w-full px-4 py-3 bg-surface border rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all"
                  [class.border-error]="isInvalid('capacity')" [class.border-outline-variant]="!isInvalid('capacity')"
                  placeholder="100" />
                @if (isInvalid('capacity')) { <p class="mt-1 text-xs text-error">Min. 1 attendee.</p> }
              </div>
              <div>
                <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">Price (₺) *</label>
                <input formControlName="price" type="number" min="0" step="0.01"
                  class="w-full px-4 py-3 bg-surface border rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all"
                  [class.border-error]="isInvalid('price')" [class.border-outline-variant]="!isInvalid('price')"
                  placeholder="0 = Free" />
                @if (isInvalid('price')) { <p class="mt-1 text-xs text-error">Price is required.</p> }
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">Starts *</label>
                <input formControlName="startDate" type="datetime-local"
                  class="w-full px-4 py-3 bg-surface border rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all"
                  [class.border-error]="isInvalid('startDate')" [class.border-outline-variant]="!isInvalid('startDate')" />
                @if (isInvalid('startDate')) { <p class="mt-1 text-xs text-error">Start date is required.</p> }
              </div>
              <div>
                <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">Ends *</label>
                <input formControlName="endDate" type="datetime-local"
                  class="w-full px-4 py-3 bg-surface border rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all"
                  [class.border-error]="isInvalid('endDate')" [class.border-outline-variant]="!isInvalid('endDate')" />
                @if (isInvalid('endDate')) { <p class="mt-1 text-xs text-error">End date is required.</p> }
              </div>
            </div>

            @if (formError()) {
              <div class="p-3 rounded-lg bg-error-container border border-error/20 text-sm text-on-error-container">{{ formError() }}</div>
            }

            <div class="flex gap-3 pt-2">
              <button type="button" (click)="router.navigate(['/events'])"
                class="px-6 py-3 text-xs font-semibold tracking-widest uppercase text-on-surface-variant border border-outline-variant hover:bg-surface-container rounded-lg transition-colors">
                Cancel
              </button>
              <button type="submit" [disabled]="isLoading()"
                class="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white py-3 rounded-lg text-xs font-semibold tracking-widest uppercase transition-all shadow-[0_4px_20px_rgba(245,158,11,0.2)] hover:shadow-[0_8px_25px_rgba(245,158,11,0.4)] disabled:opacity-60 flex justify-center items-center gap-2">
                @if (isLoading()) {
                  <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                } @else {
                  Publish Experience
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
  });

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
        if (userId) this.authService.refreshUser(userId); // role may have changed
        this.toast.show('Etkinlik başarıyla oluşturuldu!', 'success');
        this.router.navigate(['/events', event.id]);
      },
      error: (err: ErrorResponseDto) => {
        this.isLoading.set(false);
        this.formError.set(err?.message ?? 'Etkinlik oluşturulamadı.');
      }
    });
  }
}

