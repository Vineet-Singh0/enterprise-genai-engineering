# Cost, Latency, and Total Cost of Ownership

## 1. Learning Objectives

After completing this chapter, you should be able to:

- Compare model costs using a defined workload rather than headline pricing alone.
- Distinguish input, output, cached-input, and other applicable usage charges.
- Estimate cost per request, successful task, user, and business outcome.
- Analyze latency using workload-relevant measurements and service-level targets.
- Understand the relationship between model quality, latency, throughput, and cost.
- Identify hidden and indirect costs that influence the economics of model selection.
- Construct a transparent total cost of ownership (TCO) estimate.
- Compare candidates using explicit assumptions, sensitivity analysis, and break-even reasoning.
- Communicate economic trade-offs without presenting uncertain estimates as guaranteed outcomes.

## 2. Prerequisites

This chapter builds on:

- **Chapter 01 — Requirements and Workload Characterization:** mandatory constraints, workload volumes, operating conditions, and acceptance criteria.
- **Chapter 02 — Model Capability Fit and Candidate Shortlisting:** selecting technically plausible candidates before comparing their economics.
- **Chapter 03 — Evaluation Evidence for Model Selection:** interpreting measurements and understanding the limitations of available evidence.
- **LLM-05 — Inference and Text Generation:** generation behavior and factors influencing inference latency.
- **LLM-08 — Language Model Evaluation and Benchmarking:** controlled measurements and reproducible comparisons.
- **LLM-09 — Language Model Optimization and Adaptation:** optimization choices that may change the cost-performance profile.

These dependencies are referenced rather than retaught. This chapter focuses on using cost and performance evidence to make model-selection decisions.

## 3. Estimated Reading Time

45–60 minutes, excluding the practical exercise.

## 4. The Engineering Problem

A model can be inexpensive per token and still be expensive to operate. Another model may cost more per request but resolve more tasks successfully, require fewer retries, or eliminate additional processing steps.

The selection question is therefore not simply:

> Which model has the lowest price?

It is:

> Which eligible model meets the workload's quality and performance requirements at an acceptable total operating cost, under explicitly stated assumptions?

Consider a hypothetical support-assistant workload:

- Candidate A has a lower usage price but frequently produces outputs that need correction.
- Candidate B has a higher usage price but satisfies the task requirements more consistently.
- Candidate C has a low self-hosted inference cost but requires dedicated infrastructure, operational ownership, and capacity planning.

A price comparison alone cannot establish which candidate is economically preferable.

The decision must account for the complete workload, including how requests are processed, how much work is performed, how quickly results are delivered, and what infrastructure and operational responsibilities are required.

## 5. Cost, Latency, and TCO Are Different Dimensions

### 5.1 Unit price

Unit price is the rate charged for a particular resource or usage unit.

Examples include:

- Price per million input tokens.
- Price per million output tokens.
- Price per request.
- Price per image, audio unit, or other supported operation.
- Compute cost per hour for self-hosted inference.
- Storage or network charges for associated services.

Unit price describes the cost of a resource unit. It does not describe the cost of completing a business task.

### 5.2 Observed workload cost

Observed workload cost measures the expenditure associated with processing a defined workload under specified conditions.

It depends on factors such as:

- Number of requests.
- Input and output sizes.
- Model-specific usage rates.
- Retries and repeated attempts.
- Additional model calls.
- Routing and fallback behavior.
- Infrastructure utilization.
- Other services required to process requests.

The same model can have very different economics across two applications because the applications consume different amounts of resources.

### 5.3 Latency

Latency measures how long an operation takes from a defined starting point to a defined completion point.

For a user-facing request, this might mean the elapsed time between receiving a request at the application boundary and returning a complete response.

For a streaming application, useful measurements may include:

- Time to first token.
- Time to first meaningful output.
- Inter-token latency.
- Time to completion.

Latency must be measured at a clearly defined boundary. Model generation time is not necessarily the same as end-to-end application latency.

### 5.4 Total cost of ownership

Total cost of ownership considers the costs required to operate a solution over a defined period and scope.

Depending on the deployment model, this may include:

- Model API usage or inference infrastructure.
- Application and orchestration compute.
- Storage, networking, and observability.
- Engineering implementation and maintenance.
- Capacity planning and reliability engineering.
- Security and compliance requirements.
- Evaluation, testing, and regression analysis.
- Human review and correction.
- Operational support and incident response.

TCO is not a universal fixed formula. It is a scoped accounting model. Its usefulness depends on whether the included cost categories match the actual decision.

**Accounting rule:** Every material cost must be counted once in the total. If one infrastructure estimate already includes application compute, accelerator costs, or monitoring, those costs must not be added again as separate line items. If shared costs are allocated across workloads, document the allocation method.

## 6. Define the Economic Comparison Before Calculating

### 6.1 Establish the comparison scope

Record the following before estimating costs:

| Dimension | Questions to answer |
|---|---|
| Workload | What requests or tasks are being processed? |
| Volume | How many requests are expected per day, month, or year? |
| Traffic shape | Is demand steady, seasonal, or bursty? |
| Request size | What are the expected input and output sizes? |
| Quality requirement | What constitutes a successful task? |
| Latency target | What response-time target must be met? |
| Availability | What reliability target is required? |
| Deployment model | Hosted API, self-hosted model, or hybrid? |
| Evaluation period | What time horizon is being compared? |
| Cost boundary | Which direct and indirect costs are included? |

