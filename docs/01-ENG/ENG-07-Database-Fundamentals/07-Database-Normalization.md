# Database Normalization

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain why database normalization exists and which data problems it addresses.
- Identify insertion, update, and deletion anomalies in a relational table.
- Understand functional dependencies and how they influence table design.
- Explain First Normal Form (1NF), Second Normal Form (2NF), and Third Normal Form (3NF).
- Transform an unnormalized design into a more reliable relational structure.
- Evaluate when normalization is beneficial and when controlled denormalization may be justified.

## Prerequisites

Before studying this chapter, you should understand:

- Tables, rows, columns, and relationships.
- Basic SQL operations, including `SELECT`, `INSERT`, `UPDATE`, and `DELETE`.
- Primary keys, candidate keys, composite keys, and foreign keys.
- The difference between schema design and integrity constraints.

Refer to [Relational Databases](01-Relational-Databases.md), [SQL Fundamentals](02-SQL-Fundamentals.md), [Schema Design](03-Schema-Design.md), and [Keys and Constraints](04-Keys-and-Constraints.md) for these foundations.

**Estimated reading time:** 35–45 minutes.

---

## 1. Before We Start

Consider a database table that stores students and the courses they attend.

| Student ID | Student Name | Course ID | Course Name | Instructor |
|---|---|---|---|---|
| 101 | Aarav | C01 | Python | Meera |
| 101 | Aarav | C02 | SQL | Rahul |
| 102 | Diya | C01 | Python | Meera |

At first glance, the table appears reasonable. It stores information about students, courses, and instructors.

However, it repeats information:

- Aarav's name appears for every course he attends.
- The course name `Python` appears for every student enrolled in that course.
- Meera's name is repeated whenever the Python course appears.

Repetition alone is not necessarily a problem. A relational database often repeats foreign-key values to represent relationships.

The deeper issue is that some facts are stored in multiple places. This can make the data difficult to maintain consistently.

For example, if the Python course changes its name, every row containing that course may need to be updated.

What happens if one row is updated and another is missed?

The database now contains conflicting information about the same course.

**Database normalization is a systematic approach to organizing relational data to reduce unnecessary redundancy and prevent data anomalies.**

---

## 2. Why Normalization Exists

Normalization addresses problems that emerge when a table combines facts that have different dependencies.

### 2.1 Update anomaly

Suppose a course's name is stored in 500 enrollment records.

If the course is renamed, all 500 records may need to be updated.

If only 499 are updated, the database contains inconsistent course names.

The problem is not merely the number of updates. The same fact is stored in multiple places, creating multiple opportunities for inconsistency.

### 2.2 Insertion anomaly

Suppose a course has been created, but no student has enrolled in it.

If course information can only be stored in the enrollment table, inserting the course may be impossible without inventing a student enrollment or allowing an incomplete record.

A fact about a course is unnecessarily dependent on the existence of a student enrollment.

### 2.3 Deletion anomaly

Suppose a course has exactly one enrolled student.

If deleting that student's enrollment also deletes the only row containing the course's name and instructor, the database loses information about the course itself.

A change to enrollment has unintentionally destroyed a different business fact.

### Summary of anomalies

| Anomaly | Problem |
|---|---|
| Update | The same fact must be changed in multiple rows. |
| Insertion | A fact cannot be stored independently of another unrelated fact. |
| Deletion | Removing one fact unintentionally removes another fact. |

Normalization aims to structure the data so that each independent fact has an appropriate place to be stored.

---

## 3. Functional Dependencies

Functional dependencies provide the reasoning behind normalization.

A functional dependency describes a relationship between attributes in which one attribute, or a group of attributes, determines another attribute.

It is written as:

`X → Y`

This means that, within the relevant data model, whenever two rows have the same value for `X`, they must also have the same value for `Y`.

Here, `X` is the determinant and `Y` is the dependent attribute or attribute set.

### 3.1 Example

Consider the following relationship:

`StudentID → StudentName`

This means that a particular student ID identifies one student name in the modeled system.

Similarly:

`CourseID → CourseName`

