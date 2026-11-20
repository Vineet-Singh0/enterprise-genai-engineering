# AI Interoperability, Identity Propagation and Enterprise Interfaces

## Learning Objectives

After completing this chapter, you should be able to:

- Explain interoperability in enterprise AI architecture.
- Distinguish connectivity from interoperability.
- Explain why enterprise interfaces are architectural contracts rather than merely API endpoints.
- Define the responsibilities of an enterprise interface contract.
- Distinguish identity, authentication, authorization, and context propagation.
- Explain why identity and security context may need to propagate across system boundaries.
- Reason about security-context propagation without re-implementing security governance.
- Explain cross-system trust context and trust boundaries.
- Reason about context preservation, transformation, and loss across intermediaries.
- Distinguish structural, semantic, behavioral, lifecycle, and version compatibility.
- Explain interface evolution, versioning, deprecation, and migration.
- Reason about AI-specific interoperability requirements.
- Distinguish AI capability interoperability from model/provider interoperability.
- Explain the architectural role of capability discovery.
- Understand why protocol selection alone does not establish interoperability.
- Evaluate enterprise AI interfaces using explicit architectural decision criteria.

---

## Prerequisites

Before starting this file, you should understand the concepts covered in:

1. [`01-Enterprise-AI-Integration-Patterns-and-System-Boundaries.md`](./01-Enterprise-AI-Integration-Patterns-and-System-Boundaries.md)
2. [`02-AI-Platforms-Shared-Services-Gateways-and-Control-Planes.md`](./02-AI-Platforms-Shared-Services-Gateways-and-Control-Planes.md)

File 01 establishes system boundaries and integration patterns.

File 02 establishes enterprise AI platforms, shared capabilities, gateways, routing, and Enterprise AI Control Architecture.

This file builds on those concepts and focuses on what happens **across the boundaries**.

---

## Estimated Reading Time

50–65 minutes

---

## Before We Start

Enterprise AI systems rarely operate as isolated applications.

A business application may call an AI capability.

That AI capability may use an enterprise AI platform.

The platform may route the request to a shared AI service or model/provider capability.

The AI capability may then need to interact with another enterprise system.

For example:

```text
Customer
    ↓
Customer Service Application
    ↓
Enterprise AI Platform
    ↓
AI Summarization Capability
    ↓
Enterprise Knowledge System
    ↓
Case Management System
```

Each boundary introduces assumptions.

The systems may have different:

- owners
- release cycles
- interfaces
- data models
- identity contexts
- security requirements
- trust relationships
- compatibility expectations
- lifecycle policies

The central question is therefore not simply:

> Can these systems communicate?

The more important question is:

> Can these systems communicate while preserving the capability meaning, identity context, security context, trust assumptions, and interface compatibility required for correct enterprise behavior?

That is the problem this file addresses.

---

# Why Interoperability Exists

Enterprise systems are usually built independently.

A customer service application may have one lifecycle.

An AI platform may have another.

A knowledge system may have another.

A business workflow system may have yet another.

If each system creates tightly coupled assumptions about every other system, the architecture becomes difficult to evolve.

For example:

```text
Application A ─────→ AI Service B
Application A ─────→ AI Service C
Application D ─────→ AI Service B
Application D ─────→ Enterprise System E
AI Service B ──────→ Enterprise System E
```

As the number of systems grows, integration assumptions multiply.

The problem is not only the number of connections.

The deeper problem is that each connection may carry assumptions about:

- what a capability means
- what inputs mean
- what outputs mean
- who is acting
- what security context applies
- what errors mean
- what versions are supported
- what changes are allowed

Interoperability provides an architectural way to make those assumptions explicit.

---

# Connectivity Is Not Interoperability

A system can be technically reachable without being meaningfully interoperable.

Consider two systems that can exchange a field called:

```text
priority
```

System A interprets:

```text
1 = highest priority
5 = lowest priority
```

System B interprets:

```text
1 = lowest priority
5 = highest priority
```

The systems are connected.

They can exchange messages.

The interface may even be structurally valid.

But they are not interoperating correctly.

The fundamental distinction is:

> **Connectivity answers whether systems can communicate.**

> **Interoperability answers whether they can communicate meaningfully and predictably.**

A useful progression is:

```text
Connectivity
     ↓
Interface Compatibility
     ↓
Semantic Compatibility
     ↓
Context Compatibility
     ↓
Lifecycle Compatibility
     ↓
Meaningful Interoperability
```

Each layer solves a different problem.

---

# Dimensions of Interoperability

Enterprise interoperability is multidimensional.

| Dimension | Core Question |
|---|---|
| Connectivity | Can the systems communicate? |
| Interface compatibility | Can they exchange information through compatible interfaces? |
| Capability compatibility | Does the receiving system provide the required capability? |
| Semantic compatibility | Do both systems interpret the information the same way? |
| Identity compatibility | Can relevant identity context be understood? |
| Security-context compatibility | Can required security context be interpreted correctly? |
| Trust compatibility | Do the systems have compatible trust assumptions? |
| Lifecycle compatibility | Can independently evolving systems remain compatible? |
| Error compatibility | Do systems understand failure conditions consistently? |
| Version compatibility | Can supported interface versions interact correctly? |

A system can satisfy one dimension while failing another.

For example:

- connectivity may exist without semantic compatibility
- structural compatibility may exist without behavioral compatibility
- identity may be propagated without sufficient trust
- version compatibility may exist while lifecycle coordination remains poor

Interoperability therefore requires reasoning across the complete interaction boundary.

---

## Enterprise Interfaces

An enterprise interface is more than a technical endpoint.

It is an **architectural contract between independently evolving systems**.

An enterprise interface should establish enough information for another system to understand:

- what capability is being provided
- what inputs are accepted
- what outputs are produced
- what those inputs and outputs mean
- what errors mean
- what identity and security context is relevant
- what compatibility expectations exist
- who owns the interface
- how the interface evolves

A useful model is:

```text
Enterprise Interface Contract
        │
        ├── Capability
        ├── Inputs
        ├── Outputs
        ├── Semantics
        ├── Errors
        ├── Context
        ├── Compatibility
        ├── Ownership
        └── Lifecycle
```

The interface therefore defines the **meaningful boundary**, not merely the transport mechanism.

---

# Interface Contract

An interface contract defines the expectations between producer and consumer.

### Capability

What capability does the interface expose?

For example:

> Generate a concise customer-case summary.

The capability definition should be understandable independently of its implementation.

---

### Inputs

What information does the capability require?

For example:

- customer case information
- relevant conversation history
- request context

---

### Outputs

What does the capability return?

For example:

- generated summary
- processing status
- relevant metadata
- error information when processing fails

---

### Semantics

What does each input and output mean?

This is critical.

A field called:

```text
confidence
```

could mean:

- model confidence
- classification probability
- business-rule confidence
- estimated answer reliability

The field name alone does not establish meaning.

---

### Errors

What does failure mean?

Possible categories include:

- invalid request
- unsupported capability
- missing context
- incompatible version
- policy rejection
- processing failure

The receiving system must be able to interpret the error correctly.

---

### Context

What identity, tenant, security, request, or trust-related context is relevant?

Context should be intentional.

Not every piece of upstream information should automatically be propagated.

---

### Compatibility

What changes are allowed without breaking consumers?

This includes:

- structural compatibility
- semantic compatibility
- behavioral compatibility
- version compatibility
- lifecycle compatibility

---

### Ownership

Who is responsible for maintaining the interface contract?

Ownership is an architectural responsibility.

It does not mean that one team must own every system involved in the interaction.

---

### Lifecycle

How is the interface introduced, evolved, deprecated, migrated, and eventually retired?

An interface that works today but cannot evolve safely is not a complete enterprise interface design.

---

# Interface Responsibilities

A well-defined enterprise interface distributes responsibility explicitly.

| Responsibility | Architectural Question |
|---|---|
| Capability responsibility | What capability is exposed? |
| Input responsibility | What information must consumers provide? |
| Output responsibility | What results are returned? |
| Semantic responsibility | What does the exchanged information mean? |
| Error responsibility | How are failure conditions represented? |
| Context responsibility | What identity/security context is required? |
| Compatibility responsibility | What changes are safe? |
| Ownership responsibility | Who maintains the contract? |
| Lifecycle responsibility | How will the interface evolve? |

This prevents a common mistake:

> treating interface design as a payload-format problem.

The payload is only one part of the contract.

---

## AI-Specific Enterprise Interfaces

AI capabilities introduce additional architectural concerns.

An AI interface may exchange:

- structured business inputs
- prompts or structured instructions
- model or capability requirements
- retrieved context
- tool or capability requests
- generated outputs
- AI metadata
- policy-relevant context
- identity context
- tenant context
- request metadata
- processing status
- error information

A conceptual AI interface may look like:

```text
AI Application
      │
      │ Capability Requirement
      │ Input Data
      │ Relevant Context
      │ Identity Context
      │ Tenant Context
      │ Request Metadata
      ▼
AI Capability
      │
      │ Structured Result
      │ Status
      │ Metadata
      │ Error
      ▼
AI Application
```

The architectural challenge is not simply to define a JSON structure.

The challenge is to define what the interaction means and which assumptions remain stable across implementation changes.

---

# AI Capability Interoperability

An enterprise application should often integrate with an **AI capability** rather than directly with a particular model implementation.

For example:

```text
Business Application
        ↓
"Summarize Customer Case"
        ↓
AI Capability Interface
        ↓
Enterprise AI Platform
        ↓
Model / Provider Implementation
```

The application depends on the capability contract.

The implementation may change behind that contract.

This allows an enterprise to potentially change:

- model implementation
- model provider
- underlying AI service
- routing decision
- internal processing architecture

without requiring every consumer to change immediately.

However, abstraction must not hide behavior that is materially relevant to consumers.

For example, if two implementations differ significantly in:

- supported inputs
- output structure
- safety behavior
- context requirements
- supported capabilities
- error behavior

then pretending they are completely interchangeable may create false interoperability.

The principle is:

> **Abstract implementation details where possible, but preserve materially relevant behavioral differences where consumers depend on them.**

---

# AI Capability Interoperability vs Model/Provider Interoperability

These concepts are related but not identical.

### AI Capability Interoperability

This asks:

> Can an application interact with an AI capability through a stable enterprise contract?

For example:

```text
Application
    ↓
Case Summarization Capability
```

The application does not necessarily need to know which model performs the summarization.

---

### Model/Provider Interoperability

This asks:

> Can different model or provider implementations participate behind the capability boundary without violating the required contract?

For example:

```text
                    ┌── Model Provider A
                    │
Case Summarization ─┼── Model Provider B
Capability           │
                    └── Model Provider C
```

The architectural relationship is therefore:

```text
Business Application
        ↓
AI Capability Contract
        ↓
Enterprise AI Platform / Shared Capability
        ↓
Model / Provider Implementation
```

ENT-06 owns the **integration and interface architecture** that allows these layers to interact.

ENT-07 owns the strategic questions of:

- model/provider selection
- vendor strategy
- procurement
- strategic dependency
- diversification
- exit strategy

The two concerns should not be conflated.

---

# Capability Discovery

Interoperability also requires systems to understand what capabilities are available.

Capability discovery answers:

> What is available?

An interface contract answers:

> How do we interact with it correctly?

These are different concerns.

For example:

```text
Capability Discovery
        ↓
"Customer Case Summarization Available"
        ↓
Interface Contract
        ↓
Required Inputs / Outputs / Semantics / Context
        ↓
Interaction
```

Discovery without a meaningful contract is insufficient.

A system may know that a capability exists but still be unable to use it correctly.

Capability discovery should therefore remain connected to:

- capability identity
- capability meaning
- supported inputs
- supported outputs
- compatibility
- lifecycle expectations

It should not become an uncontrolled catalogue of technical endpoints.

---

