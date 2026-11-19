# Experimental Design and Statistical Interpretation

## 1. Purpose

Evaluating a language model produces observations: scores, pass rates, latency measurements, cost estimates, and failure counts.

The engineering challenge is determining what those observations actually support.

Suppose a team evaluates two model configurations and observes that the candidate achieves a higher task-success rate. Does this establish that the candidate is better? Could the difference result from random output variation, a small test sample, a change in evaluation conditions, or an unreliable measurement procedure?

These questions concern experimental design and statistical interpretation.

Experimental design defines how evidence will be collected so that a comparison can answer a specific question. Statistical interpretation determines how confidently the observed results support the intended conclusion.

This chapter explains how to:

- Formulate testable evaluation hypotheses.
- Identify experimental variables and potential confounders.
- Choose appropriate comparison designs.
- Understand variability in model outputs and evaluation results.
- Select statistical methods that fit the data and experimental design.
- Interpret uncertainty, p-values, and statistical significance.
- Distinguish statistical significance from practical importance.
- Avoid misleading conclusions from repeated experimentation.
- Communicate evidence and limitations in engineering decisions.

The central principle is:

> An observed difference is evidence to investigate, not automatically proof of a meaningful improvement.

## 2. From an Engineering Question to a Testable Hypothesis

An experiment should begin with a question that can be answered using observable evidence.

Consider a team evaluating a new model version for a customer-support assistant.

An informal question might be:

> Is the new model better?

This question does not specify what better means, which workload matters, or what evidence would justify adoption.

A more precise question is:

> Does the candidate model improve task-success rate on the versioned support benchmark without reducing the rate of correct abstention below the required threshold?

This question defines an outcome and a constraint.

### 2.1 Define the hypothesis

A hypothesis is a statement about an expected difference or relationship that can be evaluated using collected evidence.

For a model comparison, define:

- The baseline configuration.
- The candidate configuration.
- The target population or workload.
- The primary outcome.
- Any mandatory constraints.
- The conditions under which the result will be considered meaningful.

For example:

- **Primary outcome:** Task-success rate.
- **Secondary outcomes:** Correct abstention, schema compliance, and latency.
- **Mandatory constraint:** Correct abstention must remain above the specified minimum.
- **Comparison:** Candidate versus baseline on the same evaluation cases.

A useful hypothesis is specific enough that the experiment could produce evidence against it.

### 2.2 Null and alternative hypotheses

Statistical testing often expresses a comparison using a null hypothesis and an alternative hypothesis.

For a difference in task-success rates, a simple formulation is:

\[
H_0: p_B-p_A=0
\]

\[
H_1: p_B-p_A\ne 0
\]

Here, \(p_A\) and \(p_B\) represent the underlying task-success probabilities for the baseline and candidate under the defined evaluation conditions.

The null hypothesis represents no difference in the specified quantity. The alternative represents a difference.

If the engineering question is specifically whether the candidate improves performance, a one-sided alternative may be appropriate:

\[
H_1: p_B-p_A>0
\]

The choice between one-sided and two-sided testing should be made before inspecting the results and should follow the actual decision question. A one-sided test is not a legitimate way to disregard an unfavorable result after seeing the data.

**Important:** Failure to reject a null hypothesis does not establish that the candidates are equivalent. It may simply mean that the experiment lacks sufficient evidence to distinguish them.

If the decision requires demonstrating equivalence or non-inferiority, the experiment needs an appropriate design and predefined margin rather than interpreting a nonsignificant difference as proof of sameness.

## 3. Identify Experimental Variables

An experiment is interpretable only when the team understands what changed and what remained constant.

### 3.1 Independent variables

An independent variable is a factor deliberately varied to investigate its effect.

Examples include:

- Model version.
- Prompt template.
- Temperature or another generation parameter.
- Context construction strategy.
- Evaluator configuration.

The variable of interest depends on the experiment.

If the question concerns model-version performance, model version is the primary independent variable. If the question concerns prompt design, the prompt is the primary independent variable.

### 3.2 Dependent variables

A dependent variable is the measured outcome.

Examples include:

- Task-success rate.
- Exact-match accuracy.
- Correct-abstention rate.
- Judge-assigned quality score.
- Latency.
- Cost per successful task.

Choose the primary outcome based on the engineering decision, not simply because a metric is easy to collect.

