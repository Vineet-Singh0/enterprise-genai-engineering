# Context Engineering and Execution Context Management

## Learning Objectives

After completing this chapter, you should be able to:

- Explain what execution context is and why an agent cannot simply expose all available information to every execution step.
- Identify the major sources from which context can be assembled.
- Distinguish available information from candidate information and final execution context.
- Evaluate information using relevance, freshness, authority, provenance, scope, and priority.
- Explain how context ordering and budgeting affect execution quality.
- Reason about information density and context growth.
- Identify problems caused by stale, conflicting, irrelevant, or untrusted information.
- Explain the roles of compaction, summarization, truncation, and omission.
- Design step-specific context and reconstruct context when the active information set changes.
- Identify production failure modes caused by poor context management.
- Evaluate trade-offs such as completeness vs. noise, freshness vs. availability, and compression vs. information loss.
- Distinguish context engineering from prompt engineering, retrieval engineering, memory engineering, and model-specific context mechanics.

---

## Prerequisites

You should already understand:

- The distinction between **state**, **context**, and **memory**.
- State as the current condition of an execution.
- Context as information assembled for a particular execution step.
- Memory as information retained according to an intentional system policy for potential future use.
- The basic idea of an agent execution step.

Recommended prerequisite:

- [AGT-04 — State, Context & Memory](README.md)
- [01-Agent-State-Context-and-Lifecycle.md](01-Agent-State-Context-and-Lifecycle.md)

---

## Estimated Reading Time

**40–50 minutes**

---

## Before We Start

An agent may have access to a large amount of information:

- current user input;
- execution state;
- previous conversation;
- previous observations;
- tool results;
- retrieved information;
- user preferences;
- application data;
- policies and constraints;
- retained information;
- external information.

But having access to information does not mean that all of it belongs in the next execution context.

Consider a customer-support agent handling:

> “I moved recently. Please update my billing address.”

The system may know the customer's:

- current request;
- account information;
- previous conversations;
- billing history;
- previous support tickets;
- preferences;
- current address;
- verification status;
- applicable company policy.

The next execution step may need only a subset of that information.

The central problem of this chapter is therefore:

> **How should an agent decide what information belongs in the context for a particular execution step?**

---

## 1. Why Context Engineering Exists

## 1.1 The Information Availability Problem

Production agents often operate over information that is much larger than what a single execution step requires.

A useful conceptual view is:

```text
Available Information
        │
        ▼
Candidate Information
        │
        ▼
Context Selection
        │
        ▼
Execution Context
        │
        ▼
Execution Step
        │
        ▼
New Information
        │
        ▼
Context Reassessment
```

The important distinction is:

```text
Available Information
        ≠
Candidate Context
        ≠
Final Context
```

Context engineering exists because the system must deliberately decide what crosses the boundary into the active execution context.

---

# 2. Mental Model: Context as an Assembly Pipeline

A useful engineering model is:

```text
                    Available Information
                            │
                            ▼
                   Candidate Information
                            │
                            ▼
                   Relevance Evaluation
                            │
                            ▼
                 Freshness / Authority
                            │
                            ▼
                      Prioritization
                            │
                            ▼
                         Ordering
                            │
                            ▼
                       Budgeting
                            │
                            ▼
                    Context Assembly
                            │
                            ▼
                      Execution Step
                            │
                            ▼
                  New Information / Results
                            │
                            ▼
                    Context Reassessment
```

This is a reasoning model, not necessarily a single software component.

The central principle is:

> **Context selection is conditional on the objective of the current execution step.**

A useful abstraction is:

```text
Context Selection =
    f(
        execution objective,
        candidate information,
        relevance,
        authority,
        freshness,
        scope,
        priority,
        available budget
    )
```

This is not a required production formula. It is a mental model for understanding the decision.

---

# 3. Execution Context

## 3.1 What Is Execution Context?

Execution context is the information assembled and made available for a particular agent execution step.

It may contain:

```text
Task Information
+ Relevant State
+ Applicable Constraints
+ Relevant Prior Information
+ Supporting Evidence
+ Required External Information
```

The composition depends on the execution objective.

For example:

```text
Step A — Understand Request

Context:
- Current request
- Relevant conversation
- Customer identity

Step B — Verify Account

Context:
- Account state
- Verification information
- Relevant verification requirements

Step C — Determine Eligibility

Context:
- Verified account state
- Requested change
- Applicable policy
- Relevant constraints

Step D — Communicate Result

Context:
- Decision
- Relevant reason
- Required response information
```

The information environment may remain largely the same while the execution context changes.

---

# 4. Sources of Context

Context may be assembled from several sources.

## 4.1 Current User Input

The current request is usually an important context source.

Examples include:

- questions;
- commands;
- corrections;
- new requirements;
- new constraints;
- follow-up requests.

Current input must still be interpreted in relation to applicable state, constraints, and authoritative information.

---

## 4.2 Current Execution State

State may provide information such as:

- current task status;
- completed work;
- pending work;
- current entity;
- current decision;
- relevant execution variables.

A context may contain a **projection of state** relevant to the current step rather than the complete state representation.

---

## 4.3 Conversation Information

Previous interaction may provide:

- requirements;
- clarifications;
- decisions;
- unresolved questions;
- constraints.

Conversation history is therefore a possible context source, not context by definition.

Older conversation may be:

- irrelevant;
- superseded;
- contradictory;
- unnecessarily verbose.

---

## 4.4 Tool and System Results

Previous execution steps may produce information required by later steps.

For example:

```text
Step 1
Account lookup
        │
        ▼
Account status
Verification result
Relevant metadata
        │
        ▼
Step 2
Eligibility decision
```

A result is not automatically useful forever. Its value depends on the next execution objective.

Detailed tool contracts and invocation behavior belong to AGT-03.

---

## 4.5 Retrieved Information

Retrieval can produce candidate information:

```text
Query
  ↓
Retrieval
  ↓
Candidate Information
  ↓
Context Selection
  ↓
Execution
```

The retrieval layer determines what information can be found.

Context engineering determines what available candidate information should enter the execution context.

Detailed retrieval algorithms, indexing, ranking, reranking, and retrieval evaluation belong to the Retrieval Engineering domain.

---

## 4.6 Policies and Constraints

Some steps require rules or constraints such as:

- business policies;
- user requirements;
- task constraints;
- system-level instructions;
- operational restrictions.

These may receive high priority because they define what the execution step must or must not do.

---

## 4.7 Retained Information

Information retained for future use may become a context source when relevant.

However:

> **Retained information is a candidate source of context, not automatically active context.**

Memory formation, retention, retrieval, update, and lifecycle belong to:

- [03-Agent-Memory-Retention-Retrieval-and-Lifecycle.md](03-Agent-Memory-Retention-Retrieval-and-Lifecycle.md)

---

# 5. Candidate Information vs. Final Context

The selection process can be viewed as:

```text
Available Information
        ↓
Potentially Relevant Information
        ↓
Candidate Information
        ↓
Prioritized Information
        ↓
Budget-Constrained Selection
        ↓
Final Execution Context
```

Suppose a system has:

```text
1,000 available records
        ↓
100 potentially relevant
        ↓
30 useful candidates
        ↓
12 within budget
        ↓
8 final context items
```

The reduction is not necessarily a failure.

It may be the correct result of context engineering.

---

# 6. Relevance

## 6.1 Task-Dependent Relevance

Information is relevant when it materially helps the current execution objective.

For an address-change decision:

```text
Highly relevant:
- Current address
- Requested address
- Verification status
- Applicable policy

Potentially irrelevant:
- Old shipping issue
- Marketing preference
- Unrelated support ticket
```

Relevance is therefore contextual.

The same information can be relevant for one step and irrelevant for another.

---

