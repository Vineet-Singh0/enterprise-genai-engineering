# Software Quality Attributes

## 1. Overview

Software quality is not determined only by whether an application produces the correct output. A production system must also perform reliably, respond within acceptable time limits, remain secure, support change, and operate within its resource and cost constraints.

These characteristics are known as **software quality attributes**.

For example, an API may return the correct response during development but fail when thousands of users send requests simultaneously. Its functional behavior may be correct, but its scalability, performance, or reliability may be inadequate.

Understanding quality attributes helps engineers evaluate software as a complete system rather than as a collection of features.

### What this chapter covers

- The meaning and purpose of software quality attributes.
- The difference between functional requirements and quality attributes.
- Common quality attributes and their engineering implications.
- How to turn vague quality expectations into measurable requirements.
- How quality attributes influence architectural decisions.
- How to reason about trade-offs between competing quality goals.

### What this chapter does not cover

This chapter establishes the quality objectives that software should satisfy. Detailed implementation and design techniques belong in their respective chapters:

- General design principles — [02-Software Design Principles](02-Software-Design-Principles.md)
- Separation of concerns and abstraction — [03-Separation of Concerns and Abstraction](03-Separation-of-Concerns-and-Abstraction.md)
- Coupling and cohesion — [04-Coupling and Cohesion](04-Coupling-and-Cohesion.md)
- SOLID principles — [05-SOLID Principles](05-SOLID-Principles.md)
- Dependency injection — [06-Dependency Injection](06-Dependency-Injection.md)
- Architecture — [07-Layered and Clean Architecture](07-Layered-and-Clean-Architecture.md)

---

## 2. The Engineering Problem: Correctness Is Not Enough

Imagine two applications that provide the same business functionality.

- **Application A** returns correct results but takes 12 seconds to respond, fails under heavy traffic, and requires several days of work for a small change.
- **Application B** returns correct results within acceptable latency, handles expected traffic, recovers from failures, and supports controlled changes.

Both applications may satisfy the initial functional requirements. However, they differ significantly in their suitability for production.

This illustrates a fundamental engineering principle:

> Functional correctness establishes what a system does. Quality attributes help establish how well the system performs that responsibility under specified conditions.

Software quality is contextual. A response time of two seconds might be acceptable for a long-running report but unacceptable for an interactive authentication request.

Therefore, quality cannot be evaluated independently of the system's purpose, operating environment, users, risks, and constraints.

### 2.1 What happens when quality is ignored?

Neglecting quality attributes can lead to:

- Slow or unresponsive applications.
- Unexpected failures and service interruptions.
- Increasing maintenance costs.
- Security vulnerabilities.
- Difficulty testing changes safely.
- Poor user experience.
- Resource consumption that exceeds the available budget.
- Systems that cannot accommodate business growth.

These problems often emerge after deployment because real workloads, failures, and changing requirements expose weaknesses that were not visible during initial development.

---

## 3. Functional Requirements vs. Quality Attributes

Functional requirements describe the capabilities or behaviors a system must provide.

Quality attributes describe characteristics or constraints associated with those capabilities and the system delivering them.

Consider an account management API.

| Requirement type | Example |
|---|---|
| Functional | A user can sign in using valid credentials. |
| Performance | Sign-in requests meet the defined response-time target under expected load. |
| Reliability | A temporary dependency failure does not cause uncontrolled application failure. |
| Availability | The sign-in service meets its agreed availability target. |
| Security | Credentials and authentication tokens are protected against unauthorized access. |
| Maintainability | Engineers can change authentication rules without unnecessarily affecting unrelated functionality. |
| Testability | Authentication behavior can be verified consistently through automated tests. |

These requirements are related but not interchangeable.

A system can implement every required feature and still be unsuitable for production if it fails to meet critical quality expectations.

### 3.1 Functional requirements are not always independent of quality

A functional requirement may imply quality constraints.

For example, "generate a monthly report" describes functionality. If the report must be generated within 30 seconds for one million records, the requirement also introduces performance and scalability expectations.

