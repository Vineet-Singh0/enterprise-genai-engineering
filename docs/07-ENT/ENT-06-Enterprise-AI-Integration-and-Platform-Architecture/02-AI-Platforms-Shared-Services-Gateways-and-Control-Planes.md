# AI Platforms, Shared Services, Gateways and Control Planes

## Learning Objectives

After completing this chapter, you should be able to:

- Explain why enterprises introduce shared AI platforms.
- Identify responsibilities that are appropriate for an enterprise AI platform.
- Distinguish shared AI capabilities from domain-owned AI capabilities.
- Reason about the architectural role of AI gateways.
- Understand enterprise model/provider and capability routing as an architectural concern.
- Understand policy enforcement points and their relationship to enterprise AI architecture.
- Explain governance hooks and how platform architecture connects with governance mechanisms.
- Distinguish usage controls from detailed FinOps.
- Understand tenant and domain boundaries in shared AI platforms.
- Explain capability registration and discovery.
- Understand Enterprise AI Control Architecture.
- Distinguish Enterprise AI Control Architecture from infrastructure control planes.
- Compare centralized, federated, and distributed control models.
- Define appropriate platform and domain responsibility boundaries.
- Evaluate the architectural trade-offs of centralizing AI capabilities.
- Reason about shared capability evolution and platform dependency.

## Prerequisites

Before reading this file, you should understand:

- Enterprise AI capabilities and system boundaries.
- Synchronous and asynchronous integration.
- Shared versus embedded AI capabilities.
- Architectural coupling and dependency.
- Integration ownership and change propagation.

These concepts are established in:

[`01-Enterprise-AI-Integration-Patterns-and-System-Boundaries.md`](./01-Enterprise-AI-Integration-Patterns-and-System-Boundaries.md)

You should also understand the broader enterprise architecture and governance boundaries established in ENT-01 and ENT-04.

## Estimated Reading Time

**45–60 minutes**

## Before We Start

In the previous file, we examined how AI capabilities integrate with enterprise systems.

We considered questions such as:

- Should an AI capability be embedded inside an application?
- Should it be exposed as a shared capability?
- Should integration be synchronous or asynchronous?
- Where should system boundaries exist?
- Who owns the integration?
- What happens when a shared dependency changes?
- How does the integration topology affect coupling and failure behavior?

Those questions lead naturally to the next architectural problem.

Suppose an enterprise has dozens or hundreds of AI-enabled applications.

Each application may need:

- access to AI models,
- common AI capabilities,
- policy integration,
- governance integration,
- usage controls,
- tenant isolation,
- routing,
- capability discovery,
- standardized interfaces.

If every application implements these capabilities independently, the enterprise can quickly accumulate duplicated infrastructure and inconsistent controls.

This creates the need for an **enterprise AI platform**.

But introducing a platform creates another architectural question:

> What should the platform centralize, and what should remain under the control of individual applications and business domains?

That is the central problem of this file.

---

## Why Enterprise AI Platforms Exist

An enterprise AI platform exists because many AI applications need common capabilities.

Consider an enterprise with:

```text
Application A ──→ AI Model
Application B ──→ AI Model
Application C ──→ AI Model
Application D ──→ AI Model
```

Each application could independently implement:

- model access,
- provider integration,
- routing,
- usage controls,
- governance integration,
- tenant handling,
- capability registration,
- common AI services.

At small scale, this may appear reasonable.

At enterprise scale, the architecture can become fragmented.

```text
Application A
    ├── Model Integration
    ├── Routing
    ├── Usage Controls
    └── Governance Integration

Application B
    ├── Model Integration
    ├── Routing
    ├── Usage Controls
    └── Governance Integration

Application C
    ├── Model Integration
    ├── Routing
    ├── Usage Controls
    └── Governance Integration
```

The enterprise now has multiple implementations of the same architectural concerns.

This can produce:

- duplicated engineering effort,
- inconsistent controls,
- inconsistent integration patterns,
- fragmented capability evolution,
- duplicated provider integrations,
- difficult governance integration,
- inconsistent usage management,
- increased change coordination.

A platform can consolidate appropriate shared capabilities.

However, centralization is not automatically better.

The platform itself becomes a dependency.

Therefore the architectural question is not:

> “How much can we centralize?”

It is:

> “Which capabilities benefit from centralization, and where should the platform boundary stop?”

---

# Mental Model

A useful enterprise AI platform mental model is:

```text
Business Domains / AI Applications
              │
              ▼
      Enterprise AI Platform
              │
      ┌───────┼────────┐
      ▼       ▼        ▼
   Routing  Shared   Governance
            AI       Integration
         Capabilities
              │
      ┌───────┼────────┐
      ▼       ▼        ▼
   Model   Provider   Enterprise
Capabilities Access    Controls
```

The platform provides reusable enterprise capabilities.

It does not automatically own every AI decision made by applications.

A domain may still own:

- application-specific business logic,
- domain-specific AI workflows,
- application-specific prompts,
- domain-specific retrieval,
- application-specific agent behavior,
- business-specific decision logic,
- local optimization where enterprise standards permit it.

The platform exists to provide capabilities that benefit from shared architectural treatment.

---

# Enterprise AI Platform Responsibilities

An enterprise AI platform may provide several categories of shared capability.