## 6.2 Relevance Is Not Recency

The newest information is not automatically the most relevant.

For example:

```text
Old:
Customer is on Enterprise Plan.

New:
Customer viewed a pricing page.
```

The newer event may be irrelevant to a billing-policy decision.

---

## 6.3 Relevance Is Not Importance

Globally important information may still be locally irrelevant.

For example, a company-wide policy may be important but irrelevant to a task that does not depend on it.

Context engineering evaluates **local usefulness for the current execution objective**.

---

# 7. Freshness, Authority, and Provenance

Relevance alone is insufficient.

An information item may be relevant but stale, unreliable, or outside the authority required for the decision.

A useful evaluation model is:

```text
Information
    │
    ├── What does it say?
    ├── Where did it come from?
    ├── When was it produced or updated?
    ├── What scope does it apply to?
    └── How authoritative is the source?
```

## 7.1 Freshness

Information can become stale.

```text
09:00 — Account status: ACTIVE
09:15 — Account suspended
09:20 — Eligibility check
```

Using the 09:00 status may produce an incorrect decision.

Freshness requirements depend on the information and task.

For example:

| Information | Typical Freshness Sensitivity |
|---|---|
| Current inventory | Very high |
| Current account status | High |
| Current incident state | Very high |
| User preference | Medium |
| Historical company information | Low |
| Static documentation | Usually low, but version-sensitive |

---

## 7.2 Authority

When two sources disagree, authority matters.

```text
Source A:
Address = Mumbai

Source B:
Address = Bengaluru
```

The system should not blindly treat both as equivalent.

It should consider:

- source authority;
- scope;
- timestamp;
- specificity;
- applicability.

---

## 7.3 Provenance

Provenance records where information came from and helps preserve its meaning.

For example:

```text
Authoritative system record
        vs.
User statement
        vs.
Historical observation
        vs.
External information
```

Provenance does not automatically make information correct.

It provides the information needed to reason about its authority and applicability.

---

# 8. Prioritization

When multiple useful information items compete for limited context capacity, they must be prioritized.

A conceptual priority model may consider:

```text
Relevance
+ Authority
+ Freshness
+ Task Criticality
+ Specificity
```

This is a reasoning framework, not a universal scoring formula.

---

## 8.1 Hard Constraints and Supporting Information

A useful classification is:

### Hard constraints

Information that defines what the step must or must not do.

Examples:

- explicit user constraints;
- applicable policy;
- required business rules.

### Supporting information

Information that helps the step reason.

Examples:

- historical observations;
- supporting evidence;
- related records.

### Optional information

Information that may improve understanding but is not required.

This classification becomes useful when the context budget is constrained.

---

# 9. Ordering

Selection is only part of context engineering.

Information may also need deliberate ordering.

A useful structure is:

```text
1. Execution objective
2. Important constraints
3. Current state
4. Relevant evidence
5. Supporting background
6. Historical information
```

Ordering is not merely formatting.

It helps establish the information hierarchy needed by the execution step.

A useful principle is:

> **Present information so that the execution objective, constraints, current condition, and supporting evidence are easy to distinguish.**

---

# 10. Context Budgets and Information Density

## 10.1 Why Context Budgets Exist

Context is subject to practical limits.

These may include:

- available execution-context capacity;
- model context limits;
- latency;
- cost;
- application limits;
- system-specific budgets.

The goal is not:

> Fill the available context.

The goal is:

> **Use the available budget for the information with the highest expected value to the execution step.**

Model-specific context-window mechanics belong to the LLM domain.

---

## 10.2 Information Density

Consider two contexts:

```text
Context A

Current task
Relevant constraints
Three authoritative facts
One decisive observation
```

```text
Context B

Long conversation history
Repeated facts
Irrelevant background
Obsolete observations
```

They may consume similar space.

Context A has higher information density.

Therefore:

> **Useful context is not necessarily the largest context.**

---

# 11. Context Growth

Context naturally grows as execution produces new information.

