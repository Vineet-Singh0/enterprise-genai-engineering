# Data Modeling

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain what data modeling is and why it matters in application engineering.
- Translate business requirements into entities, attributes, relationships, and constraints.
- Distinguish conceptual, logical, and physical data models.
- Identify relationship cardinality and optionality.
- Choose between embedding data and referencing related records at a modeling level.
- Design data structures around business operations and access patterns.
- Recognize how data models affect integrity, query complexity, and future changes.
- Apply a repeatable process to model data for a real application.

## Prerequisites

You should understand:

- Relational databases and their basic structures.
- SQL fundamentals.
- Schema design and keys.
- Database normalization.
- Introductory NoSQL data models.

Recommended prerequisites:

- [Relational Databases](01-Relational-Databases.md)
- [Schema Design](03-Schema-Design.md)
- [Keys and Constraints](04-Keys-and-Constraints.md)
- [Database Normalization](07-Database-Normalization.md)
- [Introduction to NoSQL](09-Introduction-to-NoSQL.md)

**Estimated reading time:** 40–50 minutes.

---

## 1. Before We Start

Imagine you are building a matrimonial application.

The application needs to support:

- User registration and profile management.
- Partner preferences.
- Profile discovery.
- Interest requests.
- Conversations between users.
- Subscription management.

Before creating tables or writing SQL, you need to understand what information the application must store and how that information relates.

For example:

- Can one user have multiple partner preferences?
- Can a user send interest requests to multiple people?
- Can two users have multiple conversations?
- Should a conversation store its participants directly?
- Should a profile's current location be stored separately from a location captured in a historical interaction?

These are data-modeling questions.

If the model is incorrect, adding indexes or optimizing queries will not fix the underlying business-logic problem.

**Data modeling is the process of representing business concepts, their properties, their relationships, and the rules governing them in a form that a software system can store and use reliably.**

The goal is not merely to create a database schema. The goal is to create a data structure that accurately represents the domain and supports the application's required operations.

---

## 2. Why Data Modeling Exists

Applications operate on business concepts, not just database rows.

A matrimonial application has users, preferences, interests, and conversations. An e-commerce application has customers, products, orders, and payments. A banking application has accounts, transactions, and customers.

The data model establishes how these concepts are represented and connected.

A good model helps engineers answer four questions:

1. **What facts must the system store?**
2. **How are those facts related?**
3. **Which rules must always remain true?**
4. **How will the application retrieve and update those facts?**

### 2.1 What happens when modeling is skipped?

Consider storing a user's interests as a comma-separated string:

```text
interested_users = "user_102,user_103,user_104"
```

This representation may look simple, but it becomes difficult to enforce individual relationships, attach timestamps to each interest, track statuses, and query the relationships reliably.

A separate relationship model may be more appropriate:

| Request ID | Sender | Recipient | Status |
|---|---|---|---|
| R01 | user_101 | user_102 | pending |
| R02 | user_101 | user_103 | accepted |
| R03 | user_101 | user_104 | rejected |

Now each interest request is an independently identifiable business record.

The model can support additional attributes such as creation time, response time, and status transitions.

### 2.2 Data modeling is a business decision

The choice of entities and relationships affects:

- Data integrity.
- Query complexity.
- Transaction boundaries.
- Application logic.
- Reporting.
- Security and access control.
- Schema evolution.
- Performance and operational cost.

A technically valid database schema can still be a poor data model if it fails to represent the real business rules.

---

## 3. The Three Levels of Data Modeling

Data modeling is often divided into three levels: conceptual, logical, and physical.

These levels answer different questions. They are related, but they should not be treated as interchangeable.

```text
<title size="md">1. Conceptual model</title>
Business perspective
Identifies the important business concepts and their relationships.
Example: Users send interest requests to other users.
<divider color="subtle"/>
<title size="md">2. Logical model</title>
Data structure perspective
Defines entities, attributes, identifiers, relationship cardinalities, and business rules.
Example: An interest request has a sender, recipient, status, and creation timestamp.
<divider color="subtle"/>
<title size="md">3. Physical model</title>
Implementation perspective
Specifies how the logical model is implemented in a particular database.
Example: PostgreSQL tables, column types, constraints, and indexes.
```