| Platform Responsibility | Architectural Purpose |
|---|---|
| Model/provider access | Provide a common integration boundary for AI capabilities |
| Routing | Direct workloads toward appropriate AI capabilities |
| Shared AI services | Provide reusable enterprise capabilities |
| Policy enforcement integration | Connect requests to enterprise policy mechanisms |
| Governance hooks | Connect platform activity with governance mechanisms |
| Usage controls | Control how capabilities are consumed |
| Usage metering | Capture relevant usage information |
| Tenant boundaries | Preserve domain or tenant separation |
| Capability registration | Maintain knowledge of available capabilities |
| Capability discovery | Help applications identify usable capabilities |
| Compatibility abstraction | Reduce unnecessary coupling to implementation details |
| Platform interfaces | Provide stable enterprise integration boundaries |

These responsibilities are architectural capabilities.

They do not imply that every platform must implement all of them centrally.

The appropriate boundary depends on enterprise context.

---

## Common AI Capability Access

One reason to introduce a platform is to avoid every application independently integrating with every AI capability.

Without a platform:

```text
Application A ──→ Provider A
Application A ──→ Provider B
Application A ──→ Shared Service

Application B ──→ Provider A
Application B ──→ Provider B
Application B ──→ Shared Service

Application C ──→ Provider A
Application C ──→ Provider B
Application C ──→ Shared Service
```

This creates repeated integration relationships.

A platform can provide a shared architectural boundary:

```text
Application A ─┐
Application B ─┼──→ Enterprise AI Platform
Application C ─┘              │
                              ├──→ AI Capability A
                              ├──→ AI Capability B
                              └──→ AI Capability C
```

The benefit is not simply fewer connections.

The larger benefit is that common architectural concerns can be managed consistently.

---

# Routing

Routing determines where an AI request or capability requirement should be directed.

At enterprise architecture level, routing may consider:

- required capability,
- model/provider availability,
- policy constraints,
- tenant or workload context,
- compatibility requirements,
- architectural constraints,
- supported capability characteristics.

For example:

```text
AI Request
    │
    ▼
Enterprise AI Platform
    │
    ├── Capability Requirement
    ├── Policy Context
    ├── Tenant Context
    └── Compatibility Requirements
            │
            ▼
       Routing Decision
            │
      ┌─────┼─────┐
      ▼     ▼     ▼
   AI Cap  AI Cap AI Cap
      A      B      C
```

Routing is therefore more than selecting a destination.

It is part of the enterprise integration architecture.

### Routing Boundary with ENT-07

ENT-06 defines:

- where routing participates in enterprise architecture,
- how routing integrates with platform capabilities,
- how routing interacts with policy, tenant, capability, and compatibility context,
- how routing contributes to platform-mediated integration.

ENT-07 owns the strategic questions surrounding:

- model/provider selection,
- provider strategy,
- vendor strategy,
- diversification,
- procurement,
- strategic dependency,
- exit considerations.

Therefore:

> ENT-06 explains the architectural placement and integration of routing; ENT-07 explains the strategic model/provider and vendor decisions that routing may implement.

This distinction prevents routing architecture from becoming a duplicate of provider strategy.

---

# Shared AI Services

Some AI capabilities are useful across multiple business domains.

Examples may include:

- enterprise document processing,
- common classification capabilities,
- common summarization capabilities,
- enterprise translation capabilities,
- common AI interaction services,
- shared model access,
- reusable enterprise AI capabilities.

A shared service can provide:

```text
Domain A ─┐
Domain B ─┼──→ Shared AI Capability
Domain C ─┘
```

This can reduce duplication.

However, a shared capability also creates dependency.

If the shared capability changes, multiple consumers may be affected.

Therefore:

> Reuse creates value, but reuse also creates coupling.

This principle is central to enterprise platform architecture.

---

# Shared Capability Does Not Mean Shared Everything

A shared AI platform should not force every application to share every architectural decision.

Consider two domains.

### Domain A

A customer-service application may require:

- enterprise-approved summarization,
- domain-specific prompts,
- domain-specific workflow,
- application-specific retrieval.

### Domain B

A research application may require:

- specialized AI processing,
- different workflow semantics,
- domain-specific experimentation,
- specialized model interaction.

Both may use the same enterprise AI platform.

But the platform does not need to own their complete application architectures.

A useful boundary is:

```text
Enterprise Platform
    │
    ├── Common AI Access
    ├── Shared Capabilities
    ├── Governance Integration
    ├── Usage Controls
    └── Routing
             │
             ▼
      Domain-Owned AI
    ├── Business Logic
    ├── Domain Workflow
    ├── Application Behavior
    └── Domain-Specific Optimization
```

The goal is shared infrastructure and capability where useful, without eliminating domain autonomy.

---

# When Centralization Makes Sense

Centralization is often valuable when a capability has strong enterprise-wide reuse.

Typical signals include:

- many consumers need the same capability,
- duplicated implementations are expensive,
- consistent governance is important,
- common integration is valuable,
- enterprise-wide usage controls are required,
- capability lifecycle management benefits from a common boundary,
- common interfaces reduce unnecessary integration complexity.

For example, if dozens of applications require the same enterprise AI capability, implementing it separately in every application may create unnecessary duplication.

A shared capability may be more appropriate.

---

## When Centralization Becomes Harmful

Centralization becomes harmful when the platform attempts to own capabilities that should remain domain-specific.

Potential consequences include:

- excessive platform dependency,
- slower domain delivery,
- central-team bottlenecks,
- large change coordination requirements,
- reduced domain autonomy,
- lowest-common-denominator capabilities,
- platform overreach,
- concentration risk,
- difficulty supporting specialized requirements.

Consider:

```text
Every AI Decision
      │
      ▼
Central Platform
      │
      ▼
Central Team
```

This architecture can become a bottleneck.

A better architecture may be:

```text
Enterprise Platform
      │
      ├── Common Capabilities
      ├── Common Controls
      └── Common Integration
              │
       ┌──────┴──────┐
       ▼             ▼
   Domain A       Domain B
   AI Logic       AI Logic
```

The platform provides the shared foundation while domains retain appropriate autonomy.

---

# AI Gateways

An AI gateway is an architectural integration and control point between AI consumers and AI capabilities.

It can provide a common boundary for concerns such as:

- request routing,
- capability selection,
- tenant identification,
- usage controls,
- policy enforcement integration,
- governance hooks,
- compatibility abstraction,
- relevant usage or operational signal integration.

Conceptually:

```text
AI Application
      │
      ▼
   AI Gateway
      │
      ├── Routing
      ├── Policy Integration
      ├── Tenant Context
      ├── Usage Controls
      ├── Governance Hooks
      └── Compatibility
             │
             ▼
       AI Capability
```

The gateway therefore provides more architectural value than simply forwarding requests.

---

# Gateway Does Not Mean Authorization System

An AI gateway may participate in policy enforcement, but that does not make it the owner of enterprise authorization governance.

This distinction matters.

ENT-04 owns:

- authorization governance,
- access-control governance,
- security/privacy requirements,
- authorization semantics,
- identity and security governance.

ENT-06 owns:

- where policy enforcement integrates into the AI architecture,
- how platform components connect policy mechanisms to AI capabilities,
- how relevant context participates in the integration path.

A useful architectural model is:

```text
Request
   │
   ▼
Identity / Context
   │
   ▼
Policy Decision
   │
   ▼
Policy Enforcement Point
   │
   ▼
AI Capability
```

The gateway may be one location where enforcement occurs or is integrated.

But the gateway does not define the organization's authorization policy.

---

# Usage Controls and Usage Metering

Enterprise AI platforms often need mechanisms to control and understand usage.

### Usage Controls

Usage controls determine what consumption is permitted or constrained.

Examples include:

- capability access limits,
- tenant-specific restrictions,
- workload restrictions,
- request constraints,
- platform-defined consumption boundaries.

### Usage Metering

Usage metering records relevant information about consumption.

Examples may include:

- which tenant used a capability,
- which capability was used,
- request counts,
- relevant usage quantities,
- platform-level consumption information.

The architecture can therefore provide:

```text
AI Request
    │
    ▼
AI Platform
    │
    ├── Policy Integration
    ├── Usage Control
    ├── Usage Metering
    └── Routing
            │
            ▼
       AI Capability
```

These capabilities can support enterprise governance and economic analysis.

However, detailed economic modeling and FinOps remain the responsibility of ENT-08.

ENT-06 focuses on the architectural integration points through which usage information and controls participate in the enterprise AI platform.

---

# Tenant and Domain Boundaries

A shared enterprise AI platform may serve multiple business domains or tenants.

This creates a boundary problem.

The platform must distinguish between consumers where architectural isolation or contextual separation is required.

Conceptually:

```text
Enterprise AI Platform
        │
   ┌────┼────┐
   ▼    ▼    ▼
Tenant A  Tenant B  Tenant C
   │        │        │
Domain A  Domain B  Domain C
```

Tenant or domain boundaries may influence:

- routing context,
- capability availability,
- usage controls,
- governance integration,
- policy context,
- capability visibility,
- data or request separation.

The platform should therefore treat tenant and domain identity as architectural context rather than assuming all consumers are equivalent.

The exact identity and authorization mechanisms remain outside the scope of this file.

---

# Capability Registration

An enterprise platform needs to know what capabilities are available.

Capability registration provides an architectural mechanism for representing available AI capabilities.

A registered capability may have information such as:

- capability identity,
- capability type,
- supported interfaces,
- supported consumers,
- compatibility information,
- lifecycle status,
- relevant platform metadata.

Conceptually:

```text
AI Capability
     │
     ▼
Capability Registration
     │
     ▼
Enterprise AI Platform
     │
     ▼
Capability Discovery
```

Registration helps the platform reason about available capabilities without requiring every consumer to maintain its own independent catalogue.

---

# Capability Discovery

Capability discovery allows an application or domain to identify available enterprise AI capabilities.

For example:

```text
Application
     │
     ▼
"What AI capability can perform X?"
     │
     ▼
Capability Discovery
     │
     ▼
Available Capabilities
     │
     ▼
Capability Selection
```

Discovery can reduce hard-coded integration assumptions.

However, discovery should not become an excuse to hide important architectural contracts.

A capability still requires:

- a defined interface,
- understood semantics,
- compatibility expectations,
- ownership,
- lifecycle expectations.

Discovery tells a consumer **what exists**.

The interface contract determines **how it can be used safely**.

The detailed treatment of enterprise interfaces and compatibility belongs in File 03.

---

# Governance Hooks

Enterprise AI platforms often need to connect AI activity with enterprise governance mechanisms.

A governance hook is an architectural integration point through which platform activity can participate in governance processes.

Conceptually:

```text
AI Request
     │
     ▼
Enterprise AI Platform
     │
     ├── Policy Integration
     ├── Governance Hook
     ├── Usage Control
     └── Routing
```

Governance hooks may support integration with mechanisms responsible for:

- governance checks,
- policy evaluation,
- usage constraints,
- enterprise controls,
- governance metadata,
- lifecycle processes.

The platform does not automatically own the governance rules themselves.

This distinction is important.

The platform provides architectural integration points.

Governance domains define the policies, decisions, and accountability mechanisms that those integration points connect to.

---

# Enterprise AI Control Architecture

