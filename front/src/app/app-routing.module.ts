// angular import
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Project import
import { AdminComponent } from './theme/layouts/admin-layout/admin-layout.component';
import { GuestLayoutComponent } from './theme/layouts/guest-layout/guest-layout.component';
import { Entitys } from './view/entitys/listEntitys/entitys/entitys';
import { Users } from './view/users/users/users';
import { AbsenceComponent } from './view/absence/absence.component';


const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./demo/dashboard/default/default.component').then((c) => c.DefaultComponent)
      },

      {
        path: 'users',
        component: Users
      },

      {
        path: 'entities',
        component: Entitys
      },

      {
        path: 'attributes',
        component: Entitys
      },
      {
        path: 'attendance-management',
        component: AbsenceComponent
      }
    ]
  },
  {
    path: '',
    component: GuestLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./security/authentication/auth-login/auth-login.component').then((c) => c.AuthLoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./security/authentication/auth-register/auth-register.component').then((c) => c.AuthRegisterComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
