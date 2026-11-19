# Termination Policies and Bounded Autonomy

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain why an agent runtime needs explicit termination policies.
- Distinguish successful completion from other forms of execution termination.
- Distinguish explicit termination, cancellation, timeout, budget exhaustion, step-limit termination, and failure-induced termination.
- Explain the difference between graceful and forced termination.
- Design layered execution bounds for autonomous agent behavior.
- Recognize no-progress and repeated-cycle behavior.
- Explain how runaway execution can occur and how runtime controls limit it.
- Distinguish runtime termination control from planning, recovery, and broader safety strategy.
- Design termination reasons and execution telemetry that make termination behavior diagnosable.
- Explain the guarantees and limitations of bounded autonomy.

---

## Prerequisites

Before reading this chapter, you should understand:

- What an agent system is.
- The role of an agent runtime.
- The runtime execution loop.
- Decision, action, observation, and continuation.
- The distinction between runtime execution and planning.
- The distinction between state, context, and memory.

Recommended previous reading:

- [AGT-01 — Agent Definition and System Boundaries](../AGT-01-Agent-Definition-and-System-Boundaries/README.md)
- [AGT-02 — Agent Runtime, Loops & Bounded Autonomy](./README.md)
- [01 — Agent Runtime Harness and Execution Loop](./01-Agent-Runtime-Harness-and-Execution-Loop.md)
- [02 — Agent Decision, Action, Observation and Continuation](./02-Agent-Decision-Action-Observation-and-Continuation.md)

---

## Estimated Reading Time

**30–40 minutes**

---

## Before We Start

An autonomous agent is a system that can perform multiple execution steps without requiring a human to manually initiate every step.

That capability is useful because many real tasks cannot be completed in one model call.

A research agent may need to search several sources.

A coding agent may need to inspect files, modify code, run tests, inspect failures, and make another change.

A data-analysis agent may need to inspect data, execute analysis, observe results, and continue.

But autonomy introduces a fundamental engineering problem:

> **What prevents the agent from continuing indefinitely, consuming excessive resources, or repeatedly performing the wrong actions?**

The answer cannot simply be:

> "The model will know when it is done."

A production runtime needs explicit termination policies and execution bounds.

This chapter focuses on those runtime controls.

---

## 1. Why Termination Is a Runtime Responsibility

The execution loop introduced earlier can continue through multiple steps:

```text
Decision
   ↓
Action
   ↓
Observation
   ↓
Continuation
   ↓
Next Step
   ↓
Decision
   ↓
...
```

At some point, execution must stop.

That stopping point may occur because:

- the goal has been completed;
- an explicit termination signal was received;
- an external cancellation request was received;
- a timeout was reached;
- the maximum number of steps was reached;
- a resource budget was exhausted;
- an execution failure requires the runtime to stop;
- a runtime control condition requires termination;
- the runtime detects no meaningful progress;
- the runtime detects a repeated execution pattern.

The important engineering principle is:

> **Autonomy should be bounded by the runtime rather than being left entirely to model behavior.**

The model may contribute to determining whether the task is complete, but the runtime should retain enforceable boundaries around how long and how extensively execution can continue.

---

# 2. Mental Model: Autonomy Inside a Boundary

A useful mental model is:

```text
                 AUTONOMOUS EXECUTION
        ┌─────────────────────────────────┐
        │                                 │
        │   Decision → Action → Observe   │
        │        → Continue → ...         │
        │                                 │
        │        ┌──────────────┐         │
        │        │ Goal / Stop  │         │
        │        │ Conditions   │         │
        │        └──────────────┘         │
        │                                 │
        └─────────────────────────────────┘
              ↑        ↑        ↑
              │        │        │
         Time Bound  Step Bound  Resource Bound
              │        │        │
              └────────┴────────┘
                       │
                 Runtime Boundary
```

The agent can operate autonomously **inside** the runtime boundary.

The boundary defines what the runtime will permit.

This leads to an important distinction:

### Agent autonomy

The agent can determine or influence what to do next.

### Runtime authority

The runtime determines whether further execution is allowed.

These are not the same thing.

A model can request another action while the runtime can still decide:

> "No. The execution budget has been exhausted."

That is one of the foundations of bounded autonomy.

---

# 3. Termination Conditions, Policies, and Enforcement

These three terms should be kept distinct.

### Termination condition

A **termination condition** is an event or condition indicating that execution should stop.

Examples:

```text
Task completed
Timeout reached
Cancellation requested
Maximum steps reached
Budget exhausted
Repeated cycle detected
```

### Termination policy

A **termination policy** defines which termination conditions apply and how the runtime should handle them.

For example:

```text
Maximum duration = 120 seconds
Maximum steps = 20
Cancellation is honored immediately
Repeated cycle threshold = 3
```

### Runtime enforcement

**Runtime enforcement** is the mechanism that actually prevents further execution once a termination condition is reached.

Conceptually:

```text
Condition detected
       ↓
Termination policy evaluated
       ↓
Runtime enforcement
       ↓
Execution stops
```

This distinction matters because defining a limit is not the same as reliably enforcing it.

---

# 4. What Is a Termination Policy?

A termination policy defines the conditions under which an agent execution stops and the runtime behavior associated with those conditions.

Conceptually:

```text
if termination_condition:
    stop_execution()
```

In a real system, there are usually multiple termination conditions rather than one.

For example:

```text
Successful completion
        OR
Explicit termination
        OR
Cancellation
        OR
Timeout
        OR
Step limit
        OR
Budget exhaustion
        OR
Failure condition
        OR
Runtime control condition
        OR
No-progress condition
        OR
Repeated-cycle condition
        ↓
     Terminate
```

A termination policy therefore answers:

1. **What conditions should cause execution to stop?**
2. **How should the runtime enforce the resulting termination?**

Broader recovery or safety strategy is a separate concern.

---

# 5. Successful Completion

The most normal termination path is successful completion.

An execution may terminate because the requested objective has been satisfied.

For example:

```text
User:
"Find the three cheapest compatible hotels."

Agent:
Search hotels
    ↓
Collect results
    ↓
Compare prices
    ↓
Verify compatibility
    ↓
Return top three
    ↓
Complete
```

The runtime observes a completion condition and ends the execution.

However, successful completion should not be confused with:

> "The model produced something that looks like an answer."

A production system may define completion more carefully.

For example:

```text
Completion requires:

required information present
        +
required checks completed
        +
expected output produced
        +
runtime completion condition satisfied
```

Depending on the system, completion may be determined by:

- explicit agent output;
- application logic;
- deterministic validation;
- required task conditions;
- external system confirmation;
- a combination of these.

The runtime enforces the execution boundary around completion; it does not need to define every business-specific completion criterion.

---

# 6. Explicit Termination

An execution may receive an explicit signal indicating that it should stop.

For example:

```text
Agent decision:

"Task completed."
```

or a structured execution result might contain:

```json
{
  "status": "completed"
}
```

The runtime can interpret that result as a termination signal.

Explicit termination is useful because it provides a clear transition:

```text
Continue execution
       ↓
Explicit termination signal
       ↓
Termination condition satisfied
       ↓
Execution stops
```

Explicit termination is different from cancellation.

An explicit termination signal is part of the execution's normal control flow or result semantics.

Cancellation is an externally initiated request to stop an execution that may otherwise still be running.

Explicit termination should not be the only boundary.

A malfunctioning agent may fail to produce a completion signal, which is why runtime-enforced limits remain necessary.

---

# 7. Cancellation

**Cancellation** means that an external actor or system requests that an execution stop.

For example:

```text
User starts agent
      ↓
Agent is executing
      ↓
User presses "Cancel"
      ↓
Runtime receives cancellation request
      ↓
Execution stops
```

Cancellation can originate from:

- a user;
- an API caller;
- an application controller;
- an administrator;
- another authorized runtime component.

The important characteristic is:

> **Cancellation is externally initiated.**

It is not the same as the runtime independently deciding that a time limit has been exceeded.

A runtime may need to propagate cancellation through currently executing work where the underlying execution mechanism supports it.

---

# 8. Timeout

A **timeout** occurs when execution exceeds an allowed time duration.

For example:

```text
Start
  ↓
t = 0s
  ↓
Agent execution
  ↓
Agent execution
  ↓
t = 60s
  ↓
Timeout reached
  ↓
Terminate
```

A timeout is runtime-enforced.

It is especially useful when execution may become stuck because of:

- slow dependencies;
- unavailable services;
- repeated waiting;
- unexpected model latency;
- long-running actions;
- execution paths that fail to make progress.

### Cancellation vs Timeout

| Mechanism | Trigger |
|---|---|
| Cancellation | External request to stop |
| Timeout | Runtime time limit exceeded |

Both may result in termination, but their causes and operational meanings are different.

---

# 9. Maximum Step Limits

A runtime can impose a maximum number of execution steps.

For example:

```text
Maximum steps = 20

Step 1
Step 2
Step 3
...
Step 19
Step 20
↓
Step limit reached
↓
Terminate
```

This prevents an execution from continuing indefinitely when each individual step appears valid.

A step limit is useful because an agent can repeatedly produce locally reasonable actions without making meaningful global progress.

For example:

```text
Search
↓
Search again
↓
Search again with slightly different query
↓
Search again
↓
Search again
↓
...
```

Even if every action succeeds, the execution may still be undesirable.

A maximum step count provides a deterministic upper bound on the number of runtime iterations.

However:

> **A step limit alone does not guarantee safe or efficient execution.**

Twenty expensive actions may be worse than one hundred cheap actions.

That is why step limits should normally be combined with other controls.

---

# 10. Resource and Budget Limits

Execution can be bounded using resource budgets.

