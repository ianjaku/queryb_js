import helpers from "./helpers";
import WhereClause from "./WhereClause";

class Query {
  protected table: string;
  protected values: any[] = [];
  protected valueCount: number = 1;
  protected whereClause: WhereClause;
  private resultLimit: number | null = null;

  constructor(table: string) {
    this.table = helpers.clean(table);
    this.whereClause = new WhereClause(this.nextValue.bind(this));
  }

  protected nextValue(value: any): string {
    this.values.push(value);
    return "$" + this.valueCount ++;
  }

  protected compileWheres() {
    return this.whereClause.toString();
  }

  protected setLimit(limit: number) {
    this.resultLimit = limit;
  }

  protected compileLimit() {
    if (this.resultLimit == null) {
      return "";
    }
    return " LIMIT " + this.nextValue(this.resultLimit);
  }
}

export default Query;
