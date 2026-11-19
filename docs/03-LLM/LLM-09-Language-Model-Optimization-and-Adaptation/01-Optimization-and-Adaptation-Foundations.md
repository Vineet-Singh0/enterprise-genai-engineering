# 01 — Optimization and Adaptation Foundations

## 1. Purpose

Language model optimization is the engineering process of improving a model's suitability for a defined workload while respecting constraints such as quality, latency, memory, throughput, cost, and maintainability.

A model can be capable in general yet unsuitable for a particular application. It may produce inconsistent outputs, require excessive computational resources, respond too slowly, or fail to meet task-specific requirements. These problems do not necessarily have the same cause, and they should not automatically be addressed with the same intervention.

Consider a language model used to extract structured information from customer support messages. The application requires accurate field extraction, predictable output formats, acceptable latency, and a limited inference budget.

Several interventions might be considered:

- Improve the instructions and output constraints supplied to the existing model.
- Adapt the model's weights using representative task examples.
- Use a compressed model that requires less memory.
- Investigate inference configuration and workload characteristics to reduce resource consumption.

Each approach changes a different part of the system. Selecting the wrong intervention can increase complexity and cost without solving the original problem.

The purpose of this chapter is to establish a common framework for reasoning about these decisions. It defines the optimization problem, distinguishes the major intervention categories, and explains how engineering constraints determine which approaches deserve investigation.

Detailed implementation and method-specific trade-offs belong to the subsequent chapters.

## 2. Defining the Optimization Problem

Optimization is meaningful only relative to an objective.

There is no universally optimal language model configuration because different applications value different outcomes. A customer-facing assistant, a document classification service, and an interactive coding assistant may have very different requirements.

An optimization decision begins by identifying the workload, the limitation, the desired outcome, and the constraints that must remain satisfied.

### 2.1 Define the workload

A workload describes how the model is used, including the task, input distribution, output requirements, request frequency, and relevant execution conditions.

Examples include:

- Classifying short support messages into predefined categories.
- Extracting entities from long documents.
- Generating structured summaries.
- Producing code under specific constraints.
- Answering questions using supplied context.

The workload matters because the same model can behave differently across tasks and input distributions. An intervention that improves short-text classification may not improve long-form reasoning.

Optimization results must therefore be interpreted in the context of the workload that produced them.

### 2.2 Identify the limitation

A limitation is a specific gap between current behavior and the application's requirements.

Examples include:

- Incorrect task outputs.
- Inconsistent formatting.
- Excessive response latency.
- Memory requirements that exceed available hardware.
- High inference cost.
- Degraded quality after reducing numerical precision.
- Poor generalization to examples that differ from the adaptation data.

These are observations, not explanations of their own causes.

For example, poor output quality does not automatically imply that the model needs fine-tuning. The problem could instead involve unclear instructions, missing context, an unsuitable model, or an evaluation setup that does not represent the actual task.

**Engineering principle:** Identify the relevant limitation before selecting the intervention.

### 2.3 Define objectives and constraints

An objective describes what the system should improve. Constraints describe what must remain acceptable.

Suppose an application needs better extraction accuracy while keeping inference latency below an operational limit. A change that improves accuracy but causes latency to exceed that limit may not be a valid solution.

A simplified decision model is:

\[
\begin{aligned}
\text{Choose intervention } a \text{ to improve } Q(a)\\
\text{subject to } L(a)\leq L_{\max}\\
M(a)\leq M_{\max}\\
C(a)\leq C_{\max}
\end{aligned}
\]

Here:

- \(a\) represents an intervention or configuration.
- \(Q(a)\) represents the relevant task-quality measure.
- \(L(a)\) represents latency.
- \(M(a)\) represents memory consumption.
- \(C(a)\) represents cost.
- The maximum values represent application constraints.

This is a simplified decision model, not a universal optimization formula. Some applications have multiple quality measures, hard compatibility requirements, or additional constraints such as output validity and throughput.

The important idea is that an intervention must be evaluated against the complete set of requirements, not a single attractive metric.

## 3. The Four Categories of Intervention

LLM-09 organizes optimization decisions into four categories. They describe where an intervention acts and what it changes.

### 3.1 Inference-time interventions

Inference-time interventions change how an existing model is used without updating its learned weights.

Examples include changing task instructions, supplying representative examples, modifying generation parameters, and applying appropriate output constraints.

These interventions are useful when the model already has the necessary capability but does not consistently express it under the current usage configuration.

