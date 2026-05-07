import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AbsenceDetail } from '../../../models/absence.model';
import { AbsenceService } from '../../../services/absence.service';

@Component({selector:'app-mark-attendance-page',standalone:true,imports:[CommonModule,ReactiveFormsModule],templateUrl:'./mark-attendance.page.html'})
export class MarkAttendancePage {
  private fb=inject(FormBuilder); private service=inject(AbsenceService);
  loading=false; message=''; details: AbsenceDetail[]=[];
  form=this.fb.nonNullable.group({absenceId:[0], absentStudentIds:['']});
  loadDetails(){const id=this.form.controls.absenceId.value; if(!id) return; this.loading=true; this.service.getAbsenceDetails(id).pipe(finalize(()=>this.loading=false)).subscribe({next:d=>this.details=d,error:e=>this.message=e.message});}
  toggle(studentId:number, checked:boolean){ const set=new Set(this.getIds()); checked?set.add(studentId):set.delete(studentId); this.form.controls.absentStudentIds.setValue([...set].join(',')); }
  getIds(){ const v=this.form.controls.absentStudentIds.value; return v? v.split(',').map(Number).filter(Boolean):[]; }
  save(){ const id=this.form.controls.absenceId.value; this.loading=true; this.service.markAbsences(id,{absentStudentIds:this.getIds()}).pipe(finalize(()=>this.loading=false)).subscribe({next:()=>this.message='Attendance updated.',error:e=>this.message=e.message}); }
}
