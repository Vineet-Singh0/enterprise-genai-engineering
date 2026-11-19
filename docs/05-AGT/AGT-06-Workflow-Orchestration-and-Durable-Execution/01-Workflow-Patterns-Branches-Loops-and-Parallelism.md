# AGT-06.01 — Workflow Patterns, Branches, Loops and Parallelism

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain what a workflow is and why workflow orchestration is useful.
- Distinguish a workflow from simple sequential execution.
- Model sequential workflow execution.
- Explain conditional branching and convergence.
- Model loops and iterative execution.
- Explain parallel execution and why it is useful.
- Distinguish fan-out, fan-in, and synchronization.
- Identify dependencies between workflow steps.
- Compose smaller workflow structures into larger workflows.
- Distinguish deterministic workflow structure from dynamically selected execution paths.
- Recognize common workflow patterns.
- Evaluate the trade-offs between sequential and parallel execution.
- Reason about workflow complexity before choosing an orchestration approach.
- Explain how workflow structure relates to agent planning without confusing the two.

---

## Prerequisites

Before reading this chapter, you should be comfortable with:

- Basic programming control flow
- Functions and function calls
- Conditional statements
- Loops
- Basic concurrency concepts
- Agent runtime concepts
- Tool execution concepts
- Agent planning at a high level

Recommended prerequisite chapters:

- AGT-02 — Agent Runtime, Harness and Execution
- AGT-03 — Tool Definitions, Selection and Execution
- AGT-04 — Agent State, Context and Memory
- AGT-05 — Planning, Decomposition and Adaptation

You do not need to know a specific workflow framework.

---

## Estimated Reading Time

**30–40 minutes**

---

## Before We Start

Consider this workflow:

```text
Receive Application
       │
       ▼
Validate Application
       │
       ▼
Check Eligibility
       │
       ▼
   Eligible?
    /     \
  Yes      No
   │        │
   ▼        ▼
Approve    Reject
```

At first glance, this looks like ordinary program control flow.

That is not wrong.

A workflow does use familiar programming concepts such as:

- sequence
- conditions
- loops
- parallel execution

The difference is that a workflow treats these structures as **explicit execution units with relationships and dependencies**.

This becomes important when a process contains many steps, multiple branches, concurrent work, external dependencies, or execution that must later be persisted and resumed.

AGT-06 begins with the structure of execution.

Later files address what happens when that execution must survive interruption or continue across long periods.

---

# Why This Exists

Agent systems often perform more than one operation.

For example, an agent handling a customer request might need to:

1. Understand the request.
2. Retrieve relevant information.
3. Check account information.
4. Perform an action.
5. Verify the result.
6. Notify the user.

A simple implementation might execute these operations one after another.

But real workflows quickly become more complicated.

Some steps may depend on earlier results.

Some steps may be optional.

Some steps may need to repeat.

Some independent steps may be able to execute at the same time.

Some branches may need to finish before the workflow can continue.

A useful abstraction is therefore:

```text
Workflow
    =
Structured execution of multiple related steps
    +
Relationships between those steps
    +
Rules describing how execution moves between them
```

The important word is **structured**.

A workflow is not merely a collection of operations.

It defines how execution moves through those operations.

---

# Mental Model

A useful mental model is to think of a workflow as an **execution graph**.

Each node represents work.

Each connection represents an execution relationship.

For example:

```text
A → B → C
```

means:

```text
Execute A
   ↓
then B
   ↓
then C
```

A branch:

```text
       ┌── B ──┐
A ─────┤       ├── D
       └── C ──┘
```

means that after A, execution can follow different paths.

Parallel work:

```text
       ┌── B ──┐
A ─────┼── C ──┼── D
       └── E ──┘
```

means that B, C, and E may execute independently before D proceeds, depending on their dependencies and synchronization requirements.

This gives us a useful model:

```text
        Workflow
           │
           ▼
   ┌───────────────┐
   │ Execution      │
   │ Structure      │
   └───────┬───────┘
           │
     ┌─────┼─────┐
     ▼     ▼     ▼
 Sequence Branch Loop
           │
           ▼
       Parallel
           │
           ▼
    Synchronization
```

The workflow structure answers:

> **What execution paths exist, and what relationships determine when each step can run?**

It does not answer:

> **What is the best plan for achieving the user's goal?**

That distinction belongs to AGT-05.

---

# Core Concepts

