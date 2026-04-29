import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';

type VerifyState = 'loading' | 'success' | 'error-invalid' | 'error-expired' | 'error-general';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  template: `
    <div class="min-h-screen flex items-center justify-center px-4 py-12 pt-28 relative">
      <div class="absolute top-1/3 left-1/3 w-96 h-96 bg-secondary-container/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <div class="w-full max-w-md">
        <div class="bg-surface-container-lowest/80 backdrop-blur-xl rounded-xl p-10 border border-outline-variant/30 shadow-[0_30px_60px_rgba(28,28,23,0.05)] text-center">

          @switch (state()) {
            @case ('loading') {
              <div class="w-16 h-16 bg-surface-container-high rounded-full mx-auto mb-6 flex items-center justify-center">
                <span class="w-8 h-8 border-2 border-secondary-container border-t-transparent rounded-full animate-spin block"></span>
              </div>
              <h2 class="text-2xl font-light text-on-surface mb-2">Verifying email</h2>
              <p class="text-base text-on-surface-variant">Please wait a moment...</p>
            }
            @case ('success') {
              <div class="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-6">
                <span class="material-symbols-outlined text-green-600" style="font-size:32px">mark_email_read</span>
              </div>
              <span class="text-[11px] font-semibold tracking-[0.15em] uppercase text-on-surface-variant px-4 py-1 rounded-full glass-panel inline-block mb-4">Verified</span>
              <h2 class="text-[32px] leading-[1.2] tracking-[-0.02em] font-light text-on-surface mb-3">Email Confirmed!</h2>
              <p class="text-base text-on-surface-variant mb-8">Your email has been successfully verified.</p>
              <button (click)="router.navigate(['/profile'])"
                class="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white py-4 rounded-lg text-xs font-semibold tracking-widest uppercase transition-all shadow-[0_4px_20px_rgba(245,158,11,0.2)] hover:shadow-[0_8px_25px_rgba(245,158,11,0.4)] flex justify-center items-center gap-2">
                Go to Profile
                <span class="material-symbols-outlined" style="font-size:18px">arrow_forward</span>
              </button>
            }
            @case ('error-invalid') {
              <div class="w-16 h-16 rounded-full bg-error-container flex items-center justify-center mx-auto mb-6">
                <span class="material-symbols-outlined text-error" style="font-size:32px">link_off</span>
              </div>
              <h2 class="text-[32px] leading-[1.2] tracking-[-0.02em] font-light text-on-surface mb-3">Invalid Link</h2>
              <p class="text-base text-on-surface-variant">This verification link is not valid or has already been used.</p>
            }
            @case ('error-expired') {
              <div class="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mx-auto mb-6">
                <span class="material-symbols-outlined text-on-surface-variant" style="font-size:32px">timer_off</span>
              </div>
              <h2 class="text-[32px] leading-[1.2] tracking-[-0.02em] font-light text-on-surface mb-3">Link Expired</h2>
              <p class="text-base text-on-surface-variant mb-8">This verification link has expired. Request a new one from your profile.</p>
              <button (click)="router.navigate(['/profile'])"
                class="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white py-4 rounded-lg text-xs font-semibold tracking-widest uppercase transition-all shadow-[0_4px_20px_rgba(245,158,11,0.2)] flex justify-center items-center gap-2">
                Go to Profile
                <span class="material-symbols-outlined" style="font-size:18px">arrow_forward</span>
              </button>
            }
            @default {
              <div class="w-16 h-16 rounded-full bg-error-container flex items-center justify-center mx-auto mb-6">
                <span class="material-symbols-outlined text-error" style="font-size:32px">error</span>
              </div>
              <h2 class="text-[32px] leading-[1.2] tracking-[-0.02em] font-light text-on-surface mb-3">Something went wrong</h2>
              <p class="text-base text-on-surface-variant">Email verification failed. Please try again.</p>
            }
          }

        </div>
      </div>
    </div>
  `
})
export class VerifyEmailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  readonly router = inject(Router);

  readonly state = signal<VerifyState>('loading');

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.state.set('error-invalid');
      return;
    }
    this.userService.confirmEmail(token).subscribe({
      next: () => {
        this.state.set('success');
        const userId = this.authService.currentUser()?.id;
        if (userId) this.authService.refreshUser(userId);
      },
      error: (err: any) => {
        if (err?.errorCode === 'FORBIDDEN') {
          this.state.set('error-expired');
        } else if (err?.errorCode === 'NOT_FOUND') {
          this.state.set('error-invalid');
        } else {
          this.state.set('error-general');
        }
      }
    });
  }
}

