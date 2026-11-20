# AGT-09 — Multi-Agent Systems

## 02 — Delegation, Supervision, and Agent Coordination

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain what delegation means in a multi-agent system.
- Distinguish delegation from simple capability or tool invocation.
- Define clear responsibility boundaries between delegating and receiving agents.
- Select an appropriate agent based on capability, responsibility, context, and constraints.
- Design a delegation contract that makes task ownership explicit.
- Explain what context and expected results should cross an agent boundary.
- Distinguish delegation from supervision.
- Design supervision mechanisms for progress, quality, timeout, and failure detection.
- Explain how coordination aligns multiple agents around sequencing, dependencies, synchronization, and shared objectives.
- Compare centralized, hierarchical, and peer coordination.
- Identify coordination bottlenecks and single-coordinator dependency risks.
- Recognize excessive handoffs, delegation loops, and deadlocks.
- Design practical mechanisms for conflict resolution and result aggregation.
- Reason about the trade-offs between coordination reliability and coordination overhead.
- Apply these concepts without depending on a particular agent framework.

---

## Prerequisites

This chapter assumes familiarity with:

- AGT-01 — Agent Foundations and Architecture
- AGT-02 — Agent Runtime and Execution
- AGT-03 — Tools, Actions, and Tool Use
- AGT-04 — Agent State, Context, and Memory
- AGT-05 — Task Decomposition and Planning
- AGT-06 — Workflow Orchestration
- AGT-07 — Human-in-the-Loop and Intervention
- AGT-08 — Agent Interoperability and Capability Interfaces
- AGT-09-01 — Single-Agent vs Multi-Agent Architecture

In particular, Lesson 01 established **why and when multiple agents may be justified**.

This chapter focuses on the next engineering problem:

> **Once multiple agents exist, how do they reliably work together?**

---

## Estimated Reading Time

**35–45 minutes**

---

## Before We Start

A multi-agent architecture does not become reliable simply because the agents have useful capabilities.

Once responsibilities are separated across agents, the system needs mechanisms for deciding:

- who performs a task,
- what responsibility is transferred,
- what information is provided,
- what result is expected,
- how progress is observed,
- how results are validated,
- how agents synchronize,
- how dependencies are handled,
- and what happens when coordination does not proceed as expected.

These mechanisms form three closely related concepts:

```text
Delegation
    ↓
Who should perform the responsibility?

Supervision
    ↓
Is the delegated responsibility progressing and producing an acceptable result?

Coordination
    ↓
How do multiple agents remain aligned while performing related responsibilities?
```

They solve different problems.

A system can delegate effectively but supervise poorly.

A system can supervise individual agents but coordinate their dependencies poorly.

A system can also have a sophisticated coordinator that creates unnecessary communication and becomes the system's bottleneck.

The goal is therefore not maximum coordination.

The goal is **sufficient coordination for the responsibilities and dependencies that actually exist**.

---

# Why This Exists

Consider a research system containing:

- a research agent,
- a data-analysis agent,
- a writing agent,
- and a review agent.

The architecture may look simple:

```text
                ┌────────────────────┐
                │  Supervising Agent  │
                └─────────┬──────────┘
                          │
          ┌───────────────┼────────────────┐
          ↓               ↓                ↓
   Research Agent   Analysis Agent   Writing Agent
          │               │                │
          └───────────────┼────────────────┘
                          ↓
                    Review Agent
```

But several engineering questions immediately appear.

### Delegation questions

- Why was this task assigned to the research agent?
- What exactly is the research agent responsible for?
- What context does it need?
- What result must it return?
- Can it delegate further?
- Who owns the final result?

### Supervision questions

- How does the supervising agent know whether the research is progressing?
- What if the agent takes too long?
- What if the result is incomplete?
- What if the output violates the expected contract?
- When should the task be retried?
- When should responsibility be reassigned?

### Coordination questions

- Does analysis depend on research?
- Can writing begin before analysis finishes?
- How are outputs passed between agents?
- What happens if two agents disagree?
- Who aggregates their results?
- What happens if the coordinator becomes unavailable?

These are not merely implementation details.

They are **architectural responsibilities**.

---

# Mental Model

A useful mental model is to treat every agent boundary as a responsibility boundary.

```text
┌──────────────────────┐
│   Delegating Agent   │
│                      │
│ Owns overall goal    │
└──────────┬───────────┘
           │
           │ delegation
           │
           ▼
┌──────────────────────┐
│    Receiving Agent   │
│                      │
│ Owns delegated task  │
└──────────┬───────────┘
           │
           │ result
           ▼
┌──────────────────────┐
│   Delegating Agent   │
│                      │
│ Validates / integrates│
└──────────────────────┘
```

Delegation does **not automatically transfer the entire objective**.

Instead, a delegating agent transfers responsibility for a defined piece of work while retaining whatever responsibility remains outside that boundary.

For example:

```text
Overall Objective
        │
        ├── Research
        │      └── delegated to Research Agent
        │
        ├── Analysis
        │      └── delegated to Analysis Agent
        │
        └── Final Recommendation
               └── retained by Supervising Agent
```

The most important question is therefore:

> **What exactly changed ownership when the delegation happened?**

If that cannot be answered clearly, the architecture probably has an unclear responsibility boundary.

---

# Core Concepts

## 1. Delegation

Delegation is the intentional transfer of responsibility for a defined task or sub-responsibility from one agent to another agent.

A useful abstraction is:

```text
Delegator
    │
    ├── selects responsibility
    ├── selects receiving agent
    ├── provides required context
    ├── defines expected result
    ├── transfers responsibility
    │
    ▼
Receiver
    │
    ├── performs responsibility
    ├── produces result
    └── returns result
    │
    ▼
Delegator
    │
    ├── receives result
    ├── validates result
    └── integrates or escalates
```

Delegation therefore involves more than saying:

> "Agent B, do this."

A reliable delegation boundary should make the responsibility understandable to both sides.

---

## 2. The Delegation Contract

A delegation contract defines the expectations surrounding a delegated task.

A practical delegation contract contains:

| Element | Question |
|---|---|
| Responsibility | What exactly is being delegated? |
| Receiving agent | Who is responsible for performing it? |
| Context | What information does the receiver need? |
| Constraints | What boundaries apply? |
| Expected result | What output is required? |
| Ownership | Who owns the result after completion? |
| Completion condition | When is the task considered complete? |
| Failure handling | What happens if execution fails? |
| Timeout | How long may the task remain active? |
| Escalation | When should responsibility return or move elsewhere? |

