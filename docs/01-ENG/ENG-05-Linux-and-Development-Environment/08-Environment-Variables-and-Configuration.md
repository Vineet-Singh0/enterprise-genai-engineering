# 08 — Environment Variables & Configuration

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain what environment variables are and why they exist.
- Understand how a process receives and uses environment variables.
- Distinguish environment variables from configuration files.
- Understand the difference between shell variables and exported environment variables.
- Read, set, modify, and remove environment variables safely.
- Understand how `PATH` works as a practical example of environment configuration.
- Understand how environment variables affect Python and application processes.
- Separate configuration from application code.
- Handle secrets and sensitive configuration more safely.
- Understand configuration differences between development, testing, and production.
- Diagnose common configuration-related problems.
- Design a configuration approach that remains manageable as an application grows.

---

## Prerequisites

You should already understand:

- Basic Linux concepts
- Linux filesystem and paths
- Shell and command-line fundamentals
- Files, directories, and file operations
- Users, groups, and permissions
- Processes and process management
- Basic Python programming

Recommended previous chapters:

- [01 — Linux Fundamentals](./01-Linux-Fundamentals.md)
- [02 — Linux Filesystem](./02-Linux-Filesystem.md)
- [03 — Shell & Command Line](./03-Shell-and-Command-Line.md)
- [04 — Files, Directories & File Operations](./04-Files-Directories-and-File-Operations.md)
- [06 — Processes & Process Management](./06-Processes-and-Process-Management.md)

This chapter builds on the process and shell concepts from earlier chapters. It does not re-teach process internals or shell fundamentals in depth.

---

## Estimated Reading Time

**25–30 minutes**

---

## Before We Start

Imagine you build a Python API.

Your application needs:

- Database host
- Database port
- Database username
- Database password
- API keys
- Application mode
- Log level
- External service URLs

You could write all of these directly inside your Python code.

```python
DATABASE_HOST = "localhost"
DATABASE_USER = "admin"
DATABASE_PASSWORD = "mypassword"
```

It works.

But what happens when you deploy the same application to another environment?

Development might use:

```text
localhost
```

Testing might use:

```text
test-db.internal
```

Production might use:

```text
prod-db.internal
```

The application logic is the same.

Only its environment is different.

This creates an important engineering principle:

> **Application code should not need to change merely because its execution environment changes.**

Environment variables and configuration mechanisms help achieve this separation.

---

# Why Configuration Exists

An application contains two fundamentally different kinds of information.

### Application logic

This describes **what the application does**.

For example:

```python
def calculate_match_score(profile):
    ...
```

### Configuration

This describes **how or where the application should operate**.

For example:

```text
DATABASE_URL
LOG_LEVEL
API_BASE_URL
MODEL_NAME
```

These two concerns change at different rates.

Application logic might remain unchanged for months.

Configuration may change:

- between developers
- between environments
- during deployment
- during testing
- when infrastructure changes
- when credentials rotate

Therefore, tightly coupling configuration to application code creates unnecessary operational problems.

---

# Mental Model: Process + Environment

A useful mental model is:

```text
                Operating System
                       │
                       ▼
              ┌─────────────────┐
              │     Process     │
              │                 │
              │ Application Code │
              │       +         │
              │   Environment   │
              └─────────────────┘
                       │
                       ▼
                Application
```

A process does not run in isolation.

It runs inside an environment containing information such as:

```text
PATH=/usr/local/bin:/usr/bin:/bin
HOME=/home/vineet
USER=vineet
LANG=en_US.UTF-8
```

Applications can read this environment.

This is where the term **environment variable** comes from.

---

# What Is an Environment Variable?

An environment variable is a named value made available to a process through its execution environment.

Conceptually:

```text
NAME = VALUE
```

For example:

```text
APP_ENV=development
LOG_LEVEL=INFO
PORT=8000
```

The application can read these values while it is running.

Think of environment variables as:

> **External inputs supplied to a process without changing its source code.**

---

# Why Are They Called "Environment" Variables?

Because their values describe aspects of the environment in which a process is executing.

For example:

```text
HOME=/home/vineet
USER=vineet
PATH=/usr/local/bin:/usr/bin:/bin
```

These values depend on the execution environment.

A different user may have:

```text
HOME=/home/alice
USER=alice
```

A production machine may have:

```text
APP_ENV=production
```

while a developer's machine has:

```text
APP_ENV=development
```

