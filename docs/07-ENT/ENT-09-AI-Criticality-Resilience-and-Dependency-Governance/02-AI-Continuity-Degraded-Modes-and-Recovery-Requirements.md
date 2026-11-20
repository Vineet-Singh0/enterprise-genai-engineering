# ENT-09 — AI Continuity, Degraded Modes and Recovery Requirements

## Learning Objectives

After completing this chapter, you should be able to:

- distinguish availability from business continuity;
- define continuity requirements for critical AI capabilities;
- reason about degraded operating modes;
- define minimum viable AI capability;
- evaluate fallback and substitution options;
- distinguish strategic substitution from resilience-required substitution;
- define enterprise recovery requirements without designing technical recovery mechanisms;
- reason about continuity tolerance;
- connect criticality and dependency concentration to continuity requirements;
- evaluate whether a fallback is sufficient for the required business outcome;
- distinguish enterprise resilience requirements from production reliability and disaster-recovery implementation.

---

## Prerequisites

Before starting this chapter, you should understand:

- AI capability criticality and dependency mapping from Lesson 01;
- dependency concentration and common dependency exposure;
- enterprise AI governance concepts from ENT-02 and ENT-03;
- enterprise data and platform dependencies from ENT-05 and ENT-06;
- provider and portability strategy from ENT-07;
- AI economics and portfolio decisions from ENT-08.

Lesson 01 should be treated as the immediate prerequisite because this chapter uses its criticality and dependency reasoning to define continuity requirements.

---

## Estimated Reading Time

**35–45 minutes**

---

## Before We Start

Lesson 01 asked:

> **How important is the AI capability, what does it depend on, and where does dependency concentration exist?**

This chapter asks the next question:

> **What must the enterprise be able to do when that capability becomes unavailable, degraded, or unreliable?**

The answer is not necessarily:

> “Keep the AI system fully available.”

Enterprise continuity is broader than AI availability.

A business capability may continue through:

- reduced functionality;
- an alternative AI capability;
- another provider or model;
- manual processing;
- deferred execution;
- an existing non-AI process.

Therefore, the central concern of this chapter is the **required business outcome**, not the availability of a particular technology.

---

## Why This Exists

AI capabilities increasingly participate in business processes that may be:

- customer-facing;
- operationally important;
- time-sensitive;
- financially significant;
- safety-sensitive;
- regulatory;
- shared across multiple business units.

When such a capability becomes unavailable, several questions immediately arise:

- Can the business process continue?
- What level of degradation is acceptable?
- Can another capability perform the required function?
- Is manual processing realistic?
- Can work be delayed?
- How long can the enterprise tolerate the disruption?
- What minimum functionality must remain available?
- What capability must eventually be restored?
- What information state must be available after recovery?

These are **enterprise continuity and recovery questions**.

The technical mechanisms used to answer them belong primarily to production engineering.

---

## Mental Model

Use this mental model throughout the chapter:

```text
Critical AI Capability
        ↓
Disruption / Degradation
        ↓
What business outcome must continue?
        ↓
Required Continuity
        ↓
Choose an acceptable operating mode
        ↓
Reduced / Fallback / Manual / Deferred
        ↓
What capability must eventually be restored?
        ↓
Recovery Requirement
```

The important distinction is:

```text
Availability
    ↓
Is the AI capability usable?

Continuity
    ↓
Can the required business function continue?

Recovery
    ↓
What capability or business state must eventually be restored or achieved?
```

These are related, but they are not interchangeable.

---

# Core Concepts

## 1. Availability vs Continuity

### Availability

Availability asks:

> **Is the AI capability currently usable?**

For example:

```text
Recommendation service
        ↓
Available
```

The service can accept requests and produce results.

### Continuity

Continuity asks:

> **Can the enterprise continue performing the required business function when the preferred AI capability is unavailable or degraded?**

For example:

```text
Recommendation AI unavailable
             ↓
Alternative recommendation process
             ↓
Business can still recommend products
             ↓
Continuity preserved
```

Therefore:

```text
AI Capability Unavailable
        ≠
Business Capability Automatically Unavailable
```

An enterprise can preserve continuity through:

- degraded operation;
- fallback capability;
- manual processing;
- alternative provider or model;
- reduced functionality;
- deferred execution.

The correct choice depends on the business requirement.

---

