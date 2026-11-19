# ENT — Enterprise AI Systems

> Enterprise AI architecture, governance, risk, security and privacy, information control, integration, provider strategy, economics, portfolio decisions, and resilience.

---

## 1. Domain Overview

**ENT — Enterprise AI Systems** focuses on the enterprise-level concerns that arise when AI capabilities move beyond individual models or applications and become organizational capabilities.

Enterprise AI requires more than model and application engineering. An enterprise capability must operate within organizational structures, accountability models, governance requirements, security and privacy boundaries, information controls, integration architectures, economic constraints, provider dependencies, and resilience requirements.

ENT therefore focuses on how technical AI capabilities become **enterprise capabilities** that are governed, accountable, secure, integrated, economically justified, and resilient.

The domain connects technical implementation knowledge from earlier curriculum domains with enterprise-level architecture and decision making.

---

## 2. Central Engineering Question

> **How do we transform AI capabilities into enterprise capabilities that are governed, accountable, secure, integrated, economically justified, and resilient?**

The ENT orientation model is:

```text
Enterprise AI Capability
        ↓
Architecture
        ↓
Governance
        ↓
Risk / Oversight
        ↓
Security / Privacy
        ↓
Information Control
        ↓
Integration
        ↓
Provider / Model Strategy
        ↓
Economics / Portfolio
        ↓
Criticality / Resilience
```

This is an orientation model, not an additional curriculum structure.

It represents the major enterprise concerns that must work together when an AI capability becomes an enterprise system or organizational capability.

---

## 3. Where ENT Fits in the Curriculum

The overall curriculum progression is:

```text
ENG → AIF → LLM → RET → AGT → PROD → ENT
```

### ENG

General engineering foundations.

### AIF

AI foundations.

### LLM

LLM engineering.

### RET

Retrieval engineering.

### AGT

Agent engineering.

### PROD

Production AI engineering.

### ENT

Enterprise AI architecture, governance, strategic control, and resilience.

ENT builds on the implementation and production knowledge developed earlier. It does not re-teach those domains.

---

## 4. What ENT Owns

| Area | ENT Responsibility |
|---|---|
| Enterprise AI Architecture | Capability architecture and operating models |
| Governance | Authority, accountability, lifecycle control, decision rights |
| Risk & Assurance | AI risk, impact, oversight, residual risk, evidence |
| Security & Privacy | Enterprise AI security/privacy/access governance |
| Data & Information | Ownership, authority, provenance, quality, usage constraints |
| Integration & Platform | Enterprise integration and shared AI platform architecture |
| Model / Provider Strategy | Provider selection, portability, concentration, vendor strategy |
| Economics & Portfolio | AI economics, FinOps, investment and portfolio governance |
| Criticality & Resilience | AI criticality, dependency, continuity and resilience requirements |

---

## 5. What ENT Does Not Own

ENT is intentionally bounded. It does not replace the technical domains or generic enterprise disciplines.

| Concern | Primary Boundary |
|---|---|
| Engineering foundations | ENG |
| Model internals and LLM engineering | LLM |
| Retrieval algorithms and retrieval mechanics | RET |
| Agent-specific behavior and safety mechanisms | AGT |
| Production deployment and technical operations | PROD |
| Generic corporate governance | Outside ENT |
| Generic enterprise risk management | Outside ENT |
| Generic IAM implementation | Technical/security domains |
| Data-pipeline engineering | Technical/data engineering domains |
| Retrieval implementation | RET |
| Kubernetes/platform implementation | Technical platform/infrastructure domains |
| Model training internals | LLM / model engineering |
| Infrastructure cost optimization | PROD / infrastructure domains |
| Technical disaster recovery implementation | PROD |
| Generic project portfolio management | Outside ENT |
| Legal interpretation | Legal/compliance functions |

ENT may reference these areas where enterprise decisions depend on them, but it does not take ownership of their detailed implementation or generic methodology.

---

## 6. ENT Learning Outcomes

