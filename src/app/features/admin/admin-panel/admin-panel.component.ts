import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { UserService } from '../../../core/services/user.service';
import { EventService } from '../../../core/services/event.service';
import { CategoryService } from '../../../core/services/category.service';
import { ErrorToastService } from '../../../shared/components/error-toast/error-toast.service';
import { I18nService } from '../../../core/services/i18n.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { CategoryNamePipe } from '../../../shared/pipes/category-name.pipe';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

import {
  UserResponseDto,
  EventResponseDto,
  CategoryDto,
  Page,
} from '../../../core/models';

type AdminTab = 'categories' | 'events' | 'users';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [DatePipe, RouterLink, FormsModule, TranslatePipe, CategoryNamePipe, PaginationComponent],
  template: `
    <div class="min-h-screen pt-28 pb-24 px-[max(24px,5vw)] relative">
      <!-- Background blobs -->
      <div class="absolute top-32 right-20 w-96 h-96 bg-secondary-container/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div class="absolute bottom-40 left-10 w-72 h-72 bg-amber-300/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <div class="max-w-7xl mx-auto">

        <!-- Header -->
        <div class="mb-10">
          <span class="text-[11px] font-semibold tracking-[0.15em] uppercase text-on-surface-variant px-4 py-1 rounded-full glass-panel inline-block mb-4">{{ 'adminPanel.badge' | t }}</span>
          <h1 class="text-[48px] leading-[1.2] tracking-[-0.02em] font-light text-on-surface">{{ 'adminPanel.title' | t }}</h1>
          <p class="text-base text-on-surface-variant mt-2">{{ 'adminPanel.subtitle' | t }}</p>
        </div>

        <!-- Tab bar -->
        <div class="flex items-center gap-1 mb-8 bg-surface-container-lowest/80 backdrop-blur-xl rounded-xl border border-outline-variant/30 p-1.5 w-fit shadow-[0_8px_24px_rgba(28,28,23,0.04)]">
          @for (tab of tabs; track tab.id) {
            <button (click)="activeTab.set(tab.id)"
              class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[11px] font-semibold tracking-widest uppercase transition-all duration-200"
              [class]="activeTab() === tab.id
                ? 'bg-gradient-to-r from-amber-300 to-amber-400 text-white shadow-[0_4px_12px_rgba(251,191,36,0.35)]'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60'">
              <span class="material-symbols-outlined" style="font-size:16px">{{ tab.icon }}</span>
              {{ tab.label | t }}
            </button>
          }
        </div>

        <!-- ═══════════════════════════════════════════════
             TAB: CATEGORIES
        ═══════════════════════════════════════════════ -->
        @if (activeTab() === 'categories') {
          <div class="space-y-5">
            <!-- Section header -->
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-light text-on-surface tracking-tight">{{ 'adminPanel.categoriesTitle' | t }}</h2>
                <p class="text-sm text-on-surface-variant mt-0.5">{{ categories().length }} {{ 'adminPanel.categoriesCount' | t }}</p>
              </div>
            </div>

            <!-- Create form -->
            <div class="bg-surface-container-lowest/80 backdrop-blur-xl rounded-xl p-6 border border-outline-variant/30 shadow-[0_8px_24px_rgba(28,28,23,0.03)]">
              <p class="text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-4">{{ 'adminPanel.newCategory' | t }}</p>
              <div class="flex gap-3">
                <input [(ngModel)]="newCategoryName" type="text"
                  [placeholder]="'adminPanel.categoryPlaceholder' | t"
                  class="flex-1 px-4 py-3 bg-surface border border-outline-variant rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-amber-300/40 transition-all"
                  (keydown.enter)="createCategory()" />
                <button (click)="createCategory()" [disabled]="!newCategoryName.trim() || isCatCreating()"
                  class="px-6 py-3 rounded-lg bg-gradient-to-r from-amber-300 to-amber-400 text-white text-xs font-semibold tracking-widest uppercase disabled:opacity-50 hover:shadow-[0_4px_15px_rgba(251,191,36,0.4)] transition-all">
                  {{ isCatCreating() ? '...' : ('adminPanel.add' | t) }}
                </button>
              </div>
            </div>

            <!-- Category list -->
            <div class="bg-surface-container-lowest/80 backdrop-blur-xl rounded-xl border border-outline-variant/30 shadow-[0_8px_24px_rgba(28,28,23,0.03)] overflow-hidden">
              @if (isCatLoading()) {
                <div class="p-6 space-y-3">
                  @for (i of [1,2,3,4]; track i) {
                    <div class="animate-pulse h-14 bg-surface-container/50 rounded-lg"></div>
                  }
                </div>
              } @else if (categories().length === 0) {
                <div class="p-14 text-center">
                  <span class="material-symbols-outlined text-on-surface-variant/30 text-6xl block mb-3">category</span>
                  <p class="text-on-surface-variant">{{ 'adminPanel.noCategories' | t }}</p>
                </div>
              } @else {
                <ul class="divide-y divide-outline-variant/20">
                  @for (cat of categories(); track cat.id) {
                    <li class="flex items-center gap-3 px-6 py-4 hover:bg-surface-container/30 transition-colors">
                      @if (editingCatId() === cat.id) {
                        <input [(ngModel)]="editingCatName" type="text"
                          class="flex-1 px-4 py-2.5 border border-amber-300/50 rounded-lg text-base bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-amber-300/40 transition-all"
                          (keydown.enter)="saveCatEdit(cat)" (keydown.escape)="cancelCatEdit()" />
                        <button (click)="saveCatEdit(cat)"
                          class="px-4 py-2 text-xs font-semibold tracking-widest uppercase text-white bg-gradient-to-r from-amber-300 to-amber-400 rounded-lg hover:shadow-[0_4px_15px_rgba(251,191,36,0.4)] transition-all">
                          {{ 'common.save' | t }}
                        </button>
                        <button (click)="cancelCatEdit()"
                          class="px-4 py-2 text-xs font-semibold tracking-widest uppercase text-on-surface-variant border border-outline-variant rounded-lg hover:bg-surface-container transition-colors">
                          {{ 'common.cancel' | t }}
                        </button>
                      } @else {
                        <span class="material-symbols-outlined text-amber-300/60 mr-1" style="font-size:18px">label</span>
                        <span class="flex-1 text-base font-medium text-on-surface">{{ cat.name }}</span>
                        <button (click)="startCatEdit(cat)"
                          class="p-2 rounded-lg text-on-surface-variant hover:text-secondary hover:bg-surface-container transition-all">
                          <span class="material-symbols-outlined" style="font-size:18px">edit</span>
                        </button>
                        <button (click)="deleteCategory(cat)"
                          class="p-2 rounded-lg text-on-surface-variant hover:text-error hover:bg-red-50/50 transition-all">
                          <span class="material-symbols-outlined" style="font-size:18px">delete</span>
                        </button>
                      }
                    </li>
                  }
                </ul>
              }
            </div>
          </div>
        }

        <!-- ═══════════════════════════════════════════════
             TAB: EVENTS
        ═══════════════════════════════════════════════ -->
        @if (activeTab() === 'events') {
          <div class="space-y-5">
            <!-- Section header -->
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-light text-on-surface tracking-tight">{{ 'adminPanel.eventsTitle' | t }}</h2>
                @if (eventsPage()) {
                  <p class="text-sm text-on-surface-variant mt-0.5">{{ eventsPage()!.totalElements }} {{ 'adminPanel.eventsCount' | t }}</p>
                }
              </div>
              <a routerLink="/events/create"
                class="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-300 to-amber-400 text-white text-[11px] font-semibold tracking-widest uppercase hover:shadow-[0_4px_15px_rgba(251,191,36,0.4)] transition-all">
                <span class="material-symbols-outlined" style="font-size:16px">add</span>
                {{ 'adminPanel.createEvent' | t }}
              </a>
            </div>

            <div class="bg-surface-container-lowest/80 backdrop-blur-xl rounded-xl border border-outline-variant/30 shadow-[0_8px_24px_rgba(28,28,23,0.03)] overflow-hidden">
              @if (isEventsLoading()) {
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
                        <th class="px-6 py-4 text-left text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant">{{ 'adminPanel.colTitle' | t }}</th>
                        <th class="px-6 py-4 text-left text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant">{{ 'adminPanel.colOwner' | t }}</th>
                        <th class="px-6 py-4 text-left text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant">{{ 'adminPanel.colCategory' | t }}</th>
                        <th class="px-6 py-4 text-left text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant">{{ 'adminPanel.colCity' | t }}</th>
                        <th class="px-6 py-4 text-left text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant">{{ 'adminPanel.colStatus' | t }}</th>
                        <th class="px-3 py-4 text-left text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant">{{ 'adminPanel.colAttendees' | t }}</th>
                        <th class="px-3 py-4 text-left text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant">{{ 'adminPanel.colDate' | t }}</th>
                        <th class="px-3 py-4"></th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-outline-variant/20">
                      @for (event of eventsPage()?.content; track event.id) {
                        <tr class="hover:bg-surface-container/40 transition-colors">
                          <!-- Title -->
                          <td class="px-6 py-4">
                            <a [routerLink]="['/events', event.id]"
                               class="text-base font-medium text-on-surface hover:text-amber-500 transition-colors line-clamp-1 max-w-[200px] block">
                              {{ event.title }}
                            </a>
                          </td>
                          <!-- Owner with tooltip -->
                          <td class="px-6 py-4">
                            <span class="relative group/tip">
                              <span class="inline-flex items-center gap-1.5 text-sm text-on-surface-variant cursor-default">
                                <span class="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center text-[10px] font-bold text-on-surface-variant border border-outline-variant/30">
                                  {{ event.ownerEmail[0].toUpperCase() }}
                                </span>
                                <span class="max-w-[120px] truncate">{{ event.ownerEmail }}</span>
                              </span>
                              <span class="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg bg-inverse-surface text-inverse-on-surface text-xs font-medium whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 shadow-lg z-50 select-none">
                                ID #{{ event.ownerId }} · {{ event.ownerEmail }}
                                <span class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-inverse-surface"></span>
                              </span>
                            </span>
                          </td>
                          <!-- Category -->
                          <td class="px-6 py-4">
                            <span class="inline-block px-2.5 py-1 text-[10px] font-semibold tracking-widest uppercase rounded-full bg-amber-50 text-amber-600 border border-amber-200/60 whitespace-nowrap" [title]="event.category ? (event.category.name | categoryName) : ''">
                              {{ event.category ? (event.category.name | categoryName) : '—' }}
                            </span>
                          </td>
                          <!-- City -->
                          <td class="px-6 py-4 text-sm text-on-surface-variant">{{ event.city }}</td>
                          <!-- Status -->
                          <td class="px-6 py-4">
                            <span class="px-2.5 py-1 text-[10px] font-semibold tracking-widest uppercase rounded-full" [class]="statusBadge(event.status)">
                              {{ event.status }}
                            </span>
                          </td>
                          <!-- Attendees -->
                          <td class="px-3 py-4 text-sm text-on-surface-variant whitespace-nowrap">
                            <span class="font-medium text-on-surface">{{ event.currentAttendees }}</span> / {{ event.capacity }}
                          </td>
                          <!-- Start Date -->
                          <td class="px-3 py-4 text-sm text-on-surface-variant whitespace-nowrap">{{ event.startDate | date:'d MMM yy' }}</td>
                          <!-- Actions -->
                          <td class="px-3 py-4 text-right">
                            <div class="flex items-center gap-2 justify-end">
                              <a [routerLink]="['/events', event.id, 'edit']"
                                class="p-1.5 rounded-lg text-on-surface-variant hover:text-secondary hover:bg-surface-container transition-all">
                                <span class="material-symbols-outlined" style="font-size:16px">edit</span>
                              </a>
                              <button (click)="deleteEvent(event)"
                                class="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-red-50/50 transition-all">
                                <span class="material-symbols-outlined" style="font-size:16px">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>

                @if (eventsPage()) {
                  <div class="px-6 py-4 border-t border-outline-variant/20">
                    <app-pagination [pageData]="eventsPage()!" (pageChange)="onEventPageChange($event)" />
                  </div>
                }
              }
            </div>
          </div>
        }

        <!-- ═══════════════════════════════════════════════
             TAB: USERS
        ═══════════════════════════════════════════════ -->
        @if (activeTab() === 'users') {
          <div class="space-y-5">
            <!-- Section header -->
            <div>
              <h2 class="text-2xl font-light text-on-surface tracking-tight">{{ 'adminPanel.usersTitle' | t }}</h2>
              @if (usersPage()) {
                <p class="text-sm text-on-surface-variant mt-0.5">{{ usersPage()!.totalElements }} {{ 'adminUsers.totalMembers' | t }}</p>
              }
            </div>

            <div class="bg-surface-container-lowest/80 backdrop-blur-xl rounded-xl border border-outline-variant/30 shadow-[0_8px_24px_rgba(28,28,23,0.03)] overflow-hidden">
              @if (isUsersLoading()) {
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
                              class="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-red-50/50 transition-all ml-auto flex">
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
                    <app-pagination [pageData]="usersPage()!" (pageChange)="onUserPageChange($event)" />
                  </div>
                }
              }
            </div>
          </div>
        }

      </div>
    </div>
  `
})
export class AdminPanelComponent implements OnInit {
  private readonly userService    = inject(UserService);
  private readonly eventService   = inject(EventService);
  private readonly categoryService = inject(CategoryService);
  private readonly toast           = inject(ErrorToastService);
  readonly i18n                    = inject(I18nService);

