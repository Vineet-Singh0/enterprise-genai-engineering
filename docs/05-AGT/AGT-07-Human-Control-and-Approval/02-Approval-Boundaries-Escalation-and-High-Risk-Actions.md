# Approval Boundaries, Escalation, and High-Risk Actions

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain what an approval boundary is and why it is an architectural control mechanism.
- Distinguish human approval from authorization and technical enforcement.
- Classify agent actions according to risk and required human control.
- Design risk-based approval boundaries.
- Define approval scope and understand why approvals should not be broader than necessary.
- Design meaningful approval context for human decision-makers.
- Understand approval provenance, expiration, revocation, and reuse.
- Select an appropriate approver based on the control boundary.
- Design escalation triggers and escalation destinations.
- Handle ambiguous decisions and insufficient confidence.
- Identify high-risk actions that commonly require human authorization.
- Design behavior for approval denial, timeout, expiration, and unavailable approvers.
- Understand human override and emergency override.
- Preserve accountability between proposed, approved, and executed actions.
- Identify common approval-control failure modes.
- Balance human oversight with agent autonomy, latency, and operational workload.

---

## Prerequisites

Before reading this chapter, you should understand:

- Agent runtime loops and bounded autonomy.
- Agent state and execution context.
- Tool invocation and side effects.
- Agent planning and execution.
- Basic concepts of human intervention from [01-Human-in-the-Loop-and-Intervention-Patterns.md](./01-Human-in-the-Loop-and-Intervention-Patterns.md).

This chapter builds on those concepts and focuses specifically on **approval boundaries, escalation, and high-risk actions**.

---

## Estimated Reading Time

**35–45 minutes**

---

## Before We Start

A common mistake in agent design is to think about human approval as a user-interface feature:

> "When the agent wants to do something important, show an approval dialog."

That is incomplete.

A production agent needs to answer much deeper questions:

- Which actions require approval?
- Why do they require approval?
- Who is allowed to approve them?
- What exactly is being approved?
- What information must the reviewer see?
- How long does the approval remain valid?
- What happens if conditions change?
- What happens if approval is denied?
- What happens if nobody responds?
- What happens if the agent changes the requested action?
- How is the approval actually enforced?
- How do we know the executed action matched the approved action?

These are architectural questions.

The purpose of this chapter is to design those control boundaries deliberately rather than treating approval as a button added to an otherwise autonomous system.

---

## Why This Exists

Agents increasingly perform actions with real-world consequences.

For example, an agent may:

- send an external message,
- issue a financial transaction,
- modify production configuration,
- delete data,
- change account permissions,
- disclose sensitive information,
- publish content,
- create or modify infrastructure,
- execute an irreversible operation.

Not every action deserves the same level of human involvement.

If every action requires approval, the agent becomes slow and operationally expensive.

If no meaningful action requires approval, the system may have excessive autonomy and weak control.

The engineering problem is therefore:

> **Determine where autonomous execution should stop and human authorization should begin.**

This creates an **approval boundary**.

An approval boundary is a deliberately defined control point beyond which an agent cannot proceed with a specified action until the required human decision has been obtained and the resulting permission is enforceable.

---

## Mental Model

Think of an agent as operating inside a set of control boundaries.

```text
                    AGENT
                      │
                      ▼
              Decide Next Action
                      │
                      ▼
              Classify Action/Risk
                      │
          ┌───────────┴───────────┐
          │                       │
      Low Risk                 Higher Risk
          │                       │
          ▼                       ▼
   Autonomous Path          Approval Boundary
                                  │
                                  ▼
                           Human Decision
                          ┌───────┴───────┐
                          │               │
                       Approve          Reject
                          │               │
                          ▼               ▼
                   Authorized Path     Stop / Modify /
                          │             Escalate
                          ▼
                    Enforcement
                          │
                          ▼
                      Execution
```

The important idea is that **approval is not the same thing as execution permission**.

A useful control model is:

```text
Approval
   ↓
Human decision

Authorization
   ↓
Permission for the specified action

Enforcement
   ↓
Technical mechanism that prevents execution
when the required permission is absent
```

These three concepts are related but not identical.

A human can approve an action, but the system still needs an authorization model that determines whether the action is permitted.

The system also needs enforcement mechanisms that make the boundary real.

Without enforcement, an approval requirement may exist only as an interface convention.

---

# Core Concepts

## Approval Boundary

An approval boundary defines where autonomous execution must stop until an appropriate human authorization decision has been obtained.

For example:

```text
Agent
  │
  ├── Search customer information
  │       └── Autonomous
  │
  ├── Prepare refund
  │       └── Review required
  │
  └── Execute refund
          └── Human approval required
```

The boundary should be attached to the **action and its risk**, not merely to the existence of an agent.

Different actions performed by the same agent can have different control requirements.

---

## Approval Is Not Just a Button

A UI button may be part of an approval workflow, but it is not the approval boundary itself.

Consider:

```text
Agent requests action
        │
        ▼
Approval request created
        │
        ▼
Human reviews context
        │
        ▼
Human approves
        │
        ▼
Authorization is established
        │
        ▼
System enforces authorization
        │
        ▼
Action executes
```

The important engineering properties are:

- the requested action is clearly identified,
- the human decision is attributable,
- the decision applies to a defined scope,
- the authorization can be checked,
- execution cannot bypass the control boundary,
- the executed action can be compared with the approved action.

