# Agent Design Review and Architecture Validation

## 1. Purpose

This chapter teaches engineers how to **review, challenge, and validate an agent architecture before implementation or production approval**.

The focus is not on re-teaching individual agent capabilities. Instead, it brings together the architectural concerns established throughout AGT-01 through AGT-11 and provides a structured method for determining whether a proposed architecture is:

- justified by its requirements,
- appropriately composed,
- bounded by clear responsibilities and authority,
- resilient to important failure modes,
- safe for its intended operating context,
- observable and evaluable,
- operationally viable,
- maintainable and evolvable,
- supported by sufficient validation evidence.

The central question is:

> **Is this agent architecture justified by the requirements, risks, constraints, and expected operating conditions, and what evidence supports that conclusion?**

---

## 2. Learning Objectives

By the end of this chapter, you should be able to:

- explain the purpose of an agent architecture review,
- distinguish architecture review from architecture validation,
- trace architecture decisions back to requirements and constraints,
- identify hidden and critical architectural assumptions,
- evaluate component responsibilities and authority boundaries,
- review interfaces and dependency boundaries,
- inspect execution, state, failure, safety, and human-control paths,
- identify architectural risks and single points of failure,
- distinguish architectural claims from supporting evidence,
- select validation evidence based on architectural risk,
- assess whether validation evidence actually supports a claim,
- evaluate architecture fitness across multiple dimensions,
- identify common architecture anti-patterns,
- structure architecture review findings,
- determine whether an architecture should be approved, changed, rejected, or deferred,
- reason about architecture evolution as requirements and evidence change.

---

## 3. Prerequisites

This chapter assumes familiarity with:

- **AGT-01** — agent foundations and system boundaries,
- **AGT-02** — runtime, execution loops, and bounded autonomy,
- **AGT-03** — tools and action execution,
- **AGT-04** — state, context, and memory,
- **AGT-05** — planning and adaptive execution,
- **AGT-06** — workflow orchestration and durable execution,
- **AGT-07** — human control and approval,
- **AGT-08** — capability interfaces and interoperability,
- **AGT-09** — multi-agent architecture,
- **AGT-10** — agent evaluation,
- **AGT-11** — agent reliability and safety.

These domains provide the architectural building blocks reviewed here. This chapter does not re-teach their detailed mechanics.

---

## 4. Estimated Reading Time

**~60–75 minutes**

The actual time depends on how deeply you work through the review examples and validation exercises.

---

## 5. AGT-12 Review Progression

The three AGT-12 files form a deliberate progression:

```text
01 — Architecture Selection
        │
        │ Which architecture should we choose?
        ▼
02 — End-to-End System Design
        │
        │ How should the selected architecture be composed?
        ▼
03 — Design Review & Architecture Validation
        │
        │ Is the resulting architecture defensible?
        ▼
Validated Architecture
```

The distinction is important:

| File | Primary question |
|---|---|
| Lesson 01 | **Which architecture should we choose, and why?** |
| Lesson 02 | **How should the selected architecture be composed?** |
| Lesson 03 | **Can we defend and validate the resulting architecture?** |

Lesson 03 therefore does not redesign the system from scratch. It **challenges the design produced by Files 01 and 02**.

---

# 6. Why Architecture Review Exists

Architecture review is a structured engineering activity used to determine whether a proposed system design is defensible against its requirements, constraints, risks, and operating context.

It is not:

- a presentation exercise,
- approval based on diagram quality,
- a framework-selection meeting,
- a code review,
- a generic QA activity,
- a substitute for implementation testing.

A strong architecture review asks:

> **What problem are we solving, what requirements must the system satisfy, what risks does the architecture introduce, and what evidence supports the important architectural claims?**

The review should identify architectural problems while they are still relatively inexpensive to change.

A useful model is:

```text
Requirements
     ↓
Architecture
     ↓
Assumptions
     ↓
Risks
     ↓
Controls
     ↓
Validation Evidence
     ↓
Decision
```

---

# 7. Architecture Review vs Architecture Validation

Architecture review and architecture validation are related but distinct.

## Architecture Review

Asks:

> **Does the proposed architecture make sense given what we currently know?**

It examines:

- requirements,
- architecture decisions,
- alternatives,
- responsibilities,
- boundaries,
- assumptions,
- failure paths,
- controls,
- operational implications,
- architectural risks.

## Architecture Validation

Asks:

> **What evidence supports the important claims made about this architecture?**

It may use:

- prototypes,
- benchmarks,
- evaluation results,
- failure and recovery tests,
- safety tests,
- load tests,
- integration tests,
- latency measurements,
- cost measurements,
- human-review exercises.

The relationship is:

```text
Architecture Review
        ↓
Reason about the design
        ↓
Identify important uncertainties
        ↓
Identify important architectural claims
        ↓
Determine required evidence
        ↓
Architecture Validation
        ↓
Reduce relevant uncertainty
        ↓
Update architectural decision if necessary
```

A review without evidence can become opinion-driven.

Validation without architectural reasoning can test the wrong system.

Strong engineering requires both.

---

# 8. The Architecture Review Mindset

The reviewer should not ask only:

> "Can this architecture work?"

A stronger question is:

> **Is this architecture justified by the requirements, risks, constraints, and expected operating conditions?**

This changes the review from possibility to engineering judgment.

For example:

```text
Can four agents solve the task?
        ↓
Probably.

Does the task require four agents?
        ↓
Unknown.

What requirement requires independent agents?
        ↓
Identify it.

Could a simpler architecture satisfy the requirement?
        ↓
Compare alternatives.

What risks does the selected architecture introduce?
        ↓
Identify them.

What evidence supports the decision?
        ↓
Validate it.
```

The reviewer is therefore evaluating **architectural reasoning**, not architectural sophistication.

---

# 9. Architecture Review Model

A practical architecture review can be organized around the following areas:

```text
                    Architecture Review
                           |
        +------------------+------------------+
        |                  |                  |
   Requirements        Architecture       Boundaries
        |                  |                  |
        +------------------+------------------+
                           |
        +------------------+------------------+
        |                  |                  |
     Execution           State             Failure
        |                  |                  |
        +------------------+------------------+
                           |
        +------------------+------------------+
        |                  |                  |
      Safety          Human Control       Evaluation
        |                  |                  |
        +------------------+------------------+
                           |
                    Operations & Evolution
```

These areas are not independent checkboxes.

A weakness in one area can propagate into others.

For example:

```text
Unclear State Ownership
        ↓
Incorrect Recovery
        ↓
Duplicate Action
        ↓
Safety Risk
        ↓
Evaluation Difficulty
        ↓
Operational Incident
```

Architecture review therefore looks for **relationships between decisions**, not only isolated defects.

---

# 10. Requirements Traceability

Every significant architectural decision should be traceable to a requirement, constraint, risk, or explicit assumption.

A useful question is:

> **Why does this architectural component or boundary exist?**

"Because the framework supports it" is not sufficient architectural justification.

A stronger explanation is:

> "The system requires independent approval of high-impact actions, so consequential capabilities cross an explicit approval boundary before execution."

A useful traceability chain is:

```text
Requirement
     ↓
Architecture Driver
     ↓
Architecture Decision
     ↓
Component / Boundary
     ↓
Expected Behavior
     ↓
Validation Claim
     ↓
Validation Evidence
```

### Example

**Requirement**

> High-impact account changes require human approval.

**Architecture decision**

> Account-changing capabilities cross an explicit approval boundary before execution.

**Expected behavior**

> An unapproved account-changing request cannot produce the external effect.

**Validation claim**

> The architecture prevents execution when approval is absent or invalid.

**Evidence**

> Tests demonstrate that the capability cannot execute without the required authorization and approval state.

This creates a chain from requirement to evidence.

---

# 11. Requirements Review

Before reviewing architecture, verify that the problem itself is sufficiently understood.

## Problem

Ask:

- What problem is being solved?
- Who experiences the problem?
- What outcome is required?
- What happens if the system does nothing?

## Agent Justification

Ask:

- Why does this problem require an agent?
- Could deterministic software solve it?
- Could an LLM-assisted workflow solve it?
- Does the problem require dynamic decision-making?
- Does the problem require autonomous action?

## Success and Failure

Ask:

- What does successful behavior mean?
- What does partial success mean?
- What constitutes failure?
- Which failures are acceptable?
- Which failures are unacceptable?

## Constraints

Ask:

- What latency is acceptable?
- What cost is acceptable?
- What availability is required?
- What actions are prohibited?
- What data may be accessed?
- What human controls are required?

If requirements are materially unclear, architecture approval should normally be deferred rather than allowing architecture to compensate for an undefined problem.

---

## 12. Architecture Decision Review

Once requirements are understood, review the architecture itself.

Ask:

- Why was this architecture selected?
- What alternatives were considered?
- Why were they rejected?
- What assumptions influenced the decision?
- What requirements eliminate simpler alternatives?
- What requirements justify additional complexity?
- What risks are introduced by the chosen architecture?
- What risks are reduced?
- What capabilities are intentionally excluded?
- Is the selected architecture the minimum sufficient architecture?

The reviewer should be able to explain:

```text
Requirement
     ↓
Constraint
     ↓
Architecture Driver
     ↓
Selected Option
     ↓
Trade-off
     ↓
Consequence
```

If this reasoning cannot be explained, the architecture decision is not yet sufficiently defensible.

---

# 13. Review of Architectural Alternatives

A design review should understand meaningful alternatives rather than evaluating the selected architecture in isolation.

Potential options include:

| Option | Potential Strength | Potential Cost |
|---|---|---|
| Deterministic workflow | Predictability and control | Limited dynamic behavior |
| LLM-assisted workflow | Flexible interpretation | Model uncertainty |
| Single agent | Flexible decision-making | Greater behavioral uncertainty |
| Bounded agent loop | Controlled autonomy | Runtime complexity |
| Planner / executor | Explicit planning separation | Additional coordination |
| Supervisor architecture | Delegation and specialization | Coordination overhead |
| Multi-agent | Independent specialization | Larger failure and communication surface |
| Hybrid workflow + agent | Deterministic control with targeted autonomy | Additional boundaries |

These are architectural alternatives, not maturity stages.

The review question is:

> **Which option best satisfies the actual requirements and risk constraints?**

---

## 14. Assumption Review

