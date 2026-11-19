# 11 — Shell Scripting Fundamentals

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain why shell scripting exists.
- Understand the relationship between a shell, commands, and a shell script.
- Create and execute a basic shell script.
- Use variables in shell scripts.
- Accept command-line arguments.
- Use exit statuses to detect success and failure.
- Use conditional statements.
- Use loops for repetitive operations.
- Understand basic functions.
- Combine commands safely into useful automation workflows.
- Understand quoting and basic shell expansion.
- Write scripts that are readable and maintainable.
- Handle common errors and failure conditions.
- Recognize when shell scripting is appropriate and when another language is better.
- Apply shell scripting to practical software and GenAI engineering workflows.

---

## Prerequisites

You should already understand:

- Linux fundamentals
- Linux filesystem
- Shell and command-line usage
- Files and directories
- Processes
- Environment variables and configuration
- Development environment setup
- Virtual environments and dependency isolation

Recommended previous chapters:

- [03 — Shell & Command Line](./03-Shell-and-Command-Line.md)
- [04 — Files, Directories & File Operations](./04-Files-Directories-and-File-Operations.md)
- [06 — Processes & Process Management](./06-Processes-and-Process-Management.md)
- [08 — Environment Variables & Configuration](./08-Environment-Variables-and-Configuration.md)
- [09 — Development Environment Setup](./09-Development-Environment-Setup.md)
- [10 — Virtual Environments & Dependency Isolation](./10-Virtual-Environments-and-Dependency-Isolation.md)

This chapter builds on shell and command-line concepts from Chapter 03 rather than re-teaching them.

---

## Estimated Reading Time

**30–35 minutes**

---

## Before We Start

Imagine you repeatedly perform the same workflow:

```bash
cd my-project
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m pytest
python app.py
```

You can execute these commands manually.

But if you perform the same workflow every day, manually repeating it creates opportunities for:

- typing mistakes
- forgotten steps
- inconsistent execution
- wasted time

Instead, you can put the commands into a script.

```bash
./run-project.sh
```

Now the repeated workflow becomes executable automation.

This is the fundamental purpose of shell scripting:

> **Turn a sequence of shell operations into a repeatable program.**

---

# Why Shell Scripting Exists

A shell is designed to let humans interact with the operating system.

A shell script extends that capability by allowing those interactions to be automated.

Without a script:

```text
Human
  │
  ├── type command
  ├── inspect result
  ├── type next command
  ├── inspect result
  └── repeat
```

With a script:

```text
Human
  │
  ▼
Shell Script
  │
  ├── command
  ├── command
  ├── condition
  ├── command
  └── result
```

The human defines the workflow once.

The shell executes it repeatedly.

---

# Mental Model: A Shell Script Is a Program

A shell script is not simply a text file containing random commands.

It is a small program interpreted by a shell.

```text
Shell Script
     │
     ▼
Shell Interpreter
     │
     ├── command
     ├── variable
     ├── condition
     ├── loop
     └── function
     │
     ▼
Operating System
```

This means shell scripting has programming concepts.

You will encounter:

- variables
- expressions
- conditions
- loops
- functions
- arguments
- exit statuses
- input/output
- error handling

The language is simply designed around command execution and operating-system interaction.

---

# What Is a Shell?

A shell is a program that interprets commands.

Examples include:

```text
Bash
Zsh
sh
Fish
```

This chapter uses **Bash-style scripting** because Bash is widely available in Linux development environments.

The concepts should not be assumed to behave identically in every shell.

For example:

```bash
#!/usr/bin/env bash
```

explicitly indicates that the script is intended for Bash.

---

# Your First Shell Script

Create a file:

```text
hello.sh
```

Add:

```bash
#!/usr/bin/env bash

echo "Hello, Linux!"
```

The first line is called a **shebang**.

```bash
#!/usr/bin/env bash
```

It tells the system which interpreter should be used when the script is executed directly.

---

# Making a Script Executable

A script can be executed through Bash:

```bash
bash hello.sh
```

Alternatively, make it executable:

```bash
chmod +x hello.sh
```

Then:

