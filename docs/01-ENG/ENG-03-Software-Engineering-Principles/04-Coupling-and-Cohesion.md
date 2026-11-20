# Coupling and Cohesion

## 1. Overview

Software components rarely operate independently. Functions call other functions, classes collaborate with other classes, modules use shared data, and services communicate through APIs.

These relationships are necessary. The engineering challenge is to organize them so that the system remains understandable and changes do not create unnecessary consequences across unrelated components.

Two concepts help engineers evaluate these relationships:

- **Coupling:** The degree and nature of dependency between components.
- **Cohesion:** The degree to which the responsibilities and elements within a component belong together.

A component with many unnecessary dependencies may be difficult to change safely. A component containing unrelated responsibilities may be difficult to understand and maintain.

Good software design generally aims for **appropriately low coupling and strong cohesion**, while recognizing that the right balance depends on the system's requirements and constraints.

### Learning objectives

After completing this chapter, you should be able to:

- Explain coupling and cohesion using practical engineering examples.
- Identify different forms of coupling.
- Recognize different forms of cohesion.
- Explain how dependencies affect change, testing, and failure propagation.
- Evaluate component boundaries using realistic scenarios.
- Refactor overly dependent or unfocused components.
- Use dependency relationships and simple structural indicators during code review.
- Explain why minimizing coupling or maximizing cohesion mechanically can lead to poor designs.

### Scope boundaries

This chapter focuses on relationships between components and the concentration of responsibilities within components.

Related concepts have their own primary locations:

- [02 — Software Design Principles](02-Software-Design-Principles.md) covers general design guidance.
- [03 — Separation of Concerns and Abstraction](03-Separation-of-Concerns-and-Abstraction.md) establishes responsibility boundaries and abstraction contracts.
- [05 — SOLID Principles](05-SOLID-Principles.md) develops specific design principles for managing responsibilities and dependencies.
- [06 — Dependency Injection](06-Dependency-Injection.md) covers how dependencies can be supplied to components.
- [07 — Layered and Clean Architecture](07-Layered-and-Clean-Architecture.md) covers dependency direction at the architectural level.

---

## 2. Understanding Coupling

**Coupling describes the dependency relationship between software components.**

When one component relies on another component's behavior, data, interface, or internal structure, the components are coupled.

For example:

```python
class OrderService:
    def create_order(self, customer_id: int) -> None:
        customer = CustomerDatabase.query(customer_id)
        print(f"Creating order for {customer.name}")
```

This service depends directly on `CustomerDatabase` and on the structure of the object returned by its query.

If the database access mechanism changes, or the returned representation changes, `OrderService` may require modification.

The problem is not that `OrderService` has a dependency. The problem is the extent and nature of the dependency and the consequences it creates.

### 2.1 Coupling is necessary

A system that performs useful work requires components to interact.

For example:

- An API handler depends on application behavior.
- An application service depends on operations that retrieve or store data.
- A notification workflow depends on a delivery mechanism.
- A reporting process depends on the data it reports.

Eliminating every dependency would eliminate useful collaboration.

The objective is to make dependencies **explicit, appropriate, and stable enough for the system's needs**.

### 2.2 Why coupling matters

Consider an application with the following dependency structure:

```text
Order Service
    |
    v
Database Implementation
    |
    v
Database Driver
    |
    v
Specific Database Engine
```

If the order service directly depends on database-specific behavior, changes to the persistence mechanism can affect business logic.

Now consider a service that depends on a repository contract:

```text
Order Service
    |
    v
Repository Contract
    ^
    |
Database Implementation
```

The service depends on the operations it needs rather than directly depending on the database implementation.

This second arrangement can reduce the impact of persistence changes on business logic. It does not eliminate all coupling: the service still depends on the repository contract, and the implementation must honor that contract.

The important question is which dependencies are necessary and which expose components to unnecessary implementation details.

### 2.3 Coupling has multiple dimensions

Coupling is not simply the number of imports or method calls between components.

It can involve:

- **Structural dependency:** One component directly references another.
- **Data dependency:** One component depends on another's data representation.
- **Control dependency:** One component determines how another performs its work.
- **Temporal dependency:** Components must execute in a particular order or within a particular time window.
- **Behavioral dependency:** One component relies on another's undocumented behavior or side effects.
- **Failure dependency:** Failure in one component can prevent another from functioning correctly.
- **Change dependency:** A change to one component repeatedly requires changes to another.