### 3.1 Conceptual modeling

At this level, focus on business meaning rather than database implementation.

For a matrimonial application, a conceptual model might contain:

- User.
- Partner preference.
- Interest request.
- Conversation.
- Message.
- Subscription.

The relationships might include:

- A user maintains a profile.
- A user creates partner preferences.
- A user sends interest requests.
- A conversation contains messages.

There is no need to decide index types or exact SQL column types yet.

### 3.2 Logical modeling

The logical model adds structural precision.

For example:

`InterestRequest(SenderUserID, RecipientUserID, Status, CreatedAt)`

The model must specify:

- How an interest request is identified.
- Whether the sender and recipient must be different.
- Which statuses are valid.
- Whether duplicate active requests are allowed.
- Whether the request can exist without a valid sender or recipient.

These are logical data-model decisions.

### 3.3 Physical modeling

The physical model translates the logical structure into a database-specific implementation.

For example, PostgreSQL might use:

- A `BIGINT` or `UUID` primary key.
- Foreign keys to the user table.
- A constrained status column.
- A timestamp column.
- An index supporting a frequent lookup.

Exact choices depend on the system's requirements and existing conventions.

**Engineering principle:** Establish business meaning first, model relationships second, and select implementation details with the target database in mind.

---

## 4. Identify Entities and Attributes

An entity represents a distinct concept about which the application needs to store information.

An attribute describes a property of an entity.

For example:

**User entity**

- User ID.
- Full name.
- Date of birth.
- Account status.
- Creation timestamp.

**Interest request entity**

- Request ID.
- Sender user ID.
- Recipient user ID.
- Status.
- Creation timestamp.
- Response timestamp.

### 4.1 How to identify an entity

Ask:

- Does this concept have an independent identity?
- Does the system need to store multiple instances of it?
- Does it have attributes of its own?
- Does it have a lifecycle?
- Can it participate in relationships with other concepts?

An interest request is a good candidate for an entity because it has its own status, timestamps, and lifecycle.

A calculated display label, on the other hand, may not need a separate entity if it can be derived reliably from existing information.

These are modeling judgments, not automatic rules.

### 4.2 How to identify attributes

For each entity, identify the facts the application needs to store.

For a message, possible attributes include:

- Message ID.
- Conversation ID.
- Sender ID.
- Message content.
- Creation timestamp.
- Delivery or processing status, if required.

Do not add every imaginable attribute. Start with the business requirements and the operations the application must support.

### 4.3 Avoid overloaded fields

A field should have a clear meaning.

For example, storing values such as `pending`, `accepted`, `rejected`, and `expired` in a single status attribute may be appropriate for an interest request.

Using that same field to represent both an interest request's status and a user's account status would mix two independent concepts.

Clear attribute ownership makes validation and application behavior easier to reason about.

---

## 5. Relationships, Cardinality, and Optionality

Entities rarely exist in isolation. Data modeling must describe how they relate.

### 5.1 One-to-one

One record in entity A corresponds to at most one record in entity B, and vice versa, according to the modeled business rules.

Example: A user and a separate one-to-one profile extension.

This relationship should be used only if the business rules genuinely enforce the one-to-one association. Splitting a table merely because it contains many columns is not sufficient justification.

### 5.2 One-to-many

One record in entity A can be associated with multiple records in entity B.

Example:

```text
User
  |
  +---- InterestRequest
  +---- InterestRequest
  +---- InterestRequest
```

A user may send many interest requests.

Each request still has one sender under this model.

### 5.3 Many-to-many

Many records in entity A can be related to many records in entity B.

Example:

- A student can enroll in many courses.
- A course can have many students.

In a relational model, an associative entity or junction table typically represents this relationship.

The enrollment example in [Database Normalization](07-Database-Normalization.md) demonstrates this pattern.

### 5.4 Optionality

Cardinality describes how many related records may exist. Optionality describes whether a relationship is required.

For example:

- A user may have zero interest requests.
- Every interest request must have a sender.
- A message must belong to a conversation.
- A conversation may initially contain zero messages.

The actual rules depend on the application.

Optionality matters because a database model should distinguish a relationship that is required from one that may not exist yet.

### 5.5 Model relationships explicitly

For each relationship, document:

- The entities involved.
- The cardinality.
- Whether the relationship is optional or mandatory.
- Which entity owns the relationship.
- Whether the relationship has its own attributes.
- Which constraints enforce the business rule.

This prevents assumptions from being hidden inside application code.

---

## 6. Modeling Relationships That Have Their Own Attributes

A relationship sometimes represents a business event with its own properties.

Consider two users connected by an interest request.

The relationship is not simply:

```text
User A -> User B
```

It also has:

- A creation time.
- A status.
- A response time.
- Potentially a reason or source.

Therefore, it should generally be modeled as an independent entity.

A simplified relational structure is:

```text
User
----
user_id
full_name

InterestRequest
---------------
request_id
sender_user_id
recipient_user_id
status
created_at
responded_at
```

This model makes the request independently queryable and gives it a clear lifecycle.

The same reasoning applies to:

- A student enrolling in a course.
- A product appearing in an order.
- A user participating in a conversation.
- A customer making a payment.

Whenever a relationship has attributes or a lifecycle, evaluate whether it deserves an explicit entity.

---

## 7. Modeling Data for Application Operations

A model must represent the domain correctly, but it must also support the operations the application needs.

Consider a profile-discovery feature.

The application may need to:

1. Retrieve profiles that satisfy eligibility rules.
2. Exclude profiles already viewed by the current user.
3. Exclude profiles already rejected or blocked.
4. Retrieve the current user's preferences.
5. Record a profile view.

These operations involve different business concepts and relationships.

A model that stores every preference and interaction in one large, ambiguous record may make it difficult to enforce constraints or query each relationship independently.

A more explicit model could include:

- `User`
- `PartnerPreference`
- `ProfileView`
- `InterestRequest`
- `BlockRelationship`

The precise design depends on the requirements.

### 7.1 Work backward from important queries

For each important application operation, write down:

- What information is required?
- Which entities provide that information?
- Which relationships must be followed?
- What filters are needed?
- How much data is expected?
- Does the operation update data or only read it?
- What consistency requirements apply?

This approach connects conceptual modeling with real application behavior.

### 7.2 Do not confuse access patterns with business entities

A frequently executed query may justify an index or a specialized read model. It does not automatically justify inventing a new business entity.

First determine whether the new structure represents a distinct business fact or is merely an optimization.

If it is an optimization, document its relationship to the authoritative data and how it will remain correct.

---

## 8. Embedding Versus Referencing in Document Models

Relational modeling commonly represents relationships through keys and joins. Document databases offer another important modeling decision: embedding related information within a document or storing it separately and referencing it.

### 8.1 Embedding

Suppose a product contains a small set of descriptive attributes that are normally retrieved with the product.

A document could store them together:

```json
{
  "product_id": "P101",
  "name": "Laptop",
  "manufacturer": {
    "name": "Example Systems",
    "support_url": "https://example.com/support"
  }
}
```

Embedding can be suitable when:

- The nested information belongs naturally to the parent.
- The information is commonly accessed together.
- The nested structure has a reasonable size.
- Independent updates and sharing are limited.

### 8.2 Referencing

If a manufacturer is shared by many products and has its own lifecycle, it may be represented separately.

A product document could instead contain:

```json
{
  "product_id": "P101",
  "name": "Laptop",
  "manufacturer_id": "M01"
}
```

The application retrieves the manufacturer through its identifier using the capabilities of the selected database.

Referencing can reduce duplication and make independent updates easier, although it may require additional queries or joins where supported.

### 8.3 The decision is workload-dependent

| Consideration | Embedding may fit when | Referencing may fit when |
|---|---|---|
| Access pattern | Parent and child are usually read together | Related data is accessed independently |
| Lifecycle | Child data belongs to the parent | Related data has an independent lifecycle |
| Sharing | Data is not widely shared | Data is shared by many records |
| Growth | Nested data is bounded | Related data can grow significantly |
| Updates | Data is usually updated together | Data changes independently |

