import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { AbsenceService } from '../../../services/absence.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-create-absence-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EmptyStateComponent],
  templateUrl: './create-absence.page.html'
})
export class CreateAbsencePage {
  private readonly fb = inject(FormBuilder);
  private readonly absenceService = inject(AbsenceService);
  loading = false;
  toast = '';

  modules = ['Mathématiques', 'Algorithmique', 'Réseaux', 'Base de Données'];
  filieres = ['Informatique', 'Génie Civil', 'Électromécanique'];
  promos = ['S1', 'S2', 'S3', 'S4'];
  typeSeances = ['Cours', 'TD', 'TP'];
  students = [
    { id: 1, label: 'Amine El Idrissi' },
    { id: 2, label: 'Salma Bennani' },
    { id: 3, label: 'Yassine Choukri' }
  ];

  form = this.fb.nonNullable.group({
    teacherId: [1, [Validators.required]],
    nomModule: ['', [Validators.required]],
    filiere: ['', [Validators.required]],
    promo: ['', [Validators.required]],
    typeSeance: ['', [Validators.required]],
    date: ['', [Validators.required]],
    studentIds: this.fb.array<number>([])
  });

  get studentIds(): FormArray { return this.form.controls.studentIds; }

  toggleStudent(id: number, checked: boolean) {
    const values = this.studentIds.value as number[];
    if (checked && !values.includes(id)) this.studentIds.push(this.fb.control(id));
    if (!checked) {
      const index = values.indexOf(id);
      if (index > -1) this.studentIds.removeAt(index);
    }
  }

  submit() {
    if (this.form.invalid || this.studentIds.length === 0) {
      this.toast = 'Please complete all fields and select at least one student.';
      return;
    }
    this.loading = true;
    this.absenceService.createAbsence(this.form.getRawValue())
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => { this.toast = 'Attendance session created successfully.'; this.form.reset({ teacherId: 1 }); this.studentIds.clear(); },
        error: (err) => this.toast = err.message
      });
  }
}
