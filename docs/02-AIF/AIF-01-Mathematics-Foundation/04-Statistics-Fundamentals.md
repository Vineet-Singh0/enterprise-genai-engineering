# AIF-01.04 — Statistics Fundamentals

**Filename:** `04-Statistics-Fundamentals.md`  
**Difficulty:** 2 — Foundational  
**Estimated Reading Time:** 35–45 minutes  
**Domain:** AI Foundations (AIF)  
**Pillar:** AIF-01 — Mathematics Foundation

---

## 1. Learning Objectives

By the end of this chapter, you should be able to:

- Explain why statistics is necessary when working with real-world data.
- Distinguish populations, samples, observations, and datasets.
- Differentiate descriptive statistics from inferential statistics.
- Calculate and interpret mean, median, and mode.
- Understand variance and standard deviation as measures of spread.
- Interpret percentiles and basic distribution shapes.
- Explain sampling variability and why estimates can change across samples.
- Distinguish correlation from causation.
- Understand how outliers affect statistical summaries.
- Apply statistical reasoning when inspecting AI/ML datasets.

## 2. Prerequisites

You should be comfortable with:

- Basic arithmetic, fractions, percentages, and ratios.
- Variables and elementary algebra.
- Basic probability concepts, including events and uncertainty.

If needed, review [Chapter 02 — Algebra, Exponents and Logarithms](02-Algebra-Exponents-and-Logarithms.md) and [Chapter 03 — Probability Fundamentals](03-Probability-Fundamentals.md).

## 3. Why Statistics Exists

Imagine you are building an AI system that predicts customer delivery times.

You collect 10,000 delivery records containing:

- Delivery distance.
- Order time.
- Weather conditions.
- Delivery duration.
- Whether the delivery was late.

Looking at individual records can tell you what happened to particular orders. But it does not immediately tell you:

- What delivery time is typical?
- How much do delivery times vary?
- Are some deliveries unusually slow?
- Does the sample represent the actual customer population?
- Is a relationship between distance and delivery time meaningful?
- How confident should you be in conclusions drawn from the data?

Statistics provides methods for summarizing data, understanding variability, identifying patterns, and drawing conclusions from observations.

**Probability studies uncertainty through mathematical models; statistics uses observed data to describe patterns and make informed inferences.** They are closely related, but they are not interchangeable.

### 3.1 A simple mental model

Think of statistics as a toolkit for turning a collection of observations into a useful description.

```text
Raw observations
       |
       v
Organize and inspect data
       |
       v
Summarize patterns and variability
       |
       v
Identify unusual observations
       |
       v
Interpret findings with limitations
```

The goal is not simply to calculate numbers. It is to understand what the numbers represent and what conclusions they support.

## 4. Population, Sample, Observation, and Dataset

These terms describe different levels of the data we work with.

### 4.1 Population

A **population** is the complete group of entities or observations relevant to a question.

Suppose a company wants to understand delivery times for all orders delivered during October.

The population might be all orders delivered by that company during October, according to the precise definition used in the analysis.

A population does not have to mean every person in a country. It can be any clearly defined group relevant to the problem.

Examples:

- All transactions processed by a payment system during a month.
- All users who registered for a product in a specified period.
- All requests received by an API during an incident.
- All labeled images in a dataset, if the dataset itself is the population of interest.

### 4.2 Sample

A **sample** is a subset of observations selected from a population.

If the company analyzes 500 delivery records from the October population, those 500 records form a sample.

Why use a sample instead of the entire population?

- Collecting every observation may be expensive.
- Some measurements are difficult or slow to obtain.
- The population may be too large to inspect manually.
- An initial analysis may need to be completed before all data is available.

A sample is useful only to the extent that it supports the question being asked. A sample containing only deliveries from one city may not represent delivery behavior across every city.

### 4.3 Observation

An **observation** is one recorded case or unit in a dataset.

For a delivery dataset, one observation might describe one delivery:

| Order ID | Distance (km) | Delivery time (minutes) |
|---|---:|---:|
| A101 | 3 | 18 |
| A102 | 5 | 27 |
| A103 | 2 | 15 |

Each row represents an observation. Each column represents a recorded variable.

The meaning of a row depends on the dataset design. In another dataset, one row might represent a customer, a transaction, a daily aggregate, or an individual sensor reading.

### 4.4 Dataset

A **dataset** is an organized collection of observations and their associated variables.

A dataset might be represented as a table, a collection of files, a stream of events, or another structured representation.

For AI/ML engineering, a dataset's structure matters because statistical calculations are only meaningful when the observations and variables are correctly defined.

For example, calculating average response time is different from calculating average response time per user. Both can be valid, but they answer different questions.

### 4.5 Population versus sample: the engineering distinction

Suppose you want to estimate the average latency of an API.

- If you calculate latency across every request in the specified time interval, you have a complete description of that interval's request population.
- If you inspect only a subset of requests, you have a sample-based estimate.
- If your sample disproportionately contains requests from one endpoint, the result may not represent the overall API workload.

A key question is always: **What population do these observations represent?**

## 5. Descriptive and Inferential Statistics

Statistics is commonly divided into two broad purposes.

### 5.1 Descriptive statistics

**Descriptive statistics** summarize the observations you have.

Examples include:

- Average delivery time.
- Median request latency.
- Standard deviation of transaction amounts.
- Percentage of orders delivered late.
- Distribution of customer ages.

Suppose five API requests have these latencies, measured in milliseconds:

\[
[100, 110, 120, 130, 140]
\]

Descriptive statistics can summarize their center and spread. They do not automatically establish what latency will be for every future request.

### 5.2 Inferential statistics

**Inferential statistics** use sample data to draw conclusions about a broader population or an underlying process.

Suppose a company cannot inspect every request generated by a large system. It samples requests and uses the results to estimate overall latency behavior.

The sample provides evidence, but the conclusions remain subject to uncertainty.

Inference depends on factors such as:

- How observations were selected.
- Whether the sample represents the target population.
- How much variability exists.
- Whether the statistical assumptions are appropriate.
- Whether the data collection process introduces bias.

This chapter introduces inference through sampling variability and uncertainty. Advanced hypothesis testing, confidence interval derivations, and formal statistical inference are outside its scope.

### 5.3 Comparison

| Aspect | Descriptive statistics | Inferential statistics |
|---|---|---|
| Primary purpose | Summarize observed data | Draw conclusions beyond observed data |
| Typical input | The dataset being described | A sample from a target population |
| Example | Median latency in recorded requests | Estimate typical latency across future or unobserved requests |
| Main limitation | Does not automatically generalize | Depends on sampling and model assumptions |

A descriptive result can be exact for the observations analyzed while still being an unreliable estimate of a broader population.

## 6. Measures of Central Tendency

A measure of central tendency summarizes the center or typical value of a dataset.

The three common measures are mean, median, and mode.

They describe different aspects of a dataset, so the best choice depends on the data and the question.

### 6.1 Mean

The **arithmetic mean** is calculated by adding all values and dividing by the number of values.

For observations \(x_1,x_2,\ldots,x_n\):

\[
\bar{x}=\frac{1}{n}\sum_{i=1}^{n}x_i
\]

Where:

- \(\bar{x}\) is the sample mean.
- \(x_i\) is an individual observation.
- \(n\) is the number of observations.
- \(\sum\) means to add the values across the observations.

Consider these delivery times:

\[
[10,20,30,40,50]
\]

The sum is:

\[
10+20+30+40+50=150
\]

There are five observations, so:

\[
\bar{x}=\frac{150}{5}=30
\]

The mean delivery time in this dataset is 30 minutes.

**Engineering use:** the mean is useful when the total amount or arithmetic balance matters, but it can be strongly influenced by unusually large or small values.

### 6.2 Median

The **median** is the middle value after sorting the observations.

For an odd number of observations, the median is the middle value.

Example:

\[
[10,20,30,40,50]
\]

The median is 30.

For an even number of observations, the median is the average of the two middle values.

Example:

\[
[10,20,30,40]
\]

The two middle values are 20 and 30:

\[
\text{Median}=\frac{20+30}{2}=25
\]

The median is less sensitive to extreme values than the mean.

Consider request latencies:

\[
[100,110,120,130,1000]
\]

The median is 120 milliseconds. The unusually high latency of 1,000 milliseconds does not move the median as much as it moves the mean.

**Engineering use:** the median is often useful for latency reporting, income-like skewed data, and other situations where extreme observations could distort the average.

### 6.3 Mode

The **mode** is the most frequently occurring value.

For:

\[
[10,20,20,30,40]
\]

The mode is 20 because it appears more often than any other value.

A dataset can have:

- One mode.
- Multiple modes.
- No unique mode, when all observed values occur equally often.

For categorical variables, the mode can identify the most common category.

Example:

```text
Browser observations:
Chrome, Firefox, Chrome, Edge, Chrome, Firefox

Mode = Chrome
```

**Engineering use:** the mode can help summarize common categories, such as the most frequent error type or most frequently selected product category.

### 6.4 Choosing the right measure

| Measure | What it summarizes | Main limitation |
|---|---|---|
| Mean | Arithmetic average | Sensitive to extreme values |
| Median | Middle of sorted values | Does not directly reflect the magnitude of all values |
| Mode | Most frequent value | May not be unique or informative for continuous measurements |

Do not choose a measure simply because it is familiar. Choose it based on the distribution, the type of variable, and the question being answered.

## 7. Measures of Spread: Variance and Standard Deviation

Knowing the center of a dataset is not enough.

Consider two groups of request latencies:

```text
Group A: [98, 99, 100, 101, 102]
Group B: [50, 75, 100, 125, 150]
```

Both groups have a mean of 100 milliseconds.

However, Group A's values are tightly clustered around 100, while Group B's values are much more spread out.

The mean alone cannot express this difference.

**Measures of spread describe how much observations vary around their center.**

### 7.1 Variance

Variance summarizes the average squared deviation from the mean.

For a population of \(N\) values:

\[
\sigma^2=\frac{1}{N}\sum_{i=1}^{N}(x_i-\mu)^2
\]

Where:

- \(\sigma^2\) is the population variance.
- \(N\) is the population size.
- \(x_i\) is an observation.
- \(\mu\) is the population mean.

For a sample, the commonly used sample variance is:

\[
s^2=\frac{1}{n-1}\sum_{i=1}^{n}(x_i-\bar{x})^2
\]

Here, \(s^2\) is the sample variance and \(n-1\) is used in the standard unbiased sample-variance estimator when observations are sampled independently from a population with finite variance.

The distinction matters: population variance describes the complete population, while sample variance is typically used to estimate population variance from a sample.

### 7.2 Worked example

Consider the population:

\[
[2,4,6]
\]

First, calculate the mean:

\[
\mu=\frac{2+4+6}{3}=4
\]

Next, calculate each deviation from the mean:

| Value | Deviation \(x_i-\mu\) | Squared deviation |
|---:|---:|---:|
| 2 | -2 | 4 |
| 4 | 0 | 0 |
| 6 | 2 | 4 |
| **Total** | | **8** |

The population variance is:

\[
\sigma^2=\frac{8}{3}\approx2.67
\]

The squared deviations are used because positive and negative deviations would otherwise cancel out.

Squaring also gives larger deviations more influence on the result.

### 7.3 Why squared deviations?

If we simply averaged deviations from the mean, their sum would be zero.

For the example above:

\[
(-2)+0+2=0
\]

This would not tell us that the values are spread around the mean.

Squaring makes every contribution nonnegative and emphasizes larger deviations.

The trade-off is that variance is expressed in squared units. For latency measured in milliseconds, variance is measured in milliseconds squared.

### 7.4 Standard deviation

The **standard deviation** is the square root of the variance.

