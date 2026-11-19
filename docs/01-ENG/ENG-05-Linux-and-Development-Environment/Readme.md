# ENG-05 — Linux & Development Environment

> **Domain:** Engineering Foundations (ENG)  
> **Topic ID:** ENG-05

## Overview

Linux is one of the most common environments used by professional software, AI, and infrastructure engineers.

This topic builds the practical Linux and development-environment knowledge required to work effectively from the command line, manage software projects, troubleshoot development systems, and create reproducible environments.

The focus is **engineering usage**, not advanced Linux administration.

The learning path progresses from the Linux mental model to filesystem usage, command-line interaction, permissions, processes, packages, configuration, development environments, dependency isolation, scripting, networking, troubleshooting, productivity, and reproducibility.

---

## Learning Objectives

By the end of ENG-05, you should be able to:

- Understand Linux as a professional development environment.
- Navigate and reason about the Linux filesystem.
- Work effectively with the shell and command line.
- Create, inspect, modify, move, copy, and remove files and directories.
- Understand Linux users, groups, ownership, and permissions.
- Inspect and manage running processes.
- Understand how Linux packages and package managers work.
- Use environment variables for runtime configuration.
- Set up a practical software development environment.
- Isolate project dependencies using virtual environments.
- Write basic shell scripts for repetitive tasks.
- Understand basic Linux networking concepts relevant to developers.
- Read logs and perform systematic troubleshooting.
- Use CLI tools more efficiently.
- Understand the principles behind reproducible development environments.

---

## Prerequisites

This topic assumes completion of:

1. [ENG-01 — Computer Science Fundamentals](../ENG-01-Computer-Science-Fundamentals/README.md)
2. [ENG-02 — Programming Foundations](../ENG-02-Programming-Foundations/README.md)
3. [ENG-03 — Software Engineering Principles](../ENG-03-Software-Engineering-Principles/README.md)
4. [ENG-04 — Version Control & Collaborative Development](../ENG-04-Version-Control-and-Collaborative-Development/README.md)

The earlier topics provide the conceptual foundation. ENG-05 focuses on applying those ideas in a practical Linux development environment.

---

## Learning Path

### 1. Linux Fundamentals

Understand what Linux is, why engineers use it, and how to think about Linux as a development environment.

[Read Linux Fundamentals →](01-Linux-Fundamentals.md)

---

### 2. Linux Filesystem

Learn how Linux organizes files and directories, how paths work, and how to navigate the filesystem hierarchy.

[Read Linux Filesystem →](02-Linux-Filesystem.md)

---

### 3. Shell & Command Line

Learn how engineers interact with Linux through the terminal and shell.

[Read Shell & Command Line →](03-Shell-and-Command-Line.md)

---

### 4. Files, Directories & File Operations

Learn the practical operations used to create, inspect, copy, move, rename, delete, and search files and directories.

[Read Files, Directories & File Operations →](04-Files-Directories-and-File-Operations.md)

---

### 5. Users, Groups & Permissions

Understand Linux identity, ownership, groups, and permission-based access.

[Read Users, Groups & Permissions →](05-Users-Groups-and-Permissions.md)

---

### 6. Processes & Process Management

Learn how programs run as processes and how developers inspect and manage them in Linux.

[Read Processes & Process Management →](06-Processes-and-Process-Management.md)

---

### 7. Package Management

Understand packages, repositories, package managers, and the basic software installation lifecycle.

[Read Package Management →](07-Package-Management.md)

---

### 8. Environment Variables & Configuration

Learn how software receives configuration from its environment and how environment variables affect program execution.

[Read Environment Variables & Configuration →](08-Environment-Variables-and-Configuration.md)

---

### 9. Development Environment Setup

Bring the earlier concepts together to create a practical development workspace for software projects.

[Read Development Environment Setup →](09-Development-Environment-Setup.md)

---

### 10. Virtual Environments & Dependency Isolation

Understand why projects need isolated dependencies and how virtual environments provide that isolation.

[Read Virtual Environments & Dependency Isolation →](10-Virtual-Environments-and-Dependency-Isolation.md)

---

### 11. Shell Scripting Fundamentals

Move from executing individual commands to automating repetitive development tasks with shell scripts.

[Read Shell Scripting Fundamentals →](11-Shell-Scripting-Fundamentals.md)

---

### 12. Linux Networking Basics

Build the networking knowledge developers need to understand basic connectivity, addresses, ports, DNS, and local services.

[Read Linux Networking Basics →](12-Linux-Networking-Basics.md)

---

### 13. Logs & System Troubleshooting

Learn how to investigate development problems systematically using logs, processes, files, configuration, and basic networking information.

[Read Logs & System Troubleshooting →](13-Logs-and-System-Troubleshooting.md)

---

### 14. Development Tools & CLI Productivity

Learn how to make everyday command-line work faster, clearer, and more effective.

[Read Development Tools & CLI Productivity →](14-Development-Tools-and-CLI-Productivity.md)

---

### 15. Reproducible Development Environments

Understand how to make development environments consistent and repeatable across machines and team members.

