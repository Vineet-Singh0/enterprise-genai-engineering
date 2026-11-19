# Indexing Fundamentals

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain why database indexes exist and which performance problems they address.
- Understand how an index helps a database locate records without scanning an entire table.
- Distinguish a table scan from an index scan at a conceptual level.
- Explain the relationship between indexes, search conditions, and query execution.
- Understand index selectivity and why some columns are better indexing candidates than others.
- Recognize the trade-offs between read performance, write performance, and storage.
- Identify common situations where an index may help or provide little benefit.
- Make an initial, evidence-based decision about whether a query needs an index.

## Prerequisites

**Primary prerequisite:** [ENG-02 — Programming Foundations](../ENG-02-Programming-Foundations/README.md)

**Previous chapters:**
- [Relational Databases](01-Relational-Databases.md)
- [SQL Fundamentals](02-SQL-Fundamentals.md)
- [Schema Design](03-Schema-Design.md)
- [Keys and Constraints](04-Keys-and-Constraints.md)

You should understand relational tables, SQL filtering, primary keys, foreign keys, and basic schema design.

**Estimated reading time:** 35–45 minutes.

**SQL dialect:** Examples use PostgreSQL-compatible SQL. Index syntax and implementation details can differ between database systems.

---

## 1. Before We Start: Why Do Indexes Exist?

Imagine a matrimonial application with five million user profiles.

The application frequently executes this query:

```sql
SELECT user_id, name, city
FROM users
WHERE city = 'Pune';
```

The database needs to find users whose city is Pune.

Without an index that can support this condition, the database may need to inspect every row in the table to determine which rows match.

If the table contains five million rows, that could mean examining a very large number of records to retrieve a relatively small result.

Now imagine that the application performs this query thousands of times per hour.

Repeatedly examining a large table can consume substantial resources, particularly when only a small fraction of the records match the condition.

This is the problem indexes help address.

**A database index is an additional data structure that helps the database locate or access records more efficiently for certain operations.**

An index is conceptually similar to an index in a book.

Without a book index, you may need to inspect many pages to find a particular topic. With an index, you can locate the relevant pages more directly.

However, a database index is not free. It consumes storage and must generally be maintained when indexed data changes.

The engineering problem is therefore not simply to create indexes. It is to decide when the performance benefit justifies their costs.

---

## 2. What Is a Database Index?

An index is a data structure maintained by the database to support particular access patterns.

Consider this table:

| user_id | name | city |
|---:|---|---|
| 101 | Aarav | Pune |
| 102 | Meera | Mumbai |
| 103 | Rohan | Pune |
| 104 | Ananya | Bengaluru |
| 105 | Kabir | Mumbai |

Suppose the database receives:

```sql
SELECT *
FROM users
WHERE user_id = 103;
```

If `user_id` is a primary key, the database has an index-backed mechanism available for enforcing and supporting that key in PostgreSQL.

For another column, such as `city`, an index may need to be created explicitly if the workload would benefit from it.

For example:

```sql
CREATE INDEX idx_users_city
ON users(city);
```

This creates a PostgreSQL index on the `city` column.

The index allows the database to consider an indexed access path for queries that can use it.

It does **not** guarantee that every query filtering by `city` will use the index. The DBMS chooses an execution strategy based on factors such as the query, available indexes, table statistics, and estimated cost.

### 2.1 An index is separate from the logical table structure

The `users` table still represents user records.

Creating an index does not add a new logical column or change what a row means. Instead, it creates an additional structure that helps the database access the existing data.

Conceptually:

```text
Logical table
-------------
user_id | name   | city
--------|--------|----------
101     | Aarav  | Pune
102     | Meera  | Mumbai
103     | Rohan  | Pune
104     | Ananya | Bengaluru
105     | Kabir  | Mumbai

Additional index on city
------------------------
Bengaluru -> record reference(s)
Mumbai    -> record reference(s)
Pune      -> record reference(s)
```

This diagram is illustrative rather than a representation of PostgreSQL's exact internal index layout.

The index stores information that helps locate matching table records. The specific representation depends on the index type.

### 2.2 Indexes do not replace the table

An index normally does not contain every piece of information stored in the table.

If an index supports a search on `city` but the query also needs `name`, the database may need to retrieve the corresponding table rows.