# Identity, Authentication, Authorization and Context Propagation

These concepts must be separated.

### Identity

Identity answers:

> Who or what is acting?

Examples include:

- a user
- an application
- a service
- a tenant
- a delegated actor

---

### Authentication

Authentication answers:

> How was the identity established?

Authentication establishes evidence associated with an identity.

The implementation of authentication belongs outside the primary scope of this file.

---

### Authorization

Authorization answers:

> What is this identity allowed to do?

Authorization determines whether an action should be permitted.

ENT-04 owns authorization governance and access-control semantics.

---

### Context Propagation

Context propagation answers:

> How does relevant identity or security context travel across system boundaries?

This is an ENT-06 concern.

The distinction can be summarized as:

```text
Identity
   ↓
Who or What?

Authentication
   ↓
How was that identity established?

Authorization
   ↓
What is that identity allowed to do?

Context Propagation
   ↓
How does relevant context travel across boundaries?
```

These concepts interact, but they are not interchangeable.

---

# Why Identity Context Must Be Propagated

Consider:

```text
User
  ↓
Application A
  ↓
AI Service B
  ↓
Enterprise System C
```

Enterprise System C may need to understand:

- which user initiated the request
- which application called it
- which tenant is involved
- whether the request was delegated
- what relevant security context applies

If the downstream system sees only:

```text
AI Service B
```

it may lose important information about the original interaction.

This creates architectural ambiguity.

The key question becomes:

> What context must survive the system boundaries so downstream systems can correctly interpret the interaction?

---

# Identity-Context Propagation

Identity-related context may include:

- originating user identity
- calling application identity
- service identity
- tenant identity
- delegated identity
- request context
- relevant security context

The important architectural question is not:

> How do we propagate everything?

It is:

> Which context is required, who establishes it, who is allowed to propagate it, and what assumptions can the receiving system safely make about it?

This distinction prevents uncontrolled context propagation.

---

## Original Identity vs Calling Service Identity

Consider:

```text
User
  ↓
Business Application
  ↓
AI Gateway
  ↓
AI Service
```

The AI Service may have two relevant identities:

```text
Original Actor:
User

Immediate Caller:
AI Gateway
```

These identities are not necessarily interchangeable.

The downstream system may need to distinguish:

- who originally initiated the action
- which system is currently making the request
- whether the request is delegated
- which tenant or domain is involved

Losing this distinction can create incorrect assumptions about responsibility and context.

---

# Delegated Identity

Enterprise systems frequently act on behalf of another actor.

For example:

```text
User
   ↓
Customer Service Application
   ↓
AI Capability
```

The AI capability may be invoked by the application, but the business action may still originate from the user.

The architecture therefore needs to represent the relationship between:

```text
Original Actor
      ↓
Delegating System
      ↓
Receiving System
```

Delegation is not simply the same as replacing the original identity with the service identity.

The relevant context must be preserved according to the enterprise trust and governance model.

Detailed authorization semantics remain an ENT-04 responsibility.

---

# Security-Context Propagation

Identity is only one part of context.

Security-relevant context may include:

- originating user
- calling application
- tenant
- delegated identity
- security classification
- trust context
- relevant authorization-related context

The architecture must determine:

1. What context is required?
2. Who establishes it?
3. Who is allowed to propagate it?
4. Who consumes it?
5. Can the receiving system trust it?
6. What happens if it is missing?
7. What happens if it is stale?
8. What happens if it is transformed?
9. What happens if it conflicts with other context?

This is an integration architecture problem.

It is not a reason to re-implement the security governance model inside the integration layer.

---

## Context Is Not Automatically Trustworthy

A critical enterprise principle is:

> **Propagated context is not automatically trustworthy merely because it came from another system.**

For example:

```text
Application A
      ↓
AI Gateway
      ↓
AI Service
```

The AI Service may receive identity-related context from the gateway.

But the receiving system still needs an architectural trust assumption about:

- who provided the context
- whether the context was preserved
- whether it was transformed
- whether an intermediary could alter it
- whether the trust relationship remains valid across the boundary

Context propagation therefore requires trust reasoning.

---

# Cross-System Trust Context

Connectivity does not automatically establish trust.

A useful model is:

```text
Connectivity
     ↓
Identity Context
     ↓
Security Context
     ↓
Trust Assumptions
     ↓
Context Interpretation
     ↓
Interoperable Interaction
```

Each stage adds architectural meaning.

A system may be reachable while still lacking sufficient context to safely interpret the request.

---

# Trust Boundaries

When context crosses a system boundary, the receiving system may need to:

- accept the context
- validate the context
- re-establish context
- transform the context
- reject the context
- establish a new trust relationship

The correct behavior depends on the enterprise architecture.

The important point is that a system boundary may also be a **trust-context boundary**.

Therefore:

```text
System Boundary
      ≠
Simple Data Boundary
```

It may simultaneously represent:

```text
System Boundary
      ↓
Identity Boundary
      ↓
Security-Context Boundary
      ↓
Trust Boundary
```

The boundaries do not always coincide, but they must be reasoned about explicitly.

---

# Context Preservation Across Intermediaries

Consider:

```text
User
  ↓
Application
  ↓
AI Gateway
  ↓
AI Service
  ↓
Enterprise System
```

The intermediary may:

- preserve context
- transform context
- add context
- remove context
- terminate one trust relationship
- establish another trust relationship

Therefore, the architecture must ask:

> Which context survives each boundary?

and:

> Under whose authority is the receiving system expected to interpret that context?

This is more precise than simply saying:

> "Pass the user identity downstream."

---

# Identity Context and Authorization Boundary

Identity propagation and authorization are related but different.

For example:

```text
Identity Context
      ↓
"User X initiated this request."
```

does not by itself answer:

```text
Authorization
      ↓
"User X is allowed to perform this action."
```

ENT-04 owns:

- authorization governance
- access-control governance
- authentication governance
- security/privacy requirements

ENT-06 owns:

- cross-system identity-context propagation
- security-context propagation
- interface representation of relevant context
- interoperability implications
- trust-context preservation across boundaries

This boundary prevents ENT-06 from becoming a security-governance tutorial.

---

# Enterprise Interface Context

A mature enterprise interface should therefore consider more than payload structure.

A conceptual interface model is:

```text
Enterprise Interface
        │
        ├── Capability
        ├── Inputs
        ├── Outputs
        ├── Semantics
        ├── Error Meaning
        ├── Identity Context
        ├── Security Context
        ├── Trust Context
        ├── Compatibility
        ├── Ownership
        └── Lifecycle
```

This makes context a deliberate part of interface architecture.

---

# Semantic Compatibility

Two systems may agree on structure but disagree on meaning.

Consider:

```text
status = "active"
```

System A may interpret this as:

> Customer account is currently usable.

System B may interpret it as:

> Customer account has completed registration.

The structure is compatible.

The meaning is not.

Semantic compatibility therefore asks:

> Do the interacting systems interpret the exchanged information consistently?

This is often more difficult than structural compatibility.

---

# Structural Compatibility

Structural compatibility concerns the shape and organization of exchanged information.

For example:

```text
{
    "customer_id": "...",
    "summary": "...",
    "status": "..."
}
```

A consumer may expect those fields to exist in a particular structure.

Structural compatibility can be broken by:

- removing required fields
- changing field types
- changing nesting
- changing required structure

However:

> Structural compatibility does not guarantee semantic compatibility.

A structurally valid payload can still be interpreted incorrectly.

---

# Behavioral Compatibility

Two systems may have compatible structures but incompatible behavior.

For example, an AI capability may accept the same request structure but change:

- supported input behavior
- output characteristics
- error behavior
- context requirements
- supported capabilities
- processing expectations

This matters particularly for AI because implementation behavior can evolve without changing the basic interface shape.

Therefore, an enterprise interface may need to define which behaviors are:

- contractually stable
- intentionally variable
- implementation-specific

The goal is not to freeze AI behavior unnecessarily.

The goal is to make meaningful variability explicit.

---

## Error Semantics

Errors are part of interoperability.

Suppose an AI capability returns:

```text
error = "unsupported"
```

What does that mean?

Possibilities include:

- unsupported capability
- unsupported input
- unsupported version
- unsupported context
- unsupported model/provider capability

If systems interpret errors differently, integration behavior becomes unpredictable.

Enterprise interfaces should therefore establish meaningful error semantics.

Examples include:

| Error Category | Meaning |
|---|---|
| Invalid request | Request does not satisfy interface requirements |
| Unsupported capability | Requested capability is not available |
| Context problem | Required identity/security/context information is missing or invalid |
| Policy rejection | Request was rejected according to applicable policy |
| Processing failure | Capability could not complete processing |

The exact implementation is outside the scope of this file.

The architectural concern is that consumers can interpret failures consistently.

---

# Compatibility Boundaries

An interface should define what can change without breaking consumers.

For example:

```text
Internal Implementation
        ↓
Enterprise Interface Contract
        ↓
Consumers
```

The internal implementation may change extensively if the externally visible contract remains compatible.

This creates a useful architectural boundary:

> **Implementation freedom exists behind a stable interface contract.**

However, "stable" does not mean "never changes."

Enterprise interfaces must evolve deliberately.

---

# Interface Evolution

Enterprise interfaces inevitably change.

Possible changes include:

- adding fields
- removing fields
- changing field meaning
- introducing new capabilities
- changing error semantics
- changing context requirements
- changing compatibility expectations

The architectural question is:

> How can the interface evolve without creating uncontrolled consumer breakage?

This requires explicit lifecycle management.

---

## Backward Compatibility

Backward compatibility means existing consumers continue to work within the defined compatibility expectations.

For example:

```text
Version A
   ↓
Existing Consumers

Version B
   ↓
Existing + New Consumers
```

Backward compatibility can reduce immediate migration pressure.

However, maintaining compatibility indefinitely can increase:

- implementation complexity
- testing requirements
- lifecycle burden
- support obligations

Backward compatibility is therefore an architectural trade-off, not an absolute goal.

---

# Versioning

Versioning communicates meaningful compatibility boundaries.

For example:

```text
Capability Interface v1
        ↓
Capability Interface v2
```

A new version may be appropriate when the contract changes in a way that consumers cannot safely absorb transparently.

However:

> Not every change requires a new version.

If every small change creates a new interface version, enterprises can accumulate unnecessary compatibility branches.

Versioning should therefore follow meaningful architectural compatibility boundaries.

---

# Deprecation

Interfaces should have an intentional deprecation lifecycle.

A simplified model is:

```text
Active
  ↓
Deprecation Announced
  ↓
Migration Period
  ↓
Legacy Usage Reduced
  ↓
Retirement
```

Deprecation should communicate:

- what is changing
- which consumers are affected
- what replacement exists
- when support changes
- what migration is expected

Deprecation is therefore part of interface lifecycle architecture.

---

# Schema Evolution

Schema changes have different compatibility consequences.

For example:

### Adding an Optional Field

Often lower risk:

```text
Existing fields
+
new optional field
```

Existing consumers may continue working.

### Removing a Required Field

Potentially breaking:

```text
Required field removed
        ↓
Consumer assumption violated
```

### Changing Field Meaning

Potentially even more dangerous:

```text
Field name unchanged
        ↓
Meaning changed
        ↓
Consumer behavior becomes incorrect
```

This demonstrates why semantic compatibility must be considered alongside structural compatibility.

---

# Semantic Evolution

Consider:

```text
confidence = 0.92
```

Initially the enterprise contract defines:

> confidence = estimated probability that the classification is correct.

Later, the implementation changes the meaning to:

> confidence = model-generated internal score.

The structure has not changed.

The field still exists.

The data type is still numeric.

Yet the interface has become semantically incompatible.

This is why:

> **Semantic changes can be breaking changes even when schemas remain unchanged.**

---

# Lifecycle Compatibility

Independent systems often evolve at different speeds.

