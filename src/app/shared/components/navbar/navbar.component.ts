import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { ErrorToastService } from '../error-toast/error-toast.service';
import { I18nService } from '../../../core/services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  template: `
    <nav class="fixed top-0 w-full z-50 bg-white/40 backdrop-blur-xl border-b border-white/20 shadow-[0_8px_32px_rgba(244,242,238,0.1)]">
      <div class="flex justify-between items-center px-4 md:px-8 h-20 w-full">

        <!-- Logo -->
        <a routerLink="/" class="flex items-center gap-2 text-2xl font-light tracking-widest text-neutral-900 hover:opacity-80 transition-all duration-200 select-none">
          <span class="material-symbols-outlined" style="color:#feaa00;font-variation-settings:'FILL' 1">blur_on</span>
          <span>aKissy Events</span>
        </a>

        @if (auth.isLoggedIn()) {
          <!-- Desktop nav links -->
          <div class="hidden md:flex items-center space-x-8">
            <a routerLink="/events"
               routerLinkActive="!text-amber-600 border-b border-amber-500/50 pb-1"
               class="text-neutral-600 hover:text-amber-500 transition-all duration-300">{{ 'nav.discover' | t }}</a>
            <a routerLink="/my-participations"
               routerLinkActive="!text-amber-600 border-b border-amber-500/50 pb-1"
               class="text-neutral-600 hover:text-amber-500 transition-all duration-300">{{ 'nav.myTickets' | t }}</a>
            @if (auth.role() === 'EVENT_OWNER' || auth.role() === 'ADMIN') {
              <a routerLink="/dashboard"
                 routerLinkActive="!text-amber-600 border-b border-amber-500/50 pb-1"
                 class="text-neutral-600 hover:text-amber-500 transition-all duration-300">{{ 'nav.dashboard' | t }}</a>
            }
            @if (auth.role() === 'ADMIN') {
              <a routerLink="/admin"
                 routerLinkActive="!text-amber-600 border-b border-amber-500/50 pb-1"
                 class="text-neutral-600 hover:text-amber-500 transition-all duration-300">{{ 'nav.admin' | t }}</a>
            }
          </div>

          <!-- Desktop right controls -->
          <div class="hidden md:flex items-center gap-4">
            <!-- TR / EN switcher -->
            <div class="flex items-center gap-1 px-2 py-1 rounded-full glass-panel border border-outline-variant/20 select-none">
              <button (click)="i18n.setLocale('tr')"
                class="px-2.5 py-1 text-[11px] font-semibold tracking-widest uppercase rounded-full transition-all"
                [class]="i18n.locale() === 'tr'
                  ? 'bg-amber-400 text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-amber-600'">TR</button>
              <button (click)="i18n.setLocale('en')"
                class="px-2.5 py-1 text-[11px] font-semibold tracking-widest uppercase rounded-full transition-all"
                [class]="i18n.locale() === 'en'
                  ? 'bg-amber-400 text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-amber-600'">EN</button>
            </div>
            @if (auth.role() === 'EVENT_OWNER' || auth.role() === 'ADMIN') {
              <a routerLink="/events/create"
                 class="px-6 py-2 rounded-full glass-panel text-on-surface text-xs font-semibold tracking-widest uppercase hover:bg-secondary-container hover:text-on-secondary-container transition-all duration-300 amber-glow">
                {{ 'nav.createEvent' | t }}
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

          <!-- Mobile hamburger (logged in) -->
          <button (click)="toggleMenu()" class="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors">
            <span class="material-symbols-outlined" style="font-size:26px">{{ mobileMenuOpen() ? 'close' : 'menu' }}</span>
          </button>

        } @else {
          <!-- Desktop auth buttons -->
          <div class="hidden md:flex items-center gap-4">
            <!-- TR / EN switcher (logged out) -->
            <div class="flex items-center gap-1 px-2 py-1 rounded-full glass-panel border border-outline-variant/20 select-none">
              <button (click)="i18n.setLocale('tr')"
                class="px-2.5 py-1 text-[11px] font-semibold tracking-widest uppercase rounded-full transition-all"
                [class]="i18n.locale() === 'tr'
                  ? 'bg-amber-400 text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-amber-600'">TR</button>
              <button (click)="i18n.setLocale('en')"
                class="px-2.5 py-1 text-[11px] font-semibold tracking-widest uppercase rounded-full transition-all"
                [class]="i18n.locale() === 'en'
                  ? 'bg-amber-400 text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-amber-600'">EN</button>
            </div>
            <a routerLink="/login" class="text-neutral-600 hover:text-amber-500 transition-all duration-300">{{ 'nav.signIn' | t }}</a>
            <a routerLink="/register"
               class="px-6 py-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-on-secondary-container text-xs font-semibold tracking-widest uppercase hover:shadow-[0_0_20px_rgba(254,170,0,0.4)] transition-all duration-300">
              {{ 'nav.getStarted' | t }}
            </a>
          </div>

          <!-- Mobile right side (logged out): lang switcher + hamburger -->
          <div class="flex md:hidden items-center gap-2">
            <div class="flex items-center gap-1 px-2 py-1 rounded-full glass-panel border border-outline-variant/20 select-none">
              <button (click)="i18n.setLocale('tr')"
                class="px-2 py-0.5 text-[11px] font-semibold tracking-widest uppercase rounded-full transition-all"
                [class]="i18n.locale() === 'tr'
                  ? 'bg-amber-400 text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-amber-600'">TR</button>
              <button (click)="i18n.setLocale('en')"
                class="px-2 py-0.5 text-[11px] font-semibold tracking-widest uppercase rounded-full transition-all"
                [class]="i18n.locale() === 'en'
                  ? 'bg-amber-400 text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-amber-600'">EN</button>
            </div>
            <button (click)="toggleMenu()" class="flex items-center justify-center w-10 h-10 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors">
              <span class="material-symbols-outlined" style="font-size:26px">{{ mobileMenuOpen() ? 'close' : 'menu' }}</span>
            </button>
          </div>
        }
      </div>

      <!-- Mobile dropdown menu -->
      @if (mobileMenuOpen()) {
        <div class="md:hidden bg-white/95 backdrop-blur-xl border-t border-white/20 shadow-lg px-4 py-4 flex flex-col gap-1">
          @if (auth.isLoggedIn()) {
            <a routerLink="/events" (click)="closeMenu()"
               routerLinkActive="text-amber-600 font-medium"
               class="px-3 py-3 rounded-lg text-neutral-700 hover:bg-amber-50 hover:text-amber-600 transition-colors flex items-center gap-3">
              <span class="material-symbols-outlined" style="font-size:20px">explore</span>
              {{ 'nav.discover' | t }}
            </a>
            <a routerLink="/my-participations" (click)="closeMenu()"
               routerLinkActive="text-amber-600 font-medium"
               class="px-3 py-3 rounded-lg text-neutral-700 hover:bg-amber-50 hover:text-amber-600 transition-colors flex items-center gap-3">
              <span class="material-symbols-outlined" style="font-size:20px">confirmation_number</span>
              {{ 'nav.myTickets' | t }}
            </a>
            @if (auth.role() === 'EVENT_OWNER' || auth.role() === 'ADMIN') {
              <a routerLink="/dashboard" (click)="closeMenu()"
                 routerLinkActive="text-amber-600 font-medium"
                 class="px-3 py-3 rounded-lg text-neutral-700 hover:bg-amber-50 hover:text-amber-600 transition-colors flex items-center gap-3">
                <span class="material-symbols-outlined" style="font-size:20px">dashboard</span>
                {{ 'nav.dashboard' | t }}
              </a>
            }
            @if (auth.role() === 'ADMIN') {
              <a routerLink="/admin" (click)="closeMenu()"
                 routerLinkActive="text-amber-600 font-medium"
                 class="px-3 py-3 rounded-lg text-neutral-700 hover:bg-amber-50 hover:text-amber-600 transition-colors flex items-center gap-3">
                <span class="material-symbols-outlined" style="font-size:20px">manage_accounts</span>
                {{ 'nav.admin' | t }}
              </a>
            }
            @if (auth.role() === 'EVENT_OWNER' || auth.role() === 'ADMIN') {
              <a routerLink="/events/create" (click)="closeMenu()"
                 class="px-3 py-3 rounded-lg text-neutral-700 hover:bg-amber-50 hover:text-amber-600 transition-colors flex items-center gap-3">
                <span class="material-symbols-outlined" style="font-size:20px">add_circle</span>
                {{ 'nav.createEvent' | t }}
              </a>
            }
            <div class="border-t border-neutral-100 my-1"></div>
            <a routerLink="/profile" (click)="closeMenu()"
               class="px-3 py-3 rounded-lg text-neutral-700 hover:bg-amber-50 hover:text-amber-600 transition-colors flex items-center gap-3">
              <span class="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-bold text-on-surface-variant border border-white/50">{{ initials() }}</span>
              {{ 'nav.profile' | t }}
            </a>
            <button (click)="auth.logout(); closeMenu()"
                    class="px-3 py-3 rounded-lg text-error hover:bg-red-50 transition-colors flex items-center gap-3 w-full text-left">
              <span class="material-symbols-outlined" style="font-size:20px">logout</span>
              {{ 'nav.logout' | t }}
            </button>
          } @else {
            <a routerLink="/login" (click)="closeMenu()"
               class="px-3 py-3 rounded-lg text-neutral-700 hover:bg-amber-50 hover:text-amber-600 transition-colors flex items-center gap-3">
              <span class="material-symbols-outlined" style="font-size:20px">login</span>
              {{ 'nav.signIn' | t }}
            </a>
            <a routerLink="/register" (click)="closeMenu()"
               class="mx-3 mt-1 px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-semibold tracking-widest uppercase text-center hover:shadow-[0_0_20px_rgba(254,170,0,0.4)] transition-all duration-300">
              {{ 'nav.getStarted' | t }}
            </a>
          }
        </div>
      }

      @if (auth.isLoggedIn() && !auth.isVerified() && !verificationSent()) {
        <div class="bg-amber-50/80 backdrop-blur-sm border-t border-amber-200/40 px-4 md:px-8 py-2 flex items-center justify-between gap-4">
          <p class="text-sm text-amber-800 flex items-center gap-2">
            <span class="material-symbols-outlined" style="font-size:16px">warning</span>
            {{ 'nav.verifyBanner' | t }}
          </p>
          <div class="flex items-center gap-4 shrink-0">
            <button (click)="sendVerification()" [disabled]="sending()"
                    class="cursor-pointer text-xs font-semibold text-amber-700 underline hover:text-amber-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {{ sending() ? ('nav.sending' | t) : ('nav.sendVerification' | t) }}
            </button>
            <button (click)="dismissBanner()"
                    class="text-amber-600 hover:text-amber-900 transition-colors"
                    [title]="'nav.dismissBanner' | t">
              <span class="material-symbols-outlined" style="font-size:18px">close</span>
            </button>
          </div>
        </div>
      }
    </nav>
  `
})
export class NavbarComponent {
  readonly auth = inject(AuthService);
  readonly i18n = inject(I18nService);
  private readonly userService = inject(UserService);
  private readonly toast = inject(ErrorToastService);
  readonly sending = signal(false);
  readonly verificationSent = signal(false);
  readonly mobileMenuOpen = signal(false);

  toggleMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  initials(): string {
    const u = this.auth.currentUser();
    if (!u) return '?';
    return (u.firstName[0] + u.lastName[0]).toUpperCase();
  }

  sendVerification(): void {
    const id = this.auth.currentUser()?.id;
    if (!id || this.sending()) return;
    this.sending.set(true);
    // Hide banner immediately on click
    this.dismissBanner();
    this.userService.requestVerification(id).subscribe({
      next: () => {
        this.sending.set(false);
        this.toast.show(this.i18n.t('profile.verificationSent'), 'success');
      },
      error: () => { this.sending.set(false); }
    });
  }

  dismissBanner(): void {
    sessionStorage.setItem('verificationSent', '1');
    this.verificationSent.set(true);
  }
}

