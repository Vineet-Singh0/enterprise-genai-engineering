# 02 — Learning Paradigms

## 1. Learning Objectives

After completing this chapter, you should be able to:

- Explain what a learning paradigm describes.
- Distinguish supervised, unsupervised, semi-supervised, self-supervised, and reinforcement learning.
- Identify the learning signal available in a problem.
- Explain how the learning signal influences the objective and the data required.
- Select a reasonable learning paradigm for a given problem.
- Recognize the limitations and assumptions of each paradigm.
- Explain why the availability of data alone does not determine which learning approach is appropriate.

## 2. Prerequisites

Before starting this chapter, you should understand how a real-world objective becomes a machine-learning task.

Review [Chapter 01 — ML Problem Formulation](01-ML-Problem-Formulation.md) if you need to revisit:

- Inputs, outputs, and target variables
- Prediction units and prediction objectives
- Classification, regression, and clustering
- The relationship between technical predictions and business decisions

This chapter builds on problem formulation by answering a new question:

**Given the problem we want to solve, what kind of learning signal can the system use to learn from data or experience?**

## 3. Estimated Reading Time

- Reading: 15–20 minutes
- Reasoning exercise and revision: 15–20 minutes
- Total suggested session: 30–40 minutes

## 4. Before We Start

Imagine three engineering teams working on different problems.

**Team A** has thousands of support tickets, each labeled as `billing`, `technical`, or `account access`.

**Team B** has millions of customer activity records but no predefined customer categories. The team wants to discover recurring behavior patterns.

**Team C** is developing a system that chooses actions in a simulated environment and receives rewards based on the results.

All three teams have data. However, they do not have the same kind of learning signal.

- Team A has examples paired with known answers.
- Team B has observations but no predefined target labels for its discovery task.
- Team C learns from the consequences of actions over time.

These differences affect how each system can learn.

A learning paradigm describes the broad setup through which a model or learning system obtains information about what it should learn.

The central engineering question is not simply, "Which algorithm should we use?"

It is:

> What information tells the system whether its predictions, representations, or actions are useful?

## 5. Why Learning Paradigms Exist

A learning algorithm cannot learn an intended behavior from nothing. It needs some source of information that constrains what counts as a useful result.

That information may come from:

- Human-provided labels
- Known numerical outcomes
- The structure of the data itself
- Relationships within an observation
- Feedback from an environment after taking actions

Different problems provide different forms of feedback.

If the desired answer is known for each training example, learning can directly compare a model's output with that answer. If answers are unavailable, the system may instead discover structure or create its own training signal from the data. If actions affect future outcomes, learning must account for the consequences of decisions over time.

These are different learning conditions, so they require different objectives and evaluation strategies.

### 5.1 The learning-signal mental model

Think of a learning signal as evidence that guides improvement.

```text
Problem and available data
          |
          v
What feedback is available?
          |
          +---- Known target for each example
          |             |
          |             v
          |       Supervised learning
          |
          +---- No predefined target for the task
          |             |
          |             v
          |       Unsupervised learning
          |
          +---- Labels for only some examples
          |             |
          |             v
          |       Semi-supervised learning
          |
          +---- Training signal created from the data
          |             |
          |             v
          |       Self-supervised learning
          |
          +---- Rewards from actions and outcomes
                        |
                        v
                Reinforcement learning
```

This diagram is a useful starting point, but real systems can combine learning approaches. The categories describe broad training setups, not mutually exclusive boxes that every system must fit into exactly one at a time.

## 6. Core Concepts

### 6.1 Supervised learning

**Supervised learning** uses training examples that include both inputs and known target values.

A training example can be represented as:

\[
(x_i, y_i)
\]

where:

- \(x_i\) represents the input for example \(i\).
- \(y_i\) represents the known target for that example.

The model learns a relationship between inputs and targets so that it can produce useful predictions for new examples.

For example, a support-ticket classifier may receive a ticket's text and a known category:

| Input | Known target |
|---|---|
| "I was charged twice this month" | Billing |
| "The application crashes when I sign in" | Technical |
| "I cannot reset my password" | Account access |

The model learns from the relationship between the ticket information and the assigned category.

Supervised learning commonly supports:

- **Classification:** predicting a category.
- **Regression:** predicting a numerical value.

The labels must be sufficiently accurate and consistent for the learning task. If historical labels are systematically wrong, the model may learn those errors rather than the intended behavior.

#### When it is useful

Supervised learning is a strong candidate when:

- The desired output can be defined clearly.
- Representative examples can be labeled.
- Historical outcomes are available or can be collected.
- The task requires predictions for future or unseen examples.

#### Limitations

- Label collection can be expensive.
- Labels may be inconsistent or biased.
- Rare outcomes may be poorly represented.
- Historical examples may not represent future conditions.
- The model can learn misleading patterns if the input data contains leakage.

Supervised learning does not automatically guarantee correct predictions. It provides a learning setup in which examples can be compared with known targets.

### 6.2 Unsupervised learning

**Unsupervised learning** works with data that has no predefined target labels for the task being performed.

Instead of learning to reproduce supplied answers, the system looks for structure, patterns, or relationships in the observations.

For example, a business may have customer records containing:

- Purchase frequency
- Average transaction amount
- Product preferences
- Recent activity

The business may not know the correct customer segments in advance. An unsupervised method can help identify groups of customers with similar observed behavior.

Typical applications include:

- Clustering similar examples
- Exploring patterns in datasets
- Identifying unusual observations
- Discovering structure that can support further analysis

#### What does "learning without labels" mean?

It does not mean learning without any objective or assumptions.

An unsupervised method still uses a mathematical procedure, representation, or criterion to determine what structure to identify. The resulting patterns depend on the data and the method's assumptions.

For example, a clustering method may group customers according to a chosen notion of similarity. A different representation or similarity measure may produce different groups.

The existence of clusters does not prove that those groups correspond to meaningful business categories.

#### When it is useful

Unsupervised learning can be useful when:

- Labels are unavailable or expensive to obtain.
- The goal is exploratory analysis.
- The organization wants to discover patterns not defined in advance.
- The results can be interpreted and validated for the intended use.

#### Limitations

- Discovered patterns may not be useful.
- Results can be sensitive to data representation and modeling assumptions.
- There may be no single obvious definition of a correct result.
- Human interpretation or downstream validation may be necessary.

Unsupervised learning is not simply supervised learning with missing labels. The objective itself is often different.

### 6.3 Semi-supervised learning

**Semi-supervised learning** combines a relatively small labeled dataset with a larger amount of unlabeled data.

This approach is useful when collecting labels is expensive but collecting raw observations is comparatively easy.

Consider an organization that receives one million support tickets. Only 10,000 have been reviewed and assigned reliable categories.

A purely supervised approach may train using the labeled subset. A semi-supervised approach may also use information from the unlabeled tickets, depending on the method and its assumptions.

Conceptually:

```text
Labeled examples
  (input, known target)
          \
           \
            +----> Learning process
           /              |
          /               v
Unlabeled examples    Trained model
  (input only)
```

The labeled examples provide direct target information. The unlabeled examples may provide additional information about the data's structure or distribution.

#### Why can unlabeled data help?

Unlabeled data may reveal patterns in the population that are not visible in a small labeled subset. Some semi-supervised methods use those patterns to improve learning.

However, unlabeled data is not automatically beneficial. Its usefulness depends on whether the assumptions used by the method are appropriate for the task and the actual data.

For example, if the unlabeled data comes from a different population, adding it can make performance worse rather than better.

#### When it is useful

Consider semi-supervised learning when:

- A limited number of examples have reliable labels.
- A larger pool of relevant unlabeled examples exists.
- Labeling is expensive or requires specialist review.
- The method's assumptions about labeled and unlabeled data are reasonable.

#### Limitations

