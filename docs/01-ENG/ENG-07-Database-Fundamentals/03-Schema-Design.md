# Schema Design

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain the purpose of database schema design.
- Translate application requirements into structured relational tables.
- Identify entities, attributes, and relationships during initial schema design.
- Choose appropriate column data types based on the information being represented.
- Distinguish conceptual schema decisions from implementation details.
- Recognize the consequences of poor schema design.
- Evaluate schema designs for clarity, maintainability, and expected application usage.
- Understand how schema design connects to integrity constraints, normalization, and data modeling.

## Prerequisites

**Primary prerequisite:** [ENG-02 — Programming Foundations](../ENG-02-Programming-Foundations/README.md)

**Previous chapters:**
- [Relational Databases](01-Relational-Databases.md)
- [SQL Fundamentals](02-SQL-Fundamentals.md)

You should understand relational tables, rows, columns, relationships, and basic SQL statements.

**Estimated reading time:** 35–45 minutes.

**SQL dialect:** Examples use PostgreSQL-compatible SQL. Data types and some implementation details differ across database systems.

---

## 1. Before We Start: Why Schema Design Matters

Imagine you are building a matrimonial application.

The application must store:

- User profile information.
- Education and professional details.
- Partner preferences.
- Profile verification information.
- Profile-view events.
- User interactions.

You know how to create a table and insert records using SQL. However, that does not automatically mean you know how to design a good database.

Consider this table:

```sql
CREATE TABLE user_information (
    user_id INTEGER,
    name TEXT,
    age INTEGER,
    city TEXT,
    education TEXT,
    profession TEXT,
    preferred_city TEXT,
    viewed_user_id INTEGER,
    viewed_at TIMESTAMP
);
```

The table is syntactically valid in PostgreSQL, but its design raises several questions.

- Does each row represent a user, a preference, or a profile-view event?
- What happens when one user views hundreds of profiles?
- How should multiple education records be represented?
- Where should verification information be stored?
- What happens when a user's preferences change?
- How do we prevent unrelated information from becoming inconsistent?

These are schema-design questions.

A database can execute valid SQL against a poorly designed schema. Syntax correctness does not guarantee that the data structure accurately represents the application.

**Schema design is the process of defining how application data is organized, represented, and connected within a database.**

The objective is to create a structure that accurately represents the domain and supports the application's requirements without introducing unnecessary complexity.

---

## 2. What Is a Database Schema?

A **database schema** describes the structure of database objects and their relationships.

Depending on the DBMS, a schema can include objects such as:

- Tables.
- Columns and their data types.
- Constraints.
- Indexes.
- Views.
- Other database objects.

In this chapter, we focus primarily on relational table and column design.

Consider:

```sql
CREATE TABLE users (
    user_id INTEGER,
    name VARCHAR(100),
    age INTEGER,
    city VARCHAR(100)
);
```

This statement defines part of a database schema.

It specifies:

- A table named `users`.
- A column named `user_id`.
- A column named `name` with a character limit.
- An integer column named `age`.
- A column named `city`.

It defines the structure, not the actual user records.

### Schema versus data

| Concept | Example |
|---|---|
| Schema | A `users` table with `user_id`, `name`, and `city` columns |
| Data | A row containing `101`, `Aarav`, and `Pune` |
| Schema change | Adding a `date_of_birth` column |
| Data change | Updating a user's city from Pune to Mumbai |

This distinction matters because changing the structure of a database is a different operation from changing the records stored within it.

### Why explicit structure matters

A defined schema gives the database and application a shared understanding of the information being stored.

For example, an integer age and a timestamp are different kinds of values. Their types influence validation, comparisons, sorting, and the operations that can be performed on them.

A schema also makes the intended meaning of stored information easier for other engineers to understand.

---

## 3. Start with Requirements, Not Tables

A common design mistake is to begin creating tables before understanding the application requirements.

Instead, first identify what the application needs to represent and what it needs to do with that information.

Consider this requirement:

> Users can create profiles, specify partner preferences, and view other profiles. The application must retain a record of each profile-view event.

Before writing SQL, ask:

1. What kinds of things must be represented?
2. What information must be stored about each thing?
3. How are those things related?
4. Can one thing have multiple associated records?
5. Which information changes independently?
6. What operations must the application perform?
7. Which business rules must the database enforce?

These questions help identify the shape of the data before implementation details become difficult to change.

### 3.1 Identify the main concepts

From the requirement, we can identify:

- Users.
- Partner preferences.
- Profile-view events.

These are different concepts because each has a distinct purpose.

A user represents a person with a profile. A preference represents desired characteristics. A profile-view event records an action that occurred at a particular time.

This suggests that they should be considered separately during the initial design.

### 3.2 Identify the attributes

Next, identify the information associated with each concept.

| Concept | Possible attributes |
|---|---|
| User | Identifier, name, date of birth, city |
| Partner preference | Identifier, user association, preferred city |
| Profile-view event | Identifier, viewer, viewed user, timestamp |

These are illustrative attributes, not a complete production specification.

For example, the requirement does not tell us whether a user can maintain multiple preference records or whether profile-view history must be retained indefinitely. Those questions require additional business decisions.

**Engineering principle:** A schema should reflect actual requirements and explicit assumptions, not guesses disguised as implementation decisions.

---

## 4. Entities, Attributes, and Relationships

Three concepts are useful when designing a relational schema.

### 4.1 Entity

An entity is a distinct concept in the application domain that needs to be represented.

Examples include:

- User.
- Product.
- Order.
- Course.
- Profile-view event.

An entity does not automatically correspond to exactly one database table. The mapping depends on the domain and the design requirements.

For an initial relational design, however, identifying candidate entities is a useful way to organize the problem.

### 4.2 Attribute

An attribute describes a property of an entity.

For a user, attributes might include:

- Name.
- Date of birth.
- City.
- Profile status.

An attribute should have a clear meaning and an appropriate representation.

For example, `date_of_birth` and `age` are related but not equivalent.

Age changes as time passes, while date of birth is generally a stable historical fact. If an application needs a person's current age, storing the date of birth and deriving the age is often more reliable than storing an age that becomes outdated.

Whether the application should store a particular value also depends on privacy, retention, and business requirements.

### 4.3 Relationship

A relationship describes how two or more concepts are associated.

Examples:

- A user has partner preferences.
- A user views another user.
- A student enrolls in a course.

Relationships influence how tables are connected.

For example, a profile-view event needs to identify both the viewer and the viewed profile. These are two distinct associations to the user entity, even though both refer to the same conceptual entity type.

### Bringing the concepts together

```text
User
 |
 | has
 v
Partner Preferences

User
 |
 | performs profile-view event
 v
Profile View
 |
 | references
 v
Viewed User
```

This is a conceptual illustration, not a complete relational schema.

The next design step is to decide how these concepts and associations should be represented in tables and columns.

---

## 5. Choosing Table Boundaries

One of the most important schema-design decisions is deciding what each table represents.

A table should have a coherent purpose.

Consider the following design:

```text
users
-----
user_id
name
date_of_birth
city

partner_preferences
-------------------
preference_id
user_id
preferred_city

profile_views
-------------
view_id
viewer_user_id
viewed_user_id
viewed_at
```

Each table represents a different concept.

- `users` stores profile information.
- `partner_preferences` stores preference information.
- `profile_views` stores events.

This separation helps because each type of information can change and grow independently.

For example, a user might view 500 profiles. The application should not need to duplicate the user's entire profile 500 times just to record those events.

### 5.1 When should information be separated?

Consider separating information when:

- It represents a distinct domain concept.
- It has its own lifecycle.
- It can occur multiple times for one parent entity.
- It changes independently.
- It requires different access or retention rules.
- Combining it with another concept would make the structure ambiguous.

These are design signals, not absolute rules.

Sometimes a related attribute belongs directly in the main table. Sometimes a separate table introduces unnecessary joins and complexity.

### 5.2 Avoid tables with ambiguous meaning

A table named `user_information` might be understandable initially, but its meaning becomes unclear if it contains user profiles, preferences, and interaction history together.

Names such as `users`, `partner_preferences`, and `profile_views` communicate the intended purpose more clearly.

A good table name should help another engineer understand what one row represents.

---

## 6. Choosing Appropriate Data Types

