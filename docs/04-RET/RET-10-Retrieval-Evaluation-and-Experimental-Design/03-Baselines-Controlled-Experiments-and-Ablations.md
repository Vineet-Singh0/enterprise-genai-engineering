# RET-10.03 — Baselines, Controlled Experiments, and Ablations

## 1. Purpose and Scope

Retrieval evaluation tells us how a system performs. Experimental design helps us determine **why it performs that way**, whether an observed improvement is attributable to a specific change, and whether that improvement is worth accepting in production.

A retrieval system may contain several interacting components:

- Dense retrieval
- Lexical retrieval
- Metadata filtering
- Candidate generation
- Retrieval fusion
- Reranking
- Candidate-depth configuration
- Query-processing logic

Changing one or more of these components can alter retrieval quality, latency, resource consumption, and operational behavior.

A measured improvement does not automatically demonstrate that the intended change caused the improvement. Other changes, workload differences, environmental variation, and measurement limitations may explain some or all of the observed result.

This chapter establishes an engineering methodology for:

1. Selecting meaningful retrieval baselines.
2. Formulating testable hypotheses.
3. Designing controlled comparisons.
4. Interpreting paired query-level results.
5. Evaluating quality and operational trade-offs.
6. Conducting component ablations and multi-factor experiments.
7. Connecting offline evaluation with online experiments.
8. Interpreting repeated measurements responsibly.

The focus is experimental reasoning and engineering decision-making, not a statistical theory course.

### 1.1 Scope boundaries

This lesson covers experimental design and interpretation.

It does not reteach:

- Dense retrieval and ANN internals from RET-06.
- Query processing and metadata filtering from RET-07.
- Candidate generation and retrieval fusion from RET-08.
- Ranking and reranking mechanisms from RET-09.
- Metric definitions and relevance-judgment construction from RET-10.02.

Those chapters provide the mechanisms and evaluation foundations that experiments in this chapter use.

The next chapter, RET-10.04, owns the implementation of a reproducible retrieval benchmark and its reporting artifacts.

---

## 2. Baselines: Establishing a Meaningful Reference

A baseline is a reference system against which another retrieval configuration is evaluated.

Without a meaningful baseline, a metric value has little engineering interpretation.

For example, suppose a new dense retriever achieves nDCG@10 of 0.72. Whether that is good depends on what it is being compared against:

- A simple keyword baseline?
- The existing production retriever?
- A competitive hybrid retrieval configuration?
- An exact-search reference using the same embeddings?

The comparison determines what conclusion the experiment can support.

### 2.1 Simple reference baseline

A simple reference baseline provides a basic point of comparison.

Examples include:

- A basic lexical retriever.
- A simple title-based search.
- A straightforward metadata-constrained retrieval strategy.
- A minimal dense retrieval configuration.

Its purpose is to establish whether a more sophisticated approach provides meaningful improvement over a simpler alternative.

A simple baseline should be understandable and reproducible.

It does not necessarily represent a strong production solution.

### 2.2 Production baseline

The production baseline represents the currently deployed or officially accepted system configuration.

It should capture the configuration that users or downstream services actually depend on.

Record its relevant properties:

- Retriever and model versions.
- Embedding model and dimensions.
- Index configuration.
- Corpus snapshot.
- Query-processing configuration.
- Metadata filters.
- Candidate depth.
- Fusion and reranking settings.
- Runtime environment.
- Relevant operational measurements.

The production baseline answers:

**Does the proposed change improve the system we currently operate?**

A theoretical improvement over an outdated or weak reference is not sufficient evidence for replacing a working production system.

### 2.3 Competitive baseline

A competitive baseline represents a reasonably strong alternative configuration.

Examples include:

- A properly configured lexical retriever.
- A dense retriever with appropriate candidate depth.
- A hybrid retriever with a justified fusion strategy.
- An existing reranking configuration.

The purpose is to avoid accepting an improvement merely because the comparison system was unnecessarily weak.

Competitive baselines should receive fair configuration and tuning effort.

A comparison is misleading if one system is carefully tuned while another uses arbitrary or unsuitable settings.

Fairness does not require every system to have identical internal mechanisms. It requires that the comparison be designed so that the measured difference is meaningful for the intended decision.

### 2.4 Technical reference baseline

A technical reference baseline isolates a particular mechanism or implementation property.

For example, an exact-search implementation and an ANN implementation using the same vectors can help investigate the retrieval-quality implications of approximate search.

An exact-search result is not automatically a relevance oracle.

It answers a technical question about search behavior under a particular representation and similarity function. It does not establish that the representation itself captures human relevance correctly.

Keep the following concepts separate:

| Reference | What it helps establish |
|---|---|
| Simple baseline | Improvement over a basic approach |
| Production baseline | Improvement over the deployed system |
| Competitive baseline | Improvement over a credible alternative |
| Technical reference | Behavior relative to a controlled technical implementation |
| Relevance oracle or ideal ranking | A relevance-oriented reference derived from judgments |

These references serve different purposes and should not be treated as interchangeable.

### 2.5 Baseline selection contract

Before running an experiment, document:

1. Why the baseline was selected.
2. Which engineering decision it supports.
3. Whether it represents production, a simple reference, or a competitive alternative.
4. Which components are held constant.
5. Which components differ intentionally.
6. Whether the baseline is tuned fairly.
7. Which limitations affect interpretation.

