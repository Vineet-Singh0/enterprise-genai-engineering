# Tool Selection, Routing and Execution

## 02 — Tool Selection, Routing and Execution

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain why an agent runtime needs a tool discovery and selection mechanism.
- Distinguish **tool discovery**, **tool selection**, **eligibility**, **routing**, **argument construction**, and **invocation**.
- Explain how an agent determines which available capability best matches a requested action.
- Understand the difference between selecting a tool and planning an overall task.
- Explain how tool names, descriptions, schemas, constraints, and capability scope influence selection.
- Identify common sources of tool-selection ambiguity.
- Explain how selection can be performed deterministically, through model assistance, or through a hybrid mechanism.
- Understand why tool availability and tool eligibility are different concepts.
- Explain how arguments are constructed for a selected tool without silently inventing missing information.
- Understand how routing connects a logical tool capability to an appropriate execution path.
- Design a predictable tool-selection and invocation flow suitable for production systems.

---

## Prerequisites

Before reading this chapter, you should understand:

- What an agent is.
- The agent runtime and execution loop.
- The difference between an agent decision and an externally executed action.
- Tool definitions, interfaces, contracts, schemas, and capability boundaries.

These concepts are established in:

- [AGT-01 — Agent Definition and System Boundaries](../AGT-01-Agent-Systems-Foundations/Readme.md)
- [AGT-02 — Agent Runtime and Execution](../AGT-02-Agent-Runtime-Loops-and-Bounded-Autonomy/Readme.md)
- [01 — Tool Definitions, Contracts & Capability Boundaries](./01-Tool-Definitions-Contracts-and-Capability-Boundaries.md)

---

## Estimated Reading Time

**25–30 minutes**

---

## Before We Start

Lesson 01 established the first part of the tool boundary:

```text
Tool
  ↓
Interface
  ↓
Contract
  ↓
Capability Boundary
```

That answers:

> **What capability exists, what does it accept, and what does it mean?**

The next problem is different:

> **Given the current action need and the available capabilities, which tool should the system use and how should it prepare the invocation?**

Suppose an agent has access to:

```text
get_customer_order
get_customer_profile
search_customer_orders
cancel_customer_order
send_customer_email
create_support_ticket
```

The agent receives:

> "Find the customer's latest order."

The system must move from:

```text
Action Need
    ↓
Available Capabilities
    ↓
Candidate Tools
    ↓
Eligibility
    ↓
Selected Tool
    ↓
Routing
    ↓
Arguments
    ↓
Invocation
```

This lesson covers that selection-to-invocation boundary.

It does **not** own the actual execution lifecycle or execution outcomes. Those are covered in Lesson 03.

---

# Why This Exists

An agent cannot safely execute an external operation simply because a tool exists.

There are several decisions between an action need and an invocation:

```text
What capability is needed?
          ↓
Which capabilities are available?
          ↓
Which candidates are relevant?
          ↓
Which candidate is eligible?
          ↓
Which capability should be selected?
          ↓
Where should it be routed?
          ↓
What arguments should be supplied?
          ↓
What invocation should be constructed?
```

These decisions matter because incorrect tool selection can produce consequences even when the selected tool itself is correctly implemented.

For example:

```text
User:
"Show me my latest order."

Correct:
get_customer_order

Incorrect:
cancel_customer_order

Technically valid tool:
Yes

Correct capability for this action:
No
```

This illustrates an important principle:

> **A valid tool is not necessarily the correct tool for the current action.**

---

# Mental Model

A useful mental model is:

```text
                 Action Need
                     │
                     ▼
              Tool Discovery
                     │
                     ▼
            Candidate Capabilities
                     │
                     ▼
                Eligibility
                     │
                     ▼
              Tool Selection
                     │
                     ▼
                  Routing
                     │
                     ▼
           Argument Construction
                     │
                     ▼
            Contract Validation
                     │
                     ▼
                Invocation
                     │
                     ▼
          Handoff to Execution
```

Each stage answers a different engineering question.

### Discovery

> What capabilities are available in the current context?

### Eligibility

> Which available capabilities can appropriately be used for this action?

### Selection

> Which eligible capability best matches the required action?

### Routing

> Through which execution path should the selected capability be reached?

### Argument Construction

> What concrete inputs are required by the selected contract?

### Validation

> Do those arguments satisfy the tool contract?

### Invocation

> What request should be handed to the execution layer?