```bash
./hello.sh
```

The two approaches differ slightly.

### Explicit interpreter

```bash
bash hello.sh
```

You are explicitly asking Bash to interpret the file.

### Direct execution

```bash
./hello.sh
```

The operating system uses the script's shebang to determine the interpreter.

This connects shell scripting with the permissions concepts from [05 — Users, Groups & Permissions](./05-Users-Groups-and-Permissions.md).

---

# Script Execution Flow

When you run:

```bash
./hello.sh
```

the conceptual flow is:

```text
Shell
  │
  ▼
Operating System
  │
  ▼
Executable Script
  │
  ▼
Shebang
  │
  ▼
Bash
  │
  ▼
Commands
  │
  ▼
Results
```

Understanding this helps explain why both permissions and interpreter selection matter.

---

# Commands in a Script

A script can contain normal shell commands.

For example:

```bash
#!/usr/bin/env bash

pwd
ls
echo "Starting application"
```

The shell processes the commands in sequence.

Conceptually:

```text
Command 1
   ↓
Command 2
   ↓
Command 3
```

Unless control flow changes the sequence, commands execute in order.

---

# Variables

Shell scripts can store values in variables.

```bash
name="Vineet"
```

Then:

```bash
echo "$name"
```

produces:

```text
Vineet
```

Notice the syntax:

```bash
name="Vineet"
```

There should not be spaces around `=`.

This is valid:

```bash
name="Vineet"
```

This is not:

```bash
name = "Vineet"
```

Shell syntax has its own rules.

---

# Why Quote Variables?

Prefer:

```bash
echo "$name"
```

over:

```bash
echo $name
```

Quoting prevents unintended word splitting and expansion in many situations.

Consider:

```bash
project_dir="/home/user/my project"
```

Without appropriate quoting:

```bash
cd $project_dir
```

can be interpreted as multiple words.

With:

```bash
cd "$project_dir"
```

the entire path is treated as one argument.

A strong shell-scripting habit is:

> **Quote variable expansions unless you intentionally need shell splitting or another form of expansion.**

---

# Environment Variables in Scripts

Shell scripts can read environment variables.

For example:

```bash
#!/usr/bin/env bash

echo "Environment: $APP_ENV"
```

If the shell has:

```bash
export APP_ENV=development
```

then the script can access it.

This connects directly to:

[08 — Environment Variables & Configuration](./08-Environment-Variables-and-Configuration.md)

The script becomes configurable without hardcoding environment-specific values.

---

# Local Variables vs Environment Variables

Consider:

```bash
APP_ENV=development
```

This creates a shell variable.

To make it available to child processes:

```bash
export APP_ENV=development
```

For example:

```bash
export APP_ENV=development
python app.py
```

The Python process receives the variable.

This relationship is important:

```text
Shell Script
     │
     │ exported environment
     ▼
Child Process
     │
     ▼
Application
```

---

# Command Substitution

A script can capture command output.

For example:

```bash
current_dir="$(pwd)"
```

Now:

```bash
echo "$current_dir"
```

prints the directory.

The structure is:

```text
$(command)
```

The command runs and its output becomes part of the surrounding expression.

For example:

```bash
python_version="$(python --version 2>&1)"
```

Command substitution is useful when a script needs information produced by another command.

---

# Command Arguments

Scripts can receive arguments.

Suppose:

```bash
#!/usr/bin/env bash

echo "Project: $1"
```

Run:

```bash
./script.sh vivahai
```

Output:

```text
Project: vivahai
```

Here:

```text
$1
```

means the first positional argument.

Common positional parameters include:

```text
$1
$2
$3
...
```

And:

```text
$0
```

typically represents the script name.

---

# Number of Arguments

The special variable:

```bash
$#
```

contains the number of positional arguments.

For example:

```bash
echo "Arguments: $#"
```

Run:

```bash
./script.sh one two three
```

Output:

```text
Arguments: 3
```

This allows scripts to validate whether the caller supplied the expected inputs.

---

# All Arguments

Two common forms are:

```bash
"$@"
```

and:

```bash
"$*"
```

