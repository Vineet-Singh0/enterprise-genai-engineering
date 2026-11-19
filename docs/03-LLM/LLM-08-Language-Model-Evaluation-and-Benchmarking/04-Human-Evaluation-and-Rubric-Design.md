# 04 — Human Evaluation and Rubric Design

## 1. Purpose

Many important properties of LLM outputs cannot be assessed reliably through exact string comparison or simple automated checks.

A response may be factually correct but difficult to understand. A summary may preserve the main conclusions while omitting a critical detail. An answer may follow the requested format while failing to address the user's actual question.

Human evaluation provides a way to assess these qualities using explicit criteria, structured judgments, and controlled review procedures.

However, human judgment is not automatically reliable. Evaluators may interpret instructions differently, apply inconsistent standards, favor particular writing styles, or disagree about what constitutes a good response.

The central engineering question is:

> How can human judgment be converted into consistent, defensible evidence about LLM quality?

This chapter explains how to design evaluation rubrics, select human evaluation methods, establish annotation guidelines, calibrate evaluators, manage disagreement, and assess the reliability of human judgments.

The focus is on human evaluation methodology. Metric definitions belong to Chapter 03, automated evaluators and LLM-as-a-judge to Chapter 05, and statistical interpretation of experimental results to Chapter 08.

## 2. Learning Objectives

By the end of this chapter, you should be able to:

- Explain when human evaluation is necessary and when it is unnecessary.
- Translate qualitative requirements into observable evaluation criteria.
- Design rubrics with clear dimensions, rating scales, and decision rules.
- Distinguish absolute rating, pairwise comparison, and ranking.
- Write annotation guidelines that reduce ambiguity.
- Calibrate evaluators before large-scale annotation.
- Interpret evaluator disagreement without assuming that one person is always correct.
- Use agreement measurements appropriately.
- Identify common human-evaluation biases.
- Design an auditable human-evaluation workflow.
- Create a practical rubric for evaluating an LLM application.

## 3. Why Human Evaluation Is Necessary

### 3.1 Some quality properties require judgment

Many LLM tasks involve outputs whose quality cannot be determined by checking exact equality.

Consider a question-answering system that produces this response:

> The account can be restored by resetting the password through the account recovery page.

The response may be understandable, relevant, and concise. But whether it is a good answer also depends on the question, the available evidence, the user's needs, and any constraints imposed on the system.

A purely lexical metric cannot establish all these properties.

Human evaluation is particularly useful when assessing:

- Helpfulness and relevance.
- Clarity and readability.
- Completeness.
- Coherence.
- Appropriate handling of ambiguity.
- Quality of explanations.
- Whether the response satisfies the user's actual intent.
- Whether an answer is preferable when multiple responses are acceptable.

The need for human judgment depends on the task. If a requirement can be checked precisely and reliably with deterministic validation, human review may be unnecessary for every example.

### 3.2 Human evaluation is not a replacement for automated checks

Human judgments and automated checks serve complementary purposes.

| Evaluation need | Suitable approach |
|---|---|
| Valid JSON syntax | Deterministic parsing |
| Required fields are present | Schema validation |
| Exact identifier extraction | Exact comparison |
| Clarity of an explanation | Human judgment using defined criteria |
| Preference between two valid responses | Human pairwise comparison |
| Compliance with a precisely defined length limit | Automated validation |
| Whether an answer is sufficiently complete for a complex question | Human judgment using a rubric |

Some tasks require a combination of methods. For example, an evaluator may check JSON validity automatically and then assess the correctness and usefulness of the extracted values.

The goal is not to make every evaluation human-driven. It is to use human judgment where it provides evidence that simpler checks cannot provide adequately.

### 3.3 Human judgment is itself a measurement process

A human rating is not a direct, infallible observation of quality.

It is produced by an evaluator applying a set of instructions to an example under particular conditions.

The result can be affected by:

- Ambiguous evaluation criteria.
- Differences in evaluator expertise.
- Fatigue and attention.
- Missing context.
- Presentation order.
- Knowledge of which system produced an answer.
- Personal preferences and expectations.

Consequently, a human-evaluation result should be treated as evidence whose reliability depends on the quality of the evaluation design.

## 4. From Qualitative Requirements to Observable Criteria

### 4.1 Why broad criteria are insufficient

Consider the criterion:

> Rate how good the answer is.

Different evaluators may interpret *good* as accurate, detailed, concise, friendly, complete, or persuasive.

One evaluator may reward a long answer because it includes more information. Another may prefer a short answer because it is easier to use.

Both may be applying reasonable personal preferences, but their ratings are not necessarily comparable.

A useful rubric makes the intended meaning of quality explicit.

### 4.2 Decompose quality into dimensions

A dimension represents one property of the output that matters to the evaluation objective.

For a customer-support assistant, relevant dimensions might include:

- **Correctness:** Is the response accurate according to the available evidence?
- **Relevance:** Does it address the user's actual question?
- **Completeness:** Does it cover the information needed to resolve the request?
- **Clarity:** Can the intended user understand the response?
- **Instruction compliance:** Does it follow the required constraints?

Not every task needs all these dimensions. Adding irrelevant dimensions increases annotation effort without necessarily improving the decision.

Select dimensions according to the task requirements and the consequences of failure.

### 4.3 Define observable evidence

Each dimension should describe what evaluators must inspect.

For example, instead of asking whether an answer is *complete*, define completeness in terms of whether it includes the information necessary to answer the user's question, including any explicitly required steps or qualifications.

Instead of asking whether an answer is *clear*, describe whether its wording and organization allow the intended audience to understand the main point without unnecessary ambiguity.

Observable criteria do not eliminate judgment. They constrain the judgment to the property the team intends to measure.

### 4.4 Separate dimensions that answer different questions

A common mistake is combining multiple properties into one rating.

For example:

> Rate the response for accuracy, clarity, and helpfulness.

A response may be accurate but difficult to understand. Another may be clear but incorrect. A single rating does not reveal which property caused the result.

Separate dimensions when their differences would change the engineering decision.

However, do not create a separate dimension for every minor preference. The rubric should be detailed enough to distinguish important failure modes without becoming impractical to apply.

## 5. Rubric Design

A rubric defines how evaluators should translate observed output characteristics into judgments.

A practical rubric includes:

1. Evaluation dimension.
2. Definition of the dimension.
3. Rating scale.
4. Description of each rating level.
5. Relevant examples or boundary cases.
6. Rules for missing information, ambiguity, and non-applicable criteria.
7. Instructions for recording evidence or explanations when needed.

### 5.1 Rating scales

A rating scale defines the possible judgments.

Common choices include:

- Binary: pass or fail.
- Ordinal: an ordered scale such as 1–4.
- Comparative: response A is better, response B is better, or the responses are equivalent.
- Categorical: a predefined label such as correct, partially correct, incorrect, or insufficient evidence.

Choose the scale that matches the decision.

Binary ratings are simple but may hide meaningful differences between acceptable and unacceptable responses. A detailed scale can capture more nuance, but only if evaluators can distinguish its levels consistently.

### 5.2 Define every rating level

Consider a rubric for answer completeness.

| Rating | Definition |
|---|---|
| 1 — Incomplete | Omits essential information required to answer the question. |
| 2 — Partially complete | Covers the main issue but omits an important detail or qualification. |
| 3 — Complete | Includes the information needed to answer the question without a material omission. |

This scale is more useful than simply asking evaluators to choose a number from 1 to 3.

The descriptions establish the distinctions the evaluator must apply.

For high-impact evaluations, add examples showing how borderline responses should be rated. Examples should clarify the criteria rather than prescribe the preferred wording.

### 5.3 Avoid vague or overlapping levels

A rubric becomes difficult to apply when its categories overlap.

