import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../shared/services/auth';
import { Router } from '@angular/router';
import { User } from '../../../shared/models/user';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './users.html',
  styleUrl: './users.scss'
})
export class Users implements OnInit {

  service = inject(AuthService);
  router = inject(Router);

  public isEdit = false;
  public users: User[] = [];
  public showForm = false;
  public filterRole = 'ALL';
  public userToDelete: User | null = null;

  public toastVisible = false;
  public toastMessage = '';
  public toastType: 'success' | 'error' = 'success';

  public selectedRole = 'STUDENT';

  public promoYears = ['2020', '2021', '2022', '2023', '2024', '2025'];

  registerForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl(''), // 🔥 FIX: pas obligatoire en update
    role: new FormControl('STUDENT', Validators.required),
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    promo: new FormControl(''),
    filier: new FormControl(''),
    cne: new FormControl(''),
    cni: new FormControl('', Validators.required),
    imatricule: new FormControl(''),
    departemnt: new FormControl('')
  });

  ngOnInit(): void {
    this.getAll();
    this.onRoleChange();
  }

  // ─── FORM ─────────────────────────────────────
  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) this.resetForm();
  }

  cancelForm(): void {
    this.showForm = false;
    this.resetForm();
  }

  // ─── ROLE CHANGE ─────────────────────────────
  onRoleChange(): void {

    this.selectedRole = this.registerForm.value.role ?? 'STUDENT';

    // ❌ IMPORTANT: ne pas reset en edit
    if (!this.isEdit) {
      this.registerForm.patchValue({
        cne: '',
        filier: '',
        promo: '',
        imatricule: '',
        departemnt: ''
      });
    }

    if (this.selectedRole === 'STUDENT') {

      this.registerForm.get('cne')?.setValidators(Validators.required);
      this.registerForm.get('filier')?.setValidators(Validators.required);
      this.registerForm.get('promo')?.setValidators(Validators.required);

      this.registerForm.get('imatricule')?.clearValidators();
      this.registerForm.get('departemnt')?.clearValidators();

    } else {

      this.registerForm.get('imatricule')?.setValidators(Validators.required);
      this.registerForm.get('departemnt')?.setValidators(Validators.required);

      this.registerForm.get('cne')?.clearValidators();
      this.registerForm.get('filier')?.clearValidators();
      this.registerForm.get('promo')?.clearValidators();
    }

    ['cne','filier','promo','imatricule','departemnt']
      .forEach(c => this.registerForm.get(c)?.updateValueAndValidity());
  }

  // ─── SAVE ─────────────────────────────────────
  public save(): void {

    if (this.registerForm.invalid) return;

    this.initialiseItem();

    this.service.register().subscribe({
      next: () => {
        this.showToast('Utilisateur créé avec succès !', 'success');
        this.getAll();
        this.resetForm();
        this.showForm = false;
      },
      error: (err) => {
        console.error(err);
        this.showToast('Erreur création', 'error');
      }
    });
  }

  // ─── UPDATE ───────────────────────────────────
  public update(): void {

    if (this.registerForm.invalid) return;

    this.initialiseItem();

    this.service.update().subscribe({
      next: () => {
        this.showToast('Utilisateur modifié avec succès !', 'success');
        this.getAll();
        this.resetForm();
        this.showForm = false;
      },
      error: (err) => {
        console.error(err);
        this.showToast('Erreur update', 'error');
      }
    });
  }

  // ─── DELETE ───────────────────────────────────
  public confirmDelete(user: User): void {
    this.userToDelete = user;
    const modal = new Modal(document.getElementById('deleteModal')!);
    modal.show();
  }

  public deleteConfirmed(): void {

    if (!this.userToDelete?.id) return;

    this.service.delete(this.userToDelete.id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== this.userToDelete!.id);
        this.showToast('Utilisateur supprimé', 'success');
        this.userToDelete = null;
      },
      error: (err) => {
        console.error(err);
        this.showToast('Erreur delete', 'error');
      }
    });
  }

  // ─── GET ALL ──────────────────────────────────
  public getAll(): void {
    this.service.gitAll().subscribe({
      next: (data) => this.users = data,
      error: (err) => console.error(err)
    });
  }

  // ─── OPEN EDIT MODAL ──────────────────────────
  public showModal(user: User): void {

    this.isEdit = true;

    this.item = { ...user };

    this.selectedRole = user.role;

    this.registerForm.patchValue({
      username: user.username ?? '',
      password: '', // important
      role: user.role ?? 'STUDENT',

      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      cni: user.cni ?? '',
      cne: user.cne ?? '',
      filier: user.filier ?? '',
      promo: user.promo ?? '',
      imatricule: user.imatricule ?? '',
      departemnt: user.departemnt ?? ''
    });

    this.onRoleChange();

    this.showForm = true;
  }

  // ─── BUILD OBJECT ─────────────────────────────
  public initialiseItem(): void {

    const v = this.registerForm.value;

    this.item = {
      ...this.item,
      username: v.username ?? '',
      password: v.password ?? '',
      role: v.role ?? 'STUDENT',
      firstName: v.firstName ?? '',
      lastName: v.lastName ?? '',
      cni: v.cni ?? '',
      cne: v.cne ?? '',
      filier: v.filier ?? '',
      promo: v.promo ?? '',
      imatricule: v.imatricule ?? '',
      departemnt: v.departemnt ?? ''
    };
  }

  // ─── RESET FORM ───────────────────────────────
  private resetForm(): void {

    this.isEdit = false;
    this.selectedRole = 'STUDENT';

    this.registerForm.reset({
      role: 'STUDENT',
      username: '',
      password: '',
      firstName: '',
      lastName: '',
      cni: '',
      cne: '',
      filier: '',
      promo: '',
      imatricule: '',
      departemnt: ''
    });

    this.onRoleChange();
  }

  // ─── FILTER ───────────────────────────────────
  setFilter(role: string): void {
    this.filterRole = role;
  }

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

  // ─── TOAST ────────────────────────────────────
  showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 3000);
  }

  // ─── BADGES ───────────────────────────────────
  roleBadgeBg(role: string): string {
    return { ADMIN: '#fef3c7', TEACHER: '#ede9fe', STUDENT: '#dbeafe' }[role] ?? '#f1f5f9';
  }

  roleBadgeColor(role: string): string {
    return { ADMIN: '#d97706', TEACHER: '#7c3aed', STUDENT: '#2563eb' }[role] ?? '#64748b';
  }

  // ─── SERVICE ITEM ─────────────────────────────
  get item(): User {
    return this.service.item;
  }

  set item(value: User) {
    this.service.item = value;
  }
}
