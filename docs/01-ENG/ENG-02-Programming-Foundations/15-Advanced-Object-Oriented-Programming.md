File: `15-Advanced-Object-Oriented-Programming.md`
---

# Advanced Object-Oriented Programming

> **Domain:** Engineering Foundations (ENG)
> **Module:** ENG-02 — Programming Foundations
> **Document:** `15-Advanced-Object-Oriented-Programming.md`

---

## Learning Objectives

After completing this chapter, you should be able to:

* Understand why advanced OOP concepts exist.
* Master inheritance and code reuse.
* Understand polymorphism and dynamic dispatch.
* Learn abstraction using Abstract Base Classes (ABC).
* Understand composition vs inheritance.
* Learn multiple inheritance and Method Resolution Order (MRO).
* Understand mixins and their role in framework design.
* Build intuition for Python's object model.
* Recognize how advanced OOP is used in production frameworks like FastAPI, Django, SQLAlchemy, LangChain, and PyTorch.

---

## Prerequisites

Before reading this chapter, you should have completed:

* `09-Object-Oriented-Programming.md`
* `14-Functional-Programming.md`

You should already understand:

* Classes
* Objects
* Attributes
* Methods
* Constructors (`__init__`)
* Encapsulation
* Basic inheritance
* Functions
* Modules

---

## Estimated Reading Time

**3–4 Hours**

---

## Before We Start

In the previous OOP chapter, we learned how to create classes.

Example:

```python id="basic-class"
class Car:

    def start(self):

        print("Car Started")
```

Now imagine a company manufactures:

* Cars
* Bikes
* Trucks
* Buses

Should every class redefine:

```python id="duplicate"
start()

stop()

accelerate()

brake()
```

Again and again?

Probably not.

There must be a better way.

That is the motivation behind **Advanced OOP**.

---

# Think for a Moment

Imagine building a family tree.

```text id="family"
Vehicle

│

├── Car

├── Bike

├── Truck

└── Bus
```

Notice:

Every child shares some characteristics with the parent.

Similarly,

software often models relationships between objects.

---

# Why Advanced OOP Exists

Suppose we write:

```python id="car"
class Car:

    def start(self):

        ...
```

Later:

```python id="truck"
class Truck:

    def start(self):

        ...
```

Later:

```python id="bike"
class Bike:

    def start(self):

        ...
```

Soon,

hundreds of identical methods exist.

Problems:

* Code duplication
* Difficult maintenance
* Higher bug risk
* Poor scalability

Advanced OOP solves these problems.

---

# From Objects to Object Hierarchies

Basic OOP teaches us:

```text id="basic"
Object

↓

Attributes

↓

Methods
```

Advanced OOP teaches us:

```text id="hierarchy"
Objects

↓

Relationships

↓

Inheritance

↓

Polymorphism

↓

Composition

↓

Framework Design
```

The focus shifts from individual classes to **systems of interacting classes**.

---

# The Four Pillars Revisited

Earlier we introduced:

* Encapsulation
* Inheritance
* Polymorphism
* Abstraction

Now we'll study them from an engineering perspective.

These ideas form the foundation of nearly every large Python framework.

---

## What Changes in Advanced OOP?

Beginner OOP asks:

> "How do I create a class?"

Advanced OOP asks:

* How should classes interact?
* How can behavior be reused?
* How do frameworks organize thousands of classes?
* How do we extend existing systems without modifying them?

These are software architecture questions.

---

## Real-World Example

Consider a web framework.

Conceptually:

```text id="framework"
Framework

│

├── Request

├── Response

├── Router

├── Middleware

├── Authentication

├── Database

└── Cache
```

These are not isolated classes.

They collaborate through inheritance, composition, interfaces, and polymorphism.

---

# Python's Philosophy

Python supports OOP,

but unlike Java or C++,

it emphasizes:

* Simplicity
* Flexibility
* Duck Typing
* Composition
* Readability

Understanding this philosophy is more important than memorizing syntax.

---

## Roadmap for This Chapter

We'll cover the following topics in order.

```text id="roadmap"
Advanced OOP

│

├── Inheritance

├── Method Overriding

├── super()

├── Polymorphism

├── Duck Typing

├── Abstract Base Classes

├── Composition

├── Multiple Inheritance

├── Method Resolution Order (MRO)

├── Mixins

├── Descriptors

├── Magic Methods

├── Dataclasses

├── Slots

├── Metaclasses (Introduction)

└── Production Design Patterns
```

Each concept builds on the previous one.

---

# Engineering Perspective

Advanced OOP is not about creating deep inheritance trees.

Modern Python engineering favors:

* Small classes
* Composition
* Interfaces
* Dependency Injection
* Reusable components

We'll explore why throughout this chapter.

---

## Mental Model

Think of building with LEGO.

```text id="lego"
Small Pieces

↓

Combine

↓

Large Structure
```

Advanced OOP is about designing reusable building blocks that can be combined to create complex systems.

---

# First Principle

Basic OOP teaches you to create objects.

Advanced OOP teaches you to design **relationships between objects**.

Large software systems are built from collaborating objects, not isolated classes.

---

## Remember

* Advanced OOP focuses on class relationships and system design.
* It reduces duplication and improves maintainability.
* Modern frameworks rely heavily on advanced OOP concepts.
* Python emphasizes flexibility and composition.
* The goal is reusable, extensible software architecture.

---
## Inheritance in Depth

In the previous OOP chapter, we briefly introduced inheritance.

Now let's understand **why it exists**, **how it works internally**, and **how professional engineers use it**.

---

## The Problem

Suppose we are building software for a transportation company.

Without inheritance:

```python id="car-class"
class Car:

    def start(self):

        print("Engine Started")

    def stop(self):

        print("Engine Stopped")
```

```python id="truck-class"
class Truck:

    def start(self):

        print("Engine Started")

    def stop(self):

        print("Engine Stopped")
```

```python id="bus-class"
class Bus:

    def start(self):

        print("Engine Started")

    def stop(self):

        print("Engine Stopped")
```

Notice the problem.

Most of the code is duplicated.

---

# Code Duplication

Conceptually:

```text id="duplication"
Car

↓

start()

↓

stop()

────────────

Truck

↓

start()

↓

stop()

────────────

Bus

↓

start()

↓

stop()
```

If we discover a bug in `start()`,

we must fix it in every class.

This violates one of the most important software engineering principles:

> **Don't Repeat Yourself (DRY).**

---

# A Better Design

Instead,

move the common behavior into one parent class.

```python id="vehicle-parent"
class Vehicle:

    def start(self):

        print("Engine Started")

    def stop(self):

        print("Engine Stopped")
```

Then reuse it.

```python id="child-classes"
class Car(Vehicle):

    pass


class Truck(Vehicle):

    pass


class Bus(Vehicle):

    pass
```

Now every child automatically inherits the parent's behavior.

---

# Visualization

```text id="inheritance-tree"
          Vehicle

      /      |      \

    Car    Truck    Bus
```

Instead of duplicating code,

the children reuse the parent.

---

# What Is Inheritance?

Inheritance allows one class to acquire:

* Attributes
* Methods
* Behavior

from another class.

Terminology:

```text id="terms"
Parent Class

↓

Base Class

↓

Superclass

────────────

Child Class

↓

Derived Class

↓

Subclass
```

These terms mean the same thing.

---

# Using Inherited Methods

Example:

```python id="vehicle-example"
class Vehicle:

    def start(self):

        print("Engine Started")
```

```python id="car-example"
class Car(Vehicle):

    pass
```

Execution:

```python id="car-run"
car = Car()

car.start()
```

Output:

```text id="car-output"
Engine Started
```

Notice:

`Car` never defined `start()`.

Python found it in `Vehicle`.

---

# How Python Finds Methods

When you write:

```python id="lookup"
car.start()
```

Python searches in this order.

```text id="lookup-order"
Car

↓

Vehicle

↓

object
```

If the method isn't found,

Python raises:

```text id="attribute-error"
AttributeError
```

---

# Internal Lookup

Conceptually:

```text id="method-search"
Car

↓

Has start()?

↓

No

↓

Vehicle

↓

Has start()?

↓

Yes

↓

Execute
```

This process happens automatically.

---

# The Built-in `object` Class

Every Python class ultimately inherits from:

```python id="object"
object
```

Even if you don't write it explicitly.

Example:

```python id="simple"
class Car:

    pass
```

Internally,

Python treats it conceptually as:

```python id="internal"
class Car(object):

    pass
```

`object` is the root of Python's class hierarchy.

---

# Extending the Parent

Inheritance doesn't just reuse behavior.

Children can also add new behavior.

Example:

```python id="extend"
class Vehicle:

    def start(self):

        print("Engine Started")
```

```python id="car-extend"
class Car(Vehicle):

    def play_music(self):

        print("Playing Music")
```

Execution:

```python id="extend-run"
car = Car()

car.start()

car.play_music()
```

Output:

```text id="extend-output"
Engine Started

Playing Music
```

The child now has:

* Inherited methods
* New methods

---

# Method Overriding

Sometimes,

the child should behave differently.

Example:

```python id="parent"
class Animal:

    def speak(self):

        print("Some Sound")
```

Child:

```python id="dog"
class Dog(Animal):

    def speak(self):

        print("Bark")
```

Execution:

```python id="override-run"
dog = Dog()

dog.speak()
```

Output:

```text id="override-output"
Bark
```

The child replaces the parent's implementation.

This is called **Method Overriding**.

---

# Visualization

```text id="override"
Animal

↓

speak()

↓

Some Sound

────────────

Dog

↓

Overrides

↓

Bark
```

