# 07 — Optimization Trade-offs and Engineering Decision Framework

## 1. Purpose

Language-model optimization involves choosing among interventions that affect model behavior, resource consumption, or inference performance.

An engineer may reduce memory consumption through quantization, adapt a model to a specialized task, select a smaller model, or change how the application uses the model. Each option addresses a different part of the problem and introduces different costs and risks.

The challenge is not knowing that these techniques exist. It is determining which intervention is appropriate for a particular workload and whether the expected benefit justifies its consequences.

A weak optimization process starts with a familiar technique and searches for a problem it might solve. A stronger process begins with an observed limitation, identifies plausible causes, establishes constraints, and evaluates suitable alternatives.

This chapter develops a reusable engineering decision process.

It covers:

- Diagnosing the problem before selecting an intervention.
- Mapping observed constraints to candidate approaches.
- Comparing adaptation, compression, inference-time interventions, and model selection.
- Evaluating multi-objective trade-offs and implementation complexity.
- Handling uncertainty, reversibility, and risk.
- Establishing evidence for an optimization decision.
- Determining when further optimization is unnecessary.
- Recording and communicating engineering decisions.

The objective is to develop a defensible decision process rather than prescribe one universally best optimization technique.

## 2. The Core Optimization Problem

An optimization is useful only when it improves something that matters to the application without violating its requirements.

Suppose a model satisfies the application's quality requirements but exceeds its memory budget. The primary problem is resource feasibility, not necessarily model behavior.

Now suppose the model fits within memory and responds quickly but consistently produces incorrect outputs for a specialized task. The primary problem may involve model capability, adaptation, or the way the application uses the model.

These problems require different investigations.

### 2.1 Separate the objective from the intervention

An **objective** describes the result the application needs. An **intervention** is a change intended to achieve that result.

| Objective | Candidate intervention |
|---|---|
| Reduce model-weight memory | Evaluate a lower-bit representation or a smaller model. |
| Improve task-specific behavior | Investigate prompting, context, model capability, or adaptation. |
| Reduce initial response delay | Investigate prefill and request-startup costs. |
| Improve token-generation speed | Investigate decode performance and the limiting resource. |
| Reduce total execution memory | Investigate model weights, cached state, temporary allocations, and workload characteristics. |
| Improve task quality within a fixed budget | Compare inference-time interventions, adaptation, and suitable alternative models. |

These are starting hypotheses, not automatic prescriptions. An observed symptom does not necessarily reveal its root cause.

### 2.2 Optimization as a constrained decision

An engineering objective can be represented as:

\[
\text{Choose } a \in \mathcal{A}
\]

subject to:

\[
Q_j(a)\geq Q_{j,\min}
\]

\[
R_i(a)\leq B_i
\]

where:

- \(a\) is a candidate intervention or configuration.
- \(\mathcal{A}\) is the set of candidate approaches.
- \(Q_j(a)\) represents a required quality dimension.
- \(Q_{j,\min}\) is its minimum acceptable level.
- \(R_i(a)\) is the consumption of resource \(i\).
- \(B_i\) is the corresponding resource budget.

Quality may involve multiple requirements rather than one scalar score. Resource constraints may include memory, latency, compute, or storage.

This is a conceptual model, not a claim that every engineering objective can be expressed precisely as a numerical optimization problem.

The central principle is that a candidate must satisfy the application's mandatory requirements before its other benefits are considered.

## 3. Diagnose Before Choosing a Technique

The first engineering task is to understand the observed limitation well enough to select relevant alternatives.

A reported symptom is not necessarily its cause. A request described as "too slow" might be affected by long input processing, sequential output generation, request queueing, memory pressure, or external application work.

### 3.1 Classify the observed problem

