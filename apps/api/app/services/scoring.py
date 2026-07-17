"""Deterministic repository health scoring.

The AI never invents the score. Each finding deducts points from its
dimension; per-dimension deductions are capped so a single noisy scanner
cannot destroy the overall score.
"""
from __future__ import annotations

from dataclasses import dataclass

DIMENSION_WEIGHTS = {
    "security": 0.25,
    "reliability": 0.20,
    "maintainability": 0.20,
    "testing": 0.15,
    "documentation": 0.10,
    "dependencies": 0.10,
}

# category names used by scanners -> scoring dimension
CATEGORY_TO_DIMENSION = {
    "security": "security",
    "reliability": "reliability",
    "maintainability": "maintainability",
    "testing": "testing",
    "documentation": "documentation",
    "dependencies": "dependencies",
    "configuration": "documentation",
}

SEVERITY_DEDUCTION = {
    "critical": 25.0,
    "high": 15.0,
    "medium": 7.0,
    "low": 3.0,
    "info": 0.0,
}

MAX_DIMENSION_DEDUCTION = 70.0  # a dimension never drops below 30 from findings alone


@dataclass
class HealthScore:
    score: float
    grade: str
    dimensions: dict[str, float]


def grade_for(score: float) -> str:
    if score >= 90:
        return "Excellent"
    if score >= 80:
        return "Healthy"
    if score >= 70:
        return "Stable with concerns"
    if score >= 55:
        return "Needs attention"
    if score >= 40:
        return "Unhealthy"
    return "Critical"


def compute_health(findings: list) -> HealthScore:
    """Compute health from findings (any objects with .category, .severity, .confidence)."""
    deductions: dict[str, float] = {dim: 0.0 for dim in DIMENSION_WEIGHTS}
    for f in findings:
        dimension = CATEGORY_TO_DIMENSION.get(f.category, "maintainability")
        base = SEVERITY_DEDUCTION.get(f.severity, 0.0)
        deductions[dimension] += base * max(0.3, min(1.0, f.confidence))

    dimensions = {
        dim: round(max(0.0, 100.0 - min(deductions[dim], MAX_DIMENSION_DEDUCTION)), 1)
        for dim in DIMENSION_WEIGHTS
    }
    score = round(sum(dimensions[d] * w for d, w in DIMENSION_WEIGHTS.items()), 1)
    return HealthScore(score=score, grade=grade_for(score), dimensions=dimensions)


def estimate_technical_debt(findings: list) -> str:
    """Rough, honest estimate of repair effort expressed in hours."""
    effort_hours = 0.0
    per_severity = {"critical": 2.0, "high": 1.5, "medium": 0.75, "low": 0.25, "info": 0.0}
    for f in findings:
        effort_hours += per_severity.get(f.severity, 0.0)
    if effort_hours < 1:
        return "Under 1 hour"
    if effort_hours < 8:
        return f"About {round(effort_hours)} hours"
    days = effort_hours / 8
    return f"About {days:.1f} developer-days"
