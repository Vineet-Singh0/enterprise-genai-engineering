# AGT-05 — Plan Execution, Replanning, and Adaptation

## Learning Objectives

After completing this chapter, you should be able to:

- Explain why a plan may need to change during execution.
- Distinguish plan execution from planning-level adaptation.
- Monitor whether execution is progressing consistently with the current plan.
- Identify meaningful deviations between planned and observed conditions.
- Reason about changed assumptions and unexpected observations.
- Distinguish harmless deviations from deviations that affect plan validity.
- Distinguish local adaptation from full replanning.
- Preserve valid completed work when a plan changes.
- Handle partial success and failed actions without unnecessarily restarting.
- Recognize plan drift and stale plans.
- Decide when continuing the current plan is appropriate and when adaptation or replanning is necessary.
- Design bounded adaptation policies.
- Explain how planning interacts with runtime execution without confusing the responsibilities of AGT-02 and AGT-05.
- Reason about production trade-offs involving replanning frequency, planning cost, plan stability, partial completion, persistence, and observability.

---

## Prerequisites

Before reading this chapter, you should understand:

- What an agent is and how its system boundary is defined.
- The difference between an agent and a conventional LLM application.
- The basic structure of an agent runtime.
- The decision → action → observation → continuation loop.
- Runtime termination and bounded autonomy.
- Agent state, context, and memory at a conceptual level.
- The fundamentals of agent planning, task decomposition, dependencies, constraints, feasibility, and plan construction.

Recommended prerequisites:

- [AGT-01 — Agent Foundations](../AGT-01-Agent-Systems-Foundations/Readme.md)
- [AGT-02 — Agent Runtime and Execution](../AGT-02-Agent-Runtime-Loops-and-Bounded-Autonomy/Readme.md)
- [AGT-03 — Tool Use and Invocation](../AGT-03-Tools-and-Action-Execution/Readme.md)
- [AGT-04 — Agent State, Context, and Memory](../AGT-04-State-Context-and-Memory/Readme.md)
- [AGT-05 — Planning & Adaptive Execution](./README.md)
- [AGT-05/01 — Task Decomposition and Agent Planning](./01-Task-Decomposition-and-Agent-Planning.md)

---

## Estimated Reading Time

**45–60 minutes**

---

## Before We Start

A plan describes a strategy for achieving a goal.

That strategy is based on the information, assumptions, constraints, and available capabilities known when the plan is constructed.

Once execution begins, the agent encounters actual conditions.

Those conditions may differ from what the plan expected.

A required data source may be unavailable.

An API may reject an operation.

A dependency may take longer than expected.

A previously available resource may disappear.

An action may succeed only partially.

An observation may reveal information that changes the conditions under which the plan was constructed.

This creates a fundamental engineering question:

> **Is the current strategy still a valid way to achieve the goal?**

The answer is not always "create a new plan."

Sometimes the deviation has no meaningful effect and execution should continue.

Sometimes only one part of the strategy needs to change.

Sometimes a critical assumption or dependency has become invalid and the plan must be replaced.

The important engineering skill is therefore not merely generating plans.

It is **maintaining plan validity as execution reveals new information**.

This chapter focuses on that problem.

---

## Why This Exists

A plan is not a guarantee about the future.

It is a strategy constructed from current knowledge.

Consider a simple plan:

```text
Goal:
Prepare a product release

Plan:
1. Run tests
2. Build application
3. Deploy staging
4. Run smoke tests
5. Deploy production
```

Suppose step 1 succeeds.

The build succeeds.

But staging deployment fails because the deployment environment is temporarily unavailable.

The original plan cannot be executed exactly as written.

However, the entire plan may not be invalid.

The completed work may still be valid.

The release goal still exists.

The failure may be localized to one part of the strategy.

A reasonable planning system therefore asks:

```text
What changed?

Does the change affect the current strategy?

If not:
    continue

If yes:
    can the strategy be preserved through local adaptation?

If not:
    replan

What completed work remains valid?
```

This is the central problem of adaptive planning.

---

# Mental Model

The planning lifecycle can be viewed as:

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
Is the Current Plan Still Valid?
  ├── Yes → Continue
  │
  └── No
       ↓
   Can the deviation be handled locally?
       ├── Yes → Adapt
       │          ↓
       │       Continue
       │
       └── No → Replan
                  ↓
             Verify Revised Plan
                  ↓
                Continue
```

A useful refinement is to recognize that not every deviation requires a change:

```text
Observation
    ↓
Meaningful deviation?
    ├── No → Continue
    │
    └── Yes
         ↓
    Does it affect the strategy?
         ├── No → Continue
         │
         └── Yes
              ↓
       Can local adaptation preserve the strategy?
              ├── Yes → Adapt
              │
              └── No → Replan
```

The important question is not:

> "Did something unexpected happen?"

Unexpected events are normal in real systems.

The important question is:

> **"Did what happened change the strategy required to achieve the goal?"**

---

# Core Concepts

## 1. Plan Execution Is Interaction With Reality

A plan is constructed using available information.

Execution exposes that plan to actual conditions.

For example:

```text
Planned:

Fetch data
    ↓
Process data
    ↓
Generate report
    ↓
Send report
```

Reality might become:

```text
Fetch data
    ↓
Data source responds slowly
    ↓
Data arrives partially
    ↓
Processing begins
    ↓
Required field is missing
```

The planner now has new information.

The original plan may have depended on assumptions such as:

- the data source would be available;
- the response would contain required fields;
- the data would arrive within acceptable limits;
- processing would be possible.

Some of those assumptions may now be false.

Execution therefore produces more than task results.

It also produces **evidence about whether the current strategy remains viable**.

---

## 2. Plan Validity Is Not the Same as Action Success

An individual action can fail without invalidating the entire plan.

For example:

```text
Plan:

1. Retrieve primary data
2. Retrieve secondary data
3. Combine datasets
4. Analyze results
```

Suppose the secondary data source fails.

The action failed.

But whether the plan is invalid depends on the role of that data.

If secondary data is optional:

```text
Primary data
    +
Secondary data if available
    ↓
Analysis
```

the plan may remain valid.

If secondary data is mandatory:

```text
Primary data
    +
Required secondary data
    ↓
Analysis
```

the failure may invalidate the current plan.

Therefore:

> **Action failure is an observation. Plan invalidation is a planning judgment.**

The planning question is not simply whether an action succeeded.

It is whether the current strategy can still satisfy the goal.

---

## 3. Progress Monitoring

Execution needs some representation of progress relative to the current plan.

A simple representation might be:

```text
Step 1: Complete
Step 2: Complete
Step 3: In progress
Step 4: Pending
Step 5: Pending
```

A more useful representation includes expected and observed results:

| Step | Expected | Observed | Status |
|---|---|---|---|
| Retrieve data | Data available | Data available | Complete |
| Process data | Processing succeeds | Processing succeeds | Complete |
| Generate report | Report generated | Generation failed | Failed |
| Send report | Report available | Not reached | Blocked |

This allows the planning system to reason about the current execution state.

Useful monitoring questions include:

- Which planned work is complete?
- Which part is currently blocked?
- Which expected result has not appeared?
- Which assumptions have changed?
- Which dependencies are now unavailable?
- Which remaining steps are affected?
- Can the current strategy still achieve the goal?

The purpose of monitoring is not to trigger replanning after every step.

It is to provide enough evidence to determine whether the current strategy remains appropriate.

---

## 4. Expected Results and Observed Results

A meaningful plan step has an expected result.

For example:

```text
Action:
Create deployment package

Expected:
A valid package is produced.

Observed:
Package generation fails because a required dependency is missing.
```

The difference between expected and observed results is a **deviation**.

A deviation can range from insignificant to plan-invalidating:

```text
No meaningful deviation
        ↓
Minor deviation
        ↓
Operational deviation
        ↓
Plan-affecting deviation
        ↓
Plan-invalidating deviation
```

Not every deviation deserves the same response.

The planning system must determine the deviation's impact.

---

## 5. Deviations

A deviation occurs when the observed situation differs from what the current plan expected.

Examples:

### Timing deviation

```text
Expected:
API response in 2 seconds

Observed:
API response in 8 seconds
```

The plan may still be valid.

### Output deviation

```text
Expected:
100 records

Observed:
93 records
```

The impact depends on whether those missing records matter to the goal.

### Availability deviation

```text
Expected:
Primary data source available

Observed:
Primary data source unavailable
```

This may invalidate the current strategy.

### Capability deviation

```text
Expected:
API supports bulk export

Observed:
API supports only individual record retrieval
```

This may require a different strategy.

### Constraint deviation

```text
Expected:
Budget = ₹10,000

Observed:
Required operation costs ₹15,000
```

The current plan may no longer satisfy the constraint.

The important point is:

> **Deviation detection is not the same as deviation handling.**

The agent must determine the significance of the deviation.

---

## 6. Changed Assumptions

A plan is based on assumptions.

For example:

```text
Assumption:
The customer database is available.

Plan:
1. Query customer database
2. Analyze customers
3. Generate recommendations
```

Suppose the database becomes unavailable.

The environment has changed.

This can invalidate the strategy even if the original plan was reasonable when created.

A useful mental model is:

```text
Plan
  ↓
Assumptions
  ↓
Execution
  ↓
New evidence
  ↓
Assumptions still valid?
  ├── Yes → Continue
  │
  └── No → Reassess strategy
```

Changed assumptions are important because a plan can become stale without any individual action being incorrectly executed.

---

## 7. Unexpected Observations

An observation is unexpected when it materially differs from what the current plan anticipated.

Examples:

- an API returns a new error;
- a file is missing;
- a required record does not exist;
- a dependency produces an unexpected format;
- a downstream system rejects valid-looking input;
- a previously available resource becomes unavailable;
- a result contradicts an important assumption.

An unexpected observation should trigger reasoning, not automatic replanning.

The planning system should ask:

```text
What happened?

Why does it matter?

Which part of the strategy depends on this condition?

Can the current strategy still achieve the goal?

Can the deviation be handled locally?

Does the change affect downstream steps?
```

---

## 8. Partial Success

Real execution is often neither complete success nor complete failure.

A plan may produce useful partial progress.

Consider:

```text
Goal:
Migrate 1,000 customer records.

Plan:
1. Export records
2. Transform records
3. Validate records
4. Import records
```

Suppose:

```text
Export → Success
Transform → Success
Validation → 980 valid records
Import → 980 successful
```

The original goal has not been completely achieved.

But restarting from zero would discard useful work.

The current planning problem becomes:

```text
Completed:
980 records migrated

Remaining:
20 records

New question:
How should the remaining 20 records be handled?
```

This leads to an important principle:

> **Replanning should preserve completed work when that work remains valid under the latest known conditions.**

Completed work is not automatically reusable merely because it completed.

---

## 9. Failed Actions

A failed action provides information about the current execution state.

For example:

```text
Action:
Upload dataset

Result:
Upload failed

Possible causes:
- network failure
- authentication failure
- unsupported format
- insufficient storage
- service outage
```

The planning system should not automatically conclude:

```text
Upload failed
    ↓
Restart entire plan
```

Instead:

```text
Upload failed
    ↓
