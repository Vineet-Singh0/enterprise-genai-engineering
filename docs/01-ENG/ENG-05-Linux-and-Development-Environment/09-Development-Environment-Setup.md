# 09 — Development Environment Setup

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain what a development environment actually consists of.
- Understand the relationship between the operating system, shell, runtime, tools, dependencies, and project.
- Set up a practical Linux development environment for software and GenAI engineering.
- Distinguish system-level tools from project-level dependencies.
- Configure a development environment without unnecessarily modifying the operating system.
- Verify that required tools are installed and correctly configured.
- Organize a development machine for multiple projects.
- Understand the role of environment variables and configuration in development setup.
- Diagnose common development-environment problems systematically.
- Recognize why development environments need to be reproducible.
- Understand which setup decisions belong to the developer and which should be documented by the project.

---

## Prerequisites

You should already understand:

- Linux fundamentals
- Linux filesystem
- Shell and command-line usage
- Files and directories
- Users, groups, and permissions
- Processes
- Package management
- Environment variables and configuration

Recommended previous chapters:

- [01 — Linux Fundamentals](./01-Linux-Fundamentals.md)
- [02 — Linux Filesystem](./02-Linux-Filesystem.md)
- [03 — Shell & Command Line](./03-Shell-and-Command-Line.md)
- [05 — Users, Groups & Permissions](./05-Users-Groups-and-Permissions.md)
- [06 — Processes & Process Management](./06-Processes-and-Process-Management.md)
- [07 — Package Management](./07-Package-Management.md)
- [08 — Environment Variables & Configuration](./08-Environment-Variables-and-Configuration.md)

---

## Estimated Reading Time

**25–30 minutes**

---

## Before We Start

A common definition of a development environment is:

> "My laptop with Python and VS Code installed."

That definition is incomplete.

A real development environment is the collection of software, configuration, tools, dependencies, credentials, project settings, and system capabilities required to develop and run a particular application.

For example, a Python-based GenAI project may require:

```text
Linux
  +
Shell
  +
Git
  +
Python
  +
Package manager
  +
Project dependencies
  +
Environment variables
  +
Database client/tools
  +
Editor
  +
Testing tools
  +
Project configuration
```

If one important part is missing or incompatible, the project may fail before you write a single line of application code.

This chapter teaches you to think about development environments as **engineered systems**, not as a random collection of installed software.

---

# Why Development Environments Exist

Software is rarely developed in isolation.

An application depends on an environment that provides:

- a CPU architecture
- an operating system
- a filesystem
- a shell
- language runtimes
- libraries
- command-line tools
- configuration
- network access
- credentials
- development utilities

For example:

```text
Python application
       │
       ▼
Python runtime
       │
       ▼
Operating system
       │
       ▼
Hardware
```

But the real dependency chain is usually larger:

```text
Application
    │
    ├── Python runtime
    │
    ├── Python packages
    │
    ├── Environment variables
    │
    ├── External services
    │
    └── OS capabilities
             │
             ▼
         Linux
             │
             ▼
          Hardware
```

A development environment exists to provide this execution context consistently enough for engineers to build and test software.

---

# Mental Model: The Development Environment Stack

Think of a development environment as layers.

```text
┌──────────────────────────────────┐
│          Your Project             │
├──────────────────────────────────┤
│   Project Dependencies & Tools    │
├──────────────────────────────────┤
│       Language Runtime            │
├──────────────────────────────────┤
│     Shell / CLI Environment       │
├──────────────────────────────────┤
│      Operating System             │
├──────────────────────────────────┤
│          Hardware                 │
└──────────────────────────────────┘
```

Each layer provides capabilities to the layer above it.

For a Python project:

```text
FastAPI Application
        │
        ▼
Python Packages
        │
        ▼
Python Runtime
        │
        ▼
Linux
        │
        ▼
Hardware
```

When something fails, this layered model helps determine where to investigate.

---

# What Belongs to a Development Environment?

A practical development environment can include several categories.

| Category | Examples |
|---|---|
| Operating system | Ubuntu, Debian, Fedora |
| Shell | Bash, Zsh |
| Runtime | Python, Node.js, Java |
| Version control | Git |
| Package manager | apt, pip |
| Project dependencies | FastAPI, NumPy, PyTorch |
| Editor/IDE | VS Code, Vim, PyCharm |
| Environment configuration | `.env`, shell variables |
| Databases/tools | PostgreSQL client, Redis CLI |
| Testing tools | pytest |
| Quality tools | Ruff, Black, mypy |
| Build tools | Make, task runners |
| Debugging tools | debugger, profiler |
| Documentation | setup instructions, dependency files |