The same application can therefore behave differently based on its environment without requiring different source code.

---

# Shell Variables vs Environment Variables

This distinction is important.

A shell can have variables that belong only to that shell.

For example:

```bash
APP_ENV=development
```

This creates a shell variable.

If you want child processes launched from that shell to receive the variable, you generally export it:

```bash
export APP_ENV=development
```

Now:

```text
Shell
  │
  ├── APP_ENV=development
  │
  └── launches child process
             │
             ▼
        Child receives
        APP_ENV=development
```

This relationship becomes particularly important when running:

- Python
- FastAPI
- CLI tools
- shell scripts
- development servers

---

# Viewing Environment Variables

To inspect the environment available to a process from the shell, common commands include:

```bash
env
```

and:

```bash
printenv
```

To inspect one variable:

```bash
printenv HOME
```

or:

```bash
echo "$HOME"
```

For example:

```bash
$ echo "$USER"
vineet
```

The quotes are useful because they make the intention clearer and protect against word splitting in more complex shell expressions.

---

# Setting an Environment Variable

You can set a variable for the current shell:

```bash
export APP_ENV=development
```

Then:

```bash
echo "$APP_ENV"
```

produces:

```text
development
```

This variable will be available to programs launched from that shell.

For example:

```bash
export APP_ENV=development
python app.py
```

The Python process can read `APP_ENV`.

---

# Removing an Environment Variable

You can remove an exported variable with:

```bash
unset APP_ENV
```

After that:

```bash
echo "$APP_ENV"
```

will normally produce an empty result if the variable is no longer defined.

The important distinction is:

```text
set
  ↓
available in current environment

unset
  ↓
removed from current environment
```

---

# Environment Variables Are Process-Specific

Environment variables are not magical global storage.

They belong to a process environment.

A useful mental model is:

```text
Parent Process
     │
     │ environment
     ▼
Child Process
```

When a process creates a child process, the child generally receives a copy of the parent's environment.

This explains why:

```bash
export APP_ENV=development
python app.py
```

works.

The shell exports `APP_ENV`, and the Python process receives it when launched.

But if you change a variable in one unrelated shell:

```text
Terminal A
APP_ENV=development

Terminal B
APP_ENV=production
```

they do not automatically share the same shell environment.

---

# Environment Variables and Child Processes

Consider:

```bash
export MODEL_NAME="my-model"
python app.py
```

The relationship is approximately:

```text
Terminal Shell
     │
     │ MODEL_NAME=my-model
     ▼
Python Process
     │
     ▼
Application
```

Inside Python, the application can access the value.

```python
import os

model_name = os.getenv("MODEL_NAME")
print(model_name)
```

Output:

```text
my-model
```

This is a simple but powerful integration mechanism between the operating system and application code.

---

# Environment Variables in Python

Python provides access to environment variables through the `os` module.

```python
import os

environment = os.getenv("APP_ENV")

print(environment)
```

If:

```bash
export APP_ENV=development
```

then:

```python
os.getenv("APP_ENV")
```

returns:

```text
development
```

---

# `os.environ`

Python also exposes the environment through:

```python
os.environ
```

For example:

```python
import os

print(os.environ["APP_ENV"])
```

There is an important difference between:

```python
os.environ["APP_ENV"]
```

and:

```python
os.getenv("APP_ENV")
```

If the variable does not exist:

```python
os.environ["APP_ENV"]
```

raises an exception.

Whereas:

```python
os.getenv("APP_ENV")
```

returns:

```python
None
```

unless a default value is supplied.

For example:

```python
os.getenv("APP_ENV", "development")
```

returns `"development"` if the variable is missing.

---

# Configuration Should Be Explicit

A common mistake is allowing configuration to be scattered throughout an application.

For example:

```python
db = connect(
    host=os.getenv("DB_HOST"),
    port=os.getenv("DB_PORT"),
)

...

api_url = os.getenv("API_URL")

...

if os.getenv("DEBUG") == "true":
    ...
```

This makes configuration difficult to understand.

A better approach is to centralize configuration.

Conceptually:

```text
Environment
     │
     ▼
Configuration Layer
     │
     ▼
Application Components
```

For example:

```python
import os

class Settings:
    app_env = os.getenv("APP_ENV", "development")
    database_url = os.getenv("DATABASE_URL")
    log_level = os.getenv("LOG_LEVEL", "INFO")
```

The exact implementation can vary.

The engineering principle is more important:

> **Read external configuration in a controlled place and make application dependencies explicit.**

---

# Environment Variables vs Configuration Files

Environment variables are not the only configuration mechanism.

Applications commonly use:

- environment variables
- configuration files
- command-line arguments
- configuration services
- secret managers
- deployment configuration

Each has a different purpose.

For example:

```text
Application
     │
     ├── config file
     ├── environment variables
     ├── command-line arguments
     └── secret/configuration service
```

---

# Configuration Files

A configuration file stores settings in a file rather than directly in the process environment.

Examples include:

```text
config.yaml
config.json
config.toml
```

For example:

```yaml
log_level: INFO
port: 8000
model: my-model
```

Configuration files are useful when:

- there are many settings
- configuration has structure
- humans need to review configuration
- configuration is not sensitive
- different configuration profiles are useful

---

# Environment Variables

Environment variables are especially useful when configuration needs to be injected externally.

For example:

```bash
export DATABASE_URL="postgresql://..."
```

This is useful because the application code does not need to know how the deployment environment stores or supplies the value.

This becomes particularly valuable in:

- local development
- testing
- CI/CD environments
- application deployment
- containers
- cloud environments

Containers and CI/CD are covered in later production-oriented topics. Here, the important concept is simply that configuration can be supplied from outside the application.

---

# Configuration and Secrets Are Not the Same Thing

This distinction is critical.

Configuration might include:

```text
LOG_LEVEL=INFO
PORT=8000
MODEL_NAME=my-model
```

Secrets might include:

```text
DATABASE_PASSWORD=...
API_KEY=...
JWT_SECRET=...
```

Both can technically be represented as environment variables.

But that does **not** mean environment variables are automatically a secure secret-management system.

An environment variable is a delivery mechanism.

It is not inherently:

- encrypted
- access-controlled
- audited
- rotated
- safely stored

Therefore:

> **Do not confuse "stored outside the source code" with "securely managed."**

---

# Never Hardcode Secrets

Avoid:

```python
API_KEY = "sk-actual-secret-value"
```

This creates several problems.

The secret may end up in:

- Git history
- source code
- logs
- code reviews
- backups
- developer machines

Instead, applications should receive secrets through an appropriate configuration or secret-management mechanism.

For local development, an environment file may sometimes be used.

For production, dedicated secret-management mechanisms are generally preferable.

The detailed enterprise secret-management topic belongs to later production/security modules.

---

# `.env` Files

A common local-development pattern is a `.env` file.

Example:

```text
APP_ENV=development
DATABASE_URL=postgresql://localhost/mydb
API_URL=http://localhost:8000
```

The application or development tooling can load these values into the process environment.

This is convenient for local development.

But `.env` files require discipline.

A common mistake is committing secrets:

```bash
git add .env
git commit
```

If `.env` contains credentials, those credentials may now exist in repository history.

A safer pattern is usually:

```text
.env
```

for local secrets/configuration and:

```text
.env.example
```

for documenting required variables without exposing real values.

Example:

```text
APP_ENV=development
DATABASE_URL=
API_URL=
API_KEY=
```

The exact strategy depends on the project and deployment system.

---

# `.gitignore` and Local Configuration

If a project intentionally uses a local `.env` file containing secrets, it should generally not be committed.

For example:

```gitignore
.env
```

A safe project may provide:

```text
.env.example
```

containing placeholders.

This allows another developer to understand what configuration is required without receiving actual secrets.

This connects configuration management with the collaborative development practices covered in [ENG-04 — Version Control & Collaborative Development](../ENG-04-Version-Control-and-Collaborative-Development/README.md).

---

# `PATH`: The Most Important Practical Environment Variable

One of the most important environment variables for Linux engineers is:

```text
PATH
```

You have already interacted with it indirectly.

When you run:

```bash
python
```

the shell needs to determine where the executable exists.

It searches directories listed in:

```text
PATH
```

For example:

```text
/usr/local/bin:/usr/bin:/bin
```

The `:` separates directories.

Conceptually:

```text
python
  │
  ▼
Search PATH
  │
  ├── /usr/local/bin
  ├── /usr/bin
  └── /bin
```

The first matching executable is selected according to the shell's command-resolution rules.

---

# Inspecting `PATH`

Run:

```bash
echo "$PATH"
```

You might see:

```text
/usr/local/bin:/usr/bin:/bin
```

You can also inspect where a command resolves:

```bash
which python
```

or, in many shells:

```bash
command -v python
```

The second form is particularly useful when reasoning about shell command resolution.

---

# Modifying `PATH`

Suppose you have a custom executable directory:

```text
/home/vineet/bin
```

You may add it to the existing `PATH`:

```bash
export PATH="$HOME/bin:$PATH"
```

Notice the existing value is preserved.

This is important.

Avoid accidentally replacing the entire path:

```bash
export PATH="$HOME/bin"
```

because this may remove directories required to locate normal system commands.

For example:

```bash
ls
```

could stop resolving if the directory containing `ls` is no longer in `PATH`.

This is a classic configuration mistake.

---

# Shell Startup Configuration

You may want an environment variable to exist whenever you open a shell.

Shell startup files can provide this behavior.

Depending on the shell and operating system, examples include:

```text
~/.bashrc
~/.bash_profile
~/.profile
~/.zshrc
```

For example:

```bash
export APP_ENV=development
```

could be placed in an appropriate shell startup file.

However, do not blindly modify startup files.

First understand:

- which shell you are using
- which startup file it reads
- whether the configuration should be interactive-only
- whether the variable should apply to login sessions
- whether another tool manages the configuration

The exact shell startup behavior is intentionally kept at a practical level in this chapter.

---

# Configuration Precedence

Applications often receive configuration from multiple sources.

For example:

```text
Default values
      │
      ▼
Configuration file
      │
      ▼
Environment variables
      │
      ▼
Command-line arguments
```

A common design is to let more explicit configuration override less explicit configuration.

For example:

```text
Default:
PORT=8000

.env:
PORT=9000

Environment:
PORT=10000
```

The final application value might be:

```text
10000
```

if environment variables have higher precedence.

But precedence is an application design decision.

Do not assume that every framework uses the same order.

Always understand the configuration system being used.

---

# Development, Testing, and Production

A major reason configuration externalization matters is environment separation.

Consider:

```text
Development
DATABASE_URL=local database

Testing
DATABASE_URL=test database

Production
DATABASE_URL=production database
```

The application can remain largely unchanged.

Only the environment changes.

This gives us:

```text
                Same Application
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
     Development    Testing    Production
       Config        Config       Config
```

This is one of the foundations of deployable software.

---

# Configuration Is Part of the Application Contract

Suppose an application requires:

```text
DATABASE_URL
MODEL_NAME
API_KEY
```

Those variables are effectively dependencies of the application.

If they are missing, the application may not work correctly.

Therefore configuration should be documented.

For example:

```text
Required:
DATABASE_URL
API_KEY

Optional:
LOG_LEVEL
PORT
```

This makes the application's operational requirements explicit.

---

# Required vs Optional Configuration

Not every configuration value should have a default.

For example:

```python
database_url = os.getenv("DATABASE_URL")
```

If the database is essential, silently accepting:

```text
None
```

may only cause a confusing error later.

A better strategy may be to validate configuration during application startup.

Conceptually:

```text
Start application
       │
       ▼
Load configuration
       │
       ▼
Validate required values
       │
   ┌───┴────┐
   │        │
 valid    invalid
   │        │
   ▼        ▼
Start    Fail fast
```

This is called **fail fast** behavior.

If the application cannot operate without a database URL, discovering that immediately is better than failing several minutes later during the first request.

---

# Configuration Validation

A configuration layer should ideally answer questions such as:

- Is the variable present?
- Is the value valid?
- Is the type correct?
- Is the value within an allowed range?
- Is the combination of values valid?

For example:

```text
PORT=8000
```

is a string when received from the environment.

The application may need:

```python
port = int(os.getenv("PORT", "8000"))
```

Now the application has converted the external representation into the required internal type.

Configuration parsing is therefore part of application startup.

---

# Environment Variables Are Strings

A common misconception is that environment variables have native types.

They do not.

For example:

```bash
export PORT=8000
export DEBUG=true
```

From the application's perspective, these values arrive as text.

Conceptually:

```text
PORT  → "8000"
DEBUG → "true"
```

The application must interpret them.

For example:

```python
port = int(os.getenv("PORT", "8000"))
```

Boolean configuration requires particular care because:

```python
bool("false")
```

is:

```python
True
```

because the string is non-empty.

Therefore, applications should explicitly parse boolean values instead of relying on generic truthiness.

---

# Environment Variables and Python Virtual Environments

Environment variables also interact with development environments.

