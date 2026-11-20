# Model Routing and Serving Architecture

## Learning Objectives

By the end of this document, you should be able to:

- Explain why production AI systems may need multiple serving targets.
- Distinguish model serving from model routing.
- Define a serving target independently from the underlying model.
- Explain how routing decisions can be based on capability, request type, model version, latency requirements, cost, and resource requirements.
- Distinguish model routing from load balancing and reliability fallback.
- Compare embedded inference, dedicated model services, specialized serving services, and external AI providers.
- Explain the trade-offs between shared and dedicated serving.
- Compare centralized and distributed routing.
- Explain how model-version routing differs from deployment and release management.
- Design a serving architecture appropriate for a given workload.
- Identify the boundaries between routing, serving, deployment, reliability, capacity, and performance engineering.

---

## Prerequisites

You should already understand:

- Production inference and model serving.
- Serving interfaces and request/response inference.
- Model loading and serving lifecycle.
- Concurrency, queues, scheduling, batching, and streaming.
- The distinction between an application and the inference capability it consumes.

These concepts are established in the earlier PROD-03 files.

---

## Estimated Reading Time

**30–40 minutes**

---

## 1. Before We Start

A production AI system rarely consists of only:

```text
Application
    |
    v
Model
```

Real systems may have:

- multiple models,
- multiple model versions,
- specialized models,
- different inference services,
- different resource requirements,
- internal and external serving options,
- different latency or cost requirements.

The application therefore needs a way to determine **where an inference request should be served**.

That is the purpose of model routing.

The central question of this document is:

> **Given an inference request, which serving target should handle it, and what serving architecture should support that decision?**

This document focuses on the architecture around that decision.

It does not turn routing into a generic API gateway, deployment, reliability, capacity-planning, or performance-optimization topic.

---

# 2. Model Serving vs Model Routing

Model serving and model routing are related, but they solve different problems.

### Model serving

Model serving is responsible for executing inference for a request.

Conceptually:

```text
Request
   |
   v
Serving Runtime
   |
   v
Model Execution
   |
   v
Response
```

### Model routing

Model routing is responsible for selecting the serving target that should handle the request.

Conceptually:

```text
Request
   |
   v
Router
   |
   +----> Serving Target A
   |
   +----> Serving Target B
   |
   +----> Serving Target C
```

The distinction is:

```text
Routing
    |
    v
Select the target

Serving
    |
    v
Execute inference
```

A router therefore does not replace the serving system.

It determines which serving system should receive the request.

---

# 3. What Is a Serving Target?

A **serving target** is the concrete inference destination selected for a request.

Depending on the architecture, a serving target could represent:

- a model,
- a particular model version,
- a specialized inference service,
- a serving instance or pool,
- an internal model service,
- an external AI provider.

This distinction is useful because the routing decision is often not simply:

> Which model?

It may instead be:

> Which model version, service, resource pool, or provider should handle this request?

For example:

```text
Request
   |
   v
Router
   |
   +----> Small Model / Version 3
   |
   +----> Large Model / Version 2
   |
   +----> Specialized Extraction Service
   |
   +----> External AI Provider
```

The serving target is therefore an architectural abstraction above the individual model artifact.

---

# 4. Why Multiple Serving Targets Exist

A production system may have multiple serving targets because different requests may have different requirements.

Examples include:

- simple requests that do not require the largest model,
- complex requests that require a more capable model,
- different model versions,
- specialized workloads,
- latency-sensitive workloads,
- cost-sensitive workloads,
- workloads with different resource requirements,
- internal inference and external provider options.

Consider a document-processing system.

A simple classification request might be suitable for a smaller model:

```text
Classification Request
        |
        v
    Small Model
```

A complex reasoning request may require a more capable target:

```text
Reasoning Request
        |
        v
    Large Model
```

Using the same serving target for both requests may be possible, but it may not be the best architecture.

---

# 5. Routing Mental Model

The basic routing model is:

```text
                         Request
                            |
                            v
                         Router
                            |
              +-------------+-------------+
              |             |             |
              v             v             v
          Target A       Target B      Target C
              |             |             |
              v             v             v
          Serving A      Serving B     Serving C
```

The router evaluates characteristics of the request and the available serving targets.

It then selects an appropriate target.

The important point is that routing is a **selection problem**.

It is not inherently:

- a deployment mechanism,
- a retry mechanism,
- an autoscaling mechanism,
- a performance optimizer,
- an API gateway,
- or a reliability fallback system.

