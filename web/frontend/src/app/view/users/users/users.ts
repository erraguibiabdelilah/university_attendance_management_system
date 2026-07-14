import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, map, of, Subject, switchMap, takeUntil, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

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

type UserFormField =
  | 'firstName'
  | 'lastName'
  | 'username'
  | 'password'
  | 'cni'
  | 'cne'
  | 'filier'
  | 'promo'
  | 'imatricule'
  | 'departemnt';

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
  formSubmitted = false;
  formErrorMessage = '';
  touchedFields = new Set<UserFormField>();
  selectedFaceFile: File | null = null;
  facePreview: string | null = null;
  faceUploadError = '';

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
    this.resetFormState();
    this.showModal   = true;
  }

  openEditModal(user: User): void {
    this.isEdit       = true;
    this.formUser     = { ...user, password: '' };
    this.selectedRole = user.role ?? 'STUDENT';
    this.resetFormState();
    this.showModal    = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetFormState();
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
    this.formErrorMessage = '';
    this.resetFaceUpload();
    // Réinitialiser les champs liés au rôle précédent
    this.formUser.cne        = '';
    this.formUser.filier     = '';
    this.formUser.promo      = '';
    this.formUser.imatricule = '';
    this.formUser.departemnt = '';
    this.touchedFields.clear();
  }

  getRoleTabClass(role: string): string {
    if (this.selectedRole !== role) return '';
    return { STUDENT: 'active-student', TEACHER: 'active-teacher', ADMIN: 'active-admin' }[role] ?? '';
  }

  // ─────────────────────────────────────────────
  // Validation
  // ─────────────────────────────────────────────
  isFormValid(): boolean {
    return this.getValidationErrors().length === 0;
  }

  markFieldTouched(field: UserFormField): void {
    this.touchedFields.add(field);
  }

  onFieldChange(field: UserFormField): void {
    this.markFieldTouched(field);
    this.formErrorMessage = '';
  }

  isFieldInvalid(field: UserFormField): boolean {
    return (this.formSubmitted || this.touchedFields.has(field)) && !!this.getFieldError(field);
  }

  onFaceSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.selectedFaceFile = null;
    this.facePreview = null;
    this.faceUploadError = '';

    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png'];
    const allowedExtensions = ['jpg', 'jpeg', 'png'];
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    const hasValidType = allowedTypes.includes(file.type);
    const hasValidExtension = allowedExtensions.includes(extension);

    if (!hasValidType || !hasValidExtension) {
      this.faceUploadError = 'Format invalide. Utilisez une image JPG, JPEG ou PNG.';
      input.value = '';
      return;
    }

    this.selectedFaceFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.facePreview = reader.result as string;
    };
    reader.onerror = () => {
      this.selectedFaceFile = null;
      this.facePreview = null;
      this.faceUploadError = 'Impossible de lire l’image sélectionnée.';
    };
    reader.readAsDataURL(file);
  }

  getFieldError(field: UserFormField): string {
    const f = this.formUser;

    if (field === 'firstName') return this.requiredMinMessage(f.firstName, 2, 'Le prénom');
    if (field === 'lastName') return this.requiredMinMessage(f.lastName, 2, 'Le nom');
    if (field === 'username') {
      if (!f.username?.trim()) return 'Le username est obligatoire.';
      if (f.username.trim().length < 3) return 'Le username doit contenir au moins 3 caractères.';
      if (this.isDuplicateUsername()) return 'Un utilisateur avec ce username existe déjà.';
      return '';
    }
    if (field === 'password') {
      if (this.isEdit && !f.password?.trim()) return '';
      if (!f.password?.trim()) return 'Le mot de passe est obligatoire.';
      if (f.password.trim().length < 6) return 'Le mot de passe doit contenir au moins 6 caractères.';
      return '';
    }
    if (field === 'cni') return this.requiredMinMessage(f.cni, 4, 'La CNI');
    if (field === 'cne' && this.selectedRole === 'STUDENT') return this.requiredMinMessage(f.cne, 4, 'Le CNE');
    if (field === 'filier' && this.selectedRole === 'STUDENT' && !f.filier?.trim()) return 'La filière est obligatoire.';
    if (field === 'promo' && this.selectedRole === 'STUDENT' && !f.promo?.trim()) return 'La promotion est obligatoire.';
    if (field === 'imatricule' && this.selectedRole !== 'STUDENT') return this.requiredMinMessage(f.imatricule, 3, 'Le matricule');
    if (field === 'departemnt' && this.selectedRole !== 'STUDENT') return this.requiredMinMessage(f.departemnt, 2, 'Le département');

    return '';
  }

  private getValidationErrors(): string[] {
    const fields: UserFormField[] = ['firstName', 'lastName', 'username', 'password', 'cni'];
    if (this.selectedRole === 'STUDENT') {
      fields.push('cne', 'filier', 'promo');
    } else {
      fields.push('imatricule', 'departemnt');
    }
    return fields.map((field) => this.getFieldError(field)).filter(Boolean);
  }

  private requiredMinMessage(value: string, minLength: number, label: string): string {
    if (!value?.trim()) return `${label} est obligatoire.`;
    if (value.trim().length < minLength) return `${label} doit contenir au moins ${minLength} caractères.`;
    return '';
  }

  private isDuplicateUsername(): boolean {
    const username = this.formUser.username?.trim().toLowerCase();
    if (!username) return false;

    return this.users.some((user) => {
      const sameUsername = user.username?.trim().toLowerCase() === username;
      const sameUser = this.isEdit && user.id === this.formUser.id;
      return sameUsername && !sameUser;
    });
  }

  // ─────────────────────────────────────────────
  // Enregistrer (create / update)
  // ─────────────────────────────────────────────
  onSave(): void {
    this.formSubmitted = true;
    this.formErrorMessage = '';

    if (this.selectedRole === 'STUDENT' && !this.isEdit && !this.selectedFaceFile && !this.faceUploadError) {
      this.faceUploadError = 'L’image faciale est obligatoire pour créer un étudiant.';
    }

    if (!this.isFormValid() || this.faceUploadError) {
      this.formErrorMessage = 'Veuillez corriger les champs invalides avant d’enregistrer.';
      return;
    }

    this.isSaving = true;

    this.formUser.role = this.selectedRole;
    this.authService.item = { ...this.formUser };

    const action$ = this.isEdit
      ? this.authService.update()
      : this.authService.register();

    action$
      .pipe(
        switchMap((createdUser: User) => {
          const shouldUploadFace = this.selectedRole === 'STUDENT' && !!this.selectedFaceFile;
          const userId = createdUser.id ?? this.formUser.id;

          if (!shouldUploadFace) {
            return of(createdUser);
          }

          if (userId == null) {
            this.faceUploadError = 'Utilisateur enregistré, mais l’identifiant est introuvable pour envoyer l’image faciale.';
            return throwError(() => new Error(this.faceUploadError));
          }

          return this.authService
            .uploadStudentFace(this.selectedFaceFile!, userId)
            .pipe(
              map(() => createdUser),
              catchError((err) => {
                this.faceUploadError = 'Utilisateur enregistré, mais l’image faciale n’a pas pu être envoyée.';
                return throwError(() => err);
              })
            );
        }),
        takeUntil(this.destroy$)
      )
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
          this.formErrorMessage = this.faceUploadError || this.getSaveErrorMessage(err);
          this.isSaving = false;
        }
      });
  }

  private getSaveErrorMessage(err: HttpErrorResponse): string {
    const message = this.errorText(err).toLowerCase();
    if (message.includes('upload-face') || message.includes('face')) {
      return 'Utilisateur enregistré, mais l’image faciale n’a pas pu être envoyée.';
    }
    if (err.status === 409 || message.includes('existe déjà') || message.includes('already exists')) {
      this.touchedFields.add('username');
      return 'Un utilisateur avec ce username existe déjà.';
    }
    if (err.status === 400 || message.includes('invalid')) {
      return 'Les informations saisies sont invalides.';
    }
    return 'Enregistrement impossible. Vérifiez les informations puis réessayez.';
  }

  private errorText(err: HttpErrorResponse): string {
    if (typeof err.error === 'string') return err.error;
    return err.error?.message ?? err.message ?? '';
  }

  private resetFormState(): void {
    this.formSubmitted = false;
    this.formErrorMessage = '';
    this.resetFaceUpload();
    this.touchedFields.clear();
  }

  private resetFaceUpload(): void {
    this.selectedFaceFile = null;
    this.facePreview = null;
    this.faceUploadError = '';
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
