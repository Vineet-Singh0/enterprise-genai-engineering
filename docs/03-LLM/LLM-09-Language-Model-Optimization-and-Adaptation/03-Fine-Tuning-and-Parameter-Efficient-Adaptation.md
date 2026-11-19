# 03 — Fine-Tuning and Parameter-Efficient Adaptation

## 1. Purpose

Fine-tuning adapts a pretrained language model to a target task or workload by training it further on selected data. Unlike inference-time interventions, which change how an existing model is used, fine-tuning updates some or all of the model's learned parameters.

Fine-tuning can improve task-specific behavior, but it introduces additional engineering decisions involving data quality, training resources, optimization configuration, generalization, and regression risk. Updating model weights does not guarantee that the resulting model will be more accurate, more reliable, or more efficient for the intended application.

This chapter explains the principal fine-tuning approaches and the trade-offs that determine when each is appropriate. It focuses on the conceptual mechanisms and engineering decisions behind full fine-tuning and parameter-efficient fine-tuning (PEFT), including Low-Rank Adaptation (LoRA), quantized LoRA adaptation, adapters, and prompt-based parameter-efficient methods.

The goal is not to memorize a list of techniques. It is to understand which parameters are updated, what resources the method requires, what behavior it can influence, and what evidence is needed to justify the additional complexity.

Detailed data preparation, training configuration, and generalization behavior belong to Chapter 04. Evaluation methodology remains owned by LLM-08.

## 2. What Fine-Tuning Changes

A pretrained language model begins with parameters learned during an earlier training process. Fine-tuning continues optimization using a dataset and objective selected for a more specific purpose.

Let the pretrained model be represented by:

\[
f_{\theta_0}(x)
\]

where:

- \(x\) is the model input.
- \(f\) is the model computation.
- \(\theta_0\) represents the original learned parameters.

Fine-tuning produces an adapted parameter state:

\[
\theta^* = \operatorname{Optimize}(\theta_0,D,\mathcal{L})
\]

where:

- \(D\) is the adaptation dataset.
- \(\mathcal{L}\) is the training objective.
- \(\theta^*\) represents the resulting parameter state.

This notation is conceptual. Actual training behavior depends on the model architecture, objective, optimizer, training configuration, and which parameters are trainable.

The important distinction is that fine-tuning changes the model's learned parameter state through training. It is not simply a change to the instructions or generation configuration supplied at inference time.

### 2.1 Why adapt a pretrained model?

Pretraining develops broad language capabilities from large-scale data. A target application, however, may require more specialized behavior.

Examples include:

- Consistent classification using task-specific categories.
- Structured extraction following a recurring input-output convention.
- Domain-specific terminology and response patterns.
- Specialized transformations between input and output formats.
- A task-specific behavior that is not achieved reliably through inference-time interventions.

Fine-tuning attempts to shift the model's behavior toward the target objective by using additional training examples.

It does not automatically provide missing factual information, guarantee correct reasoning, or eliminate the need for application-level controls. The result depends on the task, data, model, and training process.

### 2.2 Fine-tuning is not training from scratch

Training from scratch starts without the pretrained parameter state used by fine-tuning and attempts to learn model capabilities through a new training process.

Fine-tuning starts from an existing model and continues training from its learned parameters.

This distinction matters because fine-tuning leverages capabilities acquired during pretraining. It typically requires less task-specific data and compute than reproducing the entire pretraining process, although resource requirements can still be substantial.

LLM-02 owns the deeper foundations of model training. This chapter focuses on the adaptation decision rather than re-teaching the complete training process.

## 3. Full Fine-Tuning

In the conventional definition, **full fine-tuning updates all model parameters intended to be adapted**, rather than restricting training to a small additional parameter set. Typically, all pretrained model parameters are made trainable, although implementations can deliberately freeze selected components.

For a model with trainable parameters \(\theta\), a basic gradient-based update can be represented as:

\[
\theta_{t+1}=\theta_t-\eta\nabla_{\theta_t}\mathcal{L}
\]

where \(\eta\) represents a learning rate and the gradient describes how the objective changes with respect to the trainable parameters.

This expression illustrates a basic gradient-based update. Actual optimizers may maintain additional state, and practical training may use gradient accumulation, mixed precision, distributed computation, or other mechanisms.

### 3.1 What makes full fine-tuning different?

Full fine-tuning gives the optimization process broad freedom to change the pretrained model's parameters in response to the training objective.

That flexibility can be useful when substantial task-specific adaptation is needed. However, it also introduces costs:

- Gradients must be computed for trainable parameters.
- Optimizer state consumes additional memory.
- Training may require substantial compute and time.
- The resulting model must be evaluated for both target-task improvements and regressions.
- Storing and managing adapted model checkpoints may require significant resources.

The exact requirements depend on model size, sequence lengths, batch configuration, numerical precision, optimizer implementation, and available hardware.

### 3.2 Advantages

Full fine-tuning offers several potential advantages:

- Broad freedom to adapt model parameters.
- Direct optimization of the selected training objective.
- No requirement to maintain a separate LoRA adapter solely for the adaptation mechanism.
- A suitable option when the task justifies extensive parameter updates and sufficient resources are available.

These are potential advantages, not guarantees of superior quality. A more flexible optimization process can still overfit, generalize poorly, or degrade useful behavior.

### 3.3 Limitations

Full fine-tuning may be inappropriate when:

- Training resources are insufficient.
- The task does not justify broad parameter updates.
- Adaptation data is limited or unrepresentative.
- Several task-specific variants must be maintained under tight storage constraints.
- The team lacks the resources to validate and maintain the resulting model.

The decision should account for the full lifecycle of the adapted model, not just whether a training run can be completed.

## 4. Parameter-Efficient Fine-Tuning

Parameter-efficient fine-tuning reduces the number of parameters that must be trained or otherwise reduces the trainable parameter footprint compared with full fine-tuning.

Instead of updating all eligible pretrained parameters, PEFT methods restrict adaptation to a smaller parameter set or introduce trainable components alongside a largely frozen base model.

The base model retains its original parameters, while the adaptation method introduces a mechanism for learning task-specific changes.

PEFT is useful when task-specific adaptation is desirable but full fine-tuning is too expensive or unnecessarily complex for the task.

### 4.1 What parameter efficiency means

The term *parameter-efficient* primarily describes how adaptation parameters are selected or represented. It does not imply that every part of training becomes proportionally cheaper.

For example, freezing the base model can eliminate gradient storage for its frozen parameters, but the model still performs forward computation. Depending on the architecture and training method, intermediate activations may still need to be retained to calculate gradients for trainable components.

Consequently, PEFT can reduce training memory and the size of adaptation artifacts without reducing total training time or inference cost by the same proportion.

An engineer should distinguish:

- **Trainable parameter count:** How many parameters are updated.
- **Training memory:** Memory required for model weights, gradients, optimizer state, activations, and temporary tensors.
- **Training compute:** The computation required to process adaptation examples.
- **Adaptation artifact size:** The storage required for the learned task-specific parameters.
- **Inference requirements:** The resources needed to execute the resulting model.

These are related but different measurements.

### 4.2 Common PEFT approaches

| Method | Main idea | Principal consideration |
|---|---|---|
| LoRA | Learns low-rank parameter updates while freezing the corresponding base weights | Introduces rank and target-module choices that influence adaptation capacity and resource use. |
| QLoRA | Combines a quantized frozen base model with trainable LoRA updates | Reduces base-weight memory requirements but introduces numerical and compatibility considerations. |
| Adapters | Adds small trainable modules within or alongside the model architecture | Introduces additional components that may affect execution and deployment compatibility. |
| Prompt tuning | Learns continuous prompt representations while keeping the base model frozen | Limits adaptation to a comparatively constrained trainable representation. |
| Prefix tuning | Learns trainable prefix representations that influence model computation | Adds learned conditioning components and has architecture-specific implementation considerations. |

The methods differ in where adaptation capacity is introduced, what remains frozen, and how the resulting artifacts are executed.

They should not be treated as interchangeable simply because they reduce the number of trainable parameters.

## 5. Low-Rank Adaptation (LoRA)

LoRA is a parameter-efficient technique that represents a learned weight update through low-rank matrices.

The central idea is that a useful task-specific update may sometimes be represented by a lower-dimensional update than the original weight matrix requires.

For an original weight matrix \(W_0\), a LoRA-style update can be represented as:

\[
W = W_0 + \Delta W
\]

with:

\[
\Delta W = \frac{\alpha}{r}BA
\]

where:

- \(W_0\) is the frozen base weight matrix.
- \(A\) and \(B\) are trainable low-rank matrices.
- \(r\) is the chosen rank.
- \(\alpha\) is a scaling parameter.
- \(BA\) represents the learned update.

For a weight matrix of shape \(d_{\text{out}}\times d_{\text{in}}\), a conventional full update contains \(d_{\text{out}}d_{\text{in}}\) trainable values. The LoRA update instead introduces approximately:

\[
r(d_{\text{in}}+d_{\text{out}})
\]

trainable values for that matrix.

When \(r\) is sufficiently small relative to the matrix dimensions, this can substantially reduce the number of trainable parameters.

The exact parameter savings depend on which matrices receive LoRA updates, their dimensions, the selected rank, and any additional trainable components.

### 5.1 A numerical example

Consider a single square weight matrix with dimensions \(4096\times4096\), and assume LoRA rank \(r=8\).

A full matrix contains:

\[
4096\times4096=16{,}777{,}216
\]

parameters.

The LoRA update introduces approximately:

\[
8(4096+4096)=65{,}536
\]

trainable parameters.

For this matrix alone, the ratio is:

\[
\frac{16{,}777{,}216}{65{,}536}=256
\]

The LoRA update therefore uses **256 times fewer trainable parameters for this particular matrix** than a full update would.

This is not a claim that the entire training process will be 256 times faster or require 256 times less memory. Total model weights, activations, optimizer state for trainable parameters, temporary tensors, sequence length, and implementation details still affect actual resource consumption.

The example illustrates parameter efficiency, not total system efficiency.

### 5.2 How LoRA works conceptually

The base matrix remains frozen during adaptation. The optimizer learns matrices \(A\) and \(B\), which collectively represent the update to the base computation.

This separates the pretrained parameters from the task-specific update.

The resulting adaptation artifact can be much smaller than a complete copy of all model weights. Multiple task-specific adapters may also be stored separately while sharing the same base model, provided the architecture, configuration, and execution system support that arrangement.

### 5.3 Why low-rank updates can be useful

The method assumes that a useful adaptation can be represented adequately by a low-rank update in the selected weight matrices.

When that assumption is reasonable, LoRA can reduce trainable parameter count and optimizer-state requirements while preserving much of the base model's computation.

However, low rank constrains the set of updates the method can represent. A smaller rank reduces the number of trainable parameters but may also limit adaptation capacity.

A larger rank increases adaptation capacity and resource requirements. The best choice depends on the task, target modules, data, and available compute.

Low rank is an efficiency mechanism, not a guarantee of quality or generalization.

### 5.4 Rank and target-module decisions

Two important LoRA configuration decisions are:

- **Rank:** Controls the dimensionality of the learned low-rank update.
- **Target modules:** Determine which model weight matrices receive trainable updates.

A larger rank is not automatically better. Likewise, adapting more modules is not automatically more effective.

These choices influence trainable parameter count, memory use, adaptation capacity, and potentially the resulting task behavior. They should be selected and evaluated in the context of the target task.

Chapter 04 addresses training configuration and generalization more broadly.

### 5.5 LoRA and inference execution

LoRA's trainable parameters and its inference execution path are related but distinct concerns.

In some implementations, a trained LoRA update can be merged into the base weights for inference. When the merge is supported and performed correctly, the resulting computation can use the combined weights without executing the adapter as a separate component.

Other implementations keep the adapter separate, allowing adapters to be loaded or switched independently but potentially introducing additional execution overhead.

The practical implications depend on the model architecture, numerical representation, runtime, and adapter-management requirements. Merging may also affect how adapters can be switched or combined.

Therefore, a smaller adapter artifact does not automatically guarantee lower inference latency. The actual execution arrangement must be considered.

## 6. QLoRA: Parameter-Efficient Adaptation with a Quantized Base

QLoRA combines a quantized representation of the frozen base model with trainable LoRA updates.

The goal is to reduce the memory required to hold the base model during adaptation while retaining a trainable mechanism for task-specific updates.

Conceptually, the base model's weights are stored in a lower-precision representation, while the LoRA parameters remain trainable. Training computation may use other numerical formats depending on the implementation.

### 6.1 What QLoRA changes

Compared with conventional LoRA applied to a full-precision or higher-precision base, QLoRA reduces the memory footprint of the frozen base-weight representation through quantization.

This can make adaptation of larger models feasible under tighter memory constraints.

However, quantization does not remove all training costs. Activations, temporary tensors, trainable adapter parameters, and other training state still consume memory.

The actual resource requirements depend on model architecture, quantization format, sequence length, batch configuration, implementation, and hardware support.

### 6.2 Important trade-offs

QLoRA introduces several considerations:

- Lower-precision base weights can affect numerical behavior.
- Supported quantization formats depend on the model and execution stack.
- Kernel and hardware compatibility can constrain which configurations are practical.
- Quantization does not guarantee identical behavior to a higher-precision base.
- Reduced weight memory does not imply proportionally reduced total training time or inference latency.

