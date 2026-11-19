# Centralized, Federated, and Hybrid AI Operating Models

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain what an AI operating model means at the enterprise architecture level.
- Distinguish an operating model from an organizational chart, technical architecture, and governance model.
- Explain centralized, federated, and hybrid AI operating models.
- Identify how responsibility can be distributed between enterprise-level and domain-level capabilities.
- Explain the relationship between shared AI capabilities and operating-model structure.
- Explain how operating-level decision authority can be distributed across central and domain responsibilities.
- Analyze standardization versus autonomy trade-offs.
- Analyze reuse versus local optimization trade-offs.
- Evaluate the effects of centralized versus distributed expertise.
- Identify conditions that may favor centralized, federated, or hybrid approaches.
- Recognize common operating-model failure patterns.
- Reason about operating-model choices without assuming that one model is universally superior.

---

## Prerequisites

Before reading this chapter, you should understand:

- Enterprise AI capabilities
- Capability boundaries
- Architectural boundaries
- Shared versus domain-specific capabilities
- Architectural responsibility
- Coupling and reuse

These concepts are established in:

[01-Enterprise-AI-Capabilities-and-Architectural-Boundaries.md](./01-Enterprise-AI-Capabilities-and-Architectural-Boundaries.md)

The broader progression is:

```text
ENG → AIF → LLM → RET → AGT → PROD → ENT
                                      │
                                      ├── ENT-01
                                      │    ├── File 01: What exists?
                                      │    ├── File 02: How is it organized?
                                      │    └── File 03: How do we decide?
                                      │
                                      └── Future ENT chapters
```

File 01 established **what enterprise AI capabilities exist and where their boundaries are**.

This chapter moves to the next question:

> **How should those capabilities be organized and operated?**

---

# 1. Before We Start

Imagine an enterprise has identified several AI capabilities:

```text
Enterprise AI Capabilities

├── Shared Model Access
├── Enterprise Retrieval
├── AI Evaluation
├── Document Intelligence
├── Customer AI
└── Internal Knowledge AI
```

The enterprise now faces a different problem.

It needs to determine:

- Who provides shared capabilities?
- Who owns domain-specific capabilities?
- Who supports AI applications?
- Where should expertise live?
- Which responsibilities should be centralized?
- Which responsibilities should remain with business domains?
- Who should make operating-level decisions?
- How much standardization is useful?
- How much local autonomy is necessary?

These are **operating-model questions**.

The architecture can contain the same capabilities while organizing responsibility for them in very different ways.

For example:

```text
Same capabilities

        ↓

Different responsibility structures

        ↓

Different operating models
```

This is why:

> **Capability architecture and operating model are related, but they are not the same thing.**

---

# 2. What Is an AI Operating Model?

An **AI operating model** describes how an enterprise organizes and distributes responsibility for developing, providing, consuming, and evolving AI capabilities.

At the architecture level, it answers questions such as:

- Where does AI expertise reside?
- Who provides shared capabilities?
- Who develops domain-specific capabilities?
- Where are important operating decisions made?
- How much autonomy do domains have?
- Which capabilities are common across the enterprise?
- Which responsibilities remain local to domains?
- How much standardization is expected?

A useful mental model is:

```text
                    AI Capabilities
                          │
                          ▼
                 Operating Model
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
         Central        Domain       Shared
       Responsibility Responsibility Capabilities
```

The operating model does **not** simply answer:

> “Which team reports to which manager?”

It answers a broader architectural question:

> **How is responsibility for enterprise AI capabilities distributed?**

---

# 3. Operating Model vs Organizational Chart

These concepts are related but different.

An organizational chart describes reporting relationships.

An operating model describes how work, responsibility, expertise, capabilities, and decision-making are organized to operate the enterprise.

For example:

```text
Organizational Structure

        CTO
         │
    ┌────┴────┐
    │         │
 AI Team   Finance
             │
             └── Finance AI Team
```

This tells us something about reporting structure.

It does not by itself tell us:

- who provides shared AI capabilities,
- who owns domain-specific capabilities,
- how platform responsibilities are distributed,
- how domains consume shared capabilities,
- or how much autonomy domains have.

The operating model adds those architectural relationships.

---

# 4. Operating Model vs Technical Architecture

An operating model and technical architecture influence each other, but they answer different questions.

### Technical architecture

Primarily asks:

> What components, interfaces, systems, and relationships should exist?

### Operating model

Primarily asks:

> How should responsibility for those capabilities be organized and operated?

For example:

```text
Technical Architecture

Applications
     │
     ▼
Shared AI Platform
     │
     ▼
Models / Data / Infrastructure
```

The operating model may decide:

```text
Operating Model

Central Team
     │
     ├── Shared Platform
     └── Common AI Capabilities

Domain Teams
     │
     ├── Domain Applications
     └── Domain-Specific Capabilities
```

The two views are connected.

But they should not be collapsed into one concept.

---

# 5. Operating Model vs Governance

Operating model and governance are also different.

An operating model describes how capabilities and responsibilities are organized.

Governance addresses authority, accountability, decision rights, lifecycle control, governance gates, exceptions, and evidence.

For example:

```text
Operating Model
    │
    ├── Where expertise sits
    ├── Who provides capabilities
    ├── Who consumes capabilities
    ├── Who performs operating responsibilities
    └── Where operating-level decisions are made

Governance
    │
    ├── Who has formal authority
    ├── Who is accountable
    ├── Which decisions require approval
    ├── Which controls apply
    └── How exceptions are handled
```

