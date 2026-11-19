# Agent Trajectory, Tool, Planning, and State Evaluation

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain what an agent trajectory is and why final outcomes alone may be insufficient for evaluation.
- Evaluate an agent's sequence of observable actions, decision outputs, observations, and state changes.
- Distinguish end-to-end evaluation from step-level and trajectory-level evaluation.
- Evaluate tool selection, tool parameters, unnecessary tool calls, and tool-failure handling.
- Evaluate planning behavior without assuming that one exact plan is the only correct plan.
- Evaluate state transitions and identify invalid, missing, stale, or inconsistent state.
- Evaluate context and memory usage as observable behavior.
- Evaluate termination behavior and determine whether the agent stopped appropriately.
- Identify intermediate behavioral failures that may later produce an incorrect outcome.
- Compare alternative trajectories using requirements and acceptance criteria rather than superficial similarity.
- Interpret failures causally without confusing behavioral evidence with proven root cause.
- Understand when trajectory-level evaluation is justified and when outcome evaluation is sufficient.
- Build evaluation evidence that supports useful engineering decisions.

---

## Prerequisites

Before reading this chapter, you should understand:

- The difference between functional correctness and behavioral correctness.
- The meaning of evaluation criteria, acceptance criteria, and success criteria.
- Outcome-based versus behavior-based evaluation.
- The distinction between requirements and preferences.
- The concepts of pass/fail and graded evaluation.
- The principle that evaluation depth should match system risk and requirements.

These concepts are established in:

- [AGT-10 — Agent Task Success and Behavioral Evaluation](01-Agent-Task-Success-and-Behavioral-Evaluation.md)

You should also have a basic understanding of:

- Agent decision and action loops.
- Tool invocation.
- Agent state.
- Context and memory.
- Planning and task decomposition.

The underlying architecture of these capabilities is covered by the corresponding AGT chapters. This chapter evaluates their observable behavior rather than re-teaching their architecture.

---

## Estimated Reading Time

Approximately **50–70 minutes**, depending on how deeply you work through the examples.

---

## Before We Start

File 01 established what it means for an agent to behave correctly and why final outcomes alone may not be sufficient.

This chapter applies those principles to the agent's **execution trajectory**.

Consider an agent that receives:

> "Find the customer's order and issue a refund if the order qualifies."

Suppose the agent eventually produces:

> "Refund issued successfully."

That final response tells us something important.

But it does not tell us:

- whether the agent found the correct customer,
- whether it inspected the correct order,
- whether it used the correct tool,
- whether the tool parameters were correct,
- whether it checked refund eligibility,
- whether it ignored a required approval,
- whether it made unnecessary calls,
- whether it used stale state,
- whether it interpreted a tool result correctly,
- whether it attempted the refund twice,
- or whether the final success depended on a lucky execution path.

The final outcome is evidence.

The trajectory provides additional evidence about **how that outcome was produced**.

The engineering question is therefore:

> **What observable evidence do we need to determine whether the agent's execution behavior satisfied the requirements?**

---

## 1. What Is an Agent Trajectory?

An **agent trajectory** is the ordered execution evidence produced while an agent attempts to complete a task.

A trajectory can be represented as:

```text
Input
  ↓
Decision Output / Observable Action
  ↓
Tool Call
  ↓
Observation
  ↓
State Change
  ↓
Next Decision Output / Observable Action
  ↓
Tool Call
  ↓
Observation
  ↓
Final Result
```

The important property is not merely that these events occurred.

**Their order and relationships matter.**

For example:

```text
Retrieve → Verify → Refund
```

is behaviorally different from:

```text
Refund → Verify
```

even if both trajectories contain the same actions.

A trajectory can contain observable evidence such as:

- decision outputs or selected actions, where available,
- tool calls,
- tool arguments,
- tool results,
- state changes,
- intermediate outputs,
- planning artifacts, where exposed,
- retrieved context,
- memory interactions,
- external actions,
- final outputs.

The exact representation depends on what the system exposes.

The evaluator does not necessarily need every event.

The required evidence should be determined by the evaluation criteria.

This distinction is important because an agent's internal reasoning may not be directly observable or necessary for evaluation. A trustworthy evaluation system should rely on evidence that is both relevant to the criterion and legitimately available to the evaluator.

---

# 2. Why Evaluate the Trajectory?

A final outcome primarily answers:

> "Did the task appear to succeed?"

Trajectory evaluation asks an additional question:

> "Did the agent behave appropriately while attempting the task?"

Consider two agents.

### Agent A

```text
1. Search correct customer
2. Retrieve correct order
3. Check eligibility
4. Issue refund
5. Confirm refund
```

### Agent B

```text
1. Search customer
2. Retrieve wrong order
3. Attempt refund
4. Tool rejects request
5. Retrieve correct order
6. Issue refund
7. Confirm refund
```

Both may eventually produce:

```text
Refund completed.
```

An outcome-only evaluation may classify both as successful.

A trajectory evaluation can distinguish them because Agent B exhibited behavior that may violate requirements.

Whether that behavior constitutes a failure depends on the system requirements.

If the system requires:

- no action against the wrong order,
- no unnecessary refund attempts,
- or no unauthorized side effects,

then the trajectory may represent a serious failure even though the final outcome is correct.

Therefore:

> **Trajectory evaluation exists to measure behavioral properties that the final outcome cannot adequately reveal.**

---

# 3. End-to-End Evaluation vs Trajectory Evaluation

These are complementary evaluation levels.

## 3.1 End-to-End Evaluation

End-to-end evaluation primarily asks:

> Did the system produce the required result?

Example:

```text
Input:
"Find order #123 and tell me its delivery status."

Expected:
"Order #123 is out for delivery."

Observed:
"Order #123 is out for delivery."

Result:
PASS
```

