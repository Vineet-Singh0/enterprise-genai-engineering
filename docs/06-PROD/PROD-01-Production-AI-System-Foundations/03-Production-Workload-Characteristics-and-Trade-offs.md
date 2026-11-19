# 03 — Production Workload Characteristics and Trade-offs

## Learning Objectives

By the end of this chapter, you should be able to:

- Identify the workload characteristics of a production AI system.
- Distinguish between synchronous, asynchronous, interactive, and batch workloads.
- Analyze traffic volume, traffic variability, latency sensitivity, throughput requirements, and request size.
- Identify compute intensity and accelerator dependence.
- Reason about statefulness and dependency behavior.
- Understand how workload behavior leads to system requirements and architectural consequences.
- Identify workload predictability, cost constraints, and availability expectations.
- Recognize data movement and resource contention as architectural concerns.
- Connect workload behavior to requirements, constraints, and architecture.
- Evaluate architecture choices using explicit workload-driven trade-offs.

---

## Prerequisites

Before reading this chapter, you should understand:

- What makes an AI capability a production problem.
- Production requirements and system boundaries.
- Responsibility and ownership boundaries.
- Components, services, interfaces, and dependencies.
- Architectural coupling and cohesion.
- The difference between logical and physical architecture.

Read first:

- [01 — Production AI Problem and Production Boundaries](./01-Production-AI-Problem-and-Production-Boundaries.md)
- [02 — Production AI System Architecture and Service Boundaries](./02-Production-AI-System-Architecture-and-Service-Boundaries.md)

---

## Reading Time

Approximately 30–40 minutes.

---

## Before We Start

A production AI system does not operate in an abstract environment.

It receives requests.

Those requests arrive at particular rates, have particular sizes, require different amounts of computation, depend on external systems, consume resources, and may have different expectations around response time and availability.

Consider two AI systems.

### System A — Customer Support Assistant

A customer sends a message and expects an answer within a few seconds.

The system may:

1. receive the request,
2. retrieve relevant information,
3. call a model,
4. generate a response,
5. return the result.

### System B — Document Classification Pipeline

Every night, the system processes 500,000 documents.

Users do not wait for individual results.

The system can process documents in batches over several hours.

Both systems use AI.

But their workloads are fundamentally different.

That difference affects architecture.

The central idea of this chapter is:

> **Architecture should respond to how a system is used, not only to what AI capability it contains.**

---

## 1. Why Workload Characteristics Matter

A model tells us what computation is possible.

A workload tells us **how that computation must operate in the real world**.

A model may be capable of generating text in 500 milliseconds.

That does not mean the production system should be designed around a 500-millisecond response.

The production workload may involve:

- variable request rates,
- large prompts,
- retrieval calls,
- external APIs,
- concurrent users,
- expensive model inference,
- large documents,
- strict response expectations,
- asynchronous processing,
- resource contention.

Therefore:

```text
AI Capability
      ↓
Production Workload
      ↓
Requirements and Constraints
      ↓
Architectural Consequences
      ↓
Trade-offs
```

A production engineer should ask:

> **What characteristics of this workload create requirements or constraints for the architecture?**

---

# 2. The Core Workload Reasoning Model

A useful model for production architecture is:

```text
Workload Behavior
        ↓
Derived Requirement / Constraint
        ↓
Architectural Choice
        ↓
Benefit + Cost
        ↓
Trade-off
        ↓
Operational Consequence
```

For example:

```text
Interactive workload
        ↓
User expects timely results
        ↓
Low-latency request path becomes important
        ↓
Immediate interaction is preserved
but request-path processing becomes more constrained
        ↓
Trade-off
```

The goal is not to memorize this sequence.

The goal is to use it when making architectural decisions.

---

# 3. What Is a Workload?

A workload is the pattern of work that a system must perform under real operating conditions.

For an AI system, workload behavior may include:

- how requests arrive,
- how much work each request requires,
- how quickly results are expected,
- how much data moves through the system,
- how predictable demand is,
- how much state must be maintained,
- what external systems are involved,
- how much compute is required,
- how resources are shared or competed for.

A workload is therefore more than:

> “The system receives API requests.”

That description is too shallow for architecture decisions.

A more useful description might be:

> “The system receives interactive user requests with variable traffic, large context payloads, retrieval dependencies, model inference, and a response expectation of a few seconds.”

That description provides architectural information.

---

## 4. Workload Behavior vs Requirements and Constraints

A critical distinction is needed before analyzing individual workload dimensions.

Not every important production property is itself a workload characteristic.

### Workload behavior describes what the system experiences

Examples include:

- interactive or batch processing,
- request arrival patterns,
- request size,
- processing intensity,
- statefulness,
- dependency behavior,
- data movement,
- resource demand.

### Requirements and constraints describe what the system must satisfy

Examples include:

- acceptable response time,
- required throughput,
- availability expectation,
- cost limit,
- resource constraints,
- business-criticality expectations.

