# Separation of Concerns and Abstraction

## 1. Overview

Software systems become difficult to maintain when unrelated responsibilities are mixed together or when components depend on implementation details they do not need to know.

Consider an API endpoint that receives a request, validates input, calculates business rules, queries a database, sends a notification, and constructs an HTTP response—all inside one function.

The function may work correctly. However, a change to the database schema, notification provider, or business rule can force engineers to modify and retest the same large unit of code.

Two fundamental design concepts help address these problems:

- **Separation of concerns:** Organize software so that distinct responsibilities are handled in appropriately distinct parts of the system.
- **Abstraction:** Expose the essential behavior or capabilities of a component while hiding unnecessary implementation details.

These concepts are related, but they solve different problems. Separation of concerns helps determine where responsibilities belong. Abstraction helps determine what a component should expose and what it should keep internal.

Together, they help engineers manage complexity without introducing unnecessary layers or abstractions.

### Learning objectives

After completing this chapter, you should be able to:

- Explain separation of concerns and why it matters.
- Identify mixed responsibilities in a real codebase.
- Distinguish separation of concerns from abstraction.
- Explain encapsulation and information hiding.
- Design meaningful interfaces and contracts.
- Recognize leaky abstractions and unnecessary indirection.
- Refactor a function that mixes HTTP, business, and persistence responsibilities.
- Evaluate the trade-offs of introducing additional components or abstraction boundaries.

### Scope boundaries

This chapter establishes the concepts and their practical application. Related topics are covered in their designated chapters:

- [02 — Software Design Principles](02-Software-Design-Principles.md): general principles such as DRY, KISS, and YAGNI.
- [04 — Coupling and Cohesion](04-Coupling-and-Cohesion.md): detailed analysis of dependency relationships and responsibility concentration.
- [05 — SOLID Principles](05-SOLID-Principles.md): specific principles governing software structure and change.
- [06 — Dependency Injection](06-Dependency-Injection.md): managing how dependencies are supplied to components.
- [07 — Layered and Clean Architecture](07-Layered-and-Clean-Architecture.md): organizing larger systems into architectural layers and defining dependency direction.

---

## 2. The Problem: Mixed Responsibilities

Imagine an endpoint that registers a new user.

```python
from fastapi import FastAPI, HTTPException
from sqlalchemy import text

app = FastAPI()

@app.post("/users")
def register_user(email: str, password: str):
    if "@" not in email:
        raise HTTPException(status_code=400, detail="Invalid email")

    if len(password) < 12:
        raise HTTPException(
            status_code=400,
            detail="Password is too short",
        )

    # Illustrative database access.
    with database.begin() as connection:
        connection.execute(
            text(
                "INSERT INTO users (email, password_hash) "
                "VALUES (:email, :password_hash)"
            ),
            {
                "email": email,
                "password_hash": hash_password(password),
            },
        )

    # Illustrative notification operation.
    send_welcome_email(email)

    return {"message": "User registered"}
```

This example is simplified for illustration. Production registration also needs appropriate password handling, uniqueness enforcement, transaction management, notification failure handling, and other security and operational considerations.

The important observation is that the endpoint performs several different jobs:

1. Handles HTTP request and response behavior.
2. Validates input.
3. Applies registration rules.
4. Coordinates persistence.
5. Invokes a notification provider.
6. Constructs the API response.

These responsibilities change for different reasons.

For example:

- A new API contract may change the request and response format.
- A business decision may change registration eligibility.
- A database migration may change persistence operations.
- A provider replacement may change email delivery.

When these concerns are mixed together, changes that should be independent can become entangled.

### 2.1 Why this creates engineering problems

The immediate issue is not the function's length. A long function can sometimes have one clear responsibility, while a short function can mix several unrelated concerns.

The deeper problem is that the code combines different kinds of knowledge:

- HTTP protocol details.
- Business rules.
- Database representation.
- External service behavior.

A developer changing one concern must understand the others and may accidentally alter their behavior.