A baseline is useful only when its purpose and limitations are understood.

---

## 3. Experiment Specification and Hypothesis Design

An experiment should begin with a clearly stated engineering question.

Avoid starting with an implementation change and deciding afterward which metric makes it appear successful.

### 3.1 Define the problem

Describe the observed problem using evidence.

Examples:

- Dense retrieval misses exact product identifiers.
- Lexical retrieval performs poorly on semantic paraphrases.
- Candidate recall is insufficient for downstream reranking.
- A reranker improves ranking quality but introduces unacceptable latency.
- Metadata filtering produces unexpectedly low candidate counts.

The problem statement should identify the affected workload and the relevant system behavior.

### 3.2 Formulate a testable hypothesis

A useful hypothesis connects an intervention to an expected outcome.

Example:

> Adding a lexical retrieval channel to the existing dense retrieval pipeline will improve exact-identifier query performance while keeping p95 retrieval latency below the production threshold.

This hypothesis identifies:

- The intervention: add a lexical channel.
- The expected effect: improve exact-identifier retrieval.
- The relevant population: exact-identifier queries.
- An operational constraint: p95 latency.

A weak hypothesis would be:

> Hybrid retrieval will be better.

It does not specify what better means, which queries matter, or what operational cost is acceptable.

### 3.3 Define the experiment contract

Every meaningful experiment should specify:

| Element | Required definition |
|---|---|
| Problem | What observed behavior needs improvement? |
| Hypothesis | What change is expected to produce what effect? |
| Intervention | Which component or configuration changes? |
| Comparison | What reference configuration is used? |
| Target population | Which query or workload population matters? |
| Primary outcome | What is the main success metric? |
| Secondary outcomes | What additional behavior is measured? |
| Guardrails | Which conditions must not be violated? |
| Acceptance criteria | What evidence is sufficient to make a decision? |

The experiment contract should be established before interpreting results.

### 3.4 Example acceptance contract

Consider a retrieval system serving a workload that includes exact-identifier queries.

An illustrative acceptance contract could be:

- Primary metric: nDCG@10.
- Secondary metric: Recall@20.
- Target population: exact-identifier queries.
- Minimum practically meaningful improvement: +0.03 absolute nDCG@10.
- p95 retrieval latency: below 250 ms.
- Mandatory constraint violations: zero.
- Operational reliability: no unacceptable increase in failures.

The thresholds are illustrative. A production system must derive them from its own service objectives, business requirements, and measurement conditions.

### 3.5 Variables and confounders

An experiment should distinguish:

**Independent variable:** The factor intentionally changed.

**Dependent variable:** The measured outcome.

**Controlled variables:** Conditions held constant to support attribution.

**Confounders:** Other factors that can influence the measured outcome and make attribution difficult.

For example, suppose the experiment compares:

| Configuration | Model | Candidate depth | Corpus |
|---|---|---:|---|
| A | Model A | 500 | Corpus 1 |
| B | Model B | 1,000 | Corpus 2 |

If B performs better, the result cannot be attributed confidently to the model change.

Model version, candidate depth, and corpus all changed.

A multi-factor experiment can intentionally change several factors, but it must be designed to distinguish their effects. An uncontrolled comparison is not transformed into a valid multi-factor experiment merely because several changes were made.

---

## 4. Controlled Comparisons

A controlled comparison attempts to isolate the effect of an intended intervention.

### 4.1 Freeze the evaluation conditions

Unless an experiment intentionally changes them, keep the following consistent:

- Query population and query identities.
- Relevance-judgment dataset and version.
- Corpus snapshot.
- Document preprocessing.
- Query preprocessing.
- Metadata constraints.
- Retrieval depth.
- Embedding model and index versions.
- Ranking and reranking policy.
- Metric definitions and configuration.
- Runtime environment and measurement procedure.

The exact set of controlled variables depends on the experiment.

If the intervention is an embedding-model replacement, changing the embedding model and rebuilding the corresponding index may be necessary. Those changes belong to the intended intervention, not accidental differences.

The experiment record should explicitly identify which changes are part of the intervention.

### 4.2 One primary factor as the default

For an initial comparison, changing one primary factor generally makes attribution easier.

Example:

- Baseline: dense retrieval using embedding model A.
- Candidate: dense retrieval using embedding model B.

Keep the corpus, query set, filters, candidate depth, evaluation configuration, and runtime measurement procedure consistent.

This does not mean every valid experiment must change only one factor.

When factors interact, a designed multi-factor experiment can be more informative than a sequence of isolated experiments.

The engineering requirement is to design the comparison so that the intended effects can be interpreted.

### 4.3 Environmental variation

Even when the retrieval configuration is unchanged, measurements can vary because of:

- CPU contention.
- Memory pressure.
- Concurrent workloads.
- Cache state.
- Network conditions.
- Index loading.
- Warm-up behavior.
- Hardware differences.
- Background maintenance tasks.

These conditions matter particularly for latency and resource measurements.

An experiment should record relevant environmental conditions rather than treating every observed difference as a retrieval-algorithm effect.

### 4.4 Interpreting uncontrolled changes

