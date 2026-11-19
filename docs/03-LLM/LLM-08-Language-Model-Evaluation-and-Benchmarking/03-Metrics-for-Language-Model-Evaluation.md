# 03 — Metrics for Language Model Evaluation

## 1. Purpose

An evaluation metric converts observed model behavior into a measurable signal that can support an engineering decision.

However, a metric does not automatically measure everything that matters about a system. A model can achieve high lexical similarity while changing the meaning of an answer, produce valid JSON containing incorrect information, or answer accurately while ignoring a critical instruction.

Metric selection therefore requires more than choosing a familiar scoring function.

The central engineering question is:

> Does the selected metric measure the property that matters for the task, and can its result support the decision being made?

This chapter explains how evaluation metrics work, what they measure, where they fail, and how to choose a suitable combination of metrics for different LLM tasks.

The focus is on metric semantics, interpretation, and selection. Dataset construction belongs to Chapter 02, human evaluation and rubric design to Chapter 04, and automated evaluators and LLM-as-a-judge to Chapter 05.

## 2. Learning Objectives

By the end of this chapter, you should be able to:

- Explain the difference between an evaluation objective, a metric, and a threshold.
- Select metrics according to the task and the engineering decision.
- Calculate and interpret precision, recall, F1, exact match, and overlap-based scores.
- Explain the strengths and limitations of BLEU, ROUGE, and semantic similarity.
- Evaluate structured outputs using schema validity and field-level correctness.
- Distinguish factual correctness, grounding, and instruction compliance from surface similarity.
- Identify situations in which a single aggregate score is misleading.
- Combine complementary metrics without hiding important failure modes.
- Design a metric specification for an LLM application.

## 3. From Evaluation Objectives to Metrics

### 3.1 Objective, metric, and threshold are different

These three concepts serve different purposes.

| Concept | Meaning | Example |
|---|---|---|
| Evaluation objective | The property the team wants to assess. | Determine whether a support-ticket classifier identifies urgent security incidents. |
| Metric | A measurable quantity used as evidence about that property. | Recall for the security-incident class. |
| Acceptance threshold | A decision boundary applied to a metric or other evidence. | Require recall to exceed a specified minimum. |

A metric is not the objective itself. It is an operational measurement chosen to represent some part of the objective.

A threshold is also not a universal definition of quality. It reflects the requirements and risk tolerance of a particular application.

For example, two systems can have the same overall accuracy but different recall for security incidents. If missing a security incident is much more costly than incorrectly escalating an ordinary ticket, overall accuracy may not be the appropriate primary measure.

### 3.2 Metrics encode assumptions

Every metric emphasizes some properties and ignores others.

Exact match treats the expected output as a strict target. Token-overlap metrics reward shared words or sequences. Semantic similarity estimates relationships between representations. Classification metrics measure different aspects of positive and negative predictions.

These assumptions determine when a metric is useful.

A metric can be mathematically correct while being poorly suited to the engineering question. In that case, the score may be reliable as a calculation but misleading as evidence of system quality.

### 3.3 There is no universally best LLM metric

LLM applications perform different kinds of work:

- Classification assigns inputs to categories.
- Extraction produces structured fields.
- Summarization condenses information.
- Question answering produces responses to questions.
- Retrieval supplies relevant information.
- Tool-using systems select and execute actions.
- Conversational systems follow instructions across multiple turns.

These tasks do not share one common definition of correctness.

A useful evaluation design starts with the task's required behavior, selects metrics that measure relevant properties, and identifies important properties that still require separate inspection.

## 4. Classification Metrics

Classification metrics are useful when an LLM assigns categories, labels, or binary decisions.

Examples include routing support tickets, detecting prohibited content, classifying document types, and deciding whether a request should be escalated.

### 4.1 Confusion matrix

For a binary classifier, predictions can be grouped into four outcomes.

| | Predicted positive | Predicted negative |
|---|---:|---:|
| Actual positive | True positive (TP) | False negative (FN) |
| Actual negative | False positive (FP) | True negative (TN) |

