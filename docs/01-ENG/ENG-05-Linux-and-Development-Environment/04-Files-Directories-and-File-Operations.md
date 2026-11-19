# 04 — Files, Directories & File Operations

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain how Linux represents files and directories.
- Understand the difference between a file, directory, and path.
- Create, inspect, copy, move, rename, and remove files and directories.
- Understand how relative and absolute paths affect file operations.
- Use common Linux file-operation commands safely.
- Understand recursive operations and why they require caution.
- Work with hidden files.
- Inspect file types and basic file metadata.
- Search for files using practical command-line tools.
- Combine file operations with pipes and command-line workflows.
- Apply safe file-management practices in development environments.
- Recognize when a file-operation problem is actually a permissions or filesystem problem.

---

## Prerequisites

Before starting this chapter, you should understand:

- Basic Linux concepts
- Linux filesystem hierarchy
- Absolute and relative paths
- Current working directory
- Basic shell and command-line concepts
- Standard input/output and command composition

Recommended previous chapters:

- [01 — Linux Fundamentals](./01-Linux-Fundamentals.md)
- [02 — Linux Filesystem](./02-Linux-Filesystem.md)
- [03 — Shell & Command Line](./03-Shell-and-Command-Line.md)

### Important Boundary

This chapter owns **practical file and directory operations**.

It does not deeply teach:

- Filesystem architecture → [02 — Linux Filesystem](./02-Linux-Filesystem.md)
- File permissions → [05 — Users, Groups & Permissions](./05-Users-Groups-and-Permissions.md)
- Process management → [06 — Processes & Process Management](./06-Processes-and-Process-Management.md)
- Advanced filesystem administration
- Storage management
- Filesystem internals
- Shell scripting → [11 — Shell Scripting Fundamentals](./11-Shell-Scripting-Fundamentals.md)

The goal is to become comfortable managing project files from the Linux command line.

---

## Estimated Reading Time

**25–30 minutes**

---

## Before We Start

Almost every software project interacts with files.

A Python application may contain:

```text
application/
├── app/
├── tests/
├── config/
├── data/
├── logs/
├── requirements.txt
└── README.md
```

A GenAI application may additionally contain:

```text
genai-app/
├── app/
├── prompts/
├── evaluations/
├── datasets/
├── models/
├── configs/
├── tests/
└── logs/
```

As an engineer, you constantly perform operations such as:

```text
Create
Read
Copy
Move
Rename
Delete
Search
Inspect
Organize
```

Linux provides simple command-line tools for these operations.

The important skill is not memorizing commands.

It is understanding:

> **What object am I operating on, where is it, and what will happen when I run this command?**

---

# 1. Files and Directories

At the simplest level:

```text
File
  ↓
Contains data

Directory
  ↓
Organizes references to filesystem objects
```

For practical development work, it is useful to think of a directory as a container for project files and other directories.

For example:

```text
project/
├── app.py
├── config.yaml
├── tests/
│   ├── test_api.py
│   └── test_model.py
└── data/
    └── users.csv
```

Here:

```text
project/
tests/
data/
```

are directories.

And:

```text
app.py
config.yaml
test_api.py
test_model.py
users.csv
```

are files.

---

# 2. Paths Identify Locations

A command needs to know **which object** you want to operate on.

That is what a path provides.

For example:

```bash
/home/vineet/projects/app.py
```

This is an absolute path.

A relative path might be:

```bash
projects/app.py
```

when the current directory makes that path meaningful.

Remember:

```text
Absolute path
    ↓
Starts from filesystem root

Relative path
    ↓
Starts from current working directory
```

Understanding paths is fundamental to safe file operations.

---

# 3. Current Working Directory

The shell always has a current working directory.

You can inspect it using:

```bash
pwd
```

For example:

```text
/home/vineet/projects
```

Now consider:

```bash
rm config.yaml
```

Which `config.yaml`?

The command operates relative to the current working directory unless another path is specified.

Therefore:

```bash
pwd
```

is one of the most useful commands to run when you are unsure where you are.

---

# 4. Inspecting Directory Contents

The basic command for listing directory contents is:

```bash
ls
```

For example:

```bash
ls
```

might show:

```text
app.py
config.yaml
data
tests
```

You can also inspect a specific directory:

```bash
ls data
```

---

## 4.1 Detailed Listing

A common option is:

```bash
ls -l
```

This provides additional information about filesystem objects.

For example:

```text
-rw-r--r-- 1 user user  1250 Oct  8 10:30 app.py
drwxr-xr-x 2 user user  4096 Oct  8 10:31 tests
```

The exact output depends on the system.

At this stage, focus on identifying:

- Object type
- Permissions
- Owner
- Size
- Timestamp
- Name

Permissions are covered in detail in [05 — Users, Groups & Permissions](./05-Users-Groups-and-Permissions.md).

---

# 5. Hidden Files

Linux commonly treats names beginning with `.` as hidden files.

For example:

```text
.env
.gitignore
.config/
```

A normal:

```bash
ls
```

may not display them.

Use:

```bash
ls -a
```

to include hidden entries.

For example:

```text
.
..
.env
.gitignore
app.py
```

The entries:

```text
.
..
```

have special meanings.

- `.` → current directory
- `..` → parent directory

---

# 6. Creating Directories

Use:

```bash
mkdir directory-name
```

For example:

```bash
mkdir logs
```

creates:

```text
logs/
```

---

## 6.1 Creating Nested Directories

Suppose you want:

```text
project/
└── data/
    └── raw/
```

You can create the required directory structure with:

```bash
mkdir -p project/data/raw
```

The `-p` option allows the required parent directories to be created as needed.

This is useful when setting up project structures.

---

# 7. Creating Files

A common command for creating an empty file is:

```bash
touch file.txt
```

For example:

```bash
touch README.md
```

creates the file if it does not already exist.

The command can also update file timestamps when used on an existing file.

That distinction matters:

> `touch` is primarily a file timestamp utility, although it is commonly used to create empty files.

---

# 8. Creating a Project Structure

Suppose you are starting a small AI application.

You might create:

```bash
mkdir -p genai-app/app
mkdir -p genai-app/tests
mkdir -p genai-app/data
mkdir -p genai-app/config
```

Then:

```bash
touch genai-app/README.md
touch genai-app/requirements.txt
```

The result becomes:

```text
genai-app/
├── app/
├── tests/
├── data/
├── config/
├── README.md
└── requirements.txt
```

This is a simple example of using filesystem operations to construct a development environment.

---

# 9. Copying Files

Use:

```bash
cp source destination
```

For example:

```bash
cp config.yaml config.backup.yaml
```

Conceptually:

```text
config.yaml
     │
     ├────────► config.backup.yaml
     │
     └────────► original remains
```

Copying creates another filesystem object containing the copied data.

---

## 9.1 Copying to Another Directory

For example:

```bash
cp config.yaml backups/
```

The destination becomes:

```text
backups/
└── config.yaml
```

---

# 10. Copying Directories

Copying a directory requires recursive behavior.

For example:

```bash
cp -r project backup-project
```

Conceptually:

```text
project/
   │
   └──── copy recursively ────► backup-project/
```

The `-r` option tells the command to operate recursively through the directory contents.

Recursive operations deserve extra attention because one command can affect a large subtree.

---

# 11. Moving and Renaming

Linux commonly uses:

```bash
mv
```

for both moving and renaming.

To move a file:

```bash
mv app.py src/
```

To rename a file:

```bash
mv old-name.py new-name.py
```

Conceptually:

```text
old-name.py
     │
     │ rename
     ▼
new-name.py
```

The same command works for directories.

---

# 12. Why `mv` Can Mean Two Things

Consider:

```bash
mv file.txt backup/
```

This means:

```text
Move file.txt into backup/
```

But:

```bash
mv file.txt important.txt
```

means:

```text
Rename file.txt to important.txt
```

The destination determines the interpretation.

This is why understanding paths is more important than memorizing commands.

---

# 13. Removing Files

The command commonly used to remove files is:

```bash
rm file.txt
```

For example:

```bash
rm temporary.txt
```

removes the specified file.

Unlike moving a file to a recycle bin in many graphical environments, command-line removal may not provide an easy recovery mechanism.