## 2. Continuity Requirements

A **continuity requirement** defines what the enterprise must still be able to accomplish when the preferred AI capability is unavailable or degraded.

A continuity requirement should describe the required outcome rather than prescribe a technology.

For example:

> Customer support must continue handling urgent customer requests during a disruption of the primary AI-assisted support capability.

This does not yet specify:

- which model to use;
- which provider to use;
- how failover works;
- how traffic is routed;
- how infrastructure is replicated.

Those are implementation decisions.

The continuity requirement establishes the **outcome that the implementation must satisfy**.

---

## 3. Continuity Is Outcome-Oriented

A technology-first approach asks:

> “What backup AI system should we deploy?”

An outcome-first approach asks:

> “What business function must continue, and at what acceptable level?”

This distinction matters because the correct continuity mechanism may not be another AI system.

For example:

```text
Required Business Outcome
        ↓
Process customer requests
        ↓
Possible operating modes
        ├── Primary AI
        ├── Reduced AI capability
        ├── Alternative AI
        ├── Manual processing
        └── Deferred processing
```

The enterprise should select the operating mode based on the required outcome and constraints.

---

# 4. Alternative Operating Modes

An enterprise may define multiple operating modes for a critical AI-enabled capability.

## Full Mode

The AI capability performs its normal function.

```text
Full functionality
Full expected capacity
Normal business process
```

This is the preferred operating state.

---

## Reduced Mode

Only essential functionality remains available.

For example, a customer-support AI may temporarily:

- answer only high-priority questions;
- disable nonessential recommendations;
- process fewer requests;
- use simpler functionality.

The business outcome is preserved at a reduced level.

---

## Fallback Mode

An alternative capability performs the required function.

The alternative could be:

- another AI model;
- another provider;
- another internal capability;
- an existing rules-based system;
- a previously available business process.

The alternative does not have to reproduce the primary implementation exactly.

The question is:

> **Can it preserve the required business outcome at an acceptable level?**

---

## Manual Mode

A human-operated process temporarily replaces the AI capability.

For example:

```text
AI-assisted document review unavailable
              ↓
Human review process activated
              ↓
Business process continues
```

Manual fallback is not automatically sufficient.

It depends on:

- available personnel;
- expected workload;
- required processing speed;
- human expertise;
- regulatory constraints;
- duration of disruption.

---

## Deferred Mode

Work is intentionally delayed when immediate execution is not required.

For example:

```text
AI enrichment unavailable
        ↓
Requests placed into queue
        ↓
Processing resumes later
        ↓
Business outcome completed within tolerance
```

Deferred execution is useful only when the business process can tolerate the delay.

---

# 5. Degraded Operation

A degraded mode is an **intentional operating state in which functionality, capacity, quality, speed, or automation is reduced while an acceptable business outcome is preserved**.

Degradation can involve:

- reduced functionality;
- reduced throughput;
- lower automation;
- longer processing time;
- lower non-critical quality;
- reduced scope;
- increased human involvement.

Degradation is therefore not necessarily failure.

A useful distinction is:

```text
Failure
   ↓
Required business outcome cannot be preserved

Degradation
   ↓
Required business outcome can still be preserved,
but with reduced capability or efficiency
```

The acceptable degree of degradation depends on the continuity requirement.

---

# 6. Minimum Viable AI Capability

**Minimum viable AI capability** is:

> **The minimum AI-enabled functionality or degraded capability required to preserve an acceptable business outcome during disruption.**

It is not:

- a minimum viable product;
- a product-development milestone;
- a minimum model benchmark;
- the smallest possible model;
- the full production feature set.

For example, suppose an AI system normally performs:

- customer classification;
- intent detection;
- response generation;
- sentiment analysis;
- recommendation.

During disruption, the business may determine that only:

```text
Intent Detection
+
Basic Response Routing
```

is necessary to preserve the required customer-support outcome.

That reduced capability may therefore satisfy the minimum viable AI capability requirement.

---

# 7. Fallback Expectations

A fallback expectation defines what the enterprise expects to happen when the preferred operating mode is unavailable.

Possible expectations include:

```text
Primary AI unavailable
        ↓
Reduced mode
```

or:

```text
Primary AI unavailable
        ↓
Alternative AI capability
```

or:

```text
Primary AI unavailable
        ↓
Manual processing
```