Each outcome represents a different type of decision.

For a security-ticket classifier:

- **True positive:** A genuine security incident is correctly identified.
- **False negative:** A security incident is missed.
- **False positive:** An ordinary ticket is incorrectly flagged as a security incident.
- **True negative:** An ordinary ticket is correctly left unflagged.

The confusion matrix provides the counts needed to calculate several classification metrics.

### 4.2 Accuracy

Accuracy is the proportion of predictions that are correct.

\[
\text{Accuracy}=\frac{TP+TN}{TP+TN+FP+FN}
\]

Suppose 1,000 tickets contain 950 ordinary tickets and 50 security incidents. A classifier that predicts every ticket as ordinary achieves 95% accuracy.

Yet it detects none of the security incidents.

This illustrates why accuracy can be misleading when classes are imbalanced or when particular errors carry much greater consequences than others.

Accuracy remains useful when overall correctness is meaningful and the class distribution and error costs are appropriately considered.

### 4.3 Precision

Precision measures the proportion of predicted positive cases that are actually positive.

\[
\text{Precision}=\frac{TP}{TP+FP}
\]

High precision means that positive predictions are usually correct.

For a security-ticket classifier, high precision reduces the number of ordinary tickets unnecessarily sent for security review.

Precision matters when false positives create significant costs, such as unnecessary escalations, manual review, or blocked workflows.

### 4.4 Recall

Recall measures the proportion of actual positive cases that are correctly identified.

\[
\text{Recall}=\frac{TP}{TP+FN}
\]

High recall means that relatively few actual positive cases are missed.

For a security-ticket classifier, high recall helps ensure that genuine incidents are not overlooked.

Recall matters when false negatives are costly, such as missed security incidents, missed urgent requests, or undetected critical conditions.

### 4.5 F1 score

F1 combines precision and recall using their harmonic mean.

\[
F_1=2\cdot\frac{\text{Precision}\cdot\text{Recall}}{\text{Precision}+\text{Recall}}
\]

The harmonic mean penalizes cases in which one value is high and the other is low.

F1 can be useful when both precision and recall matter. However, it does not represent every operational trade-off, and it does not directly account for true negatives or the relative business costs of different errors.

A high F1 score should not replace inspection of precision and recall individually when their differences affect the application.

**Undefined cases require an explicit convention.** Precision is undefined when the classifier makes no positive predictions, because \(TP+FP=0\). Recall is undefined when the evaluation set contains no actual positive examples, because \(TP+FN=0\). In these cases, evaluation libraries may return zero, return an undefined value, or issue a warning, depending on their implementation and configuration.

When both precision and recall are zero, F1 is conventionally reported as zero in many implementations, although the exact behavior depends on the implementation's documented convention. If either component is undefined, F1 handling also depends on that convention.

Document how these cases are handled. Otherwise, differences in implementation can make results difficult to compare or aggregate.

### 4.6 Precision and recall are not interchangeable

Consider two systems:

- System A identifies most genuine incidents but also flags many ordinary tickets.
- System B flags fewer ordinary tickets but misses more genuine incidents.

System A may have higher recall, while System B may have higher precision.

Neither system is automatically better. The appropriate choice depends on the consequences of missed incidents versus unnecessary escalations.

This is why metric selection must follow the evaluation objective rather than precede it.

### 4.7 Macro, micro, and weighted averaging

For multiclass classification, precision, recall, and F1 can be aggregated in different ways.

- **Macro averaging:** Calculate the metric separately for each class and average the class-level results equally.
- **Micro averaging:** Aggregate the relevant prediction counts across classes before calculating the metric.
- **Weighted averaging:** Average class-level metrics using each class's support, typically the number of actual examples in that class.

Macro averaging gives rare classes more influence than support-weighted averaging. Weighted averaging reflects the class distribution more strongly. Micro averaging emphasizes aggregate prediction counts.

For ordinary single-label multiclass classification, micro-averaged precision, recall, and F1 equal accuracy when calculated over the same complete set of predictions.

