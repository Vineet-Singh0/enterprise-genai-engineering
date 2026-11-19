# Keys and Constraints

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain why relational databases need keys and constraints.
- Distinguish primary keys, candidate keys, alternate keys, and foreign keys.
- Understand composite keys and when they are appropriate.
- Explain how `UNIQUE`, `NOT NULL`, `CHECK`, and foreign key constraints enforce data integrity.
- Understand how referential integrity works across related tables.
- Distinguish a database-enforced rule from an application-level validation rule.
- Identify common integrity problems caused by missing or incorrectly defined constraints.
- Design appropriate keys and constraints for a practical relational schema.

## Prerequisites

**Primary prerequisite:** [ENG-02 — Programming Foundations](../ENG-02-Programming-Foundations/README.md)

**Previous chapters:**
- [Relational Databases](01-Relational-Databases.md)
- [SQL Fundamentals](02-SQL-Fundamentals.md)
- [Schema Design](03-Schema-Design.md)

You should understand tables, columns, relationships, data types, and basic SQL.

**Estimated reading time:** 35–45 minutes.

**SQL dialect:** Examples use PostgreSQL-compatible SQL. Constraint behavior and some implementation details can vary across database systems.

---

## 1. Before We Start: What Can Go Wrong Without Constraints?

Imagine a matrimonial application storing user profiles in a relational database.

```text
users
-----
user_id
name
email
city
```

Suppose the table contains these records:

| user_id | name | email | city |
|---:|---|---|---|
| 101 | Aarav | aarav@example.com | Pune |
| 102 | Meera | meera@example.com | Mumbai |
| 102 | Rohan | rohan@example.com | Delhi |
| 104 | Ananya | aarav@example.com | Bengaluru |

Several problems are visible.

- Two records use the same `user_id`.
- Two different users use the same email address, even though the application may require email uniqueness.
- The identifier `103` is missing, although missing numeric values are not automatically a problem.

Now imagine another table:

```text
partner_preferences
-------------------
preference_id
user_id
preferred_city
```

It contains:

| preference_id | user_id | preferred_city |
|---:|---:|---|
| 501 | 101 | Mumbai |
| 502 | 999 | Pune |

If user `999` does not exist, the second preference record references a nonexistent user.

These problems can occur when a database schema does not enforce the required rules.

Application code may validate inputs, but different application paths, background jobs, scripts, and future services can accidentally bypass those checks.

**Keys and constraints allow a database to enforce important rules about identity, permitted values, uniqueness, and relationships.**

They are not merely documentation. When correctly defined, they help prevent invalid data from entering the database.

---

## 2. What Is a Key?

A **key** is a column or combination of columns used to identify records or establish relationships between records.

Keys help answer questions such as:

- How do we identify one specific user?
- How do we prevent duplicate identifiers?
- How does a preference record identify its associated user?
- How do we represent a relationship involving multiple columns?

Consider:

```text
users
-----
user_id
name
email
```

If `user_id` uniquely identifies each user, the application can use it to refer to a specific record.

A key is not necessarily a meaningful business value. It can be a generated identifier whose main purpose is to distinguish records.

### Why keys matter

Keys support several important database capabilities:

1. **Identification:** distinguish one record from another.
2. **Integrity:** prevent certain kinds of invalid or duplicate data.
3. **Relationships:** connect records across tables.
4. **Referencing:** give application code a stable way to refer to specific records.

The exact guarantees depend on the key type and the constraints defined on the table.

---

## 3. Candidate Keys

A **candidate key** is a minimal set of attributes that uniquely identifies each record in a relation.

There are two important properties:

- **Uniqueness:** no two distinct records can have the same candidate-key value.
- **Minimality:** removing any attribute from the candidate key would cause it to lose that uniqueness property.

Consider a user table with these attributes:

```text
users
-----
user_id
email
name
city
```

Suppose the application's requirements guarantee that:

- Every user has a unique `user_id`.
- Every user has a unique, non-null email address.

