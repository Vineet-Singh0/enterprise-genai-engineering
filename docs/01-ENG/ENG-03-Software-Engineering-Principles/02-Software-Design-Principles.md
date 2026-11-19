# Software Design Principles

## 1. Overview

Software design is the process of deciding how software should be organized, how its responsibilities should be distributed, how its components should interact, and how the system should accommodate change.

A program can produce correct results and still be difficult to understand, modify, test, or operate. As requirements evolve, design decisions that initially appear convenient can create unnecessary complexity and increase the cost of future development.

**Software design principles provide general guidance for making these decisions.** They help engineers evaluate alternative designs, recognize unnecessary complexity, and avoid creating structures that make change unnecessarily expensive.

These principles are not rigid laws or recipes that automatically produce good software. They are reasoning tools. Their value depends on the problem, the context, and the consequences of applying them.

### What this chapter covers

- The purpose of software design principles.
- DRY, KISS, and YAGNI.
- Composition over inheritance.
- The Law of Demeter.
- Designing for change without overengineering.
- Practical methods for evaluating design alternatives.
- Common mistakes caused by applying principles mechanically.

### What this chapter does not cover

This chapter establishes general design guidance. Detailed treatment of related concepts belongs in their designated chapters:

- Quality attributes — [01-Software Quality Attributes](01-Software-Quality-Attributes.md)
- Separation of concerns and abstraction — [03-Separation of Concerns and Abstraction](03-Separation-of-Concerns-and-Abstraction.md)
- Coupling and cohesion — [04-Coupling and Cohesion](04-Coupling-and-Cohesion.md)
- SOLID principles — [05-SOLID Principles](05-SOLID-Principles.md)
- Dependency injection — [06-Dependency Injection](06-Dependency-Injection.md)
- Layered and clean architecture — [07-Layered and Clean Architecture](07-Layered-and-Clean-Architecture.md)
- Design patterns — [08-Design Patterns](08-Design-Patterns/README.md)
- Refactoring — [09-Refactoring](09-Refactoring.md)
- Technical debt — [10-Technical Debt](10-Technical-Debt.md)

---

## 2. Why Software Design Principles Matter

Consider a service that generates notifications.

Its first version supports email notifications. Later, the product requires SMS notifications, followed by push notifications.

Several implementation approaches are possible:

- Add each new notification type directly to an existing function.
- Duplicate the existing email logic and modify each copy.
- Introduce a large framework before the need for additional notification types is understood.
- Choose a design that supports the known requirements while leaving reasonable room for likely extensions.

Each approach can work initially, but the long-term costs differ.

The first approach may become difficult to modify as conditions accumulate. The second can produce inconsistent behavior across duplicated implementations. The third introduces complexity before its value is established. The fourth requires judgment about how much flexibility is justified.

Design principles help engineers reason through these choices.

They encourage questions such as:

- Is this complexity necessary?
- Are we maintaining the same business rule in multiple places?
- Are we solving a requirement that actually exists?
- Does this design make common changes unnecessarily difficult?
- Is this abstraction justified by real variation?
- Are we introducing flexibility that creates more problems than it solves?

The goal is not to produce the most sophisticated design. It is to produce a design whose complexity is justified by the problem it solves.

---

## 3. DRY — Don't Repeat Yourself

**DRY means that each important piece of knowledge should have a single authoritative representation within the relevant system boundary.**

The principle is frequently interpreted as "never write the same code twice." That interpretation is incomplete.

The original idea concerns duplicated knowledge, not merely repeated lines of code.

Two pieces of code may look similar but represent different business rules. Conversely, a single business rule can be duplicated across several files even when the implementations look different.

The engineering question is whether multiple places independently encode the same knowledge and can therefore drift apart.

### 3.1 The problem: duplicated business rules

Suppose an application calculates a delivery fee in two places.

```python
def calculate_checkout_fee(order_total: float) -> float:
    if order_total >= 1000:
        return 0.0
    return 50.0


def calculate_invoice_fee(order_total: float) -> float:
    if order_total >= 1000:
        return 0.0
    return 50.0
```

