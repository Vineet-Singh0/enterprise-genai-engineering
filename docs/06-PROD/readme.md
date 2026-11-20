# PROD — Production AI Engineering

Production AI Engineering focuses on turning AI capabilities into systems that can be deployed, operated, observed, scaled, secured, evaluated, and evolved under real-world production constraints.

PROD sits after the capability-building domains and focuses on the engineering required to make those capabilities dependable in production.

---

## Central Engineering Question

> **How do we turn AI capabilities into production systems that remain reliable, observable, scalable, secure, cost-effective, operable, and safely evolvable under real-world conditions?**

This question defines PROD because a working AI model or application is not automatically a production-ready system. Production engineering must account for runtime behavior, deployment, operational evidence, failure handling, capacity, performance, security, cost, lifecycle changes, and readiness for continued operation.

---

## Where PROD Fits in the Curriculum

```text
ENG
 ↓
AIF
 ↓
LLM
 ↓
RET
 ↓
AGT
 ↓
PROD
 ↓
ENT
```

The domains form a capability-to-production progression:

- **ENG** establishes engineering foundations.
- **AIF** establishes AI foundations.
- **LLM** develops LLM engineering capabilities.
- **RET** develops retrieval engineering capabilities.
- **AGT** develops agent engineering capabilities.
- **PROD** productionizes and operates those capabilities.
- **ENT** provides enterprise-level governance and organizational context.

PROD therefore consumes capabilities developed upstream and applies production engineering principles to make them deployable and operable.

---

## PROD Scope

PROD owns the engineering concerns required to operate AI capabilities as production systems, including:

- production architecture,
- production workload characterization,
- application packaging,
- reproducibility,
- runtime contracts,
- production artifacts,
- artifact provenance,
- infrastructure provisioning,
- infrastructure as code,
- model and AI serving,
- deployment,
- release engineering,
- observability,
- reliability,
- scaling,
- capacity engineering,
- performance optimization,
- cost-performance analysis,
- production security,
- operations,
- disaster readiness,
- AI lifecycle management,
- production evaluation integration,
- drift and quality management,
- production readiness validation.

These concerns are organized across the 12 PROD chapters.

---

## What PROD Does Not Own

PROD depends on capabilities from other domains but does not replace their primary teaching responsibilities.

| Domain | Boundary |
|---|---|
| **ENG — Engineering Foundations** | Provides foundational computing, programming, software engineering, and systems concepts. PROD applies those foundations to production AI systems rather than re-teaching them. |
| **AIF — AI Foundations** | Owns foundational AI and machine learning concepts. PROD focuses on operating AI capabilities rather than teaching their underlying theory. |
| **LLM — LLM Engineering** | Owns LLM-specific engineering foundations and capabilities. PROD focuses on productionizing those capabilities. |
| **RET — Retrieval Engineering** | Owns retrieval-system design and retrieval-specific engineering. PROD focuses on operating retrieval capabilities as production systems. |
| **AGT — Agent Engineering** | Owns agent architecture, behavior, coordination, evaluation, and agent-specific safety concerns. PROD focuses on production operation, reliability, security, deployment, and readiness of agent systems. |
| **ENT — Enterprise AI Systems** | Owns enterprise-level governance, organizational context, and broader enterprise system concerns. PROD focuses on the production engineering layer. |

PROD may reference these domains where necessary, but their primary concepts remain owned by their respective domains.

---

## Learning Outcomes

After completing PROD, a learner should be able to:

- analyze AI workloads for production requirements,
- define production system and service boundaries,
- package AI applications reproducibly,
- reason about production runtime and artifact requirements,
- design and evaluate AI serving architectures,
- design controlled deployment and release processes,
- design production observability and telemetry,
- reason about reliability, SLOs, and failure handling,
- reason about capacity, concurrency, and scaling,
- analyze latency, throughput, resource efficiency, and cost,
- design production security controls,
- operate production AI systems and participate in incident diagnosis, mitigation, and recovery,
- manage AI lifecycle changes and production quality signals,
- evaluate production readiness through architectural and operational evidence.

