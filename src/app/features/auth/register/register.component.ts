import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { ErrorToastService } from '../../../shared/components/error-toast/error-toast.service';
import { I18nService } from '../../../core/services/i18n.service';
import { ErrorResponseDto } from '../../../core/models';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm  = group.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  host: { class: 'block' },
  template: `
    <div class="min-h-screen flex items-center justify-center px-4 py-12 pt-28 relative">
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-secondary-container/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <div class="w-full max-w-lg">
        <div class="text-center mb-10">
          <span class="text-[11px] font-semibold tracking-[0.15em] uppercase text-on-surface-variant px-4 py-1 rounded-full glass-panel inline-block mb-4">{{ 'register.badge' | t }}</span>
          <h1 class="text-[48px] leading-[1.2] tracking-[-0.02em] font-light text-on-surface">{{ 'register.title' | t }}</h1>
          <p class="text-base text-on-surface-variant mt-2">{{ 'register.subtitle' | t }}</p>
        </div>

        <div class="bg-surface-container-lowest/80 backdrop-blur-xl rounded-xl p-8 border border-outline-variant/30 shadow-[0_30px_60px_rgba(28,28,23,0.05)]">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">{{ 'register.firstNameLabel' | t }}</label>
                <input formControlName="firstName" type="text"
                  class="w-full px-4 py-3 bg-surface border rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all"
                  [class.border-error]="isInvalid('firstName')" [class.border-outline-variant]="!isInvalid('firstName')"
                  placeholder="Ada" />
                @if (isInvalid('firstName')) { <p class="mt-1 text-xs text-error">{{ 'register.required' | t }}</p> }
              </div>
              <div>
                <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">{{ 'register.lastNameLabel' | t }}</label>
                <input formControlName="lastName" type="text"
                  class="w-full px-4 py-3 bg-surface border rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all"
                  [class.border-error]="isInvalid('lastName')" [class.border-outline-variant]="!isInvalid('lastName')"
                  placeholder="Lovelace" />
                @if (isInvalid('lastName')) { <p class="mt-1 text-xs text-error">{{ 'register.required' | t }}</p> }
              </div>
            </div>

            <div>
              <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">{{ 'register.usernameLabel' | t }}</label>
              <input formControlName="username" type="text"
                class="w-full px-4 py-3 bg-surface border rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all"
                [class.border-error]="isInvalid('username')" [class.border-outline-variant]="!isInvalid('username')"
                placeholder="your_username" />
              @if (isInvalid('username')) { <p class="mt-1 text-xs text-error">{{ 'register.usernameRequired' | t }}</p> }
            </div>

            <div>
              <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">{{ 'register.emailLabel' | t }}</label>
              <input formControlName="email" type="email"
                class="w-full px-4 py-3 bg-surface border rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all"
                [class.border-error]="isInvalid('email')" [class.border-outline-variant]="!isInvalid('email')"
                placeholder="you@example.com" />
              @if (isInvalid('email')) { <p class="mt-1 text-xs text-error">{{ 'register.emailRequired' | t }}</p> }
            </div>

            <!-- Password -->
            <div>
              <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">{{ 'register.passwordLabel' | t }}</label>
              <div class="relative">
                <input formControlName="password" [type]="showPassword() ? 'text' : 'password'"
                  class="w-full px-4 py-3 pr-12 bg-surface border rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all"
                  [class.border-error]="isInvalid('password')" [class.border-outline-variant]="!isInvalid('password')"
                  placeholder="5–16 characters" />
                <button type="button" (click)="showPassword.set(!showPassword())"
                  class="absolute inset-y-0 right-0 flex items-center px-3 text-on-surface-variant hover:text-on-surface transition-colors">
                  <span class="material-symbols-outlined" style="font-size:20px">{{ showPassword() ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
              @if (isInvalid('password')) { <p class="mt-1 text-xs text-error">{{ 'register.passwordRequired' | t }}</p> }
            </div>

            <!-- Confirm Password -->
            <div>
              <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">{{ 'register.confirmPasswordLabel' | t }}</label>
              <div class="relative">
                <input formControlName="confirmPassword" [type]="showConfirmPassword() ? 'text' : 'password'"
                  class="w-full px-4 py-3 pr-12 bg-surface border rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all"
                  [class.border-error]="isInvalidConfirm()" [class.border-outline-variant]="!isInvalidConfirm()"
                  placeholder="••••••••" />
                <button type="button" (click)="showConfirmPassword.set(!showConfirmPassword())"
                  class="absolute inset-y-0 right-0 flex items-center px-3 text-on-surface-variant hover:text-on-surface transition-colors">
                  <span class="material-symbols-outlined" style="font-size:20px">{{ showConfirmPassword() ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
              @if (isInvalid('confirmPassword') && form.get('confirmPassword')?.errors?.['required']) {
                <p class="mt-1 text-xs text-error">{{ 'register.confirmPasswordRequired' | t }}</p>
              } @else if (isInvalidConfirm()) {
                <p class="mt-1 text-xs text-error">{{ 'register.passwordMismatch' | t }}</p>
              }
            </div>

            <div>
              <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">
                {{ 'register.phoneLabel' | t }} <span class="normal-case font-normal text-on-surface-variant/60">{{ 'register.phoneOptional' | t }}</span>
              </label>
              <input formControlName="phoneNumber" type="tel"
                class="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all"
                placeholder="5XX XXX XX XX" />
              @if (isInvalid('phoneNumber')) {
                <p class="mt-1 text-xs text-error">{{ 'register.phoneRequired' | t }}</p>
              }
            </div>

            @if (formError()) {
              <div class="p-3 rounded-lg bg-error-container border border-error/20 text-sm text-on-error-container">{{ formError() }}</div>
            }

            <button type="submit" [disabled]="isLoading()"
              class="w-full bg-gradient-to-r from-amber-300 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-white py-4 rounded-lg text-xs font-semibold tracking-widest uppercase transition-all shadow-[0_4px_20px_rgba(251,191,36,0.2)] hover:shadow-[0_8px_25px_rgba(251,191,36,0.4)] disabled:opacity-60 flex justify-center items-center gap-2 mt-2">
              @if (isLoading()) {
                <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              } @else {
                {{ 'register.submit' | t }}
                <span class="material-symbols-outlined" style="font-size:18px">arrow_forward</span>
              }
            </button>
          </form>

          <p class="mt-6 text-center text-sm text-on-surface-variant">
            {{ 'register.haveAccount' | t }}
            <a routerLink="/login" class="text-secondary font-medium hover:text-on-secondary-container transition-colors">{{ 'register.signIn' | t }}</a>
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
  private readonly i18n = inject(I18nService);

  readonly isLoading = signal(false);
  readonly formError = signal<string | null>(null);
  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);

  readonly form = this.fb.group({
    firstName:       ['', Validators.required],
    lastName:        ['', Validators.required],
    username:        ['', Validators.required],
    email:           ['', [Validators.required, Validators.email]],
    password:        ['', [Validators.required, Validators.minLength(5), Validators.maxLength(16)]],
    confirmPassword: ['', Validators.required],
    phoneNumber:     ['']
  }, { validators: passwordMatchValidator });

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }

  /** True when confirm field is touched AND (field-level or group-level mismatch error exists) */
  isInvalidConfirm(): boolean {
    const ctrl = this.form.get('confirmPassword');
    if (!ctrl?.touched) return false;
    return ctrl.invalid || !!this.form.errors?.['passwordMismatch'];
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.formError.set(null);
    this.isLoading.set(true);
    const val = this.form.getRawValue();
    const dto = { ...val, phoneNumber: val.phoneNumber || undefined };
    // confirmPassword is only for UI validation — omit from payload
    const { confirmPassword: _, ...payload } = dto;
    this.userService.create(payload as any).subscribe({
      next: () => {
        this.toast.show(this.i18n.t('register.success'), 'success');
        this.router.navigate(['/login']);
      },
      error: (err: ErrorResponseDto) => {
        this.isLoading.set(false);
        this.formError.set(err?.errorCode === 'ALREADY_EXISTS'
          ? this.i18n.t('register.alreadyExists')
          : this.i18n.t('register.failed'));
      }
    });
  }
}
