# Context Composition and Information Selection

## 1. Purpose

A model can receive a technically valid request and still produce an unreliable answer because the information supplied to it is incomplete, outdated, irrelevant, contradictory, or poorly suited to the task.

Context engineering therefore involves more than collecting information. It requires deciding **which information should be supplied, why it is needed, how trustworthy it is, and whether it supports the requested decision**.

This chapter develops a systematic approach to composing context and selecting information for a model invocation. It focuses on information quality and selection decisions rather than token-budget optimization, information ordering, retrieval implementation, or context compression, which are covered elsewhere.

### Learning objectives

By the end of this chapter, you should be able to:

- Identify the major categories of information that may contribute to a model's context.
- Distinguish relevant information from merely available information.
- Evaluate candidate information using explicit selection criteria.
- Handle conflicting instructions, evidence, and versions of a source.
- Recognize when the available context does not support a reliable conclusion.
- Design a repeatable context-selection procedure for an application.

## 2. Context Composition as an Engineering Decision

A production application may have access to conversation history, user-provided documents, database records, retrieved passages, tool outputs, business rules, examples, and application metadata. Their availability does not imply that all of them belong in every model invocation.

The composition problem is:

> Given a task and a set of candidate information sources, which information should be supplied to the model so that it can perform the task accurately and appropriately?

This is a selection problem under constraints.

A candidate item may be useful because it establishes a requirement, supplies evidence, resolves ambiguity, provides necessary history, or defines the expected response. Another item may be irrelevant, redundant, outdated, or misleading.

Consider a customer-support application answering a question about a refund. Potential information sources include:

- The customer's current question.
- Relevant messages from the conversation.
- The applicable refund policy.
- The customer's transaction record.
- A general product description.
- An old policy document.
- An unrelated support interaction.
- A tool result describing the transaction's current status.

The application should not include every available item simply because it can. It should select information according to the task, the authority of the sources, and the evidence required to answer.

### 2.1 Availability is not usefulness

Information can be available without contributing to the current task.

For example, a customer's complete account history may contain thousands of records, while a question about one transaction may require only the transaction identifier, transaction date, relevant policy, and current payment status.

Including unrelated records can introduce distractions, competing facts, unnecessary privacy exposure, and additional processing cost.

The engineering objective is not to maximize the amount of supplied information. It is to provide **sufficient, relevant, and trustworthy information for the task**.

### 2.2 Selection is task-dependent

There is no universally correct context composition.

A summarization task may need broad coverage of a document. A policy question may need the applicable policy clauses and the facts needed to apply them. A classification task may need a small set of well-defined features and the classification criteria.

The same information may be essential for one task and unnecessary for another.

Consequently, context selection should begin with the task definition rather than with an unfiltered collection of available data.

## 3. Major Components of Context

A context composition system may draw from several categories of information. These categories describe the information's role; they do not imply that every category must be present in every request.

### 3.1 Instructions

Instructions define how the model should perform the task.

Examples include:

- The role the model is expected to perform.
- The objective it must achieve.
- Constraints on its reasoning or actions.
- Rules for handling uncertainty.
- Requirements to abstain when evidence is insufficient.

Instructions should be relevant to the current task and consistent with the application's intended behavior.

An instruction that applies globally may be supplied through a system-level mechanism, while task-specific instructions may be supplied separately. The exact mechanisms depend on the model interface and application architecture.

### 3.2 User request and task input

The user request communicates what the user wants. Task input supplies the content or data on which the operation should be performed.

Examples include:

- A question about a particular policy.
- A document to summarize.
- A support ticket to classify.
- A code fragment to inspect.
- A structured record to validate.

The request and its input should be distinguished conceptually. The request defines the objective; the input provides material needed to achieve it.

If the task is ambiguous, the application may need to clarify the request or provide additional information before invoking the model.

### 3.3 Conversation history

Previous messages can provide context that the current message does not contain.

For example, a user may say, "Apply the same criteria to the second candidate." Interpreting that request requires knowing which criteria were previously established and which candidate is being referenced.

However, conversation history is not automatically relevant in its entirety. Older messages may refer to completed tasks, abandoned assumptions, or information that no longer applies.

Selection should preserve the history needed to interpret the current request without treating every previous statement as current or authoritative.

