# AGT-02 — Agent Runtime, Loops & Bounded Autonomy

## Chapter Purpose

AGT-02 explains how an agent system executes work over time.

The chapter focuses on the runtime mechanisms that repeatedly coordinate execution:

```text
Decision
   ↓
Action
   ↓
Observation
   ↓
Continuation
   ↓
Next Execution Step
```

The central question is:

> **How does an agent runtime execute work while maintaining explicit execution boundaries?**

AGT-01 establishes what an agent system is. AGT-02 moves from that architectural foundation into runtime execution.

---

## Scope

AGT-02 covers:

- Runtime harnesses
- Execution loops
- Execution steps
- Decision → Action → Observation cycles
- Continuation decisions
- Runtime termination
- Cancellation
- Timeouts
- Execution budgets
- Step and resource limits
- No-progress behavior
- Repeated-cycle detection
- Runaway execution prevention
- Bounded autonomy
- Runtime control boundaries
- Runtime-level observability
- Termination reasons
- Normal and forced termination
- Runtime-level execution failure handling

AGT-02 focuses on **how execution progresses, continues, and stops**.

---

## Learning Outcomes

After completing AGT-02, you should be able to:

1. Explain the purpose of an agent runtime.
2. Describe the structure of an agent execution loop.
3. Explain the relationship between decision, action, observation, and continuation.
4. Distinguish runtime execution from planning.
5. Identify conditions that allow execution to continue.
6. Identify conditions that terminate execution.
7. Distinguish cancellation, timeout, budget exhaustion, and successful completion.
8. Explain why bounded autonomy requires explicit runtime controls.
9. Identify common causes of runaway or no-progress execution.
10. Explain runtime responsibility boundaries with tools, planning, memory, workflows, human control, reliability, and architecture.

---

## Prerequisites

Before starting AGT-02, you should understand the foundational concepts introduced in:

- **AGT-01-Agent-Systems-Foundations**
  - Agent definition
  - Agent versus LLM
  - Agent versus workflow
  - Agent versus RAG
  - Foundational agent architecture
  - System boundaries

See [AGT-01-Agent-Systems-Foundations](../AGT-01-Agent-Systems-Foundations/README.md).

---

## Learning Path

Read the lessons in the following order.

### 1. Runtime Harness and Execution Loop

**Lesson:** Agent Runtime Harness and Execution Loop

This lesson establishes the runtime foundation:

- Runtime harness
- Runtime responsibilities
- Execution lifecycle
- Execution steps
- Execution loop
- Runtime control flow
- Runtime boundaries
- Conceptual runtime interfaces
- Execution visibility

**Primary question:**

> What is the runtime responsible for, and how does it repeatedly execute an agent?

---

### 2. Decision, Action, Observation and Continuation

**Lesson:** Agent Decision Action Observation and Continuation

This lesson examines the execution cycle:

```text
Decision
   ↓
Action
   ↓
Observation
   ↓
Continuation Decision
   ↓
Next Execution Step
```

It focuses on how one execution step produces the information needed to determine what happens next.

**Primary question:**

> What actually happens inside one agent execution cycle?

---

### 3. Termination Policies and Bounded Autonomy

**Lesson:** Termination Policies and Bounded Autonomy

This lesson covers runtime stopping conditions and execution boundaries, including:

- Successful completion
- Explicit termination
- Cancellation
- Timeout
- Step limits
- Execution budgets
- Resource limits
- Failure-induced termination
- Control-triggered termination
- No-progress detection
- Repeated-cycle detection
- Runaway execution
- Graceful and forced termination
- Bounded autonomy

**Primary question:**

> When should an agent stop, and how can autonomous execution be prevented from running without bounds?

---

## Chapter Progression

The chapter progresses from runtime structure to execution-cycle mechanics and finally to termination and bounded autonomy.

```text
Runtime Harness
      ↓
Execution Loop
      ↓
Execution Step
      ↓
Decision → Action → Observation
      ↓
Continuation
      ↓
Termination
      ↓
Bounded Autonomy
```