  // ── Tab state ───────────────────────────────────────────
  readonly activeTab = signal<AdminTab>('categories');

  readonly tabs: { id: AdminTab; label: string; icon: string }[] = [
    { id: 'categories', label: 'adminPanel.tabCategories', icon: 'category' },
    { id: 'events',     label: 'adminPanel.tabEvents',     icon: 'event'    },
    { id: 'users',      label: 'adminPanel.tabUsers',      icon: 'group'    },
  ];

  // ── Categories ──────────────────────────────────────────
  readonly categories    = signal<CategoryDto[]>([]);
  readonly isCatLoading  = signal(true);
  readonly isCatCreating = signal(false);
  readonly editingCatId  = signal<number | null>(null);
  newCategoryName = '';
  editingCatName  = '';

  // ── Events ───────────────────────────────────────────────
  readonly eventsPage      = signal<Page<EventResponseDto> | null>(null);
  readonly isEventsLoading = signal(true);

  // ── Users ────────────────────────────────────────────────
  readonly usersPage      = signal<Page<UserResponseDto> | null>(null);
  readonly isUsersLoading = signal(true);

  // ── Lifecycle ────────────────────────────────────────────
  ngOnInit(): void {
    this.loadCategories();
    this.loadEvents(0);
    this.loadUsers(0);
  }