Testing also becomes harder. A unit test for a registration rule may require database setup or HTTP-specific machinery even though the rule itself does not inherently need either.

The goal of separation is to create boundaries that allow responsibilities to be understood, changed, and verified more independently.

---

## 3. Separation of Concerns

**Separation of concerns (SoC) is the design principle of organizing software so that distinct responsibilities are handled in distinct, appropriately bounded parts of the system.**

A concern is an identifiable aspect of the system's behavior or implementation that deserves deliberate treatment.

Examples include:

- Request handling.
- Input validation.
- Business policy.
- Data persistence.
- Authentication and authorization.
- Notification delivery.
- External API integration.
- Logging and monitoring.

A concern does not automatically require its own class, file, service, or deployment. The appropriate boundary depends on complexity, change patterns, testing requirements, and operational constraints.

### 3.1 Separating responsibilities in the registration example

A possible organization is:

```text
HTTP Request
     |
     v
+----------------------+
| API / Request Layer  |
| Parse and validate   |
| request format       |
+----------------------+
     |
     v
+----------------------+
| Registration Logic   |
| Apply business rules |
| Coordinate operation |
+----------------------+
     |
     +----------------------+
     |                      |
     v                      v
+----------------+   +------------------+
| User Repository|   | Notification      |
| Persist user   |   | Send welcome email|
+----------------+   +------------------+
```

This diagram represents conceptual responsibilities, not a mandatory class hierarchy or deployment architecture.

The API layer deals with the external protocol. Registration logic coordinates the use case. Persistence and notification components handle their respective operations.

The benefit is that each part has a clearer purpose.

For example, changing the HTTP response format should not require rewriting the database insertion logic. Changing the persistence implementation should not automatically require changing the registration policy.

These benefits depend on the actual boundaries. Merely placing code in separate files does not guarantee separation if every component still depends on the same implementation details.

### 3.2 Separation does not mean isolation from all interaction

A system's responsibilities must collaborate to deliver useful behavior.

Registration logic must interact with persistence to create a user. It may also coordinate notification delivery.

Separation of concerns does not eliminate these relationships. It organizes them so that the interaction is explicit and appropriate.

The aim is **controlled collaboration, not total independence**.

### 3.3 Separation can exist at different scales

Separation of concerns applies at several levels.

**Function level**

A function should have a coherent purpose rather than combining unrelated operations.

**Class or module level**

A component should have a recognizable responsibility and a manageable public interface.

**Application level**

Different parts of an application may handle request processing, business operations, persistence, and external integrations.

**System level**

Separate services or systems may own distinct business capabilities when the requirements justify independent deployment, scaling, ownership, or failure boundaries.

The larger the boundary, the greater the operational and coordination consequences may become.

A concern does not need a separate service simply because it is conceptually distinct. In many applications, separate modules within one deployable application provide sufficient separation without the cost of network communication and distributed operations.

### 3.4 When separation is useful

Separation of concerns is especially useful when:

- Different responsibilities change for different reasons.
- A component is difficult to test without unrelated infrastructure.
- Business rules are scattered across protocol or persistence code.
- A change to one capability repeatedly breaks another.
- Multiple engineers need to work on different responsibilities.
- External integrations should be replaceable or independently verifiable.

**Engineering question:** Which responsibilities are mixed together, and would separating them reduce the cost or risk of realistic changes?

---

## 4. Abstraction

**Abstraction is the practice of representing a component through the essential capabilities or behavior that matter to its consumers, without requiring them to understand all of its internal implementation details.**

An abstraction provides a useful way to think about or interact with something complex.

For example, an engineer can call a repository method such as:

```python
user = user_repository.get_by_email(email)
```

The caller does not necessarily need to know whether the repository uses SQL, a document database, a remote API, or a cache-backed lookup.

The abstraction exposes the operation that the caller needs.

### 4.1 Abstraction reduces the knowledge required by a caller

Consider a notification provider.