The stages may be implemented together in some systems, but separating the concepts makes the architecture easier to reason about.

---

# Core Concepts

## 1. Tool Discovery

Tool discovery determines which capabilities are available to the current agent/runtime context.

A system may have:

```text
100 registered tools
```

but expose only:

```text
12 tools
```

to a particular runtime.

Discovery therefore establishes the candidate capability set.

Conceptually:

```text
Registered / Known Capabilities
            │
            ▼
      Current Runtime
            │
            ▼
   Available Capabilities
```

Discovery may depend on:

- agent configuration,
- tenant,
- environment,
- user permissions,
- task context,
- deployment configuration,
- tool availability,
- or other system policies.

The exact mechanism is architecture-dependent.

The important distinction is:

> **Discovery determines what capabilities are available; selection determines what capability is appropriate for the action.**

---

## 2. Registration vs Discovery

These concepts are related but different.

### Registration

A capability is made known to a system.

For example:

```text
register_tool(get_customer_order)
```

### Discovery

The system determines which known capabilities are available in the current context.

For example:

```text
Known Tools
    ↓
Current Agent
    ↓
Available Tools
```

Therefore:

```text
Registration
    ≠
Discovery
```

The exact registration mechanism depends on the architecture.

This chapter does not depend on a particular tool protocol or interoperability framework.

---

## 3. Availability vs Eligibility

A tool can be available without being eligible for a particular action.

For example:

```text
Tool:
delete_customer

Available:
Yes

Eligible for:
"Show me my customer profile"

No
```

Similarly:

```text
Tool:
refund_order

Available:
Yes

Eligible:
Only when the order satisfies refund requirements
```

Therefore:

```text
Available
    ≠
Eligible
```

Availability answers:

> "Can this runtime potentially access the capability?"

Eligibility answers:

> "Can this capability appropriately be used for this action?"

Eligibility may depend on:

- authorization,
- tenant boundaries,
- environment,
- business state,
- capability scope,
- data sensitivity,
- or other action-specific constraints.

---

# 4. Candidate Tool Set

After discovery and initial eligibility filtering, the runtime has a candidate set.

For example:

```text
User request:
"Find my recent orders."

Candidate tools:

1. get_customer_order
2. search_customer_orders
3. cancel_customer_order
4. create_support_ticket
5. send_customer_email
```

Not all candidates are equally relevant.

The selection problem becomes:

```text
Candidate Set
      │
      ├── Clearly relevant
      ├── Possibly relevant
      └── Irrelevant
```

The goal is not simply to find a tool that can technically execute.

The goal is to identify the capability whose contract and purpose best match the required action.

---

# 5. Tool Selection

Tool selection answers:

> **Which available and eligible capability should perform the required action?**

Selection can consider:

- tool purpose,
- tool description,
- input requirements,
- output requirements,
- capability scope,
- current context,
- authorization,
- business constraints,
- tool availability,
- and expected side effects.

For example:

```text
Required action:
Retrieve an order

Candidate A:
get_customer_order

Candidate B:
cancel_customer_order

Candidate C:
send_customer_email
```

The appropriate selection is:

```text
get_customer_order
```

because its capability aligns with the requested action.

---

# 6. Tool Selection Is Not Planning

This distinction is important.

Suppose the user asks:

> "Find my order and, if it is delayed, notify me."

The system may need to perform:

```text
get_customer_order
        ↓
evaluate order status
        ↓
send_customer_notification
```

Selecting:

```text
get_customer_order
```

is a tool-selection decision.

Determining the broader sequence:

```text
retrieve
    ↓
evaluate
    ↓
notify
```

is a planning or workflow concern.

Therefore:

> **Tool selection identifies a capability for an action; planning determines how multiple actions may be organized to accomplish a broader objective.**

AGT-03 does not own the general planning model.

---

# 7. Tool Descriptions as Selection Metadata

Tool descriptions help a selection mechanism understand what a capability does.

Compare:

```text
get_order
```

with:

```text
get_customer_order

Retrieve a specific order belonging to a customer.
Requires customer_id and order_id.
Does not modify order state.
```

The second description exposes more useful semantic information.

A good tool description should communicate:

- purpose,
- capability scope,
- important constraints,
- relevant side effects,
- and meaningful distinctions from similar tools.

The description should not become a dump of implementation details.

The selection mechanism needs to understand:

```text
What does this capability do?
```

not:

```text
How is this capability implemented internally?
```

---

# 8. Tool Selection Signals

Selection can use multiple signals.

### Capability Semantics

What does the tool actually do?

### Input Compatibility

Can the available context satisfy the required inputs?

### Output Compatibility

Does the tool produce the information required by the action?

### Scope Compatibility

Does the tool expose more capability than necessary?

### Authorization and Eligibility

Is the current caller/context permitted to use it?

### Side-Effect Profile

Does the tool create a side effect that is appropriate for the action?

### Context

Does the current task make the tool relevant?

A simplified selection model is:

```text
                    Candidate Tool
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
      Purpose         Inputs         Constraints
          │              │              │
          └──────────────┼──────────────┘
                         ▼
                    Eligibility
                         │
                         ▼
                     Selection
```

---

# 9. Deterministic vs Model-Assisted Selection

Tool selection does not have to be performed entirely by an LLM.

There are several approaches.

## Deterministic Selection

Rules determine which tool should be used.

```python
if action == "get_order":
    tool = "get_customer_order"
elif action == "cancel_order":
    tool = "cancel_customer_order"
```

Advantages:

- predictable,
- easy to test,
- easy to audit,
- low ambiguity.

Disadvantages:

- difficult to scale to large, diverse capability sets,
- requires explicit routing logic,
- may become cumbersome as capabilities grow.

---

## Model-Assisted Selection

The model chooses from available tools based on descriptions and context.

Conceptually:

```text
User Request
      ↓
LLM
      ↓
Selected Tool
```

Advantages:

- flexible,
- handles natural-language intent,
- useful when capabilities are numerous or semantically diverse.

Disadvantages:

- selection may be probabilistic,
- descriptions strongly influence behavior,
- ambiguous tools can cause incorrect choices,
- additional validation is required.

---

## Hybrid Selection

Production systems can combine both approaches:

```text
User Request
      ↓
Model Candidate Selection
      ↓
Deterministic Eligibility Checks
      ↓
Policy / Authorization Checks
      ↓
Final Selection
```

This separates:

```text
Semantic matching
```

from:

```text
Hard system constraints
```

That separation can make the system more predictable.

---

# 10. Tool Routing

Tool selection and routing are related but different.

Selection answers:

> **Which capability?**

Routing answers:

> **Through which execution path should that capability be reached?**

For example:

```text
Selected Tool:
get_customer_order

Routing:

get_customer_order
        ↓
Order Service
        ↓
Production Endpoint
```

Another environment might route the same logical capability to:

```text
get_customer_order
        ↓
Test Stub
```

Or a distributed deployment might use:

```text
get_customer_order
        ↓
Appropriate Regional Service
```

Therefore:

> **Selection chooses the logical capability; routing determines the path used to reach that capability.**

Routing is part of the action-dispatch boundary. It should not be confused with broader infrastructure routing concerns such as load-balancing architecture or service-mesh design.

---

# 11. Logical Tool vs Physical Implementation

A useful production abstraction is:

```text
Logical Tool
      │
      ▼
Routing Layer
      │
      ├── Service A
      ├── Service B
      ├── Regional Endpoint
      └── Test Stub
```

The agent should generally reason about the logical capability rather than internal infrastructure topology.

For example:

```text
get_customer_order
```

is preferable as an agent-facing capability to exposing:

```text
us-east-order-service-v4
```

as the tool itself.

This reduces coupling between agent behavior and deployment topology.

---

# 12. Routing Constraints

Routing can depend on:

- environment,
- tenant,
- region,
- authorization,
- data residency,
- deployment configuration,
- or other system requirements.

For example:

```text
Tenant A
    ↓
Region A Order Service

Tenant B
    ↓
Region B Order Service
```

The agent does not necessarily need to know why the routing decision was made.

The routing layer can enforce the appropriate path.

The important boundary is:

```text
Agent
  ↓
Logical Capability
  ↓
Routing
  ↓
Execution Target
```

The internal infrastructure used to implement that routing belongs to the broader system architecture rather than this chapter.

---

# 13. Argument Construction

After selecting a tool, the system must construct the arguments required by its contract.

Suppose the selected tool is:

```text
get_customer_order
```

with:

```text
customer_id
order_id
```

The runtime may have:

```text
customer_id = "C123"
order_id    = "O456"
```

It can construct:

```json
{
  "customer_id": "C123",
  "order_id": "O456"
}
```

