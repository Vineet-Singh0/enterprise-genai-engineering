File: `11-Collections-in-Python.md`
---
# Collections in Python

> **Domain:** Engineering Foundations (ENG)
> **Module:** ENG-02 — Programming Foundations
> **Document:** `11-Collections-in-Python.md`

---

## Learning Objectives

After completing this chapter, you should be able to:

* Understand what Python collections are.
* Explain why collections exist.
* Understand the differences between Python Lists, Tuples, Sets, and Dictionaries.
* Learn when to use each collection.
* Understand mutability and immutability.
* Build intuition for selecting the correct collection in production software.
* Connect Python collections with data structures studied in the previous chapter.

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
* `09-Object-Oriented-Programming.md`
* `10-Introduction-to-Data-Structures.md`

You should already understand:

* Variables
* Data Types
* Objects
* Functions
* Data Structures
* Lists at a conceptual level

---

## Estimated Reading Time

**2–2.5 Hours**

---

## Before We Start

## Question

Suppose you're building an online shopping application.

A customer may have:

* One name
* One email
* One phone number

Simple.

Now consider:

* Multiple products in a cart
* Multiple shipping addresses
* Multiple payment methods
* Multiple completed orders

Can we store these using individual variables?

```python id="cart-problem"
product1 = "Laptop"

product2 = "Mouse"

product3 = "Keyboard"

product4 = "Monitor"

...
```

This quickly becomes impossible to manage.

We need collections.

---

# Think for a Moment

Consider modern applications.

Spotify

```text id="spotify"
Songs

Playlists

Albums

Artists
```

Instagram

```text id="instagram"
Followers

Posts

Comments

Likes
```

Enterprise AI

```text id="enterprise-ai"
Documents

Embeddings

Tokens

Messages

Metadata
```

Every application stores groups of related information.

Python provides built-in collection types specifically designed for this purpose.

---

# Why Collections Exist

In the previous chapter we learned about **data structures**.

Data structures answer the question:

> "How should information be organized?"

Python collections are practical implementations of several common data structures.

Instead of implementing everything from scratch,

Python provides optimized built-in collections.

---

> **Engineering Note**
>
> Professional engineers rarely implement basic data structures themselves. Instead, they rely on highly optimized implementations provided by the language or standard library unless a specialized requirement exists.

---

## What Is a Collection?

A collection is an object capable of storing multiple values.

Unlike primitive variables:

```python id="primitive-example"
age = 25
```

Collections store many values together.

Example:

```python id="list-example"
ages = [21, 24, 27, 30]
```

Conceptually:

```text id="collection-concept"
One Object

↓

Multiple Values
```

---

# Why Collections Matter

Suppose an application stores:

```text id="student-list"
Alice

Bob

Charlie

David
```

Without collections:

```python id="variables"
student1 = "Alice"

student2 = "Bob"

student3 = "Charlie"

student4 = "David"
```

With collections:

```python id="collection"
students = [

    "Alice",

    "Bob",

    "Charlie",

    "David"

]
```

The second approach is:

* Easier to maintain
* Easier to process
* Easier to scale

---

# The Four Primary Python Collections

Python provides four major built-in collection types.

```text id="python-collections"
Collections

│

├── List

├── Tuple

├── Set

└── Dictionary
```

Each solves a different engineering problem.

---

# Overview

| Collection | Ordered | Mutable | Duplicate Values      | Indexed |
| ---------- | ------- | ------- | --------------------- | ------- |
| List       | Yes     | Yes     | Yes                   | Yes     |
| Tuple      | Yes     | No      | Yes                   | Yes     |
| Set        | No      | Yes     | No                    | No      |
| Dictionary | Yes*    | Yes     | Keys: No, Values: Yes | Keys    |

> **Note:** Dictionaries preserve insertion order in Python 3.7+, but conceptually they are optimized for key-based access rather than positional indexing.

---

## Why Four Collections?

Question:

Why didn't Python simply create one universal collection?

Because different applications require different behavior.

Examples:

Shopping Cart

Needs:

* Order
* Duplicates
* Modification

↓

Use:

```text id="cart-list"
List
```

---

Coordinates

Need:

* Fixed values
* Should never change

↓

Use:

```text id="coords"
Tuple
```

---

Unique Tags

Need:

* No duplicates

↓

Use:

```text id="tags"
Set
```

---

User Profile

Need:

* Name → Value mapping

↓

Use:

```text id="profile"
Dictionary
```

---

# Mental Model

Imagine organizing your office.

Drawer 1:

```text id="drawer1"
Documents

Ordered

Can Add More
```

Similar to:

```text id="list"
List
```

---

Drawer 2:

```text id="drawer2"
Birth Certificate

Passport

Permanent Records
```

Should never change.

Similar to:

```text id="tuple"
Tuple
```

---

Drawer 3:

```text id="drawer3"
Employee IDs

No Duplicate IDs
```

Similar to:

```text id="set"
Set
```

---

Drawer 4:

```text id="drawer4"
Employee ID

↓

Employee Information
```

Key → Value relationship.

Similar to:

```text id="dictionary"
Dictionary
```

---

# Collections and Data Structures

From the previous chapter:

```text id="previous"
Data Structures
```

Now:

```text id="mapping"
Python Collections

↓

Built-in Implementations
```

Approximate mapping:

| Python Collection | Underlying Data Structure |
| ----------------- | ------------------------- |
| List              | Dynamic Array             |
| Tuple             | Immutable Array           |
| Set               | Hash Table                |
| Dictionary        | Hash Table                |

Understanding this mapping helps explain their behavior and performance.

---

# Choosing the Right Collection

Ask yourself:

```text id="decision-tree"
Need ordering?

↓

Need modification?

↓

Need uniqueness?

↓

Need key-value lookup?
```

The answers determine which collection is appropriate.

We'll build this decision framework throughout the chapter.

---

# First Principle

Collections are not interchangeable.

Each collection is optimized for a different type of problem.

Professional engineers choose collections based on:

* Performance
* Readability
* Safety
* Business requirements

—not habit.

---

## Remember