Both functions currently implement the same rule.

Now suppose the business changes the free-delivery threshold from 1,000 to 1,500. If only one function is updated, checkout and invoicing may disagree.

The problem is not simply duplicated code. It is duplicated business knowledge that must remain consistent.

A possible improvement is to represent the rule in one authoritative location:

```python
FREE_DELIVERY_THRESHOLD = 1500
STANDARD_DELIVERY_FEE = 50.0


def calculate_delivery_fee(order_total: float) -> float:
    if order_total >= FREE_DELIVERY_THRESHOLD:
        return 0.0

    return STANDARD_DELIVERY_FEE
```

Both checkout and invoicing can use the same calculation.

This example is intentionally small. In a production system, the rule may also depend on currency, region, delivery method, promotions, or effective dates. The appropriate representation should reflect the actual business rule.

### 3.2 Different code does not always mean duplicated knowledge

Consider two operations that happen to contain similar validation:

- A customer can cancel an order within a specified period.
- An administrator can cancel an order under a different policy.

The implementations may initially look alike, but their business meaning and future change patterns may differ.

Combining them into one generalized function could introduce complex flags and conditional branches. It could also make a change to one policy accidentally affect the other.

Therefore, **do not eliminate duplication merely because code looks similar**.

First determine whether the duplicated parts represent the same stable rule.

### 3.3 Forms of duplication

Duplication can occur at several levels:

- **Code duplication:** The same implementation appears in multiple places.
- **Rule duplication:** The same business decision is independently encoded in multiple places.
- **Configuration duplication:** The same operational value is maintained in multiple configuration sources.
- **Knowledge duplication:** The same fact is represented independently in code, documentation, or data definitions and can become inconsistent.

Not every repeated value or statement is harmful. Some repetition is deliberate because different components have different responsibilities, ownership boundaries, or change requirements.

The concern is duplicated knowledge that creates inconsistency or unnecessary maintenance effort.

### 3.4 When DRY helps

DRY is especially useful when:

- Multiple operations must enforce the same business rule.
- A shared calculation has one clear meaning.
- A configuration value has one authoritative source.
- Repeated logic frequently requires synchronized changes.
- Fixing a defect in one place should fix the same defect everywhere.

### 3.5 When applying DRY can make things worse

Overzealous deduplication can create:

- General-purpose functions with many unrelated options.
- Abstractions that hide distinct business rules.
- Dependencies between components that should evolve independently.
- Difficult-to-understand shared utilities.
- A central module that becomes a bottleneck for unrelated changes.

A useful rule of thumb is:

> Share stable knowledge when it genuinely has one meaning. Keep independently evolving behavior separate when combining it would obscure its meaning or create unwanted dependencies.

**Engineering question:** If this rule changes tomorrow, should all these locations change together? If yes, investigate whether the rule should have one authoritative representation.

---

## 4. KISS — Keep It Simple, Stupid

**KISS encourages engineers to prefer the simplest design that adequately satisfies the requirements and relevant constraints.**

Simplicity does not mean writing the fewest lines of code. It means avoiding unnecessary concepts, indirection, configuration, and behavior while preserving correctness and required quality.

A compact implementation can be difficult to understand. A longer implementation can be simpler if it makes the behavior explicit.

### 4.1 Example: unnecessary abstraction

Suppose a service needs to format a username for display.

An unnecessarily elaborate implementation might introduce:

- A configurable formatting engine.
- A registry of formatting strategies.
- A plugin-loading mechanism.
- A hierarchy of formatter classes.
- A factory for selecting a formatter.

If the only requirement is to remove surrounding whitespace and normalize the display value, this infrastructure may cost more to understand and maintain than the operation itself.

A straightforward implementation might be sufficient:

```python
def format_username(username: str) -> str:
    return username.strip()
```