The two are connected:

```text
Workload Behavior
        ↓
System Context
        ↓
Requirement / Constraint
        ↓
Architecture
```

For example:

```text
Interactive user workload
        ↓
User is waiting for the result
        ↓
Response-time requirement
        ↓
Architecture must support timely request completion
```

The distinction matters because engineers should not assume that a particular requirement applies simply because a workload has a particular shape.

Requirements must be derived from the actual system context and business need.

---

# 5. Synchronous and Asynchronous Workloads

One of the first workload characteristics to identify is whether the result is required immediately.

## 5.1 Synchronous Workload

A synchronous workload requires the caller to wait for the result.

Conceptually:

```text
User
  │
  │ Request
  ▼
AI System
  │
  │ Processing
  ▼
Result
  │
  ▼
User
```

Examples include:

- chat responses,
- real-time recommendation requests,
- classification APIs,
- fraud scoring during a transaction,
- AI-assisted form completion.

The key characteristic is not merely that an HTTP request exists.

The important characteristic is:

> **The consumer expects the result as part of the current interaction.**

---

## 5.2 Asynchronous Workload

An asynchronous workload allows the system to accept work without requiring the result immediately.

Conceptually:

```text
Client
   │
   │ Submit Work
   ▼
Work Intake
   │
   │
   ▼
Processing
   │
   ▼
Result
```

The consumer may receive:

- a job identifier,
- a notification,
- a later result,
- a status update,
- or another form of completion signal.

Examples include:

- document processing,
- large-scale embedding generation,
- batch classification,
- report generation,
- offline model inference.

---

## 5.3 The Architectural Trade-off

The decision is not:

> “Synchronous is better than asynchronous.”

The actual question is:

> **When does the consumer require the result?**

If the result is required immediately, synchronous processing may be appropriate.

If processing can happen later, asynchronous processing may provide greater architectural flexibility.

The trade-off is:

```text
Immediate Result
      ↓
Synchronous Interaction
      ↓
Simple Consumer Experience
      +
More pressure on request-path processing
```

versus:

```text
Deferred Result
      ↓
Asynchronous Processing
      ↓
Greater decoupling
      +
More workflow/state complexity
```

The choice should follow the workload rather than architectural fashion.

---

# 6. Interactive Workloads

Interactive workloads involve human or system interaction where the consumer expects a relatively immediate response.

Examples:

- conversational AI,
- coding assistants,
- search assistants,
- real-time recommendations,
- AI-powered customer support.

Typical workload behavior includes:

- user-driven request arrival,
- variable request size,
- potentially variable traffic,
- dependency calls,
- variable computation per request.

The resulting requirement may be high sensitivity to response time.

For interactive workloads, a slow dependency can directly affect the user experience.

Consider:

```text
User
  ↓
Application
  ↓
Retrieval
  ↓
Model
  ↓
Response
```

If every request requires multiple sequential operations, the total response behavior depends on the combined processing path.

This does not mean every component must be optimized independently.

It means the workload makes the end-to-end request path architecturally important.

---

# 7. Batch Workloads

Batch workloads process a collection of items rather than serving individual interactive requests.

Examples:

- nightly document classification,
- generating embeddings for a dataset,
- offline recommendation generation,
- bulk summarization,
- historical data processing.

Conceptually:

```text
Input Dataset
      ↓
Batch Processing
      ↓
AI Computation
      ↓
Output Dataset
```

The workload may tolerate longer processing times because there is no individual user waiting for every result.

This changes architectural priorities.

For example:

```text
Interactive Workload
→ response time may be highly sensitive

Batch Workload
→ total processing completion may matter more
```

The same model may therefore require different system architectures depending on how it is consumed.

---

# 8. Latency Sensitivity

Latency is the time required for an operation or interaction to produce a result.

The important architectural question is not simply:

> “Is low latency good?”

Instead ask:

> **How sensitive is this workload to latency?**

Different workloads tolerate different response times.

For example:

| Workload | Relative latency sensitivity |
|---|---|
| Conversational assistant | High |
| Real-time recommendation | High |
| Transaction-time classification | High |
| Interactive document search | High |
| Background summarization | Lower |
| Nightly batch processing | Lower |
| Historical embedding generation | Lower |

These are workload characteristics that influence the resulting response-time requirement.

---

## 8.1 Latency Sensitivity vs Latency Requirement

These concepts should not be treated as identical.

Consider:

```text
Interactive workload
        ↓
Consumer waits for result
        ↓
High latency sensitivity
        ↓
Response-time requirement
        ↓
Request path must support timely processing
```

The workload creates sensitivity.

The system requirement defines what “timely” means for the actual product or business context.

A conversational assistant and an internal analytics tool may both be interactive but have different acceptable response times.

Therefore:

> **Latency sensitivity is a workload property; an exact latency target is a system requirement.**

