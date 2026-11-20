# PROD-12 — Production Readiness and Architecture Review

## Learning Objectives

By the end of this chapter, you should be able to:

- explain the purpose of a production-readiness review
- distinguish architecture review from implementation review and production-readiness assessment
- translate production requirements into architecture-level review criteria
- identify production constraints, assumptions, dependencies, and risks
- evaluate architecture evidence rather than relying on claims or checklists
- assess readiness across correctness, reliability, security, observability, scalability, performance, cost, operations, lifecycle/evaluation, and change safety
- distinguish critical blockers from bounded non-blocking risks
- identify readiness gaps and unresolved architecture decisions
- reason about conditional readiness and explicit risk acceptance
- evaluate technical debt through its production impact
- make defensible go/no-go decisions
- record architecture and readiness decisions so that they remain explainable and reviewable

---

## Prerequisites

You should understand the concepts covered in the earlier PROD chapters, particularly:

- production system foundations
- packaging and runtime
- serving
- deployment and release
- observability
- reliability
- scaling and capacity
- performance and cost
- security
- operations and incident management
- lifecycle, evaluation, and continuous improvement

You do not need to re-learn those topics here. PROD-12 uses them as inputs to a system-level readiness assessment.

---

## Estimated Reading Time

**35–45 minutes**

---

## Before We Start

Production readiness is not the same as:

- "the application works"
- "the deployment succeeded"
- "the tests passed"
- "the architecture diagram looks good"
- "the infrastructure exists"
- "the monitoring dashboard exists"

A production system must satisfy its actual requirements under realistic operating conditions, with acceptable risk and sufficient evidence.

The central reasoning pattern in this chapter is:

```text
Requirements
      ↓
Architecture
      ↓
Production Constraints
      ↓
Risks
      ↓
Controls
      ↓
Evidence
      ↓
Readiness Gaps
      ↓
Decision
```

The goal is not to produce a checklist that says **yes/no** without reasoning.

The goal is to develop **production-readiness judgment**.

---

# Why This Exists

An AI system can be technically functional and still be unsuitable for production.

For example:

- the model produces correct answers but latency is unacceptable
- the service handles normal traffic but collapses during bursts
- deployment works but recovery has never been tested
- logs exist but operators cannot diagnose failures
- the model performs well offline but quality degradation cannot be detected after release
- the system is secure under normal conditions but has an unresolved high-impact access boundary
- the architecture is reliable but operational cost grows beyond the business constraint
- a dependency failure causes an unacceptable blast radius
- a model change improves quality but creates unacceptable latency or cost
- ownership is unclear when an incident occurs

These are not isolated implementation problems.

They are **production-readiness problems** because they concern whether the complete system can satisfy its requirements safely and sustainably.

PROD-12 therefore brings together the capabilities established across the PROD domain and asks:

> **Is the complete AI system ready to operate under its actual production requirements and constraints?**

---

## Mental Model

A useful production-readiness model is:

```text
Requirements
      ↓
Architecture
      ↓
Production Risks
      ↓
Controls
      ↓
Evidence
      ↓
Readiness Gaps
      ↓
Decision
```

Each stage answers a different question.

### Requirements

What must the system achieve?

### Architecture

How is the system designed to achieve it?

### Production Risks

What could prevent the system from meeting its requirements?

### Controls

What architectural, technical, operational, or organizational mechanisms reduce those risks?

### Evidence

What demonstrates that the controls and architecture actually work?

### Readiness Gaps

What remains incomplete, uncertain, or insufficiently evidenced?

### Decision

Given the requirements, evidence, risks, and constraints, should the system proceed?

This produces a second useful model:

```text
Claim
  ↓
Evidence
  ↓
Confidence
  ↓
Risk
  ↓
Decision
```

A production-readiness review should therefore replace vague statements with specific claims and evidence.

For example:

```text
Weak:
"The system is scalable."

Stronger:
"The system sustained the expected peak workload
at the required latency threshold during representative
load testing, with acceptable resource utilization."
```

The second statement can be evaluated.

---

# Core Concepts

## Production-Readiness Review

A production-readiness review evaluates whether an AI system can satisfy its production requirements with acceptable risk.

It considers the complete system rather than a single component.

The review may consider:

```text
Correctness
Reliability
Security
Observability
Scalability
Performance
Cost
Operations
Lifecycle / Evaluation
Change Safety
```

These dimensions are related.

Improving one dimension can negatively affect another.

