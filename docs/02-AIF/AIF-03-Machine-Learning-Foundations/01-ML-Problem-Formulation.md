# 01 — Machine Learning Problem Formulation

## 1. Why Problem Formulation Matters

Machine learning projects do not begin with choosing an algorithm. They begin with understanding a real-world problem and deciding whether learning from data is an appropriate way to solve it.

A business may ask for a system that predicts customer churn, detects fraudulent transactions, estimates delivery times, or groups similar documents. These requests sound straightforward, but each hides important engineering decisions:

- What exactly must the system predict or produce?
- What information will be available when the prediction is needed?
- What does one prediction represent?
- What historical data can teach the system?
- How will the organization determine whether the solution is useful?
- Is machine learning better suited to this problem than a simpler alternative?

If these questions are answered incorrectly, even a technically sophisticated model can solve the wrong problem.

**Problem formulation** is the process of translating a real-world objective into a clearly defined machine-learning task, including its inputs, outputs, prediction unit, assumptions, constraints, and success criteria.

The central principle is:

> A model can perform well on the task it was given while failing at the problem the organization actually needed to solve.

This chapter develops the reasoning needed to prevent that mismatch.

## 2. Learning Objectives

After completing this chapter, you should be able to:

- Translate a business or operational objective into a machine-learning problem.
- Distinguish the real-world objective from the model's prediction target.
- Define samples, inputs, outputs, and target variables.
- Choose an appropriate prediction unit and prediction time.
- Distinguish classification, regression, and clustering problems.
- Identify important data assumptions and constraints.
- Establish a baseline and define evidence of success.
- Recognize situations where machine learning is unnecessary, infeasible, or inappropriate.

## 3. From a Real-World Objective to an ML Task

Consider a subscription business experiencing customer cancellations.

A stakeholder says:

> "We need AI to reduce customer churn."

This is a business objective, not yet a machine-learning problem. It does not specify what the system should predict, when it should make a prediction, or how the organization will use the result.

A useful formulation process separates three levels.

### 3.1 Business objective

The business objective describes the real-world outcome the organization wants to improve.

Examples:

- Reduce avoidable customer cancellations.
- Detect fraudulent payments before they are completed.
- Improve the accuracy of delivery-time estimates.
- Identify documents that belong to similar subject areas.

Business objectives are usually expressed in terms of cost, risk, quality, time, or customer outcomes.

### 3.2 Operational decision

The operational decision describes what a person or system will do with the information.

For customer churn, possible decisions include:

- Prioritize customers for retention outreach.
- Offer support to customers showing signs of dissatisfaction.
- Investigate recurring service problems.
- Allocate limited retention resources.

A prediction that does not influence a meaningful decision may have little practical value.

### 3.3 Machine-learning task

The machine-learning task describes the output that must be learned from data.

For example:

> For each active customer, estimate whether that customer will cancel the subscription within the next 30 days, using only information available at the time the prediction is made.

This statement is more precise. It identifies a prediction unit, a target event, a time horizon, and an information constraint.

The resulting prediction may support a retention decision, but it does not guarantee that the decision will reduce churn. That depends on what actions are taken and how customers respond.

### The formulation chain

```text
Business objective
        |
        v
Operational decision
        |
        v
ML task and prediction target
        |
        v
Inputs, data assumptions, constraints
        |
        v
Baseline and success criteria
```

Each step narrows the problem while preserving its connection to the original objective.

## 4. Define the Prediction Unit

The **prediction unit** is the entity or event for which one prediction is produced.

Examples include:

- One customer
- One transaction
- One support ticket
- One product
- One delivery
- One document

Choosing the wrong unit can distort the dataset, the target, and the eventual evaluation.

### Example: customer churn

Suppose a company has 100,000 customers and five years of monthly account records.

There are at least two possible dataset designs:

1. One row per customer.
2. One row per customer per month.

These represent different prediction tasks.

With one row per customer, the task might be to predict whether a customer will ever cancel during a defined future period.

With one row per customer per month, the task might be to predict whether an active customer will cancel within the next 30 days, based on that month's available information.

The second formulation can represent changing customer circumstances over time. However, it also introduces additional requirements: repeated observations from the same customer are related, historical records must be ordered correctly, and evaluation must reflect how predictions will be used.

The number of rows is not necessarily the number of independent real-world entities.

### Questions to ask

Before creating a dataset, establish:

- What does one row represent?
- Can the same real-world entity appear multiple times?
- Are repeated observations independent, or do they share history?
- At what point must a prediction be produced?
- What decision will each prediction support?

These questions help determine the dataset structure and inform later decisions about splitting and evaluation.

See [Chapter 03 — Data Preparation, Features and Labels](03-Data-Preparation-Features-and-Labels.md) for the detailed treatment of samples and dataset construction.

## 5. Define Inputs, Outputs, and Targets

A machine-learning problem needs a clear contract between the information supplied to the model and the output expected from it.

### 5.1 Inputs

**Inputs** are the information provided to the model when it makes a prediction.

For a customer churn problem, possible inputs include:

- Subscription duration
- Recent usage patterns
- Number of support interactions
- Current subscription plan
- Billing history available at prediction time

The key constraint is availability: an input must be obtainable at the time the prediction is required.

A feature that exists in a historical database is not automatically a valid input.

For example, a cancellation reason recorded after a customer cancels cannot be used to predict that cancellation beforehand.

### 5.2 Target variable

The **target variable** is the outcome the model is intended to learn or predict.

For a churn prediction task, the target could be defined as:

- `1`: the customer cancels within the next 30 days.
- `0`: the customer does not cancel within the next 30 days.

This definition makes the target more precise than the vague label "churn."

A target definition must specify what counts as the event, which events are excluded, and the period in which the event must occur.

For example, a temporary subscription pause may or may not count as churn. The correct definition depends on the business objective and must be agreed upon before labels are generated.

### 5.3 Outputs

The **output** is what the system produces for downstream use.

Depending on the task, it might be:

- A predicted category
- A numerical estimate
- A probability or score
- A group assignment

For churn, the model might produce a probability of cancellation. A separate decision rule could determine which customers receive retention outreach.

This distinction matters because a prediction and a decision are not the same thing.

A model estimates an outcome. A downstream policy determines how to act on that estimate.

### 5.4 The prediction contract

A useful problem specification explicitly records:

| Element | Example: customer churn |
|---|---|
| Prediction unit | Active customer at a defined snapshot time |
| Inputs | Customer information available at that time |
| Target | Cancellation within the following 30 days |
| Output | Estimated probability of cancellation |
| Consumer | Retention operations team |
| Intended action | Prioritize customers for possible intervention |

The table is a starting contract, not a complete production specification. It makes assumptions visible so that business, data, and engineering teams can challenge them before implementation.

## 6. Choose the Appropriate Problem Category

The target and intended output help determine the broad machine-learning problem category.

### 6.1 Classification

**Classification** predicts a discrete category.

Examples:

- Whether a transaction is fraudulent
- Whether a customer will cancel within a defined period
- Whether a support ticket is urgent
- Whether a document belongs to one of several predefined categories

Classification may involve two classes or multiple classes. Some tasks allow an example to belong to more than one class, which requires a different formulation from assigning exactly one class.

The central question is:

> Which category, among the defined possibilities, best describes this example?

The target categories must have clear definitions. If different teams label the same case differently, the problem may require better labeling rules before model development.

### 6.2 Regression

**Regression** predicts a numerical quantity.

Examples:

- Estimating delivery duration
- Predicting product demand
- Estimating repair cost
- Forecasting a numerical business outcome

The target is a quantity rather than a predefined class.

A numerical target does not automatically imply that every value is meaningful or that every error has the same business impact. Those considerations influence evaluation and later model-selection decisions.

### 6.3 Clustering

**Clustering** groups examples based on patterns or similarities in their data, without requiring predefined target categories for every example.

Examples:

- Exploring customer behavior patterns
- Grouping similar support tickets
- Identifying broad segments in a collection of documents

Clustering is often exploratory. The groups produced by an algorithm are not automatically meaningful business categories.

Engineers must determine whether the resulting groups are stable, interpretable, and useful for the intended purpose. A cluster should not be treated as a ground-truth category simply because an algorithm created it.

### 6.4 These categories are not interchangeable

Consider three requests involving customer data:

| Objective | Possible formulation | Broad category |
|---|---|---|
| Predict whether a customer will cancel | Predict a predefined cancellation outcome | Classification |
| Estimate how much revenue a customer will generate | Predict a numerical amount | Regression |
| Discover groups of customers with similar behavior | Identify structure in customer data | Clustering |

The same underlying dataset can support different tasks. The correct formulation follows from the question being asked, not merely from the available columns or the algorithm a team wants to use.