Not every project needs all of these.

The correct environment depends on the project.

---

## System Tools vs Project Dependencies

One of the most important distinctions is between **system-level software** and **project-level dependencies**.

Consider Git.

Git is usually a system-level development tool:

```text
Operating System
      │
      └── Git
```

Python itself is also typically installed as a runtime available to developers:

```text
Operating System
      │
      └── Python
```

But a package such as FastAPI belongs to a particular project:

```text
Project
  │
  └── FastAPI
```

Similarly:

```text
Project A
  └── requests 2.x

Project B
  └── requests 3.x
```

Trying to install every project dependency globally creates conflicts.

This is one reason dependency isolation exists.

The detailed mechanism is covered in:

[10 — Virtual Environments & Dependency Isolation](./10-Virtual-Environments-and-Dependency-Isolation.md)

---

# Start With Requirements, Not Installation

A common beginner workflow is:

```text
Install everything
      ↓
Try project
      ↓
Fix errors
      ↓
Install something else
      ↓
Repeat
```

This often creates a messy environment.

A better engineering workflow is:

```text
Understand project
      ↓
Identify requirements
      ↓
Classify requirements
      ↓
Install required tools
      ↓
Configure environment
      ↓
Verify
      ↓
Run project
```

Before installing anything, ask:

```text
What does this project actually require?
```

---

# Step 1 — Understand the Project

Read the project's documentation first.

Look for:

```text
README
requirements files
pyproject.toml
package files
Makefile
configuration examples
setup scripts
documentation
```

For a Python project, common files may include:

```text
requirements.txt
pyproject.toml
uv.lock
poetry.lock
Pipfile
```

The exact dependency-management system depends on the project.

Do not arbitrarily introduce a new tool before understanding the existing project setup.

---

# Step 2 — Identify the Runtime

Determine which runtime the project expects.

For Python:

```bash
python --version
```

or:

```bash
python3 --version
```

The project may require a particular Python version.

For example:

```text
Python 3.11
```

is not necessarily interchangeable with every other Python version.

A dependency may support:

```text
Python >= 3.10
```

while another may require:

```text
Python < 3.13
```

Therefore:

> **Runtime version is part of the project's environment requirements.**

---

# Step 3 — Verify the Runtime

Do not assume that because Python is installed, the correct Python is being used.

Check:

```bash
python --version
```

Then:

```bash
command -v python
```

These answer different questions.

```text
python --version
        ↓
Which version?

command -v python
        ↓
Which executable?
```

This distinction becomes very important when multiple runtimes exist on the same machine.

---

# Step 4 — Verify the Shell

Determine which shell you are actually using.

For example:

```bash
echo "$SHELL"
```

You may see:

```text
/bin/bash
```

or:

```text
/bin/zsh
```

Why does this matter?

Shell configuration can affect:

- environment variables
- command aliases
- PATH
- startup configuration
- scripts
- developer tooling

Do not assume every Linux machine behaves identically.

---

# Step 5 — Verify Git

For most software projects:

```bash
git --version
```

Then:

```bash
command -v git
```

If Git is unavailable, install it using the package manager appropriate to the Linux distribution.

Git itself is covered in [ENG-04 — Version Control & Collaborative Development](../ENG-04-Version-Control-and-Collaborative-Development/README.md).

Here we care only about having the tool available in the development environment.

---

# Step 6 — Verify Basic CLI Utilities

A useful development environment should have basic command-line tools available.

For example:

```bash
ls
cd
cp
mv
rm
find
grep
cat
less
head
tail
```

Most standard Linux installations already provide these.

The goal is not to install every possible CLI tool.

The goal is to understand what the project actually needs.

---

# Step 7 — Install Project-Specific Tools

Some projects require additional tools.

For example:

```text
PostgreSQL client
Redis CLI
Node.js
Java
Docker CLI
cloud CLI
database migration tools
```

Install only what the project actually requires.

Avoid turning your development machine into a collection of tools that no project uses.

---

# Development Environment Example

Suppose you are setting up a FastAPI GenAI project.

A reasonable environment might look like:

```text
Linux
 │
 ├── Git
 │
 ├── Python
 │
 ├── Python virtual environment
 │
 ├── pip / project dependency manager
 │
 ├── PostgreSQL client
 │
 ├── Redis CLI
 │
 ├── Editor
 │
 └── Project
       ├── FastAPI
       ├── Pydantic
       ├── Qdrant client
       ├── LLM SDK
       └── pytest
```