The child's version takes precedence.

---

# Why Override Methods?

Imagine:

```text id="animals"
Animal

↓

speak()

────────────

Dog

↓

Bark

────────────

Cat

↓

Meow

────────────

Cow

↓

Moo
```

The interface remains the same.

The behavior changes.

This is the beginning of **polymorphism**, which we'll study next.

---

# Calling the Parent with `super()`

Sometimes,

the child wants to:

* Reuse the parent's implementation.
* Add additional behavior.

Python provides:

```python id="super"
super()
```

Example:

```python id="vehicle-super"
class Vehicle:

    def start(self):

        print("Engine Started")
```

```python id="car-super"
class Car(Vehicle):

    def start(self):

        super().start()

        print("Music System Ready")
```

Execution:

```python id="super-run"
car = Car()

car.start()
```

Output:

```text id="super-output"
Engine Started

Music System Ready
```

---

# What Does `super()` Do?

Conceptually:

```text id="super-flow"
Car.start()

↓

super()

↓

Vehicle.start()

↓

Return

↓

Continue Child Method
```

`super()` allows the child to reuse the parent instead of duplicating code.

---

# Why Not Call the Parent Directly?

Technically,

you could write:

```python id="direct-call"
Vehicle.start(self)
```

But this hardcodes the parent class.

Using:

```python id="preferred"
super().start()
```

is preferred because it works correctly even in more advanced inheritance hierarchies (such as multiple inheritance).

---

# Constructor Inheritance

Constructors participate in inheritance too.

Parent:

```python id="parent-init"
class Vehicle:

    def __init__(self):

        print("Vehicle Created")
```

Child:

```python id="child-init"
class Car(Vehicle):

    pass
```

Execution:

```python id="constructor-run"
car = Car()
```

Output:

```text id="constructor-output"
Vehicle Created
```

Since `Car` has no constructor,

Python automatically uses the parent's constructor.

---

# Overriding Constructors

Suppose the child defines its own constructor.

```python id="child-constructor"
class Car(Vehicle):

    def __init__(self):

        print("Car Created")
```

Execution:

```python id="child-run"
car = Car()
```

Output:

```text id="child-output"
Car Created
```

Notice:

The parent's constructor is **not** called automatically.

---

# Constructor Chaining

To execute both constructors:

```python id="constructor-chain"
class Car(Vehicle):

    def __init__(self):

        super().__init__()

        print("Car Created")
```

Output:

```text id="chain-output"
Vehicle Created

Car Created
```

Conceptually:

```text id="constructor-flow"
Vehicle.__init__()

↓

Car.__init__()
```

This pattern is called **Constructor Chaining**.

---

> **Engineering Note**
>
> In production code, if a child class overrides `__init__()`, it should generally call `super().__init__()` unless there is a specific reason not to. This ensures that the parent class has an opportunity to initialize its own state correctly.

---

# First Principle

Inheritance is about **reusing existing behavior** while allowing child classes to extend or customize that behavior.

Use inheritance to model genuine **"is-a"** relationships (e.g., `Car` is a `Vehicle`).

Avoid using inheritance solely to share code—composition is often a better alternative, which we'll explore later.

---

## Remember

* Inheritance promotes code reuse.
* Child classes inherit methods and attributes from parent classes.
* Python searches for methods starting from the child and moving up the inheritance hierarchy.
* Method overriding allows children to customize inherited behavior.
* `super()` calls the parent implementation and supports cooperative inheritance.
* Constructors can be inherited, overridden, and chained.
* Inheritance models **is-a** relationships.

---

---

File: `15-Advanced-Object-Oriented-Programming.md`

Part 3 of 10

---

## Polymorphism

Earlier we learned that inheritance allows one class to reuse another class's behavior.

But inheritance alone is not enough.

Imagine:

```text id="animals"
Dog

↓

Cat

↓

Cow
```

Every animal can perform:

```text id="action"
speak()
```

Yet each animal produces a different sound.

This idea is called **Polymorphism**.

---

# What Does Polymorphism Mean?

The word comes from Greek.

```text id="greek"
Poly

↓

Many

────────────

Morph

↓

Forms
```

Polymorphism literally means:

> **Many Forms**

In Object-Oriented Programming,

it means:

> Different objects respond differently to the same method call.

---

# Why Polymorphism Exists

Suppose we write:

```python id="dog"
class Dog:

    def speak(self):

        print("Bark")
```

```python id="cat"
class Cat:

    def speak(self):

        print("Meow")
```

```python id="cow"
class Cow:

    def speak(self):

        print("Moo")
```

Question:

Can we write one piece of code that works for all three?

Yes.

That is the purpose of polymorphism.

---

# Example

```python id="animals-example"
class Dog:

    def speak(self):

        print("Bark")


class Cat:

    def speak(self):

        print("Meow")


class Cow:

    def speak(self):

        print("Moo")
```

Execution:

```python id="loop"
animals = [

    Dog(),

    Cat(),

    Cow()

]

for animal in animals:

    animal.speak()
```

Output:

```text id="sounds"
Bark

Meow

Moo
```

Notice:

The loop never checks:

* Is this a Dog?
* Is this a Cat?
* Is this a Cow?

It simply calls:

```python id="method"
animal.speak()
```

Each object behaves appropriately.

---

# Visualization

```text id="polymorphism"
Animal

↓

speak()

────────────

Dog

↓

Bark

────────────

Cat

↓

Meow

────────────

Cow

↓

Moo
```

Same interface.

Different implementations.

---

# Dynamic Dispatch

Question:

When Python executes:

```python id="dispatch"
animal.speak()
```

How does it know which implementation to call?

Answer:

It waits until **runtime**.

This process is called:

> **Dynamic Dispatch**

---

# Static vs Dynamic Dispatch

Static dispatch:

```text id="static"
Compiler

↓

Chooses Method
```

Dynamic dispatch:

```text id="dynamic"
Runtime

↓

Looks At Object

↓

Chooses Method
```

Python uses dynamic dispatch.

---

# Internal Process

Suppose:

```python id="runtime"
animal = Dog()
```

Execution:

```python id="call"
animal.speak()
```

Conceptually:

```text id="lookup"
animal

↓

Dog Object

↓

Search Dog

↓

Found speak()

↓

Execute
```

If:

```python id="runtime2"
animal = Cat()
```

the search becomes:

```text id="lookup2"
animal

↓

Cat Object

↓

Search Cat

↓

Execute
```

The code remains identical.

Only the object changes.

---

# Why Dynamic Dispatch Matters

Imagine building:

```text id="payments"
Payment

│

├── Credit Card

├── UPI

├── PayPal

└── Bank Transfer
```

Every payment method implements:

```python id="pay"
pay()
```

Your checkout system simply executes:

```python id="checkout"
payment.pay()
```

It never asks:

```text id="questions"
Is This UPI?

Is This PayPal?

Is This Card?
```

The object decides how to behave.

---

# Duck Typing

Python takes polymorphism even further.

Many languages ask:

```text id="java"
What Type

Is This Object?
```

Python asks:

```text id="duck"
Can This Object

Perform The Required Action?
```

This philosophy is called:

> **Duck Typing**

---

# The Famous Saying

> **If it walks like a duck and quacks like a duck, treat it as a duck.**

Python doesn't care about inheritance.

It cares about behavior.

---

## Example

```python id="person"
class Person:

    def speak(self):

        print("Hello")
```

```python id="robot"
class Robot:

    def speak(self):

        print("Beep")
```

Execution:

```python id="duck-loop"
objects = [

    Person(),

    Robot()

]

for obj in objects:

    obj.speak()
```

Output:

```text id="duck-output"
Hello

Beep
```

Notice:

`Person` and `Robot` share **no inheritance relationship**.

Yet the code works perfectly.

---

# Why?

Python only checks:

```text id="behavior"
Does Object

Have

speak()?
```

If yes,

the code executes.

This is duck typing.

---

# Duck Typing Visualization

```text id="duck-diagram"
Object

↓

Has speak()?

↓

Yes

↓

Execute
```

Python focuses on **capabilities**, not ancestry.

---

# Duck Typing vs Inheritance

Inheritance:

```text id="inheritance"
Animal

↓

Dog

↓

Cat
```

Duck Typing:

```text id="duck-typing"
Person

↓

Robot

↓

Dog

↓

Anything

↓

Has speak()
```

No common parent is required.

---

# Advantages of Duck Typing

Duck typing provides:

* Flexibility
* Extensibility
* Loose coupling
* Reusable code

New classes can participate without modifying existing code.

---

## Potential Risks

Duck typing also has risks.

Suppose:

```python id="tree"
class Tree:

    pass
```

Execution:

```python id="tree-call"
tree = Tree()

tree.speak()
```

Output:

```text id="error"
AttributeError
```

The object lacks the required behavior.

Python discovers this only at runtime.

---

# Liskov Substitution Principle (LSP)

One of the SOLID principles says:

> Objects of a subclass should be replaceable with objects of the superclass without breaking the program.

Example:

```text id="vehicle"
Vehicle

↓

Car

↓

Truck
```

If a function accepts:

```python id="vehicle-function"
vehicle.start()
```

it should work regardless of whether the object is:

* Car
* Truck
* Bus

This is Liskov Substitution.

---

# Good Example

```python id="vehicle-parent"
class Vehicle:

    def start(self):

        print("Started")
```

```python id="car-child"
class Car(Vehicle):

    pass
```

Any function expecting a `Vehicle` can safely accept a `Car`.

---

# Bad Example

Suppose:

```python id="bird"
class Bird:

    def fly(self):

        ...
```

Now:

```python id="penguin"
class Penguin(Bird):

    def fly(self):

        raise Exception("Cannot Fly")
```

Problem:

A `Penguin` is not substitutable for every `Bird`.

The design is flawed.

Instead,

the hierarchy should separate flying birds from non-flying birds.

---

# Real-World Example — File Objects

Python file objects all support:

```python id="file-methods"
read()

write()

close()
```

Whether the file is:

* Local
* Network
* Compressed
* Memory-backed

your code simply calls:

```python id="read"
file.read()
```

This is polymorphism.

---

# Real-World Example — AI Models

Suppose different models implement:

```python id="predict"
predict()
```

Examples:

* Random Forest
* XGBoost
* Neural Network

Application code simply executes:

```python id="model"
model.predict(data)
```

The specific model decides how prediction occurs.

---

> **Engineering Note**
>
> Frameworks like Scikit-learn rely heavily on polymorphism. Most estimators expose common methods such as `fit()`, `predict()`, and `transform()`, allowing generic pipelines to work with many different algorithms without modification.

---

# First Principle

Polymorphism allows software to focus on **what an object can do**, not **what the object is**.

This leads to flexible, extensible systems where new behavior can be added with minimal changes to existing code.

Duck typing takes this philosophy even further by emphasizing behavior over inheritance.

---

## Remember

* Polymorphism means "many forms."
* The same method call can produce different behavior depending on the object.
* Python uses dynamic dispatch to determine which method to execute at runtime.
* Duck typing focuses on behavior rather than inheritance.
* Liskov Substitution Principle ensures subclasses can safely replace parent classes.
* Polymorphism reduces conditional logic and improves extensibility.
* Many production frameworks rely on common interfaces rather than explicit type checks.

---
## Abstraction

Earlier we learned:

* Inheritance allows code reuse.
* Polymorphism allows different implementations behind a common interface.

Now we ask another question.

> **How can we ensure that every child class implements the methods it is supposed to?**

This is the purpose of **Abstraction**.

---

## The Problem

Suppose we are building a payment system.

We define:

```text
Payment

↓

pay()
```

Possible payment methods:

* Credit Card
* UPI
* PayPal
* Bank Transfer

Every payment method **must** implement:

```python
pay()
```

What happens if a developer forgets?

---

# Without Abstraction

```python id="payment"
class Payment:

    def pay(self):

        pass
```

Developer:

```python id="upi"
class UPI(Payment):

    pass
```

Execution:

```python id="upi-run"
payment = UPI()

payment.pay()
```

Nothing happens.

No error.

No payment.

A production bug.

---

# Why This Is Dangerous

Imagine:

```text
Payment

↓

pay()

↓

Does Nothing
```

The program continues silently.

Silent failures are often harder to detect than explicit errors.

---

# What Is Abstraction?

Abstraction means:

> **Defining what must be done without specifying how it must be done.**

The parent defines the contract.

Each child provides the implementation.

---

## Real-World Analogy

Think about a TV remote.

```text
Power Button

↓

Turns TV On
```

The remote defines:

```text
Power()
```

You don't need to know:

* Electrical circuits
* Signal encoding
* Television firmware

Only the interface matters.

---

# Abstract Classes

An **Abstract Class** is a class that:

* Cannot normally be instantiated directly.
* Exists to define common behavior and required methods.
* Serves as a blueprint for subclasses.

---

## Python's `abc` Module

Python provides:

```python
from abc import ABC, abstractmethod
```

Where:

* `ABC` → Abstract Base Class
* `abstractmethod` → Required method

---

# Creating an Abstract Class

```python id="abc-example"
from abc import ABC, abstractmethod

class Payment(ABC):

    @abstractmethod
    def pay(self):

        pass
```

Notice two things:

* `Payment` inherits from `ABC`.
* `pay()` is marked with `@abstractmethod`.

---

# What Does `@abstractmethod` Mean?

It tells Python:

```text
Every Child

↓

Must Implement

pay()
```

Otherwise,

object creation is prohibited.

---

# Example

```python id="upi-payment"
class UPI(Payment):

    def pay(self):

        print("UPI Payment")
```

Execution:

```python id="upi-object"
payment = UPI()

payment.pay()
```

Output:

```text
UPI Payment
```

Everything works correctly.

---

# Forgetting the Method

Suppose:

```python id="bad-child"
class CreditCard(Payment):

    pass
```

Execution:

```python id="bad-run"
card = CreditCard()
```

Output:

```text
TypeError:

Can't instantiate abstract class
CreditCard with abstract method pay
```

Python immediately detects the mistake.

---

# Visualization

```text
Abstract Class

↓

pay()

↓

Must Override

────────────

UPI

↓

Implements pay()

↓

Allowed

────────────

CreditCard

↓

No pay()

↓

Error
```

---

# Why Is This Useful?

Imagine 50 developers working together.

Without abstraction:

```text
Everyone

↓

Implements

Different Methods

↓

Chaos
```

With abstraction:

```text
Interface

↓

Standard

↓

Every Implementation

Matches
```

Everyone follows the same contract.

---

# Abstract Classes Can Have Normal Methods

Abstract classes are not limited to abstract methods.

Example:

```python id="normal-method"
from abc import ABC, abstractmethod

class Vehicle(ABC):

    def start(self):

        print("Engine Started")

    @abstractmethod
    def move(self):

        pass
```

Child:

```python id="car"
class Car(Vehicle):

    def move(self):

        print("Car Moving")
```

Execution:

```python id="vehicle-run"
car = Car()

car.start()

car.move()
```

Output:

```text
Engine Started

Car Moving
```

Notice:

* `start()` is inherited.
* `move()` must be implemented.

---

# Visualization

```text
Vehicle

│

├── start()

└── move() (Abstract)

        ↓

      Car

↓

Implements move()
```

---

# Multiple Abstract Methods

Example:

```python id="multiple"
class Database(ABC):

    @abstractmethod
    def connect(self):

        pass

    @abstractmethod
    def disconnect(self):

        pass

    @abstractmethod
    def execute(self):

        pass
```

Every database implementation must define all three methods.

---

# Why Not Just Raise `NotImplementedError`?

Some developers write:

```python id="notimplemented"
class Payment:

    def pay(self):

        raise NotImplementedError
```

This works,

but only when the method is called.

The error occurs **at runtime**.

With abstract classes,

Python prevents object creation immediately.

This catches mistakes earlier.

---

# Abstract Class vs Regular Class

| Regular Class           | Abstract Class                  |
| ----------------------- | ------------------------------- |
| Can be instantiated     | Cannot normally be instantiated |
| Methods optional        | Some methods mandatory          |
| No contract enforcement | Enforces implementation         |
| General-purpose         | Blueprint for subclasses        |

---

## Abstract Class vs Duck Typing

Python supports both approaches.

Duck Typing:

```text
Has pay()?

↓

Use It
```

Abstract Class:

```text
Must Implement pay()

↓

Otherwise Error
```

Duck typing provides flexibility.

Abstract classes provide safety.

Large enterprise applications often combine both.

---

# Real-World Example — Machine Learning

Scikit-learn models expose methods such as:

```python
fit()

predict()

transform()
```

Although implemented differently,

every estimator follows the same conceptual interface.

This consistency allows generic tools like pipelines and cross-validation to work with many algorithms.

---

# Real-World Example — Database Drivers

Imagine:

```text
Database

│

├── PostgreSQL

├── MySQL

├── SQLite

└── MongoDB
```

Every driver implements:

* `connect()`
* `disconnect()`
* `execute()`

Application code simply calls:

```python
database.connect()

database.execute()

database.disconnect()
```

without caring which database is used.

---

# Real-World Example — AI Models

Suppose every model exposes:

```python
train()

predict()

save()

load()
```

Application code becomes:

```python
model.train()

prediction = model.predict(data)
```

Switching from one model implementation to another requires little or no change.

---

# Interfaces in Other Languages

Languages like Java define **interfaces** explicitly.

Python doesn't have a dedicated interface keyword.

Instead,

developers typically use:

* Abstract Base Classes (`abc`)
* Duck Typing
* Protocols (introduced later with static typing)

This makes Python more flexible while still supporting contract-based design.

---

> **Engineering Note**
>
> Frameworks such as Django, SQLAlchemy, TensorFlow, and many enterprise SDKs define abstract base classes to establish common contracts. Plugin systems frequently rely on abstract classes so that independently developed components can integrate seamlessly.

---

## First Principle

Abstraction separates **what an object must do** from **how it does it**.

Abstract Base Classes provide a formal contract that every subclass must satisfy, making large codebases more predictable and easier to maintain.

---

## Remember

* Abstraction defines required behavior without implementation details.
* Abstract classes act as blueprints.
* Python provides abstraction through the `abc` module.
* `@abstractmethod` forces subclasses to implement required methods.
* Abstract classes can contain both abstract and concrete methods.
* Abstract Base Classes enforce contracts earlier than `NotImplementedError`.
* Use abstraction to standardize behavior across multiple implementations.

---
## Composition vs Inheritance

Earlier we learned:

* Inheritance models **"is-a"** relationships.
* Child classes reuse behavior from parent classes.

Now let's study another relationship that is often **more important** in modern software engineering.

> **Composition**

---

## The Problem

Suppose we're building a `Car`.

A car has:

* Engine
* Wheels
* Transmission
* Battery
* GPS

Question:

Is a car an engine?

```text
Car

=

Engine ?
```

No.

Instead:

```text
Car

Has An

Engine
```

This difference is fundamental.

---