### 3.3 Controlled variables

Controlled variables are conditions kept consistent to reduce alternative explanations for the observed results.

For a model comparison, these may include:

- Evaluation cases.
- System instructions.
- Input context.
- Output schema.
- Evaluation method.
- Generation parameters.
- Tool permissions.
- Execution conditions.

Chapter 07 explains how to establish controlled benchmark comparisons. This chapter focuses on why those controls matter for the interpretation of experimental results.

### 3.4 Confounding variables

A confounder is a factor that varies with the condition being compared and can provide an alternative explanation for the observed difference.

Suppose Model A is evaluated using short contexts on a lightly loaded server, while Model B receives longer contexts on a heavily loaded server.

A difference in latency cannot be attributed to the model alone. Context length and server load are alternative explanations.

Other potential confounders include:

- Different test-case difficulty.
- Different prompts or system instructions.
- Different judge versions.
- Different retry behavior.
- Changes to the benchmark during evaluation.
- Different sampling or stopping conditions.
- Provider-side model changes.

The goal is not to eliminate every conceivable source of variation. It is to identify and control the factors that could materially affect the conclusion.

## 4. Sources of Variability in Language Model Evaluation

Language-model evaluation introduces several forms of variability. They should not be treated as interchangeable because each requires a different response.

### 4.1 Variation across evaluation cases

Some inputs are inherently easier than others.

A model may perform well on direct factual questions but struggle with ambiguous instructions, conflicting evidence, or strict structured-output requirements.

The measured score depends partly on which cases are included.

**Engineering implication:** Use a suitable, documented evaluation set and inspect category-level outcomes. Chapter 02 covers dataset design and integrity.

### 4.2 Variation across repeated model runs

A model configuration may produce different outputs for the same input across repeated runs.

This may occur because of stochastic generation, provider-side behavior, or changes in the execution environment.

For example, one run might correctly abstain from answering an unsupported question, while another produces an unsupported claim.

Repeated runs can reveal instability that a single run would miss.

However, repeated runs of the same cases do not automatically provide independent evidence about the diversity of the real-world workload. They primarily provide information about run-to-run behavior under the tested conditions.

### 4.3 Variation in evaluation

The evaluator may also introduce variability.

Examples include:

- Human annotators interpreting a rubric differently.
- LLM judges assigning different scores to similar outputs.
- Reference labels containing errors.
- A metric changing because of normalization or preprocessing.
- An evaluation pipeline producing inconsistent results.

A model's measured quality is not more reliable than the measurement procedure used to estimate it.

Human-evaluation design is covered in Chapter 04, and automated evaluator validation is covered in Chapter 05.

### 4.4 Sampling variability

A benchmark usually contains a sample of possible inputs rather than every input the application could encounter.

Even if the evaluation procedure is fixed, another sample drawn from the same target population could produce a different score.

Sampling variability is one reason an observed percentage should not automatically be treated as the exact underlying performance of a model.

### 4.5 Measurement noise and environmental variation

Operational measurements can vary because of network conditions, shared infrastructure, caching, concurrency, and other environmental factors.

These sources are especially relevant to latency and throughput experiments.

Repeated measurements under documented conditions can help characterize variability. Simply collecting more measurements without controlling the environment may produce a more precise estimate of an inconsistent setup rather than a useful estimate of the intended system behavior.

## 5. Choose an Appropriate Experimental Design

The experimental design determines how candidates are evaluated and how the resulting observations can be compared.

### 5.1 Paired comparison

In a paired design, both candidates are evaluated on the same cases.

For each case \(i\), define the difference:

\[
d_i = s_{B,i}-s_{A,i}
\]

where \(s_{A,i}\) and \(s_{B,i}\) are the measured scores for the baseline and candidate on case \(i\).

The team can examine the distribution of these differences rather than comparing two unrelated collections of scores.

For binary task outcomes, the paired observations can show which cases:

- Both candidates pass.
- Both candidates fail.
- Only the baseline passes.
- Only the candidate passes.

The disagreement cases are especially informative because they identify where the candidates differ.

Paired designs are often appropriate for language-model benchmarking because they control for differences in test-case difficulty.

However, pairing does not remove every source of uncertainty. It also does not make repeated stochastic runs independent of one another.

### 5.2 Unpaired comparison