For example, if *mostly correct* and *largely correct* have no defined difference, evaluators may use them interchangeably.

Similarly, a scale with too many levels may create distinctions that evaluators cannot reliably make.

Each level should represent a meaningful difference in the property being assessed.

### 5.4 Define how dimensions are combined

A response may receive different ratings across dimensions.

For example:

| Dimension | Rating |
|---|---:|
| Correctness | 3 |
| Relevance | 3 |
| Completeness | 2 |
| Clarity | 3 |

The team must decide whether these ratings remain separate, are summarized into an overall score, or are used with hard acceptance criteria.

An average can conceal a critical weakness. If correctness is mandatory, excellent clarity should not compensate for an incorrect answer.

Define the aggregation rule before evaluating the system. When a dimension is a non-negotiable requirement, use an explicit acceptance rule rather than assuming an overall average will enforce it.

## 6. Human Evaluation Methods

Different evaluation methods answer different questions. The method should follow the decision being made.

### 6.1 Absolute rating

In absolute rating, evaluators assess each response against a fixed rubric.

For example, an evaluator might rate a response's correctness, completeness, and clarity independently.

**Advantages:**

- Provides information about individual quality dimensions.
- Allows evaluation against explicit acceptance criteria.
- Supports analysis of recurring weaknesses.
- Makes it possible to compare results across versions when the rubric and conditions remain stable.

**Limitations:**

- Evaluators may interpret scale levels differently.
- Ratings can be influenced by personal use of the scale.
- Small differences between ordinal ratings may not represent equal differences in quality.

Absolute ratings are useful when the team needs to know whether responses satisfy defined requirements, not merely which of two responses is preferred.

### 6.2 Pairwise comparison

In pairwise comparison, an evaluator compares two responses to the same input and chooses the preferred response according to a defined criterion.

For example:

- Response A is better.
- Response B is better.
- Both are equivalent.
- Neither response is acceptable.

The available options depend on the evaluation design.

Pairwise comparison is useful when deciding whether a new model, prompt, or configuration produces better responses than an existing baseline.

It can be easier to judge which response is better than to assign an absolute score to each response independently.

However, pairwise comparison does not automatically establish that either response meets the required quality standard. A system can win a comparison while both candidates remain unacceptable.

The comparison criterion must also be explicit. A response that is more detailed is not necessarily more correct or more useful.

### 6.3 Ranking

Ranking asks evaluators to order multiple responses according to a defined criterion.

For example, an evaluator may rank four answers from best to worst for usefulness.

Ranking can provide a broader comparison when several candidates are being considered, but it increases the cognitive burden of each evaluation.

It also forces distinctions between candidates that may be effectively equivalent. If ties are meaningful, the procedure should allow them where appropriate.

### 6.4 Choosing the method

| Engineering question | Suitable method |
|---|---|
| Does this response meet a defined quality requirement? | Absolute rating or criterion-based pass/fail |
| Is the new response preferable to the baseline? | Pairwise comparison |
| Which of several candidate systems should be investigated further? | Pairwise comparisons or ranking |
| Which quality dimension causes the most failures? | Separate absolute ratings by dimension |
| Does the response satisfy a mandatory structural contract? | Deterministic validation, with human review only where needed |

Methods can be combined. For example, pairwise comparison can identify a preferred configuration, while absolute ratings determine whether the preferred configuration meets the minimum acceptance requirements.

## 7. Annotation Guidelines and Evaluator Preparation

### 7.1 Annotation guidelines make the rubric usable

A rubric defines the criteria; annotation guidelines explain how to apply them consistently.

Guidelines should clarify:

- What information evaluators may use.
- Whether external sources are permitted.
- How to handle incomplete context.
- How to treat multiple acceptable answers.
- How to distinguish a factual error from a missing detail.
- How to handle ambiguous or contradictory evidence.
- When to use an uncertain or not-applicable label.
- What evidence or explanation must be recorded.

