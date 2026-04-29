import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { ErrorToastService } from '../../../shared/components/error-toast/error-toast.service';
import { ErrorResponseDto } from '../../../core/models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4 py-12 pt-28 relative">
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-secondary-container/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <div class="w-full max-w-lg">
        <div class="text-center mb-10">
          <span class="text-[11px] font-semibold tracking-[0.15em] uppercase text-on-surface-variant px-4 py-1 rounded-full glass-panel inline-block mb-4">Join Us</span>
          <h1 class="text-[48px] leading-[1.2] tracking-[-0.02em] font-light text-on-surface">Create Account</h1>
          <p class="text-base text-on-surface-variant mt-2">Begin your Aura Events journey.</p>
        </div>

        <div class="bg-surface-container-lowest/80 backdrop-blur-xl rounded-xl p-8 border border-outline-variant/30 shadow-[0_30px_60px_rgba(28,28,23,0.05)]">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">First Name</label>
                <input formControlName="firstName" type="text"
                  class="w-full px-4 py-3 bg-surface border rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all"
                  [class.border-error]="isInvalid('firstName')" [class.border-outline-variant]="!isInvalid('firstName')"
                  placeholder="Ada" />
                @if (isInvalid('firstName')) { <p class="mt-1 text-xs text-error">Required.</p> }
              </div>
              <div>
                <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">Last Name</label>
                <input formControlName="lastName" type="text"
                  class="w-full px-4 py-3 bg-surface border rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all"
                  [class.border-error]="isInvalid('lastName')" [class.border-outline-variant]="!isInvalid('lastName')"
                  placeholder="Lovelace" />
                @if (isInvalid('lastName')) { <p class="mt-1 text-xs text-error">Required.</p> }
              </div>
            </div>

            <div>
              <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">Username</label>
              <input formControlName="username" type="text"
                class="w-full px-4 py-3 bg-surface border rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all"
                [class.border-error]="isInvalid('username')" [class.border-outline-variant]="!isInvalid('username')"
                placeholder="your_username" />
              @if (isInvalid('username')) { <p class="mt-1 text-xs text-error">Username is required.</p> }
            </div>

            <div>
              <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">Email</label>
              <input formControlName="email" type="email"
                class="w-full px-4 py-3 bg-surface border rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all"
                [class.border-error]="isInvalid('email')" [class.border-outline-variant]="!isInvalid('email')"
                placeholder="you@example.com" />
              @if (isInvalid('email')) { <p class="mt-1 text-xs text-error">Enter a valid email.</p> }
            </div>

            <div>
              <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">Password</label>
              <input formControlName="password" type="password"
                class="w-full px-4 py-3 bg-surface border rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all"
                [class.border-error]="isInvalid('password')" [class.border-outline-variant]="!isInvalid('password')"
                placeholder="5–16 characters" />
              @if (isInvalid('password')) { <p class="mt-1 text-xs text-error">Password must be 5–16 characters.</p> }
            </div>

            <div>
              <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">
                Phone <span class="normal-case font-normal text-on-surface-variant/60">(optional)</span>
              </label>
              <input formControlName="phoneNumber" type="tel"
                class="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all"
                placeholder="+90 5XX XXX XX XX" />
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
                Create Account
                <span class="material-symbols-outlined" style="font-size:18px">arrow_forward</span>
              }
            </button>
          </form>

          <p class="mt-6 text-center text-sm text-on-surface-variant">
            Already have an account?
            <a routerLink="/login" class="text-secondary font-medium hover:text-on-secondary-container transition-colors">Sign In</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly toast = inject(ErrorToastService);

  readonly isLoading = signal(false);
  readonly formError = signal<string | null>(null);

  readonly form = this.fb.group({
    firstName:   ['', Validators.required],
    lastName:    ['', Validators.required],
    username:    ['', Validators.required],
    email:       ['', [Validators.required, Validators.email]],
    password:    ['', [Validators.required, Validators.minLength(5), Validators.maxLength(16)]],
    phoneNumber: ['']
  });

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.formError.set(null);
    this.isLoading.set(true);

    const val = this.form.getRawValue();
    const dto = { ...val, phoneNumber: val.phoneNumber || undefined };

    this.userService.create(dto as any).subscribe({
      next: () => {
        this.toast.show('Kayıt başarılı! Giriş yapabilirsiniz.', 'success');
        this.router.navigate(['/login']);
      },
      error: (err: ErrorResponseDto) => {
        this.isLoading.set(false);
        if (err?.errorCode === 'ALREADY_EXISTS') {
          this.formError.set('Bu kullanıcı adı veya email zaten kullanılıyor.');
        } else {
          this.formError.set('Kayıt yapılamadı. Lütfen tekrar deneyin.');
        }
      }
    });
  }
}