An unpaired design compares observations from different groups or independently sampled cases.

This may be necessary when the conditions cannot share the same cases, or when the research question concerns different populations.

The analysis must account for the fact that the groups may differ in composition. An apparent performance difference could result from differences between the evaluated groups rather than the candidate systems.

When paired evaluation is feasible and matches the decision question, it is generally preferable for direct candidate comparisons.

### 5.3 Repeated-run design

A repeated-run design evaluates the same configuration multiple times under specified conditions.

For example, a team might run selected prompts ten times per configuration to estimate output variability.

Repeated runs can answer questions such as:

- How often does the configuration produce a successful result?
- How stable are outputs across repeated requests?
- How much does latency vary under the tested conditions?
- Does a candidate's apparent improvement persist across runs?

The number of runs should be justified by the expected variability, decision importance, and cost of evaluation.

Do not treat every repeated output as an independent new benchmark case. Repeated runs on the same prompt share input characteristics and may share other sources of dependence.

### 5.4 Factorial and multi-factor experiments

Sometimes the team needs to understand interactions between multiple variables.

Suppose performance depends on both the model and the prompt template.

A useful design might evaluate:

| | Prompt A | Prompt B |
|---|---|---|
| Model A | Condition 1 | Condition 2 |
| Model B | Condition 3 | Condition 4 |

This design helps distinguish:

- The effect associated with the model change.
- The effect associated with the prompt change.
- Whether the effect of the prompt differs between models.

If only Model A with Prompt A and Model B with Prompt B are compared, the separate effects cannot generally be identified.

Multi-factor designs can be useful but increase the number of conditions, cost, and analytical complexity. Use them when the interaction matters to the engineering decision.

## 6. Sample Size and Statistical Power

The number of evaluation cases influences how well an experiment can distinguish a real effect from sampling variability.

A benchmark with ten cases may reveal an obvious failure, but it may be inadequate for establishing a small improvement in a broad workload.

A benchmark with thousands of highly repetitive cases may still provide weak evidence about important categories that are barely represented.

### 6.1 What determines the required sample size?

Relevant factors include:

- The expected baseline performance.
- The smallest improvement that would matter.
- The variability of the measured outcome.
- The desired false-positive risk.
- The desired statistical power.
- Whether the design is paired or unpaired.
- The number of comparisons being performed.
- The diversity of the target workload.

A sample-size calculation should match the planned statistical test and the data structure.

For example, a paired comparison requires information about the variability or disagreement between paired outcomes, not merely the independent variance of each candidate's score.

### 6.2 Statistical power

Statistical power is the probability that a test will reject the null hypothesis under a specified alternative when that alternative is true.

Power depends on the actual effect size, sample size, variability, and testing procedure.

A low-powered experiment may fail to detect an important difference. A high-powered experiment can detect smaller differences, including differences that have little practical value.

Power is not the probability that the observed conclusion is correct.

### 6.3 Avoid arbitrary sample-size rules

There is no universal rule that every language-model benchmark must contain a fixed number of cases.

A small diagnostic suite may be sufficient to detect a broken output schema. A decision about rare safety failures may require a much larger and carefully designed evaluation.

Choose the design according to the risk and the decision the results must support.

## 7. Confidence Intervals and Uncertainty

A point estimate summarizes the observed data. It does not fully describe the uncertainty associated with the estimate.

Suppose a model succeeds on 90 out of 100 evaluated cases.

The observed success rate is:

\[
\hat{p}=\frac{90}{100}=0.90
\]

This means the model succeeded on 90% of the evaluated cases. It does not establish that the model's true success probability on the target population is exactly 90%.

A confidence interval provides a range of values compatible with the data under a specified statistical procedure and its assumptions.

### 7.1 Interpret confidence intervals correctly

A confidence interval is not simply a guarantee that the true value lies within the reported range.

Under the usual frequentist interpretation, a 95% confidence-interval procedure would cover the true parameter in approximately 95% of repeated samples when its assumptions hold.

The interval's usefulness depends on:

- The sampling design.
- The estimator.
- The interval method.
- Independence or dependence among observations.
- The representativeness of the sample.

A confidence interval cannot repair a biased or unrepresentative benchmark.

### 7.2 Estimate the difference directly

When comparing two candidates, the difference in their measured performance is often more useful than inspecting their separate intervals alone.

