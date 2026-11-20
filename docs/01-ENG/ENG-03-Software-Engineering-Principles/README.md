# ENG-03 — Software Engineering Principles

**Domain:** Engineering Foundations (ENG)  
**Topic ID:** ENG-03  
**Level:** Foundational to Intermediate, progressing toward Architecture Design  
**Purpose:** Develop the engineering judgment required to design, maintain, and evolve reliable software systems.

---

## 1. Overview

Software Engineering Principles provide the foundation for building software that remains understandable, testable, maintainable, and adaptable as systems grow.

Writing code that works is only one part of software engineering. Production systems must also accommodate changing requirements, multiple developers, increasing workloads, failures, security constraints, and long-term maintenance.

This module develops the ability to reason about software design decisions rather than simply follow coding rules or memorize principles.

It establishes a foundation for later work in LLM Engineering, Retrieval Engineering, Agent Engineering, Production AI Engineering, and Enterprise AI Systems.

## 2. Why This Module Exists

Software systems rarely become difficult to maintain because of a single complicated function. Complexity often emerges from interactions between components, unclear responsibilities, hidden dependencies, inconsistent design decisions, and accumulated compromises.

Consider a service that directly creates its database connections, performs business logic, formats API responses, and sends notifications in the same component.

Initially, this implementation may be easy to build. As requirements change, however, modifying one responsibility can affect several others. Testing becomes harder, changes become riskier, and development slows down.

Software engineering principles help engineers recognize and manage these problems.

The objective is not to apply every principle everywhere. It is to understand the problem each principle addresses, evaluate its trade-offs, and choose an appropriate solution for the system's actual requirements.

## 3. Engineering Mindset

Throughout this module, use the following principles of engineering judgment:

- **Understand the problem before selecting a solution.** A principle is useful only when it addresses a real engineering need.
- **Optimize for changeability.** Software should accommodate reasonably expected changes without unnecessary disruption.
- **Manage complexity deliberately.** Clear responsibilities and well-defined boundaries make systems easier to understand.
- **Prefer evidence over assumptions.** Use tests, measurements, and observed behavior to evaluate design decisions.
- **Avoid unnecessary abstraction.** Additional layers and patterns have costs and should justify their existence.
- **Preserve correctness while improving design.** Changes to existing systems must maintain their required behavior.
- **Treat trade-offs explicitly.** Maintainability, performance, simplicity, flexibility, and delivery speed can conflict.
- **Design for the actual scale and context.** A small application and a large distributed system do not necessarily need the same architecture.

These are guiding ideas for the module. Their detailed explanations belong in the designated chapters.

## 4. Learning Objectives

By the end of ENG-03, you should be able to:

1. Explain important software quality attributes and recognize trade-offs between them.
2. Apply general software design principles to realistic engineering problems.
3. Separate responsibilities and use abstraction to control complexity.
4. Analyze coupling and cohesion when evaluating component boundaries.
5. Explain and apply the SOLID principles without treating them as universal rules.
6. Understand dependency injection and its role in managing dependencies and testing.
7. Compare layered architecture and clean architecture and explain their respective trade-offs.
8. Recognize common design patterns and evaluate when they are appropriate.
9. Refactor existing code while preserving required behavior.
10. Identify technical debt, understand its consequences, and reason about how it should be managed.
11. Explain and defend design decisions using requirements, constraints, alternatives, and trade-offs.

## 5. Prerequisites

You should be comfortable with the following concepts before studying this module:

- Basic programming constructs, including functions, classes, and modules.
- Variables, control flow, and data structures.
- Basic object-oriented programming concepts.
- Functions and modules as ways to organize code.
- Basic debugging and reading existing code.
- Basic familiarity with tests and version control.

You do not need prior experience designing large production systems. The module builds toward that capability incrementally.

## 6. Documentation Structure

The module is organized into ten numbered chapters, with Design Patterns maintained as an expandable subdirectory.

### 01 — Software Quality Attributes

**Lesson:** [Software Quality Attributes](01-Software-Quality-Attributes.md)

Establishes why software quality matters and how engineers evaluate the characteristics of a system beyond functional correctness.

Primary coverage:

- Maintainability
- Scalability
- Reliability and availability
- Extensibility and reusability
- Testability
- Performance
- Security at a foundational level
- Trade-offs between quality attributes

### 02 — Software Design Principles

**Lesson:** [Software Design Principles](02-Software-Design-Principles.md)

Introduces general principles that guide everyday software design decisions.

Primary coverage:

- Don't Repeat Yourself (DRY)
- Keep It Simple, Stupid (KISS)
- You Aren't Gonna Need It (YAGNI)
- Composition over inheritance
- Law of Demeter at a conceptual level
- Design for change
- High cohesion and low coupling as guiding principles

