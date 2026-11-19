# 13 — Logs & System Troubleshooting

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain why logs are essential for understanding system behavior.
- Distinguish application logs from system and command output.
- Read, filter, search, and follow logs effectively.
- Classify failures before attempting fixes.
- Troubleshoot using evidence instead of guesswork.
- Build a hypothesis-driven troubleshooting workflow.
- Use Linux tools to inspect processes, resources, files, permissions, networking, and configuration.
- Debug common problems in Python, FastAPI, and GenAI development environments.
- Understand the difference between symptoms, causes, and root causes.
- Collect enough evidence to reproduce and communicate an issue.
- Apply safe troubleshooting practices without randomly changing the system.
- Recognize when a problem belongs to application code, the development environment, or the operating system.

---

## Prerequisites

This chapter assumes familiarity with:

- [ENG-01 — Computer Science Fundamentals](../ENG-01-Computer-Science-Fundamentals/README.md)
- [ENG-02 — Programming Foundations](../ENG-02-Programming-Foundations/README.md)
- [ENG-03 — Software Engineering Principles](../ENG-03-Software-Engineering-Principles/README.md)
- [ENG-04 — Version Control & Collaborative Development](../ENG-04-Version-Control-and-Collaborative-Development/README.md)
- [01 — Linux Fundamentals](./01-Linux-Fundamentals.md)
- [02 — Linux Filesystem](./02-Linux-Filesystem.md)
- [03 — Shell & Command Line](./03-Shell-and-Command-Line.md)
- [04 — Files, Directories & File Operations](./04-Files-Directories-and-File-Operations.md)
- [05 — Users, Groups & Permissions](./05-Users-Groups-and-Permissions.md)
- [06 — Processes & Process Management](./06-Processes-and-Process-Management.md)
- [07 — Package Management](./07-Package-Management.md)
- [08 — Environment Variables & Configuration](./08-Environment-Variables-and-Configuration.md)
- [09 — Development Environment Setup](./09-Development-Environment-Setup.md)
- [10 — Virtual Environments & Dependency Isolation](./10-Virtual-Environments-and-Dependency-Isolation.md)
- [11 — Shell Scripting Fundamentals](./11-Shell-Scripting-Fundamentals.md)
- [12 — Linux Networking Basics](./12-Linux-Networking-Basics.md)

This chapter uses these concepts operationally. It does not re-teach them in depth.

---

## Estimated Reading Time

**45–60 minutes**

---

## Before We Start

Imagine that you start your FastAPI application:

```bash
uvicorn app.main:app
```

The application starts.

Then a request fails.

You see:

```text
500 Internal Server Error
```

What do you do?

A weak approach is:

> "Restart the application."

A better approach is:

> "What evidence tells me why the request failed?"

That difference is important.

Software engineering is not only about writing systems that work.

It is also about understanding systems when they **do not work**.

This is where logs and systematic troubleshooting become engineering skills rather than random command execution.

---

# Why This Exists

A running system has internal state that is not directly visible to us.

A user may see:

```text
Request failed
```

But internally, many things could have happened:

```text
Client
   ↓
FastAPI
   ↓
Authentication
   ↓
Business logic
   ↓
Database
   ↓
External API
   ↓
Response
```

The failure could occur anywhere.

The visible error is often only the **symptom**.

For example:

```text
HTTP 500
```

does not necessarily mean:

```text
"FastAPI is broken."
```

It could mean:

```text
FastAPI
   ↓
Database connection failed
   ↓
Unhandled exception
   ↓
HTTP 500
```

Logs help expose the hidden sequence of events.

Troubleshooting helps us reason from those observations back toward the cause.

---

# Mental Model

A useful troubleshooting model is:

```text
Symptom
   ↓
Evidence
   ↓
Hypothesis
   ↓
Test
   ↓
Observation
   ↓
Root Cause
   ↓
Fix
   ↓
Verification
```

The key idea is:

> **Do not jump directly from symptom to fix.**

For example:

```text
Symptom:
API returns 500

Weak approach:
Restart server

Engineering approach:
1. Inspect application logs
2. Identify exception
3. Determine failing dependency
4. Test the dependency
5. Fix the actual cause
6. Reproduce the request
7. Verify the failure is gone
```

This approach scales much better.

---

# Core Concepts

## 1. What Is a Log?

A log is a recorded description of an event or observation produced by a system.

Examples:

```text
Application started
Database connection established
User authenticated
Request received
Request failed
Model request timed out
Configuration value missing
```

A log can contain information such as:

- timestamp
- severity
- process
- module
- event
- request information
- error message
- exception details
- identifiers

For example:

```text
2026-10-08 10:31:12 ERROR database connection failed
```

The exact format depends on the application and logging system.