or:

```text
Primary AI unavailable
        ↓
Deferred execution
```

There is no universal fallback model.

A fallback is appropriate only when it satisfies the required business outcome within the acceptable continuity tolerance.

---

# 8. AI Capability Substitution

Substitution means using a different capability to preserve the required business outcome when the preferred AI capability is unavailable.

Substitution may involve:

- another model;
- another provider;
- another internal AI capability;
- a non-AI capability;
- manual processing;
- reduced functionality.

The important question is not:

> “Is the replacement technically equivalent?”

The important question is:

> **Can the replacement preserve the required business outcome within acceptable constraints?**

Technical equivalence may be unnecessary if the business only requires a subset of the original capability during disruption.

---

## 9. ENT-07 vs ENT-09 Substitution Boundary

Substitution appears in both ENT-07 and ENT-09, but for different reasons.

### ENT-07 asks:

> **What provider, model, portability, diversification, or strategic substitution approach should the enterprise adopt?**

ENT-07 therefore owns:

- provider strategy;
- model strategy;
- portability;
- diversification;
- vendor dependency;
- strategic substitution;
- strategic exit planning.

### ENT-09 asks:

> **Does the capability require an alternative because of its criticality, dependency concentration, and continuity requirement?**

ENT-09 therefore owns:

- whether substitution is required;
- what continuity outcome the substitute must preserve;
- whether an available alternative is sufficient;
- how dependency concentration affects continuity;
- whether the current fallback posture satisfies resilience requirements.

This distinction prevents continuity analysis from becoming provider strategy.

---

## 10. Business Continuity Implications

AI continuity should be analyzed in terms of the business process that depends on the AI capability.

Consider:

```text
AI Capability
      ↓
Business Process
      ↓
Customer / Employee / Operational Outcome
```

A disruption to the AI capability matters according to the consequence to the downstream business process.

For example:

### Low time sensitivity

An AI system enriches internal records overnight.

If unavailable:

```text
Processing delayed
        ↓
Work resumes later
        ↓
Business outcome preserved
```

Deferred processing may be sufficient.

### High time sensitivity

An AI system supports fraud screening during a transaction.

If unavailable:

```text
Transaction
    ↓
Fraud screening unavailable
    ↓
Business decision required immediately
```

Deferral may not be acceptable.

The enterprise may require:

- reduced screening;
- alternative screening;
- manual review;
- another approved capability.

The correct continuity requirement follows from the business consequence.

---

# 11. Continuity Tolerance

Continuity tolerance describes how much disruption or degradation the business can accept while preserving the required outcome.

It may involve multiple dimensions:

- duration;
- functionality;
- capacity;
- quality;
- latency;
- delay;
- automation level;
- manual workload.

For example:

| Dimension | Normal | Acceptable degraded state |
|---|---|---|
| Functionality | Full | Essential only |
| Capacity | 10,000 requests/min | 3,000 requests/min |
| Automation | Fully automated | Human review for exceptions |
| Delay | Seconds | Several minutes |
| Quality | Normal target | Lower but acceptable threshold |

The important point is that continuity tolerance is **not necessarily a single number**.

A business may tolerate:

- lower throughput but not lower safety;
- longer delay but not loss of critical functionality;
- more manual work but not complete process interruption.

---

## 12. Continuity Requirements and Criticality

Lesson 01 established that criticality describes the importance of an AI-enabled capability and the consequence of its disruption.

Lesson 02 uses that reasoning to determine the required continuity posture.

Conceptually:

```text
Higher Criticality
       ↓
Greater Business Consequence
       ↓
Stronger Continuity Requirement
```

However:

> **High criticality does not automatically mean zero degradation, multi-provider architecture, or immediate full restoration.**

The required response depends on:

- business consequence;
- time sensitivity;
- substitutability;
- available alternatives;
- manual capacity;
- dependency concentration;
- acceptable degradation;
- regulatory or safety constraints.

Criticality informs continuity requirements; it does not dictate one universal architecture.

---

# 13. Continuity vs Recovery

Continuity and recovery are related but distinct.

### Continuity

Continuity asks:

> **How can the required business function continue during disruption?**

Examples:

- reduced mode;
- fallback;
- manual processing;
- deferred processing.

### Recovery

Recovery asks:

> **What capability or business state must eventually be restored or achieved after disruption?**