Some index designs can contain additional columns or support index-only access for certain queries, but that behavior depends on the index, query, and DBMS.

For now, use this mental model:

> The table stores the logical records. The index provides an additional access path to help find or retrieve those records.

---

## 3. Table Scans and Indexed Access

To understand indexes, first distinguish two conceptual access strategies.

### 3.1 Table scan

A table scan examines table rows to determine which ones satisfy a query.

Consider:

```sql
SELECT user_id, name
FROM users
WHERE city = 'Pune';
```

If no useful index exists, the database may scan the table and evaluate the condition against each row.

Conceptually:

```text
Read row 1 -> Is city Pune? -> Match
Read row 2 -> Is city Pune? -> No
Read row 3 -> Is city Pune? -> Match
Read row 4 -> Is city Pune? -> No
Read row 5 -> Is city Pune? -> No
```

A table scan can be entirely reasonable for a small table or a query that needs a large fraction of the table.

### 3.2 Indexed access

If a suitable index exists, the database may use it to find entries associated with `Pune` and then retrieve the matching records.

Conceptually:

```text
Search index for "Pune"
          |
          v
Find matching index entries
          |
          v
Locate corresponding table records
          |
          v
Return matching results
```

The index can avoid examining every table row when the query is selective and the access path is beneficial.

### 3.3 Which approach is faster?

There is no universal answer.

An index may be beneficial when:

- The table is large.
- The query matches a small proportion of rows.
- The index supports the query's conditions.
- The cost of accessing the index and retrieving matching rows is lower than scanning the table.

A table scan may be preferable when:

- The table is small.
- Most rows must be returned.
- The index does not support the query effectively.
- Random access to many rows costs more than scanning the table efficiently.

**Engineering principle:** An index provides an option for data access. It does not automatically make every query faster.

---

## 4. How Indexes Work Conceptually

Different index types use different internal structures.

For this chapter, we will focus on the conceptual behavior of a common ordered index, rather than exploring advanced index implementation details.

### 4.1 Ordered indexes

A typical ordered index maintains indexed values in an order that supports efficient searching.

For example, imagine an index over user identifiers:

```text
user_id index
-------------
101
102
103
104
105
...
```

If the database needs to locate `103`, it can navigate the index structure instead of examining every table row.

In PostgreSQL, B-tree indexes are the default index type and support many common equality and range comparisons.

A conceptual representation might look like this:

```text
                 [103]
                /     \
           [101,102]  [104,105]
```

This is only a simplified illustration of hierarchical search. It is not an exact diagram of PostgreSQL's B-tree implementation.

The important idea is that an ordered search structure can narrow the search rather than inspecting every indexed entry sequentially.

### 4.2 Index entries and record locations

An index entry associates an indexed value with information that helps the database locate the corresponding row or rows.

For example:

```text
city       -> matching record references
-----------------------------------------
Bengaluru  -> record reference(s)
Mumbai     -> record reference(s)
Pune       -> record reference(s)
```

Several rows may have the same indexed value. An index does not require every indexed value to be unique.

For example, many users may live in Pune.

### 4.3 Why internal details matter less at first

At the engineering-foundation level, you should understand:

- An index is a maintained data structure.
- It supports particular access patterns.
- It can reduce the amount of work required to find matching data.
- It has storage and maintenance costs.
- The DBMS decides whether to use it for a query.

These principles are more useful initially than memorizing the exact layout of an index implementation.

Advanced index structures and optimizer internals should be studied separately when the problem requires them.

---

## 5. Index Selectivity

**Selectivity** describes how narrowly a condition identifies rows relative to the dataset.

For indexing decisions, a useful intuition is to ask:

> What fraction of the table is expected to match this condition?

Suppose a table contains one million users.

### Query A: Search by a unique identifier

```sql
SELECT *
FROM users
WHERE user_id = 900123;
```

If `user_id` uniquely identifies a record, the query returns at most one row.

This condition is highly selective.

### Query B: Search by city

```sql
SELECT *
FROM users
WHERE city = 'Pune';
```

If 20% of users live in Pune, the query may return approximately 200,000 rows.

The condition is less selective than a unique identifier lookup.

### Query C: Search by a Boolean status

```sql
SELECT *
FROM users
WHERE is_verified = TRUE;
```

