# Tool Failures, Side Effects, Idempotency and Invocation Boundaries

## 03 — Tool Failures, Side Effects, Idempotency and Invocation Boundaries

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain what happens after a tool invocation crosses into the execution layer.
- Distinguish invocation, execution, transport success, tool success, and business outcome.
- Understand the lifecycle of an externally executed tool action.
- Classify common tool execution failures.
- Explain timeout behavior and why a timeout does not always mean that an action did not occur.
- Understand side effects and why they change failure-handling considerations.
- Explain idempotency and its relationship to safe repetition of an action.
- Distinguish retryability from retry safety.
- Understand partial, incomplete, stale, invalid, and ambiguous tool results.
- Explain how tool results become observations for the agent runtime.
- Design result and failure representations that preserve useful diagnostic information.
- Identify the boundary between action-level execution semantics and broader reliability/recovery strategy.

---

## Prerequisites

Before reading this chapter, you should understand:

- Agent definitions and system boundaries.
- Agent runtime and execution loops.
- Tool definitions, contracts, and capability boundaries.
- Tool discovery, selection, routing, argument construction, and invocation.

These concepts are established in:

- [AGT-01 — Agent Definition and System Boundaries](../AGT-01-Agent-Systems-Foundations/Readme.md)
- [AGT-02 — Agent Runtime and Execution](../AGT-02-Agent-Runtime-Loops-and-Bounded-Autonomy/Readme.md)
- [01 — Tool Definitions, Contracts & Capability Boundaries](./01-Tool-Definitions-Contracts-and-Capability-Boundaries.md)
- [02 — Tool Selection, Routing and Execution](./02-Tool-Selection-Routing-and-Execution.md)

---

## Estimated Reading Time

**30–35 minutes**

---

## Before We Start

File 02 ended at the invocation boundary:

```text
Action Need
    ↓
Discovery
    ↓
Selection
    ↓
Routing
    ↓
Argument Construction
    ↓
Contract Validation
    ↓
Invocation
    ↓
Execution Layer
```

File 03 begins here.

The central question is:

> **What actually happened after the invocation was handed to the execution layer?**

Consider:

```text
invoke("create_order", {...})
```

Several different outcomes are possible:

```text
Request rejected before execution
Request reached the service
Service started processing
Service completed successfully
Service failed
Service timed out
Response was lost
Response was incomplete
Response was ambiguous
Business outcome is unknown
```

These situations cannot safely be collapsed into:

```text
success
```

or:

```text
failure
```

Production agent systems need a richer execution model.

---

# Why This Exists

External actions introduce uncertainty.

An agent may request:

```text
send_email
```

and receive:

```text
timeout
```

But what does that mean?

Possibilities include:

```text
A. The request never reached the email service.

B. The request reached the service but was rejected.

C. The service accepted the request and processed it.

D. The email was sent, but the response was lost.

E. The system cannot currently determine what happened.
```

These cases have very different consequences.

If the operation is read-oriented:

```text
get_order()
```

another attempt may often be technically possible and relatively low-risk.

If the operation has a side effect:

```text
charge_card()
```

repeating the operation after an uncertain outcome could potentially create a duplicate charge.

Therefore:

> **Execution outcome handling must consider action semantics, side effects, and what the execution layer can actually establish about the external operation.**

AGT-03 establishes those execution facts and action-level semantics.

Broader retry, recovery, fallback, containment, and reliability policy belongs to the appropriate reliability and safety layer, including AGT-11.

---

# Mental Model

A useful execution model is:

```text
                 Invocation
                     │
                     ▼
              Execution Start
                     │
                     ▼
              External Action
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
       Success     Failure    Unknown
          │          │          │
          └──────────┼──────────┘
                     ▼
                Tool Result
                     │
                     ▼
              Result Assessment
                     │
                     ▼
             Runtime Observation
```

The important distinction is that:

```text
Execution State
    ↓
Tool Result
    ↓
Runtime Observation
```

are related but not identical.

The tool execution layer produces an execution result.

The runtime then consumes that result as an observation that may influence continuation or termination.

