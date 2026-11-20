# 03 — Factuality, Hallucination, and Grounding

## 1. Learning Objectives

By the end of this chapter, you should be able to:

- Distinguish factual correctness, evidential support, grounding, and attribution.
- Explain what hallucination means in an LLM application and why fluent output can contain unsupported claims.
- Identify common hallucination patterns in knowledge-intensive and enterprise workflows.
- Distinguish claims supported by supplied context from claims supported by external evidence or general model knowledge.
- Explain why retrieval, citations, and tool usage do not automatically guarantee factual correctness.
- Design practical verification workflows for consequential factual claims.
- Determine when an application should answer, qualify its answer, retrieve more evidence, ask for clarification, or abstain.

## 2. Prerequisites

Recommended background:

| Topic | Relevant knowledge |
|---|---|
| LLM-02 — Training and Learned Behavior | How training influences the information and patterns reflected in model outputs |
| LLM-04 — Embeddings and Representations | How semantic representations support retrieval systems |
| LLM-05 — Inference and Text Generation | How models generate responses from supplied inputs |
| LLM-06 — Context Engineering and Context Constraints | How information and instructions supplied to a model influence its response |
| LLM-07 Chapter 01 — Model Behavior Fundamentals | Observable behavior and the distinction between evidence and assumptions about internal processes |
| LLM-07 Chapter 02 — Reasoning Capabilities and Limitations | Invalid inferences, hidden assumptions, and verification of conclusions |

These topics provide useful context. You do not need to master every prerequisite before beginning this chapter.

## 3. Estimated Reading Time

**25–30 minutes**, excluding the practical exercise.

## 4. Before We Start

Imagine an employee asks an internal enterprise assistant:

> What is our reimbursement limit for domestic travel?

The assistant replies:

> Employees can claim up to ₹5,000 per day for domestic travel. Claims must be submitted within 30 days.

The response is clear, specific, and professionally written.

However, suppose the supplied company policy contains no reimbursement amount and says nothing about a 30-day submission deadline.

The answer may sound reasonable, but neither claim is supported by the available policy.

Now consider three possible responses:

**Response A — Unsupported certainty**

> The reimbursement limit is ₹5,000 per day.

**Response B — Explicit limitation**

> I could not find the domestic travel reimbursement limit in the policy provided. I would need the applicable policy or an authoritative source to confirm it.

**Response C — Evidence-backed answer**

> The policy states that the daily domestic travel reimbursement limit is ₹3,000. The relevant policy section also specifies the applicable employee categories.

Assume Response C accurately reflects an authoritative, applicable policy.

Response C is the strongest answer because it is both supported and relevant. Response B is preferable to Response A when the required evidence is unavailable.

This example illustrates a fundamental principle:

**An LLM application should distinguish what sounds plausible from what the available evidence actually supports.**

## 5. Why Factuality Matters in LLM Engineering

LLMs are used in systems that answer questions, summarize documents, retrieve organizational knowledge, generate reports, explain data, and support decisions.

These tasks create a practical challenge: a response can be linguistically convincing without being factually correct.

Examples include:

- An assistant inventing a configuration option that does not exist.
- A document summarizer attributing a statement to the wrong person.
- A RAG system combining facts from unrelated documents.
- A customer-support bot quoting an outdated refund policy.
- A model generating a nonexistent research paper or API parameter.
- A report generator stating a numerical result that does not appear in the source data.

Such errors can damage trust, increase operational costs, and cause incorrect decisions.

In enterprise applications, factuality is not simply a writing-quality concern. It is a property that must be addressed through evidence management, application design, validation, and operational controls.

The appropriate standard depends on the task. A brainstorming assistant may tolerate clearly labeled speculation. A system that answers questions about employee entitlements or financial records requires substantially stronger evidence and safeguards.

## 6. Mental Model: Claims, Evidence, and Support

A useful way to evaluate a factual response is to break it into individual claims and examine the evidence for each claim.

Consider the statement:

> The production service runs version 2.4, was deployed on Monday, and supports 10,000 requests per minute.

This sentence contains at least three independently verifiable claims:

1. The production service runs version 2.4.
2. It was deployed on Monday.
3. It supports 10,000 requests per minute.

A source that verifies the deployed version does not automatically verify the deployment date or throughput capacity.

### 6.1 The claim-evidence relationship