- Incorrect assumptions can reduce performance.
- The unlabeled dataset may differ from the target population.
- Label quality still matters.
- The added complexity may not justify the benefit.

Semi-supervised learning should be evaluated against a credible supervised baseline to establish whether the additional data actually helps.

### 6.4 Self-supervised learning

**Self-supervised learning** constructs a training signal from the data itself, rather than requiring a human to provide a separate target label for every training example.

The data supplies the information from which a learning task can be created.

For example, a system processing text could hide part of a sentence and train a model to predict the missing portion. The original text supplies the information needed to construct the training target.

A simplified illustration:

```text
Original text:
"The service returned an unexpected error."

Constructed training example:
Input:  "The service returned an unexpected [MASK]."
Target: "error"
```

The target is derived from the original data rather than manually assigned by an annotator.

Other self-supervised approaches can construct learning signals from different parts, views, or relationships within observations.

#### Why does this matter?

Many real-world datasets contain large amounts of raw data but relatively few human-created labels.

Self-supervised learning provides a way to learn useful patterns from raw data by designing a task that the data itself can supervise.

The resulting model may later be adapted to another task using labeled examples or another training method.

#### Important distinction

Self-supervised learning is often discussed alongside unsupervised learning because it does not require manually supplied labels for every training example. However, the terms describe different aspects of the setup:

- Unsupervised learning generally focuses on discovering structure without predefined target labels.
- Self-supervised learning explicitly constructs a training signal from the data.

The terminology can vary across research and engineering contexts. For this curriculum, the important distinction is whether the learning objective uses a target constructed from the data itself.

#### When it is useful

Self-supervised learning can be useful when:

- Large quantities of raw data are available.
- Human labeling is limited or expensive.
- The data contains relationships that can support a constructed training task.
- Learning general patterns from the data can support later tasks.

#### Limitations

- The constructed task may not teach the information needed downstream.
- Large-scale training may require substantial compute and data infrastructure.
- Learned patterns can reflect biases or limitations in the source data.
- Success on the constructed objective does not guarantee success on a downstream task.

This chapter introduces the learning principle only. The detailed architectures and training mechanics used in deep learning and transformer systems belong to later AIF pillars.

See [AIF-04 — Deep Learning Foundations](../AIF-04-Deep-Learning-Foundations/README.md) and [AIF-07 — Transformer Foundations](../AIF-07-Transformer-Foundations/README.md) for the planned deeper treatment.

### 6.5 Reinforcement learning

**Reinforcement learning (RL)** studies how an agent can learn to choose actions through interaction with an environment.

Instead of receiving a correct target label for every input, the agent receives feedback in the form of rewards or other signals associated with outcomes.

A simplified interaction loop is:

```text
        +--------------------+
        |     Environment    |
        +--------------------+
             |         ^
      state  |         | action
             v         |
        +--------------------+
        |        Agent       |
        +--------------------+
             |
             v
      Action selection
             |
             v
     Environment response
             |
             v
          Reward
             |
             +----> informs future behavior
```

The agent's objective is generally to learn a policy: a strategy for choosing actions based on the information available to it.

The challenge is that an action can have consequences beyond its immediate reward. An action that looks beneficial now may lead to worse outcomes later.

For example, a simulated warehouse robot might receive rewards for completing deliveries and penalties for collisions or wasted movement. It must learn behavior that performs well over repeated interactions.

#### How is RL different from supervised learning?

In supervised learning, training examples provide known target answers for the task.

In reinforcement learning, the agent receives feedback from interaction. The reward may not directly tell the agent which action was best in every situation, and the consequences of an action may appear later.

This introduces additional challenges:

- Choosing actions to gain information versus using actions that already work
- Assigning credit to earlier actions that contributed to later outcomes
- Balancing immediate and long-term rewards
- Learning safely and efficiently from interactions

#### When it is useful

Reinforcement learning may be appropriate when:

- The problem involves sequential decisions.
- Actions influence future states or outcomes.
- A meaningful reward signal can be defined.
- An environment or interaction process can provide useful feedback.
- The learning and evaluation process can be carried out within acceptable risk constraints.

#### Limitations

- Designing a reward signal that reflects the real objective can be difficult.
- Training may require many interactions.
- Exploration can be costly or unsafe in real environments.
- Performance in a simulated environment may not transfer to the real world.
- A high reward under a simplified objective does not necessarily imply that the agent behaves as intended.

RL is not simply supervised learning with a different label. It introduces a different feedback structure and a different decision-making problem.

This chapter covers the introductory learning setup, not a complete reinforcement-learning curriculum.

## 7. Compare the Learning Paradigms

The most useful comparison is based on the learning signal, objective, and assumptions—not merely the names of the methods.

| Paradigm | Primary learning signal | Typical objective | Example |
|---|---|---|---|
| Supervised | Known target for each labeled example | Learn to predict targets | Classify support tickets |
| Unsupervised | Structure within observations | Discover patterns or groups | Explore customer segments |
| Semi-supervised | Labeled and unlabeled examples | Use both sources to improve learning | Classify tickets with limited labels |
| Self-supervised | Target constructed from the data | Learn from relationships within raw data | Predict a hidden part of text |
| Reinforcement | Rewards and consequences of actions | Learn a policy for sequential decisions | Learn behavior in a simulated environment |

These paradigms can overlap in a larger system. For example, a system might first learn from raw data using a self-supervised objective and then use supervised learning for a specific prediction task.

The right question is therefore not always, "Which single paradigm describes the entire system?"

It may be, "Which learning setup is appropriate for each stage, given the data, objective, and constraints?"

## 8. How to Choose a Learning Paradigm

A practical selection process begins with the problem, not with the available algorithm library.

### Step 1: Define the desired outcome

Return to the problem formulation from Chapter 01.

Clarify whether the goal is to predict a known outcome, discover patterns, learn from raw data, or make decisions through interaction.

An ambiguous objective leads to an ambiguous choice of learning setup.

### Step 2: Identify the available feedback

Ask what information is available during learning:

- Are reliable target labels available for representative examples?
- Is there a large pool of unlabeled data?
- Can a useful training signal be constructed from the data?
- Does the system interact with an environment and receive rewards?
- Are several types of feedback available at different stages?

The feedback structure often eliminates unsuitable approaches early.

### Step 3: Evaluate data and labeling constraints

Consider:

- How much data is available?
- How much of it is labeled?
- How reliable are the labels?
- How expensive is additional labeling?
- Does the data represent the population in which the system will be used?

Do not assume that a larger dataset is automatically better. Data relevance and signal quality matter.

### Step 4: Check the assumptions

Each learning setup relies on assumptions.

For example:

- Supervised learning assumes the training targets are meaningful for the desired task.
- Unsupervised learning assumes the discovered structure can be useful for the intended purpose.
- Semi-supervised learning depends on how labeled and unlabeled data relate.
- Self-supervised learning depends on whether the constructed objective teaches useful patterns.
- Reinforcement learning depends on the relationship between the reward signal and the actual objective.

An approach that is theoretically suitable may fail when these assumptions do not hold.

### Step 5: Compare with simpler alternatives

Before committing to a complex learning setup, ask whether a simpler method could meet the requirements.

Possible alternatives include:

- Explicit business rules
- A supervised baseline
- Manual analysis
- Better data collection
- A narrower task definition

The goal is not to use the most sophisticated learning paradigm. It is to solve the defined problem with sufficient reliability and reasonable cost.

### Step 6: Define how usefulness will be verified

Determine what evidence would justify the approach.

The evaluation procedure depends on the task, the data, and the consequences of errors. Later chapters cover generalization, evaluation protocols, and metrics in detail.

At this stage, the key requirement is to make the intended outcome and the evidence of usefulness explicit before investing heavily in implementation.

## 9. Worked Engineering Example

### Scenario: Support-ticket classification

