# Dependency and Build Workflow

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain why applications depend on external libraries, frameworks, and tools.
- Distinguish direct dependencies from transitive dependencies.
- Understand dependency declarations, version constraints, and dependency resolution.
- Explain the purpose of lockfiles and reproducible dependency installations.
- Understand what a build process does and why build outputs matter.
- Recognize the relationship between source files, dependencies, build tools, and generated artifacts.
- Diagnose common dependency and build failures systematically.
- Make dependency changes while minimizing compatibility and reproducibility risks.

## Prerequisites

- [Chapter 03 — Task Breakdown and Work Planning](03-Task-Breakdown-and-Work-Planning.md)
- [Chapter 04 — Incremental Implementation Workflow](04-Incremental-Implementation-Workflow.md)
- [Chapter 05 — Working with Existing Codebases](05-Working-with-Existing-Codebases.md)
- ENG-05 — Linux and Development Environment
- Basic familiarity with application source code and command-line tools

## Estimated Reading Time

25–35 minutes

---

## 1. Introduction

Modern applications rarely consist entirely of code written by their own developers.

A Python application might use FastAPI to expose HTTP endpoints, Pydantic to validate data, SQLAlchemy to interact with a database, and several additional libraries for authentication, logging, and data processing.

Each external component introduces a dependency.

Dependencies reduce the amount of functionality an engineering team must implement and maintain itself. However, they also introduce version constraints, compatibility requirements, installation procedures, and potential sources of failure.

Build processes introduce another related concern: transforming source files and dependencies into outputs that can be executed, packaged, or otherwise consumed.

Consider a simple scenario:

A developer updates a library used by an application. The application works on the developer's machine, but another developer cannot install the dependencies. A third environment installs successfully but produces a runtime error because a transitive dependency resolves to an incompatible version.

The application code may not have changed significantly, yet the development workflow has become unreliable.

Understanding dependency and build workflows helps engineers make these processes predictable.

## 2. Why Dependency Management Exists

Imagine that every application had to implement its own HTTP server, database driver, JSON parser, cryptographic primitives, and testing framework.

The engineering effort would be enormous. Teams would duplicate existing functionality and become responsible for maintaining complex components that are not their primary product.

External libraries solve this problem by allowing applications to reuse existing implementations.

However, reusing a library creates questions:

- Which library version does the application require?
- Which other libraries does that version depend on?
- Are those versions compatible with the application?
- How can another developer install an equivalent dependency set?
- What happens when a library releases a breaking change?
- How can the team determine which dependency introduced a failure?

Dependency management provides mechanisms for declaring, resolving, installing, and maintaining these relationships.

**The objective is not merely to install packages. It is to control the software components on which an application depends.**

## 3. A Mental Model of Application Dependencies

An application can be viewed as a graph of software components.

Suppose an application directly uses Library A, and Library A requires Library B.

```text
Application
    |
    v
 Library A
    |
    v
 Library B
```

The application depends directly on Library A and indirectly on Library B.

Now suppose Library B also depends on Library C:

```text
Application
    |
    v
 Library A
    |
    v
 Library B
    |
    v
 Library C
```

The complete dependency graph may contain many branches, shared dependencies, and version constraints.

This graph is important because the application does not operate only with the packages explicitly named in its dependency declaration. It also operates with the dependencies required by those packages.

A dependency change can therefore affect components that the application never imports directly.

## 4. Direct and Transitive Dependencies

### 4.1 Direct Dependencies

A direct dependency is a component that the application explicitly declares or intentionally relies on.

For example:

```text
fastapi
pydantic
sqlalchemy
```

If the application imports FastAPI directly, FastAPI is a direct dependency.

Direct dependencies should generally be declared explicitly rather than relying on another library to install them incidentally.

Otherwise, an application might work only because some unrelated package happens to install the library it needs.

### 4.2 Transitive Dependencies

A transitive dependency is required by another dependency.

For example:

```text
Application
    |
    +---- FastAPI
    |        |
    |        +---- Dependency X
    |
    +---- Database library
             |
             +---- Dependency X
```

Both direct dependencies may require the same underlying package.

