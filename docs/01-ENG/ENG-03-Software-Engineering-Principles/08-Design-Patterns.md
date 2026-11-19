# Design Patterns

## 1. Overview

Design patterns are reusable approaches to recurring software design problems.

As software systems grow, engineers repeatedly encounter challenges involving object creation, component composition, communication between objects, and changing behavior without destabilizing existing code.

Design patterns provide established ways to reason about these problems. They describe the structure of a solution, the responsibilities of its participants, and the trade-offs associated with applying it.

A design pattern is not a complete implementation that should be copied into every project. It is a design vocabulary that helps engineers recognize recurring problems and choose appropriate solutions.

This chapter group introduces the major categories of object-oriented design patterns and develops the judgment required to apply them responsibly.

## 2. Learning Objectives

After completing this chapter group, you should be able to:

- Explain what a design pattern is and which problems patterns address.
- Distinguish creational, structural, and behavioral patterns.
- Recognize recurring design problems and identify potentially suitable patterns.
- Explain the responsibilities and interactions of a pattern's participants.
- Implement representative patterns in Python.
- Evaluate the benefits, limitations, and complexity introduced by a pattern.
- Recognize when a straightforward implementation is better than a pattern.
- Explain pattern-related design decisions during code reviews and technical discussions.

## 3. Prerequisites

Complete the following ENG-03 chapters before studying design patterns:

- [01 — Software Quality Attributes](../01-Software-Quality-Attributes.md)
- [02 — Software Design Principles](../02-Software-Design-Principles.md)
- [03 — Separation of Concerns and Abstraction](../03-Separation-of-Concerns-and-Abstraction.md)
- [04 — Coupling and Cohesion](../04-Coupling-and-Cohesion.md)
- [05 — SOLID Principles](../05-SOLID-Principles.md)
- [06 — Dependency Injection](../06-Dependency-Injection.md)
- [07 — Layered and Clean Architecture](../07-Layered-and-Clean-Architecture.md)

These chapters establish the principles needed to evaluate patterns. In particular, design patterns should be understood as possible implementations of design decisions, not as replacements for sound responsibility boundaries or dependency management.

## 4. Chapter Structure

The learning sequence is organized into three categories.

| Chapter | Focus | Central question |
|---|---|---|
| [01 — Creational Patterns](01-Creational-Patterns.md) | Object creation and construction | How should objects be created when construction is complex or needs to vary? |
| [02 — Structural Patterns](02-Structural-Patterns.md) | Composition and relationships between components | How can components be combined without creating unnecessary coupling? |
| [03 — Behavioral Patterns](03-Behavioral-Patterns.md) | Communication, responsibilities, and changing behavior | How can responsibilities and interactions be organized as behavior evolves? |

Each chapter should explain the problems addressed by its selected patterns, their structure, practical implementations, trade-offs, and selection criteria.

The category chapters should remain focused on their respective pattern families. They should reference earlier ENG-03 principles instead of re-teaching those principles in depth.

## 5. What Is a Design Pattern?

A design pattern captures a recurring design problem and a proven general approach to solving it within a particular context.

A useful pattern description identifies:

1. **Problem:** The design difficulty being addressed.
2. **Context:** The circumstances in which the pattern may be useful.
3. **Structure:** The components or objects involved.
4. **Responsibilities:** What each participant does.
5. **Collaboration:** How participants interact.
6. **Consequences:** The benefits and costs of applying the pattern.
7. **Alternatives:** Other approaches that may solve the same problem.

A pattern should be evaluated against the actual problem. The fact that a pattern is well known does not establish that it is appropriate for a particular application.

## 6. The Three Pattern Categories

### 6.1 Creational Patterns

Creational patterns address object creation.

They are useful when construction logic becomes complex, when the concrete implementation must vary, or when an application needs greater control over how objects are initialized.

The chapter on creational patterns should focus on construction responsibilities, object lifecycle considerations, and the trade-off between flexible creation and unnecessary indirection.

### 6.2 Structural Patterns

Structural patterns address how components and objects are composed.

They help engineers organize relationships between components, adapt incompatible interfaces, add responsibilities, or provide simplified access to complex subsystems.

The chapter on structural patterns should focus on composition, integration boundaries, and the consequences of introducing additional structural components.

### 6.3 Behavioral Patterns

Behavioral patterns address how objects or components communicate and distribute responsibilities.

They can help organize interchangeable behavior, notification mechanisms, workflow steps, and interactions that would otherwise become tightly coupled.