A company receives 500,000 support tickets per year. Each ticket contains text and metadata. The company wants to route tickets to the correct team.

The existing data has:

- 20,000 tickets with reviewed categories
- 300,000 tickets without reviewed categories
- A smaller set of tickets with unreliable historical categories

The objective is to assign incoming tickets to a predefined team category.

### 9.1 Identify the problem

The output category is known in advance, so the task is a classification problem.

The team must define the target categories and establish when the prediction will be made. It must also ensure that the input fields are available when a new ticket arrives.

### 9.2 Examine the learning signal

The 20,000 reviewed tickets provide labeled examples. They support a supervised-learning baseline.

The 300,000 unlabeled tickets may provide additional information, but their existence does not prove that using them will improve classification.

The unreliable historical labels should not be treated as ground truth without further investigation.

### 9.3 Compare possible approaches

**Approach A: Supervised learning**

Train using the reviewed tickets.

Advantages:

- Clear relationship between inputs and targets
- Relatively straightforward baseline
- Direct alignment with the classification objective

Risks:

- The labeled subset may not represent all ticket types.
- Rare categories may be underrepresented.
- Labeling quality may limit performance.

**Approach B: Semi-supervised learning**

Investigate whether the unlabeled tickets can improve the model alongside the reviewed examples.

Potential benefit:

- Additional information about the distribution of incoming tickets

Risks:

- The unlabeled tickets may differ from the labeled subset.
- The assumptions required by the method may not hold.
- Additional complexity may not yield meaningful improvement.

**Approach C: Self-supervised learning**

If the team has substantial relevant raw text and the resources to support it, it could investigate learning patterns from the text before adapting the resulting model to ticket classification.

Potential benefit:

- Learning from raw text without requiring a human label for every example

Risks:

- More training complexity and compute
- A constructed objective that may not align closely with ticket routing
- No guarantee of better downstream results

### 9.4 Make an engineering decision

A reasonable starting strategy is to establish a supervised baseline using the reviewed tickets. The team can then evaluate whether semi-supervised or self-supervised methods justify their additional complexity.

This is a starting decision, not a universal rule. The best approach depends on the quality and representativeness of the data, available resources, operational constraints, and measured results.

### 9.5 What would change the decision?

The team might reconsider its approach if:

- Most reviewed labels are unreliable.
- The labeled examples cover only a small fraction of incoming ticket types.
- The unlabeled data contains a substantially different population.
- The baseline is already adequate for the operational need.
- A more expensive learning setup offers no meaningful improvement.

The important skill is not memorizing that a certain paradigm is best for a certain dataset size. It is reasoning from the objective, learning signal, assumptions, and evidence.

## 10. Production Perspective

Choosing a learning paradigm is an engineering decision with consequences beyond model training.

### 10.1 Data pipelines

Different paradigms require different data preparation.

A supervised pipeline must preserve reliable input-target relationships. A semi-supervised pipeline must distinguish labeled from unlabeled examples. A self-supervised pipeline must construct training signals consistently. A reinforcement-learning pipeline must capture interactions, actions, rewards, and resulting states.

These requirements affect data collection, validation, storage, and reproducibility.

### 10.2 Feedback quality

The learning signal can become a source of systematic error.

Examples include:

- Human labels that encode inconsistent decisions
- Unlabeled data from an irrelevant population
- A self-supervised objective that emphasizes unhelpful patterns
- A reward function that encourages behavior different from the intended outcome

A learning pipeline can execute exactly as designed while optimizing the wrong signal.

### 10.3 Operational risk

Some paradigms require more experimentation or interaction than others.

Reinforcement learning, for example, may require a controlled simulator or safety constraints because exploration in a real environment can be expensive or harmful.

Semi-supervised and self-supervised approaches may require additional data processing and training infrastructure.

The production choice should account for total cost, data availability, failure consequences, and the ability to validate the resulting system.

### 10.4 Reproducibility and traceability

Teams should be able to explain:

- Which data supplied the learning signal
- How labels or constructed targets were created
- Which assumptions guided the learning setup
- How training data was selected
- How the approach was evaluated
- Why the chosen method was considered suitable

These records help engineers investigate performance changes and understand whether a model remains appropriate as data and operating conditions change.

Detailed deployment, monitoring, and operational reliability belong to the relevant PROD and ENT documentation rather than this chapter.

## 11. Engineering Decisions and Trade-offs

No learning paradigm is universally superior.

| Engineering condition | What to investigate | Important trade-off |
|---|---|---|
| Reliable labels are available | Supervised learning | Labeling effort versus direct target feedback |
| Labels are scarce but raw data is abundant | Semi-supervised or self-supervised learning | Potential data benefit versus added complexity |
| The goal is to discover unknown structure | Unsupervised learning | Discovery value versus interpretation difficulty |
| The problem requires sequential decisions | Reinforcement learning | Long-term learning potential versus interaction and safety costs |
| The objective can be solved with explicit rules | A simpler non-ML approach | Simplicity and predictability versus flexibility |

These are starting points for investigation, not automatic recommendations.

A strong engineering decision should answer four questions:

1. Why does this learning signal fit the objective?
2. What assumptions must hold?
3. How will the approach be compared with a credible alternative?
4. What evidence would cause us to reject the approach?

The fourth question is particularly important. Engineers should define conditions that would change their decision rather than defending the first approach they choose.

## 12. Common Mistakes

### Mistake 1: Treating unlabeled data as useless

Unlabeled data cannot directly provide a human-defined target for a standard supervised task, but it may still contain useful structure.

**Correction:** Evaluate whether the data can support an appropriate unsupervised, semi-supervised, or self-supervised approach.

### Mistake 2: Assuming more data always improves the model

More data can be irrelevant, noisy, biased, or drawn from a different population.

**Correction:** Assess data quality, relevance, and the assumptions required by the chosen learning method.

### Mistake 3: Confusing self-supervised and semi-supervised learning

Both can reduce dependence on human labels, but they use different sources of supervision.

**Correction:** Semi-supervised learning combines labeled and unlabeled examples. Self-supervised learning constructs training signals from the data itself.

### Mistake 4: Assuming unsupervised groups are meaningful categories

An algorithm can produce clusters even when the resulting groups have little operational value.

**Correction:** Validate the groups against the intended use and avoid treating algorithm-generated structure as unquestionable ground truth.

### Mistake 5: Treating reinforcement learning as ordinary prediction

Reinforcement learning involves actions, feedback, and consequences that can extend across time.

**Correction:** Determine whether the problem genuinely requires sequential decision-making and whether a meaningful reward signal can be defined.

### Mistake 6: Choosing a paradigm because it is popular

A sophisticated learning approach can introduce unnecessary cost and failure modes.

**Correction:** Start with the objective and available feedback. Establish a credible baseline and require evidence before adding complexity.

### Mistake 7: Assuming a good training signal guarantees a useful system

A model can optimize its training objective without achieving the intended real-world outcome.

**Correction:** Check whether the learning objective aligns with the downstream task, and evaluate the resulting system against the actual requirements.

## 13. Interview Questions with Expected Answers

### Question 1: What is a learning paradigm?

**Expected answer:** A learning paradigm describes the broad setup through which a model or learning system receives information that guides learning. It reflects the available learning signal and the objective, such as known targets, discovered structure, constructed training targets, or rewards from interaction.

### Question 2: How do supervised and unsupervised learning differ?

**Expected answer:** Supervised learning uses examples paired with known target values. Unsupervised learning does not require predefined target labels for the task and instead aims to discover patterns or structure in the data. The distinction concerns the learning setup and objective, not whether the dataset contains any metadata at all.

### Question 3: Why might semi-supervised learning be useful?

**Expected answer:** It can use a limited labeled dataset together with a larger pool of unlabeled data when labeling is expensive. It is useful only when the method's assumptions are appropriate and the unlabeled data provides helpful information.