The choice of averaging method can materially change the interpretation of results. Reports should state which method was used.

## 5. Exact Match and Exact Correctness

### 5.1 Exact match

Exact match measures whether a prediction matches its reference according to a defined comparison rule.

For a dataset of \(N\) examples:

\[
\text{Exact Match}=
\frac{\text{Number of exact matches}}{N}
\]

Consider a system expected to extract an invoice number:

- Reference: `INV-1042`
- Prediction: `INV-1042`

The prediction matches exactly.

If the prediction is `Invoice INV-1042`, a strict string comparison may mark it incorrect, even though a downstream parser might recover the correct value.

The result therefore depends on how exactness is defined.

### 5.2 Normalization rules matter

Before comparing outputs, decide whether transformations such as the following are permitted:

- Trimming whitespace.
- Normalizing letter case.
- Standardizing date formats.
- Removing irrelevant punctuation.
- Normalizing numeric representations.

Normalization should remove irrelevant differences without concealing meaningful errors.

For example, treating `00125` and `125` as equivalent may be acceptable for a numeric quantity but incorrect for an identifier whose leading zeros are significant.

### 5.3 When exact match is useful

Exact match is useful when outputs must follow a precise contract, such as:

- Selecting one label from a fixed set.
- Extracting an identifier that must be exact.
- Returning a prescribed enum value.
- Producing a specific machine-readable field.

It is less suitable when multiple responses can be equally correct, such as open-ended explanations, paraphrases, and summaries.

A strict metric can be appropriate even when it is unforgiving, provided that exactness is genuinely required by the application.

### 5.4 Exact match does not explain the failure

A failed comparison only tells us that the outputs differed under the selected comparison rule.

It does not establish whether the difference was caused by a semantic error, a formatting difference, a harmless paraphrase, or an incorrect reference.

When these distinctions matter, exact match should be accompanied by additional analysis.

## 6. Token-Overlap Metrics: BLEU and ROUGE

Token-overlap metrics compare generated text with one or more reference texts. They are useful for certain generation tasks, but their scores must be interpreted according to what they actually measure.

### 6.1 BLEU

BLEU, originally developed for machine translation evaluation, measures modified n-gram precision against reference text, with a brevity penalty.

An n-gram is a sequence of \(n\) tokens. For example, the sentence `the model generated a response` contains the bigrams:

- `the model`
- `model generated`
- `generated a`
- `a response`

BLEU rewards overlap between the candidate output and the reference while limiting the credit assigned to repeated matching n-grams. Its brevity penalty discourages outputs that are too short relative to the reference.

BLEU is most informative when reference wording and phrase overlap are meaningful signals, as in some translation evaluation settings.

It is less reliable as a standalone measure of open-ended answer quality because semantically correct paraphrases may share few n-grams with a reference.

### 6.2 ROUGE

ROUGE is a family of overlap-based metrics commonly used in summarization evaluation.

Common variants include:

- **ROUGE-N:** Measures n-gram overlap, often reported as recall.
- **ROUGE-L:** Uses the longest common subsequence between candidate and reference text.

ROUGE can indicate whether a generated summary preserves words or sequences present in a reference summary.

However, a summary may achieve strong overlap while omitting a critical fact, introducing an unsupported claim, or changing the meaning of a statement.

The precise interpretation also depends on the ROUGE variant and whether precision, recall, or F1 is reported.

### 6.3 What overlap metrics cannot establish

BLEU and ROUGE do not directly establish:

- Factual correctness.
- Logical consistency.
- Whether the response answers the actual question.
- Whether the output follows every instruction.
- Whether omitted information is important.
- Whether an unsupported claim has been introduced.

A generated response can be semantically correct with low lexical overlap, or lexically similar while being incorrect.

Therefore, overlap scores should be selected when lexical correspondence is relevant to the task, not simply because a metric is familiar or easy to compute.

## 7. Semantic Similarity Metrics

### 7.1 The motivation

Natural language allows many different wordings to express similar meanings.

For example:

- Reference: `The meeting was postponed until Friday.`
- Prediction: `The meeting has been moved to Friday.`

