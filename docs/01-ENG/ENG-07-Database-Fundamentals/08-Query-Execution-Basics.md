# Query Execution Basics

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain how a database processes a SQL query from submission to result.
- Distinguish parsing, validation, planning, optimization, and execution.
- Understand the difference between a logical query operation and its physical implementation.
- Explain the roles of sequential scans, index scans, joins, sorting, and aggregation at a foundational level.
- Read basic PostgreSQL `EXPLAIN` output and identify important execution-plan fields.
- Understand why logically equivalent SQL queries can have different performance.
- Diagnose common query-performance problems without prematurely changing the schema or adding indexes.

## Prerequisites

You should understand:

- Basic SQL operations and joins.
- Relational tables, keys, and relationships.
- Indexes and their read/write trade-offs.
- Database transactions at a foundational level.

Recommended prerequisites:

- [SQL Fundamentals](02-SQL-Fundamentals.md)
- [Keys and Constraints](04-Keys-and-Constraints.md)
- [Indexing Fundamentals](05-Indexing-Fundamentals.md)
- [Transactions](06-Transactions.md)

**Estimated reading time:** 40–50 minutes.

---

## 1. Before We Start

Consider this query against a database containing millions of user profiles:

```sql
SELECT user_id, full_name
FROM user_profile
WHERE city = 'Bengaluru'
ORDER BY created_at DESC
LIMIT 20;
```

The query appears simple. It asks the database to:

1. Find profiles in Bengaluru.
2. Sort matching profiles by creation time, newest first.
3. Return only 20 rows.

But the database must decide how to perform these operations.

Should it inspect every row in the table?

Should it use an index?

Should it sort every matching row before returning the first 20?

Can an existing index help with both filtering and ordering?

The answers depend on the table's structure, available indexes, data distribution, statistics, and database execution engine.

**Writing a SQL query describes the result you want. Query execution is the process by which the database determines how to produce that result.**

Understanding this distinction is essential when building applications that depend on databases.

---

## 2. Why Query Execution Exists

SQL is a declarative language. You describe the desired result without specifying every low-level operation the database must perform.

For example:

```sql
SELECT *
FROM orders
WHERE customer_id = 105;
```

You do not explicitly instruct the database to:

- Open a particular file.
- Read a particular disk page.
- Traverse an index.
- Compare individual records.
- Allocate memory for intermediate results.
- Return rows through a network connection.

The database engine manages these details.

This abstraction provides flexibility. The same logical query may be executed using different physical strategies depending on the available data structures and runtime conditions.

Without a query planner, developers would have to choose and manage low-level access paths for every query. That would make applications more difficult to maintain and less adaptable to changing data volumes.

### The engineering problem

A database needs to produce the correct result while balancing factors such as:

- CPU consumption.
- Memory consumption.
- Disk I/O.
- Number of rows processed.
- Number of rows returned.
- Execution time.
- Resource contention under concurrent workloads.

The planner estimates which available strategy is likely to be efficient. The executor then carries out the selected plan.

The chosen plan is not guaranteed to be optimal in every runtime situation. Estimates can be inaccurate, and actual performance depends on more than the SQL text alone.

---

## 3. The Query Execution Lifecycle

A useful conceptual model is:

```text
SQL Query
    |
    v
Parsing
    |
    v
Validation and Semantic Analysis
    |
    v
Query Rewriting
    |
    v
Planning and Optimization
    |
    v
Execution Plan
    |
    v
Execution
    |
    v
Result Rows
```

This diagram represents a simplified lifecycle. The exact internal implementation and phase boundaries depend on the database system.

### 3.1 Parsing

The database checks whether the SQL statement follows the language's syntax rules and constructs an internal representation of the query.

For example:

```sql
SELECT user_id
FROM user_profile
WHERE city = 'Bengaluru';
```

The parser recognizes the `SELECT`, `FROM`, and `WHERE` clauses and their relationships.

A malformed statement such as:

```sql
SELECT FROM user_profile;
```

fails before normal query execution because the SQL syntax is invalid.

### 3.2 Validation and semantic analysis