Possible budgets include:

- model token usage;
- number of model calls;
- number of actions;
- external API calls;
- tool invocations;
- compute time;
- monetary cost;
- other measurable runtime resources.

A conceptual model is:

```text
Execution
    │
    ├── Time budget
    ├── Step budget
    ├── Token budget
    ├── Action budget
    ├── External-call budget
    └── Cost/resource budget
```

Each budget controls a different dimension of execution.

For example:

```text
Maximum steps:       25
Maximum duration:    120 seconds
Maximum model calls: 30
Maximum tool calls:  50
Maximum token usage: defined by system policy
```

The exact values depend on the application.

The important engineering principle is:

> **Bound the dimensions that can materially affect system behavior and cost.**

---

# 11. Why Multiple Bounds Are Necessary

Consider an agent with only a step limit:

```text
Maximum steps = 100
```

The agent cannot execute more than 100 steps under that policy.

But imagine each step makes an expensive external request.

The system may still experience:

- excessive latency;
- high external-service usage;
- unexpected cost;
- resource exhaustion.

Now consider only a time limit:

```text
Maximum duration = 60 seconds
```

An agent could execute many extremely fast actions before the timeout.

That may still be undesirable.

Therefore, bounded autonomy is better represented as multiple constraints:

```text
                 Runtime Execution
                        │
        ┌───────────────┼────────────────┐
        ↓               ↓                ↓
     Time Bound      Step Bound      Resource Bound
        │               │                │
        └───────────────┼────────────────┘
                        ↓
                Execution Allowed
```

This is a **defense-in-depth** approach.

No single limit should be treated as a universal safety guarantee.

---

# 12. No-Progress Detection

Not every problematic execution is infinite in the strict mathematical sense.

An agent may continue performing actions while making little or no meaningful task progress.

For example:

```text
Step 1 → Search
Step 2 → Search same source
Step 3 → Search same source
Step 4 → Search same source
Step 5 → Search same source
```

The execution is moving forward in terms of step count.

But the task itself may not be progressing.

This creates an important distinction:

```text
Execution progress
        ≠
Task progress
```

The runtime may therefore monitor signals associated with progress.

Examples include:

- repeated observations;
- unchanged execution conditions;
- repeated action patterns;
- lack of newly acquired information;
- repeated unsuccessful transitions;
- unchanged task-relevant outputs.

The exact definition of progress is application-dependent.

A runtime should not assume that every repeated action is necessarily a bug.

Instead, it can identify suspicious execution patterns and apply an appropriate termination policy.

---

# 13. Repeated-Cycle Detection

A particularly important form of no-progress behavior is a repeated cycle.

For example:

```text
A → B → C → A → B → C → A → ...
```

The agent is not necessarily stuck at one step.

It is repeatedly traversing the same execution pattern.

A runtime can detect repeated behavior using signals such as:

- action/observation patterns;
- execution-history signals;
- repeated transition patterns;
- stable runtime execution metadata.

Conceptually:

```text
Step N
  ↓
Pattern observed
  ↓
Compare with relevant execution history
  ↓
Repeated pattern detected?
  ├── No → Continue
  └── Yes → Apply termination policy
```

The exact implementation can vary considerably.

The key principle is:

> **An execution can be bounded not only by how much work it has performed, but also by whether its behavior is meaningfully progressing.**

The broader question of what recovery or containment strategy should follow detection belongs to the reliability and safety layer.

---

# 14. Runaway Execution

A **runaway execution** is an execution that continues beyond useful or acceptable bounds.

It may result from:

- failure to recognize completion;
- repeated actions;
- poor continuation decisions;
- unexpected observations;
- dependency behavior;
- malformed outputs;
- execution paths that do not converge;
- missing runtime limits.

Consider:

```text
Goal
 ↓
Decision
 ↓
Action
 ↓
Observation
 ↓
Decision
 ↓
Action
 ↓
Observation
 ↓
Decision
 ↓
...
```

Without enforceable boundaries, this loop can continue indefinitely.

A production runtime should assume that abnormal execution is possible.

Therefore:

```text
Autonomy
   +
Runtime Limits
   +
Termination Policies
   +
Observability
   =
Bounded Execution
```

The runtime does not need to guarantee that every execution is correct.

It needs to guarantee that execution remains within its defined operational boundaries.

---

# 15. Termination Policy Layers

A useful way to organize termination controls is into three broad layers:

```text
                 TERMINATION POLICY
                        │
        ┌───────────────┼────────────────┐
        ↓               ↓                ↓
    Completion       External         Runtime
    Conditions       Control          Limits
        │               │                │
        │          Cancellation      Timeout
        │          Stop Request      Step Limit
        │                            Budgets
        │                            Resource Limits
        └───────────────┼────────────┘
                        ↓
                   Termination
```

### Completion controls

Answer:

> "Has the intended execution objective been satisfied?"

### External controls

Answer:

> "Has an authorized external actor requested that execution stop?"

### Runtime limits

Answer:

> "Has execution exceeded an operational boundary?"

These layers can operate together.

---

# 16. Graceful vs Forced Termination

Not all termination is identical.

### Graceful termination

The runtime allows currently supported cleanup or finalization behavior before execution fully stops.

For example:

```text
Termination requested
       ↓
Stop starting new work
       ↓
Finalize supported runtime work
       ↓
Record termination
       ↓
Return result
```

### Forced termination

Execution is interrupted without waiting for normal completion of the current work.

For example:

```text
Termination condition
       ↓
Immediate interruption
       ↓
Execution stops
       ↓
Record termination
```

The appropriate behavior depends on the execution environment and action semantics.

A long-running external operation may not be safely interruptible.

Therefore:

> **Termination policy should account for the interruptibility and side effects of the work being executed.**

---

# 17. Termination Reasons Matter

A production system should not simply record:

```text
status = "stopped"
```

That is often insufficient for debugging.

Instead, the runtime should distinguish termination causes.

For example:

```text
COMPLETED
EXPLICIT_TERMINATION
CANCELLED
TIMEOUT
STEP_LIMIT
BUDGET_EXHAUSTED
RESOURCE_LIMIT
FAILURE
NO_PROGRESS
REPEATED_CYCLE
CONTROL_TRIGGERED
```

The exact taxonomy depends on the system.

The important idea is:

> **Termination is an observable runtime event with a reason, not merely the disappearance of execution.**

This information helps engineers answer:

- Why did the agent stop?
- Was the task completed?
- Did a user cancel it?
- Did it exceed its time budget?
- Did it run out of resources?
- Did it repeatedly perform the same behavior?
- Did an execution failure terminate the run?

---

# 18. Observability of Termination

Termination policies are difficult to operate if their decisions are invisible.

A useful execution record might contain:

```text
Execution ID
Start time
End time
Steps executed
Termination reason
Budget consumed
Last action
Last observation
Completion status
Cancellation status
Relevant runtime metadata
```

Conceptually:

```text
Execution
    │
    ├── Steps
    ├── Actions
    ├── Observations
    ├── Budget usage
    ├── Termination event
    └── Termination reason
```

This creates an execution trace that can be used for:

- debugging;
- operational monitoring;
- cost analysis;
- failure investigation;
- policy tuning;
- regression analysis.

The goal is not to design the complete observability architecture here.

The goal is to make termination behavior reconstructable.

---

# 19. Runtime Termination vs Planning

Termination and planning are related but different concerns.

Planning asks:

> **"What is the best way to achieve the goal?"**

Runtime termination asks:

> **"Should execution continue under the current runtime conditions?"**

For example:

```text
Planner:
"We should search source A, then source B."

Runtime:
"Execution has exceeded the allowed time."

→ Runtime terminates execution.
```

Or:

```text
Planner:
"Try another approach."

Runtime:
"Maximum step budget has been exhausted."

→ Runtime terminates execution.
```

The runtime does not need to determine whether the original plan was strategically optimal.

It needs to enforce the execution boundary.

This distinction prevents runtime termination logic from becoming an accidental planning engine.

---

# 20. Runtime Termination vs Recovery and Safety Strategy

Termination is also different from broader recovery and safety strategy.

Suppose an action fails.

The runtime may detect:

```text
Action failed
       ↓
Execution cannot continue under current conditions
       ↓
Terminate
```

A broader reliability or safety layer may determine what response is appropriate for that failure.

For example, the system may have policies for recovery, fallback, compensation, degradation, containment, or escalation.

Those strategies are outside the primary ownership of AGT-02.

The AGT-02 responsibility is:

> **Detect and enforce the runtime execution boundary.**

The broader responsibility is addressed in the appropriate reliability and safety architecture.

---

# 21. Runtime Termination vs State, Context, and Memory

Termination may depend on runtime execution information, but that does not make termination policy equivalent to state or memory architecture.

Keep the distinction clear:

```text
State
  = information representing system or execution condition

Context
  = information assembled for a particular model interaction

Memory
  = information retained for future use
```

AGT-02 may use runtime execution metadata such as:

```text
steps_executed
elapsed_time
budget_remaining
last_execution_event
termination_status
```

These are runtime execution concerns.

AGT-04 owns the broader architecture of state, context, and memory.

---

# 22. A Layered Bounded-Autonomy Model

A practical bounded-autonomy design can be represented as:

```text
                    AGENT EXECUTION
                          │
                          ↓
                  Decision / Action
                          │
                          ↓
                     Observation
                          │
                          ↓
                 Continue / Complete
                          │
             ┌────────────┼────────────┐
             ↓            ↓            ↓
          Time Limit   Step Limit   Resource Limit
             │            │            │
             └────────────┼────────────┘
                          ↓
                  Additional Controls
                          │
          ┌───────────────┼────────────────┐
          ↓               ↓                ↓
    Cancellation     No Progress      Repeated Cycle
          │               │                │
          └───────────────┼────────────────┘
                          ↓
                    Termination
                          ↓
                Reason + Execution Trace
```

