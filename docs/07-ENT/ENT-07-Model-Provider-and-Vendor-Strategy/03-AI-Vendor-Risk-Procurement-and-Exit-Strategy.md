# ENT-07 — AI Vendor Risk, Procurement and Exit Strategy

## Learning Objectives

By the end of this chapter, you should be able to:

- explain why AI vendor risk differs from generic supplier risk
- identify the major dimensions of AI-specific vendor risk
- evaluate provider risk from strategic and enterprise perspectives
- explain how procurement decisions can create or reduce AI dependency
- identify contractual dependencies that can affect technical and strategic flexibility
- distinguish technical portability from commercial and contractual feasibility
- explain why exit planning should begin before an exit becomes necessary
- distinguish exit triggers from exit criteria
- identify practical conditions for provider substitution or strategic exit
- distinguish strategic exit planning from technical migration execution
- reason about provider failure, product changes, pricing changes, and strategic misalignment
- connect vendor risk, procurement, portability, and exit readiness into one strategic decision model

---

## Prerequisites

You should be familiar with:

- enterprise AI model and provider selection
- strategic fit and provider dependency from [File 01 — Enterprise Model and Provider Selection Strategy](./01-Enterprise-Model-and-Provider-Selection-Strategy.md)
- portability, diversification, provider concentration, and vendor lock-in from [File 02 — Provider Diversification, Portability and Vendor Lock-In](./02-Provider-Diversification-Portability-and-Vendor-Lock-In.md)
- basic enterprise architecture and supplier dependency concepts

This chapter does not require knowledge of contract law, procurement operations, or technical migration implementation.

---

## Estimated Reading Time

**40–50 minutes**

---

## Before We Start

Imagine an enterprise has selected an AI provider.

The provider satisfies the current requirements.

The applications are working.

The teams are productive.

The architecture has been integrated.

The relationship appears successful.

Then something changes.

Perhaps:

- the provider changes its pricing structure
- a required model is discontinued
- data-handling terms change
- the provider changes strategic direction
- a critical capability is no longer available
- geographic availability changes
- the provider is acquired
- regulatory conditions change
- the provider becomes strategically unsuitable
- concentration becomes unacceptable
- service or support conditions materially change

The enterprise now has to answer a difficult question:

> **Can we continue depending on this provider, or do we need to reduce, substitute, or exit the dependency?**

This question is different from:

> “Can we technically connect another provider?”

Technical portability is only one part of the answer.

The enterprise must also consider:

- vendor risk
- procurement conditions
- contractual dependencies
- substitution feasibility
- business impact
- strategic exposure
- exit readiness

That is the focus of this chapter.

---

## Why This Exists

AI providers are not simply interchangeable software suppliers.

An AI provider may influence:

- model capabilities
- application behavior
- data handling
- service availability
- geographic availability
- operational dependencies
- pricing conditions
- product direction
- ecosystem dependencies
- enterprise contracts

This creates a distinctive form of vendor dependency.

A provider can remain technically capable while becoming strategically unsuitable.

Conversely, a provider can introduce a material enterprise risk without immediately causing a technical failure.

For example:

```text
Provider Change
      ↓
Does the enterprise depend on the affected capability?
      ↓
Does the change affect required outcomes or enterprise requirements?
      ↓
Does it increase strategic exposure or reduce suitability?
      ↓
Vendor-Risk Significance
```

This distinction matters because a provider change is not automatically an enterprise risk.

The risk becomes significant when the change interacts with enterprise dependency, requirements, or strategic exposure.

The enterprise therefore needs a strategy for answering:

> **When should we continue, reduce, substitute, or exit a provider relationship?**

---

# Mental Model

A useful mental model connects four areas:

```text
Vendor Risk
     +
Procurement / Commercial Conditions
     +
Technical and Strategic Dependency
     +
Exit Readiness
     ↓
AI Provider Strategy
```

These areas reinforce one another.

A provider may be technically portable but commercially difficult to leave.

A contract may provide useful flexibility while the application remains technically difficult to substitute.

A provider may be low-risk today but become strategically risky because of concentration or product direction.

Therefore:

> **Exit readiness is the result of multiple forms of dependency being understood before an exit is required.**

---

# Core Concepts

## AI Vendor Risk

AI vendor risk is the risk that a provider relationship creates unacceptable strategic, technical, commercial, operational, or enterprise exposure.

This chapter focuses specifically on AI-related vendor risk.

It does not attempt to teach generic supplier-risk management.

A useful distinction is:

