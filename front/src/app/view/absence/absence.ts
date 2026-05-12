import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { AbsenceService } from '../../shared/services/absence-service';
import { AuthService } from '../../shared/services/auth';

import { Absence, AbsenceDetail, RefData } from '../../shared/models/absence.model';

import { User } from '../../shared/models/user';

// ── Alerte locale ─────────────────────────────────────────────
interface Alerte {
  id: number;
  title: string;
  subtitle: string;
  color: string;
}

@Component({
  selector: 'app-absence',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './absence.html',
  styleUrl: './absence.scss'
})
export class AbsenceComponent implements OnInit, OnDestroy {
  // ─────────────────────────────────────────────
  // Données de référence
  // ─────────────────────────────────────────────
  filieres: string[] = [];
  promos: string[] = [];
  typeSeances: { value: string; label: string }[] = [];
  modulesFilter: string[] = [];
  showDetailsModal = false;
  isLoadingDetails = false;

  // ─────────────────────────────────────────────
  // Liste principale des absences
  // ─────────────────────────────────────────────
  absences: Absence[] = [];
  details: AbsenceDetail[] = [];
  filteredAbsences: Absence[] = [];

  filterFiliere = '';
  filterPromo = '';
  filterModule = '';

  isLoadingAbsences = false;

  // ─────────────────────────────────────────────
  // Pagination
  // ─────────────────────────────────────────────
  currentPage = 1;
  pageSize = 10;
  totalAbsences = 0;
  totalPages = 1;