This illustrates an important principle:

> **Bounded autonomy is a collection of enforceable constraints, not a single mechanism.**

---

# 23. Example: Research Agent

Consider a research agent asked:

> "Compare the latest three cloud database offerings."

A possible execution is:

```text
Step 1
Search provider A
↓
Observation

Step 2
Search provider B
↓
Observation

Step 3
Search provider C
↓
Observation

Step 4
Compare findings
↓
Observation

Step 5
Validate missing information
↓
Observation

Step 6
Generate result
↓
Complete
```

Now consider a problematic execution:

```text
Step 1 → Search provider A
Step 2 → Search provider A again
Step 3 → Search provider A again
Step 4 → Search provider A again
...
```

A bounded runtime might detect:

```text
Repeated behavior
        +
Step budget
        +
Time budget
        ↓
Termination
```

The result could be:

```text
status = terminated
reason = repeated_cycle
```

The runtime has prevented unbounded execution.

It has not necessarily solved the underlying research problem.

The runtime boundary and the broader recovery strategy remain separate concerns.

---

# 24. Example: Coding Agent

Consider a coding agent:

```text
Inspect repository
      ↓
Modify code
      ↓
Run tests
      ↓
Observe failure
      ↓
Modify code
      ↓
Run tests
      ↓
Observe failure
      ↓
...
```

Suppose the agent repeatedly changes the same file and produces the same failing test.

The runtime can observe:

```text
Repeated execution pattern
```

and apply a termination boundary.

For example:

```text
Maximum debugging iterations = 10
```

After the limit:

```text
Execution terminated
Reason = STEP_LIMIT
```

The runtime does not decide whether the code should have been rewritten differently.

That is a planning and reasoning concern.

The runtime ensures that the debugging loop cannot continue without bound.

---

# 25. Designing Termination Policies

A useful design process is:

### Step 1 — Define successful completion

Ask:

> What observable condition means the task is complete?

### Step 2 — Identify external stop conditions

Ask:

> Who can cancel execution, and how?

### Step 3 — Define execution limits

Identify:

- maximum duration;
- maximum steps;
- model-call limits;
- action limits;
- relevant resource budgets.

### Step 4 — Identify abnormal execution patterns

Consider:

- no progress;
- repeated cycles;
- repeated execution failures;
- unexpected continuation;
- excessive resource usage.

### Step 5 — Define termination reasons

Make termination diagnosable.

### Step 6 — Define termination behavior

Decide when termination should be:

- graceful;
- immediate;
- externally initiated;
- runtime-enforced.

### Step 7 — Validate the boundaries

Test scenarios such as:

```text
Normal completion
User cancellation
Timeout
Step exhaustion
Budget exhaustion
Repeated cycle
No progress
Action failure
Unexpected continuation
```

This turns termination from an implicit behavior into an explicit engineering design.

---

# 26. Termination Policy Example

A framework-independent conceptual policy might look like:

```text
IF task_complete:
    terminate(success)

ELSE IF explicit_termination_signal:
    terminate(explicit_termination)

ELSE IF cancellation_requested:
    terminate(cancelled)

ELSE IF elapsed_time > time_budget:
    terminate(timeout)

ELSE IF steps >= max_steps:
    terminate(step_limit)

ELSE IF resource_usage >= resource_budget:
    terminate(budget_exhausted)

ELSE IF no_progress_detected:
    terminate(no_progress)

ELSE IF repeated_cycle_detected:
    terminate(repeated_cycle)

ELSE IF execution_failure_requires_stop:
    terminate(failure)

ELSE:
    continue
```

This is illustrative pseudocode, not a universal runtime implementation.

Real systems may evaluate conditions in a different order or use more sophisticated policies.

---

# 27. Termination Ordering Matters

Termination conditions can sometimes occur simultaneously.

For example:

```text
Step 20
+
Timeout reached
+
Budget exhausted
```

Which reason should the runtime record?

There is no universal answer.

The system may define a deterministic precedence order.

For example:

```text
Cancellation
      ↓
Control-triggered termination
      ↓
Timeout
      ↓
Resource limit
      ↓
Step limit
      ↓
No progress
      ↓
Completion
```

Another architecture may choose a different ordering.

The important engineering requirement is:

> **If multiple termination conditions can occur together, the policy should define how the runtime records and reports the result.**

Otherwise operational behavior can become inconsistent.

---

# 28. Hard vs Soft Limits

Not every limit needs to behave identically.

### Hard limit

Execution must stop when the boundary is reached.

Example:

```text
Maximum execution duration = 120 seconds
```

### Soft limit

The runtime may signal that the boundary is approaching and allow controlled behavior before final termination.

For example:

```text
80% budget consumed
       ↓
Runtime warning
       ↓
Agent may produce a final result
       ↓
Termination
```

Soft limits can provide more flexibility.

Hard limits provide stronger guarantees.

The appropriate choice depends on the system's requirements.

For critical resource boundaries, a hard limit may be necessary.

For graceful completion opportunities, a soft threshold may be useful.

---

# 29. Time Limits vs Step Limits

Both limits constrain execution, but they control different dimensions.

| Limit | Controls | Main Strength |
|---|---|---|
| Time limit | Duration | Prevents long-running execution |
| Step limit | Number of iterations | Prevents excessive loop depth |
| Resource budget | Resource consumption | Controls cost/usage |
| Action budget | Number of actions | Controls external activity |

Consider two executions:

```text
Execution A
100 fast steps
1 second

Execution B
5 slow steps
90 seconds
```

A step limit strongly constrains A.

A time limit strongly constrains B.

Using both provides broader protection.

---

# 30. Guarantees and Limitations

Bounded autonomy provides useful guarantees, but engineers should be precise about what those guarantees actually mean.

### A step limit guarantees

The runtime will not intentionally allow more than the configured number of counted steps under that policy.

It does **not** guarantee:

- useful progress;
- low cost;
- safe actions;
- successful completion.

### A time limit guarantees

Execution is bounded by the configured runtime duration according to the runtime's enforcement model.

It does **not** guarantee:

- task completion;
- efficient execution;
- absence of side effects from work already started.

### A resource budget guarantees

Execution is constrained by the monitored resource dimension.

It does **not** guarantee:

- correct behavior;
- useful planning;
- safe external effects.

### Layered limits provide stronger control

Combining multiple boundaries reduces the chance that one failure mode can bypass all runtime controls.

But:

> **Bounded execution is not equivalent to safe or correct execution.**

An agent can terminate safely and still produce a wrong answer.

An agent can remain within its budget and still perform an undesirable action.

An agent can complete within its time limit and still fail the business objective.

Termination controls bound execution.

They do not replace correctness, planning, evaluation, tool safety, or broader system controls.

---

## 31. Common Failure Pattern: "The Model Will Stop"

One of the most dangerous assumptions is:

```text
The model understands the task,
therefore the model will know when to stop.
```

This is unreliable as a sole runtime boundary.

A model may:

- misinterpret completion;
- continue exploring;
- repeat actions;
- respond to changing observations unexpectedly;
- fail to recognize that progress is impossible;
- generate another action when the task is already sufficient.

A production runtime should therefore treat model-driven completion as one termination signal among several runtime controls.

---

# 32. Common Misconceptions

### Misconception 1: A timeout is the same as cancellation

**Incorrect.**

Cancellation is an external request.

Timeout is a runtime-enforced time boundary.

---

### Misconception 2: Maximum steps guarantee bounded cost

**Incorrect.**

Each step may have very different cost.

Step limits should be combined with relevant resource or time budgets.

---

### Misconception 3: Successful completion is the only valid termination

**Incorrect.**

Execution can terminate because of cancellation, timeout, budgets, failure, control conditions, or other runtime policies.

---

### Misconception 4: Termination means the agent failed

**Incorrect.**

Termination can be successful or unsuccessful.

```text
COMPLETED
```

and

```text
TIMEOUT
```

are both termination outcomes, but they represent different execution results.

---

### Misconception 5: No progress means the agent is mathematically stuck

**Incorrect.**

No-progress detection is an operational judgment based on observable runtime behavior.

The definition depends on the application.

---

### Misconception 6: Every repeated action is a bug

**Incorrect.**

Some tasks legitimately require repeated actions.

The runtime should detect meaningful repeated behavior rather than blindly treating repetition as failure.

---

### Misconception 7: The runtime should decide the entire recovery strategy

**Incorrect.**

The runtime enforces termination boundaries.

Broader recovery, fallback, compensation, degradation, containment, and safety strategy belong to the appropriate reliability and safety layers.

---

### Misconception 8: Bounded autonomy makes an agent safe

**Incorrect.**

Bounded autonomy limits execution.

It does not guarantee correct, secure, or safe behavior.

---

### Misconception 9: Runtime termination is planning

**Incorrect.**

Planning determines how to pursue a goal.

Termination determines whether execution is allowed to continue.

---

# 33. Production Perspective

In production, termination policy is not an optional implementation detail.

It affects:

- latency;
- cost;
- resource consumption;
- user experience;
- dependency load;
- operational reliability;
- debugging;
- incident analysis.

A production agent runtime should make termination behavior explicit and observable.

At minimum, engineers should be able to answer:

```text
When did execution start?
How many steps occurred?
How much time was consumed?
What resources were consumed?
What was the last meaningful execution event?
Why did execution stop?
Was the task completed?
Was termination externally requested?
```

The exact telemetry depends on the system.

The engineering principle is:

> **If engineers cannot explain why an autonomous execution stopped, the termination design is difficult to operate.**

