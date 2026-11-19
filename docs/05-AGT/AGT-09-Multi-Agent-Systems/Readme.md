# AGT-09 — Multi-Agent Systems

## Chapter Purpose

AGT-09 teaches the architectural reasoning behind **multi-agent systems**.

The goal is not to assume that multiple agents are better than one. The goal is to understand:

> **When should a system use multiple agents, and how should those agents coordinate reliably toward a shared or related objective?**

Multi-agent architecture is an engineering choice, not a maturity requirement. A well-designed single-agent system may be preferable when multiple agents do not provide meaningful architectural value.

The central principle is:

> **Adding more agents adds coordination problems.**

---

## Central Engineering Question

> **When is one agent insufficient, when is multi-agent architecture justified, and how should multiple agents be decomposed, coordinated, supervised, communicated, and terminated?**

---

## Learning Outcomes

After completing AGT-09, you should be able to:

- Explain the difference between single-agent and multi-agent architecture.
- Determine when multiple agents provide meaningful architectural value.
- Define meaningful responsibility and specialization boundaries.
- Explain delegation and distinguish it from supervision.
- Explain how multiple agents coordinate, synchronize, and hand off responsibility.
- Compare centralized, hierarchical, peer-to-peer, pipeline, and parallel coordination patterns.
- Distinguish local state, shared state, and coordination state.
- Reason about communication failures and partial agent failures.
- Analyze conflicting outputs, deadlock, livelock, and cascading failure.
- Design explicit multi-agent termination semantics.
- Evaluate latency, cost, reliability, complexity, and observability implications.
- Recognize common multi-agent architectural anti-patterns.
- Decide when a single agent or another architecture is preferable.
- Reason about multi-agent systems without depending on a specific framework or vendor.

---

## Chapter Structure

AGT-09 contains exactly three lessons.

### 01 — Single-Agent vs Multi-Agent Architecture

[Single Agent vs Multi Agent Architecture](./01-Single-Agent-vs-Multi-Agent-Architecture.md)

**Purpose:** Establish why a system might intentionally use multiple agents and when it should not.

**Key topics:**

- Single-agent vs multi-agent architecture
- Specialization
- Responsibility boundaries
- Independent ownership
- Isolation
- Independent execution
- Parallel work
- Delegation needs
- Architectural patterns
- Communication overhead
- Latency and cost
- Debugging and coordination complexity
- Multi-agent decision criteria

**Core question:**

> **Why would an engineer intentionally split one agent into multiple agents?**

---

### 02 — Delegation, Supervision and Agent Coordination

[Delegation Supervision and Agent Coordination](./02-Delegation-Supervision-and-Agent-Coordination.md)

**Purpose:** Explain how multiple agents work together after meaningful agent boundaries have been established.

**Key topics:**

- Delegation
- Responsibility transfer
- Specialist selection
- Capability matching
- Delegation boundaries
- Supervision
- Progress monitoring
- Coordination
- Synchronization
- Dependencies
- Handoffs
- Aggregation
- Conflict resolution
- Centralized, hierarchical, and peer coordination
- Coordinator failure
- Delegation loops
- Coordination bottlenecks
- Deadlocks

**Core question:**

> **Once multiple agents exist, how do they reliably work together?**

---

### 03 — Multi-Agent State, Communication, Failure and Termination

[Multi Agent State Communication Failure and Termination](./03-Multi-Agent-State-Communication-Failure-and-Termination.md)

**Purpose:** Explain how multi-agent systems behave when state differs, communication fails, agents become unavailable, outputs conflict, or coordination must terminate.

**Key topics:**

- Local state
- Shared state
- Coordination state
- State ownership and synchronization
- Stale and inconsistent state
- Message loss, delay, duplication, and reordering
- Communication failure
- Partial agent failure
- Conflicting outputs
- Deadlock
- Livelock
- Cascading failure
- Failure propagation
- Failure isolation
- Degraded operation
- Coordinated termination
- Orphaned work
- Termination races

**Core question:**

> **What happens when coordination becomes difficult or fails?**

---

## Learning Progression

Complete the files in order:

```text
Why multiple agents?
        │
        ▼
01 — Single-Agent vs Multi-Agent Architecture
        │
        │  Specialization
        │  Boundaries
        │  Patterns
        │  Trade-offs
        ▼
How do they work together?
        │
        ▼
02 — Delegation, Supervision and Coordination
        │
        │  Delegation
        │  Supervision
        │  Handoffs
        │  Synchronization
        │  Conflict resolution
        ▼
What happens when coordination becomes difficult?
        │
        ▼
03 — State, Communication, Failure and Termination
        │
        │  Multi-agent state
        │  Communication failure
        │  Failure propagation
        │  Deadlock / Livelock
        │  Termination
```

