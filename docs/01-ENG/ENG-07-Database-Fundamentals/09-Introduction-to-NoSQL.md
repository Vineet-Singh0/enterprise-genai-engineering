# Introduction to NoSQL

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain what NoSQL databases are and why they became important.
- Identify the limitations of using a relational database for every data-access pattern.
- Understand the major NoSQL data models: document, key-value, wide-column, and graph.
- Compare relational and NoSQL databases using data structure, relationships, queries, and consistency requirements.
- Explain schema flexibility and why NoSQL does not mean schema-less.
- Choose a suitable database category for a given engineering scenario.
- Understand polyglot persistence and the operational costs of using multiple database technologies.

## Prerequisites

You should understand:

- Relational databases, tables, rows, and relationships.
- SQL fundamentals and basic joins.
- Schema design, keys, and constraints.
- Database normalization and query execution basics.

Recommended prerequisites:

- [Relational Databases](01-Relational-Databases.md)
- [SQL Fundamentals](02-SQL-Fundamentals.md)
- [Schema Design](03-Schema-Design.md)
- [Database Normalization](07-Database-Normalization.md)
- [Query Execution Basics](08-Query-Execution-Basics.md)

**Estimated reading time:** 35–45 minutes.

---

## 1. Before We Start

Imagine you are building a matrimonial application.

Your system stores several types of information:

- User profiles with personal and professional details.
- User preferences that may vary between users.
- Chat messages exchanged between users.
- User relationships and interactions.
- Session information that expires after a short period.

A relational database can represent all these entities. It supports structured schemas, constraints, joins, and transactions.

However, not every workload has the same access pattern.

For example:

- A chat service may need to retrieve recent messages by conversation ID.
- A session service may need to look up a value using a session key.
- A relationship-analysis service may need to traverse connections between users.
- A profile-management service may need structured records and strong integrity constraints.

Different database models optimize for different ways of organizing and accessing data.

This leads to a fundamental engineering question:

**Should one database handle every workload, or should different workloads use different data models?**

NoSQL databases emerged as an important part of the answer for applications whose requirements benefit from alternative data models, access patterns, scalability approaches, or operational characteristics.

That does not mean relational databases have become obsolete. It means engineers have more than one data-storage model available.

---

## 2. What Is NoSQL?

NoSQL is a broad category of database systems that use data models beyond, or differently from, the traditional relational table-and-SQL model.

The term is commonly associated with four major categories:

1. Document databases.
2. Key-value databases.
3. Wide-column databases.
4. Graph databases.

These categories are not interchangeable. Each organizes information differently and provides different query and access capabilities.

Some NoSQL databases emphasize flexible document structures. Others are optimized for direct key lookups, large-scale distributed data access, or relationship traversal.

The term *NoSQL* does not imply that a database cannot support SQL-like queries. Some NoSQL systems provide SQL interfaces or query languages with SQL-like syntax.

### 2.1 Why NoSQL became important

Modern applications increasingly generate data with different shapes, access patterns, and workload requirements.

Examples include:

- Large volumes of application events.
- Frequently accessed session data.
- Product catalogs with varying attributes.
- Messages and activity feeds.
- Relationship networks.
- Data distributed across multiple machines or regions.

Traditional relational databases remain suitable for many of these workloads. However, forcing every workload into the same model may introduce unnecessary complexity or fail to meet particular access-pattern and scaling requirements.

NoSQL systems offer alternative designs that can be more suitable for specific situations.

### 2.2 NoSQL is not a replacement for relational databases

A common misconception is that relational databases are for small applications and NoSQL databases are for large applications.

That is incorrect.

Relational databases can support substantial workloads and sophisticated applications. NoSQL databases can also be inappropriate for workloads that require complex relational queries, strong relational integrity, or transaction semantics that their particular implementation does not provide.

The correct choice depends on requirements, not on the application's size or the popularity of a technology.

---

## 3. Relational Databases Versus NoSQL

Before studying individual NoSQL models, understand the broader difference.

