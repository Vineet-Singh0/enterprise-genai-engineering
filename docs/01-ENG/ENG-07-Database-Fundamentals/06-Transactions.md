# Transactions

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain why database transactions are necessary.
- Understand transaction boundaries and the role of `BEGIN`, `COMMIT`, and `ROLLBACK`.
- Explain the four ACID properties and the problems they address.
- Understand how transactions help maintain consistency when multiple operations are related.
- Recognize common concurrency problems, including lost updates and dirty reads.
- Understand transaction isolation levels at a foundational level.
- Distinguish atomicity from isolation and durability.
- Identify common transaction mistakes in application code.
- Apply transaction reasoning to realistic backend and enterprise AI workflows.

## Prerequisites

**Primary prerequisite:** [ENG-02 — Programming Foundations](../ENG-02-Programming-Foundations/README.md)

**Previous chapters:**
- [Relational Databases](01-Relational-Databases.md)
- [SQL Fundamentals](02-SQL-Fundamentals.md)
- [Schema Design](03-Schema-Design.md)
- [Keys and Constraints](04-Keys-and-Constraints.md)
- [Indexing Fundamentals](05-Indexing-Fundamentals.md)

You should understand basic SQL, database constraints, and the distinction between application operations and database operations.

**Estimated reading time:** 40–50 minutes.

**SQL dialect:** Examples use PostgreSQL-compatible SQL. Transaction syntax and isolation behavior can vary across database systems.

---

## 1. Before We Start: Why Do Transactions Exist?

Imagine a matrimonial application that allows a user to express interest in another user.

The application needs to perform two operations:

1. Create an interest record.
2. Update a counter representing the number of interests received by the target user.

Conceptually:

```text
Create interest record
          |
          v
Update received-interest counter
```

Suppose the first operation succeeds but the second fails because of a database error.

The system may now contain an interest record while the counter remains unchanged.

The database has reached a state that does not match the application's intended business operation.

The problem is not necessarily that either SQL statement was incorrect. The problem is that the application treated two related changes as independent operations even though they were intended to succeed together.

A transaction provides a way to group database operations into a logical unit of work.

If the operations succeed, the application can commit the transaction. If the transaction cannot complete, the application can roll back its changes.

The core idea is:

> A transaction groups related database operations so that the database can manage their success, failure, and interaction with concurrent work according to defined guarantees.

Transactions are fundamental to systems that manage accounts, orders, payments, reservations, user interactions, and other state changes.

---

## 2. What Is a Database Transaction?

A **database transaction** is a logical unit of work containing one or more database operations.

A transaction might include:

- Reading records.
- Inserting new records.
- Updating existing records.
- Deleting records.
- Checking conditions before performing a change.

The transaction's operations are treated as one logical unit according to the database's transaction semantics.

Consider a simplified interest operation:

```sql
BEGIN;

INSERT INTO user_interests (
    sender_user_id,
    receiver_user_id
)
VALUES (101, 102);

UPDATE users
SET received_interest_count = received_interest_count + 1
WHERE user_id = 102;

COMMIT;
```

This example assumes that the referenced tables and columns exist and that the application has defined the appropriate integrity rules.

The transaction begins, performs two operations, and commits.

If a statement fails and the application determines that the complete operation cannot succeed, it can roll back the transaction instead of committing the partial result.

### 2.1 Why not execute each statement independently?

If each statement commits independently, the first operation might remain committed even if the second operation fails.

A transaction lets the application group the operations so that they can be committed or rolled back together.

However, transaction boundaries must match the business operation. Simply wrapping arbitrary statements in a transaction does not automatically make the overall workflow correct.

### 2.2 Transactions are more than multiple SQL statements

A transaction can contain one statement or many.

For example, a single SQL statement may update several rows. That statement still participates in transaction processing.

The important question is not how many statements exist, but what unit of work must be managed consistently.

---

## 3. Transaction Boundaries

A **transaction boundary** defines which operations belong to the same transaction.

Consider an application that creates a user and their initial partner preferences.

```text
Begin transaction
       |
       v
Create user
       |
       v
Create initial preferences
       |
       v
Commit transaction
```

If the application requires both records to be created together, they belong in the same transaction.

If preference creation fails, the application can roll back the transaction so that the user creation is not left partially completed.

