import { AttributeType } from './attribute-type';

export class AttributeDefinition {
  id?: number;
  name?: string='';
  type: AttributeType;
  required?: boolean;
  length?: number;
  uniqueField?: boolean;
  defaultValue?: string;
  enumValues?: string[];
  entity_id?:number;
  constructor() {
  }

}