For example:

```text
Virtual Environment
        │
        ▼
Python executable
        │
        ▼
Application process
        │
        ▼
Environment variables
```

Activating a Python virtual environment modifies the shell environment so that commands such as:

```bash
python
pip
```

resolve to the virtual environment's executables.

This connects environment variables with dependency isolation.

The deeper virtual-environment topic is covered in:

[10 — Virtual Environments & Dependency Isolation](./10-Virtual-Environments-and-Dependency-Isolation.md)

---

# Environment Variables and FastAPI

Consider a FastAPI application.

A developer might run:

```bash
export APP_ENV=development
export PORT=8000
uvicorn app:app --host 0.0.0.0 --port "$PORT"
```

The application can read:

```python
import os

environment = os.getenv("APP_ENV")
```

This allows the same application code to operate under different configurations.

For example:

```text
Local:
APP_ENV=development

Testing:
APP_ENV=test

Production:
APP_ENV=production
```

The application behavior can then be controlled by configuration rather than source-code edits.

---

# Environment Variables in GenAI Applications

GenAI applications commonly depend on external services.

For example:

```text
LLM API
Embedding API
Vector database
PostgreSQL
Redis
Object storage
Authentication service
```

A simplified configuration might look like:

```text
LLM_PROVIDER=gemini
MODEL_NAME=...
DATABASE_URL=...
VECTOR_DB_URL=...
VECTOR_DB_COLLECTION=...
REDIS_URL=...
```

The application code can consume these values without embedding environment-specific infrastructure details directly into the code.

This is especially useful when the same application needs to run:

```text
Developer machine
        ↓
Testing environment
        ↓
Staging
        ↓
Production
```

---

# A Better GenAI Configuration Design

Avoid scattering configuration throughout the codebase:

```python
client = Client(api_key=os.getenv("API_KEY"))

...

model = "some-model"

...

collection = "production_collection"

...

redis_url = "localhost"
```

Instead, establish a configuration boundary:

```text
Environment
     │
     ▼
Settings / Configuration
     │
     ├── LLM settings
     ├── Database settings
     ├── Vector DB settings
     ├── Cache settings
     └── Application settings
             │
             ▼
       Application Components
```

This makes configuration easier to:

- inspect
- validate
- test
- change
- document
- reason about

---

# Configuration Should Not Leak Everywhere

Suppose a database password is read directly in ten different modules.

Now changing how configuration is loaded requires modifying ten locations.

A better design is:

```text
Environment
     │
     ▼
Configuration Layer
     │
     ▼
Database Component
```

The database component should receive the information it needs rather than independently discovering configuration everywhere.

This reduces coupling.

The broader software-design principles behind this belong to [ENG-03 — Software Engineering Principles](../ENG-03-Software-Engineering-Principles/README.md).

---

# Debugging Configuration Problems

Configuration bugs are often mistaken for application bugs.

Suppose an application says:

```text
Connection refused
```

You might immediately inspect application code.

But the actual problem could be:

```text
DATABASE_HOST=localhost
```

while the database is actually running somewhere else.

A systematic debugging process is better.

---

## Step 1 — Identify the Required Configuration

Ask:

```text
What values does the application require?
```

For example:

```text
DATABASE_URL
API_KEY
MODEL_NAME
```

---

## Step 2 — Check Whether the Variable Exists

From the shell:

```bash
printenv DATABASE_URL
```

Do not print sensitive values casually.

For secrets, prefer checking whether they are present rather than displaying the entire value.

For example, in Python:

```python
if os.getenv("API_KEY"):
    print("API key is configured")
else:
    print("API key is missing")
```

---

## Step 3 — Check the Process Environment

Remember:

> The environment of the shell is not necessarily identical to the environment of every process.

A service started by another mechanism may receive different configuration from your interactive terminal.

---

## Step 4 — Check Value Interpretation

Suppose:

```text
PORT=8000
```

Does the application parse it as:

```python
int("8000")
```

or accidentally treat it as text?

Similarly:

```text
DEBUG=false
```

must be interpreted correctly as a boolean.

---

## Step 5 — Check Configuration Precedence

The value you expect may be overridden by:

- another environment variable
- a configuration file
- command-line arguments
- framework defaults
- deployment configuration

Understand which source wins.

---

# A Configuration Debugging Mental Model

When an application behaves incorrectly because of configuration, think:

```text
Source
  ↓
Load
  ↓
Parse
  ↓
Validate
  ↓
Resolve precedence
  ↓
Application
```

Ask at each stage:

```text
Was the value supplied?
Was it loaded?
Was it parsed?
Was it valid?
Was it overridden?
Did the application actually use it?
```

This is much more effective than randomly changing settings.

---

# Common Environment Variable Mistakes

## Mistake 1 — Hardcoding Secrets

Bad:

```python
API_KEY = "real-secret"
```

Better:

```python
API_KEY = os.getenv("API_KEY")
```

And use an appropriate secret-management mechanism for sensitive production values.

---

## Mistake 2 — Committing `.env`

Bad:

```bash
git add .env
```

when `.env` contains credentials.

Use appropriate ignore rules and secret-management practices.

---

## Mistake 3 — Overwriting `PATH`

Dangerous:

```bash
export PATH="$HOME/bin"
```

Better when intentionally adding a directory:

```bash
export PATH="$HOME/bin:$PATH"
```

---

## Mistake 4 — Assuming Variables Have Types

This:

```text
DEBUG=false
```

does not automatically become a Boolean.

The application must parse it correctly.

---

## Mistake 5 — Silently Accepting Missing Critical Configuration

If an application absolutely requires:

```text
DATABASE_URL
```

letting the application continue with:

```text
DATABASE_URL=None
```

may only move the failure somewhere else.

Fail early when required configuration is missing.

---

## Mistake 6 — Scattering Configuration Reads

Avoid:

```python
os.getenv(...)
```

everywhere in the codebase.

Centralize configuration when the application becomes large enough to benefit from it.

---

## Mistake 7 — Printing Secrets During Debugging

This is dangerous:

```python
print(os.getenv("API_KEY"))
```

Logs and terminal output can persist longer than expected.

Debug presence, structure, or non-sensitive metadata instead.

---

# Production Perspective

In a production system, configuration becomes an operational concern.

A useful architecture is:

```text
Deployment Environment
        │
        ▼
Configuration / Secret Source
        │
        ▼
Application Process
        │
        ▼
Configuration Layer
        │
        ▼
Application Components
```

The exact mechanism depends on the deployment platform.

The important engineering properties are:

- configuration is externalized
- secrets are protected
- configuration is validated
- environments are separated
- changes are controlled
- required settings are documented
- sensitive values are not unnecessarily exposed

Later production modules will explore deployment, containers, cloud infrastructure, security, and operational systems in greater depth.

---

# Configuration and Reproducibility

Consider two developers running the same application.

Developer A has:

```text
MODEL_NAME=model-a
PORT=8000
```

Developer B has:

```text
MODEL_NAME=model-b
PORT=9000
```

The application code is identical.

But their behavior differs.

This means configuration is part of the reproducibility story.

A reproducible development environment should make configuration requirements explicit rather than relying on undocumented machine-specific settings.

This idea will become important in:

[15 — Reproducible Development Environments](./15-Reproducible-Development-Environments.md)

---

# Engineering Decisions

When designing configuration for an application, ask:

### 1. What belongs in configuration?

Usually values that vary by environment or deployment.

Examples:

```text
URLs
ports
feature settings
model names
database locations
log levels
credentials
```

---

### 2. What should remain in code?

Application behavior and stable business logic generally belong in code.

Do not turn every constant into an environment variable simply because you can.

Configuration has a cost.

Too much external configuration can make an application difficult to understand and operate.

---

### 3. Which values are secrets?

Identify values such as:

```text
passwords
API keys
tokens
private credentials
signing secrets
```

These require stronger handling than ordinary configuration.

---

### 4. What should have defaults?

Defaults are useful for safe, predictable configuration.

For example:

```text
LOG_LEVEL=INFO
PORT=8000
```

But critical production dependencies may need to be explicitly supplied.

---

### 5. When should the application fail?

If a required configuration value is missing or invalid, fail early.

A startup failure is often easier to diagnose than a delayed runtime failure.

---

# Production Configuration Checklist

Before considering configuration well-designed, ask:

```text
[ ] Is configuration separate from application logic?
[ ] Are required values documented?
[ ] Are sensitive values protected?
[ ] Are secrets excluded from source control?
[ ] Are configuration values validated?
[ ] Are environment differences explicit?
[ ] Are defaults intentional?
[ ] Is configuration centralized?
[ ] Is PATH modified safely?
[ ] Are configuration errors easy to diagnose?
```

