File: `08-File-Handling.md`
---

# File Handling

> **Domain:** Engineering Foundations (ENG)
> **Module:** ENG-02 — Programming Foundations
> **Document:** `08-File-Handling.md`

---

## Learning Objectives

After completing this chapter, you should be able to:

* Understand why file handling exists.
* Explain the difference between volatile and persistent data.
* Understand how Python interacts with files.
* Learn how to open, read, write, append, and close files.
* Understand different file modes.
* Learn why resource management is important.
* Connect file handling to production software engineering.

---

## Prerequisites

Before reading this chapter, you should have completed:

* `01-Programming-Fundamentals.md`
* `02-Variables-and-Data-Types.md`
* `03-Operators-and-Expressions.md`
* `04-Control-Flow.md`
* `05-Functions.md`
* `06-Modules-and-Packages.md`
* `07-Exception-Handling.md`

You should already understand:

* Variables
* Functions
* Exception Handling
* Modules
* Basic Python Programs

---

## Estimated Reading Time

**60–70 minutes**

---

## Before We Start

## Question

Imagine you write this program.

```python
name = "Vineet"

print(name)
```

Everything works.

Now you close the program.

Later, you run it again.

What happens to the value stored in:

```text
name
```

It disappears.

Why?

Because variables live only while the program is running.

Once the program exits, memory is released.

---

## Think for a Moment

Suppose you're building:

* A banking system
* A hospital management system
* An AI chatbot
* A matrimonial application
* A photo editor

Can customer data disappear every time the application closes?

Of course not.

Programs need a way to store information **permanently**.

That solution is called **File Handling**.

---

# Why This Exists

Computer memory (RAM) is temporary.

Anything stored in RAM disappears when:

* The program exits
* The computer shuts down
* The operating system restarts

Many applications need information that survives these events.

Examples:

* Configuration files
* User preferences
* Logs
* Reports
* Images
* Videos
* Documents
* AI datasets
* Model checkpoints

Files provide persistent storage.

---

> **Engineering Note**
>
> Before databases became common, nearly every application stored information directly in files. Even today, production systems rely heavily on files for configuration, logging, backups, machine learning datasets, model weights, certificates, and application assets.

---

## Mental Model

Before learning Python syntax, let's build intuition.

## Analogy: Notebook vs Whiteboard

Imagine writing on a whiteboard.

```text
Write Notes

↓

Erase Board

↓

Notes Lost
```

A whiteboard behaves like RAM.

Now imagine writing in a notebook.

```text
Write Notes

↓

Close Notebook

↓

Open Tomorrow

↓

Notes Still There
```

A notebook behaves like a file.

Files provide **persistent storage**.

---

# What Is a File?

A file is a collection of data stored permanently on secondary storage such as:

* SSD
* HDD
* USB Drive
* Cloud Storage

Examples include:

```text
resume.pdf

photo.jpg

report.docx

config.json

notes.txt

model.pkl

weights.bin
```

Every file has:

* A name
* A location (path)
* A format
* Stored data

---

# Why Programs Use Files

Without files:

```text
Program Starts

↓

Create Data

↓

Program Ends

↓

Everything Lost
```

With files:

```text
Program Starts

↓

Read File

↓

Process Data

↓

Write File

↓

Program Ends

↓

Data Still Exists
```

This persistence is fundamental to modern software.

---

# Types of Files

Files can be broadly classified into two categories.

## Text Files

Contain human-readable text.

Examples:

```text
notes.txt

config.ini

data.csv

README.md

program.py

index.html
```

You can open these with a text editor.

---

## Binary Files

Contain raw bytes rather than readable text.

Examples:

```text
photo.png

music.mp3

movie.mp4

model.pt

weights.bin

archive.zip
```

Opening these in a text editor usually displays unreadable characters.

---

# File Extensions

A file extension often indicates the type of data stored.

| Extension | Description                |
| --------- | -------------------------- |
| `.txt`    | Plain text                 |
| `.csv`    | Comma-separated values     |
| `.json`   | JavaScript Object Notation |
| `.xml`    | XML document               |
| `.py`     | Python source code         |
| `.md`     | Markdown                   |
| `.jpg`    | Image                      |
| `.png`    | Image                      |
| `.pdf`    | PDF document               |
| `.zip`    | Compressed archive         |

The extension is a convention, not the actual data format.

---

## How Programs Access Files

A program cannot directly manipulate storage devices.

Instead, it requests the operating system to perform file operations.

Conceptually:

```text
Python Program

↓

Operating System

↓

Filesystem

↓

SSD / HDD

↓

File
```

