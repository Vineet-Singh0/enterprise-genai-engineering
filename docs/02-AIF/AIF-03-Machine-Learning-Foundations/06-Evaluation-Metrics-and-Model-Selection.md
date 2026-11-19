# Evaluation Metrics and Model Selection

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain why a model evaluation metric must reflect the real-world objective.
- Select appropriate metrics for classification and regression problems.
- Interpret confusion matrices, precision, recall, F1-score, and classification thresholds.
- Explain why accuracy can be misleading for imbalanced datasets.
- Understand the foundational purpose and limitations of ranking and clustering metrics.
- Establish baselines and compare candidate models using consistent evidence.
- Reason about trade-offs between competing metrics and operational constraints.
- Distinguish offline evaluation results from real-world system outcomes.
- Recommend a model based on evidence rather than a single attractive score.

## Prerequisites

You should understand:

- [01 — ML Problem Formulation](01-ML-Problem-Formulation.md)
- [02 — Learning Paradigms](02-Learning-Paradigms.md)
- [03 — Data Preparation, Features, and Labels](03-Data-Preparation-Features-and-Labels.md)
- [04 — Bias, Variance, and Generalization](04-Bias-Variance-and-Generalization.md)
- [05 — Model Evaluation and Cross-Validation](05-Model-Evaluation-and-Cross-Validation.md)

Chapter 05 explains how to obtain trustworthy evaluation evidence. This chapter explains how to interpret that evidence and use it to make model-selection decisions.

## Estimated Reading Time

- Reading: 30–40 minutes
- Reading with worked examples and assignment: 50–70 minutes

## 1. Before We Start

Imagine that an organization builds a model to identify customers who are likely to cancel their subscriptions.

Two candidate models are evaluated:

- Model A achieves 96% accuracy.
- Model B achieves 89% accuracy.

Which model should the organization deploy?

The answer depends on what the model is expected to accomplish.

If cancellations are rare, Model A might predict that almost every customer will remain subscribed. It could achieve high accuracy while missing most customers who actually cancel.

Model B might correctly identify more customers at risk, even though its overall accuracy is lower.

Neither model should be selected solely from these two numbers.

The engineering question is not:

> Which model has the highest score?

It is:

> Which model provides the most useful, reliable performance for the intended objective, under the relevant operational constraints?

That question requires three connected decisions:

1. **Define the objective:** What does success mean for the system?
2. **Measure performance:** Which metrics provide evidence about that objective?
3. **Select the model:** Which candidate offers the best justified trade-off?

Metrics are not merely reporting tools. They influence how engineers interpret model behavior and which candidate they choose.

A poorly chosen metric can lead to a technically successful experiment that produces an unsuccessful product.

## 2. From Business Objective to Evaluation Metric

A metric should follow from the problem formulation, not the other way around.

Consider three different prediction systems:

| System | Intended outcome | Important evaluation concern |
|---|---|---|
| Fraud detection | Identify fraudulent transactions | Missing fraud versus investigating legitimate transactions |
| House-price prediction | Estimate selling prices | Magnitude of prediction errors |
| Search ranking | Place useful results near the top | Quality and ordering of the highest-ranked results |

All three systems can be evaluated numerically, but the same metric will not adequately describe their performance.

For fraud detection, the costs of false positives and false negatives may differ substantially.

For house-price prediction, an error of a certain monetary amount may matter more than whether the prediction is merely close in relative terms.

For search ranking, getting the most relevant result near the top may matter more than identifying a relevant result somewhere in a long list.

### 2.1 A metric is a proxy for the objective

A metric is a measurable representation of some aspect of success.

It is not necessarily the complete objective.

For example:

- Accuracy measures the fraction of correct classifications.
- Recall measures the fraction of actual positive cases identified.
- Mean absolute error measures the average magnitude of regression errors.
- A ranking metric evaluates properties of the order in which items are presented.

Each metric answers a particular question. None automatically answers every question about model usefulness.

A useful engineering habit is to state the question a metric answers before choosing it.

### 2.2 Translate the objective into measurable behavior

Before selecting a metric, establish:

- What is the prediction unit?
- What counts as a correct prediction?
- Which mistakes are most costly?
- Does the system need a class label, a probability, a numerical estimate, or a ranking?
- Will the model operate under a fixed decision threshold or a configurable one?
- What constraints exist on latency, throughput, cost, and human review?
- What evidence would justify deploying the model?

These questions connect metric selection to the problem formulation in Chapter 01 and the evaluation protocol in Chapter 05.

## 3. Classification Metrics

Classification predicts a category, such as fraudulent or legitimate, churn or no churn, or approved or rejected.

To understand classification metrics, first understand the four outcomes produced by comparing predictions with actual labels.

### 3.1 The confusion matrix

Consider a binary classification problem with two classes:

- Positive: the event or condition of interest.
- Negative: the absence of that event or condition.

The model's predictions can be divided into four outcomes.

