# Linux Filesystem

## Learning Objectives

By the end of this chapter, you should be able to:

- Understand how Linux organizes files and directories.
- Build a mental model of the Linux filesystem hierarchy.
- Understand paths and the difference between absolute and relative paths.
- Explain important Linux directories at a developer-friendly level.
- Understand the relationship between the filesystem and mounted storage.
- Navigate a Linux filesystem safely.
- Reason about where application code, configuration, logs, user data, and temporary files commonly live.
- Avoid common filesystem mistakes when working on Linux systems.

---

## Prerequisites

Before starting this chapter, you should understand:

- Basic operating-system concepts from [ENG-01 — Computer Science Fundamentals](../ENG-01-Computer-Science-Fundamentals/README.md)
- The Linux mental model from [01 — Linux Fundamentals](01-Linux-Fundamentals.md)

> **Boundary:** ENG-01 owns the deeper computer-science model of filesystems and storage. This chapter focuses on how an engineer interacts with and reasons about the Linux filesystem in practice.

---

## Estimated Reading Time

**20–25 minutes**

---

## Before We Start

Imagine opening a new computer and finding thousands of files.

Where would you put:

- application code?
- configuration?
- user files?
- logs?
- temporary data?
- installed programs?
- operating-system files?

If every file were placed randomly, the system would quickly become difficult to understand and maintain.

Linux solves this with a hierarchical filesystem.

The central idea is simple:

> **Linux organizes files and directories into a tree.**

Once you understand that tree, many Linux commands become much easier to reason about.

---

## Why This Exists

A computer needs a way to organize persistent data.

Without an organized structure, an engineer would have difficulty answering basic questions:

- Where is this file?
- Where is this application installed?
- Where is configuration stored?
- Where are logs?
- Where do user files belong?
- Where should temporary files go?

Linux uses a hierarchical structure.

A simplified view looks like this:

```text
/
├── home/
├── etc/
├── var/
├── usr/
├── tmp/
├── dev/
├── proc/
└── ...
```

The `/` directory is the starting point of the Linux filesystem hierarchy.

It is called the **root directory**.

---

# Mental Model: A Tree

Think about a family tree.

There is one starting point.

From that point, branches lead to smaller groups.

The Linux filesystem works similarly.

```text
                    /
                    │
       ┌────────────┼─────────────┐
       │            │             │
     home          etc           var
       │            │             │
     users       config          logs
       │
     vineet
       │
   projects
       │
   my-app
```

The important idea is:

```text
Root
  ↓
Directory
  ↓
Subdirectory
  ↓
File
```

A directory can contain:

- files,
- other directories,
- or both.

This creates a hierarchy.

---

# The Root Directory `/`

In Linux, `/` is the top of the filesystem hierarchy.

For example:

```text
/
├── home
├── etc
├── usr
├── var
└── tmp
```

Notice something important.

Linux does not start with:

```text
C:\
D:\
E:\
```

in the same way Windows commonly presents storage to users.

Linux presents a unified filesystem tree beginning at:

```text
/
```

Different storage devices or filesystems can be attached into this tree through **mount points**.

The practical concept is:

> **A Linux system can expose different storage through one filesystem hierarchy.**

We will keep the deeper storage and filesystem implementation details within the scope of ENG-01.

---

# Paths

A **path** tells Linux where something exists in the filesystem.

For example:

```text
/home/vineet/projects/my-app/app.py
```

This path can be read from left to right:

```text
/
└── home
    └── vineet
        └── projects
            └── my-app
                └── app.py
```

Each directory narrows the location until we reach the file.

---

# Absolute Paths

An **absolute path** starts from the root directory.

For example:

```text
/home/vineet/projects/my-app/app.py
```

The path begins with:

```text
/
```

Therefore it describes a complete location from the root.

You can think of it like a full postal address.

```text
Country
  ↓
State
  ↓
City
  ↓
Street
  ↓
Building
```

Similarly:

```text
/
 ↓
home
 ↓
vineet
 ↓
projects
 ↓
my-app
 ↓
app.py
```

An absolute path does not depend on where you currently are.

---

# Relative Paths

A **relative path** describes a location relative to your current directory.

Suppose you are currently here:

```text
/home/vineet/projects/my-app
```

