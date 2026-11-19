# ENT-05 — Enterprise AI Data Governance and Information Control

## Purpose

ENT-05 establishes the information-governance perspective required for enterprise AI systems.

The chapter focuses on how enterprise AI information is:

- owned and stewarded
- classified
- evaluated for authority and trust
- traced through provenance and lineage
- evaluated for quality and fitness for purpose
- governed through usage, retention, and handling constraints
- managed throughout its information lifecycle

The chapter treats information governance as an enterprise engineering concern without turning into a database, data-engineering, privacy, security, IAM, retrieval, or production-operations handbook.

---

## Learning Progression

ENT-05 follows this progression:

```text
Information
    ↓
Ownership & Stewardship
    ↓
Classification & Responsibility
    ↓
Authority & Authoritative Sources
    ↓
Provenance & Lineage
    ↓
Quality & Trust
    ↓
Usage & Handling Constraints
    ↓
Retention & Lifecycle Governance
    ↓
Ongoing Review
```

The three teaching files should be studied in order.

---

## Chapter Structure

### 01 — AI Data Ownership, Stewardship and Classification

**Primary question:**

> Who owns and stewards the information, how is it classified, and how are information-governance responsibilities established?

This file covers:

- information and data ownership
- stewardship
- responsibility and accountability
- business, technical, domain, and shared-data ownership
- information producers and consumers
- classification
- governance responsibilities
- source and derived-information responsibility

**Primary concepts:** Ownership · Stewardship · Classification · Responsibility

[Read 01 — AI Data Ownership, Stewardship and Classification](./01-AI-Data-Ownership-Stewardship-and-Classification.md)

---

### 02 — AI Data Provenance, Lineage, Quality and Trust

**Primary question:**

> Which source should be recognized as authoritative, where did the information come from, how did it change, what evidence supports its quality and trust, and is it fit for the intended use?

This file covers:

- authority and authoritative sources
- source confidence and conflicting information
- provenance
- lineage
- traceability
- information quality
- fitness for purpose
- trust
- derived and AI-generated information

**Primary concepts:** Authority · Provenance · Lineage · Quality · Trust

[Read 02 — AI Data Provenance, Lineage, Quality and Trust](./02-AI-Data-Provenance-Lineage-Quality-and-Trust.md)

---

### 03 — AI Data Usage, Retention and Information Handling Constraints

**Primary question:**

> Under what conditions may enterprise information be used, transformed, shared, retained, and handled throughout its lifecycle?

This file covers:

- permitted and intended use
- secondary use
- downstream use and reuse
- transformation and sharing constraints
- information handling
- retention
- lifecycle governance
- derived and AI-generated information handling
- lifecycle review and retirement

**Primary concepts:** Usage · Handling · Retention · Lifecycle Governance

[Read 03 — AI Data Usage, Retention and Information Handling Constraints](./03-AI-Data-Usage-Retention-and-Information-Handling-Constraints.md)

---

## Concept Ownership

Each major ENT-05 concept has a primary teaching location.

| Concept Area | Primary File |
|---|---|
| Ownership | File 01 |
| Stewardship | File 01 |
| Classification | File 01 |
| Responsibility | File 01 |
| Authority | File 02 |
| Authoritative Sources | File 02 |
| Provenance | File 02 |
| Lineage | File 02 |
| Quality | File 02 |
| Trust | File 02 |
| Usage Constraints | File 03 |
| Secondary Use | File 03 |
| Information Handling | File 03 |
| Retention | File 03 |
| Information Lifecycle Governance | File 03 |

Later chapters or domains may reference these concepts, but detailed teaching should remain in their primary location.

---

## Information Governance Across the AI Information Lifecycle

ENT-05 considers information across a broad lifecycle:

```text
Source Information
      ↓
Acquisition
      ↓
Validation
      ↓
Transformation
      ↓
AI Processing
      ↓
Derived Information
      ↓
AI Output
      ↓
Downstream Use
      ↓
Retention / Retirement
```

The governance focus changes as information moves through the lifecycle:

```text
Ownership
    ↓
Classification
    ↓
Authority
    ↓
Provenance & Lineage
    ↓
Quality & Trust
    ↓
Permitted Use
    ↓
Handling
    ↓
Retention
    ↓
Ongoing Review
```

This lifecycle is a conceptual reasoning model, not a universal enterprise process.

---

## Related Domain Boundaries

ENT-05 connects with other enterprise domains while retaining a distinct information-governance responsibility.

| Related Area | Relationship to ENT-05 |
|---|---|
| ENT-02 | Enterprise governance accountability, decision rights, operating models, and system lifecycle governance |
| ENT-03 | Risk, impact, oversight, human control, and assurance |
| ENT-04 | Security, privacy, identity, authorization, and access boundaries |
| ENT-06 | Enterprise integration and platform architecture |
| ENT-07 | Model, provider, and vendor strategy |
| ENT-08 | AI economics and FinOps |
| ENT-09 | Criticality, resilience, and dependency governance |
| RET | Retrieval architecture and retrieval engineering |
| PROD | Production implementation and operational mechanisms |

ENT-05 governs the **information meaning, responsibility, authority, trust, permitted use, retention, and handling requirements** associated with enterprise AI information. Other domains own their respective architectural, operational, security, retrieval, risk, economic, and resilience concerns.

---

## Recommended Reading Order

Read the chapter sequentially:

```text
01 — Ownership, Stewardship & Classification
                    ↓
02 — Authority, Provenance, Lineage, Quality & Trust
                    ↓
03 — Usage, Retention & Information Handling
```

The progression moves from:

```text
Who is responsible?
        ↓
What information should we trust and why?
        ↓
What are we allowed and expected to do with it?
```

---

## Chapter Outcome

After completing ENT-05, readers should be able to reason about enterprise AI information governance across:

- ownership and stewardship
- authority, provenance, lineage, quality, and trust
- usage, handling, retention, and lifecycle governance

The chapter also establishes the distinction between information governance and related concerns such as security, privacy, retrieval engineering, risk, and AI system lifecycle governance.

The detailed engineering reasoning for these concepts is contained in the three teaching files above.