Conceptually:

```text
Delegation Contract

Delegator
   │
   ├── Responsibility
   ├── Context
   ├── Constraints
   ├── Expected Result
   ├── Completion Criteria
   ├── Timeout
   └── Failure / Escalation Rules
          │
          ▼
     Receiving Agent
```

A weak delegation contract creates hidden assumptions.

A strong delegation contract makes the responsibility boundary explicit.

---

# 3. Responsibility Transfer

Delegation is fundamentally about **responsibility**, not merely message passing.

Suppose Agent A asks Agent B:

> "Find the three strongest candidates from the supplied dataset and return the evidence supporting each choice."

Agent B now has responsibility for:

- examining the supplied dataset,
- applying the relevant selection criteria,
- producing the requested candidates,
- and returning supporting evidence.

Agent A still owns the broader objective.

The boundary might therefore look like:

```text
Agent A
──────────────────────────────────────
Owns:
- overall objective
- task assignment
- integration
- final decision
──────────────────────────────────────
              │
              │ delegated responsibility
              ▼
Agent B
──────────────────────────────────────
Owns:
- candidate selection
- evidence collection
- delegated result
──────────────────────────────────────
```

A delegation design should make this ownership explicit.

---

# 4. Delegation Does Not Mean Responsibility Disappears

A common misconception is:

> "Once Agent A delegates the task, Agent A is no longer responsible."

That is rarely correct at the system level.

Delegation usually means:

```text
Responsibility for execution
        ↓
Receiver

Responsibility for orchestration/integration
        ↓
Delegator
```

The exact ownership model depends on the architecture.

For example, a supervising agent may remain responsible for:

- deciding whether the delegated task was appropriate,
- monitoring progress,
- validating the returned result,
- resolving coordination problems,
- integrating the result,
- and deciding what happens next.

Therefore:

> **Delegation transfers defined execution responsibility; it does not automatically transfer overall system responsibility.**

---

# 5. Selecting the Right Agent

Delegation requires an agent-selection decision.

The question is not simply:

> "Which agent is available?"

It is:

> **"Which agent is appropriate for this responsibility under the current constraints?"**

Selection can consider:

- capability,
- domain expertise,
- required context,
- availability,
- latency,
- cost,
- authorization,
- reliability,
- expected quality,
- current workload,
- isolation requirements,
- and responsibility boundaries.

A conceptual selection function is:

```text
Task Requirements
       │
       ├── Required capability
       ├── Required context
       ├── Constraints
       ├── Quality target
       ├── Latency target
       └── Cost target
              │
              ▼
      Candidate Agents
              │
              ▼
       Agent Selection
```

The best agent is not necessarily the most capable agent.

A highly capable agent may be:

- too expensive,
- too slow,
- too broad,
- unavailable,
- unnecessary for the task,
- or inappropriate for the responsibility boundary.

---

# 6. Capability Matching

Capability matching means comparing the requirements of a delegated responsibility with the capabilities of candidate agents.

For example:

```text
Task:
"Analyze financial transaction anomalies."

Required capabilities:
- financial-domain reasoning
- structured-data analysis
- anomaly interpretation
- evidence generation

Candidate Agents:

Agent A
✓ Structured analysis
✗ Financial specialization

Agent B
✓ Structured analysis
✓ Financial specialization
✓ Evidence generation

Agent C
✓ General reasoning
✗ Structured-data capability
```

Agent B is the natural candidate because its capability set matches the responsibility.

This is different from simply choosing the strongest general-purpose agent.

---

# 7. Context Ownership

Delegation also creates a context question:

> **What context must cross the responsibility boundary?**

The receiving agent should obtain the information required to perform its responsibility.

That information may include:

- task description,
- relevant facts,
- previous results,
- constraints,
- expected output format,
- evaluation criteria,
- and references to required resources.

However, the delegating agent should avoid blindly transferring all available context.

Excessive context can cause:

- unnecessary token usage,
- increased latency,
- irrelevant information,
- privacy exposure,
- confusion,
- and tighter coupling.

A better principle is:

> **Transfer sufficient context for the delegated responsibility, not the entire internal state of the delegating agent.**

---

## 8. Result Ownership

Delegation also requires clarity about the returned result.

Suppose Agent B produces:

```text
Analysis Result
├── conclusion
├── evidence
├── uncertainty
└── recommendations
```

Agent A needs to know:

- what the result means,
- whether it satisfies the requested contract,
- whether additional validation is required,
- and whether Agent A may directly use it.

Result ownership should therefore be explicit.

```text
Agent B
   │
   │ produces
   ▼
Delegated Result
   │
   ▼
Agent A
   │
   ├── validate
   ├── accept
   ├── reject
   ├── request revision
   └── integrate
```

The receiving agent owns the delegated execution.

The delegating agent may still own final integration.

---

# 9. Delegation Depth

Delegation can itself become recursive.

```text
Agent A
   │
   ▼
Agent B
   │
   ▼
Agent C
   │
   ▼
Agent D
```

Some depth may be useful.

Unlimited delegation is dangerous.

Each additional layer introduces:

- more communication,
- more context transfer,
- more latency,
- more failure considerations,
- more difficult tracing,
- and more complicated ownership.

A practical architecture therefore defines delegation boundaries.

For example:

```text
Maximum Delegation Depth = 2

A
└── B
    └── C
```

Agent C cannot create another delegation chain.

The exact limit depends on the system, but the engineering principle is stable:

> **Delegation depth should be bounded deliberately.**

---

# 10. Delegation vs Tool or Capability Invocation

Delegating to another agent is not the same architectural operation as invoking a tool or capability.

A capability invocation is typically:

```text
Agent → Capability → Result
```

An agent-to-agent delegation may instead involve another responsibility-bearing component:

```text
Agent A
    │
    ▼
Agent B
    │
    ├── interpret context
    ├── make decisions
    ├── perform work
    ├── potentially invoke capabilities
    └── return result
```

The important distinction is not simply that one is "simple" and the other is "complex."

It is the **boundary being represented**:

```text
Capability / Tool
→ operation or capability boundary

Agent
→ responsibility and decision-making boundary
```

An agent may therefore use tools internally while remaining responsible for a delegated objective.

This distinction also prevents multi-agent architecture from being created merely by wrapping ordinary capabilities in agent-like interfaces.

