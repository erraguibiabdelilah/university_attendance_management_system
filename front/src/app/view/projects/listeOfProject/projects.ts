import { Component, inject } from '@angular/core';
import { ProjectService } from '../../../shared/services/project-service';
import { Project } from '../../../shared/models/project.model';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';





@Component({
  selector: 'app-projects',
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './projects.html',
  styleUrl: './projects.css'
})
export class Projects {
  public projects: Array<Project> = new Array<Project>();
  public status: string = '';
  public project: Project = new Project();
  public isEdit = false;
  public selectedProject:Project = new Project() ;
  private service = inject(ProjectService);

  projectForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.min(2)])
  });

  ngOnInit() {
    this.getAll(); }

  public getAll(): void {
    const userStr = localStorage.getItem('user');

    if (!userStr) {
      console.error(' Aucun user trouvé dans localStorage !');
      return;
    }
    let storageUser;
    try {
      storageUser = JSON.parse(userStr);
    } catch (e) {
      console.error('JSON invalide dans localStorage:', userStr);
      return;
    }

    console.log('User récupéré :', storageUser);
    console.log('User id récupéré :', typeof storageUser.id);
    this.service.findProjectByUserId(storageUser.id).subscribe({
      next: (data) => {
        console.log('next 1');
        this.projects = data;
        console.log(this.projects);
      },
      error: (error) => console.log('error 1'+error)
    });
  }

  public save() {
    this.itemIntialisation();
    this.service.save().subscribe({
      next: (data: number) => {
        if (data == 1) {
          this.getAll();
          this.status = 'the project successfully added';
        } else this.status = `the project failed with backend error ,${data.toString()}`;
      },
      error: (error) => (this.status = 'the project failed with  error ' + error)
    });
    this.showAlert();
  }

  public delete(id: number) {
    this.service.delete(id).subscribe({
      next: (data: number) => {

        if (data == 1) {
          this.getAll();
          this.status = 'the project successfully deleted';
        } else this.status = 'the project failed with backend error ';
      },
      error: (error) => ( this.status = 'the project failed with  error ' + error.toString())
    });
    this.showAlert();
  }

  public findById(id: number){
     this.service.findProjectByUserId(id).subscribe({
       next: (data) => (this.projects = data),
       error: (error) => console.log(error)
     })
  }

  public update() {
    this.itemIntialisation();
    this.service.update().subscribe({
      next: (data: number) => {
        if (data == 1) {
          this.getAll();
          this.status = 'the project successfully updated';
        } else this.status = 'the project failed with backend error '+data;
      },
      error: (error) => (this.status = 'the project failed with  error ' + error)

    });
    this.showAlert();
    this.closeModal()
  }

  public itemIntialisation(): void {
    this.item={
      ...this.item,
      projectName:this.projectForm.value.name!,
      createdAt:new Date()
    }
    console.log(this.item);
  }

  public showModal(elmt: Project): void {
    this.isEdit = true;
    this.item= {...elmt};
    this.projectForm.patchValue({
      name: this.item.projectName
    })

  }

  public closeModal() {
    this.selectedProject = null;
    this.isEdit = false;
    this.item.id= null;
  }

  showAlert() {
    document.getElementById('alert').style.display = 'block';
    setTimeout(() => {
      document.getElementById('alert').style.display = 'none';
    }, 2000);
  }

  get item(): Project {
    return this.service.item;
  }

  set item(value: Project) {
    this.service.item = value;
  }

  get items(): Array<Project> {
    return this.service.items;
  }

  set items(value: Array<Project>) {
    this.service.items = value;
  }
}