Understand impact
    ↓
Does failure affect the strategy?
    ├── No → Continue with normal execution
    ├── Recoverable locally → Adapt
    └── Strategy invalid → Replan
```

The detailed mechanics of retries, side effects, idempotency, and tool invocation belong to AGT-03.

AGT-05.02 is concerned with the planning-level question:

> **What does this result mean for the strategy?**

---

## 10. Local Adaptation

Local adaptation means changing a limited part of the current strategy while preserving the broader approach.

Example:

```text
Original:

Fetch data from API A
      ↓
Process data
      ↓
Generate report
```

API A is unavailable.

Suppose API B provides equivalent information and satisfies the relevant constraints.

A local adaptation may be:

```text
Fetch data from API B
      ↓
Process data
      ↓
Generate report
```

The overall strategy remains intact.

Local adaptation is appropriate when:

- the goal remains unchanged;
- the broader strategy remains valid;
- only a limited part needs modification;
- required dependencies remain satisfiable;
- the replacement satisfies relevant constraints;
- completed work remains valid.

---

## 11. Full Replanning

Full replanning is necessary when the current strategy can no longer reliably achieve the goal.

Example:

```text
Goal:
Retrieve customer transaction history.

Original plan:

1. Use Transaction API
2. Aggregate transactions
3. Generate report
```

Observation:

```text
Transaction API does not provide historical data.
```

Suppose no supported capability can provide the required history through the current strategy.

A materially different approach may be required:

```text
1. Retrieve archived transaction files
2. Parse historical records
3. Normalize records
4. Aggregate transactions
5. Generate report
```

The strategy has changed because the original information path can no longer satisfy the goal.

---

## 12. Local Adaptation vs Replanning

A useful decision table is:

| Situation | Likely response |
|---|---|
| Minor timing variation within acceptable limits | Continue |
| Harmless output variation | Continue |
| Temporary issue with a recoverable path | Local adaptation |
| Equivalent replacement preserves the strategy | Local adaptation |
| Optional dependency unavailable | Often local adaptation or continue |
| Required dependency disappears | Replan |
| Critical assumption becomes false | Replan |
| Goal changes | Replan |
| Important constraint changes | Replan |
| Current strategy cannot achieve the goal | Replan |
| No viable bounded recovery remains | Stop or escalate |

The key decision criterion is **strategic impact**, not merely whether something failed.

---

## 13. Replanning Decision Model

A practical decision process is:

```text
Observation
    ↓
Meaningful deviation?
    ├── No → Continue
    │
    └── Yes
         ↓
    Does the deviation affect the strategy?
         ├── No → Continue
         │
         └── Yes
              ↓
       Can local adaptation preserve the strategy?
              ├── Yes → Adapt
              │          ↓
              │       Continue
              │
              └── No → Replan
                         ↓
                    Verify revised plan
                         ↓
                       Continue
```

This model prevents two opposite mistakes:

```text
Mistake 1:
Never adapt.

Mistake 2:
Replan after everything.
```

Good adaptive planning avoids both.

---

## 14. Preserving Valid Completed Work

One of the most important properties of adaptive planning is **progress preservation**.

Suppose:

```text
Original plan:

A → B → C → D → E
```

Execution reaches:

```text
A ✓
B ✓
C ✓
D ✗
```

If A, B, and C remain valid, restarting them is unnecessary.

A better approach is:

```text
A ✓
B ✓
C ✓
D ✗
   ↓
Replace or revise D
   ↓
D' → E
```

The revised strategy starts from the latest valid state.

This is especially important when previous actions are:

- expensive;
- time-consuming;
- rate-limited;
- externally visible;
- difficult to repeat;
- irreversible.

However, completed work should be preserved only when its validity remains supported by the latest evidence.

For example, if D fails because a prerequisite used by C was later discovered to be invalid, C may need to be reconsidered.

Therefore:

> **Preserve validated progress, not merely historical completion.**

---

## 15. Plan Invalidation

A plan becomes invalid when its strategy can no longer reliably satisfy the goal under current conditions.

Examples include:

### Required capability disappears

```text
Plan:
Use API A to retrieve required information.

Observation:
API A does not expose the required information.

Result:
Current strategy is invalid.
```

### Critical constraint changes

```text
Plan:
Use processing service X.

Observation:
Available budget is below the minimum required cost.

Result:
The current strategy may no longer satisfy the constraint.
```

### Required dependency disappears

```text
Plan:
Generate a report from dataset B.

Observation:
Dataset B has been deleted and cannot be recovered.

Result:
Current strategy is invalid unless another valid source exists.
```

### Goal changes

```text
Original:
Generate a daily report.

New requirement:
Generate a real-time dashboard.

Result:
The original strategy may no longer be appropriate.
```

Plan invalidation is therefore a planning-level judgment about the viability of the current strategy.

---

## 16. Strategy Change

A strategy change occurs when the agent must pursue the same goal using a materially different approach.

For example:

```text
Goal:
Analyze customer feedback.
```

Original strategy:

```text
1. Retrieve feedback from database
2. Clean records
3. Analyze sentiment
4. Generate summary
```

The database becomes unavailable.

Alternative strategy:

```text
1. Retrieve recent feedback from exported files
2. Normalize records
3. Analyze sentiment
4. Generate summary
```

The goal remains unchanged.

The strategy changes because the original information path is no longer available.

---

## 17. Recovery-Oriented Planning

When execution encounters a failure, the planning system should reason about recovery rather than immediately treating the task as complete failure.

A recovery decision can be modeled as:

```text
Failure
  ↓
Understand impact
  ↓
Identify affected plan components
  ↓
Preserve valid completed work
  ↓
