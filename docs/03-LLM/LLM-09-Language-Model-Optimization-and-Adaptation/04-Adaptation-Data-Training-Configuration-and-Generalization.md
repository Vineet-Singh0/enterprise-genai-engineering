# 04 — Adaptation Data, Training Configuration, and Generalization

## 1. Purpose

Fine-tuning is not successful merely because a training run completes or its training loss decreases. A useful adaptation must learn behavior that improves the intended task and continues to perform on examples it has not seen during training.

Three factors strongly influence this outcome:

- **Adaptation data:** What the model is taught through the examples and targets it receives.
- **Training configuration:** How the model's trainable parameters are updated.
- **Generalization:** Whether the learned behavior transfers to unseen inputs rather than remaining specific to the training examples.

These factors are closely related. A model may fail because its examples do not represent the intended workload, because the optimization configuration is unsuitable, or because the training process encourages memorization instead of transferable behavior.

This chapter develops an engineering framework for understanding those interactions. It covers adaptation dataset design, conversational data formatting, target construction, loss masking, dataset partitioning, training configuration, optimization behavior, checkpoint selection, overfitting, generalization, catastrophic forgetting, and reproducibility.

The chapter builds on the adaptation methods introduced in Chapter 03. It does not re-teach LoRA, QLoRA, full fine-tuning, or other adaptation mechanisms. It also does not replace the evaluation methodology defined in LLM-08. Instead, it explains how data and training decisions influence the behavior that evaluation must subsequently measure.

## 2. The Adaptation Problem as a Learning System

A fine-tuning experiment can be viewed as a sequence of connected engineering decisions.

<escape>
Requirements
    |
    v
Target behavior definition
    |
    v
Adaptation dataset and target construction
    |
    v
Training configuration
    |
    v
Optimization and checkpoint selection
    |
    v
Adapted model
    |
    v
Evaluation on unseen examples
    |
    v
Accept, revise, or reject the adaptation
</escape>

Each stage introduces assumptions that affect later stages.

For example, a training run can converge on an incorrectly labeled dataset. The optimizer may successfully minimize the chosen objective while teaching behavior that contradicts the application requirements.

Similarly, a model may perform well on examples drawn from the training dataset but fail when input wording, document structure, or task conditions change.

The engineering objective is therefore not simply to minimize a training loss. It is to produce a model whose behavior meets the target requirements under the conditions for which it will be used.

### 2.1 Training loss is not application success

A training objective provides a mathematical signal for updating model parameters. It is not necessarily identical to the application's actual success criteria.

For example, a dataset may contain examples of converting unstructured text into JSON. Training can encourage the model to predict the target tokens correctly, but this does not automatically guarantee that every output will:

- Contain valid JSON.
- Include all required fields.
- Follow the correct schema.
- Preserve the source information.
- Avoid inventing values when information is missing.

The model learns from the objective and examples it receives. Any mismatch between those signals and the required application behavior can limit the resulting adaptation.

The target behavior must therefore be defined before training begins.

## 3. Defining the Target Behavior

Before preparing an adaptation dataset, identify exactly what should change in the model's behavior.

A vague objective such as "make the model better at business tasks" is insufficient. It does not establish which inputs, outputs, constraints, or failure conditions matter.

A useful adaptation objective describes:

- The task the model must perform.
- The expected input format and relevant variations.
- The desired output behavior.
- The constraints the output must satisfy.
- The failure conditions that matter.
- The conditions under which the model should abstain, request clarification, or indicate missing information, when applicable.

For example, consider a model intended to extract structured information from customer-support messages.

A concrete objective might require it to:

1. Identify the issue category.
2. Extract a product identifier when present.
3. Return a predefined JSON structure.
4. Represent unavailable information explicitly.
5. Avoid inventing identifiers that do not appear in the source.

This objective provides a basis for creating training examples and determining whether the adaptation is useful.

### 3.1 Distinguish the desired change from existing capabilities

Fine-tuning should address an identified limitation rather than being treated as a default improvement mechanism.

Before adaptation, determine what the existing model already does adequately and what behavior needs to change.

If the model already follows the required output format when given an appropriate instruction, additional training may not be necessary.