If multiple changes occur without an explicit experimental design, report the result as a configuration-level comparison.

For example:

> The new configuration improved nDCG@10 by 0.04, but the comparison also changed the embedding model, candidate depth, and corpus snapshot. The result supports evaluating the new configuration as a whole; it does not isolate the effect of the embedding model.

This is a more defensible engineering conclusion than attributing the entire improvement to one component.

---

## 5. Paired Query Comparisons

Retrieval systems are evaluated over workloads containing different query types and difficulty levels.

A single aggregate metric can hide important differences.

Paired query comparisons help reveal how a candidate configuration changes results for the same queries.

### 5.1 Compare the same query identities

Suppose two configurations are evaluated on the same query set.

| Query | Baseline nDCG@10 | Candidate nDCG@10 |
|---|---:|---:|
| Q1 | 0.60 | 0.80 |
| Q2 | 0.90 | 0.70 |
| Q3 | 0.40 | 0.60 |
| Q4 | 0.80 | 0.90 |

For each query:

\[
\Delta_q = M_{\text{candidate},q} - M_{\text{baseline},q}
\]

Where \(M\) is the selected metric for query \(q\).

The differences are:

| Query | Difference |
|---|---:|
| Q1 | +0.20 |
| Q2 | -0.20 |
| Q3 | +0.20 |
| Q4 | +0.10 |

The candidate improves three queries and regresses one.

The aggregate result is not sufficient to describe the entire behavior.

Investigate:

- Which query categories improved?
- Which categories regressed?
- Were important queries harmed?
- Did the candidate change candidate coverage?
- Did the ranking change in a way that explains the metric movement?

### 5.2 Why pairing matters

Comparing different query populations can introduce workload-composition differences.

For example:

- Baseline evaluated on mostly easy queries.
- Candidate evaluated on mostly difficult queries.

A difference in aggregate performance could reflect the workload rather than the retrieval configuration.

Using the same query identities makes the comparison more controlled.

### 5.3 Comparison units must remain explicit

Different measurements have different units of analysis.

| Measurement | Relevant comparison unit |
|---|---|
| Retrieval quality | Query or defined query-level evaluation unit |
| Query-category quality | Query within a category |
| Request latency | Runtime request |
| Session-level outcome | Session |
| User-level outcome | User |
| Tenant-level outcome | Tenant |

Paired query-quality comparisons do not automatically establish paired runtime comparisons.

The same query can be executed repeatedly under different runtime conditions. Conversely, a single runtime request may contain several retrieval operations.

Do not treat these measurements as interchangeable.

### 5.4 Small improvements require careful interpretation

A small positive aggregate difference is not automatically meaningful.

Consider:

- A candidate improves average nDCG@10 by 0.002.
- The observed improvement is concentrated in a small number of queries.
- Some important query categories regress.
- Runtime measurements are unstable.

The result may not justify production adoption.

Interpret the observed improvement alongside:

1. The minimum practically meaningful improvement.
2. The consistency of the result across relevant workload segments.
3. Measurement uncertainty.
4. Operational guardrails.
5. The business impact of regressions.

Statistical methods for uncertainty estimation belong to the relevant statistical foundations. This chapter focuses on how the engineering decision should use that evidence.

---

## 6. Quality and Operational Trade-offs

A retrieval system is not optimized for relevance metrics alone.

A change that improves ranking quality but creates unacceptable latency, cost, or reliability may be unsuitable for production.

### 6.1 Measure multiple dimensions

Common evaluation dimensions include:

| Dimension | Example measurements |
|---|---|
| Retrieval quality | nDCG@K, Recall@K, MRR |
| Candidate generation | Candidate Recall, candidate count |
| Runtime | p50, p95, p99 latency |
| Resource usage | CPU, memory, storage |
| Cost | Cost per request, infrastructure cost |
| Reliability | Error rate, timeout rate |
| Constraint correctness | Mandatory constraint violations |

Metric definitions and relevance semantics are owned by RET-10.02. This chapter concerns how these outcomes are considered together during an experiment.

### 6.2 Example: quality improvement with latency regression

Suppose a candidate reranking configuration produces:

| Metric | Baseline | Candidate |
|---|---:|---:|
| nDCG@10 | 0.70 | 0.76 |
| Recall@20 | 0.85 | 0.88 |
| p95 latency | 180 ms | 290 ms |
| Constraint violations | 0 | 0 |

The candidate improves relevance metrics but exceeds a 250 ms latency limit.

It should not automatically be accepted.

Possible engineering responses include:

- Reject the configuration under the current service objective.
- Investigate whether reranking depth can be reduced.
- Optimize model execution.
- Introduce caching where semantically appropriate.
- Evaluate a different reranking model.
- Redesign the retrieval pipeline.

The correct decision depends on the acceptance contract, not on whichever metric improved most.

### 6.3 Practical significance versus measurement uncertainty

Three concepts must remain distinct:

**Observed improvement:** The difference measured in the experiment.

**Minimum practically meaningful improvement:** The smallest improvement that justifies the engineering and operational cost.

**Measurement uncertainty:** How much confidence the evaluation process supports in the observed difference.

For example, an observed improvement of +0.01 may be real but too small to justify additional infrastructure.

