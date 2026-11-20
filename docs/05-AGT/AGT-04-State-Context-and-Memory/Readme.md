# AGT-04 — State, Context & Memory

## Chapter Overview

Agent systems continuously manage information while they execute.

An agent needs to:

- represent the current condition of its execution;
- determine what information is relevant to the current execution step;
- retain selected information that may be useful beyond the current execution.

These responsibilities are related but distinct.

AGT-04 establishes the foundational distinction:

> **State ≠ Context ≠ Memory**

The chapter focuses on the **information-management problem inside agent execution** and teaches how state, context, and memory interact across execution boundaries.

---

## Learning Outcomes

After completing AGT-04, you should be able to:

1. Explain the difference between state, context, and memory.
2. Describe how information moves through an agent execution lifecycle.
3. Explain state representation, state transitions, and state lifecycle.
4. Explain how execution context is assembled for a particular execution step.
5. Reason about context selection, relevance, prioritization, ordering, and budgets.
6. Identify problems caused by context growth, stale information, conflicting information, irrelevant information, and contamination.
7. Explain context-management techniques such as compaction, summarization, truncation, and selective omission.
8. Explain memory as intentional information retention across execution boundaries.
9. Reason about memory formation, retention, retrieval, update, expiration, and deletion.
10. Evaluate memory relevance, quality, provenance, freshness, scope, and isolation.
11. Explain how state, context, and memory interact without collapsing them into a single concept.
12. Distinguish AGT-04 memory and context management from Retrieval Engineering and other domain responsibilities.
13. Make engineering decisions involving information freshness, retention, context budgets, and information quality.

---

## Core Distinction

AGT-04 uses three foundational concepts:

| Concept | Core Question | Role |
|---|---|---|
| **State** | What is currently true about the execution? | Represents the current condition of an execution, session, or workflow |
| **Context** | What information is needed for this execution step? | Represents information intentionally assembled for a particular execution step |
| **Memory** | What information should be retained for future use? | Represents information intentionally retained across execution boundaries |

The distinction should remain consistent throughout the chapter:

```text
State
  = current execution condition

Context
  = information assembled for the current execution step

Memory
  = information intentionally retained for future execution
```

---

## Lessons

### 01 — Agent State, Context and Lifecycle

[Agent State Context and Lifecycle](./01-Agent-State-Context-and-Lifecycle.md)

**Primary question:**

> What is the difference between state, context, and memory, and how does information move through an agent execution lifecycle?

This lesson establishes the foundational model for:

- state;
- context;
- memory;
- execution lifecycle;
- state lifecycle;
- context lifecycle;
- high-level memory lifecycle;
- movement of information through execution.

**Role in the chapter:** Establish the conceptual foundation required by Lessons 02 and 03.

---

### 02 — Context Engineering and Execution Context Management

[Context Engineering and Execution Context Management](./02-Context-Engineering-and-Execution-Context-Management.md)

**Primary question:**

> How should an agent decide what information belongs in the context for a particular execution step?

This lesson focuses on:

- execution context;
- context sources;
- context assembly;
- selection;
- relevance;
- prioritization;
- ordering;
- context budgets;
- information density;
- context growth;
- freshness;
- conflicts;
- contamination;
- compaction;
- summarization;
- truncation;
- omission;
- context reconstruction.

**Role in the chapter:** Teach how an agent manages the information presented to a particular execution step.

---

### 03 — Agent Memory, Retention, Retrieval and Lifecycle

[Agent Memory Retention Retrieval and Lifecycle](./03-Agent-Memory-Retention-Retrieval-and-Lifecycle.md)

**Primary question:**

> What information should an agent remember, for how long, and how should retained information be used later?

This lesson focuses on:

- memory meaning;
- memory vs state and context;
- memory formation;
- retention;
- memory categories;
- retrieval and relevance;
- update and correction;
- expiration;
- deletion;
- lifecycle;
- stale and conflicting memory;
- quality;
- provenance;
- scope;
- isolation;
- contamination.

**Role in the chapter:** Teach how information intentionally retained across execution boundaries is managed throughout its lifecycle.

---

## Learning Progression

The three files build progressively:

```text
01 — Foundational Model
State + Context + Memory
          │
          ↓
Information Lifecycle
          │
          ↓
02 — Context Engineering
Selection + Prioritization
          │
          ↓
Budgets + Freshness + Conflicts
          │
          ↓
Compaction + Truncation + Omission
          │
          ↓
03 — Memory Lifecycle
Formation + Retention
          │
          ↓
Retrieval + Use + Update
          │
          ↓
Expiration + Deletion + Scope
```

The progression moves from:

> **What information represents the current execution?**

to:

> **What information is needed for the current step?**

to:

> **What information should persist for future use?**

---

## Prerequisites

AGT-04 builds on concepts established earlier in the AGT domain.

### AGT-01-Agent-Systems-Foundations

Provides the foundations for:

- agent definitions;
- agent boundaries;
- agent architectures;
- agents vs LLM applications;
- agents vs workflows;
- agents vs RAG systems.

### AGT-02 — Agent Runtime, Loops & Bounded Autonomy

