# 08 — Controlled Adaptation Experiment and Practical Lab

## 1. Purpose

This chapter applies the engineering principles developed throughout LLM-09 to a bounded model-adaptation experiment.

The objective is not simply to fine-tune a model or obtain a higher score. It is to determine whether a justified adaptation intervention improves a defined task sufficiently to justify its training cost, resource consumption, and additional complexity.

The lab follows a controlled workflow:

1. Define the task, constraints, and acceptance criteria.
2. Establish a baseline using a pretrained model.
3. Prepare and validate a labeled dataset.
4. Select a justified adaptation approach.
5. Train and select an adapter using a predefined validation policy.
6. Evaluate the base and adapted models on the same held-out examples.
7. Compare quality, regressions, and resource costs.
8. Make and document an evidence-based engineering decision.

The lab uses supervised fine-tuning with Low-Rank Adaptation (LoRA) as the primary adaptation approach. It is intentionally bounded and does not attempt to build a general-purpose training platform or production-serving system.

### Expected outcomes

By completing the core lab, the engineer should be able to explain:

- Why adaptation was selected instead of a simpler alternative.
- What behavioral change the experiment was designed to produce.
- How the base and adapted models were compared.
- Whether the observed benefit justified the additional cost.
- What limitations prevent the result from being generalized.
- Whether to accept, revise, reject, or further investigate the adaptation.

## 2. Lab Scenario and Acceptance Criteria

Assume an engineering team is building an internal support assistant. The assistant receives a short support request and must return exactly one of four categories:

- `ACCOUNT_ACCESS`
- `BILLING`
- `TECHNICAL_ISSUE`
- `GENERAL_INQUIRY`

Example:

**Input**

> I can sign in successfully, but my latest invoice includes a charge I do not recognize.

**Expected output**

`BILLING`

A general-purpose language model may understand the request but produce inconsistent labels, explanatory paragraphs, or labels outside the permitted set.

The team wants to determine whether supervised adaptation can improve task-specific behavior.

### 2.1 Requirements

| Requirement | Acceptance condition |
|---|---|
| Output contract | Return exactly one permitted category label |
| Task quality | Meet the predefined exact-label accuracy threshold |
| Label validity | Measure the rate of outputs that exactly satisfy the label contract |
| Generalization | Evaluate examples excluded from training and model-selection decisions |
| Resource feasibility | Remain within the defined training and inference resource budgets |
| Reproducibility | Record model identity, dataset version, configuration, and relevant environment details |
| Decision quality | Document the evidence, limitations, and final outcome |

For this lab, use **at least 90% exact-label accuracy on the held-out evaluation set** as an illustrative task-quality threshold.

This threshold is not a universal standard. A real application must define its acceptance criteria based on the consequences of errors, workload, and business requirements.

The evaluation set must also be adequate for the decision being made. A small sample can produce an apparently high accuracy rate while providing weak evidence about expected performance. There is no universal minimum sample size appropriate for every task.

Before training, record the acceptance threshold, mandatory constraints, and any acceptable regression limits.

## 3. Experiment Design

### 3.1 State the hypothesis

Use a hypothesis that connects the proposed intervention to measurable outcomes.

> Supervised parameter-efficient adaptation on representative, correctly labeled support requests will improve exact-label classification accuracy compared with the unadapted base model, while preserving output-contract compliance and remaining within the available resource budget.

This hypothesis contains separate claims:

1. Task quality should improve.
2. Output behavior must satisfy the defined contract.
3. Resource consumption must remain acceptable.
4. The improvement must justify the additional complexity.

These claims must be evaluated separately. Improved accuracy does not automatically establish output compliance or justify adaptation costs.

### 3.2 Define the primary comparison

The primary comparison is:

- The same pretrained base model before adaptation.
- The same base model with the trained adapter applied.

Keep the following equivalent wherever applicable:

- Base-model revision.
- Task instruction.
- Held-out examples and expected labels.
- Evaluation implementation and scoring rules.
- Generation configuration and stopping conditions.
- Runtime environment and measurement boundaries.

Record any unavoidable differences.