These outcomes emphasize engineering decisions and system reasoning rather than familiarity with a particular vendor or framework.

---

## Learning Progression

```text
Production Problem
        ↓
Architecture
        ↓
Packaging & Runtime
        ↓
Serving
        ↓
Deployment
        ↓
Observability
        ↓
Reliability
        ↓
Scaling
        ↓
Performance & Cost
        ↓
Security
        ↓
Operations
        ↓
Lifecycle & Evaluation
        ↓
Production Readiness
```

The progression moves from understanding the production problem to designing the system, operating it under real conditions, improving it using evidence, and finally validating whether the complete system is production-ready.

The progression is intentionally cumulative. Later chapters build on production mental models established earlier.

---

# Chapter Map

| Chapter | Primary Focus | Core Engineering Question |
|---|---|---|
| [PROD-01 — Production AI System Foundations](./PROD-01-Production-AI-System-Foundations/README.md) | Production problem, architecture, workload characteristics | What changes when an AI capability becomes a production system? |
| [PROD-02 — AI Application Packaging and Runtime](./PROD-02-AI-Application-Packaging-and-Runtime/README.md) | Packaging, reproducibility, runtime, artifacts | How can an AI application run reproducibly across environments? |
| [PROD-03 — Production Model and AI Serving](./PROD-03-Production-Model-and-AI-Serving/README.md) | Inference, concurrency, batching, routing | How should AI inference be served in production? |
| [PROD-04 — Deployment and Release Engineering](./PROD-04-Deployment-and-Release-Engineering/README.md) | CI/CD, provisioning, promotion, deployment, rollback | How can AI changes be deployed safely and repeatably? |
| [PROD-05 — AI Observability and Telemetry](./PROD-05-AI-Observability-and-Telemetry/README.md) | Production evidence and telemetry | How do we determine what is happening inside a production AI system? |
| [PROD-06 — Production AI Reliability](./PROD-06-Production-AI-Reliability/README.md) | Reliability, failure isolation, degradation | How should the system behave when components or dependencies fail? |
| [PROD-07 — Scaling and Capacity Engineering](./PROD-07-Scaling-and-Capacity-Engineering/README.md) | Capacity, autoscaling, queues, load | How does the system remain viable as demand and resource requirements change? |
| [PROD-08 — AI Performance, Optimization and Cost](./PROD-08-AI-Performance-Optimization-and-Cost/README.md) | Performance and cost optimization | How can production AI systems meet performance requirements efficiently? |
| [PROD-09 — Production AI Security](./PROD-09-Production-AI-Security/README.md) | Identity, supply chain, AI-specific threats | How can production AI systems be protected against security threats? |
| [PROD-10 — AI Operations and Incident Management](./PROD-10-AI-Operations-and-Incident-Management/README.md) | Operations, incidents, recovery, learning | How should engineers operate and recover production AI systems? |
| [PROD-11 — AI Lifecycle, Evaluation and Continuous Improvement](./PROD-11-AI-Lifecycle-Evaluation-and-Continuous-Improvement/README.md) | Lifecycle, evaluation, drift, quality, safe change | How should AI systems evolve while maintaining acceptable production quality? |
| [PROD-12 — Production Readiness and Architecture Review](./PROD-12-Production-Readiness-and-Architecture-Review/README.md) | Readiness, trade-offs, validation | Can the complete AI system safely and reliably operate in production? |

The chapter map provides orientation only. Detailed teaching remains inside the corresponding chapter files.

---

## Chapter-by-Chapter Navigation

## PROD-01 — Production AI System Foundations

**Purpose:** Establish the production problem and the system-level mental model required for the rest of PROD.

**Primary question:** What changes when an AI capability becomes a production system?

**lessons:**

