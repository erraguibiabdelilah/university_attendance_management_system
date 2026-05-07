import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { StudentStats } from '../../../models/absence.model';
import { AbsenceService } from '../../../services/absence.service';

@Component({selector:'app-student-statistics-page',standalone:true,imports:[CommonModule,ReactiveFormsModule],templateUrl:'./student-statistics.page.html'})
export class StudentStatisticsPage {
  private fb=inject(FormBuilder); private service=inject(AbsenceService);
  loading=false; stats?: StudentStats; message='';
  form=this.fb.nonNullable.group({studentId:[0,[Validators.required,Validators.min(1)]]});
  load(){if(this.form.invalid)return; this.loading=true; this.service.getStudentStats(this.form.controls.studentId.value).pipe(finalize(()=>this.loading=false)).subscribe({next:s=>{this.stats=s;},error:e=>this.message=e.message});}
  get percentage(){ if(!this.stats?.totalSessions) return 100; return Math.round(((this.stats.totalSessions-this.stats.totalAbsences)/this.stats.totalSessions)*100); }
}
