import helpers from "./helpers";
import WhereClause from "./WhereClause";

class Query {
  protected table: string;
  protected values: any[] = [];
  protected valueCount: number = 1;
  protected wheres: WhereClause[] = [];
  private resultLimit: number | null = null;

  constructor(table: string) {
    this.table = helpers.clean(table);
  }

  protected nextValue(value: any): string {
    this.values.push(value);
    return "$" + this.valueCount ++;
    // return '"$' + this.valueCount++ + '"';
  }

  protected compileWheres() {
    let result = "";
    let first = true;
    for (const where of this.wheres) {
      if (first) {
        result += " WHERE ";
        first = false;
      } else {
        result += " AND ";
      }
      result += where.toString(this.nextValue.bind(this));
    }
    return result;
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
