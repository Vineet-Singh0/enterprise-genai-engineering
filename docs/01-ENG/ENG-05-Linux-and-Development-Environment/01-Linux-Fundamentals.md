# Linux Fundamentals

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain what Linux is in practical engineering terms.
- Understand why Linux is widely used by software and AI engineers.
- Distinguish Linux from the Linux kernel.
- Understand the role of a Linux distribution.
- Build a practical mental model of a Linux system.
- Understand how applications interact with the operating system.
- Identify the major layers involved when running software on Linux.
- Understand why the Linux environment matters for development and production.
- Recognize the boundary between using Linux as an engineer and administering Linux as a system administrator.

---

## Prerequisites

Before starting this chapter, you should be familiar with:

- Basic computer architecture
- Operating-system fundamentals
- Programs and processes
- Files and storage
- Basic programming concepts
- Basic software-engineering principles

Recommended prerequisites:

- [ENG-01 — Computer Science Fundamentals](../ENG-01-Computer-Science-Fundamentals/README.md)
- [ENG-02 — Programming Foundations](../ENG-02-Programming-Foundations/README.md)
- [ENG-03 — Software Engineering Principles](../ENG-03-Software-Engineering-Principles/README.md)
- [ENG-04 — Version Control & Collaborative Development](../ENG-04-Version-Control-and-Collaborative-Development/README.md)

> **Boundary:** ENG-01 explains operating-system concepts at the deeper computer-science level. This chapter focuses on understanding Linux as an engineering environment and prepares you for practical Linux usage.

---

## Estimated Reading Time

**15–20 minutes**

---

## Before We Start

Imagine you have written a Python application.

You have the source code.

You have installed Python.

You have installed the required libraries.

Yet the application still needs something else to actually run.

It needs an environment that can:

- execute programs,
- manage files,
- provide memory,
- communicate with hardware,
- create processes,
- provide networking,
- enforce access permissions,
- and expose useful system interfaces.

That environment is provided by the operating system.

Now imagine doing this every day as an engineer:

```text
Write code
   ↓
Run code
   ↓
Install dependencies
   ↓
Read files
   ↓
Inspect processes
   ↓
Check logs
   ↓
Connect to another service
   ↓
Debug failures
   ↓
Deploy software
```

A large part of this workflow happens inside a Linux environment.

So the first question is:

> **Why should a software engineer understand Linux if their job is to write code?**

Because code does not run in isolation.

It runs inside a system.

Understanding Linux gives you a mental model for that system.

---

# Why Linux Exists

Before Linux, Unix systems were already widely used in universities, research environments, servers, and engineering organizations.

Unix introduced many ideas that became extremely influential:

- small tools that do one job well,
- composable commands,
- hierarchical filesystems,
- multi-user systems,
- permissions,
- process-oriented execution,
- command-line interaction.

Linux later provided an open-source Unix-like operating-system foundation that could be used, modified, and distributed broadly.

The result was an operating environment that became extremely important for:

- servers,
- cloud infrastructure,
- software development,
- networking,
- embedded systems,
- scientific computing,
- containers,
- AI and machine-learning workloads.

Linux did not become important simply because it was "free."

It became important because it provides a powerful and programmable environment for building and running software.

---

## What Is Linux?

The word **Linux** is used in everyday engineering conversations to describe a complete operating environment.

Technically, there is an important distinction.

## Linux Kernel

The **Linux kernel** is the core software that manages interaction between applications and the underlying hardware.

A simplified view is:

```text
Applications
     │
     ▼
System interfaces
     │
     ▼
Linux Kernel
     │
     ▼
Hardware
```

The kernel is responsible for important operating-system functions such as:

- process management,
- memory management,
- hardware interaction,
- networking,
- filesystem support,
- device management,
- access and isolation mechanisms.

You do not normally interact with the kernel directly.

Instead, applications use operating-system interfaces exposed through the kernel.

---

# What Is a Linux Distribution?

If Linux is the kernel, what do people mean when they say:

> "I am using Ubuntu."

Ubuntu is not simply another name for the Linux kernel.

It is a **Linux distribution**, commonly called a **distro**.

A distribution combines the Linux kernel with many other components required to create a usable operating environment.

A simplified model is:

```text
Linux Distribution
│
├── Linux Kernel
├── System libraries
├── Command-line tools
├── Package management
├── System services
├── Configuration
├── Security components
└── Optional graphical environment
```

