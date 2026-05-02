import { Component, inject, signal, computed, effect, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EventService } from '../../../core/services/event.service';
import { CategoryService } from '../../../core/services/category.service';
import { AuthService } from '../../../core/services/auth.service';
import { EventResponseDto, Page, CategoryDto } from '../../../core/models';
import { EventCardComponent } from './event-card.component';
import { toBackendDateTime } from '../../../core/utils/date.utils';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { DatetimePickerComponent } from '../../../shared/components/datetime-picker/datetime-picker.component';
import { CategorySelectComponent } from '../../../shared/components/category-select/category-select.component';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [FormsModule, RouterLink, EventCardComponent, TranslatePipe, DatetimePickerComponent, CategorySelectComponent],
  template: `
    <div class="pt-20 pb-24 relative">
      <!-- Ambient orbs -->
      <div class="absolute top-20 left-10 w-96 h-96 bg-secondary-container/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      <div class="absolute bottom-40 right-20 w-80 h-80 bg-tertiary-container/30 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

      <div class="max-w-7xl mx-auto px-[max(40px,5vw)]">

        <!-- Header -->
        <header class="mb-16 pt-12">
          <div class="flex items-start justify-between mb-6 flex-wrap gap-4">
            <div>
              <h1 class="text-[84px] leading-[1.1] tracking-[-0.04em] font-light text-on-surface">
                {{ 'eventList.title1' | t }}<br/><span class="italic text-secondary-fixed-dim">{{ 'eventList.title2' | t }}</span>
              </h1>
            </div>
            @if (auth.role() === 'EVENT_OWNER' || auth.role() === 'ADMIN') {
              <a routerLink="/events/create"
                 class="mt-8 px-8 py-3 rounded-full bg-secondary-container text-on-secondary-container text-xs font-semibold tracking-widest uppercase hover:bg-amber-400 transition-colors self-end">
                {{ 'eventList.newExperience' | t }}
              </a>
            }
          </div>
          <p class="text-lg text-on-surface-variant max-w-2xl mb-10">
            {{ 'eventList.subtitle' | t }}
          </p>

          <!-- Glass Filter Bar -->
          <div class="glass-card rounded-full p-2 flex flex-col md:flex-row items-center gap-2 max-w-4xl" style="position:relative;z-index:40">
            <div class="flex-1 flex items-center px-4 w-full md:w-auto border-b md:border-b-0 md:border-r border-outline-variant/30 py-2 md:py-0">
              <span class="material-symbols-outlined text-outline mr-3" style="font-size:20px">location_on</span>
              <input [(ngModel)]="cityInput" (ngModelChange)="onCityChange($event)"
                     class="bg-transparent border-none outline-none focus:ring-0 text-base text-on-surface placeholder-on-surface-variant/50 w-full"
                     [placeholder]="'eventList.cityPlaceholder' | t" type="text"/>
            </div>
            <div class="flex-1 w-full md:w-auto py-1 px-2">
              <app-category-select
                [(ngModel)]="selectedCategoryId"
                (ngModelChange)="onCategoryChange($event)"
                [categories]="categories()"
                [label]="'eventList.allCategories' | t" />
            </div>
            <div class="flex-1 w-full md:w-auto py-1 px-2">
              <app-datetime-picker
                [(ngModel)]="startDateInput"
                (ngModelChange)="onDateChange()"
                [showTime]="false"
                [label]="'eventList.dateLabel' | t" />
            </div>
            <button (click)="clearFilters()"
                    class="bg-secondary-container text-on-secondary-container w-full md:w-auto px-8 py-3 rounded-full text-xs font-semibold tracking-widest uppercase hover:bg-amber-400 transition-colors ml-auto md:ml-2">
              @if (hasFilter()) { {{ 'eventList.clearFilter' | t }} } @else { {{ 'eventList.discover' | t }} }
            </button>
          </div>
        </header>

        <!-- Skeleton Loader -->
        @if (isLoading()) {
          <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div class="md:col-span-8 glass-card rounded-xl h-[400px] animate-pulse"></div>
            <div class="md:col-span-4 glass-card rounded-xl h-[400px] animate-pulse"></div>
            <div class="md:col-span-4 glass-card rounded-xl h-64 animate-pulse"></div>
            <div class="md:col-span-4 glass-card rounded-xl h-64 animate-pulse"></div>
            <div class="md:col-span-4 glass-card rounded-xl h-64 animate-pulse"></div>
          </div>
        } @else if (eventsPage()?.empty) {
          <div class="text-center py-24">
            <p class="text-6xl mb-6">✦</p>
            <p class="text-2xl font-light text-on-surface-variant">{{ 'eventList.emptyTitle' | t }}</p>
            <p class="text-base text-on-surface-variant/60 mt-2">{{ 'eventList.emptySubtitle' | t }}</p>
          </div>
        } @else {
            <!-- Bento Grid -->
            <section class="grid grid-cols-1 md:grid-cols-12 gap-6">
              @let events = eventsPage()!.content;
              @for (event of events; track event.id; let i = $index) {
                <app-event-card
                  [event]="event"
                  [featured]="i === 0 && !hasFilter()"
                  [class]="(i === 0 && !hasFilter()) ? 'md:col-span-8' : 'md:col-span-4'" />
              }
            </section>

          <!-- Load More / Pagination -->
          @if (!eventsPage()!.last) {
            <div class="mt-16 text-center">
              <button (click)="onPageChange(currentPage() + 1)"
                      class="glass-card border border-amber-500/30 px-8 py-3 rounded-full text-xs font-semibold tracking-widest text-secondary-container uppercase hover:bg-amber-50 transition-colors inline-flex items-center gap-2">
                <span class="material-symbols-outlined" style="font-size:18px">expand_more</span>
                {{ 'eventList.loadMore' | t }}
              </button>
            </div>
          }
        }

        <!-- Results count -->
        @if (eventsPage() && !isLoading()) {
          <p class="text-sm text-on-surface-variant/60 mt-6 text-center">
            {{ eventsPage()!.totalElements }} {{ 'eventList.totalFound' | t }}
          </p>
        }
      </div>
    </div>
  `
})
export class EventListComponent implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly categoryService = inject(CategoryService);
  readonly auth = inject(AuthService);

  readonly eventsPage = signal<Page<EventResponseDto> | null>(null);
  readonly categories = signal<CategoryDto[]>([]);
  readonly isLoading = signal(false);
  readonly currentPage = signal(0);
  readonly cityFilter = signal('');
  readonly categoryFilter = signal<number | null>(null);
  readonly startDate = signal('');

  readonly hasFilter = computed(() => !!this.cityFilter() || !!this.categoryFilter() || !!this.startDate());

  cityInput = '';
  selectedCategoryId: number | null = null;
  startDateInput: string | null = null;

  constructor() {
    effect(() => {
      this.loadEvents(this.currentPage(), this.cityFilter(), this.categoryFilter(), this.startDate());
    });
  }

  ngOnInit(): void {
    this.categoryService.getAll().subscribe(cats => this.categories.set(cats));
  }

  private loadEvents(page: number, city: string, catId: number | null, start: string): void {
    this.isLoading.set(true);
    let obs$;
    if (city) {
      obs$ = this.eventService.getByCity(city, page);
    } else if (catId) {
      obs$ = this.eventService.getByCategory(catId, page);
    } else if (start) {
      const end = new Date(); end.setFullYear(end.getFullYear() + 2);
      obs$ = this.eventService.getByDateRange(
        toBackendDateTime(start),
        toBackendDateTime(end.toISOString().slice(0, 16)),
        page
      );
    } else {
      obs$ = this.eventService.getAll(page);
    }
    obs$.subscribe({
      next: data => { this.eventsPage.set(data); this.isLoading.set(false); },
      error: () => this.isLoading.set(false)
    });
  }

  clearFilters(): void {
    this.cityFilter.set(''); this.categoryFilter.set(null); this.startDate.set('');
    this.cityInput = ''; this.selectedCategoryId = null; this.startDateInput = null;
    this.currentPage.set(0);
  }

  onCityChange(val: string): void     { this.cityFilter.set(val);  this.currentPage.set(0); }
  onCategoryChange(val: number | null): void { this.categoryFilter.set(val); this.currentPage.set(0); }
  onDateChange(): void  { this.startDate.set(this.startDateInput ?? ''); this.currentPage.set(0); }
  onPageChange(page: number): void    { this.currentPage.set(page); }
}
