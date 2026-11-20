# Agent-to-Agent Interoperability and A2A

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain why independent agent systems need interoperability.
- Distinguish agent-to-agent interoperability from capability/tool interoperability.
- Explain the difference between agent interoperability and multi-agent architecture.
- Explain the role of an Agent Card in agent discovery.
- Understand agent identity, capabilities, skills, and supported interfaces.
- Explain structured agent communication.
- Distinguish Messages, Parts, Tasks, and Artifacts.
- Explain when an interaction produces an immediate Message versus a stateful Task.
- Understand the A2A task lifecycle and task-state semantics.
- Explain context exchange and the role of `contextId`.
- Distinguish protocol-level context from internal agent runtime context and memory.
- Understand synchronous and asynchronous interaction.
- Explain streaming and push-oriented task updates.
- Distinguish A2A interaction semantics from protocol bindings and transports.
- Understand authentication, authorization, trust, and capability boundaries.
- Explain protocol compatibility, versioning, schema evolution, capability evolution, and deprecation.
- Diagnose common A2A interoperability failures.
- Distinguish A2A task state from durable execution.
- Evaluate when A2A is appropriate and when a direct API is preferable.
- Explain how A2A fits within MCP, AGT-08, and AGT-09.

---

## Prerequisites

Before studying this chapter, you should understand:

- interfaces and interface contracts
- interoperability
- capability discovery
- structured communication
- request/response semantics
- identity and authorization boundaries
- protocol selection
- compatibility and versioning
- protocol evolution
- interoperability failure modes

These concepts were established in:

[01 — Agent Capability Interfaces and Interoperability](./01-Agent-Capability-Interfaces-and-Interoperability.md)

You should also understand the capability-interoperability perspective developed in:

[02 — Model Context Protocol (MCP) and Tool Interoperability](./02-Model-Context-Protocol-MCP-and-Tool-Interoperability.md)

You do **not** need prior knowledge of:

- LangChain
- LangGraph
- LlamaIndex
- AutoGen
- CrewAI
- OpenAI Agents SDK
- Google ADK
- a specific agent framework
- a specific cloud provider

This chapter is intentionally framework-independent.

---

## Estimated Reading Time

Approximately **75–105 minutes**, including the practical implementation example, architecture exercise, and interview questions.

---

## Before We Start

Lesson 01 established the general problem of interoperability.

Lesson 02 applied those principles to:

```text
AI Application / Agent
          │
          ▼
External Capability
```

This chapter addresses a different boundary:

```text
Independent Agent System A
          │
          │
          ▼
Independent Agent System B
```

The central question is:

> **How can independently implemented agent systems communicate, discover each other's capabilities, exchange context, manage work, and communicate results without requiring access to each other's internal implementation?**

That distinction is the foundation of this chapter.

---

## Protocol Version Note

A2A is an evolving protocol.

This chapter teaches the **durable agent-interoperability model** while using the current released A2A specification as the concrete protocol reference.

Protocol-specific details such as:

- field names
- task states
- bindings
- interface definitions
- discovery behavior
- extensions

may evolve across protocol revisions.

Therefore, when implementing A2A in production, always verify the applicable specification version and implementation support.

---

# 1. The Agent-to-Agent Interoperability Problem

## 1.1 Independent Agent Systems

Consider two independently developed systems:

```text
┌──────────────────────────┐
│ Agent System A           │
│                          │
│ - Framework A            │
│ - Runtime A              │
│ - Tools A                │
│ - Memory A               │
│ - Internal state A       │
└────────────┬─────────────┘
             │
             │
             ▼
┌──────────────────────────┐
│ Agent System B           │
│                          │
│ - Framework B            │
│ - Runtime B              │
│ - Tools B                │
│ - Memory B               │
│ - Internal state B       │
└──────────────────────────┘
```

These systems may have been developed:

- by different teams
- using different programming languages
- using different frameworks
- by different vendors
- in different organizations
- with different internal architectures

Yet one system may need to request work from the other.

---

## 1.2 The Integration Problem

Without a common interoperability model, Agent A might need to understand:

- Agent B's internal API
- Agent B's data model
- Agent B's state model
- Agent B's execution model
- Agent B's framework
- Agent B's authentication mechanism
- Agent B's request format

This creates tight coupling.

```text
Agent A
   │
   ├── knows Agent B's API
   ├── knows Agent B's data model
   ├── knows Agent B's execution model
   └── knows Agent B's internal assumptions
```

That defeats an important goal of agent interoperability:

> **An agent should be able to interact with another agent through a stable external contract without needing to understand its internal implementation.**

---

# 2. What Agent-to-Agent Interoperability Means

Agent-to-agent interoperability means that one independent agent system can communicate with another through a defined interface and protocol.

Conceptually:

```text
┌──────────────────────┐
│ Agent System A       │
│                      │
│ Internal architecture│
└──────────┬───────────┘
           │
           │ Interoperability Boundary
           │
           ▼
┌──────────────────────┐
│ Agent System B       │
│                      │
│ Internal architecture│
└──────────────────────┘
```

The boundary hides internal implementation details.

Agent A does not need to know:

```text
How Agent B reasons
How Agent B plans
How Agent B stores memory
How Agent B invokes tools
How Agent B implements its runtime
```

It needs to know:

```text
What Agent B can do
How to communicate
How to authenticate
How to structure requests
How to interpret responses
How to track work
How to handle failure
```

This is the core interoperability abstraction.

---

# 3. Agent Interoperability vs Capability Interoperability

This distinction is mandatory in AGT-08.

## Capability Interoperability

The interaction is:

```text
AI Application / Agent
          │
          ▼
External Capability
```

Examples include:

- database capability
- search capability
- ticketing capability
- file capability
- business API

MCP is positioned primarily here.

---

## Agent-to-Agent Interoperability

The interaction is:

```text
Agent System A
       │
       ▼
Agent System B
```

Agent B is itself an agentic system.

It may:

- reason
- plan
- use tools
- maintain state
- perform multiple steps
- request clarification
- produce intermediate status
- produce artifacts

A2A is positioned here.

---

## The Conceptual Boundary

```text
Interoperability
       │
       ├── Capability / Tool Interoperability
       │          │
       │          └── MCP
       │
       └── Agent-to-Agent Interoperability
                  │
                  └── A2A
```

Do not collapse these into one category.

---

# 4. A2A Is Not Multi-Agent Architecture

This is one of the most important boundaries in the chapter.

Consider:

```text
Independent System A
        │
        │ A2A
        ▼
Independent System B
```

This does **not automatically mean**:

```text
One Multi-Agent System
```

The two systems may belong to:

- different companies
- different products
- different organizational boundaries
- different trust domains
- different deployment environments

They can still communicate through an interoperability protocol.

Therefore:

> **A2A describes an interoperability mechanism; it does not decide the architecture of the overall system.**

AGT-09 owns the architectural question:

> When should a system use multiple agents, and how should those agents be architected?

AGT-08 owns:

> How can independent agent systems communicate interoperably?

---

# 5. What A2A Provides

A2A provides a protocol model for communication and interoperability between independent, potentially opaque agent systems.

The protocol provides concepts for:

- agent discovery
- capability and skill description
- structured messages
- task-oriented interaction
- context association
- task status
- artifact exchange
- asynchronous interaction
- authentication and authorization requirements

The important engineering idea is:

```text
Agent A
   │
   │ protocol
   ▼
Agent B
```

without requiring:

```text
Agent A
   │
   ├── access Agent B's memory
   ├── access Agent B's tools
   ├── access Agent B's internal state
   └── understand Agent B's internal runtime
```

A2A instead provides an external communication contract.

---

# 6. Mental Model