* Collections store multiple values in a single object.
* Python provides four primary built-in collections.
* Lists, tuples, sets, and dictionaries solve different problems.
* Python collections are implementations of common data structures.
* Choosing the correct collection improves code quality and performance.

---
## Lists

## Question

Suppose you're storing a shopping cart.

The customer adds:

* Laptop
* Mouse
* Keyboard

Tomorrow they add:

* Monitor

Next week they remove:

* Mouse

Should the collection allow these changes?

Absolutely.

This is exactly what a **List** is designed for.

---

## What Is a List?

A **list** is an ordered, mutable collection that allows duplicate values.

Breaking that definition down:

* **Ordered** → Elements maintain their position.
* **Mutable** → Elements can be added, removed, or changed.
* **Duplicates Allowed** → The same value may appear multiple times.

---

## Creating a List

Lists are created using square brackets.

Example:

```python id="create-list"
students = [
    "Alice",
    "Bob",
    "Charlie"
]
```

Another example:

```python id="numbers-list"
numbers = [10, 20, 30, 40]
```

Python creates one list object containing multiple elements.

---

# Empty List

Sometimes we don't know the elements in advance.

Example:

```python id="empty-list"
shopping_cart = []
```

Initially:

```text id="empty"
[]
```

Elements can be added later.

---

# Lists Can Store Different Types

Python lists are heterogeneous.

Example:

```python id="mixed-list"
data = [
    "Alice",
    25,
    True,
    98.5
]
```

Although possible,

production code generally stores related types together for readability and maintainability.

---

> **Engineering Note**
>
> While Python permits mixed-type lists, production software often favors homogeneous collections because they simplify validation, debugging, and static analysis.

---

# Ordered Collection

Suppose we create:

```python id="ordered"
fruits = [
    "Apple",
    "Banana",
    "Orange"
]
```

Conceptually:

```text id="order"
Position

0 → Apple

1 → Banana

2 → Orange
```

The order is preserved.

Python will not rearrange elements automatically.

---

# Indexing

Every element has an index.

Indexes begin at **0**.

Example:

```text id="indexing"
Index

0   1   2

↓

Apple Banana Orange
```

Access:

```python id="index-access"
print(fruits[0])
```

Output:

```text id="output1"
Apple
```

---

# Why Zero-Based Indexing?

Many beginners ask:

> Why doesn't indexing begin at 1?

Because indexes represent an **offset from the beginning**.

Conceptually:

```text id="offset"
Beginning

↓

0 Steps → First Element

1 Step  → Second Element

2 Steps → Third Element
```

Zero-based indexing simplifies memory calculations in many programming languages.

---

# Accessing Elements

Example:

```python id="access-elements"
colors = [
    "Red",
    "Green",
    "Blue"
]

print(colors[1])
```

Output:

```text id="green"
Green
```

Python retrieves the element at index 1.

---

# Negative Indexing

Python also supports negative indexes.

Conceptually:

```text id="negative-index"
Index

 0   1   2

Red Green Blue

-3  -2  -1
```

Example:

```python id="negative"
print(colors[-1])
```

Output:

```text id="blue"
Blue
```

Negative indexes count from the end.

---

# List Length

Python provides:

```python id="len-example"
len(fruits)
```

Example:

```python id="length"
fruits = [
    "Apple",
    "Banana",
    "Orange"
]

print(len(fruits))
```

Output:

```text id="length-output"
3
```

`len()` returns the number of elements.

---

# Modifying Elements

Lists are mutable.

Example:

```python id="modify"
fruits = [
    "Apple",
    "Banana",
    "Orange"
]

fruits[1] = "Mango"
```

Result:

```text id="modified"
Apple

Mango

Orange
```

The original value is replaced.

---

# Adding Elements

The most common method is:

```python id="append-method"
append()
```

Example:

```python id="append"
fruits = [
    "Apple",
    "Banana"
]

fruits.append("Orange")
```

Result:

```text id="append-result"
Apple

Banana

Orange
```

The new element is added at the end.

---

# Inserting Elements

Sometimes we need a specific position.

Example:

```python id="insert"
fruits = [
    "Apple",
    "Orange"
]

fruits.insert(1, "Banana")
```

Result:

```text id="insert-result"
Apple

Banana

Orange
```

Existing elements shift to the right.

---

# Removing Elements

Python provides several methods.

### Remove by Value

```python id="remove"
fruits.remove("Banana")
```

Removes the **first matching value**.

---

### Remove by Position

```python id="pop"
fruits.pop(1)
```

Removes the element at index 1.

---

### Remove Last Element

```python id="pop-last"
fruits.pop()
```

Removes and returns the last element.

---

### Delete Using `del`

```python id="del"
del fruits[0]
```

Deletes the element at the specified index.

---

# List Operations

Common operations include:

| Operation | Example               |
| --------- | --------------------- |
| Create    | `[]`                  |
| Access    | `list[index]`         |
| Modify    | `list[index] = value` |
| Append    | `append()`            |
| Insert    | `insert()`            |
| Remove    | `remove()`            |
| Delete    | `del`                 |
| Length    | `len()`               |

---

## List Growth

Conceptually:

```text id="growth"
[]

↓

[A]

↓

[A B]

↓

[A B C]

↓

[A B C D]
```

Lists grow dynamically.

This is why Python lists are considered **dynamic arrays**.

---

# Internal Working (High-Level)

Conceptually:

```text id="dynamic-array"
List

↓

Underlying Dynamic Array

↓

Occasional Resize

↓

Continue Growing
```

Python occasionally allocates a larger block of memory and copies existing elements.

This resizing strategy provides efficient average performance while allowing dynamic growth.

We'll revisit this mechanism when studying algorithms and memory management.

---

## Remember

* Lists are ordered, mutable collections.
* Lists allow duplicate values.
* Indexes start at **0**.
* Negative indexes count from the end.
* Lists grow dynamically.
* Common operations include `append()`, `insert()`, `remove()`, `pop()`, and `len()`.
* Python lists are implemented as dynamic arrays.

---
# List Slicing

## Question

Suppose you have a list of students.

```python
students = [
    "Alice",
    "Bob",
    "Charlie",
    "David",
    "Emma"
]
```