Therefore:

> Treat `rm` as a potentially destructive operation.

---

# 14. Removing Directories

A directory containing files generally requires recursive removal:

```bash
rm -r directory-name
```

This means:

```text
directory
   │
   ├── file
   ├── file
   ├── subdirectory
   │     └── file
   │
   └── ...
        ↓
   recursively removed
```

This is powerful.

It is also dangerous.

---

# 15. Why Recursive Operations Require Caution

Consider:

```bash
rm -r project/
```

You are not removing one object conceptually.

You are potentially removing an entire subtree.

Therefore, before recursive deletion:

```text
1. Check where you are.
2. Check the target path.
3. Inspect its contents.
4. Confirm that deletion is intended.
5. Execute.
```

A good mental model is:

```text
Small command
     ↓
Potentially large effect
```

The shorter the command, the more important it may be to understand its scope.

---

# 16. Interactive Safety

For some operations, interactive confirmation can be useful.

For example:

```bash
rm -i file.txt
```

The command can ask for confirmation before removing the file.

This is useful when manually performing potentially destructive operations.

However, interactive behavior is usually undesirable in automated workflows where explicit deterministic behavior is required.

This illustrates an engineering trade-off:

```text
Interactive
→ safer for manual inspection

Non-interactive
→ easier to automate
```

The correct choice depends on context.

---

# 17. File Types

Not everything that appears in a directory is a regular file.

Linux can represent different filesystem object types.

Common examples include:

```text
Regular file
Directory
Symbolic link
Device
```

You can inspect an object using:

```bash
file filename
```

For example:

```bash
file app.py
```

might report that it is a Python source file.

You can also use:

```bash
ls -l
```

and inspect the first character of the permissions/type field.

For example:

```text
-rw-r--r--
```

starts with:

```text
-
```

indicating a regular file.

A directory commonly starts with:

```text
d
```

Detailed permissions belong to Chapter 05.

---

# 18. Symbolic Links

A symbolic link is a filesystem object that points to another path.

Conceptually:

```text
link
  │
  └────────► target
```

For example:

```text
current-model
      │
      └──────► models/v2
```

A symbolic link can provide another path through which an object can be accessed.

You can create one with:

```bash
ln -s target link-name
```

For example:

```bash
ln -s models/v2 current-model
```

Now:

```text
current-model → models/v2
```

Symbolic links are useful in development environments where a stable path needs to point to a changing version or location.

---

# 19. Why Symbolic Links Matter

Consider a deployment structure:

```text
models/
├── v1/
├── v2/
└── current -> v2
```

Applications can use:

```text
models/current
```

instead of hardcoding:

```text
models/v2
```

When the active version changes, the link can be updated.

This is a useful filesystem abstraction.

However, symbolic links can also create confusion when debugging paths.

Always determine whether you are dealing with:

```text
Actual object
```

or:

```text
Reference to another location
```

---

# 20. Reading File Content

Several command-line tools can inspect text files.

For example:

```bash
cat README.md
```

prints the file contents.

For larger files, tools such as:

```bash
less README.md
```

allow interactive viewing.

You may also inspect the beginning or end of a file with:

```bash
head README.md
```

and:

```bash
tail README.md
```

These commands become particularly useful when working with:

- Configuration
- Logs
- Source code
- Data files

---

# 21. Inspecting Files Without Editing Them

A useful engineering principle is:

> Inspect before modifying.

For example:

```bash
ls
file config.yaml
cat config.yaml
```

This is safer than immediately editing or deleting the file.

For larger files:

```bash
less config.yaml
```

allows you to inspect the content without changing it.

This principle becomes especially important on remote or production systems.

---

# 22. Searching for Files

When a project becomes large, manually navigating directories becomes inefficient.

Linux provides tools for searching.

One commonly used command is:

```bash
find
```

For example:

```bash
find . -name "*.py"
```

This searches from the current directory for Python files matching the pattern.

Conceptually:

```text
Current directory
      │
      ├── search subtree
      │
      ├── inspect names
      │
      └── return matches
```

---

# 23. Searching by File Type or Pattern

You can search using patterns.

For example:

```bash
find . -name "*.log"
```