For a population:

\[
\sigma=\sqrt{\sigma^2}
\]

For a sample:

\[
s=\sqrt{s^2}
\]

Using the population \([2,4,6]\):

\[
\sigma=\sqrt{\frac{8}{3}}\approx1.63
\]

Standard deviation is expressed in the same units as the original observations.

If latency is measured in milliseconds, standard deviation is also measured in milliseconds.

### 7.5 Interpreting spread correctly

A larger standard deviation indicates greater spread around the mean under the chosen measure.

However, standard deviation does not tell you everything about the distribution.

Two datasets can have the same mean and standard deviation while having different shapes, outliers, or patterns.

Standard deviation also should not be interpreted as a guarantee that all observations lie within one standard deviation of the mean.

That kind of interpretation requires additional assumptions about the distribution.

## 8. Percentiles and Distribution Interpretation

A dataset can have a useful center while still hiding important information about how values are distributed.

Percentiles help describe the position of observations within a distribution.

### 8.1 Percentiles

The \(p\)th percentile is a value such that approximately \(p\)% of observations lie at or below it, subject to the percentile definition and calculation method being used.

For example:

- The 50th percentile corresponds to the median under common definitions.
- The 90th percentile, often written P90, describes a value at or below which approximately 90% of observations fall.
- The 99th percentile, or P99, describes a value at or below which approximately 99% of observations fall.

Exact percentile values can differ across software libraries because they may use different interpolation and indexing conventions.

### 8.2 Example: API latency

Suppose a service reports:

| Metric | Latency |
|---|---:|
| Mean | 120 ms |
| Median | 95 ms |
| P90 | 210 ms |
| P99 | 480 ms |

These figures describe different aspects of request latency.

- The median describes the center of the observed distribution.
- P90 shows that the slower tail extends beyond the typical request.
- P99 helps expose very slow requests that a mean or median might hide.

The percentile values should be calculated from the actual dataset; the table is illustrative.

**Production insight:** reporting only the mean latency can conceal a poor experience for a smaller group of users. Percentiles are often more informative for latency-sensitive systems.

### 8.3 Distribution shape

A distribution describes how values are spread across a range.

Some useful patterns include:

**Approximately symmetric distribution**

Values are distributed in a roughly balanced way around the center.

**Right-skewed distribution**

A long tail extends toward larger values. For example, most API requests may be fast, while a small number take much longer.

**Left-skewed distribution**

A long tail extends toward smaller values.

**Multiple peaks**

A distribution may contain several clusters. For example, one API endpoint may be fast while another is consistently slower, producing multiple latency groups.

The shape matters because the mean, median, and standard deviation can tell different stories depending on the distribution.

### 8.4 Do not assume normality

The normal distribution is important in statistics, but real-world data does not automatically follow it.

Latency, transaction amounts, counts, and user activity can exhibit skewness, heavy tails, multiple clusters, or other patterns.

Before relying on an assumption about a distribution, inspect the observations and consider whether the assumption is appropriate for the problem.

## 9. Sampling Variability and Uncertainty

Suppose a service receives millions of requests each day. You randomly select 1,000 requests and calculate the average latency.

If you select another 1,000 requests, the average may be slightly different.

This is **sampling variability**: different samples from the same population can produce different estimates.

### 9.1 Why samples differ

A sample captures only part of the population.

If the underlying population contains both fast and slow requests, one sample may contain slightly more slow requests than another.

The sample mean will therefore vary.

Sampling variability exists even when the sampling procedure is unbiased and the underlying population remains stable.

### 9.2 Sample size and variability

All else being equal, larger independent random samples tend to provide more stable estimates of a population mean.

For a sample mean, under independent sampling from a population with finite variance, its standard error is:

\[
SE(\bar{x})=\frac{\sigma}{\sqrt{n}}
\]

Where:

- \(SE(\bar{x})\) is the standard error of the sample mean.
- \(\sigma\) is the population standard deviation.
- \(n\) is the sample size.