A course ID determines the course name.

For enrollment data, a student can enroll in multiple courses, and a course can have multiple students. Therefore, neither `StudentID` nor `CourseID` alone identifies a unique enrollment.

The combination does:

`(StudentID, CourseID) → EnrollmentDetails`

This assumes that a student can enroll in a particular course only once. If repeated enrollments are allowed, the model needs an additional identifier or another attribute to distinguish enrollment instances.

### 3.2 Functional dependencies are business rules

Functional dependencies are not discovered reliably by looking at a few sample rows.

For example, these records:

| Employee ID | Employee Name |
|---|---|
| E01 | Neha |
| E02 | Neha |

do not disprove `EmployeeID → EmployeeName`. Different employees can share a name.

However, if the business rule states that each employee ID identifies exactly one employee, the dependency remains valid.

Functional dependencies come from the meaning of the data and the rules of the system.

### 3.3 Relationship to keys

A candidate key uniquely identifies a row and therefore determines the other attributes in that row.

For example:

`StudentID → StudentName`

does not imply that `StudentID` identifies an enrollment row, because one student may have several enrollments.

Understanding the difference between a functional dependency and a candidate key is important:

- A **functional dependency** expresses a determination between attributes.
- A **candidate key** is a minimal attribute set that uniquely identifies a row.

This distinction becomes especially important when a table has a composite key.

---

## 4. A Practical Example of Normalization

We will normalize an enrollment table using a single example throughout this chapter.

Assume the business rules are:

1. A student has one student ID and one current name.
2. A course has one course ID, name, and assigned instructor.
3. A student can enroll in multiple courses.
4. A course can have multiple students.
5. A student can enroll in a particular course only once.

The initial relation is:

`Enrollment(StudentID, StudentName, CourseID, CourseName, Instructor)`

Its candidate key is:

`(StudentID, CourseID)`

The relevant functional dependencies are:

- `StudentID → StudentName`
- `CourseID → CourseName, Instructor`
- `(StudentID, CourseID) →` all attributes in the enrollment record

Notice that the student name depends on only part of the composite key. The course name and instructor also depend on only part of that key.

These dependencies reveal why the table contains redundant facts.

We will use them to understand the normal forms.

---

## 5. First Normal Form (1NF)

### 5.1 What 1NF means

First Normal Form requires each attribute value to be represented as a single value within its row and column, according to the attribute's intended meaning.

A column should not be used to store a list of independent values when those values need to be represented and queried as separate data items.

Consider this design:

| Student ID | Student Name | Courses |
|---|---|---|
| 101 | Aarav | Python, SQL |
| 102 | Diya | Python, Java, SQL |

The `Courses` column stores multiple courses in one cell.

This creates practical problems:

- Finding all students enrolled in SQL becomes more complicated.
- Removing one course requires modifying a list embedded in a value.
- Enforcing a foreign-key relationship for each course is difficult.
- Course-specific attributes cannot be represented naturally.

A better representation uses one enrollment per row:

| Student ID | Student Name | Course ID | Course Name |
|---|---|---|---|
| 101 | Aarav | C01 | Python |
| 101 | Aarav | C02 | SQL |
| 102 | Diya | C01 | Python |

Each row represents one student-course enrollment.

### 5.2 What 1NF does not solve

The revised table still repeats student names and course names.

Therefore, satisfying 1NF does not automatically eliminate redundancy or all data anomalies.

A table can be in 1NF while still having partial or transitive dependencies.

**Key idea:** 1NF addresses the representation of attribute values. It does not, by itself, solve every problem in relational design.

---

## 6. Second Normal Form (2NF)

### 6.1 What 2NF means

A relation is in Second Normal Form when:

1. It is in 1NF.
2. Every non-prime attribute is fully functionally dependent on every candidate key; equivalently, there are no partial dependencies of non-prime attributes on a proper subset of a candidate key.

A **prime attribute** belongs to at least one candidate key. A **non-prime attribute** does not belong to any candidate key.

The second condition is particularly important for tables with composite candidate keys.

### 6.2 Identify the partial dependencies