may locate:

```text
./logs/app.log
./logs/error.log
./tests/test.log
```

You can also restrict the search to files using appropriate `find` options.

The important concept is:

```text
Search scope
   +
Search condition
   =
Matching filesystem objects
```

---

# 24. Finding Files by Name vs Searching Content

These are different problems.

### Find an object by name

```bash
find . -name "config.yaml"
```

### Search content

Tools such as:

```bash
grep
```

can search text inside files.

For example:

```bash
grep "ERROR" application.log
```

The distinction is:

```text
find
 ↓
Where is the file?

grep
 ↓
What text is inside the file?
```

This distinction is extremely useful when debugging.

---

# 25. File Operations and Pipes

File operations can be combined with the command-line composition model from Chapter 03.

For example:

```bash
find . -name "*.py" | wc -l
```

Conceptually:

```text
Find Python files
       │
       ▼
      pipe
       │
       ▼
Count results
```

The important lesson is not the exact command.

It is that filesystem tools can participate in larger command-line workflows.

---

# 26. Working With Project Files

A typical software project may look like:

```text
project/
├── src/
├── tests/
├── docs/
├── config/
├── data/
├── scripts/
├── .gitignore
├── README.md
└── pyproject.toml
```

A developer may frequently perform operations such as:

```bash
cd project
```

```bash
ls
```

```bash
mkdir experiments
```

```bash
cp config/example.yaml config/local.yaml
```

```bash
mv old_module.py src/new_module.py
```

The commands are simple.

The engineering challenge is maintaining a predictable project structure.

---

# 27. File Naming Matters

Good file naming reduces cognitive load.

Compare:

```text
x1.py
test2.py
newfinal.py
final_final.py
```

with:

```text
model_loader.py
test_embeddings.py
embedding_config.py
evaluation_pipeline.py
```

Good names communicate intent.

Useful principles include:

- Be descriptive.
- Avoid unnecessary abbreviations.
- Use consistent naming conventions.
- Avoid ambiguous names.
- Keep project naming consistent.

Filesystem organization is part of software engineering quality.

---

# 28. Hidden Configuration Files

Development projects often contain hidden files:

```text
.env
.gitignore
.editorconfig
```

These files may contain configuration or tooling rules.

For example:

```bash
ls -a
```

can reveal:

```text
.
..
.env
.gitignore
README.md
src
```

Be careful with hidden files.

Their visibility does not imply that they are unimportant.

---

# 29. The `.env` Example

A development project may contain:

```text
.env
```

with environment-specific configuration.

For example:

```text
DATABASE_URL=...
API_KEY=...
```

This chapter only treats `.env` as a filesystem object.

Environment variables and configuration management are covered in:

[08 — Environment Variables & Configuration](./08-Environment-Variables-and-Configuration.md)

The important filesystem lesson is:

> Hidden files are still files and can contain important application configuration.

---

# 30. File Operations in AI/GenAI Projects

AI engineering projects often deal with many filesystem objects.

For example:

```text
rag-system/
├── app/
├── data/
│   ├── raw/
│   ├── processed/
│   └── evaluation/
├── embeddings/
├── prompts/
├── models/
├── tests/
├── logs/
└── configs/
```

Typical operations include:

```text
Download dataset
       ↓
Store raw data
       ↓
Process data
       ↓
Store processed data
       ↓
Generate embeddings
       ↓
Store artifacts
       ↓
Run evaluation
       ↓
Inspect results
```

Good filesystem organization makes these workflows easier to understand and debug.

---

# 31. Avoid Mixing Different Data Lifecycles

A common project mistake is putting everything into one directory:

```text
project/
├── random.csv
├── output.json
├── model.pkl
├── test.py
├── temp.txt
├── final2.json
└── logs.txt
```

This quickly becomes difficult to maintain.

Instead, organize by purpose:

```text
project/
├── data/
├── models/
├── outputs/
├── logs/
├── scripts/
├── src/
└── tests/
```

The exact structure depends on the project.

The principle is:

> Organize files according to their role and lifecycle.

---

# 32. Temporary Files

Temporary files are common during development.

For example:

```text
/tmp
```

