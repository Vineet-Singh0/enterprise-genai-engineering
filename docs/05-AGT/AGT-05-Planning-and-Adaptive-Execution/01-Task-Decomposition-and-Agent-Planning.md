# AGT-05.01 — Task Decomposition and Agent Planning

## Learning Objectives

After completing this chapter, you should be able to:

- Explain what planning means in an agent system.
- Explain why an agent may need planning instead of immediately choosing the next action.
- Distinguish goals from subgoals and actions.
- Decompose a complex goal into meaningful subgoals.
- Use hierarchical task decomposition appropriately.
- Identify dependencies and prerequisites between subgoals.
- Determine meaningful sequencing and ordering constraints.
- Understand planning horizons.
- Represent plans in forms that are useful for execution and monitoring.
- Identify plan assumptions and constraints.
- Reason about plan feasibility and completeness.
- Construct simple practical plans.
- Recognize when a plan is unnecessarily detailed or insufficiently specified.
- Understand the difference between static planning and adaptive planning at a conceptual level.
- Identify limitations of naive planning approaches.
- Distinguish planning from the runtime execution loop owned by AGT-02.

---

## Prerequisites

Before studying this chapter, you should understand the basic structure of an agent system.

Recommended prerequisites include:

- Agent definition and system boundaries
- Agent architecture and system composition
- Runtime execution loops
- Decision → action → observation
- Tool capabilities and execution boundaries
- State, context, and memory concepts

Recommended prerequisite chapters:

- [AGT-01 — Agent Foundations](../AGT-01-Agent-Systems-Foundations/Readme.md)
- [AGT-02 — Runtime, Loops & Bounded Autonomy](../AGT-02-Agent-Runtime-Loops-and-Bounded-Autonomy/Readme.md)
- [AGT-03 — Tools, Contracts & Execution](../AGT-03-Tools-and-Action-Execution/Readme.md)
- [AGT-04 — State, Context & Memory](../AGT-04-State-Context-and-Memory/Readme.md)

AGT-02 is particularly important because this chapter builds a planning capability **around** runtime execution rather than replacing it.

---

## Estimated Reading Time

**35–45 minutes**

The exact time depends on how deeply you work through the examples and exercises.

---

## Before We Start

Consider a simple request:

> “Prepare a project release.”

A weak agent might immediately start performing actions:

```text
Run tests
↓
Build
↓
Deploy
```

But several questions have been left unanswered:

- What must be validated before testing?
- Are all requirements complete?
- Does the build depend on successful tests?
- Is deployment allowed before verification?
- What artifact should be deployed?
- How should deployment success be verified?
- What happens if a required dependency is unavailable?

The problem is not necessarily that the agent lacks actions.

The problem is that it lacks a **strategy for organizing those actions toward the goal**.

This is where planning becomes useful.

Planning gives an agent a way to reason about:

```text
Goal
 ↓
What must be accomplished?
 ↓
What subgoals are required?
 ↓
What depends on what?
 ↓
What order makes sense?
 ↓
What constraints apply?
 ↓
Can the resulting plan actually be executed?
```

Planning therefore sits above individual execution steps.

---

## Why This Exists

An agent operating in a non-trivial environment rarely faces a goal that can be solved by one isolated action.

A goal may contain:

- multiple required outcomes
- dependencies
- prerequisites
- ordering constraints
- limited capabilities
- resource constraints
- assumptions about the environment
- alternative ways to achieve the same result

Without planning, an agent can easily produce behavior that is locally reasonable but globally ineffective.

For example:

```text
Goal:
Prepare a production release.

Action:
Deploy application.
```

The deployment action may be valid in isolation.

But it may be invalid as part of the larger task if:

- tests have not passed
- the artifact has not been built
- required configuration is missing
- deployment prerequisites are unavailable
- the release has not been verified

Planning addresses this gap.

It asks:

> **What strategy should achieve the goal under the known constraints and dependencies?**

---

# Mental Model

A useful mental model is to think of planning as building a **map from a goal to an achievable strategy**.

```text
                    Goal
                      │
                      ▼
              Understand Goal
                      │
                      ▼
              Decompose Task
                      │
                      ▼
          Identify Subgoals & Dependencies
                      │
                      ▼
            Determine Ordering
                      │
                      ▼
             Apply Constraints
                      │
                      ▼
              Construct Plan
                      │
                      ▼
          Check Feasibility & Completeness
                      │
                      ▼
               Ready to Execute
```

The plan is not the execution itself.

It is the structure that tells the system:

> “Given what I currently know, this is the strategy I intend to use to achieve the goal.”

This distinction becomes important later when execution produces new information.

---

# Core Concepts

## 1. What Is Agent Planning?

Agent planning is the process of determining a **strategy for achieving a goal** by organizing required actions, subgoals, dependencies, constraints, and ordering relationships.