---

# 11. Supervision

Delegation answers:

> **Who should perform the responsibility?**

Supervision answers:

> **How do we know the delegated responsibility is progressing and producing an acceptable result?**

These are different responsibilities.

```text
Delegation
    ↓
Assign responsibility

Supervision
    ↓
Observe and evaluate responsibility execution
```

Supervision can include:

- progress monitoring,
- completion monitoring,
- timeout detection,
- result inspection,
- quality checks,
- constraint checks,
- failure detection,
- retry decisions,
- reassignment,
- escalation,
- and termination of an unhealthy delegation.

The last item should be understood here as a **supervisory boundary**, not as a treatment of the broader termination architecture. Detailed termination coordination is covered in Lesson 03.

---

# 12. Supervision Is Not Continuous Micromanagement

A common mistake is assuming that supervision requires constant intervention.

It does not.

Excessive supervision can defeat the purpose of delegation.

For example:

```text
Supervisor
    │
    ├── inspect
    ├── modify
    ├── inspect
    ├── modify
    ├── inspect
    └── modify
          │
          ▼
       Worker
```

This can create:

- high communication overhead,
- reduced autonomy,
- coordinator bottlenecks,
- increased latency,
- and unnecessary coupling.

A better model is **bounded supervision**.

```text
Start
  │
  ▼
Delegate
  │
  ▼
Allow execution
  │
  ├── normal progress ──────────┐
  │                             │
  ├── timeout ────────→ inspect │
  │                             │
  ├── failure ────────→ inspect │
  │                             │
  └── completion ─────→ validate
                                │
                                ▼
                             Continue
```

The supervisor should intervene when meaningful conditions require intervention.

---

# 13. Progress Monitoring

Supervision needs observable signals.

Depending on the architecture, useful signals may include:

- task started,
- task accepted,
- progress checkpoint,
- intermediate result,
- completion,
- failure,
- timeout,
- retry,
- reassignment,
- or escalation.

The goal is not necessarily to observe every internal action.

Instead:

> **Observe enough to determine whether the delegated responsibility is healthy and on track.**

This distinction is important.

Over-observation creates overhead.

Under-observation creates blind spots.

---

## 14. Timeout

A delegated task should not necessarily remain active indefinitely.

A timeout establishes a boundary:

```text
Delegated Task
      │
      ├── completes before timeout
      │        ↓
      │      validate
      │
      └── exceeds timeout
               ↓
          supervision action
```

Possible supervisory actions include:

- inspect status,
- retry,
- extend the deadline,
- reassign,
- return partial result,
- degrade gracefully,
- or escalate.

Timeouts should not automatically imply failure.

A slow task may still be progressing.

Therefore:

> **Timeout is a supervision signal, not necessarily a proof of execution failure.**

Detailed failure propagation and degraded-operation design are addressed in Lesson 03.

---

# 15. Quality Checks

Completion does not automatically mean correctness.

An agent may return:

```text
Status = completed
```

while producing:

```text
Quality = unacceptable
```

Supervision should therefore distinguish:

```text
Execution Completion
        ≠
Acceptable Result
```

Quality checks may evaluate:

- required fields,
- expected structure,
- factual consistency,
- constraint compliance,
- evidence presence,
- confidence or uncertainty,
- domain-specific criteria,
- or downstream compatibility.

The exact evaluation mechanism belongs to the system's design.

---

# 16. Retry and Reassignment

When a delegated task does not produce an acceptable result, supervision may trigger recovery.

For example:

```text
Agent B
   │
   └── unsuccessful execution
          │
          ▼
      Supervisor
          │
     ┌────┴────┐
     ▼         ▼
   Retry     Reassign
     │         │
     ▼         ▼
   Agent B   Agent C
```

Retry and reassignment are not interchangeable.

### Retry

Retry means:

> Attempt the same responsibility again, typically under changed execution conditions.

Useful when the failure may be transient.

### Reassignment

Reassignment means:

> Transfer the responsibility to another capable agent.

Useful when the original agent is unavailable, unsuitable, repeatedly unsuccessful, or no longer appropriate.

The system should avoid blind retries.

Repeated retries can amplify:

- cost,
- latency,
- duplicate work,
- side effects,
- and congestion.

Detailed failure recovery strategies and failure propagation are covered in Lesson 03.

---

# 17. Escalation

Escalation moves a responsibility to a higher-level decision point when the current agent cannot safely or reliably resolve it.

Example:

```text
Worker Agent
     │
     │ cannot resolve ambiguity
     ▼
Supervisor Agent
     │
     │ evaluates
     ├── retry
     ├── reassign
     ├── request clarification
     └── escalate further
```

Escalation should have defined conditions.

Examples:

- repeated failure,
- conflicting results,
- missing required information,
- exceeded retry budget,
- unacceptable quality,
- authorization boundary,
- or unresolved dependency.

Escalation without boundaries can become an infinite chain.

---

# 18. Supervision Failure

The supervisor itself can become a coordination dependency.

For example:

```text
             Supervisor
             /        \
            /          \
           ▼            ▼
       Agent A       Agent B
```

If the supervisor becomes unavailable:

- new delegation may stop,
- result aggregation may stop,
- supervision signals may no longer be processed,
- and the system may lose its central coordination point.

The architectural question is therefore:

> **Does supervisor unavailability create an unacceptable dependency or bottleneck?**

Possible architectural responses include:

- reducing unnecessary central supervision,
- distributing some supervisory responsibilities,
- introducing redundancy where justified,
- or defining a controlled degraded coordination mode.

The detailed treatment of partial failure, failure propagation, recovery, isolation, and degraded operation belongs to Lesson 03.

---

# 19. Coordination

Delegation assigns responsibilities.

Supervision observes responsibilities.

Coordination aligns those responsibilities.

Coordination becomes necessary when agents have relationships such as:

- sequencing,
- dependency,
- synchronization,
- shared objectives,
- shared resources,
- overlapping responsibilities,
- result aggregation,
- or conflicting outputs.

A simple example:

```text
Research Agent
      │
      ▼
Analysis Agent
      │
      ▼
Writing Agent
      │
      ▼
Review Agent
```

The analysis agent depends on research.

The writing agent depends on analysis.

The review agent depends on the draft.

This is a coordination problem.

---

# 20. Coordination Dimensions

Coordination can be understood across several dimensions.

