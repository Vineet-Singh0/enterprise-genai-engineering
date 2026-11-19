# AI Service Reliability, SLIs, SLOs and Error Budgets

## Learning Objectives

By the end of this chapter, you should be able to:

- Define reliability for a production AI service.
- Explain the relationship between reliability and availability.
- Distinguish system reliability from AI quality.
- Identify user-visible reliability outcomes.
- Explain the purpose of Service-Level Indicators (SLIs).
- Design useful SLIs for AI services.
- Distinguish SLIs from Service-Level Objectives (SLOs).
- Explain how SLOs turn reliability expectations into measurable engineering objectives.
- Explain error budgets and how they connect reliability with engineering change.
- Distinguish an SLO from the organizational policy that acts on it.
- Reason about reliability targets and measurement boundaries.
- Identify AI-specific reliability characteristics that affect measurement.
- Design reliability measurements for synchronous and streaming AI services.
- Recognize the limitations and trade-offs of reliability metrics.
- Avoid common mistakes such as using availability as the only reliability measure.
- Distinguish operational reliability from AI evaluation and model quality.
- Reason about reliability from the user's perspective rather than only from infrastructure metrics.

---

## Prerequisites

Before studying this chapter, you should understand:

- Basic distributed-system concepts.
- HTTP and API request-response behavior.
- Application and service boundaries.
- Basic latency and throughput concepts.
- Production deployment concepts.
- Basic observability concepts.
- Basic AI inference and model-serving architecture.

You do not need prior knowledge of SLI, SLO, or error budgets.

---

## Estimated Reading Time

**45–60 minutes**

---

## Before We Start

Consider an AI application that exposes a chat API.

A request enters the system:

```text
User
  ↓
API Gateway
  ↓
AI Application
  ↓
Retriever
  ↓
Model Provider
  ↓
Response
```

Suppose the infrastructure team reports:

```text
CPU utilization: 42%
Memory utilization: 55%
Service uptime: 99.99%
```

At first glance, the service appears healthy.

But users report:

- requests sometimes take 20 seconds,
- streaming responses stop halfway through,
- some requests time out,
- model-provider failures are visible to users,
- retrieval occasionally fails,
- successful HTTP responses sometimes contain unusable application outcomes.

So we need a better question than:

> "Is the server up?"

The real engineering question is:

> **Is the service reliably delivering the outcome users and the business expect?**

That question is the starting point for production AI reliability.

---

# Why This Exists

Reliability is often discussed using vague statements:

- "The system should be highly reliable."
- "The API should be available."
- "We need five nines."
- "The service should not fail."

These statements are insufficient for engineering.

A production team needs to know:

1. What outcome matters?
2. How will we measure it?
3. What level is acceptable?
4. Over what time period?
5. What happens when the system falls below that level?
6. How much unreliability are we willing to accept?

SLIs, SLOs, and error budgets provide a framework for answering those questions.

The important progression is:

```text
User expectation
      ↓
Reliability objective
      ↓
Measurement
      ↓
Target
      ↓
Allowed unreliability
      ↓
Engineering decision
```

This turns reliability from an aspiration into something engineers can reason about.

---

# Mental Model

A useful mental model is:

```text
                    User / Business Outcome
                            │
                            ▼
                    Reliability Objective
                            │
                            ▼
                  Service-Level Indicator
                            │
                            ▼
                  Service-Level Objective
                            │
                            ▼
                      Error Budget
                            │
                            ▼
                  Engineering Decisions
```

The key distinction is:

```text
SLI
What are we measuring?

SLO
What level do we want?

Error Budget
How much unreliability is permitted?

Policy
What engineering action follows?
```

An SLO defines an objective.

An error budget quantifies the deviation permitted by that objective.

A policy determines what the organization or engineering team does in response to the measured reliability state.

These concepts are related, but they are not interchangeable.

---

# 1. What Is Reliability?

Reliability is the ability of a system to provide acceptable behavior over time and under expected operating conditions, including conditions involving variation and failure.

For a production AI system, reliability may involve:

- requests being accepted when appropriate,
- responses arriving within acceptable time,
- responses completing successfully,
- streaming sessions remaining usable,
- critical dependencies remaining available,
- asynchronous jobs eventually completing,
- service behavior remaining predictable during expected variation.

The exact definition depends on the system.

There is no single reliability metric that applies equally to every AI workload.

A useful abstraction is:

```text
Reliability
=
Consistent delivery of an acceptable service outcome
under defined operating conditions
```

The important word is **acceptable**.

A system does not need to succeed perfectly under every possible condition to be reliable.

Instead, engineers define:

- expected behavior,
- acceptable failure,
- measurable objectives,
- and appropriate boundaries.

---

# 2. Reliability Is Not the Absence of Failure

Distributed systems fail.

AI systems add additional sources of variation and dependency:

```text
Traffic variation
      ↓
Resource pressure
      ↓
Queueing
      ↓
Latency increase

External provider failure
      ↓
Dependency error
      ↓
Request failure

Model inference variation
      ↓
Longer processing
      ↓
Timeout risk
```

Therefore, designing for reliability does not mean pretending failure will never happen.

It means defining how much failure is acceptable and ensuring that the system behaves predictably within those expectations.

This gives us a more useful model:

```text
Reliability
      ≠
No failures

Reliability
      =
Acceptable behavior despite expected variation and failure
```

The mechanisms for controlling failure are covered later in:

- File 02 — failure isolation, timeouts, retries, and backpressure.
- File 03 — graceful degradation, fallbacks, and dependency failure.

This file focuses on **how reliability is defined and measured**.

---

# 3. Reliability vs Availability

Availability asks a relatively narrow question:

> Is the service available according to a defined availability criterion?

Reliability is broader.

It asks:

> Does the service consistently provide the expected operational outcome?

Consider an AI API that returns HTTP `200` for every request.

The API may technically satisfy one availability criterion.

But suppose:

- requests frequently take 30 seconds,
- streaming terminates unexpectedly,
- requests return empty responses,
- critical application operations fail after the HTTP response,
- or the service accepts requests that it cannot complete within an acceptable deadline.

Then:

```text
Availability may look good
while
User-visible reliability is poor.
```

Availability is therefore an important reliability dimension, but it is not a complete definition of reliability.

A useful relationship is:

```text
                    Reliability
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
     Availability     Timeliness     Completion
```

Depending on the workload, additional dimensions may matter.

---

# 4. User-Visible Reliability

Infrastructure metrics describe system behavior.

Users experience outcomes.

These are not always identical.

For example:

```text
Infrastructure:
Model server is healthy.

User:
My response never arrived.
```

Or:

```text
Infrastructure:
HTTP request returned 200.

User:
The AI interaction failed.
```

Or:

```text
Infrastructure:
Database availability = 99.99%.

User:
My generated report was never completed.
```

Therefore, reliability measurement should begin with the **service outcome** rather than starting with available infrastructure metrics.

Ask:

> What does a successful user interaction actually mean?

For a synchronous AI API, it might mean:

```text
Request accepted
    ↓
Processing completed
    ↓
Valid service response returned
    ↓
Within the defined latency boundary
```

For a streaming AI application:

```text
Request accepted
    ↓
Stream begins
    ↓
Tokens/events continue
    ↓
Stream completes normally
```

For an asynchronous AI workflow:

```text
Job accepted
    ↓
Job processed
    ↓
Result becomes available
    ↓
Result available within defined completion window
```

The reliability measurement must reflect the actual service contract.

---

# 5. Service-Level Indicators

A **Service-Level Indicator (SLI)** is a quantitative measurement of a service behavior relevant to reliability.

In simple terms:

> **An SLI tells us what aspect of service behavior we are measuring.**

Common reliability dimensions that can be represented by SLIs include:

| Reliability dimension | Reliability question |
|---|---|
| Availability | Was the service available according to the defined criterion? |
| Success | Did the operation complete successfully? |
| Latency | Did the operation complete within an acceptable time? |
| Completion | Did the workflow reach its intended completion state? |
| Freshness | Was the information sufficiently current? |

These are not mandatory or universal SLI categories.

Not every service needs every dimension.

The appropriate set depends on the service contract.

For example:

```text
Successful requests = 99,200
Eligible requests   = 100,000

Success-rate SLI
=
99.2%
```

The measurement itself is the SLI.

It does not yet tell us whether `99.2%` is acceptable.

That is the job of the SLO.

---

# 6. What Makes a Good SLI?

A useful SLI should be:

- relevant to the service outcome,
- measurable,
- consistently defined,
- based on an explicit measurement boundary,
- interpretable,
- stable enough for comparison over time,
- useful for engineering decisions.

The most important question is:

> **Does this metric represent something users actually care about?**

A metric can be technically precise and still be a poor SLI.

For example:

```text
CPU utilization
```

is measurable.

But CPU utilization does not directly answer:

> Did the user receive the expected AI service?

CPU can be useful for diagnosing reliability problems, but it is generally not sufficient as the primary user-facing reliability indicator.

---

# 7. Event-Based Thinking

Many reliability SLIs can be expressed using:

```text
Good Events
────────────
Eligible Events
```

For example, suppose an AI API defines a successful request as one that:

- completes successfully,
- does not exceed the service deadline,
- and produces a valid service-level response.

Then:

```text
Success Rate
=
Successful Eligible Requests
────────────────────────────
Total Eligible Requests
```

This structure forces an important engineering question:

> What exactly counts as a good event?

That definition is often more important than the final percentage.

---

# 8. SLI Measurement Boundaries

An SLI must have a clear measurement boundary.

Consider:

```text
User
  ↓
API Gateway
  ↓
Application
  ↓
Retriever
  ↓
Model Provider
  ↓
Response
```

Suppose the application measures only:

```text
Application → Model Provider
```

The metric might show excellent model-provider success.

But the user may still experience failure because:

- authentication fails,
- gateway rejects requests,
- retrieval fails,
- application processing fails,
- response delivery fails.

Therefore:

```text
Measurement Boundary
        ↓
Must match
        ↓
Reliability Question
```

If the question is:

> "How reliably does the user receive a completed AI response?"

then measuring only model-provider availability is insufficient.

This does not mean dependency measurements are useless.

They answer a different question:

```text
Dependency SLI
       ≠
User-facing Service SLI
```

The dependency SLI may help explain why the service SLI changed, while the service SLI measures the outcome that matters to the consumer.

---

# 9. Availability as an SLI

Availability can be represented as the proportion of eligible time or requests during which the service is available according to a defined availability criterion.

For example:

```text
Available Requests
───────────────────
Eligible Requests
```

The exact availability criterion must be explicit.

For an API, an organization might define availability in terms of whether the endpoint can successfully accept and process eligible requests according to its availability contract.

For another system, availability might be defined as:

```text
Service endpoint is reachable
and
accepts eligible requests
```

These definitions are not necessarily equivalent.

Therefore:

> Never use the word "available" without defining what availability means.

Availability is one dimension of service reliability.

It should not silently absorb every other reliability requirement such as correctness, completion, or latency.

---

# 10. Latency as an SLI

Latency is often an important reliability dimension for AI systems.

But average latency is frequently insufficient.

Consider:

```text
Requests:
10 ms
20 ms
30 ms
40 ms
10 seconds
```

The average may hide the fact that a small group of users experience extremely high latency.

For this reason, latency SLIs are often expressed using distributions or percentiles.

Examples:

```text
p50 latency
p95 latency
p99 latency
```

Conceptually:

```text
p50
↓
Typical request experience

p95
↓
Slower tail experience

p99
↓
Very slow tail experience
```

The correct percentile depends on the service and user impact.

The important engineering question is:

> Which part of the latency distribution represents the user experience we need to protect?

---

# 11. AI Latency Is Often Variable

AI workloads can have more variable processing times than simple CRUD-style APIs.

Possible contributors include:

```text
Request size
    +
Prompt length
    +
Model selection
    +
Token generation
    +
Retrieval
    +
Tool execution
    +
Provider load
    +
Queueing
```

Therefore, AI latency should not automatically be treated as a single fixed value.

For example:

```text
Short prompt
    ↓
Fast inference

Large prompt
    ↓
Longer processing

Long output
    ↓
Longer generation

Tool-enabled request
    ↓
Additional dependency latency
```

This makes latency SLI design particularly important.

The SLI should reflect the actual workload and service contract.

---

# 12. Streaming AI Services

Streaming AI services require special consideration.

Suppose a model starts returning tokens:

```text
Request
   ↓
Stream starts
   ↓
Token
   ↓
Token
   ↓
Token
   ↓
Connection breaks
```

Was this request successful?

A simple HTTP success metric may say:

```text
HTTP 200
```

But the user may have received only a partial response.

Therefore, streaming systems may need separate reliability measurements such as:

- stream-start success,
- stream completion rate,
- abnormal stream termination rate,
- time to first output,
- completion within an expected boundary.

These measurements should be defined according to the actual streaming contract.

A streaming service should not automatically reuse a non-streaming success definition.

---

# 13. Asynchronous AI Workloads

Not every AI workload is request-response.

Consider:

```text
User
  ↓
Submit document
  ↓
Job accepted
  ↓
Queue
  ↓
AI processing
  ↓
Result available
```

The user may not expect an immediate answer.

Instead, reliability may depend on:

- job acceptance,
- successful processing,
- completion within a defined window,
- result availability,
- notification delivery.

A useful reliability question becomes:

> What does successful completion mean for this asynchronous workflow?

This prevents engineers from forcing synchronous API metrics onto asynchronous systems.

---

# 14. Success and Failure SLIs

Success/failure SLIs can be useful for AI services.

Examples:

```text
Successful requests / eligible requests

Completed jobs / eligible jobs

Successfully completed streams / eligible streams
```

But the definition of success must be explicit.

For example, an HTTP `200` response may not necessarily mean that the business operation succeeded.

Consider:

```text
HTTP request
    ↓
200 OK
    ↓
Application reports:
"Processing failed"
```

If the reliability question concerns successful business completion, then counting every HTTP `200` as success produces a misleading SLI.

This is why:

> **Protocol success and service success are not always the same thing.**

---

# 15. Timeout Rate

Timeouts can be a useful reliability signal.

For example:

```text
Timeout Rate
=
Timed-Out Eligible Requests
───────────────────────────
Eligible Requests
```

However, timeout rate should be interpreted in relation to the service's defined timeout boundary.

Suppose:

```text
Client timeout = 5 seconds
Service timeout = 30 seconds
Provider timeout = 60 seconds
```

A client may report failure even though the service continues processing.

This means reliability measurement needs clearly defined boundaries.

Timeout mechanics and timeout architecture belong to File 02.

Here, the focus is:

> What does a timeout represent as a reliability measurement?

---

# 16. Dependency Failure Rate

An AI service may depend on:

```text
Retriever
Database
Model provider
Tool service
Object storage
Authentication service
```

Each dependency can have its own success and failure signals.

Dependency metrics can be useful for understanding system reliability.

However, dependency health is not automatically equivalent to user-visible reliability.

For example:

```text
Model provider success = 99.9%
```

does not necessarily imply:

```text
AI application reliability = 99.9%
```

The application may have additional failure points.

Therefore:

```text
Dependency SLI
       ≠
Service SLI
```

They are related measurements with different boundaries.

---

# 17. Freshness as a Reliability Dimension

Freshness matters when users depend on information being current.

Examples include:

- retrieval systems,
- recommendation systems,
- monitoring systems,
- financial information systems,
- operational knowledge systems.

Suppose a retrieval service returns cached information successfully.

Technically:

```text
Request succeeded
```

But if the information is too old for the service's purpose:

```text
User outcome may still be unacceptable.
```

Therefore, some systems may need freshness-related reliability measures.

For example:

```text
Percentage of responses using data
within the permitted freshness window
```

Freshness is not universally required.

It is appropriate only when freshness is part of the service contract.

---

# 18. Correctness-Related Reliability Boundaries

AI services create an important boundary between **operational reliability** and **AI correctness**.

Consider:

```text
Request
  ↓
Model
  ↓
Response
```

