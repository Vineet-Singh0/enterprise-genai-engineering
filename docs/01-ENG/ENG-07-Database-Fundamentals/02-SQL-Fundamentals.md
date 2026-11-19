# SQL Fundamentals

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain what SQL is and how it interacts with a relational database.
- Distinguish data definition, data manipulation, querying, and transaction control operations.
- Write SQL queries to retrieve, filter, sort, and limit records.
- Combine conditions using logical operators.
- Use aggregate functions and grouping to summarize data.
- Understand how joins combine related data from multiple tables.
- Insert, update, and delete records safely.
- Recognize how `NULL` affects comparisons and query results.
- Explain the difference between SQL's declarative approach and procedural application code.
- Identify common SQL mistakes and apply safer querying practices.

## Prerequisites

**Primary prerequisite:** [ENG-02 — Programming Foundations](../ENG-02-Programming-Foundations/README.md)

**Previous chapter:** [Relational Databases](01-Relational-Databases.md)

You should understand tables, rows, columns, and relationships between tables.

**Estimated reading time:** 45–60 minutes.

**SQL dialect used:** PostgreSQL-compatible SQL unless stated otherwise. Many examples are standard SQL, but syntax and behavior can vary between database systems.

---

## 1. Before We Start: Why SQL Exists

In the previous chapter, we established that relational databases organize related data into tables.

Consider a `users` table containing thousands of application users.

Your application might need to answer questions such as:

- Which users live in Pune?
- Which users are older than 25?
- How many users live in each city?
- Which users have not completed their profiles?
- Which user has viewed a particular profile?
- How should a user's city be updated?
- Which users have no corresponding preference record?

You could retrieve every row into Python and perform these operations using loops and collections.

However, this approach becomes inefficient and difficult to maintain when datasets grow. It can also transfer unnecessary data from the database to the application.

SQL provides a way to describe the data operation you want the database to perform.

For example:

```sql
SELECT user_id, name, city
FROM users
WHERE city = 'Pune';
```

This statement requests only the identifiers, names, and cities of users whose city is Pune.

You describe the desired result rather than manually specifying every low-level step used to find the matching records.

This is called a **declarative approach**.

The database remains responsible for determining how to execute the request.

---

## 2. What Is SQL?

**SQL (Structured Query Language)** is a language used to define, query, and manipulate data in relational database systems.

SQL allows applications and database users to express operations such as:

- Creating tables and other database objects.
- Retrieving data.
- Inserting records.
- Updating existing records.
- Deleting records.
- Defining integrity constraints.
- Managing transactions.

SQL is not a general-purpose programming language in the same sense as Python or Java.

It is primarily designed to express operations on relational data.

### 2.1 SQL versus a DBMS

These concepts serve different purposes.

| Concept | Responsibility |
|---|---|
| SQL | Expresses database operations |
| DBMS | Processes database operations and manages data |
| Database schema | Defines database structures |
| Application code | Implements application behavior and coordinates data access |

For example, a FastAPI backend might use Python to validate an API request and SQL to retrieve the relevant records from PostgreSQL.

Python and SQL work together, but they are not interchangeable.

### 2.2 SQL is declarative

Consider this requirement:

> Retrieve all users whose city is Pune.

A procedural approach describes a sequence of steps:

1. Read each user.
2. Inspect the city.
3. Compare it with Pune.
4. Keep matching users.
5. Return the result.

A SQL query describes the condition:

```sql
SELECT *
FROM users
WHERE city = 'Pune';
```

The DBMS decides how to retrieve the matching records.

It might use an index, scan a table, or choose another valid execution strategy depending on the available data and database implementation.

You will study that distinction in [Query Execution Basics](08-Query-Execution-Basics.md).

---

## 3. A Consistent Example Database

Throughout this chapter, we will use a simplified matrimonial application schema.

### `users`

| user_id | name | age | city | is_verified |
|---:|---|---:|---|---|
| 101 | Aarav | 28 | Pune | TRUE |
| 102 | Meera | 26 | Mumbai | TRUE |
| 103 | Rohan | 30 | Pune | FALSE |
| 104 | Ananya | 24 | Bengaluru | TRUE |
| 105 | Kabir | 28 | Mumbai | FALSE |

### `partner_preferences`