They do not behave identically.

For most scripts that need to process arguments individually, prefer:

```bash
"$@"
```

For example:

```bash
for arg in "$@"; do
    echo "$arg"
done
```

This preserves arguments as separate values.

The distinction becomes particularly important when arguments contain spaces.

---

# Exit Status

Every command produces an exit status.

By convention:

```text
0
```

means success.

A non-zero value generally indicates failure.

For example:

```bash
ls /tmp
echo $?
```

If `ls` succeeds:

```text
0
```

If it fails:

```text
non-zero value
```

This is one of the most important concepts in shell automation.

---

# Why Exit Status Matters

Consider:

```bash
create_environment
install_dependencies
run_tests
```

If dependency installation fails, you probably do not want the script to continue as if everything succeeded.

The script needs to reason about command success.

```text
Command
   │
   ▼
Exit Status
   │
 ┌─┴────────┐
 ▼          ▼
Success    Failure
 │           │
Continue    Stop/handle
```

Exit statuses are the foundation of shell-script error handling.

---

# Using `&&`

Commands can be chained using:

```bash
command1 && command2
```

The second command runs only if the first succeeds.

For example:

```bash
python -m pip install -r requirements.txt && python -m pytest
```

Conceptually:

```text
Install dependencies
       │
       ├── success → run tests
       │
       └── failure → do not run tests
```

This is useful for simple command chains.

---

# Using `||`

You can also use:

```bash
command1 || command2
```

The second command runs if the first command fails.

For example:

```bash
test -f config.yaml || echo "Configuration file missing"
```

This can be useful for simple fallback or diagnostic behavior.

However, long chains of `&&` and `||` can become difficult to read.

For more complex logic, use explicit conditional statements.

---

# Conditional Statements

A Bash conditional commonly looks like:

```bash
if command; then
    echo "Success"
else
    echo "Failure"
fi
```

For example:

```bash
if [ -f "config.yaml" ]; then
    echo "Configuration exists"
else
    echo "Configuration is missing"
fi
```

The structure is:

```text
if
  │
  ├── condition
  │
  ├── then → success branch
  │
  └── else → alternative branch
```

---

# File Tests

Shell scripts frequently need to check filesystem state.

Common tests include:

```bash
-f file
```

for a regular file.

```bash
-d directory
```

for a directory.

```bash
-e path
```

for an existing path.

For example:

```bash
if [ -d ".venv" ]; then
    echo "Virtual environment exists"
fi
```

This is useful for development automation.

---

# String Conditions

Scripts may also compare strings.

For example:

```bash
if [ "$APP_ENV" = "production" ]; then
    echo "Production environment"
fi
```

Notice the quotes around the variable.

If the variable is empty or contains spaces, unquoted expressions can produce unexpected behavior.

---

# Numeric Conditions

Numeric comparisons use different operators.

For example:

```bash
if [ "$count" -gt 10 ]; then
    echo "Large count"
fi
```

Common operators include:

```text
-eq    equal
-ne    not equal
-gt    greater than
-ge    greater than or equal
-lt    less than
-le    less than or equal
```

Do not confuse these with string comparisons.

---

# Loops

Scripts often automate repetitive operations.

A `for` loop is useful when processing a collection.

For example:

```bash
for file in *.log; do
    echo "$file"
done
```

Conceptually:

```text
Collection
   │
   ▼
Item 1 → process
Item 2 → process
Item 3 → process
...
```

---

# Looping Over Arguments

You can process script arguments:

```bash
for arg in "$@"; do
    echo "Argument: $arg"
done
```

Run:

```bash
./script.sh one two three
```

Output:

```text
Argument: one
Argument: two
Argument: three
```

This is useful when a script needs to process multiple inputs.

---

# While Loops

A `while` loop repeats while a condition remains true.

For example:

```bash
count=1

while [ "$count" -le 3 ]; do
    echo "Attempt $count"
    count=$((count + 1))
done
```

Output:

```text
Attempt 1
Attempt 2
Attempt 3
```

While loops are useful when the number of iterations depends on a changing condition.

---

# Avoid Accidental Infinite Loops