The simple version is not automatically correct for every application. Unicode handling, case normalization, validation, and product-specific rules may be necessary. Those requirements should be addressed explicitly rather than hidden behind an unnecessarily elaborate design.

### 4.2 Simplicity is relative to the problem

A simple solution for a prototype may not be sufficient for a payment system with strict audit and recovery requirements.

Likewise, a distributed architecture may be justified for a system with genuine independent scaling, isolation, or deployment needs, but unjustified for a small application that can be operated effectively as one service.

The correct question is not:

"Which design has the fewest components?"

It is:

"Which design satisfies the requirements with the least unnecessary complexity?"

### 4.3 Essential versus accidental complexity

It is useful to distinguish two broad categories.

**Essential complexity** comes from the problem itself.

Examples:

- Applying several business rules to an order.
- Maintaining consistency across related records.
- Handling concurrent updates correctly.
- Enforcing authorization for sensitive operations.

**Accidental complexity** is introduced by the chosen implementation without sufficient benefit.

Examples:

- Maintaining a custom framework when a simple library is sufficient.
- Adding multiple layers that merely forward calls.
- Supporting numerous configuration options that nobody needs.
- Maintaining parallel implementations of the same behavior unnecessarily.

Engineers cannot eliminate all essential complexity. They can, however, avoid adding accidental complexity without a justified reason.

### 4.4 How to evaluate simplicity

Ask:

1. Can a new team member understand the main execution path?
2. Does each component provide a clear benefit?
3. Is this abstraction needed by a current requirement?
4. Could a simpler implementation meet the same acceptance criteria?
5. Does removing a component reduce complexity, or merely move complexity somewhere less visible?
6. Are important failure cases still handled correctly?

### 4.5 When simplicity should not be confused with shortcuts

The simplest code that works for one demonstration is not necessarily the simplest responsible production solution.

Removing error handling, validation, security checks, or tests may reduce code volume while increasing the total risk and operational complexity of the system.

KISS does not justify ignoring requirements.

**Engineering question:** What is the smallest understandable design that satisfies the actual requirements, including important failure conditions?

---

## 5. YAGNI — You Aren't Gonna Need It

**YAGNI advises engineers not to implement speculative functionality before there is a justified need for it.**

Software requirements change, but not every possible future requirement will become real. Building features for hypothetical scenarios consumes implementation time, testing effort, documentation effort, and maintenance capacity.

YAGNI encourages engineers to distinguish between:

- A requirement that exists now.
- A likely change supported by credible evidence.
- A hypothetical possibility with no current justification.

### 5.1 Example: speculative payment support

Suppose an application currently accepts payments through one provider.

The team considers adding an abstraction that supports ten payment providers, configurable routing rules, dynamic provider discovery, and a plugin marketplace.

However, the product has no requirement for additional providers and no evidence that the extra infrastructure will be needed.

Building all of this now may delay the current release and introduce behavior that must be tested and maintained.

A more appropriate approach may be to implement the required provider cleanly while keeping the cost and consequences of a future change understood.

If the business later commits to multiple providers, the design can evolve based on actual requirements.

### 5.2 YAGNI is not a prohibition on planning

YAGNI does not mean ignoring foreseeable change or creating designs that are unnecessarily difficult to evolve.

It means that the cost of speculative implementation should be justified by credible need.

For example, a security requirement that is mandatory before launch must not be deferred because the feature is not yet visible to users. A documented regulatory obligation is not speculative functionality.

Similarly, an architectural decision that would be extremely expensive to reverse may deserve careful consideration before implementation, even if the full future feature set is unknown.

The distinction is between preparing responsibly for known constraints and implementing unvalidated functionality.

### 5.3 A practical decision test

Before building a generalized solution, ask:

- Which current requirement does this satisfy?
- What evidence supports the predicted future need?
- What is the cost of implementing it now?
- What is the likely cost of implementing it later?
- How reversible is the decision?
- Will this design introduce additional concepts or failure modes?

If the future requirement is uncertain and the cost of later change is manageable, delaying speculative functionality may be the better decision.