---

## 2. Why Logs Matter

Without logs, troubleshooting often becomes guesswork.

Suppose an API request fails.

Possible causes include:

```text
Database unavailable
Invalid configuration
Permission denied
Port conflict
Missing dependency
Network failure
Application bug
External API failure
Expired credential
Insufficient resources
```

The HTTP response alone may not distinguish these causes.

Logs provide additional evidence.

A useful mental model is:

```text
Application behavior
       ↓
Observable events
       ↓
Logs
       ↓
Human understanding
```

Logs are therefore part of the system's ability to explain itself.

---

# 3. Logs vs Errors vs Exceptions

These concepts are related but not identical.

### Error

An error is a condition where something went wrong.

Example:

```text
Database connection failed
```

### Exception

An exception is a programming/runtime mechanism used by many languages to represent abnormal conditions.

Example:

```python
raise ConnectionError("Database unavailable")
```

### Log

A log is a recorded observation.

Example:

```text
ERROR Database unavailable
```

An exception may generate a log.

A log may also describe something that is not an exception:

```text
INFO Application started
```

Therefore:

```text
Exception ≠ Log
Error ≠ Log
```

Logs are an observability mechanism for recording what happened.

---

# 4. Log Levels

Applications commonly classify messages by severity.

Typical levels include:

| Level | Meaning |
|---|---|
| DEBUG | Detailed information useful during development |
| INFO | Normal operational events |
| WARNING | Something unusual that may require attention |
| ERROR | An operation failed |
| CRITICAL | A severe failure affecting major functionality |

Example:

```text
INFO     Application started
DEBUG    Request payload validated
INFO     Database connection established
WARNING  Retry attempt 2/3
ERROR    Database query failed
CRITICAL Application cannot start
```

The exact levels and behavior depend on the logging framework.

The important engineering idea is **severity classification**.

---

# 5. Application Logs

Application logs are produced by the application itself.

For a FastAPI application:

```text
INFO:     Server started
INFO:     GET /users
INFO:     Request completed
ERROR:    Database query failed
```

Application logs are particularly useful for understanding:

- request flow
- application state
- business operations
- exceptions
- dependency failures
- configuration problems
- startup behavior

For GenAI systems, logs may also help identify:

```text
Embedding generation started
Vector search completed
Retrieved 20 documents
LLM request started
LLM request timed out
```

Care must be taken not to log sensitive data.

---

# 6. System Logs

Linux itself and system services may also produce logs.

Examples include events involving:

- services
- authentication
- system startup
- hardware
- background processes
- system failures

Depending on the distribution and configuration, system logs may be accessible through tools such as:

```bash
journalctl
```

For example:

```bash
journalctl
```

can display system journal entries.

You can narrow the investigation when appropriate.

For example:

```bash
journalctl -u my-service
```

can inspect logs associated with a specific service.

The exact service and logging configuration varies by system.

The important distinction is:

```text
Application logs
        ↓
"What is my application doing?"

System logs
        ↓
"What is the operating environment doing?"
```

---

# 7. Terminal Output Is Also Evidence

Not every useful diagnostic message is stored in a log file.

When you run:

```bash
python app.py
```

you may immediately see:

```text
ModuleNotFoundError: No module named 'fastapi'
```

That output is evidence.

Likewise:

```bash
uvicorn app.main:app
```

might show:

```text
ERROR: [Errno 98] Address already in use
```

This immediately gives us a strong hypothesis:

> Another process is already using the port.

Terminal output should therefore not be ignored simply because it is not a permanent log file.

---

# 8. Reading Logs Effectively

Do not read logs as a giant wall of text.

Ask targeted questions.

### Question 1 — When did the failure occur?

Look at timestamps.

```text
10:31:10 INFO request received
10:31:11 INFO database query started
10:31:11 ERROR database connection failed
```

The timeline tells us where the failure happened.

---

### Question 2 — What happened immediately before the failure?

This is often extremely useful.

```text
request received
↓
authentication succeeded
↓
database query started
↓
connection refused
```

The last successful operation narrows the investigation.

---

### Question 3 — What is the first meaningful error?

Consider:

```text
ERROR request failed
ERROR service unavailable
ERROR connection refused
```

The first useful lower-level error may be more informative than the final high-level error.

---

# 9. Searching Logs

Suppose you have a large log file:

```bash
app.log
```

You can search it:

```bash
grep "ERROR" app.log
```

Case-insensitive search:

```bash
grep -i "error" app.log
```

Search for a specific exception:

```bash
grep "ConnectionError" app.log
```

Search with line numbers:

```bash
grep -n "ERROR" app.log
```

You can combine tools:

```bash
grep -i "error" app.log | tail
```