Those concerns may interact with routing, but they remain separate engineering responsibilities.

---

# 6. What Can Influence a Routing Decision?

Routing decisions can consider several dimensions.

## 6.1 Capability

Different models may have different capabilities.

For example:

```text
Simple classification
        |
        v
Model A

Complex reasoning
        |
        v
Model B
```

The router may select a target capable of handling the requested task.

---

## 6.2 Request Type

Different request classes may require different serving targets.

For example:

```text
Request Type
     |
     +---- Classification → Target A
     |
     +---- Extraction     → Target B
     |
     +---- Generation     → Target C
```

The routing policy therefore depends partly on what the request is asking the system to do.

---

## 6.3 Model Version

A system may serve multiple versions simultaneously.

For example:

```text
Model
 |
 +---- Version 1
 |
 +---- Version 2
 |
 +---- Version 3
```

A router may select among these versions based on the request or the current serving policy.

However:

> **Version routing is not deployment.**

Routing answers:

> Which version should receive this request?

Deployment and release engineering answer:

> How is that version introduced, promoted, monitored, and eventually retired?

Those responsibilities belong to the deployment/release domain.

---

## 6.4 Latency Requirements

Different targets may have different latency characteristics.

For example:

```text
Latency-sensitive request
        |
        v
Lower-latency target

Latency-tolerant request
        |
        v
Higher-capability target
```

Latency can therefore be a routing input.

However, routing based on latency should not be confused with detailed latency optimization.

Detailed performance engineering belongs to PROD-08.

---

## 6.5 Cost

Different serving targets may have different costs.

A system may therefore route simpler workloads to lower-cost targets while reserving more expensive targets for workloads that justify them.

For example:

```text
Simple request
      |
      v
Lower-cost target

Complex request
      |
      v
Higher-cost target
```

Cost-aware routing is therefore an architectural decision.

It is not, by itself, a complete cost-optimization strategy.

---

## 6.6 Resource Requirements

Different models may require different resources.

For example:

```text
Small model
    |
    v
Lower resource requirement

Large model
    |
    v
Higher resource requirement
```

A router may therefore select a target that is appropriate for the resource characteristics of the request.

This does not mean routing performs capacity planning.

The distinction is:

```text
PROD-03
Which suitable serving target should handle this request?

PROD-07
How much serving capacity does the system need?
```

---

# 7. Routing Decision Example

Consider an AI application supporting three request types:

```text
                     Request
                        |
                        v
                     Router
                        |
        +---------------+---------------+
        |               |               |
        v               v               v
   Simple Task      Complex Task    Specialized Task
        |               |               |
        v               v               v
    Small Model      Large Model    Specialist Model
```

The routing decision may consider:

1. What type of task is being requested?
2. Which targets support that capability?
3. Which model version should be used?
4. What latency requirement exists?
5. What resource characteristics apply?
6. What cost constraints exist?

The router selects the target.

The selected serving system then performs inference.

---

# 8. Routing vs Reliability Fallback

Routing and fallback are frequently confused.

They are not the same operation.

### Routing

Routing answers:

> Which target should normally handle this request?

```text
Request
   |
   v
Router
   |
   v
Preferred Target
```

### Fallback

Fallback answers:

> What should happen when the preferred path cannot successfully serve the request?

```text
Preferred Target
       |
       | failure
       v
Fallback Behavior
```

For example:

```text
Request
   |
   v
Router
   |
   v
Primary Target
   |
   | unavailable
   v
Fallback Target
```

The selection of the primary target is routing.

The strategy for handling failure of that path is reliability engineering.

Detailed fallback strategy belongs to **PROD-06**.

---

# 9. Routing vs Load Balancing

Routing and load balancing can overlap, but they are not identical.

### Load balancing

Load balancing generally distributes requests among suitable or equivalent targets.

```text
              Request
                 |
                 v
           Load Balancer
             /    |    \
            v     v     v
        Target A B     C
```

The targets are often intended to provide substantially similar functionality.

### Model routing

Model routing may select among targets that have materially different characteristics.

```text
              Request
                 |
                 v
              Router
             /   |   \
            v    v    v
       Small   Large  Specialist
       Model   Model    Model
```

The key distinction is:

```text
Load balancing
→ How should work be distributed among suitable targets?

Model routing
→ Which serving target is appropriate for this request?
```

A production system can use both.