Our enrollment table has the candidate key:

`(StudentID, CourseID)`

But the dependencies include:

- `StudentID → StudentName`
- `CourseID → CourseName, Instructor`

The student name depends only on `StudentID`, not on the complete composite key.

Likewise, the course name and instructor depend only on `CourseID`.

These are partial dependencies because a proper subset of the candidate key determines non-prime attributes.

### 6.3 Decompose the table

Separate the independent student, course, and enrollment facts.

**Student**

| Student ID (PK) | Student Name |
|---|---|
| 101 | Aarav |
| 102 | Diya |

**Course**

| Course ID (PK) | Course Name | Instructor |
|---|---|---|
| C01 | Python | Meera |
| C02 | SQL | Rahul |

**Enrollment**

| Student ID (PK, FK) | Course ID (PK, FK) |
|---|---|
| 101 | C01 |
| 101 | C02 |
| 102 | C01 |

The enrollment table now represents the many-to-many relationship. Its composite primary key prevents the same student-course pair from being stored more than once.

The student name is stored with the student, and the course name and instructor are stored with the course.

### 6.4 Why this helps

If the Python course changes its name, the course record is updated once.

If a new course is created before anyone enrolls, the course can still be inserted.

If one student drops a course, deleting the enrollment no longer removes the course's descriptive information.

These improvements follow from assigning each fact to the relation determined by its dependencies.

### 6.5 When 2NF needs special attention

If every candidate key consists of a single attribute, a relation cannot have a partial dependency on a proper subset of that key. Once the relation is in 1NF, it therefore satisfies the 2NF condition.

However, tables with composite keys deserve careful examination.

Also, merely adding a surrogate ID does not automatically make a schema well-normalized. Other candidate keys and functional dependencies still matter.

---

## 7. Third Normal Form (3NF)

### 7.1 What 3NF means

Third Normal Form builds on 2NF by addressing certain dependencies between non-key attributes.

A relation is in 3NF if, for every non-trivial functional dependency:

`X → A`

at least one of the following holds:

- `X` is a superkey.
- `A` is a prime attribute.

A simpler way to reason about many everyday designs is to look for non-key attributes that determine other non-key attributes.

Such a dependency may indicate that two different facts have been combined in one relation.

### 7.2 Example of a transitive dependency

Consider a student table:

`Student(StudentID, StudentName, DepartmentID, DepartmentName)`

Assume each student belongs to one department and each department ID identifies one department.

The functional dependencies are:

- `StudentID → StudentName, DepartmentID`
- `DepartmentID → DepartmentName`

Therefore:

`StudentID → DepartmentID → DepartmentName`

The student ID determines the department name through the department ID. The department name is a fact about the department, not an independent fact about each student.

This is a transitive dependency pattern that violates 3NF when the relevant attributes are non-prime and the determinant is not a superkey.

### 7.3 Decompose the relation

**Student**

| Student ID (PK) | Student Name | Department ID (FK) |
|---|---|---|
| 101 | Aarav | D01 |
| 102 | Diya | D02 |

**Department**

| Department ID (PK) | Department Name |
|---|---|
| D01 | Computer Science |
| D02 | Data Science |

Now, department names are maintained in the department relation, while the student relation references the department.

### 7.4 Why this helps

Without decomposition, renaming a department may require updating many student rows.

The decomposition stores the department's identity and name together in one place. Student records reference that department rather than duplicating its descriptive information.

The change reduces the risk of inconsistent department names and allows department records to exist independently of student enrollment or membership, subject to the system's lifecycle rules.

### 7.5 Important precision

Not every dependency between non-key attributes automatically violates 3NF. The formal definition includes the prime-attribute condition.

For most introductory schema reviews, looking for non-key attributes that describe other non-key attributes is a useful diagnostic technique. The final decision should still be based on the actual candidate keys and functional dependencies.

---

## 8. Comparing 1NF, 2NF, and 3NF