For example:

```text
Disruption
    ↓
Reduced Mode
    ↓
Fallback
    ↓
Business Continues
    ↓
Required Capability or Business State Restored or Achieved
```

Continuity is therefore primarily concerned with **preserving the business outcome during disruption**.

Recovery is concerned with **restoring or achieving the required capability or business state after disruption**.

---

# 14. Recovery Requirements

A recovery requirement defines the enterprise outcome that must eventually be restored or achieved.

For example:

> The customer-support capability must return to its required operating state within an acceptable period after a prolonged disruption.

This describes:

- what must be restored;
- the required business capability;
- the acceptable restoration expectation.

It does not prescribe:

- backup architecture;
- database replication;
- infrastructure restoration;
- Kubernetes recovery;
- region failover;
- network failover;
- recovery runbooks.

Those mechanisms belong to production engineering.

---

## 15. Recovery Expectations

Recovery expectations may include:

- acceptable disruption duration;
- expected restoration period;
- acceptable degradation period;
- capability that must be restored;
- functionality that must be restored;
- information state that must be available;
- acceptable loss or delay of non-critical work.

These expectations should be derived from business requirements.

For example:

```text
Business Requirement
        ↓
Required capability or business state must be restored or achieved
        ↓
Within acceptable recovery tolerance
        ↓
Technical architecture determines how
```

The technical implementation should satisfy the enterprise requirement rather than define it.

---

# 16. Recovery Requirements vs Technical RTO/RPO Implementation

Terms such as **RTO** and **RPO** are commonly used in disaster-recovery engineering.

At the enterprise level, the important question is not the acronym itself but the required outcome.

For example:

```text
Enterprise Requirement
        ↓
Business capability must resume
within an acceptable period
        ↓
Production Engineering
        ↓
Select technical mechanisms
that satisfy the requirement
```

Similarly, an enterprise may require that certain information remain available after recovery.

That is an **information-state requirement**.

The implementation choices—such as replication, backup, restoration, failover, or database recovery—belong to the relevant production engineering domain.

ENT-09 therefore defines **what recovery outcome is required**, not the technical recovery procedure.

---

# 17. Information State and Recovery Point Expectations

Some AI-enabled business processes depend not only on the AI capability itself but also on the information available to continue operating.

For example:

```text
AI Capability
      +
Required Business Information
      ↓
Business Outcome
```

A recovery requirement may therefore specify that:

- recent transactions must remain available;
- critical case information must be preserved;
- required business state must be recoverable;
- certain non-critical information may be delayed or reconstructed later.

This chapter does not teach how databases achieve those outcomes.

The engineering question here is:

> **What information state must be available for the business capability to resume acceptably?**

Technical implementation remains a production concern.

---

# 18. Example: Customer Support AI

Consider an enterprise using AI to assist customer-support agents.

### Normal state

```text
Customer
   ↓
AI understands request
   ↓
AI generates response suggestion
   ↓
Human agent approves
   ↓
Customer receives response
```

Suppose the AI capability becomes unavailable.

The enterprise evaluates alternatives.

### Reduced mode

AI is unavailable for complex requests but remains available for basic classification.

```text
Basic requests → AI
Complex requests → Human
```

### Manual mode

If AI is completely unavailable:

```text
Customer
   ↓
Human agent
   ↓
Manual handling
```

### Deferred mode

For non-urgent internal requests:

```text
Request
   ↓
Queue
   ↓
Process later
```

### Recovery

The required AI-assisted support capability is eventually restored or an accepted operating state is re-established.

The continuity requirement and recovery requirement are therefore different:

```text
Continuity
→ Customers can continue receiving required support.

Recovery
→ The required AI-assisted support capability or business state returns to the required condition.
```

The correct strategy depends on:

- customer impact;
- support volume;
- acceptable response delay;
- staffing capacity;
- criticality;
- available alternatives.

---

# 19. Example: AI-Assisted Fraud Screening

Consider an AI capability used during financial transactions.

### Normal mode

```text
Transaction
    ↓
AI Fraud Screening
    ↓
Risk Decision
    ↓
Transaction Handling
```

Suppose the AI capability becomes unavailable.

Possible alternatives include:

```text
Alternative AI
```

or:

```text
Rules-Based Screening
```

or:

```text
Manual Review
```

or, if business and regulatory requirements allow:

```text
Deferred Review
```

The appropriate mode depends on the required continuity outcome.

If transactions require immediate screening, deferred processing may be unacceptable.

If a rules-based system has lower detection quality but still satisfies the minimum acceptable requirement, it may be an acceptable fallback.

The important engineering question is:

> **Does the alternative preserve the required business outcome within the defined continuity tolerance?**

---

# 20. When Fallback Is Not Enough

A fallback can exist without being sufficient.

For example:

```text
Primary AI
    ↓
Unavailable
    ↓
Fallback AI
    ↓
Fallback depends on same critical provider
```

The existence of another interface or model does not automatically provide meaningful independence.

Similarly:

```text
Primary AI unavailable
        ↓
Manual processing
        ↓
10× normal workload
        ↓
Insufficient human capacity
```

The manual fallback exists, but it cannot preserve the required business outcome.

Therefore, fallback adequacy must consider the actual continuity requirement.

---

# 21. Fallback Sufficiency

When evaluating a fallback, ask:

### Functional sufficiency

Can it perform the required business function?

### Capacity sufficiency

Can it handle the required workload?

### Availability sufficiency

Can it operate when the preferred capability is unavailable?

### Independence

Does it rely on the same material dependency that caused or could amplify the disruption?

### Quality sufficiency

Is its output quality sufficient for the required business outcome?

### Human feasibility

If human operation is required, can the organization realistically provide it?

### Duration

Can the fallback operate for the expected disruption period?

### Constraints

Does it satisfy applicable business, regulatory, safety, or operational constraints?

These are **reasoning questions**, not a universal fallback scoring formula.

The enterprise should evaluate them in the context of the specific capability.

---

## 22. Continuity Scenario Analysis

A useful enterprise analysis considers several disruption states.

| Scenario | Possible Operating Mode | Key Question |
|---|---|---|
| Normal operation | Full | Is the preferred capability operating normally? |
| Partial degradation | Reduced | What functionality can be reduced safely? |
| Primary dependency unavailable | Fallback | Is an alternative sufficient? |
| Alternative unavailable | Manual / Reduced / Deferred | What business outcome can still be preserved? |
| Non-time-sensitive workload | Deferred | Can work wait without unacceptable consequence? |
| Prolonged disruption | Sustained fallback / Manual / Reduced | Can the alternative remain viable for the required duration? |
| Recovery | Restoration | What capability or state must eventually return? |

This helps prevent a continuity plan from assuming that every disruption has the same response.

---

## 23. Continuity Requirements Should Be Defined Before Disruption

Continuity decisions should not be invented for the first time during an incident.

Before disruption, the enterprise should understand:

- which AI capabilities are critical;
- what business outcomes must continue;
- acceptable degradation;
- acceptable delay;
- available fallback modes;
- manual feasibility;
- required recovery outcomes;
- important dependency constraints.

This allows production systems and operating teams to implement mechanisms against known enterprise requirements.

The principle is:

```text
Define Requirement
        ↓
Design Implementation
        ↓
Operate
        ↓
Test / Review
        ↓
Adjust Requirement or Implementation
```

Lesson 02 defines the continuity and recovery requirements that later resilience governance in Lesson 03 will use.

PROD implements and operates the mechanisms needed to satisfy them.

---

# 24. Enterprise Decision Scenario

Consider an AI capability supporting a critical business workflow.

The enterprise has:

- a primary AI provider;
- a second provider;
- a shared external dependency used by both providers;
- a manual process;
- a reduced-functionality mode;
- a deferred processing queue.

The primary AI capability becomes unavailable.

Do not immediately conclude:

> “Use the second provider.”

Instead reason through the requirement:

```text
Critical Capability
        ↓
What business outcome must continue?
        ↓
How much degradation is acceptable?
        ↓
Can reduced mode preserve the outcome?
        ↓
If not, is the second provider sufficient?
        ↓
Does the second provider share a material dependency?
        ↓
If both AI options fail, is manual processing feasible?
        ↓
Can some work be deferred?
        ↓
What must eventually be restored?
```

The correct decision depends on the continuity requirement.

A second provider may improve substitution, but it does not automatically eliminate dependency concentration.

A manual fallback may provide independence, but it may not have sufficient capacity.

A reduced mode may be preferable if it preserves the essential business outcome at much lower complexity.