AGT-03 owns how the action execution produces and represents the result.

AGT-02 owns what the runtime does with the resulting observation.

---

# Core Concepts

## 1. Invocation Boundary

An invocation is the handoff created by File 02.

Conceptually:

```text
File 02
──────────────────────────────

Selected Tool
     ↓
Arguments
     ↓
Validation
     ↓
Invocation Request

──────────────────────────────
          Boundary
──────────────────────────────

Execution Layer
```

The invocation boundary should be explicit.

An invocation may contain:

```text
tool identity
arguments
request identifier
correlation identifier
execution context
metadata
```

The exact structure depends on the implementation.

The important point is:

> **Invocation establishes a request to perform an action; it does not establish that the action occurred successfully.**

---

## 2. Invocation and Execution Lifecycle

A useful lifecycle is:

```text
Invocation Requested
        ↓
Accepted / Rejected
        ↓
Execution Started / Not Started
        ↓
External Operation
        ↓
Completed / Failed / Timed Out
        ↓
Outcome Classified
        ↓
Tool Result
```

Not every invocation reaches every state.

For example:

```text
Invocation
    ↓
Rejected
```

may occur before the external operation starts.

Another execution may become:

```text
Invocation
    ↓
Accepted
    ↓
Started
    ↓
Timeout
```

The execution layer should preserve enough information to distinguish these states where that distinction matters.

---

## 3. Invocation Success Is Not Business Success

Consider:

```text
create_order(...)
```

The execution layer may successfully send the request:

```text
HTTP 202 Accepted
```

That does not necessarily mean:

```text
Order successfully created
```

The service may have:

- accepted the request for asynchronous processing,
- queued the operation,
- partially processed it,
- or failed later.

Therefore:

```text
Invocation Success
    ≠
Execution Success
    ≠
Business Outcome Success
```

These are different claims.

A production system should avoid collapsing them into one Boolean whenever the distinction matters.

---

## 4. Transport Success vs Tool Success

Suppose a tool internally uses HTTP.

The transport layer returns:

```text
HTTP 200
```

That tells us something about the transport interaction.

It does not automatically prove that the tool's business operation succeeded.

For example:

```json
{
  "status": "failed",
  "reason": "insufficient_balance"
}
```

could be returned through a perfectly successful HTTP request.

Therefore:

```text
Transport Success
    ≠
Tool Success
```

The tool contract determines how the response should be interpreted.

---

## 5. Result Production

After execution, the system needs to produce a tool result.

A result should communicate enough information for the runtime to understand what happened.

Conceptually:

```text
Tool Result
├── execution status
├── output
├── error information
├── metadata
└── outcome confidence / ambiguity where applicable
```

For example:

```json
{
  "status": "success",
  "data": {
    "order_id": "O123",
    "status": "shipped"
  }
}
```

A failure might look like:

```json
{
  "status": "failed",
  "error": {
    "type": "validation_error",
    "message": "Order O123 does not belong to customer C123"
  }
}
```

The exact representation depends on the tool contract and runtime architecture.

---

## 6. Result Normalization

Different external systems may return very different representations.

For example:

```text
Service A:
HTTP response

Service B:
SDK exception

Service C:
gRPC status

Service D:
Structured domain result
```

The tool execution boundary can normalize these into a consistent tool-result model.

Conceptually:

```text
External System A ──┐
External System B ──┤
External System C ──┼──→ Tool Result Model
External System D ──┘
```

Normalization makes downstream reasoning easier.

However, normalization must not erase important distinctions.

For example:

```text
timeout
```

should not automatically become:

```text
generic_failure
```

if the runtime needs to know that the external outcome may be unknown.

---

## 7. Result Trust

A tool result is evidence about an external operation.

It should not automatically be treated as perfect truth.

Consider:

```text
Tool:
get_customer_balance
```

The tool returns:

```json
{
  "balance": 1000
}
```

That result may be:

- valid,
- stale,
- incomplete,
- incorrectly generated,
- incorrectly transformed,
- or based on an unavailable upstream dependency.

Therefore:

> **A successful tool result is evidence produced by an execution path, not an absolute guarantee that the represented world state is correct.**

This is particularly important when tool outputs influence consequential decisions.

---

## 8. Complete vs Incomplete Results

A tool can execute successfully while producing incomplete information.

For example:

```text
search_orders()
```

returns:

```text
10 results
```

when the actual matching set contains:

```text
500 results
```

The execution itself may have succeeded.

The information may still be incomplete.

Therefore:

```text
Execution Success
    ≠
Complete Information
```

The result contract should communicate pagination, truncation, partial data, or other relevant completeness information where applicable.

---

## 9. Correctness vs Completeness

These are separate dimensions.

A result may be:

```text
Complete + Correct
Complete + Incorrect
Incomplete + Correct
Incomplete + Incorrect
```

For example:

```text
Search returned 20 of 20 matching records.
```

could be complete but contain incorrect records due to an upstream data problem.

Conversely:

```text
Search returned the first 20 of 100 matching records.
```

could be correct but incomplete.

Therefore:

> **Completeness and correctness should not be treated as the same property.**

---

## 10. Action-Level Failure

An action-level failure occurs when the requested tool operation cannot produce the expected result.

Examples include:

```text
invalid input
authorization failure
dependency failure
service rejection
execution exception
timeout
rate limit
resource unavailable
malformed response
```

These failures should be represented with enough detail to support appropriate downstream handling.

A generic:

```text
tool failed
```

is often insufficient for production systems.

---

## 11. Failure Taxonomy

A useful conceptual taxonomy is:

```text
Action Failure
│
├── Pre-execution failure
│   ├── invalid invocation
│   ├── authorization rejection
│   └── unavailable capability
│
├── Execution failure
│   ├── service error
│   ├── dependency failure
│   ├── resource exhaustion
│   └── execution exception
│
├── Communication failure
│   ├── connection failure
│   ├── response loss
│   └── timeout
│
└── Result failure
    ├── malformed result
    ├── incomplete result
    └── semantically invalid result
```

The exact taxonomy should be adapted to the system.

The purpose is to preserve distinctions that influence what can safely be concluded about the action.

---

## 12. Timeouts

Timeouts are particularly important because they can create uncertainty.

Suppose:

```text
charge_card(...)
```

is sent to a payment service.

The client waits:

```text
30 seconds
```

and receives:

```text
timeout
```

There are at least two possibilities:

```text
A. Request never reached the service.

B. Service processed the charge, but the response did not reach the client.
```

The client may not know which occurred.

Therefore:

> **A timeout can mean that the caller stopped waiting, not necessarily that the external action did not happen.**

This distinction is fundamental to action-level retry-safety analysis.

The broader decision about whether the system should retry, recover, fall back, or escalate belongs to the appropriate reliability/recovery policy.

---

## 13. Known Failure vs Unknown Outcome

Consider:

```text
Request rejected before execution
```

The outcome is relatively clear:

```text
Action did not execute.
```

Compare:

```text
Request sent
    ↓
Connection lost
    ↓
No response
```

Now the outcome may be:

```text
Unknown
```

The system should distinguish:

```text
Known Failure
```

from:

```text
Unknown Outcome
```

where the architecture permits that distinction.

This distinction is especially important for side-effecting actions.

---

## 14. Side Effects

A side effect is a change caused outside the immediate computation.

Examples:

```text
send_email
create_order
delete_record
charge_card
update_profile
publish_event
create_ticket
```

Compare:

```text
get_order()
```

with:

```text
cancel_order()
```

The first is generally read-oriented.

The second changes external state.

This difference affects action-level failure analysis.

For a read:

```text
get_order()
    ↓
timeout
    ↓
another attempt may be technically possible
```

For a side effect:

```text
cancel_order()
    ↓
timeout
    ↓
repetition may create an unintended duplicate or repeated effect
```

Therefore:

> **Execution analysis must consider whether the action can change external state.**

---

## 15. Side-Effect Semantics Belong to the Action Contract

Side effects should not be treated as an implementation detail.

The execution layer needs to know whether an operation is:

```text
read-only
```

