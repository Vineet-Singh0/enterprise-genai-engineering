# ENT-01 — Enterprise AI Capability Architecture and Operating Models

## Chapter Purpose

ENT-01 establishes the architectural foundation for understanding how AI capabilities can be structured and operated across an enterprise.

The chapter focuses on:

- Enterprise AI capabilities
- Capability and architectural boundaries
- AI operating models
- Architecture principles
- Architecture trade-offs
- Architecture decision-making

The goal is to develop **enterprise AI architecture judgment**: the ability to reason about what capabilities should exist, where their boundaries should be, how responsibilities should be distributed, and why one architectural option may be more appropriate than another.

## Central Question

> **How should enterprise AI capabilities and operating models be structured?**

The chapter follows a three-stage progression:

```text
WHAT exists?
      ↓
HOW is it organized and operated?
      ↓
HOW do we make and defend architecture decisions?
```

---

## Learning Outcomes

After completing ENT-01, you should be able to:

- Explain what an enterprise AI capability is.
- Distinguish an AI capability from an AI application, product, service, or technical component.
- Identify meaningful capability and architectural boundaries.
- Reason about shared versus domain-specific AI capabilities.
- Explain centralized, federated, and hybrid AI operating models.
- Evaluate how responsibilities can be distributed between central and domain teams.
- Explain the trade-offs between standardization, reuse, autonomy, and local optimization.
- Identify architecture principles, constraints, boundaries, and decision criteria.
- Compare competing enterprise AI architecture options.
- Explain the consequences of architecture decisions.
- Defend an enterprise AI architecture using explicit reasoning rather than architectural fashion or preference.

---

## Prerequisites

ENT-01 follows the broader curriculum progression:

```text
ENG → AIF → LLM → RET → AGT → PROD → ENT
```

Learners should have the relevant foundations from the preceding domains before beginning ENT-01.

ENT-01 does not re-teach the technical implementation concepts owned by those domains. Technical concepts may be referenced where they help explain an enterprise architecture decision.

---

## Chapter Progression

### File 01 — What Exists?

**[`01-Enterprise-AI-Capabilities-and-Architectural-Boundaries.md`](./01-Enterprise-AI-Capabilities-and-Architectural-Boundaries.md)**

Primary question:

> **What enterprise AI capabilities exist, and where should their boundaries be?**

This file establishes the foundation for reasoning about enterprise AI capabilities and their boundaries.

It owns:

- Enterprise AI capabilities
- AI capability versus AI application
- Capability decomposition
- Capability boundaries
- Architectural boundaries
- Organizational and responsibility boundaries
- Shared versus domain-specific capabilities
- Capability ownership boundaries
- Capability coupling
- Architectural problems caused by poorly defined boundaries

The key outcome is the ability to determine **what capability is actually being built and where that capability begins and ends**.

---

### File 02 — How Is It Organized and Operated?

**[`02-Centralized-Federated-and-Hybrid-AI-Operating-Models.md`](./02-Centralized-Federated-and-Hybrid-AI-Operating-Models.md)**

Primary question:

> **How should enterprise AI capabilities be organized and operated?**

This file builds on the capability boundaries established in File 01 and examines how AI responsibilities can be distributed across an enterprise.

It owns:

- AI operating models
- Centralized operating models
- Federated operating models
- Hybrid operating models
- Central versus domain ownership
- Shared platform responsibility
- Domain-team responsibility
- Operating-level decision authority
- Standardization versus autonomy
- Reuse versus local optimization
- Central versus distributed expertise
- Operating-model trade-offs and failure modes
- Conditions favoring different operating models

The key outcome is understanding that **operating-model selection is contextual rather than universal**.

---

### File 03 — How Do We Make and Defend Decisions?

**[`03-Enterprise-AI-Architecture-Principles-Boundaries-and-Decisions.md`](./03-Enterprise-AI-Architecture-Principles-Boundaries-and-Decisions.md)**

Primary question:

> **Given the capabilities and operating model, how should enterprise AI architecture decisions be made and defended?**

This file focuses on architecture judgment and decision reasoning.

It owns:

- Enterprise AI architecture principles
- Architecture constraints
- Platform, domain, and shared-service boundaries
- Architecture decision criteria
- Architecture options
- Architecture trade-offs
- Principles versus rules versus constraints
- Standardization versus flexibility
- Reuse versus coupling
- Central control versus autonomy
- Enterprise consistency versus local optimization
- Decision rationale
- Decision consequences
- Architecture decision records where appropriate
- Evaluation and defense of competing architecture options

The key outcome is the ability to explain:

> **Why was this enterprise AI architecture chosen?**

rather than only describing what was chosen.

---

## Concept Ownership

The three lessons have distinct responsibilities:

```text
┌─────────────────────────────────────────────────────────┐
│ File 01                                                  │
│ Enterprise AI capabilities and boundaries                 │
│                                                         │
│ WHAT capability exists?                                 │
│ WHERE does it begin and end?                            │
└───────────────────────────┬─────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ File 02                                                  │
│ AI operating models and responsibility distribution      │
│                                                         │
│ HOW should the capability be organized and operated?     │
└───────────────────────────┬─────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ File 03                                                  │
│ Architecture principles, trade-offs, and decisions       │
│                                                         │
│ HOW should architecture choices be evaluated and         │
│ defended?                                               │
└─────────────────────────────────────────────────────────┘
```

Later files may reference concepts established earlier, but they should not re-teach those concepts in depth.

---

## Scope Boundaries

