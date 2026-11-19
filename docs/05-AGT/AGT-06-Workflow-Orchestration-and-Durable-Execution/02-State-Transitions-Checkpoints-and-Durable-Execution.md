# AGT-06.02 — State Transitions, Checkpoints and Durable Execution

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain what workflow state represents.
- Distinguish workflow state from agent state, context, and memory.
- Explain workflow state transitions.
- Model workflow execution as a sequence of state transitions.
- Explain why execution history matters for recovery.
- Understand checkpoints and why they are useful.
- Explain durable execution.
- Reason about what happens when a workflow is interrupted after partial completion.
- Explain how a workflow can resume from a known point.
- Distinguish checkpoint recovery from restarting a workflow.
- Understand replay and its relationship to recovery.
- Distinguish replaying execution history from re-executing workflow steps.
- Explain why checkpointing does not automatically provide exactly-once execution.
- Reason about duplicate side effects during recovery.
- Explain why idempotency and deduplication matter at workflow boundaries.
- Evaluate checkpoint frequency and granularity trade-offs.
- Reason about deterministic recovery points.
- Understand workflow consistency and execution lineage.
- Design recovery-oriented workflow structures.

---

## Prerequisites

Before reading this chapter, you should understand:

- Workflow steps
- Sequential workflows
- Branching
- Loops
- Parallel execution
- Fan-out and fan-in
- Synchronization
- Workflow dependencies
- Workflow composition

Recommended prerequisite:

- [AGT-06.01 — Workflow Patterns, Branches, Loops and Parallelism](./01-Workflow-Patterns-Branches-Loops-and-Parallelism.md)

Related concepts:

- AGT-02 — Agent Runtime, Harness and Execution
- AGT-03 — Tool Definitions, Selection and Execution
- AGT-04 — Agent State, Context and Memory
- AGT-05 — Planning, Decomposition and Adaptation

This chapter does not require knowledge of a specific workflow framework.

---

## Estimated Reading Time

**35–45 minutes**

---

## Before We Start

Consider this workflow:

```text
Start
  │
  ▼
Step A
  │
  ▼
Step B
  │
  ▼
Step C
  │
  ▼
Step D
  │
  ▼
Complete
```

Now imagine the process reaches:

```text
Step A ✓
Step B ✓
Step C → currently executing
Step D
```

and the worker process suddenly crashes.

What happens now?

A naive system might simply start again:

```text
Start → A → B → C → D
```

But that creates an immediate problem.

Steps A and B have already completed.

If they are executed again, the system may:

- repeat expensive work
- duplicate external operations
- overwrite state
- create duplicate records
- send duplicate notifications
- charge an account twice
- produce inconsistent workflow state

The important question is therefore not simply:

> “How do we run the workflow?”

It becomes:

> **“How do we know where the workflow was, what has already completed, and how can we continue safely?”**

That is the problem addressed by this chapter.

---

# Why This Exists

A workflow that exists only inside process memory is vulnerable to process failure.

For example:

```text
Application Process
       │
       ▼
Workflow
       │
       ├── Step A
       ├── Step B
       └── Step C
```

If the process terminates unexpectedly, information about the current execution may disappear unless it has been persisted somewhere durable.

This becomes increasingly important when workflows:

- contain many steps
- perform expensive operations
- interact with external systems
- execute for long periods
- run across multiple workers
- need recovery after failure
- must survive process restarts
- need to resume from previous progress

A durable workflow therefore needs more than control flow.

It needs a representation of:

```text
Where am I?
What has completed?
What remains?
What state is required to continue?
What execution history exists?
Where is a safe recovery point?
```

This introduces the core concepts of:

- workflow state
- state transitions
- execution history
- checkpoints
- persistence
- durable execution
- recovery
- resumption
- replay

---

# Mental Model

A useful mental model is to treat workflow execution as a **state machine whose progress is periodically persisted**.

For example:

```text
                    Workflow State
                          │
                          ▼
                    ┌───────────┐
                    │   Ready   │
                    └─────┬─────┘
                          │
                          ▼
                    ┌───────────┐
                    │ Executing │
                    └─────┬─────┘
                          │
                          ▼
                    ┌───────────┐
                    │ Completed │
                    └─────┬─────┘
                          │
                          ▼
                    Next Step
```

Now add persistence:

```text
Step A
  │
  ▼
Checkpoint 1
  │
  ▼
Step B
  │
  ▼
Checkpoint 2
  │
  ▼
Step C
  │
  ▼
Checkpoint 3
  │
  ▼
Step D
```

If execution fails during Step C:

```text
Step A ✓
Checkpoint 1 ✓
Step B ✓
Checkpoint 2 ✓
Step C ✗
Step D
```

The system can restore the latest valid checkpoint and reason about continuing from there.

```text
Failure
   │
   ▼
Restore Checkpoint 2
   │
   ▼
Determine Completed Work
   │
   ▼
Resume Safely
```

The key mental model is:

> **Durable execution preserves enough workflow information to reconstruct and continue execution after interruption.**

It does **not** mean that every operation is automatically exactly once.

That distinction becomes critical later in the chapter.

---

# Core Concepts

## 1. What Is Workflow State?

