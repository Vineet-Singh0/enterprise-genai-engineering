# ENT-07 — Model, Provider and Vendor Strategy

> **Enterprise GenAI Engineering — Enterprise Architecture and Governance**

ENT-07 teaches how enterprises strategically select **AI models and providers**, understand the dependencies those choices create, and preserve meaningful options for **portability, substitution, and exit**.

The central question is:

> **How should an enterprise choose AI models and providers while managing dependency, lock-in, vendor risk, and future substitution or exit?**

---

## Chapter Position

The overall curriculum progression is:

```text
ENG → AIF → LLM → RET → AGT → PROD → ENT
```

Within the ENT domain:

```text
ENT-06
Enterprise Integration and Platform Architecture
        ↓
ENT-07
Model, Provider and Vendor Strategy
        ↓
ENT-08
AI Economics, FinOps and Portfolio Governance
        ↓
ENT-09
AI Criticality, Resilience and Dependency Governance
```

ENT-07 builds on the enterprise integration and platform context established by ENT-06 and provides the provider/model strategy foundation for the economic and dependency-governance decisions covered later in ENT-08 and ENT-09.

---

## What This Chapter Covers

ENT-07 focuses on four connected areas:

- **Model and provider selection**
- **Portability, diversification, concentration, and lock-in**
- **AI-specific vendor risk and procurement implications**
- **Substitution and strategic exit**

The chapter treats provider choice as an enterprise engineering decision rather than a narrow model benchmark exercise.

It also recognizes that dependency is not inherently bad. The objective is to make dependency **intentional, understood, proportionate, and strategically manageable**.

---

## Chapter Contents

### 01 — Enterprise Model and Provider Selection Strategy

**Primary question:**

> How should an enterprise evaluate and select AI models and providers against business, technical, architectural, governance, and strategic requirements?

Covers:

- enterprise requirements
- model selection
- provider selection
- model vs provider decisions
- enterprise suitability
- strategic fit
- capability evaluation criteria
- provider trade-offs
- architectural consequences of provider choice

[Read 01 — Enterprise Model and Provider Selection Strategy](./01-Enterprise-Model-and-Provider-Selection-Strategy.md)

---

### 02 — Provider Diversification, Portability and Vendor Lock-In

**Primary question:**

> How can an enterprise maintain meaningful flexibility when AI capabilities depend on models, providers, applications, data, and operational ecosystems?

Covers:

- model portability
- provider portability
- application portability
- data portability as a strategic dependency
- operational portability
- provider concentration
- diversification
- vendor lock-in
- substitution barriers
- abstraction vs portability

[Read 02 — Provider Diversification, Portability and Vendor Lock-In](./02-Provider-Diversification-Portability-and-Vendor-Lock-In.md)

---

### 03 — AI Vendor Risk, Procurement and Exit Strategy

**Primary question:**

> How should an enterprise manage AI vendor risk and procurement dependencies while preserving viable substitution and exit options?

Covers:

- AI-specific vendor risk
- provider procurement strategy
- contractual dependencies
- service obligations
- provider concentration risk implications
- substitution conditions
- exit planning
- strategic exit criteria

[Read 03 — AI Vendor Risk, Procurement and Exit Strategy](./03-AI-Vendor-Risk-Procurement-and-Exit-Strategy.md)

---

## Learning Progression

The chapter follows a simple progression:

```text
WHICH MODEL OR PROVIDER SHOULD WE CHOOSE?
                    ↓
Enterprise Requirements
Capability Fit
Strategic Fit
Selection Trade-offs
                    ↓
HOW DO WE MANAGE THE DEPENDENCY WE CREATE?
                    ↓
Portability
Diversification
Provider Concentration
Lock-In
Substitution Barriers
                    ↓
WHAT IF THE PROVIDER BECOMES UNSUITABLE OR RISKY?
                    ↓
Vendor Risk
Procurement Implications
Contractual Dependency
Exit Conditions
Substitution
Strategic Exit
```

In short:

```text
Choose
  ↓
Manage Dependency
  ↓
Preserve Exit Options
```

---

## Where This Is Covered
Each major ENT-07 concept has one primary teaching location.

| Area | Primary File |
|---|---|
| Model/provider selection, strategic fit, capability evaluation, and provider trade-offs | [Lesson 01](./01-Enterprise-Model-and-Provider-Selection-Strategy.md) |
| Portability, diversification, concentration, lock-in, and substitution barriers | [Lesson 02](./02-Provider-Diversification-Portability-and-Vendor-Lock-In.md) |
| Vendor risk, procurement implications, contractual dependency, substitution, and exit | [Lesson 03](./03-AI-Vendor-Risk-Procurement-and-Exit-Strategy.md) |

Later sections and related chapters may reference these concepts, but should not re-teach them in depth.

---

## Related Chapters and Boundaries

### ENT-06 — Enterprise Integration and Platform Architecture

ENT-06 focuses on how AI capabilities and providers **integrate into enterprise architecture**, including platforms, shared services, gateways, routing, interoperability, and enterprise interfaces.

ENT-07 focuses on **which models/providers are strategically suitable and how dependency, portability, vendor risk, and exit should be managed**.

---

### ENT-08 — AI Economics, FinOps and Portfolio Governance

ENT-07 may consider economic factors as inputs to provider/model selection.

ENT-08 owns detailed:

- AI economics
- FinOps
- investment
- portfolio prioritization
- funding
- value realization
- portfolio optimization
- sunset decisions

The distinction is:

> **ENT-07 evaluates strategic provider/model relationships. ENT-08 governs economic and portfolio investment decisions.**

---

### ENT-09 — AI Criticality, Resilience and Dependency Governance

ENT-07 addresses provider dependency, concentration, portability, diversification, vendor risk, substitution, and exit from a **strategic vendor/dependency perspective**.

ENT-09 addresses the **criticality, continuity, resilience, degraded-mode, and recovery consequences** of those dependencies.

The distinction is:

> **ENT-07 asks how dependency can be strategically managed or reduced.**

> **ENT-09 asks what continuity and resilience requirements follow from the dependency.**

---

## Chapter Outcome

After completing ENT-07, the engineer should be able to:

- evaluate models and providers beyond narrow benchmark performance
- distinguish model dependency from provider dependency
- identify important portability and lock-in dimensions
- reason about provider concentration and diversification
- evaluate AI-specific vendor risk
- recognize how procurement and contractual conditions affect strategic flexibility
- assess substitution options and define meaningful exit conditions

---

## Navigation

**Previous chapter:**  
ENT-06 — Enterprise Integration and Platform Architecture

**Next chapter:**  
ENT-08 — AI Economics, FinOps and Portfolio Governance

**ENT Domain:**  
[ENT — Enterprise Architecture and Governance](../README.md)

---

## Chapter Structure

---

## Guiding Principle

> **Good provider strategy does not mean avoiding every dependency. It means making dependency an informed engineering and enterprise decision, while preserving meaningful options to adapt, substitute, or exit when circumstances change.**