If the task primarily requires information that the model does not have, training on unrelated examples will not solve the underlying information-access problem.

If the desired behavior depends on external information that changes frequently, retrieval or another inference-time mechanism may be more suitable.

This decision connects Chapter 02's inference-time interventions with Chapter 03's weight-adaptation methods.

The key principle is to identify the limitation before selecting the intervention.

## 4. Adaptation Dataset Design

An adaptation dataset provides the examples and learning signals from which the model learns task-specific behavior.

Its usefulness depends on more than size. Relevance, correctness, consistency, coverage, and alignment with the intended task all influence what the model can learn.

A large dataset containing contradictory targets may be less useful than a smaller dataset with consistent, representative examples.

### 4.1 Training examples encode behavioral expectations

A supervised fine-tuning example commonly contains an input and a target output.

Conceptually:

\[
D = \{(x_i,y_i)\}_{i=1}^{N}
\]

where:

- \(x_i\) represents an input or conversational context.
- \(y_i\) represents the desired target output.
- \(N\) represents the number of examples.

The exact representation depends on the training method. For conversational models, an example may contain multiple messages, roles, instructions, and assistant responses rather than a single plain-text input and output.

The essential requirement is that the training representation preserves the intended relationship between context and target behavior.

If an example contains ambiguous instructions, missing context, or an incorrect target, the learning signal may be ambiguous or misleading.

### 4.2 Conversational formatting, target construction, and loss masking

Conversational supervised fine-tuning requires more than placing a user message and assistant response into a dataset. The messages must be represented in a format the model and training implementation interpret correctly.

A chat template commonly defines how message roles, message boundaries, content, and control markers are serialized into tokens. Depending on the model, it may also represent tool interactions, end-of-turn markers, or other conversational structure.

The training pipeline must preserve the intended relationship among those tokens.

For example, a serialized conversation might conceptually contain:

<escape>
System: Extract the order identifier as JSON.
User: My order number is AB123.
Assistant: {"order_id":"AB123"}
</escape>

This is an illustrative representation, not a universal model-specific chat template. Actual tokenization and message markers depend on the model.

Three separate decisions must be understood:

- **Formatting:** How messages, roles, and boundaries are represented.
- **Target construction:** Which content the model is expected to learn to produce.
- **Loss masking:** Which token positions contribute to the training objective.

In many conversational supervised fine-tuning setups, the loss is calculated on assistant response tokens while tokens belonging to user messages or system instructions are masked out. Other objectives and training configurations may use different masking policies.

Loss masking determines which predictions contribute to the optimization signal. If the intended assistant response is accidentally masked, the model may receive little or no direct learning signal for producing it. If tokens that should be excluded are included unintentionally, the model may be trained to predict content that was meant only to provide context.

Incorrect message boundaries or chat templates can also change how the model interprets the example, even when the visible text appears correct.

Before training, inspect representative examples after the complete preprocessing and serialization pipeline. Verify that:

- Message roles and boundaries are preserved correctly.
- The intended assistant response is present.
- Target tokens align with the expected output.
- Loss masks match the training objective.
- End-of-turn and other control markers are handled as intended.
- Truncation does not silently remove required context or target content.

The exact checks depend on the training implementation. The engineering principle is to validate the representation the optimizer actually receives, not only the source dataset before preprocessing.

### 4.3 Relevance to the target workload

Training examples should represent the behavior the application needs, not merely resemble the domain superficially.

Suppose the target task is extracting order identifiers from customer messages.

A dataset dominated by product descriptions and general customer-service conversations may contain relevant vocabulary without providing enough examples of the actual extraction task.

The model needs examples that demonstrate the intended input-output relationship.

Dataset relevance should therefore be assessed against the target task, expected inputs, output constraints, and meaningful variations in real usage.

### 4.4 Correctness and consistency

Incorrect or inconsistent examples can create conflicting learning signals.

Consider these two examples:

- Input: "My order number is AB123."
- Target: `{"order_id": "AB123"}`

And:

- Input: "My order number is AB123."
- Target: `{"order_id": "XY999"}`

If both are presented as correct examples without an intentional distinction in their contexts, the training data contradicts itself.

The model may learn unreliable associations or exhibit inconsistent behavior.

