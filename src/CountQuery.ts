import helpers from "./helpers";
import Query from "./Query";
import { Entry, Comparator } from "./WhereClause";

class CountQuery extends Query {

  constructor(table: string) {
    super(table);
  }

  public get() {
    let query = `SELECT COUNT(*) FROM ${this.table}`;
    query += this.compileWheres();

    return {
      query,
      values: this.values
    };
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

export default CountQuery;