The primary experiment investigates the effect of adaptation. It must not silently combine adaptation with changes to the task instructions, evaluation data, or scoring implementation.

### 3.3 Separate prompt refinement from adaptation

A clearer instruction may resolve a classification problem without training.

If the existing prompt is inadequate, prompt refinement is a plausible alternative. However, it should be evaluated as a separate experiment with its own defined comparison.

For the primary adaptation experiment, establish the baseline instruction before training and preserve it for the base-versus-adapted comparison.

If prompt refinement is later investigated, compare it with the same task requirements and relevant evaluation data. Do not attribute an improvement to LoRA when the improvement could instead result from a changed prompt.

### 3.4 Select the intervention

For this lab, use supervised fine-tuning with LoRA, assuming the selected model and training stack support it.

For a selected weight matrix \(W\), the conceptual update is:

\[
W' = W + \Delta W
\]

A simplified low-rank update is:

\[
\Delta W = BA
\]

The exact orientation, scaling, and application of the update depend on the implementation.

LoRA introduces trainable low-rank updates while keeping the original pretrained weights frozen during adapter training. This can reduce the number of trainable parameters and the size of the adaptation artifact compared with full fine-tuning.

It does not guarantee improved task quality, eliminate training costs, or compensate for poor training data.

### 3.5 Record the alternatives

Before training, identify plausible alternatives:

- Retain the base model without changes.
- Improve the prompt in a separate experiment.
- Evaluate a different model.
- Adapt the current model.

Explain why the proposed adaptation experiment is worth conducting.

If the baseline already satisfies the requirements, or a simpler intervention already resolves the problem, adaptation may not be justified.

## 4. Dataset Preparation

Dataset quality directly affects the experiment's validity.

### 4.1 Define the data schema

Each record contains the support-request text and its expected category.

Example JSONL records:

```json
{"text":"I cannot access my account after resetting my password.","label":"ACCOUNT_ACCESS"}
{"text":"My subscription renewal was charged twice.","label":"BILLING"}
{"text":"The application crashes when I upload a document.","label":"TECHNICAL_ISSUE"}
{"text":"What are your support hours?","label":"GENERAL_INQUIRY"}
```

These records illustrate the schema; they are not sufficient training data for a meaningful experiment.

The actual dataset should contain enough representative variation to cover the task's language, category boundaries, and likely input patterns.

### 4.2 Validate the data

Before training, verify that:

- Every record has a non-empty input.
- Every label belongs to the permitted category set.
- Duplicate examples have been identified.
- Conflicting labels have been investigated.
- Examples represent the intended task.
- Sensitive information is handled according to applicable requirements.
- Category counts are recorded.

Small datasets are especially vulnerable to mislabeled examples and duplicated templates that distort the measured outcome.

### 4.3 Split the data

Create three logically separate splits.

| Split | Responsibility |
|---|---|
| Training | Updates adapter parameters |
| Validation | Supports checkpoint selection and other predefined training decisions |
| Held-out evaluation | Measures the final candidate without influencing training or model selection |

Where examples come from related conversations, customers, support tickets, or templates, consider grouped splitting rather than random row-level splitting. Related examples appearing across splits can create leakage.

Inspect category distributions in all three splits. If a category has too few evaluation examples to support a useful conclusion, document that limitation rather than treating its measured performance as reliable.

The held-out evaluation set must not be repeatedly used to select hyperparameters or checkpoints.

### 4.4 Decide whether the evaluation set is adequate

Evaluation adequacy depends on:

- The number of examples.
- The number and distribution of categories.
- The diversity of the intended workload.
- The consequence of incorrect predictions.
- The size of the improvement being investigated.
- The uncertainty acceptable for the decision.

Report the number of examples alongside every reported rate.

If the evaluation set is too small or unrepresentative to distinguish a meaningful improvement from sampling variation, collect more appropriate evaluation data or classify the result as inconclusive.

Do not invent a universal sample-size threshold.

### 4.5 Preserve a data manifest

Record:

- Dataset version or content hash.
- Counts for each split.
- Category distribution.
- Preprocessing rules.
- Duplicate-handling decisions.
- Label-validation results.
- Split-generation seed or grouping rule.