1. [Production AI Problem and Production Boundaries](./PROD-01-Production-AI-System-Foundations/01-Production-AI-Problem-and-Production-Boundaries.md)
2. [Production AI System Architecture and Service Boundaries](./PROD-01-Production-AI-System-Foundations/02-Production-AI-System-Architecture-and-Service-Boundaries.md)
3. [Production Workload Characteristics and Trade-offs](./PROD-01-Production-AI-System-Foundations/03-Production-Workload-Characteristics-and-Trade-offs.md)

**Dependency:** Upstream AI and engineering capabilities.

**Next:** PROD-02 establishes packaging and runtime foundations.

---

## PROD-02 — AI Application Packaging and Runtime

**Purpose:** Establish reproducible application packaging, runtime contracts, artifacts, dependencies, and environment configuration.

**Primary question:** How can an AI application run reproducibly across environments?

**lessons:**

1. [AI Application Packaging and Reproducibility](./PROD-02-AI-Application-Packaging-and-Runtime/01-AI-Application-Packaging-and-Reproducibility.md)
2. [Containers, Configuration and Runtime Contracts](./PROD-02-AI-Application-Packaging-and-Runtime/02-Containers-Configuration-and-Runtime-Contracts.md)
3. [Production Artifacts, Dependencies and Environment Configuration](./PROD-02-AI-Application-Packaging-and-Runtime/03-Production-Artifacts-Dependencies-and-Environment-Configuration.md)

**Dependency:** PROD-01 production system foundations.

**Next:** PROD-03 establishes serving architecture.

---

## PROD-03 — Production Model and AI Serving

**Purpose:** Establish the mechanisms through which AI inference and model-backed workloads execute in production.

**Primary question:** How should AI inference be served in production?

**lessons:**

1. [Production Inference and Model Serving](./PROD-03-Production-Model-and-AI-Serving/01-Production-Inference-and-Model-Serving.md)
2. [Concurrency, Queues, Batching and Streaming](./PROD-03-Production-Model-and-AI-Serving/02-Concurrency-Queues-Batching-and-Streaming.md)
3. [Model Routing and Serving Architecture](./PROD-03-Production-Model-and-AI-Serving/03-Model-Routing-and-Serving-Architecture.md)

**Dependency:** PROD-01 and PROD-02.

**Next:** PROD-04 moves serving workloads into controlled deployment and release processes.

---

## PROD-04 — Deployment and Release Engineering

**Purpose:** Establish repeatable infrastructure provisioning, artifact promotion, deployment strategies, release gates, rollback, and deployment change safety.

**Primary question:** How can AI changes be deployed safely and repeatably?

**lessons:**

1. [AI CI/CD, Infrastructure Provisioning and Artifact Promotion](./PROD-04-Deployment-and-Release-Engineering/01-AI-CI-CD-Infrastructure-Provisioning-and-Artifact-Promotion.md)
2. [Deployment Strategies and Progressive Delivery](./PROD-04-Deployment-and-Release-Engineering/02-Deployment-Strategies-and-Progressive-Delivery.md)
3. [Release Gates, Rollback and Change Safety](./PROD-04-Deployment-and-Release-Engineering/03-Release-Gates-Rollback-and-Change-Safety.md)

**Dependency:** PROD-02 production artifacts and PROD-03 serving architecture.

**Next:** PROD-05 establishes production evidence and telemetry.

---

## PROD-05 — AI Observability and Telemetry

**Purpose:** Establish how production AI systems generate, collect, and organize operational evidence.

**Primary question:** How do we determine what is happening inside a production AI system?

**lessons:**

1. [Production AI Observability and Telemetry](./PROD-05-AI-Observability-and-Telemetry/01-Production-AI-Observability-and-Telemetry.md)
2. [Logs, Metrics, Traces and AI-Specific Signals](./PROD-05-AI-Observability-and-Telemetry/02-Logs-Metrics-Traces-and-AI-Specific-Signals.md)
3. [AI Observability Architecture and Signal Design](./PROD-05-AI-Observability-and-Telemetry/03-AI-Observability-Architecture-and-Signal-Design.md)

**Dependency:** Production architecture, serving, and deployment established in earlier chapters.

