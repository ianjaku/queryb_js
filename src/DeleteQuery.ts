import helpers from "./helpers";
import Query from "./Query";
import WhereClause, { Condition, Comparator } from "./WhereClause";

class DeleteQuery extends Query {

  constructor(table: string) {
    super(table);
  }

  public get() {
    if (this.wheres.length < 1) {
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
    const whereClause = new WhereClause();
    whereClause.addWhere(field, value, comparator, ignoreCase);
    this.wheres.push(whereClause);
    return this;
  }

  public or(...conditions: Condition[]) {
    const whereClause = new WhereClause();
    conditions.forEach(c => whereClause.addWhere(c.field, c.value, c.comparator));
    this.wheres.push(whereClause);
    return this;
  }

}

export default DeleteQuery;