<box border radius="lg" padding={3} gap={3}>
  <box gap={1}>
    <title size="md">Behavior or quality limitation</title>
    <text>The model fails task requirements, produces incorrect outputs, or does not follow required constraints.</text>
    <text color="secondary" size="sm">Investigate task definition, instructions, context, model capability, and whether adaptation is justified.</text>
  </box>
  <divider color="subtle" />
  <box gap={1}>
    <title size="md">Memory or storage limitation</title>
    <text>The model or its execution state exceeds an available memory or storage budget.</text>
    <text color="secondary" size="sm">Separate weight storage from KV-cache memory and other execution allocations.</text>
  </box>
  <divider color="subtle" />
  <box gap={1}>
    <title size="md">Latency or throughput limitation</title>
    <text>Requests take too long, tokens arrive slowly, or the system completes insufficient work per unit of time.</text>
    <text color="secondary" size="sm">Identify the relevant metric, workload, and likely performance constraint.</text>
  </box>
  <divider color="subtle" />
  <box gap={1}>
    <title size="md">Feasibility or compatibility limitation</title>
    <text>The current model or representation cannot run within the available hardware, software, or operational constraints.</text>
    <text color="secondary" size="sm">Investigate compatible models and representations before investing in an unsuitable approach.</text>
  </box>
</box>

These categories can overlap. A smaller model may improve memory feasibility but reduce task quality. A quantized model may fit within memory while failing a quality requirement.

Classification is the beginning of the investigation, not its conclusion.

### 3.2 Establish a baseline

Before changing the system, document its current behavior under a defined workload.

Record the information relevant to the problem:

- Model identity and representation.
- Task requirements and relevant quality observations.
- Input and output characteristics.
- Memory consumption.
- Relevant latency and throughput metrics.
- Execution environment and compatibility constraints.
- Known limitations and measurement uncertainty.

Not every investigation needs every metric. Select measurements that help distinguish plausible explanations for the observed problem.

### 3.3 Distinguish facts from hypotheses

Keep these categories explicit:

- **Observed fact:** A measured property of the current system.
- **Hypothesis:** A proposed explanation for that observation.
- **Constraint:** A requirement the candidate must satisfy.
- **Decision:** The selected action based on available evidence.
- **Uncertainty:** Something that remains unresolved.

For example:

- Observed fact: peak memory exceeds the available budget.
- Hypothesis: model weights and cached state jointly contribute to the excess.
- Constraint: the candidate must fit within the budget while preserving required task quality.
- Decision under consideration: compare a compressed representation with a smaller compatible model.
- Uncertainty: the effect of each candidate on task quality and generation speed.

This separation prevents an engineering decision from becoming an unsupported guess.

## 4. Map Diagnosed Problems to Candidate Interventions

Once the problem and constraints are understood, identify plausible interventions. The goal is to compare alternatives rather than commit immediately to the first familiar technique.

### 4.1 Inference-time interventions

Inference-time interventions change how an existing model is used without necessarily changing its learned parameters.

Depending on the problem, they may include changes to prompting, context construction, generation configuration, or other aspects of the inference workflow.

They are worth investigating when the required behavior may be achievable through better-defined instructions, more appropriate context, or a suitable generation configuration.

A prompt change cannot guarantee that a model acquires a capability it fundamentally lacks. Likewise, reducing context can remove information needed for the task.

Detailed intervention choices belong to Chapter 02.

### 4.2 Weight adaptation

Adaptation changes the model's learned behavior to better meet a target task.

It may be appropriate when the baseline model does not satisfy task-specific requirements and simpler interventions or a suitable alternative model do not adequately address the gap.

Adaptation introduces costs and risks, including training compute, data preparation, potential overfitting, behavior changes outside the target task, and additional evaluation effort.

Parameter-efficient methods can reduce the number of trainable parameters, but they do not eliminate the need for suitable data or evaluation.

Chapters 03 and 04 cover adaptation methods, training configuration, and generalization.

### 4.3 Compression and representation changes

Compression changes a model's representation or structure to reduce resource requirements while attempting to preserve sufficient capability.

