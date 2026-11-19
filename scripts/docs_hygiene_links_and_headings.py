#!/usr/bin/env python3
"""
1) Fix relative links after folder/file renames.
2) Mechanically unify heading hierarchy: keep first # as H1, demote later # → ##.
   Skips code fences. Does not change ##/### pedagogy markers.
"""
from __future__ import annotations

import re
from pathlib import Path

DOCS = Path(__file__).resolve().parents[1] / "docs"

# Longest-first replacements inside link targets / path strings
PATH_FIXES: list[tuple[str, str]] = sorted(
    [
        (
            "ENG-04-Version Control & Collaborative Development",
            "ENG-04-Version-Control-and-Collaborative-Development",
        ),
        ("ENG-02-Programming Foundations", "ENG-02-Programming-Foundations"),
        ("ENG-06-Networking Fundamentals", "ENG-06-Networking-Fundamentals"),
        ("ENG-07-Database Fundamentals", "ENG-07-Database-Fundamentals"),
        ("ENG-08-Development Quality", "ENG-08-Development-Quality"),
        ("ENG-01- Computer Science Fundamentals", "ENG-01-Computer-Science-Fundamentals"),
        ("AIF-01-Mathematic Foundation", "AIF-01-Mathematics-Foundation"),
        ("AGT-01 — Agent Systems Foundations", "AGT-01-Agent-Systems-Foundations"),
        ("AGT-05 -Planning-&-Adaptive-Execution", "AGT-05-Planning-and-Adaptive-Execution"),
        (
            "AGT-06-Workflow-Orchestration-&-Durable-Execution",
            "AGT-06-Workflow-Orchestration-and-Durable-Execution",
        ),
        ("AGT-07 -Human-Control-&-Approval", "AGT-07-Human-Control-and-Approval"),
        ("AGT-08 -Agent-Interfaces-&-Protocols", "AGT-08-Agent-Interfaces-and-Protocols"),
        (
            "AGT-10 -Agent-Evaluation-&-Behavioral-Testing",
            "AGT-10-Agent-Evaluation-and-Behavioral-Testing",
        ),
        ("AGT-11-Agent-Reliability-&-Safety", "AGT-11-Agent-Reliability-and-Safety"),
        (
            "AGT-12-Agent-Architecture-&-Design-Review",
            "AGT-12-Agent-Architecture-and-Design-Review",
        ),
        ("PROD-02 -AI-Application-Packaging-and-Runtime", "PROD-02-AI-Application-Packaging-and-Runtime"),
        (
            "03 -Separation of Concerns and Abstraction.md",
            "03-Separation-of-Concerns-and-Abstraction.md",
        ),
        (
            "16-Virtual-Environments-&-Package-Management.md",
            "16-Virtual-Environments-and-Package-Management.md",
        ),
        ("06-Vectors-Matrics-and-Operations.md", "06-Vectors-Matrices-and-Operations.md"),
        ("07-Semantic-Versioning-&-Releases", "07-Semantic-Versioning-and-Releases.md"),
        # bare name without extension in old broken state
        ("./08-Issue-Tracking)", "./08-Issue-Tracking.md)"),
        ("./07-Semantic-Versioning-and-Releases)", "./07-Semantic-Versioning-and-Releases.md)"),
    ],
    key=lambda p: len(p[0]),
    reverse=True,
)


def split_fences(text: str) -> list[tuple[str, bool]]:
    """Return list of (chunk, is_code)."""
    parts: list[tuple[str, bool]] = []
    i = 0
    while i < len(text):
        start = text.find("```", i)
        if start < 0:
            parts.append((text[i:], False))
            break
        if start > i:
            parts.append((text[i:start], False))
        end = text.find("```", start + 3)
        if end < 0:
            parts.append((text[start:], True))
            break
        end += 3
        parts.append((text[start:end], True))
        i = end
    return parts


def fix_paths_in_text(text: str) -> str:
    out = text
    for old, new in PATH_FIXES:
        if old in out:
            out = out.replace(old, new)
    return out


def demote_extra_h1(text: str) -> tuple[str, int]:
    """First ATX H1 stays; later ATX H1s become H2. Count demotions."""
    seen = False
    count = 0
    lines = text.splitlines(keepends=True)
    out: list[str] = []
    for line in lines:
        m = re.match(r"^(#)\s+(.+)$", line)
        # Only single-# headings (not ##)
        if m and not line.startswith("##"):
            if not seen:
                seen = True
                out.append(line)
            else:
                count += 1
                rest = line[1:]  # drop one #
                if not rest.startswith("#"):
                    rest = "#" + rest  # ensure ##
                # line was "# Title\n" → "## Title\n"
                out.append("#" + line)
        else:
            out.append(line)
    return "".join(out), count


def process_file(path: Path) -> tuple[bool, int]:
    original = path.read_text(encoding="utf-8")
    chunks = split_fences(original)
    rebuilt: list[str] = []
    demotions = 0
    for chunk, is_code in chunks:
        if is_code:
            rebuilt.append(chunk)
            continue
        fixed = fix_paths_in_text(chunk)
        demoted, n = demote_extra_h1(fixed)
        demotions += n
        rebuilt.append(demoted)
    new_text = "".join(rebuilt)
    if new_text != original:
        path.write_text(new_text, encoding="utf-8", newline="\n")
        return True, demotions
    return False, 0


def main() -> None:
    changed = 0
    total_demote = 0
    for path in sorted(DOCS.rglob("*.md")):
        # skip nothing under docs except we already moved superpowers out
        did, n = process_file(path)
        if did:
            changed += 1
            total_demote += n
            print(f"UPDATE {path.relative_to(DOCS)} (h1 demotions={n})")
    print(f"DONE files_changed={changed} h1_demotions={total_demote}")


if __name__ == "__main__":
    main()