```text
Factual response
      |
      v
Identify individual claims
      |
      v
Locate relevant evidence
      |
      v
Check whether the evidence supports each claim
      |
      v
Assess scope, freshness, and applicability
      |
      v
Answer, qualify, retrieve more evidence, or abstain
```

This is a conceptual workflow for factual verification, not a description of the model's internal computation.

### 6.2 Why claim-level verification matters

A response is not necessarily reliable merely because one part is correct.

A summary may accurately describe the main topic while inventing a date. A retrieved document may establish a product name but not the price quoted alongside it.

For consequential tasks, evaluate the material claims separately.

The goal is not to verify every word mechanically. It is to identify which claims matter to the user's decision and ensure that their evidential support is appropriate.

## 7. Core Concepts: Factual Correctness, Support, Grounding, and Attribution

These concepts are related, but they answer different questions.

| Concept | Main question |
|---|---|
| Factual correctness | Is the claim true? |
| Evidential support | Does the available evidence justify the claim? |
| Grounding | Is the claim appropriately based on the specified source, context, or evidence? |
| Attribution | Has the information been correctly associated with its source, speaker, record, or entity? |

### 7.1 Factual correctness

A claim is factually correct when it accurately describes the relevant state of affairs.

For example:

> The database currently uses PostgreSQL.

The claim may be true or false depending on the actual system configuration.

Factual correctness cannot always be determined from the generated response itself. It may require checking an authoritative configuration, database, record, or other evidence source.

### 7.2 Evidential support

A claim is supported when the available evidence provides an adequate basis for making it.

Suppose an internal document states:

> The application uses PostgreSQL.

That document supports a claim about what the document says. Whether it proves the application's *current* database configuration depends on the document's authority, date, and relationship to the deployed system.

Evidence can be insufficient, outdated, ambiguous, or irrelevant even when it contains related terminology.

### 7.3 Grounding

Grounding connects an answer to a designated source of information.

Examples include:

- Answering an employee-policy question using the applicable policy.
- Summarizing a contract using the contract's actual clauses.
- Explaining a database incident using supplied logs and metrics.
- Reporting sales totals using a specified query result.

Grounding matters because a response may contain generally plausible information that does not answer the source-specific question.

If a policy says a benefit applies only to permanent employees, a response that describes the benefit as available to all employees is not adequately grounded in that policy.

Grounding does not, by itself, guarantee truth. A source may be outdated, inaccurate, incomplete, or incorrectly selected.

### 7.4 Attribution

Attribution identifies where a claim came from or who made it.

Consider:

> The engineering manager approved the deployment.

A meeting transcript might contain that statement as a proposal, a question, or a quotation from someone else. Treating it as a confirmed approval would misattribute the information.

Correct attribution requires preserving distinctions such as:

- Who made the statement.
- Whether the statement was a fact, opinion, proposal, or quotation.
- Which document or record contains it.
- Whether the source establishes the claim being made.

### 7.5 How the concepts interact

A claim may be factually correct by coincidence but unsupported by the evidence supplied to the system.

A claim may be supported by a document that is itself outdated.

A response may quote an accurate statement but attribute it to the wrong person.

A response may be well grounded in a selected document but fail to reflect a more recent authoritative source.

Therefore, factuality engineering must consider both the claim and the quality and applicability of its evidence.

## 8. Core Concept: What Is Hallucination?

In LLM applications, **hallucination** commonly refers to generated content that is false, fabricated, or unsupported in a context where the response is expected to be grounded in facts or evidence.

The exact definition varies across research and application settings. An engineering team should define what counts as a hallucination for its specific task.

### 8.1 Common hallucination patterns

**Fabricated entities**

The model names a nonexistent API, package, person, document, or product.

**Fabricated attributes**

The entity exists, but the model invents a property, date, price, capability, or relationship.

**Unsupported specificity**

The model supplies an exact number, deadline, version, or quotation without sufficient evidence.

**Source contradiction**

The answer conflicts with the source that the system is expected to follow.

**Misattribution**

A correct or plausible statement is associated with the wrong person, organization, record, or document.

**Unsupported causal explanation**

The model presents a possible cause as established fact without sufficient evidence.

**False completeness**

The response presents an incomplete set of findings as if it were exhaustive.

For example, a search over three documents returns two matching policies. If the assistant claims that these are the only policies in the organization without evidence of a complete search, it has made an unsupported completeness claim.

### 8.2 Hallucination versus other errors

Not every incorrect response is best described as a hallucination.

