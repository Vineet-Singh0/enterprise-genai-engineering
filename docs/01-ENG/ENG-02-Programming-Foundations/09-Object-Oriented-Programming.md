File: `09-Object-Oriented-Programming.md`
---

# Object-Oriented Programming (OOP)

> **Domain:** Engineering Foundations (ENG)
> **Module:** ENG-02 — Programming Foundations
> **Document:** `09-Object-Oriented-Programming.md`

---

## Learning Objectives

After completing this chapter, you should be able to:

* Understand why Object-Oriented Programming (OOP) was invented.
* Explain the limitations of procedural programming.
* Understand the concepts of objects and classes.
* Learn how OOP models real-world entities.
* Build a strong mental model for object-oriented design.
* Understand why nearly every modern software framework is built using OOP.
* Connect OOP to production software engineering and Enterprise AI systems.

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
* `08-File-Handling.md`

You should already understand:

* Variables
* Functions
* Modules
* File Handling
* Exception Handling
* Program Execution

---

## Estimated Reading Time

**2–2.5 Hours**

---

## Before We Start

## Question

Imagine you're building a matrimonial application.

Every user has:

* Name
* Age
* Gender
* Religion
* Location
* Education
* Profession
* Profile Photo
* Verification Status

They can also perform actions like:

* Register
* Login
* Update Profile
* Upload Images
* Send Interest
* Block User

How would you represent all this information?

Would you create:

```python
name1
age1
gender1

name2
age2
gender2

name3
age3
gender3
```

Obviously not.

What if there are:

* 10 users?
* 1,000 users?
* 10 million users?

This approach becomes impossible to manage.

Programming needed a better way.

That solution is called **Object-Oriented Programming**.

---

# Think for a Moment

Suppose you're building:

* WhatsApp
* Instagram
* Amazon
* Netflix
* Uber
* ChatGPT

Every application deals with real-world entities.

For example:

Amazon

```text
User

Product

Cart

Order

Payment

Seller
```

Uber

```text
Driver

Passenger

Ride

Vehicle

Payment
```

Enterprise AI

```text
LLM

Prompt

Embedding

Retriever

Vector Database

Agent
```

Would writing everything using only variables and functions still be practical?

No.

As software became larger, engineers needed a way to model real-world systems naturally.

---

# Why Object-Oriented Programming Exists

Earlier we learned:

Variables store data.

Functions perform actions.

For small programs this is sufficient.

Example:

```python
name = "Alice"

age = 25

def greet():
    ...
```

But imagine software containing:

* Thousands of variables
* Thousands of functions
* Hundreds of developers

Questions quickly arise:

* Which variables belong together?
* Which functions operate on which data?
* Who owns this information?

Procedural programming provides no clear answers.

OOP solves this by combining **data and behavior** into a single unit.

---

> **Engineering Note**
>
> Object-Oriented Programming was introduced to manage software complexity. It allows engineers to model software using objects that resemble real-world entities, making large systems easier to design, maintain, and extend.

---

# Mental Model

Before discussing syntax, let's build intuition.

## Analogy: A Car

Consider a real car.

It has:

### Data

* Color
* Brand
* Fuel Level
* Speed

It also has behaviors.

### Actions

* Start
* Stop
* Accelerate
* Brake

Notice something important.

The data and behavior naturally belong together.

It would make little sense to store:

```text
Car Speed
```

in one place,

and

```text
Brake()
```

in a completely unrelated file.

They describe the same entity.

Objects group related data and behavior together.

---

# Another Analogy: Employee Record

Imagine an HR system.

Each employee has:

```text
Employee

│

├── Name

├── Age

├── Salary

├── Department

└── Employee ID
```

The employee can also perform actions.

```text
Employee

↓

Apply Leave

↓

Update Profile

↓

Generate Payslip
```

Instead of separating data and actions,

Object-Oriented Programming combines them.

---

# What Is an Object?

An **object** is a software representation of a real-world entity.

An object contains:

* Data (called **attributes**)
* Behavior (called **methods**)

Conceptually:

```text
Object

│

├── Attributes

└── Methods
```

Examples:

| Real World   | Object              |
| ------------ | ------------------- |
| Student      | Student Object      |
| Customer     | Customer Object     |
| Product      | Product Object      |
| Bank Account | Account Object      |
| AI Agent     | Agent Object        |
| Chat Session | Conversation Object |

Objects allow software to mirror real-world concepts.

---

# What Is a Class?

If an object represents one specific entity,

how do we describe the general blueprint?

That blueprint is called a **class**.

Think of it this way.

Blueprint:

```text
House Design
```

Actual houses:

```text
House 1

House 2

House 3
```

The blueprint defines:

* Rooms
* Doors
* Windows
* Structure

Each actual house is built from the same blueprint.

Similarly,

Class:

```text
Student
```

Objects:

```text
Student 1

Student 2

Student 3
```

Every student object follows the same structure.

---

# Class vs Object

This distinction is fundamental.

| Class             | Object             |
| ----------------- | ------------------ |
| Blueprint         | Actual instance    |
| Defines structure | Holds real data    |
| Created once      | Created many times |
| Template          | Concrete entity    |

---

## Visualizing Classes and Objects

```text
              Class

          Student

        /     |      \

       /      |       \

Student1 Student2 Student3

Object     Object     Object
```

The class defines the structure.

Objects store actual values.

---

# Why Classes Exist

Without classes:

```text
name1

age1

marks1

name2

age2

marks2

...

name100000

age100000

marks100000
```

This quickly becomes impossible to maintain.

With classes:

```text
Student Class

↓

Student Objects

↓

Reusable Design
```

One definition can create millions of objects.

---

# First OOP Principle

The first idea to remember is:

> **A class defines what something looks like.**

> **An object is one actual thing created from that definition.**

Everything else in OOP builds on this idea.

---

## Real-World Examples

| Class       | Possible Objects           |
| ----------- | -------------------------- |
| Car         | BMW, Audi, Tesla           |
| User        | Alice, Bob, Charlie        |
| Product     | Laptop, Phone, Mouse       |
| BankAccount | Account #101, Account #102 |
| AIModel     | GPT-4, Llama, Gemini       |

---

## Where You'll See OOP

Object-Oriented Programming is everywhere.

Examples include:

* Python
* Java
* C++
* C#
* Kotlin
* Swift

Nearly every major framework is object-oriented.

Examples:

* Django
* FastAPI (partially)
* Flask Extensions
* PyTorch
* TensorFlow
* SQLAlchemy
* LangChain
* LlamaIndex

Even the Python file object we learned about earlier is an object.

Example:

```python
file = open("notes.txt")
```

Here:

```text
file
```

is an object.

The methods:

```python
file.read()

file.write()

file.close()
```

belong to that object.

---

## Remember

* OOP was created to manage software complexity.
* Objects combine data and behavior.
* A class is a blueprint.
* An object is an instance created from that blueprint.
* Classes allow reusable software design.
* Nearly every production software framework uses Object-Oriented Programming extensively.

---
# Creating a Class

## Question

Earlier we learned that a class is a blueprint.

But how do we create one in Python?

Python provides the `class` keyword.

General syntax:

```python
class ClassName:
    # Class Body
```

Think of this as saying:

> "I am defining a new type of object."

Just as we use:

```python
def
```

to define a function,

we use:

```python
class
```

to define a class.

---

# Naming Classes

By convention, Python class names use **PascalCase**.

Examples:

Good:

```text
Student

BankAccount

Employee

Car

ChatBot

VectorDatabase
```

Avoid:

```text
student

my_class

abc

temp
```

Meaningful names improve readability.

---

# Our First Class

```python
class Student:
    pass
```

Here:

```python
pass
```

means:

> "This class exists, but currently has no implementation."

At this point,

Python knows a class named:

```text
Student
```

exists.

But no actual student has been created yet.

---

# What Does the Class Represent?

Think of the class as a template.

```text
Student

───────────────

Name

Age

Marks

Department
```

No actual values exist yet.

Only the design exists.

---

# Creating an Object

Having a blueprint alone is not enough.

We need an actual object.

Python creates objects by calling the class.

Example:

```python
student1 = Student()
```

Notice something interesting.

Creating an object looks similar to calling a function.

```python
Student()
```

This tells Python:

> "Create a new object using the Student blueprint."

---

# Visualizing Object Creation

```text
Student Class

↓

Student()

↓

Create Object

↓

Store in Variable

↓

student1
```

The variable:

```text
student1
```

now refers to an object in memory.

---

# Multiple Objects

One class can create many objects.

```python
student1 = Student()

student2 = Student()

student3 = Student()
```

Conceptually:

```text
             Student

                │

      ┌─────────┼─────────┐

      │         │         │

 student1   student2   student3
```

Each object is independent.

---

# Are These the Same Object?

Consider:

```python
student1 = Student()

student2 = Student()
```

Although both were created from the same class,

they are different objects.

Conceptually:

```text
Student Class

↓

Object A

↓

Object B
```

Each occupies a separate location in memory.

---

# Attributes

## Question

Earlier we said objects contain data.

Where is that data stored?

Inside **attributes**.

Attributes are variables that belong to an object.

---

## What Is an Attribute?

Suppose a student has:

* Name
* Age
* Course

These become attributes.

Conceptually:

```text
Student Object

│

├── Name

├── Age

└── Course
```

Each object stores its own attribute values.

---

# Creating Attributes

Python allows attributes to be added to an object.

Example:

```python
class Student:
    pass

student = Student()

student.name = "Alice"

student.age = 20
```

Now the object contains:

```text
Student

│

├── name = Alice

└── age = 20
```

---

# Accessing Attributes

Attributes are accessed using **dot notation**.

Example:

```python
print(student.name)

print(student.age)
```

Output:

```text
Alice

20
```

Dot notation tells Python:

> "Retrieve the attribute belonging to this object."

---

# Multiple Objects with Different Data

```python
student1 = Student()

student2 = Student()

student1.name = "Alice"

student2.name = "Bob"
```

Conceptually:

```text
Student 1

Name = Alice

────────────

Student 2

Name = Bob
```

Same blueprint.

Different data.

---

# Why Attributes Matter

Without objects:

```python
name1

age1

course1

name2

age2

course2
```

With objects:

```text
Student Object

↓

Attributes Stored Together
```

Everything related to one student stays together.

---

> **Engineering Note**
>
> Grouping related data inside objects improves readability and reduces errors. This is one of the primary reasons OOP scales better than procedural programming for large systems.

---

# Methods

## Question

Earlier we learned:

Objects contain:

* Data
* Behavior

Attributes represent the data.

How do we represent behavior?

Using **methods**.

---

## What Is a Method?

A method is simply a function that belongs to a class.

Conceptually:

```text
Student Object

│

├── Name

├── Age

│

├── Study()

├── Register()

└── Graduate()
```

Methods describe what an object can do.

---

# Creating a Method

Example:

```python
class Student:

    def greet():

        print("Hello")
```

This creates a method named:

```text
greet
```

However,

there is a problem.

This method doesn't know **which student** it belongs to.

Python solves this using:

```text
self
```

---

# The `self` Keyword

Every object method receives a special parameter:

```python
self
```

Example:

```python
class Student:

    def greet(self):

        print("Hello")
```

Think of `self` as meaning:

> "The current object."

Whenever Python executes:

```python
student.greet()
```

Python automatically passes:

```python
student
```

as the first argument.

---

# Mental Model of `self`

Conceptually:

```text
student.greet()

↓

Python Internally Executes

↓

Student.greet(student)
```

The programmer writes:

```python
student.greet()
```

Python internally supplies:

```python
self
```

This is why every instance method begins with:

```python
self
```

---

# Calling a Method

Example:

```python
class Student:

    def greet(self):

        print("Welcome!")
```

Creating an object:

```python
student = Student()
```

Calling the method:

```python
student.greet()
```

Output:

```text
Welcome!
```

Notice the syntax.

Attributes:

```python
student.name
```

Methods:

```python
student.greet()
```

Both use dot notation.

---

# Object Structure

Conceptually:

```text
Student Object

│

├── Attributes

│      ├── name

│      └── age

│

└── Methods

       ├── greet()

       └── register()
```

Objects combine both state (attributes) and behavior (methods).

---

## Remember

* Classes are created using the `class` keyword.
* Objects are created by calling the class.
* Attributes store object-specific data.
* Methods define object behavior.
* Dot notation accesses both attributes and methods.
* `self` refers to the current object and is passed automatically by Python.