| Dimension | Relational databases | NoSQL databases |
|---|---|---|
| Data model | Tables with rows and columns | Documents, key-value pairs, wide-column structures, graphs, or other models |
| Schema | Usually explicitly defined and enforced by the database | Varies by model and product; some allow flexible record structures |
| Relationships | Commonly represented through keys and joins | May use embedded data, references, keys, or explicit graph relationships |
| Querying | SQL is widely used | Query interfaces vary by product; some support SQL-like languages |
| Integrity | Rich relational constraints are commonly available | Integrity capabilities vary by product and data model |
| Transactions | Transaction support is a core relational capability | Transaction capabilities and scope vary by product |
| Scaling | Can scale vertically and horizontally, depending on the system and architecture | Many systems are designed around particular distributed access patterns, but scaling behavior varies |
| Best fit | Structured relationships, relational queries, integrity requirements | Workloads that benefit from a particular alternative data model or access pattern |

These are general tendencies, not universal rules.

A modern relational database can store JSON documents, distribute workloads, and scale horizontally in some configurations. A NoSQL database may offer transactions, strong consistency, or SQL-like querying.

**Choose based on the capabilities of the specific database and the requirements of the workload, not on a simplistic SQL-versus-NoSQL distinction.**

---

## 4. The Four Major NoSQL Data Models

- **4.1 Document databases**
- **4.2 Key-value databases**
- **4.3 Wide-column databases**
- **4.4 Graph databases**

The examples are representative products, not interchangeable implementations. Each has its own query language, transaction behavior, deployment model, and operational constraints.

---

## 5. Document Databases

### 5.1 Mental model

A relational database typically represents an entity using a row with a defined set of columns.

A document database can represent an entity as a structured document containing fields and nested objects.

For example, a user profile might be represented as:

```json
{
  "_id": "user_101",
  "name": "Aarav",
  "city": "Bengaluru",
  "profession": {
    "title": "Software Engineer",
    "experience_years": 3
  },
  "languages": ["English", "Hindi"],
  "preferences": {
    "preferred_cities": ["Bengaluru", "Pune"]
  }
}
```

This document groups related profile information together.

The example is illustrative JSON; the exact identifier and data types depend on the database.

### 5.2 Why document models exist

Application objects frequently contain nested structures.

In a relational model, those structures may be represented through multiple related tables. In a document model, data that is commonly accessed and maintained together can sometimes be stored in one document.

This can simplify certain application operations and reduce the need to reconstruct an object from multiple records.

However, embedding everything into one document is not always correct.

If a nested entity is shared across many parent records, changes independently, or grows without a reasonable bound, embedding it everywhere may create duplication and update problems.

### 5.3 Flexible schema

Two profile documents may contain different optional fields:

```json
{
  "_id": "user_101",
  "name": "Aarav",
  "city": "Bengaluru"
}
```

```json
{
  "_id": "user_102",
  "name": "Diya",
  "city": "Pune",
  "profession": "Data Analyst"
}
```

Some document databases permit this variation without requiring every document to have an identical set of fields.

This is useful when optional attributes or evolving data structures are part of the domain.

However, schema flexibility introduces responsibility. The application may need to validate field types, required attributes, and business rules to prevent inconsistent documents.

### 5.4 When to consider a document database

Consider this model when:

- Records naturally contain nested structures.
- Many operations retrieve or update an entity as a whole.
- Fields vary meaningfully between records.
- The required query patterns fit the database's document-query capabilities.

Avoid choosing it solely because JSON is convenient.

If the workload depends heavily on relational joins, cross-entity integrity, or complex multi-entity transactions, a relational model may be more appropriate.

---

## 6. Key-Value Databases

### 6.1 Mental model

A key-value database stores values associated with unique keys.

Conceptually:

```text
session:abc123  -> session data
session:def456  -> session data
cache:user:101  -> cached profile data
```

The application knows the key and retrieves the associated value.

The value may be a string, structured object, serialized payload, or another supported representation. Capabilities vary by product.

### 6.2 Why this model exists

Many application operations follow a simple pattern:

1. The application has a key.
2. It retrieves or updates the associated value.
3. It does not need to discover the record through a complex relational query.

