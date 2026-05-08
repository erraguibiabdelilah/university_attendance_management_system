// project import
import { Component, inject } from '@angular/core';

import { Router, RouterModule } from '@angular/router';

import { User } from 'src/app/shared/models/user';
import { AuthService } from 'src/app/shared/services/auth';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavigationItems } from '../../../theme/layouts/admin-layout/navigation/navigation';

@Component({
  selector: 'app-auth-login',
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './auth-login.component.html',
  styleUrl: './auth-login.component.scss'
})
export class AuthLoginComponent {
  user: User = new User();
  connectedUser: User = new User();

  private service = inject(AuthService);
  private router = inject(Router);

  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  public login() {
    this.itemInitialisation();
    this.service.login().subscribe({
      next: (token) => {
        localStorage.setItem('token', token);

        this.getUserByUsesrname(this.user.username).subscribe({
          next: (data) => {
            this.connectedUser = data;
            this.connectedUser.password = undefined;
            localStorage.setItem('user', JSON.stringify(this.connectedUser));
            this.adminRoutes(this.connectedUser.role);
            this.router.navigate(['/dashboard']);
          }
        });
      }
    });
  }

  adminRoutes(role: string) {
    const isAdmin = role === 'ADMIN';

    NavigationItems.forEach((group) => {
      group.children?.forEach((item) => {
        if (item.url === '/users') {
          item.hidden = !isAdmin; // 👈 logique correcte
        }
      });
    });
  }
  public getUserByUsesrname(username: string) {
    return this.service.loadUserByUsername(username);
  }

  itemInitialisation() {
    this.user.username = this.loginForm.value.username ?? '';
    this.user.password = this.loginForm.value.password ?? '';
    this.item = this.user;
    console.log(this.item);
  }

  get item(): User {
    return this.service.item;
  }

  set item(value: User) {
    this.service.item = value;
  }

  get items(): Array<User> {
    return this.service.items;
  }

  set items(value: Array<User>) {
    this.service.items = value;
  }
}