---
# Constructors

## Question

Suppose we create a student object.

```python
student = Student()
```

Immediately after creation, we want every student to have:

* Name
* Age
* Course

Should we manually assign them every time?

```python
student.name = "Alice"

student.age = 20

student.course = "Computer Science"
```

Imagine creating one million student objects.

This quickly becomes repetitive and error-prone.

Python provides a better solution.

That solution is called a **constructor**.

---

# Why Constructors Exist

Consider buying a new smartphone.

The manufacturer doesn't ship it without:

* Battery
* Screen
* Operating System

Every phone starts with a default initial state.

Similarly,

objects often require an initial state immediately after creation.

Constructors automate this initialization.

---

> **Engineering Note**
>
> Constructors ensure every object starts in a valid state. This prevents partially initialized objects, one of the most common sources of bugs in large software systems.

---

## What Is a Constructor?

A constructor is a special method that Python automatically executes whenever an object is created.

In Python,

the constructor is named:

```text
__init__
```

Pronounced:

> "dunder init"

where **dunder** means **double underscore**.

---

# General Syntax

```python
class Student:

    def __init__(self):

        print("Student Created")
```

Notice:

* Double underscores before and after `init`
* It behaves like a normal method
* Python calls it automatically

You never call:

```python
student.__init__()
```

directly.

Python does it for you.

---

# First Constructor Example

```python
class Student:

    def __init__(self):

        print("Creating Student...")
```

Creating an object:

```python
student = Student()
```

Output:

```text
Creating Student...
```

Notice that:

```python
Student()
```

automatically executes:

```python
__init__()
```

---

# Execution Flow

```text
Student()

↓

Allocate Memory

↓

Create Object

↓

Call __init__()

↓

Return Object
```

This entire process happens automatically.

---

# Initializing Attributes

Constructors are primarily used to initialize attributes.

Example:

```python
class Student:

    def __init__(self):

        self.name = "Unknown"

        self.age = 0
```

Creating an object:

```python
student = Student()
```

Now the object automatically contains:

```text
Student

│

├── name = Unknown

└── age = 0
```

No manual assignment is necessary.

---

# Accessing Initialized Attributes

```python
print(student.name)

print(student.age)
```

Output:

```text
Unknown

0
```

The constructor executed before these statements.

---

# Why Use `self`?

Inside:

```python
self.name = "Unknown"
```

the keyword:

```python
self
```

means:

> Store this attribute inside the current object.

Suppose we create:

```python
student1 = Student()

student2 = Student()
```

Conceptually:

```text
Student 1

│

├── name = Unknown

└── age = 0

──────────────

Student 2

│

├── name = Unknown

└── age = 0
```

Each object stores its own copy of the attributes.

---

# Constructors with Parameters

Default values are useful,

but usually we want different objects to contain different information.

Example:

```python
class Student:

    def __init__(self, name, age):

        self.name = name

        self.age = age
```

Creating objects:

```python
student1 = Student("Alice", 20)

student2 = Student("Bob", 22)
```

Object contents:

```text
Student 1

Name = Alice

Age = 20

──────────────

Student 2

Name = Bob

Age = 22
```

Each object is initialized differently.

---

# Understanding Parameter Assignment

Consider:

```python
student = Student("Alice", 20)
```

Python internally performs something similar to:

```python
Student.__init__(student, "Alice", 20)
```

Inside the constructor:

```python
self.name = name

self.age = age
```

becomes:

```python
student.name = "Alice"

student.age = 20
```

This is why each object stores different values.

---

# Visualizing Constructor Execution

```text
Student("Alice", 20)

↓

Create Empty Object

↓

Call __init__()

↓

Store Name

↓

Store Age

↓

Return Initialized Object
```

---

# Instance Variables

Attributes created using:

```python
self.attribute
```

are called **instance variables**.

Example:

```python
class Student:

    def __init__(self, name):

        self.name = name
```

Here:

```python
self.name
```

is an instance variable.

Why "instance"?

Because every instance (object) gets its own copy.

---

# Instance Variable Example

```python
student1 = Student("Alice")

student2 = Student("Bob")
```

Conceptually:

```text
Student 1

name = Alice

────────────

Student 2

name = Bob
```

Changing one does not affect the other.

---

# Modifying Instance Variables

Instance variables can change after object creation.

Example:

```python
student = Student("Alice")

student.name = "Charlie"
```

Now:

```python
print(student.name)
```

Output:

```text
Charlie
```

Objects represent changing state.

---

# Object Lifecycle

Every object follows a lifecycle.

```text
Class Defined

↓

Object Created

↓

Constructor Executes

↓

Object Used

↓

Object Eventually Destroyed
```

Python automatically manages object destruction through its memory management system.

We'll study memory management and garbage collection in a later module.

---

# Multiple Objects

```python
student1 = Student("Alice", 20)

student2 = Student("Bob", 22)

student3 = Student("Charlie", 21)
```

Conceptually:

```text
          Student Class

                │

      ┌─────────┼─────────┐

      │         │         │

 Alice      Bob      Charlie
```

One blueprint.

Many independent objects.

---

> **Engineering Note**
>
> Constructors are heavily used throughout Python frameworks. For example, creating a `FastAPI()` application, a `torch.nn.Linear()` layer, or a `QdrantClient()` object all involve constructors that initialize internal state before the object is ready for use.

---

## Remember

* `__init__()` is Python's constructor.
* Constructors execute automatically when objects are created.
* Constructors initialize object state.
* `self.attribute` creates instance variables.
* Every object gets its own independent copy of instance variables.
* Constructors make object creation consistent and reliable.

---
# Instance Methods

## Question

Earlier we learned that objects contain:

* Attributes (data)
* Methods (behavior)

Consider a banking application.

A bank account has:

* Account Number
* Balance

It can also perform actions.

* Deposit
* Withdraw
* Check Balance

These actions operate on **that specific account**, not on all accounts.

Such methods are called **instance methods**.

---

## What Is an Instance Method?

An instance method operates on a specific object.

It always receives:

```python
self
```

as its first parameter.

Example:

```python
class Student:

    def greet(self):

        print(f"Hello, {self.name}")
```

Notice:

```python
self.name
```

belongs to the current object.

---

# Example