A strict string comparison would mark these as different. A semantic similarity measure may recognize that they express similar meanings.

Semantic similarity methods attempt to measure the closeness of text representations rather than requiring identical wording.

### 7.2 Embedding-based similarity

One common approach is to encode texts into vector representations and calculate a similarity score, often cosine similarity.

For vectors \(a\) and \(b\):

\[
\operatorname{cosine}(a,b)=
\frac{a\cdot b}{\|a\|\|b\|}
\]

The score reflects the angle between the vectors. Its interpretation depends on the embedding model and representation space; cosine similarity should not automatically be treated as a calibrated probability of correctness.

Embedding-based similarity can be useful for comparing paraphrases, candidate answers, or summaries when semantic relatedness is relevant.

### 7.3 Similarity is not correctness

Consider the reference:

`The medication should not be taken with alcohol.`

And the prediction:

`The medication should be taken with alcohol.`

These sentences share nearly all their words, but their meanings conflict because of a single negation.

A similarity metric may assign a high score despite this critical error.

Other risks include:

- Confusing topical relevance with a correct answer.
- Failing to detect a changed number, date, entity, or relationship.
- Giving credit to an answer that omits a necessary qualification.
- Depending heavily on the embedding model's learned representation.
- Using a threshold that has not been validated for the intended task.

Semantic similarity is therefore evidence of relatedness, not a universal substitute for correctness.

### 7.4 Calibrate similarity to the task

If semantic similarity is used to accept or reject outputs, choose its threshold using task-relevant examples.

Inspect both false acceptances and false rejections. A threshold that works for paraphrase comparison may be inappropriate for numerical answers, safety-critical statements, or structured extraction.

When the consequences of errors are significant, combine similarity with checks for critical entities, values, contradictions, or task-specific constraints.

## 8. Metrics for Structured Outputs

Many LLM applications require machine-readable output such as JSON, tool arguments, extracted fields, or records conforming to a schema.

For these applications, output quality has multiple dimensions.

### 8.1 Schema validity

Schema validity measures whether the output conforms to the required structure.

Depending on the contract, checks may include:

- Valid JSON syntax.
- Required fields.
- Correct field types.
- Allowed enum values.
- Required nesting.
- Prohibited additional fields.
- Valid formats for dates, identifiers, or other constrained values.

A basic validity rate can be calculated as:

\[
\text{Validity Rate}=
\frac{\text{Outputs passing the structural checks}}
{\text{Total evaluated outputs}}
\]

The denominator should be defined explicitly, including how timeouts, empty responses, and parsing failures are treated.

A syntactically valid JSON object is not necessarily valid against the intended schema. Likewise, schema-valid output is not necessarily semantically correct.

### 8.2 Field-level correctness

Field-level evaluation checks whether each extracted or generated value is correct according to a defined comparison rule.

For example:

```json
{
  "invoice_number": "INV-1042",
  "currency": "USD",
  "total": 125.50
}
```

An output may contain all required fields but still contain an incorrect invoice number or total.

Field-level evaluation can report:

- Correctness for each field.
- Exact-match rate for individual fields.
- Missing-field rate.
- Invalid-value rate.
- Incorrect or unsupported field rate.

Field-level scores help identify which parts of the output contract fail instead of reducing the entire record to a single success or failure.

### 8.3 Record-level correctness

Record-level evaluation checks whether the complete output satisfies the required conditions.

For strict extraction tasks, a record may be considered correct only if every required field is correct. In other applications, partial correctness may be useful.

The acceptance rule must be defined before evaluation.

For example, a record containing four correct fields and one incorrect financial amount should not automatically count as fully correct merely because most fields match.

### 8.4 Structural and semantic checks are complementary

Consider three outputs:

1. Invalid JSON that cannot be parsed.
2. Valid JSON with a missing required field.
3. Schema-valid JSON containing an incorrect value.

Each fails for a different reason.

A useful structured-output evaluation therefore distinguishes at least:

- Parsing success.
- Schema compliance.
- Field-level correctness.
- Record-level correctness.

Additional checks may be required for business rules, cross-field consistency, or evidence support.

The correct combination depends on what the consuming application requires.

## 9. Evaluating Factuality and Grounding

For tasks such as question answering, summarization, and document analysis, a response can be fluent and relevant while still containing unsupported or incorrect claims.

Factuality and grounding are related but distinct evaluation properties.

### 9.1 Factual correctness

Factual correctness concerns whether claims in the output are true according to the relevant evidence or accepted source of truth.

For example, if a model answers a question about a contract's effective date, the date must be correct. A plausible date is not sufficient.

The reference source matters. A factuality judgment should identify the evidence or authoritative information against which the claim is evaluated.

### 9.2 Grounding

Grounding concerns whether claims are supported by the information available to the system, such as supplied documents or retrieved passages.

A response can state something that happens to be true but is not supported by the provided context. Conversely, a response may accurately describe what a document says while the document itself contains an incorrect claim.

This creates an important distinction:

- **Factuality:** Is the claim correct according to the relevant source of truth?
- **Grounding:** Is the claim supported by the evidence the system was expected to use?

Depending on the task, both properties may matter.

### 9.3 Claim-level evaluation

For outputs containing multiple factual claims, evaluate claims individually when practical.

A response-level label such as `correct` or `incorrect` may hide important differences. One unsupported statement in a long answer may matter more than several correct but unimportant statements.

A claim-level assessment can distinguish:

- Supported claims.
- Contradicted claims.
- Unsupported claims.
- Claims that cannot be assessed from the available evidence.

The exact categories and aggregation rule should be defined for the application.

### 9.4 Why a single factuality score can mislead

A score may depend on how claims are extracted, weighted, and classified.

For example, counting all claims equally can give the same importance to a minor descriptive detail and a critical financial amount. A response-level average can also hide a severe error within an otherwise correct answer.

Where failure costs differ, evaluation should identify critical claims or use severity-aware reporting rather than relying exclusively on an undifferentiated average.

Specialized grounding implementations and retrieval-specific evaluation belong to the relevant retrieval and automated-evaluation chapters.

## 10. Evaluating Instruction Compliance

Instruction compliance concerns whether the system follows the requirements that govern the response.

These requirements may include:

- Required output format.
- Mandatory content.
- Prohibited content.
- Length restrictions.
- Language requirements.
- Ordering constraints.
- Explicit scope restrictions.
- Conditional requirements.

### 10.1 Convert instructions into observable criteria

A broad instruction such as `return a concise summary with exactly three bullet points and no recommendations` can be decomposed into checks:

1. The output contains a summary.
2. It contains exactly three bullet points.
3. It does not introduce recommendations.
4. It remains concise according to the application's defined expectation.

Some requirements are easy to verify deterministically. Others require interpretation.

For example, counting bullet points can be automated, while determining whether a sentence constitutes an unsolicited recommendation may require semantic judgment.

### 10.2 Deterministic and semantic compliance

Use deterministic checks where the requirement can be expressed precisely.

Examples include:

- Exact number of output fields.
- Required keys.
- Maximum length.
- Allowed values.
- Required language identifiers when reliably detectable.

Use semantic assessment for requirements whose correctness depends on meaning or context.

A response can satisfy every formatting constraint while violating the central instruction. Conversely, a semantically correct response may fail a strict format requirement that the downstream application depends on.

These dimensions should be evaluated separately when both matter.

### 10.3 Partial compliance and severity

Not all instruction violations have equal consequences.

Missing a preferred heading may be minor. Ignoring a mandatory output schema may break an integration. Violating a critical scope restriction may invalidate the response entirely.

A useful evaluation design records the relevant criteria and defines how partial compliance is aggregated.

Avoid a single binary label when it conceals failure severity that affects the engineering decision.

Chapter 07 covers comparison under controlled conditions; Chapter 05 addresses automated evaluation approaches for judgments that are not straightforward to verify with deterministic rules.

## 11. Composite Scores and Metric Selection

