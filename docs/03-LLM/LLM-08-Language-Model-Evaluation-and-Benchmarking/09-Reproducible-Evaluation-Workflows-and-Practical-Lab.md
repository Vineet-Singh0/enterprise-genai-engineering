# Reproducible Evaluation Workflows and Practical Lab

## 1. Purpose

A language-model evaluation is useful only if its results can be understood, trusted, and reproduced sufficiently for the intended engineering decision.

A team may evaluate a model today, obtain a promising result, and attempt the same evaluation several weeks later. If the dataset, prompt, model version, evaluator, or generation settings have changed without being recorded, the team may be unable to explain why the results differ.

This is an engineering problem, not merely a documentation problem.

A reproducible evaluation workflow defines how evaluation inputs, configurations, executions, outputs, scores, and reports are managed so that results remain traceable to the conditions that produced them.

This chapter explains how to:

- Structure an evaluation workflow as a sequence of explicit stages.
- Version datasets, prompts, model configurations, and evaluators.
- Separate evaluation configuration from execution logic.
- Preserve raw outputs and derived scores.
- Record failures and incomplete runs.
- Reproduce comparisons and investigate regressions.
- Generate traceable reports.
- Build a practical evaluation pipeline with clear responsibilities.

The central principle is:

> An evaluation result should be traceable to the exact inputs, configuration, evaluation procedure, and execution evidence that produced it.

Reproducibility does not always mean that a hosted model will return byte-identical outputs on every run. It means that the team can reconstruct the relevant evaluation conditions, inspect the recorded evidence, and understand which sources of variation remain.

## 2. What Makes an Evaluation Reproducible?

A reproducible evaluation needs more than a saved score or a script that can be executed twice.

Consider a report that says:

> The new model achieved 92% accuracy.

This statement leaves important questions unanswered:

- Which model and version were evaluated?
- Which dataset and dataset version were used?
- Which prompt and generation settings were applied?
- How was accuracy defined?
- Which evaluator produced the score?
- Were all cases executed successfully?
- Were retries or failed requests excluded?
- Was the score calculated from raw outputs or cached results?
- Can the individual cases behind the score be inspected?

Without this information, the result is difficult to verify or compare with a later run.

### 2.1 The reproducibility record

A useful evaluation record captures the following information.

| Category | Information to preserve |
|---|---|
| Evaluation identity | Unique evaluation-run ID and creation time |
| Evaluation objective | Intended question, primary metric, and decision criteria |
| Dataset | Dataset identifier, version, and relevant case identifiers |
| Model | Provider, model identifier, available version metadata |
| Prompt | System instructions, prompt template, and version or content hash |
| Generation | Applicable parameters, output constraints, and token limits |
| Evaluation method | Metric implementation, rubric, judge configuration, or reference data |
| Execution | Software revision, dependency versions, environment details, and run status |
| Outputs | Raw model responses, structured execution metadata, and error records |
| Results | Per-case scores, aggregate metrics, uncertainty estimates where applicable |
| Limitations | Missing cases, retries, provider-side changes, and known deviations |

Not every evaluation requires every possible metadata field. Record the information necessary to explain and reproduce the result at the appropriate level of confidence.

### 2.2 Reproducibility versus repeatability

These terms are related but not identical.

- **Repeatability** concerns obtaining consistent results when the evaluation is repeated under substantially the same conditions.
- **Reproducibility** concerns reconstructing the evaluation procedure and obtaining results that can be compared or independently verified.

Terminology varies across engineering disciplines. The practical requirement is to document which conditions are fixed, which can vary, and what level of consistency is expected.

For a deterministic local evaluator, exact repeatability may be realistic. For a hosted model whose serving implementation can change, the workflow may preserve all available evidence without guaranteeing identical future outputs.

## 3. Model the Evaluation as a Pipeline

A reproducible evaluation should have explicit stages rather than combining data loading, model calls, scoring, and reporting in one opaque script.

A useful high-level workflow is:

<CodeBlock language="mermaid">flowchart TD
    A[Evaluation Specification] --> B[Resolve Versions and Configuration]
    B --> C[Validate Dataset and Inputs]
    C --> D[Execute Model Requests]
    D --> E[Persist Raw Outputs and Errors]
    E --> F[Validate Execution Completeness]
    F --> G[Run Evaluators]
    G --> H[Calculate Metrics]
    H --> I[Generate Report]
    I --> J[Review Evidence and Decision]</CodeBlock>

Each stage has a defined responsibility.

### 3.1 Evaluation specification

Defines what the evaluation is intended to measure and what decision it supports.

It includes the evaluation objective, dataset reference, candidate configurations, metrics, constraints, and relevant execution settings.

### 3.2 Configuration resolution

Resolves human-readable configuration references into the actual versions used by the run.

For example, a prompt name such as `support_assistant_v3` should resolve to a specific prompt artifact or recorded content hash.

Likewise, a model alias should be accompanied by the model identifier and version information available from the provider.

### 3.3 Input validation

Checks that the dataset and configuration satisfy the evaluation contract.

Examples include:

- Required fields are present.
- Case identifiers are unique where required.
- The dataset version exists.
- Input values have valid types.
- The prompt references valid variables.
- Mandatory evaluation criteria are configured.

Validation should fail early when the evaluation cannot be performed meaningfully.

### 3.4 Model execution

Runs the candidate against the specified cases and records each execution outcome.

Model execution should be separated from scoring so that the same recorded outputs can be evaluated again without making unnecessary model calls.

### 3.5 Output persistence

Stores the raw responses and execution metadata needed for auditing, rescoring, and failure analysis.

A failed request should produce an explicit execution record rather than silently disappearing from the dataset.

### 3.6 Evaluation and aggregation

Applies the configured scoring procedure to recorded outputs, validates scoring completeness, and calculates the required metrics.

The aggregation stage should not silently transform missing scores into passes, failures, or zeros unless that treatment is explicitly part of the metric definition.

### 3.7 Reporting

Produces a report that connects the results to the exact evaluation run, configurations, dataset, and scoring procedure.

A report should distinguish observed results from interpretations and recommendations.

## 4. Version the Inputs That Affect Results

An evaluation result depends on multiple versioned artifacts. Versioning only the Python code is insufficient.

### 4.1 Dataset versioning

A dataset should have a stable identifier and version.

For example:

- Dataset: `support-evaluation`
- Version: `v1.3`
- Cases: Stable case identifiers
- Provenance: Source or generation process
- Changes: Added, modified, and removed cases

Dataset versioning allows engineers to distinguish a model regression from a benchmark change.

If the dataset changes between two runs, the resulting scores may no longer be directly comparable.

Chapter 02 covers dataset design, provenance, leakage, and integrity.

### 4.2 Prompt versioning

Prompts are part of the evaluated system.

A prompt version should capture the actual instructions and template structure used during execution.

A practical record may include:

- Prompt identifier.
- Human-readable version.
- Content hash.
- Template variables.
- Associated system configuration.

A content hash can detect changes that are not reflected in a manually maintained version label.

### 4.3 Model and generation configuration

Record the model identifier and all relevant generation settings.

Depending on the provider and model, these may include:

- Temperature.
- Top-p or other sampling parameters.
- Maximum output tokens.
- Stop sequences.
- Structured-output constraints.
- Tool definitions and permissions.
- Provider-specific options.

Some settings may be unsupported or ignored by particular models. Record the effective settings where they are available rather than assuming that submitting a parameter guarantees its application.

### 4.4 Evaluator versioning

An evaluation score can change even when the model output remains identical.

For example, a new evaluator version may introduce different normalization, update a rubric, or change an LLM judge prompt.

Record the evaluator implementation, configuration, rubric version, and judge-model information where applicable.

Preserving raw outputs allows the team to rerun a new evaluator against the same model responses and separate scoring changes from generation changes.

### 4.5 Code and environment versioning

Record the software revision used for the evaluation.

Depending on the workflow, relevant details may include:

- Git commit identifier.
- Dependency lockfile or package versions.
- Runtime version.
- Evaluation code version.
- Relevant operating-system or hardware details.
- Environment-specific settings that affect behavior.

Avoid recording secrets, access tokens, or unnecessary sensitive environment values.