```text
Step 1
User request

    ↓

Step 2
+ Tool result

    ↓

Step 3
+ New observation

    ↓

Step 4
+ Additional evidence

    ↓

Step 5
+ Historical information
```

Naively carrying everything forward can produce:

- repeated information;
- stale information;
- conflicting information;
- declining information density;
- increasing cost and latency.

Therefore:

> **Context should evolve, not merely accumulate.**

---

# 12. Stale Context

Stale context contains information that was once useful but no longer accurately represents the relevant situation.

Example:

```text
Context:
Order status = PROCESSING
```

Later:

```text
Order status = SHIPPED
```

The old value may remain useful as historical information, but it should not be treated as the current status.

Possible responses include:

- refresh;
- replace;
- mark as historical;
- remove from active context;
- retain only when history is relevant.

The correct response depends on the execution objective.

---

# 13. Conflicting Context

Conflicting information does not always mean one source is simply wrong.

Example:

```text
Long-lived preference:
User prefers vegetarian meals.

Current request:
User wants a chicken dish today.
```

These statements have different scopes.

The current request may control the current task without changing the long-lived preference.

Conflict resolution should therefore consider:

- authority;
- scope;
- recency;
- specificity;
- applicability.

If the system cannot safely resolve a conflict, it should preserve the uncertainty rather than silently inventing a resolution.

---

# 14. Irrelevant Context

Irrelevant context does not materially help the current execution step.

Example:

```text
Current task:
Diagnose payment failure.

Potentially irrelevant:
- old shipping issue;
- unrelated support ticket;
- marketing preference;
- unrelated product history.
```

Including irrelevant information increases noise and can make important information harder to distinguish.

---

# 15. Untrusted or Contaminated Information

Context may contain information that should not automatically be treated as authoritative.

Examples include:

- unverified external information;
- stale observations;
- user claims requiring verification;
- malformed intermediate data;
- information from an unexpected source;
- instructions embedded inside data that were not intended to control the execution.

At the context-management level, the question is:

> **What is this information, where did it come from, and what authority should it have in this execution?**

The broader security and safety consequences of malicious or adversarial information belong to AGT-11.

AGT-04 focuses on preserving information boundaries and preventing untrusted information from being treated as authoritative merely because it entered the context.

---

## 16. Context Reduction

Context reduction is necessary when the active information set becomes too large or contains low-value material.

Several techniques exist.

## 16.1 Compaction

Compaction reduces representation size while attempting to preserve information required for future execution.

Example:

```text
Original:
A detailed history repeatedly explaining that production
deployments must occur outside business hours.

Compacted:
Production deployment window: 22:00–02:00.
Avoid production changes during business hours.
```

The goal is not simply shorter text.

It is preserving the information needed by the target execution step.

---

## 16.2 Summarization

Summarization is semantic reduction.

For example:

```text
Original:
30 observations describing an incident.

Summary:
Incident began after deployment and affects checkout.
```

The summary may be sufficient for a communication step but insufficient for detailed diagnosis.

Therefore:

> **Summarization is appropriate only when the information lost is not required by the target execution objective.**

---

## 16.3 Truncation

Truncation removes information according to a mechanical boundary.

Examples:

```text
Keep newest 20 conversation turns.
```

or:

```text
Keep the first N characters.
```

Truncation is simple but can remove critical information without understanding its semantic importance.

---

## 16.4 Omission

Omission is the deliberate decision not to include an information item in the current context.

For example:

```text
Current task:
Determine whether a refund is permitted.

Include:
- purchase date
- refund policy
- refund amount
- order status

Omit:
- unrelated shipping discussion
- old marketing preference
- unrelated conversation
```

Omission is therefore a core context-engineering operation.

---

# 17. Context Reconstruction

Context does not always need to be carried forward unchanged.

It may be reconstructed from authoritative information sources:

```text
Persistent / Available Sources
        │
        ├── Current State
        ├── Relevant History
        ├── Required Evidence
        ├── Applicable Constraints
        └── Retained Information
                 │
                 ▼
          Context Reconstruction
                 │
                 ▼
          Step-Specific Context
```

Reconstruction is useful when:

- the previous context is too large;
- information has changed;
- a new step has different requirements;
- execution resumes after interruption;
- context has been compacted;
- only a subset of prior information remains relevant.

The key principle is:

> **A production agent should be able to rebuild the context required for a step instead of assuming the previous context must remain intact.**

---

# 18. Step-Specific Context in Practice

Consider a coding agent investigating a production bug.

### Step 1 — Understand the bug

```text
Issue description
Observed error
Affected component
Relevant recent changes
```

### Step 2 — Identify likely cause

```text
Error details
Relevant code
Recent changes
Relevant logs
System behavior
```

### Step 3 — Design a fix

```text
Root-cause hypothesis
Relevant code
Constraints
Expected behavior
Tests
```

### Step 4 — Validate

```text
Implemented change
Relevant tests
Observed results
Expected behavior
```

The information environment overlaps, but the context requirements differ.

The execution objective determines the context.

---

# 19. Integrated Example: Customer Support Agent

Consider:

> “I moved recently. Please update my billing address.”

The system may have:

```text
Current request
Current account state
Previous conversation
Customer preferences
Previous support tickets
Billing history
Verification result
Address records
Company policy
```

### Step 1 — Understand Request

```text
Current request
Relevant conversation
Customer identity
```

### Step 2 — Verify Identity

```text
Account identifier
Required verification information
Current verification state
```

### Step 3 — Determine Whether Change Is Allowed

```text
Verified account state
Requested address
Applicable policy
Relevant account constraints
```

### Step 4 — Confirm the Update

```text
Approved change
Updated address
Relevant confirmation information
```

The entire customer history was not carried into every step.

Context was assembled according to the purpose of each step.

---

# 20. Production Perspective

Production context management must account for more than selection logic.

## Correctness

Does the context accurately represent the information required by the step?

## Freshness

Is the information current enough for the decision?

## Relevance

Does it materially contribute to the execution objective?

## Authority

Which source should take precedence when information conflicts?

## Provenance

Can engineers identify where important information came from?

## Scope

Does the information apply to this user, task, entity, and execution?

## Budget

Does the selected context fit operational constraints?

## Observability

Can engineers understand why information entered or was excluded?

## Reproducibility

Can the system reconstruct the context that influenced an important decision?

These concerns become especially important when debugging incorrect agent behavior.

---

## 21. Context Observability

When an agent behaves incorrectly, one of the first questions should be:

> **What information was actually present in the execution context when the decision was made?**

Useful observability may include:

```text
Execution ID
Step ID
Context sources
Selected information
Excluded information
Selection rationale
Source provenance
Information version
Context size
Compaction events
Truncation events
Reconstruction events
```

The implementation varies by system.

The engineering requirement is:

> **Important agent decisions should be explainable in terms of the execution context that was actually available.**

---

# 22. Information Versions vs. Context Snapshots

These concepts should not be confused.

### Information version

The underlying information changed.

```text
Order status v1
    = PROCESSING

Order status v2
    = SHIPPED
```

### Context snapshot

A particular execution step used a particular collection of information.

```text
Execution E42
    ↓
Step S3
    ↓
Context Snapshot C7
```

A production system may need both.

Information versioning helps determine **which version of a fact was available**.

Context snapshots help determine **what collection of information the execution actually used**.

This distinction is particularly useful during debugging and incident analysis.

---

# 23. Context Boundaries

Context should have clear boundaries.

### User boundary

Information belonging to one user should not accidentally become context for another.

### Task boundary

Information from one task should not automatically become relevant to another.

### Execution boundary

Temporary information from one execution should not automatically become active context for unrelated executions.

### Source boundary

Information should retain enough provenance to distinguish authoritative records from observations or external information.