For example, the team may estimate:

\[
\Delta = p_B-p_A
\]

The uncertainty interval for \(\Delta\) helps characterize the range of differences compatible with the evaluation data under the chosen method.

For paired binary outcomes, use an analysis appropriate for paired data rather than treating the two observed success rates as independent by default.

The correct method depends on the outcome, sampling design, and assumptions. This chapter does not prescribe a single interval method for every metric.

### 7.3 Uncertainty is not limited to sampling

A narrow confidence interval can still be misleading if the benchmark omits important task categories or the evaluator systematically mislabels outputs.

Statistical uncertainty should therefore be considered alongside:

- Dataset limitations.
- Measurement validity.
- Evaluation-procedure reliability.
- Model-version uncertainty.
- Operational differences between the benchmark and deployment.

Statistical precision and engineering confidence are related, but they are not identical.

## 8. Statistical Significance Versus Practical Significance

A statistically significant difference is not automatically an important engineering improvement.

Suppose a large benchmark detects a small increase in task-success rate. The difference may be statistically significant while being too small to justify additional inference cost or migration effort.

Conversely, a potentially important improvement may not reach statistical significance in a small or noisy experiment.

These are different questions:

- **Statistical significance:** Does the result provide sufficient evidence against a specified null hypothesis under the chosen testing procedure?
- **Practical significance:** Is the magnitude of the difference important enough to change an engineering decision?

### 8.1 Define a meaningful effect before the experiment

Suppose the team considers an improvement of at least two percentage points in task-success rate to be operationally meaningful.

That target can be incorporated into the experiment's decision criteria.

The team should then distinguish among:

- Evidence of a difference.
- Evidence that the difference reaches the desired magnitude.
- Evidence that mandatory constraints remain satisfied.

The appropriate statistical procedure depends on the exact decision. A conventional test against zero does not automatically establish that the improvement exceeds a predefined practical threshold.

### 8.2 Consider the cost of the improvement

A candidate might improve task success slightly but double inference cost.

Another candidate might provide a smaller quality improvement while substantially reducing latency.

The preferred option depends on the application's requirements and the costs of failure.

A useful decision rule may therefore combine:

- A minimum quality requirement.
- A maximum acceptable regression on critical cases.
- A latency or cost limit.
- Evidence that the comparison is sufficiently reliable.

Avoid reducing all of these dimensions to a single score unless the weighting and constraints are justified.

## 9. Multiple Comparisons and Repeated Experimentation

Language-model development often involves evaluating many models, prompts, configurations, and metrics.

Repeated testing increases the chance of finding an apparently significant result even when no corresponding underlying effect exists.

### 9.1 Multiple comparisons

Suppose a team tests many candidate configurations and reports only the one that produces the strongest result.

Even if every candidate is evaluated correctly, selecting the best observed result can introduce optimism into the reported performance.

The more comparisons made, the greater the opportunity to select a result that benefited from random variation.

### 9.2 Repeatedly checking results

Repeatedly examining the same evaluation set and stopping as soon as a favorable result appears can invalidate the interpretation of a conventional fixed-sample test.

This is especially relevant when engineers repeatedly modify prompts or configurations in response to the same held-out results.

### 9.3 Practical controls

Useful controls include:

- Defining the primary outcome before the final comparison.
- Distinguishing exploratory experiments from confirmatory evaluations.
- Tracking the number of candidates and comparisons.
- Using appropriate multiple-comparison procedures when warranted.
- Reserving a final held-out evaluation set.
- Limiting repeated optimization against that final set.
- Reporting unsuccessful experiments when they materially affect the interpretation.

Not every engineering experiment needs formal hypothesis testing. The important requirement is that the strength of the conclusion matches the design and the way the results were selected.

## 10. Selecting a Statistical Method

The method should match the outcome type, comparison design, sampling process, and assumptions. No single test is appropriate for every language-model evaluation.

The following table provides a practical starting point, not an automatic decision rule.

