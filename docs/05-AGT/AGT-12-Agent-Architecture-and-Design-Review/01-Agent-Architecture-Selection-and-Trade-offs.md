# AGT-12 — Agent Architecture Selection and Trade-offs

## 1. Purpose

Selecting an agent architecture is an engineering decision, not a framework-selection exercise.

The goal is not to choose the architecture with the most agents, the most tools, the most autonomy, or the most sophisticated orchestration.

The goal is to choose an architecture that satisfies the system's actual requirements while keeping complexity, risk, operational burden, and failure surface justified.

The preferred reasoning sequence is:

```text
Problem
   ↓
Requirements
   ↓
Constraints
   ↓
Assumptions
   ↓
Architecture Drivers
   ↓
Architecture Alternatives
   ↓
Trade-off Analysis
   ↓
Architecture Selection
   ↓
Decision Record
   ↓
Validation
```

The central principle is:

> **Choose the minimum sufficient architecture that satisfies the requirements and risk constraints.**

Minimum sufficient does not mean the smallest architecture regardless of requirements.

It means:

> **The smallest architectural structure that satisfies the important requirements, hard constraints, and acceptable risk boundaries without unnecessary capability or complexity.**

---

## 2. Architecture Is a Set of Decisions

An architecture is not simply a diagram or a collection of components.

It is a set of decisions about:

- what capabilities the system requires,
- which components provide those capabilities,
- which responsibilities belong to which components,
- how components interact,
- where state exists,
- where authority exists,
- how execution is controlled,
- where humans participate,
- how failures are contained,
- how the system is evaluated,
- and how the system operates and evolves.

A useful distinction is:

```text
Architecture
    ↓
Responsibilities
    ↓
Interfaces
    ↓
Control Boundaries
    ↓
Implementation
```

A framework, library, or platform is an implementation choice.

It should not be allowed to define the architecture merely because it makes a particular architecture convenient to build.

### Architecture Before Framework

The preferred reasoning sequence is:

```text
Problem
   ↓
Requirements
   ↓
System Constraints
   ↓
Architecture
   ↓
Component Responsibilities
   ↓
Interfaces
   ↓
Control Boundaries
   ↓
Implementation Technology
   ↓
Frameworks / Libraries
```

A framework-first approach reverses this relationship:

```text
Framework
   ↓
Available Capabilities
   ↓
Architecture Forced Around Those Capabilities
   ↓
System Requirements Adapted to the Framework
```

The second approach can produce a working prototype while still producing a poor production architecture.

---

## 3. Start With the Problem

Architecture selection begins with the problem the system must solve.

Before asking:

> "Which agent architecture should we use?"

ask:

> **"What does the system actually need to accomplish?"**

The problem statement should identify:

- the users or systems interacting with the solution,
- the desired outcome,
- the decisions or actions involved,
- the information required,
- the external systems involved,
- the consequences of incorrect behavior,
- and the operating environment.

### Poor Problem Statement

> Build an AI agent that handles customer support.

This is too vague to drive architecture.

### Better Problem Statement

> Build a system that classifies incoming customer requests, retrieves account information, resolves low-risk requests automatically, and routes high-risk requests to a human support agent.

This reveals potential architectural requirements:

- classification,
- retrieval,
- controlled actions,
- authorization,
- escalation,
- human control,
- auditability,
- and failure handling.

Architecture becomes easier to reason about once the problem is expressed in terms of required behavior rather than technology.

---

## 4. Requirements-Driven Architecture

Architecture selection should begin with requirements.

A useful classification is:

```text
Requirements
├── Functional
├── Non-functional
├── Constraints
└── Assumptions
```

These categories should not be treated as interchangeable.

### Functional Requirements

Functional requirements describe **what the system must do**.

Examples:

- classify requests,
- retrieve information,
- generate responses,
- select tools,
- execute approved actions,
- escalate to humans,
- maintain task state,
- coordinate multiple capabilities.

### Non-Functional Requirements

Non-functional requirements describe **how the system must behave**.

Examples:

- latency,
- reliability,
- availability,
- cost,
- scalability,
- safety,
- observability,
- maintainability,
- auditability,
- recoverability.

A system may satisfy its functional requirements while failing its non-functional requirements.

For example:

> "The agent successfully completes a support workflow."

does not establish that:

- it responds within the required latency,
- it behaves safely,
- it can recover from tool failures,
- it operates within budget,
- or it can be debugged in production.

### Constraints

Constraints limit the architecture options available.

Examples include:

- existing infrastructure,
- regulatory requirements,
- approved cloud providers,
- data residency,
- network boundaries,
- available engineering capacity,
- existing APIs,
- model availability,
- budget,
- deployment environment,
- organizational policies.

### Assumptions

