# Comparative Decision Frameworks and Trade-offs

## 1. Learning Objectives

By the end of this chapter, you should be able to:

- Compare multiple model candidates against a common set of workload requirements.
- Separate mandatory eligibility constraints from preferences and optimization objectives.
- Select an appropriate comparison method for the decision's complexity, uncertainty, and risk.
- Use weighted scoring without allowing attractive secondary metrics to hide mandatory failures.
- Evaluate trade-offs among quality, latency, cost, deployment control, ecosystem fit, and operational complexity.
- Account for evidence quality, unresolved dependencies, and sensitivity to assumptions.
- Recognize when a numerical ranking is misleading or insufficient.
- Produce an auditable model-selection recommendation with explicit rationale, limitations, and fallback conditions.

## 2. Prerequisites

This chapter consolidates the selection concepts established in the preceding LLM-10 chapters:

- Requirements and workload characterization.
- Model capability fit and candidate shortlisting.
- Evaluation evidence for model selection.
- Cost, latency, and total cost of ownership.
- Hosted APIs, open weights, and ecosystem fit.
- Adaptation feasibility and selection dependencies.

Related topics remain in their owning chapters:

- **LLM-08:** Evaluation design, metrics, benchmarking, experimental validity, and statistical interpretation.
- **LLM-09:** Adaptation, compression, quantization, and inference optimization.
- **Production AI Engineering:** Deployment, serving, reliability, scaling, and ongoing operations.
- **Enterprise AI Systems:** Governance, security, compliance, and organizational risk.

This chapter does not re-teach those subjects. It explains how to combine their evidence and constraints into a defensible comparative decision.

## 3. The Engineering Problem

A model-selection decision rarely has one universally best candidate.

One model may provide stronger task quality but higher latency. Another may be cheaper but require more application-side validation. A third may provide greater deployment control but introduce infrastructure and maintenance responsibilities.

Consider three hypothetical candidates:

| Dimension | Candidate A | Candidate B | Candidate C |
|---|---|---|---|
| Task quality | High | Medium–high | Medium |
| Latency | Medium | Low | Low |
| Cost per request | High | Medium | Low |
| Deployment control | Limited | Moderate | High |
| Operational burden | Low | Medium | High |

These qualitative descriptions do not establish which candidate should be selected. The answer depends on mandatory requirements, the importance of each objective, the strength of the evidence, and the cost of operating the complete solution.

The central problem is:

**How do we choose the most suitable candidate without allowing subjective preferences, incomparable evidence, or hidden constraints to distort the decision?**

The answer is not to create a single score immediately. First establish which candidates are viable. Then compare their trade-offs using an explicit decision framework.

## 4. The Decision Hierarchy

A defensible model-selection process should follow a consistent hierarchy.

1. **Eligibility:** Does the candidate satisfy mandatory requirements, or is its eligibility still unconfirmed?
2. **Evidence sufficiency:** Is there enough relevant evidence to support the claims required for the decision?
3. **Capability fit:** Does the candidate satisfy the workload's task requirements?
4. **Solution feasibility:** Can the complete solution meet deployment, data, operational, economic, and governance constraints?
5. **Comparative preference:** Among viable candidates, which best balances the organization's objectives?
6. **Decision robustness:** Does the preferred candidate remain preferable when reasonable assumptions change?

These stages are related but not interchangeable.

A candidate with excellent average quality may be ineligible because it violates a mandatory data-handling requirement. A candidate may appear eligible but remain unconfirmed because deployment compatibility has not been verified. A candidate may satisfy every mandatory requirement yet lose the comparative decision because another candidate provides a better cost-quality balance.

### 4.1 Separate eligibility from ranking

Use three eligibility states:

- **Eligible:** Available evidence supports satisfaction of all mandatory requirements under the defined conditions.
- **Ineligible:** Evidence establishes that at least one mandatory requirement is violated.
- **Eligibility unconfirmed:** Evidence is insufficient to determine whether one or more mandatory requirements are satisfied.

An unconfirmed candidate should not be silently treated as eligible.

