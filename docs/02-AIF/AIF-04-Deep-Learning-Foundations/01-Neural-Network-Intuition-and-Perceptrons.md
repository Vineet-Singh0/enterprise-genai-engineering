# 01 — Neural Network Intuition and Perceptrons

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain why neural networks are useful and what kinds of problems they solve.
- Distinguish biological inspiration from the actual computational behavior of artificial neurons.
- Explain the roles of inputs, weights, bias, weighted sum, and output.
- Calculate the output of a simple artificial neuron.
- Explain how a perceptron makes a binary classification decision.
- Understand why a single perceptron can represent only a linear decision boundary.
- Identify problems that cannot be solved by a single perceptron and explain why multilayer networks are needed.

## Prerequisites

- Basic algebra and functions.
- Vectors and dot products.
- The distinction between features, labels, and model parameters.
- Basic understanding of supervised learning.

Recommended references:

- [AIF-01 — Mathematics Foundation](../AIF-01-Mathematics-Foundation/README.md)
- [AIF-03 — Machine Learning Foundations](../AIF-03-Machine-Learning-Foundations/README.md)

**Estimated reading time:** 25–35 minutes

---

## 1. Why Neural Networks Exist

Machine learning models learn patterns from data. However, different models have different ways of representing those patterns.

Consider a system that predicts whether an email is spam.

A simple model might use manually selected features:

- Number of suspicious words.
- Number of links.
- Presence of certain phrases.
- Sender reputation.

A linear model can combine these features to make a prediction. This works well when the relationship between the features and the target can be represented adequately by a relatively simple decision function.

But consider more complex tasks:

- Recognizing a face from an image.
- Understanding whether two sentences express similar meanings.
- Identifying objects under different lighting conditions.
- Learning patterns in speech, text, and other high-dimensional data.

In these problems, useful patterns may depend on combinations of features rather than on individual features alone.

Neural networks provide a flexible way to learn such combinations by composing multiple parameterized transformations.

### 1.1 The central idea

A neural network learns a function that maps an input to an output.

\[
\hat{y}=f_{\theta}(x)
\]

Where:

- \(x\) is the input.
- \(f_{\theta}\) is the model.
- \(\theta\) represents the model's learnable parameters.
- \(\hat{y}\) is the prediction.

For example:

\[
\text{Image}\rightarrow\text{Neural Network}
\rightarrow\text{Class Probabilities}
\]

The network does not need a developer to manually specify every useful combination of pixels. Instead, training adjusts its parameters so that its predictions better match the training targets.

This does not mean neural networks automatically discover meaningful patterns in every dataset. Their success depends on the data, architecture, optimization process, and training setup.

### 1.2 Why not use only a single linear model?

A linear model can learn useful relationships, but its decision boundary has a structural limitation: it is linear in the input features.

A neural network can overcome this limitation by composing multiple transformations and introducing nonlinear operations.

Before understanding multilayer networks, we need to understand their basic computational building block: the artificial neuron.

---

## 2. Biological Inspiration Versus Artificial Computation

Biological neurons are cells in nervous systems. They receive signals, process them through complex electrochemical mechanisms, and influence other neurons.

Artificial neural networks borrow the broad idea of connected units whose behavior depends on incoming signals. They are not literal simulations of biological neurons.

| Biological concept | Artificial-network analogy |
|---|---|
| Incoming signals | Input values |
| Synaptic influence | Learnable weights |
| Combined neural input | Weighted sum |
| Neuron activation | Activation function |
| Signal passed onward | Output value |

These are useful analogies, not exact biological equivalences.

An artificial neuron is a mathematical computation. It does not reproduce the full biology of a real neuron, including its temporal dynamics, biochemical processes, and complex interactions.

**Engineering takeaway:** Understand neural networks through their mathematical operations, not through the assumption that artificial neurons behave exactly like biological ones.

---

## 3. The Artificial Neuron

An artificial neuron receives one or more input values, assigns each input a weight, adds a bias, and computes an output.

Its basic computation is:

\[
z=\sum_{i=1}^{n}w_i x_i+b
\]

