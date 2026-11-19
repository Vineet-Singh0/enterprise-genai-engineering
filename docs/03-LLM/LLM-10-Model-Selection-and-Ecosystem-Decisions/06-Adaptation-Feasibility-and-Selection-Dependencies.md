# Adaptation Feasibility and Selection Dependencies

## 1. Learning Objectives

By the end of this chapter, you should be able to:

- Determine when a model's current capabilities are sufficient and when adaptation may be necessary.
- Distinguish model-selection problems from prompting, context, retrieval, integration, and adaptation problems.
- Evaluate adaptation feasibility across technical, data, operational, economic, and organizational constraints.
- Identify dependencies that make a model a viable or non-viable selection.
- Compare candidates based on current capabilities and realistic post-adaptation potential.
- Design evidence-driven adaptation feasibility experiments without assuming that adaptation will improve outcomes.
- Account for regression risk, evaluation uncertainty, and lifecycle dependencies in selection decisions.
- Document adaptation assumptions, prerequisites, uncertainties, and decision gates.

## 2. Prerequisites

This chapter builds on:

- Requirements and workload characterization.
- Model capability fit and candidate shortlisting.
- Evaluation evidence for model selection.
- Cost, latency, and total cost of ownership.
- Hosted APIs, open weights, and ecosystem fit.

Relevant neighboring chapters:

- **LLM-08 — Model Evaluation and Benchmarking:** Evaluation design, metrics, experimental controls, and interpretation of evidence.
- **LLM-09 — Model Adaptation and Optimization:** Adaptation methods, compression, quantization, and optimization techniques.
- **Production AI Engineering:** Serving, deployment, scaling, reliability, and operational management.
- **Enterprise AI Systems:** Governance, security, compliance, and organizational risk.

Repository note: Verify relative links against the actual repository structure before merging.

## 3. The Engineering Problem

A candidate model may be unsuitable in its current configuration but potentially viable after a change.

For example, a model may:

- Produce inconsistent structured output.
- Lack sufficient task-specific accuracy.
- Fail to follow domain terminology reliably.
- Perform poorly on specialized classification or extraction tasks.
- Exceed the acceptable latency or cost envelope.
- Be unavailable in a required deployment environment.

These problems do not all have the same cause, and they do not all justify adapting the model.

A structured-output failure might be addressed through constrained decoding or output validation. A knowledge-retrieval problem might require better retrieval and grounding rather than parameter updates. A domain-specific behavior problem might justify adaptation if simpler interventions are insufficient.

The selection problem is therefore not merely:

**Which model performs best today?**

It is:

**Which candidate can satisfy the requirements through a feasible combination of model choice, configuration, surrounding system design, and—if justified—adaptation?**

An adaptation strategy introduces dependencies. The candidate is no longer evaluated only as an available model; it is evaluated as part of a proposed engineering solution.

## 4. A Decision Model for Adaptation

Treat adaptation as one possible intervention among several.

A useful conceptual model is:

\[
\text{Outcome} =
f(\text{model},\text{configuration},\text{context},
\text{system design},\text{adaptation})
\]

This is a reasoning model, not a claim that the variables are independent or that the function is directly measurable.

The important implication is that poor results cannot automatically be attributed to the model's parameters.

### 4.1 Diagnose before adapting

Before selecting an adaptation strategy, identify the observed failure and the most plausible cause.

| Observed problem | Potential intervention to investigate |
|---|---|
| Instructions are ambiguous or inconsistent | Improve prompt structure and instructions |
| Required information is missing from the input | Improve context construction or retrieval |
| Output format is unreliable | Evaluate structured output constraints, validation, or suitable model capabilities |
| Domain-specific behavior is inconsistent despite adequate context | Investigate whether adaptation could improve behavior |
| Model lacks a required capability or sufficient capacity | Evaluate alternative models before assuming adaptation can close the gap |
| Inference exceeds latency or cost limits | Compare model alternatives and inference optimizations |
| Candidate cannot be deployed in the required environment | Reconsider access method, deployment options, or candidate eligibility |
| Outputs violate mandatory safety or policy requirements | Investigate the failure, applicable controls, and whether the candidate can satisfy the requirement |

