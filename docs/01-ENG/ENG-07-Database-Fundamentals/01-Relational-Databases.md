# Relational Databases

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain why relational databases exist and which problems they solve.
- Describe the relational model using relations, rows, columns, and attributes.
- Explain the relationship between tables and real-world entities.
- Distinguish database structure from the data stored within it.
- Understand how relationships between tables represent real-world associations.
- Explain the role of a database management system (DBMS).
- Compare relational and non-relational databases at a foundational level.
- Identify appropriate use cases and limitations of relational databases.

## Prerequisites

**Primary prerequisite:** [ENG-02 — Programming Foundations](../ENG-02-Programming-Foundations/README.md)

You should be comfortable with basic data types, collections, structured information, and the idea of representing real-world objects in a program.

**Related topics:**
- ENG-01 — Computer Science Fundamentals: files, memory, and data representation.
- ENG-06 — Networking Fundamentals: client-server communication.

These topics provide supporting context. This chapter will not reteach them.

**Estimated reading time:** 25–35 minutes.

---

## 1. Before We Start: The Problem Databases Solve

Imagine you are building a matrimonial application.

The application needs to store information about users, including:

- Name
- Age
- Location
- Education
- Profession
- Partner preferences
- Profile verification status

Initially, you might store this information in a Python list:

```python
profiles = [
    {
        "id": 1,
        "name": "Aarav",
        "age": 28,
        "city": "Pune",
        "profession": "Engineer"
    },
    {
        "id": 2,
        "name": "Meera",
        "age": 26,
        "city": "Mumbai",
        "profession": "Designer"
    }
]
```

For a small script, this works reasonably well. Your program can read the records, filter them, and modify values.

Now consider what happens when the application grows.

- Thousands or millions of users need to be stored.
- Multiple application servers need access to the same data.
- Several users may update data simultaneously.
- A server restart must not erase user profiles.
- Duplicate or invalid records must be prevented.
- The application needs to retrieve specific profiles efficiently.
- Changes to related information must remain consistent.

A Python list alone does not provide the complete set of capabilities needed to solve these problems reliably.

You could build these capabilities yourself using files, locks, custom search algorithms, and validation logic. However, you would gradually be building a database system.

This is the central motivation behind database management systems.

### The core idea

A database provides an organized way to store and manage data. A database management system provides the software capabilities needed to access, modify, and protect that data.

A database is not merely a collection of values. It is part of the application's data-management architecture.

---

## 2. What Is a Database?

A **database** is an organized collection of related data that can be stored, accessed, and managed.

For example, a matrimonial application might maintain data about:

- Users
- Partner preferences
- Education records
- Profile views
- Messages

A **Database Management System (DBMS)** is software that manages databases and provides mechanisms for interacting with their data.

Examples include:

- PostgreSQL
- MySQL
- SQLite
- Microsoft SQL Server
- MongoDB

These systems do not all use the same data model or query language.

### Database versus DBMS

The distinction matters because the terms are often used interchangeably in casual conversation.

| Concept | Meaning |
|---|---|
| Database | The organized data being managed |
| DBMS | The software that manages and provides access to that data |
| Database schema | The definition of the data's structure |
| Database query | An operation used to retrieve or manipulate data |

Think of a database as the organized collection of information and the DBMS as the software responsible for managing it.

For example, PostgreSQL is a DBMS. A PostgreSQL database may contain tables storing user profiles, preferences, and other application records.

### What does a DBMS help with?

Depending on the system and its configuration, a DBMS can provide:

- Data storage and retrieval.
- Concurrent access by multiple clients.
- Data integrity enforcement.
- Transaction management.
- Access control.
- Recovery mechanisms.
- Query processing and execution.

These capabilities reduce the amount of low-level data-management logic that application developers must implement themselves.

They do not eliminate the need for correct application design or operational configuration.

---

## 3. What Is a Relational Database?

A **relational database** organizes data using relations, commonly represented as tables.

