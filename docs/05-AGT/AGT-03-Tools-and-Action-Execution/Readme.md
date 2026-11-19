# AGT-03 — Tools & Action Execution

## Chapter Purpose

AGT-03 establishes the engineering foundations for how an agent interacts with external capabilities through tools and action interfaces.

The chapter focuses on the boundary between **agent reasoning** and **external action execution**.

The central question is:

> **How does an agent safely and predictably turn a model-selected action into an externally executed operation and then consume the result?**

The chapter follows this progression:

```text
Tool Definition
      ↓
Contract
      ↓
Capability Boundary
      ↓
Discovery
      ↓
Selection
      ↓
Invocation
      ↓
Execution
      ↓
Result
      ↓
Failure
```

AGT-03 is concerned with the **tool/action boundary** rather than the complete agent runtime, planning system, workflow engine, or enterprise security architecture.

---

## Scope

AGT-03 owns the engineering concepts required to define, discover, select, invoke, execute, and observe tools and external actions.

The chapter covers:

- tools as external capabilities;
- tool definitions and interfaces;
- tool contracts;
- input and output schemas;
- arguments and validation;
- capability boundaries;
- tool metadata and availability;
- tool discovery;
- tool selection;
- invocation;
- action execution;
- structured results;
- execution errors;
- validation failures;
- timeouts;
- rate limits;
- retries at the action boundary;
- idempotency;
- side effects;
- action capability and execution boundaries;
- execution observability;
- action traceability;
- malformed arguments;
- unavailable tools;
- failed execution;
- partial and ambiguous results;
- result provenance and trust.

### Out of Scope

AGT-03 does not own:

- agent foundations and system boundaries;
- runtime-loop design;
- state, context, or memory architecture;
- planning and replanning;
- durable workflow execution;
- human approval architecture;
- interoperability protocols;
- multi-agent architecture;
- agent evaluation methodology;
- broader agent reliability and safety strategy;
- system-level architecture review;
- enterprise governance and security architecture.

These concepts may be referenced where necessary to establish boundaries, but they should not be re-taught here.

---

## Learning Outcomes

After completing AGT-03, you should be able to:

1. Explain what a tool is within an agent system.
2. Explain why tools create an action boundary between reasoning and external capabilities.
3. Describe the purpose of a tool contract.
4. Reason about input schemas, validation, outputs, and error contracts.
5. Explain how capability descriptions support tool discovery and selection.
6. Distinguish tool selection from planning.
7. Distinguish invocation from external execution.
8. Reason about successful, partial, empty, malformed, and failed tool results.
9. Explain why a tool result is an observation rather than automatically a trustworthy fact.
10. Reason about side effects and duplicate execution.
11. Explain why retryability does not necessarily imply safe retry.
12. Explain the role of idempotency in side-effecting actions.
13. Identify meaningful action-level observability requirements.
14. Recognize the boundary between tool engineering and runtime, planning, memory, workflow, protocol, reliability, safety, and governance responsibilities.
15. Evaluate whether a tool exposes a sufficiently precise and controllable capability boundary.

---

## Chapter Navigation

| File | Primary Focus | Primary Question |
|---|---|---|
| [01 — Tool Definitions, Contracts & Capability Boundaries](./01-Tool-Definitions-Contracts-and-Capability-Boundaries.md) | Tool contracts and capability boundaries | What makes a tool a well-defined and usable capability for an agent? |
| [02 — Tool Discovery, Selection & Invocation](./02-Tool-Discovery-Selection-and-Invocation.md) | Discovery, selection, argument construction, and invocation | How does an agent determine which available capability to use and invoke it correctly? |
| [03 — Tool Execution, Results & Action Failures](./03-Tool-Execution-Results-and-Action-Failures.md) | Execution, results, failures, retries, and side effects | What happens when a tool actually executes, returns a result, or fails? |

---

## Learning Progression

The three files form a deliberate progression.