An observed improvement of +0.05 may appear attractive but be unstable across workload samples.

Neither value should be interpreted without the experiment's measurement and acceptance criteria.

### 6.4 Decision categories

An experiment should lead to an explicit decision.

| Decision | Meaning |
|---|---|
| Accept | Evidence satisfies quality and operational requirements |
| Reject | The candidate fails important acceptance conditions |
| Investigate | Evidence is insufficient or reveals an unexplained regression |
| Redesign | The intervention or experiment does not adequately address the problem |

Avoid forcing every experiment into a simple success/failure conclusion.

An inconclusive result is a valid engineering outcome.

---

## 7. Ablation Studies and Multi-Factor Experiments

An ablation study investigates the contribution of components within a system.

It helps answer questions such as:

- Does the lexical channel contribute meaningful retrieval value?
- Does reranking improve ranking quality?
- Does increasing candidate depth improve downstream results?
- Does a metadata-processing component prevent unwanted candidates?
- Does a fusion mechanism improve coverage or merely increase candidate volume?

### 7.1 Component ablation

A component ablation removes or disables a selected component while keeping the remaining experimental configuration consistent.

Example:

- Full system: dense retrieval + lexical retrieval + fusion.
- Ablated system: dense retrieval + fusion behavior adjusted to operate without lexical candidates.

The comparison investigates the contribution of the lexical retrieval path under the tested architecture.

It does not establish that lexical retrieval has the same contribution in every system.

### 7.2 Removal versus replacement

Removing a component and replacing it are different interventions.

**Removal:**

The component is disabled. The remaining system operates without it.

**Replacement:**

The component is replaced by another implementation or strategy.

For example:

- Remove a reranker.
- Replace a Cross-Encoder with a different reranking model.

These answer different questions.

The first investigates behavior without the component. The second compares alternative implementations.

Document the intervention precisely.

### 7.3 Component contribution is conditional

A component's measured contribution depends on:

- The surrounding architecture.
- The candidate distribution.
- The query population.
- The corpus.
- The relevance-judgment set.
- The retrieval and ranking configuration.
- The evaluation metric.

For example, a lexical channel may contribute substantially to exact-identifier queries but little to conversational semantic queries.

Therefore, avoid statements such as:

> Lexical retrieval always improves hybrid retrieval by 10%.

A defensible statement is:

> Under the tested corpus, workload, and fusion configuration, adding the lexical channel improved the selected evaluation metric by the observed amount.

### 7.4 Multi-factor experiment: dense and lexical retrieval

A factorial experiment can evaluate the effects of multiple factors and their interaction.

Consider two factors:

- Factor D: dense retrieval enabled or disabled.
- Factor L: lexical retrieval enabled or disabled.

There are four configurations.

| Configuration | Dense retrieval | Lexical retrieval |
|---|---|---|
| A | Disabled | Disabled |
| B | Enabled | Disabled |
| C | Disabled | Enabled |
| D | Enabled | Enabled |

For this example, configuration A is a fixed fallback-only retrieval configuration. The same fallback retriever remains active in all four configurations, while the dense and lexical channels are independently enabled or disabled.

The fallback-only configuration is a valid retrieval baseline, not an empty-result system.

#### 7.4.1 Define a fixed fusion policy

The experiment must hold the fusion policy constant. Merely keeping the fallback retriever present in every configuration is insufficient.

For this illustrative experiment, use a fixed weighted score-combination policy:

\[
S(d)=0.40S_F(d)+0.30S_D(d)+0.30S_L(d)
\]

Where:

- \(S_F(d)\) is the calibrated fallback-channel score for document \(d\).
- \(S_D(d)\) is the calibrated dense-channel score.
- \(S_L(d)\) is the calibrated lexical-channel score.

The weights are fixed across all four configurations:

| Channel | Fixed weight |
|---|---:|
| Fallback | 0.40 |
| Dense | 0.30 |
| Lexical | 0.30 |

The channel scores must be transformed using fixed calibration rules established before the experiment. Those rules must not be recalculated independently for each configuration using its active channels.

For example, if scores are mapped to a common bounded scale, the calibration parameters must come from the same frozen calibration procedure or calibration dataset for every configuration.

**Disabled-channel behavior:**

- A disabled channel generates no candidates and contributes no score.
- Its weight is not redistributed to the other channels.
- The remaining weights are not renormalized.
- A document absent from a channel receives no contribution from that channel.
- A document retrieved by multiple channels is deduplicated using the same deterministic document-identity rule.

This is important because renormalizing the remaining weights would change the relative influence of the fallback channel and the other active channels. That would introduce a fusion-policy change alongside the channel-availability change.

#### 7.4.2 Keep candidate processing consistent

The experiment must also keep the downstream processing policy fixed:

1. The fallback retriever uses the same model, index, parameters, and candidate-generation procedure in all configurations.
2. The dense retriever uses the same configuration whenever enabled.
3. The lexical retriever uses the same configuration whenever enabled.
4. Each enabled channel uses its predefined candidate-depth limit.
5. Candidate sets are combined using the fixed weighted score policy.
6. Deduplication uses the same document identity and deterministic tie-breaking rules.
7. The same reranking policy is applied to the resulting candidate set.
8. The same evaluation and metric configuration is used.