Use this mental model:

```text
┌────────────────────────────────────────────┐
│       Agent Interoperability Boundary      │
│                                            │
│  Discovery                                 │
│  Identity                                  │
│  Capability / Skill Metadata               │
│  Interface Selection                       │
│  Communication                             │
│  Task Semantics                            │
│  Context Association                       │
│  Status / Progress                         │
│  Artifact Exchange                         │
│  Authentication / Authorization            │
│  Compatibility / Evolution                 │
│                                            │
└────────────────────────────────────────────┘
```

The boundary answers:

> **How can Agent A interact with Agent B without knowing how Agent B is internally implemented?**

---

# 7. Agent-to-Agent Interface

An agent-to-agent interface needs more than a simple function signature.

A useful conceptual contract contains:

```text
Agent Identity
      ↓
Capabilities / Skills
      ↓
Supported Interface
      ↓
Interaction Contract
      ↓
Message Semantics
      ↓
Task Semantics
      ↓
Context Semantics
      ↓
Response / Status Semantics
      ↓
Security Boundary
      ↓
Compatibility Policy
```

This is broader than a traditional API endpoint because an agent may:

- perform work asynchronously
- maintain task state
- request additional input
- produce intermediate status
- produce one or more artifacts

---

# 8. Agent Discovery

Before Agent A can interact with Agent B, it may need to discover:

- that Agent B exists
- what Agent B can do
- which skills it supports
- where it can be reached
- which interfaces it supports
- how it should be authenticated
- which interaction features it supports

This is the discovery problem.

```text
Agent A
   │
   │ "What agents are available?"
   ▼
Discovery Mechanism
   │
   ▼
Agent Card
```

The important distinction is:

```text
Discovery
→ How do I find the agent metadata?

Agent Card
→ What does the agent advertise?
```

---

# 9. The Agent Card

A2A uses an **Agent Card** as machine-readable metadata describing an agent.

Conceptually:

```text
Agent Card
├── Identity
├── Endpoint / Interface Information
├── Capabilities
├── Skills
├── Authentication Requirements
└── Additional Interaction Metadata
```

An Agent Card can provide information needed for a client to decide whether and how to interact with the agent.

The exact fields are protocol-version dependent.

---

## 9.1 Agent Card and Interface Selection

Discovery should not stop at:

> "I found an agent."

The client should inspect whether the agent supports an interaction compatible with its own requirements.

Conceptually:

```text
Discover Agent Card
        ↓
Inspect Identity
        ↓
Inspect Skills
        ↓
Inspect Capabilities
        ↓
Inspect Supported Interfaces
        ↓
Select Compatible Interface
        ↓
Inspect Authentication Requirements
        ↓
Interact
```

This makes the Agent Card part of the interoperability negotiation process rather than merely a directory entry.

---

# 10. Discovery Mechanisms

Agent discovery does not require one universal deployment mechanism.

Possible approaches include:

```text
Well-known location
        │
        ▼
Agent Card

Registry / Catalog
        │
        ▼
Agent Card

Direct configuration
        │
        ▼
Agent Card
```

The protocol defines the metadata model; deployment environments may choose different discovery strategies.

The durable distinction is:

```text
Discovery
→ How do I find an agent?

Agent Card
→ What does the agent advertise?

Interface Selection
→ How should I communicate with it?
```

---

# 11. Discovery Is Not Trust

Finding an Agent Card does not automatically mean:

> "This agent is trusted."

Discovery answers:

```text
What agent is available?
What does it claim to support?
How can I contact it?
```

Security decisions answer:

```text
Who is this?
Can I authenticate it?
Am I authorized?
Should I rely on it?
```

Therefore:

```text
Discovery
    ↓
Identity
    ↓
Authentication
    ↓
Authorization
    ↓
Interaction
```

These concerns should remain separate.

---

# 12. Agent Identity

Agent identity becomes particularly important when many independent agents exist.

Consider:

```text
Agent A
   │
   ├── Finance Agent
   ├── HR Agent
   ├── Legal Agent
   └── Customer Support Agent
```

The client needs to distinguish between them.

Identity may include:

- agent identifier
- organization or service identity
- endpoint/interface identity
- authentication requirements
- capability metadata

The exact identity mechanism is protocol and deployment dependent.

The durable principle is:

> **An interoperable agent must be identifiable across the communication boundary.**

---

# 13. Capability Discovery vs Agent Discovery

These concepts are related but different.

### Agent Discovery

Answers:

> Which agent systems are available?

```text
Agent A
   ↓
Find Agent B
```

### Capability / Skill Discovery

Answers:

> What can Agent B do?

```text
Agent B
   │
   ├── Skill A
   ├── Skill B
   └── Skill C
```

The distinction becomes important in larger ecosystems.

```text
Discover Agent
      ↓
Inspect Capabilities / Skills
      ↓
Select Suitable Interface
      ↓
Establish Interaction
```

---

# 14. Structured Agent Communication

Once an agent has been discovered, communication requires structured semantics.

A simplified interaction looks like:

```text
Agent A
   │
   │ request / message
   ▼
Agent B
   │
   │ response / status / artifact
   ▼
Agent A
```

The important question is not merely:

> "Can the agents exchange JSON?"

The important question is:

> **Do both agents understand what the messages mean?**

Therefore:

```text
Message Syntax
       ↓
Message Semantics
       ↓
Interaction Semantics
```

---

# 15. A2A Messages

A2A defines **Messages** as communication units between participants.

Messages can support interactions such as:

- initiating work
- providing information
- requesting clarification
- providing additional input
- continuing an ongoing interaction

A Message should not automatically be treated as a Task.

This distinction is important because an agent may be able to respond immediately without creating stateful work.

---

## 16. Parts

Messages and artifacts can contain **Parts**.

A Part is a content unit that can represent different modalities such as:

- text
- files
- structured data

Conceptually:

```text
Message
   │
   ├── Part
   │     └── Text
   │
   ├── Part
   │     └── File
   │
   └── Part
         └── Structured Data
```

This allows an agent interaction to carry richer content than plain text.

The important engineering idea is:

> **The protocol separates the communication container from the content carried inside it.**

---

# 17. Message vs Task

This is a critical A2A concept.

Not every interaction creates a Task.

Conceptually:

```text
                 Incoming Message
                        │
              ┌─────────┴─────────┐
              │                   │
              ▼                   ▼
      Immediate Interaction   Stateful Work
              │                   │
              ▼                   ▼
           Message              Task
```

### Immediate interaction

The remote agent can answer directly.

```text
Message
   ↓
Message Response
```

### Stateful interaction

The remote agent needs to create and manage work that persists beyond the immediate exchange.

```text
Message
   ↓
Task
   ↓
Status / Input / Artifact
   ↓
Terminal State
```

This distinction prevents the incorrect mental model:

```text
Every A2A Message
        ↓
Task
```

The protocol supports both stateless/immediate responses and stateful task interactions.

---

# 18. Tasks

A2A defines a **Task** as a stateful unit of work.

Tasks are useful when an interaction:

- takes time
- requires multiple interactions
- needs status
- requires additional input
- produces artifacts
- can be canceled
- can fail independently of the original request

Conceptually:

```text
Request
   ↓
Task
   ↓
Working
   ↓
Additional Interaction
   ↓
Artifact
   ↓
Terminal State
```

The task is therefore a protocol-level representation of work across an agent boundary.

---

# 19. Why Tasks Matter

Traditional APIs often look like:

```text
Request
   ↓
Response
```

Agent interactions may instead look like:

```text
Request
   ↓
Task Created
   ↓
Working
   ↓
Status Update
   ↓
Additional Input
   ↓
Working
   ↓
Artifact
   ↓
Completed
```