These are starting hypotheses, not guaranteed solutions. A single observed failure can have multiple causes.

### 4.2 Separate intervention types

| Intervention | Primary purpose | Key selection question |
|---|---|---|
| Prompt or configuration change | Change how the existing model is instructed or invoked | Can the requirement be met without modifying model parameters? |
| Context or retrieval change | Supply relevant information to the model | Is the failure caused by missing or poorly represented information? |
| Application-layer control | Enforce formats, validate results, or handle failures | Can the system reliably enforce the requirement outside the model? |
| Model substitution | Select a model with more suitable existing capabilities | Is a better-fitting candidate available? |
| Model adaptation | Change model behavior through an adaptation process | Is the expected incremental improvement worth the additional dependencies? |
| Inference optimization | Improve resource use, latency, or cost | Is the bottleneck in execution rather than task capability? |

The categories can overlap. An adapted model may still need retrieval, validation, and optimized inference.

The objective is not to avoid adaptation. It is to avoid paying for adaptation when a simpler intervention can satisfy the requirement more reliably.

## 5. Establish the Baseline Before Estimating Adaptation Value

An adaptation proposal needs a credible baseline. Without one, the team cannot determine whether the intervention produces a meaningful improvement or whether the existing solution was already adequate.

A baseline should record:

- The exact candidate model and version.
- The access method and deployment configuration.
- The task definition and representative evaluation data.
- The prompt, context, and other relevant inputs.
- The evaluation metrics and acceptance thresholds.
- Failure categories and their observed frequency.
- Latency, resource consumption, and cost under representative conditions.
- Relevant safety, privacy, and operational constraints.
- Existing capabilities or critical cases that must not regress.

The baseline must reflect the intended workload. A generic benchmark may provide useful screening evidence, but it does not necessarily establish performance on the organization's actual task.

### 5.1 Identify the actual gap

A useful gap statement has three parts:

1. **Requirement:** What must the system achieve?
2. **Observed result:** What does the current candidate achieve under defined conditions?
3. **Gap:** What remains unsatisfied?

Example:

- Requirement: At least 95% valid structured outputs, with zero failures in designated critical categories.
- Observed result: 91% valid outputs, with failures in two critical categories.
- Gap: The candidate misses the validity threshold and does not satisfy the critical-category constraint.

The team should not conclude that adaptation is necessary until it investigates whether the gap comes from model behavior, input construction, decoding, parsing, evaluation defects, or another part of the system.

A useful diagnosis distinguishes established facts from unresolved hypotheses.

## 6. Adaptation Feasibility Dimensions

Adaptation feasibility is multidimensional. A candidate that is technically adaptable may still be impractical or prohibited in the intended environment.

### 6.1 Technical feasibility

Determine whether the proposed intervention is technically possible and whether the expected improvement is plausible.

Questions include:

- Does the access method expose the controls required by the proposed adaptation?
- Are model weights or other required artifacts available under the applicable terms?
- Does the chosen adaptation method support the candidate's architecture?
- Is the observed gap plausibly addressable by the proposed method?
- Are the required inference runtime and deployment environment compatible?
- Can the team evaluate the adapted model under the actual workload?

An API-only model may support prompting or provider-exposed configuration features without allowing the organization to update its underlying parameters. An open-weight model may provide more control, but compatibility and practical feasibility still depend on the architecture, tooling, and available resources.

Do not assume that every open-weight model supports every adaptation method.

### 6.2 Data feasibility

Some adaptation approaches require suitable training examples, while others may require different forms of data or feedback.

Assess:

- Whether representative examples exist.
- Whether the examples reflect real production inputs and expected outputs.
- Whether labels or reference outputs are reliable.
- Whether data volume and coverage are sufficient for the proposed experiment.
- Whether rare but critical cases are represented.
- Whether data can legally and safely be used for the intended purpose.
- Whether sensitive information requires additional handling or exclusion.
- Whether training, validation, and test data can be separated appropriately.