A response may be incorrect because of:

- An arithmetic mistake.
- A failure to follow an explicit instruction.
- An invalid inference.
- A stale source.
- A retrieval failure.
- A system integration defect.
- An ambiguous or incorrect user request.

These categories can overlap. A hallucinated claim may also violate an instruction, and an outdated retrieval result may lead to a fabricated or unsupported conclusion.

The engineering task is to characterize the observable failure accurately rather than assuming every incorrect response has the same cause.

### 8.3 Why plausible content can be misleading

LLMs can generate language that fits familiar patterns. In a factual task, that capability can produce a response that resembles a conventional answer even when specific evidence is missing.

A familiar API name, a realistic deadline, or a conventional policy clause may appear credible without being true in the current context.

This does not mean every generated claim is fabricated or that an LLM cannot provide correct factual answers. It means plausibility must not be treated as sufficient evidence.

## 9. Why Hallucinations Occur: An Engineering View

There is no single explanation for all hallucinations. Similar observable errors can arise through different mechanisms, and a single response may involve several contributing factors.

### 9.1 Missing information

The necessary fact may not be present in the prompt, supplied documents, retrieval results, or accessible tools.

For example, a user asks for the current production database version, but the system has access only to an architecture document written a year earlier.

The assistant lacks sufficient current evidence for a definitive answer.

### 9.2 Ambiguous or incomplete context

A prompt may omit an important distinction.

For example:

> What is the retention period?

The request does not specify which data type, jurisdiction, policy, or system is relevant.

A model that chooses one interpretation without clarification may return an answer that is plausible but inapplicable.

### 9.3 Misuse of available context

The relevant evidence may be present but misinterpreted.

Examples include confusing a proposed policy with an approved policy, using a value from a historical incident as a current configuration, or combining records for different customers.

### 9.4 Conflicting evidence

Two sources may disagree because one is newer, one is authoritative, or they apply to different circumstances.

The system must determine whether the conflict can be resolved through source authority, effective dates, scope, or additional retrieval. It should not silently combine incompatible statements.

### 9.5 Unsupported generation

The model may produce details that are not established by the available evidence. This is particularly consequential when the task calls for exact factual information.

### 9.6 Weak verification

A generated answer may pass through an application without checking whether its claims are supported, whether its citations match those claims, or whether its result satisfies the requested scope.

These are engineering-level explanations and diagnostic categories, not proof of a particular internal causal mechanism.

### 9.7 Distinguish symptoms from causes

If an answer contains an invented version number, the observable symptom is unsupported specificity.

The underlying cause might involve missing context, retrieval failure, a stale document, an ambiguous request, or generation that was not adequately constrained.

The symptom alone does not establish which cause occurred.

This distinction is important for incident investigation: changing a prompt may help, but it should not be the default response to every factuality failure.

## 10. Core Concept: Grounding in Context and External Evidence

Grounding is often implemented by supplying the model with relevant information at response time.

The information may come from user-provided text, retrieved documents, database records, application state, or external tools.

The key requirement is that the evidence must actually support the claim being made.

### 10.1 Grounding in supplied context

Suppose the prompt contains:

> The staging environment runs version 2.4. The production environment runs version 2.3.

If asked which version production runs, the grounded answer is version 2.3.

Answering version 2.4 would confuse the environments even though that version appears in the supplied context.

The model must preserve the relationship between each fact and the entity to which it applies.

### 10.2 Grounding in retrieved documents

A retrieval-augmented generation (RAG) system retrieves relevant passages and supplies them to the model.

A simplified flow is:

```text
User question
      |
      v
Retrieve candidate passages
      |
      v
Select and assemble context
      |
      v
Generate an answer using the context
      |
      v
Validate claims and source references
      |
      v
Return a supported response
```

Retrieval improves access to external knowledge, but it does not guarantee factuality.

Potential failures include:

- The correct document was not retrieved.
- The retrieved passage is irrelevant to the question.
- The source is outdated.
- A passage is truncated and loses a qualifying condition.
- Two passages refer to different versions of a policy.
- The answer combines unrelated facts.
- The model makes a claim that the retrieved evidence does not support.

The architecture must address both evidence retrieval and evidence use.

### 10.3 Grounding in authoritative system data

For questions about live operational state, a database query, service API, configuration registry, or observability system may provide stronger evidence than a general document.

For example:

> Which model version is currently deployed?

