# Human-in-the-Loop and Intervention Patterns

## Learning Objectives

After completing this chapter, you should be able to:

- Explain why human control is needed in autonomous agent systems.
- Distinguish agent autonomy from human oversight.
- Explain the concepts of:
  - Human-in-the-Loop (HITL)
  - Human-on-the-Loop (HOTL)
  - Human-over-the-Loop, where useful
- Distinguish observation from intervention.
- Identify appropriate points at which a human can observe or intervene in agent execution.
- Explain the difference between:
  - review,
  - approval,
  - rejection,
  - redirection,
  - escalation,
  - override,
  - takeover.
- Design intervention patterns around the timing of agent actions.
- Compare synchronous and asynchronous human involvement.
- Understand the trade-offs between human control, autonomy, latency, workload, and operational cost.
- Recognize situations where human involvement improves control.
- Recognize situations where excessive human involvement reduces system effectiveness.
- Explain why human control is an architectural concern rather than merely a UI feature.
- Distinguish human-control requirements from the workflow durability mechanisms owned by AGT-06.

---

## Prerequisites

Before reading this chapter, you should understand:

- What an agent is.
- How an agent makes decisions and takes actions.
- The concept of bounded autonomy.
- Basic agent execution flow.
- Tool invocation at a conceptual level.
- The difference between an agent's internal decision process and its externally observable actions.

You should also understand that AGT-07 is concerned with **human control of agent behavior**, not with implementing the underlying agent runtime.

---

## Estimated Reading Time

**25–35 minutes**

---

## Before We Start

Consider an agent responsible for handling customer support requests.

A simple request might be:

```text
Customer asks:
"Can you change my delivery address?"

Agent:
Understand request
    ↓
Check account
    ↓
Determine whether address change is allowed
    ↓
Update address
    ↓
Confirm to customer
```

For a low-impact operation, fully autonomous execution may be reasonable.

Now consider a different request:

```text
Customer asks:
"Close my account and transfer the remaining balance."
```

The same autonomous pattern may no longer be appropriate.

The system may need a human to:

- review the proposed action,
- verify the circumstances,
- approve or reject the action,
- modify the proposed response,
- or take control of the interaction.

The important engineering question is not:

> "Can we add a human approval button?"

The more useful question is:

> **Where should autonomous agent behavior stop, and where should human control begin?**

That question is the foundation of this chapter.

---

# Why This Exists

## The Problem With Unbounded Autonomy

An autonomous agent can make decisions and perform actions without requiring a human for every step.

This is valuable because requiring humans to manually direct every action would eliminate much of the benefit of agent automation.

However, autonomy creates another problem:

> **The agent may eventually encounter a situation where automated decision-making is not sufficient.**

This can happen because:

- the situation is ambiguous,
- the consequences are significant,
- the agent lacks sufficient authority,
- the requested action is outside normal operating conditions,
- the agent encounters unexpected information,
- the user's intent is unclear,
- the action requires human judgment,
- the system cannot confidently determine the correct next step,
- or the agent reaches a boundary beyond which autonomous execution should not continue.

A production system therefore needs more than an autonomous execution path.

It needs **control points**.

---

## Human Control as an Architectural Mechanism

Human control is sometimes treated as a user-interface problem:

```text
Agent
  ↓
"Approve?" button
  ↓
Human clicks
  ↓
Continue
```

That model is incomplete.

The important architectural questions are:

```text
What requires human attention?
        ↓
When is human attention required?
        ↓
Who is allowed to intervene?
        ↓
What information do they receive?
        ↓
What decisions can they make?
        ↓
What happens after the decision?
        ↓
What happens if nobody responds?
```

The interface is only one part of the system.

The actual control mechanism includes:

- control boundaries,
- authority,
- intervention timing,
- decision semantics,
- execution behavior,
- escalation,
- fallback behavior,
- and accountability.

This is why human control belongs in system architecture.

---

# Mental Model

A useful mental model is to think of the agent as operating inside a **control boundary**.

```text
                 HUMAN CONTROL
        ┌──────────────────────────────┐
        │                              │
        │  Observe                     │
        │  Review                      │
        │  Intervene                   │
        │  Approve / Reject            │
        │  Redirect                    │
        │  Escalate                    │
        │  Override                    │
        │  Take Over                   │
        │                              │
        └──────────────┬───────────────┘
                       │
                       │ Control Boundary
                       ▼
        ┌──────────────────────────────┐
        │         AGENT SYSTEM         │
        │                              │
        │  Decide → Act → Observe      │
        │       → Continue             │
        │                              │
        └──────────────────────────────┘
```

The goal is not to place a human inside every agent step.