# "Is-A" vs "Has-A"

Inheritance models:

```text id="is-a"
Car

↓

Vehicle
```

A Car **is a** Vehicle.

---

Composition models:

```text id="has-a"
Car

↓

Engine

↓

Battery

↓

GPS
```

A Car **has an** Engine.

---

# Mental Model

Ask yourself one question.

Can this sentence be completed naturally?

Example 1:

```text
A Dog is an Animal.
```

Correct.

Inheritance.

---

Example 2:

```text
A Car is an Engine.
```

Incorrect.

Composition.

---

Example 3:

```text
A Car has an Engine.
```

Correct.

Composition.

---

# Building a Car Using Composition

```python id="engine"
class Engine:

    def start(self):

        print("Engine Started")
```

Now:

```python id="car"
class Car:

    def __init__(self):

        self.engine = Engine()
```

Execution:

```python id="run"
car = Car()

car.engine.start()
```

Output:

```text id="output"
Engine Started
```

Notice:

`Car` doesn't inherit from `Engine`.

It owns an engine.

---

# Visualization

```text id="composition"
Car

│

├── Engine

├── Battery

├── GPS

└── Wheels
```

Each component has a separate responsibility.

---

# Why Composition Is Powerful

Suppose tomorrow we replace:

```text
Petrol Engine
```

with:

```text
Electric Motor
```

Only one component changes.

The rest of the car remains unchanged.

---

# Example

```python id="electric"
class ElectricMotor:

    def start(self):

        print("Electric Motor Started")
```

Now:

```python id="new-car"
class ElectricCar:

    def __init__(self):

        self.engine = ElectricMotor()
```

No inheritance hierarchy changes.

---

# Comparing Designs

Inheritance:

```text
Vehicle

↓

Car

↓

SportsCar

↓

LuxurySportsCar

↓

...
```

Hierarchy keeps growing.

---

Composition:

```text
Car

↓

Engine

↓

GPS

↓

Camera

↓

Battery
```

Small independent components.

---

# Why Large Inheritance Trees Become Difficult

Imagine:

```text
Animal

↓

Mammal

↓

Dog

↓

PoliceDog

↓

ExplosiveDetectionDog

↓

MilitaryExplosiveDetectionDog
```

Deep hierarchies become:

* Hard to understand
* Hard to modify
* Hard to test

---

# Modern Engineering Advice

Many experienced engineers follow this guideline:

> **Favor Composition Over Inheritance**

This does **not** mean:

Never use inheritance.

Instead it means:

Use inheritance only when a true **is-a** relationship exists.

Otherwise,

prefer composition.

---

## Composition Encourages Reuse

Suppose multiple classes need logging.

Inheritance:

```text
Logger

↓

UserService

↓

OrderService

↓

PaymentService
```

Instead:

```text
UserService

↓

Logger

────────────

OrderService

↓

Logger

────────────

PaymentService

↓

Logger
```

Every class owns a logger.

---

# Example

```python id="logger"
class Logger:

    def log(self, message):

        print(message)
```

```python id="service"
class UserService:

    def __init__(self):

        self.logger = Logger()

    def create_user(self):

        self.logger.log("Creating User")
```

No inheritance required.

---

# Delegation

Composition often works through:

> **Delegation**

Instead of doing the work itself,

one object delegates work to another.

Example:

```python id="delegation"
class Printer:

    def print(self):

        print("Printing")
```

```python id="computer"
class Computer:

    def __init__(self):

        self.printer = Printer()

    def print_document(self):

        self.printer.print()
```

Execution:

```python id="delegate-run"
computer = Computer()

computer.print_document()
```

Visualization:

```text
Computer

↓

Printer

↓

Print
```

The computer delegates printing.

---

# Dependency Injection

Composition naturally leads to another important concept:

> **Dependency Injection (DI)**

Instead of creating dependencies internally,

they are provided from outside.

---

## Without Dependency Injection

```python id="without-di"
class UserService:

    def __init__(self):

        self.logger = Logger()
```

Problem:

The class always uses `Logger`.

Testing becomes harder.

---

# With Dependency Injection

```python id="with-di"
class UserService:

    def __init__(self, logger):

        self.logger = logger
```

Execution:

```python id="inject"
logger = Logger()

service = UserService(logger)
```

Now any logger implementation can be supplied.

---

# Why Dependency Injection Matters

Suppose production uses:

```text
Database Logger
```

Testing uses:

```text
Fake Logger
```

Application code remains unchanged.

---

# Visualization

```text
Application

↓

Inject Logger

↓

UserService

↓

Uses Logger
```

The dependency comes from outside.

---

# Loose Coupling

Without DI:

```text
UserService

↓

Creates Logger
```

Strong coupling.

---

With DI:

```text
UserService

↓

Receives Logger
```

Loose coupling.

Loose coupling improves:

* Testing
* Flexibility
* Extensibility
* Maintainability

---

# Real-World Example — FastAPI

FastAPI uses dependency injection extensively.

Conceptually:

```python
@app.get("/users")

def get_users(

    database = Depends(get_database)

):
    ...
```

The framework injects the dependency automatically.

The endpoint doesn't create it manually.

---

# Real-World Example — LangChain

Chains are composed from smaller components.

```text
Retriever

↓

Prompt

↓

LLM

↓

Parser
```

Each component is injected into the chain rather than inherited.

---

# Real-World Example — SQLAlchemy

A repository typically receives:

* Database Session
* Connection
* Transaction

through dependency injection instead of creating them internally.

---

## Composition vs Inheritance

| Inheritance                            | Composition                               |
| -------------------------------------- | ----------------------------------------- |
| "Is-A" relationship                    | "Has-A" relationship                      |
| Reuses behavior through parent classes | Reuses behavior through contained objects |
| Tighter coupling                       | Looser coupling                           |
| Harder to modify deep hierarchies      | Easier to replace components              |
| Good for shared identity               | Good for assembling systems               |

---

## When to Choose Each

Choose **Inheritance** when:

* A genuine **is-a** relationship exists.
* Polymorphism is required.
* Shared behavior belongs naturally in a parent class.

Examples:

* `Car` → `Vehicle`
* `Dog` → `Animal`
* `SavingsAccount` → `BankAccount`

---

Choose **Composition** when:

* One object uses another.
* Components may change independently.
* You want flexibility.
* You need dependency injection.
* Behavior should be replaceable.

Examples:

* `Car` has an `Engine`
* `UserService` has a `Logger`
* `WebApp` has a `Database`
* `Agent` has an `LLM`

---

> **Engineering Note**
>
> Most modern Python frameworks—including FastAPI, Django, SQLAlchemy, LangChain, and LangGraph—favor composition and dependency injection over deep inheritance hierarchies. Components are assembled together rather than tightly coupled through long class chains.

---

## First Principle

Inheritance models **identity**.

Composition models **collaboration**.

Modern software systems are primarily built from many small objects collaborating through composition rather than inheriting from one another.

---

## Remember

* Inheritance represents **"is-a"** relationships.
* Composition represents **"has-a"** relationships.
* Composition generally leads to looser coupling.
* Delegation allows one object to forward work to another.
* Dependency Injection provides dependencies from outside the class.
* Modern Python engineering generally favors composition over inheritance when appropriate.
* Choose the relationship that best reflects the real-world domain.

---
## Multiple Inheritance

So far, every class inherited from **one parent**.

Example:

```text id="single-inheritance"
Vehicle

↓

Car
```

But Python also supports something more powerful.

A class can inherit from **multiple parent classes**.

This is called:

> **Multiple Inheritance**

---

# Why Multiple Inheritance Exists

Imagine building a Smart Car.

A Smart Car is:

* A Vehicle
* GPS Enabled
* Internet Enabled

Instead of copying features,

the Smart Car can inherit from multiple classes.

---

## Example

```python id="vehicle"
class Vehicle:

    def start(self):

        print("Engine Started")
```

```python id="gps"
class GPS:

    def navigate(self):

        print("Navigating")
```

```python id="smart-car"
class SmartCar(Vehicle, GPS):

    pass
```

Execution:

```python id="run"
car = SmartCar()

car.start()

car.navigate()
```

Output:

```text id="output"
Engine Started

Navigating
```

The child inherits behavior from both parents.

---

# Visualization

```text id="multiple"
        Vehicle

            \

             \

          SmartCar

             /

            /

          GPS
```

One child.

Multiple parents.

---

# Internal Lookup

Suppose:

```python id="lookup"
car.navigate()
```

Python searches:

```text id="lookup-order"
SmartCar

↓

Vehicle

↓

GPS

↓

object
```

Until the method is found.

---

# Why This Can Become Difficult

Suppose both parents define:

```python id="common"
start()
```

Example:

```python id="vehicle2"
class Vehicle:

    def start(self):

        print("Vehicle")
```

```python id="gps2"
class GPS:

    def start(self):

        print("GPS")
```

Now:

```python id="smart"
class SmartCar(Vehicle, GPS):

    pass
```

Question:

Which `start()` should Python execute?

---

# The Diamond Problem

Now imagine:

```text id="diamond"
        A

      /   \

     B     C

      \   /

        D
```

Suppose:

* B inherits A
* C inherits A
* D inherits B and C

Question:

If D calls:

```python id="method"
method()
```

Should Python execute:

* B's version?
* C's version?
* A's version?
* All of them?

This ambiguity is known as:

> **The Diamond Problem**

---

# Visualization

```text id="diamond2"
      Animal

      /    \

   Mammal  Pet

      \    /

        Dog
```

Both parents originate from the same ancestor.

Without clear rules,

method lookup becomes ambiguous.