Suppose the model returns:

```text
"Paris is the capital of Germany."
```

The service may have:

- completed successfully,
- returned within the latency objective,
- experienced no infrastructure failure.

Yet the answer is incorrect.

This raises two separate questions:

```text
Reliability Question
Did the service successfully deliver the expected operational outcome?

AI Quality Question
Was the AI response correct, useful, safe, or otherwise acceptable?
```

These questions can interact, but they are not identical.

Therefore:

```text
System Reliability
        ≠
AI Quality
```

AI evaluation methodology and production AI quality measurement belong to the appropriate AI evaluation and lifecycle curriculum, with PROD-11 owning the production evaluation and continuous-improvement responsibilities defined for that domain.

---

# 19. Reliability and Business Outcomes

Reliability should ultimately connect to the purpose of the service.

Consider an AI customer-support system.

A useful reliability chain may be:

```text
Request
   ↓
Response generated
   ↓
Response delivered
   ↓
Response delivered within acceptable time
   ↓
Conversation remains usable
```

For an asynchronous document-processing system:

```text
Document submitted
   ↓
Job accepted
   ↓
Processing completed
   ↓
Result available within SLA
```

For a retrieval-augmented application:

```text
Request
   ↓
Retrieval available
   ↓
Generation completed
   ↓
Response delivered
```

The correct reliability definition depends on the product contract.

---

# 20. Service-Level Objectives

An **SLO** is a target for an SLI over a defined measurement window.

In simple terms:

```text
SLI
What are we measuring?

SLO
What level do we want?
```

For example:

```text
SLI:
Successful requests / eligible requests

SLO:
≥ 99.9% over the defined measurement window
```

The SLO transforms a measurement into an engineering objective.

Without an objective:

```text
Latency = 800 ms
```

is just a measurement.

With an objective:

```text
p95 latency ≤ 1 second
```

the same measurement becomes something engineers can evaluate.

---

# 21. SLOs Must Have a Defined Scope

An SLO should define:

- the service,
- the measured behavior,
- the eligible population,
- the target,
- the measurement window,
- and the relevant boundary.

For example:

```text
Service:
AI response API

SLI:
Successful eligible requests

Target:
99.9%

Window:
30 days

Boundary:
User-facing API completion
```

Without these details, statements such as:

> "The service has a 99.9% SLO."

can be ambiguous.

99.9% of what?

Over what period?

Measured where?

Using which success definition?

These questions matter.

---

# 22. Reliability Targets

A reliability target should reflect the actual needs of the service.

Do not assume:

> Higher reliability is always better.

Higher reliability targets generally require additional engineering effort, operational discipline, redundancy, capacity, and cost.

For example:

```text
Target A
99.0%

Target B
99.9%

Target C
99.99%
```

Moving toward a stricter target generally reduces the amount of tolerated unreliability.

But the business value of that additional reliability must justify its cost.

This is an engineering decision, not a universal rule.

---

# 23. The Error Budget

An **error budget** represents the amount of unreliability permitted by an SLO during its measurement window.

Suppose the SLO is:

```text
99.9% successful requests
```

Then the allowed unreliability is:

```text
100% - 99.9%
=
0.1%
```

That `0.1%` is the error budget.

Conceptually:

```text
100%
│
├────────────── Reliable target
│
│   SLO = 99.9%
│
└── Error budget = 0.1%
```

The error budget provides a practical way to reason about acceptable failure.

Instead of saying:

> "The system must never fail."

the organization can say:

> "Within this defined window, this amount of unreliability is acceptable."

---

# 24. Error Budget as an Engineering Constraint

An error budget is more useful when it influences engineering decisions.

For example:

```text
Large remaining error budget
        ↓
More room for change

Small remaining error budget
        ↓
Reliability risk is increasing

Budget exhausted
        ↓
The measured service behavior has exceeded
the unreliability permitted by the SLO
for the defined measurement window
```

This can influence decisions such as:

- release risk,
- infrastructure changes,
- architectural work,
- reliability improvements,
- feature prioritization.

The exact organizational policy depends on the team and service.

The important idea is:

> Reliability objectives should influence engineering behavior.

---

# 25. Error Budget Is Not Permission to Fail

A common misunderstanding is:

> "We have a 0.1% error budget, so we should intentionally spend it."

That is incorrect.

The error budget represents tolerated unreliability within the defined objective.

It is not a target for failure.

The goal remains to provide reliable service while using the budget as a decision boundary.

---

## 26. Error Budget and Change Velocity

Reliability and feature development can compete for engineering attention.

Suppose a service has:

```text
Healthy reliability
+
Remaining error budget
```

The organization may have more room to introduce changes.

Suppose reliability deteriorates:

```text
Error budget consumption ↑
```

Then reliability work may become more urgent.

The important relationship is:

```text
Reliability Objective
        ↓
Error Budget
        ↓
Risk Tolerance
        ↓
Engineering Change Decisions
```

This creates a bridge between reliability engineering and software delivery.

The specific action taken when the budget is consumed is a **policy decision**, not part of the mathematical definition of the error budget.

---

# 27. Error Budget Calculation

Suppose a service has:

```text
SLO = 99.9%
Measurement window = 30 days
```

Allowed unreliability:

```text
100% - 99.9%
=
0.1%
```

A 30-day month with approximately 43,200 minutes contains:

```text
43,200 × 0.001
=
43.2 minutes
```

of equivalent time-based error budget.

