# 02 — Multilayer Networks and Forward Propagation

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain why multilayer neural networks are needed beyond a single perceptron.
- Describe the roles of input, hidden, and output layers.
- Distinguish learnable parameters from intermediate activations.
- Explain how layers compose transformations to build more expressive functions.
- Trace forward propagation through a small neural network.
- Understand tensor shapes and their relationship to network architecture.
- Calculate a simple network's output by hand.
- Explain how network depth and width affect representational capacity.

## Prerequisites

- [Chapter 01 — Neural Network Intuition and Perceptrons](01-Neural-Network-Intuition-and-Perceptrons.md)
- Basic understanding of vectors, matrices, and dot products.
- Familiarity with weights, biases, and activation functions.

**Estimated reading time:** 35–45 minutes

---

## 1. Why Multilayer Networks Exist

In the previous chapter, we saw that a single perceptron computes a weighted sum and makes a threshold-based decision. Its decision boundary is linear.

That is sufficient for some classification problems, but not for every possible pattern. XOR is a simple example: its classes cannot be separated by one straight line.

The limitation is structural. Changing the perceptron's weights cannot produce a decision boundary that its architecture cannot represent.

A natural next step is to combine multiple computational units.

Instead of asking one unit to learn the entire relationship between inputs and outputs, a network can perform several transformations in sequence. Intermediate results from one transformation become inputs to the next.

This creates a **multilayer neural network**.

### 1.1 The central idea

A multilayer network computes a composition of functions:

\[
\hat{y}=f_3(f_2(f_1(x)))
\]

Each function transforms the representation it receives. The complete network combines these transformations to produce a prediction.

For a network with a hidden layer, the computation can be represented as:

\[
x \rightarrow h \rightarrow \hat{y}
\]

Where:

- \(x\) is the input.
- \(h\) is the hidden representation computed by the network.
- \(\hat{y}\) is the final prediction.

The hidden representation is not necessarily a human-interpretable feature. It is an intermediate numerical representation learned as part of the model.

**Key idea:** A multilayer network can build intermediate representations instead of relying on a single transformation from input to output.

---

## 2. The Three Main Layer Roles

A feedforward neural network commonly contains an input layer, one or more hidden layers, and an output layer.

<AsyncImage query="simple feedforward neural network diagram input layer hidden layer output layer labeled neurons and connecting weighted arrows white background educational illustration" aspectRatio="5:3" width="100%" />

### 2.1 Input layer

The input layer receives the numerical features provided to the network.

Suppose a model predicts house prices from three features:

\[
x=
\begin{bmatrix}
\text{Area}\\
\text{Bedrooms}\\
\text{Age}
\end{bmatrix}
\]

The input contains three feature values, so the input dimension is three.

The input layer does not necessarily perform a learned transformation. In a basic feedforward network, it is useful to think of it as the interface through which the input values enter the model.

### 2.2 Hidden layers

Hidden layers perform intermediate computations.

A hidden layer typically applies a linear transformation followed by an activation function:

\[
h=g(Wx+b)
\]

Where:

- \(x\) is the input to the layer.
- \(W\) is its weight matrix.
- \(b\) is its bias vector.
- \(g\) is the activation function.
- \(h\) is the resulting activation vector.

A hidden layer can contain multiple neurons. Each neuron combines its incoming values using its own weights and bias.

The layer's output becomes the next layer's input.

Hidden layers are called *hidden* because their outputs are intermediate model computations rather than the model's designated final predictions. They are not necessarily secret, inaccessible, or inherently uninterpretable.

### 2.3 Output layer

The output layer produces the model's final output.

Its size and activation depend on the task.

| Task | Typical output representation |
|---|---|
| Regression | One or more numerical predictions |
| Binary classification | A score or probability, often using sigmoid |
| Multiclass classification | Class scores or probabilities, often using softmax |

These are common designs, not universal rules. For example, binary classifiers may use a single logit during training and apply sigmoid when interpreting it as a probability.

Output activations and task-specific losses are covered in [Chapter 03 — Activation and Loss Functions](03-Activation-and-Loss-Functions.md).

---

## 3. A Layer Is a Transformation

