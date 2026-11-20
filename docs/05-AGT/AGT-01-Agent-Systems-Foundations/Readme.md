# AGT-01-Agent-Systems-Foundations

## Chapter Purpose

AGT-01 establishes the foundational engineering mental model for agent systems.

The chapter answers the core questions:

- What is an agent?
- What makes a system agentic?
- Where does an agent begin and end?
- What is the relationship between an agent and its environment?
- How is an agent different from an LLM application, conventional workflow, or RAG application?
- What major components make up an agent system?
- What responsibilities belong to the agent system versus external systems?
- Why is autonomy an engineering property rather than an automatic design goal?

This chapter provides the vocabulary and architectural foundation required for the remaining Agent Engineering curriculum.

It intentionally does **not** teach runtime loops, tool engineering, memory architectures, planning algorithms, workflow orchestration, human approval systems, agent protocols, multi-agent systems, evaluation engineering, reliability engineering, or end-to-end agent architecture selection in depth. Those responsibilities belong to later AGT chapters.

---

## Learning Progression

AGT-01 progresses from the basic definition of an agent toward a high-level architectural view.

```text
Agent Definition
      ↓
System Boundaries
      ↓
Agent ↔ Environment Interaction
      ↓
Agent vs Other AI Application Patterns
      ↓
Agent System Composition
      ↓
Major Components and Responsibility Boundaries
```

The three lessons should be completed in order.

---

## Prerequisites

Before starting AGT-01, the learner should have a working understanding of:

- Software systems and application architecture
- APIs and external system interaction
- Basic LLM concepts
- Basic AI application architecture
- The distinction between an application component and the system that surrounds it

Detailed knowledge of agent frameworks is **not required**.

---

## Chapter Files

### 1. Agent Definition and System Boundaries

**File:** [Agent Definition and System Boundaries](./01-Agent-Definition-and-System-Boundaries.md)

This lesson establishes the foundational definition of an agent.

It covers:

- Agent definition
- Goal-directed behavior
- Agent and environment relationship
- Agent boundaries
- System boundaries
- Agent responsibility versus external-system responsibility
- Action and observation
- Autonomy
- Bounded autonomy as a foundational engineering concept
- Why an LLM alone is not necessarily a complete agent

The central conceptual model is:

```text
Goal
  ↓
Agent
  ↓
Decision
  ↓
Action
  ↓
Environment
  ↓
Observation
  ↓
Agent
```

The model is conceptual rather than a claim that every implementation follows exactly this sequence.

---

### 2. Agent vs LLM Applications, Workflows, and RAG Systems

**File:** [Agent vs LLM Applications Workflows and RAG Systems](./02-Agent-vs-LLM-Applications-Workflows-and-RAG-Systems.md)

This lesson establishes the architectural distinction between agentic systems and other common AI application patterns.

It compares:

1. LLM applications
2. Conventional workflows
3. RAG applications
4. Agentic systems

The comparison focuses on dimensions such as:

- Who determines the next step
- Predetermined versus dynamically selected execution
- Adaptation
- Action selection
- Goal pursuit
- State
- Autonomy
- Response to changing conditions
- Execution responsibility

The conceptual models are:

```text
LLM Application

Input → Model → Output
```

```text
RAG Application

Input → Retrieval → Model → Output
```

```text
Conventional Workflow

Step A → Step B → Step C → Step D
```

```text
Agentic System

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
...
```

These are mental models rather than universal implementation rules.

A key principle is:

> RAG is an application and retrieval pattern. RAG alone does not define an agent.

Systems can also combine these patterns. A workflow may contain agentic behavior, an agent may use RAG, and an agent system may contain conventional workflows. The distinction is based on architectural responsibility and execution behavior rather than mutually exclusive technology labels.

---

### 3. Agent Architecture and System Composition

**File:** [Agent Architecture and System Composition](./03-Agent-Architecture-and-System-Composition.md)

This lesson establishes the high-level architectural composition of an agent system.

It introduces the major components surrounding agent execution:

- User or upstream system
- Agent boundary
- Runtime
- Model
- Context
- State
- Memory
- Planning
- Tools
- Workflows
- Human control
- Evaluation
- Reliability and safety
- External environment
- External systems

The purpose is to establish an architectural map and responsibility boundaries.

Detailed engineering of these components is intentionally deferred to later AGT chapters.

---

## Where This Is Covered
AGT-01 establishes vocabulary and system-level relationships. It does not become the detailed engineering chapter for every component it introduces.

