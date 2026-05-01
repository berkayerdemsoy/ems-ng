import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { ErrorToastService } from '../error-toast/error-toast.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="fixed top-0 w-full z-50 bg-white/40 backdrop-blur-xl border-b border-white/20 shadow-[0_8px_32px_rgba(244,242,238,0.1)]">
      <div class="flex justify-between items-center px-8 h-20 w-full">

        <!-- Logo -->
        <a routerLink="/" class="flex items-center gap-2 text-2xl font-light tracking-widest text-neutral-900 hover:opacity-80 transition-all duration-200">
          <span class="material-symbols-outlined" style="color:#feaa00;font-variation-settings:'FILL' 1">blur_on</span>
          <span>Aura Events</span>
        </a>

        @if (auth.isLoggedIn()) {
          <div class="hidden md:flex items-center space-x-8">
            <a routerLink="/events"
               routerLinkActive="!text-amber-600 border-b border-amber-500/50 pb-1"
               class="text-neutral-600 hover:text-amber-500 transition-all duration-300">Discover</a>
            <a routerLink="/my-participations"
               routerLinkActive="!text-amber-600 border-b border-amber-500/50 pb-1"
               class="text-neutral-600 hover:text-amber-500 transition-all duration-300">My Tickets</a>
            @if (auth.role() === 'EVENT_OWNER' || auth.role() === 'ADMIN') {
              <a routerLink="/dashboard"
                 routerLinkActive="!text-amber-600 border-b border-amber-500/50 pb-1"
                 class="text-neutral-600 hover:text-amber-500 transition-all duration-300">Dashboard</a>
            }
            @if (auth.role() === 'ADMIN') {
              <a routerLink="/admin/users"
                 routerLinkActive="!text-amber-600 border-b border-amber-500/50 pb-1"
                 class="text-neutral-600 hover:text-amber-500 transition-all duration-300">Admin</a>
            }
          </div>

          <div class="flex items-center gap-4">
            @if (auth.role() === 'EVENT_OWNER' || auth.role() === 'ADMIN') {
              <a routerLink="/events/create"
                 class="hidden md:block px-6 py-2 rounded-full glass-panel text-on-surface text-xs font-semibold tracking-widest uppercase hover:bg-secondary-container hover:text-on-secondary-container transition-all duration-300 amber-glow">
                + Create Event
              </a>
            }
            <a routerLink="/profile"
               class="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center border border-white/50 hover:border-amber-400 transition-colors text-sm font-bold text-on-surface-variant">
              {{ initials() }}
            </a>
            <button (click)="auth.logout()" class="text-on-surface-variant hover:text-error transition-colors">
              <span class="material-symbols-outlined" style="font-size:20px">logout</span>
            </button>
          </div>
        } @else {
          <div class="flex items-center gap-4">
            <a routerLink="/login" class="text-neutral-600 hover:text-amber-500 transition-all duration-300">Sign In</a>
            <a routerLink="/register"
               class="px-6 py-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-on-secondary-container text-xs font-semibold tracking-widest uppercase hover:shadow-[0_0_20px_rgba(254,170,0,0.4)] transition-all duration-300">
              Get Started
            </a>
          </div>
        }
      </div>

      @if (auth.isLoggedIn() && !auth.isVerified() && !verificationSent()) {
        <div class="bg-amber-50/80 backdrop-blur-sm border-t border-amber-200/40 px-8 py-2 flex items-center justify-between">
          <p class="text-sm text-amber-800 flex items-center gap-2">
            <span class="material-symbols-outlined" style="font-size:16px">warning</span>
            Email adresinizi doğrulamanız gerekiyor.
          </p>
          <button (click)="sendVerification()" [disabled]="sending()"
                  class="text-xs font-semibold text-amber-700 underline hover:text-amber-900 transition-colors disabled:opacity-50">
            {{ sending() ? 'Gönderiliyor...' : 'Doğrulama Emaili Gönder' }}
          </button>
        </div>
      }
    </nav>
  `
})
export class NavbarComponent {
  readonly auth = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly toast = inject(ErrorToastService);
  readonly sending = signal(false);
  readonly verificationSent = signal(false);

  initials(): string {
    const u = this.auth.currentUser();
    if (!u) return '?';
    return (u.firstName[0] + u.lastName[0]).toUpperCase();
  }

  sendVerification(): void {
    const id = this.auth.currentUser()?.id;
    if (!id || this.sending()) return;
    this.sending.set(true);
    this.userService.requestVerification(id).subscribe({
      next: () => { this.sending.set(false); this.verificationSent.set(true); this.toast.show('Doğrulama emaili gönderildi!', 'success'); },
      error: () => { this.sending.set(false); }
    });
  }
}
