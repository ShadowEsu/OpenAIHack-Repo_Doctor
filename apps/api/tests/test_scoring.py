from __future__ import annotations

from dataclasses import dataclass

from app.services.scoring import compute_health, grade_for


@dataclass
class FakeFinding:
    category: str
    severity: str
    confidence: float


def test_empty_findings_scores_100():
    health = compute_health([])
    assert health.score == 100.0
    assert health.grade == "Excellent"


def test_critical_security_finding_reduces_security_dimension():
    health = compute_health([FakeFinding("security", "critical", 1.0)])
    assert health.dimensions["security"] == 75.0
    assert health.dimensions["testing"] == 100.0
    assert health.score < 100.0


def test_deductions_are_capped_per_dimension():
    findings = [FakeFinding("security", "critical", 1.0)] * 50
    health = compute_health(findings)
    assert health.dimensions["security"] == 30.0  # capped, not zero
    assert health.score > 0


def test_grades():
    assert grade_for(95) == "Excellent"
    assert grade_for(85) == "Healthy"
    assert grade_for(75) == "Stable with concerns"
    assert grade_for(60) == "Needs attention"
    assert grade_for(45) == "Unhealthy"
    assert grade_for(20) == "Critical"