ENT-01 File 02 therefore focuses on **operating structure, responsibility distribution, and operating-level decision authority**, not governance mechanisms.

Detailed governance belongs to ENT-02.

---

# 6. The Three Core Operating Models

Three broad patterns are particularly useful for enterprise AI architecture:

```text
Centralized
Federated
Hybrid
```

These are not rigid organizational templates.

They are architectural patterns for reasoning about where responsibility, expertise, and capability provision are concentrated or distributed.

---

# 7. Centralized AI Operating Model

In a centralized model, significant AI capability responsibility is concentrated in a central enterprise function.

A simplified structure is:

```text
                    Enterprise
                        │
                        ▼
                Central AI Function
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
     AI Platform     AI Expertise   AI Capabilities
          │
          ├─────────────┬─────────────┐
          ▼             ▼             ▼
       Domain A       Domain B       Domain C
```

The central function may provide:

- shared AI capabilities,
- common AI expertise,
- common platform capabilities,
- reusable services,
- common engineering practices,
- or centralized AI development.

The exact scope varies by enterprise.

The defining characteristic is:

> **A large portion of AI responsibility is concentrated centrally.**

---

# 8. Why Enterprises Choose Centralization

Centralization can be attractive when an enterprise needs strong commonality.

Examples include:

- limited AI expertise,
- early AI maturity,
- significant duplication across domains,
- strong need for common platforms,
- strong standardization requirements,
- expensive specialist skills,
- or a small number of high-value AI capabilities.

Consider an enterprise where five departments independently need model access.

Without centralization:

```text
Finance ──► Model Provider A
HR      ──► Model Provider B
Legal   ──► Model Provider A
Sales   ──► Model Provider C
Support ──► Model Provider B
```

A centralized capability might instead provide:

```text
Finance ──┐
HR ──────┤
Legal ───┼──► Shared Model Access
Sales ───┤
Support ─┘
```

This can reduce duplication and create a common capability.

But centralization also creates trade-offs.

---

# 9. Centralized Model: Advantages

Centralization can provide:

### 9.1 Concentrated expertise

Specialist AI engineers can work together rather than being distributed across many domains.

### 9.2 Reuse

Common capabilities can be developed once and reused.

### 9.3 Standardization

Common approaches can be easier to establish.

### 9.4 Reduced duplication

Multiple domains may avoid building equivalent capabilities independently.

### 9.5 Shared platform investment

Expensive capabilities can potentially be built once and used broadly.

### 9.6 Consistency

Consumers may receive more consistent capabilities and interfaces.

These benefits become particularly valuable when the enterprise has strong common requirements.

---

## 10. Centralized Model: Limitations

Centralization can also create problems.

### 10.1 Domain distance

A central team may not understand domain-specific requirements deeply enough.

### 10.2 Bottlenecks

Many domains may depend on a single central capability provider.

```text
Domain A ──┐
Domain B ──┤
Domain C ──┼──► Central AI Team
Domain D ──┤
Domain E ──┘
```

If demand exceeds central capacity, the central function can become a bottleneck.

### 10.3 Reduced local autonomy

Domains may have limited ability to adapt AI capabilities to their specific needs.

### 10.4 Slower domain-specific change

A central team serving many consumers must balance competing requirements.

### 10.5 Single concentration of expertise

If too much expertise is centralized, domains may fail to develop their own AI capability.

Centralization therefore trades local autonomy for stronger commonality and concentration.

---

# 11. Federated AI Operating Model

A federated model distributes AI responsibility across business or domain teams.

A simplified structure is:

```text
                 Enterprise
                     │
       ┌─────────────┼─────────────┐
       ▼             ▼             ▼
   Domain A       Domain B       Domain C
       │             │             │
   AI Team        AI Team        AI Team
       │             │             │
       ▼             ▼             ▼
 Domain AI       Domain AI       Domain AI
Capabilities    Capabilities    Capabilities
```

The defining characteristic is:

> **AI responsibility is distributed closer to the domains that use and understand the capabilities.**

Each domain may have:

- AI expertise,
- domain-specific capabilities,
- AI applications,
- local technical responsibility,
- and local operating-level decision authority.

Federation does not necessarily mean complete independence.

Common enterprise expectations may still exist.

---

# 12. Why Enterprises Choose Federation

Federation can be attractive when:

- domain expertise is critical,
- business domains differ substantially,
- local change velocity matters,
- domains have sufficient AI maturity,
- domain-specific AI use cases dominate,
- local autonomy is important,
- or centralization would create excessive bottlenecks.

Consider a large enterprise with highly different domains:

```text
Healthcare
Financial Services
Manufacturing
Retail
```

The AI requirements may differ substantially.

A federated model can place AI expertise close to each domain:

```text
Healthcare AI Team
       │
Healthcare AI

Finance AI Team
       │
Finance AI

Manufacturing AI Team
       │
Manufacturing AI
```

The architecture can therefore optimize for domain alignment.

---

# 13. Federated Model: Advantages

### 13.1 Strong domain alignment

Domain teams understand their own business requirements.

### 13.2 Local autonomy

Domains can make many operating-level decisions without waiting for a central team.

### 13.3 Faster local iteration

Domain-specific capabilities can evolve according to local requirements.

### 13.4 Distributed expertise

AI knowledge can grow across multiple parts of the enterprise.

