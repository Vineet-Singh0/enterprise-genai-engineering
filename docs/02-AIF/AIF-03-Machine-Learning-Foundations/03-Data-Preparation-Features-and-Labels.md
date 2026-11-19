# 03 — Data Preparation, Features and Labels

## 1. Learning Objectives

After completing this chapter, you should be able to:

- Explain how raw data becomes a dataset suitable for machine learning.
- Distinguish samples, features, labels, and target variables.
- Identify common data-quality problems and their potential effects on model behavior.
- Explain when encoding and scaling may be necessary.
- Understand the purpose of feature engineering.
- Explain the responsibilities of training, validation, and test datasets.
- Identify common forms of data leakage and explain why they produce misleading results.
- Explain why data transformations must remain consistent between training and inference.
- Design a basic data-preparation workflow that is reproducible and appropriate for the intended prediction task.

## 2. Prerequisites

This chapter builds on:

- [Chapter 01 — ML Problem Formulation](01-ML-Problem-Formulation.md): prediction units, inputs, targets, and prediction time.
- [Chapter 02 — Learning Paradigms](02-Learning-Paradigms.md): the learning signal available for a task.

You should understand that a model's training data must represent the task the system is expected to perform. Data preparation turns that requirement into a concrete dataset and processing workflow.

## 3. Estimated Reading Time

- Reading: 20–25 minutes
- Practical exercise and revision: 20–25 minutes
- Total suggested session: 40–50 minutes

## 4. Before We Start

Imagine that an engineering team builds a model to predict whether a customer will cancel a subscription within the next 30 days.

The team has millions of historical records. Training completes successfully, and evaluation reports excellent results.

After deployment, however, predictions are much worse.

An investigation reveals several problems:

- Some training records contain information recorded after cancellation.
- Customer identifiers appear in both training and test datasets, allowing the model to exploit patterns that do not generalize to new customers.
- Missing values were handled differently during training and inference.
- A feature was calculated using information from the entire dataset, including the evaluation period.
- Historical cancellation labels were defined inconsistently.

None of these failures necessarily causes a training error. The model can train successfully while learning from information that is unavailable, unreliable, or unrepresentative.

This illustrates a central principle:

> Data preparation is not simply cleaning data. It is the process of constructing trustworthy evidence for the learning task.

A good preparation workflow must preserve the relationship between the original problem, the available information, the target, and the conditions under which the model will be used.

## 5. Why Data Preparation Exists

Raw data is usually collected to support business operations, not to satisfy the assumptions of a machine-learning training process.

It may contain:

- Missing or duplicated records
- Inconsistent representations
- Incorrect values
- Different units or formats
- Unreliable labels
- Information collected at different points in time
- Fields unavailable when a prediction must be made
- Data from populations that differ from the intended deployment population

A learning algorithm cannot automatically determine which irregularities are harmless and which represent serious defects in the problem definition.

Data preparation addresses these issues before and during model development.

It serves four broad purposes:

1. **Represent the problem correctly.** Each sample, feature, and target must correspond to the intended task.
2. **Improve data quality.** Errors and inconsistencies must be understood and handled appropriately.
3. **Protect the validity of evaluation.** Preparation must not expose the model to information that should be unavailable.
4. **Preserve operational consistency.** The transformations applied during training must match those used when predictions are generated.

These responsibilities are connected. A transformation that improves the apparent quality of the dataset may still make the resulting model unreliable if it introduces leakage or changes the meaning of a feature.

## 6. Mental Model: From Raw Records to Model Inputs

A useful way to think about data preparation is as a sequence of transformations with explicit responsibilities.

```text
Raw source data
      |
      v
Inspect structure and quality
      |
      v
Define samples, features, and targets
      |
      v
Apply valid preparation rules
      |
      v
Construct training / validation / test datasets
      |
      v
Fit and evaluate the model
      |
      v
Package the required transformations
      |
      v
Apply the same transformations during inference
```