If 85% of users are verified, the condition matches most of the table.

A standalone index on this Boolean column may not be helpful for this query because the database may need to retrieve a large number of rows anyway.

The actual result depends on the data distribution, the query, other available indexes, and the database's cost estimates.

### 5.1 Selectivity is not the only factor

A column's selectivity is useful, but it does not independently determine whether an index is worthwhile.

Consider a low-selectivity condition that is used constantly by an application. An index may still help when combined with another filter, when used by a partial index, or when it supports ordering.

Similarly, a highly selective index may not be useful if the query expression cannot use it effectively.

The decision depends on the complete query and workload.

### 5.2 A useful distinction

- **High selectivity:** The condition matches a relatively small portion of the data.
- **Low selectivity:** The condition matches a relatively large portion of the data.

This is a useful heuristic, not a complete index-selection algorithm.

---

## 6. Creating and Removing Indexes

PostgreSQL supports explicit index creation using `CREATE INDEX`.

For example:

```sql
CREATE INDEX idx_users_city
ON users(city);
```

This creates an index on the `city` column.

A query that filters by city may be able to use this index:

```sql
SELECT user_id, name
FROM users
WHERE city = 'Pune';
```

The database still decides whether the index is beneficial for the query.

### 6.1 Naming indexes

Descriptive index names help engineers understand their purpose.

For example:

```sql
CREATE INDEX idx_profile_views_viewer_user_id
ON profile_views(viewer_user_id);
```

This name communicates the indexed table and column.

Naming conventions vary across teams. Consistency and clarity matter more than one specific convention.

### 6.2 Removing an index

In PostgreSQL:

```sql
DROP INDEX idx_users_city;
```

This removes the index but does not remove the underlying table or its rows.

Do not remove an index merely because it appears unused in a brief observation period. It may support infrequent but important queries, constraints, or workloads that vary over time.

Before dropping an index in a real system, inspect dependencies, query behavior, and operational requirements.

### 6.3 Primary keys and unique constraints

In PostgreSQL, defining a primary key or a regular unique constraint automatically creates a unique index to enforce the constraint.

For example:

```sql
CREATE TABLE users (
    user_id BIGINT PRIMARY KEY,
    email TEXT UNIQUE
);
```

PostgreSQL creates indexes to enforce the primary key and unique constraint.

Therefore, creating another identical index on `user_id` or `email` is generally redundant unless there is a specific reason for a different index definition.

This is an important distinction: some indexes are created explicitly for performance, while others exist to enforce integrity rules.

---

## 7. The Trade-Off: Faster Reads Versus More Expensive Writes

Indexes can improve read performance, but they also create costs.

Suppose an application has indexes on:

- `user_id`
- `email`
- `city`
- `age`
- `is_verified`
- `created_at`

Each insert may require the database to maintain several index structures.

Updates to indexed values may also require index maintenance. Deletes must account for index entries as well.

### 7.1 Storage overhead

Indexes consume disk space.

The storage required depends on factors such as:

- The number of indexed rows.
- The indexed data types.
- The index type.
- The number of indexed columns.
- The number of indexes.
- The database implementation.

A large collection of unnecessary indexes can increase storage use and maintenance work.

### 7.2 Write overhead

When a new user is inserted, the database may need to add entries to multiple indexes.

When a user's city changes, an index on `city` may need to be updated.

Consequently, an index that improves a frequent read query can make writes more expensive.

### 7.3 Maintenance overhead

Indexes may require maintenance as data changes. Their size and effectiveness can also be affected by workload characteristics and database behavior.

Operational details such as index rebuilds, vacuuming, and maintenance scheduling depend on the DBMS and belong to deeper database-operations study.

### 7.4 The trade-off in one view

| Dimension | Effect of adding an index |
|---|---|
| Supported reads | May become faster |
| Inserts | Usually require additional index maintenance |
| Updates | May require index changes when relevant values change |
| Deletes | Must account for index entries |
| Storage | Increases |
| Schema and operations | More structures to manage and understand |

The right goal is not to maximize the number of indexes. It is to support important access patterns at an acceptable total cost.

---

## 8. What Makes a Good Indexing Candidate?

An indexing candidate should be evaluated in the context of real application queries.