Identify recovery options
  ↓
Compare viable options
  ↓
Choose bounded recovery strategy
  ↓
Continue, adapt, or replan
```

Possible planning-level recovery responses include:

- continuing with the current strategy;
- modifying a limited part of the strategy;
- replacing an unavailable capability;
- skipping an optional step;
- changing sequence;
- restoring a required prerequisite;
- selecting another valid data source;
- reducing scope when the goal permits it;
- constructing a revised plan.

The specific mechanics of executing these responses belong to the relevant runtime, tool, state, or workflow systems.

The planning responsibility is deciding **which strategic response is appropriate**.

---

## 18. Plan Drift

Plan drift occurs when the current plan gradually becomes disconnected from the conditions under which execution is actually occurring.

For example:

```text
Initial plan:

1. Fetch data
2. Process data
3. Generate report
4. Publish report
```

During execution:

```text
Data source changed
Processing requirements changed
Report format changed
Publishing destination changed
```

If the agent continues mechanically following the original plan, the plan may no longer represent the actual problem.

Conceptually:

```text
Current reality
      ↑
      |
      | increasing mismatch
      |
Original plan
```

Plan drift is dangerous because individual actions may still appear reasonable while the overall strategy becomes obsolete.

---

## 19. Harmless Deviations

Not every deviation requires adaptation.

Consider:

```text
Plan:
Retrieve 50 records.

Expected:
50 records.

Observed:
52 records.
```

Suppose the additional records:

- satisfy the same filtering criteria;
- require no different processing;
- do not violate constraints;
- do not change the downstream strategy.

There may be no planning problem.

Another example:

```text
Expected:
API response in 3 seconds.

Observed:
API response in 3.5 seconds.
```

If the latency remains within the relevant operational constraint, the plan may continue unchanged.

Therefore:

> **A deviation matters for planning only when it changes conditions relevant to achieving the goal.**

---

## 20. Avoiding Unnecessary Replanning

Replanning has a cost.

The cost may include:

- additional model inference;
- additional latency;
- additional tool calls;
- additional computation;
- increased decision complexity;
- loss of plan stability;
- repeated work;
- inconsistent decisions.

Suppose an agent observes:

```text
Expected:
10 files

Observed:
9 files
```

If the ninth file contains all required information and the goal remains achievable, rebuilding the entire plan is unnecessary.

A better decision is:

```text
Deviation
    ↓
Does it affect the strategy?
    ↓
No
    ↓
Continue
```

The planning system should therefore change strategy because the evidence requires it—not merely because a change is possible.

---

## 21. Bounded Adaptation

Adaptive planning needs boundaries.

Without boundaries, an agent can repeatedly modify its strategy:

```text
Plan A
  ↓
Observation
  ↓
Plan B
  ↓
Observation
  ↓
Plan C
  ↓
Observation
  ↓
Plan D
  ↓
...
```

This can create planning loops and unpredictable behavior.

A bounded adaptation policy may define:

- maximum replanning attempts;
- maximum planning time;
- maximum recovery attempts;
- maximum number of alternative strategies;
- minimum evidence required for replanning;
- permitted adaptation boundaries;
- escalation conditions;
- termination conditions.

The exact policy depends on the application.

The engineering principle is:

> **Adaptability must be bounded so that the agent remains predictable and controllable.**

---

## 22. Example: Unavailable Data Source

Consider a research agent.

Goal:

```text
Prepare a market analysis.
```

Original plan:

```text
1. Retrieve market statistics from Source A
2. Retrieve competitor information
3. Combine evidence
4. Analyze trends
5. Generate report
```

During execution:

```text
Source A unavailable.
```

### Step 1 — Determine impact

Is Source A required for the strategy?

If not:

```text
Continue using the remaining available evidence.
```

If equivalent information is available elsewhere:

```text
Adapt:
Source A → Source B
```

If Source A provides information that is essential and no viable replacement exists:

```text
Current strategy may be invalid.
```

### Step 2 — Preserve completed work

Suppose competitor information was already retrieved.

That valid work should remain available to the revised strategy.

### Step 3 — Reassess the strategy

The agent now decides whether the remaining evidence is sufficient or whether a materially different information-gathering strategy is required.

This illustrates the progression:

```text
Unavailable source
      ↓
Assess impact
      ↓
Continue / Adapt / Replan
```

---

## 23. Example: Unsupported API

Consider an agent tasked with creating a customer export.

Original plan:

```text
1. Authenticate
2. Call bulk-export endpoint
3. Download CSV
4. Validate CSV
5. Store export
```

The agent discovers:

```text
Bulk-export endpoint is not supported.
```

This is different from a temporary network timeout.

The capability itself is unavailable.

Suppose the API supports only individual record retrieval.

A different strategy might be:

```text
1. Retrieve customer IDs
2. Fetch records individually
3. Assemble records
4. Validate dataset
5. Store export
```

But this introduces new planning considerations:

- request volume;
- rate limits;
- latency;
- partial failures;
- cost;
- data consistency.

Therefore, the agent should not blindly replace one operation with another.

It must determine whether the alternative strategy is feasible under the current constraints.

If not, the agent needs another strategy or an appropriate stop/escalation path.

---

## 24. Example: Harmless Deviation

Suppose:

```text
Plan:
1. Retrieve 50 records
2. Analyze records
3. Generate summary
```

The retrieval operation returns 52 records.

The additional two records:

- satisfy the same criteria;
- can be processed by the existing strategy;
- do not violate constraints;
- do not change the analysis approach.

The correct response may simply be:

```text
52 records received
      ↓