Architectures often depend on assumptions that are never explicitly documented.

Examples include:

- the model will usually produce valid structured output,
- a dependency will remain available,
- a tool will respond within a particular latency,
- state will remain consistent,
- an approval service will remain available,
- a model provider will preserve required behavior,
- workload characteristics will remain within expected ranges.

An assumption is not necessarily wrong.

The problem is an **unrecognized assumption**.

A useful review table is:

| Assumption | Why It Matters | Failure if False | Validation |
|---|---|---|---|
| Tool latency remains below threshold | Affects response latency | Requests exceed SLA | Latency testing |
| Approval service is available | Controls high-risk actions | Action cannot proceed | Dependency failure test |
| Model produces valid action schema | Affects safe execution | Invalid action reaches boundary | Schema/adversarial testing |
| State remains consistent | Affects recovery | Incorrect or duplicate actions | Recovery/concurrency testing |

The key question is:

> **Which assumptions would cause the architecture to become invalid if they were false?**

Those assumptions deserve explicit validation or acceptance.

---

## 15. Responsibility, Interface, and Authority Review

Every major component should have a clear responsibility.

Ask:

1. What does this component own?
2. What does it explicitly not own?
3. What inputs does it accept?
4. What outputs does it produce?
5. What state does it own?
6. What authority does it have?
7. What failures can it produce?
8. Who depends on it?
9. Can its implementation change independently?
10. Can its behavior be evaluated independently?

A healthy architecture avoids ambiguous ownership.

For example:

```text
Model
  |
  | proposes action
  v
Agent Runtime
  |
  | requests capability
  v
Capability Boundary
  |
  | authorization / policy
  v
Business Service
  |
  | owns business state
  v
Database
```

This keeps model reasoning, authorization, capability execution, and business-state ownership distinct.

---

# 16. Boundary Justification

A component or interface boundary should have an architectural reason.

Possible reasons include:

- responsibility isolation,
- authority isolation,
- failure containment,
- security,
- scaling independence,
- lifecycle independence,
- ownership,
- interoperability,
- evolution.

A boundary that has no meaningful architectural reason is a candidate for consolidation.

This connects directly to Lesson 01's complexity budget:

```text
Lesson 01
Should this structure exist?

        ↓

Lesson 02
What responsibility and authority does it own?

        ↓

Lesson 03
Is that boundary justified and validated?
```

Logical separation does not automatically require physical service separation.

---

# 17. Interface Review

Architectural boundaries become meaningful only when their contracts are clear.

Review:

- API contracts,
- capability interfaces,
- tool contracts,
- state interfaces,
- event contracts,
- authorization interfaces,
- protocol boundaries,
- version compatibility,
- ownership.

Ask:

> **What happens if this interface changes?**

A useful interface review considers both current behavior and evolution.

### Example

Suppose an agent calls:

```text
update_customer(customer_id, changes)
```

The architecture review should establish:

- who owns the contract,
- who validates the request,
- who authorizes it,
- who owns the resulting business state,
- how failures are represented,
- how duplicate requests are handled,
- how the interface is versioned.

AGT-03 and AGT-08 own detailed tool and protocol mechanics.

AGT-12 reviews how those boundaries fit into the overall architecture.

---

# 18. Execution Review

The reviewer should be able to explain the complete execution path.

At minimum:

```text
Request
   ↓
Authentication / Authorization
   ↓
Context / State
   ↓
Agent Runtime
   ↓
Model Decision
   ↓
Policy / Control
   ↓
Capability Execution
   ↓
External Effect
   ↓
State Update
   ↓
Result
```

Then ask:

- What can happen at each step?
- What can fail?
- What happens after failure?
- Which steps are retryable?
- Which steps create side effects?
- Which steps require approval?
- Which steps must be observable?
- Can execution become unbounded?
- Can execution terminate safely?

A design that cannot explain its execution path clearly is difficult to validate and operate.

---

# 19. State Review

State review should focus on ownership, authority, and lifecycle.

Ask:

- What state exists?
- Who owns each state?
- Where is it persisted?
- Who can mutate it?
- What is authoritative?
- What happens after restart?
- What happens if state is stale?
- What happens if two executions update the same state?
- What happens after partial failure?
- What state is required for recovery?
- What state is merely telemetry?

Review the distinction:

```text
Application State
       |
       +── Business truth

Execution State
       |
       +── Runtime / workflow progress

Agent Memory
       |
       +── Information used for future reasoning

Telemetry
       |
       +── Evidence about system behavior
```

These may share infrastructure, but they should not silently share ownership semantics.

---

# 20. Failure-Path Review

The happy path is only one possible execution path.

A design review should inspect:

```text
Normal Execution
       |
       +── Model failure
       |
       +── Tool failure
       |
       +── Timeout
       |
       +── Authorization rejection
       |
       +── Policy rejection
       |
       +── Approval rejection
       |
       +── Approval timeout
       |
       +── State persistence failure
       |
       +── Duplicate execution
       |
       +── Partial completion
       |
       +── Dependency outage
       |
       +── Unsafe behavior
       |
       +── Execution limit reached
       |
       +── Unrecoverable state
```

For each important failure, ask:

> **What does the system do next?**

Possible outcomes include:

- retry,
- fallback,
- compensate,
- escalate,
- pause,
- resume,
- terminate,
- contain,
- record partial completion,
- request human intervention.

A failure without a defined outcome is an architectural gap.

---

# 21. Recovery Semantics Review

Recovery must preserve the semantics of the action being recovered.

Consider:

```text
Create Payment
      ↓
Payment succeeds
      ↓
Response is lost
      ↓
Agent retries
```

If the architecture cannot distinguish:

```text
Payment failed
```

from:

```text
Payment succeeded but confirmation was lost
```

the retry may create a duplicate payment.

Review:

- Is the operation idempotent?
- Can it be safely retried?
- Can the system determine whether the side effect occurred?
- Is compensation available?
- Is human intervention required?
- Is the action reversible?

The principle is:

> **Recovery logic must respect the semantics and consequences of the action being recovered.**

---

# 22. Safety and Human-Control Review

Safety and human control should be reviewed as architectural properties rather than isolated features.

## Safety

Ask:

- What capabilities can the agent access?
- What actions can it perform?
- Which actions are prohibited?
- Where is authorization enforced?
- Where is action validation enforced?
- Where is approval required?
- Can untrusted content influence privileged control decisions?
- What happens if a safety control fails?
- How is execution contained?
- How does the system terminate safely?

A critical architectural distinction is:

```text
Model Reasoning
      ≠
Authorization
      ≠
Capability Execution
```

AGT-11 owns detailed safety and reliability techniques.

AGT-12 evaluates whether those controls are positioned correctly within the architecture.

## Human Control

Ask:

- Which actions require approval?
- Why?
- Who approves?
- What information does the approver receive?
- Can approval become stale?
- What happens if underlying state changes?
- What happens if approval is rejected?
- What happens if approval times out?
- Can execution resume?
- Is the action reversible?

A strong approval boundary may look like:

```text
Proposed Action
      ↓
Risk Classification
      ↓
Approval Required
      ↓
Human Decision
      ↓
State Revalidation
      ↓
Authorization Revalidation
      ↓
Execution
```

AGT-07 owns approval mechanics.

AGT-12 reviews where human control belongs in the overall architecture.

---

# 23. Evaluation and Observability Review

## Evaluation

Architecture review should determine whether the system can generate sufficient evidence to evaluate important behavior.

Ask:

- What behaviors matter?
- Where are execution traces captured?
- Can important decisions be reconstructed?
- Are tool calls observable?
- Can failures be evaluated?
- Can safety behavior be evaluated?
- Can regressions be detected?
- Can evaluation results influence release decisions?
- Is required evaluation data retained appropriately?

The architectural relationship is:

```text
Execution
    ↓
Evidence
    ↓
Evaluation
    ↓
Engineering Signal
    ↓
Change
    ↓
Regression Evaluation
    ↓
Release Decision
```

AGT-10 owns evaluation methodology.

AGT-12 evaluates whether the architecture provides the evidence and integration points required for that methodology.

## Observability

Observability should answer:

> **What evidence will engineers need to understand what happened?**

Review whether the architecture can expose:

- request history,
- execution history,
- model calls,
- tool invocations,
- state transitions,
- approvals,
- failures,
- retries,
- latency,
- token usage,
- cost,
- external effects.

A useful distinction is:

```text
State
"What is true?"

Telemetry
"What happened?"

Evaluation Evidence
"How well did it behave?"
```

These are related but not interchangeable.

---

# 24. Dependency, Scalability, and Cost Review

## Dependency Review

For each important dependency ask:

- Is it required for normal execution?
- Is it required for recovery?
- What happens if it becomes unavailable?
- Is there a fallback?
- Is it a single point of failure?
- Can the system degrade safely?
- What happens during version changes?
- Who owns the dependency?
- What latency and availability assumptions exist?

Review both technical dependency and architectural coupling.

## Scalability Review

Ask:

- What grows with traffic?
- What grows with concurrent executions?
- What grows with tool usage?
- What grows with state?
- What grows with model calls?
- What becomes a coordination bottleneck?
- Which component has the strongest scaling constraint?
- Does increased concurrency create consistency or safety problems?

For example:

```text
Requests ↑
   ↓
Agent Executions ↑
   ↓
Tool Calls ↑
   ↓
External API Limit Reached
   ↓
Retries ↑
   ↓
Load Increases Further
```

Scalability is therefore a system property, not simply a matter of adding runtime instances.

## Cost Review

Consider:

- model calls,
- model-call count,
- agent coordination,
- tool calls,
- retrieval,
- memory operations,
- orchestration,
- storage,
- human review,
- retries,
- failed execution,
- evaluation,
- observability.

Every additional architectural layer should have enough value to justify its cost.

---

# 25. Maintainability and Evolution Review

Architecture should be evaluated against expected change.

Ask:

- Can the model provider change?
- Can tools change independently?
- Can state schemas evolve?
- Can prompts change without breaking interfaces?
- Can policies evolve independently?
- Can evaluation datasets change?
- Can workflow definitions change?
- Can components be replaced?
- Can in-flight executions finish safely?
- Can dependencies be upgraded without coordinated rewrites?

A useful principle is:

> **Change should remain localized where the architecture allows it to be localized.**

