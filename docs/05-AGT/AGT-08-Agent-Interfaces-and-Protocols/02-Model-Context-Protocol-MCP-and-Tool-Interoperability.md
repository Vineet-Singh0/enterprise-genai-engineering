# Model Context Protocol (MCP) and Tool Interoperability

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain why MCP exists and what interoperability problem it addresses.
- Distinguish a protocol from an application architecture.
- Explain the roles of an MCP host, client, and server.
- Distinguish MCP tools, resources, and prompts.
- Explain capability discovery and capability exposure.
- Understand structured MCP interaction at the protocol boundary.
- Distinguish protocol semantics from application and business semantics.
- Explain local and remote MCP deployment models.
- Understand the difference between protocol-level statelessness and application state.
- Explain MCP protocol versioning, compatibility, evolution, and deprecation.
- Understand authentication, authorization, capability trust, and response validation at the interoperability boundary.
- Diagnose common MCP interoperability failures.
- Implement a framework-independent capability interaction flow.
- Evaluate when MCP is appropriate and when a direct API or simpler integration is preferable.
- Explain the boundary between MCP, AGT-03 tool execution, A2A, and AGT-09 multi-agent architecture.

---

## Prerequisites

Before studying this chapter, you should understand:

- interfaces and interface contracts
- capability discovery
- structured inputs and outputs
- request/response communication
- interoperability
- compatibility and versioning
- identity and authorization boundaries
- basic distributed-system communication concepts

These concepts are established in:

[01 — Agent Capability Interfaces and Interoperability](./01-Agent-Capability-Interfaces-and-Interoperability.md)

You do **not** need prior knowledge of:

- LangChain
- LangGraph
- LlamaIndex
- AutoGen
- CrewAI
- OpenAI Agents SDK
- Google ADK
- a specific MCP SDK
- a specific cloud provider

This chapter is intentionally framework-independent.

---

## Estimated Reading Time

Approximately **75–105 minutes**, including the practical implementation examples and design exercise.

---

## Before We Start

Lesson 01 established the durable engineering concepts behind interoperability.

This chapter now applies those concepts to a concrete protocol:

> **Model Context Protocol (MCP)**

The goal is not to memorize MCP APIs.

The goal is to understand **why MCP exists, what boundary it standardizes, how its participants interact, and what engineering trade-offs appear when using it in production systems.**

A useful progression is:

```text
Interoperability Fundamentals
        │
        ▼
Capability Interface
        │
        ▼
Protocol Boundary
        │
        ▼
MCP
        │
        ├── Tools
        ├── Resources
        └── Prompts
```

The durable engineering concepts remain more important than any individual protocol revision.

---

# 1. Why MCP Exists

## 1.1 The integration problem

Imagine an AI application that needs access to several external capabilities:

```text
AI Application
     │
     ├────────── CRM API
     │
     ├────────── GitHub API
     │
     ├────────── Database API
     │
     ├────────── Ticketing API
     │
     └────────── Internal Business API
```

Without a standardized interoperability layer, the application may need different integration mechanisms for each system.

For example:

```text
CRM integration
    → custom adapter

GitHub integration
    → custom adapter

Database integration
    → custom adapter

Ticketing integration
    → custom adapter
```

Each integration can introduce differences in:

- discovery
- schemas
- authentication
- request construction
- response handling
- lifecycle behavior
- error handling
- capability metadata

This creates integration variation.

---

## 1.2 The standardization idea

MCP provides a standardized protocol boundary through which an AI application can interact with externally exposed capabilities.

Conceptually:

```text
                AI Application
                       │
                       │
                 MCP Client
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
      MCP Server   MCP Server   MCP Server
          │            │            │
         CRM         GitHub      Internal API
```

The important idea is not:

> "MCP replaces APIs."

It does not.

Instead:

> **MCP provides a standardized interoperability boundary for exposing and consuming capabilities.**

The underlying systems can still use:

- REST
- databases
- RPC
- internal services
- files
- SaaS APIs
- other protocols

MCP sits at an interoperability boundary rather than eliminating the underlying systems.

---

# 2. What MCP Is

MCP is a protocol for communication between an AI application and an MCP server that exposes capabilities such as:

- tools
- resources
- prompts

A simplified conceptual model is:

```text
┌──────────────────────────────┐
│        AI Application        │
│                              │
│   Model / Agent / Runtime    │
│             │                │
│             ▼                │
│        MCP Client            │
└─────────────┬────────────────┘
              │
              │ MCP
              ▼
┌──────────────────────────────┐
│         MCP Server           │
│                              │
│   Tools   Resources Prompts  │
│      │         │       │     │
│      ▼         ▼       ▼     │
│ External capabilities/data   │
└──────────────────────────────┘
```

The exact application architecture surrounding MCP can vary.

The protocol does not require one particular agent architecture.

---

# 3. What MCP Is Not

MCP should not be confused with:

### An agent architecture

MCP does not define how an agent reasons, plans, or decides.

### A multi-agent architecture

MCP does not mean multiple agents are being orchestrated.

### A replacement for APIs

Existing APIs may remain underneath an MCP server.

### A guarantee of safe execution

MCP standardizes communication and capability exposure. It does not automatically make a capability safe.

### A complete authorization system