This step converts:

```text
Contextual Information
        ↓
Concrete Tool Inputs
```

Argument construction is therefore an important boundary between contextual decision-making and executable action preparation.

The model may identify the required values, but the system should still validate them against the tool contract before invocation.

---

# 14. Argument Construction Is Not Input Validation

These are related but different responsibilities.

### Argument Construction

Determines:

> What values should be supplied?

### Contract Validation

Determines:

> Do those values satisfy the tool contract?

For example:

```text
Argument Construction:

customer_id = "C123"
order_id    = "O456"
```

followed by:

```text
Contract Validation:

customer_id → valid structure
order_id    → valid structure
```

and potentially:

```text
Semantic checks:

customer C123 owns order O456
```

The validation model itself is established in Lesson 01.

Lesson 02 uses that boundary; it does not redefine the contract-validation model.

---

# 15. Missing Arguments

A selected tool may require information that is not available.

Example:

```text
Tool:
get_customer_order

Required:
customer_id
order_id

Available:
customer_id
```

The system should not invent:

```text
order_id = "O123"
```

A missing required argument creates a decision point.

Possible outcomes include:

```text
Request clarification
Use another available capability
Continue through an established workflow
Stop the current action attempt
```

The appropriate behavior depends on the runtime and broader task policy.

The important principle is:

> **Missing information should not be silently replaced with fabricated values.**

---

# 16. Ambiguous Tool Selection

Sometimes multiple tools can plausibly satisfy the same request.

For example:

```text
search_customer_orders
get_customer_order
```

A request such as:

> "Show me my order."

may not contain enough information to determine whether the user means:

- a specific order,
- the most recent order,
- or a search across orders.

The system should distinguish:

```text
Clear Selection
```

from:

```text
Ambiguous Selection
```

Possible approaches include:

- using available context,
- selecting the narrowest clearly applicable capability,
- requesting clarification,
- or following an established routing rule.

The important point is that ambiguity should be recognized rather than hidden.

---

# 17. Selection Confidence

Some systems may represent selection confidence explicitly.

For example:

```text
Candidate A → 0.91
Candidate B → 0.58
Candidate C → 0.12
```

However, a numerical score does not automatically prove correctness.

A score may reflect:

- semantic similarity,
- model confidence,
- ranking heuristics,
- historical behavior,
- or another internal signal.

Therefore:

> **Selection confidence is a decision signal, not a correctness guarantee.**

Production systems should avoid treating an arbitrary score as ground truth.

---

# 18. Tool Selection and Least Capability

When several tools can satisfy an action, capability scope should be considered.

Suppose the task is:

> "Retrieve an order."

Available tools:

```text
get_customer_order
customer_data_admin
execute_database_query
```

All three may technically provide the required information.

But the appropriately scoped capability is usually preferable:

```text
get_customer_order
```

This reduces unnecessary capability exposure.

Therefore:

> **When multiple capabilities satisfy the same requirement, prefer the appropriately scoped capability rather than the most powerful one.**

This principle connects Lesson 02's selection decision back to Lesson 01's capability-boundary model.

---

# 19. Invocation

Invocation is the point where the selected capability and constructed arguments are handed to the execution layer.

Conceptually:

```text
Tool Selection
      ↓
Routing
      ↓
Argument Construction
      ↓
Contract Validation
      ↓
Invocation Request
      ↓
Execution Layer
```

An invocation request may contain:

```text
tool name
arguments
request metadata
correlation information
execution context
```

The exact structure depends on the system.

The important point is:

> **Invocation is an explicit handoff from action preparation to the execution layer.**

---

# 20. Invocation Is Not Execution

This distinction is critical for maintaining the boundary between Lesson 02 and Lesson 03.

The system may successfully construct:

```json
{
  "tool": "get_customer_order",
  "arguments": {
    "customer_id": "C123",
    "order_id": "O456"
  }
}
```

That establishes a valid invocation request.

It does **not** establish that the external operation:

- completed,
- succeeded,
- produced a complete result,
- or produced the intended business outcome.

Therefore:

```text
Invocation
    ≠
Execution Success
```

Lesson 02 ends at the invocation handoff.

Lesson 03 owns the subsequent execution lifecycle:

```text
Execution
    ↓
Result
    ↓
Failure
    ↓
Timeout
    ↓
Retryability
    ↓
Ambiguous Outcome
    ↓
Action-level Observability
```

---

