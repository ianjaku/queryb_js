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
  it('parameter list with only null in WHERE IN clause will be replaced by FALSE', () => {
    let {query, values} = qb.table("users").select().where("id", [null], "IN").get();
    expect(query).to.equal(`SELECT * FROM users WHERE FALSE`);
    expect(values.length).to.equal(0);
  });
  it('where = clause with null value will be replaced by IS NULL', () => {
    let {query, values} = qb.table("users").select().where("id", null, "=").get();
    expect(query).to.equal(`SELECT * FROM users WHERE id IS NULL`);
    expect(values.length).to.equal(0);
  });
  it('where != clause with null value will be replaced by IS NOT NULL', () => {
    let {query, values} = qb.table("users").select().where("id", null, "!=").get();
    expect(query).to.equal(`SELECT * FROM users WHERE id IS NOT NULL`);
    expect(values.length).to.equal(0);
  });
  it('where any but = and != clause with null value will be replaced by FALSE', () => {
    let {query, values} = qb.table("users").select().where("id", null, ">").get();
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
  it('or clause with nested add clause', () => {
    let {query, values} = 
      qb.table("users")
        .select()
        .or(
          qb.and(
            qb.where("first_name", "john"),
            qb.where("last_name", "doe")
          ),
          qb.and(
            qb.where("first_name", "jona"),
            qb.where("last_name", "dona")
          )
        )
        .get();
    expect(query).to.equal(`SELECT * FROM users WHERE ((first_name = $1 AND last_name = $2) OR (first_name = $3 AND last_name = $4))`);
    expect(values[0]).to.equal("john");
    expect(values[1]).to.equal("doe");
    expect(values[2]).to.equal("jona");
    expect(values[3]).to.equal("dona");
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
  it('or clause follewed by another or clause should use an AND in the middle', () => {
    let {query, values} = 
      qb.table("users")
        .select()
        .or(
          qb.and(
            qb.where("id", 1)
          )
        )
        .get();

    expect(query).to.equal(`SELECT * FROM users WHERE ((id = $1))`);
    expect(values[0]).to.equal(1);
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
  it('should correctly display a single order by value', () => {
    let {query, values} = qb.table("users").select().orderBy("id").get();
    expect(query).to.equal(`SELECT * FROM users ORDER BY id`);
  });
  it('should correctly display multiple order by values', () => {
    let {query, values} = qb.table("users").select().orderBy("id", "username").get();
    expect(query).to.equal(`SELECT * FROM users ORDER BY id,username`);
  });
  it('should correctly display multiple order by values and a DESC', () => {
    let {query, values} = qb.table("users").select().orderBy("id DESC", "username").get();
    expect(query).to.equal(`SELECT * FROM users ORDER BY id DESC,username`);
  });
  it('order by should be printed before OFFSET', () => {
    let {query, values} = qb.table("users").select().offset(0).orderBy("id").get();
    expect(query).to.equal(`SELECT * FROM users ORDER BY id OFFSET $1`);
  });
});

describe('count query', () => {
  it('should return a valid count query', () => {
    let {query, values} = qb.table("users").count().get();
    expect(query).to.equal(`SELECT COUNT(*) FROM users`);
  });
  it('where = clause with null value will be replaced by IS NULL', () => {
    let {query, values} = qb.table("users").count().where("id", null, "=").get();
    expect(query).to.equal(`SELECT COUNT(*) FROM users WHERE id IS NULL`);
    expect(values.length).to.equal(0);
  });
  it('where != clause with null value will be replaced by IS NOT NULL', () => {
    let {query, values} = qb.table("users").count().where("id", null, "!=").get();
    expect(query).to.equal(`SELECT COUNT(*) FROM users WHERE id IS NOT NULL`);
    expect(values.length).to.equal(0);
  });
  it('where any but = and != clause with null value will be replaced by FALSE', () => {
    let {query, values} = qb.table("users").count().where("id", null, ">").get();
    expect(query).to.equal(`SELECT COUNT(*) FROM users WHERE FALSE`);
    expect(values.length).to.equal(0);
  });
  it('should show multiple where clauses when multiple where clauses are added', () => {
    let {query, values} = qb.table("users").count().where("id", 1).where("first_name", "ian").get();
    expect(query).to.equal(`SELECT COUNT(*) FROM users WHERE id = $1 AND first_name = $2`);
    expect(values.length).to.equal(2);
    expect(values[0]).to.equal(1);
    expect(values[1]).to.equal("ian");
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
  it('nested entries with a single value should still compile correctly', () => {
    let {query, values} = 
      qb.table("users")
        .delete()
        .or(
          qb.and(
            qb.where("id", 1)
          )
        )
        .get();

    expect(query).to.equal(`DELETE FROM users WHERE ((id = $1))`);
    expect(values[0]).to.equal(1);
  });
});

describe('insert query', () => {
  it('using a single set', () => {
    let {query, values} = qb.table("users").insert().set("id", 1).get();
    expect(query).to.equal(`INSERT INTO users (id) VALUES ($1)`);
    expect(values.length).to.equal(1);
    expect(values[0]).to.equal(1);
  });
  it('using multiple set calls', () => {
    let {query, values} = qb.table("users").insert().set("id", 1).set("name", "john").get();
    expect(query).to.equal(`INSERT INTO users (id,name) VALUES ($1,$2)`);
    expect(values.length).to.equal(2);
    expect(values[0]).to.equal(1);
    expect(values[1]).to.equal("john");
  });
  it('using a single obj call', () => {
    let {query, values} = qb.table("users").insert().obj({ id: 1, name: "john"}).get();
    expect(query).to.equal(`INSERT INTO users (id,name) VALUES ($1,$2)`);
    expect(values.length).to.equal(2);
    expect(values[0]).to.equal(1);
    expect(values[1]).to.equal("john");
  });
  it('using multiple obj calls', () => {
    let {query, values} = qb.table("users").insert().obj({ id: 1, name: "john"}).obj({ company: "mcshit" }).get();
    expect(query).to.equal(`INSERT INTO users (id,name,company) VALUES ($1,$2,$3)`);
    expect(values.length).to.equal(3);
    expect(values[0]).to.equal(1);
    expect(values[1]).to.equal("john");
    expect(values[2]).to.equal("mcshit");
  });
});