### Understand

After completing ENT, the learner should understand:

- the major enterprise AI responsibility areas;
- how enterprise AI architecture differs from application-level implementation;
- how governance, risk, security, information, integration, economics, and resilience interact;
- the boundaries between ENT and AGT/PROD and other technical domains.

### Explain

The learner should be able to explain:

- enterprise AI capabilities and operating models;
- governance authority, accountability, and lifecycle control;
- AI risk, impact, human oversight, and assurance;
- enterprise AI security, privacy, and access governance;
- information ownership, authority, provenance, quality, and usage constraints;
- enterprise integration and shared AI platform architecture;
- model, provider, and vendor strategy;
- AI economics, FinOps, and portfolio governance;
- AI criticality, dependency, continuity, and resilience.

### Apply

The learner should be able to apply these concepts to analyze an enterprise AI capability and identify:

- accountability;
- governance requirements;
- risk and oversight requirements;
- security and privacy boundaries;
- authoritative information sources;
- integration boundaries;
- provider dependencies;
- economic considerations;
- portfolio considerations;
- critical dependencies;
- continuity and resilience requirements.

### Design

The learner should be able to design and defend enterprise-level architecture and governance decisions while distinguishing:

- enterprise requirements from technical implementation;
- authorization from identity propagation;
- information provenance from information authority and quality;
- AI risk from capability criticality;
- strategic provider portability from technical migration;
- enterprise resilience from production reliability.

### Teach

The learner should be able to explain how an enterprise transforms an AI capability into a:

- governed;
- secure;
- integrated;
- economically justified;
- accountable;
- resilient

enterprise capability.

---

## 7. Learning Progression

The recommended conceptual progression is:

```text
ENT-01
Enterprise AI architecture and operating models
        ↓
ENT-02
Governance and lifecycle control
        ↓
ENT-03
Risk, impact, oversight and assurance
        ↓
ENT-04
Security, privacy and access governance
        ↓
ENT-05
Data and information governance
        ↓
ENT-06
Integration and platform architecture
        ↓
ENT-07
Model/provider/vendor strategy
        ↓
ENT-08
Economics, FinOps and portfolio governance
        ↓
ENT-09
Criticality, resilience and dependency governance
```

This is the **recommended pedagogical sequence**, not a claim that every chapter is a hard prerequisite for every later chapter.

The curriculum distinguishes between:

- **Hard prerequisites** — knowledge genuinely required before learning a topic.
- **Recommended sequence** — a learning order that improves conceptual progression.
- **Contextual enterprise decision relationships** — relationships between concerns that may matter in real enterprise decisions without creating a learning prerequisite.

---

## 8. Chapter Map

| Chapter | Focus | Core Question | lessons |
|---|---|---|---|
| ENT-01 | Enterprise AI Capability Architecture and Operating Models | How should enterprise AI capabilities and operating models be structured? | 3 |
| ENT-02 | AI Governance, Accountability and Lifecycle Control | Who has authority and how are AI lifecycle decisions governed? | 3 |
| ENT-03 | AI Risk, Impact, Human Oversight and Assurance | What risks, impacts, oversight, controls, and assurance are required? | 4 |
| ENT-04 | Enterprise AI Security, Privacy and Access Governance | What enterprise security, privacy, and access constraints apply? | 3 |
| ENT-05 | Enterprise AI Data Governance and Information Control | What information can be used, who owns it, and how trustworthy and authoritative is it? | 3 |
| ENT-06 | Enterprise AI Integration and Platform Architecture | How should enterprise AI capabilities integrate and share platform capabilities? | 3 |
| ENT-07 | Model, Provider and Vendor Strategy | How should enterprises select, diversify, and manage models and providers? | 3 |
| ENT-08 | AI Economics, FinOps and Portfolio Governance | How should AI economics and portfolio decisions influence enterprise investment? | 3 |
| ENT-09 | AI Criticality, Resilience and Dependency Governance | How should enterprise AI dependencies, continuity, and resilience be governed? | 3 |

