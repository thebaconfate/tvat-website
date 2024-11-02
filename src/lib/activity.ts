export interface ActivityInterface {
  id?: number;
  name: string;
  description?: string;
  location: string;
  date: string;
}

export class Activity {
  id?: number;
  name: string;
  description?: string;
  location: string;
  date: Date;

  constructor(
    name: string,
    location: string,
    date: Date,
    description: string | undefined,
    id: number | undefined,
  ) {
    this.name = name;
    this.location = location;
    this.date = date;
    this.description = description;
    this.id = id;
  }

  fmtDate() {
    return `${this.date.getDate()}/${this.date.getMonth() + 1}`;
  }
}