# Internal Working

A simplified production flow looks like:

```text
                    Action Need
                         │
                         ▼
                  Tool Discovery
                         │
                         ▼
                Candidate Tool Set
                         │
                         ▼
                    Eligibility
                         │
                         ▼
                  Tool Selection
                         │
                         ▼
                     Routing
                         │
                         ▼
              Argument Construction
                         │
                         ▼
               Contract Validation
                         │
                         ▼
                    Invocation
                         │
                         ▼
              Execution Layer Handoff
```

Different systems may combine some of these steps.

For example, a simple implementation might combine discovery and selection.

A larger system may separate:

```text
Discovery
    ↓
Filtering
    ↓
Ranking
    ↓
Policy
    ↓
Selection
```

The important engineering principle is not that every system must implement identical components.

It is that the responsibilities remain conceptually distinguishable.

---

# Example / Practical Implementation

The following simplified Python example demonstrates a hybrid selection and invocation boundary.

```python
from dataclasses import dataclass
from typing import Any, Callable

@dataclass
class Tool:
    name: str
    description: str
    required_inputs: set[str]
    handler: Callable[..., Any]

TOOLS = {
    "get_customer_order": Tool(
        name="get_customer_order",
        description="Retrieve a specific customer order.",
        required_inputs={"customer_id", "order_id"},
        handler=lambda customer_id, order_id: {
            "customer_id": customer_id,
            "order_id": order_id,
        },
    ),
    "cancel_customer_order": Tool(
        name="cancel_customer_order",
        description="Cancel a customer order.",
        required_inputs={"customer_id", "order_id"},
        handler=lambda customer_id, order_id: {
            "customer_id": customer_id,
            "order_id": order_id,
            "status": "cancel_requested",
        },
    ),
}

def select_tool(action: str) -> Tool:
    if action == "get_order":
        return TOOLS["get_customer_order"]

    if action == "cancel_order":
        return TOOLS["cancel_customer_order"]

    raise ValueError(f"No tool available for action: {action}")

def build_arguments(
    tool: Tool,
    context: dict[str, Any],
) -> dict[str, Any]:
    missing = tool.required_inputs - context.keys()

    if missing:
        raise ValueError(
            f"Missing required arguments: {sorted(missing)}"
        )

    return {
        field: context[field]
        for field in tool.required_inputs
    }

action = "get_order"

context = {
    "customer_id": "C123",
    "order_id": "O456",
}

tool = select_tool(action)

arguments = build_arguments(tool, context)

invocation_request = {
    "tool": tool.name,
    "arguments": arguments,
}

print(invocation_request)
```

The resulting request is conceptually:

```json
{
  "tool": "get_customer_order",
  "arguments": {
    "customer_id": "C123",
    "order_id": "O456"
  }
}
```

Notice what this example does **not** attempt to solve:

- external execution,
- timeout handling,
- retry handling,
- result interpretation,
- recovery,
- compensation.

Those belong to the next execution boundary.

---

# Production Perspective

A production tool-selection system should make the decision path observable enough to answer:

```text
Why was this tool selected?
Which candidates were considered?
Why were some candidates rejected?
Which routing decision was made?
Which arguments were constructed?
Did contract validation pass?
Which invocation was issued?
```

A useful conceptual record might contain:

```text
requested_action
candidate_tools
eligibility_decisions
selected_tool
selection_reason
routing_decision
arguments_constructed
validation_result
invocation_id
```

This information can support:

- debugging,
- evaluation,
- auditing,
- incident investigation,
- performance analysis,
- and system improvement.

However, observability must respect privacy, security, and data-minimization requirements.

Sensitive arguments should not automatically be logged in plaintext.

---

# Engineering Decisions and Trade-offs

## 1. Model-Only Selection vs Deterministic Selection

### Model-Only

```text
Request
   ↓
LLM
   ↓
Tool
```

Advantages:

- flexible,
- natural-language friendly,
- useful for semantically diverse capabilities.

Risks:

- ambiguous selection,
- inconsistent behavior,
- sensitivity to descriptions,
- harder deterministic testing.

### Deterministic

```text
Request
   ↓
Routing Rules
   ↓
Tool
```

Advantages:

- predictable,
- auditable,
- easier to test.

Risks:

- rigid,
- requires explicit rules,
- harder to maintain for large semantic tool sets.

### Hybrid