Notice the connection with the previous module:

> File handling relies on the operating system and filesystem concepts studied in **ENG-01**.

---

# File Operations

Most programming languages support a common set of file operations.

```text
Create

↓

Open

↓

Read

↓

Write

↓

Close
```

Additional operations include:

* Rename
* Delete
* Copy
* Move
* Append

We'll study each of these throughout this chapter.

---

# Why Closing Files Matters

Suppose a program opens a file.

```text
Open File

↓

Read Data

↓

???
```

What should happen next?

The file must be closed.

Closing a file tells the operating system:

* The program has finished using it.
* Resources can be released.
* Buffered data can be written to disk.
* Other programs may safely access it.

Leaving files open unnecessarily can lead to:

* Resource leaks
* Locked files
* Data corruption
* Performance issues

---

## Remember

* Variables store temporary data in memory.
* Files store data permanently on storage devices.
* File handling allows programs to persist information across executions.
* Files can be text or binary.
* Programs access files through the operating system.
* Opening and closing files correctly is essential for reliable software.

---
# Opening Files

## Question

Suppose a book is lying on your desk.

Can you start reading it immediately?

Not exactly.

First you:

* Pick it up.
* Open it.
* Read its contents.

Files work the same way.

Before a program can read or modify a file, it must **open** it.

---

## Why Opening a File Is Necessary

Files are managed by the operating system.

When a program wants to access one, it sends a request to the OS.

Conceptually:

```text
Python Program

↓

Request File

↓

Operating System

↓

Open File

↓

Return File Handle
```

The operating system verifies:

* Does the file exist?
* Does the program have permission?
* Is another program locking the file?

Only after these checks does Python receive access.

---

# The `open()` Function

Python provides the built-in `open()` function.

General syntax:

```python
file = open(filename, mode)
```

Example:

```python
file = open("notes.txt", "r")
```

Here:

* `"notes.txt"` is the file name.
* `"r"` is the mode.
* `file` stores the file object returned by Python.

---

# What Is a File Object?

When Python opens a file, it does **not** store the file's contents directly.

Instead, it creates a **file object**.

Think of the file object as a remote control for the file.

Conceptually:

```text
notes.txt

↓

open()

↓

File Object

↓

Read

Write

Close
```

The file object provides methods for interacting with the file.

---

# File Modes

When opening a file, Python needs to know what you intend to do.

Examples include:

* Read
* Write
* Append
* Read and Write

This is specified using the **mode**.

---

## Common File Modes

| Mode   | Meaning         | File Must Exist? | Existing Data            |
| ------ | --------------- | ---------------- | ------------------------ |
| `"r"`  | Read            | Yes              | Preserved                |
| `"w"`  | Write           | No               | Deleted if file exists   |
| `"a"`  | Append          | No               | Preserved                |
| `"x"`  | Create new file | Must not exist   | New file only            |
| `"r+"` | Read and write  | Yes              | Preserved                |
| `"w+"` | Read and write  | No               | Existing contents erased |
| `"a+"` | Read and append | No               | Preserved                |

These modes determine how Python interacts with the file.

---

## Read Mode (`"r"`)

Used when you only want to read a file.

Example:

```python
file = open("notes.txt", "r")
```

Behavior:

* Opens an existing file.
* Allows reading.
* Does **not** allow writing.
* Raises `FileNotFoundError` if the file does not exist.

---

Conceptually:

```text
File Exists?

│

├── Yes

│      │

│      ▼

│ Open Successfully

│

└── No

       │

       ▼

FileNotFoundError
```

---

# Write Mode (`"w"`)

Used to write data into a file.

Example:

```python
file = open("report.txt", "w")
```

Behavior:

* Creates the file if it doesn't exist.
* Deletes existing contents if it does exist.
* Opens the file for writing.

---

Visualizing Write Mode

Suppose the file contains:

```text
Hello World
```

Opening with:

```python
open("report.txt", "w")
```

Immediately changes it to:

```text
(empty)
```

Everything is erased before new data is written.

---

> **Engineering Warning**
>
> `"w"` is destructive. If the file already contains important information, opening it in write mode permanently removes the existing contents.

---

# Append Mode (`"a"`)

Append mode adds new data without deleting existing data.

Example:

```python
file = open("log.txt", "a")
```

Suppose the file contains:

```text
Login Successful
```

Appending:

```text
Payment Completed
```

Results in:

```text
Login Successful

Payment Completed
```

Existing data remains intact.

---

Append Mode Visualization

```text
Original File

↓

Existing Data

↓

New Data Added

↓

Updated File
```

Append mode is commonly used for:

