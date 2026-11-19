# 02 — Evaluation Dataset Design and Data Integrity

## 1. Purpose

An evaluation result is only as trustworthy as the data and conditions used to produce it.

A model may achieve a high score on an evaluation dataset while performing poorly on the inputs that matter in practice. This can happen when the dataset is too narrow, contains incorrect reference answers, overrepresents easy examples, overlaps with development data, or fails to reflect the intended application.

Evaluation dataset design addresses a fundamental engineering question:

> Does the evaluation data provide credible evidence about how the system performs on the tasks and inputs that matter?

This chapter explains how to define an evaluation dataset, select representative examples, maintain reference quality, prevent data leakage and benchmark contamination, and preserve data integrity throughout the evaluation lifecycle.

The focus is on the design and reliability of evaluation data. Metric selection belongs to Chapter 03, human assessment methods to Chapter 04, and experimental interpretation to Chapter 08.

## 2. Learning Objectives

By the end of this chapter, you should be able to:

- Explain how dataset quality affects evaluation conclusions.
- Define the target population and intended use of an evaluation dataset.
- Design datasets that cover relevant inputs, categories, and difficult cases.
- Distinguish training, validation, development, and final test data by purpose.
- Identify data leakage, test-set overfitting, and training-data contamination risks.
- Assess the quality and ambiguity of reference answers and labels.
- Recognize sampling bias, duplicates, and distribution mismatch.
- Version evaluation datasets and preserve their provenance.
- Document dataset limitations and their implications for evaluation results.
- Create a practical dataset specification for an LLM evaluation.

## 3. Why Evaluation Dataset Design Matters

### 3.1 A score describes the tested examples

An evaluation score summarizes performance under a particular evaluation setup. It does not automatically describe performance on every possible input.

Suppose a support-ticket classifier is evaluated on 500 tickets, most of which concern password resets and account access. The resulting score may look strong, but the dataset may contain few billing disputes, account-security incidents, or ambiguous requests.

If the production workload contains those underrepresented categories, the evaluation may provide an incomplete picture of expected performance.

The issue is not necessarily that the model is poor. The issue is that the dataset may not support the breadth of the conclusion being made.

A useful principle is:

**The scope of an evaluation claim must not exceed the scope of the evidence provided by its dataset.**

### 3.2 Dataset quality and model quality are different

A low evaluation score can reflect a model weakness, but it can also result from incorrect labels, ambiguous reference answers, inconsistent annotation rules, or a dataset that does not match the intended task.

Likewise, a high score can result from an evaluation dataset that is too easy, too narrow, duplicated, or unintentionally exposed during development.

Evaluation data must therefore be examined as an engineered artifact, not treated as unquestionable ground truth.

### 3.3 Dataset design is part of the evaluation design

The dataset determines which behaviors are observed and which remain invisible.

For example, a summarization dataset containing only short, clean articles may not test whether the system can preserve critical details from long, contradictory, or poorly structured documents.

A structured extraction dataset containing only valid inputs may not reveal how the application handles missing fields or malformed documents.

Dataset design should follow the evaluation objectives established in Chapter 01. It should not be driven only by the examples that are easiest to collect.

## 4. Define the Target Population

Before collecting examples, define the population about which you want to draw conclusions.

The target population is the set of inputs, tasks, users, or situations for which the evaluation is intended to provide evidence.

### 4.1 Define the intended use

Consider a system that extracts information from invoices.

Its target population might be:

- Invoices from supported vendors.
- Documents in supported languages.
- Digital PDFs and scanned images.
- Documents containing the required fields.
- Documents with varying layouts and image quality.

If the system is intended only for digital PDFs from a small set of vendors, the evaluation does not necessarily need to cover every possible scanned invoice format.

However, if scanned documents are part of the supported workload, excluding them would create a meaningful coverage gap.

The dataset scope must match the actual product requirements.

### 4.2 Define inclusion and exclusion criteria

A dataset specification should describe which examples belong in the evaluation and which do not.

For example:

| Criterion | Example |
|---|---|
| Inclusion | Valid support tickets written in supported languages. |
| Inclusion | Tickets containing enough information to assign a reference category. |
| Exclusion | Records corrupted beyond the application's supported input format. |
| Exclusion | Examples with unresolved reference labels, when reliable scoring requires a single label. |
| Separate category | Ambiguous tickets that the system is expected to handle using an uncertainty or escalation policy. |

Excluding an example should not be a way to remove difficult cases merely because the model performs poorly on them.

If ambiguous or malformed inputs are part of the intended workload, they may need their own evaluation category rather than being discarded.