A layer should not be understood merely as a collection of neurons. It is a transformation that maps one numerical representation to another.

Consider a layer with three input features and two output neurons.

\[
x\in\mathbb{R}^{3}
\]

\[
h\in\mathbb{R}^{2}
\]

The layer maps a three-dimensional input vector to a two-dimensional output vector.

Ignoring the activation for a moment, its linear transformation is:

\[
z=Wx+b
\]

The weight matrix must have shape \(2\times3\), and the bias vector has two elements.

\[
W=
\begin{bmatrix}
w_{11}&w_{12}&w_{13}\\
w_{21}&w_{22}&w_{23}
\end{bmatrix}
\]

\[
b=
\begin{bmatrix}
b_1\\
b_2
\end{bmatrix}
\]

The first row of \(W\) contains the weights for the first output neuron. The second row contains the weights for the second output neuron.

The result is a vector with two values:

\[
z=
\begin{bmatrix}
w_{11}x_1+w_{12}x_2+w_{13}x_3+b_1\\
w_{21}x_1+w_{22}x_2+w_{23}x_3+b_2
\end{bmatrix}
\]

Applying the activation function gives:

\[
h=g(z)
\]

Here, the activation function is applied element-wise for common choices such as ReLU or sigmoid.

### 3.1 Why this representation matters

The matrix formulation captures many neuron computations in one operation.

Instead of writing separate code for every neuron, a numerical library can compute the whole layer using matrix multiplication and vector operations.

This is important for efficient execution on CPUs and GPUs.

It also makes tensor dimensions an engineering concern: the dimensions of adjacent layers must be compatible.

---

## 4. Parameters Versus Activations

One of the most important distinctions in neural-network engineering is the difference between **parameters** and **activations**.

### 4.1 Parameters

Parameters are learned values stored by the model.

For a fully connected layer, these include:

- Weight matrix \(W\).
- Bias vector \(b\), when the layer uses a bias.

Training updates these values to improve the model's predictions according to its training objective.

For a layer with \(d_{\text{in}}\) input features and \(d_{\text{out}}\) output units, a standard fully connected layer with bias contains:

\[
N_{\text{params}}
=d_{\text{in}}d_{\text{out}}+d_{\text{out}}
\]

The first term counts the weights. The second counts the biases.

For example, a layer with three inputs and two output units contains:

\[
N_{\text{params}}=3\times2+2=8
\]

### 4.2 Activations

Activations are the intermediate values computed when the network processes an input.

For a layer:

\[
h=g(Wx+b)
\]

The weights and bias are parameters. The vector \(h\) is an activation.

For a given input and fixed parameters, the forward computation produces the activations.

When a different input is provided, the activations generally change. The learned parameters do not normally change just because an inference request is processed.

### 4.3 Why the distinction matters in production

| Property | Parameters | Activations |
|---|---|---|
| Meaning | Learned model values | Intermediate computed values |
| Change during ordinary inference | Normally no | Yes, depending on input |
| Main storage concern | Model memory | Runtime memory |
| Used during training | Updated by optimization | Computed and used in gradient calculations |
| Example | Weight matrix | Hidden-layer output |

During training, activations may need to be retained or recomputed for gradient calculations. For large models, activation memory can become a major constraint.

During inference, activations consume runtime memory as the input passes through the network. Batch size, architecture, precision, and execution strategy affect this memory requirement.

The distinction helps engineers reason about model size, GPU memory, training efficiency, and serving capacity.

---

## 5. Forward Propagation

**Forward propagation**, also called the forward pass, is the process of passing an input through the network to compute its output.

For a network with one hidden layer:

\[
z^{(1)}=W^{(1)}x+b^{(1)}
\]

\[
h=g(z^{(1)})
\]

\[
z^{(2)}=W^{(2)}h+b^{(2)}
\]

\[
\hat{y}=q(z^{(2)})
\]

Where:

- \(W^{(1)},b^{(1)}\) are the first layer's parameters.
- \(h\) is the hidden activation.
- \(W^{(2)},b^{(2)}\) are the output layer's parameters.
- \(g\) is the hidden activation function.
- \(q\) is the output transformation appropriate for the task.
- \(\hat{y}\) is the prediction.

