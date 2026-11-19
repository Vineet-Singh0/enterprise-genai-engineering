# ENG-07 — Database Fundamentals

## Overview

Database Fundamentals builds the foundational knowledge required to understand how applications store, organize, retrieve, and modify data.

This topic introduces relational databases, SQL, schema design, data integrity, indexing, transactions, normalization, query execution, NoSQL databases, and data modeling.

The objective is to develop sound foundational database engineering judgment—not merely the ability to write queries.

## Learning Objectives

By completing this topic, you should be able to:

- Explain how relational databases organize data.
- Write basic SQL queries to retrieve and modify records.
- Design relational schemas for application requirements.
- Explain how keys and constraints maintain data integrity.
- Understand indexing benefits and their performance trade-offs.
- Explain transaction fundamentals and ACID properties.
- Recognize data redundancy and normalization principles.
- Describe how databases process queries at a high level.
- Compare relational databases with common NoSQL data models.
- Translate business requirements into appropriate data models.

## Prerequisites

**Primary prerequisite:** [ENG-02 — Programming Foundations](../ENG-02-Programming-Foundations/README.md)

Readers should understand basic programming concepts, data types, collections, functions, and structured data.

The following topics may provide useful background:

- ENG-01 — Computer Science Fundamentals
- ENG-06 — Networking Fundamentals

These prerequisites should be reviewed when necessary rather than retaught in this topic.

## Learning Path

Study the chapters in the following order.

| Order | Chapter | Focus |
|---|---|---|
| 01 | [Relational Databases](01-Relational-Databases.md) | Understand the relational data model and how data is organized. |
| 02 | [SQL Fundamentals](02-SQL-Fundamentals.md) | Learn to retrieve, filter, combine, and modify data using SQL. |
| 03 | [Schema Design](03-Schema-Design.md) | Understand how application requirements translate into relational structures. |
| 04 | [Keys and Constraints](04-Keys-and-Constraints.md) | Learn how databases identify records and enforce data integrity. |
| 05 | [Indexing Fundamentals](05-Indexing-Fundamentals.md) | Understand how indexes support data access and introduce trade-offs. |
| 06 | [Transactions](06-Transactions.md) | Learn about transaction boundaries, ACID properties, and concurrency fundamentals. |
| 07 | [Database Normalization](07-Database-Normalization.md) | Understand redundancy, data anomalies, dependencies, and normal forms. |
| 08 | [Query Execution Basics](08-Query-Execution-Basics.md) | Understand how a database processes queries and selects execution strategies. |
| 09 | [Introduction to NoSQL](09-Introduction-to-NoSQL.md) | Explore common NoSQL data models and their trade-offs. |
| 10 | [Data Modeling](10-Data-Modeling.md) | Translate business requirements into conceptual, logical, and physical data models. |

## How to Study This Topic

For each chapter:

1. Read the explanations and understand the underlying problem.
2. Examine the examples and diagrams.
3. Run SQL examples when an appropriate database environment is available.
4. Consider the engineering trade-offs and common mistakes.
5. Answer the interview questions without immediately consulting the expected answers.
6. Use the quick revision section to reinforce the key ideas.

Focus on understanding why a database design or operation works, not just memorizing syntax.

## Scope

This topic focuses on foundational database concepts and engineering decisions.

It does not provide comprehensive database administration, cloud deployment, advanced distributed database internals, replication and sharding implementation, advanced query optimizer engineering, vector database engineering, or ORM framework tutorials.

These subjects are covered in other chapters when they apply.

## Connections to Other Domains

Database Fundamentals provides a foundation for later work in:

- **RET — Retrieval Engineering:** understanding structured metadata and persistence in retrieval-related systems.
- **AGT — Agent Engineering:** understanding how application and agent state can be stored.
- **PROD — Production AI Engineering:** understanding foundational data-access decisions in application systems.
- **ENT — Enterprise AI Systems:** understanding data organization as part of broader system design.

These connections provide context without replacing the dedicated documentation for each domain.

## Completion Guidance

Consider this topic complete when you can explain the core concepts in your own words, write and interpret basic SQL, reason about schema and integrity decisions, describe fundamental indexing and transaction trade-offs, and choose between basic relational and NoSQL models based on application needs.

Understanding and explaining these concepts is more important than simply finishing the chapter list.
