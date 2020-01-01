import helpers from "./helpers";

export interface Condition {
  field: string;
  comparator: string;
  value: any | any[];
  ignoreCase?: boolean;
}

export type Comparator = "=" | ">" | "<" | "<=" | ">=" | "!=" | "NOT IN" | "IN" | "NOT LIKE" | "LIKE";

export interface Entry {
  type: "AND" | "OR" | "CONDITION";
  condition?: Condition;
  children?: Entry[];
}

/**
 * 
 * qb.table("user")
 *   .or(
 *     qb.and(
 *       qb.where("id", 1),
 *       qb.where("slug", "_slug_")
 *     )
 *   )
 * 
 */


class WhereClause {
  private entries: Entry[] = [];
  private nextValueMethod: (value: any) => string;

  constructor(nextValueMethod: (value: any) => string) {
    this.nextValueMethod = nextValueMethod;
  }

  public addWhere(field: string, value: any, comparator: string = "=", ignoreCase: boolean = false) {
    const cleanComparator = comparator.replace(/[^=><!=INLKE]+/g, "");
    field = helpers.clean(field);

    const condition = {
      field,
      comparator: cleanComparator,
      value,
      ignoreCase
    };
    this.entries.push({ type: "CONDITION", condition });
  }

  public addEntry(entry: Entry) {
    this.entries.push(entry);
  }

  public toString() {
    if (this.entries.length < 1) return "";

    let result = "";
    for (const entry of this.entries) {
      if (result != "") {
        result += " AND "
      }
      result += this.resolveEntry(entry);
    }
    console.log("Where result:", result);
    return " WHERE " + result;
  }

  public hasWheres() {
    return this.entries.length > 0;
  }

  private resolveEntry(entry: Entry) {
    if (entry.type === "CONDITION") {
      if (entry.condition == null) throw Error("A condition entry should always carry a condition key");
      const conditionString = this.resolveCondition(entry.condition);
      return conditionString;
    } else if (entry.type === "AND" || entry.type === "OR") {
      if (entry.children == null) throw Error("An AND/OR entry should always carry a children array");
      const children = entry.children;
      let andResult = "";
      for (const child of children) {
        if (andResult != "") {
          andResult += " " + entry.type + " ";
        }
        andResult += this.resolveEntry(child);
      }
      return "(" + andResult + ")";
    }
  }

  private resolveCondition(condition: Condition) {
    let value = condition.value;
    let cleanValue = "";

    if (Array.isArray(value)) {
      value = value.filter(v => v != null);
      if (value.length < 1 && condition.comparator === "IN") {
        return "FALSE";
      }
      if (value.length < 1 && condition.comparator === "NOT IN") {
        return "TRUE";
      }
      let cleanValues = value.map(this.nextValueMethod);
      if (condition.ignoreCase) {
        cleanValues = cleanValues.map((v: string) => `LOWER(${v})`);
      }
      cleanValue = "(" + cleanValues.join(",") + ")";
    } else {
      if (value == null && condition.comparator === "=") {
        return condition.field + " IS NULL";
      }
      if (value == null && condition.comparator === "!=") {
        return condition.field + " IS NOT NULL";
      }
      if (value == null) return "FALSE";
      cleanValue = this.nextValueMethod(condition.value);
    }

    if (condition.ignoreCase && !Array.isArray(value)) {
      return `LOWER(${condition.field}) ${condition.comparator} LOWER(${cleanValue})`
    } else if (condition.ignoreCase) {
      return `LOWER(${condition.field}) ${condition.comparator} ${cleanValue}`
    }

    return condition.field + " " + condition.comparator + " " + cleanValue;
  }

}

export default WhereClause;
