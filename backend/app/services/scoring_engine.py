from __future__ import annotations

from typing import Any

from app.services.prompt_analyzer import PromptAnalyzer


class ScoringEngine:
    @staticmethod
    def score(prompt: str) -> dict[str, Any]:
        metrics = PromptAnalyzer.analyze(prompt)
        categories: dict[str, float] = {}

        categories["clarity"] = min(100.0, 40.0 + (metrics["word_count"] % 10) * 2.0)
        categories["structure"] = min(100.0, 30.0 + (metrics["step_by_step_instructions"] * 20) + (metrics["chain_structure"] * 10) + (metrics["delimiter_detection"] * 10))
        categories["efficiency"] = min(100.0, 25.0 + (metrics["compression_ratio"] * 40) + (metrics["constraint_detection"] * 10))
        categories["compression"] = min(100.0, 20.0 + (metrics["unique_words"] % 20) * 2.0)
        categories["formatting"] = min(100.0, 20.0 + (metrics["markdown_usage"] * 20) + (metrics["json_usage"] * 20) + (metrics["xml_usage"] * 10) + (metrics["code_block_detection"] * 10))
        categories["variables"] = min(100.0, 20.0 + (metrics["variable_detection"] * 40) + (metrics["example_detection"] * 20))
        categories["constraints"] = min(100.0, 25.0 + (metrics["constraint_detection"] * 25) + (metrics["safety_constraints"] * 15) + (metrics["formatting_constraints"] * 15))
        categories["output_definition"] = min(100.0, 20.0 + (metrics["output_format_detection"] * 30) + (metrics["example_detection"] * 20))
        categories["reusability"] = min(100.0, 15.0 + (metrics["variable_detection"] * 20) + (metrics["modularity"] if "modularity" in metrics else 0))
        categories["modularity"] = min(100.0, 20.0 + (metrics["step_by_step_instructions"] * 25) + (metrics["delimiter_detection"] * 15))
        categories["readability"] = min(100.0, 35.0 + (metrics["readability"] * 0.5))
        categories["maintainability"] = min(100.0, 20.0 + (metrics["verification_keywords"] * 20) + (metrics["error_handling_keywords"] * 20) + (metrics["fallback_instructions"] * 20))
        categories["human_understandability"] = min(100.0, 30.0 + (metrics["goal_detection"] * 15) + (metrics["role_detection"] * 15) + (metrics["chain_structure"] * 15))
        categories["statelessness"] = min(100.0, 70.0 + (metrics["goal_detection"] * 10) + (metrics["constraint_detection"] * 10))
        categories["no_unnecessary_repetition"] = min(100.0, 60.0 + (metrics["repeated_sentences"] < 1) * 20 + (metrics["repeated_keywords"] == []) * 20)

        overall_score = round(sum(categories.values()) / len(categories), 2)
        return {
            "overall_score": overall_score,
            "categories": categories,
            "metrics": metrics,
        }