A visually convincing approval dialog without corresponding enforcement is not a reliable control.

---

# Approval, Authorization, and Enforcement

These concepts should remain distinct.

### Approval

**Approval is the human decision to permit a proposed action within a defined control boundary.**

It answers:

> "Do I approve this proposed action?"

### Authorization

**Authorization determines whether the agent or system is permitted to perform the action.**

It answers:

> "Is this action permitted for this requester, resource, scope, and condition?"

### Enforcement

**Enforcement is the technical mechanism that prevents execution when the required authorization or control condition is absent.**

It answers:

> "What stops the action from executing if permission is missing?"

A simplified model is:

```text
Proposal
   │
   ▼
Human Approval
   │
   ▼
Authorization Decision
   │
   ▼
Enforcement Check
   │
   ├── Allowed ──► Execute
   │
   └── Denied ───► Block
```

The exact authorization model may involve roles, policies, resource permissions, or other mechanisms.

The important point for AGT-07 is that **human approval is one control input; authorization and technical enforcement determine how that control becomes effective at the execution boundary.**

The complete enterprise authorization model itself is outside this chapter's scope.

---

# Action Classification

Before deciding whether approval is required, classify the action.

A useful starting point is:

| Action Class | Typical Control |
|---|---|
| Low-impact, reversible | Autonomous |
| Moderate impact or uncertainty | Conditional or escalated |
| High-impact or difficult to reverse | Human approval |
| Highly sensitive or legally significant | Strong human authorization boundary |

This is not a universal classification.

The appropriate boundary depends on the system, environment, users, policies, and consequences of failure.

The purpose is to avoid treating every action identically.

---

## Risk Factors

Several factors can increase the need for human approval.

## Impact

What happens if the action is wrong?

Examples:

- one internal record changes,
- thousands of customer records change,
- money moves,
- production goes offline.

Higher impact generally requires stronger control.

---

## Reversibility

Can the action be safely undone?

Compare:

```text
Change a draft
```

with:

```text
Delete production data permanently
```

An irreversible action usually deserves stronger control.

---

## Affected Users

An action affecting one internal user may have a different control requirement from an action affecting thousands of customers.

---

## Financial Consequences

Financial actions can create direct and measurable consequences.

Examples include:

- refunds,
- transfers,
- purchases,
- pricing changes,
- payment initiation.

The threshold for approval may vary according to amount and business context.

---

## Privacy and Security Implications

Actions involving sensitive information or security permissions can require stronger control.

Examples:

- exposing private information,
- changing account permissions,
- granting privileged access,
- exporting sensitive records.

---

## External Side Effects

Actions affecting systems outside the agent's immediate environment may require additional control.

Examples:

- sending an external message,
- publishing content,
- changing a third-party system,
- submitting a transaction.

---

## Legal or Compliance Significance

Some actions can create significant organizational obligations.

The specific legal or compliance rules belong to the relevant enterprise governance domain.

At the agent-control level, the important question is:

> Does this action require a stronger human control boundary because of its consequences?

---

## Uncertainty

An agent may be technically capable of performing an action while still being uncertain about whether it should.

For example:

```text
Agent:
"I found two possible customer records.
I am not certain which one is correct."
```

The uncertainty itself may justify escalation.

Confidence should therefore be treated as a **risk signal**, not as a substitute for authorization.

---

## Blast Radius

Blast radius describes how broadly an action can affect systems, users, or data.

Compare:

```text
Modify one configuration value
```

with:

```text
Modify the configuration across every production service
```

The second action has a much larger blast radius and may require stronger human control.

---

# Risk-Based Approval

A practical model is:

```text
              Action
                 │
                 ▼
            Assess Risk
                 │
       ┌─────────┼─────────┐
       ▼         ▼         ▼
      Low      Medium      High
       │         │          │
       ▼         ▼          ▼
 Autonomous   Conditional  Human
              /Escalate   Approval
```

The important principle is:

> **Human approval should be concentrated where human judgment materially improves control, accountability, or risk management.**

This prevents two opposite mistakes.

### Too little control

```text
Everything → Autonomous
```

Potential consequences:

- excessive autonomy,
- uncontrolled side effects,
- difficult intervention,
- weak accountability.

### Too much control

```text
Everything → Approval
```

Potential consequences:

- approval fatigue,
- latency,
- bottlenecks,
- poor user experience,
- reduced automation value.

The goal is not maximum human involvement.

The goal is **appropriate human control**.

---

# Approval Scope

An approval should be as specific as necessary to control the intended action.

Scope can include:

- action type,
- target resource,
- affected user,
- parameters,
- amount,
- environment,
- time window,
- execution conditions.

For example:

```text
Approve:
Refund customer #123
Amount: ₹2,000
Reason: Duplicate charge
Valid until: 18:00
```

is substantially safer than:

```text
Approve:
Refund customer
```

The second approval is broader and may permit unintended actions.

A useful rule is:

> **Do not make an approval broader than the decision the human actually reviewed.**

---

# Approval Context

A reviewer needs enough information to make a meaningful decision.

A useful approval request may contain:

- requested action,
- reason for the action,
- relevant inputs,
- expected effect,
- affected resources,
- important consequences,
- risk indicators,
- uncertainty,
- alternatives,
- requested scope,
- expiration,
- requesting agent or system identity.

For example:

```text
Action:
Deploy configuration change

Reason:
Fix authentication timeout

Target:
Production API

Expected effect:
Reduce authentication failures

Risk:
Service restart may affect active requests

Alternative:
Deploy during maintenance window

Requested approval:
Production deployment

Expires:
17:30
```

The objective is not to expose everything the agent knows.

The objective is to provide the information the human needs to exercise meaningful control.

---

## Runtime Context vs Approval Context

These concepts should not be confused.

### Runtime context

```text
Everything the agent needs to execute its task.
```

It may include:

- conversation state,
- tool results,
- memory,
- intermediate reasoning state,
- workflow state,
- environmental information.

### Approval context

```text
The decision-relevant subset of information
a human needs to control a proposed action.
```

Approval context therefore serves a different purpose.

It is optimized for **human decision quality**, not for agent execution.

The broader topic of context engineering belongs to AGT-04.

---

# Approval Provenance

The system should be able to determine:

- who approved,
- what they approved,
- when they approved it,
- under what context,
- for which scope,
- through which control boundary.

For example:

```text
Approval ID: A-4821
Approver: Human-17
Action: Production deployment
Target: API service
Version: v2.4.1
Approved: 16:42
Expires: 17:42
```

This creates a traceable relationship between the decision and the action.

---

# Approval Expiration

An approval does not necessarily remain valid forever.

Conditions may change.

For example:

```text
16:00
Human approves deployment

16:30
Production configuration changes

17:00
Agent attempts deployment
```

The original decision may no longer reflect the current conditions.

An approval can therefore have:

- a time limit,
- an action scope,
- a resource scope,
- parameter restrictions,
- environmental conditions.

Expiration reduces the risk of stale authorization.

---

# Approval Revocation

Sometimes an approval must become invalid before its original expiration.

For example:

```text
Human approves deployment
        │
        ▼
New critical issue discovered
        │
        ▼
Approval revoked
        │
        ▼
Agent must not proceed
```

Revocation is useful when conditions materially change.

A production system therefore needs to distinguish:

```text
Approval existed
```

from:

```text
Approval is currently valid
```

---

# Approval Reuse

An approval should not automatically be reusable for a different action.

For example:

```text
Approved:
Delete temporary file A
```

should not silently authorize:

```text
Delete temporary files A, B, C, D
```

unless the original approval explicitly covered that broader scope.

Approval reuse should therefore be deliberate and scope-aware.

---

# Approver Selection

The correct approver depends on the control boundary.

Relevant factors may include:

- authority for the action,
- responsibility for the affected resource,
- domain expertise,
- sensitivity of the action,
- organizational role,
- required decision authority.

The goal is not simply:

> "Find any human."

The goal is:

> **Route the decision to an appropriately authorized human for the specific control boundary.**

AGT-07 identifies the human authority needed at the agent-control boundary.

It does **not** define the organization's complete RBAC, ABAC, identity hierarchy, segregation-of-duties model, or enterprise governance structure. Those broader organizational authorization and governance models belong to the enterprise governance domain.

---

## Escalation

Escalation transfers a decision to an appropriate human authority when the current agent or control path should not decide autonomously.

Escalation can occur because:

- the action is too risky,
- the agent is uncertain,
- authority is insufficient,
- instructions are ambiguous,
- policy conditions conflict,
- repeated failures occur,
- consequences are unexpected,
- the action exceeds a defined threshold.

Escalation is therefore not necessarily an error.

It is often a deliberate **control transition**.

---

## Escalation Triggers

Common triggers include:

| Trigger | Example |
|---|---|
| High risk | Large financial transaction |
| High uncertainty | Multiple plausible customer records |
| Insufficient authority | Agent lacks permission for action |
| Ambiguous instruction | User request has multiple interpretations |
| Policy conflict | Requested action conflicts with a control rule |
| Repeated failure | Tool fails several times |
| Unexpected consequence | Action produces an unplanned effect |
| Sensitive action | Disclosure of confidential information |
| Threshold exceeded | Transaction exceeds approval amount |

The exact thresholds should be defined by system requirements rather than assumed universally.

---

## Escalation Thresholds

Thresholds make escalation behavior predictable.

For example:

```text
Transaction < ₹1,000
    → Autonomous

₹1,000–₹10,000
    → Conditional review

> ₹10,000
    → Human approval
```

The numbers above are illustrative.

The engineering principle is more important:

> **Control thresholds should be explicit, testable, and connected to action risk.**

---

# Ambiguous Decisions

Agents should not always guess when instructions are ambiguous.

Consider:

```text
User:
"Cancel the subscription."

Agent:
Two active subscriptions exist.
```

A weak design chooses one.

A stronger design:

```text
Ambiguity detected
        │
        ▼
Clarify or escalate
        │
        ▼
Human decision
        │
        ▼
Continue
```

Escalation is particularly valuable when the cost of choosing incorrectly is high.

---

# Insufficient Confidence

Low confidence does not automatically mean that an agent must ask for approval.

Instead:

```text
Low confidence
      │
      ▼
Assess consequence
      │
 ┌────┴────┐
 ▼         ▼
Low       High
impact    impact
 │         │
 ▼         ▼
Clarify   Escalate
or retry  / Approval
```

The combination of **uncertainty and consequence** is more important than confidence alone.

---

# High-Risk Actions

Some action categories commonly deserve stronger human control.

Examples include:

- financial transactions,
- destructive operations,
- production changes,
- sensitive data disclosure,
- access and permission changes,
- legally significant actions,
- irreversible external actions,
- high-impact decisions.

