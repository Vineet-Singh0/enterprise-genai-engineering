# AIF-04 — Deep Learning Foundations

## Overview

Deep Learning Foundations explains how neural networks represent computations, transform inputs into predictions, calculate errors, and learn by updating their parameters.

This topic builds the conceptual foundation needed to understand modern deep learning architectures, including sequence models and transformers. The focus is not on memorizing neural-network terminology or using a particular framework. It is on understanding the mechanisms behind neural-network computation and training.

By the end of this topic, you should be able to reason about how a neural network works, explain how its parameters are learned, and diagnose common training failures.

## Learning Objectives

After completing this topic, you should be able to:

- Explain artificial neurons, perceptrons, weights, biases, and decision boundaries.
- Understand how multilayer neural networks compose learned transformations.
- Trace forward propagation through a small neural network.
- Explain the purpose and behaviour of activation and loss functions.
- Describe backpropagation, gradient flow, and the chain rule in neural networks.
- Explain how optimization algorithms update model parameters.
- Interpret common training behaviours, including convergence and unstable optimization.
- Distinguish underfitting, overfitting, and optimization-related failures.
- Select and justify appropriate training interventions based on observed evidence.
- Connect deep-learning foundations to representation learning, sequence modeling, and transformer architectures.

## Prerequisites

The following topics provide the recommended foundation for AIF-04.

| Topic | Relevant knowledge |
|---|---|
| [AIF-01 — Mathematics Foundation](../AIF-01-Mathematics-Foundation/README.md) | Functions, vectors, matrices, derivatives, gradients, chain-rule intuition, and optimization fundamentals |
| [AIF-02 — AI Fundamentals](../AIF-02-AI-Fundamentals/README.md) | General AI concepts and the AI problem-solving lifecycle |
| [AIF-03 — Machine Learning Foundations](../AIF-03-Machine-Learning-Foundations/README.md) | Problem formulation, learning paradigms, data preparation, generalization, and model evaluation |

You do not need to master every mathematical derivation before beginning. However, you should be comfortable with basic functions and vectors. Derivatives and the chain rule become particularly important when studying backpropagation.

## Position Within the AIF Curriculum

AIF-04 is the fourth pillar of the seven-pillar AI Foundations curriculum.

| Pillar | Primary focus |
|---|---|
| [AIF-01 — Mathematics Foundation](../AIF-01-Mathematics-Foundation/README.md) | Mathematical foundations for AI |
| [AIF-02 — AI Fundamentals](../AIF-02-AI-Fundamentals/README.md) | AI approaches, reasoning, and problem formulation |
| [AIF-03 — Machine Learning Foundations](../AIF-03-Machine-Learning-Foundations/README.md) | Learning paradigms, data, generalization, and evaluation |
| **AIF-04 — Deep Learning Foundations** | Neural networks, forward propagation, gradients, and training dynamics |
| AIF-05 — Representation Learning | Learned representations, embeddings, and representation spaces |
| AIF-06 — Sequence Modeling | Sequential data, recurrent neural networks, and LSTMs |
| AIF-07 — Transformer Foundations | Attention mechanisms and transformer architecture |

The pillar order defines the intended learning progression. It does not imply that every preceding pillar is a strict prerequisite for every subsequent pillar.

## Learning Path

Complete the following chapters in the recommended order.

### Chapter 01 — Neural Network Intuition and Perceptrons

**Difficulty:** 2 — Foundational

**Estimated reading time:** 25–35 minutes

Introduces artificial neurons and perceptrons as computational units. Establishes the role of inputs, weights, biases, and outputs while explaining the representational limitations of a single perceptron.

[Read Chapter 01](01-Neural-Network-Intuition-and-Perceptrons.md)

### Chapter 02 — Multilayer Networks and Forward Propagation

**Difficulty:** 3 — Intermediate

**Estimated reading time:** 35–45 minutes

Explains how neurons are organized into layers, how transformations are composed, and how information moves through a network to produce predictions.

[Read Chapter 02](02-Multilayer-Networks-and-Forward-Propagation.md)

### Chapter 03 — Activation and Loss Functions

**Difficulty:** 3 — Intermediate

**Estimated reading time:** 35–45 minutes

Explains why nonlinear activation functions are needed, how output activations relate to prediction tasks, and how loss functions quantify prediction errors.

[Read Chapter 03](03-Activation-and-Loss-Functions.md)

### Chapter 04 — Backpropagation and Gradient Flow

**Difficulty:** 4 — Advanced conceptual reasoning

**Estimated reading time:** 45–60 minutes