Other task families exist, but this chapter focuses on the foundational distinctions needed to formulate common ML problems. Detailed learning paradigms are covered in [Chapter 02 — Learning Paradigms](02-Learning-Paradigms.md).

## 7. Specify Prediction Time and the Information Boundary

A model's inputs must be defined relative to the moment at which its prediction is needed.

This is a fundamental engineering constraint.

Suppose a payment service wants to identify potentially fraudulent transactions before approving them.

At the decision time, it might know:

- Transaction amount
- Merchant identifier
- Customer's previous transaction history
- Device information available during the transaction

It might not know:

- Whether the customer will later dispute the payment
- The result of a future investigation
- A chargeback recorded weeks later

The last group of fields may be strongly associated with fraud, but it is not available when the actual prediction must be made.

Using future information can make historical performance look excellent while making the model unusable in practice. This is a form of **data leakage**, covered in detail in Chapter 03.

### 7.1 Prediction time and target horizon

Many problems require two distinct time definitions:

- **Prediction time:** when the system must produce its output.
- **Target horizon:** the future period, if any, over which the target outcome is defined.

For churn prediction:

- Prediction time: the end of each day for active customers.
- Target horizon: whether cancellation occurs during the following 30 days.

These definitions affect which records are eligible, which inputs are valid, and how historical examples are constructed.

### 7.2 Important data assumptions

A formulation should also make relevant assumptions explicit.

Examples include:

- Historical records represent the intended population.
- Target labels are sufficiently reliable.
- Inputs are available with acceptable latency.
- The target event can be observed within the chosen horizon.
- The relationship between historical data and future cases is useful enough to learn from.
- The model will be used only in the circumstances for which it was designed.

These assumptions are not guaranteed to hold. They should be validated where possible and monitored where they may change.

## 8. Define Success Before Selecting a Model

A machine-learning project needs an explicit definition of success before implementation begins.

Without one, teams can optimize a technical measure that does not improve the operational outcome.

For example, a churn model may produce reasonable predictions, but the business might still fail to reduce cancellations because:

- Retention staff cannot act on the predictions in time.
- The intervention does not change customer behavior.
- The system flags too many customers for the available team.
- The model performs poorly for a key customer segment.
- The cost of intervention exceeds the benefit.

Success should therefore be considered at more than one level.

### 8.1 Technical success

Technical success describes whether the model provides useful predictive information on appropriate evaluation data.

The exact metrics and evaluation protocol depend on the task and are covered in later chapters:

- [Chapter 05 — Model Evaluation and Cross-Validation](05-Model-Evaluation-and-Cross-Validation.md)
- [Chapter 06 — Evaluation Metrics and Model Selection](06-Evaluation-Metrics-and-Model-Selection.md)

At the formulation stage, the goal is to identify the predictive capability required—not to prematurely select a metric or model.

### 8.2 Operational success

Operational success describes whether the system can be used effectively in the intended workflow.

Examples include:

- Producing predictions before a decision deadline
- Processing the required volume of records
- Providing outputs in a format downstream systems can consume
- Operating within a defined resource or cost budget
- Supporting an appropriate human review process

Operational constraints may rule out a technically attractive solution.

### 8.3 Business success

Business success describes whether the intervention produces the intended real-world benefit.

Examples include:

- Reducing avoidable cancellations
- Reducing fraud-related losses
- Improving delivery planning
- Reducing time spent manually reviewing documents

Predictive performance alone does not prove business impact. If a model triggers an intervention, the effect of that intervention may need to be evaluated separately.

A strong problem formulation connects technical requirements to operational decisions and business outcomes without assuming that success at one level guarantees success at the others.

## 9. Establish a Baseline

A **baseline** is a reference approach against which the proposed ML solution can be compared.

The baseline answers an important question:

> What happens if we do not introduce the proposed model?

Possible baselines include:

- The current manual process
- A fixed business rule
- A simple heuristic
- A constant prediction
- A simple, interpretable model

The appropriate baseline depends on the problem. A baseline should be credible, relevant to the intended use, and measured under a comparable evaluation setup.

### Example: delivery-time estimation

Suppose a logistics team wants to estimate delivery duration.

Before building a complex model, engineers might compare against:

- The current delivery-time estimate
- A simple estimate based on historical average duration
- A straightforward rule based on route or delivery category

A complex model that offers no meaningful improvement over a simple baseline may not justify its additional cost and operational complexity.