---

## 9. Chapter-by-Chapter Navigation

## ENT-01 — Enterprise AI Capability Architecture and Operating Models

[Chapter README](./ENT-01-Enterprise-AI-Capability-Architecture-and-Operating-Models/README.md)

- [01 — Enterprise AI Capabilities and Architectural Boundaries](./ENT-01-Enterprise-AI-Capability-Architecture-and-Operating-Models/01-Enterprise-AI-Capabilities-and-Architectural-Boundaries.md)
- [02 — Centralized, Federated and Hybrid AI Operating Models](./ENT-01-Enterprise-AI-Capability-Architecture-and-Operating-Models/02-Centralized-Federated-and-Hybrid-AI-Operating-Models.md)
- [03 — Enterprise AI Architecture Principles, Boundaries and Decisions](./ENT-01-Enterprise-AI-Capability-Architecture-and-Operating-Models/03-Enterprise-AI-Architecture-Principles-Boundaries-and-Decisions.md)

## ENT-02 — AI Governance, Accountability and Lifecycle Control

[Chapter README](./ENT-02-AI-Governance-Accountability-and-Lifecycle-Control/README.md)

- [01 — AI Governance Authority, Accountability and Decision Rights](./ENT-02-AI-Governance-Accountability-and-Lifecycle-Control/01-AI-Governance-Authority-Accountability-and-Decision-Rights.md)
- [02 — AI System Registration, Lifecycle and Change Governance](./ENT-02-AI-Governance-Accountability-and-Lifecycle-Control/02-AI-System-Registration-Lifecycle-and-Change-Governance.md)
- [03 — Governance Gates, Exceptions and Evidence Ownership](./ENT-02-AI-Governance-Accountability-and-Lifecycle-Control/03-Governance-Gates-Exceptions-and-Evidence-Ownership.md)

## ENT-03 — AI Risk, Impact, Human Oversight and Assurance

[Chapter README](./ENT-03-AI-Risk-Impact-Human-Oversight-and-Assurance/README.md)

- [01 — AI Risk, Context, Impact and Risk Classification](./ENT-03-AI-Risk-Impact-Human-Oversight-and-Assurance/01-AI-Risk-Context-Impact-and-Risk-Classification.md)
- [02 — Human Oversight, Intervention and Escalation Requirements](./ENT-03-AI-Risk-Impact-Human-Oversight-and-Assurance/02-Human-Oversight-Intervention-and-Escalation-Requirements.md)
- [03 — AI Risk Treatment, Controls and Residual Risk](./ENT-03-AI-Risk-Impact-Human-Oversight-and-Assurance/03-AI-Risk-Treatment-Controls-and-Residual-Risk.md)
- [04 — AI Assurance, Evidence and Control Effectiveness](./ENT-03-AI-Risk-Impact-Human-Oversight-and-Assurance/04-AI-Assurance-Evidence-and-Control-Effectiveness.md)

## ENT-04 — Enterprise AI Security, Privacy and Access Governance

[Chapter README](./ENT-04-Enterprise-AI-Security-Privacy-and-Access-Governance/README.md)

- [01 — Enterprise AI Identity, Authorization and Trust Boundaries](./ENT-04-Enterprise-AI-Security-Privacy-and-Access-Governance/01-Enterprise-AI-Identity-Authorization-and-Trust-Boundaries.md)
- [02 — AI Privacy, Sensitive Data and Usage Governance](./ENT-04-Enterprise-AI-Security-Privacy-and-Access-Governance/02-AI-Privacy-Sensitive-Data-and-Usage-Governance.md)
- [03 — AI Access Control, Segregation of Duties and Policy Enforcement](./ENT-04-Enterprise-AI-Security-Privacy-and-Access-Governance/03-AI-Access-Control-Segregation-of-Duties-and-Policy-Enforcement.md)

## ENT-05 — Enterprise AI Data Governance and Information Control

