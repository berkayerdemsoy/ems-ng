import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ErrorToastComponent } from './shared/components/error-toast/error-toast.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ErrorToastComponent],
  template: `
    <!-- Ambient Light Leaks -->
    <div class="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      <div class="light-leak w-[50vw] h-[50vw] top-[-10%] right-[-10%] bg-[rgba(255,185,80,0.18)]"></div>
      <div class="light-leak w-[40vw] h-[40vw] bottom-[-10%] left-[-10%] bg-[rgba(203,198,190,0.25)]"></div>
    </div>
    <app-navbar />
    <main class="relative z-10 min-h-screen bg-background text-on-background font-[Space_Grotesk]">
      <router-outlet />
    </main>
    <app-error-toast />
  `
})
export class App {}