Assumptions are beliefs used during architecture design that have not yet been sufficiently validated.

Examples:

- an external API will remain available,
- a model will maintain sufficient accuracy,
- tool latency will remain within a certain range,
- users will approve actions within a given time,
- a workload will remain below a certain volume.

Assumptions are important because an architecture can appear valid while depending on incorrect assumptions.

---

## 5. Architecture Drivers

Not every requirement influences architecture to the same degree.

An **architecture driver** is a requirement, constraint, risk, or characteristic whose satisfaction materially affects the architecture or eliminates meaningful architectural alternatives.

Examples include:

- required autonomy,
- strict latency limits,
- mandatory human approval,
- high availability requirements,
- irreversible external actions,
- workload variability,
- regulatory boundaries,
- strong isolation requirements,
- significant coordination requirements,
- or a need for independent specialization.

For example:

```text
Requirement:
The system must support multiple languages.

Potential impact:
Model and data choices may change,
but the overall architecture may remain similar.
```

Compared with:

```text
Requirement:
Irreversible financial actions require human approval.

Potential impact:
Approval placement, execution boundaries,
state handling, failure recovery, and
action authorization become architectural concerns.
```

Architecture drivers should therefore receive disproportionate attention during architecture selection.

A useful reasoning model is:

```text
Requirements
     ↓
Which requirements materially affect architecture?
     ↓
Architecture Drivers
     ↓
Candidate Architecture Evaluation
```

This prevents architecture discussions from becoming dominated by requirements that do not meaningfully differentiate the available designs.

---

## 6. Workload Characteristics

Architecture should reflect the characteristics of the workload.

Important questions include:

### Is the task deterministic?

If the same input should consistently follow the same sequence of operations, deterministic workflow logic may be preferable.

### Is the task variable?

If the next action depends on changing context, unstructured input, or model-based interpretation, some degree of model-driven decision-making may be justified.

### Is the task bounded?

A bounded task has clear:

- inputs,
- outputs,
- permitted actions,
- termination conditions,
- and operating boundaries.

Bounded tasks are generally easier to control.

### Is the task open-ended?

Open-ended tasks may require more flexible reasoning or planning, but this flexibility introduces additional uncertainty and control requirements.

### Does the task require autonomy?

Autonomy should be treated as a requirement, not as a default property of an agent system.

Ask:

> What decisions must the system make without human intervention?

Then ask:

> Why must those decisions be autonomous?

If autonomy does not provide meaningful value, it may not belong in the architecture.

---

## 7. Architecture Selection Dimensions

Architecture selection should consider multiple dimensions together.

### Task Complexity

Consider:

- number of steps,
- decision complexity,
- branching,
- uncertainty,
- dependencies,
- required reasoning,
- and exception frequency.

### Determinism

How predictable is the required execution path?

Highly deterministic problems often benefit from explicit workflows.

More variable problems may justify model-driven decisions.

### Autonomy

How much independent decision-making is actually required?

Do not confuse:

```text
Capability
```

with:

```text
Authority
```

A system may have the capability to perform an action without being authorized to perform it autonomously.

### Latency

Consider:

- model-call count,
- sequential dependencies,
- coordination,
- tool latency,
- human approval latency,
- external API latency.

Architecture affects latency structurally.

### Cost

Consider:

- model calls,
- token consumption,
- tool usage,
- infrastructure,
- orchestration,
- persistence,
- observability,
- and human intervention.

A more complex architecture can increase cost even when each individual component is inexpensive.

### Reliability

Consider:

- dependency failures,
- model failures,
- tool failures,
- state failures,
- partial completion,
- retries,
- recovery,
- and termination.

Reliability requirements may justify architectural controls that would otherwise appear unnecessary.

### Safety

Consider:

- action authority,
- sensitive data,
- external side effects,
- untrusted input,
- approval requirements,
- containment,
- and safe failure.

Safety constraints can eliminate otherwise attractive architecture options.

### Human Control

Ask:

- Which actions require approval?
- Where should approval occur?
- What happens if approval is rejected?
- What happens if approval times out?
- Can execution resume safely?

The architecture should make human control explicit where required.

### State and Memory

Determine what information must persist across:

- steps,
- requests,
- sessions,
- retries,
- workflows,
- and users.

Do not automatically assume that every agent requires long-term memory.

### Tools and Integrations

Ask:

- Which external capabilities are actually required?
- Which tools have side effects?
- Which tools are authoritative?
- Which integrations are unreliable?
- Which tools require authorization?
- Which tools can be safely combined?

Tool count should be driven by requirements, not by the desire to make an agent appear capable.

### Evaluation

Architecture should make it possible to determine whether the system is behaving correctly.

Consider:

- what behavior must be measured,
- where execution evidence exists,
- what outputs can be evaluated,
- what failures need regression coverage,
- and where evaluation integrates with the development lifecycle.

Detailed evaluation methodology belongs to AGT-10.

### Operational Requirements

Architecture should account for:

- observability,
- debugging,
- deployment,
- scaling,
- versioning,
- rollback,
- incident response,
- ownership,
- and maintenance.

These concerns should influence architecture before implementation rather than being treated as post-deployment additions.

---

## 8. Architectural Alternatives

Agent architecture is not a maturity ladder.

Different problems justify different structures, and some problems do not require an agent at all.

The following are architectural options:

```text
                    Architecture Options
                           │
       ┌───────────────────┼───────────────────┐
       │                   │                   │
       ▼                   ▼                   ▼
   Workflow             Agent             Multi-Agent
       │                   │                   │
       ├── LLM-assisted    ├── Single       ├── Supervisor
       │                   ├── Bounded       └── Coordinated
       │                   └── Planner/
       │                       Executor
       │
       └────────────── Hybrid Workflow + Agent
```

These options should be evaluated against the same requirements.

The architecture should not be selected because one option appears more advanced.

The correct question is:

> **Which architecture satisfies the requirements with acceptable risk, complexity, cost, and operational burden?**

---

## 9. Deterministic Workflow

A deterministic workflow explicitly defines the sequence of operations.

Conceptually:

```text
Input
  ↓
Validate
  ↓
Step A
  ↓
Step B
  ↓
Step C
  ↓
Output
```

The system does not need an autonomous agent to determine the next step.

### Appropriate when

- the workflow is well understood,
- execution paths are predictable,
- business rules are explicit,
- determinism is valuable,
- auditability is important,
- and flexibility is not the primary requirement.

### Advantages

- predictable execution,
- strong control,
- easier testing,
- easier debugging,
- clearer failure handling,
- lower coordination overhead.

### Limitations

- less flexible,
- difficult to adapt to highly variable tasks,
- explicit branching can become cumbersome as uncertainty increases.

The key question is:

> **Does the problem actually require model-driven decision-making?**

If not, adding an agent may create unnecessary complexity.

---

## 10. LLM-Assisted Workflow

An LLM-assisted workflow retains explicit workflow control while using a model for bounded tasks.

For example:

```text
Input
  ↓
Workflow
  ↓
LLM: classify / extract / transform
  ↓
Workflow
  ↓
Tool or Business Logic
  ↓
Workflow
  ↓
Output
```

The workflow remains responsible for the overall execution path.

The model provides capabilities such as:

- classification,
- extraction,
- summarization,
- interpretation,
- structured generation,
- or bounded decision support.

### Appropriate when

The system needs language-model capabilities but does not require broad autonomous control.

### Advantages

- explicit orchestration,
- controlled model usage,
- easier testing,
- predictable boundaries,
- reduced autonomy risk.

### Limitations

- less flexible than a general agent,
- workflow logic may grow as variability increases,
- model decisions remain probabilistic.

This architecture is often a strong default when the problem requires an LLM but not an autonomous agent.

---

## 11. Single-Agent System

A single-agent architecture gives one agent responsibility for deciding among permitted actions.

Conceptually:

```text
User / System
      ↓
    Agent
      ↓
 ┌────┼────┐
 ↓    ↓    ↓
Tool Tool Tool
```

The agent may interpret the task, select tools, and determine the next step within defined boundaries.

### Appropriate when

- the task requires flexible decision-making,
- tool selection is dynamic,
- the decision space is manageable,
- one agent can reasonably own the task,
- and independent specialization is not required.

### Advantages

- relatively simple agent topology,
- centralized task reasoning,
- lower coordination overhead than multi-agent systems,
- easier state and execution reasoning than distributed agent topologies.

### Limitations

- potentially broad responsibility,
- growing tool sets can become difficult to control,
- complex tasks may become difficult to reason about,
- failure diagnosis may become harder as responsibilities expand.

A single agent should not automatically receive unrestricted access to every available tool.

---

## 12. Bounded Agent Loop

A bounded agent loop allows the agent to make multiple decisions while enforcing explicit execution limits.

Conceptually:

```text
Task
  ↓
Agent Decision
  ↓
Action
  ↓
Observation
  ↓
Agent Decision
  ↓
...
  ↓
Termination
```

The loop is constrained by architecture-level boundaries such as:

- maximum iterations,
- allowed tools,
- allowed actions,
- timeout,
- budget,
- termination conditions,
- approval requirements,
- and failure handling.

### Appropriate when

A task cannot be represented efficiently as a fixed workflow but requires iterative decision-making.

### Advantages

- flexibility,
- iterative problem solving,
- dynamic tool selection,
- adaptation to observations.

### Risks

