# 05 — Users, Groups & Permissions

## Learning Objectives

By the end of this chapter, you should be able to:

- Explain why Linux uses users, groups, ownership, and permissions.
- Understand the relationship between users, groups, and filesystem objects.
- Identify the owner and group associated with a file or directory.
- Understand Linux's basic permission model.
- Read permission information from `ls -l`.
- Understand read, write, and execute permissions.
- Explain how permissions differ for files and directories.
- Change file and directory permissions using `chmod`.
- Understand symbolic and numeric permission notation.
- Change ownership and group ownership using `chown` and `chgrp`.
- Understand practical permission problems in development environments.
- Apply the principle of least privilege when working on Linux systems.
- Diagnose common "permission denied" errors systematically.

---

## Prerequisites

Before starting this chapter, you should understand:

- Linux fundamentals
- Linux filesystem hierarchy
- Absolute and relative paths
- Basic shell and command-line usage
- Files and directory operations

Recommended previous chapters:

- [01 — Linux Fundamentals](./01-Linux-Fundamentals.md)
- [02 — Linux Filesystem](./02-Linux-Filesystem.md)
- [03 — Shell & Command Line](./03-Shell-and-Command-Line.md)
- [04 — Files, Directories & File Operations](./04-Files-Directories-and-File-Operations.md)

### Important Boundary

This chapter focuses on the **practical Linux permission and ownership model required by software engineers**.

It does not deeply cover:

- Advanced Linux security
- SELinux or AppArmor
- ACL administration
- Kernel security mechanisms
- Enterprise identity management
- Advanced system administration
- Production security hardening

Those topics belong to later infrastructure and security areas of the curriculum.

---

## Estimated Reading Time

**30–35 minutes**

---

## Before We Start

Imagine a Linux machine shared by several people:

```text
Developer A
Developer B
System Administrator
Application Process
Monitoring Service
```

They may all interact with the same filesystem.

Now consider:

```text
database-passwords.txt
application.log
model.bin
configuration.yaml
```

Should every user be allowed to:

```text
Read?
Modify?
Delete?
Execute?
```

Clearly, the answer is often **no**.

Linux therefore needs a mechanism to answer:

> **Who is allowed to do what to this object?**

This is where:

```text
Users
Groups
Ownership
Permissions
```

come together.

---

# 1. Why Does Linux Need Permissions?

Without access control, every process or user could potentially modify any file.

That would create serious problems.

For example:

```text
Application configuration
        │
        ├── Developer → modify
        ├── Application → read
        └── Unknown user → modify?
```

If the third case were always allowed, the system would be difficult to protect.

Linux instead establishes boundaries.

A simplified model is:

```text
User
  │
  ▼
Group membership
  │
  ▼
Filesystem object
  │
  ▼
Permissions
  │
  ▼
Allowed / denied operation
```

---

# 2. The Core Mental Model

For a filesystem object, think in terms of:

```text
WHO?
  │
  ├── Owner
  ├── Group
  └── Others

WHAT?
  │
  ├── Read
  ├── Write
  └── Execute
```

This gives the basic Linux permission model:

```text
             Permissions
                  │
       ┌──────────┼──────────┐
       ▼          ▼          ▼
    Owner       Group      Others
       │          │          │
      rwx        rwx        rwx
```

This model is simple, but it is foundational.

---

# 3. Users

A **user** represents an identity recognized by the Linux system.

A user can:

- Own files
- Belong to groups
- Run processes
- Access resources according to permissions

You can inspect the current username using:

```bash
whoami
```

For example:

```text
vineet
```

This answers:

> Which user identity am I currently operating as?

---

# 4. User Identity Is More Than a Name

Internally, Linux associates users with identifiers.

A user commonly has:

```text
Username
UID
Primary group
Supplementary groups
Home directory
Shell
```

The username is what humans normally interact with.

The UID is the numeric identity used by the operating system.

You can inspect identity information with:

```bash
id
```

For example, output may look conceptually like:

```text
uid=1000(vineet) gid=1000(vineet) groups=1000(vineet),27(sudo)
```

The exact values depend on the system.

The important idea is:

```text
Human-readable identity
        ↓
Linux identity information
        ↓
Permission decisions
```

---

# 5. Groups

A **group** is a collection of users.

Groups provide a convenient way to manage shared access.

Suppose:

```text
Alice
Bob
Charlie
```

all work on the same project.

Instead of granting permissions individually, Linux can place them into:

```text
developers
```

Then a project resource can be associated with that group.

Conceptually:

```text
developers
    │
    ├── Alice
    ├── Bob
    └── Charlie
```

This is one of the main reasons groups exist:

> Groups allow access to be managed for a set of users.

---

# 6. Why Groups Matter in Engineering

Consider a shared application directory:

```text
/opt/my-app/
```

Several engineers may need to inspect application files.

A group can represent:

```text
application-team
```

Then access can be managed around that group rather than individual usernames.

This scales better conceptually:

```text
Individual permissions
        ↓
Many individual rules

Group permissions
        ↓
One logical team boundary
```

Groups therefore become useful for:

- Shared development environments
- Team directories
- Application resources
- Service accounts
- Shared operational tasks

---

# 7. Ownership

Every filesystem object has ownership information.

At a practical level, an object is associated with:

```text
User owner
Group owner
```

For example:

```text
app.py
Owner:  vineet
Group:  developers
```

You can inspect ownership with:

```bash
ls -l app.py
```

A simplified output may look like:

```text
-rw-r--r-- 1 vineet developers 1200 Oct 8 10:30 app.py
```

The relevant part is:

```text
vineet developers
```

which represents:

```text
owner  group
```

---

# 8. Reading `ls -l`

Consider:

```text
-rw-r--r-- 1 vineet developers 1200 Oct 8 10:30 app.py
```

A simplified breakdown is:

```text
-rw-r--r--
│
├── object type
│
├── owner permissions
├── group permissions
└── others permissions
```

The permission section:

```text
rw-r--r--
```

can be divided into:

```text
rw-
r--
r--
```

Therefore:

```text
Owner   → rw-
Group   → r--
Others  → r--
```

---

# 9. The Three Basic Permissions

Linux commonly uses three basic permission types:

```text
r → read
w → write
x → execute
```

These permissions are evaluated for:

```text
Owner
Group
Others
```

Therefore, a permission string can conceptually be represented as:

```text
Owner   Group   Others
 rwx     rwx     rwx
```

---

# 10. Read Permission

For a regular file:

```text
r
```

generally means the user can read the file's contents.

For example:

```bash
cat config.yaml
```

requires the ability to read the file.

Without read permission, the operation may fail with:

```text
Permission denied
```

---

# 11. Write Permission

For a regular file:

```text
w
```

generally means the user can modify its contents.

For example, editing:

```text
config.yaml
```

requires appropriate write access.

Write permission does not automatically mean:

```text
"I can do anything involving this file."
```

The surrounding directory's permissions also matter.

This distinction becomes particularly important when deleting or renaming files.

---

# 12. Execute Permission

For a regular file:

```text
x
```

generally means the file may be executed as a program when the file format and other conditions allow it.

For example:

```bash
./script.sh
```

requires appropriate execute permission.

A common pattern is:

```text
-rwxr-xr-x
```

which indicates execute permission for the owner, group, and others according to the displayed bits.

---

# 13. Permissions on Directories Are Different

This is one of the most important concepts in this chapter.

For a directory:

```text
r
w
x
```

do not mean exactly the same thing as they do for a regular file.

A useful practical interpretation is:

### Read (`r`)

Allows listing directory entries.

### Write (`w`)

Allows creating, deleting, or renaming entries within the directory when the required combination of permissions is present.

### Execute (`x`)

Allows traversing/accessing entries within the directory.

Think:

```text
Directory
   │
   ├── r → inspect names
   ├── w → modify entries
   └── x → traverse/access
```

This distinction explains many confusing permission errors.

---

# 14. Why Directory Execute Permission Matters

Suppose you have:

```text
project/
└── config/
    └── app.yaml
```

You may know the exact path:

```text
project/config/app.yaml
```

But accessing the file also requires appropriate permission to traverse the directories in the path.

Therefore, permissions are not simply:

```text
File permission
```

They can involve:

```text
Parent directory
       ↓
Subdirectory
       ↓
File
```

This is why a file can appear to have appropriate permissions while access still fails.

---

# 15. Permission Categories

Linux evaluates permissions according to three categories:

```text
Owner
Group
Others
```

Suppose:

```text
-rw-r-----
```

Conceptually:

```text
Owner → rw-
Group → r--
Others → ---
```

Therefore:

```text
Owner:
read + write

Group:
read

Others:
no access
```

This simple structure is the foundation of Linux filesystem access control.

---

# 16. Numeric Permission Notation

Permissions can also be represented numerically.

The basic mapping is:

```text
read    = 4
write   = 2
execute = 1
```

You add the values.

For example:

```text
rwx
```

becomes:

```text
4 + 2 + 1 = 7
```

Similarly:

```text
rw-
```

becomes:

```text
4 + 2 = 6
```

And:

```text
r--
```

becomes:

```text
4
```

---

# 17. Understanding `755`

A common permission representation is:

```text
755
```

Break it into:

```text
7 5 5
│ │ │
│ │ └── Others
│ └──── Group
└────── Owner
```

Now translate:

```text
7 = rwx
5 = r-x
5 = r-x
```

Therefore:

```text
Owner   → rwx
Group   → r-x
Others  → r-x
```

This pattern is commonly used for executable files and directories, although the appropriate permission depends on the specific security requirement.

---

# 18. Understanding `644`

Another common pattern is:

```text
644
```

Translate:

```text
6 = rw-
4 = r--
4 = r--
```

Therefore:

```text
Owner   → rw-
Group   → r--
Others  → r--
```

This is a common baseline for ordinary non-executable files where broader read access is appropriate.

Again, the correct permission depends on the actual use case.

---

# 19. Changing Permissions with `chmod`

The command used to modify permissions is:

```bash
chmod
```

For example:

```bash
chmod 755 script.sh
```

This changes the permission bits according to the numeric mode.

You can also use symbolic notation.

For example:

```bash
chmod u+x script.sh
```

Here:

```text
u → user/owner
+ → add
x → execute
```

So:

```text
u+x
```

means:

> Add execute permission for the owner.

---

# 20. Symbolic Permission Notation

Common categories include:

```text
u → user/owner
g → group
o → others
a → all
```

Operators include:

```text
+ → add permission
- → remove permission
= → set exact permission
```

Examples:

```bash
chmod u+x script.sh
```

Add execute permission for owner.

```bash
chmod g+w project.txt
```

Add write permission for the group.

```bash
chmod o-r secret.txt
```

Remove read permission from others.

The important advantage of symbolic notation is that the intended change can be very explicit.

---

# 21. Numeric vs Symbolic `chmod`

Both approaches are useful.

### Numeric

```bash
chmod 644 file.txt
```

Advantages:

- Compact
- Familiar
- Good when you know the complete desired mode

### Symbolic

```bash
chmod u+x script.sh
```

Advantages:

- Communicates the specific change
- Reduces accidental changes to unrelated permission bits

Engineering judgment matters more than memorizing one preferred style.

---

# 22. Changing Ownership

Ownership can be changed using:

```bash
chown
```

For example:

```bash
sudo chown vineet app.py
```

This changes the owner of the file.

Ownership changes are generally privileged operations because allowing arbitrary users to change ownership could undermine access control.

You may also change owner and group together:

```bash
sudo chown vineet:developers app.py
```

Conceptually:

```text
Owner → vineet
Group → developers
```

---

# 23. Changing Group Ownership

The group associated with an object can also be changed.

A common command is:

```bash
chgrp
```

For example:

```bash
sudo chgrp developers shared-project/
```

The result changes the group ownership.

This can be useful when configuring shared project resources.

---

# 24. Why `sudo` Appears

You will often see commands such as:

```bash
sudo chown ...
```

or:

```bash
sudo chmod ...
```

`sudo` allows an authorized user to execute a command with elevated privileges.

The important engineering principle is:

> Elevated privileges should be used only when necessary.

Do not automatically prepend:

```bash
sudo
```

to commands just because a permission error occurred.