An approved deployment registry or live deployment API may be more appropriate than a historical architecture document.

The correct source depends on the question. A deployment registry may establish the deployed version but not explain why a deployment decision was made. A meeting record may explain the decision but not establish the current state.

### 10.4 Grounding requires scope alignment

A source is useful only if its scope matches the claim.

Check:

- **Entity:** Does the evidence refer to the correct person, service, customer, or product?
- **Time:** Does it apply to the relevant date or current state?
- **Version:** Does it describe the relevant software, policy, or document version?
- **Conditions:** Does the claim preserve exceptions and eligibility requirements?
- **Authority:** Is the source suitable for the type of claim being made?
- **Completeness:** Does the evidence support the breadth of the conclusion?

These checks help prevent a related but inapplicable source from being treated as sufficient support.

## 11. Core Concept: Citations and Evidence Traceability

Citations can help readers trace claims back to their sources. However, a citation is useful only when the cited source actually supports the associated statement.

### 11.1 Citation failure patterns

**Nonexistent source**

The response cites a document or URL that does not exist.

**Real source, unsupported claim**

The source exists but does not establish the claim.

**Wrong passage**

The document is relevant, but the cited section does not support the specific statement.

**Scope mismatch**

The source supports a similar claim about a different product, version, time period, or employee category.

**Overextended citation**

A narrow passage is used to support a much broader conclusion.

**Incomplete traceability**

A citation identifies a large document but makes it difficult to locate the relevant evidence.

### 11.2 Evidence traceability

A robust factual response should make it possible, where appropriate, to determine:

1. Which source supports each material claim.
2. Which passage, record, or result contains the evidence.
3. Whether the source applies to the claim's scope.
4. Whether the claim accurately reflects the source.
5. Whether the source's authority and freshness are sufficient.

A citation should not be treated as proof merely because it is formatted correctly.

### 11.3 Source attribution is not truth verification

Suppose an assistant correctly quotes an outdated policy. The quotation may be faithful to that document while still being inappropriate as an answer about the current policy.

The system must evaluate both source fidelity and source applicability.

Likewise, a generated reference that appears plausible should be resolved against the actual source system rather than accepted because its title looks credible.

## 12. Core Concept: Evidence Conflicts, Freshness, and Uncertainty

Factual answers often depend on multiple sources that vary in authority, freshness, and scope.

### 12.1 Source conflicts

Suppose two internal documents state different reimbursement limits:

- Policy document A: ₹3,000 per day.
- Policy document B: ₹4,000 per day.

The assistant should not average the values or select one arbitrarily.

A suitable investigation considers:

- Whether one document supersedes the other.
- Effective dates and version numbers.
- Employee categories or geographic scope.
- Whether either document is a draft.
- Whether an authoritative policy registry resolves the disagreement.

If the conflict remains unresolved, the system should state that the sources disagree and avoid presenting an unsupported definitive value.

### 12.2 Freshness

Some facts change frequently:

- Service deployment versions.
- Product pricing.
- Employee policies.
- Inventory and availability.
- Regulatory requirements.
- Operational metrics.

A source that was accurate when written may no longer describe the current state.

Freshness requirements should reflect the fact being asserted. A mathematical definition may remain stable for years; a live deployment status may change within minutes.

### 12.3 Uncertainty should be specific

A useful uncertainty statement explains what is unknown and why it matters.

Weak:

> I may be wrong.

Better:

> The supplied policy does not specify a reimbursement limit, and I could not verify the current approved policy. I cannot establish the applicable amount from the available evidence.

The second response identifies the evidence gap and the limitation it creates.

### 12.4 Abstention as a valid outcome

An application does not need to force a definitive answer when evidence is insufficient.

Depending on the task, appropriate outcomes include:

- Answer with verified evidence.
- Answer with explicit qualifications.
- Ask a clarifying question.
- Retrieve additional information.
- Report conflicting evidence.
- Abstain and route the request for human review.

Abstention should be designed around the task's risk and usefulness. Excessive abstention can make an application unhelpful, while unjustified certainty can make it unsafe or unreliable.

## 13. Practical Engineering Workflow for Factual Responses

The following workflow can be applied to document assistants, RAG systems, support bots, and knowledge-intensive applications.

### Step 1: Identify the factual task

Determine what the user is asking the system to establish.

Is the request asking for a general explanation, a statement from a supplied document, a current system fact, a comparison, or an inference from evidence?

Different tasks require different sources and verification standards.