Data validation should identify problems such as:

- Incorrect labels or target outputs.
- Missing required fields.
- Invalid serialization or malformed examples.
- Contradictory targets for equivalent inputs.
- Accidental duplication.
- Inconsistent formatting conventions.
- Examples that violate the intended task constraints.

Automated validation can detect structural problems, while semantic correctness may require domain-specific checks or human review.

### 4.5 Coverage and variation

A dataset should represent the meaningful variations the application is expected to encounter.

For a structured extraction task, those variations might include:

- Complete and incomplete information.
- Different wording for the same request.
- Optional fields.
- Unusual but valid formatting.
- Irrelevant surrounding text.
- Ambiguous inputs.
- Inputs containing no extractable value.
- Conflicting or malformed information.

The goal is not to create every imaginable input. It is to cover variations that are important to the intended workload.

A dataset with narrow variation may encourage the model to associate a task with superficial patterns rather than learning the intended transformation.

For example, if every positive example starts with "Order ID:", the model may become overly dependent on that phrase and perform poorly when the identifier appears in natural language.

### 4.6 Avoiding unintended shortcuts

Models can exploit patterns in training data that correlate with the target without representing the intended behavior.

Suppose every example from one category uses a particular template, while every example from another category uses a different template. The model may learn the template rather than the category-defining information.

This is a form of shortcut learning.

Potential warning signs include:

- Targets that can be predicted from formatting alone.
- Repeated identifiers associated with particular labels.
- Duplicated templates that dominate the dataset.
- Artificially simple examples that omit important real-world variation.
- Correlations that exist in the dataset but not in the intended workload.

Data design should make the desired behavior learnable without accidentally making irrelevant patterns more predictive than the actual task.

## 5. Dataset Partitioning and Leakage

Training and evaluation examples serve different purposes. Their separation must be established before the adaptation results are interpreted.

The basic distinction is:

- **Training data:** Used to calculate learning signals and update model parameters.
- **Validation data:** Used during development to inspect progress and inform decisions such as checkpoint or configuration selection.
- **Test data:** Reserved for assessing the selected approach on examples that have not influenced model development decisions.

The exact workflow can vary, but the information available to each stage must remain clear.

### 5.1 Why separate datasets?

A model is expected to perform on inputs beyond the exact examples used to update its parameters.

If the same examples are used for training and final assessment, the resulting score may reflect familiarity with those examples rather than transferable task performance.

Separate datasets provide different kinds of evidence:

- Training behavior indicates how well the model fits the learning signal.
- Validation behavior helps guide development decisions.
- Test behavior provides evidence about performance on held-out examples, provided the test set has not influenced repeated model-selection decisions.

This chapter focuses on the role of dataset separation. The detailed methodology for choosing metrics, designing comparisons, and interpreting evaluation results belongs to LLM-08.

### 5.2 Data leakage

Data leakage occurs when information that should be unavailable to a training or development stage influences that stage, making the resulting performance estimate unreliable.

Leakage can arise through more than direct duplication.

Examples include:

- Identical examples appearing in training and test partitions.
- Near-duplicate examples split across partitions.
- Different versions of the same underlying record appearing in separate partitions.
- Target-derived information accidentally included in model inputs.
- Preprocessing that uses information from held-out examples.
- Repeatedly tuning a model against the same nominal test set.

The correct partitioning strategy depends on how examples are related and how the model will be used.

For example, if multiple examples come from the same customer interaction, document, or source record, splitting them independently may allow related information to cross dataset boundaries.

A more appropriate split may group examples by their underlying source.

### 5.3 Match the split to the intended generalization

A random split is not automatically the correct split.

Consider a model adapted to extract information from business documents. If the intended workload involves new documents from previously unseen customers, a split that places documents from the same customer in both training and test data may produce an overly optimistic estimate.

Depending on the application, useful partitioning strategies may separate examples by:

- Source document or conversation.
- Customer or other relevant entity.
- Time period.
- Data source or collection.
- Input template or task subtype.

These strategies answer different questions. A temporal split, for example, can help assess behavior on later data, while a source-grouped split can test transfer to unseen sources.

The split should reflect the generalization claim the experiment intends to support.

