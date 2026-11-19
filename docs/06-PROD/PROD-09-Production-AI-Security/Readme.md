# PROD-09 — Production AI Security

## Chapter Overview

Production AI systems introduce security concerns across identities, credentials, applications, containers, dependencies, artifacts, model-serving infrastructure, data access, and AI-specific attack surfaces.

**PROD-09 — Production AI Security** develops the technical security reasoning required to protect production AI systems without breaking required functionality.

The chapter focuses on the security controls surrounding production AI systems, including:

- Identity and authentication
- Authorization and access control
- Workload and service identity
- Secrets and credential management
- Application security
- Container and runtime security
- Dependency and supply-chain security
- Artifact integrity and trust
- Vulnerability management
- AI-specific production threats
- Security controls for AI endpoints and integrations
- Prevention, detection, containment, and response boundaries

The chapter is **technology-neutral, cloud-neutral, framework-neutral, and production-oriented**.

---

## Central Engineering Question

> **How do we protect production AI systems, their identities, artifacts, infrastructure, and AI-specific attack surfaces without breaking required functionality?**

The chapter approaches security as an engineering problem rather than as a collection of isolated security tools.

A production security decision must consider:

- What is being protected?
- Who or what is requesting access?
- What should that identity be allowed to do?
- What software, model, dependency, or artifact is being executed?
- Can the artifact and dependency chain be trusted?
- What attack surfaces are introduced or amplified by AI?
- Which controls reduce the relevant risk?
- What legitimate functionality might those controls affect?
- What residual risk remains after the controls are applied?

---

## Where PROD-09 Fits

PROD-09 is part of the **Production AI Engineering (`PROD`)** domain.

The production engineering progression surrounding this chapter is:

```text
Production AI System
        ↓
Build / Release / Deployment
        ↓
Observability
        ↓
Reliability
        ↓
Capacity / Scaling
        ↓
Performance / Efficiency
        ↓
Security
```

PROD-09 focuses specifically on the **technical security boundaries and controls** required to operate AI systems safely in production.

Security is not treated as a separate layer that can simply be added after deployment. Security requirements influence:

- identity design
- access boundaries
- application behavior
- runtime isolation
- artifact handling
- dependency management
- API exposure
- model-serving architecture
- AI integrations
- operational controls

---

# Chapter Scope

PROD-09 covers three major areas.

## 1. Identity, Secrets, and Access Control

This area answers:

> **Who or what is making this request, and what exactly should it be allowed to access or perform?**

It covers:

- Authentication
- Authorization
- Human identities
- Workload identities
- Service identities
- Least privilege
- Access boundaries
- Credentials
- Secrets
- Secret storage
- Credential rotation
- Short-lived credentials
- Privileged access considerations
- Security implications of over-privileged workloads

---

## 2. Application, Container, and Supply-Chain Security

This area answers:

> **Can we trust the application, container, model, dependency, and artifact chain that we are about to run?**

It covers:

- Application security
- Secure configuration
- Container security
- Runtime boundaries
- Dependency security
- Vulnerability management
- Software supply-chain risks
- AI/ML supply-chain risks
- Artifact integrity
- Artifact signing
- Artifact verification
- SBOM concepts
- Dependency provenance and trust relationships
- Security controls around build and release artifacts

---

## 3. AI-Specific Production Threats and Protection

This area answers:

> **What new or amplified security threats appear because the production system contains AI capabilities, and how should the system defend against them?**

It covers:

- Model endpoint abuse
- Unauthorized inference
- Resource exhaustion
- Denial-of-wallet
- Data exfiltration
- Sensitive information exposure
- Model extraction and theft
- AI/data supply-chain threats
- Insecure AI integrations
- Untrusted model or AI outputs
- Prompt injection as a production security concern
- AI-specific attack surfaces
- Security controls mapped to AI-specific threats
- Residual risk after controls are applied

---

## What PROD-09 Does Not Own

Clear topic boundaries are required to prevent duplication across the curriculum.

### PROD-02 — Artifact Identity and Provenance

PROD-02 owns:

- Artifact identity
- Artifact lineage
- Provenance
- Reproducibility
- Dependency/environment definition

PROD-09 owns the **security and trust controls applied to those artifacts**, including:

- Integrity protection
- Signing
- Verification
- Dependency security
- Supply-chain attack protection
- Vulnerability management

PROD-09 should therefore build on artifact identity and provenance concepts rather than re-teaching them as production artifact-management concepts.

---

### PROD-04 — CI/CD and Deployment

PROD-04 owns:

- CI/CD
- Deployment
- Release processes
- Rollouts
- Rollbacks
- Deployment safety
- Change-management mechanics

PROD-09 owns the **security requirements and controls that those systems must enforce**, such as:

- Artifact verification
- Security gates
- Credential protection
- Dependency security
- Access restrictions
- Security policy enforcement

PROD-09 should not re-teach CI/CD or deployment engineering.

---

### PROD-05 — Observability and Telemetry

PROD-05 owns:

- Observability architecture
- Logs
- Metrics
- Traces
- Telemetry
- AI-specific operational signals
- Signal design

PROD-09 may use telemetry as a **security signal**, but it does not re-teach observability architecture.

The distinction is:

```text
PROD-05
Operational visibility
        ↓
Logs / Metrics / Traces / Telemetry

PROD-09
Security use of signals
        ↓
Detection / Investigation / Security Response
```

---

### PROD-06 — Reliability Engineering

PROD-06 owns:

- Reliability
- Failure behavior
- Timeouts
- Retries
- Backpressure
- Overload control
- Graceful degradation
- Runtime fallback
- Dependency failure behavior

PROD-09 may address attacks that exploit these mechanisms, but it does not re-teach reliability engineering.

---

### AGT-11 — Agent Safety

AGT-11 owns agent-specific safety concerns such as:

- Excessive agency
- Unsafe agent actions
- Tool-use safety
- Agent continuation risks
- Agent-specific prompt-injection consequences
- Memory poisoning
- Approval bypass
- Action boundaries
- Containment
- Termination
- Recovery

PROD-09 owns the **technical production security controls around those capabilities**, rather than re-teaching agent safety.

---

### ENT — Enterprise Governance

ENT owns:

- Enterprise security policy
- Compliance
- Regulatory requirements
- Enterprise risk governance
- Organizational security controls
- Enterprise architecture governance

PROD-09 focuses on the **technical implementation and enforcement mechanisms** required to secure production AI systems.

---

# Learning Outcomes

After completing PROD-09, the learner should be able to:

1. Explain identity and access boundaries in production AI systems.
2. Distinguish authentication from authorization.
3. Apply least-privilege principles to human and workload identities.
4. Explain service/workload identity and credential management.
5. Reason about secrets, credentials, rotation, and short-lived access.
6. Analyze application and container security boundaries.
7. Distinguish artifact provenance from artifact security and trust.
8. Explain signing, verification, SBOM concepts, and vulnerability management.
9. Identify software and AI/ML supply-chain risks.
10. Analyze AI-specific production attack surfaces.
11. Identify risks involving model endpoints, unauthorized inference, resource exhaustion, denial-of-wallet, data exfiltration, sensitive information exposure, and model extraction.
12. Identify AI/data supply-chain threats and insecure AI integrations.
13. Understand prompt injection as a production security concern without turning it into an agent-safety curriculum.
14. Map production threats to appropriate technical controls.
15. Evaluate the limitations and residual risks of security controls.
16. Make production security trade-offs.
17. Design layered technical security controls for production AI systems.

---

## Learning Progression

The chapter follows a deliberate progression:

```text
Identity & Access
        ↓
Application / Container / Supply Chain
        ↓
AI-Specific Threats & Protection
```

The progression moves from foundational security boundaries toward increasingly AI-specific attack surfaces.

### Stage 1 — Identity and Access

Core question:

> **Who or what is making this request, and what exactly should it be allowed to access or perform?**

The learner establishes the identity and authorization boundary before reasoning about higher-level application and AI threats.

