from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import re

app = Flask(__name__)
CORS(app)

saved = joblib.load("model/model.pkl")

pipeline = saved["pipeline"]
label_map = saved["label_map"]

SCAM_KEYWORDS = [
    "pay", "fee", "upi", "deposit", "security", "processing fee",
    "registration fee", "no interview", "offer letter", "refundable"
]

MEDIUM_KEYWORDS = [
    "urgent", "limited", "shortlisted", "verification", "onboarding",
    "confirm your slot", "respond quickly"
]

SAFE_PHRASES = [
    "no payment", "no fees", "do not charge", "interview scheduled",
    "microsoft teams", "confirm your availability"
]

def keyword_score(text):
    lower = text.lower()

    scam_hits = [kw for kw in SCAM_KEYWORDS if kw in lower]
    medium_hits = [kw for kw in MEDIUM_KEYWORDS if kw in lower]
    safe_hits = [kw for kw in SAFE_PHRASES if kw in lower]

    score = 0
    reasons = []

    if scam_hits:
        score += len(scam_hits) * 18
        reasons.append("Payment or suspicious hiring terms detected: " + ", ".join(scam_hits))

    if medium_hits:
        score += len(medium_hits) * 8
        reasons.append("Pressure or unclear onboarding language detected: " + ", ".join(medium_hits))

    if safe_hits:
        score -= len(safe_hits) * 15
        reasons.append("Legitimate recruitment language detected: " + ", ".join(safe_hits))

    return score, reasons

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "TruthLens ML API is running"})

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()
    text = data.get("text", "")

    if not text.strip():
        return jsonify({"message": "Text is required"}), 400

    prediction = pipeline.predict([text])[0]
    probabilities = pipeline.predict_proba([text])[0]

    ml_confidence = round(float(max(probabilities)) * 100, 2)
    verdict = label_map[prediction]

    rule_points, reasons = keyword_score(text)

    base_score = {
        "Safe": 20,
        "Medium Risk": 50,
        "Scam": 75
    }[verdict]

    risk_score = base_score + rule_points
    risk_score = max(5, min(98, risk_score))

    if risk_score >= 70:
        final_verdict = "Scam"
        ai_probability = "High"
    elif risk_score >= 40:
        final_verdict = "Medium Risk"
        ai_probability = "Medium"
    else:
        final_verdict = "Safe"
        ai_probability = "Low"

    if not reasons:
        reasons.append("Prediction based on TF-IDF text patterns and logistic regression model")

    return jsonify({
        "riskScore": int(risk_score),
        "verdict": final_verdict,
        "aiProbability": ai_probability,
        "confidence": ml_confidence,
        "reasons": reasons
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)