The exact classification remains system-specific.

---

## Financial Actions

Examples include:

- transfers,
- refunds,
- purchases,
- high-value transactions,
- pricing changes.

A useful design may combine:

```text
Amount
+
Recipient
+
Transaction type
+
Risk indicators
```

to determine the approval requirement.

---

# Destructive Operations

Examples include:

- deleting production data,
- destroying infrastructure,
- removing backups,
- permanently deleting accounts.

Destructive actions should receive stronger control when recovery is difficult or impossible.

---

## Production Changes

Production changes can affect:

- availability,
- performance,
- security,
- data integrity,
- customer experience.

An agent may prepare a change autonomously while requiring human approval before execution.

This separates:

```text
Preparation
```

from:

```text
Execution
```

and places control at the point of consequential action.

---

# Sensitive Data Disclosure

An agent may be capable of retrieving sensitive information without being authorized to disclose it.

For example:

```text
Retrieve internal record
        │
        ▼
Prepare response
        │
        ▼
External disclosure?
        │
        ▼
Human control boundary
```

The approval boundary should focus on the consequential disclosure rather than assuming that all preceding agent activity requires approval.

---

# Access and Permission Changes

Examples include:

- granting privileged access,
- changing account permissions,
- modifying security settings,
- creating administrative accounts.

These actions can alter future system behavior and therefore may require stronger authorization.

---

## High-Impact Decisions

Some agents influence decisions that significantly affect people or organizations.

Examples may include:

- eligibility decisions,
- account restrictions,
- high-value business decisions,
- decisions affecting access to important services.

The appropriate human-control mechanism depends on the consequences, domain, and applicable requirements.

---

## Approval Denial

Approval denial is a valid control outcome.

```text
Agent proposes action
        │
        ▼
Human reviews
        │
        ▼
     Reject
        │
        ▼
Stop / Modify / Escalate
```

The system should not assume:

```text
Rejected → Retry until approved
```

That can create an approval loop and undermine the purpose of human control.

A denial may mean:

- stop the action,
- modify the proposal,
- ask for clarification,
- escalate,
- select a safer alternative.

---

# Approval Timeout

A timeout occurs when a decision is not received within the expected period.

It is useful to distinguish:

```text
Denied
Expired
Unavailable
Abandoned
Timed out
```

These states can have different operational meanings.

For example:

```text
Approval timeout
      │
      ├── Low-risk action
      │       └── Safe fallback
      │
      ├── High-risk action
      │       └── Do not execute
      │
      └── Critical workflow
              └── Escalate
```

The correct behavior depends on the action's risk and system requirements.

---

# Approval Expiration vs Timeout

These concepts are related but different.

### Expiration

The approval itself is no longer valid because its defined validity period has ended.

### Timeout

The system waited for a required decision and did not receive one within the expected response window.

For example:

```text
Approval valid until 18:00
        │
        ▼
No decision by 18:00
        │
        ▼
Approval expires
```

Whereas:

```text
Approval request sent
        │
        ▼
Wait 30 minutes
        │
        ▼
No response
        │
        ▼
Request times out
```

The resulting control behavior should be explicit rather than accidental.

---

# Human Override

An override allows an authorized human to supersede an agent decision or behavior.

Examples:

- stop an action,
- pause execution,
- reject a proposed action,
- redirect execution,
- modify the requested action,
- replace an agent decision,
- terminate an operation.

Override authority should itself be controlled.

Not every user interacting with an agent should automatically have the ability to override every action.

---

## Emergency Override

Emergency override may allow an authorized human to bypass normal interaction steps when immediate intervention is required.

For example:

```text
Production incident
      │
      ▼
Agent performing harmful operation
      │
      ▼
Authorized emergency override
      │
      ▼
Stop / Contain / Redirect
```

The mechanism should still define:

- who may invoke it,
- what it can override,
- how it is enforced,
- what evidence is recorded,
- what happens afterward.

AGT-07 owns the **human-control mechanism** for override.

Broader safety containment, emergency response, and safety-system behavior belong to AGT-11.

---

# Accountability

A production system should distinguish between:

```text
Proposed
   ↓
Approved
   ↓
Authorized
   ↓
Executed
```

These are not necessarily the same event.

For example:

```text
Agent proposes:
Delete 100 records

Human approves:
Delete 100 records

System executes:
Delete 500 records
```

The system has a control failure.

The execution did not match the approved scope.

Approval therefore needs to be connected to enforceable execution boundaries.

---

# Approval Context Must Match the Action

A reviewer may approve an action based on specific information.

If the agent materially changes the action afterward, the original approval may no longer apply.

For example:

```text
Approved:
Deploy version 2.4.1
```

The agent later attempts:

```text
Deploy version 2.4.2
```

The system should not silently treat the second action as approved.

A useful rule is:

> **If the proposed action changes materially, reassess whether the existing approval still applies.**

---

# Changed Conditions

Conditions can change after approval.

Examples:

- target resource changes,
- amount changes,
- environment changes,
- risk increases,
- new information appears,
- policy conditions change,
- the action becomes less reversible.

A robust system should therefore evaluate whether the approval remains valid before execution.

---

## Escalation Design

Escalation should define:

1. **Trigger**
2. **Destination**
3. **Context**
4. **Expected decision**
5. **Timeout behavior**
6. **Fallback**
7. **Audit information**