Two components with a single dependency can be tightly coupled if that dependency exposes unstable internals. Two components with several interactions can be reasonably decoupled if their contracts are clear and stable.

**Engineering question:** If this component changes, which other components must change, be retested, or behave differently?

---

## 3. Common Types of Coupling

The following classifications help identify problematic dependency relationships. They are diagnostic categories, not a universal numerical scale for every modern software system.

### 3.1 Content coupling

Content coupling occurs when one component depends on or manipulates another component's internal implementation details.

For example:

```python
class Account:
    def __init__(self):
        self._balance = 100.0

def apply_fee(account: Account) -> None:
    account._balance -= 10.0
```

The function directly modifies an internal attribute rather than using an operation that represents an allowed account behavior.

This can bypass validation, invariants, audit logic, or other rules associated with modifying the balance.

A better design might expose a meaningful operation:

```python
class Account:
    def __init__(self, balance: float = 0.0):
        self._balance = balance

    def apply_fee(self, amount: float) -> None:
        if amount <= 0:
            raise ValueError("Fee must be positive")

        if amount > self._balance:
            raise ValueError("Insufficient balance")

        self._balance -= amount
```

This example is illustrative; real financial operations require appropriate numeric precision, persistence, concurrency control, and transaction guarantees.

The improvement is that callers use an operation whose contract controls the state change.

**Engineering implication:** Dependence on internal representation makes implementation changes risky because consumers may rely on details that were never intended to be public.

### 3.2 Common coupling

Common coupling occurs when multiple components depend on the same shared mutable state.

For example:

```python
application_state = {
    "discount_rate": 0.10,
    "maintenance_mode": False,
}

def calculate_price(price: float) -> float:
    return price * (1 - application_state["discount_rate"])

def enable_discount_for_campaign() -> None:
    application_state["discount_rate"] = 0.25
```

Both functions depend on shared state. A change to that state can affect behavior elsewhere, potentially without an explicit call between the components.

Shared configuration is not automatically bad. The risk increases when shared mutable state can be changed by multiple components without clear ownership or coordination.

Potential consequences include:

- Unexpected behavior changes.
- Order-dependent execution.
- Difficult-to-reproduce tests.
- Race conditions in concurrent execution.
- Unclear ownership of business rules.

Possible improvements include explicit configuration ownership, controlled update operations, immutable configuration where appropriate, and clearly defined state-management contracts.

**Engineering implication:** Shared state can create hidden communication paths between components.

### 3.3 Control coupling

Control coupling occurs when one component passes information that dictates the internal decision-making or execution path of another component.

For example:

```python
def process_payment(amount: float, mode: str) -> None:
    if mode == "card":
        charge_card(amount)
    elif mode == "bank_transfer":
        initiate_transfer(amount)
```

The caller must know which modes the function supports and how those modes influence its internal behavior.

A mode parameter is not automatically a design problem. Sometimes a function legitimately represents a configurable operation. The concern arises when the caller becomes responsible for coordinating the internal implementation choices of another component.

Depending on the requirements, separate operations or a behavior-oriented interface may provide a clearer boundary.

**Engineering implication:** Control coupling can spread implementation knowledge and make changes require coordinated modifications across callers and callees.

### 3.4 Stamp coupling

Stamp coupling occurs when a component receives a larger data structure than it actually needs.

For example:

```python
def generate_invoice(customer):
    return f"Invoice for {customer.name}"
```

The function only needs the customer's name, but it receives the entire customer object.

If `customer` contains addresses, authentication details, preferences, and internal state, the function has access to far more information than it requires.

A narrower interface might be:

```python
def generate_invoice(customer_name: str) -> str:
    return f"Invoice for {customer_name}"
```

However, narrowing every parameter is not always better. Passing a complete domain object can be appropriate when the operation genuinely depends on its behavior or invariants.

The goal is not to eliminate object parameters. It is to avoid unnecessary dependence on unrelated parts of a data structure.

**Engineering implication:** Broad data dependencies can expose components to changes in fields they do not actually need.

### 3.5 Data coupling

Data coupling occurs when components interact through the specific data required for an operation.

For example:

```python
def calculate_total(unit_price: float, quantity: int) -> float:
    return unit_price * quantity
```

