# ENT-08 — AI Economics, FinOps and Portfolio Governance

## Overview

ENT-08 teaches how enterprises reason about the **economic and portfolio-level decisions surrounding AI capabilities**.

The focus is not generic finance, accounting, project management, or corporate portfolio management. The focus is how economic evidence and portfolio-level reasoning influence decisions about which AI capabilities should be **funded, scaled, continued, optimized, consolidated, reduced, or retired**.

The central engineering question is:

> **How should economic evidence and portfolio-level reasoning influence which AI capabilities the enterprise funds, scales, consolidates, optimizes, or retires?**

ENT-08 follows the progression:

```text
Economics
    ↓
Investment Decisions
    ↓
Portfolio Evolution
```

---

## Learning Objectives

After completing ENT-08, the learner should be able to:

- understand the economic structure of AI capabilities;
- reason about AI cost, value, and total economic impact;
- understand AI-specific FinOps and unit economics;
- evaluate AI opportunities using economic and strategic evidence;
- distinguish AI initiatives, capabilities, and systems/solutions;
- reason about AI investment capacity and funding decisions;
- distinguish expected value from realized value;
- evaluate AI portfolio health and value realization;
- identify duplication and overlapping capabilities;
- reason about consolidation and portfolio optimization;
- determine when capabilities should continue, scale, reduce, consolidate, or sunset;
- distinguish economic optimization from technical optimization;
- distinguish economic optimization from portfolio optimization;
- make evidence-based AI investment and portfolio decisions.

---

## Prerequisites

ENT-08 assumes familiarity with the broader enterprise AI concepts covered by the ENT domain, particularly:

- enterprise AI capabilities and operating models;
- enterprise AI governance;
- AI risk and assurance;
- security, privacy, and authorization;
- enterprise data governance;
- enterprise integration and platform architecture;
- model, provider, and vendor strategy;
- criticality, resilience, and dependency considerations.

ENT-08 does not reteach these domains. They provide context and inputs to economic and portfolio decisions.

---

## Chapter Structure

ENT-08 contains three lessons.

### 01 — AI Cost Models, FinOps and Unit Economics

**Primary question:**

> **What does an AI capability cost, what drives that cost, and how should the enterprise measure and manage its economics?**

This file establishes the economic foundation.

It covers AI cost structures, cost allocation and attribution, AI-specific FinOps, cost forecasting, unit economics, cost drivers, cost-to-outcome relationships, and economic optimization.

[Read File 01 →](./01-AI-Cost-Models-FinOps-and-Unit-Economics.md)

---

### 02 — AI Portfolio Intake, Prioritization, Funding and Value

**Primary question:**

> **Which AI initiatives or capabilities should the enterprise prioritize, fund, and scale?**

This file establishes the investment-decision foundation.

It covers AI initiative intake, opportunity assessment, strategic alignment, value hypotheses, expected value, prioritization, funding, investment-capacity allocation, sequencing, portfolio balancing, and experimentation-versus-scale decisions.

[Read File 02 →](./02-AI-Portfolio-Intake-Prioritization-Funding-and-Value.md)

---

### 03 — AI Portfolio Governance, Optimization and Sunset Decisions

**Primary question:**

> **Once AI capabilities exist in the portfolio, how should the enterprise decide what to scale, continue, optimize, consolidate, reduce, or retire?**

This file addresses portfolio evolution after investment decisions have been made.

It covers AI investment and portfolio decision governance, portfolio health, value realization, duplication, consolidation, portfolio optimization, rebalancing, continuation, scale, reduction, and sunset decisions.

[Read File 03 →](./03-AI-Portfolio-Governance-Optimization-and-Sunset-Decisions.md)

---

## Learning Progression

The three files form one deliberate learning sequence:

```text
01 — Economics
     Cost Models
        ↓
     FinOps
        ↓
     Unit Economics

02 — Investment Decisions
     Intake
        ↓
     Prioritization
        ↓
     Funding
        ↓
     Expected Value

03 — Portfolio Evolution
     Portfolio Decision Governance
        ↓
     Value Realization
        ↓
     Optimization
        ↓
     Consolidation
        ↓
     Sunset
```

The progression is:

> **Economics → Investment Decisions → Portfolio Evolution**

Complete the files in this order.

---

## Core Terminology

ENT-08 distinguishes three related but different concepts:

| Term | Meaning |
|---|---|
| **AI Initiative** | A proposed or active investment effort intended to create, improve, adopt, or scale an AI capability |
| **AI Capability** | An enduring enterprise capability providing a defined AI-enabled business or technical function |
| **AI System / Solution** | A concrete implementation that delivers an AI capability |

The relationship is:

```text
AI Initiative
    ↓
Creates or improves
    ↓
AI Capability
    ↓
Delivered through
    ↓
AI System / Solution
```

Portfolio decisions may operate at different levels, so the decision level should always be explicit.

---

## Key Distinctions

Several distinctions are central to ENT-08:

| Distinction | Focus |
|---|---|
| **Cost vs Value** | Economic consumption versus useful outcome |
| **Cost vs Price** | Enterprise economic cost versus provider or supplier price |
| **Direct vs Shared Cost** | Cost associated with one capability versus cost shared across capabilities |
| **Allocation vs Attribution** | Assigning shared cost versus associating cost with a workload, capability, consumer, or outcome |
| **Unit Cost vs Unit Economics** | Cost per unit versus the relationship between cost, success, and outcome |
| **Expected vs Realized Value** | Investment hypothesis versus observed evidence |
| **Economic vs Technical Optimization** | Economic efficiency versus technical implementation optimization |
| **Economic vs Portfolio Optimization** | Individual capability economics versus enterprise portfolio composition |
| **Portfolio Decision Governance vs Enterprise Governance** | Investment and portfolio decisions versus enterprise governance authority and mechanisms |

These distinctions are developed in the lessons rather than treated as interchangeable concepts.

---

## Core Decision Perspective

ENT-08 connects economic evidence with AI investment and portfolio decisions.

At a high level:

```text
Economic Evidence
       ↓
Investment / Portfolio Context
       ↓
Decision
       ↓
Fund / Scale / Continue / Reduce / Consolidate / Sunset
       ↓
Value Realization
       ↓
Portfolio Review
```

The framework is contextual rather than a universal mathematical formula.

Relevant evidence may include:

- economic feasibility;
- expected or realized value;
- strategic alignment;
- evidence strength;
- capability reuse;
- organizational capacity;
- dependencies;
- risk inputs;
- adoption;
- cost trajectory.

No single metric determines an AI portfolio decision.

---

## Value Realization

ENT-08 distinguishes **expected value** from **realized value**.

```text
File 02
Expected Value
    ↓
Investment Hypothesis
    ↓
Investment Decision

File 03
Observed / Realized Value
    ↓
Portfolio Review
    ↓
Continue / Scale / Reduce / Consolidate / Sunset
```

File 02 focuses on the value expected to justify investment.

File 03 uses observed evidence to inform subsequent portfolio decisions.

---

## Portfolio Lifecycle

ENT-08 uses the following conceptual portfolio lifecycle:

```text
Discover
    ↓
Assess
    ↓
Prioritize
    ↓
Fund
    ↓
Build / Adopt
    ↓
Scale
    ↓
Consolidate
    ↓
Optimize
    ↓
Sunset
```

This lifecycle is conceptual rather than strictly linear.

An enterprise may pause investment, return an initiative to assessment, reduce funding, replace a capability, merge capabilities, or change strategic direction.

Value realization and economic evidence continuously inform these decisions.

The lifecycle should not be interpreted as requiring every capability to pass through every stage.

---

## Economic Optimization vs Portfolio Optimization

These concepts have different decision scopes.

### Economic Optimization

**File 01** focuses on the economic efficiency of an individual AI workload or capability.