The manifest must identify the data used for the run, not just the names of the dataset files.

## 5. Establish the Baseline

Before training, evaluate the unadapted model using the defined task instruction.

Example:

> Classify the support request into exactly one of these categories: ACCOUNT_ACCESS, BILLING, TECHNICAL_ISSUE, GENERAL_INQUIRY. Return only the category label.

The same instruction and evaluation contract must be used for the primary base-versus-adapted comparison.

### 5.1 Define the output contract

The raw model response must be evaluated against the specified output contract.

| Raw response | Valid under the strict contract? | Exact-label correct? |
|---|---|---|
| `BILLING` | Yes | Yes, if the expected label is `BILLING` |
| `The correct category is BILLING.` | No | No |
| `PAYMENTS` | No | No |
| Empty response | No | No |

For this lab, **exact-label accuracy** is the proportion of held-out examples for which the raw response exactly equals the expected label.

**Valid-label rate** is the proportion of responses that exactly match one of the permitted labels.

For the strict contract, a response containing the correct label plus extra text is invalid and incorrect.

If a real application uses parsing or normalization, evaluate that as a separate, explicitly defined application stage. Do not silently clean model responses and then report the cleaned results as raw model behavior.

### 5.2 Record baseline measurements

Capture:

- Exact-label accuracy.
- Valid-label rate.
- Extra-text and malformed-output rate.
- Errors by category.
- Relevant inference latency.
- Relevant inference memory consumption.
- Representative failure cases.

Use the same evaluation implementation for the base and adapted models.

Latency and memory are supporting measurements unless the experiment explicitly makes them optimization objectives. Define the workload and measurement boundaries before comparing them.

### 5.3 Inspect failure cases

Categorize observed failures where possible:

- Confusion between categories.
- Unsupported label.
- Extra explanatory text.
- Misinterpretation of the request.
- Ambiguous or insufficient input.
- Other unexplained behavior.

This inspection helps determine whether the proposed intervention addresses a real limitation.

If the baseline already satisfies the requirements, reconsider whether adaptation has sufficient expected value to justify its cost.

## 6. Executable Implementation Workflow

This section defines the minimum implementation path for turning the experiment design into a runnable lab.

Use a compatible training stack such as PyTorch, Hugging Face Transformers, and PEFT. Exact package versions depend on the selected model, hardware, and runtime. Pin compatible versions in the project environment before the experiment.

The workflow below defines the required components and their contracts. It is an implementation specification, not a claim that one set of dependencies or commands works for every model.

### 6.1 Project structure

Create a bounded experiment project:

```text
controlled-adaptation-lab/
├── README.md
├── requirements.txt
├── config/
│   └── experiment.yaml
├── data/
│   ├── train.jsonl
│   ├── validation.jsonl
│   ├── evaluation.jsonl
│   └── dataset-manifest.json
├── src/
│   ├── validate_data.py
│   ├── evaluate.py
│   ├── train_adapter.py
│   └── compare_results.py
├── artifacts/
│   └── adapter/
└── reports/
    ├── baseline-results.json
    ├── adapted-results.json
    ├── resource-measurements.json
    └── decision-record.md
```

Keep large model weights and datasets in their appropriate storage locations when necessary. The structure represents logical ownership, not a requirement to duplicate large artifacts into the repository.

### 6.2 Define the experiment configuration

Create `config/experiment.yaml` with at least the following information:

```yaml
task:
  labels:
    - ACCOUNT_ACCESS
    - BILLING
    - TECHNICAL_ISSUE
    - GENERAL_INQUIRY
  accuracy_threshold: 0.90

model:
  base_model: "<model-identifier>"
  revision: "<model-revision>"
  tokenizer_revision: "<tokenizer-revision>"

data:
  train: "data/train.jsonl"
  validation: "data/validation.jsonl"
  evaluation: "data/evaluation.jsonl"

training:
  seed: 42
  max_sequence_length: "<chosen-limit>"
  learning_rate: "<chosen-value>"
  batch_size: "<chosen-value>"
  epochs: "<chosen-limit>"
  lora_rank: "<chosen-rank>"
  lora_alpha: "<chosen-scaling>"
  target_modules: "<model-specific-modules>"

evaluation:
  instruction_version: "classification-v1"
  output_contract: "exact-label"
```