## 5. Separate Configuration, Execution, and Scoring

A maintainable evaluation workflow separates three concerns.

**Configuration** defines what should run.

**Execution** obtains model outputs.

**Scoring** evaluates recorded outputs.

Combining these concerns makes debugging and experimentation unnecessarily expensive.

### 5.1 Configuration

An evaluation configuration should describe the run without embedding all the execution logic inside it.

For example, a conceptual configuration might contain:

```yaml
evaluation_id: support-model-comparison
dataset:
  name: support-evaluation
  version: v1.3

candidates:
  - id: baseline
    model: provider/model-a
    prompt_version: support-v3
  - id: candidate
    model: provider/model-b
    prompt_version: support-v3

execution:
  max_attempts: 3
  timeout_seconds: 30

evaluation:
  metrics:
    - task_success
    - output_validity
```

This is an illustrative configuration, not a complete executable schema. The meaning of each field must be defined by the actual implementation.

The example also assumes that both candidates intentionally use the same prompt. A comparison intended to test prompt changes would define the candidates differently.

### 5.2 Execution

The execution component should:

1. Load the resolved configuration.
2. Validate the input case.
3. Build the model request.
4. Execute the request under the configured policy.
5. Record the output or failure.
6. Persist the execution record.

It should not calculate every quality metric as part of the same model-call function.

This separation enables independent testing of the request builder, retry logic, persistence, and scoring components.

### 5.3 Scoring

The scoring component consumes recorded outputs and applies a versioned evaluation procedure.

It should support:

- Re-evaluating outputs with a revised metric implementation.
- Comparing evaluator versions.
- Inspecting per-case score differences.
- Recomputing aggregate metrics from persisted case-level results.

Scoring should not silently call the model again when a recorded output is available. If an evaluator itself requires an LLM call, that call should be recorded as a separate evaluation execution.

## 6. Persist Raw Outputs and Execution Records

Raw outputs are essential evidence. An aggregate score alone is insufficient for detailed investigation.

### 6.1 Model execution record

A useful execution record can contain:

```json
{
  "run_id": "run-2026-001",
  "case_id": "case-0042",
  "candidate_id": "candidate",
  "model_id": "provider/model-b",
  "prompt_version": "support-v3",
  "status": "succeeded",
  "output": "The requested policy detail is not present in the supplied text.",
  "input_tokens": 145,
  "output_tokens": 16,
  "latency_ms": 842
}
```

The values are illustrative. A real record should include the fields required by the evaluation contract and the metadata actually available from the provider.

The record should also be linked to the dataset version, execution configuration, software revision, and relevant evaluator run.

### 6.2 Distinguish execution outcomes

An evaluation case can produce several different outcomes:

- The request completed and returned an output.
- The request timed out.
- The provider returned an error.
- The response could not be parsed.
- The output violated a required format.
- The evaluator failed.
- The output was successfully scored.

These states should not be collapsed into a single pass/fail field.

A malformed model response is different from a provider timeout. A valid model response that fails the task is different from a judge that crashes before scoring it.

Explicit status fields preserve these distinctions.

### 6.3 Store both raw and derived evidence

Raw outputs support later inspection and rescoring.

Derived records contain scores, normalized values, category labels, and other results produced by evaluation logic.

Store enough linkage to determine:

- Which raw output produced a score.
- Which evaluator version produced the score.
- Which metric definition was applied.
- Whether the score was subsequently recalculated.

Avoid overwriting previous scores when evaluator logic changes. Create a new scoring record linked to the same raw output.

### 6.4 Protect sensitive data

Evaluation artifacts may contain user inputs, proprietary information, or personal data.

Apply appropriate controls:

- Use synthetic or authorized evaluation data where possible.
- Restrict access to raw inputs and outputs.
- Avoid placing credentials or secrets in prompts and logs.
- Define retention and deletion policies.
- Redact sensitive values when full content is unnecessary for the evaluation.
- Preserve sufficient metadata to explain the evaluation without retaining data indefinitely.

Reproducibility does not justify collecting or retaining unnecessary sensitive information.

## 7. Handle Retries, Failures, and Partial Runs

A reproducible workflow must make failures visible.

