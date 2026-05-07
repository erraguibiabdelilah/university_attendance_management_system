export class User {
  public id:number ;
  public firstName:string;
  public lastName:string;
  public promo :string;
  public username: string;
  public password: string;
  public enabled: boolean = true;
  public credentialsNonExpired: boolean = true;
  public accountNonLocked: boolean = true;
  public accountNonExpired: boolean = true;
  public role: string;
  public encoding : string[];

  constructor() {
  }
}
