# Agent Task Success and Behavioral Evaluation

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain why evaluating agents is different from evaluating a conventional deterministic program.
- Define task success in terms of explicit requirements and expected outcomes.
- Distinguish functional correctness from behavioral correctness.
- Explain the difference between outcome-based and behavior-based evaluation.
- Identify appropriate evaluation dimensions for an agent task.
- Define acceptance and success criteria before evaluating an agent.
- Distinguish complete success, partial success, and failure.
- Classify failures without prematurely assuming their root cause.
- Understand when pass/fail evaluation is sufficient and when graded evaluation is more useful.
- Distinguish qualitative and quantitative evaluation.
- Understand deterministic and non-deterministic evaluation considerations.
- Design evaluation criteria that are observable and meaningful.
- Explain the basic requirements of a well-designed evaluator.
- Distinguish available evidence from sufficient evidence.
- Recognize common mistakes in agent evaluation design.

---

## Prerequisites

You should be familiar with:

- Agent runtime behavior and bounded autonomy from **AGT-02**
- Tool usage and execution from **AGT-03**
- State, context, and memory from **AGT-04**
- Verification and critique from **AGT-05**

You do not need to re-learn the architecture of those systems here.

AGT-10 evaluates the behavior produced by those systems.

---

## Estimated Reading Time

**~45–60 minutes**

---

## Before We Start

Consider an agent that handles customer support requests.

A customer asks:

> “My order was delivered to the wrong address. Please help me get it corrected.”

The agent eventually responds:

> “Your order has been redirected and a replacement will arrive tomorrow.”

At first glance, the response appears successful.

But suppose the agent:

1. accessed the wrong customer's order,
2. changed an address without authorization,
3. skipped a required approval,
4. made several unnecessary tool calls,
5. exposed private information,
6. and happened to produce the correct final answer.

Should this execution be considered successful?

The answer depends on what the system is required to do.

This illustrates the central problem of agent evaluation:

> **A good final answer does not necessarily mean the agent behaved correctly.**

Conversely, an agent may produce an imperfect final answer while following the required process correctly and encountering an external dependency failure.

Therefore, evaluating an agent requires more than asking:

> “Was the final answer correct?”

We need to define **what success means**, **what behavior is acceptable**, and **what evidence is sufficient to judge that behavior**.

---

## Why Agent Evaluation Is Difficult

Traditional software often has relatively explicit correctness conditions.

For example:

```text
Input
  ↓
Program
  ↓
Expected Output
```

If a function receives:

```text
2 + 3
```

and returns:

```text
5
```

the expected behavior can be defined precisely.

An agent is different.

A simplified agent execution may look like:

```text
User Request
     ↓
Interpret Request
     ↓
Decide What To Do
     ↓
Select Action
     ↓
Use Tool
     ↓
Observe Result
     ↓
Update Understanding
     ↓
Choose Next Action
     ↓
Continue / Stop
     ↓
Final Result
```

There may be multiple valid ways to solve the same task.

The agent may also encounter:

- incomplete information
- ambiguous requests
- changing external data
- tool failures
- unexpected observations
- multiple possible plans
- partial completion
- non-deterministic model behavior

Therefore:

> **Agent evaluation must define acceptable behavior rather than assuming there is always one correct execution path.**

---

# 1. What Does It Mean for an Agent to Succeed?

The first evaluation question should be:

> **What was the agent supposed to accomplish?**

This sounds simple, but poorly defined success criteria create unreliable evaluations.

Consider:

> “Help the user book a flight.”

This is not yet a sufficient evaluation criterion.

We need to clarify what successful completion means.

For example:

```text
Task:
Book a flight from Bengaluru to Delhi.

Requirements:
- Correct origin
- Correct destination
- Correct travel date
- Correct passenger
- Selected flight must satisfy user constraints
- Purchase must not occur without required confirmation

Success:
The requested flight is identified and the booking is completed
within the permitted constraints.
```

The evaluation criteria should come from the **requirements of the task**, not from what the evaluator happens to prefer.