If changing one model requires rewriting tools, workflows, state, and evaluation components, the architecture contains excessive coupling.

---

## 26. Architecture Anti-Patterns

Anti-patterns should be used as **review prompts**, not as a separate architecture curriculum.

| Anti-pattern | Why it matters | Review question |
|---|---|---|
| Framework-first architecture | Implementation capability drives architecture | What requirement drove the framework choice? |
| Multi-agent by default | Adds coordination and failure surface | What specifically requires independent agents? |
| Tool explosion | Expands capability and security surface | Why does each capability exist? |
| Centralized everything | Creates ambiguous ownership and coupling | Which responsibilities should remain separate? |
| Hidden state | Weakens recovery and reasoning | Who owns this state? |
| Happy-path architecture | Ignores real failure behavior | What happens when this step fails? |
| Safety afterthought | Some controls require architectural boundaries | Where is authority constrained? |
| Evaluation after deployment | Architecture may lack required evidence | What behavior can be evaluated today? |
| Unbounded autonomy | Creates uncontrolled execution risk | What limits execution? |
| Over-orchestration | Adds unnecessary coordination | What requirement justifies each orchestration layer? |
| Architecture by diagram | Structure is mistaken for proof | What evidence supports the important claims? |
| Agent for deterministic work | Adds unnecessary uncertainty and cost | Why is dynamic reasoning required? |

The goal is not to eliminate complexity.

The goal is to ensure that complexity is **intentional, justified, and bounded**.

---

## 27. Risk-Driven Architecture Validation

Architecture validation should focus on the assumptions and claims whose failure could materially invalidate the design.

The model is:

```text
Architecture Claim
        ↓
Identify Critical Uncertainty
        ↓
Select Appropriate Evidence
        ↓
Run Validation
        ↓
Analyze Result
        ↓
Conclusion
        ↓
Architecture Decision
```

The objective is not to validate every property equally.

It is to validate the properties that matter most to the architecture's requirements and risk profile.

---

# 28. Validation Claims

Validation should begin with an explicit claim.

Examples:

> The architecture can support 500 concurrent executions within the required latency.

> High-impact actions cannot execute without the required authorization and approval.

> A failed external confirmation does not cause duplicate financial actions.

> The system can recover an interrupted long-running execution without losing required state.

> Evaluation traces contain sufficient evidence to assess important agent behavior.

These are **architectural claims**.

Validation evidence should be selected to test those claims.

---

## 29. Claim → Evidence → Conclusion

A strong validation record connects the claim to representative evidence and an explicit conclusion.

```text
Claim
  ↓
Validation Method
  ↓
Test Conditions
  ↓
Observed Evidence
  ↓
Conclusion
  ↓
Architectural Decision
```

### Example

**Claim**

> The architecture supports 500 concurrent executions within the required latency.

**Validation method**

> Representative load test.

**Test conditions**

> 500 concurrent executions using production-like model, tool, state, and dependency behavior.

**Evidence**

```text
p95 latency: X
error rate: Y
timeout rate: Z
```

**Conclusion**

> Claim supported / partially supported / unsupported.

**Architecture decision**

> Keep architecture / adjust capacity / redesign bottleneck.

This is stronger than simply stating:

> "Load testing was performed."

---

# 30. Validation Evidence Quality

Evidence is useful only when it meaningfully represents the claim being evaluated.

For example:

```text
Claim:
The system meets its latency requirement under expected concurrency.

Weak Evidence:
Developer intuition

        ↓

Better:
Single local test

        ↓

Stronger:
Representative benchmark

        ↓

Stronger still:
Production-like load test
```

The appropriate level depends on the claim.

A local prototype may be sufficient to validate whether an interface is technically feasible.

It is not sufficient to establish production scalability.

The principle is:

> **Validation evidence should meaningfully represent the requirement, operating condition, and risk described by the claim.**

Evidence should therefore be evaluated for:

- relevance,
- representativeness,
- test conditions,
- coverage,
- repeatability where appropriate,
- limitations,
- confidence.

---

# 31. Risk-to-Evidence Mapping

Different architectural risks require different evidence.

| Risk | Potential Evidence |
|---|---|
| Model behavior uncertainty | Evaluation |
| Latency uncertainty | Benchmark / load test |
| Tool reliability | Integration / failure tests |
| Recovery uncertainty | Failure / recovery testing |
| Safety uncertainty | Safety / adversarial testing |
| Cost uncertainty | Cost measurement |
| Scalability uncertainty | Load / capacity testing |
| Dependency behavior | Integration / dependency tests |
| Human approval usability | Human-review exercise |
| State recovery | Restart / persistence testing |
| Interface compatibility | Contract / integration testing |

There is no requirement to perform every validation method for every architecture.

The principle is:

> **Validate the risks that matter most.**

---

## 32. Prototype Validation

A prototype is useful when a key architecture assumption is uncertain.

For example:

> Can a bounded agent reliably choose among six capabilities while maintaining acceptable latency and cost?

A targeted prototype can answer that question before the team builds the full production system.

But:

> **Prototype success does not equal complete architecture validation.**

A prototype may validate one dimension while leaving others unresolved.

For example:

```text
Prototype
   ↓
Tool Selection Works
```