The quoted placeholders are intentional: they must be replaced with concrete, supported values before execution.

The LoRA target modules, sequence length, precision, and training configuration are model- and hardware-dependent. Do not copy arbitrary values without checking compatibility and resource feasibility.

Store the final resolved configuration with each run. Do not overwrite the original record after seeing evaluation results.

### 6.3 Validate the dataset

Implement `src/validate_data.py`.

Its responsibilities are to:

1. Load each split.
2. Validate the required fields and label vocabulary.
3. Reject empty inputs and invalid labels.
4. Report duplicate and conflicting records.
5. Report split sizes and category counts.
6. Verify that the splits do not contain known overlapping records that violate the splitting policy.
7. Produce or verify `data/dataset-manifest.json`.

Expected result:

- Validation succeeds with a recorded manifest, or
- Validation fails with actionable errors that must be resolved before training.

A successful schema check does not prove that labels are semantically correct. Label-quality inspection remains necessary.

### 6.4 Implement a shared evaluation interface

Implement `src/evaluate.py` with the following conceptual interface:

```python
def evaluate_model(
    model,
    tokenizer,
    dataset,
    instruction,
    allowed_labels,
):
    """
    Generate one response per example.

    Preserve the raw response.
    Calculate exact-label accuracy and valid-label rate.
    Record category-level errors and relevant metadata.
    Return a structured result.
    """
```

This is an interface specification, not a complete evaluator.

The implementation must define generation settings, model-specific input formatting, stopping conditions, error handling, and metric calculations.

Use this same evaluator for the base model and adapted model. Differences in model loading should not change the scoring rules.

Write the results to JSON with:

- Model and adapter identifiers.
- Evaluation dataset version.
- Example count.
- Metric definitions and values.
- Per-category results.
- Failure records.
- Relevant environment and configuration references.

Do not record only the aggregate accuracy.

### 6.5 Run baseline evaluation

Implement the base-model loading path and execute the evaluator before training.

Illustrative command:

```bash
python -m src.evaluate \
  --config config/experiment.yaml \
  --model-mode base \
  --output reports/baseline-results.json
```

The command defines the intended interface. Implement the corresponding argument parsing and execution logic in the project.

Verify that the run:

- Loads the intended base-model revision.
- Uses the correct task instruction.
- Evaluates the intended held-out examples.
- Produces valid structured results.
- Preserves raw responses and failure information.

If the evaluation implementation is incorrect or the baseline cannot be reproduced, do not proceed to interpret adaptation results.

### 6.6 Implement adapter training

Implement `src/train_adapter.py` using the chosen training framework.

The training process must:

1. Load the specified base model and tokenizer.
2. Apply the supported chat template or input format.
3. Configure LoRA for supported target modules.
4. Prepare supervised training examples.
5. Apply the loss to the intended target tokens.
6. Train using the training split.
7. Evaluate against the validation split according to the predefined policy.
8. Save the selected adapter and configuration.
9. Record training duration, resource use, and checkpoint-selection rationale.

For conversational models, verify that the training objective does not unintentionally apply loss to user instructions when only the assistant response is intended as the supervised target.

The exact implementation depends on the model architecture and training library. Inspect tokenized examples and labels rather than assuming the text template creates the intended training objective.

Illustrative command:

```bash
python -m src.train_adapter \
  --config config/experiment.yaml \
  --output artifacts/adapter
```

Implement this command in the training script. A framework's default training behavior is not a substitute for verifying the dataset, loss mask, validation policy, and saved artifacts.

### 6.7 Evaluate the adapted model

Load the same base-model revision and apply the selected adapter using the supported loading mechanism.

Illustrative command:

```bash
python -m src.evaluate \
  --config config/experiment.yaml \
  --model-mode adapted \
  --adapter-path artifacts/adapter \
  --output reports/adapted-results.json
```