Under these assumptions, both `user_id` and `email` can be candidate keys.

However, the assumptions matter. Email is not inherently unique in every application, and an email address can change. A candidate key must be justified by the domain's rules.

### 3.1 Why minimality matters

Suppose the combination `(country_code, phone_number)` uniquely identifies a user.

If neither column is independently unique, the combination may be a candidate key.

But if `user_id` is also independently unique, the combination `(user_id, email)` is not minimal when `user_id` alone already uniquely identifies every record.

A candidate key is not just any collection of columns that happens to be unique. It must be minimal.

### 3.2 Candidate keys versus ordinary attributes

An ordinary attribute describes a record.

For example:

- `name` describes the user.
- `city` describes the user's location.
- `user_id` identifies the user.

An attribute can serve both descriptive and identifying roles, but the domain rules determine whether it qualifies as a candidate key.

A person's name is generally not a good candidate key because multiple people can share the same name.

---

## 4. Primary Keys

A **primary key** is the candidate key selected as the main identifier for records in a table.

For example:

```sql
CREATE TABLE users (
    user_id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT
);
```

Here, `user_id` is the primary key.

In PostgreSQL, a primary key enforces uniqueness and disallows `NULL` values. A table can have only one primary key constraint, although that key may contain multiple columns.

### 4.1 Why a primary key is useful

Suppose an application needs to update a user's city.

```sql
UPDATE users
SET city = 'Pune'
WHERE user_id = 101;
```

The primary key provides a clear way to identify the intended user.

Without a reliable identifier, the application might accidentally update multiple users who share the same name or another non-unique attribute.

### 4.2 Natural keys and surrogate keys

A primary key may use an existing domain attribute or a generated identifier.

**Natural key:** An attribute that has meaning in the business domain and can uniquely identify a record under the domain's rules.

Examples might include a formally assigned registration number or a globally unique external identifier.

**Surrogate key:** An identifier introduced primarily to identify a database record, such as a generated integer or UUID.

Example:

```sql
CREATE TABLE users (
    user_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT
);
```

In PostgreSQL, the identity definition allows the database to generate values for `user_id`.

### Natural versus surrogate keys

| Consideration | Natural key | Surrogate key |
|---|---|---|
| Meaning | Has domain meaning | Primarily identifies a record |
| Stability | Depends on the domain attribute | Can remain stable independently of descriptive attributes |
| Generation | Comes from business or external data | Commonly generated by the database or application |
| Integration | Can be useful when external systems share the identifier | May require a separate mapping to external identifiers |
| Design risk | Domain values may change or have unexpected uniqueness rules | Adds an identifier that may have no business meaning |

Neither approach is universally better.

For many application tables, a surrogate primary key is a practical default, while natural identifiers can still have their own uniqueness constraints when required.

### 4.3 Primary keys should identify records, not encode changing business meaning

Suppose a user's email address is used as the primary key.

If the user changes their email address, every related reference may need to be updated.

A surrogate key can keep the user's internal identity stable while allowing the email address to change.

The decision depends on the domain and integration requirements, but identity should be designed deliberately rather than chosen solely for convenience.

---

## 5. Alternate Keys and UNIQUE Constraints

When a table has multiple candidate keys, the candidate key selected as the primary key is the primary key. The remaining candidate keys are called **alternate keys**.

For example, suppose both `user_id` and `email` are guaranteed to uniquely identify users.

The design may use:

- `user_id` as the primary key.
- `email` as an alternate key.

In SQL, uniqueness can be enforced using a `UNIQUE` constraint.

```sql
CREATE TABLE users (
    user_id BIGINT PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT NOT NULL
);
```

This prevents duplicate non-null email values under PostgreSQL's default uniqueness behavior.

### 5.1 UNIQUE does not always mean exactly one non-null value per row

In PostgreSQL, a regular `UNIQUE` constraint permits multiple `NULL` values by default because `NULL` values are treated as distinct for uniqueness checking.

