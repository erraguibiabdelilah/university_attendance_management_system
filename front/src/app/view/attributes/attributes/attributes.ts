import { Component, inject } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EntityDefinition } from '../../../shared/models/entity-definition';
import { User } from '../../../shared/models/user';
import { EntityService } from '../../../shared/services/entity-service';
import { AttributeService } from '../../../shared/services/attribute-service';
import { ProjectService } from '../../../shared/services/project-service';
import { Project } from '../../../shared/models/project.model';
import { AttributeType } from '../../../shared/models/attribute-type';
import { AttributeDefinition } from '../../../shared/models/attribute.model';
@Component({
  selector: 'app-attributes',
  imports: [DatePipe, ReactiveFormsModule, NgClass],
  templateUrl: './attributes.html',
  styleUrl: './attributes.scss'
})
export class Attributes {
  public entitys: Array<EntityDefinition> = new Array<EntityDefinition>();
  public projects: Array<Project> = new Array<Project>();
  public attributs: Array<AttributeDefinition> = new Array<AttributeDefinition>();
  public status: string = '';
  public actuelUser: User = new User();
  public entity: EntityDefinition = new EntityDefinition();
  public isEdit = false;
  public selectedEntity: EntityDefinition = new EntityDefinition();
  public attributeTypes = Object.values(AttributeType);
  private entityService = inject(EntityService);
  private service = inject(AttributeService);
  private projectService = inject(ProjectService);
  attributeForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    type: new FormControl(null, [Validators.required]),
    required: new FormControl(false, Validators.required),
    length: new FormControl(0, Validators.required),
    uniqueField: new FormControl(false, Validators.required),
    defaultValue: new FormControl('', Validators.required),
    enumValues: new FormControl(null, Validators.required)
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
  /*
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
*/
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
      name: this.attributeForm.value.name!,
      type: this.attributeForm.value.type!,
      required: this.attributeForm.value.required!,
      length: this.attributeForm.value.length,
      uniqueField: this.attributeForm.value.uniqueField,
      defaultValue: this.attributeForm.value.defaultValue,
      enumValues: this.attributeForm.value.enumValues
    };
    console.log(JSON.stringify(this.item));
  }

  /*
  public showModal(): void {
    this.isEdit = true;
    this.entityForm.patchValue({
    });
  }*/

  public closeModal() {
    this.selectedEntity = null;
    this.isEdit = false;
    this.item = null;
    this.ressetForm();
  }

  showAlert() {
    document.getElementById('alert').style.display = 'block';
    setTimeout(() => {
      document.getElementById('alert').style.display = 'none';
    }, 2000);
  }

  public ressetForm() {
    this.attributeForm.reset();
  }

  get item(): AttributeDefinition {
    return this.service.item;
  }

  set item(value: AttributeDefinition) {
    this.service.item = value;
  }

  get items(): Array<AttributeDefinition> {
    return this.service.items;
  }

  set items(value: Array<AttributeDefinition>) {
    this.service.items = value;
  }
}
