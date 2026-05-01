import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type Locale = 'tr' | 'en';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly http = inject(HttpClient);

  private readonly _locale = signal<Locale>('tr');
  private readonly _translations = signal<Record<string, string>>({});
  private readonly cache = new Map<Locale, Record<string, string>>();

  readonly locale = this._locale.asReadonly();

  /** APP_INITIALIZER tarafından çağrılır — varsayılan dili yükler */
  init(): Promise<void> {
    const saved = localStorage.getItem('lang') as Locale | null;
    const lang: Locale = saved === 'en' ? 'en' : 'tr';
    this._locale.set(lang);
    return this.loadLang(lang);
  }

  setLocale(lang: Locale): void {
    if (lang === this._locale()) return;
    this._locale.set(lang);
    localStorage.setItem('lang', lang);
    if (this.cache.has(lang)) {
      this._translations.set(this.cache.get(lang)!);
    } else {
      this.loadLang(lang);
    }
  }

  t(key: string): string {
    return this._translations()[key] ?? key;
  }

  private loadLang(lang: Locale): Promise<void> {
    if (this.cache.has(lang)) {
      this._translations.set(this.cache.get(lang)!);
      return Promise.resolve();
    }
    return new Promise(resolve => {
      this.http.get<Record<string, string>>(`/i18n/${lang}.json`).subscribe({
        next: t => { this.cache.set(lang, t); this._translations.set(t); resolve(); },
        error: () => resolve()
      });
    });
  }
}