| Dimension | Coordination Question |
|---|---|
| Sequencing | What should happen first? |
| Dependency | What must be available before another task starts? |
| Synchronization | When should agents align? |
| Handoff | How does responsibility move between agents? |
| Aggregation | How are multiple outputs combined? |
| Conflict | What happens when agents disagree? |
| Resource conflict | What happens when agents need the same resource? |
| Shared objective | How are local actions aligned with the broader goal? |
| Coordination state | What information determines the current coordination status? |

These dimensions become increasingly important as the number of interacting agents grows.

---

## 21. Sequencing

Some responsibilities have strict ordering.

```text
Research
   ↓
Analysis
   ↓
Draft
   ↓
Review
```

The system should not allow the review agent to begin before the required draft exists.

Sequencing therefore establishes:

```text
Precondition
    ↓
Execution
    ↓
Result
    ↓
Next responsibility
```

Not every multi-agent system requires strict sequencing.

Independent tasks may execute concurrently.

---

# 22. Dependencies

A dependency exists when one agent requires something produced or established by another agent.

For example:

```text
Agent A
   │
   │ produces dataset
   ▼
Agent B
   │
   │ produces analysis
   ▼
Agent C
```

Agent B depends on Agent A.

Agent C depends on Agent B.

The system should explicitly represent these relationships where necessary.

Otherwise, agents may begin work with incomplete or invalid inputs.

---

# 23. Synchronization

Synchronization is required when multiple agents must reach a coordination point before the system can continue.

Example:

```text
             ┌── Agent A ──┐
             │             │
Start ───────┼── Agent B ──┼── Synchronization
             │             │
             └── Agent C ──┘
```

Suppose three agents independently analyze a dataset.

The aggregation step may require all three results.

The synchronization point therefore establishes:

> Continue only when the required participants have reached the expected coordination state.

However, waiting for every participant can be dangerous if one agent becomes unavailable.

Therefore synchronization requires policies around:

- required participants,
- optional participants,
- timeout,
- partial results,
- and degraded continuation.

Detailed communication failure, partial failure, and termination behavior are addressed in Lesson 03.

---

# 24. Aggregation

When multiple agents produce related outputs, another component may need to combine them.

For example:

```text
          ┌── Specialist A ──┐
          │                  │
          ├── Specialist B ──┤
          │                  │
          └── Specialist C ──┘
                   │
                   ▼
              Aggregator
                   │
                   ▼
              Final Result
```

Aggregation may involve:

- combining evidence,
- ranking results,
- resolving overlaps,
- selecting the strongest output,
- calculating consensus,
- or producing a synthesized result.

Aggregation is not automatically consensus.

A system should not force all agents to agree when disagreement itself is useful information.

---

# 25. Conflict Resolution

Independent agents can produce different results.

For example:

```text
Agent A → Recommendation X
Agent B → Recommendation Y
```

The system needs a defined way to handle disagreement.

Possible approaches include:

### Priority-based resolution

One agent has higher authority for a particular responsibility.

```text
Domain Specialist > Generalist
```

### Evidence-based resolution

Results are compared using explicit evidence or validation criteria.

### Aggregation

Multiple outputs are combined into a new result.

### Additional review

A separate agent evaluates the disagreement.

### Escalation

The disagreement is moved to a higher decision boundary.

The appropriate method depends on the architecture.

The key principle is:

> **Conflict should have an explicit resolution mechanism rather than being left to accidental ordering.**

---

# 26. Coordination Patterns

## Centralized Coordination

A central coordinator manages interactions.

```text
              Coordinator
             /     |      \
            /      |       \
           ▼       ▼        ▼
        Agent A  Agent B  Agent C
```

### Advantages

- clear control point,
- easier global visibility,
- simpler routing logic,
- easier policy enforcement.

### Risks

- coordinator bottleneck,
- coordinator dependency,
- communication concentration,
- increased impact if the coordinator becomes unavailable.

Centralized coordination is often attractive when coordination rules are relatively stable and centralized decision-making is useful.

---

# 27. Hierarchical Coordination

Coordination is distributed across levels.

```text
             Coordinator
             /         \
            ▼           ▼
       Supervisor A   Supervisor B
        /      \       /      \
       ▼        ▼     ▼        ▼
    Agent A  Agent B Agent C  Agent D
```

Each supervisor manages a subset of responsibilities.

### Advantages

- reduces direct coordination paths,
- supports domain ownership,
- can scale organizationally,
- allows local coordination.

### Risks

- hierarchy depth,
- propagation delays,
- hidden dependencies,
- supervisor bottlenecks,
- difficult cross-domain coordination.

Hierarchical coordination is useful when responsibilities naturally form groups.

---

# 28. Peer-to-Peer Coordination

Agents coordinate directly.

```text
      Agent A
       /   \
      /     \
 Agent B ─── Agent C
      \     /
       \   /
      Agent D
```

### Advantages

- fewer central dependencies,
- local autonomy,
- flexible collaboration.

### Risks

- coordination complexity,
- difficult global visibility,
- inconsistent decision-making,
- more communication paths,
- difficult debugging.

Peer-to-peer coordination can become expensive when many agents interact with many others.

---

# 29. Choosing a Coordination Pattern

The choice should depend on the actual coordination structure.

| Situation | Potentially suitable pattern |
|---|---|
| Strong central ownership | Centralized |
| Natural domain hierarchy | Hierarchical |
| Highly autonomous peer responsibilities | Peer-to-peer |
| Small number of agents | Any simple pattern |
| Large number of cross-dependent agents | Avoid uncontrolled peer-to-peer complexity |
| High need for global policy | Centralized or hierarchical |
| Strong local autonomy | Hierarchical or peer-to-peer |

This is not a fixed rule.

Architecture should follow responsibility and dependency structure.

---

## 30. Coordination Complexity

Lesson 01 established that adding agents can increase coordination cost.

This chapter extends that idea by examining the **shape of the coordination relationships**.

Suppose three agents can communicate directly:

```text
A ↔ B
A ↔ C
B ↔ C
```

As the number of agents grows, the number of potential pairwise relationships can grow rapidly if every agent can communicate directly with every other agent.

A rough conceptual model is:

```text
Potential pairwise relationships
≈ n(n - 1) / 2
```

This does not mean every architecture actually creates all these relationships.

A well-designed architecture can reduce the effective coordination surface through:

- hierarchy,
- shared interfaces,
- routing,
- aggregation,
- clear ownership,
- and bounded communication paths.