The database resolves the objects and attributes referenced by the query and checks whether the statement is meaningful in the current database context.

Examples of problems include:

- Referencing a table that does not exist.
- Referencing a column that does not exist.
- Using an operation with incompatible data types.
- Violating applicable permissions.

A syntactically valid query can still fail semantic validation.

For example:

```sql
SELECT nonexistent_column
FROM user_profile;
```

If that column does not exist, the database cannot execute the intended query.

### 3.3 Query rewriting

Some database systems transform a query into an equivalent internal representation before planning.

This may involve simplifying expressions, expanding views, or applying transformations that preserve the query's intended meaning.

The goal is to give the planner a representation that can be optimized.

Rewriting is not the same as physically reading rows. It changes the internal representation of the request.

### 3.4 Planning and optimization

The planner evaluates candidate execution strategies and estimates their costs.

For a filtered query, possible strategies may include:

- Scanning the table.
- Using an index to locate matching rows.
- Using an index that can also support the requested ordering.

For joins, the planner may consider different join algorithms and join orders.

The selected plan is based on estimated costs and available alternatives, not on a universal rule that one operation is always faster.

### 3.5 Execution

The executor follows the selected physical plan.

Depending on the plan, it may:

- Read table pages.
- Traverse index structures.
- Apply filters.
- Join rows from multiple relations.
- Sort data.
- Aggregate values.
- Stop early when a `LIMIT` condition is satisfied.

The executor produces rows according to the query's semantics.

### 3.6 Returning results

The database sends result rows to the client or application.

End-to-end latency can include more than database execution:

- Network communication.
- Query submission and connection overhead.
- Result serialization.
- Transferring large result sets.
- Application-side processing.

Consequently, a fast database execution plan does not necessarily mean the complete API request is fast.

---

## 4. Logical Operations Versus Physical Operations

One of the most important concepts in query execution is the distinction between what a query means and how it is executed.

### 4.1 Logical operations

Logical operations describe the required transformations of data.

Examples include:

- Filtering rows.
- Selecting columns.
- Joining relations.
- Grouping rows.
- Sorting results.
- Limiting the result set.

For example:

```sql
SELECT full_name
FROM user_profile
WHERE city = 'Bengaluru';
```

Logically, the query filters profiles by city and returns their names.

### 4.2 Physical operations

Physical operations describe the concrete methods used to implement the logical request.

Examples include:

- Sequential scan.
- Index scan.
- Index-only scan.
- Nested-loop join.
- Hash join.
- Merge join.
- Sort operation.
- Hash aggregation.

The available operations depend on the database system and its execution engine.

A logical filter does not require a particular physical scan. The database may use a sequential scan or an index-based strategy while preserving the query's meaning.

### 4.3 Why this distinction matters

Consider:

```sql
SELECT user_id
FROM user_profile
WHERE user_id = 500;
```

If `user_id` has an appropriate index, an index-based access path may be attractive.

Now consider:

```sql
SELECT *
FROM user_profile;
```

If the query needs nearly every row and every column, scanning the table sequentially may be more efficient than locating rows through an index and then retrieving their table records individually.

The logical request determines the required result. The physical plan determines the method used to produce it.

---

## 5. How a Database Retrieves Data

Before examining execution plans, understand the main access strategies.

### 5.1 Sequential scan

A sequential scan examines table pages in sequence and evaluates rows against applicable conditions.

Conceptually:

```text
Read table pages
       |
       v
Inspect rows
       |
       v
Evaluate filter
       |
       v
Return qualifying rows
```

Example:

```sql
SELECT user_id, full_name
FROM user_profile
WHERE account_status = 'active';
```

A sequential scan can be reasonable when:

- A large proportion of rows qualifies.
- The table is small.
- An appropriate index does not exist.
- Reading the table sequentially is cheaper than using an index.

A sequential scan is not automatically a performance problem.

### 5.2 Index scan

An index scan uses an index to identify rows that may satisfy the query.

For example:

```sql
SELECT user_id, full_name
FROM user_profile
WHERE user_id = 500;
```

If a suitable index exists, the database may use it to locate the relevant row without examining the entire table.