| Normal form | Main concern | Typical warning sign |
|---|---|---|
| 1NF | Attribute values are represented appropriately as individual values. | A column stores a list of independently meaningful values. |
| 2NF | Non-prime attributes depend on the whole candidate key, not just part of it. | A student name depends only on `StudentID` in a student-course relation. |
| 3NF | Non-trivial dependencies satisfy the superkey-or-prime-attribute condition. | A department name is determined by `DepartmentID` inside a student table. |

The progression is cumulative:

- 2NF requires 1NF.
- 3NF requires 2NF.

A design should be evaluated using its candidate keys and functional dependencies, not just by whether its table names appear separated into different entities.

---

## 9. How to Normalize a Table in Practice

Normalization is a reasoning process rather than a mechanical rule to split every table into as many tables as possible.

Use the following workflow.

### Step 1: Understand the business facts

Write down what each row represents.

For the enrollment example, one row represents one student's enrollment in one course.

If the meaning of a row is unclear, it is difficult to identify valid keys or dependencies.

### Step 2: Identify candidate keys

Determine which attribute sets uniquely identify rows.

Do not assume a primary key is the only relevant candidate key. Alternate candidate keys can impose important dependencies too.

### Step 3: Identify functional dependencies

Ask questions such as:

- What does a student ID determine?
- What does a course ID determine?
- What does a student-course pair determine?
- Are these rules guaranteed by the business model, or do they merely happen to hold in current sample data?

Document the assumptions behind the dependencies.

### Step 4: Check for repeating groups and inappropriate multi-valued attributes

Ensure that independent values are represented in a suitable relational structure.

This is the starting point for 1NF.

### Step 5: Check for partial dependencies

For every candidate key, examine whether a non-prime attribute depends on only a proper subset of that key.

If so, consider separating the fact into an appropriate relation.

This is the key 2NF check.

### Step 6: Check dependencies among non-key attributes

Determine whether a non-key attribute is being used to determine another descriptive attribute that belongs elsewhere.

Evaluate the formal 3NF condition using candidate keys and prime attributes.

### Step 7: Validate the decomposition

After splitting a relation, verify that:

- The original facts can still be represented.
- Relationships can be reconstructed using joins where necessary.
- The decomposition does not introduce unintended combinations of rows.
- Relevant constraints can still be enforced.
- Inserts, updates, and deletes preserve the intended business rules.

A decomposition should preserve the information and meaning of the original design, not merely produce more tables.

### Step 8: Review the application workload

Normalization establishes a sound logical design. The actual application may still need carefully justified performance optimizations.

Measure the workload before introducing redundant data or denormalized structures.

---

## 10. Normalization and SQL

Normalization changes the logical organization of data. SQL is then used to access and maintain that organization.

For example, after decomposing the enrollment design, retrieving students enrolled in Python requires joining the relevant relations.

A PostgreSQL-compatible example:

```sql
SELECT
    s.student_id,
    s.student_name,
    c.course_name
FROM student AS s
JOIN enrollment AS e
    ON e.student_id = s.student_id
JOIN course AS c
    ON c.course_id = e.course_id
WHERE c.course_name = 'Python';
```

The query combines student, enrollment, and course facts without requiring the student and course names to be duplicated in every enrollment row.

This illustrates an important trade-off: a normalized model may require joins to reconstruct information that was previously stored together.

Joins are not inherently a design failure. They are a normal part of relational data access.

For more on SQL joins, see [SQL Fundamentals](02-SQL-Fundamentals.md).

---

## 11. Normalization and Denormalization

Normalization is usually a strong starting point for relational application data, but it does not mean that every piece of information must always be computed from fully separated tables at query time.

**Denormalization** deliberately introduces redundancy or precomputed results to satisfy a justified requirement, often related to read performance or data access patterns.

Examples include:

- Maintaining a precomputed aggregate for an expensive reporting query.
- Storing a historical snapshot of a customer's address on an invoice.
- Maintaining a read-optimized projection for a high-volume application workflow.

These examples are not automatically bad designs. Their correctness depends on what the stored value means.

For example, an invoice may need to preserve the billing address used at the time of purchase. That address represents a historical fact, not necessarily the customer's current address. Storing it with the invoice can be an intentional domain requirement rather than accidental duplication.

