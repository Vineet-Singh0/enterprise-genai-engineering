# Production Artifacts, Dependencies, and Environment Configuration

## Learning Objectives

By the end of this chapter, you should be able to:

- Identify the artifacts that make up a production AI application.
- Distinguish application code, model artifacts, supporting artifacts, dependencies, configuration, and environment-specific inputs.
- Explain direct and transitive dependencies and why dependency state matters for reproducibility.
- Explain how artifact identity, metadata, lineage, and provenance support traceability.
- Define what information should be known about a production AI artifact.
- Separate code, configuration, secrets, artifacts, and environment-specific values.
- Explain how environment-specific configuration affects runtime behavior.
- Identify compatibility relationships between application, model, runtime, dependencies, and environment.
- Explain how reproducibility records connect build inputs to production artifacts.
- Reason about packaging boundaries and when components should be bundled or externalized.
- Explain the conceptual characteristics of an artifact that make it ready for promotion between environments.

## Prerequisites

You should already understand:

- What a production AI system is and why production boundaries matter.
- The basic idea of application packaging and reproducibility.
- Runtime environments, containers, and runtime contracts.
- The distinction between application code and runtime configuration.

Recommended reading:

- [PROD-01 — Production AI Problem and Production Boundaries](../PROD-01-Production-AI-Problem-and-Production-Boundaries/README.md)
- [01 — AI Application Packaging and Reproducibility](./01-AI-Application-Packaging-and-Reproducibility.md)
- [02 — Containers, Configuration, and Runtime Contracts](./02-Containers-Configuration-and-Runtime-Contracts.md)

## Estimated Reading Time

Approximately 30–40 minutes.

---

## Before We Start

A production AI application is rarely just source code.

A typical system may contain:

```text
Application
├── Source code
├── Runtime dependencies
├── Model artifacts
├── Tokenizers / preprocessing assets
├── Prompt or policy configuration
├── Model configuration
├── Supporting data or indexes
├── Environment configuration
└── Runtime assumptions
```

These components do not necessarily need to be packaged together.

The important engineering question is:

> **What must be identified, versioned, related, and controlled so that the production artifact can be understood and reproduced?**

This chapter focuses on that question.

---

# 1. Why Production Artifacts Need Explicit Management

A development environment can hide many dependencies.

An engineer may know that an application works because:

- a particular Python version is installed,
- a library happens to be available,
- a model file exists on the local machine,
- an environment variable is configured,
- a specific system library is installed,
- a particular model version is being used,
- or a local service is running.

The application may work correctly while these assumptions remain implicit.

Production systems cannot depend on invisible assumptions.

A production artifact should therefore have a clearly understood relationship with:

```text
Source
  ↓
Dependencies
  ↓
Build
  ↓
Artifact
  ↓
Configuration
  ↓
Runtime
```

The goal is not merely to store files.

The goal is to make the artifact's important characteristics **known, identifiable, and traceable**.

---

# 2. What Is a Production Artifact?

A production artifact is a concrete output that is intended to be executed, loaded, or consumed by a production system.

Examples include:

- an application package,
- a container image,
- a model artifact,
- a tokenizer,
- a preprocessing package,
- a model configuration,
- a compiled component,
- a vector index,
- a static application asset,
- or another runtime-required package.

An AI application may therefore have multiple artifacts.

For example:

```text
AI Application
│
├── Application Artifact
│   └── API / business logic
│
├── Model Artifact
│   └── Model weights
│
├── Supporting Artifacts
│   ├── Tokenizer
│   ├── Preprocessing configuration
│   └── Prompt configuration
│
└── Runtime Dependencies
    ├── Application libraries
    ├── ML libraries
    └── System dependencies
```

The exact structure depends on the architecture.

There is no universal rule that every component must be packaged together.

---

# 3. Artifact Identity

Before an artifact can be reliably managed, engineers need to know **which artifact they are referring to**.

Artifact identity answers questions such as:

- What is this artifact?
- Which version is it?
- Which application or model does it belong to?
- Which build produced it?
- Which variant is it?
- Which environment or compatibility requirements apply?

A simple conceptual identity might look like:

```text
Artifact
├── Name
├── Version
├── Variant
├── Build reference
└── Compatibility information
```

For example:

```text
customer-recommendation-service
version: 2.4.1
variant: inference
runtime: Python 3.x
model: recommendation-model 7.2
```

The exact representation is implementation-specific.

The engineering principle is not.

> **A production artifact should be uniquely understandable within the system that manages it.**

Artifact identity is different from integrity.

Identity answers:

> “Which artifact is this?”

Integrity answers:

> “Has this artifact changed unexpectedly?”

Integrity and security controls are outside the primary scope of this chapter.

---

# 4. AI Applications Have Multiple Artifact Types

Traditional applications may primarily package source code and dependencies.

AI applications often introduce additional artifacts.

Consider an application that performs document classification.

It may require:

```text
Application
├── API code
├── Business logic
├── Model
├── Tokenizer
├── Preprocessing configuration
├── Post-processing configuration
└── Runtime dependencies
```

A generative AI application may instead depend on:

```text
Application
├── Application code
├── Prompt configuration
├── Model/provider configuration
├── Retrieval configuration
├── Embedding model
├── Vector index
└── Runtime dependencies
```

Not every system contains all of these.

The important question is:

> **Which artifacts are required for the application to behave as intended?**

---

# 5. Packaging Boundaries

One of the most important production decisions is deciding **what belongs inside an artifact and what should remain external**.

Suppose an AI application requires a model.

There are several possible designs.

### Model bundled with application

```text
Application Artifact
├── Application
├── Dependencies
└── Model
```

Advantages may include:

- simpler runtime dependency discovery,
- stronger coupling between application and model versions,
- easier reproduction of a known application/model combination.

Disadvantages may include:

- larger artifacts,
- slower artifact creation or transfer,
- tighter coupling between application and model lifecycle.

### Model externalized

```text
Application Artifact
        │
        └──────► External Model Artifact
```

Advantages may include:

- independent model lifecycle,
- smaller application artifact,
- reuse of a model by multiple applications.

Disadvantages may include:

- additional runtime dependency,
- more compatibility relationships,
- greater need for explicit version management.

Neither design is universally better.

The correct choice depends on:

- lifecycle requirements,
- artifact size,
- deployment model,
- runtime architecture,
- compatibility constraints,
- update frequency,
- operational requirements.

The key requirement is that the relationship must be explicit.

---

# 6. Dependency Engineering

An application rarely depends on only the libraries explicitly imported in its source code.

There are usually multiple layers of dependencies.

```text
Application
    │
    ├── Direct Dependency A
    │       │
    │       └── Transitive Dependency C
    │
    ├── Direct Dependency B
    │       │
    │       └── Transitive Dependency D
    │
    └── System Dependency
```

## 6.1 Direct Dependencies

A direct dependency is something the application explicitly relies on.

Examples:

- web framework,
- database client,
- model runtime,
- SDK,
- numerical library.

## 6.2 Transitive Dependencies

A transitive dependency is introduced through another dependency.

For example:

```text
Application
    ↓
Library A
    ↓
Library B
```

The application may never directly import Library B, but Library A depends on it.

This matters because changing Library B can potentially affect runtime behavior even when application code has not changed.

---

# 7. Dependency Versioning

Dependency state is part of reproducibility.

Consider:

```text
Application v1
Dependency A
Dependency B
Dependency C
```

If those dependency versions are allowed to change without control, the same application source may produce different runtime environments over time.

A production dependency strategy therefore commonly includes:

- explicit versions,
- controlled dependency resolution,
- compatibility constraints,
- reproducible dependency records,
- awareness of system-level dependencies.

Lock files or equivalent dependency-resolution records may be used where appropriate.

The specific package manager is an implementation choice.

The engineering requirement is:

> **The dependency state required to reproduce an artifact should be knowable.**

