# 03 — Multi-Agent State, Communication, Failure, and Termination

## Learning Objectives

After completing this chapter, you should be able to:

- Explain why state becomes an architectural concern when multiple agents participate in the same objective.
- Distinguish local agent state, shared state, and coordination state.
- Explain state ownership and why unclear ownership creates inconsistency.
- Understand synchronization problems such as stale, conflicting, or partially updated state.
- Explain how agents communicate through messages, shared state, queues, APIs, or other coordination mechanisms.
- Reason about message delivery, ordering, duplication, delay, and loss.
- Identify partial failures in multi-agent systems.
- Understand how unavailable or failed agents affect dependent agents and overall progress.
- Explain conflicting outputs and disagreement between agents.
- Identify failure propagation, cascading failures, deadlock, and livelock at the multi-agent coordination level.
- Understand isolation and degraded operation as architectural responses to failure.
- Design bounded termination behavior for multi-agent execution.
- Identify orphaned tasks, incomplete coordination, shutdown races, and termination failures.
- Evaluate trade-offs between consistency, availability, coordination overhead, latency, and reliability.
- Diagnose common multi-agent state and communication failures in production systems.

---

## Prerequisites

Before reading this chapter, you should understand:

- **AGT-01 — Agent Foundations**
- **AGT-02 — Agent Runtime and Execution**
- **AGT-03 — Tools and Capabilities**
- **AGT-04 — Agent State, Context, and Memory**
- **AGT-05 — Task Decomposition and Planning**
- **AGT-06 — Workflow Patterns and Durable Execution**
- **AGT-07 — Human-in-the-Loop and Intervention**
- **AGT-08 — Agent Interoperability**

You should also have completed:

- **AGT-09-01 — Single-Agent vs Multi-Agent Architecture**
- **AGT-09-02 — Delegation, Supervision, and Agent Coordination**

This chapter assumes that the decision to use multiple agents has already been made and focuses on what happens when those agents must maintain state, communicate, handle failure, and eventually terminate.

---

## Estimated Reading Time

**35–45 minutes**

---

## Before We Start

A multi-agent system is not simply several independent agents running at the same time.

Once multiple agents participate in the same objective, the system must answer questions such as:

- What does each agent know?
- Which state belongs to which agent?
- Which information must be shared?
- How is shared state synchronized?
- What happens if a message arrives late?
- What happens if the same message arrives twice?
- What happens if an agent becomes unavailable?
- What happens when two agents produce incompatible results?
- What happens when one failed agent blocks several others?
- How does the system know when the overall objective is complete?
- What happens to work that is still running when termination begins?

These are not merely implementation details.

They are architectural concerns.

The central idea of this chapter is:

> **Multiple agents create multiple state holders, communication paths, failure boundaries, and termination responsibilities.**

Therefore, multi-agent architecture must define not only **who does what**, but also **what information exists, who owns it, how it moves, how failure is contained, and how the system reaches a valid end state**.

---

## Why This Exists

In a single-agent system, state is often relatively easy to reason about.

For example:

```text
User Request
     │
     ▼
   Agent
     │
 ┌───┼────┐
 ▼   ▼    ▼
State Context Tools
```

The agent may have:

- conversation state,
- working context,
- intermediate results,
- tool results,
- execution status.

The state may still be complicated, but ownership is comparatively centralized.

Now consider a multi-agent system:

```text
                 ┌───────────────┐
                 │ Coordinator   │
                 └───────┬───────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
   ┌────────────┐ ┌────────────┐ ┌────────────┐
   │ Research   │ │ Analysis   │ │ Validation │
   │ Agent      │ │ Agent      │ │ Agent      │
   └─────┬──────┘ └─────┬──────┘ └─────┬──────┘
         │              │              │
         └──────────────┼──────────────┘
                        ▼
                 Shared Objective
```

Now the system must reason about:

- local state,
- shared state,
- coordination state,
- message delivery,
- synchronization,
- dependencies,
- failure,
- partial completion,
- disagreement,
- termination.

The architecture has become a coordination system.

That is why state, communication, failure, and termination need explicit design.

---

# Mental Model

A useful mental model is:

```text
                 MULTI-AGENT SYSTEM
                        │
        ┌───────────────┼────────────────┐
        ▼               ▼                ▼
      STATE        COMMUNICATION       EXECUTION
        │               │                │
        │               │                │
        ▼               ▼                ▼
   What is known?   What moves?     What can fail?
   Who owns it?     When does it?   What depends on it?
   Is it current?   Can it be lost?  How is it contained?
        │               │                │
        └───────────────┼────────────────┘
                        ▼
                   TERMINATION
                        │
                        ▼
              When is the system done?
```

The important relationship is:

> **State determines what agents believe. Communication determines how that knowledge changes. Failure determines what can become unavailable or inconsistent. Termination determines when the system stops accepting or producing work.**

---

# Core Concepts

## 1. Multi-Agent State

State is information that influences the current or future behavior of the system.

In a multi-agent architecture, state can exist at several levels.

A useful classification is:

```text
Multi-Agent State
│
├── Local Agent State
│
├── Shared State
│
└── Coordination State
```

These categories should not automatically be treated as the same thing.

---

## 2. Local Agent State

Local agent state belongs primarily to one agent.

Examples include:

- current reasoning context,
- temporary working variables,
- intermediate observations,
- agent-specific execution status,
- locally generated candidate results,
- local task progress.

For example:

```text
Research Agent
     │
     ├── current query
     ├── retrieved evidence
     ├── intermediate findings
     └── local execution state
```