A key-value model can make these operations straightforward and efficient.

### 6.3 Example: session storage

Suppose a user logs into an application.

The application creates a session key:

```text
session:abc123
```

The value may contain session-related information:

```json
{
  "user_id": "user_101",
  "role": "member",
  "expires_at": "2026-10-19T12:00:00Z"
}
```

A request can retrieve the session using its key.

The application does not need to query a large relational structure for every session lookup if the chosen session store supports the required access pattern.

In practice, authentication and session systems must also handle expiration, revocation, access control, and security. The data model alone does not solve those requirements.

### 6.4 Key-value databases and caching

A cache stores data so that frequently requested information can be retrieved without repeating an expensive operation.

Redis is often used for caching and key-based application state.

A cached value may become stale or disappear. Therefore, the application must decide:

- How long the value remains valid.
- How the value is refreshed.
- What happens when the cache misses.
- Whether cached data can safely be reconstructed.
- Whether the cache is the authoritative source or merely an optimization.

Do not confuse caching with durable primary storage. The appropriate durability and recovery guarantees depend on the system and its configuration.

### 6.5 When to consider a key-value model

Consider it when:

- The application usually knows the key for the desired value.
- Direct lookups and updates dominate the workload.
- Complex ad hoc queries are not central to the use case.
- The database's expiration, durability, and consistency features match the requirements.

A key-value model may be a poor fit when the application needs many flexible queries over attributes that are not part of the key or supported access patterns.

---

## 7. Wide-Column Databases

### 7.1 Mental model

Wide-column databases organize data around row keys and column-oriented structures that can support large, distributed workloads.

The terminology varies by system. For example, Apache Cassandra uses tables with partition keys and clustering columns, while Google Cloud Bigtable uses row keys and column families.

These systems should not be assumed to have identical internal structures.

### 7.2 Why this model exists

Some applications generate large volumes of data and have predictable access patterns.

Examples include:

- Time-series-like application events.
- Device or sensor measurements.
- High-volume activity records.
- Large-scale operational event storage.

The database can organize data around the access patterns required by the application rather than relying on arbitrary joins across many relations.

### 7.3 Access-pattern-oriented design

Suppose an application needs to retrieve events for a particular device over a time range.

A suitable data model may organize records so that the device identifier and time values support the expected query pattern.

The exact schema and partitioning approach depend on the chosen database.

The key engineering lesson is that data modeling must account for how records will be retrieved, not only how they are conceptually related.

### 7.4 Trade-offs

Wide-column systems can be effective for suitable distributed workloads, but they are not general-purpose replacements for relational modeling.

Depending on the product, limitations may include:

- Restricted or differently structured query capabilities.
- More application responsibility for data access patterns.
- Duplication across tables designed for different queries.
- Partitioning and hotspot risks.
- Consistency and transaction behavior that differ from the application's expectations.

Choose this model when its access patterns and operational characteristics match the workload.

---

## 8. Graph Databases

### 8.1 Mental model

Graph databases represent data as entities and relationships.

A graph commonly contains:

- **Nodes:** Entities such as users, products, or organizations.
- **Edges:** Relationships such as follows, owns, purchased, or connected to.
- **Properties:** Attributes attached to nodes or edges.

For example:

```text
Aarav ──follows──> Diya
Diya  ──works_at─> Company A
Aarav ──purchased> Product X
```

The relationships are explicit parts of the model.

### 8.2 Why graph databases exist

Many applications need to answer questions about connections rather than just retrieve individual records.

Examples include:

- Which users are connected through a sequence of relationships?
- Which accounts share suspicious connections?
- Which products are related through purchases and interests?
- Which entities are reachable from a particular starting point?

These queries can involve multiple relationship traversals.

A graph model can make such operations natural to express and reason about.

### 8.3 Example: relationship recommendations

Suppose a system recommends users based on shared connections.

The application may need to identify users connected to the current user through one or more intermediate relationships.

A graph database represents these relationships directly and supports traversal-oriented queries.

A relational database can also model relationships and perform recursive queries. The question is whether the graph model and its query capabilities provide a useful advantage for the actual workload.