As enterprise AI platforms become more complex, several platform functions must coordinate.

These may include:

- identity context,
- policy integration,
- routing,
- governance integration,
- usage controls,
- capability registration,
- shared AI capabilities,
- tenant and domain context.

Together, these can be understood as an:

> **Enterprise AI Control Architecture**

Enterprise AI Control Architecture means:

> Enterprise-level coordination of identity context, policy, routing, governance, usage, registration, and shared AI capabilities across AI systems.

A conceptual model is:

```text
              Enterprise AI Control Architecture
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
 Identity Context     Policy Integration   Governance
        │                  │                  │
        └──────────────────┼──────────────────┘
                           ▼
                      Routing
                           │
                    ┌──────┴──────┐
                    ▼             ▼
            Shared AI       AI Applications
            Capabilities     / Domains
```

The purpose is coordination.

It is not infrastructure orchestration.

---

# Control Architecture vs. Infrastructure Control Plane

The term **control plane** is used in many areas of engineering.

That can create confusion.

In infrastructure engineering, a control plane may coordinate:

- infrastructure state,
- workloads,
- clusters,
- networking,
- nodes,
- infrastructure resources.

That is not the primary meaning intended here.

Enterprise AI Control Architecture focuses on:

- identity context,
- policy integration,
- routing,
- governance,
- usage,
- capability registration,
- shared AI capabilities,
- enterprise AI integration.

The distinction can be summarized as:

| Enterprise AI Control Architecture | Infrastructure Control Plane |
|---|---|
| Coordinates AI capabilities | Coordinates infrastructure |
| Integrates identity context | Coordinates infrastructure identity/state |
| Integrates policy | Manages infrastructure state |
| Coordinates AI routing | Coordinates infrastructure workloads |
| Connects governance mechanisms | Coordinates infrastructure resources |
| Manages capability registration | Manages infrastructure topology/state |
| Defines AI platform boundaries | Defines infrastructure control boundaries |

The two can coexist.

They should not be treated as the same architectural concept.

---

## A Complete Enterprise AI Control Architecture

A more complete conceptual model is:

```text
                       Enterprise AI Control Architecture
                                      │
        ┌──────────────┬──────────────┼──────────────┬──────────────┐
        ▼              ▼              ▼              ▼              ▼
 Identity Context   Policy        Governance      Usage         Capability
                    Integration    Integration     Controls      Registration
        │              │              │              │              │
        └──────────────┴──────────────┼──────────────┴──────────────┘
                                      ▼
                                  Routing
                                      │
                         ┌────────────┴────────────┐
                         ▼                         ▼
                 Shared AI Capabilities      Domain AI
                         │                   Applications
                         ▼                         │
                  AI Providers /              Business
                  AI Capabilities              Systems
```

This architecture does not mean that every organization must implement a single centralized component.

The functions may be distributed.

What matters is that the architectural responsibilities are understood and intentionally placed.

---

# Centralized vs. Distributed Control

Enterprise AI control can be organized in different ways.

Three useful conceptual models are:

1. centralized,
2. federated,
3. distributed.

These are architectural patterns rather than implementation requirements.

---

## Highly Centralized Model

In a highly centralized model, many platform functions are controlled through a common enterprise platform.

```text
              Enterprise AI Platform
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
    Domain A         Domain B         Domain C
       │               │               │
       └───────────────┼───────────────┘
                       ▼
                Shared Controls
```

### Advantages

- strong consistency,
- centralized governance integration,
- common interfaces,
- reduced duplication,
- simpler enterprise-wide coordination.

### Risks

- strong platform dependency,
- central bottlenecks,
- reduced domain autonomy,
- large blast radius for platform changes,
- slower specialized evolution.

---

# Federated Model

A federated model combines enterprise-wide standards with domain-level autonomy.

```text
              Enterprise AI Platform
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
     Domain A       Domain B        Domain C
     Controls       Controls        Controls
        │              │              │
        └──────────────┼──────────────┘
                       ▼
              Enterprise Standards
```

The enterprise defines common architectural boundaries.

Domains retain responsibility for appropriate local decisions.

This can provide a balance between:

- consistency,
- governance,
- reuse,
- autonomy,
- local optimization.

However, federation introduces coordination complexity.

---

# Distributed Model

In a distributed model, domains own most AI platform functions locally.

```text
Domain A ──→ Local AI Platform
Domain B ──→ Local AI Platform
Domain C ──→ Local AI Platform
```

This can provide:

- high autonomy,
- local optimization,
- independent evolution,
- reduced central dependency.

But it can also produce:

- duplication,
- inconsistent controls,
- fragmented capabilities,
- inconsistent interfaces,
- higher enterprise integration complexity.

Therefore, distributed architecture is not automatically better merely because it maximizes autonomy.

---

# Platform Responsibility Boundary

The platform boundary should be treated as an architectural contract.

A useful principle is:

> Centralize capabilities that create meaningful enterprise-wide value when shared, but preserve domain ownership where local context and autonomy create greater value.

For example:

| Responsibility | Typical Architectural Placement |
|---|---|
| Common model/provider access | Platform |
| Enterprise routing integration | Platform |
| Shared AI capabilities | Platform |
| Governance integration | Platform |
| Usage controls | Platform |
| Capability registration | Platform |
| Tenant/domain platform boundaries | Platform |
| Business-specific AI workflow | Domain |
| Domain business logic | Domain |
| Domain-specific AI behavior | Domain |
| Application-specific retrieval | Domain/application |
| Application-specific orchestration | Domain/application |
| Business-specific decisions | Domain |