For example:

```text
AI Capability
    releases frequently

Business Application
    releases quarterly

Enterprise System
    releases annually
```

A technically compatible interface may still become operationally difficult if lifecycle expectations differ significantly.

Architecture should therefore consider:

- release frequency
- support duration
- migration speed
- consumer coordination
- deprecation timelines
- notification expectations
- compatibility windows

Lifecycle compatibility is part of enterprise interoperability.

---

# AI-Specific Compatibility Challenges

AI capabilities introduce additional compatibility concerns because implementation behavior may evolve while the interface remains structurally stable.

For example:

```text
Request Schema
     │
     ├── unchanged
     │
     ▼
AI Capability
     │
     ├── Model A
     ├── Model B
     └── Model C
```

The interface may remain stable while:

- generated outputs change
- supported context changes
- response characteristics change
- model-specific capabilities differ
- error behavior changes

The architecture therefore needs to distinguish:

```text
Stable Contract
       +
Allowed Behavioral Variability
```

from:

```text
Unexpected Behavioral Change
```

This is particularly important when an AI capability abstracts multiple underlying implementations.

---

# AI Metadata and Context Exchange

AI interactions may exchange both business payloads and contextual metadata.

For example:

```text
Business Payload
    ↓
Customer Case

Context
    ↓
User / Tenant / Request / Capability Context

Metadata
    ↓
Relevant AI Interaction Information
```

The architecture should distinguish:

- business information
- operational context
- identity/security context
- capability metadata
- policy-relevant context

A common mistake is to create an uncontrolled metadata container into which every upstream system places arbitrary information.

That makes interoperability harder.

Context should instead have defined meaning and responsibility.

---

# Model and Provider Abstraction

An enterprise AI capability may hide implementation differences behind a capability interface.

For example:

```text
Business Application
        ↓
AI Capability Interface
        ↓
Enterprise AI Platform
        ↓
 ┌──────┼──────┐
 ↓      ↓      ↓
Model A Model B Model C
```

The application depends on:

> "Case Summarization"

rather than:

> "Specific Model Provider X."

This can reduce direct coupling.

However, abstraction must preserve meaningful differences.

If one implementation:

- supports structured output
- supports a particular context type
- has different error semantics
- provides a capability that others do not

then the enterprise interface must represent those differences where they matter to consumers.

ENT-06 owns the architectural integration and abstraction boundary.

ENT-07 owns the strategic decision of which model/provider ecosystem the enterprise should use.

---

# Structured AI Communication

A conceptual structured AI interaction might contain:

```text
Request
├── capability
├── input
├── context
├── metadata
└── identity/security context

Response
├── result
├── status
├── metadata
└── error
```

Structure improves interoperability.

But:

> Structure alone does not guarantee semantic, behavioral, trust, or lifecycle compatibility.

Two systems can exchange perfectly structured messages and still misunderstand each other.

---

# Protocols and Interoperability

Protocols provide mechanisms for communication.

Examples may include:

- HTTP-based interfaces
- event interfaces
- structured RPC
- capability-oriented protocols
- enterprise messaging patterns

These are useful implementation choices.

But protocol selection is not the foundation of interoperability.

For example:

```text
Protocol
    ↓
Communication Mechanism
```

does not automatically provide:

```text
Shared Semantics
Shared Context
Shared Trust Assumptions
Compatible Lifecycle
Compatible Capability
```

Therefore:

> **A protocol can enable communication without guaranteeing interoperability.**

Protocol choice should follow the architectural requirements of the interface rather than replace them.

---

# Protocol Evolution

Protocols themselves evolve.

Enterprise architecture may need to consider:

- compatibility
- supported versions
- capability negotiation where appropriate
- deprecation
- migration
- semantic stability

Again, the protocol is only one layer.

The deeper architectural concern remains:

> Can independently evolving systems continue to understand each other's capabilities, context, semantics, and expectations?

---

## Cross-System Trust and Context Preservation

Consider the complete enterprise interaction:

```text
User
  ↓
Business Application
  ↓
Enterprise AI Platform
  ↓
AI Capability
  ↓
Enterprise System
```

At every boundary, the architecture should ask:

### Identity

Who originally initiated the interaction?

### Calling Identity

Which system is making the immediate request?

### Tenant

Which enterprise domain or tenant does the request belong to?

### Security Context

What relevant security context must survive?

### Trust

What does the receiving system trust, and why?

### Interface

What capability contract is being used?

### Semantics

What do the exchanged values mean?

### Errors

How should failures be interpreted?

### Compatibility

Which versions and behaviors are supported?

### Lifecycle

How will the interface evolve?

This is the complete interoperability problem.

---

# Practical Enterprise Example

Consider a customer service environment.

```text
Customer
   ↓
Customer Service Application
   ↓
Enterprise AI Platform
   ↓
Case Summarization Capability
   ↓
Enterprise Knowledge System
   ↓
Case Management System
```

The customer service application requests an AI-generated summary of a customer case.

The architecture must consider more than the summary itself.

### Identity Context

The system may need to preserve:

- originating user
- calling application
- tenant context

### Calling Identity

The downstream system may need to distinguish the application from the original user.

### Security Context

Relevant security context may need to travel across the AI platform boundary.

### Trust Context

The receiving system must know which intermediary provided the context and what trust assumptions apply.

### Interface Contract

The summarization capability should define:

- required case information
- expected context
- summary output
- error semantics
- compatibility expectations

### Semantic Compatibility

The meaning of:

```text
case_status
```

must be consistent across systems.

### Error Compatibility

The application must distinguish:

```text
Unsupported Capability
```

from:

```text
Processing Failure
```

### Lifecycle Compatibility

The AI capability and case-management system may evolve at different speeds.

The interface must therefore provide a controlled compatibility boundary.

---

# Practical Example: Context Preservation Across Multiple Boundaries

Consider:

```text
User
  ↓
Application A
  ↓
AI Gateway
  ↓
AI Service B
  ↓
Enterprise System C
```