### 8.4 When to consider a graph database

Consider it when:

- Relationships are central to the business problem.
- Queries repeatedly traverse multiple levels of connections.
- The relationship structure changes dynamically.
- The graph database's traversal and consistency capabilities match the requirements.

Avoid choosing it just because the data contains relationships. Almost every relational application contains relationships.

Use a graph database when relationship-oriented queries are important enough to justify a dedicated model and its operational costs.

---

## 9. How to Choose the Right Database Model

The correct decision starts with the workload rather than a list of database products.

Consider the following scenarios.

| Scenario | Model worth evaluating | Reason |
|---|---|---|
| Customer orders with line items, payment records, and integrity constraints | Relational | Structured relationships and transactional requirements |
| Product catalog with varying nested attributes | Document | Related data may be naturally grouped into documents |
| Session lookup using a known session key | Key-value | Direct retrieval by key |
| Large-scale event records queried through predictable partition keys | Wide-column | Potential fit for distributed, access-pattern-oriented workloads |
| Multi-hop relationship and connection analysis | Graph | Relationships and traversal are central to the queries |

These are starting points for evaluation, not automatic prescriptions.

A real design must also consider:

- Required consistency guarantees.
- Transaction scope.
- Data volume and growth.
- Query patterns.
- Latency and throughput targets.
- Durability and recovery.
- Operational expertise.
- Cost and deployment constraints.
- Integration with the rest of the system.

### A practical decision process

1. List the application's important read and write operations.
2. Identify the data each operation needs.
3. Determine the consistency and transaction requirements.
4. Evaluate which data model naturally supports those operations.
5. Verify that the database supports the necessary queries and constraints.
6. Prototype representative workloads.
7. Measure performance and resource consumption.
8. Assess operational complexity before committing to the architecture.

Do not select a database because it is popular or because a benchmark claims it is faster in a workload unlike yours.

---

## 10. Schema Flexibility Does Not Mean Schema-Less

A common claim is that NoSQL databases do not require schemas.

This is misleading.

Even if a database permits records with different structures, the application still relies on assumptions about the data.

For example, an application may assume that every active user has:

- A valid identifier.
- A supported account status.
- A correctly formatted creation timestamp.
- A defined set of required permissions.

If these rules are not enforced by the database, they still need to be enforced somewhere else.

### 10.1 Where can validation occur?

Depending on the database and architecture, validation can occur in:

- The database itself.
- An application service.
- A shared validation library.
- A data-ingestion pipeline.
- A combination of these layers.

The right location depends on which component owns the data and which operations can bypass the application.

### 10.2 What happens without validation?

One part of an application may store:

```json
{
  "user_id": "user_101",
  "age": 25
}
```

Another part may store:

```json
{
  "user_id": "user_102",
  "age": "twenty-six"
}
```

If the application expects `age` to be numeric, the second document can cause filtering, sorting, validation, or computation problems.

Schema flexibility is useful only when accompanied by a clear strategy for data consistency and evolution.

**Engineering principle:** Flexible storage does not remove the need for a data contract.

---

## 11. Consistency and Transactions in NoSQL

NoSQL databases differ significantly in their consistency and transaction capabilities.

It is incorrect to assume that every NoSQL database sacrifices strong consistency or transactions.

Some provide strong consistency and transactional operations. Others offer configurable consistency levels or distributed trade-offs that differ from traditional single-database transaction assumptions.

The specific product, configuration, operation, and deployment topology determine the actual guarantees.

### 11.1 Questions engineers should ask

Before selecting a database, clarify:

- Must a read immediately observe a successful write?
- Can the application tolerate temporarily stale results?
- Must multiple records change atomically?
- What happens when a request fails halfway through?
- What guarantees apply when data is distributed across nodes or regions?
- How are concurrent updates handled?

### 11.2 Example: updating a user profile

Suppose an operation updates a user's profile and records a corresponding audit entry.

If the application requires both changes to succeed or fail together, the chosen storage system and data model must support the necessary atomicity, or the architecture must explicitly handle partial failure.

Simply choosing a NoSQL database does not remove this requirement.

