# 01 — Evaluation Foundations and Objectives

## 1. Purpose

Language model evaluation is the process of collecting and interpreting evidence about whether a model or an LLM-powered system satisfies its intended requirements.

The central engineering question is not:

> How good is this model?

It is:

> Does this model or system satisfy the requirements of a specific task, under defined conditions, with sufficient evidence to justify a decision?

The distinction matters because language models can produce fluent, plausible, and well-structured responses while still being incorrect, incomplete, inconsistent, or unsuitable for the application.

A model may perform well on a general-purpose benchmark but fail on domain-specific terminology. A model may answer individual questions accurately but fail when integrated into an application that imposes strict output requirements. A new model version may improve average response quality while introducing regressions in a critical task.

Evaluation provides a systematic way to detect these differences before they become expensive engineering or product failures.

This chapter establishes the conceptual foundations of LLM evaluation. It focuses on defining objectives, identifying the system being evaluated, specifying success criteria, and understanding what evaluation evidence can and cannot establish.

Detailed dataset construction, metric selection, human evaluation, automated evaluators, and statistical interpretation are covered in later chapters.

## 2. Learning Objectives

By the end of this chapter, you should be able to:

- Explain why LLM evaluation must begin with an explicit engineering objective.
- Distinguish model-level evaluation from application-level evaluation.
- Translate qualitative requirements into observable evaluation criteria.
- Identify the conditions and boundaries of an evaluation.
- Distinguish evaluation, benchmarking, regression testing, and production monitoring.
- Explain why a single aggregate score cannot establish overall system quality.
- Identify common evaluation-design mistakes.
- Formulate an evaluation objective that can guide a practical experiment.

## 3. Why LLM Evaluation Exists

### 3.1 The problem with judging outputs informally

During development, engineers often test a model by submitting a few prompts and reading the responses.

This is useful for exploration, debugging, and developing an initial understanding of model behavior. It is not sufficient to establish whether the system reliably meets its requirements.

Informal inspection has several limitations:

- **Small sample size:** A few examples may not represent the task distribution.
- **Selection bias:** Engineers may test examples they already expect the model to handle.
- **Subjective judgment:** Different reviewers may disagree about response quality.
- **Inconsistent conditions:** Different prompts, settings, or model versions make comparisons unreliable.
- **Poor reproducibility:** Without recorded inputs and configurations, the same evaluation may be difficult to repeat.
- **Weak decision criteria:** An engineer may declare an improvement without defining what improvement means.

These problems become more significant as systems grow, datasets become larger, and multiple model or prompt versions must be compared.

A disciplined evaluation process replaces informal impressions with defined objectives, documented conditions, observable results, and explicit limitations.

### 3.2 Why language models make evaluation difficult

Traditional software frequently has explicit rules that determine whether an operation succeeded. For example, a function that adds two integers can be tested against an exact expected result.

LLM outputs are often more complex.

For a summarization task, several different summaries may accurately represent the same source. For an extraction task, the output may be semantically correct but violate a required schema. For a question-answering task, an answer may be fluent yet unsupported by the supplied evidence.

Consequently, the expected result is not always a single exact string, and correctness may involve several independent properties.

Evaluation must therefore account for the task's actual requirements rather than assuming that one universal correctness measure will work for every application.

This does not mean that LLM evaluation must always be subjective. Some requirements can be checked deterministically, such as valid JSON syntax, required fields, or exact identifier matching. Others require semantic judgment, human assessment, or multiple complementary methods.

The evaluation design should follow the requirement being tested.

## 4. Evaluation as an Engineering Decision Process

Evaluation is most useful when it supports a concrete decision.

Examples include:

- Whether a model is suitable for a specific application.
- Whether a prompt change improves the intended behavior.
- Whether a new model version introduces regressions.
- Whether an extraction pipeline meets its correctness requirements.
- Whether the available evidence justifies deployment to a larger user group.

An evaluation should connect the decision to the evidence needed to support it.

A useful conceptual workflow is:

```text
Engineering decision
        |
        v
Requirements and risks
        |
        v
Evaluation objectives
        |
        v
Observable success criteria
        |
        v
Evaluation design
        |
        v
Evidence and limitations
        |
        v
Engineering decision
```

The evaluation design determines how evidence will be collected. Later chapters cover dataset design, metrics, evaluator methods, controlled comparisons, and uncertainty in detail.

The important foundation is that evaluation should not begin by selecting a convenient metric. It should begin by identifying the decision and the requirements that matter to that decision.

### 4.1 Separate the requirement from the measurement

Consider a system that extracts invoice information.

The requirement might be:

> The system must reliably extract invoice numbers, dates, and total amounts from supported invoices.

That requirement is not yet an evaluation specification. It needs to be translated into observable criteria.

For example:

- Invoice numbers must match the reference values.
- Dates must represent the correct calendar dates.
- Amounts must match the reference amounts within the specified precision.
- Required fields must be present.
- The output must satisfy the application's schema.
- Performance must be assessed across the supported document types.

These criteria describe what success means. Metrics and test procedures can then be selected to measure them.

A common mistake is to start with a metric because it is easy to calculate, then treat that metric as the definition of success. The correct direction is the reverse: define the requirement first, then determine how to measure it.

## 5. Define the Evaluation Target

Before evaluating anything, specify what system is being evaluated.

The target may be a language model in isolation, or it may be an entire application that uses the model as one component.

### 5.1 Model-level evaluation

Model-level evaluation measures a model under defined inference conditions.

The target may include:

- A particular model and version.
- A specified prompt or instruction.
- Defined input data.
- Generation parameters.
- A particular output format.

The goal is to understand how the model performs on the selected tasks under those conditions.

Model-level evaluation is useful for controlled comparisons, initial capability assessment, and experiments that isolate model behavior.

However, model-level results do not automatically establish application-level success.

### 5.2 Application-level evaluation

An LLM-powered application may include components such as:

- Input validation and preprocessing.
- Prompt construction and context assembly.
- Retrieval or external data access.
- Model inference.
- Output parsing and validation.
- Business rules and downstream actions.
- Error handling and user-facing responses.

Application-level evaluation considers the behavior of the system across its actual workflow.

For example, a model might generate a correct answer when given all relevant information directly. An application using that model may still fail because it supplies incomplete context, truncates important content, mishandles the response, or rejects a valid result.

Conversely, application-level validation may catch some invalid model outputs before they reach users.

The evaluation target must therefore match the engineering decision.

If the decision concerns replacing the underlying model, a controlled model-level comparison may be necessary. If the decision concerns whether users can complete a workflow successfully, application-level evaluation is more relevant.

### 5.3 State the system boundary explicitly

An evaluation specification should identify what is inside and outside the evaluated system.

For example:

| Element | Model-level evaluation | Application-level evaluation |
|---|---|---|
| Model behavior | Included | Included |
| Prompt construction | Fixed or explicitly controlled | Evaluated as part of the application |
| Retrieval | Excluded or supplied as fixed input | Included when part of the workflow |
| Output validation | Usually excluded unless explicitly tested | Included when part of the application |
| End-to-end task completion | Not necessarily measured | Measured when it is a requirement |
| Infrastructure reliability | Generally outside the target | Included only when required by the evaluation objective |

These boundaries are illustrative, not universal rules. An evaluation can deliberately include or exclude any component, provided the scope is explicit.

Specialized retrieval, agent, and production-system evaluation belongs to the respective engineering domains. This chapter establishes the general principle of choosing the correct evaluation boundary rather than teaching those implementations.

## 6. Translate Requirements into Evaluation Objectives

A useful evaluation objective defines the task, target, conditions, success criteria, and intended decision.

The following elements provide a practical structure.

### 6.1 Task

State what the system is expected to do.

Examples:

- Extract fields from invoices.
- Summarize technical documents.
- Answer questions using supplied reference material.
- Classify support messages.
- Convert natural-language instructions into structured output.

Avoid vague objectives such as "test the model's intelligence" or "measure overall quality." They do not identify a specific task or establish what success means.