- repeated model calls,
- unpredictable execution length,
- increased cost,
- more failure paths,
- harder debugging,
- possible excessive agency if boundaries are weak.

The architectural question is:

> **What bounded autonomy is actually required?**

Detailed runtime mechanics belong to AGT-02.

---

## 13. Planner / Executor Architecture

A planner/executor architecture separates planning from execution.

Conceptually:

```text
Task
  ↓
Planner
  ↓
Plan
  ↓
Executor
  ↓
Actions / Tools
  ↓
Results
  ↓
Verification / Replanning
```

The separation can provide clearer responsibility boundaries.

### Appropriate when

- tasks require explicit decomposition,
- plans need to be inspected or modified,
- execution and planning have different responsibilities,
- or planning needs to be reused across execution steps.

### Potential advantages

- clearer separation of responsibilities,
- explicit plans,
- easier inspection of intended execution,
- potential for plan-level validation.

### Costs

- additional model calls,
- additional state,
- plan/execution synchronization,
- more failure modes,
- stale plans,
- increased latency and cost.

A planner is not automatically required because a task is complex.

The architecture should justify the separation.

Detailed planning mechanics belong to AGT-05.

---

## 14. Supervisor Architecture

A supervisor architecture introduces a coordinating component that delegates work to specialized agents or workers.

Conceptually:

```text
                 Supervisor
                /    |     \
               /     |      \
          Agent A  Agent B  Agent C
```

The supervisor may determine:

- which specialist handles a task,
- what information is passed,
- when work is complete,
- and whether additional coordination is required.

### Appropriate when

- responsibilities are genuinely specialized,
- delegation provides meaningful value,
- specialists have distinct capabilities,
- or independent execution boundaries are required.

### Costs

- coordination,
- communication,
- state synchronization,
- additional failure paths,
- more difficult observability,
- more complex testing,
- additional operational overhead.

The presence of multiple responsibilities does not automatically justify multiple agents.

Sometimes separate modules, services, or deterministic workflow steps provide the same benefit with lower complexity.

---

## 15. Multi-Agent Architecture

A multi-agent architecture distributes responsibilities across multiple agents.

Possible structures include:

```text
Supervisor
   ├── Specialist A
   ├── Specialist B
   └── Specialist C
```

or:

```text
Agent A ←→ Agent B
   ↑          ↓
   └── Agent C
```

The exact topology should follow the coordination requirements.

### Multi-agent architecture may be justified when

- responsibilities require genuine specialization,
- independent agent boundaries provide value,
- agents need different capabilities or policies,
- parallelism provides meaningful benefit,
- organizational or security boundaries require separation,
- or coordination itself is a requirement.

### Multi-agent architecture should not be selected merely because

- the task is complex,
- the technology supports multiple agents,
- multiple prompts are easier to organize as agents,
- or multi-agent systems appear more sophisticated.

The key principle is:

> **Multi-agent is an architectural choice, not a maturity requirement.**

Detailed delegation, supervision, communication, state, and termination mechanics belong to AGT-09.

---

## 16. Hybrid Workflow + Agent Architecture

Many production systems are neither purely workflow-driven nor purely agent-driven.

A hybrid architecture may combine explicit workflow control with bounded agent capabilities.

For example:

```text
                Workflow
                   |
        +----------+----------+
        |                     |
   Deterministic          Agent
      Step                 Step
        |                     |
     Business             Tool /
       Logic             Decision
        |                     |
        +----------+----------+
                   |
                Workflow
                   |
                 Output
```

This allows deterministic parts of the system to remain explicitly controlled while using agents where flexibility provides genuine value.

### Appropriate when

- some stages are deterministic,
- some stages require model-driven decisions,
- high-risk operations require explicit control,
- human approval must occur at defined points,
- or different parts of the problem have different architectural characteristics.

Hybrid architecture should not become an excuse to include every possible mechanism.

Each component still requires justification.

---

## 17. Do Not Use an Agent When Requirements Do Not Justify One

Architecture selection must include the option of **not introducing an agent**.

A system may involve GenAI without requiring agentic autonomy.

The decision can be framed as:

```text
Does the problem require model interpretation?
              │
             Yes
              ↓
Does it require dynamic decision-making?
              │
       ┌──────┴──────┐
       No            Yes
       ↓              ↓
LLM-assisted       Does it require
workflow           autonomous action?
                       │
                  ┌────┴────┐
                  No        Yes
                  ↓          ↓
             LLM-assisted   Agent
               workflow
```

This is not a maturity progression. It is a set of requirement questions.

If the task is deterministic and requires neither model interpretation nor autonomous decision-making, an agent may not be justified at all.

For example:

```text
Requirement
    ↓
Apply deterministic business rules
    ↓
Calculate result
    ↓
Persist result
```