A baseline is not merely a weak competitor selected to make the proposed system look good. It is a practical reference for judging whether additional complexity is worthwhile.

### Baseline questions

- What approach is used today?
- What performance does it achieve under the same evaluation conditions?
- What does the proposed model need to improve?
- What additional complexity or risk will the model introduce?
- Would a simpler change solve the problem adequately?

Detailed model comparison and selection belong to Chapter 06.

## 10. When Machine Learning Is Not the Right Solution

Not every problem benefits from a learned model.

Machine learning is most useful when data contains patterns that can support the desired task and those patterns are sufficiently relevant to future use. It is not a universal replacement for explicit rules, ordinary software, or better data collection.

Consider alternatives before proceeding.

### 10.1 The problem is deterministic and well-defined

If a rule reliably solves the problem, implementing the rule may be simpler and more predictable.

For example, calculating a contractual fee from a clearly specified formula generally does not require learning from examples.

A rule-based approach may still need careful handling of exceptions, but training a model is not automatically justified.

### 10.2 There is insufficient or unsuitable data

A model cannot learn a reliable relationship from data that does not contain adequate evidence for the target.

Potential blockers include:

- Too few relevant examples
- Unreliable or inconsistent labels
- Missing coverage of important cases
- Historical data that does not represent the intended use
- A target that cannot be observed reliably

More data is not always the answer. Sometimes the problem requires improved instrumentation, better labeling, or a revised objective.

### 10.3 The required decision is not supported by available information

A model cannot reliably infer every hidden fact from observable data.

If the available inputs contain little useful information about the target, changing algorithms may not solve the underlying limitation.

The correct engineering response may be to collect different data, narrow the task, introduce human judgment, or accept that the prediction cannot be made reliably.

### 10.4 The consequences of errors are unacceptable

Some applications require stronger evidence, oversight, or safeguards than a model can currently provide.

The decision to use ML must account for the consequences of incorrect predictions, the availability of human review, applicable requirements, and the feasibility of validating the system.

High stakes do not automatically prohibit machine learning, but they change the evidence and controls required before deployment.

### 10.5 The operational cost exceeds the benefit

Data pipelines, model development, evaluation, integration, monitoring, and maintenance all have costs.

A simpler solution may deliver sufficient value with less operational risk.

The relevant comparison is not "model versus no intelligence." It is the proposed ML system versus the best feasible alternative for the same objective.

## 11. A Practical Problem-Formulation Template

Before implementation, document the problem in a concise, reviewable form.

| Field | Questions to answer |
|---|---|
| Business objective | What real-world outcome needs improvement? |
| Operational decision | What action will the output support? |
| Prediction unit | What entity or event receives one prediction? |
| Prediction time | When must the prediction be available? |
| Inputs | What information is available at that time? |
| Target | What exact outcome is being predicted? |
| Target horizon | Over what period is the outcome defined, if applicable? |
| Problem category | Is the task classification, regression, clustering, or another formulation? |
| Data assumptions | What must be true about data coverage, quality, and relevance? |
| Constraints | What limits apply to latency, cost, volume, or use? |
| Baseline | What existing or simpler approach provides a comparison? |
| Success criteria | What evidence would justify using the proposed solution? |
| Failure consequences | What happens when the output is wrong or unavailable? |
| ML suitability | Why is a learned solution preferable to a simpler alternative? |

This template is intentionally technology-neutral. It can be completed before choosing a library, model family, or infrastructure.

### Worked example: customer churn

**Business objective:** Reduce avoidable customer cancellations.

**Operational decision:** Help the retention team prioritize outreach.

**Prediction unit:** One active customer at a daily snapshot.

**Prediction time:** The end of the snapshot day.

**Inputs:** Customer and usage information available by that time.

**Target:** Whether the customer cancels during the following 30 days.

**Problem category:** Binary classification.

**Data assumptions:** Historical records adequately represent relevant customer behavior, cancellation events are labeled consistently, and input data is available at prediction time.

**Constraints:** Predictions must be available before the retention team's daily prioritization process.

**Baseline:** The current retention-prioritization method or a simple business rule.

**Success criteria:** Evidence that the model provides useful predictive information and can support the operational workflow better than the baseline, subject to defined resource and risk constraints.

**Failure consequences:** Some customers may be missed, while others may receive unnecessary outreach. The business must decide how these errors affect the workflow.

**ML suitability:** The team should verify that historical customer data contains useful predictive signals and that a model offers enough value to justify its additional complexity.

