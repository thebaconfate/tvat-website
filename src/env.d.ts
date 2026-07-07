/// <reference path="../.astro/types.d.ts" />
//
type User = {
  id: number;
  name: string;
};

declare namespace App {
  interface Locals {
    message: string;
  }
}