| preference_id | user_id | preferred_city |
|---:|---:|---|
| 501 | 101 | Mumbai |
| 502 | 102 | Pune |
| 503 | 104 | Delhi |

Assume the following for the examples:

- `users.user_id` identifies a user.
- `partner_preferences.preference_id` identifies a preference record.
- `partner_preferences.user_id` refers to the associated user.
- Some users may not have a preference record.

These assumptions describe the example schema. A real database must define the appropriate keys and constraints if those rules need enforcement.

---

## 4. Categories of SQL Operations

SQL statements can be grouped conceptually according to their purpose.

The traditional categories are useful for learning, although classification and exact behavior can vary across database systems.

| Category | Purpose | Common examples |
|---|---|---|
| DDL — Data Definition Language | Define or change database structures | `CREATE`, `ALTER`, `DROP` |
| DML — Data Manipulation Language | Insert, update, or delete data | `INSERT`, `UPDATE`, `DELETE` |
| DQL — Data Query Language | Retrieve data | `SELECT` |
| DCL — Data Control Language | Manage privileges | `GRANT`, `REVOKE` |
| TCL — Transaction Control Language | Control transaction boundaries | `COMMIT`, `ROLLBACK`, `SAVEPOINT` |

Some references classify `SELECT` under DML instead of treating DQL as a separate category. The categories are a learning convention, not a universal boundary.

Let's examine the main operations.

### 4.1 DDL: Defining structures

DDL statements define database objects.

For example:

```sql
CREATE TABLE users (
    user_id INTEGER,
    name VARCHAR(100),
    age INTEGER,
    city VARCHAR(100)
);
```

This creates a table named `users` with four columns.

This is a simplified example. A production schema would need deliberate decisions about identifiers, required fields, types, and integrity constraints.

Schema structure and those design decisions belong to [Schema Design](03-Schema-Design.md).

### 4.2 DML: Modifying data

DML statements change the records stored in a database.

For example:

```sql
INSERT INTO users (user_id, name, age, city)
VALUES (106, 'Ishita', 27, 'Jaipur');
```

This inserts a new row.

An update modifies existing data:

```sql
UPDATE users
SET city = 'Pune'
WHERE user_id = 106;
```

A deletion removes matching rows:

```sql
DELETE FROM users
WHERE user_id = 106;
```

The `WHERE` clause is particularly important for update and delete operations. Without a restrictive condition, an operation may affect every row in the table.

### 4.3 TCL: Controlling transactions

Transaction-control statements manage transaction boundaries.

For example:

```sql
BEGIN;

UPDATE users
SET city = 'Pune'
WHERE user_id = 101;

ROLLBACK;
```

In PostgreSQL, this example begins a transaction, performs the update, and then rolls it back. The update is not committed.

Transaction behavior, isolation, and ACID properties are covered in [Transactions](06-Transactions.md).

---

## 5. Retrieving Data with SELECT

The `SELECT` statement retrieves data.

Basic structure:

```sql
SELECT column_name
FROM table_name;
```

For example:

```sql
SELECT name
FROM users;
```

This returns the `name` column for all rows in `users`.

### 5.1 Selecting multiple columns

```sql
SELECT user_id, name, city
FROM users;
```

This retrieves three columns from each matching row.

Explicitly selecting the required columns is usually preferable to selecting everything because it makes the query's requirements clearer and avoids returning unnecessary data.

### 5.2 Selecting all columns

```sql
SELECT *
FROM users;
```

The asterisk means all columns in the selected table.

It is useful for quick inspection and exploratory work.

In application code, prefer explicit column lists when practical. A query using `SELECT *` can return more data than necessary and may become less predictable as the schema changes.

### 5.3 Column aliases

An alias gives a result column a different name.

```sql
SELECT
    user_id AS id,
    name AS full_name
FROM users;
```

The result uses `id` and `full_name` as output column names.

Aliases affect the result representation; they do not rename the underlying table columns.

---

## 6. Filtering Rows with WHERE

The `WHERE` clause filters rows according to a condition.

```sql
SELECT user_id, name, age
FROM users
WHERE age > 26;
```

This returns users whose age is greater than 26.

### 6.1 Comparison operators

Common comparison operators include:

| Operator | Meaning |
|---|---|
| `=` | Equal to |
| `<>` | Not equal to |
| `!=` | Not equal to; supported by PostgreSQL, though `<>` is the standard SQL spelling |
| `>` | Greater than |
| `<` | Less than |
| `>=` | Greater than or equal to |
| `<=` | Less than or equal to |

Examples:

```sql
SELECT *
FROM users
WHERE city = 'Pune';
```

```sql
SELECT *
FROM users
WHERE age >= 28;
```

```sql
SELECT *
FROM users
WHERE is_verified = TRUE;
```

String literals use single quotes in these examples. Boolean syntax and supported types should be checked against the chosen DBMS.

### 6.2 Combining conditions with AND

`AND` requires both conditions to be true.

```sql
SELECT user_id, name, age, city
FROM users
WHERE age >= 26
  AND city = 'Pune';
```

This returns users who are at least 26 and live in Pune.

### 6.3 Combining conditions with OR

`OR` requires at least one condition to be true.

```sql
SELECT user_id, name, city
FROM users
WHERE city = 'Pune'
   OR city = 'Mumbai';
```

This returns users in either city.

### 6.4 Negating a condition with NOT

`NOT` negates a Boolean condition.

```sql
SELECT user_id, name, city
FROM users
WHERE NOT city = 'Pune';
```

This is not identical to selecting every row whose city is not Pune when `city` can be `NULL`. SQL's three-valued logic affects the result, as discussed later.

### 6.5 Using IN

`IN` checks whether a value matches one of several values.

```sql
SELECT user_id, name, city
FROM users
WHERE city IN ('Pune', 'Mumbai', 'Delhi');
```

This is often clearer than chaining many equality conditions with `OR`.

### 6.6 Using BETWEEN

`BETWEEN` checks whether a value falls within an inclusive range.

```sql
SELECT user_id, name, age
FROM users
WHERE age BETWEEN 25 AND 30;
```

This includes ages 25 and 30.

For date and timestamp ranges, understand the data type and boundary semantics. For timestamp filtering, a half-open interval—starting at one timestamp and ending just before another—is often useful for avoiding boundary errors.

### 6.7 Using LIKE

`LIKE` performs pattern matching.

```sql
SELECT user_id, name
FROM users
WHERE name LIKE 'A%';
```

In PostgreSQL, this pattern matches names beginning with `A`.

Common wildcards:

- `%` matches zero or more characters.
- `_` matches exactly one character.

Example:

```sql
SELECT user_id, name
FROM users
WHERE name LIKE '_e%';
```

This matches names whose second character is `e`, subject to the database's pattern-matching and collation behavior.

In PostgreSQL, `ILIKE` provides case-insensitive pattern matching as a PostgreSQL-specific extension:

```sql
SELECT user_id, name
FROM users
WHERE name ILIKE 'a%';
```

Do not assume `ILIKE` is portable across all SQL dialects.

---

## 7. NULL and Three-Valued Logic

`NULL` represents missing, unknown, or inapplicable information, depending on the data model.

It is not the same as:

- Zero.
- An empty string.
- The Boolean value `FALSE`.

This distinction has important consequences for queries.

### 7.1 Why ordinary equality does not work

The following is incorrect when searching for missing city values:

```sql
SELECT *
FROM users
WHERE city = NULL;
```

SQL does not treat `NULL` as an ordinary value for equality comparisons.

Use `IS NULL`:

```sql
SELECT *
FROM users
WHERE city IS NULL;
```

To find rows with a known city:

```sql
SELECT *
FROM users
WHERE city IS NOT NULL;
```

### 7.2 Three-valued logic

In ordinary two-valued Boolean logic, a condition is true or false.

SQL conditions involving `NULL` can also evaluate to `UNKNOWN`.

For example:

```sql
SELECT *
FROM users
WHERE city <> 'Pune';
```

If `city` is `NULL`, the comparison evaluates to `UNKNOWN`, not `TRUE`.

A `WHERE` clause keeps rows for which its condition evaluates to `TRUE`. Rows evaluating to `FALSE` or `UNKNOWN` are not returned.

This explains why the query does not automatically include records with missing city values.

### 7.3 A common mistake with NOT

Consider:

```sql
SELECT *
FROM users
WHERE NOT (city = 'Pune');
```

A row with a `NULL` city still evaluates to `UNKNOWN` after the negation. It is not included.