For example:

```text
Request
   |
   v
Model Router
   |
   v
Large Model Service
   |
   v
Load Balancer
   |
   +----> Replica A
   +----> Replica B
   +----> Replica C
```

The model router selects the service.

The load-balancing layer distributes work within that serving architecture.

Detailed load-balancing algorithms are outside the scope of this chapter.

---

# 10. Model Routing vs API Gateway

An API gateway may provide capabilities such as:

- authentication,
- API management,
- request controls,
- traffic policies,
- protocol handling.

Model routing has a narrower responsibility:

> Select the appropriate AI serving target for an inference request.

An API gateway and a model router may coexist:

```text
Client
   |
   v
API Gateway
   |
   v
Model Router
   |
   v
Serving Target
```

This document does not cover API gateway architecture in detail.

---

# 11. Serving Architecture Patterns

There is no single correct architecture for every AI workload.

The appropriate pattern depends on:

- workload characteristics,
- model requirements,
- isolation requirements,
- operational complexity,
- resource usage,
- latency requirements,
- number of models,
- organizational boundaries.

The major patterns are described below.

---

## 12. Embedded Inference

In embedded inference, the model executes inside the application process or application runtime.

```text
Application
    |
    +---- Model
    |
    +---- Inference
```

### Advantages

- simple deployment topology,
- low network overhead,
- straightforward request flow,
- useful for small models and tightly coupled workloads.

### Disadvantages

- application and model lifecycle become coupled,
- model resource requirements affect the application,
- independent scaling becomes difficult,
- multiple applications may duplicate model resources.

Embedded inference can therefore be appropriate for smaller or tightly coupled workloads but becomes less attractive when model serving needs independent operational control.

---

# 13. Dedicated Model Service

In a dedicated model-service architecture, model inference runs as a separate service.

```text
Application
      |
      v
Model Service
      |
      v
Model
```

### Advantages

- independent model lifecycle,
- independent scaling,
- model resources can be isolated,
- multiple applications can consume the same service.

### Disadvantages

- network communication is introduced,
- another operational component exists,
- service availability becomes important,
- resource management becomes more complex.

This pattern is common when model serving needs to be treated as an independently managed capability.

---

# 14. Multiple Specialized Serving Services

A system may operate multiple serving services, each responsible for a different capability.

```text
                    Application
                        |
                        v
                      Router
                        |
          +-------------+-------------+
          |             |             |
          v             v             v
    Classification   Generation    Embedding
       Service         Service       Service
```

This can provide clearer ownership and resource isolation.

However, it also introduces:

- more services,
- more interfaces,
- more routing decisions,
- more operational complexity.

The architectural benefit must therefore justify the additional complexity.

---

# 15. External AI Provider

A serving target does not necessarily have to be operated internally.

An application may route requests to an external AI provider.

```text
Application
      |
      v
Router
      |
      +----> Internal Model Service
      |
      +----> External AI Provider
```

This can reduce the amount of model infrastructure the organization operates.

However, the architecture still needs to consider:

- provider availability,
- request latency,
- cost,
- data handling,
- model capabilities,
- interface compatibility,
- provider-specific constraints.

Using an external provider therefore does not eliminate serving architecture concerns.

It changes where the serving responsibility resides.

---

# 16. Shared vs Dedicated Serving

Another important architectural decision is whether multiple workloads share serving resources.

### Shared serving

```text
                 Serving Pool
                /     |      \
               v      v       v
           Model A  Model B  Model C
```

### Dedicated serving

```text
Model A → Serving Pool A

Model B → Serving Pool B

Model C → Serving Pool C
```

### Shared serving can provide

- better resource utilization,
- fewer operational components,
- simpler infrastructure topology.

### Shared serving can also create

- resource contention,
- workload interference,
- more complex isolation requirements,
- coupled operational behavior.

### Dedicated serving can provide

- stronger isolation,
- clearer resource ownership,
- workload-specific tuning opportunities.

### Dedicated serving can also create

- duplicated resources,
- more operational components,
- potentially lower overall utilization.

The correct choice depends on workload characteristics rather than a universal preference.

---

# 17. Centralized vs Distributed Routing

Routing policy can also be centralized or distributed.

### Centralized routing

```text
Applications
     |
     v
Central Router
     |
  +--+--+--+
  |  |  |  |
  v  v  v  v
 T1 T2 T3 T4
```

Advantages may include:

- consistent routing policy,
- centralized decision logic,
- easier visibility into routing rules,
- a single place to evolve routing behavior.

Trade-offs include:

- central dependency,
- potential bottleneck,
- broader blast radius for routing failures,
- coupling between applications and the router.

### Distributed routing

```text
Application A → Local Router → Targets

Application B → Local Router → Targets

Application C → Local Router → Targets
```

Advantages may include:

- reduced dependence on one central component,
- local decision-making,
- potentially lower routing latency.

Trade-offs include:

- policy duplication,
- configuration consistency challenges,
- more complex governance,
- harder centralized control.

Neither architecture is universally superior.

The decision depends on organizational and workload requirements.

---

# 18. Serving Architecture Comparison

| Architecture | Main Strength | Main Trade-off | Suitable When |
|---|---|---|---|
| Embedded inference | Simplicity | Tight coupling | Small or tightly coupled workloads |
| Dedicated model service | Independent serving lifecycle | Additional service complexity | Shared or independently managed models |
| Specialized services | Clear workload separation | More components | Multiple distinct AI capabilities |
| External provider | Reduced infrastructure ownership | External dependency | Provider capabilities justify external operation |
| Shared serving | Resource efficiency | Contention/isolation concerns | Workloads can safely share resources |
| Dedicated serving | Isolation | Resource duplication | Strong isolation or workload-specific requirements |
| Centralized routing | Consistent policy | Central dependency | Central governance is valuable |
| Distributed routing | Local autonomy | Policy consistency complexity | Local decision-making is important |

These are architectural patterns, not mutually exclusive choices.

A production system may combine them.

For example:

```text
                         Application
                              |
                              v
                        Central Router
                         /          \
                        v            v
               Internal Service   External Provider
                    |
                    v
                Load Balancer
                 /        \
                v          v
             Replica A   Replica B
```

The important engineering task is understanding the responsibility of each layer.

---

# 19. Model Version Routing

Serving multiple model versions can be useful for:

- compatibility,
- controlled traffic allocation,
- workload-specific selection,
- gradual introduction of a new version,
- maintaining support for different consumers.

Conceptually:

```text
                Request
                   |
                   v
                 Router
                   |
          +--------+--------+
          |        |        |
          v        v        v
       v1.0      v1.1      v2.0
```

The router determines which version receives a particular request.

However, this must be separated from release management.

```text
Version Routing
→ Which version handles this request?

Deployment / Release
→ How is the version introduced, promoted, validated, and retired?
```

Therefore:

> Routing can participate in a release strategy, but routing itself is not the release strategy.

Deployment and release engineering belong to **PROD-04**.

---

# 20. AI-Specific Serving Architecture Considerations

AI serving introduces characteristics that influence architecture decisions.

## 20.1 Model Memory Requirements

Different models may have dramatically different memory requirements.

```text
Small Model
    |
    v
Smaller Resource Requirement

Large Model
    |
    v
Larger Resource Requirement
```

This can influence whether models should share infrastructure or use dedicated serving targets.

---

## 20.2 Model Loading Time

Large models may take significant time and resources to load.

This affects serving architecture because repeatedly loading a model may be undesirable.

The serving architecture therefore needs to consider whether model instances remain available for inference and how model lifecycle is managed.

Detailed deployment startup strategies belong to PROD-04.

---

## 20.3 Variable Inference Duration

AI requests may have substantially different execution times.

For example:

```text
Request A → short inference
Request B → medium inference
Request C → long inference
```

This can influence architecture decisions around:

- target selection,
- workload separation,
- serving isolation,
- request handling.

Detailed concurrency and scheduling behavior is covered in Lesson 02.

---

## 20.4 Variable Generation Size

Generative workloads may produce outputs of different sizes.

```text
Request A → short output

Request B → long output
```

This can influence the suitability of different serving targets and workload groupings.

Detailed generation performance optimization belongs to PROD-08.

---

## 20.5 Multiple Model Versions

Production systems may need to operate multiple model versions simultaneously.

This creates architectural questions such as:

- Which requests use which version?
- Can different consumers require different versions?
- How long must older versions remain available?
- Does the serving architecture support simultaneous versions?

The routing architecture should answer the **target-selection** part of these questions.

Release management remains a separate responsibility.

---

## 20.6 External Providers

External providers introduce another class of serving target.

The architecture may therefore contain:

```text
                    Router
                   /      \
                  v        v
          Internal Model   External Provider
             Service
```