**Next:** PROD-06 uses production system evidence to reason about reliability.

---

## PROD-06 — Production AI Reliability

**Purpose:** Establish production reliability behavior under component, dependency, and workload failures.

**Primary question:** How should the system behave when components or dependencies fail?

**lessons:**

1. [AI Service Reliability, SLIs, SLOs and Error Budgets](./PROD-06-Production-AI-Reliability/01-AI-Service-Reliability-SLIs-SLOs-and-Error-Budgets.md)
2. [Failure Isolation, Timeouts, Retries and Backpressure](./PROD-06-Production-AI-Reliability/02-Failure-Isolation-Timeouts-Retries-and-Backpressure.md)
3. [Graceful Degradation, Fallbacks and Dependency Failure](./PROD-06-Production-AI-Reliability/03-Graceful-Degradation-Fallbacks-and-Dependency-Failure.md)

**Dependency:** PROD-03 serving and PROD-05 observability.

**Next:** PROD-07 applies reliability and serving constraints to capacity and scaling.

---

## PROD-07 — Scaling and Capacity Engineering

**Purpose:** Establish capacity planning, scaling behavior, resource constraints, autoscaling, concurrency, queues, and load behavior.

**Primary question:** How does the system remain viable as demand and resource requirements change?

**lessons:**

1. [AI Capacity Planning and Scaling Models](./PROD-07-Scaling-and-Capacity-Engineering/01-AI-Capacity-Planning-and-Scaling-Models.md)
2. [Autoscaling, Capacity, Concurrency, Queues and GPU Resources](./PROD-07-Scaling-and-Capacity-Engineering/02-Autoscaling-Capacity-Concurrency-Queues-and-GPU-Resources.md)
3. [Load Testing, Burst Traffic and Scaling Failure](./PROD-07-Scaling-and-Capacity-Engineering/03-Load-Testing-Burst-Traffic-and-Scaling-Failure.md)

**Dependency:** PROD-03 serving and PROD-06 reliability.

**Next:** PROD-08 uses operational evidence to optimize performance and cost.

---

## PROD-08 — AI Performance, Optimization and Cost

**Purpose:** Establish production performance analysis, inference optimization, resource efficiency, benchmarking, and cost-performance trade-offs.

**Primary question:** How can production AI systems meet performance requirements efficiently?

**lessons:**

1. [AI Latency, Throughput and Performance Analysis](./PROD-08-AI-Performance-Optimization-and-Cost/01-AI-Latency-Throughput-and-Performance-Analysis.md)
2. [Inference Optimization and Resource Efficiency](./PROD-08-AI-Performance-Optimization-and-Cost/02-Inference-Optimization-and-Resource-Efficiency.md)
3. [Performance Benchmarking and Cost-Performance Trade-offs](./PROD-08-AI-Performance-Optimization-and-Cost/03-Performance-Benchmarking-and-Cost-Performance-Trade-offs.md)

**Dependency:** PROD-05 observability, PROD-07 scaling, and serving behavior from PROD-03.

**Next:** PROD-09 establishes production security controls.

---

## PROD-09 — Production AI Security

**Purpose:** Establish production security controls across identity, secrets, access, applications, containers, supply chains, and AI-specific threats.

**Primary question:** How can production AI systems be protected against security threats?

**lessons:**

1. [Production AI Identity, Secrets and Access Control](./PROD-09-Production-AI-Security/01-Production-AI-Identity-Secrets-and-Access-Control.md)
2. [AI Application, Container and Supply Chain Security](./PROD-09-Production-AI-Security/02-AI-Application-Container-and-Supply-Chain-Security.md)
3. [AI-Specific Production Threats and Protection](./PROD-09-Production-AI-Security/03-AI-Specific-Production-Threats-and-Protection.md)

**Dependency:** Production architecture, runtime, deployment, and operational requirements.

**Next:** PROD-10 establishes operational readiness and incident management.

---

## PROD-10 — AI Operations and Incident Management

**Purpose:** Establish production operations, on-call readiness, incident response, recovery, disaster readiness, runbooks, and operational learning.