Without an abstraction, application code might directly know about:

- A provider-specific SDK.
- Authentication credentials.
- Provider request formats.
- Network connection details.
- Provider-specific response codes.
- Retry behavior.

A caller that only needs to send a notification should not necessarily need all this knowledge.

A suitable abstraction could expose a simple operation:

```python
class NotificationSender:
    def send(self, recipient: str, message: str) -> None:
        raise NotImplementedError
```

A concrete implementation could handle provider-specific behavior:

```python
class EmailNotificationSender(NotificationSender):
    def send(self, recipient: str, message: str) -> None:
        # Provider-specific implementation belongs here.
        print(f"Sending email to {recipient}: {message}")
```

The example demonstrates the boundary, not a complete notification implementation. A real implementation should define suitable error behavior, delivery semantics, and result reporting.

The important point is that the caller can reason about the operation in terms of its purpose rather than the provider's internal API.

### 4.2 Abstraction is a contract

An abstraction is useful only when its behavior is sufficiently clear.

A contract should establish relevant expectations such as:

- What inputs are accepted?
- What does a successful operation mean?
- What outputs are returned?
- Which errors can occur?
- What side effects may happen?
- What guarantees does the implementation provide?
- Which details are intentionally unspecified?

For example, a method named `send()` could mean any of the following:

- A message was placed in a local queue.
- A request was accepted by an external provider.
- The provider confirmed delivery.
- The recipient actually received the message.

These meanings are not interchangeable.

If consumers rely on the wrong interpretation, the abstraction hides an important semantic difference rather than simplifying it.

A good contract states the behavior that consumers can depend on.

### 4.3 Abstraction is not merely adding an interface

An interface or abstract class is one way to express an abstraction, but abstraction can also be expressed through:

- A function with a clear contract.
- A module exposing a small public API.
- A database query interface.
- A service endpoint.
- A well-defined data type.
- A library that exposes operations while hiding internal algorithms.

A class named `AbstractProcessor` is not automatically a useful abstraction. If it exposes dozens of low-level implementation details, it may provide little simplification.

Conversely, a straightforward function can be an excellent abstraction if it expresses one meaningful operation behind a stable contract.

**Engineering question:** What should the caller be able to do without knowing how the implementation accomplishes it?

---

## 5. Encapsulation and Information Hiding

Encapsulation and information hiding are closely related to abstraction, but they are not identical.

### 5.1 Encapsulation

**Encapsulation groups related state and behavior together and controls how that state is accessed or modified.**

Consider an account balance.

```python
class BankAccount:
    def __init__(self, initial_balance: float = 0.0):
        if initial_balance < 0:
            raise ValueError("Initial balance cannot be negative")

        self._balance = initial_balance

    @property
    def balance(self) -> float:
        return self._balance

    def deposit(self, amount: float) -> None:
        if amount <= 0:
            raise ValueError("Deposit must be positive")

        self._balance += amount
```

The class groups the balance with the operation that changes it. The deposit method validates the operation before updating the state.

In Python, a leading underscore communicates that an attribute is intended for internal use; it does not enforce strict private access. The example is also simplified: a production financial system would need appropriate numeric representation, concurrency control, persistence, auditability, and transaction guarantees.

The design illustrates how access to state can be mediated by meaningful operations.

### 5.2 Information hiding

**Information hiding means keeping design decisions and implementation details internal when consumers do not need to depend on them.**

For example, a repository may hide whether it uses one SQL query, several queries, or a cache.

If the repository contract remains stable, internal implementation changes may not require changes to consumers.

The purpose is not to hide everything. It is to hide details whose exposure would create unnecessary dependencies.

Information hiding helps preserve freedom to change an implementation while maintaining its externally observable contract.

### 5.3 How the concepts relate

| Concept | Primary concern |
|---|---|
| Separation of concerns | Where distinct responsibilities belong. |
| Abstraction | What essential behavior a component exposes. |
| Encapsulation | How related state and behavior are grouped and access is controlled. |
| Information hiding | Which internal decisions should remain hidden from consumers. |