### 13.5 Local optimization

Teams can optimize for domain-specific constraints.

Federation is particularly useful when domains are genuinely different rather than merely organizationally separated.

---

## 14. Federated Model: Limitations

Federation can introduce its own problems.

### 14.1 Duplication

Multiple domains may build similar capabilities.

```text
Finance ──► Retrieval System A
HR ───────► Retrieval System B
Legal ────► Retrieval System C
```

### 14.2 Inconsistent standards

Different domains may adopt different approaches.

### 14.3 Fragmented expertise

Specialist knowledge may become isolated.

### 14.4 Difficult reuse

Capabilities built locally may not be easily reusable elsewhere.

### 14.5 Divergent architectures

Over time, domains may evolve substantially different technical and capability structures.

### 14.6 Increased integration burden

Enterprise-wide capabilities may become harder to connect.

Federation therefore trades stronger local autonomy for potentially weaker enterprise-wide consistency.

---

# 15. Hybrid AI Operating Model

A hybrid model combines centralized and federated responsibilities.

This is often useful when an enterprise needs both:

- common enterprise capabilities,
- and domain-specific autonomy.

A simplified model is:

```text
                     Enterprise
                         │
               ┌─────────┴─────────┐
               ▼                   ▼
        Central AI Function    Domain AI Teams
               │                   │
       ┌───────┼───────┐      ┌────┼────┐
       ▼       ▼       ▼      ▼    ▼    ▼
    Shared   Common  Shared  Domain Domain Domain
    Platform Standards Services AI    AI    AI
```

The central function may provide shared capabilities.

Domain teams may provide domain-specific capabilities and applications.

The exact split depends on enterprise context.

---

# 16. Why Hybrid Models Are Common

Large enterprises often contain both common and highly specialized requirements.

For example:

```text
Common Across Enterprise

Model Access
Evaluation
Shared Platform Capabilities
Common Engineering Practices


Domain-Specific

Customer Workflows
Legal Interpretation
Financial Processes
Clinical Workflows
Domain Knowledge
```

Trying to centralize everything can create bottlenecks.

Trying to federate everything can create duplication.

A hybrid model attempts to place each responsibility where it creates the most value.

The architectural challenge is therefore:

> **What should be common, and what should remain local?**

---

# 17. Hybrid Model: Advantages

Hybrid models can provide:

- shared enterprise capabilities,
- domain autonomy,
- reuse where commonality is real,
- local optimization where specialization matters,
- distributed expertise,
- and reduced duplication.

For example:

```text
                 Central AI Function
                       │
       ┌───────────────┼────────────────┐
       ▼               ▼                ▼
 Shared Model       Shared           Shared
 Access             Evaluation       Platform
       │
       └───────────────┬────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
     Finance           HR            Legal
     AI Team         AI Team        AI Team
```

This allows the enterprise to centralize common capabilities while keeping domain expertise closer to the business.

---

# 18. Hybrid Model: Limitations

Hybrid models can also be difficult to operate.

### 18.1 Responsibility ambiguity

It may be unclear whether a capability belongs centrally or locally.

### 18.2 Boundary disputes

Central and domain teams may disagree about what should be shared.

### 18.3 Coordination overhead

The enterprise must coordinate across central and domain responsibilities.

### 18.4 Duplicated capabilities

Domains may build local versions of capabilities that the central function already provides.

### 18.5 Platform tension

The central team may optimize for enterprise consistency while domains optimize for local needs.

Hybrid models therefore provide flexibility at the cost of requiring clearer boundaries.

---

## 19. Centralized vs Federated vs Hybrid

The three models can be compared at a high level.

| Dimension | Centralized | Federated | Hybrid |
|---|---|---|---|
| AI expertise | Concentrated | Distributed | Mixed |
| Domain autonomy | Lower | Higher | Selective |
| Standardization | Easier | Harder | Selective |
| Reuse | Easier | Harder | Strong where appropriate |
| Local optimization | Lower | Higher | Selective |
| Duplication risk | Lower | Higher | Medium |
| Central bottleneck risk | Higher | Lower | Medium |
| Coordination complexity | Lower across domains | Higher across domains | Higher |
| Domain alignment | Potentially lower | High | High where local |
| Shared capability focus | Strong | Variable | Strong where justified |

This table describes tendencies, not guarantees.

A well-designed federated model can still standardize effectively.

A poorly designed centralized model can still suffer from duplication or inconsistency.

The operating model must therefore be evaluated in context.

---

## 20. Centralization vs Federation Is Not Binary

Real enterprises rarely fit perfectly into one box.

A useful way to think about operating models is as a spectrum:

```text
Highly Centralized
        │
        ▼
   Centralized
        │
        ▼
      Hybrid
        │
        ▼
   Federated
        │
        ▼
Highly Federated
```

Different capabilities may also use different responsibility structures.

For example:

```text
Capability                    Operating Pattern

Model Access                  Centralized
Enterprise Evaluation         Centralized
Domain Knowledge              Federated
Customer AI Applications      Federated
AI Developer Platform         Hybrid
Enterprise Retrieval          Hybrid
```

This is an important architectural insight:

> **The enterprise does not necessarily need one operating model for every AI capability.**

---

# 21. Responsibility Distribution

An operating model becomes clearer when responsibility is examined capability by capability.

Consider:

```text
                 Capability
                     │
       ┌─────────────┼─────────────┐
       ▼             ▼             ▼
   Central         Shared         Domain
 Responsibility   Responsibility Responsibility
```

Different capabilities may have different responsibility distributions.

For example:

| Capability | Possible responsibility pattern |
|---|---|
| Model access | Central |
| Shared retrieval infrastructure | Central or hybrid |
| Domain knowledge | Domain |
| AI application | Domain |
| Enterprise evaluation capability | Central or hybrid |
| Domain-specific evaluation | Domain |
| Shared AI platform | Central or hybrid |

These are examples, not universal prescriptions.

The purpose is to demonstrate that operating-model decisions should follow capability boundaries.

---

# 22. Central vs Domain Responsibility

A useful distinction is:

```text
Central Responsibility
        │
        ├── Enterprise-wide commonality
        ├── Shared capabilities
        ├── Common platform needs
        └── Cross-domain reuse

Domain Responsibility
        │
        ├── Domain context
        ├── Domain-specific capabilities
        ├── Local workflows
        └── Domain-specific optimization
```

The central function does not need to own everything.

The domain does not need to own everything.

The architecture should place responsibility where the characteristics of the capability justify it.

---

# 23. Capability Ownership and Operating Responsibility

A capability may have a defined architectural responsibility while its operation involves several participants.

In this chapter, **capability ownership** refers to the operating responsibility for providing, maintaining, and evolving a capability within the chosen operating model.

It does **not**, by itself, mean:

- formal enterprise governance authority,
- executive accountability,
- organizational management,
- or governance decision rights.

For example:

```text
Shared AI Capability
       │
       ├── Capability owner / operating responsibility
       │
       ├── Domain consumers
       │
       └── Supporting technical teams
```

The operating model determines how these responsibilities are distributed.

A capability may therefore have:

- central operating ownership,
- domain operating ownership,
- shared responsibility,
- or a hybrid arrangement.

This should be distinguished from governance questions such as who has formal authority, who approves exceptions, or who is accountable for governance outcomes.

Those questions belong to ENT-02.

---

# 24. Operating-Level Decision Authority

Responsibility is not only about who performs the work.

An operating model must also clarify:

> **Who makes operating-level decisions about the capability?**

This is different from formal enterprise governance authority.

Operating-level decisions may include questions such as:

- Which shared capability should be provided?
- Which operational capabilities remain domain-specific?
- Which changes are handled centrally?
- Which changes can domains make independently?
- Which platform capabilities are common?
- Which local variations are supported?
- How should shared capability capacity be evolved?

For example, a centralized model may look like:

```text
Central AI Function
       │
       ├── Provides shared capability
       ├── Evolves shared capability
       └── Makes operating decisions
              │
              ▼
          Domain Consumers
```

A federated model may look like:

```text
Domain AI Team
       │
       ├── Provides domain capability
       ├── Evolves domain capability
       └── Makes local operating decisions
              │
              ▼
        Domain Consumers
```

A hybrid model may distribute operating decisions according to capability boundaries:

```text
Shared Capability
       │
       ▼
Central / Shared Operating Decisions

Domain Capability
       │
       ▼
Domain Operating Decisions
```

The important principle is:

> **Operating-level decision authority should follow the responsibility structure of the capability.**

This does not define formal governance rights or enterprise approval mechanisms. Those belong to ENT-02.

---

# 25. Shared Platform Responsibility

Shared AI platforms are often a major source of operating-model tension.

Suppose an enterprise provides:

```text
                 Shared AI Platform
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
     Finance            HR            Legal
```

Several questions immediately arise:

- Who defines the platform capability?
- Who evolves it?
- Who supports it?
- Who determines what belongs on it?
- How much customization should it allow?
- Which requirements are common?
- Which requirements remain domain-specific?
- Who makes operating-level decisions about shared platform evolution?

These are operating-model questions.

A shared platform may therefore be technically centralized while responsibility for consuming and extending it remains distributed.

---

# 26. Standardization vs Autonomy

One of the central operating-model trade-offs is:

```text
Standardization  ←──────────────→  Autonomy
```

### Standardization

Standardization can provide:

- consistency,
- reuse,
- predictable interfaces,
- common engineering expectations,
- easier cross-domain integration.

### Autonomy

Autonomy can provide:

- local flexibility,
- faster domain-specific decisions,
- better domain alignment,
- experimentation,
- local optimization.

Too much standardization can become restrictive.

Too much autonomy can create fragmentation.

The architecture must therefore determine where commonality is genuinely valuable.

---

# 27. Reuse vs Local Optimization

Another important trade-off is:

```text
Reuse  ←────────────────────→  Local Optimization
```

Suppose three domains need AI retrieval.

A shared capability may maximize reuse:

```text
             Shared Retrieval
                    │
          ┌─────────┼─────────┐
          ▼         ▼         ▼
        HR        Legal     Finance
```

But if each domain has significantly different requirements, local capabilities may provide better results:

```text
HR Retrieval
Legal Retrieval
Finance Retrieval
```

The operating model should therefore consider whether reuse represents genuine commonality or merely superficial similarity.

---

# 28. Centralized vs Distributed Expertise

AI expertise can also be organized differently.

### Centralized expertise

```text
Central AI Experts
       │
       ├── Domain A
       ├── Domain B
       └── Domain C
```

Potential benefit:

- concentrated specialist knowledge.

Potential limitation:

- weaker domain context.

### Distributed expertise

