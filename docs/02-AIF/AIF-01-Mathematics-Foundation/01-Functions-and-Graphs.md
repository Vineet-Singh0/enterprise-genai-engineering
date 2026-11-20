# 01 — Functions and Graphs

## 1. Learning Objectives

By the end of this chapter, you should be able to:

- Explain what a mathematical function represents and why functions are useful.
- Identify inputs, outputs, domain, and range.
- Distinguish independent and dependent variables.
- Read and evaluate function notation.
- Interpret common function shapes and their behavior.
- Understand graphs as visual representations of relationships.
- Distinguish linear and nonlinear relationships.
- Explain how changes in an input affect the corresponding output.
- Recognize how functions are used to describe simple AI/ML relationships.

The goal is not to memorize a catalog of mathematical functions. It is to understand how functions describe relationships between quantities.

## 2. Prerequisites

You should be familiar with:

- Basic arithmetic.
- Positive and negative numbers.
- Simple equations.
- Variables such as `x` and `y`.
- Reading basic tables of numbers.

No formal calculus or advanced algebra is required.

## 3. Estimated Reading Time

**25–35 minutes**, excluding independent practice.

## 4. Before We Start

Consider a simple question:

If a taxi charges ₹50 as a fixed fee and ₹15 for every kilometre travelled, how can we calculate the total fare for any distance?

We could calculate each case separately.

| Distance | Calculation | Total fare |
|---:|---|---:|
| 1 km | ₹50 + ₹15 × 1 | ₹65 |
| 2 km | ₹50 + ₹15 × 2 | ₹80 |
| 5 km | ₹50 + ₹15 × 5 | ₹125 |
| 10 km | ₹50 + ₹15 × 10 | ₹200 |

But what if the distance is 17 km? What if we need to calculate a thousand different distances?

We need a reusable rule that converts a distance into a fare.

Let \(x\) represent the distance in kilometres and \(f(x)\) represent the fare in rupees.

We can express the relationship as:

\[
f(x)=50+15x
\]

Now the fare for any valid distance can be calculated by substituting the distance into the expression.

For 17 km:

\[
f(17)=50+15(17)=305
\]

The total fare is ₹305.

This is the central idea of a mathematical function: **a rule that maps an allowed input to exactly one output.**

The same idea appears throughout AI/ML engineering. A mathematical expression can describe a relationship between inputs and outputs, a transformation of data, or an objective that an algorithm tries to improve.

## 5. Why Functions Exist

### 5.1 The problem of describing relationships

Many real-world problems involve quantities that change together.

Examples include:

- Distance and travel cost.
- Time and distance travelled.
- Product price and quantity purchased.
- Input features and a model's numerical output.
- A parameter and the value of an objective function.

Without a reusable rule, we might need to store or calculate every possible input-output pair separately.

A function gives us a compact way to represent the relationship.

Instead of storing every taxi fare, we can store one rule:

\[
f(x)=50+15x
\]

The rule can then be evaluated whenever a new input is provided.

### 5.2 Functions are more than formulas

A function does not have to be written as a familiar algebraic expression.

It may be represented by:

- A formula.
- A table of input-output pairs.
- A graph.
- A piecewise rule, where different inputs use different rules.
- A computational procedure that produces one output for each valid input.

These are different representations of a relationship. The underlying idea remains the same.

For example, a function could return the square of a number, the temperature predicted by a model, or the output of a transformation.

A graph makes the relationship easier to inspect visually. A formula makes it easier to calculate outputs directly. A table makes selected input-output pairs easy to compare.

Each representation has strengths and limitations.

## 6. Understanding a Mathematical Function

### 6.1 Inputs, outputs, and the mapping rule

A function can be understood through three components:

1. **Input:** The value supplied to the function.
2. **Rule:** The operation that determines the output.
3. **Output:** The value produced by applying the rule.

For example:

\[
f(x)=2x+3
\]

Here:

- \(x\) is the input.
- The rule is to multiply the input by 2 and add 3.
- \(f(x)\) is the output.

For an input of 4:

\[
f(4)=2(4)+3=11
\]

The function maps the input 4 to the output 11.

A useful mental model is a mathematical machine:

```text
Input
  |
  v
+----------------------+
| Function: 2x + 3     |
| Multiply by 2        |
| Add 3                |
+----------------------+
  |
  v
Output
```

The machine analogy helps us understand the input-output relationship. However, a mathematical function is defined by its mapping rule and valid inputs, not by any particular physical or software implementation.

### 6.2 The defining property of a function

For every valid input, a function must produce exactly one output.

Consider these mappings:

```text
Function A:
1 -> 3
2 -> 5
3 -> 7

Function B:
1 -> 3
1 -> 4
2 -> 5
```

Function A satisfies the function requirement: every input has one output.

Function B does not define a function from the displayed input set to the displayed outputs because the same input, 1, is assigned two different outputs.

Different inputs are allowed to produce the same output.

For example:

\[
f(x)=x^2
\]

Both \(f(2)=4\) and \(f(-2)=4\).

That is valid because each input still produces exactly one output.

This distinction is important: a function does not need to produce unique outputs. It must produce one unambiguous output for each valid input.

### 6.3 Domain and range

Two important terms describe which inputs and outputs are involved.

**Domain:** The set of allowed inputs.

**Range:** The set of outputs that the function actually produces for those allowed inputs.

Consider:

\[
f(x)=x^2
\]

If the domain is all real numbers, the input may be positive, negative, or zero.

However, squaring a real number never produces a negative result.

Therefore:

- Domain: all real numbers.
- Range: all real numbers greater than or equal to zero.

We can write this as:

\[
\text{Domain}=\mathbb{R}
\]

\[
\text{Range}=[0,\infty)
\]

Here, \(\mathbb{R}\) represents the real numbers.

The square brackets indicate that zero is included in the range.

The range depends on the allowed inputs. If we restrict the domain of \(f(x)=x^2\) to the interval \([0,3]\), the range becomes \([0,9]\).

This illustrates an important principle: **a function's formula alone does not always determine its domain and range; the input restrictions matter too.**

#### Practical example: A temperature conversion function

Consider the conversion from Celsius to Fahrenheit:

\[
F(C)=\frac{9}{5}C+32
\]

Here:

- \(C\) is the temperature in degrees Celsius.
- \(F(C)\) is the temperature in degrees Fahrenheit.

If we restrict the input to temperatures between 0°C and 100°C, the output ranges from 32°F to 212°F.

The conversion formula itself can accept other real-number inputs as well. The chosen domain depends on the purpose of the application, not merely the formula.

### 6.4 Independent and dependent variables

An **independent variable** is the input whose value we choose or examine.

A **dependent variable** is the output whose value depends on that input through the function.

For the taxi example:

\[
f(x)=50+15x
\]

- \(x\), the distance, is the independent variable.
- \(f(x)\), the fare, is the dependent variable.

Changing the distance changes the fare.

The terms describe the relationship being modeled. In real-world experiments, whether a variable is truly independent may also depend on how the data was collected or how the experiment was designed.

### 6.5 Function notation

Function notation is a compact way to name a relationship and specify its input.

Consider:

\[
f(x)=3x+2
\]

This means that the function named \(f\) takes an input \(x\) and returns \(3x+2\).

To evaluate it at \(x=5\):

\[
f(5)=3(5)+2=17
\]

The notation \(f(5)\) means the output when the input is 5. It does not mean \(f\) multiplied by 5.

Functions can have different names:

\[
g(x)=x^2+1
\]

\[
h(x)=10-x
\]

The names \(f\), \(g\), and \(h\) identify different functions. They do not change the meaning of the input-output relationship.

#### Worked example: Evaluate a function

Given:

\[
g(x)=x^2+2x
\]

Find \(g(3)\).

**Step 1:** Replace every occurrence of \(x\) with 3.

\[
g(3)=3^2+2(3)
\]

**Step 2:** Calculate the square.

\[
g(3)=9+6
\]

**Step 3:** Add the terms.

\[
g(3)=15
\]

The output is 15.

A common error is to write \(g(3)=3^2+2\), forgetting to substitute the input into every occurrence of \(x\).

## 7. Common Function Shapes and Their Interpretation

Different function shapes represent different kinds of relationships. Recognizing a shape helps us understand how the output changes as the input changes.

This section covers a small set of useful examples, not every mathematical function family.

### 7.1 Constant functions