The engineering objective is therefore not:

> **maximize redundancy.**

It is:

> **achieve an acceptable continuity and recovery outcome proportional to the capability's criticality and constraints.**

---

# Common Mistakes and Misconceptions

## Mistake 1 — Treating availability as continuity

An unavailable AI capability does not necessarily mean the business process must stop.

---

## Mistake 2 — Assuming fallback means another model

Fallback may be:

- another AI capability;
- a rules-based capability;
- manual processing;
- reduced functionality;
- deferred execution.

---

## Mistake 3 — Assuming manual fallback always works

Manual operation may fail as a continuity strategy if:

- workload is too high;
- qualified personnel are unavailable;
- processing takes too long;
- the process violates constraints;
- disruption lasts too long.

---

## Mistake 4 — Assuming an alternative is automatically independent

Two different models may still depend on:

- the same provider;
- the same platform;
- the same external API;
- the same data source;
- the same organizational capability.

Application-level diversity does not automatically provide enterprise-level dependency independence.

---

## Mistake 5 — Treating high criticality as automatic multi-provider architecture

High criticality should lead to stronger continuity reasoning.

It does not automatically prescribe:

- multiple providers;
- multiple models;
- zero degradation;
- active-active architecture.

Those are architectural decisions that must follow from the continuity requirement.

---

## Mistake 6 — Turning recovery requirements into disaster-recovery implementation

ENT-09 defines:

> **what must eventually be restored or achieved.**

Production engineering defines:

> **how the system detects, fails over, restores, and operates during recovery.**

---

## Mistake 7 — Treating RTO/RPO terminology as the objective

RTO and RPO can describe technical recovery characteristics, but the enterprise requirement comes first.

The real question is:

> **What business capability and information state must be restored within what acceptable tolerance?**

---

## Mistake 8 — Assuming immediate full restoration is always required

Some capabilities can operate in degraded or fallback modes for a period of time.

Recovery requirements should reflect actual business consequence.

---

## Mistake 9 — Designing continuity from technology instead of business outcome

Starting with:

> “Which backup model should we deploy?”

can lead to unnecessary complexity.

Start with:

> “What must the business continue doing?”

---

## Engineering Decisions and Trade-offs

## Should Every Critical AI Capability Have a Fallback?

Not necessarily.

A fallback may be unnecessary when:

- disruption consequence is limited;
- acceptable downtime is high;
- manual processing is sufficient;
- the cost of maintaining a fallback exceeds the benefit.

A fallback becomes more compelling when:

- criticality is high;
- disruption tolerance is low;
- alternatives are limited;
- dependency concentration is material;
- manual processing is impractical.

The decision follows the continuity requirement.

---

## Should the Fallback Be Another AI Capability?

Not automatically.

Another AI capability may introduce:

- another dependency;
- operational complexity;
- inconsistent behavior;
- additional cost;
- new governance requirements.

A simpler reduced mode or manual process may provide better continuity.

---

## Should Full Functionality Be Preserved During Disruption?

Not always.

If the business only requires:

```text
Essential Functionality
```

then preserving:

```text
Non-Essential Functionality
```

may add unnecessary cost and complexity.

The minimum viable AI capability should therefore be defined from the business outcome.

---

## Should Multiple Providers Be Used?

Not automatically.

Multiple providers may reduce some forms of concentration but can introduce:

- higher cost;
- operational complexity;
- different model behavior;
- integration overhead;
- additional governance;
- duplicated capabilities.

Provider diversification is a strategic topic in ENT-07.

ENT-09 determines whether the continuity requirement creates a need for meaningful substitution or independence.

---

## Should Recovery Always Be Immediate?

Not necessarily.

Recovery expectations should reflect:

- criticality;
- business consequence;
- time sensitivity;
- continuity alternatives;
- acceptable degradation;
- cost and complexity.

A capability that can operate safely in degraded mode may have a different recovery requirement from a capability whose business function cannot continue without full restoration.

---

# Production / Enterprise Perspective

ENT-09 defines **enterprise resilience requirements**.

It asks:

```text
What must continue?
        ↓
How much degradation is acceptable?
        ↓
What fallback is sufficient?
        ↓
What must eventually be restored?
```

Production engineering then determines the mechanisms required to satisfy those requirements.

For example:

| Enterprise requirement | Production implementation |
|---|---|
| Continue during provider outage | Routing / fallback mechanism |
| Support reduced mode | Feature or capability controls |
| Handle temporary backlog | Queueing and workload management |
| Preserve acceptable response time | Capacity and traffic controls |
| Restore capability within required tolerance | Recovery mechanisms |
| Preserve required information state | Backup / replication / restoration mechanisms |

The boundary is important:

> **ENT-09 defines the required outcome. PROD defines and operates the technical mechanisms used to achieve it.**

ENT-09 therefore should not become a tutorial on:

- retries;
- timeouts;
- circuit breakers;
- queue implementation;
- replication;
- failover orchestration;
- backup systems;
- Kubernetes recovery;
- incident runbooks.

Those belong to production engineering.

---

# Relationship to Lesson 01

Lesson 01 establishes the enterprise dependency and criticality picture.

```text
Lesson 01
Criticality
    ↓
Dependency Mapping
    ↓
Dependency Concentration
```

Lesson 02 uses that understanding to determine:

```text
Lesson 02
Continuity
    ↓
Degraded Modes
    ↓
Fallback
    ↓
Recovery Requirements
```

The relationship can be summarized as:

> **Lesson 01 asks how important the capability is and where dependency exposure exists. Lesson 02 asks what must continue and what must eventually be restored.**

This creates a deliberate progression rather than repeating the same analysis.

---

# Relationship to Lesson 03

Lesson 02 defines the required continuity and recovery outcomes.

Lesson 03 then asks:

> **How should the enterprise govern resilience and dependency decisions over time?**

The progression is:

```text
FILE 01
Understand Criticality and Dependency Exposure
        ↓
FILE 02
Define Continuity and Recovery Requirements
        ↓
FILE 03
Govern Resilience and Dependency Decisions
```

Lesson 03 will therefore extend this chapter into:

- enterprise resilience strategy;
- dependency governance;
- concentration reduction;
- strategic redundancy;
- resilience trade-offs;
- continuous dependency review.

Lesson 02 should not pre-emptively teach those topics in depth.

---

# Interview Questions

## 1. What is the difference between availability and continuity?

**Expected answer:**

Availability asks whether the AI capability is currently usable.

Continuity asks whether the enterprise can continue performing the required business function when the preferred AI capability is unavailable or degraded.

---

## 2. Why is fallback not synonymous with another AI model?

**Expected answer:**

Because fallback is defined by the required business outcome, not by technology type. A fallback may be another AI capability, a rules-based system, manual processing, reduced functionality, or deferred execution.

---

## 3. What is minimum viable AI capability?

**Expected answer:**

It is the minimum AI-enabled functionality or degraded capability required to preserve an acceptable business outcome during disruption.

---

## 4. Does high AI criticality automatically require multi-provider architecture?

**Expected answer:**

No. High criticality indicates that stronger continuity reasoning may be required, but the actual response depends on business consequence, disruption tolerance, substitutability, dependency concentration, fallback options, cost, and complexity.

---

## 5. Why is a second provider not automatically an independent fallback?

**Expected answer:**

Because both providers may depend on common infrastructure, external services, data sources, platforms, or other shared dependencies. Provider diversity does not automatically eliminate correlated failure.

---

## 6. What does ENT-07 own versus ENT-09 when discussing substitution?

**Expected answer:**

ENT-07 owns strategic provider/model substitution, portability, diversification, vendor dependency, and exit strategy.

ENT-09 determines whether substitution is required by the capability's criticality and continuity requirements and whether the available alternative is sufficient.

---

## 7. What is the difference between continuity and recovery?

**Expected answer:**

Continuity concerns preserving the required business function during disruption through normal or alternative operating modes.

Recovery concerns restoring or achieving the required capability or business state after disruption.

---

## 8. Why should recovery requirements be defined before technical recovery mechanisms?

**Expected answer:**

Because technical mechanisms should satisfy business requirements. Without a defined enterprise recovery outcome, teams may build unnecessary or insufficient recovery mechanisms.

---

## 9. A fallback exists but depends on the same external service as the primary AI. Is continuity guaranteed?

**Expected answer:**

No. The fallback may not provide meaningful independence. The enterprise must understand whether the shared dependency can cause correlated disruption and whether another operating mode is required.

---

## 10. When might deferred processing be an acceptable continuity strategy?