---

# 2. Expected Outcome

An expected outcome describes what the task should accomplish.

Examples:

- retrieve the correct account information
- produce a valid summary
- identify the correct product
- complete a permitted transaction
- generate a correct analysis
- provide an answer satisfying explicit constraints
- escalate when the task cannot safely be completed

The expected outcome should be observable.

For example:

```text
Weak:
"Agent should be helpful."

Stronger:
"Agent should identify the user's three requested products
and compare them using price, availability, and stated preferences."
```

The stronger criterion gives the evaluator something concrete to assess.

---

# 3. Functional Correctness

**Functional correctness** asks:

> **Did the agent produce the required result?**

For example:

```text
Task:
Calculate the total cost of three items.

Expected:
₹1,500

Agent:
₹1,500

Functional result:
Pass
```

Functional correctness focuses primarily on the required outcome.

Examples include:

- correct answer
- correct record retrieved
- correct file generated
- correct transaction completed
- correct information returned
- required task completed

Functional correctness is important, but it may not be sufficient for agent evaluation.

---

# 4. Behavioral Correctness

**Behavioral correctness** asks:

> **Did the agent behave appropriately while producing the result?**

Suppose an agent is asked to update a customer's address.

The required behavior may include:

```text
1. Identify the correct customer.
2. Verify authorization.
3. Update only the requested field.
4. Avoid modifying unrelated information.
5. Confirm the change.
```

An agent that updates the correct address by bypassing authorization may produce the desired final state but still fail behavioral evaluation.

Therefore:

```text
Functional Correctness
        +
Behavioral Correctness
        =
More Complete Agent Evaluation
```

The two dimensions answer different questions.

---

# 5. Outcome-Based vs Behavior-Based Evaluation

These are complementary evaluation approaches.

## Outcome-Based Evaluation

Outcome-based evaluation asks:

> **Did the task produce the required result?**

Example:

```text
Expected:
Customer's subscription is cancelled.

Observed:
Customer's subscription is cancelled.

Outcome:
Pass
```

This is often appropriate when the outcome is the primary requirement and the execution path has limited constraints.

---

## Behavior-Based Evaluation

Behavior-based evaluation asks:

> **Did the agent behave according to the required conditions while completing the task?**

Example:

```text
Required:
- Verify customer identity
- Use authorized cancellation process
- Do not expose billing information
- Ask for confirmation before irreversible action

Observed:
- Identity verified
- Correct process used
- No information exposed
- Confirmation obtained

Behavior:
Acceptable
```

Behavior-based evaluation becomes especially important when the execution process itself matters.

---

## Why Both May Be Necessary

Consider two agents.

### Agent A

```text
Correct outcome
Incorrect behavior
```

### Agent B

```text
Incorrect outcome
Appropriate behavior
```

These should not automatically receive the same evaluation.

Agent A may have achieved the correct result accidentally or through an unacceptable action.

Agent B may have followed the required process but encountered an external failure.

Therefore, evaluation should distinguish:

```text
Outcome
   +
Behavior
```

rather than collapsing everything into a single final-answer judgment.

---

# 6. A Correct Final Answer Can Hide Incorrect Behavior

This is one of the most important ideas in AGT-10.

Suppose a research agent is asked:

> “Find the latest revenue figure for Company X.”

The agent returns the correct number.

However, it obtained the number from an unauthorized source that should not have been accessed.

The final answer may be correct.

The behavior is not necessarily acceptable.

Similarly:

```text
Correct Answer
      ≠
Correct Execution
```

A lucky outcome does not automatically prove that the agent behaved correctly.

This does not mean every internal action must always be inspected. The required evaluation depth depends on the properties and risks that matter for the task.

---

# 7. Do We Always Need to Evaluate Every Internal Step?

No.

This is an important evaluation design principle.

It would be incorrect to conclude:

> “Every internal step of every agent must always be evaluated.”

Evaluation depth should match:

- system requirements
- task characteristics
- risk
- consequences of failure
- required constraints
- available evidence

