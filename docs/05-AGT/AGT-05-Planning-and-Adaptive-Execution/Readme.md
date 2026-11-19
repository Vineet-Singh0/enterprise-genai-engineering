# AGT-05 — Planning & Adaptive Execution

## Chapter Purpose

AGT-05 teaches how an agent determines, structures, evaluates, and adapts **the way it will pursue a goal**.

Planning is more than generating a sequence of steps. An effective agent must be able to:

- understand the goal
- decompose the task
- identify dependencies and constraints
- construct a feasible strategy
- verify the strategy
- execute against the plan
- observe outcomes
- determine whether the plan remains valid
- adapt or replan when assumptions or conditions change

The central question of AGT-05 is:

> **Is this still the right way to achieve the goal?**

This complements AGT-02, whose runtime focus is:

> **What happens next?**

AGT-05 therefore focuses on **planning decisions and adaptive strategy**, rather than the mechanics of the runtime execution loop.

---

## Learning Objectives

After completing AGT-05, you should be able to:

- Explain what planning means in an agent system.
- Decompose goals into meaningful subgoals.
- Identify dependencies, prerequisites, constraints, and ordering requirements.
- Construct practical and feasible plans.
- Distinguish planning from runtime execution.
- Monitor whether a plan remains valid during execution.
- Distinguish harmless deviations from plan-invalidating changes.
- Decide when local adaptation is sufficient.
- Decide when full replanning is necessary.
- Preserve useful completed work during adaptation.
- Verify plans against goals, constraints, assumptions, and dependencies.
- Critique weak or incomplete plans.
- Reason about plan quality and engineering trade-offs.
- Balance plan stability against adaptability.
- Design bounded adaptive planning behavior.

---

## Chapter Scope

AGT-05 covers three connected areas.

### Planning Foundations

- Goals and subgoals
- Task decomposition
- Hierarchical decomposition
- Dependencies and prerequisites
- Sequencing and ordering constraints
- Planning horizons
- Plan representations
- Assumptions and constraints
- Plan construction
- Plan feasibility and completeness
- Static and adaptive planning concepts
- Simple planning patterns
- Limitations of naive planning

### Adaptive Execution

- Plan execution
- Progress monitoring
- Outcome observation
- Plan validity
- Changed assumptions
- Unexpected observations
- Partial success
- Failed actions
- Local adaptation
- Replanning
- Strategy changes
- Preserving valid work
- Plan drift
- Bounded adaptation
- Avoiding unnecessary replanning

### Verification and Plan Quality

- Plan verification
- Dependency validation
- Assumption checking
- Completeness and consistency
- Goal alignment
- Constraint satisfaction
- Plan critique
- Alternative plans
- Trade-off analysis
- Robustness
- Efficiency
- Over-planning and under-planning
- Plan quality criteria
- Verification before and during execution
- Post-plan assessment

---

## Non-Goals

AGT-05 does not deeply teach concepts owned by other chapters or domains.

- Runtime execution loops, continuation, and termination — **AGT-02**
- Tool contracts, schemas, invocation, and execution mechanics — **AGT-03**
- State, context, memory, and context engineering — **AGT-04**
- Workflow orchestration and durable execution — **AGT-06**
- Human approval and intervention mechanisms — **AGT-07**
- Multi-agent architecture, delegation, and coordination — **AGT-09**
- Agent evaluation methodology and evaluation systems — **AGT-10**
- Agent reliability, recovery, and safety engineering — **AGT-11**
- LLM internals, prompt engineering, and inference mechanics
- Retrieval engineering, embeddings, vector search, and reranking

AGT-05 may reference these areas when they are relevant to planning, but it does not re-teach them.

---

## Chapter Progression

The chapter follows a deliberate progression:

```text
01
Planning Foundations
      ↓
02
Plan Execution + Replanning + Adaptation
      ↓
03
Verification + Critique + Plan Quality
```

The learner progresses from:

```text
What is a plan?
      ↓
How does an agent adapt its plan?
      ↓
How do we know the plan is good enough?
```

---

## File Navigation

### 01 — Task Decomposition and Agent Planning

[AGT-05.01 — Task Decomposition and Agent Planning](./01-Task-Decomposition-and-Agent-Planning.md)

Establishes the foundations of agent planning, including:

- goals and subgoals
- task decomposition
- hierarchical decomposition
- dependencies
- sequencing
- constraints
- planning horizons
- plan representations
- feasibility
- completeness
- assumptions
- plan construction
- basic planning patterns
- limitations of naive planning