### 01 — Define the Capability

Establish what a tool exposes and how its contract bounds the capability.

```text
Tool
  ↓
Interface
  ↓
Contract
  ↓
Schema
  ↓
Validation
  ↓
Capability Boundary
```

### 02 — Find and Invoke the Capability

Move from available capabilities to a concrete invocation.

```text
Available Tools
      ↓
Discovery
      ↓
Capability Matching
      ↓
Selection
      ↓
Argument Construction
      ↓
Validation
      ↓
Invocation
```

### 03 — Execute and Handle the Outcome

Examine what happens after invocation.

```text
Invocation
      ↓
Dispatch
      ↓
External Execution
      ↓
Result / Error
      ↓
Normalize / Record
      ↓
Tool Result
      ↓
Runtime Observation
```

The progression intentionally moves from **capability definition** to **action invocation** to **execution outcome**.

---

## Prerequisites

AGT-03 builds on concepts established earlier in the AGT domain.

You should understand the basic concepts of:

- agent systems and their boundaries;
- agent runtime execution;
- the runtime-level action stage;
- observations produced during execution;
- bounded execution at a conceptual level.

For the preceding AGT chapters, refer to the corresponding approved AGT documentation in the repository, particularly:

- **AGT-01-Agent-Systems-Foundations**
- **AGT-02 — Agent Runtime, Loops & Bounded Autonomy**

AGT-03 does not re-teach those foundations.

---

## Concept Ownership Boundaries

The following ownership model prevents duplication across the AGT domain.

| Concept | Primary Owner |
|---|---|
| Agent definition | AGT-01 |
| Agent system boundaries | AGT-01 |
| Runtime harness | AGT-02 |
| Execution loop | AGT-02 |
| Decision → Action → Observation cycle | AGT-02 |
| Tool definition | **AGT-03** |
| Tool interface | **AGT-03** |
| Tool contract | **AGT-03** |
| Tool schema | **AGT-03** |
| Tool input validation | **AGT-03** |
| Tool output contract | **AGT-03** |
| Tool capability boundary | **AGT-03** |
| Tool discovery | **AGT-03** |
| Tool selection | **AGT-03** |
| Tool invocation | **AGT-03** |
| Tool execution | **AGT-03** |
| Tool result handling | **AGT-03** |
| Tool execution errors | **AGT-03** |
| Tool timeout behavior | **AGT-03** |
| Tool idempotency | **AGT-03** |
| Tool side effects | **AGT-03** |
| Tool execution observability | **AGT-03** |
| State | AGT-04 |
| Context | AGT-04 |
| Memory | AGT-04 |
| Planning | AGT-05 |
| Replanning | AGT-05 |
| Durable execution | AGT-06 |
| Human approval | AGT-07 |
| Interoperability protocols | AGT-08 |
| MCP | AGT-08 |
| A2A | AGT-08 |
| Multi-agent coordination | AGT-09 |
| Agent evaluation | AGT-10 |
| Recovery strategy | AGT-11 |
| Agent safety strategy | AGT-11 |
| Architecture review | AGT-12 |

The key boundary is:

> **AGT-02 owns the execution loop.**

> **AGT-03 owns what happens when the runtime needs to perform an external action.**

---

## Cross-Chapter Dependencies

AGT-03 connects to the surrounding AGT chapters through a small number of clear boundaries.

| Chapter | Relationship with AGT-03 |
|---|---|
| **AGT-01** | Provides the agent-system foundations within which tools operate. |
| **AGT-02** | Owns the runtime loop that produces actions and consumes tool results as observations. |
| **AGT-04** | Owns state, context, and memory that may be used by or receive information from tool execution. |
| **AGT-05** | Owns planning and replanning; AGT-03 owns capability selection rather than planning strategy. |
| **AGT-06** | Owns durable workflow execution and long-running execution semantics. |
| **AGT-07** | Owns human approval and intervention architecture. |
| **AGT-08** | Owns interoperability protocols and protocol-specific tool interfaces. |
| **AGT-09** | Owns multi-agent coordination and delegation. |
| **AGT-10** | Owns agent evaluation and behavioral testing. |
| **AGT-11** | Owns broader reliability, safety, recovery, fallback, containment, and degradation strategy. |
| **AGT-12** | Owns system-level architecture synthesis and design review. |