These are guidelines rather than absolute rules.

Document databases differ in their query capabilities, transaction support, and constraints. Validate the chosen design against the actual product.

For relational databases, do not interpret embedding as a reason to abandon normalized relational structures indiscriminately.

---

## 9. Data Modeling and Data Integrity

A data model is incomplete if it describes the structure but ignores the rules that must remain true.

Consider an interest request.

Potential rules include:

- The sender must exist.
- The recipient must exist.
- The sender and recipient must be different.
- The status must be one of the supported values.
- The request must have a valid creation timestamp.
- Duplicate requests may be restricted according to business policy.

Different rules may be enforced in different places.

For example:

- Foreign keys can enforce references to existing users.
- A check constraint can enforce that sender and recipient differ.
- A unique constraint can enforce an appropriate uniqueness rule.
- Application logic can enforce a more complex business workflow.
- A transaction can ensure that related database changes succeed or fail together.

The correct implementation depends on the database and the precise business requirements.

### 9.1 Define the authoritative rule

For every important rule, determine:

1. What exactly must remain true?
2. Which component is responsible for enforcing it?
3. Can another application path bypass that component?
4. What happens if two requests attempt conflicting changes?
5. How will violations be detected and handled?

The objective is to prevent invalid states, not merely detect them after they appear.

Refer to [Keys and Constraints](04-Keys-and-Constraints.md) and [Transactions](06-Transactions.md) for the foundational mechanisms.

---

## 10. Historical Data Versus Current Data

A subtle but important modeling question is whether a field represents a current fact or a historical fact.

Suppose a customer changes their address.

The customer's current profile should usually reflect the new address.

However, an invoice may need to preserve the billing address used when the purchase occurred.

These are different facts:

- The customer's current address.
- The billing address recorded for a historical transaction.

Replacing the invoice address whenever the customer changes their profile could destroy important historical information.

A snapshot can be justified because the value has a different meaning and lifecycle.

The same distinction appears in many systems:

- Price at the time of an order versus current product price.
- User profile state today versus profile state at an earlier event.
- Current subscription status versus a historical subscription event.
- Current organizational membership versus membership at the time of an audit record.

### Engineering question

Before deciding to duplicate a value, ask:

**Does this value represent the same fact stored elsewhere, or does it represent a historical fact that must remain unchanged?**

The answer influences whether the repeated value is accidental redundancy or a deliberate part of the domain model.

---

## 11. Modeling Lifecycle and State

Many entities change over time.

An interest request might transition through states such as:

```text
Pending -> Accepted
Pending -> Rejected
Pending -> Expired
```

The model should represent both the current state and any history the business requires.

For a simple application, the current status may be sufficient.

For an auditable system, the application may also need a history of transitions, including:

- Previous status.
- New status.
- Change timestamp.
- Actor responsible for the change.
- Relevant reason or context.

These are different requirements.

Storing only the current status does not automatically preserve the history of how that status was reached.

Likewise, storing every transition does not eliminate the need to define how the current status is determined.

### 11.1 Model the lifecycle explicitly

For each entity with a lifecycle, document:

- Permitted states.
- Allowed transitions.
- Who can initiate each transition.
- Whether transitions must be atomic.
- Whether transitions require an audit record.
- What happens when a request is repeated.

This becomes particularly important in payment, subscription, approval, and workflow systems.

A data model should support the lifecycle rules instead of leaving them implicit.

---

## 12. Common Data-Modeling Mistakes

### Mistake 1: Designing tables before understanding the domain

Starting with columns often leads to structures that represent implementation convenience rather than business meaning.

Identify the entities, relationships, and rules first.

### Mistake 2: Storing independent relationships in one string

Comma-separated IDs and similar packed values make individual relationships difficult to validate, query, and update.

Use an appropriate relational or document structure for the required access pattern.

### Mistake 3: Treating every relationship as a simple foreign key

Some relationships have their own attributes and lifecycle.

An interest request or enrollment record may need to be modeled as an independent entity.