Each table represents a particular kind of information. Its columns describe the attributes of that information, while its rows represent individual records.

Consider a simplified `users` table:

| user_id | name | age | city |
|---:|---|---:|---|
| 101 | Aarav | 28 | Pune |
| 102 | Meera | 26 | Mumbai |
| 103 | Rohan | 30 | Delhi |

The table contains information about users.

- Each row represents one user record.
- Each column represents an attribute.
- Each cell contains a value for a particular row and column.
- The table's structure defines which attributes are represented.

This table-based representation is the most familiar way to understand the relational model.

### 3.1 Relations and tables

In relational theory, a relation is a mathematical concept representing a set of tuples over defined attributes.

In everyday database engineering, relations are commonly represented as tables.

However, a SQL table is not always a perfect implementation of the mathematical relational model. For example, SQL tables can contain duplicate rows unless appropriate constraints prevent them, and SQL supports `NULL` values with special semantics.

The distinction becomes important when studying database theory, constraints, and query behavior.

For this chapter, use the following mental model:

> A relational database organizes structured records into tables whose relationships and integrity rules define how the data fits together.

### 3.2 Rows and records

A row represents one record in a table.

For example:

| user_id | name | age | city |
|---:|---|---:|---|
| 101 | Aarav | 28 | Pune |

This row describes one user.

In database terminology, a row is also commonly called a record or, in relational theory, a tuple.

The row's meaning comes from the table it belongs to. A row in `users` represents a user; a row in `messages` represents a message.

### 3.3 Columns and attributes

A column describes an attribute represented by the table.

For example, the `users` table might contain:

- `user_id`
- `name`
- `age`
- `city`

Each column has a defined name and, in a relational schema, an associated data type.

The data type specifies which kinds of values the column is intended to hold, subject to the database's type system and rules.

For example:

- `user_id`: an integer identifier.
- `name`: text.
- `age`: an integer.
- `created_at`: a timestamp.

The exact type definitions depend on the DBMS and the schema design.

### 3.4 Values and data types

Each cell contains a value associated with a column and row.

For example, `28` is a value in the `age` column.

A column's data type helps the DBMS determine which values are valid and how operations on those values behave.

Using appropriate types is important because values are not interchangeable merely because they can be written as text.

For example, storing a date as a properly typed date value enables date-aware comparisons and operations. Storing it as arbitrary text can make validation and comparison more difficult.

Detailed data-type selection belongs to schema design, covered in [Schema Design](03-Schema-Design.md).

---

## 4. Understanding the Relational Model Through an Application

A real application rarely stores all information in one table.

Consider a matrimonial application with users and partner preferences.

A simplified design could contain two tables.

### `users`

| user_id | name | city |
|---:|---|---|
| 101 | Aarav | Pune |
| 102 | Meera | Mumbai |
| 103 | Rohan | Delhi |

### `partner_preferences`

| preference_id | user_id | preferred_city |
|---:|---:|---|
| 501 | 101 | Mumbai |
| 502 | 102 | Pune |
| 503 | 103 | Bengaluru |

These tables represent different concepts.

The `users` table stores information about users. The `partner_preferences` table stores preference information associated with users.

Keeping different concepts in separate tables can make the structure easier to understand and maintain.

But how does a preference record identify the user to whom it belongs?

The `user_id` column in `partner_preferences` provides the association.

For example, preference record `501` refers to user `101`.

This leads to one of the central ideas in relational databases: **relationships between tables**.

---

## 5. Relationships Between Tables

A relational database can represent associations between different kinds of records.

Common relationship patterns include one-to-one, one-to-many, and many-to-many.

These are conceptual patterns. The actual schema determines how each relationship is represented and enforced.

### 5.1 One-to-one

A one-to-one relationship means that a record in one entity is associated with at most one record in another entity, and vice versa, according to the intended business rules.

Example:

- A user has one verification record.
- A verification record belongs to one user.

A database design might use a separate `user_verifications` table.

The relationship requires appropriate constraints if the database must enforce that each user has at most one verification record.