Consider:

```bash
count=1

while [ "$count" -le 3 ]; do
    echo "$count"
done
```

`count` never changes.

The condition remains true.

The loop may continue indefinitely.

Always reason about:

```text
Initial state
     ↓
Condition
     ↓
Body
     ↓
State change
     ↓
Condition again
```

If the state never moves toward termination, you may have an infinite loop.

---

# Functions

Functions allow you to group related operations.

For example:

```bash
run_tests() {
    python -m pytest
}
```

Then:

```bash
run_tests
```

Functions help avoid repeating the same command sequence.

A larger script might contain:

```bash
check_environment() {
    ...
}

install_dependencies() {
    ...
}

run_tests() {
    ...
}

main() {
    ...
}

main
```

This structure can make automation easier to understand.

---

# Why Functions Matter

Without functions:

```text
long sequence
long sequence
long sequence
```

With functions:

```text
main
 │
 ├── check_environment
 ├── install_dependencies
 └── run_tests
```

The script starts to communicate intent.

This is an important software-engineering principle:

> **Good automation should express what it is doing, not merely contain a long list of commands.**

---

# A Practical Development Script

Consider a project setup script:

```bash
#!/usr/bin/env bash

echo "Creating virtual environment..."

python3 -m venv .venv

echo "Installing dependencies..."

source .venv/bin/activate

python -m pip install -r requirements.txt

echo "Running tests..."

python -m pytest
```

This turns several manual steps into one workflow.

However, this version still has weaknesses.

What happens if:

- Python is missing?
- virtual-environment creation fails?
- `requirements.txt` does not exist?
- dependency installation fails?
- tests fail?

A production-quality script should reason about these failure cases.

---

# Fail-Fast Behavior

A common Bash practice is:

```bash
set -e
```

This instructs the shell to exit when a command fails under the shell's error-handling rules.

For many straightforward automation scripts, a common starting point is:

```bash
#!/usr/bin/env bash

set -e
```

Now:

```text
Command 1
   ↓
failure
   ↓
script stops
```

This can prevent later commands from executing on a broken state.

However, `set -e` has nuanced behavior in Bash.

Do not treat it as a complete error-handling system.

Complex scripts may need explicit status handling.

---

# A Safer Script Pattern

For many engineering scripts, you will commonly see:

```bash
#!/usr/bin/env bash

set -euo pipefail
```

This combines three shell options:

```text
-e
  Exit when an applicable command fails.

-u
  Treat unset variables as errors in many contexts.

-o pipefail
  Make a pipeline reflect failure from commands within it rather than only the final command.
```

This is a useful baseline for Bash automation.

But it is not magic.

You still need to understand exceptions, intentional failures, command substitution, pipelines, and input handling.

---

# Why `set -u` Matters

Consider:

```bash
echo "$DATABASE_URL"
```

If the variable is not defined, behavior may not be what you intended.

With:

```bash
set -u
```

referencing an unset variable can cause the script to fail.

This helps reveal configuration mistakes earlier.

For example:

```bash
if [ -z "${DATABASE_URL:-}" ]; then
    echo "DATABASE_URL is required"
    exit 1
fi
```

This explicitly handles the missing configuration case.

---

# Why `pipefail` Matters

Consider:

```bash
command1 | command2
```

Without careful handling, the pipeline's final status may hide a failure in an earlier command.

With:

```bash
set -o pipefail
```

the pipeline can report failure when an earlier component fails.

This is particularly useful in automation where a silent pipeline failure could cause incorrect results.

---

# Explicit Error Messages

A good script should help the engineer understand what failed.

Instead of:

```text
command failed
```

prefer:

```bash
echo "ERROR: dependency installation failed"
```

For example:

```bash
if ! python -m pip install -r requirements.txt; then
    echo "ERROR: Failed to install project dependencies."
    exit 1
fi
```

The script now communicates:

```text
Failure
  ↓
Reason
  ↓
Action taken
```

---

# `exit`

A script can explicitly return an exit status:

```bash
exit 0
```

for success.

And:

```bash
exit 1
```

for failure.