A comparison that uses different request volumes, quality criteria, or service boundaries can produce misleading conclusions.

### 6.2 Separate hard constraints from preferences

Some economic and performance conditions are eligibility constraints rather than optimization preferences.

Examples:

- A maximum permitted monthly expenditure.
- A required p95 latency below a defined threshold.
- A mandatory data-residency condition.
- A minimum task-success rate.
- A required availability level.

A candidate that violates a mandatory constraint should not automatically win because its average cost is lower.

First establish eligibility and capability fit. Then compare the economics of candidates that remain plausible under the required conditions.

When evaluating candidates, record the actual thresholds and their evidence. Do not rely on statements such as "meets the latency requirement" without identifying the requirement being applied.

### 6.3 Define the unit of value

Choose a denominator that reflects the decision being made.

Possible units include:

- Cost per request.
- Cost per successful task.
- Cost per active user per month.
- Cost per document processed.
- Cost per completed workflow.
- Cost per accepted answer.
- Cost per business transaction.

Cost per request is useful for estimating expenditure, but cost per successful task is often more useful when candidates differ in quality or recovery requirements.

## 7. Estimate Usage-Based Model Costs

Hosted model APIs commonly charge according to usage units, although exact billing dimensions and rates depend on the provider, model, and service plan.

Always use the applicable published pricing and billing rules for the candidate being evaluated. Pricing may change, and not every provider uses the same charging structure.

### 7.1 Basic token-cost model

For a simplified model with input and output token charges:

\[
C_{\text{usage}} =
\frac{N_{\text{in}}}{10^6}P_{\text{in}} +
\frac{N_{\text{out}}}{10^6}P_{\text{out}}
\]

Where:

- \(N_{\text{in}}\) is the number of billed input tokens.
- \(N_{\text{out}}\) is the number of billed output tokens.
- \(P_{\text{in}}\) is the price per million input tokens.
- \(P_{\text{out}}\) is the price per million output tokens.

This is a simplified model. Apply additional terms when the provider charges separately for cached input, tools, images, audio, or other operations.

### 7.2 Calculate from average request usage

Suppose a hypothetical hosted model has these illustrative rates:

- Input: $0.50 per million tokens.
- Output: $2.00 per million tokens.
- Average request: 2,000 billed input tokens and 500 billed output tokens.

The estimated model usage cost per request is:

\[
C_{\text{request}} =
\frac{2000}{10^6}(0.50) +
\frac{500}{10^6}(2.00)
\]

\[
C_{\text{request}} = \$0.002
\]

For 100,000 requests with the same usage profile:

\[
C_{\text{monthly usage}} =
100{,}000 \times \$0.002 = \$200
\]

This estimate covers only the stated input and output usage charges. It does not include retries, additional model calls, application infrastructure, or other services.

These rates and volumes are illustrative, not current provider quotes.

### 7.3 Use distributions rather than averages alone

Average token usage is useful for initial planning, but it may hide expensive workloads.

For example, an application may process mostly short requests with occasional large document-analysis requests. The average could look inexpensive while a small percentage of requests accounts for a large fraction of expenditure.

Inspect:

- Median input and output sizes.
- Upper-percentile input and output sizes.
- Frequency of unusually large requests.
- Differences across task types.
- Usage by customer or feature.
- Changes in usage over time.

Where practical, estimate costs using representative workload samples or workload segments rather than multiplying a single average across every request.

### 7.4 Account for all model calls

A single user request may trigger multiple model operations.

For example:

1. A classification call determines the request type.
2. A primary generation call produces the answer.
3. A verification call checks the result.
4. A fallback call runs when the primary candidate fails.

The total model usage cost is the sum of all billable operations associated with the request.

\[
C_{\text{request}} =
\sum_{i=1}^{k} C_{\text{model call},i}
\]

This includes applicable retries and fallback calls. If an operation is skipped under certain conditions, use its actual frequency rather than assuming every request incurs every call.

### 7.5 Account for cached usage correctly

Some services offer different rates for cached input or other reusable processing. Caching can reduce costs when the workload satisfies the provider's caching rules.

Do not assume that:

- Every repeated prompt qualifies for discounted billing.
- Application-level response caching is equivalent to provider-side prompt caching.
- Cached content has no storage, invalidation, or correctness cost.
- Cache hit rates remain constant as traffic and request composition change.

Model the expected billed usage using the provider's actual rules and the workload's measured or justified cache-hit assumptions.

## 8. Compare Cost per Successful Task

A model that costs less per attempt can cost more per successful outcome.

### 8.1 Cost when every task is attempted once

Suppose each task receives exactly one attempt. Let:

- \(C_{\text{attempt}}\) be the average cost of that attempt.
- \(p\) be the observed probability of task success.
- \(N\) be the number of attempted tasks.

The expected number of successful tasks is:

\[
E[S] = Np
\]

The expected total attempt cost is:

\[
E[C_{\text{total}}] = NC_{\text{attempt}}
\]

The ratio of expected cost to expected successful tasks is:

\[
C_{\text{success, one attempt}} =
\frac{C_{\text{attempt}}}{p}
\]

