# 10 — Virtual Environments & Dependency Isolation

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain why dependency isolation is necessary.
- Understand the difference between system Python and project Python environments.
- Explain what a Python virtual environment is.
- Create, activate, use, and deactivate a virtual environment.
- Understand how a virtual environment changes command and package resolution.
- Install project dependencies into an isolated environment.
- Verify which Python and `pip` are being used.
- Understand dependency conflicts and why global installation causes problems.
- Understand the relationship between virtual environments and dependency declarations.
- Troubleshoot common virtual-environment problems.
- Make appropriate engineering decisions about dependency isolation.
- Understand the limits of virtual environments and how they relate to reproducible environments.

---

## Prerequisites

You should already understand:

- Linux fundamentals
- Linux filesystem and paths
- Shell and command-line usage
- Files and directories
- Package management
- Environment variables
- Development environment setup
- Basic Python

Recommended previous chapters:

- [03 — Shell & Command Line](./03-Shell-and-Command-Line.md)
- [04 — Files, Directories & File Operations](./04-Files-Directories-and-File-Operations.md)
- [07 — Package Management](./07-Package-Management.md)
- [08 — Environment Variables & Configuration](./08-Environment-Variables-and-Configuration.md)
- [09 — Development Environment Setup](./09-Development-Environment-Setup.md)

---

## Estimated Reading Time

**25–30 minutes**

---

## Before We Start

Imagine you are working on two Python projects.

Project A requires:

```text
requests 2.x
```

Project B requires:

```text
requests 3.x
```

If you install one version globally:

```bash
pip install requests
```

you now have a problem.

Which project gets which version?

A single global Python environment cannot cleanly represent every project's independent dependency requirements.

This is the problem dependency isolation solves.

The fundamental idea is:

> **A project should have a controlled dependency environment that does not interfere with unrelated projects.**

---

# Why Dependency Isolation Exists

Software projects rarely depend on only one library.

A Python application might depend on:

```text
FastAPI
Pydantic
SQLAlchemy
NumPy
Pandas
PyTorch
LLM SDK
Vector database client
Testing libraries
```

Each dependency can have:

- a version
- its own dependencies
- compatibility requirements
- operating-system requirements
- Python-version requirements

The resulting dependency graph can become complicated.

For example:

```text
Application
    │
    ├── FastAPI
    │     └── Pydantic
    │
    ├── Database library
    │
    └── LLM SDK
          └── HTTP library
```

Another project may require different versions.

Therefore:

```text
Global Environment
       ↓
All projects share dependencies
       ↓
Conflicts become possible
```

while:

```text
Project A Environment
       ↓
Project A dependencies

Project B Environment
       ↓
Project B dependencies
```

provides isolation.

---

# Mental Model: One Machine, Multiple Projects

Think about a developer machine:

```text
                 Developer Machine
                        │
             ┌──────────┴──────────┐
             ▼                     ▼
        Project A              Project B
             │                     │
             ▼                     ▼
      Environment A         Environment B
             │                     │
             ▼                     ▼
       Dependencies A        Dependencies B
```

The machine is shared.

The project environments are separated.

This allows different projects to coexist without requiring every project to use exactly the same dependency versions.

---

# What Is a Virtual Environment?

A Python virtual environment is an isolated environment for a Python project.

It provides project-specific access to:

- a Python interpreter/environment
- installed Python packages
- package-management commands

A common directory name is:

```text
.venv
```

For example:

```text
my-project/
├── .venv/
├── app/
├── tests/
└── pyproject.toml
```

The `.venv` directory belongs to the development environment of the project.

It should generally not be treated as application source code.

---

# What Problem Does a Virtual Environment Actually Solve?

Consider the global environment:

```text
System Python
     │
     ├── FastAPI 0.x
     ├── Pydantic 1.x
     ├── NumPy ...
     └── Project A
```

Now another project needs different versions:

```text
Project B
     │
     ├── FastAPI 1.x
     └── Pydantic 2.x
```

Installing both into one environment may produce conflicts.

Virtual environments instead provide:

```text
System
  │
  ├── Project A
  │      └── .venv
  │           ├── FastAPI 0.x
  │           └── Pydantic 1.x
  │
  └── Project B
         └── .venv
              ├── FastAPI 1.x
              └── Pydantic 2.x
```

The projects can coexist.

---

# Virtual Environment vs Python Installation

These are not the same thing.

A Python installation provides the runtime itself.

A virtual environment provides an isolated project environment associated with Python.

Think:

```text
Python Installation
       │
       ├── create
       ▼
Virtual Environment
       │
       └── project-specific packages
```

The virtual environment does not mean that Python has disappeared from the operating system.

It creates a controlled environment around Python for the project.

---

# Creating a Virtual Environment

From the project directory:

```bash
python3 -m venv .venv
```

This asks Python to create a virtual environment named:

```text
.venv
```

The resulting project might look like:

```text
my-project/
├── .venv/
├── app/
└── README.md
```

The exact location and naming convention can vary.

`.venv` is common because it clearly indicates:

> "This directory contains the project's local Python environment."

---

# Why Use `python -m venv`?

Consider:

```bash
python3 -m venv .venv
```

The command is effectively saying:

```text
Use this Python interpreter
        ↓
run its venv module
        ↓
create this environment
```

This is useful because it ties environment creation to the Python interpreter you explicitly selected.

Compare that with blindly using:

```bash
venv
```

where it may be less obvious which Python installation is responsible.

A good engineering habit is to know which interpreter created the environment.

---

# Activating the Environment

On a typical Linux shell:

```bash
source .venv/bin/activate
```

After activation, your shell usually changes to indicate the active environment:

```text
(.venv) user@machine:~/project$
```

Now commands such as:

```bash
python
pip
```

resolve differently.

Conceptually:

```text
Before activation

python
  ↓
System Python

After activation

python
  ↓
Project Environment Python
```

This is one of the most important ideas in this chapter.

---

# What Does Activation Actually Do?

Activation does not magically change the entire operating system.

It modifies the current shell environment so that project-specific executables are found first.

Conceptually:

```text
Before:

PATH
 ├── /usr/local/bin
 ├── /usr/bin
 └── /bin

After:

PATH
 ├── project/.venv/bin
 ├── /usr/local/bin
 ├── /usr/bin
 └── /bin
```

Therefore:

```bash
python
```

now resolves to the project's environment.

This connects directly to the previous chapter's discussion of `PATH` and environment variables.

---

# Verify the Active Python

Never assume activation worked.

Run:

```bash
which python
```

or:

```bash
command -v python
```

You should see a path similar to:

```text
/home/user/project/.venv/bin/python
```

Then check:

```bash
python --version
```

This tells you:

```text
Which interpreter?
Which version?
```

These are separate questions.

---

# Verify `pip`

Now check:

```bash
which pip
```

You should normally see something similar to:

```text
/home/user/project/.venv/bin/pip
```

Then:

```bash
python -m pip --version
```

This provides useful information about which Python environment the package manager is associated with.

A strong habit is:

```bash
python -m pip install ...
```

rather than blindly relying on a standalone `pip` command.

Why?

Because it explicitly connects the package installation to the Python interpreter you selected.

---

# Install a Package Inside the Environment

Once the environment is active:

```bash
python -m pip install fastapi
```

The package is installed into the project's environment rather than into the general system environment.

Now:

```bash
python -m pip list
```

can show the packages installed in that environment.

This gives you a project-specific dependency space.

---

# Check Where a Package Is Installed

Suppose:

```bash
python -m pip install requests
```

Then you can inspect:

```bash
python -m pip show requests
```

The output includes information such as the installed version and location.

This is useful when debugging questions like:

> "Which copy of this package is my application actually using?"

---

# Deactivating the Environment

When you are finished:

```bash
deactivate
```

The shell returns to its previous environment.

Conceptually:

```text
Project Environment
       │
       ▼
deactivate
       │
       ▼
Previous Shell Environment
```

The virtual environment is not deleted.

It simply stops being the active environment for that shell.

---

# Activation Is Shell-Specific

Activation affects the current shell session.

For example:

```text
Terminal A
  └── .venv active

Terminal B
  └── .venv not active
```

The second terminal does not automatically inherit the first terminal's active shell state.

This is another example of why environment variables and process environments matter.

---

# Do Not Confuse Activation With Isolation

Activation is convenient, but it is not the fundamental isolation mechanism.

The important idea is:

```text
Virtual environment
        ↓
Project-specific Python environment
```

Activation mainly changes shell behavior so that using the environment becomes convenient.

You can also directly invoke the environment's Python:

```bash
./.venv/bin/python app.py
```

without activating it first.

This distinction is useful when debugging.

---

# Installing Dependencies From a Dependency File

Projects often declare dependencies.

A traditional Python project may use:

```text
requirements.txt
```

For example:

```text
fastapi
uvicorn
pydantic
```

You can install them into the active environment:

```bash
python -m pip install -r requirements.txt
```

The important relationship is:

```text
Dependency Declaration
        │
        ▼
Installation
        │
        ▼
Project Environment
```

The dependency file describes what the project needs.

The virtual environment provides the isolated place where those dependencies are installed.

---

# Dependency Declaration vs Environment

These concepts are related but different.

### Dependency declaration

Answers:

> What does the project require?

For example:

```text
FastAPI
Pydantic
pytest
```

### Virtual environment

Answers:

> Where are those dependencies installed for this project?

```text
my-project/.venv/
```

### Installed dependency

Answers:

> What is currently installed in this environment?

These three concepts should not be confused.

---

# Version Constraints

Dependencies often have version requirements.

For example:

```text
fastapi>=0.100,<1.0
```

or:

```text
pydantic>=2
```

A version constraint describes compatibility expectations.

The environment then contains a concrete installed version.

Conceptually:

```text
Project requirement
        │
        ▼
Allowed versions
        │
        ▼
Dependency resolution
        │
        ▼
Concrete installed version
```

This distinction becomes increasingly important as projects grow.

---

# Why "Latest Version" Is Not Always Correct

Suppose your project was built and tested against:

```text
library 2.4
```

and version:

```text
library 3.0
```

introduces breaking changes.

Installing the latest version automatically may break the application.

Therefore:

> **Dependency management is about compatibility, not simply obtaining the newest software.**

This is why projects should declare their dependency requirements explicitly.

---

# The Dependency Graph

A project does not only depend on the packages you explicitly install.

For example:

```text
Application
    │
    ├── FastAPI
    │     ├── Starlette
    │     └── Pydantic
    │
    └── HTTP Client
          └── HTTP Library
```

Your environment therefore contains a dependency graph.

Installing one package can install several transitive dependencies.

This explains why a project's environment may contain more packages than the project explicitly lists.

---

# Dependency Conflict

Consider:

```text
Project A
  └── Package X 1.x

Project B
  └── Package X 2.x
```

A single global environment must choose one version.

Project A may break.

Project B may break.

With separate environments:

```text
Project A/.venv
  └── Package X 1.x

Project B/.venv
  └── Package X 2.x
```

each project gets its required dependency space.

This is the core value of isolation.

---

# Virtual Environment and System Packages

A virtual environment should generally allow the project to use its own installed dependencies rather than modifying the system-wide Python package set.

This provides a boundary:

```text
System Python
     │
     └── System-level software

Project Python Environment
     │
     └── Project-level packages
```

This reduces accidental interference with:

- operating-system tools
- other Python projects
- other developers' workflows
- system utilities that depend on Python packages

---

# Why Installing With `sudo pip` Is Dangerous

A common mistake is:

```bash
sudo pip install package
```

This attempts to modify a system-level Python environment with elevated privileges.

Problems can include:

- breaking system packages
- creating dependency conflicts
- making package ownership unclear
- creating difficult-to-debug permission problems

For project dependencies, prefer an isolated project environment.

For system-level software, use the appropriate system package manager when appropriate.

The two package-management layers have different responsibilities.

---

# System Package Manager vs Python Package Manager

These should not be confused.

For example:

```text
apt
  ↓
Operating-system packages
```

while:

```text
pip
  ↓
Python packages
```

Conceptually:

```text
Linux
  │
  └── apt
       └── system packages

Python Environment
  │
  └── pip
       └── Python packages
```

There can be overlap in what software provides, but the package ecosystems are different.

Understanding which layer owns a dependency is important.

---

# Virtual Environment Directory Should Usually Not Be Committed

A virtual environment contains installed packages and environment-specific files.

It should generally not be committed to Git.

A common `.gitignore` entry is:

```gitignore
.venv/
```

Instead of committing the environment itself, commit the information needed to recreate it.

For example:

```text
requirements.txt
```

or the project's chosen dependency-management files.

The principle is:

> **Commit the environment specification, not the generated environment.**

This connects dependency isolation with version control.

---

# Recreating an Environment

Suppose a new developer clones your project.

They should not need your `.venv`.

Instead:

```text
Clone repository
      ↓
Create .venv
      ↓
Install declared dependencies
      ↓
Configure environment
      ↓
Run project
```

For example:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

The exact commands depend on the project.

The important concept is that the environment should be **recreatable**.

---

# Virtual Environments Are Not Full Reproducibility

A common misconception is:

> "If I use a virtual environment, the project is completely reproducible."

Not necessarily.

A virtual environment isolates packages, but other variables can still differ:

```text
Python version
Operating system
CPU architecture
system libraries
dependency versions
configuration
external services
```

For example:

```text
Developer A
Python 3.11
Ubuntu
```

and:

```text
Developer B
Python 3.12
Ubuntu
```

may use the same virtual-environment approach while still producing different behavior.

Therefore:

> **Isolation and reproducibility are related, but they are not the same problem.**

Reproducible development environments are covered later in:

[15 — Reproducible Development Environments](./15-Reproducible-Development-Environments.md)

---

# Virtual Environment Lifecycle

A useful mental model is:

```text
Create
  ↓
Activate
  ↓
Install dependencies
  ↓
Develop
  ↓
Test
  ↓
Deactivate
  ↓
Recreate when necessary
```

The environment is disposable.

Your source code is not.

This is an important engineering mindset.

---

# Treat Environments as Disposable

Suppose a project's environment becomes corrupted.

A common reaction is:

```text
"How do I repair every package manually?"
```

Often the simpler solution is:

```text
Delete environment
      ↓
Create new environment
      ↓
Install declared dependencies
      ↓
Verify
```

For example:

```bash
rm -rf .venv
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

Be extremely careful with:

```bash
rm -rf
```

and verify that the target is actually the project's virtual environment before deleting it.

The broader principle is:

> **A generated environment should be easier to recreate than to manually repair.**

---

# Development Workflow

A practical workflow for a Python project is:

```text
Enter project
     ↓
Check Python version
     ↓
Create/activate environment
     ↓
Install declared dependencies
     ↓
Verify environment
     ↓
Run tests
     ↓
Develop
     ↓
Run tests again
```

For example:

```bash
cd my-project

python3 --version

python3 -m venv .venv

source .venv/bin/activate

python -m pip install -r requirements.txt

python -m pytest
```

The exact commands depend on the project.

---

# Verify the Environment Before Debugging the Application

Suppose you see:

```text
ModuleNotFoundError: No module named 'pydantic'
```

Before changing application code, ask:

```text
Which Python am I using?
Which environment is active?
Is Pydantic installed there?
Is this the environment used to start the application?
```

Useful checks include:

```bash
command -v python
python --version
python -m pip --version
python -m pip show pydantic
```

This follows the environment-debugging approach from [09 — Development Environment Setup](./09-Development-Environment-Setup.md).

---

# Python Import Verification

You can also verify that Python can actually import a package:

```bash
python -c "import pydantic; print(pydantic.__version__)"
```

This answers a more useful question than simply:

> "Did I run pip install?"

The question becomes:

> "Can this exact Python interpreter import the package?"

That distinction is extremely valuable during debugging.

---

# Multiple Python Versions

A machine may have multiple Python versions:

```text
/usr/bin/python3
/usr/local/bin/python3
/home/user/.../python
```

Your virtual environment is associated with the Python installation used to create it.

Therefore:

```bash
python3 -m venv .venv
```

is not equivalent to saying:

> "Use any Python."

It means:

> "Use this `python3` interpreter to create the environment."

This is why verifying the runtime before creating the environment matters.

---

# Virtual Environment and `PATH`

The relationship can be summarized as:

```text
Activate environment
        │
        ▼