```text
Domain A AI Team
Domain B AI Team
Domain C AI Team
```

Potential benefit:

- strong domain alignment.

Potential limitation:

- expertise duplication and uneven capability maturity.

### Hybrid expertise

```text
Central AI Specialists
        │
        ├──────┬──────┐
        ▼      ▼      ▼
      Domain Domain Domain
       AI      AI      AI
```

This can combine central expertise with domain proximity.

---

# 29. Conditions Influencing Operating-Model Choice

No single factor determines the correct operating model.

Relevant factors include:

### Enterprise scale

Larger enterprises may have greater coordination and capability-reuse challenges.

### Organizational structure

The existing distribution of business domains and technical teams can influence feasible operating arrangements.

### AI maturity

Organizations with limited AI expertise may initially benefit from stronger central concentration of expertise.

### Expertise distribution

Scarce specialist expertise may be more effectively concentrated, while mature domain expertise may support federation.

### Regulatory constraints

Regulatory requirements may favor stronger shared or centralized responsibility where consistent enterprise practices, specialized expertise, or uniform operating expectations are important.

This does not mean regulation always requires centralization. The effect depends on the capability and applicable constraints.

### Standardization needs

Capabilities requiring strong consistency may benefit from shared responsibility.

### Domain autonomy

Capabilities requiring frequent domain-specific decisions may benefit from stronger local responsibility.

### Shared platform requirements

Capabilities that benefit substantially from common platforms may justify central or hybrid responsibility.

### Risk concentration

Capabilities with significant enterprise-wide consequences may require stronger consistency in how they are operated.

This chapter does not define risk-management methods; the relevant question here is how risk characteristics affect operating responsibility.

### Integration needs

Capabilities that must work consistently across multiple domains may benefit from shared responsibility and common interfaces.

### Coordination cost

Centralization and federation both create different forms of coordination cost. The relevant question is where coordination produces the most enterprise value.

These factors are **inputs to operating-model assessment**, not a universal scoring formula.

---

## 30. Conditions Favoring Centralization

Centralization may be favored when several of the following are true:

- AI maturity is low across domains.
- Specialist expertise is scarce.
- Capabilities are highly reusable.
- Strong consistency is required.
- Shared platforms are economically important.
- Domain requirements are relatively similar.
- Duplication would be costly.
- Enterprise-wide capability development is the dominant need.
- Consistent operating responsibility is particularly important because of enterprise-wide constraints.

These conditions do not prove that centralization is correct.

They indicate that centralization may deserve consideration.

---

## 31. Conditions Favoring Federation

Federation may be favored when:

- domains differ substantially,
- domain expertise is critical,
- local decision speed matters,
- domains have sufficient AI maturity,
- domain-specific capabilities dominate,
- local experimentation is important,
- central teams would become bottlenecks,
- or business context strongly affects AI behavior.

Again, these are decision inputs rather than universal rules.

---

## 32. Conditions Favoring Hybrid Models

Hybrid models may be favored when:

- some capabilities are genuinely common,
- other capabilities are strongly domain-specific,
- enterprise standards matter,
- local autonomy also matters,
- shared platforms are useful,
- domains have meaningful AI maturity,
- and the enterprise needs both reuse and specialization.

A hybrid model is particularly useful when the capability landscape itself is mixed.

```text
Shared Capabilities
       │
       ▼
Central / Shared Responsibility

Domain Capabilities
       │
       ▼
Domain Responsibility
```

The challenge is defining the boundary between them clearly.

---

# 33. Operating Model Failure Patterns

## 33.1 Centralization of Everything

The enterprise creates one central AI function responsible for nearly everything.

```text
Everything
    │
    ▼
Central AI Team
```

Potential result:

- bottlenecks,
- poor domain alignment,
- slow local change,
- central overload.

The problem is not centralization itself.

The problem is centralizing responsibilities that require domain proximity.

---

## 33.2 Federation of Everything

Every domain builds its own AI capabilities.

```text
Finance AI
HR AI
Legal AI
Sales AI
Engineering AI
```

Potential result:

- duplicated capabilities,
- inconsistent standards,
- fragmented expertise,
- difficult enterprise reuse.

The problem is not federation itself.

The problem is distributing responsibilities that genuinely benefit from commonality.

---

## 33.3 Hybrid Without Clear Boundaries

The enterprise announces a hybrid model but does not define responsibility boundaries.

```text
Central Team  ←────?────→  Domain Team
```

Both sides may assume the other is responsible.

This can create:

- duplicated work,
- responsibility gaps,
- conflicting priorities,
- platform disputes,
- and slow decisions.

Hybrid models therefore require particularly clear capability boundaries.

---

## 33.4 Central Platform Becomes a Bottleneck

A shared platform may become mandatory for every domain.

```text
Finance ──┐
HR ──────┤
Legal ───┼──► Central Platform
Sales ───┤
Support ─┘
```

If the platform cannot evolve quickly enough, domain teams become constrained.

A shared capability is valuable only if its operating model can support its consumers effectively.

---

## 33.5 Domain Teams Rebuild Shared Capabilities

A domain may create a local implementation because the central capability does not satisfy its needs.

```text
Central Capability
       │
       ├── Finance uses it
       ├── HR uses it
       │
       └── Legal builds its own
```

This may indicate:

- a legitimate domain-specific requirement,
- an inadequate shared capability,
- or unclear operating responsibility.

The architecture should investigate which case applies rather than assuming the domain team is wrong.