### 6.2 Target system

Specify the model or application being evaluated.

Record relevant identity and configuration information, such as model version, prompt version, inference settings, and the application components included in the test.

The amount of detail depends on the experiment, but it must be sufficient to interpret the result and reproduce the comparison.

### 6.3 Evaluation conditions

Define the conditions under which the system will be tested.

These may include:

- Supported input types and languages.
- Expected input lengths.
- Relevant user or document categories.
- Available context or reference material.
- Required output format.
- Whether the evaluation uses single-turn or multi-turn interactions.
- Relevant inference settings.

Results are meaningful only in relation to the conditions under which they were obtained.

A system evaluated on short, clean inputs has not thereby been shown to handle long, ambiguous, or malformed inputs reliably.

### 6.4 Success criteria

Describe the observable conditions that distinguish acceptable performance from unacceptable performance.

Success criteria may involve:

- Correctness.
- Completeness.
- Grounding in available evidence.
- Compliance with required instructions.
- Output validity.
- Consistency across relevant cases.
- Task completion.
- Latency or cost constraints when these are part of the decision.

Not every evaluation needs every criterion. Include the dimensions that matter to the task and its risks.

Where possible, define acceptance thresholds before inspecting the final results. This reduces the temptation to change the definition of success after seeing which approach performs better.

### 6.5 Intended decision

State how the results will be used.

Examples include selecting between two prompt versions, determining whether a model meets an acceptance threshold, identifying a regression, or deciding whether additional testing is necessary.

An evaluation that produces numbers without connecting them to a decision may still provide diagnostic value, but its engineering purpose is incomplete.

## 7. Quality Is Multidimensional

LLM quality is not a single universal property.

A system may perform well on one dimension and poorly on another. Evaluation should preserve these distinctions long enough to determine which trade-offs matter.

| Quality dimension | Engineering question |
|---|---|
| Correctness | Is the result correct for the task? |
| Completeness | Does it include all required information? |
| Grounding | Is the result supported by the permitted evidence? |
| Instruction compliance | Does it satisfy the applicable constraints? |
| Format validity | Does the output meet the required structure? |
| Consistency | Does the system behave acceptably across relevant cases and repeated runs? |
| Robustness | Does performance remain acceptable across the intended input variation? |
| Efficiency | Does the system meet applicable latency and cost requirements? |
| Task success | Does the user or downstream system achieve the intended outcome? |

These dimensions are related but not interchangeable.

A syntactically valid response can contain incorrect values. A correct answer can omit a required field. A complete answer can include unsupported claims. A semantically good response can arrive too slowly for the application.

### 7.1 Avoid hiding failures in aggregate scores

Suppose an extraction system performs well on invoice numbers and dates but frequently returns incorrect total amounts.

A single aggregate score could obscure the problem if the easier fields dominate the dataset or metric.

For a financial workflow, incorrect totals may be substantially more consequential than minor formatting errors.

The evaluation should therefore examine relevant dimensions and error categories separately, in addition to any overall summary.

Aggregate results are useful for comparison, but they should not erase failures that are important to the engineering decision.

### 7.2 Quality requirements depend on context

There is no universal quality threshold suitable for every LLM application.

A draft-generation tool may tolerate occasional imperfections because a human reviews its output. A system that extracts values for automatic financial processing may require stricter correctness and validation.

The appropriate criteria depend on the consequences of failure, the presence of safeguards, the expected users, and the system's role in the workflow.

This is why evaluation objectives must be tied to actual requirements rather than generic claims about model quality.

## 8. Evaluation, Benchmarking, Regression Testing, and Monitoring

These practices are related, but they answer different questions.

| Practice | Primary question | Typical use |
|---|---|---|
| Evaluation | Does the system meet defined requirements? | Assess quality against task-specific criteria. |
| Benchmarking | How does a system perform on a defined comparison workload? | Compare models or configurations under controlled conditions. |
| Regression testing | Did a change break previously acceptable behavior? | Test releases, prompt changes, model upgrades, or code changes. |
| Production monitoring | What is happening in the deployed system over time? | Observe operational behavior and detect changes or incidents. |