The exact interpretation depends on the SLI.

If the SLI is request success rather than availability time, the budget is expressed in eligible request outcomes instead.

This distinction matters.

```text
Time-based SLI
    ↓
Time-based error budget

Request-based SLI
    ↓
Request-based error budget
```

Do not blindly convert every SLO into minutes.

---

# 28. SLOs and Multiple SLIs

A production AI service may need more than one reliability dimension.

For example:

```text
SLO 1
Successful request rate

SLO 2
Latency

SLO 3
Streaming completion rate
```

This can better represent the actual service contract.

However, adding more SLOs increases complexity.

Each additional objective requires:

- measurement,
- interpretation,
- ownership,
- and decision-making.

Therefore:

> More SLIs and SLOs do not automatically produce better reliability engineering.

The goal is meaningful measurement.

---

# 29. Choosing Reliability SLIs for AI Services

A useful starting framework is:

```text
1. Identify the user-visible outcome.

2. Define what counts as successful.

3. Identify eligible events.

4. Identify unacceptable outcomes.

5. Select the smallest useful set of measurements.

6. Define the measurement boundary.

7. Choose an appropriate target.

8. Validate that the metric drives useful engineering decisions.
```

For example:

### Synchronous AI API

Potential dimensions:

```text
Request success
Latency
Timeouts
```

### Streaming AI API

Potential dimensions:

```text
Stream start
Time to first output
Stream completion
Abnormal termination
```

### Asynchronous AI processing

Potential dimensions:

```text
Job acceptance
Job completion
Completion latency
Result availability
```

The exact set depends on the workload.

---

# 30. SLI Design Example — Chat API

Suppose we operate:

```text
POST /chat
```

A naive reliability metric might be:

```text
HTTP 200 rate
```

But suppose the service can return:

```text
200 + empty response
200 + application failure
200 + partial response
200 + extremely late response
```

Then HTTP status alone may not represent service reliability.

A stronger definition could be:

```text
Good request
=
Request accepted
AND
AI response completed
AND
response delivered
AND
completion occurred within the defined service boundary
```

The SLI then becomes:

```text
Good eligible requests
───────────────────────
Eligible requests
```

The exact definition should be documented as part of the service contract.

---

# 31. SLI Design Example — Streaming

Suppose a streaming AI service begins successfully but disconnects before completion.

A simple request-success SLI might classify:

```text
HTTP 200
```

as successful.

But a user may experience:

```text
Response started
      ↓
Partial output
      ↓
Connection terminated
```

Therefore, a streaming reliability model may distinguish:

```text
Stream start success
        +
Stream completion success
        +
Expected termination behavior
```

This produces a more representative reliability measurement.

---

# 32. SLI Design Example — Asynchronous Processing

Consider an AI document-processing service:

```text
Upload document
       ↓
Job accepted
       ↓
AI processing
       ↓
Result generated
       ↓
Result available
```

Suppose the service promises:

> Process submitted documents within 10 minutes under normal operating conditions.

A useful SLI could measure:

```text
Jobs completed within 10 minutes
────────────────────────────────
Eligible jobs
```

This is more meaningful than:

```text
Worker CPU utilization
```

or:

```text
Queue process is running
```

Those infrastructure metrics may help diagnose problems, but they do not directly represent the promised user outcome.

---

# 33. Reliability Measurement and Observability

PROD-05 owns observability architecture and telemetry/signal design.

This chapter uses those observability signals as inputs to reliability measurement.

The boundary is:

```text
PROD-05
How do we instrument, collect, correlate, and expose evidence
about system behavior?

PROD-06.01
Which measured service behaviors should represent reliability,
and what objectives should those behaviors meet?
```

For example:

```text
Telemetry
   ↓
Measured service behavior
   ↓
SLI
   ↓
SLO evaluation
```

The same telemetry system may support many engineering purposes.

The reliability question determines which measurements matter.

This chapter does not re-teach:

- telemetry architecture,
- log design,
- metric architecture,
- trace architecture,
- instrumentation strategy.

Those belong to PROD-05.

---

# 34. Reliability Measurement Trade-offs

Every measurement choice has trade-offs.

## Broad measurement boundary

Advantages:

- closer to user experience,
- captures more failure modes.

Disadvantages:

- more complex,
- harder to isolate individual causes.

## Narrow measurement boundary

Advantages:

- easier to understand,
- easier to diagnose.

Disadvantages:

- may miss upstream or downstream failures,
- may not represent user experience.

Therefore:

> The best SLI boundary depends on the question the SLI is intended to answer.

---

## 35. Aggregate Metrics Can Hide Failure

Suppose:

```text
Overall success rate = 99.9%
```

That looks excellent.

But segmentation might reveal:

```text
Region A = 99.99%
Region B = 98.0%
```

Or:

```text
Short requests = 99.99%
Long requests = 95%
```

Or:

```text
Standard model = 99.99%
Premium model = 97%
```

Or:

```text
Normal traffic = 99.99%
Peak traffic = 92%
```

Therefore, aggregate reliability can hide important failure patterns.

The solution is not necessarily to create dozens of SLOs.

Instead, engineers should understand the dimensions that materially affect reliability and investigate meaningful segmentation when necessary.

---

# 36. Reliability and Workload Segmentation

AI services often have heterogeneous workloads.

Examples:

```text
Small prompts
Large prompts

Short generations
Long generations

Text-only
Multimodal

Synchronous
Asynchronous

Standard model
Large model

Cached
Non-cached

Simple request
Tool-enabled request
```