This diagram represents the conceptual workflow, not a requirement that every transformation must occur in one fixed physical pipeline. Some validation and transformation steps may be implemented differently depending on the data source and task.

The important point is that each step must preserve the intended meaning of the data and respect the information available at the prediction time.

## 7. Core Concepts

### 7.1 Samples, features, and labels

A dataset commonly contains multiple examples of the task the model is expected to learn.

For a tabular dataset, each example is often represented as a row, with columns describing its properties.

Three concepts must be distinguished.

**Sample:** One example or observation in the dataset.

**Feature:** An input variable used to describe a sample.

**Label or target:** The outcome the model is expected to learn or predict in a supervised task.

Consider a dataset for predicting customer churn:

| Customer tenure (months) | Support tickets | Monthly charge | Churn in next 30 days |
|---:|---:|---:|---|
| 18 | 1 | 35.00 | No |
| 4 | 6 | 55.00 | Yes |
| 30 | 0 | 42.00 | No |

In this example:

- Each row represents a customer snapshot.
- Customer tenure, support-ticket count, and monthly charge are features.
- Churn in the next 30 days is the target.

The example is valid only if the feature values were available at the defined snapshot time and the target was constructed using the agreed future horizon.

The table's shape alone does not establish that its contents are suitable for learning.

### 7.2 Why the prediction unit matters

The sample definition must match the problem formulation.

For example, a row may represent:

- One customer
- One transaction
- One support ticket
- One customer on one particular day
- One delivery event

If the task predicts customer churn at a daily snapshot, one row per customer per day may be appropriate. If the task predicts whether a transaction is fraudulent, a transaction may be the more appropriate unit.

This decision affects how targets are generated, how repeated observations are handled, and how data should be divided for evaluation.

Repeated rows for the same entity are not necessarily independent examples. If the evaluation setup ignores this relationship, reported performance may not reflect how well the model generalizes to genuinely new entities.

### 7.3 Feature availability and target definition

A feature is not valid merely because it exists in a database.

Suppose a company wants to predict whether a customer will cancel within the next 30 days.

Potential features include:

- Subscription duration at prediction time
- Usage during the previous week
- Support interactions recorded before prediction time

A field such as `cancellation_confirmation_timestamp` is not a valid predictive input if it is populated only after cancellation occurs.

The target also needs a precise definition. "Churn" might mean account closure, subscription expiration without renewal, or another business event. The team must agree on which event counts.

These decisions should follow the problem formulation established in [Chapter 01](01-ML-Problem-Formulation.md).

## 8. Data Quality: Understand Before Transforming

Data quality is the degree to which data is suitable for its intended use.

A value can be valid in one context and invalid in another. For example, a negative account balance may be legitimate for an account that permits overdrafts but invalid for a field that represents the number of active subscriptions.

Data preparation should therefore begin with the meaning of the fields, not with a universal set of cleaning rules.

### 8.1 Missing values

A missing value indicates that an observation does not contain a value for a particular field.

Possible causes include:

- The information was not collected.
- A user skipped an optional field.
- A source system failed to provide the value.
- The field does not apply to that observation.
- Data ingestion or transformation failed.

Missingness can affect both model training and inference.

Common handling strategies include:

- Removing records when doing so is justified and safe.
- Removing a feature when it is unreliable or unsuitable.
- Imputing a value using a defined rule.
- Representing missingness explicitly when it carries useful meaning.

There is no universally correct treatment.

For example, replacing every missing income value with zero may incorrectly imply that the person has no income. Removing every record with a missing value may discard a large or systematically different portion of the population.

**Engineering rule:** Understand why a value is missing before deciding how to handle it.

When a learned or statistical imputation rule is used, its parameters should be estimated using the permitted training data rather than the full dataset. Otherwise, information from validation or test data may influence the training process.

### 8.2 Duplicate records

Duplicates occur when the same record, event, or entity is represented more than once.

Potential causes include:

- Repeated ingestion
- Retries that create duplicate events
- Incorrect joins between tables
- Multiple legitimate events that look similar