| Evaluation situation | Possible method | Important considerations |
|---|---|---|
| Pass/fail outcomes on the same cases | McNemar's test | Uses paired disagreements. Appropriate for paired binary outcomes; a small number of disagreements may require an exact variant. |
| Difference in paired numerical scores | Paired t-test | Tests the mean paired difference. Consider the distribution of differences and whether the mean is the relevant quantity. |
| Paired scores with a non-normal or ordinal interpretation | Wilcoxon signed-rank test, when its assumptions fit | Tests a rank-based paired difference; it is not a universal test of medians and has assumptions about the difference distribution. |
| Difference in independent proportions | Two-proportion test or an appropriate exact method | Requires independent groups and suitable assumptions; do not substitute it for a paired analysis. |
| Uncertainty around paired or complex estimates | Confidence interval or appropriately designed bootstrap | Preserve the dependence structure. For paired cases, resample case pairs rather than treating each candidate's scores independently. |
| Latency under a defined workload | Median, upper percentiles, and suitable uncertainty estimates | Control workload and concurrency. Tail latency may matter more than the mean for service-level requirements. |
| Many candidate or metric comparisons | A suitable multiple-comparison procedure, such as Holm correction | Define the family of hypotheses and the decision objective before selecting the adjustment. |

### 10.1 Interpret p-values correctly

A p-value is the probability, **assuming the null hypothesis and the test's assumptions hold**, of obtaining the observed test result or one more extreme according to the chosen test statistic.

It is not:

- The probability that the null hypothesis is true.
- The probability that the observed result occurred purely by chance in an unrestricted sense.
- A measure of the size or practical importance of the effect.
- Proof that the experiment was well designed.

A small p-value can indicate incompatibility between the data and the null model. It does not establish that the benchmark is representative, that the metric measures the intended capability, or that the effect matters operationally.

Likewise, a p-value above a chosen threshold does not establish equivalence.

### 10.2 Report more than the test result

When a statistical test is appropriate, report:

- The comparison and outcome being tested.
- The observed effect size.
- The sample size and comparison design.
- The statistical method and relevant assumptions.
- The p-value, when used.
- A suitable confidence interval or other uncertainty estimate where available.
- The predefined practical decision threshold.
- Known data and measurement limitations.

A test result without the experimental context is difficult to interpret and easy to misuse.

### 10.3 Do not select a test by convenience

A statistical library may offer a test that accepts the available data, but successful execution does not establish that the method fits the experiment.

Before selecting a method, ask:

1. Are observations paired or independent?
2. Is the outcome binary, continuous, ordinal, or otherwise structured?
3. What quantity should the analysis estimate?
4. What assumptions does the method require?
5. Does the method account for repeated observations or clustering?
6. Will the result answer the actual engineering question?

If the data structure or assumptions are unclear, document the limitation and seek a suitable analysis rather than reporting an unjustified test result.

## 11. Correlation, Causation, and Attribution

An observed difference does not automatically identify its cause.

Suppose a new model configuration improves a benchmark score after the team also changes the prompt, context assembly, and evaluator.

The experiment establishes a difference between the tested configurations. It does not isolate the model change as the cause.

### 11.1 Attribute improvements carefully

To attribute an effect to a particular change:

1. Define the variable of interest.
2. Hold relevant alternative variables constant or account for them in the design.
3. Collect comparable observations.
4. Use an analysis that matches the experimental design.
5. Consider plausible alternative explanations.

If multiple components change together, the conclusion should describe the effect of the combined configuration unless the design supports more specific attribution.

### 11.2 Beware of evaluator-induced improvements

A candidate may score better because it produces outputs that align with the evaluator's preferences, rather than because it improves the intended task outcome.

For example, an LLM judge may favor longer answers. If a candidate becomes more verbose, its judge score might improve even when factual correctness does not.

This is why evaluator validation and independent measures matter. Chapter 05 covers evaluator reliability and known biases.

### 11.3 Distinguish observed association from causal evidence

If a score increases after a model update, the timing alone does not establish that the update caused the increase.

Controlled experiments strengthen attribution by reducing alternative explanations. They do not eliminate every limitation, particularly when hosted models or external systems change in undocumented ways.

## 12. A Decision Framework for Evaluation Results

Statistical interpretation should ultimately support an engineering decision.

A useful review process considers four dimensions.

### 12.1 Quality of the evidence

Ask:

- Was the experiment designed around a specific question?
- Were the evaluation cases appropriate?
- Were the relevant variables controlled?
- Was the evaluator reliable enough for the decision?
- Was uncertainty assessed using a suitable method?

### 12.2 Magnitude of the observed effect

Ask:

- How large is the measured difference?
- Is it practically meaningful?
- Is the estimate precise enough for the decision?
- Does the result remain meaningful across important task categories?

### 12.3 Constraint compliance

Ask:

- Were mandatory quality requirements satisfied?
- Did critical failure rates increase?
- Were latency and cost limits respected?
- Were there regressions that the aggregate score conceals?

### 12.4 Scope of the conclusion

Ask:

- Which workloads were tested?
- Which conditions were held constant?
- What assumptions support the conclusion?
- Which behaviors remain untested?
- What additional validation is needed before deployment?

A disciplined decision may conclude that the candidate is better on the evaluated workload, that the evidence is inconclusive, or that additional testing is required.

An inconclusive result is not a failed experiment. It is a signal that the available evidence does not yet support the intended decision.

## 13. Practical Lab: Determine Whether an Improvement Is Credible

### 13.1 Scenario

A team compares a baseline support-assistant configuration with a candidate configuration.

Both configurations are evaluated on the same versioned set of support questions. Each case receives a binary task-success outcome based on a predefined rubric.

The team observes a higher success rate for the candidate and wants to decide whether the difference supports adoption.

The following scenario is illustrative and does not report empirical model results.

### 13.2 Define the experiment

Document:

- The baseline and candidate configurations.
- The primary outcome.
- The target workload.
- The evaluation dataset version.
- The conditions held constant.
- The minimum improvement that would matter operationally.
- The mandatory constraints.
- The planned statistical analysis.

Make these decisions before examining the final results.

### 13.3 Inspect paired outcomes

For each case, record whether each candidate passed or failed.

Use a table like this:

| Outcome | Count |
|---|---:|
| Both configurations pass | Record count |
| Both configurations fail | Record count |
| Baseline passes, candidate fails | Record count |
| Baseline fails, candidate passes | Record count |

The last two rows are especially important for paired binary comparisons. They show which cases changed outcome between the candidates.

Calculate each candidate's success rate and the observed difference. Do not infer statistical significance from the difference alone.

### 13.4 Select and justify the method

Because each candidate is evaluated on the same cases and the outcome is binary, a paired binary method such as McNemar's test may be appropriate for testing a difference in pass/fail behavior.

Before using it:

1. Verify that the pairing is meaningful and the cases were evaluated comparably.
2. Inspect the two disagreement counts.
3. Determine whether an exact or asymptotic version is appropriate for the amount of disagreement data.
4. Decide whether a confidence interval for the paired difference is also needed.
5. Document the method and assumptions.

If the experiment instead uses continuous per-case scores, the method may differ. A paired t-test or a suitable alternative could be considered, depending on the target quantity and assumptions.

The method should follow the experiment, not the other way around.

### 13.5 Assess uncertainty and practical significance

Record:

- The estimated difference.
- The uncertainty interval or test result, as appropriate.
- The method used and its assumptions.
- Whether the sample size supports the intended conclusion.
- Any relevant limitations in the evaluation data.

Compare the observed improvement with the predefined minimum meaningful effect.

Then inspect:

- Critical regressions.
- Category-level results.
- Correct handling of unsupported questions.
- Operational cost and latency, if relevant.

A candidate may show a positive observed difference without providing enough evidence that the improvement is meaningful or reliable.

### 13.6 Write the decision

Choose the conclusion that best matches the evidence:

- **Supported improvement:** Evidence meets the predefined criteria, subject to stated scope and limitations.
- **Inconclusive:** The experiment does not provide sufficient evidence for the intended conclusion.
- **Unacceptable candidate:** The candidate violates a mandatory requirement or introduces an unacceptable regression.
- **Further investigation required:** The results suggest a difference, but confounding, evaluator limitations, or other unresolved issues prevent a reliable decision.

Explain the conclusion in terms of the data and the decision criteria rather than relying on a single score or p-value.

The lab is complete when another engineer can understand the hypothesis, comparison design, measured difference, statistical method, uncertainty, and decision rationale.

## 14. Common Statistical Interpretation Mistakes

### Treating a higher score as proof of superiority

A score difference may reflect sampling variability, measurement noise, or an uncontrolled variable.

**Better practice:** Assess uncertainty, effect magnitude, and experimental conditions.

### Treating a nonsignificant result as proof of equivalence

Insufficient evidence of a difference does not demonstrate that the candidates perform the same.