Examples of Linux distributions include:

- Ubuntu
- Debian
- Fedora
- Arch Linux
- Red Hat Enterprise Linux
- Rocky Linux
- Amazon Linux

They all use the Linux kernel but differ in packaging, tooling, release models, defaults, and intended use cases.

---

# Mental Model: Linux as an Engineering Workspace

A useful way to think about Linux is:

> **Linux is the workspace in which software interacts with the computer.**

Imagine a physical workshop.

The workshop has:

- storage areas,
- tools,
- electricity,
- safety rules,
- workers,
- machines,
- communication systems.

Linux provides similar infrastructure for software.

```text
Linux Environment
│
├── Filesystem
│      └── Where data and programs live
│
├── Processes
│      └── What is currently running
│
├── Users & Permissions
│      └── Who can access what
│
├── Shell
│      └── How humans interact with the system
│
├── Packages
│      └── How software is installed and managed
│
├── Environment
│      └── How programs receive configuration
│
└── Networking
       └── How programs communicate
```

You will study each of these areas throughout ENG-05.

---

# Linux From an Engineer's Perspective

As an engineer, you usually interact with Linux through several layers.

```text
You
 │
 ▼
Terminal / Shell
 │
 ▼
Command-line tools
 │
 ▼
Libraries / Runtime
 │
 ▼
Operating-system interfaces
 │
 ▼
Linux Kernel
 │
 ▼
Hardware
```

For example, when you run:

```bash
python app.py
```

many things are happening underneath.

Conceptually:

```text
You type command
      ↓
Shell interprets command
      ↓
Python executable is located
      ↓
Operating system starts the program
      ↓
Process is created
      ↓
Python loads the application
      ↓
Application accesses files/network/memory
      ↓
Linux provides required system resources
```

You do not need to understand every internal detail to use Linux effectively.

But you should understand the major relationships.

That is what gives you engineering intuition.

---

# Linux and Applications

An application normally does not directly control hardware.

For example, a Python program does not directly tell an SSD:

> "Store these bytes at this physical location."

Instead, the application requests services from the operating system.

A simplified relationship looks like this:

```text
Application
     │
     │ requests
     ▼
Operating System
     │
     │ manages
     ▼
Hardware
```

For example:

```text
Python Application
      │
      │ open file
      ▼
Operating System
      │
      │ filesystem handling
      ▼
Storage Device
```

This abstraction is important.

It allows application developers to work with consistent interfaces instead of manually controlling every hardware device.

---

# Linux Is More Than a Command Line

A common beginner misconception is:

> Linux = terminal commands.

That is not correct.

The command line is only one way to interact with Linux.

A Linux system can contain:

- kernel
- system libraries
- command-line tools
- services
- networking components
- filesystems
- graphical environments
- applications
- development tools

The command line is simply one of the most powerful interfaces available to engineers.

For software engineers, this matters because many development workflows are easier to understand and automate from the command line.

---

## Why Engineers Use Linux

Linux is particularly valuable for engineering because it provides a highly programmable environment.

## 1. Strong Command-Line Environment

Linux provides tools that can be combined to perform complex tasks.

For example:

```bash
command1 | command2 | command3
```

This style of composition becomes extremely useful for:

- searching files,
- inspecting logs,
- transforming data,
- debugging,
- automation.

The details of shell composition belong to [Shell & Command Line](03-Shell-and-Command-Line.md).

---

## 2. Development-Friendly Environment

Many programming languages and development tools work naturally in Linux environments.

Examples include:

- Python
- Java
- Go
- Rust
- C/C++
- Node.js

Many AI and machine-learning tools are also commonly developed and deployed in Linux environments.

---

## 3. Server and Cloud Usage

A large amount of modern backend infrastructure runs on Linux.

For an engineer, this creates an important advantage:

```text
Development
     ↓
Linux
     ↓
Testing
     ↓
Linux-based server
     ↓
Production
```

The closer the development and deployment environments are, the fewer environment-specific surprises you may encounter.

This does not mean every development environment must be identical to production.

It means understanding the underlying environment helps you reason about differences.

---

## 4. Automation

Linux environments are highly scriptable.

A task that takes ten manual commands can often become a script.

For example:

```text
Manual workflow

Install dependencies
        ↓
Create directories
        ↓
Set configuration
        ↓
Start service
```

can become:

```bash
./setup.sh
```

Automation becomes especially important as engineering systems become more complex.