### 5.2 One-to-many

A one-to-many relationship means that one record can be associated with multiple records in another table.

Example:

- One user can have many profile-view records.
- Each profile-view record identifies the user whose profile was viewed.

A simplified structure could look like this:

```text
users
-----
user_id (identifier)
name

profile_views
-------------
view_id (identifier)
viewer_user_id
viewed_user_id
viewed_at
```

A user may appear in many rows of `profile_views`.

This is useful because profile views are individual events, not just attributes of a user.

The table can represent each event independently, including who viewed whom and when.

### 5.3 Many-to-many

A many-to-many relationship means that records on both sides can be associated with multiple records on the other side.

Example:

- A student can enroll in multiple courses.
- A course can have multiple students.

A common relational design introduces an intermediate table:

```text
students
--------
student_id
name

courses
-------
course_id
title

enrollments
-----------
student_id
course_id
enrolled_at
```

The `enrollments` table represents the associations between students and courses.

This pattern is often called a junction table or association table.

The same idea applies to applications where users can express interest in many profiles and each profile can receive interest from many users.

**Important:** The existence of a relationship in your business domain does not automatically mean that the database enforces it. The schema must represent the relationship, and constraints may be needed to enforce its rules.

Detailed key and constraint design belongs to [Keys and Constraints](04-Keys-and-Constraints.md).

---

## 6. Why Not Store Everything in One Table?

Suppose we put users, preferences, and profile views into one large table.

| user_id | name | city | preferred_city | viewed_user_id | viewed_at |
|---:|---|---|---|---:|---|
| 101 | Aarav | Pune | Mumbai | 102 | 2026-10-01 |
| 101 | Aarav | Pune | Mumbai | 103 | 2026-10-02 |
| 101 | Aarav | Pune | Mumbai | 102 | 2026-10-03 |

This structure repeats user and preference information for every profile-view event.

It also mixes different kinds of information:

- User identity.
- Partner preferences.
- Profile-view events.

Several problems can arise.

### 6.1 Redundant information

A user's name and city are repeated across multiple rows.

If the user changes their city, several rows might need to be updated.

### 6.2 Inconsistent information

If one row is updated but another is not, the same user may appear with conflicting values.

### 6.3 Difficult maintenance

Changing one concept may require modifying records that also represent unrelated concepts.

### 6.4 Awkward representation

A user with no profile views still needs a representation in the table. A user with many views may require many repeated rows. The structure does not cleanly represent the different concepts.

Separating distinct concepts into related tables provides a better starting point.

This does not mean that every attribute must always have its own table. Good database design depends on the domain, the relationships, and the operations the application needs to support.

The systematic treatment of redundancy and normal forms belongs to [Database Normalization](07-Database-Normalization.md).

---

## 7. What Makes the Relational Model Useful?

Relational databases are useful not merely because they display data in tables, but because the model supports structured relationships, defined schemas, and declarative operations.

### 7.1 A defined structure

A table has a schema describing its columns and their types.

This gives the data a recognizable structure and allows the DBMS to validate many kinds of invalid operations.

### 7.2 Relationships can be represented explicitly

Separate tables can represent distinct concepts while still connecting related records.

This is useful when an application manages users, orders, products, transactions, messages, or other interconnected entities.

### 7.3 Integrity can be enforced

Relational DBMSs support mechanisms such as keys and constraints.

For example, a foreign key can be used to require that a referenced user exists before a related record is accepted.

The exact rules depend on the constraints defined in the schema.

### 7.4 Queries can describe the desired result

SQL allows an application to express which records it wants without manually implementing every low-level retrieval step.

For example:

```sql
SELECT user_id, name, city
FROM users
WHERE city = 'Pune';
```

This query requests the identifiers, names, and cities of users whose city is Pune.

The SQL statement describes the desired result. The DBMS determines how to execute it.

The details of SQL syntax and query composition belong to [SQL Fundamentals](02-SQL-Fundamentals.md).