For a low-risk question-answering system, final outcome evaluation may be sufficient for many tasks.

For an agent performing high-impact actions, additional behavioral evaluation may be necessary.

Therefore:

```text
Evaluation Depth
       ↓
Driven by Requirements + Risk
```

Not every system needs the same evaluation strategy.

---

# 8. Evaluation Dimensions

A single evaluation dimension rarely captures the full behavior of an agent.

Possible dimensions include:

### Task Success

Did the agent accomplish the requested task?

### Correctness

Was the produced information or result correct?

### Completeness

Did the agent satisfy all required parts of the task?

### Relevance

Did the result address the actual request?

### Constraint Adherence

Did the agent respect explicit requirements and restrictions?

### Tool-Use Correctness

Did the agent use tools appropriately?

### Planning Quality

Was the approach aligned with the task requirements?

### State Correctness

Did the agent maintain appropriate state during execution?

### Policy Adherence

Did the agent remain within defined behavioral or policy constraints?

### Efficiency

Did the agent avoid unnecessary actions where efficiency matters?

### Termination Behavior

Did the agent stop appropriately?

### Recovery Behavior

Did the agent respond appropriately when something went wrong?

These are possible evaluation dimensions, not a mandatory checklist.

> **Evaluation dimensions should be derived from system requirements.**

Detailed evaluation of trajectories, tool calls, planning behavior, state transitions, context, and memory belongs primarily to **File 02**.

The underlying architecture and mechanics of those capabilities remain owned by their respective AGT chapters. AGT-10 owns the systematic measurement of their observable behavior.

---

## 9. Acceptance Criteria

Acceptance criteria define the conditions under which an execution is considered acceptable.

Consider:

> “Generate a customer report.”

Weak acceptance criterion:

> “The report should be good.”

Better acceptance criteria:

```text
The report must:
- contain the requested customer
- include the requested date range
- contain total sales
- contain total refunds
- exclude unrelated customers
- clearly identify the reporting period
```

Now the evaluator has explicit properties to check.

Acceptance criteria should be:

- relevant
- observable
- specific enough to evaluate
- connected to the task requirement
- appropriate to the risk

---

# 10. Success Criteria vs Preferences

Not every desirable property should become a hard failure condition.

Suppose two valid reports use different formatting.

One uses:

```text
Table → Summary → Recommendations
```

Another uses:

```text
Summary → Table → Recommendations
```

If both satisfy the requirements, formatting preference should not automatically determine success.

This distinction matters:

```text
Requirement
    ↓
Must be satisfied

Preference
    ↓
May improve quality but may not define failure
```

A good evaluator should avoid converting subjective preferences into artificial correctness requirements.

---

# 11. Partial Success

Agent tasks are not always binary.

An agent may complete some required components and fail others.

Consider:

```text
Task:
1. Find three suitable products.
2. Compare prices.
3. Recommend one.
```

Observed:

```text
1. Three products found       ✓
2. Prices correctly compared  ✓
3. Recommendation incorrect   ✗
```

This is not equivalent to:

```text
0/3 completed
```

A graded evaluation may represent this difference.

Possible classification:

```text
Complete Success
Partial Success
Failure
```

The exact grading scheme should be determined by task requirements.

---

# 12. Pass/Fail Evaluation

Pass/fail evaluation is useful when requirements are clear and binary.

Example:

```text
Requirement:
Do not execute a purchase without user confirmation.

Observed:
Purchase executed without confirmation.

Result:
FAIL
```

Advantages:

- simple
- easy to interpret
- useful for hard requirements
- useful for release gates

Limitations:

- may hide degrees of quality
- may treat very different failures equally
- may be too coarse for complex tasks

Pass/fail should therefore be used when its resolution matches the decision being made.

---

# 13. Graded Evaluation

Graded evaluation allows multiple levels of performance.

For example:

```text
4 — Fully successful
3 — Mostly successful
2 — Partially successful
1 — Mostly unsuccessful
0 — Failed
```

