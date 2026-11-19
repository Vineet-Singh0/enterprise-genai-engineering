# Vectors, Matrices and Operations

## 1. Overview

Vectors and matrices provide a structured way to represent numerical information and perform mathematical operations on it. They are fundamental to machine learning, deep learning, embeddings, and transformer architectures.

A vector can represent the features of a single data point. A matrix can represent multiple data points or the parameters of a model. Operations on these structures allow machine learning systems to transform inputs, combine information, and compute predictions.

This chapter focuses on **how vectors and matrices are represented, how their operations work, and how to reason about dimensions and shape compatibility**.

It builds on the conceptual foundations introduced in [Linear Algebra Foundations](05-Linear-Algebra-Foundations.md).

## 2. Learning Objectives

By the end of this chapter, you should be able to:

- Represent numerical data using vectors and matrices.
- Distinguish vector length from matrix dimensions and shape.
- Perform vector addition and scalar multiplication.
- Calculate and interpret dot products.
- Perform matrix addition and matrix multiplication.
- Understand matrix-vector multiplication.
- Explain transpose and identity matrices.
- Identify incompatible operations by inspecting dimensions.
- Connect these operations to machine learning inputs, weights, and embeddings.

## 3. Prerequisites

You should understand:

- Scalars, vectors, and matrices at a conceptual level.
- Basic arithmetic and algebraic expressions.
- The idea of dimensions and shape from [Linear Algebra Foundations](05-Linear-Algebra-Foundations.md).

**Estimated reading time:** 40–50 minutes.

## 4. Representing Numerical Data

### 4.1 Scalars

A scalar is a single numerical value.

Examples:

\[
x = 5,\qquad \lambda = 0.5
\]

Scalars are used for quantities such as a learning rate, a temperature parameter, or a single feature value.

### 4.2 Vectors

A vector is an ordered collection of numbers.

For example:

\[
\mathbf{x} =
\begin{bmatrix}
2\\
4\\
6
\end{bmatrix}
\]

This vector contains three values, so its length is three.

The values could represent three numerical features of one customer, such as age, account tenure, and transaction count. The interpretation depends on the application.

Vectors can be written as column vectors or row vectors. Their orientation matters when performing matrix operations.

A column vector with three elements has shape \(3 \times 1\). Its row-vector counterpart has shape \(1 \times 3\).

### 4.3 Matrices

A matrix is a rectangular arrangement of numbers organized into rows and columns.

\[
A =
\begin{bmatrix}
1 & 2 & 3\\
4 & 5 & 6
\end{bmatrix}
\]

This matrix has two rows and three columns. Its shape is:

\[
\operatorname{shape}(A) = (2,3)
\]

A matrix can represent a dataset in which each row is an observation and each column is a feature.

For example, the matrix above contains two observations, each represented by three features.

This is a common convention, not a universal rule. Some applications arrange observations or dimensions differently.

### 4.4 Shape and dimensions

Shape describes the dimensions of a numerical structure.

| Structure | Example | Shape |
|---|---|---|
| Scalar | \(5\) | Zero-dimensional value |
| Column vector | \(\begin{bmatrix}2\\4\\6\end{bmatrix}\) | \((3,1)\) |
| Row vector | \(\begin{bmatrix}2&4&6\end{bmatrix}\) | \((1,3)\) |
| Matrix | \(\begin{bmatrix}1&2&3\\4&5&6\end{bmatrix}\) | \((2,3)\) |

For a matrix with \(m\) rows and \(n\) columns, the shape is \((m,n)\).

The number of elements is:

\[
m \times n
\]

Shape is not merely descriptive metadata. It determines which operations are mathematically valid.

**Engineering rule:** Before performing a vector or matrix operation, identify the shape of every operand.

## 5. Vector Operations

### 5.1 Vector addition

Two vectors of the same shape can be added by adding their corresponding elements.

Let:

\[
\mathbf{a} =
\begin{bmatrix}
1\\
2\\
3
\end{bmatrix},
\qquad
\mathbf{b} =
\begin{bmatrix}
4\\
5\\
6
\end{bmatrix}
\]