```text
Provider Change
      ↓
Enterprise Dependency
      ↓
Requirement Impact
      ↓
Strategic Exposure
      ↓
Vendor-Risk Significance
```

A provider can make a change without creating meaningful enterprise risk.

The significance depends on how that change interacts with the enterprise's requirements and dependency.

---

## AI Vendor Risk Dimensions

Important dimensions include:

```text
Provider Viability
        +
Strategic Alignment
        +
Provider Concentration
        +
Contractual Exposure
        +
Service / Pricing Changes
        +
Capability Discontinuation
        +
Data-Handling Changes
        +
Geographic / Regulatory Exposure
        +
Support Changes
        +
Acquisition / Ownership Changes
        +
Ecosystem Changes
        +
Provider Failure
        ↓
AI Vendor Risk
```

These risks may appear independently or reinforce one another.

---

# Provider Viability

## What Is Provider Viability?

Provider viability concerns whether the provider is likely to remain capable of supporting the enterprise's required capabilities and relationship.

Questions may include:

- Is the provider continuing to support required capabilities?
- Is the provider maintaining relevant service capabilities?
- Is the provider's product direction sufficiently stable for the enterprise's needs?
- Is the provider reducing or discontinuing relevant capabilities?
- Is the provider's ecosystem changing materially?
- Is the provider's ownership changing?

The goal is not to predict the future perfectly.

The goal is to identify dependencies whose future uncertainty could materially affect enterprise strategy.

---

## Provider Viability vs Strategic Alignment

These concepts are related but different.

### Provider Viability

Asks:

> **Can the provider continue supporting the enterprise's required capabilities and relationship?**

### Strategic Alignment

Asks:

> **Is the provider's direction compatible with the enterprise's current and expected requirements?**

A provider can be viable but strategically misaligned.

For example:

```text
Provider
   ↓
Continues operating successfully
   ↓
Required current service remains available
   ↓
Provider strategy moves elsewhere
   ↓
Future enterprise requirements no longer fit
```

Conversely, a provider may remain strategically aligned while its future ability to support a required capability becomes uncertain.

Keeping these concepts separate improves vendor-risk reasoning.

---

# Strategic Alignment

A provider may satisfy current technical requirements while becoming strategically misaligned.

For example:

```text
Current Requirements
        ↓
Provider Satisfies Requirements
        ↓
Provider Strategy Changes
        ↓
Future Requirements No Longer Fit
```

Strategic misalignment can arise from:

- changing product direction
- reduced support for required capabilities
- incompatible enterprise strategy
- changes in geographic availability
- changes in data-handling approach
- ecosystem changes
- acquisition or ownership changes

This is important because:

> **Vendor suitability is not permanent.**

A provider decision should therefore be treated as something that may require reassessment.

---

# Provider Concentration as Vendor Risk

File 02 established provider concentration as a dependency strategy.

Here, the focus is different.

The question is:

> **What vendor-risk exposure results from the concentration?**

For example:

```text
High Provider Concentration
        ↓
High Enterprise Dependency
        ↓
Provider Change
        ↓
Large Strategic Impact
```

Concentration does not automatically mean that the provider is unsuitable.

But it can increase the impact of:

- pricing changes
- capability discontinuation
- contractual changes
- strategic misalignment
- provider failure
- geographic restrictions

Therefore, concentration should be considered when evaluating vendor risk.

Detailed enterprise criticality and resilience consequences belong to ENT-09.

---

# Service and Pricing Changes

Providers may change:

- service offerings
- pricing structures
- usage conditions
- product packaging
- model availability
- service limits
- support structures

Such changes can affect enterprise strategy even when the provider remains operational.

For example:

```text
Provider Change
      ↓
Enterprise Requirement
      ↓
Requirement No Longer Met
      ↓
Strategic Reassessment
```

The relevant ENT-07 question is:

> **Does the change materially alter provider suitability, dependency exposure, or substitution feasibility?**

Detailed cost modeling, FinOps, economic optimization, and portfolio-level financial analysis belong to ENT-08.

---

# Capability Discontinuation

An enterprise may depend on a specific capability.

If that capability is discontinued, the issue is not merely technical.

It becomes a strategic provider decision.

The enterprise should ask:

- Is an equivalent capability available elsewhere?
- Can the required business outcome still be achieved?
- How difficult would substitution be?
- What dependencies would be affected?
- Is the capability strategically important?
- Is continued dependency still justified?

This connects vendor risk with the substitution model introduced in File 02.

---

## Data-Handling Changes

Changes in provider data-handling conditions can materially affect enterprise suitability.

Examples include changes involving:

- data usage
- retention
- deletion
- location
- processing conditions
- service boundaries

The enterprise should determine whether the changed conditions remain compatible with its requirements.

Detailed information governance and classification belong to ENT-05.

In ENT-07, the concern is:

> **Does the provider's data-handling position create a strategic vendor dependency or make the provider unsuitable?**

---

## Geographic and Regulatory Exposure

Provider availability or operating conditions may change by geography.

Potential issues include:

- regional availability changes
- changes in processing locations
- regulatory restrictions
- enterprise geographic requirements
- changes affecting service access

The strategic question is:

> **Can the provider continue satisfying the enterprise's geographic and regulatory requirements?**

This chapter does not determine regulatory compliance or provide legal interpretation. It evaluates how relevant geographic or regulatory conditions may affect provider suitability, dependency, and substitution strategy.

Detailed security/privacy governance belongs to ENT-04, and information governance belongs to ENT-05.

---

## Support and Ecosystem Changes

Provider dependency may extend beyond the core model or API.

The enterprise may depend on:

- support capabilities
- partner ecosystem
- integration ecosystem
- tooling
- documentation
- operational capabilities

Changes in these areas can increase substitution difficulty.

A provider may therefore become less suitable without the underlying model becoming technically worse.

---

## Acquisition and Ownership Changes

A provider's ownership can change.

An acquisition may affect:

- strategic direction
- product priorities
- support
- geographic strategy
- data-handling conditions
- ecosystem relationships
- enterprise commitments

The enterprise does not need to assume that every acquisition is negative.

Instead:

> **Ownership change should trigger strategic reassessment when it could materially alter provider suitability or dependency exposure.**

---

## Provider Failure

Provider failure is a particularly important vendor-risk scenario.

However, ENT-07 should distinguish two questions.

### ENT-07 Question

> **What strategic options exist if the provider becomes unsuitable or unavailable?**

### ENT-09 Question

> **What continuity, criticality, resilience, and recovery requirements apply if the dependency fails?**

Therefore, this chapter focuses on:

- dependency visibility
- alternative providers
- substitution feasibility
- exit readiness
- decision criteria

It does not define detailed:

- failover mechanisms
- disaster recovery procedures
- degraded modes
- incident response
- recovery engineering

---

## Provider Procurement Strategy

## Why Procurement Matters to AI Architecture

Procurement is sometimes treated as a separate business activity.

For AI systems, that separation can be misleading.

Provider procurement conditions can influence:

- technical flexibility
- substitution options
- dependency exposure
- data handling
- service commitments
- exit feasibility

Therefore:

> **Procurement decisions can create or reduce technical and strategic flexibility.**

This chapter does not teach procurement operations.

It teaches the strategic implications of procurement decisions for AI provider dependency.

---

## Procurement Considerations

When evaluating an AI provider relationship, enterprises may need to consider:

- service commitments
- pricing structure
- usage constraints
- data handling
- retention and deletion
- geography
- service-level commitments where relevant
- substitution rights
- termination conditions
- exportability
- notice periods
- product-change obligations
- dependency transparency
- support commitments

The purpose is not to create a generic procurement checklist.

The purpose is to identify conditions that could materially affect:

> **dependency, portability, substitution, and exit.**

Detailed procurement operations and legal interpretation remain outside the scope of this chapter.

---

## Contractual Dependencies Affecting Flexibility

A provider relationship can contain contractual dependencies that affect the enterprise's strategic flexibility.

Consider:

```text
Technical Dependency
        ↕
Commercial Dependency
        ↕
Contractual Dependency
        ↓
Strategic Exit Difficulty
```

These dependencies interact.

An application may be technically portable but difficult to leave because of commercial or contractual conditions.

Conversely, a contract may provide favorable termination or export conditions while the application remains technically difficult to substitute.

Therefore:

> **Technical portability does not automatically mean commercial exit is easy.**

---

# Contractual Conditions That Can Affect Exit

Relevant areas may include:

- termination conditions
- notice periods
- data exportability
- data deletion requirements
- service commitments
- product-change obligations
- usage restrictions
- substitution rights
- support commitments
- geographic conditions

The enterprise should identify which conditions could constrain strategic flexibility.

This is not legal advice.

Contract interpretation and contract drafting belong to qualified legal and procurement professionals.

ENT-07 focuses on the **engineering and strategic implications** of those conditions.

---

## Service Obligations

Service obligations can influence provider dependency.

For example, an enterprise may require:

- defined support expectations
- service commitments
- notification of significant changes
- appropriate transition conditions
- clarity around product changes