This uses the shell pipeline model introduced in [03 — Shell & Command Line](./03-Shell-and-Command-Line.md).

The goal is not to memorize commands.

The goal is to reduce a large evidence set into something understandable.

---

# 10. Following Logs in Real Time

When debugging a running application, you often want to observe new entries as they appear.

For a file:

```bash
tail -f app.log
```

You can then trigger the operation that is failing.

For example:

```text
Terminal 1:
tail -f app.log

Terminal 2:
curl http://localhost:8000/users
```

You can observe what the application logs when the request arrives.

This creates a useful experimental loop:

```text
Observe
   ↓
Trigger
   ↓
Observe new evidence
   ↓
Form hypothesis
   ↓
Test
```

---

# 11. Reading Large Logs Safely

Avoid blindly printing huge files:

```bash
cat huge.log
```

For large logs, tools such as:

```bash
less app.log
```

are often more practical.

You can combine:

```bash
grep "ERROR" app.log | less
```

The general principle is:

> **Inspect only the evidence you need.**

This is particularly important when logs contain millions of lines.

---

# 12. Context Around an Error

An error message by itself may not be enough.

Suppose:

```text
ERROR database query failed
```

You need surrounding context.

You may search for the relevant request, timestamp, identifier, or nearby entries.

For example:

```bash
grep -n -C 3 "database query failed" app.log
```

The `-C` option requests surrounding lines.

The exact command is less important than the idea:

```text
Error
+
Context
=
Better diagnosis
```

---

# 13. Symptoms vs Root Causes

This distinction is fundamental.

Consider:

```text
User sees HTTP 500
```

That is a symptom.

The application log says:

```text
Database connection refused
```

That is closer to the cause.

Further investigation shows:

```text
PostgreSQL process is not running
```

That is closer to the root cause.

The chain may be:

```text
PostgreSQL stopped
      ↓
Database unavailable
      ↓
Application query fails
      ↓
Unhandled exception
      ↓
HTTP 500
      ↓
User sees error
```

If you only fix the symptom by restarting the API, the underlying problem remains.

---

# 14. Failure Classification

Before troubleshooting, classify the failure.

A useful initial classification is:

```text
Application
Environment
Dependency
Configuration
Permission
Process
Network
Filesystem
Resource
External Service
```

This prevents random debugging.

For example:

```text
ModuleNotFoundError
```

suggests:

```text
Dependency / environment
```

while:

```text
Permission denied
```

suggests:

```text
Permissions / ownership
```

and:

```text
Connection refused
```

suggests:

```text
Process / network / service availability
```

Classification does not prove the cause.

It gives you a starting hypothesis.

---

# 15. Hypothesis-Driven Troubleshooting

Suppose a FastAPI application cannot connect to PostgreSQL.

Do not immediately modify configuration.

Start with a hypothesis:

> "The PostgreSQL service may not be accepting connections."

Then test it.

For example:

```bash
ss -lnt
```

or an appropriate database client/tool.

If nothing is listening on the expected port, the hypothesis becomes stronger.

Now inspect the database process/service.

This is fundamentally different from:

```text
Try random commands
↓
Change random settings
↓
Restart everything
↓
Hope it works
```

A strong troubleshooting process is:

```text
Observation
   ↓
Hypothesis
   ↓
Small test
   ↓
Evidence
   ↓
Refine hypothesis
```

---

# 16. The Smallest Useful Test

When troubleshooting, prefer tests that isolate one variable.

Suppose:

```text
FastAPI → PostgreSQL
```

is failing.

Instead of repeatedly sending full application requests, isolate the dependency.

Ask:

```text
Can the database be reached?
```

Then:

```text
Is the expected port listening?
```

Then:

```text
Are the credentials/configuration correct?
```

Then:

```text
Can the application establish the connection?
```

This creates a dependency chain:

```text
OS
 ↓
Network
 ↓
Database process
 ↓
Database authentication
 ↓
Application connection
 ↓
Application query
 ↓
API response
```

Test from the lowest relevant layer upward.

---

# 17. Process Troubleshooting

If an application behaves unexpectedly, determine whether the expected process is actually running.

Useful commands include:

```bash
ps aux
```

```bash
pgrep -af python
```

```bash
ps -ef
```

For interactive observation:

```bash
top
```

You can investigate:

- PID
- process owner
- CPU usage
- memory usage
- command line
- parent process

Detailed process concepts are covered in [06 — Processes & Process Management](./06-Processes-and-Process-Management.md).

Here the goal is simply to use that knowledge while troubleshooting.

---

# 18. Port and Network Troubleshooting

Suppose your FastAPI application should listen on:

```text
localhost:8000
```

but the request fails.

First determine whether something is listening.

```bash
ss -lnt
```

