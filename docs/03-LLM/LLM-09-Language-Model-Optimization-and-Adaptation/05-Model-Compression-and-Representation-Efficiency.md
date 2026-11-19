# 05 — Model Compression and Representation Efficiency

## 1. Purpose

Large language models can be expensive to store, load, and execute. Their resource requirements depend not only on the number of parameters but also on how those parameters are represented, how computations are performed, and how much intermediate state the workload requires.

Model compression and representation efficiency address these constraints by reducing the storage or computational requirements of a model, changing its numerical representation, or replacing it with a smaller model that can perform the required task adequately.

These approaches introduce trade-offs. A compressed model may use less memory but produce lower-quality outputs. A smaller model may execute more efficiently but lack capabilities required by the application. A representation that reduces storage requirements may also introduce hardware compatibility constraints or require additional computation during execution.

This chapter develops an engineering framework for understanding those trade-offs. It covers:

- Model size and resource requirements.
- Numerical precision and quantization.
- Post-training quantization and quantization-aware training.
- Quantization formats and their practical implications.
- Pruning and structured versus unstructured sparsity.
- Knowledge distillation and smaller-model selection.
- Quality, memory, compute, and compatibility trade-offs.
- Controlled comparison and compression decisions.

The focus is on understanding compression mechanisms and making defensible model-representation decisions. It does not cover advanced GPU kernels, serving schedulers, production deployment infrastructure, or distributed serving optimization. Those concerns belong to Production AI Engineering.

## 2. The Model Representation Problem

A model's learned parameters are numerical values used by its computation. The representation of those values affects how much storage they require and which arithmetic operations can be performed efficiently.

Consider a model with \(N\) parameters. If every parameter is stored using a fixed-width representation of \(b\) bits, the approximate storage required for the parameter values is:

\[
M_{\text{weights}} = \frac{N b}{8}
\]

where:

- \(N\) is the number of parameters.
- \(b\) is the number of bits per parameter.
- \(M_{\text{weights}}\) is the parameter storage in bytes.

This estimate excludes additional storage such as quantization metadata, alignment overhead, temporary tensors, runtime allocations, and other model state.

For example, a model with 7 billion parameters stored at 16 bits per parameter has an approximate weight-storage requirement of:

\[
\frac{7 \times 10^9 \times 16}{8}
= 14 \times 10^9 \text{ bytes}
\]

That is approximately 14 GB in decimal units, or about 13.0 GiB.

This calculation describes weight storage, not the total memory required to load and execute the model.

### 2.1 Weight memory is not total execution memory

A language model requires resources beyond its stored parameters.

Depending on the execution setup, memory may also be required for:

- Intermediate activations.
- Temporary computation buffers.
- Attention-related state, including the KV cache during autoregressive generation.
- Runtime metadata and quantization scales.
- Inputs, outputs, and other execution state.
- Additional model components, if present.

During training, gradients and optimizer state can introduce substantial additional memory requirements. Training and inference therefore have different memory profiles.

This distinction connects to Chapter 03's adaptation methods and Chapter 04's training-resource discussion. Here, the emphasis is on reducing the model representation or choosing a smaller model.

A reduction in weight memory does not automatically produce the same proportional reduction in total execution memory.

### 2.2 Four different optimization objectives

Model compression decisions should distinguish four objectives.

| Objective | Engineering question |
|---|---|
| Memory efficiency | Can the model fit within the available memory budget? |
| Compute efficiency | How much computation is required to execute the workload? |
| Quality preservation | Does the compressed or smaller model still meet task requirements? |
| Compatibility | Can the intended hardware and software execute the chosen representation correctly and efficiently? |

These objectives are related but not interchangeable.

A model can use less memory without executing faster. A representation can reduce arithmetic precision but require conversion or specialized kernels. A smaller model can improve throughput while losing important task capabilities.

The correct representation is the one that satisfies the application's requirements under the actual resource and execution constraints.

## 3. Numerical Precision and Representation

Numerical precision describes how numerical values are represented and the range and resolution available to those representations.