* Log files
* Audit trails
* Activity history
* Event recording

---

# Create Mode (`"x"`)

Create mode creates a brand-new file.

Example:

```python
file = open("new_file.txt", "x")
```

Behavior:

* Creates a new file.
* Raises `FileExistsError` if the file already exists.

This prevents accidental overwriting.

---

# Read and Write Modes

Python also supports combined modes.

Example:

```python
open("data.txt", "r+")
```

Allows:

* Reading
* Writing

without deleting existing contents.

Similarly:

```python
open("data.txt", "w+")
```

Allows reading and writing,

but first clears the file.

---

# Choosing the Correct Mode

Ask yourself:

> "What do I want to do?"

| Task                  | Recommended Mode |
| --------------------- | ---------------- |
| Read existing file    | `"r"`            |
| Create or overwrite   | `"w"`            |
| Add new information   | `"a"`            |
| Create only if absent | `"x"`            |
| Read and modify       | `"r+"`           |

Choosing the correct mode prevents accidental data loss.

---

## File Paths

A file can be identified by:

## Relative Path

Relative to the current project.

Example:

```python
open("data.txt", "r")
```

---

## Absolute Path

Complete location on the computer.

Example (Windows):

```text
C:\Users\Vineet\Documents\data.txt
```

Example (Linux/macOS):

```text
/home/vineet/data.txt
```

Production applications generally avoid hardcoding absolute paths because they reduce portability.

---

# File Opening Flow

Conceptually:

```text
Call open()

↓

Operating System Checks

↓

File Exists?

↓

Permissions Valid?

↓

Return File Object

↓

Program Uses File
```

If any step fails, Python raises an exception.

---

> **Engineering Note**
>
> Opening a file does **not** automatically load its entire contents into memory. Python creates a file object that allows the program to read or write data as needed, making it efficient even for large files.

---

## Remember

* Files must be opened before they can be accessed.
* `open()` returns a file object.
* File modes determine how the file can be used.
* `"r"` reads, `"w"` overwrites, `"a"` appends, and `"x"` creates new files.
* Choosing the correct file mode is essential to prevent accidental data loss.
* File paths can be relative or absolute.

---
# Reading Files

## Question

Suppose you've opened a file.

```python
file = open("notes.txt", "r")
```

Have you already read its contents?

No.

Opening a file only establishes a connection between your program and the file.

To actually retrieve the stored data, you must explicitly **read** it.

---

# Why Reading Is Separate from Opening

Imagine visiting a library.

Opening a book does not automatically mean you've read every page.

The process looks like this:

```text
Pick Book

↓

Open Book

↓

Read Pages

↓

Close Book
```

Python follows the same design.

Opening and reading are two different operations.

---

# The `read()` Method

The simplest way to read a file is using the `read()` method.

Example:

```python
file = open("notes.txt", "r")

content = file.read()

print(content)
```

Suppose `notes.txt` contains:

```text
Python
AI
Engineering
```

Output:

```text
Python
AI
Engineering
```

`read()` returns the contents as a single string.

---

# How `read()` Works

Conceptually:

```text
File

↓

read()

↓

Read Entire Contents

↓

Return String

↓

Store in Variable
```

The file itself is not modified.

Only its contents are copied into program memory.

---

# Reading a Specific Number of Characters

Sometimes you don't want the entire file.

You can specify the number of characters.

Example:

```python
file = open("notes.txt", "r")

print(file.read(6))
```

If the file contains:

```text
Python Programming
```

Output:

```text
Python
```

Python reads only the requested number of characters.

---

# The File Pointer

Every opened file has a **file pointer**.

The pointer remembers the current reading position.

Initially:

```text
Python Programming

^

Pointer
```

After:

```python
file.read(6)
```

the pointer moves.

```text
Python Programming

      ^

    Pointer
```

Reading again:

```python
print(file.read())
```

Output:

```text
 Programming
```

Notice that Python continues reading from the current pointer position.

---

# Reading Line by Line

Sometimes files are very large.

Reading the entire file into memory may not be efficient.

Python provides:

```python
readline()
```

Example:

```python
file = open("notes.txt", "r")

print(file.readline())
```

If the file contains:

```text
Apple
Banana
Orange
```

Output:

```text
Apple
```

Calling it again:

```python
print(file.readline())
```

Output:

```text
Banana
```

Each call reads the next line.

---

# Reading All Lines

Python also provides:

```python
readlines()
```

Example:

```python
file = open("notes.txt", "r")

lines = file.readlines()

print(lines)
```

Suppose the file contains:

```text
Apple
Banana
Orange
```