**Primary question:** How should engineers operate and recover production AI systems?

**lessons:**

1. [AI Production Operations and On-Call Readiness](./PROD-10-AI-Operations-and-Incident-Management/01-AI-Production-Operations-and-On-Call-Readiness.md)
2. [AI Incident Detection, Diagnosis, Recovery and Disaster Readiness](./PROD-10-AI-Operations-and-Incident-Management/02-AI-Incident-Detection-Diagnosis-Recovery-and-Disaster-Readiness.md)
3. [Runbooks, Postmortems and Operational Learning](./PROD-10-AI-Operations-and-Incident-Management/03-Runbooks-Postmortems-and-Operational-Learning.md)

**Dependency:** PROD-05 observability and PROD-06 reliability, with security, scaling, and deployment context from earlier chapters.

**Next:** PROD-11 establishes AI lifecycle and production quality management.

---

## PROD-11 — AI Lifecycle, Evaluation and Continuous Improvement

**Purpose:** Establish how AI applications, models, and configurations evolve while production quality and operational evidence remain controlled.

**Primary question:** How should AI systems evolve while maintaining acceptable production quality?

**lessons:**

1. [AI Model, Application and Configuration Lifecycle](./PROD-11-AI-Lifecycle-Evaluation-and-Continuous-Improvement/01-AI-Model-Application-and-Configuration-Lifecycle.md)
2. [Production Evaluation, Drift and Quality Signals](./PROD-11-AI-Lifecycle-Evaluation-and-Continuous-Improvement/02-Production-Evaluation-Drift-and-Quality-Signals.md)
3. [Evaluation Gates, Continuous Improvement and Safe Change](./PROD-11-AI-Lifecycle-Evaluation-and-Continuous-Improvement/03-Evaluation-Gates-Continuous-Improvement-and-Safe-Change.md)

**Dependency:** Production evidence from PROD-05, operational experience from PROD-06 and PROD-10, and deployment mechanisms from PROD-04.

**Next:** PROD-12 validates production readiness across the complete system.

---

## PROD-12 — Production Readiness and Architecture Review

**Purpose:** Integrate the production engineering concerns into end-to-end architecture and readiness validation.

**Primary question:** Can the complete AI system safely and reliably operate in production?

**lessons:**

1. [Production Readiness and Architecture Review](./PROD-12-Production-Readiness-and-Architecture-Review/01-Production-Readiness-and-Architecture-Review.md)
2. [Production Trade-offs and Operational Design](./PROD-12-Production-Readiness-and-Architecture-Review/02-Production-Trade-offs-and-Operational-Design.md)
3. [End-to-End Production System Validation](./PROD-12-Production-Readiness-and-Architecture-Review/03-End-to-End-Production-System-Validation.md)

**Dependency:** PROD-01 through PROD-11.

**Next:** Continuous improvement through production evidence and future lifecycle changes.

---

## Cross-Chapter Relationships

PROD is not a collection of isolated production topics. The chapters form a connected engineering system.

### Packaging → Deployment

```text
PROD-02
Create production-ready artifacts
        ↓
PROD-04
Promote and deploy them
```

PROD-02 establishes the artifacts and runtime foundations that PROD-04 subsequently promotes and deploys.

### Serving → Scaling

```text
PROD-03
Serving mechanisms
        ↓
PROD-07
Capacity and scaling
```

PROD-03 establishes how AI workloads execute. PROD-07 reasons about whether that serving architecture can handle production demand and resource constraints.

### Observability → Optimization

```text
PROD-05
Collect production evidence
        ↓
PROD-08
Use evidence for optimization
```

PROD-05 provides operational evidence. PROD-08 uses that evidence to analyze and improve performance and cost.

### Reliability → Operations

```text
PROD-06
System behavior during failure
        ↓
PROD-10
Operator response and recovery
```

PROD-06 focuses on how the system behaves under failure. PROD-10 focuses on how engineers operate, diagnose, recover, and learn from production incidents.

