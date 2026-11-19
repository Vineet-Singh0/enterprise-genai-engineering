# Model Evaluation and Cross-Validation

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain why model evaluation must be designed before model performance can be trusted.
- Distinguish the responsibilities of training, validation, and test datasets.
- Explain holdout evaluation and cross-validation, including when each is appropriate.
- Select a splitting strategy that respects class imbalance, group structure, and time dependencies.
- Identify data leakage and evaluation leakage that can produce misleading results.
- Explain how repeated model selection can weaken the reliability of validation results.
- Improve evaluation reproducibility and communicate uncertainty in reported performance.
- Design an evaluation protocol that reflects how a model will be used in practice.

## Prerequisites

You should understand:

- [01 — ML Problem Formulation](01-ML-Problem-Formulation.md)
- [02 — Learning Paradigms](02-Learning-Paradigms.md)
- [03 — Data Preparation, Features, and Labels](03-Data-Preparation-Features-and-Labels.md)
- [04 — Bias, Variance, and Generalization](04-Bias-Variance-and-Generalization.md)

This chapter assumes you understand features, labels, overfitting, generalization, and the basic purpose of model evaluation.

## Estimated Reading Time

- Reading: 25–35 minutes
- Reading with the worked example and assignment: 45–60 minutes

## 1. Before We Start

Imagine that two engineers build models to predict customer churn.

Engineer A reports 94% accuracy. Engineer B reports 89% accuracy.

Which model should the organization deploy?

You cannot answer this question reliably from those numbers alone.

You need to know:

- Were both models evaluated on comparable data?
- Did either model learn from examples that were later used for evaluation?
- Was the evaluation dataset representative of the intended production environment?
- Were customers allowed to appear in both training and evaluation datasets?
- Did the evaluation respect the time at which predictions would actually be made?
- Were the models compared using the same evaluation procedure?

A performance number is meaningful only when you understand how it was obtained.

**Model evaluation is not merely calculating a score. It is designing an experiment that provides credible evidence about how a model may perform on unseen data.**

This distinction is fundamental to production machine learning.

## 2. Why Evaluation Protocols Exist

Machine learning models are trained from finite datasets. Their performance on those examples does not necessarily predict their performance on future examples.

The evaluation protocol defines how the available data is separated, how training and model selection occur, and how the final performance estimate is obtained.

A poorly designed protocol can make a weak model appear strong. It can also make a useful model appear weak.

For example, imagine a dataset containing multiple records from each customer. If records from the same customer appear in both training and evaluation datasets, the model may exploit customer-specific patterns. The evaluation can then overestimate performance on genuinely new customers.

The model might still be useful for predicting future events for existing customers. But that is a different task from predicting behavior for entirely new customers.

The problem is not necessarily the model. The evaluation may be answering the wrong question.

### 2.1 Start with the deployment scenario

Before selecting a splitting technique, ask:

1. What entity or event will receive a prediction?
2. When must the prediction be made?
3. Will the model predict for new entities, existing entities, future periods, or some combination?
4. What information will be available at prediction time?
5. What data relationships must remain separated during evaluation?

These questions determine which examples can safely be used together and which evaluation strategy is appropriate.

A random split is not automatically correct simply because it is easy to implement.

## 3. The Three Dataset Responsibilities

A common evaluation design separates data into training, validation, and test sets. Each set has a different responsibility.

```text
<title size="lg">Training set</title>
Purpose: learn model parameters
Used to fit the model and learn patterns from the examples.
        ↓
Candidate model development
<title size="lg">Validation set</title>
Purpose: guide development decisions
Used to compare candidates, tune settings, select models, and make other development decisions.
        ↓
Finalize the development procedure
<title size="lg">Test set</title>
Purpose: final evaluation
Kept out of fitting and model-selection decisions, then used to estimate performance after the development process is finalized.
```

The exact percentages allocated to these sets depend on the dataset size, data structure, task, and evaluation requirements. There is no universal split ratio that is correct for every problem.

### 3.1 Training set

The training set is used to fit model parameters.