If the organization must select a candidate before all uncertainty can be resolved, the decision should explicitly identify the unresolved requirement, its risk, the authorization needed, and any restriction on use. A ranking score cannot resolve a mandatory compliance or feasibility uncertainty.

### 4.2 Keep evidence sufficiency visible

Eligibility is not the same as evidence sufficiency.

A candidate might appear to meet a requirement based on a small evaluation sample, vendor documentation, or an unverified infrastructure assumption. That evidence may be inadequate for a high-risk decision.

Record both:

- The current assessment of the requirement.
- The confidence and limitations of the evidence supporting that assessment.

Detailed evaluation methodology belongs to LLM-08. Here, the important rule is that weak evidence must remain visible in the comparison rather than disappearing into a score.

## 5. Choose the Appropriate Comparison Framework

Different decisions require different levels of structure. A lightweight comparison can be sufficient for a low-risk decision involving two similar candidates. A high-impact enterprise decision may need explicit eligibility gates, weighted objectives, sensitivity analysis, and a documented approval process.

### 5.1 Framework A — Constraint-first selection

Use this when the workload has clear mandatory requirements.

**Procedure**

1. List mandatory requirements.
2. Define how each requirement will be verified.
3. Assess each candidate against every requirement.
4. Exclude candidates confirmed to violate a mandatory requirement from the eligible comparison.
5. Keep candidates with unresolved mandatory requirements marked as eligibility unconfirmed and outside the eligible ranking.
6. Compare eligible candidates using secondary objectives.

Example:

A system requires p95 end-to-end latency no greater than 2 seconds, an approved data-handling arrangement, and at least 95% task success under a specified evaluation.

Candidate A meets the quality and latency thresholds but has an unapproved data-handling arrangement. Candidate B meets the data-handling and latency requirements, but its task success is only 92%.

Neither candidate currently satisfies all mandatory requirements. Candidate A cannot be selected merely because its quality is better, and Candidate B cannot be selected merely because its data-handling arrangement is acceptable.

The correct action is to investigate whether either candidate can meet the remaining requirement through a permitted, validated change—or evaluate another candidate.

**Strength:** Prevents hard constraints from being overridden by weighted preferences.

**Limitation:** It does not rank candidates that satisfy all mandatory requirements.

### 5.2 Framework B — Weighted multi-criteria decision analysis

Use this when several eligible candidates must be compared across competing objectives.

A weighted model combines normalized criteria into a composite score:

\[
S_i = \sum_{j=1}^{m} w_j s_{ij}
\]

Where:

- \(S_i\) is the composite score for candidate \(i\).
- \(w_j\) is the weight assigned to criterion \(j\).
- \(s_{ij}\) is candidate \(i\)'s normalized score for criterion \(j\).
- \(m\) is the number of criteria.

Weights must be non-negative and sum to 1:

\[
\sum_{j=1}^{m} w_j = 1
\]

**Non-negotiable rule:** Apply mandatory eligibility gates before calculating or using weighted rankings. Candidates confirmed to violate a mandatory requirement must be excluded from the eligible ranking. Candidates with unconfirmed mandatory requirements must remain separately classified until the uncertainty is resolved or handled through an explicitly authorized decision process. A high composite score cannot make either category eligible.

This rule is important because weighted sums are compensatory: a low score on one criterion can be offset by high scores on others. That property is useful for preferences but inappropriate for non-negotiable constraints.

**Procedure**

1. Establish eligibility before scoring.
2. Select criteria that represent genuine decision objectives.
3. Define how each criterion is measured or scored.
4. Normalize criteria so their scales are comparable.
5. Assign weights based on explicit business or engineering priorities.
6. Calculate the composite scores for eligible candidates.
7. Inspect individual criterion scores and evidence limitations.
8. Test whether the ranking is sensitive to reasonable changes in assumptions.

**Strength:** Makes preferences and trade-offs explicit.

**Limitation:** Results can be misleading when weights are arbitrary, scores are incomparable, uncertainty is ignored, or a mandatory failure is allowed to be compensated by other criteria.

A composite score is a decision aid, not a substitute for engineering judgment.

### 5.3 Framework C — Pareto comparison

Use this when no candidate is best on every important dimension and stakeholders need to understand the trade-off frontier.