The formula illustrates that uncertainty in the sample mean decreases as sample size increases, under the stated assumptions.

If the sample size increases by a factor of four, the standard error decreases by a factor of two, assuming the population variability and sampling conditions remain unchanged.

However, larger samples do not automatically remove bias. A million observations collected from an unrepresentative source can still produce a misleading estimate.

### 9.3 Sampling bias

Suppose you want to estimate the average API latency across all users but collect measurements only from users on a high-speed internal network.

The sample may systematically underrepresent the latency experienced by external users.

This is a sampling problem, not merely a sample-size problem.

A larger sample from the same biased source may make the estimate more precise for that source while leaving it inaccurate for the target population.

### 9.4 Practical interpretation

When inspecting an AI/ML dataset or production metrics, ask:

1. What population are we trying to understand?
2. How were the observations collected?
3. Which observations may be missing?
4. Does the sample represent the target population?
5. How much could the result vary across reasonable samples?
6. Are the underlying conditions stable over time?

These questions help distinguish a numerical result from a trustworthy conclusion.

## 10. Correlation Versus Causation

Statistics can reveal relationships between variables, but a relationship does not automatically establish that one variable causes another.

### 10.1 Correlation

**Correlation** describes the direction and strength of a statistical relationship between variables under a chosen measure.

For example, an organization might observe that larger transactions tend to take longer to process.

The variables may be positively associated: as transaction amount increases, processing time may also tend to increase.

A negative association would mean that larger values of one variable tend to occur with smaller values of the other.

A correlation close to zero means little or no linear association under the usual Pearson correlation measure. It does not necessarily mean that no relationship of any kind exists.

### 10.2 Causation

**Causation** concerns whether changing one factor would produce a change in another outcome under appropriate conditions.

Suppose customers who use a premium feature have higher retention.

It would be incorrect to conclude automatically that the premium feature causes higher retention.

Possible explanations include:

- Highly engaged customers are more likely to use the feature.
- Customers with more experience are more likely to select it.
- Another factor influences both feature usage and retention.
- The feature genuinely contributes to retention.

The observed association alone does not distinguish these explanations.

### 10.3 Confounding variables

A **confounding variable** is a factor that can influence both the variable being studied and the outcome, creating or distorting an observed association.

For example, experienced users might be more likely to use a feature and also more likely to remain customers.

Experience could therefore help explain the relationship between feature usage and retention.

Causal conclusions require additional assumptions and suitable study designs. Randomized experiments can help establish causal effects in appropriate settings, while observational studies often require careful adjustment and interpretation.

Detailed experimental methodology belongs to later machine learning and evaluation topics, not this foundational statistics chapter.

### 10.4 Why this matters in AI/ML

A model may identify correlations that are useful for prediction without identifying causal relationships.

For example, an input variable may predict customer churn because it reflects a customer's current behavior. That does not necessarily mean changing the input variable will prevent churn.

**Engineering principle:** predictive usefulness and causal explanation are different goals.

## 11. Outliers and Their Effects

An **outlier** is an observation that differs substantially from the rest of the data under some definition or analysis method.

Consider these response times in milliseconds:

\[
[95,100,102,105,5000]
\]

The value 5,000 is much larger than the other observations.

It might represent:

- A genuine slow request.
- A temporary infrastructure failure.
- A measurement error.
- A data-processing defect.
- A rare but valid event.

An unusual value should not be deleted automatically simply because it looks inconvenient.

### 11.1 Effect on the mean

The mean is:

\[
\bar{x}=\frac{95+100+102+105+5000}{5}
=\frac{5402}{5}=1080.4
\]

The mean is 1,080.4 milliseconds, which is much larger than four of the five observations.

The median is:

\[
\text{Median}=102
\]

The median remains much closer to the typical values in this small dataset.

This demonstrates why a single extreme observation can distort the mean.

### 11.2 Why outliers matter in production

Outliers can reveal important operational events:

- A request that triggered a timeout.
- A transaction with an unexpected value.
- A corrupted measurement.
- A rare failure mode.
- A legitimate but unusual user behavior.

Removing outliers can improve some analyses when they are confirmed measurement errors, but it can also hide real production failures.

### 11.3 A disciplined approach

When you find an outlier:

1. Confirm the units and data type.
2. Check whether the value is valid.
3. Inspect the data collection and processing pipeline.
4. Determine whether it represents a genuine rare event or an error.
5. Decide how to handle it based on the analytical objective.
6. Document the decision and its consequences.

Outlier handling should be a reasoned engineering decision, not an automatic cleanup step.

## 12. Statistics in AI/ML Engineering

Statistics supports AI/ML engineering at several stages.

### 12.1 Dataset inspection

Before training a model, engineers need to understand the data.

Useful summaries include:

- Number of observations.
- Number of missing values.
- Mean and median of numerical features.
- Variance and standard deviation.
- Distribution of categorical labels.
- Percentiles and unusual values.

For example, if a classification dataset contains far more examples of one class than another, a simple overall summary may conceal that imbalance.

Understanding the dataset is a prerequisite for making informed modeling decisions.

### 12.2 Feature understanding

Suppose a model uses customer age, transaction amount, and account activity.

Statistics can help reveal:

- Whether a feature has a highly skewed distribution.
- Whether values fall outside expected ranges.
- Whether missing values are concentrated in a particular subgroup.
- Whether two features exhibit an association.
- Whether observations differ substantially across groups.

These findings can guide further investigation, but they do not automatically establish causal explanations or determine the correct model.

### 12.3 Production monitoring

The same statistical ideas apply after deployment.

Engineers may monitor:

- Request latency percentiles.
- Error rates.
- Transaction amounts.
- Input feature distributions.
- Model prediction distributions.
- Changes in incoming data.

A shift in a statistical summary can signal a change in workload, customer behavior, data collection, or system performance.

However, a changed mean alone does not identify the cause. It is a signal to investigate, not a complete diagnosis.

### 12.4 Boundaries with machine learning evaluation

This chapter teaches general statistical foundations.

It does not provide detailed instruction on:

- Classification metrics such as precision and recall.
- Train, validation, and test set design.
- Cross-validation.
- Model selection.
- Formal hypothesis testing for model comparisons.
- Production model evaluation protocols.

Those topics belong to the Machine Learning Foundations pillar and should build on the statistical concepts introduced here rather than duplicating them.

## 13. Common Mistakes

### Mistake 1: Treating the mean as the complete description of a dataset

Two datasets can have the same mean but very different spreads and shapes.

**Correction:** inspect measures of center, spread, and distribution together.

### Mistake 2: Assuming the sample represents the population

A sample can systematically exclude important groups.

**Correction:** examine how the data was collected and whether it represents the target population.

### Mistake 3: Confusing variance with standard deviation

Variance uses squared deviations and is expressed in squared units. Standard deviation is the square root of variance and uses the original units.

**Correction:** identify which measure is being reported and what its units mean.

### Mistake 4: Assuming a larger sample removes every problem

A larger sample can reduce sampling variability under suitable conditions, but it does not automatically eliminate selection bias or measurement errors.

**Correction:** evaluate data quality and sampling design as well as sample size.

### Mistake 5: Assuming correlation proves causation

Two variables may be associated because of a shared cause or another underlying factor.

**Correction:** distinguish predictive relationships from causal claims.

### Mistake 6: Deleting every outlier

An outlier may be a valid observation of a rare but important event.

**Correction:** investigate the observation before deciding how to handle it.

### Mistake 7: Reporting percentiles without context

Percentiles depend on the dataset, population, measurement period, and calculation method.

**Correction:** state what observations were analyzed and how the percentile was calculated.

### Mistake 8: Assuming every dataset follows a normal distribution

Real-world data can be skewed, multimodal, or heavy-tailed.

**Correction:** inspect the distribution rather than forcing a familiar model onto the data.

## 14. Interview Questions and Expected Answers