Another agent does not necessarily need direct access to all of this information.

### Why local state matters

Keeping state local can provide:

- isolation,
- reduced communication,
- smaller context,
- clearer ownership,
- reduced coupling.

However, excessive local state can also make coordination difficult when another agent needs information that is not exposed through an appropriate mechanism.

---

# 3. Shared State

Shared state is information intentionally accessible to multiple agents or coordination components.

Examples:

- task status,
- shared candidate set,
- workflow status,
- common objective metadata,
- shared results,
- coordination records,
- resource reservations.

For example:

```text
              Shared State
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
     Agent A    Agent B    Agent C
```

Shared state can simplify coordination because agents do not always need to send every piece of information directly to each other.

But it introduces another problem:

> **Who is allowed to modify the state, and what happens when multiple participants update it?**

This is where ownership and synchronization become important.

---

# 4. Coordination State

Coordination state describes the progress and relationships between participating agents.

Examples include:

- task assigned to Agent A,
- Agent A completed its task,
- Agent B is waiting for Agent A,
- validation is pending,
- two results are available,
- coordinator is waiting for quorum,
- shutdown has been requested.

For example:

```text
Task
 │
 ├── Research → completed
 │
 ├── Analysis → completed
 │
 ├── Validation → waiting
 │
 └── Finalization → blocked
```

This state is different from an individual agent's internal reasoning state.

It exists primarily to answer:

> **What is the multi-agent system currently doing?**

---

# 5. State Ownership

Every important piece of state should have an identifiable owner.

Ownership does not necessarily mean that only one component can read the state.

It means that the architecture defines who is authoritative for its lifecycle and updates.

For example:

```text
Agent A
  │
  └── owns research result

Coordinator
  │
  └── owns task assignment status

Agent B
  │
  └── owns analysis result
```

A dangerous design looks like this:

```text
Agent A ─────┐
Agent B ─────┼──> Shared State
Agent C ─────┘
```

with no clear ownership rules.

The result can become:

- conflicting updates,
- accidental overwrites,
- stale reads,
- ambiguous authority,
- difficult debugging.

### Engineering principle

> **Shared visibility does not require shared ownership.**

A system can allow many agents to read a state while maintaining one authoritative owner for updates.

---

# 6. State Synchronization

When multiple agents depend on related state, they need a mechanism for observing compatible versions of that state.

Synchronization can occur through:

- explicit messages,
- state stores,
- event streams,
- queues,
- database transactions,
- coordination services,
- versioned records,
- orchestration mechanisms.

The important question is not:

> "Is the state shared?"

The important question is:

> **"How does an agent know whether the state it is using is current enough for the decision it is making?"**

---

## 7. Stale State

An agent can operate on information that was previously correct but is no longer current.

Example:

```text
Agent A reads:
Task Status = AVAILABLE

Agent B claims task.

Agent A still believes:
Task Status = AVAILABLE
```

Agent A now acts on stale information.

Possible consequences include:

- duplicate work,
- conflicting updates,
- invalid assumptions,
- incorrect decisions,
- resource contention.

Stale state is especially dangerous when the system treats an old observation as authoritative.

---

# 8. Inconsistent State

Inconsistent state occurs when different participants have incompatible views of system state.

Example:

```text
Coordinator:
Task = completed

Worker:
Task = still running
```

The problem is not necessarily that one component is "wrong."

The architecture may simply lack a reliable mechanism for establishing which state is authoritative.

---

# 9. State Versioning

One useful technique for detecting stale updates is versioning.

Example:

```text
Task Record

version: 7
status: processing
owner: agent-a
```

Agent B reads version 7.

Meanwhile, another component updates the record:

```text
version: 8
status: completed
```

Agent B later attempts to write using its old version.

The system can detect:

```text
Expected version: 7
Current version: 8
```

and reject or reconcile the stale update.

The exact implementation depends on the storage and coordination architecture.

The important principle is:

> **State transitions should be distinguishable from stale observations.**

---

# 10. Communication Between Agents

Agents need mechanisms to exchange information.

Communication can take many forms:

```text
Direct Call
    │
Message Queue
    │
Event
    │
Shared State
    │
Internal RPC
    │
API
    │
Message Bus
    │
Protocol-Based Communication
```

The architectural question is not simply:

> "How do agents communicate?"

It is:

> **"What communication mechanism provides the reliability, ordering, visibility, coupling, and latency characteristics required by this coordination relationship?"**

Detailed interoperability protocols such as MCP and A2A belong to **AGT-08** and are not re-taught here.

---

# 11. Message Semantics

When agents communicate through messages, several properties matter.

A message may be:

- delivered,
- delayed,
- duplicated,
- reordered,
- lost,
- rejected,
- processed successfully,
- processed unsuccessfully.

Consider:

```text
Agent A
   │
   │ Message 1
   ▼
Agent B
```

The architecture must consider what happens if:

```text
Message 1
   │
   ├── arrives once
   ├── arrives twice
   ├── arrives late
   ├── arrives out of order
   └── never arrives
```

These are architectural concerns even when the underlying messaging technology handles some of them.

---

# 12. Message Duplication

Suppose Agent A sends:

```text
"Create report"
```

The message is processed successfully by Agent B.

But the acknowledgment is lost.

Agent A assumes the request failed and sends it again.

Agent B may receive:

```text
Create report
Create report
```

If processing is not designed to tolerate duplicates, the system may create duplicate work or duplicate side effects.

Therefore, the system may need:

- request identifiers,
- deduplication,
- idempotent processing,
- processing records,
- explicit completion state.

The implementation details of tool side-effect idempotency belong primarily to **AGT-03**. Here, the focus is the multi-agent communication consequence.

---

# 13. Message Ordering

Suppose an agent receives:

```text
Message A:
"Start task"

Message B:
"Cancel task"
```

If the messages are processed in the opposite order:

```text
Cancel task
Start task
```

the resulting state may differ.

Therefore, systems must determine when ordering matters.

Not every message stream requires strict global ordering.

Often the correct question is:

> **What ordering guarantees does this specific coordination relationship require?**

Overly strong ordering guarantees can increase complexity and reduce throughput.

---

# 14. Delayed Messages

A message may arrive after the system has already changed state.

Example:

```text
T1:
Agent A → "Task still running"

T2:
Coordinator → cancels task

T3:
Delayed message arrives:
"Task still running"
```

The message is technically valid as an observation of an earlier state, but it may no longer be actionable.

Therefore, messages may need:

- timestamps,
- versions,
- correlation identifiers,
- expiration rules,
- current-state validation.

---

# 15. Missing Messages

A missing message can create an indefinite wait.

Example:

```text
Agent A
   │
   │ "Completed"
   X
   │
Coordinator
   │
   ▼
Waiting forever
```

This is why waiting for communication should normally have bounded conditions.

Possible mechanisms include:

- timeout,
- retry,
- fallback,
- escalation,
- degraded operation,
- cancellation.

The correct response depends on the responsibility and failure model.

---

# 16. Communication and State Are Connected

Communication and state should not be treated as unrelated concepts.

Consider:

```text
Agent A
   │
   │ completion message
   ▼
Coordinator
   │
   │ updates coordination state
   ▼
Shared State
```

If the message is lost:

```text
Agent A
   │
   X
   │
Coordinator
   │
   ▼
Old coordination state
```

The communication failure becomes a state consistency problem.

This leads to an important principle:

> **Communication changes state, and unreliable communication can therefore create incorrect or incomplete coordination state.**

---

# 17. Partial Failure

One of the defining characteristics of multi-agent systems is that one component can fail while others continue operating.

Example:

```text
              Coordinator
              /    |     \
             /     |      \
            ▼      ▼       ▼
        Agent A  Agent B  Agent C
           ✓        ✗        ✓
```

Agent B is unavailable.

The entire system may still have useful work that can continue.

This is different from total system failure.

---

# 18. Partial Failure Is an Architectural Problem

Suppose:

```text
Agent A → Research
Agent B → Analysis
Agent C → Validation
```

If Agent B fails:

```text
Research       ✓
Analysis       ✗
Validation     ?
```

The system must know:

- Which tasks depend on Agent B?
- Can another agent take over?
- Can the system continue without analysis?
- Is the analysis required for final completion?
- Should the system wait?
- Should it produce a degraded result?
- Should it terminate?

These decisions should be designed rather than left to accidental runtime behavior.

---

# 19. Agent Unavailability

An unavailable agent may be:

- crashed,
- disconnected,
- overloaded,
- intentionally stopped,
- unreachable,
- waiting indefinitely,
- unable to acquire required resources.

Importantly:

> **No response does not automatically prove that an agent has failed.**

The system may only know that a required response has not arrived within an expected time.

The same observed symptom can have different underlying causes:

```text
No response
    │
    ├── Agent execution failure
    ├── Communication failure
    ├── Processing delay
    ├── Overload
    └── Stale or incorrect coordination state
```

This distinction matters because the appropriate response may differ.

---

# 20. Timeout as a Coordination Signal

A timeout indicates that an expected event did not occur within the permitted period.

For example:

```text
Expected:
Agent B → result

Deadline:
30 seconds

Actual:
No result
```

The coordinator can then choose among policies such as:

```text
Timeout
   │
   ├── Retry
   ├── Reassign
   ├── Fallback
   ├── Escalate
   ├── Continue in degraded mode
   └── Terminate
```

The correct action depends on the task and system requirements.

A timeout should therefore be treated as **evidence about execution**, not as a universal instruction to retry.

---

# 21. Conflicting Outputs

Multiple agents may independently produce different answers.

Example:

```text
Research Agent
     │
     └── Finding A

Analysis Agent
     │
     └── Finding B

Validation Agent
     │
     └── Finding C
```

The outputs may disagree.

This is not necessarily a system failure.

It may indicate:

- different evidence,
- different assumptions,
- incomplete information,
- ambiguous requirements,
- model uncertainty,
- genuinely conflicting observations.

The architecture therefore needs a defined strategy for handling disagreement.

Possible strategies include:

- authoritative source selection,
- validation,
- additional evidence gathering,
- ranking,
- reconciliation,
- escalation,
- human review.

Consensus should not automatically be required for every decision.

---

# 22. Conflict Resolution

Conflict resolution should be based on the semantics of the task.

For example:

### Evidence task

Prefer stronger or independently verified evidence.

### Numerical task

Prefer validated computation.

### Policy decision

Prefer the authoritative policy source.

### High-risk decision

Escalate according to defined control requirements.

The important principle is:

> **Do not resolve conflicts merely by counting agent votes unless the architecture has a reason that voting is meaningful.**

---

## 23. Failure Propagation

A local failure can affect dependent agents.

Example:

```text
Agent A
   │
   ▼
Agent B
   │
   ▼
Agent C
   │
   ▼
Agent D
```

If Agent B fails:

```text
Agent A
   │
   ▼
Agent B ✗
   │
   X
   │
Agent C blocked
   │
Agent D blocked
```