---

# 8. AI-Specific Dependency Compatibility

AI applications introduce additional compatibility relationships.

For example:

```text
Application
    ↓
Inference Library
    ↓
Model Runtime
    ↓
Accelerator / System Runtime
```

A model may be compatible with one runtime version but not another.

A model may also depend on:

- a specific tokenizer version,
- a particular model configuration,
- a specific preprocessing implementation,
- a particular inference runtime,
- an accelerator runtime,
- or a particular numerical library.

Therefore, dependency management for AI systems is not simply about application libraries.

It also involves understanding relationships between:

```text
Application
↕
Model
↕
Model Runtime
↕
System / Accelerator Runtime
```

These compatibility relationships should be identifiable when they matter to execution.

---

# 9. Configuration Is Not an Artifact

A common production mistake is treating configuration as if it were application code.

Consider:

```text
Application Code
    +
Hard-coded Production Values
```

This makes the artifact environment-dependent.

A better conceptual separation is:

```text
Code
Configuration
Secrets
Artifacts
Environment
```

These categories are related but different.

### Code

Defines application behavior.

Examples:

- business logic,
- API handlers,
- processing logic.

### Configuration

Controls behavior without changing application source.

Examples:

- model identifier,
- service endpoint,
- timeout,
- feature flag,
- retrieval limit,
- environment-specific behavior.

### Secrets

Sensitive values required by the application.

Examples:

- credentials,
- authentication tokens,
- private keys.

Secret management is intentionally not covered deeply here.

### Artifacts

Concrete runtime inputs.

Examples:

- model weights,
- tokenizer,
- vector index,
- packaged application.

### Environment

The runtime context in which the application executes.

Examples:

- development,
- staging,
- production.

Keeping these categories separate makes the system easier to reason about.

---

# 10. Environment-Specific Configuration

The same application artifact may run in different environments.

For example:

```text
                 Same Artifact
                      │
          ┌───────────┴───────────┐
          ↓                       ↓
     Staging Config          Production Config
          │                       │
          ↓                       ↓
    Staging Services        Production Services
```

The application code does not necessarily need to change.

Instead, environment-specific values can change.

Examples include:

- service endpoints,
- model identifiers,
- feature flags,
- timeout values,
- resource-related settings,
- external service configuration.

This separation supports a useful principle:

> **The artifact should remain stable while environment-specific configuration changes around it.**

However, configuration itself can introduce compatibility problems.

For example:

```text
Application expects:
MODEL_ID

Production provides:
MODEL_NAME
```

The application may start but fail during initialization or execution.

Configuration therefore needs an explicit contract.

---

# 11. Configuration Hierarchy

Production systems often have multiple configuration sources.

A conceptual hierarchy might look like:

```text
Default Configuration
        ↓
Environment Configuration
        ↓
Runtime Configuration
        ↓
Explicit Overrides
```

The exact precedence rules depend on the implementation.

What matters is that the precedence is known.

If engineers do not know which value wins, debugging becomes difficult.

For example:

```text
Default timeout = 30s
Environment timeout = 60s
Runtime override = 90s
```

The system should have a predictable rule for determining the effective value.

Configuration should therefore be:

- explicit,
- discoverable,
- validated where appropriate,
- environment-aware,
- and governed by predictable precedence.

---

# 12. Environment Compatibility

A production artifact may be correctly built but still fail to execute in an environment that does not satisfy its assumptions.

For example:

```text
Artifact
   │
   ├── Requires Runtime X
   ├── Requires Dependency Y
   ├── Requires Model Z
   └── Requires Accelerator Capability A
              │
              ↓
        Target Environment
```

Compatibility may involve:

- runtime version,
- library versions,
- system libraries,
- model/runtime compatibility,
- accelerator availability,
- filesystem expectations,
- network access,
- external services,
- configuration requirements.

Therefore:

> **Artifact identity alone is not enough. The artifact's compatibility expectations must also be understood.**

---

# 13. Artifact Metadata