## 6. Training Configuration

Training configuration determines how the selected adaptation method uses data to update its trainable parameters.

The configuration must be compatible with the model, dataset, objective, adaptation method, and available resources.

A configuration that works for one model or dataset should not be assumed to work equally well for another.

### 6.1 Learning rate

The learning rate controls the scale of optimizer updates.

Conceptually, a basic gradient-descent update is:

\[
\theta_{t+1}=\theta_t-\eta\nabla_{\theta_t}\mathcal{L}
\]

where \(\eta\) is the learning rate.

A learning rate that is too large can produce unstable updates or damage useful pretrained behavior. A learning rate that is too small may produce insufficient adaptation within the available training budget.

The appropriate value depends on factors such as the model, optimizer, trainable parameter set, dataset, and training schedule.

The best learning rate should not be inferred from the fact that a training run completes successfully. Training behavior and held-out results provide the evidence needed to judge whether the configuration is suitable.

### 6.2 Batch size and gradient accumulation

Batch size affects how many examples contribute to an optimization update.

A larger effective batch may produce a different optimization trajectory from a smaller batch. It also changes memory requirements and the number of optimizer updates for a given number of processed examples.

When memory is constrained, gradient accumulation can combine gradients across multiple smaller forward and backward passes before an optimizer update.

For example, accumulating gradients across four microbatches of eight examples gives an effective batch of 32 examples under the usual assumptions about loss normalization and distributed execution.

This does not mean that every implementation will behave identically to processing all 32 examples in one physical batch. Details such as loss normalization, batch-dependent layers, stochastic operations, and distributed reduction can affect equivalence.

Gradient accumulation is a resource-management technique, not a guarantee of better model quality.

### 6.3 Training duration, checkpoint selection, and stopping

An epoch conventionally represents one pass through the training dataset.

The number of epochs affects how many times the model processes the training examples, but epoch count alone does not determine training quality. The outcome also depends on dataset size, batch size, gradient accumulation, learning-rate schedule, optimizer behavior, and the number of actual optimizer updates.

Additional training may initially improve the target behavior and later produce diminishing returns or worse generalization.

A training run may save multiple checkpoints representing different stages of optimization. The last checkpoint is not automatically the best checkpoint for the intended task.

Validation evidence can inform checkpoint selection and stopping decisions. For example, if the target validation behavior stops improving while training loss continues to decrease, continuing training may provide little benefit and could increase overfitting risk.

A practical workflow should define in advance:

- How often checkpoints are evaluated or saved.
- Which validation evidence informs checkpoint selection.
- What conditions justify stopping.
- Which checkpoint is retained as the candidate adaptation.

These decisions must be made without repeatedly optimizing against the reserved test set. Using test results to select checkpoints turns the test set into part of the development process and weakens its value as an independent assessment.

The appropriate stopping rule depends on the task and training budget. No single validation curve or epoch count is universally sufficient.

### 6.4 Optimizer and learning-rate schedule

The optimizer determines how gradients are used to update trainable parameters. Different optimizers maintain different internal state and apply different update rules.

A learning-rate schedule changes the learning rate during training rather than keeping it constant throughout the run.

These choices can influence convergence, stability, and resource consumption. However, their effects depend on the complete training setup.

This chapter does not prescribe a universally optimal optimizer or schedule. The engineering requirement is to select a defensible configuration, record it, and establish whether it produces the intended behavior under controlled conditions.

### 6.5 Precision and resource configuration

Training may use different numerical representations for model weights, gradients, and intermediate computations.

Mixed-precision approaches can reduce memory requirements or improve throughput on supported hardware, but numerical behavior and hardware compatibility remain relevant.

The resource footprint also depends on:

- Model and trainable parameter sizes.
- Sequence length.
- Batch configuration.
- Activation memory.
- Optimizer state.
- Temporary tensors and implementation overhead.
- Quantization or other numerical-representation choices.

The adaptation method and training configuration should be considered together. A parameter-efficient method may reduce some costs, but it cannot eliminate the computational work required to process the training examples.

Chapter 03 explains the distinctions among full fine-tuning, PEFT, LoRA, and QLoRA. This section focuses on the configuration choices that govern a training run.