| | Actual positive | Actual negative |
|---|---|---|
| **Predicted positive** | True positive (TP) | False positive (FP) |
| **Predicted negative** | False negative (FN) | True negative (TN) |

These outcomes have distinct meanings.

- **True positive:** The model correctly identifies a positive case.
- **False positive:** The model predicts positive when the actual class is negative.
- **False negative:** The model misses a positive case.
- **True negative:** The model correctly identifies a negative case.

The business meaning of these outcomes depends on the application.

In fraud detection, a false positive may trigger an unnecessary investigation. A false negative may allow fraudulent activity to proceed.

In a medical screening workflow, a false negative may delay further examination, while a false positive may lead to unnecessary follow-up.

The model does not determine which mistake is more costly. That is a decision informed by the application and its stakeholders.

### 3.2 Accuracy

Accuracy measures the fraction of predictions that are correct.

\[
\text{Accuracy} = \frac{TP+TN}{TP+TN+FP+FN}
\]

Accuracy is useful when overall correctness is an appropriate summary and the consequences of different mistakes are adequately reflected by that objective.

However, it can be misleading when classes are highly imbalanced or different mistakes have very different costs.

#### Example: the imbalanced-class problem

Suppose a fraud dataset contains 10,000 transactions:

- 9,900 legitimate transactions.
- 100 fraudulent transactions.

A model predicts that every transaction is legitimate.

It correctly classifies 9,900 transactions and misses all 100 fraudulent transactions.

Its accuracy is:

\[
\text{Accuracy} = \frac{9900}{10000} = 99\%
\]

The score looks excellent, but the model identifies no fraud.

This is why accuracy should not be selected automatically, especially when the positive class is rare or costly to miss.

### 3.3 Precision

Precision measures how often predicted positive cases are actually positive.

\[
\text{Precision} = \frac{TP}{TP+FP}
\]

Precision answers:

> Among the cases the model flagged as positive, what fraction were truly positive?

High precision can be important when false positives are expensive.

Examples include:

- Sending a limited number of fraud alerts to a human investigation team.
- Escalating only high-confidence support incidents.
- Initiating an expensive review process.

However, high precision alone does not guarantee that the model identifies most positive cases. A model that flags very few examples may achieve high precision while missing many true positives.

If there are no predicted positive cases, precision is mathematically undefined. Libraries often apply a configurable convention for this situation, so evaluation reports should make the chosen behavior clear when relevant.

### 3.4 Recall

Recall measures how many actual positive cases the model identifies.

\[
\text{Recall} = \frac{TP}{TP+FN}
\]

Recall answers:

> Among all actual positive cases, what fraction did the model find?

Recall is important when missing positive cases is expensive.

Examples include:

- Detecting potentially fraudulent transactions.
- Screening for conditions that warrant further examination.
- Identifying customers at risk of cancellation when missing them has a substantial cost.

High recall can come at the expense of precision. A model may identify more positive cases by flagging additional examples, including more negative cases.

If the evaluation data contains no actual positive cases, recall is undefined for that dataset.

### 3.5 F1-score

The F1-score is the harmonic mean of precision and recall.

\[
F_1 = 2 \cdot \frac{P \cdot R}{P+R}
\]

Where \(P\) is precision and \(R\) is recall.

The harmonic mean penalizes a low value more strongly than an ordinary arithmetic mean would. A model with very high precision but very low recall will not achieve a high F1-score simply because one component is excellent.

F1-score can be useful when both precision and recall matter and the team wants a single summary of their balance.

However, F1-score has limitations:

- It does not directly incorporate business costs.
- It does not include true negatives in its formula.
- It does not establish that precision and recall are equally important to the application.
- It depends on the selected classification threshold.
- It may conceal meaningful differences between two models with similar scores.

Do not choose F1-score merely because it combines two metrics. Choose it when the resulting trade-off aligns with the task.

### 3.6 Specificity

Specificity measures the fraction of actual negative cases correctly identified.

\[
\text{Specificity} = \frac{TN}{TN+FP}
\]

Specificity answers:

> Among all actual negative cases, what fraction did the model correctly leave unflagged?

It can be useful when false positives matter and the team wants to understand how well the model recognizes negative cases.

Recall and specificity describe different aspects of classification behavior:

- Recall measures identification of actual positives.
- Specificity measures correct identification of actual negatives.

A model can perform well on one and poorly on the other.

### 3.7 Summary of common classification metrics

| Metric | Main question | Often useful when |
|---|---|---|
| Accuracy | What fraction of all predictions are correct? | Overall correctness is meaningful |
| Precision | How many flagged positives are truly positive? | False positives are costly |
| Recall | How many actual positives are identified? | False negatives are costly |
| F1-score | How well are precision and recall balanced? | Both matter and a combined summary is useful |
| Specificity | How many actual negatives are correctly identified? | Correctly rejecting negative cases matters |

These metrics are related, but they are not interchangeable.