The superscripts identify layers. They are not exponents.

### 5.1 Forward-pass sequence

```text
Input x
   |
   v
Linear transformation
z⁽¹⁾ = W⁽¹⁾x + b⁽¹⁾
   |
   v
Hidden activation
h = g(z⁽¹⁾)
   |
   v
Output transformation
z⁽²⁾ = W⁽²⁾h + b⁽²⁾
   |
   v
Prediction
ŷ = q(z⁽²⁾)
```

Each stage consumes the result of the previous stage.

The network does not need to know the correct label to perform a forward pass. It needs the input and the current parameters.

During training, the prediction is compared with the target using a loss function. How that loss is calculated and how the parameters are updated are covered in later chapters.

### 5.2 Why the order matters

The output of a layer depends on its input, weights, bias, and activation function. A later layer therefore depends on the result produced by the preceding layer.

This dependency defines the computation graph.

The forward pass must respect the order of these dependencies. It cannot compute a later layer's activation until the required earlier values are available.

---

## 6. Worked Example: A Small Neural Network

Consider a feedforward network with:

- Two input features.
- Two hidden neurons.
- One output neuron.
- ReLU activation in the hidden layer.
- Identity output transformation for a numerical prediction.

The architecture is:

\[
2\rightarrow2\rightarrow1
\]

The hidden layer computes:

\[
h=\operatorname{ReLU}(W^{(1)}x+b^{(1)})
\]

The output layer computes:

\[
\hat{y}=W^{(2)}h+b^{(2)}
\]

Use the following input:

\[
x=
\begin{bmatrix}
1\\
2
\end{bmatrix}
\]

First-layer weights:

\[
W^{(1)}=
\begin{bmatrix}
1&-1\\
0.5&1
\end{bmatrix}
\]

First-layer bias:

\[
b^{(1)}=
\begin{bmatrix}
0\\
-0.5
\end{bmatrix}
\]

Output weights and bias:

\[
W^{(2)}=
\begin{bmatrix}
2&-1
\end{bmatrix},
\qquad
b^{(2)}=0.5
\]

### Step 1: Compute the hidden pre-activation values

\[
z^{(1)}=W^{(1)}x+b^{(1)}
\]

Substitute the values:

\[
z^{(1)}=
\begin{bmatrix}
1&-1\\
0.5&1
\end{bmatrix}
\begin{bmatrix}
1\\
2
\end{bmatrix}
+
\begin{bmatrix}
0\\
-0.5
\end{bmatrix}
\]

Calculate each element:

\[
z^{(1)}=
\begin{bmatrix}
1(1)+(-1)(2)+0\\
0.5(1)+1(2)-0.5
\end{bmatrix}
\]

Therefore:

\[
z^{(1)}=
\begin{bmatrix}
-1\\
2
\end{bmatrix}
\]

### Step 2: Apply ReLU

ReLU is defined as:

\[
\operatorname{ReLU}(z)=\max(0,z)
\]

Applying it element-wise:

\[
h=
\begin{bmatrix}
\max(0,-1)\\
\max(0,2)
\end{bmatrix}
=
\begin{bmatrix}
0\\
2
\end{bmatrix}
\]

The first hidden neuron outputs zero, while the second outputs two.

### Step 3: Compute the output

\[
\hat{y}=W^{(2)}h+b^{(2)}
\]

Substituting the values:

\[
\hat{y}=
\begin{bmatrix}
2&-1
\end{bmatrix}
\begin{bmatrix}
0\\
2
\end{bmatrix}
+0.5
\]

\[
\hat{y}=2(0)-1(2)+0.5
\]

\[
\boxed{\hat{y}=-1.5}
\]

The network's prediction is \(-1.5\).

Because the output transformation is the identity function, the output can take any real value. This is consistent with an illustrative regression model, though it does not establish whether the prediction is accurate.

### What this example demonstrates

1. Each layer performs a separate transformation.
2. The hidden layer creates intermediate activations.
3. The activation function changes the values passed to the next layer.
4. The output layer uses the hidden representation rather than the original input directly.
5. The final prediction depends on the parameters and activation functions of every preceding layer.