Modify shell PATH
        │
        ▼
.venv/bin appears earlier
        │
        ▼
python / pip resolve to project environment
```

This connects three topics:

```text
Environment Variables
        +
Shell
        +
Virtual Environment
```

Understanding this relationship is more useful than memorizing:

```bash
source .venv/bin/activate
```

as an isolated command.

---

# What Happens When You Run Python?

After activation:

```bash
python app.py
```

the shell resolves:

```text
python
  ↓
.venv/bin/python
```

The interpreter then executes:

```text
app.py
```

and imports dependencies from the environment associated with that interpreter.

Conceptually:

```text
Shell
 │
 │ resolves python
 ▼
.venv/bin/python
 │
 │ imports packages
 ▼
.venv dependencies
 │
 ▼
Application
```

This is why the correct interpreter matters.

---

# Virtual Environments and IDEs

Modern IDEs can detect and select Python virtual environments.

For example, an editor may allow you to select:

```text
.venv/bin/python
```

This is convenient.

But you should understand what the IDE is doing.

If the terminal uses:

```text
.venv/bin/python
```

while the IDE uses:

```text
/usr/bin/python3
```

you can experience:

```text
Terminal works
IDE fails
```

or the reverse.

When this happens, compare the interpreters.

---

# Virtual Environments and Testing

Tests should run inside the same intended project environment.

For example:

```bash
source .venv/bin/activate
python -m pytest
```

This ensures the tests execute using the environment containing the project's dependencies.

Otherwise, you may accidentally test against packages installed globally.

That creates false confidence.

---

# Virtual Environments and GenAI Projects

GenAI applications often have large and rapidly evolving dependency graphs.

For example:

```text
Application
    │
    ├── FastAPI
    ├── Pydantic
    ├── LLM SDK
    ├── Embedding library
    ├── Vector database client
    ├── NumPy
    ├── ML framework
    └── Testing tools
```

Different GenAI projects may use different versions of these libraries.

One project might depend on:

```text
SDK A version X
```

while another requires:

```text
SDK A version Y
```

Using separate environments prevents one project's dependency upgrades from automatically changing another project's environment.

This is particularly important during experimentation.

---

# Experimentation Without Contaminating the System

Suppose you want to test a new library.

Without isolation:

```text
Install experimental package
        ↓
Modify global environment
        ↓
Existing project changes behavior
```

With isolation:

```text
Create experiment environment
        ↓
Install package
        ↓
Run experiment
        ↓
