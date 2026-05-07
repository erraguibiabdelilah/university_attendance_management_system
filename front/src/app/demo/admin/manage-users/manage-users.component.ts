import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AdminUserService } from 'src/app/security/services/admin-user.service';
import { User } from 'src/app/shared/models/user';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.scss'
})
export class ManageUsersComponent implements OnInit {
  private readonly adminUserService = inject(AdminUserService);

  users: User[] = [];
  loading = false;
  errorMessage = '';

  userForm = new FormGroup({
    fullName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    role: new FormControl('STUDENT', [Validators.required])
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.adminUserService.findAll().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.resolveHttpError(error);
        this.loading = false;
      }
    });
  }

  createUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const [firstName, ...rest] = (this.userForm.value.fullName ?? '').trim().split(' ');
    const user = new User();
    user.firstName = firstName;
    user.lastName = rest.join(' ');
    user.username = this.userForm.value.email ?? '';
    user.password = this.userForm.value.password ?? '';
    user.authorities = [this.userForm.value.role ?? 'STUDENT'];

    this.adminUserService.create(user).subscribe({
      next: () => {
        this.userForm.reset({ role: 'STUDENT' });
        this.loadUsers();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.resolveHttpError(error);
      }
    });
  }

  deleteUser(id: number): void {
    this.adminUserService.delete(id).subscribe({
      next: () => this.loadUsers(),
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.resolveHttpError(error);
      }
    });
  }

  getPrimaryAuthority(user: User): string {
    const primaryAuthority = user.authorities?.[0];
    if (!primaryAuthority) {
      return '';
    }

    return typeof primaryAuthority === 'string' ? primaryAuthority : primaryAuthority.authority;
  }

  private resolveHttpError(error: HttpErrorResponse): string {
    if (error.status === 401) {
      return 'Unauthorized access. Please login again.';
    }
    if (error.status === 403) {
      return 'Forbidden: only ADMIN users can access this resource.';
    }
    return 'Unable to process request. Please try again.';
  }
}
