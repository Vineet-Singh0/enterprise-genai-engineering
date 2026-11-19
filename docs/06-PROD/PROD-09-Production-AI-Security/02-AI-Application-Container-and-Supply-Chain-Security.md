# AI Application, Container, and Supply-Chain Security

## 1. Purpose

A production AI system is not secure simply because its identities and permissions are well designed.

The system also depends on software, libraries, operating-system components, containers, model artifacts, configuration, build outputs, and external dependencies.

A production AI workload may therefore look like:

```text
User Request
     ↓
AI Application
     ↓
Application Dependencies
     ↓
Runtime / Container
     ↓
Operating-System Components
     ↓
Model / AI Artifacts
     ↓
External Services
```

Every layer introduces security assumptions.

A vulnerable application dependency can compromise an otherwise well-designed service.

A compromised container image can execute malicious code before the application begins serving traffic.

An untrusted model artifact can introduce security or integrity risks even when the surrounding application is correctly configured.

A dependency downloaded during a build can introduce risk before deployment.

The central question for this chapter is:

> **Can we trust the application, container, dependency, model, and artifact chain that we are about to run?**

This chapter develops the production security foundations required to answer that question.

The focus is on:

- Application security
- Secure dependency management
- Vulnerability management
- Container and runtime security
- Artifact integrity
- Artifact signing and verification
- Software bills of materials (SBOMs)
- Software and AI/ML supply-chain security
- Model and artifact trust
- Build-to-runtime trust boundaries
- Security verification
- Residual supply-chain risk

The objective is not to teach a particular scanner, registry, cloud platform, or container orchestration system.

The objective is to develop the engineering ability to determine:

1. What are we running?
2. Where did it come from?
3. What does it contain?
4. Can we verify its integrity and origin?
5. What known vulnerabilities exist?
6. What trust assumptions are we making?
7. What happens if one dependency or artifact is compromised?

---

# 2. Why Supply-Chain Security Matters in Production AI

Modern AI applications are assembled from many components.

A simplified dependency graph might look like:

```text
AI Application
    │
    ├── Web Framework
    ├── AI Framework
    ├── SDKs
    ├── Database Drivers
    ├── Authentication Libraries
    ├── Serialization Libraries
    ├── Model Runtime
    ├── Native Libraries
    └── Model / Data Artifacts
```

The application may directly depend on only a few packages while those packages depend on many others.

This creates a dependency chain:

```text
Application
    ↓
Direct Dependency
    ↓
Transitive Dependency
    ↓
Native Component
    ↓
Operating-System Component
```

The application team may control the first layer but inherit security risk from deeper layers.

This leads to an important production principle:

> **A production application is only as trustworthy as the security controls applied across the components and artifacts that compose it.**

This does not mean every dependency must be trusted absolutely.

It means dependency and artifact trust must be made explicit and managed systematically.

---

# 3. Application Security and Supply-Chain Security

Application security and supply-chain security are related but address different questions.

**Application security** asks:

> **How does the software behave, process inputs, access data, invoke capabilities, and handle outputs?**

**Supply-chain security** asks:

> **Can we trust the components and artifacts used to construct and execute that software?**

Conceptually:

```text
Application Security
        ↓
Behavior and Data Flow
        ↓
How does the software behave?

Supply-Chain Security
        ↓
Components and Artifacts
        ↓
What are we actually running,
and can we trust its origin, integrity,
and security properties?
```

These concerns intersect.

For example, an application may contain a secure business-logic design but depend on a compromised library.

Conversely, an application may use trustworthy dependencies but contain an application-level vulnerability.

Therefore:

> **Application security protects the behavior and boundaries of the software; supply-chain security establishes trust in the material used to construct and execute that software.**

---

# 4. The Production AI Software Supply Chain

A supply chain describes the path through which software and artifacts move from creation to execution.

A simplified model is:

```text
Source
  ↓
Dependencies
  ↓
Build
  ↓
Artifact
  ↓
Registry / Distribution
  ↓
Deployment
  ↓
Runtime
```

For an AI system, additional artifacts may appear:

```text
Source Code
    ↓
Application Build
    ↓
Container Image
    ↓
Model Runtime
    ↓
Model Artifact
    ↓
AI Service
```

Other artifacts may include:

- Model configuration
- Tokenizers
- Embedding models
- Prompt assets
- Data-processing packages
- Native libraries
- Runtime extensions
- Plugin packages

Every transition creates a trust boundary.

The security question is:

> **Can we establish what this artifact is, where it came from, whether it was modified, and whether it is acceptable to execute?**

---

# 5. Secure Application Boundaries

An AI application should clearly define its trust boundaries.

For example:

```text
External User
      │
      ▼
┌──────────────────┐
│    API Boundary  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Application Logic│
└────────┬─────────┘
         │
    ┌────┴────┐
    ▼         ▼
 AI Service  Database
    │
    ▼
Model Runtime
```

Each boundary should answer:

- What data crosses the boundary?
- Who controls the data?
- What validation is performed?
- What trust assumptions exist?
- What privileges does the receiving component have?
- What happens if the input is malicious?

This is especially important for AI applications because input may be interpreted by both conventional application logic and AI components.

---

# 6. Input Handling Is an Application Security Concern

AI systems may receive:

- Text
- Documents
- Images
- Audio
- Structured data
- URLs
- User-generated content
- External API responses

The application should not assume that input is safe simply because it is syntactically valid.

A useful model is:

```text
Untrusted Input
      ↓
Validation
      ↓
Normalization
      ↓
Policy Checks
      ↓
Controlled Processing
```

Validation should be appropriate to the expected input.

For example:

- File type validation
- Size limits
- Schema validation
- Encoding validation
- Range validation
- Content constraints

The exact control depends on the application.

The important principle is:

> **Input validation establishes an application boundary; it does not establish that the input is trustworthy in every downstream context.**

---

# 7. Output Handling Is Also a Security Boundary

Security concerns do not end when the AI application produces output.

Outputs may be:

- Returned to users
- Stored in databases
- Passed to other services
- Used in business workflows
- Rendered in user interfaces
- Included in logs
- Used as input to subsequent operations

Therefore:

```text
AI / Application Output
          ↓
Validation / Policy Enforcement
          ↓
Trusted Consumer
```

A downstream component should not automatically treat an application output as safe merely because it originated from an internal service.

This principle becomes particularly important when AI-generated content can influence application behavior.

---

# 8. Dependency Security

Modern applications depend heavily on external libraries.

Dependencies provide productivity and functionality, but they also introduce risk.

A dependency may contain:

- Security vulnerabilities
- Malicious code
- Unsafe default behavior
- Unmaintained components
- Compromised release artifacts
- Unexpected transitive dependencies

The dependency graph can therefore be represented as:

```text
Application
   ↓
Direct Dependencies
   ↓
Transitive Dependencies
   ↓
Underlying Components
```

The application team may control the first layer but inherit risk from deeper layers.

The important engineering question is:

> **Do we know what actually executes in production, rather than only what we intentionally declared?**

---

# 9. Direct vs Transitive Dependencies

A **direct dependency** is intentionally included by the application.

A **transitive dependency** is introduced through another dependency.

For example:

```text
Application
   ↓
Framework A
   ↓
Library B
   ↓
Library C
```

The application may never explicitly declare Library C.

Yet Library C executes as part of the application.

This creates a critical engineering question:

> **Do we know what actually executes in production, rather than only what we intentionally declared?**

Dependency inventories help answer this question.

---

# 10. Dependency Pinning

Dependency versioning affects reproducibility and security.

An unconstrained dependency can result in different versions being installed at different times.

Conceptually:

```text
Build A
   ↓
Dependency Version X

Build B
   ↓
Dependency Version Y
```

even though the application source code has not changed.

This makes security analysis and incident investigation more difficult.

Pinning or otherwise constraining dependencies can improve reproducibility:

```text
Application
   ↓
Declared Dependency
   ↓
Known Version
   ↓
Reproducible Environment
```

However, strict pinning also creates a maintenance challenge.

Old pinned versions may contain known vulnerabilities.

Therefore:

> **Reproducibility and dependency freshness must be managed together.**

---

# 11. Dependency Updates

Dependencies should not be treated as permanently trusted.

A production dependency lifecycle may look like:

```text
Select
  ↓
Evaluate
  ↓
Pin / Constrain
  ↓
Monitor
  ↓
Update
  ↓
Verify
  ↓
Deploy
```

Security updates may be required because:

- A vulnerability is discovered.
- A dependency becomes unsupported.
- A malicious release is identified.
- A security advisory changes the risk assessment.

The goal is not “never change dependencies.”

The goal is:

> **Change dependencies deliberately while maintaining sufficient security and reproducibility.**

---

# 12. Vulnerability Management

A vulnerability is a weakness that may allow unintended or unauthorized behavior.

Vulnerability management is the process of identifying, evaluating, prioritizing, remediating, and tracking such weaknesses.

A simplified lifecycle is:

```text
Discover
   ↓
Assess
   ↓
Prioritize
   ↓
Remediate
   ↓
Verify
   ↓
Monitor
```

A vulnerability scanner can support this process.

It cannot replace the process itself.

---

# 13. Vulnerability Severity Is Not the Same as Risk

A vulnerability may have a high technical severity but low practical exposure in one environment.

Another vulnerability with lower severity may be highly exploitable in a production system.

Therefore:

```text
Severity
   +
Exposure
   +
Exploitability
   +
Reachability
   +
Asset Importance
   +
Business Impact
   ↓
Risk Assessment
```

The exact prioritization model depends on the organization and system.

The engineering principle is:

> **Do not treat a vulnerability score as the complete security decision.**

---

# 14. Reachability Matters

Suppose a vulnerable library is present in an application.

The important questions include:

- Is the vulnerable code actually reachable?
- Is the affected feature enabled?
- Can an attacker reach it?
- Does the workload have the required privileges?
- Is the vulnerable component exposed to untrusted input?

A useful reasoning chain is:

```text
Vulnerability
      ↓
Affected Component
      ↓
Reachable Functionality
      ↓
Attack Path
      ↓
Potential Impact
```

This helps prioritize remediation intelligently.

---

# 15. Vulnerability Scanning Has Limitations

A scanner may identify known vulnerabilities.

It cannot prove that:

> “This application is secure.”

Scanning may miss:

- Unknown vulnerabilities
- Logic flaws
- Misconfiguration
- Unsafe application behavior
- Vulnerabilities without known signatures
- Context-dependent attack paths
- Malicious behavior that is not classified as a vulnerability

Therefore:

```text
Scanning
   ≠
Security Assurance
```

Scanning is one security control within a broader defense strategy.

---

# 16. Container Security

Containers package application code and runtime dependencies into a deployable unit.

Conceptually:

```text
Container Image
 ├── Application
 ├── Dependencies
 ├── Runtime Components
 └── OS-level Components
```

Containers improve consistency and isolation, but they do not automatically make an application secure.

A vulnerable container can still contain:

- Vulnerable packages
- Unnecessary tools
- Weak configuration
- Excessive privileges
- Malicious components
- Insecure runtime assumptions

Therefore:

> **Containerization changes the deployment boundary; it does not eliminate application or supply-chain risk.**

---

# 17. Container Image as a Security Artifact

A container image should be treated as an artifact that requires trust evaluation.

The lifecycle can be represented as:

```text
Source
  ↓
Build
  ↓
Container Image
  ↓
Verification
  ↓
Registry
  ↓
Runtime
```

The security question is not only:

> “Does the container start?”

It is:

> **“Can we establish that this is the intended image and that its contents satisfy our security requirements?”**

---

# 18. Image Security vs Runtime Security

Container image security and runtime security address different questions.

**Image security** asks:

> **What is inside the artifact we are about to run?**

**Runtime security** asks:

> **What can the running workload access, modify, invoke, or interact with?**

Conceptually:

```text
Image Security
      ↓
Artifact Contents
      ↓
What are we running?

Runtime Security
      ↓
Runtime Configuration
      ↓
What can it do while running?
```

An image may have an acceptable security posture but still be deployed with excessive runtime privileges.

Conversely, a tightly restricted runtime does not make a vulnerable or malicious image trustworthy.

Therefore:

> **Artifact security and runtime security are complementary boundaries, not substitutes for one another.**

---

# 19. Minimal Container Images

A production container should generally contain only what is required to run the workload.

Conceptually:

```text
Large Image
 ├── Application
 ├── Runtime
 ├── Required Libraries
 ├── Build Tools
 ├── Debug Tools
 ├── Unused Utilities
 └── Other Packages
```

versus:

```text
Focused Image
 ├── Application
 ├── Required Runtime
 └── Required Dependencies
```

Reducing unnecessary components can reduce:

- Attack surface
- Vulnerability count
- Maintenance burden
- Unexpected runtime behavior

However, minimality must not compromise operational requirements.

The objective is:

> **Reduce unnecessary attack surface while preserving required functionality.**

---

# 20. Container Privileges

A container process may have more privileges than required.

Examples of unnecessary capability include:

- Running as a highly privileged user
- Accessing host resources unnecessarily
- Accessing sensitive filesystem locations
- Using unnecessary operating-system capabilities

The principle is similar to least privilege for identities:

```text
Required Runtime Capability
          ↓
Minimum Necessary Privilege
```

Container security therefore extends the least-privilege principle into the runtime boundary.

---

# 21. Container Isolation Is Not a Security Guarantee

Containers provide isolation boundaries, but those boundaries have limitations.

A vulnerable application inside a container remains vulnerable.

A malicious dependency inside a container remains malicious.

A container configuration that grants excessive privileges can weaken isolation.

Therefore:

```text
Container Isolation
      ↓
Reduced Exposure
      ≠
Complete Security
```

Security must consider the application, container configuration, runtime, host, and surrounding infrastructure together.

---

# 22. Runtime Security

A container image may be secure when built but become exposed through runtime configuration.

Security-relevant runtime properties include:

- Process privileges
- Filesystem access
- Network access
- Mounted resources
- Environment variables
- Secrets
- Runtime capabilities
- Service-to-service access

The conceptual model is:

```text
Trusted Artifact
      ↓
Runtime Configuration
      ↓
Effective Security Boundary
```

This is why image security and runtime security cannot be treated as identical problems.

---

# 23. Build-Time vs Runtime Trust

Consider an AI application:

```text
Build Time
    ↓
Dependencies Resolved
    ↓
Application Built
    ↓
Container Created
    ↓
Artifact Stored
    ↓
Runtime
```

Security decisions occur at multiple stages.

A component may be trusted during build but later replaced or modified.