### 5.4 YAGNI and technical debt

Deferring unnecessary functionality is not automatically technical debt.

Technical debt becomes relevant when a known shortcut, limitation, or design compromise creates future costs or constraints.

For example, postponing a feature that has not been requested is different from knowingly shipping an implementation that violates a required data-integrity constraint.

See [10-Technical Debt](10-Technical-Debt.md) for the dedicated discussion of technical debt and its management.

**Engineering question:** Are we solving a demonstrated problem, or are we paying the cost of a future that may never arrive?

---

## 6. Composition Over Inheritance

**Composition over inheritance recommends considering object composition before using inheritance to reuse or organize behavior.**

Inheritance allows one class to derive behavior and characteristics from another class. Composition allows an object to collaborate with or contain other objects that provide required behavior.

Both are legitimate tools. The principle is not that inheritance is always wrong, but that inheritance should not be the default solution to every reuse problem.

### 6.1 Inheritance can create strong assumptions

Consider a notification system:

```python
class Notification:
    def send(self, message: str) -> None:
        raise NotImplementedError


class EmailNotification(Notification):
    def send(self, message: str) -> None:
        print(f"Sending email: {message}")


class SMSNotification(Notification):
    def send(self, message: str) -> None:
        print(f"Sending SMS: {message}")
```

This inheritance hierarchy can be reasonable if the derived types genuinely satisfy the behavioral contract represented by `Notification`.

However, inheritance becomes problematic when it is used only to share implementation or when derived classes cannot correctly support the assumptions made about their parent class.

A hierarchy can also become difficult to evolve if every new behavior requires adding more subclasses or modifying existing inheritance relationships.

### 6.2 Composition delegates behavior to collaborators

An alternative is to let a service receive a notification sender that performs the delivery:

```python
from typing import Protocol


class NotificationSender(Protocol):
    def send(self, message: str) -> None:
        ...


class EmailSender:
    def send(self, message: str) -> None:
        print(f"Sending email: {message}")


class SMSSender:
    def send(self, message: str) -> None:
        print(f"Sending SMS: {message}")


class NotificationService:
    def __init__(self, sender: NotificationSender) -> None:
        self.sender = sender

    def notify(self, message: str) -> None:
        self.sender.send(message)
```

The service delegates the delivery operation to a collaborator.

A caller can construct it with an email sender:

```python
service = NotificationService(EmailSender())
service.notify("Your profile has been updated.")
```

Or with an SMS sender:

```python
service = NotificationService(SMSSender())
service.notify("Your profile has been updated.")
```

This example uses Python's `Protocol` to describe the expected interface. It does not require a complex inheritance hierarchy for the sender implementations.

The example illustrates composition, but it is not a complete production notification system. Real implementations would need appropriate error handling, provider integration, delivery status, retry policies, and other requirements.

### 6.3 Benefits and costs of composition

Composition can make behavior easier to combine and replace. It can also allow a component to delegate responsibilities to independently developed implementations.

However, composition introduces relationships between collaborators. Excessive composition can create too many tiny objects, too much indirection, and difficulty tracing execution.

Inheritance can still be appropriate when a genuine behavioral subtype relationship exists and the inherited contract is stable and meaningful.

The decision should be based on semantics and change requirements, not on a universal preference for one language feature.

### 6.4 When to consider composition

Composition is often a strong candidate when:

- Behavior needs to be replaceable independently.
- A component combines several distinct capabilities.
- Inheritance would create a deep or fragile hierarchy.
- Different combinations of behavior are required.
- The relationship is "uses" or "has a capability" rather than "is a specialized form of."

Inheritance may be suitable when:

- The subtype genuinely satisfies the parent's behavioral contract.
- The shared contract has a clear meaning.
- Polymorphic use is valuable.
- The hierarchy does not introduce unreasonable constraints.

The detailed treatment of dependency management and object construction belongs in [06-Dependency-Injection.md](06-Dependency-Injection.md). This chapter establishes only the general design principle.