If the requirement is to include missing city values as well as cities other than Pune, write the condition explicitly:

```sql
SELECT *
FROM users
WHERE city <> 'Pune'
   OR city IS NULL;
```

The key lesson is to define how missing information should be handled rather than assuming that `NULL` behaves like an ordinary value.

---

## 8. Sorting and Limiting Results

### 8.1 ORDER BY

`ORDER BY` sorts the result.

```sql
SELECT user_id, name, age
FROM users
ORDER BY age ASC;
```

`ASC` means ascending order. `DESC` means descending order.

```sql
SELECT user_id, name, age
FROM users
ORDER BY age DESC;
```

Multiple sorting keys are allowed:

```sql
SELECT user_id, name, city, age
FROM users
ORDER BY city ASC, age DESC;
```

The rows are sorted by city first, then by age in descending order within each city.

If deterministic ordering matters, include a tie-breaker such as a unique identifier:

```sql
SELECT user_id, name, age
FROM users
ORDER BY age DESC, user_id ASC;
```

Without a complete ordering, records with equal sort values may appear in different relative orders.

### 8.2 LIMIT

In PostgreSQL, `LIMIT` restricts the number of returned rows.

```sql
SELECT user_id, name, age
FROM users
ORDER BY age DESC, user_id ASC
LIMIT 3;
```

This returns at most three rows.

A limit without an appropriate `ORDER BY` does not guarantee that the database will return the rows you consider the first, newest, or highest-ranked.

For example, fetching the "latest three users" requires a suitable timestamp column and ordering by it.

### 8.3 OFFSET

`OFFSET` skips a specified number of rows in the result.

```sql
SELECT user_id, name
FROM users
ORDER BY user_id
LIMIT 10 OFFSET 20;
```

This requests up to 10 rows after skipping the first 20 ordered rows.

Offset-based pagination can become expensive for large offsets and can produce inconsistent page boundaries when the underlying data changes between requests.

For large datasets, keyset pagination is often worth considering, depending on the query and ordering requirements.

---

## 9. Aggregate Functions

Aggregate functions summarize values across a set of rows.

Common aggregates include:

| Function | Purpose |
|---|---|
| `COUNT` | Count rows or non-NULL values, depending on the expression |
| `SUM` | Calculate a sum |
| `AVG` | Calculate an average |
| `MIN` | Find a minimum value |
| `MAX` | Find a maximum value |

### 9.1 COUNT

Count all rows:

```sql
SELECT COUNT(*)
FROM users;
```

Count rows whose `city` value is not `NULL`:

```sql
SELECT COUNT(city)
FROM users;
```

`COUNT(*)` counts rows, while `COUNT(column_name)` counts non-`NULL` values in that column.

This distinction is important when columns can contain missing values.

### 9.2 AVG

```sql
SELECT AVG(age)
FROM users;
```

This computes the average of non-`NULL` age values.

The database's result type and precision depend on the expression and DBMS.

### 9.3 MIN and MAX

```sql
SELECT
    MIN(age) AS youngest_age,
    MAX(age) AS oldest_age
FROM users;
```

This returns the smallest and largest non-`NULL` age values.

### 9.4 Aggregates and empty input

Aggregates do not all behave identically for an empty input set.

For example, `COUNT(*)` returns zero, while `SUM`, `AVG`, `MIN`, and `MAX` generally return `NULL` when there are no applicable values.

Do not assume every aggregate returns zero when no data matches.

---

## 10. GROUP BY and HAVING

`GROUP BY` groups rows with matching values so aggregate functions can summarize each group.

Suppose we want to count users in each city.

```sql
SELECT city, COUNT(*) AS user_count
FROM users
GROUP BY city;
```

Conceptually, the database forms groups based on `city` and calculates the count for each group.

If `city` contains `NULL`, those rows form a group for the `NULL` grouping value.

### 10.1 Filtering groups with HAVING

`WHERE` filters input rows before grouping. `HAVING` filters groups after grouping.

For example:

```sql
SELECT city, COUNT(*) AS user_count
FROM users
GROUP BY city
HAVING COUNT(*) >= 2;
```

This returns only cities with at least two users.

### WHERE versus HAVING