Protocol-level authentication and authorization mechanisms do not replace application-level authorization policy.

### A guarantee of semantic interoperability

Two systems can technically communicate while still misunderstanding the meaning of data.

### A requirement for remote infrastructure

An MCP server can be local.

This distinction is important:

```text
MCP
≠
Agent Architecture
≠
Multi-Agent Architecture
≠
API Replacement
≠
Safety System
```

---

# 4. Mental Model

The most useful mental model is:

> **MCP standardizes the boundary through which an AI application can discover and interact with externally exposed capabilities.**

Think of the boundary as:

```text
┌──────────────────────────────────────────┐
│            MCP Boundary                  │
│                                          │
│  Capability discovery                    │
│  Interface contract                      │
│  Structured communication                │
│  Protocol semantics                      │
│  Identity / authorization boundaries     │
│  Context exchange                        │
│  Compatibility / versioning              │
│                                          │
└──────────────────────────────────────────┘
```

The boundary exists between:

```text
AI Application
      │
      ▼
MCP Client
      │
      ▼
MCP Server
      │
      ▼
External Capability
```

---

# 5. MCP Architecture

## 5.1 Host

The **host** is the AI application or application environment that uses MCP.

The host may contain:

- model interaction
- agent runtime
- user interface
- MCP clients
- application state
- business logic

The host is an application-level role.

---

## 5.2 Client

An MCP client is the component within the host that communicates with an MCP server.

Conceptually:

```text
Host
 │
 ├── Model / Agent
 │
 ├── Application Logic
 │
 └── MCP Client
          │
          ▼
       MCP Server
```

The client handles the protocol interaction with the server.

A host may contain one or more MCP clients depending on its architecture.

---

## 5.3 Server

An MCP server is an MCP participant that exposes capabilities through the protocol.

Those capabilities may include:

- tools
- resources
- prompts

An MCP server does not necessarily mean:

- a remote machine
- an HTTP server
- a cloud service

It may be a local process communicating through a local transport.

---

## 5.4 Capability boundary

The server represents an explicit capability boundary.

For example:

```text
MCP Server
    │
    ├── customer_lookup
    ├── customer_update
    └── customer_history
```

The server can control which capabilities are exposed.

This makes capability exposure an engineering and security decision.

---

# 6. MCP Protocol Model

A useful layered model is:

```text
Application Intent
        │
        ▼
MCP Protocol Message
        │
        ▼
Transport
        │
        ▼
MCP Participant
        │
        ▼
Capability / Resource / Prompt
        │
        ▼
Application Result
```

Each layer answers a different question.

### Application intent

What does the application want to accomplish?

Example:

```text
Find customer 123.
```

### Protocol message

How is that interaction represented according to MCP?

### Transport

How does the message move between participants?

### MCP participant

Which MCP component receives and processes the interaction?

### Capability

What actual application-level functionality or information is accessed?

---

# 7. Protocol Semantics vs Application Semantics

This distinction is critical.

A protocol can standardize:

```text
How participants communicate
```

without standardizing:

```text
What every business concept means
```

For example:

```text
customer_id = "123"
```

may be structurally valid.

But different systems could interpret:

```text
customer_id
```

differently.

One system may mean:

```text
Internal CRM identifier
```

while another means:

```text
External customer identifier
```

Both systems may successfully exchange valid protocol messages.

Yet the integration is semantically incorrect.

Therefore:

```text
Protocol Compatibility
        ≠
Semantic Compatibility
```

This is one of the most important lessons in interoperability engineering.

---

# 8. MCP Primitives

MCP exposes several important capability types.

The three major primitives are:

```text
Tools
Resources
Prompts
```

They are not interchangeable.

---

## 8.1 Tools

Tools expose executable capabilities.

Conceptually:

```text
Tool
 ├── name
 ├── description
 ├── input contract
 └── execution result
```

Examples could include:

```text
search_customer
create_ticket
query_database
send_notification
```

The important distinction is that a tool represents an operation that can be invoked.

Tool execution itself is not the primary subject of this chapter.

AGT-03 owns the deeper engineering treatment of:

- tool selection
- tool schemas
- invocation
- side effects
- idempotency
- execution failures

AGT-08 focuses on how such capabilities are exposed and consumed across an interoperability boundary.

---

## 8.2 Resources

Resources expose information or contextual data.

Conceptually:

```text
Resource
   │
   └── application-accessible information
```

Examples might include:

- documents
- configuration information
- project information
- database records
- application context

A resource should not automatically be treated as a tool.

A useful distinction is:

```text
Tool
→ perform an operation

Resource
→ expose information
```

---

## 8.3 Prompts

Prompts expose reusable prompt-oriented interaction patterns.

They should not be treated as tools.

Conceptually:

```text
Prompt
   │
   └── reusable interaction template
```

This allows applications to discover and use standardized prompt-related capabilities exposed by a server.

---

# 9. Capability Discovery

A major value of an interoperability protocol is that the client does not necessarily need to hard-code every capability.

Conceptually:

```text
Advertise
    ↓
Discover
    ↓
Inspect
    ↓
Validate
    ↓
Select
    ↓
Invoke / Access
    ↓
Validate Result
    ↓
Refresh When Needed
```

This is more than simply asking:

> "Does this server exist?"

The client needs to understand:

- what capabilities are available
- what their contracts look like
- what versions are supported
- what metadata is available
- what interaction model applies

---

## 9.1 Discovery is not trust

Discovery answers:

> What does this participant claim to support?

It does not automatically answer:

> Should I trust it?

These are separate concerns.

```text
Discovery
    ↓
What is available?

Identity
    ↓
Who is the participant?

Authorization
    ↓
Am I allowed?

Validation
    ↓
Does the interaction conform?

Trust
    ↓
Should this participant/capability be relied upon?
```

This separation is important in production systems.

---

# 10. Structured Interaction

MCP provides structured interaction rather than requiring every integration to invent its own communication format.

A conceptual interaction looks like:

```text
Client
   │
   │ request
   ▼
Server
   │
   │ validate
   │
   │ process
   │
   ▼
Result
   │
   ▼
Client
```

The request and response must conform to the protocol and capability contracts.

This gives the system a common communication model.

---

# 11. Request/Response vs Domain Semantics

Consider:

```text
Request:
customer_lookup(customer_id="123")
```

There are multiple layers here.

### Protocol layer

How is the request represented and exchanged?

### Capability layer

What capability is being requested?

### Domain layer

What does `customer_id=123` actually mean?

### Application layer

What should the application do with the result?

A production integration must keep these layers conceptually separate.

```text
Protocol
   ↓
Capability
   ↓
Domain Semantics
   ↓
Application Behavior
```

A protocol can standardize the first layer without completely solving the others.

---

# 12. Context Exchange

An AI application may need contextual information when interacting with a capability.

Examples include:

- identifiers
- user context
- task context
- resource references
- application state references
- correlation information

Context should be exchanged deliberately.

Do not assume:

> "Because two systems communicate through MCP, they automatically share all context."

They do not.

Context must have an explicit representation and boundary.

---

## 13. Protocol State vs Application State

One of the most important distinctions in modern MCP design is:

> **Protocol-level statelessness does not mean application-level statelessness.**

A protocol can avoid requiring a persistent protocol session while the application still maintains state.

For example:

```text
Protocol Layer

Request A
Request B
Request C

No required persistent protocol session
```

while the application may maintain:

```text
Application Layer

Request A
    ↓
job_id = 123

Request B
    ↓
job_id = 123

Request C
    ↓
retrieve result for job_id = 123
```

The application state is explicit.

The client can pass a state handle such as:

```text
job_id
conversation_id
resource_id
task_id
```

as part of later interactions.

Therefore:

```text
Protocol Statelessness
        ≠
Application Statelessness
```

This distinction is critical when designing long-running or stateful application behavior around a protocol.

---

# 14. MCP Transport

MCP interaction requires a transport mechanism.

Two important deployment patterns are:

```text
Local
```

and:

```text
Remote
```

---

## 14.1 Local MCP

A local application may launch or communicate with an MCP server process locally.

Conceptually:

```text
Host
 │
 │ local transport
 ▼
MCP Server Process
```

This is useful when:

- capability implementation is local
- low-latency access is desired
- the capability is tightly coupled to the host environment
- remote deployment is unnecessary

---

## 14.2 Remote MCP

An application can communicate with an MCP server across a network.

Conceptually:

```text
Application
      │
      │ network transport
      ▼
Remote MCP Server
      │
      ▼
External Systems
```

Remote deployment introduces additional concerns:

- network failures
- authentication
- authorization
- latency
- availability
- routing
- tenancy
- observability

---

## 14.3 Transport is not the protocol

Do not confuse:

```text
MCP
```

with:

```text
Transport
```

The conceptual relationship is:

```text
MCP Protocol
      │
      ▼
Transport Binding
      │
      ▼
Network / Process Communication
```

The protocol defines communication semantics.

The transport determines how communication is carried.

---

# 15. Protocol Versioning and Evolution

Interoperability does not end when version one is released.

A production protocol must evolve.

Important concerns include:

- version identification
- compatibility
- schema changes
- capability changes
- deprecation
- migration
- version negotiation where applicable
- coexistence of supported versions

A useful evolution model is:

```text
Version N
   │
   ├── compatible changes
   │
   ├── additive capabilities
   │
   └── deprecation
           │
           ▼
      Version N+1
```

---

## 15.1 Backward compatibility

A newer participant should ideally continue to interoperate with supported older participants where the protocol's compatibility policy permits it.

Example:

```text
New Client
     │
     ▼
Older Server
```

If compatibility is broken, the failure should be detectable rather than silently producing incorrect behavior.

---

## 15.2 Schema evolution

Suppose an input evolves from:

```json
{
  "customer_id": "123"
}
```

to:

```json
{
  "customer_id": "123",
  "region": "IN"
}
```

An additive field may be easier to evolve safely than changing the meaning of `customer_id`.

The important principle is:

> **Changing structure is not the same as changing meaning.**

Both must be considered during compatibility analysis.

---

## 15.3 Semantic versioning is not enough

Even if two implementations report the same protocol version, they can still disagree semantically.

For example:

```text
Version: 2.x
```

may be identical while one implementation interprets:

```text
timeout = 0
```

as:

```text
no timeout
```

and another interprets it as:

```text
immediate timeout
```

Therefore:

```text
Version Compatibility
        ≠
Semantic Compatibility
```

Contract tests and interoperability tests are still necessary.

---

# 16. Deprecation

Capabilities and protocol features eventually need to be retired.

A healthy lifecycle looks like:

```text
Introduce
   ↓
Adopt
   ↓
Maintain
   ↓
Deprecate
   ↓
Migrate
   ↓
Remove
```

Deprecation should be explicit.

Production systems should know:

- what is deprecated
- why it is deprecated
- what replaces it
- how long it remains supported
- how consumers migrate

A standardized protocol does not remove the need for lifecycle management.

---

# 17. Security and Trust

MCP creates an interoperability boundary.

That means security must be considered at the boundary.

The key questions include:

```text
Who is communicating?
        ↓
Who is allowed?
        ↓
What capability is exposed?
        ↓
What data may cross the boundary?
        ↓
Can the response be trusted and validated?
```

---

## 17.1 Authentication

Authentication establishes or verifies the identity of a participant.

Conceptually:

```text
Participant
     │
     ▼
Identity verification
```

---

## 17.2 Authorization

Authorization answers:

> What is this principal allowed to do?

For example:

```text
Principal A
    │
    ├── customer.read      ✓
    ├── customer.update    ✓
    └── customer.delete    ✗
```

Authentication and authorization are related but distinct.

```text
Establish / verify identity
        ↓
Evaluate authorization
```

The exact sequence can vary by implementation; the important point is that identity and authorization are separate security decisions.

---

## 17.3 Capability exposure is a security decision

Suppose an MCP server exposes:

```text
read_customer
update_customer
delete_customer
execute_payment
```

These capabilities have different risk levels.

Exposing a capability means creating an interaction boundary through which another application may attempt to use it.

Therefore:

> **Capability exposure should be treated as an explicit security decision.**

The protocol does not determine that every exposed capability is safe.

---

## 17.4 Authentication is not authorization

A valid identity does not automatically imply permission.

```text
Authenticated
      │
      ▼
Authorization check
      │
      ├── allowed
      └── denied
```

---

## 17.5 Authorization is not agent safety

Even an authorized operation can be unsafe in a particular context.

For example:

```text
User is authorized
        ↓
Capability is authorized
        ↓
Operation is still potentially harmful
```

Broader agent safety and action-control concerns belong to AGT-11.

---

## 17.6 Protocol security is not enterprise governance

AGT-08 may discuss:

- protocol identity
- authentication
- authorization
- trust boundaries
- capability exposure
- response validation

But it does not own:

- enterprise governance
- compliance programs
- organizational access policy
- enterprise IAM architecture
- regulatory controls

Those belong to ENT.

---

# 18. Untrusted Capability Data

Capabilities and responses crossing an interoperability boundary should not automatically be trusted merely because they came through a valid protocol interaction.

Consider:

```text
MCP Server
     │
     ▼
Response
     │
     ▼
Client Validation
```

The client may need to validate:

- structure
- expected fields
- types
- ranges
- domain assumptions
- unexpected content
- authorization implications

This is especially important when responses influence later application behavior.

---

# 19. Internal Working Model

A useful end-to-end model is:

```text
┌──────────────────────────────┐
│        AI Application        │
│                              │
│  Model / Agent / Runtime     │
└──────────────┬───────────────┘
               │
               ▼
        ┌─────────────┐
        │ MCP Client  │
        └──────┬──────┘
               │
       Discovery / Request
               │
               ▼
        ┌─────────────┐
        │ MCP Server  │
        └──────┬──────┘
               │
        Contract Validation
               │
        Authorization
               │
               ▼
       Capability Boundary
               │
               ▼
      External Application
               │
               ▼
           Result
               │
               ▼
        Response Validation
               │
               ▼
          MCP Client
               │
               ▼
        Application Logic
```

This model deliberately separates:

- protocol interaction
- capability access
- authorization
- application semantics
- response validation

---

# 20. Framework-Independent Practical Implementation

The following pseudocode demonstrates the engineering flow without depending on an MCP SDK.

## 20.1 Capability contract

```text
Capability:
    name = "customer_lookup"

Input:
    customer_id: string

Output:
    customer:
        id: string
        name: string
        status: string
```

---

## 20.2 Discovery

```text
capabilities = discover(server)

if "customer_lookup" not in capabilities:
    fail("Required capability unavailable")
```

The discovery result is not automatically trusted.

The client should inspect and validate the capability metadata according to its integration policy.

---

## 20.3 Contract validation

```text
capability = capabilities["customer_lookup"]

validate_capability_contract(capability)
```

Check things such as:

```text
name
input schema
output schema
supported interaction semantics
version information
```

---

## 20.4 Authorization

```text
principal = establish_identity()

if not authorized(principal, capability):
    fail("Capability not authorized")
```

The exact authorization mechanism depends on the application and protocol environment.

The engineering principle remains:

```text
Identity
    ↓
Authorization
    ↓
Capability access
```

---

## 20.5 Invocation

```text
request = {
    "customer_id": "123"
}

validate_input(request, capability.input_schema)

response = invoke(
    capability,
    request
)
```

---

## 20.6 Response validation

```text
validate_output(
    response,
    capability.output_schema
)
```