Shell scripting is covered later in [Shell Scripting Fundamentals](11-Shell-Scripting-Fundamentals.md).

---

## 5. Debugging

Linux provides many tools for inspecting what is happening inside a system.

An engineer can investigate:

- what processes are running,
- what files exist,
- what permissions are applied,
- what software is installed,
- what environment variables are present,
- what network connections exist,
- what logs contain.

This creates an important engineering loop:

```text
Observe
  ↓
Form hypothesis
  ↓
Inspect system
  ↓
Collect evidence
  ↓
Identify cause
  ↓
Apply fix
  ↓
Verify
```

This mindset becomes more important as you move toward production engineering.

---

# Linux in AI and GenAI Engineering

Linux is especially relevant to AI engineering.

Consider a typical GenAI application:

```text
Developer
   │
   ▼
Linux Development Environment
   │
   ├── Python
   ├── Virtual Environment
   ├── Git
   ├── CLI Tools
   ├── Environment Variables
   ├── Model Libraries
   └── Application
          │
          ▼
      API / Database / Vector Store
```

An AI engineer may need to:

- create Python environments,
- install ML libraries,
- configure API credentials,
- inspect running processes,
- inspect logs,
- test network connectivity,
- run scripts,
- manage files,
- troubleshoot dependency issues.

These are not separate "Linux jobs."

They are normal engineering activities.

---

# Linux and Python

Consider a simple project:

```text
my-project/
├── app.py
├── requirements.txt
├── .env
└── data/
```

A developer might use Linux to:

```bash
cd my-project
```

inspect the project:

```bash
ls
```

create an environment:

```bash
python -m venv .venv
```

activate it:

```bash
source .venv/bin/activate
```

install dependencies:

```bash
pip install -r requirements.txt
```

and run the application:

```bash
python app.py
```

Each command represents a different part of the development environment.

ENG-05 will explain the concepts behind these operations instead of treating them as commands to memorize.

---

# A Practical Linux Mental Model

When working inside Linux, ask five basic questions.

## 1. Where am I?

This is about your current location in the filesystem.

```text
Current location
      ↓
Path
      ↓
Files and directories around you
```

This becomes important when navigating projects.

---

## 2. What exists here?

You need to inspect the environment before modifying it.

Examples include:

- files,
- directories,
- programs,
- configuration,
- processes.

This is the beginning of effective troubleshooting.

---

## 3. Who am I?

Linux is a multi-user system.

The system needs to know which user is performing an operation.

That identity affects what the user can access.

This leads to:

```text
User
  ↓
Groups
  ↓
Ownership
  ↓
Permissions
  ↓
Access
```

These concepts are covered in [Users, Groups & Permissions](05-Users-Groups-and-Permissions.md).

---

## 4. What is running?

Software that is currently executing exists as processes.

A useful debugging question is:

> "What is actually running right now?"

This becomes important when:

- a server does not start,
- a port appears busy,
- a process consumes too many resources,
- an application needs to be stopped.

Practical process management is covered in [Processes & Process Management](06-Processes-and-Process-Management.md).

---

## 5. What environment is this?

The same application can behave differently in different environments.

For example:

```text
Machine A
Python 3.12
Library X 2.0
API_URL=A
```

versus:

```text
Machine B
Python 3.10
Library X 1.8
API_URL=B
```

The application code may be identical.

The environment is not.

This is why configuration, dependency isolation, and reproducibility matter.

They are covered later in:

- [Environment Variables & Configuration](08-Environment-Variables-and-Configuration.md)
- [Virtual Environments & Dependency Isolation](10-Virtual-Environments-and-Dependency-Isolation.md)
- [Reproducible Development Environments](15-Reproducible-Development-Environments.md)

---

# Linux as a Layered System

A useful engineering model is:

```text
┌─────────────────────────────┐
│        Applications         │
│  Python / Java / Services   │
├─────────────────────────────┤
│      Runtime & Libraries    │
│ Python / libc / frameworks  │
├─────────────────────────────┤
│      System Utilities       │
│ shell / commands / tools    │
├─────────────────────────────┤
│        Linux Kernel         │
│ processes / memory / I/O    │
│ networking / devices        │
├─────────────────────────────┤
│          Hardware           │
│ CPU / RAM / SSD / Network   │
└─────────────────────────────┘
```

The important idea is **separation of responsibility**.

Applications should not need to understand the electrical behavior of a storage device.

The kernel provides an abstraction.