The strategic question is not whether every provider must offer identical terms.

It is:

> **Which provider obligations are important enough to protect the enterprise's strategic flexibility?**

---

## Procurement and Portability

Procurement should be connected to the portability analysis from File 02.

Consider:

```text
Technical Portability
        +
Data Portability
        +
Operational Portability
        +
Commercial / Contractual Flexibility
        ↓
Practical Exit Readiness
```

A technically portable architecture can still have poor exit readiness if commercial or contractual conditions create major constraints.

Likewise, favorable contractual conditions cannot compensate completely for deep technical lock-in.

Exit readiness therefore requires both dimensions to be understood.

---

# Exit Strategy

## What Is an Exit Strategy?

An exit strategy defines how an enterprise would decide whether to leave a provider and what strategic conditions would need to be satisfied before doing so.

It is not a technical migration runbook.

An exit strategy answers questions such as:

- Why might we leave?
- What would trigger reassessment?
- Who decides?
- What alternatives exist?
- What evidence do we need?
- What dependencies must be addressed?
- What contractual conditions matter?
- What business impact would substitution create?
- What timeframe would be acceptable?

The strategy should exist **before** an exit becomes urgent.

---

## Why Exit Planning Must Happen Early

Consider:

```text
Provider Becomes Risky
        ↓
Enterprise Starts Thinking About Alternatives
        ↓
No Alternative Evaluated
        ↓
No Portability Evidence
        ↓
No Dependency Map
        ↓
Contract Constraints Discovered
        ↓
Exit Becomes Difficult
```

This is reactive exit planning.

A stronger approach is:

```text
Provider Selection
        ↓
Dependency Identification
        ↓
Portability Assessment
        ↓
Alternative Identification
        ↓
Exit Conditions
        ↓
Periodic Reassessment
```

Exit planning does not mean the enterprise expects to leave.

It means the enterprise understands what would be required if circumstances changed.

---

# Exit Triggers vs Exit Criteria

These concepts should not be treated as the same thing.

### Exit Trigger

A **trigger** is an event or change that causes the enterprise to reassess the provider relationship.

Examples:

- provider announces capability discontinuation
- contractual terms materially change
- provider strategy changes
- geographic availability changes
- concentration becomes unacceptable

### Exit Criterion

A **criterion** is a condition used to determine whether continued dependency is acceptable or whether substitution/exit is justified.

Examples:

- required capability can no longer be satisfied
- provider risk exceeds the enterprise's acceptable threshold
- an alternative can satisfy required outcomes
- substitution is technically and commercially feasible
- contractual conditions permit the required transition
- business impact remains acceptable

The distinction can be summarized as:

```text
Trigger
→ Starts Reassessment

Criterion
→ Supports the Decision
```

A trigger therefore does not automatically mean “exit.”

---

# Exit Triggers

Potential exit or substitution triggers include:

- unacceptable provider risk
- material service degradation
- strategic misalignment
- significant pricing changes
- contractual changes
- product discontinuation
- acquisition or ownership change
- regulatory changes
- geographic constraints
- loss of required capability
- unacceptable provider concentration
- inability to satisfy enterprise requirements

Not every trigger should automatically cause an exit.

A trigger should initiate **strategic reassessment**.

---

## Strategic Exit Criteria

An enterprise should define what would make continued dependency unacceptable.

For example:

```text
Current Provider
      ↓
Requirement Reassessment
      ↓
Risk / Dependency Evaluation
      ↓
Alternative Evaluation
      ↓
Exit Criteria
      ↓
Continue / Reduce / Substitute / Exit
```

Exit criteria may consider:

- required capability
- provider suitability
- strategic alignment
- dependency exposure
- concentration
- substitution feasibility
- portability evidence
- contractual feasibility
- business impact
- acceptable transition timeframe

This creates a decision framework rather than an automatic exit rule.

---

# Substitution Conditions

Before substituting a provider, the enterprise should establish whether the alternative is actually viable.

A useful model is:

```text
Current Provider
        ↓
Required Capability
        ↓
Alternative Provider / Model
        ↓
Compatibility Assessment
        ↓
Evaluation
        ↓
Substitution Constraints
        ↓
Business Impact
        ↓
Substitution Decision
```

Here, **substitution constraints** means the factors that affect whether substitution is feasible, such as application dependencies, portability limitations, organizational readiness, contractual conditions, and other material barriers.

This is not a detailed migration procedure.

It is a strategic substitution assessment.

---

# What Evidence Should Exist?

Exit readiness should be based on evidence rather than assumptions.