First determine:

```text
Why is permission denied?
```

---

# 25. Diagnose Before Using `sudo`

Suppose:

```bash
cat config.yaml
```

returns:

```text
Permission denied
```

A weak troubleshooting approach is:

```bash
sudo cat config.yaml
```

A stronger approach is to investigate.

Ask:

```text
Who am I?
What is the file's owner?
What is its group?
What permissions does it have?
What permissions do the parent directories have?
Why should my user have access?
```

Useful commands include:

```bash
whoami
```

```bash
id
```

```bash
ls -l config.yaml
```

and inspection of the relevant directory.

This is the difference between:

```text
Workaround
```

and:

```text
Root-cause diagnosis
```

---

# 26. A Permission Debugging Workflow

When you encounter:

```text
Permission denied
```

use this sequence:

```text
1. Identify current user
        ↓
2. Inspect target
        ↓
3. Inspect owner/group
        ↓
4. Inspect permissions
        ↓
5. Check group membership
        ↓
6. Check parent directories
        ↓
7. Determine intended access
        ↓
8. Apply minimum required change
        ↓
9. Verify
```

This workflow is more reliable than guessing.

---

# 27. Example: Permission Denied

Suppose:

```bash
cat secrets.txt
```

returns:

```text
Permission denied
```

Start with:

```bash
whoami
```

Then:

```bash
ls -l secrets.txt
```

Suppose:

```text
-rw------- 1 admin admin 250 secrets.txt
```

Now the problem becomes easier to reason about.

The file is owned by:

```text
admin
```

and only the owner has read/write access.

If you are:

```text
vineet
```

and not the owner, the denial is expected.

The correct solution is not automatically:

```bash
sudo cat secrets.txt
```

The correct solution depends on the intended access model.

---

# 28. Principle of Least Privilege

A fundamental security principle is:

> Give users and processes only the permissions they actually need.

Suppose an application only needs to read:

```text
model.bin
```

It may not need:

```text
write
delete
execute
```

Giving unnecessary permissions increases risk.

Think:

```text
Required access
      ↓
Minimum permissions
      ↓
Smaller attack surface
```

This principle applies to:

- Users
- Applications
- Services
- Databases
- Cloud resources
- Containers
- AI systems

Linux filesystem permissions provide an early practical example of this broader security principle.

---

# 29. Shared Project Directories

Suppose a team needs to collaborate on:

```text
/shared/project/
```

A useful conceptual design is:

```text
/shared/project/
        │
        ▼
developers group
        │
        ├── Alice
        ├── Bob
        └── Charlie
```

The directory can be owned by an appropriate account and group, with permissions designed around the team's actual needs.

This is often better than manually granting individual access to every file.

The important design principle is:

> Model permissions around organizational roles and responsibilities.

---

# 30. Permissions and Git Repositories

A Git repository is still stored on a filesystem.

For example:

```text
project/
├── .git/
├── src/
├── tests/
└── README.md
```

Therefore Linux permissions can affect:

- Reading repository files
- Creating files
- Modifying files
- Executing scripts
- Running development tools

Git itself does not replace filesystem permissions.

The two systems operate at different layers:

```text
Git
 ↓
Version history and collaboration

Linux permissions
 ↓
Operating-system filesystem access
```

Git concepts remain owned by ENG-04.

---

# 31. Permissions and Python Environments

Development environments can also be affected by ownership.

Suppose a Python environment was created using one account:

```text
venv/
├── bin/
├── lib/
└── ...
```

and another account later attempts to modify it.

The second account may encounter:

```text
Permission denied
```

The problem may be ownership rather than Python itself.

This is a common development-environment issue.

It reinforces the principle:

> Software tools operate within the operating system's permission model.

---

# 32. Permissions and AI/GenAI Projects

Consider a project containing:

```text
genai-project/
├── configs/
├── datasets/
├── models/
├── logs/
├── embeddings/
└── secrets/
```

Different resources may require different access.

For example:

```text
datasets/
   ↓
Researchers → read

models/
   ↓
Application → read

logs/
   ↓
Application → write
Engineers → read

secrets/
   ↓
Restricted access
```