Provides the execution model required to reason about:

- runtime;
- execution steps;
- execution loops;
- decision → action → observation → continuation;
- termination;
- execution budgets;
- bounded autonomy.

AGT-04 focuses on the information that represents and supports that execution.

### AGT-03 — Tools & Action Execution

Provides the concepts required to understand:

- tools;
- tool contracts;
- invocation;
- tool results;
- tool failures.

AGT-04 may use tool results as examples of information that can participate in state, context, or memory decisions without re-teaching tool engineering.

---

## Where This Is Covered
AGT-04 owns the **agent execution-context management problem**.

The primary boundaries are:

| Area | Primary Owner | AGT-04 Relationship |
|---|---|---|
| Agent foundations | AGT-01 | Uses established agent concepts |
| Runtime and execution loops | AGT-02 | Manages information supporting execution |
| Tools and action execution | AGT-03 | Consumes tool results as execution information |
| Planning and adaptation | AGT-05 | Provides state/context information that planning may use |
| Durable execution | AGT-06 | Covers information-management concepts without owning durable workflow architecture |
| Human control | AGT-07 | May represent approval status as state |
| Agent protocols | AGT-08 | May exchange execution information |
| Multi-agent systems | AGT-09 | Provides foundational state/context/memory concepts |
| Agent evaluation | AGT-10 | May provide information-quality concerns |
| Reliability and safety | AGT-11 | Owns broader safety consequences |
| Architecture review | AGT-12 | Provides concepts used in system-level design review |

### Cross-Domain Boundaries

| Domain | Boundary |
|---|---|
| **LLM** | Owns model interaction, prompting, tokenization, model behavior, and model-specific context-window mechanics |
| **RET** | Owns retrieval systems, retrieval algorithms, indexing, ranking, reranking, and retrieval evaluation |
| **PROD** | Owns production infrastructure, deployment, operations, and infrastructure security |
| **ENT** | Owns enterprise governance, compliance, policy, and data governance |

A useful boundary is:

> **LLM:** How the model consumes input.

> **AGT-04:** What execution information should be assembled and managed for the model at a particular step.

And:

> **RET:** How relevant information is retrieved.

> **AGT-04:** How selected information participates in execution context and memory lifecycle.

---

## Engineering Questions

AGT-04 develops the ability to reason about questions such as:

- What represents the current execution condition?
- What information is required for the current execution step?
- Which available information is relevant?
- What information is stale or conflicting?
- How should context growth be controlled?
- What information deserves retention beyond the current execution?
- How long should retained information remain useful?
- How should stale or incorrect memory be corrected or removed?
- What scope should retained information have?
- How can information from one user, task, or project be prevented from influencing another?

These questions form the practical engineering foundation for later agent-system design work.

---

## Practical Learning Path

After completing the three lessons, use the following reasoning sequence when analyzing an agent information-management problem:

```text
1. Identify the execution
          ↓
2. Identify the current state
          ↓
3. Identify available information
          ↓
4. Determine what is relevant now
          ↓
5. Assemble appropriate context
          ↓
6. Execute
          ↓
7. Update state
          ↓
8. Decide what information deserves retention
          ↓
9. Retain, update, expire, or discard memory
          ↓
10. Reconstruct appropriate context for future execution
```

This is a reasoning framework, not a requirement that every implementation follow the same architecture.

---

## Key Principles

Keep these principles consistent throughout AGT-04:

- **State, context, and memory are distinct responsibilities.**
- **Context is assembled for a particular execution step.**
- **More context is not automatically better context.**
- **Context requires selection, prioritization, and constraint management.**
- **Memory requires an intentional retention decision.**
- **Stored information is not automatically correct, current, or relevant.**
- **Context and memory both require lifecycle management.**
- **Memory is a conceptual responsibility, not a synonym for a particular storage technology.**
- **Retrieval mechanisms do not define memory.**
- **Context engineering is broader than prompt engineering.**

The detailed reasoning behind these principles belongs in the lessons.

---

## Estimated Reading Time

Approximately **75–90 minutes** for the three lessons, excluding practical exercises, implementation work, and revision.

---

## Recommended Study Approach

Complete the files in order:

1. Read **Lesson 01** and verify that you can clearly distinguish state, context, and memory.
2. Read **Lesson 02** and practice deciding what should and should not enter an execution context.
3. Read **Lesson 03** and reason about what information deserves retention and how its lifecycle should be managed.
4. Revisit the three concepts together and analyze how information moves between current execution state, active context, and retained memory.
5. Apply the concepts to a real agent-system scenario before moving to later AGT chapters.

---

## Completion Criteria

AGT-04 is complete when you can independently:

- distinguish state, context, and memory;
- explain their different lifecycles;
- reason about context selection and prioritization;
- identify context growth, freshness, conflict, and contamination problems;
- reason about memory retention and relevance;
- explain memory update, expiration, and deletion;
- distinguish memory management from retrieval-system engineering;
- identify appropriate information scope and isolation boundaries;
- explain these concepts without relying on a specific framework or storage technology.

The goal is not to memorize terminology.

The goal is to develop a reliable engineering mental model for managing information throughout agent execution.