---

# 9. Throughput

Throughput describes the amount of work that must be completed over a period of time.

Examples include:

- requests per second,
- documents per hour,
- records classified per day,
- items processed per batch window.

The workload may have a particular arrival rate or processing volume.

That behavior can create a throughput requirement.

Consider:

```text
10 requests/minute
```

versus:

```text
10,000 requests/minute
```

The functional requirement may appear identical:

> “Generate an AI response.”

But the workload behavior is dramatically different.

Therefore:

```text
Workload Volume / Arrival Rate
        ↓
Throughput Requirement
        ↓
Architectural Consequences
```

Throughput should be considered separately from latency.

A workload can have:

- low latency sensitivity but high throughput,
- high latency sensitivity but moderate throughput,
- both high latency sensitivity and high throughput,
- or low requirements in both dimensions.

Detailed capacity planning and autoscaling are outside this chapter's scope and belong to later production engineering topics.

---

# 10. Traffic Variability

Average traffic can hide important workload behavior.

Suppose a system receives:

```text
Average: 100 requests/minute
```

That number alone is insufficient.

Traffic could look like:

```text
100 ─────────────────────────────
```

or:

```text
20   20   20   500   20   20
                  ↑
                Burst
```

Both workloads may have the same average traffic.

Their architectural implications are different.

---

## 10.1 Predictable Traffic

Examples:

- scheduled nightly jobs,
- predictable business-hour traffic,
- fixed internal batch workloads.

Predictable traffic makes workload behavior easier to characterize.

---

## 10.2 Variable Traffic

Examples:

- consumer applications,
- news-driven applications,
- promotional campaigns,
- unpredictable user-generated workloads.

Variable traffic creates changing resource demand.

The architectural reasoning at this stage is:

> **Traffic variability is workload behavior that can create a requirement for adaptable resource usage.**

The detailed engineering of autoscaling and capacity management belongs to later production chapters.

---

# 11. Request and Response Size

Not every AI request has the same size.

Consider an LLM system.

One request may contain:

```text
Short question
+
Small context
```

Another may contain:

```text
Large document
+
Conversation history
+
Retrieved context
+
System instructions
```

The second request may require substantially more processing and data movement.

Similarly, AI outputs can vary:

```text
Short classification
```

versus:

```text
Long generated response
```

Therefore request and response size can influence:

- processing requirements,
- memory requirements,
- data movement,
- dependency behavior,
- workload cost,
- architecture boundaries.

The important principle is:

> **Request count alone does not fully describe workload intensity.**

---

# 12. Compute Intensity

Different AI workloads require different amounts of computation.

Consider:

```text
Simple classification
        ↓
Relatively small computation
```

versus:

```text
Large language model generation
        ↓
High computation
```

or:

```text
Large document embedding
        ↓
Large number of inference operations
```

Compute intensity influences the type and amount of resources required by the architecture.

A workload may also be:

- CPU-oriented,
- accelerator-oriented,
- memory-intensive,
- data-transfer-intensive,
- or a combination.

The architecture therefore needs to understand **what kind of work dominates the workload**.

---

# 13. Accelerator Dependence

Some AI workloads can execute effectively using general-purpose CPU resources.

Others depend heavily on specialized accelerators.

Examples may include:

- GPU-intensive model inference,
- large-scale embedding generation,
- vision workloads,
- training workloads.

Accelerator dependence matters because it can constrain architecture.

For example:

```text
Application
     ↓
AI Processing
     ↓
GPU-dependent computation
```

If the AI processing responsibility requires specialized resources, separating that responsibility may provide architectural value.

However:

> **Accelerator dependence does not automatically mean the workload requires a separate service.**

The boundary decision still depends on responsibility, workload behavior, ownership, and architectural trade-offs.

This connects directly to the boundary reasoning from the previous chapter.

---

# 14. Stateful and Stateless Workloads

Another important workload characteristic is whether processing depends on state maintained across requests.

## Stateless Workload

Each request can be processed independently.

```text
Request A → Result A

Request B → Result B
```

The processing of Request B does not depend on the state created by Request A.

Examples may include:

- independent classification,
- simple embedding requests,
- independent prediction requests.

---

## Stateful Workload

Processing depends on information accumulated across interactions.

```text
Request 1
   ↓
State
   ↓
Request 2
   ↓
Updated State
   ↓
Request 3
```

Examples include:

- conversational systems,
- workflow execution,
- long-running AI tasks,
- sessions that maintain context.

Statefulness can influence:

- component boundaries,
- data ownership,
- request routing,
- lifecycle responsibilities,
- dependency relationships.

The important question is:

> **What state does the workload require, and which responsibility owns it?**

Detailed state-management implementation patterns belong to the relevant downstream production topics.

---

# 15. Dependency Behavior

AI workloads often depend on multiple systems.

For example:

```text
User Request
     ↓
Application
     ↓
Retrieval
     ↓
Embedding
     ↓
Model Provider
     ↓
Response
```

Each dependency may have different behavior.

A dependency may be:

- local,
- internal,
- external,
- synchronous,
- asynchronous,
- predictable,
- variable,
- computationally expensive,
- data-intensive.

These differences affect workload behavior.

For example, a retrieval component that normally responds quickly but occasionally takes much longer creates a different workload condition than a deterministic local computation.

At this stage, the goal is to identify the dependency relationship and its effect on workload behavior.

Detailed retry, timeout, fallback, failure isolation, and recovery strategies belong to later reliability engineering topics.

---

# 16. Workload Predictability

Some workloads are highly predictable.

Others are highly variable.

Predictability can exist across several dimensions:

- traffic volume,
- request size,
- compute requirements,
- dependency behavior,
- processing duration.

Consider:

```text
Scheduled Batch
```

versus:

```text
User-driven Agentic Workflow
```

The first may have relatively predictable behavior.

The second may have significant variation between requests.

For architecture, predictability matters because predictable workloads are easier to characterize and plan around.

Variable workloads require architecture that can accommodate changing conditions.

---

# 17. Cost Sensitivity as a Constraint

Not every workload has the same cost implications.

Consider:

### Internal Experiment

A small number of engineers use the system.

Cost may be a secondary concern.

### Consumer AI Product

Millions of users interact with the system.

Small per-request cost differences can become significant.

### Large Batch Pipeline

Millions of documents are processed periodically.

The total processing cost may dominate architectural decisions.

Therefore:

```text
Workload Behavior
        +
Business Context
        ↓
Cost Exposure
        ↓
Cost Constraint
        ↓
Architectural Trade-off
```

Cost sensitivity is therefore better understood as a **constraint associated with the workload and business context**, rather than as an intrinsic workload behavior.

For example, an architecture may favor:

- simpler processing,
- asynchronous execution,
- batch processing,
- smaller models,
- reduced data movement,
- shared infrastructure.

However, cost should not be optimized independently of system requirements.

A cheaper architecture that violates latency or availability requirements is not necessarily a better architecture.

---

# 18. Availability Expectations as a Requirement

Availability expectations should be derived from the role of the workload in the larger system.

Consider:

### Transaction-time AI

If AI processing is part of a critical transaction, interruption may directly affect the business operation.

### Internal Analytics

A temporary interruption may be acceptable if processing can resume later.

### Offline Batch

A delayed job may be acceptable within the defined processing window.

Therefore:

```text
Workload Role
      +
Business Context
      ↓
Business Criticality
      ↓
Availability Expectation
      ↓
Architectural Requirement
```

Availability expectation is therefore a **system requirement**, not simply an intrinsic property of the workload.

Detailed availability targets, SLOs, failure isolation, and recovery mechanisms belong to later production engineering topics.

---

# 19. Data Movement

AI workloads often move substantial amounts of data.

Examples include:

- documents,
- images,
- audio,
- video,
- embeddings,
- retrieved context,
- prompts,
- model outputs.

Consider:

```text
Document Store
      ↓
Retrieval
      ↓
Context
      ↓
Model
      ↓
Response
```

If large amounts of data move between boundaries, the architecture must account for that behavior.

Data movement can affect:

- processing time,
- resource usage,
- memory requirements,
- network dependency,
- cost,
- component boundaries.

This does not mean data should always stay in one component.

The architectural question is:

> **What data must cross each boundary, and why?**

---

# 20. Resource Demand and Contention

Workloads create demand for shared resources.

For example:

```text
                    ┌── AI Request A
                    │
Shared GPU ─────────┼── AI Request B
                    │
                    └── Batch Job
```

The batch workload may consume resources while interactive requests are also arriving.

This creates a workload interaction problem.

Resource contention can occur across:

- CPU,
- memory,
- GPU/accelerators,
- storage,
- network,
- database resources,
- external provider quotas.

The workload characteristics that matter include:

- resource demand,
- concurrency,
- processing intensity,
- sharing behavior.

**Contention emerges when multiple workloads compete for shared resources.**

The architecture therefore needs to understand whether workloads:

- share resources,
- compete for resources,
- have different priorities,
- have different workload patterns.

Detailed scheduling, capacity planning, and resource scaling belong to later production topics.

---

# 21. Workload Characteristics Are Not Independent

Real production workloads rarely have only one characteristic.

Consider an enterprise conversational AI system:

```text
Interactive
     +
Variable traffic
     +
Variable request size
     +
Compute-intensive inference
     +
External dependencies
     +
Stateful conversations
     +
Cost-sensitive business context
```

These characteristics interact.

For example:

```text
Interactive
      ↓
User waits for result

+
      
Large context
      ↓
More processing and data movement

+

External model dependency
      ↓
Dependency behavior affects request path

+

Variable traffic
      ↓
Changing resource demand
```