Delete environment if unnecessary
```

This creates a safer experimentation boundary.

---

# Common Mistakes

## Mistake 1 — Installing Project Packages Globally

Bad pattern:

```bash
sudo pip install fastapi
```

for a project dependency.

Prefer an isolated project environment.

---

## Mistake 2 — Activating One Environment and Working on Another Project

For example:

```text
Project A/.venv active
```

while your shell is currently inside:

```text
Project B/
```

This can lead to confusing dependency behavior.

Always know:

```text
Which project?
Which environment?
Which Python?
```

---

## Mistake 3 — Trusting the Prompt

Seeing:

```text
(.venv)
```

is useful but not sufficient.

Verify:

```bash
command -v python
```

when debugging.

---

## Mistake 4 — Using the Wrong `pip`

You may run:

```bash
pip install package
```

but the `pip` command may not correspond to the Python interpreter you think it does.

Prefer:

```bash
python -m pip install package
```

with the intended Python interpreter.

---

## Mistake 5 — Committing `.venv`

Do not normally commit generated virtual environments.

Commit the dependency specification instead.

---

## Mistake 6 — Assuming Isolation Means Reproducibility

A virtual environment isolates dependencies.

It does not automatically freeze:

- operating system
- Python version
- system libraries
- external services
- configuration

---

## Mistake 7 — Manually Repairing a Broken Environment Forever

If the environment becomes inconsistent, recreating it from the project's dependency definition may be safer and faster.

---

## Mistake 8 — Ignoring the Python Version

Creating a virtual environment with the wrong Python interpreter can reproduce the wrong environment perfectly.

Always verify the runtime first.

---

# Engineering Decisions

When using virtual environments, ask:

### 1. Should every Python project have its own environment?

Generally, yes.

The goal is to prevent unrelated projects from sharing project-specific dependencies.

---

### 2. Should the environment directory be inside the project?

`.venv` inside the project is a common and convenient pattern.

Other approaches exist.

Choose a convention and use it consistently.

---

### 3. Should `.venv` be committed?

Generally, no.

Commit the dependency specification and project configuration needed to recreate it.

---

### 4. Should dependencies be installed globally?

System-level tools may be installed globally when appropriate.

Project-specific Python dependencies should generally be isolated.

---

### 5. When should an environment be recreated?

Consider recreation when:

- dependencies become inconsistent
- installation state is unclear
- the environment is corrupted
- you need to validate the setup from scratch
- you are onboarding to a project

---

### 6. Should every dependency be pinned exactly?

This depends on the project's dependency-management strategy.

The important distinction is between:

```text
compatibility requirements
```

and:

```text
fully reproducible dependency resolution
```

The latter becomes a deeper concern in reproducible development environments.

---

# Production Perspective

Virtual environments are primarily a development and application-environment isolation mechanism.

They should not be confused with:

- containers
- virtual machines
- operating-system isolation
- production orchestration

A virtual environment does not isolate:

```text
CPU
RAM
network
kernel
filesystem
operating system
```

in the way a container or virtual machine can.

Its primary boundary is around the Python runtime and Python package environment.

Later production modules will introduce stronger deployment isolation mechanisms.

---

# Virtual Environment vs Container

A useful high-level comparison:

| Virtual Environment | Container |
|---|---|
| Python dependency isolation | Application/system environment isolation |
| Lightweight | Broader environment packaging |
| Primarily Python-focused | Can package many runtimes/tools |
| Uses host OS | Uses container runtime and host kernel |
| Useful for development | Common in deployment |
| Does not isolate OS | Provides stronger process/filesystem/network boundaries |

This is only a conceptual distinction.

Container implementation and internals belong to later production modules.

---

## Dependency Isolation Mental Model

Keep this model:

```text
                 Developer Machine
                        │
          ┌─────────────┴─────────────┐
          ▼                           ▼
     Project A                   Project B
          │                           │
       .venv                        .venv
          │                           │
    Dependencies A             Dependencies B
```

The goal is not to create two machines.

The goal is to create two controlled dependency spaces on one machine.

---

# A Practical Setup Example

Suppose you clone:

```text
rag-service/
```

Move into it:

```bash
cd rag-service
```

Check Python:

```bash
python3 --version
```

Create the environment:

```bash
python3 -m venv .venv
```

Activate it:

```bash
source .venv/bin/activate
```

Verify:

```bash
command -v python
python --version
python -m pip --version
```

Install project dependencies:

```bash
python -m pip install -r requirements.txt
```

Verify a dependency:

```bash
python -c "import fastapi; print(fastapi.__version__)"
```

Run tests:

```bash
python -m pytest
```

Start development:

```bash
python app.py
```

The exact commands will vary by project.

The workflow is what matters:

```text
Identify
  ↓
Create
  ↓
Activate
  ↓
Verify
  ↓
Install
  ↓
Test
  ↓