### 11.1 Why teams combine metrics

Real applications often have several quality requirements.

A structured extraction system may need to:

- Produce valid output.
- Extract correct values.
- Avoid unsupported claims.
- Follow the required output contract.
- Respond within an acceptable latency.

No single metric necessarily captures all these properties.

A composite score can summarize several measurements, but it introduces additional assumptions about their relative importance.

### 11.2 Weighted composite scores

Suppose an application defines a score from three normalized metrics:

\[
S=w_1M_1+w_2M_2+w_3M_3
\]

where \(M_1,M_2,M_3\) are metric values and the weights express their assigned importance.

If the weights sum to one, the result can be interpreted as a weighted average when the metric scales and aggregation assumptions make that interpretation appropriate.

However, a weighted average permits compensation: a strong result on one dimension can offset a weak result on another.

For example, excellent formatting scores might mathematically compensate for poor factual correctness even when factual errors are unacceptable.

The score would then conceal a critical weakness.

### 11.3 Use hard constraints when compensation is unacceptable

Some requirements should be treated as gates rather than weighted contributions.

For example:

- The output must pass schema validation.
- Critical claims must not contain a defined class of unacceptable errors.
- Mandatory instructions must be satisfied.
- A minimum recall requirement must be met for a high-risk category.

In such cases, a system may need to satisfy every critical constraint before its aggregate score is considered.

The appropriate design is often a combination of:

1. **Hard acceptance criteria** for non-negotiable requirements.
2. **Primary metrics** for the main objective.
3. **Diagnostic metrics** for understanding failure modes.
4. **Operational measurements** when latency, cost, or reliability affect the decision.

### 11.4 Avoid metric proliferation

More metrics do not automatically create better evaluation.

An excessively large metric set can produce conflicting signals, encourage selective reporting, and make it difficult to understand which evidence drives a decision.

Select metrics that answer distinct questions. For each one, document what it measures, why it matters, and what it fails to capture.

## 12. Cost, Latency, and Reliability as Evaluation Dimensions

Quality metrics alone may not be enough to evaluate a model or application for production use.

A system may improve answer quality while becoming substantially more expensive, slower, or less reliable.

### 12.1 Latency

Latency measures the time required to complete an operation.

Depending on the application, relevant measurements may include:

- Time to first token.
- Total response time.
- End-to-end application latency.
- Latency percentiles, such as p50 and p95.

The appropriate measure depends on the user experience and service requirements. Average latency alone can hide a slow tail that affects a significant minority of requests.

### 12.2 Cost

Cost may include model inference, input and output tokens, additional model calls, external services, and other execution resources.

For meaningful comparisons, define the unit of work. Cost per request, per successful task, and per thousand processed records answer different questions.

Cost per successful task can be particularly informative when systems have different failure or retry rates.

### 12.3 Reliability

Reliability concerns whether the system completes its required operation consistently.

Relevant measurements may include:

- Successful completion rate.
- Timeout rate.
- Error rate.
- Retry frequency.
- Valid-output rate.
- Task completion rate under defined conditions.

A response that is accurate when successfully generated may still be unsuitable if the application frequently times out or returns unusable output.

### 12.4 Evaluate trade-offs explicitly

Consider two configurations:

- Configuration A has slightly better task accuracy but higher latency and cost.
- Configuration B has slightly lower accuracy but consistently meets service requirements at a lower cost.

Neither is universally superior. The decision depends on the importance of the quality difference, the operational constraints, and the cost of failure.

Cost, latency, and reliability should be reported alongside quality metrics when they affect the intended decision. Deployment monitoring and production service-level management belong to the production engineering domain.

## 13. A Practical Metric-Selection Workflow

Use the following workflow when defining evaluation metrics for an LLM task.

### Step 1 — State the engineering decision

Write down what the evaluation will help the team decide.

Examples include whether to release a classifier, whether to replace an extraction model, or whether a new prompt improves answer quality.

### Step 2 — Define the required behavior

Translate the decision into observable properties.

