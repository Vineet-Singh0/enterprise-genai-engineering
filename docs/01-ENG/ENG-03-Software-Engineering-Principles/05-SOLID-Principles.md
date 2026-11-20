# SOLID Principles

## 1. Overview

As software grows, a design that works well for the initial requirements can become difficult to change. A single class may accumulate unrelated responsibilities, new features may require modifications across many existing components, and implementations may depend heavily on concrete technologies.

The **SOLID principles** are five object-oriented design principles that help engineers manage these problems:

- **S — Single Responsibility Principle:** A module should have one well-defined responsibility and one coherent reason to change.
- **O — Open/Closed Principle:** Software entities should accommodate relevant extensions without requiring repeated modifications to stable existing code.
- **L — Liskov Substitution Principle:** A subtype must preserve the behavioral expectations of the type it replaces.
- **I — Interface Segregation Principle:** Consumers should not be forced to depend on operations they do not need.
- **D — Dependency Inversion Principle:** High-level policy should not depend directly on low-level implementation details; both should depend on appropriate abstractions.

These principles are particularly useful when designing object-oriented systems, but their underlying ideas also apply to modules, APIs, services, and other software components.

SOLID does not prescribe a universal class structure. Each principle helps identify a particular category of design risk, and each must be evaluated in the context of actual requirements.

### Learning objectives

After completing this chapter, you should be able to:

- Explain the problem addressed by each SOLID principle.
- Identify violations and explain their practical consequences.
- Refactor code to improve responsibility boundaries and dependency relationships.
- Distinguish a meaningful abstraction from unnecessary indirection.
- Explain how the principles relate to coupling, cohesion, and changeability.
- Recognize when applying a principle mechanically would make a design worse.
- Evaluate SOLID-based design choices using realistic engineering scenarios.

### Scope boundaries

This chapter focuses on the five principles and their application.

- [02 — Software Design Principles](02-Software-Design-Principles.md) covers broader guidance such as DRY, KISS, and YAGNI.
- [03 — Separation of Concerns and Abstraction](03-Separation-of-Concerns-and-Abstraction.md) establishes responsibility boundaries, abstraction, encapsulation, and information hiding.
- [04 — Coupling and Cohesion](04-Coupling-and-Cohesion.md) explains dependency relationships and responsibility concentration.
- [06 — Dependency Injection](06-Dependency-Injection.md) focuses on supplying dependencies to components.
- [07 — Layered and Clean Architecture](07-Layered-and-Clean-Architecture.md) applies dependency and responsibility principles at the architectural level.
- [08 — Design Patterns](./08-Design-Patterns.md) covers recurring design solutions and their trade-offs.

---

## 2. Why SOLID Exists

Consider a notification system that initially sends email notifications.

Its first implementation may be straightforward:

```python
class NotificationService:
    def send(self, message: str) -> None:
        print(f"Sending email: {message}")
```

Later, the system must support SMS notifications. Then the product adds push notifications, different notification policies, and provider-specific delivery behavior.

The design now faces several questions:

- Should every new notification type modify the same class?
- Should notification formatting and delivery be handled by the same component?
- Can different notification implementations be used interchangeably?
- Should a high-level business workflow know about provider SDKs?
- Does every caller need to know about every notification capability?

SOLID provides a set of lenses for answering these questions.

Each principle addresses a different problem:

| Principle | Primary design concern |
|---|---|
| SRP | Unrelated reasons for change within one module. |
| OCP | Repeated modification of stable code when supported variation grows. |
| LSP | Subtypes that violate the behavior expected by their consumers. |
| ISP | Interfaces that expose unnecessary operations to consumers. |
| DIP | High-level policy tied directly to low-level implementation details. |

The principles reinforce one another, but they are not interchangeable. A class can satisfy SRP while violating LSP, or use interfaces while still violating DIP.

The goal is not to maximize the number of interfaces or classes. The goal is to improve the system's ability to change safely and predictably.

---

## 3. S — Single Responsibility Principle (SRP)

### 3.1 Definition

The Single Responsibility Principle states that:

> A module should have one reason to change.

The phrase "one reason to change" is more useful than the simplified interpretation that a class should do only one thing.

A class may contain several related operations while still serving one coherent responsibility. Conversely, a class with only a few methods may have multiple responsibilities if those methods serve unrelated stakeholders or change for different reasons.