However, an index scan can involve additional work:

1. Traverse the index.
2. Identify matching row locations.
3. Retrieve the corresponding table records when necessary.
4. Apply any remaining conditions.
5. Produce the result.

If a query returns a large fraction of the table, repeated table lookups can make an index scan less attractive than a sequential scan.

### 5.3 Index-only scan

In PostgreSQL, an index-only scan can return required column values directly from the index when the index contains the necessary information and PostgreSQL's visibility requirements permit it.

For example, an index on `user_id` and `city` might help a query that needs only those columns.

An index-only scan does not guarantee that no table access will occur. PostgreSQL may still need heap access to verify tuple visibility when visibility-map information is insufficient.

### 5.4 Choosing between access paths

The planner estimates costs using available information, including table statistics, index definitions, and the query's predicates.

Its decision can change when:

- The table grows.
- The proportion of matching rows changes.
- Statistics become outdated.
- The query requests additional columns.
- Available indexes change.
- Relevant configuration or runtime conditions change.

The correct engineering response is to inspect the actual plan rather than assume that a particular SQL statement must use a specific access method.

---

## 6. Filtering, Sorting, and LIMIT

Consider:

```sql
SELECT user_id, full_name, created_at
FROM user_profile
WHERE city = 'Bengaluru'
ORDER BY created_at DESC
LIMIT 20;
```

The query combines three requirements.

### 6.1 Filtering

The database must identify rows satisfying:

```sql
city = 'Bengaluru'
```

An index that starts with `city` may help locate matching rows.

### 6.2 Sorting

The database must return rows in descending creation-time order.

If the selected access path does not already provide a usable ordering, the plan may need a sort operation.

Sorting can consume CPU and memory. Depending on the size of the data and available resources, it may also involve temporary disk I/O.

### 6.3 Limiting

The `LIMIT 20` clause restricts the number of rows returned.

It does not guarantee that the database examines only 20 rows.

If the database must inspect many rows to identify the newest 20 qualifying records, the work may still be substantial.

### 6.4 Why index design and query execution are connected

An index such as:

```sql
CREATE INDEX idx_user_profile_city_created_at
ON user_profile (city, created_at DESC);
```

may support filtering by city and retrieving rows in creation-time order.

Whether PostgreSQL chooses this index depends on the full query, available statistics, table structure, and estimated costs.

The important lesson is that access paths can support multiple requirements, but index selection should be validated against the actual workload.

See [Indexing Fundamentals](05-Indexing-Fundamentals.md) for index structure, column order, and index maintenance trade-offs.

---

## 7. How Joins Are Executed

A SQL join describes a relationship between rows. The database must choose a physical strategy to implement that relationship.

Three important join algorithms are nested-loop join, hash join, and merge join.

### 7.1 Nested-loop join

Conceptually, a nested-loop join takes rows from one input and searches for matching rows in the other input.

```text
For each row from input A:
    Find matching rows in input B
    Produce matching combinations
```

This can work well when:

- One input is small.
- The other input has an efficient index for finding matching rows.
- Only a small number of matches is required.

It can perform poorly when both inputs are large and the matching process requires repeatedly scanning a large input.

A nested-loop join is not inherently inefficient. Its performance depends on the input sizes and access paths.

### 7.2 Hash join

A hash join commonly builds an in-memory hash structure from one input and probes it using rows from the other input.

Conceptually:

```text
Build phase:
    Read one input
    Build hash structure using join key

Probe phase:
    Read other input
    Look up matching keys
    Produce matching rows
```

Hash joins are often useful for equijoins between sufficiently large inputs when building and probing a hash table is cost-effective.

Memory availability matters. If the hash operation cannot fit its working data in memory, it may require additional work involving temporary storage.

### 7.3 Merge join

A merge join processes two inputs ordered by their join keys and advances through them to identify matching values.

If suitable ordering is already available, a merge join may avoid some sorting work.

If the inputs are not appropriately ordered, sorting them can add cost.

### 7.4 Comparing join strategies