Without these rules, evaluators may follow different procedures even when they receive the same rubric.

### 7.2 Provide positive, negative, and borderline examples

Examples help evaluators understand how the criteria apply in practice.

A useful annotation guide can include:

- A clearly acceptable response.
- A clearly unacceptable response.
- A borderline response.
- An example where the available evidence is insufficient.
- An example where two different answers are both acceptable.

Borderline examples are particularly valuable because they expose ambiguities that simple positive and negative examples may not reveal.

### 7.3 Calibrate before large-scale evaluation

Calibration is the process of aligning evaluators' understanding of the rubric before they annotate the main dataset.

A practical process is:

1. Provide the rubric and annotation guidelines.
2. Ask evaluators to rate a shared set of representative examples independently.
3. Compare their judgments.
4. Identify disagreements and ambiguous criteria.
5. Discuss the evidence and intended interpretation.
6. Revise the guidelines where necessary.
7. Repeat the exercise on new examples to check whether the revisions improve consistency.

Calibration should not merely teach evaluators to copy a preferred answer key. The objective is to establish a shared and defensible interpretation of the criteria.

### 7.4 Use pilot evaluation to find design defects

A small pilot can reveal problems before substantial annotation effort is spent.

Look for:

- Rating categories that are difficult to distinguish.
- Instructions that require information unavailable to evaluators.
- Excessive use of uncertain or not-applicable labels.
- Unexpected disagreement on apparently straightforward examples.
- Evaluation tasks that take too long to complete.
- Criteria that do not affect the intended engineering decision.

Revise the evaluation design when the pilot reveals systematic ambiguity. Then record the rubric version used for the main evaluation.

## 8. Evaluator Disagreement and Agreement

### 8.1 Disagreement is evidence to investigate

Two evaluators may assign different ratings to the same response.

This disagreement can arise because:

- The rubric is ambiguous.
- The response genuinely lies near a decision boundary.
- Evaluators have different interpretations of the task.
- One evaluator overlooked relevant evidence.
- The available evidence does not support a confident judgment.
- The task permits several reasonable interpretations.

Disagreement does not automatically mean that one evaluator is wrong.

It is a signal that should be investigated in the context of the rubric, the task, and the evidence.

### 8.2 Agreement is not the same as correctness

Evaluators can agree because the rubric is clear and the response is straightforward. They can also agree while consistently applying an incorrect criterion.

Agreement measures consistency between judgments. It does not, by itself, establish that the judgments reflect the intended quality property.

A reliable evaluation therefore needs both a well-designed rubric and evidence that evaluators apply it consistently.

### 8.3 Percentage agreement

Percentage agreement measures the proportion of examples for which evaluators assign the same label.

For two evaluators rating \(N\) examples:

\[
\text{Agreement Rate} =
\frac{\text{Number of matching judgments}}{N}
\]

Suppose two evaluators agree on 90 out of 100 examples. Their observed agreement rate is 90%.

This is easy to interpret, but it does not account for the level of agreement that might occur by chance. It can also hide important differences in rare categories.

Use percentage agreement as a descriptive measure, not as a complete assessment of annotation reliability.

### 8.4 Chance-adjusted agreement

Cohen's kappa is one measure of agreement between two evaluators assigning categorical labels. It adjusts observed agreement using the agreement expected from their marginal label distributions.

\[
\kappa = \frac{p_o-p_e}{1-p_e}
\]

where:

- \(p_o\) is the observed agreement.
- \(p_e\) is the agreement expected under the measure's chance model.

Kappa can be useful for categorical annotations, but it should not be interpreted without considering the task, label distribution, and evaluation design.

Other measures may be more appropriate for multiple evaluators, ordinal ratings, or different missing-data patterns. The selected agreement measure should match the structure of the annotations.

No single agreement threshold is universally appropriate for every task.

### 8.5 Ordinal ratings require care

A rubric may use ordered categories such as poor, acceptable, and excellent.