Depending on the learning method, fitting may involve estimating coefficients, learning decision rules, or adjusting a large collection of parameters.

The training process can repeatedly use the training examples. That is its intended purpose.

However, strong training performance alone does not establish that the model will generalize.

### 3.2 Validation set

The validation set supports decisions made during development, such as:

- Comparing model candidates.
- Selecting model configurations.
- Tuning hyperparameters.
- Choosing a training duration or stopping point.
- Comparing feature sets or preprocessing alternatives.

The validation set is not used to fit the candidate model's parameters directly in the ordinary holdout workflow. However, decisions informed by validation results can indirectly adapt the development process to that data.

This distinction becomes important when the team repeatedly tries alternatives.

### 3.3 Test set

The test set is reserved for a final assessment after the development decisions have been made.

Its value comes from being excluded from those decisions.

If engineers repeatedly inspect test results, change the model, and inspect the results again, the test set gradually becomes part of the model-selection process. It is no longer providing the same independent final assessment.

A test set is not inherently trustworthy because it is named `test.csv`. Its usefulness depends on how it is handled.

### 3.4 What if the dataset is small?

A small dataset creates a real trade-off.

Holding out separate training, validation, and test sets reduces the amount of data available for fitting. Cross-validation can make more efficient use of the available examples for model comparison, but it does not create additional independent information.

The appropriate approach depends on how much data exists, how expensive training is, how variable the results are, and how important a final independent assessment is.

Do not mechanically apply a conventional split ratio without considering these constraints.

## 4. Holdout Evaluation

**Holdout evaluation** separates a dataset into distinct subsets and evaluates the fitted model on examples withheld from fitting.

A simple workflow is:

1. Define the prediction task and evaluation objective.
2. Split the available data using a strategy appropriate to the task.
3. Fit preprocessing transformations and the model using the training portion.
4. Use validation data for development decisions when a validation set is part of the protocol.
5. Finalize the model-development procedure.
6. Evaluate the finalized approach on the reserved test set.
7. Report the result with the protocol, assumptions, and relevant limitations.

The key benefit is simplicity. The key limitation is that a single holdout result can depend heavily on which examples were assigned to the evaluation subset.

### 4.1 Why a single split can mislead

Suppose a dataset contains a small number of rare customer-cancellation cases.

One random split might include most of those cases in the training set. Another might place more of them in the validation set.

The resulting estimates can differ, even when the same model and training procedure are used.

This does not necessarily mean the model is unstable in every respect. It may mean the evaluation sample is small or sensitive to which examples it contains.

Cross-validation is one way to investigate this variability.

### 4.2 When holdout evaluation is appropriate

Holdout evaluation is often useful when:

- There is enough data for a credible separation.
- The splitting strategy reflects the intended deployment scenario.
- Training is expensive enough that repeated fitting is undesirable.
- A simple, clearly defined evaluation workflow is valuable.
- The final test set can be kept separate from model development.

Holdout evaluation is not inherently inferior to cross-validation. A well-designed holdout protocol can be more appropriate than a poorly designed cross-validation procedure.

## 5. Cross-Validation

**Cross-validation is an evaluation technique that repeats model fitting and evaluation across multiple partitions of the available data.**

The most familiar form is \(k\)-fold cross-validation.

### 5.1 How k-fold cross-validation works

The dataset is divided into \(k\) folds. The procedure then runs \(k\) rounds:

- In each round, one fold is used for evaluation.
- The other \(k-1\) folds are used for fitting.
- Each fold serves as the evaluation fold once.

Conceptually, for five-fold cross-validation:

```text
<title size="md">Five-fold cross-validation</title>
Each row shows one round. The orange cell is held out for evaluation; the remaining cells are used for fitting.
{#each [{n:"Round 1", held:0},{n:"Round 2",held:1},{n:"Round 3",held:2},{n:"Round 4",held:3},{n:"Round 5",held:4}] as r}
{r.n}
<grid columns={5} gap={1}>
{#each [0,1,2,3,4] as f}
<grid-item>
{f===r.held?"Eval":"Fit"}
</grid-item>
{/each}
</grid>
{/each}
```