Use the same held-out dataset and evaluator as the baseline.

Check that the adapter is actually loaded and that the run is not accidentally evaluating the base model again.

### 6.8 Compare the results

Implement `src/compare_results.py`.

The comparison should:

- Verify compatible task and dataset identifiers.
- Verify that the evaluation counts and scoring definitions match.
- Compare exact-label accuracy and valid-label rate.
- Report category-level results.
- Identify material regressions.
- Compare relevant resource measurements.
- Record missing or incomparable measurements instead of treating them as equal.

Illustrative command:

```bash
python -m src.compare_results \
  --baseline reports/baseline-results.json \
  --adapted reports/adapted-results.json \
  --output reports/comparison.json
```

The comparison must not automatically approve the adapter merely because its accuracy is higher. The final decision must check every mandatory requirement and the adequacy of the evidence.

### 6.9 Execute the lab in order

The intended execution sequence is:

```bash
python -m src.validate_data --config config/experiment.yaml

python -m src.evaluate \
  --config config/experiment.yaml \
  --model-mode base \
  --output reports/baseline-results.json

python -m src.train_adapter \
  --config config/experiment.yaml \
  --output artifacts/adapter

python -m src.evaluate \
  --config config/experiment.yaml \
  --model-mode adapted \
  --adapter-path artifacts/adapter \
  --output reports/adapted-results.json

python -m src.compare_results \
  --baseline reports/baseline-results.json \
  --adapted reports/adapted-results.json \
  --output reports/comparison.json
```

These commands establish the required interface and order. They become executable only after the corresponding scripts, argument parsing, compatible dependencies, model-specific configuration, and hardware requirements have been implemented.

The lab is not complete merely because the commands run. The outputs must satisfy the experimental controls defined in this chapter.

## 7. Training Configuration and Control

### 7.1 Record the configuration

Record the following:

| Configuration | Purpose |
|---|---|
| Base model and revision | Identifies the starting model |
| Tokenizer and chat template | Defines the input representation |
| Trainable modules | Determines where adapter updates apply |
| LoRA rank and scaling | Defines the adapter parameterization |
| Learning rate | Influences update magnitude and training stability |
| Batch size and gradient accumulation | Affect optimization and resource requirements |
| Maximum sequence length | Limits input length during training |
| Training-step or epoch limit | Bounds the run |
| Validation and checkpoint policy | Determines which checkpoint is retained |
| Precision and hardware | Affect numerical behavior and resource use |
| Random seed | Supports reproducibility where the stack permits it |

Choose a feasible configuration and record the rationale. The objective is to test the hypothesis, not to conduct an uncontrolled hyperparameter search.

### 7.2 Define checkpoint selection before training

Use a predefined validation policy to select the retained checkpoint.

For example, the policy may select the checkpoint with the best validation exact-label accuracy, with a documented tie-breaking rule.

Alternatively, another justified validation metric may be used if it aligns better with the task requirements.

Early stopping is optional. If used, its monitored metric, patience, and stopping conditions must be defined before training.

Do not select the checkpoint by repeatedly inspecting held-out evaluation results.

### 7.3 Monitor the run

Record:

- Training loss.
- Validation loss or the selected validation metric.
- Training steps and duration.
- Peak training memory.
- Checkpoint-selection decisions.
- Errors, interruptions, and instability.

Training loss alone is insufficient evidence of success. A model can fit its training examples while generalizing poorly.

## 8. Evaluate the Adapted Model

### 8.1 Run the same evaluation procedure

For each held-out request:

1. Apply the fixed task instruction.
2. Generate the response using the specified inference configuration.
3. Preserve the raw response.
4. Evaluate strict output-contract compliance.
5. Compare the prediction with the expected label.
6. Record the result and relevant failure category.

The base and adapted models must use the same evaluation implementation and scoring definitions.

### 8.2 Compare primary and supporting metrics