Not every repeated row is a duplicate. Two purchases may have identical values but represent two different transactions.

Before removing records, determine whether they represent the same real-world event.

Duplicates can distort a dataset by giving some examples disproportionate influence. They can also contaminate evaluation if copies of the same observation appear in both training and test data.

### 8.3 Inconsistent values

Inconsistent values may represent the same concept in different forms.

Examples include:

- `India`, `IN`, and `IND` for a country
- Dates represented using different formats
- Different spellings of the same category
- Mixed units for a numerical measurement
- Currency values recorded without a consistent currency definition

Normalization may be appropriate, but only when the values genuinely represent the same concept.

If the source system uses two codes for different business states, combining them may destroy useful information.

### 8.4 Invalid or implausible values

Examples include:

- A negative value for a field that must be non-negative
- A date outside the valid business period
- A customer age recorded as an implausible value
- A temperature expressed in an unexpected unit

An unusual value is not automatically an error. It may represent a rare but valid event.

A robust workflow distinguishes:

1. Values that violate a known constraint
2. Values that are unusual but valid
3. Values whose correctness cannot yet be determined

The response should depend on the cause and the intended task. Blindly deleting outliers may remove the very cases the model needs to handle.

### 8.5 Label quality

For supervised learning, the target labels are part of the training evidence.

Labels can be incorrect because of:

- Human annotation errors
- Ambiguous labeling rules
- Delayed outcome recording
- Changes in business definitions
- Inconsistent source-system behavior

If different teams assign different labels to the same kind of case, the model receives contradictory signals.

Label quality should therefore be investigated separately from feature quality.

Useful actions may include reviewing a sample of labels, documenting labeling rules, checking disagreement rates, and verifying that target definitions remain consistent across time.

## 9. Numerical and Categorical Features

Features can represent different kinds of information. Their representation influences which transformations may be appropriate.

### 9.1 Numerical features

Numerical features represent quantities, counts, measurements, or other numerical values.

Examples include:

- Account age in months
- Transaction amount
- Number of support tickets
- Delivery duration

Some numerical values have meaningful magnitude and distance. Others are codes that happen to be stored as numbers.

For example, the identifiers `101`, `102`, and `103` do not necessarily mean that entity `103` is greater than entity `101` in a meaningful way.

Do not infer mathematical meaning from a numeric data type alone.

### 9.2 Categorical features

Categorical features represent groups or states.

Examples include:

- Subscription plan
- Country
- Device type
- Support-ticket category

Some categories have a meaningful order, while others do not.

For example, a priority field with values `low`, `medium`, and `high` has an intended order. A field describing device type usually does not.

The distinction matters because numerical encoding can accidentally imply an order or distance that does not exist.

### 9.3 Encoding categorical values

Many learning algorithms require numerical inputs. Categorical values may therefore need to be encoded.

Common conceptual approaches include:

- **One-hot encoding:** represents each category using a separate binary indicator.
- **Ordinal encoding:** maps ordered categories to numerical values according to an explicit ordering.
- **Other category encodings:** represent categories using alternative numerical schemes suitable for particular tasks and models.

Consider a `plan_type` feature with values `Basic`, `Standard`, and `Premium`.

An arbitrary mapping such as:

```text
Basic    -> 1
Standard -> 2
Premium  -> 3
```

may cause a model to interpret the values as ordered or equally spaced. That interpretation is only justified if it matches the intended representation and model behavior.

For nominal categories without a meaningful order, one-hot encoding is a common option.

Encoding choices also need to account for categories that appear during inference but were absent during training. The transformation should define how such values are handled instead of failing unpredictably or silently changing the meaning of the data.

### 9.4 Scaling numerical features

Features can use very different numerical ranges.

For example:

- Customer tenure may range from 0 to 120 months.
- Annual revenue may range from hundreds to millions.
- A binary indicator may take only the values 0 and 1.

Some algorithms are sensitive to feature scales. Scaling can help prevent large numerical ranges from dominating certain calculations.

