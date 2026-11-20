# 02 — Reasoning Capabilities and Limitations

## 1. Learning Objectives

By the end of this chapter, you should be able to:

- Explain what reasoning means operationally in an LLM application.
- Distinguish direct response generation from tasks requiring multiple dependent steps.
- Decompose a complex problem into smaller, verifiable subproblems.
- Identify hidden assumptions, invalid inferences, and constraint-handling failures.
- Explain why locally correct steps can still produce an incorrect final conclusion.
- Evaluate the limitations of longer explanations, self-checking, and model-generated verification.
- Design practical checks that help determine whether a reasoning result satisfies the task's requirements.

## 2. Prerequisites

Recommended background:

| Topic | Relevant knowledge |
|---|---|
| LLM-01 — Evolution and Landscape of Language Models | Language-model capabilities and limitations |
| LLM-02 — Training and Learned Behavior | How training shapes learned behavior |
| LLM-05 — Inference and Text Generation | How model responses are generated |
| LLM-06 — Context Engineering and Context Constraints | How instructions and supplied information shape a task |
| LLM-07 Chapter 01 — Model Behavior Fundamentals | Observable behavior, evidence, and the distinction between a result and its presumed cause |

These topics provide useful context but are not strict prerequisites for every section.

## 3. Estimated Reading Time

**20–25 minutes**, excluding the practical exercise and assessment.

## 4. Before We Start

Consider this request:

> A service processes 120 requests per minute. Its incoming load increases by 25%. How many requests per minute must it handle after the increase?

The correct answer is 150 requests per minute.

Now consider a more complicated request:

> A service processes 120 requests per minute. Traffic increases by 25%, but the service can handle at most 140 requests per minute. What is the excess load, and what additional information is needed to determine the resulting customer impact?

A complete answer requires several dependent operations:

1. Calculate the new incoming load.
2. Compare it with the service's capacity.
3. Calculate the excess load.
4. Distinguish excess demand from actual failed requests.
5. Identify what further information is needed to estimate customer impact.

The arithmetic is simple. The challenge is preserving the meaning of each quantity and avoiding conclusions beyond the supplied information.

**Reasoning quality depends on the validity of the relationships between the problem, its assumptions, its intermediate results, and its conclusion.**

## 5. Why Reasoning Capabilities Matter

Many engineering tasks require more than producing a relevant sentence or retrieving a single fact.

They may require combining information, applying constraints, comparing alternatives, inferring consequences, or coordinating dependent steps.

Examples include:

- Calculating the impact of a capacity change.
- Identifying a likely cause from diagnostic observations.
- Comparing architecture options against cost and latency requirements.
- Applying a sequence of business rules.
- Determining whether a proposed solution satisfies every requirement.
- Identifying missing information before making a recommendation.

A response can sound coherent while failing at any of these operations.

The engineering objective is not to determine whether an answer *looks reasoned*. It is to determine whether the result follows from the relevant information and meets the task's requirements.

This assessment concerns observable evidence and task validity. It does not require claims about the model's inaccessible internal computation.

## 6. Mental Model: Reasoning as a Verifiable Task Process

### 6.1 What does reasoning mean operationally?

For an LLM application, reasoning can be treated operationally as producing a conclusion or decision by combining information, applying relationships or constraints, and deriving consequences relevant to a task.

This describes the task and its observable requirements. It does not assert that the model uses the same internal process as a human engineer.

A reasoning-intensive task may require:

- Identifying relevant information.
- Interpreting the problem correctly.
- Making assumptions explicit.
- Breaking the task into dependent steps.
- Applying rules or relationships.
- Tracking intermediate results.
- Checking whether the conclusion follows.
- Recognizing when information is insufficient.

Different tasks require different combinations of these operations.

### 6.2 A conceptual workflow

```text
Problem and requirements
        |
        v
Identify relevant information
        |
        v
Clarify assumptions and constraints
        |
        v
Decompose into dependent steps
        |
        v
Produce intermediate results
        |
        v
Check relationships and constraints
        |
        v
Derive the final conclusion
        |
        v
Verify against the original requirements
```

This is a problem-solving framework, not a literal description of a model's internal architecture. A model may not explicitly perform every step, and the order may vary.

The framework gives engineers identifiable points at which to inspect a failure.

### 6.3 Why decomposition helps

Suppose a task requires five dependent operations. If the final answer is wrong, the error may originate in the interpretation, an intermediate calculation, an omitted constraint, or the final conclusion.

Decomposition makes these possibilities easier to distinguish and allows selected operations to be checked independently.

