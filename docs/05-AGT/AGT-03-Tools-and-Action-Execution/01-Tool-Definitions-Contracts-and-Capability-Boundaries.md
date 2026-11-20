# Tool Definitions, Contracts and Capability Boundaries

## 01 — Tool Definitions, Contracts & Capability Boundaries

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain what a tool is and why an agent system needs an explicit tool boundary.
- Distinguish a **tool**, **tool interface**, **tool definition**, and **tool contract**.
- Explain how input and output schemas make tool behavior explicit and machine-checkable.
- Distinguish structural validation from semantic validation.
- Explain why capability boundaries matter for safety, correctness, and blast-radius control.
- Identify side effects and retry-relevant semantics as part of tool contract design.
- Distinguish a contract from the implementation behind it.
- Explain why a valid contract does not guarantee successful execution or a correct business outcome.
- Evaluate whether a proposed tool is appropriately scoped for production use.

---

## Prerequisites

Before reading this chapter, you should understand:

- The basic definition of an agent.
- The role of the agent runtime.
- The decision → action → observation → continuation execution model.
- The difference between an agent's internal reasoning and an externally executed action.

These concepts are established in:

- [AGT-01 — Agent Definition and System Boundaries](../AGT-01-Agent-Systems-Foundations/Readme.md)
- [AGT-02 — Agent Runtime and Execution](../AGT-02-Agent-Runtime-Loops-and-Bounded-Autonomy/Readme.md)

---

## Estimated Reading Time

**25–30 minutes**

---

## Before We Start

An agent can decide that an external operation is required:

> "Retrieve the customer's current order."

But the model's decision is not the external operation itself.

Something must define:

- what capability exists,
- what inputs it accepts,
- what outputs it produces,
- what constraints apply,
- what errors may be represented,
- what side effects may occur,
- and where the capability boundary begins and ends.

That boundary is the subject of this chapter.

The central idea is:

> **A tool is a bounded capability exposed through an explicit contract.**

The tool contract allows the runtime to interact with that capability without requiring the model or runtime to understand every implementation detail behind it.

---

## Why This Exists

Without explicit tool boundaries, agent systems tend to accumulate loosely defined capabilities.

For example, imagine exposing:

```text
execute_any_database_query
```

instead of:

```text
find_customer_orders
```

Both may technically allow the system to retrieve orders.

But they have very different engineering properties.

The first capability may allow:

- arbitrary table access,
- arbitrary joins,
- arbitrary writes,
- schema discovery,
- destructive operations.

The second can constrain the capability to a specific business operation.

This gives us an important production principle:

> **A tool should expose the narrowest capability that is sufficient for the intended action.**

The purpose of a tool contract is therefore not merely documentation.

It creates an explicit boundary between:

```text
Agent Runtime
     │
     ▼
Tool Contract
     │
     ▼
Bounded Capability
     │
     ▼
Implementation
```

The implementation may change.

The externally expected behavior should remain governed by the contract.

---

# Mental Model

A useful hierarchy is:

```text
Tool
  │
  └── Tool Interface
          │
          └── Tool Contract
                  ├── Inputs
                  ├── Outputs
                  ├── Constraints
                  ├── Errors
                  └── Side-effect semantics
```

These terms are related, but they are not interchangeable.

### Tool

The externally usable capability.

Examples:

```text
get_customer_order
send_email
create_support_ticket
calculate_invoice_total
```

### Tool Interface

The externally visible shape through which the capability is accessed.

It answers questions such as:

- What is the tool called?
- What inputs does it accept?
- What output does it return?
- How is it invoked?

### Tool Contract

The expected externally observable behavior of the interface.

It defines things such as:

- accepted inputs,
- required fields,
- constraints,
- output structure,
- meaningful error conditions,
- side-effect semantics,
- and other behavior that callers are expected to rely upon.

### Tool Definition

The representation used to describe and expose the tool interface and its contract to the consuming system.

For example, a runtime may represent a tool definition using:

```python
{
    "name": "get_customer_order",
    "description": "Retrieve an order belonging to a customer.",
    "input_schema": {
        "type": "object",
        "properties": {
            "customer_id": {"type": "string"},
            "order_id": {"type": "string"}
        },
        "required": ["customer_id", "order_id"]
    }
}
```