The key question is whether the module represents one coherent area of responsibility.

### 3.2 The problem: unrelated reasons to change

Consider this example:

```python
class InvoiceService:
    def calculate_total(self, items) -> float:
        return sum(
            item["price"] * item["quantity"]
            for item in items
        )

    def generate_html(self, invoice) -> str:
        return f"<h1>Invoice {invoice['id']}</h1>"

    def save_invoice(self, invoice, database) -> None:
        database.save(invoice)

    def send_invoice_email(self, invoice, email_client) -> None:
        email_client.send(
            invoice["customer_email"],
            self.generate_html(invoice),
        )
```

This class combines several responsibilities:

- Invoice calculation.
- HTML presentation.
- Persistence.
- Email delivery.

These responsibilities may change for different reasons:

- A business-rule change may affect invoice calculations.
- A frontend or document-format change may affect HTML generation.
- A database migration may affect persistence.
- A provider replacement may affect email delivery.

When these concerns are mixed together, unrelated changes can require editing and retesting the same class.

### 3.3 A more focused design

One possible design separates the responsibilities:

```python
class InvoiceCalculator:
    def calculate_total(self, items) -> float:
        return sum(
            item["price"] * item["quantity"]
            for item in items
        )

class InvoiceRenderer:
    def render_html(self, invoice) -> str:
        return f"<h1>Invoice {invoice['id']}</h1>"

class InvoiceRepository:
    def save(self, invoice) -> None:
        # Database-specific persistence belongs here.
        pass

class InvoiceEmailSender:
    def send(self, invoice, html: str) -> None:
        # Email-provider integration belongs here.
        pass
```

Each component has a clearer responsibility.

The example illustrates responsibility boundaries, not a complete implementation. The placeholder repository and email sender require real implementations, and production invoice generation must define formatting, validation, persistence, and delivery behavior explicitly.

### 3.4 SRP does not mean one method per class

This class can still have a coherent responsibility:

```python
class InvoiceCalculator:
    def calculate_subtotal(self, items) -> float:
        return sum(
            item["price"] * item["quantity"]
            for item in items
        )

    def calculate_discount(
        self,
        subtotal: float,
        discount_rate: float,
    ) -> float:
        return subtotal * discount_rate

    def calculate_tax(
        self,
        taxable_amount: float,
        tax_rate: float,
    ) -> float:
        return taxable_amount * tax_rate
```

The methods contribute to invoice calculation. Having multiple related methods does not automatically violate SRP.

The design should be evaluated by responsibility and change patterns, not method count.

### 3.5 Identifying a reason to change

A useful technique is to identify the stakeholders or policies that influence a module.

For example, an invoice module might be affected by:

- Finance, which changes tax and discount rules.
- The presentation team, which changes document formatting.
- The platform team, which changes database infrastructure.

If these groups repeatedly need to change unrelated parts of the same module, its responsibilities may be too broad.

This is a diagnostic signal rather than an automatic instruction to create three classes. Some responsibilities may be closely related and should remain together.

### 3.6 When SRP helps

SRP is especially useful when:

- A module accumulates unrelated business and infrastructure operations.
- Changes repeatedly affect unrelated functionality.
- Unit tests require extensive setup for unrelated dependencies.
- Ownership of a component is unclear.
- A component has become difficult to understand because its purpose is ambiguous.

### 3.7 Common SRP mistakes

**Mistake: splitting every method into its own class.**

This can create excessive indirection and make simple behavior harder to follow.

**Mistake: treating every technical activity as a separate responsibility.**

A class may legitimately perform several operations that collectively implement one coherent business capability.

**Mistake: using file size as the only signal.**

A large module may be cohesive, while a small module may combine unrelated policies.

**Engineering question:** Which stakeholder, policy, or kind of change would require this module to change, and do those reasons belong together?

---

## 4. O — Open/Closed Principle (OCP)

### 4.1 Definition

The Open/Closed Principle states that:

> Software entities should be open for extension but closed for modification.

This does not mean existing code must never change. Defects must be fixed, requirements evolve, and abstractions sometimes need redesign.

The principle encourages designs in which supported variations can be introduced without repeatedly modifying stable code paths.

The key word is *appropriate*. Not every possible future behavior should be anticipated.