---

# Method Resolution Order (MRO)

Python solves this using:

> **Method Resolution Order**

Usually abbreviated:

```text id="mro"
MRO
```

The MRO defines:

```text id="definition"
Exactly

Which Class

Python Searches

And In What Order
```

---

# Viewing the MRO

Every class provides:

```python id="mro-code"
ClassName.mro()
```

Example:

```python id="example"
class A:

    pass

class B(A):

    pass

class C(A):

    pass

class D(B, C):

    pass
```

Execution:

```python id="mro-run"
print(D.mro())
```

Output (conceptually):

```text id="mro-output"
D

↓

B

↓

C

↓

A

↓

object
```

Python follows this order consistently.

---

# Internal Search

Suppose:

```python id="search"
d.method()
```

Python searches:

```text id="search-flow"
D

↓

B

↓

C

↓

A

↓

object
```

The first matching method wins.

---

# How Python Computes MRO

Python uses an algorithm called:

> **C3 Linearization**

Fortunately,

you rarely need to implement it yourself.

What you should understand is:

* The order is deterministic.
* The order respects inheritance relationships.
* The order avoids ambiguity.

---

## Example

```python id="class-a"
class A:

    def hello(self):

        print("A")
```

```python id="class-b"
class B(A):

    def hello(self):

        print("B")
```

```python id="class-c"
class C(A):

    def hello(self):

        print("C")
```

```python id="class-d"
class D(B, C):

    pass
```

Execution:

```python id="hello-run"
d = D()

d.hello()
```

Output:

```text id="hello-output"
B
```

Why?

Because `B` appears before `C` in the MRO.

---

# `super()` in Multiple Inheritance

Earlier we learned:

```python id="super"
super()
```

works in single inheritance.

It becomes even more important in multiple inheritance.

Suppose:

```python id="parent-a"
class A:

    def hello(self):

        print("A")
```

```python id="parent-b"
class B(A):

    def hello(self):

        print("B")

        super().hello()
```

```python id="parent-c"
class C(B):

    def hello(self):

        print("C")

        super().hello()
```

Execution:

```python id="chain"
C().hello()
```

Output:

```text id="chain-output"
C

B

A
```

Each class cooperatively calls the next one.

---

# Cooperative Multiple Inheritance

Now consider:

```python id="coop-a"
class A:

    def hello(self):

        print("A")
```

```python id="coop-b"
class B(A):

    def hello(self):

        print("B")

        super().hello()
```

```python id="coop-c"
class C(A):

    def hello(self):

        print("C")

        super().hello()
```

```python id="coop-d"
class D(B, C):

    def hello(self):

        print("D")

        super().hello()
```

Execution:

```python id="coop-run"
D().hello()
```

Conceptual Output:

```text id="coop-output"
D

B

C

A
```

Notice:

Each class executes exactly once.

This is made possible by:

* MRO
* `super()`
* Cooperative inheritance

---

# Why Direct Parent Calls Are Dangerous

Avoid:

```python id="direct"
B.hello(self)
```

Why?

Because:

* It hardcodes the parent.
* It ignores the MRO.
* It can execute methods multiple times.
* It breaks cooperative inheritance.

Prefer:

```python id="preferred"
super().hello()
```

Python will follow the correct MRO automatically.

---

# Mixins

Multiple inheritance is often used through:

> **Mixins**

A mixin is:

* A small class
* Providing one reusable capability
* Not intended to stand alone

---

## Example

```python id="log-mixin"
class LoggingMixin:

    def log(self):

        print("Logging")
```

```python id="user"
class User:

    pass
```

```python id="logged-user"
class LoggedUser(

    User,

    LoggingMixin

):

    pass
```

Execution:

```python id="logged-run"
user = LoggedUser()

user.log()
```

Output:

```text id="logged-output"
Logging
```

---

# Why Mixins Are Useful

Instead of creating:

```text id="large"
User

↓

LoggedUser

↓

CachedLoggedUser

↓

AuthenticatedCachedLoggedUser
```

Use:

```text id="mixins"
User

+

LoggingMixin

+

CachingMixin

+

AuthenticationMixin
```

Small reusable behaviors.

---

# Characteristics of Mixins

Mixins generally:

* Represent one capability.
* Are small.
* Do not model domain entities.
* Are designed for reuse.
* Usually have no independent meaning.

Examples:

* LoggingMixin
* TimestampMixin
* SerializationMixin
* ValidationMixin

---

## Real-World Example — Django

Django provides many mixins.

Examples include:

* LoginRequiredMixin
* PermissionRequiredMixin
* ContextMixin

Developers combine them with views to add behavior without duplicating code.

---

## Real-World Example — SQLAlchemy

SQLAlchemy models often inherit from reusable mixins such as:

* TimestampMixin
* SoftDeleteMixin
* AuditMixin

Each mixin contributes one feature.

---

## Real-World Example — FastAPI

Although FastAPI favors composition and dependency injection, several underlying Starlette components and third-party extensions use mixins to provide reusable behavior.

---

> **Engineering Note**
>
> Multiple inheritance is powerful but should be used carefully. In modern Python engineering, its primary use is **mixins**, not deep inheritance hierarchies. Whenever multiple inheritance is required, classes should cooperate using `super()` so that Python's Method Resolution Order can function correctly.

---

## First Principle

Multiple inheritance allows a class to combine behavior from several parent classes.

Python resolves ambiguity using the **Method Resolution Order (MRO)** and encourages **cooperative inheritance** through `super()`.

In production systems, multiple inheritance is most commonly used to build small, reusable **mixins** rather than complex class hierarchies.

---

## Remember

* Python supports multiple inheritance.
* Multiple inheritance can create ambiguity, known as the Diamond Problem.
* Python resolves ambiguity using the MRO (Method Resolution Order).
* `ClassName.mro()` shows the lookup order.
* Always prefer `super()` over direct parent calls.
* Mixins provide reusable capabilities through multiple inheritance.
* Use multiple inheritance sparingly and primarily for mixins.

---
## Magic Methods (Special Methods)

So far we've created classes with our own methods like:

```python id="regular-method"
class Car:

    def start(self):

        print("Started")
```

But Python classes can do much more.

For example:

```python id="print-object"
car = Car()

print(car)
```

Why does `print()` work with objects?

Or:

```python id="compare"
car1 == car2
```

How does Python compare two objects?

Or:

```python id="length"
len(collection)
```

How does Python know the length?

The answer is:

> **Magic Methods**

---

# What Are Magic Methods?

Magic methods are special methods whose names begin and end with double underscores.

Examples:

```text id="magic-list"
__init__

__str__

__repr__

__len__

__eq__

__iter__

__next__

__call__

__getitem__
```

They are also called:

* Special Methods
* Dunder Methods (Double Underscore)

---

# Why Do They Exist?

Instead of writing:

```python id="display"
car.display()
```

Python allows:

```python id="print"
print(car)
```

Internally,

Python calls:

```python id="str-method"
car.__str__()
```

Magic methods integrate your objects with Python's built-in language features.

---

# Visualization

```text id="magic-flow"
print(car)

↓

Python

↓

car.__str__()

↓

Display Text
```

---

# The `__str__()` Method

Suppose:

```python id="person-basic"
class Person:

    def __init__(self, name):

        self.name = name
```

Execution:

```python id="default-print"
person = Person("Alice")

print(person)
```

Output:

```text id="default-output"
<__main__.Person object at 0x...>
```

Not very helpful.

---

# Customizing Object Display

```python id="str-example"
class Person:

    def __init__(self, name):

        self.name = name

    def __str__(self):

        return f"Person({self.name})"
```

Execution:

```python id="print-person"
person = Person("Alice")

print(person)
```

Output:

```text id="person-output"
Person(Alice)
```

Now the object prints meaningfully.

---

# The `__repr__()` Method

`__repr__()` provides the **official string representation** of an object.

Example:

```python id="repr-example"
class Person:

    def __init__(self, name):

        self.name = name

    def __repr__(self):

        return f"Person('{self.name}')"
```

Execution:

```python id="repr-run"
person = Person("Alice")

print(repr(person))
```

Output:

```text id="repr-output"
Person('Alice')
```

---

# `__str__()` vs `__repr__()`

| `__str__()`       | `__repr__()`                  |
| ----------------- | ----------------------------- |
| User-friendly     | Developer-friendly            |
| Used by `print()` | Used by `repr()` and debugger |
| Human readable    | Unambiguous representation    |

Example:

```text id="comparison"
print(obj)

↓

__str__()

────────────

repr(obj)

↓

__repr__()
```

If `__str__()` is missing,

Python falls back to `__repr__()`.

---

# The `__len__()` Method

Suppose:

```python id="box"
class Box:

    def __init__(self, items):

        self.items = items

    def __len__(self):

        return len(self.items)
```

Execution:

```python id="len-run"
box = Box([1, 2, 3])

print(len(box))
```

Output:

```text id="len-output"
3
```

Internally:

```text id="len-flow"
len(box)

↓

box.__len__()
```

---

# The `__eq__()` Method

Suppose:

```python id="compare-class"
class Person:

    def __init__(self, name):

        self.name = name
```

Execution:

```python id="compare-default"
a = Person("Alice")

b = Person("Alice")

print(a == b)
```

Output:

```text id="compare-output"
False
```

Why?

Because Python compares object identity by default.

---

# Custom Equality

```python id="eq-example"
class Person:

    def __init__(self, name):

        self.name = name

    def __eq__(self, other):

        return self.name == other.name
```

Execution:

```python id="eq-run"
a = Person("Alice")

b = Person("Alice")

print(a == b)
```

