// project import
import { Component, inject } from '@angular/core';

import { Router, RouterModule } from '@angular/router';

import { User } from 'src/app/shared/models/user';
import { AuthService } from 'src/app/security/services/auth.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

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
  const credentials = this.loginForm.value;

  this.service.login(credentials).subscribe({
    next: (response) => {
      const token = response.token || response;

      localStorage.setItem('token', token);

      this.service.loadUserByUsername(credentials.username!).subscribe({
        next: (user) => {
          user.password = undefined;

          localStorage.setItem('user', JSON.stringify(user));

          this.router.navigate(['/dashboard']);
        },
        error: (err) => console.error('User fetch error', err)
      });
    },
    error: (err) => {
      console.error('Login failed', err);
    }
  });
}
  public getUserByUsesrname(username: string) {
    return this.service.loadUserByUsername(username);
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
