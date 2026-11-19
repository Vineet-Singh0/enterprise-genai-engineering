#!/usr/bin/env python3
"""Rename messy curriculum folders/files. Does not rewrite teaching prose."""
from __future__ import annotations

import os
from pathlib import Path

DOCS = Path(__file__).resolve().parents[1] / "docs"

# (parent relative to docs, old name, new name)
FOLDER_RENAMES: list[tuple[str, str, str]] = [
    # ENG
    ("ENG", "ENG-02-Programming Foundations", "ENG-02-Programming-Foundations"),
    (
        "ENG",
        "ENG-04-Version Control & Collaborative Development",
        "ENG-04-Version-Control-and-Collaborative-Development",
    ),
    ("ENG", "ENG-06-Networking Fundamentals", "ENG-06-Networking-Fundamentals"),
    ("ENG", "ENG-07-Database Fundamentals", "ENG-07-Database-Fundamentals"),
    ("ENG", "ENG-08-Development Quality", "ENG-08-Development-Quality"),
    # AGT
    ("AGT", "AGT-01 — Agent Systems Foundations", "AGT-01-Agent-Systems-Foundations"),
    ("AGT", "AGT-05 -Planning-&-Adaptive-Execution", "AGT-05-Planning-and-Adaptive-Execution"),
    (
        "AGT",
        "AGT-06-Workflow-Orchestration-&-Durable-Execution",
        "AGT-06-Workflow-Orchestration-and-Durable-Execution",
    ),
    ("AGT", "AGT-07 -Human-Control-&-Approval", "AGT-07-Human-Control-and-Approval"),
    ("AGT", "AGT-08 -Agent-Interfaces-&-Protocols", "AGT-08-Agent-Interfaces-and-Protocols"),
    (
        "AGT",
        "AGT-10 -Agent-Evaluation-&-Behavioral-Testing",
        "AGT-10-Agent-Evaluation-and-Behavioral-Testing",
    ),
    ("AGT", "AGT-11-Agent-Reliability-&-Safety", "AGT-11-Agent-Reliability-and-Safety"),
    (
        "AGT",
        "AGT-12-Agent-Architecture-&-Design-Review",
        "AGT-12-Agent-Architecture-and-Design-Review",
    ),
]

# File renames relative to docs after folder renames applied (use NEW folder paths)
FILE_RENAMES: list[tuple[str, str]] = [
    (
        "01-ENG/ENG-03-Software-Engineering-Principles/03 -Separation of Concerns and Abstraction.md",
        "01-ENG/ENG-03-Software-Engineering-Principles/03-Separation-of-Concerns-and-Abstraction.md",
    ),
    (
        "01-ENG/ENG-02-Programming-Foundations/16-Virtual-Environments-&-Package-Management.md",
        "01-ENG/ENG-02-Programming-Foundations/16-Virtual-Environments-and-Package-Management.md",
    ),
]


def rename_path(src: Path, dst: Path) -> None:
    if not src.exists():
        print(f"SKIP missing: {src.relative_to(DOCS)}")
        return
    if dst.exists():
        print(f"SKIP exists: {dst.relative_to(DOCS)}")
        return
    dst.parent.mkdir(parents=True, exist_ok=True)
    os.rename(src, dst)
    print(f"OK {src.relative_to(DOCS)} -> {dst.relative_to(DOCS)}")


def main() -> None:
    for parent, old, new in FOLDER_RENAMES:
        rename_path(DOCS / parent / old, DOCS / parent / new)
    for old_rel, new_rel in FILE_RENAMES:
        rename_path(DOCS / old_rel, DOCS / new_rel)


if __name__ == "__main__":
    main()