The goal is to define **where human judgment or authority materially matters**.

This leads to an important principle:

> **Human control should be intentional, not accidental.**

---

# Core Concepts

## 1. Agent Autonomy

Agent autonomy is the ability of an agent to make decisions and perform actions without requiring a human to direct every individual step.

For example:

```text
User:
"Find three suitable meeting times and schedule one."

Agent:
Understand request
    ↓
Check calendars
    ↓
Find candidate times
    ↓
Select a suitable time
    ↓
Schedule meeting
    ↓
Notify participants
```

If the system is designed to permit these actions autonomously, the agent can complete the workflow without human intervention at each step.

Autonomy improves:

- speed,
- scalability,
- operational efficiency,
- responsiveness,
- and reduction of repetitive human work.

But autonomy is not an absolute property.

An agent can be autonomous for some actions and require human control for others.

Therefore:

> **Autonomy should be bounded by explicit control boundaries.**

---

## 2. Human Oversight

Human oversight means that a human has a defined role in observing, reviewing, supervising, or controlling agent behavior.

Oversight does not necessarily mean that the human must approve every action.

For example:

```text
Agent
  │
  ├── Action A → execute autonomously
  ├── Action B → execute autonomously
  ├── Action C → notify human
  └── Action D → require human intervention
```

The human may therefore supervise the system without becoming part of every execution step.

This distinction is important because **oversight and direct participation are not the same thing**.

---

## 3. Human-in-the-Loop (HITL)

Human-in-the-Loop describes a control pattern in which a human participates in an agent's decision or action before the agent can proceed through the relevant control point.

A simplified pattern is:

```text
Agent reaches control point
          ↓
Human reviews
          ↓
Human decision
     ┌────┴────┐
     ↓         ↓
  Continue    Do not continue
```

The human is therefore part of the execution decision at that point.

For example:

```text
Agent:
Prepare production configuration change
        ↓
Human review
        ↓
Approved
        ↓
Agent proceeds
```

HITL can be useful when:

- human judgment is materially important,
- consequences are significant,
- ambiguity cannot be resolved reliably by automation,
- the action requires explicit human authority,
- or the organization deliberately wants a human decision at a particular point.

HITL does **not** mean every agent action requires approval.

The control point must be intentionally selected.

---

## 4. Human-on-the-Loop (HOTL)

Human-on-the-Loop describes a pattern in which the agent operates with greater autonomy while a human monitors its behavior and can intervene when necessary.

A simplified model is:

```text
                Human
               Observe
                  │
                  │
                  ▼
Agent → Act → Observe → Continue
  │                    │
  │                    │
  └─────── Intervention ────────┘
```

Unlike a strict HITL pattern, the human does not necessarily participate in every decision.

The agent may continue operating until:

- a human identifies a problem,
- an intervention condition is triggered,
- an unexpected situation occurs,
- or the human determines that control is required.

HOTL can therefore support higher automation while retaining a human intervention path.

---

## 5. Human-over-the-Loop

Human-over-the-Loop can be used to describe a higher-level supervisory pattern in which humans oversee broader agent behavior, policies, or groups of autonomous processes rather than participating directly in individual actions.

For example:

```text
                 Human Supervisor
                       │
          ┌────────────┼────────────┐
          │            │            │
       Agent A       Agent B      Agent C
          │            │            │
      Autonomous    Autonomous    Autonomous
```

The exact terminology and formal boundary between HITL, HOTL, and human-over-the-loop can vary across organizations and literature.

For AGT-07, the important engineering distinction is the **degree and timing of human involvement**, rather than treating these labels as universal formal standards.

---

# 6. Observation vs Intervention

One of the most important distinctions in human control is:

> **Observing an agent is not the same as controlling an agent.**

### Observation

Observation means that a human can inspect what the agent is doing or has done.

For example:

```text
Agent:
Processing customer request...

Human:
Can see current status.
```

The agent may continue without requiring a human decision.

### Intervention

Intervention means that the human can affect what the agent does.

For example:

```text
Agent:
About to send response.

Human:
Stop.
Change response.
Redirect agent.
Take over.
```

A system can therefore support:

```text
Observation without intervention
```

or:

```text
Observation with intervention capability
```

These are different control designs.

A useful control relationship is:

```text
Observation
    ↓
Condition detected
    ↓
Intervention capability
    ↓
Human decision
    ↓
Execution consequence
```

Observation alone provides visibility. Intervention provides control.

---

# 7. Review Points

A **review point** is an intentionally defined point where human inspection or decision-making can occur.

A review point might be introduced:

```text
Before an action
```

```text
During execution
```

or:

```text
After an action
```