The candidate set can legitimately differ because the experimental factors change which channels generate candidates. That difference is part of the intended intervention.

The fusion policy, calibration, fallback behavior, deduplication, and downstream ranking policy must not change unintentionally.

If an experiment intentionally changes candidate depth, calibration, fusion weights, or normalization, those changes must be treated as additional factors or reported as a configuration-level comparison.

#### 7.4.3 Example configurations

| Configuration | Fallback | Dense | Lexical |
|---|---|---|---|
| A: Fallback only | Enabled, 0.40 | Disabled, 0.30 unused | Disabled, 0.30 unused |
| B: Fallback + dense | Enabled, 0.40 | Enabled, 0.30 | Disabled, 0.30 unused |
| C: Fallback + lexical | Enabled, 0.40 | Disabled, 0.30 unused | Enabled, 0.30 |
| D: All channels | Enabled, 0.40 | Enabled, 0.30 | Enabled, 0.30 |

"Unused" means that the disabled channel contributes neither candidates nor scores. Its weight remains unallocated rather than being redistributed.

The resulting scores need not sum to one. The weighted sum is the defined comparison score, and the downstream ranking policy must interpret it consistently.

An illustrative set of macro-averaged nDCG@10 results on the same eligible query population is:

| Configuration | nDCG@10 |
|---|---:|
| A: Fallback only | 0.40 |
| B: Fallback + dense | 0.70 |
| C: Fallback + lexical | 0.65 |
| D: Fallback + dense + lexical | 0.85 |

These values are illustrative, not empirical claims. They demonstrate how the four configurations can be compared under one fixed combination policy.

### 7.5 Interpreting main effects and interaction

The dense retrieval effect can be calculated by comparing configurations with dense retrieval enabled against those without it.

\[
Effect_D =
\frac{(B-A)+(D-C)}{2}
\]

Substituting the example values:

\[
Effect_D =
\frac{(0.70-0.40)+(0.85-0.65)}{2}
\]

\[
Effect_D = 0.25
\]

The lexical retrieval effect is:

\[
Effect_L =
\frac{(C-A)+(D-B)}{2}
\]

\[
Effect_L =
\frac{(0.65-0.40)+(0.85-0.70)}{2}
\]

\[
Effect_L = 0.20
\]

The interaction is:

\[
Interaction = D-B-C+A
\]

\[
Interaction = 0.85-0.70-0.65+0.40
\]

\[
Interaction = -0.10
\]

The negative interaction indicates that the combined improvement is smaller than the sum of the two individual improvements relative to the fallback-only reference.

This does not automatically mean dense and lexical retrieval interfere harmfully.

The result may reflect:

- Overlapping candidate coverage.
- Diminishing returns.
- The bounded nature of nDCG.
- The particular query population.
- The fallback configuration.
- The aggregation method.

The interaction is measured on the selected metric scale. It is not a universal measure of component quality.

Query-level interactions may also differ from the aggregate interaction.

The calculated main effects and interaction describe the observed performance of the four configurations under the fixed fusion policy. They do not establish universal, architecture-independent contributions of dense or lexical retrieval.

### 7.6 Why the fallback configuration and fusion policy matter

A factorial comparison requires meaningful configurations and a consistent intervention.

If configuration A were genuinely an empty-result system, it would return no candidates. For eligible queries with positive ideal DCG, its nDCG@10 would be zero.

Assigning it 0.40 would be mathematically inconsistent.

The fallback-only design avoids that inconsistency while preserving a useful reference configuration.

However, the fallback must contribute consistently. If its relative weight changes, its scores are recalibrated differently, or the other active channel weights are renormalized, the comparison no longer isolates channel availability under a fixed fusion policy.

For example, this is not the same experiment:

- Fallback-only: fallback weight 1.0.
- Fallback + dense: fallback weight 0.5, dense weight 0.5.
- Fallback + lexical: fallback weight 0.5, lexical weight 0.5.
- All channels: fallback, dense, and lexical each receive approximately one-third weight.

That design changes both channel availability and relative fusion contribution. It can still be a valid configuration comparison, but it does not isolate the same factors as the fixed-weight experiment.

If the actual experiment has no fallback retriever, use the appropriate empty-result behavior and calculate its metrics accordingly. Do not reuse the illustrative 0.40 value.

### 7.7 Designing a factorial experiment

A practical process:

1. Identify the factors to evaluate.
2. Define the enabled and disabled states for each factor.
3. Define a valid reference configuration.
4. Define the score-calibration and combination policy.
5. Specify the behavior of disabled channels.
6. Keep non-experimental components constant.
7. Enumerate the required configurations.
8. Evaluate them on the same eligible population.
9. Calculate main effects and interactions.
10. Examine query-level and category-level behavior.
11. Assess operational outcomes.
12. Interpret the result within the tested architecture.

For two binary factors, four configurations are required for a complete 2×2 factorial comparison.

With more factors, the number of configurations grows quickly.

A full factorial design is not always necessary or affordable. A carefully selected experimental design may be more practical, provided its limitations are documented.

### 7.8 Configuration-level interpretation

If a configuration changes multiple components but does not provide enough experimental structure to isolate their individual effects, report it as a configuration-level result.

Do not claim that each component independently caused the observed improvement.