or:

```text
state-changing
```

and, where relevant:

```text
idempotent
non-idempotent
conditionally idempotent
```

These semantics influence how an uncertain execution outcome can be interpreted and what repetition risks exist.

File 01 establishes these as tool-contract concerns.

File 03 applies those semantics during actual execution and failure analysis.

---

## 16. Idempotency

An operation is idempotent when repeating the same operation under the relevant definition does not create additional unintended effect beyond the first successful application.

A simplified example:

```text
set_user_status("active")
```

may be idempotent:

```text
active → active
```

while:

```text
increment_balance(100)
```

is generally not idempotent:

```text
100 → 200 → 300
```

if repeated.

The important engineering question is not:

> "Can I retry this?"

It is:

> **"If this action is repeated, what could happen?"**

---

## 17. Idempotency Is Not Reliability

These concepts are different.

### Idempotency

Describes the effect of repeated execution.

### Reliability

Describes how consistently a system performs correctly under expected conditions.

An operation can be:

```text
Idempotent + unreliable
```

or:

```text
Non-idempotent + reliable
```

Therefore:

```text
Idempotent
    ≠
Reliable
```

Idempotency can reduce the risk of unintended duplicate effects.

It does not guarantee:

- availability,
- correctness,
- reliability,
- or successful execution.

---

## 18. Retryability vs Retry Safety

This distinction is critical.

### Retryability

Means another execution attempt is technically possible.

### Retry Safety

Means repeating the action would not create an unacceptable or unintended effect under the known execution state and action semantics.

For example:

```text
get_order()
```

may be technically retryable and usually low-risk.

But:

```text
charge_card()
```

may also be technically retryable while being unsafe to repeat blindly.

Therefore:

```text
Retryable
    ≠
Safe to Retry
```

AGT-03 should provide the execution facts and action semantics needed for this assessment.

It does **not** own the broader system policy that decides whether to retry.

---

## 19. Idempotency Keys

A common pattern for side-effecting operations is an idempotency key.

Conceptually:

```text
Client
  │
  │ request_id = ABC123
  ▼
Payment Service
```

If the same logical request is submitted again:

```text
request_id = ABC123
```

the receiving service can recognize that the request may already have been processed.

Conceptually:

```text
First request:
ABC123 → process

Repeated request:
ABC123 → recognize existing operation
```

The exact semantics depend on the service contract.

An idempotency key is not automatically sufficient merely because a field named `idempotency_key` exists.

The receiving system must actually enforce the intended semantics.

---

## 20. Invocation Identity

Production execution often benefits from explicit identifiers.

For example:

```text
invocation_id
request_id
correlation_id
idempotency_key
```

These identifiers can serve different purposes.

### Invocation ID

Identifies a particular invocation attempt.

### Request ID

Identifies a logical request.

### Correlation ID

Connects related events across components.

### Idempotency Key

Helps identify repeated submissions of the same logical side-effecting operation when supported by the receiving system.

These identifiers should not automatically be treated as interchangeable.

---

## 21. Retry-Relevant Execution State

Before any broader reliability policy evaluates a retry, the execution layer may need to establish facts such as:

```text
Was the invocation accepted?
Did execution start?
Was the external request transmitted?
Was a response received?
Was the response authoritative?
Did the operation produce a known side effect?
Is the outcome unknown?
Is the operation idempotent?
```

These are **execution facts and action semantics**.

The execution layer should expose them accurately.

The broader reliability layer can then apply system policy.

Conceptually:

```text
AGT-03
Execution Facts + Action Semantics
              ↓
AGT-11
Reliability / Recovery Policy
              ↓
Retry / Recover / Fallback / Escalate / Contain
```

This distinction prevents action execution from absorbing broader reliability architecture.

---

## 22. Partial Execution

Some operations may complete partially.

For example:

```text
create_order
    ↓
Order created
    ↓
Notification service failed
```

The primary operation may have succeeded while a secondary step failed.

A single:

```text
failure
```

may therefore hide useful information.

The result model should preserve meaningful execution state where the underlying system can establish it.

---

