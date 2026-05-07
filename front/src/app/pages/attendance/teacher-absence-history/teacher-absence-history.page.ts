import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { Absence } from '../../../models/absence.model';
import { AbsenceService } from '../../../services/absence.service';

@Component({selector:'app-teacher-absence-history-page',standalone:true,imports:[CommonModule,ReactiveFormsModule,DatePipe],templateUrl:'./teacher-absence-history.page.html'})
export class TeacherAbsenceHistoryPage {
  private fb=inject(FormBuilder); private service=inject(AbsenceService);
  loading=false; data: Absence[]=[]; filtered: Absence[]=[]; paged: Absence[]=[]; page=1; pageSize=5;
  form=this.fb.nonNullable.group({teacherId:[1], search:['']});
  load(){this.loading=true; this.service.getAbsencesByTeacher(this.form.controls.teacherId.value).pipe(finalize(()=>this.loading=false)).subscribe({next:r=>{this.data=r;this.apply();}});}
  apply(){const q=this.form.controls.search.value.toLowerCase(); this.filtered=this.data.filter(a=>`${a.nomModule} ${a.filiere} ${a.promo} ${a.typeSeance}`.toLowerCase().includes(q)); this.page=1; this.updatePage();}
  updatePage(){ const start=(this.page-1)*this.pageSize; this.paged=this.filtered.slice(start,start+this.pageSize);}
  next(){ if(this.page*this.pageSize<this.filtered.length){this.page++;this.updatePage();}}
  prev(){ if(this.page>1){this.page--;this.updatePage();}}
}