A candidate is Pareto-dominated when another candidate is at least as good on every relevant objective and strictly better on at least one, assuming the same eligibility and comparison conditions.

For example, suppose both candidates satisfy all mandatory requirements:

| Candidate | Quality score | Relative cost |
|---|---:|---:|
| A | 95 | 8 |
| B | 93 | 6 |
| C | 90 | 9 |

Assume higher quality is better and lower cost is better, and the cost values use the same unit.

Candidate C is dominated by Candidate B: B has higher quality and lower cost. Candidate A and Candidate B are not dominated by one another because A has higher quality while B has lower cost.

The remaining candidates form the Pareto frontier for these two criteria.

**Strength:** Identifies candidates that can be eliminated without choosing subjective weights.

**Limitation:** A Pareto frontier may contain several candidates. It identifies efficient trade-offs but does not determine which trade-off the organization should prefer.

Only compare candidates using criteria that are meaningfully comparable and relevant to the same workload.

### 5.4 Framework D — Risk-adjusted decision

Use this when failure consequences, uncertainty, or operational dependencies materially affect the decision.

A candidate may have an attractive expected result but depend on an unverified deployment assumption, an immature integration, or a weak evaluation dataset.

A risk-adjusted review asks:

- What must be true for this candidate to succeed?
- Which assumptions are supported by evidence?
- What happens if an important assumption is wrong?
- Can the risk be reduced through testing, a fallback, or a limited rollout?
- Who owns the remaining risk?
- Is the residual risk acceptable for the intended use?

Risk should not automatically be converted into an arbitrary numerical penalty. Mandatory constraints remain gates, and important risks may require explicit mitigation or approval.

**Strength:** Makes uncertainty and failure consequences visible.

**Limitation:** Risk judgments require evidence and clearly defined ownership. An informal risk score can create false precision.

### 5.5 Framework selection guide

| Decision situation | Appropriate starting framework |
|---|---|
| Clear mandatory requirements | Constraint-first selection |
| Several viable candidates with competing preferences | Weighted multi-criteria comparison |
| Need to eliminate objectively inferior candidates | Pareto comparison |
| High uncertainty or material failure consequences | Risk-adjusted decision |
| Complex enterprise decision with multiple concerns | Combine constraint gates, Pareto analysis, weighted preferences, and risk review |

These frameworks are complementary. A robust enterprise decision often uses more than one.

## 6. Define Comparable Decision Criteria

A comparison is only as good as the criteria it uses.

Criteria should represent requirements or objectives that can influence the decision. They should not simply list every model characteristic that happens to be available.

### 6.1 Common criteria

| Criterion | Example measure | Key consideration |
|---|---|---|
| Task quality | Task-specific success or error rate | Must reflect the intended workload |
| Critical failure behavior | Rate or count of defined critical failures | May be a mandatory constraint rather than a preference |
| Latency | p50, p95, or p99 end-to-end latency | Include the relevant system path |
| Cost | Cost per request or successful task | Use consistent workload assumptions |
| Throughput | Requests or tokens processed per unit time | Account for the expected concurrency pattern |
| Deployment fit | Verified compatibility with required environment | May be a hard eligibility gate |
| Data handling | Verified satisfaction of required data controls | Do not substitute a vague score for a mandatory requirement |
| Ecosystem maturity | Evidence about documentation, support, integration, and maintenance | Assess the intended use and required dependencies |
| Operational burden | Engineering effort and ongoing maintenance requirements | Include the surrounding system, not only the model |
| Adaptation feasibility | Verified prerequisites and experimentally supported improvement | Separate measured results from projections |
| Reproducibility | Ability to identify and reconstruct the selected configuration | Define what reproducibility means for the use case |

Not every decision needs every criterion. Include a criterion only if it can materially affect the choice.

### 6.2 Avoid double-counting

Criteria should represent distinct objectives or be intentionally grouped.

For example, a scoring model might include both cost per request and cost per successful task. These are related but not equivalent: the second accounts for task success. Including both without understanding their relationship can overemphasize cost or reward the same underlying property twice.

Likewise, ecosystem maturity and operational burden may overlap. If both are scored, define their boundaries.

