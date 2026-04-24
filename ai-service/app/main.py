from fastapi import FastAPI
from pydantic import BaseModel
from analyzer import analyze_text

app = FastAPI()

class AnalyzeRequest(BaseModel):
    text: str

@app.get("/")
def home():
    return {"message": "TruthLens AI service running"}

@app.post("/analyze")
def analyze(req: AnalyzeRequest):
    return analyze_text(req.text)