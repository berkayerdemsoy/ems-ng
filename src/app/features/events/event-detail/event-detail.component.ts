import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { EventService } from '../../../core/services/event.service';
import { ParticipationService } from '../../../core/services/participation.service';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorToastService } from '../../../shared/components/error-toast/error-toast.service';
import { EventResponseDto, ErrorResponseDto } from '../../../core/models';
import { AvailableSeatsPipe } from '../../../shared/pipes/available-seats.pipe';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, CurrencyPipe, DecimalPipe, AvailableSeatsPipe],
  template: `
    <div class="min-h-screen flex flex-col pt-20">

      @if (isLoading()) {
        <div class="flex-grow flex items-center justify-center">
          <div class="w-12 h-12 rounded-full border-2 border-secondary-container border-t-transparent animate-spin"></div>
        </div>
      } @else if (event()) {
        @let e = event()!;

        <!-- Hero Section (event-detail.html style) -->
        <section class="relative w-full min-h-[500px] flex items-end pb-[max(40px,5vw)] px-[max(40px,5vw)]">
          <div class="absolute inset-0 bg-gradient-to-tr from-surface-container to-surface pointer-events-none -z-10"></div>
          <div class="absolute top-1/4 right-1/4 w-[40vw] h-[40vw] bg-secondary-container/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

          <div class="w-full max-w-7xl mx-auto flex flex-col gap-4">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="px-4 py-1 rounded-full bg-surface-container-highest/50 backdrop-blur-md border border-white/20 text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant">
                {{ e.category.name }}
              </span>
              <span [class]="statusBadge(e.status)"
                    class="px-4 py-1 rounded-full backdrop-blur-md border text-[11px] font-semibold tracking-widest uppercase">
                {{ statusLabel(e.status) }}
              </span>
            </div>
            <h1 class="text-[84px] leading-[1.1] tracking-[-0.04em] font-light text-on-background max-w-4xl">{{ e.title }}</h1>
            <p class="text-3xl font-light text-on-surface-variant max-w-2xl">{{ e.city }} · {{ e.address }}</p>

            <!-- Owner actions -->
            @if (isOwnerOrAdmin()) {
              <div class="flex gap-3 mt-2">
                <a [routerLink]="['/events', e.id, 'edit']"
                   class="px-6 py-2 rounded-full glass-panel text-on-surface text-xs font-semibold tracking-widest uppercase hover:bg-surface-container transition-colors">
                  <span class="material-symbols-outlined" style="font-size:16px">edit</span> Edit
                </a>
                <button (click)="deleteEvent()"
                        class="px-6 py-2 rounded-full bg-error-container text-on-error-container text-xs font-semibold tracking-widest uppercase hover:bg-error hover:text-on-error transition-colors">
                  <span class="material-symbols-outlined" style="font-size:16px">delete</span> Delete
                </button>
              </div>
            }
          </div>
        </section>

        <!-- Bento Grid Content -->
        <section class="max-w-7xl mx-auto px-[max(40px,5vw)] py-[8rem] w-full">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

            <!-- Left: About + Organizer -->
            <div class="lg:col-span-8 flex flex-col gap-6">
              <!-- About Card -->
              <div class="bg-surface-container-lowest/80 backdrop-blur-xl rounded-xl p-8 border border-outline-variant/30 shadow-[0_20px_40px_rgba(28,28,23,0.03)] relative overflow-hidden group">
                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary-container/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <h2 class="text-3xl font-medium text-on-surface mb-4">About the Event</h2>
                <p class="text-lg text-on-surface-variant leading-[1.6] mb-8 whitespace-pre-wrap">{{ e.description }}</p>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-outline-variant/20">
                  <div>
                    <p class="text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-1">Start Date</p>
                    <p class="text-base text-on-surface">{{ e.startDate | date:'dd MMM yyyy' }}</p>
                    <p class="text-sm text-on-surface-variant">{{ e.startDate | date:'HH:mm' }}</p>
                  </div>
                  <div>
                    <p class="text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-1">End Date</p>
                    <p class="text-base text-on-surface">{{ e.endDate | date:'dd MMM yyyy' }}</p>
                    <p class="text-sm text-on-surface-variant">{{ e.endDate | date:'HH:mm' }}</p>
                  </div>
                  <div class="sm:col-span-2">
                    <p class="text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-1">Venue</p>
                    <p class="text-base text-on-surface">{{ e.city }}</p>
                    <p class="text-sm text-on-surface-variant">{{ e.address }}</p>
                  </div>
                </div>
              </div>

              <!-- Organized By -->
              <div class="bg-surface-container-lowest/80 backdrop-blur-xl rounded-xl p-8 border border-outline-variant/30 shadow-[0_20px_40px_rgba(28,28,23,0.03)]">
                <h3 class="text-3xl font-medium text-on-surface mb-8">Organized By</h3>
                <div class="flex items-center gap-8">
                  <div class="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center text-2xl font-light text-on-surface-variant border border-outline-variant/30 shrink-0">
                    <span class="material-symbols-outlined">person</span>
                  </div>
                  <div>
                    <p class="text-lg font-medium text-on-surface">{{ e.ownerEmail }}</p>
                    <p class="text-base text-on-surface-variant">Event Organizer</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Registration + Capacity -->
            <div class="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
              <!-- Registration Card -->
              <div class="bg-surface-container-lowest/90 backdrop-blur-2xl rounded-xl p-8 border border-outline-variant/30 shadow-[0_30px_60px_rgba(28,28,23,0.05)]">
                <h3 class="text-3xl font-medium text-on-surface mb-1">Registration</h3>
                <p class="text-base text-on-surface-variant mb-8">Secure your spot at this experience.</p>
                <div class="flex justify-between items-end mb-[4rem]">
                  <span class="text-[48px] leading-[1.2] tracking-[-0.02em] font-light text-on-surface">
                    {{ e.price === 0 ? 'Free' : (e.price | currency:'TRY':'symbol-narrow':'1.0-0') }}
                  </span>
                  @if (e.price > 0) {
                    <span class="text-base text-on-surface-variant pb-2">/ person</span>
                  }
                </div>

                @if (alreadyJoined()) {
                  <div class="w-full py-4 rounded-lg bg-secondary-fixed/20 border border-secondary-container/30 flex items-center justify-center gap-2 text-secondary text-xs font-semibold tracking-widest uppercase">
                    <span class="material-symbols-outlined" style="font-size:18px">check_circle</span>
                    You're Registered
                  </div>
                } @else if ((e | availableSeats) <= 0) {
                  <div class="w-full py-4 rounded-lg bg-surface-container text-on-surface-variant text-xs font-semibold tracking-widest uppercase text-center">
                    Sold Out
                  </div>
                } @else if (e.status === 'CANCELLED' || e.status === 'COMPLETED') {
                  <div class="w-full py-4 rounded-lg bg-surface-container text-on-surface-variant text-xs font-semibold tracking-widest uppercase text-center">
                    Registration Closed
                  </div>
                } @else {
                  <button (click)="joinEvent()" [disabled]="isJoining()"
                          class="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white py-4 rounded-lg text-xs font-semibold tracking-widest uppercase transition-all shadow-[0_4px_20px_rgba(245,158,11,0.2)] hover:shadow-[0_8px_25px_rgba(245,158,11,0.4)] disabled:opacity-60 flex justify-center items-center gap-2">
                    @if (isJoining()) {
                      <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    } @else {
                      <span>Register Now</span>
                      <span class="material-symbols-outlined" style="font-size:18px">arrow_forward</span>
                    }
                  </button>
                }
              </div>

              <!-- Capacity Card -->
              <div class="bg-surface-container/50 backdrop-blur-sm rounded-xl p-8 border border-outline-variant/20">
                <div class="flex items-center justify-between mb-4">
                  <h4 class="text-lg font-medium text-on-surface">Capacity Status</h4>
                  <span class="material-symbols-outlined text-secondary-container">group</span>
                </div>
                @let pct = (e.currentAttendees / e.capacity) * 100;
                <div class="w-full bg-surface-variant rounded-full h-2 mb-2">
                  <div class="bg-secondary-container h-2 rounded-full transition-all" [style.width.%]="pct"></div>
                </div>
                <div class="flex justify-between text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant">
                  <span>{{ pct | number:'1.0-0' }}% Full</span>
                  <span>{{ (e | availableSeats) }} spots left</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Footer nav -->
        <div class="max-w-7xl mx-auto px-[max(40px,5vw)] pb-12">
          <a routerLink="/events" class="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-secondary transition-colors">
            <span class="material-symbols-outlined" style="font-size:18px">arrow_back</span>
            Back to Discover
          </a>
        </div>
      }
    </div>
  `
})
export class EventDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);
  private readonly participationService = inject(ParticipationService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ErrorToastService);
  readonly router = inject(Router);

  readonly event = signal<EventResponseDto | null>(null);
  readonly isLoading = signal(true);
  readonly isJoining = signal(false);
  readonly alreadyJoined = signal(false);

  readonly isOwnerOrAdmin = computed(() => {
    const user = this.authService.currentUser();
    const e = this.event();
    if (!user || !e) return false;
    return e.ownerId === user.id || user.role === 'ADMIN';
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadEvent(id);
  }

  private loadEvent(id: number): void {
    this.isLoading.set(true);
    this.eventService.getById(id).subscribe({
      next: e => { this.event.set(e); this.isLoading.set(false); },
      error: () => { this.isLoading.set(false); this.router.navigate(['/events']); }
    });
  }

  statusLabel(s: string): string {
    const m: Record<string, string> = { UPCOMING: 'Upcoming', ONGOING: 'Live Now', COMPLETED: 'Completed', CANCELLED: 'Cancelled' };
    return m[s] ?? s;
  }

  statusBadge(s: string): string {
    const m: Record<string, string> = {
      UPCOMING:  'bg-secondary-container/20 text-secondary border-secondary-container/30',
      ONGOING:   'bg-green-100 text-green-800 border-green-200',
      COMPLETED: 'bg-surface-container-highest text-on-surface border-outline-variant/30',
      CANCELLED: 'bg-error-container text-on-error-container border-error/20',
    };
    return m[s] ?? '';
  }

  joinEvent(): void {
    const e = this.event(); const user = this.authService.currentUser();
    if (!e || !user) return;
    this.isJoining.set(true);
    this.participationService.register({ eventId: e.id, participantEmail: user.email }).subscribe({
      next: () => {
        this.isJoining.set(false); this.alreadyJoined.set(true);
        this.toast.show('Successfully registered for this event!', 'success');
        this.loadEvent(e.id);
      },
      error: (err: ErrorResponseDto) => {
        this.isJoining.set(false);
        if (err?.errorCode === 'ALREADY_EXISTS') { this.alreadyJoined.set(true); this.toast.show('You are already registered.', 'info'); }
      }
    });
  }

  deleteEvent(): void {
    const e = this.event(); if (!e) return;
    if (!confirm(`Delete "${e.title}"?`)) return;
    this.eventService.delete(e.id).subscribe({
      next: () => { this.toast.show('Event deleted.', 'success'); this.router.navigate(['/events']); }
    });
  }
}