### Semantic boundary

Historical information should not automatically be interpreted as current information.

These boundaries reduce accidental information mixing.

---

## 24. Context Engineering and Neighboring Disciplines

## 24.1 Context Engineering vs. Prompt Engineering

Prompt engineering primarily concerns how instructions and information are expressed.

Context engineering concerns the broader information lifecycle:

```text
What information?
Why include it?
What should be excluded?
What has priority?
How should it be ordered?
What can be compressed?
What must remain fresh?
How should context be reconstructed?
```

Prompt engineering can therefore be part of context engineering, but context engineering is broader.

---

## 24.2 Context Engineering vs. Memory Engineering

Context asks:

> **What information is needed now?**

Memory asks:

> **What information should be retained for potential future use?**

A memory may later become a context source.

It does not automatically become active context.

Detailed memory lifecycle belongs to:

- [03-Agent-Memory-Retention-Retrieval-and-Lifecycle.md](03-Agent-Memory-Retention-Retrieval-and-Lifecycle.md)

---

## 24.3 Context Engineering vs. Retrieval Engineering

A simplified relationship is:

```text
Information Corpus
        ↓
Retrieval System
        ↓
Candidate Information
        ↓
Context Engineering
        ↓
Selected Context
        ↓
Execution
```

Retrieval engineering focuses on finding and ranking information.

Context engineering focuses on deciding what information should actually enter the execution context and how it should be assembled.

Therefore:

> **Retrieved information is candidate context, not automatically final context.**

---

## 24.4 Context Engineering vs. LLM Internals

Context engineering determines what information the execution step should receive.

LLM engineering owns model-specific concerns such as:

- tokenization;
- model context-window behavior;
- inference mechanics;
- model-specific prompt behavior.

AGT-04 should reason about context at the **agent-system information-management level**, without re-teaching those model internals.

---

# 25. Engineering Trade-offs

## 25.1 Completeness vs. Noise

Too little context can omit critical information.

Too much context can introduce noise, conflicts, cost, and lower information density.

The objective is:

> **Sufficient completeness with controlled noise.**

---

## 25.2 Freshness vs. Availability

Fresh information may require additional work to obtain.

Older information may already be available.

The correct freshness requirement depends on the task.

---

## 25.3 Compression vs. Information Loss

Compression reduces context size but may remove information needed later.

Therefore compression should be evaluated against the target execution objective.

---

## 25.4 Historical Context vs. Current Context

Historical information can explain what happened.

Current information describes the current situation.

Both may be useful, but they must not be semantically confused.

---

## 25.5 Automatic Selection vs. Explicit Rules

Context selection may use:

- deterministic rules;
- heuristics;
- scoring;
- structured policies;
- model-assisted selection;
- combinations of these.

Explicit rules are predictable but may be rigid.

Adaptive selection can be flexible but may be harder to reason about.

Production systems may combine deterministic constraints with adaptive selection.

---

## 26. Common Mistakes and Misconceptions

## Mistake 1 — “More context is always better.”

False.

More context can introduce noise, stale information, contradictions, and unnecessary cost.

---

## Mistake 2 — “Context means the entire conversation history.”

False.

Conversation history is only one possible context source.

---

## Mistake 3 — “If information is relevant, it must be included.”

Not necessarily.

Relevant information still competes for limited context capacity.

---

## Mistake 4 — “Newest information is always correct.”

False.

Freshness does not automatically establish authority or applicability.

---

## Mistake 5 — “Summarization always solves context growth.”

False.

Summarization can remove information required by a later execution step.

---

## Mistake 6 — “Truncation is context engineering.”

Only partially.

Truncation is one mechanical reduction technique. Context engineering includes the broader selection and lifecycle decisions.

---

## Mistake 7 — “Retrieved information should automatically enter context.”

False.

Retrieved information is candidate information and still requires selection.

---

## Mistake 8 — “Memory and context are the same thing.”

False.

