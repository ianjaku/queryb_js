import helpers from "./helpers";
import Query from "./Query";
import WhereClause, { Condition, Comparator } from "./WhereClause";

class SelectQuery extends Query {
  private columns: string[];
  private offsetValue: number | null = null;
  private orderByValues: string[] = [];

  constructor(table: string, columns: string[]) {
    super(table);
    this.columns = columns;
  }

  public get() {
    let query = `SELECT ${this.columns.join(",")} FROM ${this.table}`;
    query += this.compileWheres();

    if (this.orderByValues.length > 0) {
      query += " ORDER BY " + this.orderByValues.join(",");
    }
    
    query += this.compileLimit();

    if (this.offsetValue != null) {
      query += " OFFSET " + this.nextValue(this.offsetValue);
    }

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

  public limit(limit: number) {
    this.setLimit(limit);
    return this;
  }

  public offset(offset: number) {
    this.offsetValue = offset;
    return this;
  }

  public orderBy(...columnNames: string[]) {
    const cleanColumnNames = columnNames.map(helpers.clean);
    this.orderByValues.push(...cleanColumnNames);
    return this;
  }

}

export default SelectQuery;