What if you only want:

```text
Bob

Charlie

David
```

Should you access each element individually?

```python
students[1]

students[2]

students[3]
```

That works,

but Python provides a much cleaner solution:

**Slicing**.

---

# What Is Slicing?

Slicing allows us to extract a portion of a collection.

Instead of retrieving one element,

we retrieve multiple consecutive elements.

Conceptually:

```text
Original List

↓

[A][B][C][D][E]

↓

Slice

↓

[B][C][D]
```

---

# General Syntax

```python
collection[start : stop]
```

Notice something important.

The **start index is included**.

The **stop index is excluded**.

Think of it as:

```text
Start

↓

Included

────────────

Stop

↓

Excluded
```

---

# Example

```python
numbers = [10, 20, 30, 40, 50]

print(numbers[1:4])
```

Output:

```text
[20, 30, 40]
```

Explanation:

```text
Index

0   1   2   3   4

↓

10 20 30 40 50

   ↑-------↑

Start     Stop
```

Stop is excluded.

---

# Omitting the Start Index

If the start index is omitted,

Python begins from the first element.

Example:

```python
numbers = [10, 20, 30, 40, 50]

print(numbers[:3])
```

Output:

```text
[10, 20, 30]
```

Conceptually:

```text
Beginning

↓

Take Until Index 3
```

---

# Omitting the Stop Index

If the stop index is omitted,

Python continues until the end.

Example:

```python
print(numbers[2:])
```

Output:

```text
[30, 40, 50]
```

Conceptually:

```text
Start at Index 2

↓

Continue Until End
```

---

# Copying a List

Suppose we want a shallow copy.

Python allows:

```python
copy = numbers[:]
```

Conceptually:

```text
Original

↓

Entire Slice

↓

New List
```

This is one of the simplest ways to copy a list.

---

# Step Size

Python also supports a third parameter.

Syntax:

```python
collection[start:stop:step]
```

The step controls how many elements are skipped.

Example:

```python
numbers = [10, 20, 30, 40, 50, 60]

print(numbers[::2])
```

Output:

```text
[10, 30, 50]
```

Conceptually:

```text
Take

↓

Skip One

↓

Take

↓

Skip One
```

---

# Reversing a List

A negative step reverses the direction.

Example:

```python
numbers = [10, 20, 30, 40]

print(numbers[::-1])
```

Output:

```text
[40, 30, 20, 10]
```

Conceptually:

```text
End

↓

Move Backwards

↓

Beginning
```

---

# Why Slicing Matters

Imagine processing:

* First 100 log entries
* Last 50 messages
* Top 10 search results
* Recent transactions

Slicing provides a concise and readable way to work with subsets of data.

---

## Iterating Over Lists

Collections become powerful when combined with loops.

Example:

```python
students = [
    "Alice",
    "Bob",
    "Charlie"
]

for student in students:

    print(student)
```

Output:

```text
Alice

Bob

Charlie
```

The loop automatically visits each element.

---

# Internal Working

Conceptually:

```text
List

↓

First Element

↓

Second Element

↓

Third Element

↓

End
```

The `for` loop requests one element at a time from the list.

We'll study Python iterators in a later chapter.

---

# Using `enumerate()`

Sometimes we need both:

* Index
* Value

Example:

```python
students = [
    "Alice",
    "Bob",
    "Charlie"
]

for index, student in enumerate(students):

    print(index, student)
```

Output:

```text
0 Alice

1 Bob

2 Charlie
```

`enumerate()` automatically provides both.

---

# Membership Testing

Python allows checking whether a value exists.

Example:

```python
fruits = [
    "Apple",
    "Banana",
    "Orange"
]

print("Banana" in fruits)
```

Output:

```text
True
```

Another example:

```python
print("Mango" in fruits)
```

Output:

```text
False
```

---

# Nested Lists

Lists can contain other lists.

Example:

```python
matrix = [

    [1, 2, 3],

    [4, 5, 6],

    [7, 8, 9]

]
```

Conceptually:

```text
Matrix

↓

[1 2 3]

[4 5 6]

[7 8 9]
```

Nested lists are commonly used to represent:

* Tables
* Grids
* Images
* Matrices

---

# Accessing Nested Elements

Example:

```python
matrix = [

    [1, 2, 3],

    [4, 5, 6],

    [7, 8, 9]

]

print(matrix[1][2])
```

Output:

```text
6
```

Execution:

```text
matrix[1]

↓

[4, 5, 6]

↓

Index 2

↓

6
```

---

# Introducing Tuples

So far we've learned about lists.

Lists are mutable.

But sometimes data should never change.

Examples:

* GPS coordinates
* RGB color values
* Date of birth
* Database primary keys

Python provides another collection:

**Tuple**.

---

## What Is a Tuple?

A tuple is an ordered collection that is **immutable**.

Breaking it down:

* Ordered
* Indexed
* Allows duplicates
* Cannot be modified after creation

---

## Creating a Tuple

Tuples use parentheses.

Example:

```python
coordinates = (10, 20)
```

Another example:

```python
colors = (
    "Red",
    "Green",
    "Blue"
)
```

Conceptually:

```text
Tuple

↓

Fixed Values

↓

Cannot Change
```

---

# List vs Tuple

| Feature    | List    | Tuple   |
| ---------- | ------- | ------- |
| Ordered    | Yes     | Yes     |
| Mutable    | Yes     | No      |
| Indexed    | Yes     | Yes     |
| Duplicates | Allowed | Allowed |

The key difference is **mutability**.

---

## Why Tuples Exist

Suppose GPS coordinates are:

```text
Latitude

↓

Longitude
```

Should these values change accidentally?

Probably not.

Immutability protects important data.

---

> **Engineering Note**
>
> Tuples are commonly used for fixed records, function return values, configuration constants, coordinates, and other data that should remain unchanged throughout program execution.

---

## Remember

* Slicing extracts portions of a collection.
* The start index is included; the stop index is excluded.
* Lists support slicing, iteration, membership testing, and nesting.
* `enumerate()` provides both index and value during iteration.
* Tuples are ordered but immutable.
* Use tuples for fixed collections that should not change.