may require no LLM or agent.

The engineering objective is not to maximize agent usage.

It is to solve the problem with the **minimum sufficient architecture**.

---

## 18. Hard Constraints vs Optimization Criteria

Not every architecture-selection dimension should be treated equally.

Some requirements are **hard constraints**.

Others are **optimization criteria**.

### Hard Constraints

A candidate architecture should be rejected if it violates a hard constraint.

Examples:

- regulatory boundary,
- maximum permitted latency,
- required availability,
- data residency,
- mandatory human approval,
- maximum operating budget,
- prohibited external actions.

Conceptually:

```text
Candidate Architecture
        ↓
Hard Constraint Check
        ↓
   ┌────┴────┐
   ↓         ↓
 Pass       Fail
   ↓         ↓
Compare     Reject
```

### Optimization Criteria

Among architectures that satisfy hard constraints, compare trade-offs such as:

- lower cost,
- lower latency,
- easier debugging,
- simpler operations,
- greater flexibility,
- easier evolution,
- better maintainability.

This produces a disciplined decision process:

```text
Requirements
      ↓
Hard Constraints
      ↓
Candidate Architectures
      ↓
Reject Violating Options
      ↓
Optimization Criteria
      ↓
Trade-off Analysis
      ↓
Architecture Decision
```

This distinction prevents an architecture with excellent flexibility or low cost from being selected when it violates a non-negotiable safety or reliability requirement.

---

## 19. Compare Alternatives Explicitly

Architecture decisions should compare meaningful alternatives rather than evaluating only the preferred design.

For example:

| Dimension | Deterministic Workflow | Single Agent | Multi-Agent |
|---|---|---|---|
| Predictability | High | Lower | Lower |
| Flexibility | Lower | High | High |
| Coordination cost | Low | Low–Medium | High |
| Debuggability | Usually easier | Moderate | Usually harder |
| Failure surface | Smaller | Larger | Larger |
| Specialization | Low | Moderate | High |
| Operational overhead | Lower | Moderate | Higher |
| Latency | Often lower | Variable | Potentially higher |
| Cost | Often lower | Variable | Potentially higher |
| Control complexity | Lower | Moderate | Higher |

These are directional tendencies, not universal laws.

A well-designed multi-agent system can outperform a poorly designed single-agent system.

A deterministic workflow can also outperform an agent architecture even when the task initially appears complex.

The comparison must therefore be tied to the actual system requirements.

---

## 20. Trade-offs and Complexity Budget

Architectural decisions create trade-offs.

The key question is:

> **What capability or requirement does the added complexity buy us?**

### Complexity Is Multidimensional

Architectural complexity is not simply the number of components.

It can arise from:

- component count,
- coordination,
- state boundaries,
- behavioral uncertainty,
- failure paths,
- interfaces,
- security boundaries,
- deployment topology,
- data dependencies,
- operational ownership,
- and versioning.

Therefore:

> **Component count is only one proxy for architectural complexity.**

### Complexity Budget

Every architecture has a practical complexity budget.

Additional architectural elements can introduce:

- failure modes,
- interfaces,
- state boundaries,
- latency sources,
- security boundaries,
- operational responsibilities,
- debugging paths,
- versioning concerns,
- deployment dependencies,
- and testing requirements.

For every additional component, ask:

1. What requirement justifies it?
2. What capability does it add?
3. What responsibility does it own?
4. What new interface does it create?
5. What new failure mode does it create?
6. What new state boundary does it create?
7. What new operational responsibility does it create?
8. What additional latency or cost does it introduce?
9. How will it be tested?
10. How will it be removed or replaced later?

If these questions cannot be answered, the component may not have sufficient architectural justification.

---

## 21. Architecture Selection Process

Architecture selection should be treated as a structured decision process rather than pattern matching.

### Step 1 — Define the Problem

Describe:

- desired outcome,
- users,
- inputs,
- outputs,
- decisions,
- actions,
- external dependencies,
- consequences of failure.

### Step 2 — Identify Requirements

Separate:

- functional requirements,
- non-functional requirements,
- constraints,
- assumptions.

### Step 3 — Identify Architecture Drivers

Determine which requirements materially affect architecture.

Examples:

- autonomy,
- determinism,
- latency,
- safety,
- reliability,
- workload variability,
- human control,
- specialization,
- state,
- integration complexity.

### Step 4 — Establish Hard Constraints

Identify requirements that eliminate architecture options when violated.

### Step 5 — Generate Candidate Architectures

Consider only architectures that could realistically satisfy the problem.

Candidates may include:

- deterministic workflow,
- LLM-assisted workflow,
- single agent,
- bounded agent,
- planner/executor,
- supervisor,
- multi-agent,
- hybrid.

