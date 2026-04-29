import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorResponseDto } from '../../../core/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4 py-12 pt-28 relative">
      <div class="absolute top-1/4 right-1/4 w-96 h-96 bg-secondary-container/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <div class="w-full max-w-md">
        <div class="text-center mb-10">
          <span class="text-[11px] font-semibold tracking-[0.15em] uppercase text-on-surface-variant px-4 py-1 rounded-full glass-panel inline-block mb-4">Welcome Back</span>
          <h1 class="text-[48px] leading-[1.2] tracking-[-0.02em] font-light text-on-surface">Sign In</h1>
          <p class="text-base text-on-surface-variant mt-2">Access your Aura Events account.</p>
        </div>

        <div class="bg-surface-container-lowest/80 backdrop-blur-xl rounded-xl p-8 border border-outline-variant/30 shadow-[0_30px_60px_rgba(28,28,23,0.05)]">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
            <div>
              <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">Username</label>
              <input formControlName="username" type="text"
                     class="w-full px-4 py-3 bg-surface border rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all"
                     [class.border-error]="isInvalid('username')"
                     [class.border-outline-variant]="!isInvalid('username')"
                     placeholder="your username" />
              @if (isInvalid('username')) {
                <p class="mt-1 text-xs text-error">Username is required.</p>
              }
            </div>

            <div>
              <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">Password</label>
              <input formControlName="password" type="password"
                     class="w-full px-4 py-3 bg-surface border rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all"
                     [class.border-error]="isInvalid('password')"
                     [class.border-outline-variant]="!isInvalid('password')"
                     placeholder="••••••••" />
              @if (isInvalid('password')) {
                <p class="mt-1 text-xs text-error">Password is required.</p>
              }
            </div>

            @if (formError()) {
              <div class="p-3 rounded-lg bg-error-container border border-error/20 text-sm text-on-error-container">
                {{ formError() }}
              </div>
            }

            <button type="submit" [disabled]="isLoading()"
                    class="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white py-4 rounded-lg text-xs font-semibold tracking-widest uppercase transition-all shadow-[0_4px_20px_rgba(245,158,11,0.2)] hover:shadow-[0_8px_25px_rgba(245,158,11,0.4)] disabled:opacity-60 flex justify-center items-center gap-2 mt-2">
              @if (isLoading()) {
                <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              } @else {
                Sign In
                <span class="material-symbols-outlined" style="font-size:18px">arrow_forward</span>
              }
            </button>
          </form>

          <p class="mt-6 text-center text-sm text-on-surface-variant">
            No account?
            <a routerLink="/register" class="text-secondary font-medium hover:text-on-secondary-container transition-colors">Get Started</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly formError = signal<string | null>(null);

  readonly form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.formError.set(null);
    this.isLoading.set(true);
    this.auth.login(this.form.getRawValue() as any).subscribe({
      next: () => this.router.navigate(['/events']),
      error: (err: ErrorResponseDto) => {
        this.isLoading.set(false);
        this.formError.set(err?.errorCode === 'INVALID_CREDENTIALS'
          ? 'Invalid username or password.'
          : 'Sign in failed. Please try again.');
      }
    });
  }
}