This is much better than:

```text
Everyone → full access
```

The actual implementation depends on the deployment architecture, but the access-control reasoning remains the same.

---

# 33. File Permissions Are Not the Entire Security Model

It is important not to overgeneralize.

Linux permissions are one layer of security.

A broader system may also involve:

```text
Filesystem permissions
        +
Process identity
        +
Network controls
        +
Application authentication
        +
Authorization
        +
Secrets management
        +
Container isolation
        +
Cloud IAM
```

Therefore:

> Linux permissions are foundational, but they are not a complete security architecture.

Advanced security belongs later in the curriculum.

---

# 34. Production Perspective

In production systems, incorrect permissions can cause two opposite classes of failure.

### Too restrictive

```text
Application cannot read configuration
        ↓
Service fails
```

or:

```text
Application cannot write logs
        ↓
Observability is degraded
```

### Too permissive

```text
Unnecessary users/processes can modify sensitive files
        ↓
Security risk
```

Therefore, production permission design requires balance:

```text
Availability
      +
Security
      +
Operational simplicity
```

---

# 35. Common Permission Mistakes

## Mistake 1 — Running everything with `sudo`

This hides the underlying permission problem.

Use elevated privileges only when the operation genuinely requires them.

---

## Mistake 2 — Using `chmod 777` as a universal fix

You may see:

```bash
chmod 777 file
```

suggested as a quick solution.

This grants broad permissions:

```text
read + write + execute
```

to owner, group, and others.

It is often an inappropriate solution because it removes useful access boundaries.

The better question is:

> What minimum permission is actually required?

---

## Mistake 3 — Confusing file and directory permissions

`r`, `w`, and `x` have different practical meanings for directories.

---

## Mistake 4 — Ignoring ownership

A permission problem may be caused by:

```text
wrong owner
```

rather than insufficient permission bits.

---

## Mistake 5 — Forgetting group membership

A file may be correctly configured for a group, but your user may not belong to that group.

Check:

```bash
id
```

---

## Mistake 6 — Ignoring parent directories

You may have permission on the file but lack the ability to traverse one of its parent directories.

---

## Mistake 7 — Changing permissions without understanding the target

Before:

```bash
chmod ...
```

understand:

```text
Which object?
Which users?
Which permissions?
Why?
```

---

# 36. Engineering Decisions

When designing access to a file or directory, ask:

### Who needs access?

```text
Owner?
Team?
Application?
Everyone?
```

### What access is required?

```text
Read?
Write?
Execute?
```

### Can a group represent the required access?

If yes, group-based access may be preferable to individual configuration.

### What is the minimum required permission?

Apply the principle of least privilege.

### Is the object sensitive?

Examples:

```text
Credentials
Private keys
Configuration
Personal data
```

Sensitive objects generally require tighter access.

### Is the change temporary or permanent?

Temporary permission changes can become long-term security problems if forgotten.

---

# 37. A Practical Permission Design Example

Suppose an application needs:

```text
Read configuration
Write logs
Read model files
```

A simplistic approach might be:

```text
Application → full access to everything
```

A better mental model is:

```text
config/
   ↓
read

logs/
   ↓
write

models/
   ↓
read
```

Different resources can have different access policies.

This is the beginning of **least-privilege system design**.

---

# 38. Permission Troubleshooting Example

Suppose an API service fails with:

```text
Permission denied: '/app/logs/application.log'
```

Do not immediately change permissions.

Investigate:

```text
Who is running the application?
        ↓
Which user owns application.log?
        ↓
Which group owns it?
        ↓
Does the application user belong to that group?
        ↓
Does the logs directory allow traversal?
        ↓
Does the application need write access?
```

This reasoning is much more valuable than memorizing:

```bash
chmod 777 logs/
```

The latter may make the symptom disappear while creating a security problem.

---

# 39. Interview Perspective

You should be able to explain these concepts without memorizing definitions.

### Question 1

**Why does Linux have users and groups?**

Explain identity, ownership, and shared access management.

---

### Question 2

**What does `rwxr-xr-x` mean?**

Break it into owner, group, and others.

---

### Question 3

**What is the difference between `644` and `755`?**