Memory concerns retained information. Context concerns information assembled for the current execution step.

---

## Mistake 9 — “Context engineering is just prompt engineering.”

False.

Prompt engineering concerns expression. Context engineering also concerns information selection, exclusion, prioritization, freshness, budgeting, and reconstruction.

---

## Mistake 10 — “Context should remain unchanged throughout execution.”

Usually false.

New information appears and the relevance of existing information changes as execution progresses.

---

## 27. Interview Questions with Expected Answers

## Foundational

### 1. What is execution context?

**Expected answer:**

Execution context is the information assembled and made available for a particular agent execution step. It is step-specific and may contain selected state, relevant history, constraints, evidence, tool results, retrieved information, and other applicable information.

---

### 2. Why should an agent not simply include everything available?

**Expected answer:**

Because availability does not imply relevance. Excess information can increase noise, stale information, conflicts, cost, and context size while reducing information density.

---

### 3. Is conversation history the same as context?

**Expected answer:**

No. Conversation history is one possible context source. Context is the subset of information assembled for the current execution step.

---

## Engineering

### 4. How would you decide whether an information item belongs in context?

**Expected answer:**

Evaluate its relevance to the execution objective, authority, freshness, scope, provenance, priority, and cost relative to the context budget. Also consider the consequences of excluding it.

---

### 5. Why is ordering part of context engineering?

**Expected answer:**

Because information should be presented in a structure that makes the objective, constraints, current condition, and supporting evidence easy to distinguish.

---

### 6. What is the difference between truncation and summarization?

**Expected answer:**

Truncation removes information according to a mechanical boundary. Summarization attempts to preserve important meaning while reducing representation size. Summarization is more semantic but can still lose information.

---

### 7. When would omission be preferable to summarization?

**Expected answer:**

When the information is not required for the current execution objective. If it contributes no meaningful value, excluding it avoids unnecessary context.

---

## Scenario

### 8. Your system has 100 relevant documents but only a small context budget. What would you do?

**Expected answer:**

Treat the documents as candidates. Prioritize them according to task relevance, authority, freshness, specificity, and expected usefulness, then select a subset within the context budget. Retrieval-system ranking remains a separate concern.

---

### 9. Two context items contradict each other. What should the system do?

**Expected answer:**

Evaluate provenance, authority, freshness, scope, specificity, and applicability. Prefer the authoritative and applicable information where the conflict can be resolved. Otherwise preserve the uncertainty instead of silently inventing a resolution.

---

### 10. An agent becomes less reliable as a conversation grows longer. What would you investigate?

**Expected answer:**

Context growth, repeated information, stale information, conflicting information, irrelevant history, declining information density, poor summarization, truncation boundaries, and whether context is being reconstructed according to the current objective.

---

## Architecture

### 11. Design a context-management approach for an agent with current state, conversation history, retrieved documents, tool results, and long-lived user information.

**Expected answer:**

Treat all sources as candidates rather than automatically including everything.

The system should:

1. Identify the current execution objective.
2. Gather relevant candidates.
3. Evaluate relevance, authority, freshness, scope, and provenance.
4. Prioritize information.
5. Resolve or preserve conflicts.
6. Apply the context budget.
7. Assemble information in a deliberate order.
8. Execute the step.
9. Reassess context when new information appears.

Long-lived information should remain under the memory lifecycle rather than becoming permanently active context.

---

## Debugging

### 12. The stored data is correct, but the agent made an incorrect decision. What context question should you ask first?

**Expected answer:**

> **What information was actually present in the execution context when the decision was made?**

Correct information stored somewhere in the system is not useful if it was omitted, stale, incorrectly prioritized, misordered, or contradicted within the active context.

---

## Engineering Judgment

### 13. Would you prefer a smaller context with highly relevant information or a larger context containing everything potentially relevant?

**Expected answer:**

Usually the smaller, higher-density context, provided critical information is preserved. The objective is not minimum size by itself; it is maximum useful information within the operational constraints of the execution step.