```python
class Student:

    def __init__(self, name):

        self.name = name

    def greet(self):

        print(f"Welcome {self.name}")
```

Creating objects:

```python
student1 = Student("Alice")

student2 = Student("Bob")
```

Calling methods:

```python
student1.greet()

student2.greet()
```

Output:

```text
Welcome Alice

Welcome Bob
```

The same method behaves differently because each object has different data.

---

# Internal Working

When we write:

```python
student1.greet()
```

Python internally performs:

```python
Student.greet(student1)
```

Similarly:

```python
student2.greet()
```

becomes:

```python
Student.greet(student2)
```

Therefore:

```python
self
```

always refers to the object that called the method.

---

# Updating Object State

Instance methods often modify object attributes.

Example:

```python
class BankAccount:

    def __init__(self, balance):

        self.balance = balance

    def deposit(self, amount):

        self.balance += amount
```

Using it:

```python
account = BankAccount(1000)

account.deposit(500)

print(account.balance)
```

Output:

```text
1500
```

The method updated the object's internal state.

---

# Visualizing Instance Methods

```text
BankAccount Object

│

├── balance = 1000

│

├── deposit()

├── withdraw()

└── check_balance()
```

Methods operate directly on the object's attributes.

---

# Class Variables

## Question

Suppose every student object belongs to the same university.

Should every object store:

```text
University = ABC University
```

individually?

If there are:

* 10 students
* 10,000 students
* 1 million students

this duplicates identical information.

Instead,

we store shared information inside the **class**.

---

# What Is a Class Variable?

A class variable belongs to the class itself,

not to individual objects.

Example:

```python
class Student:

    university = "ABC University"
```

Here:

```python
university
```

is shared by every object.

---

# Example

```python
class Student:

    university = "ABC University"

    def __init__(self, name):

        self.name = name
```

Creating objects:

```python
student1 = Student("Alice")

student2 = Student("Bob")
```

Accessing:

```python
print(student1.university)

print(student2.university)
```

Output:

```text
ABC University

ABC University
```

Only one copy exists.

---

# Memory Visualization

```text
             Student Class

────────────────────────────────

University = ABC University

────────────────────────────────

       │

 ┌─────┴─────┐

 │           │

Alice       Bob
```

Objects contain only their own instance variables.

Shared information stays inside the class.

---

# Instance Variable vs Class Variable

| Instance Variable            | Class Variable       |
| ---------------------------- | -------------------- |
| Belongs to object            | Belongs to class     |
| Each object has its own copy | One shared copy      |
| Created using `self`         | Created inside class |
| Can differ across objects    | Same for all objects |

---

## Accessing Class Variables

Preferred approach:

```python
print(Student.university)
```

It is also possible through an object.

```python
print(student1.university)
```

However,

accessing through the class makes it clear that the value is shared.

---

# Changing Class Variables

Example:

```python
Student.university = "XYZ University"
```

Now:

```python
print(student1.university)

print(student2.university)
```

Output:

```text
XYZ University

XYZ University
```

Changing the class variable affects every object.

---

> **Engineering Note**
>
> Class variables are commonly used for shared configuration, default values, counters, constants, and application-wide metadata. They reduce memory usage by avoiding unnecessary duplication.

---

# Class Methods

## Question

Instance methods operate on objects.

Sometimes,

we want methods that operate on the **class itself**.

Python provides:

```python
@classmethod
```

---

# Why Class Methods Exist

Suppose we want to know:

* Total students created
* Current configuration
* Default settings

These belong to the class,

not any individual object.

---

## Creating a Class Method

Example:

```python
class Student:

    university = "ABC University"

    @classmethod
    def get_university(cls):

        return cls.university
```

Notice:

```python
cls
```

instead of:

```python
self
```

`cls` refers to the class itself.

---

# Calling a Class Method

```python
print(Student.get_university())
```

Output:

```text
ABC University
```

No object is required.

---

# `self` vs `cls`

| Keyword | Refers To      |
| ------- | -------------- |
| `self`  | Current object |
| `cls`   | Current class  |

Think of them as:

```text
self

↓

This Object
```

```text
cls

↓

This Class
```

---

# Example: Counting Objects

```python
class Student:

    count = 0

    def __init__(self):

        Student.count += 1

    @classmethod
    def total_students(cls):

        return cls.count
```

Creating objects:

```python
Student()

Student()

Student()
```

Calling:

```python
print(Student.total_students())
```

Output:

```text
3
```

The class method accesses shared class data.

---

## Remember

* Instance methods operate on individual objects.
* Instance methods always receive `self`.
* Class variables are shared across all objects.
* Class methods operate on the class itself.
* Class methods receive `cls` instead of `self`.
* Use class methods for behavior related to the class rather than a specific object.

---
# Static Methods

## Question

We have learned about:

* Instance methods (`self`)
* Class methods (`cls`)

But what if we need a function that logically belongs to a class **without needing either an object or the class itself**?

For example:

```text
Temperature Conversion

↓

Celsius → Fahrenheit

↓

Fahrenheit → Celsius
```

This operation doesn't depend on:

* A specific object
* Shared class data

Python provides **static methods** for such cases.

---

# Why Static Methods Exist

Imagine a calculator.

It performs operations like:

* Add
* Subtract
* Multiply
* Divide

These operations don't depend on the calculator's internal state.

Similarly, many utility functions belong conceptually to a class but don't need access to object or class data.

---

## Creating a Static Method

Python uses the `@staticmethod` decorator.

Example:

```python
class Calculator:

    @staticmethod
    def add(a, b):

        return a + b
```

Notice:

There is **no**:

```python
self
```

or

```python
cls
```

parameter.

---

# Calling a Static Method

```python
print(Calculator.add(10, 20))
```

Output:

```text
30
```

No object creation is required.

---

# Another Example

```python
class Temperature:

    @staticmethod
    def celsius_to_fahrenheit(celsius):

        return (celsius * 9 / 5) + 32
```

Usage:

```python
print(Temperature.celsius_to_fahrenheit(25))
```

Output:

```text
77.0
```

The method belongs to the class because it is conceptually related to temperature conversion.

---

# Instance Method vs Class Method vs Static Method