| Clause | Purpose |
|---|---|
| `WHERE` | Filters individual rows before grouping |
| `HAVING` | Filters groups after grouping |

Example:

```sql
SELECT city, COUNT(*) AS verified_user_count
FROM users
WHERE is_verified = TRUE
GROUP BY city
HAVING COUNT(*) >= 2;
```

This query:

1. Keeps only verified users.
2. Groups the remaining rows by city.
3. Counts verified users per city.
4. Returns groups containing at least two verified users.

Understanding the distinction avoids many SQL query errors.

---

## 11. Combining Tables with JOIN

Applications often store related information in separate tables.

SQL joins allow queries to combine data from those tables according to a join condition.

Consider the `users` and `partner_preferences` tables introduced earlier.

### 11.1 INNER JOIN

An `INNER JOIN` returns rows that satisfy the join condition.

```sql
SELECT
    u.user_id,
    u.name,
    p.preferred_city
FROM users AS u
INNER JOIN partner_preferences AS p
    ON u.user_id = p.user_id;
```

The query matches each preference record to its associated user.

Users without matching preference records are excluded from the result.

Aliases such as `u` and `p` make queries shorter and help distinguish columns with the same name.

### 11.2 LEFT JOIN

A `LEFT JOIN` returns every row from the left table and includes matching data from the right table when available.

```sql
SELECT
    u.user_id,
    u.name,
    p.preferred_city
FROM users AS u
LEFT JOIN partner_preferences AS p
    ON u.user_id = p.user_id;
```

All users are included, even when no matching preference exists.

For users without a match, the selected preference columns contain `NULL`.

This is useful when the requirement is to retrieve every user, regardless of whether a preference record exists.

### 11.3 RIGHT JOIN and FULL OUTER JOIN

A `RIGHT JOIN` preserves every row from the right table and adds matching rows from the left.

A `FULL OUTER JOIN` preserves unmatched rows from both sides as well as matching rows.

Their availability and behavior should be checked for the target DBMS. PostgreSQL supports both.

In practice, many queries can be expressed more clearly with `LEFT JOIN` by choosing the table whose rows must all be preserved as the left input.

### 11.4 CROSS JOIN

A `CROSS JOIN` produces the Cartesian product of two inputs: every row from the first input is paired with every row from the second.

If one table has 3 rows and another has 4 rows, the result contains 12 combinations.

This can be useful when all combinations are intended, but it can also create unexpectedly large results.

### 11.5 Join conditions matter

Consider:

```sql
SELECT u.name, p.preferred_city
FROM users AS u
JOIN partner_preferences AS p
    ON u.user_id = p.user_id;
```

The join condition specifies how records relate.

Joining unrelated columns or omitting a required condition can produce incorrect matches or a Cartesian product.

Before writing a join, identify:

1. Which tables are required?
2. Which records should match?
3. Which rows must be preserved when no match exists?
4. Can one record match multiple records on the other side?

These questions are more important than memorizing join syntax.

### 11.6 A common LEFT JOIN mistake

Consider:

```sql
SELECT u.user_id, u.name, p.preferred_city
FROM users AS u
LEFT JOIN partner_preferences AS p
    ON u.user_id = p.user_id
WHERE p.preferred_city = 'Pune';
```

Although this uses a `LEFT JOIN`, the `WHERE` clause removes rows where `p.preferred_city` is `NULL`. As a result, unmatched users are excluded.

If the requirement is to retain all users but include preference data only when the preferred city is Pune, the condition may belong in the join:

```sql
SELECT u.user_id, u.name, p.preferred_city
FROM users AS u
LEFT JOIN partner_preferences AS p
    ON u.user_id = p.user_id
   AND p.preferred_city = 'Pune';
```

The two queries have different meanings.

Always distinguish between filtering the final result and restricting which right-side records qualify as matches.

---

## 12. Inserting, Updating, and Deleting Data

Reading data is only one part of SQL. Applications also need to modify it.

### 12.1 INSERT

Insert one record:

```sql
INSERT INTO users (
    user_id,
    name,
    age,
    city,
    is_verified
)
VALUES (
    106,
    'Ishita',
    27,
    'Jaipur',
    FALSE
);
```

Explicitly naming the target columns makes the statement easier to understand and less dependent on column ordering.

In real applications, identifiers may be generated by the database rather than supplied manually. That behavior depends on the schema and DBMS.