| Metric | Base model | Adapted model | Acceptance condition |
|---|---|---|---|
| Exact-label accuracy | Measured | Measured | Meets the predefined threshold |
| Valid-label rate | Measured | Measured | Meets the output contract |
| Extra-text rate | Measured | Measured | Within the defined limit |
| Inference latency | Measured | Measured | Within the applicable budget |
| Inference memory | Measured | Measured | Within the applicable budget |

Do not invent results or fill missing measurements with assumed values.

The 90% accuracy threshold is illustrative. Its adequacy depends on the task and the evaluation evidence. A small evaluation set can make the result too uncertain to support a strong acceptance claim even if the observed accuracy exceeds the threshold.

### 8.3 Inspect category-level behavior

Aggregate accuracy can conceal uneven performance.

Inspect:

- Errors by category.
- Frequently confused categories.
- Invalid output patterns.
- Differences between base and adapted failure cases.
- Regressions in categories with fewer examples.

A confusion matrix can identify systematic errors but cannot explain their causes by itself.

If one business-critical category regresses, evaluate that regression against the predefined acceptance requirements rather than dismissing it because aggregate accuracy improved.

### 8.4 Assess uncertainty appropriately

Report the number of evaluation examples and the measured rates.

Where the decision warrants it, quantify uncertainty or collect additional representative evaluation data. Consider whether the evaluation sample represents the intended workload and whether the observed difference is meaningful for the application.

Formal statistical methods and controlled benchmark interpretation belong to LLM-08. This lab must still acknowledge when its evidence is insufficient.

### 8.5 Separate raw behavior from application behavior

The primary experiment measures the raw response against the strict output contract.

If an application parser or normalization layer is part of the intended system, evaluate it separately under an explicitly defined contract.

Do not use parser-corrected outputs for one model and raw outputs for the other. Such comparisons would measure different systems.

## 9. Evaluate Resource Cost and Adaptation Overhead

### 9.1 Training cost

Record:

- Training duration.
- Hardware used.
- Peak training memory.
- Number of training steps.
- Failed or repeated runs.
- Material data-preparation effort.

The purpose is to establish whether the experiment was feasible and whether the improvement justifies its cost.

### 9.2 Artifact and storage cost

Measure the adapter artifact and record its dependency on the base model.

Capture:

- Adapter artifact size.
- Base-model identifier and revision.
- Adapter configuration.
- Required tokenizer or template information.
- Other files required to reproduce inference.

An adapter's small artifact size does not establish that total model storage is small. A system retaining the base model and adapter must account for both.

### 9.3 Inference cost

Measure the adapted model under the intended inference path.

Use comparable workloads, measurement boundaries, and runtime conditions. An adapter does not guarantee faster inference; its effect depends on the model, runtime, and execution path.

If the experiment's objective is task quality rather than performance, treat latency and memory as constraints or supporting measurements. Do not claim a performance optimization without evidence.

### 9.4 Maintenance cost

Consider the additional effort required to:

- Version the adapter.
- Preserve compatibility with the base model.
- Reproduce the training process.
- Validate future data or model changes.
- Investigate regressions.
- Retire an ineffective adapter.

These costs should influence the decision even when the adapter artifact itself is small.

Production lifecycle implementation remains outside this lab.

## 10. Engineering Decision

Choose an outcome based on the evidence, not on the fact that training completed.

### 10.1 Accept

Accept the adaptation for the scope of the experiment when:

- The task-quality requirement is satisfied.
- The output contract is satisfied.
- Resource constraints are respected.
- Improvements are supported by relevant evidence.
- Material regressions are understood and acceptable.
- Additional cost and complexity are justified.
- The evaluation evidence is adequate for the decision.

Acceptance applies only to the demonstrated task and conditions. It does not automatically establish production readiness.

### 10.2 Revise

Revise the approach when the results suggest potential value but identify a specific, addressable problem.

Examples include category confusion, insufficient training coverage, or a checkpoint-selection policy that does not reflect the task objective.

State the proposed change and expected observable effect before running another experiment.

### 10.3 Reject

Reject the adaptation when it violates a mandatory requirement, provides insufficient benefit, or introduces unacceptable costs or regressions.

Examples include:

- Accuracy remains below the required threshold.
- A business-critical category regresses beyond its allowed limit.
- Training and maintenance costs are disproportionate to the improvement.
- A simpler approach achieves comparable results with less complexity.

A failed experiment is useful when it produces reliable evidence against an unsuitable approach.

### 10.4 Mark the result inconclusive

Use this outcome when the available evidence cannot support a reliable decision.

Examples include insufficient or unrepresentative evaluation data, inconsistent scoring implementations, uncontrolled changes, or incomparable resource measurements.

Identify the smallest additional experiment or data collection step needed to resolve the uncertainty.

## 11. Reproducibility and Experiment Record

The experiment must leave enough evidence for another engineer to understand what was done and reproduce the relevant comparison.

Use the project structure from Section 6 and preserve the following records.

### 11.1 Environment and configuration

Record:

- Base model and revision.
- Tokenizer and chat template.
- Training framework and relevant library versions.
- Adapter configuration.
- Training and validation settings.
- Dataset manifest and split rules.
- Evaluation code version.
- Hardware and precision settings.
- Random seeds and known nondeterministic behavior.
- Selected checkpoint and selection rationale.

A random seed alone does not guarantee bit-for-bit reproducibility across hardware, kernels, library versions, or distributed execution configurations. State the degree of reproducibility actually achieved.

### 11.2 Preserve evidence

Keep structured results and sufficient raw-output records to investigate unexpected changes.

Do not preserve only aggregate scores. Raw outputs and categorized failures help verify scoring and identify regressions.

When examples contain sensitive information, follow applicable access, retention, and redaction requirements.

### 11.3 Document limitations

State what the experiment does not establish.

For example, it may not establish performance on every support-request distribution, robustness to adversarial inputs, production latency under concurrent load, or behavior after future model and dataset changes.

The report must distinguish measured evidence from broader assumptions.

## 12. Mandatory Lab Deliverables

These deliverables constitute the **core lab**. Optional extensions in Section 13 are not required for completion.

### Deliverable A — Problem and hypothesis

Document the task, output contract, baseline limitation, reason for adaptation, expected improvement, resource constraints, and acceptance criteria.

### Deliverable B — Dataset manifest

Provide the dataset version, split counts, category distribution, label-validation results, leakage checks, and split-generation procedure.

### Deliverable C — Baseline evaluation

Provide exact-label accuracy, valid-label rate, category-level errors, relevant resource measurements, representative failure cases, and the baseline configuration.

### Deliverable D — Adaptation run

Provide the training configuration, validation observations, checkpoint-selection rationale, training duration, resource consumption, and retained adapter artifact or its reproducible reference.

### Deliverable E — Comparison report

Compare the base and adapted models using the same held-out data and scoring implementation. Include task quality, output compliance, category-level regressions, relevant resource measurements, and an assessment of uncertainty.

### Deliverable F — Engineering decision record

Explain why LoRA was selected, which alternatives were considered, whether the hypothesis was supported, whether the benefit justified the cost, what remains uncertain, and whether further investigation is justified.

### Deliverable G — Runnable experiment workflow

Provide the implemented validation, baseline evaluation, training, adapted evaluation, and comparison commands or equivalent notebook stages.

Document the environment and explain any model-specific adaptations needed to execute the lab.

A generated adapter without the corresponding experiment evidence does not satisfy the lab requirements.

## 13. Optional Extension Exercises

These exercises are optional and should be attempted only after the primary comparison is valid.

### Extension A — Prompt-only versus adaptation

Evaluate whether an improved prompt can meet the requirements without training.

Compare the approaches using the same task definition and relevant evaluation data. Explain the quality, resource, and complexity trade-offs.

### Extension B — Data quality versus quantity

Investigate whether improving label consistency or example diversity produces a more useful result than increasing training-set size.

Design the comparison so that the observed effect can be interpreted meaningfully.

### Extension C — Category imbalance

Investigate the effect of category imbalance on per-category performance.

Explain which categories improve or regress and why the result matters for the task.

### Extension D — Adaptation cost versus benefit

Compare the quality improvement with training, storage, inference, and maintenance costs.