Explains how gradients are propagated backward through a network, how the chain rule connects individual computations, and why vanishing or exploding gradients can prevent effective learning.

[Read Chapter 04](04-Backpropagation-and-Gradient-Flow.md)

### Chapter 05 — Optimization and Training Dynamics

**Difficulty:** 4 — Advanced conceptual reasoning

**Estimated reading time:** 40–55 minutes

Explains how gradients are used to update parameters, how optimization algorithms influence learning, and how to interpret convergence and unstable training behaviour.

[Read Chapter 05](05-Optimization-and-Training-Dynamics.md)

### Chapter 06 — Regularization, Hyperparameters and Failure Modes

**Difficulty:** 3 — Intermediate

**Estimated reading time:** 35–50 minutes

Explores neural-network regularization, hyperparameter selection, and systematic diagnosis of common training failures, including overfitting, underfitting, and data-quality problems.

[Read Chapter 06](06-Regularization-Hyperparameters-and-Failure-Modes.md)

## Suggested Learning Sessions

The following schedule provides time to understand the concepts and practise explaining them.

| Session | Focus | Suggested activity |
|---|---|---|
| 1 | Chapter 01 | Calculate perceptron outputs and explain linear decision boundaries |
| 2 | Chapter 02 | Trace forward propagation through a small network |
| 3 | Chapter 03 | Compare activation functions and their behaviour |
| 4 | Chapter 03 | Compare loss functions for regression and classification |
| 5 | Chapter 04 | Trace gradients through a computational graph |
| 6 | Chapter 05 | Explain parameter updates and diagnose optimization behaviour |
| 7 | Chapter 06 | Compare regularization techniques and hyperparameter decisions |
| 8 | Chapter 06 | Diagnose a failing training scenario and justify corrective actions |

**Estimated reading time:** Approximately 3 hours 40 minutes to 5 hours.

**Estimated guided study time:** Approximately 7 hours 15 minutes to 10 hours 15 minutes, including worked examples and reasoning exercises.

These estimates are planning aids. Your actual study time will depend on your mathematical familiarity and the amount of practice required.

## Concept Boundaries

AIF-04 focuses on the internal mechanisms of neural networks and their training. Related topics retain their primary ownership in their respective pillars.

| Related topic | Boundary |
|---|---|
| AIF-01 — Mathematics Foundation | Provides the mathematical tools used here. AIF-04 applies these tools without reproducing the full mathematics curriculum. |
| AIF-03 — Machine Learning Foundations | Owns generalization, evaluation protocols, cross-validation, and model selection. AIF-04 uses these concepts when discussing training behaviour. |
| AIF-05 — Representation Learning | Owns the deeper treatment of learned representations, embedding geometry, and similarity. |
| AIF-06 — Sequence Modeling | Owns sequential data, recurrent neural networks, and LSTMs. |
| AIF-07 — Transformer Foundations | Owns attention, transformer architecture, and transformer-specific training and inference foundations. |
| PROD — Production AI Engineering | Owns production serving, deployment, monitoring, and operational reliability. |

AIF-04 establishes the general neural-network foundations needed for later topics without teaching their internal architectures or implementation workflows in depth.

## Completion Criteria

Consider this topic complete when you can demonstrate the following abilities without relying only on memorized definitions.

- [ ] Explain how an artificial neuron calculates an output.
- [ ] Explain why multilayer networks can represent more complex relationships than a single perceptron.
- [ ] Trace forward propagation through a small network using consistent tensor shapes.
- [ ] Justify activation and loss function choices for common prediction tasks.
- [ ] Explain backpropagation and the relationship between gradients and parameter updates.
- [ ] Describe how learning rate, initialization, and optimization algorithms affect training.
- [ ] Distinguish optimization failures from generalization problems.
- [ ] Diagnose common training failures and justify possible corrective actions.
- [ ] Explain the complete training process to another engineer using a numerical example or diagram.

Reading every chapter is necessary for coverage, but it is not sufficient evidence of mastery. The goal is to explain, reason, and diagnose.

## Recommended Next Steps

After completing AIF-04:

1. Continue to [AIF-05 — Representation Learning](../AIF-05-Representation-Learning/README.md) to study learned representations and embeddings.
2. Study [AIF-06 — Sequence Modeling](../AIF-06-Sequence-Modeling/README.md) to understand recurrent architectures and sequential computation.
3. Continue to [AIF-07 — Transformer Foundations](../AIF-07-Transformer-Foundations/README.md) to study attention and transformer architecture.

Continue through those modules after finishing AIF-04.