The chapter establishes general design guidance. Detailed explanations of coupling, cohesion, and SOLID are owned by their respective chapters.

### 03 — Separation of Concerns and Abstraction

**Lesson:** [Separation of Concerns and Abstraction](03-Separation-of-Concerns-and-Abstraction.md)

Explains how to organize software responsibilities and expose clear interfaces while hiding unnecessary implementation details.

Primary coverage:

- Separation of concerns
- Encapsulation
- Information hiding
- Abstraction
- Interfaces
- Responsibilities and boundaries between layers

### 04 — Coupling and Cohesion

**Lesson:** [Coupling and Cohesion](04-Coupling-and-Cohesion.md)

Examines the relationships between software components and how those relationships influence maintainability and change.

Primary coverage:

- Types of coupling
- Types of cohesion
- Evaluating modularity
- Design trade-offs
- Improving component boundaries

This chapter covers the detailed treatment of coupling and cohesion.

### 05 — SOLID Principles

**Lesson:** [SOLID Principles](05-SOLID-Principles.md)

Explains five object-oriented design principles and how they help manage responsibilities, dependencies, and change.

Primary coverage:

- Single Responsibility Principle (SRP)
- Open/Closed Principle (OCP)
- Liskov Substitution Principle (LSP)
- Interface Segregation Principle (ISP)
- Dependency Inversion Principle (DIP)
- Violations and practical examples

SOLID is a design aid, not a requirement to introduce extra classes, interfaces, or abstractions into every implementation.

### 06 — Dependency Injection

**Lesson:** [Dependency Injection](06-Dependency-Injection.md)

Focuses on supplying dependencies to components rather than making components construct or locate all their dependencies themselves.

Primary coverage:

- The dependency construction problem
- Inversion of Control (IoC)
- Constructor injection
- Method injection
- Property injection
- Dependency injection containers at a conceptual level
- Testing and dependency management

The chapter owns the detailed explanation of dependency injection. Architecture and pattern chapters should reference it rather than repeat its full tutorial.

### 07 — Layered and Clean Architecture

**Lesson:** [Layered and Clean Architecture](07-Layered-and-Clean-Architecture.md)

Examines how software systems organize responsibilities and control dependencies across architectural boundaries.

Primary coverage:

- Layered architecture
- Clean architecture
- The dependency rule
- Entities and use cases
- Interface adapters
- Frameworks and drivers
- Architectural comparisons and trade-offs

The emphasis is on understanding architectural organization and making suitable design decisions, not creating layers for their own sake.

### 08 — Design Patterns

**Directory:** [`08-Design-Patterns/`](08-Design-Patterns/)

Provides a structured catalog of reusable design approaches to recurring software design problems.

Start with the [Design Patterns README](./08-Design-Patterns.md) for selection guidance and navigation.

The catalog is divided into three categories:

- Creational Patterns
- Structural Patterns
- Behavioral Patterns

Patterns should be selected because they solve a recognizable problem in context. They should not be introduced merely to make an implementation appear sophisticated.

### 09 — Refactoring

**Lesson:** [Refactoring](09-Refactoring.md)

Explains how to improve the internal structure of existing software while preserving its required externally observable behavior.

Primary coverage:

- Code smells
- Refactoring workflow
- Safe refactoring
- The role of testing
- Common refactoring transformations

The focus is controlled improvement of existing code, rather than a comprehensive repetition of general design principles.

### 10 — Technical Debt

**Lesson:** [Technical Debt](10-Technical-Debt.md)

Examines the long-term consequences of design and implementation compromises and how engineering teams should reason about them.

Primary coverage:

- Intentional and accidental technical debt
- Debt lifecycle and consequences
- The cost of accumulated debt
- Debt management
- Prioritization
- Real-world engineering scenarios

The objective is to make informed decisions about when to accept, reduce, or prevent technical debt rather than assume that every compromise must be eliminated immediately.

## 7. Recommended Learning Path

Read the chapters in numerical order:

1. Software Quality Attributes
2. Software Design Principles
3. Separation of Concerns and Abstraction
4. Coupling and Cohesion
5. SOLID Principles
6. Dependency Injection
7. Layered and Clean Architecture
8. Design Patterns
9. Refactoring
10. Technical Debt

This sequence moves from the qualities engineers want to achieve, through the principles and structures used to achieve them, and finally to maintaining and evolving existing software.

The Design Patterns directory contains its own internal reading sequence for creational, structural, and behavioral patterns.

## 8. Conceptual Dependency Map

The following diagram shows the intended conceptual progression. It represents learning dependencies, not a claim that every later concept depends exclusively on the immediately preceding chapter.