Long-conversation state management is covered in Chapter 05.

### 3.4 Retrieved documents and reference material

Reference material supplies evidence or domain-specific information that the model may not reliably infer from the request alone.

Examples include:

- Product documentation.
- Internal policies.
- Technical specifications.
- Contract clauses.
- Approved knowledge-base articles.

The important selection question is whether the material is appropriate for the task and supports the claims that the model must make.

A document's presence in context does not establish that it is current, authoritative, complete, or applicable.

Retrieval pipelines, indexing, candidate generation, and ranking belong to retrieval engineering. This chapter addresses the subsequent question: **is the selected information suitable for the current task?**

### 3.5 Tool results and application data

An application may supply information obtained from databases, APIs, calculators, or other tools.

Examples include:

- A transaction status returned by a payment service.
- A database record containing a customer's subscription tier.
- A calculation result.
- The current inventory count.
- A timestamp associated with a business event.

Tool results can provide task-specific evidence, but their meaning depends on the tool's contract and the conditions under which the result was produced.

An error response, stale cache entry, incomplete query result, or ambiguous status must not be treated as a definitive business fact.

The application should preserve relevant metadata, such as timestamps, identifiers, status indicators, and source information, when these affect interpretation.

### 3.6 Metadata and provenance

Metadata helps interpret the information it accompanies.

Potential metadata includes:

- Source identifier.
- Document version.
- Effective date.
- Retrieval timestamp.
- Record identifier.
- Data owner.
- Applicable customer, product, or region.
- Confidence or validation status, where meaningful.

Metadata is useful only when its semantics are understood. A retrieval timestamp, for example, indicates when a result was retrieved; it does not necessarily indicate when the underlying information was last updated.

Where source identity or applicability affects a decision, omitting the relevant metadata can make otherwise correct information difficult to interpret safely.

### 3.7 Examples and response-format requirements

Examples can demonstrate the expected structure, style, or level of detail of a response. They are useful when the desired behavior is difficult to communicate through a short instruction alone.

However, examples should be representative of the intended task. An example containing an incorrect assumption or an inapplicable rule can encourage the wrong behavior.

Response-format requirements may also be supplied as text, such as "return a JSON object containing these fields." Alternatively, a model interface may support structured-output settings or schema constraints configured separately from the textual context.

These mechanisms should not be conflated. A format requirement expressed in text is part of the supplied instructions; a separately configured interface constraint is an invocation setting. The application should account for both when determining what the model is expected to produce.

## 4. Criteria for Selecting Information

Context selection should use explicit criteria rather than intuition alone. The following criteria provide a practical starting point.

### 4.1 Relevance

Relevance asks whether an item contributes to the current task.

A record may be accurate and authoritative yet irrelevant to the question being answered.

For example, a customer's delivery address is relevant to a shipping question but ordinarily irrelevant to a request to explain a product's warranty terms.

**Selection question:** Does this information help define the task, establish a necessary fact, resolve an ambiguity, or constrain the answer?

### 4.2 Completeness

Completeness asks whether the selected information is sufficient to support the requested result.

A policy excerpt may contain a reimbursement limit but omit the eligibility conditions. A transaction record may contain an amount but omit the transaction date required to determine which policy version applies.

Relevant information is not necessarily sufficient information.

**Selection question:** What facts or conditions must be known before the task can be completed reliably, and which of them are missing?

### 4.3 Freshness

Freshness concerns whether information remains current enough for the task.

Different information has different update requirements. A stable technical definition may remain valid for years, while inventory availability, account status, and active business policies may change frequently.

Freshness should be evaluated against the relevant event and the information's validity period, not simply against the date on which a document was retrieved.

**Selection question:** Could this information have changed since it was created or last validated, and does that change affect the answer?

### 4.4 Authority

Authority concerns whether a source is entitled to establish the relevant rule or fact.

For example, an approved policy may define reimbursement eligibility, while an informal discussion may merely describe how an employee believes the policy works.

Authority is domain-specific. A transaction service may be authoritative for payment status but not for interpreting contractual eligibility. A policy owner may be authoritative for policy interpretation but unable to confirm whether a particular payment has settled.

**Selection question:** Is this source appropriate for establishing this particular fact or rule?

### 4.5 Task alignment