These concepts reinforce one another.

A registration component may have one responsibility, expose a small registration operation, keep its internal state controlled, and hide the details of how it coordinates persistence.

However, none of these concepts automatically guarantees good software design. A class can encapsulate many unrelated responsibilities, and an interface can expose an overly complicated contract.

---

## 6. Defining Good Interfaces and Boundaries

A component boundary determines how other parts of the system interact with it.

A good boundary gives consumers enough information to use the component correctly without exposing unnecessary implementation details.

### 6.1 Expose capabilities, not unnecessary machinery

Suppose application code needs to find a user by email.

A useful interface might be:

```python
class UserRepository:
    def get_by_email(self, email: str):
        raise NotImplementedError
```

The caller requests a meaningful operation.

An alternative interface might expose database connections, table names, query fragments, and transaction internals to every consumer. That design makes each caller responsible for details that could be managed inside the persistence component.

The appropriate interface depends on the application's requirements, but consumers should not need to understand internal machinery without a clear reason.

### 6.2 Keep contracts behaviorally meaningful

A weak abstraction often has a name that promises more than its implementation guarantees.

Consider an interface:

```python
class UserRepository:
    def save(self, user) -> None:
        raise NotImplementedError
```

What does `save()` guarantee?

- Does it insert only, or update existing records?
- Does it enforce uniqueness?
- Does it commit a transaction?
- Can it fail because of a concurrent write?
- Does returning mean the data is durably persisted?

The interface may be adequate if the surrounding contract answers these questions. Otherwise, its apparent simplicity hides ambiguity.

Good abstraction requires semantic clarity, not merely a short method signature.

### 6.3 Avoid exposing unstable implementation details

If a component exposes internal data structures directly, consumers may begin to rely on their exact representation.

Changing that representation can then break multiple consumers.

For example, returning a mutable internal dictionary may allow callers to alter internal state unexpectedly. Returning an immutable representation or exposing specific operations may be more appropriate.

The decision should be based on the required behavior, performance constraints, and ownership of the data.

### 6.4 Avoid unnecessary abstraction layers

A common overengineering pattern is to add layers that provide no meaningful boundary.

For example:

```python
def get_user(user_id):
    return user_service.get_user(user_id)

def get_user(user_id):
    return user_repository.get_user(user_id)
```

The duplicated function names above are illustrative of a pass-through design, not code intended to run together.

A wrapper that only forwards a call without adding validation, policy, coordination, a stable contract, or another useful responsibility may create indirection without providing meaningful abstraction.

Not every forwarding function is unnecessary. A boundary may deliberately preserve a public contract or translate between different representations. The important question is whether the boundary provides real value.

**Engineering question:** What meaningful guarantee, responsibility, or simplification does this interface provide to its consumers?

---

## 7. A Practical Refactoring Example

The earlier registration endpoint mixes several responsibilities. We can improve it by separating the HTTP boundary, application workflow, and persistence operation.

The goal is not to create the maximum possible number of classes. It is to establish boundaries that make the responsibilities easier to understand and test.

### 7.1 Define the business-facing contract

First, define the operations the registration workflow requires.

```python
from typing import Protocol

class UserRepository(Protocol):
    def create(
        self,
        email: str,
        password_hash: str,
    ) -> None:
        ...

class NotificationSender(Protocol):
    def send_welcome_email(self, email: str) -> None:
        ...
```

These protocols express capabilities required by the workflow.

They do not prescribe how a database connection is managed or which email provider is used.

The repository and notification implementations must still satisfy the contracts, including their error semantics.

### 7.2 Move the registration workflow into a dedicated component