Workflow state is the information required to understand the workflow's current execution position and continue execution correctly.

For example:

```text
Workflow:
Order Processing

Current Step:
Payment

Completed:
Validation
Inventory Reservation

Pending:
Payment
Shipment

Status:
Running
```

This is workflow state.

It answers questions such as:

- Which workflow is this?
- Which step is currently active?
- Which steps have completed?
- Which branches are complete?
- Which branches remain?
- What transition should happen next?
- What information is required to continue?

Workflow state is therefore about **execution position and continuity**.

---

# 2. Workflow State vs Agent State

This distinction is important because AGT-04 already covers agent state.

The two concepts can overlap, but they are not identical.

### Agent state

Agent state describes the current condition of an agent execution.

It may include:

- current task
- current context
- active reasoning state
- session information
- tool-related context
- memory-related information

### Workflow state

Workflow state describes the execution position of the workflow.

It may include:

- current workflow step
- completed steps
- pending steps
- active branches
- transition information
- workflow status
- checkpoint information

A useful distinction is:

```text
Agent State
"What is the agent currently like?"

Workflow State
"Where is the workflow in its execution?"
```

For example:

```text
Workflow
   │
   ├── Agent Step
   │      │
   │      └── Agent State
   │
   ├── Tool Step
   │
   └── Verification Step
```

The workflow may need to know that the agent step completed even if the agent's internal state is managed separately.

---

# 3. Workflow State vs Agent Memory

Workflow state should also not be confused with memory.

Agent memory is concerned with retaining information that may be useful across interactions or executions.

Workflow state is concerned with continuing a particular workflow.

For example:

```text
Agent Memory
"User prefers email communication."

Workflow State
"Email notification step is pending."
```

These serve different purposes.

A workflow can persist execution state without becoming a memory system.

Likewise, an agent can have memory without having durable workflow execution.

### Important rule

> **Agent memory answers what information should be retained; workflow state answers what execution position must be preserved.**

AGT-04 owns memory lifecycle and context management.

AGT-06 owns workflow execution state and continuity.

---

# 4. Workflow State Transitions

Workflow execution is not static.

The workflow moves from one state to another.

For example:

```text
Pending
   │
   ▼
Ready
   │
   ▼
Running
   │
   ▼
Completed
```

A step may therefore cause a transition:

```text
Step A
  │
  ▼
A Completed
  │
  ▼
Step B Ready
```

A workflow with branches may have more complex transitions:

```text
                ┌── Branch A Ready
                │
Decision ───────┤
                └── Branch B Ready
```

The transition model should represent the rules that determine how workflow execution progresses.

---

# 5. State Transition Example

Consider:

```text
Validate
   │
   ▼
Eligible?
 /      \
Yes      No
│         │
▼         ▼
Approve  Reject
```

The workflow might transition through:

```text
VALIDATION_PENDING
        │
        ▼
VALIDATION_COMPLETE
        │
        ▼
ELIGIBILITY_CHECK
        │
        ├──────────────┐
        ▼              ▼
ELIGIBLE           INELIGIBLE
        │              │
        ▼              ▼
APPROVAL           REJECTION
```

The exact state names are implementation-specific.

The important concept is that workflow progress can be represented as explicit state transitions.

---

# 6. Why State Transitions Matter

Without explicit state transitions, recovery becomes difficult.

Suppose a system knows only:

```text
Workflow ID = 123
Status = Running
```

That is insufficient.

The system may also need to know:

```text
Current step = Payment
Validation = Complete
Inventory = Complete
Payment = Unknown
Shipment = Not Started
```

The more precise the workflow state, the more precisely the system can determine what needs to happen next.

This is especially important after interruption.

---

# 7. Execution History

Current state alone may not always be sufficient.

A workflow can also maintain execution history.

For example:

```text
Execution History

1. Workflow Started
2. Validation Started
3. Validation Completed
4. Inventory Check Started
5. Inventory Check Completed
6. Payment Started
7. Worker Interrupted
```

This history helps answer:

- What happened?
- In what order?
- Which steps completed?
- Which step was active?
- What information was produced?
- Where did execution stop?

Execution history therefore provides a temporal view of workflow progress.

---

# 8. Current State vs Execution History

These concepts are related but different.

### Current state

```text
Current Step:
Payment
```

### Execution history

```text
Validation Completed
Inventory Completed
Payment Started
```

A useful mental model is:

```text
Execution History
       │
       ▼
Current Workflow State
       │
       ▼
Next Execution Decision
```

History provides evidence of what happened.

State provides the current interpretation of where execution is.

A production system may use one, the other, or both depending on its execution model.

---

# 9. Checkpoints

A checkpoint is a persisted representation of workflow progress and state that can be used as a recovery point.

Consider:

```text
Step A
  │
  ▼
Checkpoint 1
  │
  ▼
Step B
  │
  ▼
Checkpoint 2
  │
  ▼
Step C
```

If Step C fails:

```text
Failure
   │
   ▼
Restore Checkpoint 2
   │
   ▼
Continue from known progress
```

The checkpoint does not necessarily contain every piece of information ever produced.

It should contain enough information to reconstruct the workflow state required for recovery.