Suppose Application A knows:

```text
User = U1
Tenant = T1
Application = A
```

The AI Gateway receives the request.

The architecture must determine:

- Which identity context is preserved?
- Which context is transformed?
- Which context is newly established?
- Which trust relationship exists between A and the gateway?
- Which trust relationship exists between the gateway and B?
- What does B know about the original user?
- What does C know about the original user?
- Can C distinguish the original actor from the immediate caller?
- What happens if context is missing?
- What happens if context is stale?
- What happens if an intermediary changes the context?

The important architectural principle is:

> **Context must have an explicit propagation and trust model across each boundary.**

---

# Interoperability Decision Framework

When designing an enterprise AI integration, ask:

### 1. What capability is being exchanged?

Define the business or AI capability independently of its implementation.

### 2. What interface contract exists?

Define inputs, outputs, semantics, errors, context, compatibility, ownership, and lifecycle.

### 3. What identity context is required?

Determine which identities must be preserved.

### 4. What security context is required?

Determine which security-relevant information must cross the boundary.

### 5. What trust assumptions exist?

Determine who trusts which context and under what conditions.

### 6. What context can be transformed?

Not all context must remain identical across every boundary.

### 7. What happens if context is missing?

Failure behavior should be intentional.

### 8. What compatibility expectations exist?

Consider:

- structural
- semantic
- behavioral
- version
- lifecycle compatibility

### 9. How will the interface evolve?

Define:

- versioning
- deprecation
- migration
- retirement

### 10. Does protocol choice actually solve the problem?

A protocol may enable communication but does not automatically establish interoperability.

---

## Common Architectural Mistakes

## 1. Treating Connectivity as Interoperability

Systems can communicate while still misunderstanding each other.

---

## 2. Treating Identity as Authentication

Identity answers who is acting.

Authentication answers how that identity was established.

They are related but different.

---

## 3. Assuming Propagated Identity Is Automatically Trusted

Context crossing a boundary does not automatically establish trust.

---

## 4. Losing the Original Actor

Replacing the original user context with the immediate calling service can remove important information.

---

## 5. Propagating Everything

More context is not automatically better.

Uncontrolled context increases complexity and ambiguity.

---

## 6. Treating Interface Syntax as the Contract

A payload structure is only part of an interface contract.

---

## 7. Ignoring Semantic Compatibility

Identical structures can still represent different meanings.

---

## 8. Assuming Versioning Solves Compatibility

Different versions can still have incompatible semantics or behaviors.

---

## 9. Ignoring Lifecycle Differences

Systems with different release cycles can create long-term compatibility problems.

---

## 10. Hiding Important Differences Behind Abstraction

Abstraction should reduce unnecessary coupling without hiding behavior consumers actually depend on.

---

## 11. Treating Protocol Selection as Interoperability

A common protocol does not guarantee common meaning.

---

## 12. Re-implementing ENT-04 in the Integration Layer

ENT-06 should reason about context propagation and trust boundaries.

It should not become the primary location for authorization governance or security-control implementation.

---

## Engineering Decisions and Trade-offs

Enterprise interoperability involves trade-offs.

| Decision | Trade-off |
|---|---|
| Rich context vs minimal context | More context improves downstream understanding but increases complexity and trust requirements |
| Direct propagation vs transformation | Direct propagation preserves context but may expose unnecessary coupling |
| Strong abstraction vs provider-specific capability | Abstraction reduces coupling but may hide important differences |
| Strict compatibility vs rapid evolution | Strong compatibility protects consumers but can slow change |
| Version coexistence vs migration pressure | Multiple versions ease migration but increase lifecycle complexity |
| Central interface vs domain-specific interface | Central standardization improves consistency but may reduce local flexibility |
| Standard semantics vs local flexibility | Shared meaning improves interoperability but may constrain domain-specific interpretation |
| Context preservation vs trust-boundary reset | Preservation maintains continuity but may not always be appropriate across trust boundaries |
| Rich metadata vs simplicity | Rich metadata can improve context but increases contract complexity |
| Stable interface vs AI capability evolution | Stability protects consumers while AI capabilities continue to change |

There is no universally correct choice.

The correct architecture depends on:

- business criticality
- number of consumers
- system ownership
- lifecycle differences
- trust boundaries
- compatibility requirements
- capability variability
- change frequency

---

## Production Perspective

Interoperability problems often appear after systems have already been integrated.

Typical production-level architectural problems include:

- missing identity context
- invalid context
- stale context
- incompatible interface versions
- changed semantics
- unsupported capabilities
- unexpected error meanings
- intermediary context transformations
- trust-boundary transitions
- consumer migration failures
- incompatible lifecycle expectations

A production-ready interface therefore needs more than:

```text
Endpoint + Payload
```

It needs an explicit contract covering:

```text
Capability
    +
Semantics
    +
Context
    +
Trust
    +
Compatibility
    +
Lifecycle
```

This is what allows independently evolving enterprise systems to remain interoperable over time.

---

# Complete Mental Model

ENT-06 can now be viewed as one continuous architectural progression:

```text
Enterprise AI Capability
        ↓
System Boundary
        ↓
Integration Pattern
        ↓
Enterprise AI Platform
        ↓
Shared AI Capability / Gateway
        ↓
Enterprise Interface
        ↓
Capability
Input / Output
Semantics
Errors
Identity Context
Security Context
Trust Context
Compatibility
Lifecycle
        ↓
Cross-System Interoperability
```

The key insight is:

> Enterprise AI integration does not end when two systems can exchange requests.

The architecture must also define what the systems mean, what context crosses the boundary, what trust assumptions apply, and how the interface evolves.

---

# ENT-06 Complete Learning Progression

The three files now form a continuous progression:

```text
File 01
Enterprise AI Integration Patterns
        ↓
System Boundaries
        ↓
Integration Responsibility
        ↓
Shared vs Embedded Capabilities

                ↓

File 02
Enterprise AI Platforms
        ↓
Shared AI Services
        ↓
Gateways
        ↓
Routing
        ↓
Enterprise AI Control Architecture

                ↓

File 03
Interoperability
        ↓
Enterprise Interfaces
        ↓
Identity / Security Context
        ↓
Trust Context
        ↓
Compatibility
        ↓
Interface Evolution
```