These workloads may have different reliability characteristics.

An SLI should therefore be designed with awareness of the workload.

However, segmentation should remain purposeful.

Do not create separate reliability objectives for every possible request attribute without a clear engineering reason.

---

# 37. Reliability Under Normal Variation

Reliability objectives must account for expected workload variation.

For example:

```text
Normal traffic
    ↓
Expected behavior

Moderate traffic increase
    ↓
Expected behavior within defined limits

Expected dependency latency variation
    ↓
Service remains within objective
```

This does not mean that the system must tolerate unlimited load.

Capacity planning and scaling belong to PROD-07.

PROD-06 asks:

> Within the service's defined operating conditions, what behavior constitutes reliable service?

---

# 38. Reliability and Partial Failure

A distributed AI system may be partially operational.

For example:

```text
API Gateway       ✓
Application       ✓
Retriever         ✗
Model Provider    ✓
Database          ✓
```

The service is neither simply:

```text
100% healthy
```

nor:

```text
100% unavailable
```

It is partially failed.

This creates an important reliability question:

> What user-visible outcome should count as acceptable when only part of the system is unavailable?

The detailed mechanisms for handling partial failure belong to Files 02 and 03.

This file establishes that partial failure must be reflected in the definition of reliable service where relevant.

---

# 39. Reliability Objectives Should Be Explicit

A reliability objective should be understandable by multiple engineering functions.

For example:

```text
Service:
AI summarization API

Reliability objective:
99.9% of eligible requests should complete successfully
within the defined request deadline
over a rolling 30-day window.
```

This is significantly more actionable than:

> "The summarization API should be reliable."

The objective provides:

```text
Service
+
Outcome
+
Measurement
+
Target
+
Time window
+
Boundary
```

That is the foundation of reliability engineering.

---

# 40. Reliability Architecture and Measurement

Reliability objectives should influence architecture.

Consider:

```text
Requirement:
99.9% successful completion
within defined latency
```

This requirement may influence:

```text
Architecture
    ↓
Dependency selection
    ↓
Timeout boundaries
    ↓
Failure handling
    ↓
Fallback strategy
    ↓
Capacity decisions
    ↓
Observability
```

The SLO does not directly dictate every architecture decision.

Instead, it provides a measurable objective against which architecture can be evaluated.

The detailed mechanisms for timeout, failure handling, fallback, and capacity remain owned by the relevant production chapters.

---

# 41. Reliability Control Interaction

This file establishes the measurement foundation.

Later files address mechanisms that influence the measured outcomes.

Conceptually:

```text
                  Reliability Objective
                          │
                          ▼
                     SLI / SLO
                          │
                          ▼
                 User-visible Outcome
                          ▲
                          │
              Reliability Controls
                          │
       ┌──────────┬───────┼────────┬──────────┐
       │          │       │        │          │
   Isolation   Timeout  Retry  Backpressure  Degradation
```

The important relationship is:

```text
Controls
    ↓
System behavior
    ↓
Measured outcome
    ↓
SLO evaluation
```

File 02 focuses on failure-control mechanisms.

File 03 focuses on degradation and dependency-failure behavior.

---

# 42. What This File Does Not Teach

To preserve concept ownership, this file does not deeply teach:

- timeout implementation,
- deadline propagation,
- retry algorithms,
- exponential backoff implementation,
- jitter implementation,
- retry storms,
- circuit-breaker implementation,
- concurrency limiting,
- queue control,
- load shedding,
- detailed failure isolation,
- graceful degradation strategies,
- fallback implementation.

Those concepts belong primarily to Files 02 and 03.

This file establishes the **reliability objectives and measurement foundation that those mechanisms ultimately protect**.

---

## Common Mistakes and Misconceptions

## 1. Using infrastructure health as the main SLI

Example:

```text
CPU < 80%
```

This does not directly represent user-visible reliability.

### Better approach

Connect the SLI to the service outcome.

---

## 2. Treating availability as the entire definition of reliability

A service can be available but:

- extremely slow,
- incomplete,
- operationally unsuccessful,
- or unusable.

### Better approach

Use the reliability dimensions relevant to the service contract.

---

## 3. Using HTTP 200 as universal success

HTTP status describes protocol behavior.

It does not necessarily describe application or business success.

### Better approach

Define service-level success explicitly.

---

## 4. Using average latency as the only latency metric

Averages can hide tail behavior.

### Better approach

Use appropriate distribution-based measurements when tail latency matters.

---

## 5. Creating too many SLIs or SLOs

More metrics can create:

- measurement complexity,
- conflicting objectives,
- operational overhead,
- unclear priorities.

### Better approach

Measure what materially represents the service outcome.

---

## 6. Creating SLOs without defining eligibility

If it is unclear which requests are included, the objective becomes difficult to interpret.

### Better approach

Define eligible events explicitly.

---

## 7. Setting unrealistic reliability targets

An extremely strict SLO may require disproportionate engineering effort.

### Better approach

Choose a target based on user needs, business impact, architecture, and cost.

---

## 8. Treating error budget as a failure target

An error budget is not permission to fail.

### Better approach

Use it as a risk and engineering decision boundary.

---

## 9. Measuring model quality as service reliability

A model can produce poor answers while the service remains operationally reliable.

### Better approach

Separate operational reliability from AI evaluation.

---

## 10. Ignoring workload differences

An SLI that works for short synchronous requests may be inappropriate for streaming or asynchronous workloads.