Then:

\[
\mathbf{a}+\mathbf{b} =
\begin{bmatrix}
1+4\\
2+5\\
3+6
\end{bmatrix}
=
\begin{bmatrix}
5\\
7\\
9
\end{bmatrix}
\]

Both vectors have shape \((3,1)\), so the operation is compatible.

If one vector has three elements and the other has four, ordinary vector addition is not defined because there is no one-to-one correspondence between all elements.

**Where it is useful:** Adding a correction vector to a parameter vector, combining compatible numerical representations, or updating model parameters.

### 5.2 Scalar multiplication

Scalar multiplication multiplies every vector element by the same scalar.

For:

\[
\mathbf{x} =
\begin{bmatrix}
2\\
4\\
6
\end{bmatrix}
\]

multiplying by \(3\) gives:

\[
3\mathbf{x} =
\begin{bmatrix}
3(2)\\
3(4)\\
3(6)
\end{bmatrix}
=
\begin{bmatrix}
6\\
12\\
18
\end{bmatrix}
\]

The vector's shape remains unchanged. Only its values change.

Geometrically, scalar multiplication changes a vector's magnitude. A negative scalar also reverses its direction.

**Where it is useful:** Scaling numerical values, applying weights, and updating parameters during optimization.

### 5.3 Dot product

The dot product combines two vectors of equal length into a single scalar.

For two vectors:

\[
\mathbf{a} =
\begin{bmatrix}
a_1\\a_2\\a_3
\end{bmatrix},
\qquad
\mathbf{b} =
\begin{bmatrix}
b_1\\b_2\\b_3
\end{bmatrix}
\]

their dot product is:

\[
\mathbf{a}\cdot\mathbf{b}
= a_1b_1+a_2b_2+a_3b_3
\]

Consider:

\[
\mathbf{a} =
\begin{bmatrix}
2\\3\\4
\end{bmatrix},
\qquad
\mathbf{b} =
\begin{bmatrix}
5\\1\\2
\end{bmatrix}
\]

Then:

\[
\mathbf{a}\cdot\mathbf{b}
= (2)(5)+(3)(1)+(4)(2)
= 10+3+8
= 21
\]

The result is one number, not another vector.

#### Why does the dot product matter?

Imagine that the vector \(\mathbf{x}\) contains input features and \(\mathbf{w}\) contains a weight for each feature.

The weighted sum is:

\[
z = \mathbf{w}\cdot\mathbf{x}
\]

Each feature is multiplied by its corresponding weight, and the products are summed.

This is a core calculation in a linear model and in the computation performed by a neuron before its activation function.

#### Dot product and orientation

For column vectors, the dot product can be written using a transpose:

\[
\mathbf{a}^{T}\mathbf{b}
\]

If both vectors have shape \((3,1)\), then:

- \(\mathbf{a}^{T}\) has shape \((1,3)\).
- \(\mathbf{b}\) has shape \((3,1)\).
- The result has shape \((1,1)\), representing a scalar.

This notation connects vector operations to matrix multiplication.

#### Dot product and similarity

For nonzero vectors, the dot product is related to the angle between them:

\[
\mathbf{a}\cdot\mathbf{b}
=
\|\mathbf{a}\|\|\mathbf{b}\|\cos\theta
\]

Here, \(\|\mathbf{a}\|\) and \(\|\mathbf{b}\|\) represent vector magnitudes, and \(\theta\) is the angle between the vectors.

A positive dot product indicates an angle smaller than \(90^\circ\); a negative dot product indicates an angle greater than \(90^\circ\). A zero dot product means the vectors are perpendicular, provided the vectors are nonzero.

However, **a larger raw dot product does not automatically mean greater semantic similarity**. The result also depends on vector magnitudes. Cosine similarity normalizes the dot product by both magnitudes.

Embedding-based retrieval uses these ideas to compare vector representations. The appropriate similarity metric depends on the embedding model and retrieval design.

## 6. Matrix Operations

### 6.1 Matrix addition

Matrices with the same shape can be added element by element.

Let:

\[
A =
\begin{bmatrix}
1 & 2\\
3 & 4
\end{bmatrix},
\qquad
B =
\begin{bmatrix}
5 & 6\\
7 & 8
\end{bmatrix}
\]

Then:

\[
A+B =
\begin{bmatrix}
1+5 & 2+6\\
3+7 & 4+8
\end{bmatrix}
=
\begin{bmatrix}
6 & 8\\
10 & 12
\end{bmatrix}
\]

Both matrices have shape \((2,2)\), so their corresponding elements can be paired.

Adding matrices of different shapes is not defined under ordinary matrix addition.

Some numerical libraries support broadcasting, which can extend certain operations across compatible dimensions. Broadcasting is a library-level convention with its own shape rules; it should not be confused with the basic mathematical definition of matrix addition.

### 6.2 Matrix transpose

The transpose of a matrix exchanges its rows and columns.

If:

\[
A =
\begin{bmatrix}
1 & 2 & 3\\
4 & 5 & 6
\end{bmatrix}
\]

then:

\[
A^T =
\begin{bmatrix}
1 & 4\\
2 & 5\\
3 & 6
\end{bmatrix}
\]

The original shape is \((2,3)\). The transposed shape is \((3,2)\).

Transposition is useful when arranging data into the orientation required by an operation or converting a row vector into a column vector.

A common engineering mistake is to transpose a matrix simply because an operation fails, without checking whether the data orientation is actually correct. A shape error can reveal a deeper problem in the model or data pipeline.

### 6.3 Matrix multiplication

Matrix multiplication combines rows of the first matrix with columns of the second matrix.

Suppose:

\[
A =
\begin{bmatrix}
1 & 2\\
3 & 4
\end{bmatrix},
\qquad
B =
\begin{bmatrix}
5 & 6\\
7 & 8
\end{bmatrix}
\]

The first element of \(AB\) is the dot product of the first row of \(A\) and the first column of \(B\):

\[
(1)(5)+(2)(7)=19
\]

The element in the first row and second column is:

\[
(1)(6)+(2)(8)=22
\]

Calculating all four elements gives:

\[
AB =
\begin{bmatrix}
19 & 22\\
43 & 50
\end{bmatrix}
\]

Notice that matrix multiplication is not the same as multiplying corresponding elements.

For ordinary matrix multiplication:

\[
A_{m\times n}B_{n\times p}=C_{m\times p}
\]

The number of columns in the first matrix must equal the number of rows in the second matrix. The resulting matrix has the row count of the first matrix and the column count of the second.

#### Shape compatibility example

Consider:

\[
A_{2\times3}B_{3\times4}
\]

The inner dimensions are both \(3\), so multiplication is valid. The result has shape:

\[
C_{2\times4}
\]

But:

\[
A_{2\times3}B_{2\times4}
\]

is invalid under ordinary matrix multiplication because the inner dimensions, \(3\) and \(2\), do not match.

A useful mental model is:

\[
\boxed{\text{Outer dimensions determine the result; inner dimensions must match.}}
\]

### 6.4 Matrix-vector multiplication

Matrix-vector multiplication applies a matrix to a vector and produces another vector.

Let:

\[
A =
\begin{bmatrix}
1 & 2 & 3\\
4 & 5 & 6
\end{bmatrix},
\qquad
\mathbf{x} =
\begin{bmatrix}
2\\
1\\
3
\end{bmatrix}
\]

The matrix has shape \((2,3)\), and the vector has shape \((3,1)\). Multiplication is valid because the inner dimensions match.

Calculate each row's dot product with the vector:

\[
A\mathbf{x}
=
\begin{bmatrix}
1(2)+2(1)+3(3)\\
4(2)+5(1)+6(3)
\end{bmatrix}
=
\begin{bmatrix}
13\\
31
\end{bmatrix}
\]

The result has shape \((2,1)\).

Each row produces one output value. Therefore, a matrix with \(m\) rows transforms a compatible input vector into a vector containing \(m\) output values.

#### Connection to machine learning

A linear transformation can be represented as:

\[
\mathbf{y}=W\mathbf{x}
\]

where:

- \(\mathbf{x}\) is an input feature vector.
- \(W\) is a weight matrix.
- \(\mathbf{y}\) is the resulting output vector.

In a neural network layer, a bias vector is commonly added:

\[
\mathbf{z}=W\mathbf{x}+\mathbf{b}
\]

The exact shapes depend on how inputs, weights, and batches are arranged in the implementation. The underlying principle remains the same: dimensions must align.

Matrix multiplication lets a model apply many weighted combinations efficiently, instead of calculating every output separately in handwritten code.

### 6.5 Identity matrix

An identity matrix is a square matrix with ones on its main diagonal and zeros elsewhere.

For example:

\[
I =
\begin{bmatrix}
1 & 0 & 0\\
0 & 1 & 0\\
0 & 0 & 1
\end{bmatrix}
\]

For a compatible matrix or vector:

\[
I\mathbf{x}=\mathbf{x}
\]

and:

\[
AI=A,\qquad IA=A
\]

when the dimensions are compatible.

The identity matrix plays a role similar to the number \(1\) in ordinary multiplication. It is useful in mathematical derivations and in understanding more advanced operations, including matrix inverses.

## 7. Important Differences Between Operations

| Operation | Requirement | Output |
|---|---|---|
| Vector addition | Same shape | Vector |
| Scalar multiplication | A scalar and a vector or matrix | Same shape as the original structure |
| Dot product | Vectors of equal length | Scalar |
| Matrix addition | Same shape | Matrix |
| Transpose | Any matrix | Matrix with rows and columns exchanged |
| Matrix multiplication | Inner dimensions match | Matrix |
| Matrix-vector multiplication | Matrix columns match vector rows | Vector |

Two additional properties are important.

### 7.1 Matrix multiplication is generally not commutative

For ordinary numbers, \(ab=ba\). For matrices, this generally does not hold:

\[
AB\neq BA
\]

Even when both products are mathematically defined, their results can differ. Sometimes one product is defined while the other is not.

Do not reorder matrix multiplication without proving that the transformation preserves the intended result.

### 7.2 Matrix multiplication is associative

When dimensions are compatible:

\[
(AB)C=A(BC)
\]

This means the grouping can change without changing the mathematical result. However, the intermediate shapes and computational costs may differ.

For large workloads, choosing an efficient multiplication order can reduce computation.

## 8. Practical Implementation with NumPy

The following example demonstrates basic operations using NumPy, a common numerical computing library in Python.

```python
import numpy as np

# Vectors
a = np.array([2, 3, 4])
b = np.array([5, 1, 2])

print("Vector addition:", a + b)
print("Scalar multiplication:", 3 * a)
print("Dot product:", np.dot(a, b))

# Matrices
A = np.array([
    [1, 2, 3],
    [4, 5, 6],
])

B = np.array([
    [1, 2, 3],
    [4, 5, 6],
])

print("Matrix shape:", A.shape)
print("Transpose shape:", A.T.shape)
print("Matrix addition:\n", A + B)

# Matrix-vector multiplication
x = np.array([2, 1, 3])
y = A @ x

print("Matrix-vector result:", y)
print("Result shape:", y.shape)
```

Expected output:

```text
Vector addition: [7 4 6]
Scalar multiplication: [ 6  9 12]
Dot product: 21
Matrix shape: (2, 3)
Transpose shape: (3, 2)
Matrix addition:
 [[ 2  4  6]
  [ 8 10 12]]
Matrix-vector result: [13 31]
Result shape: (2,)
```

### Engineering notes

- `array.shape` reveals the dimensions of an array.
- `A.T` returns the transpose of a two-dimensional array.
- `np.dot(a, b)` calculates the dot product for these one-dimensional vectors.
- `@` expresses matrix multiplication or matrix-vector multiplication.
- NumPy's one-dimensional array shape `(3,)` is different from the explicit column-vector shape `(3, 1)`. This distinction matters when debugging shape errors.
- NumPy may support broadcasting for some operations. Check the library's shape rules instead of assuming every successful operation follows ordinary matrix algebra.