### 3.1 An example using PostgreSQL

```sql
BEGIN;

INSERT INTO users (
    user_id,
    name,
    email
)
VALUES (
    201,
    'Nisha',
    'nisha@example.com'
);

INSERT INTO partner_preferences (
    preference_id,
    user_id,
    preferred_city
)
VALUES (
    601,
    201,
    'Pune'
);

COMMIT;
```

Assuming the schema and values satisfy all applicable constraints, the transaction commits both inserts.

If the second statement fails, PostgreSQL marks the transaction as failed. The application should roll it back rather than attempting to commit the intended unit of work.

### 3.2 Explicit rollback

```sql
BEGIN;

UPDATE users
SET city = 'Mumbai'
WHERE user_id = 201;

ROLLBACK;
```

In PostgreSQL, the update is undone as part of the transaction rollback.

The transaction's uncommitted change is not retained as a committed update.

### 3.3 What does COMMIT mean?

`COMMIT` tells the DBMS to commit the current transaction.

After a successful commit, the changes become part of the database's committed state and are available to other transactions according to the database's visibility rules.

The exact visibility of a transaction's changes to concurrent transactions depends on the isolation level and the database implementation.

### 3.4 What does ROLLBACK mean?

`ROLLBACK` abandons the current transaction and undoes its uncommitted database changes.

It does not automatically undo external side effects that happened outside the database, such as:

- Sending an email.
- Calling an external API.
- Publishing a message to an unrelated service.
- Charging a payment through an external provider.

This distinction becomes important in distributed application workflows.

A database transaction controls database state within its transaction boundary. It does not automatically provide a single atomic transaction across arbitrary external systems.

---

## 4. The ACID Properties

ACID describes four important transaction properties:

- **Atomicity**
- **Consistency**
- **Isolation**
- **Durability**

These properties address different failure and correctness problems.

<box gap={3}>
  <row align=start gap={3}>
    <box background="surface-secondary" radius="lg" padding={3} size="48px" align=center justify=center>
      <icon name="layers" size="xl" />
    </box>
    <box flex="1" gap={1}>
      **Atomicity**

      A transaction's database changes are committed as a unit or rolled back as a unit.

      <text color="secondary" size="sm">Problem addressed: partial completion of a logical operation.</text>
    </box>
  </row>
  <divider color="subtle" />
  <row align=start gap={3}>
    <box background="surface-secondary" radius="lg" padding={3} size="48px" align=center justify=center>
      <icon name="shield-check" size="xl" />
    </box>
    <box flex="1" gap={1}>
      **Consistency**

      A transaction that satisfies the database's applicable rules takes the database from one valid state to another valid state.

      <text color="secondary" size="sm">Problem addressed: violating defined integrity rules.</text>
    </box>
  </row>
  <divider color="subtle" />
  <row align=start gap={3}>
    <box background="surface-secondary" radius="lg" padding={3} size="48px" align=center justify=center>
      <icon name="git-compare" size="xl" />
    </box>
    <box flex="1" gap={1}>
      **Isolation**

      Concurrent transactions are controlled so that their interactions follow the guarantees of the chosen isolation level.

      <text color="secondary" size="sm">Problem addressed: incorrect or unexpected interactions between concurrent operations.</text>
    </box>
  </row>
  <divider color="subtle" />
  <row align=start gap={3}>
    <box background="surface-secondary" radius="lg" padding={3} size="48px" align=center justify=center>
      <icon name="hard-drive" size="xl" />
    </box>
    <box flex="1" gap={1}>
      **Durability**

      Once a transaction is successfully committed, its changes are intended to survive subsequent failures according to the DBMS's durability guarantees and configuration.

      <text color="secondary" size="sm">Problem addressed: losing committed changes after a failure.</text>
    </box>
  </row>
</box>

These properties are related but not interchangeable. A database can preserve atomicity while an application still makes an incorrect business decision. It can enforce constraints while concurrent operations still need careful isolation.

Let's examine each property in more detail.

---

## 5. Atomicity: All or Nothing

Atomicity means that the database treats the transaction's changes as one unit.

Consider a simplified transfer between two account balances.

Initial state:

| Account | Balance |
|---|---:|
| A | 1,000 |
| B | 500 |

The application wants to transfer 200 from A to B.

The intended changes are:

1. Subtract 200 from A.
2. Add 200 to B.

If the first update succeeds but the second fails, the database must not leave a committed transfer that has reduced A's balance without increasing B's balance.

A transaction groups the changes:

```sql
BEGIN;

UPDATE accounts
SET balance = balance - 200
WHERE account_id = 'A';

UPDATE accounts
SET balance = balance + 200
WHERE account_id = 'B';

COMMIT;
```

This example illustrates transaction grouping. A production implementation would also need appropriate balance validation, concurrency control, constraints, and verification that both intended accounts were updated.

If the operation fails before commit and the application rolls back, the uncommitted changes are discarded.

### 5.1 What atomicity does not mean

Atomicity does not guarantee that the operation is logically correct.

For example, a transaction could subtract 200 from the wrong account and add 200 to another wrong account. If the SQL statements succeed and no relevant rule is violated, the database may commit them.

Atomicity protects the unit of work against partial completion. It does not infer the application's business intent.

### 5.2 Atomicity and external systems

Suppose the application performs these operations:

1. Update the database.
2. Send an email.
3. Commit the transaction.

If the email is sent but the database transaction rolls back, the email cannot be automatically unsent by the database.

External side effects require separate design strategies, such as sending notifications after commit or using a durable messaging pattern.

---

## 6. Consistency: Preserving Defined Rules

Consistency means that a successful transaction preserves the applicable database invariants.

An **invariant** is a condition that must remain true for the system to be valid.

Examples include:

- Every user identifier is unique.
- Every preference references an existing user.
- A required field is not null.
- A value satisfies a permitted range.
- A business operation preserves a required balance relationship.

Database constraints help enforce many such invariants.

For example:

```sql
CREATE TABLE accounts (
    account_id TEXT PRIMARY KEY,
    balance NUMERIC(12, 2) NOT NULL CHECK (balance >= 0)
);
```

This PostgreSQL-compatible definition prevents duplicate account identifiers and rejects negative balance values.

If a transaction attempts to update an account to a negative balance, the check constraint rejects the change.

### 6.1 Consistency is not automatic business correctness

The DBMS can enforce rules that have been represented through constraints and supported transaction logic.

It cannot automatically enforce every business requirement that exists only in an engineer's understanding.

For example, if an application requires a transfer to affect exactly two specific accounts, the transaction must implement and validate that requirement.

A database cannot infer the intended transfer merely from the existence of two `UPDATE` statements.

### 6.2 Consistency and constraints

Constraints are one important mechanism for preserving consistency.

They complement transactions:

- Constraints define which states are permitted.
- Transactions group operations that move the database between states.

A well-designed transaction must still be written to satisfy the application's requirements.

---

## 7. Isolation: Concurrent Transactions

Applications often serve many requests at the same time.

Two users may update the same record, two workers may process the same job, or several requests may attempt to modify the same account.

Isolation governs how concurrent transactions interact.

Consider a user with a received-interest counter of 10.

Two application requests arrive simultaneously. Each wants to increment the counter by one.

A naive implementation might read the value into application memory, increment it, and write the result back.

```text
Initial counter = 10

Transaction A reads 10
Transaction B reads 10

Transaction A calculates 11
Transaction B calculates 11

Transaction A writes 11
Transaction B writes 11

Final counter = 11
```

Two increments occurred, but the final value increased only once.

This is a lost-update problem.

### 7.1 A safer database-side increment

For a simple counter, the following statement expresses the increment directly in the database:

```sql
UPDATE users
SET received_interest_count = received_interest_count + 1
WHERE user_id = 102;
```

When concurrent transactions execute this statement, PostgreSQL's concurrency control coordinates the updates to the row so that successful increments are not simply overwritten by two stale application-side values.

The exact design must still account for the wider business operation, including duplicate requests and transaction failures.

### 7.2 Isolation is not just about locks

Database systems use concurrency-control mechanisms such as locks and multiversion concurrency control (MVCC).

These mechanisms help manage simultaneous access while balancing correctness and concurrency.

The details differ across DBMSs. At this level, focus on the guarantee an isolation level provides rather than assuming every database handles concurrency identically.

### 7.3 Isolation is configurable

Different isolation levels permit different concurrency behaviors.

Stronger isolation can prevent more anomalies, but it can also increase contention or cause transactions to fail and require retries.