### Better approach

Design measurements around the actual service contract.

---

## 11. Treating SLOs as automatic operational policies

An SLO defines a reliability objective.

It does not by itself define what the organization must do when the objective is missed or the error budget is consumed.

### Better approach

Separate:

```text
SLO
    ↓
Reliability objective

Policy
    ↓
Engineering response to reliability state
```

---

# Production Perspective

In a production organization, reliability objectives should not exist only inside documentation.

They should influence engineering decisions.

A simplified lifecycle is:

```text
Define service contract
        ↓
Identify user-visible outcomes
        ↓
Define SLIs
        ↓
Set SLOs
        ↓
Measure actual behavior
        ↓
Evaluate error-budget consumption
        ↓
Apply relevant engineering policy
        ↓
Improve system reliability
```

This creates a feedback loop:

```text
Production Behavior
        ↓
Measurement
        ↓
Reliability Evaluation
        ↓
Engineering Decision
        ↓
System Change
        ↓
New Production Behavior
```

Reliability is therefore not a one-time architecture exercise.

It is an ongoing engineering discipline.

---

# Engineering Decisions and Trade-offs

## Reliability vs Cost

Higher reliability may require:

- redundancy,
- additional capacity,
- stronger isolation,
- additional dependencies,
- more operational complexity.

These increase cost.

The correct question is:

> What level of reliability is justified by the value and impact of the service?

---

## Reliability vs Feature Velocity

Stricter reliability objectives can increase the engineering discipline required before changes are released.

This can reduce short-term change velocity while improving long-term service stability.

The correct balance depends on the service.

---

## Reliability vs User Experience

A system might choose:

```text
Fast failure
```

instead of:

```text
Very long waiting time
```

Both are failures in one sense, but their user impact differs.

Reliability engineering therefore includes user-visible behavior, not just infrastructure survival.

---

## Reliability vs Functionality

A degraded system may provide:

```text
Reduced functionality
```

instead of:

```text
Complete failure
```

Whether this is acceptable depends on the service contract.

Graceful degradation and fallback architecture are covered in File 03.

---

# Reliability Decision Framework

When defining or evaluating an AI-service reliability objective, reason through:

```text
1. What service are we measuring?

2. What user-visible outcome matters?

3. What counts as a successful outcome?

4. Which events are eligible?

5. Where should measurement begin and end?

6. Which reliability dimensions matter?
   - availability
   - success
   - latency
   - completion
   - freshness
   - other workload-specific dimensions

7. What target is appropriate?

8. Over what measurement window?

9. What amount of unreliability is acceptable?

10. What engineering decisions should the objective influence?

11. What failure modes could the metric hide?

12. Does the measurement accidentally become an AI-quality metric?

13. What policy should apply when reliability deteriorates?
```

This framework should be applied before selecting a metric or target.

---

# Interview Questions with Expected Answers

## 1. What is the difference between an SLI and an SLO?

**Expected answer:**

An SLI is a quantitative measurement of service behavior. An SLO is the target level of that measurement over a defined scope and time window.

```text
SLI → What are we measuring?
SLO → What level do we want?
```

---

## 2. Why is availability alone insufficient for an AI service?

**Expected answer:**

A service can be available while still being unreliable from the user's perspective because requests may be excessively slow, incomplete, timed out, or otherwise unable to deliver the expected service outcome.

---

## 3. What makes a good SLI for an AI API?

**Expected answer:**

It should represent a meaningful user-visible service outcome, have a clear measurement boundary, define eligible events and success criteria, and provide information useful for engineering decisions.

---

## 4. Why can HTTP 200 be a poor reliability SLI?

**Expected answer:**

HTTP 200 indicates protocol-level success, not necessarily successful application or business completion. An AI service could return 200 while producing an empty, incomplete, or otherwise failed application outcome.

---

## 5. What is an error budget?

**Expected answer:**

An error budget is the amount of unreliability permitted by an SLO during its measurement window.

For a 99.9% SLO, the corresponding budget is 0.1% of the eligible measurement population, subject to the SLI definition.

---

## 6. Why are SLOs important?

**Expected answer:**

They turn vague reliability expectations into measurable engineering objectives and provide a basis for evaluating system behavior and making engineering decisions.

---

## 7. Why is reliability different from AI quality?

**Expected answer:**

Reliability concerns whether the service delivers its expected operational outcome predictably. AI quality concerns whether the model behavior meets defined quality criteria such as correctness or usefulness.

---

## 8. Why might a streaming AI service need different SLIs from a normal API?

**Expected answer:**

A streaming request can begin successfully but terminate before completion. Therefore, request-level success alone may not capture the actual user experience. Stream completion and abnormal termination may need separate measurement.

---

## 9. Why can average latency be misleading?

**Expected answer:**

An average can hide tail latency. A small percentage of extremely slow requests may have significant user impact even when the average looks healthy.

---

## 10. Why should an SLI have a clear measurement boundary?

**Expected answer:**

Because different boundaries answer different reliability questions. Measuring only one internal dependency may show that dependency is healthy while the user-facing service is still failing.

---

## 11. Should every AI service have the same SLOs?

**Expected answer:**

No. SLOs should reflect the service contract, workload characteristics, user expectations, and business impact.

---

## 12. Is a higher SLO always better?

**Expected answer:**

No. A stricter SLO generally requires more engineering effort, redundancy, operational discipline, and cost. The target should be justified by the service's requirements.