For example:

```text
High-value transaction
        │
        ▼
Escalation Trigger
        │
        ▼
Finance Approver
        │
        ▼
Approval Context
        │
        ▼
Decision
   ┌────┴────┐
   ▼         ▼
Approve    Reject
   │         │
   ▼         ▼
Execute     Stop
```

---

# Escalation Is a Control Mechanism

Escalation should not be treated only as:

```text
Agent failed
```

A better model is:

```text
Agent reaches decision boundary
          │
          ▼
Agent should not decide autonomously
          │
          ▼
Transfer control
          │
          ▼
Human decision
```

This makes escalation part of the architecture rather than an exception added after failure.

---

# Escalation Destination

Escalating to the wrong person can be almost as problematic as failing to escalate.

For example:

```text
Security-sensitive action
        │
        ▼
Random support user
```

is not an effective control boundary.

The destination should have appropriate authority and, where necessary, domain expertise.

Again, AGT-07 focuses on the agent-level control requirement. The organization's complete authority hierarchy is an enterprise governance concern.

---

# Escalation Loops

Poorly designed escalation can create:

```text
Agent
  ↓
Human A
  ↓
Human B
  ↓
Agent
  ↓
Human A
  ↓
...
```

This creates operational deadlock.

A production design should define:

- escalation ownership,
- maximum escalation depth,
- fallback behavior,
- timeout behavior,
- termination conditions.

---

# Repeated Failure Escalation

Repeated failures can indicate that autonomous execution should stop.

For example:

```text
Tool call fails
      ↓
Retry
      ↓
Fails again
      ↓
Retry within limit
      ↓
Fails again
      ↓
Escalate
```

The important principle is bounded behavior.

Repeatedly retrying a consequential action without changing the control state can amplify risk.

---

# Ambiguity Escalation

Ambiguity can be an explicit escalation trigger.

For example:

```text
User:
"Delete the old customer accounts."

Agent:
"Which accounts and what does 'old' mean?"
```

If the ambiguity affects a consequential action, the system should not silently choose an interpretation.

---

# Policy Conflict Escalation

An agent may encounter competing constraints.

For example:

```text
User request
     │
     ▼
Agent proposes action
     │
     ▼
Control rule conflicts
     │
     ▼
Cannot safely decide
     │
     ▼
Escalate
```

The specific enterprise policy model belongs outside this chapter.

AGT-07 focuses on the control behavior:

> **When the agent cannot proceed safely within its authority, transfer the decision to the appropriate human boundary.**

---

# Production Perspective

Approval design becomes significantly harder in production because humans are not always available, attentive, or consistent.

## Approver Availability

The required approver may be:

- unavailable,
- offline,
- overloaded,
- on leave,
- responding slowly.

The system must define what happens when the human control path is unavailable.

---

## Approval Latency

Approval adds latency.

For:

```text
Interactive request
```

a five-minute approval delay may be unacceptable.

For:

```text
High-value financial operation
```

the same delay may be reasonable.

The correct trade-off depends on consequence.

---

## Approval Fatigue

Too many approval requests can cause:

- rubber-stamping,
- ignored requests,
- delayed decisions,
- reduced attention,
- loss of trust,
- operational overload.

Therefore:

> **More approvals do not automatically mean more safety.**

Approvals should be reserved for decisions where human judgment materially improves control.

---

## Reviewer Cognitive Load

A reviewer may receive dozens of requests.

If every request contains:

- large logs,
- irrelevant context,
- excessive technical detail,
- unclear consequences,

decision quality can decrease.

Approval context should therefore be concise enough to support meaningful judgment while retaining the information necessary for the decision.

---

## Stale Approvals

An approval may become stale when:

- conditions change,
- target changes,
- scope changes,
- risk increases,
- the action is delayed.

Expiration and revalidation reduce this risk.

---

## Replay and Reuse

A captured approval should not automatically authorize repeated execution.

For example:

```text
Approved:
Transfer ₹5,000 to Account A
```

must not silently become:

```text
Transfer ₹5,000 repeatedly
```

unless the approval explicitly defines such scope.

---

## Bypass

A control boundary is ineffective if an agent can simply execute the action through another path.

For example:

```text
Tool A → Approval required
Tool B → Same consequential action → No approval
```

This creates a bypass.

Approval boundaries should therefore be aligned with the actual action and enforcement point.

---

## Control-Plane Failure

The approval service itself can fail.

For example:

```text
Agent
  │
  ▼
Approval Service
  │
  └── Unavailable
```

The system must define whether the action:

- stops,
- waits,
- escalates,
- falls back safely,
- or follows another explicitly designed control behavior.

For high-risk actions, failure of the approval mechanism should not silently become permission to proceed.

---

# Engineering Decisions and Trade-offs

## Autonomous vs Approval

| More Autonomous | More Human Approval |
|---|---|
| Lower latency | Higher control |
| Better automation | Better human oversight |
| Lower reviewer workload | Higher reviewer workload |
| Greater autonomy | Lower autonomy |
| Higher risk if poorly bounded | Higher operational cost |

The goal is the appropriate balance.

---

## Broad vs Narrow Approval

### Broad approval

Pros:

- fewer approval requests,
- lower operational overhead.

Cons:

- larger blast radius,
- weaker scope control,
- greater risk of unintended actions.

### Narrow approval

Pros:

- precise control,
- smaller blast radius.

Cons:

- more approval requests,
- higher operational overhead.