---

# 34. Engineering Trade-offs

## Strict vs Flexible Step Limits

### Strict

Advantages:

- predictable;
- easy to reason about;
- strong upper bound.

Disadvantages:

- may terminate legitimate long tasks;
- ignores cost differences between steps.

### Flexible

Advantages:

- can adapt to task complexity;
- potentially better utilization.

Disadvantages:

- more complex;
- harder to guarantee.

---

## Hard vs Soft Budgets

### Hard budgets

Provide stronger enforcement.

But they can interrupt useful work abruptly.

### Soft budgets

Provide opportunities for graceful completion.

But they provide weaker guarantees.

---

## Immediate vs Graceful Termination

### Immediate

Better for urgent control conditions.

But may leave current work incomplete.

### Graceful

Better for cleanup and finalization.

But may take additional time.

---

## Single Limit vs Layered Limits

### Single limit

Simpler implementation.

But protects only one execution dimension.

### Layered limits

More robust.

But increase implementation and policy complexity.

For production autonomous systems, layered controls are generally more appropriate when multiple resource and behavior risks exist.

---

## Aggressive vs Permissive No-Progress Detection

### Aggressive

Stops suspicious behavior quickly.

Risk:

```text
Legitimate repeated behavior
        ↓
False termination
```

### Permissive

Allows more execution.

Risk:

```text
Actual loop
        ↓
Longer wasted execution
```

The right threshold depends on the task.

---

# 35. Responsibility Boundaries

AGT-02 should remain clear about ownership.

| Concern | Primary Owner |
|---|---|
| Agent definition | AGT-01 |
| Runtime harness and execution loop | AGT-02 |
| Termination and bounded autonomy | AGT-02 |
| Tool interfaces and invocation mechanics | AGT-03 |
| State, context, memory | AGT-04 |
| Planning and replanning | AGT-05 |
| Durable workflows and resumability | AGT-06 |
| Human approval and intervention | AGT-07 |
| Protocols and agent communication | AGT-08 |
| Multi-agent systems | AGT-09 |
| Agent evaluation | AGT-10 |
| Recovery and broader safety strategy | AGT-11 |
| System architecture synthesis | AGT-12 |

The most important boundary for this chapter is:

```text
AGT-02
Runtime:
"Is execution allowed to continue?"

AGT-05
Planning:
"What should we do next to achieve the goal?"

AGT-11
Reliability / Safety:
"What broader recovery, containment, or safety strategy applies?"
```

These questions interact, but they are not interchangeable.

---

# 36. Practical Design Checklist

When designing termination for an agent runtime, verify:

### Completion

- Is successful completion explicitly defined?
- Can completion be determined from observable conditions?

### External Control

- Can execution be cancelled?
- Is cancellation observable?
- Is cancellation behavior defined?

### Runtime Limits

- Is there a maximum execution duration?
- Is there a maximum step count?
- Are relevant resource budgets enforced?
- Are action or external-call budgets needed?

### Abnormal Execution

- Can no-progress behavior be detected?
- Can repeated cycles be detected?
- Can runaway execution be bounded?

### Termination Behavior

- Are graceful and forced termination distinguished?
- Are termination reasons recorded?
- Is termination ordering deterministic when multiple conditions occur?

### Observability

- Can engineers reconstruct why execution stopped?
- Are budget consumption and execution history visible enough for diagnosis?

### Boundaries

- Does the design avoid turning termination into planning?
- Does it avoid duplicating recovery strategy?
- Does it avoid confusing runtime metadata with state or memory architecture?

---

## 37. Interview Questions

## Foundational

### 1. Why does an agent runtime need termination policies?

**Expected answer:**

Because autonomous execution can continue across multiple steps and may fail to naturally stop. Termination policies provide explicit runtime boundaries for successful completion, cancellation, timeouts, budgets, failures, and abnormal execution patterns.

---

### 2. What is bounded autonomy?

**Expected answer:**

Bounded autonomy means allowing an agent to operate independently while enforcing runtime constraints on dimensions such as time, steps, resources, actions, and execution behavior. It is a defense-in-depth approach rather than a single limit.

---

## Runtime Reasoning

### 3. What is the difference between explicit termination, cancellation, and timeout?

**Expected answer:**

An explicit termination signal is part of the execution's control or result semantics and indicates that execution should stop. Cancellation is an externally initiated request to stop a running execution. A timeout occurs because the runtime's configured time boundary has been exceeded.

---

### 4. Why is a maximum step count insufficient?

**Expected answer:**

Steps can have different costs. A fixed step limit does not control execution duration, token usage, external-call cost, or other resource dimensions. Layered limits provide broader control.

---

### 5. Why should termination reasons be observable?

**Expected answer:**

Because `stopped` alone does not explain whether execution completed successfully, timed out, was cancelled, exhausted a budget, failed, or entered abnormal behavior. Distinct reasons improve debugging, operations, and policy tuning.