The placement matters because the timing determines what the human can actually control.

For example:

```text
Before action:

Agent → Review → Action
```

allows the human to prevent the action.

Whereas:

```text
Action → Review
```

allows the human to inspect the result but does not prevent the original action.

Therefore:

> **A review point is only useful for a control objective if it occurs early enough to influence the relevant behavior.**

---

# 8. Intervention

Intervention is the act of changing or interrupting agent behavior because human involvement is required.

Possible intervention forms include:

- stop,
- pause,
- reject,
- redirect,
- modify,
- take over,
- escalate,
- or override.

Intervention should have defined semantics.

For example:

```text
Human selects "Stop"
```

should not leave the system ambiguous about whether:

- the current action stops,
- the entire workflow stops,
- future actions are prevented,
- the agent can restart automatically,
- or a new human decision is required.

The exact execution mechanics belong to the workflow and runtime systems, but AGT-07 defines the **human-control meaning of the intervention**.

---

# 9. Human Takeover

Human takeover occurs when control of the interaction or task is transferred from the agent to a human.

For example:

```text
Customer
   │
   ▼
Agent
   │
   │ Unable to safely continue
   ▼
Human takeover
   │
   ▼
Human handles interaction
```

Takeover is different from an override.

- **Takeover** transfers active control of the relevant task or interaction to the human.
- **Override** supersedes a specific agent decision or behavior without necessarily transferring the entire task to the human.

Takeover may be appropriate when:

- the agent cannot resolve ambiguity,
- the customer explicitly requests a human,
- the agent reaches a defined control boundary,
- the situation requires judgment beyond the agent's authority,
- or continued autonomous operation would create unacceptable risk or poor user experience.

---

# 10. Pause and Resume From the Human-Control Perspective

A human may need to temporarily stop an agent from continuing.

From the human-control perspective:

```text
Agent running
      ↓
Human intervention
      ↓
Pause
      ↓
Human review / decision
      ↓
Resume / redirect / terminate
```

AGT-07 owns the **human-control decision and semantics** to pause, continue, redirect, or terminate.

The underlying mechanics of:

- checkpointing,
- persistence,
- durable execution,
- state recovery,
- and resumption

belong to AGT-06.

This distinction is important.

AGT-07 answers:

> **Why and when should human control interrupt execution?**

AGT-06 answers:

> **How does the workflow safely persist and resume execution?**

---

# 11. Approval

Approval is a human decision that authorizes a proposed action to proceed through a defined control boundary.

Approval should be understood as a **control decision**, not merely a UI action.

Conceptually:

```text
Agent proposes action
        ↓
Human reviews
        ↓
Approval decision
        ↓
Agent may proceed
```

Approval does not by itself define the complete authorization model.

The system must still establish:

- who is authorized to make the decision,
- what action the decision applies to,
- and what execution behavior follows the decision.

Detailed approval boundaries, risk classification, authorization scope, approval expiration, and high-risk action handling are covered in:

[Approval Boundaries, Escalation, and High-Risk Actions](./02-Approval-Boundaries-Escalation-and-High-Risk-Actions.md)

---

# 12. Rejection

Rejection is a valid human-control outcome.

For example:

```text
Agent proposes action
        ↓
Human reviews
        ↓
Reject
        ↓
Agent does not proceed with that action
```

Rejection does not necessarily mean the entire agent task has failed.

Depending on system design, rejection may result in:

- stopping the action,
- modifying the proposed action,
- returning to an earlier decision point,
- requesting clarification,
- escalating,
- or ending the task.

The important principle is:

> **Rejection must have explicit system semantics.**

The agent should not implicitly interpret rejection as permission to keep retrying until approval is eventually obtained.

Detailed approval-denial behavior is covered in File 02.

---

# 13. Redirection

Redirection occurs when a human changes the direction of agent behavior without necessarily taking over the entire task.

For example:

```text
User:
"Find a solution and implement it."

Agent:
Prepares implementation plan.

Human:
"Do not implement yet. Prepare a comparison of alternatives."

Agent:
Changes direction.
```

The human has changed the agent's intended course.

Redirection is useful when the agent remains capable of continuing but needs a different objective, constraint, or action.

---

# 14. Escalation

Escalation means transferring a decision or situation to a person with appropriate authority, expertise, or responsibility.

For example:

```text
Agent encounters ambiguity
        ↓
Cannot confidently continue
        ↓
Escalate
        ↓
Appropriate human reviews
```

Escalation is not necessarily a system failure.

A well-designed agent system can intentionally use escalation as part of its normal operating model.

Examples include:

- ambiguous user intent,
- insufficient authority,
- unexpected conditions,
- repeated unsuccessful attempts,
- conflicting instructions,
- or situations requiring human judgment.

