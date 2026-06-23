import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { EventService } from '../../core/services/event.service';
import { I18nService } from '../../core/services/i18n.service';
import { EventResponseDto } from '../../core/models';
import { EventStatusPipe } from '../../shared/pipes/event-status.pipe';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe, EventStatusPipe, TranslatePipe],
  template: `
    <div class="min-h-screen pt-20 pb-24 bg-background relative">
      <!-- Light Leaks -->
      <div class="light-leak w-[300px] h-[300px] top-[-100px] right-[10%] bg-[rgba(254,170,0,0.15)]"></div>
      <div class="light-leak w-[300px] h-[300px] bottom-[20%] left-[20%] bg-[rgba(254,170,0,0.08)]"></div>

      <main class="max-w-7xl mx-auto px-[max(24px,5vw)] flex flex-col gap-[4rem] pt-10">
        <!-- Header -->
        <header class="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-surface-variant pb-8">
          <div>
            <p class="text-[11px] font-semibold tracking-[0.15em] text-outline uppercase mb-2">{{ 'dashboard.welcome' | t }}</p>
            <h1 class="text-[48px] leading-[1.2] tracking-[-0.02em] text-on-surface">{{ 'dashboard.title' | t }}</h1>
          </div>
          <div class="flex items-center space-x-4">
            <div class="glass-card px-4 py-2 rounded-full flex items-center space-x-2">
              <span class="material-symbols-outlined text-outline" style="font-size:18px">calendar_today</span>
              <span class="text-base text-on-surface-variant">{{ today | date:'dd MMM yyyy' }}</span>
            </div>
          </div>
        </header>

        <!-- Metrics Bento Grid -->
        <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="glass-card rounded-xl p-8 flex flex-col justify-between relative overflow-hidden">
            <div class="absolute top-0 right-0 w-32 h-32 bg-secondary-container/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div class="flex justify-between items-start mb-[4rem]">
              <div class="p-2 bg-surface rounded-lg border border-surface-variant">
                <span class="material-symbols-outlined text-secondary" style="font-size:24px">payments</span>
              </div>
            </div>
            <div>
              <p class="text-base text-on-surface-variant mb-1 select-none">{{ 'dashboard.totalEvents' | t }}</p>
              <h3 class="text-3xl font-medium text-on-surface select-none">{{ totalEvents() }}</h3>
            </div>
          </div>
          <div class="glass-card rounded-xl p-8 flex flex-col justify-between relative overflow-hidden">
            <div class="flex justify-between items-start mb-[4rem]">
              <div class="p-2 bg-surface rounded-lg border border-surface-variant">
                <span class="material-symbols-outlined text-primary" style="font-size:24px">local_activity</span>
              </div>
              @if (upcomingCount() > 0) {
                <span class="text-[11px] font-semibold text-secondary bg-secondary-container/30 px-2 py-1 rounded-full uppercase tracking-widest select-none">{{ upcomingCount() }} {{ 'dashboard.upcoming' | t }}</span>
              }
            </div>
            <div>
              <p class="text-base text-on-surface-variant mb-1 select-none">{{ 'dashboard.totalAttendees' | t }}</p>
              <h3 class="text-3xl font-medium text-on-surface select-none">{{ totalAttendees() }}</h3>
            </div>
          </div>
          <div class="glass-card rounded-xl p-8 flex flex-col justify-between relative overflow-hidden">
            <div class="flex justify-between items-start mb-[4rem]">
              <div class="p-2 bg-surface rounded-lg border border-surface-variant">
                <span class="material-symbols-outlined text-primary" style="font-size:24px">visibility</span>
              </div>
            </div>
            <div>
              <p class="text-base text-on-surface-variant mb-1 select-none">{{ 'dashboard.avgFillRate' | t }}</p>
              <h3 class="text-3xl font-medium text-on-surface select-none">{{ avgFillRate() }}%</h3>
            </div>
          </div>
        </section>

        <!-- My Events Section -->
        <section class="flex flex-col gap-8">
          <div class="flex justify-between items-center border-b border-surface-variant pb-2">
            <h2 class="text-3xl font-medium text-on-surface">{{ 'dashboard.myEvents' | t }}</h2>
            <a routerLink="/events" class="text-[11px] font-semibold text-secondary hover:text-on-secondary-container transition-colors uppercase tracking-widest flex items-center space-x-1">
              <span>{{ 'dashboard.viewAll' | t }}</span>
              <span class="material-symbols-outlined" style="font-size:14px">arrow_forward</span>
            </a>
          </div>

          @if (isLoading()) {
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
              @for (i of [1,2]; track i) {
                <div class="glass-card rounded-xl h-40 animate-pulse"></div>
              }
            </div>
          } @else if (myEvents().length === 0) {
            <div class="glass-card rounded-xl p-12 text-center">
              <span class="material-symbols-outlined text-on-surface-variant text-5xl block mb-4">event_busy</span>
              <p class="text-lg text-on-surface-variant">{{ 'dashboard.noEvents' | t }}</p>
              <a routerLink="/events/create"
                 class="inline-block mt-6 px-6 py-3 rounded-full bg-secondary-container text-on-secondary-container text-xs font-semibold tracking-widest uppercase hover:bg-amber-300 transition-colors">
                {{ 'dashboard.createEventLink' | t }}
              </a>
            </div>
          } @else {
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
              @for (event of myEvents(); track event.id) {
                <div class="glass-card rounded-xl p-2 flex flex-col sm:flex-row gap-4 items-center group">
                  <div class="w-full sm:w-48 h-32 rounded-lg overflow-hidden relative flex-shrink-0 bg-gradient-to-br from-surface-container to-surface-container-high">
                    <div class="absolute inset-0 flex items-center justify-center">
                      <span class="material-symbols-outlined text-on-surface-variant/30" style="font-size:48px">event</span>
                    </div>
                    @let status = event.status | eventStatus;
                    <div class="absolute bottom-2 left-2 px-2 py-1 bg-white/20 backdrop-blur-md rounded text-white text-[10px] uppercase tracking-widest border border-white/30">
                      {{ status.label }}
                    </div>
                  </div>
                  <div class="flex-1 py-2 pr-4 w-full">
                    <a [routerLink]="['/events', event.id]"
                       class="text-lg font-medium text-on-surface hover:text-secondary transition-colors mb-1 block">
                      {{ event.title }}
                    </a>
                    <div class="flex items-center space-x-2 text-on-surface-variant text-sm mb-3">
                      <span class="material-symbols-outlined" style="font-size:16px">calendar_month</span>
                      <span>{{ event.startDate | date:'dd MMM yyyy' }}</span>
                      <span class="w-1 h-1 bg-outline-variant rounded-full mx-1"></span>
                      <span class="material-symbols-outlined" style="font-size:16px">location_on</span>
                      <span>{{ event.city }}</span>
                    </div>
                    <div class="flex items-center justify-between mt-auto pt-4 border-t border-surface-variant/50">
                      <div class="flex space-x-4">
                        <div class="text-center">
                          <p class="text-[10px] text-outline uppercase tracking-widest">{{ 'dashboard.attendees' | t }}</p>
                          <p class="text-sm text-on-surface">{{ event.currentAttendees }} / {{ event.capacity }}</p>
                        </div>
                        <div class="text-center">
                          <p class="text-[10px] text-outline uppercase tracking-widest">{{ 'dashboard.fillRate' | t }}</p>
                          <p class="text-sm text-on-surface">{{ ((event.currentAttendees / event.capacity) * 100) | number:'1.0-0' }}%</p>
                        </div>
                      </div>
                      <div class="flex gap-2">
                        <a [routerLink]="['/events', event.id, 'edit']"
                           class="p-2 rounded-full hover:bg-surface-variant transition-colors border border-transparent hover:border-outline-variant">
                          <span class="material-symbols-outlined text-on-surface-variant" style="font-size:18px">edit</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </section>
      </main>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly eventService = inject(EventService);
  readonly i18n = inject(I18nService);

  readonly myEvents = signal<EventResponseDto[]>([]);
  readonly isLoading = signal(true);
  readonly today = new Date();

  readonly totalEvents = computed(() => this.myEvents().length);
  readonly totalAttendees = computed(() => this.myEvents().reduce((sum, e) => sum + e.currentAttendees, 0));
  readonly upcomingCount = computed(() => {
    const now = new Date();
    const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    return this.myEvents().filter(e =>
      e.status === 'UPCOMING' && new Date(e.startDate) <= twoWeeks
    ).length;
  });
  readonly avgFillRate = computed(() => {
    const events = this.myEvents();
    if (!events.length) return 0;
    const avg = events.reduce((sum, e) => sum + (e.currentAttendees / e.capacity), 0) / events.length;
    return Math.round(avg * 100);
  });

  ngOnInit(): void {
    const userId = this.auth.currentUser()?.id;
    this.eventService.getAll(0, 100).subscribe({
      next: page => {
        const mine = userId
          ? page.content.filter(e => e.ownerId === userId)
          : page.content;
        this.myEvents.set(mine);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }
}