This creates architectural considerations around:

- interface compatibility,
- latency,
- cost,
- data boundaries,
- provider dependency,
- model capability.

Reliability handling for provider failure belongs to PROD-06.

---

# 21. Routing Architecture Example

Consider an enterprise application with three inference requirements:

- lightweight classification,
- complex generation,
- document embeddings.

A possible architecture is:

```text
                         Application
                              |
                              v
                           Router
                              |
             +----------------+----------------+
             |                |                |
             v                v                v
      Classification     Generation       Embedding
         Service           Service          Service
             |                |                |
             v                v                v
        Small Model       Large Model     Embedding Model
```

The router selects the target based on the request capability.

Each serving service can then have its own serving runtime and serving topology.

The router does not need to know how inference is internally executed.

This separation helps preserve service boundaries.

---

# 22. Example: Multi-Model Document System

Imagine a document-processing system that performs:

1. classification,
2. extraction,
3. summarization.

A naive architecture might use one large model for everything:

```text
Every Request
      |
      v
Large Model
```

A more specialized architecture could route requests based on capability:

```text
                    Document Request
                           |
                           v
                         Router
                           |
          +----------------+----------------+
          |                |                |
          v                v                v
   Classification      Extraction      Summarization
       Model              Model            Model
```

The advantage is not simply "more models."

The advantage is that each workload can have a serving target appropriate to its requirements.

The trade-off is additional architectural and operational complexity.

---

# 23. Example: Internal Model vs External Provider

Suppose an organization operates an internal model but also uses an external provider for certain workloads.

```text
                         Request
                            |
                            v
                          Router
                         /      \
                        /        \
                       v          v
              Internal Model   External Provider
                  Service
```

The routing decision could depend on:

- required capability,
- latency requirements,
- data restrictions,
- cost,
- model availability.

The architecture therefore treats internal and external inference as different serving targets.

The reliability implications of provider failure are handled separately by PROD-06.

---

# 24. Architecture Decision Framework

When selecting a serving architecture, ask:

### Question 1 — How many inference capabilities exist?

One model may not justify a complex routing architecture.

Multiple specialized capabilities may.

### Question 2 — Do workloads have materially different resource requirements?

If they do, isolation may become valuable.

### Question 3 — Do workloads require independent lifecycle management?

If yes, separate serving targets may be appropriate.

### Question 4 — Do requests require different models or versions?

If yes, routing may be required.

### Question 5 — Are internal and external serving targets both possible?

If yes, the router may need to treat them as distinct targets.

### Question 6 — Is centralized policy valuable?

If yes, centralized routing may be appropriate.

### Question 7 — Is local autonomy more important?

If yes, distributed routing may be preferable.

### Question 8 — Is the additional architecture justified?

Every additional router, service, target, and policy increases operational complexity.

The final question should always be:

> **Does the architectural benefit justify the additional complexity?**

---

## 25. Engineering Decisions and Trade-offs

The following decisions should be made explicitly rather than implicitly.

## Decision: Embedded vs Dedicated

Choose embedded inference when simplicity and tight coupling are acceptable.

Choose dedicated serving when independent lifecycle, resource isolation, or shared consumption justifies another service boundary.

---

## Decision: Shared vs Dedicated Serving

Choose shared serving when workloads can safely share resources and operational simplicity is valuable.

Choose dedicated serving when isolation or workload-specific requirements justify resource separation.

---

## Decision: Centralized vs Distributed Routing

Choose centralized routing when consistent policy and centralized governance are important.

Choose distributed routing when local autonomy and reduced central dependency are more important.

---

## Decision: Internal vs External Serving

Choose internal serving when organizational control, data boundaries, or internal capabilities justify operating the infrastructure.

Choose external serving when provider capabilities and reduced infrastructure ownership justify the external dependency.

---

## Decision: Single vs Multiple Models

Do not create multiple serving targets merely because multiple models exist.

Create separate serving boundaries when the models have meaningful differences in:

- capability,
- resource requirements,
- lifecycle,
- ownership,
- workload characteristics,
- isolation requirements.

---

## 26. Production Perspective

A production serving architecture should make the following relationships clear:

```text
Application
    |
    v
Inference Request
    |
    v
Routing Decision
    |
    v
Serving Target
    |
    v
Serving Runtime
    |
    v
Model Execution
    |
    v
Response
```

