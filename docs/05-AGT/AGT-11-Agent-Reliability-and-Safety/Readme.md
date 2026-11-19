# AGT-11 — Agent Reliability & Safety

## Purpose

AGT-11 defines an engineering-first approach to making agent behavior **reliable, recoverable, bounded, and safe** when execution does not go as expected.

The chapter focuses on:

- agent failure modes and recovery,
- execution and state safety,
- safety invariants and validation,
- containment and termination,
- excessive agency,
- capability and authority boundaries,
- unsafe tool and external-content interactions,
- and risk-aware control of agent actions.

Reliability and safety are related but distinct concerns. AGT-11 therefore addresses both **how agents recover from failure** and **when continued behavior must be constrained, contained, or terminated**.

---

## Central Question

> **How do we make agent behavior reliable, recoverable, bounded, and safe when execution does not go as expected?**

---

## Learning Outcomes

After completing AGT-11, you should be able to:

1. Identify and classify important agent failure modes.
2. Distinguish retry, fallback, compensation, recovery, degradation, containment, and termination.
3. Select recovery strategies based on failure type, side effects, reversibility, uncertainty, risk, and available alternatives.
4. Reason about bounded retries, recovery limits, and unsafe continuation.
5. Identify unsafe execution and unsafe state transitions.
6. Define and apply safety invariants, preconditions, postconditions, and validation boundaries.
7. Distinguish execution correctness from execution safety.
8. Distinguish state correctness from state safety.
9. Reason about duplicate execution, partial completion, and uncertain side effects.
10. Design appropriate containment and termination controls.
11. Distinguish agent capability from agent authority.
12. Apply least-privilege and action-space minimization principles at the agent-action level.
13. Identify excessive agency and over-permissioning.
14. Design appropriate validation, authorization, approval, isolation, and post-action controls.
15. Reason about untrusted tool outputs, external content, prompt-injection consequences, and memory-poisoning risks from an agent-safety perspective.
16. Apply defense-in-depth thinking to agent reliability and safety.
17. Decide when an agent should continue, recover, degrade, contain, escalate, or terminate.
18. Evaluate reliability and safety decisions using production-oriented engineering trade-offs.

---

## Prerequisites

AGT-11 builds on the earlier Agent Engineering chapters.

| Chapter | Relevant Foundation |
|---|---|
| **AGT-02** | Execution, continuation, termination, bounded execution |
| **AGT-03** | Tool contracts, invocation, execution, side effects |
| **AGT-04** | State, context, and memory |
| **AGT-05** | Planning, decomposition, replanning, verification |
| **AGT-06** | Workflow control, checkpoints, durable execution, compensation |
| **AGT-07** | Human intervention, approval, escalation |
| **AGT-08** | Capability and protocol boundaries |
| **AGT-09** | Delegation, supervision, coordination, multi-agent failure |
| **AGT-10** | Evaluation and behavioral assessment |

These chapters provide the underlying mechanisms. AGT-11 addresses their **reliability and safety implications** rather than re-teaching their primary responsibilities.

---

## Chapter Structure

```text
AGT-11/
├── README.md
├── 01-Agent-Failure-Modes-and-Recovery-Strategies.md
├── 02-Execution-and-State-Safety.md
└── 03-Agent-Safety-Excessive-Agency-and-Tool-Boundaries.md
```

### 01 — Agent Failure Modes and Recovery Strategies

**Primary responsibility:** Understand how agents fail and how engineering systems should respond.

Covers:

- failure classification,
- transient and persistent failures,
- deterministic and nondeterministic failures,
- tool, model, planning, state, context, and external dependency failures,
- partial and cascading failures,
- malformed outputs and invalid actions,
- timeout and resource exhaustion,
- repeated failure and stuck execution,
- failure detection and classification,
- retry and bounded retry,
- backoff,
- fallback,
- degradation,
- compensation,
- recovery,
- containment,
- termination,
- recovery limits,
- failure budgets,
- escalation,
- behavior-level recovery observability.

[Read Lesson 01 →](./01-Agent-Failure-Modes-and-Recovery-Strategies.md)

### 02 — Execution and State Safety

**Primary responsibility:** Understand how unsafe execution and state emerge and how systems constrain, detect, and contain them.

Covers:

- execution safety,
- state safety,
- unsafe state transitions,
- invalid, inconsistent, stale, and corrupted state,
- unsafe continuation,
- action/state mismatch,
- safety invariants,
- preconditions and postconditions,
- action and state validation,
- execution boundaries,
- bounded execution,
- containment,
- circuit breakers,
- kill switches,
- termination controls,
- safe failure states,
- fail-safe and fail-open behavior,
- irreversible actions,
- reversibility,
- side-effect isolation,
- duplicate execution,
- partial completion,
- recovery after unsafe execution.

[Read Lesson 02 →](./02-Execution-and-State-Safety.md)

### 03 — Agent Safety, Excessive Agency and Tool Boundaries

**Primary responsibility:** Understand agent-specific safety risks caused by excessive autonomy, unsafe capabilities, untrusted inputs or outputs, and weak action boundaries.

Covers:

- agent-specific safety,
- excessive agency,
- over-permissioning,
- unnecessary autonomy,
- action-space minimization,
- least privilege,
- capability boundaries,
- authorization and validation,
- sensitive and irreversible actions,
- destructive and high-impact operations,
- unsafe or untrusted tool outputs,
- prompt-injection consequences at the agent-action boundary,
- indirect instruction attacks,
- malicious or compromised tools,
- unsafe external content,
- memory poisoning from a safety perspective,
- unsafe persistence and delegation,
- approval/control bypass,
- action gating,
- sandboxing,
- containment,
- termination.

[Read Lesson 03 →](./03-Agent-Safety-Excessive-Agency-and-Tool-Boundaries.md)

---

## Recommended Reading Order

Read the files sequentially:

```text
01 — Agent Failure Modes and Recovery Strategies
                    ↓
02 — Execution and State Safety
                    ↓
03 — Agent Safety, Excessive Agency and Tool Boundaries
```

The progression is:

**Failure → Recovery → Safe Execution → Safe State → Bounded Agency**

Lesson 01 establishes failure and recovery reasoning.

Lesson 02 applies that reasoning to execution and state safety.

Lesson 03 extends the safety model to agent autonomy, capabilities, authority, tools, external content, and high-impact actions.

---

## Related Chapters
Each major AGT-11 concept has one primary teaching location.

| Concept | Covered in |
|---|---|
| Failure classification | Lesson 01 |
| Agent failure modes | Lesson 01 |
| Retry and bounded retry | Lesson 01 |
| Backoff | Lesson 01 |
| Fallback and degradation | Lesson 01 |
| Compensation | Lesson 01 |
| Recovery strategy selection | Lesson 01 |
| Recovery limits and failure budgets | Lesson 01 |
| Recovery escalation | Lesson 01 |
| Execution safety | Lesson 02 |
| State safety | Lesson 02 |
| Unsafe state transitions | Lesson 02 |
| Safety invariants | Lesson 02 |
| Preconditions and postconditions | Lesson 02 |
| Action/state validation | Lesson 02 |
| Unsafe continuation | Lesson 02 |
| Containment and termination controls | Lesson 02 |
| Fail-safe vs. fail-open behavior | Lesson 02 |
| Irreversible actions and reversibility | Lesson 02 |
| Side-effect isolation | Lesson 02 |
| Duplicate and partial execution | Lesson 02 |
| Excessive agency | Lesson 03 |
| Capability vs. authority | Lesson 03 |
| Action-space minimization | Lesson 03 |
| Agent-level least privilege | Lesson 03 |
| Tool trust and unsafe tool outputs | Lesson 03 |
| Authorization and action gating | Lesson 03 |
| Untrusted external content | Lesson 03 |
| Prompt-injection consequences | Lesson 03 |
| Memory-poisoning safety implications | Lesson 03 |
| Unsafe persistence and delegation | Lesson 03 |
| High-impact and destructive actions | Lesson 03 |

Later files should reference these concepts rather than re-teach them in depth.

---

## Core Terminology

AGT-11 requires precise distinctions between related concepts.

| Distinction | Engineering Meaning |
|---|---|
| **Reliability vs. Safety** | Reliability concerns continued correct behavior despite failures; safety concerns preventing unacceptable behavior or consequences. |
| **Retry vs. Recovery** | Retry is one recovery mechanism; recovery is the broader response to failure. |
| **Fallback vs. Compensation** | Fallback uses an alternative path; compensation addresses effects of an operation that may already have occurred. |
| **Containment vs. Termination** | Containment limits consequences; termination stops execution. |
| **Capability vs. Authority** | Capability is what the system can technically do; authority is what it is permitted to do. |
| **Tool Availability vs. Tool Trust** | Accessibility does not establish that a tool or its output is trustworthy. |
| **Execution Correctness vs. Execution Safety** | An execution can be technically correct while still being unsafe. |
| **State Correctness vs. State Safety** | A state can be valid or consistent while still being unsafe for continued execution. |

The lessons develop these distinctions in depth.

---

## Safety Model at a Glance

AGT-11 views safety as a set of controls around agent-generated actions:

```text
Goal
  ↓
Agent Reasoning
  ↓
Proposed Action
  ↓
Action Validation
  ↓
Authorization / Policy Boundary
  ↓
Tool Execution
  ↓
Observed Result
  ↓
State Update
  ↓
Continuation Decision
```

Relevant controls may include:

```text
Capability Restriction
        ↓
Action Validation
        ↓
Authorization
        ↓
Approval
        ↓
Execution Isolation
        ↓
Post-Action Verification
        ↓
Monitoring
        ↓
Containment / Termination
```

This is a navigation model for the chapter; the detailed engineering treatment belongs in Lessons 02 and 03.

---

## Practical Engineering Themes

AGT-11 repeatedly addresses decisions such as:

- retry or do not retry,
- recover or contain,
- continue or terminate,
- degrade or preserve full task execution,
- automate or require intervention,
- allow or restrict capability,
- validate or trust,
- fail-open or fail-safe,
- compensate or accept incomplete execution.

The appropriate decision depends on failure mode, side effects, reversibility, uncertainty, risk, and system requirements.