The dependency manager must account for the combined constraints and select a compatible version when one exists.

Transitive dependencies are not necessarily less important because the application does not use them directly. They can still introduce security vulnerabilities, compatibility issues, or installation failures.

### 4.3 Why the Distinction Matters

When an installation fails, the problematic package may not appear in the application's direct dependency list.

An engineer must therefore investigate the resolved dependency graph rather than inspecting only the top-level declarations.

The same principle applies when evaluating upgrades: changing one direct dependency can change several transitive dependencies.

## 5. Dependency Declarations and Version Constraints

A dependency declaration communicates which external component an application needs and, where specified, which versions are acceptable.

For example, a Python project might declare:

```text
fastapi>=0.100,<1.0
```

This expresses a version range rather than one exact version.

The constraint permits versions greater than or equal to `0.100` and lower than `1.0`, subject to the package manager's version interpretation and the availability of compatible dependencies.

### 5.1 Why Version Constraints Exist

Different versions of a library can have different:

- APIs and function signatures.
- Default behaviors.
- Dependencies on other packages.
- Runtime requirements.
- Bug fixes and security properties.

A broad constraint provides flexibility but may allow future versions with behavior that has not been tested by the application.

A narrow constraint limits variation but can make upgrades and compatibility maintenance more difficult.

Version selection is therefore an engineering decision, not just a formatting preference.

### 5.2 Common Constraint Styles

| Constraint style | Example | General effect |
|---|---|---|
| Unconstrained | `library` | Allows the package manager to choose an available version according to its resolution rules. |
| Minimum version | `library>=2.0` | Excludes versions below the specified minimum. |
| Bounded range | `library>=2.0,<3.0` | Restricts resolution to a specified range. |
| Exact version | `library==2.4.1` | Requests one specific version. |

These examples illustrate common Python version specifiers. Other ecosystems use different syntax and resolution rules.

An exact version is not automatically the best choice for every dependency. The appropriate strategy depends on compatibility requirements, the package ecosystem, the resolution mechanism, and how the project records its complete dependency set.

## 6. Dependency Resolution

Declaring dependencies does not necessarily determine the complete set of packages that will be installed.

A dependency resolver evaluates package requirements and attempts to find a set of versions that satisfies their combined constraints.

Consider this example:

```text
Application requires:
    Library A >= 2.0
    Library B >= 1.0

Library A requires:
    Shared Library >= 3.0, < 4.0

Library B requires:
    Shared Library >= 2.0, < 3.0
```

The requirements for the shared library conflict:

```text
Library A: Shared Library >= 3.0, < 4.0
Library B: Shared Library >= 2.0, < 3.0
```

No version satisfies both constraints.

The resolver cannot produce a valid solution under these requirements.

An engineer must investigate whether a dependency can be upgraded, downgraded, replaced, or reconfigured. Forcing an arbitrary version without understanding the conflict can produce an installation that succeeds but fails at runtime.

### 6.1 What a Resolver Considers

Depending on the package ecosystem, dependency resolution can consider:

- Declared version constraints.
- Transitive dependency requirements.
- Available package versions.
- Runtime or language-version requirements.
- Platform-specific package availability.
- Optional dependency groups or features.
- Constraints supplied by the project or environment.

The exact resolution process differs across package managers.

The important concept is that dependency selection is a constraint-solving problem across a graph, not simply a process of downloading the latest version of every package.

## 7. Lockfiles and Reproducibility

A dependency declaration often describes acceptable versions rather than the exact dependency set used by a working application.

A lockfile records a resolved dependency set in a format understood by the relevant tool.

Depending on the ecosystem, it may contain exact versions, source information, hashes, and other resolution details.

For example, a Python project might use a dependency declaration alongside a lockfile managed by a tool such as Poetry or uv.

The declaration expresses the project's dependency requirements. The lockfile records the selected solution produced by the dependency-management workflow.

### 7.1 Why Lockfiles Matter

Suppose two developers install the same project on different days.

Without a controlled resolution process, they may receive different compatible versions of a transitive dependency.

Both installations may satisfy the top-level version constraints, but the resulting environments may behave differently.

A committed lockfile helps the team reproduce the resolved dependency set across supported environments.

