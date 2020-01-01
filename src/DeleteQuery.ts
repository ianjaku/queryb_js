import helpers from "./helpers";
import Query from "./Query";
import { Entry, Comparator } from "./WhereClause";

class DeleteQuery extends Query {

  constructor(table: string) {
    super(table);
  }

  public get() {
    if (this.whereClause.isEmpty()) {
      throw Error("[QueryB] Watch out! You are deleting everything in the table. If this is what you want to do, use all() instead of get().");
    }
    let query = `DELETE FROM ${this.table}`;
    query += this.compileWheres();

    return {
      query,
      values: this.values
    };
  }

  public all() {
    return {
      query: `DELETE FROM ${this.table}`,
      values: []
    }
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

}

export default DeleteQuery;
