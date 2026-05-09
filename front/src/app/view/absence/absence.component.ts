import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';

import { AbsenceService } from '../../shared/service/absence.service';
import { AbsenceDto } from '../../shared/model/absence.model';
import { AbsenceDetailDto } from '../../shared/model/absence-detail.model';
import { User } from '../../shared/models/user';

@Component({
  selector: 'app-absence',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './absence.component.html'
})
export class AbsenceComponent {
  promos: string[] = Array.from({ length: 7 }, (_, i) => (2020 + i).toString());
  filieres: string[] = ['IRISI', 'SIT', 'GC'];

  date: string = new Date().toISOString().split('T')[0];
  students: User[] = [];
  absenceDetails: AbsenceDetailDto[] = [];
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  private readonly absenceService = inject(AbsenceService);

  teacherId: number;
  currentAbsence?: AbsenceDto;

  nomModule = '';
  promo = this.promos[0];
  filiere = this.filieres[0];
  private readonly defaultTypeSeance = 'COURS';

  constructor() {
    this.teacherId = this.getTeacherIdFromStorage();
  }

  private getTeacherIdFromStorage(): number {
    try {
      const userRaw = localStorage.getItem('user');
      if (!userRaw) {
        return 0;
      }

      const user = JSON.parse(userRaw);
      return Number(user?.id) || 0;
    } catch {
      return 0;
    }
  }

  get isAttendanceStep(): boolean {
    return !!this.currentAbsence?.id;
  }

  onNext(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.students = [];
    this.absenceDetails = [];
    this.currentAbsence = undefined;

    if (!this.isAbsenceFormValid()) {
      this.errorMessage = 'Veuillez renseigner la filière, le module, la promo et la date.';
      return;
    }

    const absence: AbsenceDto = {
      teacherId: this.teacherId,
      nomModule: this.nomModule.trim(),
      filiere: this.filiere,
      promo: this.promo,
      typeSeance: this.defaultTypeSeance,
      date: this.date
    };

    this.isLoading = true;
    this.absenceService.saveAbsence(absence).subscribe({
      next: (savedAbsence) => {
        if (!savedAbsence.id) {
          this.errorMessage = 'Absence enregistrée sans identifiant retourné.';
          this.isLoading = false;
          return;
        }

        this.currentAbsence = savedAbsence;
        this.loadStudentsForAttendance();
      },
      error: () => {
        this.errorMessage = 'Erreur lors de l’enregistrement de l’absence.';
        this.isLoading = false;
      }
    });
  }

  onSave(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.currentAbsence?.id || this.students.length === 0) {
      this.errorMessage = 'Veuillez créer une absence et charger les étudiants avant d’enregistrer.';
      return;
    }

    this.isLoading = true;
    const detailRequests = this.absenceDetails.map((detail) =>
      this.absenceService.saveAbsenceDetail({
        ...detail,
        absenceId: this.currentAbsence?.id
      })
    );

    const saveDetails$ = detailRequests.length > 0 ? forkJoin(detailRequests) : of([]);

    saveDetails$.subscribe({
      next: () => {
        this.successMessage = 'Les détails de présence ont été enregistrés avec succès.';
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Erreur lors de l’enregistrement des détails d’absence.';
        this.isLoading = false;
      }
    });
  }

  resetWorkflow(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.students = [];
    this.absenceDetails = [];
    this.currentAbsence = undefined;
  }

  private isAbsenceFormValid(): boolean {
    return !!this.filiere && !!this.promo && !!this.date && this.nomModule.trim().length > 0 && this.teacherId > 0;
  }

  private loadStudentsForAttendance(): void {
    this.absenceService.getStudentsByFiliereAndPromo(this.filiere, this.promo).subscribe({
      next: (data) => {
        this.students = data ?? [];
        this.absenceDetails = this.students.map((student) => ({
          studentId: student.id,
          estAbsent: false
        }));
        this.isLoading = false;

        if (this.students.length === 0) {
          this.errorMessage = 'Aucun étudiant trouvé pour cette filière et cette promo.';
        }
      },
      error: () => {
        this.students = [];
        this.absenceDetails = [];
        this.currentAbsence = undefined;
        this.errorMessage = 'Absence créée, mais erreur lors du chargement des étudiants.';
        this.isLoading = false;
      }
    });
  }
}
