import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { NgTemplateOutlet } from '@angular/common';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

type VerifyState = 'loading' | 'success' | 'error-invalid' | 'error-expired' | 'error-general' | 'no-token';
type ResendState = 'idle' | 'sending' | 'sent' | 'failed';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [TranslatePipe, NgTemplateOutlet],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4 py-12 pt-28 relative">
      <div class="absolute top-1/3 left-1/3 w-96 h-96 bg-secondary-container/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <div class="w-full max-w-md">
        <div class="bg-surface-container-lowest/80 backdrop-blur-xl rounded-xl p-10 border border-outline-variant/30 shadow-[0_30px_60px_rgba(28,28,23,0.05)] text-center">

          <!-- ── After a successful resend the whole card flips to this ── -->
          @if (resendState() === 'sent') {
            <div class="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-6">
              <span class="material-symbols-outlined text-amber-500" style="font-size:32px">forward_to_inbox</span>
            </div>
            <span class="text-[11px] font-semibold tracking-[0.15em] uppercase text-on-surface-variant px-4 py-1 rounded-full glass-panel inline-block mb-4">
              {{ 'verifyEmail.successBadge' | t }}
            </span>
            <h2 class="text-[32px] leading-[1.2] tracking-[-0.02em] font-light text-on-surface mb-3">
              {{ 'verifyEmail.resentTitle' | t }}
            </h2>
            <p class="text-base text-on-surface-variant mb-8">{{ 'verifyEmail.resentSuccess' | t }}</p>
            <button (click)="goToLogin()"
              class="w-full cursor-pointer border border-outline-variant/60 hover:border-outline-variant text-on-surface py-4 rounded-lg text-xs font-semibold tracking-widest uppercase transition-all flex justify-center items-center gap-2">
              {{ 'verifyEmail.goToLogin' | t }}
              <span class="material-symbols-outlined" style="font-size:18px">arrow_forward</span>
            </button>

          } @else {

            @switch (state()) {

              <!-- ─── LOADING ─────────────────────────────────────── -->
              @case ('loading') {
                <div class="w-16 h-16 bg-surface-container-high rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span class="w-8 h-8 border-2 border-secondary-container border-t-transparent rounded-full animate-spin block"></span>
                </div>
                <h2 class="text-2xl font-light text-on-surface mb-2">{{ 'verifyEmail.loading' | t }}</h2>
                <p class="text-base text-on-surface-variant">{{ 'verifyEmail.loadingSubtitle' | t }}</p>
              }

              <!-- ─── SUCCESS ─────────────────────────────────────── -->
              @case ('success') {
                <div class="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-6">
                  <span class="material-symbols-outlined text-green-600" style="font-size:32px">mark_email_read</span>
                </div>
                <span class="text-[11px] font-semibold tracking-[0.15em] uppercase text-on-surface-variant px-4 py-1 rounded-full glass-panel inline-block mb-4">
                  {{ 'verifyEmail.successBadge' | t }}
                </span>
                <h2 class="text-[32px] leading-[1.2] tracking-[-0.02em] font-light text-on-surface mb-3">
                  {{ 'verifyEmail.successTitle' | t }}
                </h2>
                <p class="text-base text-on-surface-variant mb-6">{{ 'verifyEmail.successSubtitle' | t }}</p>
                <p class="text-sm text-on-surface-variant mb-4 opacity-70">
                  {{ countdown() }} {{ 'verifyEmail.redirectCountdown' | t }}
                </p>
                <button (click)="goToLogin()"
                  class="w-full cursor-pointer bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white py-4 rounded-lg text-xs font-semibold tracking-widest uppercase transition-all shadow-[0_4px_20px_rgba(245,158,11,0.2)] hover:shadow-[0_8px_25px_rgba(245,158,11,0.4)] flex justify-center items-center gap-2">
                  {{ 'verifyEmail.goToLogin' | t }}
                  <span class="material-symbols-outlined" style="font-size:18px">arrow_forward</span>
                </button>
              }

              <!-- ─── INVALID LINK ────────────────────────────────── -->
              @case ('error-invalid') {
                <div class="w-16 h-16 rounded-full bg-error-container flex items-center justify-center mx-auto mb-6">
                  <span class="material-symbols-outlined text-error" style="font-size:32px">link_off</span>
                </div>
                <h2 class="text-[32px] leading-[1.2] tracking-[-0.02em] font-light text-on-surface mb-3">
                  {{ 'verifyEmail.invalidTitle' | t }}
                </h2>
                <p class="text-base text-on-surface-variant mb-8">{{ 'verifyEmail.invalidMessage' | t }}</p>
                <ng-container *ngTemplateOutlet="resendBlock" />
              }

              <!-- ─── EXPIRED LINK ────────────────────────────────── -->
              @case ('error-expired') {
                <div class="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mx-auto mb-6">
                  <span class="material-symbols-outlined text-on-surface-variant" style="font-size:32px">timer_off</span>
                </div>
                <h2 class="text-[32px] leading-[1.2] tracking-[-0.02em] font-light text-on-surface mb-3">
                  {{ 'verifyEmail.expiredTitle' | t }}
                </h2>
                <p class="text-base text-on-surface-variant mb-8">{{ 'verifyEmail.expiredMessage' | t }}</p>
                <ng-container *ngTemplateOutlet="resendBlock" />
              }

              <!-- ─── NO TOKEN ────────────────────────────────────── -->
              @case ('no-token') {
                <div class="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mx-auto mb-6">
                  <span class="material-symbols-outlined text-on-surface-variant" style="font-size:32px">help_outline</span>
                </div>
                <h2 class="text-[32px] leading-[1.2] tracking-[-0.02em] font-light text-on-surface mb-3">
                  {{ 'verifyEmail.noTokenTitle' | t }}
                </h2>
                <p class="text-base text-on-surface-variant mb-8">{{ 'verifyEmail.noTokenMessage' | t }}</p>
                <button (click)="goToLogin()"
                  class="w-full cursor-pointer border border-outline-variant/60 hover:border-outline-variant text-on-surface py-4 rounded-lg text-xs font-semibold tracking-widest uppercase transition-all flex justify-center items-center gap-2">
                  {{ 'verifyEmail.goToLogin' | t }}
                  <span class="material-symbols-outlined" style="font-size:18px">arrow_forward</span>
                </button>
              }

              <!-- ─── GENERAL ERROR ───────────────────────────────── -->
              @default {
                <div class="w-16 h-16 rounded-full bg-error-container flex items-center justify-center mx-auto mb-6">
                  <span class="material-symbols-outlined text-error" style="font-size:32px">error</span>
                </div>
                <h2 class="text-[32px] leading-[1.2] tracking-[-0.02em] font-light text-on-surface mb-3">
                  {{ 'verifyEmail.generalTitle' | t }}
                </h2>
                <p class="text-base text-on-surface-variant mb-8">{{ 'verifyEmail.generalMessage' | t }}</p>
                <ng-container *ngTemplateOutlet="resendBlock" />
              }

            }

          }

        </div>
      </div>
    </div>

    <!-- ─── RESEND BLOCK (idle / sending / failed) ─────────────── -->
    <ng-template #resendBlock>
      @if (resendState() === 'failed') {
        <p class="text-sm text-error mb-4">{{ 'verifyEmail.resentFailed' | t }}</p>
        <button (click)="resend()"
          class="w-full cursor-pointer bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white py-4 rounded-lg text-xs font-semibold tracking-widest uppercase transition-all shadow-[0_4px_20px_rgba(245,158,11,0.2)] hover:shadow-[0_8px_25px_rgba(245,158,11,0.4)] flex justify-center items-center gap-2">
          {{ 'verifyEmail.resend' | t }}
          <span class="material-symbols-outlined" style="font-size:18px">send</span>
        </button>
      } @else if (auth.currentUser()) {
        <button (click)="resend()" [disabled]="resendState() === 'sending'"
          class="w-full cursor-pointer bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white py-4 rounded-lg text-xs font-semibold tracking-widest uppercase transition-all shadow-[0_4px_20px_rgba(245,158,11,0.2)] hover:shadow-[0_8px_25px_rgba(245,158,11,0.4)] disabled:opacity-60 disabled:cursor-not-allowed flex justify-center items-center gap-2">
          @if (resendState() === 'sending') {
            <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          } @else {
            {{ 'verifyEmail.resend' | t }}
            <span class="material-symbols-outlined" style="font-size:18px">send</span>
          }
        </button>
      } @else {
        <button (click)="goToLogin()"
          class="w-full cursor-pointer border border-outline-variant/60 hover:border-outline-variant text-on-surface py-4 rounded-lg text-xs font-semibold tracking-widest uppercase transition-all flex justify-center items-center gap-2">
          {{ 'verifyEmail.loginFirst' | t }}
          <span class="material-symbols-outlined" style="font-size:18px">arrow_forward</span>
        </button>
      }
    </ng-template>
  `
})
export class VerifyEmailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly userService = inject(UserService);
  readonly auth = inject(AuthService);
  readonly router = inject(Router);

  readonly state = signal<VerifyState>('loading');
  readonly resendState = signal<ResendState>('idle');
  readonly countdown = signal<number>(5);

  /** Lock — prevents duplicate HTTP calls on accidental re-render or navigation quirks. */
  private requestSent = false;
  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.state.set('no-token');
      return;
    }

    // Guard: only fire the HTTP call once per component instance
    if (this.requestSent) return;
    this.requestSent = true;

    this.userService.confirmEmail(token).subscribe({
      next: () => {
        this.onVerified();
      },
      error: (err: any) => {
        const code: string   = err?.errorCode ?? '';
        const status: number = err?.status    ?? 0;

        // Safety net: HTTP 200 with a JSON-parse error means the backend
        // actually succeeded — treat it as verified.
        if (status === 200) {
          this.onVerified();
          return;
        }

        if (code === 'FORBIDDEN' || status === 403) {
          this.state.set('error-expired');
        } else if (code === 'NOT_FOUND' || status === 404) {
          this.state.set('error-invalid');
        } else {
          this.state.set('error-general');
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.clearCountdown();
  }

  /**
   * Called on successful verification.
   * Security-focused: clears the current session so the user must re-authenticate
   * with their credentials to get a fresh session reflecting verified=true.
   */
  private onVerified(): void {
    this.state.set('success');
    // Clear session — user must re-login to get a fresh session
    this.auth.logout();
    this.startCountdown();
  }

  private startCountdown(): void {
    this.countdown.set(5);
    this.countdownInterval = setInterval(() => {
      const next = this.countdown() - 1;
      this.countdown.set(next);
      if (next <= 0) {
        this.clearCountdown();
        this.router.navigate(['/login']);
      }
    }, 1000);
  }

  private clearCountdown(): void {
    if (this.countdownInterval !== null) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  goToLogin(): void {
    this.clearCountdown();
    this.router.navigate(['/login']);
  }

  resend(): void {
    const userId = this.auth.currentUser()?.id;
    if (!userId) { this.router.navigate(['/login']); return; }
    this.resendState.set('sending');
    this.userService.requestVerification(userId).subscribe({
      next: () => this.resendState.set('sent'),
      error: () => this.resendState.set('failed')
    });
  }
}