Before finalizing the criteria, ask:

- Does each criterion represent a distinct decision concern?
- Is the measure relevant to the workload?
- Is the measure comparable across candidates?
- Does it duplicate another criterion?
- Is it actually a mandatory requirement that should be a gate instead?

### 6.3 Define direction and normalization

Criteria may have different scales and directions:

- Higher quality may be better.
- Lower latency may be better.
- Lower cost may be better.
- Greater deployment compatibility may be required rather than merely preferred.

A weighted model requires a consistent scoring direction. For example, a latency score must reward lower latency if higher normalized scores are intended to be better.

Normalization should be chosen deliberately. Min-max normalization can make scores highly dependent on the candidates included in the comparison. Threshold-based scoring may be more suitable when requirements define meaningful performance bands.

Do not mix raw milliseconds, currency, quality percentages, and subjective ratings in a weighted sum without a defined conversion or scoring method.

## 7. Worked Example: Eligibility Gates and Weighted Scoring

Consider a hypothetical document-processing workload with the following mandatory requirements:

- Task success of at least 95% on the defined evaluation.
- p95 end-to-end latency no greater than 2 seconds.
- Approved data-handling arrangements.
- Compatibility with the required deployment environment.

Three candidates have been evaluated under comparable conditions.

| Candidate | Task success | p95 latency | Data handling | Deployment fit |
|---|---:|---:|---|---|
| A | 97% | 1.8 s | Approved | Verified |
| B | 96% | 1.4 s | Approved | Verified |
| C | 98% | 1.7 s | Unconfirmed | Verified |

Candidate C has the highest task success, but its eligibility is unconfirmed because data-handling requirements have not been verified. It must not be treated as an eligible winner or included in the eligible weighted ranking.

Candidates A and B satisfy the stated gates, assuming the evidence is adequate.

### 7.1 Define criteria and weights

Suppose the organization uses these illustrative preference weights:

| Criterion | Weight | Why it matters |
|---|---:|---|
| Task quality | 0.50 | Quality is the primary objective |
| Latency | 0.30 | Responsiveness matters to users |
| Cost | 0.20 | The system must remain economical |
| **Total** | **1.00** | |

These weights are hypothetical. In a real selection, the decision owner should justify them based on workload and business priorities.

To demonstrate the calculation, assume the team has already established comparable normalized scores on a 0–100 scale. Higher scores are better for every criterion.

| Eligible candidate | Quality score | Latency score | Cost score |
|---|---:|---:|---:|
| A | 97 | 80 | 60 |
| B | 96 | 95 | 85 |

These are illustrative normalized scores, not scores calculated directly from the raw measurements above. In a real analysis, the normalization rules must be documented and applied consistently.

### 7.2 Calculate the composite scores

For Candidate A:

\[
\begin{aligned}
S_A &= (0.50 \times 97) \\
&\quad + (0.30 \times 80) \\
&\quad + (0.20 \times 60) \\
&= 48.5 + 24 + 12 \\
&= 84.5
\end{aligned}
\]

For Candidate B:

\[
\begin{aligned}
S_B &= (0.50 \times 96) \\
&\quad + (0.30 \times 95) \\
&\quad + (0.20 \times 85) \\
&= 48 + 28.5 + 17 \\
&= 93.5
\end{aligned}
\]

Under these illustrative weights and scores, Candidate B ranks higher: 93.5 compared with Candidate A's 84.5.

### 7.3 Interpret the result correctly

The result supports a preference for Candidate B **under the stated scoring assumptions**. It does not establish that B is universally better.

Before making the final decision, the team should:

1. Confirm that the normalized scores were derived using valid, documented methods.
2. Inspect the individual criteria rather than relying only on the totals.
3. Test whether reasonable changes to the weights alter the ranking.
4. Check whether the difference is meaningful given the evidence and its uncertainty.
5. Verify that both candidates still satisfy all mandatory requirements in the intended deployment.
6. Keep Candidate C outside the eligible ranking until its data-handling eligibility is established.

If Candidate A were confirmed to violate a mandatory requirement, its higher or lower composite score would be irrelevant to eligibility. If Candidate C's eligibility later became confirmed, it could be evaluated under the same criteria and normalization rules.