### 4.3 State the limits of the target population

An evaluation dataset rarely represents every possible future input.

Document relevant boundaries, such as supported languages, document formats, task categories, input lengths, and known exclusions.

These boundaries make it possible to interpret results accurately and identify where additional evaluation is necessary.

## 5. Design Representative Dataset Coverage

Representativeness concerns how well the dataset reflects the relevant characteristics of the target population.

It is not achieved simply by collecting a large number of examples.

### 5.1 Identify important dimensions

The relevant dimensions depend on the task.

For a support-ticket classifier, useful dimensions may include:

- Ticket category.
- Language.
- Message length.
- Clear versus ambiguous requests.
- Single-issue versus multi-issue tickets.
- Common versus less frequent categories.
- Inputs with missing or contradictory information.

For document extraction, relevant dimensions may include document type, layout, language, image quality, field availability, and formatting variation.

The goal is to identify dimensions that could materially affect system performance.

### 5.2 Common inputs and difficult inputs serve different purposes

A useful evaluation dataset should not contain only difficult examples or only common examples.

Common examples help estimate performance on routine workloads. Difficult examples help expose weaknesses that may be hidden by routine cases.

Depending on the evaluation objective, the dataset may include:

- Typical inputs.
- Less frequent but important inputs.
- Ambiguous examples.
- Boundary cases.
- Supported malformed inputs.
- High-impact failure scenarios.

The proportions should reflect the purpose of the evaluation.

A stress-test dataset may deliberately overrepresent difficult cases. A dataset intended to estimate performance on an actual production workload may instead need to preserve that workload's distribution.

These two datasets answer different questions and should not be interpreted interchangeably.

### 5.3 Stratification and subgroup coverage

Stratification means organizing examples into meaningful groups before sampling or analyzing them.

For a classifier, groups might correspond to ticket categories or languages. For an extraction system, they might correspond to document types or field types.

Stratification helps prevent important categories from disappearing in a random sample, especially when some categories are rare.

It also makes subgroup analysis possible. An aggregate score may hide poor performance on a particular language or category.

However, subgroup scores based on very few examples can be unstable. Dataset design should consider both coverage and whether each subgroup has enough examples to support a useful conclusion.

### 5.4 Dataset size is not the same as dataset quality

A dataset with 10,000 nearly identical examples may provide less useful evidence than a smaller dataset with carefully selected coverage of important input types.

Larger datasets can improve the precision of estimates when the examples are appropriate and the evaluation procedure is sound. They do not automatically correct selection bias, incorrect labels, or missing categories.

Dataset size should be chosen according to the evaluation objective, the variability of the task, the required confidence in the results, and the practical cost of collecting and labeling examples.

Statistical sample-size reasoning is covered in Chapter 08.

## 6. Reference Answers and Label Quality

Many evaluation methods depend on reference answers, expected outputs, or human-assigned labels.

These references are often treated as ground truth, but they can contain mistakes or reflect subjective decisions.

### 6.1 References must match the task

For a classification task, the reference label should follow a defined category scheme.

For extraction, expected values should be normalized according to explicit rules. For question answering, reference answers should be consistent with the question and the evidence available to the system.

If the references do not accurately represent the task, a correct model response may be scored as incorrect.

### 6.2 Ambiguity must be handled explicitly

Some inputs legitimately permit multiple acceptable answers.

For example, a summarization task may allow several summaries that preserve the same essential facts. A support ticket may reasonably fit two categories when the category definitions overlap.

Forcing a single reference answer without documenting these cases can create misleading evaluation results.

Possible approaches include:

- Defining a consistent annotation policy.
- Recording multiple acceptable answers when appropriate.
- Marking genuinely ambiguous examples.
- Using explicit rubrics for judgments that cannot be reduced to a single reference string.
- Escalating unresolved disagreements for adjudication.

The appropriate approach depends on the task and scoring method. Chapter 04 covers human evaluation and rubric design in greater depth.

### 6.3 Label consistency

When several people label a dataset, they may interpret category definitions differently.

For example, one annotator might classify a message about a failed payment as a billing issue, while another labels it as a technical issue.

Such disagreement may indicate unclear definitions, overlapping categories, insufficient instructions, or genuine ambiguity in the task.

Before relying on the labels:

1. Define annotation rules.
2. Provide examples for important categories.
3. Review a sample of independently labeled records.
4. Investigate disagreements.
5. Correct the guidelines or labels where justified.
6. Record unresolved ambiguity.

Agreement between annotators does not automatically prove that the labels are correct. It provides evidence about consistency, which must be considered alongside the quality of the annotation rules.

