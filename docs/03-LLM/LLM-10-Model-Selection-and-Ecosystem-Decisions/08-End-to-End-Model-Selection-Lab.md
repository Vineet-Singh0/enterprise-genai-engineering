# End-to-End Model Selection Lab

## 1. Learning Objectives

By completing this lab, you should be able to:

- Translate a business problem into explicit model-selection requirements.
- Separate mandatory eligibility constraints from optimization preferences.
- Shortlist candidates using relevant evidence rather than reputation or benchmark rankings.
- Evaluate task quality, latency, cost, deployment constraints, ecosystem fit, and adaptation feasibility together.
- Handle missing evidence and uncertainty without treating assumptions as facts.
- Use weighted scoring and sensitivity analysis without allowing scores to override hard constraints.
- Produce a defensible model-selection recommendation with documented risks, assumptions, and validation requirements.

The objective is not to identify a universally best model. It is to select a model configuration that best satisfies a defined workload under stated constraints.

## 2. Prerequisites

Review the following chapters before starting:

- [Requirements and Workload Characterization](01-Requirements-and-Workload-Characterization.md)
- [Model Capability Fit and Candidate Shortlisting](02-Model-Capability-Fit-and-Candidate-Shortlisting.md)
- [Evaluation Evidence for Model Selection](03-Evaluation-Evidence-for-Model-Selection.md)
- [Cost, Latency, and Total Cost of Ownership](04-Cost-Latency-and-Total-Cost-of-Ownership.md)
- [Hosted APIs, Open Weights, and Ecosystem Fit](05-Hosted-APIs-Open-Weights-and-Ecosystem-Fit.md)
- [Adaptation Feasibility and Selection Dependencies](06-Adaptation-Feasibility-and-Selection-Dependencies.md)
- [Comparative Decision Frameworks and Trade-offs](07-Comparative-Decision-Frameworks-and-Trade-offs.md)

This lab applies those concepts to one end-to-end engineering decision. It does not replace the detailed evaluation, economic, or adaptation methods covered in the preceding chapters.

## 3. Lab Scenario

You are an AI engineer at a company that processes customer support requests for enterprise software products.

The company wants an LLM-based service that converts an incoming support request into a structured classification record.

Each record must contain:

- `category`: one of a fixed set of supported categories.
- `priority`: one of `low`, `medium`, `high`, or `critical`.
- `summary`: a concise description of the request.
- `requires_human_review`: a Boolean value.
- `evidence`: a short excerpt from the request supporting the classification.

The service will be integrated into an existing support platform. Incorrect classification of critical requests is particularly costly because it can delay incident response.

Your task is to recommend a model configuration for an initial production deployment.

You are not being asked to implement the full support platform, design a retrieval system, or build an agent. The decision concerns model selection and its immediate dependencies.

### 3.1 Business context

The following figures are illustrative planning assumptions for this lab, not measured production data.

| Requirement | Target |
|---|---|
| Monthly request volume | 500,000 requests |
| Minimum task success rate | 90% |
| Critical-category failures | Zero observed in the final acceptance sample |
| End-to-end latency | p95 no greater than 3 seconds |
| Inference budget | At most $3,000 per month |
| Data handling | Customer text must not be used for provider model training |
| Deployment preference | Managed service preferred for the initial release |
| Integration | Structured output through a supported API |
| Initial launch | Within six weeks |

**Budget boundary:** The $3,000 ceiling applies to inference costs only. It excludes application development, general platform infrastructure, monitoring, human review, and other operational expenses. The final recommendation must identify material excluded costs and explain whether they could change the decision. Do not describe an inference-budget pass as proof that the entire service fits within a total-cost-of-ownership budget.

The quality requirement is a minimum gate, not a claim that a 90% success rate is sufficient for every safety-sensitive application. The business must validate whether this threshold is appropriate for its actual risk exposure.

Zero observed critical-category failures in a finite sample does not prove that the true critical-failure probability is zero.

### 3.2 Scope and assumptions

For this exercise:

- All candidates should ultimately be assessed using the same evaluation protocol.
- The initial candidate results supplied below are preliminary and may not have been obtained under fully comparable conditions.
- The initial comparison concerns model configurations, not just model names.
- Cost estimates use a common planning workload, but their calculation assumptions still require verification.
- A missing or unverified mandatory requirement cannot be assumed to pass.
- Final acceptance requires validation under the intended integration and operating conditions.

## 4. Step 1 — Create the Workload Specification

Before comparing candidates, turn the scenario into a workload specification.

A workload specification should describe what the system must accomplish, the conditions under which it operates, and the constraints a candidate must satisfy.

| Requirement type | Example | Decision role |
|---|---|---|
| Mandatory quality gate | Task success at least 90% | Eligibility |
| Mandatory latency gate | p95 at most 3 seconds | Eligibility |
| Mandatory data-handling gate | No provider training on customer inputs | Eligibility |
| Mandatory inference-budget gate | Monthly inference cost at most $3,000 | Eligibility |
| Preference | Lower latency | Ranking |
| Preference | Lower cost below the ceiling | Ranking |
| Preference | Easier operational ownership | Ranking |
| Unresolved requirement | Retention policy not yet verified | Eligibility remains unconfirmed if mandatory |

### Exercise 1

Create a workload specification containing:

1. The business objective.
2. The exact task and expected output.
3. Mandatory constraints.
4. Optimization preferences.
5. Evaluation conditions.
6. Unresolved assumptions.
7. The conditions that would trigger a human review or prevent automatic processing.

**Deliverable:** A concise workload specification that another engineer could use to assess candidate eligibility without interpreting vague requirements.

## 5. Step 2 — Shortlist the Candidates

Assume the team has identified three hypothetical candidates.

- **Candidate A:** A hosted proprietary model with strong structured-output support.
- **Candidate B:** A second hosted proprietary model with lower estimated cost and latency.
- **Candidate C:** An open-weight model available through a managed inference provider, with a possible future self-hosting option.

These descriptions are not sufficient to select a winner. Each candidate must be assessed against the actual workload and mandatory requirements.

### 5.1 Preliminary candidate evidence

The following data is illustrative. It is a preliminary evidence packet for triage and is not final acceptance evidence.

| Criterion | Candidate A | Candidate B | Candidate C |
|---|---:|---:|---:|
| Task success rate on preliminary evaluation | 96% | 93% | 98% |
| Critical-category failures observed | 0 | 1 | 0 |
| p95 end-to-end latency | 2.4 s | 1.8 s | 2.7 s |
| Estimated monthly inference cost | $2,400 | $1,500 | $1,100 |
| Structured-output interface | Supported | Supported | Supported by managed endpoint |
| Data-handling requirements | Verified for this scenario | Verified for this scenario | Not yet verified |
| Initial deployment path | Hosted API | Hosted API | Managed open-weight inference |
| Adaptation option | Provider-dependent | Provider-dependent | Potentially more configurable |

The preliminary results may differ in sample size, category distribution, prompt configuration, model version, or measurement conditions. Do not assume that they are directly comparable.

In particular, Candidate B's observed critical-category failure is a warning requiring investigation. It is **not automatically a confirmed failure of the final acceptance gate**, because the table does not establish that the result came from the final acceptance sample under the agreed protocol.

Conversely, Candidate A's and Candidate C's zero observed preliminary failures do not establish that either candidate will pass the final gate.

Before relying on these results, record the dataset, test conditions, model version, configuration, sample composition, and measurement method.

### Exercise 2

For each candidate:

1. Identify which requirements are supported by current evidence.
2. Identify any confirmed mandatory failures.
3. Identify mandatory requirements whose status remains unconfirmed.
4. Assign a preliminary eligibility state.
5. List the next evidence needed to resolve uncertainty.

Use these states:

- **Eligible:** Evidence supports every mandatory requirement under the defined conditions.
- **Ineligible:** Evidence establishes that at least one mandatory requirement is violated.
- **Eligibility unconfirmed:** Evidence is insufficient to establish that every mandatory requirement is satisfied.