Common approaches include:

- **Standardization:** transforms values using a training-set mean and standard deviation.
- **Min-max scaling:** maps values into a defined range based on training-set minimum and maximum values.

The correct approach depends on the algorithm and data.

Tree-based models often have less need for conventional feature scaling than distance-based or gradient-based methods. Scaling should be driven by the behavior of the selected model, not applied automatically without considering its purpose.

When scaling parameters are learned from data, they must be fitted using the training subset and then applied to validation, test, and inference data. Calculating them from the complete dataset can leak information.

## 10. Feature Engineering

**Feature engineering** is the process of constructing or transforming inputs to make relevant information more useful for a learning task.

The goal is not simply to create more columns. It is to represent information in a way that supports the intended prediction.

### 10.1 Examples

For customer churn, an engineer might create:

- Number of support tickets in the previous 30 days
- Change in usage compared with the previous month
- Number of days since the last login
- Ratio of recent activity to historical activity

These features may express patterns more directly than the original raw fields.

For delivery-time estimation, possible features might include:

- Distance between origin and destination
- Day of the week
- Historical congestion indicators available at prediction time
- Number of delivery stops planned before the prediction

Each feature must be evaluated against the information boundary of the task.

### 10.2 Time-aware feature construction

Time-dependent tasks require particular care.

Suppose a model predicts whether a customer will cancel in the next 30 days. A feature named `support_tickets_last_30_days` must use the 30 days before the prediction time.

It must not include tickets created during the future target period.

The same feature name can describe either a valid historical input or an invalid future-informed value. The calculation's time boundary determines whether it is suitable.

### 10.3 Useful features versus unnecessary complexity

More features do not automatically improve a model.

Additional features can:

- Introduce noise
- Increase data requirements
- Create leakage risks
- Increase computational cost
- Make the data pipeline harder to maintain

Feature engineering should be tied to a hypothesis about what information is useful and whether that information will be available consistently.

Deeper treatment of learned representations and embeddings belongs to [AIF-05 — Representation Learning](../AIF-05-Representation-Learning/README.md). This chapter focuses on preparing and representing task inputs, not on the internal mechanics of learned neural representations.

## 11. Data Splitting: Protecting Honest Evaluation

A machine-learning workflow commonly separates data into training, validation, and test subsets.

Each subset has a distinct responsibility.

### 11.1 Training set

The **training set** is used to fit the model and estimate parameters required by the training process.

Depending on the workflow, this may include fitting data-dependent preprocessing transformations, such as imputation values, scaling parameters, or category mappings.

### 11.2 Validation set

The **validation set** supports development decisions.

It may be used to compare candidate configurations, select hyperparameters, choose features, or decide when to stop an iterative training process.

Because development decisions are influenced by validation results, repeated experimentation can gradually overfit those decisions to the validation set.

### 11.3 Test set

The **test set** is reserved for a final evaluation after the development choices have been made.

It should not repeatedly guide model or feature decisions. If engineers use test results to select among many candidates, the test set is no longer an independent final check of that selection process.

The test set is most useful when its information remains separated from the decisions being evaluated.

### 11.4 Conceptual workflow

```text
Available dataset
       |
       v
Define a suitable split strategy
       |
       +---------------------+
       |          |          |
       v          v          v
    Training   Validation    Test
       |          |           |
       v          v           |
 Fit model    Compare and     |
 and fit      select          |
 permitted    candidates      |
 transforms       |           |
       |          v           |
       +----> Final choice    |
                  |           |
                  +---------->v
                      Final evaluation
```

This diagram is conceptual. Some workflows use cross-validation instead of a single validation split, and small datasets may require different evaluation arrangements. The key requirement is to preserve a defensible separation between fitting, development decisions, and final evaluation.

Chapter 05 covers evaluation protocols and split strategies in detail.

## 12. Data Leakage

**Data leakage** occurs when information that would not legitimately be available to the model for the intended task influences training or evaluation.