Engineers should identify both dimensions rather than treating them as separate, unrelated checklists.

---

## 4. What Is a Software Quality Attribute?

A **software quality attribute** is a characteristic used to evaluate how well a software system satisfies relevant stakeholder needs under defined conditions.

Quality attributes influence decisions about:

- System architecture.
- Technology selection.
- Resource allocation.
- Testing strategy.
- Deployment and operations.
- Maintenance and evolution.
- Risk management.

Not every system needs to optimize every quality attribute equally. The appropriate priorities depend on business objectives, user expectations, operational constraints, and the consequences of failure.

For example:

- A payment processing system places strong emphasis on correctness, security, reliability, and auditability.
- A real-time collaboration application may prioritize low latency, availability, and synchronization behavior.
- An internal data-processing pipeline may prioritize throughput, recoverability, and processing cost.
- A prototype may prioritize development speed, provided its temporary limitations are understood and controlled.

The objective is not to maximize every attribute without limit. It is to establish appropriate quality targets and make informed trade-offs.

---

## 5. Major Software Quality Attributes

The following sections introduce the principal attributes covered by this module.

### 5.1 Maintainability

**Maintainability** is the ease with which software can be understood, corrected, modified, tested, and evolved.

Software rarely remains unchanged after its initial release. Business rules change, defects are discovered, dependencies evolve, and new capabilities are introduced.

Maintainability determines how much effort and risk are involved in making those changes.

Consider a pricing service. If pricing rules are difficult to locate and changes frequently break unrelated functionality, the system has poor maintainability.

Factors that influence maintainability include:

- Readable and understandable code.
- Clear module responsibilities.
- Appropriate documentation.
- Effective automated tests.
- Manageable dependencies.
- Predictable development and release workflows.

These factors are influenced by several design practices covered in later chapters.

**Possible indicators:**

- Lead time required to implement a typical change.
- Time required to diagnose and fix a defect.
- Frequency of regressions after changes.
- Effort required to onboard engineers to the codebase.
- Complexity and stability of frequently modified components.

No single metric fully represents maintainability. For example, low code complexity does not guarantee that a system is easy to modify if its behavior is poorly documented or its tests are unreliable.

**Engineering question:** Can another engineer safely understand and change this system without needing to reconstruct every decision from scratch?

### 5.2 Scalability

**Scalability** is the ability of a system to accommodate changes in workload, data volume, users, or requests while continuing to satisfy its performance and operational requirements.

A system that works for 100 concurrent users may not work acceptably for 100,000 concurrent users.

Scalability concerns how system behavior changes as demand increases.

Common approaches include:

- Vertical scaling: increasing the resources available to an existing machine.
- Horizontal scaling: adding more machines or service instances.
- Workload distribution across multiple instances.
- Caching frequently accessed data.
- Asynchronous processing for suitable workloads.
- Database and storage strategies appropriate to the workload.

These are potential solutions, not universal requirements. Each introduces costs and constraints.

For example, adding application instances may improve request-handling capacity but will not necessarily solve a database bottleneck shared by all instances.

**Possible indicators:**

- Maximum sustained throughput at an agreed service level.
- Response-time behavior as concurrent load increases.
- Resource utilization under increasing demand.
- Cost per request or processed record.
- Capacity before a defined performance target is violated.

**Engineering question:** What happens to latency, resource consumption, and cost when demand increases by ten times?

### 5.3 Reliability

**Reliability** is the ability of a system to perform its required functions correctly over a specified period under specified operating conditions.

A reliable system behaves predictably and avoids unacceptable failures during normal operation and foreseeable disturbances.

Reliability is not the same as never experiencing a failure. Real systems depend on networks, databases, storage, external services, and hardware that can fail.

Engineering reliability therefore involves understanding failure modes and reducing their probability or impact.

Relevant considerations include:

- Correct handling of errors.
- Controlled retries and timeouts.
- Data integrity.
- Recovery from interrupted operations.
- Prevention of duplicate or inconsistent processing.
- Testing of failure scenarios.
- Management of dependencies.