---

# 34. Operating Model and Capability Boundaries

File 01 established:

> What capabilities exist?

File 02 asks:

> How should responsibility for those capabilities be organized?

The relationship can be represented as:

```text
Capability Architecture
        │
        ▼
Capability Boundaries
        │
        ▼
Responsibility Distribution
        │
        ▼
Operating Model
```

For example:

```text
Capability:
Enterprise Retrieval

        ↓

Boundary:
Shared retrieval capability
+
Domain-specific knowledge

        ↓

Operating Model:
Central/shared responsibility
+
Domain responsibility

        ↓

Result:
Enterprise reuse
+
Domain autonomy
```

The operating model should therefore follow meaningful capability boundaries rather than defining them arbitrarily.

---

# 35. Operating Model and Change Velocity

Different operating models influence how quickly changes can happen.

### Centralized

```text
Domain Need
    ↓
Central Team
    ↓
Prioritization
    ↓
Implementation
    ↓
Domain Consumer
```

This can create coordination overhead.

### Federated

```text
Domain Need
    ↓
Domain Team
    ↓
Implementation
```

This can enable faster local change.

### Hybrid

```text
Common Need
    ↓
Central Team

Domain Need
    ↓
Domain Team
```

This can provide selective autonomy.

The important question is not:

> “Which model is fastest?”

It is:

> **Which model provides appropriate change velocity for the capabilities being operated?**

---

# 36. Operating Model and AI Maturity

Operating-model suitability can change as an enterprise matures.

An organization with limited AI expertise may initially benefit from greater centralization:

```text
Low AI Maturity
      ↓
Concentrate Expertise
      ↓
Build Shared Capabilities
```

As domains develop stronger expertise:

```text
Growing Maturity
      ↓
Increase Domain Capability
      ↓
Move Toward Selective Federation
```

This does not mean every enterprise should follow this path.

It illustrates an important principle:

> **An operating model can evolve as enterprise capability maturity changes.**

---

# 37. Operating Model and Enterprise Scale

Scale can influence operating-model needs.

A small enterprise may manage AI through one central group.

A large enterprise may need:

```text
Central AI Function
        +
Domain AI Teams
        +
Shared Capabilities
```

However, organizational size alone does not determine the correct model.

The relevant question is how scale affects:

- capability reuse,
- expertise distribution,
- coordination,
- domain diversity,
- platform demand,
- and decision speed.

---

# 38. Operating Model and Domain Diversity

Consider two enterprises.

### Enterprise A

```text
Finance
HR
Sales
Marketing
```

The domains may have substantial overlap in AI requirements.

Centralization or hybrid operation may provide significant reuse.

### Enterprise B

```text
Medical Research
Manufacturing
Autonomous Systems
Legal Services
Financial Trading
```

The capabilities and constraints may differ substantially.

Greater federation or hybridization may be more appropriate.

The key variable is not simply the number of domains.

It is the **degree of meaningful difference between their AI capability needs**.

---

# 39. Operating Model and Standardization

Standardization can occur at different levels.

For example:

```text
Enterprise
   │
   ├── Common Principles
   │
   ├── Shared Capabilities
   │
   ├── Common Interfaces
   │
   └── Domain-Specific Implementation
```

An enterprise does not need to standardize every implementation detail to achieve useful consistency.

Likewise, autonomy does not mean that every domain should invent completely independent approaches.

The architectural question is:

> **Where does standardization create enterprise value, and where does flexibility create more value?**

---

# 40. Operating Model and Local Optimization

A domain may optimize for:

- business-specific workflows,
- domain-specific data,
- local performance,
- specialized user needs,
- or domain-specific change velocity.

A central function may optimize for:

- reuse,
- consistency,
- platform efficiency,
- enterprise integration,
- and shared expertise.

These optimization objectives can conflict.

```text
Central Optimization
        ↕
Domain Optimization
```

A hybrid operating model often exists because both optimization levels matter.

The architecture should make the boundary between them explicit.

---

# 41. Practical Operating-Model Assessment

When assessing whether an operating model fits an enterprise AI capability, begin with the capability and its boundaries.

The purpose of this assessment is **not** to define a universal architecture decision process. It is to understand whether responsibility distribution is appropriate for the capability.

### Step 1 — Identify the capability

```text
What capability are we operating?
```

### Step 2 — Identify consumers

```text
Who needs it?
```

### Step 3 — Determine commonality

```text
How similar are the requirements?
```

### Step 4 — Identify domain specificity

```text
What must remain local?
```

### Step 5 — Assess expertise distribution

```text
Where does the required expertise exist?
```

### Step 6 — Assess standardization needs

```text
What benefits from consistency?
```

### Step 7 — Assess autonomy needs

```text
Where is local decision speed important?
```

### Step 8 — Assess shared-platform needs

```text
Which capabilities benefit from common infrastructure or services?
```

### Step 9 — Identify operating-level decision authority

```text
Who should make decisions about this capability's day-to-day
evolution, operation, and local variation?
```

### Step 10 — Identify coordination costs

```text
Where could centralization or federation create bottlenecks?
```

### Step 11 — Compare operating-model patterns

```text
Centralized
     │
     ├── Does it fit?
     │
     ▼
Federated
     │
     ├── Does it fit?
     │
     ▼
Hybrid
```

This assessment helps determine whether the responsibility distribution fits the characteristics of the capability.