## 1. What Is a Workflow?

A workflow is a structured sequence or graph of execution steps connected by control-flow and dependency relationships.

A workflow can contain:

- ordered steps
- decisions
- branches
- loops
- parallel work
- synchronization points
- dependencies
- completion conditions

A simple workflow can be represented as:

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
End
```

A more complex workflow might look like:

```text
                 ┌── Step B ──┐
                 │             │
Start → Step A ──┤── Step C ──┼── Step F → End
                 │             │
                 └── Step D ──┘
```

The second structure expresses relationships that a simple linear list cannot represent clearly.

---

## 2. Workflow vs Simple Sequential Execution

A sequence is the simplest possible workflow structure.

```text
A → B → C → D
```

But not every sequence needs a sophisticated workflow abstraction.

If a program simply needs:

```python
result = step_a()
result = step_b(result)
result = step_c(result)
```

ordinary program control flow may be enough.

A workflow abstraction becomes more useful when the system needs to reason explicitly about:

- multiple execution paths
- dependencies
- repeated execution
- parallel work
- synchronization
- workflow-level state
- execution coordination

The distinction is therefore not:

> “A workflow is complicated code.”

A better distinction is:

> **A workflow makes execution structure explicit enough for the system to coordinate and manage it.**

---

## 3. Workflow Steps

A workflow is composed of steps.

A step represents a unit of work that the workflow can execute and reason about.

Examples include:

- validate an input
- retrieve information
- call a service
- perform a calculation
- check a condition
- update a record
- request human input
- wait for another event

The exact implementation of a step is not the focus of this chapter.

A step might internally:

- execute application code
- invoke a tool
- call an external service
- invoke an agent
- perform a database operation

AGT-03 owns the design and execution semantics of tools.

AGT-06 owns how such steps are positioned and coordinated within the workflow.

---

## 4. Sequential Workflows

The simplest workflow pattern is sequential execution.

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
End
```

Each step depends on the previous step completing.

### Example

Consider an application-processing workflow:

```text
Receive Application
        │
        ▼
Validate Application
        │
        ▼
Check Eligibility
        │
        ▼
Create Decision
```

The workflow has a clear order.

The sequence is useful when:

- later work depends on earlier results
- ordering is important
- simplicity is valuable
- parallel execution would provide little benefit

### Engineering intuition

Sequential execution gives you a simple mental model:

> **Do this, then that, then the next thing.**

The main advantage is simplicity.

The main limitation is that independent work may unnecessarily wait for other work.

---

# 5. Branching

A workflow often needs to make a decision.

For example:

```text
Validate Application
        │
        ▼
   Eligible?
    /     \
  Yes      No
   │        │
   ▼        ▼
Approve    Reject
```

This is conditional branching.

The workflow follows one path based on a condition or decision.

### Why branching exists

Real processes rarely follow exactly one path.

Examples:

- eligible vs ineligible
- payment successful vs failed
- user verified vs unverified
- data available vs unavailable
- request approved vs rejected

A workflow therefore needs to represent alternative execution paths.

---

## 6. Branch Conditions

A branch normally has a condition that determines which path is selected.

Conceptually:

```text
if condition:
    execute path A
else:
    execute path B
```

The workflow representation makes the control-flow relationship explicit.

For example:

```text
                 ┌── Approve ──┐
Check Eligibility               ├── Notify
                 └── Reject ───┘
```

The important question is not only:

> What condition is evaluated?

It is also:

> What execution paths are possible after the condition?

That makes branch structure part of workflow design.

---

## 7. Branch Convergence

Branches often eventually converge.

For example:

```text
             ┌── Approve ──┐
Check ───────┤              ├── Notify
             └── Reject ────┘
```

Both branches eventually reach `Notify`.

This is useful because the workflow can represent:

```text
One decision
    ↓
Multiple possible paths
    ↓
Shared continuation
```

The convergence point is different from parallel synchronization.

With branching, typically **one path is selected**.

With parallel execution, **multiple paths may execute**.

This distinction is important.

---

# 8. Loops and Iteration

Some workflows need to repeat work.

For example:

```text
Process Item
     │
     ▼
More Items?
   /     \
 Yes      No
  │        │
  └────────┘
     │
     ▼
  Process
  Next Item
```

A loop represents repeated execution.

### Common workflow loop patterns

#### Collection iteration

```text
For each customer:
    validate customer
```