Output:

```python
[
    "Apple\n",
    "Banana\n",
    "Orange"
]
```

Notice that the result is a **list of strings**.

Each element represents one line.

---

# Iterating Over a File

One of the most efficient approaches is to iterate over the file directly.

Example:

```python
file = open("notes.txt", "r")

for line in file:
    print(line)
```

Conceptually:

```text
Open File

↓

Read One Line

↓

Process Line

↓

Read Next Line

↓

Repeat Until EOF
```

This avoids loading the entire file into memory.

It is the preferred approach for large files.

---

# End of File (EOF)

Eventually, Python reaches the end of the file.

Conceptually:

```text
File

↓

Pointer

↓

End of File (EOF)

↓

Nothing Left to Read
```

After EOF:

```python
file.read()
```

returns:

```text
```

(an empty string)

This indicates there is no more data.

---

# Writing Files

Reading retrieves data.

Writing stores new data.

Python uses the `write()` method.

Example:

```python
file = open("report.txt", "w")

file.write("Enterprise GenAI Engineering")
```

If the file did not exist, Python creates it.

If it already existed, its previous contents are erased because of `"w"` mode.

---

# What Does `write()` Return?

Many beginners assume:

```python
file.write(...)
```

returns the text that was written.

Actually, it returns the number of characters written.

Example:

```python
count = file.write("Python")

print(count)
```

Output:

```text
6
```

---

# Writing Multiple Lines

Example:

```python
file.write("Python\n")

file.write("AI\n")

file.write("Engineering\n")
```

Resulting file:

```text
Python
AI
Engineering
```

Notice the use of:

```text
\n
```

to create new lines.

---

# Appending to Files

Suppose:

```text
log.txt
```

already contains:

```text
Login Successful
```

Opening in append mode:

```python
file = open("log.txt", "a")

file.write("Payment Successful\n")
```

Results in:

```text
Login Successful
Payment Successful
```

The previous content remains unchanged.

---

# Reading vs Writing

| Operation        | Method             | Purpose                   |
| ---------------- | ------------------ | ------------------------- |
| Read entire file | `read()`           | Returns entire contents   |
| Read one line    | `readline()`       | Returns next line         |
| Read all lines   | `readlines()`      | Returns list of lines     |
| Iterate          | `for line in file` | Efficient for large files |
| Write            | `write()`          | Stores text in file       |

---

> **Engineering Note**
>
> Reading an entire file with `read()` is acceptable for small configuration files or documents. For large datasets, logs, or machine learning data, processing one line at a time is significantly more memory-efficient.

---

## Remember

* `read()` returns the entire file as a string.
* `read(size)` reads a specified number of characters.
* `readline()` reads one line at a time.
* `readlines()` returns a list of all lines.
* Iterating over a file is the preferred approach for large files.
* `write()` stores data in a file and returns the number of characters written.
* Append mode (`"a"`) preserves existing content while adding new data.

---
## Closing Files

## Question

Suppose you open a file.

```python
file = open("report.txt", "r")
```

You read its contents.

Now what?

Can you simply end the program?

Technically, Python may eventually close the file when the program exits.

However, **professional software never relies on this behavior.**

Instead, it explicitly closes files as soon as they are no longer needed.

---

# Why Closing Files Matters

When a file is opened, the operating system allocates resources.

These include:

* File descriptors
* Memory buffers
* Operating system handles
* File locks

Conceptually:

```text
Open File

↓

Operating System Allocates Resources

↓

Program Uses File

↓

Close File

↓

Resources Released
```

If the file is never closed, those resources remain allocated longer than necessary.

---

# The `close()` Method

Python provides:

```python
file.close()
```

Example:

```python
file = open("notes.txt", "r")

content = file.read()

file.close()
```

Execution:

```text
Open

↓

Read

↓

Close

↓

Finished
```

After calling:

```python
file.close()
```

the file is no longer available for reading or writing.

---

# What Happens After Closing?

Example:

```python
file = open("notes.txt", "r")

file.close()

file.read()
```

Output:

```text
ValueError:
I/O operation on closed file.
```

Once closed, the file object cannot perform additional operations.

---

# Why Forgetting to Close Files Is Dangerous

Imagine a web server handling:

```text
10,000 Requests
```

Each request opens a file.

If none are closed:

```text
Open File

↓

Open File

↓

Open File

↓

Open File

↓

...

↓

Operating System Runs Out of File Handles
```

Eventually the application can no longer open files.

This leads to production failures.

---

> **Engineering Note**
>
> Operating systems impose limits on the number of files a process can keep open simultaneously. Forgetting to close files can eventually cause applications to fail even if the code appears to work during testing.

