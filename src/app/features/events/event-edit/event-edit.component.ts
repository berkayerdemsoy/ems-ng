import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { CategoryService } from '../../../core/services/category.service';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorToastService } from '../../../shared/components/error-toast/error-toast.service';
import { EventResponseDto, CategoryDto, ErrorResponseDto } from '../../../core/models';
import { toBackendDateTime, toHtmlDatetimeLocal } from '../../../core/utils/date.utils';

@Component({
  selector: 'app-event-edit',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="min-h-screen pt-28 pb-24 px-[max(24px,5vw)] relative">
      <div class="absolute top-32 left-1/4 w-80 h-80 bg-secondary-container/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <div class="max-w-2xl mx-auto">
        <div class="mb-10">
          <span class="text-[11px] font-semibold tracking-[0.15em] uppercase text-on-surface-variant px-4 py-1 rounded-full glass-panel inline-block mb-4">Edit Experience</span>
          <h1 class="text-[48px] leading-[1.2] tracking-[-0.02em] font-light text-on-surface">Edit Event</h1>
          <p class="text-base text-on-surface-variant mt-2">Refine the details of your experience.</p>
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

              <div>
                <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">Title</label>
                <input formControlName="title" type="text"
                  class="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all" />
              </div>

              <div>
                <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">Description</label>
                <textarea formControlName="description" rows="4"
                  class="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all resize-none"></textarea>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">City</label>
                  <input formControlName="city" type="text"
                    class="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all" />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">Address</label>
                  <input formControlName="address" type="text"
                    class="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all" />
                </div>
              </div>

              <div>
                <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">Category</label>
                <select formControlName="categoryId"
                  class="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all appearance-none">
                  @for (cat of categories(); track cat.id) {
                    <option [value]="cat.id">{{ cat.name }}</option>
                  }
                </select>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">Capacity</label>
                  <input formControlName="capacity" type="number" min="1"
                    class="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all" />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">Price (₺)</label>
                  <input formControlName="price" type="number" min="0" step="0.01"
                    class="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">Starts</label>
                  <input formControlName="startDate" type="datetime-local"
                    class="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all" />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">Ends</label>
                  <input formControlName="endDate" type="datetime-local"
                    class="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all" />
                </div>
              </div>

              @if (formError()) {
                <div class="p-3 rounded-lg bg-error-container border border-error/20 text-sm text-on-error-container">{{ formError() }}</div>
              }

              <div class="flex gap-3 pt-2">
                <button type="button" (click)="router.navigate(['/events', eventId])"
                  class="px-6 py-3 text-xs font-semibold tracking-widest uppercase text-on-surface-variant border border-outline-variant hover:bg-surface-container rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" [disabled]="isSaving()"
                  class="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white py-3 rounded-lg text-xs font-semibold tracking-widest uppercase transition-all shadow-[0_4px_20px_rgba(245,158,11,0.2)] hover:shadow-[0_8px_25px_rgba(245,158,11,0.4)] disabled:opacity-60 flex justify-center items-center gap-2">
                  @if (isSaving()) {
                    <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  } @else {
                    Save Changes
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
  readonly router = inject(Router);

  readonly categories = signal<CategoryDto[]>([]);
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly formError = signal<string | null>(null);
  eventId = 0;

  readonly form = this.fb.group({
    title: [''], description: [''], city: [''], address: [''],
    categoryId: [null as number | null], capacity: [null as number | null],
    price: [null as number | null], startDate: [''], endDate: ['']
  });

  ngOnInit(): void {
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));
    this.categoryService.getAll().subscribe(cats => this.categories.set(cats));

    this.eventService.getById(this.eventId).subscribe({
      next: event => {
        const user = this.authService.currentUser();
        if (!user || (event.ownerId !== user.id && user.role !== 'ADMIN')) {
          this.router.navigate(['/events', this.eventId]);
          return;
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
        this.toast.show('Etkinlik güncellendi!', 'success');
        this.router.navigate(['/events', event.id]);
      },
      error: (err: ErrorResponseDto) => {
        this.isSaving.set(false);
        this.formError.set(err?.message ?? 'Güncelleme başarısız.');
      }
    });
  }
}