The function receives the values required to perform its calculation.

This is generally a straightforward form of interaction, provided the contract is clear and the parameters represent the intended business meaning.

Explicit data dependencies are often easier to understand and test than hidden shared state or broad dependencies on internal structures.

However, passing many unrelated primitive parameters can also create ambiguity. In such cases, a meaningful value object or domain type may improve clarity.

### 3.6 Temporal and behavioral coupling

Two components can depend on each other's execution order or undocumented behavior even when their interfaces appear simple.

Consider:

```python
def create_report() -> None:
    prepare_temporary_files()
    generate_report()
    delete_temporary_files()
```

The report-generation operation may depend on the preparation step having completed successfully.

If the ordering requirement is implicit or if one step is called independently without satisfying the preconditions, the system may fail.

Behavioral coupling also occurs when a caller relies on undocumented side effects. For example, a function that appears to retrieve a user might also modify global state or send a notification.

The problem is not that operations have prerequisites. It is that important prerequisites and side effects are unclear or uncontrolled.

**Engineering implication:** Clear contracts should communicate required ordering, state transitions, side effects, and failure behavior.

### 3.7 Interpreting the classifications

| Coupling form | Main dependency | Typical risk |
|---|---|---|
| Content | Internal implementation or state | Changes break consumers that rely on internals. |
| Common | Shared mutable state | Unrelated components influence each other implicitly. |
| Control | Another component's execution decisions | Implementation choices spread across callers. |
| Stamp | Larger data structure than required | Consumers depend on irrelevant data and representation. |
| Data | Explicit required data | Usually manageable when the contract is clear. |
| Temporal or behavioral | Execution order or implicit behavior | Incorrect sequencing or hidden side effects cause failures. |

These categories are useful for recognizing dependency problems. They should not be used as an inflexible ranking where every instance of one category is automatically worse than every instance of another.

---

## 4. Understanding Cohesion

**Cohesion describes how strongly the responsibilities and elements within a component belong together.**

A cohesive component has a clear purpose. Its functions, data, and internal decisions contribute to that purpose.

Consider a module responsible for generating invoices. It might contain:

- Invoice line-item calculations.
- Invoice totals.
- Invoice-specific validation.
- Invoice representation.

These operations are related to the module's responsibility.

Now imagine the same module also handles:

- User authentication.
- Sending marketing campaigns.
- Managing database migrations.
- Calculating unrelated employee salaries.

The module has accumulated responsibilities that do not naturally belong to its purpose.

The issue is not simply that the module contains many functions. The issue is that the functions represent different concerns and may evolve independently.

### 4.1 Why cohesion matters

Strong cohesion can make a component easier to:

- Understand.
- Test.
- Modify.
- Reuse in appropriate contexts.
- Assign ownership to.
- Reason about during debugging.

A developer working on invoice calculations should not need to understand an unrelated marketing subsystem merely because both happen to live in the same module.

### 4.2 Cohesion is about meaningful relationships

A component containing ten closely related operations can be more cohesive than a component containing three unrelated operations.

Likewise, splitting one coherent operation across numerous tiny modules can make the system harder to follow.

Cohesion is therefore a qualitative judgment about the relationship between a component's elements, not a simple count of methods.

**Engineering question:** Can I explain why these operations and data belong together as one component?

---

## 5. Common Types of Cohesion

The following categories are a traditional way of classifying cohesion. They help identify whether a component's elements are grouped because of a meaningful common purpose or merely because they happen to execute together.

The categories are diagnostic tools, not a requirement to classify every component formally.

### 5.1 Coincidental cohesion

Coincidental cohesion occurs when unrelated operations are grouped together without a meaningful shared purpose.

Example:

```python
def utilities():
    validate_user_email()
    calculate_employee_bonus()
    compress_image()
    generate_invoice_number()
```

The operations happen to share a module, but their responsibilities are unrelated.

A better organization would place them in appropriately named modules or components according to their actual purpose.

**Why it is problematic:** The module has no clear conceptual boundary, making ownership, testing, and future changes difficult to reason about.

### 5.2 Logical cohesion

Logical cohesion occurs when operations that are conceptually related by a broad category are grouped together, but the specific operation performed depends on a control flag or selector.

For example:

```python
def process_file(file_type: str, path: str) -> None:
    if file_type == "csv":
        process_csv(path)
    elif file_type == "json":
        process_json(path)
    elif file_type == "xml":
        process_xml(path)
```

The operations are logically related because they all process files. However, the function coordinates several distinct processing behaviors.

This design may be perfectly reasonable for a small, stable dispatcher. It becomes more difficult to maintain when the branches grow, change independently, or require different dependencies.

The correct response depends on the expected variation and complexity. Separate handlers or a registry may help in some systems, but introducing them is not automatically necessary.

### 5.3 Temporal cohesion

Temporal cohesion occurs when operations are grouped because they happen at the same time, rather than because they perform one coherent responsibility.

For example:

```python
def application_startup():
    connect_to_database()
    load_configuration()
    initialize_metrics()
    send_startup_notification()
```

These operations all happen during startup, but they serve different purposes.

A startup coordinator can legitimately invoke these operations in the required order. The concern arises if the coordinator also owns all the implementation details, making each startup concern difficult to change or test independently.

A thin orchestration function can preserve temporal coordination without forcing all the underlying responsibilities into one component.

### 5.4 Procedural cohesion

Procedural cohesion occurs when operations are grouped because they follow a particular sequence of execution, even though their responsibilities may be different.

For example, a function might:

1. Read an input file.
2. Update a database.
3. Send a notification.
4. Write an audit record.

The sequence may be necessary for a workflow, but the individual operations have different responsibilities.

A workflow coordinator can legitimately control the sequence while delegating each operation to the appropriate component.

Procedural cohesion is not automatically a defect. It becomes a concern when a sequence is used as the only reason to combine unrelated implementation details.

### 5.5 Communicational cohesion

Communicational cohesion occurs when operations are grouped because they operate on the same data or contribute to the same data-oriented outcome.

For example, a component may load an order, calculate its total, and prepare its summary.

These operations share a meaningful relationship through the order data.

Communicational cohesion can be useful, especially when the operations form a coherent responsibility. However, using the same data does not automatically make every operation part of the same component.

For example, sending an order-related marketing campaign and calculating its tax may both use order data but have different purposes and change requirements.

### 5.6 Sequential cohesion

Sequential cohesion occurs when the output of one operation becomes the input to the next operation.

Consider a processing pipeline:

```python
def process_document(raw_document: str):
    normalized = normalize_document(raw_document)
    parsed = parse_document(normalized)
    return extract_metadata(parsed)
```

Each step contributes to a defined transformation pipeline.

This can be a strong organizational choice when the sequence represents one coherent capability.

However, the fact that one operation feeds another does not mean every implementation detail should be placed in one large component. A pipeline may coordinate separate, well-defined processing stages.

### 5.7 Functional cohesion

Functional cohesion occurs when the elements of a component work together to perform one clearly defined task.

For example:

```python
def calculate_order_total(items) -> float:
    return sum(
        item.unit_price * item.quantity
        for item in items
    )
```

The function has one clear purpose: calculating the total represented by its input items.

Functional cohesion is often a desirable target for operations that perform one well-defined task. Larger components can also be cohesive when they collectively implement a meaningful responsibility.

Do not interpret functional cohesion as a requirement that every component perform exactly one machine operation or contain only one function.

### 5.8 Interpreting cohesion classifications

| Cohesion form | Basis for grouping | Diagnostic question |
|---|---|---|
| Coincidental | No meaningful common purpose | Why are these operations together? |
| Logical | Broad category of operation | Is one component coordinating unrelated variants? |
| Temporal | Same time or lifecycle phase | Are different responsibilities grouped only because they execute together? |
| Procedural | Execution sequence | Does the sequence justify coordination, or is it hiding separate responsibilities? |
| Communicational | Shared data | Do the operations form one coherent capability around that data? |
| Sequential | Output-to-input relationship | Does the pipeline represent a meaningful task? |
| Functional | One clear purpose | Do the component's elements collectively perform a well-defined responsibility? |

These categories help reveal the reason components are grouped. They are not substitutes for examining the actual system requirements.

---

## 6. The Relationship Between Coupling and Cohesion

Coupling and cohesion evaluate different aspects of a design.

- Coupling examines relationships **between** components.
- Cohesion examines relationships **within** a component.

They are complementary, but one does not automatically determine the other.

### 6.1 High coupling and low cohesion

