# AGT-10 — Agent Evaluation & Behavioral Testing

## Chapter Purpose

AGT-10 establishes **agent evaluation as an engineering discipline**.

The chapter focuses on two related questions:

1. **Is the agent behaving correctly and achieving the intended outcome?**
2. **Can we trust the process used to measure that behavior?**

It therefore covers both **agent quality** and **evaluation quality**, while maintaining clear boundaries with the chapters that own agent execution, tools, state, workflows, safety, interoperability, and multi-agent architecture.

---

## Central Engineering Question

> **How do we know that an agent is behaving correctly, reliably, and acceptably—and that our evaluation process is itself trustworthy?**

---

## Learning Outcomes

After completing AGT-10, you should be able to:

1. Define meaningful task success and behavioral success criteria.
2. Distinguish functional correctness from behavioral correctness.
3. Design outcome-based and behavior-based evaluations.
4. Evaluate agent trajectories rather than relying only on final outputs.
5. Evaluate tool selection, parameters, unnecessary actions, and tool-failure handling.
6. Evaluate planning, state, context, and memory behavior.
7. Trace behavioral failures toward likely contributing causes.
8. Design representative evaluation datasets and scenarios.
9. Select metrics that reflect actual system requirements.
10. Recognize limitations of aggregate metrics.
11. Evaluate human and automated evaluators.
12. Understand calibration and reliability concerns for LLM-based judges.
13. Identify evaluator bias, disagreement, drift, contamination, and leakage.
14. Build regression-oriented evaluation suites.
15. Version evaluation datasets, rubrics, evaluators, metrics, and thresholds.
16. Apply risk-appropriate evaluation strategies.
17. Use evaluation evidence to support engineering and release decisions.

---

## Chapter Structure

AGT-10 contains exactly three lessons.

| File | Primary Focus |
|---|---|
| [Agent Task Success and Behavioral Evaluation](./01-Agent-Task-Success-and-Behavioral-Evaluation.md) | Task success, behavioral correctness, evaluation dimensions, acceptance criteria, and evaluation fundamentals. |
| [Trajectory Tool Planning and State Evaluation](./02-Trajectory-Tool-Planning-and-State-Evaluation.md) | Trajectories, tool use, planning, state transitions, context, memory, intermediate behavior, and failure points. |
| [Agent Evaluation Sets Metrics and Regression Testing](./03-Agent-Evaluation-Sets-Metrics-and-Regression-Testing.md) | Evaluation datasets, metrics, evaluator reliability, calibration, LLM judges, and regression testing. |

No additional lessons are introduced in AGT-10.

---

## Conceptual Progression

The chapter follows this progression:

```text
01 — What does correct agent behavior mean?
                    ↓
02 — How do we evaluate what the agent actually did?
                    ↓
03 — How do we measure behavior reliably and detect regression?
```

This creates a progression from **evaluation definition → behavioral evidence → trustworthy measurement**.

---

# Where This Is Covered
Each concept has one primary teaching location.

Later files may build on concepts introduced earlier, but should not re-teach those concepts in depth.

```text
Lesson 01
Task Success
Behavioral Correctness
Acceptance Criteria
Evaluation Dimensions
        │
        ▼
Lesson 02
Trajectories
Tool Behavior
Planning Behavior
State / Context / Memory Behavior
Failure Localization
        │
        ▼
Lesson 03
Evaluation Sets
Metrics
Evaluator Quality
Calibration
Regression Testing
```

This ownership model prevents unnecessary duplication across the chapter.

---

# Core Evaluation Model

AGT-10 uses the following evaluation pipeline as its high-level mental model:

```text
Requirements
      ↓
Evaluation Criteria
      ↓
Test Cases
      ↓
Agent Execution
      ↓
Evidence Collection
      ↓
Evaluation
      ↓
Metrics
      ↓
Engineering Decision
```

The chapter also distinguishes two evidence categories:

```text
                    Agent Execution
                          │
                          ▼
                       Evidence
                     /         \
                    /           \
                   ▼             ▼
          Outcome Evidence   Behavioral Evidence
```

Both may be required depending on the system's requirements and risk.

---

# Agent Quality vs Evaluation Quality

These are related but distinct engineering concerns.

### Agent Quality

Concerned with whether the agent:

- achieves the intended task
- produces correct results
- follows required constraints
- behaves appropriately
- uses tools correctly
- maintains appropriate state
- terminates appropriately
- handles relevant failures correctly