The engineering lesson is:

> **Control the coordination surface, not merely the number of agents.**

This is the operational extension of Lesson 01's broader principle that additional agents are justified only when their value exceeds their coordination cost.

---

# 31. Communication Overhead

Coordination requires communication.

Communication introduces:

- latency,
- serialization or representation costs,
- context transfer,
- message handling,
- retries,
- monitoring,
- and coordination overhead.

Therefore:

```text
More Coordination
       ↓
More Communication
       ↓
More Overhead
```

But less coordination is not automatically better.

Insufficient coordination can produce:

- duplicated work,
- conflicting outputs,
- missing dependencies,
- inconsistent coordination state,
- and invalid results.

The objective is therefore:

> **Minimum coordination necessary for correctness and reliability.**

---

# 32. Coordinator Bottlenecks

A coordinator may become overloaded.

```text
Agent A ──┐
Agent B ──┤
Agent C ──┤
Agent D ──┤
Agent E ──┼──► Coordinator
Agent F ──┤
Agent G ──┤
Agent H ──┤
Agent I ──┤
Agent J ──┘
```

The coordinator now handles:

- routing,
- synchronization,
- status,
- aggregation,
- conflict resolution,
- and potentially every intermediate message.

The architecture may be functionally correct but operationally inefficient.

A better design may move some local coordination closer to the relevant agents:

```text
              Global Coordinator
                 /          \
                ▼            ▼
        Domain Supervisor  Domain Supervisor
           /     \            /      \
          ▼       ▼          ▼        ▼
       Agent A Agent B    Agent C   Agent D
```

The goal is not to eliminate central coordination.

The goal is to ensure that the central coordinator owns only responsibilities that genuinely require global visibility.

---

# 33. Delegation Loops

Delegation can create circular responsibility.

```text
Agent A
   │
   ▼
Agent B
   │
   ▼
Agent C
   │
   └──────────► Agent A
```

For example:

- A delegates research to B.
- B delegates analysis to C.
- C determines that A should perform the analysis.
- A delegates it back to B.

The system can spend resources moving responsibility rather than executing it.

A delegation loop should therefore be detected or prevented through:

- delegation depth limits,
- ownership rules,
- task lineage,
- duplicate responsibility detection,
- or explicit routing constraints.

---

# 34. Repeated Handoffs

Even without a cycle, excessive handoffs can degrade the system.

```text
A → B → C → D → E → F
```

Each handoff can introduce:

- context transfer,
- latency,
- interpretation risk,
- ownership ambiguity,
- and additional coordination overhead.

A practical principle is:

> **Prefer meaningful responsibility boundaries over arbitrary agent boundaries.**

If two agents repeatedly exchange responsibility for the same task, the architecture may have an incorrect ownership boundary.

---

# 35. Deadlock

Deadlock occurs when agents wait for conditions that cannot become satisfied.

Example:

```text
Agent A
   │
   │ waits for B
   ▼
Agent B
   │
   │ waits for A
   ▼
Agent A
```

Neither can progress.

Deadlock can arise from:

- circular dependencies,
- resource ownership,
- synchronization barriers,
- or coordination protocols.

At the coordination-design level, useful preventive mechanisms include:

- dependency validation,
- bounded waiting,
- ownership rules,
- cycle detection,
- and explicit coordination timeouts.

The detailed treatment of multi-agent failure, recovery, failure propagation, and termination belongs to Lesson 03.

---

# 36. Supervision and Coordination Are Related but Different

It is useful to keep the distinction explicit.

```text
                 Multi-Agent System
                         │
          ┌──────────────┴──────────────┐
          │                             │
     Supervision                    Coordination
          │                             │
   "Is this agent                 "How do these agents
    doing its job?"                work together?"
          │                             │
   ├── progress                    ├── sequencing
   ├── timeout                     ├── dependencies
   ├── quality                     ├── synchronization
   ├── failure                     ├── handoffs
   └── escalation                  ├── aggregation
                                   └── conflict resolution
```

Supervision focuses on **health and acceptable execution**.

Coordination focuses on **alignment and interaction**.

A robust architecture needs both when the system's responsibilities require them.

---

# Internal Working

A useful generic execution model is:

```text
                     Overall Objective
                            │
                            ▼
                    Delegating Agent
                            │
                    Select Responsibility
                            │
                    Select Receiving Agent
                            │
                    Build Delegation Contract
                            │
                            ▼
                    Receiving Agent
                            │
                     Execute Responsibility
                            │
                ┌───────────┴───────────┐
                │                       │
             Progress                 Failure
                │                       │
                ▼                       ▼
          Supervision              Recovery Path
                │
                ▼
             Result
                │
                ▼
          Result Validation
                │
       ┌────────┴─────────┐
       │                  │
    Accept              Reject
       │                  │
       ▼                  ▼
  Integration       Retry/Reassign/
                    Escalate
```

When several delegated tasks interact, coordination becomes an additional layer:

```text
              Coordination Layer
              /       |       \
             /        |        \
            ▼         ▼         ▼
        Agent A    Agent B    Agent C
            \         |         /
             \        |        /
              ▼       ▼       ▼
                Aggregation
                    │
                    ▼
                Next Stage
```

This model is intentionally framework-independent.

A production implementation could use:

- direct in-process calls,
- APIs,
- message queues,
- event buses,
- workflow infrastructure,
- RPC,
- shared coordination state,
- or protocol-based communication.

The architectural responsibilities remain the same even when the implementation mechanism changes.

---

# Practical Example 1 — Supervisor and Specialist

Suppose a customer-support system needs to answer a complex billing question.

Agents:

- Support Supervisor
- Billing Specialist
- Policy Specialist

The supervisor determines that the question contains a billing-specific responsibility.

```text
Customer Question
       │
       ▼
Support Supervisor
       │
       │ delegates billing responsibility
       ▼
Billing Specialist
       │
       │ result
       ▼
Support Supervisor
       │
       │ validates and integrates
       ▼
Customer Response
```

The supervisor should not simply forward the entire customer conversation blindly.

It should provide the relevant context required for the billing responsibility.

A useful delegation contract might contain:

```text
Responsibility:
Determine whether the disputed charge is consistent
with the supplied account history.

Context:
- transaction history
- customer question
- applicable policy reference

Expected Result:
- determination
- supporting evidence
- uncertainty if evidence is insufficient

Completion:
Return a structured billing assessment.

Failure:
Return an explicit inability-to-determine result.
```