| Join strategy | General idea | Often useful when |
|---|---|---|
| Nested loop | Repeatedly search for matches in the other input. | One input is small or indexed lookups are efficient. |
| Hash join | Build a hash structure and probe it with the other input. | Equijoins can benefit from hashing. |
| Merge join | Match rows while advancing through ordered inputs. | Inputs are already ordered or sorting is worthwhile. |

These are general tendencies, not guarantees. The optimizer chooses based on the query, estimated input sizes, available access paths, and other costs.

### 7.5 SQL does not normally prescribe join order

For ordinary relational queries, SQL describes the desired relationships and result. The optimizer may reorder joins when the transformation is semantically valid.

This flexibility allows the database to choose an execution order that reduces intermediate work.

Do not assume the textual order of tables in a query determines the physical order in which they will be processed.

---

## 8. Aggregation and Grouping

Consider:

```sql
SELECT city, COUNT(*) AS profile_count
FROM user_profile
GROUP BY city;
```

The database must group rows by city and compute a count for each group.

Two foundational aggregation strategies are common.

### 8.1 Hash aggregation

The database maintains a hash structure keyed by the grouping attributes and updates the aggregate state for each group.

This can be efficient when the number of groups and the memory requirements are manageable.

### 8.2 Sorted aggregation

The database processes rows ordered by the grouping attributes and updates aggregate values as it encounters each group.

The required ordering may already be available through an access path, or the plan may need to sort the input first.

### 8.3 Why aggregation can be expensive

Aggregation may require processing a large number of input rows even when the final result contains only a few groups.

For example, returning one count per city does not mean the database reads only one row per city.

The amount of input processed and the amount of output returned are different quantities.

This distinction is useful when diagnosing reporting queries and analytical workloads.

---

## 9. Query Optimization and Cost Estimation

A query optimizer evaluates possible execution strategies and selects one according to its cost model.

The planner generally does not measure the complete execution time of every candidate plan before choosing one. It estimates the likely cost using available metadata and statistics.

### 9.1 What influences the plan?

Important factors include:

- Table size.
- Estimated number of qualifying rows.
- Data distribution and value frequencies.
- Available indexes.
- Estimated number of distinct values.
- Join conditions.
- Required sorting and aggregation.
- Expected memory and disk work.
- Cost-model and configuration settings.

The exact factors and estimation algorithms differ by database system.

### 9.2 Cardinality estimation

Cardinality refers to the number of rows in a relation or intermediate result.

For a filtered query, the planner estimates how many rows are likely to satisfy the condition.

Suppose a table has one million rows.

If the planner estimates that only ten rows match, an index-based access path may look attractive.

If it estimates that 900,000 rows match, a sequential scan may be more attractive.

These figures are illustrative. The actual decision depends on the costs of the complete alternatives, not just the matching-row count.

### 9.3 Why estimates can be wrong

Estimation errors may arise when:

- Statistics are outdated.
- Data is highly skewed.
- Multiple columns are correlated.
- Predicates are difficult to estimate.
- Parameter values have different selectivity.
- The real workload differs from the assumptions used during planning.

An inaccurate row-count estimate can influence later choices, including join algorithms and join order.

### 9.4 The practical lesson

A plan that looks reasonable under incorrect estimates may perform poorly.

When investigating a slow query, compare estimated row counts with actual row counts where possible. Large differences can indicate that the planner's assumptions need investigation.

Do not respond to every slow query by adding an index. First determine where the work is occurring and why.

---

## 10. Reading PostgreSQL EXPLAIN Output

PostgreSQL provides `EXPLAIN` to display a planned execution strategy.

Consider:

```sql
EXPLAIN
SELECT user_id
FROM user_profile
WHERE user_id = 500;
```

A simplified example of possible output is:

```text
Index Scan using user_profile_pkey on user_profile
  (cost=0.29..8.30 rows=1 width=8)
  Index Cond: (user_id = 500)
```

This is illustrative output. The exact plan and values depend on the database.

### 10.1 Plan node

`Index Scan` identifies the physical operation used to retrieve rows.

The named index is the access path selected by the planner.

### 10.2 Cost

In PostgreSQL, a cost expression such as:

```text
cost=0.29..8.30
```