Choosing an isolation level is therefore an engineering decision based on the correctness requirements of the operation.

---

## 8. Durability: Committed Changes Must Persist

Durability means that successfully committed transaction changes are intended to survive subsequent failures, subject to the DBMS's documented guarantees and configuration.

Imagine an application successfully records a profile update and receives confirmation that the transaction committed.

The application expects that update to remain stored even if the database process later restarts.

Database systems use mechanisms such as transaction logs and recovery procedures to provide durability.

In PostgreSQL, write-ahead logging (WAL) is central to crash recovery and durability.

### 8.1 Durability depends on configuration and environment

The exact guarantee can depend on database configuration, storage behavior, replication setup, and the failure scenario.

For example, local commit durability and protection against the loss of an entire storage system or data center are not identical requirements.

Backups, replication, disaster recovery, and operational recovery plans address broader failure scenarios.

These topics belong to production database operations rather than the transaction fundamentals covered here.

### 8.2 Durability versus backups

Durability is not a replacement for backups.

A committed but incorrect update may be durable. If the application accidentally deletes important records and commits the deletion, the database may correctly preserve that deletion.

Backups and recovery mechanisms address recovery from a different class of problems, including data loss and certain forms of accidental modification.

---

## 9. Common Concurrency Problems

Concurrency problems arise when transactions operate on shared data.

Understanding them helps engineers reason about isolation requirements.

### 9.1 Lost update

A lost update occurs when one transaction overwrites another transaction's change based on an outdated value.

For example:

```text
Initial value = 10

A reads 10
B reads 10
A writes 11
B writes 12 based on the old value
```

Depending on the operations, A's update may be lost.

Safer designs may use atomic database updates, row locking, optimistic concurrency checks, or stronger transaction strategies.

### 9.2 Dirty read

A dirty read occurs when a transaction reads a change made by another transaction before that change has been committed.

If the other transaction later rolls back, the reader has observed a value that never became committed database state.

PostgreSQL does not permit dirty reads. Its `READ UNCOMMITTED` isolation level behaves as `READ COMMITTED`.

Other database systems may have different behavior.

### 9.3 Non-repeatable read

A non-repeatable read occurs when a transaction reads the same row twice and obtains different committed values because another transaction modified the row between the reads.

Whether this is possible depends on the isolation level and database implementation.

### 9.4 Phantom read

A phantom read occurs when repeating a query that matches a set of rows produces a different set because concurrent changes introduce or remove rows matching the condition.

For example, a transaction counts users meeting a condition, then repeats the same query after another transaction inserts a matching user.

The result may differ under isolation levels that permit this behavior.

### 9.5 Write skew

Write skew can occur when concurrent transactions read overlapping data, independently decide that their changes preserve a shared rule, and then update different records in ways that jointly violate the rule.

This is a more subtle anomaly than a simple lost update.

Preventing it may require stronger isolation, explicit locking, a suitable constraint, or a redesign of the operation.

The correct solution depends on the invariant and the database's concurrency-control mechanisms.

---

## 10. Transaction Isolation Levels

Isolation levels describe the concurrency guarantees a database provides to transactions.

The traditional SQL isolation levels are:

- Read Uncommitted
- Read Committed
- Repeatable Read
- Serializable

Their exact behavior depends on the DBMS.

### 10.1 Read Uncommitted

The weakest traditional isolation level.

Some database systems may allow dirty reads at this level.

In PostgreSQL, `READ UNCOMMITTED` behaves as `READ COMMITTED`, so dirty reads are not allowed.

### 10.2 Read Committed

A transaction sees committed data according to the database's `READ COMMITTED` semantics.

In PostgreSQL, each statement generally receives a snapshot of committed data as of the start of that statement.

Consequently, two `SELECT` statements in the same transaction may observe different committed data if another transaction commits changes between them.

This is PostgreSQL's default isolation level.

### 10.3 Repeatable Read

Repeatable Read provides a more stable view of data across statements than PostgreSQL's Read Committed level.

In PostgreSQL, a transaction generally works from a transaction-level snapshot, preventing non-repeatable reads and phantom reads as defined by the SQL isolation phenomena.

However, PostgreSQL's Repeatable Read does not prevent every possible serialization anomaly, including write skew in certain scenarios.