### Checkpoint vs Recovery Point

These terms are closely related but useful to distinguish.

A **checkpoint** is the persisted representation of workflow progress.

A **recovery point** is the execution position from which the workflow can safely reconstruct and continue.

In many designs, a checkpoint directly represents a recovery point.

The important requirement is that the persisted checkpoint provides enough information to establish a valid recovery position.

---

# 10. Checkpointing Is Not “Save Everything”

A common misconception is:

> “A checkpoint means saving the entire workflow.”

Not necessarily.

A checkpoint is a **recovery boundary**.

The system needs to determine what information is required to restore a valid execution state.

For example:

```text
Checkpoint
├── Workflow identity
├── Current execution position
├── Completed work
├── Required state
├── Branch status
└── Recovery metadata
```

The exact contents depend on the workflow design.

Saving too much can increase:

- storage cost
- serialization overhead
- checkpoint latency
- recovery complexity

Saving too little can make recovery impossible or unsafe.

---

# 11. Checkpoint Frequency

Suppose a workflow has ten steps.

### Frequent checkpoints

```text
A → CP → B → CP → C → CP → D → CP
```

Recovery can usually restart closer to the interruption point.

But checkpointing adds overhead.

### Infrequent checkpoints

```text
A → B → C → D → CP → E → F → G
```

There are fewer persistence operations.

But a failure during G may require more work to be replayed or reconstructed.

This creates a fundamental trade-off:

```text
More Checkpoints
       │
       ├── Faster Recovery
       ├── Less Replay
       └── More Persistence Overhead

Fewer Checkpoints
       │
       ├── Lower Overhead
       ├── Potentially More Replay
       └── Longer Recovery
```

There is no universally correct checkpoint frequency.

---

# 12. Checkpoint Granularity

Checkpointing can also be considered in terms of granularity.

Suppose:

```text
Step A
```

contains ten internal operations.

A coarse checkpoint might occur only after the entire step.

```text
[ AAAAAAAAAA ] → Checkpoint
```

A finer-grained model might preserve progress within the larger operation.

```text
A1 → CP → A2 → CP → A3
```

Fine-grained checkpoints can reduce recovery work.

But they also increase:

- persistence overhead
- state management complexity
- storage requirements
- coordination cost

Therefore:

> **Checkpoint granularity should match meaningful recovery boundaries.**

---

# 13. Durable Execution

Durable execution means workflow progress is persisted in a way that allows execution to survive process or worker interruption and continue later.

Consider:

```text
Workflow
   │
   ▼
Worker
   │
   ▼
Process Failure
```

Without durable execution:

```text
Workflow Progress
      ✗
May be lost with process memory
```

With durable execution:

```text
Workflow
   │
   ▼
Persisted Execution State
   │
   ▼
Worker Failure
   │
   ▼
New Worker
   │
   ▼
Restore State
   │
   ▼
Continue
```

The central property is continuity across execution interruption.

---

# 14. What Durable Execution Does Not Mean

Durable execution does **not** automatically guarantee:

- exactly-once execution
- exactly-once external side effects
- automatic rollback
- perfect recovery
- safe retries
- idempotency
- transactional consistency across external systems

This distinction is critical.

For example:

```text
Persist State
     │
     ▼
Execute Payment
     │
     ▼
Worker Crashes
```

The persisted state may still say:

```text
Payment = Pending
```

even though the external payment system successfully processed the payment.

If recovery simply executes the payment again:

```text
Payment
   ↓
Payment Again
```

a duplicate charge could occur.

Therefore:

> **Durability preserves workflow continuity; it does not magically make external side effects exactly once.**

---

# 15. Recovery After Interruption

Consider:

```text
Step A
  │
  ▼
Checkpoint 1
  │
  ▼
Step B
  │
  ▼
Checkpoint 2
  │
  ▼
Step C
  │
  X
Failure
```

Recovery begins by restoring the latest valid checkpoint:

```text
Failure
   │
   ▼
Checkpoint 2
```

The system then needs to determine:

1. What had definitely completed?
2. What state was persisted?
3. Which step was executing?
4. Which work remains?
5. Which operations can safely be repeated?
6. Which operations may have produced external side effects?
7. Where can execution continue?

The recovery problem is therefore not merely:

> “Restart the workflow.”

It is:

> **“Reconstruct a valid execution position and continue without violating workflow correctness.”**

---

# 16. Restart vs Resume

These terms should not be treated as identical.

### Restart

Start the workflow again from the beginning.

```text
Start
  ↓
A
  ↓
B
  ↓
C
```

### Resume

Continue from previously established progress.

```text
A ✓
B ✓
C → Resume
```

Resume can reduce unnecessary work.

But resume is only safe if the system can correctly establish:

- what completed
- what state was persisted
- what remains
- what can be repeated
- what must not be repeated

---

# 17. Replay

Replay is an execution-model-dependent mechanism used to reconstruct workflow state or execution from previously persisted information.

There are two related but distinct ideas.

### History or event replay

The system reprocesses recorded workflow events or execution history to reconstruct the state that should exist at a particular point.

```text
Event A
   ↓
Event B
   ↓
Event C
   ↓
Reconstructed State
```