---

# Exception Safety

Consider:

```python
file = open("data.txt")

data = file.read()

result = 10 / 0

file.close()
```

Execution:

```text
Open File

↓

Read File

↓

Exception

↓

Program Stops
```

Notice something.

```python
file.close()
```

never executes.

The file remains open until Python eventually cleans it up.

This is one reason manual resource management is error-prone.

---

# Using `finally`

One solution is:

```python
file = open("data.txt")

try:

    data = file.read()

finally:

    file.close()
```

Now:

```text
Open File

↓

Read File

↓

Exception?

├── Yes
│
├── No
│
▼

Close File
```

Regardless of success or failure, the file is closed.

---

# The `with` Statement

## Question

Managing files manually becomes repetitive.

Every file operation requires:

```text
Open

↓

Use

↓

Close
```

Python provides a safer alternative:

```python
with
```

---

# What Is `with`?

The `with` statement automatically manages resources.

General syntax:

```python
with open(filename, mode) as file:

    # Use file
```

Example:

```python
with open("notes.txt", "r") as file:

    content = file.read()

    print(content)
```

Python automatically closes the file after leaving the `with` block.

No explicit:

```python
file.close()
```

is required.

---

# Execution Flow

Conceptually:

```text
Enter with Block

↓

Open File

↓

Execute Code

↓

Automatically Close File

↓

Continue Program
```

Even if an exception occurs, Python still closes the file.

---

# Example

```python
try:

    with open("data.txt") as file:

        result = 10 / 0

except ZeroDivisionError:

    print("Division Error")
```

Execution:

```text
Open File

↓

Exception

↓

Automatically Close File

↓

Exception Handler

↓

Continue Program
```

The file is safely closed before the exception is handled.

---

# Why `with` Is Better

Compare:

Without `with`:

```python
file = open("notes.txt")

try:

    content = file.read()

finally:

    file.close()
```

With `with`:

```python
with open("notes.txt") as file:

    content = file.read()
```

Both achieve the same result.

The second version is:

* Shorter
* Cleaner
* Safer
* Less error-prone

---

> **Engineering Note**
>
> The `with` statement uses Python's **context manager** protocol internally. Context managers automatically acquire and release resources. We'll study how they work in detail when covering advanced Python topics.

---

# Binary Files

Earlier we classified files into:

* Text files
* Binary files

Text mode:

```python
open("notes.txt", "r")
```

Binary mode:

```python
open("photo.jpg", "rb")
```

Notice the additional:

```text
b
```

which stands for **binary**.

---

# Common Binary Modes

| Mode   | Purpose       |
| ------ | ------------- |
| `"rb"` | Read binary   |
| `"wb"` | Write binary  |
| `"ab"` | Append binary |

These modes are commonly used for:

* Images
* Videos
* Audio
* PDFs
* Machine learning models
* Serialized objects

---

## Example

```python
with open("image.png", "rb") as file:

    data = file.read()
```

Unlike text mode, binary mode returns raw bytes rather than strings.

---

# Text vs Binary

| Text Mode               | Binary Mode      |
| ----------------------- | ---------------- |
| Returns strings         | Returns bytes    |
| Human-readable          | Machine-readable |
| Uses character encoding | Raw byte data    |
| `"r"`                   | `"rb"`           |

---

## File Pointer Revisited

Every file object maintains a pointer.

Initially:

```text
File

^

Pointer
```

As data is read:

```text
File

        ^

     Pointer
```

When the pointer reaches the end:

```text
EOF
```

no more data remains.

The pointer also moves during writing operations.

---

## Remember

* Files should always be closed after use.
* `close()` releases operating system resources.
* `finally` ensures cleanup even when exceptions occur.
* The `with` statement automatically closes files and is the preferred approach.
* Binary mode is used for non-text data such as images and model files.
* Every opened file maintains a file pointer that tracks the current position.

---
# File Exceptions

## Question

Suppose your program tries to open:

```python
with open("customer_data.txt", "r") as file:
    data = file.read()
```

But the file does not exist.

What happens?

Python cannot continue because it has no file to read.

Instead, it raises an exception.

---

# Why File Exceptions Exist

File operations depend on external resources.

Unlike variables in memory, files may be affected by:

* User actions
* Operating system permissions
* Hardware failures
* Network storage
* Missing directories

Since these factors are outside the program's control, Python reports problems using exceptions.

---

## Common File Exceptions