## 23. Ambiguous Outcomes

An ambiguous outcome occurs when the system cannot confidently determine the external state after an invocation.

Example:

```text
send_email
    ↓
request transmitted
    ↓
connection lost
    ↓
no response
```

Possible state:

```text
Email sent
    ?
```

The system should not automatically report:

```text
Email definitely not sent.
```

nor:

```text
Email definitely sent.
```

if the available evidence supports neither conclusion.

A useful conceptual result is:

```text
status = unknown
```

with supporting metadata describing why.

---

## 24. Result Status Model

A practical result model may distinguish:

```text
SUCCESS
FAILURE
UNKNOWN
```

with additional detail.

For example:

```json
{
  "status": "unknown",
  "reason": "timeout_after_request_transmission",
  "invocation_id": "INV-123"
}
```

This is more useful than:

```json
{
  "status": "failed"
}
```

because the latter incorrectly implies that the external operation definitely failed.

The exact schema should be designed according to system requirements.

---

## 25. Tool Result vs Runtime Observation

The execution layer may produce:

```text
Tool Result
```

The runtime then consumes it as:

```text
Observation
```

Conceptually:

```text
External System
      ↓
Execution Layer
      ↓
Tool Result
      ↓
Runtime Observation
      ↓
Agent Runtime
```

AGT-03 owns:

```text
External System
      ↓
Execution Layer
      ↓
Tool Result
```

AGT-02 owns what the runtime does after receiving:

```text
Runtime Observation
```

For example:

```text
Observation:
order lookup failed

Runtime:
terminate
retry
request clarification
select another action
```

Those continuation decisions belong to the runtime and broader agent behavior, not to the tool-execution chapter.

---

# Internal Working

A more detailed execution pipeline is:

```text
                 Invocation Request
                        │
                        ▼
                Execution Admission
                        │
                  ┌─────┴─────┐
                  ▼           ▼
               Reject       Accept
                              │
                              ▼
                       Execution Attempt
                              │
                              ▼
                       External Operation
                              │
                 ┌────────────┼────────────┐
                 ▼            ▼            ▼
              Success       Failure      Timeout
                 │            │            │
                 │            │            ▼
                 │            │      Outcome Known?
                 │            │            │
                 │            │       ┌────┴────┐
                 │            │      Yes        No
                 │            │       │          │
                 └────────────┴───────┼──────────┘
                                      ▼
                               Result Normalization
                                      │
                                      ▼
                                Result Validation
                                      │
                                      ▼
                                  Tool Result
                                      │
                                      ▼
                              Runtime Observation
```

Several important boundaries exist here.

### Execution Admission

Determines whether the invocation can enter execution.

### Execution Attempt

Represents the attempt to perform the operation.

### External Operation

The operation occurs outside the immediate agent runtime boundary.

### Result Normalization

Converts execution outcomes into a consistent result representation.

### Result Validation

Checks whether the returned result conforms to the expected result contract.

### Runtime Observation

The normalized result becomes information available to the runtime.

---

# Example / Practical Implementation

The following simplified Python example demonstrates an execution wrapper that distinguishes success, known failure, and unknown outcome.

```python
from dataclasses import dataclass
from typing import Any, Callable

@dataclass
class ToolResult:
    status: str
    data: Any = None
    error: str | None = None
    invocation_id: str | None = None

class ExecutionTimeout(Exception):
    pass

def execute_tool(
    handler: Callable[..., Any],
    arguments: dict[str, Any],
    invocation_id: str,
) -> ToolResult:
    try:
        result = handler(**arguments)

        return ToolResult(
            status="success",
            data=result,
            invocation_id=invocation_id,
        )

    except ExecutionTimeout:
        return ToolResult(
            status="unknown",
            error="Execution timed out; external outcome may be unknown.",
            invocation_id=invocation_id,
        )

    except ValueError as exc:
        return ToolResult(
            status="failure",
            error=str(exc),
            invocation_id=invocation_id,
        )

    except Exception as exc:
        return ToolResult(
            status="failure",
            error=f"Execution failed: {exc}",
            invocation_id=invocation_id,
        )
```