## 7. Overfitting and Generalization

**Overfitting** occurs when a model fits characteristics of its training data that do not transfer adequately to unseen examples.

**Generalization** describes the model's ability to perform on inputs beyond the examples used to fit its parameters.

These concepts are central to adaptation because the purpose of fine-tuning is to improve behavior on a target workload, not merely to reproduce training targets.

### 7.1 Training performance and held-out performance

Consider a model whose training loss decreases steadily.

That observation shows that the optimization process is fitting the training objective more effectively. It does not establish that the model is becoming more useful on unseen inputs.

Several outcomes remain possible:

1. Training and held-out performance both improve.
2. Training performance improves while held-out performance stagnates.
3. Training performance improves while held-out performance deteriorates.
4. Neither training nor held-out performance improves meaningfully.

These outcomes require different interpretations. A decreasing training loss is not sufficient evidence to distinguish them.

### 7.2 A conceptual example

Suppose a model is fine-tuned to classify support messages into a small set of categories.

The training dataset contains many examples with nearly identical wording. During training, the model learns strong associations between those phrases and the target labels.

It performs well on similar training examples but struggles when users express the same issues with different wording.

The model has learned patterns that fit the dataset without adequately capturing the variation required by the application.

Potential contributing factors include:

- Insufficient diversity in the training data.
- Repeated or near-duplicate examples.
- An overly narrow representation of the task.
- Excessive training relative to the dataset and model.
- A mismatch between the training distribution and the intended workload.

The observed failure alone does not establish which factor caused it. Diagnosis requires evidence rather than assuming that overfitting always has a single cause.

### 7.3 Common causes of overfitting

Overfitting can be encouraged by several interacting conditions.

**Limited or repetitive data:** The model encounters too few independent examples of the intended behavior.

**Excessive training:** The model continues fitting the training examples after useful generalization has stopped improving.

**Excessive adaptation capacity relative to the task:** The training setup allows the model to fit details that do not transfer, although model capacity alone does not determine whether overfitting occurs.

**Noisy or inconsistent targets:** The model receives conflicting learning signals.

**Shortcut patterns:** Irrelevant characteristics correlate with the target labels.

**Train-test leakage:** Reported held-out performance is inflated because training and evaluation information is not sufficiently independent.

These causes can coexist. Increasing dataset size alone may not solve problems caused by incorrect targets or a poorly defined task.

### 7.4 Underfitting and insufficient adaptation

Underfitting occurs when the model fails to learn the intended training behavior adequately.

Possible causes include:

- An unsuitable learning rate.
- Insufficient training.
- An adaptation method with inadequate capacity for the task.
- Incorrect or weak training signals.
- A mismatch between the objective and the intended behavior.
- Implementation or data-processing errors.

Underfitting and overfitting should not be treated as the only possible failure categories. A model can fit the training data and still fail because the training objective does not represent the application's actual requirements.

The engineer must distinguish failure to fit the objective from failure of the objective to produce the desired behavior.

## 8. Generalization Beyond the Training Distribution

Generalization is not a single universal property. A model may generalize well to some kinds of unseen examples but poorly to others.

The relevant question is: **Generalize to what?**

### 8.1 In-distribution generalization

A model may perform well on new examples drawn from a distribution similar to the training data.

For example, it may classify unseen support messages that use familiar terminology and comparable message structures.

This is useful evidence, but it does not establish robustness to substantially different inputs.

### 8.2 Distribution shift

Distribution shift occurs when the inputs or conditions encountered after training differ from those represented during adaptation.

Examples include:

- A new writing style or vocabulary.
- New document templates.
- A change in the frequency of particular categories.
- A different source of input data.
- New task requirements.
- More ambiguous or incomplete inputs.

A model adapted to one distribution may not transfer reliably to another.

The practical implications depend on the nature and magnitude of the shift, the task, and the behavior required from the application.

### 8.3 Robustness is task-dependent

A model's performance on one held-out dataset does not establish robustness to every possible input variation.

A structured extraction model might generalize to different wording but fail on malformed input. A classifier might generalize to new examples from known categories but struggle when category definitions change.

The expected operating conditions should therefore inform the adaptation data and the evidence collected during evaluation.