The exact representation can vary between systems.

The important distinction is:

> **The definition is the representation; the contract is the externally expected behavior represented by it.**

---

# Core Concepts

## 1. Tool as a Bounded Capability

A tool is not simply "some function the model can call."

A useful engineering definition is:

> **A tool is an externally executable capability exposed through an explicit interface and contract.**

The implementation might internally use:

- a Python function,
- a REST API,
- a database query,
- an SDK,
- another service,
- a queue,
- a cloud API,
- or several internal components.

The agent should generally interact with the capability through its defined boundary rather than depending on its internal implementation.

For example:

```text
Tool: get_customer_order

Input:
    customer_id
    order_id

Output:
    order details

Possible errors:
    customer_not_found
    order_not_found
    access_denied
```

The implementation behind this capability could later change from:

```text
PostgreSQL
```

to:

```text
Order Service API
```

without necessarily changing the tool's external contract.

---

# 2. Tool Interface

The interface defines how the capability is exposed.

For example:

```text
get_customer_order(
    customer_id: string,
    order_id: string
) -> Order
```

The interface establishes the interaction shape.

It tells the caller:

- what operation exists,
- what arguments are accepted,
- and what type of result is expected.

But an interface alone may not describe the complete behavior.

For example:

```text
send_email(
    recipient: string,
    subject: string,
    body: string
) -> EmailResult
```

does not by itself explain:

- whether duplicate sends are possible,
- what happens when the provider is unavailable,
- whether the operation is asynchronous,
- what failures can be represented,
- or what constitutes successful acceptance.

Those are contract-level concerns.

---

# 3. Tool Contract

A tool contract defines the externally expected behavior of the capability.

A useful contract can describe:

```text
Identity
Purpose
Inputs
Constraints
Outputs
Errors
Side-effect semantics
Operational expectations*
```

`*` Only include operational expectations when they are actually part of the externally defined contract.

For example:

```text
Tool:
    create_support_ticket

Inputs:
    customer_id: string
    title: string
    description: string

Constraints:
    customer_id must identify an accessible customer
    title must not be empty
    description must not be empty

Output:
    ticket_id
    status

Possible errors:
    customer_not_found
    invalid_request
    service_unavailable

Side-effect semantics:
    Creates a new support ticket.
```

This is much more useful than simply exposing:

```text
create_support_ticket(...)
```

---

# 4. Contract vs Implementation

One of the most important distinctions in production engineering is:

> **A contract defines what callers can expect; an implementation defines how the capability achieves it.**

Consider:

```text
Tool Contract
     │
     ▼
get_customer_order(customer_id, order_id)
     │
     ▼
Implementation
     │
     ├── PostgreSQL
     ├── Redis cache
     ├── Order Service
     └── Internal authorization
```

The implementation may change while the contract remains stable.

For example, the implementation could change from:

```text
PostgreSQL query
```

to:

```text
HTTP request to Order Service
```

without requiring the agent to understand that internal change.

This separation provides:

- implementation flexibility,
- reduced coupling,
- clearer testing boundaries,
- easier evolution,
- and more predictable integration.

However, the contract does **not** guarantee that the implementation is correct.

A contract can state:

```text
returns the customer's order
```

while an incorrectly implemented tool returns the wrong order.

Therefore:

> **Contract clarity improves predictability; it does not prove implementation correctness.**

---

# 5. Input Schema

The input schema defines the structure of arguments accepted by the tool.

For example:

```json
{
  "type": "object",
  "properties": {
    "customer_id": {
      "type": "string"
    },
    "order_id": {
      "type": "string"
    }
  },
  "required": [
    "customer_id",
    "order_id"
  ]
}
```

The schema can express:

- field names,
- data types,
- required fields,
- optional fields,
- enumerated values,
- length constraints,
- numeric ranges,
- nested structures,
- and other machine-checkable constraints.

This creates an important boundary:

```text
Unstructured Model Output
          │
          ▼
      Input Schema
          │
          ▼
   Structural Validation
          │
          ▼
   Capability Boundary
```

---

# 6. Structural Validation

Structural validation checks whether the supplied input conforms to the expected shape.

For example:

```text
customer_id = "C123"
order_id    = "O456"
```