The important design choice is:

```text
Timeout
    ↓
UNKNOWN
```

rather than automatically:

```text
Timeout
    ↓
FAILURE
```

when the execution architecture cannot establish whether the external operation occurred.

This example is intentionally simplified. A production implementation would normally distinguish error classes more precisely and preserve structured execution metadata.

---

# Practical Example: Side-Effecting Action

Consider a payment operation:

```python
def charge_customer(customer_id: str, amount: int):
    # external side effect
    ...
```

Suppose the execution sequence is:

```text
Client
  ↓
Payment Service
  ↓
Charge processed
  ↓
Response lost
  ↓
Client timeout
```

The client observes:

```text
timeout
```

but the external state may be:

```text
charge occurred
```

If the client blindly retries:

```text
charge_customer(...)
```

the customer could potentially be charged twice.

A safer architecture may use:

```text
logical_request_id = PAY-123
```

and a payment-service contract that guarantees appropriate idempotency behavior for repeated submissions.

The key engineering lesson is:

> **The execution layer must preserve enough information about side effects and uncertainty for the consuming reliability layer to make an informed decision.**

---

# Production Perspective

Production tool execution should preserve enough information to answer:

```text
What was invoked?
When?
With which logical request?
Did execution begin?
Did the external system respond?
What did it report?
Was the result structurally valid?
Was the outcome known?
Was the action side-effecting?
What idempotency semantics applied?
What execution facts are relevant to repetition?
```

A useful execution record might conceptually contain:

```text
invocation_id
request_id
tool_name
execution_started_at
execution_completed_at
execution_status
result_status
error_type
error_code
timeout_state
side_effect_profile
idempotency_context
correlation_id
```

The record should distinguish **execution facts** from **policy decisions**.

For example:

```text
Execution fact:
response was not received after request transmission.

Policy decision:
retry the operation.
```

The first belongs to the execution boundary.

The second belongs to the broader reliability/runtime policy.

Sensitive arguments and outputs should not automatically be recorded in plaintext.

Production observability should apply:

- data minimization,
- access controls,
- retention policies,
- redaction,
- appropriate correlation identifiers.

---

# Engineering Decisions and Trade-offs

## 1. Preserve Failure Detail vs Simplify the Result Model

A system can simplify all failures:

```text
anything unexpected
    ↓
FAILURE
```

This is easy to implement.

But it can destroy important information.

For example:

```text
timeout
```

may mean:

```text
known failure
```

or:

```text
unknown outcome
```

Preserving that distinction requires a richer result model but enables safer downstream reasoning.

---

## 2. Automatic Retry vs Explicit Reliability Policy

Automatic retries can improve resilience for transient failures.

However, indiscriminate retries can create:

- duplicate side effects,
- increased load,
- cascading failures,
- unexpected costs.

AGT-03 should therefore expose:

```text
execution outcome
failure classification
side-effect semantics
idempotency semantics
retry-relevant execution facts
```

The broader decision to:

```text
retry
recover
fallback
escalate
contain
```

belongs to the reliability/recovery policy layer.

This keeps AGT-03 focused on **what happened and what the action semantics imply**, rather than owning the complete reliability strategy.

---

## 3. Simple Result Model vs Rich Result Model

A simple model:

```text
success
failure
```

is easy to implement.

A richer model:

```text
success
failure
unknown
partial
invalid
```

can preserve more operational meaning.

The trade-off is increased complexity.

The correct result model depends on:

- action criticality,
- side-effect risk,
- downstream decision requirements,
- and the guarantees available from the external system.

---

## 4. Synchronous vs Asynchronous Execution

### Synchronous

```text
Invocation
    ↓
Wait
    ↓
Result
```

Advantages:

- simple mental model,
- straightforward request/response handling.

Disadvantages:

- long-running operations can consume resources,
- timeout behavior becomes important.

### Asynchronous

```text
Invocation
    ↓
Accepted
    ↓
Operation ID
    ↓
Later Status Query
```

Advantages:

- useful for long-running operations,
- caller does not need to remain blocked.

