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

You can also add where clauses.

```js
const {query, values} = qb.table("users")
                          .select()
                          .where("company_name", "invacto").get();
// query: SELECT * FROM users WHERE company_name=$1
// values: ["invacto"]
```

By default where clauses use the "=" comparator.
All supporter comparators are:

- =
- \>
- <
- \>=
- <=
- !=
- IN
- NOT IN
- LIKE
- NOT LIKE

You can enter a comparator as the third parameter to a where function.


```js
const {query, values} = qb.table("users")
                          .select()
                          .where("id", 5, "<").get();

// query: SELECT * FROM users WHERE id < $1
// values: [5]
```

To add alternatives use the or(...conditions) function

```js
const {query, values} = qb.table("users")
                          .select()
                          .or(
                            qb.where("id", 5, "="),
                            qb.where("id", 6, "="))
                          .get();
                          
// query: SELECT * FROM users WHERE (id = $1 OR id = $2)
// values: [5, 6]
```

You can also chain ors & ands like so

```js
const {query, values} = qb.table("users")
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
// query: SELECT * FROM users WHERE ((first_name = $1 AND last_name = $2) OR (first_name = $3 AND last_name = $4))
// values: ["john", "doe", "jona", "dona"]
```

You can make a where clause case insensitive by using the fourth parameter of the where clause

```js
const {query, values} = qb.table("users")
                          .select()
                          .where("slug", "hello_world", "=", true)
                          .get();
                          
// query: SELECT * FROM users WHERE slug = LOWER($1)
// values: ["hello_world"]
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

### Delete

Use the delete and where methods to create a delete query

```js
const {query, values} = qb.table("users").delete().where("id", 1).get();

// query: DELETE FROM users WHERE id = $1
// values: [1]
```

You can make a where clause case insensitive by using the fourth parameter of the where clause

```js
const {query, values} = qb.table("users")
                          .select()
                          .where("slug", "hello_world", "=", true)
                          .get();
                          
// query: SELECT * FROM users WHERE slug = LOWER($1)
// values: ["hello_world"]
```

As a safety precaution it is not possible to delete all data in a table using the regular methods.
If it is your intention to delete all data in a table, use the "all" method instead of the "get" method.

```js
const {query, values} = qb.table("users").delete().all();

// query: DELETE FROM users
// values: []
```

### Insert

There are 2 ways to add key/value pairs to an insert query.

1. By using the set(key, value) method

```js
const {query, values} = qb.table("users").insert().set("id", 1).set("name", "john").get()

// query: INSERT INTO users (id,name) VALUES ($1,$2)
// values: [1, "john"]
```

2. By using the obj(object) method

```js
const {query, values} = qb.table("users").insert().obj({id: 1, name: "john").get()

// query: INSERT INTO users (id,name) VALUES ($1,$2)
// values: [1, "john"]
```

As many or as few key/value paris can be added