#### Condition-controlled iteration

```text
Process Item
     │
     ▼
More Items?
   /     \
 Yes      No
  │        │
  ▼        ▼
Next Item End
```

The second example shows that iteration can be controlled by a runtime condition.

A workflow loop should make its continuation and termination behavior understandable.

---

## 9. Loop Termination

A loop must have a termination condition.

For example:

```text
Process Item
    │
    ▼
More Items?
  │     │
 Yes    No
  │      │
  └──────┘
         ▼
        End
```

A workflow designer should be able to answer:

- What causes the loop to continue?
- What causes it to stop?
- Can the condition remain true indefinitely?
- What happens when the expected input is exhausted?
- Is there a maximum iteration boundary?

An unbounded loop is not automatically wrong.

But it must be intentional.

---

# 10. Parallel Execution

Some workflow steps are independent.

Consider:

```text
Start
  │
  ├── Check Credit
  │
  ├── Verify Identity
  │
  └── Check History
```

If these operations do not depend on one another, executing them sequentially may unnecessarily increase total execution time.

They may instead execute in parallel.

Conceptually:

```text
             ┌── Check Credit ───┐
             │                   │
Start ───────┼── Verify Identity ┼──► Continue
             │                   │
             └── Check History ──┘
```

The important condition is:

> **Parallelism is possible when the required dependencies allow independent execution.**

Parallelism is therefore not simply “run everything at once.”

It is a consequence of dependency analysis.

---

# 11. Fan-Out

Fan-out means that one workflow point produces multiple concurrent execution paths.

```text
             ┌── Task A
             │
Start ───────┼── Task B
             │
             └── Task C
```

The workflow expands from one execution path into multiple paths.

Common examples include:

- processing multiple independent records
- querying multiple independent services
- performing multiple validation checks
- generating independent artifacts

Fan-out can improve throughput or reduce elapsed time when the work is genuinely independent.

---

# 12. Fan-In

Fan-in is the opposite structural operation.

Multiple execution paths converge into a shared continuation.

```text
Task A ───┐
Task B ───┼──► Merge
Task C ───┘
```

Fan-in often requires synchronization.

The workflow must determine when the downstream step is allowed to continue.

For example:

```text
Start
  │
  ├── Check Credit ──────┐
  │                      │
  ├── Verify Identity ───┼──► Merge Results
  │                      │
  └── Check History ─────┘
```

The merge step may require all relevant branches to complete.

---

# 13. Synchronization

Synchronization defines when execution is allowed to proceed after concurrent work.

Suppose three tasks execute in parallel:

```text
Task A ────────┐
Task B ────────┼──► Merge
Task C ────────┘
```

The workflow needs a rule such as:

> Continue only after A, B, and C have completed.

That rule is synchronization.

Without synchronization, downstream execution could consume incomplete results.

---

## Synchronization Is a Design Decision

Not every workflow requires all parallel branches to finish.

Consider:

```text
Task A ────────┐
Task B ────────┼──► Continue when required work is ready
Task C ────────┘
```

The continuation condition might be:

- all branches complete
- a required subset completes
- the first acceptable result arrives
- a threshold is reached
- a timeout occurs
- a cancellation condition is triggered

The correct synchronization rule depends on the workflow requirements.

---

# 14. Dependencies

Dependencies determine whether one step can execute independently of another.

Consider:

```text
A → B
```

B depends on A.

Now consider:

```text
A ──┐
    ├──► C
B ──┘
```

C depends on both A and B.

But:

```text
A       B
│       │
▼       ▼
C       D
```

allows C and D to potentially execute independently.

A useful question is:

> **What information or result does this step require before it can run?**

That question helps identify the workflow's dependency structure.

---

# 15. Dependency Graph

A workflow can be represented as a directed graph.

For example:

```text
A → B → D
 \       ↑
  → C ───┘
```

Here:

- B depends on A.
- C depends on A.
- D depends on both B and C.

This graph reveals that B and C may execute independently after A.

Therefore:

```text
A
│
├── B ──┐
│       │
└── C ──┴──► D
```

is a candidate for parallel execution.

This is one of the fundamental reasons workflow graphs are useful.

---

# 16. Workflow Composition

Large workflows should not necessarily be represented as one enormous graph.

A workflow can be composed from smaller workflow structures.

For example:

```text
Order Processing
       │
       ├── Validation Workflow
       │
       ├── Payment Workflow
       │
       └── Fulfillment Workflow
```