and the directory contains:

```text
my-app/
├── app.py
├── config/
│   └── settings.yaml
└── data/
```

You could refer to:

```text
config/settings.yaml
```

instead of:

```text
/home/vineet/projects/my-app/config/settings.yaml
```

The relative path depends on your current location.

---

# Absolute vs Relative Paths

| Type | Example | Depends on Current Directory? |
|---|---|---|
| Absolute | `/home/vineet/app.py` | No |
| Relative | `app.py` | Yes |
| Relative | `config/settings.yaml` | Yes |

A useful mental model:

```text
Absolute path
     ↓
"Give me the complete address."

Relative path
     ↓
"From where I am now, go here."
```

---

# Current Directory

When working in a shell, you have a **current working directory**.

For example:

```text
/home/vineet/projects/my-app
```

Commands you execute may interpret relative paths from this location.

You can think of it as:

> **Your current position inside the filesystem tree.**

For example:

```text
/home/vineet/projects/my-app
                  ↑
            You are here
```

This becomes extremely important when using commands that manipulate files.

---

# `.` and `..`

Linux provides special path references.

## `.`

A single dot means:

> **The current directory.**

For example:

```text
./app.py
```

means:

> `app.py` in the current directory.

---

## `..`

Two dots mean:

> **The parent directory.**

Suppose you are here:

```text
/home/vineet/projects/my-app
```

Then:

```text
..
```

refers to:

```text
/home/vineet/projects
```

Visually:

```text
/home/vineet/projects
            │
            └── my-app
                  ↑
               current

.. → projects
```

These two concepts are small but extremely useful when navigating Linux.

---

# The Linux Filesystem Hierarchy

Linux distributions generally follow a filesystem hierarchy with conventional directories.

The exact contents vary between systems, but several directories have common purposes.

A developer should recognize the major ones.

---

## `/home`

`/home` generally contains users' home directories.

For example:

```text
/home
├── alice
├── bob
└── vineet
```

A user's personal development projects may therefore live under:

```text
/home/vineet/
```

For example:

```text
/home/vineet/projects/
```

The home directory is often the natural place for a developer's personal project files.

---

# `~` — Home Directory Shortcut

The shell commonly provides:

```text
~
```

as a shortcut representing the current user's home directory.

For example:

```text
~/projects
```

might represent:

```text
/home/vineet/projects
```

The exact home path depends on the user.

This is why `~` is useful when writing commands that should refer to the current user's home directory.

---

# `/etc`

`/etc` contains system-wide configuration files.

Think of it as:

> **A place where the operating system and system services keep configuration.**

Examples may include configuration for:

- networking,
- users,
- services,
- system behavior.

An important distinction:

```text
/etc
  ↓
System-level configuration
```

versus:

```text
~/...
  ↓
User-specific files/configuration
```

Do not assume every application configuration file belongs in `/etc`.

Modern applications can have their own configuration conventions.

---

# `/usr`

Historically, `/usr` contains a large portion of user-space programs, libraries, and supporting data.

A simplified mental model is:

```text
/usr
├── bin
├── lib
├── share
└── ...
```

You will often encounter installed commands and software components under paths associated with `/usr`.

For a developer, the important point is:

> `/usr` commonly contains software and supporting files provided by the operating system and installed packages.

Do not treat `/usr` as your normal project workspace.

---

# `/usr/bin`

`/usr/bin` commonly contains executable programs available to users.

For example, commands such as:

```text
python
grep
find
```

may be available through locations such as `/usr/bin`, depending on the distribution and installation.

However, do not assume every executable on a Linux system lives there.

Executables can exist in many locations.

The shell uses mechanisms such as `PATH` to determine where it looks for commands.

Environment configuration and `PATH` are covered in:

[08 — Environment Variables & Configuration](08-Environment-Variables-and-Configuration.md)

---

# `/var`

`/var` is commonly used for data that changes during system operation.

The name comes from the idea of **variable data**.

Examples include:

- logs,
- caches,
- application state,
- spool data.

A simplified view:

```text
/var
├── log
├── cache
└── ...
```

This makes `/var` especially relevant during troubleshooting.

For example:

```text
Application problem
       ↓
Check relevant logs
       ↓
Investigate /var/log
```