The exact scale is less important than whether the categories have clear meanings.

A grading rubric should define what separates one level from another.

For example:

```text
4:
All required outcomes satisfied and no critical
constraint violations.

3:
Primary outcome satisfied with a minor non-critical issue.

2:
Partial completion with one or more important deficiencies.

1:
Limited useful completion.

0:
Task failed or produced unacceptable behavior.
```

A graded system can provide more information than simple pass/fail, but it also requires more careful rubric design.

---

# 14. Qualitative vs Quantitative Evaluation

Evaluation can be qualitative or quantitative.

## Qualitative Evaluation

Qualitative evaluation describes behavior using judgments or categories.

Examples:

- acceptable
- partially acceptable
- irrelevant
- incomplete
- unsafe behavior
- unnecessary action

This can be useful when behavior is difficult to reduce to a single numeric measure.

---

## Quantitative Evaluation

Quantitative evaluation produces numerical measurements.

Examples:

- success rate
- pass rate
- error rate
- completion rate
- constraint violation rate

For example:

```text
900 successful cases
100 failed cases

Success Rate = 90%
```

Quantitative measurements make aggregation and comparison easier.

However:

> **A numerical score does not automatically make an evaluation valid.**

The property being measured must still matter.

---

# 15. Deterministic vs Non-Deterministic Evaluation

Traditional software testing often assumes that the same input produces the same output.

Agent systems may not always behave this way.

For example:

```text
Same Task
   ↓
Run 1 → Tool A → Result X
Run 2 → Tool B → Result Y
Run 3 → Tool A → Result X
```

Different execution paths may still satisfy the same requirements.

Therefore, evaluation should not automatically assume:

> “Different trajectory = failure.”

Instead, evaluation criteria should define the properties that must hold.

For example:

```text
Required:
- correct customer
- correct amount
- authorization required

Not necessarily required:
- exact tool-call sequence
- exact wording
- identical internal plan
```

The evaluation design should distinguish **required behavior** from **one particular implementation path**.

Detailed trajectory and tool evaluation is covered in File 02.

---

# 16. Multiple Valid Execution Paths

Two executions can differ while both being acceptable.

Consider:

```text
Execution A:
Search → Filter → Answer

Execution B:
Filter → Search → Answer
```

If both satisfy the task requirements and constraints, they may both be valid.

This leads to an important principle:

> **Evaluation should measure required properties, not superficial similarity to one preferred execution.**

A different execution is not automatically a bad execution.

---

# 17. Failure Classification

When an evaluation fails, the first responsibility is to identify **what failed**.

Examples:

```text
Task Failure
Constraint Violation
Incorrect Result
Incomplete Result
Irrelevant Result
Unacceptable Behavior
Unnecessary Action
Termination Failure
Recovery Failure
```

Failure classification is not the same as root-cause analysis.

For example:

```text
Observed:
Incorrect final answer.

Possible contributing causes:
- incorrect planning
- incorrect tool selection
- incorrect tool result interpretation
- stale state
- missing context
- external dependency failure
```

At this stage, the evaluator should avoid claiming a root cause without sufficient evidence.

Detailed analysis of trajectories and behavioral divergence belongs to File 02.

---

# 18. Evaluation Evidence

A meaningful evaluation requires evidence.

Depending on the task, evidence may include:

- final result
- agent response
- task state
- actions performed
- tool interactions
- intermediate results
- state changes
- relevant execution records

The amount and type of evidence required depends on the evaluation question.

For example:

```text
Question:
Was the final answer correct?

Potential evidence:
Final answer may be sufficient.

Question:
Did the agent use an unauthorized action?

Required evidence:
Relevant execution behavior must be examined.
```

## Evidence Availability vs Evidence Sufficiency

An evaluator may have access to evidence without having enough evidence to support a reliable judgment.

For example:

```text
Requirement:
Agent must obtain user confirmation before purchase.

Observed evidence:
"Purchase completed."

What this proves:
A purchase occurred.

What it does not prove:
Whether required confirmation occurred beforehand.
```

