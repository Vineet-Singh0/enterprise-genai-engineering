# AIF-03 — Machine Learning Foundations

Machine Learning Foundations establishes the concepts and engineering judgment needed to formulate machine-learning problems, prepare data, understand generalization, evaluate models reliably, and select models using evidence.

This pillar focuses on understanding **why machine-learning systems work, how to evaluate their behavior, and how to make reliable engineering decisions**. It is not an exhaustive algorithm catalog or a framework-specific tutorial.

## 1. Learning Objectives

After completing AIF-03, you should be able to:

- Translate a real-world objective into a well-defined machine-learning problem.
- Distinguish supervised, unsupervised, semi-supervised, self-supervised, and reinforcement learning.
- Understand datasets, samples, features, labels, and data-preparation requirements.
- Identify data leakage and explain why it produces misleading results.
- Explain overfitting, underfitting, bias, variance, and generalization.
- Design appropriate training, validation, and test strategies.
- Choose suitable evaluation metrics and interpret their limitations.
- Compare candidate models and justify a selection using evidence.
- Recognize when machine learning may not be the appropriate solution.

Completion requires practical reasoning and explanation, not reading alone.

## 2. Prerequisites

AIF-03 follows the first two AIF pillars.

| Prerequisite | Relevant knowledge |
|---|---|
| [AIF-01 — Mathematics Foundation](../AIF-01-Mathematics-Foundation/README.md) | Functions, probability, statistics, vectors, and optimization intuition |
| [AIF-02 — AI Fundamentals](../AIF-02-AI-Fundamentals/README.md) | AI approaches, problem formulation, reasoning foundations, and the AI system lifecycle |

You do not need to master every mathematical detail before starting. You should be comfortable with basic data concepts, variables, functions, and the interpretation of uncertainty.

## 3. Learning Path

Follow the six chapters in the recommended order.

### Chapter 01 — ML Problem Formulation

**Difficulty:** Beginner

**Estimated reading time:** 15–20 minutes

[Read ML Problem Formulation](01-ML-Problem-Formulation.md)

Learn how to translate a real-world objective into a machine-learning task. Define inputs, outputs, target variables, prediction units, success criteria, and baselines. Understand when machine learning is unnecessary or unsuitable.

### Chapter 02 — Learning Paradigms

**Difficulty:** Beginner–Intermediate

**Estimated reading time:** 15–20 minutes

[Read Learning Paradigms](02-Learning-Paradigms.md)

Understand how supervised, unsupervised, semi-supervised, self-supervised, and reinforcement learning differ in their learning signals, objectives, feedback, and suitable applications.

### Chapter 03 — Data Preparation, Features and Labels

**Difficulty:** Intermediate

**Estimated reading time:** 20–25 minutes

[Read Data Preparation, Features and Labels](03-Data-Preparation-Features-and-Labels.md)

Learn how datasets, samples, features, and labels fit together. Explore data quality, missing values, duplicates, categorical and numerical features, encoding, scaling, feature engineering, and leakage prevention. Understand why training-time transformations must remain consistent with inference-time behavior.

### Chapter 04 — Bias, Variance and Generalization

**Difficulty:** Intermediate

**Estimated reading time:** 20–25 minutes

[Read Bias, Variance and Generalization](04-Bias-Variance-and-Generalization.md)

Understand how models learn from finite datasets and why strong training performance does not guarantee good performance on unseen examples. Explore overfitting, underfitting, model complexity, regularization, learning curves, and distribution differences.

### Chapter 05 — Model Evaluation and Cross-Validation

**Difficulty:** Intermediate

**Estimated reading time:** 20–25 minutes

[Read Model Evaluation and Cross-Validation](05-Model-Evaluation-and-Cross-Validation.md)

Learn the responsibilities of training, validation, and test datasets. Understand holdout evaluation, cross-validation, stratified and group-aware splitting, time-dependent data, evaluation leakage, uncertainty, and reproducibility.

### Chapter 06 — Evaluation Metrics and Model Selection

**Difficulty:** Intermediate

**Estimated reading time:** 25–30 minutes

[Read Evaluation Metrics and Model Selection](06-Evaluation-Metrics-and-Model-Selection.md)

Learn how to select and interpret classification and regression metrics, understand confusion matrices and decision thresholds, recognize misleading results under class imbalance, compare models fairly, and justify model-selection decisions.

## 4. Recommended Learning Schedule

The following schedule includes reading, reasoning exercises, and revision.