Useful evidence may include:

- documented dependencies
- evaluated alternative models/providers
- portability assessments
- application compatibility evidence
- data portability understanding
- operational portability assessment
- organizational readiness
- contractual feasibility
- known substitution barriers
- estimated business impact
- acceptable transition assumptions

The stronger the evidence, the less the enterprise has to rely on emergency assumptions during a provider change.

---

## Exit Readiness Model

A useful model is:

```text
Exit Trigger
      ↓
Decision Authority
      ↓
Alternative Identified
      ↓
Portability Evidence
      ↓
Contractual Feasibility
      ↓
Technical Feasibility
      ↓
Business Impact
      ↓
Transition Decision
```

This model should not be interpreted as a mandatory workflow.

It is a reasoning framework for assessing whether an enterprise is prepared to make a provider substitution or exit decision.

---

# Practical Enterprise Example

## Scenario

An enterprise depends heavily on one AI provider.

The provider announces a major change to a capability used by several important applications.

The change does not immediately break the applications.

However, the enterprise determines that:

- the capability will no longer satisfy future requirements
- provider concentration is already high
- an alternative provider exists
- application portability is moderate
- some provider-specific features are deeply embedded
- the current contract contains relevant notice conditions
- the business impact of substitution is significant

The enterprise must decide what to do.

---

## Step 1 — Identify the Trigger

```text
Capability Change
        ↓
Future Requirement No Longer Satisfied
        ↓
Strategic Reassessment
```

The trigger does not automatically mean “exit.”

It means the current provider strategy must be reassessed.

---

## Step 2 — Evaluate Dependency

The enterprise examines:

```text
Model Dependency
Provider Dependency
Application Dependency
Data Dependency
Operational Dependency
Organizational Dependency
Contractual Dependency
```

This connects the assessment to File 02.

---

## Step 3 — Evaluate the Alternative

The enterprise asks:

- Can the alternative satisfy the required capability?
- Can required application outcomes be preserved?
- What substitution barriers exist?
- What evidence supports compatibility?
- What operational changes would be required?
- What contractual conditions affect the decision?

---

## Step 4 — Evaluate Business Impact

The enterprise considers:

```text
Capability Impact
+
Application Impact
+
Operational Impact
+
Organizational Impact
+
Commercial / Contractual Impact
        ↓
Overall Substitution Impact
```

Detailed financial modeling belongs to ENT-08.

Detailed migration implementation belongs outside ENT-07.

---

## Step 5 — Make the Strategic Decision

The enterprise may choose:

```text
Continue
    OR
Reduce Dependency
    OR
Diversify
    OR
Substitute
    OR
Exit
```

The decision depends on evidence and strategic requirements.

The key outcome is not simply “leave the provider.”

The key outcome is:

> **Make the provider decision deliberately rather than being forced into it by an unmanaged dependency.**

---

# Vendor Failure Scenarios

Vendor-risk scenarios are useful because they show how the strategic decision model applies to different types of provider change.

## Scenario 1 — Model or Capability Discontinuation

```text
Required Capability Changes
      ↓
Future Requirement Impact
      ↓
Alternative Capability
      ↓
Substitution Assessment
```

The enterprise determines whether an alternative can preserve the required outcome and whether the resulting dependency remains acceptable.

---

## Scenario 2 — Material Commercial Change

```text
Pricing / Commercial Change
      ↓
Enterprise Requirement Reassessment
      ↓
Provider Suitability
      ↓
Continue / Reduce / Diversify / Substitute
```

Detailed financial modeling belongs to ENT-08.

---

## Scenario 3 — Data-Term Change

```text
Data-Handling Change
      ↓
Enterprise Requirement Reassessment
      ↓
Provider Suitability
      ↓
Continue / Substitute / Exit
```

The detailed information-governance implications belong to ENT-05.

---

## Scenario 4 — Strategic Misalignment

```text
Provider Direction
      ↓
Enterprise Strategy
      ↓
Growing Misalignment
      ↓
Future Suitability Declines
```

The provider may still operate correctly.

The issue is strategic fit.

---

## Scenario 5 — Acquisition or Ownership Change

```text
Ownership Change
      ↓
Strategic Reassessment
      ↓
Provider Risk / Suitability
      ↓
Continue / Reduce / Substitute / Exit
```

The enterprise should evaluate the actual consequences rather than assuming the outcome.

---

## Scenario 6 — Provider Unavailability or Failure

```text
Provider Becomes Unavailable
        ↓
Dependency Becomes Material
        ↓
Alternative Capability
        ↓
Substitution Feasibility
        ↓
Strategic Decision
```