**Engineering question:** Is this relationship a genuine subtype relationship, or am I using inheritance merely to reuse code?

---

## 7. The Law of Demeter

The **Law of Demeter** is a design guideline that discourages a component from navigating through long chains of unrelated objects to perform an operation.

It is sometimes summarized as "only talk to your immediate friends." That phrase is a useful mnemonic, but the principle concerns controlling knowledge of internal object structures, not enforcing a literal restriction on every method call.

### 7.1 Example: navigating through object internals

Consider the following code:

```python
customer.order.shipping_address.city
```

The caller knows that:

- A customer has an order.
- The order has a shipping address.
- The address has a city.

This may be appropriate in some contexts. However, if many callers depend on this entire structure, changing the internal representation can require changes throughout the codebase.

For example, if shipping information later moves behind a delivery service or an order can contain multiple delivery destinations, the original navigation chain may no longer represent the correct behavior.

### 7.2 Ask the object that owns the behavior

If the actual requirement is to determine the city associated with the delivery destination for an order, the caller might instead use a behavior-oriented method:

```python
class Order:
    def __init__(self, shipping_address):
        self._shipping_address = shipping_address

    def get_delivery_city(self) -> str:
        return self._shipping_address.city
```

A caller can then use:

```python
city = order.get_delivery_city()
```

This can reduce the caller's knowledge of the order's internal structure.

However, adding a forwarding method for every nested property can create unnecessary wrappers. The method should represent meaningful behavior or a deliberate boundary, not merely conceal every dot in an expression.

### 7.3 When the principle helps

The Law of Demeter is useful when:

- Callers depend heavily on the internal structure of other components.
- Changes to an internal representation repeatedly affect unrelated code.
- A component is reaching through several objects to perform work that belongs elsewhere.
- The caller needs behavior rather than raw access to an object's internal collaborators.

It is less useful as a mechanical rule for rejecting every chained expression. A fluent API, a query builder, or a deliberate value-object structure may use chaining appropriately.

**Engineering question:** Does this caller need to know the internal object structure, or should it request a meaningful operation from the component responsible for that behavior?

The broader concepts of abstraction and information hiding are developed in [03-Separation-of-Concerns-and-Abstraction.md](03-Separation-of-Concerns-and-Abstraction.md).

---

## 8. Design for Change

Software evolves because business rules, user needs, dependencies, operating conditions, and external constraints evolve.

**Designing for change means making reasonable decisions about which parts of a system are likely to change and avoiding unnecessary barriers to those changes.**

It does not mean predicting every future requirement or making every component configurable.

### 8.1 Identify likely sources of change

Examples include:

- Business rules that change frequently.
- External providers that may be replaced.
- Configurable policies that vary by customer or region.
- Data formats controlled by external systems.
- Regulatory requirements that affect processing.
- Workloads that may grow significantly.
- Product capabilities that have a credible expansion plan.

The key is evidence. Change patterns may come from product roadmaps, known external dependencies, existing production incidents, or historical changes.

### 8.2 Make change costs visible

Suppose a product supports several matchmaking strategies. If the product team frequently changes how candidates are ranked, it may be valuable to keep the ranking policy easy to locate and test.

By contrast, if a behavior is stable, introducing a generalized extension framework solely because it might someday vary may add unnecessary complexity.

The design decision should reflect:

- The likelihood of change.
- The impact if the change occurs.
- The cost of adapting the current design.
- The cost of adding flexibility now.
- The risk of introducing additional behavior or indirection.

### 8.3 Prefer deliberate flexibility

Useful flexibility is targeted.

For example, a service may read a frequently changed business threshold from configuration rather than requiring a code release for every adjustment. This is justified when operational configuration is a real requirement.

But turning every constant, function, or behavior into a configurable option can make the system harder to understand and validate.

A useful design question is:

> Which decision is expected to vary, who owns that variation, and what is the simplest reliable way to support it?

### 8.4 Avoid speculative generalization

Designing for change and YAGNI are complementary:

- Designing for change recognizes credible variation and avoids unnecessary barriers.
- YAGNI discourages implementing speculative capabilities without sufficient justification.

A good engineer can prepare for known change without building a framework for every imaginable future.

The goal is a design that remains adaptable where adaptation has value while staying straightforward elsewhere.

---

## 9. Applying Design Principles Together

Individual principles can point in different directions.

For example:

- DRY may suggest consolidating duplicated logic.
- KISS may suggest avoiding a complex shared abstraction.
- YAGNI may suggest postponing generalized behavior.
- Designing for change may suggest isolating a likely point of variation.

These are not necessarily contradictions. They highlight different aspects of a decision.

Consider a service that calculates eligibility for a user benefit.

Initially, two workflows contain similar eligibility checks. The team expects eligibility rules to change because of a confirmed product roadmap.

A disciplined approach might be:

1. Determine whether both workflows implement the same business rule.
2. Identify whether the workflows have different policy or ownership requirements.
3. Consolidate the common rule if it has one authoritative meaning.
4. Avoid adding a configurable policy engine unless actual requirements justify it.
5. Keep the rule easy to test and modify.
6. Measure the impact of the change and verify that both workflows behave correctly.

The decision is not "DRY always wins" or "KISS always wins." The decision follows from the meaning of the rule, the likely changes, and the complexity of the alternatives.

### 9.1 A practical decision framework

For a proposed design, evaluate the following dimensions.

| Question | What it helps reveal |
|---|---|
| What current requirement does this design satisfy? | Whether the design has a justified purpose. |
| What knowledge or behavior is being represented? | Whether duplication is meaningful or harmful. |
| What is the simplest adequate alternative? | Whether the design introduces unnecessary complexity. |
| What future change is credible? | Whether flexibility has a real basis. |
| What assumptions does the design introduce? | Whether the design depends on fragile expectations. |
| What does this decision make easier or harder? | Its benefits and trade-offs. |
| How will the behavior be verified? | Whether correctness can be demonstrated. |
| What evidence would cause us to reconsider? | Whether the decision can be revisited rationally. |

Use this framework to reason about alternatives before committing to a design. It is not a scoring system in which the option with the most positive answers automatically wins.

---

## 10. Common Mistakes

### 10.1 Treating principles as absolute laws

A principle provides guidance, not an automatic answer. Context determines whether a proposed application is beneficial.

For example, DRY does not require combining two similar but independently evolving business rules into one abstraction.

### 10.2 Confusing fewer lines with simpler software

Short code can hide complex assumptions, side effects, or control flow. Simplicity should be judged by understandability, correctness, and the effort required to change the system.

### 10.3 Eliminating all duplication

Some repetition is intentional and appropriate. Sharing unrelated behavior can create dependencies and make changes more difficult.

### 10.4 Building for hypothetical requirements

Speculative frameworks and configuration systems can delay delivery and create maintenance costs before their benefits are known.

### 10.5 Rejecting inheritance in every situation

Inheritance remains useful when a genuine subtype relationship exists and the contract is appropriate. Composition is a preferred option to consider, not a universal replacement.

### 10.6 Applying the Law of Demeter mechanically

Not every chained call indicates poor design. Evaluate whether the caller is unnecessarily dependent on another component's internal structure.

### 10.7 Designing for every possible future

Unbounded flexibility creates more states, configuration options, and behaviors to understand and test. Focus on credible change, not every imaginable scenario.

### 10.8 Using design principles without validating outcomes

A design can appear elegant while failing real requirements. Validate important decisions with tests, representative workloads, and operational evidence as appropriate.

---

## 11. Practical Engineering Exercise

### Scenario: evolving a notification service

A service currently sends email notifications. The product team has confirmed that SMS support will be required in the next release. Push notifications are only a possible future idea, with no committed timeline.

The current implementation duplicates message formatting logic in two workflows. Each workflow also contains its own provider-specific delivery code.

Before implementing a solution, analyze the scenario.