## 4. Classification Thresholds and Decision Trade-offs

Many classifiers produce a score or estimated probability rather than a final class label.

A decision rule then converts that output into a prediction.

For example, a classifier might estimate:

\[
P(\text{churn}\mid x)=0.72
\]

A system using a threshold of \(0.50\) classifies this customer as likely to churn. A system using a threshold of \(0.80\) does not.

The model's scores have not changed. The decision rule has.

### 4.1 What happens when the threshold changes?

Lowering the threshold generally makes the classifier predict positive for more examples.

This often:

- Increases recall.
- Decreases precision.
- Increases false positives.

Raising the threshold generally makes the classifier predict positive for fewer examples.

This often:

- Increases precision.
- Decreases recall.
- Increases false negatives.

These are common tendencies, not guaranteed outcomes for every finite dataset and metric calculation.

### 4.2 Threshold selection is a decision problem

Suppose a fraud team can investigate only 200 alerts each day.

A threshold that identifies nearly every fraudulent transaction may produce thousands of alerts, exceeding the team's capacity.

A higher threshold might reduce the workload but miss more fraud.

The appropriate threshold therefore depends on more than a generic preference for precision or recall. It depends on the consequences of errors, the available operational capacity, and the objective of the system.

A disciplined process is:

1. Define the operational objective and constraints.
2. Evaluate candidate thresholds using validation data.
3. Compare the resulting trade-offs.
4. Select a threshold based on explicit decision criteria.
5. Freeze the decision procedure before the final test assessment.
6. Monitor the resulting behavior after deployment.

Threshold tuning is part of model development. The test set should not be repeatedly used to select a threshold.

### 4.3 Ranking scores and final decisions are different

A model can rank examples well while performing poorly at a particular threshold.

Conversely, a model can perform acceptably at one selected threshold while having a less useful ranking across the full population.

This distinction matters when the organization may later change its alert capacity or operating policy.

If the system uses scores to prioritize a queue, ranking quality may be more important than a single threshold-specific classification metric.

## 5. Regression Metrics

Regression predicts a numerical value, such as a house price, delivery duration, demand quantity, or expected revenue.

Regression metrics describe different aspects of prediction error. Their suitability depends on the units of the target, the distribution of errors, and the operational objective.

Let:

- \(y_i\) be the actual target for example \(i\).
- \(\hat{y}_i\) be the model's prediction.
- \(n\) be the number of evaluated examples.

### 5.1 Mean Absolute Error (MAE)

MAE is the average absolute difference between predictions and actual values.

\[
\text{MAE}=\frac{1}{n}\sum_{i=1}^{n}|y_i-\hat{y}_i|
\]

MAE answers:

> On average, how large is the prediction error in the target's units?

Suppose a delivery-time model predicts delivery durations in minutes and has an MAE of 8 minutes.

The average absolute prediction error is 8 minutes on the evaluated examples.

This does not mean every prediction is wrong by exactly 8 minutes, nor does it describe the worst-case error.

**Advantages**

- Relatively easy to interpret.
- Uses the same units as the target.
- Does not square errors, so individual large errors have less influence than under squared-error metrics.

**Limitations**

- Hides the distribution of individual errors.
- Does not distinguish overprediction from underprediction.
- Can conceal rare but operationally severe errors.

MAE is often useful when the average magnitude of errors is the main concern.

### 5.2 Mean Squared Error (MSE)

MSE is the average squared difference between predictions and actual values.

\[
\text{MSE}=\frac{1}{n}\sum_{i=1}^{n}(y_i-\hat{y}_i)^2
\]

Squaring errors gives larger errors disproportionately more influence.

For example, an error of 10 contributes 100 squared units, while an error of 2 contributes only 4 squared units.

This makes MSE sensitive to large mistakes.

**Advantages**

- Strongly penalizes large errors.
- Is mathematically convenient for many optimization procedures.

**Limitations**

- Uses squared target units, making interpretation less direct.
- Can be dominated by a small number of large errors.
- May not reflect the business cost of an error unless that penalty is appropriate.

MSE is useful when large errors should receive disproportionately high penalties, but that choice should be justified.

### 5.3 Root Mean Squared Error (RMSE)

RMSE is the square root of MSE.

\[
\text{RMSE}=\sqrt{\text{MSE}}
\]

RMSE returns to the target's units while retaining the stronger influence of large errors.

For example, if a demand forecast has an RMSE of 15 units, the metric is expressed in the same units as the demand target.

Like MSE, RMSE is sensitive to large errors. It is often easier to communicate than MSE because its units match the target.

RMSE should not be interpreted as the maximum error or as a guarantee that most predictions fall within a fixed distance of the actual value.

### 5.4 Coefficient of determination (\(R^2\))

The coefficient of determination compares a model's squared prediction error with the error associated with predicting the mean of the observed targets.

A common definition is:

\[
R^2=1-\frac{\sum_{i=1}^{n}(y_i-\hat{y}_i)^2}{\sum_{i=1}^{n}(y_i-\bar{y})^2}
\]

Where \(\bar{y}\) is the mean of the actual target values in the evaluation dataset.

Under this definition:

- \(R^2=1\) indicates perfect predictions on the evaluated examples.
- \(R^2=0\) indicates squared error equal to that of the mean-prediction baseline on those examples.
- \(R^2<0\) indicates worse squared error than that baseline.

A negative \(R^2\) is possible, especially when the model performs poorly on data it did not fit.

**Important limitations**

- \(R^2\) does not directly express error in business units.
- A high value does not guarantee small errors for important individual cases.
- It does not establish that the model is causally correct.
- It can be difficult to compare across datasets with different target variability.
- Its interpretation depends on the evaluation setup and definition used.

Use \(R^2\) alongside an error metric when the application requires both a relative comparison to a baseline and an interpretable measure of prediction error.

### 5.5 Comparing regression metrics

| Metric | Error treatment | Units | Main consideration |
|---|---|---|---|
| MAE | Absolute errors | Same as target | Average magnitude of errors |
| MSE | Squared errors | Squared target units | Strong penalty for large errors |
| RMSE | Square root of average squared errors | Same as target | More sensitive to large errors than MAE |
| \(R^2\) | Compares squared error with a mean baseline | Dimensionless | Relative performance against that baseline |

No metric is universally best.

If a business is especially concerned about rare, very large forecasting errors, RMSE may be more informative than MAE. If the business wants an understandable average error in operational units, MAE may be easier to communicate.

The final choice depends on the consequences of prediction errors and the behavior the organization needs to control.

## 6. Ranking and Clustering Metrics: Foundational Overview

Not every machine learning system predicts a class label or a continuous value.

Some systems rank items by relevance. Others group examples without predefined labels.

Their evaluation requires different questions.

### 6.1 Ranking metrics

Ranking systems order items according to their estimated relevance or usefulness.

Examples include:

- Search-result ordering.
- Product recommendations.
- Retrieval systems.
- Prioritization queues.

For a ranking system, the position of an item can matter. A useful result at rank 1 may be more valuable than the same result at rank 50.

Two foundational metrics are:

**Precision@k:** The fraction of the top \(k\) returned items that are relevant.

\[
P@k=\frac{\text{Relevant items in top }k}{k}
\]

This is useful when the application cares about the proportion of relevant items among the first \(k\) results.

**Recall@k:** The fraction of all relevant items that appear among the top \(k\) returned items.

\[
R@k=\frac{\text{Relevant items in top }k}{\text{Total relevant items}}
\]

This is useful when the application cares about how many relevant items are surfaced within a limited result set.

These metrics answer different questions. A system can achieve high Precision@k while missing many relevant items elsewhere in the collection.

Other ranking metrics account for position or graded relevance. Their detailed treatment belongs in later retrieval-focused work where ranking quality is evaluated in the context of a complete retrieval pipeline.

### 6.2 Clustering metrics

Clustering groups examples without requiring predefined class labels during the learning process.

Evaluation is challenging because a cluster assignment is not automatically meaningful just because an algorithm has produced groups.

Two broad evaluation approaches are:

**Internal evaluation:** Examines properties of the resulting clusters using the data and structure available, without relying on known ground-truth labels.

For example, the silhouette score considers how close a point is to its own cluster compared with other clusters. It can help assess separation and cohesion under the chosen distance measure.

**External evaluation:** Compares the discovered groupings with independently available reference labels or assignments.

External evaluation is possible only when suitable reference information exists. Such labels may not capture the purpose for which clustering is being used.

A clustering solution can look strong under an internal metric but still produce groups that are not useful to the business. Conversely, meaningful groups may not maximize a generic geometric metric.

For example, a retailer might cluster customers to design service strategies. The final evaluation should examine whether the groups are interpretable, stable enough for the intended use, and useful for the decisions they are meant to support.

### 6.3 Choose metrics for the system's role

For ranking and clustering, ask:

- What constitutes a useful result?
- Does order matter?
- Are reference labels available and trustworthy?
- What distance or relevance assumptions does the metric make?
- Will the metric reflect the decision that the system supports?

These questions provide the foundation for later work on retrieval, recommendation, and representation-based systems without turning this chapter into an exhaustive metric catalog.

## 7. Class Imbalance and Metric Interpretation

Class imbalance occurs when one class is much more common than another.

Examples include:

- Fraud detection, where fraudulent transactions may be rare.
- Equipment failure prediction, where failures are uncommon.
- Churn prediction, where cancellations may represent a minority of customers.
- Security incident detection, where true incidents are much less common than ordinary activity.

Imbalance is not inherently a data defect. It may accurately reflect the real environment.

The danger is choosing a metric that hides the model's failure on the less common but important class.

### 7.1 Why accuracy can conceal failure

Return to the fraud example:

- 9,900 legitimate transactions.
- 100 fraudulent transactions.
- The model predicts every transaction as legitimate.

Accuracy is 99%, but recall for fraud is 0%.

The model is successful according to overall accuracy but unsuccessful at identifying fraud.

This is a metric-objective mismatch.

### 7.2 Precision and recall expose different failure modes

Suppose two models produce these results on the same evaluation set:

| Metric | Model A | Model B |
|---|---:|---:|
| Precision | 0.95 | 0.75 |
| Recall | 0.40 | 0.85 |

Model A's positive predictions are more reliable, but it misses many positive cases.

Model B identifies a larger fraction of positive cases, but a greater proportion of its alerts are false positives.

Neither model is automatically superior.

The correct decision depends on the cost of missed positives, the cost of false alarms, and the capacity to act on predictions.

### 7.3 Imbalance does not automatically require resampling

A common reaction to class imbalance is to rebalance the training data. That may be useful in some settings, but it is not a universal requirement.

Before changing the data distribution, determine:

- Whether the current metric reflects the actual objective.
- Whether the model learns useful patterns for the minority class.
- Whether class-specific errors are acceptable.
- Whether the evaluation data reflects real-world prevalence.
- Whether a changed training distribution would distort probability interpretation or the operating behavior.

Any resampling or weighting decision should be applied within the training procedure and evaluated using an appropriate protocol. Evaluation data should not be artificially altered merely to make results appear better.

## 8. Baselines: Establishing What Good Means

A candidate model's score is not very informative without a reference point.

A **baseline** is a simple or established approach used to judge whether additional model complexity provides meaningful value.

The baseline should be appropriate to the task.

Examples include:

- A majority-class predictor for a classification task.
- A mean or median predictor for regression.
- A simple rule-based system.
- The currently deployed model.
- A business-as-usual process without machine learning.

### 8.1 Why baselines matter

Suppose a regression model achieves an MAE of 12 units.

Is that good?

The answer is unclear until the team compares it with a suitable baseline. If a simple median predictor achieves an MAE of 11 units, the new model may not justify its additional complexity.

If the baseline achieves an MAE of 25 units, the candidate may represent a substantial improvement.

The comparison must use the same evaluation data and protocol, with the same target definition and metric.

### 8.2 Baselines should reflect the real problem

A baseline can be too weak to provide a meaningful comparison.

For example, comparing a sophisticated demand forecast only against a trivial constant prediction may exaggerate its practical value if the business already uses a strong seasonal forecasting process.

A useful baseline may include:

- The simplest reasonable prediction strategy.
- The current operational approach.
- A previously validated model.
- A rule-based solution that captures existing domain knowledge.

The goal is not to make the new model look impressive. It is to determine whether it provides meaningful value beyond what already exists.

## 9. Model Selection as an Engineering Decision

Model selection is the process of choosing a candidate approach using evaluation evidence and the constraints of the intended application.

The highest score on one metric is not necessarily the best overall choice.

A model may have stronger predictive performance but also require:

- More computation.
- Higher serving latency.
- More memory.
- More expensive infrastructure.
- More complicated deployment.
- Greater operational maintenance.
- More difficult explanations or audits.

These factors may or may not justify choosing a simpler alternative.

### 9.1 Compare candidates fairly

A fair comparison requires a consistent evaluation procedure.

Where applicable, candidates should use:

- The same evaluation dataset or equivalent evaluation folds.
- The same target definition.
- The same metric definitions.
- The same prediction-time information constraints.
- The same rules for preprocessing and leakage prevention.
- Comparable tuning budgets when the comparison is intended to assess model families fairly.

If the evaluation conditions change between candidates, score differences may reflect the protocol rather than the model.

Chapter 05 covers the design of those evaluation conditions.

### 9.2 Define selection criteria before inspecting results

Before running the comparison, decide what evidence will determine the choice.

For example:

- A minimum acceptable recall.
- A maximum acceptable false-positive rate.
- A required improvement over the current baseline.
- A maximum inference latency.
- A serving-cost budget.
- A constraint on model complexity or operational support.

These criteria reduce the temptation to invent a justification after seeing the scores.

They also make model-selection decisions easier to review and reproduce.

### 9.3 Avoid optimizing every metric simultaneously

Models frequently trade off one property against another.

A classifier with higher recall may have lower precision. A more complex model may improve error rates while increasing latency. A ranking system may improve top-result relevance while reducing broader coverage.

When no candidate dominates every relevant dimension, the decision requires explicit priorities.

A useful practice is to distinguish:

1. **Hard constraints:** Requirements that a candidate must satisfy.
2. **Primary objective:** The outcome the team is primarily trying to improve.
3. **Secondary considerations:** Other useful properties, such as latency, interpretability, or cost.
4. **Uncertainty:** How reliable the available comparison evidence is.

This structure turns model selection from a search for one impressive score into a defensible engineering decision.