Notice the separation.

Some components are machine-level tools.

Others belong to the project.

---

# Project Directory Organization

A development machine may contain many projects.

For example:

```text
~/projects/
├── vivahai/
├── genai-experiments/
├── rag-service/
├── ml-project/
└── learning/
```

This is not a strict requirement.

The important principle is:

> **Choose a predictable location for development projects and use a consistent structure.**

A predictable layout reduces accidental operations in unrelated directories.

---

# Avoid Developing Directly From Random Locations

Imagine:

```text
/home/user/Downloads/project
```

then:

```text
/home/user/Desktop/project
```

then:

```text
/tmp/project
```

This makes it harder to reason about:

- source code
- dependencies
- configuration
- virtual environments
- generated files
- logs

A consistent project location is simpler.

---

# Project Structure

A Python application might look like:

```text
my-project/
├── app/
│   ├── __init__.py
│   ├── main.py
│   └── config.py
├── tests/
├── docs/
├── scripts/
├── .env.example
├── .gitignore
├── pyproject.toml
└── README.md
```

The exact structure depends on the project.

Do not force every project into the same layout.

The purpose of the structure is to make responsibilities and project boundaries clear.

---

# The Editor Is Only One Layer

A common misconception is:

> "My development environment is VS Code."

The editor is only one component.

```text
Editor
  │
  ▼
Project
  │
  ▼
Runtime
  │
  ▼
Operating System
```

If the terminal cannot find Python, changing the editor theme will not fix the problem.

If a package is missing, reinstalling the editor may not solve it.

If the application cannot reach PostgreSQL, the problem may be outside the editor entirely.

Therefore:

> **Learn to debug the environment independently of the IDE.**

---

# Terminal-First Thinking

An important engineering skill is being able to run the project from the command line.

For example:

```bash
python --version
python -m pip --version
python -m pytest
python -m uvicorn app.main:app
```

This helps separate:

```text
IDE problem
```

from:

```text
environment problem
```

If the application works in the terminal but not in the IDE, the environment may be correct and the IDE configuration may be wrong.

---

# Verify Before Running

A good development setup should be verified systematically.

For example:

```bash
python --version
git --version
command -v python
command -v git
```

Then inspect the project:

```bash
pwd
ls
```

Then activate the project environment when applicable.

Then verify dependencies.

Then run tests.

Then start the application.

This is much more reliable than immediately running the application and debugging a chain of unknown failures.

---

# Environment Verification Checklist

A simple checklist can be:

```text
[ ] Correct operating system
[ ] Correct shell
[ ] Correct runtime version
[ ] Git installed
[ ] Required CLI tools installed
[ ] Project dependencies defined
[ ] Project environment created
[ ] Environment variables configured
[ ] Required services available
[ ] Tests execute
[ ] Application starts
```

---

# Development Environment and Configuration

The previous chapter introduced configuration.

Now connect it to the development environment:

```text
Development Environment
          │
          ├── Operating system
          ├── Runtime
          ├── Tools
          ├── Dependencies
          └── Configuration
                    │
                    ▼
                Application
```

For example:

```text
APP_ENV=development
DATABASE_URL=local-db
LOG_LEVEL=DEBUG
```

These values describe the current development environment.

The application should not need a separate source-code version just because it is running locally.

---

# Local Services

Some projects depend on services running locally.

For example:

```text
FastAPI
   │
   ├── PostgreSQL
   ├── Redis
   └── Vector database
```

The development environment may therefore include both:

```text
Development Tools
```

and:

```text
Development Services
```

You need to distinguish the two.

A database server is not simply a Python package.

A Redis client library is not the Redis server itself.

A CLI tool is not necessarily the service it controls.

Understanding this distinction prevents many setup mistakes.

---

# Example: GenAI Development Environment

Consider a retrieval-augmented generation application.

A developer might need:

```text
┌──────────────────────────────┐
│        Development Machine   │
│                              │
│  Linux                       │
│    │                         │
│    ├── Git                   │
│    ├── Python                │
│    ├── Virtual Environment   │
│    ├── Editor                │
│    │                         │
│    └── RAG Project           │
│          ├── FastAPI         │
│          ├── Embedding SDK   │
│          ├── LLM SDK         │
│          └── Qdrant Client   │
│                              │
│  External/Local Services     │
│    ├── PostgreSQL            │
│    ├── Redis                 │
│    └── Vector Database       │
└──────────────────────────────┘
```