Each component can contain its own internal structure.

For example:

```text
Validation Workflow

Receive
   ↓
Validate Format
   ↓
Validate Business Rules
   ↓
Validation Result
```

Composition allows a large workflow to be reasoned about at multiple levels.

### Why composition matters

Without composition, complexity grows quickly.

A single workflow might eventually contain:

- dozens of steps
- multiple branches
- nested loops
- parallel paths
- synchronization points

Breaking the workflow into meaningful units improves:

- readability
- testing
- maintenance
- reasoning
- reuse

Composition does not mean hiding important behavior.

The boundaries should remain understandable.

---

# 17. Nested Workflow Structures

Workflow patterns can be combined.

For example:

```text
Start
  │
  ▼
Validate
  │
  ▼
Eligible?
 /      \
No       Yes
│         │
▼         ▼
Reject   ┌── Check Credit
         ├── Verify Identity
         └── Check History
                 │
                 ▼
             Merge Results
                 │
                 ▼
              Decision
```

This single workflow combines:

- sequence
- branching
- parallelism
- synchronization

Real workflows are often compositions of these basic patterns.

The engineering challenge is not learning each pattern independently.

It is understanding how they interact.

---

# 18. Deterministic Workflow Structure

A workflow can have a predefined structure.

For example:

```text
A → B → C → D
```

The execution structure is known before execution begins.

Similarly:

```text
A → Decision
      ├── B
      └── C
```

has a known set of possible paths even though the selected path depends on runtime data.

This can be called **deterministic workflow structure**.

The structure is defined in advance.

Runtime data determines which predefined path is followed.

---

# 19. Dynamic Workflow Structure

Some systems construct or modify execution structure dynamically.

For example:

```text
Determine Tasks
      │
      ▼
Create Task Set
      │
      ├── Task A
      ├── Task B
      ├── Task C
      └── Task D
```

The exact set of tasks may depend on runtime information.

Dynamic structure can be useful when:

- the number of items is unknown
- work depends on discovered information
- tasks are generated from input
- execution needs to adapt to runtime conditions

However, dynamic structure increases reasoning complexity.

A system must understand:

- what work was created
- why it was created
- what dependencies exist
- when generated work is complete
- what happens if generated work changes

Dynamic workflows should therefore be used when their flexibility provides meaningful value.

---

# 20. Workflow Control Flow vs Agent Planning

This is one of the most important boundaries in AGT-06.

Suppose an agent receives:

> “Find the best solution for this customer problem.”

Planning asks:

> What steps should the agent perform?

The planner might produce:

```text
1. Gather customer information
2. Retrieve relevant policies
3. Compare possible solutions
4. Select a solution
5. Present the recommendation
```

Workflow orchestration asks:

> How should these execution steps be structured and coordinated?

For example:

```text
Gather Information
       │
       ▼
Retrieve Policies
       │
       ▼
Compare Solutions
       │
       ▼
Select Solution
       │
       ▼
Present Recommendation
```

Or perhaps:

```text
Gather Information
       │
       ├── Retrieve Policy A ──┐
       ├── Retrieve Policy B ──┼──► Compare
       └── Retrieve Policy C ──┘
```

The workflow determines how execution proceeds.

The planning system determines what should be done to achieve the goal.

### Keep the distinction clear

```text
AGT-05
Planning
"What should we do?"
        │
        ▼
AGT-06
Workflow Orchestration
"How is that execution structured?"
```

AGT-06 must not silently become another planning chapter.

---

# 21. Workflow Control Flow vs Agent Runtime Loop

AGT-02 owns the internal agent runtime loop.

A simplified runtime model is:

```text
Decision
   ↓
Action
   ↓
Observation
   ↓
Continue or Terminate
```

AGT-06 addresses a different level.

A workflow may contain several runtime activities:

```text
Workflow
   │
   ├── Agent Runtime
   ├── Tool Step
   ├── Agent Runtime
   └── Verification Step
```

The workflow coordinates the larger execution structure.

The agent runtime governs the internal execution loop of an agent.

These concepts can coexist without being interchangeable.

---

# 22. Common Workflow Patterns

Several patterns appear repeatedly in production systems.

## Sequential

```text
A → B → C → D
```

Use when order and dependencies dominate.

---

## Conditional Branch

```text
       ┌── B
A ─────┤
       └── C
```