Detailed escalation rules, thresholds, approver selection, and high-risk escalation patterns are covered in File 02.

---

# 15. Override

An override is an authorized human action that supersedes the agent's current decision or behavior.

For example:

```text
Agent:
Continue with proposed operation.

Authorized Human:
Override.
Stop the operation.
```

Override is stronger than ordinary observation.

It should therefore have clear authority boundaries.

Not every human interacting with an agent should automatically have the ability to override it.

The system should distinguish:

```text
User interaction
        ≠
Human review
        ≠
Authorized override
```

This distinction becomes especially important in production systems.

Detailed authorization scope and high-risk override considerations are covered in File 02.

---

# 16. Control Boundaries

A control boundary defines where autonomous agent behavior is constrained by a human decision or authority requirement.

For example:

```text
Autonomous actions
      │
      ▼
┌─────────────────────┐
│ Human Control Point │
└──────────┬──────────┘
           │
           ▼
Further autonomous actions
```

A control boundary should have clear semantics.

At minimum, the system should be able to determine:

- what behavior is being controlled,
- when control applies,
- what human decision is required,
- what authority the human has,
- and what happens after the decision.

Without these definitions, a system may appear to have human oversight while still allowing the agent to bypass the intended control.

Detailed approval-boundary design and authorization rules are covered in File 02.

---

# Intervention Timing

Human intervention can occur at different points in agent execution.

## Before an Action

```text
Agent decides
    ↓
Human intervention
    ↓
Action
```

This provides the strongest opportunity to prevent the action.

It is useful when the primary objective is:

> "Do not allow this action without human involvement."

The cost is increased latency and human workload.

---

## During Execution

```text
Agent starts execution
        ↓
Human observes
        ↓
Intervention if required
        ↓
Continue / redirect / stop
```

This can provide a balance between autonomy and control.

However, intervention may arrive after the agent has already produced some external effects.

Therefore, the system must understand what can still be changed.

---

## After an Action

```text
Agent acts
    ↓
Human reviews
    ↓
Accept / correct / escalate
```

This is useful when the goal is inspection, correction, or accountability rather than prevention.

It cannot provide the same preventive control as a pre-action intervention point.

---

# Intervention Granularity

Human control can be applied at different levels.

### Step-Level Intervention

```text
Agent
  ↓
Action 1
  ↓
Human
  ↓
Action 2
```

The human controls individual actions.

This provides strong control but can create substantial operational overhead.

---

### Task-Level Intervention

```text
Agent executes task
        ↓
Human reviews task
        ↓
Continue / modify / stop
```

The human controls a larger unit of work.

This reduces interaction frequency but provides less granular control.

---

### Workflow-Level Intervention

```text
Workflow
   ├── Stage A
   ├── Stage B
   ├── Stage C
   └── Stage D
          ↑
     Human control
```

The human may intervene at major workflow boundaries.

This can be useful when individual agent steps do not require review but major transitions do.

---

### System-Level Oversight

A human may supervise the overall operation of an agent system rather than individual tasks.

```text
                 Human
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
     Agent A    Agent B    Agent C
```

This is closer to an oversight model than direct participation.

The correct granularity depends on the control objective.

---

# Synchronous and Asynchronous Human Involvement

Human involvement can also be distinguished by whether the agent must wait for the human decision.

## Synchronous Human Control

The agent waits for the human decision.

```text
Agent
  ↓
Human review
  ↓
Wait
  ↓
Decision
  ↓
Continue
```

Advantages:

- straightforward control semantics,
- immediate decision before continuation,
- strong control over the next action.

Costs:

- latency,
- dependency on human availability,
- possible workflow blockage.

---

## Asynchronous Human Control

The human interaction occurs separately from the agent's active execution context.

For example:

```text
Agent
  ↓
Creates review request
  ↓
System enters defined control state
  ↓
Human reviews later
  ↓
Decision
  ↓
System continues or changes course
```

Asynchronous control can be useful when:

- humans are not continuously available,
- work occurs over long periods,
- the human does not need to remain connected,
- or the system can safely wait for a later decision.

It also introduces additional design questions around:

- changed conditions,
- decision validity,
- human availability,
- and continuation semantics.

Detailed approval expiration, revocation, and timeout behavior are covered in File 02.

---

# Choosing Where Human Control Belongs

Human control should not be added simply because a system contains an agent.

A useful design process is:

```text
Identify agent action
        ↓
Understand consequence
        ↓
Determine required human judgment
        ↓
Select control point
        ↓
Define intervention semantics
        ↓
Define human authority
        ↓
Define behavior after intervention
```