---

## 28. Quick Revision

Remember:

```text
Available Information
        ↓
Candidate Information
        ↓
Relevance
        ↓
Freshness + Authority + Scope
        ↓
Prioritization
        ↓
Ordering
        ↓
Budget
        ↓
Context Assembly
        ↓
Execution
        ↓
New Information
        ↓
Reassessment
```

### Core principles

1. Context is assembled, not simply accumulated.
2. Context is specific to an execution objective.
3. Available information is not automatically context.
4. Relevance is task-dependent.
5. Freshness and authority are different concerns.
6. Provenance preserves information origin and meaning.
7. Context budgets require prioritization.
8. More context is not automatically better.
9. Context should evolve as execution progresses.
10. Compaction can reduce size while risking information loss.
11. Truncation is mechanical and can remove critical information.
12. Omission is a deliberate engineering decision.
13. Retrieved information is candidate context, not automatically final context.
14. Memory can provide context but is not the same thing as context.
15. Context should be reconstructable when the active information set changes.
16. Context selection should always be evaluated against the current execution objective.

---

# 29. Key Takeaways

Context engineering is the discipline of deciding **what information should be available to an agent for a particular execution step and how that information should be assembled and managed**.

A useful model is:

```text
Context =
    Relevant
  + Appropriate
  + Fresh Enough
  + Authoritative Enough
  + Properly Scoped
  + Properly Ordered
  + Within Budget
  + Suitable for the Current Objective
```

A mature agent system does not primarily ask:

> “How do I put more information into the model?”

It asks:

> **“What information does this execution step actually need, and what is the best way to provide it?”**

Context is therefore dynamic:

```text
Information
    ↓
Candidate
    ↓
Selected
    ↓
Active Context
    ↓
Updated
    ↓
Reassessed
    ↓
Reconstructed / Reduced / Replaced
```

The important engineering shift is from treating context as a static prompt to treating it as an **engineered information boundary around an execution step**.

---

# 30. Further Reading

Within AGT-04:

- [AGT-04 README](README.md) — Chapter scope, structure, and ownership.
- [01-Agent-State-Context-and-Lifecycle.md](01-Agent-State-Context-and-Lifecycle.md) — Foundational distinction between state, context, and memory.
- [03-Agent-Memory-Retention-Retrieval-and-Lifecycle.md](03-Agent-Memory-Retention-Retrieval-and-Lifecycle.md) — Memory formation, retention, retrieval, staleness, and lifecycle.

Related domains:

- **AGT-02 — Runtime & Execution** — Runtime loops, execution steps, continuation, termination, and bounded autonomy.
- **AGT-03 — Tool Engineering** — Tool contracts, invocation, results, and tool-related execution boundaries.
- **RET — Retrieval Engineering** — Retrieval-system design, indexing, ranking, reranking, and retrieval evaluation.
- **LLM — LLM Engineering** — Model interaction, tokenization, prompting, and model-specific context mechanics.
- **AGT-11 — Reliability, Safety & Recovery** — Broader agent safety, security, recovery, containment, and adversarial-information concerns.

---

## Completion Check

Before considering this chapter complete, you should be able to explain:

- Why context is not the same as available information.
- Why context must be specific to an execution objective.
- How candidate information becomes final context.
- How relevance, freshness, authority, provenance, and scope affect selection.
- Why prioritization and ordering matter.
- Why context budgets require information-density thinking.
- How stale, conflicting, irrelevant, or untrusted information can degrade context quality.
- When compaction, summarization, truncation, and omission are appropriate.
- Why context should evolve and sometimes be reconstructed.
- How context engineering differs from prompt engineering, retrieval engineering, memory engineering, and LLM internals.
- How you would debug an agent whose decision was wrong because of poor context.

If you can reason through these questions using concrete production scenarios, you have moved beyond viewing context as simply “information given to the model” and toward understanding **context as an engineered execution boundary**.