These labels have an order, but the distance between adjacent levels is not necessarily equal.

For example, the difference between poor and acceptable may not be equivalent to the difference between acceptable and excellent.

When the order and distance assumptions matter, select an agreement measure that reflects the scale's properties rather than treating every disagreement as identical.

### 8.6 Adjudication

Adjudication is the process of resolving selected disagreements through a defined review procedure.

A practical workflow may involve:

1. Identifying examples where evaluators disagree.
2. Reviewing the applicable rubric and evidence.
3. Asking a trained reviewer to determine the appropriate outcome.
4. Recording the reason for the decision.
5. Updating the guidelines if the disagreement reveals a general ambiguity.

Adjudication can produce a final label for downstream analysis, but it should not erase the original disagreement records.

Preserving initial judgments makes it possible to examine evaluator consistency and identify recurring problems.

## 9. Human-Evaluation Biases and Failure Modes

### 9.1 Position and presentation bias

Evaluators may prefer the first response, the longer response, or the response with more polished formatting.

In pairwise comparisons, response order can influence preference independently of actual quality.

Mitigations include:

- Randomizing or counterbalancing presentation order.
- Applying consistent formatting.
- Avoiding unnecessary visual cues.
- Reviewing whether preference changes when presentation order changes.

### 9.2 Length and verbosity bias

A detailed response may appear more helpful even when it contains redundant or unsupported information.

Conversely, a concise answer may be penalized even when it directly satisfies the request.

The rubric should evaluate completeness and relevance rather than rewarding length by default.

### 9.3 Brand and identity bias

Knowledge of the model or system producing a response can influence ratings.

If practical, hide system identity during evaluation when it is not necessary to judge the output. This is often called blinded evaluation.

Blinding is not always possible, and output characteristics may reveal the source. Still, reducing irrelevant identity information can limit some sources of bias.

### 9.4 Confirmation bias

Evaluators may favor a system they expect to perform well or interpret ambiguous evidence in support of an existing belief.

Mitigations include:

- Using predefined criteria.
- Keeping evaluators unaware of the preferred system when practical.
- Recording evidence for important judgments.
- Reviewing disagreements systematically.
- Separating evaluation outcomes from assumptions about the model's reputation.

### 9.5 Fatigue and inconsistent attention

Long annotation sessions can reduce concentration and increase inconsistency.

Consider task duration, breaks, workload, and the complexity of individual examples. Monitor completion times and unusual changes in rating patterns where appropriate.

Very short completion times may indicate superficial annotation, while very long times may indicate unclear instructions or difficult cases. Neither pattern proves poor evaluation by itself, but both can justify investigation.

### 9.6 Unclear criteria and evaluator drift

Evaluator drift occurs when the interpretation of the rubric changes over time.

For example, an evaluator may gradually become more lenient or begin applying a different standard after seeing many examples.

Mitigations include:

- Maintaining versioned guidelines.
- Using calibration examples periodically.
- Reviewing a subset of annotations.
- Tracking disagreement and rating distributions over time.
- Recalibrating when a material change in interpretation is detected.

## 10. Designing an Auditable Human-Evaluation Workflow

A practical human-evaluation process should preserve enough information to explain how judgments were produced.

### 10.1 Define the evaluation protocol

Before annotation begins, document:

- Evaluation objective.
- Target population and dataset version.
- Evaluation dimensions.
- Rubric and annotation-guideline versions.
- Evaluator qualifications or required expertise.
- Presentation and blinding procedures.
- Number of evaluators per example, where applicable.
- Rules for uncertainty, missing evidence, and adjudication.
- Required records and reporting outputs.

Dataset construction itself is covered in Chapter 02. This section focuses on the protocol for applying human judgment to that dataset.

### 10.2 Preserve the original judgments

For each evaluated example, retain the information necessary to understand the result, subject to applicable privacy and retention requirements.

Depending on the workflow, records may include:

- Example identifier.
- Evaluator identifier or pseudonymous reference.
- Rubric version.
- Individual dimension ratings.
- Pairwise preference or ranking.
- Optional rationale or evidence.
- Uncertainty or not-applicable labels.
- Adjudication outcome, if any.
- Annotation timestamp or evaluation batch.

Do not collect personal information that is unnecessary for the evaluation.

### 10.3 Report more than the final aggregate

A human-evaluation report should make the judgment process visible enough to interpret the result.

Depending on the objective, report:

- Rating distributions.
- Dimension-level results.
- Pairwise preference proportions.
- Agreement measures.
- Missing or uncertain judgments.
- Adjudication frequency.
- Important disagreements and their causes.
- Rubric limitations.

A single average score may hide differences between evaluators, dimensions, or categories of inputs.

### 10.4 Keep protocol changes explicit

If the rubric changes during evaluation, record which examples were rated under each version.

A revised rubric may improve consistency, but results produced under different rules are not automatically comparable.

When a change materially affects interpretation, reassess the affected examples or report the results separately.

The broader requirements for recording model configurations, datasets, and evaluation runs are covered in Chapter 09.

## 11. Practical Exercise — Build a Human-Evaluation Rubric

### Scenario

Your team is evaluating an LLM-powered customer-support assistant.

The assistant receives a customer question and produces a response based on supplied support documentation.

The team wants to assess whether responses are useful enough to present to customers. Automated checks can verify the output format, but they cannot fully determine whether the answer is clear, complete, and appropriate.

### Task

Create a human-evaluation rubric that includes:

1. **Evaluation objective:** State the decision the evaluation will support.
2. **Evaluation dimensions:** Select a small set of relevant quality dimensions.
3. **Dimension definitions:** Explain what evaluators should assess for each dimension.
4. **Rating scale:** Define the available rating levels and the meaning of each level.
5. **Evidence requirements:** State what information evaluators may use when judging correctness and support.
6. **Ambiguous cases:** Explain how evaluators should handle insufficient evidence or multiple acceptable answers.
7. **Calibration set:** Select examples that include clear successes, clear failures, and borderline cases.
8. **Disagreement handling:** Define when disagreement requires discussion or adjudication.
9. **Bias controls:** Identify practical steps to reduce position, identity, or verbosity bias.
10. **Reporting:** Specify how ratings, disagreements, and limitations will be reported.

Keep the rubric small enough to apply consistently. Do not add dimensions merely because they sound useful; each dimension should connect to an evaluation requirement.

### Review checklist

A strong rubric:

- Uses clearly defined and distinct dimensions.
- Describes observable differences between rating levels.
- Avoids vague terms without operational definitions.
- Includes examples for ambiguous or borderline cases.
- Specifies how insufficient evidence is handled.
- Supports calibration and systematic disagreement analysis.
- Separates individual ratings from adjudicated outcomes.
- Defines reporting that does not conceal disagreement behind a single average.
- Records the rubric version and relevant evaluation conditions.

The exercise is complete when two evaluators can independently apply the rubric to the same examples and explain their judgments using the documented criteria.

## 12. Common Human-Evaluation Mistakes

### 12.1 Using a vague overall-quality question

A broad question invites evaluators to apply their personal definition of quality.

**Correction:** Define the relevant dimensions and the evidence that supports each rating.

### 12.2 Treating evaluator consensus as ground truth

A majority vote can still produce an incorrect or biased result.

**Correction:** Examine the evidence, validate the rubric, and preserve meaningful disagreement.

### 12.3 Using too many rubric dimensions

A large rubric increases annotation effort and may create overlapping criteria.

**Correction:** Retain dimensions that materially affect the engineering decision.

### 12.4 Ignoring uncertain cases

Forcing evaluators to choose a definite label when evidence is insufficient can introduce false confidence.

**Correction:** Define uncertainty or not-applicable options and establish how those cases will be handled in analysis.

### 12.5 Adjudicating every disagreement without investigation

