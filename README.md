# EMS-NG (Event Management System - Frontend)

EMS-NG, **Angular tabanlı bir etkinlik yönetim sistemi frontend uygulamasıdır**.  
Bu proje, özellikle **ayrı bir backend servisi ile entegre çalışacak şekilde** geliştirilmiştir ve kimlik doğrulama, yetkilendirme, etkinlik yönetimi, kategori yönetimi ve katılım akışlarını backend API üzerinden yürütür.

## Proje Amacı

Bu uygulamanın temel amacı:

- Kullanıcıların etkinlikleri listeleyip görüntüleyebilmesi
- Doğrulanmış kullanıcıların etkinlik oluşturup düzenleyebilmesi
- Katılım süreçlerinin yönetilebilmesi
- Admin tarafında kullanıcı/kategori yönetiminin yapılabilmesi
- Tüm bu akışların **backend tabanlı REST API** ile uçtan uca entegre şekilde çalışması

## Backend Entegrasyonu

Bu frontend, aşağıdaki backend odaklı yapılarla çalışır:

- JWT tabanlı kimlik doğrulama
- Route guard’lar ile rol/doğrulama kontrolü (`auth`, `role`, `verified`)
- HTTP interceptor ile token ekleme ve global hata yönetimi
- Backend’den gelen DTO/model yapılarıyla tip güvenli veri akışı
- E-posta doğrulama ve kullanıcı oturum akışları

> Not: Bu repository frontend içindir. Projenin asıl iş kuralları ve veri yönetimi backend API tarafında çalışır.

## Teknolojiler

- Angular
- TypeScript
- RxJS
- Angular Router
- HTTP Client + Interceptor
- Guard yapısı
- Pipe ve shared component mimarisi

## Özellikler

- Giriş / Kayıt / E-posta doğrulama
- Etkinlik listeleme, detay, oluşturma, düzenleme
- Kategori yönetimi
- Katılım yönetimi
- Profil ve admin kullanıcı ekranları
- i18n (TR / EN)
- Hata bildirim toast yapısı

## Proje Yapısı (Özet)

- `src/app/core`: servisler, interceptor, guard, modeller
- `src/app/features`: işlevsel modüller (auth, events, categories, users, vb.)
- `src/app/shared`: ortak component ve pipe yapıları
- `public/i18n`: dil dosyaları

## Kurulum

```bash
npm install


# EmsNg

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.1.0.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