### Step 2: Identify material claims

Break a proposed answer into claims that can be checked independently.

Prioritize claims that affect decisions, obligations, money, access, security, or operational actions.

### Step 3: Select appropriate evidence sources

Use sources suited to the question:

- Supplied documents for source-specific summaries.
- Approved policy repositories for policy questions.
- Authoritative databases or APIs for current records.
- Logs and metrics for operational observations.
- Independent calculations for deterministic quantities.

Do not treat general model knowledge as a substitute for an authoritative source when the task requires current or organization-specific facts.

### Step 4: Retrieve and inspect evidence

Check whether the selected source contains the information needed to answer the question.

Assess relevance, scope, freshness, completeness, and authority.

If evidence is missing, decide whether to retrieve more, ask for clarification, or state the limitation.

### Step 5: Construct a supported answer

Ensure that each material claim is supported by the available evidence or clearly marked as an inference, assumption, or uncertainty.

Avoid introducing exact figures, dates, names, quotations, or causal explanations that the evidence does not establish.

### Step 6: Validate claim-source alignment

For each material claim, ask:

- Does the source actually support this claim?
- Does the claim preserve relevant conditions and exceptions?
- Is the source authoritative enough for the intended use?
- Is the claim broader than the evidence?
- Does the answer combine information from incompatible contexts?

### Step 7: Choose the appropriate response outcome

Return the answer, qualify it, retrieve more evidence, ask a clarifying question, report a conflict, or abstain.

The decision should reflect the strength of the evidence and the consequences of an incorrect answer.

### Step 8: Preserve evidence and review outcomes

For consequential workflows, retain appropriate records of sources, relevant passages, retrieval results, validation decisions, and the final answer.

Apply privacy, access-control, and data-retention requirements. Evidence logging should not become a reason to retain unnecessary sensitive data.

## 14. Engineering Decisions and Trade-offs

Factuality controls involve trade-offs. More retrieval or verification is not automatically better in every situation.

| Decision | Benefit | Trade-off |
|---|---|---|
| Retrieve more sources | May find missing or contradictory evidence | Adds latency, cost, and potentially irrelevant context |
| Prefer authoritative sources | Improves relevance and accountability | Authoritative sources may be unavailable or incomplete |
| Require claim-level citations | Improves traceability | Adds implementation complexity and may make responses less concise |
| Validate generated claims | Can detect unsupported statements | Validators may miss semantic errors or produce false positives |
| Abstain when evidence is weak | Reduces unsupported certainty | Can reduce answer coverage and user satisfaction |
| Use current system APIs | Improves access to live state | Introduces dependencies, permissions, latency, and tool-failure modes |
| Retain evidence records | Supports incident investigation and auditability | Requires careful handling of privacy, retention, and access |

### 14.1 Verification proportional to risk

A casual request for brainstorming may not require the same controls as an answer about a contractual obligation or a production configuration.

A practical design considers:

- The consequence of an incorrect answer.
- The quality and authority of available evidence.
- How quickly the underlying facts can change.
- Whether the answer triggers an external action.
- Whether the result can be independently verified.
- Whether human review is required.

The goal is not to eliminate every possible error through unlimited checks. It is to make factual failures less likely, easier to detect, and less damaging.

## 15. Common Mistakes and Misconceptions

### Mistake 1: Treating plausible language as evidence

A realistic-sounding number, name, or policy clause is not proof that the claim is true.

**Better approach:** Require evidence appropriate to the claim.

### Mistake 2: Assuming RAG eliminates hallucinations

Retrieval provides context, but the wrong passage may be retrieved, misunderstood, or ignored.

**Better approach:** Evaluate both retrieval quality and whether the answer is supported by the retrieved evidence.

### Mistake 3: Treating a citation as proof

A real source can be irrelevant, outdated, or insufficient to support the cited claim.

**Better approach:** Verify the relationship between each material claim and its source.

### Mistake 4: Confusing source fidelity with current truth

A summary can accurately reproduce an outdated policy.

**Better approach:** Check whether the source is authoritative and applicable to the question's time and scope.

### Mistake 5: Treating every factual error as the same failure

An arithmetic error, retrieval failure, stale record, invalid inference, and unsupported generated claim require different investigations.

**Better approach:** Describe the observable failure first, then investigate possible causes.

### Mistake 6: Forcing an answer when evidence is insufficient

A definite answer may be less useful than a precise statement of what is unknown.