[Chapter README](./ENT-05-Enterprise-AI-Data-Governance-and-Information-Control/README.md)

- [01 — AI Data Ownership, Stewardship and Classification](./ENT-05-Enterprise-AI-Data-Governance-and-Information-Control/01-AI-Data-Ownership-Stewardship-and-Classification.md)
- [02 — AI Data Provenance, Lineage, Quality and Trust](./ENT-05-Enterprise-AI-Data-Governance-and-Information-Control/02-AI-Data-Provenance-Lineage-Quality-and-Trust.md)
- [03 — AI Data Usage, Retention and Information Handling Constraints](./ENT-05-Enterprise-AI-Data-Governance-and-Information-Control/03-AI-Data-Usage-Retention-and-Information-Handling-Constraints.md)

## ENT-06 — Enterprise AI Integration and Platform Architecture

[Chapter README](./ENT-06-Enterprise-AI-Integration-and-Platform-Architecture/README.md)

- [01 — Enterprise AI Integration Patterns and System Boundaries](./ENT-06-Enterprise-AI-Integration-and-Platform-Architecture/01-Enterprise-AI-Integration-Patterns-and-System-Boundaries.md)
- [02 — AI Platforms, Shared Services, Gateways and Control Planes](./ENT-06-Enterprise-AI-Integration-and-Platform-Architecture/02-AI-Platforms-Shared-Services-Gateways-and-Control-Planes.md)
- [03 — AI Interoperability, Identity Propagation and Enterprise Interfaces](./ENT-06-Enterprise-AI-Integration-and-Platform-Architecture/03-AI-Interoperability-Identity-Propagation-and-Enterprise-Interfaces.md)

## ENT-07 — Model, Provider and Vendor Strategy

[Chapter README](./ENT-07-Model-Provider-and-Vendor-Strategy/README.md)

- [01 — Enterprise Model and Provider Selection Strategy](./ENT-07-Model-Provider-and-Vendor-Strategy/01-Enterprise-Model-and-Provider-Selection-Strategy.md)
- [02 — Provider Diversification, Portability and Vendor Lock-In](./ENT-07-Model-Provider-and-Vendor-Strategy/02-Provider-Diversification-Portability-and-Vendor-Lock-In.md)
- [03 — AI Vendor Risk, Procurement and Exit Strategy](./ENT-07-Model-Provider-and-Vendor-Strategy/03-AI-Vendor-Risk-Procurement-and-Exit-Strategy.md)

## ENT-08 — AI Economics, FinOps and Portfolio Governance

[Chapter README](./ENT-08-AI-Economics-FinOps-and-Portfolio-Governance/README.md)

- [01 — AI Cost Models, FinOps and Unit Economics](./ENT-08-AI-Economics-FinOps-and-Portfolio-Governance/01-AI-Cost-Models-FinOps-and-Unit-Economics.md)
- [02 — AI Portfolio Intake, Prioritization, Funding and Value](./ENT-08-AI-Economics-FinOps-and-Portfolio-Governance/02-AI-Portfolio-Intake-Prioritization-Funding-and-Value.md)
- [03 — AI Portfolio Governance, Optimization and Sunset Decisions](./ENT-08-AI-Economics-FinOps-and-Portfolio-Governance/03-AI-Portfolio-Governance-Optimization-and-Sunset-Decisions.md)

## ENT-09 — AI Criticality, Resilience and Dependency Governance

[Chapter README](./ENT-09-AI-Criticality-Resilience-and-Dependency-Governance/README.md)

- [01 — AI Criticality, Dependency Mapping and Concentration Risk](./ENT-09-AI-Criticality-Resilience-and-Dependency-Governance/01-AI-Criticality-Dependency-Mapping-and-Concentration-Risk.md)
- [02 — AI Continuity, Degraded Modes and Recovery Requirements](./ENT-09-AI-Criticality-Resilience-and-Dependency-Governance/02-AI-Continuity-Degraded-Modes-and-Recovery-Requirements.md)
- [03 — Enterprise AI Resilience and Dependency Governance](./ENT-09-AI-Criticality-Resilience-and-Dependency-Governance/03-Enterprise-AI-Resilience-and-Dependency-Governance.md)

