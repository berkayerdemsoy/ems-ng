import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { verifiedGuard } from './core/guards/verified.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/events', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'verify-email',
    loadComponent: () => import('./features/verify/verify-email/verify-email.component').then(m => m.VerifyEmailComponent)
  },
  {
    path: 'events',
    loadComponent: () => import('./features/events/event-list/event-list.component').then(m => m.EventListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'events/create',
    loadComponent: () => import('./features/events/event-create/event-create.component').then(m => m.EventCreateComponent),
    canActivate: [authGuard, verifiedGuard, roleGuard(['EVENT_OWNER', 'ADMIN'])]
  },
  {
    path: 'events/:id/edit',
    loadComponent: () => import('./features/events/event-edit/event-edit.component').then(m => m.EventEditComponent),
    canActivate: [authGuard]
  },
  {
    path: 'events/:id',
    loadComponent: () => import('./features/events/event-detail/event-detail.component').then(m => m.EventDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/users/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard, roleGuard(['EVENT_OWNER', 'ADMIN'])]
  },
  {
    path: 'my-participations',
    loadComponent: () => import('./features/participations/my-participations/my-participations.component').then(m => m.MyParticipationsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-panel/admin-panel.component').then(m => m.AdminPanelComponent),
    canActivate: [authGuard, roleGuard(['ADMIN'])]
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./features/users/admin-user-list/admin-user-list.component').then(m => m.AdminUserListComponent),
    canActivate: [authGuard, roleGuard(['ADMIN'])]
  },
  {
    path: 'admin/categories',
    loadComponent: () => import('./features/categories/category-manage/category-manage.component').then(m => m.CategoryManageComponent),
    canActivate: [authGuard, roleGuard(['ADMIN'])]
  },
  { path: '**', redirectTo: '/events' }
];