For example, arithmetic can be executed by deterministic code, database facts can be retrieved from an authoritative source, and business constraints can be validated by application logic.

Decomposition improves inspectability, but it does not guarantee correctness. A model can choose an unsuitable decomposition, make an error in a subproblem, or combine valid intermediate results incorrectly.

## 7. Core Concept: Multi-Step Reasoning and Dependency Management

### 7.1 Independent versus dependent steps

**Independent steps** can be completed separately. Given a dataset, calculating its row count and counting missing values are two examples.

**Dependent steps** require earlier results. In capacity planning, calculating the new incoming load must precede comparing that load with the service's capacity.

An error in an early step can propagate into later steps.

### 7.2 Worked example: Capacity planning

Given:

- Current traffic: 120 requests per minute.
- Traffic increase: 25%.
- Maximum processing capacity: 140 requests per minute.

**Step 1: Calculate incoming traffic.**

\[
120 \times (1 + 0.25) = 150
\]

Expected incoming traffic is 150 requests per minute.

**Step 2: Compare demand with capacity.**

\[
150 - 140 = 10
\]

The incoming load exceeds the stated capacity by 10 requests per minute.

**Step 3: State the conclusion precisely.**

The service receives 150 requests per minute, while its stated capacity is 140. The demand-capacity gap is 10 requests per minute.

This does not automatically establish that exactly 10 requests will fail every minute. Actual customer impact depends on factors such as queueing, burst patterns, retry behavior, load shedding, and the meaning of the capacity limit.

A valid conclusion therefore requires correct calculations, correct interpretation of the quantities, and appropriate limits on what the evidence supports.

### 7.3 Error propagation

Suppose the model calculates incoming traffic as 145 rather than 150. Its subsequent capacity comparison might be arithmetically correct:

\[
145 - 140 = 5
\]

The final conclusion remains wrong because the intermediate value was incorrect.

When investigating a multi-step task, inspect important intermediate values and their dependencies instead of checking only the final answer.

### 7.4 When to use external computation

For deterministic operations such as arithmetic, date calculations, structured transformations, and database lookups, a dedicated tool may provide a more dependable result than relying solely on generated text.

A practical division of responsibility is:

- Use the model to interpret the problem and propose an approach.
- Use deterministic code or authoritative systems for operations they can perform reliably.
- Validate the results against the original requirements.
- Handle errors and missing results explicitly in the application.

Tool integration and orchestration belong to the relevant application and agent-engineering topics. The principle here is to assign operations to mechanisms suited to their correctness requirements.

## 8. Core Concept: Hidden Assumptions and Invalid Inference

A reasoning failure can occur before the first calculation. The problem may be interpreted incorrectly, or the model may introduce an assumption that the task never established.

### 8.1 Hidden assumptions

An assumption is hidden when a conclusion depends on a condition that has not been stated or justified.

Consider:

> The API latency increased after the new model was deployed. Therefore, the new model caused the increase.

The timing relationship is an observation. The causal conclusion requires additional evidence.

Other changes may have occurred at the same time, including larger request payloads, database slowdowns, changes in traffic, or an altered network path.

A more defensible conclusion is:

> The latency increase followed the deployment, so the new model is one possible cause. Compare relevant request paths and execution conditions before attributing the change to it.

This distinguishes an observed relationship from an established causal explanation.

### 8.2 Invalid inference

An invalid inference occurs when a conclusion does not follow from its premises.

Consider:

- All approved requests have a valid request ID.
- This request has a valid request ID.
- Therefore, this request is approved.

The conclusion does not follow. The first statement establishes a necessary condition for approval, not a sufficient condition.

A valid request ID may be required, but other approval requirements may also need to be satisfied.

### 8.3 Common reasoning traps

| Failure pattern | What goes wrong | Engineering response |
|---|---|---|
| Unsupported assumption | A missing condition is treated as established | List assumptions and obtain evidence where necessary |
| Invalid inference | The conclusion does not follow from the premises | Check the logical relationship between premises and conclusion |
| Constraint omission | A requirement is ignored during the solution | Compare the result against every explicit constraint |
| Quantity confusion | Related quantities are treated as interchangeable | Define units and meanings before calculating |
| Causal overreach | Correlation or timing is treated as proof of cause | Investigate alternative explanations and relevant evidence |
| Premature conclusion | The first plausible explanation is accepted | Consider competing hypotheses before deciding |

This chapter focuses on the structure of reasoning failures. Unsupported factual claims and hallucination have their primary teaching location in Chapter 03.

### 8.4 Assumption checklist