A plan can be as simple as:

```text
Goal:
Generate a report.

Plan:
1. Obtain required data.
2. Validate the data.
3. Analyze the data.
4. Generate the report.
```

Or it can contain more structure:

```text
Goal
├── Obtain data
│   ├── Identify source
│   └── Retrieve data
│
├── Validate data
│   ├── Check completeness
│   └── Check consistency
│
├── Analyze data
│
└── Generate report
```

The second representation makes relationships between parts of the task more visible.

The important point is that planning is not simply:

> “Generate several actions.”

It is:

> **Determine what needs to happen, how the pieces relate, and how they can collectively achieve the goal.**

---

## 2. Goal, Subgoal, and Action

These concepts are related but not identical.

### Goal

A **goal** is the desired outcome.

Example:

```text
Goal:
Prepare a project release.
```

### Subgoal

A **subgoal** is a meaningful intermediate objective required to achieve the larger goal.

```text
Goal:
Prepare a project release.

Subgoals:
- Validate release requirements
- Produce release artifact
- Deploy artifact
- Verify deployment
```

### Action

An **action** is something the system can perform to make progress toward a goal or subgoal.

```text
Run automated tests
Build release artifact
Deploy artifact
Check deployment health
```

The relationship can be represented as:

```text
Goal
  ↓
Subgoals
  ↓
Actions
```

However, the mapping is not always one-to-one.

One subgoal may require multiple actions:

```text
Subgoal:
Validate release

Actions:
1. Run unit tests
2. Run integration tests
3. Check required configuration
4. Review failures
```

Similarly, one action may contribute to multiple goals in some systems.

Planning therefore requires reasoning about **relationships**, not just lists.

---

## 3. Task Decomposition

Task decomposition means breaking a larger goal into smaller units that can be reasoned about and executed more effectively.

Consider:

```text
Goal:
Launch a new service.
```

A useful decomposition might be:

```text
Launch Service
│
├── Validate requirements
├── Prepare application
├── Prepare configuration
├── Test application
├── Deploy application
└── Verify deployment
```

Each subgoal is easier to reason about than the original goal.

The purpose of decomposition is not to make the plan as detailed as possible.

The purpose is to make the goal **manageable and structurally understandable**.

---

## 4. Good vs Poor Decomposition

Consider two decompositions.

### Poor decomposition

```text
Launch service
↓
Do deployment stuff
↓
Finish launch
```

This provides little useful structure.

The subgoals are too vague to establish meaningful dependencies or execution requirements.

### Over-decomposition

```text
Launch service
↓
Open terminal
↓
Type command
↓
Press Enter
↓
Wait
↓
Read output
↓
Move cursor
↓
Run next command
```

This is technically detailed but strategically poor.

The plan has become tied to low-level execution mechanics.

### Better decomposition

```text
Launch service
│
├── Validate application
├── Prepare release artifact
├── Configure deployment
├── Deploy artifact
└── Verify deployment
```

The decomposition exposes meaningful engineering boundaries without describing every low-level interaction.

### Engineering principle

> **Decompose to the level where dependencies, decisions, and meaningful outcomes become visible.**

Do not decompose merely to increase the number of steps.

---

# Hierarchical Task Decomposition

Some goals naturally contain multiple levels of structure.

For example:

```text
Goal: Prepare Production Release
│
├── Validate Release
│   ├── Validate requirements
│   ├── Run automated tests
│   └── Check release configuration
│
├── Build Release
│   ├── Build application
│   └── Validate artifact
│
├── Deploy Release
│   ├── Prepare deployment
│   └── Deploy artifact
│
└── Verify Release
    ├── Check service health
    └── Verify critical functionality
```

This is **hierarchical task decomposition**.

The higher level describes major subgoals.

The lower levels describe the work required to achieve those subgoals.

A hierarchy is useful when the task is too large to reason about effectively as a flat list.

---

## Why Hierarchy Helps

A flat plan can become difficult to reason about:

```text
1. Validate requirements
2. Run tests
3. Check configuration
4. Build application
5. Validate artifact
6. Prepare deployment
7. Deploy
8. Check health
9. Verify functionality
```

The same work becomes easier to understand when grouped:

```text
Validate
├── Requirements
├── Tests
└── Configuration

Build
├── Application
└── Artifact

Deploy
├── Preparation
└── Deployment

Verify
├── Health
└── Functionality
```

The hierarchy provides **structure and abstraction**.

It lets an engineer reason about the release at multiple levels.

---

# Dependencies

A dependency means that one part of a plan depends on another part being completed, available, or valid.

Consider:

```text
Build Artifact
      ↓
Deploy Artifact
```

Deployment depends on the artifact existing.

Similarly:

```text
Deploy
  ↓
Verify Deployment
```

Verification depends on deployment having occurred.

Dependencies can be represented as:

```text
A → B
```

meaning:

> B depends on A.

For example:

```text
Validate Requirements
        ↓
     Build
        ↓
    Deploy
        ↓
    Verify
```

The dependency structure tells the planner which actions cannot logically occur before others.

---

## Dependency Types

Dependencies can arise for different reasons.

### Outcome dependency

One task requires the output of another.

```text
Build Artifact
      ↓
Deploy Artifact
```

### Information dependency

A task requires information produced earlier.

```text
Collect Requirements
      ↓
Configure System
```

### Resource dependency

A task requires a resource that must first become available.

```text
Provision Environment
      ↓
Deploy Application
```

### Validation dependency

A later action requires evidence that an earlier condition is satisfied.

```text
Run Tests
   ↓
Tests Pass
   ↓
Release
```

The important question is:

> **What must be true before this part of the plan can proceed?**

---

# Prerequisites

A prerequisite is a condition that must be satisfied before an action or subgoal can be meaningfully attempted.

Example:

```text
Goal:
Deploy application.

Prerequisites:
- Release artifact exists.
- Deployment configuration is available.
- Target environment is available.
```

Prerequisites are related to dependencies but should not be treated as identical.

A dependency describes a relationship between parts of work.

A prerequisite describes a condition that must hold before progress can occur.

For example:

```text
Build Artifact
      ↓
Deploy Artifact
```

is a dependency.

Meanwhile:

```text
Deploy Artifact

Prerequisites:
- Artifact exists
- Environment is available
- Required configuration exists
```

describes conditions required for the deployment action.

Good planning makes important prerequisites explicit.

---

# Sequencing and Ordering Constraints

Not every task can be performed in an arbitrary order.

Suppose a release requires:

```text
A = Build artifact
B = Deploy artifact
C = Verify deployment
```

The valid ordering is:

```text
A → B → C
```

Trying:

```text
C → B → A
```

does not make sense because verification requires a deployment and deployment requires an artifact.

Ordering constraints therefore emerge from dependencies and task semantics.

---

## Sequential Work

Some tasks must occur in sequence:

```text
Validate
   ↓
Build
   ↓
Deploy
   ↓
Verify
```

---

## Independent Work

Other tasks may not depend on each other:

```text
          ┌── Validate Documentation
          │
Start ────┼── Validate Configuration
          │
          └── Run Static Checks
```

The existence of independent tasks does not automatically mean they must be executed in parallel.

The planning question is:

> **What ordering is required by the problem?**

Execution mechanisms for parallelism belong to workflow orchestration and runtime systems, not to the core planning foundation here.

---

# Planning Horizons

A planning horizon describes how far ahead the agent reasons when constructing a plan.

Consider:

```text
Immediate horizon

Next action
```

versus:

```text
Short horizon

Current task
   ↓
Next few dependent tasks
```

versus:

```text
Longer horizon

Goal
 ↓
Major subgoals
 ↓
Multiple stages
 ↓
Final outcome
```

The appropriate horizon depends on the problem.

A very short horizon may be insufficient for a complex task.

A very long horizon may produce unnecessary planning work based on assumptions that are likely to change.

---

## Planning Horizon Trade-off

```text
Shorter horizon
    ↓
Lower planning cost
    ↓
Less commitment
    ↓
Less foresight
```

while:

```text
Longer horizon
    ↓
More foresight
    ↓
More structure
    ↓
Higher planning cost
    ↓
Greater exposure to stale assumptions
```

There is therefore no universally correct planning horizon.

A useful engineering principle is:

> **Plan far enough ahead to make meaningful decisions, but avoid unnecessary commitment to uncertain future details.**

---

# Plan Representation

A plan needs some representation that allows the system to reason about it.

The simplest representation is a sequence:

```text
1. Retrieve data
2. Validate data
3. Analyze data
4. Generate report
```

A richer representation may explicitly show relationships:

```text
Retrieve Data
      ↓
Validate Data
      ↓
Analyze Data
      ↓
Generate Report
```

A hierarchical representation may show subgoals:

```text
Generate Report
│
├── Prepare Data
│   ├── Retrieve
│   └── Validate
│
└── Analyze
    └── Generate Report
```

A plan representation can therefore contain:

- goals
- subgoals
- actions
- dependencies
- ordering
- prerequisites
- constraints
- assumptions
- expected outcomes

The appropriate representation depends on what the planning system needs to reason about.

---

# Plan Assumptions

Every plan makes assumptions.

Consider:

```text
Plan:
Retrieve data from Source A
→ Analyze data
→ Generate report
```

This plan may implicitly assume:

```text
Source A is available.
The data is accessible.
The returned data is usable.
The required fields exist.
```

If these assumptions are false, the plan may not be executable as designed.

Therefore, a useful planning question is:

> **What must be true for this plan to work?**

Making assumptions explicit improves later verification and adaptation.

---

# Plan Constraints