### Evaluation → Deployment

```text
PROD-11
AI change qualification
        ↓
PROD-04
Release decision and deployment safety
```

PROD-11 provides AI-quality evidence for whether a change should be accepted. PROD-04 provides the deployment and release mechanisms that control how an accepted change is introduced.

### All Chapters → Readiness

```text
PROD-01 ... PROD-11
        ↓
PROD-12
Production readiness validation
```

PROD-12 integrates the production engineering concerns into an end-to-end readiness and architecture review.

---

# Critical Concept Boundaries

| Boundary | Distinction |
|---|---|
| **PROD-03 vs PROD-07** | PROD-03 owns serving mechanisms; PROD-07 owns capacity constraints and scaling behavior. |
| **PROD-03 vs PROD-08** | PROD-03 owns serving mechanisms; PROD-08 owns performance optimization and cost-performance trade-offs. |
| **PROD-05 vs PROD-11** | PROD-05 owns operational observability and evidence collection; PROD-11 owns AI quality evaluation, lifecycle evidence, drift, and production change qualification. |
| **PROD-06 vs PROD-10** | PROD-06 owns production system behavior during failure; PROD-10 owns operator incident response, diagnosis, mitigation, recovery, and operational learning. |
| **PROD-04 vs PROD-11** | PROD-04 owns deployment and release safety; PROD-11 owns AI change qualification based on quality evidence. |
| **AGT-10 vs PROD-11** | AGT-10 owns agent evaluation methodology, behavioral evaluation, evaluation validity, and evaluator reliability; PROD-11 owns production integration of AI evaluation, quality signals, drift, gates, and controlled change. |
| **AGT-11 vs PROD-06 vs PROD-10** | AGT-11 owns agent-specific recovery, containment, excessive-agency, and safety decisions; PROD-06 owns production service failure behavior, degradation, and fallback mechanisms; PROD-10 owns operator diagnosis, mitigation, restoration, and incident learning. |
| **PROD-09 vs AGT-11** | PROD-09 owns production security controls; AGT-11 owns agent behavior safety, excessive agency, and tool boundaries. |
| **PROD-12 vs AGT-12** | PROD-12 owns validation of production readiness and production-operability concerns across the complete AI system; AGT-12 owns agent-specific architecture selection, composition, and architecture validation. |
| **PROD-02 vs PROD-09** | PROD-02 owns artifact creation, dependency/environment reproducibility, and artifact provenance; PROD-09 owns security controls that protect applications, containers, and the software supply chain from compromise. |

These boundaries prevent the README and later lessons from treating related concepts as interchangeable.

---

## Production Evidence Loop

```text
Production
    ↓
Evidence
    ↓
Diagnosis
    ↓
Improvement
    ↓
Qualification
    ↓
Release
    ↓
Production
```

Production evidence can inform reliability, performance, cost, quality, operational decisions, and architecture changes.

The loop connects day-to-day operation with controlled system improvement.

---

# Practical Engineering Competency

PROD should eventually enable a learner to perform practical engineering work such as:

- analyze an AI workload and identify production requirements,
- define service and system boundaries,
- package an AI application reproducibly,
- define runtime and artifact requirements,
- design an AI serving architecture,
- design deployment and release flows,
- establish production telemetry,
- reason about reliability and failure behavior,
- estimate capacity and scaling requirements,
- analyze latency, throughput, resource use, and cost,
- establish production security controls,
- prepare operational and incident-response practices,
- manage AI lifecycle changes,
- connect production evaluation with controlled change,
- perform an end-to-end production readiness review.

The emphasis is on making engineering decisions and defending those decisions through evidence and trade-offs.

---

## Technology Philosophy

PROD teaches durable production engineering concepts first. Technologies are implementation examples rather than conceptual owners.

Examples may include:

- Docker,
- Kubernetes,
- Terraform or OpenTofu,
- OpenTelemetry,
- Prometheus,
- Grafana,
- model-serving systems,
- CI/CD platforms,
- cloud platforms.

