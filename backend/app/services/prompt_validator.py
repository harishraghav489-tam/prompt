from __future__ import annotations

import re
from typing import Any


class PromptValidator:
    @staticmethod
    def validate(prompt: str) -> dict[str, Any]:
        if not prompt or not prompt.strip():
            raise ValueError("Prompt cannot be empty")

        normalized = prompt.strip()
        word_count = len(re.findall(r"\b\w+\b", normalized))
        if word_count < 8:
            raise ValueError("Prompt must contain at least 8 words")

        issues: list[str] = []
        lower_prompt = normalized.lower()

        if not re.search(r"\b(you are|act as|assistant|role:|persona)\b", lower_prompt):
            issues.append("Add an explicit role or persona")

        if not re.search(r"\b(task|goal|objective|purpose|need to|aim to)\b", lower_prompt):
            issues.append("State the main task or goal clearly")

        if not re.search(r"\b(must|should|avoid|only|format|constraints|limit|at least|at most)\b", lower_prompt):
            issues.append("Include constraints or quality rules")

        if len(normalized.splitlines()) > 2 and not re.search(r"(bullet|numbered|step|1\.)", lower_prompt):
            issues.append("Consider using numbered or bullet-style instructions")

        metrics = {
            "word_count": word_count,
            "character_count": len(normalized),
            "has_role": bool(re.search(r"\b(you are|act as|assistant|role:|persona)\b", lower_prompt)),
            "has_goal": bool(re.search(r"\b(task|goal|objective|purpose|need to|aim to)\b", lower_prompt)),
            "has_constraints": bool(re.search(r"\b(must|should|avoid|only|format|constraints|limit|at least|at most)\b", lower_prompt)),
        }

        return {
            "valid": not issues,
            "issues": issues,
            "metrics": metrics,
        }