Data quantity alone is not enough. A large dataset containing systematic labeling errors or failing to represent production cases can produce misleading results.

The data plan should identify available evidence, collection requirements, and limitations that could invalidate the experiment.

### 6.3 Compute and infrastructure feasibility

Determine whether the organization can run the proposed workflow within its infrastructure constraints.

Potential dependencies include:

- Accelerator availability and memory capacity.
- CPU, RAM, storage, and networking requirements.
- Training or adaptation duration.
- Checkpoint storage and artifact management.
- Compatibility with the target inference runtime.
- Capacity for evaluation, regression testing, and rollback.
- Access to infrastructure when experiments need to run.

The resource estimate should cover the complete workflow, not only the parameter-update step. Data preparation, failed experiments, evaluation, artifact storage, and repeated runs can materially affect feasibility.

### 6.4 Operational feasibility

A successful experiment is not yet a production-ready solution.

Determine whether the team can:

- Version the base model, adaptation artifacts, and configuration.
- Reproduce the selected experiment sufficiently for its intended use.
- Evaluate changes before release.
- Detect performance regressions after deployment.
- Roll back to a known-good model.
- Re-run evaluation when dependencies or workload characteristics change.
- Maintain the solution when the original developer is unavailable.

An adaptation that depends on undocumented manual steps creates an operational liability even if its measured quality is strong.

### 6.5 Economic feasibility

Compare expected benefits with the full incremental cost.

Relevant costs can include:

- Data acquisition, cleaning, and labeling.
- Experiment design and engineering effort.
- Compute consumed by successful and unsuccessful experiments.
- Evaluation and regression testing.
- Artifact storage and distribution.
- Serving infrastructure and ongoing inference.
- Maintenance, monitoring, and future re-adaptation.
- Opportunity cost and time to production.

Economic feasibility must use a common workload and comparison period. Comparing a one-time adaptation experiment with a single inference request produces an incomplete result.

Use the cost and TCO principles established in the preceding chapter. Do not count the same infrastructure or labor expense twice when constructing the adaptation business case.

### 6.6 Governance and organizational feasibility

A technically and economically attractive intervention may still be unusable.

Assess whether:

- The model's license permits the proposed use and modification.
- The intended data use is permitted.
- The organization can satisfy applicable privacy, security, and compliance requirements.
- Required approvals can be obtained.
- The resulting artifacts can be stored, accessed, and deployed appropriately.
- Ownership and maintenance responsibilities are clear.

These are not merely optimization criteria. A confirmed violation of a mandatory requirement can make a candidate ineligible.

Where the evidence is incomplete, record eligibility as unconfirmed rather than assuming approval.

## 7. Adaptation Dependencies and Their Effect on Selection

An adaptation proposal introduces dependencies that must be resolved before the candidate can be considered production-feasible.

### 7.1 Dependency categories

| Dependency | Example | Selection consequence |
|---|---|---|
| Model access | Required parameters are unavailable through the selected API | The proposed parameter-update adaptation is not feasible through that access method |
| Architecture compatibility | Required tooling does not support the candidate architecture | Additional engineering may be needed, or the method or candidate may need to change |
| Training data | Representative labeled examples are unavailable | Expected benefit and experiment feasibility remain uncertain |
| Compute | Required memory or accelerator capacity is unavailable | Experiment cost, duration, or feasibility may be unacceptable |
| Evaluation | No reliable task-specific test set exists | Improvement cannot be established confidently |
| Deployment | Adapted artifacts cannot run in the target environment | The candidate may fail a mandatory deployment constraint |
| Licensing and data rights | Intended adaptation or use is not permitted | The candidate may be ineligible |
| Operational ownership | No team can maintain and re-evaluate the adapted artifact | Long-term suitability is reduced or unconfirmed |
| Schedule | Adaptation and validation cannot finish before the delivery deadline | The candidate may not be viable for the current release |

