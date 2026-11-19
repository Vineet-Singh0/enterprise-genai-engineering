# ENT-04 — Enterprise AI Security, Privacy and Access Governance

## Purpose

This chapter establishes the enterprise-level governance foundation for securing AI systems, protecting information and interactions, and controlling who or what may access AI capabilities and enterprise resources.

The chapter focuses on the governance question:

> Who or what should be allowed to access enterprise AI capabilities and information, under which conditions, and how should security, privacy, and access responsibilities be governed across the enterprise?

The chapter provides the conceptual and governance foundation for security, privacy, identity, authorization, access boundaries, and control integration in enterprise AI systems.

---

## Position in the Enterprise AI Curriculum

ENT-04 belongs to the **Enterprise AI Systems (ENT)** domain.

The ENT domain addresses enterprise-level architecture, governance, security, integration, economic, and operational decisions required to deploy AI capabilities responsibly across an organization.

ENT-04 establishes the security, privacy, and access-governance foundation that other enterprise AI capabilities depend on.

It follows the broader enterprise architecture and governance foundations established in:

- ENT-01 — Enterprise AI Architecture and Operating Models
- ENT-02 — Enterprise AI Governance and Accountability
- ENT-03 — Enterprise AI Risk, Oversight and Assurance

---

## What This Chapter Covers

The chapter covers:

- Enterprise AI security governance
- Enterprise AI privacy governance
- Identity and authorization concepts
- AI access boundaries
- Least privilege and separation of duties
- Access lifecycle and revocation
- AI-specific security and privacy exposure considerations
- Protection of AI systems, interactions, information, and capabilities
- Security and privacy control integration
- Control ownership and responsibility boundaries
- Control evidence and effectiveness
- Exceptions and compensating controls
- Lifecycle review and reassessment
- Shared platform controls versus application-specific controls

The emphasis is on **governance, boundaries, responsibilities, and control integration**, rather than detailed implementation of security technologies.

---

## Learning Progression

The chapter follows three progressively deeper questions:

```text
WHAT?
Security + Privacy + Access Governance
        ↓
WHO / UNDER WHICH CONDITIONS?
Identity + Authorization + Access Boundaries
        ↓
HOW?
Security / Privacy Controls + Governance Integration
```

The progression moves from establishing what must be governed, to determining who or what may access enterprise capabilities, and finally to integrating security and privacy controls into the enterprise AI governance lifecycle.

---

## Chapter Structure

### 01 — AI Security, Privacy and Access Governance

**File:** `01-AI-Security-Privacy-and-Access-Governance.md`

Establishes the conceptual foundation for enterprise AI security, privacy, and access governance.

The file addresses the responsibilities enterprises must govern when AI systems interact with:

- People
- Data
- Models
- Tools
- Enterprise capabilities
- External providers
- AI-generated content
- Logs and telemetry

It also establishes the boundaries between security, privacy, identity, access, authorization, accountability, and governance.

---

### 02 — Identity, Authorization and AI Access Boundaries

**File:** `02-Identity-Authorization-and-AI-Access-Boundaries.md`

Defines how enterprise AI access should be governed.

The file focuses on:

- Principals and identities
- Authentication versus authorization
- Access requests and decisions
- Roles, attributes, permissions, and policies
- Resource and capability boundaries
- Context-dependent authorization
- Least privilege
- Separation of duties
- Delegated access
- AI application and workload access
- AI-to-data and AI-to-capability boundaries
- Access lifecycle and revocation
- Authorization failure handling

---

### 03 — AI Security, Privacy Controls and Governance Integration

**File:** `03-AI-Security-Privacy-Controls-and-Governance-Integration.md`

Establishes how security and privacy controls become part of enterprise AI governance rather than remaining isolated technical mechanisms.

The file focuses on:

- Control objectives
- Preventive, detective, and corrective controls
- Security and privacy controls
- Control ownership
- Evidence
- Control effectiveness
- Exceptions
- Compensating controls
- Shared platform controls
- Application-specific controls
- Control gaps
- Review and reassessment
- Lifecycle integration
- Change-driven reassessment

---

## Prerequisites

Before starting ENT-04, readers should understand the enterprise architecture and governance foundations established earlier in the ENT domain:

- ENT-01 — Enterprise AI Architecture and Operating Models
- ENT-02 — Enterprise AI Governance and Accountability
- ENT-03 — Enterprise AI Risk, Oversight and Assurance

These chapters establish the architectural, accountability, governance, and risk context needed for ENT-04.

---

## Cross-Domain Boundaries

ENT-04 interacts with several other curriculum areas but does not replace their ownership.

Key boundaries include:

- **AGT** — Agent capabilities, tools, and agent safety. ENT-04 governs enterprise security and access boundaries rather than detailed agent behavior or tool execution.
- **PROD** — Production security implementation and operational controls. ENT-04 establishes governance requirements and control responsibilities rather than detailed production implementation.
- **ENT-05** — Enterprise data governance. ENT-04 addresses privacy and access implications without owning enterprise data-governance policy and stewardship.
- **ENT-06** — Enterprise AI integration and platform architecture.
- **ENT-07** — Model, provider, and vendor strategy.
- **ENT-08** — Enterprise AI economics and FinOps.
- **ENT-09** — Criticality, resilience, and dependency governance.

These boundaries prevent ENT-04 from re-teaching implementation details or governance responsibilities owned elsewhere in the curriculum.

---

## What This Chapter Does Not Cover

ENT-04 does **not** serve as:

- A generic cybersecurity course
- A privacy-law handbook
- An IAM vendor tutorial
- A cryptography course
- A cloud-security implementation guide
- An enterprise data-governance chapter
- An agent-safety chapter
- A tool-execution implementation guide
- A production security implementation chapter
- A model/provider strategy chapter
- A FinOps chapter
- An enterprise integration architecture chapter
- A criticality or resilience engineering chapter

Those subjects remain owned by their respective curriculum areas.

---

## Recommended Reading Order

Read the files sequentially:

1. `01-AI-Security-Privacy-and-Access-Governance.md`
2. `02-Identity-Authorization-and-AI-Access-Boundaries.md`
3. `03-AI-Security-Privacy-Controls-and-Governance-Integration.md`

The sequence is intentional:

```text
Security / Privacy / Access Governance
                ↓
Identity / Authorization / Access Boundaries
                ↓
Controls / Evidence / Governance Integration
```

Later files build on the governance concepts established earlier rather than independently re-teaching them.

---

## Chapter Completion

The chapter can be considered complete when the reader can:

- Explain the enterprise security, privacy, and access responsibilities created by AI systems.
- Distinguish identity, authentication, authorization, access, privacy, security, and governance.
- Reason about AI-specific access boundaries.
- Explain why authorization must be governed independently at each relevant resource or capability boundary.
- Describe how security and privacy controls connect to governance, evidence, review, and reassessment.

Detailed understanding and application are developed within the three lessons.