Before accepting a nontrivial conclusion, ask:

1. What facts were explicitly supplied?
2. Which statements are assumptions?
3. Are the assumptions justified for this task?
4. Does each inference follow from its premises?
5. Have all explicit constraints been preserved?
6. Does the conclusion exceed what the evidence supports?

These questions help expose weaknesses; they do not guarantee a correct answer.

## 9. Core Concept: Local Correctness Versus Final Correctness

A multi-step solution may contain individually valid steps but still produce an incorrect final answer. The solution might omit a relevant condition, combine results incorrectly, or fail to answer the original question.

Consider a software deployment decision with these requirements:

- The application must support 1,000 concurrent users.
- The p95 latency must remain below 300 milliseconds.
- The monthly infrastructure budget must not exceed a specified limit.

A proposed architecture might meet the concurrency requirement and satisfy the latency target in a limited test, yet exceed the budget. The architecture is not acceptable merely because two requirements were satisfied.

### 9.1 Constraint preservation

Represent the task as explicit acceptance conditions.

| Requirement | Evidence needed | Status |
|---|---|---|
| Concurrency target | Relevant load-test results | Not yet established |
| Latency target | Defined measurement under relevant conditions | Not yet established |
| Budget limit | Cost estimate using stated assumptions | Not yet established |

The table exposes missing evidence. It does not imply that tests have been performed or that an architecture is production-ready.

### 9.2 Check against the original question

Before returning a conclusion, ask:

- Did the solution answer the actual question?
- Were all required conditions retained?
- Did any intermediate result change meaning?
- Were necessary assumptions disclosed?
- Is the conclusion supported by the available evidence?

This check is especially useful for long prompts, multi-part questions, planning tasks, and technical recommendations.

Detailed instruction-following and output-contract failures are examined in Chapter 04.

## 10. Why Longer Explanations Do Not Guarantee Better Reasoning

A longer response may include more intermediate steps, examples, and qualifications. That can improve clarity when the content is valid and relevant.

However, length alone is not a measure of reasoning quality.

A longer explanation can still begin from an incorrect assumption, contain an invalid inference, omit a constraint, repeat a mistaken result, or reach an unsupported conclusion. A short answer can be correct and sufficient for a simple task.

### Evaluate the solution, not its appearance

Consider two responses to a capacity-planning problem:

- **Response A:** Gives the correct result, shows checkable arithmetic, states the capacity assumption, and identifies what remains unknown.
- **Response B:** Provides a lengthy explanation of distributed systems but uses the wrong incoming traffic value.

Response B may appear more sophisticated, but it fails the task.

Useful evidence includes correct intermediate calculations, valid inferences, preserved constraints, consistency between evidence and conclusion, and satisfaction of the original requirements.

A polished explanation can help a reviewer understand a solution. It cannot substitute for checking the solution itself.

## 11. Internal Working and User-Facing Explanations

An LLM may produce an explanation alongside its answer. That explanation can be useful for communication and review, but it should not automatically be interpreted as a faithful record of the model's internal computational process.

| Concept | Meaning |
|---|---|
| User-facing explanation | An account intended to help a person understand the result |
| Verifiable solution steps | Steps or intermediate results that can be independently checked |
| Internal model computation | Processes not fully established merely by reading the generated explanation |

For example, an assistant may correctly explain a calculation by showing the formula and substituting the values. The formula and arithmetic can be checked independently.

That provides stronger evidence for the answer's correctness than simply trusting a claim that the model “checked its work.”

Even a correct displayed solution does not prove that it faithfully represents every internal operation performed by the model.

The engineering objective is to provide useful, appropriately supported explanations while verifying consequential results independently.

## 12. Limitations of Self-Checking and Model-Generated Verification

A common approach is to ask the same model to review its previous answer:

> Review your answer, identify any mistakes, and provide a corrected version.

This may reveal errors, but it is not an independent guarantee of correctness.

### 12.1 Why self-checking can fail

The model may repeat the original incorrect assumption, overlook the same constraint, produce a plausible but incorrect justification, change a correct answer unnecessarily, or claim to have verified a result without providing an independently checkable verification.

A second response from the same model may provide additional evidence, but it is not automatically independent evidence.

### 12.2 Match verification to the failure type

| Task or failure | Appropriate verification |
|---|---|
| Arithmetic error | Independent calculation or deterministic code |
| Invalid business-rule conclusion | Explicit rule checks against supplied requirements |
| Missing required fields | Schema or contract validation |
| Unsupported causal claim | Relevant system evidence and comparison of alternative explanations |
| Complex technical recommendation | Checkable assumptions, constraints, calculations, and domain review |
| Incomplete answer | Compare the response with a checklist derived from the original request |

