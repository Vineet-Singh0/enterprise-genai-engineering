# AGT-07 — Human Control & Approval

## Chapter Purpose

Agentic systems can operate with significant autonomy, but not every decision or action should occur without human involvement.

**Human control is an architectural control mechanism that defines where, when, and why a human can observe, approve, reject, redirect, intervene in, pause, or terminate agent behavior.**

This chapter establishes the engineering foundations for designing human oversight and approval into agent systems while avoiding unnecessary manual intervention.

The focus is on **control boundaries around agent autonomy**, not on implementing approval interfaces or enterprise governance systems.

---

## Learning Objectives

After completing AGT-07, you should be able to:

- Explain why agent systems need explicit human-control mechanisms.
- Distinguish autonomous execution from human oversight.
- Explain Human-in-the-Loop (HITL) and Human-on-the-Loop (HOTL) control patterns.
- Identify appropriate points for human observation and intervention.
- Design intervention points based on timing, risk, and operational requirements.
- Distinguish observation, intervention, approval, escalation, and override.
- Design approval boundaries around agent actions.
- Classify actions according to their required level of human control.
- Design risk-based approval mechanisms.
- Define authorization scope and appropriate approvers.
- Design meaningful approval context and decision provenance.
- Handle approval expiration, revocation, rejection, and timeout.
- Design escalation rules for high-risk, ambiguous, uncertain, or unauthorized situations.
- Design human override mechanisms with explicit authority boundaries.
- Identify human-control failure modes such as approval fatigue, stale approvals, bypasses, and escalation loops.
- Balance autonomy, human workload, latency, and operational risk.
- Distinguish human control from workflow durability, technical safety, evaluation, and enterprise governance.

---

## Scope

AGT-07 covers the design of human-control mechanisms within agent systems.

### Primary Topics

- Human oversight
- Human intervention
- Human-in-the-Loop
- Human-on-the-Loop
- Human-over-the-Loop where useful
- Observation and intervention
- Review points
- Human takeover
- Pause and resume from the human-control perspective
- Approval and rejection
- Redirection
- Escalation
- Override
- Control boundaries
- Intervention timing and granularity
- Synchronous and asynchronous human involvement
- Approval gates and conditions
- Risk-based approval
- High-risk actions
- Authorization scope
- Approver selection
- Approval context
- Approval provenance
- Approval expiration and revocation
- Approval denial and timeout
- Escalation rules and thresholds
- Ambiguous and uncertain decisions
- Human accountability
- Human-control failure modes
- Approval fatigue
- Autonomy versus oversight trade-offs

---

## Non-Goals

AGT-07 does **not** provide the primary teaching location for:

- Agent runtime loops and autonomous execution mechanics.
- Agent planning, task decomposition, or replanning.
- Tool definitions, schemas, tool selection, or tool execution mechanics.
- Tool side-effect and idempotency design.
- Agent state and context engineering.
- Agent memory architecture and memory lifecycle.
- Workflow durability and checkpoint implementation.
- Long-running execution infrastructure.
- Enterprise governance, compliance, legal, or regulatory frameworks.
- Full agent safety architecture and containment mechanisms.
- Agent evaluation methodology or evaluator design.
- Multi-agent coordination architecture.
- Protocol interoperability such as MCP or A2A.

These areas may be referenced where necessary to establish boundaries, but they are not re-taught in AGT-07.

---

## Prerequisites

Before studying AGT-07, you should understand the core Agent Engineering concepts established in earlier chapters, particularly:

- Agent runtime and bounded autonomy
- Agent state and execution context
- Tool contracts and invocation boundaries
- Agent planning and execution
- Workflow execution and lifecycle concepts

The key prerequisite is an understanding that an agent can make decisions and take actions autonomously. AGT-07 builds on that foundation by defining where human control should constrain that autonomy.

---

## Chapter Structure

```text
AGT-07/
├── README.md
├── 01-Human-in-the-Loop-and-Intervention-Patterns.md
└── 02-Approval-Boundaries-Escalation-and-High-Risk-Actions.md
```

The chapter contains exactly two lessons.

---

## Learning Progression

### Lesson 01 — Human-in-the-Loop and Intervention Patterns

**Path:**  
[Human in the Loop and Intervention Patterns](./01-Human-in-the-Loop-and-Intervention-Patterns.md)

**Primary question:**