### 10.4 Serializable

Serializable aims to provide results equivalent to some serial ordering of concurrent transactions.

This provides strong correctness guarantees, but transactions may be aborted when the database detects conflicts that prevent safe concurrent execution.

Applications must be prepared to retry transactions that fail for retryable concurrency reasons.

### Isolation levels at a glance

| Isolation level | General purpose | PostgreSQL-specific note |
|---|---|---|
| Read Uncommitted | Weakest traditional level | Behaves as Read Committed |
| Read Committed | Read committed data with statement-level snapshots | Default isolation level |
| Repeatable Read | Provide a stable transaction-level view | Does not prevent every serialization anomaly |
| Serializable | Enforce behavior equivalent to a serial ordering | May abort transactions that need to be retried |

Do not assume the labels guarantee identical behavior across all database products.

### 10.5 Which isolation level should an application use?

There is no universal answer.

A simple read operation may work correctly under the database's default isolation level.

A critical operation that preserves a complex invariant may require stronger isolation, explicit locking, or a suitable database constraint.

Before changing the isolation level, identify the anomaly that must be prevented and understand the consequences for contention, throughput, and retries.

Stronger isolation is not a substitute for understanding the business rule.

---

## 11. Transactions in Application Code

Backend applications commonly manage transactions through a database driver, connection pool, or ORM.

The important design principle is to make the transaction boundary explicit.

Consider a simplified Python-style pseudocode example:

```python
def create_user_and_preferences(db, user_data, preferences):
    try:
        user = insert_user(db, user_data)
        insert_preferences(db, user.id, preferences)
        db.commit()
        return user
    except Exception:
        db.rollback()
        raise
```

This is illustrative pseudocode. The exact transaction API depends on the database library and framework.

The intended behavior is:

1. Create the user.
2. Create the associated preferences.
3. Commit both changes if the operation succeeds.
4. Roll back the database transaction if an error occurs.
5. Propagate the error so the caller can handle the failure.

### 11.1 Why rollback matters

After a database operation fails inside a transaction, the application must not blindly continue as though the transaction were still healthy.

In PostgreSQL, a statement error generally leaves the transaction in a failed state until it is rolled back, or until an applicable savepoint recovery path is used.

Application code should follow the transaction behavior of the database driver and framework it uses.

### 11.2 Keep transaction boundaries focused

A transaction should include the database operations that need to succeed together.

Long-running transactions can hold locks or maintain old snapshots for longer than necessary, affecting concurrency and database maintenance.

Avoid performing slow external calls inside a transaction unless the workflow explicitly requires that design and its consequences are understood.

For example, waiting for an LLM response while holding a database transaction open can unnecessarily extend the transaction's lifetime.

A better design may perform the model call outside the transaction, validate the result, and then execute a short database transaction to persist the final state.

This is not appropriate for every workflow, but it is an important default to consider.

### 11.3 Retry behavior

Some transaction failures are transient, including certain serialization failures or deadlocks.

An application may need to retry the complete transaction.

A retry should be deliberate:

- Identify which failures are retryable.
- Retry the whole logical transaction where required.
- Use bounded retry attempts and appropriate backoff.
- Avoid repeating non-transactional external side effects unintentionally.
- Ensure the operation is safe to repeat or has an idempotency strategy.

Retrying an arbitrary individual statement is not always equivalent to retrying the complete transaction.

---

## 12. Transactions and External Services

Enterprise applications often combine database writes with external operations.

For example, an agent workflow might:

1. Create a processing-job record.
2. Call an LLM.
3. Store the generated result.
4. Publish a completion notification.

A relational database transaction does not automatically make all four operations atomic.

If the LLM call succeeds but the database transaction fails, the model call cannot be undone by rolling back the database.

Likewise, a database commit cannot guarantee that an external notification was delivered.

### 12.1 Separate database atomicity from workflow reliability

Database transactions protect database changes within their boundary.

Cross-service workflows require additional patterns when the system must handle failures between components.

Examples include:

- Durable job state.
- Idempotent operations.
- Retry policies.
- Outbox patterns for reliable event publication.
- Saga-style coordination for multi-step distributed operations.

These patterns are introduced here only to clarify the boundary of ordinary database transactions. Their detailed design belongs to distributed systems and production engineering.