Dependencies should be explicit. Phrases such as "fine-tuning should be possible" are not sufficient evidence for a selection decision.

### 7.2 Distinguish blockers from uncertainties

Classify each important dependency as one of the following:

- **Confirmed feasible:** Supporting evidence establishes that the dependency is satisfied under the intended conditions.
- **Confirmed blocker:** Evidence establishes that a mandatory requirement cannot currently be met.
- **Unconfirmed:** Evidence is insufficient to determine feasibility.
- **Conditionally feasible:** The dependency can be satisfied if a specific action, resource, approval, or condition is fulfilled.

For example, lack of access to the required model parameters is a confirmed blocker for a proposed parameter-update workflow using that access method. It is not necessarily a blocker for other approaches, such as prompt optimization or changing candidates.

Likewise, unavailable training data is not always proof that adaptation is impossible. It may mean that data collection is a prerequisite and feasibility remains unconfirmed until the prerequisite is addressed.

### 7.3 Model selection as a dependency graph

An adaptation-based candidate can be represented as a dependency chain:

```text
Mandatory requirements
        |
        v
Candidate model and access method
        |
        v
Adaptation method is compatible
        |
        v
Data and permissions are available
        |
        v
Compute and experiment are feasible
        |
        v
Evaluation demonstrates acceptable results
        |
        v
Deployment and operations are viable
        |
        v
Candidate can be selected
```

This is a simplified dependency chain. In practice, evaluation can reveal a need to revisit the model, data, or method, creating an iterative process.

The important engineering principle is that downstream benefits depend on upstream assumptions. A projected improvement is not established merely because a model can technically be adapted.

## 8. Compare Current Capability with Adaptation Potential

Model selection should distinguish two claims:

1. The candidate satisfies the requirements in its current configuration.
2. The candidate may satisfy the requirements after a proposed intervention.

The first claim requires evidence about the current solution. The second requires evidence supporting the intervention's feasibility and expected outcome.

Do not treat them as equivalent.

### 8.1 A two-stage evaluation

**Stage A — Current-state assessment**

Evaluate the candidate under the defined baseline conditions. Record its eligibility, capability evidence, operational characteristics, and unresolved gaps.

**Stage B — Adaptation-path assessment**

For candidates with meaningful gaps, assess whether a specific intervention is feasible, what it depends on, what it is expected to improve, and how that improvement will be validated.

A candidate can be eligible under mandatory constraints while its task capability remains uncertain. Conversely, strong task performance does not make a candidate eligible if it violates a mandatory licensing or deployment requirement.

Keep eligibility, capability, and adaptation feasibility as separate dimensions.

### 8.2 Compare complete solution paths

| Dimension | Candidate A: current model | Candidate B: adapted model |
|---|---|---|
| Current task performance | Measured baseline | Measured baseline before adaptation |
| Expected improvement | Not applicable to the current baseline | Hypothesis requiring experimental validation |
| Mandatory constraints | Assessed against available evidence | Assessed against the complete proposed solution |
| Additional prerequisites | Existing integration and runtime dependencies | Data, adaptation tooling, compute, evaluation, and artifact dependencies as applicable |
| Time to usable result | Based on current integration and validation work | Includes experiment, evaluation, and deployment preparation |
| Cost | Current solution TCO | Adaptation and lifecycle costs plus serving and maintenance |
| Uncertainty | Remaining uncertainty about current behavior | Uncertainty about both baseline and intervention outcome |
| Regression risk | Existing behavior must be characterized | Target-task gains must be weighed against possible degradation elsewhere |
| Fallback | Alternative candidate or system behavior | Baseline model or another validated fallback, if available |

This comparison avoids a common mistake: comparing a measured result from one candidate with an optimistic projection for another.

Where adaptation has not been tested, label its performance and cost estimates as estimates. Do not represent them as established results.

## 9. Design an Adaptation Feasibility Experiment

The purpose of a feasibility experiment is to reduce decision-relevant uncertainty before the organization commits to a larger adaptation effort.