Each round produces an evaluation result. The results can then be summarized to understand typical performance and variability across the folds.

For a metric where higher is better, the mean fold score can be written as:

\[
\bar{s} = \frac{1}{k}\sum_{i=1}^{k}s_i
\]

Here, \(s_i\) is the evaluation score from fold \(i\), and \(k\) is the number of folds.

For an error metric where lower is better, the same averaging operation applies, but a smaller value is preferable.

The average is useful, but it should not be reported without understanding the spread of the results and the assumptions of the splitting strategy.

### 5.2 Why cross-validation helps

Cross-validation can provide a more informative view of performance than a single holdout split because multiple portions of the dataset are used for evaluation.

It can help answer questions such as:

- Does performance change substantially across different partitions?
- Is the apparent ranking of two model candidates consistent?
- Is the result sensitive to which examples are held out?
- Is there evidence that the dataset is too small or heterogeneous for a stable estimate?

Cross-validation does not eliminate uncertainty. Its training folds overlap, so the resulting scores are not independent observations. Their variation is informative, but it should not be interpreted as if each fold came from an entirely new independent dataset.

### 5.3 What cross-validation costs

With \(k\)-fold cross-validation, the learning procedure generally needs to be fitted \(k\) times for each candidate configuration.

If a team evaluates many configurations, the cost can grow quickly.

For example, evaluating 30 configurations with five folds can require roughly 150 model fits, before accounting for additional preprocessing, nested evaluation, or repeated experiments.

Cross-validation can also be unsuitable when ordinary random partitions violate the structure of the data.

### 5.4 When cross-validation is appropriate

It is often useful when:

- The available dataset is limited.
- Model comparisons are sensitive to the particular holdout split.
- Training is affordable enough to repeat.
- The data can be partitioned into folds without violating important dependencies.
- The team wants to understand variation across partitions.

It is not automatically appropriate for temporal prediction, repeated observations from the same entity, or any task where ordinary random splitting allows information to cross an important boundary.

## 6. Choosing the Right Splitting Strategy

The splitting strategy must reflect the relationship between the examples and the intended prediction scenario.

### 6.1 Random splitting

A random split assigns examples to different subsets using a random procedure.

It is often appropriate when examples are sufficiently independent and come from a population whose relevant distribution is reasonably consistent across the split.

However, the word *random* does not mean *unbiased*. If examples contain related observations, temporal dependencies, or duplicated records, random assignment can place related information on both sides of the split.

Before using random splitting, ask what makes two examples independent for the task.

### 6.2 Stratified splitting

Stratified splitting attempts to preserve the proportions of selected classes across the subsets.

For example, if cancellation is rare, stratification can help ensure that the training and evaluation partitions both contain cancellation cases in proportions similar to the original dataset.

This can make evaluation more practical when the dataset is limited or classes are imbalanced.

But stratification does not solve every problem:

- It does not prevent leakage between related records.
- It does not enforce temporal ordering.
- It does not guarantee representative performance for every subgroup.
- It cannot compensate for a dataset that lacks important examples.

Stratification is a constraint on the split, not a complete evaluation strategy.

### 6.3 Group-based splitting

Group-based splitting keeps observations from the same group together within a single partition.

The group might be:

- A customer.
- A patient.
- A device.
- A household.
- A document source.
- A business account.

Consider a churn dataset containing monthly records for each customer. If the objective is to predict churn for customers never seen during training, allowing one customer's records to appear in both training and validation can make the evaluation overly optimistic.

A group-based split holds out entire customers, which better matches that objective.

However, group-based splitting is not always required. If the production task explicitly predicts future events for existing customers and uses valid historical information about those customers, the evaluation should reflect that scenario rather than automatically excluding every customer from training.

The correct grouping boundary follows the prediction objective.

### 6.4 Time-based splitting

When the model predicts future outcomes using historical data, time can be a critical boundary.

A time-based split trains on earlier observations and evaluates on later observations.

For example:

- Training: January through June.
- Validation: July.
- Test: August.

These periods are illustrative; real boundaries should reflect the available data and operational requirements.

The principle is that a model should not learn from information that would have been unavailable when the evaluated prediction was made.

Time-based evaluation is important when:

- Features or labels depend on time.
- The model is deployed to predict future events.
- Customer behavior changes over time.
- Seasonal patterns matter.
- The data collection process evolves.

Random splitting can create an unrealistic scenario when it allows later observations to influence evaluation of earlier ones.

### 6.5 Comparison

| Strategy | Main purpose | Important limitation |
|---|---|---|
| Random split | Separate examples when the relevant independence assumptions are reasonable | Can mix related records or time periods |
| Stratified split | Preserve selected class proportions across partitions | Does not prevent group or temporal leakage |
| Group-based split | Keep related entities together | May be more difficult when there are few independent groups |
| Time-based split | Evaluate future-oriented prediction using historical training data | May expose changes in the environment and leave less data for training |
| k-fold cross-validation | Evaluate across multiple partitions | Requires a splitting strategy that respects data dependencies and costs repeated fitting |

These strategies can sometimes be combined. For example, group-aware or time-aware cross-validation may be appropriate for structured datasets. The implementation must preserve the intended boundaries in every fold.

## 7. Data Leakage and Evaluation Leakage

Leakage occurs when information that should not be available to the model or development decision enters the learning or evaluation process.

It can create performance estimates that look convincing but do not reflect the intended prediction scenario.

There are several distinct forms.

### 7.1 Future-information leakage

Future-information leakage occurs when a feature contains information that would not be available at the time a prediction must be made.

Example:

A model predicts whether a customer will cancel within the next 30 days. One input feature records whether the customer requested account closure during that same future period.

That feature may make the prediction appear easy, but it violates the prediction-time information boundary.

The correct response is to define the prediction time and target window clearly, then verify that each feature was available at that point.

### 7.2 Preprocessing leakage

Preprocessing leakage occurs when a transformation learns information from evaluation data that should have remained outside the fitting process.

Examples include:

- Estimating imputation values using the entire dataset before splitting.
- Fitting a scaler on all examples before training and evaluation.
- Selecting features using labels from the full dataset.
- Selecting features based on their relationship with the evaluation targets.

A safer workflow is:

1. Split the data using the intended evaluation protocol.
2. Fit data-dependent transformations on the training portion.
3. Apply the fitted transformations to the corresponding validation or test portion without refitting them there.
4. Repeat this procedure independently within each cross-validation fold.

For cross-validation, preprocessing must be fitted separately within each training fold. Fitting it once on all data before creating folds can leak information across fold boundaries.

### 7.3 Duplicate and entity leakage

Duplicate records or repeated observations from the same entity can make the evaluation task easier than the real task.

For example, near-identical support tickets may appear in training and validation. A model can then perform well by recognizing repeated content rather than learning patterns that transfer to new tickets.

Whether this is leakage depends on the intended deployment scenario. Repeated content may be legitimate if the production system is expected to handle recurring examples. It is problematic when the evaluation claims to measure generalization to genuinely new cases but allows near-duplicates across the boundary.

### 7.4 Target leakage

Target leakage occurs when a feature directly or indirectly encodes information about the outcome in a way that would not be valid at prediction time.

A suspiciously powerful feature should prompt questions such as:

- When was this feature created?
- Who or what system produced it?
- Does its computation depend on the target or on a later event?
- Will the same information be available for a live prediction?
- Could the feature be a proxy for an outcome that has already occurred?

Target leakage can originate from data pipelines, business workflows, feature engineering, or misunderstanding the task—not only from the learning algorithm.

### 7.5 Evaluation leakage through repeated model selection

Leakage can also occur at the development-process level.

Suppose an engineer evaluates hundreds of candidate models against the same validation set and keeps whichever configuration achieves the best score.

Even though no candidate directly fits its parameters on the validation labels, the repeated decisions are influenced by those labels. The development process can adapt to accidental characteristics of the validation sample.