### 7.5 Data management is separated from application logic

An application can request data from the DBMS instead of implementing all storage and retrieval mechanisms itself.

For example, a FastAPI application may handle HTTP requests and business logic while PostgreSQL manages persistent relational data.

The separation is not absolute: application code still makes important decisions about transactions, validation, queries, and data access.

---

## 8. Relational Database Architecture: A High-Level View

A typical application interacts with a database through a client-server arrangement.

```text
+---------------------------+
| Client or User Interface  |
+-------------+-------------+
              |
              v
+---------------------------+
| Application Backend       |
|                           |
| - Business logic          |
| - Input validation        |
| - Data access             |
+-------------+-------------+
              |
              | Database request
              v
+---------------------------+
| Database Management       |
| System (DBMS)             |
|                           |
| - Query processing        |
| - Integrity enforcement   |
| - Transaction handling    |
| - Data access             |
+-------------+-------------+
              |
              v
+---------------------------+
| Persistent Database Data  |
+---------------------------+
```

This is a conceptual diagram, not a complete internal architecture.

### What happens in this arrangement?

1. A client sends a request to the application.
2. The backend validates the request and applies relevant business rules.
3. The backend issues an appropriate database operation.
4. The DBMS processes the operation and accesses or modifies data.
5. The result is returned to the backend.
6. The backend constructs the response for the client.

For example, when a user opens a profile, the backend may retrieve profile information and then return the required fields to the client.

This design separates application responsibilities from database responsibilities, although the exact boundary depends on the application architecture.

### Why does this separation matter?

The application should not need to know every low-level detail of how the DBMS stores and retrieves its records.

The DBMS provides a managed interface for data operations. The application uses that interface to implement business behavior.

This is one reason relational databases remain widely used in backend applications.

---

## 9. Relational Versus Non-Relational Databases

Not every application represents all data most naturally using a relational model.

Non-relational databases use other data models, such as documents, key-value pairs, wide-column structures, or graphs.

The right choice depends on the application's data, access patterns, consistency requirements, operational constraints, and team expertise.

| Dimension | Relational database | Non-relational database |
|---|---|---|
| Data representation | Tables with defined columns and relationships | Depends on the model: documents, key-value pairs, graphs, and others |
| Schema approach | Typically explicit table schemas | Varies; some models allow more flexible record structures |
| Relationships | Often represented using keys and table relationships | Depends on the model; relationships may be embedded, referenced, or represented differently |
| Querying | SQL is widely used by relational systems | Query interfaces vary by product and model |
| Integrity | Supports constraints such as keys and referential integrity | Integrity mechanisms vary by product and model |
| Transactions | Supported by many relational systems | Transaction support and semantics vary by product and model |
| Typical strengths | Structured data, relational queries, and integrity rules | Data-model-specific access patterns and flexible representations |

These are broad tendencies, not universal rules. Non-relational databases can support schemas and transactions, while relational databases also differ in their capabilities and implementation choices.

### Example: Choosing a data model

Imagine an application stores the following:

- User identity and account information.
- User-to-user interest records.
- Flexible conversational metadata.
- Application events.

Relational tables may be a good fit for user identity and structured relationships. Other data models may be appropriate for particular workloads if their access patterns and operational requirements justify them.

The decision should be based on requirements rather than the assumption that one database category is always better.

For a deeper comparison of non-relational data models, see [Introduction to NoSQL](09-Introduction-to-NoSQL.md).

---

## 10. Where Relational Databases Fit in Enterprise GenAI Systems

Relational databases are not limited to traditional business applications. They can also support the data-management needs of AI-enabled systems.

Consider an application that combines an LLM with retrieval and user-specific context.

A relational database might store:

- User accounts and access-related metadata.
- Application configuration.
- Conversation metadata.
- Document ownership and status.
- Processing-job records.
- Audit-related application records.
- Structured information used by business rules.

For example, a retrieval system may store document identifiers, ownership information, processing status, and access-control metadata in relational tables.