For example, a table may contain several rows with `email = NULL` while still satisfying `UNIQUE(email)`.

If the requirement is that every user must have an email address and each address must be unique, use both constraints:

```sql
CREATE TABLE users (
    user_id BIGINT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
);
```

Now the database requires an email value for every row and prevents duplicate email values.

**Important:** `UNIQUE` and `NOT NULL` enforce different rules.

- `UNIQUE` prevents conflicting values.
- `NOT NULL` requires a value to be present.

Exact uniqueness behavior can differ across DBMSs and when special options are used.

### 5.2 Should email be a primary key?

An email address may be unique in a particular application, but it can change and may require domain-specific normalization or verification.

A common design is to use a stable internal primary key and enforce email uniqueness separately if required.

The important question is not whether an attribute looks unique in today's data. It is whether uniqueness is a genuine, durable business rule.

---

## 6. Composite Keys

A **composite key** uses more than one column to identify a record.

Suppose a learning platform stores student enrollments:

```text
enrollments
-----------
student_id
course_id
enrolled_at
```

If each student can enroll in a particular course only once, the pair `(student_id, course_id)` may uniquely identify an enrollment.

A PostgreSQL-compatible definition is:

```sql
CREATE TABLE enrollments (
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    enrolled_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (student_id, course_id)
);
```

The composite primary key prevents duplicate student-course pairs.

### 6.1 When is a composite key appropriate?

A composite key can be useful when the combination of attributes naturally identifies a record.

Examples include:

- A student-course enrollment.
- A user-product association.
- A mapping between two entity identifiers.

However, the choice depends on the business rules.

If a student can enroll in the same course multiple times across different terms, `(student_id, course_id)` may no longer be sufficient. The key might need to include `term_id`, or the table may need a separate surrogate identifier and an appropriate uniqueness rule.

### 6.2 Composite keys are not simply multiple unrelated keys

A composite key identifies a record through the combination of its components.

If the combination is unique but one component alone is not, the key may be minimal.

For example:

```text
student_id | course_id
-----------|----------
101        | 20
101        | 21
102        | 20
```

Neither column uniquely identifies each enrollment by itself, but the pair does.

---

## 7. Foreign Keys

A **foreign key** is a column or set of columns whose values reference a candidate key—commonly a primary key—in another table or in the same table.

Foreign keys establish and can enforce relationships between records.

Consider:

```text
users
-----
user_id
name

partner_preferences
-------------------
preference_id
user_id
preferred_city
```

The `partner_preferences.user_id` column identifies the user associated with a preference record.

A foreign key can enforce that the referenced user exists.

```sql
CREATE TABLE users (
    user_id BIGINT PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE partner_preferences (
    preference_id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    preferred_city TEXT,
    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
);
```

This definition establishes a foreign key from `partner_preferences.user_id` to `users.user_id`.

### 7.1 What does a foreign key prevent?

Assume user `101` exists.

This insert can succeed:

```sql
INSERT INTO partner_preferences (
    preference_id,
    user_id,
    preferred_city
)
VALUES (501, 101, 'Mumbai');
```

But this insert fails when user `999` does not exist:

```sql
INSERT INTO partner_preferences (
    preference_id,
    user_id,
    preferred_city
)
VALUES (502, 999, 'Pune');
```

The database rejects the invalid reference because it violates the foreign key constraint.

This rule is called **referential integrity**.

### 7.2 Foreign keys do not automatically enforce every relationship rule

The preceding foreign key guarantees that a non-null `user_id` references an existing user.

It does not, by itself, guarantee that:

- Each user has exactly one preference record.
- A user can have at most one preference record.
- The user is allowed to choose the specified city.
- The preference satisfies every business rule.

Those requirements need additional constraints or application logic where appropriate.

### 7.3 A foreign key does not automatically require a value

A foreign key column can be nullable unless it is defined as `NOT NULL`.

For example:

```sql
user_id BIGINT REFERENCES users(user_id)
```

