import { Component, input, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { EventResponseDto } from '../../../core/models';
import { EventStatusPipe } from '../../../shared/pipes/event-status.pipe';
import { AvailableSeatsPipe } from '../../../shared/pipes/available-seats.pipe';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [RouterLink, DatePipe, CurrencyPipe, EventStatusPipe, AvailableSeatsPipe],
  template: `
    @if (featured()) {
      <!-- Featured / Large card -->
      <article [routerLink]="['/events', event().id]"
               class="glass-card rounded-xl overflow-hidden group relative min-h-[400px] flex flex-col justify-end cursor-pointer w-full h-full">
        <div class="absolute inset-0 bg-gradient-to-br from-surface-container to-surface z-0"></div>
        <div class="absolute top-1/3 right-1/4 w-48 h-48 bg-secondary-container/20 rounded-full blur-3xl z-0"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent z-10"></div>
        <div class="relative z-20 p-8">
          <div class="flex gap-3 mb-4 flex-wrap">
            @let status = event().status | eventStatus;
            <span class="bg-secondary-container/20 text-secondary border border-secondary-container/30 px-3 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase backdrop-blur-md glow-amber flex items-center gap-1">
              <span class="material-symbols-outlined" style="font-size:14px">local_fire_department</span>
              {{ status.label }}
            </span>
            <span class="bg-surface-container-lowest/50 text-on-surface px-3 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase backdrop-blur-md border border-white/50">
              {{ event().category.name }}
            </span>
          </div>
          <h2 class="text-[48px] leading-[1.2] tracking-[-0.02em] text-on-surface mb-2 text-glow group-hover:text-secondary transition-colors">{{ event().title }}</h2>
          <p class="text-base text-on-surface-variant max-w-md mb-6 line-clamp-2">{{ event().description }}</p>
          <div class="flex items-center gap-6 flex-wrap">
            <div class="flex items-center gap-2 text-on-surface-variant text-sm">
              <span class="material-symbols-outlined" style="font-size:18px">calendar_today</span>
              {{ event().startDate | date:'dd MMM yyyy' }}
            </div>
            <div class="flex items-center gap-2 text-on-surface-variant text-sm">
              <span class="material-symbols-outlined" style="font-size:18px">location_city</span>
              {{ event().city }}
            </div>
            <div class="flex items-center gap-2 text-on-surface-variant text-sm">
              <span class="material-symbols-outlined" style="font-size:18px">payments</span>
              {{ event().price === 0 ? 'Free' : (event().price | currency:'TRY':'symbol-narrow':'1.0-0') }}
            </div>
            <button class="ml-auto glass-card border border-white/50 px-6 py-2 rounded-full text-[11px] font-semibold tracking-widest uppercase text-on-surface hover:bg-white/50 transition-colors">
              Details <span class="material-symbols-outlined" style="font-size:14px;vertical-align:middle">chevron_right</span>
            </button>
          </div>
        </div>
      </article>
    } @else {
      <!-- Regular card -->
      <article [routerLink]="['/events', event().id]"
               class="glass-card rounded-xl overflow-hidden group relative min-h-[280px] flex flex-col justify-end cursor-pointer w-full h-full">
        <div class="absolute inset-0 bg-gradient-to-br from-surface-container-low to-surface z-0"></div>
        <div class="absolute top-0 right-0 w-20 h-20 bg-secondary-container/10 rounded-full blur-xl group-hover:bg-secondary-container/20 transition-colors duration-500 z-0"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent z-10"></div>
        <div class="relative z-20 p-6">
          @let status = event().status | eventStatus;
          <span class="bg-secondary-container/20 text-secondary border border-secondary-container/30 px-3 py-1 rounded-full text-[10px] font-semibold tracking-widest uppercase backdrop-blur-md inline-block mb-3 glow-amber">
            {{ status.label }}
          </span>
          <h3 class="text-2xl font-medium text-on-surface mb-2 group-hover:text-secondary transition-colors line-clamp-2">{{ event().title }}</h3>
          <p class="text-sm text-on-surface-variant mb-4 line-clamp-2">{{ event().description }}</p>
          <div class="flex justify-between items-center mt-4 pt-4 border-t border-outline-variant/30">
            <div>
              <span class="text-[10px] font-semibold tracking-widest text-on-surface-variant uppercase">{{ event().startDate | date:'dd MMM' }}</span>
              <p class="text-sm font-medium text-on-surface">{{ event().city }}</p>
            </div>
            <div class="text-right">
              <p class="text-base font-semibold text-secondary">
                {{ event().price === 0 ? 'Free' : (event().price | currency:'TRY':'symbol-narrow':'1.0-0') }}
              </p>
              @let seats = event() | availableSeats;
              @if (seats <= 0) {
                <span class="text-[10px] text-error font-semibold">Sold Out</span>
              } @else {
                <span class="text-[10px] text-on-surface-variant">{{ seats }} left</span>
              }
            </div>
          </div>
        </div>
      </article>
    }
  `
})
export class EventCardComponent {
  readonly event = input.required<EventResponseDto>();
  readonly featured = input(false);
}