is commonly used for temporary data.

However, temporary storage should not automatically be treated as permanent application storage.

A useful distinction is:

```text
Temporary
   ↓
Can be recreated

Persistent
   ↓
Must survive beyond the current operation
```

This distinction becomes increasingly important in production systems.

---

# 33. File Operation Safety

Before performing a potentially destructive operation, verify:

### 1. Location

```bash
pwd
```

### 2. Target

```bash
ls
```

### 3. Exact path

```text
Is this the directory/file I intended?
```

### 4. Scope

```text
One file?
One directory?
Entire subtree?
```

### 5. Reversibility

```text
Can I recover this if I make a mistake?
```

### 6. Consequences

```text
Could another process depend on this file?
```

This is especially important on shared or remote systems.

---

# 34. Relative Paths and Scripts

Suppose your project contains:

```text
project/
├── app/
│   └── main.py
└── data/
    └── users.csv
```

A program may refer to:

```text
data/users.csv
```

But the meaning of that relative path depends on the process's current working directory.

This can create bugs such as:

```text
Works from my terminal
        ↓
Fails when started elsewhere
```

The problem may not be the file.

It may be the **working directory assumption**.

This is an important connection between:

- Filesystem
- Shell
- Processes
- Application design

---

# 35. Engineering Insight: Paths Are Contextual

Consider:

```text
data/users.csv
```

This does not uniquely identify a location by itself.

It means:

```text
data/users.csv
relative to the current working directory
```

Therefore:

```text
Path
+
Current context
=
Resolved location
```

This mental model explains many development bugs involving missing files.

---

# 36. Production Perspective

File operations become more sensitive in production.

A development mistake may mean:

```text
Wrong file deleted
```

A production mistake may mean:

```text
Service failure
Lost configuration
Deleted logs
Corrupted generated artifacts
Unavailable model
```

Production environments therefore require stronger controls around:

- Access
- Permissions
- Backups
- Deployment
- Configuration
- Data lifecycle
- Automation

This chapter only provides the filesystem-operation foundation.

Production infrastructure and operational controls are covered later in the curriculum.

---

# 37. Common Mistakes

## Mistake 1 — Forgetting the current directory

Running:

```bash
rm config.yaml
```

without checking:

```bash
pwd
```

can produce unexpected results.

---

## Mistake 2 — Confusing move and copy

```bash
cp
```

creates a copy.

```bash
mv
```

moves or renames.

---

## Mistake 3 — Using recursive commands without understanding scope

Commands such as:

```bash
rm -r
```

can affect entire directory trees.

---

## Mistake 4 — Ignoring hidden files

A normal:

```bash
ls
```

may not show important files.

Use:

```bash
ls -a
```

when appropriate.

---

## Mistake 5 — Assuming relative paths are universal

A path such as:

```text
data/file.csv
```

depends on the current working directory.

---

## Mistake 6 — Treating temporary files as permanent storage

Temporary locations may not provide the persistence guarantees required by an application.

---

## Mistake 7 — Mixing project artifacts without structure

Putting source code, datasets, logs, model artifacts, and temporary files together makes systems harder to understand.

---

# 38. Engineering Decisions

When managing files, consider the intent first.

### Need another copy?

Use:

```bash
cp
```

### Need to relocate something?

Use:

```bash
mv
```

### Need to rename something?

Use:

```bash
mv
```

### Need to create a directory?

Use:

```bash
mkdir
```

### Need to create an empty file?

Use:

```bash
touch
```

### Need to remove something?

Use:

```bash
rm
```

but verify scope first.

### Need to locate files?

Use:

```bash
find
```

### Need to inspect file contents?

Use:

```bash
cat
less
head
tail
```

### Need to determine what type of object something is?

Use:

```bash
file
```

The command is only half the decision.

The other half is:

> What effect do I want, and what is the safest way to achieve it?

---

# 39. A Practical File-Management Workflow

For unfamiliar projects, use this workflow:

```text
1. Locate yourself
       ↓
2. Inspect the directory
       ↓
3. Understand the project structure
       ↓
4. Identify the target
       ↓
5. Choose the operation
       ↓
6. Check the scope
       ↓
7. Execute
       ↓
8. Verify the result
```