The control point should exist for a specific engineering reason.

Examples include:

| Situation | Possible Control Pattern |
|---|---|
| Low-impact routine action | Autonomous execution |
| Human needs visibility but not participation | Observation |
| Human may need to stop agent | HOTL-style intervention |
| Human decision is required before proceeding | HITL |
| Agent cannot resolve ambiguity | Escalation |
| Human needs to change direction | Redirection |
| Authorized person must supersede agent | Override |
| Human must handle the interaction directly | Takeover |

These are patterns rather than universal rules. The appropriate choice depends on the system's control requirements.

---

# When Human Control Helps

Human control can improve a system when human judgment provides meaningful value.

Examples include:

### Ambiguous Situations

The agent cannot confidently determine the user's intent.

```text
User request
     ↓
Agent detects ambiguity
     ↓
Human clarification
     ↓
Continue
```

### Exceptional Situations

The situation falls outside normal operating conditions.

```text
Normal case → Autonomous
Exception   → Human intervention
```

### Consequential Decisions

The consequences of an incorrect decision are sufficiently significant that human judgment is required.

### Authority Boundaries

The agent can identify an action but does not have sufficient authority to perform it autonomously.

### User Preference

A user explicitly requests human assistance.

In each case, human involvement exists for a specific control purpose.

---

# When Human Control Becomes Harmful

More human involvement is not automatically better.

Excessive intervention can create:

- latency,
- approval fatigue,
- operational bottlenecks,
- unnecessary workload,
- reduced automation value,
- inconsistent decisions,
- poor user experience,
- and reduced trust in the system.

Consider:

```text
100 routine agent actions
        ↓
100 human approvals
        ↓
Human workload becomes the bottleneck
```

The system may technically have more human control, but it may be a worse production system.

This leads to an important engineering principle:

> **The goal is appropriate human control, not maximum human involvement.**

---

# Approval Fatigue

Approval fatigue occurs when humans receive too many review or approval requests.

A common pattern is:

```text
Too many approvals
       ↓
Human overload
       ↓
Faster superficial decisions
       ↓
Rubber-stamping / ignoring
       ↓
Control quality decreases
```

This is particularly dangerous because the system may appear highly controlled while the actual quality of human oversight is deteriorating.

Approval requests should therefore be reserved for decisions where human judgment materially improves:

- control,
- accountability,
- decision quality,
- or risk management.

Detailed approval-boundary design is covered in File 02.

---

# Human Control vs Automation

The engineering objective can be viewed as a balance:

```text
Less Human Control
        │
        │ Higher autonomy
        │ Lower latency
        │ Lower human workload
        │
        ▼
   Appropriate
     Control
        ▲
        │ Higher oversight
        │ Higher human workload
        │ Higher latency
        │
More Human Control
```

Neither extreme is universally correct.

### Too Little Human Control

Potential consequences include:

- excessive autonomy,
- weak intervention capability,
- difficult recovery from unexpected decisions,
- poor accountability,
- and greater impact when the agent behaves incorrectly.

### Too Much Human Control

Potential consequences include:

- excessive latency,
- approval bottlenecks,
- reduced automation,
- human overload,
- approval fatigue,
- and poor user experience.

Good engineering therefore asks:

> **What is the minimum human involvement that provides the required control?**

---

# Practical Examples

## Example 1 — Customer Support

Suppose an agent handles customer requests.

### Normal request

```text
Customer
   ↓
Agent
   ↓
Resolve request
   ↓
Respond
```

No human intervention is required.

### Ambiguous request

```text
Customer
   ↓
Agent detects ambiguity
   ↓
Escalate
   ↓
Human clarifies
   ↓
Agent / Human continues
```

The human is introduced because the agent cannot confidently determine the correct course.

---

## Example 2 — Production Change

An agent monitors a production system and identifies a configuration problem.

```text
Agent detects problem
        ↓
Proposes configuration change
        ↓
Human review
        ↓
Decision
```

The human-control point exists because the action has meaningful external consequences.

The detailed definition of approval scope and high-risk action handling belongs to File 02.

---

## Example 3 — Human Takeover in Customer Interaction

```text
Customer
    ↓
Agent
    ↓
Multiple unsuccessful attempts
    ↓
Human takeover
    ↓
Human handles interaction
```

The agent is not necessarily "broken."

The system has reached a condition where human judgment provides more value than continued autonomous execution.

---

## Example 4 — Redirection

```text
User:
"Find a solution and implement it."

Agent:
Prepares implementation plan.

Human:
"Do not implement yet. Prepare a comparison of alternatives."

Agent:
Changes direction.
```