**Engineering lesson:** A weighted score helps organize preferences among eligible candidates. It cannot establish eligibility, repair weak evidence, or remove the need for sensitivity analysis.

## 8. Understand the Trade-offs

Trade-offs are not merely differences in scores. They are relationships between objectives, constraints, and the consequences of choosing one solution over another.

### 8.1 Quality versus cost

A higher-quality candidate may cost more per request, but the relevant comparison depends on the workload.

Consider:

- Whether the quality improvement changes business outcomes.
- Whether lower-quality outputs require manual correction.
- Whether retries or fallback models add cost.
- Whether quality differences affect critical cases.
- Whether the organization is paying for capability that the workload does not need.

A more expensive model may be economically preferable when it substantially reduces costly failures. A cheaper model may be preferable when it satisfies the requirements with adequate evidence and acceptable risk.

Compare the complete solution cost, not just the model's listed price.

### 8.2 Quality versus latency

A candidate may provide stronger task performance but exceed a latency requirement.

Possible decision paths include:

- Selecting a faster candidate that still meets quality requirements.
- Testing whether configuration or inference optimization can reduce latency.
- Using a more complex routing strategy if the additional system cost and complexity are justified.
- Rejecting a candidate that cannot meet a mandatory latency constraint.

The appropriate choice depends on the workload's latency objective and the feasibility of the proposed intervention. Do not assume that an optimization will preserve quality or achieve a required latency target without validation.

### 8.3 Hosted convenience versus deployment control

A hosted API may reduce infrastructure ownership and simplify integration. An open-weight or self-hosted option may provide more deployment control but introduce resource, maintenance, and operational responsibilities.

The comparison should include:

- Data-handling requirements.
- Required deployment location.
- Infrastructure availability.
- Model and runtime maintenance.
- Cost under expected utilization.
- Vendor and ecosystem dependencies.
- Required operational expertise.

Greater control is valuable only when it addresses a real requirement or provides a justified benefit. It is not automatically better.

### 8.4 Simplicity versus customization

A model that meets requirements with a simple integration may be preferable to one that requires adaptation, complex orchestration, or extensive custom controls.

However, simplicity should not become an excuse to ignore important requirements. If a more complex solution is necessary to achieve mandatory quality, safety, or deployment constraints, the added complexity may be justified.

Compare both the benefit and the lifecycle cost of customization.

### 8.5 Current capability versus future potential

A candidate may appear attractive because it could improve after adaptation or because its ecosystem may develop additional capabilities.

Future potential should be represented as a conditional hypothesis, not current performance.

For each projected benefit, record:

- The required intervention.
- The dependencies that must be satisfied.
- The evidence supporting the expectation.
- The cost and time needed to test it.
- The acceptance criteria.
- The fallback if the expected improvement does not materialize.

Do not select a candidate solely because an untested future improvement makes its projected score higher.

## 9. Sensitivity and Robustness Analysis

A selection decision can appear precise while depending heavily on subjective weights or uncertain estimates.

Sensitivity analysis tests whether the decision changes when plausible assumptions change.

### 9.1 Weight sensitivity

Suppose Candidate A ranks first when quality receives 60% of the weight, but Candidate B ranks first when cost receives 40%.

That does not automatically mean the scoring framework is defective. It may reveal a genuine business trade-off that the decision owner must resolve.

A useful analysis asks:

- Which criteria cause the ranking to change?
- Are the weights supported by business priorities?
- Does one candidate remain preferable across a reasonable range of weights?
- Is the difference between candidates meaningful relative to evidence uncertainty?
- Should the decision be presented as a trade-off rather than a single winner?

Avoid choosing weights after observing the results simply to produce a desired winner.

### 9.2 Assumption sensitivity

Test assumptions that could materially affect the result, such as:

- Request volume.
- Input and output token distribution.
- Retry and failure rates.
- Expected concurrency.
- Hosted service pricing.
- Infrastructure utilization.
- Engineering and maintenance effort.
- Adaptation success and experiment duration.

Use the cost and experimental reasoning developed in the preceding chapters. Do not reproduce their calculation methods here.