It does not guarantee that the entire application behaves identically everywhere. Operating systems, runtime versions, environment configuration, external services, and platform-specific packages can still differ.

### 7.2 Declaration Versus Lockfile

| Dependency declaration | Lockfile |
|---|---|
| Describes direct requirements and allowed constraints. | Records the resolved dependency solution. |
| Communicates the intended dependency policy. | Helps reproduce a particular dependency resolution. |
| May permit multiple valid dependency sets. | Typically narrows installation to a specific resolved set. |
| Changes when dependency requirements change. | Changes when the resolved solution changes. |

Not every ecosystem uses a separate lockfile. Some tools combine dependency declarations and resolution data in a single project file.

The engineering objective is to understand which files are authoritative for your project's dependency workflow.

### 7.3 Reproducibility Has Limits

A lockfile is an important part of reproducibility, but it is not the whole solution.

Reproducible development may also require:

- A compatible language runtime.
- Supported operating-system and platform versions.
- Correct environment configuration.
- Available package sources.
- Consistent build tools.
- External services with suitable versions and behavior.

Environment setup fundamentals belong to ENG-05. This chapter focuses on how dependency resolution and build processes fit into that wider environment.

## 8. What Is a Build Process?

A build process transforms source files and other inputs into outputs required by a development, testing, or execution workflow.

The transformation depends on the language and toolchain.

Examples include:

- Compiling source code into machine code.
- Compiling TypeScript into JavaScript.
- Bundling JavaScript modules into deployable assets.
- Generating code from schemas.
- Packaging a Python application or library.
- Processing assets required by an application.

Not every language requires a traditional compilation step. Python source files, for example, can generally be executed by the Python runtime without a separate project-wide compilation stage.

A build process can still exist in a Python project when it packages the application, generates artifacts, processes assets, or prepares a distributable library.

### 8.1 A Simplified Build Model

```text
Source files
     |
     v
Build configuration
     |
     +---- Dependencies and tools
     |
     v
Build process
     |
     v
Generated artifacts
```

The actual build may involve several stages, and some build systems use dependency graphs to determine which tasks need to run.

The resulting artifacts might be executables, packages, generated source files, bundled assets, or other outputs.

### 8.2 Build Configuration

Build configuration defines how the build should be performed.

Depending on the ecosystem, it may specify:

- Source locations.
- Compiler or bundler options.
- Build targets.
- Dependencies between build tasks.
- Generated output locations.
- Packaging metadata.
- Environment-specific build settings.

The configuration is part of the project's engineering contract. An unexplained modification can change what gets built or how the result behaves.

Before changing build configuration, identify which tool consumes it and which outputs or workflows depend on it.

## 9. Build Dependencies and Build Artifacts

Dependencies used to execute an application are not always identical to the tools needed to build it.

For example, a frontend project might require a bundler during development and build time, while the final application serves the generated JavaScript and CSS assets.

Likewise, a compiled application may require a compiler to create an executable even when the executable does not require the compiler at runtime.

It is useful to distinguish:

- **Runtime dependencies:** Components required while the application runs.
- **Development dependencies:** Components used for development activities, such as testing, linting, or local tooling.
- **Build dependencies:** Components required to transform source inputs into the intended artifacts.

These categories can overlap. A package's classification depends on how the project uses it and how its ecosystem represents dependency groups.

### 9.1 Why the Distinction Matters

Correctly classifying dependencies helps teams understand:

- What must be available to execute the application.
- What is required only for development or testing.
- Which tools are needed to generate artifacts.
- Which components can be omitted from a particular execution environment.

Incorrect classification can lead to missing build tools, unnecessary installed packages, or confusing installation procedures.

## 10. Dependency and Build Workflow

A controlled workflow makes dependency and build changes easier to understand and reproduce.

### Step 1: Inspect the Existing Project Configuration

Identify the project's dependency declarations, lockfiles, build configuration, and documented commands.

Determine which package manager and build tool the project actually uses.

Do not introduce a new tool simply because you prefer it without considering the project's established workflow.

### Step 2: Understand the Requested Change

Determine whether the task requires:

- Adding a dependency.
- Removing a dependency.
- Changing a version constraint.
- Updating the resolved dependency set.
- Modifying build configuration.
- Changing the build output.

These changes have different consequences and should not be treated as interchangeable.

### Step 3: Evaluate Compatibility

Before adding or upgrading a dependency, consider:

- Whether it supports the project's runtime.
- Whether it conflicts with existing dependency constraints.
- Whether it introduces transitive dependencies.
- Whether it changes behavior relied on by the application.
- Whether the project needs the dependency at runtime or only during development.

For a major or widely used dependency, the investigation may need to be broader.

### Step 4: Update the Appropriate Files

Use the project's established package manager and workflow.

Update the dependency declaration and the corresponding lockfile when required by the tool. Avoid manually editing generated resolution data unless the tool explicitly supports that workflow.

### Step 5: Resolve and Install Dependencies

Run the project's documented dependency workflow.

If resolution fails, inspect the reported constraints and identify the conflicting requirements. Do not respond to every resolution error by repeatedly changing unrelated package versions.

### Step 6: Run the Relevant Build

Execute the project's documented build command, if a build step exists.

Confirm that the expected artifacts are generated and that the build uses the intended configuration.

### Step 7: Validate the Change

Use the checks appropriate to the modification. These may include tests, static analysis, package validation, artifact inspection, or a focused runtime check.

The precise validation strategy belongs to the project's wider development-quality workflow, covered in ENG-08.

### Step 8: Record the Result

Document dependency changes, compatibility constraints, build requirements, or workflow changes that future developers need to understand.

For everyday technical documentation and change traceability, see [Chapter 07 — Documentation and Change Traceability](07-Documentation-and-Change-Traceability.md).

## 11. Common Dependency and Build Failures

### 11.1 Version Conflicts

**Symptom:** The dependency manager cannot find a version combination that satisfies all requirements.

**Possible cause:** Two dependencies impose incompatible constraints on a shared package.

**Investigation:** Read the resolver's conflict information, identify the relevant requirements, and evaluate compatible versions or alternative dependencies.

### 11.2 Missing Dependency

**Symptom:** An import or command fails because a package cannot be found.

**Possible cause:** The dependency is undeclared, not installed in the active environment, or incorrectly classified.

**Investigation:** Verify the project's dependency declarations, installation workflow, and active environment. Environment setup details are covered in ENG-05.

### 11.3 Works on One Machine but Not Another

**Symptom:** One developer can install or build the project while another cannot.

**Possible causes include:**

- Different resolved dependency versions.
- Different runtime versions.
- Platform-specific package availability.
- Unrecorded environment assumptions.
- Different build-tool versions.

**Investigation:** Compare the declared and resolved dependencies, runtime requirements, platform assumptions, and documented setup instructions.

Do not immediately assume that the source code itself is defective.

### 11.4 Build Fails After a Dependency Upgrade

**Symptom:** The build worked before an upgrade but now fails.

**Possible causes include:**

- An incompatible API change.
- A changed compiler or build-tool requirement.
- A transitive dependency update.
- A removed or renamed configuration option.
- A change in generated output behavior.

**Investigation:** Identify what changed in the dependency resolution and build configuration. Narrow the failure to the smallest relevant change before considering a rollback or alternative version.

### 11.5 Stale or Unexpected Build Output

**Symptom:** The build succeeds, but the generated output does not reflect the expected source changes.

**Possible causes include:**

- Incorrect input or output paths.
- A build target that does not include the modified files.
- Stale generated artifacts.
- Incorrect build configuration.
- A build process that skipped a required step.

**Investigation:** Confirm which inputs the build consumes, which target was executed, and where the artifacts were written.

### 11.6 Manual Changes to Generated Files

**Symptom:** A change appears to work temporarily but disappears after the next build.

**Possible cause:** The modified file is generated from another source or configuration file.

**Investigation:** Identify the generation process and modify the authoritative input when appropriate.

Generated artifacts should not be treated as authoritative source files unless the project's workflow explicitly defines them that way.

## 12. Production Engineering Perspective

Dependency and build workflows affect more than local developer convenience.

In production engineering, they influence:

- **Reliability:** Whether the same project can be installed and built consistently.
- **Compatibility:** Whether libraries and tools work together.
- **Maintainability:** Whether future upgrades can be evaluated and applied deliberately.
- **Traceability:** Whether the team can determine which dependencies and tools produced an artifact.
- **Security:** Whether dependencies can be evaluated and updated when vulnerabilities are discovered.
- **Efficiency:** Whether unnecessary dependency installation and repeated build work can be avoided.

A successful build proves that a particular build process completed. It does not prove that the resulting application is correct, secure, performant, or compatible with every supported environment.

Those properties require additional validation.

For a routine dependency update, a small and well-understood change may be sufficient. For a major runtime or build-tool upgrade, a controlled compatibility assessment and broader validation may be necessary.

The level of rigor should match the risk of the change.

## 13. Trade-offs and Engineering Decisions

### Exact Versions Versus Version Ranges

Exact versions can improve control over a particular resolution, while version ranges allow more flexibility. A lockfile can provide a reproducible resolved set while the declaration retains an intentional upgrade policy.

Choose a strategy that matches the project's ecosystem and release process.

### Updating Dependencies Versus Keeping Them Stable

Upgrades can provide fixes, improvements, and new capabilities. They can also introduce breaking changes and additional migration work.

Keeping dependencies unchanged can reduce immediate disruption, but it can accumulate compatibility and maintenance costs.

Evaluate upgrades deliberately rather than treating either frequent upgrades or indefinite stability as universally correct.

### More Dependencies Versus Less Custom Code

A library can save implementation effort but also adds maintenance, compatibility, and security considerations.

Before introducing a dependency, consider whether it provides meaningful value, whether an existing dependency already solves the problem, and whether the team can maintain the additional component.

Avoid both unnecessary dependencies and unnecessary reinvention.

### Rebuilding Everything Versus Reusing Valid Outputs

A full build may be simpler to reason about, while incremental build systems can reduce repeated work by rebuilding only affected targets.

Incremental builds rely on the build system correctly tracking dependencies and inputs. When that tracking is incomplete or incorrect, stale outputs may result.

Choose the approach supported by the project's tooling and reliability requirements.

## 14. Common Mistakes

- **Installing packages without declaring them:** The project may work locally but fail in a clean environment.
- **Ignoring transitive dependencies:** A conflict or behavior change may originate several levels below a direct dependency.
- **Changing many versions at once:** This makes failures harder to attribute to a specific change.
- **Treating a lockfile as a complete reproducibility guarantee:** Runtime, platform, configuration, and build-tool differences can still matter.
- **Manually modifying generated resolution data:** The next package-manager operation may overwrite the change or produce an inconsistent result.
- **Assuming a successful build proves correctness:** Build success is only one form of evidence.
- **Editing generated output instead of its source:** The next build may discard the change.
- **Mixing unrelated cleanup with dependency upgrades:** The larger change makes diagnosis and review more difficult.
- **Ignoring the distinction between build-time and runtime dependencies:** The project may fail to build or carry unnecessary components into its execution environment.
- **Changing build configuration without understanding its consumers:** Other targets or generated artifacts may be affected unexpectedly.

## 15. Interview Questions and Answers

### Q1. What is the difference between a direct and a transitive dependency?

A direct dependency is explicitly required by the application. A transitive dependency is required by another dependency. Both can affect compatibility, installation, and runtime behavior.

### Q2. What problem does dependency resolution solve?

It attempts to find a compatible set of package versions that satisfies the combined constraints imposed by the application and its dependencies.

### Q3. What is the purpose of a lockfile?

A lockfile records a resolved dependency set so that supported installation workflows can reproduce that resolution more consistently. It does not eliminate all differences between environments.

### Q4. Why might an application work on one developer's machine but fail on another?

The environments may differ in resolved dependency versions, runtime versions, platform support, build tools, or configuration. The engineer should compare these factors before assuming the application source is the sole cause.

### Q5. What is the difference between a dependency declaration and a lockfile?

The declaration describes requirements and permitted constraints. The lockfile records the selected dependency solution. Some ecosystems combine these responsibilities in a single file.