The failure has propagated through dependency relationships.

This is why dependency topology matters.

A failure in an isolated specialist may have limited impact.

A failure in a central coordinator may affect nearly the entire system.

---

# 24. Cascading Failure

Cascading failure occurs when one failure causes secondary failures.

Example:

```text
Agent A slows down
       │
       ▼
Coordinator waits
       │
       ▼
Other agents remain blocked
       │
       ▼
Queues grow
       │
       ▼
Resource pressure increases
       │
       ▼
Additional agents degrade
```

The important lesson is:

> **A multi-agent architecture should be evaluated not only by individual component reliability, but also by how failures propagate through coordination relationships.**

---

# 25. Failure Containment

A well-designed system attempts to prevent one failure from unnecessarily becoming a system-wide failure.

Possible mechanisms include:

- bounded timeouts,
- isolated responsibilities,
- independent execution,
- circuit breaking,
- fallback agents,
- degraded operation,
- task cancellation,
- limited retry,
- dependency boundaries.

The specific implementation belongs to the surrounding runtime and production architecture.

The multi-agent concern is:

> **Where should failure stop?**

---

## 26. Isolation

Isolation means that failure, incorrect state, or excessive activity in one participant does not automatically compromise unrelated participants.

For example:

```text
                Coordinator
                /          \
               /            \
              ▼              ▼
        Research         Validation
           │                  │
        Failure             Healthy
           │                  │
           X                  ✓
```

If research fails, validation may still continue if the architecture permits it.

Isolation can occur at several levels:

- responsibility,
- state,
- execution,
- communication,
- failure domains.

The more strongly coupled the agents are, the harder complete isolation becomes.

---

# 27. Degraded Operation

A system does not always need to choose between:

```text
100% success
     OR
complete failure
```

It may support degraded operation.

Example:

```text
Normal:
Research + Analysis + Validation
            │
            ▼
       Full Result

Degraded:
Research + Validation
            │
            ▼
     Limited Result
```

Whether degraded operation is acceptable depends on the business and technical requirements.

A degraded result should be explicit rather than silently presenting an incomplete result as complete.

---

# 28. Failure Domains

Agents can be grouped according to how failures affect them.

Example:

```text
Failure Domain A
 ├── Agent A
 └── Agent B

Failure Domain B
 ├── Agent C
 └── Agent D
```

If Agent A and Agent B share the same infrastructure or dependency, they may fail together.

Therefore, logical agent separation does not automatically imply independent failure.

This connects to the distinction established in Lesson 01:

```text
Organizational Independence
        ≠
Runtime Independence
        ≠
Deployment Independence
        ≠
Failure Independence
```

A system designer should ask which kind of independence actually exists.

---

# 29. Deadlock

Deadlock occurs when agents wait for conditions that cannot be satisfied because of circular dependency.

Example:

```text
Agent A
   │
   │ waits for B
   ▼
Agent B
   │
   │ waits for C
   ▼
Agent C
   │
   │ waits for A
   └──────────────►
```

No participant can make progress.

Deadlock can emerge from:

- circular delegation,
- circular resource dependencies,
- blocking coordination,
- incompatible synchronization requirements,
- waiting for messages that depend on the waiting participant.

At the architecture level, useful prevention strategies include:

- avoiding circular dependencies,
- bounded waiting,
- dependency analysis,
- explicit ownership,
- timeouts,
- non-blocking coordination where appropriate.

Detailed recovery mechanisms should be designed according to the system's runtime and failure model.

---

# 30. Livelock

Livelock occurs when agents remain active but fail to make meaningful progress.

Example:

```text
Agent A → retries
Agent B → retries
Agent A → changes strategy
Agent B → changes strategy
Agent A → retries
Agent B → retries
```

The agents are not completely blocked.

They are simply failing to converge toward completion.

This is particularly dangerous because system activity may appear healthy.

A useful diagnostic question is:

> **Are agents doing work, or are they repeatedly reacting to each other without advancing the objective?**

---

# 31. Failure Propagation vs Coordination Failure

These concepts should be distinguished.

### Coordination failure

The system cannot correctly coordinate participating agents.

Example:

```text
Agent A completed
but completion was not registered.
```

### Failure propagation

One failed component causes additional components or tasks to fail or become blocked.

Example:

```text
Agent A fails
     ↓
Agent B cannot proceed
     ↓
Agent C times out
```

Coordination failure can contribute to failure propagation, but they are not identical.

---

# 32. Termination

Eventually, a multi-agent system must stop.

Termination means that the system has reached a condition where the relevant execution should no longer continue.

Possible termination conditions include:

- objective completed,
- objective failed,
- deadline exceeded,
- cancellation requested,
- unrecoverable dependency failure,
- safety or policy condition,
- resource limit reached.

Termination should be explicit.

---

## 33. Completion Is Not the Same as Termination

A system may have completed its primary task but still have active participants.

Example:

```text
Objective complete
       │
       ├── Coordinator active
       ├── Agent A active
       ├── Agent B active
       └── Background task active
```

The objective is complete, but execution has not necessarily terminated.

Therefore:

> **Completion answers "Is the objective satisfied?"**

while:

> **Termination answers "Should execution continue?"**

These questions are related but different.

---

# 34. Coordinated Termination

In a multi-agent system, termination may need coordination.

Example:

```text
Coordinator
     │
     ├── stop Agent A
     ├── stop Agent B
     ├── stop Agent C
     └── close coordination state
```

The system should define:

- who initiates termination,
- who receives the termination signal,
- what happens to active tasks,
- whether new work is accepted,
- what state is persisted,
- how completion is confirmed.

---

# 35. Orphaned Tasks

An orphaned task is work that continues without an active component responsible for its lifecycle.

Example:

```text
Coordinator
    │
    └── starts task
            │
            ▼
        Agent A
            │
            │ Agent A disappears
            ▼
       Task still running
            │
            X
       No owner
```

Orphaned work can cause:

- resource leaks,
- duplicate work,
- inconsistent state,
- unexpected side effects,
- incomplete shutdown.

Therefore, task ownership should remain identifiable throughout execution.

---

# 36. Incomplete Coordination

Termination can occur while coordination is incomplete.

Example:

```text
Research Agent ── completed
Analysis Agent ── completed
Validation Agent ── still waiting
Coordinator ────── shutdown requested
```

The system must decide whether:

- validation is cancelled,
- validation is allowed to finish,
- its result is ignored,
- the system enters degraded completion,
- termination is delayed.

There is no universal answer.

The correct behavior depends on the objective and guarantees required by the application.

---

# 37. Termination Races

Termination can race with ongoing work.

Consider:

```text
T1:
Coordinator requests shutdown.

T2:
Agent A begins producing final result.

T3:
Shutdown handler marks Agent A inactive.

T4:
Agent A sends result.
```

Now the system must decide whether the late result is:

- accepted,
- rejected,
- recorded but ignored,
- treated as stale,
- used to transition into another state.

This is why termination should be modeled as a state transition rather than treated as an instantaneous event.

---

# 38. A Multi-Agent Lifecycle

A useful simplified lifecycle is:

```text
             ┌───────────────┐
             │    Created    │
             └───────┬───────┘
                     │
                     ▼
             ┌───────────────┐
             │    Active     │
             └───────┬───────┘
                     │
          ┌──────────┼──────────┐
          │          │          │
          ▼          ▼          ▼
       Success     Failure   Cancellation
          │          │          │
          └──────────┼──────────┘
                     ▼
             ┌───────────────┐
             │  Terminating  │
             └───────┬───────┘
                     │
                     ▼
             ┌───────────────┐
             │   Terminated  │
             └───────────────┘
```

The exact states vary by architecture.

The important principle is:

> **Termination should have explicit semantics, observable state transitions, and defined completion or timeout conditions.**

---

# Internal Working

A simplified multi-agent coordination loop can be represented as:

```text
1. Create coordination state
          │
          ▼
2. Assign responsibilities
          │
          ▼
3. Start agents
          │
          ▼
4. Exchange information
          │
          ▼
5. Update coordination state
          │
          ▼
6. Detect progress / delay / failure
          │
          ▼
7. Resolve dependencies or conflicts
          │
          ▼
8. Determine whether objective is complete
          │
          ├───────────────┐
          │               │
        No               Yes
          │               │
          ▼               ▼
 Continue / Recover    Termination
          │               │
          └───────┐       │
                  ▼       ▼
               Continue / Stop
```

The important architectural point is that state, communication, and execution are coupled.

An agent cannot safely make decisions based only on its local view when the decision depends on system-level coordination state.

---

# Practical Example 1 — Parallel Research System

Consider a research system with three specialists:

```text
                Coordinator
                /    |    \
               /     |     \
              ▼      ▼      ▼
         Web Research  Database  Validation
              │          │          │
              └──────────┼──────────┘
                         ▼
                    Final Result
```

### Normal operation

```text
Research → complete
Database → complete
Validation → complete
Coordinator → aggregate
```

### Agent failure

Suppose Database Agent becomes unavailable.

The coordinator now needs to determine:

- Is database evidence mandatory?
- Can web research provide sufficient evidence?
- Can another agent perform the database responsibility?
- Should the result be marked incomplete?
- Should execution terminate?

The correct behavior comes from the architecture's requirements.

---

# Practical Example 2 — Conflicting Results

Suppose two agents produce:

```text
Agent A:
Revenue = ₹10 crore

Agent B:
Revenue = ₹12 crore
```

A naive architecture might ask another agent to simply vote.

A better architecture asks:

1. What are the sources?
2. Are both using the same time period?
3. Are the units identical?
4. Is one source authoritative?
5. Can the discrepancy be verified?

The conflict may be caused by different assumptions rather than incorrect reasoning.

The coordination architecture should therefore preserve enough context to explain the disagreement.

---

# Practical Example 3 — Lost Completion Message

Consider:

```text
Agent A
   │
   │ Task complete
   X
   │
Coordinator
   │
   ▼
Waiting
```

The coordinator does not know whether:

- Agent A failed,
- the message was lost,
- the message is delayed,
- Agent A completed successfully but acknowledgment failed.

A robust architecture can use:

```text
Timeout
   │
   ├── inspect state
   ├── retry status query
   ├── verify task state
   ├── reassign if safe
   └── escalate if required
```

The important point is that the coordinator should not blindly assume one explanation.

---

# Practical Example 4 — Cascading Failure

Consider:

```text
Coordinator
     │
     ▼
Research Agent
     │
     ▼
Analysis Agent
     │
     ▼
Validation Agent
```

If Research Agent becomes unavailable:

```text
Research ✗
    │
    ▼
Analysis blocked
    │
    ▼
Validation waiting
```

If all downstream components wait indefinitely, a local failure becomes a system-wide availability problem.

A better architecture may define:

```text
Research unavailable
        │
        ├── fallback source
        ├── alternate agent
        ├── degraded result
        └── bounded failure
```