### 4.2 The problem: growing conditional logic

Suppose a payment service supports different payment methods:

```python
class PaymentProcessor:
    def pay(self, method: str, amount: float) -> None:
        if method == "card":
            print(f"Charging card: {amount}")
        elif method == "bank_transfer":
            print(f"Initiating transfer: {amount}")
        elif method == "wallet":
            print(f"Charging wallet: {amount}")
        else:
            raise ValueError("Unsupported payment method")
```

Every new payment method requires modification of the same conditional structure.

As the number of methods grows, the processor can become increasingly difficult to review and test. Changes to one method may accidentally affect another.

However, a conditional is not inherently a design defect. If the set of supported cases is small and stable, a straightforward conditional may be the simplest adequate solution.

The problem emerges when supported variation grows and the design makes every extension unnecessarily invasive.

### 4.3 Use a stable behavior contract

One alternative is to define a payment-method interface:

```python
from typing import Protocol

class PaymentMethod(Protocol):
    def pay(self, amount: float) -> None:
        ...
```

Concrete implementations provide the behavior:

```python
class CardPayment:
    def pay(self, amount: float) -> None:
        print(f"Charging card: {amount}")

class BankTransferPayment:
    def pay(self, amount: float) -> None:
        print(f"Initiating transfer: {amount}")

class WalletPayment:
    def pay(self, amount: float) -> None:
        print(f"Charging wallet: {amount}")
```

The processor can delegate to the selected implementation:

```python
class PaymentProcessor:
    def process(
        self,
        payment_method: PaymentMethod,
        amount: float,
    ) -> None:
        if amount <= 0:
            raise ValueError("Amount must be positive")

        payment_method.pay(amount)
```

A new payment implementation can be introduced without adding another branch to `PaymentProcessor`, provided it satisfies the existing contract and the surrounding system can select it.

These examples illustrate design structure. Real payment processing requires appropriate currency handling, authorization, idempotency, error semantics, reconciliation, and security controls.

### 4.4 What remains open for modification?

The processor is not permanently frozen. If the business later requires fraud checks, new authorization rules, or different transaction semantics, its design may need to change.

OCP does not promise that a well-designed component will never change. It aims to isolate likely and supported variations so that extensions do not repeatedly destabilize existing behavior.

### 4.5 Do not build speculative extension frameworks

Consider a system that currently supports one payment method and has no credible plan to add another.

Introducing plugin discovery, dynamic loading, configuration-driven behavior, and a generic extension registry may add unnecessary complexity.

OCP must be considered alongside the general design principles from Chapter 02, especially KISS and YAGNI.

A useful decision process is:

1. Identify a real or credible source of variation.
2. Determine which component currently absorbs the changes.
3. Define a stable contract only if it provides meaningful value.
4. Introduce the smallest extension mechanism that satisfies the requirement.
5. Verify that existing behavior remains correct.

### 4.6 When OCP helps

OCP is particularly useful when:

- New implementations are expected to be added regularly.
- Existing behavior is stable and well-tested.
- Several implementations must satisfy a common contract.
- Adding a new variation repeatedly changes the same central component.
- Extension points have a clear business or technical justification.

**Engineering question:** Which parts of this system are expected to vary, and can that variation be introduced without unnecessarily modifying stable behavior?

---

## 5. L — Liskov Substitution Principle (LSP)

### 5.1 Definition

The Liskov Substitution Principle states that:

> Objects of a subtype should be usable wherever objects of the base type are expected without violating the correctness of the program.

LSP concerns behavioral compatibility, not merely whether a subclass implements the required method names.

A subtype must honor the expectations that consumers reasonably rely on when using the parent type or contract.

### 5.2 The problem: inheritance without behavioral compatibility

Consider a basic storage abstraction:

```python
class WritableStore:
    def write(self, key: str, value: str) -> None:
        raise NotImplementedError

    def read(self, key: str) -> str:
        raise NotImplementedError
```

Suppose a subclass implements reads but rejects writes:

```python
class ReadOnlyStore(WritableStore):
    def write(self, key: str, value: str) -> None:
        raise NotImplementedError(
            "This store does not support writes"
        )

    def read(self, key: str) -> str:
        return "stored value"
```

A consumer that receives a `WritableStore` reasonably expects both reading and writing to work according to the contract.