### Step 6 — Compare Candidates

Evaluate:

- requirement fit,
- risk,
- complexity,
- latency,
- cost,
- operational burden,
- maintainability,
- evolvability.

### Step 7 — Challenge the Complexity

For every added mechanism ask:

> Why does this need to exist?

Then ask:

> What happens if we remove it?

### Step 8 — Select the Minimum Sufficient Architecture

Choose the smallest architecture that:

- satisfies hard constraints,
- satisfies important requirements,
- provides acceptable risk,
- and does not introduce unjustified complexity.

### Step 9 — Record the Decision

Use an ADR when the decision is significant or likely to be revisited.

### Step 10 — Identify Validation Needs

Identify assumptions that must be validated before implementation or production deployment.

This produces:

```text
Problem
   ↓
Requirements
   ↓
Constraints
   ↓
Architecture Drivers
   ↓
Candidate Architectures
   ↓
Hard Constraint Filtering
   ↓
Trade-offs
   ↓
Complexity + Risk Review
   ↓
Minimum Sufficient Architecture
   ↓
ADR
   ↓
Validation
```

---

## 22. Architecture Assumptions

Architecture decisions often depend on assumptions.

For example:

```text
Assumption:
The external payment API responds within 500 ms.

Decision:
Sequential tool execution is acceptable.

Risk:
If latency increases significantly, end-to-end latency
may exceed the system requirement.
```

Another example:

```text
Assumption:
Human approval is available within 30 seconds.

Decision:
High-risk actions may pause for approval.

Risk:
Approval delays may cause workflow timeout or
partial completion.
```

Assumptions should be made explicit because unexamined assumptions can become hidden architectural dependencies.

A useful distinction is:

```text
Requirement
    ↓
Decision
    ↓
Assumption
    ↓
Validation
```

If an assumption is critical to architecture fitness, it should eventually be validated.

---

## 23. Architecture Decision Records

Architecture decisions should be documented, especially when meaningful alternatives were rejected.

An Architecture Decision Record (ADR) should capture:

- context,
- problem,
- options considered,
- decision,
- rationale,
- trade-offs,
- consequences,
- assumptions,
- rejected alternatives.

A concise ADR can look like:

```text
# ADR: Use a Bounded Single-Agent Architecture

## Context

The system must handle variable customer requests and select
among several approved tools.

## Problem

A deterministic workflow cannot efficiently represent the
variable decision paths.

## Options

1. Deterministic workflow
2. Bounded single agent
3. Multi-agent architecture

## Decision

Use a bounded single-agent architecture.

## Rationale

The system requires flexible tool selection but does not require
independent specialization or parallel agent coordination.

## Trade-offs

Benefits:
- lower coordination overhead,
- simpler state model,
- easier debugging.

Costs:
- broader responsibility within the agent,
- increased need for tool and action boundaries.

## Assumptions

- the available tool set remains within a manageable scope,
- task complexity remains within the agent's operating boundary.

## Rejected Alternatives

Deterministic workflow:
Insufficient flexibility for variable decision paths.

Multi-agent:
Additional coordination and operational complexity are not
justified by current requirements.
```

The purpose of an ADR is not to create paperwork.

It preserves the reasoning behind an architectural decision so that future engineers can understand:

> **Why was this architecture chosen?**

---

## 24. ADRs Should Capture Decisions, Not Implementation Noise

An ADR should focus on decisions that materially affect architecture.

Good ADR topics include:

- single-agent vs multi-agent,
- workflow vs agent,
- synchronous vs asynchronous execution,
- centralized vs distributed state ownership,
- approval placement,
- service boundary selection,
- model-routing architecture,
- persistence strategy,
- protocol boundary,
- control-plane separation.

Avoid filling ADRs with details that belong in implementation documentation.

The goal is to preserve **architectural reasoning**.

---

## 25. When to Revisit an Architecture Decision

Architecture decisions are not permanent.

Revisit an architecture when important assumptions or requirements change.

Examples:

```text
Workload increases significantly
        ↓
Latency requirement changes
        ↓
New safety requirement
        ↓
New external integration
        ↓
New regulatory constraint
        ↓
Model capabilities change
        ↓
Cost profile changes
        ↓
Failure pattern changes
        ↓
Architecture may need reconsideration
```

A good architecture should therefore be **evolvable**.

The existence of an ADR makes this easier because engineers can identify:

- original assumptions,
- rejected alternatives,
- intended trade-offs,
- and conditions that may invalidate the decision.

---

## 26. Architecture Selection Examples

### Example 1 — Customer Support Resolution

Consider a support system with:

```text
Requirements
├── Classify incoming requests
├── Retrieve customer information
├── Resolve low-risk requests
├── Execute approved account actions
├── Escalate high-risk requests
└── Maintain an audit trail
```