This allows a `NULL` value in `user_id`, but any non-null value must satisfy the reference rule.

If every preference must belong to a user, use `NOT NULL` as well.

---

## 8. Referential Integrity and Deletion Behavior

Foreign keys raise an important question:

> What should happen if a referenced record is deleted?

Suppose a user has multiple preference records.

Deleting that user could leave the application with preference records that no longer have a valid owner unless the database or application handles the relationship.

Foreign key constraints allow different behaviors to be configured.

Common options include:

| Option | General behavior |
|---|---|
| `NO ACTION` | Reject a change that would violate the constraint when it is checked |
| `RESTRICT` | Reject a prohibited referenced-row change; timing details depend on the DBMS |
| `CASCADE` | Propagate the delete or update to referencing rows |
| `SET NULL` | Set referencing columns to `NULL` when permitted |
| `SET DEFAULT` | Set referencing columns to their default values, which must still satisfy applicable constraints |

In PostgreSQL, `NO ACTION` is the default foreign key action. The distinction between `NO ACTION` and `RESTRICT` includes constraint-check timing, particularly for deferrable constraints.

### 8.1 ON DELETE CASCADE

Example:

```sql
CREATE TABLE users (
    user_id BIGINT PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE partner_preferences (
    preference_id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL
        REFERENCES users(user_id)
        ON DELETE CASCADE,
    preferred_city TEXT
);
```

With this definition, deleting a user also deletes the user's referencing preference records.

This can be appropriate when preference records have no independent meaning without their owner.

However, cascading deletion should not be chosen casually. If a table stores audit history, financial records, or legally required information, automatically deleting related records may be unacceptable.

### 8.2 ON DELETE SET NULL

A nullable foreign key can instead be configured to become `NULL` when the referenced record is deleted.

This can be appropriate when the referencing record is allowed to survive without its original association.

It is not compatible with a design that requires that foreign key column to be `NOT NULL`.

### 8.3 Choose deletion behavior from domain requirements

Before configuring foreign key actions, ask:

- Does the child record have an independent lifecycle?
- Should related records be retained as history?
- Is deletion permitted at all?
- Can a record meaningfully exist without its parent?
- What do application and retention policies require?

Database constraints should implement deliberate business rules rather than accidental assumptions.

---

## 9. NOT NULL Constraints

A `NOT NULL` constraint requires a column to contain a non-null value.

Example:

```sql
CREATE TABLE users (
    user_id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT
);
```

The database requires a name value but permits a null city.

### Why does this distinction matter?

Not every field has the same requirement.

For example:

- An internal identifier must exist.
- A required name may need to be present.
- A user's city may be unknown or optional.
- A middle name may not apply to every person.

The schema should reflect the intended rules.

### NOT NULL is not the same as a non-empty string

A text value can be non-null and still be empty.

For example:

```sql
INSERT INTO users (user_id, name, city)
VALUES (101, '', 'Pune');
```

The `NOT NULL` constraint does not reject the empty string because an empty string is a value, not `NULL`.

If the business rule prohibits blank or whitespace-only names, additional validation is required. That may involve a suitable `CHECK` constraint and application-level validation, depending on the precise rule and database behavior.

---

## 10. CHECK Constraints

A `CHECK` constraint enforces a Boolean condition on values in a row.

For example:

```sql
CREATE TABLE users (
    user_id BIGINT PRIMARY KEY,
    age INTEGER CHECK (age >= 18)
);
```

This prevents an age below 18 from being stored through ordinary inserts or updates that are subject to the constraint.

The condition is an example business rule, not a universal rule for every user table.

### 10.1 Multiple conditions

A constraint can express more than one requirement.

```sql
CREATE TABLE products (
    product_id BIGINT PRIMARY KEY,
    product_name TEXT NOT NULL,
    price NUMERIC(10, 2) CHECK (price >= 0),
    stock_quantity INTEGER CHECK (stock_quantity >= 0)
);
```

This example prevents negative prices and negative stock quantities.