The system is not necessarily performing the original external operations again.

It is rebuilding state from recorded execution information.

### Step re-execution

The system actually executes workflow steps again from a known point.

```text
Checkpoint
   │
   ▼
Re-execute Step B
   │
   ▼
Re-execute Step C
   │
   ▼
Continue Step D
```

This may be necessary in some execution models, but it can repeat side effects.

Therefore:

> **Replay should not automatically be understood as “run every previous step again.”**

The exact meaning depends on the workflow execution model.

---

# 18. Replay-Safe vs Side-Effecting Steps

Consider two operations.

### Pure computation

```text
Input
  │
  ▼
Calculate Tax
  │
  ▼
Output
```

Re-executing this operation may be harmless if the computation is deterministic.

### External side effect

```text
Create Payment
```

Re-executing this operation may create a duplicate payment.

This gives us a useful distinction:

```text
Replay-Friendly
├── deterministic computation
├── transformations
└── read-only operations

Replay-Sensitive
├── create record
├── charge account
├── send message
└── trigger external action
```

Not every step has the same recovery properties.

---

# 19. Execution Attempt Semantics

Workflow recovery often raises questions about how many times a step may be attempted.

Three common conceptual models are:

### At-most-once attempt

A step is attempted no more than once.

The benefit is reduced duplicate execution.

The risk is that the operation may not complete if execution fails at an unfortunate point.

### At-least-once attempt

A step may be attempted multiple times until the workflow establishes successful completion.

The benefit is stronger completion behavior.

The risk is that repeated attempts may produce duplicate side effects.

### Exactly-once attempt

The conceptual goal is:

```text
The workflow step is attempted exactly once.
```

However, even if a workflow runtime provides a particular execution-attempt guarantee, that does not automatically mean an external business effect occurred exactly once.

For example:

```text
Workflow
   │
   ▼
Send Payment Request
   │
   ▼
External System
   │
   ├── Operation succeeds
   │
   ▼
Response
   │
   X
Worker crashes
```

The external system may have processed the request even though the workflow did not record the result.

Therefore:

> **Execution-attempt semantics and external side-effect semantics are separate concerns.**

This distinction is essential when discussing exactly-once behavior.

---

# 20. Idempotency at Workflow Boundaries

An operation is idempotent when repeating the same logical operation produces the same intended externally observable result as performing it once.

For example:

```text
Set Account Status = Active
```

may be naturally idempotent.

Repeated execution still results in:

```text
Account Status = Active
```

By contrast:

```text
Charge Account ₹1,000
```

is not naturally idempotent.

Repeated execution may produce:

```text
₹1,000 charged
₹1,000 charged again
```

Workflow recovery therefore needs to reason about side-effecting boundaries.

A common conceptual pattern is:

```text
Workflow Operation
      │
      ▼
Operation ID
      │
      ▼
External System
      │
      ▼
Record Result
```

If the same logical operation is replayed with the same operation identifier, the receiving system may be able to recognize the duplicate and return the existing result rather than applying the operation again.

The exact mechanism depends on the external system.

The important engineering principle is:

> **Recovery must account for the possibility that an operation completed externally even when the workflow did not persist that completion.**

---

# 21. The Ambiguous Completion Problem

One of the hardest recovery cases occurs when the system cannot determine whether an external operation completed.

Consider:

```text
Workflow
   │
   ▼
Send Request
   │
   ▼
External System
   │
   ├── Operation succeeds
   │
   ▼
Response
   │
   X
Worker crashes before recording result
```

The workflow may now see:

```text
Operation = Unknown
```

It cannot safely assume:

```text
Not completed
```

It also cannot safely assume:

```text
Completed
```

This is an **ambiguous completion** state.

Recovery may require:

- querying the external system
- using an operation identifier
- checking a durable result record
- using idempotent semantics
- applying a domain-specific reconciliation strategy

This is a key production insight:

> **The workflow's persisted state and the external system's actual state can temporarily disagree.**

---

# 22. Checkpoint Recovery Example

Consider:

```text
Step A
  │
  ▼
Checkpoint 1
  │
  ▼
Step B
  │
  ▼
Checkpoint 2
  │
  ▼
Step C
  │
  ▼
Step D
```

Suppose the worker fails during Step C.

The persisted state indicates:

```text
A = Completed
B = Completed
C = In Progress / Unknown
D = Not Started
```

Recovery should not blindly execute:

```text
A → B → C → D
```

Instead, it should reason from the recovery point:

```text
Restore Checkpoint 2
       │
       ▼
Inspect Step C
       │
       ├── Definitely not executed
       │
       ├── Definitely completed
       │
       └── Completion unknown
```

Different outcomes require different recovery behavior.

This is why durable execution is fundamentally a state-management problem.

---

# 23. Deterministic Recovery Points

A recovery point should represent a state from which the workflow can reason consistently about continuation.

For example:

```text
Step A
   │
   ▼
Checkpoint
   │
   ▼
Step B
```

If the checkpoint clearly represents:

```text
A = completed
Next = B
```

recovery is easier.

Poorly defined checkpoints can create ambiguity:

```text
A = maybe completed
B = maybe started
Next = unknown
```