Then apply application-level semantic validation:

```text
if response.customer.status not in allowed_statuses:
    fail("Unexpected domain value")
```

This demonstrates an important distinction:

```text
Schema Validation
        ↓
Semantic Validation
```

Both may be necessary.

---

## 20.7 Consumption

```text
customer = response.customer

application.process(customer)
```

The final application behavior is outside the protocol itself.

---

# 21. AGT-03 Boundary: Tool Execution vs Capability Interoperability

This distinction must remain explicit.

## AGT-03

AGT-03 primarily asks:

> How does an agent execute a tool safely and reliably?

It owns concepts such as:

- tool contracts
- tool schemas
- tool selection
- routing
- invocation
- side effects
- idempotency
- execution failures

---

## AGT-08

AGT-08 asks:

> How can a capability be exposed and consumed across an interoperability boundary?

It covers:

- capability exposure
- capability discovery
- protocol communication
- interoperability contracts
- participant identity
- authorization boundaries
- protocol compatibility
- protocol evolution

The relationship is:

```text
                 AGT-03
             Tool Execution
                   │
                   ▼
             Tool Invocation
                   │
                   │
        ┌──────────┴──────────┐
        │ Interoperability    │
        │ Boundary            │
        │                     │
        │       AGT-08        │
        └──────────┬──────────┘
                   │
                   ▼
             External
             Capability
```

AGT-08 should not re-teach the complete mechanics of tool execution.

It should explain how the capability becomes interoperable across system boundaries.

---

# 22. Production Integration Patterns

## 22.1 Local capability server

```text
Host
 │
 └── MCP Client
        │
        ▼
   Local MCP Server
        │
        ▼
   Local Capability
```

Useful when:

- the capability is local
- latency matters
- deployment simplicity is preferred
- network exposure is unnecessary

---

## 22.2 Shared remote capability server

```text
Application A ──┐
                │
Application B ──┼──► MCP Server
                │
Application C ──┘
```

This can reduce duplicated integration logic.

However, it introduces:

- availability dependencies
- network latency
- authorization complexity
- tenancy concerns
- operational ownership

---

## 22.3 Gateway pattern

```text
Applications
      │
      ▼
MCP Gateway
      │
      ├── Capability A
      ├── Capability B
      └── Capability C
```

A gateway can centralize:

- routing
- policy enforcement
- authentication
- authorization
- observability
- version selection

But it can also become:

- a bottleneck
- a single failure domain
- a coupling point

Therefore, a gateway should be justified rather than added automatically.

---

## 22.4 Tenant-aware capability exposure

In multi-tenant systems:

```text
Tenant A
   │
   ▼
Capabilities available to Tenant A

Tenant B
   │
   ▼
Capabilities available to Tenant B
```

Capability discovery should not imply universal access.

A capability may be:

```text
discoverable
but not authorized
```

or:

```text
available in principle
but unavailable to this tenant
```

This is another reason to separate discovery from authorization.

---

## 22.5 Capability catalog caching

Capability metadata may be cached to reduce repeated discovery overhead.

However:

```text
Cached Capability Metadata
          │
          ▼
Potentially stale
```

Therefore, production systems need a policy for:

- refresh
- expiration
- invalidation
- version changes
- capability removal

---

# 23. Failure Modes and Diagnostics

Interoperability failures should be classified before attempting remediation.

---

## 23.1 Discovery failure

```text
Client
  │
  ▼
Cannot discover capabilities
```

Possible causes:

- server unavailable
- discovery unsupported
- malformed discovery response
- transport failure
- authorization failure

---

## 23.2 Unsupported protocol version

```text
Client Version
      ≠
Server Version
```

Possible result:

```text
Unsupported version
```

Diagnosis should determine:

- supported versions
- compatibility policy
- negotiation behavior
- migration requirements

---

## 23.3 Schema mismatch

Example:

```text
Expected:
customer_id: string

Received:
customer_id: integer
```

This is a structural interoperability failure.

---

## 23.4 Semantic mismatch

Both sides accept:

```text
customer_id = "123"
```

but disagree about what it means.

This is more dangerous because the interaction may appear successful.

```text
Syntax compatible
        ↓
Semantic incompatible
```

---

## 23.5 Authentication failure

The participant cannot establish or verify the required identity.

---

## 23.6 Authorization failure

The participant is identified but lacks permission.

```text
Authenticated
     │
     ▼
Authorized?
   /     \
 No       Yes
 │         │
Fail      Continue
```

---

## 23.7 Stale capability information

The client believes:

```text
Capability X exists
```

but the server has:

```text
Capability X removed
```

This can occur when discovery metadata is cached.

---

## 23.8 Server unavailable

```text
Client
   │
   X
Server unavailable
```

This is an availability problem rather than necessarily a protocol problem.

---

## 23.9 Invalid response

The server responds, but the response violates the expected contract.

Possible causes:

- schema mismatch
- implementation defect
- version mismatch
- semantic incompatibility

---

## 23.10 Timeout

The request is valid but does not complete within the expected time.

Diagnosis should distinguish:

```text
Protocol timeout
        vs
Capability execution timeout
        vs
Network timeout
```

These can have different causes.

---

## 23.11 Protocol failure vs capability failure