Disadvantages:

- completion and failure may occur later,
- outcome tracking becomes more complex.

The agent-facing tool contract should make the relevant execution semantics explicit.

---

# Common Mistakes and Misconceptions

## Mistake 1 — Treating Timeout as Proof of Failure

A timeout means the caller stopped waiting.

It does not always prove that the external action failed.

---

## Mistake 2 — Retrying Every Failure

Not every failure is transient.

Not every operation is safe to repeat.

A retry decision requires:

```text
failure classification
+
action semantics
+
execution certainty
+
system reliability policy
```

---

## Mistake 3 — Assuming Idempotency Means the Operation Will Succeed

Idempotency describes repeated effects.

It does not guarantee:

- availability,
- correctness,
- reliability,
- or successful execution.

---

## Mistake 4 — Assuming a Request ID Automatically Provides Idempotency

A field named:

```text
request_id
```

does not automatically make an operation idempotent.

The receiving system must implement and enforce the relevant semantics.

---

## Mistake 5 — Treating Transport Success as Business Success

An HTTP 200 response can contain:

```json
{
  "status": "failed"
}
```

The transport succeeded.

The business operation did not.

---

## Mistake 6 — Treating Every Result as Complete and Correct

A tool may return:

```text
partial
```

or:

```text
stale
```

information while still executing successfully.

Result quality and execution success are separate concerns.

---

## Mistake 7 — Hiding Unknown Outcomes

Reporting:

```text
timeout → failed
```

when the actual state is:

```text
unknown
```

can cause unsafe downstream behavior.

---

## Mistake 8 — Mixing Tool Execution With Runtime Recovery

AGT-03 should represent:

```text
what happened during the action
```

and the action-level semantics relevant to interpreting that outcome.

AGT-02 and AGT-11 address broader questions such as:

```text
what should the runtime do next?
```

and:

```text
how should the broader system recover from reliability failures?
```

Keeping these boundaries explicit prevents duplicated responsibilities.

---

# Interview Questions with Expected Answers

## Question 1

**A tool invocation times out after the request was transmitted. Can the system safely report that the action failed?**

### Expected Answer

Not necessarily. The timeout only establishes that the caller did not receive a response within the allowed time. The external operation may have completed, so the outcome may be unknown.

---

## Question 2

**Why is repeating a read operation usually different from repeating a payment operation?**

### Expected Answer

A read operation generally does not change external state, while a payment can create a side effect. Repeating a payment after an uncertain outcome can create a duplicate charge unless the operation has appropriate idempotency semantics.

---

## Question 3

**What is the difference between retryability and retry safety?**

### Expected Answer

Retryability means another execution attempt is technically possible. Retry safety means repeating the action would not create an unacceptable or unintended effect given the known execution state and action semantics. The broader policy decision to retry belongs to the reliability/runtime layer.

---

## Question 4

**Why doesn't an HTTP 200 response necessarily mean that the tool operation succeeded?**

### Expected Answer

HTTP 200 describes transport-level success. The tool response may still indicate a business-level failure or unsuccessful operation.

---

## Question 5

**Why should a tool execution layer distinguish failure from unknown outcome?**

### Expected Answer

A known failure establishes that the expected operation did not succeed, while an unknown outcome means the system cannot establish whether the external action occurred. That distinction is important for interpreting the result and for any subsequent reliability decision.

---

## Question 6

**How does idempotency help with repeated execution?**

### Expected Answer

When the receiving system implements appropriate idempotency semantics, repeated submissions of the same logical operation can be recognized and prevented from producing unintended duplicate effects.

---

## Question 7

**Does an idempotency key by itself guarantee safe retries?**

### Expected Answer

No. The receiving system must actually implement and enforce the intended idempotency semantics, and the key must be used according to that contract.

---

## Question 8

**What is the difference between a tool result and a runtime observation?**

### Expected Answer

The tool result is the execution-layer representation of what happened. The runtime consumes that result as an observation and decides what to do next. AGT-03 owns result production; AGT-02 owns runtime continuation decisions.

---

## Question 9