No single characteristic determines the architecture.

The combination does.

---

# 22. Workload Behavior → Requirement → Architectural Consequence

A useful engineering table is:

| Workload behavior | Derived requirement / constraint | Architectural consequence |
|---|---|---|
| Interactive | Timely response required | Request path must support timely processing |
| Batch | Deferred completion acceptable | Processing can be decoupled from user interaction |
| High workload volume | Required processing throughput | Architecture must support sustained processing |
| Variable traffic | Resource demand changes over time | Architecture must accommodate changing workload |
| Large requests | More data and processing per request | Boundaries and data movement need consideration |
| Compute-intensive | Significant computation required | Compute responsibility becomes architecturally important |
| Accelerator-dependent | Specialized resources required | Resource-dependent responsibility may need isolation |
| Stateful | Context persists across interactions | State ownership becomes important |
| External dependency | Processing depends on another system | Dependency boundary must be explicit |
| Cost-sensitive business context | Resource usage must remain within cost constraints | Architecture may favor efficient processing paths |
| High business criticality | Higher availability expectation | Architecture must reflect business criticality |
| Large data movement | Significant data crosses boundaries | Data placement and boundaries require consideration |
| Multiple workloads sharing resources | Resource isolation or sharing may be required | Shared-resource relationships become architectural concerns |

This table should be used as a reasoning aid, not as a checklist that automatically determines architecture.

---

## 23. The Central Trade-off Model

Workload analysis should eventually produce architectural decisions.

Use:

```text
Workload Behavior
        ↓
Requirement / Constraint
        ↓
Architectural Choice
        ↓
Benefit
        +
Cost
        ↓
Trade-off
        ↓
Operational Consequence
```

For example:

```text
Large document processing
        ↓
Deferred completion is acceptable
        ↓
Batch / asynchronous processing
        ↓
Better processing flexibility
        ↓
Results are not immediate
        ↓
Acceptable only if deferred completion is allowed
```

The architecture is therefore not “better” in isolation.

It is better **for the workload and requirements being served**.

---

# 24. Example — Customer Support AI

Suppose an enterprise wants an AI customer support assistant.

Requirements:

- customers interact directly,
- responses should feel immediate,
- traffic varies throughout the day,
- conversations maintain context,
- responses use retrieved company information,
- model inference is computationally significant,
- cost must remain controlled.

Workload behavior:

```text
Interactive
Variable traffic
Variable request size
Stateful
Retrieval-dependent
Compute-intensive
```

Derived requirements and constraints:

```text
High response-time sensitivity
+
Changing resource demand
+
State ownership
+
Retrieval dependency
+
Compute/resource requirements
+
Cost constraint
```

Now apply the reasoning model.

### Characteristic 1 — Interactive

```text
Interactive
    ↓
Immediate result expected
    ↓
Synchronous request path
```

### Characteristic 2 — Stateful

```text
Conversation state
    ↓
State ownership required
    ↓
Explicit state responsibility
```

### Characteristic 3 — Retrieval dependency

```text
User Request
     ↓
Retrieval
     ↓
Model
     ↓
Response
```

Retrieval becomes part of the request path.

### Characteristic 4 — Variable traffic

```text
Traffic changes
     ↓
Resource demand changes
     ↓
Architecture must accommodate variation
```

### Characteristic 5 — Cost constraint

```text
High model usage
     ↓
High resource consumption
     ↓
Cost becomes an architectural constraint
```

The architecture should therefore be derived from the workload rather than from a generic “AI microservices” template.

---

# 25. Example — Document Processing Pipeline

Now consider a different system.

The organization uploads 1 million documents every night.

The system:

1. extracts content,
2. generates embeddings,
3. classifies documents,
4. stores results.

Users do not wait for individual documents.

Workload behavior:

```text
Batch
High volume
Large data volume
Compute-intensive
Predictable schedule
Large data movement
```

Derived requirements and constraints may include:

```text
Deferred completion acceptable
+
High processing throughput
+
Cost sensitivity
+
Resource efficiency
```

The architectural reasoning changes:

```text
Batch
   ↓
Deferred completion acceptable
   ↓
Asynchronous processing

+

High volume
   ↓
Sustained processing requirement

+

Large data volume
   ↓
Data movement becomes important

+

Cost sensitivity
   ↓
Processing efficiency matters
```

The same AI technology can therefore require a very different architecture.

---

# 26. Example — Real-Time Recommendation

Suppose an e-commerce platform wants recommendations while a user browses products.

The workload behavior may be:

```text
Interactive
High request volume
Variable traffic
Small request size
Compute-intensive
```

Derived requirements may include:

```text
High response-time sensitivity
+
High throughput
+
Adaptation to changing resource demand
+
Efficient request processing
```

The architectural reasoning becomes:

```text
High latency sensitivity
        ↓
Fast request path

High request volume
        ↓
High throughput requirement

Variable traffic
        ↓
Changing resource demand

Small request
        ↓
Efficient request/response path
```