Artifacts often need metadata beyond their basic name and version.

Useful metadata may describe:

| Metadata | Purpose |
|---|---|
| Artifact name | Identifies the artifact |
| Version | Identifies the artifact revision |
| Build reference | Connects artifact to its build |
| Source reference | Identifies the source used |
| Dependency state | Describes runtime dependencies |
| Model reference | Identifies associated model artifact |
| Runtime requirements | Describes execution assumptions |
| Configuration expectations | Describes required configuration |
| Compatibility information | Identifies important constraints |
| Provenance information | Connects artifact to its origin |

Not every system needs the same metadata fields.

The principle is:

> **Record the information required to understand, reproduce, and operate the artifact.**

---

## 14. Artifact Lineage and Provenance

Artifact lineage describes the relationship between an artifact and the inputs or processes that produced it.

A useful conceptual model is:

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

This allows engineers to ask questions such as:

- Which source produced this artifact?
- Which build produced it?
- Which dependencies were used?
- Which model artifact is associated with it?
- Which configuration assumptions apply?
- Which runtime does it expect?

For an AI application, provenance may include relationships such as:

```text
Application Source
       ↓
Application Build
       ↓
Application Artifact
       │
       ├──── Model Artifact
       │
       ├──── Dependency State
       │
       └──── Configuration Expectations
```

This does not imply that every component must be physically bundled together.

It means the relationships should be traceable.

---

# 15. Reproducibility Records

Reproducibility depends on more than storing application source.

A useful conceptual model is:

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

This can be translated into practical questions:

| Question | Example |
|---|---|
| What source was used? | Source revision |
| What dependencies were used? | Resolved dependency state |
| How was it built? | Build process/version |
| What model was used? | Model version |
| What configuration was expected? | Configuration schema/values |
| What runtime was required? | Runtime version |
| What artifact resulted? | Artifact identity |

The exact record format is implementation-specific.

The principle is not.

---

# 16. Three Different Forms of Reproducibility

Reproducibility is not a single property.

It is useful to distinguish three forms.

## 16.1 Build Reproducibility

Can the same known inputs and build process produce the same or equivalent artifact?

```text
Known Inputs
     +
Known Build
     ↓
Repeatable Artifact
```

## 16.2 Runtime Reproducibility

Can the artifact execute consistently when the expected runtime conditions are provided?

```text
Artifact
    +
Expected Runtime
    ↓
Consistent Execution
```

## 16.3 Behavioral Reproducibility

Does the system produce sufficiently consistent behavior for the intended use case?

This is more difficult for AI systems.

Model outputs may vary because of:

- stochastic generation,
- model/provider changes,
- external data changes,
- retrieval changes,
- floating-point behavior,
- runtime differences,
- configuration changes.

Therefore:

> **Packaging and dependency control improve reproducibility, but they do not guarantee deterministic AI outputs.**

---

# 17. Production AI Packaging Example

Consider a FastAPI-based AI service.

The service performs:

```text
Request
   ↓
API
   ↓
Preprocessing
   ↓
Model Inference
   ↓
Post-processing
   ↓
Response
```

Its production artifacts might be:

```text
Application Artifact
├── API code
├── Business logic
├── Pre/post-processing
└── Application dependencies

Model Artifact
├── Model weights
└── Model configuration

Supporting Artifacts
└── Tokenizer

Configuration
├── Model identifier
├── Service endpoints
└── Runtime settings
```

A packaging decision must determine which of these are bundled together and which remain external.

For example:

```text
Application Artifact
       │
       ├────────► Model Artifact
       │
       └────────► Configuration
```

The important engineering requirement is that the relationships are explicit.

---

# 18. LLM Application Example

Consider an application that uses an external model provider.

The application may not package model weights at all.

Instead:

```text
Application Artifact
├── Application code
├── Dependencies
└── Prompt / application configuration
          │
          ↓
   External Model Provider
```

The application may still need to identify:

- model identifier,
- provider configuration,
- API interface expectations,
- timeout settings,
- fallback behavior,
- prompt configuration,
- embedding model configuration if retrieval is used.

The model itself is external.

That does not mean it is irrelevant to artifact identity or reproducibility.

The application still depends on a particular external model configuration.

---

# 19. Local Model Inference Example

A locally hosted model introduces a different packaging problem.

For example:

```text
Application
     │
     ├── Model Artifact
     ├── Tokenizer
     ├── Inference Runtime
     └── Application Dependencies
```

The system must understand compatibility between:

```text
Model
  ↕
Tokenizer
  ↕
Inference Runtime
  ↕
System / Accelerator
```

Bundling everything together may improve consistency but increase artifact size and coupling.

Separating components may improve lifecycle flexibility but increase compatibility management.

Again, the engineering question is not:

> “Which packaging strategy is always best?”

It is:

> “Which packaging boundary provides the required consistency while keeping lifecycle and operational complexity manageable?”

---

# 20. Artifact Promotion Readiness

An artifact may eventually move between environments such as development, staging, and production.

Before that happens, engineers need to know whether the artifact is sufficiently understood and traceable.

Conceptually, an artifact is **promotion-ready** when its important characteristics are known and can be traced.

This may include:

```text
Artifact Promotion Readiness
│
├── Artifact identity
├── Source / build relationship
├── Dependency state
├── Associated AI artifacts
├── Runtime requirements
├── Configuration expectations
├── Compatibility constraints
└── Provenance / reproducibility information
```

The key idea is:

> **Promotion readiness is about knowing what the artifact is, what it depends on, and what assumptions it carries.**

For example, before an AI application artifact is considered ready for promotion, an engineering team should be able to answer:

- Which source produced it?
- Which build produced it?
- Which dependency state does it contain?
- Which model or supporting artifacts does it require?
- Which runtime does it expect?
- Which configuration must be supplied?
- Which compatibility constraints apply?
- Can its important provenance and reproducibility information be traced?

This section is intentionally conceptual.

The actual mechanics of:

- CI/CD pipelines,
- promotion workflows,
- release gates,
- deployment automation,
- environment promotion,
- rollback,

belong to **PROD-04 — CI/CD, Artifact Promotion, and Release Safety**.

PROD-02 establishes what should be known about the artifact before those processes operate on it.

---

# 21. Packaging and Dependency Trade-offs

Production packaging decisions involve trade-offs.

## 21.1 Monolithic Artifact vs Multiple Artifacts

### Monolithic

```text
Application
+
Model
+
Supporting Assets
```

Potential benefit:

- simpler relationship management.

Potential cost:

- larger artifact,
- tighter coupling,
- more frequent rebuilds.

### Multiple artifacts

```text
Application Artifact
        +
Model Artifact
        +
Supporting Artifacts
```

Potential benefit:

- independent lifecycle management.

Potential cost:

- more compatibility relationships,
- more runtime dependencies.

---

## 21.2 Pinned Dependencies vs Update Flexibility

Strong dependency control improves reproducibility.

But extremely rigid dependency management can make updates more difficult.

The engineering trade-off is:

```text
Reproducibility
      ↕
Update Flexibility
```

Production systems usually need deliberate dependency policies rather than unrestricted upgrades.

---

## 21.3 Larger vs Smaller Artifacts

Bundling more dependencies and models can improve runtime self-containment.

But larger artifacts can increase:

- build time,
- storage requirements,
- transfer time,
- startup time.

Smaller artifacts can improve portability but may introduce external runtime dependencies.

---

## 21.4 Immutable vs Runtime Modification

An immutable artifact is intended to remain unchanged after creation.

This improves traceability because:

```text
Artifact Version X
      ↓
Known Contents
```

Runtime modification creates ambiguity:

```text
Artifact Version X
      ↓
Runtime Changes
      ↓
Unknown Effective State
```

Production systems generally benefit from clearly controlled artifact contents.

The exact implementation depends on the deployment architecture.

---

# 22. Common Mistakes and Misconceptions