### 8.1 Evaluation

Evaluation is the broader process of measuring performance against explicit objectives.

It can be performed before deployment, during development, after a change, or as part of ongoing quality assurance.

### 8.2 Benchmarking

Benchmarking applies a defined workload and measurement procedure to support comparison.

A benchmark is only informative relative to its task coverage, data quality, metrics, and evaluation conditions. A high benchmark score does not establish universal superiority or guarantee success in a particular application.

Benchmark design and controlled comparisons are covered in Chapter 07.

### 8.3 Regression testing

Regression testing checks whether behavior has changed in undesirable ways after a modification.

For LLM systems, a regression suite may contain representative examples with expected outputs, acceptable properties, or task-specific checks.

Because some outputs vary across runs, regression criteria may need to evaluate required properties rather than demand identical text in every case.

A passing regression suite establishes evidence about the cases and conditions it covers. It does not prove that no regressions exist elsewhere.

### 8.4 Production monitoring

Production monitoring observes a deployed system over time.

It may track operational indicators such as latency, error rates, resource consumption, or service availability. Quality-related signals may also be monitored when suitable feedback, labels, or evaluation mechanisms are available.

Monitoring and offline evaluation complement one another, but they are not substitutes. A system can be operationally healthy while producing poor answers, or produce good answers while suffering from reliability problems.

Production observability and monitoring implementation remain within the scope of PROD.

## 9. Evaluation Evidence and Its Limits

Evaluation produces evidence, not absolute proof of universal quality.

Every result depends on the task definition, dataset, measurement method, experimental conditions, and assumptions.

For example, an evaluation might establish that a system correctly extracted invoice fields across a documented set of test examples. It would not automatically establish that the system performs equally well on every invoice format, language, or document quality encountered in production.

A technically sound evaluation report should make clear:

- What was evaluated.
- Which conditions were used.
- What the results show.
- Which cases or populations were not covered.
- Which assumptions could affect the conclusion.
- What uncertainty remains.
- Which decisions the evidence supports.
- Which additional tests may be necessary.

The strength of a conclusion should be proportional to the strength of the evidence.

### 9.1 A score is not a decision

Suppose Model A scores 91% and Model B scores 93% on a test set.

Those numbers alone do not establish that Model B is the better engineering choice.

Questions remain:

- Are the evaluation examples representative of the intended task?
- Does the metric measure the requirement that matters?
- Is the observed difference larger than the expected variability?
- Are the models being evaluated under equivalent conditions?
- Does either model fail on a high-impact subset?
- Are cost, latency, and other constraints relevant to the decision?

These questions are developed in later chapters. At this stage, the essential principle is that numerical results must be interpreted in context.

### 9.2 Separate observed facts from interpretation

A disciplined evaluation distinguishes between what was measured and what is inferred.

For example:

- **Observation:** The new configuration achieved a higher measured score on the selected dataset.
- **Interpretation:** The new configuration may improve performance on the evaluated task.
- **Limitation:** The dataset may not represent all production inputs, and the observed difference may be sensitive to evaluation conditions.
- **Decision:** Further testing may be required before deployment.

This separation prevents a narrow measurement from turning into an unsupported general claim.

## 10. Common Evaluation Design Mistakes

Several recurring mistakes weaken evaluation evidence:

- **Starting with a metric instead of a requirement:** A convenient metric may not represent the task's actual success criteria. Define the requirement first; Chapter 03 covers metric selection.
- **Using unrepresentative examples:** Results may not generalize beyond the tested inputs. Chapter 02 covers dataset coverage and integrity.
- **Trusting a single aggregate score:** Important failure categories may be hidden. Report relevant dimensions and inspect individual examples.
- **Changing several variables at once:** It becomes difficult to attribute observed differences to a particular change. Chapter 07 covers controlled comparisons.
- **Changing acceptance criteria after seeing results:** This can introduce confirmation bias. Establish criteria in advance when feasible and document justified changes.
- **Generalizing beyond the evidence:** Conclusions should be limited to the tasks and conditions actually tested.
- **Ignoring the consequences of failure:** Evaluation criteria should reflect the application's requirements and the relative impact of different errors.