### Question 4: How is self-supervised learning different from supervised learning?

**Expected answer:** In self-supervised learning, the training signal is constructed from the data itself. Standard supervised learning uses target labels supplied for the task. A self-supervised system can later be adapted to a supervised task, so the approaches can be used in different stages of the same system.

### Question 5: Why is reinforcement learning different from supervised learning?

**Expected answer:** Supervised learning receives known targets for training examples. Reinforcement learning receives feedback from actions and their consequences, often over time. The agent must learn a policy that accounts for the effects of decisions, including delayed rewards.

### Question 6: If a company has millions of unlabeled examples, should it automatically use self-supervised learning?

**Expected answer:** No. The team should first establish the objective, examine the data, determine whether the data supports a useful constructed training signal, and compare the potential benefit with simpler alternatives. Large data volume alone does not justify the added complexity.

### Question 7: Can a system use more than one learning paradigm?

**Expected answer:** Yes. A system can use one learning approach to learn general patterns and another to adapt to a specific task. The choice depends on the stages of the system, the available signals, and the requirements at each stage.

## 14. Quick Revision

- A **learning paradigm** describes the broad learning setup and source of feedback.
- **Supervised learning** uses known targets paired with training examples.
- **Unsupervised learning** discovers patterns or structure without predefined target labels for the task.
- **Semi-supervised learning** combines labeled and unlabeled data.
- **Self-supervised learning** constructs training signals from the data itself.
- **Reinforcement learning** learns behavior through actions and feedback from an environment.
- Different paradigms rely on different assumptions and have different data, infrastructure, and evaluation requirements.
- More data or a more sophisticated method does not guarantee better results.
- A paradigm should be selected based on the objective, available learning signal, assumptions, constraints, and evidence.
- Multiple paradigms can be combined across stages of a larger ML system.

## 15. Key Takeaways

1. Start with the problem, not the algorithm.
2. Identify the learning signal before choosing the training approach.
3. Distinguish known targets from structure discovered in data, targets constructed from data, and rewards received through interaction.
4. Treat the assumptions of each paradigm as engineering questions that must be investigated.
5. Compare more complex learning approaches with credible baselines.
6. Do not confuse successful optimization of a training objective with successful resolution of the real-world problem.

## 16. Further Reading

Use authoritative documentation and research material to deepen understanding after completing the conceptual foundation:

- [scikit-learn User Guide](https://scikit-learn.org/stable/user_guide.html) — foundational material on supervised and unsupervised learning and related model workflows.
- [Google Machine Learning Crash Course](https://developers.google.com/machine-learning/crash-course) — practical introductions to machine-learning concepts.
- [Sutton and Barto, *Reinforcement Learning: An Introduction*](http://incompleteideas.net/book/the-book-2nd.html) — a foundational reference for reinforcement learning.

These references extend the chapter's concepts. They do not change what AIF-03 teaches.

## 17. Practice Assignment

Choose one of the following scenarios:

- A support team wants to categorize incoming tickets.
- A retailer wants to discover customer behavior segments.
- A company has a small labeled dataset and a much larger unlabeled dataset.
- A system must learn a sequence of actions in a simulated environment.

Write a short engineering recommendation that answers:

1. What is the intended outcome?
2. What learning signal is available?
3. Which learning paradigm would you investigate first?
4. What assumptions must hold for that approach to work?
5. What is the strongest alternative?
6. What evidence would cause you to choose the alternative instead?

Do not answer by naming a popular algorithm. Justify the learning setup using the problem conditions.

## 18. Teaching Check

Explain the five learning paradigms to another engineer without reading the comparison table.

Then explain why the same dataset can support different learning approaches depending on the task, the available feedback, and the intended outcome.

If you cannot explain where the learning signal comes from in each case, revisit Section 6 before proceeding.

**Engineering principle:** Choose a learning paradigm by understanding the problem and its available feedback—not by assuming that one approach is universally best.