The exact technologies are project-specific.

The engineering lesson is that a project is usually a **system of dependencies**, not a single executable.

---

# Development Environment Setup Workflow

A disciplined setup can follow this process.

## Step 1 — Read the Documentation

Understand:

- prerequisites
- supported runtime versions
- required services
- configuration
- installation instructions
- test commands

---

## Step 2 — Inspect the Existing Machine

Check:

```bash
uname -a
python --version
git --version
echo "$SHELL"
```

You do not need to run every diagnostic command blindly.

The goal is to establish what already exists.

---

## Step 3 — Identify Gaps

Compare:

```text
Required environment
```

with:

```text
Current environment
```

For example:

```text
Required Python 3.11
Current Python 3.9
```

That is a concrete gap.

---

## Step 4 — Install Only Missing Requirements

Use the appropriate package manager or project tooling.

Avoid unnecessary system changes.

---

## Step 5 — Create Project Isolation

For Python projects, this normally means creating an isolated project environment.

The detailed workflow is covered in:

[10 — Virtual Environments & Dependency Isolation](./10-Virtual-Environments-and-Dependency-Isolation.md)

---

## Step 6 — Configure the Environment

Set required configuration values.

For example:

```text
APP_ENV=development
DATABASE_URL=...
API_KEY=...
```

Follow the project's documented configuration strategy.

---

## Step 7 — Install Project Dependencies

Install dependencies using the project's declared dependency mechanism.

Do not manually install random packages until the application happens to work.

The project's dependency definition should be the source of truth.

---

## Step 8 — Verify

Run:

```text
tests
linting
application startup
basic health checks
```

The exact commands depend on the project.

---

# Why Verification Matters

Installation success does not mean environment setup succeeded.

For example:

```text
Python installed
```

does not prove:

```text
Correct Python version
```

Similarly:

```text
Package installed
```

does not prove:

```text
Application can import it
```

And:

```text
Database client installed
```

does not prove:

```text
Application can connect to database
```

Think in terms of capability verification:

```text
Installed
   ↓
Available
   ↓
Correct version
   ↓
Correct configuration
   ↓
Actually works
```

---

# Diagnosing "Works on My Machine"

One of the most common engineering problems is:

> "It works on my machine."

This usually means the environments differ in some meaningful way.

Possible differences include:

```text
Python version
Package versions
Operating system
Environment variables
PATH
System libraries
Database state
Configuration
Permissions
External services
```

The phrase should therefore trigger a question:

> **What is different between the two environments?**

Do not treat "works on my machine" as a mysterious software phenomenon.

It is usually an environment-difference problem.

---

# Environment Fingerprinting

When debugging environment differences, record useful facts.

For example:

```bash
python --version
git --version
uname -a
command -v python
```

Then inspect project dependency definitions and configuration.

You are trying to build a comparable description:

```text
Machine A
   │
   ├── OS
   ├── Runtime
   ├── Dependencies
   ├── Configuration
   └── Services

Machine B
   │
   ├── OS
   ├── Runtime
   ├── Dependencies
   ├── Configuration
   └── Services
```

Compare the differences.

---

# Development Environment as a Contract

A mature project should describe its environment requirements.

For example:

```text
Python: 3.11+
Git: required
PostgreSQL: required
Redis: required
Environment variables:
  DATABASE_URL
  REDIS_URL
  API_KEY
```

This becomes a contract between:

```text
Project
   ↕
Developer
```

Without such a contract, onboarding becomes guesswork.

---

# Onboarding a New Developer

Imagine a new engineer joins a project.

Without documentation:

```text
Clone repository
     ↓
Try to run
     ↓
Error
     ↓
Ask teammate
     ↓
Install something
     ↓
Another error
     ↓
Ask again
```

With good environment documentation:

```text
Read setup guide
     ↓
Install prerequisites
     ↓
Create project environment
     ↓
Configure variables
     ↓
Install dependencies
     ↓
Run tests
     ↓
Start application
```

The second process scales much better across teams.

---

# Development Environment Documentation

A project setup document should ideally explain:

```text
1. Supported OS
2. Required runtime version
3. Required system tools
4. Dependency installation
5. Environment creation
6. Required environment variables
7. Required local services
8. How to run tests
9. How to start the application
10. Common troubleshooting steps
```

This is not administrative overhead.

It is part of engineering quality.

---

# Avoid "Magic Setup"

A setup process becomes difficult to maintain when it depends on undocumented assumptions.