Again, the workload determines the architecture.

---

# 27. Workload Interactions

A common architectural mistake is analyzing each characteristic independently.

Real systems contain interactions.

For example:

```text
Large Request
      +
High Traffic
      +
Compute-Intensive Model
      ↓
High Resource Demand
```

Or:

```text
Interactive
      +
External Dependency
      +
Variable Dependency Behavior
      ↓
Sensitive Request Path
```

Or:

```text
Batch
      +
Large Dataset
      +
Cost Constraint
      ↓
Strong incentive for efficient bulk processing
```

Therefore the engineer should ask:

> **Which workload characteristics amplify each other?**

This question often reveals the real architectural constraint.

---

# 28. Workload Classification Before Architecture

Before selecting components or services, classify the workload.

A useful sequence is:

```text
1. How is work initiated?
        ↓
2. Is the result immediate or deferred?
        ↓
3. How much work arrives?
        ↓
4. How variable is demand?
        ↓
5. How large is each request?
        ↓
6. How computationally intensive is it?
        ↓
7. Does it depend on state?
        ↓
8. What dependencies are involved?
        ↓
9. What data moves?
        ↓
10. What resources does it require?
        ↓
11. Which business requirements constrain it?
```

This produces a workload profile.

The workload profile then informs architecture.

---

# 29. Workload Profile Example

For a conversational RAG assistant:

| Dimension | Example |
|---|---|
| Interaction | Interactive |
| Completion | Synchronous |
| Traffic | Variable |
| Request size | Variable |
| Compute | High |
| Accelerator dependence | Possible |
| State | Stateful |
| Dependencies | Retrieval + model provider |
| Predictability | Moderate |
| Data movement | Moderate to high |
| Resource demand | High |
| Latency sensitivity | High |
| Throughput requirement | Moderate to high |
| Cost constraint | High |
| Availability expectation | High |

The profile intentionally separates **workload behavior** from **derived requirements and constraints**.

The profile does not produce an architecture automatically.

It gives the engineer the conditions that the architecture must satisfy.

---

## 30. Workload-Driven Architecture Decisions

A production architecture should therefore be explainable using workload evidence.

Instead of:

> “We use asynchronous processing because that is the standard pattern.”

prefer:

> “The workload processes large document sets where users do not require immediate results, so deferred processing is acceptable.”

Instead of:

> “We separated this service because microservices are scalable.”

prefer:

> “This responsibility has a distinct workload profile, independent ownership, and different processing requirements, so separating it provides enough value to justify the additional boundary.”

Instead of:

> “We need GPUs because this is an AI system.”

prefer:

> “This workload is dominated by computation that benefits from accelerator resources, making accelerator dependence an architectural constraint.”

This is the difference between pattern selection and engineering reasoning.

---

## 31. Common Architecture Trade-offs

Workload characteristics often create recurring trade-offs.

## Immediate vs Deferred Processing

```text
Immediate
→ simpler user interaction
→ stronger request-path constraints

Deferred
→ greater processing flexibility
→ more workflow/state complexity
```

## Shared vs Isolated Resources

```text
Shared
→ better utilization
→ more contention

Isolated
→ stronger workload separation
→ potentially lower utilization / higher resource cost
```

## Centralized vs Specialized Processing

```text
Centralized
→ simpler architecture
→ mixed workload behavior

Specialized
→ workload-specific processing
→ additional boundaries
```

## Simplicity vs Workload Isolation

```text
Fewer components
→ simpler architecture
→ more mixed responsibilities

More separation
→ stronger workload isolation
→ more interfaces and dependencies
```

None of these choices is universally correct.

The workload determines which trade-off is acceptable.

---

# 32. Common Mistakes

## Mistake 1 — Designing from Average Traffic Only

Average traffic can hide bursts and variability.

**Better approach:**

Analyze the workload distribution and variation, not only the average.

---

## Mistake 2 — Treating Every AI Workload as Interactive

Not every AI system requires immediate results.

**Better approach:**

Determine whether the consumer actually requires synchronous completion.

---

## Mistake 3 — Assuming Request Count Represents Workload Size

Ten small requests may require less computation than one very large request.

**Better approach:**

Consider request size and computational intensity.

---

## Mistake 4 — Treating Latency as the Only Performance Concern

A workload can have low latency sensitivity but very high throughput requirements.

**Better approach:**

Analyze latency sensitivity and throughput requirements separately.

---

## Mistake 5 — Assuming AI Automatically Means GPU

Some workloads may not require accelerators.

**Better approach:**

Identify the actual computational characteristics of the workload.

---

## Mistake 6 — Ignoring State

A conversational workload may depend on state across requests.

**Better approach:**

Identify what state exists and who owns it.

---

## Mistake 7 — Ignoring External Dependencies

A workload may appear simple until its external dependencies are considered.