The curriculum should remain useful even when specific technologies, platforms, or vendor products change.

---

## Framework and Vendor Neutrality

PROD is not a:

- Kubernetes course,
- Docker course,
- cloud-provider course,
- CI/CD-platform course,
- MLOps-vendor course,
- model-serving-vendor course,
- monitoring-tool course.

Tools and platforms are used to demonstrate production engineering principles. The underlying engineering concepts remain the primary learning objectives.

---

## Prerequisites

PROD assumes familiarity with the engineering and AI capabilities required to reason about production systems.

Relevant preparation includes:

- ENG fundamentals,
- AIF fundamentals,
- LLM engineering foundations,
- RET concepts where retrieval systems are being productionized,
- AGT concepts where agent systems are being productionized.

The exact prerequisite depth depends on the production system being engineered. PROD does not require every upstream chapter to be treated as a mandatory prerequisite for every learner.

---

## Recommended Learning Order

The recommended learning order is:

**PROD-01 → PROD-02 → PROD-03 → PROD-04 → PROD-05 → PROD-06 → PROD-07 → PROD-08 → PROD-09 → PROD-10 → PROD-11 → PROD-12**

This sequence establishes the production mental model first, then progressively adds serving, deployment, evidence, reliability, scale, optimization, security, operations, lifecycle management, and readiness validation.

Later chapters depend on concepts and system boundaries established earlier.

---

## Interview and Architecture Competency

PROD prepares the learner to reason about production engineering decisions involving:

- production architecture,
- service boundaries,
- model and AI serving,
- deployment,
- release safety,
- observability,
- reliability,
- SLOs,
- scaling,
- capacity,
- performance,
- cost,
- security,
- incident response,
- lifecycle management,
- AI quality,
- production readiness.

The expected competency is not memorization of tools. The learner should be able to explain why a particular production design is appropriate, what assumptions it makes, what trade-offs it introduces, and how it behaves under failure and scale.

---

## Domain Completion Criteria

A learner has completed PROD when they can:

1. reason about production AI workload requirements,
2. design production system boundaries,
3. package and reproduce AI applications,
4. reason about production serving architecture,
5. design deployment and release flows,
6. design production observability,
7. reason about reliability and failure handling,
8. reason about capacity and scaling,
9. analyze and optimize performance and cost,
10. secure production AI systems,
11. operate and recover production systems,
12. manage AI lifecycle and AI-quality change,
13. perform production-readiness validation.

Completion means the learner can connect these concerns into a coherent production engineering system rather than treating them as isolated technologies.

---

## Chapter Contents

Use the chapter map and lesson links above to navigate the PROD domain.

---

## Scope Boundaries
The domain README does not own the concepts it mentions.

Detailed instruction remains in the lessons.

The README provides:

```text
Orientation
+
Navigation
+
Dependency Map
+
Learning Progression
```

The 36 lessons remain the primary locations for detailed technical instruction.

---

# Chapter Boundaries

When reading across PROD, watch neighboring chapter boundaries, especially:

- PROD-03 vs PROD-07 / PROD-08
- PROD-05 vs PROD-11
- PROD-06 vs PROD-10
- PROD-04 vs PROD-11
- AGT-10 / AGT-11 overlaps with PROD-06 / PROD-10 / PROD-11
- PROD-09 vs AGT-11
- PROD-12 vs AGT-12
- PROD-02 vs PROD-09

---

## PROD Domain Structure

The PROD domain contains:

- **12 chapters**
- **36 lessons**

The architecture is organized as:

```text
Production Problem
        ↓
System Architecture
        ↓
Packaging & Runtime
        ↓
Serving
        ↓
Deployment & Release
        ↓
Observability
        ↓
Reliability
        ↓
Scaling & Capacity
        ↓
Performance & Cost
        ↓
Security
        ↓
Operations & Incidents
        ↓
Lifecycle & Evaluation
        ↓
Production Readiness
```

This structure provides the navigation model for the entire PROD domain while keeping detailed engineering instruction inside the lessons.