### 12.2 A practical AI application example

Suppose a retrieval-augmented generation system stores a document-processing job.

A short database transaction might:

- Mark the job as processing.
- Record the attempt identifier.
- Commit the new job state.

The system then performs document parsing, embedding generation, or model inference outside that transaction.

After processing, another transaction stores the result metadata and updates the job status.

This design can reduce transaction duration while making the processing lifecycle explicit.

It still requires a strategy for retries, duplicate work, partial failures, and consistency between job state and generated artifacts.

---

## 13. Production Engineering Perspective

### 13.1 Identify the business invariant first

Before selecting a transaction strategy, ask:

- What must remain true?
- Which operations must succeed together?
- What concurrent operations are possible?
- What should happen when an operation fails?
- Which failures require retries?

These questions define the correctness problem.

### 13.2 Choose the smallest correct transaction boundary

A transaction should include the database changes that form one logical unit of work.

A transaction that is too small can allow partial business operations. A transaction that is unnecessarily large can increase lock duration and contention.

### 13.3 Do not confuse a transaction with a business workflow

A business workflow may span several services and take minutes or hours.

A database transaction is usually a much smaller unit of database work.

Trying to keep one database transaction open across a long workflow can cause operational problems and does not automatically make external actions reversible.

### 13.4 Treat retries as part of the design

A transaction may fail because of concurrency conflicts, connection problems, or other errors.

Applications should distinguish retryable failures from permanent errors and ensure that retrying does not duplicate unintended effects.

### 13.5 Verify assumptions about the DBMS

Transaction defaults, isolation behavior, lock semantics, and durability configuration differ across systems.

Use the target database's documentation when correctness depends on a specific guarantee.

---

## 14. Common Mistakes

### Mistake 1: Committing each statement independently

Related database operations may leave a partial business result if one succeeds and another fails.

**Better approach:** Group the operations that must succeed together in a transaction.

### Mistake 2: Assuming atomicity guarantees business correctness

A transaction can atomically execute incorrect operations.

**Better approach:** Validate the intended business rule as well as the transaction boundary.

### Mistake 3: Holding transactions open during slow external calls

Long-running transactions can increase contention and interfere with database maintenance.

**Better approach:** Keep transactions focused and move expensive external processing outside them when the workflow permits.

### Mistake 4: Ignoring concurrency

Two requests may read the same value and overwrite one another's updates.

**Better approach:** Use appropriate database-side operations, locking, optimistic concurrency controls, constraints, or isolation levels.

### Mistake 5: Assuming every database uses the same isolation semantics

The same isolation-level name can have different implementation details across DBMSs.

**Better approach:** Verify the actual behavior of the target database.

### Mistake 6: Retrying only the statement that failed

The failed operation may depend on reads and decisions made earlier in the transaction.

**Better approach:** Retry the complete logical transaction when the failure requires it.

### Mistake 7: Assuming rollback reverses an external API call

Database rollback only controls the database transaction. It does not undo arbitrary external effects.

**Better approach:** Design explicit coordination, retry, or compensation mechanisms for external operations.

### Mistake 8: Treating durability as a backup strategy

A durable incorrect change can still be permanently committed.

**Better approach:** Combine transaction guarantees with suitable backup, recovery, access-control, and operational practices.

---

## 15. Interview Questions and Answers

### Q1. What is a database transaction?

A transaction is a logical unit of database work that groups one or more operations under defined commit, rollback, and concurrency semantics.

### Q2. Explain the ACID properties.

- Atomicity: the transaction's database changes are committed or rolled back as a unit.
- Consistency: a successful transaction preserves applicable integrity rules.
- Isolation: concurrent transactions interact according to the chosen isolation guarantees.
- Durability: committed changes are intended to survive failures according to the DBMS's guarantees and configuration.

### Q3. What is the difference between COMMIT and ROLLBACK?

`COMMIT` commits the current transaction. `ROLLBACK` abandons the transaction's uncommitted database changes.

### Q4. What is a lost update?

A lost update occurs when concurrent operations overwrite changes based on stale values, causing one update to be lost.

### Q5. What is the difference between atomicity and isolation?

Atomicity concerns whether a transaction's changes succeed or fail as a unit. Isolation concerns how concurrent transactions interact.