QLoRA should therefore be evaluated as a combination of adaptation and numerical-representation decisions.

The appropriate question is not simply whether the model fits into memory. It is whether the resulting adapted model meets the quality, compatibility, and resource requirements of the target workload.

## 7. Adapters and Prompt-Based PEFT

LoRA is not the only way to adapt a model without updating all its original parameters.

Other PEFT methods introduce trainable components or representations that influence model behavior while keeping most or all original model weights frozen.

### 7.1 Adapter modules

Adapter methods insert small trainable modules into a model architecture or its computation path.

The base model's original weights remain frozen, while the adapter parameters learn task-specific transformations.

Potential advantages include modular task-specific adaptation and reduced trainable parameter counts.

However, adapters introduce additional modules into the execution path. Their usefulness depends on the architecture, implementation support, compatibility requirements, and resource constraints of the intended workload.

They may be attractive when modularity matters, but they are not automatically simpler or faster at inference.

### 7.2 Prompt tuning

Prompt tuning learns continuous prompt representations that condition the model while keeping the base model's original weights frozen.

Unlike ordinary textual prompting, which supplies human-readable tokens as input, prompt tuning optimizes learned representations used as part of the model's input or conditioning process.

This distinction matters because prompt tuning is a training-based adaptation method, even though it does not update the original model weights.

Its adaptation capacity is constrained by the learned prompt representation and how it interacts with the model.

Prompt tuning should not be confused with changing an instruction manually at inference time.

### 7.3 Prefix tuning

Prefix tuning learns trainable prefix representations that influence the model's internal computation.

Depending on the implementation, the learned prefix can be associated with attention-related representations rather than simply appearing as ordinary user-visible text.

Like other PEFT methods, it reduces the need to update the full set of original model weights but introduces its own representation and execution requirements.

The choice between adapters, prompt tuning, prefix tuning, and LoRA depends on the architecture, available tooling, task, resource constraints, and expected operational behavior.

## 8. Choosing Between Full Fine-Tuning and PEFT

The choice should be based on task requirements and resource constraints rather than a blanket assumption that one method is always superior.

| Decision factor | Full fine-tuning | Parameter-efficient adaptation |
|---|---|---|
| Trainable parameters | Typically updates all model parameters intended for adaptation | Restricts training to a smaller or additional trainable parameter set |
| Training memory | Often higher due to gradients and optimizer state for trainable parameters | Often lower, but activation and base-model computation costs remain |
| Adaptation capacity | Broad parameter-update freedom | Constrained by the chosen adaptation mechanism and configuration |
| Task-specific artifacts | May require storing a full adapted checkpoint | May allow smaller adapters or task-specific parameter artifacts |
| Multiple adaptations | May require separate adapted model copies, depending on workflow | May allow multiple adapters to share a base model |
| Implementation considerations | Requires a suitable training and checkpoint workflow | Requires PEFT method, architecture, and runtime compatibility |
| Generalization risk | Can overfit or degrade existing capabilities | Can also overfit or degrade behavior; parameter efficiency does not eliminate this risk |

These are typical tendencies, not universal guarantees. Training and inference costs depend on the model, implementation, and execution environment.

### 8.1 When full fine-tuning may be justified

Full fine-tuning may be appropriate when:

- The target task justifies broad parameter adaptation.
- Adequate training data and compute are available.
- The team can evaluate generalization and detect regressions.
- The expected benefit warrants the additional training and artifact-management costs.
- The model and training setup support the required procedure.

The method should be selected because its flexibility is useful for the problem, not because updating more parameters sounds more powerful.

### 8.2 When PEFT may be justified

PEFT may be appropriate when:

- Training memory is constrained.
- A task-specific adaptation is required without updating the full model.
- Smaller adaptation artifacts are valuable.
- Multiple task-specific adaptations may share a compatible base model.
- The chosen method can express the required change adequately.

PEFT remains a form of training. It still requires appropriate data, an optimization objective, training configuration, and validation.

A smaller adapter is not automatically better if it cannot achieve the required behavior or creates runtime compatibility problems.

### 8.3 When neither method is justified

Neither full fine-tuning nor PEFT should be the default response to every model limitation.

If the current model already meets the requirements, additional training may add unnecessary cost. If the problem is missing information, unsuitable model selection, or an application-level validation issue, a different intervention may be more appropriate.

The engineer should establish why weight adaptation is justified before selecting a particular adaptation method.