These mistakes can occur even when metrics are calculated correctly. Evaluation quality depends on the validity of the overall design, not merely the accuracy of the arithmetic.

## 11. Practical Exercise — Write an Evaluation Objective

This exercise tests whether you can translate a vague request into a usable evaluation specification without prematurely selecting a metric.

### Scenario

An engineering team has built an LLM-powered support-ticket classifier. The system assigns each ticket to one of several predefined categories and returns a structured result for downstream processing.

The team reports that the system "works well" based on informal testing. Before deploying a new model version, the team wants evidence that the change is an improvement.

### Task

Write a short evaluation specification containing:

1. **Decision:** What engineering decision must the evaluation support?
2. **Task:** What must the system do?
3. **Evaluation target:** Are you evaluating the model in isolation or the full classification workflow?
4. **Conditions:** Which inputs and operating conditions should be represented?
5. **Success criteria:** What observable properties determine acceptable performance?
6. **Risks:** Which failures would be particularly costly?
7. **Evidence limits:** What could a successful test still fail to establish?

Do not begin by choosing a particular metric. First explain what success means and why the selected criteria matter.

### Review checklist

A strong specification:

- States a concrete decision rather than a vague goal.
- Identifies the system boundary.
- Defines observable success criteria.
- Includes relevant variation in the intended inputs.
- Distinguishes critical failures from less consequential imperfections.
- Acknowledges that test results are limited by dataset coverage and evaluation conditions.

The exercise is complete when another engineer could use your specification to design an evaluation without having to guess what the team means by "works well."

## 12. Summary

LLM evaluation is an evidence-based engineering process for determining whether a model or application satisfies defined requirements.

The foundations are:

- Begin with the engineering decision and intended task.
- Define the evaluation target and system boundary.
- Translate requirements into observable success criteria.
- Treat quality as multidimensional when the task requires it.
- Distinguish evaluation, benchmarking, regression testing, and production monitoring.
- Interpret results in the context of their conditions, limitations, and uncertainty.
- Avoid unsupported conclusions based on a single score or a small set of examples.

A good evaluation is not defined by how many metrics it reports. It is defined by whether its evidence is relevant, credible, and sufficient for the decision it is intended to support.

## 13. Connections to Other Chapters

- **Chapter 02 — Evaluation Dataset Design and Data Integrity:** Establishes how to construct and validate the data used to support evaluation claims.
- **Chapter 03 — Metrics for Language Model Evaluation:** Explains how to select and interpret measurements that correspond to defined requirements.
- **Chapter 04 — Human Evaluation and Rubric Design:** Develops structured human assessment methods.
- **Chapter 05 — Automated Evaluation and LLM-as-a-Judge:** Examines automated evaluators and how to establish confidence in their judgments.
- **Chapter 06 — Task-Specific and Application-Level Evaluation:** Applies evaluation principles to concrete task and application requirements.
- **Chapter 07 — Benchmarking and Controlled Model Comparison:** Develops fair comparison procedures.
- **Chapter 08 — Experimental Design and Statistical Interpretation:** Explains how to reason about variability, uncertainty, and the significance of observed differences.
- **Chapter 09 — Reproducible Evaluation Workflows and Practical Lab:** Integrates the concepts into a repeatable workflow.

## 14. Knowledge Check

Before proceeding, answer these questions in your own words:

1. Why is "evaluate the best model" an inadequate evaluation objective?
2. How can a model perform well in isolation while the application using it still fails?
3. Why should success criteria be defined before inspecting comparison results?
4. What is the difference between evaluation and benchmarking?
5. Why can a high aggregate score conceal an unacceptable failure?
6. What evidence would you need before concluding that a new model version is genuinely better for a particular application?

If you cannot explain these distinctions clearly, revisit the relevant sections before moving to dataset design and metric selection.
