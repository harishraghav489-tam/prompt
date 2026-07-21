import pytest

from app.services.prompt_validator import PromptValidator


def test_prompt_validator_accepts_structured_prompt() -> None:
    prompt = (
        "You are a helpful coding assistant. Your task is to summarize this API doc "
        "for a beginner developer. Must use simple language, include bullet points, "
        "and avoid jargon."
    )

    result = PromptValidator.validate(prompt)

    assert result["valid"] is True
    assert result["issues"] == []


def test_prompt_validator_rejects_short_prompt() -> None:
    with pytest.raises(ValueError) as exc_info:
        PromptValidator.validate("Write something")

    assert "at least 8 words" in str(exc_info.value)
