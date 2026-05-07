import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EntityDefinition } from '../../../../shared/models/entity-definition';
import { EntityService } from '../../../../shared/services/entity-service';
import { DatePipe, NgClass } from '@angular/common';
import { Project } from '../../../../shared/models/project.model';
import { ProjectService } from '../../../../shared/services/project-service';

import { User } from '../../../../shared/models/user';



@Component({
  selector: 'app-entitys',
  imports: [ReactiveFormsModule, NgClass, DatePipe],
  templateUrl: './entitys.html',
  styleUrl: './entitys.scss'
})
export class Entitys {
  public entitys: Array<EntityDefinition> = new Array<EntityDefinition>();
  public projects: Array<Project> = new Array<Project>();
  public status: string = '';
  public actuelUser: User = new User();
  public entity: EntityDefinition = new EntityDefinition();
  public isEdit = false;
  public selectedEntity: EntityDefinition = new EntityDefinition();

  private service = inject(EntityService);
  private projectService = inject(ProjectService);

  entityForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.min(2)]),
    project: new FormControl(null, [Validators.required])
  });

  ngOnInit() {
    this.getProjectsByUserId();
  }

  public getAll(): void {
    const storageUser = JSON.parse(localStorage.getItem('user') || '{}');
    this.projectService.findProjectByUserId(Number(storageUser.id)).subscribe({
      next: (data) => (this.projects = data),
      error: (error) => console.log(error)
    });
  }

  public save() {
    this.itemIntialisation();
    this.service.save().subscribe({
      next: (data: number) => {
        if (data == 1) {
          this.getAll();
          this.status = 'the entity successfully added';
        } else this.status = `the entity failed with backend error ,${data.toString()}`;
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
      error: (error) => (this.status = 'the project failed with  error ' + error.toString())
    });
    this.showAlert();
  }

  public update() {
    this.itemIntialisation();
    this.service.update().subscribe({
      next: (data: number) => {
        if (data == 1) {
          this.getProjectsByUserId();
          this.status = 'the project successfully updated';
        } else this.status = 'the project failed with backend error ' + data;
      },
      error: (error) => (this.status = 'the project failed with  error ' + error)
    });
    this.showAlert();
    this.closeModal();
  }

  public getProjectsByUserId() {
    const storageUser = JSON.parse(localStorage.getItem('user') || '{}');
    this.projectService.findProjectByUserId(Number(storageUser.id)).subscribe({
      next: (data) => {
        this.projects = data;
        console.log("la liste des project associer à l'user ", this.projects);
      },
      error: (error) => console.log('error lors de chagrment des project of connect User' + error)
    });
  }

  public itemIntialisation(): void {
    this.item = {
      ...this.item,
      entityName: this.entityForm.value.name!,
      project_id: this.entityForm.value.project!
    };
    console.log(JSON.stringify(this.item));
  }

  public showModal(elmt: EntityDefinition): void {
    this.isEdit = true;
    this.item = { ...elmt };
    this.entityForm.patchValue({
      name: this.item.entityName,
      project: elmt.project_id
    });

  }

  public closeModal() {
    this.selectedEntity = null;
    this.isEdit = false;
    this.item=null;
    this.ressetForm();

  }

  showAlert() {
    document.getElementById('alert').style.display = 'block';
    setTimeout(() => {
      document.getElementById('alert').style.display = 'none';
    }, 2000);
  }

  public ressetForm(){
    this.entityForm.reset();
}

  get item(): EntityDefinition {
    return this.service.item;
  }

  set item(value: EntityDefinition) {
    this.service.item = value;
  }

  get items(): Array<EntityDefinition> {
    return this.service.items;
  }

  set items(value: Array<EntityDefinition>) {
    this.service.items = value;
  }
}