Prefer `@` when the intention is matrix multiplication because it makes the operation easier to recognize during code review.

## 9. Applications in AI and Machine Learning

### 9.1 Tabular datasets

A numerical dataset can be represented as a matrix:

\[
X \in \mathbb{R}^{n\times d}
\]

where:

- \(n\) is the number of observations.
- \(d\) is the number of features.
- Each row represents one observation under the common row-per-observation convention.

For example, a dataset with 1,000 observations and 20 numerical features has shape \((1000,20)\).

The shape communicates structural information before any model is trained.

### 9.2 Linear models and neural networks

A model can combine input features using weights:

\[
z=\mathbf{w}^{T}\mathbf{x}+b
\]

For a single output, the weight vector and input vector must have compatible dimensions. For multiple outputs, a weight matrix can calculate several weighted combinations at once.

Neural network layers build on this pattern, typically followed by an activation function.

### 9.3 Embeddings

An embedding represents an item, such as a word, document, or user profile, as a vector of numbers.

If two embeddings have the same dimensionality, they can be compared using a suitable similarity function. The dot product is one possible comparison, while cosine similarity adjusts for vector magnitudes.

In a retrieval system, the embedding dimensions must be compatible with the chosen similarity operation and vector database configuration.

A dimensionality mismatch is not just a mathematical inconvenience: it can indicate that incompatible models, indexes, or preprocessing pipelines have been combined.

### 9.4 Batch processing

Rather than processing one input vector at a time, systems often represent multiple inputs as a matrix and perform batched computations.

This enables numerical libraries and hardware accelerators to process many values efficiently. The exact matrix orientation depends on the library and model implementation.

## 10. Engineering Trade-offs and Production Considerations

### 10.1 Shape correctness versus implicit convenience

Broadcasting can make code concise, but it can also hide unintended dimension mismatches.

For example, adding an array of shape `(batch_size, features)` to an array of shape `(features,)` may be intentional if the latter represents one value per feature. It may be a bug if the arrays represent unrelated dimensions.

**Recommendation:** Document expected shapes at model boundaries and validate them when inputs come from external systems or dynamically constructed pipelines.

### 10.2 Mathematical validity versus business correctness

A multiplication can be mathematically valid but semantically incorrect.

Suppose a model expects features ordered as `[age, income, tenure]`, but the data pipeline supplies `[income, age, tenure]`. The shapes still match, and the multiplication executes, but the prediction can be wrong.

Validate both:

1. **Structural correctness:** dimensions, types, and compatible operations.
2. **Semantic correctness:** feature ordering, units, normalization, and intended meaning.

### 10.3 Computational cost

Matrix multiplication can become expensive as dimensions grow. Production implementations often rely on optimized numerical libraries, vectorized operations, and specialized hardware.

At this stage, focus on understanding the operations and their dimensions. Detailed complexity analysis, memory layouts, numerical stability, and hardware optimization belong to deeper engineering topics.

### 10.4 Numerical precision

Floating-point calculations are subject to rounding error. Mathematically equivalent expressions can sometimes produce slightly different numerical results because of finite precision and operation order.

For machine learning, engineers must choose numerical data types and tolerances appropriate to the workload. Exact equality checks are often inappropriate for floating-point outputs.

## 11. Common Mistakes

1. **Confusing shape with element count.** Two arrays can contain the same number of values but have different shapes and different valid operations.
2. **Assuming multiplication always means element-wise multiplication.** Matrix multiplication combines rows and columns; element-wise multiplication pairs corresponding elements.
3. **Ignoring inner dimensions.** For \(A_{m\times n}B_{p\times q}\), multiplication requires \(n=p\).
4. **Assuming matrix multiplication is commutative.** In general, \(AB\neq BA\).
5. **Treating every one-dimensional NumPy array as a column vector.** A shape of `(n,)` is not the same as `(n, 1)`.
6. **Transposing data without understanding why.** A transpose may fix an error while concealing a deeper issue in the data layout.
7. **Interpreting a large dot product as guaranteed similarity.** Vector magnitudes influence the raw dot product.
8. **Trusting a successful computation as proof of correct data.** Valid dimensions do not guarantee that features or weights are aligned semantically.
9. **Ignoring batch dimensions.** Adding a batch dimension changes array shape and may change which operations are valid.