### Stage 2 — Application, Container, and Supply Chain Security

Core question:

> **Can we trust the application, container, model, dependency, and artifact chain that we are about to run?**

The learner then evaluates the security of the software and artifact chain surrounding the production AI system.

### Stage 3 — AI-Specific Threats and Protection

Core question:

> **What new or amplified security threats appear because the production system contains AI capabilities, and how should the system defend against them?**

The learner finally applies the previous security concepts to AI-specific attack surfaces and abuse cases.

---

# Chapter Map

| File | Primary Responsibility |
|---|---|
| Production AI Identity Secrets and Access Control | Identity, authentication, authorization, access control, workload identity, secrets, credentials, and least privilege |
| AI Application Container and Supply Chain Security | Application, container, dependency, artifact, vulnerability, and software/AI supply-chain security |
| AI Specific Production Threats and Protection | AI-specific production attack surfaces, threats, controls, trade-offs, and residual risk |

Each file has one primary teaching focus.

Later files may reference concepts introduced earlier, but they should not re-teach earlier concepts in depth.

---

## Critical Concept Boundaries

Several distinctions are especially important throughout PROD-09.

## Authentication vs Authorization

```text
Authentication
    ↓
Who are you?

Authorization
    ↓
What are you allowed to do?
```

Successful authentication does not imply permission to perform every operation.

---

## Authorization vs Safe Behavior

Authorization answers:

> **Is this identity permitted to perform this action?**

It does not guarantee:

> **Is the permitted action safe?**

Security therefore requires both access control and protection against unsafe or abusive behavior.

---

## Artifact Provenance vs Artifact Security

Artifact provenance answers questions such as:

> Where did this artifact come from?

> How was it produced?

Artifact security asks:

> Can we trust its integrity?

> Has it been tampered with?

> Does it contain known vulnerabilities?

> Has its supply chain been compromised?

These concerns are related but have different primary ownership across PROD-02 and PROD-09.

---

## Signing vs Functional Safety

Artifact signing can provide integrity and authenticity properties.

It does **not** prove that an artifact:

- is functionally correct
- is vulnerability-free
- is safe to execute
- contains no malicious behavior

Therefore:

```text
Signing
   ↓
Integrity / Authenticity Evidence
   ↓
Not Proof of Functional Safety
```

---

## SBOM vs Supply-Chain Security

An SBOM improves visibility into software components and dependencies.

It does not eliminate:

- compromised dependencies
- malicious packages
- vulnerable components
- compromised build infrastructure
- malicious maintainers
- dependency confusion
- other supply-chain attacks

SBOMs are therefore an important security input, not a complete security solution.

---

# Security Mental Model

PROD-09 uses the following high-level reasoning model:

```text
Identity
   ↓
Access Control
   ↓
Application Security
   ↓
Container / Runtime Boundary
   ↓
Artifact & Dependency Trust
   ↓
AI Attack Surface
   ↓
Security Controls
   ↓
Prevention / Detection / Containment / Response
```

The model is intended to help engineers reason across security boundaries rather than treating individual security tools as isolated solutions.

---

# Threat-Oriented Reasoning

A central reasoning pattern in PROD-09 is:

```text
Asset
  ↓
Entry Point
  ↓
Threat / Abuse Case
  ↓
Impact
  ↓
Security Control
  ↓
Residual Risk
```

For every important security concern, the engineer should be able to answer:

1. What asset are we protecting?
2. Where can the attacker or abuse originate?
3. What threat or abuse case is possible?
4. What could happen if it succeeds?
5. Which control reduces the risk?
6. What does the control not prevent?
7. What residual risk remains?

This prevents security reasoning from becoming a checklist of tools.

---

# Security Principles

PROD-09 emphasizes several principles that should remain consistent throughout the chapter.

### Authentication ≠ Authorization

Knowing who is making a request does not determine what that identity may do.

### Authorization ≠ Safe Behavior

A legitimate identity can still perform an unsafe or abusive operation if the authorization boundary is too broad.

### Encryption ≠ Protection from Compromised Credentials