Task alignment concerns whether the information matches the exact operation being performed.

A document about a company's general refund process may be relevant to a question about one product's refund exception, but it may not contain the specific exception required to answer that question.

Similarly, a general technical guide may not apply to a specific software version.

**Selection question:** Does this information apply to the actual entity, version, time period, jurisdiction, product, or scenario in the request?

### 4.6 Reliability and provenance

Reliability and provenance are related but distinct.

- **Reliability** concerns how much confidence the application should place in a source or claim, given its validation, known limitations, and the conditions under which it was produced.
- **Provenance** identifies where the information came from and, where available, how it was obtained, transformed, or validated.

A source may have clear provenance but still be unreliable. For example, an unverified statement can be traced to its original author without becoming accurate.

Conversely, a claim may appear plausible but lack sufficient provenance to establish whether it came from an approved source or an unsupported inference.

**Selection question:** Can the source and its limitations be identified, and is there adequate reason to trust the claim for this task?

### 4.7 Applying the criteria together

These criteria are complementary rather than interchangeable.

| Criterion | Failure if ignored | Example |
|---|---|---|
| Relevance | Irrelevant context distracts from the task | Including unrelated account history |
| Completeness | A required fact or condition is missing | Policy excerpt omits an exception |
| Freshness | Outdated information drives the answer | Applying a superseded policy |
| Authority | An inappropriate source defines the rule | Treating informal advice as approved policy |
| Task alignment | Information applies to a different scenario | Using rules for another product version |
| Reliability and provenance | Unsupported or questionable claims are trusted | Using an unverified record with unclear origin |

Not every task requires the same level of scrutiny for every criterion. A high-impact policy decision may require strong evidence of authority, applicability, and freshness. A low-risk brainstorming task may tolerate more uncertainty.

The appropriate selection standard should reflect the consequences of an incorrect answer.

## 5. Redundancy and Unnecessary Information

Redundancy occurs when multiple context items communicate substantially the same information. It is not inherently harmful, but unnecessary repetition can make the supplied context less efficient and sometimes harder to interpret.

Examples include:

- The same policy paragraph appearing in several retrieved documents.
- A fact repeated in the conversation history and a current structured record.
- Multiple summaries that repeat the same claim without adding evidence.
- Long background descriptions that do not affect the requested decision.

The key question is not whether two items share words. It is whether they contribute distinct information or independent evidence.

Two sources that repeat the same claim may appear to corroborate one another, but if one merely copied the other, they are not independent confirmation.

### 5.1 When repetition is useful

Repetition may be justified when it serves a distinct purpose, such as:

- Restating a critical constraint in a task-specific instruction.
- Preserving a necessary connection between a fact and its source.
- Including an example that demonstrates how a rule should be applied.
- Providing genuinely independent evidence for a consequential claim.

The goal is therefore not to eliminate all repetition. It is to avoid repetition that adds no meaningful information, evidence, or operational clarity.

### 5.2 When information should be omitted

An item is a candidate for omission when it is:

- Unrelated to the requested task.
- Superseded by a verified applicable source.
- A duplicate that adds no useful evidence.
- Outside the relevant entity, version, or time period.
- Unsupported and unnecessary to the decision.
- Unavailable in a form that can be interpreted reliably.

Omission should not be used to hide a genuine conflict or a material limitation. If an unresolved contradiction affects the answer, the application should preserve that uncertainty or seek clarification rather than silently discard inconvenient evidence.

Token-budget optimization and compression strategies are covered in later chapters.

## 6. Handling Conflicting Information

Conflicts occur when two or more context items appear to make incompatible claims or impose incompatible requirements.

A reliable system should not resolve conflicts solely by selecting whichever statement appears last, sounds most confident, or contains the most detail.

First, identify what kind of conflict exists.

### 6.1 Conflicting instructions

Instructions may disagree about the task, constraints, or response requirements.

The application should interpret them according to the applicable instruction hierarchy and the interface's documented behavior. It should not treat ordinary evidence inside a document as an instruction that automatically overrides the application's governing requirements.

If two applicable instructions at the same effective level remain incompatible, the application may need to resolve the ambiguity through explicit precedence rules or request clarification.

### 6.2 Conflicting evidence

Evidence may disagree about a factual claim.