Around this path, other production engineering domains provide supporting capabilities:

```text
                         Application
                              |
                              v
                     Inference Request
                              |
                              v
                           Router
                              |
                    +---------+---------+
                    |         |         |
                    v         v         v
                Target A   Target B   Target C
                    |
                    v
                 Serving
                    |
                    v
                 Inference
```

The surrounding production concerns are intentionally separated:

- **PROD-02** — packaging, dependencies, configuration, runtime contracts, and artifacts
- **PROD-04** — deployment, release, promotion, and infrastructure delivery
- **PROD-05** — observability and telemetry
- **PROD-06** — reliability, failure handling, fallback, and graceful degradation
- **PROD-07** — capacity planning and scaling
- **PROD-08** — detailed performance and cost optimization

PROD-03 connects these concerns through the serving architecture but does not own them.

---

# 27. What This Chapter Does Not Cover

This document intentionally does not provide detailed treatment of:

- application packaging,
- dependency management,
- containers,
- deployment pipelines,
- release promotion,
- infrastructure provisioning,
- progressive delivery,
- rollback engineering,
- observability architecture,
- telemetry design,
- retry strategy,
- timeout strategy,
- reliability backpressure,
- graceful degradation,
- fallback strategy,
- capacity planning,
- autoscaling,
- demand forecasting,
- GPU capacity planning,
- detailed inference optimization,
- benchmarking,
- cost-performance optimization,
- advanced routing algorithms,
- API gateway architecture.

These concerns belong to other parts of the curriculum.

---

## 28. Common Mistakes and Misconceptions

## Mistake 1 — Treating routing and serving as the same thing

Routing selects the target.

Serving executes inference.

---

## Mistake 2 — Assuming every model needs its own service

Multiple models can sometimes share a serving architecture.

Service boundaries should be justified by workload and operational requirements.

---

## Mistake 3 — Assuming multiple models automatically require a router

A system may use multiple models internally without exposing a routing layer.

Routing becomes valuable when target selection is an explicit architectural concern.

---

## Mistake 4 — Treating routing as fallback

Routing selects a target under normal operation.

Fallback handles failure or inability to use the preferred path.

---

## Mistake 5 — Treating routing as load balancing

Load balancing generally distributes work among suitable targets.

Model routing may select among materially different targets.

---

## Mistake 6 — Assuming centralized routing is always better

Centralization improves policy consistency but creates a central dependency.

---

## Mistake 7 — Assuming distributed routing is always more scalable

Distributed routing can reduce central dependency but increases policy and governance complexity.

---

## Mistake 8 — Sending every request to the most capable model

The most capable model may not be the most appropriate target for every workload.

Capability must be balanced against requirements such as latency, cost, and resource needs.

---

## Mistake 9 — Sending every request to the cheapest model

The cheapest model may not provide the required capability or quality.

Cost is one routing factor, not the only factor.

---

## Mistake 10 — Assuming external providers eliminate serving architecture concerns

An external provider is still a serving target.

The architecture must still define how requests reach and interact with it.

---

## Mistake 11 — Treating model-version routing as deployment

Routing determines which version receives a request.

Deployment determines how a version is introduced and managed in the production environment.

---

## Mistake 12 — Putting all AI logic into the router

A router should primarily make target-selection decisions.

It should not become an unbounded container for application logic, business logic, model execution, and reliability policy.

---

## Mistake 13 — Confusing resource availability with capacity planning

A router may consider whether a suitable serving target is available.

Capacity engineering determines how much capacity the overall system requires and how that capacity is provisioned or scaled.

---

## Mistake 14 — Assuming more serving targets automatically improve architecture

More targets can improve specialization and isolation.

They can also increase:

- operational complexity,
- routing complexity,
- resource fragmentation,
- monitoring requirements,
- governance requirements.

Architecture quality depends on whether the additional boundaries solve meaningful problems.

---

## 29. Interview Questions and Expected Answers

### 1. What is the difference between model serving and model routing?

Model serving executes inference. Model routing selects which serving target should execute the inference.

---

### 2. What is a serving target?

A serving target is the concrete inference destination selected for a request, such as a model version, specialized service, serving pool, or external provider.

---

### 3. Why might a production system need multiple serving targets?

Different workloads may have different capability, latency, cost, resource, version, or isolation requirements.

---

### 4. What factors can influence routing?

Capability, request type, model version, latency requirements, cost, resource requirements, and serving-target characteristics.

