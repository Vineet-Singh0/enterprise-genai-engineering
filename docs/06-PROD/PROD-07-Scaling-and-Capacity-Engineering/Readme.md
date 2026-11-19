# PROD-07 — Scaling and Capacity Engineering

## Purpose

Production AI systems must handle changing workload demand without becoming unavailable, excessively slow, or unnecessarily expensive.

This chapter develops the engineering reasoning required to determine:

- how much capacity an AI workload requires,
- which resources limit that capacity,
- how capacity should change as demand changes,
- how concurrency and queues affect capacity,
- how autoscaling should respond to workload conditions,
- how GPU and accelerator resources affect capacity,
- and how to validate scaling behavior before and during production operation.

The central engineering question is:

> **How much capacity does this production AI system need, how should that capacity change with demand, and how do we know the scaling strategy will work before and during real production load?**

This chapter treats capacity and scaling as engineering problems rather than infrastructure configuration exercises.

---

## Learning Path

PROD-07 is organized into three lessons.

### 01 — AI Capacity Planning and Scaling Models

[01 — AI Capacity Planning and Scaling Models](./01-AI-Capacity-Planning-and-Scaling-Models.md)

Covers:

- capacity fundamentals,
- demand modeling,
- workload characteristics,
- request rate,
- concurrency,
- request size,
- processing time,
- throughput,
- utilization,
- saturation,
- headroom,
- capacity units,
- capacity estimation,
- resource sizing,
- horizontal and vertical scaling,
- scale-up and scale-out,
- workload-dependent scaling,
- assumptions,
- engineering trade-offs.

**Primary question:**  
How do we estimate how much capacity a production AI workload requires and choose an appropriate scaling model?

### 02 — Autoscaling, Capacity, Concurrency, Queues, and GPU Resources

[02 — Autoscaling, Capacity, Concurrency, Queues, and GPU Resources](./02-Autoscaling-Capacity-Concurrency-Queues-and-GPU-Resources.md)

Covers:

- autoscaling fundamentals,
- scaling signals,
- target-based scaling,
- concurrency-based scaling,
- request-rate scaling,
- queue-based scaling,
- custom and external metrics,
- scaling control loops,
- scaling delays,
- warm and cold capacity,
- minimum and maximum capacity,
- scale-to-zero considerations,
- concurrency limits,
- in-flight work,
- resource contention,
- queue depth,
- queue capacity,
- worker capacity,
- GPU compute,
- GPU memory,
- accelerator allocation,
- multi-GPU considerations,
- resource fragmentation.

**Primary question:**  
How do production AI systems dynamically adjust capacity while managing concurrency, queues, and resource constraints?

### 03 — Load Testing, Burst Traffic, and Scaling Failure

[03 — Load Testing, Burst Traffic, and Scaling Failure](./03-Load-Testing-Burst-Traffic-and-Scaling-Failure.md)

Covers:

- load testing,
- capacity testing,
- stress testing,
- burst and spike testing,
- endurance testing,
- concurrency testing,
- saturation testing,
- autoscaling validation,
- scaling delay,
- cold starts,
- queue growth,
- resource exhaustion,
- bottlenecks,
- under-scaling,
- over-scaling,
- oscillation,
- dependency constraints,
- scaling failure analysis.

**Primary question:**  
How do we prove that a scaling strategy can handle real workload behavior, including bursts and failure conditions?

---

## Core Mental Model

PROD-07 uses the following mental model throughout the chapter:

```text
Production Demand
        │
        ▼
Workload Characteristics
(Request Rate, Concurrency, Request Size)
        │
        ▼
Capacity Model
        │
        ▼
Resource Requirements
(CPU, Memory, GPU, Network, Storage)
        │
        ▼
Scaling Strategy
(Horizontal, Vertical, Autoscaling)
        │
        ▼
Capacity Validation
        │
        ▼
Production Readiness
```

The key distinction is:

> **Capacity determines how much workload the system can handle. Scaling determines how available capacity changes as workload demand changes.**

The chapter therefore progresses from:

**Capacity Estimation → Dynamic Scaling → Capacity Validation**

---

## Workload Types