This can be sufficient when the behavior requirements are simple and the risk is low.

---

## 3.2 Trajectory-Level Evaluation

Trajectory-level evaluation asks:

> What did the agent do while producing that result?

For example:

```text
Search Order #123
        ↓
Retrieve Order #123
        ↓
Read delivery status
        ↓
Return status
```

The evaluator can examine:

- whether the correct order was queried,
- whether the required tool was used,
- whether parameters were correct,
- whether unnecessary tools were called,
- whether the agent interpreted the result correctly,
- whether state remained consistent,
- whether the agent stopped when the task was complete.

---

## 3.3 Step-Level Evaluation

A trajectory can also be evaluated at individual steps.

For example:

| Step | Event | Evaluation |
|---|---|---|
| 1 | Search customer | Correct |
| 2 | Retrieve order | Correct |
| 3 | Search unrelated account | Unnecessary |
| 4 | Retrieve order again | Redundant |
| 5 | Issue refund | Correct |
| 6 | Report success | Correct |

This makes it possible to identify **where behavior diverged from expectations**.

---

## 3.4 These Levels Are Complementary

A production evaluation strategy may combine:

```text
                 Evaluation
                     │
          ┌──────────┴──────────┐
          │                     │
     Final Outcome          Trajectory
          │                     │
     Task Success        ┌──────┼──────┐
                         │      │      │
                       Tools  Plan   State
```

The appropriate depth depends on:

- risk,
- requirements,
- observability,
- failure consequences,
- and the engineering decision being made.

Not every task requires detailed trajectory evaluation.

---

# 4. What Evidence Exists in a Trajectory?

A useful evaluation model is:

```text
Agent Execution
      │
      ▼
Trajectory Evidence
      │
      ├── Observable Actions / Decision Outputs
      ├── Tool Calls
      ├── Tool Arguments
      ├── Tool Results
      ├── State Changes
      ├── Context Usage
      ├── Memory Usage
      ├── Intermediate Outcomes
      └── Final Outcome
```

The evaluator does not necessarily need every category.

The required evidence should come from the evaluation criteria.

For example:

> Requirement: "The agent must not send an email without explicit approval."

The evaluator may need:

- approval state,
- observable action or decision evidence,
- email tool invocation,
- tool parameters,
- resulting action.

It may not need every model token or internal reasoning trace.

This leads to an important principle:

> **Collect evidence that is sufficient to evaluate the requirement, not evidence merely because it is available.**

---

# 5. Tool-Use Evaluation

Tool use is one of the most visible forms of agent behavior.

An agent can fail even when the final answer looks plausible because it used tools incorrectly.

Tool evaluation can include several dimensions.

---

## 5.1 Correct Tool Selection

Ask:

> Did the agent select a tool appropriate for the task?

Example:

```text
get_order()
get_customer()
cancel_order()
send_email()
```

Task:

> "Check the current delivery status."

If the agent calls:

```text
cancel_order()
```

the behavior is clearly inappropriate.

Correct tool selection is therefore an evaluation property.

---

## 5.2 Correct Parameters

Selecting the correct tool is not sufficient.

Suppose the correct tool is:

```text
get_order(order_id)
```

The agent selects it correctly but sends:

```text
get_order(order_id="ORD-998")
```

when the user's requested order is:

```text
ORD-889
```

The tool choice is correct.

The invocation is not.

Therefore tool evaluation should distinguish:

```text
Tool Selection
       ↓
Parameter Construction
       ↓
Tool Invocation
```

---

## 5.3 Required Parameters

The evaluator can also determine whether required parameters were supplied.

For example:

```text
refund_order(
    order_id,
    amount,
    reason
)
```

If the agent invokes:

```text
refund_order(
    order_id="ORD-123",
    amount=500
)
```

but `reason` is required, the invocation is incomplete.

This can indicate:

- incorrect tool usage,
- incomplete task understanding,
- poor state handling,
- or inadequate adaptation to the tool contract.

The underlying tool contract and invocation mechanics belong to the appropriate tool-engineering chapter. This chapter evaluates the agent's behavior against those requirements.

---

# 6. Unnecessary Tool Calls

More tool calls are not automatically better.

Consider:

```text
1. Search customer
2. Get order
3. Get order again
4. Get order again
5. Return result
```

If one order lookup was sufficient, the additional calls may represent unnecessary behavior.

Possible consequences include:

- increased latency,
- increased cost,
- unnecessary external load,
- greater failure exposure,
- duplicated side effects,
- confusing traces,
- increased risk of inconsistent results.

However, the evaluator should not label every repeated call as a failure.

A repeated call may be justified when:

- the first call failed,
- the result changed,
- the system requires confirmation,
- the agent recovered from an error,
- or the environment is eventually consistent.

Therefore the correct evaluation question is:

> **Was the additional action justified by the task and the current execution state?**

Not:

> "Did the agent minimize the number of calls?"

---

# 7. Tool Failure Handling

Tools can fail.

Examples include:

```text
timeout
authentication failure
validation error
rate limit
not found
temporary service failure
partial result
```

The evaluation question becomes:

> What did the agent do after the tool failure?

Consider:

```text
Tool Call
    ↓
Timeout
    ↓
Agent retries
    ↓
Success
```

This may be acceptable.

Now consider:

```text
Tool Call
    ↓
Authorization Failure
    ↓
Agent retries repeatedly
    ↓
Same failure
    ↓
Continues acting
```

This may indicate poor failure handling.

The evaluator should consider:

- whether the agent recognized the failure,
- whether the next action was appropriate,
- whether retrying was justified,
- whether the agent incorporated information from the failure,
- whether it avoided repeated harmful actions,
- whether it communicated inability when necessary,
- whether it stopped when further action was not justified.

An important distinction is:

> **Retrying is not automatically recovery.**

For example:

```text
Timeout
   ↓
Retry
   ↓
Success
```

may represent useful recovery.

But:

```text
Validation Error
   ↓
Repeat identical invalid request
   ↓
Same Validation Error
   ↓
Repeat identical invalid request
```

does not demonstrate meaningful adaptation.

A useful evaluation question is:

> **Did the agent's subsequent behavior appropriately incorporate what it learned from the failure?**

The evaluation does not need to prescribe the complete retry architecture. It needs to determine whether observed behavior satisfies the relevant requirements.

---

# 8. Planning Evaluation

Agents may construct plans before or during execution.

A plan can be explicit:

```text
1. Find the customer
2. Find the order
3. Check eligibility
4. Issue refund
5. Confirm completion
```

Or implicit through sequential decisions.

Planning evaluation asks whether the observed planning behavior supports the task.

Important dimensions can include:

- goal alignment,
- decomposition,
- required steps,
- unnecessary steps,
- dependency handling,
- feasibility,
- ordering,
- adaptation,
- consistency,
- completion.

---

## 8.1 Goal Alignment

A plan should address the actual task.

Task:

> "Find the delivery status of order #123."

Plan:

```text
1. Find order #123
2. Read delivery status
3. Return status
```

This is aligned.

A plan such as:

```text
1. Search customer history
2. Analyze purchase preferences
3. Recommend products
4. Send marketing email
```

is unrelated.

---

## 8.2 Missing Steps

Suppose the task requires:

```text
Verify identity
    ↓
Check account
    ↓
Change phone number
```

But the plan is:

```text
Check account
    ↓
Change phone number
```

If identity verification is mandatory, the missing step is a behavioral failure.

---

## 8.3 Unnecessary Steps

Suppose the task requires:

```text
Retrieve invoice
```

The agent plans:

```text
1. Retrieve customer profile
2. Retrieve purchase history
3. Retrieve product catalog
4. Retrieve invoice
5. Analyze product preferences
6. Generate recommendation
```

The additional steps may be irrelevant.

Again, unnecessary does not always mean incorrect.

The evaluation must be tied to requirements, risk, and resource constraints.

---

## 8.4 Plan Feasibility

A plan can be logically coherent but impossible to execute.

Example:

```text
1. Retrieve deleted transaction
2. Modify transaction
3. Send updated transaction
```

If the underlying system does not permit retrieval of deleted transactions, the plan is not feasible.

Planning evaluation therefore asks:

> Does the proposed behavior make sense given the available capabilities and constraints?

---

# 9. Different Plans Can Be Correct

A major evaluation mistake is assuming that a single reference trajectory is always required.

Suppose a task is:

> "Find the user's latest invoice."

Two agents may execute:

### Trajectory A

```text
Search customer
    ↓
Get invoices
    ↓
Select latest
```

### Trajectory B

```text
Get customer account
    ↓
Retrieve latest invoice directly
```

If both satisfy the requirements, both may be valid.

Therefore:

> **Trajectory similarity is not the same as behavioral correctness.**

An evaluator should compare behavior against requirements and constraints rather than merely comparing the observed trajectory to a single example.

---

# 10. Planning Adaptation

A plan is not necessarily fixed after execution begins.

The environment may change.

For example:

```text
Initial Plan
    ↓
Retrieve order
    ↓
Check eligibility
    ↓
Refund
```

But:

```text
Retrieve order
      ↓
Order not found
      ↓
Adapt
      ↓
Search customer orders
      ↓
Locate alternate order
      ↓
Continue
```

The adaptation may be desirable.

An evaluator should therefore distinguish:

```text
Plan deviation
```

from:

```text
Bad plan deviation
```

A deviation can indicate:

- successful adaptation,
- recovery,
- environmental change,
- or failure.

The evidence and requirements determine which interpretation is appropriate.

---

# 11. State Evaluation

Agents often operate through changing state.

A simplified state model might be:

```text
Initial State
      ↓
Customer Identified
      ↓
Order Identified
      ↓
Eligibility Confirmed
      ↓
Refund Approved
      ↓
Refund Completed
```

The evaluator can examine whether state transitions were valid.

---

## 11.1 Expected State Transition

Suppose:

```text
Order Status:
PENDING
```

After a successful shipment confirmation:

```text
PENDING → SHIPPED
```

That transition may be expected.

---

## 11.2 Invalid State Transition

If the system records:

```text
PENDING → DELIVERED
```

without any evidence supporting delivery, the state transition may be invalid.

The evaluator should identify the behavioral discrepancy.

---

## 11.3 Missing State Update

Suppose:

```text
Refund completed successfully
```

but the agent's working state still says:

```text
refund_status = pending
```

The next decision may therefore be based on stale information.

This can create downstream errors.

---

## 11.4 Stale State

Consider:

```text
State:
order_status = PENDING
```

Then an external action changes the order:

```text
order_status = SHIPPED
```

But the agent continues operating from:

```text
PENDING
```

This is a state-consistency problem.

The evaluator can ask:

- Was the state updated?
- Was the latest state available?
- Did the agent use stale state?
- Did the stale state influence the next action?

---

## 11.5 State Consistency

Suppose two parts of the execution indicate:

```text
refund_status = completed
```

and later:

```text
refund_status = pending
```

without an explanation.

The evaluator should identify the inconsistency.

This does not automatically identify the underlying architectural cause.

Possible contributors could include:

- incorrect state update,
- stale retrieval,
- inconsistent external data,
- incorrect interpretation,
- synchronization failure.

Trajectory evaluation identifies the behavioral evidence; deeper diagnosis may require additional system investigation.

---

# 12. Intermediate Outcomes vs State

Intermediate outcomes and state are related, but they are not identical.

An **intermediate outcome** is an observed result produced during execution.

For example:

```text
Eligibility Check
        ↓
Tool Result:
eligible = true
```