---
# Tuple Operations

In the previous section, we learned that tuples are immutable.

Let's explore what that means in practice.

---

## Accessing Tuple Elements

Tuples use indexing just like lists.

Example:

```python id="tuple-index"
coordinates = (10, 20, 30)

print(coordinates[0])

print(coordinates[2])
```

Output:

```text id="tuple-output"
10

30
```

Since tuples are ordered, every element has an index.

---

# Negative Indexing

Negative indexes work exactly like lists.

Example:

```python id="tuple-negative"
colors = (
    "Red",
    "Green",
    "Blue"
)

print(colors[-1])
```

Output:

```text id="tuple-negative-output"
Blue
```

---

# Tuple Slicing

Tuples support slicing.

Example:

```python id="tuple-slice"
numbers = (
    10,
    20,
    30,
    40,
    50
)

print(numbers[1:4])
```

Output:

```text id="tuple-slice-output"
(20, 30, 40)
```

Notice that slicing creates a **new tuple**.

The original tuple remains unchanged.

---

# Why Tuples Cannot Be Modified

Consider:

```python id="tuple-error"
coordinates = (10, 20)

coordinates[0] = 15
```

Python raises:

```text id="tuple-exception"
TypeError

'tuple' object does not support item assignment
```

This protects immutable data.

---

# Tuple Length

Just like lists,

`len()` works with tuples.

Example:

```python id="tuple-len"
values = (5, 10, 15)

print(len(values))
```

Output:

```text id="tuple-len-output"
3
```

---

# Iterating Over Tuples

Example:

```python id="tuple-loop"
colors = (
    "Red",
    "Green",
    "Blue"
)

for color in colors:

    print(color)
```

Output:

```text id="tuple-loop-output"
Red

Green

Blue
```

Iteration works the same way as lists.

---

# Tuple Packing

Python automatically groups multiple values into a tuple.

Example:

```python id="packing"
point = 10, 20
```

Internally,

Python creates:

```python id="packing-expanded"
point = (10, 20)
```

This process is called **packing**.

Conceptually:

```text id="packing-diagram"
10

20

↓

Packed Together

↓

Tuple
```

---

# Tuple Unpacking

Python can also unpack tuples.

Example:

```python id="unpacking"
point = (10, 20)

x, y = point
```

Now:

```text id="unpacking-result"
x = 10

y = 20
```

Conceptually:

```text id="unpacking-diagram"
Tuple

↓

Split Values

↓

Individual Variables
```

---

# Why Unpacking Matters

Suppose a function returns:

```python id="function-return"
return x, y
```

The caller can write:

```python id="receive-values"
x, y = get_coordinates()
```

This makes Python code concise and readable.

---

# Swapping Variables

Python uses tuple unpacking internally.

Instead of:

```python id="traditional-swap"
temp = a

a = b

b = temp
```

Python allows:

```python id="python-swap"
a, b = b, a
```

This is both elegant and efficient.

---

> **Engineering Note**
>
> Tuple unpacking is widely used in production Python code for returning multiple values, iterating over dictionaries, processing database records, and handling coordinate-like data.

---

# Sets

## Question

Suppose you're storing employee IDs.

```text id="ids"
1001

1002

1003
```

Should the same employee ID appear twice?

No.

Duplicates would indicate incorrect data.

Python provides **Sets** for collections that require uniqueness.

---

# What Is a Set?

A set is an unordered collection of **unique elements**.

Breaking that definition down:

* Unordered
* Mutable
* No duplicate values
* Fast membership testing

---

## Creating a Set

Sets use curly braces.

Example:

```python id="create-set"
fruits = {
    "Apple",
    "Banana",
    "Orange"
}
```

Conceptually:

```text id="set-diagram"
Apple

Banana

Orange
```

Unlike lists,

their order should not be relied upon.

---

# Empty Set

Be careful.

This creates a dictionary:

```python id="wrong-set"
empty = {}
```

To create an empty set:

```python id="correct-set"
empty = set()
```

This is a common beginner mistake.

---

# Duplicate Removal

Suppose we write:

```python id="duplicates"
numbers = {
    10,
    20,
    20,
    30,
    30
}
```

Python automatically removes duplicates.

Result:

```text id="duplicate-output"
{10, 20, 30}
```

Sets guarantee uniqueness.

---

# Why Sets Exist

Imagine a conference registration system.

Two attendees accidentally register twice.

The system should keep:

```text id="unique"
One Registration

Per Person
```

Sets naturally solve this problem.

---

# Membership Testing

Checking whether an element exists is one of the strengths of sets.

Example:

```python id="membership"
fruits = {
    "Apple",
    "Banana",
    "Orange"
}

print("Banana" in fruits)
```

Output:

```text id="membership-output"
True
```

Membership testing is typically very fast because sets are implemented using hash tables.

---

# Adding Elements

Example:

```python id="set-add"
fruits = {
    "Apple",
    "Banana"
}

fruits.add("Orange")
```

Result:

```text id="set-add-result"
Apple

Banana

Orange
```

---

# Removing Elements

Example:

```python id="set-remove"
fruits.remove("Banana")
```

After removal:

```text id="set-remove-result"
Apple

Orange
```

Python also provides:

```python id="discard"
fruits.discard("Banana")
```

Unlike `remove()`, `discard()` does **not** raise an error if the element doesn't exist.

---

# Set Characteristics

| Feature            | Set         |
| ------------------ | ----------- |
| Ordered            | No          |
| Mutable            | Yes         |
| Indexed            | No          |
| Duplicate Values   | Not Allowed |
| Membership Testing | Very Fast   |

---

## Lists vs Tuples vs Sets

| Feature    | List    | Tuple   | Set         |
| ---------- | ------- | ------- | ----------- |
| Ordered    | Yes     | Yes     | No          |
| Mutable    | Yes     | No      | Yes         |
| Indexed    | Yes     | Yes     | No          |
| Duplicates | Allowed | Allowed | Not Allowed |

Each collection solves a different problem.

---

## Remember