| Exception            | Cause                                     |
| -------------------- | ----------------------------------------- |
| `FileNotFoundError`  | File does not exist                       |
| `PermissionError`    | Insufficient permissions                  |
| `IsADirectoryError`  | Directory used where a file was expected  |
| `NotADirectoryError` | Invalid directory path                    |
| `FileExistsError`    | File already exists when using `"x"` mode |
| `OSError`            | General operating system error            |

---

## Example: File Not Found

```python
try:
    with open("missing.txt", "r") as file:
        print(file.read())

except FileNotFoundError:
    print("File not found.")
```

Output:

```text
File not found.
```

Instead of crashing, the application handles the problem gracefully.

---

# Example: Permission Error

Suppose a file exists but the current user is not allowed to read it.

```python
try:
    with open("protected.txt", "r") as file:
        print(file.read())

except PermissionError:
    print("Permission denied.")
```

Output:

```text
Permission denied.
```

---

# Catching Multiple File Exceptions

```python
try:

    with open("config.txt", "r") as file:

        data = file.read()

except FileNotFoundError:

    print("Configuration file missing.")

except PermissionError:

    print("Permission denied.")

except OSError:

    print("Unexpected operating system error.")
```

Each exception represents a different recovery strategy.

---

# Why File Exceptions Matter

Imagine a production server.

Configuration files may be:

* Deleted accidentally
* Moved
* Corrupted
* Inaccessible

A production application should never simply crash.

Instead, it should:

```text
Detect Failure

↓

Log Error

↓

Inform User

↓

Recover if Possible

↓

Continue Running
```

---

# Working with JSON Files

## Question

Plain text files are useful.

But modern applications often need structured data.

Example:

```text
Name

Age

Email

Country
```

Storing this as plain text makes processing difficult.

Instead, applications commonly use **JSON**.

---

# What Is JSON?

JSON (JavaScript Object Notation) is a lightweight format for storing structured data.

Example:

```json
{
    "name": "Alice",
    "age": 25,
    "city": "London"
}
```

Although derived from JavaScript, JSON is language-independent.

Almost every modern programming language supports it.

---

# Reading JSON Files

Python provides the built-in `json` module.

Example:

```python
import json

with open("config.json", "r") as file:

    data = json.load(file)

print(data)
```

Suppose the file contains:

```json
{
    "theme": "dark",
    "language": "English"
}
```

Output:

```python
{
    "theme": "dark",
    "language": "English"
}
```

Notice that Python converts the JSON document into a dictionary.

---

# Writing JSON Files

Example:

```python
import json

settings = {
    "theme": "dark",
    "language": "English"
}

with open("config.json", "w") as file:

    json.dump(settings, file, indent=4)
```

Result:

```json
{
    "theme": "dark",
    "language": "English"
}
```

JSON is widely used for:

* Configuration
* REST APIs
* AI prompts
* Application settings
* Data exchange

---

# Working with CSV Files

## Question

How do spreadsheet programs store tabular data?

Typically using:

```text
CSV
```

which stands for:

```text
Comma-Separated Values
```

---

# Example CSV File

```text
Name,Age,City

Alice,24,London

Bob,30,Paris

Charlie,28,Berlin
```

Each line represents one record.

Each comma separates fields.

---

# Reading CSV Files

Python provides the built-in `csv` module.

Example:

```python
import csv

with open("students.csv", "r") as file:

    reader = csv.reader(file)

    for row in reader:

        print(row)
```

Output:

```python
['Name', 'Age', 'City']
['Alice', '24', 'London']
['Bob', '30', 'Paris']
```

Each row is returned as a list.

---

# Writing CSV Files

```python
import csv

with open("students.csv", "w", newline="") as file:

    writer = csv.writer(file)

    writer.writerow(["Name", "Age", "City"])

    writer.writerow(["Alice", 24, "London"])
```

Result:

```text
Name,Age,City

Alice,24,London
```

CSV files are commonly used for:

* Reports
* Data export
* Analytics
* Machine Learning datasets

---

# Why JSON and CSV Matter

Modern applications rarely store complex information as plain text.

Instead:

```text
Configuration

↓

JSON
```

```text
Tabular Data

↓

CSV
```

Examples:

| Use Case              | Common Format |
| --------------------- | ------------- |
| Configuration         | JSON          |
| API Communication     | JSON          |
| Dataset               | CSV           |
| Spreadsheet Export    | CSV           |
| AI Evaluation Results | CSV           |
| Logging               | Text / JSON   |

---

> **Engineering Note**
>
> JSON and CSV are foundational formats in data engineering, machine learning, backend development, and GenAI applications. You'll encounter them throughout the remainder of this curriculum.

---