An initial proposal might be:

```text
Multi-Agent System
├── Classification Agent
├── Retrieval Agent
├── Resolution Agent
├── Action Agent
└── Escalation Agent
```

The architecture should not be accepted merely because responsibilities can be represented as agents.

Ask:

- Does classification require independent autonomy?
- Does retrieval require an agent or can it be a tool?
- Does action execution require an agent or a controlled service?
- Is the resolution process genuinely variable?
- Where does human approval occur?
- Who owns state?
- How are failures handled?
- What coordination does the multi-agent design actually provide?

An alternative may be:

```text
                  Workflow
                     |
          +----------+----------+
          |                     |
     Classification        Resolution
          |                     |
       Retrieval              Agent
                                |
                           Approved Tools
                                |
                           Human Approval
                                |
                           Action Service
```

This may provide the required flexibility while retaining explicit control over high-risk actions.

The important lesson is not that the hybrid architecture is always better.

The lesson is that **architecture must be justified by requirements rather than component fashion**.

---

### Example 2 — Research Assistant

Suppose the system must:

- interpret a research question,
- search multiple information sources,
- decide which sources to investigate,
- gather evidence,
- revise the search strategy,
- and produce a synthesized answer.

A deterministic workflow may become cumbersome because the next search depends on observations.

A bounded agent architecture may therefore be justified:

```text
Question
   ↓
Agent
   ↓
Search Tool
   ↓
Observation
   ↓
Agent Decision
   ↓
Search / Retrieve / Verify
   ↓
Bounded Termination
   ↓
Answer
```

However, a multi-agent design is not automatically required.

If one agent can perform the task within acceptable:

- latency,
- cost,
- reliability,
- and safety boundaries,

then introducing multiple agents may add complexity without sufficient benefit.

---

## 27. Common Architecture Selection Mistakes

### 27.1 Framework-First Design

```text
We use framework X.
Therefore we should build architecture Y.
```

Problem:

The framework becomes the architectural driver.

Better:

```text
Requirements
   ↓
Architecture
   ↓
Framework
```

---

### 27.2 Multi-Agent by Default

```text
Complex problem
      ↓
Multiple agents
```

Problem:

Complexity is being used as evidence for multi-agent architecture without identifying the required specialization or coordination.

Better:

> Identify the exact requirement that requires independent agent boundaries.

---

### 27.3 Agent-for-Deterministic-Work

A deterministic business process is implemented as an autonomous agent simply because an LLM is available.

Problem:

- less predictable,
- harder to test,
- potentially more expensive,
- larger failure surface.

Better:

Use explicit workflow logic unless model-driven behavior provides meaningful value.

---

### 27.4 Tool Explosion

Giving an agent a large collection of tools because they are available.

Problem:

- larger decision space,
- increased tool-selection errors,
- greater safety surface,
- more difficult evaluation,
- more difficult debugging.

Better:

Provide the smallest capability set required by the task.

---

### 27.5 Architecture-by-Diagram

A visually impressive architecture diagram is treated as evidence of a good design.

Problem:

A diagram does not establish:

- requirements fit,
- failure behavior,
- safety,
- latency,
- cost,
- or operational feasibility.

Better:

Use diagrams to communicate decisions, then validate the assumptions behind them.

---

### 27.6 Complexity as Maturity

```text
More components
    =
More mature architecture
```

False.

Architecture maturity is better associated with:

- clear requirements,
- explicit decisions,
- justified complexity,
- controlled risk,
- validated assumptions,
- operational readiness,
- and evolvability.

---

### 27.7 Flexibility Without Boundaries

A highly flexible architecture is treated as automatically superior.

Problem:

Flexibility can increase:

- uncertainty,
- complexity,
- cost,
- failure surface,
- and control difficulty.

Better:

> Optimize for required flexibility, not maximum flexibility.

---

### 27.8 Assuming Every Agent Needs Memory

Memory is added because the system is called an agent.

Problem:

Memory introduces:

- persistence,
- retrieval,
- staleness,
- privacy,
- lifecycle,
- and correctness concerns.

Better:

Add memory only when the requirements justify it.

Detailed memory concepts belong to AGT-04.

---

## 28. Architecture Selection Review Checklist

Before finalizing an architecture, verify:

### Problem and Requirements

- [ ] Problem is clearly defined.
- [ ] Desired outcome is explicit.
- [ ] Functional requirements are documented.
- [ ] Important non-functional requirements are documented.
- [ ] Architectural constraints are identified.
- [ ] Critical assumptions are explicit.
- [ ] Architecture drivers are identified.

### Architecture Fit