---

## Permanent vs Expiring Approval

### Permanent

Pros:

- simple,
- low friction.

Cons:

- stale authorization risk,
- harder to reason about changing conditions.

### Expiring

Pros:

- better alignment with changing conditions,
- reduced stale approval risk.

Cons:

- additional workflow complexity,
- possible repeated approvals.

---

## Automatic vs Manual Escalation

### Automatic

Pros:

- predictable,
- fast,
- less dependent on agent judgment.

Cons:

- threshold design complexity,
- potential over-escalation.

### Manual

Pros:

- flexible,
- easier for unusual cases.

Cons:

- inconsistent,
- dependent on agent judgment,
- harder to test.

---

## Detailed vs Minimal Approval Context

### Detailed

Pros:

- more evidence,
- better decision support.

Cons:

- cognitive overload,
- slower review.

### Minimal

Pros:

- faster review.

Cons:

- insufficient information,
- uninformed approval.

The objective is **decision-relevant context**, not maximum context.

---

## Strict vs Flexible Override

### Strict override boundaries

Pros:

- predictable,
- easier to audit,
- lower misuse risk.

Cons:

- less flexibility during unusual incidents.

### Flexible override

Pros:

- useful for exceptional situations,
- faster intervention.

Cons:

- higher misuse risk,
- more difficult accountability.

---

## Common Mistakes and Misconceptions

## "HITL means approve everything."

Incorrect.

Human involvement should be targeted to decisions where human judgment materially improves control.

---

## "More approvals always mean more safety."

Incorrect.

Excessive approvals create fatigue, delay, and rubber-stamping.

---

## "Approval is just a UI feature."

Incorrect.

Approval is an architectural control boundary.

The UI is only one part of the mechanism.

---

## "Approval automatically means authorization."

Not necessarily.

Approval is a human decision.

Authorization determines whether the requested action is permitted, while enforcement ensures that the permission requirement is actually respected.

---

## "Any user can override the agent."

Incorrect.

Override authority must itself be controlled.

---

## "An approval lasts forever."

Incorrect.

Approvals may be scoped, time-bound, revoked, or invalidated when conditions materially change.

---

## "Rejection means the system failed."

Incorrect.

Rejection can be the intended control outcome.

---

## "Escalation means the agent is broken."

Incorrect.

Escalation can be a deliberate architectural control transition.

---

## "Confidence is enough to decide whether approval is required."

Incorrect.

Confidence is only one risk signal.

Impact, reversibility, blast radius, sensitivity, and other factors also matter.

---

## "Human approval guarantees safety."

Incorrect.

Approval is one control mechanism.

Technical safeguards, authorization, enforcement, validation, and broader safety mechanisms may still be required.

---

## "The reviewer does not need context."

Incorrect.

A reviewer needs enough decision-relevant information to understand the action and its consequences.

---

## "All high-risk actions are identical."

Incorrect.

Risk depends on context, impact, reversibility, affected resources, uncertainty, and other factors.

---

## "Human control is the same as enterprise governance."

Incorrect.

AGT-07 focuses on agent-level human control mechanisms.

Enterprise governance, compliance, organizational authorization models, and broader accountability structures belong to the enterprise governance domain.

---

## "Approval can be reused automatically."

Incorrect.

Approval reuse must respect the original scope and validity conditions.

---

## "Timeout means rejection."

Not necessarily.

Timeout, denial, expiration, unavailability, and abandonment can have different meanings and should have explicit handling.

---

## Practical Examples

## Example 1 — Financial Action

```text
Agent:
Prepare refund of ₹25,000

        │
        ▼
Risk assessment

        │
        ▼
High financial impact

        │
        ▼
Approval boundary

        │
        ▼
Finance approver

        │
        ├── Approve
        │      ↓
        │   Authorization
        │      ↓
        │   Enforcement
        │      ↓
        │   Execute
        │
        └── Reject
               ↓
             Stop
```

The agent can prepare the action autonomously while requiring human control at the consequential execution boundary.

---

## Example 2 — Production Change

```text
Agent:
Deploy configuration update

        │
        ▼
Target = Production

        │
        ▼
High-impact action

        │
        ▼
Human approval

        │
        ▼
Deployment authorization

        │
        ▼
Execution enforcement

        │
        ▼
Deploy
```

The key is that approval must be connected to the actual deployment boundary.

---

## Example 3 — Ambiguous Request

```text
User:
Delete the old accounts.

Agent:
Multiple account groups match
"old accounts."

        │
        ▼
Ambiguity detected

        │
        ▼
Clarify or escalate

        │
        ▼
Human decision
```

The agent should not silently choose an interpretation when the consequences are significant.

---

## Example 4 — Approval Expiration

```text
16:00
Human approves deployment

16:45
Deployment conditions change

17:00
Approval expires

17:10
Agent attempts deployment

        │
        ▼
Approval invalid
        │
        ▼
Block / re-request approval
```

This prevents stale approval from becoming accidental authorization.

---

## Example 5 — Repeated Failure

```text
Agent attempts action
        │
        ▼
Failure
        │
        ▼
Bounded retry
        │
        ▼
Failure
        │
        ▼
Escalation threshold reached
        │
        ▼
Human intervention
```

The important point is that escalation becomes the next control state rather than an endless retry loop.

---

# Architecture Pattern

A generic approval architecture can be represented as:

```text
                    ┌──────────────────────┐
                    │       Agent          │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Action / Risk      │
                    │    Assessment        │
                    └──────────┬───────────┘
                               │
                    ┌──────────┴───────────┐
                    │                      │
                  Low Risk              High Risk
                    │                      │
                    ▼                      ▼
             Autonomous Path       Approval Request
                                           │
                                           ▼
                                  Human Decision
                                  ┌────────┴────────┐
                                  │                 │
                               Approve            Reject
                                  │                 │
                                  ▼                 ▼
                            Authorization        Stop /
                                  │              Modify /
                                  ▼              Escalate
                            Enforcement
                                  │
                                  ▼
                              Execution
```

This architecture separates:

1. action proposal,
2. risk assessment,
3. human decision,
4. authorization,
5. enforcement,
6. execution.

That separation makes the control boundary easier to reason about and test.

---

# Approval State Model

A simple conceptual state model is:

```text
                    ┌──────────────┐
                    │   Proposed   │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Pending    │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
          Approved       Rejected     Expired
              │            │            │
              ▼            │            │
        Authorized         │            │
              │            │            │
              ▼            ▼            ▼
          Enforced        Stop        Re-request
              │
              ▼
          Executed
```

Additional states may be required for:

- revoked approvals,
- unavailable approvers,
- escalated requests,
- abandoned requests,
- execution failures.

The exact state model depends on system requirements.

---

# Human Control Failure Modes

Common failure modes include:

| Failure | Consequence |
|---|---|
| Missing approval boundary | Excessive autonomy |
| Approval too late | Action already occurred |
| Insufficient context | Poor human decision |
| Wrong approver | Invalid control |
| Unauthorized approver | Control bypass |
| Stale approval | Outdated decision used |
| Approval replay | Repeated unintended execution |
| Approval bypass | Action executes without control |
| Approval fatigue | Rubber-stamping |
| Unclear rejection semantics | Retry loops |
| Escalation loop | Workflow deadlock |
| Unavailable human | Workflow stalls |
| Ambiguous authority | Conflicting decisions |
| Insufficient evidence | Poor accountability |
| Scope mismatch | Execution exceeds approval |

These failure modes should be considered during architecture design and testing.

---

## Production Design Checklist

Before deploying an approval-controlled agent, verify:

### Approval Boundary

- Is it clear which actions require human approval?
- Is the boundary attached to the consequential action?
- Can the agent bypass it through another execution path?

### Risk

- Are risk factors defined?
- Are high-impact actions identified?
- Are reversibility and blast radius considered?
- Is uncertainty handled appropriately?

### Approval Scope

- Is the action clearly specified?
- Is the target resource defined?
- Are important parameters bounded?
- Is the time window explicit?

### Approval Context

- Does the reviewer have enough decision-relevant information?
- Are consequences visible?
- Is uncertainty visible?
- Are alternatives shown when relevant?

### Authority

- Is the approver appropriate for the control boundary?
- Is the required authority explicit?
- Is the broader enterprise authorization model kept separate from agent-level control design?

### Expiration and Revocation

- Can approvals expire?
- Can they be revoked?
- Are changed conditions detected?

### Escalation

- Are escalation triggers explicit?
- Is the destination appropriate?
- Are timeout and fallback behaviors defined?
- Are escalation loops prevented?

### Enforcement

- Does the system technically prevent execution without required authorization?
- Can approved scope be checked against actual execution?
- Are bypass paths controlled?

### Accountability

- Can the system identify who approved what and when?
- Can proposed, approved, authorized, and executed actions be distinguished?
- Is the approval decision traceable to the resulting action?

### Human Workload

- Is approval frequency reasonable?
- Is approval fatigue measured?
- Is reviewer cognitive load manageable?

---

## Interview Questions with Expected Answers

## Foundational

### 1. What is an approval boundary?

**Expected answer:**

An approval boundary is a defined control point where an agent cannot proceed with a specified consequential action until the required human decision has been obtained and the resulting permission can be enforced.

---

### 2. Why is approval more than a UI feature?

**Expected answer:**

Because the system must define the action requiring approval, identify the appropriate authority, capture the decision, enforce the resulting permission, and ensure that execution matches the approved scope.

---

## Conceptual

### 3. What is the difference between approval, authorization, and enforcement?

**Expected answer:**

Approval is the human decision to permit a proposed action. Authorization determines whether the action is permitted for the requester and scope. Enforcement is the technical mechanism that prevents execution when required permission is absent.

---

### 4. Why should approvals be scoped?

**Expected answer:**

Because a human should authorize only the action they actually reviewed. Broad approvals increase blast radius and may unintentionally authorize actions outside the intended decision.

---

### 5. Why should approvals expire?

**Expected answer:**

Because conditions can change. Expiration reduces the risk that a stale human decision is reused after the environment, target, scope, or risk has materially changed.

---

## Scenario

### 6. An agent wants to delete production data. What would you consider before allowing autonomous execution?

**Expected answer:**

Impact, reversibility, affected resources, blast radius, data sensitivity, recovery options, uncertainty, and whether the action crosses a defined high-risk approval boundary.

---

### 7. An approver rejects an action. Should the agent retry automatically?

**Expected answer:**

Not by default. Rejection is a valid control outcome. The system should follow explicitly designed behavior such as stopping, modifying the action, clarifying, or escalating.

---

### 8. The agent has high confidence in a high-impact action. Does confidence remove the need for approval?