Different AI workloads create different capacity problems. Capacity planning must begin with workload characteristics rather than assuming that one scaling strategy fits every system.

| Workload Type | Important Capacity Dimensions |
|---|---|
| Synchronous AI API | Request rate, latency, concurrency, CPU/GPU capacity, burst demand |
| Streaming AI | Concurrent streams, connection capacity, bandwidth, stream duration |
| Batch AI | Job volume, processing window, throughput, parallelism, deadlines |
| Embedding Pipeline | Document volume, batch size, throughput, CPU/accelerator capacity, storage throughput |
| Long-Running Agent / Workflow | Concurrent executions, worker capacity, queue depth, execution duration, resource occupancy |

---

## AI-Specific Capacity Considerations

AI workloads introduce capacity characteristics that traditional web workloads may not have.

PROD-07 considers factors such as:

- variable prompt and input size,
- variable output length,
- token generation rate,
- model size,
- GPU memory requirements,
- GPU compute requirements,
- batching,
- streaming,
- inference concurrency,
- model loading,
- model warm-up,
- accelerator availability,
- CPU/GPU imbalance,
- retrieval workload,
- embedding workload,
- reranking workload,
- multimodal input size,
- asynchronous workloads,
- external model-provider quotas.

Not every AI workload is GPU-bound.

A production capacity analysis must identify the actual limiting resource rather than assuming that CPU or GPU utilization alone defines system capacity.

---

## Chapter-Level Engineering Questions

The chapter develops the ability to answer questions such as:

1. What does capacity mean for this workload?
2. What workload characteristics determine demand?
3. What is the appropriate capacity unit?
4. What resource is actually limiting capacity?
5. How much capacity does one worker or replica provide?
6. How much headroom is required beyond expected demand?
7. Should the workload scale horizontally, vertically, or through another model?
8. What signal should drive autoscaling?
9. How do scaling delays affect capacity requirements?
10. How do concurrency and queues change system behavior?
11. Is the GPU bottleneck compute, memory, allocation, or something else?
12. How do dependency limits constrain usable capacity?
13. What should the minimum and maximum capacity bounds be?
14. What happens when demand changes faster than capacity can be provisioned?
15. How should scale-to-zero and warm capacity be evaluated?
16. How can load and burst testing demonstrate that the scaling strategy works?
17. What evidence indicates under-scaling, over-scaling, or oscillation?
18. When should the capacity model be revisited?

These questions are intentionally engineering-oriented. The goal is not to memorize scaling technologies, but to reason about capacity using workload evidence and explicit assumptions.

---

## Concept Ownership

| Concept | Primary Location |
|---|---|
| Capacity planning and capacity models | PROD-07.01 |
| Demand and workload modeling | PROD-07.01 |
| Resource sizing | PROD-07.01 |
| Horizontal and vertical scaling | PROD-07.01 |
| Autoscaling | PROD-07.02 |
| Concurrency implications | PROD-07.02 |
| Queue capacity and queue-based scaling | PROD-07.02 |
| GPU and accelerator capacity | PROD-07.02 |
| Load and capacity testing | PROD-07.03 |
| Burst and stress testing | PROD-07.03 |
| Scaling failure analysis | PROD-07.03 |

Each important concept should have one primary teaching location. Other chapters may reference these concepts where necessary without re-teaching them in depth.

---

## Important Chapter Boundaries

PROD-07 connects with several other production engineering chapters. These relationships must remain explicit so that capacity engineering does not become a substitute for other disciplines.

### PROD-03 — Production Inference and Model Serving

PROD-03 owns:

- inference serving,
- serving architecture,
- serving interfaces,
- concurrency mechanisms,
- queues as serving mechanisms,
- batching,
- streaming,
- model routing.

PROD-07 focuses on the **capacity implications** of those mechanisms.

For example:

```text
PROD-03:
How does batching work?

PROD-07:
How does batching affect throughput, latency, and required capacity?
```

See the approved PROD-03 documentation for serving architecture and mechanisms.

---

### PROD-04 — AI CI/CD and Deployment Engineering

PROD-04 owns:

- deployment,
- release engineering,
- CI/CD,
- artifact promotion,
- infrastructure provisioning,
- progressive delivery,
- rollback.