## 10. Offline Metrics Versus Real-World Outcomes

Offline evaluation measures model behavior on a dataset under a defined evaluation procedure.

Production outcomes depend on the model and the surrounding system.

For example, a churn model may identify customers at risk of cancellation. The business then sends retention offers to some of those customers.

Even if the model identifies likely churners accurately, the business result depends on additional factors:

- Whether the customers can be reached.
- Whether the offer changes their behavior.
- Whether the intervention costs more than the value it preserves.
- Whether the organization can deliver the intervention at scale.
- Whether the model changes how customers are treated.
- Whether the operating environment changes after deployment.

A model metric does not directly establish that the intervention is profitable or effective.

### 10.1 Prediction quality is not the same as decision quality

Suppose two models identify similar sets of customers at risk.

Model A has a slightly better predictive metric. Model B is cheaper to serve and produces a list that the retention team can process reliably.

Depending on the business objective, Model B may be the more useful system.

Similarly, a fraud model's recall may improve while the number of alerts exceeds the investigation team's capacity. The system's practical performance may worsen despite an improvement in a selected metric.

The system must be evaluated at the level of the decision it supports, not only at the level of its predictions.

### 10.2 Offline evaluation remains essential

This does not make offline metrics unimportant.

They provide controlled evidence for comparing candidates before deployment, detecting obvious failure modes, and deciding whether a candidate deserves further testing.

The engineering mistake is treating an offline score as a complete statement about production value.

A sound process uses offline evaluation as one stage in a larger system lifecycle and verifies real-world outcomes after deployment.

## 11. Worked Example: Selecting a Churn Model

Assume a subscription business wants to identify customers who are likely to cancel within the next 30 days.

The organization can contact a limited number of customers each week with retention offers.

Two candidate models have been evaluated on the same validation dataset using the same protocol.

| Measure | Model A | Model B |
|---|---:|---:|
| Accuracy | 0.94 | 0.89 |
| Precision | 0.80 | 0.65 |
| Recall | 0.45 | 0.82 |
| F1-score | 0.58 | 0.73 |

These values are illustrative, not empirical findings. Their interpretation assumes consistent metric definitions and a comparable evaluation protocol.

### 11.1 Start with the business objective

The business can contact only a limited number of customers.

The team must determine whether the primary goal is to:

- Identify as many future cancellations as possible.
- Minimize wasted retention offers.
- Maximize the expected value of the retention program.
- Operate within a fixed intervention budget.

These goals are related but not identical.

### 11.2 Interpret the metrics

Model A has higher accuracy and precision.

Its flagged customers are more likely to cancel, but its recall is much lower. It misses a larger fraction of actual cancellations.

Model B has lower accuracy and precision, but substantially higher recall and a higher F1-score. It identifies more of the customers who eventually cancel, while producing more false positives.

The metric table describes the trade-off. It does not determine which trade-off is best for the business.

### 11.3 Check the operating constraints

If the organization can process only a limited number of customers, the team should examine how many alerts each model produces at the selected operating threshold.

The team should also consider the cost of offers sent to customers who would not have canceled, and the value of retaining customers who would otherwise have canceled.

The team may need to compare threshold choices rather than accepting the default threshold for either model.

### 11.4 Compare with a baseline

The team should compare both candidates against a reasonable baseline, such as the current retention targeting process.

If neither model improves the operational outcome sufficiently to justify its costs, deploying a model may not be worthwhile.

### 11.5 Make a justified recommendation

A defensible recommendation would document:

- The primary objective.
- The selected metric and why it matches the objective.
- Relevant secondary metrics.
- Threshold and alert-volume constraints.
- Baseline performance.
- The evaluation protocol.
- Model latency and serving cost where relevant.
- Remaining uncertainties and planned production monitoring.

The correct recommendation may be Model A, Model B, a different threshold, or neither candidate. The answer depends on evidence that is not contained in the score table alone.

## 12. Engineering Decisions and Trade-offs

| Decision | Potential benefit | Cost or risk |
|---|---|---|
| Optimize accuracy | Simple overall correctness measure | Can hide failures on rare or costly classes |
| Optimize precision | Reduces the proportion of false alarms among flagged positives | May miss more actual positives |
| Optimize recall | Identifies a larger fraction of actual positives | May increase false positives and operational workload |
| Use F1-score | Summarizes precision-recall balance | Does not directly represent business costs |
| Use MAE | Interpretable average error in target units | Does not strongly penalize large errors |
| Use RMSE | Gives larger errors more influence while retaining target units | Can be dominated by outliers |
| Use \(R^2\) | Compares squared error against a mean baseline | Does not directly express business-unit error |
| Tune a classification threshold | Aligns prediction decisions with operating requirements | Can overfit the validation set if selection is not controlled |
| Choose a more complex model | May improve predictive performance | Can increase serving cost and operational burden |
| Choose a simpler model | Can reduce latency, cost, and maintenance | May sacrifice useful predictive performance |
| Optimize a ranking metric | Aligns evaluation with result ordering | May ignore relevance outside the measured cutoff |
| Select by offline score alone | Makes comparisons easy to summarize | Can miss system-level costs and real-world outcomes |