Explain the corresponding permission bits.

---

### Question 4

**What does execute permission mean for a directory?**

Explain directory traversal/access rather than treating it as simply "run the directory."

---

### Question 5

**What is the difference between `chmod` and `chown`?**

`chmod` changes permission bits.

`chown` changes ownership.

---

### Question 6

**Why is `chmod 777` usually a poor solution?**

Explain excessive permissions and the principle of least privilege.

---

### Question 7

**A file has `644` permissions but you still receive `Permission denied`. Why might that happen?**

Possible causes include:

- Incorrect ownership
- User/group mismatch
- Parent-directory permissions
- Other security mechanisms

---

### Question 8

**Why should you investigate before using `sudo`?**

Because elevated privileges can hide the actual access-control problem and should not be used unnecessarily.

---

### Question 9

**Why are groups useful?**

They allow permissions to be managed around logical sets of users rather than individual accounts.

---

### Question 10

**How would you debug a permission error in production?**

Explain a systematic workflow rather than immediately changing permissions.

---

## 40. Quick Revision

Remember the core model:

```text
                    FILESYSTEM OBJECT
                           │
              ┌────────────┴────────────┐
              │                         │
            Owner                     Group
              │                         │
              └────────────┬────────────┘
                           │
                        Permissions
                           │
                 ┌─────────┼─────────┐
                 ▼         ▼         ▼
                 r         w         x
               read      write    execute
```

Permission categories:

```text
u → owner
g → group
o → others
```

Common commands:

```text
whoami
↓
Current user

id
↓
Identity and groups

ls -l
↓
Ownership and permissions

chmod
↓
Change permissions

chown
↓
Change ownership

chgrp
↓
Change group ownership
```

Numeric values:

```text
r = 4
w = 2
x = 1
```

Common modes:

```text
644 → rw- r-- r--
755 → rwx r-x r-x
```

Core debugging model:

```text
Who am I?
    ↓
Who owns it?
    ↓
Which group?
    ↓
What permissions?
    ↓
What parent directories?
    ↓
What access is actually required?
    ↓
Apply minimum change
    ↓
Verify
```

---

# 41. Key Takeaways

1. Linux uses users, groups, ownership, and permissions to control filesystem access.
2. Every filesystem object has ownership information.
3. Permissions are evaluated for the owner, group, and others.
4. The basic permission types are read, write, and execute.
5. Directory permissions have different practical meanings from regular-file permissions.
6. `chmod` changes permission bits.
7. `chown` changes ownership.
8. `chgrp` changes group ownership.
9. Numeric permissions such as `644` and `755` represent combinations of `r`, `w`, and `x`.
10. `sudo` provides elevated privileges but should not be used as a default solution to permission errors.
11. Permission problems should be diagnosed systematically.
12. `chmod 777` is not a general-purpose fix and often violates least-privilege principles.
13. Groups provide a scalable way to manage shared access.
14. Parent-directory permissions can affect access to a file.
15. Linux filesystem permissions are one layer of a larger security model.
16. Good permission design balances functionality, security, and operational simplicity.

---

## 42. Further Reading

Recommended references:

- Linux manual pages for `chmod`, `chown`, `chgrp`, `id`, `whoami`, and `ls`
- GNU Coreutils documentation
- Linux filesystem permission documentation
- Bash documentation for command execution and user environments

When investigating a permission problem, prefer documentation and observation over blindly applying permission changes.

---

## 43. Connection to the Next Chapter

You now understand:

```text
Who am I?
      ↓
Who owns a resource?
      ↓
Which group has access?
      ↓
What permissions exist?
      ↓
Why access is allowed or denied
```

But files are not the only things running on Linux.

Applications are also executing as **processes**.

Those processes have:

- Users
- Environment
- Resources
- Lifecycles
- States

The next chapter connects your understanding of Linux users and permissions with the programs actually running on the system.

Continue with:

**[06 — Processes & Process Management](./06-Processes-and-Process-Management.md)**

---

# End of Document

This completes the Markdown file:

`05-Users-Groups-and-Permissions.md`

All parts can now be combined into a single production-ready Markdown document for the GitHub repository.