```text
LLM
 ↓
Candidate Selection
 ↓
Deterministic Eligibility
 ↓
Policy Checks
 ↓
Tool
```

This often provides a useful separation between semantic matching and hard constraints.

---

# 2. Expose All Tools vs Filter the Candidate Set

### Expose Everything

Advantages:

- simple runtime setup,
- maximum capability availability.

Disadvantages:

- larger selection space,
- more ambiguity,
- increased context overhead in model-assisted systems,
- greater risk of inappropriate selection.

### Filter the Candidate Set

Advantages:

- smaller decision space,
- improved relevance,
- easier policy enforcement,
- reduced capability exposure.

Disadvantages:

- filtering logic becomes more complex,
- incorrect filtering can hide required capabilities.

The correct design depends on system size and requirements.

---

## 3. One Selection Layer vs Multiple Decision Layers

A simple system may use:

```text
Request
   ↓
Selector
   ↓
Tool
```

A larger production system may use:

```text
Request
   ↓
Candidate Discovery
   ↓
Eligibility
   ↓
Semantic Selection
   ↓
Policy Checks
   ↓
Routing
   ↓
Invocation
```

Multiple layers can improve separation of concerns but increase system complexity.

The engineering goal is not to maximize the number of layers.

It is to introduce separation where different decisions require different guarantees.

---

# 4. Strict vs Flexible Argument Construction

Strict construction may reject missing or unexpected values immediately.

Advantages:

- predictable,
- safer,
- easier debugging.

Flexible construction may transform or infer values.

Advantages:

- more convenient,
- potentially smoother user experiences.

But inference should not silently fabricate critical values.

For high-impact actions, explicitness is generally preferable.

---

## Common Mistakes and Misconceptions

## Mistake 1 — Treating Tool Selection as Planning

Selecting:

```text
get_customer_order
```

does not define the complete workflow for the user's objective.

Tool selection is a capability decision.

Planning determines broader action sequencing.

---

## Mistake 2 — Selecting the Most Powerful Tool

A powerful capability is not automatically a better capability.

If:

```text
get_customer_order
```

and:

```text
execute_any_database_query
```

both satisfy the requirement, the broader tool unnecessarily expands the capability boundary.

---

## Mistake 3 — Assuming Availability Means Eligibility

A tool can exist in the runtime while being inappropriate or unauthorized for the current action.

```text
Available
    ≠
Eligible
```

---

## Mistake 4 — Letting the Model Invent Arguments

If:

```text
order_id
```

is required but unavailable, the system should not silently invent one.

Missing information should be handled explicitly according to the runtime's established policy.

---

## Mistake 5 — Treating a Model's Tool Choice as Automatically Correct

A model may select:

```text
cancel_customer_order
```

when the user intended:

```text
get_customer_order
```

The fact that the tool selection is syntactically valid does not make it semantically correct.

---

## Mistake 6 — Confusing Routing with Tool Selection

Selecting:

```text
get_customer_order
```

and routing it to:

```text
regional-order-service
```

are different decisions.

The first identifies the logical capability.

The second determines the path used to reach it.

---

## Mistake 7 — Confusing Argument Construction with Validation

Constructing:

```text
customer_id = "C123"
order_id = "O456"
```

does not establish that the values satisfy every contract and business constraint.

Argument construction prepares inputs.

Contract validation evaluates them against the defined boundary.

---

## Mistake 8 — Treating Invocation as Execution Success

Successfully constructing and issuing:

```json
{
  "tool": "get_customer_order",
  "arguments": {
    "customer_id": "C123",
    "order_id": "O456"
  }
}
```

does not prove that the external operation completed successfully.

Invocation establishes the handoff to the execution layer.

---

## Mistake 9 — Logging Everything for Debugging

Tool-selection systems benefit from observability, but blindly logging:

```text
customer_id
email
phone_number
payment_details
```

can create privacy and security problems.

Observability should be designed alongside data-minimization requirements.

---

# Interview Questions with Expected Answers

## Question 1

**What is the difference between tool discovery and tool selection?**

### Expected Answer

Discovery determines which capabilities are available in the current context. Selection determines which available and eligible capability best matches the required action.

---

## Question 2

**A tool is available to the runtime. Why might it still be ineligible for the current request?**

### Expected Answer

Eligibility may depend on authorization, tenant, environment, business state, capability scope, or whether the tool is appropriate for the requested action. Availability only means the capability can potentially be accessed.

---

## Question 3