  // ── Category logic ──────────────────────────────────────
  private loadCategories(): void {
    this.isCatLoading.set(true);
    this.categoryService.getAll().subscribe({
      next: cats => { this.categories.set(cats); this.isCatLoading.set(false); },
      error: () => this.isCatLoading.set(false)
    });
  }

  createCategory(): void {
    if (!this.newCategoryName.trim()) return;
    this.isCatCreating.set(true);
    this.categoryService.create({ name: this.newCategoryName.trim() }).subscribe({
      next: cat => {
        this.categories.update(list => [...list, cat]);
        this.newCategoryName = '';
        this.isCatCreating.set(false);
        this.toast.show(this.i18n.locale() === 'tr' ? 'Kategori eklendi.' : 'Category added.', 'success');
      },
      error: () => this.isCatCreating.set(false)
    });
  }

  startCatEdit(cat: CategoryDto): void { this.editingCatId.set(cat.id!); this.editingCatName = cat.name; }
  cancelCatEdit(): void { this.editingCatId.set(null); this.editingCatName = ''; }

  saveCatEdit(cat: CategoryDto): void {
    if (!this.editingCatName.trim()) return;
    this.categoryService.update(cat.id!, { name: this.editingCatName.trim() }).subscribe({
      next: updated => {
        this.categories.update(list => list.map(c => c.id === updated.id ? updated : c));
        this.cancelCatEdit();
        this.toast.show(this.i18n.t('categoryManage.updateSuccess'), 'success');
      }
    });
  }