Output:

```text id="eq-result"
True
```

Now equality is based on data instead of memory addresses.

---

# Visualization

Without `__eq__()`:

```text id="identity"
Object A

↓

Memory

↓

Object B

↓

Different

↓

False
```

With `__eq__()`:

```text id="value"
Object A

↓

Compare Name

↓

Object B

↓

Same Name

↓

True
```

---

# The `__call__()` Method

Objects themselves can become callable.

Example:

```python id="callable"
class Multiplier:

    def __call__(self, x):

        return x * 2
```

Execution:

```python id="call-run"
multiply = Multiplier()

print(multiply(5))
```

Output:

```text id="call-output"
10
```

Internally:

```text id="call-flow"
multiply(5)

↓

multiply.__call__(5)
```

Frameworks often use callable objects extensively.

---

# The `__getitem__()` Method

Suppose:

```python id="getitem"
class Numbers:

    def __init__(self):

        self.data = [10, 20, 30]

    def __getitem__(self, index):

        return self.data[index]
```

Execution:

```python id="getitem-run"
numbers = Numbers()

print(numbers[1])
```

Output:

```text id="getitem-output"
20
```

Python converts:

```text id="getitem-flow"
numbers[1]

↓

numbers.__getitem__(1)
```

---

# Operator Overloading

Magic methods also enable **operator overloading**.

---

## Example

Suppose:

```python id="vector"
class Vector:

    def __init__(self, x, y):

        self.x = x

        self.y = y
```

Normally:

```python id="invalid"
v1 + v2
```

raises an error.

---

# Implementing `__add__()`

```python id="add-method"
class Vector:

    def __init__(self, x, y):

        self.x = x

        self.y = y

    def __add__(self, other):

        return Vector(

            self.x + other.x,

            self.y + other.y

        )

    def __repr__(self):

        return f"Vector({self.x}, {self.y})"
```

Execution:

```python id="vector-run"
v1 = Vector(1, 2)

v2 = Vector(3, 4)

print(v1 + v2)
```

Output:

```text id="vector-output"
Vector(4, 6)
```

---

# Common Operator Methods

| Operator | Magic Method    |
| -------- | --------------- |
| `+`      | `__add__()`     |
| `-`      | `__sub__()`     |
| `*`      | `__mul__()`     |
| `/`      | `__truediv__()` |
| `==`     | `__eq__()`      |
| `<`      | `__lt__()`      |
| `>`      | `__gt__()`      |
| `<=`     | `__le__()`      |
| `>=`     | `__ge__()`      |

---

## Why Operator Overloading Exists

Suppose you create:

* Vector
* Matrix
* ComplexNumber
* Polynomial

Writing:

```python id="operator"
v1 + v2
```

is much more natural than:

```python id="method-call"
v1.add(v2)
```

The code becomes expressive while preserving meaning.

---

# Magic Methods Everywhere

Many built-in Python operations rely on magic methods.

| Python Code    | Magic Method                |
| -------------- | --------------------------- |
| `print(obj)`   | `__str__()`                 |
| `repr(obj)`    | `__repr__()`                |
| `len(obj)`     | `__len__()`                 |
| `obj1 == obj2` | `__eq__()`                  |
| `obj()`        | `__call__()`                |
| `obj[index]`   | `__getitem__()`             |
| `for x in obj` | `__iter__()` / `__next__()` |

Understanding these methods helps explain how Python itself works.

---

## Real-World Examples

## Dataclasses

Python's `@dataclass` automatically generates methods such as:

* `__init__()`
* `__repr__()`
* `__eq__()`

This removes repetitive boilerplate.

---

## NumPy

NumPy arrays overload operators:

```python id="numpy"
a + b

a * b
```

These expressions invoke magic methods internally to perform vectorized operations.

---

## Pandas

Pandas DataFrames overload indexing:

```python id="pandas"
df["name"]
```

which ultimately relies on methods like `__getitem__()`.

---

## PyTorch

Tensor operations such as:

```python id="tensor"
tensor1 + tensor2
```

work because tensors implement arithmetic magic methods.

---

> **Engineering Note**
>
> Magic methods are the mechanism that allows user-defined classes to behave like native Python objects. Libraries such as NumPy, Pandas, SQLAlchemy, and PyTorch rely heavily on them to create intuitive, Pythonic APIs.

---

# First Principle

Magic methods allow your classes to integrate seamlessly with Python's syntax and built-in functions.

Rather than inventing new APIs, you teach Python **how your objects should behave** when using familiar language constructs like `+`, `==`, `len()`, indexing, iteration, and printing.

---

## Remember

* Magic methods are special methods surrounded by double underscores.
* They define how objects interact with Python's language features.
* `__str__()` creates a user-friendly representation.
* `__repr__()` creates a developer-friendly representation.
* `__eq__()` customizes equality.
* `__len__()` enables `len()`.
* `__call__()` makes objects callable.
* Operator overloading uses magic methods like `__add__()`.
* Many major Python frameworks rely heavily on magic methods.

---
## Properties

Earlier we learned about attributes.

Example:

```python id="attribute"
class Person:

    def __init__(self, name):

        self.name = name
```

Execution:

```python id="access"
person = Person("Alice")

print(person.name)
```

Everything works.

But what happens if we want to:

* Validate data
* Compute values
* Restrict modification
* Keep the same simple syntax

This is where **Properties** become useful.

---

# The Problem

Suppose:

```python id="bad-age"
class Person:

    def __init__(self):

        self.age = 20
```

Execution:

```python id="negative"
person = Person()

person.age = -50
```

Now the object contains invalid data.

We need validation.

---

# Traditional Getter and Setter

Languages like Java solve this using:

```java
getAge()

setAge()
```

Example:

```text id="java-style"
person.getAge()

person.setAge(20)
```

Python prefers a cleaner approach.

---

# Python Properties

Instead of:

```python id="getter"
person.get_age()
```

Python allows:

```python id="property"
person.age
```

while still executing validation internally.

---

# Example

```python id="property-example"
class Person:

    def __init__(self):

        self._age = 0

    @property
    def age(self):

        return self._age
```

Execution:

```python id="property-run"
person = Person()

print(person.age)
```

Output:

```text id="property-output"
0
```

Notice:

We accessed `age`

without calling a method.

---

# Why Use `_age`?

Convention:

```text id="private"
_age

↓

Internal Variable
```

The property exposes:

```text id="public"
age
```

Users interact with `age`.

The implementation uses `_age`.

---

# Setter Property

Now add validation.

```python id="setter"
class Person:

    def __init__(self):

        self._age = 0

    @property
    def age(self):

        return self._age

    @age.setter
    def age(self, value):

        if value < 0:

            raise ValueError(

                "Age cannot be negative"

            )

        self._age = value
```

Execution:

```python id="setter-run"
person = Person()

person.age = 25

print(person.age)
```

Output:

```text id="setter-output"
25
```

---

# Invalid Value

Execution:

```python id="invalid-age"
person.age = -10
```

Output:

```text id="invalid-output"
ValueError

Age cannot be negative
```

Validation happens automatically.

---

# Visualization

```text id="property-flow"
person.age = 25

↓

Setter

↓

Validation

↓

Store Value

────────────

person.age

↓

Getter

↓

Return Value
```

The syntax stays simple.

---

# Read-Only Properties

Suppose we want:

```text id="readonly"
Read

↓

Allowed

────────────

Write

↓

Not Allowed
```

Simply omit the setter.

Example:

```python id="readonly-example"
class Circle:

    def __init__(self, radius):

        self._radius = radius

    @property
    def radius(self):

        return self._radius
```

Execution:

```python id="readonly-run"
circle = Circle(5)

print(circle.radius)
```

Works.

But:

```python id="readonly-error"
circle.radius = 10
```

Output:

```text id="readonly-output"
AttributeError
```

---

# Computed Properties

Properties can calculate values.

Example:

```python id="rectangle"
class Rectangle:

    def __init__(self, width, height):

        self.width = width

        self.height = height

    @property
    def area(self):

        return self.width * self.height
```

Execution:

```python id="rectangle-run"
rectangle = Rectangle(10, 5)

print(rectangle.area)
```

Output:

```text id="rectangle-output"
50
```

Notice:

`area` behaves like an attribute,

not a function.

---

# Why Computed Properties?

Instead of:

```python id="method-area"
rectangle.area()
```

Python allows:

```python id="property-area"
rectangle.area
```

Cleaner API.

---

# Descriptors

Properties are actually built on a more general mechanism called:

> **Descriptors**

Descriptors are one of Python's most powerful features.

Many advanced frameworks rely on them.

---

## What Is a Descriptor?

A descriptor is an object that controls attribute access.

It can define:

* Reading
* Writing
* Deleting

of attributes.

---

## Descriptor Methods

A descriptor may implement:

```python id="descriptor-methods"
__get__()

__set__()

__delete__()
```

Python automatically invokes these methods during attribute access.

---

# Simplified Descriptor

```python id="descriptor"
class PositiveNumber:

    def __get__(

        self,

        instance,

        owner

    ):

        return instance._value

    def __set__(

        self,

        instance,

        value

    ):

        if value < 0:

            raise ValueError()

        instance._value = value
```

Used inside another class:

```python id="descriptor-use"
class Person:

    age = PositiveNumber()
```

Now:

```python id="descriptor-run"
person = Person()

person.age = 30
```

Validation occurs automatically.

---

# Visualization

```text id="descriptor-flow"
person.age

↓

Descriptor

↓

__get__()

────────────

person.age = 20

↓

Descriptor

↓

__set__()
```