The system can then use that structured information to determine which documents an application is allowed to retrieve.

The actual retrieval index and embedding storage may use other components. A relational database does not automatically replace a specialized retrieval system.

Similarly, an agent may need to persist application state or task metadata. Relational storage can be useful when that information has structured relationships and integrity requirements.

### Engineering lesson

Do not select a database because it is fashionable or because it is already familiar.

First identify:

1. What data must be stored?
2. How is the data related?
3. How will the application access it?
4. What integrity rules must hold?
5. What consistency and transaction requirements exist?
6. What scale and operational constraints apply?

These questions help connect database selection to the actual engineering problem.

---

## 11. Trade-Offs and Limitations

Relational databases are powerful, but they are not automatically the best choice for every workload.

### 11.1 Schema changes require care

A defined schema provides structure, but changing it can require migrations and coordination with application code.

The impact depends on the database, the type of change, the size of the data, and the deployment strategy.

### 11.2 Complex relationships can require complex queries

Queries involving multiple tables may become difficult to understand or expensive to execute if the schema, indexes, or access patterns are poorly designed.

Relational systems provide ways to express these queries, but they do not make every query efficient automatically.

### 11.3 Data integrity requires deliberate design

The DBMS can enforce only the rules that are appropriately represented and configured.

If a required business invariant is not enforced by the schema or application, invalid states may still occur.

### 11.4 Performance depends on more than the database category

Performance can depend on:

- Query design.
- Schema structure.
- Indexes.
- Data volume and distribution.
- Concurrency.
- Network latency.
- Database configuration.
- Application access patterns.

Choosing a relational database does not eliminate the need for performance analysis.

### 11.5 Different workloads may need different models

Some workloads are naturally document-oriented, graph-oriented, or key-value-oriented.

A relational design may still be possible, but another model could provide a better fit for a particular access pattern or data representation.

**Engineering principle:** Choose the data model that satisfies the requirements with acceptable complexity and operational cost. Do not choose based on category-level assumptions alone.

---

## 12. Common Mistakes

### Mistake 1: Thinking a relational database is just a spreadsheet

Both may display rows and columns, but a relational DBMS provides a data-management system with schemas, query processing, concurrency controls, integrity mechanisms, and other capabilities.

A spreadsheet is not a substitute for those capabilities in every application.

### Mistake 2: Treating a table as an entire entity model

One table does not necessarily represent an entire business entity and all of its relationships.

A user, the user's preferences, and the user's profile-view events are distinct concepts that may be better represented in separate tables.

### Mistake 3: Assuming every relationship is automatically enforced

Using a column named `user_id` does not by itself guarantee that the value identifies an existing user.

The schema must define the appropriate relationship and integrity rules when enforcement is required.

### Mistake 4: Believing relational databases always require perfectly fixed data

Relational schemas are explicit, but many systems support schema evolution, nullable fields, structured types, JSON-related types, and other flexibility mechanisms.

These capabilities do not remove the need to design data structures deliberately.

### Mistake 5: Assuming NoSQL is always more scalable

Scalability depends on the workload, system architecture, implementation, deployment, and operational choices.

A database category alone does not establish that a system will scale better.

### Mistake 6: Assuming the DBMS solves all data problems

A DBMS provides important capabilities, but it cannot automatically make a poor data model correct, choose every appropriate business rule, or guarantee that application code uses data safely.

Database engineering still requires design and judgment.

---

## 13. Interview Questions and Answers

### Q1. What is the difference between a database and a DBMS?

A database is an organized collection of data. A DBMS is software that manages that data and provides mechanisms to retrieve, modify, and protect it.

For example, PostgreSQL is a DBMS that can manage one or more databases.

### Q2. What is a relational database?

A relational database organizes data according to the relational model, commonly representing relations as tables. Tables contain attributes represented by columns and records represented by rows, and relationships connect related data.

### Q3. What is the difference between a row and a column?

A row represents a record. A column represents an attribute shared by the records in a table.