[Read Reproducible Development Environments →](15-Reproducible-Development-Environments.md)

---

## Learning Flow

The chapters are intentionally ordered as a progression:

```text
Linux Mental Model
        ↓
Filesystem
        ↓
Shell & Command Line
        ↓
Files & Directories
        ↓
Users & Permissions
        ↓
Processes
        ↓
Packages
        ↓
Environment & Configuration
        ↓
Development Environment
        ↓
Dependency Isolation
        ↓
Shell Scripting
        ↓
Networking
        ↓
Troubleshooting
        ↓
CLI Productivity
        ↓
Reproducible Environments
```

The goal is not to memorize Linux commands.

The goal is to understand **why the environment works the way it does** and to become comfortable reasoning about it.

---

## Knowledge Graph

ENG-05 connects several earlier engineering foundations:

```text
ENG-01
Computer Science Fundamentals
        │
        ├── Operating System concepts
        ├── Processes
        ├── Filesystems
        └── I/O
                │
                ▼
ENG-05
Linux & Development Environment
                │
        ┌───────┼────────┐
        ▼       ▼        ▼
      Linux    CLI    Development
      System          Environment
        │                │
        └──────┬─────────┘
               ▼
        Reproducibility
               │
               ▼
             PROD
```

ENG-02 contributes programming knowledge.

ENG-03 contributes software-engineering principles such as consistency and maintainability.

ENG-04 provides version-control knowledge used from the Linux command line.

---

## Cross-Domain Connections

### ENG-01 → ENG-05

ENG-01 owns the deeper computer-science concepts.

ENG-05 focuses on their practical Linux usage.

For example:

```text
OS process concept
        ↓
Linux process inspection and management
```

---

### ENG-02 → ENG-05

ENG-02 owns programming fundamentals.

ENG-05 provides the environment in which programs are developed, configured, executed, and isolated.

---

### ENG-03 → ENG-05

ENG-03 establishes software-engineering principles.

ENG-05 applies those principles to development environments, configuration, dependency isolation, and reproducibility.

---

### ENG-04 → ENG-05

ENG-04 owns Git and collaborative development.

ENG-05 may use Git commands as practical command-line examples, but does not re-teach Git workflows.

---

### ENG-05 → Production Engineering

ENG-05 provides foundations required for later topics such as:

- Containers
- CI/CD
- Model serving
- Deployment
- Cloud environments
- Kubernetes
- Production infrastructure

These topics are **not taught here**.

---

## Scope Boundary

ENG-05 focuses on the Linux and development-environment knowledge required by an engineer.

It does **not** attempt to become an advanced Linux administration course.

The following are intentionally outside the scope:

- Kernel development
- Deep kernel internals
- Advanced system administration
- Advanced networking
- Advanced shell programming
- Production infrastructure management
- Docker internals
- Kubernetes
- CI/CD implementation
- Cloud infrastructure
- Infrastructure as Code
- Advanced security hardening

These concepts belong to later curriculum areas or specialized learning.

---

## Recommended Study Approach

For first-time learning:

```text
Read the chapter
      ↓
Understand the mental model
      ↓
Run the practical examples
      ↓
Experiment from the terminal
      ↓
Explain the concept in your own words
      ↓
Review the Quick Revision section
```

For revision:

```text
Quick Revision
      ↓
Key Takeaways
      ↓
Interview Questions
      ↓
Practical experimentation
```

The objective is to build **working engineering intuition**, not command memorization.

---

## Quick Revision Path

For a fast review of ENG-05:

1. What is Linux?
2. How is the Linux filesystem organized?
3. What is the difference between a terminal and a shell?
4. How are files and directories manipulated?
5. How do Linux permissions work?
6. What is a process?
7. How are software packages managed?
8. What are environment variables?
9. Why do development environments need dependency isolation?
10. What makes an environment reproducible?
11. How can Linux networking be inspected?
12. How should an engineer approach troubleshooting?

---

## Topic Completion Checklist

- [ ] Linux Fundamentals
- [ ] Linux Filesystem
- [ ] Shell & Command Line
- [ ] Files, Directories & File Operations
- [ ] Users, Groups & Permissions
- [ ] Processes & Process Management
- [ ] Package Management
- [ ] Environment Variables & Configuration
- [ ] Development Environment Setup
- [ ] Virtual Environments & Dependency Isolation
- [ ] Shell Scripting Fundamentals
- [ ] Linux Networking Basics
- [ ] Logs & System Troubleshooting
- [ ] Development Tools & CLI Productivity
- [ ] Reproducible Development Environments

---

## Final Goal

After completing ENG-05, you should be comfortable entering a Linux-based development environment and reasoning about:

```text
Where am I?
      ↓
What files exist?
      ↓
How do I interact with the system?
      ↓
Who can access this?
      ↓
What is running?
      ↓
What software is installed?
      ↓
How is the application configured?
      ↓
Are dependencies isolated?
      ↓
Can I automate this?
      ↓
Can I diagnose failures?
      ↓
Can another engineer reproduce my environment?
```

That is the practical foundation required before moving deeper into production-grade AI engineering environments.