A pipeline that silently skips failed cases can produce misleading metrics because the remaining cases may not represent the original dataset.

### 7.1 Define retry behavior

Retries may be appropriate for transient network errors, rate limits, or temporary provider failures.

The retry policy should specify:

- Which failures are retryable.
- Maximum attempts.
- Timeout behavior.
- Backoff strategy where applicable.
- Whether the final outcome remains a failure after retry exhaustion.

Do not automatically retry every error. A malformed request or invalid configuration may require immediate investigation rather than repeated execution.

### 7.2 Distinguish retries from new attempts

Each execution attempt should be traceable to its evaluation case and candidate.

For example, a request may time out on its first attempt and succeed on the second.

The system should retain the attempt history while also defining which result contributes to the evaluation outcome.

This matters because retry policies affect observed reliability, latency, and cost.

### 7.3 Avoid duplicate side effects

For evaluation workflows that interact with external systems, retries can repeat operations.

Where model calls trigger tools or state changes, the workflow must distinguish a retryable read-only request from an operation that may already have succeeded remotely.

Use idempotency controls or isolated test environments when appropriate. Do not assume that a timeout means the remote operation did not happen.

### 7.4 Define run completeness

A run should have an explicit status, such as:

- `pending`
- `running`
- `completed`
- `completed_with_errors`
- `failed`
- `cancelled`

These are example status values; the implementation may use a different schema.

A completed run should satisfy a defined completion contract. For example, every required case must have a terminal execution status, and all required score records must either exist or be explicitly marked unavailable.

A run with missing cases should not be reported as fully complete merely because the successful cases were scored.

### 7.5 Report failures separately from task failures

Consider a dataset with 100 cases:

- 90 requests complete successfully.
- 6 outputs fail the task criteria.
- 4 requests time out before producing outputs.

The completed outputs alone do not describe the whole evaluation.

A report should distinguish execution completion, task performance among completed outputs, and the overall failure rate. It should also explain how incomplete requests are handled in the acceptance decision.

Do not silently remove timeouts from the denominator if doing so makes the candidate appear more reliable.

## 8. Caching and Reusing Evaluation Results

Caching can reduce evaluation cost and make repeated analysis faster, but an incorrect cache can invalidate a comparison.

### 8.1 Cache model outputs carefully

A cached output is reusable only when the relevant request conditions match the intended reuse policy.

A cache key may need to include:

- Model identifier and available version.
- Prompt content or version.
- Input case and context.
- Generation parameters.
- Tool and output constraints.
- Other provider-specific request options.

If a relevant input changes, the previous output may no longer represent the intended execution.

### 8.2 Separate generation caching from scoring caching

Generation caching reuses a previously recorded model output.

Scoring caching reuses a previously calculated evaluation result.

These have different invalidation requirements.

- A prompt change may invalidate the generation result.
- An evaluator change may invalidate the score while leaving the raw model output reusable.
- A metric-definition change may require recalculating aggregate metrics from existing case-level scores.
- A judge-model change may require rerunning the judge, even if the candidate's raw output is unchanged.

Represent these dependencies explicitly rather than treating the entire evaluation as one opaque cached result.

### 8.3 Make cache usage visible

Record whether each result was newly generated or reused from a cache.

For stochastic models, a cached result does not represent a new independent generation sample.

If the experiment is intended to estimate run-to-run variability, repeatedly reading the same cached output cannot provide that evidence.

### 8.4 Do not confuse cost savings with reproducibility

Caching makes workflows more efficient, but it does not guarantee that the original execution was valid.

Cached results still require correct provenance, configuration identity, and evaluation status.

## 9. Build Traceable Evaluation Reports

A report should be a view of the evaluation evidence, not an independent collection of manually copied numbers.

### 9.1 Report structure

A useful report includes the following.

**Evaluation identity**

- Run ID.
- Execution date.
- Software revision.
- Run status.

**Objective and scope**

- Comparison question.
- Target workload.
- Primary metric.
- Acceptance constraints.

**Candidate configuration**

- Model and available version metadata.
- Prompt and generation configuration.
- Relevant differences between candidates.

**Dataset and evaluation**