The human has redirected the agent without necessarily taking over the entire task.

---

# Production Perspective

Human-control designs that work in a demonstration can fail in production if operational conditions are ignored.

Important production concerns include:

## Human Availability

What happens if the required human is unavailable?

```text
Agent reaches control point
        ↓
Human unavailable
        ↓
What happens?
```

Possible system behaviors depend on the control requirement and may include:

- waiting,
- escalation,
- safe fallback,
- cancellation,
- or termination.

The correct behavior must be explicitly designed.

---

## Latency

Human decisions introduce latency.

For interactive systems, even a small delay may affect user experience.

For long-running processes, the same delay may be acceptable.

Therefore:

> **Human-control timing must be designed in relation to the workflow's latency requirements.**

---

## Workload

A control mechanism that requires humans to review thousands of events per day may be operationally unrealistic.

The system should consider:

- review frequency,
- expected workload,
- decision complexity,
- and the availability of qualified reviewers.

---

## Authority

The system must distinguish between:

```text
Person who can observe
```

and:

```text
Person authorized to control
```

A production system should not assume that every user has the same intervention authority.

---

## Traceability

Human decisions should be attributable to the relevant control event.

For example:

```text
Agent proposed action
        ↓
Human decision
        ↓
Decision applied
        ↓
Agent continued
```

The system should be able to reconstruct the control relationship when required.

Detailed enterprise audit and compliance requirements remain outside AGT-07.

---

## Control-Plane Availability

If the agent depends on human control but the human-control mechanism itself is unavailable, the agent needs a defined behavior.

For example:

```text
Agent requires intervention
        ↓
Control mechanism unavailable
        ↓
Continue?
Wait?
Escalate?
Stop?
```

The correct answer depends on the control requirement.

A production system should never leave this behavior undefined.

---

# Engineering Decisions and Trade-offs

## Trade-off 1 — More vs Fewer Human Interventions

| More Intervention | Fewer Intervention |
|---|---|
| Higher oversight | Higher autonomy |
| Lower agent freedom | Lower human workload |
| Higher latency | Lower latency |
| More operational cost | Greater reliance on automation |
| Potential approval fatigue | Greater consequence if autonomy is misconfigured |

The correct choice depends on the control objective.

---

## Trade-off 2 — Synchronous vs Asynchronous

| Synchronous | Asynchronous |
|---|---|
| Human decision blocks continuation | Human decision may occur later |
| Simple control semantics | More workflow complexity |
| Immediate decision | Better support for long-running work |
| Higher availability dependency | Requires explicit validity/continuation handling |

---

## Trade-off 3 — Step-Level vs Task-Level Control

| Step-Level | Task-Level |
|---|---|
| Fine-grained control | Lower human workload |
| More intervention points | Less granular |
| Higher latency | Higher autonomy |
| Greater review burden | Greater reliance on agent execution |

---

## Trade-off 4 — Observation vs Direct Intervention

Observation provides visibility without necessarily blocking execution.

Direct intervention provides stronger control but requires additional authority and operational mechanisms.

The design should therefore distinguish:

```text
"I need to know what the agent is doing."
```

from:

```text
"I need the ability to stop or change what the agent is doing."
```

These are different requirements.

---

## Trade-off 5 — Automation vs Human Judgment

Automation is generally valuable when:

- the action is routine,
- the expected behavior is well understood,
- the consequences are manageable,
- and human judgment adds little value.

Human control becomes more valuable when:

- the situation is ambiguous,
- consequences are significant,
- authority is limited,
- or the decision requires judgment that automation cannot reliably provide.

This is a judgment problem, not a simple rule that "humans are safer" or "automation is better."

---

# Common Mistakes and Misconceptions

## Misconception 1 — HITL Means Approve Everything

Incorrect.

HITL means that a human participates at defined control points.

A well-designed agent can still perform many actions autonomously.

---

## Misconception 2 — More Approvals Always Mean More Safety

Incorrect.

Excessive approvals can create:

- fatigue,
- bottlenecks,
- superficial decisions,
- and reduced control quality.

The objective is appropriate control.

---

## Misconception 3 — Human Control Is Just a UI Feature

Incorrect.

A UI may expose human control, but the architecture must define:

- authority,
- timing,
- intervention semantics,
- continuation behavior,
- and failure behavior.

---

## Misconception 4 — Any User Can Override an Agent

Incorrect.

Observation, interaction, approval, and override can require different levels of authority.

---

## Misconception 5 — HOTL Means No Human Control

Incorrect.

HOTL generally means that the agent operates more autonomously while a human retains an observation and intervention role.

---

## Misconception 6 — Rejection Means the Agent Has Failed