### 9.3 Evidence uncertainty

A candidate with a slightly higher measured score is not necessarily meaningfully better.

The decision should consider the quality and limitations of the evidence, including sample representativeness, evaluation uncertainty, and whether the differences are material for the intended workload.

Detailed statistical interpretation belongs to LLM-08. The selection principle is straightforward: do not convert uncertain measurements into unjustifiably precise rankings.

### 9.4 Robustness categories

A useful summary classifies the decision as:

- **Robust preference:** The candidate remains preferred under reasonable changes to key assumptions.
- **Conditional preference:** The candidate is preferred only if specific assumptions or dependencies hold.
- **Preference unresolved:** The available evidence or competing priorities do not support a defensible ranking.

A conditional or unresolved result is not necessarily a failure. It identifies which assumption or stakeholder decision must be resolved next.

## 10. Risk, Uncertainty, and Missing Information

Not every missing value deserves the same response.

A missing noncritical preference score may not block a decision. An unverified mandatory data-handling requirement can block selection. A projected adaptation benefit may justify a small experiment but not a production commitment.

Classify missing information by its decision impact.

| Missing information | Typical response |
|---|---|
| Mandatory requirement is unverified | Keep eligibility unconfirmed; obtain evidence or resolve the requirement |
| Noncritical preference is missing | Record the limitation and assess whether it could change the ranking |
| Important performance result is uncertain | Improve evaluation or conduct a controlled comparison |
| Adaptation benefit is projected but untested | Treat it as a hypothesis and define a bounded feasibility experiment |
| Cost assumption may change materially | Run sensitivity analysis or collect better cost evidence |
| Operational dependency has no owner | Resolve ownership before treating the complete solution as production-feasible |

Do not conceal uncertainty inside a single composite score.

Where a decision must proceed under uncertainty, document the unresolved assumptions, potential consequences, mitigation, decision owner, and conditions for reassessment.

## 11. A Reusable Comparative Decision Record

The following template can be used for a real model-selection review.

### A. Decision context

- **Workload and use case:**
- **Decision owner:**
- **Required decision date:**
- **Candidate models and versions:**
- **Deployment environment:**
- **Expected workload volume and usage pattern:**

### B. Mandatory requirements

| Requirement | Acceptance criterion | Evidence source | Candidate status |
|---|---|---|---|
| Task capability | | | |
| Critical failure constraints | | | |
| Latency | | | |
| Data handling and governance | | | |
| Deployment compatibility | | | |
| Budget or other hard limits | | | |

Use the eligibility states defined in Section 4.1. Record unresolved requirements explicitly.

### C. Comparative criteria

| Criterion | Measurement or scoring method | Weight, if applicable | Rationale |
|---|---|---:|---|
| Task quality | | | |
| Cost | | | |
| Latency | | | |
| Ecosystem and integration fit | | | |
| Operational burden | | | |
| Other workload-specific objective | | | |

Confirm that the criteria are relevant, comparable, and not unintentionally double-counted.

### D. Candidate assessment

For each candidate, record:

- Eligibility and supporting evidence.
- Current measured performance.
- Unresolved capability questions.
- Cost and latency under the common workload assumptions.
- Deployment and ecosystem dependencies.
- Adaptation or optimization requirements.
- Operational and governance risks.
- Evidence limitations.

### E. Comparative analysis

- **Candidates excluded by mandatory constraints:**
- **Candidates with unconfirmed eligibility:**
- **Candidates remaining on the Pareto frontier, if applicable:**
- **Weighted comparison method, if applicable:**
- **Sensitivity analysis results:**
- **Key trade-offs:**
- **Important unresolved assumptions:**
- **Risks and mitigations:**

### F. Final decision

- **Selected candidate:**
- **Reason for selection:**
- **Why alternatives were not selected:**
- **Requirements satisfied:**
- **Known limitations:**
- **Conditions or assumptions attached to the decision:**
- **Fallback candidate or recovery approach:**
- **Validation required before production:**
- **Decision owner and approval:**
- **Re-evaluation triggers:**

The record should make the decision understandable to another engineer or reviewer who was not involved in the original comparison.