For example, an older policy may specify one reimbursement limit while a newer approved policy specifies another. The conflict cannot be resolved safely until the application establishes which policy applies to the relevant transaction and time period.

Use the following procedure:

1. **Identify the exact disagreement.** Separate the conflicting claims rather than treating the entire sources as incompatible.
2. **Check applicability.** Determine whether each claim applies to the same entity, event, version, region, and period.
3. **Check authority.** Identify which source is authorized to establish the relevant fact or rule.
4. **Check validity and freshness.** Establish effective dates, expiration conditions, and supersession where those facts are available.
5. **Preserve unresolved uncertainty.** If the evidence does not establish which claim governs, do not invent a resolution.
6. **Determine the next action.** Answer with appropriate qualification, retrieve the missing evidence, or ask for clarification.

This procedure is a reasoning aid, not a guarantee that every conflict can be resolved. Some cases require an external business decision or a human authority.

### 6.3 Do not confuse recency with authority

A newer source is not necessarily more authoritative. A recently edited copy of an obsolete policy may be less reliable than an older, formally approved document that remains in force.

Likewise, a source with a later timestamp may describe an earlier event.

Recency is useful only when interpreted alongside source authority, applicability, and validity.

### 6.4 Do not silently repair missing evidence

If the context lacks a necessary fact, the model should not be encouraged to fill the gap with a plausible assumption.

The appropriate response depends on the task. It may be possible to provide a conditional answer, identify the missing fact, or request additional information. In other cases, the system should defer the decision to an authorized process.

The critical engineering principle is that **an unresolved information gap must remain visible when it affects the validity of the result**.

## 7. Worked Example: Selecting Context for a Reimbursement Question

Consider an internal assistant asked:

> Can I reimburse a hotel expense of ₹8,000 for my business trip on 12 March?

The application has access to the following candidate information.

| Candidate item | Available information |
|---|---|
| Current approved travel policy | Version 4; approved on 1 March; effective from 10 March; states that hotel reimbursement is capped at ₹7,000 per night, subject to eligibility conditions |
| Previous travel policy | Version 3; effective until 9 March; states a hotel cap of ₹6,000 per night |
| Employee expense record | Records a hotel expense of ₹8,000 for a one-night stay associated with the trip |
| Trip record | Shows a business trip beginning on 12 March |
| Informal team message | Says that hotel expenses up to ₹10,000 are usually accepted |
| General company profile | Describes the company's business units and office locations |
| Unrelated prior support conversation | Discusses an employee's laptop replacement |

### 7.1 Select information based on the task

The question concerns the reimbursement of a specific hotel expense. The relevant candidates are:

- The current approved policy, because its effective period includes the trip date.
- The previous policy, if needed to understand the version change or verify the effective-date boundary.
- The expense record, because it establishes the reported amount and duration.
- The trip record, because it helps establish the relevant date and business-trip context.

The informal message may be useful as a lead for further investigation, but it does not establish the reimbursement rule. The general company profile and unrelated support conversation do not contribute to the decision and should ordinarily be excluded.

### 7.2 Identify what the selected evidence establishes

The current policy establishes a stated cap of ₹7,000 per night, subject to eligibility conditions. The expense record establishes a reported amount of ₹8,000 for one night. The trip record places the trip within the new policy's effective period.

The older policy is not the governing version for the stated trip date if the supplied effective dates are accurate. The informal message does not override the approved policy.

However, the selected evidence does not establish every condition that may affect reimbursement.

### 7.3 Determine what can and cannot be concluded

The context supports the conclusion that the reported ₹8,000 expense for one night exceeds the stated ₹7,000 per-night cap by ₹1,000.

It does **not** establish whether the employee is eligible for reimbursement, whether an exception applies, whether the cap has additional conditions, or whether the final reimbursable amount is determined by another rule.

A reliable answer should state the cap comparison and identify the unresolved eligibility or exception conditions. It should not claim that reimbursement is definitively approved or denied based only on the supplied information.

### 7.4 Engineering lesson

The example demonstrates three separate decisions:

1. **Selection:** Include the sources needed to answer the question and exclude unrelated information.
2. **Interpretation:** Apply the policy that is relevant to the stated date and distinguish approved policy from informal commentary.
3. **Conclusion:** State only what the evidence supports and make unresolved conditions explicit.