The supervisor retains responsibility for integrating the billing assessment into the final response.

---

# Practical Example 2 — Parallel Specialists

Suppose a research task requires three independent analyses.

```text
                 Supervisor
                 /    |    \
                /     |     \
               ▼      ▼      ▼
         Market     Legal   Technical
         Agent      Agent     Agent
               \      |      /
                \     |     /
                 ▼    ▼    ▼
                 Aggregator
                     │
                     ▼
                Final Result
```

This architecture can reduce latency because independent work can occur concurrently.

But it introduces coordination requirements:

- What inputs are shared?
- Which agents are mandatory?
- How long should the system wait?
- What happens if one agent fails?
- How are conflicting conclusions handled?
- Who aggregates the results?

Parallelism therefore creates value only when the work is genuinely independent enough to justify it.

---

# Practical Example 3 — Delegation Loop

Consider:

```text
Agent A
  │
  ▼
Agent B
  │
  ▼
Agent C
  │
  └──────► Agent A
```

Suppose each agent believes another agent is better suited to perform the task.

This is not productive specialization.

It is a routing failure.

Possible controls:

```text
Task ID
Delegation Lineage
Current Owner
Delegation Depth
Maximum Depth
Previous Owners
```

A routing decision can then detect:

```text
Current Agent = A
Previous Owner = A
```

and reject the delegation rather than continuing the cycle.

---

# Practical Example 4 — Repeated Handoff

Consider a writing task:

```text
Research Agent
      ↓
Writing Agent
      ↓
Review Agent
      ↓
Writing Agent
      ↓
Review Agent
      ↓
Writing Agent
```

Some iteration may be justified.

But if the same agents repeatedly exchange the same responsibility, the architecture should ask:

> Is the responsibility boundary correct?

Perhaps the review agent should return structured feedback rather than taking ownership of the document repeatedly.

For example:

```text
Writing Agent
      │
      ▼
Draft
      │
      ▼
Review Agent
      │
      ▼
Structured Review
      │
      ▼
Writing Agent
```

This is a cleaner responsibility model because:

- writing remains owned by the writing agent,
- review remains owned by the review agent,
- and feedback is returned rather than responsibility being repeatedly transferred.

---

# Practical Example 5 — Conflicting Specialist Results

Suppose three agents analyze the same problem.

```text
Agent A → Recommendation X
Agent B → Recommendation X
Agent C → Recommendation Y
```

A simplistic architecture might choose the majority result.

That may be wrong.

Instead, the aggregator could evaluate:

```text
Recommendation
Evidence
Confidence
Known Limitations
Domain Authority
```

Then:

```text
              Specialist Results
                /      |      \
               ▼       ▼       ▼
             A         B       C
                \      |      /
                 ▼     ▼     ▼
                 Aggregator
                      │
              Conflict Detected
                      │
             Evidence Comparison
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
     Resolve                  Escalate
```

The architecture should define how disagreement becomes a decision.

---

# Practical Example 6 — Coordinator Bottleneck

Suppose ten agents perform independent work, but every message must pass through one coordinator.

```text
Agent A ──┐
Agent B ──┤
Agent C ──┤
Agent D ──┤
Agent E ──┼──► Coordinator
Agent F ──┤
Agent G ──┤
Agent H ──┤
Agent I ──┤
Agent J ──┘
```

The coordinator now handles:

- routing,
- synchronization,
- status,
- aggregation,
- conflict resolution,
- and potentially every intermediate message.

The architecture may be functionally correct but operationally inefficient.

A better design may move some local coordination closer to the relevant agents:

```text
              Global Coordinator
                 /          \
                ▼            ▼
        Domain Supervisor  Domain Supervisor
           /     \            /      \
          ▼       ▼          ▼        ▼
       Agent A Agent B    Agent C   Agent D
```

The goal is not to eliminate central coordination.

The goal is to ensure that the central coordinator owns only responsibilities that genuinely require global visibility.

---

# Production Perspective

Production multi-agent systems should treat delegation and coordination as explicit architectural concerns.

A production design should be able to answer:

### Delegation

- Who can delegate?
- What can be delegated?
- Who can receive the responsibility?
- How is capability matching performed?
- What context crosses the boundary?
- What result is expected?
- What is the delegation depth limit?

### Supervision

- How is progress observed?
- What constitutes completion?
- What constitutes failure?
- What is the timeout policy?
- How is result quality checked?
- When is retry appropriate?
- When is reassignment appropriate?
- When is escalation required?

### Coordination

- Which dependencies exist?
- Which tasks can execute concurrently?
- Where are synchronization points?
- How are outputs aggregated?
- How are conflicts resolved?
- Which coordination responsibilities are centralized?
- Which can remain local?

### Architecture resilience

- Does the coordinator or supervisor become a critical dependency?
- Can coordination continue if a central component becomes unavailable?
- Which responsibilities require global coordination?
- Which can be handled locally?

Detailed multi-agent failure propagation, isolation, recovery, degraded operation, and termination are covered in Lesson 03.

These questions should be answered before production deployment rather than discovered during incidents.

---

## Engineering Decisions and Trade-offs

## 1. Rich Delegation Contract vs Lightweight Delegation

| Approach | Benefit | Cost |
|---|---|---|
| Lightweight | Low overhead | More ambiguity |
| Rich contract | Clear ownership and expectations | More design effort |
| Dynamic contract | Flexible | Harder to validate |
| Strict contract | Predictable | Less flexibility |

The right level depends on task criticality.

High-risk or high-value responsibilities generally justify clearer contracts.

---

## 2. Centralized vs Distributed Supervision

### Centralized

```text
Supervisor
   │
 ┌─┼─┐
 ▼ ▼ ▼
A  B  C
```

Advantages:

- global visibility,
- simpler policy enforcement,
- easier aggregation.

Costs:

- bottleneck,
- central dependency,
- increased communication.

### Distributed

```text
Supervisor A       Supervisor B
   │   │              │   │
   ▼   ▼              ▼   ▼
   A1  A2             B1  B2
```

Advantages:

- local autonomy,
- reduced central load,
- better domain locality.

Costs:

- harder global coordination,
- more complex coordination boundaries,
- potentially inconsistent policies.

---

## 3. Strict Synchronization vs Partial Progress

Strict synchronization:

```text
A ──┐
B ──┼──► Continue
C ──┘
```

The system waits for all required participants.