Always ask:

> Did the interoperability mechanism fail, or did the underlying capability fail?

For example:

```text
MCP request successfully delivered
        ↓
Capability executed
        ↓
Database unavailable
```

The MCP protocol may have worked correctly.

The underlying capability failed.

This distinction improves incident diagnosis.

---

# 24. MCP and Current Protocol Evolution

MCP is an evolving protocol rather than a frozen specification.

When working with current implementations, engineers must distinguish between:

```text
Current protocol behavior
```

and:

```text
Legacy protocol behavior
```

The modern MCP protocol direction includes a stateless protocol core and changes to lifecycle/session handling compared with earlier revisions.

Older implementations may still use legacy behavior for compatibility.

Therefore, production engineers should always verify:

- protocol revision
- SDK version
- transport support
- lifecycle behavior
- authentication model
- supported capabilities
- deprecations

Do not assume that a blog post or old tutorial describes the current protocol.

---

# 25. When MCP Is Appropriate

MCP is particularly useful when:

### Multiple applications need standardized access

```text
Application A ─┐
Application B ─┼──► Shared capability boundary
Application C ─┘
```

### Capability discovery matters

Consumers should be able to discover available capabilities rather than hard-code every integration detail.

### Multiple implementations need a common protocol

A standardized protocol can reduce custom integration variation.

### Capability exposure is a first-class concern

The system wants an explicit boundary between AI applications and external capabilities.

### The ecosystem benefits from interoperability

The more independently developed participants need to communicate, the greater the potential value of standardization.

---

# 26. When MCP May Be Unnecessary

MCP is not automatically the correct choice.

Consider a direct API when:

```text
One application
      │
      ▼
One service
```

and:

- the interface is stable
- the integration is tightly controlled
- discovery is unnecessary
- there is no interoperability ecosystem
- introducing another protocol boundary adds more complexity than value

For example:

```text
Application
    │
    ▼
Internal REST API
```

may be perfectly appropriate.

The goal is not:

> "Use MCP everywhere."

The goal is:

> **Choose the simplest interoperability mechanism that satisfies the actual engineering requirements.**

---

# 27. MCP vs Direct API

| Concern | Direct API | MCP |
|---|---|---|
| Custom integration | Common | Reduced through standardization |
| Discovery | Usually application-specific | Protocol-oriented capability discovery |
| Ecosystem interoperability | Limited unless standardized separately | Core motivation |
| Simplicity for one integration | Often excellent | May be unnecessary |
| Standard capability boundary | Depends on API design | Explicit protocol boundary |
| Protocol overhead | Lower | Higher |
| Existing API compatibility | Native | Usually requires an MCP boundary/adapter |
| Best fit | Controlled service-to-service integration | AI capability interoperability |

Neither approach is universally superior.

---

## 28. MCP vs Generic Tool Adapter

A generic tool adapter may provide:

```text
Agent
  │
  ▼
Tool Adapter
  │
  ▼
External API
```

MCP provides a standardized interoperability protocol around capability exposure.

The difference is primarily one of standardization and interoperability scope.

A custom adapter may be simpler when:

- only one consumer exists
- integration is tightly controlled
- no interoperability ecosystem is needed

MCP becomes more attractive when:

- multiple consumers exist
- capability discovery matters
- standardized interaction is valuable
- independent implementations need a shared boundary

---

# 29. MCP Is Not Multi-Agent Architecture

This distinction must remain explicit.

MCP:

```text
AI Application
      │
      ▼
Capability
```

A2A:

```text
Agent System A
      │
      ▼
Agent System B
```

Multi-agent architecture:

```text
Agent A
   │
   ├── Agent B
   ├── Agent C
   └── Agent D
```

These represent different architectural questions.

```text
MCP
→ How can an application interoperate with capabilities?

A2A
→ How can independent agent systems interoperate?

AGT-09
→ When should multiple agents be used and how should they be architected?
```

MCP does not imply multi-agent architecture.

---

# 30. Common Mistakes and Misconceptions

## Mistake 1 — "MCP replaces APIs"

Incorrect.

MCP can sit above or alongside existing APIs.

---

## Mistake 2 — "Every MCP server is remote"

Incorrect.

Local MCP server processes are valid.

---

## Mistake 3 — "MCP is an agent-to-agent protocol"

Incorrect.

MCP primarily addresses capability interoperability between an AI application and externally exposed capabilities.

---

## Mistake 4 — "MCP creates a multi-agent system"

Incorrect.

A protocol does not determine the architecture.

---

## Mistake 5 — "Authentication means the operation is safe"

Incorrect.

Authentication establishes identity.

Authorization determines permission.

Safety requires additional controls.

---

## Mistake 6 — "If schemas match, interoperability is solved"

Incorrect.

Semantic mismatch can still exist.

```text
Schema compatibility
        ≠
Semantic compatibility
```

---

## Mistake 7 — "Stateless protocol means stateless application"

Incorrect.

Application state can still be explicitly maintained.

---

## Mistake 8 — "Discovery means trust"

Incorrect.

A participant can advertise capabilities that the client still needs to validate and authorize.

---

## Mistake 9 — "MCP is always better than a direct API"

Incorrect.

Standardization introduces complexity.