For example:

```bash
if [ ! -f "requirements.txt" ]; then
    echo "ERROR: requirements.txt not found."
    exit 1
fi
```

Now another process calling the script can detect failure.

This makes shell scripts useful as building blocks in larger automation systems.

---

# Script Exit Status

Suppose:

```bash
./setup.sh
echo $?
```

If the script succeeds:

```text
0
```

If it ends with:

```bash
exit 1
```

the caller receives:

```text
1
```

This creates a contract:

```text
Script
  │
  ▼
Exit status
  │
  ├── 0 → success
  └── non-zero → failure
```

Other tools can use this status to decide what happens next.

---

# Input Validation

Scripts should validate important inputs.

Suppose:

```bash
./deploy.sh production
```

You may want to allow only known environments:

```bash
if [ "$1" != "development" ] && [ "$1" != "production" ]; then
    echo "ERROR: Unsupported environment."
    exit 1
fi
```

The general principle is:

> **Validate external input before using it.**

This applies to:

- command-line arguments
- environment variables
- filenames
- user input
- generated values

---

# Quoting and Safety

Shell is powerful partly because it performs expansion.

That power also creates risks.

For example:

```bash
rm -rf "$directory"
```

is very different from:

```bash
rm -rf $directory
```

Quoting helps preserve the intended argument boundary.

A good default rule is:

```bash
"$variable"
```

when passing a variable as one argument.

Be especially careful around destructive commands:

```bash
rm
mv
cp
chmod
chown
```

A script that automatically performs destructive operations should be designed conservatively.

---

# Globbing

Shells support filename patterns.

For example:

```bash
*.log
```

may expand to:

```text
app.log
error.log
server.log
```

This is useful:

```bash
for file in *.log; do
    echo "$file"
done
```

But globbing has edge cases.

If no file matches, the behavior depends on shell configuration.

Do not assume that:

```bash
*.log
```

always means "every log file."

Understand how your shell handles unmatched patterns when writing robust automation.

---

# Command Substitution vs Variable Expansion

These are different.

### Variable expansion

```bash
"$name"
```

gets the value of a variable.

### Command substitution

```bash
"$(pwd)"
```

runs a command and uses its output.

Mental model:

```text
$name
   ↓
stored value

$(command)
   ↓
command output
```

Keeping these concepts separate makes shell scripts easier to reason about.

---

# Shell Script Example: Environment Validation

Consider:

```bash
#!/usr/bin/env bash

set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
    echo "ERROR: DATABASE_URL is not configured."
    exit 1
fi

if [ -z "${API_KEY:-}" ]; then
    echo "ERROR: API_KEY is not configured."
    exit 1
fi

echo "Required configuration is available."
```

This script does not print the actual secrets.

It checks only whether the values are present.

That is an important operational practice.

---

# Shell Script Example: Development Workflow

A useful development helper might look like:

```bash
#!/usr/bin/env bash

set -euo pipefail

if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi

echo "Activating environment..."
source .venv/bin/activate

echo "Installing dependencies..."
python -m pip install -r requirements.txt

echo "Running tests..."
python -m pytest

echo "Development checks completed."
```

The script expresses a clear workflow:

```text
Check
  ↓
Create if necessary
  ↓
Activate
  ↓
Install
  ↓
Test
```

This builds directly on the previous chapter.

---

# Shell Scripts and Idempotency

A useful automation property is **idempotency**.

An operation is idempotent when running it repeatedly produces the same intended final state rather than continuously creating unwanted changes.

Consider:

```bash
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
fi
```

The script does not recreate the environment every time.

It checks the current state first.

This is better than blindly performing:

```bash
python3 -m venv .venv
```

every time.

The broader principle is:

> **Good automation checks state before changing state.**

---

# Shell Scripts Should Have Clear Responsibilities

Avoid creating one giant script that:

```text
installs OS packages
configures users
modifies permissions
creates databases
deploys applications
deletes files
runs tests
starts servers
```

A giant script becomes difficult to understand and risky to execute.

Prefer focused scripts.

For example:

```text
scripts/
├── setup-dev.sh
├── test.sh
└── run.sh
```