Continue existing plan
```

No replanning is necessary.

An agent that replans every time observed data differs slightly from expected data is overreactive.

---

## 25. Example: Partial Success and Recovery

Suppose an agent must migrate:

```text
10,000 records
```

The plan is:

```text
1. Extract records
2. Transform records
3. Validate records
4. Import records
5. Verify migration
```

Execution produces:

```text
Extract       ✓
Transform     ✓
Validate      10,000 checked
Import        9,850 successful
Import        150 failed
```

The agent now has a useful partial state.

A poor response is:

```text
Restart migration of all 10,000 records.
```

A better planning response is:

```text
Preserve:
9,850 successful imports

Investigate:
150 failures

Construct recovery strategy:
1. Classify failed records
2. Determine recoverable failures
3. Recover affected records
4. Verify final state
```

The revised strategy begins from the latest valid state.

---

## 26. Example: When Replanning Is Unnecessary

Suppose:

```text
Plan:
1. Retrieve document
2. Extract text
3. Summarize document
```

The extraction operation returns text with a slightly different formatting structure than expected.

However:

```text
Required content is present.
```

The summary strategy remains valid.

Therefore:

```text
Observation:
Formatting differs

Impact:
No meaningful effect on strategy

Decision:
Continue
```

This is an example of impact-driven adaptation.

---

## 27. Example: When Replanning Is Necessary

Suppose:

```text
Goal:
Generate a compliance report from transaction records.
```

Original plan:

```text
1. Retrieve transaction history
2. Apply compliance rules
3. Aggregate violations
4. Generate report
```

The agent discovers:

```text
Transaction history is available only for the last 30 days.
```

But the requirement covers:

```text
12 months
```

The current strategy cannot satisfy the actual requirement.

This is not merely an execution failure.

The strategy itself is insufficient.

A revised plan might be:

```text
1. Retrieve archived transaction records
2. Combine historical and current records
3. Validate coverage
4. Apply compliance rules
5. Aggregate violations
6. Generate report
```

The strategy changed because the original plan could no longer satisfy the goal.

---

## 28. Replanning From the Latest Valid State

Replanning does not mean forgetting everything that happened before.

A revised plan should be constructed from the latest valid execution state.

Conceptually:

```text
Original Plan
      ↓
Execution
      ↓
Observed State
      ↓
Affected / Invalidated Components
      ↓
Preserved Valid Components
      ↓
Revised Plan
```

For example:

```text
Original:

A → B → C → D → E
```

After execution:

```text
A ✓
B ✓
C ✓
D ✗
E pending
```

Replanning might produce:

```text
A ✓
B ✓
C ✓
D' → E
```

The revised plan does not need to reconstruct A, B, and C if they remain valid.

However, if later evidence invalidates an assumption supporting C, then C must be reconsidered.

Therefore:

> **Replanning starts from the latest validated state, not necessarily from the beginning.**

---

## 29. Local Adaptation and Global Replanning

Not all strategy changes have the same scope.

### Local adaptation

Affects a limited portion of the strategy:

```text
A → B → C → D
        ↓
       C'
```

### Broader replanning

Changes multiple dependent parts:

```text
A → B → C → D
       ↓
A' → B' → C' → D' → E'
```

The boundary is not determined simply by the number of changed steps.

A single changed dependency can affect the entire strategy.

For example:

```text
Plan:
Use database X
      ↓
All downstream analysis depends on X
```

Replacing database X may require changes throughout the plan.

Therefore:

> **The scope of replanning should follow dependency impact, not merely the number of failed actions.**

---

## 30. Plan Stability

A good adaptive system balances:

```text
Stability
    +
Adaptability
```

Too much stability:

```text
Reality changes
    ↓
Agent refuses to change plan
    ↓
Stale strategy continues
```

Too much adaptation:

```text
Small deviation
    ↓
New plan
    ↓
Another small deviation
    ↓
Another plan
    ↓
Instability
```

The goal is therefore not:

> "Never change the plan."

Nor:

> "Always change the plan when something changes."

The goal is:

> **Change the strategy when the evidence justifies changing it.**

---

## 31. Replanning Frequency

Replanning frequency is an engineering trade-off.

Too little replanning can allow stale strategies to continue.

Too much replanning can create unnecessary cost and instability.

A useful conceptual relationship is:

```text
Replanning threshold
        ↓
Evidence required
        ↓
Planning cost
        ↓
Execution uncertainty
        ↓
Required adaptability
```

Highly predictable environments may need fewer planning adjustments.

Highly uncertain environments may require more frequent plan-validity checks.

Even in uncertain environments, however, every observation does not necessarily justify a new plan.

---

## 32. Plan Persistence

In longer-running systems, plans may need to persist beyond a single inference step.

A persisted plan can support:

- resuming interrupted execution;
- tracking progress;
- identifying completed work;
- recording plan changes;
- recovering after process failure;
- inspecting planning decisions.

A conceptual representation might be:

```text
Plan
 ├── Version
 ├── Goal
 ├── Steps
 ├── Dependencies
 ├── Assumptions
 ├── Constraints
 ├── Status
 ├── Completed work
 ├── Current deviations
 └── Revision history
```

Persistence is especially useful when execution is long-running or interruption is possible.

However:

> **A persisted plan can still be stale.**

Persistence preserves the plan; it does not guarantee its continued validity.

---

## 33. Observability of Plan Changes

Adaptive planning should be observable.

A production system should be able to answer:

```text
What was the original plan?

What changed?

What observation triggered the change?

Which assumption or dependency was affected?

Which completed work was preserved?

Why was local adaptation chosen?

Why was full replanning chosen?

How many times has the plan been revised?
```

For example:

```text
Plan v1
    ↓
Observation:
API A unavailable
    ↓
Decision:
Local adaptation
    ↓