**Possible indicators:**

- Failure rate under defined operating conditions.
- Probability of completing an operation successfully.
- Frequency of data corruption or inconsistent results.
- Rate of failed jobs or requests.
- Recovery behavior following specified failures.

Reliability measures must be defined carefully. A successful HTTP response, for example, does not prove that a business operation completed correctly.

**Engineering question:** If a component fails during an operation, does the system preserve correctness and reach a known state?

### 5.4 Availability

**Availability** is the degree to which a system or service is operational and accessible when it is needed.

A system can be reliable during individual operations yet experience poor availability if it requires long maintenance windows or takes a long time to recover after a failure.

Availability is commonly expressed as a percentage over a defined period.

\[
\text{Availability} =
\frac{\text{Available Time}}{\text{Total Time}}
\times 100
\]

For example, consider a simplified service with a 30-day measurement period. If the service is unavailable for 43.2 minutes and the measurement uses the full 30-day period, its availability is:

\[
\frac{43{,}200 - 43.2}{43{,}200}\times100
=99.9\%
\]

This calculation assumes 30 days contain 43,200 minutes and does not account for special exclusions in a service-level agreement.

Availability engineering may involve:

- Reducing single points of failure.
- Monitoring service health.
- Designing controlled failover.
- Reducing recovery time.
- Planning maintenance.
- Establishing appropriate redundancy.

Redundancy alone does not guarantee availability. Shared dependencies, configuration errors, network failures, and deployment mistakes can still interrupt the entire service.

**Possible indicators:**

- Percentage of time the service meets its availability definition.
- Number and duration of service interruptions.
- Mean time to restore service.
- Percentage of requests that satisfy the service-level objective.

**Engineering question:** Can users access the service when they need it, and how quickly can it recover after an interruption?

### 5.5 Extensibility

**Extensibility** is the ability to add or modify capabilities without requiring disproportionate changes to existing functionality.

Business requirements evolve. A notification service might initially support email and later need SMS, push notifications, or messaging integrations.

An extensible design accommodates foreseeable changes without making every new capability require widespread modifications.

Extensibility depends on the nature of the expected changes. Designing for every hypothetical future requirement can add unnecessary complexity.

**Possible indicators:**

- Effort required to introduce a representative new capability.
- Number of existing components that must change.
- Number of regressions introduced by extensions.
- Compatibility with existing integrations.

**Engineering question:** How much of the existing system must change when a new requirement is introduced?

Extensibility is closely related to maintainability, but the terms are not identical. Maintainability covers the broader effort of understanding, fixing, and changing software; extensibility focuses particularly on accommodating additional or evolving capabilities.

### 5.6 Reusability

**Reusability** is the ability to use a software component, service, or implementation in more than one appropriate context without unnecessary duplication or adaptation.

For example, a validated date-parsing utility may be useful in several services.

However, reusability does not mean that every piece of code should become a shared library. A shared component introduces dependencies, compatibility concerns, and coordination costs.

A component reused across many services may become difficult to change because each consumer depends on its behavior.

**Possible indicators:**

- Number of appropriate contexts in which a component is reused.
- Adaptation effort required for each consumer.
- Defect rate across different usage contexts.
- Maintenance cost of the shared component.

Reuse is valuable when the common behavior is stable and the consumers genuinely share the same requirement. Otherwise, separate implementations may be simpler and safer.

**Engineering question:** Does sharing this component reduce total system complexity, or does it create a dependency that is harder to manage than duplication?

### 5.7 Testability

**Testability** is the degree to which software behavior can be verified efficiently and reliably.

A testable system allows engineers to establish whether its behavior meets requirements and whether changes have introduced regressions.

Testability matters throughout development, not only before release. It influences how quickly engineers can investigate defects and how confidently they can change software.

Relevant considerations include:

- Ability to exercise behavior in isolation when appropriate.
- Control over relevant inputs and environmental conditions.
- Visibility into important outputs and state transitions.
- Deterministic behavior where required.
- Ability to simulate relevant failures.
- Availability of useful assertions and diagnostic information.