- [ ] Candidate architecture satisfies functional requirements.
- [ ] Candidate architecture satisfies important non-functional requirements.
- [ ] Autonomy is justified.
- [ ] Agent usage is justified.
- [ ] Multi-agent usage is justified if present.
- [ ] Human control requirements are represented.
- [ ] State and memory requirements are represented.
- [ ] Tool and integration requirements are represented.

### Constraints and Trade-offs

- [ ] Hard constraints are identified.
- [ ] Options violating hard constraints are rejected.
- [ ] Optimization criteria are explicit.
- [ ] Meaningful alternatives were compared.
- [ ] Trade-offs were documented.
- [ ] Additional complexity has explicit justification.
- [ ] Minimum sufficient architecture has been considered.

### Complexity and Risk

- [ ] Major components have clear responsibilities.
- [ ] Coordination costs are understood.
- [ ] Failure surface is understood.
- [ ] State boundaries are understood.
- [ ] Latency and cost impacts are considered.
- [ ] Operational overhead is understood.
- [ ] Safety and reliability implications are considered.

### Decision Quality

- [ ] The architecture can be explained without relying on a framework.
- [ ] Important assumptions have validation plans.
- [ ] Significant decisions are recorded.
- [ ] Rejected alternatives are documented where appropriate.
- [ ] Conditions that could trigger architectural reconsideration are known.

---

## 29. Key Principles

### Principle 1 — Requirements Before Architecture

Do not choose architecture before understanding the problem and its constraints.

### Principle 2 — Architecture Before Framework

Framework capabilities should implement architectural decisions, not create them.

### Principle 3 — Choose the Minimum Sufficient Architecture

Select the smallest architecture that satisfies important requirements, hard constraints, and acceptable risk boundaries.

### Principle 4 — Complexity Requires Justification

Every additional architectural component should provide meaningful capability or satisfy a real requirement.

### Principle 5 — Autonomy Must Be Earned

Do not introduce autonomous decision-making where deterministic control is sufficient.

### Principle 6 — Multi-Agent Is Optional

Multiple agents are justified by specialization or coordination requirements, not by architectural fashion.

### Principle 7 — Hard Constraints Come First

An architecture that violates a non-negotiable requirement should not survive the trade-off comparison.

### Principle 8 — Trade-offs Are Contextual

No architecture is universally superior.

### Principle 9 — Assumptions Must Be Visible

Hidden assumptions become hidden architectural risks.

### Principle 10 — Decisions Should Be Recorded

Important architecture decisions should preserve their rationale and rejected alternatives.

### Principle 11 — Architecture Must Be Evolvable

A good architecture should remain understandable and adaptable as requirements and assumptions change.

---

## 30. Architecture Selection Mental Model

The complete reasoning process can be summarized as:

```text
                PROBLEM
                   ↓
             REQUIREMENTS
                   ↓
       CONSTRAINTS + ASSUMPTIONS
                   ↓
        ARCHITECTURE DRIVERS
                   ↓
         ARCHITECTURE OPTIONS
                   ↓
          HARD CONSTRAINTS
                   ↓
          TRADE-OFF ANALYSIS
                   ↓
       COMPLEXITY + RISK REVIEW
                   ↓
       MINIMUM SUFFICIENT DESIGN
                   ↓
                  ADR
                   ↓
              VALIDATION
```

The important point is that architecture selection is not:

```text
Choose Pattern
      ↓
Implement
```

It is:

```text
Understand
    ↓
Compare
    ↓
Challenge
    ↓
Justify
    ↓
Decide
    ↓
Validate
```

---

## 31. Connection to the Next File

Architecture selection answers:

> **Which architecture should we choose, and why?**

The next file addresses:

> **How should the selected architecture be composed into a complete end-to-end agent system?**

That requires moving from architectural choice into:

- component responsibilities,
- interfaces,
- execution boundaries,
- control boundaries,
- state and data ownership,
- tools,
- workflows,
- human control,
- safety,
- evaluation,
- observability,
- failure paths,
- and production integration.

These topics belong to:

[`02-End-to-End-Agent-System-Design.md`](./02-End-to-End-Agent-System-Design.md)

---

## 32. Summary

Agent architecture selection is fundamentally a **requirements, constraints, and trade-off problem**.

A strong architecture:

- starts with the problem,
- derives requirements,
- identifies architecture drivers,
- establishes hard constraints,
- exposes assumptions,
- evaluates workload characteristics,
- compares viable alternatives,
- makes complexity explicit,
- considers risk,
- selects the minimum sufficient architecture,
- records important decisions,
- and validates the assumptions behind the decision.

The goal is not maximum autonomy, maximum flexibility, or maximum architectural sophistication.

The goal is:

> **A defensible architecture whose capabilities, controls, complexity, risks, and operational costs are justified by the requirements it must satisfy.**