Imagine an `ApplicationManager` module that handles user registration, billing, report generation, database operations, and notifications. It also directly accesses the internal state of many other modules.

This design has two potential problems:

- Low cohesion: unrelated responsibilities are grouped together.
- High coupling: the module depends on many components and their implementation details.

A change to billing may affect registration, while a change to a shared database structure may affect several unrelated operations.

This combination can make the system particularly difficult to maintain.

### 6.2 Low coupling and low cohesion

Imagine splitting every function into a separate module, but placing unrelated functions together inside a single generic orchestration module that imports and coordinates all of them.

The individual modules may have few dependencies, yet the orchestration module may still have an unfocused responsibility. Excessive splitting can also create a complicated network of calls.

Reducing coupling alone does not guarantee that the responsibilities inside each component make sense.

### 6.3 High cohesion and high coupling

A component may have a clear purpose but depend directly on many other components.

For example, a well-focused payment service may directly depend on a database implementation, several provider SDKs, and multiple global configuration objects.

Its internal responsibility may be coherent, but the number and nature of its dependencies can make implementation changes difficult.

The component may need better-defined contracts or more deliberate dependency boundaries.

### 6.4 Low coupling and high cohesion

A component has one coherent purpose and interacts with other components through clear, appropriately narrow contracts.

For example, an invoice calculation module may implement invoice calculations while accepting the required inputs and exposing a clear result. It need not know how an HTTP request arrived or which database stored the source records.

This is often a desirable design goal, although the appropriate degree of separation depends on the system.

### 6.5 A diagnostic matrix

| | Lower coupling | Higher coupling |
|---|---|---|
| **Higher cohesion** | Clear responsibilities with controlled dependencies; often a strong design. | Clear internal purpose, but changes may be affected by many external dependencies. |
| **Lower cohesion** | Responsibilities may be unnecessarily fragmented or poorly organized. | Unfocused components with extensive dependencies; often difficult to change safely. |

This matrix is a reasoning aid, not a quantitative scoring model.

The goal is not to achieve the lowest possible coupling score. It is to ensure that dependencies and responsibility boundaries are appropriate for the system's needs.

---

## 7. How Coupling and Cohesion Affect Testing

Testing provides practical evidence about the quality of component boundaries.

### 7.1 High coupling can make tests expensive

Suppose a business rule directly constructs a database client and invokes an external API.

A unit test for the business rule may now require:

- Database setup.
- External service configuration.
- Network access.
- Provider-specific test data.
- Cleanup of persistent state.

This makes it harder to isolate the behavior being tested.

If the business rule depends on a clear contract, tests can supply controlled implementations and verify the rule without requiring every external system to run.

This is not a reason to mock every dependency. Integration tests are still necessary to verify that real components work together.

### 7.2 Low cohesion can produce confusing tests

Suppose one service performs pricing calculations, sends emails, updates account settings, and generates reports.

Its test suite may require many unrelated scenarios. A change to one behavior can cause tests for unrelated behavior to fail because the service shares state or coordinates several responsibilities.

A more coherent component often allows tests to focus on a smaller, clearer set of expected behaviors.

### 7.3 Testability is evidence, not proof

A component that is easy to unit-test is not necessarily correctly designed. It may still violate important business constraints or fail under production load.

Similarly, a component that requires integration testing is not automatically poorly designed.

The useful question is whether the component's dependencies and responsibilities make the relevant behavior unnecessarily difficult to verify.

---

## 8. How Coupling and Cohesion Affect Change

Consider a product team that changes its invoice tax policy.

In a well-organized system, engineers should be able to identify the responsible business rule, modify it, and verify the effects on the relevant workflows.

In a poorly organized system, the tax rule may be duplicated across API handlers, background jobs, reporting code, and database procedures. Changes may require coordinated edits across multiple components.

The cost of change depends on more than the number of lines modified. It also depends on:

- How many components must be understood.
- How many components must change together.
- How much regression testing is required.
- Whether component contracts are explicit.
- Whether failure behavior is predictable.
- Whether hidden shared state affects the result.

A useful way to evaluate a design is to examine realistic change scenarios rather than judging the code only by its current appearance.

### 8.1 Change-impact analysis

For a proposed change, ask:

1. Which business rule or behavior is changing?
2. Which component should own that behavior?
3. Which other components depend on it?
4. Which dependencies are expected and which are accidental?
5. What tests would detect unintended effects?
6. Could a clearer boundary reduce the cost of similar future changes?

This analysis helps determine whether a design problem is caused by excessive coupling, poor cohesion, unclear contracts, or some combination of them.

---

## 9. Refactoring to Improve Coupling and Cohesion

Consider a simplified order-processing module:

```python
def process_order(order, database, email_client):
    total = sum(
        item["price"] * item["quantity"]
        for item in order["items"]
    )

    database.execute(
        "UPDATE orders SET total = :total WHERE id = :id",
        {"total": total, "id": order["id"]},
    )

    email_client.send(
        order["customer_email"],
        f"Order total: {total}",
    )

    return total
```

This function calculates a total, persists data, sends a notification, and coordinates the workflow.

It also depends on specific order dictionary fields and on the interfaces of two external collaborators.

For a small script, this may be acceptable. In a growing application, the responsibilities may deserve clearer boundaries.

### 9.1 Step 1: Identify the responsibilities

The function contains at least four responsibilities:

- Calculate the order total.
- Persist the order total.
- Send an order notification.
- Coordinate the overall operation.

The objective is to determine which of these responsibilities need independent boundaries.

### 9.2 Step 2: Separate the calculation

```python
def calculate_order_total(items) -> float:
    return sum(
        item["price"] * item["quantity"]
        for item in items
    )
```

The calculation can now be tested independently of the database and email client.

This function assumes valid item data and uses simplified numeric handling. A production implementation should define input validation, monetary precision, currency, and rounding rules explicitly.

### 9.3 Step 3: Define persistence and notification capabilities

```python
from typing import Protocol

class OrderRepository(Protocol):
    def update_total(self, order_id: int, total: float) -> None:
        ...

class OrderNotifier(Protocol):
    def notify_total(self, recipient: str, total: float) -> None:
        ...
```

The workflow depends on capabilities rather than directly embedding the implementations of database operations and notification delivery.

The protocols define the expected method signatures. A complete contract must also establish relevant error behavior, transaction semantics, and notification guarantees.

### 9.4 Step 4: Coordinate the operation

```python
class OrderService:
    def __init__(
        self,
        repository: OrderRepository,
        notifier: OrderNotifier,
    ) -> None:
        self.repository = repository
        self.notifier = notifier

    def process_order(self, order) -> float:
        total = calculate_order_total(order["items"])

        self.repository.update_total(order["id"], total)

        self.notifier.notify_total(
            order["customer_email"],
            total,
        )

        return total
```

The service now coordinates the workflow. The calculation is independently testable, while persistence and notification are represented by explicit contracts.

This does not eliminate all coupling. The service still depends on the repository and notifier contracts, and it still depends on the order representation.

Further changes might introduce a domain type for the order or clarify transaction boundaries. Whether those changes are justified depends on the real system.

### 9.5 Step 5: Validate the behavior

Before and after refactoring, verify:

- The same valid order produces the expected total.
- The correct order is updated.
- The expected recipient receives the notification request.
- Database failures are handled correctly.
- Notification failures follow the intended business policy.
- The overall operation preserves the required transaction and consistency guarantees.

An important production concern remains: if persistence succeeds but notification delivery fails, the system may enter a partially completed state. The correct solution depends on the business requirement and may involve retries, asynchronous processing, or an outbox pattern.

Improving coupling and cohesion makes responsibilities easier to identify. It does not remove the need to design failure handling and consistency explicitly.

---

## 10. Structural Indicators for Code Review

Coupling and cohesion are qualitative concepts, but certain structural indicators can help identify areas worth investigating.

### 10.1 Dependency count

A component with many direct dependencies may be harder to understand and test, particularly when those dependencies expose unstable implementation details.

However, dependency count alone is not a quality score. A coordinator may legitimately depend on several components to perform its defined workflow.

Investigate the nature of the dependencies and whether they belong at that boundary.

### 10.2 Change coupling

Change coupling occurs when two components repeatedly need to change together.

For example, a change to one business rule repeatedly requires edits to several unrelated modules.

This may indicate:

- Duplicated business knowledge.
- An unclear responsibility boundary.
- An inappropriate dependency.
- A legitimate business invariant spanning several components.

Repeated co-changes are evidence worth investigating, not proof that the components must be merged.