Use when different conditions require different paths.

---

## Loop

```text
A → Condition
    ├── Continue → A
    └── Stop
```

Use when work must repeat.

---

## Fan-Out / Fan-In

```text
          ┌── B ──┐
A ────────┼── C ──┼── D
          └── E ──┘
```

Use when independent work can proceed concurrently and later converge.

---

## Pipeline

```text
Input
  ↓
Transform
  ↓
Validate
  ↓
Enrich
  ↓
Output
```

A pipeline is a sequence where each stage performs a transformation before passing the result onward.

---

## Conditional Pipeline

```text
Input
  ↓
Validate
  ↓
Condition
 /       \
Path A   Path B
  \       /
   \     /
    Merge
```

This combines sequential processing with conditional execution.

---

# Internal Working

A workflow engine or orchestration layer does not need to execute every workflow in exactly the same way.

However, conceptually, workflow execution involves several fundamental operations.

## 1. Represent the Workflow

The workflow structure must be represented somehow.

For example:

```text
A → B → C
```

or:

```text
        ┌── B ──┐
A ──────┤       ├── D
        └── C ──┘
```

The representation may be:

- code
- configuration
- a graph
- a state machine
- another execution model

The implementation mechanism is framework-specific.

The underlying concept is the same:

> The system needs a representation of executable relationships.

---

## 2. Determine Eligible Steps

At a given point, some steps are executable and others are not.

For:

```text
A → B → C
```

before A completes:

```text
A = eligible
B = blocked
C = blocked
```

After A completes:

```text
A = complete
B = eligible
C = blocked
```

After B completes:

```text
A = complete
B = complete
C = eligible
```

This is the basic idea of dependency-driven execution.

---

## 3. Execute the Step

Once a step becomes eligible, the orchestration system executes it.

The step may:

- perform application logic
- invoke a tool
- call an external service
- invoke an agent
- process data

The internal behavior of those operations belongs to their respective domains.

AGT-06 is concerned with their position in the workflow.

---

## 4. Update the Workflow Position

After a step completes, the workflow must determine how execution should proceed.

Conceptually:

```text
Step B
  │
  ▼
Result
  │
  ▼
Update Workflow Position
  │
  ▼
Identify Next Eligible Work
```

This allows downstream dependencies to become eligible.

Detailed persistence, checkpointing, replay, and durable execution are covered in AGT-06.02.

---

## 5. Continue Through the Workflow

The orchestration system repeatedly evaluates the workflow structure:

```text
Current Position
       ↓
Identify Eligible Work
       ↓
Execute
       ↓
Update Execution Position
       ↓
Identify Next Eligible Work
       ↓
Continue
```

For a simple workflow, this may look like ordinary program control flow.

For a large workflow, the same conceptual process can coordinate many steps and branches.

---

# Practical Example: Application Processing

Consider a loan application workflow.

## Step 1 — Receive Application

```text
Start
  │
  ▼
Receive Application
```

## Step 2 — Validate

```text
Receive Application
        │
        ▼
Validate Application
```

If validation fails:

```text
Validate
   │
   ▼
Valid?
 /   \
No    Yes
│      │
▼      ▼
Reject Continue
```

## Step 3 — Parallel Checks

After validation, three independent checks may be required:

```text
             ┌── Credit Check ─────┐
             │                     │
Continue ────┼── Identity Check ───┼──► Merge
             │                     │
             └── History Check ────┘
```

## Step 4 — Merge

The workflow waits for the required checks.

```text
Credit Check ─────┐
Identity Check ───┼──► Merge Results
History Check ────┘
```

## Step 5 — Decision

```text
Merge Results
      │
      ▼
   Eligible?
    /     \
  Yes      No
   │        │
   ▼        ▼
Approve    Reject
```

This single example demonstrates:

- sequential execution
- branching
- parallel execution
- fan-out
- fan-in
- synchronization
- dependencies
- workflow composition

The workflow structure is more expressive than a simple list of operations.

---

# Practical Example: Processing a Collection

Suppose an agent workflow needs to process 100 independent documents.

A sequential workflow might be:

```text
Document 1 → Document 2 → Document 3 → ... → Document 100
```

This can be slow if the documents are independent.

A parallel structure could be:

```text
                  ┌── Document 1
                  ├── Document 2
                  ├── Document 3
Start ────────────┼── ...
                  ├── Document 99
                  └── Document 100
                         │
                         ▼
                    Merge Results
```