---

## 13. What is the relationship between SLO and error budget?

**Expected answer:**

The SLO defines the acceptable reliability level. The error budget is the corresponding amount of unreliability permitted by that objective.

---

## 14. Why should reliability measurement consider workload type?

**Expected answer:**

Different AI workloads can have different latency, completion, and dependency characteristics. A metric appropriate for a short synchronous API may not represent a streaming or asynchronous workload correctly.

---

## 15. How would you measure reliability for an asynchronous AI job?

**Expected answer:**

Define the successful outcome first. Depending on the service contract, useful measurements may include job acceptance, successful completion, completion within a defined time window, and result availability.

---

## 16. Can a service be highly available but unreliable?

**Expected answer:**

Yes. Availability may be high while user-visible outcomes are poor because of excessive latency, incomplete responses, timeouts, or application-level failures.

---

## 17. What is the difference between a dependency SLI and a service SLI?

**Expected answer:**

A dependency SLI measures the behavior of an individual dependency. A service SLI measures the outcome of the service being provided to its consumers. A healthy dependency does not guarantee a healthy end-to-end service.

---

## 18. Why is defining "good" more important than simply collecting metrics?

**Expected answer:**

Because the metric is useful only if it represents the outcome that matters. A technically precise metric can still be irrelevant if it measures an internal condition rather than the service contract.

---

## 19. What is the difference between an SLO and an operational policy?

**Expected answer:**

An SLO defines the reliability objective. An operational policy defines what engineering or organizational action should occur when reliability changes or the error budget is consumed.

---

# Quick Revision

## Reliability

```text
Reliable service
=
Predictable delivery of acceptable outcomes
under defined operating conditions
```

## Availability

```text
Availability
=
Whether the service is available
according to a defined availability criterion
```

Availability is important but narrower than reliability.

## SLI

```text
SLI
=
What are we measuring?
```

Examples:

- success rate,
- latency,
- completion rate,
- timeout rate,
- freshness.

## SLO

```text
SLO
=
What level do we want?
```

Example:

```text
99.9% successful eligible requests
over a defined measurement window
```

## Error Budget

```text
Error Budget
=
Allowed unreliability implied by the SLO
```

For:

```text
SLO = 99.9%
```

the corresponding budget is:

```text
0.1%
```

of the relevant measurement population.

## Policy

```text
Policy
=
What engineering action follows
from the reliability state?
```

The policy is not part of the mathematical definition of the SLO or error budget.

## AI Reliability

AI services may require workload-specific consideration of:

```text
Inference latency
Streaming
Provider dependency
Quota
Retrieval
Tools
GPU pressure
Queueing
Async processing
Request variability
```

## Critical Boundary

```text
System Reliability
        ≠
AI Quality
```

A service can be operationally reliable while producing poor AI output.

A model can produce high-quality output while the service is operationally unreliable.

---

# Key Takeaways

1. Reliability is a system property, not simply an infrastructure health metric.

2. Reliability does not mean zero failures.

3. Availability is an important reliability dimension but does not fully define reliability.

4. User-visible outcomes should guide reliability measurement.

5. An SLI measures a meaningful aspect of service behavior.

6. An SLO defines the target for an SLI.

7. An error budget represents the unreliability permitted by the SLO.

8. A policy defines what engineering action follows from the reliability state.

9. Good SLI design begins with defining what counts as a successful service outcome.

10. Measurement boundaries matter because internal dependency health does not automatically equal end-to-end service reliability.

11. AI services may require workload-specific SLIs for streaming, asynchronous processing, latency, completion, and freshness.

12. HTTP success is not necessarily service success.

13. Average latency may hide important tail behavior.

14. More metrics do not automatically produce better reliability engineering.

15. Reliability objectives should influence engineering decisions.

16. Reliability must remain distinct from AI quality and evaluation.

17. File 01 establishes the reliability objectives and measurement foundation.

18. File 02 will build on this foundation to explain failure isolation, timeouts, retries, backpressure, and related controls.

19. File 03 will build on this foundation to explain graceful degradation, fallbacks, and dependency failure.

---

## Further Reading

The following topics should be studied alongside this chapter:

- Service-Level Indicators
- Service-Level Objectives
- Error budgets
- Distributed-system reliability
- Availability engineering
- Tail latency
- Queueing and overload behavior
- Production observability

For repository continuity, refer to the approved neighboring PROD chapter READMEs for:

- PROD-05 — AI Observability and Telemetry
- PROD-07 — Scaling and Capacity Engineering
- PROD-08 — AI Performance, Optimization and Cost
- PROD-10 — AI Operations and Incident Management
- PROD-11 — AI Lifecycle, Evaluation and Continuous Improvement

---

## Chapter Completion Check

Before moving to File 02, you should be able to explain without referring to the documentation:

```text
What is reliability?

How is reliability different from availability?

What is an SLI?

What is an SLO?

What is an error budget?

What is the difference between an SLO and an operational policy?

How do you define a good event?

Why does measurement boundary matter?

Why is HTTP 200 not necessarily service success?

How would you measure a streaming AI service?

How would you measure an asynchronous AI workload?

Why can average latency be misleading?

Why is AI quality different from service reliability?

How should an SLO influence engineering decisions?
```

If these questions cannot be answered confidently, the reliability measurement foundation is not yet complete.

The next file builds directly on this foundation by asking:

> **How do we prevent one failure or overloaded component from destabilizing the entire AI system?**