The exact logging setup depends on the system and application.

---

# `/tmp`

`/tmp` is commonly used for temporary files.

Temporary data may be created by:

- applications,
- scripts,
- users,
- system processes.

The important mental model is:

```text
/tmp
 ↓
Temporary workspace
```

Do not treat `/tmp` as permanent application storage.

If important data needs to survive reliably, it should have an appropriate persistent location.

---

# `/dev`

`/dev` contains device-related interfaces exposed to user space.

This is one place where Linux's philosophy becomes interesting.

Hardware devices can often be interacted with through filesystem-like interfaces.

You may encounter entries associated with:

- disks,
- terminals,
- devices,
- pseudo-devices.

For example:

```text
/dev/...
```

However, do not interpret everything inside `/dev` as an ordinary file stored on disk.

The filesystem representation provides an interface to devices.

The deeper device and kernel model belongs outside this chapter.

---

# `/proc`

`/proc` is a special filesystem that exposes information about the running system and processes.

For example, it can provide information about:

- processes,
- system state,
- kernel information.

This leads to an important distinction.

Not every filesystem entry represents ordinary persistent data stored on an SSD.

Some filesystem interfaces expose **live system information**.

You may encounter:

```text
/proc
```

when investigating processes or system behavior.

Detailed process concepts are covered in:

[06 — Processes & Process Management](06-Processes-and-Process-Management.md)

---

# `/sys`

`/sys` is another special filesystem used to expose information about devices, drivers, and kernel-related system structures.

For a software engineer, the important point is simply:

```text
/sys
 ↓
Kernel/device/system information interface
```

You generally should not modify files there casually.

This chapter does not cover kernel internals or device-driver development.

---

# `/bin`, `/sbin`, and Modern Linux Systems

You may encounter directories such as:

```text
/bin
/sbin
```

Historically, these had distinct purposes.

Modern Linux distributions may use filesystem layouts where some of these directories are linked into locations under `/usr`.

Therefore, avoid building your mental model around rigid assumptions such as:

> "Every executable must always be in `/bin`."

A better engineering rule is:

> **Understand the purpose of the standard hierarchy, but inspect the actual system when behavior matters.**

---

# Important Directories at a Glance

| Directory | Practical Purpose |
|---|---|
| `/` | Root of the filesystem hierarchy |
| `/home` | User home directories |
| `/etc` | System configuration |
| `/usr` | User-space programs, libraries, and shared data |
| `/usr/bin` | Common executable programs |
| `/var` | Variable system/application data |
| `/tmp` | Temporary files |
| `/dev` | Device interfaces |
| `/proc` | Live process/system information |
| `/sys` | Kernel/device/system information |

The goal is not to memorize every directory.

The goal is to recognize what kind of information you are likely to find in each location.

---

## `/opt` and `/srv`

Two other directories are worth recognizing.

## `/opt`

`/opt` is commonly associated with optional or separately installed software.

It may be used for applications that do not fit naturally into the standard system package layout.

The exact usage depends on the system.

---

## `/srv`

`/srv` is intended for data served by the system.

For example, a server application could potentially store service-related data there.

In modern application deployments, however, many applications use their own deployment conventions.

Therefore, do not assume every web application will use `/srv`.

---

## Developer Projects and the Filesystem

A developer might organize a project like:

```text
/home/vineet/
└── projects/
    ├── vivahai/
    │   ├── app/
    │   ├── tests/
    │   ├── .venv/
    │   ├── requirements.txt
    │   └── README.md
    │
    └── another-project/
```

The exact structure depends on the project.

The important point is:

> **Your project is part of the Linux filesystem, but it is not the filesystem itself.**

The project exists inside the larger system hierarchy.

---

# Project Path vs System Path

Consider:

```text
/home/vineet/projects/vivahai/
```

This is a project location.

Now compare:

```text
/etc/
```

This is a system configuration location.

And:

```text
/var/log/
```

This is commonly associated with system/application runtime data.

Understanding these boundaries helps prevent accidental changes to system files.

---

# Mount Points

Earlier we said that Linux presents a unified filesystem tree.

How can multiple storage devices participate in the same tree?

Linux can **mount** a filesystem at a directory.

A simplified example:

```text
                 /
                 │
        ┌────────┴────────┐
        │                 │
      home              data
        │                 │
        │                 └── another filesystem
        │
    user files
```

The directory where another filesystem becomes accessible is called a **mount point**.

The key idea is:

> **A mount point provides a location in the filesystem tree where another filesystem is attached.**

You do not need to learn advanced storage administration for ENG-05.

The important engineering intuition is that:

```text
One visible filesystem tree
        ↓
Can contain multiple mounted filesystems
```

---

# Why Mounts Matter to Developers

Mounts become relevant when working with:

- additional disks,
- cloud machines,
- shared storage,
- development environments,
- containers,
- databases,
- large datasets.

For example:

```text
/
├── home/
└── data/
        ↑
        └── mounted storage
```

An application might read a large dataset from `/data`.

The application does not necessarily need to know the physical storage device behind that path.

That abstraction is useful.

---

# Filesystem Navigation

The command line provides tools for navigating the filesystem.

For example:

```bash
pwd
```

asks:

> Where am I?

```bash
ls
```

asks:

> What is here?

```bash
cd
```

means:

> Move to another directory.

A simple workflow:

```bash
pwd
ls
cd projects
ls
```

Conceptually:

```text
Current location
      ↓
Inspect
      ↓
Choose destination
      ↓
Move
      ↓
Inspect again
```

This pattern is more important than memorizing individual commands.

Detailed command-line behavior belongs in:

[03 — Shell & Command Line](03-Shell-and-Command-Line.md)

---

# Filesystem Navigation Example

Suppose the current directory is:

```text
/home/vineet
```

and the structure is:

```text
/home/vineet/
├── projects/
├── documents/
└── downloads/
```

Running:

```bash
cd projects
```

moves to:

```text
/home/vineet/projects
```

Running:

```bash
cd ..
```

moves back to:

```text
/home/vineet
```

Running:

```bash
cd /tmp
```

moves directly to:

```text
/tmp
```

Notice the difference:

```text
cd projects
     ↓
relative path

cd /tmp
     ↓
absolute path
```

---

# Filesystem Safety

Filesystem operations can be destructive.

For example:

```bash
rm
```

can remove files.

Therefore, before modifying or deleting something, an engineer should ask:

```text
Where am I?
      ↓
What exactly am I targeting?
      ↓
Is this path correct?
      ↓
What will this operation change?
      ↓
Can the operation be reversed?
```

This is particularly important when operating as a user with elevated privileges.

A command that is harmless in a project directory can be dangerous when pointed at the wrong system location.

---

# The Principle of Least Surprise

Filesystem organization follows conventions for a reason.

When another engineer sees:

```text
/etc/
```

they expect configuration.

When they see:

```text
/home/user/
```

they expect user-owned data.

When they see:

```text
/var/log/
```

they expect logs or runtime information.

Following standard conventions makes systems easier to understand.

This is an engineering maintainability concern, not just a Linux convention.

---

# Linux Filesystem and Permissions

The filesystem hierarchy tells you:

> **Where something is.**

Permissions tell you:

> **Who can access it and what they can do.**

These concepts are related but different.

```text
Filesystem
    ↓
Where is the object?

Permissions
    ↓
Who can access the object?
```

For example:

```text
/home/vineet/project/app.py
```

answers the location question.

The permissions associated with `app.py` answer access questions.

Permissions are covered in:

[05 — Users, Groups & Permissions](05-Users-Groups-and-Permissions.md)

This chapter will not duplicate that explanation.

---

# Filesystem and Processes

Files and processes are also connected.

A running application may:

- read configuration files,
- write logs,
- access data files,
- create temporary files,
- open network-related resources.

For example:

```text
Application Process
       │
       ├── reads → configuration
       ├── reads → model/data
       ├── writes → logs
       └── writes → temporary files
```

This relationship becomes extremely useful when troubleshooting.

The detailed process model belongs in:

[06 — Processes & Process Management](06-Processes-and-Process-Management.md)

---

# Filesystem and Environment Configuration

Applications often use filesystem paths through environment variables.

For example:

```text
MODEL_PATH=/data/models/model.bin
```

The application can then read the model from that location.

The relationship becomes:

```text
Environment Variable
        ↓
Filesystem Path
        ↓
Application Resource
```

Environment variables are covered in:

[08 — Environment Variables & Configuration](08-Environment-Variables-and-Configuration.md)

---

# Filesystem in AI Engineering

Filesystem knowledge becomes particularly useful in AI and GenAI work.

A model-serving environment might contain:

```text
/opt/
└── application/

/data/
├── models/
├── datasets/
└── cache/

/var/
└── log/
```

An AI engineer may need to understand:

- where model files exist,
- where datasets are stored,
- where application code is located,
- where logs are written,
- whether the process can access the required path,
- whether enough storage is available.

For example:

```text
Model loading failed
       ↓
Does the model file exist?
       ↓
Is the path correct?
       ↓
Does the process have permission?
       ↓
Is the storage mounted?
       ↓
Can the application read the file?
```

The filesystem becomes part of the debugging process.

---

# Production Perspective

Consider a backend service running on Linux:

```text
Linux Server
│
├── Application
│   └── /opt/my-service/
│
├── Configuration
│   └── /etc/my-service/
│
├── Runtime Data
│   └── /var/lib/my-service/
│
├── Logs
│   └── /var/log/
│
└── Temporary Data
    └── /tmp/
```

The exact layout depends on the application and deployment system.

The important engineering principle is **separation of concerns**.

Different kinds of data have different lifecycles.

For example:

```text
Application code
    ≠
Configuration
    ≠
Logs
    ≠
Temporary data
    ≠
Persistent application data
```

Keeping those concepts separate makes systems easier to operate and maintain.

---

# Common Misconceptions

## Misconception 1: `/` means the root user's home directory

No.

These are different concepts.

```text
/        → root directory
/root    → home directory of the root user
```

The word "root" is unfortunately used for both concepts.

Context matters.

---

## Misconception 2: Everything in the filesystem is stored permanently on disk

Not necessarily.

Directories such as:

```text
/proc
/dev
/sys
```

provide interfaces to system, device, or kernel information.

Some filesystem entries represent dynamic system information rather than ordinary persistent files.

---

## Misconception 3: `/home` is the entire filesystem

No.

`/home` is one directory inside the filesystem hierarchy.

The filesystem starts at:

```text
/
```

---

## Misconception 4: Relative and absolute paths are interchangeable

They can refer to the same object, but they behave differently.

A relative path depends on the current directory.

An absolute path does not.

---

## Misconception 5: Every Linux system has exactly the same directory structure

Linux distributions follow common conventions, but actual systems can differ.

Always inspect the environment when exact behavior matters.

---

# Common Mistakes

## Mistake 1: Running a command from the wrong directory

For example, an engineer thinks:

```text
/home/project
```

but is actually in:

```text
/tmp
```

A relative command can therefore operate on the wrong files.

### Better approach

Check your current location before important operations:

```bash
pwd
```

---

## Mistake 2: Confusing `/` with `~`

Remember:

```text
/  → filesystem root
~  → current user's home directory
```

They are not the same.

---

## Mistake 3: Hard-coding assumptions about paths

An engineer may assume:

```text
/home/user/project
```

will always exist.

But usernames, operating systems, environments, and deployment layouts can differ.

Prefer appropriate configuration or environment-based paths when portability matters.

---

## Mistake 4: Treating system directories like project directories

A project directory is generally under a user or application workspace.

System directories such as:

```text
/etc
/usr
/var
```

have system-level purposes.

Modify them deliberately.

---

## Mistake 5: Deleting files without checking the target

Filesystem commands can be destructive.

Always understand the path before running destructive operations.

---

# Engineering Decisions

## Where should a developer keep personal projects?

A common choice is within the user's home directory:

```text
~/projects/
```

The exact location is a team or personal convention.

The important property is that the location is clear, accessible, and appropriate for development work.

---

## Should application configuration always be stored in `/etc`?

No.

`/etc` is traditionally associated with system-level configuration, but modern applications may use different configuration mechanisms.

The correct decision depends on:

- application architecture,
- deployment model,
- operating environment,
- team conventions.

---

## Should application data be stored beside application code?

Not necessarily.

Separating:

```text
Code
Configuration
Persistent Data
Logs
Temporary Data
```