| Feature         | Instance Method | Class Method   | Static Method   |
| --------------- | --------------- | -------------- | --------------- |
| Works on object | Yes             | No             | No              |
| Works on class  | Indirectly      | Yes            | No              |
| Receives `self` | Yes             | No             | No              |
| Receives `cls`  | No              | Yes            | No              |
| Decorator       | None            | `@classmethod` | `@staticmethod` |

---

## Visualizing the Three Types

```text
                 Student Class

        ┌───────────────────────────┐

        │ Class Variable            │

        │                           │

        │ Class Method              │

        │                           │

        │ Static Method             │

        └──────────────┬────────────┘

                       │

             ┌─────────┴─────────┐

             │                   │

       Student A           Student B

             │                   │

      Instance Variables   Instance Variables

             │                   │

      Instance Methods     Instance Methods
```

Each method type has a different purpose.

---

> **Engineering Note**
>
> Static methods are often used for helper functions, validation logic, parsing utilities, mathematical operations, and format conversion. They improve organization by grouping related functionality within a class.

---

# Encapsulation

## Question

Suppose a bank account stores:

```text
Balance = ₹1,00,000
```

Should any programmer be able to write:

```python
account.balance = -500000
```

Probably not.

Certain data should be protected.

This idea is called **Encapsulation**.

---

# Why Encapsulation Exists

Imagine a hospital database.

Patient records contain:

* Name
* Medical History
* Prescriptions
* Insurance Information

Should every part of the application freely modify these records?

No.

Instead:

```text
Application

↓

Approved Methods

↓

Patient Record
```

Data should only change through controlled operations.

Encapsulation helps enforce this principle.

---

# What Is Encapsulation?

Encapsulation is the practice of:

* Keeping related data and behavior together.
* Restricting direct access to internal data.
* Allowing controlled access through methods.

Conceptually:

```text
Object

│

├── Private Data

│

└── Public Methods
```

Users interact with the methods, not the internal representation.

---

# Public Attributes

By default, Python attributes are public.

Example:

```python
class Student:

    def __init__(self):

        self.name = "Alice"
```

Access:

```python
student = Student()

print(student.name)
```

Output:

```text
Alice
```

Anyone can read or modify the attribute.

---

# Protected Attributes

Python uses a naming convention for protected attributes.

Example:

```python
class Student:

    def __init__(self):

        self._marks = 90
```

Notice the single underscore.

```text
_marks
```

This signals:

> "This attribute is intended for internal use."

Python does not prevent access, but other developers are expected to respect the convention.

---

# Private Attributes

Python provides name mangling for private attributes.

Example:

```python
class Student:

    def __init__(self):

        self.__password = "secret"
```

Now:

```python
student.__password
```

raises an error.

Internally, Python changes the name to reduce accidental access.

---

# Why Python Uses Conventions

Unlike some languages,

Python emphasizes:

> "We're all responsible developers."

Instead of enforcing strict access rules,

Python uses naming conventions to communicate intent.

This philosophy is often summarized as:

> "We are all consenting adults here."

---

## Access Through Methods

Instead of exposing internal data directly,

objects provide methods.

Example:

```python
class BankAccount:

    def __init__(self):

        self.__balance = 1000

    def get_balance(self):

        return self.__balance
```

Usage:

```python
account = BankAccount()

print(account.get_balance())
```

Output:

```text
1000
```

The object decides how its data is accessed.

---

# Why Encapsulation Matters

Without encapsulation:

```text
Anyone Can Modify Data

↓

Invalid State

↓

Application Bugs
```

With encapsulation:

```text
Controlled Methods

↓

Validation

↓

Safe Updates

↓

Reliable Object
```

This protects the integrity of the object.

---

## Remember

* Static methods belong to the class but don't require `self` or `cls`.
* Use static methods for utility functions related to the class.
* Encapsulation combines data and behavior while controlling access.
* Public attributes are accessible everywhere.
* Protected attributes use a single underscore by convention.
* Private attributes use double underscores for name mangling.
* Accessing important data through methods improves safety and maintainability.

---
# Properties (`@property`)

## Question

Earlier we learned that encapsulation encourages us to protect internal data.

Suppose we have:

```python
class Student:

    def __init__(self):
        self.__age = 20
```

If the age is private,

how should other parts of the program read it?

One approach is:

```python
student.get_age()
```

But Python offers a cleaner solution.

That solution is called a **property**.

---

# Why Properties Exist

Imagine driving a car.

You change the speed using the accelerator.

You don't directly manipulate:

```text
Engine RPM

Fuel Injection

Spark Timing

Transmission
```

Instead,

you interact through a simple interface.

Properties provide the same idea.

They allow controlled access while keeping the syntax simple.

---

# The Problem Without Properties

Example:

```python
class Student:

    def __init__(self):
        self.__age = 20

    def get_age(self):
        return self.__age
```

Usage:

```python
print(student.get_age())
```

Although correct,

calling getter methods repeatedly becomes verbose.

Python improves this with properties.

---

# Creating a Property

Example:

```python
class Student:

    def __init__(self):
        self.__age = 20

    @property
    def age(self):
        return self.__age
```

Usage:

```python
student = Student()

print(student.age)
```

Output:

```text
20
```

Notice something interesting.

We access:

```python
student.age
```

like an attribute,

but Python actually executes:

```python
age()
```

behind the scenes.

---

# Internal Working

Conceptually:

```text
student.age

↓

@property

↓

Call Method

↓

Return Value
```

This provides cleaner syntax while preserving encapsulation.

---

# Setter Methods

Properties can also validate new values.

Example:

```python
class Student:

    def __init__(self):
        self.__age = 20

    @property
    def age(self):
        return self.__age

    @age.setter
    def age(self, value):

        if value < 0:
            raise ValueError("Age cannot be negative.")

        self.__age = value
```

Usage:

```python
student.age = 25
```

The setter executes automatically.

---

# Validation Example

```python
student.age = -10
```

Produces:

```text
ValueError:
Age cannot be negative.
```

The object's internal state remains valid.

---

# Why Properties Matter

Properties allow us to:

* Hide implementation details.
* Validate input.
* Compute values dynamically.
* Preserve backward compatibility.

Large frameworks use properties extensively.

---

> **Engineering Note**
>
> Libraries such as Django ORM, SQLAlchemy, and PyTorch use properties to expose clean APIs while hiding complex internal behavior.

---

## Inheritance