But this does not automatically mean all 100 should execute simultaneously.

The system must consider:

- resource limits
- downstream service limits
- concurrency limits
- dependency constraints
- cost
- ordering requirements
- synchronization requirements

Therefore:

> **Parallelizable does not mean unlimited parallelism.**

The workflow structure identifies possible concurrency.

The production system still needs appropriate execution controls.

---

# Practical Example: Loop with Branching

Consider processing customer requests one at a time.

```text
Start
  │
  ▼
Get Next Request
  │
  ▼
Request Available?
  │
 ┌┴─────────────┐
No              Yes
│                │
▼                ▼
End         Validate Request
                 │
                 ▼
             Valid?
              /   \
            No     Yes
            │       │
            ▼       ▼
          Reject   Process
                      │
                      ▼
                  Next Request
```

This demonstrates that workflow patterns can be nested.

A loop can contain a branch.

A branch can contain multiple steps.

A workflow is therefore better understood as a composition of execution structures rather than a single pattern.

---

# Production Perspective

Workflow patterns that are easy to draw can become difficult to operate at production scale.

The workflow designer should consider more than logical correctness.

## 1. Execution Cost

Parallelism may reduce elapsed time but increase:

- compute usage
- external requests
- concurrency
- resource consumption

---

## 2. External Service Limits

Suppose a workflow fans out to 1,000 external requests.

The workflow structure may permit this.

The external system may not.

Therefore:

```text
Workflow Parallelism
        ≠
Unlimited External Concurrency
```

The execution system may need bounded concurrency.

---

## 3. Failure Surface

More concurrent work can create more concurrent failure opportunities.

For example:

```text
A
├── B
├── C
├── D
├── E
└── F
```

creates more execution paths than:

```text
A → B → C → D → E → F
```

Parallelism can therefore increase operational complexity even when it reduces elapsed time.

---

## 4. Synchronization Cost

A fan-in point can become a bottleneck.

```text
A ──┐
B ──┤
C ──┼──► Merge
D ──┤
E ──┘
```

If one branch takes much longer than the others, the merge may have to wait.

Therefore, parallel execution does not guarantee proportional performance improvement.

---

## 5. Ordering Requirements

Some operations cannot safely execute in parallel.

For example:

```text
Create Account
      ↓
Create Account Configuration
      ↓
Activate Account
```

The dependencies establish the order.

Attempting to parallelize these operations could violate business or technical requirements.

---

# Engineering Decisions and Trade-offs

## Sequential vs Parallel

| Sequential | Parallel |
|---|---|
| Simpler | More complex |
| Easier to reason about | More coordination required |
| Potentially slower | Potentially faster |
| Fewer concurrent resources | Higher resource usage |
| Strong ordering | Requires dependency analysis |

Use parallelism when the independent work justifies the additional complexity.

---

## Simple vs Complex Workflow Structure

A larger workflow can represent more behavior.

But complexity has a cost.

```text
Simple Workflow
A → B → C
```

Compare:

```text
       ┌── B ──┐
A ─────┤       ├── D
       └── C ──┘
             │
             ├── Loop
             │
             └── Branch
```

The second structure may be necessary, but it requires more careful design.

A good workflow is not the one with the most sophisticated control flow.

It is the one whose structure appropriately represents the required execution behavior.

---

## Fine-Grained vs Coarse-Grained Steps

Consider:

```text
A → B → C → D → E
```

versus:

```text
Process Request
```

Fine-grained steps provide greater visibility into execution structure.

Coarse-grained steps simplify orchestration.

The appropriate granularity depends on:

- dependency requirements
- observability needs
- recovery requirements
- execution cost
- complexity

Detailed checkpoint and recovery implications are covered in AGT-06.02.

---

## Static vs Dynamic Workflow Structure

### Static structure

```text
A → B → C
```

Advantages:

- easier to reason about
- easier to validate
- predictable structure

### Dynamic structure

```text
Discover Tasks
      ↓
Generate Tasks
      ↓
Execute Generated Tasks
```

Advantages:

- flexible
- adaptable to runtime data
- useful for variable workloads

Costs:

- more complex reasoning
- harder debugging
- potentially harder observability
- more difficult dependency management

Dynamic structure should be introduced when runtime variability genuinely requires it.

---

# Common Mistakes and Misconceptions