| Concept | AGT-01 Responsibility | Detailed Owner |
|---|---|---|
| Agent definition | Establish | AGT-01 |
| Agent/system boundaries | Establish | AGT-01 |
| Agent/environment relationship | Establish | AGT-01 |
| Goal-directed behavior | Establish | AGT-01 |
| Autonomy | Establish foundational concept | AGT-01 |
| Runtime | Introduce architectural role | AGT-02 |
| Execution loops | Introduce only if needed for context | AGT-02 |
| Bounded autonomy | Introduce foundationally | AGT-02 |
| Tools | Introduce as external capabilities | AGT-03 |
| Tool contracts and execution | Do not teach in depth | AGT-03 |
| State | Establish vocabulary | AGT-04 |
| Context | Establish vocabulary | AGT-04 |
| Memory | Establish vocabulary | AGT-04 |
| Planning | Introduce architectural role | AGT-05 |
| Planning algorithms and execution | Do not teach in depth | AGT-05 |
| Workflows | Introduce architectural role | AGT-06 |
| Durable execution | Do not teach in depth | AGT-06 |
| Human control | Introduce architectural boundary | AGT-07 |
| Approval and intervention | Do not teach in depth | AGT-07 |
| Agent interfaces/protocols | Introduce only where architecture requires | AGT-08 |
| Multi-agent systems | Introduce basic distinction only | AGT-09 |
| Agent evaluation | Introduce as system concern | AGT-10 |
| Agent reliability and safety | Introduce as system concern | AGT-11 |
| End-to-end architecture selection | Establish vocabulary | AGT-12 |

This ownership model prevents AGT-01 from duplicating detailed engineering work covered by later chapters.

---

## Relationship to Later AGT Chapters

AGT-01 provides the foundation for the remaining Agent Engineering domain.

```text
AGT-01
Agent Systems Foundations
        │
        ├── AGT-02
        │   Agent Runtime, Loops & Bounded Autonomy
        │
        ├── AGT-03
        │   Tools & Action Execution
        │
        ├── AGT-04
        │   State, Context & Memory
        │
        ├── AGT-05
        │   Planning & Adaptive Execution
        │
        ├── AGT-06
        │   Workflow Orchestration & Durable Execution
        │
        ├── AGT-07
        │   Human Control & Approval
        │
        ├── AGT-08
        │   Agent Interfaces & Protocols
        │
        ├── AGT-09
        │   Multi-Agent Systems
        │
        ├── AGT-10
        │   Agent Evaluation & Behavioral Testing
        │
        ├── AGT-11
        │   Agent Reliability & Safety
        │
        └── AGT-12
            Agent Architecture & Design Review
```

The later chapters progressively turn the foundational vocabulary from AGT-01 into detailed engineering practices.

---

## Cross-Domain Relationships

### LLM Engineering

The model is one component that may participate in an agent system.

AGT-01 distinguishes the **model** from the **agent system** without teaching LLM engineering itself.

The LLM domain owns topics such as model behavior, prompting, instruction handling, and model-facing generation.

Agent Engineering owns the execution and system-level responsibilities around the model, including decisions, actions, autonomy, tools, state, planning, and workflows.

---

### Retrieval Engineering

AGT-01 uses RAG as a comparison point to explain why retrieval alone does not define an agent.

Retrieval engineering remains owned by the RET domain.

AGT-01 should not teach:

- Indexing
- Sparse retrieval
- Dense retrieval
- Vector search
- Ranking
- Reranking
- Retrieval evaluation
- Retrieval diagnostics

An agent may consume retrieval capabilities as part of broader execution, but the retrieval mechanisms themselves belong to RET.

---

### Production AI Engineering

AGT-01 establishes the architectural vocabulary required to understand an agent as a production system.

It may acknowledge infrastructure and operational concerns, but detailed topics such as:

- Deployment
- Model serving
- Kubernetes
- Scaling
- Infrastructure
- Observability
- Operations

belong to the Production AI Engineering domain.

---

### Enterprise AI Systems

Agent systems may eventually operate under enterprise constraints.

AGT-01 may acknowledge those constraints at a high level but does not teach:

- Governance architecture
- Enterprise authorization architecture
- Compliance systems
- Security controls
- Enterprise policy enforcement

Those responsibilities belong to the Enterprise AI Systems domain.

---

## Recommended Learning Order

Complete the files in this order:

```text
01-Agent-Definition-and-System-Boundaries.md
                ↓
02-Agent-vs-LLM-Applications-Workflows-and-RAG-Systems.md
                ↓
03-Agent-Architecture-and-System-Composition.md
```

Do not skip Lesson 01.

The definition and boundary model established there is required for understanding the architectural distinctions in Lesson 02 and the system composition model in Lesson 03.

---

## Completion Guidance

AGT-01 is complete when you can confidently explain:

- What an agent is
- What makes a system agentic
- Why goal-directed behavior matters
- How an agent relates to its environment
- Where an agent system begins and ends
- What the agent is responsible for versus external systems
- The role of action and observation
- What autonomy means at a foundational level
- Why autonomy does not automatically mean intelligence
- Why an LLM alone is not necessarily a complete agent
- How an agent differs from a conventional LLM application
- How an agent differs from a conventional workflow
- Why RAG does not automatically make a system an agent
- How these patterns can be combined
- The major components of an agent system
- Which later AGT chapter owns each major component
- Why agent architecture is a system-level concern rather than simply a model-selection problem

The goal is not to memorize terminology.

The goal is to develop a reliable mental model that can be used when designing, reviewing, debugging, and explaining agent systems.

---

## Next Chapter

After completing AGT-01, continue with:

[`AGT-02 — Agent Runtime, Loops & Bounded Autonomy`](../AGT-02-Agent-Runtime-Loops-and-Bounded-Autonomy/Readme.md)

AGT-02 takes the foundational concept of agent execution introduced here and develops the runtime, execution-loop, continuation, termination, cancellation, execution-budget, and bounded-autonomy concepts in detail.