It should be small enough to constrain cost and scope, but representative enough to produce useful evidence.

### 9.1 Define the hypothesis

State the proposed change, the target behavior, and the expected result.

Example:

> On the defined domain-specific extraction workload, the proposed adaptation is expected to improve valid field extraction from the current baseline to the required acceptance threshold without introducing critical-category failures, unacceptable regressions, or violations of latency and cost constraints.

This is a hypothesis, not a conclusion.

### 9.2 Define the comparison

The experiment should specify:

- Baseline candidate and configuration.
- Proposed adaptation and its configuration.
- A simpler credible intervention as a comparator, where practical.
- Representative evaluation dataset.
- Primary quality metric and acceptance threshold.
- Critical failure categories and mandatory limits.
- Protected capabilities or critical cases that must not regress.
- Latency and cost constraints, where applicable.
- Data splits and leakage controls.
- Evaluation procedure and artifact versions.
- Conditions under which the experiment will be stopped.

The simpler comparator might be a tuned prompt, improved context construction, a structured-output constraint, or a different candidate that does not require adaptation. Select a comparator relevant to the diagnosed failure rather than mechanically testing every possible alternative.

Change as few unrelated variables as practical. If the model, prompt, dataset, decoding settings, and application logic all change simultaneously, it becomes difficult to attribute any observed improvement to the proposed adaptation.

### 9.3 Define acceptance and regression gates

Before running the experiment, determine what outcomes justify continuing.

Acceptance criteria should include:

- The primary task-quality threshold.
- Any critical-category or safety constraints.
- Required latency and cost limits.
- Regression limits for protected capabilities or important case categories.
- The evidence quality needed to support the conclusion.

A candidate should not pass solely because its average target-task metric improves. A gain on the target task may be unacceptable if it causes a material degradation in another required behavior.

The regression set should reflect the workload's risk profile. It need not cover every capability of a general-purpose model, but it should cover behaviors that the application depends on and cannot afford to lose.

### 9.4 Evaluate the strength of evidence

Crossing a numerical threshold is not, by itself, sufficient to establish that the candidate meets the requirement.

Consider:

- Whether the evaluation data represents the production workload.
- Whether the sample is adequate for the decision being made.
- Whether the evaluation procedure is reliable and consistently applied.
- Whether the observed difference is meaningful relative to evaluation uncertainty.
- Whether critical failure categories have sufficient coverage.
- Whether the result is reproducible under the documented conditions.

Use the evaluation methodology and statistical reasoning established in LLM-08. Do not duplicate those methods here.

If evidence is insufficient to support the decision, classify the outcome as inconclusive rather than treating a promising result as proven success.

### 9.5 Define the decision gate

Possible outcomes include:

- **Proceed:** The measured result satisfies the predefined criteria, regression gates pass, and remaining dependencies are acceptable.
- **Revise and retest:** The result shows a promising but incomplete improvement, and a justified next experiment can resolve the gap.
- **Stop:** The experiment violates a hard constraint, fails to demonstrate sufficient incremental value, or reveals an unacceptable dependency or regression.
- **Inconclusive:** The evidence is insufficient to support a reliable decision.

A failed experiment is useful if it eliminates an unsuitable path or identifies the source of uncertainty. Do not continue solely because resources have already been spent.

### 9.6 Separate experimental success from production readiness

Passing an offline evaluation does not automatically establish production readiness. The adapted candidate may still require:

- Integration testing.
- Load and latency testing.
- Security and governance review.
- Regression testing in the intended environment.
- Operational monitoring and rollback preparation.
- Validation against the target deployment environment.

These are separate acceptance steps and should remain visible in the selection plan.

## 10. Worked Example: Domain-Specific Extraction

Consider an enterprise system that extracts structured fields from domain-specific documents.

The workload requires:

- At least 95% valid outputs.
- Zero failures in designated critical categories within the acceptance evaluation.
- p95 end-to-end latency no greater than 3 seconds.
- Compliance with mandatory data-handling and deployment requirements.
- No material regression in explicitly protected behaviors.