```python
class RegistrationService:
    def __init__(
        self,
        user_repository: UserRepository,
        notification_sender: NotificationSender,
    ) -> None:
        self.user_repository = user_repository
        self.notification_sender = notification_sender

    def register(self, email: str, password: str) -> None:
        if "@" not in email:
            raise ValueError("Invalid email")

        if len(password) < 12:
            raise ValueError("Password is too short")

        password_hash = hash_password(password)

        self.user_repository.create(
            email=email,
            password_hash=password_hash,
        )

        self.notification_sender.send_welcome_email(email)
```

This service now expresses the registration workflow without directly embedding HTTP response handling or database-specific SQL.

The example uses a simplified email check and password-length rule. Production validation must follow the actual requirements, and password hashing must use a suitable password-hashing algorithm and configuration.

There is also an important transactional issue: if persistence succeeds but email delivery fails, the user may be created even though the overall operation reports an error. A production design must define the intended behavior, possibly using asynchronous delivery or a transactional outbox where justified. Separation of concerns makes this issue easier to identify, but does not solve it automatically.

### 7.3 Keep the HTTP boundary focused

A FastAPI endpoint can delegate the workflow:

```python
from fastapi import FastAPI, HTTPException

app = FastAPI()

@app.post("/users")
def register_user(email: str, password: str):
    try:
        registration_service.register(email, password)
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    return {"message": "User registered"}
```

Here, `registration_service` represents an appropriately constructed application service. Its dependency setup and concrete implementations are omitted for brevity.

The endpoint handles the HTTP boundary, while the registration service coordinates the business workflow.

This example is an illustration of responsibility separation, not a complete FastAPI application ready for deployment. In a real implementation, request models, error classification, dependency lifecycle, authentication, uniqueness conflicts, transaction boundaries, and failure recovery must be designed explicitly.

### 7.4 What improved?

The main improvement is not the number of files or classes. It is the clarity of responsibility.

- The endpoint translates between HTTP and the application workflow.
- The registration service coordinates the registration operation.
- The repository owns the persistence implementation.
- The notification sender owns the provider-specific delivery behavior.

These boundaries make it possible to test the registration workflow with controlled implementations of the repository and notification sender.

They also allow persistence and delivery implementations to change without necessarily changing the workflow.

However, this separation has a cost: more components, more interfaces, and more dependency wiring. For a very small script, this structure may be unnecessary. For a growing application with multiple workflows and external dependencies, the boundaries may provide meaningful value.

### 7.5 How to validate the refactoring

A refactoring is not complete merely because the code looks cleaner.

Verify that:

1. Invalid input is rejected according to the intended contract.
2. Valid registration invokes persistence with the expected data.
3. Passwords are never stored as plaintext.
4. Persistence failures are handled correctly.
5. Notification failures follow the defined business policy.
6. The HTTP response and error semantics remain correct.
7. Existing behavior is preserved where it is supposed to remain unchanged.

The important lesson is that improved structure should preserve required behavior while making the system easier to reason about.

---

## 8. Recognizing Poor Separation and Weak Abstractions

The following symptoms are useful signals during code review.

### 8.1 A single component handles unrelated concerns

Example: an API endpoint contains database migrations, business calculations, authorization policy, email formatting, and HTTP response construction.

**Possible response:** Identify the responsibilities that change independently and establish boundaries where those boundaries reduce complexity.

Do not automatically split every block into a separate class.

### 8.2 Business rules are tied to a delivery mechanism

Example: the same eligibility policy is implemented separately in an HTTP endpoint and a background job.

**Possible response:** Investigate whether the policy should have one authoritative implementation that both workflows can invoke.

The two workflows may still need different protocol-specific handling.

### 8.3 Consumers depend on internal representation

Example: multiple modules directly modify another component's internal dictionary or database-specific record format.

**Possible response:** Introduce a meaningful contract or controlled operations where they reduce unintended dependencies.

### 8.4 An abstraction exposes too many details

Example: a repository interface requires every caller to provide SQL fragments, database connection objects, and transaction implementation details.

**Possible response:** Reconsider which decisions belong behind the repository boundary and which details consumers genuinely need.

### 8.5 An abstraction promises unclear behavior