For an extraction system, these may include exact values, schema compliance, and correct handling of missing information.

### Step 3 — Select a primary metric

Choose the metric most directly related to the main objective.

Examples:

- Recall for detecting important positive cases.
- Exact match for strict identifier extraction.
- ROUGE for reference-overlap analysis in summarization.
- Field-level correctness for structured extraction.

The selected metric must be appropriate for the task and its error costs.

### Step 4 — Add complementary diagnostic metrics

Identify weaknesses the primary metric may hide.

A classifier may require precision alongside recall. A structured-output task may require schema validity alongside field correctness. A summarization task may require factuality checks alongside overlap scores.

Each additional metric should answer a meaningful question.

### Step 5 — Define the comparison and acceptance rules

Specify:

- How each metric is calculated.
- How outputs are normalized.
- How missing, malformed, or failed responses are handled.
- Whether the metric is averaged across examples, categories, or other groups.
- Which requirements are hard constraints.
- What result is sufficient for the intended decision.

### Step 6 — Inspect failure cases

Do not rely exclusively on aggregate scores.

Inspect examples where the metric disagrees with human expectations, where critical requirements fail, or where different metrics produce conflicting conclusions.

These examples help establish whether the selected metrics measure the intended properties.

### Step 7 — Document limitations

Record what each metric does not measure and what conclusions cannot be drawn from it.

A metric specification should make it difficult for someone reading the report to mistake a proxy measurement for a complete definition of quality.

## 14. Common Metric-Selection Mistakes

### 14.1 Choosing a metric because it is familiar

A widely used metric may be inappropriate for the task.

**Correction:** Start from the objective and identify the property that must be measured.

### 14.2 Reporting only an aggregate score

An aggregate can hide a critical class, subgroup, or failure mode.

**Correction:** Report relevant class-level, field-level, or failure-category results alongside the overall metric.

### 14.3 Treating semantic similarity as correctness

Related meanings are not necessarily equivalent meanings.

**Correction:** Inspect important factual details, contradictions, and task-specific requirements.

### 14.4 Treating valid structure as valid content

A well-formed response may contain incorrect values.

**Correction:** Separate syntax, schema compliance, and semantic correctness.

### 14.5 Combining metrics without justification

Arbitrary weights can hide important weaknesses and make scores difficult to interpret.

**Correction:** Document the rationale for aggregation and use hard constraints when critical requirements cannot be traded away.

### 14.6 Changing evaluation rules between comparisons

Different normalization, filtering, or failure-handling rules can make metric results incomparable.

**Correction:** Keep the evaluation procedure consistent and record any changes. Controlled comparisons are covered in Chapter 07.

### 14.7 Assuming a score explains the cause of failure

A metric records an outcome under a defined measurement procedure. It does not automatically identify why the model failed.

**Correction:** Use error analysis and the appropriate diagnostic methods to investigate causes rather than inferring them from the score alone.

## 15. Practical Exercise — Design a Metric Specification

### Scenario

Your team is evaluating an LLM that extracts invoice data from uploaded documents.

The application must return:

- Invoice number.
- Invoice date.
- Currency.
- Total amount.
- Supplier name.

Some documents contain missing fields, inconsistent date formats, scanned images, or multiple totals.

The team currently reports only whether the generated JSON parses successfully.

### Task

Create a metric specification that covers the following.

1. **Evaluation objective:** What decision will the evaluation support?
2. **Primary metric:** Which metric most directly measures the main task requirement, and why?
3. **Structural validity:** How will parsing and schema compliance be measured?
4. **Field-level correctness:** How will each extracted value be compared with its reference?
5. **Missing fields:** How will legitimately absent values be distinguished from extraction failures?
6. **Normalization:** Which transformations are allowed for dates, currencies, amounts, and identifiers?
7. **Aggregate reporting:** How will field-level results be summarized without hiding critical failures?
8. **Hard constraints:** Which failures must prevent acceptance regardless of the overall score?
9. **Operational dimensions:** Which latency, cost, or reliability measurements matter for the intended use?
10. **Limitations:** What important properties will the selected metrics not establish?