* Tuples are immutable collections.
* Tuple packing and unpacking simplify working with multiple values.
* Sets store only unique elements.
* Sets are unordered and cannot be indexed.
* `set()` creates an empty set.
* Membership testing in sets is typically faster than in lists.
* Use sets whenever uniqueness is more important than order.

---
## Set Operations

One of the biggest advantages of sets is that they support mathematical set operations directly.

Suppose we have two groups of students.

Class A:

```text
Alice

Bob

Charlie
```

Class B:

```text
Bob

Charlie

David
```

Questions we might ask:

* Which students are in both classes?
* Which students are in either class?
* Which students are only in Class A?

Sets provide elegant answers.

---

# Union

## What Is Union?

The **union** of two sets contains **every unique element** from both sets.

Conceptually:

```text
Class A

{A B C}

      +

Class B

{B C D}

↓

Union

{A B C D}
```

---

# Python Example

```python id="set-union"
class_a = {"Alice", "Bob", "Charlie"}

class_b = {"Bob", "Charlie", "David"}

print(class_a | class_b)
```

Output:

```text
{'Alice', 'Bob', 'Charlie', 'David'}
```

Alternatively:

```python id="set-union-method"
class_a.union(class_b)
```

---

# Intersection

## What Is Intersection?

The **intersection** contains only the elements present in **both** sets.

Conceptually:

```text
Class A

{A B C}

      ∩

Class B

{B C D}

↓

{B C}
```

---

# Python Example

```python id="set-intersection"
print(class_a & class_b)
```

Output:

```text
{'Bob', 'Charlie'}
```

Method version:

```python id="intersection-method"
class_a.intersection(class_b)
```

---

# Difference

## What Is Difference?

Difference returns elements that exist in one set but **not** the other.

Conceptually:

```text
Class A

{A B C}

↓

Remove

{B C}

↓

{A}
```

---

# Python Example

```python id="set-difference"
print(class_a - class_b)
```

Output:

```text
{'Alice'}
```

Method version:

```python id="difference-method"
class_a.difference(class_b)
```

---

# Symmetric Difference

Sometimes we want elements that belong to **either** set, but **not both**.

Conceptually:

```text
Class A

{A B C}

Class B

{B C D}

↓

{A D}
```

---

# Python Example

```python id="symmetric"
print(class_a ^ class_b)
```

Output:

```text
{'Alice', 'David'}
```

---

# Summary of Set Operations

| Operation            | Symbol | Meaning                    |                     |
| -------------------- | ------ | -------------------------- | ------------------- |
| Union                | `      | `                          | All unique elements |
| Intersection         | `&`    | Common elements            |                     |
| Difference           | `-`    | Elements only in first set |                     |
| Symmetric Difference | `^`    | Elements not shared        |                     |

---

> **Engineering Note**
>
> Set operations are widely used in recommendation systems, access control, duplicate detection, log analysis, search engines, and data cleaning pipelines.

---

## Dictionaries

## Question

Suppose we store students in a list.

```python
students = [
    "Alice",
    "Bob",
    "Charlie"
]
```

Now suppose we need to store:

* Student Name
* Age
* Email
* Department

Can a list clearly represent these relationships?

Not very well.

Instead, we need a way to associate a **key** with a **value**.

Python provides the **Dictionary**.

---

# What Is a Dictionary?

A dictionary stores information as **key-value pairs**.

Conceptually:

```text
Key

↓

Value
```

Example:

```text
Name

↓

Alice
```

---

# Real-World Analogy

Think about an English dictionary.

```text
Word

↓

Definition
```

Example:

```text
Computer

↓

An electronic machine...
```

The word is the **key**.

The definition is the **value**.

Python dictionaries work the same way.

---

# Creating a Dictionary

Dictionaries use curly braces.

Example:

```python id="create-dict"
student = {

    "name": "Alice",

    "age": 21,

    "department": "Computer Science"

}
```

Conceptually:

```text
name

↓

Alice

──────────

age

↓

21

──────────

department

↓

Computer Science
```

---

# Accessing Values

Instead of indexes,

dictionaries use keys.

Example:

```python id="dict-access"
print(student["name"])
```

Output:

```text
Alice
```

Another example:

```python
print(student["age"])
```

Output:

```text
21
```

---

# Why Keys Matter

Compare:

List:

```python
student[2]
```

Question:

What does index 2 represent?

Not obvious.

Dictionary:

```python
student["department"]
```

Immediately understandable.

Keys improve readability.

---

# Adding New Entries

Example:

```python id="dict-add"
student["email"] = "alice@example.com"
```

Result:

```text
name

↓

Alice

age

↓

21

department

↓

Computer Science

email

↓

alice@example.com
```

---

# Updating Values

Example:

```python id="dict-update"
student["age"] = 22
```

The existing value is replaced.

---

# Removing Entries

Using `del`:

```python id="dict-del"
del student["department"]
```

Or:

```python id="dict-pop"
student.pop("department")
```

Both remove the key-value pair.

---

# Dictionary Characteristics

| Feature               | Dictionary  |
| --------------------- | ----------- |
| Ordered (Python 3.7+) | Yes         |
| Mutable               | Yes         |
| Duplicate Keys        | Not Allowed |
| Duplicate Values      | Allowed     |
| Indexed               | By Keys     |

---

## Internal Working

Conceptually:

```text
Key

↓

Hash Function

↓

Memory Location

↓

Value
```

Dictionaries are implemented using **hash tables**.

This allows very fast key-based lookup.

---

# Why Dictionaries Matter

Imagine a user profile.

Without dictionaries:

```python
name

age

email

phone

department
```

With dictionaries:

```python
user = {

    "name": ...,

    "age": ...,

    "email": ...

}
```

Related information stays together.

This improves organization and readability.

---

## Remember

* Sets support mathematical operations such as union and intersection.
* Dictionaries store information as key-value pairs.
* Dictionary keys must be unique.
* Values are accessed using keys rather than indexes.
* Dictionaries provide fast key-based lookup because they use hash tables internally.
* Dictionaries are one of the most frequently used collections in Python.

---
# Dictionary Methods

Python dictionaries provide many built-in methods for working with key-value data.