Leakage can make evaluation results look substantially better than the model's real-world performance.

It is especially dangerous because the resulting scores may appear plausible and the training process may complete without errors.

### 12.1 Future-information leakage

A feature contains information from after the prediction time.

Example:

A model predicts whether a customer will cancel. The dataset includes a field that is updated only when the cancellation is processed.

The model may learn a strong association because the feature directly reveals the outcome.

In deployment, the field is unavailable at prediction time, so the model cannot use the same information.

**Prevention:** Define a prediction timestamp and ensure every feature is constructed only from information available by that time.

### 12.2 Preprocessing leakage

A transformation is fitted using information from validation or test data before model evaluation.

For example, an engineer calculates the mean and standard deviation of a numerical feature across the complete dataset and then splits the data.

The resulting training process has indirectly used information from the held-out examples.

The effect may be small or large depending on the data and transformation, but the evaluation procedure no longer maintains the intended separation.

**Prevention:** Fit data-dependent transformations on the training subset, then apply the fitted transformations to validation and test subsets.

### 12.3 Duplicate and entity leakage

Related or duplicated observations appear across training and evaluation subsets in a way that makes the task easier than the intended deployment scenario.

For example, if the same customer appears in both training and test data, the evaluation may measure performance on familiar customers rather than generalization to unseen customers.

This is not always leakage in every task. If production predictions will repeatedly concern known customers and historical customer information is legitimately available, a time-aware or entity-aware evaluation may be more appropriate.

The key question is whether the split reflects the real deployment objective.

**Prevention:** Decide whether evaluation should generalize to unseen rows, unseen entities, future time periods, or another target population. Choose the split strategy accordingly.

### 12.4 Target leakage through feature construction

A feature is constructed using the target itself or information that directly encodes the target.

For example, a feature such as `days_until_cancellation` would reveal the outcome if it were calculated using a cancellation event that occurs after the prediction time.

A feature may look like a normal numerical input while actually containing the answer.

**Prevention:** Review feature definitions and their data lineage, not just their names or data types.

### 12.5 Leakage through repeated model selection

Repeatedly selecting features, thresholds, or model configurations based on the test set allows information from the test results to influence development.

Even though the model may not directly train on the test rows, the overall selection process has used their results.

**Prevention:** Keep the test set reserved for final evaluation and use an appropriate validation strategy for development decisions.

### 12.6 Leakage checklist

Before accepting an evaluation result, ask:

- Were all features available at the prediction time?
- Were data-dependent transformations fitted only on permitted training data?
- Can duplicate or related entities cross split boundaries inappropriately?
- Were labels and features constructed without using future outcomes?
- Was the test set protected from repeated model-selection decisions?
- Does the split strategy match the intended deployment scenario?

Leakage prevention is not a single cleaning step. It is a property of the complete data and evaluation workflow.

## 13. Training and Inference Must Use Consistent Transformations

A model is not always just the learned prediction function.

In practice, the complete prediction path may include:

1. Input validation
2. Missing-value handling
3. Categorical encoding
4. Numerical scaling
5. Feature construction
6. Model prediction
7. Output interpretation

If training and inference use different transformations, the model may receive inputs with different meanings or representations.

### 13.1 Example: inconsistent scaling

Suppose training data is standardized using a training-set mean and standard deviation.

During training:

\[
x' = \frac{x-\mu_{\text{train}}}{\sigma_{\text{train}}}
\]

where:

- \(x\) is the original feature value.
- \(\mu_{\text{train}}\) is the mean calculated from training data.
- \(\sigma_{\text{train}}\) is the standard deviation calculated from training data.
- \(x'\) is the transformed value.

At inference, the system should apply the same fitted parameters.

It should not recalculate the mean and standard deviation independently for each request or use a different dataset without a deliberate, validated design.

Otherwise, the same raw value may be transformed differently in different contexts.

### 13.2 Example: inconsistent categorical encoding

Suppose training maps:

```text
Basic    -> [1, 0, 0]
Standard -> [0, 1, 0]
Premium  -> [0, 0, 1]
```

If an inference service changes the category order or silently maps unseen categories using an incompatible scheme, the model receives a different representation from the one it learned.

The service may still return a prediction, but that prediction may be unreliable.

### 13.3 Treat transformations as part of the model contract

The preprocessing configuration should define:

- Expected input fields and types
- Missing-value behavior
- Category mappings and unknown-category handling
- Scaling and imputation parameters
- Feature-construction rules
- Transformation order
- Output schema expected by the model

Where supported, package the preprocessing steps and model into a single pipeline or versioned artifact. This reduces the chance that separate training and serving implementations drift apart.

The implementation details depend on the framework and deployment architecture. The principle is broader: the transformation contract must be explicit, reproducible, and tested.

## 14. Example Workflow: Preparing a Churn Dataset

Consider a task that predicts whether an active customer will cancel within the next 30 days.

### Step 1: Define the prediction snapshot

For each eligible customer, select a prediction time.

For example, the snapshot could be taken at the end of each day.

The feature data must represent information available by that time.

### Step 2: Construct the target

Determine whether the defined cancellation event occurs during the following 30 days.

The team must handle cases where the full target horizon cannot be observed. For example, a recently created record may not yet have 30 days of follow-up data.

Such records should not automatically be labeled as negative just because cancellation has not yet been observed.

### Step 3: Inspect source data

Check:

- Missing values
- Duplicate events
- Invalid dates
- Inconsistent customer identifiers
- Unexpected units or category values
- Label consistency
- Coverage across relevant customer groups

Investigate issues before deciding whether to remove, transform, or retain affected records.

### Step 4: Construct valid features

Examples might include:

- Subscription duration as of the snapshot
- Support-ticket count in the preceding 30 days
- Usage change compared with the preceding month
- Days since the last recorded activity

Verify that every feature uses information available at the snapshot time.

### Step 5: Choose a split strategy

The split should reflect the intended deployment scenario.

If the model will predict future churn, a time-aware split may be more realistic than a random split across all historical snapshots.

If the model must generalize to entirely new customers, an entity-aware split may also be needed.

The appropriate strategy depends on the deployment question and is covered in Chapter 05.

### Step 6: Fit transformations correctly

Fit data-dependent transformations on the training data.

Apply those fitted transformations to validation and test data without recalculating their parameters from the held-out subsets.

### Step 7: Validate the complete workflow

Check that:

- Features are available at prediction time.
- Target labels follow a consistent definition.
- The split prevents inappropriate information sharing.
- Transformations are reproducible.
- Inference uses the same transformation logic.
- Evaluation results reflect the intended deployment scenario.

This workflow does not guarantee a successful model. It establishes a more trustworthy foundation for training and evaluation.

## 15. Production Perspective

Data preparation continues to matter after the first model has been trained.

### 15.1 Data contracts

A data contract defines expectations about input structure and meaning.

For example, a feature contract may specify that `monthly_charge` must be numeric and expressed in a particular currency, while `subscription_status` must belong to an approved set of values.

Contracts make invalid inputs easier to detect before they affect predictions.

### 15.2 Data lineage

Data lineage records where data originated and how it was transformed.

Lineage helps engineers investigate questions such as:

- Which source produced this feature?
- Which transformation generated the value?
- When did the source schema change?
- Which data version was used during training?
- Can the training dataset be reconstructed?

This is especially useful when a model's performance changes unexpectedly.

### 15.3 Training-serving skew

Training-serving skew occurs when the data or transformations used during model development differ from those used to generate predictions in production.

Potential causes include:

- Different defaults for missing values
- Different category mappings
- Different feature-calculation logic
- Different time windows
- Source data that is delayed or incomplete at inference

Tests should verify that equivalent inputs produce equivalent feature representations under the intended training and inference conditions.

### 15.4 Data drift and changing definitions

The distribution of incoming data can change over time. Business definitions and source-system behavior can also change.

For example, a new subscription plan may introduce categories not present during training. A revised logging system may change how usage events are recorded.

These changes may require data validation, pipeline updates, retraining, or renewed evaluation.

The existence of drift does not automatically prove that model performance has degraded. It signals a need to investigate whether the system's assumptions remain valid.

Detailed deployment, monitoring, and operational response practices belong to the relevant PROD and ENT documentation.

## 16. Engineering Decisions and Trade-offs

Data preparation requires deliberate choices. There is rarely a single transformation that is correct for every dataset.

| Decision | Option A | Option B | Main consideration |
|---|---|---|---|
| Missing values | Remove affected records | Impute or represent missingness | Data loss, missingness meaning, and potential bias |
| Duplicates | Remove duplicates | Retain repeated observations | Whether rows represent the same event or legitimate repetition |
| Categorical data | One-hot encoding | Ordinal or another encoding | Category semantics and model requirements |
| Numerical features | Keep original scale | Apply scaling | Algorithm sensitivity and transformation complexity |
| Data splitting | Random split | Time-aware or entity-aware split | Whether the split matches the deployment scenario |
| Feature engineering | Use raw fields | Construct derived features | Predictive value versus leakage and maintenance risk |
| Pipeline design | Separate implementations | Shared or packaged transformations | Flexibility versus consistency and reproducibility |

A disciplined engineer should explain why a transformation is appropriate, what assumptions it makes, and how its effects will be evaluated.

Avoid treating a common practice as a universal rule. The correct decision depends on the data, the task, the algorithm, and the conditions of use.

## 17. Common Mistakes

### Mistake 1: Cleaning data without understanding it

Automatically deleting missing values, duplicates, or outliers can remove valid information.

**Correction:** Investigate the meaning and cause of each issue before selecting a treatment.

### Mistake 2: Treating every numeric column as a meaningful quantity

Identifiers and category codes may be numeric without representing magnitude or distance.

**Correction:** Use the semantics of the field to determine its representation.

### Mistake 3: Fitting transformations on the full dataset

Calculating imputation or scaling parameters using all data can leak held-out information.

**Correction:** Fit data-dependent transformations on the permitted training data and reuse those fitted parameters.

### Mistake 4: Ignoring the prediction timestamp

Features constructed with future information can reveal the target.

**Correction:** Define the prediction time and enforce the information boundary in every feature calculation.

### Mistake 5: Splitting related observations carelessly

Repeated records from the same entity can make evaluation easier than the intended deployment task.

**Correction:** Choose a split strategy that reflects whether the system must generalize to new observations, new entities, future time periods, or another target population.

### Mistake 6: Assuming the test set can guide unlimited experimentation

Repeatedly selecting models using test results makes the final evaluation less independent.

**Correction:** Use validation data or an appropriate cross-validation procedure for development decisions. Preserve a final test set when the evaluation design requires one.

### Mistake 7: Duplicating preprocessing logic

Training and inference may silently use different transformations.

**Correction:** Share or package transformation logic where possible, version its configuration, and test the complete prediction path.

### Mistake 8: Assuming excellent evaluation scores prove data quality

A high score can result from leakage, duplicated observations, or an unrealistic split.

**Correction:** Review the data construction and evaluation protocol alongside the reported performance.

## 18. Interview Questions with Expected Answers

### Question 1: What is the difference between a feature and a label?

**Expected answer:** A feature is an input variable used to describe an example. A label or target is the outcome the model is intended to learn or predict in a supervised task. A feature must be valid for the prediction time, while the target definition must represent the intended outcome.

### Question 2: Why is data preparation more than cleaning?

**Expected answer:** It establishes the meaning and structure of the learning dataset, handles data-quality issues, preserves the relationship between inputs and targets, prevents leakage, and ensures that transformations remain consistent between training and inference.

### Question 3: Why should data-dependent transformations be fitted using training data only?

**Expected answer:** Fitting transformations on validation or test data allows information from held-out examples to influence training. This can make evaluation less representative of performance on genuinely unseen data.

### Question 4: What is data leakage?

**Expected answer:** Data leakage occurs when information that should not be available for the intended learning or prediction task influences training or evaluation. Examples include future information in features, preprocessing fitted on held-out data, and inappropriate sharing of related observations across split boundaries.

### Question 5: Is a random train-test split always appropriate?

**Expected answer:** No. Random splitting may be unsuitable when observations are time-dependent, repeated for the same entity, or otherwise related. The split should reflect the intended deployment scenario and the type of generalization being measured.

### Question 6: Why should training and inference transformations remain consistent?

**Expected answer:** The model learns from a particular feature representation. If inference uses different encodings, scaling, missing-value handling, or feature calculations, the inputs may have different meanings from those used during training.

### Question 7: Should all outliers be removed?

**Expected answer:** No. An outlier may be a valid rare event or an important case. Engineers should investigate its origin and determine whether it is invalid, relevant, or requires special treatment.

### Question 8: What is the difference between data quality and label quality?

**Expected answer:** Data quality concerns whether the observations and input fields are accurate, consistent, and suitable for the task. Label quality concerns whether the target outcomes are correctly and consistently assigned. Both affect the learning process.

## 19. Quick Revision

- A **sample** is one observation or example.
- A **feature** is an input variable.
- A **label or target** is the outcome to be learned in a supervised task.
- Data quality issues include missing values, duplicates, inconsistent representations, invalid values, and unreliable labels.
- Encoding converts categorical information into a representation suitable for the chosen learning method.
- Scaling can be useful when an algorithm is sensitive to feature magnitude.
- Feature engineering constructs or transforms inputs to represent relevant information more effectively.
- Training data fits the model and permitted preprocessing transformations.
- Validation data supports development and selection decisions.
- Test data provides a final evaluation when kept independent of those decisions.
- Data leakage allows inappropriate information to influence learning or evaluation.
- Every feature must respect the prediction-time information boundary.
- Training and inference must use consistent transformation logic and parameters.

## 20. Key Takeaways

1. Data preparation must preserve the meaning of the original ML problem.
2. Understand the cause of a data-quality issue before deciding how to handle it.
3. Define the prediction unit, target, and prediction time before constructing features.
4. Fit data-dependent transformations using the permitted training data.
5. Choose a split strategy that matches the intended deployment scenario.
6. Treat leakage prevention as a property of the complete workflow, not as a single cleaning step.
7. Make preprocessing reproducible and consistent between training and inference.
8. Validate the data pipeline as carefully as the model itself.

## 21. Practice Assignment

Design a preparation workflow for a model that predicts whether a customer will cancel a subscription within the next 30 days.

Write a short engineering specification covering:

1. What one row represents.
2. How the target is defined.
3. Which features are available at prediction time.
4. How you would investigate missing values, duplicates, and inconsistent labels.
5. Which categorical or numerical transformations may be required.
6. How you would prevent future-information leakage.
7. How you would fit transformations without contaminating held-out evaluation data.
8. What split strategy you would investigate and why.
9. How you would ensure that training and inference use consistent transformations.
10. What tests would help detect invalid or unexpected inputs.

Include at least two potential leakage scenarios and explain how you would prevent them.

Do not implement a full preprocessing library. The goal is to demonstrate that you can design a trustworthy data-preparation process and justify its decisions.

## 22. Teaching Check

Explain to another engineer why a model can achieve excellent evaluation scores while still failing in production.

Your explanation should connect:

- The prediction-time information boundary
- Data quality and label quality
- Data leakage
- Training, validation, and test responsibilities
- Consistency between training and inference

If your explanation focuses only on cleaning missing values, revisit the sections on leakage and transformation consistency. Those are essential parts of data preparation, not optional deployment details.

**Engineering principle:** A model can only learn reliably from data that represents the intended task, respects the information boundary, and can be processed consistently when real predictions are made.