Plan v1.1
    ↓
Observation:
API B lacks required historical data
    ↓
Decision:
Plan invalidated
    ↓
Plan v2
```

This history is useful for:

- debugging;
- reliability analysis;
- cost analysis;
- incident investigation;
- system improvement;
- engineering review.

---

## 34. Planning vs Runtime Execution

This distinction must remain clear.

AGT-02 focuses on the runtime question:

> **What happens next?**

AGT-05 focuses on the planning question:

> **Is this still the right strategy for achieving the goal?**

For example:

```text
AGT-02:

Action completed.
Observation received.
What should the runtime do next?

        ↓

AGT-05:

Does the observation invalidate the current strategy?
Should the plan remain unchanged, adapt, or be replaced?
```

The two processes interact.

They are not competing definitions of the agent loop.

A runtime may execute the next action while planning logic determines whether the strategy should change.

---

## 35. Planning vs Tool Execution

AGT-03 owns tool contracts and invocation behavior.

AGT-05 does not redefine:

- tool schemas;
- invocation protocols;
- tool execution mechanics;
- tool failure mechanics;
- idempotency implementation.

Instead, AGT-05 asks:

```text
Given the tool result:

Does the plan remain valid?

Should this capability be replaced?

Should the sequence change?

Is the required capability unavailable?

Does the result require adaptation or replanning?
```

The tool system provides execution capabilities.

The planning system reasons about whether those capabilities still support the strategy.

---

## 36. Planning vs State and Context

AGT-04 owns agent state, execution context, and memory.

AGT-05 uses that information.

For example:

```text
State:
3 steps completed

Context:
Current API unavailable

Memory:
Previous successful fallback method
```

The planner may use these inputs to construct a revised strategy.

But the planner is not responsible for re-teaching state management or memory architecture.

A useful boundary is:

```text
AGT-04:
What information is available and how is it maintained?

AGT-05:
Given the available information, what strategy should the agent pursue?
```

---

# Engineering Decisions and Trade-offs

## Adaptation vs Stability

Frequent adaptation improves responsiveness but can destabilize execution.

Stable plans reduce planning overhead but can become stale.

---

## Local Adaptation vs Full Replanning

Local adaptation is generally cheaper and preserves more of the existing strategy.

Full replanning handles larger changes but costs more and may introduce additional complexity.

---

## Preserve Work vs Revalidate Work

Preserving valid work improves efficiency.

But preserving work without checking its continued validity can propagate errors.

The engineering question is therefore:

> **What completed work remains trustworthy under the latest known conditions?**

---

## Planning Cost vs Execution Cost

If planning is expensive and execution is cheap, excessive replanning may be inefficient.

If execution is expensive, irreversible, or risky, additional planning may be justified.

---

## Fast Recovery vs Careful Recovery

A fast fallback can restore progress quickly.

But a poorly chosen fallback may create a larger downstream problem.

Recovery decisions should consider consequences, not only speed.

---

## Adaptability vs Predictability

Highly adaptive agents can respond to changing conditions.

Highly constrained agents are easier to reason about and operate.

Production systems usually need a controlled balance.

---

## Replanning Threshold

A system should define what level of deviation justifies changing strategy.

Too low:

```text
Constant replanning
```

Too high:

```text
Stale plans
```

The appropriate threshold depends on uncertainty, cost, risk, and reversibility.

---

# Production Perspective

Adaptive planning becomes particularly important in production because execution conditions are rarely perfectly predictable.

## 1. Replanning Cost

Every replanning operation can consume:

- model inference;
- latency;
- tokens;
- tool calls;
- compute;
- operational resources.

Therefore, replanning should be treated as an engineering cost rather than a free operation.

---

## 2. Replanning Frequency

Production systems should monitor:

```text
Plans created
Plans revised
Average revisions per task
Maximum revisions
Reasons for revisions
```

Unexpectedly high replanning frequency may indicate:

- poor initial planning;
- unstable environment;
- weak assumptions;
- insufficient observability;
- overly sensitive adaptation thresholds.

---

## 3. Plan Stability

Useful production measurements may include:

```text
Average plan lifetime
Average number of revisions
Percentage of tasks requiring replanning
Percentage requiring local adaptation
Percentage completed without plan change
```

These measurements can reveal whether the planning system is too rigid or too reactive.

---

## 4. Stale Plans

Long-running execution creates the risk that a plan becomes outdated.

Examples:

- data changes;
- resources disappear;
- APIs change;
- user requirements change;
- constraints change;
- external systems become unavailable.

A production system therefore needs mechanisms for detecting important changes rather than blindly executing an old plan.

---

## 5. Partial Completion

Production tasks frequently stop in intermediate states.

The system should know:

```text
What completed?
What failed?
What remains?
What is still valid?
```

This supports recovery without unnecessarily repeating expensive work.

---

## 6. Bounded Adaptation

Production systems should define limits such as:

```text
Maximum replans = N

Maximum planning time = T

Maximum recovery attempts = R
```

The exact values depend on the application.

The engineering principle is to prevent adaptation from becoming an uncontrolled loop.

---

## 7. Plan Persistence

For long-running work, the system may need to persist:

- current plan;
- plan version;
- progress;
- assumptions;
- deviations;
- revised strategy;
- completed work.

This supports recovery after process interruption.

---

## 8. Observability

Plan changes should be observable as first-class events.

For example:

```text
PLAN_CREATED
PLAN_STEP_COMPLETED
PLAN_DEVIATION_DETECTED
PLAN_ADAPTATION_SELECTED
PLAN_INVALIDATED
PLAN_REPLANNED
PLAN_REPLAN_LIMIT_REACHED
```

The exact event model depends on the system.

The important principle is that adaptive behavior should not be invisible.

---

## 9. Deterministic vs Adaptive Behavior

Some production workflows benefit from predictable execution.

Others operate in uncertain environments.

A useful architecture may therefore constrain adaptation to specific boundaries:

```text
Deterministic workflow
        +