This file establishes the conceptual foundation required by the later files.

---

### 02 — Plan Execution, Replanning and Adaptation

[AGT-05.02 — Plan Execution, Replanning and Adaptation](./02-Plan-Execution-Replanning-and-Adaptation.md)

Focuses on adapting a plan when execution produces new information or changes the conditions under which the plan was created.

It covers:

- progress monitoring
- outcome observation
- deviations
- changed assumptions
- partial success
- failed actions
- local adaptation
- replanning
- preserving valid work
- strategy changes
- plan drift
- bounded adaptation
- avoiding unnecessary replanning

The key principle is:

> **A plan is not necessarily executed exactly as originally generated.**

---

### 03 — Verification, Critique and Plan Quality

[AGT-05.03 — Verification, Critique and Plan Quality](./03-Verification-Critique-and-Plan-Quality.md)

Focuses on determining whether a plan is sufficiently valid, complete, feasible, and useful.

It covers:

- plan verification
- feasibility checks
- dependency validation
- assumption checking
- completeness
- consistency
- goal alignment
- constraint satisfaction
- plan critique
- alternative plans
- trade-offs
- robustness
- efficiency
- over-planning
- under-planning
- plan quality
- verification during execution
- post-plan assessment

The key question is:

> **Is the plan sufficiently valid and useful to proceed?**

---

## Prerequisites

AGT-05 builds on the foundational agent concepts established in earlier AGT chapters.

Recommended prerequisites:

- Agent definition and system boundaries
- Agent architecture and system composition
- Agent runtime and execution loops
- Decision → action → observation
- Termination and bounded autonomy
- Tool capabilities and execution boundaries
- State, context, and memory concepts

Recommended prerequisite chapters:

- [AGT-01 — Agent Foundations](../AGT-01/README.md)
- [AGT-02 — Runtime, Loops & Bounded Autonomy](../AGT-02/README.md)
- [AGT-03 — Tools, Contracts & Execution](../AGT-03/README.md)
- [AGT-04 — State, Context & Memory](../AGT-04/README.md)

These chapters provide surrounding system concepts that AGT-05 uses without re-teaching them.

---

## Planning and Runtime

AGT-05 should be understood as a planning capability that interacts with runtime execution.

```text
Planning
"What strategy should achieve the goal?"
        ↓
Execution
"Perform the next action."
        ↓
Observation
"What happened?"
        ↓
Planning Assessment
"Does the current strategy still make sense?"
        ↓
   ┌───────────────┐
   │               │
   ↓               ↓
Continue       Adapt / Replan
```

AGT-05 does not replace the runtime loop defined in AGT-02.

Planning determines and revises the strategy that runtime execution follows.

---

## Planning Lifecycle

The overall AGT-05 mental model is:

```text
Goal
  ↓
Understand Task
  ↓
Decompose
  ↓
Identify Constraints & Dependencies
  ↓
Construct Plan
  ↓
Verify / Critique
  ↓
Execute
  ↓
Observe Results
  ↓
Is Plan Still Valid?
  ├── Yes → Continue
  │
  └── No
        ↓
     Adapt / Replan
        ↓
     Verify Revised Plan
        ↓
     Continue Execution
```

This is a planning lifecycle interacting with execution, not a replacement for the AGT-02 runtime model.

---

## Concept Ownership

AGT-05 has deliberately defined boundaries with the surrounding AGT chapters.

| Area | Primary Owner |
|---|---|
| Agent definition and system boundaries | AGT-01 |
| Runtime loops and bounded autonomy | AGT-02 |
| Tool contracts and tool execution | AGT-03 |
| State, context, memory, and context engineering | AGT-04 |
| **Planning and adaptive execution** | **AGT-05** |
| Workflow orchestration and durable execution | AGT-06 |
| Human approval and intervention | AGT-07 |
| Multi-agent coordination and delegation | AGT-09 |
| Agent evaluation methodology | AGT-10 |
| Agent reliability, failure handling, and safety | AGT-11 |

Each concept has one primary teaching location.

AGT-05 may reference concepts owned by other chapters when required to explain planning, but it should not re-teach those concepts in depth.

---

## Cross-Domain Boundaries

### AGT-02 — Runtime, Loops & Bounded Autonomy

AGT-02 owns:

- execution loops
- decision → action → observation
- continuation
- termination
- runtime control flow
- execution-step transitions

AGT-05 owns the planning strategy that determines whether the current approach remains appropriate.