Similarly, the developer usually does not need to know the physical location of every byte on an SSD.

The operating system provides a usable interface.

This is one of the reasons operating systems are so important in computer systems.

---

# Linux Distributions

Different distributions make different choices about:

- package management,
- software versions,
- release schedules,
- default configuration,
- desktop environments,
- enterprise support,
- security updates.

A simplified comparison:

| Distribution | Common Context |
|---|---|
| Ubuntu | Development, servers, cloud, general use |
| Debian | Stability and servers |
| Fedora | Modern Linux ecosystem and development |
| Arch Linux | Highly customizable environments |
| RHEL | Enterprise environments |
| Rocky Linux | Enterprise-compatible environments |
| Amazon Linux | AWS-oriented environments |

This does **not** mean one distribution is universally better.

The correct question is:

> **Better for what?**

For a developer, the relevant considerations might include:

- package availability,
- documentation,
- team standards,
- compatibility,
- support lifecycle,
- production environment,
- available development tools.

---

## Linux on Different Machines

Linux can run in many environments.

```text
Physical Machine
      │
      ├── Laptop
      ├── Desktop
      └── Server

Virtual Machine
      │
      └── Cloud Instance

Container
      │
      └── Application Environment

Embedded Device
      │
      └── Specialized Hardware
```

The exact environment changes, but many core Linux concepts remain similar.

This portability is one reason Linux knowledge transfers well across engineering environments.

---

# Development Machine vs Production Machine

A developer might interact with Linux on a laptop.

A production application might run on a Linux server.

The environments are different, but many concepts are shared.

```text
Developer Machine

Shell
Filesystem
Processes
Packages
Environment
Networking
Logs
   │
   │ same foundational concepts
   ▼
Production Machine

Shell
Filesystem
Processes
Packages
Environment
Networking
Logs
```

Production introduces additional concerns, such as:

- scalability,
- availability,
- security,
- monitoring,
- deployment,
- orchestration.

Those belong to later engineering domains.

ENG-05 provides the foundation.

---

# Linux and the Development Lifecycle

Linux knowledge appears throughout the software lifecycle.

```text
Plan
 ↓
Write Code
 ↓
Run
 ↓
Test
 ↓
Debug
 ↓
Package
 ↓
Deploy
 ↓
Monitor
 ↓
Troubleshoot
```

Linux participates in many of these stages.

For example:

### Development

```text
Shell
Filesystem
Python
Virtual Environment
Git
```

### Testing

```text
Processes
Environment Variables
Dependencies
CLI Tools
```

### Deployment

```text
Packages
Processes
Networking
Configuration
Logs
```

### Troubleshooting

```text
Processes
Filesystem
Permissions
Networking
Logs
Environment
```

This is why Linux should be treated as an engineering foundation rather than a collection of commands.

---

# Engineering Decisions

## When should an engineer learn Linux?

If you work with:

- backend systems,
- AI/ML,
- GenAI,
- cloud systems,
- databases,
- APIs,
- containers,
- distributed systems,

Linux knowledge provides substantial practical value.

Even if your primary development machine uses another operating system, Linux concepts will still appear in many development and deployment environments.

---

## Do you need to become a Linux administrator?

No.

A software engineer does not need to master every aspect of Linux administration.

For ENG-05, the goal is:

> **Understand enough Linux to operate, develop, debug, and reason about software effectively.**

That is different from becoming a Linux system administrator.

---

## How Deep Should You Go?

A useful boundary is:

```text
Software Engineer
│
├── Must understand
│   ├── filesystem
│   ├── shell
│   ├── permissions
│   ├── processes
│   ├── packages
│   ├── environment
│   ├── networking basics
│   └── troubleshooting
│
├── Should understand conceptually
│   ├── OS/kernel relationship
│   ├── system resources
│   └── system interfaces
│
└── Specialized knowledge
    ├── kernel development
    ├── advanced administration
    ├── advanced networking
    └── security hardening
```

The final category is outside ENG-05.

---

# Common Misconceptions

## Misconception 1: Linux is an application

Linux is not simply an application you launch.

The term usually refers to a complete operating environment built around the Linux kernel.

---

## Misconception 2: Linux and Ubuntu are the same thing

They are related but not identical.

```text
Linux
  ↓
Kernel

Ubuntu
  ↓
Linux distribution
  ↓
Linux kernel + system software + tools + configuration
```

---

## Misconception 3: Linux means command line

The command line is an interface to the system.