---

# Common Misconceptions

### "Environment variables are only for secrets."

No.

They can contain many types of configuration.

Secrets are only one use case.

---

### "Environment variables are automatically secure."

No.

They are simply one way to supply values to a process.

Security depends on how they are stored, injected, accessed, logged, and managed.

---

### "`.env` is a production secret manager."

No.

`.env` files are primarily a convenient configuration mechanism, especially for local development.

---

### "Environment variables persist everywhere."

No.

Their lifetime and availability depend on the process and environment in which they are defined.

---

### "All environment variables are global."

No.

A variable available to one shell or process does not mean every process on the machine automatically sees the same value.

---

## Interview Questions

## Conceptual

1. What is an environment variable?
2. Why are environment variables useful?
3. What is the difference between a shell variable and an exported environment variable?
4. How does a child process receive environment variables?
5. Why should configuration generally be separated from application code?
6. What is the difference between environment variables and configuration files?
7. Why are environment variables strings?
8. Why is `PATH` important?

## Engineering

9. How would you configure the same application for development, testing, and production?
10. How would you prevent secrets from being committed to Git?
11. Why might `.env` files be useful locally but insufficient for production secret management?
12. How would you debug an application that appears to be using the wrong configuration?
13. Why should required configuration be validated during startup?
14. What problems can occur if configuration is read independently throughout a large codebase?
15. How would you design configuration for a GenAI application using an LLM API, PostgreSQL, Redis, and a vector database?

## Scenario

You deploy a FastAPI application.

The application works locally but fails in another environment with:

```text
Database connection failed
```

The source code is identical.

What would you inspect first?

A strong engineering answer should reason through:

```text
Configuration source
      ↓
Environment variables
      ↓
Configuration loading
      ↓
Parsing
      ↓
Validation
      ↓
Actual process environment
      ↓
Database connectivity
```

Do not immediately assume the Python application code is wrong.

---

# Quick Revision

Remember these ideas:

```text
Environment variable
        ↓
External value supplied to a process
```

```text
Shell variable
        ↓
Variable inside shell
```

```text
export
        ↓
Makes variable available to child processes
```

```text
PATH
        ↓
Directories used for command lookup
```

```text
Configuration
        ↓
How the application operates in an environment
```

```text
Secret
        ↓
Sensitive configuration requiring stronger protection
```

```text
Fail fast
        ↓
Validate required configuration early
```

The core mental model is:

```text
Environment
     │
     ▼
Process
     │
     ▼
Configuration
     │
     ▼
Application
```

---

# Key Takeaways

1. Environment variables provide external values to processes.
2. They allow application behavior to vary without modifying application source code.
3. Shell variables and environment variables are related but not identical.
4. `export` makes a shell variable available to child processes.
5. Environment variables are received as strings and often require parsing.
6. `PATH` is a practical and important environment variable.
7. Configuration should be separated from application logic.
8. Configuration should be centralized and validated when appropriate.
9. Secrets should never be treated as safe simply because they are environment variables.
10. Local `.env` files can be useful but require careful handling.
11. Required configuration should generally fail fast when missing or invalid.
12. Development, testing, and production can share the same application code while using different configuration.
13. Configuration is part of reproducibility and operational engineering.
14. Good configuration design reduces environment-specific code and improves maintainability.

---

## Further Reading

For deeper understanding, explore:

- Linux environment and process environments
- Shell startup files
- Bash and POSIX shell documentation
- Python `os` module
- Python application configuration patterns
- Twelve-Factor App configuration principles
- Secret-management systems
- Configuration validation libraries
- Environment-aware application design

Recommended next repository chapter:

[09 — Development Environment Setup](./09-Development-Environment-Setup.md)

The next chapter moves from individual configuration concepts toward assembling a practical development environment for engineering work.

---

## Connection to the Next Chapter

So far, we have built the following chain:

```text
Linux
  ↓
Filesystem
  ↓
Shell
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
```

Now we can put these concepts together.

A development environment is not simply:

```text
"Install Python"
```

It is a combination of:

```text
Operating System
       +
Shell
       +
Tools
       +
Packages
       +
Permissions
       +
Environment Variables
       +
Project Structure
       +
Dependency Isolation
```

That is the focus of the next chapter.

---

# End of Document

This completes the Markdown file:

`08-Environment-Variables-and-Configuration.md`

All parts can now be combined into a single production-ready Markdown document for the GitHub repository.