PROD-07 may discuss infrastructure capacity requirements, but deployment and release engineering remain PROD-04 responsibilities.

---

### PROD-05 — Production AI Observability and Telemetry

PROD-05 owns:

- logs,
- metrics,
- traces,
- telemetry,
- operational evidence,
- observability architecture.

PROD-07 may use signals such as:

- CPU utilization,
- GPU utilization,
- queue depth,
- latency,
- throughput,
- concurrency,

as inputs to capacity decisions.

PROD-07 does not re-teach observability architecture.

See the approved [PROD-05 — AI Observability and Telemetry](../PROD-05-AI-Observability-and-Telemetry/README.md) documentation.

---

### PROD-06 — Production AI Reliability

PROD-06 owns:

- reliability objectives,
- SLIs,
- SLOs,
- error budgets,
- failure isolation,
- timeouts,
- retries,
- backpressure,
- graceful degradation,
- fallback behavior,
- dependency failure.

PROD-07 may discuss:

- overload,
- queue pressure,
- saturation,
- admission control,
- load shedding,

but only from the **capacity and scaling perspective**.

The distinction is:

```text
PROD-06:
How do we prevent overload from causing cascading failure?

PROD-07:
Why are we overloaded, how much capacity is required,
and how should capacity scale?
```

PROD-07 does not re-teach reliability patterns in depth.

See the approved [PROD-06 — Production AI Reliability](../PROD-06-Production-AI-Reliability/README.md) documentation.

---

### PROD-08 — AI Performance Optimization and Cost

PROD-07 owns:

> How much capacity is required to handle the workload?

PROD-08 owns:

> How can we make the workload execute faster, more efficiently, or at lower cost?

For example:

```text
PROD-07:
How many GPU replicas are required for the expected workload?

PROD-08:
How can batching, quantization, caching, or inference optimization
reduce the GPU requirement?
```

Capacity planning must not become an inference-optimization chapter.

See the approved [PROD-08 — AI Performance, Optimization and Cost](../PROD-08-AI-Performance-Optimization-and-Cost/README.md) documentation.

---

### PROD-09 — Production AI Security

PROD-07 may mention resource isolation or quota boundaries where they affect capacity.

PROD-09 owns:

- identity,
- access control,
- secrets,
- supply-chain security,
- production security threats,
- security controls.

Scaling documentation must not become security engineering documentation.

---

### PROD-10 — AI Operations and Incident Management

PROD-07 owns:

- capacity design,
- scaling behavior,
- capacity testing,
- scaling failure modes.

PROD-10 owns:

- on-call,
- incident response,
- operational diagnosis,
- mitigation coordination,
- recovery operations,
- runbooks,
- postmortems.

Scaling failure analysis in PROD-07 should remain focused on engineering behavior and capacity evidence rather than incident-management procedures.

---

### PROD-11 — AI Lifecycle, Evaluation and Continuous Improvement

PROD-07 owns infrastructure and workload capacity.

PROD-11 owns:

- AI lifecycle,
- production evaluation,
- regression,
- drift,
- quality signals,
- continuous improvement.

Capacity degradation must not be confused with model-quality evaluation.

---

### PROD-12 — Production AI Readiness

PROD-07 contributes evidence about:

- capacity,
- scaling behavior,
- workload limits,
- validation results,
- scaling failure modes.

PROD-12 owns the broader production-readiness assessment.

Capacity evidence from PROD-07 should support production readiness without replacing the broader readiness process.

---

## Technology Philosophy

PROD-07 is framework-, cloud-, and vendor-neutral.

The chapter prioritizes:

- capacity reasoning,
- workload modeling,
- resource analysis,
- scaling behavior,
- validation,
- engineering trade-offs.

Technologies may be used as examples, including:

- Kubernetes HPA,
- KEDA,
- cluster autoscaling,
- cloud autoscaling,
- GPU autoscaling,
- queue-based scaling,
- load-testing tools.

These examples illustrate engineering concepts. They are not intended to turn PROD-07 into a vendor-specific implementation tutorial.

The learner should be able to apply the reasoning to different infrastructure platforms and AI architectures.