**Possible indicators:**

- Time required to write and maintain representative tests.
- Repeatability of test results.
- Frequency of flaky tests.
- Time required to identify a failing component.
- Coverage of critical business behavior and failure scenarios.

Code coverage can provide useful information, but high coverage does not guarantee that tests verify the right behavior.

**Engineering question:** Can an engineer reliably prove that the system behaves correctly, including under important failure conditions?

### 5.8 Performance

**Performance** describes how efficiently a system performs its work in terms of measures such as response time, throughput, resource consumption, and processing latency.

Different workloads require different performance measures.

For an interactive API, response time may be the primary concern. For a data-processing pipeline, throughput may matter more. For a resource-constrained service, memory or CPU consumption may be a limiting factor.

Important performance measures include:

- **Latency:** Time required to complete an operation.
- **Throughput:** Amount of work completed per unit of time.
- **Resource utilization:** CPU, memory, storage, network, and other resources consumed.
- **Tail latency:** Behavior of slower requests, often examined through percentiles such as p95 and p99.

Average latency alone can hide poor experiences for a significant subset of requests. A service with a low average response time may still have unacceptable p99 latency.

Performance is workload-dependent. Results should be evaluated using realistic data, concurrency, request distributions, and operating conditions.

**Possible indicators:**

- p50, p95, and p99 response times.
- Requests processed per second.
- CPU and memory consumption under representative load.
- Queueing delay and processing time.
- Cost per operation at a defined workload.

**Engineering question:** Does the system complete the required work within its latency, throughput, and resource constraints?

### 5.9 Security

**Security** is the ability of a system to protect its assets, data, operations, and users against unauthorized access, misuse, alteration, disclosure, or disruption.

Security is not a single feature. It includes multiple concerns, such as:

- Authentication: establishing who or what is making a request.
- Authorization: determining what that identity is permitted to do.
- Confidentiality: preventing unauthorized disclosure.
- Integrity: preventing or detecting unauthorized modification.
- Auditability: recording relevant actions so they can be investigated.
- Secure handling of secrets and sensitive information.

Security requirements depend on the system's threat model, data sensitivity, business context, and regulatory obligations.

For example, a service that handles personal information must consider which identities can access that information, how access is enforced, and how sensitive data is protected in transit and at rest.

**Possible indicators:**

- Number and severity of unresolved security findings.
- Time required to remediate critical vulnerabilities.
- Coverage of required authorization checks.
- Audit-log completeness for critical operations.
- Results of relevant security tests.

Passing a security test does not prove that a system is secure. Security evaluation must consider the threats, assumptions, and attack surfaces that the tests actually cover.

**Engineering question:** What assets need protection, who might attempt to compromise them, and what happens if the protection fails?

Detailed security architecture and implementation are outside the scope of this introductory chapter. The focus here is recognizing security as an explicit quality requirement rather than an afterthought.

---

## 6. Related but Distinct Quality Attributes

Quality attributes frequently overlap. Engineers should distinguish them sufficiently to select appropriate requirements and measurements.

| Attributes | Primary distinction |
|---|---|
| Maintainability vs. extensibility | Maintainability concerns the broader effort of understanding and changing software; extensibility focuses on adding or evolving capabilities. |
| Reliability vs. availability | Reliability concerns correct operation over time; availability concerns whether the service is accessible when required. |
| Scalability vs. performance | Performance concerns behavior at a given workload; scalability concerns how that behavior changes as workload grows. |
| Reusability vs. maintainability | Reusability concerns use across contexts; maintainability concerns the effort and risk involved in understanding and changing software. |
| Testability vs. reliability | Testability concerns how effectively behavior can be verified; reliability concerns how consistently the system performs correctly. |
| Security vs. availability | Security protects against unauthorized actions and threats; availability concerns access to the service. Security controls can sometimes affect availability, and availability mechanisms can introduce security risks. |

These distinctions are useful because improving one attribute does not automatically improve another.