This makes task semantics important for agent interoperability.

However:

> **An A2A Task describes and communicates the state of work across the interoperability boundary. It is not itself a durable workflow execution engine.**

AGT-06 owns the deeper engineering of:

- durable execution
- checkpoints
- pause/resume
- recovery
- compensation
- execution continuity

A2A may communicate the state of a task whose underlying execution uses those mechanisms, but the protocol does not replace them.

---

# 20. Task Lifecycle

The exact lifecycle is protocol-version dependent.

The current A2A task model includes states representing phases such as:

```text
submitted
    ↓
working
```

with possible transitions or interruptions such as:

```text
working
   ├── input-required
   ├── auth-required
   ├── completed
   ├── canceled
   ├── rejected
   └── failed
```

A conceptual lifecycle is:

```text
                 ┌──────────────┐
                 │  submitted   │
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │   working    │
                 └──────┬───────┘
                        │
          ┌─────────────┼──────────────┐
          │             │              │
          ▼             ▼              ▼
 input-required   auth-required      failed
          │             │
          │             │
          └──────┬──────┘
                 │
                 ▼
              working
                 │
        ┌────────┼─────────┐
        ▼        ▼         ▼
   completed  canceled  rejected
```

The **durable concept** is:

> A task has observable lifecycle state.

The exact state names and transitions belong to the applicable protocol revision.

---

# 21. Status

Task status answers questions such as:

```text
Is the agent still working?
Did the task fail?
Does the agent need more information?
Does the agent need additional authorization?
Is the task complete?
```

A useful distinction is:

```text
Message
→ communication content

Task Status
→ state of the work

Artifact
→ produced output
```

These should not be collapsed into one generic response object.

---

# 22. Artifacts

An **Artifact** is a tangible output produced during a task.

Examples include:

- document
- image
- structured dataset
- report
- generated file
- other task output

Conceptually:

```text
Task
  │
  ├── Messages
  │
  ├── Status
  │
  └── Artifacts
          │
          ├── Part
          ├── Part
          └── Part
```

A2A distinguishes artifacts from messages so that the actual deliverable can be represented separately from conversational communication.

---

# 23. Message vs Artifact

Suppose Agent A asks:

> "Generate a quarterly sales report."

Agent B may communicate:

```text
Message:
"Report generation is complete."
```

and separately provide:

```text
Artifact:
quarterly-sales-report.pdf
```

Therefore:

```text
Message
→ communication

Artifact
→ output
```

This separation is useful because communication and deliverables have different lifecycle requirements.

---

# 24. Context Exchange

Independent agents may need context to continue an interaction.

For example:

```text
Agent A
   │
   │ Task 123
   ▼
Agent B
```

Later:

```text
Agent A
   │
   │ Additional information
   │ associated with the same context
   ▼
Agent B
```

A2A uses `contextId` to logically associate related Messages and Tasks.

Conceptually:

```text
contextId
    │
    ├── Task 1
    ├── Task 2
    └── Related Messages
```

The exact generation, propagation, and lifecycle rules are protocol-version dependent.

---

# 25. `contextId` vs Internal Agent Context

`contextId` is a protocol-level concept.

It can be used to group related interactions, and the receiving agent may use that association when managing its own conversational or task context.

However, the caller does **not** automatically receive the remote agent's internal context.

Therefore:

```text
A2A contextId
    │
    ├── groups related protocol interactions
    │
    └── may help the remote agent manage its context
```

but:

```text
A2A contextId
        ≠
Remote Agent's Complete Internal Context
```

The remote agent may internally maintain:

- conversation state
- working state
- memory
- planning state
- execution state

without exposing those implementation details.

This creates an important AGT-04 boundary:

```text
A2A
→ protocol-level context exchange and correlation

AGT-04
→ internal agent context, state, memory, and lifecycle management
```

---

# 26. Synchronous Interaction

Not every agent interaction needs asynchronous execution.

A simple interaction may be:

```text
Agent A
   │
   │ request
   ▼
Agent B
   │
   │ immediate response
   ▼
Agent A
```

In protocol terms, an interaction may result directly in a Message when stateful task management is unnecessary.

This is appropriate when:

- work is short
- result is immediately available
- no long-running task state is necessary

The simplest interaction mechanism should be preferred when sufficient.

---

# 27. Asynchronous Interaction

Long-running agent work may require asynchronous interaction.

Conceptually:

```text
Agent A
   │
   │ Start work
   ▼
Agent B
   │
   │ Task accepted
   ▼
Agent A
   │
   │ Continue other work
   │
   │ Later obtain updates
   ▼
Agent B
```

The task continues independently of the original exchange.

This is useful for:

- long-running analysis
- document generation
- research tasks
- external workflows
- operations requiring additional dependencies

A2A supports asynchronous interaction through task retrieval, streaming, and push-oriented mechanisms, depending on the applicable protocol version and supported interfaces.

---

# 28. Streaming

Streaming allows a client to receive incremental information while a task is progressing.

Conceptually:

```text
Agent A
   │
   │ Start task
   ▼
Agent B
   │
   ├── status update
   ├── progress
   ├── artifact update
   └── completion
```

Streaming is useful when waiting for a final result would create poor user or system behavior.

However:

> **Streaming is an event-delivery mechanism; it is not the authoritative state of the task.**

A production system should distinguish:

```text
Streaming
→ receive updates continuously

Task State
→ authoritative state of the work

Task Retrieval
→ obtain current state when continuous streaming
  is unavailable
```

If the stream disconnects, the client should not assume that the task disappeared.

The task state and supported retrieval/update mechanisms determine how the client reconstructs the current state.

---

# 29. Push Notifications

For long-running or disconnected scenarios, an agent may need to notify a client asynchronously.

Conceptually:

```text
Agent A
   │
   │ Start Task
   ▼
Agent B
   │
   │
   │ ... long-running work ...
   │
   ▼
Push Notification
   │
   ▼
Agent A
```

This can be useful when:

- the client is not continuously connected
- the task takes significant time
- continuous streaming is impractical
- updates need to be delivered asynchronously

The exact push mechanism and security requirements depend on the applicable A2A version and interface.

The important distinction is:

```text
Task State
→ authoritative protocol state

Push Notification
→ asynchronous indication that an update is available
```

A notification is not itself the complete task state.

---

# 30. A2A Protocol Semantics, Binding, and Transport

A common mistake is to treat A2A as synonymous with one HTTP endpoint format.

Instead, separate three layers:

```text
┌──────────────────────────────┐
│     A2A Interaction Model    │
│                              │
│ Agent discovery              │
│ Messages                     │
│ Tasks                        │
│ Context                      │
│ Status                       │
│ Artifacts                    │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│      Protocol Binding        │
│                              │
│ How A2A semantics are mapped │
│ onto a communication model   │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│          Transport           │
│                              │
│ Network communication        │
│ Streaming / callbacks        │
└──────────────────────────────┘
```

For the current protocol model, A2A commonly uses HTTP(S)-based interfaces and JSON-RPC 2.0 for protocol operations, with streaming and asynchronous mechanisms defined for supported interaction patterns.

The durable engineering principle is:

> **A2A defines agent-interoperability semantics; bindings and transports determine how those semantics are carried between participants.**

Therefore:

```text
A2A
≠
HTTP API

A2A Semantics
≠
Transport
```

This distinction matters when protocol versions, interfaces, or bindings evolve.

---

# 31. Protocol vs Agent Architecture

A2A defines how agents communicate.

It does not define:

```text
How agents reason
How agents plan
How agents remember
How agents select tools
How agents are orchestrated internally
How many agents an architecture should contain
```