The example demonstrates forward propagation only. No learning or parameter updates have occurred.

---

## 7. Tensor Shapes and Dimension Compatibility

In implementations, inputs and intermediate values are usually represented as tensors: multidimensional arrays of numerical values.

Even a scalar, vector, or matrix can be represented as a tensor.

Understanding shapes is essential because a layer's matrix multiplication requires compatible dimensions.

### 7.1 Single-example shapes

Suppose a layer receives three features and produces four hidden units.

The input vector has shape:

\[
x:(3,)
\]

The weight matrix has shape:

\[
W:(4,3)
\]

The bias has shape:

\[
b:(4,)
\]

The resulting activation has shape:

\[
h:(4,)
\]

The matrix multiplication is valid because the weight matrix's second dimension, three, matches the input vector's length.

The output dimension is determined by the weight matrix's first dimension, four.

### 7.2 Batch processing

Production systems commonly process multiple examples together.

Suppose a batch contains 32 examples, each with three features.

Using a batch-first convention:

\[
X:(32,3)
\]

For a layer with four output units:

\[
W:(4,3)
\]

\[
b:(4,)
\]

The batch computation is:

\[
H=g(XW^T+b)
\]

The resulting shape is:

\[
H:(32,4)
\]

Each row corresponds to one example. Each column corresponds to one output unit.

The bias is broadcast across the 32 examples in this expression.

### 7.3 A shape trace

For a network with 3 input features, 4 hidden units, and 2 output units:

```text
Input batch:      (32, 3)
       |
       v
Hidden layer:     (32, 4)
       |
       v
Output layer:     (32, 2)
```

The first dimension remains 32 because the network processes the same batch of examples through each layer. The feature dimension changes according to each layer's output size.

This is a common convention, not a universal tensor layout. Libraries and specialized architectures may use different dimension orders.

### 7.4 Common shape errors

- Reversing the weight matrix dimensions.
- Passing an input with the wrong number of features.
- Accidentally removing the batch dimension.
- Combining tensors whose shapes cannot be broadcast as intended.
- Assuming a tensor's shape alone explains its semantic meaning.

Shape compatibility is necessary for a computation to execute correctly, but it does not guarantee that the features are in the correct order or that the model is semantically configured correctly.

---

## 8. Why Nonlinearity Matters

A multilayer network is not automatically more expressive merely because it contains multiple layers.

Consider two linear transformations:

\[
h=W^{(1)}x+b^{(1)}
\]

\[
y=W^{(2)}h+b^{(2)}
\]

Substitute the first equation into the second:

\[
y=W^{(2)}(W^{(1)}x+b^{(1)})+b^{(2)}
\]

Expanding gives:

\[
y=W^{(2)}W^{(1)}x+
W^{(2)}b^{(1)}+b^{(2)}
\]

This is still an affine transformation of \(x\): it can be represented as one linear transformation plus a bias.

Therefore, stacking linear layers without nonlinear activations does not, by itself, provide the same additional expressive power as a network containing nonlinear activations.

### 8.1 Adding a nonlinear activation

Now consider:

\[
h=g(W^{(1)}x+b^{(1)})
\]

\[
y=W^{(2)}h+b^{(2)}
\]

When \(g\) is nonlinear, the composition can represent functions that cannot generally be reduced to a single affine transformation.

This is one of the key reasons nonlinear activations are important in deep learning.

ReLU, sigmoid, and tanh have different mathematical properties and practical trade-offs. Their behavior is the focus of Chapter 03, so this chapter does not re-teach their details.

**Engineering intuition:** Layers provide opportunities to compose transformations; nonlinear activations prevent the entire composition from collapsing into one affine transformation.

---

## 9. Network Depth and Width

Two basic architectural dimensions are depth and width.

### 9.1 Depth

Depth refers to how many layers of computation are composed in the network. The exact counting convention varies, so engineers should specify whether they are counting hidden layers, parameterized layers, or all computational stages.

A deeper network can build a sequence of intermediate transformations:

```text
Input
  |
  v
Layer 1: initial transformation
  |
  v
Layer 2: intermediate transformation
  |
  v
Layer 3: further transformation
  |
  v
Output
```