Consider these examples from a profile application.

### 8.1 Lookup by identifier

```sql
SELECT *
FROM users
WHERE user_id = 101;
```

If `user_id` is the primary key, PostgreSQL already creates a supporting unique index.

Creating another identical index is generally unnecessary.

### 8.2 Lookup by city

```sql
SELECT user_id, name
FROM users
WHERE city = 'Pune';
```

A separate index on `city` may help if this query is common, the table is large, and the condition returns a suitably small portion of the rows.

```sql
CREATE INDEX idx_users_city
ON users(city);
```

If most users live in Pune, the index may be less useful for this particular query.

### 8.3 Lookup by a timestamp range

```sql
SELECT view_id, viewed_at
FROM profile_views
WHERE viewed_at >= TIMESTAMPTZ '2026-10-01 00:00:00+00'
  AND viewed_at <  TIMESTAMPTZ '2026-11-01 00:00:00+00';
```

An index on `viewed_at` may help with range access, depending on the table size, the proportion of rows in the range, and the execution plan.

This is an example of a range query: the database must retrieve records whose timestamp falls within a specified interval.

### 8.4 Filtering by several conditions

```sql
SELECT user_id, name
FROM users
WHERE city = 'Pune'
  AND age >= 25;
```

Possible strategies include:

- An index on `city`.
- An index on `age`.
- A composite index on `(city, age)`.
- A table scan.
- A combination of available access paths.

Which strategy is best depends on the actual data and workload.

Do not choose an index merely because a column appears in a `WHERE` clause. First understand how often the query runs, how much data it returns, and what other queries need to be supported.

---

## 9. Composite Indexes: Multiple Columns in One Index

A **composite index** indexes more than one column in a defined order.

For example:

```sql
CREATE INDEX idx_users_city_age
ON users(city, age);
```

This creates an index on `city` followed by `age`.

It may be useful for queries such as:

```sql
SELECT user_id, name
FROM users
WHERE city = 'Pune'
  AND age >= 25;
```

The index can support access based on the leading `city` column and may help apply the age condition within the relevant index range.

### 9.1 Column order matters

For many B-tree access patterns, the order of columns in a composite index affects which queries it can support efficiently.

An index on `(city, age)` is not equivalent to an index on `(age, city)`.

The first is particularly suited to queries that constrain `city`, possibly with additional conditions on `age`. The second is particularly suited to queries that constrain `age` first.

The precise behavior depends on the query and DBMS.

### 9.2 Avoid indexing every possible combination

If an application filters by city, age, profession, education, and verification status, it does not follow that it should create an index for every possible combination of those columns.

Each additional index consumes resources and adds maintenance work.

Instead:

1. Identify important query patterns.
2. Examine the filters, joins, and ordering.
3. Consider the expected data distribution.
4. Evaluate candidate indexes.
5. Measure whether they improve the workload.

Composite-index design can become complex. The objective at this level is to understand the principle, not to memorize a universal column-order rule.

---

## 10. Indexes and ORDER BY

Indexes can sometimes help a database return rows in the required order without performing a separate sort.

Consider:

```sql
SELECT user_id, created_at
FROM users
ORDER BY created_at DESC
LIMIT 20;
```

If the application frequently retrieves the most recent users, an index on `created_at` may be useful:

```sql
CREATE INDEX idx_users_created_at
ON users(created_at);
```

PostgreSQL B-tree indexes can be scanned in forward or backward order. Whether the index is selected depends on the complete query and cost estimates.

### 10.1 Why LIMIT changes the situation

If the database needs only the newest 20 rows, a suitable ordered access path may allow it to find those rows without sorting the entire table.

However, if the query must return a large fraction of all rows, the benefit may be different.

Again, the index is an option, not a guarantee.

### 10.2 Filtering and sorting together

Suppose the application needs recent profile views for one user:

```sql
SELECT view_id, viewed_at
FROM profile_views
WHERE viewer_user_id = 101
ORDER BY viewed_at DESC
LIMIT 20;
```

A composite index on `(viewer_user_id, viewed_at)` is worth evaluating because it aligns with the equality filter followed by the timestamp ordering.

```sql
CREATE INDEX idx_profile_views_viewer_time
ON profile_views(viewer_user_id, viewed_at);
```