These are architectural tendencies, not universal laws.

The correct boundary depends on:

- reuse,
- coupling,
- risk,
- governance requirements,
- domain specialization,
- change frequency,
- enterprise standards,
- operational responsibility.

---

## The Platform Boundary Is an Architectural Contract

A platform boundary should answer several questions.

### What does the platform provide?

For example:

- shared AI capabilities,
- common access,
- routing,
- governance integration,
- usage controls,
- capability registration.

### What does the platform not provide?

For example:

- domain business logic,
- every application workflow,
- every AI decision,
- every domain-specific optimization.

### Who owns changes?

A shared capability may have platform ownership while consuming applications retain responsibility for how they use it.

### What happens when the platform changes?

Consumers may need:

- compatibility guarantees,
- migration paths,
- versioning,
- communication,
- testing,
- change coordination.

The platform boundary therefore creates both reuse and responsibility.

---

## Shared Capability Evolution

Shared capabilities evolve over time.

Consider:

```text
Shared AI Capability
        │
   ┌────┼────┬────┐
   ▼    ▼    ▼    ▼
 App A App B App C App D
```

A change to the shared capability can affect every consumer.

This creates change coupling.

For example, changing:

- interface semantics,
- expected inputs,
- outputs,
- behavior,
- compatibility,
- lifecycle status,

may require multiple consumers to adapt.

Therefore shared capabilities should be designed with explicit evolution mechanisms.

These may include:

- compatibility expectations,
- controlled change,
- versioning where appropriate,
- migration paths,
- deprecation,
- consumer impact analysis.

Detailed enterprise interface evolution is developed in File 03.

---

# Platform Centralization Trade-offs

Platform architecture involves recurring trade-offs.

| Centralization Benefit | Centralization Cost |
|---|---|
| Reuse | Coupling |
| Standardization | Reduced autonomy |
| Consistent controls | Platform dependency |
| Reduced duplication | Change coordination |
| Common interfaces | Lowest-common-denominator design |
| Governance consistency | Potential delivery slowdown |
| Shared capabilities | Concentration risk |
| Common routing | Reduced local flexibility |
| Common abstraction | Possible loss of provider-specific capability |
| Platform investment | Platform maintenance burden |

The correct architectural decision depends on the actual enterprise problem.

A capability should not be centralized merely because centralization is technically possible.

---

## Architectural Decision Framework

When deciding whether a capability belongs in the enterprise platform, ask:

### 1. How widely is the capability reused?

Is it needed by:

- one application,
- one domain,
- several domains,
- the whole enterprise?

### 2. Does sharing create meaningful value?

Does centralization reduce:

- duplication,
- integration complexity,
- governance inconsistency,
- maintenance burden?

### 3. How tightly does sharing couple consumers?

Would a change affect many consumers?

### 4. How specialized is the capability?

Highly domain-specific capabilities may belong closer to the domain.

### 5. How important is enterprise consistency?

Some capabilities may require common enterprise treatment because inconsistent implementation creates significant risk.

### 6. How quickly does the capability evolve?

A rapidly evolving capability may be difficult to centralize if many consumers depend on it.

### 7. What happens if the platform becomes unavailable?

The architectural dependency and failure implications should be understood.

### 8. Does the platform need to understand domain-specific business logic?

If the platform must deeply understand domain semantics to provide the capability, it may be crossing into domain ownership.

### 9. Can the platform provide a stable abstraction?

If not, centralization may simply move complexity into the platform.

### 10. Does centralization create a bottleneck?

The enterprise should evaluate whether platform ownership improves or reduces delivery capability.

---

## Practical Enterprise Example

Consider a large enterprise with:

- CRM systems,
- customer-service applications,
- internal knowledge systems,
- document systems,
- employee applications,
- multiple AI-enabled business domains.

Several domains need:

- summarization,
- classification,
- model access,
- usage controls,
- governance integration.

A fragmented architecture might look like:

```text
CRM ─────────────→ Model Provider
Customer App ────→ Model Provider
Employee App ────→ Model Provider
Document System ─→ Model Provider
```

Each system develops its own integration.

A platform-mediated architecture could look like:

```text
CRM ────────────────┐
Customer Application ┤
Employee Application ├──→ Enterprise AI Platform
Document System ────┘             │
                                  ├──→ Routing
                                  ├──→ Governance Integration
                                  ├──→ Usage Controls
                                  ├──→ Shared AI Services
                                  └──→ AI Capabilities
```

The platform now provides a common architectural boundary.

However, the customer application may still own:

- customer-specific workflows,
- business-specific prompts,
- domain-specific retrieval,
- application behavior.

The platform does not replace the application.

It provides shared enterprise AI capabilities.

---

# What Should Remain Domain-Owned?

Not every AI capability should move into the enterprise platform.

Domain ownership is often appropriate for:

- business-specific AI workflows,
- domain-specific business rules,
- application-specific prompts,
- domain-specific retrieval,
- specialized AI behavior,
- business-specific orchestration,
- local optimization,
- experimentation where enterprise standards permit it.

A useful test is:

> If the capability requires deep knowledge of a specific business domain to function correctly, centralizing it may create more coupling than value.

This is not an absolute rule.

Some highly specialized capabilities may still be centralized when the enterprise has a strong reason to do so.

The decision should be architectural rather than ideological.

---

## Platform-Mediated Integration

Platform-mediated integration introduces an intermediary between applications and AI capabilities.

```text
Application
     │
     ▼
Enterprise AI Platform
     │
     ▼
AI Capability
```

This differs from direct integration:

```text
Application
     │
     ▼
AI Capability
```

The intermediary can provide:

- common routing,
- governance integration,
- usage controls,
- tenant context,
- capability discovery,
- shared services,
- compatibility abstraction.

But it also introduces:

- additional dependency,
- additional architectural complexity,
- platform ownership,
- potential bottlenecks,
- possible latency or failure coupling.

Therefore:

> Platform mediation is valuable when the platform provides meaningful shared architectural capabilities that justify the additional dependency.

---

# AI Gateway as a Platform Boundary

The AI gateway can be understood as one architectural boundary within the enterprise AI platform.

```text
                Enterprise AI Platform
                         │
                         ▼
                    AI Gateway
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
       Routing       Policy         Usage
                    Integration     Controls
          │              │              │
          └──────────────┼──────────────┘
                         ▼
                   AI Capability
```

The gateway may therefore participate in:

- routing,
- capability selection,
- policy enforcement integration,
- tenant context,
- usage controls,
- governance hooks,
- compatibility mechanisms.

The gateway should not be treated as synonymous with the entire enterprise AI platform.

The platform is the broader architectural capability.

The gateway is one possible integration/control boundary within it.

---

# Gateway vs. Enterprise AI Control Architecture

These concepts are related but not identical.

### AI Gateway

A gateway is an architectural boundary through which AI requests or capabilities may pass.

It may support:

- routing,
- policy enforcement integration,
- usage controls,
- tenant context,
- compatibility.

### Enterprise AI Control Architecture

Enterprise AI Control Architecture describes the broader coordination of:

- identity context,
- policy integration,
- routing,
- governance,
- usage,
- capability registration,
- shared AI capabilities.

Therefore:

```text
Enterprise AI Control Architecture
            │
            ├── Gateway
            ├── Routing
            ├── Policy Integration
            ├── Governance Hooks
            ├── Usage Controls
            └── Capability Registration
```

A gateway can be part of the control architecture.

It is not the control architecture itself.

---

# Enterprise AI Control Architecture and Governance

The control architecture creates integration points with enterprise governance.

For example:

```text
AI Request
    │
    ▼
Identity Context
    │
    ▼
Policy Integration
    │
    ▼
Governance Integration
    │
    ▼
Routing
    │
    ▼
Shared AI Capability
```

This allows enterprise governance mechanisms to participate in AI architecture without requiring every application to independently implement the same integration.

However, the platform should not absorb governance ownership.

The platform provides architectural integration points.

Governance domains retain responsibility for the policies, decisions, and accountability structures they own.

---

# Platform Responsibility Is Not Platform Ownership of Everything

A mature enterprise platform should establish boundaries rather than eliminate them.

A platform may own:

```text
Shared Enterprise Capability
```

without owning:

```text
Every Application That Uses It
```

Similarly, a platform may provide:

```text
Routing
```

without owning:

```text
Strategic Model/Provider Selection
```

A platform may provide:

```text
Policy Enforcement Integration
```

without owning:

```text
Enterprise Authorization Governance
```

A platform may provide:

```text
Usage Metering
```

without owning:

```text
Enterprise FinOps Strategy
```

This distinction prevents architectural responsibility from becoming uncontrolled platform scope.

---

# Common Architectural Mistakes

## 1. Centralizing Everything

**Mistake:** Assuming every AI capability should belong to the enterprise platform.

**Why it fails:** The platform becomes a bottleneck and creates unnecessary coupling.

**Better approach:** Centralize capabilities where enterprise-wide reuse and consistency justify the dependency.

---

## 2. Treating the Gateway as Only a Reverse Proxy

**Mistake:** Viewing the AI gateway only as a request-forwarding mechanism.

**Why it fails:** It ignores its potential architectural role in routing, policy integration, usage controls, tenant context, and compatibility.

**Better approach:** Treat the gateway as an architectural integration/control boundary.

---

## 3. Treating the Gateway as the Entire Platform

**Mistake:** Equating the gateway with the enterprise AI platform.

**Why it fails:** A gateway is only one possible component of the broader platform architecture.

**Better approach:** Distinguish gateway responsibilities from broader platform responsibilities.

---

## 4. Confusing Enterprise AI Control Architecture with Infrastructure Control Planes

**Mistake:** Assuming AI control architecture is another name for infrastructure orchestration.

**Why it fails:** The two solve different architectural problems.

**Better approach:** Keep AI capability coordination separate from infrastructure state management.

---

## 5. Ignoring Platform Dependency

**Mistake:** Focusing only on reuse benefits.

**Why it fails:** Shared capabilities create dependency and change coupling.

**Better approach:** Evaluate both reuse and dependency.

---

## 6. Making the Platform Understand Every Domain

**Mistake:** Moving domain-specific business logic into the platform.

**Why it fails:** The platform becomes tightly coupled to business domains.

**Better approach:** Keep domain-specific logic with the domain unless there is a strong architectural reason to centralize it.

---

## 7. Ignoring Shared Capability Evolution

**Mistake:** Designing a shared capability without considering how it will change.

**Why it fails:** Consumers become tightly coupled to platform evolution.

**Better approach:** Define compatibility and evolution expectations.

---

## 8. Treating Routing as Only Provider Selection

**Mistake:** Reducing routing to choosing a model or provider.

**Why it fails:** Enterprise routing may depend on capability, tenant context, policy, compatibility, and architectural constraints.

**Better approach:** Treat routing as an enterprise architectural capability.

---

## 9. Confusing Usage Controls with FinOps

**Mistake:** Turning platform usage controls into a complete cost-management system.

