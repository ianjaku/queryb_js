import helpers from "./helpers";

export interface Condition {
  field: string;
  comparator: string;
  value: any | any[];
  ignoreCase?: boolean;
}

export type Comparator = "=" | ">" | "<" | "<=" | ">=" | "!=" | "NOT IN" | "IN" | "NOT LIKE" | "LIKE";

class WhereClause {
  private conditions: Condition[] = []; // OR CONDITIONS

  public addWhere(field: string, value: any, comparator: string = "=", ignoreCase: boolean = false) {
    const cleanComparator = comparator.replace(/[^=><!=INLKE]+/g, "");
    
    field = helpers.clean(field);

    this.conditions.push({
      field,
      comparator: cleanComparator,
      value,
      ignoreCase
    });
  }

  public toString(nextValueMethod: (value: any) => string) {
    let result = "";
    if (this.conditions.length > 1) result += "(";
    let first = true;
    for (const condition of this.conditions) {
      if (!first) {
        result += " OR ";
      }
      first = false;
      let cleanValue = condition.value;
      if (condition.value == null) {
        if (condition.comparator === "=") {
          result += condition.field + " IS NULL";
        } else if (condition.comparator === "!=") {
          result += condition.field + " IS NOT NULL";
        } else {
          result += "FALSE"
        }
        continue;
      }
      if (Array.isArray(condition.value)) {
        if (condition.value.length < 1 || condition.value.filter(v => v != null).length < 1) {
          result += "FALSE";
          continue;
        }
        let newValue = "(";
        for (const item of condition.value) {
          if (item == null) continue;
          if (newValue !== "(") {
            newValue += ",";
          }
          if (condition.ignoreCase) {
            newValue += "LOWER(" + nextValueMethod(item) + ")";
          } else {
            newValue += nextValueMethod(item);
          }
        }
        cleanValue = newValue + ")";
      } else {
        if (condition.ignoreCase) {
          cleanValue = "LOWER(" + nextValueMethod(condition.value) + ")";
        } else {
          cleanValue = nextValueMethod(condition.value);
        }
      }
      if (condition.ignoreCase) {
        result += "LOWER(" + condition.field + ")";
      } else {
        result += condition.field;
      }
      result += " " + condition.comparator + " " + cleanValue;
    }
    if (this.conditions.length > 1) result += ")";
    return result;
  }

}

export default WhereClause;