Explain when the adapter is preferable to the base model and when retaining the base model is the stronger decision.

### Extension E — Generalization and regression

Evaluate task-relevant behaviors that adaptation should not damage.

Explain what the results establish, what remains uncertain, and what additional validation would be needed before broader adoption.

## 14. Common Lab Failure Modes

### 14.1 Training before establishing a baseline

Without a baseline, improvement cannot be attributed to adaptation.

**Correction:** Record the base model's behavior and relevant measurements before training.

### 14.2 Leaked or duplicated evaluation examples

Leakage can make held-out performance appear better than genuine generalization.

**Correction:** Inspect duplicates and related examples before splitting the data.

### 14.3 Selecting checkpoints using held-out results

Repeated selection against evaluation-set performance turns that set into part of the model-selection process.

**Correction:** Use a predefined validation policy for checkpoint selection.

### 14.4 Treating decreasing training loss as success

Training loss does not establish that the application requirements are met.

**Correction:** Evaluate task behavior, format compliance, and regressions on held-out examples.

### 14.5 Changing too many variables simultaneously

Changing prompts, models, datasets, and training configuration together makes attribution difficult.

**Correction:** Isolate the adaptation intervention in the primary comparison and document unavoidable differences.

### 14.6 Reporting only the best metric

Higher accuracy can conceal malformed outputs, category-specific regressions, or excessive resource consumption.

**Correction:** Evaluate every mandatory acceptance condition.

### 14.7 Assuming that a seed guarantees reproducibility

A seed does not capture dataset identity, software versions, configuration, hardware, or all sources of nondeterminism.

**Correction:** Record the full experiment configuration and the level of reproducibility achieved.

### 14.8 Treating a successful lab as production approval

An offline experiment does not establish behavior under concurrent load, operational failures, or changing data distributions.

**Correction:** Limit the conclusion to the evidence and identify additional validation needed for deployment.

## 15. Knowledge Check

Answer these questions in your own words.

1. Why is a baseline necessary before adapting a model?
2. Under what conditions might prompt refinement be preferable to LoRA?
3. Why do validation and held-out evaluation have different responsibilities?
4. Training loss decreases, but held-out accuracy does not improve. What would you investigate next?
5. Why can a random row-level split be unreliable when examples come from related tickets or repeated templates?
6. The adapted model improves exact-label accuracy but produces more invalid outputs. How should the acceptance decision be made?
7. What does a smaller adapter artifact establish, and what does it fail to establish about total storage, inference latency, and task quality?
8. How would you investigate an adaptation that improves the majority category but reduces performance on a business-critical category?
9. What evidence would justify rejecting an adaptation that improves the primary metric?
10. What additional evidence is needed before moving from a successful offline experiment to production deployment?

Strong answers should distinguish observations from assumptions, identify mandatory constraints, and explain why the evidence supports a particular decision.

## 16. Chapter Summary and Completion Criteria

This lab treats adaptation as a controlled engineering investigation rather than a framework operation.

The key practices are:

- Define the task, hypothesis, and acceptance criteria before training.
- Establish a reproducible baseline.
- Separate prompt refinement from the primary adaptation comparison.
- Validate data quality, label consistency, and split integrity.
- Use a predefined validation policy for checkpoint selection.
- Evaluate task quality, output compliance, regressions, and resource costs.
- Interpret results within the limits of the evaluation evidence.
- Preserve the configuration, artifacts, and decision rationale.
- Accept, revise, reject, or investigate according to the evidence.
- Distinguish a successful experiment from production readiness.

LLM-09 is complete when the engineer can demonstrate the core capabilities through a justified optimization decision and a reproducible adaptation experiment. Optional extensions are not required.

The trained adapter is an artifact, not proof of success. The engineering outcome is the decision supported by the experiment.

## 17. Transition to the Next Domain

LLM-09 completes the model-adaptation and optimization sequence.

The next domain builds on these capabilities by addressing production concerns such as reliable model serving, application integration, deployment, observability, resource management, and operational lifecycle decisions.

The transition is from improving a model under controlled conditions to engineering a system that uses models reliably under real operational constraints.