## Mistake 1: “The source code is the application.”

Source code is only one part of the production application.

Dependencies, models, configuration, and runtime assumptions may also affect behavior.

---

## Mistake 2: “The container image contains everything that matters.”

A container image may contain the application and some dependencies, but important external artifacts and configuration may remain outside it.

A container does not automatically make every dependency or runtime assumption reproducible.

---

## Mistake 3: “Versioning the application is enough.”

Application versioning does not automatically identify:

- dependency state,
- model version,
- tokenizer version,
- runtime assumptions,
- configuration expectations.

---

## Mistake 4: “Configuration belongs inside the application.”

Environment-specific configuration should generally remain separable from application code.

The exact mechanism depends on the runtime architecture.

---

## Mistake 5: “If the artifact builds, it is reproducible.”

A successful build does not prove that the same inputs can reliably reproduce the artifact.

Build inputs and dependency state must be known.

---

## Mistake 6: “Reproducible packaging means deterministic AI output.”

Packaging controls improve environmental consistency.

They do not automatically eliminate model or system-level sources of variation.

---

## Mistake 7: “All AI components should be bundled together.”

Bundling is one architectural option.

Externalizing models or supporting artifacts can be appropriate when lifecycle independence is important.

---

## Mistake 8: “Promotion readiness means deployment readiness.”

Promotion readiness in this chapter means that the artifact's identity, dependencies, relationships, runtime expectations, configuration expectations, compatibility constraints, and provenance are sufficiently known.

Actual deployment and release processes belong elsewhere in the curriculum.

---

## 23. Engineering Decisions

When designing packaging for an AI application, ask:

### Artifact Boundaries

- What are the independently managed artifacts?
- Which components must change together?
- Which components have independent lifecycles?

### Dependencies

- Which dependencies are direct?
- Which are transitive?
- Which system-level dependencies matter?
- Which versions are required?

### AI Artifacts

- Which model artifacts are required?
- Which tokenizer or preprocessing artifacts are required?
- Which supporting indexes or configuration assets are required?
- Which artifacts are external?

### Configuration

- What is code?
- What is configuration?
- What is a secret?
- What is environment-specific?
- What configuration must be supplied at runtime?

### Runtime Compatibility

- Which runtime versions are required?
- Which model/runtime relationships matter?
- Are accelerator capabilities required?
- Are external services required?

### Traceability

- Can the artifact be linked to its source?
- Can it be linked to its build?
- Can its dependency state be identified?
- Can associated AI artifacts be identified?
- Can its provenance be understood?

### Promotion Readiness

- Are the artifact's important characteristics known?
- Are its dependencies and associated artifacts identifiable?
- Are runtime and configuration expectations explicit?
- Are compatibility constraints known?
- Is sufficient provenance available to trace how it was produced?

These questions help prevent packaging decisions from becoming accidental.

---

## 24. Production Perspective

Production packaging is fundamentally about controlling uncertainty.

A weak packaging model looks like:

```text
"It works in my environment."
```

A stronger model looks like:

```text
Known Source
    ↓
Known Dependencies
    ↓
Known Build
    ↓
Identifiable Artifact
    ↓
Known Configuration
    ↓
Known Runtime Requirements
    ↓
Traceable Production Execution
```

This does not eliminate every production failure.

It makes the system's assumptions visible.

That visibility is critical for:

- debugging,
- reproducibility,
- compatibility management,
- artifact traceability,
- environment consistency,
- controlled operational change.

The goal is not to create the largest or most self-contained artifact.

The goal is to create a **well-defined artifact boundary with explicit dependencies and runtime expectations**.

---

# 25. Interview Questions

## Q1. What is the difference between an application artifact and a model artifact?

**Expected answer:**

An application artifact contains the packaged application and its required runtime dependencies, while a model artifact contains model-specific assets such as model weights and configuration. They may be bundled or managed separately depending on lifecycle and runtime requirements.

---

## Q2. Why are transitive dependencies important?