For example:

```text
Higher model quality
       ↓
More expensive model
       ↓
Higher latency
       ↓
Higher infrastructure cost
```

Therefore readiness requires system-level reasoning rather than isolated optimization.

---

## Architecture Review vs Implementation Review

These reviews answer different questions.

### Implementation Review

Asks:

> Was the selected design implemented correctly?

Examples:

- Is the retry behavior implemented correctly?
- Is the API validation correct?
- Is the configuration loaded correctly?
- Does the deployment artifact contain the expected version?

### Architecture Review

Asks:

> Is the selected design appropriate for the requirements and constraints?

Examples:

- Is the dependency architecture appropriate?
- Is the failure isolation sufficient?
- Is the chosen model strategy compatible with latency requirements?
- Is the architecture unnecessarily complex?
- Does the design create unacceptable vendor dependency?

### Production-Readiness Review

Asks:

> Can the complete system responsibly operate in production?

A system can therefore pass implementation review while failing production-readiness review.

---

## Production Requirements

Production requirements describe what the system must achieve.

Examples include:

- latency requirements
- availability requirements
- throughput requirements
- quality requirements
- security requirements
- recovery requirements
- cost limits
- compliance obligations
- operational requirements
- change-safety requirements

Requirements should be specific enough to evaluate.

Compare:

```text
"The system should be fast."
```

with:

```text
"95% of interactive requests must complete
within the approved latency threshold under
the expected production workload."
```

The second statement provides a basis for validation.

---

## Production Constraints

Production requirements describe what the system must achieve.

Production constraints describe the conditions within which it must achieve them.

Examples include:

- budget limits
- latency limits
- provider restrictions
- approved technology constraints
- data residency requirements
- infrastructure limitations
- staffing and operational capacity
- deployment constraints
- workload characteristics
- organizational policies
- dependency limitations
- availability requirements

The distinction is important.

For example:

```text
Requirement:
The service must meet the approved latency target.

Constraint:
The system must use the approved external model provider.
```

The architecture decision must satisfy both.

A design can therefore be technically capable of meeting a requirement while still being unsuitable because it violates a meaningful production constraint.

A strong review asks:

> **Can this architecture satisfy the requirements within the actual production constraints?**

---

## Acceptance Criteria

Acceptance criteria convert requirements into conditions that can be evaluated.

For example:

```text
Requirement:
The service must remain usable during a model-provider outage.

Acceptance criteria:
Requests must either fail within the approved timeout,
use an approved fallback path, or degrade according
to the defined service behavior.
```

Good acceptance criteria should be:

- specific
- testable
- relevant to the requirement
- measurable where appropriate
- connected to evidence

Acceptance criteria should not merely restate implementation tasks.

---

## Readiness Dimensions

A comprehensive readiness review considers multiple dimensions.

### Correctness

Does the system perform the intended function?

For AI systems this may include:

- functional correctness
- model behavior
- retrieval correctness
- tool behavior
- output validation
- task-specific quality

### Reliability

Can the system continue operating under expected failures and degraded conditions?

Questions include:

- What happens when dependencies fail?
- What happens under overload?
- What happens when the model provider is unavailable?
- What happens when a downstream service becomes slow?

### Security

Are the system's security risks appropriately controlled?

The review may consider:

- identity
- authorization
- secrets
- supply-chain risks
- tenant isolation
- AI-specific threats
- sensitive data handling

Detailed security mechanisms remain within PROD-09.

PROD-12 evaluates whether the resulting security posture is sufficient for production.

### Observability

Can operators understand meaningful system behavior?

The review should ask:

- Can important failures be detected?
- Can symptoms be distinguished from likely causes?
- Is sufficient evidence available for diagnosis?
- Are important AI-quality signals visible?

Logs alone do not automatically constitute sufficient observability.

### Scalability

Can the architecture handle expected workload?

Consider:

- expected traffic
- peak traffic
- bursts
- concurrency
- resource limits
- dependency capacity
- scaling behavior

### Performance

Can the system satisfy performance requirements?

Consider:

- latency
- throughput
- resource utilization
- model inference characteristics
- retrieval behavior
- external dependency latency

### Cost

Is the system economically sustainable?

Consider:

- model cost
- infrastructure cost
- storage
- network usage
- observability cost
- scaling cost
- operational cost

A technically functional system may still be unsuitable for production if its cost violates meaningful constraints.

### Operations

Can the system be responsibly operated?

Consider:

- ownership
- on-call readiness
- runbooks
- escalation
- incident handling
- recovery
- operational dependencies

### Lifecycle / Evaluation

Can the system evolve safely?

Consider:

- evaluation
- regression detection
- quality monitoring
- model changes
- prompt changes
- configuration changes
- dependency changes

Detailed lifecycle and evaluation mechanisms remain within PROD-11.

### Change Safety

Can the system change without creating uncontrolled production risk?

Consider:

- deployment safety
- rollback or alternative recovery paths
- progressive change
- validation gates
- versioning
- configuration management
- reversibility

---

# Internal Working

## From Requirements to Readiness

A production-readiness review can be performed as a sequence of reasoning steps.

### Step 1 — Establish Requirements

Identify what the system must guarantee.

```text
Functional requirements
Performance requirements
Reliability requirements
Security requirements
Quality requirements
Operational requirements
Cost constraints
Recovery requirements
Change-safety requirements
```

---

### Step 2 — Identify Architecture

Understand how the system is expected to satisfy those requirements.

Review:

- system boundaries
- critical paths
- dependencies
- failure domains
- data flows
- model dependencies
- external providers
- operational boundaries

The goal is not to redesign the architecture automatically.

The goal is to determine whether the architecture is appropriate for the stated requirements and constraints.

---

### Step 3 — Identify Production Risks

Ask:

> What could prevent this architecture from satisfying its requirements?

Examples:

```text
External provider outage
        ↓
No fallback
        ↓
Interactive requests fail

OR

Traffic spike
        ↓
Capacity exceeded
        ↓
Latency increases
        ↓
User experience degrades
```

Risk analysis should consider both likelihood and impact.

---

### Step 4 — Identify Controls

For each meaningful risk, identify the control intended to reduce it.

Example:

```text
Risk:
Model provider outage

Control:
Approved fallback path

Evidence:
Failure-injection test demonstrates
fallback behavior within the required timeout.
```

The existence of a control is not equivalent to proof that the control works.

---

### Step 5 — Evaluate Evidence

Evidence should be relevant to the actual requirement.

Examples:

```text
Architecture evidence
Test evidence
Load-test evidence
Security evidence
Operational evidence
Recovery evidence
AI-quality evidence
Cost evidence
```

Evidence should be representative enough to support the claim being made.

---

### Step 6 — Identify Readiness Gaps

A gap may exist because:

- a requirement is unmet
- a control is missing
- evidence is insufficient
- an assumption has not been validated
- ownership is unclear
- a dependency remains uncontrolled
- a failure path has not been tested
- a decision remains unresolved

---

### Step 7 — Make the Decision

The review should produce an explicit decision.

```text
Ready
```

when critical requirements are satisfied and evidence is sufficient.

```text
Conditionally Ready
```

when remaining gaps are bounded, understood, owned, and explicitly accepted.

```text
Not Ready
```

when critical requirements are unmet, evidence is insufficient, or residual risk is unacceptable.

These labels are an engineering decision model, not a universal organizational certification.

---

## Architecture Review Questions

A useful architecture review asks questions across the system.

### Requirements

- What must the system guarantee?
- Which requirements are critical?
- What failure modes are unacceptable?
- What workload assumptions exist?
- What quality requirements exist?
- What constraints cannot be violated?

### Architecture

- Are system boundaries clear?
- Are dependencies understood?
- Are critical paths identified?
- Are failure domains understood?
- Are there unnecessary dependencies?
- Are important assumptions visible?

### Reliability

- What happens when dependencies fail?
- What happens under overload?
- What happens when the model provider becomes unavailable?
- What happens when a dependency becomes slow rather than unavailable?
- Can the system degrade safely?

### Observability

- Can operators detect meaningful failures?
- Can they distinguish symptoms from causes?
- Is sufficient evidence available for diagnosis?
- Can AI-quality degradation be detected?

### Scaling

- Can the architecture handle expected demand?
- What happens during bursts?
- Where are the resource bottlenecks?
- What dependency limits exist?

### Performance and Cost

- Are latency requirements achievable?
- Is throughput sufficient?
- Is the system economically sustainable?
- What happens to cost as workload grows?
- Are cost drivers understood?

### Security

- Are identity and authorization boundaries appropriate?
- Are secrets protected?
- Are artifacts and dependencies trustworthy?
- Are relevant AI-specific attack surfaces addressed?

### Operations