State is the information the system or agent maintains for subsequent behavior:

```text
refund_eligible = true
```

A trajectory can therefore contain:

```text
Tool Result:
eligible = true
        ↓
State Update:
refund_eligible = false
        ↓
Next Decision:
Do not refund
```

The tool result may be correct while the state update is incorrect.

Conversely, the state may be correct while the next decision incorrectly interprets it.

This distinction helps localize behavioral divergence:

```text
External Result
      ↓
Interpretation
      ↓
State Update
      ↓
Next Decision
```

Evaluation should identify which observable stage failed rather than treating every downstream error as the same type of failure.

---

# 13. Context Usage Evaluation

Agents frequently operate using context containing:

- user instructions,
- previous conversation,
- retrieved information,
- tool results,
- system constraints,
- task-specific data.

Evaluation can ask whether the agent used the required context correctly.

---

## 13.1 Required Context Was Used

Task:

> "Use the customer's preferred language when responding."

Context contains:

```text
preferred_language = Tamil
```

The agent responds in Tamil.

This is evidence of correct context use.

---

## 13.2 Required Context Was Ignored

If the context clearly contains:

```text
preferred_language = Tamil
```

but the agent responds in another language, this may represent a behavioral failure.

---

## 13.3 Irrelevant Context Influence

Suppose the context contains:

```text
Customer:
Current request: Refund order #123

Historical preference:
Likes blue shoes.
```

The agent begins discussing blue shoes while processing the refund.

The issue is not simply that the context was available.

The issue is that irrelevant information influenced behavior.

---

## 13.4 Conflicting Context

Suppose the agent receives:

```text
Current instruction:
Refund order #123.
```

and an older context entry says:

```text
Do not refund order #123.
```

The evaluator must determine which information should govern behavior based on the system's requirements and context rules.

The important evaluation property is whether the agent handled the conflict appropriately.

---

# 14. Memory Behavior Evaluation

Memory introduces another class of observable behavior.

The evaluator can ask:

- Was required memory recalled?
- Was irrelevant memory used?
- Was stale memory used?
- Was conflicting memory handled correctly?
- Did memory influence behavior when it should not?
- Did the agent incorrectly treat uncertain memory as fact?

Consider:

```text
Stored Memory:
Customer prefers communication in Hindi.
```

Current task:

> "Explain the billing issue."

If language preference is relevant and the agent uses it appropriately, this may be correct.

Now consider:

```text
Stored Memory:
Customer once requested a refund six months ago.
```

Current task:

> "Show my latest invoice."

If the old refund history causes the agent to incorrectly assume that the current invoice is disputed, the memory influenced behavior incorrectly.

The evaluation concern is therefore not simply:

> "Did memory work?"

It is:

> **"Did memory influence behavior correctly for this task and context?"**

---

# 15. Intermediate Outcomes

Not every important evaluation signal occurs at the beginning or end.

Agents may produce intermediate outcomes such as:

```text
Customer identified
Order identified
Eligibility verified
Refund initiated
Refund confirmed
```

Each intermediate result can provide evidence.

Suppose:

```text
Order identified → Correct
Eligibility check → Incorrect
Refund → Successful
```

The final refund may still succeed because the external system rejected an invalid request and the agent later corrected itself.

The trajectory reveals information that the final result hides.

Intermediate outcomes are therefore useful for:

- locating behavioral divergence,
- understanding recovery,
- identifying unnecessary work,
- measuring progress,
- and diagnosing failures.

The distinction from state is important: an intermediate outcome describes something that happened or was observed during execution, while state describes information maintained for subsequent behavior. The two can diverge and should therefore be evaluated separately when the requirement depends on them.

---

# 16. Trajectory Evaluation at Different Granularities

Trajectory evaluation does not have to mean evaluating every event.

There are multiple granularities.

## Coarse Evaluation

```text
Input → Major Actions → Outcome
```

Useful when:

- the task is simple,
- detailed evidence is unnecessary,
- the risk is low.

---

## Step-Level Evaluation

```text
Step 1 → Correct
Step 2 → Correct
Step 3 → Incorrect
Step 4 → Recovered
```

Useful when:

- the execution path matters,
- failures need localization,
- tool behavior must be evaluated.

---

## Detailed Event Evaluation

```text
Decision Output
Tool
Arguments
Observation
State
Context
Next Decision Output
```

Useful when:

- risk is high,
- debugging is required,
- side effects matter,
- precise causal interpretation is needed.

The correct granularity depends on the evaluation question.

> **More evidence is not automatically better evidence.**

Excessive evidence can increase:

- storage cost,
- evaluation cost,
- evaluator complexity,
- noise,
- privacy exposure,
- and analysis burden.

---

# 17. Comparing Trajectories

Sometimes the goal is not simply to determine whether one trajectory passed.

We may need to compare:

```text
Agent Version A
```

against:

```text
Agent Version B
```

Suppose both complete 100 tasks successfully.

But their trajectories differ.

### Version A

```text
Average tool calls: 4
Unnecessary calls: 2%
Recovery success: 95%
```

### Version B

```text
Average tool calls: 7
Unnecessary calls: 18%
Recovery success: 82%
```

The final success rate alone hides a behavioral regression.

Trajectory comparison can therefore reveal changes in:

- efficiency,
- tool behavior,
- planning,
- state handling,
- recovery,
- unnecessary actions,
- termination behavior.

However, comparison must use predefined evaluation criteria.

A trajectory that looks more complex is not automatically worse.

---

# 18. Causal Interpretation of Agent Failures

Finding a failure is not the same as understanding the failure.

Suppose:

```text
Final Outcome:
Incorrect refund
```

A useful investigation might proceed as:

```text
Incorrect Outcome
      ↓
Where did behavior diverge?
      ↓
Incorrect order selected
      ↓
Why?
      ↓
Search result interpreted incorrectly
      ↓
Why?
      ↓
Relevant customer context was ignored
```

