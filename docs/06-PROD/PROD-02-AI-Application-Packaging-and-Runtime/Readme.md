# PROD-02 — AI Application Packaging and Runtime

## Chapter Purpose

This chapter establishes the engineering foundations for turning an AI application into a **reproducible, identifiable, and well-defined production artifact** that can run consistently across environments.

The chapter focuses on what must be packaged, how dependencies and configuration are represented, how runtime assumptions are made explicit, and how production artifacts can be identified and traced back to their inputs and build process.

The chapter does **not** teach deployment. Deployment depends on having a well-defined artifact and runtime contract, but deployment itself belongs to later production engineering topics.

### Central Engineering Question

> **How do we turn an AI application into a reproducible and well-defined production artifact that can run consistently across environments?**

### Core Mental Model

```text
Development Environment
        ↓
Application + Dependencies + Configuration
        ↓
Reproducible Production Artifact
        ↓
Defined Runtime Contract
        ↓
Consistent Execution
```

A production artifact is reliable only when the important inputs and assumptions behind it are known and controlled.

---

## Scope

PROD-02 covers the packaging and runtime foundation required for production AI applications.

The chapter focuses on:

- Application packaging
- Reproducibility
- Dependency capture and versioning
- Runtime consistency
- Containers as packaging and isolation mechanisms
- Environment configuration
- Configuration contracts
- Runtime contracts
- Application, model, and supporting artifacts
- Artifact identity
- Artifact provenance and lineage
- Build-to-artifact relationships
- Environment compatibility
- Reproducibility records
- Packaging boundaries and artifact composition decisions

The chapter also addresses AI-specific packaging considerations such as:

- Model weights
- Tokenizers
- Embedding models
- Prompt and configuration assets
- Vector indexes where applicable
- Pre-processing and post-processing components
- Model configuration
- Inference dependencies
- Accelerator and runtime compatibility
- External model-provider configuration

These components should not automatically be assumed to belong in one artifact. A key engineering responsibility is deciding **what should be packaged together and what should remain external**, while preserving clear relationships between the resulting artifacts.

---

## What PROD-02 Owns

PROD-02 owns the engineering foundation required to define a production AI application as a reproducible and well-understood runtime artifact.

This lesson covers:
- What constitutes the application artifact
- What inputs are required to reproduce it
- How dependencies are represented and controlled
- How runtime assumptions are documented
- How configuration is separated from application code
- How containers contribute to runtime consistency
- How runtime contracts are defined
- How application and AI artifacts are identified
- How artifact provenance and lineage are represented
- How build inputs relate to resulting artifacts
- How environment compatibility is reasoned about
- How packaging boundaries affect reproducibility and operational behavior

---

## What PROD-02 Does Not Own

Several closely related concerns belong to other production engineering chapters.

### PROD-01 — Production AI Problem and Production Boundaries

PROD-01 owns:

- Production problem framing
- Production system boundaries
- System architecture
- Service boundaries
- Production workload characteristics
- Production-level architectural trade-offs

PROD-02 uses these boundaries as context but does not re-teach production architecture.

### PROD-03 — AI Model Serving

PROD-03 owns:

- Inference serving
- Serving architectures
- Inference servers
- Batching
- Concurrency
- Streaming inference
- Serving routing

PROD-02 may define runtime requirements relevant to serving, but it does not become a model-serving guide.

### PROD-04 — CI/CD and Production Delivery

PROD-04 owns:

- CI/CD
- Artifact promotion
- Infrastructure provisioning
- Deployment
- Progressive delivery
- Release gates
- Rollback
- Change-safety mechanisms

PROD-02 establishes what an artifact and runtime contract are. PROD-04 addresses how those artifacts are delivered and promoted through environments.

### PROD-07 — Scaling and Capacity

PROD-07 owns:

- Scaling
- Capacity planning
- Capacity management
- Workload growth
- Scaling strategies

PROD-02 may define resource and runtime requirements that an application expects, but it does **not** own scaling or capacity engineering.