  get pageStart(): number {
    return this.filteredAbsences.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalAbsences);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= Math.min(this.totalPages, 5); i++) pages.push(i);
    return pages;
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
    this.applyFilters();
  }

  // ─────────────────────────────────────────────
  // Stats
  // ─────────────────────────────────────────────
  tauxAssiduite = 92;
  totalSessionsMois = '1,2k';

  alertes: Alerte[] = [
    { id: 1, title: '3 absences consécutives', subtitle: 'Étudiant: Ahmed Alami (GI-L3M)', color: '#ef4444' },
    { id: 2, title: 'Nouveau module à valider', subtitle: 'Pr. Mansouf a ajouté: Cloud Computing', color: '#f59e0b' }
  ];

  // ─────────────────────────────────────────────
  // Enseignant connecté
  // ─────────────────────────────────────────────
  current_teacher!: User;

  // ─────────────────────────────────────────────
  // Modal
  // ─────────────────────────────────────────────
  showModal = false;

  absence: Absence = this.emptyAbsence();

  absenceDetails: AbsenceDetail[] = [];
  students: User[] = [];

  isLoadingStudents = false;
  isSaving = false;

  // ─────────────────────────────────────────────
  // Toast
  // ─────────────────────────────────────────────
  showToast = false;

  // ─────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────
  private destroy$ = new Subject<void>();

  constructor(
    private absenceService: AbsenceService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadTeacherFromStorage();
    this.loadRefData();
    this.loadAbsences();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─────────────────────────────────────────────
  // Teacher
  // ─────────────────────────────────────────────
  private loadTeacherFromStorage(): void {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return;
      this.current_teacher = JSON.parse(raw);
      this.absenceService.item = this.current_teacher;
      this.absence.teacherId = this.current_teacher.id;
      this.absence.teacherFirstName = this.current_teacher.firstName;
      this.absence.teacherLastName = this.current_teacher.lastName;
    } catch (e) {
      console.error('loadTeacherFromStorage', e);
    }
  }

  // ─────────────────────────────────────────────
  // Références
  // ─────────────────────────────────────────────
  private loadRefData(): void {
    this.absenceService
      .getRefData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: RefData) => {
          this.filieres = data.filieres;
          this.promos = data.promos;
          this.typeSeances = data.typeSeances;
        },
        error: (err) => console.error('loadRefData', err)
      });
  }

  // ─────────────────────────────────────────────
  // Charger toutes les absences
  // ─────────────────────────────────────────────
  loadAbsences(): void {
    this.isLoadingAbsences = true;
    this.absenceService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Absence[]) => {
          this.absences = data;
          // Construire la liste de modules pour le filtre
          this.modulesFilter = [...new Set(data.map((a) => a.nomModule).filter(Boolean))];
          this.applyFilters();
          this.isLoadingAbsences = false;
        },
        error: (err) => {
          console.error('loadAbsences', err);
          this.isLoadingAbsences = false;
        }
      });
  }

  // ─────────────────────────────────────────────
  // Filtres de la liste
  // ─────────────────────────────────────────────
  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  private applyFilters(): void {
    let list = [...this.absences];

    if (this.filterFiliere) list = list.filter((a) => a.filiere === this.filterFiliere);
    if (this.filterPromo) list = list.filter((a) => a.promo === this.filterPromo);
    if (this.filterModule) list = list.filter((a) => a.nomModule === this.filterModule);

    this.totalAbsences = list.length;
    this.totalPages = Math.max(1, Math.ceil(list.length / this.pageSize));

    const start = (this.currentPage - 1) * this.pageSize;
    this.filteredAbsences = list.slice(start, start + this.pageSize);
  }

  // ─────────────────────────────────────────────
  // Couleur chip filière
  // ─────────────────────────────────────────────
  getFiliereClass(filiere: string): string {
    const map: Record<string, string> = {
      'Génie Informatique': 'fil-blue',
      Management: 'fil-green',
      Droit: 'fil-orange'
    };
    return map[filiere] ?? 'fil-blue';
  }

  // ─────────────────────────────────────────────
  // Supprimer
  // ─────────────────────────────────────────────
  onDelete(id: number | undefined): void {
    if (!id) return;
    if (!confirm('Confirmer la suppression ?')) return;
    this.absenceService
      .delete(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadAbsences(),
        error: (err) => console.error('onDelete', err)
      });
  }

  // ─────────────────────────────────────────────
  // Modal – ouverture / fermeture
  // ─────────────────────────────────────────────
  openModal(): void {
    this.absence = this.emptyAbsence();
    this.absenceDetails = [];
    this.showModal = true;
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
  // Modal – filtre filière/promo → recharger étudiants
  // ─────────────────────────────────────────────
  onModalFilterChange(): void {
    this.absenceDetails = [];
  }

  // ─────────────────────────────────────────────
  // Charger étudiants dans le modal
  // ─────────────────────────────────────────────
  loadStudents(): void {
    if (!this.absence.filiere || !this.absence.promo) return;
    this.isLoadingStudents = true;
    this.absenceDetails = [];

    this.authService
      .getStudents(this.absence.filiere, this.absence.promo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: User[]) => {
          this.students = data;
          this.absenceDetails = data.map((s) => ({
            studentId: s.id,
            studentFirstName: s.firstName,
            studentLastName: s.lastName,
            studentCne: s.cne,
            estAbsent: false
          }));
          this.isLoadingStudents = false;
        },
        error: (err) => {
          console.error('loadStudents', err);
          this.isLoadingStudents = false;
        }
      });
  }

  // ─────────────────────────────────────────────
  // Validation formulaire modal
  // ─────────────────────────────────────────────
  isFormValid(): boolean {
    return !!(
      this.absence.filiere?.trim() &&
      this.absence.promo?.trim() &&
      this.absence.nomModule?.trim() &&
      this.absence.typeSeance?.trim() &&
      this.absenceDetails.length > 0
    );
  }

  // ─────────────────────────────────────────────
  // Enregistrer
  // ─────────────────────────────────────────────
  onSave(): void {
    if (!this.isFormValid()) return;

    this.isSaving = true;
    const now = new Date();
    this.absence.date = now.toISOString().split('T')[0];
    this.absence.createdAt = now.toISOString();

    this.absenceService
      .saveAbsenceWithDetails({
        absence: { ...this.absence },
        details: [...this.absenceDetails]
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.showModal = false;
          this.loadAbsences();
          this.triggerToast();
        },
        error: (err) => {
          console.error('onSave', err);
          this.isSaving = false;
        }
      });
  }

  // ─────────────────────────────────────────────
  // Toast
  // ─────────────────────────────────────────────
  private triggerToast(): void {
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3500);
  }

  // ─────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────
  private emptyAbsence(): Absence {
    return {
      nomModule: '',
      filiere: '',
      promo: '',
      typeSeance: '',
      teacherId: this.current_teacher?.id ?? 0,
      teacherFirstName: this.current_teacher?.firstName ?? '',
      teacherLastName: this.current_teacher?.lastName ?? '',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };
  }

  getDetailsByAbsenceId(id: number): void {
    this.isLoadingDetails = true;
    this.details = [];
    this.showDetailsModal = true; // ouvre la modal immédiatement

    this.absenceService.getDetailsByAbsenceId(id).subscribe({
      next: (data) => {
        this.details = data;
        this.isLoadingDetails = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoadingDetails = false;
      }
    });
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.details = [];
  }
}