### 12.2 UPDATE

```sql
UPDATE users
SET city = 'Pune'
WHERE user_id = 106;
```

This changes the city for the matching user.

A useful safety habit is to inspect the target records first:

```sql
SELECT user_id, name, city
FROM users
WHERE user_id = 106;
```

Then execute the update and verify the result when appropriate.

### 12.3 DELETE

```sql
DELETE FROM users
WHERE user_id = 106;
```

This removes rows satisfying the condition.

Without a `WHERE` clause:

```sql
DELETE FROM users;
```

the statement deletes all rows in the table, subject to database behavior and constraints. It does not remove the table definition itself.

### 12.4 Safer modification practices

For important data changes:

- Verify the target rows before modifying them.
- Use a precise `WHERE` condition.
- Check affected-row counts when the client provides them.
- Use transactions when a group of changes must succeed or fail together.
- Consider database constraints and related records.
- Follow the application's authorization and audit requirements.

For destructive operations, a query that is syntactically valid can still be operationally dangerous.

### 12.5 SQL injection awareness

Never build SQL by directly concatenating untrusted user input.

Unsafe Python example:

```python
query = (
    "SELECT * FROM users WHERE name = '"
    + user_input
    + "'"
)
```

An attacker may supply input that changes the intended meaning of the SQL statement.

Use parameterized queries through the database driver or ORM instead.

Illustrative PostgreSQL-driver-style example:

```python
cursor.execute(
    "SELECT user_id, name FROM users WHERE name = %s",
    (user_input,)
)
```

The placeholder syntax depends on the database driver. For example, not every Python database library uses `%s`.

The principle is consistent: pass values separately from the SQL statement, using the driver's parameter-binding mechanism. Do not manually interpolate untrusted values into SQL.

---

## 13. How SQL Statements Fit Together

A query can combine filtering, grouping, aggregation, sorting, and limiting.

Consider this requirement:

> Find the two cities with the most verified users.

One PostgreSQL-compatible query is:

```sql
SELECT
    city,
    COUNT(*) AS verified_user_count
FROM users
WHERE is_verified = TRUE
  AND city IS NOT NULL
GROUP BY city
ORDER BY verified_user_count DESC, city ASC
LIMIT 2;
```

The query:

1. Selects the `users` table as its input.
2. Filters for verified users with a known city.
3. Groups the remaining records by city.
4. Counts users in each group.
5. Sorts groups by count, using city as a tie-breaker.
6. Returns at most two groups.

The example demonstrates that SQL statements are compositions of smaller operations.

A useful way to reason about a query is to translate the business requirement into these questions:

- What data is needed?
- Which rows qualify?
- Which tables must be combined?
- Is grouping required?
- How should the results be ordered?
- Is a limit required?
- How should missing values be handled?

This method is more reliable than starting with syntax and trying to force the requirement into it.

---

## 14. A Practical Note on Query Evaluation

Although SQL is written in a particular textual order, it is useful to reason about a typical query logically in this sequence:

1. `FROM` and joins establish the input relation.
2. `WHERE` filters rows.
3. `GROUP BY` forms groups.
4. `HAVING` filters groups.
5. `SELECT` defines the output expressions.
6. `ORDER BY` sorts the output.
7. `LIMIT` and `OFFSET` restrict the returned portion.

This is a simplified logical model, not a claim about the exact physical order of operations inside the DBMS.

The database may transform a query into an equivalent execution plan to improve efficiency.

Also, SQL has rules about which expressions can be referenced at different stages. For example, alias visibility in `WHERE` differs from alias visibility in `ORDER BY` in PostgreSQL.

Use the logical model to understand query meaning, then consult the target dialect when a specific syntax rule matters.

---

## 15. Production Engineering Perspective

Knowing SQL syntax is necessary, but production engineering requires more than writing queries that return the expected rows.

### 15.1 Query only the data you need

Prefer:

```sql
SELECT user_id, name
FROM users
WHERE user_id = 101;
```

over returning every column when only two are required.

This can reduce unnecessary data transfer and clarify the query's intent.

### 15.2 Parameterize values

Use parameterized queries for untrusted input. This helps prevent SQL injection and lets the driver handle value binding correctly.

### 15.3 Be explicit about ordering