For example, adding replicas may improve availability, but if all replicas share the same faulty configuration, reliability may remain poor. Similarly, adding caching may improve performance while introducing stale-data or invalidation problems.

---

## 7. Quality Attributes Must Be Measurable

Statements such as "the application should be fast," "the system must be secure," or "the code should be maintainable" express intentions but do not provide enough precision for engineering decisions.

Different stakeholders may interpret these statements differently.

A useful quality requirement specifies:

1. **Stimulus:** What event or condition occurs?
2. **Environment:** Under what operating conditions?
3. **Response:** What should the system do?
4. **Measure:** How will the response be evaluated?

For example:

**Vague requirement**

> The API should be fast.

**Measurable requirement**

> Under the agreed production-like workload of 500 concurrent clients, 95% of profile-search requests must complete within 300 milliseconds, measured at the API boundary over a 15-minute test period.

The second requirement identifies the workload, expected behavior, threshold, and measurement window.

The exact values are illustrative, not universal targets. They should be selected from actual product requirements and workload analysis.

### 7.1 Example quality scenarios

| Attribute | Example measurable scenario |
|---|---|
| Performance | At the specified workload, p95 API latency remains below the agreed threshold. |
| Scalability | When request volume doubles within the supported operating range, the system continues to meet its latency and error-rate targets. |
| Availability | During the agreed measurement period, the service meets its availability objective. |
| Reliability | When a downstream dependency times out, the operation fails or recovers according to the defined policy without corrupting business state. |
| Maintainability | A representative change can be implemented and verified within the agreed engineering-effort budget. |
| Security | Requests from an unauthorized identity are rejected for all protected operations in the defined security test suite. |
| Testability | Critical business scenarios can be tested repeatedly without relying on an uncontrolled external environment. |

Not every quality attribute can be reduced to a single metric. Maintainability, for example, may require multiple indicators and engineering judgment.

The purpose of measurement is not to make every quality concern numerical. It is to reduce ambiguity and provide evidence for decisions.

---

## 8. Quality Attributes Influence Architecture

Architecture determines the major structural decisions that shape a system's behavior and evolution. Quality attributes help establish which architectural choices are appropriate.

Consider a system that must support a large increase in traffic.

An engineer might consider horizontal scaling, caching, asynchronous processing, database optimization, or workload partitioning. The appropriate solution depends on the actual bottleneck and the system's consistency, latency, operational, and cost requirements.

Similarly, a system with strict availability requirements may need redundancy and automated recovery. A system handling sensitive data may need stronger access controls, auditability, and isolation.

The important reasoning sequence is:

1. Identify the stakeholder or business need.
2. Express the need as a quality attribute.
3. Define the relevant operating conditions.
4. Establish measurable acceptance criteria.
5. Identify architectural options that could satisfy those criteria.
6. Evaluate trade-offs, complexity, cost, and operational consequences.
7. Validate the selected approach through analysis, testing, or measurement.

Architecture should respond to meaningful requirements rather than assumptions that a particular technology is always superior.

### 8.1 Example: Profile-search service

Suppose a profile-search service must handle growing traffic while returning results quickly.

Relevant requirements might include:

- Performance: interactive searches must meet a defined latency objective.
- Scalability: increased request volume must remain within supported service limits.
- Reliability: dependency failures must not result in uncontrolled errors or inconsistent state.
- Availability: the search capability must meet its service-level objective.
- Security: users must not access profiles they are not authorized to view.
- Maintainability: matching rules must be changeable and verifiable without unnecessary regression risk.
- Cost efficiency: the system must remain within its operational budget.

These requirements may lead to different architectural choices. For example, caching could reduce repeated database work, but it may introduce freshness constraints. Additional service instances could increase processing capacity, but a shared database might remain the limiting factor.

An engineering decision should explain which quality requirement it addresses, what evidence supports the decision, and which trade-offs it introduces.

---

## 9. Quality Attributes Compete With One Another

Quality attributes are not always aligned. Improving one can weaken another or increase cost and complexity.

Examples include:

- Stronger redundancy can improve availability while increasing infrastructure cost.
- Aggressive caching can reduce latency while making data freshness harder to guarantee.
- Extensive abstraction can support some forms of change while making a small system harder to understand.
- Strict security checks can add processing overhead if implemented inefficiently.
- Extensive automated testing can improve confidence while increasing build time and maintenance effort.
- Horizontal scaling can increase capacity while introducing distributed coordination and operational complexity.

These conflicts are not reasons to ignore quality. They are reasons to make decisions explicitly.

### 9.1 Prioritizing quality attributes

When evaluating competing objectives, consider:

- Business impact if the attribute is not satisfied.
- User expectations.
- Probability and consequences of failure.
- Legal, security, or contractual obligations.
- Expected workload and growth.
- Implementation and operating cost.
- Complexity introduced by the solution.
- Evidence that the proposed solution will meet the requirement.

Avoid optimizing an attribute beyond its justified requirement while neglecting a more important constraint.

For example, reducing p95 latency from 100 milliseconds to 80 milliseconds may have little business value if the agreed target is 200 milliseconds and the optimization substantially increases infrastructure cost. That effort might be better spent improving reliability or addressing a known security risk.

The appropriate decision depends on context, not on an abstract ranking of quality attributes.

---

## 10. Common Engineering Mistakes

### 10.1 Treating quality as a final testing phase

Quality attributes should influence requirements and design before implementation. Discovering major performance or availability constraints near release can force expensive architectural changes.

### 10.2 Using vague requirements

Terms such as "fast," "scalable," and "highly available" are ambiguous without defined conditions and evaluation criteria.

### 10.3 Optimizing without evidence

Premature optimization can add complexity without improving a meaningful user or business outcome. Measure representative workloads and identify actual bottlenecks.

### 10.4 Confusing metrics with outcomes

High test coverage does not prove correctness. Low average latency does not guarantee acceptable tail latency. A successful health check does not prove that all critical business operations work.

Metrics are evidence, not complete definitions of quality.

### 10.5 Assuming every system needs the same priorities

A batch-processing system and an interactive API may have different performance requirements. A regulated financial service may have different security and audit obligations from an internal prototype.

Quality priorities must reflect the system's context.

### 10.6 Treating quality attributes as independent

A change that improves one characteristic may affect others. Caching, redundancy, abstraction, and additional validation all introduce trade-offs that should be evaluated.

### 10.7 Ignoring operational conditions

A system may perform well in development but fail under realistic concurrency, network latency, dependency outages, resource pressure, or production data volumes.

Quality claims should be validated under conditions representative of the intended environment.

---

## 11. Practical Engineering Workflow

Use the following workflow when working on a new feature or system.

### Step 1: Identify stakeholders and expectations

Determine who uses the system, what they need, and what constitutes an unacceptable outcome.

### Step 2: Identify the important quality attributes

Select the attributes that materially affect the system's success. Do not automatically prioritize every attribute equally.

### Step 3: Define measurable scenarios

Specify the operating condition, expected response, and evaluation method for each critical quality requirement.

### Step 4: Identify constraints and dependencies

Consider workload, data volume, external services, infrastructure, security requirements, budget, and operational capabilities.

### Step 5: Evaluate possible designs

Compare viable approaches against the prioritized requirements. Document meaningful trade-offs rather than selecting a solution solely because it is familiar.

### Step 6: Validate the decision

Use suitable evidence, such as load tests, integration tests, failure simulations, security assessments, or maintainability reviews.

### Step 7: Monitor quality after deployment

Production workloads and failure patterns can differ from expectations. Monitor relevant service-level indicators and revisit assumptions when evidence changes.

### Step 8: Reassess as the system evolves

New features, increased traffic, changing regulations, and new dependencies can alter the system's quality priorities.

Quality requirements should be revisited when their underlying assumptions change.

---

## 12. Knowledge Connections

Software quality attributes provide a foundation for the remainder of ENG-03.