may satisfy the expected structure.

But:

```text
customer_id = 12345
```

may violate a schema requiring a string.

Structural validation can detect:

- missing required fields,
- incorrect types,
- invalid enum values,
- malformed structures,
- invalid ranges,
- unexpected fields where prohibited.

It answers:

> **"Is this input shaped correctly?"**

---

# 7. Semantic Validation

Structural validity does not mean business validity.

For example:

```text
customer_id = "C123"
order_id    = "O456"
```

may be structurally valid.

But perhaps:

```text
O456 does not belong to C123
```

The input is structurally correct but semantically invalid for the requested operation.

Therefore:

> **Schema-valid ≠ Business-valid.**

Semantic validation may check:

- resource ownership,
- authorization,
- business rules,
- state constraints,
- resource existence,
- domain-specific relationships.

This distinction becomes important at the capability boundary.

---

# 8. Capability Boundary

The capability boundary defines what the tool is allowed to do.

For example:

```text
find_customer_orders
```

is narrower than:

```text
execute_any_database_query
```

The narrower tool may expose only:

```text
customer_id
date_range
status
```

while internally executing a controlled query.

This creates a smaller blast radius.

A useful mental model is:

```text
Broad Capability
      │
      ├── More possible operations
      ├── More possible failure modes
      ├── More potential side effects
      └── Larger blast radius

Narrow Capability
      │
      ├── Fewer possible operations
      ├── Smaller failure surface
      ├── Easier validation
      └── Smaller blast radius
```

Capability design is therefore an architectural decision, not merely a naming decision.

---

# 9. Capability Scope and Blast Radius

Suppose an agent needs to update a customer's phone number.

Compare:

```text
update_customer_phone(customer_id, phone_number)
```

with:

```text
update_customer_record(customer_id, arbitrary_fields)
```

The second capability is more general.

But generality increases the number of behaviors that the capability permits.

The broader capability may introduce:

- accidental field modification,
- unexpected state changes,
- more complex validation,
- larger authorization requirements,
- more difficult auditing,
- and greater consequences from incorrect arguments.

Therefore:

> **Capability breadth should be justified by actual system requirements.**

Do not create a general-purpose tool simply because it is technically convenient.

---

# 10. Read Operations vs Side-Effecting Operations

Tools can differ substantially based on whether they change external state.

### Read-oriented

```text
get_weather
get_customer_order
search_products
calculate_invoice_total
```

These generally retrieve information or perform computation without intentionally changing external state.

### Side-effecting

```text
send_email
create_support_ticket
cancel_order
update_customer_phone
create_invoice
```

These can change external state.

The distinction matters because side effects affect:

- validation,
- authorization,
- observability,
- retry considerations,
- failure interpretation,
- and operational risk.

The tool contract should make meaningful side effects visible rather than hiding them behind a generic interface.

---

# 11. Side-Effect Semantics

A contract should communicate when an operation can change external state.

For example:

```text
create_support_ticket
```

should not be treated like:

```text
calculate_invoice_total
```

even if both technically return structured data.

A useful contract should make the nature of the operation clear:

```text
Operation:
    create_support_ticket

Effect:
    Creates a new support ticket.
```

For side-effecting operations, contract design should also expose retry-relevant semantics where repeated execution is operationally meaningful.

For example:

```text
create_payment
```

raises a different engineering concern from:

```text
get_payment_status
```

because repeating the first operation may create another external effect.

This does **not** mean every side-effecting operation must be idempotent.

It means the contract should provide enough information for the execution layer to reason about the consequences of repetition.

---

# 12. Idempotency as a Contract Concern

An operation is commonly described as idempotent when repeating the same logical operation does not produce additional externally meaningful effects beyond the first successful application.

For example:

```text
set_customer_status(customer_id, "active")
```

may be designed to be idempotent.

Whereas:

```text
send_email(...)
```

may not be.

The important engineering distinction is:

```text
Idempotent
    ≠
Successful
```

and:

```text
Retryable
    ≠
Safe to Retry
```

AGT-03 establishes the tool-level semantics needed to reason about these properties.

Broader retry policy, recovery strategy, fallback behavior, and containment belong to the reliability and safety layer rather than being re-taught here.

---

# 13. Output Contract

