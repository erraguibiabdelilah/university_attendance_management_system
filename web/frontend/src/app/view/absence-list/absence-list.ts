import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Absence, AbsenceDetail, RefData } from '../../shared/models/absence.model';
import { User } from '../../shared/models/user';
import { Subject, takeUntil } from 'rxjs';
import { AbsenceService } from '../../shared/services/absence-service';
import { AuthService } from '../../shared/services/auth';

@Component({
  selector: 'app-absence-list',
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './absence-list.html',
  styleUrl: './absence-list.scss'
})
export class AbsenceList implements OnInit, OnDestroy {
  // ─────────────────────────────────────────────
  // Données de référence (pour les filtres)
  // ─────────────────────────────────────────────
  filieres: string[] = [];
  promos: string[] = [];
  modulesFilter: string[] = [];

  // ─────────────────────────────────────────────
  // Modal Détails (lecture seule)
  // ─────────────────────────────────────────────
  showDetailsModal = false;
  isLoadingDetails = false;
  selectedDetailsAbsence?: Absence;

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

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
    this.applyFilters();
  }

  // ─────────────────────────────────────────────
  // Enseignant connecté (pour info affichage)
  // ─────────────────────────────────────────────
  current_teacher!: User;

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
  // Teacher (info uniquement)
  // ─────────────────────────────────────────────
  private loadTeacherFromStorage(): void {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return;
      this.current_teacher = JSON.parse(raw);
    } catch (e) {
      console.error('loadTeacherFromStorage', e);
    }
  }

  // ─────────────────────────────────────────────
  // Références (pour les filtres)
  // ─────────────────────────────────────────────
  private loadRefData(): void {
    this.absenceService
      .getRefData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: RefData) => {
          this.filieres = data.filieres;
          this.promos = data.promos;
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

  // ═══════════════════════════════════════════════════════════
  // MODAL DÉTAILS - LECTURE SEULE
  // ═══════════════════════════════════════════════════════════

  /**
   * Ouvre le modal des détails en lecture seule
   */
  getDetailsByAbsence(absence: Absence): void {
    if (!absence.id) return;

    this.isLoadingDetails = true;
    this.details = [];
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
  }

  /**
   * Ferme le modal des détails
   */
  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.details = [];
    this.selectedDetailsAbsence = undefined;
  }
}