ENT-07 focuses on strategic substitution.

Detailed continuity and recovery engineering belongs to ENT-09.

---

# Engineering Decisions and Trade-offs

## Trade-off 1 — Contract Flexibility vs Provider Commitment

Stronger provider commitments may provide enterprise value.

However, greater commitment can sometimes reduce flexibility.

The enterprise should therefore evaluate:

```text
Provider Commitment
        +
Enterprise Benefit
        +
Exit Constraint
        ↓
Net Strategic Value
```

The objective is not maximum contractual flexibility.

It is appropriate flexibility for the dependency being created.

---

## Trade-off 2 — Provider Specialization vs Exit Flexibility

A provider may offer specialized capabilities that materially improve an AI workload.

Using those capabilities can increase dependency.

The enterprise should ask:

> **Is the capability value high enough to justify the additional substitution dependency?**

This connects directly to File 01 and File 02.

---

## Trade-off 3 — Short-Term Convenience vs Long-Term Dependency

A provider may offer an easy path today.

That can be valuable.

But convenience can accumulate dependency.

```text
Short-Term Convenience
        ↓
Provider-Specific Adoption
        ↓
Growing Dependency
        ↓
Reduced Future Flexibility
```

The correct response is not to reject convenience.

It is to understand the dependency being accepted.

---

## Trade-off 4 — Exit Readiness vs Engineering Investment

Maintaining alternatives, portability evidence, and transferable knowledge requires effort.

If the dependency has low strategic importance, extensive exit preparation may not be justified.

If the dependency has high strategic exposure, insufficient exit readiness may create unacceptable future constraints.

---

## Trade-off 5 — Contractual Flexibility vs Commercial Value

A provider may offer better commercial conditions in exchange for stronger commitment.

The enterprise should evaluate whether those conditions create dependency that could materially constrain future substitution.

This is a strategic trade-off, not a legal judgment.

---

# Common Mistakes and Misconceptions

## Mistake 1 — “Vendor Risk Means the Provider Might Go Down”

**Why it fails:**

Vendor risk includes strategic, commercial, contractual, capability, geographic, ownership, data-handling, and ecosystem changes.

**Better approach:**

Evaluate the broader AI-specific dependency.

---

## Mistake 2 — “A Good Provider Today Will Always Be a Good Provider”

**Why it fails:**

Provider strategy, capabilities, contracts, products, geography, and enterprise requirements can change.

**Better approach:**

Treat provider selection as subject to reassessment.

---

## Mistake 3 — “Procurement Is Separate From Architecture”

**Why it fails:**

Contractual and commercial conditions can affect technical flexibility, substitution, data handling, and exit.

**Better approach:**

Consider procurement implications during provider strategy.

---

## Mistake 4 — “A Portable Architecture Means We Can Exit Easily”

**Why it fails:**

Technical portability may coexist with commercial, contractual, organizational, or business constraints.

**Better approach:**

Evaluate technical and contractual feasibility together.

---

## Mistake 5 — “Exit Planning Means We Expect the Provider to Fail”

**Why it fails:**

Exit planning is a strategic preparedness mechanism.

It does not imply that an exit is expected.

**Better approach:**

Define potential triggers and substitution conditions before they become urgent.

---

## Mistake 6 — “Contract Flexibility Eliminates Technical Lock-In”

**Why it fails:**

A favorable contract cannot remove application, model, data, operational, or organizational dependencies.

**Better approach:**

Evaluate technical and contractual dependency independently and together.

---

## Mistake 7 — “Every Vendor Risk Requires Immediate Exit”

**Why it fails:**

A risk or trigger should initiate reassessment.

The correct outcome may be to continue, reduce dependency, diversify, substitute, or exit.

**Better approach:**

Use evidence-based strategic decision criteria.

---

## Mistake 8 — “Exit Strategy Means Writing a Migration Runbook”

**Why it fails:**

Migration execution is an implementation concern.

ENT-07 owns strategic exit conditions, substitution readiness, dependencies, and decision criteria.

**Better approach:**

Define what would justify exit and whether substitution is strategically feasible.

---

## Mistake 9 — “Pricing Is Only a Finance Concern”

**Why it fails:**

Pricing changes can affect provider suitability and strategic dependency.

**Better approach:**

Treat pricing as a provider-strategy and vendor-risk input while leaving detailed economics and FinOps analysis to ENT-08.

---

## Mistake 10 — “Provider Failure Automatically Means Disaster Recovery”

**Why it fails:**