This is a ratio of expected quantities under the stated model, not a guarantee about the realized cost of a finite batch.

For example, if an attempt costs $0.002 and the success rate is 80%, the ratio is:

\[
\frac{\$0.002}{0.80} = \$0.0025
\]

This measures model attempt expenditure per expected successful task. Failed tasks still consume cost, and some tasks remain unsuccessful.

### 8.2 Cost when attempts continue until success

Now consider a different system: unsuccessful tasks are retried independently until one succeeds.

If every attempt costs \(C_{\text{attempt}}\), every attempt has the same success probability \(p\), and retries continue without a limit, the expected number of attempts until success is \(1/p\).

Therefore:

\[
E[C_{\text{success}}] =
\frac{C_{\text{attempt}}}{p}
\]

The numerical expression resembles the one-attempt ratio, but the operational interpretation differs:

- With one attempt, some tasks remain unsuccessful.
- With retries until success, the model assumes eventual completion and an expected number of attempts of \(1/p\).

The second model does not account for retry limits, correlated failures, changing attempt costs, or tasks that cannot be completed. Real systems should model those behaviors explicitly.

### 8.3 Extend the calculation to recovery costs

A more complete estimate may include validation, human review, correction, and escalation.

If \(C_{\text{recovery}}\) is the average additional cost per attempted task, a simplified ratio is:

\[
C_{\text{success}} =
\frac{C_{\text{attempt}} + C_{\text{recovery}}}{p}
\]

Use this expression only when the recovery cost is defined consistently per attempt and the assumptions behind the success probability are appropriate. Do not add a recovery cost that is already included in the attempt cost.

For workflows with different recovery paths, estimate the expected cost across those paths using their probabilities and costs.

### 8.4 Treat error severity separately from success rate

A single aggregate success rate can hide differences in failure impact.

For example, a formatting error and an incorrect financial calculation may both count as failures, but their business consequences are not equivalent.

For critical tasks, compare:

- Overall task-success rate.
- Critical-category failure rate.
- Human-review requirements.
- Rework and escalation costs.
- Expected impact of unacceptable errors.

Do not assign arbitrary monetary values to serious errors merely to make candidates comparable. Where risk cannot be credibly monetized, retain it as a separate decision criterion or mandatory constraint.

## 9. Understand Latency at the Right Boundary

### 9.1 End-to-end latency

A request may pass through several stages:

1. Client-to-service communication.
2. Authentication and request validation.
3. Retrieval or preprocessing.
4. Queueing and routing.
5. Model inference.
6. Tool execution or additional model calls.
7. Post-processing and output validation.
8. Response delivery.

End-to-end latency depends on the entire path, not just the model's generation speed.

A faster model may not materially improve the user experience if retrieval, network transfer, queueing, or tool execution dominates the request duration.

### 9.2 Define the latency metric

Use the metric that matches the application requirement.

| Metric | What it helps explain |
|---|---|
| Time to first token | How quickly streaming output begins |
| Time to first meaningful output | When the user first receives useful information |
| Inter-token latency | How quickly successive tokens arrive |
| Time to completion | How long the full response takes |
| End-to-end latency | Total time across the defined application boundary |
| Queueing delay | Time spent waiting before execution |
| Timeout rate | Fraction of requests that exceed the permitted duration |

For non-streaming applications, time to completion may be the primary user-facing metric. For streaming applications, time to first useful output and inter-token behavior may be equally important.

Define precisely what each timestamp represents. Comparing different measurement boundaries produces unreliable conclusions.

### 9.3 Why averages are insufficient

Suppose two candidates have the same average latency but different tail behavior.

- Candidate A usually responds quickly but occasionally becomes extremely slow.
- Candidate B has slightly higher typical latency but a more predictable response time.

If the application has a strict user-facing latency target, Candidate B may be operationally preferable.

Measure distributions and relevant percentiles, such as:

- p50: median latency.
- p95: latency at the 95th percentile.
- p99: latency at the 99th percentile.

A p95 latency of 2 seconds means approximately 95% of measured requests completed in 2 seconds or less under the measurement conditions, subject to the precise percentile calculation and dataset.

It does not mean every request finishes within 2 seconds.

### 9.4 Distinguish latency from throughput

Latency describes the time taken by an operation. Throughput describes the amount of work completed per unit of time.

A system can exhibit low latency at light traffic but degrade under heavy concurrent load because of:

- Queueing.
- Provider rate limits.
- Resource contention.
- Insufficient inference capacity.
- Connection-pool limits.
- Shared infrastructure bottlenecks.

A model-selection test that sends requests sequentially at low volume may not reveal the behavior of a production workload with substantial concurrency.

Measure candidates under a workload that resembles expected operating conditions.

### 9.5 Include streaming and concurrency assumptions

Latency comparisons should document:

- Whether requests are sequential or concurrent.
- Whether streaming is enabled.
- Input and output token distributions.
- Model and service versions.
- Geographic and network conditions.
- Warm-up and cold-start conditions, where applicable.
- Rate-limit behavior.
- Queueing and retry policies.
- Measurement period and sample size.

These conditions influence the interpretation of the results. A latency measurement without its conditions is weak selection evidence.

## 10. Analyze the Cost–Latency–Quality Trade-off

### 10.1 Why the dimensions interact

