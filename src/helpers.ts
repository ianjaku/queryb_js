
export function clean(value: string) {
  return value.replace(/[^0-9,a-z,A-Z$_ ]+/g, "");
}

export function encapsulateColumn(columnName: string) {
  if (columnName === "*") {
    return "*";
  }
  return `"${columnName}"`;
}

export function encapsulateColumns(columnNames: string[]) {
  return columnNames.map(cn => encapsulateColumn(cn));
}

export default {
  clean,
  encapsulateColumn,
  encapsulateColumns
}