Candidate approaches include quantization, pruning, distillation, and selecting a smaller model.

These approaches have different mechanisms and trade-offs. Compression is a candidate when model size, execution memory, or computational cost is limiting, but quality and runtime compatibility must still be evaluated.

Chapter 05 covers these mechanisms.

### 4.4 Inference-performance optimization

Inference-performance optimization targets the time and resources consumed by a particular workload.

Candidate interventions depend on the bottleneck:

- Long input processing may justify investigating prompt length and prefill behavior.
- Slow token generation may justify investigating decode performance.
- Excessive memory growth may justify investigating cached state, context length, or representation.
- Poor aggregate throughput may justify investigating concurrency and workload characteristics.

Chapter 06 covers inference-performance and resource reasoning.

### 4.5 Model selection

Sometimes the best optimization is to choose a different model.

A smaller, more suitable, or more compatible model may satisfy the requirements without the cost of adapting or compressing the current model.

Candidates should be compared against actual application requirements rather than selected solely by parameter count, reputation, or general benchmark results.

Broader model-selection methodology belongs to LLM-10.

### 4.6 Candidate screening table

| Candidate approach | Most relevant when | Principal trade-off |
|---|---|---|
| Inference-time intervention | The behavior may be achievable through better use of the existing model | May not overcome capability limitations |
| Weight adaptation | The model needs task-specific behavioral changes | Adds training cost and generalization risk |
| Quantization or other compression | Representation or resource requirements are limiting | May affect quality or runtime performance |
| Smaller-model selection | An alternative model may already satisfy the requirements | May have different capabilities or compatibility constraints |
| Inference-performance changes | A defined workload or execution phase is limiting performance | Benefits depend on the actual bottleneck |
| No change | The current system already meets its requirements | Avoids unnecessary complexity and risk |

This table narrows the search space; it does not replace investigation or controlled comparison.

## 5. Simplicity, Stopping Rules, and Unnecessary Optimization

When several interventions appear plausible, begin with the least complex intervention that has a reasonable chance of satisfying the requirements.

This is a heuristic against unnecessary complexity, not a rule that the simplest technique must always win.

If a model already has the required capability but receives incomplete context, training a new model may be unnecessarily expensive. Conversely, if the model lacks a required capability despite appropriate instructions and context, repeatedly adjusting prompts may not be an effective long-term solution.

### 5.1 A reasonable escalation heuristic

1. Clarify the task and acceptance requirements.
2. Verify that the model receives the necessary information and instructions.
3. Inspect the relevant inference configuration.
4. Measure the resource or performance limitation.
5. Compare suitable existing models or representations.
6. Consider adaptation if the behavioral gap remains.
7. Consider more involved approaches only when evidence justifies their additional cost.

This sequence is not mandatory. Known hardware incompatibility, strict resource limits, or an established capability gap may justify starting elsewhere.

### 5.2 When to stop

Stop optimizing when all of the following conditions hold:

- The candidate satisfies every mandatory requirement.
- It provides sufficient benefit for the stated objective.
- Remaining uncertainty is understood and acceptable.
- No unresolved question justifies the cost and risk of further investigation.

This does not mean that further improvement is impossible. It means the expected value of additional work is no longer sufficient to justify its cost.

If the current system already satisfies its requirements, making no change can be the strongest engineering decision.

## 6. Multi-Objective Trade-offs

Optimization decisions rarely have one objective. Applications may need to satisfy quality, latency, memory, throughput, compatibility, and implementation-complexity requirements simultaneously.

Improving one dimension can worsen another.

### 6.1 Quality versus resource consumption

A compressed model may use less memory but produce lower-quality outputs. A smaller model may execute with fewer resources but fail tasks that require capabilities of a larger model.

The relevant question is whether the candidate remains within the application's acceptable quality limits.

A small average speed improvement does not justify a candidate that frequently fails a critical requirement.

### 6.2 Latency versus throughput