They may be attractive because they avoid the additional data preparation and training requirements associated with weight adaptation. However, changing how a model is used cannot guarantee that an underlying capability limitation will be resolved.

Chapter 02 examines these interventions and the decisions involved in determining whether they are sufficient.

### 3.2 Weight adaptation

Weight adaptation changes model parameters to influence how the model behaves on a target task.

Fine-tuning is a common example. It uses task-specific training data and an optimization procedure to update some or all of a model's parameters.

Adaptation may be justified when a suitable model exists but its behavior does not meet requirements, and simpler interventions have been shown to be insufficient or inappropriate.

Potential costs include training compute, data preparation, experimentation, validation, and the possibility of overfitting or degrading previously useful capabilities.

Weight adaptation is not automatically preferable to changing model usage. It introduces a different set of engineering obligations.

Chapter 03 covers adaptation methods. Chapter 04 examines the data, training decisions, and generalization risks that influence their outcomes.

### 3.3 Model compression

Model compression reduces some aspect of a model's representation or computational requirements.

Common approaches include quantization, pruning, and knowledge distillation.

Compression is relevant when memory consumption, deployment constraints, or inference cost prevent an otherwise suitable model from being used effectively.

However, compression can affect output quality, supported operations, numerical behavior, or compatibility with the execution environment. Its value depends on whether the resource savings justify those consequences.

Compression is therefore not synonymous with improving every dimension of model performance.

Chapter 05 examines compression methods and their trade-offs.

### 3.4 Inference performance and resource optimization

Inference performance optimization focuses on the resources and execution behavior involved in generating outputs.

Relevant considerations include input processing, autoregressive generation, KV-cache memory, input and output lengths, and the relationship between memory, compute, latency, and throughput.

Some interventions reduce the work required for a request. Others change how available resources are used or expose different trade-offs under particular workloads.

These changes do not necessarily alter the model's learned weights or improve its underlying task capability.

Chapter 06 develops the model-level reasoning needed to understand these effects. Production serving infrastructure and advanced execution-system implementation remain outside this module's scope.

## 4. Diagnose Before Selecting an Intervention

The four categories provide a starting point, but choosing a category requires more than classifying a proposed technique. The same observed symptom may have multiple possible causes.

Consider a model that generates invalid JSON when extracting fields from a message.

Possible explanations include:

- The instructions do not specify the required structure clearly enough.
- The model does not reliably follow the requested output format.
- The selected model has insufficient capability for the task.
- The generation configuration is unsuitable.
- The evaluation examples do not accurately represent the intended workload.

These explanations suggest different investigations. Fine-tuning before identifying the limitation could add training cost without addressing the actual cause.

A disciplined investigation separates three elements.

**Observation — What is the system doing?**

Example: The model returns malformed JSON for 12% of the evaluation examples.

**Hypothesis — What might explain the observation?**

Example: The model may be insufficiently reliable at following the required output structure under the current instructions.

**Intervention — What controlled change could test that explanation?**

Example: Revise the instructions while keeping the model, evaluation examples, and other relevant conditions unchanged.

The observation is not proof of the hypothesis. The intervention should produce evidence that helps confirm, reject, or refine it.

This distinction connects optimization decisions to the failure-analysis practices established in LLM-07 and the evaluation methodology established in LLM-08. Those modules own the deeper treatment of behavioral diagnosis and experimental interpretation.

## 5. Optimization Is a Trade-Off, Not a Single Metric

Language model optimization involves several dimensions that can interact.

| Dimension | Engineering question |
|---|---|
| Task quality | Does the model meet the application's correctness and reliability requirements? |
| Latency | How long does a request take to complete under defined conditions? |
| Throughput | How much work can the system process in a given period? |
| Memory | Can the model and its execution state fit within available resources? |
| Compute | How much processing is required for training or inference? |
| Cost | What resources and operational effort are required to obtain the desired result? |
| Compatibility | Can the model run correctly with the intended hardware, software, and execution environment? |
| Maintainability | Can the approach be reproduced, evaluated, updated, and supported reliably? |

These dimensions are related, but they are not interchangeable.

### 5.1 Latency and throughput can move differently

Latency measures the time required to complete a request. Throughput measures the amount of work completed over a period of time.

For example, a configuration that processes several requests concurrently may improve total throughput without reducing the latency experienced by an individual request. Under some conditions, increased concurrency can even increase individual request latency because resources are shared.