This creates a causal investigation chain.

A useful mental model is:

```text
Failure Outcome
      ↓
Behavioral Divergence
      ↓
Evidence
      ↓
Likely Contributing Cause
      ↓
System Component
      ↓
Reproduction
```

The important distinction is:

> **The observed trajectory tells us what happened. It may not, by itself, prove why it happened.**

Temporal order alone does not establish causation.

For example:

```text
Tool Call A
   ↓
External Service Changes
   ↓
Tool Call B Fails
```

The failure of Tool Call B may follow Tool Call A in the trajectory without being caused by Tool Call A. An external dependency, concurrent change, network condition, or other factor may have contributed.

Therefore causal interpretation should combine trajectory evidence with other available evidence rather than treating sequence alone as proof of root cause.

---

# 19. Failure Classification vs Root Cause

Suppose an agent sends an email to the wrong customer.

Observed behavior:

```text
Wrong customer selected
```

Possible contributing causes include:

- retrieval returned an incorrect customer,
- agent selected the wrong result,
- state contained stale customer identity,
- tool parameters were incorrect,
- context was misinterpreted,
- external data changed,
- identity resolution failed.

Therefore:

### Failure Classification

Describes what went wrong.

Example:

```text
Incorrect entity selection
```

### Root Cause Investigation

Attempts to determine why it went wrong.

Example:

```text
Search returned multiple candidates,
and the agent selected the wrong candidate
because the ranking evidence was ambiguous.
```

Evaluation should avoid claiming root cause when the available evidence only supports failure classification.

---

# 20. Termination Behavior Evaluation

Termination is part of observable agent behavior.

An agent should not be evaluated only on what actions it took, but also on whether it **stopped at the appropriate point**.

Relevant questions include:

- Did the agent stop after satisfying the task?
- Did it stop when further action was no longer justified?
- Did it continue making unnecessary calls?
- Did it terminate before required work was complete?
- Did it continue after an unrecoverable failure?
- Did it repeatedly perform actions after the relevant state had already been reached?

For example:

```text
Task Complete
      ↓
Agent Stops
```

may represent correct termination.

But:

```text
Task Complete
      ↓
Repeated Search
      ↓
Repeated Tool Call
      ↓
Repeated Tool Call
```

may represent unnecessary continuation.

Conversely:

```text
Required Verification
      ↓
Agent Stops
```

may represent premature termination.

Termination evaluation therefore asks:

> **Did the agent stop at a point justified by the task requirements and current execution state?**

This is an evaluation question, not a re-teaching of the architecture governing termination and bounded autonomy.

---

# 21. Example: Customer Support Agent

Consider an agent:

> "Refund my order #123 if it is eligible."

Trajectory:

```text
1. Search order #123
2. Retrieve order
3. Check refund eligibility
4. Eligibility = true
5. Call refund_order(order_id=123)
6. Refund succeeds
7. Confirm refund to customer
```

Evaluation:

| Dimension | Result |
|---|---|
| Correct order | Pass |
| Eligibility check | Pass |
| Tool selection | Pass |
| Tool parameters | Pass |
| Required state transition | Pass |
| Unnecessary actions | Pass |
| Termination | Pass |
| Final outcome | Pass |

This is a strong trajectory.

Now consider:

```text
1. Search order #123
2. Retrieve order #122
3. Check eligibility for #122
4. Refund #122
5. Search #123
6. Refund #123
7. Report success
```

The final requested refund may exist.

But the trajectory contains a serious behavioral problem.

Depending on the requirements, the first refund may be a critical side effect.

This demonstrates why outcome-only evaluation can be insufficient for side-effecting agents.

---

# 22. Example: Research Agent

Task:

> "Compare the latest quarterly revenue of Company A and Company B using reliable sources."

Trajectory:

```text
1. Search Company A quarterly report
2. Retrieve source
3. Extract revenue
4. Search Company B quarterly report
5. Retrieve source
6. Extract revenue
7. Compare values
8. Produce answer with citations
```

Possible evaluation dimensions:

- Were appropriate sources selected?
- Were the correct reporting periods used?
- Were values extracted correctly?
- Did the agent compare equivalent metrics?
- Did it ignore irrelevant search results?
- Did it identify conflicting sources?
- Did it support the final claims with evidence?

A final answer can appear reasonable while the trajectory reveals:

```text
Company A:
Q3 2026 revenue

Company B:
Q2 2026 revenue
```

The numerical comparison may therefore be invalid even if the arithmetic is correct.

---

# 23. Example: Coding Agent

Task:

> "Fix the failing test without changing the public API."

Trajectory:

```text
1. Inspect failing test
2. Inspect implementation
3. Identify bug
4. Modify internal implementation
5. Run tests
6. All tests pass
7. Report completion
```

Potential evaluation:

- Did the agent identify the correct failure?
- Did it modify the appropriate code?
- Did it preserve the public API?
- Did it run relevant tests?
- Did it introduce unrelated changes?
- Did it verify the fix?
- Did it stop after satisfying the task?

Now consider:

```text
1. Inspect failing test
2. Change public API
3. Modify unrelated modules
4. Disable failing test
5. Run tests
6. Tests pass
```

The final test result is misleading.

Trajectory evaluation exposes the behavioral violation.

---

# 24. Trajectory Evaluation and Verification Are Related but Different

Execution-time verification and systematic evaluation are not identical.

Verification may ask:

> "Is this current action acceptable before continuing?"

Evaluation asks:

> "Across defined cases, how reliably does the agent behave according to the expected criteria?"

For example:

```text
During Execution
    ↓
Verify proposed refund
    ↓
Continue
```

versus:

```text
Evaluation Dataset
    ↓
Run many refund scenarios
    ↓
Collect trajectories
    ↓
Measure correct/incorrect behavior
    ↓
Compare agent versions
```

Verification is part of execution control.

Evaluation is systematic measurement.

This chapter therefore evaluates trajectory behavior without taking ownership of the execution-time verification architecture.

---

# 25. Evidence Sufficiency for Trajectory Evaluation

A trajectory may contain a large amount of data but still be insufficient for evaluation.

Suppose the requirement is:

> "Never send an email without explicit user approval."

The trace contains:

```text
Tool Call:
send_email(...)
```

But it does not record:

```text
approval_status
```

The evaluator cannot reliably determine whether the email was authorized.

The problem is not necessarily that the agent failed.

The problem may be:

```text
Required Evidence Missing
```

This distinction matters:

```text
Evidence Available
        ≠
Evidence Sufficient
```

A trustworthy evaluation system must therefore ask:

> Do we have enough evidence to make the judgment?

If not, the appropriate result may be:

```text
Unable to determine
```

rather than:

```text
PASS
```

or:

```text
FAIL
```

This prevents false confidence.

---

# 26. Evaluating Trajectory Without Requiring Internal Reasoning

Trajectory evaluation does not require access to private internal reasoning.

Useful observable evidence can include:

- tool calls,
- tool arguments,
- tool results,
- state transitions,
- retrieved documents,
- intermediate outputs,
- external actions,
- final outputs,
- timestamps,
- error events.

For example:

```text
Decision Output:
Search order

Tool:
get_order

Arguments:
order_id=123

Observation:
status=SHIPPED

State:
order_status=SHIPPED
```

This can provide strong behavioral evidence without requiring hidden chain-of-thought.

The engineering requirement is **observable evidence sufficient for evaluation**, not unrestricted access to internal reasoning.

---

# 27. When Should Trajectory Evaluation Be Used?

Trajectory evaluation is especially valuable when:

### Side effects matter

Examples:

- financial transactions,
- account changes,
- emails,
- deletions,
- purchases.

### The final result can hide unsafe or incorrect behavior

Example:

```text
Correct answer
+
Unauthorized action
```

### Recovery behavior matters

Example:

```text
Tool failure
→ appropriate recovery
```

### Efficiency matters

Example:

```text
Successful task
+
10 unnecessary tool calls
```

### State correctness matters

Example:

```text
Correct final answer
+
incorrect intermediate state
```

### Planning behavior matters

Example:

```text
Task completed
+
unnecessary or infeasible actions
```

### Termination behavior matters

Example:

```text
Task completed
+
continued execution
```

Trajectory evaluation may be less valuable when:

- the task is low-risk,
- the final result fully captures the requirement,
- intermediate behavior has no meaningful acceptance criteria,
- or the required evidence is unavailable.

---

# 28. Risk-Based Evaluation Depth

Evaluation depth should match risk.

A useful conceptual model is:

```text
Low Risk
   ↓
Outcome Evaluation

Moderate Risk
   ↓
Outcome + Selected Behavioral Checks

High Risk
   ↓
Outcome + Trajectory + Constraint + Tool/State Checks
```

For example:

### Low-risk task

> "Summarize this paragraph."

Final output quality may be sufficient.

### Moderate-risk task

> "Search internal documentation and answer a technical question."

You may also evaluate:

- source selection,
- retrieval correctness,
- unsupported claims.

### High-risk task

> "Transfer money between accounts."

You may need to evaluate:

- identity verification,
- authorization,
- tool selection,
- parameters,
- approval state,
- state transitions,
- side effects,
- termination behavior.

There is no universal trajectory-evaluation depth.

The evaluation design should follow the actual requirements and consequences of failure.

---

# 29. Engineering Decision Framework

When deciding whether and how deeply to evaluate a trajectory, use the following sequence:

```text
1. What requirement are we testing?
          ↓
2. What behavior represents compliance?
          ↓
3. What evidence proves or disproves that behavior?
          ↓
4. Is that evidence available?
          ↓
5. Is it sufficient?
          ↓
6. What evaluation granularity is appropriate?
          ↓
7. What judgment should be produced?
          ↓
8. What engineering decision will use the result?
```

This prevents a common mistake:

> Collecting traces first and deciding what they mean later.

Evaluation should begin with the property being measured.

---

# 30. Common Trajectory-Evaluation Mistakes

## Mistake 1 — Evaluating Only the Final Answer

```text
Final answer = correct
→ PASS
```

This can miss:

- unauthorized actions,
- wrong tool use,
- incorrect state,
- unnecessary actions,
- unsafe intermediate behavior.

---

## Mistake 2 — Treating One Trajectory as the Gold Standard

A different trajectory may still be valid.

Evaluate against requirements, not superficial similarity.

---

## Mistake 3 — Penalizing Every Extra Action

Some extra actions are justified by:

- recovery,
- uncertainty,
- changed state,
- verification,
- external failures.

Evaluate necessity in context.

---

## Mistake 4 — Assuming More Steps Means Worse Behavior

A longer trajectory can be better if the additional steps are required.

---

## Mistake 5 — Ignoring Tool Parameters

Correct tool selection with incorrect parameters is still incorrect behavior.

---

## Mistake 6 — Ignoring State

The agent may appear successful while operating on stale or inconsistent state.

---

## Mistake 7 — Confusing Failure Classification With Root Cause

Observed behavior is evidence.

It is not automatically proof of the underlying cause.

---

## Mistake 8 — Evaluating What Cannot Be Observed

If required evidence is absent, do not invent certainty.

---

## Mistake 9 — Capturing Everything Without Purpose

A massive trace does not automatically create a better evaluation.

Evidence should serve an evaluation criterion.

---

## Mistake 10 — Requiring Deterministic Trajectories

A non-deterministic agent may produce different valid trajectories for the same task.