---

## 10. Cross-Chapter Relationships

ENT chapters are intentionally connected, but these relationships should not be interpreted as artificial hard prerequisites.

### ENT-01 ↔ ENT-02

**Architecture ↔ governance**

ENT-01 establishes enterprise AI capability architecture and operating models. ENT-02 determines how authority, accountability, lifecycle decisions, and governance controls apply to those capabilities.

### ENT-02 ↔ ENT-03

**Governance authority ↔ risk and assurance input**

ENT-03 determines risk, impact, oversight, treatment, residual risk, and assurance considerations. ENT-02 owns the enterprise governance authority and decision rights through which those inputs become governance decisions.

### ENT-04 ↔ ENT-06

**Authorization semantics ↔ identity/security-context propagation**

> ENT-04 asks **what access is permitted**.

> ENT-06 asks **how relevant identity/security context crosses enterprise boundaries**.

ENT-04 owns authorization semantics and enterprise access governance. ENT-06 owns the architectural propagation of relevant identity and security context across system boundaries.

### ENT-05 ↔ ENT-06

**Information authority ↔ enterprise integration**

ENT-05 establishes information ownership, authority, provenance, quality, trust, and usage constraints. ENT-06 considers how enterprise systems and AI capabilities integrate around those information boundaries.

### ENT-07 ↔ ENT-09

**Provider strategy ↔ dependency, concentration, and resilience**

Provider and model strategy can materially affect enterprise dependency and concentration. ENT-09 considers the resulting criticality, continuity, and resilience implications.

### ENT-08 ↔ ENT-09

**Portfolio investment ↔ criticality and resilience investment**

Portfolio decisions may determine which AI capabilities receive investment, consolidation, or retirement attention. ENT-09 determines the resilience and continuity implications of critical enterprise AI capabilities and dependencies.

---

## 11. Critical Concept Boundaries

### Risk vs Criticality

```text
Risk:
What could go wrong and what could the consequence be?

Criticality:
How important is the capability and what happens if it becomes unavailable or degraded?
```

ENT-03 focuses on AI risk and impact.

ENT-09 focuses on the systemic importance, dependencies, concentration, continuity, and resilience of enterprise AI capabilities.

### Authorization vs Identity Propagation

```text
ENT-04:
What access is permitted?

ENT-06:
How does identity/security context cross enterprise boundaries?
```

### Provenance vs Authority vs Quality vs Trust

```text
Provenance:
Where did the information come from?

Authority:
Which source should the enterprise treat as authoritative?

Quality:
Does the information satisfy required quality characteristics?

Trust / Confidence:
How much confidence should be placed in it?
```

These concepts are related but are not interchangeable.

### Enterprise Resilience vs Production Reliability

```text
ENT-09:
What resilience and continuity outcome must the enterprise achieve?

PROD-06:
How should the production system behave when failure occurs?

PROD-10:
How do operators detect, respond, recover and learn?
```

ENT-09 defines enterprise-level continuity and resilience requirements. PROD addresses technical implementation and operational execution.

### Strategic Provider Portability vs Migration

```text
ENT-07:
Should the enterprise be able to substitute providers/models?

Implementation domain:
How is the migration technically executed?
```

ENT-07 addresses portability as a strategic architectural and dependency concern. It does not teach the technical execution of data migration, application refactoring, or operational migration.

### Portfolio Governance vs Generic Portfolio Management

ENT-08 owns portfolio decisions where **AI-specific economics, risk, dependencies, capabilities, lifecycle, or governance characteristics** materially affect the decision.

It does not replace generic organizational portfolio-management methodology.

---

## 12. Responsible AI Boundary

**Responsible AI is cross-cutting, not a tenth chapter.**