You may see:

```text
LISTEN 0 128 127.0.0.1:8000
```

If nothing is listening on port `8000`, the problem may be:

```text
Application not running
Application crashed
Application bound to another port
Startup failed
```

If something is listening, investigate further.

For example:

```bash
curl http://127.0.0.1:8000
```

Then distinguish:

```text
Connection refused
```

from:

```text
Timeout
```

These point toward different classes of failure.

See [12 — Linux Networking Basics](./12-Linux-Networking-Basics.md) for the underlying networking concepts.

---

# 19. Filesystem Troubleshooting

Filesystem problems commonly appear as:

```text
No such file or directory
Permission denied
Disk full
Cannot write file
Cannot find configuration
```

Start by checking the actual path.

```bash
pwd
```

```bash
ls -la
```

```bash
find . -name "config.yaml"
```

For disk usage:

```bash
df -h
```

For directory usage:

```bash
du -sh .
```

The important principle is:

> Verify the filesystem state instead of assuming it.

A surprising number of application errors are caused by incorrect paths or missing files.

---

# 20. Permission Troubleshooting

A common error is:

```text
Permission denied
```

Do not immediately use:

```bash
sudo
```

Instead, determine:

1. Which user is running the process?
2. Who owns the file?
3. What permissions are configured?
4. Does the process actually need elevated privileges?

Inspect:

```bash
ls -l file.txt
```

and:

```bash
id
```

Then determine whether the permission model matches the intended access.

Detailed permission concepts are covered in [05 — Users, Groups & Permissions](./05-Users-Groups-and-Permissions.md).

---

# 21. Environment and Configuration Troubleshooting

Applications often behave differently because their environments differ.

For example:

```text
Developer A:
DATABASE_URL=localhost

Developer B:
DATABASE_URL=192.168.1.20
```

The same application code may behave differently.

Check environment values deliberately:

```bash
printenv
```

or:

```bash
echo "$DATABASE_URL"
```

For Python:

```python
import os

print(os.getenv("DATABASE_URL"))
```

Do not print secrets into shared logs.

Instead, verify:

```text
Is the variable present?
Is it the expected environment?
Is the value structurally valid?
Is the application reading the correct configuration?
```

Configuration concepts are covered in [08 — Environment Variables & Configuration](./08-Environment-Variables-and-Configuration.md).

---

# 22. Dependency Troubleshooting

A common Python error is:

```text
ModuleNotFoundError
```

For example:

```text
ModuleNotFoundError: No module named 'fastapi'
```

Possible causes include:

- package not installed
- wrong virtual environment
- wrong Python executable
- dependency installed globally instead of in the project environment
- multiple Python versions

Check:

```bash
which python
```

or:

```bash
command -v python
```

Then:

```bash
python -m pip --version
```

and:

```bash
python -m pip list
```

The important principle is:

> Verify which interpreter and environment are actually executing the application.

See [10 — Virtual Environments & Dependency Isolation](./10-Virtual-Environments-and-Dependency-Isolation.md).

---

# 23. Resource Troubleshooting

Some failures are not caused by incorrect code.

The system itself may be under resource pressure.

Common resources include:

```text
CPU
Memory
Disk
Processes
Network
```

For CPU and memory:

```bash
top
```

For memory:

```bash
free -h
```

For disk:

```bash
df -h
```

For processes:

```bash
ps aux
```

For listening network sockets:

```bash
ss -lnt
```

These commands help answer:

> "Does the system have enough resources and expected state to run this application?"

---

# 24. Logs and Time

Timestamps are extremely important during troubleshooting.

Consider:

```text
10:15:01 request started
10:15:01 database query started
10:15:06 timeout
10:15:06 request failed
```

This tells us something important:

```text
The database operation took approximately 5 seconds before failure.
```

Now compare that with:

```text
10:15:01 request started
10:15:01 immediate connection refused
```

These represent very different failure patterns.

Time helps reconstruct system behavior.

---

# 25. Correlating Events

Modern applications involve multiple components.

For example:

```text
Client
  ↓
FastAPI
  ↓
Redis
  ↓
PostgreSQL
  ↓
Embedding Service
  ↓
LLM Provider
```

One user request may generate events across multiple components.

A useful identifier can help correlate them:

```text
request_id=abc123
```

Then logs might show:

```text
request_id=abc123 request started
request_id=abc123 vector search started
request_id=abc123 vector search completed
request_id=abc123 LLM request started
request_id=abc123 LLM request failed
```

This makes the request lifecycle easier to reconstruct.

At this stage, understand the concept of correlation. Advanced distributed tracing and observability belong to later production-oriented topics.

---

# 26. Python and FastAPI Troubleshooting Example

Suppose you run:

```bash
uvicorn app.main:app --reload
```

and receive:

```text
ERROR: Error loading ASGI app.
```

Do not stop at that message.

Investigate the surrounding traceback.

You might discover:

```text
ModuleNotFoundError: No module named 'app.config'
```

Now the problem is more specific.

Possible investigation:

```bash
pwd
```

```bash
ls
```

```bash
find . -maxdepth 2 -type f
```

Then verify the Python environment:

```bash
which python
```

```bash
python -m pip list
```

The workflow becomes:

```text
FastAPI startup failure
       ↓
Read traceback
       ↓
Identify failing import
       ↓
Inspect project structure
       ↓
Verify Python environment
       ↓
Fix actual issue
       ↓
Restart
       ↓
Verify startup
```

This is much more effective than reinstalling FastAPI.

---

# 27. GenAI Troubleshooting Example

Consider a matchmaking service:

```text
FastAPI
   ↓
Embedding Service
   ↓
Qdrant
   ↓
LLM
```

A user reports:

```text
Match results are not loading.
```

That statement is too broad.

Investigate the request flow.

Logs might show:

```text
INFO request started
INFO profile embedding generated
INFO Qdrant search started
ERROR Qdrant connection refused
```

Now the investigation moves toward Qdrant rather than the LLM.

You may then verify:

```text
Is Qdrant running?
Is the expected port listening?
Is the configured endpoint correct?
Can the application reach it?
```

The important lesson is:

> **Trace the failing request through its dependency chain.**

---

# 28. External API Troubleshooting

GenAI applications frequently depend on external services.

For example:

```text
Application
   ↓
Embedding API
   ↓
LLM API
```

A request may fail because of:

- invalid credentials
- incorrect endpoint
- network failure
- timeout
- rate limit
- provider-side error
- malformed request
- configuration problem

Do not automatically assume:

```text
"LLM is broken."
```

Instead inspect the actual error.

For example:

```text
401
```

suggests an authentication problem.

```text
404
```

may suggest an incorrect endpoint/resource.

```text
429
```

indicates rate limiting.

```text
5xx
```

generally indicates a server-side failure somewhere in the service chain.

The exact interpretation depends on the API and context.

---

# 29. Troubleshooting by Layers

A useful general framework is to troubleshoot from lower layers toward higher layers.

```text
System
  ↓
Process
  ↓
Filesystem / Permissions
  ↓
Network
  ↓
Runtime / Environment
  ↓
Application
  ↓
Dependency
  ↓
Business Logic
```

For example:

```text
API unavailable
```

could be investigated as:

```text
Is the machine available?
        ↓
Is the process running?
        ↓
Is the port listening?
        ↓
Can the port be reached?
        ↓
Can the runtime start?
        ↓
Can dependencies initialize?
        ↓
Does the application process the request?
        ↓
Does business logic succeed?
```

This is not a rigid rule.

Sometimes the error clearly points to a higher layer.

The purpose is to avoid chaotic investigation.

---

# 30. Evidence Collection

When an issue occurs, capture enough information for another engineer to understand it.

Useful evidence may include:

```text
What command was executed?
What request was made?
What happened?
What was expected?
What error occurred?
When did it occur?
Which environment?
Which branch/commit?
Which Python version?
Which dependency environment?
Which configuration?
What logs were produced?
What changed recently?
```

A good issue report might look like:

```text
Environment:
Ubuntu
Python 3.x
Virtual environment: .venv

Command:
uvicorn app.main:app

Expected:
Application starts on port 8000

Actual:
Startup fails

Error:
ModuleNotFoundError: ...

Recent change:
Added new configuration module

Investigation:
Verified Python executable
Verified virtual environment
Verified project structure
```

This is much more useful than:

> "It doesn't work."

---

# 31. The Five-Question Troubleshooting Framework

When you encounter an unfamiliar failure, ask:

### 1. What exactly failed?

Avoid vague statements.

Bad:

```text
API broken
```

Better:

```text
POST /match returns HTTP 500
```

---

### 2. When did it start?

Ask:

```text
Was it always broken?
Did it work yesterday?
Did a dependency change?
Did configuration change?
Did code change?
```

---

### 3. What changed?

Recent changes are valuable clues.

For example:

```text
Code change
Dependency update
Environment variable change
Python version change
System package update
Configuration change
External service change
```

---

### 4. What evidence do we have?

Collect:

```text
Logs
Tracebacks
Command output
Process state
Network state
Filesystem state
Configuration state
```

---

### 5. What is the smallest test that can distinguish between hypotheses?

This is one of the strongest troubleshooting habits you can develop.

---

# 32. Common Troubleshooting Commands

The following commands form a useful basic toolkit:

| Goal | Command |
|---|---|
| Current directory | `pwd` |
| List files | `ls -la` |
| Search files | `find` |
| Search text | `grep` |
| Read large file | `less` |
| Follow file changes | `tail -f` |
| Processes | `ps` |
| Process search | `pgrep` |
| Resource view | `top` |
| Memory | `free -h` |
| Disk filesystem usage | `df -h` |
| Directory usage | `du -sh` |
| Network sockets | `ss` |
| Routes | `ip route` |
| Interfaces | `ip addr` |
| HTTP testing | `curl` |
| Environment | `env` / `printenv` |
| Current identity | `id` |
| Service logs | `journalctl` |

The goal is not command memorization.

Build the association:

```text
Question → Tool
```

For example:

```text
"Is the process running?"
→ ps / pgrep

"Is the port listening?"
→ ss

"Is the file present?"
→ find / ls

"Is the filesystem full?"
→ df

"What environment am I using?"
→ env / which / python

"What happened?"
→ logs / journal / application output
```

---

# 33. A Practical Troubleshooting Workflow

Use this workflow when facing an unfamiliar problem.

## Step 1 — Reproduce

Can you reproduce the issue?

```text
Same command
Same request
Same environment
Same failure
```

If the issue cannot be reproduced, collect evidence from the original occurrence.

---

## Step 2 — Define the Failure

Write a precise statement.

Instead of:

```text
The backend is broken.
```

write:

```text
POST /recommendations returns HTTP 500 when profile preferences are present.
```

---

## Step 3 — Collect Evidence

Check:

```text
Logs
Traceback
Command output
Recent changes
Environment
Process state
Network state
```

---

## Step 4 — Classify

Determine whether the failure appears to involve:

```text
Application
Dependency
Configuration
Permission
Process
Network
Filesystem
Resource
External service
```

---

## Step 5 — Form a Hypothesis

Example:

> The application cannot connect to PostgreSQL because the database process is not listening on the configured port.

---

## Step 6 — Test the Hypothesis

Check the relevant state.

```bash
ss -lnt
```

Then inspect the database process/service if needed.

---

## Step 7 — Change One Relevant Thing

Avoid changing ten variables simultaneously.

Otherwise you lose information about what actually fixed the problem.

---

## Step 8 — Reproduce Again

Run the same failing operation.

```text
Before fix → fails
After fix → succeeds
```

---

## Step 9 — Verify Side Effects

A fix is not complete if it creates another problem.

For example:

```text
Application works
but
permissions were unnecessarily changed
```

That is not a good fix.

---

## Step 10 — Record the Root Cause

Document:

```text
Problem
Cause
Fix
Verification
Prevention
```

This converts an incident into organizational knowledge.

---

# 34. Debugging vs Guessing

Consider these two approaches.

### Guessing

```text
API failed
↓
Restart server
↓
Still failed
↓
Reinstall packages
↓
Still failed
↓
Change environment variables
↓
Now it works
```

What did you learn?

Very little.

---

### Debugging

```text
API failed
↓
Read traceback
↓
Identify connection failure
↓
Test database port
↓
Port not listening
↓
Inspect database process
↓
Database process stopped
↓
Start database
↓
Reproduce request
↓
Request succeeds
```

Now you know:

```text
Symptom
→ database connection failure

Root cause
→ database process unavailable

Fix
→ restore database service

Verification
→ request succeeds
```

That knowledge is reusable.

---

# 35. Production Perspective

In development, you may manually inspect:

```text
terminal
logs
processes
ports
files
configuration
```

In production systems, the same fundamental reasoning still applies.

The scale changes.

You may have:

```text
Many application instances
Many machines
Centralized logs
Metrics
Traces
Alerting
Distributed services
```

The core engineering question remains:

> **What evidence explains the observed behavior?**

Advanced observability and monitoring systems belong to later production engineering topics.

The foundation developed here remains essential.

---

# 36. Safe Troubleshooting

Troubleshooting itself can cause damage.

Be careful with commands that modify the system.

Examples include:

```bash
rm
chmod
chown
sudo
apt remove
kill -9
```

Before executing a destructive command, ask:

```text
What exactly will this change?
Which user am I?
Which files/processes are affected?
Can I undo it?
Is there a safer inspection command first?
```

A useful progression is:

```text
Inspect
   ↓
Understand
   ↓
Test
   ↓
Modify
   ↓
Verify
```

Not:

```text
Modify
   ↓
Hope
```

---

# 37. Common Mistakes

## Mistake 1 — Restarting Everything

Restarting can temporarily hide the symptom without explaining the cause.

Use restart as a deliberate action, not a default debugging strategy.

---

## Mistake 2 — Ignoring the First Error

A later error may simply be a consequence of an earlier failure.