A configuration optimized for one request may differ from one optimized for aggregate work.

Higher throughput can come with higher individual-request latency. Prioritizing immediate responsiveness may reduce the amount of work completed per unit of time.

The appropriate trade-off depends on the workload and user expectations.

### 6.3 Memory versus concurrency

Reducing model-weight storage can create more room for cached state or other allocations, but total execution memory still depends on the workload.

Increasing concurrency can improve resource utilization while increasing KV-cache memory and competition for compute and memory bandwidth.

A configuration that works for one request is not necessarily suitable for many simultaneous long-context requests.

### 6.4 Efficiency versus compatibility

A representation with attractive theoretical memory savings may not be supported efficiently by the intended runtime.

A candidate requiring unsupported operations, substantial conversion overhead, or an unsuitable execution path may fail to provide the intended benefit.

Compatibility is therefore a feasibility requirement rather than an optional refinement.

### 6.5 Complexity versus benefit

A sophisticated optimization may improve one metric but introduce additional training or conversion workflows, configuration choices, failure modes, validation requirements, and maintenance effort.

The relevant comparison is between the total benefit and the total cost of adopting and maintaining the candidate—not merely its best benchmark result.

## 7. Feasibility Before Preference Ranking

Before ranking candidates by performance, determine whether they can satisfy the mandatory requirements.

This avoids spending effort optimizing a candidate that is fundamentally unsuitable.

### 7.1 Hard constraints and preferences

A **hard constraint** is a condition the candidate must satisfy. Examples include:

- The model must run on the available hardware.
- Peak memory must remain within a defined budget.
- The model must meet a minimum task-quality requirement.
- The representation must be supported by the intended runtime.

A **preference** is a desirable property that can be traded against another objective. Examples include lower average latency, higher throughput, smaller artifact size, or lower adaptation effort.

A candidate that violates a hard constraint should not win merely because it performs well on preferences.

### 7.2 The feasible candidate set

Let \(\mathcal{A}\) be the set of candidate interventions. The feasible set is:

\[
\mathcal{F}
=
\{a\in\mathcal{A}:
a\text{ satisfies all mandatory constraints}\}
\]

Only candidates in \(\mathcal{F}\) should proceed to the final trade-off comparison.

This is a conceptual model. Constraints may be qualitative, quantitative, or dependent on the intended operating conditions.

### 7.3 Avoid false precision

Not every engineering objective has a defensible numerical weight.

Latency and memory may be measured precisely, while task correctness involves several distinct acceptance conditions. Do not create a weighted score merely because it makes a decision table look quantitative.

Use explicit acceptance criteria where possible, and document assumptions when judgment is unavoidable.

A clear decision with documented uncertainty is better than a precise-looking score built on arbitrary weights.

## 8. Evidence Quality and Interpretation

An optimization decision should be supported by evidence relevant to the problem being solved.

A change intended to improve task behavior requires evidence about task behavior. A change intended to reduce memory requires memory measurements under a relevant workload. A change intended to improve token-generation speed requires a metric that captures that behavior.

### 8.1 Match evidence to the objective

| Intended benefit | Relevant evidence |
|---|---|
| Improve task behavior | Results on representative task cases and required constraints |
| Reduce model-weight storage | Actual model-artifact size and representation details |
| Reduce execution memory | Measured memory under the intended workload, including cached state |
| Improve initial responsiveness | TTFT measured with a defined boundary |
| Improve token-generation speed | Inter-token latency or a clearly defined decode-throughput metric |
| Improve aggregate throughput | Completed requests or tokens per unit of time under a defined workload |
| Improve compatibility | Successful loading and execution in the intended environment |
| Reduce overall complexity | Comparison of dependencies, workflows, configuration burden, and maintenance requirements |

A metric should not substitute for an objective it does not measure. A smaller artifact demonstrates a storage reduction but does not establish better task quality or faster generation.