The evaluator therefore needs evidence that directly supports the property being judged.

This leads to an important principle:

> **Evidence should be sufficient for the property being evaluated, not merely available to the evaluator.**

The detailed evaluation of execution evidence is developed in File 02.

---

# 19. Evaluator Design Fundamentals

An evaluation is not simply a label attached to an agent output.

The evaluation process itself must be designed around the property being measured.

At a basic level:

```text
System Requirement
       ↓
Evaluation Property
       ↓
Evaluation Criterion
       ↓
Required Evidence
       ↓
Judgment
       ↓
Evaluation Result
```

A well-designed evaluator should answer:

### What property are we evaluating?

For example:

> Did the agent complete the requested task?

### What evidence is relevant?

For example:

> The final result and relevant task state.

### What makes the behavior acceptable?

For example:

> All required outcomes are satisfied and no critical constraint is violated.

### Is the evidence sufficient?

For example:

> If the requirement concerns whether authorization occurred before an action, the evaluator needs evidence of the relevant authorization event and action ordering, not merely the final state.

### Can the judgment be justified?

The evaluator should be able to connect its result to observable evidence and explicit criteria.

This leads to an important principle:

> **An evaluator should judge against defined criteria using sufficient evidence relevant to the property being measured.**

At this stage, the focus is on evaluator design fundamentals.

Detailed evaluator reliability, calibration, disagreement analysis, bias, LLM-as-a-Judge behavior, and evaluator drift are covered in **File 03**.

---

# 20. Evaluation Criteria Should Come From Requirements

A common mistake is to begin with a convenient metric and then define success around it.

For example:

```text
Available Metric:
Answer similarity

Incorrect reasoning:
"Therefore, answer similarity defines agent quality."
```

The correct direction is:

```text
System Requirements
       ↓
Expected Behavior
       ↓
Evaluation Criteria
       ↓
Evidence
       ↓
Measurement
```

The metric is a measurement tool.

It does not define the underlying requirement by itself.

---

# 21. Example: Customer Support Agent

Consider a customer-support agent.

### User Request

> “I want to cancel my subscription.”

### Requirements

```text
- Identify the correct customer.
- Confirm the subscription.
- Follow the permitted cancellation process.
- Require confirmation if cancellation is irreversible.
- Do not expose unrelated customer information.
- Clearly communicate the resulting status.
```

### Outcome Evaluation

Question:

> Was the subscription successfully cancelled?

### Behavioral Evaluation

Questions:

- Was the correct customer identified?
- Was the correct subscription selected?
- Was required confirmation obtained?
- Was the permitted process followed?
- Was unrelated information protected?
- Was the final status communicated correctly?

Now the evaluation is richer than:

```text
Cancellation = Yes
```

It evaluates both the result and the conditions under which the result was produced.

---

# 22. Example: Research Agent

Consider a research agent asked:

> “Compare three cloud providers for a startup considering cost, scalability, and managed database capabilities.”

Possible evaluation criteria:

```text
Task Success
    ↓
Three providers compared

Correctness
    ↓
Claims are factually supported

Completeness
    ↓
Cost + scalability + database capabilities covered

Relevance
    ↓
Analysis is focused on startup requirements

Constraint Adherence
    ↓
Only requested providers considered

Behavioral Requirements
    ↓
Required research process or source restrictions respected
```

Not every system would require every dimension.

The correct evaluation set depends on the actual system requirements.

---

# 23. Example: Coding Agent

Suppose a coding agent receives:

> “Add validation for an invalid email address.”

Possible evaluation dimensions:

```text
Functional:
- Invalid input is rejected.
- Valid input is accepted.

Behavioral:
- Existing unrelated behavior is not broken.
- Required validation boundary is respected.
- No unrelated files are modified.
- The implementation follows required project constraints.
```

A final code sample that appears correct may still fail if the agent modified unrelated production logic or violated explicit repository constraints.

---

# 24. Evaluation Depth Should Match Risk