Inputs are only one side of the interface.

The tool must also define what it returns.

For example:

```json
{
  "ticket_id": "T12345",
  "status": "created"
}
```

A useful output contract answers:

- What fields are returned?
- Which fields are required?
- What types do they have?
- What does each status mean?
- Can fields be absent?
- How are meaningful failures represented?

Without a defined output contract, downstream systems may have to infer semantics from arbitrary response shapes.

That increases coupling and ambiguity.

---

# 14. Tool Results Are Not Automatically Truth

A tool can return:

```text
status = "success"
```

without proving that the broader business outcome definitely occurred.

For example:

```text
Agent
  │
  ▼
Tool Invocation
  │
  ▼
External Service
  │
  ▼
Response
```

A successful response might mean:

- the request was accepted,
- the operation completed,
- the operation partially completed,
- the service returned cached information,
- or the tool only confirmed a lower-level operation.

Therefore:

> **Tool execution success does not automatically imply business outcome success.**

A useful trust model is:

```text
Tool Execution Success
        ≠
Business Outcome Definitely Occurred
        ≠
Complete Information
        ≠
Correct Information
```

The exact interpretation depends on the tool contract and the underlying system.

Detailed result handling and execution outcome analysis are developed further in **File 03 — Tool Failures, Side Effects, Idempotency and Invocation Boundaries**.

---

# 15. Error Semantics

Errors are also part of the contract.

Compare:

```text
error = "failed"
```

with:

```text
{
    "code": "customer_not_found",
    "message": "Customer does not exist."
}
```

The second representation gives the consuming system more usable information.

A contract may distinguish:

```text
invalid_request
customer_not_found
access_denied
service_unavailable
rate_limited
```

The exact error model depends on the system.

The important principle is:

> **Errors should communicate meaningful distinctions that the consuming system can act on.**

The detailed lifecycle of execution failures, timeout behavior, ambiguous outcomes, and action-level failure handling belongs primarily to File 03.

---

# Internal Working

At a high level, a tool moves through these conceptual layers:

```text
Capability
    │
    ▼
Tool Interface
    │
    ▼
Tool Contract
    │
    ├── Input schema
    ├── Output contract
    ├── Constraints
    ├── Error semantics
    └── Side-effect semantics
    │
    ▼
Validation Boundary
    │
    ▼
Executable Implementation
```

The important point is that the agent runtime does not need to know every implementation detail.

It needs a reliable boundary through which it can request the capability.

The implementation remains behind that boundary.

---

# Example / Practical Implementation

A simplified Python representation can make the relationship concrete.

```python
from dataclasses import dataclass
from typing import Any, Callable

@dataclass
class ToolDefinition:
    name: str
    description: str
    input_schema: dict[str, Any]
    handler: Callable[..., Any]

def get_customer_order(customer_id: str, order_id: str) -> dict[str, Any]:
    if not customer_id:
        raise ValueError("customer_id is required")

    if not order_id:
        raise ValueError("order_id is required")

    # Implementation details are hidden behind the tool boundary.
    return {
        "customer_id": customer_id,
        "order_id": order_id,
        "status": "found",
    }

tool = ToolDefinition(
    name="get_customer_order",
    description="Retrieve an order belonging to a customer.",
    input_schema={
        "type": "object",
        "properties": {
            "customer_id": {"type": "string"},
            "order_id": {"type": "string"},
        },
        "required": ["customer_id", "order_id"],
    },
    handler=get_customer_order,
)
```

This simplified example separates:

```text
Tool Definition
      │
      ├── Name
      ├── Description
      ├── Input Schema
      │
      ▼
Tool Implementation
      │
      └── handler
```

A production system would require substantially stronger validation, authorization, error handling, observability, and execution controls.

The purpose of this example is only to demonstrate the boundary.

---

# Production Perspective

In production systems, tool contracts become integration boundaries.

A well-designed contract should make it possible to answer:

- What capability does this tool expose?
- What inputs are accepted?
- Which inputs are required?
- What constraints apply?
- What outputs are produced?
- What meaningful errors can occur?
- Does the operation have side effects?
- What retry-relevant semantics exist?
- What implementation details can change without affecting callers?

A production tool should generally be:

```text
Explicit
Predictable
Narrowly scoped
Machine-checkable where possible
Observable
Versionable
Testable
```

The contract should evolve deliberately.

Changing:

```text
required input
output structure
error semantics
side-effect behavior
```

may break consumers even if the underlying implementation still works.

Therefore, contract changes should be treated as compatibility decisions rather than casual refactoring.

---

# Engineering Decisions and Trade-offs

## Narrow vs Broad Tools

### Narrow tool

```text
get_customer_order
```

Advantages:

- smaller capability boundary,
- easier validation,
- easier authorization,
- easier testing,
- smaller blast radius.

Disadvantage:

- more tools may be required.

### Broad tool

```text
customer_data_operation
```

Advantages:

- fewer tool definitions,
- potentially more reusable.

Disadvantages:

- larger capability surface,
- more complex validation,
- greater ambiguity,
- larger blast radius,
- harder auditing.

For production agent systems, prefer narrow capabilities unless broader scope has a clear architectural justification.

---

## Strict vs Flexible Contracts

A strict contract may reject many malformed inputs early.

Advantages:

- predictable behavior,
- easier debugging,
- clearer failures,
- reduced ambiguity.

A flexible contract may support more input variations.

Advantages:

- easier integration in some environments,
- potentially fewer client-side transformations.

Trade-off:

```text
More strictness
    → more predictability

More flexibility
    → more compatibility
```

The right level depends on the capability and its consumers.

---

## Rich vs Minimal Descriptions

Tool descriptions should provide enough information for correct use.

Too little information:

```text
"Updates customer."
```

Too much implementation detail:

```text
"Calls Service X, which first queries PostgreSQL table Y,
then uses Redis key Z, then performs an internal HTTP request..."
```

A better description focuses on externally relevant behavior:

```text
"Update a customer's phone number.
Requires customer_id and phone_number.
Changes the customer's stored phone number."
```

The model and runtime need capability semantics, not unnecessary implementation internals.

---

## Contract Stability vs Implementation Evolution

A strong boundary allows:

```text
Stable Contract
      │
      ├── Implementation v1
      ├── Implementation v2
      └── Implementation v3
```

This reduces coupling.

However, implementation changes can still require contract changes when externally observable behavior changes.

The engineering goal is therefore not:

> "Never change the contract."

It is:

> **Change the contract deliberately and preserve compatibility where consumers depend on it.**

---

# Common Mistakes and Misconceptions

## Mistake 1 — Treating Every Tool as an API

A tool can be implemented using an API, but a tool is a capability abstraction rather than a specific transport technology.

It could internally use:

- a function,
- database access,
- an API,
- an SDK,
- a queue,
- or another mechanism.

---

## Mistake 2 — Treating the Tool Definition as the Contract

The definition is the representation exposed to the consuming system.

The contract is the externally expected behavior represented by that definition.

They are closely related but conceptually different.

---

## Mistake 3 — Assuming Schema Validation Proves Correctness

A schema can prove that:

```text
customer_id = "C123"
```

has the expected structure.

It cannot prove that:

```text
C123
```

is the correct customer for the requested operation.

Structural validity and semantic validity are different.

---

## Mistake 4 — Creating Overly Powerful Tools

A tool such as:

```text
execute_any_database_query
```

may appear flexible.

But flexibility can create an unnecessarily large capability boundary.

Prefer:

```text
find_customer_orders
```

when that is sufficient for the required capability.

---

## Mistake 5 — Hiding Side Effects

A tool named:

```text
process_customer
```

may conceal whether it:

- reads data,
- modifies data,
- sends notifications,
- creates records,
- or triggers external workflows.

Meaningful side effects should be explicit in the contract.

---

## Mistake 6 — Assuming Idempotency Means Reliability

An operation can be idempotent and still:

- fail,
- time out,
- be unavailable,
- return incorrect information,
- or never complete.

Idempotency is a property relevant to repeated execution, not a guarantee of successful execution.

---

## Mistake 7 — Treating Retryability as Retry Safety

An operation may technically be executable again while still being unsafe to repeat.

For example:

```text
create_payment()
```

may produce a new external effect each time.

Therefore:

> **Retryability is not the same as retry safety.**

---

## Mistake 8 — Treating a Successful Tool Response as Proof of Business Success