## 9. Common Misconceptions

### 9.1 PEFT means training is computationally cheap

**Why it is incorrect:** Reducing trainable parameters can lower gradient and optimizer-state requirements, but base-model computation and activation memory remain important.

**Better mental model:** PEFT reduces specific training costs; it does not eliminate the cost of training.

### 9.2 LoRA always matches full fine-tuning

**Why it is incorrect:** LoRA restricts the update to a parameterized low-rank form. Some tasks may be represented adequately, while others may require a different adaptation capacity or approach.

**Better mental model:** LoRA offers a resource-efficient adaptation mechanism whose suitability must be established empirically.

### 9.3 QLoRA removes the need for sufficient memory

**Why it is incorrect:** Quantizing the base weights reduces one major memory component, but activations, trainable parameters, temporary tensors, and other training state still require resources.

**Better mental model:** QLoRA changes the memory trade-off rather than eliminating memory constraints.

### 9.4 More trainable parameters guarantee better results

**Why it is incorrect:** Adaptation quality depends on the task, data, optimization, and generalization. Increasing parameter freedom can also increase resource use and overfitting risk.

**Better mental model:** Use enough adaptation capacity to meet the requirements, then validate the result.

### 9.5 A successful training run proves the adaptation is useful

**Why it is incorrect:** A run can complete successfully while producing no meaningful improvement or degrading performance outside the training examples.

**Better mental model:** Training completion is an implementation outcome; task suitability must be established through evaluation.

### 9.6 A smaller adapter guarantees faster inference

**Why it is incorrect:** Adaptation artifact size and inference execution cost are different properties. Runtime behavior depends on how the adapter is applied, the architecture, the execution implementation, and the workload.

**Better mental model:** Measure inference behavior rather than inferring it from parameter count alone.

## 10. Chapter Summary

Fine-tuning adapts a pretrained model by updating learned parameters using a selected training objective and dataset.

Full fine-tuning typically updates all model parameters intended for adaptation. Parameter-efficient methods restrict adaptation to a smaller trainable parameter set or introduce trainable components while keeping the base model largely frozen.

The principal methods covered here are:

- **Full fine-tuning:** Broad parameter updates with potentially substantial training and artifact-management costs.
- **LoRA:** Low-rank trainable updates that can reduce trainable parameter count and optimizer-state requirements.
- **QLoRA:** LoRA adaptation combined with a quantized frozen base model to reduce base-weight memory requirements.
- **Adapters:** Additional trainable modules that provide task-specific transformations.
- **Prompt tuning and prefix tuning:** Learned representations that influence model behavior without updating the original model weights.

These methods differ in adaptation capacity, resource requirements, artifact structure, compatibility, and runtime behavior. None is universally best.

The engineering decision should begin with a justified need for weight adaptation, then consider the required adaptation capacity, available resources, implementation constraints, and evidence needed to validate the result.

Chapter 04 examines the data, training configuration, and generalization considerations that determine whether these methods produce useful adaptations.

## 11. Knowledge Check

Answer these questions before proceeding.

1. A team has sufficient memory for inference but cannot afford full fine-tuning of a model. Explain why inference memory and training memory differ, and identify which PEFT approaches might be worth investigating.
2. A LoRA adapter uses substantially fewer trainable parameters than full fine-tuning. Why does that not prove that it will train proportionally faster or perform equally well?
3. A team uses QLoRA because the base model does not fit in memory at the intended training precision. Which remaining memory and compatibility constraints must still be considered?
4. A model adapted with LoRA performs well on its training examples but poorly on unseen examples. Why is switching to full fine-tuning not automatically the right solution?
5. You must adapt a model for several related tasks while minimizing duplicated model storage. Compare the potential benefits and operational limitations of separate PEFT adapters against separate fully fine-tuned model checkpoints.
6. Describe a scenario in which neither full fine-tuning nor PEFT is justified. Explain which alternative you would investigate and what evidence would support the decision.

Strong answers should distinguish trainable parameter count from total resource use, explain method-specific constraints, and justify the chosen approach against the task requirements.

## 12. Transition to the Next Chapter

This chapter established how full fine-tuning and parameter-efficient methods change a pretrained model, and why adaptation capacity, resource requirements, and implementation constraints influence method selection.

The next chapter examines the factors that determine whether an adaptation produces useful behavior: training-data quality, training configuration, overfitting, generalization, and reproducibility.

[Next: 04 — Adaptation Data, Training Configuration, and Generalization](04-Adaptation-Data-Training-Configuration-and-Generalization.md)