Do not implement the full evaluator yet. The purpose is to design a measurement approach that another engineer can implement consistently.

### Review checklist

A strong specification:

- Connects each metric to an explicit requirement.
- Separates structural validity from semantic correctness.
- Defines field-specific comparison rules.
- Handles missing and malformed outputs explicitly.
- Avoids allowing harmless normalization to conceal meaningful errors.
- Reports important failures instead of relying solely on an aggregate.
- Defines acceptance criteria before comparing systems.
- Documents metric limitations and unresolved assumptions.

The exercise is complete when another engineer can implement the specification without inventing the metric definitions or acceptance rules.

## 16. Summary

Evaluation metrics convert observed outputs into measurable evidence, but each metric captures only particular properties of system behavior.

The core principles are:

- Define the evaluation objective before selecting metrics.
- Match classification metrics to the relevant error costs.
- Use exact match when strict equality is part of the requirement.
- Interpret BLEU and ROUGE as overlap-based measurements, not universal measures of correctness.
- Treat semantic similarity as evidence of relatedness rather than proof of equivalence.
- Separate structured-output validity from field-level and record-level correctness.
- Distinguish factual correctness from grounding.
- Measure instruction compliance using explicit criteria.
- Combine metrics carefully and use hard constraints when critical failures cannot be compensated for.
- Include cost, latency, and reliability when they influence the engineering decision.
- Inspect failure cases and document what the selected metrics cannot establish.

A good evaluation metric is not merely easy to calculate. It is a defensible measurement of a property that matters for the intended engineering decision.

## 17. Connections to Other Chapters

- **Chapter 01 — Evaluation Foundations and Objectives:** Establishes the evaluation question and success criteria that guide metric selection.
- **Chapter 02 — Evaluation Dataset Design and Data Integrity:** Covers the quality, coverage, integrity, and provenance of evaluation data.
- **Chapter 04 — Human Evaluation and Rubric Design:** Develops human judgment methods, annotation rubrics, and disagreement handling.
- **Chapter 05 — Automated Evaluation and LLM-as-a-Judge:** Covers automated evaluators, judge design, and evaluator validation.
- **Chapter 06 — Task-Specific and Application-Level Evaluation:** Applies measurement principles to complete tasks and applications.
- **Chapter 07 — Benchmarking and Controlled Model Comparison:** Covers controlled comparisons and benchmark interpretation.
- **Chapter 08 — Experimental Design and Statistical Interpretation:** Covers uncertainty, sample-size reasoning, and statistical interpretation.
- **Chapter 09 — Reproducible Evaluation Workflows and Practical Lab:** Integrates metrics into a reproducible evaluation workflow.
- **LLM-07 — Observable Model Behavior and Failure Analysis:** Provides the behavioral context for interpreting observed failures without treating metrics alone as causal explanations.
- **RET — Retrieval Engineering:** Owns retrieval-specific metrics and evaluation of retrieval components.
- **AGT — Agent Engineering:** Owns specialized evaluation of tool use, action selection, and agent trajectories.
- **PROD — Production AI Engineering:** Owns production serving, operational monitoring, and deployment controls.

## 18. Knowledge Check

Answer these questions in your own words:

1. What is the difference between an evaluation objective, a metric, and an acceptance threshold?
2. Why can a classifier with high accuracy still be unsuitable for a high-risk application?
3. When is exact match more appropriate than semantic similarity?
4. What do BLEU and ROUGE measure, and what important properties do they fail to establish?
5. Why can schema-valid JSON still be an incorrect result?
6. How do factual correctness and grounding differ?
7. Why can a weighted composite score conceal a critical failure?
8. When should a requirement be represented as a hard constraint rather than a weighted metric?
9. Why should cost, latency, and reliability sometimes be reported alongside task quality?
10. What information must be documented so another engineer can interpret and reproduce a metric result?

If you cannot explain the assumptions and limitations of the metrics you select, revisit the relevant sections before proceeding to human evaluation and rubric design.