- Is ownership clear?
- Is on-call responsibility established?
- Can operators diagnose failures?
- Can the system be recovered?
- Are operational dependencies understood?

### Lifecycle

- Can changes be evaluated?
- Can regressions be detected?
- Can model or prompt changes be qualified?
- Can the system evolve safely?

---

# Unresolved Architecture and Readiness Decisions

Not every problem discovered during a review is simply a "risk."

Some issues represent decisions that have not yet been made.

Examples:

```text
Risk:
External provider outage could make the service unavailable.

Gap:
No tested fallback exists.

Unresolved decision:
Should the system use a fallback provider,
degraded mode, or accept provider dependency
as a business risk?
```

These categories should remain distinct.

### Risk

Something could negatively affect the system.

### Gap

A required capability, control, or evidence is missing or insufficient.

### Unresolved Decision

A meaningful architectural or readiness choice has not yet been resolved.

An unresolved decision should be made explicit rather than hidden inside a generic risk list.

For each unresolved decision, capture:

- decision required
- context
- options
- constraints
- trade-offs
- evidence available
- risks
- decision owner
- decision deadline or trigger
- consequence of deferral

A review should not silently convert unresolved decisions into accepted risk.

---

# Example or Practical Implementation

## AI Customer Support Service

Consider an AI customer-support service with:

```text
Client
  ↓
API Layer
  ↓
AI Orchestration
  ├── Retrieval System
  ├── Model Provider
  └── Business APIs
        ↓
Observability / Operations
```

The service has the following requirements:

| Dimension | Requirement |
|---|---|
| Correctness | Responses must satisfy defined task-quality criteria |
| Latency | Interactive requests must remain within the approved threshold |
| Reliability | Critical dependencies must have appropriate failure behavior |
| Security | Customer data must remain within approved access boundaries |
| Cost | Request cost must remain within the approved budget |
| Operations | Failures must be detectable and diagnosable |
| Recovery | Critical service failures must have a validated recovery path |
| AI Quality | Meaningful quality degradation must be detectable |

---

## Step 1 — Review Requirements

The first question is not:

> "Does the architecture look good?"

It is:

> "What does this system actually need to guarantee?"

The requirements establish the evaluation criteria.

---

## Step 2 — Review Architecture

The architecture review identifies:

- model-provider dependency
- retrieval dependency
- business API dependencies
- authentication boundary
- observability path
- operational ownership
- failure domains
- scaling assumptions

---

## Step 3 — Identify Risks

Suppose the review identifies:

```text
Model provider outage
        ↓
No tested fallback

High traffic burst
        ↓
Capacity uncertainty

Model update
        ↓
Quality regression not yet demonstrated
        ↓
Evaluation evidence incomplete
```

These are different risks and gaps.

They should not be collapsed into one generic "production risk."

---

## Step 4 — Evaluate Controls

Suppose the team has:

- request timeouts
- dependency monitoring
- load-testing infrastructure
- offline evaluation
- deployment rollback capability
- incident runbooks

The review must ask whether those controls are sufficient.

For example:

> A timeout exists.

is not equivalent to:

> Dependency failure behavior is acceptable for the production requirement.

Similarly:

> A rollback mechanism exists.

does not automatically prove:

> The system can reliably recover from a failed model change.

---

## Step 5 — Review Evidence

Suppose evidence shows:

```text
Functional tests
        ✓

Load testing
        ✓

Security testing
        ✓

Operational alert testing
        ✓

Recovery test
        ✓

AI regression evaluation
        ⚠ Incomplete

Model-provider failure test
        ⚠ Not yet validated
```

The review now has evidence rather than assumptions.

---

## Step 6 — Identify Readiness Gaps

The remaining gaps are:

1. provider failure behavior is not validated
2. AI regression evaluation is incomplete

The reviewer must determine whether these are:

- critical blockers
- bounded conditions
- accepted residual risks

That depends on the actual production requirements and business risk.

---

## Step 7 — Make the Decision

A reasonable outcome could be:

### Conditionally Ready

The system may proceed only if:

- provider failure behavior is validated before the relevant production exposure
- AI regression evaluation reaches the required acceptance criteria
- responsible owners are assigned
- exit criteria are explicit
- the residual risk is explicitly accepted by the appropriate decision authority

If those conditions cannot be satisfied or the remaining risks are unacceptable, the outcome becomes:

### Not Ready

The important lesson is not the label itself.

The important lesson is the reasoning:

```text
Requirement
    ↓
Risk
    ↓
Control
    ↓
Evidence
    ↓
Gap
    ↓
Condition
    ↓
Decision
```

---

# Production Perspective

A production-readiness review should examine the system as something that will be operated over time.

The review therefore asks more than:

> "Can this system work?"

It asks:

> "Can this system continue to work, fail safely, be diagnosed, be recovered, be changed, and remain economically and operationally viable?"

This requires considering the interactions between system dimensions.

For example:

```text
Higher traffic
    ↓
Higher model usage
    ↓
Higher cost
    ↓
Capacity pressure
    ↓
Higher latency
    ↓
Potential quality degradation
```

An architecture review must therefore consider system interactions rather than isolated metrics.

---

# Critical Blockers vs Non-Blocking Risks

Not every risk prevents production release.

A useful distinction is:

### Critical Blocker

A condition that prevents the system from safely satisfying a critical requirement.

Examples:

- unacceptable security exposure
- inability to recover from a critical failure
- critical requirement not met
- unacceptable failure mode
- insufficient evidence for a critical claim
- unresolved risk with unacceptable impact

### Non-Blocking Risk

A known risk that is bounded, understood, owned, and acceptable within the production context.

Examples:

- a non-critical optimization remains incomplete
- a low-impact operational improvement is scheduled
- a known limitation is explicitly accepted

The classification should be based on requirements and risk, not on whether the issue is technically interesting.

---

## Assumptions

Production architecture frequently depends on assumptions.

Examples:

- expected traffic volume
- dependency availability
- model behavior
- data characteristics
- provider limits
- operator capacity
- expected cost
- user behavior

A strong review asks:

> Which assumptions are critical to the architecture's success?

Critical assumptions should be validated where practical.

An assumption that has never been tested should not automatically be treated as a fact.

---

## Dependencies

Dependencies may include:

- model providers
- retrieval systems
- databases
- external APIs
- identity systems
- infrastructure services
- monitoring systems
- deployment systems
- human operational teams

For each critical dependency, ask:

- What happens if it is unavailable?
- What happens if it becomes slow?
- What happens if its behavior changes?
- What happens if its cost changes?
- Who owns the dependency?
- Is there a fallback?
- Is the fallback validated?

Dependency existence is not itself a problem.

Uncontrolled dependency risk is.

---

## Operational Ownership

A system is not operationally ready if nobody clearly owns its operation.

The review should establish:

```text
System Owner
      ↓
Operational Owner
      ↓
On-Call Responsibility
      ↓
Escalation Path
      ↓
Recovery Responsibility
```

Ownership should cover:

- incidents
- deployments
- configuration changes
- dependency failures
- security events
- quality degradation
- recovery
- cost anomalies

"Someone on the team will handle it" is not a sufficiently precise operational model.

---

# Readiness Gaps

A readiness gap exists when the system cannot yet demonstrate sufficient readiness for a requirement.

Examples:

```text
Requirement exists
        ↓
Control exists
        ↓
Evidence missing
        ↓
Readiness gap
```

or:

```text
Requirement exists
        ↓
Control missing
        ↓
Readiness gap
```

or:

```text
Requirement unclear
        ↓
Decision unresolved
        ↓
Readiness uncertainty
```

The review should identify the reason for each gap.

---

# Go / No-Go Reasoning

A production decision should not simply state:

> Go.

or:

> No-Go.

It should explain why.

A useful decision structure is:

```text
Decision
    ↓
Requirements considered
    ↓
Evidence reviewed
    ↓
Critical risks
    ↓
Remaining gaps
    ↓
Residual risk
    ↓
Rationale
    ↓
Conditions / Follow-up
```

The decision should be understandable to someone who did not participate in the entire review.

---

# Conditional Readiness

Conditional readiness is useful when the system is sufficiently mature but has bounded remaining work.

A condition should include:

```text
Condition
    ↓
Reason
    ↓
Control required
    ↓
Exit criteria
    ↓
Owner
    ↓
Decision authority
    ↓
Review / deadline
```

Weak:

> "Improve monitoring after launch."

Strong:

> "Before expanding production traffic, validate the required AI-quality signals against the approved evaluation criteria. The evaluation owner must provide evidence that the criteria are met."

Conditional readiness should never become a mechanism for hiding critical blockers.

---

# Readiness Exceptions

Sometimes a requirement cannot be fully satisfied.

An exception should therefore identify:

- requirement
- reason for exception
- affected scope
- risk
- compensating control
- owner
- decision authority
- expiration or review condition

The exception should be explicit.

A hidden exception is effectively an undocumented risk.

---

## Risk Acceptance

Risk acceptance means explicitly deciding that a residual risk is acceptable.

It does not mean:

> Nobody objected.

A meaningful risk-acceptance decision should identify:

- residual risk
- expected impact
- rationale
- compensating controls
- decision authority
- review condition

Risk acceptance should be proportional to the consequence of the risk.

---

## Technical Debt

Technical debt should be evaluated by production impact rather than by the label itself.

For example:

```text
Technical debt
      ↓
Operational complexity
      ↓
Higher failure probability
      ↓
Higher recovery cost
      ↓
Production risk
```

Not all technical debt is equally important.

A small code-quality issue may have little production impact.

A temporary architecture shortcut that creates a single point of failure may be much more significant.

The readiness review should therefore ask:

> What production consequence does this debt create?

---

# Unresolved Decisions in Practice

Consider a system where the team must choose between:

```text
Option A
Single external model provider

Option B
Primary + fallback provider

Option C
Primary provider + degraded local capability
```

The review should not simply state:

> "Multiple providers are more reliable."

Instead, evaluate:

| Factor | Option A | Option B | Option C |
|---|---|---|---|
| Availability | Lower | Higher | Higher |
| Complexity | Lower | Higher | Higher |
| Cost | Potentially lower | Potentially higher | Potentially higher |
| Provider dependency | High | Reduced | Reduced |
| Quality consistency | Simpler | Requires evaluation | Requires evaluation |
| Operational burden | Lower | Higher | Higher |

The decision depends on:

- production requirements
- acceptable outage behavior
- cost constraints
- quality requirements
- operational capability
- evidence

The review should record the decision and its rationale.

---

# Decision Records

Architecture and readiness decisions should remain explainable after the review is complete.

A useful decision record can contain:

```text
Decision
Context
Requirements and Constraints
Alternatives Considered
Rationale
Trade-offs
Evidence
Risks and Assumptions
Consequences
Conditions / Exceptions
Residual Risk
Decision Owner
Decision Authority
Decision Date
Follow-up Actions
Revisit / Expiry Condition
```

This is not a separate architecture-documentation course.

The purpose is to preserve the reasoning behind important production decisions.

For example:

```text
Decision:
Use a primary model provider with an approved fallback.

Context:
The service has a strict availability requirement
and the primary provider represents a critical dependency.

Alternatives:
1. Single provider
2. Primary + fallback provider
3. Degraded-mode response

Constraints:
Cost and operational complexity must remain bounded.

Evidence:
Provider failure testing demonstrated acceptable
fallback behavior within the required timeout.

Trade-off:
Additional routing and evaluation complexity is accepted
to reduce provider concentration risk.

Residual Risk:
Fallback quality is lower for some request classes.

Consequence:
Additional evaluation and monitoring are required.

Revisit Condition:
Review after significant provider, workload,
or quality changes.
```

The value of the record is that another engineer can understand **why** the architecture decision was made, not merely **what** was chosen.

---

# Architecture Evidence

Architecture claims should be supported by evidence where the claim matters to readiness.

Examples:

| Claim | Weak Evidence | Stronger Evidence |
|---|---|---|
| System can scale | Architecture diagram | Representative load test |
| System can recover | Backups exist | Recovery test |
| System is observable | Logs exist | Detection and diagnosis validation |
| Model quality is acceptable | Sample outputs | Defined evaluation against acceptance criteria |
| Provider failure is handled | Fallback exists | Failure-injection test |
| Cost is acceptable | Estimated cost | Representative workload cost analysis |
| Deployment is safe | Rollback command exists | Validated rollback or recovery exercise |

The strength of evidence should be proportional to the consequence of being wrong.

---

## Architecture Review Questions in Practice

A reviewer should continuously challenge claims.

Instead of:

> "The system is reliable."

ask:

> "Which reliability requirement are we evaluating, what failure modes matter, what controls address them, and what evidence demonstrates that those controls work?"

Instead of:

> "The system is scalable."

ask:

> "What workload was validated, what bottleneck was observed, what scaling behavior occurred, and what production assumptions does the evidence support?"

Instead of:

> "The system is secure."

ask:

> "Which security claims are critical for this system, what controls address them, and what evidence supports those claims?"

This transforms review from opinion into engineering reasoning.

---