The numbers are illustrative and do not establish universal acceptance thresholds.

### 10.1 Initial assessment

Candidate A, a hosted API model, achieves 91% valid outputs on the baseline evaluation. It has acceptable latency, and the access method satisfies the required data-handling conditions.

Candidate B, an open-weight model, achieves 89% valid outputs. Its deployment options appear compatible with the target environment, but the team has not yet confirmed available compute capacity or established its full cost.

Neither candidate currently satisfies the quality requirement. Candidate A's better baseline performance does not prove that it will remain the best candidate after feasible interventions.

### 10.2 Diagnose the gap

The team reviews representative failures and identifies three patterns:

1. Some failures arise because the input omits required context.
2. Some outputs violate the required schema.
3. Some domain-specific fields are interpreted inconsistently even when the relevant context is available.

These patterns suggest different interventions:

- Improve context construction for missing information.
- Evaluate structured output constraints and validation for schema violations.
- Investigate whether a model change or adaptation can improve the remaining domain-specific behavior.

The team should test relatively low-cost interventions where they directly address the observed cause. This does not mean every simpler intervention must always precede adaptation; the sequence should be driven by evidence, cost, risk, and the delivery timeline.

### 10.3 Assess adaptation feasibility

For Candidate A:

- Current task performance is measured.
- Parameter-level adaptation is not available through the selected API.
- Other permitted configuration or provider-supported adaptation options must be verified rather than assumed.
- The team can still investigate context, prompting, and application-layer changes.

For Candidate B:

- The team must verify the model's architecture and adaptation-tool compatibility.
- Suitable data and permissions must be confirmed.
- Compute capacity and experiment cost must be estimated.
- A representative evaluation set and regression controls must be available.
- Deployment feasibility must be validated using the intended runtime.

Candidate B's greater potential control is not sufficient reason to select it. The dependencies must be resolved and the resulting solution must demonstrate acceptable performance.

### 10.4 Choose the next experiment

The team defines two controlled experiments:

- **Experiment 1:** Improve context construction and structured output handling, then evaluate both candidates using the same workload and acceptance criteria. This establishes whether simpler system changes close the gap.
- **Experiment 2:** If the remaining domain-specific gap is material, conduct a bounded adaptation feasibility study for Candidate B, conditional on data, permission, tooling, and compute checks.

The evaluation plan includes the target task, critical categories, protected regression cases, latency, cost, and evidence adequacy. Configuration changes are controlled so that observed differences can be interpreted.

### 10.5 Make the selection decision

The final selection depends on measured outcomes and resolved dependencies.

- If Candidate A meets all requirements through a simpler, permitted intervention, adaptation may add unnecessary cost and maintenance.
- If Candidate B demonstrates a meaningful incremental improvement over credible alternatives and satisfies the full operational and governance constraints, it may become the stronger candidate.
- If Candidate B's mandatory deployment or data requirements remain unconfirmed, the team should not declare it fully eligible.
- If either candidate improves the target metric but violates a critical regression gate, it should not pass acceptance.
- If neither path meets the acceptance criteria, the correct decision may be to evaluate other candidates or reconsider the system design.

The engineering outcome is a defensible selection decision, not a commitment to adaptation.

## 11. Common Mistakes

### 11.1 Assuming adaptation is always the next step

A weak baseline does not establish that parameter updates are necessary. First identify the failure mechanism and compare plausible interventions.

### 11.2 Treating open weights as proof of adaptation feasibility

Weight availability does not guarantee architecture compatibility, adequate compute, suitable data, acceptable licensing, or a viable deployment path.

### 11.3 Using an untested improvement estimate as evidence

Expected improvement is a hypothesis until an appropriately designed experiment supports it.

### 11.4 Ignoring regression risk

An adapted model may improve the target task while degrading other important behaviors. Define protected capabilities, critical cases, and regression gates before the experiment.

### 11.5 Ignoring the lifecycle after the experiment

Training cost alone does not represent the total cost of an adaptation-based solution. Evaluation, artifact management, serving, maintenance, and future re-adaptation can change the decision.