The appropriate option depends on system requirements.

---

# Practical Example 5 — Deadlock

Suppose:

```text
Agent A needs result from B
Agent B needs approval from C
Agent C needs result from A
```

The dependency graph becomes:

```text
A → B → C → A
```

No agent can progress.

Possible architectural prevention includes:

- dependency validation,
- avoiding circular ownership,
- defining a dependency direction,
- timeout-based detection,
- asynchronous coordination where appropriate.

The important lesson is to identify circular dependencies **before** execution where possible.

---

# Practical Example 6 — Termination Race

Suppose a coordinator decides:

```text
Objective complete
```

and starts shutdown.

At nearly the same time:

```text
Validation Agent
       │
       └── produces improved result
```

The system must have a defined policy:

```text
Late result
    │
    ├── accept
    ├── reject
    ├── record only
    └── trigger new validation
```

Without an explicit policy, the result depends on timing.

Timing-dependent correctness is dangerous in production systems.

---

# Production Perspective

Production multi-agent systems should make state and coordination behavior observable.

Useful telemetry may include:

### Agent-level

- agent identifier,
- execution status,
- task identifier,
- start time,
- completion time,
- failure state.

### Coordination-level

- delegation relationships,
- dependency state,
- message identifiers,
- message latency,
- retry count,
- timeout count,
- handoff count,
- coordination state transitions.

### Failure-level

- unavailable agents,
- failed dependencies,
- cascading failures,
- degraded execution,
- orphaned tasks,
- termination failures.

### State-level

- state version,
- state owner,
- update timestamp,
- stale reads,
- conflicting updates.

The objective is not to collect every possible metric.

The objective is to make important coordination behavior diagnosable.

---

## Engineering Decisions and Trade-offs

## 1. Local State vs Shared State

| Approach | Advantages | Risks |
|---|---|---|
| Mostly local state | Isolation, low coupling | More communication |
| Shared state | Easier coordination | Consistency and ownership problems |
| Hybrid | Flexible | More architectural complexity |

A hybrid design is common, but it should still define ownership clearly.

---

## 2. Direct Messaging vs Shared State

### Direct messaging

```text
Agent A → Agent B
```

Advantages:

- explicit communication,
- clear sender/receiver,
- useful for event-driven coordination.

Risks:

- growing communication relationships,
- message handling complexity,
- dependency coupling.

### Shared state

```text
Agent A ─┐
Agent B ─┼──> State Store
Agent C ─┘
```

Advantages:

- centralized visibility,
- useful for coordination state.

Risks:

- contention,
- stale reads,
- unclear ownership,
- consistency complexity.

Neither is universally superior.

---

## 3. Strong vs Relaxed Coordination

Some tasks require strong coordination.

Example:

```text
Financial transaction
```

Other tasks can tolerate eventual convergence.

Example:

```text
Background analytics
```

The architecture should therefore match coordination guarantees to business requirements.

Using stronger guarantees than necessary can increase:

- latency,
- cost,
- coupling,
- operational complexity.

Using weaker guarantees than necessary can create correctness problems.

---

## 4. Retry vs Reassignment

When an agent does not respond:

```text
Retry
```

may be appropriate when the same responsibility is still valid and the failure may be transient.

```text
Reassign
```

may be appropriate when another agent can safely assume the responsibility.

But neither is automatically safe.

Before retrying or reassignment, the architecture should consider:

- whether work may already have completed,
- whether duplicate execution is acceptable,
- whether the task has side effects,
- whether state has changed,
- whether another agent already owns the responsibility.

---

## 5. Availability vs Consistency

A system may sometimes face a trade-off between:

```text
Continue with possibly stale information
```

and:

```text
Wait for stronger coordination
```

For example:

```text
Agent B unavailable
       │
       ├── Continue using last known state
       │
       └── Wait for authoritative state
```

The right decision depends on the consequence of being wrong.

For low-risk exploratory work, degraded operation may be acceptable.

For high-impact decisions, stronger coordination may be required.

---

## 6. Centralized vs Distributed Coordination

### Centralized

```text
        Coordinator
       /     |     \
      A      B      C
```

Advantages:

- easier global visibility,
- simpler coordination logic,
- easier policy enforcement.

Risks:

- bottleneck,
- single coordination dependency,
- reduced autonomy.

### Distributed

```text
A ↔ B
↕   ↕
C ↔ D
```

Advantages:

- fewer central dependencies,
- potentially greater autonomy.

Risks:

- harder global reasoning,
- more communication complexity,
- harder conflict resolution,
- harder debugging.

The architecture should reflect the coordination problem rather than choosing distributed coordination merely because it appears more advanced.

---

# Common Multi-Agent Failure Patterns

## 1. Shared State Without Ownership

```text
Agent A ─┐
Agent B ─┼──> Shared State
Agent C ─┘
```

Everyone can modify everything.

Result:

- conflicting updates,
- unclear authority,
- difficult debugging.

---

## 2. Infinite Waiting

```text
Waiting for Agent B...
Waiting for Agent B...
Waiting for Agent B...
```

No timeout or alternative path exists.

Result:

- stuck execution,
- resource consumption,
- delayed completion.

---

## 3. Blind Retry

```text
No response
    ↓
Retry
    ↓
No response
    ↓
Retry
    ↓
Retry
    ↓
Retry
```

Without bounds, retries can amplify failure.

---

## 4. Duplicate Processing

The same message or task is processed multiple times without determining whether duplicate execution is safe.

---

## 5. Stale State Decisions