### 11.1 Costs of denormalization

Denormalization introduces additional responsibilities:

- Keeping redundant values consistent where consistency is required.
- Defining which copy is authoritative.
- Handling updates, failures, and concurrent changes.
- Testing synchronization logic.
- Monitoring the freshness of derived data.

A precomputed value can improve read performance but become incorrect if its update process fails.

### 11.2 A sound engineering decision

Before denormalizing, ask:

1. What measurable problem does normalization create for this workload?
2. Can query design, indexing, or caching address the problem?
3. Is the duplicated value a current fact, a historical snapshot, or a derived result?
4. Which component owns updates?
5. What happens if synchronization fails?
6. How will correctness and performance be tested?

**Rule of thumb:** Normalize to establish a reliable logical model. Denormalize only when there is a clear requirement and an explicit plan for preserving correctness.

Index selection and query measurement are covered in [Indexing Fundamentals](05-Indexing-Fundamentals.md) and [Query Execution Basics](08-Query-Execution-Basics.md).

---

## 12. Production Engineering Perspective

Normalization affects application behavior, not just database diagrams.

### 12.1 Data integrity

When a fact has one appropriate storage location, updates are easier to reason about. This reduces accidental disagreement between copies of the same current fact.

Normalization does not replace constraints. Primary keys, foreign keys, unique constraints, and other appropriate rules are still needed to enforce the intended data model.

### 12.2 Application design

A normalized schema can encourage clear ownership of data:

- Student information belongs to the student relation.
- Course information belongs to the course relation.
- Enrollment information belongs to the enrollment relation.

Application services can then perform operations against the relevant entities while the database maintains relationships and integrity.

### 12.3 Performance is workload-dependent

Normalization may increase the number of joins required for certain reads. However, duplicated data also increases storage, update work, and the risk of inconsistent values.

Neither “more tables are always faster” nor “fewer tables are always faster” is a sound engineering principle.

Measure representative workloads, inspect query plans, and optimize the actual bottleneck.

### 12.4 Schema evolution

A well-understood normalized model makes it easier to reason about changes to independent business facts. However, migrations still require careful planning, validation, and compatibility with application versions.

For migration concepts, refer to [Schema Design](03-Schema-Design.md) rather than treating normalization as a replacement for migration engineering.

---

## 13. Common Mistakes

### Mistake 1: Assuming repeated values always indicate bad design

Foreign keys repeat naturally in relational tables. Repeated `CourseID` values in an enrollment table represent relationships; they are not, by themselves, a normalization defect.

Focus on which facts depend on which keys.

### Mistake 2: Assuming 1NF means no redundancy

A table can satisfy 1NF and still have partial dependencies, transitive dependencies, and all three types of anomalies.

Check the relevant functional dependencies.

### Mistake 3: Adding a surrogate primary key and stopping the analysis

An artificial ID can uniquely identify a row without removing other candidate keys or dependencies.

A surrogate key does not automatically establish 2NF or 3NF.

### Mistake 4: Splitting tables without understanding their meaning

Creating separate tables is not the objective. The decomposition must preserve the facts, relationships, and intended semantics of the original model.

Unjustified decomposition can make the design harder to understand or introduce incorrect results.

### Mistake 5: Treating every repeated fact as accidental redundancy

Historical snapshots, audit records, and derived read models can legitimately store repeated values.

Determine whether the data represents the same current fact or a distinct fact with its own meaning.

### Mistake 6: Denormalizing before measuring

A developer may duplicate fields to avoid joins based on an assumption that joins are expensive.

Without representative measurements, this can add synchronization complexity without solving the actual performance problem.

### Mistake 7: Confusing normalization with a complete database design

Normalization does not independently decide every domain rule, lifecycle requirement, access-control policy, index, or transaction boundary.

It is one part of sound relational modeling.

---

## 14. Interview Questions and Answers

### Q1. What is database normalization?

Database normalization is the process of organizing relational data according to keys and dependencies to reduce unnecessary redundancy and prevent insertion, update, and deletion anomalies.

### Q2. What are the three common data anomalies?