LLM-08 owns the methodology for designing and interpreting those evaluations. This chapter establishes why the generalization target must be defined before those results can be interpreted meaningfully.

## 9. Catastrophic Forgetting and Behavioral Regression

Fine-tuning can improve a target behavior while degrading other capabilities or behaviors that were useful in the original model.

**Catastrophic forgetting** describes a form of forgetting in which learning new information or tasks causes substantial degradation in previously learned capabilities.

The term should not be used as a label for every regression. A change in behavior can have several causes, and observed degradation must be established through appropriate evidence.

### 9.1 Why forgetting can occur

Fine-tuning updates model parameters to optimize a new objective.

When those updates affect parameters that also support existing capabilities, the optimization process can alter behavior outside the target task.

The extent of this effect depends on factors such as:

- The adaptation objective.
- The relationship between the old and new tasks.
- The amount and diversity of adaptation data.
- The model and adaptation method.
- The magnitude and direction of parameter updates.
- The training configuration.

A model can become better at a narrow task while becoming less reliable at a previously supported behavior.

### 9.2 Target-task improvement is not enough

Suppose an adapted model improves structured extraction but begins ignoring instructions in unrelated tasks.

If evaluation examines only extraction performance, the regression may remain undetected.

This illustrates why adaptation requirements should identify important existing behaviors that must be preserved, not only the new behavior that should improve.

The relevant question is not simply whether the target task improved. It is whether the overall behavior remains acceptable for the intended use.

### 9.3 Mitigation requires evidence

Potential responses to unwanted regression include revisiting the adaptation data, changing the training configuration, reducing the extent of adaptation, or selecting a different intervention.

No single mitigation guarantees preservation of all prior capabilities.

The appropriate response depends on the observed failure and the evidence available. A regression should be diagnosed before selecting a corrective action.

LLM-07 owns the broader classification of observable behavioral failures. This section focuses specifically on how fine-tuning can introduce regression through parameter updates.

## 10. Reproducibility of Adaptation Experiments

A training result is difficult to interpret if the engineer cannot determine which model, data, configuration, and code produced it.

Reproducibility requires preserving enough information to understand and, where practical, repeat the experiment.

### 10.1 Record the experimental configuration

At minimum, an adaptation experiment should record:

- Base model identity and version or revision.
- Adaptation method and trainable parameter selection.
- Training dataset identity and version.
- Dataset preprocessing and formatting procedure.
- Chat template and target-construction procedure, when applicable.
- Loss-masking policy, when applicable.
- Training objective and relevant loss configuration.
- Optimizer and learning-rate configuration.
- Batch size, gradient accumulation, and sequence-length settings.
- Training duration, epoch count, checkpoint-selection criteria, and stopping criteria.
- Numerical precision and quantization settings where applicable.
- Random seeds where supported.
- Code and library versions.
- Hardware and relevant execution environment details.
- Checkpoint identity and the basis for selecting it.

The exact record should reflect the experiment. Recording irrelevant details adds noise, while omitting consequential configuration makes results difficult to interpret.

### 10.2 Reproducibility is not necessarily bitwise identity

Repeated runs may produce different results because of random initialization, data ordering, nondeterministic operations, hardware behavior, or implementation differences.

A reproducible workflow should distinguish between:

- **Configuration reproducibility:** The same intended setup can be reconstructed.
- **Procedural reproducibility:** The same process can be executed again.
- **Result reproducibility:** Repeated runs produce sufficiently similar outcomes for the decision being made.
- **Bitwise reproducibility:** Outputs or artifacts match exactly at the binary or numerical level.

Bitwise identity may be achievable in some controlled environments but should not be assumed across different hardware, libraries, or execution configurations.

The required degree of reproducibility depends on the experiment and the decision it supports.

### 10.3 Preserve the baseline

An adaptation experiment should retain a clear reference point.

The baseline is the unadapted model, or another explicitly justified reference, evaluated under the same relevant task conditions.

Without a baseline, an adapted model's score cannot establish whether the adaptation produced an improvement.

The baseline also helps identify regressions and distinguish gains attributable to adaptation from differences caused by changes in prompts, preprocessing, or evaluation conditions.