An agent makes an important decision using outdated coordination state.

---

## 6. Cascading Dependency Failure

A single unavailable agent blocks multiple downstream agents even though alternative execution paths exist.

---

## 7. Hidden Circular Dependencies

Agents depend on each other indirectly, creating deadlock or livelock.

---

## 8. Unbounded Degraded Operation

A system enters degraded mode but never communicates that the output is incomplete.

This is dangerous because users may interpret partial results as complete results.

---

## 9. Orphaned Work

An agent disappears while its task continues without a clearly responsible owner.

---

## 10. Shutdown Without Coordination

The coordinator stops while workers continue running.

Possible consequences:

- orphaned tasks,
- leaked resources,
- incomplete state,
- unexpected side effects.

---

# Common Mistakes and Misconceptions

## Mistake 1: "Shared State Means Everyone Owns the State"

Incorrect.

Shared visibility and ownership are different concepts.

---

## Mistake 2: "A Message Was Sent, So the Other Agent Has It"

Incorrect.

Sending and successful processing are different events.

```text
Sent
 ≠
Delivered
 ≠
Processed
 ≠
Accepted
 ≠
Completed
```

This distinction is fundamental to reliable coordination.

---

## Mistake 3: "Timeout Means Failure"

Not necessarily.

A timeout means that the expected event did not occur within the allowed period.

The underlying reason may be:

- failure,
- delay,
- overload,
- communication loss,
- incorrect timing assumptions.

---

## Mistake 4: "More Agents Means More Reliability"

Not automatically.

More agents can improve isolation or redundancy, but they also create:

- more coordination relationships,
- more communication,
- more state,
- more failure boundaries,
- more opportunities for disagreement.

Reliability must be evaluated at the system level.

---

## Mistake 5: "Consensus Solves Conflicting Outputs"

Not necessarily.

If every agent is using the same incorrect information, consensus can simply produce confident agreement on the wrong answer.

Conflict resolution should be based on evidence, authority, validation, or appropriate decision rules.

---

## Mistake 6: "Termination Means Killing Every Agent Immediately"

Not necessarily.

Some tasks may need:

- graceful completion,
- cancellation,
- cleanup,
- state persistence,
- result collection.

Termination is a coordination process.

---

## Mistake 7: "Failure Is Local"

Not necessarily.

A local failure can propagate through dependency relationships.

Therefore, system architecture should define failure boundaries.

---

# Security and Trust Considerations

Multi-agent state and communication introduce security concerns.

The architecture should consider:

### State Access

Agents should only access state required for their responsibilities.

### State Integrity

Agents should not be able to silently modify authoritative state they do not own.

### Cross-Agent Data Exposure

Passing context between agents may expose information that the receiving agent does not need.

### Untrusted Results

A result from another agent should not automatically be treated as authoritative merely because it came from an internal participant.

### Compromised Participants

A compromised or malfunctioning agent may:

- produce incorrect results,
- emit excessive messages,
- corrupt shared state,
- repeatedly trigger work.

The system should therefore define appropriate trust and containment boundaries.

Detailed security architecture belongs to the broader enterprise and production domains; this chapter focuses on the multi-agent coordination consequences.

---

## Architecture Review Checklist

Before approving a multi-agent design, ask:

### State

- What state exists?
- Who owns each important state?
- Which state is local?
- Which state is shared?
- Which state is coordination state?
- How is stale state detected?
- How are conflicting updates handled?

### Communication

- How do agents communicate?
- What happens if a message is delayed?
- Can messages be duplicated?
- Does ordering matter?
- What happens if a message is lost?
- How is message processing correlated with the originating task?

### Failure

- What happens when an agent becomes unavailable?
- Which tasks depend on it?
- Can work continue without it?
- Can responsibility be reassigned?
- Where does failure propagation stop?
- What happens when agents disagree?
- Can the system operate in degraded mode?

### Coordination

- Can dependencies form cycles?
- Can deadlock occur?
- Can livelock occur?
- Are waits bounded?
- Can retries amplify failure?
- Can duplicate work occur?

### Termination

- What conditions cause termination?
- Who initiates termination?
- What happens to active tasks?
- Can new work start during shutdown?
- How are orphaned tasks detected?
- How are late results handled?
- **Can termination requests be safely repeated, and are termination state transitions observable?**

---

## Interview Questions with Expected Answers

## 1. Why does state become more difficult in a multi-agent system?

**Expected answer:**

Because multiple agents may maintain different local state while also depending on shared or coordination state. The system must define ownership, synchronization, consistency expectations, and how stale or conflicting state is handled.

---

## 2. What is the difference between local state and shared state?

**Expected answer:**

Local state belongs primarily to one agent and supports its execution. Shared state is intentionally accessible to multiple participants for coordination or common information. Shared visibility does not necessarily imply shared ownership.

---

## 3. Why is state ownership important?

**Expected answer:**

Without clear ownership, multiple agents may update the same state inconsistently, causing conflicting updates, stale information, ambiguous authority, and difficult debugging.

---

## 4. Does sending a message guarantee that another agent processed it?

**Expected answer:**

No. Sending, delivery, processing, acceptance, and completion are different events.

---

## 5. What problems can message duplication cause?

**Expected answer:**

Duplicate processing, duplicate work, conflicting state updates, and repeated side effects. Systems may therefore need correlation identifiers, deduplication, or idempotent processing where appropriate.

---

## 6. What is partial failure?

**Expected answer:**

A condition where one or more components fail or become unavailable while other components remain operational.

---