A2A therefore sits below the architecture decision.

```text
Architecture Decision
        │
        ▼
Should independent agents communicate?
        │
        ▼
Interoperability Requirement
        │
        ▼
Protocol Selection
        │
        ▼
A2A
```

This distinction prevents AGT-08 from becoming AGT-09.

---

# 32. Delegation at the Protocol Boundary

An agent may ask another agent to perform work.

Conceptually:

```text
Agent A
   │
   │ "Perform task X"
   ▼
Agent B
   │
   │ task execution
   ▼
Result
```

This is delegation-related communication.

However, AGT-08 should focus on:

```text
How the delegation request is communicated
How identity is established
How context is exchanged
How task state is represented
How results are returned
```

It should not teach:

```text
How to architect a supervisor agent
How to partition agents
How to design agent hierarchies
How to coordinate many agents
```

Those belong to AGT-09.

---

# 33. Trust Boundaries

Agent-to-agent communication introduces an explicit trust boundary.

```text
┌──────────────────────┐
│ Agent System A       │
│                      │
│ Trust Domain A       │
└──────────┬───────────┘
           │
           │ Trust Boundary
           │
           ▼
┌──────────────────────┐
│ Agent System B       │
│                      │
│ Trust Domain B       │
└──────────────────────┘
```

Do not assume:

> "Because both systems are agents, they are trusted."

They may be:

- separately owned
- separately deployed
- differently secured
- operating under different policies

The protocol therefore needs explicit security boundaries.

---

# 34. Authentication

Authentication answers:

> **Who is communicating?**

Conceptually:

```text
Agent A
   │
   ▼
Identity Verification
   │
   ▼
Agent B
```

The exact authentication mechanism depends on the deployment environment and applicable protocol interface/binding.

A key principle is:

> **Authentication material should be handled by the security mechanism rather than treated as ordinary task content.**

Therefore:

```text
Task Message
      ≠
Authentication Credential
```

---

# 35. Authorization

Authentication does not automatically mean permission.

Agent B may determine:

```text
Agent A
   │
   ├── Skill X → allowed
   ├── Skill Y → allowed
   └── Skill Z → denied
```

Authorization can depend on:

- authenticated principal
- requested skill
- requested operation
- data access policy
- scopes
- tenant
- organizational policy

The principle of least privilege should apply.

---

# 36. Agent Capability Exposure

An agent may expose capabilities such as:

```text
Research Agent
    │
    ├── research_topic
    ├── summarize_sources
    └── generate_report
```

But exposure should be deliberate.

The agent should not necessarily expose:

```text
Internal database credentials
Private memory
Internal tools
Administrative interfaces
Private reasoning state
```

The interoperability boundary should expose **capabilities**, not implementation internals.

---

# 37. A2A Does Not Require Internal State Exposure

One of the strongest architectural properties of agent interoperability is opacity.

Agent A can interact with Agent B without requiring:

```text
Agent B's:
- memory implementation
- tool implementation
- planning algorithm
- model provider
- internal state representation
- internal orchestration
```

Instead:

```text
Agent A
     │
     ▼
External Agent Contract
     │
     ▼
Agent B
```

However, the protocol can expose **protocol-defined state**, such as task status.

Therefore:

```text
Protocol Task State
        ≠
Internal Agent Runtime State
```

This distinction is essential.

---

# 38. Compatibility

A2A interoperability depends on more than network connectivity.

At least four dimensions matter:

```text
Transport Compatibility
        ↓
Protocol Compatibility
        ↓
Schema Compatibility
        ↓
Semantic Compatibility
```

Two agents may both support HTTP and JSON yet still disagree about:

```text
What a task means
What a skill does
What a field represents
What a status means
What a result contains
```

Therefore:

> **Successful communication does not guarantee successful interoperability.**

---

# 39. Protocol Versioning

A2A is an evolving protocol.

A client therefore needs to understand:

```text
Which protocol version applies?
Which interfaces are supported?
Which features are available?
Which capabilities are compatible?
Which extensions are supported?
```

A useful model is:

```text
Agent Card
      │
      ▼
Supported Interfaces
      │
      ▼
Compatible Interface
      │
      ▼
Protocol Interaction
```

Version handling should be explicit rather than assumed.

For production implementation, always verify the applicable A2A specification version and implementation support rather than relying on an older tutorial or SDK example.

---

# 40. Schema Evolution

Suppose an agent initially returns:

```json
{
  "customer_id": "123"
}
```

and later returns:

```json
{
  "customer_id": "123",
  "region": "IN"
}
```

An additive change may be compatible if consumers tolerate unknown fields.

But changing:

```text
customer_id
```

from:

```text
internal identifier
```

to:

```text
external identifier
```

can create a semantic compatibility failure even though the schema still validates.

Therefore:

```text
Schema Evolution
        ≠
Semantic Evolution
```

Both must be managed.

---

# 41. Capability Evolution

An agent may change what it can do.

For example:

```text
Version 1
    ├── research
    └── summarize

Version 2
    ├── research
    ├── summarize
    └── generate_report
```

Adding a capability may be safe.

Removing a capability can break consumers.

Changing the behavior of an existing capability can be even more dangerous because the interaction may continue to succeed while producing different results.

---

# 42. Deprecation

A capability or protocol feature may eventually need to be retired.

A production lifecycle should look like:

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

Consumers need to know:

- what changed
- when it changes
- what replaces it
- how long the old behavior remains supported

Standardization does not remove lifecycle management.

---

# 43. Canonical A2A Interaction

A useful current mental model combines the major protocol objects:

```text
                Agent Card
                    │
                    ▼
             Discover / Inspect
                    │
                    ▼
          Select Compatible Interface
                    │
                    ▼
               Authenticate
                    │
                    ▼
              Send Message
                    │
             ┌──────┴──────┐
             │             │
             ▼             ▼
       Immediate        Stateful
       Response         Response
             │             │
             ▼             ▼
          Message         Task
                            │
                 ┌──────────┼──────────┐
                 │          │          │
                 ▼          ▼          ▼
              Status     Input      Artifact
                 │          │          │
                 └──────┬───┴──────────┘
                        │
                        ▼
                  More Message
                        │
                        ▼
                 Terminal State
```

This captures a critical principle:

> **A2A is not simply request → response. It supports both immediate communication and stateful task-oriented interaction.**

---

# 44. Framework-Independent Practical Implementation

The following pseudocode demonstrates the engineering sequence without depending on a specific A2A SDK.

> **Important:** The examples in this section are conceptual pseudocode. They illustrate the interoperability sequence rather than reproducing an exact version-specific A2A wire payload.

## 44.1 Discover an Agent

```text
agent_card = discover_agent(agent_identifier)

if agent_card is unavailable:
    fail("Agent unavailable")
```

---

## 44.2 Inspect Capabilities and Interfaces

```text
if "research" not in agent_card.skills:
    fail("Required skill unavailable")

interface = select_compatible_interface(
    agent_card.interfaces,
    client_supported_interfaces
)

if interface is unavailable:
    fail("No compatible interface")
```

The client should verify that the advertised skill and selected interface satisfy the required semantic contract.

---

## 44.3 Validate Interaction Requirements

```text
validate_endpoint(interface.endpoint)

validate_authentication_requirements(
    agent_card.authentication
)

validate_supported_features(
    agent_card.capabilities
)
```

---

## 44.4 Authenticate

```text
credentials = obtain_credentials()

principal = authenticate(
    agent_card,
    credentials
)
```

The exact mechanism depends on the deployment environment and applicable protocol interface.

---

## 44.5 Authorize

```text
if not authorized(
    principal,
    skill="research"
):
    fail("Research skill not authorized")
```

