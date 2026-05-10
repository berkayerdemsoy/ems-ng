import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18nService } from '../../core/services/i18n.service';

/**
 * Kategori adını mevcut dile çevirir.
 * JSON'da "category.{name}" anahtarı varsa çeviriyi döner,
 * yoksa orijinal adı fallback olarak gösterir.
 *
 * Kullanım: {{ event.category.name | categoryName }}
 */
@Pipe({ name: 'categoryName', pure: false, standalone: true })
export class CategoryNamePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);

  transform(name: string | null | undefined): string {
    if (!name) return '—';
    const key = 'category.' + name;
    const translated = this.i18n.t(key);
    // i18n.t() anahtarı bulamazsa anahtarın kendisini döner → fallback olarak orijinal adı kullan
    return translated === key ? name : translated;
  }
}