Develop
```

---

# Debugging Checklist

If a package cannot be imported:

```text
[ ] Am I in the correct project?
[ ] Is the virtual environment active?
[ ] Which Python am I using?
[ ] Which pip am I using?
[ ] Is the package installed?
[ ] Is the installed package in this environment?
[ ] Is the package version compatible?
[ ] Is the application using the same interpreter?
```

Useful commands:

```bash
pwd
command -v python
python --version
python -m pip --version
python -m pip show <package>
python -c "import <package>"
```

The objective is to turn:

```text
"It doesn't work."
```

into:

```text
"The application is using Python X from environment Y, but package Z is not installed there."
```

That is engineering diagnosis.

---

# Interview Questions

## Conceptual

1. What problem does a Python virtual environment solve?
2. Why are global Python packages problematic?
3. What is the difference between Python installation and a virtual environment?
4. What does activating a virtual environment actually do?
5. Why does activation affect `PATH`?
6. Why should `.venv` usually not be committed to Git?
7. What is the difference between dependency declaration and dependency installation?
8. Why is a virtual environment not the same as a container?

## Engineering

9. How would you create a virtual environment for a new Python project?
10. How would you verify that `pip` belongs to the expected Python environment?
11. How would you troubleshoot a `ModuleNotFoundError` when you believe the package is installed?
12. When would you recreate a virtual environment instead of repairing it?
13. How can two projects use different versions of the same Python package on one machine?
14. Why is `python -m pip` often safer than relying on a standalone `pip` command?

## Scenario

You have two projects:

```text
Project A → requires Pydantic 1.x
Project B → requires Pydantic 2.x
```

Both projects run on the same Linux machine.

Design a development setup that allows both projects to work without dependency conflicts.

A strong answer should explain:

```text
One machine
    │
    ├── Project A
    │     └── .venv → Pydantic 1.x
    │
    └── Project B
          └── .venv → Pydantic 2.x
```

Then explain how you would verify that each project is actually using the correct interpreter and dependencies.

---

# Quick Revision

### Virtual environment

An isolated Python environment for a project.

### Dependency isolation

Keeping project dependencies separated so that unrelated projects do not interfere with each other.

### Activation

A shell convenience that adjusts the environment, commonly including `PATH`, so project executables are selected.

### Dependency declaration

The project's statement of what packages and versions it requires.

### Installed dependency

The concrete package version currently present in an environment.

### Reproducibility

The ability to recreate an equivalent development environment reliably.

Virtual environments help with reproducibility but do not guarantee it.

---

## Key Takeaways

1. Global Python environments create dependency conflicts as projects grow.
2. Virtual environments provide project-specific Python dependency spaces.
3. Each project can maintain its own dependency versions.
4. `python3 -m venv .venv` is a common way to create a Python virtual environment.
5. Activation primarily changes the shell environment so project executables are resolved first.
6. Always verify the active Python interpreter rather than trusting the shell prompt.
7. `python -m pip` helps ensure package installation targets the intended Python environment.
8. Project dependencies should generally be isolated from system Python.
9. Virtual environments should normally not be committed to Git.
10. Projects should commit dependency specifications and configuration needed to recreate their environments.
11. A virtual environment is disposable; the project source is not.
12. Recreating a broken environment can be safer than manually repairing it.
13. Isolation does not automatically guarantee complete reproducibility.
14. Virtual environments are different from containers and virtual machines.
15. The most important debugging questions are:
    - Which project?
    - Which Python?
    - Which environment?
    - Which dependencies?
    - Which versions?

---

## Further Reading

Useful areas for deeper study:

- Python `venv`
- Python packaging
- `pip`
- Dependency resolution
- Dependency version constraints
- Lock files
- Python package indexes
- Project metadata with `pyproject.toml`
- Reproducible dependency installation
- Containerized development environments

Recommended next chapter:

[11 — Shell Scripting Fundamentals](./11-Shell-Scripting-Fundamentals.md)

---

## Connection to the Next Chapter

We have now learned how to:

```text
Set up a development environment
            ↓
Isolate project dependencies
            ↓
Verify the Python environment
```

But development work often involves repeating the same commands.

For example:

```bash
source .venv/bin/activate
python -m pytest
python -m pip install -r requirements.txt
python app.py
```

Running these manually is acceptable for a small project.

As workflows grow, repeated command sequences become candidates for automation.

This leads naturally to:

```text
Shell
  ↓
Commands
  ↓
Variables
  ↓
Conditions
  ↓
Loops
  ↓
Functions
  ↓
Scripts
```

The next chapter introduces **Shell Scripting Fundamentals**, focusing on practical automation for engineering workflows without turning the chapter into advanced shell programming.
