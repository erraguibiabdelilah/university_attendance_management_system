import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';

import { AbsenceService } from '../../shared/service/absence.service';
import { AbsenceDto } from '../../shared/model/absence.model';
import { AbsenceDetailDto } from '../../shared/model/absence-detail.model';

@Component({
  selector: 'app-absence',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './absence.component.html'
})
export class AbsenceComponent {
  promos: string[] = Array.from({ length: 7 }, (_, i) => (2020 + i).toString());
  filieres: string[] = ['IRISI', 'SIT', 'GC'];
  typeSeances: string[] = ['COURS', 'TD', 'TP'];

  today: string = new Date().toISOString().split('T')[0];
  students: any[] = [];
  absenceDetails: AbsenceDetailDto[] = [];
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  teacherId: number;

  nomModule = '';
  promo = this.promos[0];
  filiere = this.filieres[0];
  typeSeance = this.typeSeances[0];
  createdAt = new Date().toISOString();

  constructor(private readonly absenceService: AbsenceService) {
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

  onSearch(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.isLoading = true;

    this.absenceService.getStudentsByFiliereAndPromo(this.filiere, this.promo).subscribe({
      next: (data) => {
        this.students = data ?? [];
        this.absenceDetails = this.students.map((s) => ({
          studentId: s.id,
          estAbsent: false
        }));
        this.isLoading = false;
      },
      error: () => {
        this.students = [];
        this.absenceDetails = [];
        this.errorMessage = 'Erreur lors du chargement des étudiants.';
        this.isLoading = false;
      }
    });
  }

  onSave(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.nomModule || this.students.length === 0) {
      this.errorMessage = 'Veuillez renseigner le module et rechercher des étudiants.';
      return;
    }

    const absence: AbsenceDto = {
      teacherId: this.teacherId,
      nomModule: this.nomModule,
      filiere: this.filiere,
      promo: this.promo,
      typeSeance: this.typeSeance,
      date: this.today,
      createdAt: this.createdAt
    };

    this.isLoading = true;
    this.absenceService.saveAbsence(absence).subscribe({
      next: (savedAbsence) => {
        const absenceId = savedAbsence.id;

        if (!absenceId) {
          this.errorMessage = 'Absence enregistrée sans identifiant retourné.';
          this.isLoading = false;
          return;
        }

        const detailRequests = this.absenceDetails.map((detail) =>
          this.absenceService.saveAbsenceDetail({
            ...detail,
            absenceId
          })
        );

        const saveDetails$ = detailRequests.length > 0 ? forkJoin(detailRequests) : of([]);

        saveDetails$.subscribe({
          next: () => {
            this.successMessage = 'Absence et détails enregistrés avec succès.';
            this.isLoading = false;
          },
          error: () => {
            this.errorMessage = 'Erreur lors de l’enregistrement des détails d’absence.';
            this.isLoading = false;
          }
        });
      },
      error: () => {
        this.errorMessage = 'Erreur lors de l’enregistrement de l’absence.';
        this.isLoading = false;
      }
    });
  }
}