## Common Mistakes and Misconceptions

## Mistake 1 — Treating readiness as a checklist

A checklist can summarize a review.

It cannot replace engineering judgment.

---

## Mistake 2 — Equating staging success with production readiness

A system can work in staging and still fail under:

- real workload
- real dependencies
- real cost
- real operational conditions
- real failure scenarios

---

## Mistake 3 — Validating only the happy path

Production systems experience:

- dependency failures
- overload
- malformed input
- configuration errors
- deployment failures
- provider failures
- resource exhaustion

Failure-path validation matters.

---

## Mistake 4 — Assuming logs mean observability

Logs may exist while meaningful failures remain undetectable or difficult to diagnose.

---

## Mistake 5 — Assuming backups guarantee recovery

A backup is not proof of recovery capability.

Recovery must be validated.

---

## Mistake 6 — Assuming rollback is always possible

Some changes are irreversible.

Examples may include:

- destructive data changes
- external side effects
- provider behavior changes
- irreversible migrations

Architecture should explicitly consider recovery when rollback is impossible.

---

## Mistake 7 — Hiding unresolved decisions

An unresolved architecture choice should not disappear inside a generic risk register.

---

## Mistake 8 — Accepting risk silently

If residual risk is acceptable, the acceptance should be explicit.

---

## Mistake 9 — Treating every requirement as equally critical

Requirements differ in business impact and risk.

A critical security requirement should not be treated the same as a minor optimization.

---

## Mistake 10 — Confusing architecture correctness with production readiness

A technically elegant architecture can still be:

- too expensive
- difficult to operate
- insufficiently observable
- difficult to recover
- insecure
- unvalidated under realistic workloads

---

## Mistake 11 — Confusing agent architecture quality with production readiness

An agent architecture can be appropriate for the agent problem while the resulting system remains operationally unsuitable.

AGT-12 evaluates the former.

PROD-12 evaluates the latter.

---

## Mistake 12 — Treating readiness as permanent

Production conditions change.

Therefore:

```text
Readiness
    ↓
Production
    ↓
Change
    ↓
Re-evaluation
    ↓
Updated Readiness
```

Readiness should be revisited after meaningful changes.

---

# Interview Questions with Expected Answers

## 1. An AI service works correctly but has unpredictable cost. Is it production-ready?

**Expected answer:**

Not necessarily.

Functional correctness is only one readiness dimension.

The reviewer should determine:

- cost requirements
- workload assumptions
- cost drivers
- expected cost range
- evidence under representative workload
- whether the cost violates production constraints

If cost risk is unacceptable and uncontrolled, the system may be **Not Ready**.

---

## 2. The system has strong availability but no meaningful AI-quality monitoring. What is missing?

**Expected answer:**

Operational availability does not prove AI quality.

The system needs sufficient lifecycle/evaluation capability to detect meaningful quality degradation.

The review should determine:

- what quality requirements exist
- what quality signals matter
- how degradation is detected
- what evidence demonstrates detection capability
- what action follows degradation

---

## 3. The architecture passes functional tests but has never been load-tested. What decision would you make?

**Expected answer:**

The system may not yet be ready if capacity or latency requirements are critical.

Functional tests demonstrate behavior under tested functional conditions.

They do not establish:

- capacity
- burst behavior
- throughput
- latency under load
- resource saturation
- scaling behavior

The decision depends on whether the missing evidence concerns a critical production requirement.

---

## 4. A model change improves quality but doubles latency. How would you assess readiness?

**Expected answer:**

Do not evaluate the change using quality alone.

Compare:

```text
Quality improvement
        vs
Latency impact
        vs
Cost impact
        vs
Production requirement
```

If the new latency violates a critical requirement, the change may not be production-ready even though model quality improves.

---

## 5. A system depends on a single external model provider. What should be reviewed?

**Expected answer:**

Review:

- availability dependency
- provider failure behavior
- latency
- cost variability
- provider changes
- data/security considerations
- fallback or degraded mode
- operational ownership
- concentration risk
- evidence from failure testing

A single provider is not automatically unacceptable.

The question is whether the dependency is appropriate for the system's requirements and constraints.

---

## 6. A system can be deployed but cannot be reliably recovered. Is deployment readiness sufficient?

**Expected answer:**

No.

Deployment capability and production readiness are different concerns.

If recovery is a critical production requirement and the system cannot demonstrate recovery, that may be a critical blocker.

---