The more ambiguous the recovery boundary, the harder safe continuation becomes.

Therefore:

> **Good checkpoint design reduces uncertainty during recovery.**

---

# 24. Workflow Consistency

A workflow should maintain a coherent relationship between:

- persisted state
- execution history
- step completion
- transition rules
- external effects

Consider:

```text
Persisted State:
Payment = Completed

External System:
Payment = Failed
```

The workflow now contains inconsistent information.

Recovery cannot simply trust one representation without considering the system's consistency model.

This does not mean every workflow requires distributed transactions.

It means the workflow designer must understand:

> **What information is authoritative, when it becomes authoritative, and how discrepancies are resolved.**

---

# 25. Execution Lineage

Execution lineage describes how the current workflow state relates to the execution history that produced it.

For example:

```text
Workflow Instance
       │
       ▼
Execution 1
       │
       ├── Step A
       ├── Step B
       └── Checkpoint 1
              │
              ▼
          Execution 2
              │
              ├── Step C
              └── Step D
```

Lineage helps answer:

- Which execution produced this state?
- Which checkpoint was restored?
- Which steps were replayed?
- Which version of the workflow was executing?
- Where did recovery occur?

Lineage becomes particularly valuable when debugging production workflows.

---

# Internal Working

The exact implementation differs between systems, but a durable workflow generally involves several conceptual components.

```text
              Workflow Definition
                      │
                      ▼
                Workflow Runtime
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
       Execute     Persist      Record
        Steps       State       History
          │           │           │
          └───────────┼───────────┘
                      ▼
              Recovery Information
```

---

## 1. Start Workflow

A workflow instance begins.

```text
Workflow ID = 123
State = Ready
```

The system establishes the identity of the workflow instance.

---

## 2. Execute Step

The workflow executes an eligible step.

```text
Step A
   │
   ▼
Result
```

The result may affect subsequent workflow state.

---

## 3. Apply State Transition

After Step A:

```text
Step A Completed
       │
       ▼
Workflow State Updated
       │
       ▼
Step B Ready
```

The workflow moves to a new state.

---

## 4. Persist Recovery Information

The system persists sufficient information to reconstruct the required workflow state.

```text
Workflow State
      │
      ▼
Persist
      │
      ▼
Checkpoint
```

This creates a recovery boundary.

---

## 5. Continue Execution

The workflow continues:

```text
Checkpoint
    │
    ▼
Step B
    │
    ▼
Checkpoint
    │
    ▼
Step C
```

---

## 6. Handle Interruption

Suppose the worker fails during Step C.

```text
Step C
  │
  X
Worker Failure
```

A new execution environment can identify the workflow instance and restore persisted information.

```text
Workflow ID
     │
     ▼
Persisted State
     │
     ▼
Restore
     │
     ▼
Determine Recovery Position
```

---

## 7. Resume or Recover

The workflow then determines what execution is safe.

```text
Recovery
   │
   ▼
What completed?
   │
   ▼
What remains?
   │
   ▼
What can be replayed?
   │
   ▼
What side effects must be protected?
   │
   ▼
Continue
```

The important point is that recovery is not simply:

```text
Restart Process
```

It is:

```text
Restore Workflow State
        +
Reason About Execution History
        +
Continue Safely
```

---

# Practical Example: Order Processing

Consider:

```text
Start
  │
  ▼
Validate Order
  │
  ▼
Reserve Inventory
  │
  ▼
Charge Payment
  │
  ▼
Create Shipment
  │
  ▼
Complete
```

Suppose the workflow checkpoints after inventory reservation:

```text
Validate Order
      │
      ▼
Checkpoint 1
      │
      ▼
Reserve Inventory
      │
      ▼
Checkpoint 2
      │
      ▼
Charge Payment
      │
      ▼
Create Shipment
```

Now suppose the worker crashes during payment.

The recovery system restores:

```text
Checkpoint 2
```

and determines:

```text
Validation = Complete
Inventory = Reserved
Payment = Unknown
Shipment = Not Started
```

The important problem is payment.

The system must determine whether:

```text
Payment = Not Executed
```

or:

```text
Payment = Executed but Result Not Persisted
```

A safe recovery design should therefore avoid blindly charging again.

Conceptually:

```text
Payment Operation
       │
       ▼
Operation ID
       │
       ▼
Payment System
       │
       ├── Existing Result
       │
       └── New Operation
```

If the payment system supports idempotent operation identifiers, recovery can safely retry the same logical operation.

The workflow can then continue:

```text
Payment Confirmed
      │
      ▼
Create Shipment
      │
      ▼
Complete
```

This example demonstrates why:

```text
Checkpointing
     +
Durable State
     +
Side-Effect Control
```

must be considered together.

---

# Practical Example: Recovery from a Five-Step Workflow

Consider:

```text
A → B → C → D → E
```

Checkpoints are created after B and D:

```text
A → B → CP1 → C → D → CP2 → E
```

Suppose failure occurs during E.

The recovery process can be:

```text
Failure
   │
   ▼
Restore CP2
   │
   ▼
A ✓
B ✓
C ✓
D ✓
E ?
   │
   ▼
Resume E
```

