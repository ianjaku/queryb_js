'use strict';

const chai = require("chai");
const expect = chai.expect;
const assert = chai.assert;
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
  it('empty parameter list in WHERE IN clause will be replaced by FALSE', () => {
    let {query, values} = qb.table("users").select().where("id", [], "IN").get();
    expect(query).to.equal(`SELECT * FROM users WHERE FALSE`);
    expect(values.length).to.equal(0);
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
  it('should use the LOWER function when ignoreCase is true', () => {
    let {query, values} = qb.table("users").select().where("id", 1, "=", true).get();
    expect(query).to.equal(`SELECT * FROM users WHERE LOWER(id) = LOWER($1)`);
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
  it('or clause should add or clause', () => {
    const ors = [
      qb.where("first_name", "john"),
      qb.where("last_name", "doe")
    ];
    let {query, values} = qb.table("users").select().or(...ors).get();
    expect(query).to.equal(`SELECT * FROM users WHERE (first_name = $1 OR last_name = $2)`);
  });
  it('or clause follewed by another or clause should use an AND in the middle', () => {
    const or1 = [
      qb.where("last_name", "doe"),
      qb.where("last_name", "dew")
    ];
    const or2 = [
      qb.where("first_name", "john"),
      qb.where("first_name", "joan"),
    ];
    let {query, values} = qb.table("users").select().or(...or1).or(...or2).get();
    expect(query).to.equal(`SELECT * FROM users WHERE (last_name = $1 OR last_name = $2) AND (first_name = $3 OR first_name = $4)`);
    expect(values[0]).to.equal("doe");
    expect(values[1]).to.equal("dew");
    expect(values[2]).to.equal("john");
    expect(values[3]).to.equal("joan");
  });
  it('ignoreCase with or clause should add LOWER to the right fields', () => {
    const ors = [
      qb.where("first_name", "john", "=", true),
      qb.where("first_name", "joan", "=", true)
    ];
    let {query, values} = qb.table("users").select().or(...ors).get();
    expect(query).to.equal(`SELECT * FROM users WHERE (LOWER(first_name) = LOWER($1) OR LOWER(first_name) = LOWER($2))`);
    expect(values[0]).to.equal("john");
    expect(values[1]).to.equal("joan");
  });
  it('array as or parameter should be iterated over', () => {
    const ors = [
      qb.where("first_name", "john"),
      qb.where("first_name", "joan")
    ];
    let {query, values} = qb.table("users").select().or(ors).get();
    expect(query).to.equal(`SELECT * FROM users WHERE (first_name = $1 OR first_name = $2)`);
    expect(values[0]).to.equal("john");
    expect(values[1]).to.equal("joan");
  });
});

describe('count query', () => {
  it('should return a valid count query', () => {
    let {query, values} = qb.table("users").count().get();
    expect(query).to.equal(`SELECT COUNT(*) FROM users`);
  });
});

describe('delete query', () => {
  it('should return a valid delete query', () => {
    const nr = Math.floor(Math.random() * 50) + 1;
    let {query, values} = qb.table("users").delete().where("id", nr).get();
    expect(query).to.equal(`DELETE FROM users WHERE id = $1`);
    expect(values.length).to.equal(1);
    expect(values[0]).to.equal(nr);
  });
  it('using all should delete all', () => {
    let {query, values} = qb.table("users").delete().all();
    expect(query).to.equal(`DELETE FROM users`);
    expect(values.length).to.equal(0);
  });
  it('using get without a where should throw an error', () => {
    let builder = qb.table("users").delete();
    assert.throws(builder.get, Error);
  });
  it('should use the LOWER function when ignoreCase is true', () => {
    let {query, values} = qb.table("users").delete().where("id", 1, "=", true).get();
    expect(query).to.equal(`DELETE FROM users WHERE LOWER(id) = LOWER($1)`);
  });
});