The three files should be completed in order.

---

## Where This Is Covered
AGT-02 is the primary location for the following concepts:

| Concept | Primary Owner |
|---|---|
| Runtime harness | AGT-02 |
| Execution loop | AGT-02 |
| Execution step | AGT-02 |
| Decision → Action → Observation cycle | AGT-02 |
| Continuation decision | AGT-02 |
| Runtime termination | AGT-02 |
| Cancellation | AGT-02 |
| Execution budgets | AGT-02 |
| Bounded autonomy | AGT-02 |

Related concepts owned by other chapters are referenced where necessary but are not re-taught here.

---

## Cross-Chapter Boundaries

### AGT-01-Agent-Systems-Foundations

AGT-01 owns the definition, foundational concepts, and architectural boundaries of agent systems.

AGT-02 assumes those foundations and focuses on runtime execution.

---

### AGT-03 — Tools & Action Execution

AGT-03 owns:

- Tool definitions
- Tool interfaces
- Tool schemas
- Tool discovery
- Tool invocation
- Tool execution mechanics
- Tool result handling
- Tool security boundaries

AGT-02 may refer to an action at the runtime level without teaching tool engineering in depth.

---

### AGT-04 — State, Context & Memory

AGT-04 owns:

- State
- Context
- Memory
- Context assembly
- Context lifecycle
- Memory retention

AGT-02 may reference execution state when describing runtime behavior, but detailed state, context, and memory engineering belongs to AGT-04.

Maintain the distinction:

> **State ≠ Context ≠ Memory**

---

### AGT-05 — Planning & Adaptive Execution

AGT-05 owns:

- Goal decomposition
- Planning
- Plan generation
- Plan evaluation
- Replanning
- Adaptation
- Critique
- Plan verification

AGT-02 focuses on runtime execution.

AGT-05 focuses on whether and how the approach to achieving the goal should change.

The responsibility boundary is:

> **AGT-02: What happens next in the execution runtime?**

> **AGT-05: Is this still the right way to achieve the goal?**

---

### AGT-06 — Workflow Orchestration & Durable Execution

AGT-06 owns:

- Workflow orchestration
- Durable execution
- Checkpoints
- Long-running workflow semantics
- Resumability
- Compensation workflows
- Workflow-level recovery execution

AGT-02 does not teach durable workflow architecture.

---

### AGT-07 — Human Control & Approval

AGT-07 owns:

- Human approval
- Human intervention
- Escalation
- Human-in-the-loop
- Human-in-command
- Approval gates

AGT-02 may identify external intervention or approval as a runtime boundary without teaching human-control architecture.

---

### AGT-08 — Agent Interfaces & Protocols

AGT-08 owns:

- Agent interfaces
- Protocols
- MCP
- A2A
- Capability discovery
- Structured agent communication

AGT-02 does not teach protocol or interoperability engineering.

---

### AGT-09 — Multi-Agent Systems

AGT-09 owns:

- Multi-agent architecture
- Agent delegation
- Specialization
- Coordination
- Communication
- Conflict resolution
- Multi-agent execution behavior

AGT-02 uses the single-agent runtime as its primary execution model.

---

### AGT-10 — Agent Evaluation & Behavioral Testing

AGT-10 owns:

- Agent evaluation
- Behavioral testing
- Evaluator reliability
- Rubrics
- Grader consistency
- Judge calibration
- Evaluation bias
- Evaluation drift
- False positives and negatives
- Evaluation contamination

AGT-02 may describe runtime observability needed to understand execution, but does not teach evaluation methodology.

---

### AGT-11 — Agent Reliability & Safety

AGT-11 owns the broader reliability and safety decision framework, including:

- Recovery strategy
- Retry and fallback decisions
- Compensation
- Containment
- Safety boundaries
- Excessive agency
- Unsafe continuation
- Prompt-injection consequences
- Memory poisoning
- Approval bypass

