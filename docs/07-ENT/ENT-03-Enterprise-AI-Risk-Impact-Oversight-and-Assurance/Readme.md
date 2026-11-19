# ENT-03 — Enterprise AI Risk, Impact, Oversight and Assurance

## Purpose

ENT-03 teaches engineers how enterprise AI systems are evaluated from a **risk, impact, oversight, and assurance** perspective.

The chapter focuses on the enterprise engineering question:

> **What can go wrong or cause harm, how significant could the impact be, what level of oversight is appropriate, and what evidence is required to establish confidence in an enterprise AI system?**

The chapter is concerned with **enterprise decision-making around AI risk and impact** rather than generic risk management, compliance, cybersecurity, Responsible AI policy, or framework memorization.

---

## Position in the ENT Domain

ENT is the enterprise architecture and governance layer of the Enterprise GenAI Engineering curriculum.

The overall progression is:

```text
ENG → AIF → LLM → RET → AGT → PROD → ENT
```

Within ENT, ENT-03 focuses on:

- AI risk
- AI impact
- risk and impact assessment
- risk classification
- risk treatment
- residual risk
- oversight
- human oversight
- human control
- assurance
- assurance evidence
- risk and impact reassessment

ENT-03 connects these concerns to enterprise decisions while respecting the ownership of neighboring ENT chapters and earlier engineering domains.

---

## Learning Progression

ENT-03 follows a deliberate three-stage progression:

```text
WHAT?
↓
Risk and Impact Assessment

HOW?
↓
Oversight, Human Control and Assurance

WHAT NEXT?
↓
Risk Treatment, Assurance Maintenance and Reassessment
```

The three lessons should be studied in order.

---

## Chapter Structure

### 01 — AI Risk and Impact Assessment

[AI Risk and Impact Assessment](./01-AI-Risk-and-Impact-Assessment.md)

**Primary question:**

> What can go wrong, who or what can be affected, and how should the enterprise understand the significance of those risks and impacts?

This lesson establishes the foundation for:

- AI risk
- AI impact
- risk and impact identification
- assessment
- classification
- prioritization
- uncertainty
- affected stakeholders
- consequential decisions
- context-dependent risk

---

### 02 — AI Oversight, Human Control and Assurance

[AI Oversight Human Control and Assurance](./02-AI-Oversight-Human-Control-and-Assurance.md)

**Primary question:**

> Given the risk and impact of an AI system, what oversight and assurance are necessary to establish justified confidence and maintain appropriate human control?

This lesson focuses on:

- oversight
- human oversight
- human control
- intervention
- review and approval
- escalation
- assurance
- assurance evidence
- meaningful human oversight
- proportional oversight
- confidence versus certainty

It builds on the risk and impact assessment established in Lesson 01.

---

### 03 — AI Risk Treatment, Assurance and Continuous Reassessment

[AI Risk Treatment Assurance and Continuous Reassessment](./03-AI-Risk-Treatment-Assurance-and-Continuous-Reassessment.md)

**Primary question:**

> Once risks and impacts are understood, how are they treated, how is assurance maintained, and when must the enterprise reassess its confidence and decisions?

This lesson focuses on:

- risk treatment
- treatment effectiveness
- residual risk
- risk acceptance
- assurance maintenance
- evidence refresh
- continuous reassessment
- material changes
- emerging risks
- incident- or failure-driven reassessment
- restriction, pause, or retirement where risk can no longer be acceptably managed

It completes the progression from assessment to ongoing enterprise decision-making.

---

## Core Chapter Principle

ENT-03 applies **proportionality**.

The level of assessment, oversight, assurance, and risk treatment should reflect the characteristics and consequences of the AI system rather than applying identical controls to every system.

Relevant considerations can include:

- risk and impact
- decision consequence
- affected stakeholders
- uncertainty
- autonomy
- reversibility
- scale
- business context
- criticality
- applicable obligations

The chapter does not prescribe a universal enterprise risk taxonomy or a single mandatory scoring model.

---

## Recommended Background

Readers should have a working understanding of:

- enterprise AI systems
- AI/ML and GenAI fundamentals
- AI system lifecycle concepts
- software and production-system thinking
- enterprise governance concepts

Readers should also be familiar with the broader Enterprise GenAI Engineering curriculum and the ENT domain context.

---

## Cross-Domain Relationships

ENT-03 is intentionally connected to neighboring domains without taking ownership of their detailed implementation.

| Related Area | Primary Relationship |
|---|---|
| ENT-02 | Governance, accountability, decision rights, approvals and lifecycle governance |
| ENT-04 | Security and privacy risk context |
| ENT-05 | Data-related risk and impact context |
| ENT-06 | Integration and platform risk context |
| ENT-07 | Model/provider dependency and suitability risk context |
| ENT-08 | Financial impact and enterprise economics context |
| ENT-09 | Criticality, resilience and dependency context |
| AGT-10 | Agent evaluation evidence used as an assurance input |
| AGT-11 | Agent-specific safety risks considered from an enterprise risk perspective |
| PROD | Production evidence and operational signals used as assurance inputs |

These relationships are boundaries, not additional ENT-03 teaching areas.

ENT-03 should not re-teach:

- security engineering
- privacy engineering
- data governance
- integration architecture
- model/provider strategy
- AI economics and FinOps
- criticality and resilience governance
- agent behavioral evaluation
- agent safety engineering
- production reliability and operations

---

## Enterprise Scenarios

The chapter uses enterprise scenarios to develop risk and assurance reasoning, including:

- AI-assisted hiring
- financial and customer decision support
- healthcare-related decision support
- enterprise copilots
- AI systems operating on enterprise data
- AI-generated recommendations
- autonomous or semi-autonomous AI systems
- model or provider changes

The scenarios are used to develop enterprise decision-making skills rather than technology-specific implementation knowledge.

---

## Chapter Outcome

After completing ENT-03, an engineer should be able to reason about an enterprise AI system across the following lifecycle:

```text
AI System
    ↓
Risk / Impact Assessment
    ↓
Oversight and Human Control
    ↓
Assurance Evidence
    ↓
Risk Treatment
    ↓
Residual Risk Decision
    ↓
Reassessment
```

The expected outcome is not memorization of a particular framework.

The engineer should be able to determine:

- what risks and impacts require attention
- what level of oversight is proportionate
- what evidence is needed to support confidence
- how remaining risk should be treated
- when previously made decisions need to be revisited

---

## How to Use This Chapter

Read the three lessons sequentially. Each file builds on the reasoning established by the previous file.

---

## Chapter Navigation

- [01 — AI Risk and Impact Assessment](./01-AI-Risk-and-Impact-Assessment.md)
- [02 — AI Oversight, Human Control and Assurance](./02-AI-Oversight-Human-Control-and-Assurance.md)
- [03 — AI Risk Treatment, Assurance and Continuous Reassessment](./03-AI-Risk-Treatment-Assurance-and-Continuous-Reassessment.md)

---

## Scope Boundary

ENT-03 focuses on **enterprise AI risk, impact, oversight, assurance, risk treatment, and reassessment**.

Detailed implementation of security, privacy, data governance, integration, model/provider strategy, economics, resilience, agent safety, evaluation, and production engineering remains owned by the corresponding domains.

---

# End of Document