The engineering decision depends on interoperability requirements.

---

# 31. Engineering Decision Framework

Before introducing MCP, ask:

### 1. What interoperability problem are we solving?

```text
What systems need to communicate?
```

### 2. How many consumers exist?

```text
One?
Several?
Independent organizations?
```

### 3. Is capability discovery required?

If capabilities are fixed and known, a direct API may be simpler.

### 4. Is standardization valuable?

If every integration would otherwise implement its own mechanism, standardization becomes more valuable.

### 5. What is the security boundary?

Define:

- identity
- authorization
- capability exposure
- data boundaries

### 6. What is the lifecycle?

Consider:

- versioning
- compatibility
- deprecation
- migration

### 7. What happens when the capability is unavailable?

Define expected behavior and diagnostics.

### 8. What complexity does MCP introduce?

Consider:

- protocol implementation
- operational overhead
- debugging
- security configuration
- version management

### 9. Would a direct API solve the problem more simply?

If yes, MCP may not be justified.

---

# 32. Production Review Checklist

Before approving an MCP integration, review:

```text
□ Is MCP actually needed?

□ What interoperability problem does it solve?

□ What capabilities are exposed?

□ Who owns those capabilities?

□ How are capabilities discovered?

□ How is capability metadata validated?

□ How is identity established?

□ How is authorization enforced?

□ Which capabilities are available to which principals?

□ How are inputs validated?

□ How are responses validated?

□ How are semantic assumptions documented?

□ What is local and what is remote?

□ What is protocol state versus application state?

□ Which protocol revision is supported?

□ How are versions managed?

□ What is the compatibility policy?

□ How are deprecated capabilities handled?

□ What happens when discovery fails?

□ What happens when the server is unavailable?

□ What happens when the capability itself fails?

□ How are stale capability definitions refreshed?

□ What is the operational owner?

□ What is the migration strategy?
```

---

# 33. Interview Questions

## Question 1

**What problem does MCP solve?**

### Expected Answer

MCP provides a standardized interoperability boundary through which AI applications can discover and interact with externally exposed capabilities such as tools, resources, and prompts. Its value comes from reducing custom integration variation and enabling a common protocol model.

---

## Question 2

**Is MCP an agent-to-agent protocol?**

### Expected Answer

No. MCP is primarily positioned around capability interoperability between an AI application/agent and externally exposed capabilities. Agent-to-agent interoperability is the focus of A2A.

---

## Question 3

**Does MCP replace REST APIs?**

### Expected Answer

No. Existing APIs can remain underneath an MCP server. MCP provides another standardized interoperability boundary rather than replacing the underlying service interfaces.

---

## Question 4

**What is the difference between an MCP host, client, and server?**

### Expected Answer

The host is the AI application environment. The client is the component within the host that communicates through MCP. The server is the MCP participant exposing capabilities such as tools, resources, and prompts.

---

## Question 5

**What is the difference between an MCP tool and an MCP resource?**

### Expected Answer

A tool represents an executable capability, while a resource represents application-accessible information or context. They serve different interaction purposes.

---

## Question 6

**If two MCP implementations use the same protocol version, are they guaranteed to be interoperable?**

### Expected Answer

No. Version compatibility does not guarantee semantic compatibility. They may disagree about the meaning of fields, values, or application-level behavior.

---

## Question 7

**What is the difference between protocol statelessness and application state?**

### Expected Answer

Protocol statelessness means the protocol does not require a persistent protocol session for every interaction. The application can still maintain state explicitly using identifiers, handles, or other application-level mechanisms.

---

## Question 8

**An MCP server advertises a capability, but invocation fails. How would you diagnose it?**

### Expected Answer

Separate the problem into stages:

```text
Discovery
→ capability metadata
→ protocol/version compatibility
→ authentication
→ authorization
→ input validation
→ capability execution
→ response validation
```

Determine which boundary failed rather than treating every failure as an MCP failure.

---

## Question 9

**Two systems accept the same request schema but interpret a field differently. What type of failure is this?**

### Expected Answer

Semantic incompatibility. The syntax and schema may be compatible while the application-level meaning differs.

---

## Question 10

**When would you choose a direct API instead of MCP?**

### Expected Answer

If the integration is tightly controlled, has a small number of consumers, requires no capability discovery, and does not benefit from standardized interoperability, a direct API may be simpler and preferable.

---

## Question 11

**Why is capability discovery not enough to establish trust?**

### Expected Answer

Discovery tells the client what a participant claims to expose. It does not establish identity, authorization, safety, or whether the advertised capability should be trusted.

---

## Question 12 — Engineering Judgment

**Your company has one internal application calling one internal service. The API is stable and both teams control the systems. Should you introduce MCP?**

### Expected Answer

Not automatically. A direct API is likely simpler unless there is a concrete interoperability requirement such as multiple independent consumers, capability discovery, ecosystem standardization, or future integration needs that justify MCP's additional complexity.

---

## Question 13 — Engineering Judgment

**Two teams support the same MCP protocol version, but one interprets `customer_id` as an internal identifier and the other interprets it as an external identifier. How would you prevent this?**

### Expected Answer

Protocol versioning alone is insufficient. The teams need explicit semantic contracts, domain definitions, contract tests, examples, compatibility testing, and potentially stronger naming or schema constraints.