Cost, latency, and quality are related, but they should not be collapsed into one metric without a defensible reason.

Possible relationships include:

- A model with a higher output-token price may generate a shorter answer.
- A smaller model may reduce inference cost but require more retries or validation.
- A larger model may improve task success but increase generation time.
- A faster candidate may need a separate verification step.
- A candidate with a low per-request cost may require additional infrastructure to meet throughput targets.

These are workload-dependent possibilities, not universal properties of particular model sizes or deployment types.

### 10.2 Use constraints before weighted scoring

A defensible comparison often follows two stages.

**Stage 1: Apply hard constraints.**

Remove or flag candidates that cannot satisfy mandatory requirements, such as minimum quality, maximum latency, budget ceilings, or deployment restrictions.

**Stage 2: Compare trade-offs among eligible candidates.**

For remaining candidates, evaluate cost, latency, quality, operational complexity, and other preferences.

A weighted score can be useful when the organization has agreed on defensible weights and the underlying measurements are comparable. However, a weighted score can conceal an unacceptable weakness in one dimension.

Do not let an excellent cost score compensate for a violated mandatory security, quality, or latency requirement.

### 10.3 Identify dominated candidates

Candidate A dominates Candidate B under a defined set of objectives when A is no worse on every compared objective and strictly better on at least one, assuming both satisfy the relevant constraints and the metrics are comparable.

For example, if two candidates provide equivalent acceptable quality and meet the same constraints, but one has both lower cost and lower latency, the other may be dominated for that workload.

Dominance is conditional on the dimensions considered. A candidate that appears dominated on cost and latency may still offer a meaningful advantage in privacy, deployment control, or another unmeasured requirement.

Do not declare a candidate universally inferior based on a partial comparison.

### 10.4 Treat quality thresholds as gates when appropriate

Some workloads require a minimum acceptable quality level rather than a continuous quality–cost exchange.

For example, a model that falls below the minimum acceptable accuracy on a critical task should not become the preferred candidate merely because it is substantially cheaper.

When a threshold is a genuine business or safety requirement, enforce it as a constraint. Use cost optimization only among candidates that satisfy it.

## 11. Hosted APIs, Self-Hosting, and Hybrid Economics

Deployment models shift cost categories rather than eliminating them.

### 11.1 Hosted API economics

Potential cost categories include:

- Input and output usage.
- Other billable model operations.
- Application compute.
- Retrieval, storage, and networking.
- Monitoring and evaluation.
- Provider-specific commitments or minimum charges, where applicable.
- Engineering work for integration, routing, and reliability.

Advantages may include reduced responsibility for inference infrastructure and the ability to scale usage without managing model-serving hardware directly.

However, actual economics depend on the provider's pricing, usage pattern, service limits, and operational requirements.

### 11.2 Self-hosted inference economics

Potential cost categories include:

- GPU or other accelerator capacity.
- CPU, memory, and storage.
- Idle and reserved capacity.
- Model loading and deployment.
- Autoscaling and capacity management.
- Networking and supporting infrastructure.
- Monitoring, patching, and incident response.
- Engineering ownership and operational support.
- Optimization, evaluation, and regression testing.

A low marginal inference cost does not imply low total cost. Dedicated capacity can remain expensive when utilization is low, and reliable service requires more than running a model once.

### 11.3 Hybrid economics

A hybrid system may use different candidates for different workloads.

For example:

- A lower-cost candidate handles routine requests.
- A stronger candidate handles difficult or high-value tasks.
- A fallback model handles selected failures.
- Human review handles cases that cannot safely be automated.

The economic result depends on routing accuracy, workload distribution, fallback frequency, and the cost of additional orchestration.

A hybrid architecture can improve economics, but it can also increase complexity and create additional failure paths.

### 11.4 Compare equivalent service boundaries

When comparing a hosted API against self-hosting, define which responsibilities belong inside the cost model.

For example, comparing API charges against GPU rental alone omits application operations, engineering ownership, reliability work, and other relevant costs.

Likewise, a comparison should not count the full shared infrastructure cost against one model if that infrastructure also supports unrelated workloads, unless the allocation method explicitly justifies doing so.

**Avoid double-counting:** Define each cost line item so that it represents a distinct expense. If an infrastructure quote already bundles compute, storage, and networking, either retain the bundled total or separate its components—not both. If application compute is already included in a platform charge, do not add it again.

When shared infrastructure supports several workloads, choose a defensible allocation basis, such as measured resource consumption or reserved capacity. Record the basis and use it consistently across candidates.

### 11.5 Treat deployment-specific costs correctly

Some cost categories are alternatives rather than additive costs.

For example:

- A hosted model's usage charges generally represent payment for model service and inference supplied by the provider.
- A self-hosted model requires the organization to account for the infrastructure and operations used to serve the model.

A hybrid architecture may legitimately incur both hosted usage charges and self-hosted infrastructure costs, but only for the corresponding portions of the workload.

Do not add a hypothetical self-hosted accelerator bill to a hosted API estimate unless the evaluated architecture actually uses both.

## 12. Construct a Total Cost of Ownership Model

### 12.1 Define the time horizon

TCO should be calculated over a stated period, such as one month, one year, or the expected life of a project.

The chosen period affects the treatment of:

- One-time implementation work.
- Recurring infrastructure.
- Maintenance.
- Model migrations.
- Contract commitments.
- Capacity expansion.
- Decommissioning.

Do not compare a one-time implementation cost for one candidate against a recurring operating cost for another without accounting for both over a consistent horizon.

### 12.2 Identify cost categories

A practical TCO worksheet can include the following categories.

| Category | Example cost drivers |
|---|---|
| Model usage or inference | Tokens, requests, compute capacity |
| Application compute | API servers, workers, orchestration |
| Supporting services | Retrieval, databases, storage, network |
| Observability | Logs, traces, metrics, retained data |
| Evaluation | Test execution, datasets, regression runs |
| Engineering | Integration, optimization, maintenance |
| Reliability | Redundancy, incident response, recovery |
| Human operations | Review, correction, escalation |
| Migration and change | Revalidation, compatibility, switching work |
| Governance and security | Required controls and assurance activities |

Not every workload requires every category. Include the categories that materially apply to the decision, and explain exclusions that could change the conclusion.

### 12.3 Make the accounting boundary explicit

Before summing costs, define the scope and prevent overlapping line items.

For each cost item, record:

- What the item includes.
- Whether it is fixed, variable, stepwise, or mixed.
- The period covered.
- The source of the estimate.
- Whether the amount is incremental or shared.
- The allocation method for shared costs.
- Any other cost line that already includes the same expense.

For example, an all-inclusive hosting estimate should not be added to separate estimates for components already covered by that hosting estimate.

A useful rule is:

> Every expense must have one accountable place in the TCO calculation, with any shared allocation documented and reconciled.

This does not mean every cost must be billed separately. A bundled price is acceptable when its scope is clear.

### 12.4 Separate fixed and variable costs

Fixed costs do not change proportionally with each additional request within the relevant operating range. Variable costs generally increase with workload volume.

Examples of potentially fixed or stepwise costs:

- Base infrastructure capacity.
- Initial integration work.
- Minimum service commitments.
- Baseline monitoring.
- Engineering support.

Examples of variable costs:

- Token consumption.
- Per-request charges.
- Storage growth.
- Network transfer.
- Human review proportional to workload.

Some costs are stepwise rather than smoothly variable. For example, a workload increase may require an additional server or accelerator before the next capacity increment.

A useful model distinguishes these behaviors instead of assuming every cost scales linearly.

### 12.5 Basic TCO model

For a defined period:

\[
\begin{aligned}
TCO ={}&
C_{\text{model}} +
C_{\text{application}} +
C_{\text{infrastructure}} \\
&+ C_{\text{supporting services}} +
C_{\text{operations}} \\
&+ C_{\text{human work}} +
C_{\text{other included costs}}
\end{aligned}
\]

This is an accounting framework, not a claim that every organization should use exactly these categories.

The terms must be mutually exclusive or reconciled through documented allocation rules. The equation is not permission to add overlapping bills together.

For multi-period comparisons, distinguish nominal totals from discounted lifecycle costs if the time value of money is material to the decision.

### 12.6 Estimate unit economics

Once the TCO scope is established, derive a relevant unit cost.

For a workload that produces \(N\) completed tasks during the period:

\[
C_{\text{per completed task}} =
\frac{TCO}{N}
\]

For a workload with \(S\) successful tasks:

\[
C_{\text{per successful task}} =
\frac{TCO}{S}
\]

These ratios are meaningful only if the numerator and denominator use the same period and scope. They should not be interpreted as pure model costs if TCO includes shared platform or organizational costs.

For systems with several task types, calculate unit economics by task category when a single blended average would hide important differences.

## 13. Break-Even Analysis and Sensitivity

A point estimate is rarely enough for a model-selection decision. The preferred candidate may change when workload volume, utilization, token usage, or quality changes.

### 13.1 Compare fixed and variable costs

Consider two hypothetical options:

- Option A: a hosted service with negligible setup cost and a variable cost of $0.004 per request.
- Option B: a self-hosted deployment with a monthly fixed cost of $1,200 and a variable cost of $0.001 per request.

Ignoring all other costs for this simplified example:

\[
C_A(N) = 0.004N
\]

\[
C_B(N) = 1200 + 0.001N
\]

The break-even volume occurs when:

\[
0.004N = 1200 + 0.001N
\]

\[
N = \frac{1200}{0.003} = 400{,}000
\]

Under these assumptions, the two options have equal modeled costs at 400,000 requests per month.

Below this volume, Option A has the lower modeled cost. Above it, Option B has the lower modeled cost.

This is not a general rule that self-hosting becomes cheaper at a particular volume. The example excludes quality differences, engineering, spare capacity, operational risk, and other costs. Including those factors can change the break-even point or eliminate it.

### 13.2 Test sensitivity to workload assumptions

At minimum, examine how the decision changes when these variables change:

- Request volume.
- Average and upper-percentile token usage.
- Output length.
- Success rate.
- Retry and fallback frequency.
- Peak concurrency.
- Required capacity headroom.
- Human-review rate.
- Infrastructure utilization.
- Provider pricing or contractual terms.

Use plausible ranges grounded in observed data, contractual information, or explicit planning assumptions.

Do not choose a narrow range merely because it preserves the preferred candidate.

### 13.3 Use scenarios

A scenario analysis may include:

- **Low workload:** conservative adoption or limited traffic.
- **Expected workload:** the current best estimate.
- **High workload:** growth or peak demand.
- **Adverse scenario:** increased usage, degraded quality, lower utilization, or higher recovery cost.

For each scenario, recalculate total cost, unit economics, latency compliance, and capacity requirements.

A candidate that wins only under one optimistic assumption may be less attractive than a candidate that remains acceptable across a reasonable range.

### 13.4 Separate known values from assumptions

Label model inputs clearly.

| Input type | Example |
|---|---|
| Observed | Measured token distribution from representative traffic |
| Published | Current provider price for the selected model |
| Contractual | Agreed committed-use rate |
| Estimated | Expected monthly request volume |
| Assumed | Forecast utilization for a new deployment |
| Unknown | Future price changes or unmeasured production behavior |

The cost model should make uncertainty visible. A calculated result does not become reliable merely because the arithmetic is correct.

## 14. Practical Lab: Compare Two Candidate Economics

### Scenario

You are selecting a model for a hypothetical internal knowledge assistant.

The application has these mandatory requirements:

- **Minimum task-success rate:** 90%, measured using a common application-level acceptance rubric on a representative evaluation set.
- **Maximum p95 end-to-end latency:** 3.0 seconds, measured under the defined representative load test.
- Both candidates must satisfy these requirements before their economics are compared.

The two candidates have passed the initial capability screening, and their reported results satisfy the illustrative thresholds above. In a real selection exercise, these results would need to be supported by the evaluation evidence record, including test conditions, sample characteristics, and model versions.

Use the following illustrative inputs:

| Input | Candidate A | Candidate B |
|---|---:|---:|
| Input price per million tokens | $0.50 | $1.00 |
| Output price per million tokens | $2.00 | $4.00 |
| Average billed input tokens per request | 2,000 | 1,800 |
| Average billed output tokens per request | 500 | 400 |
| Observed task-success rate | 92% | 97% |
| Measured p95 end-to-end latency | 2.8 seconds | 2.2 seconds |

Assume a monthly volume of 100,000 attempted tasks.

For the base case, assume:

- Each task makes exactly one model attempt.
- No retries or fallback calls occur.
- There are no discounts or additional billable operations.
- The listed success rates are measured using the same acceptance criteria.
- Supporting application and infrastructure costs are equal and can initially be excluded from the direct model-usage comparison.
- The stated average token usage applies to the modeled workload.

These assumptions define the one-attempt base case. A separate retry scenario is introduced in Task 2.

### Task 1: Calculate one-attempt usage cost

For each candidate, calculate:

1. Input cost per attempt.
2. Output cost per attempt.
3. Total model usage cost per attempt.
4. Monthly model usage cost at 100,000 attempts.
5. Expected number of successful tasks and the cost-to-expected-successful-task ratio.

Show formulas and units. Do not compare only the input-token price.

### Task 2: Model retries as a separate scenario

Now analyze a different system in which unsuccessful tasks are retried independently until success.

For this scenario, assume:

- The success probability remains constant across attempts.
- Attempts are independent.
- Every attempt has the same cost and success probability.
- Retries continue until success without a maximum retry limit.
- No additional recovery costs are included.

Calculate the expected number of attempts and expected model usage cost per successful task for each candidate.

Then explain why this result describes a different operating policy from Task 1, even though the simplified ratio of cost per attempt to success probability appears in both calculations.

Finally, identify at least two real-world conditions that would invalidate or materially change this simplified retry model.

### Task 3: Interpret latency

Candidate B has lower measured p95 latency despite its higher token rates.

Explain why this does not establish that Candidate B will be faster in every production environment. Identify at least four conditions that must be held constant or recorded before treating the comparison as decision-grade evidence.

### Task 4: Expand the TCO

Identify at least five additional cost categories that should be investigated before approving either candidate for production.

For each category, state whether it is likely to be fixed, variable, stepwise, or dependent on the deployment model.

Also identify any cost categories that may already be included in another estimate. Explain how you would avoid counting the same expense twice.

### Task 5: Challenge the assumptions

Explain how your conclusion could change if:

- Candidate A requires a verification call more often.
- Candidate B produces substantially longer outputs in real traffic.
- Monthly volume doubles.
- The measured success rate does not generalize to the production workload.
- Candidate B's latency advantage disappears under peak concurrency.
- Self-hosted infrastructure estimates already include some of the supporting services listed in the TCO worksheet.

### Deliverable

Produce a short decision memo containing:

1. Workload and evaluation assumptions.
2. Calculated one-attempt usage costs.
3. Expected successful-task counts and cost ratios.
4. The separate retry scenario and its assumptions.
5. Latency evidence and its limitations.
6. Missing TCO inputs and potential overlaps.
7. Sensitivity scenarios.
8. A provisional recommendation with explicit conditions.

A defensible memo can conclude that more evidence is needed. Do not invent missing data to force a winner.

## 15. Common Engineering Mistakes

### Mistake 1: Selecting the model with the lowest published token rate

**Why it fails:** Published unit prices do not capture output volume, additional calls, recovery work, or quality differences.

**Better approach:** Estimate cost for the actual workload and a consistent successful outcome.

### Mistake 2: Treating average latency as the full performance story

**Why it fails:** Averages conceal tail latency, queueing, and occasional timeouts.