This is why validation performance can become increasingly optimistic as experimentation continues.

The reserved test set helps assess the finalized development procedure, provided it remains untouched by those decisions.

### 7.6 Leakage investigation checklist

Before trusting a result, ask:

- Was the prediction time defined explicitly?
- Were all features available at prediction time?
- Were data-dependent transformations fitted only on the relevant training data?
- Were related entities and duplicate records handled appropriately?
- Were time boundaries respected?
- Was feature selection isolated from evaluation data?
- Was the test set kept out of model selection?
- Were the same rules followed in every cross-validation fold?

A high score is not evidence that leakage is absent. The data and evaluation pipeline must be inspected directly.

## 8. Hyperparameter Tuning and Model Selection

Model training and model selection are different activities.

**Model training** fits the model's parameters using the training data.

**Hyperparameter tuning** selects settings that influence the learning procedure, such as model configuration or regularization strength.

**Model selection** compares candidate approaches and chooses one according to the evaluation objective and relevant constraints.

The validation set often supports tuning and model selection.

This creates an important dependency: the more decisions are made based on the validation results, the more the development process adapts to that validation data.

### 8.1 A practical development loop

A typical workflow looks like this:

1. Define candidate models and configurations.
2. Fit each candidate on the appropriate training data.
3. Evaluate candidates using the chosen validation protocol.
4. Compare results and investigate failure patterns.
5. Adjust the candidates or training procedure.
6. Repeat as needed.
7. Finalize the development procedure.
8. Use the reserved test set for the final assessment.

Cross-validation can be used in place of a single validation split when that is appropriate for the data and budget.

The important principle is that **the evaluation procedure must be separated from the information used to make development decisions**.

### 8.2 Why a test set matters

Suppose a team uses validation results to select the best regularization strength, feature set, and model family.

The chosen model may perform well partly because the team repeatedly adapted its decisions to the validation sample.

A separate test set provides a final check on the selected approach.

However, if the test results lead the team to redesign the model, the team has made another development decision using the test set. The test set has now influenced the process.

For repeated, high-stakes experimentation, more rigorous designs—such as nested cross-validation or a separately maintained final evaluation dataset—may be appropriate.

Nested cross-validation separates inner-loop model selection from outer-loop evaluation within a cross-validation design. It can be useful when estimating the performance of a complete model-selection procedure, but it costs more computation and must still respect the structure of the data.

It is not necessary for every project. The design should match the stakes, data size, computational budget, and intended claim.

## 9. Uncertainty, Reproducibility, and Honest Reporting

A reported score is an estimate based on a particular dataset and evaluation procedure.

Its reliability depends on the amount and structure of the evaluation data, the variability of the task, the splitting strategy, and the correctness of the pipeline.

### 9.1 Do not report only the best score

Suppose two candidate models produce the following cross-validation scores:

- Model A: consistently similar performance across folds.
- Model B: very strong performance on some folds and weak performance on others.

Their average scores might be close, but their behavior is different.

The variability may indicate that one model is more sensitive to the composition of the training sample or that the dataset contains heterogeneous groups.

Engineers should inspect the fold-level results and explain material variation rather than reporting only the most favorable fold or experiment.

Fold-to-fold variability is a diagnostic signal, not automatically a formal confidence interval. Statistical uncertainty requires methods and assumptions appropriate to the evaluation design.

### 9.2 Reproducibility

A useful evaluation record should capture enough information for another engineer to understand and, where possible, reproduce the experiment.

Record items such as:

- Dataset version and relevant date range.
- Prediction objective and target definition.
- Feature definitions and preprocessing configuration.
- Splitting strategy and relevant boundaries.
- Random seeds where randomness is used.
- Model family and configuration.
- Training procedure and stopping criteria.
- Evaluation metrics and their interpretation.
- Fold-level results, where applicable.
- Known limitations and deviations from the intended protocol.

A random seed alone does not guarantee reproducibility. Dataset changes, software versions, nondeterministic operations, and differences in execution environments can also affect results.

### 9.3 Communicate what the result means