can make upgrades, backups, and troubleshooting easier.

The correct structure depends on the application and deployment architecture.

---

# Interview Questions

## 1. What is the root directory in Linux?

**Expected answer:**

`/` is the root of the Linux filesystem hierarchy. All normal filesystem paths begin from this root.

---

## 2. What is the difference between `/` and `/root`?

**Expected answer:**

`/` is the root directory of the filesystem. `/root` is normally the home directory of the root user.

---

## 3. What is the difference between an absolute path and a relative path?

**Expected answer:**

An absolute path starts from `/` and identifies a location independently of the current directory. A relative path is interpreted from the current working directory.

---

## 4. What does `..` represent?

**Expected answer:**

`..` represents the parent directory of the current directory.

---

## 5. What is `/etc` generally used for?

**Expected answer:**

`/etc` generally contains system-wide configuration files and configuration for system services.

---

## 6. What is `/var` generally used for?

**Expected answer:**

`/var` commonly stores data that changes while the system operates, such as logs, caches, and runtime or application state.

---

## 7. Why is `/proc` different from a normal directory?

**Expected answer:**

`/proc` is a special filesystem that exposes live information about processes and system state. Its entries should not be assumed to be ordinary persistent files stored on disk.

---

## 8. What is a mount point?

**Expected answer:**

A mount point is a directory in the filesystem hierarchy where another filesystem is attached and made accessible.

---

## 9. Why should an engineer understand filesystem conventions?

**Expected answer:**

Conventions make systems predictable. They help engineers locate configuration, logs, user data, applications, and temporary information and reduce accidental changes to the wrong locations.

---

## 10. An application says a file does not exist. What would you check?

**Expected reasoning:**

```text
Is the path correct?
      ↓
Is it absolute or relative?
      ↓
What is the process's current working directory?
      ↓
Does the file actually exist?
      ↓
Is the filesystem mounted?
      ↓
Does the process have access?
```

The important skill is systematic investigation rather than guessing.

---

# Quick Revision

Linux organizes files and directories as a hierarchy beginning at:

```text
/
```

Think of the filesystem as a tree:

```text
/
├── home
├── etc
├── usr
├── var
├── tmp
├── dev
├── proc
└── sys
```

Remember the major concepts:

```text
/       → filesystem root
/home   → user home directories
/etc    → system configuration
/usr    → programs, libraries, shared data
/var    → changing runtime/system data
/tmp    → temporary files
/dev    → device interfaces
/proc   → live process/system information
/sys    → kernel/device/system information
```

Paths can be:

```text
Absolute
/home/vineet/project/app.py

Relative
project/app.py
```

And:

```text
.   → current directory
..  → parent directory
~   → current user's home directory
```

The key mental model is:

> **The Linux filesystem is a structured namespace that gives software and engineers predictable ways to locate and organize resources.**

---

# Key Takeaways

- Linux uses a hierarchical filesystem beginning at `/`.
- Directories organize files and other directories.
- Absolute paths start from `/`.
- Relative paths depend on the current working directory.
- `.` means the current directory.
- `..` means the parent directory.
- `~` commonly represents the current user's home directory.
- `/home`, `/etc`, `/usr`, `/var`, and `/tmp` have important conventional purposes.
- `/proc`, `/sys`, and `/dev` expose special system or device interfaces.
- A Linux filesystem can contain multiple mounted filesystems.
- Filesystem knowledge is essential for development and troubleshooting.
- Filesystem location and file permissions are separate concepts.
- Developers should understand conventions without assuming every Linux system is identical.
- Safe filesystem work starts with knowing **where you are and what you are about to change**.

---

## Further Reading

For deeper reference:

- [Filesystem Hierarchy Standard](https://refspecs.linuxfoundation.org/fhs.shtml)
- [Linux man-pages](https://man7.org/linux/man-pages/)
- [Ubuntu Documentation](https://documentation.ubuntu.com/)

These resources are optional references. They are not required to understand the chapter.

---

## Connection to the Next Chapter

You now know **where things live** in a Linux system.

The next question is:

> **How do engineers actually interact with this filesystem and the rest of Linux?**

That leads to the shell and command line.

Continue with:

[**03 — Shell & Command Line →**](03-Shell-and-Command-Line.md)
