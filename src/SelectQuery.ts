import helpers from "./helpers";
import Query from "./Query";
import { Entry, Comparator } from "./WhereClause";

class SelectQuery extends Query {
  private columns: string[];
  private offsetValue: number | null = null;
  private orderByValues: string[] = [];

  constructor(table: string, columns: string[]) {
    super(table);
    this.columns = columns;
  }

  public get() {
    let query = `SELECT ${helpers.encapsulateColumns(this.columns).join(",")} FROM ${this.table}`;
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