The overall progression is:

> **Why multiple agents? → How do they work together? → What happens when coordination becomes difficult?**

---

## Prerequisites

AGT-09 builds on the earlier Agent Engineering chapters.

Recommended prerequisites:

- AGT-01 — Agent Foundations
- AGT-02 — Agent Runtime and Execution
- AGT-03 — Tools and Agent Actions
- AGT-04 — Agent State, Context and Memory
- AGT-05 — Task Decomposition and Planning
- AGT-06 — Workflow Orchestration
- AGT-07 — Human-in-the-Loop and Intervention
- AGT-08 — Agent Interfaces and Protocols

These chapters provide concepts that AGT-09 uses as foundations. AGT-09 does not re-teach their full curricula.

---

## Where This Is Covered
AGT-09 deliberately maintains boundaries with adjacent chapters.

| Chapter | Relationship to AGT-09 |
|---|---|
| **AGT-01** | Owns agent definition and basic agent architecture. AGT-09 focuses on composing multiple agents. |
| **AGT-02** | Owns individual-agent runtime and termination. AGT-09 focuses on termination of multi-agent coordination. |
| **AGT-03** | Owns tool contracts, calls, routing, execution, and side effects. AGT-09 focuses on responsibilities between agents. |
| **AGT-04** | Owns individual agent state, context, and memory. AGT-09 focuses on shared and coordination state. |
| **AGT-05** | Owns planning, task decomposition, replanning, and verification. AGT-09 focuses on agent specialization and coordination. |
| **AGT-06** | Owns workflow orchestration and durable execution. AGT-09 focuses on coordination between autonomous or semi-autonomous agents. |
| **AGT-07** | Owns human intervention, approval, escalation, and override. AGT-09 focuses on agent-to-agent/system-level supervision. |
| **AGT-08** | Owns interoperability, interfaces, protocols, MCP, and A2A. AGT-09 focuses on why multiple agents exist and how they coordinate. |
| **AGT-10** | Owns agent evaluation methodology. AGT-09 may discuss coordination observability and diagnostics. |
| **AGT-11** | Owns agent safety and broader recovery/containment concerns. AGT-09 focuses on multi-agent failure propagation and coordination failure. |
| **AGT-12** | Owns end-to-end architecture selection and design review. AGT-09 supplies multi-agent patterns and trade-offs for that later work. |

### Important Boundary: AGT-08

AGT-09 must not become an MCP or A2A tutorial.

A multi-agent system can communicate through many mechanisms:

```text
Multi-Agent Architecture
        │
        ├── Direct Calls
        ├── Shared State
        ├── Queues
        ├── APIs
        ├── Message-Based Communication
        └── Protocol-Based Communication
                 └── A2A is one possible mechanism
```

The architectural question belongs to AGT-09:

> **Why should these agents exist and how should they work together?**

The interoperability and protocol question belongs to AGT-08.

### Important Boundary: AGT-04

AGT-09 uses the following distinction:

```text
AGT-04
Individual Agent State / Context / Memory

AGT-09
Coordination State / Shared State / Multi-Agent State
```

The focus is how state affects coordination, not how individual-agent memory is designed.

### Important Boundary: AGT-06

AGT-06 and AGT-09 may overlap operationally, but their architectural focus differs:

> **Workflow orchestration coordinates execution steps.**

> **Multi-agent architecture coordinates autonomous or semi-autonomous agents with distinct responsibilities.**

AGT-09 should not become a workflow-engineering chapter.

### Important Boundary: AGT-11

AGT-11 owns broader agent safety, recovery, containment, and agent-level failure handling.

AGT-09 focuses on the architectural consequences of one agent's failure for other agents and for the coordination process.

---

## Key Concepts

AGT-09 is organized around five connected areas:

### Architectural Choice

- Single-agent vs multi-agent
- Specialization
- Responsibility boundaries
- Independent ownership
- Isolation
- Parallelism
- Multi-agent justification

### Delegation and Coordination

- Delegation
- Supervision
- Handoffs
- Synchronization
- Dependency management
- Aggregation
- Conflict resolution

### Coordination Patterns

- Centralized coordination
- Hierarchical coordination
- Peer-to-peer coordination
- Pipeline coordination
- Parallel specialists

### State and Failure

- Local state
- Shared state
- Coordination state
- State synchronization
- Communication failure
- Partial failure
- Conflicting outputs
- Deadlock
- Livelock
- Cascading failure
- Failure propagation

### Termination and Production Behavior

- Success and failure termination
- Timeout
- Cancellation
- Coordinated shutdown
- Orphaned work
- Termination races
- Latency
- Cost
- Reliability
- Observability
- Operational complexity