**Why shouldn't tool selection be treated as planning?**

### Expected Answer

Tool selection chooses a capability for an action. Planning determines how actions may be sequenced to accomplish a broader objective. A single task may require multiple tool selections as part of a larger plan.

---

## Question 4

**Why might a production system use a hybrid tool-selection architecture?**

### Expected Answer

Model-assisted selection can provide flexible semantic matching, while deterministic eligibility and policy checks can enforce hard constraints. This separates probabilistic semantic decisions from non-negotiable system rules.

---

## Question 5

**A model selects the correct tool but provides an invalid argument. Where is the problem?**

### Expected Answer

Tool selection may have been correct, but argument construction or contract validation failed. Selecting a capability and producing valid inputs are separate responsibilities.

---

## Question 6

**Why should routing be separated from tool selection?**

### Expected Answer

Tool selection identifies the logical capability, while routing determines the path used to reach that capability. Separating them allows deployment topology, regions, environments, and service endpoints to evolve without changing the agent-facing capability model.

---

## Question 7

**Why is selecting the most powerful available tool often a poor design?**

### Expected Answer

A broader capability increases the potential blast radius, validation complexity, authorization surface, and consequences of incorrect selection. When multiple tools satisfy the requirement, the appropriately scoped capability is generally preferable.

---

## Question 8

**What should happen when a selected tool requires an argument that is unavailable?**

### Expected Answer

The system should not fabricate the value. It should follow the runtime's established handling policy, which may involve requesting clarification, obtaining the value through another capability, or stopping the current action attempt.

---

## Quick Revision

The core flow is:

```text
Action Need
    ↓
Discovery
    ↓
Candidate Set
    ↓
Eligibility
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
Execution Layer Handoff
```

Remember:

```text
Discovery
    = What capabilities are available?

Eligibility
    = Which capabilities can appropriately be used?

Selection
    = Which capability best fits the action?

Routing
    = Through which path is the capability reached?

Argument Construction
    = What concrete inputs should be supplied?

Validation
    = Do those inputs satisfy the contract?

Invocation
    = What request is handed to the execution layer?
```

And:

```text
Available
    ≠
Eligible

Selection
    ≠
Planning

Argument Construction
    ≠
Validation

Invocation
    ≠
Execution Success
```

---

# Key Takeaways

1. Tool discovery establishes the available capability set.
2. Registration and discovery are related but distinct concerns.
3. Availability does not imply eligibility.
4. Tool selection identifies the capability that best matches the required action.
5. Selection can use semantic, contextual, contractual, authorization, and scope-related signals.
6. Tool selection is not the same as planning.
7. Routing determines the path used to reach a selected logical capability.
8. Logical tool capabilities should generally remain decoupled from physical deployment topology.
9. Argument construction converts contextual information into concrete tool inputs.
10. Argument construction and contract validation are separate responsibilities.
11. Missing critical arguments should not be silently fabricated.
12. Ambiguous selection should be recognized rather than hidden.
13. Selection confidence is a decision signal, not a correctness guarantee.
14. When multiple tools satisfy a requirement, the appropriately scoped capability is generally preferable to the most powerful one.
15. Invocation is the handoff to the execution layer, not proof of successful execution.
16. Production systems benefit from separating semantic selection from deterministic eligibility and policy enforcement where appropriate.
17. Selection and invocation decisions should be observable enough to support debugging and evaluation while respecting privacy and data-minimization requirements.

---

## Further Reading

Continue to:

**[03 — Tool Failures, Side Effects, Idempotency and Invocation Boundaries](./03-Tool-Failures-Side-Effects-Idempotency-and-Invocation-Boundaries.md)**

The next file begins where this file ends:

```text
Invocation
    ↓
Execution
    ↓
Result
    ↓
Failure
    ↓
Timeout
    ↓
Retryability
    ↓
Ambiguous Outcome
    ↓
Action-level Observability
```

The complete AGT-03 progression is therefore:

```text
Lesson 01
Define the capability
        ↓
Lesson 02
Discover, select, route, construct, and invoke the capability
        ↓
Lesson 03
Execute the action and handle its outcome
```

The ownership boundary is intentional:

```text
Lesson 01
What does this capability mean?

Lesson 02
Which capability should be used and what invocation should be prepared?

Lesson 03
What happened when the action was executed?
```

This preserves the AGT-03 principle:

> **One concept → one primary teaching location.**