**Better approach:** Define measurement boundaries and compare relevant percentiles under representative load.

### Mistake 3: Comparing model latency with application latency

**Why it fails:** Retrieval, preprocessing, routing, network overhead, and post-processing may dominate the user experience.

**Better approach:** Record both component-level and end-to-end measurements when needed to diagnose the difference.

### Mistake 4: Assuming every request uses one model call

**Why it fails:** Production workflows may classify, retrieve, verify, retry, route, or fall back to other candidates.

**Better approach:** Measure or estimate the full call graph and the frequency of each path.

### Mistake 5: Treating a successful attempt as a successful business task

**Why it fails:** The output may still require correction, review, or rework.

**Better approach:** Define success using the same application-level acceptance criteria used for candidate evaluation.

### Mistake 6: Ignoring human effort

**Why it fails:** A lower model bill can be offset by additional review, correction, escalation, or support.

**Better approach:** Include material human-work costs in the TCO or keep them visible as a separate decision dimension.

### Mistake 7: Assuming self-hosting removes usage economics

**Why it fails:** Infrastructure, capacity headroom, idle resources, engineering ownership, and reliability requirements still cost money.

**Better approach:** Compare equivalent service boundaries and allocate shared costs transparently.

### Mistake 8: Treating break-even volume as a guarantee

**Why it fails:** The calculation depends on assumed fixed and variable costs, capacity utilization, workload composition, and quality.

**Better approach:** Use sensitivity analysis and validate the inputs before committing to a deployment strategy.

### Mistake 9: Combining every dimension into an opaque score

**Why it fails:** A weighted score can hide hard-constraint violations and obscure why a candidate wins.

**Better approach:** Apply mandatory constraints first, then use transparent comparisons for preferences and trade-offs.

### Mistake 10: Double-counting TCO costs

**Why it fails:** Bundled infrastructure, application compute, monitoring, and supporting services can overlap across estimates.

**Better approach:** Define each line item's scope, record allocation rules for shared costs, and reconcile the total before comparing candidates.

### Mistake 11: Treating cost estimates as timeless facts

**Why it fails:** Pricing, traffic, model behavior, contracts, and infrastructure requirements can change.

**Better approach:** Record the source, date, version, workload assumptions, and owner of each material estimate. Recalculate when those inputs change.

## 16. Production Perspective

In production, cost and latency are not one-time model-selection attributes. They are operating characteristics that must be observed and revisited.

A useful operational measurement set may include:

- Request volume and workload mix.
- Input and output token distributions.
- Model usage cost over time.
- Cost by feature, customer, or task category.
- Cost per accepted or successfully completed task.
- End-to-end latency percentiles.
- Timeout, retry, and fallback rates.
- Human-review and correction rates.
- Capacity utilization and queueing behavior.
- Changes in quality under production traffic.

The measurements should support investigation rather than merely produce dashboards. When cost increases, engineers should be able to determine whether the cause was traffic growth, longer prompts, longer outputs, additional calls, changed routing, or a pricing change.

Similarly, when latency deteriorates, the team should distinguish model behavior from queueing, retrieval, application overhead, and infrastructure saturation.

These operational practices belong to the broader production engineering domain. This chapter introduces the evidence needed for model selection and economic comparison without replacing PROD's treatment of monitoring, scaling, and reliability engineering.

### 16.1 Establish decision triggers

A selection decision may need to be revisited when:

- The workload grows beyond the evaluated range.
- Cost per successful task exceeds an agreed budget.
- A latency percentile violates its target.
- Quality changes on important workload segments.
- Pricing or contract terms change.
- A new candidate becomes available.
- Infrastructure utilization changes materially.
- New governance or deployment constraints emerge.

Triggers should be based on actual requirements and business context, not arbitrary universal thresholds.

### 16.2 Preserve the decision record

Record:

- Selected candidate and alternatives.
- Workload specification.
- Evaluation and performance evidence.
- Pricing sources and retrieval dates.
- TCO boundaries and calculation methods.
- Assumptions and uncertainties.
- Break-even analysis and scenarios.
- Mandatory constraints and accepted trade-offs.
- Cost-allocation rules where shared infrastructure is involved.
- Conditions that would trigger reconsideration.

This allows a future engineer to understand not only what was selected but why it was reasonable under the evidence available at the time.

## 17. Engineering Decision Framework

Use the following sequence when comparing candidate economics.

1. **Define the workload.** Establish request volume, workload mix, quality criteria, latency targets, and evaluation period.
2. **Confirm candidate eligibility.** Do not let a lower cost compensate for a mandatory requirement violation.
3. **Collect comparable evidence.** Align measurement boundaries, test conditions, versions, and acceptance criteria.
4. **Estimate direct usage costs.** Include input, output, and other applicable billable operations.
5. **Model the complete workflow.** Include additional calls, retries, fallbacks, and relevant recovery paths.
6. **Measure performance.** Use the latency and throughput metrics appropriate to the application.
7. **Build TCO.** Include material infrastructure, supporting services, engineering, and operational costs without overlapping line items.
8. **Calculate meaningful unit economics.** Use cost per successful task or another denominator aligned with business value.
9. **Run sensitivity analysis.** Test the assumptions most likely to change the result.
10. **Document the decision.** State the recommendation, supporting evidence, uncertainties, and reconsideration triggers.