- Dataset version.
- Number of required cases.
- Number of completed and failed executions.
- Evaluator and metric versions.

**Results**

- Aggregate metrics.
- Per-category results.
- Hard-constraint violations.
- Cost and latency where relevant.
- Uncertainty estimates where appropriate.

**Failure analysis**

- Representative failures.
- Execution errors.
- Regressions and improvements.
- Known evaluation limitations.

**Decision**

- Whether predefined requirements were met.
- What the results support.
- What remains uncertain.
- What further validation is needed.

### 9.2 Preserve case-level traceability

Every aggregate metric should be traceable to the individual observations from which it was calculated.

For example, a task-success rate should identify the relevant set of case-level outcomes and the rule used to aggregate them.

This allows engineers to investigate discrepancies, reproduce calculations, and detect errors in aggregation.

### 9.3 Keep interpretation separate from observation

A report should distinguish:

- **Observation:** The candidate passed 87 of 100 completed cases.
- **Derived metric:** The task-success rate among completed cases was 87%.
- **Interpretation:** The candidate performed better than the baseline on this metric under the evaluated conditions.
- **Limitation:** Three additional requests timed out, and the evidence may not generalize to the production workload.

The numbers above are illustrative. The distinction matters because an observation, a calculation, and an engineering conclusion require different kinds of justification.

### 9.4 Generate reports from recorded results

Generate aggregate metrics and report tables from persisted evaluation records rather than copying values manually.

This reduces transcription errors and makes report regeneration possible when the formatting changes but the underlying evidence does not.

## 10. Regression Detection and Historical Comparison

A reproducible evaluation workflow enables comparison across runs, not just comparison between two candidates in a single run.

### 10.1 Define regression rules

A regression rule describes a change that requires investigation or prevents acceptance.

Examples include:

- Task-success rate falls below an agreed threshold.
- A mandatory output schema becomes invalid more frequently.
- Correct abstention falls below the required minimum.
- A critical task category experiences an unacceptable regression.
- Latency exceeds a defined operational limit.

Thresholds should reflect application requirements and risk. They should not be selected after seeing which threshold makes a candidate pass.

### 10.2 Compare compatible runs

Before comparing two historical runs, verify that their datasets, metric definitions, and relevant configurations are compatible with the intended comparison.

If the dataset or evaluator has changed, the score difference may reflect the evaluation change rather than a model regression.

Where changes are intentional, document them and avoid presenting the results as a direct apples-to-apples comparison unless the design supports that conclusion.

### 10.3 Investigate the cause of a regression

When a regression appears:

1. Identify the metric and affected task categories.
2. Compare the relevant run configurations.
3. Inspect case-level score differences.
4. Examine raw outputs for representative failures.
5. Check for dataset, evaluator, and execution changes.
6. Form a hypothesis about the cause.
7. Run a targeted experiment to test that hypothesis.
8. Record the conclusion and remaining uncertainty.

A regression report should not stop at stating that a score decreased. It should support the next engineering action.

## 11. Practical Lab: Build a Reproducible Evaluation Workflow

### 11.1 Scenario

A team maintains a support assistant and wants to compare its baseline configuration with a candidate model configuration.

The team already has a small evaluation dataset and a task-success metric. The goal is to create a workflow that can run the comparison, preserve its evidence, and regenerate its report without repeating unnecessary model calls.

The lab uses a local dataset and a model-provider interface. Provider credentials and live model calls are environment-specific and should not be embedded in the evaluation artifacts.

### 11.2 Define the project structure

One possible implementation is:

```text
evaluation/
├── configs/
│   └── support_comparison.yaml
├── datasets/
│   └── support_evaluation_v1.jsonl
├── src/
│   ├── config.py
│   ├── dataset.py
│   ├── runner.py
│   ├── persistence.py
│   ├── scoring.py
│   └── reporting.py
├── results/
│   └── runs/
├── tests/
│   ├── test_dataset.py
│   ├── test_runner.py
│   ├── test_scoring.py
│   └── test_reporting.py
└── README.md
```

This is a suggested structure, not a required repository layout.

Keep credentials outside version-controlled configuration files. Store only approved evaluation artifacts in the repository, and apply access controls to sensitive raw results.