Bounded adaptive planning
        +
Explicit recovery rules
```

This can provide more predictability than allowing unrestricted agent behavior.

---

## 10. Production Mental Model

A production-oriented planning system can be viewed as:

```text
Goal
  ↓
Plan
  ↓
Execute
  ↓
Observe
  ↓
Compare expected vs actual
  ↓
Assess plan validity
  ↓
┌───────────────────────────────┐
│                               │
│ No meaningful deviation       │
│        ↓                      │
│     Continue                  │
│                               │
│ Meaningful but local          │
│        ↓                      │
│     Adapt                     │
│                               │
│ Strategy invalidated          │
│        ↓                      │
│     Replan                    │
│                               │
│ Adaptation limit reached      │
│        ↓                      │
│     Stop / Escalate           │
│                               │
└───────────────────────────────┘
```

This provides a bounded and observable model for adaptive execution.

---

# Common Mistakes and Misconceptions

## Misconception 1: A Plan Should Never Change

Incorrect.

Plans are based on assumptions and available information.

Execution can reveal conditions that require adaptation.

---

## Misconception 2: Every Failed Action Requires Replanning

Incorrect.

A failed action may be recoverable locally.

The question is whether the failure affects the strategy.

---

## Misconception 3: Every Unexpected Observation Requires Replanning

Incorrect.

Some deviations are harmless.

The agent should evaluate impact before changing strategy.

---

## Misconception 4: Replanning Means Starting From the Beginning

Incorrect.

A revised plan should preserve valid completed work whenever possible.

---

## Misconception 5: Partial Success Is Failure

Incorrect.

Partial success can provide a useful state from which recovery can continue.

---

## Misconception 6: Replanning Is Just Choosing Another Action

Incorrect.

Choosing another immediate action is a runtime decision.

Replanning changes the strategy used to pursue the goal.

---

## Misconception 7: More Replanning Means More Intelligence

Incorrect.

Unnecessary replanning increases cost and instability.

Good adaptive planning changes strategy when evidence justifies it.

---

## Misconception 8: The Original Plan Is Always the Best Plan

Incorrect.

The original plan may become stale when assumptions or constraints change.

---

## Misconception 9: The Latest Observation Is Always More Important Than the Existing Plan

Incorrect.

An observation must be interpreted in context.

A small deviation may have no meaningful planning impact.

---

## Misconception 10: Adaptive Planning Means Unbounded Autonomy

Incorrect.

Adaptation should operate within defined constraints, budgets, and termination conditions.

---

## Misconception 11: Planning and Runtime Execution Are the Same Thing

Incorrect.

Runtime execution determines what happens next.

Planning determines whether the strategy remains appropriate and how it should change.

---

## Misconception 12: A Completed Step Is Automatically Safe to Preserve

Incorrect.

A completed result may become invalid if later evidence invalidates the assumptions under which it was produced.

Preserve validated progress, not merely historical completion.

---

## Interview Questions with Expected Answers

## Foundational

### 1. Why does an agent need adaptive planning?

**Expected answer:**

Because a plan is based on assumptions about the environment. During execution, observations can reveal changed conditions, unavailable resources, failed actions, or new information. Adaptive planning allows the agent to determine whether the current strategy remains valid and to modify or replace it when necessary.

---

### 2. What is the difference between a deviation and plan invalidation?

**Expected answer:**

A deviation is a difference between expected and observed conditions. Plan invalidation is the judgment that the current strategy can no longer reliably achieve the goal under those conditions. Not every deviation invalidates a plan.

---

### 3. What is local adaptation?

**Expected answer:**

Local adaptation changes a limited part of the current strategy while preserving the broader approach. For example, replacing an unavailable data source with an equivalent one while keeping the downstream strategy unchanged.

---

### 4. When is full replanning necessary?

**Expected answer:**

When a critical assumption, dependency, constraint, capability, or goal changes such that the current strategy can no longer reliably achieve the objective.

---

## Conceptual

### 5. Why should an agent avoid replanning after every unexpected observation?

**Expected answer:**

Because replanning has cost and can create instability. Some deviations are harmless or locally recoverable. Replanning should occur when the deviation materially affects the strategy.

---

### 6. Why is preserving completed work important?

**Expected answer:**

It reduces repeated work, latency, cost, and exposure to additional failures. However, completed work must remain valid under the revised assumptions before it is reused.

---

### 7. Explain the difference between action failure and plan failure.

**Expected answer:**

An action failure means one operation did not produce its intended result. Plan failure means the broader strategy can no longer reliably achieve the goal. A failed action may be replaced, retried, skipped, or recovered without invalidating the entire plan.

---

### 8. What is plan drift?

**Expected answer:**

Plan drift occurs when the current plan gradually becomes disconnected from the actual execution environment because assumptions, data, resources, constraints, or requirements have changed.

---

## Scenario-Based

### 9. An API call fails once due to a temporary timeout. Should the agent replan?

**Expected answer:**

Not necessarily. The planning system should determine whether the failure changes the strategy. If the problem is temporary and a bounded recovery path preserves the strategy, a local response may be sufficient. A transient timeout does not automatically invalidate the plan.

---

### 10. An API does not support the operation the plan depends on. What should the agent do?

**Expected answer:**

Determine whether an equivalent capability exists and whether it satisfies the relevant constraints. If a local replacement preserves the strategy, adapt locally. If the required capability is fundamental and the strategy no longer works, replan.

---

### 11. A plan expected 100 records but received 98. What should happen?

**Expected answer:**

Determine why two records are missing and whether their absence affects the goal. If the result remains sufficient, continue. If required information is missing, adapt or replan depending on the strategic impact.

---

### 12. An agent successfully completes four of five steps, then the fifth becomes impossible. Should it restart?

**Expected answer:**

No, not automatically. It should preserve completed work that remains valid and construct a recovery or revised strategy from the latest valid state.

---

## Debugging

### 13. An agent continuously generates new plans after minor deviations. What might be wrong?

**Expected answer:**

The replanning threshold may be too sensitive. The system may be treating every deviation as strategy-invalidating instead of distinguishing harmless deviations from meaningful strategic changes.

---

### 14. An agent continues following a plan even after a critical dependency disappears. What might be wrong?

**Expected answer:**

Plan-validity monitoring may be insufficient, or the system may not correctly connect the dependency failure to the downstream strategy.

---

### 15. An agent repeatedly restarts completed work after every failure. What should be improved?

**Expected answer:**

The planning system should track validated progress and construct recovery plans from the latest valid state instead of always restarting from the original goal state.

---

## Architecture

### 16. How would you design a system that supports adaptive planning?

**Expected answer:**

At a high level:

```text
Goal
  ↓