## 7. Data Splits, Leakage, and Contamination

Evaluation data must remain sufficiently independent from the data and feedback used to develop the system.

Three related risks require distinct treatment: data leakage, training-data contamination, and test-set overfitting through development feedback. They can overlap, but they describe different mechanisms.

### 7.1 Training, validation, development, and final test data

Different data partitions serve different purposes.

| Data partition | Primary purpose |
|---|---|
| Training data | Fit model parameters or train task-specific components. |
| Validation/development data | Tune prompts, select configurations, inspect errors, and make iterative development decisions. |
| Final test data | Assess the resulting system after development decisions have been made, using a dataset intended to remain independent of those decisions. |

Terminology varies across workflows. Some teams use *validation set* and *development set* interchangeably; others distinguish them. The important property is the separation of purpose and the degree of independence retained by each dataset.

Not every LLM evaluation workflow requires all three partitions. For example, evaluating a hosted model may not involve training any model parameters. However, a workflow still needs to distinguish examples used for iterative tuning from those reserved for final assessment.

A dataset called "test" is not automatically independent. Its actual use determines how much independence remains.

### 7.2 Data leakage

Data leakage occurs when information that should be unavailable to the evaluated process influences its predictions or the evaluation outcome.

Examples include:

- Target labels accidentally included in model inputs.
- Features derived from information that would not be available at inference time.
- Related or near-duplicate records crossing data partitions in a way that gives the system access to evaluation-specific information.
- Preprocessing performed using held-out evaluation information in a way that influences development or predictions.

Leakage can produce overly optimistic results because the evaluation no longer measures the intended capability under the intended conditions.

### 7.3 Training-data contamination

Training-data contamination occurs when evaluation examples, questions, answers, or close reproductions of them were included in the model's training data or other pretraining material.

This is particularly relevant to public LLM benchmarks, because model training data may not be fully documented.

Contamination can allow a model to reproduce familiar benchmark content rather than demonstrate the intended generalization capability. However, overlap alone does not establish that a particular score was inflated; the nature of the overlap and its effect matter.

Potential warning signs include exact or near-exact overlap with public benchmark questions, unexpectedly strong results on a narrow dataset, or evaluation examples that are widely available online.

These signs do not independently prove contamination. They justify investigation and careful qualification of the results.

### 7.4 Test-set overfitting through development feedback

Test-set overfitting can occur even when evaluation examples never enter the model's training data.

If engineers repeatedly inspect final test results and use those results to tune prompts, select configurations, or make other development decisions, they gradually optimize the system against those examples.

The test set is no longer an independent final assessment of the development process. It has become part of the feedback loop.

This differs from training-data contamination: the problem is the use of test results to guide development, not necessarily the model's exposure to the examples during training.

### 7.5 Controls for leakage, contamination, and test-set independence

Controls should address the specific mechanism of risk.

**To reduce data leakage:**

- Deduplicate records before splitting datasets.
- Group related records so near-duplicates do not cross partitions.
- Ensure that inputs do not contain target labels or information unavailable at inference time.
- Check whether preprocessing uses held-out evaluation information inappropriately.

**To reduce training-data contamination risk:**

- Use newly collected or privately maintained examples when public benchmark exposure is a concern.
- Investigate exact or near-exact overlap with publicly available evaluation material when feasible.
- Document uncertainty when the model's training-data provenance cannot be verified.
- Avoid treating unusually strong benchmark results as proof of contamination without supporting evidence.

**To preserve final test-set independence:**

- Keep final evaluation examples out of routine prompt tuning and configuration selection.
- Use a separate development set for iterative experimentation.
- Limit access to sensitive or held-out test sets where appropriate.
- Record how evaluation results have been used to make development decisions.
- Maintain a separate final test set for important decisions when resources permit.

No single control guarantees that leakage or contamination is impossible. The objective is to reduce known risks and state the remaining uncertainty.

Repeatedly selecting configurations based on the same nominally held-out set can undermine its independence even when no examples are directly added to model training. In that situation, the set has become part of the development feedback loop.

Chapter 08 develops the implications of repeated comparisons and experimental interpretation.

## 8. Sampling Bias and Distribution Mismatch

### 8.1 Sampling bias

Sampling bias occurs when the process used to collect examples systematically overrepresents some types of inputs and underrepresents others.

For example, a support-ticket dataset collected from a product's most active users may not represent new users or less common customer segments.

Bias can enter through data sources, collection periods, language coverage, filtering rules, annotation processes, or decisions about which examples to retain.

Documenting the collection process helps identify these risks.

### 8.2 Distribution mismatch

