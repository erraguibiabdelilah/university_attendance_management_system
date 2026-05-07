// angular import
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Project import
import { AdminComponent } from './theme/layouts/admin-layout/admin-layout.component';
import { GuestLayoutComponent } from './theme/layouts/guest-layout/guest-layout.component';
import { Projects } from './view/projects/listeOfProject/projects';
import { Entitys } from './view/entitys/listEntitys/entitys/entitys';
import { authGuard } from './security/guards/auth.guard';
import { adminGuard } from './security/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    canActivate: [authGuard],
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
        path: 'projects',
        component: Projects
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
        path: 'attendance/create',
        loadComponent: () => import('./pages/attendance/create-absence/create-absence.page').then((c) => c.CreateAbsencePage)
      },
      {
        path: 'attendance/mark',
        loadComponent: () => import('./pages/attendance/mark-attendance/mark-attendance.page').then((c) => c.MarkAttendancePage)
      },
      {
        path: 'attendance/history',
        loadComponent: () => import('./pages/attendance/teacher-absence-history/teacher-absence-history.page').then((c) => c.TeacherAbsenceHistoryPage)
      },
      {
        path: 'attendance/student-stats',
        loadComponent: () => import('./pages/attendance/student-statistics/student-statistics.page').then((c) => c.StudentStatisticsPage)
      },
      {
        path: 'admin/manage-users',
        canActivate: [adminGuard],
        loadComponent: () => import('./demo/admin/manage-users/manage-users.component').then((c) => c.ManageUsersComponent)
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
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