Floating-point formats commonly used in machine learning include FP32, FP16, and BF16. Quantized representations may use lower bit widths, such as 8-bit or 4-bit values, often with additional scales, zero points, or other metadata.

The bit width alone does not fully determine numerical behavior. Different formats have different ranges, precision characteristics, and implementation requirements.

### 3.1 Floating-point representations

**FP32** uses 32 bits per value and provides comparatively high numerical precision. It is often used as a reference representation or for computations that require its numerical characteristics, although actual training and inference configurations vary.

**FP16** uses 16 bits per value. It reduces storage compared with FP32 and can be efficient on supported hardware, but its numerical range differs from FP32.

**BF16** also uses 16 bits per value. It has a wider exponent range than FP16 but fewer fraction bits, giving it different numerical characteristics.

The choice between FP16 and BF16 is not simply a choice between faster and slower computation. Performance and numerical behavior depend on the hardware, software, operations, and workload.

### 3.2 Reduced precision is not automatically quantization

Reduced-precision floating-point execution and low-bit quantization are related but distinct techniques.

Reduced-precision floating-point computation uses a lower-precision floating-point representation for selected values or operations.

Quantization maps values into a more restricted numerical representation, commonly using lower-bit integer-like values and associated scaling information.

Both can reduce memory requirements or improve computational efficiency, but their implementation and numerical effects differ.

This chapter focuses primarily on quantization because it is a major model-compression mechanism for language models. The underlying principle is broader: numerical representation is an engineering choice that affects resource use and model behavior.

## 4. Quantization Fundamentals

Quantization represents numerical values using a more restricted set of representable values.

In language models, weight quantization reduces the number of bits used to represent model weights. Depending on the method, activations or other tensors may also be quantized.

The objective is to reduce memory requirements and potentially improve computational efficiency while preserving acceptable model quality.

### 4.1 The basic quantization idea

Consider a floating-point value \(w\). A simplified affine quantization process maps it to a discrete value \(q\):

\[
q =
\operatorname{clip}\left(
\operatorname{round}\left(\frac{w}{s}\right)+z,
q_{\min},
q_{\max}
\right)
\]

where:

- \(s\) is a scale.
- \(z\) is a zero point.
- \(q_{\min}\) is the minimum representable quantized value.
- \(q_{\max}\) is the maximum representable quantized value.
- \(\operatorname{round}\) maps the scaled value to an integer according to the implementation's rounding rule.
- \(\operatorname{clip}\) constrains the integer result to the representable range.

The corresponding approximate reconstruction is:

\[
\hat{w}=s(q-z)
\]

Here, \(\hat{w}\) is an approximation of the original value \(w\).

This is a simplified representation of affine quantization. Actual schemes may use different mappings, clipping rules, scaling strategies, group sizes, or symmetric representations. Some weight-only methods use other quantization formulations.

The representable range is an important part of the process. If the rounded value falls outside that range, clipping or saturation maps it to the nearest permitted boundary. The original value cannot then be represented exactly using that quantized value and scale.

### 4.2 Quantization error

The difference between the original and reconstructed values can be represented as:

\[
e = w-\hat{w}
\]

This value describes the representation error for an individual weight.

Two effects can contribute to this error:

- **Rounding error:** The scaled value is mapped to a discrete representable value.
- **Clipping error:** A value outside the representable range is constrained to the nearest permitted boundary.

The relative contribution of these effects depends on the value distribution, scale selection, quantization range, and quantization method.

However, the effect of quantization on model quality cannot be determined by inspecting individual weight errors alone. A model's computation combines many parameters through multiple layers, so small local errors can interact in ways that are difficult to predict from weight-level measurements.

Two quantization methods using the same nominal bit width may produce different model behavior because they use different scaling, grouping, clipping, or calibration strategies.

Therefore, lower bit width does not uniquely determine the resulting quality.

### 4.3 Why lower bit widths can reduce memory

Ignoring metadata and alignment, a parameter stored using 4 bits requires one quarter of the raw storage of a parameter stored using 16 bits.