Let's explore the most commonly used ones.

---

## Getting a Value

Earlier we accessed values using:

```python
student["name"]
```

This works,

but what happens if the key doesn't exist?

Example:

```python
print(student["phone"])
```

Output:

```text
KeyError
```

The program raises an exception.

---

# Using `get()`

Python provides a safer alternative.

Example:

```python
student = {
    "name": "Alice",
    "age": 21
}

print(student.get("name"))
```

Output:

```text
Alice
```

If the key doesn't exist:

```python
print(student.get("phone"))
```

Output:

```text
None
```

No exception is raised.

---

# Default Values

We can also specify a default.

Example:

```python
print(student.get("phone", "Not Available"))
```

Output:

```text
Not Available
```

This is commonly used when optional data may be missing.

---

# Getting All Keys

Example:

```python
student = {
    "name": "Alice",
    "age": 21,
    "department": "CS"
}

print(student.keys())
```

Output:

```text
dict_keys(['name', 'age', 'department'])
```

Conceptually:

```text
Dictionary

↓

Keys Only

↓

name

age

department
```

---

# Getting All Values

Example:

```python
print(student.values())
```

Output:

```text
dict_values(['Alice', 21, 'CS'])
```

Conceptually:

```text
Dictionary

↓

Values Only
```

---

# Getting Both Keys and Values

Example:

```python
print(student.items())
```

Output:

```text
dict_items([
    ('name', 'Alice'),
    ('age', 21),
    ('department', 'CS')
])
```

Each item is returned as a tuple.

---

# Iterating Over a Dictionary

Suppose we write:

```python
for key in student:

    print(key)
```

Output:

```text
name

age

department
```

By default,

iterating over a dictionary returns **keys**.

---

# Iterating Over Keys and Values

Example:

```python
for key, value in student.items():

    print(key, value)
```

Output:

```text
name Alice

age 21

department CS
```

Conceptually:

```text
Dictionary

↓

Items()

↓

(Key, Value)

↓

Loop
```

---

# Checking Membership

Suppose we want to know whether a key exists.

Example:

```python
print("age" in student)
```

Output:

```text
True
```

Another example:

```python
print("salary" in student)
```

Output:

```text
False
```

Notice:

Membership checks dictionary **keys**, not values.

---

# Nested Collections

Collections can contain other collections.

Example:

```python
student = {

    "name": "Alice",

    "marks": [90, 95, 88]

}
```

Conceptually:

```text
Dictionary

│

├── name

│     ↓

│   Alice

│

└── marks

      ↓

   [90,95,88]
```

Collections can be combined freely.

---

# Nested Dictionaries

Example:

```python
employee = {

    "name": "Alice",

    "address": {

        "city": "Delhi",

        "country": "India"

    }

}
```

Access:

```python
print(employee["address"]["city"])
```

Output:

```text
Delhi
```

---

# Complex Nested Structures

Modern applications frequently use deeply nested collections.

Example:

```python
users = [

    {

        "name": "Alice",

        "skills": [

            "Python",

            "SQL"

        ]

    },

    {

        "name": "Bob",

        "skills": [

            "Java",

            "AWS"

        ]

    }

]
```

Conceptually:

```text
List

↓

Dictionary

↓

List

↓

Strings
```

This pattern appears throughout web APIs and JSON data.

---

# Collections in JSON

JSON (JavaScript Object Notation) closely resembles Python collections.

Example:

```json
{
    "name": "Alice",
    "age": 21,
    "skills": [
        "Python",
        "SQL"
    ]
}
```

Python representation:

```python
student = {

    "name": "Alice",

    "age": 21,

    "skills": [

        "Python",

        "SQL"

    ]

}
```

This similarity is one reason Python is widely used for backend development.

---

> **Engineering Note**
>
> FastAPI, Django, Flask, REST APIs, and nearly every modern AI framework exchange structured data using nested dictionaries and lists because they map naturally to JSON.

---

# Choosing the Right Collection

Instead of memorizing syntax,

professional engineers ask:

> **"What properties does my data require?"**

---

## Scenario 1

Need:

* Ordered collection
* Frequently modified

Choose:

```text
List
```

---

## Scenario 2

Need:

* Ordered
* Never changes

Choose:

```text
Tuple
```

---

## Scenario 3

Need:

* Unique values
* Fast membership testing

Choose:

```text
Set
```

---

## Scenario 4

Need:

* Key-value mapping
* Fast lookup

Choose:

```text
Dictionary
```

---

# Decision Flow

```text
Need key-value mapping?

│

├── Yes

│     ↓

│ Dictionary

│

└── No

      │

      ├── Need uniqueness?

      │      ↓

      │     Set

      │

      └── Need ordering?

             │

             ├── Mutable?

             │      ↓

             │     List

             │

             └── Immutable?

                    ↓

                  Tuple
```

---

# High-Level Performance

| Collection | Lookup          | Insert      | Remove      | Ordered | Mutable |
| ---------- | --------------- | ----------- | ----------- | ------- | ------- |
| List       | Linear          | Fast at end | Linear      | Yes     | Yes     |
| Tuple      | Linear          | Not Allowed | Not Allowed | Yes     | No      |
| Set        | Very Fast       | Very Fast   | Very Fast   | No      | Yes     |
| Dictionary | Very Fast (Key) | Very Fast   | Very Fast   | Yes*    | Yes     |

> **Note:** This table provides intuition. Exact performance analysis using Big-O notation will be covered in the Algorithms module.

---

## Remember

* `get()` safely retrieves dictionary values.
* `keys()`, `values()`, and `items()` provide different dictionary views.
* Iterating over a dictionary returns keys by default.
* Python collections can be nested arbitrarily.
* JSON maps naturally to Python dictionaries and lists.
* Select collections based on requirements such as ordering, mutability, uniqueness, and lookup behavior.

---
## Production Perspective

Python collections are among the most heavily used data structures in professional software engineering.

Almost every Python application relies on them.

Whether you're building:

* REST APIs
* AI applications
* Data pipelines
* Cloud services
* Automation scripts
* Enterprise software

you will use Python collections extensively.

---

## Web Applications