Do not assume this index helps. Inspect the plan and measure.

### 10.3 Measured example: before and after the index

The following is a **single-run result — warm cache — PostgreSQL 18.6 — temporary local cluster** used only to generate evidence for this lesson. It is one reproducible execution example, not a universal benchmark.

**Table definition**

```sql
CREATE TABLE profile_views (
    view_id BIGINT PRIMARY KEY,
    viewer_user_id BIGINT NOT NULL,
    viewed_at TIMESTAMPTZ NOT NULL
);
```

**Data generation (exact SQL used)**

```sql
INSERT INTO profile_views (view_id, viewer_user_id, viewed_at)
SELECT
  g AS view_id,
  CASE
    WHEN g <= 3500 THEN 101
    ELSE 1 + ((g - 3501) % 99999)
  END AS viewer_user_id,
  TIMESTAMPTZ '2024-01-01 00:00:00+00'
    + ((g % 86400) * INTERVAL '1 second')
    + ((g / 86400) * INTERVAL '1 day') AS viewed_at
FROM generate_series(1, 2000000) AS g;
```

**Generated distribution**

| Metric | Value |
|--------|-------|
| Total rows | 2,000,000 |
| Distinct `viewer_user_id` | 99,999 |
| Rows for `viewer_user_id = 101` | 3,520 |

User 101 is intentionally heavier than a typical viewer so the ordered top-N query is a realistic index candidate. User 101 is still a small fraction of the table (~0.18%), not a majority of rows.

**Statistics**

```sql
ANALYZE profile_views;
```

Then the baseline query was executed three times; the third (warm-cache) plan is documented below.

**Baseline query**

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT view_id, viewed_at
FROM profile_views
WHERE viewer_user_id = 101
ORDER BY viewed_at DESC
LIMIT 20;
```

**Baseline plan (warm cache)**

```text
Limit  (cost=24191.91..24194.24 rows=20 width=16) (actual time=66.130..70.327 rows=20.00 loops=1)
  Buffers: shared hit=11872 read=943 written=37
  ->  Gather Merge  (cost=24191.91..24572.29 rows=3266 width=16) (actual time=66.128..70.321 rows=20.00 loops=1)
        Workers Planned: 2
        Workers Launched: 2
        Buffers: shared hit=11872 read=943 written=37
        ->  Sort  (cost=23191.88..23195.28 rows=1361 width=16) (actual time=52.362..52.364 rows=6.67 loops=3)
              Sort Key: viewed_at DESC
              Sort Method: top-N heapsort  Memory: 26kB
              Buffers: shared hit=11872 read=943 written=37
              Worker 0:  Sort Method: quicksort  Memory: 25kB
              Worker 1:  Sort Method: quicksort  Memory: 25kB
              ->  Parallel Seq Scan on profile_views  (cost=0.00..23155.67 rows=1361 width=16) (actual time=9.367..51.968 rows=1173.33 loops=3)
                    Filter: (viewer_user_id = 101)
                    Rows Removed by Filter: 665493
                    Buffers: shared hit=11796 read=943 written=37
Planning Time: 0.074 ms
Execution Time: 70.351 ms
```

**What the baseline plan shows**

The baseline plan performs a parallel sequential scan, filters for `viewer_user_id = 101`, sorts the qualifying rows with a top-N heapsort, and merges worker results. PostgreSQL still touches a large portion of the table to find those rows. The explicit `Sort` node is present because the table scan does not deliver rows in `viewed_at DESC` order.

**Create the index and refresh statistics**

```sql
CREATE INDEX idx_profile_views_viewer_time
ON profile_views(viewer_user_id, viewed_at);

ANALYZE profile_views;
```

The same `EXPLAIN (ANALYZE, BUFFERS)` query was executed three times again; the third warm-cache plan is documented below.

**Indexed plan (warm cache)**

```text
Limit  (cost=0.43..70.46 rows=20 width=16) (actual time=0.008..0.026 rows=20.00 loops=1)
  Buffers: shared hit=23
  ->  Index Scan Backward using idx_profile_views_viewer_time on profile_views  (cost=0.43..13541.15 rows=3867 width=16) (actual time=0.008..0.024 rows=20.00 loops=1)
        Index Cond: (viewer_user_id = 101)
        Index Searches: 1
        Buffers: shared hit=23