Evaluation should focus on acceptable behavior, not identical execution.

---

# 31. Production Perspective

In production, trajectory evaluation becomes useful when teams need to understand not only whether agents succeed, but **how they succeed and how they fail**.

A practical evaluation pipeline may look like:

```text
Production or Test Execution
          ↓
Trajectory Evidence
          ↓
Evidence Selection
          ↓
Behavioral Evaluation
          ↓
Failure Classification
          ↓
Metrics
          ↓
Engineering Decision
```

Possible engineering uses include:

- identifying tool-selection regressions,
- detecting unnecessary actions,
- discovering state inconsistencies,
- analyzing recovery behavior,
- investigating incidents,
- comparing agent versions,
- creating new regression cases from observed failures.

A production trace can reveal a previously unknown failure pattern.

That pattern can then become an evaluation case.

For example:

```text
Production Incident
       ↓
Observed trajectory
       ↓
Failure classification
       ↓
Root-cause investigation
       ↓
New evaluation case
       ↓
Regression suite
```

This creates a feedback loop between real-world behavior and systematic evaluation.

However, production observability and evaluation remain distinct.

Observability tells us what happened in a running system.

Evaluation determines how well behavior satisfies defined expectations.

---

# 32. Engineering Decisions and Trade-offs

## Outcome vs Trajectory Evaluation

| Approach | Strength | Limitation |
|---|---|---|
| Outcome-only | Simple, scalable | Can hide behavioral failures |
| Trajectory-aware | Rich behavioral evidence | More expensive and complex |
| Combined | Stronger coverage | Requires thoughtful evaluation design |

---

## Coarse vs Detailed Trajectory Evaluation

| Approach | Strength | Limitation |
|---|---|---|
| Coarse | Lower cost | May miss localized failures |
| Step-level | Good diagnostic value | More evaluation effort |
| Detailed | Strong evidence | Higher storage/evaluation complexity |

---

## Single Reference Trajectory vs Requirement-Based Evaluation

| Approach | Strength | Limitation |
|---|---|---|
| Single reference | Simple comparison | Can reject valid alternatives |
| Requirement-based | Supports multiple valid paths | Requires better criteria |
| Hybrid | Useful for constrained tasks | More design effort |

---

## More Evidence vs Less Evidence

More evidence can improve diagnostic capability.

But it can also increase:

- cost,
- noise,
- storage,
- privacy exposure,
- evaluator complexity.

The goal is not maximum evidence.

The goal is:

> **Sufficient evidence for a trustworthy evaluation decision.**

---

## 33. Relationship to File 03

This file focuses on **individual executions and their behavioral evidence**.

The next file moves from evaluating individual trajectories to designing a system that can evaluate **many executions repeatedly and consistently**.

That shift is important:

```text
Individual Execution
        ↓
Trajectory Evidence
        ↓
Trajectory Evaluation
        ↓
Many Executions
        ↓
Evaluation Dataset
        ↓
Metrics / Evaluators
        ↓
Regression Testing
```

File 03 will address:

- evaluation datasets,
- test-case design,
- representative coverage,
- edge and adversarial cases,
- golden datasets,
- evaluation splits,
- metrics,
- aggregation,
- uncertainty,
- evaluator reliability,
- LLM-as-a-judge,
- calibration,
- disagreement,
- evaluator bias and drift,
- contamination and leakage,
- benchmark gaming,
- regression testing,
- evaluation versioning,
- and release gates.

The distinction is therefore:

> **File 02 asks whether a particular execution behaved correctly. File 03 asks how to build a trustworthy evaluation system that can measure such behavior systematically across many executions and over time.**

---

# Production Checklist

Before relying on trajectory evaluation in an engineering process, ask:

- [ ] What behavioral property are we evaluating?
- [ ] Is the property derived from an actual requirement?
- [ ] What evidence is required?
- [ ] Is the evidence available?
- [ ] Is the evidence sufficient?
- [ ] Are tool selection and parameters evaluated where relevant?
- [ ] Are unnecessary actions evaluated where relevant?
- [ ] Is planning evaluated against requirements rather than one exact path?
- [ ] Are state transitions evaluated where state correctness matters?
- [ ] Is context and memory usage evaluated where relevant?
- [ ] Is termination behavior evaluated where relevant?
- [ ] Can we distinguish observed failure from suspected root cause?
- [ ] Are we avoiding causal claims based only on temporal sequence?
- [ ] Is the evaluation depth appropriate for the risk?
- [ ] Can the evaluator identify cases where the evidence is insufficient?
- [ ] Can valid alternative trajectories pass?
- [ ] Can production failures become future evaluation cases?

---

## Interview Questions

## 1. Why is final-answer evaluation sometimes insufficient for agents?

**Expected answer:**

Because an agent can produce a correct final result through incorrect behavior. It may use the wrong tool, make unauthorized actions, operate on stale state, take unnecessary actions, or violate constraints while still producing a plausible final answer. Trajectory evaluation provides evidence about the behavior that produced the result.

---

## 2. What is an agent trajectory?

**Expected answer:**

An agent trajectory is the ordered observable sequence of decisions, actions, tool calls, observations, state changes, intermediate outcomes, and final results produced while the agent attempts a task. The ordering matters because later behavior depends on earlier events and state.

---

## 3. Does every agent require detailed trajectory evaluation?

**Expected answer:**

No. Evaluation depth should match requirements, risk, failure consequences, and the information needed to make the engineering decision. Low-risk tasks may require only outcome evaluation, while high-risk side-effecting tasks may require detailed trajectory evaluation.

---

## 4. How would you evaluate tool use?

**Expected answer:**

I would evaluate whether the correct tool was selected, whether required parameters were correctly constructed, whether the invocation was appropriate, whether unnecessary calls were made, and whether tool failures were handled appropriately. The exact dimensions should come from system requirements.