Partial progress:

```text
A ──►
B ──► Continue
C ──►
```

The system proceeds with available results.

Strict synchronization may provide stronger completeness.

Partial progress may provide better availability and latency.

The choice depends on whether missing results are:

- mandatory,
- optional,
- or recoverable.

---

## 4. More Supervision vs More Autonomy

More supervision can improve:

- visibility,
- quality control,
- failure detection.

But it can reduce:

- autonomy,
- throughput,
- scalability,
- and simplicity.

A useful design principle is:

> **Supervise at decision boundaries, health boundaries, and quality boundaries rather than observing every internal action without purpose.**

---

## 5. More Agents vs Better Coordination

A system can increase specialization:

```text
1 General Agent
      ↓
5 Specialized Agents
```

But the system may become slower and harder to operate:

```text
Specialization ↑
Coordination Cost ↑
Communication ↑
Coordination Surface ↑
```

Therefore:

> **Agent specialization creates value only when the value of separation exceeds the cost of coordination.**

This extends the architectural principle established in Lesson 01.

---

# Common Anti-Patterns

## 1. Delegating Without Ownership

```text
A → B
```

But nobody knows who owns the result.

### Why it fails

- unclear responsibility,
- difficult debugging,
- inconsistent completion criteria.

### Better

Define responsibility and result ownership explicitly.

---

## 2. Delegating Everything

A coordinator delegates even trivial work.

### Why it fails

Coordination overhead exceeds execution value.

### Better

Delegate only responsibilities where separation provides meaningful value.

---

## 3. Blind Retry

```text
Failure
  ↓
Retry
  ↓
Failure
  ↓
Retry
  ↓
Retry
```

### Why it fails

- cost explosion,
- repeated failure,
- duplicate work,
- possible side effects.

### Better

Use bounded retry with explicit recovery conditions.

---

## 4. Supervision as Micromanagement

The supervisor constantly interrupts agents.

### Why it fails

- communication overhead,
- reduced autonomy,
- increased latency,
- coordinator bottleneck.

### Better

Use bounded, event-driven supervision.

---

## 5. Unlimited Delegation Depth

```text
A → B → C → D → E → F → ...
```

### Why it fails

- difficult tracing,
- increasing latency,
- unclear ownership,
- recursive coordination.

### Better

Bound delegation depth.

---

## 6. Delegation Loops

```text
A → B → C → A
```

### Why it fails

The system performs routing instead of work.

### Better

Track task lineage and enforce ownership/routing constraints.

---

## 7. Excessive Handoffs

```text
A → B → C → D → E → F
```

### Why it fails

Each handoff adds coordination cost.

### Better

Establish stable responsibility boundaries.

---

## 8. Coordinator Does Everything

The coordinator:

- routes,
- validates,
- transforms,
- executes,
- aggregates,
- monitors,
- and resolves every interaction.

### Why it fails

The coordinator becomes the architecture.

### Better

Keep global responsibilities centralized only where global visibility is actually required.

---

## 9. Consensus Everywhere

Every agent must agree before the system proceeds.

### Why it fails

- latency,
- communication overhead,
- unnecessary coordination,
- false impression of certainty.

### Better

Use consensus only where disagreement materially affects the decision.

---

## 10. Hidden Coordination

Agents coordinate through undocumented assumptions.

### Why it fails

The system becomes difficult to reason about and modify.

### Better

Make important dependencies, ownership, and handoffs explicit.

---

# Common Mistakes and Misconceptions

### Misconception 1: Delegation means the delegator is no longer responsible.

Not necessarily.

Delegated execution responsibility and overall responsibility can remain different.

---

### Misconception 2: Supervision means watching every action.

No.

Effective supervision observes meaningful progress, health, completion, and quality signals.

---

### Misconception 3: More coordination means more reliability.

Not necessarily.

Coordination itself introduces overhead and failure opportunities.

---

### Misconception 4: Every specialist should communicate directly with every other specialist.

No.

Uncontrolled peer-to-peer communication can create unnecessary coordination complexity.

---

### Misconception 5: A completed task is automatically a successful task.

No.

Execution completion and acceptable result quality are different properties.

---

### Misconception 6: Retry is always safer than reassignment.

No.

Retry is useful for appropriate transient failures, while reassignment may be better when the agent itself is unsuitable or repeatedly failing.

---

### Misconception 7: Parallel agents are always faster.

No.

Parallel execution can reduce latency only when the work is sufficiently independent and coordination overhead does not dominate.

---

### Misconception 8: A coordinator is always necessary.

No.

Some systems can use hierarchical or peer coordination, or minimal coordination boundaries.

The architecture should match the responsibility structure.

---

## Security and Trust Considerations

Delegation creates additional boundaries where information and responsibility move between agents.

Relevant concerns include:

- exposing only necessary context,
- limiting access to delegated responsibilities,
- preventing unauthorized delegation,
- controlling which agents can invoke which responsibilities,
- protecting sensitive shared information,
- and validating untrusted outputs.

A useful principle is:

> **An agent should receive the minimum context and authority required for its delegated responsibility.**

Security architecture should remain consistent with the broader system's trust model.

Detailed protocol security belongs to AGT-08, while broader agent safety and containment are addressed in AGT-11 and enterprise governance/security in the enterprise domain.

---

## Architecture Review Checklist

Before approving a multi-agent delegation design, ask:

### Delegation

- Is the delegated responsibility clearly defined?
- Is the receiving agent appropriate?
- Does it have the required capability?
- Is sufficient context provided?
- Is unnecessary context excluded?
- Is the expected result explicit?
- Is result ownership clear?

### Supervision

- How is progress observed?
- What defines completion?
- What defines failure?
- What is the timeout policy?
- How is result quality checked?
- When is retry allowed?
- When is reassignment allowed?
- When does escalation occur?

### Coordination

- What dependencies exist?
- Which tasks are independent?
- Which tasks require synchronization?
- Where do handoffs occur?
- How are results aggregated?
- How are conflicts resolved?
- Is coordination centralized, hierarchical, or peer-to-peer?
- Why?

### Complexity

- Is delegation depth bounded?
- Are delegation loops prevented?
- Are repeated handoffs minimized?
- Could the coordinator become a bottleneck?
- Could agents deadlock?
- Is the coordination surface unnecessarily large?

---

## Interview Questions with Expected Answers

## 1. What is delegation in a multi-agent system?

**Expected answer:**