Provider failure may require strategic substitution analysis, while detailed continuity and recovery engineering belong to ENT-09 and production engineering domains.

**Better approach:**

Keep the strategic vendor decision in ENT-07 and the resilience implementation in the appropriate domains.

---

## Interview Questions with Expected Answers

## 1. What makes AI vendor risk different from generic supplier risk?

**Expected answer:**

AI providers can directly influence model behavior, application capabilities, data handling, interfaces, operational tooling, ecosystem dependencies, and substitution difficulty. Their strategic role can therefore extend deeply into the enterprise AI architecture.

---

## 2. What are major dimensions of AI vendor risk?

**Expected answer:**

Provider viability, strategic alignment, concentration, contractual exposure, service and pricing changes, capability discontinuation, data-handling changes, geographic/regulatory exposure, support changes, acquisition or ownership changes, ecosystem changes, and provider failure.

---

## 3. What is the difference between provider viability and strategic alignment?

**Expected answer:**

Provider viability asks whether the provider can continue supporting the enterprise's required capabilities and relationship. Strategic alignment asks whether the provider's direction remains compatible with the enterprise's current and expected requirements. A provider can be viable but strategically misaligned.

---

## 4. Why should procurement be considered part of AI provider strategy?

**Expected answer:**

Procurement and contractual conditions can affect data handling, service commitments, termination, exportability, notice periods, substitution rights, and other factors that influence technical and strategic flexibility.

---

## 5. Can a technically portable system still be difficult to exit?

**Expected answer:**

Yes. Commercial or contractual constraints, organizational readiness, business impact, provider-specific data conditions, or other dependencies may make practical exit difficult even when technical portability is relatively good.

---

## 6. Can a strong contract eliminate vendor lock-in?

**Expected answer:**

No. Contractual flexibility can reduce some commercial constraints, but it cannot eliminate model, application, data, operational, or organizational dependencies.

---

## 7. What is the difference between an exit trigger and an exit criterion?

**Expected answer:**

An exit trigger is an event or change that initiates reassessment. An exit criterion is a condition used to determine whether continued dependency is acceptable or whether substitution or exit is justified.

---

## 8. Why is exit planning important before an exit is required?

**Expected answer:**

Because the enterprise needs time to identify alternatives, understand dependencies, establish portability evidence, evaluate contractual feasibility, and understand business impact. Waiting until the provider becomes urgently unsuitable can expose the enterprise to unmanaged dependency.

---

## 9. Does an exit trigger automatically mean the enterprise should leave?

**Expected answer:**

No. A trigger should initiate strategic reassessment. The result may be continued use, dependency reduction, diversification, substitution, or exit.

---

## 10. What evidence should an enterprise maintain for exit readiness?

**Expected answer:**

Dependency maps, evaluated alternatives, portability assessments, compatibility evidence, data and operational portability understanding, organizational readiness, contractual feasibility, substitution barriers, and business-impact assumptions.

---

## 11. What are examples of strategic exit triggers?

**Expected answer:**

Unacceptable provider risk, strategic misalignment, significant pricing or contractual changes, product discontinuation, acquisition, regulatory or geographic changes, loss of required capability, unacceptable concentration, or inability to satisfy enterprise requirements.

---

## 12. Why is provider viability different from current provider performance?

**Expected answer:**

A provider can perform well today while its future capabilities, strategic direction, ownership, ecosystem, or enterprise suitability becomes uncertain.

---

## 13. How should an enterprise evaluate provider concentration as vendor risk?

**Expected answer:**

It should examine how much enterprise capability depends on the provider, what changes could materially affect that dependency, what strategic exposure results, and whether alternatives or diversification options are justified.

---

## 14. How would you respond if a provider announced discontinuation of a required capability?

**Expected answer:**

I would treat it as a strategic reassessment trigger. I would identify the required capability, evaluate alternatives, assess model/provider/application/data/operational dependencies, examine contractual conditions, evaluate business impact, and then decide whether to continue, reduce dependency, diversify, substitute, or exit.

---

## 15. What is the relationship between procurement and portability?

**Expected answer:**

Technical portability may enable substitution, but procurement and contractual conditions can constrain when or how substitution can occur. Practical exit readiness therefore requires both technical and commercial feasibility.

---

## 16. What is the difference between exit strategy and migration planning?

**Expected answer:**

Exit strategy defines why and when the enterprise would leave, what alternatives exist, what dependencies and conditions matter, and whether substitution is feasible. Migration planning defines the detailed technical implementation of moving systems.

---

## 17. How would you evaluate an acquisition of an AI provider?