---

## 5. Why should an evaluator not require one exact reference trajectory?

**Expected answer:**

Because multiple execution paths can satisfy the same requirements. A trajectory should be judged against acceptance criteria and behavioral requirements rather than superficial similarity to one example.

---

## 6. How would you evaluate planning?

**Expected answer:**

I would examine goal alignment, decomposition, required and unnecessary steps, dependencies, feasibility, ordering, adaptation, consistency, and completion. I would evaluate the plan against task requirements rather than assuming one exact plan is correct.

---

## 7. What is the difference between an intermediate outcome and state?

**Expected answer:**

An intermediate outcome is an observed result produced during execution, while state is information maintained for subsequent behavior. A correct tool result can be followed by an incorrect state update, so they should be evaluated separately when the requirement depends on both.

---

## 8. What is the difference between a state error and a final-answer error?

**Expected answer:**

A state error occurs when the agent's working or externally relevant state becomes incorrect, stale, missing, or inconsistent. It may or may not immediately produce an incorrect final answer, but it can influence later decisions and cause downstream failures.

---

## 9. Why is failure classification different from root-cause analysis?

**Expected answer:**

Failure classification describes what behavior went wrong. Root-cause analysis attempts to determine why it went wrong and which system component contributed. A trajectory can provide strong evidence of the failure without proving the underlying cause.

---

## 10. What does "evidence sufficiency" mean?

**Expected answer:**

It means that the available evidence is adequate to support the evaluation judgment. A trace can contain substantial information while still missing the specific evidence required to determine whether a behavior was compliant.

---

## 11. Can a longer trajectory be better than a shorter trajectory?

**Expected answer:**

Yes. Length alone does not determine quality. Additional steps may be required for verification, recovery, changed environmental conditions, or task constraints. The evaluation should determine whether the actions were justified.

---

## 12. Is a retry automatically evidence of successful recovery?

**Expected answer:**

No. Recovery requires an appropriate response to the failure. Repeating the same invalid action without incorporating information from the failure is not meaningful recovery.

---

## 13. How can a production incident improve evaluation?

**Expected answer:**

The incident can provide a real failure trajectory. Engineers can classify the failure, investigate its cause, convert the scenario into an evaluation case, add it to a regression suite, and use it to prevent recurrence.

---

## Quick Revision

### What is a trajectory?

The ordered observable execution evidence showing how an agent behaved while attempting a task.

### Why evaluate it?

Because the final outcome may not reveal whether the agent behaved correctly.

### What can be evaluated?

- Tool selection
- Tool parameters
- Tool failures
- Unnecessary actions
- Planning
- Plan adaptation
- State transitions
- Context usage
- Memory behavior
- Intermediate outcomes
- Termination behavior
- Final outcomes

### What should determine evaluation criteria?

System requirements and acceptance criteria.

### Does one correct trajectory exist?

Not necessarily. Multiple trajectories may be valid.

### Is more evidence always better?

No. Evidence should be sufficient for the evaluation decision.

### Does a trajectory prove root cause?

No. It provides behavioral evidence that supports investigation.

### Is temporal order enough to prove causation?

No. Sequence can provide useful evidence, but causal claims require appropriate supporting evidence.

### Does every task need trajectory evaluation?

No. Evaluation depth should match risk and requirements.

### What is the core model?

```text
Task
  ↓
Agent Execution
  ↓
Trajectory
  ↓
Evidence
  ↓
Behavioral Evaluation
  ↓
Failure Classification
  ↓
Engineering Decision
```

---

# Key Takeaways

1. **A trajectory is ordered evidence of how an agent behaved during execution.**
2. **Final outcomes and behavioral trajectories answer different evaluation questions.**
3. **Tool selection alone is insufficient; parameters and invocation behavior may also matter.**
4. **Unnecessary actions should be evaluated in context rather than by simple step counting.**
5. **Planning should be judged against requirements, not one exact reference trajectory.**
6. **Different valid execution paths can produce equally correct behavior.**
7. **State evaluation is important when later behavior depends on intermediate state.**
8. **Intermediate outcomes and state are related but distinct evidence types.**
9. **Context and memory should be evaluated according to how they influence behavior.**
10. **Intermediate outcomes can reveal failures hidden by successful final results.**
11. **Observed behavioral failure is not automatically the same as root cause.**
12. **Temporal sequence alone does not establish causation.**
13. **Evidence availability is different from evidence sufficiency.**
14. **Trajectory evaluation should not require access to private internal reasoning.**
15. **Termination behavior is part of trajectory quality when stopping behavior matters to the requirement.**
16. **Retrying is not automatically recovery; recovery requires appropriate adaptation to failure.**
17. **Evaluation depth should match risk, requirements, and consequences of failure.**
18. **More trace data does not automatically produce better evaluation.**
19. **Production failures can become valuable regression cases.**
20. **Trajectory evaluation complements, rather than replaces, outcome evaluation.**

---

## Further Reading

Continue with:

- [03 — Agent Evaluation Sets, Metrics, and Regression Testing](03-Agent-Evaluation-Sets-Metrics-and-Regression-Testing.md)

Related chapters:

- AGT-02 — Agent Runtime Loop and Decision Execution
- AGT-03 — Tool Use and Tool Invocation
- AGT-04 — Agent State, Context, and Memory
- AGT-05 — Agent Verification and Critique
- AGT-06 — Agent Workflow Orchestration
- AGT-07 — Human-in-the-Loop and Intervention
- AGT-08 — Agent Interoperability
- AGT-09 — Multi-Agent Architecture
- AGT-11 — Agent Failure, Recovery, Safety, and Termination
- AGT-12 — Agent Architecture and System Design

These chapters own the underlying architecture and execution mechanisms. **AGT-10 owns the systematic evaluation of their observable behavior.**