It does not, by itself, require `price` or `stock_quantity` to be non-null. In SQL, a `CHECK` condition that evaluates to `UNKNOWN` because of `NULL` generally does not cause the row to be rejected.

If the fields must be present, define `NOT NULL` too.

### 10.2 CHECK constraints versus application validation

Application validation can provide immediate and user-friendly feedback.

Database constraints provide a final integrity boundary for operations that reach the database.

For important invariants, using both can be appropriate.

For example, a backend can reject an invalid age before attempting an insert, while the database also enforces the permitted range.

The two checks serve different purposes: one improves application behavior, while the other protects the stored data.

### 10.3 Use CHECK for suitable rules

A `CHECK` constraint is generally suitable for a condition involving the row being inserted or updated.

It should not be treated as a universal substitute for foreign keys, uniqueness constraints, or cross-row consistency mechanisms.

Use the constraint type that matches the integrity rule.

---

## 11. Keys and Constraints: How They Differ

The terms are related, but they are not interchangeable.

| Concept | Main purpose |
|---|---|
| Candidate key | A minimal set of attributes that uniquely identifies a record |
| Primary key | The candidate key selected as the table's main identifier |
| Alternate key | A candidate key not selected as the primary key |
| Composite key | A key composed of multiple columns |
| Foreign key | Establishes a reference to a candidate key in a related table |
| `UNIQUE` constraint | Enforces uniqueness of a column or column combination |
| `NOT NULL` constraint | Prevents null values in a column |
| `CHECK` constraint | Enforces a condition on row values |

A primary key is a key concept implemented through a database constraint.

A foreign key is both a relationship mechanism and an integrity constraint.

The important distinction is between identifying the intended role of a key and choosing the mechanism that enforces the required rule.

---

## 12. Putting It Together: A Small Application Schema

Consider a simplified application with users and partner preferences.

```sql
CREATE TABLE users (
    user_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    age INTEGER CHECK (age >= 18),
    city TEXT
);

CREATE TABLE partner_preferences (
    preference_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id)
        ON DELETE CASCADE,
    preferred_city TEXT
);
```

This PostgreSQL-compatible schema establishes several rules.

### Users table

- The database generates `user_id` values.
- `user_id` uniquely identifies each user.
- Every user must have an email value.
- Email values must be unique.
- Every user must have a name.
- An explicitly supplied age cannot be below 18.
- City is optional.

The age field is nullable in this example because no `NOT NULL` constraint was defined. Whether that is correct depends on the application's requirements.

### Partner preferences table

- The database generates `preference_id` values.
- Every preference must have a `user_id`.
- Every non-null `user_id` must reference an existing user.
- Deleting a user deletes that user's preference records.

Notice what this schema does **not** guarantee: a user may have multiple preference records because `user_id` is not declared unique in `partner_preferences`.

If the application requires at most one preference record per user, that requirement needs an additional uniqueness rule, for example:

```sql
ALTER TABLE partner_preferences
ADD CONSTRAINT uq_partner_preferences_user
UNIQUE (user_id);
```

That change is appropriate only if the business rule truly permits at most one preference row per user.

If multiple preference records are expected, this uniqueness constraint would be incorrect.

This illustrates a fundamental engineering lesson: constraints must reflect domain requirements, not just what seems convenient.

---

## 13. Production Engineering Perspective

### 13.1 Treat constraints as part of the data contract

A database schema communicates what data is allowed.

Constraints make important parts of that contract enforceable, including required values, uniqueness, and valid references.

When multiple services or background processes write to the same database, these guarantees become especially useful.

### 13.2 Do not rely exclusively on application validation

A single API endpoint may validate data correctly while a maintenance script or another service does not.

Database constraints provide protection against invalid operations regardless of which application path attempts them, subject to the DBMS and the permissions of the executing role.

### 13.3 Understand the consequences of a constraint

A new constraint may reject existing data that violates it.

Before adding a constraint to an established database, engineers often need to:

1. Inspect existing records.
2. Identify violations.
3. Decide how invalid data should be corrected.
4. Deploy the schema change.
5. Update application validation where necessary.
6. Verify that the new rule is enforced.

The exact rollout strategy depends on the DBMS, dataset size, and availability requirements.

### 13.4 Avoid constraints that contradict the domain

A `UNIQUE(email)` constraint is appropriate only if duplicate emails are genuinely prohibited.

A composite primary key is appropriate only if the selected combination identifies one record under the domain's rules.

A cascading delete is appropriate only if deleting the parent should also remove dependent records.

Incorrect constraints can block legitimate operations or destroy data that should have been retained.

### 13.5 Balance integrity and operational cost

Keys and constraints provide correctness guarantees, but some constraints require additional checks or supporting database structures.

For example, PostgreSQL uses a unique index to enforce a primary key or a regular unique constraint.

Foreign keys also impose checks on relevant writes and can affect how referenced records are deleted or updated.

These costs are usually justified when the rule is important. They should still be understood when designing high-volume workloads.

---

## 14. Common Mistakes

### Mistake 1: Assuming a primary key and a foreign key do the same thing

A primary key identifies records within a table. A foreign key references a key in another table or the same table.

**Better approach:** Use primary keys for record identity and foreign keys for required references.

### Mistake 2: Assuming UNIQUE also means NOT NULL

In PostgreSQL, a regular `UNIQUE` constraint allows multiple `NULL` values by default.

**Better approach:** Add `NOT NULL` when every row must provide a value.

### Mistake 3: Assuming a foreign key requires a value

A nullable foreign key can contain `NULL`.

**Better approach:** Use `NOT NULL` if every child record must reference a parent.

### Mistake 4: Using an unstable natural key as the primary key without considering its lifecycle

An email address or username may change.

**Better approach:** Evaluate stability and domain semantics before selecting a primary key. A surrogate key may be more appropriate.

### Mistake 5: Adding a composite key without verifying its meaning

A combination of columns should be unique because the domain requires it, not merely because it happens to be unique in current test data.

**Better approach:** Confirm the business rule and the minimality of the candidate key.

### Mistake 6: Using ON DELETE CASCADE everywhere

Cascading deletion may remove historical or independently meaningful data.

**Better approach:** Choose referential actions according to lifecycle, retention, and business requirements.

### Mistake 7: Assuming CHECK automatically rejects NULL

A `CHECK` condition that evaluates to `UNKNOWN` does not normally violate the constraint.

**Better approach:** Combine `CHECK` with `NOT NULL` when both a value and a permitted range are required.

### Mistake 8: Treating constraints as a replacement for all validation

Constraints cannot express every business process or user-facing validation requirement.

**Better approach:** Enforce critical data invariants in the database and use application validation for appropriate business behavior and feedback.

---

## 15. Interview Questions and Answers

### Q1. What is the difference between a primary key and a candidate key?

A candidate key is a minimal set of attributes that uniquely identifies a record. A primary key is the candidate key selected as the main identifier for the table.

### Q2. What is an alternate key?

An alternate key is a candidate key that was not selected as the primary key.

### Q3. What is the difference between a primary key and a unique constraint?

Both enforce uniqueness. In PostgreSQL, a primary key also disallows `NULL` values and identifies the table's main key, while a regular unique constraint permits multiple `NULL` values by default. A table can have one primary key constraint and multiple unique constraints.

### Q4. What is a composite key?

A composite key uses multiple columns together to identify a record. For example, `(student_id, course_id)` can identify an enrollment if each student can enroll in a course only once.

### Q5. What is referential integrity?

Referential integrity ensures that a foreign key's non-null values refer to valid records in the referenced table, according to the defined constraint.

### Q6. What is the difference between NOT NULL and CHECK?

`NOT NULL` prevents a column from containing `NULL`. `CHECK` enforces a condition on row values. A check alone does not normally prevent a condition from evaluating to `UNKNOWN` because of `NULL`.