**A tool successfully creates an order but fails to send the confirmation email. Should the whole action be classified simply as failed?**

### Expected Answer

Not necessarily. The system should preserve the distinction between the primary operation succeeding and a secondary operation failing. Collapsing both into a single failure can hide useful execution state.

---

## Question 10

**Why is result normalization useful when tools depend on different external systems?**

### Expected Answer

Different systems may represent success and failure differently. Normalization provides a consistent tool-result model while preserving important distinctions such as timeout, known failure, partial result, or unknown outcome.

---

## Quick Revision

The core execution flow is:

```text
Invocation
    ↓
Execution Admission
    ↓
Execution Attempt
    ↓
External Operation
    ↓
Outcome
    ↓
Result Normalization
    ↓
Result Validation
    ↓
Tool Result
    ↓
Runtime Observation
```

Remember:

```text
Invocation
    ≠
Execution Success

Transport Success
    ≠
Tool Success

Execution Success
    ≠
Complete Information

Complete Information
    ≠
Correct Information

Retryable
    ≠
Safe to Retry

Idempotent
    ≠
Reliable

Timeout
    ≠
Definite Failure
```

For side-effecting operations:

```text
Side Effect
     ↓
Execution Uncertainty
     ↓
Repetition Risk
     ↓
Idempotency / Status Verification
     ↓
Reliability Policy
```

The ownership boundary is:

```text
File 02
Discover → Select → Route → Construct → Invoke
                         ↓
                    Invocation
                         ↓
────────────────────────────────────────
File 03
Execute → Result → Failure → Outcome
                         ↓
                 Runtime Observation
                         ↓
────────────────────────────────────────
AGT-02
Runtime continuation

AGT-11
Broader reliability / recovery / safety policy
```

---

# Key Takeaways

1. Invocation is the handoff into the execution layer.
2. An invocation request does not prove that the external operation occurred.
3. Execution success, transport success, tool success, and business outcome are different concepts.
4. Tool results should preserve meaningful execution information.
5. Successful execution does not guarantee complete or correct information.
6. Timeouts can create unknown outcomes rather than definite failures.
7. Failure classification matters because different failures provide different execution facts.
8. Side-effecting actions require more careful analysis of uncertain execution outcomes.
9. Idempotency describes the effect of repeating an operation; it does not guarantee reliability or success.
10. Retryability and retry safety are different concepts.
11. Idempotency keys are useful only when the receiving system actually implements the intended semantics.
12. Partial and ambiguous outcomes should not be hidden behind generic failure states when they materially affect downstream reasoning.
13. Tool results become runtime observations, but AGT-02 owns the runtime's continuation decision.
14. AGT-03 owns action-level execution, result production, failure representation, and execution-relevant action semantics.
15. AGT-11 owns broader reliability, recovery, fallback, containment, and safety policy.
16. Durable compensation and recovery workflows belong to AGT-06.
17. One concept should have one primary teaching location across the AGT curriculum.

---

## Further Reading

The AGT-03 chapter is now complete:

```text
01 — Tool Definitions, Contracts & Capability Boundaries
        ↓
02 — Tool Selection, Routing and Execution
        ↓
03 — Tool Failures, Side Effects, Idempotency and Invocation Boundaries
```

The complete action boundary is:

```text
Define
  ↓
Discover
  ↓
Select
  ↓
Route
  ↓
Construct
  ↓
Validate
  ↓
Invoke
  ↓
Execute
  ↓
Produce Result
  ↓
Represent Failure / Outcome
  ↓
Return Observation
```

The ownership model is:

```text
File 01
What capability exists?
What does its contract mean?

        ↓

File 02
Which capability should be used?
How is it routed?
What invocation is constructed?

        ↓

File 03
What happened during execution?
What result was produced?
What failed?
Is the outcome known or ambiguous?

        ↓

AGT-02
How does the runtime consume the observation?

        ↓

AGT-11
What broader reliability/recovery/safety policy should apply?
```

The AGT-03 boundary ends with producing a sufficiently precise representation of what happened during the action so that the consuming runtime and reliability layers can make informed decisions.