Linux itself includes much more than the shell.

---

## Misconception 4: You only need Linux if you are a system administrator

Modern software engineers frequently interact with Linux environments.

Backend development, AI engineering, cloud systems, containers, and production debugging commonly involve Linux.

---

## Misconception 5: Learning Linux means memorizing commands

Commands are useful.

But memorizing commands without understanding the system leads to fragile knowledge.

A stronger approach is:

```text
Understand concept
      ↓
Understand problem
      ↓
Learn command
      ↓
Use command
      ↓
Interpret result
```

The command is the tool.

The mental model is the real skill.

---

# Common Mistakes

## Mistake 1: Running commands without understanding the current environment

An engineer may execute a command without asking:

- Where am I?
- Which user am I?
- What files will be affected?
- What process will be changed?

### Better approach

Inspect first.

Then act.

Then verify.

---

## Mistake 2: Treating development and production as completely unrelated

They may differ significantly, but many underlying concepts are shared.

Understanding Linux helps an engineer reason about both.

---

## Mistake 3: Solving every problem by reinstalling software

When something fails, reinstalling may hide the real cause.

A better troubleshooting process is:

```text
Observe
 ↓
Collect evidence
 ↓
Form hypothesis
 ↓
Test hypothesis
 ↓
Fix
 ↓
Verify
```

Troubleshooting is covered in depth later.

---

## Mistake 4: Ignoring the environment

An application is more than source code.

A useful mental model is:

```text
Application Behavior
        =
Code
+
Dependencies
+
Configuration
+
Runtime
+
Operating Environment
```

When debugging, all of these may matter.

---

# Production Perspective

Linux knowledge becomes increasingly valuable as software moves closer to production.

A typical backend or AI service might look conceptually like:

```text
                    Linux Server
                         │
          ┌──────────────┼──────────────┐
          │              │              │
       Process        Filesystem     Network
          │              │              │
          ▼              ▼              ▼
       API App       Config/Data     Database/API
          │
          ▼
       Logs
```

An engineer debugging this system may ask:

> Is the process running?

> Can it access the required files?

> Does the process have permission?

> Are the required dependencies installed?

> Are environment variables configured?

> Is the network connection working?

> What do the logs say?

These questions are Linux questions.

The same reasoning applies to many production systems.

---

# Linux in a GenAI Application

Consider a simple AI service:

```text
User
 ↓
FastAPI
 ↓
Python Application
 ↓
LLM API
 ↓
Vector Database
```

Running this service requires an environment:

```text
Linux
│
├── Python runtime
├── Python dependencies
├── Environment variables
├── Application files
├── Network connectivity
├── Running process
└── Logs
```

Suppose the application suddenly cannot connect to the vector database.

A weak debugging approach is:

> "The application is broken."

A stronger engineering approach is:

```text
Is the process running?
        ↓
Is the configuration correct?
        ↓
Is the required environment variable present?
        ↓
Can the machine reach the destination?
        ↓
Is the destination port reachable?
        ↓
What does the application log say?
```

This is the kind of reasoning ENG-05 is designed to develop.

---

# Linux and the Command Line

You will encounter commands throughout the remaining chapters.

Examples include:

```bash
pwd
ls
cd
mkdir
cp
mv
rm
cat
grep
find
ps
kill
```

Do not treat these as a vocabulary list.

Each command exists because it solves a particular problem.

For example:

```text
pwd
 ↓
Where am I?

ls
 ↓
What exists here?

cd
 ↓
Move to another location

ps
 ↓
What processes are running?

kill
 ↓
Request that a process stop
```

The detailed command-line model belongs in [Shell & Command Line](03-Shell-and-Command-Line.md).

---

# A Simple Troubleshooting Mental Model

When something goes wrong in a Linux development environment, avoid random actions.

Start from the system.

```text
                Problem
                   │
                   ▼
             What changed?
                   │
                   ▼
             What is running?
                   │
                   ▼
             What is configured?
                   │
                   ▼
             What is accessible?
                   │
                   ▼
             What does the log say?
                   │
                   ▼
             What evidence exists?
                   │
                   ▼
               Fix + Verify
```

This is more valuable than memorizing hundreds of commands.

---

# Interview Questions

## 1. What is Linux?

**Expected answer:**

Linux is an open-source Unix-like operating-system foundation centered around the Linux kernel. In everyday engineering usage, "Linux" often refers to a complete Linux distribution that combines the kernel with system software, tools, libraries, and configuration.