Planning Time: 0.038 ms
Execution Time: 0.033 ms
```

**What changed**

1. The scan became index-backed: `Index Scan Backward` on `idx_profile_views_viewer_time`.
2. The explicit `Sort` node disappeared because the composite index already provides `(viewer_user_id, viewed_at)` order, and a backward scan satisfies `ORDER BY viewed_at DESC` for a single viewer.
3. Buffer traffic dropped sharply (from thousands of pages to 23 hits).
4. Warm-cache execution time dropped from about 70 ms to about 0.03 ms in this run.

`view_id` remains in the `SELECT` list, so PostgreSQL still reads heap tuples for those columns. This run used an index-backed table access path, not an index-only scan.

**Engineering interpretation**

Planner choice depends on statistics, selectivity, table size, cache state, PostgreSQL version, hardware, and query shape. Another environment can produce a different valid plan. The durable lesson is unchanged: inspect `EXPLAIN (ANALYZE, BUFFERS)` and measure before treating an index as a success.

**Counter-example (separate experiment — representative example output)**

The `city = 'Pune'` case below is a **different table and query**. It is not part of the `profile_views` measurement above. The plan text here is a **representative example output** for teaching selectivity, not a warm-cache measurement from the same PostgreSQL run.

When a condition matches a large share of rows (for example roughly 20% of a `users` table live in `'Pune'`), PostgreSQL often prefers a sequential scan even if an index on `city` exists, because locating and assembling that many heap rows through the index can cost more than reading the table once.

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT user_id, name
FROM users
WHERE city = 'Pune';
```

Representative shape:

```text
Seq Scan on users
  Filter: (city = 'Pune')
  Rows Removed by Filter: ...
```

An index can help one query and still be the wrong tool for another. That is why evaluation starts from the workload, not from a list of columns.

---

## 11. When an Index May Not Help

Indexes are not universally beneficial.

### 11.1 Small tables

For a small table, scanning all rows may be cheaper than traversing an index and retrieving the matching records.

### 11.2 Queries that return most rows

If a query needs most of the table, a sequential scan may be more efficient than using an index to locate a large number of individual rows.

### 11.3 Low-selectivity conditions

A condition that matches most rows may not narrow the search enough to justify index access.

However, selectivity must be considered alongside other query requirements. An index on a low-selectivity column may still be useful in a composite or partial-index design.

### 11.4 Queries that cannot use the index effectively

A query expression may not match the index definition or the operations supported by the index type.

For example, a normal B-tree index on a text column does not automatically provide the best access path for every possible pattern-matching operation.

Expression indexes, operator classes, or other index types may be relevant in specific cases, but these are advanced design decisions.

### 11.5 Too many indexes

A large number of indexes can increase write costs, storage use, and maintenance complexity.

**Engineering lesson:** Add indexes to solve identified access problems, not simply because indexing a column is possible.

---

## 12. How to Evaluate an Index in Practice

The correct workflow is to start with the query and the workload, not with a list of columns.

### Step 1: Identify the actual query

For example:

```sql
SELECT user_id, name
FROM users
WHERE city = 'Pune';
```

Understand what the query returns and how often the application runs it.

### Step 2: Understand the data

Consider:

- Table size.
- Number of distinct city values.
- Percentage of users in Pune.
- Whether city values are frequently updated.
- Whether other queries use the same column.

These factors influence the usefulness and cost of an index.

### Step 3: Check existing indexes

Before creating a new index, determine whether the table already has an index that supports the query.

Primary keys and unique constraints may already have created indexes.

### Step 4: Inspect the execution plan

PostgreSQL provides `EXPLAIN` to show the plan the database expects to use.

```sql
EXPLAIN
SELECT user_id, name
FROM users
WHERE city = 'Pune';
```

The plan can indicate whether PostgreSQL expects a sequential scan, index scan, bitmap scan, or another strategy.

An execution plan describes the database's chosen strategy; it is not merely a description of the SQL syntax.

### Step 5: Measure when necessary

`EXPLAIN ANALYZE` executes the query and reports actual execution information.

```sql
EXPLAIN ANALYZE
SELECT user_id, name
FROM users
WHERE city = 'Pune';
```