### Mistake 4: Ignoring cardinality and optionality

Assuming that a relationship is always one-to-one or always required can introduce incorrect constraints.

Specify how many related records are allowed and whether the relationship must exist.

### Mistake 5: Confusing current values with historical snapshots

A current profile value and a value recorded at a particular event may have different meanings.

Do not overwrite historical facts merely because the current value changes.

### Mistake 6: Optimizing before defining correctness

Adding caches, duplicate fields, or read models before establishing authoritative data ownership can create consistency problems.

Define the source of truth and business invariants first.

### Mistake 7: Modeling only the happy path

Real systems encounter retries, concurrent updates, partial failures, cancellations, and invalid transitions.

Model the relevant lifecycle and failure cases instead of representing only successful operations.

### Mistake 8: Overcomplicating the model

Not every attribute needs its own entity, and not every repeated value is a defect.

Create explicit entities when the domain meaning, relationship, lifecycle, or access requirements justify them.

---

## 13. A Practical Data-Modeling Workflow

Use this workflow when designing a database for a new feature.

### Step 1: Capture the business requirements

Write down what the feature must do in terms of user and system behavior.

Example:

- Users can send interest requests.
- Recipients can accept or reject requests.
- Users can view their sent and received requests.
- Duplicate requests are handled according to a defined policy.

### Step 2: Identify business entities

List the concepts that require independent identity or lifecycle.

For the example:

- User.
- Interest request.

Additional entities may be needed if the requirements include audit history or other independent concepts.

### Step 3: Define attributes and their meaning

For each entity, specify the facts it stores and the meaning of each attribute.

Avoid ambiguous fields whose interpretation changes across features.

### Step 4: Define identifiers and relationships

Determine how entities are identified and connected.

Specify cardinality, optionality, and relationship ownership.

### Step 5: Write down business invariants

Examples:

- A user cannot send an interest request to themselves.
- A request must reference valid users.
- Only permitted status transitions are allowed.

Identify the appropriate enforcement mechanisms.

### Step 6: Check for redundancy and anomalies

Review the proposed structure for dependencies that suggest unrelated facts have been combined.

Use the normalization concepts from [Database Normalization](07-Database-Normalization.md).

### Step 7: Validate against important queries

Determine whether the model can support the feature's important reads and writes.

Do not optimize every hypothetical query. Start with the operations required by the business.

### Step 8: Consider scale and growth

Identify unbounded collections, high-volume records, large payloads, and frequently accessed relationships.

Choose appropriate data structures and access patterns without prematurely introducing unnecessary technology.

### Step 9: Choose the physical implementation

Select database-specific types, constraints, indexes, and other implementation details.

Keep physical decisions traceable to the requirements.

### Step 10: Test the model

Test more than a successful insert.

Include:

- Duplicate requests.
- Invalid references.
- Concurrent updates.
- Deletion and retention rules.
- State transitions.
- Boundary cases.
- Expected query patterns.

A model is ready when it represents the business correctly and supports the required operations—not merely when the schema can be created.

---

## 14. Interview Questions and Answers

### Q1. What is data modeling?

Data modeling is the process of representing business entities, attributes, relationships, and rules in a structure that a software system can store and use reliably.

### Q2. What is the difference between conceptual, logical, and physical data models?

A conceptual model captures business concepts and their relationships. A logical model defines entities, attributes, identifiers, and relationship rules. A physical model specifies how the design is implemented in a particular database.

### Q3. What is cardinality?

Cardinality describes how many instances of one entity can be associated with an instance of another entity, such as one-to-one, one-to-many, or many-to-many.

### Q4. What is the difference between cardinality and optionality?

Cardinality describes the number of related instances. Optionality indicates whether the relationship is required or may be absent.

### Q5. When should a relationship become an independent entity?

When the relationship has its own attributes, identity, lifecycle, or business rules. For example, an enrollment relationship may need an enrollment date, status, and completion information.

### Q6. When should data be embedded rather than referenced in a document database?