Resolving disagreements can produce a single final label, but repeated disagreement may indicate a defective rubric.

**Correction:** Investigate disagreement patterns and revise the rubric when the criteria themselves are unclear.

### 12.6 Reporting only average ratings

An average may conceal polarized judgments or critical failures in a particular dimension.

**Correction:** Report distributions, dimension-level results, and agreement information where relevant.

### 12.7 Changing the rubric without recording it

Untracked changes can make results difficult to reproduce and compare.

**Correction:** Version the rubric and document which rules applied to each evaluation batch.

## 13. Summary

Human evaluation provides evidence about qualities that cannot always be measured adequately through exact comparison or deterministic checks.

Its reliability depends on the evaluation design, not merely on the presence of human reviewers.

The core principles are:

- Use human judgment when the target quality requires interpretation.
- Translate qualitative requirements into distinct, observable dimensions.
- Define rating levels with explicit criteria and examples.
- Choose absolute rating, pairwise comparison, or ranking according to the decision.
- Prepare evaluators through calibration and pilot evaluation.
- Treat disagreement as evidence to investigate rather than automatically as error.
- Distinguish agreement from correctness.
- Select agreement measures that match the annotation structure.
- Reduce avoidable bias through appropriate presentation, blinding, and workload controls.
- Preserve original judgments, rubric versions, and adjudication records.
- Report rating distributions and important limitations rather than relying exclusively on averages.

Human evaluation becomes an engineering measurement process when the criteria, procedures, and evidence are explicit enough to inspect, reproduce, and improve.

## 14. Connections to Other Chapters

- **Chapter 01 — Evaluation Foundations and Objectives:** Establishes the evaluation question and the quality properties that matter.
- **Chapter 02 — Evaluation Dataset Design and Data Integrity:** Covers the quality, coverage, and provenance of evaluation examples.
- **Chapter 03 — Metrics for Language Model Evaluation:** Defines automated and quantitative metrics that complement human judgments.
- **Chapter 05 — Automated Evaluation and LLM-as-a-Judge:** Covers automated evaluators, judge design, and validation.
- **Chapter 06 — Task-Specific and Application-Level Evaluation:** Applies evaluation methods to complete tasks and applications.
- **Chapter 07 — Benchmarking and Controlled Model Comparison:** Covers controlled comparisons and benchmark interpretation.
- **Chapter 08 — Experimental Design and Statistical Interpretation:** Covers uncertainty and the interpretation of experimental results.
- **Chapter 09 — Reproducible Evaluation Workflows and Practical Lab:** Integrates human ratings and other evaluation artifacts into reproducible workflows.
- **LLM-07 — Observable Model Behavior and Failure Analysis:** Provides context for identifying and interpreting observed behavior without assuming a rating establishes its cause.
- **RET — Retrieval Engineering:** Owns specialized evaluation of retrieval components and evidence retrieval.
- **AGT — Agent Engineering:** Owns specialized evaluation of tool use, action selection, and agent trajectories.
- **PROD — Production AI Engineering:** Owns production monitoring and operational controls.

## 15. Knowledge Check

Answer these questions in your own words:

1. Why is human evaluation necessary for some LLM tasks but unnecessary for others?
2. What makes an evaluation criterion observable and operational?
3. When would you choose pairwise comparison instead of absolute rating?
4. Why should correctness and clarity often be evaluated separately?
5. What is calibration, and how does it improve evaluation consistency?
6. Why does evaluator agreement not prove that the judgments are correct?
7. What does percentage agreement measure, and what does it fail to account for?
8. How should a team respond when evaluators repeatedly disagree on borderline cases?
9. Which biases can affect pairwise comparison, and how can they be reduced?
10. What records should be preserved to make a human-evaluation result auditable?

If you cannot explain how the rubric controls evaluator judgment and how disagreement affects the reliability of the results, revisit the relevant sections before proceeding to automated evaluation and LLM-as-a-judge.