\[
a=g(z)
\]

Where:

- \(x_i\): the \(i\)-th input feature.
- \(w_i\): the weight associated with that feature.
- \(b\): the bias.
- \(z\): the weighted sum before activation.
- \(g\): an activation function.
- \(a\): the neuron's output after activation.
- \(n\): the number of input features.

The weighted sum is also called the **pre-activation value**.

### 3.1 Visualizing the computation

```text
Input x₁ ──× w₁──┐
                  │
Input x₂ ──× w₂──┼──> Sum + Bias ──> Activation ──> Output
                  │
Input x₃ ──× w₃──┘
```

Each input contributes according to its weight. The bias shifts the combined value, and the activation function determines how that value is transformed into the output.

### 3.2 Inputs: what the neuron receives

Inputs represent the numerical information provided to the model.

For a simple loan-risk model, inputs might include:

\[
x=
\begin{bmatrix}
\text{Income}\\
\text{Debt Ratio}\\
\text{Credit History Score}
\end{bmatrix}
\]

Real systems generally require preprocessing and appropriate feature scaling. The values above are illustrative; raw income and a credit score, for example, may have very different numerical ranges.

A neuron does not inherently understand what an input means. It processes numerical values according to its learned parameters.

### 3.3 Weights: how inputs influence the computation

Each input has an associated weight.

A weight determines how strongly and in which direction an input contributes to the weighted sum.

For the expression

\[
z=w_1x_1+w_2x_2+b
\]

- A positive weight makes an increase in its input increase \(z\), all else being equal.
- A negative weight makes an increase in its input decrease \(z\).
- A zero weight removes that input's direct contribution to this computation.

The magnitude of a weight affects the contribution of its input, but interpretation depends on the input's scale and the rest of the model.

Weights are **learnable parameters**. Training adjusts them using data.

### 3.4 Bias: an adjustable offset

The bias is an additional learnable parameter:

\[
z=w_1x_1+w_2x_2+b
\]

Without a bias, the decision boundary of a linear classifier must pass through the origin of the input space. The bias allows the model to shift that boundary.

For example, the expression

\[
z=2x-4
\]

becomes zero at \(x=2\).

Without the bias term, \(z=2x\) would become zero only at \(x=0\).

The bias therefore gives the model more flexibility in positioning its decision boundary.

### 3.5 Weighted sum: combining the inputs

The weighted sum combines all input contributions into one scalar:

\[
z=\mathbf{w}^{T}\mathbf{x}+b
\]

Here, \(\mathbf{x}\) is the input vector and \(\mathbf{w}\) is the weight vector.

This is the vector form of the same computation. It is useful because the same operation can be implemented efficiently for many inputs using numerical libraries and hardware accelerators.

### 3.6 Activation: transforming the weighted sum

An activation function transforms the pre-activation value:

\[
a=g(z)
\]

The choice of activation affects what the neuron outputs. For example, a step function can convert the weighted sum into a binary decision.

Different activation functions have different properties and uses. Their detailed behavior, including ReLU, sigmoid, tanh, and softmax, is covered in [Chapter 03 — Activation and Loss Functions](03-Activation-and-Loss-Functions.md).

For now, focus on the distinction between the two stages:

1. Compute the weighted sum.
2. Transform it into the neuron's output.

---

## 4. A Worked Numerical Example

Suppose an artificial neuron receives two inputs:

\[
x_1=2,\qquad x_2=3
\]

Its weights and bias are:

\[
w_1=0.5,\qquad w_2=-1,\qquad b=1
\]

The weighted sum is:

\[
z=w_1x_1+w_2x_2+b
\]

Substituting the values:

\[
z=(0.5)(2)+(-1)(3)+1
\]

\[
z=1-3+1=-1
\]

The neuron's pre-activation value is therefore \(-1\).

If the neuron uses a step activation function defined as

\[
g(z)=
\begin{cases}
1 & z\geq 0\\
0 & z<0
\end{cases}
\]

then:

\[
a=g(-1)=0
\]

The neuron outputs zero because its weighted sum is negative.

### What did we learn?

