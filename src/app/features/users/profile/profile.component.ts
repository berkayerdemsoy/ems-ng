import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { ErrorToastService } from '../../../shared/components/error-toast/error-toast.service';
import { I18nService } from '../../../core/services/i18n.service';
import { ErrorResponseDto } from '../../../core/models';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

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
                <p class="text-xl font-medium text-on-surface">{{ user.firstName }} {{ user.lastName }}</p>
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
                <button (click)="sendVerification()" [disabled]="sendingVerification()"
                  class="text-xs font-semibold tracking-widest uppercase text-secondary underline hover:text-on-secondary-container disabled:opacity-50 transition-colors">
                  {{ sendingVerification() ? ('profile.sendingLink' | t) : ('profile.sendLink' | t) }}
                </button>
              </div>
            } @else {
              <div class="flex items-center gap-3 p-4 bg-green-50 border border-green-200/60 rounded-lg">
                <span class="material-symbols-outlined text-green-600" style="font-size:20px">mark_email_read</span>
                <p class="text-sm text-green-800 font-medium">{{ 'profile.emailVerified' | t }} — {{ user.email }}</p>
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

          <!-- Update Form -->
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
                <div>
                  <label class="block text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-2">
                    {{ 'profile.passwordLabel' | t }} <span class="normal-case text-on-surface-variant/60 font-normal">{{ 'profile.passwordNote' | t }}</span>
                  </label>
                  <input formControlName="password" type="password"
                    class="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all"
                    placeholder="••••••••" />
                </div>

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
        }
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly toast = inject(ErrorToastService);
  private readonly i18n = inject(I18nService);
  private readonly fb = inject(FormBuilder);

  readonly isSaving = signal(false);
  readonly sendingVerification = signal(false);
  readonly becomingOwner = signal(false);
  readonly editMode = signal(false);

  readonly form = this.fb.group({
    firstName:   [{ value: '', disabled: true }],
    lastName:    [{ value: '', disabled: true }],
    email:       [{ value: '', disabled: true }],   // her zaman disabled
    phoneNumber: [{ value: '', disabled: true }],
    password:    [{ value: '', disabled: true }],
  });

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (user) {
      this.form.patchValue({
        firstName: user.firstName, lastName: user.lastName,
        email: user.email, phoneNumber: user.phoneNumber
      });
    }
  }

  enableEdit(): void {
    this.form.get('firstName')?.enable();
    this.form.get('lastName')?.enable();
    this.form.get('phoneNumber')?.enable();
    this.form.get('password')?.enable();
    // email intentionally stays disabled
    this.editMode.set(true);
  }

  cancelEdit(): void {
    const user = this.auth.currentUser();
    if (user) {
      this.form.patchValue({
        firstName: user.firstName, lastName: user.lastName,
        email: user.email, phoneNumber: user.phoneNumber, password: ''
      });
    }
    this.disableEditableFields();
    this.editMode.set(false);
  }

  private disableEditableFields(): void {
    ['firstName', 'lastName', 'phoneNumber', 'password'].forEach(f =>
      this.form.get(f)?.disable()
    );
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
    if (!id) return;
    this.sendingVerification.set(true);
    this.userService.requestVerification(id).subscribe({
      next: () => {
        this.sendingVerification.set(false);
        this.toast.show('Doğrulama emaili gönderildi. Email kutunuzu kontrol edin.', 'success');
      },
      error: () => { this.sendingVerification.set(false); }
    });
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
    if (val.firstName)   dto.firstName = val.firstName;
    if (val.lastName)    dto.lastName = val.lastName;
    if (val.phoneNumber) dto.phoneNumber = val.phoneNumber;
    if (val.password)    dto.password = val.password;
    // email intentionally excluded — backend should not receive it

    this.userService.update(id, dto).subscribe({
      next: () => {
        this.auth.refreshUser(id);
        this.isSaving.set(false);
        this.toast.show(this.i18n.t('profile.successUpdate'), 'success');
        this.form.patchValue({ password: '' });
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
}