---

## 2. What is the difference between Linux and the Linux kernel?

**Expected answer:**

The Linux kernel is the core component responsible for managing hardware and fundamental operating-system resources. A Linux distribution combines the kernel with user-space software, tools, libraries, package management, configuration, and other components needed to create a usable operating environment.

---

## 3. What is a Linux distribution?

**Expected answer:**

A Linux distribution packages the Linux kernel with other software required to provide a usable operating system environment. Ubuntu, Debian, Fedora, and RHEL are examples.

---

## 4. Why is Linux important for software engineers?

**Expected answer:**

Linux provides a programmable, automation-friendly environment widely used for development, servers, cloud systems, AI workloads, and production infrastructure. Understanding Linux helps engineers develop, run, debug, and troubleshoot software more effectively.

---

## 5. Is Linux the same as the command line?

**Expected answer:**

No. The command line is an interface used to interact with a Linux system. Linux includes the kernel, system libraries, utilities, services, filesystems, networking components, and other system software.

---

## 6. Why does Linux knowledge matter to a GenAI engineer?

**Expected answer:**

GenAI applications often depend on Python environments, packages, environment variables, networking, processes, filesystems, logs, and Linux-based development or deployment environments. Linux knowledge helps the engineer understand and troubleshoot these components.

---

## 7. A Python application works on your laptop but fails on a Linux server. What would you investigate?

**Expected answer should include reasoning around:**

- Python/runtime version
- installed dependencies
- environment variables
- filesystem paths
- permissions
- network connectivity
- running processes
- application logs
- differences between environments

The important part is not the exact list.

The important part is investigating the **environment systematically instead of assuming the source code is the only cause**.

---

## 8. Do software engineers need to know Linux administration?

**Expected answer:**

Not necessarily at an advanced level. Software engineers should understand the Linux concepts required to develop, run, inspect, debug, and operate software. Specialized administration, kernel development, advanced networking, and security hardening are separate areas.

---

## Quick Revision

Linux is the foundation of many modern engineering environments.

Remember the following model:

```text
Linux Distribution
        │
        ├── Linux Kernel
        │      ├── Processes
        │      ├── Memory
        │      ├── Filesystems
        │      ├── Networking
        │      └── Hardware interaction
        │
        ├── System Libraries
        ├── Command-Line Tools
        ├── Package Management
        ├── Configuration
        └── Services
```

As an engineer:

```text
Application
    ↓
Runtime / Libraries
    ↓
System Interfaces
    ↓
Linux Kernel
    ↓
Hardware
```

The most important mental model is:

> **Software runs inside an environment, and Linux provides many of the services that make that environment possible.**

Linux knowledge is not primarily about memorizing commands.

It is about understanding:

```text
Files
Processes
Users
Permissions
Packages
Configuration
Networking
Logs
Environment
```

and reasoning about how these pieces work together.

---

# Key Takeaways

- Linux is an important engineering environment, not merely a collection of commands.
- The Linux kernel is the core operating-system component.
- A Linux distribution combines the kernel with software and tools needed for practical use.
- The shell is an interface to Linux, not Linux itself.
- Applications depend on the operating environment in which they run.
- Linux knowledge is useful for development, debugging, AI engineering, cloud systems, and production.
- Engineers should understand practical Linux usage without necessarily becoming Linux administrators.
- Strong Linux skills come from understanding system behavior, not memorizing commands.
- Troubleshooting should be evidence-driven and systematic.
- ENG-05 focuses on practical Linux engineering; deeper OS theory remains owned by ENG-01.

---

## Further Reading

For authoritative background and long-term reference:

- [The Linux Kernel Documentation](https://docs.kernel.org/)
- [The Linux man-pages project](https://man7.org/linux/man-pages/)
- [Ubuntu Documentation](https://documentation.ubuntu.com/)
- [Debian Documentation](https://www.debian.org/doc/)

These resources are references for deeper exploration. They are not prerequisites for completing ENG-05.

---

## Connection to the Next Chapter

Now that we have a mental model of Linux, the next question is:

> **Where does everything actually live inside a Linux system?**

That leads to the Linux filesystem.

Continue with:

[**02 — Linux Filesystem →**](02-Linux-Filesystem.md)

---

## End of Document

This completes the Markdown file:

`01-Linux-Fundamentals.md`

All parts can now be combined into a single production-ready Markdown document for the GitHub repository.