Consequently, a claim that a configuration is faster is incomplete unless it identifies what was measured, under which workload, and under what execution conditions.

Chapter 06 examines inference-performance trade-offs in greater detail.

### 5.2 Hard constraints and preferred outcomes

A hard constraint is a requirement that must be satisfied. A preferred outcome is something the engineering team would like to improve.

Suppose an application requires:

- A minimum task-quality threshold.
- A maximum memory footprint.
- A maximum response latency.

Within those limits, the team may prefer the lowest-cost configuration.

A configuration that violates a hard requirement should not be considered successful merely because it improves another metric.

This distinction matters when comparing models or adaptation strategies. A technique can be technically effective but unsuitable for a particular application.

### 5.3 There may be no single best configuration

Different configurations may occupy different positions in the quality-resource trade-off space.

One configuration may offer better quality at greater cost. Another may offer lower latency but slightly reduced quality. A third may satisfy a strict memory constraint while requiring more adaptation effort.

The preferred option depends on the workload and the constraints.

Optimization decisions should therefore record both the improvement and the cost incurred to obtain it. Reporting only the best quality score hides important engineering trade-offs.

## 6. Selecting the Relevant Intervention

Intervention selection should follow the diagnosed limitation, not a fixed sequence of techniques.

Use the following decision guide as a starting point:

| Observed limitation | Intervention category worth investigating | Important qualification |
|---|---|---|
| Outputs are inconsistent despite the model having the required capability | Inference-time interventions | First investigate instructions, examples, configuration, and applicable output constraints. |
| Task behavior remains inadequate and simpler interventions are insufficient | Weight adaptation | Establish that the task justifies training effort and that suitable adaptation data is available. |
| A suitable model exceeds the available memory budget | Model compression | Measure capability changes and confirm that the compressed model is compatible with the intended environment. |
| Inference resource consumption or execution time is unacceptable | Inference performance and resource optimization | Identify whether the constraint concerns input processing, generation, memory, workload characteristics, or another factor. |
| The selected model cannot satisfy the task or application requirements | Reconsider the model or system design | Optimization of the current model may not be the right solution; broader model selection belongs to LLM-10. |

This table suggests investigations; it does not prescribe automatic solutions. One limitation may require several investigations, and some interventions can address more than one constraint.

For example, a model that exceeds a memory limit may benefit from compression, a different model, or a different execution configuration. The appropriate choice depends on compatibility, acceptable quality, available resources, and implementation cost.

### 6.1 Compare total engineering cost

The apparent cost of an intervention is not always its total cost.

A configuration change may be inexpensive to implement but require fragile workarounds. Fine-tuning may require an initial investment in data preparation and experimentation but produce more consistent task behavior. Compression may reduce inference costs while introducing compatibility requirements or additional validation work.

A sound decision considers:

- Implementation effort.
- Required data and compute.
- Evaluation and validation effort.
- Operational resource consumption.
- Maintenance and compatibility.
- Consequences if the intervention fails or degrades behavior.

The objective is to select an intervention that can credibly satisfy the requirements at an acceptable total cost, not merely the intervention that is easiest to describe or implement.

## 7. Establish Evidence Before Accepting an Optimization

Optimization decisions require evidence that distinguishes genuine improvement from variation, measurement error, or changes in experimental conditions.

Before testing an intervention, define:

- The workload and evaluation examples.
- The baseline configuration.
- The expected improvement.
- The quality and resource measurements.
- The constraints that cannot be violated.
- The conditions that must remain comparable.
- The limitations of the planned experiment.

A baseline is the reference point against which a proposed change is evaluated. Without one, a result may show that a system performs at a particular level without establishing whether the intervention helped.

The evidence must also match the claim being made. If an experiment measures task accuracy, it does not automatically establish lower production latency. If it measures latency on a small local workload, it does not establish performance under high concurrency.

### 7.1 Define an acceptance rule

An acceptance rule translates application requirements into a decision that can be evaluated.

For example:

> Accept the intervention only if task quality meets the required threshold, resource consumption remains within the defined budget, and the held-out evaluation reveals no unacceptable regression.

The precise thresholds depend on the application. Some tasks may require strict correctness, while others may tolerate a small quality reduction in exchange for substantial resource savings.

If the result does not satisfy the acceptance rule, the appropriate decision may be to reject the intervention, revise it, gather more evidence, or reconsider the original design.

The strength of the conclusion must remain proportional to the evidence.