Encryption protects data under defined threat assumptions. It does not compensate for compromised identities or excessive permissions.

### Vulnerability Scanning ≠ Proof of Safety

A scanner can identify known or detectable weaknesses but cannot establish that an artifact is completely safe.

### SBOM ≠ Elimination of Supply-Chain Risk

Visibility into dependencies improves security analysis but does not remove supply-chain threats.

### Rate Limiting ≠ Complete Abuse Protection

Rate limiting can constrain some abuse patterns but does not solve every attack.

### Prompt Filtering ≠ Complete Prompt-Injection Protection

Filtering may reduce certain attack patterns but cannot guarantee that AI inputs are safe.

### Container Isolation ≠ Elimination of Application Vulnerabilities

Runtime isolation reduces the impact of some failures but does not make insecure application code secure.

### Secret Storage ≠ Protection from Over-Privileged Workloads

A secret can be securely stored while the workload using it still has excessive permissions.

### Artifact Signing ≠ Functional Safety

Signing provides integrity/authenticity properties but does not establish that the artifact is safe or correct.

---

## Production Security Trade-offs

Security controls introduce engineering trade-offs.

| Security Decision | Benefit | Cost / Trade-off |
|---|---|---|
| Least privilege | Stronger isolation | Greater operational complexity |
| Short-lived credentials | Reduced credential exposure | More complex credential management |
| Strict authorization | Stronger access boundaries | Greater developer/operator friction |
| Artifact verification | Higher artifact trust | Additional release friction |
| Dependency pinning | Greater reproducibility and control | Potentially slower updates |
| Aggressive rate limiting | Greater abuse resistance | Legitimate workload constraints |
| Input filtering | Reduced attack surface | Potential functionality loss |
| Security inspection | Greater assurance | Additional latency |
| Isolation | Stronger security boundaries | Infrastructure and operational cost |
| Defense-in-depth | Reduced dependence on a single control | Greater operational complexity |

The objective is not to maximize security controls indiscriminately.

The objective is to select controls that provide appropriate risk reduction while preserving required system functionality.

---

## AI-Specific Security Reasoning

AI capabilities create or amplify several production security concerns.

These may include:

- Model endpoint abuse
- Unauthorized inference
- Resource exhaustion
- Denial-of-wallet
- Data exfiltration
- Sensitive information exposure
- Model extraction
- Model theft
- AI/data supply-chain compromise
- Insecure AI integrations
- Untrusted outputs
- Prompt injection
- Abuse of AI-enabled interfaces

The correct engineering response is not to assume that one AI-specific control solves these risks.

Instead, reason through:

```text
Threat
   ↓
Attack Surface
   ↓
Potential Impact
   ↓
Applicable Controls
   ↓
Control Limitations
   ↓
Residual Risk
```

---

# Defense-in-Depth

Production AI security should not depend on a single control.

A layered approach may combine:

```text
Identity
   +
Authorization
   +
Application Controls
   +
Runtime Isolation
   +
Artifact Verification
   +
Dependency Security
   +
Input / Interface Protection
   +
Resource Controls
   +
Security Detection
   +
Response Boundaries
```

Each layer should reduce risk independently where practical.

The objective is to prevent the failure of one control from becoming the failure of the entire security model.

---

# Technology Philosophy

PROD-09 is **technology-neutral**.

The concepts apply regardless of the specific:

- Cloud provider
- Container platform
- Identity provider
- Secret manager
- Artifact registry
- CI/CD platform
- AI framework
- Model provider
- API gateway
- Security scanner
- Runtime environment

Concrete technologies may be used as examples, including:

- Kubernetes
- Docker
- Cloud IAM systems
- Vault
- Cloud secret managers
- SBOM tooling
- Container vulnerability scanners
- Artifact registries
- Artifact signing and verification systems
- API gateways
- WAFs

These technologies illustrate concepts; they are not conceptual dependencies of PROD-09.

---

## Prerequisites

Before starting PROD-09, the learner should understand the relevant production engineering foundations covered earlier in the `PROD` domain, particularly:

- Production application architecture
- Deployment and release concepts
- Artifact and dependency concepts
- Observability fundamentals
- Reliability fundamentals
- Capacity and scaling fundamentals
- Performance and resource-efficiency concepts

The learner should also have a working understanding of:

- APIs
- Services
- Applications
- Containers
- Dependencies
- Models
- Model-serving systems
- Basic network and infrastructure concepts

---

## Learning Order

The approved learning order is:

Do not skip the first two files before studying AI-specific production threats.

The later threat analysis depends on understanding identity, access, application boundaries, runtime isolation, and artifact trust.

---

# Practical Competency

Completing PROD-09 should enable the learner to reason about security scenarios such as:

- A service account has broader permissions than required.
- A production secret has been exposed.
- A workload uses long-lived credentials.
- A container contains a vulnerable dependency.
- A model artifact cannot be verified.
- A dependency chain contains an untrusted component.
- An attacker abuses an inference endpoint.
- An AI endpoint creates unexpected infrastructure cost.
- An AI integration exposes sensitive information.
- A model is vulnerable to extraction attempts.
- Prompt injection is used to influence a production AI interface.
- A security control reduces risk but introduces unacceptable product behavior.

The learner should be able to move from:

```text
Threat
   ↓
Security Requirement
   ↓
Control
   ↓
Implementation Boundary
   ↓
Trade-off
   ↓
Residual Risk
```

---

# Interview and Architecture Competency

After completing this chapter, the learner should be able to answer production-oriented questions such as:

- What is the difference between authentication and authorization?
- How would you apply least privilege to an AI workload?
- How should production AI services handle secrets?
- Why might short-lived credentials be preferable to long-lived credentials?
- What does artifact signing prove, and what does it not prove?
- What is an SBOM and what security problem does it help solve?
- How would you secure a containerized AI service?
- What are the major software and AI supply-chain risks?
- How would you protect an inference endpoint from abuse?
- What is denial-of-wallet?
- How can an AI system expose sensitive information?
- What security risks are introduced by prompt injection?
- How would you protect an AI system against model extraction?
- Why is defense-in-depth important?
- How would you evaluate whether a security control is worth its operational cost?
- What residual risks remain after implementing a security control?

The expected answers should demonstrate **engineering reasoning**, not merely security terminology.

---

## Completion Criteria

PROD-09 is complete when the learner can:

- Explain identity and access boundaries clearly.
- Distinguish authentication from authorization.
- Apply least privilege to production workloads.
- Reason about secrets and credential lifecycle.
- Evaluate application and container security boundaries.
- Analyze dependency and supply-chain risks.
- Distinguish provenance from security and trust.
- Explain artifact signing and verification limitations.
- Reason about SBOMs and vulnerability management.
- Identify AI-specific production attack surfaces.
- Map threats to appropriate technical controls.
- Explain control limitations.
- Evaluate security trade-offs.
- Identify residual risk.
- Design layered technical security controls.
- Explain security architecture decisions clearly to another engineer.

The final standard is not:

> “I know common AI security tools.”

The standard is:

> **“I can analyze a production AI security problem, identify the relevant threat and boundary, select appropriate technical controls, explain their trade-offs, and reason about the residual risk.”**

---

## Chapter Contents
The PROD-09 documentation structure is:

README provides the chapter-level orientation and ownership boundaries.

The three numbered files contain the actual teaching material.

---

# Chapter Completion Standard

PROD-09 should produce an engineer who can look at a production AI system and reason across:

```text
Identity
   ↓
Access
   ↓
Application
   ↓
Runtime
   ↓
Artifacts
   ↓
Dependencies
   ↓
AI Attack Surface
   ↓
Security Controls
   ↓
Residual Risk
```

The objective is not perfect security.

The objective is **deliberate, layered, technically justified production security engineering**.

A strong engineer completing this chapter should be able to explain not only:

> **“What security control should we use?”**

but also:

> **“What threat does it address, what assumptions does it make, what does it fail to address, what trade-off does it introduce, and what residual risk remains?”**