- **Insertion anomaly:** A fact cannot be stored independently of another fact that should not be required.
- **Update anomaly:** The same fact must be updated in multiple places, creating inconsistency risk.
- **Deletion anomaly:** Removing one fact unintentionally removes another fact.

### Q3. What is a functional dependency?

A functional dependency `X → Y` means that, under the modeled business rules, the value of `X` determines the value of `Y`.

It is a property of the data model, not merely a pattern observed in sample records.

### Q4. What is the difference between 1NF and 2NF?

1NF addresses the appropriate representation of individual attribute values. 2NF additionally requires every non-prime attribute to be fully functionally dependent on every candidate key, eliminating partial dependencies.

### Q5. Why is a composite key relevant to 2NF?

A composite key contains multiple attributes. A non-prime attribute may depend on only one part of that key instead of the complete key. This is a partial dependency and violates 2NF.

### Q6. What is a transitive dependency?

A transitive dependency occurs when one attribute determines another through an intermediate attribute. For example, if `StudentID → DepartmentID` and `DepartmentID → DepartmentName`, the student ID determines the department name through the department ID.

Such a pattern can violate 3NF when the formal 3NF conditions are not satisfied.

### Q7. Does adding a primary-key ID automatically normalize a table?

No. A surrogate ID may uniquely identify each row, but other candidate keys and functional dependencies can still create redundancy and anomalies.

### Q8. Is normalization always better for performance?

No. Normalization often improves consistency and reduces unnecessary update work, but it can require joins for some reads. Performance depends on the workload and implementation. Denormalization may be justified when a measurable requirement outweighs its consistency and maintenance costs.

### Q9. Does normalization eliminate the need for database constraints?

No. Normalization helps organize facts and dependencies. Constraints enforce rules such as uniqueness, required values, valid relationships, and permitted values.

### Q10. How would you normalize a student-course enrollment table?

First identify what one row represents and determine its candidate keys. Then document dependencies such as `StudentID → StudentName` and `CourseID → CourseName`. Store student and course facts in their own relations and use an enrollment relation with an appropriate composite key or equivalent uniqueness constraint to represent the many-to-many relationship.

Validate that the decomposition preserves all required facts and relationships.

---

## 15. Quick Revision

- **Normalization:** Organizes relational data around keys and dependencies.
- **Functional dependency:** `X → Y` means `X` determines `Y` under the model's rules.
- **Update anomaly:** The same fact can become inconsistent across rows.
- **Insertion anomaly:** A fact cannot be stored independently when it should be.
- **Deletion anomaly:** Deleting one fact unintentionally removes another.
- **1NF:** Represents attribute values appropriately as individual values.
- **2NF:** Requires every non-prime attribute to be fully dependent on every candidate key; no partial dependencies.
- **3NF:** Requires each non-trivial functional dependency to have a superkey determinant or a prime attribute as its dependent attribute.
- **Normalization workflow:** Understand row meaning, identify candidate keys, establish functional dependencies, check normal forms, and validate decomposition.
- **Denormalization:** A deliberate optimization or modeling choice that requires explicit ownership and correctness rules.

---

## 16. Key Takeaways

1. Normalization is about the meaning and dependencies of data, not simply about creating more tables.
2. Functional dependencies and candidate keys provide the foundation for reasoning about normal forms.
3. 1NF, 2NF, and 3NF address different classes of structural problems.
4. A good decomposition preserves the information and relationships represented by the original model.
5. Constraints remain necessary to enforce database integrity.
6. Normalization establishes a reliable logical design; performance decisions should be based on measured workloads.
7. Denormalization is sometimes appropriate, but its consistency and maintenance costs must be understood.

---

## 17. Further Reading

Use these resources to deepen your understanding:

- [PostgreSQL Documentation — Database Design](https://www.postgresql.org/docs/current/ddl.html)
- [PostgreSQL Documentation — Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [IBM — Database Normalization](https://www.ibm.com/think/topics/database-normalization)

Use the official PostgreSQL documentation to understand how logical design interacts with actual database constraints and implementation behavior.

---