### 11.3 Define the dataset contract

Create a small dataset with stable case identifiers and explicit evaluation criteria.

For example:

```json
{
  "case_id": "case-001",
  "category": "answerable",
  "input": "What is the documented refund window?",
  "context": "Customers may request a refund within 30 days.",
  "expected_behavior": "Answer using the supplied policy.",
  "required_constraints": ["must_use_supplied_context"]
}
```

This example illustrates a data contract; the actual schema must be validated by the implementation.

Include answerable questions, missing-information cases, and output-constraint cases if they match the evaluation objective.

### 11.4 Create the evaluation configuration

Define the candidates, dataset version, generation settings, and scoring procedure in a versioned configuration file.

Verify that each candidate resolves to the intended model and prompt configuration.

Before execution, reject invalid settings rather than silently substituting defaults that change the experiment.

### 11.5 Implement the execution runner

The runner should:

1. Load and validate the configuration.
2. Load the versioned dataset.
3. Create a unique run identifier.
4. Generate a record for every case and candidate.
5. Execute requests using the configured retry and timeout policy.
6. Persist outputs, failures, and attempt metadata.
7. Record the final run status.

Write unit tests for configuration validation, case identity, error handling, and run completeness.

For testing the runner without provider access, use a deterministic fake model adapter that returns predefined outputs and failures. This makes the pipeline testable without incurring model-call costs.

### 11.6 Implement scoring independently

The scoring component should read persisted outputs and produce case-level score records.

It should not make a new candidate-model request merely because a score needs to be recalculated.

Record the scoring implementation version and the output record to which each score belongs.

Add tests covering:

- Correct outputs.
- Incorrect outputs.
- Malformed responses.
- Missing outputs.
- Evaluator errors.
- Repeated scoring with the same deterministic evaluator.

Missing outputs must remain distinguishable from valid outputs that fail the task.

### 11.7 Implement aggregation and completeness checks

Calculate the required metrics from case-level records.

Before declaring the run complete, verify that all required cases and candidate combinations have terminal execution statuses and that required scoring outcomes are accounted for.

If some requests failed, report execution completion and task performance separately. Apply the predefined decision policy to the incomplete cases rather than silently dropping them.

### 11.8 Generate the report

Produce a report containing:

- Run and configuration identifiers.
- Dataset and evaluator versions.
- Candidate-level metrics.
- Category-level outcomes.
- Execution failures and retry counts.
- Cost and latency, if collected.
- Relevant uncertainty estimates.
- Representative failure cases.
- Known limitations and the decision rationale.

The report should be regenerated from persisted records, not manually edited metric values.

### 11.9 Verify reproducibility

Run the lab's checks:

1. Execute the workflow using the fake model adapter.
2. Verify that all required execution records are created.
3. Regenerate the report from the persisted records.
4. Confirm that deterministic scoring produces the same results.
5. Change the scoring implementation version and verify that the old score records remain available.
6. Change the prompt version and verify that the configuration identity changes.
7. Simulate a timeout and confirm that it is recorded rather than silently omitted.
8. Re-run aggregation and confirm that the same persisted inputs produce the same deterministic aggregate results.

If a live model provider is used, document which outputs are newly generated, which are reused, and which conditions may prevent exact reproduction.

### 11.10 Completion criteria

The lab is complete when:

- Configuration and dataset versions are recorded.
- Every required case has an explicit execution outcome.
- Raw outputs and errors are persisted.
- Scores can be regenerated from recorded outputs.
- Missing cases and evaluator failures are visible.
- Reports can be regenerated without manual metric editing.
- Configuration changes are traceable.
- Tests cover the main execution and scoring failure modes.
- Reproducibility limitations are documented.

The objective is not to build a large evaluation platform. It is to implement a small workflow whose evidence can be inspected, regenerated, and trusted.

## 12. Common Reproducibility Mistakes

### Saving only aggregate scores

An aggregate score cannot explain individual failures or support rescoring with a new evaluator.

**Better practice:** Preserve case-level outcomes and the raw outputs required for later inspection.

### Versioning code but not evaluation inputs