### 11.6 Mixing mandatory requirements with preferences

A strong quality score cannot compensate for violating a mandatory data-handling requirement. Assess eligibility separately from capability and preference-based ranking.

### 11.7 Failing to define stop conditions

Without predefined acceptance criteria and stop conditions, teams can continue expensive experiments without evidence that the approach is becoming viable.

### 11.8 Changing too many variables at once

Simultaneous changes to the model, prompts, context, data, and system logic weaken causal attribution. Use controlled comparisons where practical.

### 11.9 Treating a threshold crossing as conclusive proof

A result that narrowly exceeds a threshold on an unrepresentative or inadequate dataset may not support a reliable decision. Consider evidence quality and uncertainty before accepting the candidate.

### 11.10 Confusing experimental success with production readiness

An adapted model that passes an offline test can still fail under realistic latency, load, integration, security, or operational conditions.

## 12. Production Engineering Perspective

Adaptation introduces another versioned artifact and another source of behavioral change into the system.

A production selection record should make it possible to answer:

- Which base model and artifact were selected?
- Why was adaptation necessary?
- What intervention was performed, and under which configuration?
- Which dataset and evaluation procedure supported the decision?
- Which target-task and regression criteria were satisfied, and under what conditions?
- Which requirements were satisfied, and under what conditions?
- What dependencies remain unresolved?
- What triggers re-evaluation?
- What is the fallback if the adapted solution regresses or becomes unavailable?

The required level of detail depends on risk and organizational controls, but the decision must be traceable to the evidence that justified it.

Adaptation also changes the model-selection lifecycle. A candidate may need to be re-evaluated when the base model changes, the adaptation data changes, the inference runtime changes, or the production workload shifts materially.

The selection decision should state its assumptions and the conditions under which it remains valid.

## 13. Reusable Adaptation Feasibility Record

Use this template when evaluating whether an adaptation path should influence model selection.

### A. Requirement and baseline

- **Requirement:**
- **Mandatory acceptance criteria:**
- **Candidate and version:**
- **Baseline configuration:**
- **Evaluation dataset and conditions:**
- **Observed performance:**
- **Unmet requirements or failure patterns:**
- **Protected capabilities or critical cases:**

### B. Proposed intervention

- **Intervention type:**
- **Target behavior or metric:**
- **Rationale based on observed failures:**
- **Expected benefit:**
- **Evidence supporting the expectation:**
- **Simpler credible alternatives considered:**

### C. Dependency assessment

| Dependency | Status | Evidence | Required action | Owner |
|---|---|---|---|---|
| Model access and compatibility | | | | |
| Data availability and suitability | | | | |
| Permissions and governance | | | | |
| Compute and infrastructure | | | | |
| Evaluation and reproducibility | | | | |
| Deployment compatibility | | | | |
| Operational ownership | | | | |
| Budget and schedule | | | | |

Use the status categories defined in Section 7.2: confirmed feasible, confirmed blocker, unconfirmed, or conditionally feasible.

### D. Experiment and decision

- **Baseline and comparison plan:**
- **Primary acceptance metric:**
- **Critical failure constraints:**
- **Regression criteria:**
- **Evaluation adequacy and uncertainty considerations:**
- **Latency and cost limits:**
- **Stop conditions:**
- **Estimated experiment cost and duration:**
- **Post-experiment production checks:**
- **Decision:** Proceed, revise and retest, stop, or inconclusive.
- **Decision rationale:**
- **Remaining uncertainty:**
- **Fallback and re-evaluation conditions:**

This record prevents an adaptation proposal from being treated as a vague promise of future performance.

## 14. Engineering Decision Framework

Use the following sequence when adaptation feasibility affects candidate selection.

