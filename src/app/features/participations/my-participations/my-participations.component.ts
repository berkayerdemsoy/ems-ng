import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';
import { EventService } from '../../../core/services/event.service';
import { ParticipationService } from '../../../core/services/participation.service';
import { AuthService } from '../../../core/services/auth.service';
import { ParticipationResponseDto } from '../../../core/models';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-my-participations',
  standalone: true,
  imports: [RouterLink, DatePipe, TranslatePipe],
  template: `
    <div class="min-h-screen pt-28 pb-24 px-[max(24px,5vw)] relative">
      <div class="absolute top-32 right-1/4 w-96 h-96 bg-secondary-container/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <div class="max-w-4xl mx-auto">
        <div class="mb-12">
          <span class="text-[11px] font-semibold tracking-[0.15em] uppercase text-on-surface-variant px-4 py-1 rounded-full glass-panel inline-block mb-4">{{ 'participations.badge' | t }}</span>
          <h1 class="text-[48px] leading-[1.2] tracking-[-0.02em] font-light text-on-surface">{{ 'participations.title' | t }}</h1>
          <p class="text-base text-on-surface-variant mt-2">{{ 'participations.subtitle' | t }}</p>
        </div>

        @if (isLoading()) {
          <div class="space-y-4">
            @for (i of [1,2,3]; track i) {
              <div class="animate-pulse bg-surface-container/50 rounded-xl h-24 border border-outline-variant/20"></div>
            }
          </div>
        } @else if (participations().length === 0) {
          <div class="text-center py-24 glass-card rounded-xl border border-outline-variant/20">
            <p class="text-6xl mb-6">✦</p>
            <p class="text-2xl font-light text-on-surface">{{ 'participations.emptyTitle' | t }}</p>
            <p class="text-base text-on-surface-variant mt-2">
              <a routerLink="/events" class="text-secondary hover:underline">{{ 'participations.exploreLink' | t }}</a>
            </p>
          </div>
        } @else {
          @defer (on idle) {
            <div class="space-y-4">
              @for (p of participations(); track p.id) {
                <div class="bg-surface-container-lowest/80 backdrop-blur-xl rounded-xl p-6 border border-outline-variant/30 shadow-[0_8px_24px_rgba(28,28,23,0.03)] flex items-center justify-between gap-4 hover:border-secondary-container/40 transition-colors group">
                  <div class="flex items-center gap-5">
                    <div class="w-12 h-12 rounded-lg bg-secondary-container/20 flex items-center justify-center border border-secondary-container/30 flex-shrink-0 group-hover:bg-secondary-container/30 transition-colors">
                      <span class="material-symbols-outlined text-secondary" style="font-size:22px">local_activity</span>
                    </div>
                    <div>
                      <a [routerLink]="['/events', p.eventId]"
                         class="text-lg font-medium text-on-surface hover:text-secondary transition-colors block mb-1">
                        {{ p.eventTitle }}
                      </a>
                      <div class="flex items-center gap-2 text-sm text-on-surface-variant">
                        <span class="material-symbols-outlined" style="font-size:14px">calendar_today</span>
                        <span>{{ 'participations.registeredAt' | t }} {{ p.registeredAt | date:'dd MMM yyyy' }}</span>
                      </div>
                    </div>
                  </div>
                  <a [routerLink]="['/events', p.eventId]"
                     class="flex-shrink-0 glass-panel border border-outline-variant/30 px-5 py-2 rounded-full text-[11px] font-semibold tracking-widest text-on-surface uppercase hover:bg-white/50 transition-colors flex items-center gap-2">
                    {{ 'participations.view' | t }}
                    <span class="material-symbols-outlined" style="font-size:14px">chevron_right</span>
                  </a>
                </div>
              }
            </div>
          } @placeholder {
            <div class="space-y-4">
              @for (i of [1,2,3]; track i) {
                <div class="animate-pulse bg-surface-container/50 rounded-xl h-24 border border-outline-variant/20"></div>
              }
            </div>
          }
        }
      </div>
    </div>
  `
})
export class MyParticipationsComponent implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly participationService = inject(ParticipationService);
  private readonly authService = inject(AuthService);

  readonly participations = signal<ParticipationResponseDto[]>([]);
  readonly isLoading = signal(true);

  ngOnInit(): void {
    // Wait until currentUser is populated (APP_INITIALIZER may still be resolving)
    toObservable(this.authService.currentUser).pipe(
      filter(user => !!user),
      take(1),
      switchMap(user => {
        const userEmail = user!.email;
        return this.eventService.getAll(0, 100).pipe(
          switchMap(page => {
            if (page.empty) return of([]);
            const requests = page.content.map(e =>
              this.participationService.getByEvent(e.id).pipe(catchError(() => of([])))
            );
            return forkJoin(requests).pipe(
              catchError(() => of([]))
            );
          }),
          catchError(() => of([])),
        ).pipe(
          switchMap(results => {
            const myParticipations = (results as ParticipationResponseDto[][])
              .flat()
              .filter((p: ParticipationResponseDto) => p.participantEmail === userEmail);
            return of(myParticipations);
          })
        );
      })
    ).subscribe({
      next: list => { this.participations.set(list); this.isLoading.set(false); },
      error: () => this.isLoading.set(false)
    });
  }
}

