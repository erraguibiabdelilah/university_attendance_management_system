import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminComponent } from './theme/layouts/admin-layout/admin-layout.component';
import { GuestLayoutComponent } from './theme/layouts/guest-layout/guest-layout.component';
import { Users } from './view/users/users/users';
import { AbsenceComponent } from './view/absence/absence';
import { AbsenceList } from './view/absence-list/absence-list';
import { JustificationsComponent } from './view/justifications/justifications.component';

import { authGuard } from './security/guards/auth.guard';
import { adminGuard } from './security/guards/admin.guard';
import { teacherOnlyGuard } from './security/guards/teacher-only.guard';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        canActivate: [authGuard],
        loadComponent: () => import('./demo/dashboard/default/default.component').then((c) => c.DefaultComponent)
      },
      { path: 'users', canActivate: [adminGuard], component: Users },
      { path: 'attendance', canActivate: [teacherOnlyGuard], component: AbsenceComponent },
      { path: 'list/attendance', canActivate: [adminGuard], component: AbsenceList },
      { path: 'justifications', canActivate: [adminGuard], component: JustificationsComponent }
    ]
  },
  {
    path: '',
    component: GuestLayoutComponent,
    children: [
      { path: 'login', loadComponent: () => import('./security/authentication/auth-login/auth-login.component').then((c) => c.AuthLoginComponent) },
      { path: 'register', loadComponent: () => import('./security/authentication/auth-register/auth-register.component').then((c) => c.AuthRegisterComponent) }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