A report should explain the evaluation setup, not just the final score.

For example:

> The candidate was evaluated using five-fold group-based cross-validation, keeping customer records within a single fold. Results varied across folds, indicating sensitivity to the customer groups represented. The experiment estimates performance on held-out customers from the available dataset; it does not by itself establish performance under future population changes.

This description communicates the method, a limitation, and the scope of the claim.

It is more useful than presenting a single number without context.

## 10. Worked Example: Evaluating a Customer-Churn Model

Assume a subscription business wants to predict whether a customer will cancel during the next 30 days.

The dataset contains:

- Customer identifiers.
- Monthly customer activity records.
- Contract information.
- Support interactions.
- Historical usage.
- Cancellation labels.

The organization must decide how to evaluate the model.

### Step 1: Define the prediction scenario

The team must clarify whether the model will:

- Predict future churn for existing customers.
- Predict churn for customers not seen during training.
- Predict future churn after the business environment changes.
- Support a combination of these scenarios.

These are not interchangeable objectives. They can require different evaluation designs.

### Step 2: Establish the information boundary

For every feature, the team asks whether it would be available when the prediction is made.

A support interaction recorded after the prediction date cannot be used as a valid input for that prediction, even if it is present in the historical dataset.

The team defines the prediction timestamp and the 30-day target window before constructing the dataset.

### Step 3: Select the splitting strategy

If the main objective is to predict future churn for existing customers, a time-aware split may be appropriate.

If the main objective is to generalize to entirely new customers, a group-based split may be more appropriate.

If the dataset is large, observations are sufficiently independent, and the objective does not require temporal or group boundaries, a random holdout may be defensible.

The team should not choose a split merely because it produces the highest score.

### Step 4: Build a leakage-safe pipeline

The team splits the data before fitting data-dependent preprocessing.

Each training run fits its transformations on the training portion. Validation and test examples are processed using the corresponding fitted transformations.

The team also checks for duplicates, target leakage, and features created after the prediction timestamp.

### Step 5: Compare candidate models

The team evaluates candidate models using the same protocol and a consistent objective-aligned metric.

If cross-validation is appropriate, the team examines both average performance and variation across folds.

The team uses validation evidence to make development decisions and avoids repeatedly adapting the model to the final test set.

### Step 6: Conduct the final assessment

After the development procedure is finalized, the team evaluates the selected approach on the reserved test data.

It documents the split design, dataset period, model configuration, measured results, limitations, and deployment assumptions.

The resulting score supports a decision; it does not guarantee future performance.

### Step 7: Connect evaluation to production

After deployment, the organization monitors whether the assumptions behind the evaluation continue to hold.

A change in customer behavior, feature availability, or the business process can undermine performance even if the original evaluation was sound.

The team therefore treats evaluation as part of the system lifecycle, not as a one-time ceremony before deployment.

## 11. Engineering Decisions and Trade-offs

| Decision | Benefit | Cost or risk |
|---|---|---|
| Single holdout split | Simple and computationally inexpensive | Result may depend strongly on the chosen split |
| k-fold cross-validation | Uses multiple evaluation partitions and reveals some split sensitivity | Requires repeated fitting and appropriate fold design |
| Stratified splitting | Helps preserve class proportions | Does not solve temporal or entity leakage |
| Group-based splitting | Better reflects evaluation on unseen groups when that is the target | May reduce the number of independent groups available for fitting and evaluation |
| Time-based splitting | Respects prediction chronology | Can expose temporal changes and leave fewer observations for training |
| Dedicated final test set | Supports final evaluation after model selection | Reserves data that cannot be freely used during development |
| Nested cross-validation | Separates model selection and evaluation within the procedure | More expensive and more complex to implement correctly |
| Repeated experimentation | Helps investigate alternatives | Can over-adapt decisions to the validation set |
| Detailed experiment tracking | Improves auditability and reproducibility | Requires discipline and tooling |

The correct protocol is the one that supports the intended claim at an acceptable cost. More elaborate evaluation is not automatically better if its assumptions do not match the task.

## 12. Common Mistakes