A model cannot compensate reliably for a context-selection process that omits decisive information or supplies conflicting sources without sufficient applicability metadata.

## 8. Operational Context-Selection Checklist

Before constructing a model invocation, answer the following questions.

### Task definition

- What exact question or operation must the model complete?
- What facts, rules, or constraints are necessary to complete it?
- Is the request ambiguous enough to require clarification?

### Candidate information

- Which instructions govern the task?
- Which user inputs and history are necessary?
- Which documents, records, or tool results provide relevant evidence?
- Are source identity, version, timestamp, and applicability available where needed?

### Quality and conflicts

- Is the selected information relevant and sufficiently complete?
- Could any material have become outdated?
- Are the sources authoritative for the claims being made?
- Do any sources conflict, and has the disagreement been resolved or explicitly preserved?
- Is any important conclusion dependent on an unsupported assumption?

### Final selection

- Does every included item serve a clear purpose?
- Have irrelevant records and unhelpful duplication been removed?
- Have important qualifications and unresolved gaps been retained?
- Can the intended answer be supported by the selected information?

If a critical question remains unanswered, the appropriate next step may be to obtain additional evidence rather than proceed with an incomplete context.

## 9. Common Context-Selection Mistakes

### Including everything that is available

More information does not automatically improve an answer. Unrelated records can introduce noise and make the relevant evidence harder to distinguish.

**Better approach:** Require a clear task-related reason for including each material item.

### Treating relevance as proof of sufficiency

A source may be relevant without containing every condition needed to reach a conclusion.

**Better approach:** Identify the facts and conditions necessary for the decision, then check whether the selected evidence covers them.

### Trusting the newest source without checking applicability

A newer timestamp does not establish authority or validity.

**Better approach:** Evaluate effective dates, source authority, scope, and the event to which the information applies.

### Treating duplicated claims as independent confirmation

Several documents may repeat the same underlying statement.

**Better approach:** Trace claims to their origin when the independence of evidence matters.

### Resolving contradictions by intuition

A model may choose the most plausible statement even when the evidence does not justify that choice.

**Better approach:** Apply explicit conflict-resolution rules and preserve unresolved uncertainty.

### Filling information gaps with assumptions

A missing policy condition or transaction attribute can change the correct result.

**Better approach:** Ask for the missing evidence, qualify the answer, or defer the decision when necessary.

### Confusing content requirements with interface configuration

An instruction requesting a particular format is not necessarily equivalent to a separately configured structured-output constraint.

**Better approach:** Inspect both the supplied instructions and the model invocation settings when diagnosing output requirements.

## 10. Summary

Context composition is the deliberate selection of information for a particular model task. The objective is to supply enough relevant and trustworthy evidence to support the requested result without introducing unnecessary information or concealing important uncertainty.

A disciplined selection process:

- Starts with the task and its required evidence.
- Evaluates relevance, completeness, freshness, authority, task alignment, reliability, and provenance.
- Removes unhelpful duplication without discarding meaningful evidence.
- Resolves conflicts using applicability and authority rather than recency alone.
- Preserves unresolved uncertainty when the evidence is insufficient.
- Distinguishes supplied textual requirements from separately configured interface constraints.

Context selection determines **what information is supplied**. Subsequent engineering decisions determine how that information fits within the available context capacity, how it is organized, and how it is maintained across interactions.

## 11. Knowledge Check

Answer these questions in your own words before proceeding.

1. Why can a relevant source still be insufficient to answer a question reliably?
2. Explain the difference between source authority, reliability, and provenance. Give an example where they do not imply one another.
3. Two policy documents disagree, and one has a newer modification timestamp. What evidence would you need before deciding which policy applies?
4. When is repeated information useful, and when can it create a false impression of independent confirmation?
5. In the reimbursement example, which conclusions are supported by the supplied context, and which require additional evidence?
6. Describe a practical procedure for deciding whether a candidate context item should be included, excluded, or retained with an explicit qualification.

A strong answer should justify the selection decision, identify assumptions, and explain what additional information would change the conclusion.

**Next chapter:** `03-Context-Windows-and-Token-Budgeting.md` — understanding context capacity, model- and interface-specific limits, and how to budget input and output tokens.