The objective is not to maximize the number of metrics reported. It is to choose a small, meaningful set of measures that supports the actual decision, then explain the trade-offs clearly.

## 13. Common Mistakes

### Mistake 1: Choosing a metric because it is familiar

Accuracy is easy to understand, but it may not reflect the consequences of different classification errors.

**Better approach:** Begin with the objective and error costs, then select metrics that expose the relevant behavior.

### Mistake 2: Reporting one metric without supporting evidence

A single score can conceal important failure modes.

**Better approach:** Use a primary metric with a small set of complementary measures and explain what each contributes.

### Mistake 3: Treating precision and recall as interchangeable

Precision measures the reliability of positive predictions. Recall measures the fraction of actual positives found.

**Better approach:** State the denominator and the practical question each metric answers.

### Mistake 4: Assuming the default classification threshold is correct

A default threshold may not match the application's costs, alert capacity, or decision requirements.

**Better approach:** Evaluate thresholds using validation data and define the operating criteria explicitly.

### Mistake 5: Comparing candidates under different evaluation conditions

Different splits, preprocessing rules, or target definitions can make a model comparison misleading.

**Better approach:** Use a consistent, leakage-safe protocol for candidate comparisons.

### Mistake 6: Ignoring baselines

A sophisticated model may appear useful while providing little improvement over an existing process.

**Better approach:** Compare against simple, meaningful baselines and the current operational approach.

### Mistake 7: Assuming a higher \(R^2\) or lower error guarantees business value

Predictive quality is only one component of a system's usefulness.

**Better approach:** Connect the metric to operational decisions, costs, and outcomes.

### Mistake 8: Treating the best validation score as the final truth

Repeated model and threshold tuning can adapt the development process to validation-specific patterns.

**Better approach:** Follow the evaluation protocol established in Chapter 05 and preserve the final test assessment for its intended role.

### Mistake 9: Ignoring metric limitations

Metrics rely on assumptions and summarize only selected aspects of behavior.

**Better approach:** Document what a metric captures, what it omits, and which complementary evidence is required.

## 14. Interview Questions with Expected Answers

### Q1. How do you select an evaluation metric for a machine learning problem?

**Expected answer:** I start with the problem's objective, prediction unit, consequences of different errors, and operational constraints. I then select a primary metric and complementary measures that expose important failure modes. I verify that the evaluation protocol supports a fair comparison.

### Q2. Why can a classifier achieve high accuracy but still be useless?

**Expected answer:** If one class dominates, a model can achieve high accuracy by predicting the majority class while failing to identify the minority class. I would examine class-specific metrics such as precision and recall and connect them to the task's error costs.

### Q3. Explain the difference between precision and recall.

**Expected answer:** Precision measures the fraction of predicted positive cases that are actually positive. Recall measures the fraction of actual positive cases that the model identifies. Precision is especially informative about false alarms among flagged cases; recall is informative about missed positive cases.

### Q4. Why might you choose MAE instead of RMSE?

**Expected answer:** MAE directly communicates average absolute error in the target's units and is less influenced by very large errors than RMSE. RMSE is more appropriate when disproportionately penalizing large errors matches the objective. The choice depends on the error consequences and distribution.

### Q5. What does a negative \(R^2\) mean?

**Expected answer:** Under the common definition used for evaluation data, the model's squared error is greater than that of predicting the evaluation target's mean. It indicates performance worse than that particular baseline on the evaluated examples.

### Q6. How would you choose a classification threshold?

**Expected answer:** I would define the objective and constraints, evaluate threshold-dependent behavior on validation data, compare precision-recall and operational consequences, and choose a threshold based on explicit criteria. I would not repeatedly tune the threshold against the final test set.

### Q7. How do you compare two models when one has higher precision and the other has higher recall?

**Expected answer:** I would quantify the corresponding false-positive and false-negative consequences, determine which trade-off matches the business objective, compare alert volume and operational capacity, and evaluate the models against a baseline. Neither metric alone determines the winner.

### Q8. What is the difference between offline model quality and production success?

**Expected answer:** Offline metrics measure predictive behavior under a defined evaluation protocol. Production success also depends on the surrounding workflow, intervention effectiveness, operating costs, data changes, latency, reliability, and the outcomes of decisions made using the predictions.

### Q9. Why are baselines important in model selection?

**Expected answer:** A baseline establishes whether a candidate provides meaningful improvement over a simple strategy or the current process. Without it, a score has limited context and may not justify added complexity or operational cost.

### Q10. Can a model with a lower predictive score be the better engineering choice?

**Expected answer:** Yes. If it satisfies the required performance constraints while offering materially better latency, cost, reliability, interpretability, or operational simplicity, it may be the better choice. The decision must reflect the objective and constraints rather than a single score.