---

## Cross-Domain Relationships

### AGT-02 — Execution and Control

AGT-02 owns execution loops, continuation, termination mechanics, and bounded execution.

AGT-11 focuses on the **failure and safety reasons** for recovery, containment, and termination.

### AGT-03 — Tools and Tool Use

AGT-03 owns tool contracts, selection, invocation, execution semantics, and side effects.

AGT-11 focuses on the **safety implications** of tool access, tool trust, dangerous actions, and action boundaries.

### AGT-04 — State, Context and Memory

AGT-04 owns state, context, memory architecture, and lifecycle.

AGT-11 focuses on **unsafe state, state integrity, unsafe transitions, and unsafe continuation**.

### AGT-05 — Planning and Reasoning

AGT-05 owns planning, decomposition, replanning, verification, and critique.

AGT-11 focuses on **unsafe plans, failure consequences, recovery, degradation, and containment**.

### AGT-06 — Workflows and Durable Execution

AGT-06 owns workflow mechanics, checkpoints, durable execution, pause/resume, and compensation mechanics.

AGT-11 focuses on **when recovery, compensation, degradation, containment, or termination is appropriate from a reliability and safety perspective**.

### AGT-07 — Human Intervention

AGT-07 owns human-in-the-loop and intervention architecture.

AGT-11 may treat approval or escalation as safety controls without re-teaching their architecture.

### AGT-08 — Interoperability

AGT-08 owns capability interfaces, MCP, A2A, and interoperability mechanisms.

AGT-11 considers **untrusted capabilities, external boundaries, and their safety consequences**.

### AGT-09 — Multi-Agent Systems

AGT-09 owns multi-agent architecture, delegation, supervision, coordination, communication, and multi-agent failure behavior.

AGT-11 focuses on the **reliability and safety consequences** of those behaviors.

### AGT-10 — Agent Evaluation

AGT-10 owns evaluation methodology, datasets, behavioral metrics, trajectory evaluation, evaluator reliability, and regression testing.

AGT-11 owns the **reliability and safety controls being evaluated**.

### AGT-12 — Agent Architecture

AGT-12 owns architecture selection, architectural trade-offs, end-to-end design, and design review.

AGT-11 provides reliability and safety considerations without becoming the architecture-review chapter.

### PROD — Production AI Engineering

PROD owns infrastructure, deployment, platform operations, and operational infrastructure.

AGT-11 focuses on **agent-specific reliability and safety behavior**.

### ENT — Enterprise AI Systems

ENT owns governance, compliance, legal/regulatory requirements, and enterprise risk management.

AGT-11 focuses on **technical controls at the agent level**.

---

## Scope Boundary

AGT-11 is specifically an **agent reliability and safety engineering chapter**.

It is not intended to become:

- a generic distributed-systems reliability chapter,
- a generic cybersecurity chapter,
- a prompt-engineering chapter,
- a tool-engineering chapter,
- a workflow-orchestration chapter,
- a human-approval architecture chapter,
- an evaluation-methodology chapter,
- an infrastructure-operations chapter,
- or an enterprise governance/compliance chapter.

When concepts from these areas are required, they are discussed only for their **agent-specific reliability or safety implications**.

---

## Risk-Based Control at a Glance

AGT-11 uses risk-sensitive control rather than assuming that every action requires the same level of restriction.

```text
Lower Risk
    ↓
Basic Validation
    ↓
Moderate Risk
    ↓
Validation + Authorization
    ↓
High Risk
    ↓
Validation + Authorization + Approval
    ↓
Irreversible / Critical
    ↓
Strong Authorization
+ Explicit Approval
+ Execution Controls
+ Verification
+ Containment
```

The exact controls depend on the action, system, environment, and risk profile.

This is an engineering model, not a universal legal or compliance requirement.

---

## Estimated Learning Time

| Activity | Estimated Time |
|---|---:|
| Lesson 01 — Failure Modes and Recovery | 60–75 min |
| Lesson 02 — Execution and State Safety | 60–75 min |
| Lesson 03 — Agent Safety and Excessive Agency | 60–75 min |
| Revision / exercises | 30–45 min |
| **Total** | **~3.5–4.5 hours** |

Estimated reading time excludes implementation exercises and deeper revision.

---

## Navigation

### Start

[01 — Agent Failure Modes and Recovery Strategies](./01-Agent-Failure-Modes-and-Recovery-Strategies.md)

### Continue

[02 — Execution and State Safety](./02-Execution-and-State-Safety.md)

### Finish

[03 — Agent Safety, Excessive Agency and Tool Boundaries](./03-Agent-Safety-Excessive-Agency-and-Tool-Boundaries.md)

---

## Completion

AGT-11 is complete when you can independently reason about an agent failure or unsafe behavior and determine whether the appropriate response is to:

**recover → continue → degrade → contain → escalate → terminate**

based on failure characteristics, side effects, risk, uncertainty, and system constraints.

---

## Key Takeaway

> **Agents fail and behave unexpectedly. Production engineering must detect failure, limit consequences, recover when safe, and contain or terminate behavior when continued execution is unsafe.**