## Remember

* File operations can raise exceptions such as `FileNotFoundError` and `PermissionError`.
* Handle expected file errors gracefully.
* JSON stores structured data.
* CSV stores tabular data.
* Python provides built-in `json` and `csv` modules.
* JSON and CSV are among the most widely used file formats in production software.

---
# Production Perspective

File handling is one of the oldest concepts in computing, yet it remains essential in modern software engineering.

Even cloud-native and AI-driven systems rely heavily on files behind the scenes.

---

## Configuration Files

Most production applications store configuration outside the source code.

Example:

```text
config/

├── config.json

├── settings.yaml

├── logging.conf

└── secrets.env
```

Instead of hardcoding values like:

* Database URLs
* API Keys
* Model Names
* Cloud Regions

applications load them from configuration files during startup.

Conceptually:

```text
Application Starts

↓

Read Configuration File

↓

Initialize Services

↓

Run Application
```

This makes deployments more flexible and secure.

---

## Log Files

Every production application generates logs.

Example:

```text
logs/

├── application.log

├── error.log

├── access.log

└── audit.log
```

Logs record:

* User requests
* Errors
* Warnings
* Performance metrics
* Security events

These files help engineers debug and monitor applications.

---

## Machine Learning

Machine Learning workflows use files extensively.

Examples include:

```text
datasets/

models/

checkpoints/

predictions/

evaluation/

reports/
```

Typical workflow:

```text
Read Dataset

↓

Train Model

↓

Save Model

↓

Load Model Later

↓

Generate Predictions
```

Without files, trained models would disappear after execution.

---

## Large Language Model Applications

Modern GenAI applications frequently use files for:

* Prompt templates
* Embedding caches
* Evaluation datasets
* Knowledge base documents
* Conversation exports
* Configuration

Example project:

```text
rag_application/

├── prompts/

├── documents/

├── embeddings/

├── cache/

├── logs/

└── config/
```

Each directory contains files serving a different purpose.

---

## Cloud Applications

Cloud services also rely on files.

Examples include:

* SSL certificates
* Deployment configurations
* Dockerfiles
* Kubernetes manifests
* Environment files
* Backup archives

Although cloud storage may be distributed, applications still interact with them as files or objects.

---

## Data Engineering

Data pipelines process files continuously.

Common formats include:

* CSV
* JSON
* Parquet
* Avro
* ORC

Typical pipeline:

```text
Read File

↓

Clean Data

↓

Transform Data

↓

Validate

↓

Write New File
```

This workflow appears in ETL (Extract, Transform, Load) systems.

---

> **Engineering Note**
>
> While databases manage structured, frequently changing data, files remain the preferred solution for configuration, logs, machine learning artifacts, backups, reports, and large datasets.

---

## Remember

File handling is foundational because nearly every software system reads or writes files.

Understanding these concepts prepares you for:

* Databases
* Cloud Storage
* Docker
* Kubernetes
* Machine Learning
* Retrieval-Augmented Generation (RAG)
* MLOps

---

# Engineering Decisions

Professional engineers carefully design how applications interact with files.

---

## Decision 1 — Use the `with` Statement

Poor:

```python
file = open("notes.txt")

data = file.read()

file.close()
```

Better:

```python
with open("notes.txt", "r") as file:
    data = file.read()
```

The `with` statement guarantees proper cleanup.

---

## Decision 2 — Handle File Exceptions

Poor:

```python
with open("config.json") as file:
    config = file.read()
```

If the file is missing, the application crashes.

Better:

```python
try:
    with open("config.json") as file:
        config = file.read()

except FileNotFoundError:
    print("Configuration file missing.")
```

Always assume external resources may fail.

---

## Decision 3 — Choose the Correct File Mode

Poor:

```python
open("important.txt", "w")
```

if the intention was only to read the file.

This accidentally erases its contents.

Better:

```python
open("important.txt", "r")
```

Select the least destructive mode that satisfies your requirements.

---

## Decision 4 — Process Large Files Incrementally

Poor:

```python
content = file.read()
```

for a multi-gigabyte log file.

Better:

```python
for line in file:
    process(line)
```

Streaming data reduces memory usage.

---

## Decision 5 — Separate Data from Code

Avoid embedding configuration directly into source code.

Poor:

```python
DATABASE_URL = "localhost"
```

Better:

```python
with open("config.json") as file:
    settings = json.load(file)
```

This simplifies deployment across environments.

---

## Decision 6 — Use Standard Formats

Instead of inventing custom text formats, prefer widely adopted standards.

Examples:

| Data Type           | Preferred Format |
| ------------------- | ---------------- |
| Configuration       | JSON / YAML      |
| Tabular Data        | CSV              |
| Logs                | Text / JSON      |
| Structured Exchange | JSON             |

Using standard formats improves interoperability.

---

# Common Mistakes

| Mistake                          | Why It Is Incorrect                   | Correct Understanding                           |
| -------------------------------- | ------------------------------------- | ----------------------------------------------- |
| Forgetting to close files        | Can leak operating system resources.  | Use `with` whenever possible.                   |
| Using `"w"` accidentally         | Deletes existing file contents.       | Use `"r"` or `"a"` when appropriate.            |
| Reading huge files with `read()` | Consumes excessive memory.            | Process large files line by line.               |
| Ignoring file exceptions         | Applications crash unexpectedly.      | Handle expected exceptions gracefully.          |
| Hardcoding absolute paths        | Reduces portability across systems.   | Prefer relative paths or configuration files.   |
| Mixing binary and text modes     | Produces decoding or encoding errors. | Use `"rb"`/`"wb"` for binary files.             |
| Forgetting newline handling      | Produces poorly formatted output.     | Write newline characters intentionally.         |
| Reinventing JSON or CSV parsing  | Creates unnecessary complexity.       | Use Python's built-in `json` and `csv` modules. |

---

## Interview Questions

## 1. Why do programs need file handling?

**Expected Answer**

Files provide persistent storage, allowing data to survive after the program exits.

---

## 2. What is the difference between RAM and file storage?

**Expected Answer**

RAM is volatile and temporary, while files provide non-volatile, persistent storage on devices such as SSDs and HDDs.

---

## 3. What does the `open()` function return?

**Expected Answer**

It returns a file object used to read from or write to the file.

---

## 4. What is the difference between `"r"`, `"w"`, and `"a"` modes?

**Expected Answer**

* `"r"` reads an existing file.
* `"w"` writes to a file and overwrites existing contents.
* `"a"` appends new data while preserving existing contents.

---

## 5. Why is the `with` statement preferred?

**Expected Answer**

It automatically closes files, even if exceptions occur, reducing the risk of resource leaks.

---

## 6. What is a file pointer?

**Expected Answer**

A file pointer tracks the current position within an open file during reading or writing.

---

## 7. What is the difference between text and binary files?

**Expected Answer**

Text files store human-readable characters, while binary files store raw bytes such as images, videos, or model weights.

---

## 8. What exceptions commonly occur during file operations?

**Expected Answer**

Examples include `FileNotFoundError`, `PermissionError`, `FileExistsError`, and `OSError`.

---

## 9. Why are JSON and CSV widely used?

**Expected Answer**

JSON is ideal for structured data exchange and configuration, while CSV is commonly used for tabular data such as reports and datasets.

---

## 10. Why should large files be processed incrementally?

**Expected Answer**

Reading large files line by line reduces memory usage and improves scalability.

---

## Quick Revision

## File Lifecycle

```text
Open

↓

Read / Write

↓

Close
```

Prefer:

```python
with open(...) as file:
    ...
```

---

## File Modes

| Mode   | Purpose           |
| ------ | ----------------- |
| `"r"`  | Read              |
| `"w"`  | Write (overwrite) |
| `"a"`  | Append            |
| `"x"`  | Create new        |
| `"rb"` | Read binary       |
| `"wb"` | Write binary      |

---

## Reading Methods

```python
file.read()

file.readline()

file.readlines()

for line in file:
    ...
```

---

## Writing

```python
file.write("Hello")
```

Appends or overwrites depending on the file mode.

---

## Structured File Formats

| Format   | Typical Use         |
| -------- | ------------------- |
| JSON     | Configuration, APIs |
| CSV      | Tabular datasets    |
| Markdown | Documentation       |
| Text     | Logs, notes         |

---

## Best Practices

* Use `with`.
* Handle file exceptions.
* Choose the correct file mode.
* Stream large files.
* Use standard file formats.
* Avoid hardcoded absolute paths.

---

# Key Takeaways

* Files provide persistent storage beyond program execution.
* Python accesses files through the operating system.
* File objects are created using `open()`.
* Different file modes support reading, writing, appending, and binary operations.
* The `with` statement is the safest way to manage file resources.
* File operations can fail and should be protected using exception handling.
* JSON and CSV are fundamental formats in software engineering and data processing.
* Efficient file handling is essential for scalable applications.
* Production systems rely heavily on files for configuration, logging, datasets, backups, and AI artifacts.
* File handling forms the foundation for working with databases, cloud storage, and machine learning pipelines.

---