It is **not a universal scoring model or formal enterprise architecture decision process**.

Detailed architecture decision criteria, competing architecture options, trade-off evaluation, decision rationale, and consequences are covered in File 03.

---

# 42. Enterprise Example: Internal Knowledge AI

Consider an enterprise with:

- HR,
- Legal,
- Engineering,
- Finance.

Each domain wants an AI knowledge assistant.

### Option A — Fully centralized

```text
                 Central AI Team
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
       HR             Legal        Engineering
        │              │              │
        └──────────────┼──────────────┘
                       ▼
                Central Assistants
```

Potential strengths:

- common expertise,
- common platform,
- reuse.

Potential weaknesses:

- domain distance,
- central bottleneck,
- slower domain-specific change.

### Option B — Fully federated

```text
HR AI Team
Legal AI Team
Engineering AI Team
Finance AI Team
```

Potential strengths:

- domain alignment,
- autonomy,
- local optimization.

Potential weaknesses:

- duplicated retrieval,
- duplicated platform work,
- inconsistent approaches.

### Option C — Hybrid

```text
                 Central AI Function
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
      Retrieval     Evaluation    Shared
      Capability    Capability    Platform
          │
     ┌────┼────┬──────┐
     ▼    ▼    ▼      ▼
    HR  Legal  Eng   Finance
    AI    AI    AI      AI
   Team  Team  Team    Team
```

This may allow common capabilities to be shared while domain teams retain responsibility for domain-specific applications and knowledge.

The example does not prove that hybrid is correct.

It demonstrates how operating-model reasoning can begin from capability differences.

---

# 43. Enterprise Example: Shared Model Access

Suppose every domain needs access to multiple AI model providers.

A centralized capability may provide:

```text
                  Model Access Capability
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
           Finance         HR          Legal
```

The central capability can potentially provide common access mechanisms.

But domains may still need local responsibility for:

- application behavior,
- domain prompts,
- domain workflows,
- domain-specific evaluation,
- or domain-specific requirements.

This illustrates a common hybrid pattern:

```text
Shared capability
       +
Domain-specific capability
```

The operating model follows the capability boundary rather than forcing every responsibility into one team.

---

# 44. Enterprise Example: Document Intelligence

Suppose an enterprise processes:

```text
Invoices
Contracts
Claims
Employee Documents
```

A central capability may provide common document processing.

Domains may retain responsibility for interpretation:

```text
                 Shared Document Capability
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
         Finance          Legal            HR
         Rules            Rules           Rules
```

The central function provides common capability.

Domains provide domain-specific interpretation.

This is an example of how hybrid operating models can emerge naturally from capability boundaries.

---

# 45. Common Mistakes and Misconceptions

## Mistake 1 — “Centralized is always more efficient”

Centralization can reduce duplication but can also create bottlenecks and domain distance.

Efficiency depends on the capabilities being operated.

---

## Mistake 2 — “Federated means every domain does everything”

Federation means responsibility is distributed.

It does not require every domain to independently recreate every enterprise capability.

---

## Mistake 3 — “Hybrid means the enterprise has both central and domain teams”

Simply having both types of teams does not create a coherent hybrid operating model.

The important question is how responsibilities are distributed.

---

## Mistake 4 — “Shared capability means central ownership”

A capability can be shared while responsibility is distributed in different ways.

Sharing and operating structure are related but distinct questions.

---

## Mistake 5 — “Operating model equals organizational chart”

Reporting lines alone do not explain how AI capabilities are operated.

---

## Mistake 6 — “More standardization is always better”

Excessive standardization can restrict domain-specific requirements and slow local change.

---

## Mistake 7 — “More autonomy is always better”

Uncontrolled autonomy can create duplication, fragmentation, and inconsistent enterprise capabilities.

---

## Mistake 8 — “One enterprise needs one operating model”

Different capabilities may justify different responsibility distributions.

---

## Mistake 9 — “Hybrid is automatically the best compromise”

Hybrid models can combine benefits but can also create responsibility ambiguity and coordination overhead.

Hybrid is useful when the capability landscape actually requires both shared and local responsibility.

---

## 46. Interview Questions

## 1. What is an AI operating model?

**Expected answer:**

An AI operating model describes how an enterprise organizes and distributes responsibility, expertise, and capability provision for AI across central and domain structures.

---

## 2. How is an operating model different from an organizational chart?

**Expected answer:**

An organizational chart primarily describes reporting relationships. An operating model describes how capabilities, responsibilities, expertise, and work are organized to operate the enterprise.

---

## 3. How is an operating model different from technical architecture?

**Expected answer:**

Technical architecture describes systems, components, interfaces, and relationships. An operating model describes how responsibility for those capabilities is organized and distributed.

---

## 4. What characterizes a centralized AI operating model?

**Expected answer:**

A significant portion of AI capability responsibility and expertise is concentrated in a central enterprise function.

---

## 5. What characterizes a federated AI operating model?

**Expected answer:**

AI responsibility and expertise are distributed across business or domain teams that operate closer to their domain requirements.

---

## 6. What is a hybrid AI operating model?

**Expected answer:**

A hybrid model combines centralized and federated responsibility so that common enterprise capabilities can be shared while domain-specific capabilities remain closer to the domains.

---

## 7. Is a hybrid model always better?

**Expected answer:**

No. Hybrid models can provide flexibility and balance but can also introduce responsibility ambiguity and coordination overhead.

---