Identical code can produce different results when the dataset, prompt, model, or evaluator changes.

**Better practice:** Version the artifacts that materially affect the evaluation.

### Silently dropping failed requests

Removing timeouts or malformed responses can make a system appear more reliable than it is.

**Better practice:** Preserve execution outcomes and apply explicit completeness and acceptance rules.

### Reusing cached outputs without checking configuration identity

A cached response may come from a different prompt, model version, or context.

**Better practice:** Use a cache key that reflects the request conditions and make cache reuse visible.

### Re-running the model to recalculate a metric

This introduces new generation variability and makes it harder to separate model changes from evaluator changes.

**Better practice:** Rescore recorded outputs when the scoring change does not require new model execution.

### Overwriting previous evaluation records

Replacing historical scores removes evidence needed to explain changes.

**Better practice:** Store immutable run records and link each score to the evaluator version that produced it.

### Claiming exact reproducibility for mutable hosted models

A provider may change model behavior or infrastructure without exposing an immutable version.

**Better practice:** Preserve available version metadata and raw outputs, then state the remaining limitations.

### Generating reports manually

Manual copying introduces transcription errors and weakens traceability.

**Better practice:** Generate reports directly from persisted, validated evaluation records.

## 13. Summary

A reproducible evaluation workflow preserves the evidence required to understand, verify, and compare language-model evaluation results.

A sound workflow:

- Defines an explicit evaluation objective.
- Versions datasets, prompts, model configurations, and evaluators.
- Separates configuration, execution, scoring, and reporting.
- Persists raw outputs and execution metadata.
- Makes failures, retries, and incomplete runs visible.
- Uses caching with explicit dependency and invalidation rules.
- Preserves historical results.
- Generates traceable reports from recorded evidence.
- Supports regression investigation.
- Tests the workflow itself.
- Documents limits to exact reproduction.

The objective is not to eliminate every source of variability. It is to make the evaluation procedure and its evidence sufficiently transparent that engineers can determine what happened, why results differ, and which conclusions are justified.

## 14. Knowledge Check

Answer these questions in your own words:

1. Why is saving an aggregate score insufficient for a reproducible evaluation?
2. Which artifacts must be versioned beyond the evaluation code?
3. Why should execution and scoring be separate stages?
4. How should a workflow distinguish a failed request from an incorrect model answer?
5. When is it valid to reuse a cached model output?
6. Why should an evaluator change not overwrite historical score records?
7. How can retries affect reliability, latency, cost, and side effects?
8. What information should a benchmark report preserve for later investigation?
9. Why can two evaluation runs with identical code still be incomparable?
10. What does reproducibility mean when a hosted model cannot guarantee identical future outputs?
11. How would you investigate a regression without immediately assuming that the model caused it?
12. Which tests would you implement first to establish confidence in a new evaluation pipeline?

## 15. Connections to Other Chapters

- **Chapter 01 — Evaluation Foundations and Objectives:** Defines the evaluation question and decision criteria.
- **Chapter 02 — Evaluation Dataset Design and Data Integrity:** Establishes dataset quality, provenance, and versioning requirements.
- **Chapter 03 — Metrics for Language Model Evaluation:** Defines the metrics and their calculation.
- **Chapter 04 — Human Evaluation and Rubric Design:** Covers reproducible annotation procedures and rubric management.
- **Chapter 05 — Automated Evaluation and LLM-as-a-Judge:** Covers evaluator configuration, validation, and known limitations.
- **Chapter 06 — Task-Specific and Application-Level Evaluation:** Connects recorded outputs and metrics to task and application behavior.
- **Chapter 07 — Benchmarking and Controlled Model Comparison:** Defines controlled candidate comparisons.
- **Chapter 08 — Experimental Design and Statistical Interpretation:** Explains how to interpret observed differences and uncertainty.
- **LLM-10 — Model Selection and Adaptation:** Uses evaluation evidence to support broader model-selection decisions.

LLM-08 establishes how to evaluate language models, compare candidates, interpret evidence, and preserve the evaluation process. Together, these practices provide a foundation for making model-related engineering decisions that are transparent, repeatable where feasible, and supported by traceable evidence.