Delegation is the intentional transfer of responsibility for a defined task or sub-responsibility from one agent to another agent. A good delegation boundary defines the responsibility, receiving agent, required context, expected result, completion criteria, and failure handling.

---

## 2. What is the difference between delegation and supervision?

**Expected answer:**

Delegation determines **who should perform a responsibility**. Supervision determines **whether that responsibility is progressing and producing an acceptable result**.

---

## 3. What is the difference between an agent and a tool in this context?

**Expected answer:**

A tool or capability is primarily an operation or capability boundary that an agent invokes. An agent is a responsibility-bearing component that may interpret context, make decisions, perform multiple actions, and potentially delegate further work.

---

## 4. Why is a delegation contract important?

**Expected answer:**

It makes ownership and expectations explicit. It reduces ambiguity about what is being delegated, what context is required, what result is expected, and what happens if execution fails.

---

## 5. Why should context transfer be minimized?

**Expected answer:**

Because transferring unnecessary context increases latency, token usage, coupling, privacy exposure, and cognitive complexity. The receiving agent should receive sufficient context for its responsibility rather than the delegator's entire internal state.

---

## 6. Why can excessive supervision be harmful?

**Expected answer:**

Excessive supervision increases communication overhead, latency, coupling, and coordinator load while reducing agent autonomy. Supervision should focus on meaningful health, progress, completion, and quality boundaries.

---

## 7. What is the difference between retry and reassignment?

**Expected answer:**

Retry asks the same agent to attempt the responsibility again, usually when failure may be transient. Reassignment transfers the responsibility to another agent, typically when the original agent is unavailable, unsuitable, or repeatedly failing.

---

## 8. What is coordination?

**Expected answer:**

Coordination is the mechanism used to align multiple agents around sequencing, dependencies, synchronization, shared objectives, handoffs, aggregation, resource conflicts, and disagreement resolution.

---

## 9. Why can a coordinator become a bottleneck?

**Expected answer:**

If every interaction must pass through one coordinator, its processing and communication load can grow with the number of agents. It can become a throughput, latency, and availability constraint.

---

## 10. What is a delegation loop?

**Expected answer:**

A delegation loop occurs when responsibility repeatedly moves between agents without productive execution, such as A delegating to B, B to C, and C back to A. It can be controlled using task lineage, ownership rules, and bounded delegation depth.

---

## 11. How would you detect excessive handoffs?

**Expected answer:**

Track task lineage and responsibility transitions. If the same responsibility repeatedly changes owners or exceeds a reasonable handoff threshold, the system can flag the pattern for review or reject further delegation.

---

## 12. Why is consensus not always appropriate?

**Expected answer:**

Consensus adds communication and latency. If agents have different responsibilities or one agent has clear domain authority, forcing consensus can create unnecessary coordination without improving the decision.

---

## 13. How would you design a system where three agents independently analyze the same problem?

**Expected answer:**

I would first determine whether the analyses are genuinely independent. If they are, I could run them in parallel and use an aggregation step. I would define synchronization, timeout, partial-result policy, conflict resolution, and result validation rather than assuming that all three outputs will always be available or agree.

---

## Quick Revision

## Delegation

```text
Who should perform this responsibility?
```

## Delegation Contract

```text
Responsibility
      +
Context
      +
Expected Result
      +
Completion Criteria
      +
Failure Handling
```

## Supervision

```text
Is the delegated responsibility progressing
and producing an acceptable result?
```

## Coordination

```text
How do independent responsibilities
remain aligned?
```

## Key Coordination Problems

```text
Sequencing
Dependencies
Synchronization
Handoffs
Aggregation
Conflict Resolution
Resource Conflicts
```

## Major Anti-Patterns

```text
Delegation Loops
Excessive Handoffs
Coordinator Bottlenecks
Unlimited Delegation
Blind Retry
Micromanagement
Hidden Coordination
Consensus Everywhere
```

---

# Key Takeaways

1. **Delegation is a responsibility transfer, not merely a message exchange.**

2. **A delegation contract should make responsibility, context, expected result, and failure handling explicit.**

3. **The receiving agent should receive sufficient context for its responsibility, not necessarily the delegator's entire context.**

4. **Delegation transfers defined execution responsibility; it does not automatically eliminate the delegator's broader responsibility.**

5. **Supervision and delegation solve different problems.**
   - Delegation asks: **Who should perform the work?**
   - Supervision asks: **Is the work progressing and acceptable?**

6. **Supervision should be bounded rather than continuous micromanagement.**

7. **Completion does not necessarily mean success. Result quality must be evaluated where the architecture requires it.**

8. **Coordination aligns agents around dependencies, sequencing, synchronization, aggregation, and conflicts.**

9. **Centralized coordination provides global visibility but can create bottlenecks and central dependencies.**

10. **Hierarchical coordination can reduce coordination surface by grouping responsibilities.**

11. **Peer-to-peer coordination can preserve autonomy but may become complex as interaction relationships increase.**

12. **Delegation depth and handoffs should be bounded.**

13. **Delegation loops and deadlocks are architectural coordination failures, not merely implementation bugs.**

14. **More agents do not automatically produce better systems. More agents create more coordination responsibilities.**

15. **The goal is not maximum coordination. The goal is sufficient coordination for correctness, reliability, and useful autonomy.**

---

## Further Reading

Recommended conceptual areas for continued study:

- Distributed systems coordination
- Task routing and scheduling
- Supervisor-worker architectures
- Fault-tolerant distributed execution
- Dependency management
- Distributed consensus concepts
- Message-based system design
- Event-driven architectures
- Queue-based coordination
- Distributed tracing
- Reliability engineering

Framework-specific implementations should be studied only after the underlying architectural concepts are understood.

---

## Navigation

- [AGT-09 — Multi-Agent Systems](./README.md)
- [01 — Single-Agent vs Multi-Agent Architecture](./01-Single-Agent-vs-Multi-Agent-Architecture.md)
- **02 — Delegation, Supervision, and Agent Coordination**
- [03 — Multi-Agent State, Communication, Failure, and Termination](./03-Multi-Agent-State-Communication-Failure-and-Termination.md)

---

> **Core Principle**
>
> **Delegation separates responsibility. Supervision verifies responsibility. Coordination aligns responsibility.**
>
> A multi-agent system becomes reliable not by adding more agents, but by making the boundaries between those agents explicit, bounded, observable, and coordinated only where necessary.