A constraint limits what the plan can do.

Examples include:

- time constraints
- resource constraints
- capability constraints
- policy constraints
- data availability constraints
- ordering constraints
- required outputs
- prohibited actions

Consider:

```text
Goal:
Generate a report.

Constraints:
- Use approved data sources.
- Do not expose restricted information.
- Complete within the available processing window.
```

A plan that achieves the goal but violates a required constraint is not a valid plan.

Planning therefore involves more than asking:

> “Can this achieve the goal?”

It also asks:

> **“Can this achieve the goal while respecting the constraints?”**

---

# Plan Feasibility

A plan is feasible when its required actions, dependencies, assumptions, resources, and constraints can realistically be satisfied **under the known conditions**.

Consider:

```text
Goal:
Generate report.

Plan:
1. Retrieve data from Source A.
2. Analyze data.
3. Generate report.
```

If Source A exists and is accessible, the plan may be feasible.

If Source A does not exist, the plan is not currently feasible.

This distinction matters because a plan can be logically attractive while being operationally impossible.

---

## Feasibility Questions

Before accepting a plan, ask:

- Are the required capabilities available?
- Are prerequisites satisfiable?
- Are dependencies valid?
- Are required resources available?
- Are assumptions reasonable?
- Are constraints satisfied?
- Can the required outputs actually be produced?

A planner should not confuse:

```text
Conceptually possible
```

with:

```text
Currently feasible
```

### Feasibility vs Execution Success

These concepts should remain separate.

**Feasibility** asks:

> Can the planned strategy be carried out under the conditions currently known?

**Execution success** asks:

> Did the actual execution achieve the intended result?

A feasible plan can still fail during execution because the environment changes, an action fails, or an assumption proves incorrect.

Handling those conditions belongs to the adaptive execution layer covered in [AGT-05.02 — Plan Execution, Replanning and Adaptation](./02-Plan-Execution-Replanning-and-Adaptation.md).

---

# Plan Completeness

A plan is complete enough when it covers the important work required to achieve the goal.

Consider:

```text
Goal:
Deploy service.

Plan:
1. Build service.
2. Deploy service.
```

This may be incomplete if deployment also requires:

```text
Configuration
Verification
```

A more complete plan might be:

```text
1. Validate requirements
2. Build artifact
3. Validate artifact
4. Prepare deployment configuration
5. Deploy
6. Verify deployment
```

Completeness does not mean including every possible action.

The question is:

> **Does the plan cover the important conditions and work required for the intended outcome?**

Detailed plan verification, critique, alternative comparison, and systematic assessment of plan quality are covered in [AGT-05.03 — Verification, Critique and Plan Quality](./03-Verification-Critique-and-Plan-Quality.md).

---

# Plan Construction

A practical planning process can be represented as:

```text
Goal
  ↓
Understand Desired Outcome
  ↓
Identify Major Subgoals
  ↓
Decompose Subgoals
  ↓
Identify Dependencies
  ↓
Identify Constraints & Assumptions
  ↓
Determine Ordering
  ↓
Select Appropriate Planning Horizon
  ↓
Construct Plan
  ↓
Check Feasibility
  ↓
Check Completeness
```

This is not a rigid algorithm.

Different systems may construct plans differently.

The important engineering idea is that a useful plan should emerge from **structured reasoning about the goal and its requirements**, rather than from an arbitrary list of actions.

---

# Example: Simple Release Decomposition

Consider the goal:

> **Prepare a project release.**

A useful decomposition is:

```text
Prepare Release
│
├── Validate Requirements
│   ├── Confirm release scope
│   └── Confirm required changes
│
├── Validate Quality
│   ├── Run tests
│   └── Review failures
│
├── Build Release
│   └── Produce release artifact
│
├── Deploy Release
│   └── Deploy artifact
│
└── Verify Release
    ├── Check service health
    └── Verify critical functionality
```

The dependency relationships are approximately:

```text
Validate Requirements
        ↓
Validate Quality
        ↓
Build Release
        ↓
Deploy Release
        ↓
Verify Release
```

The plan is useful because it exposes:

- major subgoals
- dependencies
- ordering
- required outcomes

It does not need to describe every low-level command.

---

# Example: Planning with an Alternative

Suppose the goal is:

> “Generate a report using the approved data source.”

A naive plan might be:

```text
Retrieve approved data
↓
Analyze data
↓
Generate report
```

But a planner may identify an important condition:

```text
Assumption:
Approved data source is available.
```

A more robust conceptual plan may include:

```text
Retrieve approved data
        ↓
   Data available?
      ├── Yes → Validate → Analyze → Report
      │
      └── No → Determine whether an approved alternative exists
```

This does not mean the planner must immediately create a large branching workflow.

It means the planner has recognized that **availability of a required dependency affects feasibility**.

Detailed adaptive handling belongs in AGT-05.02.