Example: a `send_notification()` method does not clarify whether it means queued, accepted, or delivered.

**Possible response:** Define the contract and relevant guarantees explicitly.

### 8.6 Too many layers provide no meaningful value

Example: each function simply forwards arguments to another function with the same contract, without adding behavior or protecting a boundary.

**Possible response:** Remove unnecessary indirection unless the layer provides a justified responsibility or stable boundary.

### 8.7 A boundary hides necessary information

Example: a database abstraction suppresses transaction failures and always returns success.

**Possible response:** Expose the errors and guarantees required for correct operation. Hiding implementation details must not conceal behavior consumers need to handle.

---

## 9. Trade-offs and Engineering Judgment

Separation of concerns and abstraction improve some aspects of software design, but they are not free.

Additional boundaries can introduce:

- More files and types to navigate.
- More interfaces and contracts to maintain.
- Additional indirection during debugging.
- Dependency wiring and configuration.
- Data conversion between representations.
- More complex error propagation.
- Potential performance overhead.
- Additional coordination when a change spans multiple components.

These costs can be justified when the boundaries make meaningful responsibilities easier to understand, test, replace, or evolve.

### 9.1 When to introduce a boundary

Consider creating a separate component or abstraction when one or more of the following are true:

- The responsibility has a distinct purpose.
- It changes for reasons different from its caller.
- It requires a different testing strategy.
- It hides unstable implementation details.
- It has a clear contract that other components can use.
- It is reused in several legitimate contexts.
- Its behavior needs to be replaced independently.
- The current structure repeatedly causes defects or expensive changes.

These are indicators, not automatic rules.

### 9.2 When to avoid introducing one

A new boundary may be unnecessary when:

- The behavior is trivial and unlikely to evolve independently.
- The abstraction has only one implementation and provides no meaningful isolation.
- A wrapper merely forwards calls.
- The abstraction introduces more concepts than it removes.
- The boundary obscures control flow or error handling.
- There is no meaningful contract to define.
- The extra structure makes the code harder to understand.

A single well-structured function can be better than a hierarchy of tiny classes. Equally, a single large function may be a poor choice when its responsibilities have different requirements and change patterns.

### 9.3 A decision framework

Before introducing a new abstraction or responsibility boundary, answer these questions:

1. What specific problem exists in the current design?
2. Which responsibility or implementation detail is involved?
3. Who needs to use the capability?
4. What contract should consumers depend on?
5. What implementation details should remain hidden?
6. What becomes easier after introducing the boundary?
7. What new complexity does the boundary create?
8. How will correctness and failure behavior be tested?
9. Would a simpler alternative provide the same benefit?

The best design is the one that improves the system in its actual context, not the one that has the most interfaces or the deepest component hierarchy.

---

## 10. Practical Design Review Checklist

Use this checklist when reviewing an existing component or designing a new one.

### Responsibility

- [ ] Can I state the component's primary purpose clearly?
- [ ] Does it mix responsibilities that change for unrelated reasons?
- [ ] Does each responsibility have an appropriate owner?
- [ ] Is any responsibility duplicated in a way that can cause inconsistent behavior?

### Abstraction and contracts

- [ ] Does the public interface expose meaningful capabilities?
- [ ] Can consumers use the component without understanding unnecessary implementation details?
- [ ] Are success behavior, failure behavior, and important guarantees clear?
- [ ] Does the abstraction hide implementation details without concealing information consumers need?
- [ ] Is every added interface or wrapper justified by a meaningful boundary?

### Testing and change

- [ ] Can the important behavior be tested without unnecessary infrastructure?
- [ ] Can relevant implementation details change without forcing unrelated changes?
- [ ] Are integration points and external side effects explicit?
- [ ] Have transaction boundaries, error handling, and failure scenarios been considered?

### Complexity

- [ ] Does the proposed design solve a real problem?
- [ ] Is the number of components appropriate for the scale and expected evolution of the system?
- [ ] Would a simpler design satisfy the same requirements?
- [ ] Are the benefits of the new boundary greater than its maintenance cost?