Each script has a clear responsibility.

---

# Shell Scripting in GenAI Engineering

Shell scripts are particularly useful around GenAI projects because development workflows often contain repeated commands.

For example:

```text
Create environment
Install dependencies
Run tests
Run linting
Start API
Start worker
Check local services
```

A project might have:

```text
scripts/
├── setup.sh
├── test.sh
├── lint.sh
└── run.sh
```

For example:

```bash
./scripts/test.sh
```

can provide one consistent entry point for testing.

This reduces the number of commands developers need to remember.

---

# Shell Scripting for Model Experiments

Suppose you repeatedly run:

```bash
python experiments/embed_profiles.py
python experiments/evaluate.py
python experiments/generate_report.py
```

A script can make the workflow explicit:

```bash
#!/usr/bin/env bash

set -euo pipefail

python experiments/embed_profiles.py
python experiments/evaluate.py
python experiments/generate_report.py
```

Now:

```bash
./scripts/run-evaluation.sh
```

represents the complete workflow.

This is useful when an experiment has multiple dependent stages.

---

# Shell Scripting and Logs

Scripts can redirect output.

For example:

```bash
./run.sh > output.log 2>&1
```

This combines standard output and standard error into a file.

Or:

```bash
./run.sh > output.log
```

captures standard output while standard error remains separate.

This connects directly to the standard streams introduced in [03 — Shell & Command Line](./03-Shell-and-Command-Line.md).

---

# Shell Scripting and Processes

A script can start processes:

```bash
python app.py
```

It can also run commands in the background:

```bash
python worker.py &
```

The shell then continues rather than waiting for the background process to finish.

However, background-process management becomes increasingly complex as the system grows.

Do not turn a simple shell script into an improvised process supervisor.

For production process management, use appropriate infrastructure and process-management systems.

---

# When Shell Scripting Is a Good Choice

Shell scripts are excellent for tasks involving:

- filesystem operations
- command orchestration
- development setup
- test execution
- build commands
- environment checks
- simple automation
- invoking existing CLI tools
- chaining system utilities

For example:

```text
Create environment
    ↓
Install dependencies
    ↓
Run tests
    ↓
Start application
```

This is a natural shell workflow.

---

# When Shell Scripting Is Not the Best Choice

Shell becomes less attractive when the logic requires:

- complex data structures
- extensive parsing
- complicated error handling
- large algorithms
- complex APIs
- substantial business logic
- cross-platform behavior
- sophisticated testing

For such tasks, Python or another general-purpose programming language may be more appropriate.

A useful engineering rule is:

> **Use shell to orchestrate tools; use a general-purpose language for substantial application logic.**

This is a guideline, not an absolute law.

---

## Shell Script vs Python Script

Consider:

```text
Task:
Find project files → run tool → collect results → summarize output
```

Shell may be appropriate:

```text
find
  ↓
tool
  ↓
grep
  ↓
awk
```

But if you need:

```text
Parse complex JSON
Validate schemas
Build nested data structures
Call multiple APIs
Apply complicated business rules
```

Python may be a better choice.

The important engineering question is:

> **Which language makes the workflow easiest to understand, test, and maintain?**

---

# Portability Considerations

Shell scripts are not automatically portable across every operating system.

A script written for Bash may depend on:

- Bash-specific syntax
- Linux commands
- GNU utilities
- filesystem layout
- command options

For example:

```bash
#!/usr/bin/env bash
```

communicates that the script expects Bash.

If portability matters, define the supported environment explicitly.

Do not assume:

```text
"shell script"
```

means:

```text
"works everywhere"
```

---

# Common Mistakes

## Mistake 1 — Forgetting the Shebang

A script intended for Bash should clearly identify its interpreter when direct execution is expected.

```bash
#!/usr/bin/env bash
```

---

## Mistake 2 — Forgetting Execute Permission

If you run:

```bash
./script.sh
```

the file needs appropriate execute permission.

```bash
chmod +x script.sh
```

---

## Mistake 3 — Not Quoting Variables

Prefer:

```bash
"$file"
```

