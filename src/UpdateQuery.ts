import helpers from "./helpers";
import Query from "./Query";
import { Entry, Comparator } from "./WhereClause";

class UpdateQuery extends Query {
  private updateValues: any = {};

  constructor(table: string) {
    super(table);
  }

  public obj(values: any) {
    for (const key in values) {
      this.updateValues[key] = values[key];
    }
    return this;
  }

  public set(key: string, value: any) {
    this.updateValues[key] = value;
    return this;
  }

  public where(field: string, value: any, comparator: Comparator = "=", ignoreCase: boolean = false) {
    this.whereClause.addWhere(field, value, comparator, ignoreCase);
    return this;
  }

  public or(...entries: Entry[]) {
    this.whereClause.addEntry({
      type: "OR",
      children: entries
    });
    return this;
  }

  public and(...entries: Entry[]) {
    this.whereClause.addEntry({
      type: "AND",
      children: entries
    });
  }

  public get() {
    let first = true;
    let query = `UPDATE ${this.table} `;

    for (const updateKey in this.updateValues) {
      const value = this.updateValues[updateKey];
      if (first) {
        query += "SET ";
        first = false;
      } else {
        query += ", ";
      }
      query += helpers.clean(updateKey) + " = " + this.nextValue(value);
    }

    query += this.compileWheres();

    return {
      query,
      values: this.values
    };
  }

}

export default UpdateQuery;