## 1. “A workflow is just a list of steps.”

Not necessarily.

A workflow can contain:

- branches
- loops
- parallel paths
- synchronization
- dependencies
- convergence

A list represents sequence.

A workflow can represent a much richer execution structure.

---

## 2. “Workflow orchestration is the same as planning.”

No.

Planning determines what should be done to achieve a goal.

Workflow orchestration determines how defined execution steps are structured and coordinated.

```text
Planning
"What should we do?"
       ↓
Workflow
"How is that execution structured?"
```

---

## 3. “Every workflow needs a workflow engine.”

No.

Simple workflows can often be implemented directly with ordinary application control flow.

A dedicated orchestration mechanism becomes more valuable as execution requirements become more complex.

The engineering question is:

> Does the workflow's complexity justify explicit orchestration capabilities?

---

## 4. “Parallel execution is always faster.”

No.

Parallel execution can introduce:

- coordination overhead
- resource contention
- rate limits
- synchronization delays
- increased operational complexity

Parallelism is useful when the workload and system constraints support it.

---

## 5. “If tasks are independent, they should always run in parallel.”

Not necessarily.

Other constraints may exist:

- resource limits
- service rate limits
- cost constraints
- ordering requirements
- operational simplicity

Independence makes parallelism **possible**, not automatically optimal.

---

## 6. “A branch is the same as parallel execution.”

No.

A branch typically selects among alternative paths:

```text
        ┌── B
A ──────┤
        └── C
```

Parallel execution may activate multiple paths:

```text
        ┌── B ──┐
A ──────┼── C ──┼── D
        └── E ──┘
```

This distinction becomes important when reasoning about synchronization and completion.

---

## 7. “More workflow steps always make the workflow better.”

No.

Excessive decomposition can increase:

- orchestration overhead
- complexity
- maintenance cost
- coordination requirements

Steps should represent meaningful execution boundaries.

---

## 8. “Dynamic workflows are always more intelligent.”

No.

Dynamic structure provides flexibility.

It also increases complexity.

A predictable workflow can be preferable when the problem does not require runtime-generated structure.

---

# Interview Questions with Expected Answers

## Foundational

### 1. What is a workflow?

**Expected answer:**

A workflow is a structured set of execution steps connected by control-flow and dependency relationships that determine how execution progresses.

---

### 2. What is the difference between a workflow and a simple sequence?

**Expected answer:**

A sequence mainly represents ordered execution. A workflow can additionally represent branches, loops, parallelism, dependencies, synchronization, and multiple execution paths.

---

### 3. What is fan-out?

**Expected answer:**

Fan-out is the point where one workflow path expands into multiple execution paths, often for parallel work.

---

### 4. What is fan-in?

**Expected answer:**

Fan-in is the point where multiple execution paths converge into a shared continuation, often requiring synchronization.

---

## Conceptual

### 5. What is the difference between branching and parallel execution?

**Expected answer:**

Branching selects among alternative paths based on a condition. Parallel execution allows multiple eligible paths to execute concurrently.

---

### 6. Why is dependency analysis important for parallelism?

**Expected answer:**

A step can execute independently only when its required inputs and predecessors are satisfied. Dependency analysis identifies which work can safely proceed concurrently.

---

### 7. What is synchronization?

**Expected answer:**

Synchronization defines the condition under which downstream execution can continue after concurrent work, such as waiting for all required branches to complete.

---

### 8. How is workflow orchestration different from agent planning?

**Expected answer:**

Planning determines what actions or steps should achieve a goal. Workflow orchestration structures and coordinates the execution of those steps.

---

## Scenario

### 9. Three independent checks must be performed before a final decision. How would you structure the workflow?

**Expected answer:**

Use fan-out to execute the independent checks concurrently, then fan-in at a synchronization point before the final decision.

```text
             ┌── Check A ──┐
Start ───────┼── Check B ──┼──► Decision
             └── Check C ──┘
```

---

### 10. Two branches exist, but only one should execute based on a condition. Is this parallelism?

**Expected answer:**

No. This is conditional branching. Parallelism would involve multiple paths executing concurrently.

---

### 11. A workflow has three independent tasks, but one downstream step needs the results of all three. What structure would you use?

**Expected answer:**

Use fan-out for the three independent tasks and fan-in with synchronization before the downstream step.

---

## Debugging

### 12. A workflow is executing tasks sequentially even though the tasks are independent. What would you investigate?