---

## 44.6 Send Message

```text
message = {
    "intent": "research",
    "content": [
        {
            "type": "text",
            "value": "Research the market for EV charging."
        }
    ]
}

response = send_message(
    interface,
    message
)
```

The exact representation is protocol-version and interface dependent.

---

## 44.7 Handle Immediate Message Response

```text
if response.kind == "message":

    validate_message(response)

    application.process_message(
        response
    )
```

This represents a stateless/immediate interaction.

---

## 44.8 Handle Stateful Task Response

```text
if response.kind == "task":

    task = validate_task(response)

    track_task(task)
```

This represents work that continues beyond the immediate message exchange.

---

## 44.9 Track Task

```text
while not task.is_terminal:

    status = get_task_status(
        task.id
    )

    if status.requires_input:

        additional_input = collect_input()

        send_additional_input(
            task.id,
            additional_input
        )

    elif status.requires_auth:

        additional_credentials = obtain_credentials()

        continue_authorized_interaction(
            task.id,
            additional_credentials
        )

    elif status.failed:

        fail("Remote task failed")
```

The exact state and transition behavior depends on the applicable protocol version.

---

## 44.10 Consume Artifacts

```text
for artifact in task.artifacts:

    validate_artifact(artifact)

    application.consume(
        artifact
    )
```

The application should validate outputs before relying on them.

---

# 45. A2A Failure Modes

Agent-to-agent interoperability introduces several failure classes.

---

## 45.1 Agent Discovery Failure

```text
Client
   │
   X
Agent Card unavailable
```

Possible causes:

- discovery service unavailable
- invalid endpoint
- DNS/network failure
- agent removed
- registry stale

---

## 45.2 Agent Capability Mismatch

The client discovers Agent B but Agent B does not provide the required skill.

```text
Required:
research

Available:
summarize
translate
```

This is a capability mismatch.

---

## 45.3 Interface / Protocol Mismatch

The Agent Card may advertise interfaces that the client cannot use.

```text
Client
Supported Interface A

Agent
Supports Interface B
```

The result may be:

```text
No compatible interface
```

This is different from a task execution failure.

---

## 45.4 Authentication Failure

The client cannot establish the required identity.

---

## 45.5 Authorization Failure

The client is authenticated but cannot invoke the requested skill.

---

## 45.6 Protocol Version Mismatch

```text
Client
Version X
     │
     ▼
Agent
Version Y
```

If the versions or supported features are incompatible, interaction may fail before the task begins.

---

## 45.7 Schema Mismatch

The request structure does not conform to the expected contract.

Example:

```text
Expected:
topic: string

Received:
topic: object
```

---

## 45.8 Semantic Mismatch

Both systems accept the message but interpret it differently.

For example:

```text
"priority": "high"
```

may mean:

```text
Immediate execution
```

to one system and:

```text
Execute within 24 hours
```

to another.

This is more dangerous than a syntax error because the interaction may appear successful.

---

## 45.9 Context Mismatch

Agent A believes:

```text
contextId = 123
```

means:

```text
Customer onboarding
```

while Agent B associates the same interaction context with:

```text
Customer support
```

The protocol may be functioning while the application semantics are incorrect.

---

## 45.10 Task Failure

The remote agent accepts the request but cannot complete the work.

Possible causes:

- internal dependency failure
- unavailable tool
- invalid external data
- model failure
- business rule rejection

The protocol may have worked correctly even though the task failed.

---

## 45.11 Partial Interaction

An agent may:

```text
accept task
    ↓
produce some progress
    ↓
fail before completion
```

The client therefore needs to distinguish:

```text
Task accepted
Task working
Task input-required
Task auth-required
Task failed
Task completed
```

rather than treating every non-final response as success.

---

## 45.12 Timeout

A task may take longer than expected.

Diagnosis should distinguish:

```text
Network timeout
      vs
Protocol timeout
      vs
Remote task still running
      vs
Remote task failed
```

This distinction is critical for long-running agent interactions.

---

## 45.13 Stale Agent Card

The client may have cached metadata describing:

```text
Skill X available
```

while the remote agent has removed or changed that skill.

Therefore:

```text
Cached Metadata
      ↓
Potentially stale
      ↓
Refresh / Revalidate
```

---

# 46. Diagnosing Agent Interoperability Failures

Use a layered diagnosis model:

```text
1. Discovery
      ↓
2. Agent Card / Interface
      ↓
3. Identity
      ↓
4. Authentication
      ↓
5. Authorization
      ↓
6. Protocol Version / Binding
      ↓
7. Schema
      ↓
8. Semantic Contract
      ↓
9. Message / Task Acceptance
      ↓
10. Task Execution
      ↓
11. Result / Artifact
```

This prevents engineers from immediately blaming the protocol.

For example:

```text
Task failed
```

does not tell us whether:

```text
Protocol failed
```

or:

```text
Remote agent failed
```

or:

```text
Underlying capability failed
```

The layers must be separated.

---

# 47. A2A vs Direct API

A2A is not automatically better than a direct API.

Consider:

```text
Agent A
   │
   ▼
Single Internal Service
```

If the interaction is:

- simple
- synchronous
- tightly controlled
- owned by one team
- strongly typed
- stable

then a direct API may be preferable.

For example:

```text
POST /calculate-risk
```

may be simpler than introducing an agent interoperability protocol.

---

# 48. When A2A Is Appropriate

A2A-style interoperability becomes more attractive when:

### Agents are independently developed

```text
Team A → Agent A
Team B → Agent B
```

### Agents use different technologies

```text
Python
Java
TypeScript
Different frameworks
Different vendors
```

### Agent discovery matters

Clients need to determine which remote agents and skills are available.

### Interactions are task-oriented

The remote participant performs work rather than returning a simple static value.

### Work may be long-running

Tasks may continue after the initial request.

### Context needs to persist across interactions

The client needs to continue an existing interaction.

### Multiple organizations need interoperability

A common protocol can reduce custom integration work.

---

# 49. When A2A May Be Unnecessary

A2A may be unnecessary when:

```text
One application
      │
      ▼
One internal service
```

and:

- the service is not independently agentic
- the interface is simple
- discovery is unnecessary
- task lifecycle is unnecessary
- direct request/response is sufficient
- both systems are tightly controlled

In such cases:

```text
Direct API
```

may be the better engineering choice.

---

# 50. A2A vs Direct API

| Concern | Direct API | A2A |
|---|---|---|
| Simple request/response | Excellent | May be unnecessary |
| Independent agents | Limited unless custom-designed | Core use case |
| Agent discovery | Usually custom | Agent Card model |
| Task lifecycle | Usually custom | First-class task model |
| Long-running work | Requires custom design | Supported conceptually |
| Agent capability metadata | Application-specific | Standardized model |
| Implementation complexity | Often lower | Higher |
| Cross-vendor agent interoperability | Limited | Core motivation |
| Best fit | Controlled service integration | Independent agent interoperability |

The decision should be based on the actual integration problem.

---

## 51. A2A vs MCP

This is one of the most important comparisons in AGT-08.

| Concern | MCP | A2A |
|---|---|---|
| Primary boundary | AI application ↔ capability | Agent ↔ agent |
| Main purpose | Capability interoperability | Agent interoperability |
| Typical remote participant | Tool/resource/prompt provider | Independent agent system |
| Discovery | Capability discovery | Agent discovery |
| Core interaction | Capability access | Message/task interaction |
| Task lifecycle | Not the primary abstraction | Central abstraction |
| Artifacts | Not the primary conceptual focus | First-class task output concept |
| Multi-agent architecture | Does not imply it | Does not imply it |
| Main AGT-08 location | Capability interoperability | Agent-to-agent interoperability |