A constant function produces the same output for every input in its domain.

\[
f(x)=5
\]

Examples:

| Input \(x\) | Output \(f(x)\) |
|---:|---:|
| -2 | 5 |
| 0 | 5 |
| 1 | 5 |
| 4 | 5 |

The output does not change when the input changes.

Its graph is a horizontal line at \(y=5\).

A constant function is useful for representing a fixed value or baseline that does not depend on the input.

### 7.2 Linear functions

A linear function in the form used throughout this chapter can be written as:

\[
f(x)=mx+b
\]

where:

- \(m\) is the slope.
- \(b\) is the output when \(x=0\).

The slope describes how much the output changes for each one-unit increase in the input.

For example:

\[
f(x)=2x+1
\]

| Input \(x\) | Output \(f(x)\) |
|---:|---:|
| 0 | 1 |
| 1 | 3 |
| 2 | 5 |
| 3 | 7 |

Every time the input increases by 1, the output increases by 2.

The graph is a straight line.

A positive slope means the output increases as the input increases. A negative slope means the output decreases as the input increases. A zero slope gives a constant function.

The slope and intercept have practical meanings in many simple models. In the taxi example, the slope represents the charge per kilometre, while the intercept represents the fixed fee.

### 7.3 Quadratic functions

A common quadratic function has the form:

\[
f(x)=ax^2+bx+c,\qquad a\ne0
\]

A simple example is:

\[
f(x)=x^2
\]

| Input \(x\) | Output \(f(x)\) |
|---:|---:|
| -3 | 9 |
| -2 | 4 |
| -1 | 1 |
| 0 | 0 |
| 1 | 1 |
| 2 | 4 |
| 3 | 9 |

Unlike a linear function, the output does not change by a constant amount for every one-unit increase in the input.

The graph of \(x^2\) is a U-shaped curve called a parabola.

The function is symmetric around the vertical axis \(x=0\). Positive and negative inputs with the same magnitude produce the same output.

Quadratic functions provide a useful example of a nonlinear relationship.

### 7.4 Exponential functions

An exponential function can be expressed as:

\[
f(x)=a^x
\]

for a positive base \(a\), with \(a\ne1\).

For example:

\[
f(x)=2^x
\]

| Input \(x\) | Output \(f(x)\) |
|---:|---:|
| 0 | 1 |
| 1 | 2 |
| 2 | 4 |
| 3 | 8 |
| 4 | 16 |

The output doubles each time the input increases by 1.

For a base greater than 1, the function grows as the input increases. For a base between 0 and 1, it decreases as the input increases.

Exponential functions are useful for representing relationships involving repeated multiplication. Their behavior differs from linear growth, where equal increases in the input produce equal absolute changes in the output.

The detailed rules for exponents and logarithms belong to [Chapter 02 — Algebra, Exponents and Logarithms](02-Algebra-Exponents-and-Logarithms.md).

### 7.5 Comparing the shapes

| Function type | Example | Typical behavior |
|---|---|---|
| Constant | \(f(x)=5\) | Output remains unchanged. |
| Linear | \(f(x)=2x+1\) | Output changes at a constant rate. |
| Quadratic | \(f(x)=x^2\) | Output changes nonlinearly and forms a parabola. |
| Exponential | \(f(x)=2^x\) | Output is multiplied by a constant factor for each unit increase in the input. |

The most important skill is not identifying every possible formula. It is understanding the behavior the formula represents.

## 8. Graphs as Representations of Relationships

### 8.1 What does a graph show?

A graph makes a relationship between an input and an output visible.

For a function \(y=f(x)\):

- The horizontal axis represents the input \(x\).
- The vertical axis represents the output \(y\).
- Each plotted point represents an input-output pair \((x,y)\).

For example, the function \(y=2x+1\) includes the points:

\[
(0,1),\quad (1,3),\quad (2,5)
\]

Plotting these points and connecting them produces a straight line.

The graph lets us inspect how the output changes without calculating every possible value separately.

### 8.2 Reading a graph

When interpreting a function graph, ask:

1. What quantity is represented on each axis?
2. What inputs are allowed?
3. What outputs are possible?
4. Does the output increase, decrease, or remain constant?
5. Does the output change at a constant rate?
6. Are there any restrictions or important boundaries?

