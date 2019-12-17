import helpers from "./helpers";

interface Where {
  field: string;
  comparator: string;
  value: any | any[];
}

class Query {
  protected table: string;
  protected values: any[] = [];
  protected valueCount: number = 1;
  private wheres: Where[] = [];
  private resultLimit: number | null = null;

  constructor(table: string) {
    this.table = helpers.clean(table);
  }

  protected nextValue(value: any): string {
    this.values.push(value);
    return '"$' + this.valueCount++ + '"';
  }

  protected addWhere(field: string, value: any, comparator: "=" | ">" | "<" | "<=" | ">=" | "!=" | "IN" | "LIKE" = "=") {
    const cleanComparator = comparator.replace(/[^=><!=INLKE]+/g, "");
    
    field = helpers.clean(field);

    this.wheres.push({
      field,
      comparator: cleanComparator,
      value
    });
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
      let cleanValue = where.value;
      if (Array.isArray(where.value)) {
        let newValue = "(";
        for (const item of where.value) {
          if (newValue !== "(") {
            newValue += ",";
          }
          newValue += this.nextValue(item);
        }
        cleanValue = newValue + ")";
      } else {
        cleanValue = this.nextValue(where.value);
      }
      result += where.field + " " + where.comparator + " " + cleanValue;
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
