import helpers from "./helpers";

export interface Condition {
  field: string;
  comparator: string;
  value: any | any[];
}

export type Comparator = "=" | ">" | "<" | "<=" | ">=" | "!=" | "IN" | "LIKE";

class WhereClause {
  private conditions: Condition[] = []; // OR CONDITIONS

  public addWhere(field: string, value: any, comparator: string = "=") {
    const cleanComparator = comparator.replace(/[^=><!=INLKE]+/g, "");
    
    field = helpers.clean(field);

    this.conditions.push({
      field,
      comparator: cleanComparator,
      value
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
      if (Array.isArray(condition.value)) {
        let newValue = "(";
        for (const item of condition.value) {
          if (newValue !== "(") {
            newValue += ",";
          }
          newValue += nextValueMethod(item);
        }
        cleanValue = newValue + ")";
      } else {
        cleanValue = nextValueMethod(condition.value);
      }
      result += condition.field + " " + condition.comparator + " " + cleanValue;
    }
    if (this.conditions.length > 1) result += ")";
    return result;
  }

}

export default WhereClause;