> How can humans observe and intervene in agent behavior?

This lesson establishes the foundational vocabulary and patterns for human control, including:

- Human-in-the-Loop
- Human-on-the-Loop
- Human-over-the-Loop where useful
- Observation versus intervention
- Review points
- Human takeover
- Pause and resume from the human-control perspective
- Approval and rejection
- Redirection
- Escalation
- Override
- Intervention timing and granularity
- Synchronous and asynchronous human involvement
- Automation versus oversight trade-offs

This lesson provides the terminology and conceptual foundation required by Lesson 02.

---

### Lesson 02 — Approval Boundaries, Escalation, and High-Risk Actions

**Path:**  
[Approval Boundaries Escalation and High Risk Actions](./02-Approval-Boundaries-Escalation-and-High-Risk-Actions.md)

**Primary question:**

> Which agent actions should remain autonomous, and which should require human authorization?

This lesson focuses on:

- Approval boundaries
- Approval gates and conditions
- High-risk actions
- Risk-based approval
- Action classification
- Authorization scope
- Approver selection
- Approval context
- Approval provenance
- Approval expiration
- Approval revocation
- Escalation rules and thresholds
- Ambiguous and uncertain decisions
- Policy-triggered escalation
- Repeated failures
- High-impact actions
- Approval denial
- Approval timeout
- Human override
- Accountability
- Agent-level auditability
- Human-control failure modes
- Approval fatigue

---

## Core Chapter Question

The chapter is organized around one central engineering question:

> **Where should autonomous agent behavior stop and human control begin?**

Answering this requires considering:

- What actions require human attention.
- When human attention is required.
- Who is authorized to act.
- What information the human needs.
- What happens after approval or rejection.
- When an approval expires or must be revoked.
- When escalation is required.
- What authority a human override provides.
- What happens when the responsible human is unavailable.

The detailed mechanisms for answering these questions are taught in the two lessons.

---

## Cross-Domain Boundaries

AGT-07 interacts with several other Agent Engineering chapters. The following boundaries prevent duplicated teaching responsibilities.

### AGT-02 — Agent Runtime and Autonomy

AGT-02 owns:

- Agent runtime behavior.
- Decision/action/observation loops.
- Continuation.
- Termination.
- Bounded autonomy.

AGT-07 owns the **human-control mechanisms that constrain or interrupt that autonomy**.

---

### AGT-03 — Tools and Tool Execution

AGT-03 owns:

- Tool definitions.
- Tool contracts.
- Schemas.
- Tool selection.
- Tool execution.
- Side effects.
- Idempotency.
- Invocation boundaries.

AGT-07 determines whether human approval or intervention is required around an action, but does not redefine the tool contract.

---

### AGT-04 — Agent State, Context, and Memory

AGT-04 owns:

- Agent state.
- Execution context.
- Context engineering.
- Memory.
- Memory retention and retrieval.
- Memory lifecycle.

AGT-07 may identify information required for a human approval decision, but does not teach context engineering or memory architecture.

---

### AGT-05 — Planning and Agent Adaptation

AGT-05 owns:

- Task decomposition.
- Agent planning.
- Plan execution.
- Replanning.
- Adaptation.
- Plan verification.

AGT-07 may introduce human review points into a plan, but does not own planning methodology.

---

### AGT-06 — Workflow Patterns and Durable Execution

AGT-06 owns:

- Workflow patterns.
- Branches.
- Loops.
- Parallelism.
- Checkpoints.
- Durable execution.
- Long-running execution.
- Persistence and resumption mechanics.

AGT-07 defines **when human control requires a pause, approval, or intervention**.

AGT-06 provides the execution mechanisms required to make that pause or continuation durable.

---

### AGT-08 — Capability Interfaces and Interoperability

AGT-08 owns:

- Capability interfaces.
- Interoperability.
- MCP.
- A2A.
- Protocol-level communication.

AGT-07 may discuss identity or authorization in an approval context, but does not own protocol interoperability.

---

### AGT-09 — Multi-Agent Systems

AGT-09 owns:

- Multi-agent architecture.
- Delegation.
- Supervision.
- Coordination.
- Communication.
- Shared state.
- Conflict resolution.

AGT-07 may use human supervision of multiple agents as an example, but does not teach multi-agent architecture.

---

### AGT-10 — Agent Evaluation

AGT-10 owns:

- Evaluation methodology.
- Metrics.
- Trajectory evaluation.
- Regression testing.
- Evaluator reliability.
- Evaluation validity.

Human approval is a **control mechanism**, not an evaluation methodology.

---

### AGT-11 — Agent Safety

AGT-11 owns:

- Agent failure modes.
- Recovery.
- Execution safety.
- State safety.
- Excessive agency.
- Tool safety boundaries.
- Agent safety.
- Containment.
- Safety-oriented termination.

AGT-07 owns the **human-control mechanism** used to constrain or intervene in agent behavior.

It does not replace technical safety controls.

---

### ENT — Enterprise AI Systems

Enterprise governance, compliance, legal requirements, regulatory controls, and organizational authorization models belong to the Enterprise domain.

AGT-07 translates relevant requirements into **agent-level human-control patterns**.

It does not teach enterprise governance itself.

---

## Where This Is Covered
| Concept | Primary Owner |
|---|---|
| Agent runtime loop | AGT-02 |
| Bounded autonomy | AGT-02 |
| Tool contracts | AGT-03 |
| Tool selection and execution | AGT-03 |
| Tool side effects and idempotency | AGT-03 |
| Agent state and context | AGT-04 |
| Agent memory | AGT-04 |
| Planning and task decomposition | AGT-05 |
| Replanning and adaptation | AGT-05 |
| Workflow branches and loops | AGT-06 |
| Checkpointing and durable execution | AGT-06 |
| Human-in-the-Loop | **AGT-07** |
| Human-on-the-Loop | **AGT-07** |
| Intervention patterns | **AGT-07** |
| Approval boundaries | **AGT-07** |
| Risk-based approval | **AGT-07** |
| Escalation | **AGT-07** |
| Human override | **AGT-07** |
| Approval expiration and revocation | **AGT-07** |
| High-risk human authorization | **AGT-07** |
| Capability interoperability | AGT-08 |
| Multi-agent coordination | AGT-09 |
| Agent evaluation | AGT-10 |
| Agent safety and containment | AGT-11 |
| Enterprise governance and compliance | ENT |

---

## Practical Outcome

After completing AGT-07, you should be able to take an autonomous agent workflow and determine:

```text
Which actions can remain autonomous?
            ↓
Which actions require observation?
            ↓
Which actions require intervention?
            ↓
Which actions require explicit approval?
            ↓
Who is authorized to approve them?
            ↓
What information must the approver receive?
            ↓
What happens after approval or rejection?
            ↓
When should the decision escalate?
            ↓
When does approval expire or become invalid?
            ↓
What happens when human control is unavailable?
```

The expected outcome is an agent system with **appropriate autonomy and explicit human-control boundaries**, rather than either uncontrolled automation or unnecessary manual intervention.

---

## Recommended Reading Order

Read the chapter in order:

1. [Human-in-the-Loop and Intervention Patterns](./01-Human-in-the-Loop-and-Intervention-Patterns.md)
2. [Approval Boundaries, Escalation, and High-Risk Actions](./02-Approval-Boundaries-Escalation-and-High-Risk-Actions.md)

Lesson 01 establishes the human-control vocabulary and intervention patterns.

Lesson 02 builds on that foundation to address approval boundaries, escalation, and high-risk actions.

---

## Chapter Completion Criteria

AGT-07 is complete when you can:

- Explain why human control is an architectural concern.
- Distinguish HITL from HOTL.
- Identify appropriate intervention points.
- Explain when human involvement improves or harms a system.
- Design approval boundaries around agent actions.
- Classify actions by risk and required control.
- Select appropriate approvers.
- Define approval scope and conditions.
- Provide meaningful approval context.
- Handle approval expiry and revocation.
- Design escalation triggers.
- Handle rejection and timeout correctly.
- Design human override boundaries.
- Identify approval fatigue and other human-control failure modes.
- Balance autonomy with human workload and operational risk.
- Explain the difference between human control, durable workflow execution, technical safety, and enterprise governance.

---

## Summary

AGT-07 establishes **human control as an engineering mechanism for governing agent autonomy**.

The chapter progresses from:

**Human-control foundations → Intervention patterns → Approval boundaries → Escalation → High-risk actions**

The core principle is:

> **Use human control where human judgment materially improves control, accountability, or risk management, while avoiding unnecessary manual intervention.**