Look for the earliest meaningful failure in the sequence.

---

## Mistake 3 — Reading Only the Final Error

The final message may be generic:

```text
Internal Server Error
```

The traceback or earlier logs may contain the useful information.

---

## Mistake 4 — Changing Multiple Things at Once

If you change:

```text
code
environment
permissions
configuration
dependencies
```

simultaneously, you cannot easily determine what solved the problem.

---

## Mistake 5 — Using `sudo` as a Universal Fix

`sudo` changes privilege.

It does not magically fix:

```text
wrong path
missing package
wrong environment
bad configuration
network failure
application bugs
```

Use elevated privileges only when justified.

---

## Mistake 6 — Ignoring Environment Differences

The code may be correct while the environment is different.

Compare:

```text
Python version
environment
dependencies
environment variables
working directory
OS
configuration
```

---

## Mistake 7 — Logging Secrets

Never casually log:

```text
API keys
passwords
tokens
private credentials
sensitive user data
```

A log system is itself a data store.

Treat logged information accordingly.

---

## Mistake 8 — Assuming the Error's First Explanation Is Correct

For example:

```text
Connection refused
```

does not automatically mean:

```text
"Network problem."
```

It may be:

```text
service not running
wrong port
wrong host
binding issue
firewall behavior
```

Investigate.

---

## Mistake 9 — Fixing the Symptom

If restarting the API makes the problem disappear temporarily, ask:

> Why did the API fail in the first place?

Temporary recovery is not necessarily root-cause resolution.

---

# 38. Engineering Decisions

When designing an application, consider how easy it will be to troubleshoot later.

Good engineering decisions include:

### Meaningful Logs

Prefer:

```text
Failed to connect to PostgreSQL
```

over:

```text
Error
```

---

### Useful Context

Include relevant information such as:

```text
operation
request identifier
component
failure type
```

without exposing sensitive information.

---

### Appropriate Severity

Do not mark every message as:

```text
ERROR
```

If everything is an error, nothing is clearly an error.

---

### Consistent Structure

Structured logging makes automated analysis easier.

For example:

```text
timestamp
level
service
request_id
event
message
```

The exact format depends on the application.

---

### Actionable Errors

A good error should help answer:

```text
What failed?
Where?
Why?
What should be investigated next?
```

---

# 39. Troubleshooting Mental Model

Build this mental model:

```text
                 SYSTEM
                    │
        ┌───────────┼───────────┐
        │           │           │
    Processes    Filesystem   Network
        │           │           │
        └───────────┼───────────┘
                    │
              Environment
                    │
              Application
                    │
              Dependencies
                    │
              External APIs
                    │
                  User
```

Logs provide observations across these layers.

Troubleshooting connects those observations into a causal explanation.

---

# 40. A Complete Example

Suppose a FastAPI application suddenly returns:

```text
500 Internal Server Error
```

### Step 1 — Reproduce

```bash
curl http://localhost:8000/recommendations
```

Result:

```text
500 Internal Server Error
```

---

### Step 2 — Inspect logs

```text
ERROR database connection failed
```

Now we have a better direction.

---

### Step 3 — Check the database port

```bash
ss -lnt
```

Expected database port is not listening.

---

### Step 4 — Investigate the database process

The database process is not running.

---

### Step 5 — Determine why

Look at relevant service/system logs.

```bash
journalctl -u <database-service>
```

The exact service name depends on the environment.

Suppose the logs reveal:

```text
database failed to start because the filesystem is full
```

---

### Step 6 — Check disk usage

```bash
df -h
```

The filesystem is at:

```text
100%
```

---

### Step 7 — Investigate disk usage

```bash
du -sh *
```

A large log directory is consuming the available space.

---

### Step 8 — Resolve the actual problem

After safely addressing the disk usage, restore the database service.

---

### Step 9 — Verify

Check:

```text
database running
↓
port listening
↓
FastAPI connects
↓
request succeeds
```

The original symptom was:

```text
HTTP 500
```

The deeper causal chain was:

```text
Large logs
   ↓
Disk full
   ↓
Database could not start
   ↓
Application database connection failed
   ↓
API returned HTTP 500
```

This is what good troubleshooting looks like.

---

# 41. Interview Perspective

### Question 1

**A FastAPI application returns HTTP 500. What would you do first?**

A strong answer should mention:

```text
Reproduce the issue
Inspect application logs/traceback
Identify the actual failing operation
Classify the failure
Form a hypothesis
Test the relevant dependency
Fix and verify
```

---

### Question 2

**What is the difference between a symptom and a root cause?**

Example:

```text
HTTP 500 = symptom

Database unavailable = cause

Database unable to start because disk is full = deeper/root cause
```

---

### Question 3

