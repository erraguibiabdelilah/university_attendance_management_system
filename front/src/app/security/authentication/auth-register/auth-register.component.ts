// Angular import
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../shared/services/auth';
import { User } from '../../../shared/models/user';
import { AsyncLocalStorage } from 'node:async_hooks';
import { log } from '@angular-devkit/build-angular/src/builders/ssr-dev-server';

@Component({
  selector: 'app-auth-register',
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './auth-register.component.html',
  styleUrl: './auth-register.component.scss'
})
export class AuthRegisterComponent {
  service = inject(AuthService);
  router=inject(Router);
  private connectedUser: User = new User();

  registerForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  });

  public register() {
    this.initialiseItem();
    this.service.register().subscribe({
      next: (data) => {(this.connectedUser = data);
        data.password='';
        console.log(JSON.stringify(data));
        localStorage.setItem('user', JSON.stringify(data));

        //login apres la creation de compte pour retourner le token sans necesite de faire le login une autre fois
       this.login();

        },
      error: (err) => console.log(err)
    });
  }

  public initialiseItem() {
    this.connectedUser.username=this.registerForm.value.username?? '';
    this.connectedUser.password=this.registerForm.value.password?? '';
    this.connectedUser.authorities=['USER'];
    this.item=this.connectedUser;
    console.log(this.item);
  }

  public login() {
    this.service.login().subscribe({
      next: (data) => {
        localStorage.setItem('token', data);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => console.log('error de login ', err)
    });
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