  deleteCategory(cat: CategoryDto): void {
    const msg = this.i18n.locale() === 'tr'
      ? `"${cat.name}" kategorisini silmek istiyor musunuz? Bu işlem geri alınamaz.`
      : `Delete category "${cat.name}"? This cannot be undone.`;
    this.toast.confirm(msg).then(ok => {
      if (!ok) return;
      this.categoryService.delete(cat.id!).subscribe({
        next: () => {
          this.categories.update(list => list.filter(c => c.id !== cat.id));
          this.toast.show(this.i18n.t('categoryManage.deleteSuccess'), 'success');
        }
      });
    });
  }

  // ── Event logic ──────────────────────────────────────────
  private loadEvents(page: number): void {
    this.isEventsLoading.set(true);
    this.eventService.getAll(page, 15).subscribe({
      next: data => { this.eventsPage.set(data); this.isEventsLoading.set(false); },
      error: () => this.isEventsLoading.set(false)
    });
  }

  onEventPageChange(page: number): void { this.loadEvents(page); }

  statusBadge(status: string): string {
    const map: Record<string, string> = {
      UPCOMING:  'bg-blue-50 text-blue-700 border border-blue-200/60',
      ONGOING:   'bg-green-50 text-green-700 border border-green-200/60',
      COMPLETED: 'bg-surface-container text-on-surface-variant border border-outline-variant/30',
      CANCELLED: 'bg-red-50 text-red-700 border border-red-200/60',
    };
    return map[status] ?? 'bg-surface-container text-on-surface-variant';
  }

  deleteEvent(event: EventResponseDto): void {
    const msg = this.i18n.locale() === 'tr'
      ? `"${event.title}" etkinliğini kalıcı olarak silmek istiyor musunuz?`
      : `Permanently delete "${event.title}"? This cannot be undone.`;
    this.toast.confirm(msg).then(ok => {
      if (!ok) return;
      this.eventService.delete(event.id).subscribe({
        next: () => {
          this.toast.show(
            this.i18n.locale() === 'tr' ? 'Etkinlik silindi.' : 'Event deleted.',
            'success'
          );
          const page = this.eventsPage()?.number ?? 0;
          this.loadEvents(page);
        }
      });
    });
  }

  // ── User logic ───────────────────────────────────────────
  private loadUsers(page: number): void {
    this.isUsersLoading.set(true);
    this.userService.getAll(page).subscribe({
      next: data => { this.usersPage.set(data); this.isUsersLoading.set(false); },
      error: () => this.isUsersLoading.set(false)
    });
  }

  onUserPageChange(page: number): void { this.loadUsers(page); }

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