**Why it fails:** Detailed economics and FinOps belong to ENT-08.

**Better approach:** ENT-06 defines the architectural mechanisms for controlling and measuring usage; ENT-08 owns detailed economic governance.

---

## 10. Treating Centralization as an Architectural Goal

**Mistake:** Measuring platform success by how much functionality has been centralized.

**Why it fails:** Centralization itself creates dependency.

**Better approach:** Measure whether centralization creates meaningful enterprise value.

---

## Engineering Decisions and Trade-offs

When evaluating an enterprise AI platform, consider:

| Decision | Question |
|---|---|
| Centralize or distribute | Does sharing create enough value to justify dependency? |
| Shared or embedded | Is reuse more valuable than local autonomy? |
| Gateway or direct integration | Does the intermediary provide meaningful control or integration value? |
| Centralized or federated control | How much enterprise consistency is required? |
| Common abstraction or direct provider access | Does abstraction reduce coupling or hide important capabilities? |
| Common capability or domain capability | Is the capability genuinely reusable across domains? |
| Common routing or local routing | Does enterprise routing provide meaningful architectural value? |
| Platform ownership | Is the platform boundary clear and sustainable? |
| Shared capability evolution | How will consumers be affected by change? |
| Usage control | What consumption boundaries must the platform enforce? |
| Capability registration | How will consumers discover available capabilities? |
| Tenant boundary | How should platform context distinguish domains or tenants? |

The correct answer depends on enterprise context.

There is no universal enterprise AI platform architecture.

---

## Architecture Review Questions

When reviewing an enterprise AI platform architecture, ask:

### Platform Scope

- What does the platform actually provide?
- Why does each centralized capability belong there?
- What intentionally remains outside the platform?

### Shared Capabilities

- Which capabilities are shared?
- How many consumers use them?
- What coupling does sharing create?
- How will those capabilities evolve?

### Gateway

- What architectural responsibility does the gateway provide?
- Is it only forwarding requests?
- Where do routing and policy integration occur?
- Where do usage controls participate?

### Routing

- What inputs influence routing?
- How does tenant context affect routing?
- How does policy context affect routing?
- Where does model/provider strategy end and routing architecture begin?

### Control Architecture

- What functions belong to Enterprise AI Control Architecture?
- Is it being confused with infrastructure orchestration?
- Which controls are centralized?
- Which controls are federated or distributed?

### Platform Boundary

- Which decisions remain domain-owned?
- Does the platform understand too much domain-specific logic?
- Could the platform become a bottleneck?
- What happens if the platform changes?

### Governance

- Where do governance hooks integrate?
- Where are policy enforcement points located?
- Which governance responsibilities remain outside ENT-06?

### Usage

- What usage is controlled?
- What usage is metered?
- How does usage information integrate with enterprise governance?
- Where does detailed FinOps ownership begin?

---

## Production Perspective

In production enterprise environments, an AI platform should be evaluated as a long-lived architectural dependency.

The platform is not successful merely because applications can call AI capabilities through it.

A production-oriented architecture must also consider:

- ownership,
- capability lifecycle,
- compatibility,
- change coordination,
- domain autonomy,
- platform dependency,
- governance integration,
- usage controls,
- tenant boundaries,
- routing responsibility,
- shared capability evolution.

A platform that solves today's integration problem but creates excessive coupling may become an enterprise constraint later.

Therefore platform architecture should optimize not only for immediate reuse but also for:

- sustainable boundaries,
- controlled evolution,
- appropriate autonomy,
- predictable integration,
- clear responsibility.

---

## Complete Mental Model

The complete mental model for this file is:

```text
                    Enterprise AI Platform
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
 Shared AI            AI Gateway           Capability
 Capabilities                              Registration
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
                  Enterprise AI Control
                       Architecture
                            │
       ┌────────────┬──────┼──────┬────────────┐
       ▼            ▼      ▼      ▼            ▼
   Identity      Policy  Routing Governance  Usage
   Context       Integration        Hooks    Controls
                            │
                            ▼
                  AI Applications /
                  Business Domains
                            │
                            ▼
                    Enterprise Systems
```

The platform provides shared enterprise AI capabilities and integration mechanisms.

The control architecture coordinates important enterprise AI functions.

The gateway may act as one architectural boundary.

Domains continue to own appropriate application and business-specific responsibilities.

---

# Boundary with File 03

This file focused on:

```text
What should the enterprise AI platform provide?
Where should shared capabilities live?
How should platform responsibilities be organized?
How should routing, governance integration, usage controls,
and capability registration participate in enterprise architecture?
```

The next file moves to a different question:

> How should independent enterprise systems exchange AI capabilities and preserve identity, security context, trust context, and interface compatibility across system boundaries?

File 03 therefore develops:

- AI interoperability,
- enterprise interfaces,
- interface contracts,
- identity-context propagation,
- security-context propagation,
- cross-system trust context,
- compatibility boundaries,
- interface evolution,
- AI-specific interoperability.

The concepts should build on the platform and integration boundaries established here.

---

# Interview Questions with Expected Answers

## 1. Why does an enterprise need an AI platform?

An enterprise AI platform provides shared capabilities and integration mechanisms that multiple AI applications can reuse.

It can reduce duplication, improve consistency, provide common governance integration, and simplify access to shared AI capabilities.

However, centralization also creates coupling and dependency, so not every AI capability should be centralized.

---

## 2. What should an enterprise AI platform provide?

Potential responsibilities include:

- common AI capability access,
- routing,
- shared AI services,
- policy enforcement integration,
- governance hooks,
- usage controls,
- usage metering,
- tenant/domain boundaries,
- capability registration,
- capability discovery,
- compatibility abstraction.

