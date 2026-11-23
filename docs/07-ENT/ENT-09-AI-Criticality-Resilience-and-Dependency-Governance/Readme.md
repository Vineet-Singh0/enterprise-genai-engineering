# ENT-09 — AI Criticality, Resilience and Dependency Governance

## Overview

ENT-09 defines how enterprise AI capabilities are assessed and governed from a **criticality, dependency, continuity, and resilience** perspective.

The chapter focuses on understanding:

- how important an AI capability is to the enterprise;
- which upstream, downstream, shared, and common dependencies affect it;
- where dependency concentration creates resilience exposure;
- what continuity and degraded-operation outcomes are required;
- when fallback, substitution, or recovery capabilities are necessary; and
- how resilience requirements and dependency posture should be governed over time.

ENT-09 does **not** teach generic enterprise risk management, infrastructure disaster recovery, production incident response, vendor procurement, or portfolio investment management. Those concerns remain owned by their respective domains.

## Learning Objectives

By completing this chapter, you should be able to:

- distinguish **AI criticality** from generic AI risk;
- reason about AI capability criticality without relying on a universal scoring model;
- identify upstream, downstream, shared, common, and concentrated dependencies;
- explain how dependency concentration can create correlated disruption;
- define continuity requirements for critical AI-enabled capabilities;
- reason about degraded modes, fallback, substitution, and minimum viable AI capability;
- distinguish continuity requirements from technical recovery implementation;
- evaluate resilience trade-offs involving cost, complexity, standardization, redundancy, and substitutability;
- establish an enterprise-oriented approach to dependency and resilience governance; and
- reassess resilience posture as AI capabilities, dependencies, architecture, and business requirements change.

## Prerequisites

Before starting ENT-09, you should understand the relevant concepts from:

- **ENT-02 — Enterprise AI Governance**
- **ENT-03 — AI Risk, Impact and Assurance**
- **ENT-05 — Enterprise AI Data Governance**
- **ENT-06 — Enterprise AI Architecture and Integration**
- **ENT-07 — AI Provider, Model and Vendor Strategy**
- **ENT-08 — AI Portfolio Governance and Value Management**

**PROD — Production AI Engineering** is a supporting reference for understanding the distinction between enterprise resilience requirements and the technical reliability, recovery, and operational mechanisms used to implement them.

## Lessons
### Lesson 01 — Criticality, Dependency Mapping and Concentration Risk

[Open Lesson 01](./01-AI-Criticality-Dependency-Mapping-and-Concentration-Risk.md)

Establishes the foundation for resilience reasoning by examining:

- AI capability criticality;
- criticality reasoning and consequences;
- upstream and downstream dependencies;
- shared and common dependencies;
- dependency visibility;
- dependency concentration; and
- common failure exposure.

The central question is:

> **How important is this AI capability, what does it depend on, and where could concentrated dependencies create enterprise-wide disruption?**

### Lesson 02 — Continuity, Degraded Modes and Recovery Requirements

[Open Lesson 02](./02-AI-Continuity-Degraded-Modes-and-Recovery-Requirements.md)

Builds on the dependency and criticality analysis to define:

- continuity requirements;
- degraded operating modes;
- fallback;
- substitution;
- minimum viable AI capability;
- acceptable disruption and degradation tolerance; and
- enterprise recovery requirements.

The central question is:

> **If the preferred AI capability or dependency becomes unavailable or degraded, how must the required business outcome continue, and what recovery outcome is required?**

### Lesson 03 — Enterprise AI Resilience and Dependency Governance

[Open Lesson 03](./03-Enterprise-AI-Resilience-and-Dependency-Governance.md)

Brings the previous concepts together into enterprise resilience governance covering:

- resilience strategy;
- dependency governance;
- concentration reduction;
- strategic redundancy;
- resilience trade-offs;
- dependency and resilience reviews;
- change-driven reassessment; and
- continuous resilience posture management.

The central question is:

> **How should the enterprise govern resilience requirements and dependency posture as AI capabilities and their operating context evolve?**

## Learning Progression

The chapter follows this progression:

```text
Criticality
    ↓
Dependency Mapping
    ↓
Dependency Concentration
    ↓
Continuity Requirements
    ↓
Degraded Modes and Fallback
    ↓
Recovery Requirements
    ↓
Resilience Strategy
    ↓
Dependency Governance
    ↓
Continuous Review
```

The progression is intentionally outcome-oriented:

**Understand Criticality → Define Required Continuity → Govern Resilience**

## Cross-Domain References

| Domain | Primary Ownership | ENT-09 Relationship |
|---|---|---|
| **ENT-02** | Enterprise AI governance, authority, accountability, and decision rights | Provides governance context for resilience-related dependency decisions |
| **ENT-03** | AI risk, impact, controls, residual risk, and assurance | Provides risk context; ENT-09 focuses on criticality and resilience consequences |
| **ENT-06** | Enterprise AI architecture, integration, and system boundaries | Provides architectural context for dependency relationships |
| **ENT-07** | Provider, model, vendor strategy, diversification, portability, and exit | Provides provider/model strategy context for dependency and substitution decisions |
| **ENT-08** | AI portfolio investment, prioritization, funding, and value | Provides portfolio context when resilience requirements require investment decisions |
| **PROD** | Production reliability, operational recovery, incident response, and technical implementation | Implements technical mechanisms that may satisfy resilience requirements defined by ENT-09 |

## Completion Guidance

Complete the chapter in order:

1. **Lesson 01** — establish criticality and dependency understanding.
2. **Lesson 02** — translate that understanding into continuity, degraded-mode, fallback, and recovery requirements.
3. **Lesson 03** — use those requirements to reason about resilience strategy and dependency governance.

You should be able to explain the complete reasoning chain:

```text
Criticality
→ Dependencies
→ Concentration
→ Failure / Degradation Consequences
→ Continuity
→ Fallback / Substitution
→ Recovery Requirements
→ Resilience Strategy
→ Governance
→ Continuous Review
```

The chapter is complete when you can apply this reasoning to an enterprise AI capability and define a defensible **resilience and continuity posture** without treating resilience as synonymous with infrastructure uptime, generic risk scoring, or technical disaster recovery.

## Key Takeaway

**ENT-09 is about deciding what resilience an enterprise AI capability requires based on its criticality, dependencies, continuity needs, and concentration exposure — and governing those requirements as the enterprise changes.**