**Expected answer:**

I would assess whether the ownership change could materially affect strategic alignment, capabilities, support, data handling, geography, ecosystem, contracts, or substitution options rather than assuming the acquisition is automatically positive or negative.

---

## 18. What is the boundary between ENT-07 and ENT-09 when a provider fails?

**Expected answer:**

ENT-07 evaluates provider dependency, substitution options, exit readiness, and strategic decision criteria. ENT-09 handles criticality, continuity, degraded modes, resilience, and recovery consequences.

---

## Quick Revision

## AI Vendor Risk

```text
Provider Viability
+
Strategic Alignment
+
Concentration
+
Contractual Exposure
+
Service / Pricing Changes
+
Capability Changes
+
Data-Handling Changes
+
Geographic / Regulatory Exposure
+
Support / Ecosystem Changes
+
Ownership Changes
+
Provider Failure
↓
AI Vendor Risk
```

## Procurement Strategy

```text
Service Conditions
+
Data Conditions
+
Geography
+
Support
+
Substitution / Termination Conditions
+
Exportability
+
Notice Periods
+
Product-Change Conditions
↓
Strategic Flexibility
```

## Contractual Dependency

```text
Technical Dependency
        ↕
Commercial Dependency
        ↕
Contractual Dependency
        ↓
Strategic Exit Difficulty
```

## Exit Trigger vs Exit Criterion

```text
Trigger
→ Starts Reassessment

Criterion
→ Supports the Decision
```

## Exit Readiness

```text
Exit Trigger
    ↓
Decision Authority
    ↓
Alternative Identified
    ↓
Portability Evidence
    ↓
Contractual Feasibility
    ↓
Technical Feasibility
    ↓
Business Impact
    ↓
Transition Decision
```

## Strategic Outcomes

```text
Continue
   OR
Reduce Dependency
   OR
Diversify
   OR
Substitute
   OR
Exit
```

---

# Key Takeaways

1. **AI vendor risk is broader than generic supplier risk.**
2. **A provider change becomes strategically significant when it interacts with enterprise dependency, requirements, or exposure.**
3. **Provider viability asks whether the provider can continue supporting required capabilities; strategic alignment asks whether its direction remains compatible with enterprise requirements.**
4. **A provider can remain operational while becoming strategically unsuitable.**
5. **Provider concentration can amplify vendor-risk exposure.**
6. **Procurement decisions can influence technical and strategic flexibility.**
7. **Contractual conditions can affect substitution and exit even when technical portability is strong.**
8. **Technical portability does not automatically mean commercial exit is easy.**
9. **Contractual flexibility does not eliminate technical lock-in.**
10. **AI vendor risk includes capability discontinuation, data-handling changes, geographic changes, ownership changes, ecosystem changes, and strategic misalignment.**
11. **An exit trigger initiates reassessment; an exit criterion helps determine the appropriate decision.**
12. **Exit planning should exist before an exit becomes urgent.**
13. **A trigger does not automatically require exit.**
14. **Substitution should be evaluated against required capabilities, portability evidence, dependencies, contractual feasibility, and business impact.**
15. **Exit strategy is not the same as a technical migration runbook.**
16. **Detailed financial modeling and FinOps belong to ENT-08.**
17. **Detailed information governance belongs to ENT-05.**
18. **Security and privacy governance belong to ENT-04.**
19. **Criticality, continuity, resilience, degraded modes, and recovery belong to ENT-09.**
20. **The objective is not to eliminate every provider dependency.**
21. **The objective is to ensure that important provider dependencies are understood, strategically justified, and replaceable when required.**

---

## Further Reading

For the ENT-07 progression:

- [ENT-07 README](./README.md)
- [01 — Enterprise Model and Provider Selection Strategy](./01-Enterprise-Model-and-Provider-Selection-Strategy.md)
- [02 — Provider Diversification and Vendor Lock-In](./02-Provider-Diversification-Portability-and-Vendor-Lock-In.md)

For adjacent enterprise context:

- ENT-04 — AI Security, Privacy and Access Governance
- ENT-05 — AI Data Governance and Information Management
- ENT-06 — Enterprise Integration and Platform Architecture
- ENT-08 — AI Economics, FinOps and Portfolio Governance
- ENT-09 — AI Criticality, Resilience and Dependency Governance

> **File 01 answers: “Which model/provider should we strategically choose?”**
>
> **File 02 answers: “How do we manage the dependency and lock-in created by that choice?”**
>
> **File 03 answers: “How do we manage vendor risk and preserve substitution or exit options?”**