contains estimated startup cost and total cost in the planner's cost units.

These are not milliseconds.

The total cost represents the planner's estimated cost of completing that plan node under its model.

Costs are useful for comparing alternatives within the optimizer's model, but they should not be treated as direct wall-clock measurements.

### 10.3 Estimated rows

```text
rows=1
```

is the estimated number of rows emitted by the plan node.

It is not necessarily the number of rows examined internally. Filtering and access-path behavior affect the work required to produce those rows.

### 10.4 Width

```text
width=8
```

is the estimated average size, in bytes, of rows emitted by the node.

This helps the planner estimate the volume of intermediate data.

### 10.5 Conditions

```text
Index Cond: (user_id = 500)
```

indicates a condition used by the index access operation.

Other plan output may include conditions such as:

- `Filter`
- `Join Filter`
- `Sort Key`
- `Hash Cond`
- `Merge Cond`
- `Group Key`

Each describes part of the operation performed by a plan node.

---

## 11. EXPLAIN Versus EXPLAIN ANALYZE

These PostgreSQL commands serve related but different purposes.

### 11.1 EXPLAIN

```sql
EXPLAIN
SELECT user_id, full_name
FROM user_profile
WHERE city = 'Bengaluru';
```

`EXPLAIN` displays the planned strategy and estimated costs without normally executing the query.

This is useful for understanding which operations the planner expects to perform.

### 11.2 EXPLAIN ANALYZE

```sql
EXPLAIN ANALYZE
SELECT user_id, full_name
FROM user_profile
WHERE city = 'Bengaluru';
```

`EXPLAIN ANALYZE` executes the query and reports actual execution measurements alongside plan information.

It can reveal:

- Actual row counts.
- Actual timing for plan nodes.
- Differences between estimated and actual row counts.
- Loop counts.
- Whether operations such as sorts or hash joins use temporary storage.

The reported timings are measurements from the database execution process, not necessarily the full end-to-end latency observed by an application.

### 11.3 Important safety consideration

`EXPLAIN ANALYZE` actually executes the statement.

For a `SELECT`, this can still consume substantial CPU, memory, I/O, and database capacity.

For a data-changing statement such as `UPDATE` or `DELETE`, the statement can modify data. Use appropriate safeguards, such as a controlled test environment or a carefully designed transaction that is rolled back where applicable.

Do not run expensive analysis commands indiscriminately on production systems.

### 11.4 A disciplined inspection workflow

When a query is slow:

1. Capture the exact SQL and relevant parameter values.
2. Run `EXPLAIN` to understand the chosen plan.
3. In a safe environment, use `EXPLAIN ANALYZE` when actual execution measurements are necessary.
4. Compare estimated rows with actual rows.
5. Identify expensive scans, joins, sorts, or aggregations.
6. Investigate the root cause before changing indexes, SQL, or schema design.
7. Re-run representative measurements after the change.

---

## 12. Common Query Execution Problems

### 12.1 Returning too many columns

Consider:

```sql
SELECT *
FROM user_profile
WHERE city = 'Bengaluru';
```

If the application only needs the user ID and display name, retrieving every column may increase the amount of data read, transferred, and processed.

Prefer selecting the required columns when that meaningfully reduces work or payload size:

```sql
SELECT user_id, full_name
FROM user_profile
WHERE city = 'Bengaluru';
```

The benefit depends on the schema, access path, and workload; fewer selected columns do not guarantee a different plan.

### 12.2 Filtering inefficiently

A query may process many rows because its conditions are not selective or because an available index cannot support the relevant access pattern.

Inspect the plan and the number of rows processed before concluding that the query needs a new index.

### 12.3 Sorting large intermediate results

An `ORDER BY` may require a sort operation.

If a query sorts a large set of rows only to return a small result, an appropriate access path may help the database retrieve rows in the desired order.

However, the right solution depends on the filter, ordering, result size, and available indexes.

### 12.4 Joining more rows than necessary

A join can produce a large intermediate result when the join keys or predicates do not reflect the intended relationship.

Verify the join condition and expected relationship cardinality. A missing or incorrect join predicate can produce an unexpectedly large result.