For example:

```bash
pwd
```

then:

```bash
ls -la
```

then inspect the relevant path.

After a change:

```bash
ls
```

or another appropriate inspection command can verify the result.

This simple habit prevents many mistakes.

---

# 40. Interview Perspective

You should be able to explain these clearly.

### Question 1

**What is the difference between an absolute and relative path?**

Explain where each path begins and why relative paths depend on the current working directory.

---

### Question 2

**What is the difference between `cp` and `mv`?**

Explain copying versus moving/renaming.

---

### Question 3

**How do you copy a directory?**

Explain recursive copying and why recursion matters.

---

### Question 4

**Why is `rm -r` dangerous?**

Because it can recursively remove an entire directory tree.

---

### Question 5

**How do you view hidden files?**

Use:

```bash
ls -a
```

---

### Question 6

**What does `.` mean in a path?**

The current directory.

---

### Question 7

**What does `..` mean?**

The parent directory.

---

### Question 8

**How would you find all Python files under the current directory?**

A common approach is:

```bash
find . -name "*.py"
```

---

### Question 9

**What is a symbolic link?**

A filesystem object that references another path.

---

### Question 10

**Why can a relative file path work from one location but fail from another?**

Because its meaning depends on the process's current working directory.

---

# 41. Quick Revision

Remember the core commands:

```text
pwd
↓
Current directory

ls
↓
List directory contents

ls -a
↓
Include hidden entries

mkdir
↓
Create directory

mkdir -p
↓
Create directory hierarchy

touch
↓
Create/update file timestamp

cp
↓
Copy

cp -r
↓
Copy recursively

mv
↓
Move or rename

rm
↓
Remove

rm -r
↓
Remove recursively

file
↓
Inspect file type

find
↓
Search for filesystem objects

cat
↓
Print file contents

less
↓
Inspect content interactively

head
↓
Inspect beginning

tail
↓
Inspect end

ln -s
↓
Create symbolic link
```

And remember the safety model:

```text
Where am I?
     ↓
What is the target?
     ↓
What is the scope?
     ↓
What will happen?
     ↓
Execute
     ↓
Verify
```

---

# 42. Key Takeaways

1. Files and directories are fundamental building blocks of Linux development environments.
2. Paths identify filesystem locations.
3. Absolute paths begin from `/`; relative paths depend on the current working directory.
4. `pwd` and `ls` are foundational inspection commands.
5. `mkdir` creates directories and `touch` can create empty files.
6. `cp` copies objects while `mv` moves or renames them.
7. `rm` is potentially destructive and recursive deletion requires particular caution.
8. Hidden files are commonly identified by names beginning with `.`.
9. Symbolic links provide references to other filesystem paths.
10. `find` helps locate filesystem objects by conditions such as name.
11. Finding a file and searching its contents are different tasks.
12. Relative paths can create application bugs when working-directory assumptions change.
13. Project files should be organized according to purpose and lifecycle.
14. Good filesystem management is not just about commands; it is about understanding scope, impact, and reversibility.
15. Safe engineers inspect before mutating and verify after changing.

---

## 43. Further Reading

Recommended references:

- Linux manual pages for `ls`, `cp`, `mv`, `rm`, `find`, `file`, `ln`, and `mkdir`
- GNU Coreutils documentation
- Linux filesystem documentation
- Bash documentation for pathname expansion and command behavior

When learning a new command, practice this workflow:

```text
man command
      ↓
Understand syntax
      ↓
Try a safe example
      ↓
Observe output
      ↓
Use it in a real workflow
```

---

# 44. Connection to the Next Chapter

You now know how to work with files and directories from the command line.

But an important question remains:

> Why can one user modify a file while another user cannot?

That leads to one of Linux's most important security and collaboration mechanisms:

```text
Users
Groups
Permissions
Ownership
```

Continue with:

**[05 — Users, Groups & Permissions](./05-Users-Groups-and-Permissions.md)**

---

# End of Document

This completes the Markdown file:

`04-Files-Directories-and-File-Operations.md`

All parts can now be combined into a single production-ready Markdown document for the GitHub repository.
