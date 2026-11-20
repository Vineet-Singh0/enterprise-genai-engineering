
# ENG-10 — Concurrency Fundamentals

## Overview

Concurrency Fundamentals develops the engineering knowledge required to understand and reason about programs that perform multiple tasks with overlapping execution.

A concurrent program may improve responsiveness, increase throughput, and overlap waiting with useful work. However, concurrency also introduces correctness risks when tasks interact with shared mutable state or depend on execution order.

This topic focuses on understanding those risks, recognizing common concurrency failures, and making defensible engineering decisions.

The objective is not merely to learn synchronization mechanisms. It is to understand when concurrency is useful, how concurrent behavior can fail, and how to design programs that remain correct and maintainable.

## Learning Objectives

By completing this topic, you should be able to:

- Explain concurrency and distinguish it from parallelism.
- Reason about tasks, threads, processes, and shared state.
- Identify race conditions, data races, and lost updates.
- Explain critical sections, mutual exclusion, locks, and atomic operations.
- Recognize deadlocks, starvation, and livelock.
- Evaluate thread safety and approaches to safe shared-state design.
- Compare shared-memory coordination with message passing.
- Explain the trade-offs between thread-based, process-based, and asynchronous concurrency.
- Analyze timing-dependent failures using execution traces.
- Choose an appropriate concurrency approach based on correctness, performance, complexity, and maintainability.

## Prerequisites

### Primary Prerequisites

| Topic | Relevant Foundations |
|---|---|
| ENG-01 — Computer Science Fundamentals | Processes, threads, memory, and program execution |
| ENG-02 — Programming Foundations | Variables, functions, data structures, control flow, and basic program structure |
| ENG-03 — Software Engineering Principles | Modularity, abstraction, coupling, and maintainability |

These topics provide the background required to understand concurrent execution and reason about program behavior.

### Supporting Reference

**ENG-08 — Development Quality**

Testing, debugging, profiling, and other quality practices support the investigation of concurrency failures. Refer to ENG-08 for detailed treatment of those practices rather than duplicating them here.

## Learning Path

Study the chapters in the following order.

| Order | Chapter | Focus |
|---|---|---|
| 1 | [Concurrency Fundamentals](01-Concurrency-Fundamentals.md) | Understand concurrency, sequential execution, parallelism, and why concurrent execution is useful. |
| 2 | [Execution Models and Shared State](02-Execution-Models-and-Shared-State.md) | Understand concurrent tasks, threads, processes, shared memory, and execution-order variation. |
| 3 | [Race Conditions and Data Races](03-Race-Conditions-and-Data-Races.md) | Investigate timing-dependent behavior, lost updates, and conflicting access to shared data. |
| 4 | [Synchronization Fundamentals](04-Synchronization-Fundamentals.md) | Understand critical sections, mutual exclusion, locks, atomic operations, and invariant protection. |
| 5 | [Deadlocks and Related Problems](05-Deadlocks-and-Related-Problems.md) | Recognize deadlock, starvation, livelock, circular waiting, and prevention strategies. |
| 6 | [Thread Safety and Safe Shared-State Design](06-Thread-Safety-and-Safe-Shared-State-Design.md) | Explore thread safety, immutability, confinement, ownership, and safe shared-state design. |
| 7 | [Communication and Coordination Between Tasks](07-Communication-and-Coordination-Between-Tasks.md) | Understand message passing, queues, producer-consumer patterns, task coordination, and backpressure. |
| 8 | [Concurrency Models and Practical Trade-offs](08-Concurrency-Models-and-Practical-Trade-offs.md) | Compare thread-based, process-based, and asynchronous approaches across different workloads. |
| 9 | [Concurrency Failure Analysis](09-Concurrency-Failure-Analysis.md) | Analyze execution interleavings, timing-sensitive failures, and approaches to controlled investigation. |
| 10 | [Concurrency Design Decisions and Engineering Practices](10-Concurrency-Design-Decisions-and-Engineering-Practices.md) | Apply the preceding concepts to make and justify concurrency design decisions. |

## Conceptual Progression

The topic follows a progression from understanding concurrent execution to making sound engineering decisions.

```text
Concurrency Fundamentals
          |
          v
Execution Models and Shared State
          |
          v
Race Conditions and Data Races
          |
          v
Synchronization Fundamentals
          |
          v
Deadlocks and Thread Safety
          |
          v
Communication and Coordination
          |
          v
Concurrency Models and Trade-offs
          |
          v
Failure Analysis
          |
          v
Design Decisions and Engineering Practices
```