instead of:

```bash
$file
```

when the value should be treated as one argument.

---

## Mistake 4 — Ignoring Exit Statuses

A script that continues after a critical command fails may produce misleading results.

Always consider:

```text
What happens if this command fails?
```

---

## Mistake 5 — Assuming `set -e` Solves Everything

`set -e` is useful but Bash error-handling behavior has subtleties.

Complex scripts require deliberate error handling.

---

## Mistake 6 — Printing Secrets

Avoid:

```bash
echo "$API_KEY"
```

during debugging.

Secrets can end up in:

- terminal history
- logs
- CI output
- screenshots
- monitoring systems

---

## Mistake 7 — Writing One Giant Script

Large scripts become difficult to test and understand.

Prefer focused responsibilities.

---

## Mistake 8 — Using Shell for Complex Business Logic

Shell is powerful, but it is not always the right language.

Use a general-purpose language when complexity grows.

---

## Mistake 9 — Unsafe Destructive Commands

Be extremely careful with:

```bash
rm -rf
```

especially when variables are involved.

Always understand the exact path being passed to a destructive command.

---

## Mistake 10 — Assuming the Current Directory

A script that assumes:

```text
"I am always running from the project root."
```

may fail when invoked from another directory.

Scripts should deliberately handle their working directory when necessary.

---

# Engineering Decisions

When writing a shell script, ask:

### 1. What is the script's responsibility?

Define one clear job.

---

### 2. What inputs does it accept?

Examples:

```text
arguments
environment variables
files
directories
```

Document required inputs.

---

### 3. What happens when something fails?

Define:

```text
continue?
retry?
skip?
stop?
return non-zero?
```

Do not leave failure behavior accidental.

---

### 4. Is the script safe to run repeatedly?

Prefer checking state before making changes.

---

### 5. Does the script expose secrets?

Review:

```text
echo
logs
command arguments
error messages
temporary files
```

---

### 6. Is shell the correct language?

If the script is becoming a complicated program, consider moving the logic to Python or another suitable language.

---

### 7. Can another engineer understand it?

A script should communicate intent through:

- clear names
- small functions
- meaningful output
- comments where necessary
- predictable behavior

---

# Production Perspective

Shell scripting is common in engineering environments, but production systems require caution.

A shell script may be useful for:

```text
development setup
testing
build steps
diagnostics
small operational tasks
```

But production infrastructure should not depend on a fragile collection of undocumented shell commands.

As systems become more complex, specialized tools provide stronger guarantees around:

- deployment
- process management
- infrastructure
- configuration
- orchestration
- observability

Those topics belong to later production modules.

The important lesson here is:

> **Shell scripting is a useful automation layer, not a replacement for every engineering system.**

---

# A Practical Shell-Scripting Review

Before committing a script, ask:

```text
[ ] Is the interpreter explicit?
[ ] Is the script executable when necessary?
[ ] Are variables quoted appropriately?
[ ] Are inputs validated?
[ ] Are exit statuses handled?
[ ] Are failures understandable?
[ ] Are secrets protected?
[ ] Are destructive operations safe?
[ ] Is repeated execution safe?
[ ] Is the script's responsibility clear?
[ ] Is Bash actually required?
[ ] Would Python be easier to maintain?
```

---

# Shell Script Mental Model

Keep this model:

```text
                SHELL SCRIPT
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
       Inputs     Commands    Logic
          │          │          │
          └──────────┼──────────┘
                     ▼
                OS / Tools
                     │
                     ▼
                Exit Status
```

A good script:

1. accepts controlled inputs,
2. performs predictable operations,
3. handles failure,
4. communicates useful results,
5. returns an appropriate exit status.

---

# Interview Questions

## Conceptual

1. What is a shell script?
2. What is the purpose of a shebang?
3. What happens when you execute `./script.sh`?
4. What is the difference between a shell variable and an environment variable?
5. What are positional parameters?
6. What does `$?` represent?
7. Why is exit status important?
8. What is command substitution?
9. What is the purpose of quoting variables?
10. What does `set -euo pipefail` attempt to achieve?