This progression moves from:

**where systems integrate**

to:

**what enterprise platforms provide**

to:

**how independent systems continue to understand each other across those boundaries.**

---

# Boundary with Other Enterprise Domains

## ENT-01 — Enterprise AI Architecture

ENT-01 owns:

- enterprise AI capability architecture
- operating models
- architecture principles
- general capability boundaries
- general enterprise architecture reasoning

ENT-06 focuses on the integration boundaries between those capabilities and surrounding systems.

---

## ENT-04 — AI Security, Privacy and Access Governance

ENT-04 owns:

- identity governance
- authentication governance
- authorization governance
- access-control governance
- security/privacy requirements
- authorization semantics

ENT-06 owns:

- identity-context propagation
- security-context propagation
- trust-context propagation
- interoperability implications
- interface representation of relevant context
- integration boundaries across systems

The distinction is:

```text
ENT-04
"What access should be allowed?"

ENT-06
"How does relevant context travel across the boundary?"
```

---

## ENT-05 — AI Data and Information Governance

ENT-05 owns:

- information ownership
- authority
- provenance
- lineage
- quality
- trust
- usage constraints
- retention
- information handling

ENT-06 owns the system and interface architecture through which AI capabilities and information cross enterprise boundaries.

---

## ENT-07 — AI Model, Provider and Vendor Strategy

ENT-07 owns:

- model/provider selection
- vendor strategy
- procurement
- strategic dependency
- diversification
- exit considerations

ENT-06 owns:

- capability interfaces
- integration boundaries
- platform-mediated model/provider integration
- architectural abstraction
- interoperability across implementations

---

## ENT-08 — AI Economics and FinOps

ENT-08 owns:

- economic analysis
- cost management
- FinOps
- portfolio economics
- economic trade-offs

ENT-06 considers architectural implications without becoming the primary location for enterprise AI economics.

---

## ENT-09 — AI Criticality, Resilience and Dependency Governance

ENT-09 owns:

- enterprise criticality
- resilience governance
- dependency governance

ENT-06 considers dependency and failure implications only where required to reason about integration architecture.

---

# Architecture Review Questions

Use the following questions when reviewing an enterprise AI interoperability design:

1. What capability is crossing the boundary?
2. Is the interface defined as a capability contract or merely as a technical endpoint?
3. What are the required inputs and outputs?
4. Are their semantics explicitly defined?
5. What errors must consumers understand?
6. What identity context must survive?
7. What security context must survive?
8. Which system establishes that context?
9. Which system is allowed to transform it?
10. What trust assumptions apply at each boundary?
11. Can the downstream system distinguish original identity from immediate caller?
12. What happens when context is missing or stale?
13. Is structural compatibility sufficient for this interaction?
14. What behavioral variability is acceptable?
15. How will semantic changes be managed?
16. What is the compatibility boundary?
17. How will the interface evolve?
18. What is the deprecation strategy?
19. Does the AI capability abstraction hide any behavior consumers actually depend on?
20. Does protocol selection solve a real interoperability requirement, or merely a connectivity problem?

---

## Interview Questions with Expected Answers

## 1. What is the difference between connectivity and interoperability?

**Expected Answer:**

Connectivity means systems can communicate.

Interoperability means systems can communicate meaningfully and predictably while agreeing on capability, interface structure, semantics, context, trust assumptions, and compatibility expectations.

A connection can exist without interoperability.

---

## 2. Why is an enterprise interface more than an API endpoint?

**Expected Answer:**

An enterprise interface is an architectural contract.

It defines not only how information is exchanged, but also:

- capability
- inputs
- outputs
- semantics
- errors
- context
- compatibility
- ownership
- lifecycle

An API endpoint is only one technical mechanism through which that contract may be implemented.

---

## 3. What is the difference between identity, authentication, authorization, and context propagation?

**Expected Answer:**

Identity identifies who or what is acting.

Authentication establishes evidence about that identity.

Authorization determines what the identity is allowed to do.

Context propagation determines how relevant identity or security context travels across system boundaries.

They interact, but they are not interchangeable.

---

## 4. Why can propagated identity context not automatically be trusted?

**Expected Answer:**

Because crossing a system boundary does not automatically establish a trust relationship.

The receiving system must understand:

- who established the context
- whether it was preserved
- whether it was transformed
- whether an intermediary could alter it
- what trust relationship applies

Therefore, propagated context must be interpreted according to explicit trust assumptions.

---

## 5. Why is the original actor different from the immediate caller?

**Expected Answer:**

A system may act on behalf of another actor.

For example:

```text
User
  ↓
Application
  ↓
AI Service
```

The AI Service's immediate caller is the application, but the original actor may be the user.

The distinction matters when downstream systems need to understand delegation, identity context, tenant context, or responsibility.

---

## 6. What belongs in an enterprise interface contract?

**Expected Answer:**

At minimum:

- capability
- inputs
- outputs
- semantics
- errors
- identity/security context
- compatibility expectations
- ownership
- lifecycle

The contract should define meaningful interaction behavior, not just payload syntax.

---

## 7. Why is semantic compatibility more difficult than structural compatibility?

**Expected Answer:**

Structural compatibility concerns whether the exchanged data has the expected shape.

Semantic compatibility concerns whether both systems interpret that data the same way.

Two systems can exchange structurally valid payloads while interpreting a field differently.

Semantic incompatibility can therefore exist without a schema change.

---

## 8. Why doesn't versioning automatically solve compatibility?

**Expected Answer:**

Versioning identifies compatibility boundaries, but it does not guarantee that the versions are semantically or behaviorally compatible.

A new version can still introduce:

- changed semantics
- changed behavior
- changed context requirements
- incompatible errors

Versioning is a lifecycle mechanism, not a universal compatibility solution.

