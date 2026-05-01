import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { ErrorToastService } from '../../../shared/components/error-toast/error-toast.service';
import { I18nService } from '../../../core/services/i18n.service';
import { CategoryDto } from '../../../core/models';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-category-manage',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  template: `
    <div class="min-h-screen pt-28 pb-24 px-[max(24px,5vw)] relative">
      <div class="absolute top-32 left-1/3 w-80 h-80 bg-secondary-container/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <div class="max-w-2xl mx-auto">
        <div class="mb-10">
          <span class="text-[11px] font-semibold tracking-[0.15em] uppercase text-on-surface-variant px-4 py-1 rounded-full glass-panel inline-block mb-4">{{ 'adminUsers.badge' | t }}</span>
          <h1 class="text-[48px] leading-[1.2] tracking-[-0.02em] font-light text-on-surface">{{ 'dashboard.categoriesNav' | t }}</h1>
          <p class="text-base text-on-surface-variant mt-2">{{ i18n.locale() === 'tr' ? 'Platform genelinde etkinlik kategorilerini yönetin.' : 'Manage event categories across the platform.' }}</p>
        </div>

        <!-- Create Form -->
        <div class="bg-surface-container-lowest/80 backdrop-blur-xl rounded-xl p-6 border border-outline-variant/30 shadow-[0_20px_40px_rgba(28,28,23,0.03)] mb-6">
          <h2 class="text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mb-4">
            {{ i18n.locale() === 'tr' ? 'Yeni Kategori' : 'New Category' }}
          </h2>
          <div class="flex gap-3">
            <input [(ngModel)]="newCategoryName" type="text"
              [placeholder]="i18n.locale() === 'tr' ? 'Kategori adı' : 'Category name'"
              class="flex-1 px-4 py-3 bg-surface border border-outline-variant rounded-lg text-base text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all"
              (keydown.enter)="createCategory()" />
            <button (click)="createCategory()" [disabled]="!newCategoryName.trim() || isCreating()"
              class="px-6 py-3 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-semibold tracking-widest uppercase disabled:opacity-50 hover:shadow-[0_4px_15px_rgba(245,158,11,0.4)] transition-all">
              {{ isCreating() ? '...' : (i18n.locale() === 'tr' ? 'Ekle' : 'Add') }}
            </button>
          </div>
        </div>

        <!-- Category List -->
        <div class="bg-surface-container-lowest/80 backdrop-blur-xl rounded-xl border border-outline-variant/30 shadow-[0_20px_40px_rgba(28,28,23,0.03)] overflow-hidden">
          @if (isLoading()) {
            <div class="p-6 space-y-3">
              @for (i of [1,2,3]; track i) {
                <div class="animate-pulse h-14 bg-surface-container/50 rounded-lg"></div>
              }
            </div>
          } @else if (categories().length === 0) {
            <div class="p-12 text-center">
              <span class="material-symbols-outlined text-on-surface-variant/40 text-5xl block mb-3">category</span>
              <p class="text-base text-on-surface-variant">{{ i18n.locale() === 'tr' ? 'Henüz kategori yok.' : 'No categories yet.' }}</p>
            </div>
          } @else {
            <ul class="divide-y divide-outline-variant/20">
              @for (cat of categories(); track cat.id) {
                <li class="flex items-center gap-3 px-6 py-4">
                  @if (editingId() === cat.id) {
                    <input [(ngModel)]="editingName" type="text"
                      class="flex-1 px-4 py-2.5 border border-secondary-container/50 rounded-lg text-base bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all"
                      (keydown.enter)="saveEdit(cat)" (keydown.escape)="cancelEdit()" />
                    <button (click)="saveEdit(cat)"
                      class="px-4 py-2 text-xs font-semibold tracking-widest uppercase text-white bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg hover:shadow-[0_4px_15px_rgba(245,158,11,0.4)] transition-all">
                      {{ 'common.save' | t }}
                    </button>
                    <button (click)="cancelEdit()"
                      class="px-4 py-2 text-xs font-semibold tracking-widest uppercase text-on-surface-variant border border-outline-variant rounded-lg hover:bg-surface-container transition-colors">
                      {{ 'common.cancel' | t }}
                    </button>
                  } @else {
                    <span class="material-symbols-outlined text-on-surface-variant/40 mr-1" style="font-size:18px">label</span>
                    <span class="flex-1 text-base font-medium text-on-surface">{{ cat.name }}</span>
                    <button (click)="startEdit(cat)"
                      class="text-xs font-semibold tracking-widest uppercase text-on-surface-variant hover:text-secondary transition-colors flex items-center gap-1">
                      <span class="material-symbols-outlined" style="font-size:16px">edit</span>
                    </button>
                    <button (click)="deleteCategory(cat)"
                      class="text-xs font-semibold tracking-widest uppercase text-on-surface-variant hover:text-error transition-colors flex items-center gap-1 ml-1">
                      <span class="material-symbols-outlined" style="font-size:16px">delete</span>
                    </button>
                  }
                </li>
              }
            </ul>
          }
        </div>
      </div>
    </div>
  `
})
export class CategoryManageComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly toast = inject(ErrorToastService);
  readonly i18n = inject(I18nService);

  readonly categories = signal<CategoryDto[]>([]);
  readonly isLoading = signal(true);
  readonly isCreating = signal(false);
  readonly editingId = signal<number | null>(null);

  newCategoryName = '';
  editingName = '';

  ngOnInit(): void { this.loadCategories(); }

  private loadCategories(): void {
    this.isLoading.set(true);
    this.categoryService.getAll().subscribe({
      next: cats => { this.categories.set(cats); this.isLoading.set(false); },
      error: () => this.isLoading.set(false)
    });
  }

  createCategory(): void {
    if (!this.newCategoryName.trim()) return;
    this.isCreating.set(true);
    this.categoryService.create({ name: this.newCategoryName.trim() }).subscribe({
      next: cat => {
        this.categories.update(list => [...list, cat]);
        this.newCategoryName = '';
        this.isCreating.set(false);
        this.toast.show(this.i18n.locale() === 'tr' ? 'Kategori eklendi.' : 'Category added.', 'success');
      },
      error: () => this.isCreating.set(false)
    });
  }

  startEdit(cat: CategoryDto): void { this.editingId.set(cat.id!); this.editingName = cat.name; }
  cancelEdit(): void { this.editingId.set(null); this.editingName = ''; }

  saveEdit(cat: CategoryDto): void {
    if (!this.editingName.trim()) return;
    this.categoryService.update(cat.id!, { name: this.editingName.trim() }).subscribe({
      next: updated => {
        this.categories.update(list => list.map(c => c.id === updated.id ? updated : c));
        this.cancelEdit();
        this.toast.show(this.i18n.t('categoryManage.updateSuccess'), 'success');
      }
    });
  }

  deleteCategory(cat: CategoryDto): void {
    const confirmMsg = this.i18n.locale() === 'tr'
      ? `"${cat.name}" kategorisini silmek istiyor musunuz? Bu işlem geri alınamaz.`
      : `Delete category "${cat.name}"? This cannot be undone.`;
    this.toast.confirm(confirmMsg).then(ok => {
      if (!ok) return;
      this.categoryService.delete(cat.id!).subscribe({
        next: () => {
          this.categories.update(list => list.filter(c => c.id !== cat.id));
          this.toast.show(this.i18n.t('categoryManage.deleteSuccess'), 'success');
        }
      });
    });
  }
}