Conversely, if a workload stores reconstructable cache entries, the consequences of a missing or stale value may be very different.

The correct consistency model follows from business requirements.

Detailed transaction semantics and advanced distributed-system internals are outside this introductory chapter.

For foundational transaction concepts, refer to [Transactions](06-Transactions.md).

---

## 12. Polyglot Persistence

Polyglot persistence means using more than one data-storage technology within the same system, with each technology serving a workload for which it is suitable.

For example, an application might use:

- PostgreSQL for authoritative user profiles and relational integrity.
- Redis for caching or temporary session data.
- Object storage for large files.
- A specialized search or retrieval system for search-oriented workloads.

The important idea is not to use as many databases as possible. It is to use different systems when the benefits justify their additional complexity.

### 12.1 Why use multiple databases?

Different workloads can have conflicting requirements.

A relational database may be the right source of truth for transactional user data, while a cache can reduce repeated reads for frequently accessed information.

A separate search system may support retrieval patterns that are not efficiently handled by the primary transactional database.

Each component has a defined responsibility.

### 12.2 The operational cost

Every additional data system introduces responsibilities:

- Provisioning and configuration.
- Authentication and access control.
- Monitoring and alerting.
- Backup and recovery.
- Data synchronization.
- Failure handling.
- Capacity planning.
- Version upgrades.
- Cost management.

The application must also handle consistency between systems.

For example, if a user changes their profile in PostgreSQL but a cached copy remains unchanged, the application needs a policy for invalidating or refreshing that cache.

### 12.3 Source of truth

A production architecture should make ownership explicit.

For every important piece of data, ask:

- Which system is authoritative?
- Which copies are derived?
- How are derived copies updated?
- How are failures detected and repaired?
- What happens if a secondary system is unavailable?

Without clear ownership, multiple databases can create conflicting versions of the same fact.

### 12.4 A rule for engineering decisions

Start with the simplest architecture that satisfies the requirements.

Introduce another database only when a concrete workload, capability, isolation requirement, or measurable limitation justifies it.

Operational complexity is part of the cost of an architecture, not an afterthought.

---

## 13. Common Mistakes

### Mistake 1: Assuming NoSQL is always faster

Performance depends on the workload, data model, query pattern, implementation, and deployment configuration.

A NoSQL database can be slower or more expensive than a relational database for a particular workload.

### Mistake 2: Treating all NoSQL databases as equivalent

Document, key-value, wide-column, and graph databases solve different data-access problems.

Choosing the wrong model can create unnecessary complexity even if the database itself is technically capable.

### Mistake 3: Assuming flexible schema means no data validation

Applications still depend on data contracts. Without validation, inconsistent records can spread through the system and become difficult to repair.

### Mistake 4: Ignoring relationships

A document model can embed related data, but embedding every relationship can produce duplication and oversized records.

A key-value model can retrieve a value by key, but arbitrary relational queries may not fit its access model.

Choose the representation based on how relationships are used.

### Mistake 5: Selecting a database before understanding queries

The same conceptual entity can be modeled differently depending on how it will be read and updated.

Identify the expected access patterns before selecting the technology.

### Mistake 6: Assuming every NoSQL database lacks transactions

Transaction and consistency capabilities vary by product. Verify the guarantees required by the application against the specific database's documentation.

### Mistake 7: Adding multiple databases without defining ownership

If two systems store the same business fact, decide which is authoritative and how the other copy is maintained.

Otherwise, failures can leave the systems inconsistent.

### Mistake 8: Using NoSQL to avoid schema design

A flexible data model still needs clear ownership, validation, access patterns, and lifecycle rules.

NoSQL changes the modeling options; it does not eliminate data-modeling responsibilities.

---

## 14. Interview Questions and Answers

### Q1. What is a NoSQL database?

A NoSQL database is a database system that uses a data model other than, or differently from, the traditional relational table-and-SQL model. Common categories include document, key-value, wide-column, and graph databases.

### Q2. Why were NoSQL databases developed?

They provide alternative data models and access patterns for workloads involving flexible records, direct key lookups, large-scale distributed data access, or relationship traversal. They are not intended to replace relational databases for every workload.