## 7. Why is partial failure important in multi-agent architecture?

**Expected answer:**

Because the system may need to continue, degrade, reassign work, or terminate even though some agents are unavailable. A failure in one participant can also propagate through dependencies.

---

## 8. Is a timeout proof that an agent failed?

**Expected answer:**

No. A timeout only indicates that an expected event did not occur within the configured period. The cause could be failure, delay, overload, communication loss, or incorrect timing assumptions.

---

## 9. What is failure propagation?

**Expected answer:**

Failure propagation occurs when a failure in one agent or coordination component causes dependent agents, tasks, or system functions to fail or become blocked.

---

## 10. What is the difference between deadlock and livelock?

**Expected answer:**

In deadlock, participants are blocked waiting for conditions that cannot be satisfied. In livelock, participants remain active but repeatedly react without making meaningful progress.

---

## 11. Why is consensus not always the right way to resolve conflicting agent outputs?

**Expected answer:**

Because agreement does not guarantee correctness. Agents may share the same flawed evidence or assumptions. Conflict resolution should use task-appropriate evidence, authority, validation, or decision rules.

---

## 12. What is an orphaned task?

**Expected answer:**

A task that continues or remains unresolved without an active component clearly responsible for its lifecycle.

---

## 13. Why is termination different from completion?

**Expected answer:**

Completion means the objective has been satisfied. Termination means execution should stop. The objective can be complete while agents or background tasks are still active.

---

## 14. What is a termination race?

**Expected answer:**

A condition where shutdown or cancellation occurs concurrently with work completing or producing a result, creating ambiguity about whether the late result should be accepted, ignored, or processed.

---

## 15. How would you design a multi-agent system to tolerate one specialist becoming unavailable?

**Expected answer:**

First identify whether that specialist is mandatory. Then define bounded detection, fallback or reassignment where safe, degraded operation where acceptable, and explicit failure or escalation when the responsibility cannot be completed. The design should also prevent duplicate or conflicting execution.

---

## Quick Revision

Remember these distinctions:

```text
Local State
    ≠
Shared State
    ≠
Coordination State
```

```text
Sent
    ≠
Delivered
    ≠
Processed
    ≠
Accepted
    ≠
Completed
```

```text
Timeout
    ≠
Proof of Failure
```

```text
Coordination Failure
    ≠
Failure Propagation
```

```text
Deadlock
    ≠
Livelock
```

```text
Completion
    ≠
Termination
```

```text
Shared Visibility
    ≠
Shared Ownership
```

And remember:

> **A multi-agent system must define not only how agents cooperate when everything works, but also what happens when state becomes stale, communication becomes unreliable, participants disagree, agents become unavailable, and execution must stop.**

---

# Key Takeaways

1. Multi-agent systems introduce multiple state holders and coordination boundaries.
2. State should have clear ownership even when it is shared.
3. Local, shared, and coordination state serve different architectural purposes.
4. State synchronization determines whether agents are making decisions from sufficiently current information.
5. Communication can involve delay, duplication, reordering, loss, or incomplete processing.
6. Sending a message is not equivalent to completing the requested work.
7. Partial failure is normal enough in multi-agent architecture to require explicit design.
8. A timeout is evidence that an expected event did not occur within a bound, not automatic proof of failure.
9. Failure can propagate through dependency relationships.
10. Isolation limits the impact of failures.
11. Degraded operation can be preferable to total failure when requirements permit it.
12. Conflicting agent outputs require task-appropriate resolution rather than automatic consensus.
13. Deadlock prevents progress through circular waiting.
14. Livelock allows activity without meaningful progress.
15. Task ownership should remain identifiable throughout execution.
16. Termination must account for active tasks, incomplete coordination, late results, and shutdown races.
17. Multi-agent reliability depends on the architecture of state, communication, dependencies, and failure containment—not simply on the reliability of individual agents.

---

## Further Reading

For related concepts, continue with:

- **AGT-04 — Agent State, Context, and Memory** for individual agent state and context.
- **AGT-06 — Workflow Patterns, State Transitions, and Durable Execution** for workflow-level state and execution durability.
- **AGT-08 — Agent Capability Interfaces and Interoperability** for interoperability mechanisms and protocols.
- **AGT-11 — Agent Failure Modes, Recovery, and Safety** for broader agent failure, recovery, containment, and safety engineering.
- **AGT-12 — Agent System Architecture and Design Review** for end-to-end architecture selection and validation.

---

## Navigation

**Previous:** [02 — Delegation, Supervision, and Agent Coordination](./02-Delegation-Supervision-and-Agent-Coordination.md)

**Chapter:** [AGT-09 — Multi-Agent Systems](./README.md)

**Next:** [AGT-10 — Agent Evaluation and Reliability](../AGT-10-Agent-Evaluation-and-Behavioral-Testing/Readme.md)

---

## Chapter Completion Check

Before considering AGT-09 complete, you should be able to explain:

- why multi-agent state requires explicit ownership,
- how local, shared, and coordination state differ,
- how communication failures affect coordination state,
- how partial failures propagate,
- how isolation and degraded operation reduce architectural impact,
- how deadlock and livelock emerge,
- how conflicting outputs should be handled,
- how orphaned work occurs,
- how coordinated termination works,
- why completion and termination are different,
- and how to design a multi-agent system that remains understandable when execution does not go according to plan.

> **Core Principle:**  
> **A multi-agent system is not reliable merely because each agent works correctly in isolation. Reliability depends on whether state, communication, failures, and termination are explicitly designed across agent boundaries.**