These questions help turn a graph from a picture into a description of mathematical behavior.

### 8.3 The vertical-line test

A graph represents a function of \(x\) only if every vertical line intersects the graph at most once.

Why?

A vertical line fixes one value of \(x\). If it intersects the graph at two different points, the same input would correspond to two different outputs, violating the function requirement.

For example, a circle generally fails this test when treated as \(y\) as a function of \(x\). At many horizontal positions, a vertical line intersects the circle at two points.

This test is a useful visual tool, although the formal definition of a function is based on its mapping between inputs and outputs.

### 8.4 Discrete and continuous inputs

Not every function uses a continuous range of inputs.

A **discrete domain** contains separate allowed values, such as the integers representing the number of items purchased.

A **continuous domain** may contain every real number within an interval, such as the distance travelled.

The distinction matters when drawing graphs.

For a discrete function, plotting isolated points may be more appropriate than connecting them. For a continuous relationship, a curve or line may communicate the behavior more naturally.

Connecting points implies that intermediate values are meaningful under the model. Do not connect them automatically without considering the domain.

## 9. Linear and Nonlinear Relationships

### 9.1 Linear relationships

A linear relationship has a constant rate of change.

Consider:

\[
f(x)=4x+2
\]

When \(x\) increases by 1, \(f(x)\) increases by 4.

When \(x\) increases by 3, \(f(x)\) increases by 12.

The output change is proportional to the input change, with a fixed slope.

This predictability makes linear relationships easy to interpret.

### 9.2 Nonlinear relationships

A nonlinear relationship does not maintain the same rate of change across its domain.

Consider:

\[
f(x)=x^2
\]

| Input change | Output change |
|---|---:|
| 0 to 1 | 1 |
| 1 to 2 | 3 |
| 2 to 3 | 5 |
| 3 to 4 | 7 |

Each input change is 1, but the output changes are different.

The graph curves instead of forming a straight line.

Nonlinear behavior can represent more complex relationships, but interpreting it often requires more care because the effect of an input change depends on where we are in the function's domain.

### 9.3 Why this distinction matters

Suppose an engineer is examining how an input quantity relates to a system's output.

If the relationship is approximately linear, a fixed rate of change may provide a useful description.

If the relationship is nonlinear, a single fixed rate may be misleading.

This does not mean nonlinear relationships are always more accurate or that linear relationships are always simple in practice. The appropriate model depends on the problem, data, assumptions, and intended use.

Detailed ML model selection and evaluation belong to [AIF-03 — Machine Learning Foundations](../README.md).

## 10. Understanding How Input Changes Affect Output

A function is not only a way to calculate an output. It also helps us reason about the effect of changing an input.

Consider:

\[
f(x)=3x+2
\]

For \(x=2\):

\[
f(2)=8
\]

For \(x=5\):

\[
f(5)=17
\]

The input increases by 3, while the output increases by 9.

The relationship can be summarized as:

\[
\Delta x=5-2=3
\]

\[
\Delta f=f(5)-f(2)=17-8=9
\]

Here, \(\Delta\) means the change between two values.

For this linear function, the output change is three times the input change because the slope is 3.

Now consider:

\[
g(x)=x^2
\]

For \(x=2\), the output is 4.

For \(x=5\), the output is 25.

The input again increases by 3, but the output increases by 21.

The change depends on the starting point and the size of the input change.

This is a key difference between constant-rate and nonlinear relationships.

### A practical interpretation

Imagine an application that estimates a numerical score from one input feature.

A function helps answer questions such as:

- What output does the system produce for this input?
- How does the output change when the input increases?
- Is the change constant or variable?
- Are there input values the model should not accept?
- Does the relationship behave as expected within the intended operating range?

These are useful questions when inspecting mathematical expressions and model behavior.

They do not, by themselves, establish that a model is accurate, fair, or suitable for production. Those questions require additional evaluation beyond this chapter.

## 11. Functions in AI/ML Engineering

Functions provide a shared mathematical language for expressing relationships used throughout AI/ML.

### 11.1 Representing an input-output relationship

Suppose a simple model maps an input feature \(x\) to a numerical prediction:

\[
\hat{y}=f(x)
\]

Here:

- \(x\) is the input.
- \(f\) is the mapping rule.
- \(\hat{y}\) is the predicted output.

The symbol \(\hat{y}\), read as "y-hat," commonly represents a prediction or estimate.

The expression does not specify how the function was created. It simply states that the prediction is produced by applying a function to an input.

In a real system, the function might be a simple formula, a collection of computational operations, or a trained model.

### 11.2 A simple numerical example

Suppose a hypothetical model estimates delivery cost using distance alone:

\[
\hat{y}=20+8x
\]

where:

- \(x\) is the distance in kilometres.
- \(\hat{y}\) is the estimated cost in the chosen currency.

For a distance of 5 km:

\[
\hat{y}=20+8(5)=60
\]

The predicted cost is 60 currency units.

This example demonstrates how a function represents a prediction rule. It does not claim that real delivery costs always follow a linear relationship or that this formula is a trained ML model.

### 11.3 Functions and transformations

An input can be transformed into another representation through a function.

For example:

\[
f(x)=x^2
\]

maps an input number to its square.

Similarly, a system may apply mathematical transformations to numerical data before using it elsewhere.

Understanding the function's domain, range, and behavior helps us reason about whether the transformation accepts the intended inputs and produces plausible outputs.

More specialized vector and matrix transformations are covered in [Chapter 05 — Linear Algebra Foundations](05-Linear-Algebra-Foundations.md) and [Chapter 06 — Vectors, Matrices and Operations](06-Vectors-Matrices-and-Operations.md).

### 11.4 What functions do not tell us

Knowing the function's formula does not automatically tell us:

- Whether its predictions match reality.
- Whether it generalizes to unseen data.
- Whether its inputs are appropriate.
- Whether its outputs are reliable.
- Whether its behavior is acceptable in every operating condition.

A mathematical function describes a mapping. The quality and suitability of a model require additional evidence and evaluation.

## 12. Engineering Decisions and Trade-offs

When using functions to describe a system, consider the following.

### 12.1 Choosing a useful representation

A formula is convenient when we need to calculate outputs repeatedly.

A table is useful when we need to inspect specific examples.

A graph is useful when we need to understand the overall shape and behavior.

These representations can complement one another. None is automatically best for every task.

### 12.2 Understanding domain restrictions

A formula may produce a numerical result for an input that is invalid for the intended application.

For example, a formula for the cost of purchasing items may accept a negative quantity mathematically, even though a normal purchase cannot contain a negative number of items.

The mathematical expression and the application's input validation rules are separate concerns.

Engineers must identify the intended domain and enforce relevant constraints where necessary.

### 12.3 Interpreting outputs in context

A function can be mathematically correct but inappropriate for a particular problem.

For example, a linear cost formula may be useful over a limited operating range but become unrealistic when extended far beyond that range.

Before using a function, understand:

- What the inputs represent.
- What the outputs represent.
- Which assumptions define the relationship.
- Which input values are meaningful.
- Where the relationship may stop being useful.

### 12.4 Avoiding unnecessary complexity

A more complicated mathematical expression is not automatically a better model.

Start with a clear understanding of the relationship being represented. Introduce more complexity only when it is justified by the problem and available evidence.

Detailed model selection and evaluation are outside this chapter's scope.

## 13. Common Mistakes and Misconceptions

### Mistake 1: Assuming every relationship is a function

Not every relation satisfies the function requirement.

If one input is assigned multiple different outputs, the mapping is not a function under the stated definition.

**Correction:** Check whether every allowed input has exactly one output.

### Mistake 2: Assuming different inputs must have different outputs

A function can map several inputs to the same output.

For example:

\[
f(x)=x^2
\]

Both 2 and -2 map to 4.

**Correction:** Uniqueness applies to the output for each input, not to outputs across different inputs.

### Mistake 3: Confusing domain with range

The domain describes allowed inputs. The range describes outputs the function actually produces.

**Correction:** Identify the input set first, then determine the corresponding outputs.

### Mistake 4: Treating function notation as multiplication

The expression \(f(3)\) represents the output for input 3. It does not mean \(f\) multiplied by 3.

**Correction:** Read function notation as "the value returned by the function at this input."

### Mistake 5: Assuming every graph should be a straight line

Straight lines represent linear relationships, but many functions have curved or other shapes.

