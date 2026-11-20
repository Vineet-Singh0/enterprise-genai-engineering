# 03 — Evaluation Evidence for Model Selection

## 1. Learning Objectives

After completing this chapter, you should be able to:

- Identify what evidence is needed to support a model-selection decision.
- Distinguish documented claims, observed findings, assumptions, and engineering conclusions.
- Assess whether evidence is relevant to the workload and candidate being considered.
- Recognize weak, outdated, conflicting, or insufficient evidence.
- Record evidence and requirement-level conclusions separately.
- Explain what remains uncertain and what action is needed before making a decision.

## 2. Prerequisites

You should understand the concepts introduced in:

- [01 — Requirements and Workload Characterization](01-Requirements-and-Workload-Characterization.md)
- [02 — Model Capability Fit and Candidate Shortlisting](02-Model-Capability-Fit-and-Candidate-Shortlisting.md)

This chapter builds on the requirements and candidate shortlist established in those chapters.

## 3. Estimated Reading Time

Approximately 15–20 minutes.

## 4. Before We Start

Suppose two language models appear suitable for a customer-support application.

Model A has strong public benchmark results. Model B has weaker results on a general benchmark but performs well on a small internal test using representative support questions.

Which model should you choose?

Neither benchmark score nor internal test results automatically settle the decision.

The public benchmark may not represent your workload. The internal test may be too small, may omit important cases, or may have been run against a different model version than the one you intend to use.

The engineering question is therefore not simply:

> Which model has the better score?

It is:

> What does the available evidence establish about each candidate's suitability for this specific workload, and what remains uncertain?

This chapter focuses on answering that question.

## 5. Why Evidence Matters

Model-selection decisions often involve incomplete information.

A model card may describe supported capabilities. A provider may publish benchmark results. An internal experiment may show task-specific behavior. Documentation may specify context limits, supported input formats, or usage restrictions.

Each source can inform a decision, but each supports only particular conclusions.

For example:

- A documented context limit can establish a stated technical constraint for the documented model version.
- A benchmark result can indicate performance under the benchmark's particular conditions.
- An internal experiment can provide evidence about the tested workload and configuration.
- An expert's opinion can help identify risks or candidate options, but it is not equivalent to measured task performance.

A defensible selection decision connects a requirement to relevant evidence and makes the reasoning traceable.

The objective is not to collect the largest amount of information. It is to collect enough applicable, credible evidence to support the decision being made.

## 6. Claims, Evidence, and Conclusions

These three elements must remain distinct.

### 6.1 Claim

A claim is a statement about a candidate.

Examples:

- The model supports structured output.
- The model can process the required input modality.
- The model satisfies the application's response-quality target.
- The candidate is suitable for the intended workload.

Claims differ in scope. A provider's statement about a supported feature does not, by itself, establish that the feature will satisfy an application's acceptance criteria.

### 6.2 Evidence

Evidence is information that supports, contradicts, or helps investigate a claim.

Examples include:

- Official model documentation.
- Model cards and technical reports.
- Published benchmark results.
- Internal evaluation results.
- Controlled observations from a representative application workflow.
- Documented findings from an engineering investigation.

Evidence should be associated with the specific model version, configuration, conditions, and requirement to which it applies.

### 6.3 Conclusion

A conclusion is the engineering judgment reached after interpreting the evidence against a requirement.

Consider this example:

| Element | Example |
|---|---|
| Requirement | The application must produce valid JSON conforming to a defined schema. |
| Claim | Candidate A supports constrained structured output. |
| Evidence | Documentation confirms the feature exists for the selected API and model version. |
| Limitation | The documentation does not establish that the application's particular schema and failure-handling requirements are satisfied. |
| Conclusion | Feature availability is supported, but application-level acceptance remains unconfirmed until the relevant behavior is checked. |

The distinction prevents a common mistake: treating evidence that a capability exists as proof that the application requirement has been met.

### 6.4 Facts, assumptions, and inferences

When documenting a selection decision, distinguish:

- **Fact:** A statement directly supported by a source or observation.
- **Assumption:** A condition accepted provisionally because it has not been established.
- **Inference:** A conclusion drawn from available evidence.
- **Unknown:** A question for which adequate evidence is not available.

Do not silently turn assumptions into facts. If an assumption materially affects the decision, record it and identify how it can be validated.

## 7. Derive Evidence Needs from Requirements

Evidence collection should start with the requirements, not with whatever information happens to be easiest to find.

For each important requirement, ask:

1. What exactly must be true?
2. What evidence would support that conclusion?
3. Under which model version and operating conditions must the requirement hold?
4. What would count as sufficient evidence for the current decision?
5. What action is needed if the evidence is missing or contradictory?

### 7.1 Separate different decision questions

A model-selection workflow contains related but distinct questions.

| Decision dimension | Question |
|---|---|
| Eligibility | Does the candidate satisfy the mandatory constraints established in Chapter 01? |
| Capability fit | Is there evidence that the candidate can perform the required task? |
| Acceptance | Does the candidate meet the application's defined acceptance criteria? |
| Selection | Given eligible candidates, their evidence, and the relevant trade-offs, which candidate is the best justified choice? |

Do not collapse these dimensions into one status.

A candidate may satisfy all known mandatory constraints while its task-specific capability remains uncertain. Conversely, strong task performance cannot compensate for a confirmed violation of a mandatory requirement.

Apply the eligibility rules defined in Chapter 01. This chapter determines how evidence supports the decision; it does not redefine the eligibility states.

### 7.2 Define the evidence criterion first

Suppose the application has the following requirement:

> The model must extract the required fields from representative customer-support messages and produce output accepted by the application's validator.

Before interpreting results, define what acceptance means. For example, a team might require at least 95% of outputs to pass schema validation across a representative test set, with no failures in a separately identified critical category.

These numbers are **illustrative only**. The actual threshold, test conditions, and critical categories must come from the application's requirements and risk profile. There is no universal acceptance threshold suitable for every model-selection problem.

Evaluation methodology, metric selection, dataset construction, statistical interpretation, and reproducibility practices belong primarily to [LLM-08 — Language Model Evaluation and Benchmarking](../LLM-08-Language-Model-Evaluation-and-Benchmarking/README.md). This chapter uses the resulting evidence to support selection decisions rather than reteaching that methodology.

## 8. Evidence Sources and Their Appropriate Uses

Different sources answer different questions.

### 8.1 Official documentation and model cards

Use these to investigate documented capabilities, constraints, supported interfaces, model versions, input modalities, and stated usage conditions.

**Strength:** Usually the appropriate starting point for claims about officially documented behavior and restrictions.

**Limitation:** Documentation may not establish performance on your specific workload. A listed capability does not guarantee that the application will meet its acceptance criteria.

Verify that the information applies to the exact model, version, API, or distribution under consideration.

### 8.2 Published benchmarks and technical reports

Published results can help identify plausible candidates and provide background on measured performance.

**Strength:** They may offer comparative information under documented conditions.

**Limitation:** Results may not transfer to a different workload, prompt format, language, output constraint, model version, or evaluation setup.

Treat a benchmark score as evidence about the benchmark conditions, not as a universal measure of model quality.

### 8.3 Internal evaluations

Internal evaluations can provide evidence using the application's own tasks and requirements.

**Strength:** They can be more directly relevant to the intended workload than general-purpose benchmarks.

**Limitation:** Their usefulness depends on the quality and representativeness of the evaluation, the tested configuration, and the reliability of the measurements.

A small internal test is not automatically stronger than a published benchmark simply because it is internal. Assess what each source establishes.

### 8.4 Observations from an existing application

Production or pilot observations can help reveal how a candidate behaves under real interaction patterns.

**Strength:** They may expose conditions not represented in offline tests.

**Limitation:** Results can be affected by traffic composition, application logic, user behavior, changing prompts, and other system components.

Do not attribute an application's outcome to the model alone unless the evidence supports that attribution.

