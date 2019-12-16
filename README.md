# Simple javascript query builder

## installation

```
npm i queryb
```

Typescript support is included in the package

## Usage

The return of the query builder will always be an object of a query and values.
The positions of the values in the query will be assigned by $1 where 1 is the nth+1 position in the values list.

Example:

```js
const {query, values} = qb.table("users").where({foo: "foovalue", bar: "barvalue"}).get();

// query: SELECT * FROM users WHERE foo=$1 AND bar=$2
// values: ["foovalue", "barvalue"] 
```

Every query also ends with the "get()" function.
This function takes all given parameters and compiles them into a single query.

### Select

```js
const qb = require("queryb");

const {query, values} = qb.table("users").select().get();

// query: SELECT * FROM users
// values: []
```

The select method also accepts select fields.
These fields will be cleaned to only contain characters in the regex [0-9,a-z,A-Z$_].

```js
const {query, values} = qb.table("users").select(["id", "email"]).get();

// query: SELECT id, email FROM users
// values: []
```

You can also add where clauses

```js
const {query, values} = qb.table("users")
                          .select()
                          .where({
                            company_name: "invacto"
                          }).get();
// query: SELECT * FROM users WHERE company_name=$1
// values: ["invacto"]
```

You can add a limit to the result with the limit() function.

```js
const {query, values} = qb.table("users").select().limit(1).get();

// query: SELECT * FROM users LIMIT $1
// values: [1]
```

In the same way you can add an offset

```js
const {query, values} = qb.table("users").select().offset(1).get();

// query: SELECT * FROM users OFFSET $1
// values: [1]
```

### Count

A count query is rather simple.

```js
const {query, values} = qb.table("users").count().get();

// query: SELECT COUNT(*) FROM users
// values: []
```