Conversely, an artifact may have been created securely but deployed with an unsafe runtime configuration.

Therefore:

> **Security assurance must follow the artifact across its lifecycle rather than stopping at build completion.**

---

# 24. Artifact Identity, Integrity, Provenance, and Security

Several artifact properties must be distinguished.

### Artifact Identity

Answers:

> **Which exact artifact is this?**

### Artifact Integrity

Answers:

> **Has this artifact been modified from the expected content?**

### Artifact Provenance

Answers:

> **Where did this artifact come from, and how was it produced?**

### Artifact Security

Answers:

> **Does this artifact satisfy the security requirements for execution?**

A useful mental model is:

```text
Artifact Identity
        ↓
Which artifact?

Artifact Integrity
        ↓
Was it modified?

Artifact Provenance
        ↓
Where did it come from?

Security Assessment
        ↓
What risks does it contain?

Trust Decision
        ↓
Should it be allowed to execute?
```

These properties are related but not interchangeable.

For example:

```text
Valid Signature
      ↓
Integrity / Authenticity Evidence
      ≠
Vulnerability-Free Artifact
```

Similarly:

```text
Known Provenance
      ↓
Known Origin / Build History
      ≠
Automatically Secure Artifact
```

---

# 25. Artifact Integrity

Artifact integrity answers:

> **Has this artifact been modified from the version that was intended to be distributed?**

Examples of artifacts include:

- Container images
- Application packages
- Model files
- Configuration bundles
- Libraries
- Deployment packages

A simplified integrity model is:

```text
Expected Artifact
       ↓
Integrity Evidence
       ↓
Artifact Received
       ↓
Verification
       ↓
Accept / Reject
```

Integrity is different from functionality.

An artifact can be exactly the artifact that was signed and still contain a vulnerability.

Therefore:

```text
Integrity
   ≠
Security
```

---

# 26. Artifact Provenance vs Artifact Security

Artifact provenance answers questions such as:

- Where did the artifact come from?
- Which build produced it?
- Which source or process generated it?
- Which dependencies contributed to it?

Artifact security asks:

- Has it been modified?
- Does it contain known vulnerabilities?
- Is it authorized for this environment?
- Does it satisfy security requirements?
- Is it safe enough to execute?

These are related but different concerns.

```text
Provenance
   ↓
Origin / History

Integrity
   ↓
Modification / Authenticity

Security Assessment
   ↓
Risk / Acceptability
```

A known origin does not automatically mean a secure artifact.

---

# 27. Reproducibility vs Integrity

Reproducibility and integrity solve different problems.

**Reproducibility** asks:

> **Can we recreate the expected artifact from the defined inputs and build process?**

**Integrity** asks:

> **Has the artifact we received remained unchanged from the expected or verified content?**

Conceptually:

```text
Reproducibility
      ↓
Can we recreate it?

Integrity
      ↓
Did the artifact remain unchanged?
```

A reproducible build can help establish confidence in what an expected artifact should look like.

Integrity verification can then help determine whether the artifact being consumed matches that expected artifact.

Therefore:

```text
Reproducibility
    ≠
Integrity
```

These concerns complement one another.

---

# 28. Artifact Signing

Signing provides cryptographic evidence associated with an artifact.

Conceptually:

```text
Artifact
   ↓
Signing Process
   ↓
Signature
   ↓
Distribution
   ↓
Verification
```

A verifier can then determine whether the artifact matches the signed content and whether the signature is associated with an expected signing identity or trust chain.

This can provide stronger assurance than relying only on artifact names or registry locations.

However:

> **A valid signature does not prove that the artifact is vulnerability-free or functionally safe.**

Signing primarily addresses integrity and authenticity properties.

---

# 29. Artifact Verification

Verification should occur before an artifact crosses a security-sensitive boundary.

Conceptually:

```text
Artifact
   ↓
Verify Identity / Signature
   ↓
Check Integrity
   ↓
Check Policy
   ↓
Accept / Reject
```

Policy may consider:

- Expected artifact identity
- Trusted signer
- Artifact version
- Known vulnerabilities
- Environment suitability
- Required security metadata
- Approved source

This creates a stronger trust boundary than merely downloading an artifact from a known location.

---

# 30. Software Bill of Materials

A Software Bill of Materials, commonly called an **SBOM**, is an inventory describing the software components contained in or associated with an artifact.

Conceptually:

```text
Application Artifact
      ↓
SBOM
      ↓
Components
      ├── Dependency A
      ├── Dependency B
      ├── Library C
      └── Native Component D
```

An SBOM improves visibility into what is actually present.

It can support:

- Vulnerability analysis
- Dependency tracking
- Incident response
- Software inventory
- Compliance workflows
- Impact assessment when a component becomes vulnerable

---

# 31. What an SBOM Does Not Provide

An SBOM is not a security guarantee.

It does not automatically:

- Remove vulnerabilities
- Prevent compromise
- Prove artifact integrity
- Prove software behavior is safe
- Guarantee complete component discovery
- Establish that every dependency is trustworthy

Therefore:

```text
SBOM
   ↓
Visibility
   ≠
Security
```

The value of an SBOM depends on its accuracy and how the organization uses the information it provides.

---

# 32. AI/ML Supply Chain

AI systems introduce additional artifact types.

A simplified AI supply chain may look like:

```text
Source Code
    ↓
Application Dependencies
    ↓
AI Framework
    ↓
Model Runtime
    ↓
Model Artifact
    ↓
Tokenizer / Configuration
    ↓
Deployment Artifact
```

Other components may include:

- Pretrained models
- Fine-tuned models
- Embedding models
- Model adapters
- Tokenizers
- Data-processing libraries
- Evaluation packages
- Inference engines
- Native acceleration libraries

Each component introduces a trust decision.

---

# 33. Model Artifacts Are Production Artifacts

A model file should not be treated as “just data.”

A production model artifact may influence:

- Application behavior
- Resource consumption
- Input processing
- Output generation
- External interactions
- Data handling

Depending on the model format and runtime, artifacts may also contain executable or interpreted components.

Therefore:

> **Model artifacts require the same basic trust questions applied to other production artifacts: origin, integrity, contents, compatibility, and security risk.**

---

## 34. Untrusted Model Sources

A production system may obtain models from:

- Internal model repositories
- Public model repositories
- Vendors
- Partners
- Research projects
- Third-party distributions

The source alone should not determine trust.

A useful evaluation model is:

```text
Model Artifact
      ↓
Origin
      +
Integrity
      +
Format / Runtime Behavior
      +
Dependency Requirements
      +
Security Assessment
      ↓
Trust Decision
```

A public artifact can be useful without being automatically trusted.

An internal artifact can also be insecure if its production process is compromised.

---

# 35. Model Serialization and Loading Risk

AI model artifacts can use different serialization and storage mechanisms.

The security properties of a model artifact depend on factors such as:

- Serialization format
- Parser or deserializer
- Loading mechanism
- Runtime behavior
- Permissions available to the loading process

Some formats and loading mechanisms can permit executable or interpreted behavior during loading.

Therefore the security question is:

> **What happens when this artifact is loaded by the runtime?**

Do not assume:

```text
Model File
   =
Passive Data
```

A safer reasoning model is:

```text
Model Artifact
      ↓
Parser / Loader
      ↓
Runtime Behavior
      ↓
Security Boundary
```

The exact risk depends on the model format, runtime, and loading mechanism.

The production principle is:

> **Never assume an externally obtained model artifact is harmless merely because its filename or repository description looks trustworthy.**

---

# 36. Dependency and Model Trust Are Connected

An AI runtime may depend on multiple layers:

```text
Application
   ↓
AI Framework
   ↓
Model Runtime
   ↓
Native Libraries
   ↓
Hardware / Driver Stack
```

A model artifact may also require:

```text
Model
   ↓
Tokenizer
   ↓
Configuration
   ↓
Runtime Libraries
```

Security therefore requires reasoning about the complete execution chain.

A trusted model cannot compensate for a compromised runtime.

A trusted runtime cannot compensate for a malicious model artifact.

---

# 37. AI/ML Supply-Chain Attack Surface

Potential supply-chain attack points include:

```text
Source Repository
      ↓
Dependency Registry
      ↓
Build Environment
      ↓
Container Build
      ↓
Artifact Registry
      ↓
Model Repository
      ↓
Deployment
      ↓
Runtime
```

An attacker may attempt to compromise:

- A dependency
- A package release
- A model artifact
- A build dependency
- A container base image
- An artifact registry
- A distribution channel

The exact attack technique varies.

The underlying security problem is:

> **An attacker attempts to introduce untrusted or modified material into a trusted execution path.**

---

# 38. Base Images and Transitive Runtime Risk

Containerized AI workloads often start from a base image.

Conceptually:

```text
Base Image
    ↓
AI Runtime
    ↓
Application Dependencies
    ↓
Application
```

The application team may not have authored the base image.

Yet vulnerabilities in the base image become part of the deployed artifact.

Therefore base-image selection should consider:

- Source
- Maintenance status
- Known vulnerabilities
- Required runtime components
- Update process
- Trustworthiness

The same reasoning applies to inherited operating-system packages and native libraries.

---

# 39. Dependency Confusion and Namespace Risk

Package ecosystems may contain multiple sources from which similarly named packages can be obtained.

A malicious package may attempt to appear legitimate by using a name that resembles an internal or expected dependency.

The general attack pattern is:

```text
Expected Dependency
        ↓
Ambiguous / Competing Package Source
        ↓
Malicious Package
        ↓
Build / Runtime
```

The production defense is not a single tool.

It involves controlling:

- Approved package sources
- Dependency declarations
- Package resolution
- Version constraints
- Artifact verification
- Dependency review

The key principle is:

> **Dependency resolution is part of the security boundary.**

---

# 40. Dependency Confusion vs Dependency Vulnerability

These should not be confused.

### Dependency vulnerability

A legitimate dependency contains a known security weakness.

```text
Trusted Package
      ↓
Known Vulnerability
```

### Dependency confusion

An attacker attempts to cause the build or runtime to obtain an unintended malicious package.

```text
Expected Package
      ↓
Resolution Manipulation
      ↓
Malicious Package
```

The controls overlap but are not identical.

This distinction matters when designing supply-chain defenses.

---

# 41. Compromised Dependencies

Even a legitimate package can become compromised.

For example:

```text
Trusted Maintainer
      ↓
Package Repository
      ↓
Compromised Release
      ↓
Application
```

The application may therefore receive malicious code through a dependency it intentionally selected.

This is why dependency trust cannot be reduced to:

> “We have used this library before.”

Trust must include:

- Version
- Source
- Integrity
- Security status
- Maintenance state
- Release history
- Expected behavior

---

# 42. Artifact Registries

Artifact registries provide distribution and storage for build outputs.

They may contain:

- Container images
- Packages
- Model artifacts
- Configuration artifacts
- Other deployment assets

A registry should therefore be treated as a security-sensitive system.

Important questions include:

- Who can publish artifacts?
- Who can modify or delete artifacts?
- Can artifacts be overwritten?
- How are artifact identities represented?
- How are artifacts verified?
- How are vulnerable artifacts identified?
- How is access controlled?

The registry is part of the supply chain, not merely a storage location.

A compromised registry can therefore break an otherwise trustworthy chain:

```text
Trusted Build
      ↓
Compromised Registry
      ↓
Wrong / Modified Artifact
      ↓
Runtime
```

---

# 43. Immutable Artifact References

A deployment should identify an artifact precisely.

Consider:

```text
latest
```

versus a content-specific or otherwise immutable artifact identity.

A mutable label can point to different content over time.

This creates ambiguity:

```text
Deployment A
    ↓
latest
    ↓
Artifact X

Later

Deployment B
    ↓
latest
    ↓
Artifact Y
```

The name remained the same while the artifact changed.

Immutable artifact references improve reproducibility and investigation because the exact artifact can be identified.

---

# 44. Artifact Security Policy

Production systems should define what makes an artifact acceptable.

A conceptual policy might require:

```text
Artifact
   ↓
Identity Verified
   ↓
Source Trusted
   ↓
Integrity Verified
   ↓
Known Vulnerabilities Assessed
   ↓
Required Metadata Present
   ↓
Policy Satisfied
   ↓
Allowed to Run
```

This creates a security gate around artifact trust.

The exact implementation can vary by organization and environment.

---

# 45. Security Gates vs Security Guarantees

A security gate evaluates whether an artifact satisfies defined requirements.

It does not prove that the artifact is perfectly secure.

For example:

```text
Artifact
   ↓
No Known Critical Vulnerabilities
   ↓
Approved Signer
   ↓
Required Metadata
   ↓
Accepted
```

The artifact may still contain:

- Unknown vulnerabilities
- Logic flaws
- Misconfigurations
- Unsafe behavior
- Future undiscovered vulnerabilities

Therefore:

> **Passing a security gate means the artifact satisfied defined controls; it does not mean the artifact is risk-free.**

---

# 46. Defense in Depth

Supply-chain security should use multiple independent controls.

A conceptual defense-in-depth model is:

```text
Source Control
      ↓
Dependency Controls
      ↓
Build Controls
      ↓
Artifact Integrity
      ↓
Vulnerability Assessment
      ↓
Artifact Verification
      ↓
Runtime Restrictions
      ↓
Security Monitoring
```

No single control should carry the entire security burden.

For example:

```text
Signing
   ≠
Vulnerability Scanning

SBOM
   ≠
Artifact Integrity

Container Isolation
   ≠
Application Security
```

Each control addresses a different class of risk.

---

# 47. Security Control Mapping

A useful way to reason about controls is to map each threat to the property it addresses.

| Risk | Relevant Control |
|---|---|
| Unknown dependency | Dependency inventory |
| Known vulnerable package | Vulnerability management |
| Artifact modification | Integrity verification |
| Untrusted artifact origin | Provenance / trusted source |
| Malicious package release | Dependency/source controls |
| Excessive container privilege | Runtime privilege restrictions |
| Unnecessary image components | Minimal image design |
| Unknown artifact contents | SBOM / artifact inspection |
| Unauthorized artifact publication | Registry access control |
| Ambiguous artifact identity | Immutable references |
| Malicious model source | Model provenance and verification |
| Unsafe artifact loading | Controlled loading and runtime isolation |

The important engineering skill is not memorizing the table.

It is learning to ask:

> **Which security property does this control actually provide?**

---

## 48. Common Supply-Chain Security Failures

## 48.1 “The Package Is Popular, So It Is Safe”

Popularity does not prove:

- Current security
- Correct provenance
- Safe release
- Absence of vulnerabilities

---

## 48.2 “The Container Is Isolated, So the Application Is Safe”

Containerization does not eliminate:

- Application vulnerabilities
- Malicious dependencies
- Excessive privileges
- Unsafe runtime configuration

---

## 48.3 “The Artifact Is Signed, So It Is Safe”

A valid signature primarily provides integrity/authenticity evidence.

It does not prove:

- No vulnerabilities
- No malicious functionality
- Correct business behavior

---

## 48.4 “The SBOM Shows Everything, So We Are Secure”

An SBOM improves visibility.

It does not remove risk.

---

## 48.5 “The Scanner Found No Vulnerabilities”

This means:

> No vulnerabilities known to that scanner under its detection model were identified.

It does not mean:

> No vulnerabilities exist.

---

## 48.6 “Internal Artifacts Are Automatically Trusted”

Internal systems can also be compromised.

Trust should be based on defined security controls rather than location alone.

---

## 48.7 “Latest Is Good Enough”

Mutable artifact labels create uncertainty about what was actually deployed.

---

## 49. Production Security Review Framework

When reviewing an AI application's software and artifact chain, ask:

### Application

- What inputs enter the application?
- Where are trust boundaries?
- How are inputs validated?
- How are outputs handled?
- Which external integrations exist?

### Dependencies

- What direct dependencies exist?
- What transitive dependencies exist?
- Are versions controlled?
- Are dependencies maintained?
- How are updates evaluated?

### Containers

- What base image is used?
- What does the image contain?
- Are unnecessary components present?
- Which privileges does the workload receive?
- What runtime resources can it access?

### Artifacts

- What artifacts are produced?
- How are artifact identities established?
- Can artifacts be modified after publication?
- How is integrity verified?
- Who can publish artifacts?

### Supply Chain

- Where do dependencies originate?
- Where do models originate?
- Can build inputs be replaced?
- Can artifact distribution be compromised?
- Can a malicious component enter the execution path?

### AI/ML Artifacts

- What model artifacts are used?
- Where did they originate?
- How are they verified?
- What happens during loading?
- What runtime dependencies do they require?

---

## 50. Production Trust Model

A useful production mental model is:

```text
Source
  ↓
Dependency Trust
  ↓
Build Trust
  ↓
Artifact Integrity
  ↓
Artifact Security Assessment
  ↓
Artifact Verification
  ↓
Runtime Security
  ↓
Execution
```

Each stage answers a different question.

### Source

> Did we obtain the intended source?

### Dependency Trust

> Did we obtain the intended dependencies?

### Build Trust

> Did the build produce the expected artifact?

### Artifact Integrity

> Has the artifact been modified?

### Security Assessment

> Does the artifact contain known or identified security risks?

### Artifact Verification

> Is this artifact authorized and trusted for execution?

### Runtime Security

> Does the execution environment preserve the intended security boundary?

The result is a chain of security decisions rather than a single trust decision.

---

# 51. Artifact Trust Decision

A production artifact can be evaluated using:

```text
Origin
  +
Integrity
  +
Content Inventory
  +
Known Vulnerabilities
  +
Runtime Compatibility
  +
Authorization
  ↓
Trust Decision
```

This is more robust than relying on any single signal.

For example:

```text
Trusted Source
     +
Valid Signature
     +
Known Critical Vulnerability
     ↓
Reject / Remediate
```

Likewise:

```text
Unknown Source
     +
No Integrity Evidence
     ↓
Reject
```

Security controls must therefore work together.

---

# 52. AI Model Trust Decision

For an AI model artifact:

```text
Model Source
     ↓
Model Identity
     ↓
Integrity Verification
     ↓
Artifact / Format Assessment
     ↓
Dependency Assessment
     ↓
Vulnerability Assessment
     ↓
Runtime Isolation
     ↓
Trust Decision
```

This is particularly important when models are obtained from external sources.

The security objective is not to assume that external models are malicious.

It is to ensure that external trust assumptions are explicit and controlled.

---

# 53. Security Trade-offs

Supply-chain security controls introduce engineering trade-offs.

## Dependency Pinning

**Benefit**

- Reproducibility
- Predictable builds
- Easier investigation

**Trade-off**

- Slower adoption of security updates
- Dependency maintenance burden

---

## Minimal Container Images

**Benefit**

- Smaller attack surface
- Fewer components to patch

**Trade-off**

- Greater effort to construct and maintain
- Potentially reduced debugging convenience

---

## Artifact Verification

**Benefit**

- Stronger integrity and authenticity assurance

**Trade-off**

- Additional release and operational complexity
- Key and trust-management requirements

---

## Aggressive Vulnerability Remediation

**Benefit**

- Reduced exposure to known vulnerabilities

**Trade-off**

- Potential compatibility problems
- More frequent updates
- Testing and validation overhead

---

## Strict Artifact Policy

**Benefit**