The outcome is not necessarily the candidate with the lowest modeled cost. It is the candidate whose demonstrated capability and operating economics best satisfy the defined requirements within acceptable risk.

## 18. Interview Questions and Expected Reasoning

### Question 1: Why can a model with a lower token price have a higher cost per successful task?

**Expected reasoning:** The effective cost depends on the complete workload. Output volume, multiple model calls, retries, task-success rate, validation, and recovery work can outweigh a lower unit price.

### Question 2: What is the difference between latency and throughput?

**Expected reasoning:** Latency measures the elapsed time for an operation. Throughput measures the amount of work completed per unit of time. A system's behavior under concurrency can affect both.

### Question 3: Why should p95 latency be considered alongside average latency?

**Expected reasoning:** Average latency can hide slow tail behavior. A percentile provides evidence about the distribution, though it does not guarantee a maximum response time.

### Question 4: How would you compare a hosted API with a self-hosted model?

**Expected reasoning:** Define equivalent workload, service boundary, quality criteria, latency targets, and time horizon. Include usage or inference capacity, supporting infrastructure, operational ownership, reliability, engineering, and other material costs. Avoid double-counting bundled or shared costs. Evaluate utilization and sensitivity rather than assuming one model is inherently cheaper.

### Question 5: When is cost per successful task more informative than cost per request?

**Expected reasoning:** When candidates differ in task-success rates, retries, or recovery needs. It aligns cost with the outcome being purchased, provided success is defined consistently and the calculation includes relevant costs.

### Question 6: When should a weighted cost-quality-latency score be avoided?

**Expected reasoning:** When mandatory requirements must be enforced, metrics are not comparable, weights are arbitrary, or aggregation can conceal a critical failure. Apply hard constraints first.

### Question 7: What makes a TCO estimate decision-grade?

**Expected reasoning:** A defined scope and time horizon, traceable inputs, realistic workload assumptions, explicit fixed and variable costs, comparable service boundaries, mutually exclusive or reconciled cost line items, uncertainty analysis, and reproducible calculations.

### Question 8: When can a cheaper candidate be rejected?

**Expected reasoning:** When it violates mandatory quality, latency, reliability, security, deployment, or other requirements, or when its broader operating cost or risk makes it unsuitable.

### Question 9: Why are one-attempt cost ratios and retry-until-success estimates not interchangeable?

**Expected reasoning:** A one-attempt system may leave some tasks unsuccessful. A retry-until-success model assumes repeated independent attempts until completion. The formulas may produce the same ratio under simplified assumptions, but the operating policies and completion behavior differ.

## 19. Quick Revision

Before completing this chapter, ensure you can explain the following without relying on memorized definitions:

- Why unit price is not the same as workload cost.
- Why cost per successful task can be more useful than cost per request.
- Why retry and fallback behavior affect economics.
- Why a one-attempt system differs from retry-until-success.
- Why end-to-end latency differs from model inference latency.
- Why percentiles and concurrency matter in latency comparisons.
- Why fixed, variable, and stepwise costs need different treatment.
- Why hosted API and self-hosted comparisons need equivalent boundaries.
- How double-counting can distort TCO.
- How break-even analysis depends on assumptions.
- Why TCO estimates need sensitivity analysis and traceable inputs.
- Why mandatory requirements should be applied before weighted optimization.

## 20. Key Takeaways

1. **Compare economics against a defined workload and outcome**, not headline prices alone.
2. **Include all relevant model operations** when estimating request costs.
3. **Use cost per successful task when task completion differs across candidates**, while making the calculation assumptions explicit.
4. **Distinguish one-attempt economics from retry-until-success economics**, even when simplified formulas look similar.
5. **Measure latency at the boundary that matters to the user or system**, and examine distributions rather than averages alone.
6. **Distinguish latency from throughput** and test under representative concurrency.
7. **Build TCO over a consistent scope and time horizon**, including material supporting and operational costs.
8. **Count each expense once**, documenting allocation rules for shared costs and bundled services.
9. **Use break-even and sensitivity analysis** to expose assumptions that can change the preferred candidate.
10. **Apply mandatory constraints before optimizing preferences.**
11. **Preserve assumptions, evidence, and decision triggers** so the selection can be reviewed as conditions change.

## 21. Further Reading

Continue with these curriculum chapters:

- [LLM-10 README — Model Selection and Ecosystem Decisions](README.md)
- [Chapter 01 — Requirements and Workload Characterization](01-Requirements-and-Workload-Characterization.md)
- [Chapter 02 — Model Capability Fit and Candidate Shortlisting](02-Model-Capability-Fit-and-Candidate-Shortlisting.md)
- [Chapter 03 — Evaluation Evidence for Model Selection](03-Evaluation-Evidence-for-Model-Selection.md)
- [LLM-08 README — Language Model Evaluation and Benchmarking](../LLM-08-Language-Model-Evaluation-and-Benchmarking/README.md)
- [LLM-09 README — Language Model Optimization and Adaptation](../LLM-09-Language-Model-Optimization-and-Adaptation/README.md)

Use current provider pricing and billing documentation when preparing an actual estimate. Record the model or service version, applicable rates, date checked, and workload assumptions rather than treating illustrative calculations as current commercial terms.