### Q7. Why might an application use a surrogate key?

A surrogate key provides an internal identifier independent of changing descriptive attributes. This can simplify references when values such as email addresses or usernames change.

### Q8. When should ON DELETE CASCADE be used?

It is suitable when dependent records should automatically be removed with their parent and have no required independent retention. It should not be used without considering audit, history, and retention requirements.

### Q9. Why should constraints exist in the database if the application already validates input?

Database constraints protect the data from invalid operations originating through different application paths, scripts, and services. Application validation remains useful for clear feedback and business logic.

### Q10. How would you enforce one preference record per user?

Define a foreign key from the preference table to the user table and add a `UNIQUE` constraint on the preference table's `user_id`. The foreign key ensures the user exists, while the unique constraint ensures at most one preference row per user.

### Q11. How would you model a many-to-many relationship?

Use an association table that references both related tables. Choose a composite primary key or another identifier and uniqueness constraints according to whether duplicate associations are permitted.

### Q12. What would you check before adding a constraint to a production database?

I would confirm the business rule, inspect existing data for violations, assess the effects on application writes and deployments, plan any required data cleanup, and validate the constraint after deployment.

---

## 16. Quick Revision

- Candidate keys uniquely and minimally identify records.
- A primary key is the selected main candidate key.
- Alternate keys are candidate keys not selected as the primary key.
- Composite keys use multiple columns together.
- Surrogate keys are introduced primarily for record identification.
- Natural keys use domain attributes whose uniqueness and stability must be justified.
- Foreign keys establish and enforce references between records.
- `UNIQUE` enforces uniqueness.
- `NOT NULL` requires a non-null value.
- `CHECK` enforces a condition on row values.
- Referential actions determine what happens when referenced records are updated or deleted.
- Constraints should represent actual domain requirements.
- Application validation and database constraints serve complementary purposes.

---

## 17. Key Takeaways

Keys and constraints turn important data rules into enforceable database guarantees.

Keys identify records and establish references. Constraints prevent duplicate identifiers, missing required values, invalid values, and broken references when those rules are defined appropriately.

The engineering challenge is not to add as many constraints as possible. It is to identify the rules that must hold, choose the correct database mechanism, and ensure that the rules match the application's actual requirements.

A good schema should make invalid states difficult to create while still supporting legitimate application behavior.

## 18. Further Reading

Consult the official PostgreSQL documentation for implementation-specific behavior:

- [PostgreSQL — Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [PostgreSQL — Primary Keys](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-PRIMARY-KEYS)
- [PostgreSQL — Foreign Keys](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK)
- [PostgreSQL — Identity Columns](https://www.postgresql.org/docs/current/ddl-identity-columns.html)
- [PostgreSQL — CREATE TABLE](https://www.postgresql.org/docs/current/sql-createtable.html)

---

## Completion Check

Before proceeding, answer these questions without looking at the chapter:

1. What makes a candidate key minimal?
2. When might email be an alternate key rather than a primary key?
3. Why might `(student_id, course_id)` be an appropriate composite key for an enrollment table?
4. What is the difference between `UNIQUE` and `NOT NULL` in PostgreSQL?
5. What happens when a foreign key references a nonexistent record?
6. When is `ON DELETE CASCADE` appropriate, and when could it be dangerous?
7. Why does a `CHECK` constraint not necessarily reject `NULL`?
8. How would you enforce the rule that each user can have at most one partner-preference record?

**Practical exercise:** Design the keys and constraints for a simplified matrimonial application with `users`, `partner_preferences`, and `profile_views`.

For each table, explain:

- What identifies each record.
- Which attributes must be present.
- Which values must be unique.
- Which columns reference other tables.
- What should happen when a referenced user is deleted.
- Which rules belong in the database and which require application-level logic.

Use PostgreSQL-compatible SQL to implement your design. Justify each constraint using a specific business requirement.

When you can explain why each constraint exists and what invalid state it prevents, proceed to **Indexing Fundamentals**.