**Expected answer:**

An application may depend on libraries indirectly through direct dependencies. Changes in those transitive dependencies can affect compatibility and runtime behavior, so the effective dependency state must be understood for reproducibility.

---

## Q3. Why should configuration be separated from application code?

**Expected answer:**

Separating configuration allows the same application artifact to operate across different environments while environment-specific values change independently. It also prevents environment-specific behavior from being hard-coded into the artifact.

---

## Q4. Does a container guarantee reproducibility?

**Expected answer:**

No. Containers can provide controlled filesystem and process environments, but reproducibility still depends on controlled dependencies, known build inputs, explicit configuration, identifiable artifacts, and runtime compatibility.

---

## Q5. What is artifact provenance?

**Expected answer:**

Artifact provenance describes the relationship between an artifact and the source, dependencies, build process, associated artifacts, and other inputs that produced or define it.

---

## Q6. What is the difference between artifact identity and artifact integrity?

**Expected answer:**

Artifact identity answers which artifact or version is being referenced. Integrity concerns whether the artifact has changed unexpectedly. They are related but different concerns.

---

## Q7. What makes an AI artifact conceptually ready for promotion?

**Expected answer:**

Its important characteristics should be known and traceable: artifact identity, source/build relationship, dependency state, associated AI artifacts, runtime requirements, configuration expectations, compatibility constraints, and provenance/reproducibility information. The actual promotion workflow belongs to CI/CD and release engineering.

---

## 26. Quick Revision

Remember these relationships:

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

And:

```text
Production AI Application
│
├── Application
├── Dependencies
├── Model / AI Artifacts
├── Supporting Artifacts
├── Configuration
└── Runtime Assumptions
```

Key distinctions:

```text
Identity
→ Which artifact is this?

Provenance
→ Where did it come from?

Dependencies
→ What does it require?

Configuration
→ How should it behave in this environment?

Compatibility
→ Can it execute with the expected runtime?

Promotion Readiness
→ Are its important characteristics known and traceable?
```

---

# 27. Key Takeaways

1. A production AI application is usually composed of multiple related artifacts and runtime inputs.
2. Application code alone does not fully define a production runtime.
3. Artifact boundaries should be deliberate rather than accidental.
4. Dependency state is part of reproducibility.
5. AI applications introduce additional compatibility relationships between models, runtimes, tokenizers, libraries, and accelerators.
6. Configuration should be separated from application code and managed according to explicit runtime expectations.
7. Artifact identity makes production artifacts distinguishable.
8. Provenance connects artifacts to their source, build, dependencies, and associated inputs.
9. Reproducibility includes build, runtime, and behavioral dimensions.
10. Packaging does not guarantee deterministic AI behavior.
11. Containers help establish controlled runtime environments but do not automatically guarantee complete reproducibility.
12. Production artifacts should have enough metadata to understand their dependencies and runtime assumptions.
13. Artifact promotion readiness is conceptually about knowing and tracing the artifact's important characteristics.
14. CI/CD and release gates are separate concerns covered by PROD-04.
15. The objective of production packaging is not maximum bundling; it is a clear, reproducible, traceable, and compatible artifact boundary.

---

## Further Reading

- [PROD-01 — Production AI Problem and Production Boundaries](../PROD-01-Production-AI-Problem-and-Production-Boundaries/README.md)
- [PROD-02 README — AI Application Packaging and Runtime](./README.md)
- [02 — Containers, Configuration, and Runtime Contracts](./02-Containers-Configuration-and-Runtime-Contracts.md)
- [PROD-04 — CI/CD, Artifact Promotion, and Release Safety](../PROD-04-CI-CD-Artifact-Promotion-and-Release-Safety/README.md)
- [PROD-09 — Production AI Security and Trust](../PROD-09-Production-AI-Security-and-Trust/README.md)
- [PROD-11 — Production AI Lifecycle and Continuous Improvement](../PROD-11-Production-AI-Lifecycle-and-Continuous-Improvement/README.md)