## Engineering

11. When would you choose Bash over Python for automation?
12. How would you make a shell script safe to run repeatedly?
13. How would you validate required environment variables?
14. How would you prevent a failed dependency installation from allowing later steps to continue?
15. How would you design a shell script for developer onboarding?
16. What kinds of tasks should not be implemented as shell scripts?
17. How would you debug a shell script that behaves differently when run from different directories?

## Scenario

You are asked to create:

```bash
./scripts/setup.sh
```

for a Python GenAI project.

It should:

1. Verify Python exists.
2. Create `.venv` if necessary.
3. Activate the environment.
4. Install dependencies.
5. Validate required configuration.
6. Run tests.
7. Return a non-zero exit code if any critical step fails.

Before writing the script, describe the design.

A strong engineering answer should identify:

```text
Inputs
  ↓
Preconditions
  ↓
Environment creation
  ↓
Dependency installation
  ↓
Configuration validation
  ↓
Testing
  ↓
Exit status
```

The objective is not merely to produce a working script.

The objective is to produce **safe, repeatable automation**.

---

# Quick Revision

### Shell script

A program interpreted by a shell.

### Shebang

Specifies the intended interpreter for direct script execution.

```bash
#!/usr/bin/env bash
```

### Positional argument

Input supplied to the script:

```text
$1
$2
...
```

### Exit status

Numeric result indicating command or script success/failure.

```text
0     → success
non-0 → failure
```

### Conditional

Allows a script to choose behavior based on a condition.

### Loop

Repeats a workflow over items or while a condition remains true.

### Function

Groups related commands into a reusable logical unit.

### Idempotency

Repeated execution leads to the same intended final state rather than accumulating unintended changes.

### `set -euo pipefail`

A commonly used Bash safety baseline for detecting several classes of failure more reliably.

---

# Key Takeaways

1. Shell scripting turns repeatable command-line workflows into executable automation.
2. A shell script is a program, not merely a collection of commands.
3. The shebang identifies the intended interpreter.
4. Shell variables and environment variables have different roles.
5. Scripts can receive command-line arguments through positional parameters.
6. Exit statuses provide a basic success/failure contract.
7. Conditions and loops allow scripts to make decisions and automate repetition.
8. Functions help structure larger scripts.
9. Quoting variables is an important shell-safety habit.
10. `set -euo pipefail` is a useful Bash baseline, but it does not eliminate the need for deliberate error handling.
11. Good scripts validate inputs and fail clearly.
12. Good automation checks state before changing state.
13. Scripts should avoid exposing secrets.
14. Shell is excellent for command orchestration and lightweight automation.
15. Complex application logic is often better implemented in Python or another general-purpose language.
16. A good shell script should be predictable, understandable, repeatable, and safe.

---

## Further Reading

Useful areas for deeper study:

- Bash documentation
- Shell parameter expansion
- Bash quoting and word splitting
- Bash functions
- Shell error handling
- Process substitution
- Shell debugging
- `shellcheck`
- POSIX shell
- Command-line interface design

Advanced shell programming is intentionally outside the scope of this chapter.

---

## Connection to the Next Chapter

The Linux development environment is now becoming a complete engineering workspace:

```text
Linux
  ↓
Filesystem
  ↓
Shell
  ↓
Files
  ↓
Permissions
  ↓
Processes
  ↓
Packages
  ↓
Configuration
  ↓
Development Environment
  ↓
Virtual Environments
  ↓
Shell Automation
```

The next major capability is understanding how software communicates across machines.

Applications increasingly depend on:

```text
APIs
databases
Redis
vector databases
LLM services
cloud services
remote hosts
```

To work effectively with these systems, an engineer needs a practical understanding of Linux networking.

The next chapter introduces:

[12 — Linux Networking Basics](./12-Linux-Networking-Basics.md)

It will focus on the networking concepts required by a software and GenAI engineer without turning into an advanced networking or network-administration course.

---

# End of Document

This completes the Markdown file:

`11-Shell-Scripting-Fundamentals.md`

All parts can now be combined into a single production-ready Markdown document for the GitHub repository.