Its enterprise-level concerns are distributed across the existing ENT ownership model:

```text
Responsible AI
├── Governance / accountability ─────── ENT-02
├── Risk / impact / assurance ───────── ENT-03
├── Human oversight ─────────────────── ENT-03
├── Security / privacy / access ─────── ENT-04
├── Data / information governance ───── ENT-05
└── Enterprise lifecycle / controls ─── ENT-02 / ENT-03
```

The boundaries remain:

- **AGT** owns agent-specific safety behavior.
- **PROD** owns production technical security, reliability, observability, and operations.
- **ENT** owns enterprise-level governance and control expectations.

Responsible AI therefore does not require a hidden additional chapter.

---

## 13. Enterprise AI Control Architecture

### Enterprise AI Control Architecture

Enterprise AI Control Architecture represents the organizational and technical structure through which enterprise AI policies, constraints, approvals, identity, risk controls, evidence, and monitoring are applied.

The term **control architecture** should not be confused with an individual governance control.

A **control** is a governance, security, or risk mechanism intended to reduce or manage a defined risk or satisfy a defined requirement.

A **control architecture** is the broader organizational and technical structure that coordinates such mechanisms across enterprise AI capabilities.

> “Control plane” may be used as an explanatory mental model, but ENT does not redefine infrastructure or Kubernetes/platform control planes.

The implementation details belong in the appropriate technical domains.

---

## 14. Enterprise AI Decision Model

A central enterprise decision pattern is:

```text
Enterprise Requirement
        ↓
Applicability
        ↓
Risk / Obligation
        ↓
Policy
        ↓
Control Objective
        ↓
Control
        ↓
Evidence
        ↓
Assurance
        ↓
Governance Decision
```

This provides an orientation model for translating enterprise requirements and obligations into actionable AI controls and governance decisions.

It is not intended to turn the domain README into a compliance tutorial.

---

## 15. Enterprise AI Lifecycle View

The enterprise-level lifecycle can be viewed as:

```text
Capability
    ↓
Architecture
    ↓
Governance
    ↓
Risk / Oversight
    ↓
Build / Integrate
    ↓
Operate
    ↓
Evaluate
    ↓
Change
    ↓
Scale / Consolidate
    ↓
Retire
```

ENT governs enterprise-level decisions across this lifecycle.

Technical implementation, deployment, runtime operations, evaluation mechanisms, and recovery implementation remain owned by the appropriate technical domains.

---

## 16. Practical Engineering Competency

An engineer completing ENT should be able to use enterprise-level reasoning to:

- analyze an enterprise AI capability;
- identify enterprise accountability;
- identify governance requirements;
- identify applicable risk and oversight requirements;
- define security and privacy governance boundaries;
- identify authoritative information sources;
- analyze integration boundaries;
- evaluate provider concentration;
- analyze AI economics;
- evaluate portfolio decisions;
- identify critical dependencies;
- define continuity and resilience requirements;
- explain which concerns belong to AGT, PROD, or ENT.

The emphasis is on **engineering judgment and decision making**, not tool usage.

---

## 17. Technology Philosophy

ENT is:

- framework-neutral;
- vendor-neutral;
- cloud-neutral;
- model-provider-neutral;
- architecture-first;
- concept-first;
- evidence-oriented.

Vendor and framework examples may appear in lessons, but they must not define the curriculum.

---

## 18. Research and Standards Philosophy

The ENT curriculum uses standards, regulatory material, government frameworks, and industry references to identify **durable engineering concepts**.

The curriculum does not organize itself around individual frameworks or vendors.

Examples of reference material include:

- ISO/IEC 42001;
- NIST AI RMF;
- EU AI Act;
- FinOps;
- TOGAF;
- NIST CSF.

These references inform engineering concepts; they are not themselves ENT chapters.

---

## 19. Framework / Vendor Neutrality

ENT concepts should remain useful despite changes in:

- model providers;
- foundation models;
- cloud providers;
- governance frameworks;
- regulations;
- AI platforms;
- orchestration frameworks;
- enterprise tooling.