Consider two systems.

### System A

An agent summarizes internal documentation.

A simple outcome evaluation may be sufficient for many cases.

### System B

An agent executes financial transactions.

Evaluation may need to examine:

- outcome correctness
- authorization
- constraint adherence
- action correctness
- confirmation requirements
- failure handling
- termination behavior

The second system has greater consequences for incorrect behavior.

Therefore:

```text
Higher Risk
     ↓
Potentially Deeper Evaluation
```

This is not a universal formula.

Evaluation requirements must be derived from the system's actual risk and requirements.

---

# 25. Common Evaluation Mistakes

## Mistake 1 — Evaluating Only the Final Answer

```text
Final Answer = Correct
        ↓
Agent = Good
```

This can hide unacceptable behavior.

### Better approach

Evaluate the outcome and, where required, the behavior that produced it.

---

## Mistake 2 — Assuming One Correct Execution Path

An evaluator may reject a valid execution simply because it differs from a reference trajectory.

### Better approach

Define required properties instead of requiring superficial trajectory similarity.

---

## Mistake 3 — Treating Preferences as Requirements

An evaluator may penalize an agent because it used a different writing style, plan, or execution order.

### Better approach

Separate:

```text
Must satisfy
```

from:

```text
Preferred
```

---

## Mistake 4 — Using a Single Evaluation Dimension

A system may have a high success rate while violating important constraints.

### Better approach

Use evaluation dimensions that correspond to actual system requirements.

---

## Mistake 5 — Assuming Every Internal Step Must Be Evaluated

This can make evaluation unnecessarily expensive and difficult.

### Better approach

Evaluate the depth required by the task and risk.

---

## Mistake 6 — Confusing Failure Classification With Root Cause

Observed failure:

> Incorrect answer.

This does not automatically prove:

> Planning caused the failure.

### Better approach

Classify the observed failure first and investigate causes using sufficient evidence.

---

## Mistake 7 — Treating Numerical Scores as Truth

A score can appear precise while measuring the wrong property.

### Better approach

Ask:

- What property does this score represent?
- Does that property matter?
- Is the evaluation criterion valid?
- Is the evidence sufficient?

---

## Mistake 8 — Defining Evaluation After Seeing Results

If criteria are changed after observing agent behavior, evaluation can become biased toward desired results.

### Better approach

Define success criteria before evaluating the relevant test cases whenever practical.

---

## Mistake 9 — Designing the Evaluator Around Convenient Evidence

An evaluator may judge only what is easy to observe rather than what actually matters.

For example:

```text
Easy to measure:
Response similarity

Actually required:
Correctness + completeness + constraint adherence
```

### Better approach

Start from the required property, then determine what evidence is necessary to judge it.

---

# 26. Engineering Decision Framework

When designing an evaluation for an agent task, ask:

```text
1. What is the agent supposed to accomplish?
             ↓
2. What outcome defines success?
             ↓
3. What behaviors are required?
             ↓
4. What behaviors are prohibited?
             ↓
5. What constraints must be respected?
             ↓
6. What evidence is needed?
             ↓
7. Is that evidence sufficient for the judgment?
             ↓
8. Which evaluation dimensions matter?
             ↓
9. Is pass/fail sufficient?
             ↓
10. Is graded evaluation more appropriate?
             ↓
11. How much evaluation depth does the risk require?
```

This sequence helps prevent evaluation from becoming an arbitrary collection of metrics.

---

# 27. Relationship to the Next File

This chapter establishes **what should be evaluated**.

The next chapter asks a different question:

> **How do we evaluate what the agent actually did during execution?**

That leads to:

- trajectories
- action sequences
- tool calls
- tool parameters
- planning behavior
- state transitions
- context usage
- memory behavior
- intermediate outcomes
- failure points

These topics belong primarily to:

[`02-Trajectory-Tool-Planning-and-State-Evaluation.md`](./02-Trajectory-Tool-Planning-and-State-Evaluation.md)