**Better approach:** Support abstention, clarification, and explicit uncertainty as valid application outcomes.

### Mistake 7: Overstating what verification proves

A schema validator can establish structural validity without establishing truth. A citation checker can establish that a link resolves without establishing that the linked source supports the claim.

**Better approach:** Match each verification mechanism to the property it actually checks.

## 16. Interview Questions with Expected Answers

### Q1. What is the difference between factual correctness and grounding?

**Expected answer:** Factual correctness concerns whether a claim is true. Grounding concerns whether the claim is appropriately based on the specified evidence or context. A claim can be true by coincidence but unsupported by the supplied source. A grounded claim can also reflect an inaccurate or outdated source.

### Q2. What is a hallucination in an LLM application?

**Expected answer:** It is generated content that is false, fabricated, or unsupported in a context where factual or evidence-grounded output is expected. The precise operational definition should match the application's task and evaluation criteria.

### Q3. Why does RAG not guarantee factual answers?

**Expected answer:** Retrieval can return irrelevant, outdated, incomplete, or conflicting passages. The model can also misinterpret evidence or make claims beyond what the passages support. Both evidence selection and evidence use require attention.

### Q4. Why is claim-level verification useful?

**Expected answer:** A response can contain several claims with different evidence requirements. Verifying each material claim makes it easier to detect unsupported details, scope mismatches, and incorrect attribution.

### Q5. How should a system handle conflicting internal policies?

**Expected answer:** Investigate authority, effective dates, versions, scope, and approval status. If the conflict cannot be resolved, report the disagreement and avoid presenting an unsupported definitive answer.

### Q6. What is the difference between a citation resolving successfully and a citation supporting a claim?

**Expected answer:** A resolving citation establishes that the reference can be accessed. Claim support requires checking that the referenced evidence actually justifies the associated statement and applies to its scope.

### Q7. When should an LLM application abstain?

**Expected answer:** When required evidence is unavailable or insufficient and a definitive answer would be unjustified, particularly when the consequences of error are significant. Depending on the task, the application may instead retrieve more evidence, ask for clarification, or route the request for review.

### Q8. How would you investigate an unsupported answer in a production RAG system?

**Expected answer:** Preserve the relevant request and appropriate evidence records, inspect retrieved passages and source metadata, identify the unsupported claims, verify source applicability, and determine whether the issue arose from missing evidence, retrieval, interpretation, generation, or validation. Apply a targeted fix and test whether it improves the relevant failure without introducing unacceptable regressions.

## 17. Quick Revision

- Factual correctness, evidential support, grounding, and attribution are related but distinct.
- Hallucinations involve false, fabricated, or unsupported generated content in a factual task.
- Fluent and specific language does not establish factual correctness.
- Grounding requires evidence that supports the claim and applies to its scope.
- RAG improves access to information but does not guarantee that the answer uses it correctly.
- Citations support traceability only when the cited material actually supports the claim.
- Source authority, freshness, version, and scope affect whether evidence is suitable.
- Uncertainty, clarification, retrieval, and abstention are valid outcomes when evidence is insufficient.
- Verification methods should be matched to the properties they can actually establish.

## 18. Key Takeaways

Factuality is an evidence-management problem as well as a model-behavior problem.

An enterprise LLM application must do more than produce a plausible response. It must use suitable sources, preserve the relationship between evidence and claims, account for freshness and scope, and avoid presenting unsupported conclusions as established facts.

The most important engineering habit is to **evaluate what each claim is supported by, not merely whether the answer sounds credible**.

Grounding, citations, retrieval, validation, and abstention are complementary controls. None is sufficient on its own for every task. Their design should reflect the application's factual requirements, available evidence, and consequences of failure.

## 19. Further Reading

The following research papers provide broader context on factuality, hallucination, and grounding. Their findings should be interpreted within the tasks and evaluation settings studied by the authors.

- Ji et al., [Survey of Hallucination in Natural Language Generation](https://arxiv.org/abs/2202.03629) — A survey of hallucination definitions, categories, and mitigation approaches across natural-language generation.
- Lin, Hilton, and Evans, [TruthfulQA: Measuring How Models Mimic Human Falsehoods](https://arxiv.org/abs/2109.07958) — Research on evaluating whether language models reproduce common misconceptions rather than providing truthful answers.
- Lewis et al., [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401) — Foundational research on combining retrieval with generation for knowledge-intensive tasks.