The chapter on behavioral patterns should focus on collaboration, responsibility assignment, and the trade-offs between flexibility and complexity.

## 7. How to Evaluate a Pattern

Do not begin by asking, "Which design pattern should I use?"

Begin by describing the design problem.

Use this decision process:

1. Identify the current behavior and the desired behavior.
2. Identify the component whose responsibilities or dependencies are causing difficulty.
3. Determine what is likely to change and what should remain stable.
4. Consider the simplest implementation that satisfies the requirement.
5. Identify patterns that address the specific problem.
6. Compare their benefits, complexity, and maintenance costs.
7. Choose an implementation that fits the current context.
8. Validate the decision through tests and code review.

For example, if a system must support multiple notification providers, the first question is not whether to use a particular pattern. The first question is which part of the system should own notification behavior and how provider-specific details should be isolated.

A pattern becomes a candidate only after the problem and required boundary are understood.

## 8. Relationship with Other Design Principles

Design patterns and design principles operate at different levels.

- **Design principles** guide engineering decisions across many situations.
- **Design patterns** describe reusable structures for recurring design problems.
- **Architecture** defines the broader organization of responsibilities and dependencies.
- **Refactoring** helps improve existing designs while preserving intended behavior.

A pattern may help implement a principle, but applying a pattern does not automatically guarantee good design.

For example, introducing several interfaces and classes does not necessarily improve maintainability. The resulting design must still have clear responsibilities, appropriate coupling, and a justified level of abstraction.

Refer to the earlier chapters for the detailed treatment of these concepts rather than duplicating that material here.

## 9. Common Mistakes

### 9.1 Pattern-First Design

Selecting a pattern before understanding the problem can produce unnecessary classes and indirection.

**Better approach:** State the design problem in plain language before choosing a solution.

### 9.2 Treating Patterns as Frameworks

A design pattern is a general design approach, not necessarily a library, framework, or package.

**Better approach:** Understand the structure and reasoning behind the pattern before introducing a dependency.

### 9.3 Overengineering

Adding a pattern to code that is simple, stable, and easy to test can increase maintenance cost.

**Better approach:** Prefer the simplest design that meets the actual requirements.

### 9.4 Copying Implementations Without Understanding Trade-offs

An implementation that works in one context may be inappropriate in another.

**Better approach:** Evaluate the assumptions, consequences, and alternatives before reusing a pattern.

### 9.5 Confusing Pattern Knowledge with Engineering Judgment

Being able to name a pattern is not the same as knowing when to use it.

**Better approach:** Explain the problem, why the pattern fits, what alternatives were considered, and what costs the pattern introduces.

## 10. Practical Learning Method

For each pattern studied, follow this sequence:

1. Describe a realistic design problem.
2. Implement a simple solution without the pattern.
3. Identify the limitations of that solution.
4. Study the pattern's structure and participant responsibilities.
5. Implement the pattern in Python.
6. Write tests for its expected behavior.
7. Compare the two implementations.
8. Explain the benefits and costs of the pattern.
9. Identify conditions under which the pattern should not be used.
10. Explain the design decision as if reviewing a teammate's code.

This method develops practical judgment rather than memorization.

## 11. Completion Criteria

The Design Patterns chapter group is complete when you can:

- Explain the purpose of the three pattern categories.
- Recognize a recurring design problem without immediately forcing a pattern onto it.
- Implement representative patterns and test their behavior.
- Compare a pattern-based design with a simpler alternative.
- Explain the effects on coupling, cohesion, maintainability, and complexity.
- Defend a pattern-selection decision using explicit trade-offs.
- Identify when not using a pattern is the better engineering decision.

## 12. Revision Questions

Answer these in your own words:

1. What distinguishes a design pattern from a design principle?
2. Why should an engineer identify the problem before selecting a pattern?
3. How do creational, structural, and behavioral patterns differ in the problems they address?
4. Can a system use a recognized design pattern and still have poor architecture? Explain.
5. How would you determine whether a pattern introduces useful flexibility or unnecessary complexity?
6. What evidence would convince you to refactor an existing implementation toward a pattern?
7. How would you explain the trade-offs of a pattern during a code review?

## 13. Navigation

- [01 — Creational Patterns](01-Creational-Patterns.md)
- [02 — Structural Patterns](02-Structural-Patterns.md)
- [03 — Behavioral Patterns](03-Behavioral-Patterns.md)

**Next step:** Study `01-Creational-Patterns.md`, beginning with the problems associated with object creation and construction.

---

*Document status: Generated content for review. This response does not directly modify the repository file.*