- The inputs alone do not determine the output; the weights and bias matter.
- Negative weights can reduce the weighted sum.
- The activation function determines how the weighted sum becomes an output.
- Changing a weight or bias may change the output even when the input remains unchanged.

This is the basic computational pattern behind an artificial neuron.

---

## 5. From an Artificial Neuron to a Perceptron

A **perceptron** is a simple binary classification model based on a weighted sum and a threshold decision.

For inputs \(\mathbf{x}\), weights \(\mathbf{w}\), and bias \(b\), it computes:

\[
z=\mathbf{w}^{T}\mathbf{x}+b
\]

Its predicted class is:

\[
\hat{y}=
\begin{cases}
1 & \mathbf{w}^{T}\mathbf{x}+b\geq 0\\
0 & \mathbf{w}^{T}\mathbf{x}+b<0
\end{cases}
\]

The perceptron maps an input to one of two classes.

For example, a simple system might classify a transaction as either:

- Class 1: flag for review.
- Class 0: do not flag for review.

The perceptron produces a decision according to the weighted combination of its input features. Whether that decision is useful depends on how well the model's structure fits the underlying problem.

### 5.1 How a perceptron learns

In the classic perceptron learning rule, the model compares its prediction with the correct label and adjusts its parameters when it makes a mistake.

One common update form is:

\[
\mathbf{w}\leftarrow
\mathbf{w}+\eta(y-\hat{y})\mathbf{x}
\]

\[
b\leftarrow b+\eta(y-\hat{y})
\]

Where:

- \(y\) is the true label.
- \(\hat{y}\) is the predicted label.
- \(\eta\) is the learning rate.
- \(\mathbf{x}\) is the input vector.

When the prediction is correct, the error term \(y-\hat{y}\) is zero, so this update does not change the parameters. When the prediction is wrong, the parameters are adjusted.

This is the classic perceptron update rule, not the general training procedure used by modern multilayer neural networks. Modern networks typically use differentiable loss functions and gradient-based optimization, which will be introduced in later chapters.

### 5.2 An important limitation

The classic perceptron learning algorithm converges to a separating solution when the training data is linearly separable under its assumptions. It is not guaranteed to find a perfect classifier when the data is not linearly separable.

This limitation leads to the next question: what patterns can a single perceptron represent?

---

## 6. The Decision Boundary

The decision boundary is the set of inputs where the model is exactly at its classification threshold.

For a perceptron, the boundary is defined by:

\[
\mathbf{w}^{T}\mathbf{x}+b=0
\]

For two input features, this becomes:

\[
w_1x_1+w_2x_2+b=0
\]

If \(w_2\neq 0\), rearranging gives:

\[
x_2=-\frac{w_1}{w_2}x_1-\frac{b}{w_2}
\]

This equation describes a straight line in two dimensions.

In three dimensions, the boundary is a plane. In higher-dimensional input spaces, it is a hyperplane.

### 6.1 Visual intuition

Imagine plotting two features on a graph. Each example is a point, and each point belongs to one of two classes.

A perceptron attempts to place a straight line between the classes:

```text
Feature 2
   ^
   |
 1 |  ○  ○  ○   |   ×  ×
   |  ○  ○      |   ×  ×
   |  ○         |   ×  ×
   |             |
   +-------------|------------> Feature 1
                 |
          Decision boundary
```

The drawing is illustrative. A perceptron can classify the points correctly if an appropriate line separates the classes.

The learned weights determine the line's orientation, while the bias helps determine its position.

### 6.2 What does linear separability mean?

A dataset is linearly separable if a single linear decision boundary can divide its classes without classification errors on the dataset.

For example, if all positive examples lie on one side of a line and all negative examples lie on the other, a perceptron can represent that separation.

If the classes are arranged in a pattern that cannot be separated by a single line, a single perceptron cannot represent the required classification rule perfectly.

This is a limitation of the model's representational structure, not merely a problem of finding better weights.

---

## 7. The XOR Problem: Why One Perceptron Is Not Enough

The XOR (exclusive OR) function returns 1 when its two binary inputs differ and 0 when they are equal.

