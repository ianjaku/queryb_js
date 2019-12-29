import helpers from "./helpers";
import Query from "./Query";

class InsertQuery extends Query {
  private insertValues: any = {};

  constructor(table: string) {
    super(table);
  }

  public obj(values: any) {
    for (const key in values) {
      this.insertValues[key] = values[key];
    }
    return this;
  }

  public set(key: string, value: any) {
    this.insertValues[key] = value;
    return this;
  }

  public get() {
    let first = true;
    let query = `INSERT INTO ${this.table} `;

    query += "(";
    for (const key in this.insertValues) {
      if (!first) {
        query += ",";
      } else {
        first = false;
      }
      query += helpers.clean(key)
    }
    query += ") VALUES (";
    first = true;
    for (const key in this.insertValues) {
      if (!first) {
        query += ",";
      } else {
        first = false;
      }
      query += this.nextValue(this.insertValues[key]);
    }
    query += ")";

    return {
      query,
      values: this.values
    };
  }

}

export default InsertQuery;