Depth creates opportunities to build representations through successive computations.

However, deeper is not automatically better. Greater depth can increase training difficulty, computational cost, memory usage, and sensitivity to architectural and optimization choices.

### 9.2 Width

Width refers to the number of units in a layer.

A wider hidden layer can produce a larger intermediate representation and may allow the model to represent more patterns.

But adding units also increases parameter count and computation for a fully connected layer.

For a layer with \(d_{\text{in}}\) inputs and \(d_{\text{out}}\) outputs, the parameter count with bias is:

\[
N_{\text{params}}=d_{\text{in}}d_{\text{out}}+d_{\text{out}}
\]

Increasing either dimension increases the number of parameters.

### 9.3 Capacity is not the same as performance

Depth and width influence what a network can represent, but they do not guarantee better predictions.

Performance also depends on:

- Data quantity and quality.
- Input and target representations.
- Architecture and activation choices.
- Parameter initialization.
- Optimization settings.
- Regularization.
- Evaluation methodology.

The relationship between model capacity, underfitting, overfitting, and generalization belongs to the broader machine-learning foundation in AIF-03. The neural-network-specific effects of training and regularization are revisited in Chapters 05 and 06.

---

## 10. Forward Propagation During Training and Inference

Forward propagation is used in both training and inference, but the surrounding workflows differ.

### 10.1 During inference

The model receives an input, computes activations through its layers, and produces a prediction.

```text
Input
  |
  v
Forward propagation
  |
  v
Prediction
  |
  v
Return result
```

The learned parameters are normally fixed during inference.

For a deployed service, engineering concerns include latency, throughput, memory consumption, input validation, batch size, and numerical consistency.

### 10.2 During training

Training adds a comparison between the prediction and the correct target.

```text
Input + Current Parameters
           |
           v
    Forward propagation
           |
           v
       Prediction
           |
           v
 Compare with Target
           |
           v
        Loss Value
           |
           v
 Gradient computation and parameter update
```

The forward pass computes the prediction. A loss function measures a task-specific discrepancy between the prediction and target. Training then uses gradients to update parameters.

This chapter focuses on the forward computation. The internal mechanics of gradient computation and parameter updates are covered in [Chapter 04 — Backpropagation and Gradient Flow](04-Backpropagation-and-Gradient-Flow.md) and [Chapter 05 — Optimization and Training Dynamics](05-Optimization-and-Training-Dynamics.md).

---

## 11. Implementation Perspective

A framework implementation follows the same mathematical structure.

A minimal PyTorch-style example:

```python
import torch
import torch.nn as nn

class SmallNetwork(nn.Module):
    def __init__(self):
        super().__init__()

        self.hidden = nn.Linear(2, 2)
        self.activation = nn.ReLU()
        self.output = nn.Linear(2, 1)

    def forward(self, x):
        hidden = self.activation(self.hidden(x))
        prediction = self.output(hidden)
        return prediction

model = SmallNetwork()

# One example with two features.
x = torch.tensor([[1.0, 2.0]])

prediction = model(x)

print(prediction)
print(prediction.shape)  # torch.Size([1, 1])
```

### What the code demonstrates

- `nn.Linear(2, 2)` maps two input features to two output units.
- `nn.ReLU()` applies a nonlinear activation.
- `nn.Linear(2, 1)` maps the hidden representation to one output.
- The input shape `(1, 2)` represents a batch of one example with two features.
- The output shape `(1, 1)` represents one output for that example.

The framework initializes the layer parameters automatically. The numerical output will depend on the initialized weights and biases.

This example does not train the model. It only executes the forward pass.

In real training code, engineers must additionally define a target, choose a suitable loss function and optimizer, compute gradients, and update parameters. Those responsibilities are covered in subsequent chapters.

---

## 12. Common Mistakes

### Mistake 1: Assuming more layers always improve a model

More layers increase architectural complexity and may improve representational capability, but can also increase training difficulty and operational cost.

Choose architecture based on the task, evidence, and constraints.

### Mistake 2: Confusing parameters with activations

Weights and biases are learned parameters. Activations are computed values produced as an input moves through the network.