| Session | Focus | Estimated time |
|---|---|---:|
| 0 | Orientation and prerequisite review | 15 minutes |
| 1 | Problem formulation | 35 minutes |
| 2 | Learning paradigms | 30 minutes |
| 3 | Data preparation | 45 minutes |
| 4 | Bias, variance, and generalization | 40 minutes |
| 5 | Evaluation protocols | 45 minutes |
| 6 | Metrics and model selection | 50 minutes |
| 7 | Consolidation and revision | 30 minutes |
| **Total** | | **4 hours 50 minutes** |

These estimates are planning guidelines. Spend additional time on concepts that require practical experimentation or deeper reasoning.

## 5. Practical Learning Approach

Use one consistent example throughout the pillar: predicting whether a customer will cancel a subscription.

As you progress, practice the following:

1. Define exactly what cancellation prediction means and when a prediction must be made.
2. Determine which learning paradigm fits the available data and feedback.
3. Identify useful features, target labels, data-quality issues, and leakage risks.
4. Explain how a model might overfit historical customer behavior.
5. Design an evaluation strategy that reflects the intended prediction scenario.
6. Choose appropriate metrics and justify the trade-offs between candidate models.

The objective is to connect individual concepts into a coherent engineering workflow rather than memorize isolated definitions.

## 6. Connections to Other AIF Pillars

AIF-03 is part of the seven-pillar AI Foundations curriculum.

| Pillar | Relationship to AIF-03 |
|---|---|
| [AIF-01 — Mathematics Foundation](../AIF-01-Mathematics-Foundation/README.md) | Provides mathematical foundations used to reason about learning and evaluation |
| [AIF-02 — AI Fundamentals](../AIF-02-AI-Fundamentals/README.md) | Establishes the broader AI context and problem lifecycle |
| [AIF-04 — Deep Learning Foundations](../AIF-04-Deep-Learning-Foundations/README.md) | Builds on learning and generalization concepts to explain neural networks and training dynamics |
| [AIF-05 — Representation Learning](../AIF-05-Representation-Learning/README.md) | Develops deeper understanding of learned features, representations, and embeddings |
| [AIF-06 — Sequence Modeling](../AIF-06-Sequence-Modeling/README.md) | Introduces sequential data and specialized sequence-modeling architectures |
| [AIF-07 — Transformer Foundations](../AIF-07-Transformer-Foundations/README.md) | Explains attention and transformer architectures |

AIF-03 focuses on foundational machine-learning reasoning. Specialized neural-network internals, learned representations, sequence architectures, and transformers belong to their respective pillars.

## 7. Scope Boundaries

AIF-03 owns:

- Machine-learning problem formulation.
- Learning paradigms.
- Data preparation, features, labels, and leakage awareness.
- Generalization, overfitting, underfitting, bias, and variance.
- Evaluation protocols and cross-validation.
- Evaluation metrics and model-selection reasoning.

It does not replace:

- AIF-01's detailed mathematical foundations.
- AIF-04's neural-network architectures and training mechanics.
- AIF-05's deeper treatment of embeddings and learned representations.
- AIF-06 and AIF-07's sequence-modeling and transformer foundations.
- ENG's general software-engineering foundations.
- RET's retrieval-specific evaluation and ranking systems.
- PROD's deployment, serving, monitoring, and operational practices.
- ENT's enterprise integration and governance concerns.

When a concept belongs to another domain, use a concise explanation and a link rather than duplicate its primary teaching material.

## 8. Completion Criteria

Consider AIF-03 complete when you can demonstrate the following capabilities.

- [ ] Formulate a practical ML problem with explicit inputs, targets, assumptions, and success criteria.
- [ ] Explain the major learning paradigms and justify a suitable choice for a given scenario.
- [ ] Identify data-quality issues, leakage risks, and inconsistent training/inference transformations.
- [ ] Diagnose plausible causes of overfitting and underfitting.
- [ ] Design a defensible evaluation protocol for independent, grouped, or time-dependent data.
- [ ] Select evaluation metrics according to the problem objective and explain their limitations.
- [ ] Compare candidate models and justify a selection using evidence and trade-offs.
- [ ] Explain the complete problem-to-evaluation workflow clearly enough to teach another engineer.

Reading all six chapters is the beginning of completion. Demonstrating these capabilities is the real objective.

---

**Next pillar:** [AIF-04 — Deep Learning Foundations](../AIF-04-Deep-Learning-Foundations/README.md)

*This README is a navigation and orientation page. Detailed technical explanations belong in the individual teaching chapters.*