For a model with 7 billion parameters:

| Weight representation | Approximate raw weight storage |
|---|---:|
| 16-bit | 14 GB |
| 8-bit | 7 GB |
| 4-bit | 3.5 GB |

These are theoretical decimal estimates of raw-weight storage. Actual memory consumption will be higher because real implementations include metadata, packing, alignment, runtime allocations, and potentially higher-precision tensors.

The table illustrates the storage relationship. It does not guarantee a particular GPU memory requirement or runtime performance.

### 4.4 Weight quantization versus activation quantization

**Weight quantization** reduces the precision used to represent model weights.

**Activation quantization** reduces the precision used for intermediate values produced during model computation.

Weight quantization can reduce the memory required to store the model's parameters. Activation quantization can affect intermediate memory and the arithmetic used during execution.

Some implementations quantize weights while performing computations or storing activations at higher precision. Others use lower precision for both weights and activations.

The distinction matters because the memory and computational benefits depend on which tensors are quantized and how the execution system handles them.

## 5. Post-Training Quantization

Post-training quantization (PTQ) applies quantization to a model after its main training process has completed.

The model's learned parameters are converted into a selected quantized representation without requiring a full retraining process.

Depending on the method, PTQ may use calibration data to estimate activation ranges, select scales, or configure other quantization parameters. Some weight-only methods can quantize weights without a separate activation-calibration stage.

### 5.1 Why PTQ is useful

PTQ is attractive because it can reduce the memory requirements of an existing model without repeating its original training process.

Potential benefits include:

- Lower model-weight storage requirements.
- Reduced memory pressure during inference.
- Easier experimentation with different numerical representations.
- A comparatively accessible path to fitting a model within a resource budget.

However, PTQ does not guarantee that every model will retain its original behavior at every quantization level.

### 5.2 Calibration

Some quantization methods use representative inputs to estimate how values behave during execution.

Calibration helps determine suitable quantization parameters for the selected representation.

For example, activation calibration may use representative inputs to estimate activation ranges. If the calibration data does not represent the intended workload, the resulting quantization parameters may be unsuitable for actual inputs.

Calibration is not the same as fine-tuning. In a conventional PTQ workflow, it estimates or configures the quantized representation rather than optimizing the model through a full task-specific gradient-based adaptation process.

The exact requirements depend on the quantization method.

### 5.3 PTQ trade-offs

PTQ can be a practical first option when the main objective is to reduce memory without undertaking another training process.

Its limitations include:

- Quantization error can degrade task performance.
- Some models and layers may be more sensitive to quantization than others.
- Calibration quality matters for methods that depend on calibration.
- Runtime support determines whether the representation can be executed efficiently.
- The smallest available representation may not satisfy the application's quality requirements.

The appropriate bit width and quantization method should be selected using evidence from the intended workload.

## 6. Quantization-Aware Training

Quantization-aware training (QAT) incorporates quantization effects into a training or adaptation process.

Rather than applying quantization only after training, the process exposes the optimization to an approximation of the quantized computation or representation.

This can help the model adapt to quantization-related errors.

The exact implementation varies. Some approaches simulate quantization during training while retaining higher-precision trainable parameters. The final deployment representation may then use lower-precision weights or operations.

### 6.1 Why QAT may help

PTQ converts an existing model into a restricted representation. QAT allows the training process to account for that restriction while optimizing the model.

This may improve quality when post-training quantization produces unacceptable degradation.

However, QAT introduces additional training complexity and resource costs. It also depends on the training setup, quantization scheme, supported operations, and final execution environment.

QAT is not guaranteed to outperform every PTQ method for every model or task.

### 6.2 PTQ versus QAT