Passing `ReadOnlyStore` into that consumer violates the expectation of writability.

The issue is not that read-only storage is inherently bad. The issue is that a read-only implementation is being represented as a subtype of a contract that promises write capability.

### 5.3 Define contracts around actual capabilities

One alternative is to separate the capabilities:

```python
from typing import Protocol

class ReadableStore(Protocol):
    def read(self, key: str) -> str:
        ...

class WritableStore(ReadableStore, Protocol):
    def write(self, key: str, value: str) -> None:
        ...
```

Now a read-only store can implement `ReadableStore`, while a writable store implements both capabilities.

Consumers that only need reads can accept `ReadableStore`. Consumers that need writes can require `WritableStore`.

The important improvement is that the contracts express the behavior each consumer requires.

### 5.4 Behavioral contracts matter more than method signatures

Even when two implementations expose the same methods, they may not be behaviorally substitutable.

Suppose a repository contract promises that `save()` persists an entity and that a successful return means the write is durable according to the documented storage guarantees.

One implementation returns only after the write is committed. Another returns immediately after placing the request in an in-memory queue, with no guarantee of eventual persistence.

Both implementations may have the same method signature, but they provide different guarantees.

Whether they are substitutable depends on the contract. If consumers require durable persistence, the queued implementation cannot replace the original without changing the meaning of the operation or providing additional guarantees.

LSP therefore requires attention to:

- Preconditions.
- Postconditions.
- Invariants.
- Error behavior.
- Side effects.
- Observable timing and consistency guarantees where relevant.

### 5.5 Preconditions and postconditions

A useful way to reason about behavioral substitutability is to compare contracts.

A subtype should not unexpectedly require stronger preconditions than the type it replaces. It should preserve the promised postconditions and invariants.

For example, suppose a base contract allows any positive amount:

```python
class DiscountPolicy:
    def calculate(self, amount: float) -> float:
        raise NotImplementedError
```

A subtype that rejects amounts below 100 introduces an additional restriction:

```python
class PremiumDiscountPolicy(DiscountPolicy):
    def calculate(self, amount: float) -> float:
        if amount < 100:
            raise ValueError("Amount must be at least 100")

        return amount * 0.10
```

If consumers rely on the base contract accepting all positive amounts, the subtype is not a valid replacement.

A subtype can have different internal logic or stronger guarantees, but it should not violate the behavioral expectations established by its contract.

### 5.6 LSP does not prohibit different implementations

Different implementations can behave differently internally while still satisfying the same contract.

For example, two storage implementations may use different databases and have different performance characteristics, while both guarantee the required read and write semantics.

The important distinction is between permitted implementation variation and a violation of the behavior consumers depend on.

Performance, ordering, durability, and consistency can themselves be part of a contract when consumers rely on them.

### 5.7 When LSP helps

LSP is especially useful when:

- Designing class hierarchies.
- Defining interfaces with multiple implementations.
- Replacing one provider or storage implementation with another.
- Creating test doubles for real dependencies.
- Reviewing subclasses that override inherited behavior.
- Investigating runtime failures that occur only for certain implementations.

**Engineering question:** Can every valid consumer of this contract use the proposed implementation without encountering behavior that violates the contract?

---

## 6. I — Interface Segregation Principle (ISP)

### 6.1 Definition

The Interface Segregation Principle states that:

> Clients should not be forced to depend on interfaces they do not use.

An interface should expose the capabilities relevant to its consumers. A large interface that combines unrelated operations can force implementations and clients to depend on behavior that is unnecessary for their use case.

ISP is not a rule that every method requires its own interface. The goal is to align interfaces with meaningful consumer needs.

### 6.2 The problem: a broad interface

Consider this interface:

```python
from typing import Protocol

class Machine(Protocol):
    def print_document(self, document: str) -> None:
        ...

    def scan_document(self) -> str:
        ...

    def fax_document(self, document: str) -> None:
        ...
```

A basic printer may support printing but not scanning or faxing.

If every implementation must satisfy the entire interface, a basic printer may need to provide unsupported methods or raise exceptions for operations it cannot perform.

This creates a misleading contract.

### 6.3 Split interfaces by capability

A more focused design separates the capabilities:

```python
class Printer(Protocol):
    def print_document(self, document: str) -> None:
        ...

class Scanner(Protocol):
    def scan_document(self) -> str:
        ...

class FaxMachine(Protocol):
    def fax_document(self, document: str) -> None:
        ...
```

A simple printer can implement only `Printer`. A multifunction device can implement all three capabilities.

Consumers can depend on the smallest capability they actually need.

For example:

```python
def print_report(
    printer: Printer,
    report: str,
) -> None:
    printer.print_document(report)
```

The function does not need to know whether the supplied device also supports scanning or faxing.

### 6.4 ISP reduces unnecessary dependencies

Suppose a client depends on a broad interface containing ten operations but uses only one. Changes to unrelated operations can force unnecessary updates or compatibility work.

A narrower interface can reduce the scope of dependency.

This can improve:

- Clarity of contracts.
- Implementation flexibility.
- Testability.
- Compatibility when capabilities evolve.
- Separation between consumers with different requirements.

### 6.5 Avoid excessive interface fragmentation

A component with three tightly related methods does not necessarily need three separate interfaces.

Over-fragmentation can make it harder to understand a capability because consumers must navigate many tiny contracts.

The correct boundary depends on which operations consumers need and whether those operations form a meaningful capability.

For example, a transactional repository may need `begin`, `commit`, and `rollback` to represent one coherent transaction contract. Splitting them without considering their required relationship could make the contract less useful.

### 6.6 When ISP helps

ISP is particularly useful when:

- Implementations support different subsets of a capability.
- Consumers use only small parts of a large interface.
- Changes to unrelated interface methods frequently affect consumers.
- Implementations contain methods that always raise unsupported-operation errors.
- Tests require unnecessary methods or dependencies to satisfy a contract.

**Engineering question:** Which capabilities does this consumer actually need, and can the contract express those capabilities without imposing unrelated obligations?

---

## 7. D — Dependency Inversion Principle (DIP)

### 7.1 Definition

The Dependency Inversion Principle states that:

> High-level modules should not depend directly on low-level modules. Both should depend on abstractions. Abstractions should not depend on details; details should depend on abstractions.

A high-level module contains policy or orchestration, such as a business workflow. A low-level module implements technical details, such as database access, file storage, or communication with an external provider.

DIP aims to prevent important business behavior from becoming unnecessarily tied to a particular implementation technology.

### 7.2 The problem: business policy depends on implementation details

Consider a reporting service:

```python
class SQLReportRepository:
    def fetch_report_data(self):
        # Database-specific query.
        return []

class ReportService:
    def __init__(self):
        self.repository = SQLReportRepository()

    def generate_report(self):
        data = self.repository.fetch_report_data()
        return data
```

`ReportService` constructs a concrete SQL repository directly.

This creates a dependency from the high-level reporting workflow to the specific persistence implementation.

If the service later needs data from another source, tests may require a real database, or the persistence implementation changes, the reporting service may need modification.

The issue is not that SQL is a poor technology. The issue is that the high-level workflow has taken responsibility for selecting a particular low-level implementation.

### 7.3 Make the dependency point toward an abstraction

Define the capability required by the reporting service:

```python
from typing import Protocol

class ReportRepository(Protocol):
    def fetch_report_data(self) -> list[dict]:
        ...
```

The high-level service depends on that contract:

```python
class ReportService:
    def __init__(self, repository: ReportRepository):
        self.repository = repository

    def generate_report(self) -> list[dict]:
        return self.repository.fetch_report_data()
```

The concrete implementation satisfies the contract:

```python
class SQLReportRepository:
    def fetch_report_data(self) -> list[dict]:
        # Database-specific query belongs here.
        return []
```

The composition code supplies the implementation:

```python
repository = SQLReportRepository()
report_service = ReportService(repository)
```

The example is deliberately simplified. A production reporting service may need richer data models, error semantics, pagination, transaction guarantees, and a separate reporting transformation stage.

The key structural change is that `ReportService` depends on the required capability rather than constructing the database implementation itself.

### 7.4 Why is it called dependency inversion?

In a conventional arrangement, high-level business code directly depends on low-level implementation details.

DIP changes the relationship: both depend on an abstraction that represents the capability the high-level policy requires.

Conceptually:

```text
Conventional dependency

Report Service
      |
      v
SQL Repository
      |
      v
Database Driver
```