Distribution mismatch occurs when the evaluation data differs in relevant ways from the inputs encountered in the intended application.

Differences may involve:

- Input categories.
- Language or writing style.
- Document formats.
- Input length.
- Frequency of ambiguous requests.
- Data quality.
- Temporal changes in the workload.

A dataset can be internally clean and consistently labeled while still being a poor representation of the intended production workload.

Conversely, a deliberately constructed challenge dataset may be useful for testing specific weaknesses even though it does not reflect the production distribution.

The key is to understand which question the dataset is designed to answer.

### 8.3 Preserve the distinction between workload estimates and challenge tests

A workload-oriented dataset aims to estimate performance under a specified input distribution.

A challenge dataset deliberately includes cases selected to probe particular capabilities or failure modes.

These datasets can complement one another, but their scores answer different questions. Combining them without documenting their composition can make the final result difficult to interpret.

Where both are used, report their purposes and results separately when that distinction matters to the engineering decision.

## 9. Duplicates, Quality Checks, and Data Integrity

Dataset integrity includes the correctness, consistency, uniqueness, and traceability of the records used in evaluation.

### 9.1 Duplicate and near-duplicate examples

Exact duplicates can cause repeated examples to receive disproportionate weight.

Near-duplicates can be harder to detect. Two support tickets may use different wording but describe the same underlying case. Two document examples may contain the same facts with slightly different formatting.

Duplicates may be legitimate in a workload where repeated cases are common, but they should not unintentionally inflate coverage or leak information across data partitions.

Deduplication rules should reflect the evaluation purpose and be documented.

### 9.2 Basic integrity checks

Before using an evaluation dataset, verify relevant properties such as:

- Required fields are present.
- Record identifiers are unique where required.
- Inputs and reference outputs use expected types and formats.
- Labels belong to the defined category set.
- Empty or malformed records are identified.
- Duplicate and near-duplicate risks are assessed.
- Text encoding and normalization are consistent.
- Records satisfy documented inclusion and exclusion rules.
- References and labels have passed the required quality checks.

Automated checks are useful for detecting structural problems. They cannot independently establish that semantic references are correct or that the dataset represents the intended population.

### 9.3 Preserve raw and processed data appropriately

When preprocessing is required, preserve enough information to understand how the evaluation examples were transformed.

Depending on the workflow, this may include the original input, normalized input, reference answer, preprocessing version, and exclusion reason.

Sensitive data should be handled according to applicable access and retention requirements. Data integrity does not justify retaining personal or confidential information unnecessarily.

The aim is traceability without collecting or exposing more data than the evaluation requires.

## 10. Dataset Provenance and Versioning

An evaluation dataset should be a versioned engineering artifact.

Without provenance, teams may be unable to explain why scores changed, reproduce a previous evaluation, or establish whether two reports used the same data.

### 10.1 What provenance should capture

Record relevant information such as:

- Dataset name and version.
- Collection source and time period.
- Inclusion and exclusion rules.
- Sampling procedure.
- Annotation guidelines and label version.
- Preprocessing and normalization steps.
- Deduplication procedure.
- Known leakage or contamination risks.
- Dataset size and relevant category distributions.
- Known limitations.
- Changes from the previous version.

Not every dataset requires a large metadata system. The required level of detail depends on the evaluation's purpose and consequences.

### 10.2 Version changes explicitly

Suppose an evaluation dataset is updated to correct mislabeled records and add examples from a previously underrepresented category.

A score change between the old and new dataset versions may reflect the system's behavior, the dataset correction, or both.

Record the change and avoid presenting results from different dataset versions as directly comparable without examining the implications.

A practical versioning approach can use immutable dataset snapshots or version-controlled manifests, with sensitive data stored in an appropriately controlled location.

### 10.3 Make evaluation runs traceable

A reproducible evaluation requires more than a dataset version.

The run should also identify the evaluated model or application version, relevant prompts and configurations, evaluation code, metrics, and other conditions necessary to interpret the result.

This chapter establishes the dataset-related records needed for traceability. The complete evaluation-run workflow is covered in Chapter 09.

## 11. Dataset Design Trade-Offs

Dataset design involves practical trade-offs.

| Trade-off | Engineering consideration |
|---|---|
| Dataset size vs. labeling cost | Larger datasets can improve coverage or precision but may increase collection and annotation effort. |
| Production representativeness vs. challenge coverage | Workload estimates and targeted stress tests serve different purposes. |
| Public data vs. private data | Public data can improve transparency but may have greater contamination risk. |
| Strict filtering vs. realistic inputs | Removing difficult records may simplify evaluation while making the results less representative. |
| More annotation vs. faster iteration | Additional review may improve reference quality but delay experiments. |
| Stable dataset vs. updated coverage | A stable version supports comparisons, while updates may be needed to address new inputs or discovered defects. |

