import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { ErrorToastService } from '../../../shared/components/error-toast/error-toast.service';
import { I18nService } from '../../../core/services/i18n.service';
import { ErrorResponseDto } from '../../../core/models';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const newPass = group.get('newPassword')?.value;
  const confirm = group.get('confirmNewPassword')?.value;
  return newPass && confirm && newPass !== confirm ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="min-h-screen pt-28 pb-24 px-[max(24px,5vw)] relative">
      <div class="absolute top-32 right-1/4 w-96 h-96 bg-secondary-container/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <div class="max-w-2xl mx-auto space-y-8">
        <div>
          <span class="text-[11px] font-semibold tracking-[0.15em] uppercase text-on-surface-variant px-4 py-1 rounded-full glass-panel inline-block mb-4">{{ 'profile.badge' | t }}</span>
          <h1 class="text-[48px] leading-[1.2] tracking-[-0.02em] font-light text-on-surface">{{ 'profile.title' | t }}</h1>
        </div>

        @let user = auth.currentUser();
        @if (user) {

          <!-- Identity Card -->
          <div class="bg-surface-container-lowest/80 backdrop-blur-xl rounded-xl p-8 border border-outline-variant/30 shadow-[0_20px_40px_rgba(28,28,23,0.03)]">
            <div class="flex items-center gap-6 mb-6">
              <div class="w-16 h-16 rounded-full bg-secondary-container/30 flex items-center justify-center text-2xl font-light text-secondary border border-secondary-container/40">
                {{ user.firstName[0] }}{{ user.lastName[0] }}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <p class="text-xl font-medium text-on-surface">{{ user.firstName }} {{ user.lastName }}</p>
                  @if (user.verified) {
                    <span class="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold tracking-widest uppercase rounded-full bg-green-100 text-green-700 border border-green-200/70">
                      <span class="material-symbols-outlined" style="font-size:13px">verified</span>
                      {{ 'profile.verified' | t }}
                    </span>
                  }
                </div>
                <p class="text-sm text-on-surface-variant">&#64;{{ user.username }}</p>
                <span class="inline-block px-3 py-0.5 text-[11px] font-semibold tracking-widest uppercase rounded-full mt-2" [class]="roleBadge(user.role)">
                  {{ user.role }}
                </span>
              </div>
            </div>

            <!-- Email Verification -->
            @if (!user.verified) {
              <div class="flex items-center justify-between p-4 bg-secondary-container/10 border border-secondary-container/30 rounded-lg">
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-secondary" style="font-size:20px">mark_email_unread</span>
                  <div>
                    <p class="text-sm font-medium text-on-surface">{{ 'profile.emailNotVerified' | t }}</p>
                    <p class="text-xs text-on-surface-variant">{{ user.email }}</p>
                  </div>
                </div>
                <button (click)="sendVerification()" [disabled]="sendingVerification() || cooldownLeft() > 0"
                  class="text-xs font-semibold tracking-widest uppercase text-secondary underline hover:text-on-secondary-container disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed transition-colors">
                  @if (sendingVerification()) {
                    {{ 'profile.sendingLink' | t }}
                  } @else if (cooldownLeft() > 0) {
                    {{ 'profile.linkSent' | t }} ({{ cooldownLeft() }}s)
                  } @else {
                    {{ 'profile.sendLink' | t }}
                  }
                </button>
              </div>
            }

            <!-- Become Owner -->
            @if (user.role === 'USER') {
              <div class="mt-4 p-5 glass-card rounded-xl flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-secondary" style="font-size:22px">
                    {{ user.verified ? 'star' : 'lock' }}
                  </span>
                  <div>
                    <p class="text-sm font-medium text-on-surface">{{ 'profile.becomeOwnerTitle' | t }}</p>
                    <p class="text-xs text-on-surface-variant mt-0.5">
                      @if (!user.verified) { {{ 'profile.verifyFirst' | t }} }
                      @else { {{ 'profile.becomeOwnerDesc' | t }} }
                    </p>
                  </div>
                </div>
                <button (click)="becomeOwner()" [disabled]="!user.verified || becomingOwner()"
                  class="px-5 py-2.5 text-xs font-semibold tracking-widest uppercase rounded-full transition-all"
                  [class]="user.verified
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white hover:shadow-[0_4px_15px_rgba(245,158,11,0.4)]'
                    : 'bg-surface-container text-on-surface-variant cursor-not-allowed'">
                  {{ becomingOwner() ? ('profile.upgrading' | t) : ('profile.becomeOwnerBtn' | t) }}
                </button>
              </div>
            }
          </div>

          <!-- Update Profile Form -->
          <div class="bg-surface-container-lowest/80 backdrop-blur-xl rounded-xl p-8 border border-outline-variant/30 shadow-[0_20px_40px_rgba(28,28,23,0.03)]">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-medium text-on-surface">{{ 'profile.updateProfile' | t }}</h2>
              @if (!editMode()) {
                <button type="button" (click)="enableEdit()"
                  class="flex items-center gap-2 px-5 py-2 text-xs font-semibold tracking-widest uppercase rounded-full border border-outline-variant hover:bg-surface-container transition-colors text-on-surface-variant">
                  <span class="material-symbols-outlined" style="font-size:16px">edit</span>
                  {{ 'profile.edit' | t }}
                </button>
              }
            </div>

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">{{ 'profile.firstNameLabel' | t }}</label>
                  <input formControlName="firstName" type="text"
                    class="w-full px-4 py-3 border rounded-lg text-base text-on-surface focus:outline-none transition-all"
                    [class]="editMode()
                      ? 'bg-surface border-outline-variant focus:ring-2 focus:ring-secondary-container/50'
                      : 'bg-surface-container/40 border-transparent cursor-default select-none'" />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">{{ 'profile.lastNameLabel' | t }}</label>
                  <input formControlName="lastName" type="text"
                    class="w-full px-4 py-3 border rounded-lg text-base text-on-surface focus:outline-none transition-all"
                    [class]="editMode()
                      ? 'bg-surface border-outline-variant focus:ring-2 focus:ring-secondary-container/50'
                      : 'bg-surface-container/40 border-transparent cursor-default select-none'" />
                </div>
              </div>

              <div>
                <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">
                  {{ 'profile.emailLabel' | t }}
                  <span class="ml-2 normal-case font-normal text-on-surface-variant/50">{{ 'profile.emailNote' | t }}</span>
                </label>
                <input formControlName="email" type="email"
                  class="w-full px-4 py-3 bg-surface-container/40 border border-transparent rounded-lg text-base text-on-surface-variant cursor-not-allowed opacity-70 select-none" />
              </div>

              <div>
                <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">{{ 'profile.phoneLabel' | t }}</label>
                <input formControlName="phoneNumber" type="tel"
                  class="w-full px-4 py-3 border rounded-lg text-base text-on-surface focus:outline-none transition-all"
                  [class]="editMode()
                    ? 'bg-surface border-outline-variant focus:ring-2 focus:ring-secondary-container/50'
                    : 'bg-surface-container/40 border-transparent cursor-default select-none'" />
              </div>

              @if (editMode()) {
                <div class="flex gap-3 pt-2">
                  <button type="button" (click)="cancelEdit()"
                    class="px-6 py-3 text-xs font-semibold tracking-widest uppercase text-on-surface-variant border border-outline-variant hover:bg-surface-container rounded-lg transition-colors">
                    {{ 'profile.cancel' | t }}
                  </button>
                  <button type="submit" [disabled]="isSaving()"
                    class="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white py-3 rounded-lg text-xs font-semibold tracking-widest uppercase transition-all shadow-[0_4px_20px_rgba(245,158,11,0.2)] hover:shadow-[0_8px_25px_rgba(245,158,11,0.4)] disabled:opacity-60 flex justify-center items-center gap-2">
                    @if (isSaving()) {
                      <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    } @else {
                      {{ 'profile.save' | t }}
                      <span class="material-symbols-outlined" style="font-size:18px">check</span>
                    }
                  </button>
                </div>
              }
            </form>
          </div>

          <!-- Change Password Card -->
          <div class="bg-surface-container-lowest/80 backdrop-blur-xl rounded-xl p-8 border border-outline-variant/30 shadow-[0_20px_40px_rgba(28,28,23,0.03)]">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-medium text-on-surface">{{ 'profile.changePasswordTitle' | t }}</h2>
              @if (!passwordEditMode()) {
                <button type="button" (click)="passwordEditMode.set(true)"
                  class="flex items-center gap-2 px-5 py-2 text-xs font-semibold tracking-widest uppercase rounded-full border border-outline-variant hover:bg-surface-container transition-colors text-on-surface-variant">
                  <span class="material-symbols-outlined" style="font-size:16px">lock_reset</span>
                  {{ 'profile.changePasswordBtn' | t }}
                </button>
              }
            </div>

            @if (passwordEditMode()) {
              <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()" class="space-y-5">

                <!-- Old Password -->
                <div>
                  <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">{{ 'profile.oldPasswordLabel' | t }}</label>
                  <div class="relative">
                    <input formControlName="oldPassword" [type]="showOldPassword() ? 'text' : 'password'"
                      class="w-full px-4 py-3 pr-12 bg-surface border rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all"
                      [class.border-error]="isPwdInvalid('oldPassword')" [class.border-outline-variant]="!isPwdInvalid('oldPassword')"
                      placeholder="••••••••" />
                    <button type="button" (click)="showOldPassword.set(!showOldPassword())"
                      class="absolute inset-y-0 right-0 flex items-center px-3 text-on-surface-variant hover:text-on-surface transition-colors">
                      <span class="material-symbols-outlined" style="font-size:20px">{{ showOldPassword() ? 'visibility_off' : 'visibility' }}</span>
                    </button>
                  </div>
                  @if (isPwdInvalid('oldPassword')) {
                    <p class="mt-1 text-xs text-error">{{ 'profile.oldPasswordRequired' | t }}</p>
                  }
                </div>

                <!-- New Password -->
                <div>
                  <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">{{ 'profile.newPasswordLabel' | t }}</label>
                  <div class="relative">
                    <input formControlName="newPassword" [type]="showNewPassword() ? 'text' : 'password'"
                      class="w-full px-4 py-3 pr-12 bg-surface border rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all"
                      [class.border-error]="isPwdInvalid('newPassword')" [class.border-outline-variant]="!isPwdInvalid('newPassword')"
                      placeholder="5–16 characters" />
                    <button type="button" (click)="showNewPassword.set(!showNewPassword())"
                      class="absolute inset-y-0 right-0 flex items-center px-3 text-on-surface-variant hover:text-on-surface transition-colors">
                      <span class="material-symbols-outlined" style="font-size:20px">{{ showNewPassword() ? 'visibility_off' : 'visibility' }}</span>
                    </button>
                  </div>
                  @if (isPwdInvalid('newPassword')) {
                    <p class="mt-1 text-xs text-error">{{ 'profile.newPasswordRequired' | t }}</p>
                  }
                </div>

                <!-- Confirm New Password -->
                <div>
                  <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">{{ 'profile.confirmNewPasswordLabel' | t }}</label>
                  <div class="relative">
                    <input formControlName="confirmNewPassword" [type]="showConfirmPassword() ? 'text' : 'password'"
                      class="w-full px-4 py-3 pr-12 bg-surface border rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all"
                      [class.border-error]="isConfirmPwdInvalid()" [class.border-outline-variant]="!isConfirmPwdInvalid()"
                      placeholder="••••••••" />
                    <button type="button" (click)="showConfirmPassword.set(!showConfirmPassword())"
                      class="absolute inset-y-0 right-0 flex items-center px-3 text-on-surface-variant hover:text-on-surface transition-colors">
                      <span class="material-symbols-outlined" style="font-size:20px">{{ showConfirmPassword() ? 'visibility_off' : 'visibility' }}</span>
                    </button>
                  </div>
                  @if (passwordForm.get('confirmNewPassword')?.touched && passwordForm.get('confirmNewPassword')?.errors?.['required']) {
                    <p class="mt-1 text-xs text-error">{{ 'profile.confirmNewPasswordRequired' | t }}</p>
                  } @else if (isConfirmPwdInvalid()) {
                    <p class="mt-1 text-xs text-error">{{ 'profile.passwordMismatch' | t }}</p>
                  }
                </div>

                <div class="flex gap-3 pt-2">
                  <button type="button" (click)="cancelPasswordEdit()"
                    class="px-6 py-3 text-xs font-semibold tracking-widest uppercase text-on-surface-variant border border-outline-variant hover:bg-surface-container rounded-lg transition-colors">
                    {{ 'profile.cancel' | t }}
                  </button>
                  <button type="submit" [disabled]="isChangingPassword()"
                    class="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white py-3 rounded-lg text-xs font-semibold tracking-widest uppercase transition-all shadow-[0_4px_20px_rgba(245,158,11,0.2)] hover:shadow-[0_8px_25px_rgba(245,158,11,0.4)] disabled:opacity-60 flex justify-center items-center gap-2">
                    @if (isChangingPassword()) {
                      <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    } @else {
                      {{ 'profile.changePasswordBtn' | t }}
                      <span class="material-symbols-outlined" style="font-size:18px">lock_reset</span>
                    }
                  </button>
                </div>
              </form>
            } @else {
              <p class="text-sm text-on-surface-variant">••••••••••••</p>
            }
          </div>

        }
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit, OnDestroy {
  readonly auth = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly toast = inject(ErrorToastService);
  private readonly i18n = inject(I18nService);
  private readonly fb = inject(FormBuilder);

  readonly isSaving          = signal(false);
  readonly sendingVerification = signal(false);
  readonly becomingOwner     = signal(false);
  readonly editMode          = signal(false);
  readonly cooldownLeft      = signal(0);

  // Password change signals
  readonly passwordEditMode    = signal(false);
  readonly isChangingPassword  = signal(false);
  readonly showOldPassword     = signal(false);
  readonly showNewPassword     = signal(false);
  readonly showConfirmPassword = signal(false);

  private readonly COOLDOWN_MS = 30_000;
  private readonly STORAGE_KEY = 'verifyCooldownAt';
  private cooldownInterval: ReturnType<typeof setInterval> | null = null;

  // Profile form (no password field anymore)
  readonly form = this.fb.group({
    firstName:   [{ value: '', disabled: true }],
    lastName:    [{ value: '', disabled: true }],
    email:       [{ value: '', disabled: true }],
    phoneNumber: [{ value: '', disabled: true }],
  });

  // Separate password change form with cross-field validator
  readonly passwordForm = this.fb.group({
    oldPassword:        ['', Validators.required],
    newPassword:        ['', [Validators.required, Validators.minLength(5), Validators.maxLength(16)]],
    confirmNewPassword: ['', Validators.required],
  }, { validators: passwordMatchValidator });

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (user) {
      this.form.patchValue({
        firstName: user.firstName, lastName: user.lastName,
        email: user.email, phoneNumber: user.phoneNumber
      });
    }
    // Restore cooldown if still active from a previous click
    const sentAt = Number(localStorage.getItem(this.STORAGE_KEY) ?? 0);
    if (sentAt) {
      const remaining = Math.ceil((this.COOLDOWN_MS - (Date.now() - sentAt)) / 1000);
      if (remaining > 0) this.startCooldown(remaining);
      else localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  ngOnDestroy(): void {
    this.stopCooldown();
  }

  enableEdit(): void {
    this.form.get('firstName')?.enable();
    this.form.get('lastName')?.enable();
    this.form.get('phoneNumber')?.enable();
    this.editMode.set(true);
  }

  cancelEdit(): void {
    const user = this.auth.currentUser();
    if (user) {
      this.form.patchValue({
        firstName: user.firstName, lastName: user.lastName,
        email: user.email, phoneNumber: user.phoneNumber
      });
    }
    this.disableEditableFields();
    this.editMode.set(false);
  }

  private disableEditableFields(): void {
    ['firstName', 'lastName', 'phoneNumber'].forEach(f => this.form.get(f)?.disable());
  }

  cancelPasswordEdit(): void {
    this.passwordForm.reset();
    this.passwordEditMode.set(false);
    this.showOldPassword.set(false);
    this.showNewPassword.set(false);
    this.showConfirmPassword.set(false);
  }

  /** Field-level error helper for the profile form */
  isPwdInvalid(field: string): boolean {
    const ctrl = this.passwordForm.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }

  /** Group-level mismatch error for confirmNewPassword */
  isConfirmPwdInvalid(): boolean {
    const ctrl = this.passwordForm.get('confirmNewPassword');
    if (!ctrl?.touched) return false;
    return ctrl.invalid || !!this.passwordForm.errors?.['passwordMismatch'];
  }

  roleBadge(role: string): string {
    const map: Record<string, string> = {
      ADMIN:       'bg-secondary-container/20 text-secondary border border-secondary-container/30',
      EVENT_OWNER: 'bg-surface-container-high text-on-surface border border-outline-variant/30',
      USER:        'bg-surface-container text-on-surface-variant border border-outline-variant/20'
    };
    return map[role] ?? 'bg-surface-container text-on-surface-variant';
  }

  sendVerification(): void {
    const id = this.auth.currentUser()?.id;
    if (!id || this.cooldownLeft() > 0) return;
    this.sendingVerification.set(true);
    this.userService.requestVerification(id).subscribe({
      next: () => {
        this.sendingVerification.set(false);
        this.toast.show(this.i18n.t('profile.verificationSent'), 'success');
        localStorage.setItem(this.STORAGE_KEY, String(Date.now()));
        this.startCooldown(30);
      },
      error: () => { this.sendingVerification.set(false); }
    });
  }

  private startCooldown(seconds: number): void {
    this.cooldownLeft.set(seconds);
    this.stopCooldown();
    this.cooldownInterval = setInterval(() => {
      const next = this.cooldownLeft() - 1;
      this.cooldownLeft.set(next);
      // Check verification status every 5 seconds
      if (next % 5 === 0) {
        const id = this.auth.currentUser()?.id;
        if (id) this.auth.refreshUser(id);
      }
      if (next <= 0) {
        this.stopCooldown();
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }, 1000);
  }

  private stopCooldown(): void {
    if (this.cooldownInterval) {
      clearInterval(this.cooldownInterval);
      this.cooldownInterval = null;
    }
  }

  becomeOwner(): void {
    const id = this.auth.currentUser()?.id;
    if (!id) return;
    this.becomingOwner.set(true);
    this.userService.becomeOwner(id).subscribe({
      next: () => {
        this.auth.refreshUser(id);
        this.becomingOwner.set(false);
        this.toast.show('Artık bir Event Owner\'sınız!', 'success');
      },
      error: () => { this.becomingOwner.set(false); }
    });
  }

  onSubmit(): void {
    const id = this.auth.currentUser()?.id;
    if (!id) return;
    this.isSaving.set(true);
    const val = this.form.getRawValue();
    const dto: any = {};
    if (val.firstName)   dto.firstName   = val.firstName;
    if (val.lastName)    dto.lastName    = val.lastName;
    if (val.phoneNumber) dto.phoneNumber = val.phoneNumber;

    this.userService.update(id, dto).subscribe({
      next: () => {
        this.auth.refreshUser(id);
        this.isSaving.set(false);
        this.toast.show(this.i18n.t('profile.successUpdate'), 'success');
        this.disableEditableFields();
        this.editMode.set(false);
      },
      error: (err: ErrorResponseDto) => {
        this.isSaving.set(false);
        if (err?.errorCode === 'ALREADY_EXISTS') {
          this.toast.show(this.i18n.t('profile.emailAlreadyExists'), 'error');
        }
      }
    });
  }

  onChangePassword(): void {
    this.passwordForm.markAllAsTouched();
    if (this.passwordForm.invalid) return;

    this.isChangingPassword.set(true);
    const { oldPassword, newPassword } = this.passwordForm.getRawValue();

    this.userService.changePassword({ oldPassword: oldPassword!, newPassword: newPassword! }).subscribe({
      next: () => {
        this.isChangingPassword.set(false);
        this.toast.show(this.i18n.t('profile.changePasswordSuccess'), 'success');
        this.cancelPasswordEdit();
      },
      error: (err: ErrorResponseDto) => {
        this.isChangingPassword.set(false);
        const msg = err?.errorCode === 'INVALID_CREDENTIALS' || err?.errorCode === 'WRONG_PASSWORD'
          ? this.i18n.t('profile.wrongOldPassword')
          : this.i18n.t('profile.changePasswordFailed');
        this.toast.show(msg, 'error');
      }
    });
  }
}