Detailed benchmark design and statistical interpretation remain in LLM-08.

## 11. A Practical Framework for Diagnosing Adaptation Outcomes

When an adaptation produces an unexpected result, avoid immediately changing the learning rate, increasing the dataset size, or switching adaptation methods.

First, identify which part of the learning system may be responsible.

| Observation | Plausible explanations to investigate | Evidence to gather |
|---|---|---|
| Training loss does not improve | Incorrect data formatting, unsuitable optimization configuration, implementation errors, or insufficient adaptation capacity | Inspect examples, training signals, configuration, and implementation behavior |
| Training improves but held-out behavior does not | Overfitting, narrow data coverage, leakage-related assumptions, or objective mismatch | Inspect data partitions, examples, and held-out behavior |
| Target task improves but existing behavior degrades | Unwanted parameter changes, task interference, or an overly narrow adaptation objective | Compare target and preservation requirements against the baseline |
| Results vary substantially between runs | Data variation, stochasticity, configuration differences, or unstable optimization | Compare experiment records and repeated-run behavior |
| Training fits well but the application still fails | The training objective may not represent the actual application requirement | Inspect the mismatch between required behavior, examples, and observed failure |
| Training loss is unexpectedly low but the model does not produce the target response | Incorrect loss masking, target construction, chat-template handling, or a mismatch between training and inference formatting | Inspect tokenized examples, target positions, masks, and inference serialization |

These are diagnostic hypotheses, not definitive causal conclusions.

A useful debugging process narrows the problem through evidence. Changing several variables simultaneously may make the next result harder to interpret because the cause of any improvement or regression becomes unclear.

### 11.1 Change one meaningful factor at a time when practical

Controlled experiments make it easier to understand why results differ.

For example, if an adaptation appears to overfit, an engineer might investigate data diversity, training duration, or adaptation capacity.

Changing all three simultaneously may improve the result, but it will not reveal which change mattered or whether one change was unnecessary.

The appropriate experimental design depends on the resources and decision at hand. The principle is to make changes interpretable and preserve enough information to understand their effects.

## 12. Common Misconceptions

### 12.1 More data always produces a better adaptation

More data can improve coverage, but only when the additional examples are sufficiently relevant and useful.

Incorrect labels, contradictory targets, duplication, or distribution mismatch can limit or undermine the benefit.

**Better mental model:** Evaluate data quality, relevance, and coverage rather than treating dataset size as a quality guarantee.

### 12.2 Lower training loss proves successful fine-tuning

Training loss measures fit to the selected training objective. It does not establish that the model generalizes or satisfies the application requirements.

**Better mental model:** Interpret training behavior alongside appropriately designed held-out evidence and the target task requirements.

### 12.3 More epochs mean more learning

Additional training may improve adaptation initially, but later updates may yield diminishing returns or worse generalization.

**Better mental model:** Training duration is a configuration decision that requires evidence, not a quality target in itself.

### 12.4 A larger learning rate always adapts the model faster

A larger learning rate increases update magnitude, but can also destabilize training or damage useful pretrained behavior.

**Better mental model:** Select a learning rate that supports useful optimization under the chosen configuration.

### 12.5 PEFT eliminates overfitting

PEFT reduces or restructures the trainable parameter set. It does not eliminate the possibility of fitting noisy, repetitive, or unrepresentative examples.

**Better mental model:** Parameter efficiency and generalization are different properties.

### 12.6 A successful target task means the model is safe to use

Improvement on the target task does not establish that existing behaviors were preserved or that the model works under all expected conditions.

**Better mental model:** Assess the target improvement and relevant regression risks before deciding whether the adaptation is acceptable.

### 12.7 Repeating the same run proves reproducibility

A repeated run without preserved data, configuration, model identity, and execution details may not be a meaningful reproduction of the original experiment.

**Better mental model:** Reproducibility depends on recorded experimental conditions and an explicit understanding of acceptable result variation.

### 12.8 Correct-looking source data guarantees correct training targets

Readable source examples can still become incorrect training signals after tokenization, template application, truncation, or loss-mask construction.

**Better mental model:** Validate the final tokenized representation and the positions contributing to the loss, not only the source records.

## 13. Engineering Decision Checklist