This distinction protects the engineering conclusions from overstating what the experiment actually established.

---

## 8. Offline Evaluation and Online Experiments

Offline and online experiments provide different types of evidence.

Neither should be treated as a complete substitute for the other.

### 8.1 Offline evaluation

Offline evaluation uses a fixed evaluation environment.

Typical inputs include:

- A defined query set.
- A fixed corpus snapshot.
- A relevance-judgment dataset.
- A retrieval configuration.
- A metric configuration.
- A controlled execution procedure.

Advantages:

- Reproducible comparisons.
- Easier debugging.
- Lower operational risk.
- Controlled query-level analysis.
- Faster iteration.

Limitations:

- The evaluation workload may not fully represent production.
- Relevance judgments may be incomplete.
- User behavior is not directly measured.
- Offline improvements may not translate into online outcomes.

Offline evaluation is useful for screening and understanding candidate configurations before exposing them to production traffic.

### 8.2 Shadow evaluation

Shadow evaluation runs a candidate configuration alongside the existing production system without using its results to control the user's actual experience.

It can help compare:

- Candidate outputs.
- Ranking differences.
- Candidate counts.
- Runtime behavior.
- Resource consumption.
- Failure rates.

Shadow execution provides evidence about behavior under production-like traffic.

However, shadow evaluation does not prove that users will achieve better outcomes.

The candidate's results are not necessarily exposed to users, and shadow traffic can have different cache, concurrency, or resource effects.

### 8.3 Controlled traffic experiments

A controlled online experiment exposes different configurations to defined traffic groups.

The experiment should document:

- Assignment unit.
- Assignment method.
- Randomization strategy, where feasible.
- Target population.
- Exposure consistency.
- Measurement window.
- Primary outcomes.
- Guardrails.
- Contamination controls.

The assignment unit may be:

- User.
- Session.
- Tenant.
- Request.

The correct choice depends on how the system behaves and whether one unit's experience can affect another's.

For example, user-level assignment can reduce configuration switching across a user's sessions. Tenant-level assignment may be more appropriate when tenants share configuration or operational state.

Randomized assignment is useful for reducing systematic group differences, but randomization alone does not guarantee a valid experiment. The assignment unit, exposure behavior, and interference risks still matter.

### 8.4 Example: session switching and contamination

Suppose a user receives configuration A in one session and configuration B in another.

The user's experience may be influenced by both configurations.

This creates an attribution problem if the experiment assumes the sessions are independent.

Similarly, shared caches, shared indexes, resource contention, and common downstream systems can create interference between groups.

Record and control these conditions where practical.

### 8.5 Offline-to-online evidence progression

A sensible progression is:

1. Offline evaluation to identify promising candidates.
2. Shadow evaluation to observe production-like behavior.
3. Controlled traffic exposure to measure real outcomes.
4. Gradual rollout with monitoring and rollback conditions.

This is an evidence progression, not an inflexible release sequence.

A system's risk, traffic volume, business impact, and operational constraints determine the appropriate rollout strategy.

---

## 9. Repeated Measurements and Workload Sampling

Repeated measurements help characterize system behavior, but repetition must be interpreted carefully.

A repeated request, a new query, a benchmark run, and an independent workload sample are not equivalent.

### 9.1 Sources of runtime variation

Runtime measurements can vary because of:

- Cache state.
- CPU contention.
- Memory pressure.
- Network conditions.
- Concurrent requests.
- Model loading.
- Index loading.
- Background tasks.
- Hardware variation.
- Warm-up behavior.

A single latency measurement is rarely sufficient to characterize production behavior.

### 9.2 Distinguish repetition types

| Measurement type | What it represents |
|---|---|
| Repeated execution of the same request | Runtime variability for one input |
| Execution across different queries | Behavior across different inputs |
| Repeated benchmark runs | Variation across benchmark executions |
| Independent workload samples | Variation across sampled workload units |

Repeatedly executing one query can help understand its runtime behavior.

It does not establish how the system performs across the full workload.

Similarly, running the same benchmark repeatedly does not automatically create independent observations.

### 9.3 Distinct queries are not necessarily independent samples

A critical distinction is that **different query strings do not automatically represent independent workload observations**.

Consider the following examples:

- Ten queries generated within one user session may share the same underlying information need.
- Several queries may be paraphrases of one original request.
- Many queries may be generated from the same template.
- Multiple requests may belong to one business workflow.
- Queries may share the same document population, tenant, or workload conditions.

These are distinct query records, but they may be correlated.

Therefore:

- Query identity is not the same as statistical independence.
- Query diversity is not proof of workload representativeness.
- A large query count does not automatically imply a large independent sample.
- Repeated requests do not eliminate systematic sampling bias.

Workload sampling and statistical independence are separate concerns.

Workload sampling asks whether the selected observations adequately represent the target population.

Independence concerns the relationship between observations and the assumptions used when interpreting measurements.

Both must be considered when making claims about generalization.

### 9.4 Repetition does not remove systematic bias

Suppose a benchmark contains only short, simple queries.

Running it 1,000 times does not make it representative of a production workload containing long, ambiguous, multilingual, and exact-identifier queries.

Repetition can improve understanding of measurement variability under the tested conditions.