This formulation is a starting hypothesis, not proof that the project will succeed. Data quality, model evaluation, and operational testing must validate the assumptions.

## 12. Common Problem-Formulation Mistakes

### Mistake 1: Starting with an algorithm

"We should use a random forest" is not a problem definition.

**Correction:** Define the objective, prediction target, inputs, constraints, and baseline first. Select candidate algorithms after the task is clear.

### Mistake 2: Using an ambiguous target

"Predict churn" leaves unanswered what counts as churn and when it must occur.

**Correction:** Define the event, prediction unit, and target horizon precisely enough that independent teams would label the same case consistently.

### Mistake 3: Ignoring prediction time

A historical dataset may contain fields that become available only after the event being predicted.

**Correction:** Define the information boundary before selecting features. Investigate leakage during data preparation.

### Mistake 4: Confusing predictions with decisions

A high-risk score does not automatically tell an organization what action to take.

**Correction:** Specify how the output will be consumed, what decision it supports, and what constraints govern the downstream action.

### Mistake 5: Treating model performance as business impact

A model may predict well without changing the business outcome.

**Correction:** Distinguish predictive quality from operational effectiveness and business impact.

### Mistake 6: Skipping the baseline

Without a baseline, it is difficult to determine whether the ML solution justifies its cost.

**Correction:** Record the existing or simplest credible alternative before model development.

### Mistake 7: Assuming ML is always necessary

Some problems are better solved with deterministic rules, improved data collection, or a process change.

**Correction:** Compare ML against feasible alternatives and account for maintenance, risk, and total operational cost.

## 13. How This Connects to the Remaining AIF-03 Chapters

Problem formulation establishes the decisions that the remaining chapters refine.

- **Chapter 02 — Learning Paradigms:** determines what kind of learning signal is available and which broad learning setup fits the task.
- **Chapter 03 — Data Preparation, Features and Labels:** translates the formulation into a usable dataset while addressing quality, transformations, and leakage.
- **Chapter 04 — Bias, Variance and Generalization:** examines whether a learned model captures useful patterns and performs beyond its training examples.
- **Chapter 05 — Model Evaluation and Cross-Validation:** defines a defensible procedure for estimating performance on unseen data.
- **Chapter 06 — Evaluation Metrics and Model Selection:** chooses measures and compares candidate models against the task's objectives and constraints.

These chapters are connected, but their responsibilities are distinct. Problem formulation defines what needs to be solved; later chapters establish how to learn from data and gather evidence that the proposed solution works.

## 14. Completion Checklist

Before moving on, verify that you can:

- [ ] Explain the difference between a business objective, an operational decision, and an ML task.
- [ ] Define the prediction unit and explain why it matters.
- [ ] Identify the inputs, output, and target variable.
- [ ] Specify prediction time and target horizon where relevant.
- [ ] Distinguish classification, regression, and clustering.
- [ ] Identify the assumptions and constraints that affect the task.
- [ ] Propose a credible baseline and explain why it is needed.
- [ ] Define success in technical, operational, and business terms.
- [ ] Explain at least two situations where ML may not be appropriate.
- [ ] Complete the problem-formulation template for a real use case.

## 15. Practice Assignment

Choose one real-world problem from customer support, fraud detection, logistics, document processing, or another domain you understand.

Write a one-page problem specification using the template in Section 11.

Your specification must make the following decisions explicit:

1. What business outcome are you trying to improve?
2. What operational decision will the output support?
3. What is the prediction unit?
4. When must the prediction be made?
5. What exact target will be learned?
6. What information is available at prediction time?
7. Which broad problem category fits the task, and why?
8. What baseline would you use?
9. What evidence would justify proceeding with ML?
10. What is the strongest reason to reject or revise your proposed formulation?

Do not select a specific algorithm yet. The objective is to demonstrate that you can define the problem independently of a preferred technology.

## 16. Teaching Check

Explain your chosen problem to another engineer in five minutes without reading your specification.

They should be able to answer:

- What is being predicted or discovered?
- For which entity or event?
- At what point in time?
- Using what available information?
- Why is machine learning a reasonable candidate?
- How would you know whether the effort was worthwhile?

If these questions produce ambiguity, revise the formulation before proceeding to implementation.

**Engineering principle:** Define the problem before choosing the model. A clear formulation does not guarantee success, but an unclear formulation makes reliable success difficult to measure and reproduce.