If your application depends on the order of results, define that order using `ORDER BY`.

Do not rely on the apparent insertion order of records.

### 15.4 Handle NULL deliberately

Decide whether missing values should be excluded, included, replaced, or treated as a separate category.

Use `IS NULL` and `IS NOT NULL` for null checks.

### 15.5 Treat writes carefully

A correct-looking `UPDATE` or `DELETE` can affect more rows than intended. Validate conditions and use transactions where appropriate.

### 15.6 Understand the cost of joins and aggregation

Queries that combine large tables or aggregate large datasets can be expensive.

The correct response is not to avoid joins or aggregation categorically. Instead, understand the requirement, inspect query behavior when necessary, and evaluate indexes and execution plans in the appropriate context.

Detailed index and execution-plan reasoning belongs to [Indexing Fundamentals](05-Indexing-Fundamentals.md) and [Query Execution Basics](08-Query-Execution-Basics.md).

### 15.7 Keep business logic and data operations clear

A backend should make its data access understandable and maintainable.

Avoid scattering slightly different copies of the same complex query throughout an application when a clear, tested abstraction is appropriate. At the same time, do not hide simple queries behind unnecessary layers.

The goal is clarity, correctness, and maintainability—not abstraction for its own sake.

---

## 16. Common Mistakes

### Mistake 1: Using `SELECT *` everywhere

This can retrieve unnecessary columns and make application behavior more sensitive to schema changes.

**Better approach:** Select the fields the application needs.

### Mistake 2: Forgetting the WHERE clause

An `UPDATE` or `DELETE` without a restrictive condition can affect every row.

**Better approach:** Review the target rows and the intended scope before executing a modification.

### Mistake 3: Using `= NULL`

Ordinary equality comparisons do not test for `NULL`.

**Better approach:** Use `IS NULL` or `IS NOT NULL`.

### Mistake 4: Confusing WHERE and HAVING

`WHERE` filters rows before grouping. `HAVING` filters groups.

**Better approach:** Decide whether the condition applies to individual records or aggregated groups.

### Mistake 5: Assuming a LEFT JOIN always preserves every left row

A `WHERE` condition on a right-side column can eliminate unmatched rows.

**Better approach:** Understand whether the condition belongs in `ON` or `WHERE`.

### Mistake 6: Assuming results have a stable order

Without an explicit `ORDER BY`, the returned row order is not guaranteed.

**Better approach:** Define ordering whenever it matters.

### Mistake 7: Concatenating user input into SQL

This can create SQL injection vulnerabilities.

**Better approach:** Use parameterized queries.

### Mistake 8: Assuming a valid query is an efficient query

A query may return the correct result while performing unnecessary work.

**Better approach:** First ensure correctness, then examine performance using appropriate database tools.

### Mistake 9: Treating SQL dialects as identical

Different systems may vary in syntax, data types, pagination, string matching, generated identifiers, and transaction behavior.

**Better approach:** State and verify the target dialect for implementation-specific behavior.

---

## 17. Interview Questions and Answers

### Q1. What is SQL, and why is it used?

SQL is a language for defining, querying, and manipulating data in relational database systems. It allows applications to express data operations without manually implementing every low-level retrieval or storage step.

### Q2. What is the difference between DDL and DML?

DDL defines or changes database structures, using statements such as `CREATE` and `ALTER`. DML modifies stored records, using statements such as `INSERT`, `UPDATE`, and `DELETE`.

### Q3. What is the difference between WHERE and HAVING?

`WHERE` filters rows before grouping. `HAVING` filters groups after `GROUP BY` and can apply aggregate conditions.

### Q4. What is the difference between INNER JOIN and LEFT JOIN?

`INNER JOIN` returns rows that satisfy the join condition. `LEFT JOIN` preserves all rows from the left input and includes matching right-side data when available; unmatched right-side columns are represented as `NULL`.

### Q5. Why is `column = NULL` incorrect?

`NULL` represents missing or unknown information and is not compared like an ordinary value. Use `IS NULL` to test whether a column is null.

### Q6. What is the difference between COUNT(*) and COUNT(column)?

`COUNT(*)` counts rows. `COUNT(column)` counts rows in which that column's value is not `NULL`.

### Q7. Why should an application use parameterized SQL queries?