### 12.5 Trusting estimated rows without checking actual behavior

A plan can be based on inaccurate estimates.

When a query behaves unexpectedly, compare estimated and actual row counts rather than assuming the optimizer's assumptions match the real data.

### 12.6 Optimizing SQL text without evidence

A shorter query is not necessarily a faster query.

Different SQL formulations may be transformed into the same or similar plans. Conversely, seemingly minor differences may affect planning or execution.

Evaluate performance using representative data and measurements, not the visual length of the SQL statement.

---

## 13. Query Execution in Production Applications

Database execution is only one stage of an application's request lifecycle.

Consider a FastAPI endpoint that retrieves candidate profiles for a matchmaking application.

A simplified request path might be:

```text
HTTP Request
    |
    v
FastAPI Endpoint
    |
    v
Application Validation
    |
    v
SQL Query
    |
    v
PostgreSQL Planning and Execution
    |
    v
Result Transfer
    |
    v
Application Processing
    |
    v
HTTP Response
```

A slow endpoint does not automatically mean PostgreSQL's query plan is the problem.

Potential bottlenecks include:

- Inefficient database execution.
- Lock waits or resource contention.
- Connection-pool saturation.
- Network latency.
- Large result transfers.
- Repeated queries caused by application logic.
- Expensive transformations after the database returns its rows.

A useful investigation separates database execution time from total request latency.

### 13.1 Measure before optimizing

Collect evidence about:

- Query frequency.
- Execution duration.
- Rows returned.
- Actual plan behavior.
- Connection-pool wait time.
- End-to-end API latency.

The most important optimization target is not always the slowest individual query. A moderately expensive query executed thousands of times may consume more resources than a rarely executed slow query.

### 13.2 Avoid unsafe assumptions about caching

Repeated execution may benefit from cached database pages or application-level caching, but the existence of a cache does not guarantee that a query is cheap.

A query can still perform expensive filtering, joining, sorting, or serialization even when the required data is already in memory.

Treat caching as one factor in the observed behavior, not a substitute for understanding the execution plan.

### 13.3 Query execution and GenAI systems

In GenAI applications, databases often store:

- User and tenant metadata.
- Conversation records.
- Agent execution state.
- Document metadata.
- Permissions and access-control information.
- Job status and audit records.

An inefficient query can increase request latency, database utilization, and operational cost.

For retrieval-heavy or vector-search workloads, specialized retrieval architecture belongs to the Retrieval Engineering domain. This chapter focuses on foundational relational query execution rather than vector-index internals.

---

## 14. Common Mistakes

1. **Assuming every sequential scan is bad.** A sequential scan can be the cheapest way to retrieve a large portion of a table.

2. **Assuming every index scan is good.** Index traversal and subsequent table access can cost more than a sequential scan.

3. **Treating estimated cost as elapsed time.** PostgreSQL cost values are planner units, not milliseconds.

4. **Confusing estimated rows with actual rows.** A large difference can reveal a planning problem, but estimates are not measurements.

5. **Assuming `LIMIT` means only that many rows are examined.** The database may need to process many more rows to identify the requested results.

6. **Assuming SQL join order dictates physical join order.** The optimizer can reorder joins when valid.

7. **Running `EXPLAIN ANALYZE` without considering its effects.** It executes the statement and can consume substantial production resources or modify data for write statements.

8. **Adding indexes before understanding the bottleneck.** Indexes consume storage and increase write and maintenance costs.

9. **Optimizing only the database portion of a request.** Application logic, connection waits, and network transfer can dominate end-to-end latency.

10. **Assuming the optimizer always chooses the fastest real-world plan.** It chooses using estimates and a cost model; inaccurate assumptions can produce poor results.

---

## 15. Interview Questions and Answers

### Q1. What happens when a SQL query is executed?

Conceptually, the database parses the SQL, validates and resolves its references, performs applicable rewrites, selects an execution plan, executes the plan, and returns results. Exact implementation details differ across database systems.

### Q2. What is the difference between a logical query operation and a physical plan operation?

A logical operation describes the required result transformation, such as filtering or joining. A physical operation describes how the database implements it, such as using an index scan or hash join.

