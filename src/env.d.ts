/// <reference path="../.astro/types.d.ts" />

//
type User = {
  id: number;
  role: string;
};

declare namespace App {
  interface Locals {
    user?: User;
  }
}