For the supplied preliminary evidence, do not declare a candidate eligible solely because its preliminary figures appear to meet the numerical thresholds. The final evaluation protocol and the required data-handling verification have not yet been fully established.

A preliminary failure can justify additional investigation or an early rejection if the evidence is already decisive. However, do not conflate a preliminary warning with a confirmed failure against a different, explicitly defined acceptance procedure.

**Deliverable:** An eligibility table with justifications and explicit evidence gaps.

## 6. Step 3 — Design the Evaluation Evidence

The preliminary table is not enough to authorize a production selection.

You must determine whether the evaluation actually measures the behavior the business cares about.

### 6.1 Define the evaluation protocol

Specify:

- A representative sample of support requests.
- Coverage of every supported category.
- Separate coverage for critical requests.
- A fixed output schema and validation procedure.
- A consistent task prompt and equivalent configuration rules.
- A reproducible process for collecting model responses.
- A method for classifying task failures.
- A method for measuring end-to-end latency.
- A method for estimating costs using the expected request distribution.

Include realistic difficult cases such as ambiguous priority, missing information, malformed requests, conflicting signals, and requests that should be escalated.

### 6.2 Define acceptance criteria before running the evaluation

At minimum, define:

1. Overall task success rate.
2. Critical-category failure criteria.
3. Structured-output validity.
4. p95 end-to-end latency.
5. Estimated monthly inference cost.
6. Data-handling verification.
7. Regression criteria for candidate-specific configuration changes.

The overall success rate and critical-category criterion are separate gates. A high aggregate score must not conceal unacceptable performance on critical requests.

For statistical interpretation, document sample size and uncertainty. Zero observed failures in a sample is not equivalent to proof of zero underlying risk. Where the application warrants it, establish an appropriate confidence-bound or risk-based acceptance procedure.

### 6.3 Interpret the critical-category criterion precisely

The scenario's acceptance requirement is zero observed critical-category failures in the final acceptance sample. To apply it consistently, the team must define:

- What constitutes a critical-category failure.
- Which examples belong in the critical-category evaluation set.
- How the set is selected and reviewed.
- How ambiguous or disputed labels are resolved.
- Whether the requirement applies to every critical example or a specifically defined subset.
- What happens when a candidate fails and a configuration change is subsequently introduced.

If a candidate fails the final gate, the current configuration is ineligible under the stated requirement. A modified configuration must be treated as a new candidate configuration and retested against the acceptance protocol. The team must not erase the failure by informally changing the test set or acceptance criteria after observing the result.

### Exercise 3

Write a short evaluation plan that another engineer could execute.

Your plan must specify what constitutes success, what constitutes failure, how the sample will be selected, how disputed results will be handled, and what evidence is required before the result can support a selection decision.

**Deliverable:** An evaluation protocol with explicit acceptance and rejection conditions.

## 7. Step 4 — Compare Cost and Latency

The preliminary monthly inference cost estimates are:

| Candidate | Estimated monthly inference cost |
|---|---:|
| Candidate A | $2,400 |
| Candidate B | $1,500 |
| Candidate C | $1,100 |

All three preliminary estimates are below the $3,000 inference-budget ceiling. This establishes only a preliminary budget pass, assuming the estimates are calculated consistently. It does not establish final cost eligibility.

Confirm that each estimate uses the same workload assumptions and cost boundary.

Consider:

- Input and output token distributions.
- Retries and failed attempts.
- Request overhead and provider-specific charges.
- Any required preprocessing or postprocessing.
- Inference-related service charges.
- The effect of traffic spikes and workload growth.
- The costs of additional evaluation runs required before release.

Keep the inference-budget comparison separate from broader service TCO. If the decision depends on substantial infrastructure, human review, monitoring, or integration expenses, document those separately and determine whether they materially affect the recommendation.

Avoid double-counting shared costs or treating excluded costs as zero.

### Exercise 4

For each candidate, calculate or document:

1. Estimated monthly inference cost.
2. Cost per attempted request.
3. Cost per successful task, if cost and success-rate denominators are aligned.
4. p95 end-to-end latency.
5. Remaining inference-budget headroom.
6. Cost and latency uncertainty.
7. Material costs excluded from the inference estimate.