**Better approach:**

Include dependency behavior in workload analysis.

---

## Mistake 8 — Optimizing Cost Before Understanding Requirements

A cheap architecture that fails the workload requirement is not a successful architecture.

**Better approach:**

Establish requirements first, then evaluate cost as a constraint.

---

## Mistake 9 — Assuming More Components Solve Workload Problems

Additional components can introduce:

- more interfaces,
- more dependencies,
- more coordination,
- more complexity.

**Better approach:**

Separate responsibilities only when the workload and requirements justify the boundary.

---

## Mistake 10 — Designing for a Hypothetical Future Workload

Overengineering based on imagined scale can make the current system unnecessarily complex.

**Better approach:**

Design for known requirements while keeping important future constraints visible.

---

## 33. Production Engineering Perspective

A production engineer should be able to answer:

> What does this workload look like under normal conditions?

and:

> What changes when workload conditions change?

A useful workload description includes:

```text
Work initiation
      ↓
Completion model
      ↓
Traffic pattern
      ↓
Request size
      ↓
Compute intensity
      ↓
State requirements
      ↓
Dependency behavior
      ↓
Data movement
      ↓
Resource demand
      ↓
Business requirements and constraints
```

This description becomes architectural input.

---

# 34. Architecture Review Through Workload Characteristics

When reviewing an architecture, ask:

### Interaction

- Is the workload interactive or batch?
- Is immediate completion actually required?

### Demand

- What is the expected workload volume?
- How variable is traffic?
- Are there predictable bursts?

### Request Characteristics

- How large are requests?
- How large are responses?
- Does request size vary significantly?

### Computation

- How computationally intensive is the workload?
- Does it depend on specialized accelerators?

### State

- Is processing stateless?
- What state persists?
- Who owns that state?

### Dependencies

- Which external and internal dependencies exist?
- Are they part of the request path?
- How does their behavior affect the workload?

### Data

- How much data moves?
- Where does it move?
- Which boundaries does it cross?

### Resources

- Which resources are shared?
- Which workloads compete for them?

### Business Requirements

- How sensitive is the workload to cost?
- What availability expectation exists?
- What response-time requirement exists?
- What happens if processing is delayed?

These questions expose architectural constraints before implementation begins.

---

## 35. What This Chapter Does Not Solve

This chapter identifies workload behavior and connects it to requirements, constraints, and architecture.

It does **not** deeply teach:

- containerization,
- packaging,
- runtime environments,
- model serving,
- inference server implementation,
- batching implementation,
- deployment strategies,
- CI/CD,
- observability implementation,
- SLI/SLO design,
- retries,
- backpressure,
- graceful degradation,
- failure recovery,
- autoscaling,
- capacity planning,
- load testing,
- detailed latency optimization,
- model performance benchmarking,
- security controls,
- incident response,
- AI lifecycle management.

Those concerns belong to later production engineering topics.

The purpose here is to establish the workload reasoning required before those mechanisms can be designed correctly.

---

## 36. Interview Questions

## Conceptual

### 1. Why does workload characterization matter in AI architecture?

A strong answer should explain that workload behavior creates system requirements and constraints that influence architectural decisions.

---

### 2. What is the difference between an interactive and a batch workload?

A strong answer should focus on when the consumer requires the result and how that changes processing architecture.

---

### 3. What is the difference between a workload characteristic and a system requirement?

A strong answer should explain that workload behavior describes what the system experiences, while a requirement defines what the system must satisfy under that workload.

---

### 4. Why is average traffic insufficient for architecture planning?

A strong answer should discuss variability and bursts.

---

### 5. Why should request size be considered separately from request count?

Because different requests can require substantially different amounts of processing and data movement.

---

### 6. Does every AI workload require GPU resources?

No. Resource requirements should be derived from workload characteristics and computational behavior.

---

## Scenario-Based

### 7. A document-processing system handles 2 million documents every night. Users do not wait for individual results. What workload behavior would you identify first?

Discuss:

- batch processing,
- workload volume,
- data size,
- compute intensity,
- predictability,
- data movement,
- resource demand.

Then derive the requirements and constraints.

---

### 8. A customer-facing chatbot suddenly receives 10× its normal traffic during a marketing campaign. Which workload characteristics have changed?

Discuss:

- traffic volume,
- traffic variability,
- resource demand,
- latency sensitivity,
- resource contention.

Do not jump directly to an autoscaling solution. First characterize the workload change.

---

### 9. A system has low request volume but each request contains a very large document and requires expensive model processing. Is this necessarily a low-intensity workload?

No.

Request count alone does not determine workload intensity.

---

### 10. Two AI systems use the same model but have completely different architectures. Is that necessarily a problem?

No.

Different workload characteristics and requirements can legitimately require different architectural designs.

---

## 37. Architecture Exercise

Consider this workload:

> An enterprise receives 200,000 documents every evening. Each document must be classified and summarized. Processing can take several hours. Users do not require immediate results. Documents vary significantly in size. The organization wants to control processing cost.

Before designing the architecture, produce a workload profile.

Identify:

1. Interaction model.
2. Completion model.
3. Workload volume and arrival pattern.
4. Traffic predictability.
5. Request/data size.
6. Compute intensity.
7. State requirements.
8. Dependency characteristics.
9. Data movement.
10. Resource demand.
11. Cost constraint.
12. Availability expectation.

Then answer:

> **What requirements and architectural consequences follow from these workload characteristics?**

Do not begin by naming technologies.

Start with workload reasoning.

---

## 38. Engineering Decision Exercise

Compare these two workloads:

### Workload A

```text
Interactive
High latency sensitivity
Variable traffic
Small requests
Stateful
Model-dependent
```

### Workload B

```text
Batch
Large data volume
Predictable schedule
Large inputs
Lower latency sensitivity
High workload volume
```

Answer:

1. Which workload behaviors are fundamentally different?
2. Which requirements would likely differ?
3. Which architectural consequences would likely differ?
4. Which responsibilities might reasonably have different boundaries?
5. Which trade-offs would be different?
6. Which architectural decisions should **not** be made solely from these characteristics?

The objective is not to produce one “correct architecture.”

The objective is to demonstrate workload-driven reasoning.

---

# 39. Quick Revision

## What is a workload?

The pattern of work a production system must perform under real operating conditions.

## What is workload behavior?

The observable way work arrives, is processed, and interacts with system resources and dependencies.

Examples include:

- interaction pattern,
- request size,
- traffic volume,
- traffic variability,
- compute intensity,
- statefulness,
- dependency behavior,
- data movement,
- resource demand.

## What are requirements and constraints?

They describe what the system must satisfy or what limits it must operate within.

Examples include:

- response-time requirement,
- throughput requirement,
- availability expectation,
- cost constraint,
- resource constraints.

## What is the central reasoning model?

```text
Workload Behavior
        ↓
Requirement / Constraint
        ↓
Architecture
        ↓
Trade-off
```

## What is the most important architectural lesson?

> **Do not design an AI system only around the model. Design it around the workload the system must serve and the requirements that workload creates.**

---

# 40. Key Takeaways

1. An AI model is only one part of a production workload.
2. Workload behavior provides architectural input.
3. Workload characteristics should be distinguished from derived system requirements and constraints.
4. Interactive and batch workloads create different requirements.
5. Synchronous versus asynchronous processing should follow consumer needs.
6. Latency sensitivity and latency targets are related but not identical.
7. Throughput describes the amount or rate of work that must be processed; the required throughput is a system requirement.
8. Average traffic can hide important variability and bursts.
9. Request size can matter as much as request count.
10. Compute intensity determines the nature of resource requirements.
11. Accelerator dependence can influence architecture but does not automatically require service separation.
12. Stateful workloads require explicit state ownership.
13. External dependencies are part of workload behavior.
14. Cost sensitivity should be treated as a business/economic constraint associated with the workload.
15. Availability expectation should be derived from workload role and business criticality.
16. Data movement and resource demand are architectural concerns.
17. Resource contention emerges when multiple workloads compete for shared resources.
18. Workload characteristics interact; they should not be analyzed only in isolation.
19. Architecture should be justified through workload evidence and derived requirements.
20. More components do not automatically produce a better architecture.
21. Workload analysis should precede technology selection.
22. The core engineering chain is:

```text
Workload Behavior
        ↓
Requirement / Constraint
        ↓
Architecture
        ↓
Trade-off
```

---

# 41. Completion of PROD-01

The three files in PROD-01 now establish a complete progression:

```text
┌──────────────────────────────────────────────┐
│ File 01                                      │
│ Production AI Problem & Boundaries           │
│                                              │
│ What problem exists?                         │
│ What responsibilities exist?                 │
│ Where are the boundaries?                    │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ File 02                                      │
│ System Architecture & Service Boundaries     │
│                                              │
│ How should responsibilities be represented?  │
│ How should components interact?              │
│ Where should architectural boundaries exist? │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ File 03                                      │
│ Workload Characteristics & Trade-offs        │
│                                              │
│ What workload must the architecture serve?   │
│ What requirements does it create?            │
│ What trade-offs follow?                      │
└──────────────────────────────────────────────┘
```

The central PROD-01 reasoning model is therefore:

```text
Production Problem
        ↓
Responsibilities & Boundaries
        ↓
Architecture
        ↓
Workload Behavior
        ↓
Requirements & Constraints
        ↓
Architectural Trade-offs
```

---

# Next Chapter

PROD-01 establishes the foundations for reasoning about production AI systems.

The next production engineering topic should build on these foundations by addressing the mechanisms required to make production AI systems reproducible, portable, and operationally consistent.

Continue according to the approved PROD curriculum sequence.