Consider a typical e-commerce application.

```text
Customer

↓

Shopping Cart

↓

Order

↓

Payment

↓

Inventory
```

Different collections are used for different purposes.

| Component              | Collection |
| ---------------------- | ---------- |
| Shopping Cart          | List       |
| User Profile           | Dictionary |
| Product Tags           | Set        |
| Geographic Coordinates | Tuple      |

Each collection is chosen because of its specific characteristics.

---

# REST APIs

Suppose a REST API returns:

```json
{
    "id": 101,
    "name": "Alice",
    "skills": [
        "Python",
        "SQL"
    ]
}
```

Python receives this as:

```python
user = {

    "id": 101,

    "name": "Alice",

    "skills": [

        "Python",

        "SQL"

    ]
}
```

Notice:

* Dictionary for the object.
* List for the skills.

This pattern appears in almost every backend application.

---

# Database Applications

Suppose a SQL query returns:

```text
ID

Name

Department
```

Python might represent one record as:

```python
employee = {

    "id": 101,

    "name": "Alice",

    "department": "Engineering"

}
```

Multiple records:

```python
employees = [

    {...},

    {...},

    {...}

]
```

Conceptually:

```text
List

↓

Dictionary

↓

Database Row
```

---

# Configuration Files

Application configuration often uses dictionaries.

Example:

```python
config = {

    "host": "localhost",

    "port": 5432,

    "debug": True

}
```

Why?

Because configuration naturally consists of:

```text
Setting

↓

Value
```

A dictionary models this perfectly.

---

# Machine Learning

Machine learning workflows frequently use collections.

Example:

```text
Dataset

↓

List of Samples

↓

Each Sample

↓

Dictionary
```

Example:

```python
dataset = [

    {

        "text": "Hello",

        "label": 1

    },

    {

        "text": "Goodbye",

        "label": 0

    }

]
```

---

# Large Language Models

LLM applications use collections continuously.

Conversation History:

```python
messages = [

    {

        "role": "system",

        "content": "..."

    },

    {

        "role": "user",

        "content": "Hello"

    }

]
```

Conceptually:

```text
List

↓

Message

↓

Dictionary
```

Every message is represented as a dictionary.

The conversation is represented as a list.

---

# Retrieval-Augmented Generation (RAG)

A typical RAG pipeline stores:

```text
Documents

↓

Chunks

↓

Embeddings

↓

Metadata
```

Possible Python representation:

```python
documents = [

    {

        "text": "...",

        "metadata": {

            "author": "Alice",

            "year": 2025

        }

    }

]
```

Collections naturally represent hierarchical AI data.

---

# FastAPI Example

FastAPI request bodies are typically dictionaries.

Example:

```python
request = {

    "username": "alice",

    "password": "secret"
}
```

Response:

```python
response = {

    "status": "success",

    "token": "..."

}
```

Lists are commonly used for collections of resources.

---

# Data Engineering

Suppose you're processing CSV data.

Rows:

```text
Row 1

Row 2

Row 3
```

Python representation:

```python
rows = [

    {

        "id": 1,

        "name": "Alice"

    },

    {

        "id": 2,

        "name": "Bob"

    }

]
```

Collections make structured data easy to manipulate.

---

# Why Built-in Collections Matter

Python's built-in collections are:

* Highly optimized
* Well tested
* Memory efficient
* Readable
* Widely understood

Professional engineers rarely replace them unless specialized performance requirements exist.

---

> **Engineering Note**
>
> One of the most recognizable characteristics of Python code is its extensive use of nested lists and dictionaries to model structured data. Understanding these collections is essential for backend development, data engineering, and AI systems.

---

## Engineering Decisions

Choosing the correct collection is an engineering decision.

Not a personal preference.

---

## Decision 1 — Do You Need Ordering?

Suppose order matters.

Examples:

* Playlist
* Chat history
* Search results

Choose:

```text
List
```

or

```text
Tuple
```

---

## Decision 2 — Should Data Change?

Examples:

GPS Coordinates

```text
Latitude

Longitude
```

These values should not change.

Choose:

```text
Tuple
```

Example:

Shopping Cart

Changes frequently.

Choose:

```text
List
```

---

## Decision 3 — Are Duplicates Allowed?

Example:

Employee IDs

Duplicates?

No.

Choose:

```text
Set
```

Example:

Shopping Cart

Two identical products?

Possible.

Choose:

```text
List
```

---

## Decision 4 — Do You Need Fast Lookup?

Suppose you need:

```text
User ID

↓

User Object
```

Searching a list repeatedly is inefficient.

Choose:

```text
Dictionary
```

---

## Decision 5 — Optimize Readability

Poor:

```python
data[7]
```

Question:

What is element 7?

Better:

```python
user["email"]
```

The second version communicates intent.

Readable code is easier to maintain.

---

## Decision 6 — Don't Fight the Language

Python was designed around its built-in collections.

Instead of creating custom classes for every collection,

use:

* `list`
* `tuple`
* `set`
* `dict`

These are optimized and familiar to every Python developer.

---

## Decision 7 — Keep Data Consistent

Avoid:

```python
data = [

    10,

    "Alice",

    False,

    [1,2,3]
]
```

Unless absolutely necessary.

Prefer:

```python
students = [

    {

        "name": "Alice",

        "age": 21

    }

]
```

Consistent structures simplify maintenance and validation.

---

# Collection Selection Cheat Sheet

| Requirement             | Recommended Collection |
| ----------------------- | ---------------------- |
| Ordered and mutable     | List                   |
| Ordered and immutable   | Tuple                  |
| Unique values           | Set                    |
| Key-value mapping       | Dictionary             |
| Fast membership testing | Set                    |
| Fast key lookup         | Dictionary             |
| API payload             | Dictionary + List      |
| JSON data               | Dictionary + List      |
| Configuration           | Dictionary             |
| Coordinates             | Tuple                  |

---

## Remember

* Python collections appear throughout professional software.
* Lists are ideal for ordered, changing data.
* Tuples represent fixed collections.
* Sets enforce uniqueness.
* Dictionaries provide fast, readable key-value access.
* Good engineers choose collections based on requirements, not convenience.