### PROD-09 — Production AI Security and Supply-Chain Trust

PROD-09 owns security concerns such as:

- Supply-chain security
- Dependency security
- Artifact tampering
- Unauthorized artifacts
- Security controls
- Trust and verification mechanisms

PROD-02 owns artifact **identity, provenance, and lineage** as engineering traceability concepts, but does not teach the security controls used to establish trust.

A useful distinction is:

```text
Identity
"What exactly is this artifact?"

Provenance
"Where did it come from and how was it produced?"

Integrity
"Has it changed unexpectedly?"

Security / Trust Controls
"How do we verify and protect it?"
```

PROD-02 establishes the first two concepts and provides the context needed to reason about the third. Security and trust controls belong to PROD-09.

### PROD-11 — Production AI Lifecycle and Evaluation Integration

PROD-11 owns:

- Production lifecycle integration
- Evaluation integration
- Lifecycle-oriented production processes

PROD-02 may establish artifact identity, reproducibility records, and runtime metadata that later lifecycle processes depend on, but it does **not** own lifecycle or evaluation integration.

---

## Learning Outcomes

After completing PROD-02, the learner should be able to:

1. Explain why reproducibility is a production requirement.
2. Define what should and should not be included in an AI application artifact.
3. Identify direct and transitive dependencies that affect runtime behavior.
4. Explain how dependency drift creates production inconsistency.
5. Distinguish build reproducibility, runtime reproducibility, and behavioral reproducibility.
6. Explain what containers provide and what they do not guarantee.
7. Distinguish a container image from a running container.
8. Separate application code, configuration, secrets, artifacts, and environment concerns.
9. Define a practical runtime contract for an AI application.
10. Identify runtime assumptions involving dependencies, configuration, filesystems, networks, external services, resources, and startup behavior.
11. Reason about packaging AI-specific artifacts such as model weights, tokenizers, indexes, and model configuration.
12. Explain artifact identity, provenance, and lineage.
13. Trace the relationship between source, build inputs, generated artifacts, and runtime.
14. Evaluate packaging trade-offs such as bundled versus externalized components.
15. Explain why containerization alone does not guarantee reproducibility.
16. Reason about environment compatibility and configuration differences across environments.
17. Evaluate whether a production artifact is sufficiently identifiable and reproducible for downstream production processes.

---

## Learning Progression

The chapter progresses from the basic packaging problem toward explicit runtime and artifact management.

```text
01 — Packaging and Reproducibility
          ↓
02 — Containers, Configuration, and Runtime Contracts
          ↓
03 — Production Artifacts, Dependencies, and Environment Configuration
```

### Lesson 01 — AI Application Packaging and Reproducibility

Primary question:

> **What does it mean to package an AI application reproducibly?**

This lesson establishes the foundation:

- Application boundaries
- Dependency capture
- Reproducibility
- Build inputs and outputs
- Runtime assumptions
- AI-specific reproducibility challenges
- Artifact identity
- The "works on my machine" problem

Containers are introduced only as context for packaging and reproducibility.

### Lesson 02 — Containers, Configuration, and Runtime Contracts

Primary question:

> **How do we define a consistent runtime environment and make its assumptions explicit?**

This lesson builds on reproducibility and introduces:

- Containers as packaging and isolation
- Image and container mental models
- Runtime environments
- Configuration separation
- Environment variables
- Configuration contracts
- Runtime assumptions
- Ports and interfaces conceptually
- Health and readiness expectations conceptually
- Resource and environment assumptions
- Runtime contracts
- Immutable artifact thinking

The file does not become a Docker, Kubernetes, or deployment tutorial.

### Lesson 03 — Production Artifacts, Dependencies, and Environment Configuration

Primary question:

> **How should production AI artifacts, dependencies, and environment configuration be identified, managed, and traced?**

This lesson brings the earlier concepts together around:

- Application artifacts
- Model artifacts
- Supporting artifacts
- Dependency graphs
- Version relationships
- Environment-specific configuration
- Configuration hierarchy
- Artifact metadata
- Identity
- Provenance
- Lineage
- Build-to-artifact relationships
- Reproducibility records
- Environment compatibility
- Artifact properties required for downstream production processes

This lesson establishes the artifact properties and metadata that downstream production processes can rely on. It does **not** teach artifact promotion workflows, CI/CD pipelines, deployment strategies, or release processes; those belong to PROD-04.

---

## Core Mental Models

### 1. Reproducibility

```text
Reproducibility
=
Known Inputs
+
Known Dependencies
+
Known Build Process
+
Known Configuration
+
Known Runtime
+
Identifiable Artifact
```

Reproducibility does not mean that every model invocation must return identical output.

The chapter distinguishes:

- **Build reproducibility** — the build can be recreated from known inputs.
- **Runtime reproducibility** — the artifact executes under a known and compatible runtime environment.
- **Behavioral reproducibility** — the system exhibits sufficiently consistent behavior under controlled conditions.

Packaging improves reproducibility, but it does not automatically eliminate model nondeterminism or all sources of behavioral variation.

### 2. Runtime Contract

A runtime contract describes the assumptions an application requires in order to execute correctly.

It can include:

- Runtime version
- Dependencies
- Required configuration
- Required environment variables
- Network assumptions
- Filesystem assumptions
- External service dependencies
- Resource expectations
- Startup behavior
- Input/output interfaces
- Health expectations

The goal is to make implicit runtime assumptions explicit.

### 3. Artifact Traceability

```text
Source
   ↓
Build
   ↓
Artifact
   ↓
Metadata / Provenance
   ↓
Runtime
```

The resulting artifact should be identifiable, and its relationship to relevant source, dependencies, build inputs, configuration assumptions, and associated AI artifacts should be understandable.

---

## AI-Specific Packaging Concepts

AI applications introduce packaging decisions that ordinary application services may not have.

Depending on the architecture, an AI application may depend on:

- Model weights
- Tokenizers
- Embedding models
- Prompt assets
- Model configuration
- Vector indexes
- Pre-processing logic
- Post-processing logic
- Inference libraries
- Accelerator runtimes
- External model providers
- Model-provider configuration

These components may have different lifecycle, size, compatibility, and operational characteristics.

Therefore, PROD-02 emphasizes the engineering question:

> **Which components should be packaged together, and which should remain external?**

There is no universal answer.

The decision depends on factors such as:

- Runtime compatibility
- Artifact size
- Update frequency
- Ownership
- Reproducibility requirements
- Deployment independence
- Resource requirements
- External service dependencies

---

## Key Engineering Trade-offs

PROD-02 develops reasoning around trade-offs rather than prescribing a single packaging strategy.

| Decision | Trade-off |
|---|---|
| Monolithic vs multiple artifacts | Simplicity and coupling vs independent lifecycle |
| Model bundled vs external | Reproducibility and locality vs artifact size and update flexibility |
| Pinned dependencies vs update flexibility | Stability vs ease of adopting updates |
| Larger vs smaller artifacts | Self-containment vs transfer/build/runtime cost |
| Build complexity vs runtime flexibility | More controlled builds vs greater runtime configurability |
| Immutable vs runtime modification | Reproducibility and traceability vs runtime flexibility |
| Centralized vs application-local configuration | Consistency vs local ownership |
| Reproducibility vs rapid updates | Stability vs change velocity |
| Artifact independence vs coupling | Independent evolution vs coordinated compatibility |

The correct decision depends on the application's requirements and operational context.

---

## Dependencies

PROD-02 builds on concepts established in earlier production engineering work, especially:

- Production problem boundaries
- System and service boundaries
- Workload characteristics
- Production-level trade-offs

These concepts are used as context rather than re-taught.

---

## Cross-Chapter Relationships

The primary relationships are:

```text
PROD-01
Production Problem & Boundaries
        ↓
PROD-02
Packaging & Runtime
        ↓
PROD-03
Model Serving
        ↓
PROD-04
CI/CD & Production Delivery
```