This is better than restarting from A because completed work does not necessarily need to be repeated.

But the safety of resuming E depends on E's execution semantics.

If E is:

```text
Calculate Final Score
```

re-execution may be straightforward.

If E is:

```text
Send External Payment
```

the recovery design must consider duplicate side effects.

---

# Practical Example: Parallel Workflow Recovery

Consider:

```text
                ┌── Step B ──┐
Step A ─────────┼── Step C ──┼── Step E
                └── Step D ──┘
```

Suppose:

```text
A = Complete
B = Complete
C = Complete
D = Failed
E = Not Started
```

A checkpoint might represent:

```text
A = Complete
B = Complete
C = Complete
D = Pending/Failed
E = Blocked
```

Recovery does not necessarily require repeating B and C.

The workflow can reason about branch-level completion:

```text
B ✓
C ✓
D ?
E blocked
```

and continue with the unresolved branch.

This demonstrates why workflow state must represent more than a single linear “current step” when the workflow contains parallel execution.

---

# Production Perspective

Durable execution introduces several production concerns.

## 1. Persistence Reliability

If workflow state is persisted to an unreliable location, the workflow is not truly durable.

The persistence mechanism becomes part of the workflow's reliability boundary.

---

## 2. State Serialization

Workflow state must often be serialized.

The system must consider:

- data format
- schema evolution
- compatibility
- size
- sensitive data
- serialization failures

A workflow should not assume that arbitrary in-memory objects can always be safely persisted and restored.

---

## 3. Checkpoint Overhead

Every checkpoint can introduce:

- serialization work
- storage operations
- latency
- storage cost

Too many checkpoints may reduce execution efficiency.

Too few may increase recovery work.

---

## 4. Recovery Time

Recovery time depends on factors such as:

- checkpoint frequency
- checkpoint size
- replay requirements
- dependency reconstruction
- external reconciliation
- number of unfinished steps

A useful engineering objective is:

> **Make recovery predictable enough for the workflow's operational requirements.**

---

## 5. Duplicate Side Effects

This is one of the most important production concerns.

A workflow can recover successfully while still producing incorrect business outcomes.

For example:

```text
Workflow
   │
   ▼
Charge Customer
   │
   ▼
Success
   │
   X
Crash before state persistence
```

Recovery may execute:

```text
Charge Customer
```

again.

The workflow did not necessarily “fail to recover.”

It recovered according to its persisted state.

The problem is that the external side effect was not safely replayable.

This distinction is critical.

---

## 6. Workflow State and External State

A durable workflow may interact with multiple external systems:

```text
Workflow
   │
   ├── Database
   ├── Payment Service
   ├── Inventory Service
   └── Notification Service
```

The workflow's persisted state may not change atomically with all those systems.

Therefore, distributed workflows must reason about:

- operation ordering
- external acknowledgments
- idempotency
- reconciliation
- ambiguous completion
- consistency boundaries

AGT-06 does not prescribe one universal solution.

The correct mechanism depends on the business operation and external system.

---

# Engineering Decisions and Trade-offs

## 1. Frequent vs Infrequent Checkpoints

| Frequent | Infrequent |
|---|---|
| Faster recovery | Lower persistence overhead |
| Less replay | Potentially more replay |
| More storage operations | Fewer storage operations |
| More checkpoint complexity | Larger recovery intervals |

The right choice depends on:

- step cost
- failure probability
- recovery requirements
- state size
- persistence cost

---

## 2. Fine-Grained vs Coarse-Grained Steps

| Fine-Grained | Coarse-Grained |
|---|---|
| Precise recovery boundaries | Simpler workflow |
| More execution visibility | Less orchestration overhead |
| More state management | Larger recovery units |
| Potentially more checkpoints | Potentially more replay |

Step boundaries should represent meaningful execution units.

---

## 3. Replay vs Checkpoint Resume

### Replay

Reconstruct execution state by processing persisted execution information or, depending on the execution model, by re-executing eligible workflow steps.

Advantages:

- can reduce the need to persist every piece of derived state
- can reconstruct execution state from history

Risks:

- replay cost
- nondeterministic behavior
- duplicate side effects when steps are re-executed

### Checkpoint resume

Restore a persisted recovery point.

Advantages:

- faster recovery
- less replay

Costs:

- persistence overhead
- checkpoint storage
- state serialization complexity

Many practical systems combine both approaches.

---

## 4. Stateful vs Stateless Execution

### Stateless execution

The worker does not retain important workflow progress only in local process memory.

Advantages:

- easier worker replacement
- simpler horizontal scaling
- less dependence on a specific process

### Stateful execution

Important execution state may remain within the active execution environment.

Advantages:

- potentially simpler local execution
- lower persistence overhead during active execution

Risk:

- process failure can lose important progress unless state is persisted elsewhere

Durable workflow execution generally requires workflow-critical state to survive beyond a single process's lifetime.

---

## 5. Persist More vs Persist Less

Persisting more information can make recovery easier.

But it can increase:

- storage cost
- serialization cost
- privacy/security concerns
- state management complexity

Persisting less reduces overhead.

But recovery may require:

- recomputation
- replay
- external queries
- additional reconciliation

