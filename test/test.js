'use strict';

const expect = require("chai").expect;
const qb = require("../dist/qb.js");

describe('select query', () => {
  it('should return a * with empty parameters', () => {
    let {query, values} = qb.table("users").select().get();
    expect(query).to.equal("SELECT * FROM users")
  });
  it('should return a comma separated fieldslist when fields are given', () => {
    let {query, values} = qb.table("users").select(["id", "first_name"]).get();
    expect(query).to.equal("SELECT id,first_name FROM users")
  });
  it('should show single where clause when a single where clause is added', () => {
    let {query, values} = qb.table("users").select().where("id", 1).get();
    expect(query).to.equal(`SELECT * FROM users WHERE id = $1`);
    expect(values.length).to.equal(1);
    expect(values[0]).to.equal(1);
  });
  it('should show multiple where clauses when multiple where clauses are added', () => {
    let {query, values} = qb.table("users").select().where("id", 1).where("first_name", "ian").get();
    expect(query).to.equal(`SELECT * FROM users WHERE id = $1 AND first_name = $2`);
    expect(values.length).to.equal(2);
    expect(values[0]).to.equal(1);
    expect(values[1]).to.equal("ian");
  });
  it('should show the not equals comparator when given', () => {
    let {query, values} = qb.table("users").select().where("id", 1, ">").get();
    expect(query).to.equal(`SELECT * FROM users WHERE id > $1`);
  });
  it('should stringify the list when an array is given as a where clause', () => {
    let {query, values} = qb.table("users").select().where("id", [1, 2], "IN").get();
    expect(query).to.equal(`SELECT * FROM users WHERE id IN ($1,$2)`);
  });
  it('should add a limit when given', () => {
    const nr = Math.floor(Math.random() * 50) + 1;
    let {query, values} = qb.table("users").select().limit(nr).get();
    expect(query).to.equal(`SELECT * FROM users LIMIT $1`);
    expect(values[0]).to.equal(nr);
  });
  it('should add a limit at the end when a limit and where clause are given', () => {
    const id = Math.floor(Math.random() * 50) + 1;
    const nr = Math.floor(Math.random() * 50) + 1;
    let {query, values} = qb.table("users").select().limit(nr).where("id", id).get();
    expect(query).to.equal(`SELECT * FROM users WHERE id = $1 LIMIT $2`);
    expect(values[0]).to.equal(id);
    expect(values[1]).to.equal(nr);
  });
  it('should add an offset when given', () => {
    const nr = Math.floor(Math.random() * 50) + 1;
    let {query, values} = qb.table("users").select().offset(nr).get();
    expect(query).to.equal(`SELECT * FROM users OFFSET $1`);
    expect(values[0]).to.equal(nr);
  });
});

describe('count query', () => {
  it('should return a valid count query', () => {
    let {query, values} = qb.table("users").count().get();
    expect(query).to.equal(`SELECT COUNT(*) FROM users`);
  });
});