Additional relationships include:

```text
PROD-02
   ├── Runtime/resource assumptions ──→ PROD-07 Scaling & Capacity
   ├── Artifact trust/security ───────→ PROD-09 Security & Supply Chain
   └── Artifact lifecycle/evaluation ─→ PROD-11 Lifecycle & Evaluation
```

These relationships are intentionally directional.

PROD-02 establishes packaging, runtime, identity, reproducibility, and provenance foundations that other production concerns can build upon.

---

## Critical Boundaries

The following boundaries should remain clear throughout the chapter:

```text
PROD-02
Packaging
Reproducibility
Dependencies
Configuration
Runtime Contracts
Artifact Identity
Provenance
        │
        ├────────→ PROD-03
        │          Serving
        │
        ├────────→ PROD-04
        │          Delivery
        │
        ├────────→ PROD-07
        │          Scaling & Capacity
        │
        ├────────→ PROD-09
        │          Security & Supply Chain
        │
        └────────→ PROD-11
                   Lifecycle & Evaluation
```

PROD-02 should provide the foundations required by these areas without becoming a replacement for them.

---

## Recommended Learning Order

Complete the files in order:

1. AI Application Packaging and Reproducibility
2. Containers Configuration and Runtime Contracts
3. Production Artifacts Dependencies and Environment Configuration

The order matters because each file builds on the previous mental model.

First understand **why reproducibility matters**.

Then understand **how runtime environments and contracts help make assumptions explicit**.

Finally understand **how production artifacts, dependencies, configuration, identity, and provenance fit together**.

---

## Chapter Completion Criteria

PROD-02 is complete when the learner can reason about an AI application as a production artifact rather than simply as source code.

The learner should be able to:

- Define the application's packaging boundary.
- Explain why reproducibility matters in production.
- Identify dependencies and compatibility requirements.
- Distinguish application code, configuration, secrets, artifacts, and environment.
- Explain the role and limits of containers.
- Define a runtime contract.
- Identify important runtime assumptions.
- Decide which AI artifacts should be bundled or externalized.
- Identify an artifact clearly.
- Explain where an artifact came from and how it was produced.
- Distinguish identity from provenance and security-oriented integrity controls.
- Explain how environment differences affect reproducibility.
- Reason about packaging trade-offs.
- Explain how PROD-02 connects to serving, delivery, scaling, security, and lifecycle concerns without confusing their ownership.

Completion should be demonstrated through engineering reasoning, not memorization.

---

## Navigation

### lessons

- [01 — AI Application Packaging and Reproducibility](./01-AI-Application-Packaging-and-Reproducibility.md)
- [02 — Containers, Configuration, and Runtime Contracts](./02-Containers-Configuration-and-Runtime-Contracts.md)
- [03 — Production Artifacts, Dependencies, and Environment Configuration](./03-Production-Artifacts-Dependencies-and-Environment-Configuration.md)

### Related Production Topics

- [PROD-01 — Production AI Problem and Production Boundaries](../PROD-01-Production-AI-System-Foundations/Readme.md)
- [PROD-03 — AI Model Serving](../PROD-03-Production-Model-and-AI-Serving/Readme.md)
- [PROD-04 — CI/CD and Production Delivery](../PROD-04-Deployment-and-Release-Engineering/Readme.md)
- [PROD-07 — Scaling and Capacity](../PROD-07-Scaling-and-Capacity-Engineering/Readme.md)
- [PROD-09 — Production AI Security and Supply-Chain Trust](../PROD-09-Production-AI-Security/Readme.md)
- [PROD-11 — Production AI Lifecycle and Evaluation Integration](../PROD-11-AI-Lifecycle-Evaluation-and-Continuous-Improvement/Readme.md)

---

## Chapter Principle

> **A production AI application is not simply source code. It is an identifiable artifact with known dependencies, configuration, runtime assumptions, and provenance that can be reproduced and executed consistently across environments.**