### 8.2 Establish a meaningful comparison

Compare candidates with a defined reference under relevant and comparable conditions.

Where practical, hold constant:

- Task requirements and evaluation inputs.
- Generation configuration.
- Measurement boundaries.
- Hardware and execution conditions.
- Other variables that could affect the result.

When conditions cannot remain constant, document the differences and explain how they affect interpretation.

Formal evaluation and benchmarking methodology belongs to LLM-08. This chapter focuses on ensuring that the evidence is relevant to the optimization decision.

### 8.3 Interpret negative and inconclusive results

An intervention can fail to improve the intended metric and still provide useful information.

Examples include:

- Quantization reduces artifact size but does not improve measured latency.
- A smaller model improves throughput but fails a required task-quality constraint.
- Adaptation improves the target task but introduces unacceptable regressions elsewhere.
- A configuration change improves TTFT but leaves total request latency nearly unchanged.

These results help identify trade-offs and eliminate unsuitable candidates.

An **inconclusive** result means the available evidence is insufficient to determine whether the candidate meets the requirements. It should not be treated as success.

Record what changed, what did not, and what additional evidence would resolve the uncertainty.

## 9. Reversibility, Uncertainty, and Risk

Two interventions that offer similar benefits may differ in how difficult they are to validate, reverse, or maintain.

These characteristics should influence the decision.

### 9.1 Reversibility

A reversible change can be removed or replaced with relatively little effort. Examples include testing a different generation configuration or evaluating an alternative existing model.

Other changes may require additional work, such as producing new adaptation artifacts or establishing a separate training workflow.

Reversibility matters when evidence is limited and experimentation is still underway, although it is not the only selection criterion.

### 9.2 Uncertainty

An intervention may have an uncertain effect on quality, memory, latency, or compatibility.

Useful questions include:

- Which outcomes are supported by direct measurements?
- Which outcomes are inferred from theoretical expectations?
- Which workload conditions have not been tested?
- What evidence would change the decision?
- How costly would an incorrect decision be?

The greater the uncertainty and consequence of failure, the stronger the justification needed before adopting the intervention.

### 9.3 Risk proportional to consequence

A small experimental quality regression may be acceptable in a disposable development environment but unacceptable in an application with strict correctness requirements.

Likewise, an uncertain latency improvement may be tolerable in an offline batch workload but unsuitable for an interactive application with a strict response-time requirement.

The appropriate level of validation depends on the consequence of failure and the requirements of the intended use.

Production rollout, rollback operations, and runtime monitoring belong to Production AI Engineering.

## 10. End-to-End Optimization Decision Workflow

This workflow combines diagnosis, candidate selection, feasibility checks, and evidence-based decision making.

### Step 1 — State the problem

Describe the observed limitation in concrete terms.

Avoid statements such as "the model needs optimization" without specifying what is wrong.

Prefer:

"The model exceeds the memory budget for requests containing long contexts while preserving acceptable behavior on shorter requests."

Identify the relevant workload and affected requirement.

### Step 2 — Define success

Specify what the candidate must achieve:

- Mandatory quality requirements.
- Relevant resource budgets.
- Compatibility requirements.
- The primary metric to improve.
- Acceptable trade-offs.

Do not define success solely as a percentage improvement without stating the minimum acceptable outcome.

### Step 3 — Establish the baseline

Record the current model, workload, relevant measurements, and known limitations. The baseline must support a meaningful comparison without confusing the effects of unrelated changes.

### Step 4 — Form a causal hypothesis

Explain why the observed limitation may occur.

For example:

"The current model's weight representation contributes to the memory constraint, so a compatible quantized representation may allow the model to fit within the budget."

A useful hypothesis identifies a mechanism and a measurable expected result. Acknowledge alternative explanations when the cause is uncertain.

### Step 5 — Generate candidate interventions

Identify more than one plausible approach where alternatives exist.