AGT-03 remains focused on the **tool/action execution boundary**.

---

## Practical Learning Path

Work through the chapter in order.

### Step 1 — Tool Definition and Contracts

Read:

[01 — Tool Definitions, Contracts & Capability Boundaries](./01-Tool-Definitions-Contracts-and-Capability-Boundaries.md)

Focus on understanding the capability exposed by a tool and the contract that bounds it.

### Step 2 — Discovery, Selection and Invocation

Read:

[02 — Tool Discovery, Selection & Invocation](./02-Tool-Discovery-Selection-and-Invocation.md)

Focus on how available capabilities are discovered, selected, and invoked.

### Step 3 — Execution, Results and Failures

Read:

[03 — Tool Execution, Results & Action Failures](./03-Tool-Execution-Results-and-Action-Failures.md)

Focus on how invocation becomes execution and how results, failures, retries, idempotency, side effects, and observability are handled.

### End-to-End Practice

Complete the chapter by tracing one action through the complete boundary:

```text
Capability Definition
        ↓
Discovery
        ↓
Selection
        ↓
Invocation
        ↓
Execution
        ↓
Tool Result / Error
        ↓
Runtime Observation
```

---

## Production Perspective

AGT-03 connects tool design with production concerns such as:

- validation;
- failure handling;
- side effects;
- idempotency;
- observability;
- result trust;
- contract evolution.

The production focus is:

> **Reliable, observable, and well-bounded action execution.**

Broader production engineering, reliability, safety, security, and governance concerns remain owned by their respective chapters.

---

## Chapter Completion

AGT-03 is complete when you can reason across the complete tool/action boundary:

```text
Tool Definition
      ↓
Contract
      ↓
Capability Boundary
      ↓
Discovery
      ↓
Selection
      ↓
Invocation
      ↓
Execution
      ↓
Result / Error
      ↓
Tool Result
      ↓
Runtime Observation
```

You should be able to inspect a tool design and determine:

- what capability it exposes;
- what its contract defines;
- how an invocation is constructed and validated;
- what execution outcome can be returned;
- what failures and side effects may occur;
- whether retrying is technically safe;
- how execution can be observed and diagnosed;
- where responsibility moves from AGT-03 to another AGT chapter.

---

## Estimated Reading Time

**Estimated Chapter Reading Time:** 75–90 minutes

This estimate covers the three teaching files and assumes normal technical reading with brief reflection on the examples and engineering trade-offs.

---

## Chapter Structure

```text
AGT-03-Tools-and-Action-Execution/
├── README.md
├── 01-Tool-Definitions-Contracts-and-Capability-Boundaries.md
├── 02-Tool-Discovery-Selection-and-Invocation.md
└── 03-Tool-Execution-Results-and-Action-Failures.md
```

The chapter intentionally contains exactly three teaching files.

---

## Chapter Summary

AGT-03 establishes the engineering boundary between **agent reasoning** and **external action execution**.

The chapter progresses from:

> **Define → Discover → Select → Invoke → Execute → Return Result → Handle Failure**

The three files build progressively:

1. **Define the capability** through contracts and boundaries.
2. **Find and invoke the capability** through discovery, selection, argument construction, and validation.
3. **Execute and reason about the outcome** through results, failures, retries, idempotency, side effects, and observability.

The central engineering perspective is:

> **An agent may decide what action it wants to perform, but the tool boundary determines what capability can actually be requested, how that request is validated, what external operation occurs, and what result or failure is returned.**