| Consideration | Post-training quantization | Quantization-aware training |
|---|---|---|
| Main process | Quantizes an already trained model | Incorporates quantization effects into training or adaptation |
| Additional training | Often not required | Typically required |
| Engineering effort | Often lower | Usually higher |
| Quality recovery | Limited by the chosen PTQ method and representation | May improve quality when the model can adapt to quantization effects |
| Resource requirements | Requires quantization and validation resources | Adds training compute and configuration requirements |
| Best starting point | When a low-overhead compression experiment is appropriate | When PTQ does not meet quality requirements and additional training is justified |

These are typical tendencies, not universal guarantees.

An engineer should generally establish a PTQ baseline before deciding that QAT is necessary, unless known constraints or prior evidence justify another starting point.

## 7. Quantization Formats and Compatibility

A nominal bit width does not fully specify a quantized model.

Quantization methods differ in how values are grouped, scaled, clipped, packed, and consumed by the execution system.

These details affect numerical behavior, storage overhead, and compatibility.

### 7.1 Group-wise quantization

Some methods apply quantization parameters to groups of weights rather than using one global scale for an entire tensor.

Group-wise quantization can represent local numerical ranges more accurately when different groups have different value distributions.

However, group size and metadata introduce trade-offs. Smaller groups may improve local representation flexibility but require more metadata. Larger groups may reduce overhead but constrain how well the scale represents values within the group.

The best choice depends on the method, model, and supported execution path.

### 7.2 Symmetric and asymmetric quantization

Symmetric quantization represents values around zero using a symmetric numerical range. Asymmetric quantization can represent ranges with a nonzero offset through a zero point.

The choice affects how representable values are distributed across the numerical range.

Neither approach is universally superior. The appropriate scheme depends on the distribution of the values being quantized, the implementation, and the intended operations.

### 7.3 Quantization metadata and storage overhead

A model's quantized artifact contains more than packed low-bit weights.

Depending on the format, it may include:

- Scales.
- Zero points.
- Grouping metadata.
- Quantization configuration.
- Higher-precision tensors or components.
- Format-specific information needed for loading and execution.

Consequently, actual artifact size will generally differ from the theoretical raw-weight estimate.

A comparison should measure the actual artifacts rather than assuming that the nominal bit width determines exact storage.

### 7.4 Compatibility is part of the decision

A quantized representation may require particular runtime libraries, hardware capabilities, or supported operations.

A model that fits within the memory budget but cannot be executed by the intended runtime is not a viable solution.

Compatibility considerations include:

- Supported numerical formats.
- Hardware and runtime support.
- Model architecture compatibility.
- Quantization implementation.
- Required conversions or dequantization operations.
- Availability of an appropriate execution path.

Compatibility must be verified for the intended environment. A representation's existence in a model repository does not prove that it will execute efficiently on every supported device.

## 8. Pruning and Sparsity

Pruning reduces a model by removing or suppressing selected parameters, connections, or structural components.

The basic idea is to identify parts of the model that can be removed with an acceptable loss of capability.

Unlike quantization, which changes the numerical representation of values, pruning changes which parameters or structures remain active or present.

### 8.1 Unstructured pruning

Unstructured pruning removes individual parameters, often by setting selected weights to zero.

This can produce a sparse weight matrix with fewer nonzero values.

However, a matrix containing many zeros does not automatically require proportionally less storage or execute faster. A conventional dense representation may still store those zeros, and a dense computation may continue processing the matrix without exploiting the sparsity.

Real resource benefits depend on whether the sparse representation and execution implementation can use the resulting structure efficiently.

### 8.2 Structured pruning

Structured pruning removes larger components, such as selected channels, heads, or other architecture-defined structures.

When supported by the architecture and execution implementation, structured pruning can reduce tensor dimensions and the amount of computation required by affected operations.

Its limitations include potential quality degradation and architectural constraints. Removing a component can change how the model processes information, and the remaining structure must still be supported by the runtime.

### 8.3 Pruning trade-offs

Pruning introduces several engineering questions:

- Which parameters or structures can be removed?
- How is importance determined?
- How much quality degradation is acceptable?
- Does the resulting representation reduce actual storage?
- Can the execution implementation exploit the sparsity?
- Does the architecture remain compatible with the intended runtime?