### 10.3 Fan-in and fan-out

These terms describe aspects of dependency relationships.

- **Fan-in:** The number of components that depend on a particular component.
- **Fan-out:** The number of components a particular component depends on.

A component with high fan-in may be widely used. Changes to its public behavior can therefore have a large impact.

A component with high fan-out may need to coordinate many dependencies, increasing the amount of behavior an engineer must understand when changing it.

Neither metric is inherently bad. A widely used, stable utility can appropriately have high fan-in, and an application coordinator can appropriately have high fan-out.

Use these measures to identify components that may deserve more careful contract management, testing, and review.

### 10.4 Change and failure propagation

A particularly useful design review asks what happens when a dependency changes or fails.

For each important dependency, consider:

- Can the caller continue operating without it?
- Is the failure propagated, handled, or retried?
- Can a dependency change silently alter business behavior?
- Does the caller rely on undocumented side effects?
- Are timeouts and error conditions explicit?
- Does the dependency introduce a shared bottleneck?

This analysis connects component-level design with reliability and operational engineering.

### 10.5 Use indicators together

Do not infer poor design solely from:

- A large number of imports.
- A long class.
- A high method count.
- A high fan-out.
- A single large file.
- The presence of shared data.

Instead, combine structural observations with evidence from actual changes, test complexity, incidents, and implementation requirements.

---

## 11. Common Engineering Mistakes

### 11.1 Treating low coupling as zero coupling

Components need dependencies to collaborate. Attempting to eliminate every dependency can create excessive interfaces, wrappers, and indirection.

The objective is to control dependencies, not eliminate them.

### 11.2 Treating high cohesion as one method per class

A class can contain several operations and remain cohesive when those operations collectively implement one meaningful responsibility.

Conversely, a class with only one method can still be unnecessary or poorly designed.

### 11.3 Splitting components without clarifying ownership

Moving functions into separate files does not automatically improve design. If ownership, contracts, and dependencies remain unclear, the original problem may persist.

### 11.4 Introducing abstractions solely to reduce direct dependencies

An abstraction is useful when it defines a meaningful contract or boundary. An interface that simply duplicates an implementation's entire internal structure may provide little decoupling.

### 11.5 Ignoring data and behavioral dependencies

A component may not directly import another implementation yet still depend on its internal data format, execution order, or undocumented side effects.

Dependency analysis must consider behavior, not only source-code references.

### 11.6 Overusing shared utilities

Centralizing unrelated functions into a generic utility module can reduce file duplication while creating a component with poor cohesion.

Organize functionality according to meaningful responsibilities rather than convenience alone.

### 11.7 Treating all repeated changes as a defect

Two components may legitimately need to change together because they enforce the same business invariant or implement one coordinated operation.

The question is whether the relationship is intentional, understandable, and appropriately tested.

### 11.8 Refactoring without checking behavior

A cleaner component structure can still introduce defects in transaction handling, error propagation, ordering, or side effects.

Structural improvements must be validated against the required behavior.

---

## 12. Practical Engineering Workflow

Use the following workflow when diagnosing a component that is difficult to change.

### Step 1: Select a concrete change scenario

Avoid starting with an abstract goal such as "reduce coupling." Identify a real problem, such as changing a persistence implementation or modifying a business rule.

### Step 2: Trace the dependencies

Identify which components the target depends on and which components depend on it. Include shared state, external services, data formats, and important execution-order assumptions.

### Step 3: Identify the responsibilities

Determine whether the component's responsibilities form one coherent purpose or represent unrelated concerns.

### Step 4: Identify the actual source of difficulty

Possible causes include excessive implementation dependencies, duplicated rules, broad data contracts, hidden side effects, or responsibilities that change for different reasons.

### Step 5: Propose the smallest meaningful change

Consider whether a clearer function boundary, a narrower contract, a dedicated module, or a different dependency relationship would address the problem.

Avoid introducing a new layer unless it provides a meaningful benefit.

### Step 6: Define the expected improvement

State what should become easier or safer after the change. For example, persistence changes should no longer require changes to a pure calculation component.

### Step 7: Verify behavior

Run relevant unit, integration, and regression tests. Pay particular attention to side effects, failures, state transitions, and transaction boundaries.

### Step 8: Reassess the result

Determine whether the new design genuinely reduced change impact or merely moved complexity elsewhere.