**Expected answer:**

Check whether the workflow has unnecessary dependencies or explicit sequencing constraints. If the tasks are truly independent and resources permit it, parallel execution may be appropriate.

---

### 13. A workflow's parallel branches finish at different times, but the next step sometimes receives incomplete results. What is likely wrong?

**Expected answer:**

The synchronization condition is incorrect or missing. The downstream step is being allowed to execute before the required branches have completed.

---

## Architecture

### 14. When would you avoid parallel execution?

**Expected answer:**

When tasks have dependencies, ordering requirements, strong resource constraints, external rate limits, high coordination costs, or when the performance benefit does not justify the added complexity.

---

### 15. When is a dynamic workflow structure useful?

**Expected answer:**

When the required execution structure depends materially on runtime information, such as a variable number of tasks or discovered work items.

---

## Engineering Judgment

### 16. Should every independent task be executed in parallel?

**Expected answer:**

No. Independence is necessary for parallel execution but not sufficient to justify it. Resource usage, service limits, cost, synchronization, and operational complexity must also be considered.

---

### 17. How would you decide whether a workflow should be fine-grained or coarse-grained?

**Expected answer:**

Choose boundaries based on meaningful dependencies, observability, recovery needs, execution cost, and maintainability. Avoid both unnecessary fragmentation and overly opaque steps.

---

### 18. A workflow contains a large number of independent tasks. What should you consider before executing all of them concurrently?

**Expected answer:**

Consider concurrency limits, resource capacity, downstream rate limits, cost, synchronization behavior, and whether bounded concurrency provides a better operational trade-off.

---

# Quick Revision

### Workflow

A structured execution graph containing steps and relationships.

### Sequence

```text
A → B → C
```

Execute in order.

### Branch

```text
       ┌── B
A ─────┤
       └── C
```

Select an execution path.

### Loop

```text
A → Condition
    ├── Continue → A
    └── Stop
```

Repeat execution while a condition permits.

### Parallelism

```text
       ┌── B ──┐
A ─────┼── C ──┼── D
       └── E ──┘
```

Execute independent work concurrently.

### Fan-out

One path → multiple paths.

### Fan-in

Multiple paths → one continuation.

### Synchronization

Defines when downstream execution may proceed.

### Dependency

Defines what must happen before a step can execute.

### Planning vs Workflow

```text
Planning
"What should we do?"
       ↓
Workflow
"How is that execution structured?"
```

### Key rule

> **Parallelism is a consequence of dependency structure, not simply a desire to make execution faster.**

---

# Key Takeaways

1. A workflow is more than a list of steps; it explicitly represents execution structure and relationships.
2. Sequential execution is the simplest workflow pattern.
3. Branching represents alternative execution paths.
4. Loops represent repeated execution.
5. Parallelism allows independent work to execute concurrently.
6. Fan-out expands execution into multiple paths.
7. Fan-in brings multiple paths back together.
8. Synchronization determines when downstream execution can continue.
9. Dependency analysis determines which steps can execute independently.
10. Workflow composition allows complex workflows to be built from smaller structures.
11. Dynamic workflows provide flexibility but increase reasoning complexity.
12. Parallel execution can improve latency or throughput, but it also increases coordination and resource costs.
13. Workflow orchestration is not the same as agent planning.
14. Workflow orchestration is not the same as the agent runtime loop.
15. AGT-06.01 focuses on **execution structure**.
16. AGT-06.02 will address **state, checkpoints, persistence, and durable execution**.
17. AGT-06.03 will address **asynchronous, long-running execution, continuity, cancellation, and compensation**.

---

## Further Reading

The next chapter builds directly on the execution structures introduced here:

- [AGT-06.02 — State Transitions, Checkpoints and Durable Execution](./02-State-Transitions-Checkpoints-and-Durable-Execution.md)
- [AGT-06.03 — Async, Long-Running Execution, Continuity and Compensation](./03-Async-Long-Running-Execution-Continuity-and-Compensation.md)

Related concepts:

- AGT-02 — Agent Runtime, Harness and Execution
- AGT-03 — Tool Definitions, Selection and Execution
- AGT-04 — Agent State, Context and Memory
- AGT-05 — Planning, Decomposition and Adaptation

The next file extends this chapter's workflow structures into the question:

> **What happens when execution is interrupted after some work has already completed?**

---

## End of Document