1. **Characterize the workload.** Establish mandatory requirements and measurable acceptance criteria.
2. **Measure the current candidate.** Build a representative baseline and categorize failures.
3. **Diagnose the gap.** Distinguish model behavior from context, integration, evaluation, and inference problems.
4. **Identify candidate interventions.** Include model substitution, configuration changes, system changes, and adaptation where appropriate.
5. **Assess dependencies.** Verify access, compatibility, data, permissions, compute, economics, and operational ownership.
6. **Design a bounded experiment.** Predefine comparisons, metrics, acceptance criteria, regression gates, and stop conditions.
7. **Evaluate the evidence.** Compare measured outcomes against the same requirements, assess evidence adequacy, and account for uncertainty.
8. **Validate the complete solution.** Confirm deployment, governance, operational, cost, and latency constraints.
9. **Record the decision.** State why the candidate was selected, which assumptions remain, and when re-evaluation is required.

The framework is not a mandate to adapt every weak candidate. It is a way to establish whether an adaptation path is credible enough to influence a selection decision.

## 15. Interview and Design Discussion Questions

1. A model misses a task-quality threshold. What evidence would you gather before deciding to adapt it?
2. How would you distinguish a context-construction problem from a model-behavior problem?
3. Why is an adaptation feasibility assessment different from a model capability evaluation?
4. A candidate performs well after an experimental adaptation, but the target environment lacks the required compute. How should the selection decision change?
5. How would you compare a hosted API that nearly meets the requirement with an open-weight candidate that might meet it after adaptation?
6. Which dependencies should be resolved before committing to an expensive adaptation experiment?
7. How would you prevent optimistic projections from being mistaken for measured evidence?
8. Why should an adaptation experiment include regression criteria, not just a target-task quality threshold?
9. How would you determine whether an observed improvement is supported by adequate evaluation evidence?
10. When can an adapted candidate be considered production-ready, and which checks remain after offline evaluation?
11. How would you record uncertainty when a mandatory requirement has not yet been verified?
12. Under what conditions would you stop an adaptation experiment even if the team had already invested substantial effort?

A strong answer should connect the observed failure to evidence, identify alternative interventions, explain the dependencies, and justify a decision using explicit constraints, regression risk, and trade-offs.

## 16. Quick Revision

- Adaptation is one possible intervention, not the default response to every performance gap.
- Establish a representative baseline before estimating the value of adaptation.
- Diagnose the failure mechanism before choosing an intervention.
- Assess technical, data, compute, operational, economic, and governance feasibility.
- Separate current measured capability from projected post-adaptation performance.
- Track blockers, uncertainties, and prerequisites explicitly.
- Compare adaptation against simpler credible alternatives where practical.
- Evaluate target-task gains alongside protected capabilities and regression criteria.
- Consider evaluation adequacy and uncertainty before accepting a threshold crossing.
- Passing an experiment does not automatically establish production readiness.
- Compare complete solution paths, including lifecycle costs and operational dependencies.
- Record the evidence, assumptions, decision rationale, fallback, and re-evaluation conditions.

## 17. Key Takeaways

The model with the strongest current benchmark score is not automatically the best selection. Neither is the model with the greatest theoretical flexibility.

A sound decision considers what the workload requires, what current evidence establishes, which intervention is likely to address the actual gap, and whether the complete solution can be built and maintained within the organization's constraints.

**Adaptation potential is a conditional engineering hypothesis, not a substitute for demonstrated capability.**

A defensible selection requires more than a target-task improvement. It requires evidence that the improvement is meaningful, important behaviors have not regressed beyond acceptable limits, dependencies are resolved, lifecycle economics are acceptable, and the solution can operate under production constraints.

## 18. Further Reading

Use authoritative, version-specific documentation when evaluating a real candidate:

- The selected model provider's documentation for supported capabilities, access methods, and adaptation options.
- The model's license and terms governing the intended use.
- The chosen adaptation framework's compatibility and hardware requirements.
- The organization's data-handling, security, and governance requirements.
- The evaluation methodology and reproducibility principles established in LLM-08.
- The adaptation and optimization methods covered in LLM-09.

Verify the exact model, runtime, framework, license, and documentation versions relevant to the proposed implementation. Capabilities and terms can change over time.