### Evaluation Quality

Concerned with whether the measurement process:

- evaluates the right property
- uses representative cases
- applies valid criteria
- produces reliable judgments
- handles evaluator disagreement
- controls evaluator bias and drift
- avoids contamination and leakage
- supports trustworthy engineering decisions

A strong agent evaluation system therefore requires both.

---

## Important Scope Boundaries

AGT-10 evaluates behavior associated with other agent capabilities, but does not take ownership of their architecture or implementation.

| Chapter | Primary Ownership | AGT-10 Relationship |
|---|---|---|
| **AGT-02** | Agent runtime loop, decision/action/observation, bounded autonomy | Evaluates runtime behavior |
| **AGT-03** | Tool contracts, schemas, selection, routing, execution, side effects | Evaluates tool behavior |
| **AGT-04** | State, context, memory architecture and behavior | Evaluates state/context/memory behavior |
| **AGT-05** | Verification, critique, plan verification | Performs systematic evaluation across defined cases |
| **AGT-06** | Workflow orchestration, durable execution, checkpoints, async execution | Evaluates workflow-related behavior |
| **AGT-07** | Human intervention, approval, escalation, override | Evaluates whether required intervention behavior occurred |
| **AGT-08** | Interoperability, capability interfaces, MCP, A2A | Evaluates interoperability behavior |
| **AGT-09** | Multi-agent architecture, delegation, supervision, coordination | Evaluates multi-agent behavior |
| **AGT-11** | Failure modes, recovery, safety, containment, termination boundaries | Evaluates relevant behaviors without becoming the safety architecture chapter |
| **AGT-12** | Architecture selection, trade-offs, validation, design review | Provides evaluation evidence for architectural decisions |
| **PROD** | Infrastructure, observability, deployment, operations | Provides operational evidence; AGT-10 owns evaluation methodology |

### Verification vs Evaluation

AGT-05 owns verification and critique during execution.

AGT-10 owns systematic measurement across defined cases.

```text
Verification
    ↓
Check an execution or artifact against a condition

Evaluation
    ↓
Measure behavior systematically across defined cases
```

### Observability vs Evaluation

PROD owns observability and operational infrastructure.

AGT-10 owns evaluation.

```text
Observability
    ↓
What happened?

Evaluation
    ↓
How well did the system behave against defined expectations?
```

Observability can provide evidence for evaluation, but the two are not interchangeable.

---

# Key Concepts

AGT-10 covers the following major concept groups.

### Task and Behavioral Evaluation

- task success
- functional correctness
- behavioral correctness
- outcome-based evaluation
- behavior-based evaluation
- acceptance and success criteria
- partial success
- failure classification

### Trajectory Evaluation

- execution trajectories
- action sequences
- intermediate outcomes
- tool calls
- planning behavior
- state transitions
- context and memory behavior
- failure localization
- causal interpretation

### Evaluation Dataset Design

- representative scenarios
- boundary cases
- rare cases
- failure cases
- adversarial cases
- high-risk cases
- regression cases
- golden datasets
- synthetic and human-authored cases

### Metrics

- task success
- pass and error rates
- completion rates
- tool-call accuracy
- constraint violation rates
- latency
- cost
- unnecessary actions
- termination success
- segmented and distribution-aware metrics

### Evaluator Quality

- human evaluation
- automated evaluation
- LLM-as-a-Judge
- rubrics
- calibration
- grader consistency
- disagreement analysis
- evaluator bias
- evaluator drift
- false positives and false negatives

### Evaluation Integrity and Regression

- contamination
- leakage
- benchmark gaming
- benchmark overfitting
- evaluation versioning
- baselines
- thresholds
- release gates
- regression testing
- test-set evolution

Detailed treatment of these concepts belongs in the relevant lessons rather than in this README.

---

## Risk-Based Evaluation

Evaluation depth should be determined by system requirements, risk, and consequences of failure.

Depending on the system, evaluation may emphasize:

- outcome evaluation
- trajectory evaluation
- constraint evaluation
- tool-use evaluation
- safety-related behavioral evaluation
- human review
- stronger regression gates

There is no universal evaluation strategy that applies equally to every agent.

---

## Evaluation Lifecycle

AGT-10 connects evaluation across the engineering lifecycle:

```text
Development
     ↓
Pre-Release Evaluation
     ↓
Regression Evaluation
     ↓
Release Decision
     ↓
Production Evaluation
     ↓
Incident / New Failure
     ↓
New Regression Case
     ↓
Re-Evaluation
```

The chapter therefore supports an evaluation-driven improvement loop:

```text
Evaluate
   ↓
Find Failure
   ↓
Classify Failure
   ↓
Identify Cause
   ↓
Improve Agent/System
   ↓
Re-Evaluate
   ↓
Regression Test
```

This describes the evaluation perspective; infrastructure and operational implementation remain outside AGT-10's ownership.

---

# Evaluation Artifacts

Evaluation systems may depend on versioned artifacts such as:

- evaluation datasets
- test cases
- rubrics
- evaluators
- evaluator prompts
- judge models
- metrics
- thresholds
- reference answers
- test environments

Versioning these artifacts is important when reproducibility, comparison, and regression decisions matter.

---

## Engineering Trade-offs

AGT-10 examines trade-offs including:

- Human vs automated evaluation
- Outcome vs trajectory evaluation
- Fixed vs evolving evaluation sets
- Reference-based vs reference-free evaluation
- Rule-based vs model-based evaluation
- Single vs multiple judges
- Broad coverage vs deep high-risk coverage
- Frequent evaluation vs expensive comprehensive evaluation
- Stable regression sets vs evolving regression sets

The appropriate choice depends on system requirements, risk, cost, and failure modes.

---

## Recommended Prerequisites

AGT-10 assumes **familiarity**, rather than complete mastery, of the preceding agent-engineering chapters.

Recommended background:

- **AGT-02** — Agent runtime and execution behavior
- **AGT-03** — Tool use and execution
- **AGT-04** — State, context, and memory
- **AGT-05** — Verification and critique
- **AGT-06** — Workflow orchestration
- **AGT-07** — Human intervention and approval
- **AGT-08** — Agent interoperability
- **AGT-09** — Multi-agent systems

These chapters provide the systems and behaviors that AGT-10 evaluates.

---

## Suggested Learning Order

Read the lessons in order.

### 1. Task Success & Behavioral Evaluation

[Agent Task Success and Behavioral Evaluation](./01-Agent-Task-Success-and-Behavioral-Evaluation.md)

Establishes the meaning of successful and acceptable agent behavior.

### 2. Trajectory, Tool, Planning & State Evaluation

[Trajectory Tool Planning and State Evaluation](./02-Trajectory-Tool-Planning-and-State-Evaluation.md)

Moves from final outcomes to the behavior and evidence produced during execution.

### 3. Evaluation Sets, Metrics & Regression Testing

[Agent Evaluation Sets Metrics and Regression Testing](./03-Agent-Evaluation-Sets-Metrics-and-Regression-Testing.md)

Builds the measurement system required for repeatable evaluation and regression detection.

---

## Chapter Completion Criteria

After completing AGT-10, you should be able to reason about:

```text
                Agent Evaluation
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
      Outcome       Behavior       Evaluation
      Quality       Quality          Quality
        │              │              │
        ▼              ▼              ▼
     Success       Trajectory      Evaluator
     Criteria      Tool Use        Reliability
     Constraints   Planning        Calibration
     Correctness   State           Bias
                   Memory          Drift
                       │              │
                       └──────┬───────┘
                              ▼
                       Trustworthy
                        Measurement
                              │
                              ▼
                       Engineering
                         Decision
```

Completion means being able to:

- define meaningful evaluation criteria
- design representative evaluation cases
- evaluate outcomes and behavior
- inspect trajectories
- identify behavioral failure points
- select appropriate metrics
- reason about evaluator reliability
- recognize limitations of automated judges
- design regression suites
- interpret evaluation results cautiously
- make risk-aware engineering decisions

---

# Final Principle

> **A score is useful only when the property being measured matters, the evaluation set represents the real problem, the evaluator measures it reliably, and the evidence supports a sound engineering decision.**

AGT-10 is therefore an **engineering-first chapter on agent evaluation and behavioral testing**.

It is intentionally not a benchmark catalog, framework tutorial, generic software-testing chapter, observability chapter, or safety-architecture chapter.

The chapter's central lesson is:

> **Do not merely ask whether an agent received a good score. Ask whether the score measures the right behavior, using trustworthy evidence, with a reliable evaluation process.**