Each column should use a data type that accurately represents the information being stored.

Data types influence:

- Valid values.
- Storage representation.
- Comparisons and sorting.
- Available operations.
- Interoperability with application code.

The best type depends on the information and the DBMS.

### 6.1 Integer types

Integer types are useful for whole-number values.

Examples include:

- Counts.
- Numeric identifiers.
- Integer-valued measurements.

PostgreSQL provides types such as `SMALLINT`, `INTEGER`, and `BIGINT`.

The choice should reflect the expected value range and the meaning of the data.

### 6.2 Text types

Text types are appropriate for textual information.

In PostgreSQL, `TEXT` and `VARCHAR(n)` are common choices.

For example:

```sql
name VARCHAR(100)
```

This specifies a character limit of 100 characters in PostgreSQL.

A limit should reflect a genuine application requirement rather than an arbitrary guess. The appropriate limit may depend on user input, international names, external systems, and business rules.

### 6.3 Date and timestamp types

Date and timestamp types represent temporal information.

Examples:

```sql
date_of_birth DATE
created_at TIMESTAMP
```

A `DATE` represents a calendar date. A timestamp represents a date and time.

For events that need an unambiguous point in time across time zones, PostgreSQL's `TIMESTAMP WITH TIME ZONE` (`timestamptz`) is often appropriate.

The choice depends on whether the application needs a calendar date, a local wall-clock time, or a globally meaningful instant.

Do not use arbitrary text for dates when a suitable temporal type is available and appropriate.

### 6.4 Boolean types

Boolean values represent true or false states.

For example:

```sql
is_verified BOOLEAN
```

However, a Boolean column can also be `NULL` unless the schema prevents it. If the application requires a definitive verification status, decide explicitly how unknown or unverified states should be represented.

### 6.5 Numeric and decimal values

Numeric types are useful for measurements and quantities.

For example, financial values often require an exact decimal representation rather than approximate floating-point arithmetic.

PostgreSQL provides `NUMERIC` and `DECIMAL` for exact decimal values, subject to their configured precision and scale.

The type should match the meaning and required precision of the information.

### 6.6 Identifiers are not always numbers

A common mistake is assuming every identifier should be stored as an integer because it contains digits.

An identifier may be:

- An integer generated by a database.
- A UUID.
- A string from an external system.
- A composite value defined by the domain.

Choose a representation based on identifier semantics, integration requirements, and system design.

An identifier used only to distinguish records should not automatically be treated as a quantity that supports arithmetic.

### Data-type decision table

| Information | Possible type | Design consideration |
|---|---|---|
| User identifier | `INTEGER`, `BIGINT`, or `UUID` | Scale, generation, integration |
| Name | `TEXT` or `VARCHAR(n)` | Input requirements and validation |
| Date of birth | `DATE` | Represents a calendar date |
| Event timestamp | `TIMESTAMPTZ` in PostgreSQL | Time-zone-aware event representation |
| Verification state | `BOOLEAN` | Whether unknown states are permitted |
| Exact monetary amount | `NUMERIC` | Required precision and scale |

These are examples, not universal prescriptions. Consult the target DBMS documentation when type behavior matters.

---

## 7. Representing Relationships in the Schema

Once the concepts and table boundaries are understood, the next step is to represent their relationships.

Consider the `profile_views` table:

```sql
CREATE TABLE profile_views (
    view_id BIGINT,
    viewer_user_id BIGINT,
    viewed_user_id BIGINT,
    viewed_at TIMESTAMPTZ
);
```

This structure records two associations with the `users` concept:

- `viewer_user_id` identifies the user who viewed a profile.
- `viewed_user_id` identifies the user whose profile was viewed.

The two columns have different meanings even though they refer to the same kind of entity.

A table can contain multiple columns that refer to the same parent table when the domain requires distinct roles.

### 7.1 Relationship cardinality affects structure

Consider these cases:

- One user has one current profile.
- One user can have many profile-view events.
- One user can express interest in many other users, and each user can receive interest from many users.

Each case has different relationship semantics.

Those semantics affect whether information belongs in one table, a related table, or an association table.

### 7.2 Representing associations explicitly

A many-to-many relationship is often represented using a separate table.

For example:

```text
users
-----
user_id
name

user_interests
--------------
interest_id
sender_user_id
receiver_user_id
created_at
```

Each row in `user_interests` represents an interest event or record.

If the business requirement allows only one active interest record for each user pair, the schema may need a suitable uniqueness rule. If repeated events are allowed, a different design may be appropriate.

The correct design depends on whether the application is modeling a relationship state, an event history, or both.

### 7.3 Do not confuse representation with enforcement

A column named `viewer_user_id` expresses the intended meaning to developers, but the name alone does not guarantee that it references an existing user.

Database constraints are needed when such rules must be enforced by the DBMS.

The detailed mechanics of primary keys, foreign keys, uniqueness, and other constraints belong to [Keys and Constraints](04-Keys-and-Constraints.md).

---

## 8. Schema Design and Data Integrity

Schema design and data integrity are related, but they are not the same concern.

Schema design determines the structure used to represent the data.

Data integrity concerns whether the stored data satisfies the rules that must hold.

For example, a `users` table might contain:

```sql
CREATE TABLE users (
    user_id BIGINT,
    name TEXT,
    age INTEGER,
    city TEXT
);
```

This definition establishes a structure, but it does not by itself guarantee that:

- `user_id` is unique.
- Every user has a name.
- Age values are valid according to the business rules.
- Referenced users exist in related tables.

Those requirements need explicit decisions about constraints and application behavior.

A more complete definition could enforce some of these rules:

```sql
CREATE TABLE users (
    user_id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER CHECK (age >= 18),
    city TEXT
);
```

This PostgreSQL-compatible example illustrates:

- `PRIMARY KEY` identifies each row uniquely.
- `NOT NULL` requires a name value.
- `CHECK` rejects ages below 18.

The age condition is only an illustrative business rule. A real application must establish the applicable eligibility rules and decide how age should be represented and validated.

The main lesson is that schema structure and integrity rules must be designed together, even though their detailed concepts are covered separately.

---

## 9. Common Schema-Design Approaches That Fail

### 9.1 Storing unrelated concepts in one table

**Problem:** The table's meaning becomes ambiguous, and unrelated data may be repeated.

**Better approach:** Identify the distinct concepts and evaluate whether they need separate tables.

### 9.2 Storing repeated values in an unclear format

Suppose one column stores multiple cities as a comma-separated string:

```text
preferred_cities = "Pune,Mumbai,Delhi"
```

This can make filtering, validation, updates, and relationships more difficult.

A relational representation with one row per preference may be more appropriate when each preference needs independent querying or validation.

However, the correct representation depends on the access patterns and domain semantics. Not every collection must automatically become a separate table.

### 9.3 Choosing types based only on convenience

Storing timestamps, numbers, or identifiers as generic text may simplify initial input but complicate comparisons and validation later.

**Better approach:** Choose types that reflect the information's meaning and required operations.

### 9.4 Using vague names

Names such as `data`, `details`, and `info` often hide the purpose of a table or column.

**Better approach:** Use names that communicate the domain concept clearly, such as `partner_preferences` or `viewed_at`.

### 9.5 Designing only for the first screen

A schema designed around one UI screen may struggle when the application adds new workflows.

For example, storing a single profile-view field on a user cannot naturally represent a complete history of profile-view events.

**Better approach:** Design around the underlying domain and expected operations rather than copying the layout of a screen.

### 9.6 Premature optimization

Adding complex structures or database-specific mechanisms before understanding the workload can make a schema harder to maintain.

**Better approach:** Begin with a clear model that meets the requirements. Introduce performance-oriented changes when evidence and requirements justify them.

---

## 10. Schema Evolution and Migrations

Applications change over time. Their database structures often need to change as well.

Examples include:

- Adding a new profile attribute.
- Renaming a column.
- Creating a table for a new feature.
- Changing a column's data type.
- Adding a constraint after existing data has been cleaned.

These are schema changes.

In an application, such changes are commonly managed through **database migrations**: explicit, versioned changes to the database structure.

For example, in PostgreSQL:

```sql
ALTER TABLE users
ADD COLUMN bio TEXT;
```

This adds a `bio` column to the `users` table.

The statement demonstrates the syntax for a simple structural change. It does not establish a complete production migration procedure.