Pruning should not be selected solely because a model contains many small or low-magnitude weights. The relevant question is whether the resulting model meets both the quality and resource requirements.

This chapter covers pruning conceptually. Detailed pruning algorithms and architecture-specific implementations are outside its scope.

## 9. Knowledge Distillation and Smaller Models

Quantization and pruning modify the representation or structure of an existing model. Knowledge distillation takes a different approach: it trains a smaller model to learn behavior from a larger teacher model or another source of supervisory signals.

The smaller model is commonly called the **student**, while the model providing guidance is called the **teacher**.

The goal is to produce a model with lower resource requirements while retaining sufficient capability for the target task.

### 9.1 The basic distillation idea

A conventional supervised training process learns from target labels or outputs.

Distillation can additionally use information produced by a teacher model. For example, the teacher may provide probability distributions over possible outputs, intermediate representations, or generated target responses.

The student is trained using a distillation objective that encourages it to approximate selected aspects of the teacher's behavior.

A simplified objective can be represented as:

\[
\mathcal{L}_{\text{student}}
=
\lambda \mathcal{L}_{\text{task}}
+
(1-\lambda)\mathcal{L}_{\text{distill}}
\]

where:

- \(\mathcal{L}_{\text{task}}\) represents a task-specific training objective.
- \(\mathcal{L}_{\text{distill}}\) represents the selected distillation objective.
- \(\lambda\) controls the relative contribution of the two terms.

This is an illustrative objective, not a universal distillation formula. Actual objectives may use different combinations of terms, targets, or weighting schemes.

### 9.2 Why distillation can help

A smaller model may require less memory and computation than a larger model, depending on the architecture and execution setup.

Distillation provides a way to transfer selected teacher behavior into that smaller model.

Potential benefits include:

- Lower model-weight storage requirements.
- Reduced inference resource requirements.
- A model better suited to a constrained environment.
- Task-specific behavior learned from teacher-generated or teacher-derived supervision.

However, distillation does not guarantee that the student will preserve every capability of the teacher.

The student has its own architecture, capacity, training objective, and learned parameter state. The quality of the result depends on the teacher, data, objective, training process, and target task.

### 9.3 Teacher quality and supervision

Distillation can transfer useful behavior, but it can also transfer mistakes or undesirable patterns from the teacher.

Teacher-generated targets may contain incorrect answers, inconsistent formatting, or behavior that does not match the application's requirements.

The training dataset and target construction therefore remain important. A large collection of teacher-generated examples does not automatically constitute a high-quality distillation dataset.

Distillation should be evaluated against the task requirements, not only against similarity to the teacher.

### 9.4 Distillation versus quantization

These techniques address different parts of the resource problem.

| Consideration | Quantization | Knowledge distillation |
|---|---|---|
| Main mechanism | Changes the numerical representation of model values | Trains a smaller model using teacher-derived or other supervisory signals |
| Base model | Commonly retains the original architecture and learned behavior in approximate form | Uses a student model that may have a different architecture or capacity |
| Additional training | Often unnecessary for PTQ; required for QAT | Required to train the student |
| Primary trade-off | Representation error versus resource efficiency | Student capability versus reduced model size and execution cost |
| Artifact | Quantized representation of the selected model | A separately trained student model |

The approaches are not mutually exclusive. A smaller distilled model may also be quantized, provided the combination meets the required quality and compatibility constraints.

### 9.5 Choosing a smaller model directly

Distillation is not the only way to obtain a smaller model.

An engineer may select an existing smaller model that already meets the application requirements. This can avoid the cost and complexity of training a student model.

The decision should compare the actual candidates against the same target requirements and relevant resource constraints.

A smaller model is preferable only if it provides a suitable balance of capability, resource consumption, compatibility, and operational simplicity.

## 10. Compression Is Not the Same as Adaptation

Compression and adaptation can both change the model used by an application, but they address different primary objectives.

**Adaptation** changes learned behavior to better meet a target task.

**Compression** reduces the storage, representation, or structural requirements of a model while attempting to preserve sufficient capability.