The correct persistence boundary is therefore an engineering decision.

---

## Common Mistakes and Misconceptions

## 1. “A checkpoint guarantees exactly-once execution.”

No.

A checkpoint records workflow progress.

It does not guarantee that an external side effect occurred exactly once.

---

## 2. “Durable execution means idempotency is no longer necessary.”

No.

Durable execution can restore workflow state.

A recovered workflow may still repeat an operation.

If that operation has side effects, idempotency or another duplicate-control mechanism may be required.

---

## 3. “If the workflow says a step is pending, the step definitely never executed.”

Not necessarily.

The workflow state may be stale because the process failed before recording the external result.

The operation may have completed even though the workflow did not persist that fact.

---

## 4. “Recovery means restart from the beginning.”

Not necessarily.

A durable workflow may restore a checkpoint and continue from a known recovery point.

---

## 5. “Checkpointing means saving everything.”

No.

A checkpoint should preserve the information required to reconstruct a valid recovery state.

---

## 6. “More checkpoints are always better.”

No.

More checkpoints can reduce recovery work but increase persistence overhead.

---

## 7. “Replay is always safe.”

No.

Replay may mean reconstructing state from history, which may not repeat external operations.

However, when the execution model re-executes workflow steps, side effects may occur again.

The safety of replay therefore depends on what the replay mechanism actually does and the semantics of the operations involved.

---

## 8. “Workflow state is the same as agent memory.”

No.

Workflow state tracks execution position and continuity.

Agent memory manages retained information for the agent.

---

## 9. “The workflow database and external systems always agree.”

No.

A workflow may persist its state separately from an external system.

A crash can occur between an external side effect and recording its result.

---

## 10. “A failed workflow must always return to the last step.”

Not necessarily.

Recovery should use the available workflow state, execution history, checkpoint information, and side-effect semantics to determine the appropriate continuation point.

---

## Interview Questions with Expected Answers

## Foundational

### 1. What is workflow state?

**Expected answer:**

Workflow state is the information required to understand the workflow's current execution position, completed work, pending work, and the information needed to continue execution correctly.

---

### 2. What is a checkpoint?

**Expected answer:**

A checkpoint is a persisted representation of workflow progress and state that can serve as a recovery point from which the workflow can reconstruct and continue execution.

---

### 3. What is durable execution?

**Expected answer:**

Durable execution is an execution model in which workflow progress is persisted so the workflow can survive process or worker interruption and continue later.

---

### 4. Why is execution history useful?

**Expected answer:**

It provides evidence of what happened, in what order, and which execution steps completed or were active, helping recovery and debugging.

---

## Conceptual

### 5. What is the difference between workflow state and agent memory?

**Expected answer:**

Workflow state tracks execution position and continuity of a workflow. Agent memory manages information retained for future agent use. They may overlap but serve different purposes.

---

### 6. Why does checkpointing not guarantee exactly-once execution?

**Expected answer:**

A crash can occur after an external side effect succeeds but before the workflow records the completion. Recovery may then repeat the operation, causing a duplicate side effect.

---

### 7. What is the difference between history replay and step re-execution?

**Expected answer:**

History replay reconstructs workflow state by processing previously recorded execution information. Step re-execution actually runs workflow steps again. Step re-execution can repeat external side effects, while history replay does not necessarily do so.

---

### 8. Why is idempotency important during recovery?

**Expected answer:**

Recovery may repeat an operation. Idempotency helps ensure that repeating the same logical operation produces the same intended external result rather than an unintended additional effect.

---

## Scenario

### 9. A workflow has completed three of five steps and then the worker crashes. What should recovery do?

**Expected answer:**

Restore the latest valid checkpoint, determine which work is definitely complete, identify the remaining work, and safely continue without unnecessarily repeating completed or unsafe side-effecting operations.

---

### 10. A payment request succeeds, but the worker crashes before recording the result. What is the problem?

**Expected answer:**

The workflow has ambiguous completion. It cannot safely assume the payment failed, so blindly retrying could charge the customer twice. Recovery may need an idempotency key, external status query, or reconciliation mechanism.

---

### 11. A workflow contains three parallel branches. Two completed before failure and one did not. Should all three restart?

**Expected answer:**

Not necessarily. The workflow should restore the relevant checkpoint and determine branch-level completion. Completed branches should not be repeated unless the recovery semantics require it.

---

## Debugging

### 12. A recovered workflow repeatedly creates duplicate records. What would you investigate?

**Expected answer:**

Check whether recovery re-executes completed side-effecting steps, whether completion was persisted after the side effect, and whether the operation has idempotency or deduplication protection.

---

### 13. A workflow always restarts from the beginning after process failure. What might be missing?

**Expected answer:**

Durable workflow state or checkpoints that allow the system to restore a known execution position.

---

### 14. A workflow resumes from the wrong step after recovery. What would you investigate?

**Expected answer:**

Inspect checkpoint correctness, state-transition logic, execution history, checkpoint timing, and whether persisted state accurately represented the completed work.

---

## Architecture

### 15. How would you design checkpoints for a long multi-step workflow?

**Expected answer:**