---

### AGT-03 — Tools and Execution

AGT-03 owns:

- tool contracts
- schemas
- tool selection and routing
- tool execution
- tool failures
- side effects
- idempotency
- invocation boundaries

AGT-05 may determine that a particular capability is required by a plan, but tool invocation mechanics belong to AGT-03.

---

### AGT-04 — State, Context and Memory

AGT-04 owns:

- state
- context
- memory
- context engineering
- memory lifecycle

AGT-05 may use state, context, and memory as inputs to planning decisions without re-teaching their architecture or lifecycle.

---

### AGT-06 — Workflow Orchestration

AGT-05 owns the **planning decision**:

> What should be done, in what logical order, and whether the strategy should change?

AGT-06 owns the **workflow execution mechanisms**, including:

- branches
- loops
- parallelism
- checkpoints
- durable execution
- long-running execution
- asynchronous continuity
- workflow state transitions

AGT-05 is therefore not a workflow orchestration chapter.

---

### AGT-07 — Human-in-the-Loop

AGT-05 may identify that a plan requires approval or escalation.

Detailed human approval and intervention mechanisms belong to AGT-07.

---

### AGT-09 — Multi-Agent Systems

Planning can be used within multi-agent systems, but AGT-05 does not teach:

- multi-agent architecture
- delegation
- supervision
- inter-agent communication
- multi-agent state
- conflict resolution

Those concepts belong to AGT-09.

---

### AGT-10 — Evaluation

AGT-05 teaches **plan quality as an engineering property**.

For example:

- Is the plan complete?
- Is it feasible?
- Does it satisfy constraints?
- Are dependencies valid?
- Does it align with the goal?

AGT-10 owns the broader methodology for evaluating agent behavior across evaluation sets, trajectories, metrics, regressions, and related evaluation systems.

Verification and evaluation must not be treated as the same concept.

---

### AGT-11 — Reliability and Safety

AGT-05 may discuss replanning after failures or changed conditions.

Detailed reliability, recovery, safety boundaries, excessive agency, and safety-critical execution decisions belong to AGT-11 where applicable.

---

## Practical Outcome

After completing AGT-05, you should be able to reason about an agent that can:

```text
Goal
 ↓
Decompose
 ↓
Plan
 ↓
Verify
 ↓
Execute
 ↓
Observe
 ↓
Assess Plan Validity
 ↓
Continue
   or
Adapt / Replan
 ↓
Verify Revised Strategy
 ↓
Continue
```

You should be able to explain not only **how to construct a plan**, but also **when the plan should change and why**.

---

## Recommended Reading Order

Read the files sequentially:

1. [01 — Task Decomposition and Agent Planning](./01-Task-Decomposition-and-Agent-Planning.md)
2. [02 — Plan Execution, Replanning and Adaptation](./02-Plan-Execution-Replanning-and-Adaptation.md)
3. [03 — Verification, Critique and Plan Quality](./03-Verification-Critique-and-Plan-Quality.md)

The concepts build progressively:

```text
Planning Foundations
        ↓
Adaptive Execution
        ↓
Verification & Critique
```

---

## Key Engineering Questions

Throughout AGT-05, keep asking:

- What exactly is the goal?
- What assumptions does the plan make?
- What dependencies and constraints must be satisfied?
- Is the plan feasible and complete enough?
- Does a deviation actually invalidate the plan?
- Is local adaptation sufficient, or is replanning justified?
- What completed work can be preserved?
- Is the revised plan better than simply continuing?
- How should plan stability be balanced against adaptability?

These questions reinforce the engineering mindset behind planning and adaptive execution.

---

## Completion Criteria

AGT-05 is complete when you can confidently:

- explain agent planning and task decomposition
- construct plans with meaningful dependencies and constraints
- distinguish planning from runtime execution
- determine whether a plan remains valid
- distinguish local adaptation from full replanning
- verify and critique plans
- reason about plan quality and trade-offs
- design bounded adaptive planning behavior
- explain AGT-05's relationship with runtime, tools, state, workflows, and evaluation without confusing concept ownership

---

## Chapter Structure

```text
AGT-05/
├── README.md
├── 01-Task-Decomposition-and-Agent-Planning.md
├── 02-Plan-Execution-Replanning-and-Adaptation.md
└── 03-Verification-Critique-and-Plan-Quality.md
```

The README serves as the navigation and orientation layer.

Detailed teaching belongs in the three chapter files.