## 12. Common Mistakes

### 12.1 Selecting the highest composite score automatically

A weighted score cannot override mandatory constraints or resolve eligibility uncertainty. Apply eligibility gates before ranking.

### 12.2 Treating weights as objective facts

Weights express priorities. They may be evidence-informed, but they still reflect decisions about the relative importance of competing objectives.

Document the rationale and test whether the result is sensitive to reasonable changes.

### 12.3 Comparing incomparable evidence

Results from different workloads, evaluation datasets, configurations, or measurement conditions may not support a direct ranking.

Standardize the comparison where practical and preserve differences that cannot be reconciled.

### 12.4 Double-counting criteria

Overlapping criteria can unintentionally amplify one preference. Define each criterion's scope before assigning weights.

### 12.5 Ignoring dominated candidates

A candidate that is worse on every relevant objective may not deserve further consideration if the comparison is valid and all material requirements are represented.

Pareto analysis can reduce the shortlist without requiring arbitrary weights.

### 12.6 Ignoring operational complexity

A model with attractive inference economics can still be a poor choice if the surrounding system introduces excessive maintenance, fragile integrations, or unowned dependencies.

Evaluate the complete solution.

### 12.7 Treating potential improvements as measured results

An untested adaptation or optimization should not be represented as an established capability. Keep projected benefits separate from observed evidence.

### 12.8 Hiding uncertainty in a score

A precise-looking score can conceal missing evidence, unresolved prerequisites, and assumptions that drive the result. Keep these visible in the decision record.

### 12.9 Optimizing for a single metric

The cheapest or fastest model is not necessarily the best. Optimize for the workload's actual requirements and business objectives.

### 12.10 Failing to define when the decision expires

A selection may become invalid when model versions, pricing, workload characteristics, deployment requirements, or organizational constraints change. Define re-evaluation triggers.

## 13. Production Engineering Perspective

A comparative decision is not complete merely because one candidate ranks first.

The selected model must be connected to a production plan that preserves the assumptions on which the decision was based.

### 13.1 Make the selected configuration identifiable

Record enough information to identify the chosen solution, including the relevant model version, access method, configuration, runtime, and surrounding components.

The level of reproducibility depends on the deployment model. A hosted API may not expose all internal implementation details, so record the available provider identifiers and observable configuration rather than claiming that the provider's entire internal system can be reconstructed.

### 13.2 Translate selection criteria into acceptance checks

The constraints used to select a candidate should inform its release acceptance criteria.

For example, if p95 latency was a mandatory selection requirement, the deployment plan should define how that latency is measured under representative conditions. If critical failures were a selection gate, the release plan should retain the relevant checks.

This reduces the risk that the selected solution drifts away from the conditions under which it was accepted.

### 13.3 Plan for change

Re-evaluation may be necessary when:

- The model or provider version changes.
- Pricing or access terms change materially.
- The workload or traffic pattern changes.
- Evaluation results reveal previously unknown failure modes.
- The deployment environment changes.
- A dependency becomes unavailable.
- A security, governance, or compliance requirement changes.
- A new candidate provides a material improvement.

Re-evaluation does not always require a full selection exercise. The scope should be proportional to the change and its potential impact.

### 13.4 Preserve a fallback strategy

Where availability, safety, or business continuity requires it, define what happens if the selected candidate becomes unavailable or fails acceptance criteria.

A fallback might be another validated candidate, a reduced-capability mode, a queue for deferred processing, or a controlled failure path. The appropriate strategy depends on the workload and its requirements.

A fallback should not be assumed equivalent to the primary model. Validate its behavior against the requirements that matter for the fallback scenario.

## 14. Engineering Decision Workflow

The following workflow combines the frameworks into one practical sequence.

