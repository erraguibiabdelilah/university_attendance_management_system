import { User } from './user';
import { EntityDefinition } from './entity-definition';

export class Project {
  public id: number;
  public projectName!: string;
  public createdAt?: Date;
  public user!: User;
  public entitys: Array<EntityDefinition>;

  constructor() {}
}