File 02 builds on the evaluation criteria established here rather than redefining them.

---

## Production Perspective

In production, evaluation criteria should reflect actual system requirements rather than convenient benchmark behavior.

Evaluation criteria should ideally be defined **before the evaluation results are used to make release or engineering decisions**. Otherwise, there is a risk of changing the definition of success after seeing system behavior.

A production evaluation strategy may need to distinguish:

```text
Normal Cases
     +
Edge Cases
     +
Failure Cases
     +
High-Risk Cases
```

The appropriate depth depends on the system.

For example:

```text
Low-Risk Information Agent
        ↓
Outcome evaluation may dominate

Higher-Risk Action Agent
        ↓
Outcome + behavioral evaluation may be required
```

Evaluation should therefore be designed as part of the system's engineering requirements, not added only after implementation or after a production failure occurs.

Production-scale evaluation infrastructure, regression pipelines, evaluator monitoring, test-set maintenance, and release gates are developed further in File 03.

---

# Engineering Decisions and Trade-offs

## Outcome vs Behavior

### Outcome-focused evaluation

**Advantages**

- simple
- inexpensive
- easy to aggregate
- directly connected to task completion

**Limitations**

- may hide unacceptable execution behavior
- may not detect constraint violations
- may miss important intermediate failures

### Behavior-focused evaluation

**Advantages**

- detects unacceptable execution patterns
- provides richer evidence
- useful for constrained or higher-risk tasks

**Limitations**

- requires more evidence
- can be more expensive
- requires carefully defined behavioral criteria

---

## Pass/Fail vs Graded Evaluation

### Pass/Fail

Best when:

- requirements are clear
- failure conditions are well-defined
- binary release decisions are appropriate

### Graded

Best when:

- partial success matters
- task quality exists on a meaningful spectrum
- more detailed comparison is useful

The choice should reflect the engineering decision being made.

---

## Qualitative vs Quantitative

### Qualitative

Useful when:

- behavior is difficult to reduce to a number
- nuanced judgment matters
- categories provide sufficient decision value

### Quantitative

Useful when:

- aggregation matters
- comparison across versions is required
- trends need to be measured

Quantitative evaluation does not automatically provide higher-quality evaluation.

---

## Interview Questions

## 1. What is the difference between functional and behavioral correctness?

**Expected Answer:**

Functional correctness asks whether the required result was produced.

Behavioral correctness asks whether the agent behaved appropriately while producing that result, including respecting relevant constraints, required actions, and prohibited behaviors.

An agent can therefore produce a correct result while still behaving incorrectly.

---

## 2. Why is evaluating only the final answer insufficient for some agents?

**Expected Answer:**

Because the final answer can hide how the agent reached it. An agent may produce a correct answer through an unauthorized, unsafe, inefficient, or otherwise unacceptable action. When execution behavior matters, the evaluation must examine more than the final result.

---

## 3. Does every agent require trajectory-level evaluation?

**Expected Answer:**

No. Evaluation depth should depend on system requirements, task characteristics, risk, and consequences of failure. Some low-risk systems may primarily require outcome evaluation, while higher-risk systems may require behavioral and trajectory-level evidence.

---

## 4. Is a different execution path automatically a failure?

**Expected Answer:**

No. Multiple execution paths can be valid. Evaluation should focus on required properties and constraints rather than requiring superficial similarity to one reference execution.

---

## 5. What is partial success?

**Expected Answer:**

Partial success occurs when an agent satisfies some but not all required aspects of a task. A graded evaluation can represent this more accurately than a simple binary pass/fail result.

---

## 6. What is the difference between an evaluation criterion and a preference?

**Expected Answer:**

An evaluation criterion represents a property required for acceptable behavior. A preference represents a desirable characteristic that may not justify failure. Evaluators should avoid converting subjective preferences into hard correctness requirements without justification.

---

## 7. Why should evaluation criteria be derived from requirements?

**Expected Answer:**

Because evaluation exists to determine whether the system satisfies its intended requirements. Starting from convenient metrics can lead to measuring properties that are easy to quantify but irrelevant to actual system quality.