| \(x_1\) | \(x_2\) | XOR output |
|---:|---:|---:|
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |

The positive examples are \((0,1)\) and \((1,0)\). The negative examples are \((0,0)\) and \((1,1)\).

These points cannot be separated into their two classes by one straight line.

### Why changing the weights cannot solve it

A perceptron can change the orientation and position of its linear decision boundary. It cannot change the boundary into an arrangement of separate regions required by XOR.

No choice of weights and bias can make a single perceptron represent XOR perfectly over these four input combinations.

This illustrates a critical distinction:

- **Learning failure:** a suitable solution exists within the model, but training does not find it.
- **Representation limitation:** the model cannot express the required solution, regardless of how its parameters are chosen.

XOR demonstrates the second case.

### Why this matters

Adding more training data or running the same single-perceptron algorithm for longer does not remove this structural limitation.

To represent more complex decision regions, we need a model that combines multiple computations. Multilayer neural networks provide this capability by composing transformations, including nonlinear ones.

That is the subject of [Chapter 02 — Multilayer Networks and Forward Propagation](02-Multilayer-Networks-and-Forward-Propagation.md).

---

## 8. What a Single Perceptron Can and Cannot Do

| Capability | Single perceptron |
|---|---|
| Combine multiple input features | Yes |
| Learn weights and a bias | Yes |
| Produce a binary threshold decision | Yes |
| Represent a linear decision boundary | Yes |
| Perfectly represent every binary classification problem | No |
| Represent XOR over its four input combinations | No |
| Automatically learn multiple layers of intermediate features | No |

A perceptron remains useful as a foundational model because it makes the relationship between inputs, parameters, and decisions easy to inspect.

Its limitations also provide the motivation for more expressive architectures.

---

## 9. Parameters, Learning, and Representation

An important distinction in neural-network engineering is the difference between a model's **parameters** and its **structure**.

For a perceptron:

- Weights and bias are learnable parameters.
- The number of inputs and the form of the computation determine what the model can represent.
- The activation function determines how the computed value becomes an output.

Training changes the parameters. It does not automatically change the fundamental structure of the model.

If the architecture cannot represent a desired pattern, parameter updates alone cannot fix that problem.

This is one reason model design matters. Engineers must consider both:

1. Whether the architecture is expressive enough for the task.
2. Whether training can learn useful parameters from the available data.

These questions connect directly to the broader machine-learning ideas of generalization, model selection, and evaluation covered in AIF-03. This chapter focuses on the computational foundation of neural networks rather than repeating those topics.

---

## 10. Production Engineering Perspective

Artificial neurons are simple mathematical units, but neural-network systems introduce practical engineering concerns.

### 10.1 Input representation

A model only processes the numerical representation it receives. Incorrect preprocessing, inconsistent feature ordering, or unexpected input ranges can change predictions significantly.

The preprocessing used during inference must be compatible with the preprocessing used during training.

### 10.2 Parameter initialization

Weights and biases need initial values before training begins. Their initialization can affect the behavior of the network and the optimization process.

A single perceptron makes this dependency easy to inspect; deeper networks make initialization more consequential. Initialization strategies are discussed further in Chapter 05.

### 10.3 Model capacity versus data

A more expressive model is not automatically a better model. Its usefulness depends on whether the training process can learn appropriate parameters and whether the learned patterns generalize to unseen examples.

The appropriate architecture is an engineering decision, not simply a choice to maximize the number of parameters.

### 10.4 Interpretability

A single perceptron has a relatively transparent decision rule. Its weighted sum and threshold can be examined directly.

In larger networks, the same basic operations are composed across many units and layers. The resulting model can represent more complex patterns, but understanding an individual prediction generally becomes more difficult.

### 10.5 Numerical implementation

In practical systems, neural-network computations are performed using arrays or tensors. The same mathematical operation must be implemented with compatible dimensions, numerical types, and execution behavior.

This becomes especially important when processing batches of examples or using GPU acceleration. The tensor and shape intuition needed for multilayer computations is introduced in Chapter 02.

---

## 11. Common Mistakes

### Mistake 1: Treating weights as fixed importance scores