These objectives can interact, but they should not be conflated.

For example:

- LoRA introduces trainable low-rank updates to adapt model behavior.
- Quantization changes how model weights are represented.
- Pruning removes selected parameters or structures.
- Distillation trains a smaller model to reproduce selected behavior.

A technique may influence both quality and resource requirements, but its primary mechanism determines which engineering questions must be investigated.

### 10.1 Combining adaptation and compression

A model may be adapted first and then quantized, or a smaller student may be trained for a task and subsequently compressed.

However, the order and combination of techniques can affect the final result.

For example, quantization can introduce errors that affect behavior learned during adaptation. A smaller student may already have limited capacity before quantization is applied.

The final combination must therefore be evaluated as a complete candidate rather than assuming that the benefits of each technique will simply add together.

The appropriate sequence depends on the task, model, method, resources, and compatibility requirements.

## 11. Quality, Memory, Compute, and Compatibility Trade-offs

Compression is a constrained optimization problem rather than a search for the smallest possible model.

The engineering objective is to satisfy the application requirements while remaining within the available resource and execution constraints.

### 11.1 Quality versus memory

Lower-bit quantization often reduces raw weight storage. A smaller model can reduce parameter storage through a different mechanism.

However, both approaches can reduce capability or task performance relative to a larger or higher-precision reference.

The amount of degradation depends on the model, task, method, and configuration.

The smallest candidate is not necessarily the best candidate. A model that fails a critical task requirement is not acceptable merely because it fits comfortably within memory.

### 11.2 Memory versus throughput

Reducing model-weight memory may improve throughput when memory capacity or memory movement is a limiting factor.

However, execution performance depends on more than weight storage. Hardware support, compute utilization, memory bandwidth, numerical format, batch configuration, and implementation details can influence the result.

A low-bit representation may reduce memory traffic but require additional operations or rely on kernels that are inefficient for the target hardware.

Therefore, a reduction in model size should not be treated as proof of a proportional throughput improvement.

### 11.3 Compute versus numerical precision

Lower-precision operations can be efficient when the hardware and execution implementation support them effectively.

However, some quantized representations require unpacking, scaling, conversion, or dequantization operations. These operations can affect execution efficiency.

A representation that reduces storage but does not map well to the available hardware may fail to provide the expected compute benefit.

The practical question is whether the complete execution path benefits from the selected representation.

### 11.4 Quality versus compatibility

A quantization method may preserve acceptable quality but be incompatible with the target runtime. A sparse representation may reduce the number of nonzero parameters but provide no benefit if the execution implementation cannot exploit it.

A smaller model may fit the resource budget but lack an architecture or capability required by the application.

Compatibility is therefore a constraint, not a secondary detail to consider after choosing the smallest model.

### 11.5 A decision framework

Before selecting a compression approach, establish:

1. **Quality requirements:** What task behavior must be preserved?
2. **Resource constraints:** Which memory, compute, storage, or throughput limits matter?
3. **Reference candidate:** Which existing model and representation provide the comparison baseline?
4. **Candidate mechanisms:** Which compression or smaller-model approaches are suitable?
5. **Compatibility requirements:** Which hardware, numerical formats, and runtimes must be supported?
6. **Evidence requirements:** What observations will determine whether the candidate is acceptable?
7. **Complexity costs:** Does the resource benefit justify the additional training, conversion, or maintenance work?

The goal is not to maximize compression in isolation. It is to find a viable candidate under the actual requirements.

## 12. Common Misconceptions

### 12.1 Four-bit weights mean the entire model uses one quarter of the memory

**Why it is incorrect:** The raw weight-storage estimate excludes metadata, alignment, runtime allocations, temporary tensors, and other execution state.

**Better mental model:** Bit width estimates one major component of memory. Actual model memory must be measured in the intended execution environment.

### 12.2 Quantization always makes inference faster

**Why it is incorrect:** Lower-bit representations can reduce memory traffic, but runtime performance also depends on hardware support, kernels, conversion overhead, and the workload.