#### Task 1: Identify the design concerns

Explain:

- Which duplication may represent duplicated knowledge.
- Which behavior might reasonably remain separate.
- Where additional flexibility is justified by the confirmed SMS requirement.
- Which proposed features would be speculative.

#### Task 2: Compare alternatives

Evaluate these approaches:

- Continue duplicating the existing implementation.
- Create a shared function for the common business rule and add SMS support directly.
- Introduce a notification interface with interchangeable sender implementations.
- Build a complete plugin framework for all possible notification channels.

For each option, discuss:

- Complexity.
- Ease of testing.
- Cost of adding SMS.
- Cost of future changes.
- Unnecessary assumptions or dependencies.

#### Task 3: Recommend a design

Select an approach and explain why it is appropriate for the stated requirements.

Your answer should not simply list principles. It should show how the principles lead to a decision.

#### Task 4: Define verification

Describe the tests you would use to verify:

- The shared business rule remains consistent.
- Email delivery behavior is preserved.
- SMS delivery is invoked correctly.
- A provider failure is handled according to the defined requirements.

Do not assume that a particular architecture is automatically correct. Justify the design in relation to the scenario.

---

## 12. Chapter Summary

Software design principles guide engineers toward designs that are understandable, adaptable, and appropriately simple.

The key principles covered in this chapter are:

1. **DRY:** Keep authoritative representations of the same knowledge consistent, without forcing unrelated behavior into one abstraction.
2. **KISS:** Prefer the simplest design that adequately satisfies the requirements and constraints.
3. **YAGNI:** Avoid implementing speculative functionality without a justified need.
4. **Composition over inheritance:** Consider assembling behavior through collaborators before relying on inheritance solely for reuse.
5. **Law of Demeter:** Avoid unnecessary dependence on the internal structures of other components.
6. **Design for change:** Accommodate credible variation without creating generalized flexibility for every hypothetical future.

These principles must be applied with judgment. They can reinforce one another, but they can also expose competing concerns.

The quality of a design is not determined by how many principles it appears to follow. It is determined by whether the resulting system meets its requirements with an appropriate balance of correctness, complexity, adaptability, and maintainability.

---

## 13. Revision Checklist

Before moving to the next chapter, confirm that you can:

- [ ] Explain why software design principles are guidance rather than absolute laws.
- [ ] Distinguish duplicated code from duplicated business knowledge.
- [ ] Explain why eliminating all duplication can create worse designs.
- [ ] Identify the difference between simplicity and merely having fewer lines of code.
- [ ] Explain why YAGNI does not mean ignoring known requirements or credible constraints.
- [ ] Compare composition and inheritance using the meaning of their relationships.
- [ ] Explain the Law of Demeter without treating every chained expression as a violation.
- [ ] Explain how designing for change differs from speculative generalization.
- [ ] Evaluate a design decision using requirements, alternatives, costs, and evidence.
- [ ] Defend a design choice while acknowledging its trade-offs.

### Teaching check

Without referring to the chapter, answer this question:

A developer introduces a generic rule engine to avoid three small pieces of similar code. The rule engine supports dozens of configuration options, although the application currently uses only three rules. A planned feature may introduce a fourth rule next quarter.

Explain whether you would keep, simplify, or replace this design. Discuss DRY, KISS, YAGNI, and designing for change in your reasoning.

A strong answer should distinguish shared knowledge from superficial similarity, evaluate the cost of the abstraction, and use the actual likelihood and cost of future change to justify the recommendation.

---

## 14. Further Reading Within This Module

Continue in the approved chapter order:

1. [03 — Separation of Concerns and Abstraction](03-Separation-of-Concerns-and-Abstraction.md)
2. [04 — Coupling and Cohesion](04-Coupling-and-Cohesion.md)
3. [05 — SOLID Principles](05-SOLID-Principles.md)

For the complete module structure, prerequisites, and learning path, see [README.md](README.md).

---

*End of Chapter 02 — Software Design Principles.*