does not prove:

```text
Recovery Works
Safety Works
Scaling Works
State Ownership Works
Cost Is Acceptable
```

Prototype evidence must therefore be interpreted within the architecture's risk model.

---

# 33. Failure and Recovery Validation

Failure testing should answer questions such as:

- What happens when the model fails?
- What happens when a tool times out?
- What happens when the database is unavailable?
- What happens when approval expires?
- What happens when state cannot be persisted?
- What happens after process restart?
- What happens after partial completion?
- What happens when an external effect succeeds but confirmation is lost?

A strong validation exercise does not merely verify that an error is returned.

It verifies that the **resulting system state remains safe, recoverable, and understandable**.

---

## 34. Safety Validation

Safety validation should test architectural controls under failure and adversarial conditions.

Examples include:

- unauthorized action attempts,
- malformed action requests,
- untrusted content attempting to influence privileged behavior,
- approval bypass attempts,
- capability misuse,
- policy failure,
- unexpected tool output,
- termination failure.

The key question is:

> **Does the architecture remain within its intended authority boundaries when components behave incorrectly or adversarially?**

This is stronger than checking whether a prompt produces a safe answer.

---

## 35. Architecture Fitness

An architecture is fit when it satisfies the required system properties within acceptable constraints.

Relevant dimensions include:

- correctness,
- reliability,
- safety,
- latency,
- cost,
- scalability,
- maintainability,
- observability,
- testability,
- operability,
- evolvability.

These dimensions should not be collapsed into a universal score.

A system might be:

```text
Excellent on cost
Excellent on latency
Weak on safety
Weak on recoverability
```

Such a system may still be unacceptable for a high-impact use case.

Fitness is therefore contextual.

The correct question is:

> **Is the architecture fit for this system's requirements and risk profile?**

---

# 36. Architecture Review Findings

Review findings should distinguish observation from recommendation.

A useful structure is:

```text
Finding
Evidence
Impact
Severity
Recommendation
Required Action
Validation Needed
```

### Example

**Finding**

Approval state is not revalidated before execution.

**Evidence**

The execution path proceeds directly from approval to capability execution.

**Impact**

An approved action may execute against changed application state or authorization conditions.

**Severity**

Major.

**Recommendation**

Add state and authorization revalidation before consequential execution.

**Required action**

Update the architecture and define the revalidation boundary.

**Validation needed**

Test state mutation and authorization changes between approval and execution.

This structure makes review findings actionable.

---

# 37. Review Finding Severity

Not every review finding has the same importance.

## Critical

The issue can invalidate the architecture or create unacceptable risk.

Examples:

- unauthorized consequential actions,
- no safe termination path,
- corrupted authoritative state,
- architecture cannot satisfy a hard requirement.

## Major

The architecture can potentially work but requires significant correction.

Examples:

- unclear recovery,
- major hidden coupling,
- missing critical validation evidence,
- severe scalability bottleneck.

## Moderate

The architecture is workable but contains meaningful engineering debt.

Examples:

- weak observability,
- unclear versioning,
- avoidable coordination complexity.

## Minor

The issue does not materially block the architecture.

Examples:

- documentation gaps,
- naming inconsistencies,
- non-critical review metadata.

Severity should be based on system impact, not reviewer preference.

---

## 38. Architecture Review Outcomes

A review should end with an explicit decision.

## Approved

The architecture satisfies requirements and identified risks are acceptable.

## Approved with Changes

The overall architecture is sound, but specific issues must be resolved before implementation or production.

## Rejected

The architecture does not satisfy important requirements or contains unacceptable architectural risks.

## Deferred

The architecture cannot yet be evaluated because important requirements, assumptions, or evidence are missing.

A review should not end with:

> "Looks good."

It should produce an explicit engineering decision.

A useful relationship is:

```text
Critical unresolved issue
        ↓
Reject / Defer

Major unresolved issue
        ↓
Approved with mandatory changes

Minor issue
        ↓
May be accepted with recorded follow-up
```

---

# 39. Architecture Review Workflow

A practical review can follow:

```text
Understand Requirements
        ↓
Inspect Architecture
        ↓
Trace Decisions
        ↓
Challenge Assumptions
        ↓
Review Responsibilities & Boundaries
        ↓
Review Execution & State
        ↓
Review Failure & Recovery
        ↓
Review Safety & Human Control
        ↓
Review Evaluation & Observability
        ↓
Review Dependencies & Operations
        ↓
Review Maintainability & Evolution
        ↓
Identify Architectural Claims
        ↓
Determine Validation Evidence
        ↓
Review Evidence
        ↓
Record Findings
        ↓
Decision
```

The process is iterative.

If validation invalidates an architectural assumption:

```text
Validation Result
       ↓
Architecture Assumption Invalid
       ↓
Revisit Architecture Decision
       ↓
Redesign
       ↓
Revalidate
```

Architecture review can therefore trigger architectural refinement rather than simply approving or rejecting an unchanged design.

---

# 40. Architecture Review Record

A practical review record can contain:

```text
Architecture:
<selected architecture>

Problem:
<problem being solved>

Key Requirements:
<important requirements>

Major Decisions:
<important architectural decisions>

Alternatives Considered:
<meaningful alternatives>

Trade-offs:
<major trade-offs>

Critical Assumptions:
<assumptions>

Architectural Claims:
<important claims requiring validation>

Key Risks:
<architecture risks>

Required Controls:
<safety / reliability / operational controls>

Validation Evidence:
<evidence supporting important claims>

Review Findings:
<findings using the review structure>

Open Questions:
<remaining uncertainty>

Decision:
<approved / approved with changes / rejected / deferred>
```

This is a reusable engineering pattern rather than a mandatory organizational template.

---

# 41. Practical Case Study — Enterprise Customer Support Agent

Consider an enterprise support system with the following requirements:

- answer customer questions,
- retrieve account information,
- update support tickets,
- escalate sensitive cases,
- maintain acceptable response latency.

A candidate architecture is:

```text
Customer Request
       ↓
Authentication / Authorization
       ↓
Deterministic Entry / Policy
       ↓
Agent for Interpretation
       ↓
Controlled Capability Boundary
       ↓
Ticket / Account Services
       ↓
Application State
       ↓
Observability / Evaluation
```

The architecture review should ask:

### Requirements

- Which parts actually require model reasoning?
- Which parts can remain deterministic?

### Capability boundaries

- Can the agent directly modify account state?
- Where is authorization enforced?
- Which operations are read-only?
- Which operations have consequential side effects?

### Failure

- What happens when the account service is unavailable?
- What happens when a ticket update succeeds but confirmation is lost?

### Human control

- Which cases require escalation?
- What information is preserved during escalation?

### Evaluation

- Can the architecture capture enough evidence to evaluate answer quality and tool behavior?

The point is not to declare this architecture universally correct.

The point is to demonstrate how the architecture is **challenged against requirements and evidence**.

---

# 42. Practical Case Study — Financial Operations Agent

Consider a system that:

- inspects transactions,
- prepares operational actions,
- executes high-impact changes only after approval,
- maintains auditability,
- recovers safely from failures.

The review should focus heavily on authority and recovery:

```text
Agent Reasoning
      ↓
Action Proposal
      ↓
Policy / Authorization
      ↓
Human Approval
      ↓
State Revalidation
      ↓
Authorization Revalidation
      ↓
Controlled Capability
      ↓
Financial System
      ↓
Audit / Observability
```

Important review questions include:

- Which operations are read-only?
- Which actions create external side effects?
- Which actions require approval?
- Who owns financial state?
- Can actions be retried?
- How are duplicates detected?
- What happens if approval succeeds but execution fails?
- What happens if execution succeeds but confirmation is lost?
- What evidence is retained for evaluation and incident analysis?

The architecture is not validated merely because a successful transaction can be demonstrated.

The review must establish whether **authority, recovery, state ownership, and evidence** remain correct under failure.

---

# 43. Architecture Evolution

A production architecture should be expected to change.

Possible drivers include:

- workload growth,
- new model capabilities,
- new tools,
- reliability incidents,
- new safety requirements,
- changing cost constraints,
- latency requirements,
- new interoperability requirements,
- regulatory requirements,
- organizational changes.

A useful evolution model is:

```text
Current Architecture
        ↓
Observed Limitation
        ↓
New Requirement / Evidence
        ↓
Architecture Decision
        ↓
Migration Strategy
        ↓
Validation
        ↓
Updated Architecture
```

Evolution should preserve important architectural invariants.

For example:

> Replacing a model provider should not silently remove authorization boundaries.

> Replacing a workflow engine should not silently change business-state ownership.

> Introducing multi-agent coordination should not remove existing termination or safety controls.

Architecture evolution is therefore not simply adding capabilities.

It is **changing the system while preserving the properties that must remain true**.

---

# 44. Architecture Review Heuristics

Use these heuristics during design review.

### Heuristic 1 — Every major component needs a reason

> What requirement or risk justifies this component?

### Heuristic 2 — Every authority boundary needs enforcement

> Is the boundary enforced by the architecture rather than documentation alone?

### Heuristic 3 — Every important failure needs a defined outcome

> What happens after this failure?

### Heuristic 4 — Every persistent state needs an owner

> Who owns the authoritative truth?

### Heuristic 5 — Every consequential action needs an explicit capability boundary

> What prevents model reasoning from becoming unauthorized external effect?

### Heuristic 6 — Every important assumption needs validation or acceptance

> What happens if this assumption is false?

### Heuristic 7 — Every added complexity should buy something

> What meaningful requirement does this additional component satisfy?

### Heuristic 8 — Every critical behavior needs evidence

> What evidence supports the architectural claim?

---

## 45. Architecture Review Checklist

## Requirements

- [ ] Problem is clearly defined.
- [ ] Agent justification is explicit.
- [ ] Success and failure criteria are defined.
- [ ] Hard constraints are identified.
- [ ] Risk-sensitive requirements are identified.

## Architecture

- [ ] Architecture is requirements-driven.
- [ ] Meaningful alternatives were considered.
- [ ] Major decisions are justified.
- [ ] Complexity is justified.
- [ ] Architecture is the minimum sufficient architecture.

## Responsibilities and Interfaces

