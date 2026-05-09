import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { ErrorToastService } from '../../../shared/components/error-toast/error-toast.service';
import { I18nService } from '../../../core/services/i18n.service';
import { UserResponseDto, Page } from '../../../core/models';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-admin-user-list',
  standalone: true,
  imports: [DatePipe, PaginationComponent, TranslatePipe],
  template: `
    <div class="min-h-screen pt-28 pb-24 px-[max(24px,5vw)] relative">
      <div class="absolute top-32 right-20 w-80 h-80 bg-secondary-container/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <div class="max-w-7xl mx-auto">
        <div class="mb-10">
          <span class="text-[11px] font-semibold tracking-[0.15em] uppercase text-on-surface-variant px-4 py-1 rounded-full glass-panel inline-block mb-4">{{ 'adminUsers.badge' | t }}</span>
          <h1 class="text-[48px] leading-[1.2] tracking-[-0.02em] font-light text-on-surface">{{ 'adminUsers.title' | t }}</h1>
          @if (usersPage()) {
            <p class="text-base text-on-surface-variant mt-2">{{ usersPage()!.totalElements }} {{ 'adminUsers.totalMembers' | t }}</p>
          }
        </div>

        <div class="bg-surface-container-lowest/80 backdrop-blur-xl rounded-xl border border-outline-variant/30 shadow-[0_20px_40px_rgba(28,28,23,0.03)] overflow-hidden">

          @if (isLoading()) {
            <div class="p-8 space-y-3">
              @for (i of [1,2,3,4,5]; track i) {
                <div class="animate-pulse h-14 bg-surface-container/50 rounded-lg"></div>
              }
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-outline-variant/30">
                      <th class="px-6 py-4 text-left text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant">{{ 'adminUsers.colUser' | t }}</th>
                      <th class="px-6 py-4 text-left text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant">{{ 'adminUsers.colEmail' | t }}</th>
                      <th class="px-6 py-4 text-left text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant">{{ 'adminUsers.colRole' | t }}</th>
                      <th class="px-6 py-4 text-left text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant">{{ 'adminUsers.colJoined' | t }}</th>
                      <th class="px-6 py-4 text-left text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant">{{ 'adminUsers.colStatus' | t }}</th>
                      <th class="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-outline-variant/20">
                  @for (user of usersPage()?.content; track user.id) {
                    <tr class="hover:bg-surface-container/40 transition-colors">
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                          <div class="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-semibold text-on-surface-variant border border-outline-variant/30">
                            {{ user.firstName[0] }}{{ user.lastName[0] }}
                          </div>
                          <!-- Username + tooltip -->
                          <span class="relative group/tip">
                            <span class="text-base font-medium text-on-surface cursor-default">{{ user.username }}</span>
                            @if (user.firstName || user.lastName) {
                              <span class="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg bg-inverse-surface text-inverse-on-surface text-xs font-medium whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 shadow-lg z-50 select-none">
                                {{ user.firstName }} {{ user.lastName }}
                                <span class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-inverse-surface"></span>
                              </span>
                            }
                          </span>
                        </div>
                      </td>
                      <td class="px-6 py-4 text-on-surface-variant text-sm">{{ user.email }}</td>
                      <td class="px-6 py-4">
                        <span class="px-3 py-1 text-[10px] font-semibold tracking-widest uppercase rounded-full" [class]="roleBadge(user.role)">
                          {{ user.role }}
                        </span>
                      </td>
                      <td class="px-6 py-4 text-on-surface-variant text-sm">{{ user.createdAt | date:'dd MMM yyyy' }}</td>
                      <td class="px-6 py-4">
                        @if (user.verified) {
                          <span class="flex items-center gap-1 text-xs text-green-700">
                              <span class="material-symbols-outlined" style="font-size:14px">verified</span> {{ 'adminUsers.verified' | t }}
                            </span>
                          } @else {
                            <span class="flex items-center gap-1 text-xs text-on-surface-variant/60">
                              <span class="material-symbols-outlined" style="font-size:14px">pending</span> {{ 'adminUsers.unverified' | t }}
                            </span>
                        }
                      </td>
                      <td class="px-6 py-4 text-right">
                        <button (click)="deleteUser(user)"
                          class="text-xs font-semibold tracking-widest uppercase text-on-surface-variant hover:text-error transition-colors flex items-center gap-1 ml-auto">
                          <span class="material-symbols-outlined" style="font-size:16px">delete</span>
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            @if (usersPage()) {
              <div class="px-6 py-4 border-t border-outline-variant/20">
                <app-pagination [pageData]="usersPage()!" (pageChange)="onPageChange($event)" />
              </div>
            }
          }
        </div>
      </div>
    </div>
  `
})
export class AdminUserListComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly toast = inject(ErrorToastService);
  private readonly i18n = inject(I18nService);

  readonly usersPage = signal<Page<UserResponseDto> | null>(null);
  readonly isLoading = signal(true);

  ngOnInit(): void {
    this.loadUsers(0);
  }

  private loadUsers(page: number): void {
    this.isLoading.set(true);
    this.userService.getAll(page).subscribe({
      next: data => { this.usersPage.set(data); this.isLoading.set(false); },
      error: () => this.isLoading.set(false)
    });
  }

  onPageChange(page: number): void {
    this.loadUsers(page);
  }

  roleBadge(role: string): string {
    const map: Record<string, string> = {
      ADMIN:       'bg-secondary-container/20 text-secondary border border-secondary-container/30',
      EVENT_OWNER: 'bg-surface-container-high text-on-surface border border-outline-variant/30',
      USER:        'bg-surface-container text-on-surface-variant border border-outline-variant/20'
    };
    return map[role] ?? 'bg-surface-container text-on-surface-variant';
  }

  deleteUser(user: UserResponseDto): void {
    this.toast.confirm(`"${user.username}" ${this.i18n.t('adminUsers.deleteConfirm')}`).then(ok => {
      if (!ok) return;
      this.userService.delete(user.id).subscribe({
        next: () => {
          this.toast.show(this.i18n.t('adminUsers.deleteSuccess'), 'success');
          const page = this.usersPage()?.number ?? 0;
          this.loadUsers(page);
        }
      });
    });
  }
}

