import { RoleEnum } from "./role.schema";
import type { UserData } from "./users.types";

export class User {
  constructor(private data: UserData) {}
  get email() {
    return this.data.email;
  }

  get id() {
    return this.data.id;
  }

  get role() {
    return this.data.role;
  }

  get firstName() {
    return this.data.firstName;
  }

  get lastName() {
    return this.data.lastName;
  }

  get name() {
    return this.lastName && this.lastName.length > 0
      ? this.firstName + " " + this.lastName
      : this.firstName;
  }

  isRoot(): boolean {
    return this.data.role === RoleEnum.root;
  }

  isAdmin(): boolean {
    return this.isRoot() || this.data.role === RoleEnum.admin;
  }
}