---

## Question 14 — Architecture Judgment

**A team says, "We should adopt MCP because we plan to build a multi-agent system." What would you challenge?**

### Expected Answer

MCP and multi-agent architecture solve different problems. MCP addresses capability interoperability, while multi-agent architecture is an architectural decision owned by AGT-09. The team should first identify whether the actual interoperability problem is agent-to-capability or agent-to-agent communication.

---

# 34. Practical Design Exercise

Design an interoperability architecture for this scenario:

> An enterprise AI assistant needs access to customer records, ticketing systems, and internal documentation. Different teams own each capability. Some capabilities are local while others are remote.

Design:

1. Host architecture.
2. MCP client placement.
3. MCP server boundaries.
4. Capability exposure.
5. Discovery mechanism.
6. Authentication.
7. Authorization.
8. Input/output validation.
9. Failure diagnosis.
10. Versioning strategy.
11. Capability ownership.
12. Local vs remote deployment decisions.

Your design should explicitly answer:

> **Why MCP instead of direct APIs for each integration?**

Then identify at least one situation where you would **not** use MCP.

---

## 35. Quick Revision

### MCP in one sentence

> MCP provides a standardized interoperability boundary for AI applications to discover and interact with externally exposed capabilities.

### Core architecture

```text
Host
 │
 ▼
MCP Client
 │
 │ MCP
 ▼
MCP Server
 │
 ├── Tools
 ├── Resources
 └── Prompts
```

### Core distinction

```text
MCP
→ capability interoperability

A2A
→ agent-to-agent interoperability

AGT-09
→ multi-agent architecture
```

### Protocol layers

```text
Application Intent
        ↓
Protocol Message
        ↓
Transport
        ↓
MCP Participant
        ↓
Capability
        ↓
Application Result
```

### Important distinctions

```text
Protocol compatibility
        ≠
Semantic compatibility

Authentication
        ≠
Authorization

Discovery
        ≠
Trust

Protocol statelessness
        ≠
Application statelessness

MCP
        ≠
Multi-Agent Architecture
```

### Engineering lifecycle

```text
Discover
   ↓
Inspect
   ↓
Validate
   ↓
Authorize
   ↓
Interact
   ↓
Validate Result
   ↓
Monitor / Refresh
```

---

# 36. Key Takeaways

1. MCP is an interoperability protocol, not an agent architecture.
2. MCP primarily addresses AI application-to-capability interoperability.
3. An MCP host contains MCP clients that communicate with MCP servers.
4. MCP servers can be local or remote.
5. Tools, resources, and prompts represent different capability types.
6. Capability discovery does not establish trust or authorization.
7. Protocol compatibility does not guarantee semantic compatibility.
8. Protocol-level statelessness does not prevent application-level state.
9. Authentication and authorization are distinct security concerns.
10. Capability exposure is itself a security decision.
11. MCP does not replace underlying APIs.
12. MCP does not automatically create multi-agent systems.
13. AGT-03 owns deeper tool execution mechanics.
14. AGT-08 owns interoperability across capability boundaries.
15. Protocol evolution requires versioning, compatibility, deprecation, and migration strategies.
16. Production MCP systems need explicit ownership, security, validation, diagnostics, and lifecycle management.
17. MCP should be adopted because it solves a real interoperability problem, not simply because it is available.

---

## 37. Further Reading

For implementation work, prefer current primary protocol documentation and SDK documentation over old tutorials.

Useful categories of reference material include:

- MCP protocol specification
- MCP transport documentation
- MCP authorization/security documentation
- MCP SDK documentation
- protocol revision and changelog documentation
- interoperability and contract-testing guidance

When implementing MCP in production, always verify the protocol revision and SDK version being used because protocol behavior evolves.

---

## Final Mental Model

Keep this model in mind:

```text
                         AI APPLICATION
                              │
                              │
                         MCP CLIENT
                              │
                              │
                    ┌─────────▼─────────┐
                    │   MCP BOUNDARY   │
                    │                   │
                    │ Discovery         │
                    │ Contracts         │
                    │ Protocol          │
                    │ Identity          │
                    │ Authorization     │
                    │ Context           │
                    │ Compatibility     │
                    │ Evolution         │
                    └─────────┬─────────┘
                              │
                              ▼
                         MCP SERVER
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
            TOOL           RESOURCE         PROMPT
              │               │               │
              └───────────────┼───────────────┘
                              │
                              ▼
                    EXTERNAL CAPABILITY
                              │
                              ▼
                      APPLICATION RESULT
```

And remember the most important boundary:

```text
┌────────────────────────────────────────────┐
│                  AGT-08                    │
│                                            │
│ How do independently implemented systems   │
│ communicate through interoperable           │
│ capability interfaces and protocols?       │
│                                            │
└────────────────────────────────────────────┘
                    │
                    ▼
                  MCP
                    │
                    ▼
        Capability Interoperability
```

MCP is valuable not because it makes an application "more agentic," but because it gives independently implemented components a **standardized communication and capability boundary**.

The engineering question is therefore not:

> "Should we use MCP because it is the standard?"

It is:

> **"Does standardized capability interoperability solve a real problem that justifies the additional protocol and operational complexity?"**
