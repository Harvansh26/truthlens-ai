from rules import suspicious_patterns

def analyze_text(text: str):
    text_lower = text.lower()
    score = 0
    reasons = []

    for pattern, weight, reason in suspicious_patterns:
        if pattern in text_lower:
            score += weight
            reasons.append(reason)

    score = min(score, 100)
    ai_probability = min(100, int(score * 0.8 + 15))

    if score >= 80:
        verdict = "Critical Risk"
    elif score >= 60:
        verdict = "High Risk"
    elif score >= 30:
        verdict = "Medium Risk"
    else:
        verdict = "Low Risk"

    if not reasons:
        reasons = ["No major suspicious signals detected"]

    return {
        "riskScore": score,
        "verdict": verdict,
        "aiProbability": ai_probability,
        "reasons": reasons
    }