Detailed production monitoring and operational analysis belong to PROD.

### 8.5 Expert judgment

Expert judgment can identify plausible candidates, likely risks, and useful follow-up investigations.

**Strength:** It helps guide investigation when evidence is incomplete.

**Limitation:** It should not be presented as measured performance or verified compatibility.

Record important judgments as judgments, along with their rationale and any assumptions.

## 9. Assess Evidence Quality and Applicability

Finding a source is not the same as establishing that it supports a decision.

Assess evidence using the following dimensions.

### 9.1 Workload relevance

Ask whether the evidence concerns the same kind of task and conditions as the intended application.

A result on general question answering may provide limited support for a requirement involving strict schema-constrained extraction. A multilingual benchmark may not establish performance for every language or domain.

The greater the mismatch, the more cautious the conclusion should be.

### 9.2 Authority and provenance

Identify who produced the evidence, where it came from, and whether its origin can be checked.

An official specification may be suitable for establishing a documented feature. An independent or internal evaluation may be more useful for assessing task performance.

Authority alone does not guarantee applicability.

### 9.3 Methodological transparency

Check whether the source explains enough about its conditions to interpret the result.

Relevant details may include the model version, test conditions, task definition, configuration, and evaluation procedure.

If important conditions are unknown, record that limitation rather than assuming that the result transfers unchanged.

### 9.4 Version and freshness

Model behavior, available features, pricing, provider terms, and supported configurations can change.

Record the version or configuration tested and the date the information was verified. Recheck evidence when a decision depends on information that may have changed.

An old result is not automatically invalid. It is less useful when the relevant model or service has changed and the result's continued applicability has not been established.

### 9.5 Conflicting evidence

Different sources can produce apparently conflicting results because they test different tasks, versions, configurations, or conditions.

Before choosing one result over another:

1. Identify the precise claims that conflict.
2. Compare the conditions under which each result was obtained.
3. Determine whether the sources actually address the same requirement.
4. Record any unresolved discrepancy.
5. Decide whether the discrepancy affects the current selection decision.

Do not average incompatible results or choose the preferred result without a defensible reason.

## 10. Determine Evidence Sufficiency

Evidence sufficiency is a decision about whether the available evidence is adequate for a particular requirement and decision stage.

Use three requirement-level evidence outcomes.

| Outcome | Meaning | Appropriate next action |
|---|---|---|
| **Sufficient for the current decision** | The evidence is relevant and credible enough to support the specified decision under the recorded conditions. | Record the supported conclusion and any remaining limitations. |
| **Insufficient** | The available evidence does not adequately support a conclusion for the current decision. | Identify the evidence gap and the next investigation or test. |
| **Conflicting** | Relevant evidence supports incompatible conclusions, and the discrepancy has not been resolved. | Investigate the disagreement or document why a decision must remain conditional. |

These outcomes describe evidence sufficiency, not the candidate's eligibility or overall quality.

### 10.1 Sufficiency depends on the decision

The evidence needed to shortlist a candidate may be less extensive than the evidence needed to authorize a high-impact production use.

For example, a public benchmark may be sufficient to justify investigating a candidate further. It may be insufficient to establish that the candidate satisfies a critical application requirement.

Therefore, record the decision being supported. Avoid statements such as “the evidence is sufficient” without specifying sufficient for what.

### 10.2 Missing evidence is not proof of failure

If a source does not establish that a candidate supports a requirement, the correct conclusion is that support has not been established.

That does not automatically mean the candidate fails.

Similarly, a lack of observed failures in a limited test does not prove that failures cannot occur.

Keep three states distinct:

- Evidence supports the requirement.
- Evidence establishes that the requirement is violated.
- Evidence does not yet establish either conclusion.

The appropriate action depends on the requirement's importance, the consequence of being wrong, and the cost of obtaining further evidence.

### 10.3 Prioritize evidence gaps

Not every unknown needs to be resolved immediately.

Prioritize gaps that could:

- Disqualify a candidate under a mandatory constraint.
- Change the leading candidate.
- Affect a critical acceptance criterion.
- Create substantial operational or commercial risk.
- Make the final decision difficult to reverse.

This keeps evidence gathering focused on decisions that matter.

## 11. Maintain an Evaluation Evidence Record

A selection decision should be traceable. A future engineer should be able to understand what was known, what was concluded, and what remained uncertain.

Use an evidence record with fields such as:

| Field | Purpose |
|---|---|
| Evidence ID | Unique reference for the evidence item. |
| Candidate ID | Identifies the candidate and arrangement being assessed. |
| Requirement ID | Links the evidence to a specific requirement. |
| Claim or question | States what the evidence is intended to establish. |
| Evidence type | Documentation, benchmark, internal evaluation, observation, or expert judgment. |
| Source reference | Link, report, experiment record, or other traceable source. |
| Candidate version and configuration | Identifies the model and relevant setup. |
| Conditions | Records the conditions under which the evidence applies. |
| Verification date | Indicates when the source or result was checked. |
| Source finding | States what the source directly reports or establishes. |
| Limitations | Records applicability gaps, assumptions, or other caveats. |
| Evidence outcome | Sufficient for the current decision, Insufficient, or Conflicting. |
| Requirement conclusion | States what can be concluded about the requirement. |
| Next action | Identifies any required investigation or follow-up. |

The record should preserve the reasoning chain:

**Requirement → Claim → Evidence → Source finding → Evidence sufficiency → Requirement conclusion → Next action**

### 11.1 Worked evidence-record entries

The following entries are hypothetical. They demonstrate how to record definite outcomes under explicitly stated conditions.

Assume the application's agreed acceptance criterion is:

- At least 95% of outputs pass schema validation across a representative test set.
- No failures occur in the separately identified critical category.

These are illustrative values, not recommended universal thresholds. In a real application, the team must define the acceptance criterion before interpreting the test results.

| ID | Claim or question | Source finding | Evidence outcome | Requirement conclusion | Next action |
|---|---|---|---|---|---|
| E-01 | Does Candidate A support the required input format? | Official documentation for the selected version explicitly lists the required format. | Sufficient for the current decision | The documented feature requirement is supported for this version. | Preserve the version reference and recheck if the candidate changes. |
| E-02 | Does Candidate A meet the extraction acceptance criterion? | A representative internal test contains 200 cases. Of these, 194 outputs pass schema validation (97%), and no failures occur in the critical category. The test record identifies the model version and configuration. | Sufficient for the current decision | The candidate meets the defined acceptance criterion under the recorded test conditions. | Confirm that the evaluated configuration matches the intended use. |
| E-03 | Does Candidate B meet the extraction acceptance criterion? | A published benchmark reports results on a related task, but it does not test the application's required extraction format or acceptance criterion. | Insufficient | The available benchmark does not establish whether Candidate B meets the requirement. | Run an appropriate task-specific evaluation before concluding. |
| E-04 | Do two relevant sources support the same conclusion for Candidate C? | Two relevant reports reach different conclusions, and the available records do not explain the discrepancy. | Conflicting | The requirement conclusion remains unresolved. | Compare versions and test conditions, then investigate the discrepancy. |

For E-02, the arithmetic is explicit: \(194 / 200 = 97\%\). The result exceeds the illustrative 95% threshold, and the critical-category condition is also satisfied in the hypothetical test. Therefore, the stated conclusion follows from the stated criterion.

This example demonstrates the decision logic; it does not establish that 200 cases are sufficient for every application or that a 97% result guarantees future performance.

Notice that E-03 is not marked as a candidate failure. The evidence is insufficient to establish whether the requirement is met. Likewise, E-04 does not choose a preferred source before the conflict has been investigated.

### 11.2 Keep the record useful

Avoid recording only a score or a link. Capture enough context to explain why the evidence supports the conclusion.

Do not duplicate entire reports in the evidence register. Store concise findings and link to the original source or evaluation record.

When new evidence becomes available, update the relevant conclusion and preserve the reasoning behind material changes. A decision record should make changes explainable rather than merely show the latest status.