For example:

```text
"It works because I installed this package two years ago."
```

That package may not even be declared in the project.

Or:

```text
"Set this environment variable somehow."
```

No documentation explains its value or purpose.

Or:

```text
"Run this command from your home directory."
```

without explaining why.

Good development environments make dependencies explicit.

---

# Production Perspective

Development environments and production environments are related, but they are not identical.

A development environment prioritizes:

- fast feedback
- debugging
- experimentation
- developer productivity
- local testing

Production prioritizes:

- reliability
- security
- reproducibility
- controlled changes
- observability
- availability

The environments may use the same application code while differing in infrastructure and configuration.

```text
                 Same Application
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
    Development                  Production
    Fast feedback               Reliability
    Debugging                   Security
    Local services              Managed services
    Developer tools             Operational controls
```

The detailed production architecture belongs to later modules.

---

# Development Environment and Security

A development machine can contain sensitive information:

```text
API keys
SSH credentials
database credentials
cloud credentials
tokens
private repositories
```

Therefore, development setup is also a security concern.

Basic rules include:

- Do not commit secrets.
- Do not paste secrets into source files.
- Avoid logging credentials.
- Use least privilege.
- Keep required credentials scoped appropriately.
- Remove credentials that are no longer needed.

The deeper security model belongs to later enterprise security topics.

---

# Development Environment and Performance

A development environment can also affect application performance.

For example:

```text
Insufficient RAM
        ↓
Slow builds/tests

Slow disk
        ↓
Slow dependency installation

CPU limitations
        ↓
Slow model execution

Network limitations
        ↓
Slow external API calls
```

For AI/GenAI development, hardware capabilities can become particularly relevant.

A local machine may not be suitable for running a large model.

That does not necessarily mean the development environment is incorrect.

It may mean the workload belongs on a remote or managed compute environment.

---

# Local vs Remote Development

Modern development does not always happen entirely on the developer's laptop.

A project may use:

```text
Local machine
     │
     ├── editor
     ├── Git
     └── terminal
          │
          ▼
     Remote environment
          │
          ├── compute
          ├── database
          └── services
```

The same development-environment principles still apply:

- identify dependencies
- configure access
- verify runtime
- isolate project dependencies
- document setup
- troubleshoot systematically

The exact remote-development technologies are outside this chapter's scope.

---

# Engineering Decisions

When setting up a development environment, ask:

### 1. What should be installed globally?

Only tools genuinely shared across projects.

Examples:

```text
Git
shell utilities
runtime managers
editors
```

---

### 2. What should be project-specific?

Project dependencies should generally remain isolated.

Examples:

```text
FastAPI
Pydantic
specific ML libraries
specific SDK versions
```

---

### 3. What should be documented?

Anything another engineer needs to reproduce the environment.

---

### 4. What should be automated?

Repeated setup steps are good candidates for automation.

For example:

```text
dependency installation
environment creation
test execution
linting
basic validation
```

Automation reduces human error.

---

### 5. What should remain manual?

Sensitive decisions and credentials may need controlled manual handling.

Do not automate the handling of secrets simply for convenience without considering the security implications.

---

# Common Mistakes

## Mistake 1 — Installing Everything Globally

This creates dependency conflicts and makes the machine difficult to reason about.

Prefer project-level isolation for project dependencies.

---

## Mistake 2 — Ignoring Runtime Versions

A project may require a specific runtime.

Always verify the actual runtime:

```bash
python --version
```

---

## Mistake 3 — Trusting the IDE

If something fails, verify it from the terminal.

The IDE is only one layer of the environment.

---

## Mistake 4 — Installing Dependencies Manually

Running:

```bash
pip install something
```

because an error appeared may hide the actual dependency-management problem.

First inspect the project's declared dependencies.

---

## Mistake 5 — Skipping Verification

Installation is not proof that the environment works.

Run tests and basic application checks.

---

## Mistake 6 — Relying on Undocumented Machine State

If a project depends on something that nobody documented, onboarding and troubleshooting become difficult.

---

## Mistake 7 — Mixing Projects Carelessly

Using the same global dependencies for unrelated projects can produce version conflicts.

---

## Mistake 8 — Changing the System Without Understanding the Impact

Installing packages, modifying `PATH`, changing permissions, or editing shell startup files can affect unrelated projects.

Make changes deliberately.

---

# Engineering Mental Model

When you think about a development environment, use this model:

```text
                PROJECT
                   │
                   ▼
          Project Dependencies
                   │
                   ▼
            Runtime / Tools
                   │
                   ▼
        Shell + Configuration
                   │
                   ▼
             Operating System
                   │
                   ▼
               Hardware
```

When something breaks, ask:

```text
Which layer is actually failing?
```

For example:

```text
"Python command not found"
        ↓
PATH / runtime layer
```

```text
"ModuleNotFoundError"
        ↓
Project dependency / environment layer
```

```text
"Database connection refused"
        ↓
Configuration / service / networking layer
```

```text
"Permission denied"
        ↓
Filesystem / user / permission layer
```

This layered reasoning is more valuable than memorizing installation commands.

---

# Interview Questions

## Conceptual

1. What is a development environment?
2. What are the major components of a development environment?
3. What is the difference between system-level tools and project dependencies?
4. Why should project dependencies generally be isolated?
5. Why is runtime version important?
6. Why should development environments be documented?
7. What does "works on my machine" usually indicate?

## Engineering

8. How would you set up a Python development environment for a new project?
9. What would you verify before installing project dependencies?
10. Why should you inspect the project's existing dependency configuration before installing packages manually?
11. How would you diagnose a project that works for one developer but not another?
12. How would you distinguish an IDE problem from an environment problem?
13. What should a good developer onboarding document contain?
14. What should be installed globally versus inside a project environment?

## Scenario

You clone a Python project and run:

```bash
python app.py
```

You receive:

```text
ModuleNotFoundError: No module named 'fastapi'
```

Before immediately running:

```bash
pip install fastapi
```

what should you investigate?

A strong answer should consider:

```text
Project dependency definition
        ↓
Expected Python version
        ↓
Active Python executable
        ↓
Project environment
        ↓
Installed dependencies
        ↓
Correct installation method
```

The goal is not simply to make the error disappear.

The goal is to restore the **intended environment**.

---

# Quick Revision

### Development environment

The complete execution context required to develop and run a project.

### System-level tool

A tool shared across projects.

Examples:

```text
Git
shell
system utilities
```

### Project dependency

A dependency required by a specific project.

Examples:

```text
FastAPI
Pydantic
PyTorch
```

### Runtime

The software that executes application code.

Example:

```text
Python
```

### Configuration

External values controlling how the application operates.

Example:

```text
DATABASE_URL
LOG_LEVEL
API_KEY
```

### Verification

Checking that the environment does not merely contain software but can actually perform the required tasks.

---

# Key Takeaways

1. A development environment is a system, not just an editor.
2. It includes the OS, shell, runtime, tools, dependencies, configuration, and services required by the project.
3. Start setup by understanding project requirements, not by installing random software.
4. Distinguish system-level tools from project-level dependencies.
5. Runtime versions are part of the environment contract.
6. Project dependencies should generally be isolated.
7. The terminal is an important source of truth when debugging environment problems.
8. Installation does not prove that a development environment works.
9. Verification should test actual capabilities.
10. "Works on my machine" usually indicates an environment difference.
11. Good projects document their environment requirements and onboarding process.
12. Development environments should minimize undocumented machine-specific assumptions.
13. Security matters even on developer machines.
14. A reproducible environment is easier to maintain, debug, and share.
15. The most valuable skill is not memorizing setup commands but understanding **which layer of the environment is responsible for a problem**.

---

## Further Reading

Useful areas for deeper study:

- Linux development workflows
- Shell configuration
- Python runtime management
- Python packaging
- Project dependency management
- IDE and terminal integration
- Development environment automation
- Reproducible builds
- Local development services
- Remote development environments

Recommended next chapter:

[10 — Virtual Environments & Dependency Isolation](./10-Virtual-Environments-and-Dependency-Isolation.md)

---

## Connection to the Next Chapter

We have now established the environment around a project.

But one important problem remains.

Imagine two Python projects:

```text
Project A
FastAPI 0.x
Pydantic 1.x
```

and:

```text
Project B
FastAPI 1.x
Pydantic 2.x
```

If both projects depend on different versions of the same packages, installing everything globally becomes problematic.

We need isolation.

The next chapter addresses the problem directly:

```text
One Machine
     │
     ├── Project A
     │     └── Dependencies A
     │
     └── Project B
           └── Dependencies B
```

The goal is to allow multiple projects to coexist without their dependencies interfering with each other.

That is the purpose of **virtual environments and dependency isolation**.

---

# End of Document

This completes the Markdown file:

`09-Development-Environment-Setup.md`

All parts can now be combined into a single production-ready Markdown document for the GitHub repository.