Incorrect.

Rejection can be a normal human-control outcome.

The system may respond by:

- stopping,
- modifying,
- redirecting,
- escalating,
- or requesting clarification.

---

## Misconception 7 — Escalation Means the System Is Broken

Incorrect.

Escalation can be an intentional operating pattern for situations requiring human judgment or authority.

---

## Misconception 8 — Pause and Resume Belong Entirely to AGT-07

Incorrect.

AGT-07 owns the **human-control decision and semantics** around intervention.

AGT-06 owns the underlying workflow mechanics for:

- persistence,
- checkpoints,
- durable execution,
- and resumption.

---

## Misconception 9 — Human Control Guarantees Safety

Incorrect.

Human control is one control mechanism.

It does not replace:

- technical safety controls,
- validation,
- authorization mechanisms,
- monitoring,
- or other system safeguards.

AGT-11 owns the broader agent-safety domain.

---

## Interview Questions with Expected Answers

## Foundational

### 1. What is human-in-the-loop?

**Expected answer:**

Human-in-the-Loop is a control pattern where a human participates in an agent's decision or action at a defined control point before the agent proceeds through that point.

It does not mean every agent action requires human approval.

---

### 2. What is Human-on-the-Loop?

**Expected answer:**

Human-on-the-Loop describes a pattern where an agent operates with greater autonomy while a human monitors behavior and retains the ability to intervene when necessary.

The human does not necessarily participate in every decision.

---

### 3. What is the difference between observation and intervention?

**Expected answer:**

Observation provides visibility into agent behavior.

Intervention gives a human the ability to affect that behavior, such as stopping, redirecting, rejecting, or taking over.

---

### 4. Why is human control an architectural concern?

**Expected answer:**

Because human control affects execution behavior, authority, intervention timing, continuation, escalation, and failure handling. A UI button alone does not define those semantics.

---

## Conceptual

### 5. Why should an agent not require human approval for every action?

**Expected answer:**

Because excessive approval introduces latency, workload, operational bottlenecks, and approval fatigue. Human involvement should be reserved for situations where human judgment materially improves control or decision quality.

---

### 6. What is the difference between human takeover and override?

**Expected answer:**

Takeover transfers active control of the relevant task or interaction to a human. Override supersedes a specific agent decision or behavior without necessarily transferring the entire task to the human.

---

### 7. Why does intervention timing matter?

**Expected answer:**

Because an intervention before an action can prevent it, while an intervention after an action may only allow inspection or correction. The timing must match the control objective.

---

### 8. What is the difference between synchronous and asynchronous human control?

**Expected answer:**

Synchronous control blocks or waits for a human decision before continuing. Asynchronous control allows human involvement to occur later, which can support long-running workflows but introduces additional concerns around changed conditions, decision validity, availability, and continuation semantics.

---

## Scenario

### 9. An agent repeatedly fails to resolve a customer issue. What human-control pattern could you introduce?

**Expected answer:**

A defined escalation or human-takeover point could be introduced after a suitable condition such as repeated unsuccessful attempts. The system should transfer the relevant decision or interaction to an appropriate human rather than continuing indefinitely.

---

### 10. A human can observe an agent but cannot stop it. Is that sufficient human control?

**Expected answer:**

It may be sufficient if the objective is visibility only. It is not sufficient if the requirement is to prevent or interrupt unwanted agent behavior.

---

### 11. A system requires human approval, but the reviewer is unavailable. What should happen?

**Expected answer:**

The behavior must be explicitly designed. Depending on the control requirement, the system may wait, escalate, use a safe fallback, cancel, or terminate. It should not implicitly bypass the human-control boundary.

---

## Debugging

### 12. An agent is supposed to stop when a human rejects an action, but it continues executing. What would you investigate?

**Expected answer:**

Investigate whether:

- the rejection event reached the execution system,
- the rejection semantics were explicitly defined,
- the agent had another path that bypassed the control point,
- the workflow incorrectly interpreted rejection,
- or the control boundary was implemented only in the UI rather than the execution path.

---

### 13. A production team reports that reviewers approve everything without reading it. What might be happening?

**Expected answer:**

Approval fatigue may be occurring. The system may be generating too many approval requests, causing reviewers to rubber-stamp decisions. The solution is not necessarily more approvals; the control points should be redesigned so human attention is reserved for decisions where it materially matters.

---

## Architecture

### 14. How would you design human control for an autonomous agent that performs many routine actions but occasionally requires human judgment?

**Expected answer:**

Keep routine actions autonomous and introduce explicit control points for defined exception conditions. The system should provide observation and intervention capabilities, define human authority, and specify what happens after approval, rejection, escalation, or takeover.