Choose meaningful recovery boundaries based on step cost, failure risk, state size, persistence overhead, and recovery requirements. Checkpoints should contain sufficient state to reconstruct a valid continuation point.

---

### 16. What information should a workflow checkpoint contain?

**Expected answer:**

At minimum, enough information to identify the workflow instance, establish the execution position, represent completed/pending work, restore required workflow state, and determine safe continuation.

---

### 17. Why can workflow state and external system state become inconsistent?

**Expected answer:**

A failure can occur between an external side effect and persistence of the corresponding workflow state, leaving the external system updated while the workflow still shows the operation as pending or unknown.

---

## Engineering Judgment

### 18. When would you prefer more frequent checkpoints?

**Expected answer:**

When recovery cost is high, steps are expensive, failures are costly, or recovery latency requirements justify the additional persistence overhead.

---

### 19. When might fewer checkpoints be preferable?

**Expected answer:**

When persistence overhead is significant, steps are cheap to replay, state is expensive to store, or recovery requirements do not justify frequent checkpoints.

---

### 20. Is durable execution always worth the complexity?

**Expected answer:**

No. It is most valuable when workflows are long-running, failure-sensitive, expensive to restart, externally stateful, or required to survive process and worker interruption. Simple short-lived workflows may not need it.

---

### 21. Why is exactly-once external side-effect behavior difficult across independent systems?

**Expected answer:**

Because the workflow and external system may not share one atomic transaction boundary. A crash can occur between the external operation and recording its result, making the operation's completion ambiguous.

---

## Quick Revision

### Workflow State

Tracks:

```text
Where is the workflow?
What completed?
What remains?
What should happen next?
```

### State Transition

```text
Current State
      ↓
Event / Step Result
      ↓
Next State
```

### Execution History

Records:

```text
What happened?
When?
In what order?
```

### Checkpoint

A persisted representation of workflow progress and state that can serve as a recovery point.

```text
A → B → CP → C → D
```

### Recovery

```text
Failure
   ↓
Restore Checkpoint
   ↓
Determine Completed Work
   ↓
Identify Remaining Work
   ↓
Continue Safely
```

### Durable Execution

Allows workflow progress to survive:

- process failure
- worker failure
- application restart
- execution interruption

### Replay

Replay may mean:

- processing persisted history to reconstruct state
- or, depending on the execution model, re-executing workflow steps

These mechanisms have different side-effect implications.

### Idempotency

Repeating the same logical operation produces the same intended externally observable result as performing it once.

### Critical Distinction

```text
Checkpointing
      ≠
Exactly-Once External Side Effects
```

### Workflow State vs Memory

```text
Workflow State
"Where is execution?"

Agent Memory
"What information should be retained?"
```

### Ambiguous Completion

```text
External Operation
       ↓
Succeeded
       ↓
Worker Crashes
       ↓
Result Not Persisted
       ↓
Workflow sees "Unknown"
```

Recovery must not blindly assume success or failure.

---

# Key Takeaways

1. Workflow state represents the execution position and continuity information required to continue a workflow.
2. Workflow state is different from agent state and agent memory.
3. State transitions describe how workflow execution moves from one state to another.
4. Execution history provides evidence of what happened during workflow execution.
5. A checkpoint is a persisted representation of workflow progress and state that can serve as a recovery point.
6. A recovery point is the position from which the workflow can safely reconstruct and continue.
7. Checkpoints should preserve enough information to reconstruct a valid continuation state.
8. More frequent checkpoints can improve recovery speed but increase persistence overhead.
9. Durable execution allows workflow progress to survive process or worker interruption.
10. Durable execution does not automatically provide exactly-once execution or exactly-once external side effects.
11. A workflow may repeat an operation during recovery.
12. Repeated side-effecting operations can create duplicate business effects.
13. Idempotency and deduplication can protect important external operation boundaries.
14. External systems and workflow state can become temporarily inconsistent.
15. Ambiguous completion is a critical recovery problem.
16. Recovery is more than restarting a process; it requires reconstructing execution position and determining safe continuation.
17. History replay and step re-execution are related but distinct mechanisms.
18. Replay can reduce reconstruction cost but can be dangerous when the execution model re-executes side-effecting operations.
19. Checkpoint design should consider recovery speed, storage cost, serialization, replay, and state consistency.
20. Workflow state must remain clearly separated from agent memory.
21. Durable workflow design is fundamentally about preserving enough execution information to continue correctly after interruption.
22. AGT-06.02 establishes the foundation for the next problem: **how workflows continue across long waits, asynchronous events, interruptions, cancellation, and partial completion.**

---

## Further Reading

Continue to:

- [AGT-06.03 — Async, Long-Running Execution, Continuity and Compensation](./03-Async-Long-Running-Execution-Continuity-and-Compensation.md)

Related concepts:

- AGT-02 — Agent Runtime, Harness and Execution
- AGT-03 — Tool Definitions, Contracts and Execution
- AGT-04 — Agent State, Context and Memory
- AGT-05 — Planning, Decomposition and Adaptation

The next chapter extends durable execution into workflows that cannot remain continuously active:

> **How does a workflow remain logically alive when it must wait for hours, days, external events, or human/external dependencies before continuing?**

---

## End of Document