## Question

Imagine you're building a company management system.

You have:

```text
Employee
```

Every employee has:

* Name
* Age
* Employee ID

Now you introduce:

```text
Manager
```

Managers also have:

* Name
* Age
* Employee ID

plus:

* Team Size

Should we rewrite all employee code?

No.

Instead,

Manager should reuse Employee's implementation.

This idea is called **inheritance**.

---

# What Is Inheritance?

Inheritance allows one class to reuse another class.

Conceptually:

```text
Parent Class

↓

Child Class
```

The child automatically receives:

* Attributes
* Methods

from the parent.

---

# Real-World Analogy

```text
Vehicle

│

├── Car

├── Bus

├── Truck

└── Bike
```

Every vehicle has:

* Wheels
* Speed
* Fuel

Cars don't redefine these concepts.

They inherit them.

---

# Creating a Parent Class

```python
class Employee:

    def __init__(self, name):

        self.name = name

    def work(self):

        print("Working")
```

---

# Creating a Child Class

```python
class Manager(Employee):
    pass
```

Notice:

```python
Employee
```

inside the parentheses.

This means:

> Manager inherits from Employee.

---

# Using Inheritance

```python
manager = Manager("Alice")

manager.work()
```

Output:

```text
Working
```

Although:

```python
work()
```

was never defined inside Manager,

it is inherited.

---

# Visualizing Inheritance

```text
Employee

│

├── name

└── work()

        │

        ▼

Manager

│

├── name

└── work()
```

The child automatically receives the parent's functionality.

---

# Adding New Features

Child classes can also introduce new functionality.

Example:

```python
class Manager(Employee):

    def approve_leave(self):

        print("Leave Approved")
```

Now:

```python
manager.work()

manager.approve_leave()
```

Both methods are available.

---

# The `super()` Function

Sometimes the child needs to call the parent's constructor.

Python provides:

```python
super()
```

Example:

```python
class Manager(Employee):

    def __init__(self, name, team_size):

        super().__init__(name)

        self.team_size = team_size
```

Execution:

```text
Create Manager

↓

Call Employee Constructor

↓

Initialize Name

↓

Initialize Team Size

↓

Return Object
```

`super()` prevents duplication.

---

# Why Inheritance Exists

Without inheritance:

```text
Employee Code

↓

Copied

↓

Manager Code

↓

Copied

↓

Developer Code

↓

Copied
```

Code duplication grows rapidly.

With inheritance:

```text
Employee

↓

Manager

↓

Senior Manager

↓

Director
```

Behavior is reused rather than rewritten.

---

# When to Use Inheritance

Inheritance is appropriate when there is a genuine **"is-a"** relationship.

Examples:

| Parent             | Child       |
| ------------------ | ----------- |
| Vehicle            | Car         |
| Employee           | Manager     |
| Animal             | Dog         |
| Exception          | ValueError  |
| NeuralNetworkLayer | LinearLayer |

If the relationship is not "is-a",

inheritance is usually the wrong choice.

---

## Remember

* Properties provide controlled access to private attributes.
* `@property` creates read-only access.
* `@property.setter` validates updates.
* Inheritance allows one class to reuse another.
* Child classes automatically inherit attributes and methods.
* `super()` calls the parent implementation.
* Use inheritance only for genuine **is-a** relationships.

---
## Method Overriding

## Question

Suppose we have:

```text
Employee
```

with a method:

```python
work()
```

Now we create:

```text
Manager
```

Managers also work,

but their work is different.

Should they inherit the same implementation?

Not always.

Sometimes a child class needs to provide its own implementation.

This is called **Method Overriding**.

---

# What Is Method Overriding?

Method overriding occurs when a child class defines a method with the **same name** as a method in its parent class.

The child version replaces the parent's version.

---

## Example

```python
class Employee:

    def work(self):
        print("Employee is working.")
```

Child class:

```python
class Manager(Employee):

    def work(self):
        print("Manager is managing the team.")
```

Usage:

```python
manager = Manager()

manager.work()
```

Output:

```text
Manager is managing the team.
```

Although `Manager` inherited from `Employee`, its own implementation is used.

---

# Visualizing Method Overriding

```text
Employee

│

└── work()

        │

        ▼

Manager

│

└── work()

(Overrides Parent)
```

Python always prefers the most specific implementation.

---

# Another Example

```python
class Animal:

    def speak(self):
        print("Animal makes a sound")
```

```python
class Dog(Animal):

    def speak(self):
        print("Dog barks")
```

```python
class Cat(Animal):

    def speak(self):
        print("Cat meows")
```

Usage:

```python
dog = Dog()
cat = Cat()

dog.speak()
cat.speak()
```

Output:

```text
Dog barks
Cat meows
```

Same method name.

Different behavior.

---

# Calling the Parent Method

Sometimes the child wants to extend—not replace—the parent's behavior.

Python again provides:

```python
super()
```

Example:

```python
class Employee:

    def work(self):
        print("Employee starts work")
```

```python
class Manager(Employee):

    def work(self):

        super().work()

        print("Manager assigns tasks")
```

Usage:

```python
manager = Manager()

manager.work()
```

Output:

```text
Employee starts work

Manager assigns tasks
```

Execution:

```text
Manager.work()

↓

super().work()

↓

Employee.work()

↓

Return

↓

Manager Continues
```

This allows code reuse while adding specialized behavior.

---

# Polymorphism

## Question

Suppose we have:

* Dog
* Cat
* Bird

Each has:

```python
speak()
```

Should we write:

```python
dog.bark()

cat.meow()

bird.chirp()
```

Or:

```python
animal.speak()
```

The second approach is much more flexible.

This idea is called **Polymorphism**.

---

# What Is Polymorphism?

The word comes from Greek:

```text
Poly = Many

Morph = Forms
```

Meaning:

> **One interface, many implementations.**

Different objects respond differently to the same method call.

---

# Example

```python
class Dog:

    def speak(self):
        print("Woof")
```

```python
class Cat:

    def speak(self):
        print("Meow")
```

```python
class Bird:

    def speak(self):
        print("Tweet")
```

Now:

```python
animals = [Dog(), Cat(), Bird()]

for animal in animals:

    animal.speak()
```

Output:

```text
Woof

Meow

Tweet
```

Notice:

The loop doesn't care about the object's exact type.

It simply calls:

```python
speak()
```

Each object provides its own implementation.

---

# Visualizing Polymorphism

```text
             speak()

                │

      ┌─────────┼─────────┐

      │         │         │

    Dog       Cat      Bird

      │         │         │

   "Woof"    "Meow"   "Tweet"
```

Same interface.

Different behavior.

---

# Why Polymorphism Matters

Imagine a payment system.

Different payment methods:

* Credit Card
* UPI
* PayPal
* Net Banking

Each implements:

```python
process_payment()
```

The application simply writes:

```python
payment.process_payment()
```

No large chain of:

```python
if payment_type == ...
```

is required.

This keeps software extensible.

---

> **Engineering Note**
>
> Polymorphism is one of the key reasons frameworks are extensible. For example, different database drivers, machine learning models, authentication providers, and LLM clients often expose the same interface while implementing different internal behavior.

---

# Duck Typing

Python takes polymorphism one step further through **Duck Typing**.

The philosophy is:

> "If it walks like a duck and quacks like a duck, treat it as a duck."

Python focuses on **behavior**, not explicit type declarations.

Example:

```python
class Dog:

    def speak(self):
        print("Woof")
```

```python
class Robot:

    def speak(self):
        print("Beep")
```

Function:

```python
def make_sound(entity):

    entity.speak()
```

Usage:

```python
make_sound(Dog())

make_sound(Robot())
```

Output:

```text
Woof

Beep
```

The function never checks whether the object is a `Dog` or a `Robot`.

It only requires that the object provides a `speak()` method.

---

# Composition vs Inheritance

## Question

Should software always use inheritance?

No.

Modern software often prefers **Composition**.

---

## What Is Composition?

Composition means:

> An object is built **using other objects**.

Instead of:

```text
Car

IS-A

Engine
```

(which is incorrect)

we recognize:

```text
Car

HAS-A

Engine
```

The relationship is different.

---

# Example

```python
class Engine:

    def start(self):
        print("Engine Started")
```

```python
class Car:

    def __init__(self):

        self.engine = Engine()

    def start(self):

        self.engine.start()

        print("Car Started")
```

Usage:

```python
car = Car()

car.start()
```

Output:

```text
Engine Started

Car Started
```

The `Car` object contains an `Engine` object.

---

# Inheritance vs Composition

| Inheritance             | Composition               |
| ----------------------- | ------------------------- |
| **Is-A** relationship   | **Has-A** relationship    |
| Reuses parent behavior  | Combines multiple objects |
| Strong coupling         | Looser coupling           |
| Good for specialization | Good for modular design   |

---

## Choosing Between Them

Ask one simple question.

Does the relationship read naturally?

Example:

```text
Manager IS-A Employee
```

✔ Use inheritance.

Example:

```text
Car HAS-A Engine
```

✔ Use composition.

Example:

```text
LLM Application HAS-A Retriever
```

✔ Composition.

Example:

```text
Retriever IS-A Vector Database
```

✘ Incorrect.

---

> **Engineering Note**
>
> Modern software architecture strongly favors **composition over inheritance** because it produces more modular, flexible, and maintainable systems. Many production frameworks internally use composition extensively.

---

## Remember

* Method overriding allows child classes to replace parent implementations.
* `super()` can invoke the parent implementation.
* Polymorphism means one interface can have many implementations.
* Python supports polymorphism naturally through Duck Typing.
* Inheritance models **is-a** relationships.
* Composition models **has-a** relationships.
* In production systems, composition is generally preferred over inheritance.

---
# Production Perspective

Object-Oriented Programming is one of the foundational design paradigms used in modern software engineering.

Although not every language is object-oriented, nearly every large Python framework makes extensive use of OOP concepts.

---

## Web Applications

Consider a typical FastAPI application.

```text
FastAPI Application

│

├── User

├── Product

├── Order

├── Payment

├── Notification

└── Authentication
```

Each of these is typically represented by one or more classes.

Example:

```python
class User:
    ...

class Order:
    ...

class PaymentService:
    ...
```

Each object manages its own data and behavior.

---

## Database Applications

ORMs (Object Relational Mappers) represent database tables as classes.

Example:

```python
class User:

    id

    name

    email
```

One object corresponds to one database row.

Conceptually:

```text
Database Table

↓

ORM Class

↓

Python Object
```

Frameworks such as:

* SQLAlchemy
* Django ORM

are built around this idea.

---

## Artificial Intelligence

Machine Learning frameworks are heavily object-oriented.

Example:

```python
model = NeuralNetwork()

optimizer = Adam()

dataset = ImageDataset()
```

Each component is an object with:

* Internal state
* Methods
* Configuration

---

## PyTorch Example

Conceptually:

```text
Model

↓

Layers

↓

Forward Pass

↓

Backward Pass
```

Each layer is an object.

Examples include:

* Linear Layer
* Convolution Layer
* Batch Normalization
* Dropout Layer

These objects collaborate to build larger neural networks.

---

## Enterprise GenAI Systems

Enterprise AI systems naturally map to objects.

Example:

```text
RAG System

│

├── Retriever

├── Embedder

├── Vector Database

├── Prompt Builder

├── LLM Client

├── Evaluator

└── Agent
```

Each component is typically implemented as a separate class.

Example:

```python
retriever.retrieve()

embedder.embed()

agent.run()
```

The application becomes a collection of collaborating objects.

---

## Cloud Applications

Cloud SDKs are also object-oriented.

Example:

```python
client = StorageClient()

bucket = client.get_bucket()

blob = bucket.get_blob()
```

Every resource is represented as an object.

---

## Framework Design

Most professional frameworks expose classes rather than standalone functions.

Examples:

```python
FastAPI()

QdrantClient()

SentenceTransformer()

OpenAI()

Redis()

Path()

Thread()

Lock()
```

Creating an object initializes internal resources and exposes related functionality through methods.

---

> **Engineering Note**
>
> Understanding OOP makes learning frameworks significantly easier. Once you understand classes, constructors, inheritance, and composition, most framework APIs become much more intuitive.

---

## Remember

Object-Oriented Programming is not just a language feature.

It is a way of organizing software that improves:

* Maintainability
* Reusability
* Scalability
* Testability
* Team collaboration

---

# Engineering Decisions