It cannot repair a biased query population, incomplete judgments, or an unsuitable evaluation design.

### 9.5 Keep quality and runtime units separate

Retrieval quality and runtime measurements should not be aggregated as though they represent the same observational unit.

For example:

- Quality may be measured once per query.
- Latency may be measured over multiple executions of each query.
- A user outcome may be measured per user or session.

A benchmark should preserve these relationships when reporting results.

Do not treat 100 repeated executions of one query as 100 independent retrieval-quality observations.

---

## 10. Common Experimental Design Mistakes

### 10.1 Comparing against an unsuitable baseline

A weak baseline can make a candidate appear more impressive than it is.

Use a baseline that supports the actual engineering decision.

### 10.2 Changing several factors without an experimental design

When model, corpus, candidate depth, and filters all change together, the observed difference cannot be attributed confidently to one factor.

Use controlled comparisons or a deliberately designed multi-factor experiment.

### 10.3 Treating aggregate metrics as complete explanations

An aggregate improvement can hide serious regressions in specific query categories.

Inspect query-level and segment-level results.

### 10.4 Confusing technical reference performance with relevance

Exact search can provide a technical reference for approximate search behavior.

It does not automatically represent ideal human relevance.

### 10.5 Treating ablation results as universal component value

A component's contribution depends on its surrounding architecture and workload.

Report the tested conditions.

### 10.6 Confusing removal with replacement

Disabling a component and replacing it with another implementation answer different questions.

State the intervention precisely.

### 10.7 Treating a negative interaction as automatic interference

A negative interaction on a bounded ranking metric does not automatically establish harmful component behavior.

Investigate the metric scale, workload, overlap, and query-level results.

### 10.8 Ignoring operational guardrails

A relevance improvement that violates latency, cost, reliability, or mandatory constraints may be unacceptable.

Evaluate the full acceptance contract.

### 10.9 Treating repeated requests as independent evidence

Repeated executions of the same query help characterize runtime variability. They do not create independent workload coverage.

### 10.10 Treating online assignment as sufficient by itself

Randomized assignment does not eliminate shared-resource interference, exposure inconsistency, or measurement problems.

Design the experiment around the system's actual behavior.

### 10.11 Changing acceptance criteria after observing results

Post-hoc changes to success criteria weaken the credibility of the experiment.

Define the primary outcome, guardrails, and acceptance conditions before interpreting results.

---

## 11. Engineering Exercise: Evaluate a Hybrid Retrieval Change

### Scenario

An enterprise knowledge retrieval system uses dense retrieval.

The team proposes adding lexical retrieval to improve exact-identifier and technical-term queries.

The proposed change may increase candidate coverage but also increase latency and infrastructure cost.

You are responsible for deciding whether the change should move toward production.

### 11.1 Define the experiment

Specify:

1. The observed retrieval problem.
2. The target query population.
3. The experiment hypothesis.
4. The production baseline.
5. The competitive baseline.
6. The intended intervention.
7. The primary outcome.
8. Secondary outcomes.
9. Operational guardrails.
10. Acceptance criteria.

### 11.2 Design the comparison

Describe which variables must remain constant.

Identify which changes are part of the intended intervention.

Explain how you would prevent differences in corpus, query population, or relevance judgments from invalidating the comparison.

### 11.3 Interpret results

Suppose the experiment reports:

| Metric | Dense baseline | Hybrid candidate |
|---|---:|---:|
| nDCG@10 | 0.70 | 0.75 |
| Recall@20 | 0.82 | 0.89 |
| p95 latency | 160 ms | 235 ms |
| Mandatory constraint violations | 0 | 0 |

Assume the latency threshold is 250 ms and the minimum practically meaningful nDCG@10 improvement is 0.03.

Explain:

- Whether the candidate satisfies the stated acceptance conditions.
- Which query-level regressions you would investigate.
- Whether additional evidence is required before rollout.
- What operational monitoring you would introduce.

### 11.4 Design an ablation

Design an experiment to investigate whether the lexical channel contributes meaningful value.

Your design should distinguish:

- The fallback or reference configuration.
- Dense-only behavior.
- Lexical-only behavior.
- Combined behavior.

Explain how you would interpret an interaction between the two channels.

Also specify how you would keep score calibration, fusion weights, disabled-channel behavior, and fallback contribution consistent across configurations.

### 11.5 Explain the evidence limitations

Describe why:

- An offline improvement does not prove an online improvement.
- Repeated execution of one query does not establish workload generalization.
- Distinct query strings do not necessarily constitute independent observations.
- A configuration-level improvement does not automatically establish individual component contribution.

---

## 12. Production Engineering Considerations

Experimental design should account for the realities of operating retrieval systems.

### 12.1 Configuration identity

A result should be traceable to the exact configuration that produced it.

Record relevant versions and settings, including:

- Model versions.
- Embedding versions.
- Index versions.
- Corpus snapshots.
- Filter configuration.
- Retrieval depth.
- Fusion settings and weights.
- Score-calibration parameters.
- Reranking configuration.
- Runtime environment.

Without configuration identity, reproducing a result becomes difficult.

### 12.2 Experiment isolation

Where possible, isolate experimental workloads from unrelated changes.

Shared infrastructure can introduce interference through:

- Resource contention.
- Cache pollution.
- Index changes.
- Concurrent deployments.
- Background maintenance.

When isolation is not possible, record the relevant limitations.

### 12.3 Operational safety

An online experiment should have:

- Explicit rollout conditions.
- Monitoring.
- Guardrail thresholds.
- Rollback criteria.
- Ownership for experiment decisions.
- A defined end condition.

An experiment is not production-safe merely because its offline metrics look promising.

### 12.4 Decision traceability

The final engineering decision should explain:

- What was changed.
- Why it was changed.
- What was measured.
- What improved.
- What regressed.
- Which assumptions remain.
- Which limitations affect confidence.
- Why the configuration was accepted, rejected, or investigated.

The decision should be understandable to an engineer who did not run the experiment.

---

## 13. Interview and Engineering Discussion Perspective

An engineer discussing retrieval experiments should be able to explain more than metric definitions.

Typical engineering questions include:

**Why is a production baseline necessary if a simple baseline already exists?**

A simple baseline establishes a basic reference. The production baseline establishes whether the proposed change improves the system currently being operated. They support different decisions.

**Why can changing multiple components invalidate attribution?**

Because multiple interventions can affect the outcome. Without a design that distinguishes their effects, the measured difference cannot be assigned confidently to one component.

**When would you use a factorial experiment instead of changing one component at a time?**

When the interaction between factors is itself important and the experiment can evaluate the required configurations under controlled conditions.

**Does a negative interaction mean the two retrieval channels are incompatible?**

No. It describes the interaction on the selected metric scale under the tested conditions. It may reflect overlap, diminishing returns, metric bounds, or workload characteristics.

**Why must fusion weights remain controlled in a channel ablation?**

Because changing channel availability and changing relative channel influence are different interventions. If weights or normalization change alongside channel availability, the experiment cannot isolate the effect of enabling or disabling the channel.

**Why is an offline improvement insufficient for production adoption?**

Offline evaluation does not fully capture user behavior, production workload characteristics, shared-resource effects, or online operational outcomes.

**Why are repeated requests not necessarily independent samples?**

They may share the same input, user, session, workload conditions, or underlying information need. Repetition does not automatically create independent or representative observations.

**What makes an experiment inconclusive?**

Insufficient evidence, unstable measurements, uncontrolled confounding, unclear workload representation, or unresolved regressions can prevent a defensible conclusion.

---

## 14. Summary, Self-Assessment, and Next Chapter

### 14.1 Key engineering principles

- A baseline must support a clearly defined engineering decision.
- Production, competitive, simple, and technical reference baselines serve different purposes.
- A hypothesis should specify the intervention, expected outcome, and relevant population.
- Controlled comparisons improve attribution.
- Multi-factor experiments are valid when deliberately designed.
- Paired query comparisons help reveal query-level changes.
- Retrieval quality and runtime measurements have different units of analysis.
- Quality improvements must be evaluated alongside operational guardrails.
- Ablation results are conditional on the tested architecture and workload.
- Factorial interactions must be interpreted on the selected metric scale.
- Empty-result configurations must receive metric values consistent with their actual outputs.
- Factorial experiments must control score calibration, channel weights, disabled-channel behavior, and fallback contribution.
- Offline, shadow, and online experiments provide different types of evidence.
- Repeated measurements do not automatically produce independent or representative samples.
- Engineering decisions should preserve evidence, assumptions, and limitations.

### 14.2 Self-assessment

You should be able to:

1. Select and justify a baseline for a retrieval experiment.
2. Formulate a measurable retrieval hypothesis.
3. Identify controlled variables and confounders.
4. Design a paired query comparison.
5. Interpret query-level regressions alongside aggregate metrics.
6. Evaluate relevance and operational trade-offs.
7. Design a component ablation.
8. Explain main effects and interactions in a factorial experiment.
9. Define a fixed fusion policy for a multi-channel ablation.
10. Distinguish offline evaluation from online evidence.
11. Explain why repeated measurements and independent workload samples are different.
12. Defend an engineering decision using experimental evidence.

### 14.3 Knowledge ownership and connections

| Topic | Primary ownership |
|---|---|
| Dense retrieval and ANN mechanisms | RET-06 |
| Query processing and metadata constraints | RET-07 |
| Candidate generation and retrieval fusion | RET-08 |
| Ranking and reranking | RET-09 |
| Evaluation queries and test populations | RET-10.01 |
| Relevance judgments and retrieval metrics | RET-10.02 |
| Baselines, experiments, and ablations | RET-10.03 |
| Reproducible benchmark execution and reporting | RET-10.04 |
| Retrieval failure diagnosis and optimization | RET-11 |
| End-to-end retrieval architecture | RET-12 |

### 14.4 Next chapter

**RET-10.04 — Reproducible Retrieval Benchmark and Report**

The next chapter turns the evaluation and experimental-design principles into an operational benchmark.

It will focus on:

- Benchmark structure and execution.
- Configuration and dataset versioning.
- Reproducibility contracts.
- Experiment result artifacts.
- Evidence validation.
- Benchmark reporting.
- Traceability from experiment specification to engineering decision.

RET-10.03 establishes how to reason about experiments. RET-10.04 establishes how to execute, preserve, and report them reproducibly.