This distinction matters for training, memory use, and debugging.

### Mistake 3: Forgetting the role of nonlinear activations

Stacking linear layers without nonlinearities still produces an affine transformation. Nonlinear activations are what allow the composition to represent a broader class of functions.

### Mistake 4: Treating forward propagation as training

Forward propagation computes predictions. Training additionally evaluates the prediction against a target and adjusts model parameters.

### Mistake 5: Ignoring tensor dimensions

A network may fail because adjacent layer dimensions are incompatible, or it may execute with incorrectly ordered features and produce misleading results.

Always reason about both shape and semantic meaning.

### Mistake 6: Assuming hidden units correspond to human concepts

Hidden activations are learned numerical representations. A hidden unit does not automatically correspond to a cleanly defined concept such as “wealth” or “risk.”

Any such interpretation requires evidence.

### Mistake 7: Assuming a larger parameter count means a better model

More parameters can increase capacity, but they also increase resource requirements and may make generalization more difficult. Model selection must be supported by appropriate evaluation.

---

## 13. Interview Questions and Reasoning Checks

### Question 1: Why are multilayer networks more expressive than a single perceptron?

A strong answer should explain the composition of transformations and the role of nonlinear activations. Simply saying “they have more neurons” is incomplete.

### Question 2: Why do multiple linear layers not provide the same expressive benefit as nonlinear layers?

Because the composition of affine transformations can be reduced to one affine transformation. Nonlinear activations change that property.

### Question 3: What is the difference between a parameter and an activation?

A parameter is a learned model value, such as a weight or bias. An activation is an intermediate value computed for a particular input.

### Question 4: What happens during forward propagation?

The input is passed through the network's ordered layer computations. Each layer transforms the preceding values until the model produces its prediction.

### Question 5: Why does tensor shape matter?

Shape determines whether operations such as matrix multiplication are dimensionally valid and how data is arranged across examples and features. Correct shape alone does not guarantee correct feature semantics.

### Question 6: How do depth and width differ?

Depth concerns the sequence of composed computations; width concerns the number of units in a layer. Both affect capacity and computational cost, but neither guarantees better generalization.

### Question 7: Does a forward pass update the weights?

Not by itself. A forward pass computes outputs using the current parameters. Parameter updates require a training procedure.

---

## 14. Quick Revision

- A multilayer network composes transformations to map inputs to outputs.
- The input layer receives numerical features.
- Hidden layers compute intermediate representations.
- The output layer produces the model's final output.
- Weights and biases are parameters; intermediate outputs are activations.
- Forward propagation computes a prediction by evaluating layers in dependency order.
- Tensor dimensions must align across layer operations.
- Linear layers alone collapse to a single affine transformation.
- Nonlinear activations enable a broader range of representable functions.
- Depth and width affect capacity and cost, but not performance guarantees.
- Inference normally uses fixed parameters; training includes loss calculation and parameter updates.

---

## 15. Key Takeaways

The essential mental model is that a multilayer neural network is a composition of parameterized transformations.

Each layer receives a numerical representation and produces another representation. The parameters determine the transformation, while the activation function determines how its computed values are transformed before passing onward.

Forward propagation evaluates this composition from input to prediction. Understanding the sequence, parameter-versus-activation distinction, and tensor shapes provides the foundation for studying activation functions, losses, gradient computation, and optimization.

---

## 16. Further Reading and Next Chapter

Continue to:

[**Chapter 03 — Activation and Loss Functions**](03-Activation-and-Loss-Functions.md)

The next chapter examines why activation functions matter, how output choices relate to task types, and how loss functions quantify prediction error.

Related chapters:

- [Chapter 01 — Neural Network Intuition and Perceptrons](01-Neural-Network-Intuition-and-Perceptrons.md)
- [Chapter 04 — Backpropagation and Gradient Flow](04-Backpropagation-and-Gradient-Flow.md)
- [Chapter 05 — Optimization and Training Dynamics](05-Optimization-and-Training-Dynamics.md)
- [Chapter 06 — Regularization, Hyperparameters, and Failure Modes](06-Regularization-Hyperparameters-and-Failure-Modes.md)
