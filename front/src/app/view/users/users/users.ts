import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../../shared/services/auth';
import { User } from '../../../shared/models/user';

// ── Types locaux ──────────────────────────────────────────
interface RoleFilter {
  value: string;
  label: string;
}

interface RoleOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.scss'
})
export class Users implements OnInit, OnDestroy {

  // ─────────────────────────────────────────────
  // Données
  // ─────────────────────────────────────────────
  users: User[] = [];
  isLoading = false;

  // ─────────────────────────────────────────────
  // Filtres
  // ─────────────────────────────────────────────
  filterRole = 'ALL';

  roleFilters: RoleFilter[] = [
    { value: 'ALL',     label: 'Tous'        },
    { value: 'ADMIN',   label: 'Admin'       },
    { value: 'TEACHER', label: 'Enseignant'  },
    { value: 'STUDENT', label: 'Étudiant'    }
  ];

  get filteredUsers(): User[] {
    return this.filterRole === 'ALL'
      ? this.users
      : this.users.filter(u => u.role === this.filterRole);
  }

  countByRole(role: string): number {
    return role === 'ALL'
      ? this.users.length
      : this.users.filter(u => u.role === role).length;
  }

  setFilter(role: string): void {
    this.filterRole = role;
  }

  // ─────────────────────────────────────────────
  // Modal add/edit
  // ─────────────────────────────────────────────
  showModal   = false;
  isEdit      = false;
  isSaving    = false;
  selectedRole = 'STUDENT';

  formUser: User = this.emptyUser();

  roleOptions: RoleOption[] = [
    { value: 'STUDENT', label: 'Étudiant'   },
    { value: 'TEACHER', label: 'Enseignant' },
    { value: 'ADMIN',   label: 'Admin'      }
  ];

  filieres   = ['IRISI', 'SIT', 'GI', 'GC'];
  promoYears = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'];

  // ─────────────────────────────────────────────
  // Modal suppression
  // ─────────────────────────────────────────────
  showDeleteModal = false;
  userToDelete: User | null = null;

  // ─────────────────────────────────────────────
  // Toast
  // ─────────────────────────────────────────────
  showToast    = false;
  toastMessage = '';
  toastSub     = '';

  // ─────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────
  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─────────────────────────────────────────────
  // Chargement
  // ─────────────────────────────────────────────
  private loadUsers(): void {
    this.isLoading = true;
    this.authService.gitAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: User[]) => {
          this.users    = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('loadUsers', err);
          this.isLoading = false;
        }
      });
  }

  // ─────────────────────────────────────────────
  // Modal add/edit
  // ─────────────────────────────────────────────
  openModal(): void {
    this.isEdit      = false;
    this.formUser    = this.emptyUser();
    this.selectedRole = 'STUDENT';
    this.showModal   = true;
  }

  openEditModal(user: User): void {
    this.isEdit       = true;
    this.formUser     = { ...user, password: '' };
    this.selectedRole = user.role ?? 'STUDENT';
    this.showModal    = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  handleBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop-custom')) {
      this.closeModal();
    }
  }

  // ─────────────────────────────────────────────
  // Onglets rôle dans la modal
  // ─────────────────────────────────────────────
  onRoleTabChange(role: string): void {
    this.selectedRole    = role;
    this.formUser.role   = role;
    // Réinitialiser les champs liés au rôle précédent
    this.formUser.cne        = '';
    this.formUser.filier     = '';
    this.formUser.promo      = '';
    this.formUser.imatricule = '';
    this.formUser.departemnt = '';
  }

  getRoleTabClass(role: string): string {
    if (this.selectedRole !== role) return '';
    return { STUDENT: 'active-student', TEACHER: 'active-teacher', ADMIN: 'active-admin' }[role] ?? '';
  }

  // ─────────────────────────────────────────────
  // Validation
  // ─────────────────────────────────────────────
  isFormValid(): boolean {
    const f = this.formUser;
    const base = !!(f.firstName?.trim() && f.lastName?.trim() && f.username?.trim() && f.cni?.trim());
    if (!base) return false;
    if (!this.isEdit && !f.password?.trim()) return false;

    if (this.selectedRole === 'STUDENT') {
      return !!(f.cne?.trim() && f.filier?.trim() && f.promo?.trim());
    } else {
      return !!(f.imatricule?.trim() && f.departemnt?.trim());
    }
  }

  // ─────────────────────────────────────────────
  // Enregistrer (create / update)
  // ─────────────────────────────────────────────
  onSave(): void {
    if (!this.isFormValid()) return;
    this.isSaving = true;

    this.formUser.role = this.selectedRole;
    this.authService.item = { ...this.formUser };

    const action$ = this.isEdit
      ? this.authService.update()
      : this.authService.register();

    action$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSaving  = false;
          this.showModal = false;
          this.loadUsers();
          this.triggerToast(
            this.isEdit ? 'Utilisateur modifié avec succès' : 'Utilisateur créé avec succès',
            `${this.formUser.firstName} ${this.formUser.lastName}`
          );
        },
        error: (err) => {
          console.error('onSave', err);
          this.isSaving = false;
        }
      });
  }

  // ─────────────────────────────────────────────
  // Suppression
  // ─────────────────────────────────────────────
  confirmDelete(user: User): void {
    this.userToDelete    = user;
    this.showDeleteModal = true;
  }

  handleDeleteBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop-custom')) {
      this.showDeleteModal = false;
    }
  }

  deleteConfirmed(): void {
    if (!this.userToDelete?.id) return;

    this.authService.delete(this.userToDelete.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== this.userToDelete!.id);
          this.triggerToast(
            'Utilisateur supprimé',
            `${this.userToDelete!.firstName} ${this.userToDelete!.lastName}`
          );
          this.userToDelete    = null;
          this.showDeleteModal = false;
        },
        error: (err) => console.error('deleteConfirmed', err)
      });
  }

  // ─────────────────────────────────────────────
  // Badges & classes
  // ─────────────────────────────────────────────
  getRoleClass(role: string): string {
    return { STUDENT: 'role-student', TEACHER: 'role-teacher', ADMIN: 'role-admin' }[role] ?? 'role-student';
  }

  getRoleLabel(role: string): string {
    return { STUDENT: 'Étudiant', TEACHER: 'Enseignant', ADMIN: 'Admin' }[role] ?? role;
  }

  // ─────────────────────────────────────────────
  // Toast
  // ─────────────────────────────────────────────
  private triggerToast(message: string, sub = ''): void {
    this.toastMessage = message;
    this.toastSub     = sub;
    this.showToast    = true;
    setTimeout(() => (this.showToast = false), 3500);
  }

  // ─────────────────────────────────────────────
  // Helper
  // ─────────────────────────────────────────────
  private emptyUser(): User {
    return {
      firstName: '',
      lastName:  '',
      username:  '',
      password:  '',
      cni:       '',
      role:      'STUDENT',
      cne:       '',
      filier:    '',
      promo:     '',
      imatricule: '',
      departemnt: '',
      accountNonExpired : false,
      accountNonLocked : false,
      credentialsNonExpired :false,
      enabled : false,
      encoding:[],
      id: null
    }
  }
}