- Stronger supply-chain control
- Reduced chance of untrusted artifacts reaching production

**Trade-off**

- Greater release friction
- More operational processes
- Potential delays when legitimate artifacts fail policy checks

---

## 54. Residual Risk

Even a mature supply-chain security system cannot guarantee complete security.

For example:

```text
SBOM
  ↓
Known Components Identified
  ↓
Unknown Vulnerability
  ↓
Residual Risk
```

Or:

```text
Valid Signature
  ↓
Artifact Integrity Established
  ↓
Unsafe Functionality
  ↓
Residual Risk
```

Or:

```text
Vulnerability Scanner
  ↓
No Known Vulnerability
  ↓
New Vulnerability Discovered Later
  ↓
Residual Risk
```

Security engineering therefore requires continuous risk assessment rather than assuming that passing controls means zero risk.

---

# 55. Production Checklist

Before allowing an AI application artifact to execute in production, verify:

### Application Security

- [ ] Application trust boundaries are identified.
- [ ] Untrusted inputs are validated appropriately.
- [ ] Outputs are handled according to their downstream risk.
- [ ] Sensitive operations are protected by explicit authorization.
- [ ] External integrations are identified and reviewed.

### Dependencies

- [ ] Direct dependencies are known.
- [ ] Transitive dependencies are discoverable.
- [ ] Dependency versions are controlled.
- [ ] Dependency sources are controlled.
- [ ] Known vulnerabilities are assessed.
- [ ] Dependency updates are managed deliberately.

### Container Security

- [ ] Base images have a known source.
- [ ] Image contents are understood.
- [ ] Unnecessary components are minimized.
- [ ] Runtime privileges are minimized.
- [ ] Unnecessary host/resource access is avoided.
- [ ] Runtime configuration has been security-reviewed.

### Artifact Integrity and Trust

- [ ] Artifact identity is unambiguous.
- [ ] Artifact integrity can be verified.
- [ ] Trusted signing or equivalent integrity mechanisms are used where appropriate.
- [ ] Artifact publication is access-controlled.
- [ ] Mutable artifact references are avoided where stronger identity is required.
- [ ] Artifact acceptance criteria are defined.

### SBOM and Vulnerability Management

- [ ] Software inventory is available where required.
- [ ] Vulnerability assessment is performed.
- [ ] Findings are prioritized based on risk.
- [ ] Remediation is tracked.
- [ ] Exceptions are understood and documented.
- [ ] Security scanning limitations are recognized.

### AI/ML Supply Chain

- [ ] Model sources are known.
- [ ] Model artifacts are identified.
- [ ] Model integrity can be verified where required.
- [ ] Model loading behavior is understood.
- [ ] Model runtime dependencies are known.
- [ ] External model artifacts are not trusted solely because of their source or popularity.

---

## 56. Summary

Production AI security requires trust in more than application identities.

The software, dependencies, containers, models, and artifacts that make up the system must also be evaluated.

The key concepts are:

1. **Application security** protects application trust boundaries, behavior, and data flows.
2. **Supply-chain security** establishes trust in the components and artifacts used to construct and execute the application.
3. **Dependency security** addresses risks inherited from direct and transitive dependencies.
4. **Dependency pinning and controlled updates** balance reproducibility with security maintenance.
5. **Vulnerability management** identifies, prioritizes, remediates, and tracks known weaknesses.
6. **Vulnerability severity is not identical to practical risk.**
7. **Containerization provides a deployment boundary but does not automatically provide security.**
8. **Image security and runtime security are complementary concerns.**
9. **Minimal images can reduce unnecessary attack surface.**
10. **Container runtime privileges should be minimized.**
11. **Artifact identity, integrity, provenance, and security are distinct properties.**
12. **Reproducibility helps establish what an expected artifact should be; integrity helps establish whether the artifact consumed matches the expected or verified content.**
13. **Artifact signing and verification provide integrity and authenticity properties but do not prove complete security.**
14. **SBOMs improve visibility into software composition but do not eliminate vulnerabilities.**
15. **AI/ML systems introduce additional artifacts such as models, tokenizers, runtimes, and native components.**
16. **Model artifacts should be treated as production artifacts rather than automatically trusted data.**
17. **Model-loading risk depends on the artifact format, parser/loader, runtime, and permissions available during loading.**
18. **Dependency confusion, compromised releases, malicious artifacts, and registry compromise represent different supply-chain risks.**
19. **Immutable artifact identity improves reproducibility and security investigation.**
20. **Defense in depth is required because no individual supply-chain control provides complete assurance.**
21. **Security gates establish defined acceptance criteria; they do not prove that an artifact is risk-free.**

The production engineering standard is therefore:

> **Know what you are running, know where it came from, identify the exact artifact, verify its integrity, understand what it contains, assess its known risks, restrict its runtime privileges, and never confuse one security control with complete security assurance.**

This establishes the application, container, artifact, and supply-chain foundation required before examining the AI-specific production threats introduced by the capabilities themselves.