### Q1. What is the difference between a population and a sample?

A population is the complete group relevant to a question. A sample is a subset of observations used to describe or infer properties of that population.

### Q2. What is the difference between descriptive and inferential statistics?

Descriptive statistics summarize the observed data. Inferential statistics use sample evidence to draw conclusions about a broader population or process, with uncertainty and assumptions.

### Q3. When would you use the median instead of the mean?

The median is often useful when the distribution is skewed or contains extreme values that could distort the mean. The choice depends on the question and data characteristics.

### Q4. What is the difference between variance and standard deviation?

Variance summarizes squared deviations from the mean. Standard deviation is the square root of variance and is expressed in the original units of the data.

### Q5. Why can two datasets with the same mean behave differently?

They can have different spreads, outliers, skewness, or multiple clusters. The mean alone does not describe the entire distribution.

### Q6. What is sampling variability?

Sampling variability is the variation in a statistic across different samples from the same population. It occurs because different samples contain different observations.

### Q7. Does increasing sample size guarantee an unbiased estimate?

No. A larger sample can reduce sampling variability under suitable assumptions, but systematic selection bias or measurement errors can remain.

### Q8. What does the 99th percentile of API latency mean?

It is a latency value at or below which approximately 99% of observations fall, according to the dataset and percentile method used. It helps describe the slow tail of the latency distribution.

### Q9. Why does correlation not prove causation?

An observed association may result from confounding variables, reverse direction, or other factors. Establishing causation requires suitable assumptions and evidence beyond correlation alone.

### Q10. How would you investigate an outlier in production data?

Verify its units and validity, inspect the source and processing pipeline, determine whether it represents an error or genuine event, and document any handling decision based on the analysis objective.

## 15. Quick Revision

- **Population:** the complete group relevant to the question.
- **Sample:** a subset of observations from a population.
- **Observation:** one recorded case or unit.
- **Dataset:** an organized collection of observations and variables.
- **Descriptive statistics:** summarize observed data.
- **Inferential statistics:** use sample evidence to draw conclusions beyond the observed data.
- **Mean:** arithmetic average.
- **Median:** middle value after sorting.
- **Mode:** most frequently occurring value.
- **Variance:** measure based on squared deviations from the mean.
- **Standard deviation:** square root of variance, expressed in the original units.
- **Percentile:** describes the position of a value within a distribution.
- **Sampling variability:** variation in a statistic across different samples.
- **Sampling bias:** systematic distortion caused by how observations are selected or collected.
- **Correlation:** statistical association between variables.
- **Causation:** a relationship in which changing one factor produces a change in another under appropriate conditions.
- **Outlier:** an observation that differs substantially from the rest under a chosen method.

The central principle is that statistics helps engineers summarize data and reason about uncertainty. Reliable conclusions require more than calculating formulas: they require understanding the population, the data collection process, the distribution, and the limitations of the analysis.

## 16. Further Reading

- [Chapter 02 — Algebra, Exponents and Logarithms](02-Algebra-Exponents-and-Logarithms.md): mathematical notation and algebraic foundations.
- [Chapter 03 — Probability Fundamentals](03-Probability-Fundamentals.md): probability, conditional probability, and uncertainty.
- [Chapter 05 — Linear Algebra Foundations](05-Linear-Algebra-Foundations.md): mathematical representations used in AI/ML.
- [AIF-03 — Machine Learning Foundations](../AIF-03-Machine-Learning-Foundations/README.md): planned cross-pillar reference for model evaluation and data-related methodology; verify the target file exists in the repository.

**Scope boundary:** This chapter owns foundational descriptive and inferential statistics concepts, central tendency, spread, percentiles, sampling variability, correlation, and outliers. It does not teach advanced statistical inference, formal hypothesis testing, detailed ML evaluation methodology, or experimental design in depth.

---

# End of Document

**Target path:** `docs/02-AIF/AIF-01-Mathematics-Foundation/04-Statistics-Fundamentals.md`