---

# Static vs Adaptive Planning

Planning can be considered along a spectrum.

## Static Planning

A static plan is largely constructed before execution and is expected to remain stable.

```text
Goal
 ↓
Construct Plan
 ↓
Execute Plan
 ↓
Complete
```

This can work well when:

- the environment is predictable
- assumptions are stable
- actions are reliable
- the task is well understood

---

## Adaptive Planning

An adaptive plan can be revised as new information becomes available.

```text
Goal
 ↓
Construct Plan
 ↓
Execute
 ↓
Observe
 ↓
Assess Plan
 ↓
Adapt / Replan when necessary
```

Adaptive planning becomes more useful when:

- the environment is uncertain
- assumptions may change
- actions can fail
- new information becomes available
- the cost of an invalid plan is significant

The important point is not that adaptive planning is always better.

It introduces additional reasoning and planning cost.

The appropriate strategy depends on the problem.

Detailed adaptation and replanning are covered in:

[AGT-05.02 — Plan Execution, Replanning and Adaptation](./02-Plan-Execution-Replanning-and-Adaptation.md)

---

# Simple Planning Patterns

## Pattern 1 — Sequential Plan

```text
A
↓
B
↓
C
↓
D
```

Use when each stage depends on the preceding stage.

Example:

```text
Retrieve
↓
Validate
↓
Analyze
↓
Generate
```

---

## Pattern 2 — Hierarchical Plan

```text
Goal
├── Subgoal A
│   ├── Task A1
│   └── Task A2
│
├── Subgoal B
│   └── Task B1
│
└── Subgoal C
    ├── Task C1
    └── Task C2
```

Use when the goal contains meaningful groups of work.

---

## Pattern 3 — Conditional Strategy

```text
Check condition
      ↓
   ┌──┴──┐
   ↓     ↓
Case A  Case B
```

Use when different conditions require different strategies.

The exact execution and branching mechanisms belong to the runtime/workflow layers; AGT-05 focuses on the planning decision itself.

---

## Pattern 4 — Dependency-Constrained Plan

```text
A ─────→ C
 \       ↑
  └──→ B ┘
```

Here:

```text
C depends on A and B.
```

The important planning task is identifying that C cannot be considered independently of its prerequisites.

---

# Naive Planning and Its Limitations

A naive planner often treats planning as:

```text
Goal
↓
Generate a list
↓
Execute list
```

This can fail in several ways.

## 1. Missing Dependencies

```text
Deploy
↓
Build
```

The ordering is backwards.

---

## 2. Missing Prerequisites

```text
Deploy artifact
```

without checking whether an artifact exists.

---

## 3. Incomplete Plans

```text
Build
↓
Deploy
```

with no verification step when verification is required for the goal.

---

## 4. Over-Decomposition

```text
Open interface
↓
Click button
↓
Move cursor
↓
Enter text
↓
Press key
```

The plan becomes unnecessarily tied to low-level execution mechanics.

---

## 5. Over-Planning

A planner may spend substantial effort constructing detailed steps for a simple task.

The planning cost may exceed the benefit of additional structure.

---

## 6. Under-Planning

A planner may produce a vague strategy:

```text
Analyze data and create report.
```

without identifying required data preparation, dependencies, or validation.

---

## 7. Hidden Assumptions

The plan may assume:

```text
Required data exists.
```

without explicitly checking it.

---

## 8. Treating the Plan as Immutable

A plan may become invalid when conditions change.

Assuming that the original plan must always be followed can turn a useful strategy into a failure mode.

Adaptive handling of this problem is covered in AGT-05.02.

---

# Production Perspective

Planning in a production agent is not free, and the quality of a plan cannot be separated from the conditions under which the system operates.

A production planning system must consider at least the following concerns.

## Planning Latency and Cost

Planning consumes compute, context, model inference, and time.

A planner that spends several seconds generating an elaborate strategy for a task that takes milliseconds to execute may reduce overall system performance.

Therefore:

```text
Planning Cost
+
Execution Cost
+
Failure / Recovery Cost
```

is a more useful engineering perspective than planning cost alone.

The objective is not to minimize planning time at all costs.

The objective is to achieve an acceptable overall outcome.

---

## Plan Stability

A production system should avoid unnecessary changes to a plan.

If the agent constantly modifies its strategy because of minor observations, execution can become unstable.

For example:

```text
Plan A
 ↓
Minor deviation
 ↓
Plan B
 ↓
Minor deviation
 ↓
Plan C
 ↓
Plan D
```

This can create planning churn.

A useful system therefore needs a distinction between:

```text
Expected variation
```

and:

```text
Plan-invalidating change
```

Detailed replanning policies are covered in AGT-05.02.

---

## Stale Assumptions

A plan is based on information available when it is constructed.

That information can become stale.

Examples include:

- a required resource becoming unavailable
- an expected capability changing
- an input changing
- an external condition changing
- a dependency becoming invalid

Production planning should therefore make important assumptions visible enough to assess later.

---

## Partial Completion

Real execution does not always end in a simple:

```text
Success
```

or:

```text
Failure
```

An agent may complete:

```text
Subgoal A ✓
Subgoal B ✓
Subgoal C ✗
Subgoal D not started
```

A production planner should not automatically discard the completed work.

The remaining plan may be revised around the work that is still valid.

The detailed preservation and adaptation strategy belongs to AGT-05.02.

---

## Replanning Frequency

Replanning has a cost.

Too little replanning can leave the agent committed to an invalid strategy.

Too much replanning can create instability and unnecessary computation.

The engineering objective is therefore not:

> “Replan whenever anything changes.”

It is:

> **Replan when the expected benefit of changing strategy justifies the planning cost and disruption.**

---

## Plan Persistence

For longer-running tasks, the plan may need to remain available beyond a single reasoning step.

The planning system may need to retain information such as:

- current plan
- completed subgoals
- remaining subgoals
- important dependencies
- assumptions
- current strategy

The mechanisms used to persist and manage execution state belong to the surrounding state and workflow architecture.

AGT-05 focuses on **what planning information needs to exist**, not on implementing durable workflow infrastructure.

---

## Planning Decision Observability

Production systems should make important planning decisions understandable enough to diagnose failures.

Useful operational information may include:

```text
Goal
↓
Selected strategy
↓
Important assumptions
↓
Key dependencies
↓
Plan revision
↓
Reason for revision
```

This does not require exposing private reasoning traces.

It means the system should provide appropriate operational signals about **what strategy was selected and what changed at the system level**.

This distinction is important for debugging planning behavior without coupling observability to internal model reasoning.

---

## Deterministic vs Adaptive Planning

Production systems may choose different degrees of planning flexibility.

A deterministic plan can provide:

- predictability
- easier testing
- easier operational reasoning
- stable behavior

Adaptive planning can provide:

- resilience to changing conditions
- better handling of uncertainty
- greater flexibility

But adaptive behavior can also increase:

- complexity
- latency
- operational variability
- debugging difficulty

The right choice depends on the environment and the consequences of planning errors.

---

## Bounded Planning

Planning should operate within appropriate boundaries.

A planner should not continue expanding a task indefinitely simply because additional decomposition is possible.

Useful boundaries may include:

- planning depth
- planning time
- number of candidate strategies
- acceptable complexity
- uncertainty thresholds
- task-specific stopping criteria

The objective is to produce a sufficiently useful strategy, not an infinitely detailed plan.

---

## Production Planning Mental Model

A useful production perspective is:

```text
                 Goal
                   ↓
             Construct Plan
                   ↓
       ┌───────────┴───────────┐
       ↓                       ↓
   Plan Quality            Planning Cost
       ↓                       ↓
   Feasibility             Latency
   Completeness             Compute
   Stability                Complexity
       └───────────┬───────────┘
                   ↓
             Execute Plan
                   ↓
             Observe Results
                   ↓
          Assess Plan Validity
                   ↓
          Continue / Adapt
```

Production planning is therefore a balance between **strategy quality, execution uncertainty, planning cost, and operational stability**.

---

# Engineering Decisions and Trade-offs

Planning decisions involve trade-offs.

| Decision | Trade-off |
|---|---|
| Fixed plan vs adaptive plan | Stability vs flexibility |
| Detailed plan vs lightweight plan | Predictability vs planning cost |
| Short horizon vs long horizon | Lower commitment vs greater foresight |
| Fine decomposition vs coarse decomposition | Control vs simplicity |
| More validation vs less validation | Confidence vs overhead |
| Robust plan vs minimal plan | Resilience vs simplicity |
| Early commitment vs delayed commitment | Predictability vs flexibility |

There is no universally correct choice.

The appropriate decision depends on:

- uncertainty
- task complexity
- failure cost
- execution cost
- available capabilities
- required reliability
- environmental stability

---

## When Simple Planning Is Better

A simple plan may be preferable when:

- the task is straightforward
- dependencies are obvious
- the environment is stable
- failure cost is low
- additional planning would add little value

For example:

```text
Goal:
Convert a known input into a known output.

Plan:
Perform conversion → Validate result.
```

A complex planning system would add unnecessary overhead.

---

## When More Structured Planning Is Justified

More structured planning becomes useful when:

- the goal contains many subgoals
- dependencies are non-trivial
- constraints matter
- actions have significant consequences
- the environment is uncertain
- partial completion matters
- alternative strategies exist

The important engineering question is:

> **What level of planning complexity is justified by the problem?**

---

# Common Mistakes and Misconceptions

## Misconception 1 — Planning Is Just a List of Steps

A list may be a representation of a plan, but planning involves reasoning about:

- goals
- dependencies
- constraints
- assumptions
- sequencing
- feasibility

A list without these relationships may be incomplete or misleading.

---

## Misconception 2 — Every Agent Needs Complex Planning

Not every task requires sophisticated planning.

For a simple deterministic task, a fixed sequence may be sufficient.

Planning complexity should match task complexity and uncertainty.

---

## Misconception 3 — More Planning Is Always Better

More planning introduces cost.

Excessive planning can:

- increase latency
- consume resources
- introduce unnecessary complexity
- create commitment to uncertain assumptions

The objective is not maximum planning.

It is **sufficient planning for the problem**.

---

## Misconception 4 — The Shortest Plan Is Always the Best

A shorter plan may omit:

- required validation
- important dependencies
- recovery considerations
- necessary constraints

A slightly longer plan may be better if it is more feasible and robust.

---

## Misconception 5 — A Plan Must Describe Every Low-Level Action

Planning should provide meaningful strategy.

It does not need to encode every low-level interaction.

Overly detailed plans can become brittle and difficult to maintain.

---

## Misconception 6 — Planning Requires an LLM

Planning is an engineering capability, not a property exclusive to language models.

A planner can be implemented using:

- deterministic rules
- search
- optimization
- symbolic methods
- heuristics
- learned models
- language models
- combinations of these approaches

AGT-05 focuses on the planning concept rather than prescribing a particular implementation technology.

---

## Misconception 7 — Planning Means Multi-Agent Systems

Planning can exist entirely within a single-agent system.

Multi-agent coordination is a separate architectural concern owned by AGT-09.

---

## Misconception 8 — Planning and Runtime Are the Same Thing

They interact closely but have different responsibilities.

```text
Planning:
What strategy should achieve the goal?

Runtime:
What happens next during execution?
```

Confusing these responsibilities makes system architecture harder to reason about.

---

## Misconception 9 — The Original Plan Must Never Change

A plan is based on current information and assumptions.

If important conditions change, the strategy may need to change.

Adaptive execution and replanning are covered in the next chapter.

---

# Interview Questions with Expected Answers

## Foundational

### 1. What is agent planning?

**Expected answer:**

Agent planning is the process of determining a strategy for achieving a goal by organizing subgoals, actions, dependencies, constraints, assumptions, and ordering relationships.

---

### 2. Why is task decomposition useful?

**Expected answer:**

It breaks a complex goal into meaningful smaller units that are easier to reason about, sequence, validate, and execute.

---

### 3. What is the difference between a goal, subgoal, and action?

**Expected answer:**

A goal is the desired outcome, a subgoal is an intermediate objective required to achieve it, and an action is an operation performed to make progress toward a goal or subgoal.

---

## Conceptual

### 4. Why are dependencies important in planning?

**Expected answer:**

Dependencies identify relationships where one part of the plan requires another part or condition to be completed or available first. They prevent invalid ordering and expose prerequisites.

---

### 5. What makes a plan feasible?

**Expected answer:**

A plan is feasible when its required actions, capabilities, dependencies, assumptions, resources, and constraints can realistically be satisfied under the known conditions.

---

### 6. What is the difference between plan completeness and plan feasibility?

**Expected answer:**

Completeness asks whether the plan covers the important work required to achieve the goal. Feasibility asks whether the planned work can actually be performed under the available conditions and constraints.

A plan can be complete but infeasible.

---

### 7. Why shouldn't every task be decomposed into the smallest possible steps?

**Expected answer:**

Excessive decomposition adds complexity and can make plans brittle or tied to low-level execution details. Decomposition should expose meaningful goals, dependencies, and decisions rather than maximize step count.

---

### 8. What is a planning horizon?

**Expected answer:**

A planning horizon describes how far ahead the agent reasons when constructing a strategy. Longer horizons provide more foresight but can increase planning cost and exposure to uncertain assumptions.

---

## Scenario-Based

### 9. An agent needs to deploy an application, but the deployment artifact has not been built. What should the planner identify?

**Expected answer:**

The planner should identify that artifact creation is a prerequisite or dependency for deployment and place the build step before deployment.

---

### 10. A plan contains ten steps, but only three represent meaningful outcomes. What might be wrong?

**Expected answer:**

The plan may be over-decomposed. It may be describing low-level execution mechanics rather than meaningful planning units.

---

### 11. A planner produces “Analyze data and create report” for a complex reporting task. What would you investigate?

**Expected answer:**

I would check whether the plan is under-decomposed. It may need explicit data acquisition, validation, analysis, and report-generation subgoals, along with their dependencies and constraints.

---

## Debugging

### 12. An agent repeatedly creates plans that cannot be executed. What would you investigate?

**Expected answer:**

I would inspect whether the planner is checking capability availability, prerequisites, dependencies, constraints, assumptions, and feasibility before accepting a plan.