---

## Common Mistakes

| Mistake                                              | Why It Is Incorrect                                             | Correct Understanding                           |
| ---------------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------- |
| Using a list for every problem                       | Lists are flexible but not always the most efficient choice.    | Choose the collection based on requirements.    |
| Confusing lists and tuples                           | They look similar but have different purposes.                  | Lists are mutable; tuples are immutable.        |
| Expecting sets to preserve order                     | Sets are optimized for uniqueness, not positional access.       | Use lists or tuples when order matters.         |
| Trying to index a set                                | Sets are unordered and do not support indexing.                 | Iterate over sets or use membership testing.    |
| Using duplicate dictionary keys                      | Later values overwrite earlier ones.                            | Dictionary keys must be unique.                 |
| Forgetting that dictionary lookups use keys          | Dictionaries are not accessed by position.                      | Use meaningful keys instead of numeric indexes. |
| Using mutable objects where immutability is required | Can introduce accidental modifications.                         | Use tuples for fixed data.                      |
| Creating an empty set with `{}`                      | `{}` creates an empty dictionary.                               | Use `set()` for an empty set.                   |
| Using lists for fast membership checks               | Membership testing becomes slower as the list grows.            | Use a set for frequent membership testing.      |
| Overcomplicating nested collections                  | Deeply nested structures become difficult to read and maintain. | Keep data structures simple and well organized. |

---

## Interview Questions

## 1. What is a collection in Python?

**Expected Answer**

A collection is an object that stores multiple values together. Python provides built-in collections such as lists, tuples, sets, and dictionaries.

---

## 2. What is the difference between a list and a tuple?

**Expected Answer**

Both are ordered collections, but lists are mutable while tuples are immutable.

---

## 3. Why would you use a tuple instead of a list?

**Expected Answer**

Tuples are appropriate for fixed data that should not change, such as coordinates, configuration constants, or function return values.

---

## 4. What are the advantages of sets?

**Expected Answer**

Sets automatically remove duplicates and provide fast membership testing, making them useful for unique collections and validation.

---

## 5. What is a dictionary?

**Expected Answer**

A dictionary stores data as key-value pairs and provides efficient key-based lookup.

---

## 6. How is a dictionary different from a list?

**Expected Answer**

Lists are accessed using numeric indexes, while dictionaries are accessed using unique keys.

---

## 7. What is tuple unpacking?

**Expected Answer**

Tuple unpacking assigns multiple values from a tuple to multiple variables in a single statement.

Example:

```python
x, y = (10, 20)
```

---

## 8. Why is `dict.get()` preferred in some situations?

**Expected Answer**

`get()` safely retrieves a value without raising a `KeyError` if the key is missing. It can also return a default value.

---

## 9. How are Python collections related to JSON?

**Expected Answer**

JSON objects map to Python dictionaries, and JSON arrays map to Python lists. This makes Python well suited for working with APIs and web applications.

---

## 10. Which collection would you choose for the following?

| Requirement     | Collection |
| --------------- | ---------- |
| Shopping Cart   | List       |
| GPS Coordinates | Tuple      |
| Unique Tags     | Set        |
| User Profile    | Dictionary |

---

# Quick Revision

## Python Collections

```text
Collections

│

├── List

├── Tuple

├── Set

└── Dictionary
```

---

## Feature Comparison

| Feature          | List | Tuple | Set | Dictionary |
| ---------------- | ---- | ----- | --- | ---------- |
| Ordered          | Yes  | Yes   | No  | Yes*       |
| Mutable          | Yes  | No    | Yes | Yes        |
| Duplicate Values | Yes  | Yes   | No  | Keys: No   |
| Indexed          | Yes  | Yes   | No  | By Keys    |

> **Note:** Dictionaries preserve insertion order in Python 3.7+, but their primary purpose is key-based lookup.

---

## Choosing the Right Collection

```text
Need ordered, mutable collection?

↓

List
```

```text
Need ordered, immutable collection?

↓

Tuple
```

```text
Need unique values?

↓

Set
```

```text
Need key-value mapping?

↓

Dictionary
```

---

## Common List Methods

| Method      | Purpose                           |
| ----------- | --------------------------------- |
| `append()`  | Add to the end                    |
| `insert()`  | Insert at a position              |
| `remove()`  | Remove by value                   |
| `pop()`     | Remove by index (or last element) |
| `sort()`    | Sort the list                     |
| `reverse()` | Reverse the list                  |
| `clear()`   | Remove all elements               |

---

## Common Set Methods

| Method           | Purpose                    |
| ---------------- | -------------------------- |
| `add()`          | Add an element             |
| `remove()`       | Remove an element          |
| `discard()`      | Remove safely              |
| `union()`        | Combine sets               |
| `intersection()` | Common elements            |
| `difference()`   | Elements only in first set |

---

## Common Dictionary Methods

| Method     | Purpose              |
| ---------- | -------------------- |
| `get()`    | Safe lookup          |
| `keys()`   | All keys             |
| `values()` | All values           |
| `items()`  | Key-value pairs      |
| `pop()`    | Remove a key         |
| `update()` | Merge/update entries |

---

## Collection Selection Flow

```text
Need key-value mapping?

│

├── Yes
│
│   ↓
│ Dictionary
│
└── No
    │
    ├── Need unique values?
    │
    │   ↓
    │  Set
    │
    └── Need ordering?
        │
        ├── Mutable?
        │
        │   ↓
        │  List
        │
        └── Immutable?
            │
            ↓
          Tuple
```

---

# Key Takeaways

* Python provides four primary built-in collections: **List, Tuple, Set, and Dictionary**.
* Lists are ordered, mutable, and allow duplicates.
* Tuples are ordered and immutable, making them suitable for fixed data.
* Sets store only unique values and support fast membership testing.
* Dictionaries organize data using key-value pairs and provide efficient lookups.
* Collections can be nested to model complex structured data.
* JSON data naturally maps to Python dictionaries and lists.
* Choosing the right collection improves readability, maintainability, and performance.
* Built-in collections are highly optimized and should be preferred over custom implementations for most use cases.

---
