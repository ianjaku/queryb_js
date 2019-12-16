import SelectQuery from "./SelectQuery";
import { clean } from "./helpers";
import CountQuery from "./CountQuery";

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
    }
  }
}

export default {
  table
}