Descriptors intercept attribute access.

---

# Why Descriptors Exist

Suppose multiple classes require validation.

Without descriptors:

```text id="duplicate"
Class A

↓

Validation

────────────

Class B

↓

Validation

────────────

Class C

↓

Validation
```

Repeated logic.

---

With descriptors:

```text id="reuse"
Descriptor

↓

Reusable

↓

Many Classes
```

Validation logic is written once.

---

# Properties Are Descriptors

An important insight:

```text id="property-descriptor"
@property

↓

Built Using

↓

Descriptors
```

Properties are simply a specialized descriptor implementation.

---

# Attribute Lookup

Suppose:

```python id="lookup"
person.age
```

Python performs roughly:

```text id="lookup-order"
Descriptor?

↓

Yes

↓

Execute Descriptor

────────────

No

↓

Instance Dictionary

────────────

No

↓

Class

────────────

No

↓

Parent Classes
```

Understanding this explains much of Python's object behavior.

---

# `__getattr__()`

Suppose an attribute doesn't exist.

Python calls:

```python id="getattr"
__getattr__()
```

Example:

```python id="getattr-example"
class Person:

    def __getattr__(

        self,

        name

    ):

        return "Not Found"
```

Execution:

```python id="missing"
person = Person()

print(person.age)
```

Output:

```text id="missing-output"
Not Found
```

Only missing attributes trigger `__getattr__()`.

---

# `__getattribute__()`

This is even more powerful.

Python calls:

```python id="getattribute"
__getattribute__()
```

for **every** attribute access.

Example:

```python id="ga-example"
class Person:

    def __getattribute__(

        self,

        name

    ):

        print(name)

        return object.__getattribute__(

            self,

            name

        )
```

Every attribute lookup passes through this method.

---

# Difference

| Method               | Called When            |
| -------------------- | ---------------------- |
| `__getattr__()`      | Attribute not found    |
| `__getattribute__()` | Every attribute access |

Be careful:

Incorrect implementations of `__getattribute__()` can easily lead to infinite recursion.

---

## Managed Attributes

Properties and descriptors allow attributes to become:

* Validated
* Cached
* Computed
* Logged
* Lazy-loaded

while keeping the API simple.

Example:

```python id="managed"
user.email
```

Internally,

Python may:

* Validate
* Fetch from database
* Cache
* Format

The caller doesn't need to know.

---

# Real-World Example — SQLAlchemy

Model attributes such as:

```python id="sqlalchemy"
user.name
```

are descriptors.

Accessing them may:

* Read from memory
* Trigger lazy loading
* Track modifications
* Prepare SQL queries

All transparently.

---

# Real-World Example — Django ORM

```python id="django"
user.posts
```

may automatically execute a database query the first time it is accessed.

The attribute behaves like a normal object,

but internally it is managed through descriptors.

---

# Real-World Example — Pydantic

Pydantic models validate assignments and conversions using managed attribute mechanisms, providing clean APIs while enforcing data integrity.

---

> **Engineering Note**
>
> Descriptors are one of the least understood yet most important features of Python's object model. They power properties, methods, ORM fields, validation systems, dependency injection mechanisms, and many advanced framework internals.

---

## First Principle

Properties and descriptors separate **how data is accessed** from **how it is stored**.

They allow Python objects to expose a clean, intuitive interface while internally performing validation, computation, caching, logging, or lazy loading.

---

## Remember

* `@property` creates managed attributes.
* `@property.setter` adds validation during assignment.
* Read-only properties omit the setter.
* Descriptors implement `__get__()`, `__set__()`, and `__delete__()`.
* Properties are implemented using descriptors.
* `__getattr__()` handles missing attributes.
* `__getattribute__()` intercepts every attribute access.
* Many Python frameworks rely heavily on descriptors.

---
## `__slots__`

By default,

every Python object stores its attributes inside a special dictionary called:

```python id="dict"
__dict__
```

Example:

```python id="person"
class Person:

    def __init__(self, name):

        self.name = name

        self.age = 20
```

Execution:

```python id="dict-run"
person = Person("Alice")

print(person.__dict__)
```

Output:

```text id="dict-output"
{
    'name': 'Alice',
    'age': 20
}
```

This dictionary provides flexibility,

but it also consumes additional memory.

---

# The Problem

Suppose an application creates:

```text id="millions"
10 Million Objects
```

Every object contains its own `__dict__`.

Even if every object has exactly the same attributes,

memory is allocated for a dictionary.

This can become expensive.

---

# Enter `__slots__`

Python provides:

```python id="slots"
__slots__
```

to optimize memory usage.

Example:

```python id="slots-example"
class Person:

    __slots__ = (

        "name",

        "age"

    )

    def __init__(

        self,

        name,

        age

    ):

        self.name = name

        self.age = age
```

Now:

```python id="slots-run"
person = Person(

    "Alice",

    20

)
```

works normally.

---

# What Changes?

Without slots:

```text id="without-slots"
Object

↓

__dict__

↓

Attributes
```

With slots:

```text id="with-slots"
Object

↓

Fixed Memory Layout

↓

Slots
```

No instance dictionary is created by default.

---

# Benefits

Using `__slots__`:

* Reduces memory usage.
* Speeds up attribute access slightly.
* Prevents accidental creation of new attributes.

---

## Preventing Extra Attributes

Example:

```python id="slots-error"
person.city = "Delhi"
```

Output:

```text id="slots-output"
AttributeError
```

Only declared attributes are allowed.

---

# When Should You Use `__slots__`?

Good candidates:

* Millions of objects
* Data models
* Scientific computing
* Simulations
* High-performance applications

Avoid premature optimization for small programs.

---

## Dataclasses

Earlier we repeatedly wrote:

```python id="repetition"
class Person:

    def __init__(...):

        ...

    def __repr__(...):

        ...

    def __eq__(...):

        ...
```

This becomes repetitive.

Python provides:

```python id="dataclass"
@dataclass
```

to generate much of this boilerplate automatically.

---

# Basic Example

Without dataclass:

```python id="without"
class Person:

    def __init__(

        self,

        name,

        age

    ):

        self.name = name

        self.age = age
```

---

With dataclass:

```python id="with"
from dataclasses import dataclass

@dataclass
class Person:

    name: str

    age: int
```

That's all.

---

# Automatic Methods

Python automatically generates:

* `__init__()`
* `__repr__()`
* `__eq__()`

No manual implementation required.

---

## Example

```python id="dataclass-run"
person = Person(

    "Alice",

    20

)

print(person)
```

Output:

```text id="dataclass-output"
Person(

    name='Alice',

    age=20
)
```

---

# Equality

```python id="equal"
p1 = Person(

    "Alice",

    20

)

p2 = Person(

    "Alice",

    20
)

print(p1 == p2)
```

Output:

```text id="equal-output"
True
```

The generated `__eq__()` compares field values automatically.

---

# Frozen Dataclasses

Sometimes objects should never change.

Example:

```python id="frozen"
from dataclasses import dataclass

@dataclass(

    frozen=True

)

class Point:

    x: int

    y: int
```

Execution:

```python id="frozen-run"
point = Point(

    1,

    2
)

point.x = 5
```

Output:

```text id="frozen-output"
FrozenInstanceError
```

The object becomes immutable.

---

# Why Dataclasses Matter

They reduce:

* Boilerplate
* Human error
* Maintenance effort

They're widely used for:

* Configuration objects
* DTOs (Data Transfer Objects)
* API models
* Domain models

---

## Python's Object Model

Everything in Python is an object.

Examples:

```python id="objects"
5

"Hello"

[]

{}

Person()
```

All are objects.

Even:

```python id="function"
def greet():

    pass
```

Functions are objects.

Classes are also objects.

---

# Visualization

```text id="object-model"
Everything

↓

Object

↓

Type

↓

object
```

Python's object system is remarkably consistent.

---

# Classes Are Objects Too

Example:

```python id="class-object"
class Person:

    pass
```

Execution:

```python id="type"
print(type(Person))
```

Output:

```text id="type-output"
<class 'type'>
```

The class itself is an object created by another object:

```text id="meta"
type
```

---

# Metaclasses (Introduction)

This leads us to:

> **Metaclasses**

Simply stated:

A metaclass is:

> **A class that creates classes.**

---

## Normal Relationship

Normally:

```text id="normal"
Class

↓

Creates

↓

Objects
```

Example:

```python id="normal-example"
Person

↓

Alice
```

---

# Metaclass Relationship

Metaclasses introduce another level.

```text id="meta-diagram"
Metaclass

↓

Creates

↓

Class

↓

Creates

↓

Object
```

---

# The Built-in `type`

Python already provides a metaclass.

```python id="type-example"
type
```

Example:

```python id="type-run"
print(

    type(Person)

)
```

Output:

```text id="type-result"
<class 'type'>
```

Every normal class is created by `type`.

---

# Why Metaclasses Exist

Frameworks sometimes need to:

* Register classes automatically.
* Validate class definitions.
* Inject methods.
* Modify attributes.
* Build APIs.

Metaclasses allow classes themselves to be customized.

---

## Example Use Cases

Metaclasses are used by:

* Django ORM
* SQLAlchemy
* Pydantic
* Marshmallow
* Declarative APIs

Most Python developers never write their own metaclass,

but many use frameworks built on them.

---

## Should Beginners Use Metaclasses?

Usually,

No.

Metaclasses solve advanced framework-level problems.

Understanding the concept is more important than writing them from scratch.

---

## Relationship Between Concepts

```text id="summary"
Object

↓

Class

↓

Metaclass

↓

type
```

