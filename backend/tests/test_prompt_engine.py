from app.services.prompt_analyzer import PromptAnalyzer
from app.services.scoring_engine import ScoringEngine


def test_prompt_analyzer_extracts_metrics():
    prompt = """You are an expert analyst.\n\nTask: Summarize the report.\n\nConstraints:\n- Keep it under 100 words\n- Use bullet points\n\nOutput format:\nJSON\n\nExample:\n{\"summary\": \"...\"}\n\nStep 1: Identify the issue.\nStep 2: Propose a fix.\n"""
    metrics = PromptAnalyzer.analyze(prompt)

    assert metrics["word_count"] > 0
    assert metrics["sentence_count"] > 0
    assert metrics["token_estimate"] > 0
    assert metrics["role_detection"] is True
    assert metrics["goal_detection"] is True
    assert metrics["constraint_detection"] is True
    assert metrics["output_format_detection"] is True
    assert metrics["step_by_step_instructions"] is True
    assert metrics["json_usage"] is True


def test_scoring_engine_returns_100_max():
    prompt = """You are a senior backend engineer.\n\nGoal: Build a secure API.\n\nConstraints:\n- Use JWT\n- Validate all inputs\n- Return JSON\n\nExample:\n{\"status\": \"ok\"}\n\nStep 1: Create the schema.\nStep 2: Implement the routes.\n"""
    result = ScoringEngine.score(prompt)

    assert result["overall_score"] <= 100
    assert result["overall_score"] >= 0
    assert result["categories"]["clarity"] >= 0
    assert result["categories"]["structure"] >= 0