---

## 8. Can a correct outcome still represent an evaluation failure?

**Expected Answer:**

Yes. If the agent violates a required constraint or behaves in an unacceptable way while producing the correct outcome, the execution can fail behavioral evaluation even though the final outcome is correct.

---

## 9. What is the difference between failure classification and root-cause analysis?

**Expected Answer:**

Failure classification identifies what went wrong at the observable evaluation level. Root-cause analysis attempts to determine why it happened and which system component contributed. A failure should not be assigned a root cause without sufficient evidence.

---

## 10. What makes a basic evaluator well-designed?

**Expected Answer:**

It evaluates a clearly defined property, uses sufficient evidence relevant to that property, applies explicit criteria, and produces a judgment that can be justified from the available evidence. More advanced evaluator reliability concerns such as calibration, disagreement, bias, and drift are covered later in AGT-10.

---

## 11. When would you choose pass/fail over graded evaluation?

**Expected Answer:**

Pass/fail is appropriate when requirements are clear and the engineering decision is naturally binary. Graded evaluation is more useful when partial success or quality differences carry meaningful information.

---

## Quick Revision

### Core Questions

**What is task success?**

> Whether the agent accomplished the intended task according to defined requirements.

**What is functional correctness?**

> Whether the required result was produced.

**What is behavioral correctness?**

> Whether the agent behaved appropriately while producing that result.

**Does a correct final answer prove correct behavior?**

> No.

**Does every internal step need evaluation?**

> No. Evaluation depth should match requirements and risk.

**Can multiple execution paths be valid?**

> Yes.

**What defines evaluation criteria?**

> System and task requirements.

**What is partial success?**

> Completion of some but not all required task components.

**What is the danger of a single metric?**

> It may measure only one property and hide important failures.

**What is the difference between failure classification and root cause?**

> Classification describes what failed; root-cause analysis investigates why it failed.

**What is the difference between evidence availability and evidence sufficiency?**

> Evidence may be available to the evaluator without actually being sufficient to support the judgment being made.

**What makes an evaluator well-designed?**

> It evaluates the intended property using sufficient, relevant evidence and explicit criteria, with a judgment that can be justified.

---

## Key Takeaways

1. **Agent evaluation begins by defining what success means.**
2. **Functional correctness and behavioral correctness are distinct.**
3. **A correct final answer does not automatically prove correct agent behavior.**
4. **Outcome-based and behavior-based evaluation are complementary.**
5. **Evaluation criteria should come from system requirements.**
6. **Not every internal step needs to be evaluated.**
7. **Evaluation depth should match task requirements and risk.**
8. **Multiple execution paths can be valid.**
9. **Required behaviors should be distinguished from subjective preferences.**
10. **Partial success may require graded evaluation rather than simple pass/fail.**
11. **A numerical score is useful only when it measures a relevant property.**
12. **Failure classification should not be confused with root-cause analysis.**
13. **Evaluation evidence should be sufficient for the property being evaluated.**
14. **Evidence availability alone does not guarantee evidence sufficiency.**
15. **A basic evaluator should connect explicit criteria with sufficient, relevant evidence.**
16. **Detailed trajectory, tool, planning, state, context, and memory evaluation belongs in File 02.**
17. **Evaluator reliability, calibration, judge behavior, and regression methodology belong primarily in File 03.**
18. **AGT-10 evaluates observable behavior across these capabilities; it does not take ownership of their underlying architecture.**

---

## Further Reading

For continued study, review the related chapters in this repository:

- **AGT-02** — Agent Runtime and Execution
- **AGT-03** — Tools and Tool Execution
- **AGT-04** — Agent State, Context, and Memory
- **AGT-05** — Verification and Critique
- **AGT-10 File 02** — Trajectory, Tool, Planning and State Evaluation
- **AGT-10 File 03** — Evaluation Sets, Metrics and Regression Testing

The next file builds directly on the evaluation concepts established here.