For a simplified estimate where monthly inference cost and success rate cover the same workload:

\[
\text{Cost per successful task}
=
\frac{\text{Monthly inference cost}}
{\text{Successful tasks per month}}
\]

If the workload has \(N\) attempts and a measured success rate \(s\), the denominator is \(N \times s\), provided the cost and success definitions are consistent.

This is a one-attempt workload calculation. It does not model retries until success. If the service retries failures, calculate the additional attempts and costs separately.

**Deliverable:** A cost-latency comparison with assumptions, excluded costs, and limitations recorded.

## 8. Step 5 — Assess Ecosystem and Deployment Fit

A model that performs well in an isolated evaluation may still be unsuitable for the intended system.

Assess the following dimensions for each candidate:

| Dimension | Questions to investigate |
|---|---|
| Interface | Does the API support the required structured output and error handling? |
| Data handling | Are retention, training use, and other mandatory handling conditions verified? |
| Versioning | Can the model and relevant configuration be identified and tracked? |
| Integration | Can the existing application call the model reliably? |
| Observability | Can failures, latency, and usage be measured adequately? |
| Portability | How much application code depends on provider-specific behavior? |
| Operational ownership | Who handles availability, capacity, incidents, and upgrades? |
| Lifecycle | What happens if the model or endpoint changes or becomes unavailable? |

Do not treat a common API shape as proof that two models are behaviorally interchangeable.

Likewise, open weights do not automatically establish production readiness, unrestricted licensing, or acceptable data handling. These properties require separate evidence.

### Exercise 5

For each candidate, record:

- Confirmed advantages.
- Material limitations.
- Unverified assumptions.
- Operational dependencies.
- A credible fallback or migration strategy.

**Deliverable:** An ecosystem-fit assessment with evidence references.

## 9. Step 6 — Assess Adaptation Feasibility

Assume the initial evaluation identifies a possible improvement opportunity: some domain-specific requests are misclassified because the model does not consistently interpret the company's terminology.

Before proposing fine-tuning or another adaptation technique, establish whether adaptation is justified.

Investigate:

1. Whether the errors are caused by model capability, prompt design, output constraints, or evaluation ambiguity.
2. Whether a simpler intervention can address the failure.
3. Whether representative, authorized training examples are available.
4. Whether the proposed method is technically feasible.
5. Whether the required compute, tooling, and expertise are available.
6. Whether adaptation can be completed within the launch schedule.
7. Whether regression tests can protect previously supported behavior.
8. Whether the expected improvement justifies its additional cost and operational burden.

An adaptation option should not be counted as a guaranteed capability improvement. It is a hypothesis requiring an experiment.

### Exercise 6

Write an adaptation feasibility record containing:

- Observed failure pattern.
- Baseline performance.
- Proposed intervention.
- Alternative interventions.
- Required data and infrastructure.
- Acceptance criteria.
- Regression criteria.
- Stop conditions.
- Expected cost and schedule impact.

**Deliverable:** A go, no-go, or defer recommendation for adaptation.

## 10. Step 7 — Apply a Comparative Decision Framework

Only candidates that satisfy all mandatory requirements should enter the eligible ranking.

A candidate with a confirmed mandatory failure is excluded. A candidate with an unconfirmed mandatory requirement remains unresolved and must not be silently treated as eligible.

### 10.1 Separate hypothetical post-verification ranking example

This subsection introduces a **separate hypothetical scenario** to demonstrate weighted scoring. It does not represent the preliminary candidates' current eligibility states in Section 5, and its normalized scores are not derived from the preliminary raw measurements.

Assume a later evaluation has established that Candidates A, B, and C each satisfy every mandatory requirement under the agreed protocol. Their data-handling and other required checks have also been completed. Only after these gates pass does the team compare their relative preferences.

Suppose the team assigns the following illustrative normalized preference scores:

| Criterion | Weight | Candidate A | Candidate B | Candidate C |
|---|---:|---:|---:|---:|
| Task quality | 0.50 | 97 | 96 | 98 |
| Latency | 0.30 | 80 | 95 | 75 |
| Cost | 0.20 | 60 | 85 | 95 |

The weights sum to 1.0. For this exercise, higher scores always mean a more desirable outcome, and the normalization rules are assumed to have been defined consistently.

Calculate:

\[
S_i = \sum_{j=1}^{m} w_j s_{ij}
\]

Where:

- \(S_i\) is the total score for candidate \(i\).
- \(w_j\) is the weight for criterion \(j\).
- \(s_{ij}\) is the normalized score for candidate \(i\) on criterion \(j\).

Using the illustrative values:

- Candidate A: \(0.50(97) + 0.30(80) + 0.20(60) = 84.5\)
- Candidate B: \(0.50(96) + 0.30(95) + 0.20(85) = 93.5\)
- Candidate C: \(0.50(98) + 0.30(75) + 0.20(95) = 90.5\)

Under these illustrative weights, Candidate B has the highest score.

That result is not a complete selection decision. It depends on eligibility, evidence quality, the selected criteria, the weights, and the normalization rules. The scores must not be presented as if they were calculated directly from the preliminary table.

### 10.2 Perform sensitivity analysis

Ask:

- Would the winner change if quality received more weight?
- Would a stricter latency requirement exclude a candidate?
- Would a higher cost ceiling change the ranking?
- Would uncertainty in the quality estimates change the conclusion?
- Would operational ownership or vendor dependency alter the decision?
- Does any candidate dominate another across the criteria that matter?

If small, plausible changes reverse the ranking, the decision is sensitive. Collect more evidence, reconsider the criteria, or present the decision as conditional rather than definitive.

### Exercise 7

1. Calculate the scores above independently.
2. Explain why weighted scoring must occur after mandatory eligibility checks.
3. Identify at least two assumptions that could change the winner.
4. Propose one additional criterion that might materially affect the decision.
5. Explain how you would resolve a conflict between the highest-scoring candidate and a candidate with stronger evidence.

**Deliverable:** A comparative decision record with the ranking, sensitivity analysis, and unresolved risks.

## 11. Step 8 — Write the Final Selection Recommendation

Your final recommendation must be understandable to both engineering and business stakeholders.

Use this structure.

### 11.1 Decision summary

State:

- The recommended candidate or configuration.
- The workload and operating conditions for which the recommendation applies.
- The main reasons for the decision.
- Whether the decision is final, conditional, or deferred.

### 11.2 Evidence summary

Record:

- Evaluation results and their source.
- Test dataset and relevant conditions.
- Model identifier and configuration.
- Cost and latency estimates.
- Eligibility status for every candidate.
- Important limitations in the evidence.

### 11.3 Trade-offs

Explain:

- What the recommended option does well.
- What it sacrifices compared with alternatives.
- Which assumptions most influence the result.
- Why the rejected options are less suitable under the current requirements.

### 11.4 Risks and mitigations

Document material risks, including:

- Quality regression.
- Critical-category failures.
- Latency or cost variation.
- Data-handling uncertainty.
- Model or API lifecycle changes.
- Provider dependency.
- Inadequate fallback behavior.

For each material risk, assign an owner or define the action required before approval.

### 11.5 Conditions for release

Define what must be true before the recommendation can be implemented:

- Mandatory requirements are verified.
- Evaluation acceptance criteria are met.
- The inference cost model is validated against the intended workload.
- Material excluded TCO costs are documented and assessed.
- Data-handling requirements are confirmed.
- Model versioning and configuration are recorded.
- Required integration tests pass.
- Monitoring and rollback requirements are addressed by the responsible production engineering team.

Model selection does not itself establish production readiness. Deployment, reliability, security, and operational controls remain responsibilities of their respective engineering workstreams.

### Exercise 8

Write a recommendation of approximately one page using the preceding sections.

Your recommendation must distinguish facts, assumptions, unresolved questions, and engineering judgment. Do not declare a winner solely because it has the highest aggregate score or the lowest estimated cost.