AGT-02 focuses on the runtime mechanisms that enforce execution boundaries.

---

### AGT-12 — Agent Architecture & Design Review

AGT-12 owns:

- Architecture synthesis
- Design review
- System-level trade-offs
- Architecture decision analysis
- End-to-end agent architecture review

AGT-02 provides runtime concepts that may be used during architecture review but does not own system-level architecture synthesis.

---

## Runtime and Planning Boundary

AGT-02 and AGT-05 address related but different responsibilities.

```text
AGT-02
Runtime execution
      ↓
Execute → Observe → Continue / Terminate

AGT-05
Planning and adaptation
      ↓
Plan → Evaluate → Adapt / Replan
```

AGT-02 should not become the primary location for planning concepts.

See AGT-05 for planning and adaptive execution.

---

## Runtime Controls

AGT-02 covers the runtime controls required to keep execution within explicit boundaries.

These may include:

- Step limits
- Time limits
- Resource budgets
- Action limits
- Cancellation
- Completion conditions
- No-progress detection
- Repeated-cycle detection
- Runtime termination policies

The chapter treats these as **runtime execution controls**.

Broader safety, reliability, approval, evaluation, and system-level control architectures remain owned by their respective chapters.

---

## Bounded Autonomy

Bounded autonomy is a core AGT-02 concept.

The runtime should not depend solely on the model deciding when to stop.

Instead, execution may be constrained through multiple runtime controls such as:

- Maximum steps
- Time budgets
- Resource budgets
- Action limits
- External cancellation
- Explicit termination conditions
- No-progress detection
- Repeated-cycle detection

The chapter emphasizes layered runtime boundaries rather than treating any single limit as a complete guarantee.

---

## Practical Learning Path

For each lesson:

1. Read the learning objectives.
2. Build the mental model before focusing on terminology.
3. Trace the execution examples.
4. Identify the runtime responsibilities being demonstrated.
5. Distinguish runtime execution from planning.
6. Identify continuation conditions.
7. Identify termination conditions.
8. Examine production trade-offs.
9. Answer the interview questions independently.
10. Use the Quick Revision section during later revision.

---

## Estimated Chapter Reading Time

Approximately **45–60 minutes** for a focused first reading.

Additional time may be required for:

- tracing execution examples;
- answering interview questions;
- reasoning through termination scenarios;
- designing runtime boundaries;
- revision.

The estimate is a guide rather than a completion requirement.

---

## Completion Check

Before moving beyond AGT-02, you should be able to explain:

- What an agent runtime does.
- How an execution loop works.
- How decision, action, observation, and continuation relate.
- How runtime execution differs from planning.
- How termination differs from cancellation and timeout.
- Why bounded autonomy requires explicit runtime controls.
- How runaway and no-progress execution can occur.
- Where AGT-02 responsibility ends and related AGT chapters begin.

---

## Chapter Navigation

| Lesson | Purpose |
|---|---|
| [Agent Runtime Harness and Execution Loop](01-Agent-Runtime-Harness-and-Execution-Loop.md) | Runtime harness and execution-loop foundations |
| [Agent Decision Action Observation and Continuation](02-Agent-Decision-Action-Observation-and-Continuation.md) | Execution-cycle mechanics |
| [Termination Policies and Bounded Autonomy](03-Termination-Policies-and-Bounded-Autonomy.md) | Termination policies and bounded autonomy |

---

## Chapter Dependency Summary

```text
AGT-01
Agent Systems Foundations
        │
        ▼
AGT-02
Agent Runtime, Loops & Bounded Autonomy
        │
        ├── Runtime execution
        ├── Execution cycles
        ├── Continuation
        └── Termination / bounded autonomy
        │
        ▼
Related downstream concepts
Tools ─ Planning ─ State/Memory ─ Workflows
Human Control ─ Protocols ─ Multi-Agent
Evaluation ─ Reliability/Safety ─ Architecture
```

AGT-02 should be completed before using runtime concepts as a foundation for the later agent-engineering chapters.
