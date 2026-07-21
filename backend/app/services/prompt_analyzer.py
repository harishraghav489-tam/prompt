import re
from collections import Counter
from typing import Any


class PromptAnalyzer:
    @staticmethod
    def analyze(prompt: str) -> dict[str, Any]:
        if not prompt or not prompt.strip():
            return PromptAnalyzer.empty_result()

        normalized = prompt.strip()
        sentences = re.split(r"(?<=[.!?])\s+", normalized)
        word_count = len(re.findall(r"\b\w+\b", normalized))
        sentence_count = max(1, len([s for s in sentences if s.strip()]))
        token_estimate = max(1, int(word_count * 1.3))
        unique_words = len(set(re.findall(r"\b\w+\b", normalized.lower())))
        avg_sentence_length = round(word_count / sentence_count, 2)
        prompt_length = len(normalized)
        repeated_keywords = [word for word, count in Counter(re.findall(r"\b\w+\b", normalized.lower())).items() if count > 1]

        role_detection = bool(re.search(r"\b(you are|act as|role:|assistant|engineer|developer|analyst)\b", normalized, re.I))
        goal_detection = bool(re.search(r"\b(goal|task|objective|purpose|need to|aim to)\b", normalized, re.I))
        constraint_detection = bool(re.search(r"\b(constraint|constraints|must|should|avoid|limit|only|under|at least|at most)\b", normalized, re.I))
        output_format_detection = bool(re.search(r"\b(output format|format:|json|xml|markdown|yaml|csv|table|bullet points)\b", normalized, re.I))
        example_detection = bool(re.search(r"\b(example|e\.g\.|for example|sample)\b", normalized, re.I))
        variable_detection = bool(re.search(r"\{[A-Za-z0-9_]+\}|<[^>]+>", normalized))
        delimiter_detection = bool(re.search(r"[-=]{3,}|\|\|\||\n\s*[-*]\s", normalized))
        step_by_step_instructions = bool(re.search(r"\b(step|steps)\s*\d*[:\-]", normalized, re.I))
        chain_structure = bool(re.search(r"\b(first|then|next|finally|after)\b", normalized, re.I))
        loop_structure = bool(re.search(r"\b(for each|repeat|loop|iterate)\b", normalized, re.I))
        self_reflection_keywords = bool(re.search(r"\b(self|reflect|review|check|verify)\b", normalized, re.I))
        verification_keywords = bool(re.search(r"\b(verify|validate|confirm|check)\b", normalized, re.I))
        reasoning_keywords = bool(re.search(r"\b(reason|because|therefore|analysis|logic)\b", normalized, re.I))
        error_handling_keywords = bool(re.search(r"\b(error|fallback|exception|if not|otherwise)\b", normalized, re.I))
        safety_constraints = bool(re.search(r"\b(safe|safety|ethical|privacy|sensitive|policy)\b", normalized, re.I))
        formatting_constraints = bool(re.search(r"\b(format|formatted|style|tone|structure)\b", normalized, re.I))
        edge_case_mentions = bool(re.search(r"\b(edge case|corner case|unexpected|null|empty)\b", normalized, re.I))
        fallback_instructions = bool(re.search(r"\b(fallback|default|if unavailable|if missing)\b", normalized, re.I))
        markdown_usage = bool(re.search(r"^#+\s|\*\*|__|```", normalized, re.M))
        json_usage = bool(re.search(r"\{[^\n]*\"|\bjson\b", normalized, re.I))
        xml_usage = bool(re.search(r"<[^>]+>", normalized))
        code_block_detection = bool(re.search(r"```", normalized))
        compression_ratio = round(unique_words / max(1, word_count), 3)
        repeated_sentences = len([s for s in sentences if sentences.count(s) > 1])

        return {
            "word_count": word_count,
            "token_estimate": token_estimate,
            "sentence_count": sentence_count,
            "average_sentence_length": avg_sentence_length,
            "prompt_length": prompt_length,
            "compression_ratio": compression_ratio,
            "repeated_sentences": repeated_sentences,
            "repeated_keywords": repeated_keywords,
            "unique_words": unique_words,
            "readability": round(max(0, 100 - (avg_sentence_length * 2)), 2),
            "markdown_usage": markdown_usage,
            "json_usage": json_usage,
            "xml_usage": xml_usage,
            "code_block_detection": code_block_detection,
            "role_detection": role_detection,
            "goal_detection": goal_detection,
            "constraint_detection": constraint_detection,
            "output_format_detection": output_format_detection,
            "variable_detection": variable_detection,
            "example_detection": example_detection,
            "delimiter_detection": delimiter_detection,
            "step_by_step_instructions": step_by_step_instructions,
            "chain_structure": chain_structure,
            "loop_structure": loop_structure,
            "self_reflection_keywords": self_reflection_keywords,
            "verification_keywords": verification_keywords,
            "reasoning_keywords": reasoning_keywords,
            "error_handling_keywords": error_handling_keywords,
            "safety_constraints": safety_constraints,
            "formatting_constraints": formatting_constraints,
            "edge_case_mentions": edge_case_mentions,
            "fallback_instructions": fallback_instructions,
        }

    @staticmethod
    def empty_result() -> dict[str, Any]:
        return {
            "word_count": 0,
            "token_estimate": 0,
            "sentence_count": 0,
            "average_sentence_length": 0,
            "prompt_length": 0,
            "compression_ratio": 0,
            "repeated_sentences": 0,
            "repeated_keywords": [],
            "unique_words": 0,
            "readability": 0,
            "markdown_usage": False,
            "json_usage": False,
            "xml_usage": False,
            "code_block_detection": False,
            "role_detection": False,
            "goal_detection": False,
            "constraint_detection": False,
            "output_format_detection": False,
            "variable_detection": False,
            "example_detection": False,
            "delimiter_detection": False,
            "step_by_step_instructions": False,
            "chain_structure": False,
            "loop_structure": False,
            "self_reflection_keywords": False,
            "verification_keywords": False,
            "reasoning_keywords": False,
            "error_handling_keywords": False,
            "safety_constraints": False,
            "formatting_constraints": False,
            "edge_case_mentions": False,
            "fallback_instructions": False,
        }