Embedding may fit when related data is bounded, belongs naturally to the parent, and is usually accessed and updated together. Referencing may fit when data is shared, independently managed, or potentially unbounded. The final choice depends on the database capabilities and workload.

### Q7. Why might a system store a duplicated value intentionally?

The value may represent a historical snapshot rather than the current fact, or it may be a deliberately maintained derived value for a specific access pattern. Its meaning, ownership, and consistency requirements must be explicit.

### Q8. How does data modeling affect performance?

The model influences the number of joins, the amount of data retrieved, the size of intermediate results, the available access paths, and the complexity of maintaining consistency. Poor modeling can make required operations unnecessarily expensive or difficult to implement correctly.

### Q9. How would you design an interest-request feature?

I would identify the user and interest-request entities, define sender and recipient relationships, specify valid statuses and transitions, determine duplicate-request policy, enforce applicable constraints, and validate the model against sent-request, received-request, and response workflows.

### Q10. How do you know when a data model is ready?

It should represent the required business concepts and invariants, define relationships and lifecycle rules, support important application operations, handle relevant failure cases, and have an implementation strategy consistent with the system's correctness and operational requirements.

---

## 15. Quick Revision

- **Data modeling:** Represents business concepts, relationships, and rules.
- **Conceptual model:** Describes the business domain.
- **Logical model:** Defines entities, attributes, identifiers, and relationships.
- **Physical model:** Defines database-specific implementation details.
- **Entity:** A concept or record with an independent identity or lifecycle.
- **Attribute:** A property of an entity.
- **Cardinality:** The permitted number of related instances.
- **Optionality:** Whether a relationship is required.
- **Relationship entity:** A relationship modeled independently because it has attributes or a lifecycle.
- **Embedding:** Stores related information within a document.
- **Referencing:** Stores related information separately and connects it through an identifier or relationship mechanism.
- **Historical snapshot:** Preserves a fact as it was at a particular point in time.
- **Business invariant:** A condition that must remain true in valid system states.
- **Source of truth:** The authoritative location for a particular fact.

---

## 16. Key Takeaways

1. Good data modeling starts with business requirements, not SQL tables.
2. Conceptual, logical, and physical models serve different purposes.
3. Entities, attributes, cardinality, and optionality should reflect actual business rules.
4. Relationships with their own attributes or lifecycle often deserve explicit entities.
5. Access patterns influence modeling decisions, but they must not replace domain correctness.
6. Embedding and referencing are workload-dependent choices in document-oriented models.
7. Historical snapshots can be legitimate because they represent different facts from current values.
8. Integrity, lifecycle transitions, and failure scenarios must be considered during design.
9. Physical implementation should follow a sound logical model and be validated against actual application requirements.

---

## 17. Further Reading

- [PostgreSQL Documentation — Data Definition](https://www.postgresql.org/docs/current/ddl.html)
- [PostgreSQL Documentation — Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [MongoDB Documentation — Data Modeling](https://www.mongodb.com/docs/manual/data-modeling/)
- [Microsoft — Data Modeling](https://learn.microsoft.com/en-us/azure/architecture/data-guide/relational-data/)

Use the documentation for the selected database to validate implementation-specific behavior. The general modeling principles in this chapter do not replace product-specific design guidance.

---
**Final engineering exercise:** Design the data model for a matrimonial application's interest-request feature. Provide the entities, their attributes, relationships, cardinalities, important business rules, and three representative application operations. Explain how your design prevents invalid requests and how it handles a request being submitted more than once.

The goal is to defend the model based on business meaning, correctness, and required access patterns.

---

## ENG-07 Completion

You have now covered the ten approved topics in Database Fundamentals:

1. Relational Databases
2. SQL Fundamentals
3. Schema Design
4. Keys and Constraints
5. Indexing Fundamentals
6. Transactions
7. Database Normalization
8. Query Execution Basics
9. Introduction to NoSQL
10. Data Modeling

Completing the chapters is only the first step. You should be able to apply the concepts to a real schema, explain the trade-offs, and defend your design decisions.

*This completes `10-Data-Modeling.md` only. Review it and approve or request changes. Once approved, ENG-07's chapter generation is complete.*