### Q6. What is the difference between Read Committed and Repeatable Read in PostgreSQL?

Read Committed generally provides a new snapshot for each statement. Repeatable Read generally provides a stable transaction-level snapshot. PostgreSQL's Repeatable Read still permits some serialization anomalies, so it is not equivalent to Serializable.

### Q7. Does a database transaction include an external API call automatically?

No. A normal database transaction governs database operations within its boundary. External services require separate reliability and coordination strategies.

### Q8. Why should transactions be kept short?

Long-running transactions can hold locks, increase contention, and retain old snapshots. Keeping transactions focused generally improves concurrency and operational behavior.

### Q9. When might an application retry a transaction?

It may retry certain transient concurrency failures, such as serialization failures or deadlocks. The application should retry the appropriate transaction scope and avoid repeating unintended external side effects.

### Q10. Does ACID consistency mean the application can never contain incorrect business data?

No. The database preserves the rules that are correctly defined and enforced. Incorrect application logic can still commit an invalid business result if the relevant invariant is not enforced.

### Q11. Why is rollback not enough for a distributed workflow?

Rollback affects the database transaction but cannot automatically reverse an external action that has already occurred. Distributed workflows need additional coordination, retry, or compensation strategies.

### Q12. How would you prevent two requests from incorrectly updating the same counter?

I would consider an atomic database-side increment, appropriate locking or concurrency control, and transaction boundaries that match the business operation. I would also examine whether duplicate requests require idempotency protection.

---

## 16. Quick Revision

- A transaction groups related database operations into a logical unit of work.
- `BEGIN` starts an explicit transaction in PostgreSQL.
- `COMMIT` commits the transaction.
- `ROLLBACK` abandons uncommitted changes.
- Atomicity protects against partial transaction completion.
- Consistency means preserving applicable database invariants.
- Isolation governs interactions between concurrent transactions.
- Durability protects committed changes according to the DBMS's guarantees.
- Lost updates can occur when concurrent writes use stale values.
- Isolation levels provide different concurrency guarantees.
- PostgreSQL's default isolation level is Read Committed.
- Serializable transactions may require retries.
- A database transaction does not automatically include external API calls.
- Long-running transactions can harm concurrency.
- Application validation, database constraints, and transaction design work together.

---

## 17. Key Takeaways

Transactions are a core mechanism for preserving correctness when an application performs related database operations.

The most important engineering decision is identifying which changes must succeed together and what must remain true when requests execute concurrently.

ACID provides a framework for understanding transaction guarantees, but it does not replace correct schema design, explicit business rules, suitable isolation, or reliable application behavior.

For production systems, transaction boundaries should be deliberate, transactions should generally remain short, and retry behavior should be designed rather than improvised.

## 18. Further Reading

Use the official PostgreSQL documentation for database-specific semantics:

- [PostgreSQL — Transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html)
- [PostgreSQL — Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
- [PostgreSQL — Explicit Locking](https://www.postgresql.org/docs/current/explicit-locking.html)
- [PostgreSQL — Write-Ahead Logging](https://www.postgresql.org/docs/current/wal-intro.html)
- [PostgreSQL — SAVEPOINT](https://www.postgresql.org/docs/current/sql-savepoint.html)

---

## Completion Check

Before proceeding, answer these questions without looking at the chapter:

1. Why should creating a user and creating required associated records sometimes happen in one transaction?
2. Explain the difference between atomicity and consistency using a concrete example.
3. How can two concurrent requests cause a lost update?
4. Why might Read Committed return different values for two reads in the same transaction in PostgreSQL?
5. Why does Serializable isolation sometimes cause a transaction to fail?
6. Why should a transaction generally not remain open while waiting for a slow LLM response?
7. What should an application consider before retrying a failed transaction?
8. Why can a database rollback not undo an email or external API call that has already succeeded?

**Practical exercise:** Design a transaction for recording a user's interest in another user.

Write down:

- The database operations that belong in the transaction.
- The integrity rules that must hold.
- What should happen if one operation fails.
- Which concurrent requests could affect the same records.
- Whether duplicate requests should create duplicate interests.
- What the application should do if a retry is needed.

Then explain which guarantees come from the database transaction and which require additional application logic.

When you can justify the transaction boundary and explain how concurrent requests affect correctness, proceed to **Database Normalization**.