1. **Characterize the workload.** Define the intended use, measurable requirements, and operational context.
2. **Establish mandatory gates.** Identify non-negotiable quality, data, latency, deployment, and governance requirements.
3. **Build the candidate shortlist.** Include candidates with plausible capability and ecosystem fit.
4. **Collect comparable evidence.** Evaluate candidates under common conditions where practical and document limitations where not.
5. **Assess eligibility.** Classify each candidate as eligible, ineligible, or eligibility unconfirmed.
6. **Remove dominated candidates.** Where the evidence supports a valid comparison, identify candidates that are inferior across the relevant objectives.
7. **Compare remaining candidates.** Use a weighted framework when priorities are explicit, a Pareto analysis when trade-offs remain, and risk analysis when uncertainty or failure consequences matter.
8. **Test sensitivity.** Determine whether the decision depends on fragile weights, cost assumptions, or unresolved dependencies.
9. **Validate the complete solution.** Confirm that the selected model, integration, deployment approach, and operational plan can satisfy the requirements.
10. **Document and approve.** Record the rationale, alternatives, evidence limitations, residual risks, fallback, and re-evaluation triggers.

The workflow should be proportionate to the decision's impact. Avoid building a complex scoring model when a simple eligibility comparison is sufficient. Conversely, do not rely on informal intuition when a high-impact decision has multiple competing objectives and material risks.

## 15. Interview and Design Discussion Questions

1. Why should eligibility be evaluated before weighted ranking?
2. Under what conditions is a weighted scoring model useful, and when can it mislead?
3. Explain Pareto dominance using a model-selection example.
4. How would you choose between a higher-quality, higher-cost candidate and a lower-cost candidate that still meets requirements?
5. What should happen when a candidate's eligibility is unconfirmed but its measured quality is the highest?
6. How would you detect double-counting in a multi-criteria decision model?
7. Why might a small difference in evaluation scores be insufficient to justify a selection?
8. How would you test whether a ranking depends too heavily on the chosen weights?
9. When should an adaptation-based candidate be compared using measured performance rather than projected performance?
10. How would you preserve the original decision rationale when model versions or prices change?
11. What information should be recorded so that another engineer can review the selection independently?
12. Describe a situation where the correct outcome is to defer the decision rather than declare a winner.

Strong answers should explain the constraints, evidence, alternatives, assumptions, and consequences—not simply name a preferred model.

## 16. Quick Revision

- Establish mandatory eligibility constraints before ranking candidates.
- Keep eligible, ineligible, and eligibility-unconfirmed states distinct.
- Ensure the evidence is adequate for the decision being made.
- Use constraint-first selection for hard requirements.
- Use weighted scoring when priorities are explicit and criteria are comparable.
- Exclude confirmed mandatory failures from the eligible weighted ranking.
- Use Pareto analysis to identify dominated candidates without inventing weights.
- Use risk-adjusted analysis when uncertainty and failure consequences matter.
- Avoid double-counting criteria and mixing incompatible scales.
- Test whether reasonable changes in weights and assumptions alter the decision.
- Keep measured capability separate from projected improvement.
- Evaluate the complete solution, including deployment and operational responsibilities.
- Document the selection rationale, residual risk, fallback, and re-evaluation triggers.

## 17. Key Takeaways

Model selection is a constrained engineering decision, not a contest to find the highest benchmark score.

A defensible decision first establishes which candidates can satisfy the mandatory requirements. It then compares viable candidates using appropriate evidence, explicit objectives, and a transparent treatment of trade-offs and uncertainty.

Weighted scores can organize preferences, Pareto analysis can eliminate dominated candidates, and risk analysis can expose fragile assumptions. None of these techniques replaces engineering judgment or resolves a mandatory constraint by itself.

**The best model is the candidate that satisfies the workload's requirements and provides the strongest justified overall trade-off for the complete solution—not necessarily the model that wins on any single metric.**

The final recommendation should be explainable, evidence-backed, proportionate to the decision's risk, and revisitable when its assumptions change.

## 18. Further Reading

Consult the relevant authoritative documentation and preceding chapters when applying this framework:

- LLM-08 for evaluation evidence, benchmark comparability, experimental design, and statistical interpretation.
- LLM-09 for adaptation and optimization feasibility.
- The preceding LLM-10 chapters for requirements, candidate shortlisting, evidence, cost, ecosystem fit, and adaptation dependencies.
- Production AI Engineering documentation for deployment and operational acceptance.
- Enterprise AI Systems documentation for governance, security, and compliance constraints.