## 15. Quick Revision

- **Metric selection:** Begin with the objective and the consequences of prediction errors.
- **Confusion matrix:** Describes true positives, false positives, false negatives, and true negatives.
- **Accuracy:** Fraction of all predictions that are correct.
- **Precision:** Fraction of predicted positives that are truly positive.
- **Recall:** Fraction of actual positives identified.
- **F1-score:** Harmonic mean of precision and recall.
- **Specificity:** Fraction of actual negatives correctly identified.
- **Classification threshold:** Converts model scores or probabilities into decisions.
- **MAE:** Average absolute error in target units.
- **MSE:** Average squared error, which emphasizes large mistakes.
- **RMSE:** Square root of MSE, expressed in target units.
- **\(R^2\):** Compares squared prediction error with a mean-prediction baseline.
- **Ranking metrics:** Evaluate the usefulness or relevance of item ordering.
- **Clustering metrics:** Evaluate properties of discovered groups or compare them with available reference labels.
- **Baseline:** Provides context for judging whether a candidate model adds value.
- **Model selection:** Chooses a candidate based on evidence, objectives, and constraints.
- **Offline versus production:** Predictive scores support decisions but do not guarantee real-world outcomes.

## 16. Key Takeaways

1. A metric should reflect the real-world objective, not simply be easy to calculate.
2. Accuracy can conceal poor performance on a rare but important class.
3. Precision, recall, and F1-score describe different aspects of classification behavior.
4. Classification thresholds affect the trade-off between false positives and false negatives.
5. MAE, MSE, RMSE, and \(R^2\) summarize regression performance in different ways.
6. Ranking and clustering require evaluation approaches suited to their respective objectives.
7. Baselines provide the context needed to judge whether a model adds value.
8. Fair model comparison requires consistent evaluation conditions and controlled model selection.
9. Operational constraints can make a slightly less accurate model the better engineering choice.
10. Offline metrics are essential evidence, but production outcomes depend on the complete system and the decisions it supports.

## 17. Practice Assignment

Continue with the customer-churn problem from the earlier AIF-03 chapters.

The organization has two candidate models and a limited weekly budget for retention offers. The business team wants to reduce cancellations, but contacting customers who would not cancel also has a cost.

Prepare a model-selection report that answers the following:

1. Define the primary objective and identify the operational constraints.
2. Choose a primary classification metric and at least two complementary measures. Explain why each is needed.
3. Explain why accuracy alone may be misleading for this problem.
4. Describe how you would compare precision and recall at different classification thresholds.
5. Identify a reasonable baseline and explain how it should be evaluated.
6. Define the criteria that a candidate must satisfy before it can be selected.
7. Explain how latency, cost, and operational workload could influence the final choice.
8. Describe how you would preserve the final test set's role after selecting a model and threshold.
9. Identify the production outcomes that would need to be monitored after deployment.

**Deliverable:** A concise model-selection decision record containing the objective, metrics, baseline, candidate comparison, threshold strategy, constraints, recommendation, and unresolved risks.

Do not select a model merely because it has the highest F1-score or accuracy. Show how the evidence supports the actual business decision.

## 18. Teaching Check

Explain these questions without referring to the chapter:

1. Why should metric selection follow problem formulation?
2. How can a model achieve high accuracy while missing every positive example?
3. What is the difference between precision, recall, and specificity?
4. Why does changing the classification threshold change the decision behavior?
5. How would you explain the difference between MAE and RMSE to a business stakeholder?
6. Why is a baseline necessary before recommending a more complex model?
7. When could a model with a lower predictive score be the better engineering choice?
8. Why does strong offline performance not guarantee business success?

If you cannot justify the metric using the real-world objective, revisit Sections 2, 3, and 9 before considering the chapter complete.

## Further Reading

- [AIF-01: Mathematics Foundation](../AIF-01-Mathematics-Foundation/README.md) — mathematical foundations for interpreting metrics and statistical estimates.
- [Chapter 01: ML Problem Formulation](01-ML-Problem-Formulation.md) — translating objectives into prediction tasks and success criteria.
- [Chapter 03: Data Preparation, Features, and Labels](03-Data-Preparation-Features-and-Labels.md) — feature quality, labels, and data leakage.
- [Chapter 04: Bias, Variance, and Generalization](04-Bias-Variance-and-Generalization.md) — interpreting generalization and model behavior.
- [Chapter 05: Model Evaluation and Cross-Validation](05-Model-Evaluation-and-Cross-Validation.md) — designing trustworthy evaluation protocols.
- [AIF-05: Representation Learning](../AIF-05-Representation-Learning/README.md) — future study of learned representations, which can support ranking and similarity-based applications.

This chapter provides foundational metric and selection reasoning. Detailed retrieval evaluation, production monitoring, and application-specific evaluation methods belong in their respective curriculum domains.
