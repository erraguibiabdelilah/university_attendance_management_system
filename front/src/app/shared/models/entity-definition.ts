import { Attributes } from '../../view/attributes/attributes/attributes';

export class EntityDefinition {
  public id?: number;
  public entityName: string;
  public project_id: number;
  public attributes: Array<Attributes>;
}