## 7. What is the difference between a readiness gap and an unresolved decision?

**Expected answer:**

A readiness gap means something required is missing, insufficient, or not evidenced.

An unresolved decision means an important choice has not yet been made.

For example:

```text
Gap:
No tested fallback exists.

Unresolved decision:
Should the system use a fallback,
degraded mode, or accepted provider dependency?
```

They require different actions.

---

## 8. When is conditional readiness appropriate?

**Expected answer:**

When remaining gaps are:

- understood
- bounded
- owned
- explicitly accepted
- associated with clear exit criteria

Conditional readiness should not be used to hide critical blockers.

---

## 9. What makes production evidence strong?

**Expected answer:**

Strong evidence is:

- relevant to the claim
- representative of the production requirement
- sufficiently reliable
- reproducible where appropriate
- recent enough for the decision
- capable of reducing meaningful uncertainty

The evidence required depends on the consequence of being wrong.

---

## 10. Why should architecture decisions record alternatives?

**Expected answer:**

Because the decision is easier to review and revisit when engineers can understand:

- what options existed
- what constraints applied
- what trade-offs were considered
- why the selected option was preferred
- what consequences were accepted

This prevents architecture decisions from becoming unexplained historical facts.

---

# Quick Revision

### Core distinction

```text
Implementation Review
        ↓
Was it implemented correctly?

Architecture Review
        ↓
Is the design appropriate?

Production-Readiness Review
        ↓
Can the complete system responsibly operate in production?
```

### Readiness model

```text
Requirements
      ↓
Architecture
      ↓
Risks
      ↓
Controls
      ↓
Evidence
      ↓
Gaps
      ↓
Decision
```

### Evidence model

```text
Claim
  ↓
Evidence
  ↓
Confidence
  ↓
Risk
  ↓
Decision
```

### Decision model

```text
Ready
Conditionally Ready
Not Ready
```

### Critical principle

> **A checklist can support a readiness review, but it cannot replace engineering judgment.**

---

# Key Takeaways

1. Production readiness is an evidence-based engineering judgment.
2. Architecture correctness does not automatically imply production readiness.
3. Requirements define what the system must achieve.
4. Production constraints define the conditions within which it must achieve those requirements.
5. Acceptance criteria make requirements evaluable.
6. Readiness must consider the complete system.
7. Earlier PROD chapters provide capabilities; PROD-12 evaluates whether those capabilities are sufficient together.
8. Risks, gaps, and unresolved decisions are different concepts.
9. Evidence must support meaningful production claims.
10. Critical blockers must be distinguished from bounded risks.
11. Conditional readiness requires explicit conditions and exit criteria.
12. Risk acceptance should be explicit.
13. Technical debt matters when it creates meaningful production consequences.
14. Architecture decisions should preserve context, alternatives, trade-offs, evidence, consequences, and revisit conditions.
15. Failure-path reasoning is as important as happy-path validation.
16. Production readiness is not permanent.
17. Meaningful system changes should trigger re-evaluation.
18. The final decision should be defensible to engineers, operators, and decision-makers who were not present for the original review.

---

## Further Reading

Recommended repository topics:

- [PROD-01 — Production System Foundations](../PROD-01-Production-AI-System-Foundations/Readme.md)
- [PROD-04 — Deployment and Release](../PROD-04-Deployment-and-Release-Engineering/Readme.md)
- [PROD-05 — Observability](../PROD-05-AI-Observability-and-Telemetry/Readme.md)
- [PROD-06 — Reliability](../PROD-06-Production-AI-Reliability/Readme.md)
- [PROD-07 — Scaling and Capacity](../PROD-07-Scaling-and-Capacity-Engineering/Readme.md)
- [PROD-08 — Performance and Cost](../PROD-08-AI-Performance-Optimization-and-Cost/Readme.md)
- [PROD-09 — Security](../PROD-09-Production-AI-Security/Readme.md)
- [PROD-10 — Operations and Incident Management](../PROD-10-AI-Operations-and-Incident-Management/Readme.md)
- [PROD-11 — Lifecycle, Evaluation and Continuous Improvement](../PROD-11-AI-Lifecycle-Evaluation-and-Continuous-Improvement/README.md)
- [AGT-12 — Agent Architecture](../../05-AGT/AGT-12-Agent-Architecture-and-Design-Review/Readme.md)

PROD-12 should be studied after the preceding PROD capabilities because its purpose is to synthesize them into production-readiness and architecture decisions.