LLM-08 owns the detailed methodology for evaluation design, controlled comparison, and statistical interpretation. This chapter establishes why those practices are necessary for optimization decisions.

## 8. When Is Optimization Justified?

An intervention is justified when it addresses a meaningful requirement and its expected benefit is sufficient to warrant the added cost, complexity, and risk.

A proposed intervention is more defensible when:

1. The current limitation is observable and relevant.
2. The expected benefit is defined.
3. The intervention plausibly addresses the identified limitation.
4. The required resources and dependencies are available.
5. The evaluation can distinguish useful improvement from regression.
6. The result can be maintained and reproduced sufficiently for the intended use.

Optimization may not be justified when the existing model already satisfies the requirements, when the expected benefit is negligible, or when a simpler system-level change would solve the problem.

It may also be premature when the task, workload, or failure has not been defined clearly enough to support a meaningful experiment.

A mature engineering decision includes the option to do nothing. Avoiding unnecessary adaptation can preserve simplicity, reduce cost, and limit new failure modes.

Chapter 07 develops these considerations into an integrated decision framework.

## 9. Common Engineering Mistakes

### 9.1 Fine-tuning before diagnosing the problem

**Why it fails:** Training changes model behavior, but it does not guarantee that the underlying limitation is addressed.

**Better approach:** Define the failure, form a hypothesis, and investigate suitable alternatives before committing to adaptation.

### 9.2 Optimizing only for quality

**Why it fails:** A quality improvement may come with unacceptable latency, memory, cost, or compatibility consequences.

**Better approach:** Define quality requirements alongside resource constraints and assess the complete result.

### 9.3 Assuming compression is lossless

**Why it fails:** Reduced precision, parameter removal, and knowledge transfer can change model behavior and execution characteristics.

**Better approach:** Measure the quality-resource trade-off on the intended workload and execution environment.

### 9.4 Changing multiple variables simultaneously

**Why it fails:** When results change, the contribution of each modification becomes difficult to attribute.

**Better approach:** Isolate important changes when practical, keep relevant conditions comparable, and record deviations.

### 9.5 Treating a single experiment as universal evidence

**Why it fails:** A result on one task, dataset, or hardware configuration may not generalize to another.

**Better approach:** State the tested conditions, limitations, and scope of the conclusion.

### 9.6 Optimizing before defining success

**Why it fails:** Without predefined requirements, teams can select whichever metric makes a result appear successful.

**Better approach:** Establish the objective, constraints, and comparison method before interpreting results.

## 10. Chapter Summary

Language model optimization is a requirements-driven engineering activity. It begins by identifying a specific limitation and determining which intervention could address it without violating important constraints.

The four categories covered by LLM-09 are:

- Inference-time interventions that change how an existing model is used.
- Weight adaptation that changes model parameters.
- Model compression that reduces representation or computational requirements.
- Inference performance and resource optimization that addresses execution costs and behavior.

These categories involve different mechanisms, benefits, risks, and costs. None is universally best.

The engineer's responsibility is to diagnose the relevant problem, select a defensible intervention, establish a baseline, compare outcomes under appropriate conditions, and make a decision proportional to the available evidence.

## 11. Knowledge Check

Answer these questions before proceeding. The objective is to demonstrate engineering reasoning, not recall terminology.

1. An extraction model produces invalid structured outputs. What evidence would you gather before deciding to fine-tune it? Identify at least two plausible causes and explain how you would distinguish them.
2. A compressed model meets a strict memory limit but produces slightly worse task results. What additional information would you need to determine whether the change is acceptable?
3. A fine-tuned model improves on the examples used during adaptation but performs worse on unseen examples. What does this suggest, and which parts of the adaptation process would you investigate?
4. A team reports that a new configuration is faster than the baseline. What conditions must be comparable before you accept that conclusion? Explain the distinction between latency and throughput in your answer.
5. Describe a scenario in which the best engineering decision is not to optimize the model at all.

Your answers should identify assumptions, relevant constraints, and the evidence needed to support a decision.

## 12. Transition to the Next Chapter

This chapter established the optimization problem, the four intervention categories, and the reasoning needed to select an appropriate direction.

The next chapter examines changes that preserve the existing model weights, including how to assess whether inference-time interventions are sufficient for a task.

[Next: 02 — Inference-Time Interventions and Adaptation Decisions](02-Inference-Time-Interventions-and-Adaptation-Decisions.md)
