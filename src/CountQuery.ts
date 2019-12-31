import helpers from "./helpers";
import Query from "./Query";
import WhereClause, { Condition, Comparator } from "./WhereClause";

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
    const whereClause = new WhereClause();
    whereClause.addWhere(field, value, comparator, ignoreCase);
    this.wheres.push(whereClause);
    return this;
  }

  public or(...conditions: Condition[]) {
    const whereClause = new WhereClause();
    conditions.forEach(c => {
      if (Array.isArray(c)) {
        c.forEach(c => whereClause.addWhere(c.field, c.value, c.comparator, c.ignoreCase));
      } else {
        whereClause.addWhere(c.field, c.value, c.comparator, c.ignoreCase)
      }
    });
    this.wheres.push(whereClause);
    return this;
  }

}

export default CountQuery;