**Expected answer:**

When the business process can tolerate the delay without unacceptable customer, operational, financial, regulatory, or safety consequences.

---

## Enterprise Decision Exercise

You are responsible for an AI capability supporting a high-criticality business process.

The architecture has:

- one primary AI provider;
- one alternative AI provider;
- a shared external dependency;
- a reduced-functionality mode;
- a manual process;
- a deferred processing queue.

The primary AI capability becomes unavailable.

Answer the following:

1. What business outcome must continue?
2. What level of degradation is acceptable?
3. Which operating modes are viable?
4. Is the second provider sufficiently independent?
5. What happens if both AI capabilities become unavailable?
6. Is manual processing feasible for the expected workload?
7. Which work can safely be deferred?
8. What minimum viable AI capability is required?
9. What capability must eventually be restored or achieved?
10. What information state must be available after recovery?
11. Which decisions belong to ENT-09?
12. Which technical implementation decisions belong to PROD?
13. Which provider strategy decisions belong to ENT-07?

Do not start by choosing a technology.

Start with the required business outcome.

---

## Quick Revision

### Availability

> Is the AI capability currently usable?

### Continuity

> Can the business function continue when the preferred AI capability is unavailable or degraded?

### Degraded mode

> Can the business continue with intentionally reduced functionality, capacity, quality, or automation?

### Minimum viable AI capability

> What is the minimum AI-enabled capability required to preserve an acceptable business outcome?

### Fallback

> What alternative operating mode preserves the required business outcome?

### Substitution

> Can another capability perform the required function when the preferred capability is unavailable?

### Recovery

> What capability or business state must eventually be restored or achieved?

### Continuity tolerance

> How much duration, degradation, delay, capacity reduction, or manual effort can the business accept?

### Key boundary

```text
ENT-09
What must continue?
What degradation is acceptable?
What fallback is required?
What must eventually be restored?

        ↓

PROD
How is that behavior implemented,
operated, monitored, and recovered?
```

---

# Key Takeaways

1. **Availability and continuity are different concepts.**
2. **Business continuity is defined by the required business outcome, not by AI availability alone.**
3. **Degraded operation can be an intentional and acceptable resilience state.**
4. **Fallback does not necessarily mean another AI model.**
5. **Minimum viable AI capability defines the minimum functionality needed to preserve an acceptable outcome during disruption.**
6. **High criticality does not automatically require multi-provider architecture or zero degradation.**
7. **Alternative capabilities are not automatically independent.**
8. **Continuity requirements should be defined before disruption.**
9. **Recovery requirements define enterprise outcomes, not technical recovery procedures.**
10. **Technical RTO/RPO, backup, replication, failover, restoration, and recovery runbooks belong to production engineering.**
11. **ENT-07 owns strategic provider/model substitution and portability; ENT-09 owns resilience-required substitution.**
12. **Lesson 02 connects criticality and dependency exposure from Lesson 01 to the resilience governance decisions developed in Lesson 03.**

---

## Further Reading

For deeper study, connect this chapter with:

- **ENT-09 Lesson 01** — AI Criticality, Dependency Mapping and Concentration Risk
- **ENT-09 Lesson 03** — Enterprise AI Resilience and Dependency Governance
- **ENT-07** — Provider strategy, portability, diversification, and vendor dependency
- **PROD** — Technical reliability, runtime failure handling, operational recovery, and production implementation

The purpose of these references is to understand the boundaries between enterprise requirements and implementation mechanisms.

---

## Final Mental Model

The entire chapter can be reduced to one engineering chain:

```text
Critical AI Capability
        ↓
Disruption or Degradation
        ↓
What Business Outcome Must Continue?
        ↓
Continuity Requirement
        ↓
What Operating Mode Is Acceptable?
        ├── Full
        ├── Reduced
        ├── Fallback
        ├── Manual
        └── Deferred
        ↓
Is the Fallback Actually Sufficient?
        ↓
What Must Eventually Be Restored or Achieved?
        ↓
Recovery Requirement
        ↓
Lesson 03
Resilience Strategy and Dependency Governance
        ↓
Production Engineering Implements the Required Mechanisms
```

The central principle is:

> **Enterprise resilience begins by defining what the business must continue and what must eventually be restored or achieved; technology is then selected and engineered to satisfy those requirements.**