**Better mental model:** Quantization creates an opportunity for efficiency. Actual performance depends on the execution path.

### 12.3 Quantization only changes storage

**Why it is incorrect:** Quantization can change the numerical values used in model computation and therefore affect the resulting outputs.

**Better mental model:** Quantization changes numerical representation and can influence both resource use and model behavior.

### 12.4 All four-bit models are equivalent

**Why it is incorrect:** Models can differ in quantization scheme, grouping, scaling, metadata, calibration, and runtime implementation even when they use the same nominal bit width.

**Better mental model:** Compare the complete representation and execution configuration, not just the number of bits.

### 12.5 Sparse weights guarantee faster execution

**Why it is incorrect:** The execution system may still store or process the sparse matrix as if it were dense, or may incur overhead when exploiting sparsity.

**Better mental model:** Sparsity provides resource benefits only when the representation and implementation can use it effectively.

### 12.6 Distillation guarantees the student will match the teacher

**Why it is incorrect:** The student has its own capacity, architecture, training data, and optimization objective. It may fail to reproduce some teacher capabilities.

**Better mental model:** Distillation transfers selected behavior imperfectly; the student must be evaluated for its intended task.

### 12.7 The smallest model is always the best engineering choice

**Why it is incorrect:** A smaller model may fail required tasks, introduce compatibility problems, or require additional complexity to compensate for lost capabilities.

**Better mental model:** Optimize against explicit quality and resource constraints rather than model size alone.

### 12.8 Compression techniques can be evaluated independently and then combined without re-testing

**Why it is incorrect:** Quantization, pruning, and distillation can interact. The final candidate may behave differently from the individual components.

**Better mental model:** Evaluate the combined representation and model as a complete candidate.

## 13. Practical Compression Decision Workflow

A controlled compression workflow should establish a reference, identify the limiting resource, select a suitable candidate method, and assess the result against the requirements.

### Step 1 — Establish the reference

Identify the current model, its representation, and the task requirements it satisfies.

Record enough information to reproduce the comparison. The reference should represent the model or configuration against which the compression decision will be made.

### Step 2 — Identify the actual constraint

Determine which resource is limiting the application.

Examples include:

- Model weights do not fit within the available memory.
- Model loading requires too much storage or time.
- Execution is constrained by memory movement.
- A smaller model is needed for a restricted hardware environment.
- The current model's resource requirements exceed the available budget.

Do not assume that model size is the cause of every performance problem.

### Step 3 — Select a candidate mechanism

Choose a method based on the diagnosed constraint.

Examples:

- Try post-training quantization when reducing weight memory is the primary objective.
- Consider quantization-aware training when PTQ does not meet quality requirements and additional training is justified.
- Consider pruning when the target architecture and execution path can exploit the resulting sparsity.
- Consider distillation or an existing smaller model when reducing model capacity and resource requirements is appropriate.

These are starting hypotheses, not automatic prescriptions.

### Step 4 — Verify compatibility

Confirm that the candidate representation or model can be loaded and executed by the intended hardware and runtime.

A candidate that is incompatible with the required execution environment should not proceed merely because its theoretical storage estimate is attractive.

### Step 5 — Compare the candidate with the reference

Use the same relevant task conditions for both candidates. Assess whether the candidate retains the required behavior and whether its resource benefits are meaningful.

The specific metrics and comparison methodology belong to LLM-08. The key requirement here is to make the comparison controlled and relevant to the intended workload.

### Step 6 — Interpret the result

Classify the outcome:

- **Accept:** The candidate satisfies the requirements and provides a meaningful resource benefit.
- **Revise:** The candidate shows promise but requires a justified change to the method or configuration.
- **Reject:** The quality loss, resource benefit, compatibility limitations, or additional complexity makes the candidate unsuitable.

A failed compression attempt is still useful if it identifies the relevant limitation and the experiment is documented clearly.

## 14. Engineering Decision Checklist

Before accepting a compressed or smaller model, verify the following.