```text
Dependency inversion

Report Service
      |
      v
Report Repository Contract
      ^
      |
SQL Repository Implementation
      |
      v
Database Driver
```

The concrete repository implements the contract expected by the high-level service.

The runtime interaction still flows from the service to the repository when data is requested. What changes is the source-code dependency relationship: the service does not need to depend directly on the SQL implementation.

This distinction between runtime calls and source-code dependencies is important.

### 7.5 DIP is not the same as dependency injection

These concepts are closely related but different.

- **Dependency Inversion Principle** is a design principle concerning the direction of dependencies.
- **Dependency injection** is a technique for supplying dependencies to a component rather than having the component construct them internally.

A system can use dependency injection without achieving meaningful dependency inversion. For example, injecting a concrete SQL repository into a service may improve construction and testing while the service remains coupled to that concrete type.

Likewise, a system can express an abstraction and dependency direction without using a sophisticated dependency injection framework.

The detailed treatment of dependency construction, injection methods, lifecycle, and container trade-offs belongs in [06-Dependency-Injection.md](06-Dependency-Injection.md).

### 7.6 Abstractions should represent real needs

DIP does not require every class to have an interface.

An abstraction is useful when it represents a meaningful capability, isolates a dependency that needs to vary, or protects high-level policy from low-level implementation details.

Creating interfaces for every class can introduce unnecessary indirection and maintenance work.

For example, a small pure calculation function may not need an interface if there is no meaningful implementation variation or boundary to protect.

### 7.7 When DIP helps

DIP is particularly useful when:

- Business logic depends directly on infrastructure libraries.
- External implementations may change.
- Tests need to exercise business behavior without requiring production infrastructure.
- Multiple implementations must satisfy a stable capability contract.
- The system needs clear separation between policy and technical mechanisms.

**Engineering question:** Does the business workflow depend on the capability it needs, or does it depend unnecessarily on a specific technology that provides that capability?

---

## 8. How the Five Principles Work Together

The five principles address different design risks. Their combined value becomes clearer when applied to a single scenario.

Consider a document-processing application that:

1. Receives uploaded documents.
2. Extracts text.
3. Classifies document types.
4. Stores the results.
5. Sends notifications.

The initial implementation puts all five operations into one class and directly constructs a specific database client and external classification SDK.

As requirements grow, the team wants to add another classification implementation and support storage in a different environment.

The SOLID principles provide different questions to investigate.

| Principle | Question for the document-processing system |
|---|---|
| SRP | Are text extraction, classification, storage, and notification separate responsibilities with different reasons to change? |
| OCP | Can a new classification implementation be added without repeatedly modifying stable workflow logic? |
| LSP | Does each classification implementation satisfy the behavior expected by the classification contract? |
| ISP | Does a consumer that only needs classification depend on unrelated storage or notification operations? |
| DIP | Does the processing workflow depend on required capabilities or directly on concrete infrastructure libraries? |

These principles reinforce one another.

Separating responsibilities can clarify the interfaces needed by consumers. Focused interfaces can make it easier to introduce implementations. Behavioral contracts allow those implementations to be substituted safely. Dependency inversion can prevent the workflow from being tied to specific technologies.

However, applying all five principles mechanically can also produce an excessive number of interfaces and tiny classes.

A practical approach is to start with an observed design problem, identify the relevant principle, and introduce only the changes needed to address that problem.

---

## 9. Common Misconceptions

### 9.1 SOLID means creating an interface for every class

Incorrect.

Interfaces are useful when they express meaningful capabilities, stabilize important boundaries, or support legitimate implementation variation. Unnecessary interfaces add indirection without necessarily improving design.

### 9.2 SRP means every class must do exactly one thing

Incorrect.

The principle concerns one coherent responsibility or reason to change, not a literal limit of one method or operation.

### 9.3 OCP means existing code must never change

Incorrect.

Defects, new constraints, and changed requirements can justify modifying existing code. OCP encourages isolating expected variation, not freezing software permanently.

### 9.4 LSP means a subclass only needs to implement the same methods

Incorrect.

Method signatures are not sufficient. The implementation must preserve the behavior, guarantees, and constraints expected by consumers.

### 9.5 ISP means every interface should be tiny

Incorrect.