Professional engineers make thoughtful decisions about when and how to use OOP.

---

## Decision 1 — Model Real-World Concepts

Good:

```text
User

Order

Product

Payment
```

Poor:

```text
Data1

Object2

Helper3
```

Classes should represent meaningful business concepts.

---

## Decision 2 — Keep Classes Focused

Poor:

```text
User

↓

Authentication

Payments

Emails

Reports

Logging

Notifications
```

One class doing everything violates the **Single Responsibility Principle**.

Better:

```text
User

AuthenticationService

PaymentService

NotificationService
```

Each class has one responsibility.

---

## Decision 3 — Prefer Composition Over Inheritance

Instead of:

```text
Application

↓

Everything Inherited
```

Prefer:

```text
Application

↓

Uses Database

↓

Uses Logger

↓

Uses Retriever

↓

Uses LLM
```

Composition produces more modular systems.

---

## Decision 4 — Protect Internal State

Avoid exposing sensitive attributes directly.

Instead:

* Use private attributes.
* Validate updates.
* Expose controlled interfaces.

---

## Decision 5 — Choose the Correct Method Type

Use:

* Instance methods for object behavior.
* Class methods for class-wide behavior.
* Static methods for utility operations.

Choosing the appropriate method improves readability and intent.

---

## Decision 6 — Design for Extension

Good software anticipates future growth.

Instead of:

```python
if payment == "upi":
    ...

elif payment == "card":
    ...

elif payment == "paypal":
    ...
```

Prefer:

```text
Payment Interface

↓

UPI

Card

PayPal
```

Adding new payment methods requires creating a new class rather than modifying existing logic.

This follows the **Open/Closed Principle**, which we'll study later in software design.

---

# Common Mistakes

| Mistake                                  | Why It Is Incorrect                                               | Correct Understanding                                                     |
| ---------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Creating classes for everything          | Adds unnecessary complexity.                                      | Use classes when they model meaningful entities.                          |
| Confusing classes and objects            | A class is a blueprint; an object is an instance.                 | Understand the distinction clearly.                                       |
| Forgetting `self` in instance methods    | Python cannot determine which object the method belongs to.       | Instance methods always receive `self`.                                   |
| Using inheritance for every relationship | Many relationships are "has-a," not "is-a."                       | Prefer composition when appropriate.                                      |
| Creating overly large classes            | Difficult to maintain and test.                                   | Keep classes focused on one responsibility.                               |
| Exposing all internal data               | Breaks encapsulation and allows invalid states.                   | Protect important data with encapsulation and properties.                 |
| Overusing static methods                 | Can turn classes into collections of unrelated utility functions. | Use static methods only for behavior that logically belongs to the class. |
| Ignoring constructors                    | Leads to partially initialized objects.                           | Initialize required state in `__init__()`.                                |
| Deep inheritance hierarchies             | Increases complexity and tight coupling.                          | Favor shallow hierarchies and composition.                                |
| Treating OOP as the only solution        | Not every problem requires objects.                               | Choose the simplest design that solves the problem.                       |

---

## Interview Questions

## 1. What is Object-Oriented Programming?

**Expected Answer**

Object-Oriented Programming is a programming paradigm that organizes software using objects, which combine data (attributes) and behavior (methods).

---

## 2. What is the difference between a class and an object?

**Expected Answer**

A class is a blueprint or template, while an object is a specific instance created from that blueprint.

---

## 3. What is the purpose of `self`?

**Expected Answer**

`self` refers to the current object and allows instance methods to access that object's attributes and other methods.

---

## 4. What is the purpose of the `__init__()` method?

**Expected Answer**

`__init__()` is the constructor. It initializes the object's state when the object is created.

---

## 5. What is encapsulation?

**Expected Answer**

Encapsulation is the practice of combining data and behavior while restricting direct access to internal state through controlled interfaces.

---

## 6. What is inheritance?

**Expected Answer**

Inheritance allows a child class to reuse the attributes and methods of a parent class.

---

## 7. What is polymorphism?

**Expected Answer**

Polymorphism allows different objects to respond to the same method call using their own implementations.

---

## 8. What is the difference between an instance method, class method, and static method?

**Expected Answer**

* Instance methods operate on individual objects (`self`).
* Class methods operate on the class (`cls`).
* Static methods don't depend on either object or class state.

---

## 9. When should composition be preferred over inheritance?

**Expected Answer**

Composition should be preferred when objects have a **has-a** relationship. It provides greater flexibility and lower coupling than inheritance.

---

## 10. Why is OOP widely used in modern software engineering?

**Expected Answer**

OOP helps manage complexity by improving organization, reuse, maintainability, scalability, and extensibility in large software systems.

---

## Quick Revision

## OOP Building Blocks

```text
Class

↓

Object

↓

Attributes

↓

Methods
```

---

## Constructor

```python
class Student:

    def __init__(self, name):

        self.name = name
```

Automatically initializes object state.

---

## Method Types

| Type            | First Parameter | Typical Use                            |
| --------------- | --------------- | -------------------------------------- |
| Instance Method | `self`          | Object-specific behavior               |
| Class Method    | `cls`           | Class-wide behavior                    |
| Static Method   | None            | Utility functions related to the class |

---

## Four Pillars of OOP

```text
Encapsulation

↓

Inheritance

↓

Polymorphism

↓

Abstraction (Covered Later)
```

---

## Relationships

```text
IS-A

↓

Inheritance
```

```text
HAS-A

↓

Composition
```

---

## Best Practices

* Model real-world concepts.
* Keep classes focused.
* Use constructors for initialization.
* Protect internal state.
* Prefer composition over inheritance.
* Choose the appropriate method type.
* Design for maintainability and extensibility.

---

# Key Takeaways

* OOP organizes software around objects rather than standalone functions.
* Classes define blueprints; objects are concrete instances.
* Constructors initialize object state consistently.
* Instance variables belong to objects; class variables belong to the class.
* Instance methods, class methods, and static methods each serve different purposes.
* Encapsulation protects internal state and improves reliability.
* Inheritance enables code reuse but should only model **is-a** relationships.
* Polymorphism enables flexible, extensible software through common interfaces.
* Composition is generally preferred over deep inheritance in modern software architecture.
* Most production frameworks and Enterprise AI systems are built using OOP principles.

---