---

### 13. A planner generates increasingly detailed plans but system performance gets worse. What could be happening?

**Expected answer:**

The planner may be over-planning. Additional detail may be increasing latency, complexity, and commitment without improving successful execution.

---

### 14. A planner consistently produces short plans that fail during execution. What is a likely problem?

**Expected answer:**

The planner may be optimizing for step count rather than feasibility, completeness, dependencies, or robustness.

---

## Architecture

### 15. Where should planning sit relative to the runtime loop?

**Expected answer:**

Planning should determine or revise the strategy that guides execution, while the runtime loop performs actions, observes outcomes, and manages execution transitions. Planning and runtime interact but have different responsibilities.

---

### 16. How should planning interact with state and context?

**Expected answer:**

Planning should use relevant state and context as inputs, such as completed work, current conditions, constraints, and available information. State and context management itself belongs to AGT-04.

---

### 17. Does planning require an LLM?

**Expected answer:**

No. Planning is an engineering capability that can be implemented using deterministic rules, search, optimization, symbolic methods, heuristics, learned models, LLMs, or combinations of these.

---

## Engineering Judgment

### 18. When should a system prefer a simple fixed plan?

**Expected answer:**

When the task is predictable, dependencies are straightforward, the environment is stable, and the additional cost of adaptive planning provides little benefit.

---

### 19. When is more structured planning justified?

**Expected answer:**

When the task has meaningful dependencies, constraints, uncertainty, alternative strategies, high failure costs, or substantial partial work that must be coordinated.

---

### 20. How would you balance planning depth against planning cost?

**Expected answer:**

I would increase planning depth when task complexity, uncertainty, or failure cost justifies it, and reduce planning detail when the environment is predictable or additional structure provides little benefit.

---

## Quick Revision

## Planning

Planning answers:

> **What strategy should achieve the goal?**

---

## Goal

The desired outcome.

```text
Prepare release
```

---

## Subgoal

A meaningful intermediate objective.

```text
Validate release
Build release
Deploy release
Verify release
```

---

## Action

An operation that makes progress toward a goal or subgoal.

```text
Run tests
Build artifact
Deploy artifact
```

---

## Dependency

A relationship where one part of the plan depends on another.

```text
Build
 ↓
Deploy
```

---

## Prerequisite

A condition that must be satisfied before an action can proceed.

```text
Deploy

Prerequisite:
Artifact exists
```

---

## Constraint

A limitation the plan must respect.

```text
Use approved data.
Complete within available time.
```

---

## Feasibility

Whether the plan can actually be executed under the known conditions.

---

## Completeness

Whether the plan covers the important work required to achieve the goal.

---

## Planning Horizon

How far ahead the planner reasons.

---

## Static Planning

Construct the plan and expect it to remain mostly stable.

---

## Adaptive Planning

Allow the strategy to change when new information or conditions invalidate existing assumptions.

---

## Key Takeaways

1. **Planning is strategy construction, not merely step generation.**
2. **Goals should be decomposed into meaningful subgoals when complexity requires it.**
3. **Dependencies and prerequisites determine what must happen before other work can proceed.**
4. **Ordering should reflect the actual relationships between tasks.**
5. **Plans should make important assumptions and constraints visible.**
6. **A plan must be both sufficiently complete and feasible.**
7. **Feasibility is not the same as execution success.**
8. **More detailed planning is not automatically better.**
9. **The planning horizon should match task complexity and uncertainty.**
10. **A useful plan provides enough structure without unnecessarily committing to uncertain details.**
11. **Planning and runtime execution are related but distinct responsibilities.**
12. **Production planning must balance strategy quality, planning cost, stability, uncertainty, and adaptability.**
13. **Planning can be implemented without requiring an LLM or a multi-agent architecture.**
14. **Adaptive planning becomes important when execution conditions can change.**

The next chapter builds directly on this foundation by examining what happens when the plan meets the real environment:

[AGT-05.02 — Plan Execution, Replanning and Adaptation](./02-Plan-Execution-Replanning-and-Adaptation.md)

---

## Further Reading

For the surrounding agent architecture, continue with:

- [AGT-02 — Runtime, Loops & Bounded Autonomy](../AGT-02-Agent-Runtime-Loops-and-Bounded-Autonomy/Readme.md)
- [AGT-03 — Tools, Contracts & Execution](../AGT-03-Tools-and-Action-Execution/Readme.md)
- [AGT-04 — State, Context & Memory](../AGT-04-State-Context-and-Memory/Readme.md)

For the next AGT-05 concept:

- [AGT-05.02 — Plan Execution, Replanning and Adaptation](./02-Plan-Execution-Replanning-and-Adaptation.md)

For the later verification and plan-quality layer:

- [AGT-05.03 — Verification, Critique and Plan Quality](./03-Verification-Critique-and-Plan-Quality.md)