**Deliverable:** A reviewable model-selection decision record.

## 12. Final Deliverables Checklist

Before marking the lab complete, verify that you have produced each artifact.

- [ ] Workload specification.
- [ ] Candidate shortlist and evidence inventory.
- [ ] Eligibility classification with justifications.
- [ ] Evaluation protocol and acceptance criteria.
- [ ] Cost-latency comparison.
- [ ] Ecosystem-fit assessment.
- [ ] Adaptation feasibility record.
- [ ] Comparative scoring and sensitivity analysis.
- [ ] Final selection recommendation.
- [ ] List of assumptions, unresolved risks, and required follow-up actions.

A deliverable is complete only when its reasoning and evidence can be reviewed—not merely when a table or template has been filled in.

## 13. Completion Rubric

Assess the submitted artifacts against the following rubric.

| Dimension | Weight | Evidence of competent work |
|---|---:|---|
| Requirements and eligibility | 25% | Separates mandatory gates, preferences, confirmed failures, and unresolved evidence |
| Evaluation design | 20% | Defines representative testing, acceptance criteria, failure interpretation, and evidence limitations |
| Cost and latency | 15% | Uses consistent assumptions, distinguishes inference budget from broader TCO, and documents exclusions |
| Ecosystem and adaptation | 15% | Identifies dependencies, feasibility constraints, credible alternatives, and risks |
| Comparative reasoning | 15% | Scores only eligible candidates, explains weights, and tests sensitivity |
| Final recommendation | 10% | Connects the decision to evidence, assumptions, risks, and release conditions |

Suggested completion threshold: **80%**, with no critical failure in eligibility reasoning.

A critical eligibility failure includes treating a candidate with an unverified mandatory requirement as confirmed eligible, allowing a weighted score to override a confirmed mandatory violation, or changing acceptance criteria after observing results without a justified and documented protocol revision.

A high total score does not compensate for a critical eligibility error. If one occurs, correct the decision record and reassess the affected candidates before considering the lab complete.

The rubric evaluates reasoning and traceability, not the length or visual polish of the submitted documents.

## 14. Common Mistakes

### Mistake 1: Selecting the highest-scoring model immediately

A weighted score cannot compensate for a confirmed violation of a mandatory requirement. Apply eligibility gates first.

### Mistake 2: Treating preliminary metrics as directly comparable

Different datasets, prompts, configurations, and measurement procedures can make apparently comparable numbers misleading. Establish comparability before interpreting rankings.

### Mistake 3: Treating a preliminary warning as a confirmed final-gate failure

A preliminary critical-category failure is important evidence, but its decision effect depends on the defined acceptance protocol and the strength of the evidence. Investigate it; do not silently ignore it or misclassify it.

### Mistake 4: Assuming zero observed critical failures means zero risk

Finite evaluation samples cannot prove that the true failure probability is zero. Interpret results in context and define appropriate risk-based acceptance criteria.

### Mistake 5: Optimizing only inference price

The lowest per-request price may not produce the lowest cost per successful task or the lowest total cost of ownership.

### Mistake 6: Treating an unverified requirement as satisfied

An unknown data-handling property is not a pass. Resolve the evidence gap or keep the candidate's eligibility unconfirmed.

### Mistake 7: Treating adaptation potential as guaranteed improvement

A model that could be adapted has not necessarily been adapted successfully. Establish a baseline, define an experiment, and include regression checks.

### Mistake 8: Confusing an API abstraction with full portability

Two endpoints can share an interface while differing in output behavior, latency, error handling, and model lifecycle. Test the behaviors on which the application depends.

### Mistake 9: Presenting a recommendation without its conditions

A selection is valid for a defined workload, configuration, evidence base, and set of constraints. Record what would cause the decision to be revisited.

## 15. Production Engineering Perspective

The final selection record should serve as a reusable engineering artifact, not a one-time comparison document.

A production-oriented selection process should make it possible to answer:

- Why was this candidate chosen?
- Which requirements did it satisfy?
- What evidence supports the decision?
- Which alternatives were rejected, and why?
- Which assumptions remain uncertain?
- What trade-offs did the team accept?
- What changes would trigger a new evaluation?
- How will the team know when the selection is no longer appropriate?

Revisit the decision when the workload changes materially, evaluation evidence changes, pricing or data-handling terms change, the model version changes, or a previously acceptable trade-off becomes unacceptable.

The purpose of the record is to preserve the reasoning behind the decision so future engineers can review it, challenge it, and update it without reconstructing the entire investigation from scratch.

## 16. Interview and Design Discussion Questions

Answer in writing before reviewing your work with another engineer.

1. Why must mandatory constraints be evaluated before weighted scoring?
2. How would you decide whether a benchmark result is relevant to a specific workload?
3. When is a candidate with incomplete evidence preferable to one with higher measured quality?
4. How would you compare candidates when one has better quality but another has substantially lower latency?
5. Why can cost per successful task be more informative than cost per request?
6. What does zero observed critical-category failure establish—and what does it not establish?
7. How would you determine whether adaptation is worth attempting?
8. What would make a selection decision sensitive to its scoring weights?
9. How would you defend a recommendation when stakeholders disagree about the relative importance of cost and quality?
10. What would trigger you to reopen a previously approved selection?

Strong answers explain the reasoning, identify assumptions, compare credible alternatives, and state what evidence would change the conclusion.

## 17. Quick Revision

- **Workload specification:** Defines the task, operating conditions, constraints, and preferences.
- **Eligibility:** Determines whether mandatory requirements are supported by evidence.
- **Shortlisting:** Reduces the candidate set to options worth evaluating.
- **Evaluation evidence:** Establishes how well candidates perform under defined conditions.
- **Economic assessment:** Compares workload cost, latency, and total cost of ownership.
- **Ecosystem fit:** Evaluates interfaces, lifecycle, deployment options, integration, and operational dependencies.
- **Adaptation feasibility:** Determines whether a proposed intervention is justified and realistically achievable.
- **Comparative decision framework:** Ranks eligible candidates and exposes trade-offs and sensitivity.
- **Selection record:** Preserves the recommendation, evidence, assumptions, risks, and conditions for reconsideration.

## 18. Key Takeaways

1. Model selection is a requirements-driven engineering decision, not a popularity contest or benchmark leaderboard exercise.
2. Eligibility and preference ranking are different stages. A mandatory failure cannot be compensated for by a high aggregate score.
3. Preliminary evidence can inform shortlisting but must not be confused with final acceptance evidence.
4. Evidence must be relevant, comparable, and sufficient for the decision being made.
5. Quality, latency, inference cost, deployment, ecosystem, and adaptation are interconnected selection dimensions.
6. Uncertainty should be recorded explicitly rather than converted into unsupported assumptions.
7. Weighted scoring helps organize trade-offs, but it does not eliminate judgment or replace sensitivity analysis.
8. A defensible recommendation states not only what was selected, but why, under which conditions, with which risks, and based on what evidence.
9. The selection decision must remain reviewable as workloads, models, costs, and constraints evolve.

## 19. Further Reading

Use the preceding LLM-10 chapters for the detailed methods underlying this lab:

- [Requirements and Workload Characterization](01-Requirements-and-Workload-Characterization.md)
- [Model Capability Fit and Candidate Shortlisting](02-Model-Capability-Fit-and-Candidate-Shortlisting.md)
- [Evaluation Evidence for Model Selection](03-Evaluation-Evidence-for-Model-Selection.md)
- [Cost, Latency, and Total Cost of Ownership](04-Cost-Latency-and-Total-Cost-of-Ownership.md)
- [Hosted APIs, Open Weights, and Ecosystem Fit](05-Hosted-APIs-Open-Weights-and-Ecosystem-Fit.md)
- [Adaptation Feasibility and Selection Dependencies](06-Adaptation-Feasibility-and-Selection-Dependencies.md)
- [Comparative Decision Frameworks and Trade-offs](07-Comparative-Decision-Frameworks-and-Trade-offs.md)

Repository-relative links should be validated against the final directory structure before merging.