For a memory constraint, candidates might include a different representation, a smaller model, or a change to unnecessary context retention.

For a task-quality gap, candidates might include a better-defined inference workflow, an alternative model, or adaptation.

Do not generate alternatives merely to increase the number of options.

### Step 6 — Filter by feasibility

Eliminate candidates that cannot satisfy mandatory requirements or are incompatible with the intended environment.

Where feasibility is uncertain, identify the smallest useful experiment needed to resolve that uncertainty.

### Step 7 — Compare costs and benefits

For each remaining candidate, consider:

- Expected quality impact.
- Expected resource impact.
- Implementation effort.
- Additional complexity.
- Compatibility.
- Reversibility.
- Uncertainty.
- Evidence required for acceptance.

Separate measured results from expectations.

### Step 8 — Run a controlled experiment

Change the selected variable or explicitly design an experiment for multiple variables.

Use a defined workload, comparable conditions, and relevant metrics. Record unexpected effects as well as intended benefits.

The experiment should be large enough to answer the decision question, but no larger than necessary.

### Step 9 — Evaluate the result

Choose one of four outcomes:

- **Accept:** The candidate meets requirements and provides a justified improvement.
- **Revise:** The evidence suggests promise, but a specific unresolved issue remains.
- **Reject:** The candidate violates a requirement or fails to provide sufficient benefit.
- **Inconclusive:** The experiment does not provide enough evidence to make a reliable decision.

### Step 10 — Record the decision and stopping rationale

Document the selected approach, alternatives considered, evidence, assumptions, remaining risks, and reason for the outcome.

If the candidate meets the requirements and further investigation has insufficient expected value, stop. If the result is inconclusive, identify the smallest additional investigation that would resolve the uncertainty.

The decision is complete when the evidence and rationale justify the outcome—not merely when an experiment has finished.

## 11. Worked Engineering Scenarios

These hypothetical scenarios illustrate how the framework changes according to the problem.

### Scenario A — Model exceeds the memory budget

**Observed problem:** The model's weights and execution state exceed the available memory under the target workload.

**Initial investigation:**

- Measure model-weight storage.
- Measure peak execution memory under relevant context lengths.
- Identify whether cached state and temporary allocations contribute significantly.
- Confirm hardware and runtime constraints.

**Candidate interventions:**

- Evaluate a compatible quantized representation.
- Evaluate a smaller model.
- Investigate whether the workload retains unnecessary context.
- Evaluate an appropriate supported cache configuration if applicable.

**Decision principle:** Choose a candidate that meets the memory budget while preserving required task behavior and runtime compatibility.

Reducing weight storage alone may not resolve the entire memory problem.

### Scenario B — Model is fast enough but fails a specialized task

**Observed problem:** Latency and memory meet the requirements, but the model repeatedly fails a specialized task.

**Initial investigation:**

- Clarify the exact task requirements.
- Inspect the instructions and context provided to the model.
- Determine whether failures arise from missing information, poor task specification, or a capability limitation.
- Establish representative cases that distinguish these possibilities.

**Candidate interventions:**

- Improve inference-time instructions or context.
- Evaluate an alternative model with more suitable capabilities.
- Consider adaptation if a persistent task-specific gap remains.

**Decision principle:** Prefer the least complex approach that satisfies the task requirements. Do not introduce training merely because the model produces incorrect answers.

### Scenario C — Initial response is acceptable but token generation is slow

**Observed problem:** The first token appears quickly, but subsequent tokens arrive too slowly for the application.

**Initial investigation:**

- Measure inter-token latency under a defined workload.
- Record model representation, output length, and context length.
- Investigate likely compute or memory limitations.
- Check whether the application requires the current output length.

**Candidate interventions:**

- Evaluate a suitable smaller or compressed model.
- Investigate the relevant execution and generation configuration.
- Reconsider unnecessarily long output requirements.

**Decision principle:** Select an intervention that improves the measured decode-related objective without violating task-quality or compatibility requirements.

