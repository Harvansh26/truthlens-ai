import json
import os
import joblib
import pandas as pd

from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

DATA_PATH = "data/dataset.json"
MODEL_DIR = "model"
MODEL_PATH = "model/model.pkl"

os.makedirs(MODEL_DIR, exist_ok=True)

with open(DATA_PATH, "r", encoding="utf-8") as file:
    data = json.load(file)

df = pd.DataFrame(data)

label_map = {
    "safe": 0,
    "medium": 1,
    "scam": 2
}

reverse_label_map = {
    0: "Safe",
    1: "Medium Risk",
    2: "Scam"
}

df["label_num"] = df["label"].map(label_map)

X_train, X_test, y_train, y_test = train_test_split(
    df["text"],
    df["label_num"],
    test_size=0.25,
    random_state=42,
    stratify=df["label_num"]
)

pipeline = Pipeline([
    ("tfidf", TfidfVectorizer(
        lowercase=True,
        stop_words="english",
        ngram_range=(1, 3),
        min_df=1,
        max_df=0.95
    )),
    ("model", LogisticRegression(
        max_iter=2000,
        class_weight="balanced",
        C=2.0
    ))
])

pipeline.fit(X_train, y_train)

y_pred = pipeline.predict(X_test)

print("Accuracy:", round(accuracy_score(y_test, y_pred) * 100, 2), "%")
print(classification_report(y_test, y_pred, target_names=["Safe", "Medium Risk", "Scam"]))

joblib.dump({
    "pipeline": pipeline,
    "label_map": reverse_label_map
}, MODEL_PATH)

print("Improved model trained successfully!")
print(f"Saved at: {MODEL_PATH}")