In a `users` table, a row may represent one user, while the `city` column represents the city attribute for all user records.

### Q4. Why are related concepts often stored in separate tables?

Separating distinct concepts can reduce redundant data, clarify relationships, simplify maintenance, and make integrity rules easier to express.

For example, profile-view events are better represented as individual event records than as repeated copies of a user's entire profile.

The appropriate structure depends on the application's requirements.

### Q5. What is a relationship between tables?

It is an association between records in different tables. Common patterns include one-to-one, one-to-many, and many-to-many.

The schema can represent these associations through keys and related constraints.

### Q6. Does using a relational database automatically guarantee data integrity?

No. A relational DBMS provides integrity mechanisms, but the schema must define appropriate keys, constraints, and relationships. Application logic may also need to enforce business rules that are not fully represented by database constraints.

### Q7. What is the difference between relational and non-relational databases?

Relational databases organize data using the relational model and commonly use SQL. Non-relational databases use other models, including document, key-value, wide-column, and graph models.

Their suitability depends on the workload and requirements. Capabilities vary across individual products.

### Q8. Why might an enterprise AI application use a relational database?

It may need structured storage for users, document metadata, permissions, job records, application configuration, or other information with explicit relationships and integrity requirements.

The application may use additional systems for specialized workloads, such as vector retrieval.

### Q9. Is a table the same thing as an entity?

Not exactly. An entity is a conceptual representation of something in the problem domain. A table is a database structure that can represent an entity, an association, an event, or another data concept.

The mapping between domain concepts and tables is a data-modeling decision.

### Q10. How would you decide whether to use a relational database?

I would examine the data structure, relationships, query patterns, integrity requirements, transaction needs, expected workload, operational constraints, and team capabilities. I would then compare suitable options against those requirements rather than selecting a database based on popularity alone.

---

## 14. Quick Revision

- A **database** is an organized collection of data.
- A **DBMS** manages databases and provides mechanisms for interacting with their data.
- A **relational database** organizes data according to the relational model, commonly using tables.
- A **row** represents a record; a **column** represents an attribute.
- A **schema** defines the structure of database objects.
- Relationships connect related records across tables.
- One-to-one, one-to-many, and many-to-many describe common relationship patterns.
- Keys and constraints can enforce identity and integrity rules.
- SQL provides a declarative way to request data operations from a relational DBMS.
- Relational and non-relational models have different strengths; neither is universally superior.
- Database selection should follow requirements, not trends.

---

## 15. Key Takeaways

The most important idea in this chapter is that a relational database is a structured way to represent and manage related information.

The value comes from more than storing values in rows and columns. A relational DBMS combines a defined data model with query processing and mechanisms for managing integrity, concurrent access, and transactions.

As an engineer, your responsibility is to understand the application's data and relationships, then choose a suitable structure and enforce the rules that matter.

You should now be able to explain why relational databases are useful and recognize where they fit into a larger application architecture.

## 16. Further Reading

Use authoritative documentation to validate technical details and deepen your understanding:

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PostgreSQL — Introduction](https://www.postgresql.org/docs/current/tutorial-intro.html)
- [MySQL Reference Manual](https://dev.mysql.com/doc/refman/8.4/en/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)

Consult the documentation for the specific DBMS you use when behavior depends on the implementation or SQL dialect.

---

## Completion Check

Before moving to the next chapter, explain these questions in your own words:

1. Why is a database management system useful when an application grows beyond a small in-memory collection?
2. Why might users, preferences, and profile-view events belong in separate tables?
3. What is the difference between representing a relationship and enforcing it?
4. When might a relational data model be a good fit for an enterprise AI application?
5. What information would you gather before choosing between a relational and a non-relational database?

**Practical exercise:** Sketch a relational design for a small learning platform with students, courses, and enrollments. Identify what each table represents and explain how the tables relate to one another. Do not write SQL yet; focus on the data model.

When you can explain your design decisions and their trade-offs, proceed to **SQL Fundamentals**.