---

## Multi-Agent Decision Principle

The central architectural decision is not:

> **Can we use multiple agents?**

It is:

> **Does multi-agent architecture provide enough value to justify its additional coordination cost?**

Multi-agent architecture may be justified when there are meaningful:

- specialization boundaries
- independently evolving responsibilities
- distinct capabilities
- independent execution requirements
- organizational ownership boundaries
- isolation requirements
- meaningful parallelism
- trust or operational boundaries

It may be unnecessary when:

- one agent can reliably perform the task
- specialization boundaries are artificial
- communication overhead dominates
- state synchronization becomes excessive
- coordination complexity exceeds the benefit
- agents repeatedly depend on one another
- debugging becomes disproportionately difficult
- the same model or context must repeatedly be passed between agents

A useful mental model is:

```text
Architectural Value
        │
        │ must justify
        ▼
Coordination Cost
```

The objective is not to maximize the number of agents.

> **Choose the simplest architecture that reliably satisfies the system requirements.**

---

## Production Design Questions

Before considering a multi-agent architecture production-ready, the design should have clear answers to:

1. Who owns each responsibility?
2. Who delegates?
3. Who supervises?
4. How do agents communicate?
5. What state is shared?
6. Who owns shared state?
7. What happens when an agent fails?
8. What happens when communication fails?
9. How are conflicting results handled?
10. How does coordination terminate?
11. What happens when the coordinator fails?
12. How are coordination failures diagnosed?
13. How are latency and communication costs controlled?
14. What measurable benefit justifies the additional complexity?

These questions are intended as architectural checks. Detailed implementation belongs in the lessons and the appropriate adjacent chapters.

---

## Estimated Reading Effort

| Component | Approximate effort |
|---|---:|
| README | 10–15 minutes |
| Lesson 01 | 30–40 minutes |
| Lesson 02 | 30–40 minutes |
| Lesson 03 | 35–45 minutes |
| **Total chapter** | **~105–140 minutes** |

Actual effort will vary depending on the learner's prior familiarity with distributed coordination and agent architecture.

---

## Chapter Completion Criteria

AGT-09 is complete when the learner can independently reason about:

```text
Why multiple agents may be useful
        ↓
When a single agent is better
        ↓
How meaningful agent boundaries are defined
        ↓
How delegation works
        ↓
How agents supervise and coordinate each other
        ↓
How coordination state affects the system
        ↓
How communication failures affect coordination
        ↓
How conflicts, deadlocks, and cascading failures occur
        ↓
How multi-agent systems terminate
        ↓
How the additional complexity is justified
```

The learner should be able to defend a multi-agent design **and** explain why a simpler single-agent design might be better.

---

## Core Principle

> **Do not introduce multiple agents because the architecture looks sophisticated. Introduce them only when specialization, separation, independence, isolation, parallelism, or another measurable architectural benefit justifies the additional coordination complexity.**

---

## Further Reading

Use the adjacent Agent Engineering chapters for concepts owned outside AGT-09:

- [AGT-01 — Agent Foundations](../AGT-01/README.md)
- [AGT-02 — Agent Runtime and Execution](../AGT-02/README.md)
- [AGT-03 — Tools and Agent Actions](../AGT-03/README.md)
- [AGT-04 — Agent State, Context and Memory](../AGT-04/README.md)
- [AGT-05 — Task Decomposition and Planning](../AGT-05/README.md)
- [AGT-06 — Workflow Orchestration](../AGT-06/README.md)
- [AGT-07 — Human-in-the-Loop and Intervention](../AGT-07/README.md)
- [AGT-08 — Agent Interfaces and Protocols](../AGT-08/README.md)
- [AGT-10 — Agent Evaluation](../AGT-10/README.md)
- [AGT-11 — Agent Safety and Failure Handling](../AGT-11/README.md)
- [AGT-12 — Architecture and System Design](../AGT-12/README.md)

---

## Navigation

**Previous:** [AGT-08 — Agent Interfaces and Protocols](../AGT-08/README.md)

**Current:** AGT-09 — Multi-Agent Systems

**Next:** [AGT-10 — Agent Evaluation](../AGT-10/README.md)

The teaching sequence within this chapter is:

1. [Single-Agent vs Multi-Agent Architecture](./01-Single-Agent-vs-Multi-Agent-Architecture.md)
2. [Delegation, Supervision and Agent Coordination](./02-Delegation-Supervision-and-Agent-Coordination.md)
3. [Multi-Agent State, Communication, Failure and Termination](./03-Multi-Agent-State-Communication-Failure-and-Termination.md)