**Better practice:** Use an appropriate equivalence or non-inferiority design when that is the actual question.

### Reporting only the p-value

A p-value does not communicate the size of an effect, its practical importance, or the probability that a hypothesis is true.

**Better practice:** Report the observed effect, relevant uncertainty, test method, and decision context.

### Treating repeated runs as independent benchmark cases

Repeated runs on the same prompts may share important sources of dependence.

**Better practice:** Preserve the structure of the data and use an analysis appropriate to repeated or paired observations.

### Selecting only favorable results

Trying many configurations and reporting only the strongest result can overstate expected performance.

**Better practice:** Track comparisons, separate exploration from confirmation, and protect final evaluation data.

### Confusing statistical precision with benchmark validity

A narrow confidence interval does not establish that the dataset represents production or that the evaluator measures the intended capability.

**Better practice:** Assess sampling uncertainty, construct validity, and measurement quality separately.

### Attributing a combined change to one component

If model, prompt, and evaluation settings change together, their individual effects cannot generally be separated.

**Better practice:** Align the experiment with the causal question and qualify the conclusion.

### Choosing a statistical test without checking its assumptions

A test may run successfully while answering the wrong question or relying on assumptions that do not fit the data.

**Better practice:** Identify the outcome type, dependence structure, target quantity, and assumptions before choosing a method.

## 15. Summary

Experimental design determines how evidence is collected. Statistical interpretation determines what conclusions that evidence can support.

A sound evaluation experiment:

- Begins with a precise, testable question.
- Defines primary outcomes and decision criteria.
- Identifies experimental variables and confounders.
- Selects an appropriate paired, unpaired, repeated-run, or multi-factor design.
- Accounts for sampling and measurement variability.
- Uses statistical methods appropriate to the data and comparison design.
- Interprets confidence intervals and p-values according to their assumptions.
- Distinguishes statistical significance from practical significance.
- Accounts for repeated comparisons and selection effects.
- Separates observed differences from causal claims.
- Connects the results to predefined engineering requirements.

The objective is not to make every engineering experiment statistically elaborate. It is to ensure that the strength of the conclusion is proportional to the quality of the evidence.

## 16. Knowledge Check

Answer these questions in your own words:

1. Why is “the new model is better” an insufficient experimental hypothesis?
2. What is the difference between an independent variable, a dependent variable, and a confounder?
3. Why is a paired comparison often useful when evaluating language models?
4. How does repeated-run variability differ from sampling variability across benchmark cases?
5. What does a confidence interval communicate, and what can it not establish?
6. Why can a statistically significant improvement be operationally unimportant?
7. Why does failure to reject a null hypothesis not prove equivalence?
8. How can repeated experimentation against the same held-out set bias a model-selection decision?
9. What evidence is needed to attribute an improvement to a model change rather than a prompt change?
10. When might McNemar's test be more appropriate than a test for independent proportions?
11. What does a p-value represent, and what does it not represent?
12. How would you explain an inconclusive result to an engineering team without treating the experiment as a failure?

## 17. Connections to Other Chapters

- **Chapter 01 — Evaluation Foundations and Objectives:** Establishes evaluation goals and decision-oriented requirements.
- **Chapter 02 — Evaluation Dataset Design and Data Integrity:** Covers sampling, dataset representativeness, leakage, and integrity.
- **Chapter 03 — Metrics for Language Model Evaluation:** Defines the metrics and their appropriate interpretation.
- **Chapter 04 — Human Evaluation and Rubric Design:** Covers annotation variability and evaluator agreement.
- **Chapter 05 — Automated Evaluation and LLM-as-a-Judge:** Addresses evaluator reliability, judge bias, and validation.
- **Chapter 06 — Task-Specific and Application-Level Evaluation:** Connects measured outcomes to actual task and application requirements.
- **Chapter 07 — Benchmarking and Controlled Model Comparison:** Establishes the controlled candidate-comparison setup.
- **Chapter 09 — Reproducible Evaluation Workflows and Practical Lab:** Covers how to preserve and reproduce the evaluation process.
- **LLM-10 — Model Selection and Adaptation:** Uses evaluation evidence as part of broader engineering decisions.

Experimental design and statistical interpretation turn benchmark observations into appropriately qualified engineering evidence. They help teams distinguish a promising result from a reliable, practically meaningful improvement.