Parameterized queries separate SQL structure from input values. This helps prevent untrusted input from changing the intended query and allows the database driver to bind values appropriately.

### Q8. Why is ORDER BY important when using LIMIT?

Without an explicit ordering, the database does not guarantee which rows appear first. `ORDER BY` defines the ordering from which `LIMIT` selects a subset.

### Q9. Is SQL procedural or declarative?

SQL is primarily declarative for ordinary query writing: the developer describes the desired result, and the DBMS determines an execution strategy. Some database systems also support procedural extensions.

### Q10. Does a LEFT JOIN always return every row from the left table?

A left join preserves left-side rows at the join stage, but later conditions—especially `WHERE` predicates on right-side columns—can filter some of those rows from the final result.

### Q11. What is SQL injection?

SQL injection occurs when untrusted input changes the intended meaning of a SQL statement, often because the application constructs queries through unsafe string concatenation. Parameterized queries are a primary defense.

### Q12. How would you debug a query that returns fewer rows than expected?

I would inspect the input tables and join conditions, verify each `WHERE` predicate, check how `NULL` is handled, examine grouping and `HAVING`, and confirm whether later filtering or limiting excludes rows. I would reduce the query to smaller pieces and add operations back incrementally.

---

## 18. Quick Revision

- SQL is used to define, query, and manipulate relational data.
- DDL manages database structures; DML modifies records.
- `SELECT` retrieves data.
- `WHERE` filters individual rows.
- `ORDER BY` defines result ordering.
- `LIMIT` and `OFFSET` restrict or skip returned rows.
- Aggregate functions summarize data.
- `GROUP BY` creates groups; `HAVING` filters groups.
- Joins combine data according to relationships.
- `INNER JOIN` returns matching rows; `LEFT JOIN` preserves left-side rows at the join stage.
- `NULL` requires special handling through `IS NULL` and `IS NOT NULL`.
- Parameterized queries help prevent SQL injection.
- Updates and deletes must be scoped carefully.
- SQL dialects can differ.
- Logical query order is a reasoning model, not necessarily the DBMS's physical execution order.

---

## 19. Key Takeaways

SQL is the primary interface through which many applications express operations on relational data.

Strong SQL skills require more than memorizing commands. You must understand the shape of the desired result, the relationships between tables, the meaning of conditions, the behavior of missing values, and the consequences of modifying data.

In production systems, correctness, security, predictable behavior, and maintainability are as important as syntax.

Your next step is to understand how the tables and relationships that SQL operates on should be designed in the first place.

## 20. Further Reading

Use official documentation to verify syntax and behavior for the target database:

- [PostgreSQL — SQL Commands](https://www.postgresql.org/docs/current/sql-commands.html)
- [PostgreSQL — Queries](https://www.postgresql.org/docs/current/queries.html)
- [PostgreSQL — Data Manipulation](https://www.postgresql.org/docs/current/dml.html)
- [PostgreSQL — Aggregate Functions](https://www.postgresql.org/docs/current/functions-aggregate.html)
- [PostgreSQL — Pattern Matching](https://www.postgresql.org/docs/current/functions-matching.html)

---

## Completion Check

Before proceeding, answer these questions without looking at the examples:

1. Write a query to retrieve verified users in Pune, ordered by age from oldest to youngest.
2. Explain why `WHERE city <> 'Pune'` may exclude records whose city is `NULL`.
3. Explain the difference between filtering rows with `WHERE` and filtering groups with `HAVING`.
4. Write a query that returns every user and their preferred city, including users who have no preference record.
5. Explain how a condition in the `ON` clause can behave differently from the same condition in the `WHERE` clause of a left join.
6. Describe how you would safely update a single user's city in a production application.
7. Explain how parameterized queries help protect an application from SQL injection.

**Practical exercise:** Using the example `users` and `partner_preferences` tables, write SQL statements to:

- Retrieve users from Mumbai.
- Find users aged between 25 and 30.
- Count users by city.
- Find cities containing at least two users.
- List all users and their preferred cities.
- Find users who do not have a preference record.
- Insert a new user.
- Update that user's city.
- Delete that user using a precise condition.

Use PostgreSQL-compatible syntax and verify the expected behavior of each statement.

When you can write these queries and explain why they return the expected results, proceed to **Schema Design**.