The conceptual relationship is:

```text
AI Application
      │
      ├──────────── MCP ────────────► Capability
      │
      │
      └──────────── A2A ────────────► Agent System
```

This is the most important mental model to retain.

---

# 52. A2A and MCP Can Coexist

A system may use both protocols.

For example:

```text
┌───────────────────────┐
│ Agent A               │
│                       │
│ MCP Client            │
│ A2A Client            │
└───────┬───────┬───────┘
        │       │
        │       │
       MCP     A2A
        │       │
        ▼       ▼
   Capability  Agent B
```

Agent A may:

- use MCP to access tools
- use A2A to communicate with another agent

These protocols solve different interoperability problems.

They are complementary rather than competing definitions of the same boundary.

---

# 53. Production Considerations

## 53.1 Ownership

Every interoperable agent should have a clear owner.

```text
Agent:
Owner:
Supported Protocol:
Supported Interfaces:
Supported Versions:
Capabilities:
Authentication:
Authorization:
SLO:
Deprecation Policy:
Compatibility Policy:
Escalation:
```

Ownership matters because interoperability creates dependencies between independently operated systems.

---

## 53.2 Availability

Agent A may depend on Agent B.

Therefore:

```text
Agent A Availability
        ↓
Agent B Availability
```

may become a dependency.

Production systems should understand:

- availability expectations
- timeout behavior
- dependency boundaries
- degradation behavior
- operational ownership

Detailed infrastructure and SLO engineering belong to PROD, but AGT-08 should recognize the dependency created by interoperability.

---

## 53.3 Version Management

Production consumers should know:

```text
Which A2A version?
Which interface?
Which capabilities?
Which skills?
Which extensions?
Which authentication requirements?
```

Compatibility should be tested before rollout.

---

## 53.4 Capability Lifecycle

Capabilities can:

```text
appear
change
deprecate
disappear
```

Consumers must not assume permanent availability.

---

## 53.5 Security

Production A2A deployments should explicitly define:

```text
Identity
Authentication
Authorization
Trust
Data boundaries
Credential handling
```

Protocol-level security does not replace enterprise governance or agent safety.

---

# 54. Security Boundary Summary

Keep these concerns separate:

```text
Identity
→ Who is the remote agent?

Authentication
→ Can the claimed identity be verified?

Authorization
→ Is this agent allowed to perform the requested interaction?

Capability Policy
→ Which skills may it access?

Data Boundary
→ What information may cross the boundary?

Response Validation
→ Is the received result acceptable?

Agent Safety
→ Is the requested action safe in context?

Enterprise Governance
→ Is the interaction compliant with organizational policy?
```

AGT-08 primarily owns the interoperability boundary.

Broader agent safety belongs to AGT-11.

Enterprise governance belongs to ENT.

Infrastructure security and operations belong to PROD.

---

# 55. Protocol Evolution

A2A is an evolving protocol.

Therefore, engineers should distinguish:

```text
Durable Concept
        │
        ▼
Current Protocol Representation
```

For example:

```text
Durable:
Agent Discovery

Current:
Agent Card

Durable:
Task-Oriented Interaction

Current:
Task model / task methods

Durable:
Asynchronous Updates

Current:
Streaming / push mechanisms
```

The durable concept should remain understandable even if the protocol representation changes.

---

# 56. Extensions

A standardized protocol may need to evolve without forcing every implementation to support every feature.

Extensions provide a mechanism for adding capabilities beyond the core protocol.

The engineering trade-off is:

```text
Core Protocol
      │
      ├── interoperability
      │
      └── predictability

Extensions
      │
      ├── flexibility
      │
      └── additional capability
```

Too many implementation-specific extensions can fragment interoperability.

Therefore:

> **An extension should add value without destroying the common contract that makes interoperability possible.**

---

# 57. Common Mistakes and Misconceptions

## Mistake 1 — "A2A means multi-agent architecture"

Incorrect.

A2A is an interoperability mechanism.

AGT-09 owns the multi-agent architecture decision.

---

## Mistake 2 — "A2A exposes the other agent's internal state"

Incorrect.

A2A exposes protocol-defined interaction state, such as Task status, but does not require exposing private runtime state.

---

## Mistake 3 — "An Agent Card means the agent is trusted"

Incorrect.

Discovery metadata does not automatically establish trust.

---

## Mistake 4 — "Authentication means authorization"

Incorrect.

Identity verification and permission evaluation are separate decisions.

---

## Mistake 5 — "Every agent interaction creates a Task"

Incorrect.

An interaction may produce an immediate Message response or a stateful Task.

---

## Mistake 6 — "Every response is just a Message"

Incorrect.

A2A distinguishes Messages from Tasks and Artifacts.

---

## Mistake 7 — "A Task is just an HTTP request"

Incorrect.

A Task represents a stateful unit of work that may continue across multiple interactions.

---

## Mistake 8 — "If JSON is exchanged, agents are interoperable"

Incorrect.

Syntax compatibility does not guarantee semantic compatibility.

---

## Mistake 9 — "A2A replaces APIs"

Incorrect.

Direct APIs remain appropriate for many tightly controlled integrations.

---

## Mistake 10 — "Agent discovery and capability discovery are the same"

Incorrect.

Agent discovery identifies agents.

Capability and skill metadata describe what those agents can do.

---

## Mistake 11 — "A2A Task means durable execution"

Incorrect.

A2A communicates the state and outputs of agent work across an interoperability boundary.

Durable execution, checkpointing, recovery, compensation, and execution continuity belong to AGT-06.

---

## Mistake 12 — "A2A contextId is the agent's context or memory"

Incorrect.

`contextId` groups related protocol interactions and may help the remote agent manage its own context. It does not expose the agent's complete internal context or memory.

Internal context, state, and memory management belong to AGT-04.

---

## Mistake 13 — "Streaming is the task state"

Incorrect.

Streaming is a delivery mechanism for updates.

The task state remains the authoritative protocol representation of the work.

---

## 58. Engineering Decision Framework

Before adopting A2A, ask:

### 1. Are the participants actually independent agent systems?

If one participant is simply a service, a direct API may be more appropriate.

### 2. Is cross-system agent interoperability required?

If both systems are tightly controlled, a direct integration may be simpler.

### 3. Does agent or skill discovery matter?

If the client needs to dynamically identify suitable agents, standardized discovery becomes more valuable.

### 4. Is the interaction task-oriented?

If the remote participant performs long-running or multi-step work, a task model can be useful.

### 5. Is asynchronous interaction required?

If yes, consider task state, streaming, notifications, and reconnection behavior.

### 6. What context must cross the boundary?

Define this explicitly.

### 7. What is the trust boundary?

Define:

- identity
- authentication
- authorization
- data access
- capability permissions

### 8. How will compatibility be managed?

Consider:

- protocol versions
- interface selection
- schema evolution
- capability changes
- extensions
- deprecation

### 9. What happens when the remote agent fails?

Separate:

```text
Protocol failure
Capability failure
Task failure
Dependency failure
```

### 10. Would a direct API be simpler?

If yes, A2A may not be justified.

---

# 59. Practical Design Exercise

Design an agent-to-agent interoperability architecture for this scenario:

> An enterprise travel assistant needs to communicate with an independently developed corporate travel-planning agent. The travel-planning agent is owned by another team, may take several minutes to complete complex itinerary research, may request additional information, and can produce a structured itinerary and downloadable documents.

Design:

1. Agent discovery.
2. Agent Card handling.
3. Interface selection.
4. Agent identity.
5. Authentication.
6. Authorization.
7. Capability/skill selection.
8. Initial Message.
9. Immediate Message vs Task handling.
10. Context exchange.
11. Task lifecycle.
12. Status updates.
13. Additional input.
14. Artifact delivery.
15. Failure handling.
16. Versioning.
17. Capability evolution.
18. Ownership.

Then answer:

> **Why would you use A2A instead of a direct REST API?**

Finally, identify a scenario where you would **not** use A2A.

---

## 60. Production Review Checklist

Before approving an A2A integration, verify:

```text
□ Are both participants actually agent systems?

□ Is agent-to-agent interoperability required?

□ Is the Agent Card available and maintained?

□ How is the agent discovered?

□ How is agent identity established?

□ How is authentication performed?

□ How is authorization enforced?

□ Which skills are available?

□ Which skills are authorized?

□ Which interfaces are supported?

□ How is a compatible interface selected?

□ What protocol version applies?

□ What context crosses the boundary?

□ What is the relationship between protocol context
  and internal agent context?

□ Can the interaction return an immediate Message?

□ When does it create a Task?

□ How is Task state represented?

□ How is the underlying execution made durable,
  if durability is required?

□ How are long-running tasks handled?

□ How are status updates delivered?

□ How are artifacts delivered?

□ How are additional inputs handled?

□ What happens when the remote agent fails?

□ What happens when the protocol version or interface
  is incompatible?

□ How are schemas evolved?

□ How are semantic changes managed?

□ How are capabilities deprecated?

□ How are extensions managed?

□ How are stale Agent Cards detected?

□ Who owns the remote dependency?

□ What is the escalation path?

□ Would a simpler direct API be sufficient?
```

---

# 61. Interview Questions

## Question 1

**What problem does A2A solve?**

### Expected Answer

A2A provides an interoperability model for communication between independent, potentially opaque agent systems. It allows agents built with different technologies or operated by different teams to discover each other, exchange structured information, manage tasks, and communicate results without requiring access to each other's internal implementation.

---

## Question 2

**How is A2A different from MCP?**

### Expected Answer

MCP primarily addresses AI application-to-capability interoperability, such as tools, resources, and prompts. A2A addresses interoperability between independent agent systems.

---

## Question 3

**Does A2A imply a multi-agent architecture?**

### Expected Answer

No. A2A is a protocol-level interoperability mechanism. The architectural decision to use multiple agents belongs to AGT-09.

---

## Question 4

**What is an Agent Card?**

### Expected Answer

An Agent Card is machine-readable metadata describing an agent's identity, endpoint/interface information, capabilities, skills, and authentication/interaction requirements. It helps clients discover and configure interaction with the agent.

---

## Question 5

**Why is agent discovery different from capability discovery?**

### Expected Answer

Agent discovery identifies available agent systems. Capability or skill inspection determines what a discovered agent can do. Discovering an agent does not mean it is suitable for the required task.

---

## Question 6

**Does every A2A interaction create a Task?**

### Expected Answer

No. An interaction can produce an immediate Message response when stateful work is unnecessary, or it can create a Task when the interaction represents stateful work that may continue over time.

---

## Question 7

**Why does A2A use a Task-oriented model?**

### Expected Answer

Agent work can be long-running, multi-step, asynchronous, or require additional input. A Task provides a stateful unit of work with status and outputs instead of forcing every interaction into a single synchronous request/response.

---

## Question 8

**What is the difference between a Message and an Artifact?**

### Expected Answer

A Message represents communication during the interaction, while an Artifact represents a tangible output produced by a task, such as a document, image, or structured result.

---

## Question 9

**What is `contextId` used for?**

### Expected Answer

`contextId` logically associates related Messages and Tasks. The receiving agent may use that association when managing its own conversational or task context. It does not expose the agent's complete internal memory or runtime state.

---

## Question 10

**Does A2A give Agent A access to Agent B's memory?**

### Expected Answer

No. A2A operates through an external interoperability boundary. Context can be explicitly exchanged, but internal memory and state remain implementation details unless deliberately exposed through a protocol contract.

---

## Question 11

**Can an A2A interaction be asynchronous?**

### Expected Answer

Yes. Agent tasks may be long-running, with task retrieval, streaming, or push-oriented mechanisms depending on the supported protocol interface and version.

---

## Question 12

**What is the difference between Task state and streaming?**

### Expected Answer

Task state represents the authoritative protocol state of the work. Streaming is a mechanism for delivering updates incrementally. A disconnected stream does not necessarily mean the underlying task stopped.

---

## Question 13

**Why isn't authentication enough for A2A security?**

### Expected Answer

Authentication establishes identity. Authorization determines whether the authenticated participant is permitted to perform a particular interaction. Additional validation and trust policies are also needed.

---

## Question 14

**Two agents support the same A2A version but interpret a skill differently. What is the problem?**

### Expected Answer

Semantic incompatibility. Protocol/version compatibility does not guarantee that both implementations interpret capability names, fields, or behaviors identically.

---

## Question 15

**What is the difference between an A2A Task and durable execution?**

### Expected Answer

An A2A Task represents and communicates a unit of agent work across an interoperability boundary, including its state and outputs. Durable execution concerns how the underlying work survives failures, checkpoints progress, resumes execution, and recovers. Durable execution belongs to AGT-06.

---

## Question 16

**What is the difference between an A2A context identifier and an agent's internal context?**

### Expected Answer

An A2A `contextId` provides protocol-level grouping for related interactions and may be used by the remote agent to manage its own context. Internal agent context may contain conversation state, working state, memory, and other runtime information. A2A does not prescribe or expose the agent's complete internal context.

---

## Question 17

**What is the relationship between A2A semantics and transport?**

### Expected Answer

A2A defines the semantics of agent interoperability—such as discovery, Messages, Tasks, context, status, and Artifacts. A protocol binding and transport determine how those semantics are carried between participants. A2A should not be reduced to a single transport mechanism.

---

## Question 18 — Engineering Judgment

**Your team has one agent calling one internal service owned by the same team. The operation is synchronous and returns a small JSON response. Should you use A2A?**

### Expected Answer

Probably not. A direct API is likely simpler unless there is a concrete requirement for agent discovery, independent agent interoperability, task lifecycle semantics, or cross-team/vendor interoperability.

---

## Question 19 — Engineering Judgment

**A remote agent may take 20 minutes to complete a task and may request additional information halfway through. Would a simple synchronous REST call be sufficient?**

### Expected Answer

Probably not without significant custom lifecycle machinery. A task-oriented interoperability model is more appropriate because the interaction needs stateful task management, asynchronous progress, additional input, and potentially artifact delivery.

---

## Question 20 — Architecture Judgment

**A team says, "We need A2A because we are building a multi-agent system." What would you challenge?**

### Expected Answer

The team is conflating architecture with interoperability. First determine whether independent agent boundaries actually require a standardized communication protocol. Multi-agent architecture is an AGT-09 decision; A2A is one possible interoperability mechanism.

---

## Question 21 — Failure Diagnosis

**An Agent Card says a remote agent supports `research`, but the task request is rejected. How would you diagnose the problem?**

### Expected Answer

Check the layers:

```text
Discovery
→ Agent Card freshness
→ Interface selection
→ Protocol version / binding
→ Authentication
→ Authorization
→ Skill availability
→ Request schema
→ Semantic contract
→ Message / task acceptance
```

The Agent Card may be stale, the selected interface may be incompatible, the skill may require authorization, or the request may violate the actual contract.

---

# 62. Quick Revision

### A2A in one sentence

> **A2A provides an interoperability protocol for independent agent systems to discover each other, exchange structured information, perform task-oriented interactions, and communicate results across system boundaries.**

### Core architecture