## 8. When might centralization be appropriate?

**Expected answer:**

When commonality is high, specialist expertise is scarce, standardization matters, shared capabilities provide significant reuse, or duplication would be costly.

---

## 9. When might federation be appropriate?

**Expected answer:**

When domains differ substantially, domain expertise is important, local autonomy matters, and domains have sufficient AI maturity to operate capabilities independently.

---

## 10. Why can centralized AI teams become bottlenecks?

**Expected answer:**

When many domains depend on a limited central capacity, competing requirements can accumulate and the central team can become the limiting factor for domain change.

---

## 11. Why can federated models create duplication?

**Expected answer:**

Multiple domains may independently build capabilities that have enough commonality to have been shared.

---

## 12. Can different AI capabilities use different operating models?

**Expected answer:**

Yes. A model-access capability may be centralized while domain knowledge or applications remain federated. Operating-model decisions can therefore be capability-specific.

---

## 13. What is the main trade-off between centralization and federation?

**Expected answer:**

Centralization tends to favor commonality, reuse, standardization, and concentrated expertise. Federation tends to favor domain alignment, autonomy, local optimization, and distributed expertise.

---

## 14. What makes a hybrid operating model difficult?

**Expected answer:**

The boundary between central and domain responsibilities must be clear. Otherwise, responsibility gaps, duplication, conflicting priorities, and coordination overhead can emerge.

---

## 15. Does sharing a capability automatically determine how it should be operated?

**Expected answer:**

No. A shared capability identifies common enterprise need, but the operating model determines how responsibility and expertise are distributed around that capability.

---

## 16. How would you assess whether a capability fits a centralized or federated model?

**Expected answer:**

Examine capability commonality, domain differences, expertise distribution, standardization needs, autonomy requirements, reuse value, coordination costs, shared-platform requirements, regulatory and risk constraints, integration needs, and the consequences of central bottlenecks or local duplication.

---

## 17. What is operating-level decision authority?

**Expected answer:**

It describes where decisions about the operation, evolution, local variation, and responsibility of an AI capability are made within the operating model. It is distinct from formal governance authority and governance decision rights.

---

## 47. Quick Revision

> **An AI operating model explains how enterprise AI capabilities are organized and operated.**

Three broad patterns are:

```text
Centralized
    ↓
Responsibility concentrated centrally

Federated
    ↓
Responsibility distributed across domains

Hybrid
    ↓
Shared/common capabilities centrally or jointly operated
+
Domain-specific capabilities locally operated
```

The key trade-offs include:

```text
Standardization ↔ Autonomy
Reuse ↔ Local Optimization
Central Expertise ↔ Distributed Expertise
Common Capability ↔ Domain Specialization
Central Coordination ↔ Local Decision Speed
```

Important principles:

- Centralization is not universally better.
- Federation is not universally better.
- Hybrid is not automatically the best compromise.
- Different capabilities may use different operating patterns.
- The operating model should follow meaningful capability boundaries.
- Shared capabilities do not automatically imply centralized operation.
- Capability ownership describes operating responsibility; it does not automatically define governance authority.
- Operating-level decision authority should align with capability responsibility.
- Organizational structure and operating model are related but different.
- Governance authority and operating responsibility are related but different.
- Regulatory constraints, risk characteristics, integration needs, expertise distribution, standardization, autonomy, and enterprise scale can all influence operating-model choice.

---

# 48. Key Takeaways

- An AI operating model describes how enterprise AI capabilities, expertise, responsibilities, and operating-level decisions are organized and distributed.
- It is different from an organizational chart, technical architecture, and governance model.
- Centralized models concentrate significant AI responsibility and expertise centrally.
- Federated models distribute AI responsibility closer to business domains.
- Hybrid models combine shared enterprise capabilities with domain-specific responsibility.
- Centralization can improve reuse, standardization, and expertise concentration but can create bottlenecks and domain distance.
- Federation can improve domain alignment, autonomy, and local optimization but can create duplication and fragmentation.
- Hybrid models can balance commonality and autonomy but require clear responsibility and decision boundaries.
- Standardization and autonomy are competing architectural forces.
- Reuse and local optimization can also conflict.
- Different enterprise AI capabilities may justify different operating models.
- Capability ownership in this context means operating responsibility for providing, maintaining, and evolving a capability; it does not automatically mean formal governance authority.
- Operating-level decision authority should follow the responsibility structure of the capability while remaining distinct from governance decision rights.
- Regulatory constraints, risk, integration needs, enterprise scale, AI maturity, expertise distribution, standardization, and domain autonomy can influence operating-model choice.
- Operating-model assessments should begin from capability boundaries rather than team structures alone.
- A good operating model is context-dependent and should be justified by the characteristics of the capabilities being operated.
- **File 01 establishes what capabilities exist and where their boundaries are. File 02 establishes how those capabilities are organized and operated. File 03 will establish how architecture principles, options, trade-offs, and decisions are evaluated and defended.**

---

## Further Reading

The following resources provide supplementary context for enterprise architecture and AI operating considerations:

- [The Open Group — TOGAF Standard](https://www.opengroup.org/togaf)
- [The Open Group — Architecture Frameworks and Standards](https://www.opengroup.org/standards)
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
- [ISO/IEC 42001 — Artificial Intelligence Management System](https://www.iso.org/standard/81230.html)

These resources are supplementary. They do not replace the capability and operating-model reasoning established in this chapter.