### Model and representation

- Is the reference model clearly identified?
- Is the compression mechanism understood?
- Are the representation and relevant configuration recorded?
- Are actual artifact size and memory requirements distinguished from theoretical estimates?

### Quality and resources

- Does the candidate satisfy the application's required behavior?
- Is the quality-resource trade-off acceptable?
- Has the actual limiting resource been identified?
- Is the expected resource benefit supported by measurements rather than bit-width or parameter-count estimates alone?
- Have relevant execution costs and overheads been considered?

### Compatibility and maintainability

- Can the target hardware and runtime execute the candidate?
- Are required numerical formats and operations supported?
- Does the representation introduce additional conversion or execution complexity?
- If multiple techniques are combined, has the complete candidate been evaluated?
- Is the reason for accepting or rejecting the candidate documented?

A candidate should not be accepted solely because it is smaller. It must be suitable for the intended application and execution environment.

## 15. Knowledge Check

Answer these questions before proceeding.

1. A model uses 16-bit weights and occupies approximately 14 GB of raw weight storage. You quantize its weights to four bits, but the runtime still requires substantially more memory than the raw-weight estimate. Explain why this is possible and identify the additional memory components you would investigate.

2. Two quantized versions of the same model use the same nominal bit width but produce different task results. Explain how their quantization schemes, calibration, grouping, or execution details could contribute to the difference.

3. A quantized model uses less memory but is slower than the original model on the target hardware. Identify plausible causes and explain what evidence you would collect before rejecting quantization entirely.

4. A model contains a high proportion of zero-valued weights after pruning, but its inference latency remains unchanged. Explain why this outcome is possible and distinguish unstructured sparsity from structured pruning.

5. A distilled student model is much smaller than its teacher but performs poorly on a required task. Explain why teacher imitation does not guarantee that the student meets the application's requirements, and identify which assumptions you would investigate.

6. You can either quantize the existing model or select an existing smaller model. Describe how you would decide between these options when memory, task quality, and runtime compatibility are all constraints.

7. A team quantizes a model, prunes it, and then distills its behavior into a smaller student. Why is it insufficient to assume that the individual benefits will add together? Explain how you would structure the comparison.

Strong answers should distinguish theoretical resource estimates from actual execution behavior and explain why model quality and compatibility remain explicit constraints.

## 16. Chapter Summary

Model compression and representation efficiency reduce resource requirements by changing numerical representation, removing selected model components, or training a smaller model to reproduce selected behavior.

The central mechanisms covered here are:

- **Quantization:** Represents weights or other tensors using a more restricted numerical representation.
- **Post-training quantization:** Applies quantization after the main training process, sometimes using calibration.
- **Quantization-aware training:** Incorporates quantization effects into training or adaptation.
- **Pruning:** Removes selected parameters or structures, with actual benefits depending on the representation and execution implementation.
- **Knowledge distillation:** Trains a smaller student model using teacher-derived or other supervisory signals.
- **Smaller-model selection:** Uses an existing model that may already satisfy the application's requirements with lower resource consumption.

The most important engineering principles are:

- Distinguish weight storage from total execution memory.
- Treat numerical representation as both a resource and a model-behavior decision.
- Do not infer speed from bit width, sparsity, or parameter count alone.
- Consider quality, memory, compute, and compatibility together.
- Validate the complete candidate in the intended execution environment.
- Combine compression methods only with appropriate evaluation of the final result.
- Select a candidate because it satisfies explicit requirements, not because it achieves the maximum compression ratio.

The next chapter examines inference performance and resource trade-offs in more detail, including how computation, sequence length, generation behavior, and KV-cache requirements influence the resources needed to execute a language model.

## 17. Transition to the Next Chapter

Proceed to:

[06 — Inference Performance and Resource Trade-offs](06-Inference-Performance-and-Resource-Trade-offs.md)

The next chapter focuses on inference-time computation and resource behavior. It builds on this chapter's representation-efficiency concepts while keeping model compression and execution-performance analysis conceptually distinct.
