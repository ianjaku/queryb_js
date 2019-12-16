import helpers from "./helpers";
import Query from "./Query";

class CountQuery extends Query {
  private offsetValue: number | null = null;

  constructor(table: string) {
    super(table);
  }

  public get() {
    let query = `SELECT COUNT(*) FROM ${this.table}`;

    return {
      query,
      values: this.values
    };
  }

}

export default CountQuery;