- [ ] Component responsibilities are explicit.
- [ ] Authority boundaries are explicit.
- [ ] Interfaces have clear ownership.
- [ ] Important contracts are versionable.
- [ ] Unnecessary boundaries are avoided.

## Execution and State

- [ ] Normal execution path is understood.
- [ ] Execution limits are defined.
- [ ] State ownership is explicit.
- [ ] Authoritative business state is identifiable.
- [ ] Recovery state is sufficient.
- [ ] State and telemetry are distinguished.

## Failure and Recovery

- [ ] Important failure paths are identified.
- [ ] Retry behavior is justified.
- [ ] Duplicate side effects are considered.
- [ ] Partial completion is handled.
- [ ] Recovery semantics preserve action meaning.
- [ ] Safe termination exists.

## Safety and Human Control

- [ ] Consequential capabilities have explicit boundaries.
- [ ] Authorization is independent of model reasoning.
- [ ] Untrusted information cannot become privileged control input.
- [ ] Approval placement is justified.
- [ ] Approval state can be revalidated where required.
- [ ] Containment and termination are addressed.

## Evaluation and Observability

- [ ] Important behavior can be evaluated.
- [ ] Required execution evidence is captured.
- [ ] Important tool and state transitions are observable.
- [ ] Evaluation can detect meaningful regressions.
- [ ] Evidence retention and access are considered.

## Operations and Evolution

- [ ] Important dependencies are identified.
- [ ] Single points of failure are understood.
- [ ] Scalability constraints are identified.
- [ ] Cost drivers are understood.
- [ ] Major changes can be localized where appropriate.
- [ ] Version compatibility is considered.
- [ ] Architecture can evolve without violating key invariants.

## Validation

- [ ] Important architectural claims are explicit.
- [ ] Critical assumptions are identified.
- [ ] Validation evidence is selected by risk.
- [ ] Evidence meaningfully represents the claim.
- [ ] Results have explicit conclusions.
- [ ] Findings are documented.
- [ ] Review outcome is explicit.

---

## 46. Key Principles

1. Architecture review evaluates whether a design is justified, not whether it looks sophisticated.
2. Requirements should drive architecture decisions.
3. Every important architecture decision should have a reason.
4. Meaningful alternatives should be considered before committing to a design.
5. Assumptions should be visible because hidden assumptions create hidden architectural risk.
6. Component responsibilities and authority boundaries must be explicit.
7. Interfaces should have meaningful ownership and compatibility boundaries.
8. The happy path is insufficient; failure paths are part of architecture.
9. Recovery must preserve the semantics of consequential actions.
10. Persistent state needs explicit ownership and lifecycle semantics.
11. Safety and human control must be architectural boundaries where risk requires them.
12. Evaluation requires sufficient architectural evidence.
13. Observability provides evidence about system behavior but is not the same as state or evaluation.
14. Validation should be risk-driven rather than a fixed checklist.
15. A prototype validates selected assumptions, not automatically the entire architecture.
16. Validation evidence must meaningfully represent the claim being evaluated.
17. Architecture fitness is multidimensional and contextual.
18. Multi-agent architecture must be justified by requirements.
19. Framework capability is not an architectural requirement.
20. Complexity is an engineering cost and should be justified.
21. Architecture review should produce explicit findings and an explicit decision.
22. Architecture should evolve as requirements, evidence, and operating conditions change.
23. Architectural invariants should survive implementation and technology changes.
24. The strongest architecture is not the most complex one; it is the simplest defensible architecture that satisfies the real requirements and can be validated, operated, and evolved safely.

---

## 47. Chapter Completion

You should now be able to review an agent architecture without relying on framework popularity, diagram complexity, or intuition alone.

A strong architecture review should answer:

```text
Why does the system need an agent?
        ↓
Why was this architecture selected?
        ↓
What alternatives were considered?
        ↓
Why does each component exist?
        ↓
Who owns each responsibility and authority?
        ↓
Where is authoritative state owned?
        ↓
What happens when execution fails?
        ↓
Where are safety and human-control boundaries?
        ↓
What important architectural claims exist?
        ↓
What evidence supports those claims?
        ↓
Are the validation conditions representative?
        ↓
What risks remain?
        ↓
Should the architecture be approved?
```

The final architectural standard is not:

> **"Can we build it?"**

It is:

> **"Can we justify it, challenge it, validate its important claims, operate it, and evolve it safely?"**

That is the purpose of architecture review.

---

# 48. AGT-12 Synthesis

The three AGT-12 files establish a complete architecture reasoning cycle:

```text
Requirements
     ↓
01 — Architecture Selection
     ↓
02 — End-to-End System Design
     ↓
03 — Design Review & Validation
     ↓
Evidence
     ↓
Architecture Decision
     ↓
Refinement if required
     ↓
Validated Architecture
```

The three files therefore answer three different questions:

```text
01 — SELECT
Which architecture should we choose?

02 — COMPOSE
How should we compose it into a complete system?

03 — CHALLENGE + VALIDATE
Is the resulting architecture defensible?
```

Together they establish the core AGT-12 principle:

> **Good agent architecture is not the architecture with the most components or the most autonomy. It is the simplest defensible composition of capabilities, controls, state, interfaces, and execution mechanisms that satisfies the system's real requirements and can be justified, validated, operated, and evolved safely.**