```text
Agent A
   │
   │ Discovery
   ▼
Agent Card
   │
   │ Capability / Skill / Interface Inspection
   ▼
Compatible Interface
   │
   │ Message
   ▼
Agent B
   │
   ├── Immediate Message Response
   │
   └── Task
          │
          ├── Status
          ├── Additional Input
          ├── Messages
          └── Artifacts
```

### Protocol layers

```text
A2A Interaction Semantics
        ↓
Protocol Binding
        ↓
Transport
        ↓
Network Communication
```

### Core distinction

```text
MCP
→ Agent/Application ↔ Capability

A2A
→ Agent ↔ Agent

AGT-09
→ Multi-Agent Architecture
```

### Core interaction model

```text
Incoming Message
       │
       ├── immediate
       │      ↓
       │    Message
       │
       └── stateful
              ↓
             Task
              │
       ┌──────┼──────┐
       ▼      ▼      ▼
    Status   Input  Artifact
       │
       ▼
 Terminal State
```

### Important distinctions

```text
Agent Discovery
        ≠
Capability / Skill Discovery

Discovery
        ≠
Trust

Authentication
        ≠
Authorization

Context Exchange
        ≠
Shared Internal State

A2A contextId
        ≠
Complete Agent Runtime Context

Message
        ≠
Task
        ≠
Artifact

Task State
        ≠
Durable Execution

Streaming
        ≠
Task State

Protocol Compatibility
        ≠
Semantic Compatibility

A2A
        ≠
Multi-Agent Architecture
```

---

# 63. Key Takeaways

1. Agent-to-agent interoperability exists because independently implemented agent systems may need to communicate without sharing internal architecture.
2. A2A addresses agent-to-agent interoperability rather than capability/tool interoperability.
3. MCP and A2A solve related but different interoperability problems.
4. A2A does not imply a multi-agent architecture.
5. Agent discovery and capability/skill discovery are related but distinct.
6. The Agent Card provides machine-readable information about an agent's identity, interfaces, capabilities, skills, and authentication requirements.
7. Agent Card inspection can help a client select a compatible interaction interface.
8. A2A uses structured Messages rather than arbitrary agent-specific communication.
9. Not every interaction creates a Task.
10. An immediate interaction may produce a Message response.
11. Stateful work may produce a Task with lifecycle state.
12. Tasks provide a protocol-level model for work that can continue across multiple interactions.
13. Messages represent communication; Artifacts represent produced outputs.
14. Parts represent content units within Messages and Artifacts.
15. `contextId` logically associates related Tasks and Messages and may help the remote agent manage its own context.
16. `contextId` does not expose the agent's complete internal memory or runtime state.
17. Agent-to-agent communication may be synchronous or asynchronous.
18. Streaming provides incremental update delivery but is not the authoritative task state.
19. Push notifications provide asynchronous update signaling; they are not themselves the complete task state.
20. A2A interaction semantics should be distinguished from protocol bindings and transports.
21. Authentication establishes identity; authorization determines permission.
22. Capability exposure should be deliberate.
23. Protocol compatibility does not guarantee semantic compatibility.
24. Protocol versioning, schema evolution, capability evolution, and deprecation are production engineering concerns.
25. An A2A Task communicates a unit of agent work; it does not replace durable execution mechanisms.
26. A2A should not be adopted merely because a system is described as "multi-agent."
27. Direct APIs remain preferable for many simple, tightly controlled integrations.
28. The correct architectural question is not:
   > "Can we use A2A?"
   
   It is:
   
   > **"Does independent agent interoperability justify the additional protocol and operational complexity?"**

---

## 64. Further Reading

For current A2A implementation work, prefer the authoritative protocol specification and official protocol documentation because protocol details evolve over time.

Primary reference categories include:

- A2A protocol specification
- A2A Agent Card documentation
- A2A task and lifecycle documentation
- A2A message and artifact documentation
- A2A streaming and asynchronous interaction documentation
- A2A authentication and security documentation
- A2A protocol binding and transport documentation
- A2A extension and versioning documentation

When implementing A2A in production, always verify:

- applicable protocol version
- supported interface/binding
- supported transport
- Agent Card schema
- task lifecycle semantics
- authentication requirements
- supported extensions

Do not assume that an older tutorial, SDK example, or blog post describes current protocol behavior.

---

## Final Mental Model

Keep this model in mind:

```text
                         AGENT SYSTEM A
                              │
                              │
                       Agent Discovery
                              │
                              ▼
                       ┌──────────────┐
                       │ Agent Card   │
                       └──────┬───────┘
                              │
                    Capabilities / Skills
                              │
                    Supported Interfaces
                              │
                              ▼
                    Select Compatible
                         Interface
                              │
                              ▼
                       Authentication
                              │
                              ▼
                       Authorization
                              │
                              ▼
                    ┌──────────────────┐
                    │ A2A INTERFACE     │
                    │                  │
                    │ Messages         │
                    │ Tasks            │
                    │ Context          │
                    │ Status           │
                    │ Artifacts        │
                    │ Versioning       │
                    │ Security         │
                    └────────┬─────────┘
                             │
                             ▼
                       AGENT SYSTEM B
                             │
                    ┌────────┴────────┐
                    │                 │
                 Internal          Internal
                 Runtime            Tools
                    │                 │
                    └────────┬────────┘
                             │
                             ▼
                         Task Result
```

The protocol layering should also remain clear:

```text
┌────────────────────────────────────────────┐
│       A2A Interaction Semantics            │
│                                            │
│ Discovery • Messages • Tasks • Context     │
│ Status • Artifacts • Security              │
└──────────────────────┬─────────────────────┘
                       │
                       ▼
              Protocol Binding
                       │
                       ▼
                  Transport
                       │
                       ▼
              Network Communication
```

And the most important interaction model is:

```text
                 Incoming Message
                        │
              ┌─────────┴─────────┐
              │                   │
              ▼                   ▼
       Immediate Response     Stateful Work
              │                   │
              ▼                   ▼
           Message              Task
                                  │
                     ┌────────────┼────────────┐
                     │            │            │
                     ▼            ▼            ▼
                  Status       Input       Artifact
                     │            │            │
                     └──────┬─────┴────────────┘
                            │
                            ▼
                       More Message
                            │
                            ▼
                      Terminal State
```

The most important architectural boundaries are:

```text
┌─────────────────────────────────────────────┐
│                  AGT-08                     │
│                                             │
│ How can independent agent systems           │
│ communicate through interoperable           │
│ interfaces and protocols?                  │
│                                             │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
                      A2A
                       │
                       ▼
          Agent-to-Agent Interoperability
```

Keep these three questions permanently separate:

```text
MCP
  │
  └── "I need to interact with a capability."

A2A
  │
  └── "I need to interact with another agent system."

AGT-09
  │
  └── "Should my overall system contain multiple agents,
       and how should those agents be architected?"
```

And keep the execution boundary equally clear:

```text
A2A Task
    │
    └── Represents and communicates work
        across an agent interoperability boundary.

AGT-06 Durable Execution
    │
    └── Makes underlying execution durable,
        resumable, recoverable, and compensatable.

AGT-04 Agent Context / State / Memory
    │
    └── Manages the agent's internal runtime state
        and memory.
```

The final mental model is therefore:

> **A2A is not a protocol for making systems "more agentic." It is an interoperability mechanism that lets independent agent systems communicate through a defined external contract while preserving internal implementation boundaries.**

The engineering question is not:

> "Should we use A2A because we are building agents?"

It is:

> **"Do we actually need independent agent-to-agent interoperability, and does the value of standardized discovery, structured interaction, task semantics, context exchange, and asynchronous communication justify the additional protocol and operational complexity?"**