### Mistake 1: Splitting data after preprocessing

Fitting a scaler, imputer, feature selector, or other data-dependent transformation on the full dataset can allow evaluation information to influence training.

**Better approach:** Split first and fit transformations only on the relevant training data, including separately within each cross-validation fold.

### Mistake 2: Using random splitting for every problem

Random splitting may mix related entities or future observations into training and evaluation.

**Better approach:** Determine whether the prediction task requires group-aware, time-aware, stratified, or combined splitting constraints.

### Mistake 3: Treating validation and test sets as interchangeable

The validation set supports development decisions. The test set is reserved for a final assessment.

**Better approach:** Define these responsibilities before experimentation and enforce them throughout development.

### Mistake 4: Assuming cross-validation automatically prevents leakage

Cross-validation can still leak information if preprocessing occurs before fold creation, related entities cross fold boundaries, or temporal constraints are ignored.

**Better approach:** Apply the full leakage-safe pipeline separately within every fold.

### Mistake 5: Reporting only the best fold or experiment

Selecting the most favorable result hides variability and encourages optimistic reporting.

**Better approach:** Report the evaluation procedure, appropriate aggregate results, meaningful variation, and limitations.

### Mistake 6: Ignoring repeated validation use

Repeated experimentation can adapt model choices to validation-specific patterns.

**Better approach:** Track the development process, preserve a final evaluation set, and use more rigorous evaluation designs when the stakes justify them.

### Mistake 7: Assuming a test score guarantees production performance

A test set estimates performance under its evaluation conditions. Future data and operating conditions may differ.

**Better approach:** State the scope of the evaluation claim and connect it to production monitoring.

### Mistake 8: Choosing the split that produces the best score

The best-looking score may come from an easier or less representative evaluation setup.

**Better approach:** Choose the evaluation protocol based on the intended prediction scenario before comparing model results.

## 13. Interview Questions with Expected Answers

### Q1. What is the difference between training, validation, and test datasets?

**Expected answer:** The training set fits model parameters. The validation set supports development decisions such as hyperparameter tuning and model selection. The test set is reserved for a final assessment after the development procedure is finalized.

### Q2. What is k-fold cross-validation?

**Expected answer:** The data is divided into \(k\) folds, and the model is fitted and evaluated \(k\) times, with each fold used once for evaluation and the remaining folds used for fitting. The results provide evidence about performance across different partitions, subject to the assumptions of the splitting strategy.

### Q3. Why can cross-validation still produce misleading results?

**Expected answer:** It can leak information through preprocessing, repeated entities, duplicates, or temporal dependencies. It can also produce uncertain estimates when the data is limited or unrepresentative. Cross-validation does not repair a poorly formulated task or invalid data pipeline.

### Q4. When would you use group-based splitting?

**Expected answer:** When observations belong to groups that must not cross the evaluation boundary, such as evaluating generalization to new customers or patients. The choice depends on whether the deployment objective concerns unseen groups or future observations for existing groups.

### Q5. Why is time-based splitting important for future prediction?

**Expected answer:** It prevents training from using information that occurs after the evaluated prediction time and better represents a workflow that learns from historical data to predict future outcomes.

### Q6. Explain preprocessing leakage.

**Expected answer:** Preprocessing leakage occurs when information from evaluation examples influences a transformation or selection step that should have been fitted using training data only. For example, fitting a scaler or selecting features on the entire dataset before splitting can contaminate evaluation.

### Q7. Why should the test set not be used repeatedly for model tuning?

**Expected answer:** Each test-informed decision adapts the development process to the test data. Repeated use undermines the test set's role as a final assessment of the finalized approach.

### Q8. How would you design an evaluation protocol for a churn model with multiple records per customer?

**Expected answer:** I would first clarify whether the model predicts future events for existing customers or generalizes to new customers. For future prediction, I would enforce the time boundary and verify feature availability. For unseen-customer generalization, I would keep customers grouped within partitions. I would also prevent preprocessing leakage, define the validation and test responsibilities, and document the protocol and limitations.

## 14. Quick Revision