### Why schema changes need planning

A schema change can affect:

- Existing records.
- Application queries.
- API behavior.
- Background jobs.
- Reports and integrations.
- Deployment order.
- Rollback and recovery procedures.

For example, renaming a column may break application code that still references the old name.

A safe change therefore requires more than a valid `ALTER TABLE` statement.

### A practical migration mindset

Before changing a schema, ask:

1. Which application components depend on the existing structure?
2. What happens to existing data?
3. Is the change compatible with the currently deployed application?
4. Could the operation lock or heavily affect a large table?
5. How will the change be tested?
6. What is the recovery plan if the deployment fails?

The appropriate migration strategy depends on the DBMS, table size, deployment architecture, and operational requirements.

This chapter introduces the design implications of schema evolution. It does not attempt to cover production database operations in depth.

---

## 11. A Practical Schema-Design Workflow

Use the following workflow when translating an application requirement into an initial relational schema.

### Step 1: Understand the domain

Identify what the application needs to represent.

Example: users, preferences, and profile-view events.

### Step 2: Identify candidate entities

Separate concepts that have distinct meanings or lifecycles.

Do not create a separate table for every noun automatically. Evaluate what the application actually needs to store and query.

### Step 3: Identify attributes

Determine the information associated with each concept.

For example, a profile-view event might need a viewer, a viewed user, and a timestamp.

### Step 4: Define relationships

Determine how the concepts relate.

Can one user have multiple events? Can one preference record exist for each user, or can a user maintain several?

These are requirements questions, not merely SQL questions.

### Step 5: Choose data types

Select types based on the meaning, valid range, precision, and expected operations of each attribute.

### Step 6: Identify integrity rules

Determine which values must be present, which identifiers must be unique, and which associations must refer to existing records.

The detailed constraint design is covered in the next chapter.

### Step 7: Validate against application operations

Check whether the design supports the required operations.

For example:

- Retrieve a user's profile.
- Retrieve all preferences for a user.
- Record a profile-view event.
- Find recent profile views for a user.

This helps reveal missing relationships and unclear table boundaries.

### Step 8: Review maintainability

Ask whether another engineer can understand what each table represents and how it should be used.

Review naming, redundancy, expected change, and unnecessary complexity.

### Step 9: Test representative data

Create sample records and try realistic queries.

A design that looks reasonable on paper may reveal problems when tested against actual access patterns and business rules.

### Step 10: Revisit the design as requirements become clearer

Initial designs are hypotheses about the domain. They should be validated and refined as the application and its requirements become better understood.

Avoid unnecessary redesign, but do not preserve a flawed structure merely because it was implemented first.

---

## 12. Production Engineering Perspective

Schema design affects application correctness, maintainability, and performance over the life of a system.

### 12.1 Design around the domain and access patterns

The schema should represent the underlying concepts accurately while supporting the operations the application needs.

Neither domain modeling nor access patterns should be ignored.

A design that represents the domain clearly but makes critical operations impractical may need adjustment. A design optimized for one query but difficult to maintain may also be problematic.

### 12.2 Make assumptions explicit

If an application allows only one active preference record per user, document and enforce that rule where appropriate.

If it permits multiple records or historical versions, the schema must represent that requirement instead.

Unstated assumptions are a common source of data inconsistency.

### 12.3 Consider lifecycle and retention

A profile and a profile-view event have different lifecycles.

A profile may be updated repeatedly, while a view event may need to be retained as history or removed according to a retention policy.

These differences influence table boundaries and deletion behavior.

### 12.4 Consider privacy and data minimization

A schema should not collect or retain every potentially useful field without justification.

Store information required for the application's legitimate purpose, and consider access, retention, and deletion requirements during design.

This is particularly important for personal information.

### 12.5 Separate correctness from optimization

A clear schema is the starting point. Performance decisions such as index selection should follow the workload and evidence.

Indexes can improve some queries but add storage and write-maintenance costs. They should not be added blindly during initial schema design.

Detailed trade-offs belong to [Indexing Fundamentals](05-Indexing-Fundamentals.md).

---

## 13. Interview Questions and Answers

### Q1. What is database schema design?