This diagram represents the recommended learning progression. Some concepts can be studied independently once their prerequisites are understood.

## How to Study This Topic

For each chapter:

1. **Understand the problem.** Identify the engineering problem the concept addresses.
2. **Build the mental model.** Explain the concept in your own words before memorizing terminology.
3. **Trace execution.** Use small examples to reason about how multiple tasks can interact.
4. **Investigate failure scenarios.** Identify the assumptions, execution order, and shared state involved.
5. **Compare alternatives.** Explain why one approach may be more suitable than another.
6. **Practice engineering judgment.** Consider correctness, resource use, complexity, and maintainability.
7. **Test your understanding.** Answer the chapter's interview questions and complete its practical exercises.

Prefer reasoning about a small execution trace over memorizing definitions. Concurrency becomes easier to understand when you can explain precisely how an execution sequence produces a particular result.

## Important Conceptual Distinctions

Throughout this topic, pay particular attention to the following distinctions:

- **Concurrency vs. parallelism:** Overlapping progress versus simultaneous execution.
- **Processes vs. threads:** Different execution contexts and their typical memory-sharing characteristics.
- **Race conditions vs. data races:** Timing-dependent correctness failures versus conflicting unsynchronized memory accesses under the applicable memory model.
- **Atomicity vs. mutual exclusion:** An operation's indivisibility versus exclusive access to a critical section.
- **Synchronization vs. communication:** Coordinating access or execution versus exchanging work or information.
- **Deadlock vs. starvation vs. livelock:** Different ways in which useful progress can stop or fail to occur.
- **Thread safety vs. general correctness:** Safe concurrent use does not automatically guarantee that a program satisfies its requirements.
- **Thread-based vs. asynchronous concurrency:** Different approaches to organizing concurrent work, which can also coexist in the same application.

These distinctions are essential for analyzing failures and choosing appropriate designs.

## Scope and Boundaries

### Included

- Concurrent execution models and shared mutable state.
- Race conditions, data races, and synchronization.
- Deadlocks, starvation, and livelock.
- Thread safety and safe shared-state design.
- Message passing and task coordination.
- Threads, processes, and asynchronous I/O at a conceptual level.
- Concurrency failure analysis.
- Engineering trade-offs and design practices.

### Outside the Primary Scope

This topic is not intended to be an advanced operating-systems, parallel-algorithms, or distributed-systems course.

The following subjects are outside its primary scope:

- Detailed operating-system scheduling internals.
- Language-specific concurrency programming tutorials.
- Advanced CPU architecture and memory-model internals.
- Advanced lock-free and wait-free algorithms.
- Deep parallel algorithm design.
- Distributed consensus, distributed locks, and distributed transactions.
- Advanced actor frameworks and message-broker infrastructure.
- Kubernetes, worker orchestration, and production deployment.
- Advanced performance engineering and observability.

Foundational explanations may refer to these areas when necessary, but detailed treatment belongs in the appropriate curriculum topics.

## Related Topics

| Topic | Relationship |
|---|---|
| ENG-01 — Computer Science Fundamentals | Provides the execution, process, thread, and memory foundations. |
| ENG-02 — Programming Foundations | Provides the programming concepts used in concurrency examples. |
| ENG-03 — Software Engineering Principles | Supports modularity, abstraction, and maintainable design. |
| ENG-08 — Development Quality | Provides testing, debugging, profiling, and quality practices for investigating failures. |
| Future PROD topics | Apply concurrency concepts to production workloads and services within their approved scope. |
| Future ENT topics | Apply these foundations to larger systems without duplicating foundational concurrency explanations. |

## Completion Criteria

Consider this topic complete when you can demonstrate the following capabilities:

### Understand and Explain

- Explain concurrency, parallelism, shared state, and synchronization.
- Distinguish common concurrency failures accurately.
- Describe why particular execution sequences produce incorrect behavior.

### Analyze and Apply

- Trace a race condition and explain its root cause.
- Identify the assumptions behind a synchronization strategy.
- Analyze deadlock and related progress failures.
- Compare shared-state coordination with message passing.
- Select a suitable concurrency approach for a given workload.

### Design and Justify

- Determine whether concurrency is necessary for a particular problem.
- Design a solution that minimizes unnecessary shared mutable state.
- Explain how the design protects its required invariants.
- Justify the trade-offs between correctness, performance, complexity, and maintainability.
- Communicate the design and its limitations clearly to another engineer.

The goal is not to memorize every concurrency mechanism. The goal is to reason about concurrent systems and make sound engineering decisions.

---