**How would you investigate `Connection refused`?**

Possible reasoning:

```text
Is the target process running?
Is the expected port listening?
Is the host correct?
Is the application connecting to the correct port?
Is the service bound to the expected interface?
```

---

### Question 4

**Why is restarting an application not always a good troubleshooting solution?**

Because it may:

- hide the underlying cause
- destroy useful state
- make the problem harder to reproduce
- provide recovery without understanding

---

### Question 5

**How would you investigate `Permission denied`?**

You should reason about:

```text
Current user
File owner
Group
Permissions
Directory permissions
Process identity
```

rather than immediately using `sudo`.

---

### Question 6

**How would you debug a Python `ModuleNotFoundError`?**

A strong investigation includes:

```text
Which Python executable?
Which environment?
Is the package installed there?
Which pip belongs to that Python?
Are multiple Python versions involved?
```

---

### Question 7

**How do you troubleshoot a service that appears to be running but cannot be reached?**

Reason through:

```text
Process
↓
Listening socket
↓
Binding address
↓
Network path
↓
Application behavior
```

---

### Question 8

**Why are timestamps important in logs?**

Because they allow engineers to reconstruct the sequence and duration of events.

---

### Question 9

**Why should troubleshooting change one variable at a time?**

Because controlled changes preserve causal information.

---

### Question 10

**What makes a good troubleshooting engineer?**

Not knowing every command.

The important skills are:

```text
Observation
Reasoning
Hypothesis formation
Controlled experimentation
Evidence collection
Root-cause analysis
Verification
Communication
```

---

# Quick Revision

## Logs

```text
Logs = recorded observations about system behavior
```

---

## Troubleshooting

```text
Symptom
↓
Evidence
↓
Hypothesis
↓
Test
↓
Root Cause
↓
Fix
↓
Verification
```

---

## Important Questions

When something fails, ask:

```text
What exactly failed?
When did it fail?
What changed?
What evidence exists?
Which layer is failing?
What is the smallest useful test?
```

---

## Useful Linux Tools

```text
ps
pgrep
top
df
du
ss
ip
curl
grep
find
less
tail
journalctl
env
printenv
id
```

---

## Core Principle

> **Inspect first. Change second. Verify last.**

---

# Key Takeaways

1. Logs provide evidence about system behavior.
2. A visible error is often a symptom rather than the root cause.
3. Good troubleshooting is hypothesis-driven rather than guess-driven.
4. Always define the failure precisely before investigating it.
5. Start with evidence: logs, tracebacks, command output, and system state.
6. Classify the problem before choosing the next diagnostic step.
7. Test the smallest relevant component before changing the whole system.
8. Process, filesystem, permissions, networking, environment, and application behavior are interconnected.
9. Do not use `sudo`, restarts, or destructive commands as universal fixes.
10. Avoid changing multiple variables simultaneously.
11. Timestamps and surrounding context help reconstruct failures.
12. Good logs should be meaningful, appropriately classified, and safe.
13. Troubleshooting knowledge becomes reusable when the root cause and fix are documented.
14. The goal of troubleshooting is not merely to make the system work again.
15. The goal is to understand **why it failed, how it was fixed, and how to prevent recurrence**.

---

## Further Reading

- [01 — Linux Fundamentals](./01-Linux-Fundamentals.md)
- [02 — Linux Filesystem](./02-Linux-Filesystem.md)
- [03 — Shell & Command Line](./03-Shell-and-Command-Line.md)
- [04 — Files, Directories & File Operations](./04-Files-Directories-and-File-Operations.md)
- [05 — Users, Groups & Permissions](./05-Users-Groups-and-Permissions.md)
- [06 — Processes & Process Management](./06-Processes-and-Process-Management.md)
- [08 — Environment Variables & Configuration](./08-Environment-Variables-and-Configuration.md)
- [10 — Virtual Environments & Dependency Isolation](./10-Virtual-Environments-and-Dependency-Isolation.md)
- [12 — Linux Networking Basics](./12-Linux-Networking-Basics.md)

---

## Connection to the Next Chapter

You now have the foundation for understanding how to investigate Linux and development-environment failures.

The next chapter focuses on the tools that make daily command-line development faster and more effective:

**[14 — Development Tools & CLI Productivity](./14-Development-Tools-and-CLI-Productivity.md)**

The focus will shift from:

```text
"How do I diagnose a problem?"
```

toward:

```text
"How do I work efficiently from the command line?"
```

That includes developer-oriented CLI workflows, productivity tools, navigation strategies, search, inspection, command composition, and practical development workflows.

---

# End of Document

This completes the Markdown file:

`13-Logs-and-System-Troubleshooting.md`

All parts can now be combined into a single production-ready Markdown document for the GitHub repository.