```text
Software Quality Attributes
           |
           v
Software Design Principles
           |
           v
Separation of Concerns & Abstraction
           |
           v
Coupling & Cohesion
           |
           v
SOLID Principles
           |
           v
Dependency Injection
           |
           v
Layered & Clean Architecture
           |
           v
Design Patterns
           |
           v
Refactoring
           |
           v
Technical Debt
```

Important cross-connections:

- Quality attributes provide the criteria for evaluating design and architecture decisions.
- Separation of concerns and abstraction help establish component boundaries.
- Coupling and cohesion help evaluate the quality of those boundaries.
- SOLID applies object-oriented design reasoning to responsibilities, extension, substitution, interfaces, and dependencies.
- Dependency injection provides a practical approach to managing object dependencies.
- Architecture organizes responsibilities and dependency relationships at a broader system level.
- Design patterns provide reusable approaches to recurring design problems.
- Refactoring improves existing implementations, while technical debt analysis helps prioritize engineering investment.

Each chapter remains the primary teaching location for its assigned concepts. Cross-connections should use references rather than duplicate explanations.

## 9. Connections to Future Engineering Domains

ENG-03 establishes reusable engineering foundations for later domains in the Enterprise GenAI Engineering curriculum.

| Future domain | How ENG-03 supports it |
|---|---|
| LLM Engineering | Organizing model integrations, interfaces, and application responsibilities |
| Retrieval Engineering | Separating ingestion, retrieval, ranking, and persistence responsibilities |
| Agent Engineering | Managing tool interfaces, component dependencies, and evolving workflows |
| Production AI Engineering | Supporting testability, maintainability, refactoring, and quality-driven design |
| Enterprise AI Systems | Reasoning about architectural boundaries, long-term change, and engineering trade-offs |

These connections describe how the concepts may be applied in future domains. They do not introduce additional ENG-03 chapters or replace the scope of those domains.

## 10. Revision Checklist

Use this checklist after completing the module.

### Understanding

- [ ] I can explain why software quality involves more than functional correctness.
- [ ] I can explain when a design principle is useful and when it may be unnecessary.
- [ ] I can distinguish separation of concerns, abstraction, coupling, and cohesion.
- [ ] I can explain the five SOLID principles in my own words.
- [ ] I can distinguish dependency injection from dependency inversion.
- [ ] I can explain the main differences between layered and clean architecture.
- [ ] I can identify the purpose of a design pattern without assuming it is always appropriate.
- [ ] I can explain how refactoring differs from changing required behavior.
- [ ] I can explain why technical debt is a trade-off that requires deliberate management.

### Application

- [ ] I can identify a design problem in an existing codebase.
- [ ] I can propose a solution and explain its trade-offs.
- [ ] I can recognize unnecessary abstraction and avoid overengineering.
- [ ] I can describe how tests support safe refactoring.
- [ ] I can prioritize a technical debt item using impact, risk, and context.
- [ ] I can justify an engineering decision to another developer.

### Design and Communication

- [ ] I can explain how a design decision affects maintainability, testability, and change.
- [ ] I can compare at least two reasonable solutions to the same problem.
- [ ] I can identify assumptions and constraints behind my preferred solution.
- [ ] I can explain the reasoning behind my design without relying only on terminology or memorized rules.

Completing the checklist is a self-assessment, not proof of mastery. Demonstrate the skills through code reviews, implementation exercises, and architecture discussions.

## 11. Completion Criteria

ENG-03 should be considered learned when you can move beyond defining principles and use them to make defensible engineering decisions.

You should be able to:

1. Recognize a design problem in unfamiliar code.
2. Explain the problem and its likely consequences.
3. Compare possible solutions.
4. Select an approach based on requirements and constraints.
5. Implement or propose the change.
6. Evaluate correctness and trade-offs.
7. Explain your reasoning clearly to another engineer.

The objective is sound engineering judgment, not the maximum possible number of design principles, patterns, classes, or architectural layers.

## 12. Module Navigation

- [01 — Software Quality Attributes](01-Software-Quality-Attributes.md)
- [02 — Software Design Principles](02-Software-Design-Principles.md)
- [03 — Separation of Concerns and Abstraction](03-Separation-of-Concerns-and-Abstraction.md)
- [04 — Coupling and Cohesion](04-Coupling-and-Cohesion.md)
- [05 — SOLID Principles](05-SOLID-Principles.md)
- [06 — Dependency Injection](06-Dependency-Injection.md)
- [07 — Layered and Clean Architecture](07-Layered-and-Clean-Architecture.md)
- [08 — Design Patterns](./08-Design-Patterns.md)
- [09 — Refactoring](09-Refactoring.md)
- [10 — Technical Debt](10-Technical-Debt.md)

---

**Next step:** Complete ENG-03 through practical implementation, code review, and design-decision exercises. Then apply these foundations in subsequent Enterprise GenAI Engineering domains.