Every level creates the next one.

---

# Real-World Example — Pydantic

When you write:

```python id="pydantic"
class User(

    BaseModel

):
    ...
```

Pydantic inspects:

* Field types
* Defaults
* Validators

during class creation.

Metaclass-like mechanisms make this possible.

---

# Real-World Example — SQLAlchemy

ORM models are processed when the class is defined.

The framework:

* Registers columns
* Creates metadata
* Builds mappings

before any objects are created.

---

## Real-World Example — Django ORM

When you define:

```python id="django-model"
class User(

    models.Model

):
    ...
```

Django processes the class definition,

registers fields,

and prepares database mappings.

---

> **Engineering Note**
>
> `__slots__`, dataclasses, and metaclasses illustrate different layers of Python's object model. `__slots__` optimizes instances, dataclasses reduce repetitive class definitions, and metaclasses customize how classes themselves are created. Together they demonstrate how flexible Python's object system is.

---

# First Principle

Python's object model is layered:

* Objects store data.
* Classes define object behavior.
* Metaclasses define class behavior.

Most applications use dataclasses frequently, occasionally benefit from `__slots__`, and rely on framework-provided metaclasses without implementing custom ones.

---

## Remember

* `__slots__` reduces memory usage and restricts instance attributes.
* Dataclasses automatically generate common methods.
* Frozen dataclasses create immutable objects.
* Everything in Python is an object, including functions and classes.
* Classes are instances of the built-in metaclass `type`.
* Metaclasses customize class creation.
* Most engineers use metaclasses indirectly through frameworks.

---
## Production Engineering Guidelines

Advanced OOP is not about using every available feature.

It is about designing software that is:

* Maintainable
* Extensible
* Testable
* Readable
* Scalable

Professional engineers make design decisions based on long-term maintainability rather than language features.

---

## Guideline 1 — Prefer Composition Over Inheritance

Before writing:

```python
class Car(Vehicle):
    ...
```

Ask:

> **Is this really an "is-a" relationship?**

Good:

```text
Dog is an Animal
```

Bad:

```text
UserService is a Logger
```

Instead:

```text
UserService has a Logger
```

Composition creates looser coupling.

---

# Guideline 2 — Keep Classes Small

Avoid:

```text
User

↓

Authentication

↓

Database

↓

Email

↓

Logging

↓

Validation

↓

Caching

↓

Notifications
```

Better:

```text
User

↓

AuthenticationService

↓

EmailService

↓

NotificationService
```

Each class should have one primary responsibility.

---

# Guideline 3 — Program to Interfaces

Instead of depending on:

```python
PostgreSQLDatabase
```

depend on:

```python
Database
```

Application:

```python
database.connect()
```

Whether the implementation is:

* PostgreSQL
* MySQL
* SQLite

should not matter.

---

# Guideline 4 — Favor Dependency Injection

Avoid:

```python
class Service:

    def __init__(self):

        self.db = Database()
```

Prefer:

```python
class Service:

    def __init__(

        self,

        database

    ):

        self.database = database
```

This improves:

* Testing
* Flexibility
* Reusability

---

# Guideline 5 — Use Inheritance Carefully

Deep inheritance trees often become difficult to maintain.

Avoid structures like:

```text
Animal

↓

Mammal

↓

Dog

↓

PoliceDog

↓

SpecialPoliceDog

↓

...
```

Prefer flatter hierarchies and reusable components.

---

# SOLID Principles (Overview)

Most enterprise OOP design is influenced by the **SOLID** principles.

---

## S — Single Responsibility Principle (SRP)

A class should have **one reason to change**.

Bad:

```text
Invoice

↓

Calculate

↓

Save

↓

Print

↓

Email
```

Good:

```text
Invoice

↓

InvoiceCalculator

↓

InvoiceRepository

↓

InvoicePrinter

↓

EmailService
```

---

## O — Open/Closed Principle (OCP)

Software should be:

* Open for extension.
* Closed for modification.

Example:

Instead of modifying an existing payment processor every time a new payment method is added,

create a new implementation of the same interface.

---

## L — Liskov Substitution Principle (LSP)

Subclasses should replace parent classes without breaking the application.

Example:

```python
vehicle.start()
```

should work regardless of whether:

* Car
* Bus
* Truck

is passed.

---

## I — Interface Segregation Principle (ISP)

Clients should not depend on methods they do not use.

Instead of one huge interface:

```text
Printer

↓

Print

↓

Scan

↓

Fax

↓

Copy
```

Split responsibilities into smaller interfaces where appropriate.

---

## D — Dependency Inversion Principle (DIP)

High-level modules should depend on abstractions,

not concrete implementations.

Example:

```text
Application

↓

Database Interface

↓

PostgreSQL
```

instead of:

```text
Application

↓

PostgreSQL
```

---

# Common Mistakes

## Mistake 1 — Using Inheritance for Code Reuse

Some developers inherit simply to reuse methods.

Example:

```python
class Logger(Database):
```

This is incorrect.

Ask:

> **Is a Logger a Database?**

If not,

use composition.

---

## Mistake 2 — Deep Class Hierarchies

Large inheritance chains are:

* Difficult to understand.
* Difficult to debug.
* Difficult to extend.

Keep hierarchies shallow.

---

## Mistake 3 — Ignoring `super()`

Example:

```python
class Child(Parent):

    def __init__(self):

        ...
```

Forgetting:

```python
super().__init__()
```

may leave the parent improperly initialized.

---

## Mistake 4 — Overusing Multiple Inheritance

Multiple inheritance should primarily be used for:

* Mixins
* Small reusable capabilities

Avoid complex inheritance graphs unless there is a clear architectural need.

---

## Mistake 5 — Writing Large Classes

If a class exceeds several hundred lines,

ask:

* Can responsibilities be separated?
* Can behavior move into collaborators?
* Can composition simplify the design?

Large classes are often a design smell.

---

# Best Practices

* Keep classes focused.
* Favor composition over inheritance.
* Use abstract base classes to define contracts.
* Use polymorphism instead of large `if`/`elif` chains.
* Inject dependencies instead of creating them internally.
* Use dataclasses for simple data containers.
* Use properties for validation and computed attributes.
* Override magic methods thoughtfully.
* Prefer explicit, readable designs over clever abstractions.

---

## Advanced OOP in Enterprise AI Systems

Advanced OOP concepts appear throughout production AI systems.

---

## FastAPI

Uses:

* Dependency Injection
* Decorators
* Composition
* Abstract interfaces

---

## LangChain

Uses:

* Base classes
* Composition
* Runnable abstractions
* Polymorphism

Example:

```text
Retriever

↓

Prompt

↓

LLM

↓

Output Parser
```

Each component implements a common interface.

---

## LangGraph

Nodes are composed into graphs.

Each node has a clear responsibility.

Graph execution relies heavily on:

* Composition
* Interfaces
* Polymorphism

---

## PyTorch

Neural networks inherit from:

```python
nn.Module
```

Every custom model overrides:

```python
forward()
```

Training code simply calls:

```python
model(data)
```

Internally:

```text
model(data)

↓

__call__()

↓

forward()
```

This is a combination of:

* Inheritance
* Polymorphism
* Magic methods

---

## SQLAlchemy

Uses:

* Descriptors
* Metaclasses
* Mixins
* Properties
* Composition

to build a powerful ORM.

---

## Django ORM

Uses:

* Metaclasses
* Descriptors
* Abstract models
* Mixins
* Multiple inheritance

to define database models.

---

# Interview Questions

---

## 1. What is the difference between inheritance and composition?

**Expected Answer**

Inheritance models an **"is-a"** relationship, while composition models a **"has-a"** relationship. Composition is generally preferred for flexibility and loose coupling.

---

## 2. What is polymorphism?

**Expected Answer**

Polymorphism allows different objects to respond differently to the same method call, enabling generic code to work with many implementations.

---

## 3. What is Duck Typing?

**Expected Answer**

Duck typing focuses on an object's behavior rather than its inheritance hierarchy. If an object supports the required operations, it can be used.

---

## 4. Why use Abstract Base Classes?

**Expected Answer**

ABCs define contracts that subclasses must implement, improving consistency and catching implementation errors early.

---

## 5. What does `super()` do?

**Expected Answer**

`super()` delegates method calls to the next class in the Method Resolution Order, enabling cooperative inheritance.

---

## 6. What is MRO?

**Expected Answer**

The Method Resolution Order defines the sequence Python follows when searching for attributes and methods in an inheritance hierarchy.

---

## 7. What are mixins?

**Expected Answer**

Mixins are small reusable classes that provide one specific capability and are commonly used with multiple inheritance.

---

## 8. What are magic methods?

**Expected Answer**

Magic methods (dunder methods) define how user-defined objects interact with Python language features such as printing, comparison, arithmetic, iteration, and indexing.

---

## 9. What is a descriptor?

**Expected Answer**

A descriptor is an object that customizes attribute access by implementing methods like `__get__()`, `__set__()`, or `__delete__()`.

---

## 10. When should `__slots__` be used?

**Expected Answer**

`__slots__` is useful when creating a very large number of objects with a fixed set of attributes and memory optimization is important.

---

## Quick Revision

```text
Advanced OOP

│

├── Inheritance

├── Method Overriding

├── super()

├── Polymorphism

├── Duck Typing

├── Abstract Base Classes

├── Composition

├── Dependency Injection

├── Multiple Inheritance

├── Method Resolution Order

├── Mixins

├── Magic Methods

├── Properties

├── Descriptors

├── __slots__

├── Dataclasses

└── Metaclasses
```

---