A weight affects a neuron's computation, but its value cannot always be interpreted as a direct measure of real-world importance. Input scale, correlations, and the rest of the model all matter.

### Mistake 2: Assuming every artificial neuron is a perceptron

An artificial neuron is a general computational building block. A classic perceptron uses a particular threshold-based decision rule. Modern neural networks use several kinds of activations and training methods.

### Mistake 3: Confusing the weighted sum with the final output

The weighted sum is the pre-activation value. The activation function transforms it into the neuron's output.

### Mistake 4: Assuming a single perceptron can solve any binary problem

A single perceptron represents a linear decision boundary. Some classification patterns, such as XOR, are not linearly separable.

### Mistake 5: Assuming training can fix every model limitation

Training adjusts parameters within the chosen model structure. It cannot make a structurally insufficient model represent a function outside its capabilities.

### Mistake 6: Believing neural networks literally reproduce biological neurons

Biological inspiration provides historical and conceptual context. Artificial neurons are mathematical operations, not faithful biological simulations.

---

## 12. Interview Questions and Reasoning Checks

### Question 1: What are the components of an artificial neuron?

A strong answer should describe the input features, weights, bias, weighted sum, activation function, and output. It should explain how these components interact rather than merely listing them.

### Question 2: Why does a perceptron need a bias?

The bias allows the decision boundary to shift away from the origin. Without it, the boundary is constrained to pass through the origin.

### Question 3: What does a negative weight mean?

It means that, with other inputs held constant, increasing that feature decreases the weighted sum. Its practical interpretation still depends on feature scaling and the rest of the model.

### Question 4: Why can a single perceptron not solve XOR?

Because XOR's positive and negative examples cannot be separated by one linear decision boundary. The limitation is representational, so changing the weights alone cannot solve it.

### Question 5: What is the difference between learning and representation?

Learning adjusts the model's parameters. Representation describes the functions the model structure can express. A model may fail because training did not find suitable parameters or because no suitable parameters exist within that structure.

### Question 6: Why are multilayer networks more expressive?

They compose multiple transformations. With nonlinear activations, this composition can represent decision boundaries that a single linear classifier cannot represent. The precise capabilities depend on the architecture and its parameters.

### Question 7: Does a perceptron output a probability?

A classic threshold-based perceptron outputs a class decision, not a calibrated probability. Other models can produce scores or probabilities using different output functions and training objectives.

---

## 13. Quick Revision

- A neural network learns a parameterized function from inputs to outputs.
- An artificial neuron computes a weighted sum, adds a bias, and applies an activation function.
- Weights determine how input values contribute to the weighted sum.
- Bias allows the decision boundary to shift.
- A classic perceptron makes a binary decision using a threshold.
- A single perceptron has a linear decision boundary.
- XOR is not linearly separable and cannot be represented perfectly by a single perceptron.
- More training cannot overcome a fundamental representation limitation.
- Multilayer networks combine computations to represent more complex patterns.

---

## 14. Key Takeaways

The most important lesson is not the neuron formula itself. It is the distinction between a model's **learnable parameters** and its **representational capabilities**.

An artificial neuron performs a simple computation. A perceptron uses that computation to make a linear classification decision. This is powerful enough for some problems but insufficient for others.

Understanding this limitation explains why multilayer neural networks were developed and prepares us to study how multiple neurons work together.

---

## 15. Further Reading and Next Chapter

Continue to:

[**Chapter 02 — Multilayer Networks and Forward Propagation**](02-Multilayer-Networks-and-Forward-Propagation.md)

The next chapter builds on the artificial neuron and examines how layers combine computations, how information moves through a network, and how forward propagation produces predictions.

Related chapters:

- [Chapter 03 — Activation and Loss Functions](03-Activation-and-Loss-Functions.md): activation functions and task-compatible outputs.
- [Chapter 04 — Backpropagation and Gradient Flow](04-Backpropagation-and-Gradient-Flow.md): how training computes parameter gradients.
- [Chapter 05 — Optimization and Training Dynamics](05-Optimization-and-Training-Dynamics.md): how model parameters are updated during training.