## 12. Interview Questions

### Q1. What is the difference between a vector and a matrix?

A vector is an ordered collection of values, often represented as a one-dimensional structure or as a row or column matrix. A matrix is a two-dimensional arrangement of rows and columns.

### Q2. Why must the inner dimensions match for matrix multiplication?

Each output element is calculated from a row of the first matrix and a column of the second. Those two sequences must have equal lengths so their dot product can be calculated.

### Q3. What is the shape of the product of a \((4,3)\) matrix and a \((3,2)\) matrix?

The multiplication is valid because the inner dimensions are both \(3\). The output shape is \((4,2)\).

### Q4. How does matrix-vector multiplication appear in a neural network?

A weight matrix multiplies an input vector to produce weighted combinations. A bias vector is typically added, and an activation function may then be applied.

### Q5. Why can \(AB\) differ from \(BA\)?

Matrix multiplication depends on the order in which rows and columns are combined. Reversing the order changes those combinations and may also make the multiplication invalid.

### Q6. Why might a model produce incorrect predictions even when all matrix shapes match?

Shapes establish structural compatibility, not semantic correctness. Feature ordering, units, normalization, preprocessing, and model configuration may still be inconsistent.

### Q7. What is the difference between a dot product and cosine similarity?

The dot product combines corresponding values and sums the products. Cosine similarity divides the dot product by the product of the vectors' magnitudes, making it a measure of angular similarity for nonzero vectors.

### Q8. How would you debug a matrix dimension error in a production ML pipeline?

Inspect the shapes at each boundary, compare them with the expected contract, verify feature and batch orientation, and trace where the mismatch first appears. Avoid blindly transposing arrays until the intended representation is established.

## 13. Quick Revision

- A vector is an ordered collection of values; a matrix is a rectangular arrangement of values.
- Shape describes dimensions and determines operation compatibility.
- Vector addition and matrix addition operate element by element and require matching shapes under ordinary definitions.
- Scalar multiplication scales each element.
- The dot product combines two equal-length vectors into a scalar.
- Transpose exchanges rows and columns.
- Matrix multiplication requires matching inner dimensions.
- Matrix-vector multiplication is a core operation in linear models and neural networks.
- The identity matrix preserves a compatible vector or matrix under multiplication.
- A mathematically valid operation can still be semantically wrong if the data is incorrectly arranged.

## 14. Key Takeaways

The central skill in this chapter is not memorizing formulas. It is learning to **reason about numerical structure before performing an operation**.

When working with vectors and matrices:

1. Identify what each structure represents.
2. Inspect its shape.
3. Determine whether the operation is mathematically valid.
4. Calculate or verify the output shape.
5. Confirm that the result preserves the intended meaning of the data.

These habits form the foundation for understanding neural network layers, embedding similarity, attention calculations, and many other AI operations.

## 15. Further Reading

- [Linear Algebra Foundations](05-Linear-Algebra-Foundations.md) — conceptual foundations, linear combinations, span, basis, and transformations.
- [Optimization and Calculus Intuition](07-Optimization-and-Calculus-Intuition.md) — gradients and optimization intuition.
- [AIF-04: Deep Learning Foundations](../AIF-04-Deep-Learning-Foundations/README.md) — planned connection to neural network computation.
- [AIF-05: Representation Learning](../AIF-05-Representation-Learning/README.md) — planned connection to embeddings and vector representations.
- [AIF-07: Transformer Foundations](../AIF-07-Transformer-Foundations/README.md) — planned connection to transformer computation.

**Source and link limitation:** The authoritative detailed AIF-wide hierarchy was not available for independent comparison, and live repository paths have not been inspected. Cross-links follow the approved proposed structure and should be verified against the repository before merging.

---

**End of Chapter 06 — Vectors, Matrices and Operations**