**Expected answer:**

No. Confidence is only one risk signal. Impact, reversibility, blast radius, sensitivity, and authorization requirements still matter.

---

## Debugging

### 9. An agent was approved to delete one file but deleted ten. What failed?

**Expected answer:**

The approval scope and execution scope were not properly enforced. The system allowed execution beyond the approved boundary.

---

### 10. An approval dialog appears, but the agent can execute the action through another tool. What is wrong?

**Expected answer:**

The approval boundary exists at the UI or workflow level but is not enforced at the actual consequential execution boundary. The alternate path creates a bypass.

---

### 11. An agent repeatedly asks different humans for approval after rejection. What failure mode might this indicate?

**Expected answer:**

An escalation or approval loop that treats rejection as something to overcome rather than as a valid control decision.

---

## Architecture

### 12. How would you design approval for a high-value financial transaction?

**Expected answer:**

Classify the action as high risk, create a narrowly scoped approval request with relevant context, route it to an appropriately authorized human, enforce the resulting authorization before execution, define expiration and timeout behavior, and record provenance and execution outcome.

---

### 13. What should happen if the approval service is unavailable during a high-risk action?

**Expected answer:**

The system should not silently proceed. Depending on the design, it may block, wait, escalate, or follow a safe fallback. High-risk control failure should not become implicit authorization.

---

## Engineering Judgment

### 14. Why not require approval for every action?

**Expected answer:**

Because excessive approval introduces latency, workload, bottlenecks, and approval fatigue. Human control should be concentrated where human judgment materially improves risk management and accountability.

---

### 15. When should an agent escalate instead of retrying?

**Expected answer:**

When the failure indicates uncertainty, insufficient authority, repeated failure, policy conflict, unexpected consequences, or another condition where continued autonomous execution is no longer appropriate.

---

### 16. What is the relationship between human control and technical safety?

**Expected answer:**

Human control is one control mechanism. It does not replace technical safeguards, authorization enforcement, validation, isolation, or broader safety mechanisms.

---

## Quick Revision

Remember the following model:

```text
Action
  ↓
Risk Assessment
  ↓
Control Decision
  ├── Autonomous
  ├── Conditional
  └── Human Approval
           ↓
      Human Decision
       ├── Approve
       └── Reject
           ↓
      Authorization
           ↓
      Enforcement
           ↓
       Execution
```

And remember:

```text
Approval
    ≠
Authorization
    ≠
Enforcement
```

Approval answers:

> "Did the appropriate human permit this proposed action?"

Authorization answers:

> "Is this action permitted within the defined authority and scope?"

Enforcement answers:

> "What technically prevents execution when permission is absent?"

---

# Key Takeaways

1. Approval boundaries are architectural control mechanisms, not merely UI interactions.
2. Human approval should be tied to consequential actions and their risk.
3. Approval, authorization, and enforcement are distinct concepts.
4. Risk-based approval is better than approving everything.
5. Important risk factors include impact, reversibility, affected users, financial consequences, sensitivity, uncertainty, external side effects, and blast radius.
6. Approval scope should match the action actually reviewed.
7. Approval context should provide enough decision-relevant information without overwhelming the reviewer.
8. Runtime context and approval context serve different purposes.
9. Approvals may need expiration, revocation, and explicit reuse rules.
10. The correct approver is the human authority appropriate to the control boundary.
11. AGT-07 defines agent-level human-control requirements; it does not define the complete enterprise authorization or governance model.
12. Escalation is a control transition, not necessarily a failure.
13. High-risk actions commonly include financial transactions, destructive operations, production changes, sensitive disclosures, permission changes, and irreversible external actions.
14. Rejection is a valid outcome.
15. Timeout, expiration, denial, and unavailability should not be treated as automatically equivalent.
16. Human override must itself be authorized and controlled.
17. Emergency override belongs to the human-control mechanism here, while broader safety containment belongs to AGT-11.
18. Execution must remain within the approved scope.
19. Approval fatigue is a real production risk.
20. Human control should be sufficient to constrain risky autonomy without destroying the value of automation.

---

## Further Reading

For related concepts in this repository:

- [01-Human-in-the-Loop-and-Intervention-Patterns.md](./01-Human-in-the-Loop-and-Intervention-Patterns.md) — foundational human-control and intervention patterns.
- **AGT-03** — tool contracts, invocation boundaries, side effects, and execution control.
- **AGT-04** — agent state, context, and memory.
- **AGT-05** — planning, execution, replanning, and verification.
- **AGT-06** — workflow state, checkpoints, durable execution, pause/resume mechanics, and long-running execution.
- **AGT-11** — broader agent failure handling, safety, containment, and termination.
- **ENT** — enterprise governance, organizational authorization, compliance, and broader accountability.

---

## Chapter Summary

A production agent should not treat human approval as a decorative confirmation step.

Human control becomes meaningful when it is designed as an architectural boundary:

```text
Agent proposes
      ↓
Risk is assessed
      ↓
Control requirement is determined
      ↓
Human decision occurs when required
      ↓
Authorization is established
      ↓
Enforcement prevents unauthorized execution
      ↓
Action executes within approved scope
```

The central engineering question is not:

> "Where should we show an approval button?"

It is:

> **"Where should autonomous execution stop, what human decision is required, and how do we technically enforce the resulting control boundary?"**

That distinction is what turns human approval from a user-interface feature into an actual agent-control mechanism.