A response such as:

```text
status = "accepted"
```

may only mean the downstream system accepted the request.

It does not necessarily prove that the intended business outcome has completed.

---

# Interview Questions with Expected Answers

## Question 1

**Why should an agent system expose narrow tools instead of one highly general-purpose tool?**

### Expected Answer

A narrow tool creates a smaller capability boundary and blast radius. It simplifies validation, authorization, testing, auditing, and reasoning about side effects. A general-purpose tool may reduce the number of tool definitions but increases the range of possible behaviors and failure modes. The choice should be based on actual system requirements rather than implementation convenience.

---

## Question 2

**What is the difference between a tool interface and a tool contract?**

### Expected Answer

The interface describes how the capability is accessed, including its operation and interaction shape. The contract defines the externally expected behavior, including input constraints, outputs, meaningful errors, and side-effect semantics. The interface is therefore part of the contract surface, but the contract can describe behavior beyond the basic invocation shape.

---

## Question 3

**A request passes JSON Schema validation. Is it safe to execute?**

### Expected Answer

Not necessarily. Schema validation primarily establishes structural validity. The request may still violate authorization rules, business constraints, resource ownership, or other semantic requirements.

---

## Question 4

**Why is separating a tool contract from its implementation useful?**

### Expected Answer

It reduces coupling. The implementation can change while consumers continue to depend on the same external behavior. This improves maintainability, testing, integration stability, and architectural flexibility.

---

## Question 5

**Why is `execute_any_database_query` often a poor tool boundary for an agent?**

### Expected Answer

It exposes a very broad capability surface. It may permit unintended reads or writes, increase the blast radius of incorrect arguments, complicate authorization and auditing, and make behavior harder to constrain. A purpose-specific capability is usually safer and easier to reason about.

---

## Question 6

**A tool returns `success`. What can you conclude?**

### Expected Answer

Only what the contract defines that success to mean. It may indicate successful execution, request acceptance, or another lower-level outcome. It does not automatically prove that the intended business outcome definitely occurred or that the returned information is complete and correct.

---

## Quick Revision

Remember the following model:

```text
Tool
  ↓
Interface
  ↓
Contract
  ↓
Schema + Constraints
  ↓
Capability Boundary
  ↓
Executable Implementation
```

Key distinctions:

```text
Definition
    = representation of the exposed capability

Interface
    = interaction shape

Contract
    = externally expected behavior

Implementation
    = how the capability is achieved
```

And:

```text
Schema-valid
    ≠ Business-valid

Idempotent
    ≠ Successful

Retryable
    ≠ Safe to Retry

Tool execution success
    ≠ Guaranteed business outcome
```

The core design principle is:

> **Expose the smallest capability that clearly satisfies the required action, and make its externally relevant behavior explicit through a contract.**

---

# Key Takeaways

1. A tool is a bounded externally executable capability.
2. A tool interface defines how the capability is accessed.
3. A tool contract defines externally expected behavior.
4. A tool definition is the representation used to expose that interface and contract.
5. Contracts should make inputs, outputs, constraints, errors, and meaningful side effects explicit.
6. Structural validation and semantic validation solve different problems.
7. Capability scope determines the potential blast radius of incorrect or unintended actions.
8. Side-effect semantics matter when designing tool contracts.
9. Idempotency and retry-relevant semantics belong in the contract when repeated execution matters.
10. A contract does not guarantee implementation correctness or business success.
11. Tool execution success does not automatically prove the intended business outcome.
12. Tool selection and invocation are separate concerns from tool definition and contract design.

---

## Further Reading

Continue to:

**[02 — Tool Selection, Routing and Execution](./02-Tool-Selection-Routing-and-Execution.md)**

The next file moves from:

```text
"What capability exists and what does it mean?"
```

to:

```text
"How does the system discover, select, construct, and invoke that capability?"
```

File 03 will then cover:

```text
Execution
    ↓
Results
    ↓
Failures
    ↓
Timeouts
    ↓
Retryability
    ↓
Ambiguous Outcomes
    ↓
Action-level Observability
```

This preserves the AGT-03 progression:

```text
Define the capability
        ↓
Find and invoke the capability
        ↓
Execute and handle the outcome
```
