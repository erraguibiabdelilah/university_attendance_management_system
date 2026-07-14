// project import
import { Component, inject } from '@angular/core';

import { Router, RouterModule } from '@angular/router';

import { User } from 'src/app/shared/models/user';
import { AuthService } from 'src/app/shared/services/auth';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavigationItems } from '../../../theme/layouts/admin-layout/navigation/navigation';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-auth-login',
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './auth-login.component.html',
  styleUrl: './auth-login.component.scss'
})
export class AuthLoginComponent {
  user: User = new User();
  connectedUser: User = new User();
  authErrorMessage = '';
  isLoggingIn = false;
  readonly currentYear = new Date().getFullYear();

  private service = inject(AuthService);
  private router = inject(Router);

  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  public login(): void {
    this.authErrorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.authErrorMessage = 'Veuillez saisir votre username et votre mot de passe.';
      return;
    }

    this.itemInitialisation();
    this.isLoggingIn = true;
    this.authenticateUser();
  }

  private authenticateUser(): void {
    this.service.login().subscribe({
      next: (token) => {
        localStorage.setItem('token', token);
        this.loadConnectedUser();
      },
      error: (err: HttpErrorResponse) => {
        this.isLoggingIn = false;
        this.authErrorMessage = this.isInvalidCredentialsError(err)
          ? 'Mot de passe incorrect.'
          : 'Connexion impossible. Vérifiez vos informations.';
      }
    });
  }

  private loadConnectedUser(): void {
    this.getUserByUsesrname(this.user.username).subscribe({
      next: (data) => {
        this.connectedUser = data;
        this.connectedUser.password = undefined;
        localStorage.setItem('user', JSON.stringify(this.connectedUser));
        this.adminRoutes(this.connectedUser.role);
        this.isLoggingIn = false;
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.isLoggingIn = false;
        this.authErrorMessage = 'Connexion réussie, mais le profil utilisateur est introuvable.';
      }
    });
  }

  private isUserNotFoundError(err: HttpErrorResponse): boolean {
    return err.status === 404 || this.errorText(err).toLowerCase().includes('non trouvé');
  }

  private isInvalidCredentialsError(err: HttpErrorResponse): boolean {
    const message = this.errorText(err).toLowerCase();
    return err.status === 401 || err.status === 403 || message.includes('incorrect') || message.includes('bad credentials');
  }

  private errorText(err: HttpErrorResponse): string {
    if (typeof err.error === 'string') return err.error;
    return err.error?.message ?? err.message ?? '';
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
