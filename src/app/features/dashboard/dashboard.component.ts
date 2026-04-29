import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { EventService } from '../../core/services/event.service';
import { EventResponseDto, Page } from '../../core/models';
import { EventStatusPipe } from '../../shared/pipes/event-status.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, DatePipe, DecimalPipe, EventStatusPipe],
  template: `
    <div class="min-h-screen flex pt-20 bg-background">
      <!-- Light Leaks -->
      <div class="light-leak w-[300px] h-[300px] top-[-100px] right-[10%] bg-[rgba(254,170,0,0.15)]"></div>
      <div class="light-leak w-[300px] h-[300px] bottom-[20%] left-[20%] bg-[rgba(254,170,0,0.08)]"></div>

      <!-- Sidebar -->
      <aside class="h-[calc(100vh-80px)] w-64 fixed left-0 top-20 bg-[#F4F2EE]/60 backdrop-blur-lg border-r border-neutral-200 flex flex-col py-8 px-4 space-y-4 z-40 hidden md:flex">
        <div class="flex items-center space-x-3 mb-8 px-4">
          <div class="w-10 h-10 rounded-full bg-secondary-container/30 flex items-center justify-center border border-secondary-container/40 text-sm font-bold text-secondary">
            {{ initials() }}
          </div>
          <div>
            <h2 class="font-semibold text-on-surface text-sm">{{ auth.currentUser()?.firstName }} {{ auth.currentUser()?.lastName }}</h2>
            <p class="text-xs text-on-surface-variant">{{ auth.currentUser()?.role }}</p>
          </div>
        </div>

        <nav class="flex-1 flex flex-col space-y-2">
          <a routerLink="/dashboard" [routerLinkActiveOptions]="{exact:true}"
             routerLinkActive="text-amber-600 bg-white/50 border-l-2 border-amber-500"
             class="flex items-center space-x-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-neutral-100/50 hover:translate-x-1 transition-all text-sm uppercase tracking-widest">
            <span class="material-symbols-outlined" style="font-size:20px">dashboard</span>
            <span>Overview</span>
          </a>
          <a routerLink="/events"
             class="flex items-center space-x-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-neutral-100/50 hover:translate-x-1 transition-all text-sm uppercase tracking-widest">
            <span class="material-symbols-outlined" style="font-size:20px">theater_comedy</span>
            <span>All Events</span>
          </a>
          <a routerLink="/my-participations"
             class="flex items-center space-x-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-neutral-100/50 hover:translate-x-1 transition-all text-sm uppercase tracking-widest">
            <span class="material-symbols-outlined" style="font-size:20px">local_activity</span>
            <span>My Tickets</span>
          </a>
          @if (auth.role() === 'ADMIN') {
            <a routerLink="/admin/users"
               routerLinkActive="text-amber-600 bg-white/50"
               class="flex items-center space-x-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-neutral-100/50 hover:translate-x-1 transition-all text-sm uppercase tracking-widest">
              <span class="material-symbols-outlined" style="font-size:20px">manage_accounts</span>
              <span>Users</span>
            </a>
            <a routerLink="/admin/categories"
               routerLinkActive="text-amber-600 bg-white/50"
               class="flex items-center space-x-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-neutral-100/50 hover:translate-x-1 transition-all text-sm uppercase tracking-widest">
              <span class="material-symbols-outlined" style="font-size:20px">layers</span>
              <span>Categories</span>
            </a>
          }
          <a routerLink="/profile"
             routerLinkActive="text-amber-600 bg-white/50"
             class="flex items-center space-x-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-neutral-100/50 hover:translate-x-1 transition-all text-sm uppercase tracking-widest">
            <span class="material-symbols-outlined" style="font-size:20px">settings</span>
            <span>Settings</span>
          </a>
        </nav>

        <div class="mt-auto px-2">
          <a routerLink="/events/create"
             class="w-full py-3 px-4 rounded-lg bg-amber-500 text-white text-sm uppercase tracking-widest shadow-sm hover:bg-amber-600 transition-colors flex items-center justify-center space-x-2">
            <span class="material-symbols-outlined" style="font-size:18px">add</span>
            <span>Create Event</span>
          </a>
        </div>
      </aside>

      <!-- Main Canvas -->
      <main class="flex-1 md:ml-64 p-[max(40px,5vw)] flex flex-col gap-[4rem] min-h-screen relative">
        <!-- Header -->
        <header class="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-surface-variant pb-8">
          <div>
            <p class="text-[11px] font-semibold tracking-[0.15em] text-outline uppercase mb-2">Welcome Back</p>
            <h1 class="text-[48px] leading-[1.2] tracking-[-0.02em] text-on-surface">Dashboard</h1>
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
              <p class="text-base text-on-surface-variant mb-1">Total Events</p>
              <h3 class="text-3xl font-medium text-on-surface">{{ totalEvents() }}</h3>
            </div>
          </div>
          <div class="glass-card rounded-xl p-8 flex flex-col justify-between relative overflow-hidden">
            <div class="flex justify-between items-start mb-[4rem]">
              <div class="p-2 bg-surface rounded-lg border border-surface-variant">
                <span class="material-symbols-outlined text-primary" style="font-size:24px">local_activity</span>
              </div>
              @if (upcomingCount() > 0) {
                <span class="text-[11px] font-semibold text-secondary bg-secondary-container/30 px-2 py-1 rounded-full uppercase tracking-widest">{{ upcomingCount() }} upcoming</span>
              }
            </div>
            <div>
              <p class="text-base text-on-surface-variant mb-1">Total Attendees</p>
              <h3 class="text-3xl font-medium text-on-surface">{{ totalAttendees() }}</h3>
            </div>
          </div>
          <div class="glass-card rounded-xl p-8 flex flex-col justify-between relative overflow-hidden">
            <div class="flex justify-between items-start mb-[4rem]">
              <div class="p-2 bg-surface rounded-lg border border-surface-variant">
                <span class="material-symbols-outlined text-primary" style="font-size:24px">visibility</span>
              </div>
            </div>
            <div>
              <p class="text-base text-on-surface-variant mb-1">Avg. Fill Rate</p>
              <h3 class="text-3xl font-medium text-on-surface">{{ avgFillRate() }}%</h3>
            </div>
          </div>
        </section>

        <!-- My Events Section -->
        <section class="flex flex-col gap-8">
          <div class="flex justify-between items-center border-b border-surface-variant pb-2">
            <h2 class="text-3xl font-medium text-on-surface">My Events</h2>
            <a routerLink="/events" class="text-[11px] font-semibold text-secondary hover:text-on-secondary-container transition-colors uppercase tracking-widest flex items-center space-x-1">
              <span>View All</span>
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
              <p class="text-lg text-on-surface-variant">No events yet. Create your first experience!</p>
              <a routerLink="/events/create"
                 class="inline-block mt-6 px-6 py-3 rounded-full bg-secondary-container text-on-secondary-container text-xs font-semibold tracking-widest uppercase hover:bg-amber-400 transition-colors">
                Create Event
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
                          <p class="text-[10px] text-outline uppercase tracking-widest">Attendees</p>
                          <p class="text-sm text-on-surface">{{ event.currentAttendees }} / {{ event.capacity }}</p>
                        </div>
                        <div class="text-center">
                          <p class="text-[10px] text-outline uppercase tracking-widest">Fill Rate</p>
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

  readonly myEvents = signal<EventResponseDto[]>([]);
  readonly isLoading = signal(true);
  readonly today = new Date();

  readonly totalEvents = computed(() => this.myEvents().length);
  readonly totalAttendees = computed(() => this.myEvents().reduce((sum, e) => sum + e.currentAttendees, 0));
  readonly upcomingCount = computed(() => this.myEvents().filter(e => e.status === 'UPCOMING').length);
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

  initials(): string {
    const u = this.auth.currentUser();
    if (!u) return '?';
    return (u.firstName[0] + u.lastName[0]).toUpperCase();
  }
}