---

## 11. Knowledge Connections

This chapter introduces the conceptual foundations for several later topics.

| Topic | Relationship |
|---|---|
| Software design principles | Provides the general guidance used to evaluate whether boundaries and abstractions are justified. |
| Coupling and cohesion | Provides more precise ways to reason about relationships between components and the concentration of responsibilities within them. |
| SOLID | Develops specific design principles for managing responsibilities, dependencies, and change. |
| Dependency injection | Examines how dependencies can be supplied to a component instead of being constructed entirely inside it. |
| Layered and clean architecture | Applies responsibility separation and dependency boundaries at a larger architectural scale. |
| Design patterns | Describes recurring structures that can help solve specific design problems when their trade-offs are justified. |
| Refactoring | Provides techniques for improving structure while preserving required behavior. |

This chapter remains the primary location for the foundational distinction between separation of concerns, abstraction, encapsulation, and information hiding. Later chapters should reference these concepts when applying them rather than reproducing the full explanations.

---

## 12. Chapter Summary

Separation of concerns and abstraction address two related dimensions of software design.

**Separation of concerns** helps determine where distinct responsibilities should live.

**Abstraction** helps determine what a component should expose and what implementation details it should hide.

Encapsulation groups related state and behavior while controlling access. Information hiding protects internal decisions from unnecessary external dependencies.

Together, these concepts help engineers create software that is easier to understand, test, and evolve. However, adding boundaries also creates costs. More interfaces, classes, and layers are not automatically better.

The important engineering lessons are:

1. Identify responsibilities by their purpose and change requirements.
2. Keep unrelated concerns from becoming unnecessarily entangled.
3. Expose meaningful capabilities through clear contracts.
4. Hide implementation details that consumers do not need.
5. Preserve information consumers require for correct operation.
6. Introduce abstractions when they solve a real problem.
7. Avoid unnecessary layers and speculative complexity.
8. Validate that improved structure preserves required behavior.

Good design is not the maximum separation possible. It is the right separation for the system's requirements, constraints, and expected evolution.

---

## 13. Revision Checklist

Before moving to the next chapter, confirm that you can:

- [ ] Explain separation of concerns using a real application example.
- [ ] Distinguish separation of concerns from abstraction.
- [ ] Explain encapsulation and information hiding.
- [ ] Identify responsibilities mixed together in an API endpoint.
- [ ] Define an interface that expresses a meaningful capability.
- [ ] Explain why an abstraction needs a clear behavioral contract.
- [ ] Identify a leaky abstraction and explain its consequences.
- [ ] Explain why more classes and interfaces do not automatically produce better design.
- [ ] Refactor a mixed-responsibility function into meaningful components.
- [ ] Explain the trade-offs introduced by the refactoring.
- [ ] Describe how you would test the refactored behavior and failure cases.

### Teaching check

Consider a FastAPI endpoint that validates a request, applies business rules, executes SQL directly, calls an external AI service, writes an audit record, and formats the HTTP response.

Explain:

1. Which concerns are present?
2. Which responsibilities would you separate first, and why?
3. What contracts would you define between the resulting components?
4. Which implementation details should each contract hide?
5. How would you avoid creating unnecessary abstractions?
6. What failure scenarios could become more visible after separating the responsibilities?

A strong answer should propose a small number of meaningful boundaries, justify them in relation to change and testing, and explain how the resulting system would preserve correctness.

---

## 14. Further Reading Within This Module

Continue in the approved chapter order:

1. [04 — Coupling and Cohesion](04-Coupling-and-Cohesion.md)
2. [05 — SOLID Principles](05-SOLID-Principles.md)
3. [06 — Dependency Injection](06-Dependency-Injection.md)

For the complete module structure and learning path, see [README.md](README.md).

---

*End of Chapter 03 — Separation of Concerns and Abstraction.*