A model can help review its own work, particularly by identifying assumptions or proposing test cases. The key is to distinguish assistance from independent confirmation.

### 12.3 Independent verification is not infallible

External tools and validation mechanisms can also fail. A calculation may use incorrect inputs, a test may not represent production conditions, and a validator may check syntax without checking semantic correctness.

Verification quality depends on whether the method addresses the failure being investigated.

For example, valid JSON proves that a response meets certain structural requirements. It does not prove that the values inside the JSON are true.

## 13. Practical Engineering Workflow

Use the following workflow when a task requires several dependent steps.

1. **Define the requested outcome.** Identify what the final result must establish.
2. **Extract facts and constraints.** Separate supplied facts from assumptions and unknowns. Record units, limits, dependencies, and relevant conditions.
3. **Decompose the task.** Identify the required operations and their dependencies. Avoid unnecessary decomposition for simple tasks.
4. **Identify verification points.** Determine which intermediate results can be checked independently.
5. **Derive the conclusion.** Combine the results without changing their meanings or silently dropping constraints.
6. **Validate against the original task.** Check the final result against the complete set of requirements.
7. **State limitations.** Identify assumptions, missing information, and conclusions that cannot yet be established. Request clarification or give a conditional answer when necessary.
8. **Preserve appropriate evidence.** For consequential workflows, retain suitable records of inputs, intermediate results, validation outcomes, and decisions, subject to privacy and security requirements.

This is a practical problem-solving workflow, not a substitute for formal evaluation methodology. LLM-08 owns systematic evaluation and benchmarking.

## 14. Engineering Decisions and Trade-offs

Reasoning support should be proportionate to the complexity and consequences of the task.

### When is decomposition useful?

Decomposition helps when a task contains dependent operations, multiple constraints, or intermediate results that can be checked.

It may be unnecessary for straightforward transformations or simple questions where extra steps add latency and complexity without improving correctness.

### When should a model use an external tool?

A tool is appropriate when it can perform a required operation more reliably or provide evidence unavailable in the supplied context.

Examples include exact calculations, database queries, and authoritative system lookups. Tool use introduces its own considerations, including latency, cost, permissions, tool failures, and incorrect inputs.

### When should the system request clarification?

If essential information is missing, a constraint is ambiguous, or the evidence cannot support a decision, the system may need to request clarification, return an explicit uncertainty state, or route the task for review.

The appropriate choice depends on the task and its risk.

### What is the cost of additional verification?

Additional checks may reduce certain errors, but they also consume time and resources. The goal is not maximum verification for every task; it is an appropriate level of verification for the consequences of failure.

## 15. Practical Exercise: Diagnose a Flawed Recommendation

A team asks an LLM to assess whether a proposed service configuration meets these requirements:

- Expected incoming load: 200 requests per second.
- Maximum service capacity: 180 requests per second.
- Monthly infrastructure cost must remain below ₹50,000.

The model returns this recommendation:

> The configuration meets the requirements. Expected incoming load is 200 requests per second, and the service capacity is 180 requests per second, so the service has a spare capacity of 20 requests per second. The estimated monthly cost is ₹55,000, which is close enough to the budget to be acceptable.

### Your task

Identify at least three problems in the recommendation.

For each problem, explain:

1. What is incorrect or unsupported?
2. Which requirement or relationship was mishandled?
3. What check or evidence would expose the problem?
4. What conclusion can legitimately be drawn from the information supplied?

Do not assume that the model's final recommendation is valid merely because it contains specific numbers.

### Expected diagnostic findings

<details>
<summary>Reveal the expected findings after attempting the exercise</summary>

**1. Incorrect capacity calculation**

The stated incoming load is 200 requests per second, while capacity is 180. The service does not have spare capacity; demand exceeds capacity by 20 requests per second.

\[
200 - 180 = 20
\]

**2. Budget constraint violation**

The estimated monthly cost is ₹55,000, which exceeds the ₹50,000 limit by ₹5,000. Calling it “close enough” does not override the explicit requirement.

**3. Unsupported acceptance decision**

The recommendation says the configuration meets the requirements, but the stated capacity and cost figures contradict that conclusion.

**4. Limits of the conclusion**

The figures establish a demand-capacity gap and a budget violation. They do not establish the exact number of failed requests, latency, or customer impact. Additional system assumptions and evidence would be needed.

A better recommendation would state that the configuration fails at least two stated requirements and should not be accepted without a revised design or an explicit change to the requirements.

