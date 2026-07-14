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
  isLoadingDetailsStudents = false;
  isSavingDetail = false;
  editingDetailId?: number;
  detailDraftAbsent = false;
  selectedDetailStudentId?: number;
  selectedDetailsAbsence?: Absence;
  detailStudents: User[] = [];

  // ─────────────────────────────────────────────
  // Liste principale des absences
  // ─────────────────────────────────────────────
  absences: Absence[] = [];
  details: AbsenceDetail[] = [];
  filteredAbsences: Absence[] = [];

  filterFiliere = '';
  filterPromo = '';
  filterModule = '';
  filterDate = '';

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

  get availableStudentsForDetails(): User[] {
    const existingStudentIds = new Set(this.details.map((detail) => detail.studentId));
    return this.detailStudents.filter((student) => !existingStudentIds.has(student.id));
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
  isEditMode = false;
  selectedAbsenceId?: number;

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
    if (this.filterDate) list = list.filter((a) => this.toDateOnly(a.date) === this.filterDate);

    this.totalAbsences = list.length;
    this.totalPages = Math.max(1, Math.ceil(list.length / this.pageSize));

    const start = (this.currentPage - 1) * this.pageSize;
    this.filteredAbsences = list.slice(start, start + this.pageSize);
  }

  private toDateOnly(value?: string): string {
    if (!value) return '';
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
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
    this.isEditMode = false;
    this.selectedAbsenceId = undefined;
    this.absence = this.emptyAbsence();
    this.absenceDetails = [];
    this.showModal = true;
  }

  openEditModal(absence: Absence): void {
    if (!absence.id) return;

    this.isEditMode = true;
    this.selectedAbsenceId = absence.id;
    this.absence = { ...absence };
    this.absenceDetails = [];
    this.showModal = true;
    this.loadDetailsForEdit(absence.id);
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditMode = false;
    this.selectedAbsenceId = undefined;
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
    if (this.isEditMode) return;
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
    if (this.isEditMode && this.selectedAbsenceId) {
      this.absenceService
        .updateAbsenceWithDetails(this.selectedAbsenceId, {
          absence: { ...this.absence, id: this.selectedAbsenceId },
          details: this.absenceDetails.map((detail) => ({
            ...detail,
            absenceId: detail.absenceId ?? this.selectedAbsenceId
          }))
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isSaving = false;
            this.showModal = false;
            this.isEditMode = false;
            this.selectedAbsenceId = undefined;
            this.loadAbsences();
            this.triggerToast();
          },
          error: (err) => {
            console.error('onUpdateAbsence', err);
            this.isSaving = false;
          }
        });
      return;
    }

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

  getDetailsByAbsence(absence: Absence): void {
    if (!absence.id) return;

    this.isLoadingDetails = true;
    this.isLoadingDetailsStudents = false;
    this.details = [];
    this.detailStudents = [];
    this.selectedDetailStudentId = undefined;
    this.editingDetailId = undefined;
    this.selectedDetailsAbsence = absence;
    this.showDetailsModal = true;

    this.absenceService
      .getDetailsByAbsenceId(absence.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.details = data;
          this.isLoadingDetails = false;
        },
        error: (err) => {
          console.error(err);
          this.isLoadingDetails = false;
        }
      });

    this.loadStudentsForDetails(absence);
  }

  getDetailsByAbsenceId(id: number): void {
    const absence = this.absences.find((elmt) => elmt.id === id);
    if (absence) {
      this.getDetailsByAbsence(absence);
    }
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.details = [];
    this.detailStudents = [];
    this.selectedDetailStudentId = undefined;
    this.editingDetailId = undefined;
    this.selectedDetailsAbsence = undefined;
  }

  private loadStudentsForDetails(absence: Absence): void {
    if (!absence.filiere || !absence.promo) return;

    this.isLoadingDetailsStudents = true;
    this.authService
      .getStudents(absence.filiere, absence.promo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.detailStudents = data;
          this.isLoadingDetailsStudents = false;
        },
        error: (err) => {
          console.error('loadStudentsForDetails', err);
          this.isLoadingDetailsStudents = false;
        }
      });
  }

  private loadDetailsForEdit(absenceId: number): void {
    this.isLoadingStudents = true;
    this.absenceService
      .getDetailsByAbsenceId(absenceId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.absenceDetails = data;
          this.isLoadingStudents = false;
        },
        error: (err) => {
          console.error('loadDetailsForEdit', err);
          this.isLoadingStudents = false;
        }
      });
  }

  startEditDetail(detail: AbsenceDetail): void {
    if (!detail.id) return;
    this.editingDetailId = detail.id;
    this.detailDraftAbsent = detail.estAbsent;
  }

  cancelEditDetail(): void {
    this.editingDetailId = undefined;
    this.detailDraftAbsent = false;
  }

  onCreateDetail(): void {
    if (!this.selectedDetailsAbsence?.id || this.selectedDetailStudentId == null) return;

    const student = this.detailStudents.find((elmt) => elmt.id === this.selectedDetailStudentId);
    if (!student) return;

    this.isSavingDetail = true;
    const detail: AbsenceDetail = {
      absenceId: this.selectedDetailsAbsence.id,
      studentId: student.id,
      studentFirstName: student.firstName,
      studentLastName: student.lastName,
      studentCne: student.cne,
      estAbsent: false
    };

    this.absenceService
      .saveDetail(detail)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (saved) => {
          this.details = [...this.details, saved];
          this.selectedDetailStudentId = undefined;
          this.isSavingDetail = false;
        },
        error: (err) => {
          console.error('onCreateDetail', err);
          this.isSavingDetail = false;
        }
      });
  }

  onUpdateDetail(detail: AbsenceDetail): void {
    if (!detail.id) return;

    this.isSavingDetail = true;
    this.absenceService
      .updateDetail(detail.id, {
        ...detail,
        estAbsent: this.detailDraftAbsent,
        absenceId: detail.absenceId ?? this.selectedDetailsAbsence?.id ?? this.selectedAbsenceId
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.absenceDetails = this.absenceDetails.map((elmt) => (elmt.id === updated.id ? updated : elmt));
          this.details = this.details.map((elmt) => (elmt.id === updated.id ? updated : elmt));
          this.isSavingDetail = false;
          this.cancelEditDetail();
        },
        error: (err) => {
          console.error('onUpdateDetail', err);
          this.isSavingDetail = false;
        }
      });
  }

  onDeleteDetail(id: number | undefined): void {
    if (!id) {
      this.absenceDetails = this.absenceDetails.filter((detail) => detail.id);
      return;
    }
    if (!confirm('Confirmer la suppression du détail ?')) return;

    this.absenceService
      .deleteDetail(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.absenceDetails = this.absenceDetails.filter((detail) => detail.id !== id);
          this.details = this.details.filter((detail) => detail.id !== id);
        },
        error: (err) => console.error('onDeleteDetail', err)
      });
  }
}