An interface should be as focused as its consumers and use cases require. Splitting a coherent contract into numerous tiny interfaces can make the system harder to understand.

### 9.6 DIP means using dependency injection everywhere

Incorrect.

DIP concerns dependency direction. Dependency injection is one technique for managing dependency construction and supply.

### 9.7 SOLID automatically makes software better

Incorrect.

A design can follow SOLID terminology and still be unnecessarily complicated, poorly tested, or inappropriate for its requirements.

The principles are useful only when they improve the system's actual behavior, changeability, and maintainability.

---

## 10. A Practical SOLID Review Workflow

Use this workflow when reviewing an existing class or module.

### Step 1: Identify the problem

Start with a concrete observation:

- Changes repeatedly affect unrelated behavior.
- Adding a feature requires editing many conditional branches.
- An implementation cannot safely replace another.
- Consumers depend on operations they do not need.
- Business logic constructs or depends directly on infrastructure.

Avoid starting with the assumption that every class must be redesigned.

### Step 2: Map the responsibilities and dependencies

Identify:

- What the component is responsible for.
- Which stakeholders or policies cause it to change.
- Which components it depends on.
- Which components depend on it.
- Which implementation details are exposed to consumers.

### Step 3: Identify the relevant principle

Use the principle that addresses the actual problem:

- Multiple unrelated reasons to change: investigate SRP.
- Repeated modification for expected extensions: investigate OCP.
- Behaviorally incompatible implementations: investigate LSP.
- Consumers forced to depend on irrelevant operations: investigate ISP.
- High-level policy tied to concrete implementation details: investigate DIP.

More than one principle may apply, but do not assume every problem requires all five.

### Step 4: Compare alternatives

For each proposed change, ask:

- What does this make easier?
- What additional complexity does it introduce?
- Does it address a real requirement?
- Could a simpler change solve the same problem?
- What behavior or contract might change?
- What new failure modes or dependencies are introduced?

### Step 5: Refactor incrementally

Prefer small changes that can be validated. Avoid combining unrelated structural changes in one large refactoring when smaller steps would provide clearer evidence.

### Step 6: Validate the result

Use appropriate tests to verify:

- Existing behavior remains correct.
- New implementations satisfy their contracts.
- Error behavior remains explicit.
- Relevant dependencies can be replaced as intended.
- The new structure actually reduces the original design problem.

### Step 7: Reassess

A design is not successful merely because it uses interfaces or follows a familiar pattern.

Evaluate whether the change reduced the cost or risk of the real engineering task.

---

## 11. Practical Engineering Exercise

### Scenario: a growing matchmaking application

An application has a `MatchmakingService` that:

- Retrieves candidate profiles directly from PostgreSQL.
- Calculates compatibility scores.
- Calls an external embedding service.
- Applies eligibility rules.
- Sends notifications to matched users.

The service has grown to more than 800 lines. Adding a new scoring strategy requires modifying several conditional branches. Unit tests need database setup, and one scoring implementation raises an exception for certain profile types that other implementations support.

The team wants to add a second embedding provider and improve testability.

### Task 1: Diagnose the design

For each SOLID principle, explain whether the scenario provides evidence of a potential problem.

Do not assume that every principle is violated merely because the class is large.

Identify the specific behavior or dependency that supports each conclusion.

### Task 2: Propose a design

Describe how you would organize the following capabilities:

- Candidate retrieval.
- Compatibility scoring.
- Embedding generation.
- Eligibility evaluation.
- Notification delivery.

Explain which responsibilities you would separate and which should remain together.

### Task 3: Define contracts

Choose one capability, such as compatibility scoring, and define a contract.

Specify:

- Inputs and outputs.
- Valid input assumptions.
- Error behavior.
- Expected behavior for unsupported or incomplete profile data.
- Guarantees that every implementation must preserve.

### Task 4: Evaluate extension

Explain how a second embedding provider could be introduced without unnecessarily modifying the matchmaking workflow.

Identify the changes that would still legitimately be required.

### Task 5: Plan validation

Describe the tests needed to establish that:

- Existing scoring behavior is preserved.
- Alternative scoring implementations satisfy the same contract.
- Provider failures are handled correctly.
- Business eligibility rules remain enforced.
- The new design improves testability without introducing excessive complexity.

Your solution should demonstrate engineering judgment. It should not simply create one interface and one class for every noun in the scenario.