It is the process of defining the structure used to represent application data, including tables, columns, relationships, and relevant structural decisions.

### Q2. What is the difference between a schema and data?

A schema defines the structure of database objects. Data consists of the actual values stored within those structures.

### Q3. Why should requirements be understood before creating tables?

Requirements determine what must be represented, how concepts relate, which operations are needed, and which rules must hold. Creating tables before understanding these requirements can lead to ambiguous structures and expensive redesigns.

### Q4. What is the difference between an entity and a table?

An entity is a concept in the application domain. A table is a database structure that can represent an entity, a relationship, an event, or another data concept.

### Q5. How do you choose a data type for a column?

I consider the meaning of the value, its valid range, required precision, expected operations, integration needs, and the capabilities of the target DBMS.

### Q6. Why might profile-view events belong in a separate table?

Each view is an event with its own timestamp and associations to a viewer and a viewed user. A separate table represents the event history without repeating the complete profile data for every event.

### Q7. Is schema design the same as normalization?

No. Schema design is the broader activity of structuring database information. Normalization provides formal principles for organizing relational data and reducing certain forms of redundancy and anomalies.

### Q8. Is schema design the same as defining constraints?

No. Schema design includes decisions about structures and relationships. Constraints define rules the DBMS should enforce about permitted values and relationships. They are closely connected but distinct concepts.

### Q9. What is a database migration?

A migration is a versioned change to the database structure or related database state, commonly used to evolve a schema as application requirements change.

### Q10. How would you evaluate a proposed schema?

I would check whether it accurately represents the domain, supports required operations, uses appropriate data types, expresses relationships clearly, identifies important integrity rules, avoids unnecessary complexity, and can evolve safely.

---

## 14. Quick Revision

- A schema describes database structures and relationships.
- Requirements should guide table design.
- Entities, attributes, and relationships help organize the domain.
- Each table should have a clear purpose.
- Data types should reflect the meaning and operations of the data.
- Relationship cardinality influences table structure.
- Representing a relationship does not automatically enforce it.
- Schema design and integrity constraints are related but distinct.
- Normalization addresses redundancy and data anomalies through formal principles.
- Migrations evolve schemas as application requirements change.
- Good designs balance domain clarity, application access patterns, integrity, and maintainability.
- Performance optimization should be guided by actual workload requirements.

---

## 15. Key Takeaways

A good schema is a deliberate representation of an application's domain, not merely a collection of tables that can store the current data.

Start by understanding the requirements. Identify the concepts, attributes, and relationships. Choose meaningful data types and table boundaries. Define the integrity rules that must hold, and validate the design against realistic application operations.

The goal is not to create the most elaborate schema. It is to create a clear, correct, maintainable structure that meets the requirements and can evolve as the application changes.

## 16. Further Reading

Use the official PostgreSQL documentation to verify database-specific behavior:

- [PostgreSQL — Data Definition](https://www.postgresql.org/docs/current/ddl.html)
- [PostgreSQL — Data Types](https://www.postgresql.org/docs/current/datatype.html)
- [PostgreSQL — Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [PostgreSQL — ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html)

These references provide implementation details beyond the conceptual scope of this chapter.

---

## Completion Check

Before proceeding, answer these questions without looking at the chapter:

1. A profile contains personal details, partner preferences, and profile-view history. How would you identify the candidate entities, and why?
2. When would you separate information into another table instead of adding another column?
3. Why is storing a person's date of birth often more useful than storing their current age?
4. What information would you consider when choosing between `INTEGER`, `TEXT`, `DATE`, and `TIMESTAMPTZ`?
5. How would you distinguish a schema-design decision from an integrity constraint?
6. Why should schema changes be planned around application dependencies?
7. What trade-offs would you examine before introducing a more complex schema structure?

**Practical exercise:** Design an initial relational schema for a matrimonial application with users, partner preferences, and profile-view events.

For each proposed table, explain:

- What one row represents.
- Which attributes are needed.
- Which relationships exist.
- Why the table boundaries make sense.
- Which assumptions still need confirmation.

Do not optimize indexes or implement advanced constraints yet. Focus on a clear, requirement-driven structure.

When you can justify your table boundaries and data-type choices, proceed to **Keys and Constraints**.
