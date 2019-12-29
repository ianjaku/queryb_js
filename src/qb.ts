import SelectQuery from "./SelectQuery";
import CountQuery from "./CountQuery";
import DeleteQuery from "./DeleteQuery";
import { clean } from "./helpers";
import { Comparator, Condition } from "./WhereClause";
import InsertQuery from "./InsertQuery";

export function table(tableName: string) {
  tableName = clean(tableName);

  return {
    select(columns: string[] = ["*"]) {
      if (columns.length !== 1 && columns[0] !== "*") {
        columns = columns.map(c => clean(c));
      }
      return new SelectQuery(tableName, columns);
    },
    count() {
      return new CountQuery(tableName);
    },
    delete() {
      return new DeleteQuery(tableName);
    },
    insert() {
      return new InsertQuery(tableName);
    }
  }
}

export function where(field: string, value: any, comparator: Comparator = "=", ignoreCase: boolean = false): Condition {
  return { field, value, comparator, ignoreCase };
}

export default {
  table,
  where
}