Use it carefully, especially for statements that modify data, because it actually executes the statement. For a `SELECT`, it executes the query and reports runtime behavior for that execution.

A single measurement is not always representative. Results may vary with cache state, concurrent activity, data distribution, and other conditions.

### Step 6: Test a candidate index

Create a candidate index in an appropriate development or test environment, then compare execution plans and measured performance.

Also consider write overhead and storage requirements.

### Step 7: Keep or reject the change based on evidence

An index is justified when its benefits to important workloads outweigh its maintenance costs.

Do not assume a query became faster merely because an index was created.

---

## 13. Production Engineering Perspective

### 13.1 Optimize important workloads, not isolated queries

A database serves a workload consisting of many queries and writes.

An index that speeds up one query may slow down writes or increase storage. A design should be evaluated against the overall workload.

### 13.2 Consider write frequency

An index on a frequently updated column can introduce ongoing maintenance work.

If a value changes rarely and is used heavily for lookups, the trade-off may be favorable. If it changes on almost every write and provides little query benefit, it may not be.

### 13.3 Avoid duplicate indexes

Creating equivalent indexes wastes storage and may increase maintenance costs.

Check existing primary keys, unique constraints, and explicitly created indexes before adding another.

### 13.4 Monitor index usefulness over time

Application access patterns change. A query that was important during one phase of development may become less relevant, while a new feature may introduce a different bottleneck.

Index decisions should be revisited using query behavior and operational evidence.

### 13.5 Understand the limits of EXPLAIN

A query plan helps explain how the database intends to access data.

It does not by itself prove that the complete application request is fast. End-to-end latency can also include connection acquisition, network communication, application processing, serialization, and other work.

Database-level optimization and application-level performance analysis are related but distinct activities.

---

## 14. Common Mistakes

### Mistake 1: Assuming every index makes every query faster

An index can be irrelevant or less efficient than a scan for a particular query.

**Better approach:** Evaluate the query, data distribution, execution plan, and workload.

### Mistake 2: Indexing every column used in WHERE

Some conditions match most rows, some are rarely used, and some do not benefit from the proposed index.

**Better approach:** Choose indexes based on important access patterns and evidence.

### Mistake 3: Ignoring write overhead

Each additional index can add maintenance work to inserts, updates, and deletes.

**Better approach:** Evaluate read benefits and write costs together.

### Mistake 4: Duplicating primary-key indexes

PostgreSQL already creates an index to enforce a primary key.

**Better approach:** Inspect existing indexes before adding another.

### Mistake 5: Assuming a low-cardinality column can never be indexed

A Boolean or status column may have limited distinct values, but an index may still help under particular data distributions or query patterns.

**Better approach:** Treat cardinality and selectivity as evidence, not absolute rules.

### Mistake 6: Creating a composite index without understanding column order

The order of columns influences which query patterns an index can support efficiently.

**Better approach:** Design the index around the query's filters, ordering, and workload.

### Mistake 7: Assuming the database must use an available index

The DBMS may decide that another plan is cheaper.

**Better approach:** Inspect the execution plan and understand why the optimizer selected that strategy.

### Mistake 8: Measuring only one query execution

A single run can be affected by cache state and concurrent workload.

**Better approach:** Use repeatable measurements and representative conditions.

---

## 15. Interview Questions and Answers

### Q1. What is a database index?

A database index is an additional data structure that helps the DBMS locate or access records efficiently for supported query patterns. It consumes storage and requires maintenance as data changes.

### Q2. Why can an index make a query faster?

A suitable index can help the database find matching records without examining every row. Whether it improves performance depends on the query, data distribution, and cost of retrieving the matching records.

### Q3. What is the difference between a table scan and an index scan?

A table scan examines table rows to evaluate the query. An index scan uses an index to locate relevant entries and may retrieve corresponding table rows. Either approach can be appropriate depending on the workload.

### Q4. What is selectivity?

Selectivity describes how narrowly a condition identifies records. A condition that matches a small fraction of the table is generally more selective than one that matches most rows.

### Q5. Why can too many indexes hurt performance?

Indexes consume storage and require maintenance during inserts, updates, and deletes. Excessive indexing can increase write overhead and operational complexity.

### Q6. Why might an index on a Boolean column be ineffective?