| Topic | Connection to quality attributes |
|---|---|
| Software design principles | Establishes general principles that guide design decisions in support of desired quality. |
| Separation of concerns and abstraction | Helps reason about responsibility boundaries and the complexity of change. |
| Coupling and cohesion | Provides concepts for evaluating relationships between modules and their internal focus. |
| SOLID principles | Introduces specific design principles intended to improve selected aspects of software structure and changeability. |
| Dependency injection | Explores a technique for managing dependencies and supporting certain forms of testing and flexibility. |
| Layered and clean architecture | Examines architectural organization and dependency direction in relation to system requirements. |
| Design patterns | Presents recurring design solutions and the trade-offs they introduce. |
| Refactoring | Addresses improving internal structure while preserving externally observable behavior. |
| Technical debt | Examines the future cost and constraints created by design and implementation decisions. |

These later chapters explain specific principles, structures, and techniques. This chapter remains the primary location for the introductory definitions and high-level comparison of quality attributes.

Quality attributes also connect to future mentorship domains:

- **LLM Engineering:** latency, inference cost, reliability, and evaluation quality.
- **Retrieval Engineering:** retrieval latency, relevance, freshness, and scalability.
- **Agent Engineering:** task completion reliability, bounded execution, and observability.
- **Production AI Engineering:** deployment reliability, monitoring, performance, and recovery.
- **Enterprise AI Systems:** security, governance, availability, and operational constraints.

These connections illustrate how general software engineering concepts remain relevant when systems incorporate AI models and services.

---

## 13. Chapter Summary

Software quality is broader than functional correctness. A production system must satisfy relevant expectations for performance, reliability, availability, security, maintainability, and other characteristics.

The most important engineering lessons are:

1. Quality attributes describe how well a system meets stakeholder needs under defined conditions.
2. Quality priorities depend on business context and the consequences of failure.
3. Vague expectations should be translated into meaningful scenarios and measurable criteria where possible.
4. Architecture and implementation decisions should be evaluated against explicit quality requirements.
5. Improving one quality attribute may introduce costs or weaken another.
6. Metrics provide evidence, but no single metric fully captures every quality attribute.
7. Quality must be validated and monitored throughout the software lifecycle.

The objective is not to maximize every attribute indiscriminately. It is to make deliberate, evidence-based decisions about which qualities matter, what targets are required, and which trade-offs are acceptable.

---

## 14. Revision Checklist

Before moving to the next chapter, confirm that you can:

- [ ] Explain why functional correctness alone is insufficient for production software.
- [ ] Distinguish functional requirements from quality attributes.
- [ ] Explain maintainability, scalability, reliability, availability, extensibility, reusability, testability, performance, and security.
- [ ] Distinguish reliability from availability and performance from scalability.
- [ ] Convert a vague quality expectation into a measurable scenario.
- [ ] Explain why p95 or p99 latency may be more informative than average latency for some workloads.
- [ ] Identify at least three situations in which quality attributes compete.
- [ ] Explain how quality requirements influence architectural decisions.
- [ ] Describe how production evidence can validate or challenge an engineering decision.

### Teaching check

Without referring to the chapter, explain the following scenario:

A profile-search API currently handles 100 requests per second with acceptable latency. After a new product launch, traffic rises to 1,000 requests per second. Response times increase, some requests fail, and the infrastructure bill rises sharply.

Explain:

1. Which quality attributes are involved?
2. What evidence would you collect before changing the architecture?
3. Why would adding more application instances not necessarily solve the problem?
4. What trade-offs would you evaluate before selecting a solution?

A strong answer should identify the relevant attributes, distinguish symptoms from root causes, and propose evidence-based investigation rather than immediately choosing a technology.

---

## 15. Further Reading Within This Module

Continue in the approved chapter order:

1. [02 — Software Design Principles](02-Software-Design-Principles.md)
2. [03 — Separation of Concerns and Abstraction](03-Separation-of-Concerns-and-Abstraction.md)
3. [04 — Coupling and Cohesion](04-Coupling-and-Cohesion.md)

For the complete module structure and learning path, see [README.md](README.md).

---

*End of Chapter 01 — Software Quality Attributes.*