ENT-01 is an **enterprise architecture and decision-making** chapter.

It does not become a detailed tutorial on:

- Governance mechanisms
- AI risk methodology
- Security governance
- Information governance
- Provider strategy
- AI economics and portfolio governance
- Enterprise resilience
- Enterprise integration implementation
- Kubernetes
- Microservices
- FastAPI
- Cloud infrastructure
- Model serving
- Vector databases
- Agent runtimes
- CI/CD
- Infrastructure provisioning
- Technical disaster recovery

These areas belong to their respective curriculum domains or chapters.

### Architecture vs Governance

ENT-01 focuses on:

> What capabilities, components, boundaries, responsibilities, and relationships should exist?

Governance focuses on:

> Who has authority, accountability, decision rights, and lifecycle control?

ENT-01 may identify architectural responsibility and decision boundaries, but governance mechanisms and governance authority belong to the appropriate governance curriculum.

### Architecture vs Technical Implementation

ENT-01 remains at the enterprise architecture level:

```text
Enterprise Architecture
        ↓
Capabilities
        ↓
Boundaries
        ↓
Operating Model
        ↓
Architecture Decisions
        ↓
Technical Implementation
```

ENT-01 may explain why an architecture decision creates implementation consequences, but it does not teach the implementation itself.

---

## Relationship with Other ENT Chapters

ENT-01 provides the architectural foundation for the remaining ENT domain.

```text
ENT-01
  │
  ├── Enterprise capabilities
  ├── Architectural boundaries
  ├── Operating models
  └── Architecture decisions
          │
          ├── ENT-02 — Governance
          ├── ENT-03 — Risk / Assurance
          ├── ENT-04 — Security / Privacy
          ├── ENT-05 — Information Governance
          ├── ENT-06 — Integration
          ├── ENT-07 — Provider Strategy
          ├── ENT-08 — Economics / Portfolio
          └── ENT-09 — Criticality / Resilience
```

ENT-01 may identify architectural implications related to these areas, but it does not re-teach their primary concepts.

Examples of the boundary:

- ENT-01 may identify the need for a shared AI capability.
- ENT-02 addresses governance authority, accountability, decision rights, and lifecycle control.
- ENT-03 addresses AI risk, impact, assurance, and human oversight.
- ENT-04 addresses security, privacy, identity, and access control.
- ENT-05 addresses information governance.
- ENT-06 addresses enterprise integration and shared platform interfaces.
- ENT-07 addresses provider and model strategy.
- ENT-08 addresses economics, portfolio decisions, and funding.
- ENT-09 addresses criticality, dependencies, continuity, and resilience.

---

## Recommended Learning Order

Complete the files sequentially:

```text
01 — Enterprise AI Capabilities and Architectural Boundaries
             ↓
02 — Centralized, Federated, and Hybrid AI Operating Models
             ↓
03 — Enterprise AI Architecture Principles, Boundaries, and Decisions
```

The progression is intentional:

```text
Capability
    ↓
Boundary
    ↓
Responsibility
    ↓
Operating Model
    ↓
Architecture Options
    ↓
Trade-offs
    ↓
Decision
```

This order establishes the context required for the next stage of reasoning before moving into architecture decisions.

---

## Practical Competency

ENT-01 is intended to develop the ability to reason about an unfamiliar enterprise AI initiative at the architecture level.

By the end of the chapter, you should be able to determine:

- What enterprise AI capability is being created.
- Whether the capability should be shared or domain-specific.
- Where meaningful capability and architectural boundaries should exist.
- How responsibilities could be distributed.
- Which operating-model options fit the enterprise context.
- What architecture options are available.
- What trade-offs those options introduce.
- Why a selected architecture is appropriate for the stated requirements and constraints.
- What consequences the decision creates.

The objective is **architecture judgment**, not reproduction of a reference architecture.

---

## Completion Criteria

Consider ENT-01 complete when you can independently:

- Define an enterprise AI capability clearly.
- Distinguish capabilities from applications and technical components.
- Identify appropriate capability and architectural boundaries.
- Explain centralized, federated, and hybrid operating models.
- Select an operating model based on context rather than preference.
- Explain the trade-offs between autonomy, standardization, reuse, coupling, and local optimization.
- Identify relevant architecture principles and constraints.
- Compare competing architecture options.
- Explain the consequences of an architecture decision.
- Defend an architecture decision using explicit engineering reasoning.
- Distinguish architecture responsibilities from governance responsibilities.
- Recognize where ENT-01 ends and another ENT chapter begins.

---

## Repository Navigation

```text
docs/
└── 07-ENT/
    └── ENT-01-Enterprise-AI-Capability-Architecture-and-Operating-Models/
        ├── README.md
        ├── 01-Enterprise-AI-Capabilities-and-Architectural-Boundaries.md
        ├── 02-Centralized-Federated-and-Hybrid-AI-Operating-Models.md
        └── 03-Enterprise-AI-Architecture-Principles-Boundaries-and-Decisions.md
```

Start with **File 01** and proceed sequentially through File 03.

---

## Chapter Completion Check

Before moving to the next ENT chapter, confirm that you can reason through the complete progression:

```text
Enterprise Need
      ↓
AI Capability
      ↓
Capability Boundary
      ↓
Responsibility Boundary
      ↓
Operating Model
      ↓
Architecture Options
      ↓
Trade-offs
      ↓
Architecture Decision
```

The purpose of ENT-01 is to establish the architectural reasoning foundation required for the subsequent enterprise AI chapters.