The exact boundary depends on enterprise architecture.

---

## 3. What is an AI gateway?

An AI gateway is an architectural integration and control point between AI consumers and AI capabilities.

It may support routing, capability selection, policy enforcement integration, usage controls, tenant context, governance hooks, and compatibility.

It should not automatically be equated with the entire AI platform.

---

## 4. Is an AI gateway an authorization system?

No.

A gateway may participate in policy enforcement, but authorization governance and semantics belong to the appropriate security and governance domain.

ENT-06 focuses on how policy enforcement integrates into the AI architecture.

---

## 5. What is Enterprise AI Control Architecture?

Enterprise AI Control Architecture is the enterprise-level coordination of identity context, policy, routing, governance, usage, registration, and shared AI capabilities across AI systems.

It is an architectural concept for coordinating AI capabilities.

It should not be confused with infrastructure control-plane orchestration.

---

## 6. What is the difference between centralized and federated AI platform architecture?

A centralized architecture places more control and shared capabilities under a common enterprise platform.

A federated architecture establishes common enterprise standards while allowing domains to retain appropriate local control.

Centralization improves consistency but increases dependency.

Federation preserves autonomy but increases coordination complexity.

---

## 7. Why can shared AI capabilities create coupling?

Because multiple applications depend on the same capability.

If the shared capability changes, several consumers may need to adapt.

Therefore reuse creates both value and dependency.

---

## 8. Why should not every AI capability be centralized?

Some capabilities are highly domain-specific.

Centralizing them may introduce:

- unnecessary dependency,
- platform complexity,
- slower domain evolution,
- central bottlenecks,
- excessive coupling.

The decision should be based on enterprise value rather than a universal preference for centralization.

---

## 9. What is capability registration?

Capability registration is the architectural mechanism through which available AI capabilities are represented within the enterprise platform.

It can support discovery, routing, lifecycle management, and integration.

---

## 10. How is routing different from model/provider strategy?

Routing determines where a request or capability requirement should be directed within the enterprise architecture.

Model/provider strategy determines strategic choices around models, providers, vendors, diversification, procurement, and exit.

ENT-06 owns the architectural integration of routing.

ENT-07 owns model/provider and vendor strategy.

---

## 11. What is the difference between usage control and usage metering?

Usage control determines what consumption is permitted or constrained.

Usage metering records relevant information about consumption.

Both can participate in enterprise AI platform architecture.

Detailed economic and FinOps governance belongs to ENT-08.

---

## 12. What is the biggest risk of centralizing AI capabilities?

A major risk is creating excessive platform dependency.

A platform can become:

- a bottleneck,
- a concentration point,
- a change-coupling mechanism,
- a constraint on domain autonomy.

Therefore centralization must be justified by meaningful enterprise value.

---

## Quick Revision

Remember these principles:

1. **An enterprise AI platform exists to provide reusable enterprise capabilities.**
2. **Centralization is a trade-off, not an objective.**
3. **Shared capability creates both reuse and coupling.**
4. **AI gateways are architectural integration/control points, not merely reverse proxies.**
5. **A gateway is not the same thing as the entire AI platform.**
6. **Routing is an enterprise architectural capability.**
7. **ENT-06 owns routing architecture; ENT-07 owns model/provider and vendor strategy.**
8. **Policy enforcement integration belongs in ENT-06; authorization governance belongs in ENT-04.**
9. **Usage controls and metering can be platform responsibilities; detailed FinOps belongs in ENT-08.**
10. **Capability registration supports enterprise capability discovery and management.**
11. **Enterprise AI Control Architecture coordinates identity context, policy, routing, governance, usage, registration, and shared AI capabilities.**
12. **Enterprise AI Control Architecture is not infrastructure orchestration.**
13. **Centralized, federated, and distributed models have different trade-offs.**
14. **Platform responsibility must be separated from domain responsibility.**
15. **Shared capabilities require deliberate evolution and compatibility strategies.**
16. **The platform should provide shared value without owning every AI decision.**

---

## Key Takeaways

Enterprise AI platforms solve a real architectural problem: many AI applications require common capabilities and common enterprise integration mechanisms.

The platform can provide:

- shared AI capabilities,
- common access,
- routing,
- governance integration,
- policy enforcement integration,
- usage controls,
- usage metering,
- capability registration,
- tenant and domain boundaries.

AI gateways can act as important integration and control boundaries within the platform.

Enterprise AI Control Architecture provides the broader coordination model for identity context, policy, routing, governance, usage, registration, and shared capabilities.

However, platform architecture must preserve appropriate domain autonomy.

The central architectural principle is:

> **Centralize what creates meaningful enterprise-wide value, while preserving domain ownership where local context and autonomy matter more.**

A strong enterprise AI platform is therefore not the platform that centralizes the most functionality.

It is the platform with the clearest and most sustainable boundaries.

---

## Further Reading

Recommended related topics in this curriculum:

- ENT-01 — Enterprise AI Architecture and Operating Models
- ENT-04 — AI Security, Privacy and Access Governance
- ENT-05 — AI Data and Information Governance
- ENT-07 — AI Model, Provider and Vendor Strategy
- ENT-08 — AI Economics and FinOps
- ENT-09 — AI Criticality, Resilience and Dependency Governance

Within ENT-06, continue with:

[`03-AI-Interoperability-Identity-Propagation-and-Enterprise-Interfaces.md`](./03-AI-Interoperability-Identity-Propagation-and-Enterprise-Interfaces.md)