- **Training set:** Fits model parameters.
- **Validation set:** Supports model development and selection.
- **Test set:** Provides a final assessment after development decisions are finalized.
- **Holdout evaluation:** Evaluates on a separately withheld subset.
- **Cross-validation:** Repeats fitting and evaluation across multiple data partitions.
- **Stratified split:** Preserves selected class proportions across partitions.
- **Group-based split:** Keeps related entities together.
- **Time-based split:** Preserves the historical-to-future direction required by the task.
- **Data leakage:** Allows invalid information to influence training or evaluation.
- **Evaluation leakage:** Allows evaluation results to influence development decisions in ways that weaken the independence of the estimate.
- **Reproducibility:** Requires documenting the data, split, pipeline, configuration, and evaluation procedure.
- **Core principle:** Choose the evaluation design to reflect the intended prediction scenario, not to maximize the reported score.

## 15. Key Takeaways

1. Model performance is only as credible as the evaluation protocol used to estimate it.
2. Training, validation, and test datasets have different responsibilities.
3. Holdout evaluation and cross-validation are tools with different costs and assumptions; neither is universally superior.
4. Random splitting is appropriate only when it respects the structure and intended use of the data.
5. Stratification, grouping, and time ordering solve different problems and may need to be combined.
6. Leakage can enter through features, preprocessing, duplicate entities, temporal relationships, or repeated model selection.
7. Cross-validation does not automatically eliminate leakage or guarantee a representative estimate.
8. Repeated use of validation results can make development increasingly adapted to the validation sample.
9. Evaluation results should be reproducible, appropriately qualified, and connected to the intended production scenario.

## 16. Practice Assignment

Continue with the customer-churn problem developed in the earlier chapters.

The dataset contains monthly records for many customers over two years. The organization wants to predict whether a customer will cancel within the next 30 days.

The team proposes a random 80/20 split and reports strong performance.

Prepare an evaluation design review that answers the following:

1. What assumptions would need to hold for the proposed random split to be appropriate?
2. What changes would you make if the model must predict future churn for existing customers?
3. What changes would you make if the model must generalize to customers never seen during training?
4. How would you prevent preprocessing leakage within a holdout workflow and within cross-validation?
5. What responsibilities should the validation and test sets have?
6. How would you investigate the possibility of evaluation leakage caused by repeated model tuning?
7. What information would you record so another engineer could reproduce and audit the evaluation?
8. What limitations would you disclose when presenting the final result?

**Deliverable:** A concise evaluation protocol containing the prediction scenario, splitting strategy, leakage controls, model-selection procedure, final assessment plan, and known limitations.

Justify each decision. A list of techniques without reasoning is not sufficient.

## 17. Teaching Check

Explain these questions without referring to the chapter:

1. Why is a model score meaningless without knowing the evaluation protocol?
2. How do training, validation, and test responsibilities differ?
3. When might cross-validation be inappropriate despite having a small dataset?
4. Why can a random split produce an overly optimistic result for data containing multiple records per customer?
5. How can preprocessing leak information across a cross-validation boundary?
6. Why can repeated model tuning weaken validation results?
7. What would make you choose time-based splitting over random splitting?
8. What claim can a final test result support, and what can it not guarantee?

If you cannot explain why the splitting strategy follows from the prediction scenario, revisit Sections 2 and 6 before moving forward.

## Further Reading

- [AIF-01: Mathematics Foundation](../AIF-01-Mathematics-Foundation/README.md) — statistical foundations for understanding estimates and variability.
- [Chapter 03: Data Preparation, Features, and Labels](03-Data-Preparation-Features-and-Labels.md) — data quality, feature availability, preprocessing, and leakage.
- [Chapter 04: Bias, Variance, and Generalization](04-Bias-Variance-and-Generalization.md) — why performance on training data may not transfer to unseen examples.
- [Chapter 06: Evaluation Metrics and Model Selection](06-Evaluation-Metrics-and-Model-Selection.md) — selecting metrics and comparing candidates using the evidence produced by an evaluation protocol.