There is no universally optimal dataset design.

The appropriate choice depends on the evaluation objective, expected input population, consequences of failure, available resources, and the conclusions the team needs to support.

## 12. Practical Exercise — Create a Dataset Specification

### Scenario

You are preparing an evaluation dataset for an LLM-powered support-ticket classifier.

The system assigns tickets to predefined categories. Tickets vary in length, language, clarity, and subject. Some tickets contain more than one issue.

The team has collected historical tickets but has not documented how examples were selected or how reference labels were assigned.

### Task

Create a short dataset specification covering:

1. **Evaluation purpose:** What engineering decision will the dataset support?
2. **Target population:** Which support tickets should the evaluation represent?
3. **Inclusion and exclusion rules:** Which records belong in the dataset, and how will ambiguous tickets be handled?
4. **Coverage dimensions:** Which categories and input variations must be represented?
5. **Sampling approach:** How will you avoid unintentionally overrepresenting common or easy examples?
6. **Reference quality:** How will labels be defined, reviewed, and corrected?
7. **Leakage controls:** How will you identify duplicates and separate development data from final evaluation data?
8. **Integrity checks:** What structural and semantic checks will be performed?
9. **Provenance:** What metadata must be retained to reproduce the dataset version?
10. **Limitations:** What important conclusions will the dataset not support?

Do not choose evaluation metrics yet. The purpose is to establish whether the dataset can provide trustworthy evidence for the intended evaluation.

### Review checklist

A strong specification:

- Connects dataset design to a concrete engineering decision.
- Defines the target population and intended scope.
- Identifies meaningful coverage dimensions.
- Explains how reference quality will be established.
- Addresses duplicates, leakage, and contamination risks.
- Preserves dataset provenance and version identity.
- Distinguishes workload-oriented evaluation from targeted challenge testing.
- States limitations rather than claiming universal representativeness.

The exercise is complete when another engineer could use the specification to build or audit the dataset without guessing what should be included or why.

## 13. Summary

Evaluation dataset design determines which evidence is available to support claims about LLM performance.

The core principles are:

- Define the target population before collecting examples.
- Align dataset coverage with the intended task and engineering decision.
- Include common, difficult, and high-impact cases as appropriate to the evaluation purpose.
- Treat reference answers and labels as artifacts that require quality control.
- Separate development data from final evaluation data and reduce leakage risks.
- Distinguish training-data contamination from test-set overfitting through development feedback.
- Check duplicates, structural validity, and annotation consistency.
- Preserve provenance, version identity, and known limitations.
- Interpret scores within the scope of the dataset rather than generalizing beyond the evidence.

A large dataset is not automatically a representative dataset, and a clean dataset is not automatically a valid one. Evaluation data is trustworthy only to the extent that its construction, integrity, and limitations are understood.

## 14. Connections to Other Chapters

- **Chapter 01 — Evaluation Foundations and Objectives:** Defines the evaluation question and success criteria that guide dataset design.
- **Chapter 03 — Metrics for Language Model Evaluation:** Covers the measures used to score outputs and interpret metric limitations.
- **Chapter 04 — Human Evaluation and Rubric Design:** Develops annotation guidance, human judgments, and disagreement handling.
- **Chapter 05 — Automated Evaluation and LLM-as-a-Judge:** Covers automated evaluator design and validation.
- **Chapter 07 — Benchmarking and Controlled Model Comparison:** Uses controlled datasets and comparison conditions to assess alternatives.
- **Chapter 08 — Experimental Design and Statistical Interpretation:** Develops sample-size reasoning, uncertainty, and the effects of repeated comparisons.
- **Chapter 09 — Reproducible Evaluation Workflows and Practical Lab:** Integrates dataset versions and run metadata into a repeatable workflow.

## 15. Knowledge Check

Answer these questions in your own words:

1. Why can a large evaluation dataset still provide misleading evidence?
2. How would you distinguish a representative workload dataset from a challenge dataset?
3. What is the difference between data leakage, training-data contamination, and test-set overfitting through development feedback?
4. Why can incorrect reference labels make a good model appear to perform poorly?
5. How can repeatedly using the same test set during development undermine its independence?
6. What information should be retained to explain a score change after a dataset update?
7. Why should dataset limitations be documented alongside evaluation results?

If you cannot explain these distinctions clearly, revisit the relevant sections before moving to evaluation metrics.
```