---

### 15. Where should pause/resume responsibilities be divided between AGT-06 and AGT-07?

**Expected answer:**

AGT-07 defines the human-control requirement and the meaning of the human decision to pause, resume, redirect, or terminate. AGT-06 owns the workflow mechanisms required to persist, checkpoint, and resume execution reliably.

---

## Engineering Judgment

### 16. Is a system with more human approval points necessarily better designed?

**Expected answer:**

No. More approval points can increase latency, workload, bottlenecks, and approval fatigue. The objective is to place human control where human judgment materially improves control, accountability, or risk management.

---

### 17. What is a good question to ask when deciding whether a human-control point is necessary?

**Expected answer:**

A strong question is:

> "What specific control problem does human involvement solve here?"

If the answer is unclear, the control point may be unnecessary or poorly designed.

---

## Quick Revision

## Core Definitions

| Concept | Meaning |
|---|---|
| Autonomy | Agent can make decisions/actions without continuous human direction |
| Human oversight | Human observes or supervises agent behavior |
| HITL | Human participates at a defined decision/action control point |
| HOTL | Agent operates autonomously while human monitors and can intervene |
| Human-over-the-loop | Human supervises broader autonomous behavior at a higher level |
| Observation | Human can inspect agent behavior or results |
| Intervention | Human can affect or interrupt agent behavior |
| Review point | Defined point for human observation or decision |
| Takeover | Human becomes the active operator of the relevant task or interaction |
| Approval | Human decision authorizing a proposed action within a defined control boundary |
| Rejection | Human decision preventing the proposed action from proceeding |
| Redirection | Human changes the direction of agent behavior |
| Escalation | Decision or situation is transferred to an appropriate human authority |
| Override | Authorized human action that supersedes a specific agent decision or behavior |

---

## Key Design Questions

When designing human control, ask:

1. What can the agent do autonomously?
2. What requires human observation?
3. What requires intervention?
4. When must intervention occur?
5. What authority does the human have?
6. What happens after approval?
7. What happens after rejection?
8. What happens when the human is unavailable?
9. Is the control point synchronous or asynchronous?
10. Is the intervention granularity appropriate?
11. Could the control mechanism create approval fatigue?
12. What belongs to AGT-07 versus the underlying workflow or safety systems?

---

## Key Takeaways

- Agent autonomy should be bounded by explicit human-control mechanisms where necessary.
- Human control is an architectural concern, not merely a UI feature.
- HITL involves human participation at defined control points.
- HOTL allows greater agent autonomy while preserving human observation and intervention.
- Observation and intervention are different capabilities.
- Human takeover transfers active control of a relevant task or interaction to a human.
- Override supersedes a specific agent decision or behavior without necessarily transferring the entire task.
- Approval, rejection, redirection, escalation, and override are different control actions and should have explicit semantics.
- Intervention timing determines what a human can actually control.
- Human control can occur before, during, or after agent actions.
- Human involvement can be synchronous or asynchronous.
- Control can be applied at step, task, workflow, or broader supervisory levels.
- More human involvement does not automatically produce a safer or better system.
- Excessive approvals can create approval fatigue and operational bottlenecks.
- Human control should be introduced for a specific engineering reason.
- AGT-07 defines the human-control requirement and semantics.
- AGT-06 owns the underlying durable workflow mechanisms for checkpointing and resumption.
- Human control complements, but does not replace, technical safety mechanisms.
- Detailed approval boundaries, authorization scope, expiry, revocation, and high-risk action handling belong to File 02.

---

## Further Reading

Continue with:

[Approval Boundaries, Escalation, and High-Risk Actions](./02-Approval-Boundaries-Escalation-and-High-Risk-Actions.md)

File 02 builds on the human-control patterns established here and focuses on:

- approval boundaries,
- risk-based approval,
- high-risk actions,
- authorization scope,
- approver selection,
- approval context,
- approval provenance,
- approval expiration and revocation,
- escalation rules and thresholds,
- denial and timeout,
- human override,
- and accountability.

For workflow persistence and execution mechanics, refer to AGT-06 rather than treating those mechanisms as part of AGT-07.

---

## Chapter Summary

Human control provides the boundary between **what an agent is allowed to do autonomously** and **where human judgment, authority, or intervention is required**.

A production agent should not be designed around the assumption that either:

```text
Everything is autonomous
```

or:

```text
Everything requires human approval
```

Instead, the system should deliberately choose appropriate control patterns based on the behavior being controlled and the value of human involvement.

The fundamental design principle is:

> **Give the agent enough autonomy to provide meaningful automation, while preserving human control where human judgment or authority materially matters.**