---

## 12. Knowledge Connections

SOLID connects directly to several concepts in ENG-03.

| Topic | Connection |
|---|---|
| Software quality attributes | SOLID can support maintainability and testability when applied appropriately. |
| Software design principles | DRY, KISS, and YAGNI help evaluate whether a SOLID-based abstraction is justified. |
| Separation of concerns and abstraction | Establishes the conceptual foundations for responsibility boundaries and contracts. |
| Coupling and cohesion | Provides a way to evaluate whether SOLID changes improve component relationships and internal focus. |
| Dependency injection | Develops the technique for supplying dependencies to components. |
| Layered and clean architecture | Applies dependency inversion and responsibility separation across system boundaries. |
| Design patterns | Provides recurring implementations of selected design ideas, with their own costs and trade-offs. |
| Refactoring | Provides techniques for introducing design improvements while preserving required behavior. |

This chapter is the primary location for the five SOLID definitions and their introductory examples. Later chapters should build on these principles without repeating their full explanations.

---

## 13. Chapter Summary

SOLID provides five complementary principles for managing software responsibilities, variation, behavior, interfaces, and dependencies.

- **SRP:** Keep a module focused on one coherent responsibility and reason to change.
- **OCP:** Support justified extensions without repeatedly destabilizing stable code.
- **LSP:** Ensure implementations preserve the behavioral contracts expected by consumers.
- **ISP:** Give consumers focused interfaces that expose the capabilities they need.
- **DIP:** Keep high-level policy from depending unnecessarily on low-level implementation details.

The principles are related but distinct. A design may need one principle more than another, and not every class needs an interface or multiple implementations.

The most important lessons are:

1. Start with a concrete engineering problem, not a desire to apply SOLID everywhere.
2. Identify responsibilities, change patterns, and dependency relationships before refactoring.
3. Define behavioral contracts, not just method signatures.
4. Introduce abstractions when they protect meaningful boundaries.
5. Evaluate the complexity and maintenance cost of every proposed design change.
6. Validate improvements through tests and evidence.
7. Treat SOLID as a set of reasoning tools rather than a rigid template.

A strong engineer does not merely recognize SOLID violations. They can explain the practical consequences of a design, compare alternatives, justify a change, and determine whether the resulting system is genuinely better.

---

## 14. Revision Checklist

Before moving to the next chapter, confirm that you can:

- [ ] Explain the purpose of all five SOLID principles.
- [ ] Identify SRP problems without treating method count as the deciding factor.
- [ ] Explain how OCP supports expected extension without prohibiting all modification.
- [ ] Identify an LSP violation caused by incompatible behavioral guarantees.
- [ ] Explain why matching method signatures does not guarantee substitutability.
- [ ] Design focused interfaces for consumers with different capability requirements.
- [ ] Explain the distinction between DIP and dependency injection.
- [ ] Identify when an abstraction would introduce unnecessary complexity.
- [ ] Apply multiple SOLID principles to one realistic system.
- [ ] Describe how to validate a SOLID-oriented refactoring.
- [ ] Defend a design choice while acknowledging its limitations and trade-offs.

### Teaching check

Without referring to the chapter, explain this design review scenario:

A class handles order pricing, database persistence, email delivery, and audit logging. It selects behavior using a large conditional statement, depends directly on a concrete database client, and accepts an interface with several methods that it never uses. One replacement implementation also violates a behavior that callers rely on.

Explain:

1. Which SOLID principles are relevant, and why?
2. Which problem would you address first?
3. What changes would you make to the responsibilities and contracts?
4. How would you establish behavioral substitutability?
5. Which abstractions would you introduce, and which would you avoid?
6. How would you verify that the refactoring improves the design rather than merely adding more classes?

A strong answer should connect each principle to a specific design risk, prioritize changes sensibly, and explain the trade-offs of the proposed solution.

---

## 15. Further Reading Within This Module

Continue in the approved chapter order:

1. [06 — Dependency Injection](06-Dependency-Injection.md)
2. [07 — Layered and Clean Architecture](07-Layered-and-Clean-Architecture.md)
3. [08 — Design Patterns](./08-Design-Patterns.md)

For the complete module structure and learning path, see [README.md](README.md).

---

*End of Chapter 05 — SOLID Principles.*