**Correction:** Inspect how the output changes as the input changes.

### Mistake 6: Assuming equal input changes always produce equal output changes

This is true for linear functions with a constant slope, but not for every function.

**Correction:** Compare output changes over different intervals.

### Mistake 7: Connecting every plotted point

A graph should reflect the function's domain. Connecting discrete points can imply that intermediate inputs are allowed when they are not.

**Correction:** Determine whether the domain is discrete or continuous before choosing how to draw the graph.

### Mistake 8: Assuming a mathematical formula is automatically a valid real-world model

A formula may ignore important constraints or rely on assumptions that hold only over a limited range.

**Correction:** Separate mathematical validity from real-world suitability.

## 14. Interview Questions with Expected Answers

### Question 1: What is a mathematical function?

**Expected answer:** A function maps every allowed input to exactly one output. It can be represented using a formula, table, graph, or computational rule.

### Question 2: What is the difference between domain and range?

**Expected answer:** The domain is the set of allowed inputs. The range is the set of outputs the function produces for those inputs.

### Question 3: Can two different inputs produce the same output?

**Expected answer:** Yes. For example, \(f(x)=x^2\) maps both 2 and -2 to 4. A function requires one output per input, not a unique output for every input.

### Question 4: What does \(f(4)\) mean?

**Expected answer:** It means the output of function \(f\) when its input is 4. It is not function multiplication.

### Question 5: How does a linear relationship differ from a nonlinear relationship?

**Expected answer:** A linear relationship has a constant rate of change and a straight-line graph. A nonlinear relationship does not maintain a constant rate of change across its domain.

### Question 6: Why are graphs useful if we already have formulas?

**Expected answer:** Graphs make patterns, trends, direction of change, and the overall shape of a relationship easier to inspect. Formulas and graphs provide complementary views.

### Question 7: Can a mathematically valid function be unsuitable for a real-world application?

**Expected answer:** Yes. The formula may accept invalid inputs, violate real-world constraints, or represent the relationship poorly outside its intended range.

### Question 8: A system maps an input \(x\) to a predicted value \(\hat{y}=f(x)\). What does this expression tell us, and what does it not tell us?

**Expected answer:** It tells us that the prediction is obtained by applying a function to the input. It does not establish how the function was constructed, whether the prediction is accurate, or whether the system is suitable for production.

## 15. Quick Revision

- A function maps every allowed input to exactly one output.
- The domain is the set of allowed inputs; the range is the set of outputs produced.
- Function notation such as \(f(3)\) means the output for input 3.
- A graph visualizes the relationship between inputs and outputs.
- A constant function has an unchanged output.
- A linear function has a constant rate of change.
- A nonlinear function does not maintain a constant rate of change across its domain.
- Domain restrictions matter when interpreting a mathematical expression.
- Functions can represent predictions and transformations in AI/ML, but a mapping alone does not establish model quality.

## 16. Key Takeaways

1. **A function is a mapping rule.** Its defining property is one output for each allowed input.
2. **Domain and range describe the boundaries of a relationship.** Always understand the permitted inputs before interpreting the outputs.
3. **Graphs reveal behavior.** They help us see whether a relationship is constant, linear, or nonlinear.
4. **Input changes affect outputs according to the function.** A constant input change does not necessarily produce a constant output change.
5. **Mathematical correctness is not the same as real-world suitability.** A function's assumptions and operating range matter.
6. **Functions are foundational to AI/ML reasoning.** They provide a common way to describe predictions, transformations, and mathematical relationships.

## 17. Further Reading

The following chapters continue the mathematical progression:

- [02 — Algebra, Exponents and Logarithms](02-Algebra-Exponents-and-Logarithms.md): Manipulating expressions and understanding exponential and logarithmic relationships.
- [05 — Linear Algebra Foundations](05-Linear-Algebra-Foundations.md): Understanding mathematical objects and transformations.
- [06 — Vectors, Matrices and Operations](06-Vectors-Matrices-and-Operations.md): Applying vector and matrix operations.
- [07 — Optimization and Calculus Intuition](07-Optimization-and-Calculus-Intuition.md): Understanding rates of change and optimization foundations.

For the complete learning path, return to the [AIF-01 Mathematics Foundation README](README.md).