### Q3. What is the difference between a document database and a key-value database?

A document database stores structured documents with fields and often nested objects, supporting queries over document attributes according to the product's capabilities. A key-value database primarily associates values with unique keys and is often optimized for direct key-based access.

The actual capabilities overlap in some products.

### Q4. When would you choose a graph database?

When relationship traversal is central to the workload, such as multi-hop recommendations, connection analysis, or relationship-based fraud investigation. The choice should be justified against the query capabilities and operational cost of alternatives.

### Q5. What is a wide-column database?

It is a database model that organizes records using row keys and flexible column-family or wide-row structures, depending on the product. It can suit large-scale distributed workloads with predictable access patterns.

### Q6. Is NoSQL schema-less?

Not necessarily. Some NoSQL databases permit records with varying structures, but applications still require data contracts and validation. Constraints and validation capabilities differ by product.

### Q7. Can NoSQL databases support transactions?

Yes, some do. The scope and guarantees vary by product and operation. Engineers must verify the exact atomicity, consistency, isolation, and durability requirements against the chosen system.

### Q8. What is polyglot persistence?

It is the use of multiple storage technologies within one system, assigning each a responsibility suited to its capabilities and the workload.

### Q9. What are the disadvantages of using multiple databases?

They increase operational overhead and can introduce data synchronization, consistency, monitoring, backup, recovery, security, and cost-management challenges.

### Q10. How would you choose between PostgreSQL and a NoSQL database for a new service?

I would first define the data model, access patterns, transaction requirements, consistency guarantees, expected scale, latency targets, and operational constraints. I would compare suitable technologies, prototype representative workloads, measure results, and choose the simplest architecture that satisfies the requirements.

---

## 15. Quick Revision

- **NoSQL:** A broad category of database systems using alternative or nontraditional relational data models.
- **Document database:** Stores structured documents, often with nested fields.
- **Key-value database:** Associates values with unique keys for direct access.
- **Wide-column database:** Organizes data around row keys and column-oriented structures suited to particular access patterns.
- **Graph database:** Represents entities and relationships as nodes and edges.
- **Schema flexibility:** Allows some structural variation but does not remove the need for data validation.
- **Consistency and transactions:** Depend on the specific database, operation, and configuration.
- **Polyglot persistence:** Uses multiple storage technologies for distinct workloads.
- **Source of truth:** The authoritative system for a particular business fact.
- **Database selection:** Should be based on data access patterns, correctness requirements, performance, and operational cost.

---

## 16. Key Takeaways

1. NoSQL is a collection of different data models, not one universal database architecture.
2. Document, key-value, wide-column, and graph databases address different access patterns.
3. Relational databases remain strong choices for structured relationships, integrity constraints, and transactional workloads.
4. Schema flexibility does not remove the need for data contracts and validation.
5. Consistency and transaction guarantees must be evaluated for the specific database.
6. Polyglot persistence can improve workload fit but introduces synchronization and operational complexity.
7. Database selection should begin with business requirements and query patterns rather than technology popularity.
8. The simplest architecture that satisfies the requirements is often the best starting point.

---

## 17. Further Reading

Use the official documentation to understand each database's actual capabilities and limitations:

- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [Redis Documentation](https://redis.io/docs/latest/)
- [Apache Cassandra Documentation](https://cassandra.apache.org/doc/latest/)
- [Neo4j Documentation](https://neo4j.com/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/current/)

These technologies differ in data modeling, querying, transactions, consistency, and operations. Do not assume that learning one NoSQL product automatically transfers every capability to another.

---
**Engineering exercise:** Design the storage architecture for a small application with user profiles, session data, and relationship-based recommendations. Explain which database model you would choose for each workload, which system would own each piece of data, and how you would handle failures or stale copies. You may choose one database for everything if you can justify why it satisfies the requirements.

The objective is not to use the largest number of technologies. It is to make a defensible engineering decision.

---

*This completes `09-Introduction-to-NoSQL.md` only. Review it and approve or request changes before generating `10-Data-Modeling.md`.*
