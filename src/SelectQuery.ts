import helpers from "./helpers";
import Query from "./Query";

class SelectQuery extends Query {
  private columns: string[];
  private offsetValue: number | null = null;

  constructor(table: string, columns: string[]) {
    super(table);
    this.columns = columns;
  }

  public get() {
    let query = `SELECT ${this.columns.join(",")} FROM ${this.table}`;
    query += this.compileWheres();
    query += this.compileLimit();

    if (this.offsetValue != null) {
      query += " OFFSET " + this.nextValue(this.offsetValue);
    }

    return {
      query,
      values: this.values
    };
  }

  public where(field: string, value: any, comparator: "=" | ">" | "<" | "!=" | "IN" = "=") {
    this.addWhere(field, value, comparator);
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

}

export default SelectQuery;