---

## Learning Outcome

After completing PROD-07, an engineer should be able to:

- characterize workload demand,
- define meaningful capacity units,
- estimate resource requirements,
- identify capacity bottlenecks,
- distinguish theoretical capacity from operational capacity,
- reason about headroom,
- choose appropriate scaling models,
- design meaningful autoscaling signals and bounds,
- reason about concurrency and queue capacity,
- evaluate CPU, memory, GPU, and accelerator constraints,
- account for scaling delay and warm/cold capacity,
- identify dependency capacity constraints,
- design load and burst tests,
- identify scaling failure modes,
- make defensible capacity decisions using evidence and explicit assumptions.

The final engineering question is:

> **Why is this the right amount of capacity, why should the system scale this way, and what evidence proves that the strategy will work?**

---

## Recommended Study Order

```text
01 — Plan
      ↓
02 — Scale
      ↓
03 — Prove
```

### Step 1 — Plan

Determine:

- workload demand,
- capacity units,
- resource requirements,
- bottlenecks,
- headroom,
- scaling model.

### Step 2 — Scale

Determine:

- scaling signals,
- scaling targets,
- control-loop behavior,
- concurrency limits,
- queue behavior,
- GPU and accelerator constraints,
- minimum and maximum capacity,
- warm and cold capacity.

### Step 3 — Prove

Determine:

- whether the capacity model is realistic,
- whether scaling reacts quickly enough,
- what happens during bursts,
- where saturation occurs,
- whether scaling oscillates,
- whether dependencies become bottlenecks,
- and where the scaling strategy fails.

The progression is:

> **Plan → Scale → Prove**

---

## Related PROD Chapters

| Chapter | Relationship to PROD-07 |
|---|---|
| PROD-03 — Production Inference and Model Serving | Serving mechanisms whose capacity implications are analyzed in PROD-07 |
| PROD-04 — AI CI/CD and Deployment Engineering | Deployment and infrastructure changes that may affect capacity |
| PROD-05 — AI Observability and Telemetry | Operational signals used as inputs to capacity decisions |
| PROD-06 — Production AI Reliability | Reliability controls and failure behavior surrounding overload |
| PROD-08 — AI Performance, Optimization and Cost | Performance and cost optimization that can change capacity requirements |
| PROD-09 — Production AI Security | Security boundaries that may constrain resource usage or access |
| PROD-10 — AI Operations and Incident Management | Operational response to production incidents involving capacity |
| PROD-11 — AI Lifecycle, Evaluation and Continuous Improvement | AI quality and lifecycle concerns separate from infrastructure capacity |
| PROD-12 — Production AI Readiness | Broader production-readiness assessment supported by PROD-07 evidence |

Where the exact approved repository path for a related chapter is not established in the current documentation context, this README intentionally does not invent a Markdown destination.

---

## Completion Guidance

Completing PROD-07 should move the engineer beyond:

> “Add more instances when CPU is high.”

The intended reasoning process is:

```text
Workload Demand
      ↓
Capacity Unit
      ↓
Bottleneck
      ↓
Per-Worker Capacity
      ↓
Headroom
      ↓
Scaling Signal
      ↓
Scaling Delay
      ↓
Capacity Bounds
      ↓
Dependency Constraints
      ↓
Validation
      ↓
Production Decision
```

A defensible capacity decision should make its assumptions explicit.

It should explain:

- what demand was modeled,
- what capacity unit was selected,
- which resource limits capacity,
- how much capacity one worker provides,
- what headroom is required,
- how capacity changes with demand,
- how quickly new capacity becomes usable,
- what dependency constraints exist,
- how the model was validated,
- and what conditions would require the model to be revisited.

The goal is not simply to configure autoscaling.

The goal is to develop the engineering judgment required to determine whether a production AI system has enough capacity, whether its scaling strategy is appropriate, and whether evidence supports that decision.

---

**Chapter:** PROD-07 — Scaling and Capacity Engineering  
**Domain:** PROD — Production AI Engineering  
**Documentation Root:** `docs/06-PROD/PROD-07-Scaling-and-Capacity-Engineering/`