Improving TTFT alone would not address the stated problem.

### Scenario D — A compressed model is smaller but performs worse

**Observed problem:** Quantization reduces the model's artifact size, but task quality falls below the required threshold.

**Initial investigation:**

- Verify that the quality comparison uses the same relevant task conditions.
- Identify failure types introduced or worsened by the candidate.
- Determine whether another representation or a different model remains feasible.

**Candidate interventions:**

- Evaluate another supported quantization configuration.
- Compare an alternative smaller model.
- Consider whether a different adaptation or compression strategy is justified.

**Decision principle:** Reject the candidate if it violates a mandatory quality requirement, even when the storage reduction is substantial.

A successful compression measurement is not sufficient evidence of an acceptable model.

### Scenario E — The current model already satisfies the requirements

**Observed problem:** The team proposes optimization, but the current model meets the defined quality, latency, memory, and compatibility requirements.

**Initial investigation:**

- Confirm that the requirements reflect the actual application needs.
- Check whether there is a measurable cost or risk that justifies a change.
- Determine whether the proposed intervention solves a real problem or merely improves an isolated metric.

**Candidate interventions:**

- Retain the current model.
- Run an exploratory experiment only if it answers a meaningful future decision question.

**Decision principle:** Do not optimize merely because another technique is available.

Avoiding an unnecessary change can be the best engineering decision.

## 12. Common Decision-Making Mistakes

### 12.1 Treating an observed symptom as a confirmed root cause

**Why it fails:** The selected intervention may not address the actual limitation.

**Better approach:** Separate observations from hypotheses and use evidence to test plausible causes.

### 12.2 Optimizing a proxy that does not represent the application objective

**Why it fails:** A smaller artifact or faster isolated benchmark may not improve the outcome that matters to the application.

**Better approach:** Connect each metric to an explicit requirement.

### 12.3 Ranking candidates before checking feasibility

**Why it fails:** A candidate may perform well on several metrics while violating a mandatory constraint.

**Better approach:** Filter infeasible candidates before comparing preferences.

### 12.4 Treating theoretical savings as measured benefits

**Why it fails:** A reduction in parameter count or bit width does not guarantee a proportional improvement in execution memory or latency.

**Better approach:** Measure the candidate under the intended workload.

### 12.5 Treating an inconclusive experiment as success

**Why it fails:** Insufficient evidence does not establish that a candidate meets the requirements.

**Better approach:** Record the result as inconclusive and identify the smallest additional investigation needed.

### 12.6 Letting sunk effort determine the outcome

**Why it fails:** Past implementation effort does not make an unsuitable candidate more effective.

**Better approach:** Decide based on current evidence, requirements, and the expected value of further work.

## 13. Optimization Decision Record

Use this concise structure to document a meaningful optimization decision. It should capture the reasoning, not reproduce the entire investigation.

### 13.1 Problem and objective

- **Observed problem:** What is failing or costing too much?
- **Workload:** Under what conditions does it occur?
- **Primary objective:** What must improve?
- **Acceptance requirements:** What conditions must remain satisfied?

### 13.2 Baseline and constraints

- **Reference model and representation:** What is the current candidate?
- **Relevant measurements:** What evidence describes the baseline?
- **Hard constraints:** Which quality, resource, and compatibility requirements are mandatory?
- **Uncertainty:** What is not yet known?

### 13.3 Alternatives and hypothesis

- **Candidate interventions:** Which plausible alternatives were considered?
- **Causal hypothesis:** Why is the selected intervention expected to help?
- **Expected benefit:** What measurable change is anticipated?
- **Expected cost:** What additional complexity or risk may be introduced?

### 13.4 Evidence and decision

- **Experiment:** What was changed and under what conditions?
- **Results:** Which metrics improved or regressed?
- **Requirement check:** Did the candidate satisfy every mandatory constraint?
- **Decision:** Accept, revise, reject, or inconclusive.
- **Rationale:** Why is the outcome justified?
- **Remaining limitations:** What assumptions or unresolved risks remain?