---

## Scenario

### 6. An agent repeatedly searches the same source but each search succeeds. Should the runtime terminate it?

**Expected answer:**

Not automatically. Repetition can be legitimate. The runtime should use task-relevant progress or repeated-pattern signals and apply a defined policy when behavior indicates no meaningful progress.

---

### 7. An agent reaches its maximum step count while producing a potentially useful answer. Should it continue?

**Expected answer:**

If the step limit is a hard runtime boundary, execution should stop. The system may use soft thresholds or other design mechanisms if graceful completion is desired, but it should not silently bypass a hard limit.

---

### 8. An agent exceeds its time budget while an external action is still running. What should happen?

**Expected answer:**

The runtime should apply its defined timeout policy. Whether the current action can be interrupted gracefully depends on the execution mechanism and side effects. The runtime should record the timeout and termination outcome.

---

## Engineering Judgment

### 9. Which is better: a 20-step limit or a two-minute timeout?

**Expected answer:**

Neither is universally better. They constrain different dimensions. A robust system may need both because 20 steps can be either very cheap or very expensive, while two minutes can allow either too many fast steps or too few slow steps.

---

### 10. Does bounded autonomy guarantee safe behavior?

**Expected answer:**

No. It bounds execution but does not guarantee correctness, secure actions, appropriate planning, or business success. Other controls are required.

---

## Architecture

### 11. How would you distinguish termination from planning?

**Expected answer:**

Planning determines how the system should pursue a goal. Termination determines whether the runtime is still allowed to execute. A planner can request another step while the runtime can independently deny continuation because a boundary has been reached.

---

### 12. What belongs in AGT-02 versus AGT-11?

**Expected answer:**

AGT-02 owns runtime termination detection and enforcement. AGT-11 owns broader recovery, fallback, compensation, degradation, containment, and safety strategy. The runtime may enforce the final execution boundary without owning the entire recovery decision process.

---

## 38. Quick Revision

Remember these core ideas:

```text
Autonomy ≠ Unlimited Execution
```

```text
Termination ≠ Failure
```

```text
Cancellation ≠ Timeout
```

```text
Explicit Termination ≠ Cancellation
```

```text
Step Limit ≠ Cost Limit
```

```text
Execution Progress ≠ Task Progress
```

```text
Runtime Termination ≠ Planning
```

```text
Bounded Autonomy ≠ Complete Safety
```

And the central runtime principle:

```text
                AUTONOMY
                    │
                    ↓
          Runtime Execution Loop
                    │
          ┌─────────┼─────────┐
          ↓         ↓         ↓
        Time      Steps    Resources
          │         │         │
          └─────────┼─────────┘
                    ↓
          Additional Controls
                    │
        ┌───────────┼───────────┐
        ↓           ↓           ↓
   Cancellation  No Progress  Repetition
        │           │           │
        └───────────┼───────────┘
                    ↓
               Termination
                    │
                    ↓
            Reason + Trace
```

---

# 39. Key Takeaways

1. Autonomous execution must have explicit runtime termination boundaries.
2. Successful completion is only one possible termination condition.
3. Explicit termination, cancellation, and timeout have different origins and semantics.
4. Step limits, time limits, and resource budgets control different dimensions of execution.
5. No-progress and repeated-cycle behavior can indicate problematic autonomous execution.
6. Bounded autonomy should use layered controls rather than relying on one limit.
7. Graceful and forced termination have different operational characteristics.
8. Termination reasons should be observable and diagnosable.
9. Runtime termination is different from planning.
10. Runtime termination is different from broader recovery and safety strategy.
11. Runtime execution metadata should not be confused with state, context, or memory.
12. Bounded autonomy limits execution but does not guarantee correctness or safety.

The central engineering lesson is:

> **An autonomous agent should be free to act within explicit runtime boundaries, never free to execute without enforceable limits.**

---

## Further Reading

- [AGT-01 — Agent Definition and System Boundaries](../AGT-01-Agent-Definition-and-System-Boundaries/README.md)
- [AGT-02 — Agent Runtime, Loops & Bounded Autonomy](./README.md)
- [01 — Agent Runtime Harness and Execution Loop](./01-Agent-Runtime-Harness-and-Execution-Loop.md)
- [02 — Agent Decision, Action, Observation and Continuation](./02-Agent-Decision-Action-Observation-and-Continuation.md)
- [AGT-04 — State, Context and Memory](../AGT-04-Agent-State-Context-and-Memory/README.md)
- [AGT-05 — Planning and Replanning](../AGT-05-Agent-Planning-and-Replanning/README.md)
- [AGT-06 — Workflow Orchestration and Durable Execution](../AGT-06-Workflow-Orchestration-and-Durable-Execution/README.md)
- [AGT-11 — Reliability, Recovery and Safety](../AGT-11-Agent-Reliability-Recovery-and-Safety/README.md)