---

## 9. What is the difference between AI capability interoperability and model/provider interoperability?

**Expected Answer:**

AI capability interoperability asks whether applications can interact with an AI capability through a stable enterprise contract.

Model/provider interoperability asks whether different underlying model/provider implementations can participate behind that capability boundary without violating the required contract.

For example:

```text
Application
    ↓
Summarization Capability
    ↓
Model A / Model B / Model C
```

ENT-06 owns the integration and interface architecture.

ENT-07 owns strategic model/provider selection and vendor strategy.

---

## 10. Why should an application often depend on an AI capability rather than directly on a model?

**Expected Answer:**

Because the capability boundary can reduce direct coupling between the application and implementation details.

The application can depend on:

> "Customer Case Summarization"

instead of:

> "Specific Model Provider X."

This can allow implementation changes without requiring every consumer to change immediately.

However, the abstraction must preserve behavior that consumers materially depend on.

---

## 11. Why is protocol selection not the same as interoperability?

**Expected Answer:**

A protocol defines a communication mechanism.

It does not automatically define:

- shared semantics
- capability meaning
- identity context
- trust assumptions
- compatibility
- lifecycle expectations

A common protocol can therefore connect systems without making them interoperable.

---

## 12. What happens if an intermediary transforms identity or security context?

**Expected Answer:**

The architecture must explicitly define the transformation.

The receiving system needs to understand:

- what the original context was
- what changed
- who performed the transformation
- what trust relationship applies afterward
- which context can still be relied upon

A transformation may effectively establish a new trust-context boundary.

---

## 13. Why should an enterprise avoid propagating every piece of upstream context?

**Expected Answer:**

Because unnecessary context increases:

- interface complexity
- coupling
- ambiguity
- trust requirements
- lifecycle burden

The architecture should propagate the minimum context required for correct interpretation and operation.

---

## 14. What is lifecycle compatibility?

**Expected Answer:**

Lifecycle compatibility concerns whether independently evolving systems can remain compatible despite different:

- release frequencies
- support periods
- migration speeds
- deprecation timelines
- coordination processes

Two interfaces can be technically compatible today but operationally difficult to maintain if their lifecycle expectations are incompatible.

---

## 15. What makes AI interoperability particularly challenging?

**Expected Answer:**

AI implementations can change behavior without necessarily changing interface structure.

For example:

- output characteristics may change
- supported capabilities may change
- context requirements may change
- error behavior may change
- different models may behave differently behind the same capability interface

Therefore, AI interoperability must consider behavioral and semantic compatibility in addition to structural compatibility.

---

# Quick Revision

1. Connectivity is not the same as interoperability.
2. Interoperability requires shared meaning and compatible expectations.
3. An enterprise interface is an architectural contract.
4. Interface contracts include capability, inputs, outputs, semantics, errors, context, compatibility, ownership, and lifecycle.
5. Identity, authentication, authorization, and context propagation are different concepts.
6. Identity context may need to cross system boundaries.
7. Propagated context is not automatically trustworthy.
8. Original identity and immediate caller identity may differ.
9. Security context must be intentionally propagated.
10. Trust boundaries can exist where system boundaries exist.
11. Structural compatibility does not guarantee semantic compatibility.
12. Behavioral compatibility matters for AI capabilities.
13. Error semantics are part of interoperability.
14. Versioning does not automatically solve compatibility.
15. Semantic changes can be breaking changes even when schemas remain unchanged.
16. Lifecycle compatibility matters when systems evolve at different speeds.
17. AI capability interoperability is different from model/provider interoperability.
18. Abstraction should hide unnecessary implementation details without hiding materially relevant behavior.
19. Protocol choice enables communication but does not guarantee interoperability.
20. ENT-04 owns security and authorization governance; ENT-06 owns context propagation and integration interoperability.

---

## Key Takeaways

Enterprise AI interoperability is not simply the ability to connect systems.

It is the ability of independently evolving systems to understand and preserve the:

- capability
- interface
- semantics
- identity context
- security context
- trust assumptions
- compatibility expectations
- lifecycle expectations

required for correct interaction.

The most important mental model is:

```text
Connectivity
      ↓
Interface
      ↓
Semantics
      ↓
Identity / Security Context
      ↓
Trust
      ↓
Compatibility
      ↓
Lifecycle
      ↓
Interoperability
```

A mature enterprise AI architecture therefore asks not only:

> Can these systems communicate?

It also asks:

> Do they understand each other?

> Do they preserve the context required to interpret the interaction?

> Do they trust that context appropriately?

> Can their interfaces evolve without uncontrolled breakage?

That is the foundation of enterprise AI interoperability.

---

# Further Reading

- [`ENT-01 — Enterprise AI Architecture`](../ENT-01-Enterprise-AI-Capability-Architecture-and-Operating-Models/Readme.md)
- [`ENT-04 — AI Security, Privacy and Access Governance`](../ENT-04-Enterprise-AI-Security-Privacy-and-Access-Governance/Readme.md)
- [`ENT-05 — AI Data and Information Governance`](../ENT-05-Enterprise-AI-Data-Governance-and-Information-Control/Readme.md)
- [`ENT-06 — Enterprise AI Integration and Platform Architecture`](./README.md)
- [`01 — Enterprise AI Integration Patterns and System Boundaries`](./01-Enterprise-AI-Integration-Patterns-and-System-Boundaries.md)
- [`02 — AI Platforms, Shared Services, Gateways and Control Planes`](./02-AI-Platforms-Shared-Services-Gateways-and-Control-Planes.md)
- [`ENT-07 — AI Model, Provider and Vendor Strategy`](../ENT-07-Model-Provider-and-Vendor-Strategy/README.md)
- [`ENT-08 — AI Economics and FinOps`](../ENT-08-AI-Economics-FinOps-and-Portfolio-Governance/Readme.md)
- [`ENT-09 — AI Criticality, Resilience and Dependency Governance`](../ENT-09-AI-Criticality-Resilience-and-Dependency-Governance/README.md)