The question is:

> **How can this AI workload or capability become economically efficient?**

### Portfolio Optimization

**File 03** focuses on the composition of the enterprise AI portfolio.

The question is:

> **Is this capability the right use of enterprise AI investment capacity given the other capabilities in the portfolio?**

Therefore:

```text
Economic Optimization
        ↓
Individual workload / capability economics

Portfolio Optimization
        ↓
Enterprise portfolio composition
```

The detailed reasoning and trade-offs belong in the corresponding lessons.

---

## Cross-Domain Boundaries

ENT-08 interacts with other enterprise AI domains but does not replace their ownership.

| Domain | Boundary |
|---|---|
| **ENT-01** | Owns enterprise AI capability architecture and operating models |
| **ENT-02** | Owns governance authority, accountability, decision rights, and lifecycle governance |
| **ENT-03** | Owns AI risk, impact, assurance, and human oversight |
| **ENT-04** | Owns security, privacy, and authorization |
| **ENT-05** | Owns information and data governance |
| **ENT-06** | Owns enterprise integration and platform architecture |
| **ENT-07** | Owns model, provider, and vendor strategy |
| **ENT-09** | Owns criticality, resilience, and dependency governance |
| **PROD** | Owns production implementation, operations, reliability, performance, and technical cost-performance engineering |

ENT-08 focuses specifically on:

> **AI economics, FinOps, investment decisions, and portfolio evolution.**

Cross-domain concepts should be referenced rather than re-taught in depth.

---

## Recommended Learning Order

Study the files sequentially:

```text
01 — AI Cost Models, FinOps and Unit Economics
                    ↓
02 — AI Portfolio Intake, Prioritization, Funding and Value
                    ↓
03 — AI Portfolio Governance, Optimization and Sunset Decisions
```

The learning path is intentionally cumulative:

1. Understand AI economics and cost drivers.
2. Use economic and strategic evidence to reason about investment decisions.
3. Use realized evidence to evolve the AI portfolio.

---

## Chapter Outcome

After completing ENT-08, the learner should be able to reason about AI economics and portfolio decisions as an interconnected engineering discipline:

```text
AI Capability
      ↓
Economic Understanding
      ↓
Investment Decision
      ↓
Fund / Scale / Continue
      ↓
Evidence & Value Realization
      ↓
Portfolio Review
      ↓
Optimize / Consolidate / Reduce / Sunset
```

The objective is not to find a universal AI investment formula.

The objective is to develop the engineering judgment required to determine:

- which AI capabilities deserve enterprise investment;
- how much investment they warrant;
- what evidence should influence that decision;
- when investment should increase or decrease;
- when capabilities should be consolidated;
- and when the evidence justifies sunset.

---

## Related Domains

ENT-08 should be studied alongside the other ENT domain chapters, particularly:

- ENT-01 — Enterprise AI Capability Architecture
- ENT-02 — Enterprise AI Governance
- ENT-03 — AI Risk, Assurance and Human Oversight
- ENT-04 — AI Security, Privacy and Access Governance
- ENT-05 — AI Data Governance
- ENT-06 — Enterprise AI Integration and Platform Architecture
- ENT-07 — AI Model, Provider and Vendor Strategy
- ENT-09 — AI Criticality, Resilience and Dependency Governance

The corresponding chapter READMEs provide the authoritative navigation and ownership boundaries for those domains.

---

## Chapter Navigation

```text
ENT-08
│
├── README.md
│
├── 01-AI-Cost-Models-FinOps-and-Unit-Economics.md
│       │
│       └── Economics
│
├── 02-AI-Portfolio-Intake-Prioritization-Funding-and-Value.md
│       │
│       └── Investment Decisions
│
└── 03-AI-Portfolio-Governance-Optimization-and-Sunset-Decisions.md
        │
        └── Portfolio Evolution
```

**ENT-08 principle:**

> **Understand the economics → make better investment decisions → evolve the portfolio using evidence.**