A successful refactoring improves the system's ability to meet its requirements; it does not merely change its structure.

---

## 13. Knowledge Connections

Coupling and cohesion provide a foundation for several later chapters.

| Topic | Connection |
|---|---|
| Software quality attributes | Connects component structure to maintainability, testability, reliability, and other quality goals. |
| Software design principles | Provides general guidance for evaluating dependency and responsibility decisions. |
| Separation of concerns and abstraction | Establishes responsibility boundaries and contracts that influence coupling and cohesion. |
| SOLID principles | Provides specific design guidance for managing dependencies, responsibilities, and extension. |
| Dependency injection | Examines how dependencies can be supplied explicitly and managed outside a component's core behavior. |
| Layered and clean architecture | Applies dependency and responsibility boundaries across an application's architecture. |
| Design patterns | Provides recurring solutions to particular dependency and collaboration problems. |
| Refactoring | Provides techniques for changing component structure while preserving required behavior. |

This chapter is the primary location for the definitions, classifications, and diagnostic use of coupling and cohesion. Later chapters should apply these concepts without repeating the full taxonomy.

---

## 14. Chapter Summary

Coupling and cohesion help engineers reason about software structure from complementary perspectives.

**Coupling** describes how components depend on one another. Problematic dependencies can expose components to unnecessary implementation changes, shared-state effects, and failure propagation.

**Cohesion** describes how strongly the responsibilities within a component belong together. Poorly cohesive components combine unrelated work, making them harder to understand, test, and evolve.

The key engineering lessons are:

1. Dependencies are necessary, but their nature and consequences should be deliberate.
2. Dependencies on internal implementation details are often more fragile than dependencies on clear, stable contracts.
3. Shared state, control decisions, broad data structures, and implicit execution assumptions can create hidden coupling.
4. Cohesion depends on meaningful responsibility, not simply on file size or method count.
5. Low coupling and strong cohesion are useful design goals, not absolute numerical targets.
6. Component boundaries should reflect real responsibilities, change patterns, and system requirements.
7. Structural indicators are useful for identifying potential problems, but must be interpreted in context.
8. Refactoring should improve the cost and safety of change while preserving required behavior.

The objective is not to create isolated components. It is to create components whose responsibilities are clear and whose dependencies are appropriate, explicit, and manageable.

---

## 15. Revision Checklist

Before moving to the next chapter, confirm that you can:

- [ ] Explain coupling and cohesion without confusing them.
- [ ] Distinguish content, common, control, stamp, and data coupling.
- [ ] Explain temporal and behavioral dependency risks.
- [ ] Recognize coincidental, logical, temporal, procedural, communicational, sequential, and functional cohesion.
- [ ] Explain why low coupling does not automatically imply high cohesion.
- [ ] Identify dependencies on internal data representations or undocumented side effects.
- [ ] Explain how coupling can affect testing and change impact.
- [ ] Explain how poor cohesion can make ownership and testing difficult.
- [ ] Interpret fan-in, fan-out, and repeated co-changes without treating them as automatic defects.
- [ ] Propose a refactoring that improves responsibility boundaries without adding unnecessary abstraction.
- [ ] Explain how to validate the refactoring's behavior and failure handling.

### Teaching check

Consider a user-management service that directly accesses a database, reads mutable global configuration, sends emails, and performs billing calculations. It is used by six different API endpoints.

The team reports that even small changes frequently require edits to several files and cause unrelated tests to fail.

Explain:

1. Which forms of coupling may be present?
2. Which responsibilities appear to have weak cohesion?
3. What evidence would you gather before deciding how to refactor?
4. Which boundary would you introduce first, and why?
5. What risks might your proposed change introduce?
6. How would you verify that the new design improves changeability without breaking behavior?

A strong answer should identify the likely problems, distinguish symptoms from root causes, and justify a targeted refactoring rather than immediately splitting everything into separate services.

---

## 16. Further Reading Within This Module

Continue in the approved chapter order:

1. [05 — SOLID Principles](05-SOLID-Principles.md)
2. [06 — Dependency Injection](06-Dependency-Injection.md)
3. [07 — Layered and Clean Architecture](07-Layered-and-Clean-Architecture.md)

For the complete module structure and learning path, see [README.md](README.md).

---

*End of Chapter 04 — Coupling and Cohesion.*