Planner
  ↓
Plan
  ↓
Runtime
  ↓
Observations
  ↓
Plan Validity Assessment
  ├── Continue
  ├── Local Adaptation
  └── Replanning
```

The system should maintain enough state to track plan progress, assumptions, deviations, completed work, plan versions, and bounded adaptation decisions.

---

### 17. What should be recorded when a plan is revised?

**Expected answer:**

At minimum, the system should identify the previous plan, the new plan, the triggering observation, the affected assumption or dependency, the reason for the change, preserved work, and the resulting plan version.

---

## Engineering Judgment

### 18. Which is better: a stable plan or an adaptive plan?

**Expected answer:**

Neither universally. A stable plan reduces planning overhead and improves predictability, while an adaptive plan handles uncertainty better. Production systems need an appropriate balance based on environmental uncertainty, execution cost, risk, and reversibility.

---

### 19. Should an agent always choose the shortest recovery plan?

**Expected answer:**

No. The shortest plan may violate constraints, be fragile, have higher operational risk, or fail to handle important dependencies. Recovery planning should consider feasibility, correctness, robustness, cost, and downstream consequences.

---

### 20. How would you prevent adaptive planning from becoming an infinite loop?

**Expected answer:**

Use bounded adaptation policies such as maximum replanning attempts, planning budgets, recovery limits, explicit termination conditions, and escalation paths.

---

# Quick Revision

## Core Mental Model

```text
Execute
   ↓
Observe
   ↓
Compare expected vs actual
   ↓
Assess impact
   ↓
Does the current strategy remain valid?
   ├── Yes → Continue
   └── No
        ↓
   Can local adaptation preserve the strategy?
        ├── Yes → Adapt
        └── No → Replan
```

---

## Important Distinctions

| Concept | Meaning |
|---|---|
| Deviation | Observed reality differs from expectation |
| Action failure | An individual operation did not succeed |
| Plan invalidation | Current strategy no longer reliably achieves the goal |
| Local adaptation | Limited strategic modification that preserves the broader approach |
| Replanning | Construction of a materially revised strategy |
| Partial success | Useful progress has been completed but the goal is not yet fully achieved |
| Plan drift | The current plan increasingly diverges from current reality |
| Recovery | A strategy for continuing after disruption |

---

## Three Questions to Ask After an Important Observation

```text
1. What changed?

2. Does the change affect the current strategy?

3. If yes, can I adapt locally, or must I replan?
```

---

## Preserve This Principle

> **Do not restart simply because execution changed. Reassess the strategy from the latest validated state.**

---

# Key Takeaways

1. A plan is a strategy based on current information and assumptions.
2. Execution exposes the plan to real-world conditions.
3. Observations may reveal deviations from the plan.
4. Not every deviation requires adaptation.
5. Not every failed action invalidates the plan.
6. Plan invalidation is a strategic judgment.
7. Local adaptation changes a limited part of the strategy.
8. Full replanning is required when the current strategy can no longer reliably achieve the goal.
9. Partial success should generally be preserved when the completed work remains valid.
10. Replanning should begin from the latest validated state rather than blindly restarting.
11. Plan drift occurs when the strategy becomes disconnected from current reality.
12. Replanning has cost and should therefore be bounded.
13. Adaptive planning must balance stability with responsiveness.
14. Plan changes should be observable and explainable in production systems.
15. AGT-02 answers **"What happens next?"**
16. AGT-05 answers **"Is this still the right strategy?"**
17. Good adaptive planning changes strategy when evidence justifies it—not whenever something unexpected happens.

---

## Further Reading

For this chapter, further study should focus on:

- Planning under uncertainty
- Online planning
- Replanning strategies
- Recovery-oriented execution
- Plan monitoring
- Adaptive systems
- Long-running agent execution
- Bounded autonomy

For repository-specific progression:

- [AGT-05 README — Planning & Adaptive Execution](./README.md)
- [AGT-05/01 — Task Decomposition and Agent Planning](./01-Task-Decomposition-and-Agent-Planning.md)
- [AGT-05/03 — Verification, Critique, and Plan Quality](./03-Verification-Critique-and-Plan-Quality.md)

The next chapter focuses on **verification and critique of plans**: how an agent determines whether a plan is feasible, complete, consistent, aligned with the goal, robust enough for its constraints, and worth executing.