### Q6. What does a build process do?

It transforms source files, configuration, dependencies, and other inputs into outputs required by a workflow. Depending on the ecosystem, this may involve compilation, bundling, code generation, or packaging.

### Q7. Does every application require a traditional build step?

No. Some applications can be executed directly by their runtime. Others require compilation, bundling, packaging, or other transformations before their outputs can be consumed.

### Q8. What should you investigate when a dependency upgrade breaks a build?

Inspect the dependency changes, version constraints, transitive resolution, runtime requirements, build-tool compatibility, and relevant configuration. Narrow the problem before deciding whether to adjust the version or modify the application.

### Q9. Why should generated artifacts usually not be edited directly?

They may be recreated from source files or configuration during the next build. Changes should generally be made to the authoritative input that produces the artifact.

## 16. Practical Assignment

### Scenario

An existing Python API project uses FastAPI and several supporting libraries. A new feature requires adding an external package. After the package is added, dependency installation succeeds on one machine but fails on another. A later build or validation step also fails.

### Part A — Dependency Investigation

Describe how you would determine:

1. Which package manager the project uses.
2. Which file declares the direct dependencies.
3. Whether a lockfile exists and how it is generated.
4. Which transitive dependencies are introduced by the new package.
5. Whether the project has explicit runtime requirements.
6. Whether the failure is caused by a version conflict, platform restriction, or environment difference.

### Part B — Build Investigation

Explain:

1. Whether the project has a distinct build step.
2. Which tools or configuration control that step.
3. Which inputs and outputs are relevant.
4. How you would determine whether the build failure is related to the dependency change.
5. What evidence would justify reverting or modifying the change.

### Part C — Engineering Decision

Prepare a short change plan that identifies:

- The intended dependency and why it is needed.
- The appropriate declaration and resolution changes.
- The compatibility risks.
- The validation required.
- The documentation that should be updated.

**Completion criterion:** You can explain how dependency requirements, resolution, installation, build configuration, and validation fit together, and how you would isolate a failure without making unrelated changes.

## 17. Revision Questions

Answer these without referring to the chapter:

1. Why do applications use external dependencies?
2. How can a transitive dependency cause a failure even when the application never imports it directly?
3. Why can two valid dependency resolutions behave differently?
4. What information does a lockfile provide, and what does it not guarantee?
5. How does a dependency resolver handle incompatible version constraints?
6. What distinguishes runtime dependencies from build dependencies?
7. Why might a project need a build process even if its language supports direct execution?
8. How would you investigate a build that succeeds but produces unexpected artifacts?
9. Why is changing one dependency at a time often easier to diagnose than upgrading many at once?
10. What additional context is needed before concluding that a dependency-related failure is a source-code defect?

## 18. Key Takeaways

- Dependencies allow applications to reuse existing software, but they introduce compatibility and maintenance requirements.
- Direct dependencies are explicitly required by the application; transitive dependencies are required by other dependencies.
- Dependency resolution evaluates a graph of version constraints to find a compatible solution.
- Dependency declarations and lockfiles serve related but distinct purposes.
- Reproducibility depends on more than package versions alone.
- Build processes transform source inputs into artifacts needed by a particular workflow.
- Runtime, development, and build dependencies serve different purposes, although their categories may overlap.
- Dependency and build changes should be focused, understood, and validated.
- Build success is evidence of a successful build process, not proof of overall application correctness.
- Systematic diagnosis is more effective than repeatedly changing versions or editing generated files without understanding their source.

## 19. Further Reading

- [Chapter 04 — Incremental Implementation Workflow](04-Incremental-Implementation-Workflow.md)
- [Chapter 05 — Working with Existing Codebases](05-Working-with-Existing-Codebases.md)
- [Chapter 07 — Documentation and Change Traceability](07-Documentation-and-Change-Traceability.md)
- ENG-05 — Linux and Development Environment
- ENG-08 — Development Quality

For ecosystem-specific behavior, consult the official documentation for the package manager and build tools used by the project. Exact commands, lockfile semantics, and build configuration differ across ecosystems.

---

**End of Document:** `06-Dependency-and-Build-Workflow.md`