## 12. Worked Example: Interpreting Mixed Evidence

A team is choosing between Candidate A and Candidate B for a support-message extraction workflow.

The application requires:

- A documented input capability.
- Output that passes a specified schema validator.
- Performance that satisfies an agreed task-specific acceptance criterion.

The team has the following evidence:

**Candidate A**

- Official documentation supports the required input capability.
- An internal test using representative support messages meets the agreed extraction acceptance criterion.
- The test identifies the model version and configuration.
- The exact intended application configuration still needs to be checked against the tested setup.

**Candidate B**

- Public benchmark results are available for a related language task.
- The benchmark does not establish performance against the application's exact extraction criterion.
- Documentation supports the required input capability.

### 12.1 Interpret the evidence

For Candidate A, the documented input requirement is supported. The internal test supports the extraction criterion under its recorded conditions. However, the team must confirm that the intended configuration matches the tested configuration before relying on the result for that deployment decision.

For Candidate B, the input requirement is supported, but the available benchmark does not establish whether the extraction criterion is met. The correct action is to obtain relevant evidence, not to assume that Candidate B passes or fails.

### 12.2 What should the team decide?

The team should not declare Candidate A the universal winner or Candidate B unsuitable based only on this evidence.

It can reasonably prioritize Candidate A for the next decision stage because it has more directly relevant evidence for the extraction requirement. Before finalizing the choice, the team should confirm Candidate A's configuration applicability and determine whether Candidate B warrants a task-specific evaluation.

The final choice should also account for the other requirements and trade-offs established earlier in LLM-10. This chapter establishes how to interpret the evidence; it does not replace the complete selection decision.

### 12.3 What makes this decision defensible?

The reasoning is traceable:

1. Requirements were defined before interpreting the results.
2. Evidence was assessed against those requirements.
3. A related benchmark was not treated as proof of task-specific acceptance.
4. Missing evidence was not misrepresented as a confirmed failure.
5. The next action was tied to the unresolved decision.

This is the standard to aim for: not certainty where none exists, but a clear account of what is known, what remains uncertain, and how that uncertainty affects the decision.

## 13. Common Evidence Interpretation Mistakes

### Mistake 1: Treating a benchmark score as a universal ranking

A benchmark measures performance under particular conditions. It does not establish that the highest-scoring model is the best candidate for every workload.

**Better approach:** Interpret benchmark results in relation to the requirement and the benchmark's applicability.

### Mistake 2: Confusing capability availability with application suitability

A model may expose a feature without meeting the application's quality, reliability, or acceptance requirements.

**Better approach:** Separate documented capability from task-specific evidence and acceptance.

### Mistake 3: Treating missing evidence as a failed requirement

A lack of evidence does not establish a violation.

**Better approach:** Record the evidence as insufficient unless the available evidence actually establishes a failure.

### Mistake 4: Ignoring version and configuration differences

Results for one version or arrangement may not apply to another.

**Better approach:** Record the tested version and conditions, and confirm applicability before relying on the result.

### Mistake 5: Selecting only favorable evidence

Ignoring contradictory or unfavorable findings creates a biased selection process.

**Better approach:** Preserve relevant conflicting evidence and document how discrepancies were resolved.

### Mistake 6: Collecting evidence without a decision question

Large collections of model cards, benchmark tables, and opinions can create the appearance of rigor without answering the important requirements.

**Better approach:** Start from the requirement, identify the evidence needed, and collect only information that can influence the decision.

### Mistake 7: Hiding uncertainty behind a single confidence score

A single score can conceal a critical unknown or a mandatory constraint that has not been established.

**Better approach:** Record uncertainty against individual requirements and identify the next action.

## 14. Production Perspective

Evidence records are useful beyond the initial model-selection exercise.

A model or provider may change. A workload may evolve. A new requirement may be introduced. A previously acceptable trade-off may become unacceptable.

Traceable evidence helps the team answer:

- Why was this candidate selected?
- Which requirements were established by evidence?
- Which assumptions were accepted?
- What conditions did the evidence depend on?
- What unresolved gaps were accepted, and why?
- What change should trigger a new evaluation?

For maintainability, preserve the evidence sources, candidate versions, verification dates, and decision rationale. Revisit the evidence when a material change makes the original conclusion unreliable.

This is not a replacement for production monitoring, governance, or formal evaluation processes. Those responsibilities remain with their primary curriculum domains.

## 15. Engineering Decisions and Trade-offs

Evidence gathering has a cost. Further testing consumes engineering time and may require access, infrastructure, or specialized evaluation work.

The right question is not whether every uncertainty can be eliminated. It is whether the remaining uncertainty is acceptable for the decision being made.

A useful decision process weighs:

- The consequence of an incorrect conclusion.
- The importance of the requirement.
- The relevance and credibility of existing evidence.
- The cost and time required to obtain more evidence.
- Whether the decision is reversible.
- Whether a safer or more conservative alternative is available.

A low-impact, reversible shortlist decision may proceed with limited evidence. A high-impact decision involving a mandatory requirement may require stronger evidence before proceeding.

Document the rationale. Do not disguise a risk acceptance as a proven technical conclusion.

## 16. Interview Questions with Expected Answers

### Q1. Why is a high benchmark score insufficient to select a model?

A benchmark score describes performance under the benchmark's conditions. It may not represent the target workload, configuration, language, or acceptance criteria. The result must be interpreted against the application's requirements and other selection constraints.

### Q2. What is the difference between evidence sufficiency and requirement satisfaction?

Evidence sufficiency describes whether the available evidence is adequate for a particular decision. Requirement satisfaction is the conclusion drawn about the requirement. Insufficient evidence does not automatically mean that the requirement has failed.

### Q3. How should you handle conflicting evidence?

Identify the claims and conditions involved, compare model versions and evaluation setups, and investigate whether the sources address the same requirement. Record the unresolved conflict and avoid selecting a preferred result without justification.

### Q4. Why should evidence include model version and verification date?

Model behavior, features, configurations, and external conditions can change. Version and date information help establish whether the evidence applies to the candidate currently being considered.

### Q5. When should an engineer gather more evidence?

Gather more evidence when an unresolved question could change eligibility, acceptance, the leading candidate, or the risk of the decision. The amount of evidence required should reflect the consequences of being wrong.

## 17. Quick Revision

- Start from requirements, not from available benchmark tables.
- Separate claims, evidence, source findings, and engineering conclusions.
- Assess evidence for workload relevance, provenance, transparency, version, and conditions.
- Record evidence sufficiency separately from requirement satisfaction.
- Use **Sufficient**, **Insufficient**, and **Conflicting** to describe the state of evidence for a defined decision.
- Missing evidence is not proof of failure.
- Preserve the evidence-to-conclusion reasoning chain.
- Gather additional evidence when the unresolved uncertainty could materially change the decision.

## 18. Key Takeaways

1. Evidence is useful only in relation to a specific requirement and decision.
2. A source can be credible while still being insufficient for the question being asked.
3. Model capability, requirement satisfaction, and selection preference are distinct concepts.
4. Evidence records should state what a source establishes, what conclusion is justified, and what remains unresolved.
5. A defensible decision does not require pretending that uncertainty has disappeared. It requires making uncertainty explicit and handling it appropriately.

## 19. Further Reading

- [LLM-08 — Language Model Evaluation and Benchmarking](../LLM-08-Language-Model-Evaluation-and-Benchmarking/README.md) — for evaluation methodology, metrics, benchmark design, experimental practices, and statistical interpretation.
- [02 — Model Capability Fit and Candidate Shortlisting](02-Model-Capability-Fit-and-Candidate-Shortlisting.md) — for translating capability needs into a candidate shortlist.
- [04 — Cost, Latency, and Total Cost of Ownership](04-Cost-Latency-and-Total-Cost-of-Ownership.md) — for evaluating economic and performance trade-offs after establishing relevant candidate evidence.

---
