import SelectQuery from "./SelectQuery";
import CountQuery from "./CountQuery";
import DeleteQuery from "./DeleteQuery";
import { clean } from "./helpers";
import InsertQuery from "./InsertQuery";
import { Entry, Comparator } from "./WhereClause";
import UpdateQuery from "./UpdateQuery";

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
    },
    update() {
      return new UpdateQuery(tableName);
    }
  }
}

export function where(field: string, value: any, comparator: Comparator = "=", ignoreCase: boolean = false): Entry {
  const condition = { field, value, comparator, ignoreCase };
  return { type: "CONDITION", condition }
}

export function and(...entries: Entry[]): Entry {
  return {
    type: "AND",
    children: entries
  }
}

export function or(...entries: Entry[]): Entry {
  return {
    type: "OR",
    children: entries
  }
}

export default {
  table,
  where,
  and,
  or
}