### Q3. Why might PostgreSQL choose a sequential scan even when an index exists?

A sequential scan may be cheaper when a large proportion of rows qualifies, the table is small, the index is not useful for the query, or index-based retrieval would require many table lookups.

### Q4. What is cardinality estimation?

Cardinality estimation is the planner's prediction of how many rows an operation will produce. These estimates influence choices such as access paths, join strategies, and join order.

### Q5. What is the difference between `EXPLAIN` and `EXPLAIN ANALYZE`?

`EXPLAIN` displays the planned strategy and estimated costs. PostgreSQL's `EXPLAIN ANALYZE` executes the statement and reports actual execution measurements alongside plan information.

### Q6. Why can a query with `LIMIT 10` still be slow?

The database may need to scan, filter, sort, or join many rows before identifying the ten qualifying rows. The limit constrains the output, not necessarily the amount of work.

### Q7. Compare nested-loop, hash, and merge joins.

A nested-loop join searches for matches for rows from one input. A hash join builds and probes a hash structure. A merge join matches rows from ordered inputs. The best strategy depends on input sizes, ordering, indexes, memory, and estimated costs.

### Q8. Why can a query become slower as the database grows?

The query may process more rows, produce larger intermediate results, require more sorting or aggregation, or become sensitive to changes in data distribution. A plan that was effective for a small table may no longer be appropriate.

### Q9. How would you investigate a slow SQL query?

Start with the exact query and relevant parameters. Inspect `EXPLAIN`, use `EXPLAIN ANALYZE` safely when actual measurements are needed, compare estimated and actual row counts, locate expensive plan nodes, investigate the underlying cause, and validate the proposed fix with representative measurements.

### Q10. Does a good execution plan guarantee a fast API endpoint?

No. End-to-end latency also includes application processing, connection-pool waits, network communication, result transfer, and other operations outside the database executor.

---

## 16. Quick Revision

- **Parsing:** Checks SQL syntax and creates an internal representation.
- **Semantic analysis:** Resolves database objects and validates references and types.
- **Rewriting:** Transforms the query into an equivalent internal representation where applicable.
- **Planning:** Evaluates execution strategies using estimated costs.
- **Execution:** Carries out the selected plan.
- **Sequential scan:** Examines table pages sequentially.
- **Index scan:** Uses an index to identify relevant rows.
- **Index-only scan:** May return values from an index without heap access when PostgreSQL's requirements permit.
- **Nested-loop join:** Searches for matches for rows from one input.
- **Hash join:** Builds and probes a hash structure.
- **Merge join:** Matches rows from ordered inputs.
- **Cardinality estimation:** Predicts the number of rows produced by operations.
- **EXPLAIN:** Displays the planned execution strategy.
- **EXPLAIN ANALYZE:** Executes the statement and reports actual execution measurements.
- **Production diagnosis:** Separate database execution time from end-to-end request latency.

---

## 17. Key Takeaways

1. SQL describes the desired result; the database selects a physical strategy to produce it.
2. Query execution involves planning and executing operations such as scans, joins, sorts, and aggregation.
3. The fastest access path depends on the query, data distribution, available indexes, and estimated costs.
4. The optimizer relies on estimates, which can differ from actual behavior.
5. `EXPLAIN` and `EXPLAIN ANALYZE` are essential diagnostic tools, but they serve different purposes.
6. Query performance must be measured using representative workloads.
7. Database execution is only one component of application latency.
8. A good engineer identifies the bottleneck before changing SQL, indexes, or schema design.

---

## 18. Further Reading

- [PostgreSQL Documentation — Using EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html)
- [PostgreSQL Documentation — Query Planning](https://www.postgresql.org/docs/current/runtime-config-query.html)
- [PostgreSQL Documentation — Planner Statistics](https://www.postgresql.org/docs/current/planner-stats.html)
- [PostgreSQL Documentation — Indexes](https://www.postgresql.org/docs/current/indexes.html)

Use the PostgreSQL documentation to explore the actual plan nodes, cost estimates, and statistics relevant to the version you operate.

---