The goal is to develop durable enterprise engineering judgment rather than dependency on a particular technology or framework.

---

## 20. Prerequisites

ENT assumes sufficient understanding of:

- ENG;
- AIF;
- LLM;
- RET;
- AGT;
- PROD.

This does **not** mean the learner must have mastered every topic in those domains.

The learner should at least understand:

- software/system architecture;
- AI/ML systems;
- LLM systems;
- retrieval;
- agents;
- production AI systems.

The required foundation is the ability to reason about AI systems and their implementation. ENT then extends that reasoning to enterprise architecture and organizational decision making.

---

## 21. Recommended Learning Order

The recommended learning order is:

```text
ENT-01
→ ENT-02
→ ENT-03
→ ENT-04
→ ENT-05
→ ENT-06
→ ENT-07
→ ENT-08
→ ENT-09
```

This is a **recommended learning sequence**, not a strict prerequisite graph.

The sequence provides a coherent progression from enterprise capability architecture through governance, risk, security, information, integration, provider strategy, economics, and finally criticality and resilience.

---

## 22. Interview and Architecture Competency

ENT prepares the learner for advanced architecture and engineering questions such as:

- How would you design an enterprise AI operating model?
- Who should own an AI governance decision?
- How do risk acceptance and residual risk differ?
- How would you separate authorization from identity propagation?
- How do you determine whether enterprise information is authoritative?
- How would you evaluate provider concentration?
- How would you reason about AI portability?
- How should AI-specific economics influence architecture?
- How do criticality and risk differ?
- How would you define enterprise AI continuity requirements?
- Where does ENT stop and PROD/AGT begin?

The lessons provide the deeper reasoning, analysis, and application required to answer these questions.

---

## 23. Domain Completion Criteria

ENT completion means demonstrated engineering competency, not simply reading all files.

The learner should be able to:

- explain the nine ENT responsibility areas;
- correctly distinguish enterprise concerns from technical implementation concerns;
- analyze an enterprise AI capability;
- identify governance and accountability;
- identify risk and oversight requirements;
- identify security and privacy boundaries;
- identify information authority and governance requirements;
- analyze enterprise integration boundaries;
- evaluate model/provider strategy;
- reason about AI economics and portfolio value;
- analyze criticality, dependencies, and resilience;
- defend architectural and governance trade-offs;
- explain how ENT interacts with AGT and PROD.

A learner who can demonstrate these capabilities has completed the intended ENT competency rather than merely completing a reading checklist.

---

## 24. Repository Navigation

- [Enterprise GenAI Engineering Documentation](../README.md)
- [ENG](../01-ENG/README.md)
- [AIF](../02-AIF/README.md)
- [LLM](../03-LLM/README.md)
- [RET](../04-RET/README.md)
- [AGT](../05-AGT/README.md)
- [PROD](../06-PROD/README.md)

---

## 25. ENT Domain Structure

```text
docs/
└── 07-ENT/
    ├── README.md
    ├── ENT-01/
    ├── ENT-02/
    ├── ENT-03/
    ├── ENT-04/
    ├── ENT-05/
    ├── ENT-06/
    ├── ENT-07/
    ├── ENT-08/
    └── ENT-09/
```

### Approved Artifact Count

```text
9 chapters
28 lessons
9 chapter READMEs
1 domain README
38 total Markdown artifacts
```

---

## 26. Concept Ownership

The frozen architecture defines the primary owner of each concept.

- **Governance** → ENT-02
- **Risk / assurance** → ENT-03
- **Authorization** → ENT-04
- **Information authority** → ENT-05
- **Integration** → ENT-06
- **Provider strategy** → ENT-07
- **AI economics / portfolio** → ENT-08
- **Criticality / resilience** → ENT-09

Cross-domain references are expected and encouraged.

Deep re-teaching is not.

The domain README provides orientation and navigation; the chapter lessons provide the actual instruction.