A decision record does not need to be long. It needs to make the reasoning and evidence explicit enough for another engineer to understand the choice.

## 14. Final Acceptance Checklist

Before finalizing an optimization decision, verify these critical gates:

- [ ] The observed problem and relevant workload are clearly defined.
- [ ] The primary objective and mandatory quality, resource, and compatibility requirements are explicit.
- [ ] The selected intervention addresses a plausible cause rather than merely the symptom.
- [ ] Relevant alternatives were considered, including the option of making no change.
- [ ] The candidate was compared against a meaningful baseline.
- [ ] Evidence measures the intended objective under sufficiently comparable conditions.
- [ ] Regressions, uncertainty, and additional complexity are documented.
- [ ] The decision is justified as accept, revise, reject, or inconclusive.
- [ ] Further investigation has a clear purpose, or a defensible stopping decision has been made.

The decision is ready when these gates are satisfied to the level justified by the consequences of failure.

## 15. Knowledge Check

Answer these questions before proceeding.

1. A team wants to fine-tune a model because it produces incorrect answers. Explain why this observation alone does not establish that fine-tuning is the appropriate intervention.

2. A quantized model fits within the memory budget but violates a task-quality requirement. Explain how the feasibility-first principle affects the decision, even if memory usage improves substantially.

3. Two candidates satisfy all mandatory constraints. One has slightly better latency but introduces additional training and maintenance complexity. Explain how you would compare them without inventing arbitrary weights for every objective.

4. A team reports that inference has improved because the model artifact is 50% smaller. Identify what this observation establishes and what additional evidence is needed before claiming an inference-performance improvement.

5. A smaller model performs adequately on a general benchmark but fails an important application-specific requirement. Explain why the benchmark result should not determine the final selection.

6. You have three plausible interventions, but the root cause of the observed problem is uncertain. Describe how you would select the next experiment while minimizing unnecessary implementation work.

7. An experiment shows no meaningful improvement in the target metric, but the team has already invested substantial effort. Explain why the sunk effort should not determine whether the intervention is accepted.

8. Describe a situation in which making no change is the strongest engineering decision. Identify the evidence and constraints that would support that decision.

Strong answers should distinguish symptoms from causes, hard constraints from preferences, and measured benefits from expected benefits.

## 16. Chapter Summary

Optimization is an engineering decision problem involving objectives, constraints, candidate interventions, and evidence.

The central principles are:

- Diagnose the observed problem before choosing a technique.
- Separate task-quality problems from memory, performance, and compatibility problems.
- Select candidates that address the actual limitation.
- Prefer a sufficiently simple intervention when it can satisfy the requirements.
- Treat quality, memory, latency, throughput, compatibility, and complexity as potentially competing objectives.
- Eliminate infeasible candidates before comparing preferences.
- Match measurements to the objective being optimized.
- Distinguish theoretical expectations from observed results.
- Treat negative and inconclusive experiments as useful evidence.
- Document the decision so another engineer can understand and evaluate the reasoning.
- Stop when the requirements are satisfied and further investigation is not justified by its expected value.

There is no universally best optimization technique. The appropriate choice depends on the task, workload, constraints, available alternatives, and evidence.

A strong engineer can explain not only what was changed, but also why that intervention was selected over alternatives and what evidence justifies the decision.

## 17. Transition to the Next Chapter

Proceed to:

[08 — Controlled Adaptation Experiment and Practical Lab](08-Controlled-Adaptation-Experiment-and-Practical-Lab.md)

The practical lab should apply the reasoning developed across LLM-09 to a bounded adaptation experiment. It should establish a baseline, define success criteria, select a justified adaptation approach, evaluate held-out examples, compare relevant resource costs, and interpret the result—including a negative result—without claiming more than the evidence supports.