Before accepting a fine-tuning experiment, confirm that the following questions have defensible answers.

### Target behavior and data

- Is the desired behavioral change clearly defined?
- Does the dataset represent the target task?
- Are targets correct, consistent, and structurally valid?
- For conversational data, are the chat template, target construction, and loss masks correct?
- Does the data cover important input variations?
- Have relevant duplication and leakage risks been addressed?
- Does the partitioning strategy support the intended generalization claim?

### Training configuration

- Is the chosen adaptation method suitable for the task and available resources?
- Are trainable parameters and numerical-representation choices documented?
- Are learning rate, batch configuration, and training duration justified?
- Are checkpoint selection and stopping criteria defined?
- Can the experiment be reconstructed from its records?
- Are implementation failures distinguishable from learning failures?

### Generalization and regression

- Is the baseline preserved?
- Is held-out behavior examined rather than relying on training loss alone?
- Are important existing behaviors included in the acceptance requirements?
- Have plausible overfitting and distribution-shift risks been considered?
- Is the evidence sufficient to justify the added complexity of adaptation?

This checklist does not replace formal evaluation design. It ensures that data and training decisions are sufficiently well defined for that evaluation to be meaningful.

## 14. Knowledge Check

Answer these questions before proceeding.

1. A model's training loss decreases consistently, but performance on unseen examples does not improve. Explain at least three plausible causes and describe the evidence you would collect before changing the training configuration.

2. A dataset contains many examples, but most use nearly identical wording and templates. Why might this dataset generalize poorly? Describe how you would improve coverage without simply duplicating more examples.

3. Your dataset contains several records from each customer. Explain why a random example-level split might produce misleading results, and propose a split strategy aligned with evaluating performance on new customers.

4. A model improves on its target extraction task but begins performing worse on an existing task. Explain how fine-tuning can cause this outcome and how you would investigate the regression.

5. A PEFT experiment uses substantially fewer trainable parameters than full fine-tuning but still exceeds the available training memory. Explain why this is possible and identify the configuration or implementation factors you would inspect.

6. Two engineers report different outcomes from what they believe is the same adaptation experiment. What records would you compare to determine whether the experiments were actually equivalent?

7. You are asked to increase the number of training epochs because the current model has not met its target metric. Explain why this request is not yet a sufficient engineering diagnosis.

8. A conversational fine-tuning run completes successfully, but the adapted model rarely produces the intended assistant response. Explain how a chat-template or loss-masking error could cause this outcome and what you would inspect before changing the optimizer.

Strong answers should identify assumptions, distinguish plausible causes from confirmed causes, and explain how evidence would guide the next decision.

## 15. Chapter Summary

Adaptation quality depends on the interaction among data, training configuration, and generalization.

The most important principles are:

- Define the target behavior before creating an adaptation dataset.
- Treat example relevance, correctness, consistency, and coverage as first-class engineering concerns.
- Validate conversational formatting, target construction, and loss masking when applicable.
- Separate training, validation, and test information according to their roles.
- Choose dataset partitions that reflect the intended generalization claim.
- Understand that training configuration influences optimization, resource requirements, and the resulting behavior.
- Use validation evidence to inform checkpoint selection and stopping decisions without repeatedly tuning against the reserved test set.
- Do not interpret decreasing training loss as proof of application-level improvement.
- Investigate overfitting, distribution shift, and behavioral regression using evidence.
- Preserve experiment records and baselines so that outcomes can be interpreted and reproduced.
- Accept an adaptation only when its observed benefits justify its additional complexity and relevant regressions have been considered.

Chapter 03 explained how different fine-tuning methods modify a pretrained model. This chapter explained why the data and training process determine whether those modifications are useful.

The next chapter examines model compression and representation efficiency, including how reduced numerical precision and smaller model representations change the trade-offs among memory, compute, quality, and compatibility.

## 16. Transition to the Next Chapter

Proceed to:

[05 — Model Compression and Representation Efficiency](05-Model-Compression-and-Representation-Efficiency.md)

The next chapter focuses on reducing the representation or resource requirements of models. It builds on the distinction established here between learning a task-specific behavior and selecting a model representation that can execute within the available resource constraints.