---

### 5. What is the difference between routing and fallback?

Routing selects the target under normal operation. Fallback defines what happens when the preferred path cannot successfully serve the request.

---

### 6. What is the difference between model routing and load balancing?

Load balancing generally distributes requests among suitable targets. Model routing selects among potentially different inference targets.

---

### 7. Can a system use both routing and load balancing?

Yes. Routing can select a model service, while load balancing can distribute requests across replicas of that service.

---

### 8. What are the advantages of embedded inference?

Simplicity, low network overhead, and tight integration with the application.

---

### 9. What is the main advantage of a dedicated model service?

It allows model serving to have an independent lifecycle and resource boundary.

---

### 10. Why might multiple specialized serving services be useful?

They can separate workloads with different capabilities, resource requirements, ownership, or operational characteristics.

---

### 11. When might shared serving be preferable?

When workloads can safely share resources and resource efficiency and operational simplicity are important.

---

### 12. When might dedicated serving be preferable?

When stronger isolation, independent lifecycle management, or workload-specific requirements justify separate serving resources.

---

### 13. What is the trade-off of centralized routing?

It can provide consistent policy and governance but introduces a central dependency and potentially a larger blast radius.

---

### 14. What is the trade-off of distributed routing?

It can provide local autonomy but introduces policy-consistency and governance challenges.

---

### 15. Does every multiple-model system require a router?

No. Multiple models do not automatically imply an explicit routing layer.

---

### 16. Should every request go to the most capable model?

No. The appropriate target depends on the workload's requirements, including capability, latency, cost, and resource needs.

---

### 17. Is model-version routing the same as deployment?

No. Routing selects which version receives a request. Deployment introduces and manages that version in the production environment.

---

### 18. Can an external AI provider be a serving target?

Yes. An external provider can be treated as a serving target within the application's serving architecture.

---

### 19. Why might a large model require a dedicated serving architecture?

Its resource requirements, loading behavior, and workload characteristics may make shared serving inappropriate.

---

### 20. What should a model router not become?

It should not become an unbounded container for application logic, model execution, deployment logic, or reliability policy.

---

## 30. Quick Revision

Remember these distinctions:

```text
Serving
→ Execute inference

Routing
→ Select the serving target

Load balancing
→ Distribute work among suitable targets

Fallback
→ Handle failure of the preferred path

Deployment
→ Introduce and manage versions in production

Capacity
→ Determine and provide required serving capacity

Performance optimization
→ Improve latency, throughput, resource efficiency, or cost
```

The central production flow is:

```text
Request
   |
   v
Routing Decision
   |
   v
Serving Target
   |
   v
Inference Execution
   |
   v
Response
```

---

# 31. Key Takeaways

1. Model serving and model routing solve different problems.
2. A serving target can represent a model, model version, specialized service, serving pool, or external provider.
3. Multiple serving targets may exist because workloads have different requirements.
4. Routing can consider capability, request type, version, latency, cost, and resource requirements.
5. Routing is not the same as reliability fallback.
6. Routing is not the same as load balancing.
7. Routing and load balancing can coexist in the same architecture.
8. Embedded inference provides simplicity but couples application and model lifecycle.
9. Dedicated model services provide independent serving boundaries at the cost of additional complexity.
10. Shared serving improves potential resource efficiency but can introduce contention and isolation concerns.
11. Dedicated serving improves isolation but may duplicate resources.
12. Centralized routing improves consistency but introduces central dependency.
13. Distributed routing improves local autonomy but increases policy-consistency complexity.
14. External providers can be serving targets without eliminating serving architecture concerns.
15. Model-version routing is distinct from deployment and release engineering.
16. More serving targets do not automatically produce a better architecture.
17. The correct serving architecture is determined by workload requirements and engineering trade-offs.

The most important question is:

> **What serving target should handle this request, and why is that target appropriate for the workload?**

---

## 32. Further Reading

For deeper understanding, revisit:

- **PROD-03 — Production Inference and Model Serving**
- **PROD-03 — Concurrency, Queues, Batching and Streaming**
- **PROD-02 — Production AI Application Packaging and Runtime**
- **PROD-04 — Production Deployment and Release Engineering**
- **PROD-06 — Production AI Reliability**
- **PROD-07 — Production AI Capacity and Scaling**
- **PROD-08 — Production AI Performance and Optimization**

These topics should be treated as connected engineering domains rather than independent technologies.

---