</details>

## 16. Common Mistakes and Misconceptions

### Mistake 1: Treating a coherent explanation as proof of valid reasoning

A coherent explanation may still contain an invalid inference. Check the relationships between premises, steps, and conclusion.

### Mistake 2: Checking only the final answer

A wrong intermediate value can produce a plausible final result. Inspect important dependencies when the task warrants it.

### Mistake 3: Treating every assumption as a fact

Make assumptions explicit and determine whether they are justified.

### Mistake 4: Assuming all constraints were preserved

Compare the final answer against the original requirements, including requirements that may not appear in the last step.

### Mistake 5: Assuming self-critique is independent verification

A model may repeat the same error during review. Use an appropriate independent check when correctness matters.

### Mistake 6: Over-decomposing simple tasks

Decomposition is useful when it makes dependencies and errors easier to inspect. Excessive decomposition can introduce unnecessary complexity.

### Mistake 7: Confusing excess demand with actual failures

A capacity gap establishes that demand exceeds stated capacity. It does not, by itself, establish the precise number of failed requests or the customer impact.

## 17. Interview Questions with Expected Answers

### Q1. What does reasoning mean operationally in an LLM application?

**Expected answer:** It means producing a conclusion by combining information, applying relationships or constraints, and deriving consequences relevant to a task. This definition concerns observable task requirements and does not establish the model's exact internal computation.

### Q2. Why does decomposition help with multi-step problems?

**Expected answer:** It makes dependencies and intermediate results easier to inspect. Engineers can identify where an error may have entered and independently verify selected operations. Decomposition does not guarantee correctness.

### Q3. What is the difference between a hidden assumption and an invalid inference?

**Expected answer:** A hidden assumption introduces a condition that has not been established. An invalid inference draws a conclusion that does not logically follow from its premises. A task may contain either or both.

### Q4. Can every intermediate step be correct while the final answer is wrong?

**Expected answer:** Yes. The solution may omit an original constraint, combine the results incorrectly, misinterpret an intermediate quantity, or fail to answer the actual question. The final conclusion must be checked against the original requirements.

### Q5. Why is model self-review insufficient for high-confidence verification?

**Expected answer:** The model may repeat the original assumptions or mistakes. Self-review can help identify possible errors, but independent calculations, authoritative evidence, or suitable validation mechanisms provide stronger verification for the relevant failure types.

### Q6. How would you investigate a technical recommendation that sounds convincing but may be wrong?

**Expected answer:** Extract the requirements, separate facts from assumptions, identify dependencies, check intermediate calculations and inferences, compare the conclusion with every constraint, and obtain independent evidence where necessary. State what remains uncertain.

### Q7. When should an LLM application request clarification instead of producing a definite answer?

**Expected answer:** When essential information is missing, requirements are materially ambiguous, or the available evidence does not support a safe conclusion. The decision should reflect the task's consequences and whether a conditional answer is useful.

## 18. Quick Revision

- Reasoning quality concerns the validity of the relationships between information, constraints, intermediate results, and conclusions.
- Decomposition can improve inspectability but does not guarantee correctness.
- Hidden assumptions and invalid inferences are distinct failure patterns.
- Locally correct steps can still lead to an incorrect final answer.
- Longer explanations and apparent confidence are not reliable measures of reasoning quality.
- User-facing explanations are not necessarily faithful records of internal computation.
- Model-generated self-checking is not automatically independent verification.
- Choose verification methods that directly address the task's failure risks.

## 19. Key Takeaways

The central engineering principle is to **verify the solution, not merely the explanation**.

For nontrivial tasks, identify the requirements, preserve constraints, inspect important dependencies, and validate the conclusion against the original problem. Use external computation or authoritative evidence where appropriate, and state uncertainty when the information does not support a definite answer.

Reasoning support is useful when it improves task performance and makes important errors easier to detect. It should not be treated as a guarantee that the model's conclusions are correct.

## 20. Further Reading

These sources provide broader background. They do not establish that any particular model uses a specific internal reasoning process.

- Wei et al., [Chain-of-Thought Prompting Elicits Reasoning in Large Language Models](https://arxiv.org/abs/2201.11903) — Research on prompting models to produce intermediate reasoning steps.
- Kojima et al., [Large Language Models are Zero-Shot Reasoners](https://arxiv.org/abs/2205.11916) — Research on prompting and reasoning-task performance.
- Valmeekam et al., [Large Language Models Still Can't Plan](https://arxiv.org/abs/2206.10498) — Research examining limitations in planning-related tasks.