If most rows have the same Boolean value, a query filtering on that value may return most of the table. An index may not reduce the work enough to outperform a scan. However, the actual result depends on the workload and index design.

### Q7. What is a composite index?

A composite index includes multiple columns in a defined order. It can support queries that use suitable combinations of those columns, but column order affects the access patterns it supports.

### Q8. Does creating an index guarantee that PostgreSQL will use it?

No. PostgreSQL's query planner chooses an execution plan based on the query, available indexes, statistics, and estimated costs.

### Q9. What is the relationship between a primary key and an index in PostgreSQL?

PostgreSQL creates a unique index to enforce a primary key. A separate identical index is generally unnecessary.

### Q10. How would you decide whether to add an index?

I would identify the important query, understand its frequency and data distribution, inspect existing indexes, examine the execution plan, measure representative performance, and evaluate the storage and write-maintenance costs of a candidate index.

### Q11. What is the purpose of EXPLAIN ANALYZE?

In PostgreSQL, `EXPLAIN ANALYZE` executes a statement and reports actual execution information alongside the plan. It helps compare expected behavior with observed behavior, but the result should be interpreted in the context of the workload.

### Q12. Can an index improve sorting as well as filtering?

Yes. A suitable index may provide rows in a useful order and reduce sorting work. Whether it does so depends on the index definition, query, ordering requirements, and chosen plan.

---

## 16. Quick Revision

- An index is an additional data structure that supports particular data-access patterns.
- A table scan examines rows to evaluate a query.
- Indexed access can narrow the search when a suitable index is beneficial.
- B-tree is PostgreSQL's default index type.
- Selectivity helps estimate how narrowly a condition filters data.
- High selectivity can make an index attractive, but selectivity is not the only factor.
- Indexes consume storage and add write-maintenance overhead.
- Primary keys and unique constraints create supporting indexes in PostgreSQL.
- Composite indexes contain multiple columns in a defined order.
- Indexes can sometimes support sorting as well as filtering.
- The DBMS chooses whether an available index is useful.
- `EXPLAIN` displays a plan; `EXPLAIN ANALYZE` executes the statement and reports actual execution information.
- Index decisions should be based on workload requirements and evidence.

---

## 17. Key Takeaways

Indexes are a performance tool, not a universal requirement for every column.

A good indexing decision starts with an important query and an understanding of the data it processes. You then evaluate whether a suitable index can reduce the work enough to justify its storage and maintenance costs.

As an engineer, you should be able to explain both sides of the trade-off: why an index may help a query and why the same index may impose costs elsewhere in the system.

The next step is to understand how databases preserve correctness when multiple operations must succeed or fail together.

## 18. Further Reading

Consult the official PostgreSQL documentation for implementation-specific details:

- [PostgreSQL — Indexes](https://www.postgresql.org/docs/current/indexes.html)
- [PostgreSQL — Index Types](https://www.postgresql.org/docs/current/indexes-types.html)
- [PostgreSQL — Multicolumn Indexes](https://www.postgresql.org/docs/current/indexes-multicolumn.html)
- [PostgreSQL — EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html)
- [PostgreSQL — CREATE INDEX](https://www.postgresql.org/docs/current/sql-createindex.html)

---

## Completion Check

Before proceeding, answer these questions without looking at the chapter:

1. Why might an index help find a small number of records in a large table?
2. Why can a sequential scan be faster than an index scan?
3. How does selectivity influence an indexing decision?
4. Why does an index on a frequently updated column have a cost?
5. What is the difference between an index on `(city, age)` and one on `(age, city)`?
6. Why might PostgreSQL ignore an available index?
7. How would you use `EXPLAIN` and `EXPLAIN ANALYZE` to investigate a slow query?
8. Why should you inspect existing indexes before creating a new one?

**Practical exercise:** Consider an application with these query patterns:

- Retrieve a user by `user_id`.
- Find users by city.
- Retrieve the latest profile views for one viewer.
- Count users by verification status.
- Update a user's city.

For each query pattern, propose whether an index should be considered. Explain the expected read benefit, likely write cost, and any assumptions about table size or data distribution.

Do not create an index for every query automatically. Justify each proposed index and explain what evidence you would collect before keeping it.

When you can reason about both the benefits and costs of an index, proceed to **Transactions**.
